// Screen-space ambient occlusion (three's GTAOPass, vendored from three@0.180), round 4: GPU tier only, eye-level views only
// (walking, the tour's rooms). app.js imports this module only when renderTier==='gpu', so phones and software rendering never
// load, build or draw any of it.
//
// No EffectComposer: the frame is still drawn straight to the canvas by renderer.render(scene,camera), exactly as before (MSAA
// default framebuffer, Neutral tone mapping and sRGB in the material shaders, fog mixed after tone mapping, toneMapped:false sky,
// glow and lamps untouched). An HDR composer + OutputPass would tone-map those unlit parts and the fog too, and at the still
// frame's ratio 2 its multisampled half-float targets would take several hundred MB. Here a normal + depth pass at the drawing
// buffer's size feeds GTAO and its denoise at GTAO_SCALE of it, and the AO is multiplied onto the finished frame (dst × factor),
// upsampled with the full-size depth so it does not bleed across silhouettes.
//
// The multiply happens inside renderer.render for screen renders of the main scene and camera, so every caller, the app's
// animate() and any measuring tool that calls renderer.render(scene,camera), gets the frame people see. Everything else (render
// targets, other scenes, the passes' own draws) goes straight through.
import * as THREE from 'three';
import {GTAOPass} from './vendor/postprocessing/GTAOPass.js?v=f5647b8ae4';
import {FullScreenQuad} from './vendor/postprocessing/Pass.js?v=444b409c23';

// AO and denoise buffers at this fraction of the drawing buffer each way (the normal + depth pass is full size); the still
// frame's larger buffer gives larger AO buffers too. 0.5 = a quarter of the pixels. M5 Pro, living room, added per frame:
// full size about +6.5 ms at 2550×1273 and +14 ms at 3828×1905 (frames are 2–3 ms without AO); half size about +2.6 / +5.9 ms.
// Plain bilinear upsampling of the half-size AO leaves a speckled rim on every silhouette; the multiply's depth-aware
// upsampling does not.
export const GTAO_SCALE=.5;
// World-space AO parameters (metres): reach of 0.45 m finds furniture feet, skirting, wall/ceiling corners and the gaps
// between cabinets; samples = three's default 16.
export const GTAO_PARAMS={radius:.45,distanceExponent:1.5,thickness:1,scale:1,samples:16,distanceFallOff:1,screenSpaceRadius:false};
// Poisson denoise in AO-buffer pixels.
export const GTAO_DENOISE={lumaPhi:10,depthPhi:.05,normalPhi:8,radius:5,radiusExponent:1,rings:2,samples:16};
// Soft knee on the occlusion o = 1 − ao: o² / (o + GTAO_KNEE). Faint occlusion (open surfaces near a floor or wall, the rounded
// edges next to them) mostly drops out, so the frame needs little exposure lift; creases, contact and corners keep theirs
// (o = 0.05 → 0.019, 0.1 → 0.056, 0.3 → 0.237). Smooth, so noise around the knee does not turn into blotches as a clamp did.
export const GTAO_KNEE=.08;
// Metres from the eye where AO has faded out (see the multiply below); every room is well inside it.
export const GTAO_FAR=24;
// How much of the AO is applied (0..1); AO is in linear light, the frame is sRGB, so the multiply uses ao^(1/2.2).
export const GTAO_INTENSITY=.85;
// Upsampling kernel radius in AO texels: 2 = 5 × 5 taps, which spans GTAO's 5 × 5 noise tile, so its dither averages out
// where the Poisson denoise leaves grain (beside thin wall-hung boxes, under shelves).
export const GTAO_UPSAMPLE=2;
// Exposure lift while AO is on, so the eye-level views keep their mean brightness (owner: shadows add depth, not darkness).
export const GTAO_EXPOSURE=1.035;

// Normal + depth pass that follows the scene: each mesh gets a MeshNormalMaterial with its own material's side, flat shading and
// clipping planes (cut walls stay cut); transparent, unlit (toneMapped:false: sky, glow, shade decals), non-depth-writing and
// hidden materials, lines, points and sprites are left out, as in the beauty pass they would not occlude anything solid.
const HIDDEN=new THREE.MeshBasicMaterial({visible:false});
class SceneGTAOPass extends GTAOPass{
 constructor(scene,camera,...rest){super(scene,camera,...rest);this._normals=new Map();this._planeIds=new WeakMap();this._swapped=[];}
 _normalFor(m){
  if(!m||!m.visible||m.transparent||m.depthWrite===false||m.colorWrite===false||m.toneMapped===false||m.wireframe)return HIDDEN;
  const planes=m.clippingPlanes||[];let key=m.side+'|'+(m.flatShading?1:0)+'|'+(m.clipIntersection?1:0);
  for(const p of planes){if(!this._planeIds.has(p))this._planeIds.set(p,this._planeIds.size+1);key+='|'+this._planeIds.get(p);}
  let n=this._normals.get(key);
  // The same Plane objects as the mesh's own material, so a moved cut (setArchitecturalCut) moves here too.
  if(!n){n=new THREE.MeshNormalMaterial({side:m.side,flatShading:!!m.flatShading,blending:THREE.NoBlending});n.clippingPlanes=planes.length?[...planes]:null;n.clipIntersection=!!m.clipIntersection;this._normals.set(key,n);}
  return n;
 }
 _overrideVisibility(){
  const s=this._swapped;
  this.scene.traverseVisible(o=>{
   if(!o.material)return;
   s.push(o,o.material);
   o.material=o.isMesh?(Array.isArray(o.material)?o.material.map(m=>this._normalFor(m)):this._normalFor(o.material)):HIDDEN;
  });
 }
 _restoreVisibility(){const s=this._swapped;for(let i=0;i<s.length;i+=2)s[i].material=s[i+1];s.length=0;}
 // GTAOPass would set scene.overrideMaterial here, which would undo the per-mesh materials above.
 _renderOverride(renderer,overrideMaterial,renderTarget,clearColor,clearAlpha){
  renderer.getClearColor(this._originalClearColor);const alpha=renderer.getClearAlpha(),autoClear=renderer.autoClear;
  renderer.setRenderTarget(renderTarget);renderer.autoClear=false;renderer.setClearColor(clearColor);renderer.setClearAlpha(clearAlpha);renderer.clear();
  renderer.render(this.scene,this.camera);
  renderer.autoClear=autoClear;renderer.setClearColor(this._originalClearColor);renderer.setClearAlpha(alpha);
 }
}

// Multiply the denoised AO onto what is already in the canvas. Upsampling: the (2·GTAO_UPSAMPLE+1)² AO texels around a pixel
// are weighted by distance (tent) and by how close each texel's depth (the full-size depth at its centre, as GTAO saw it) is
// to the pixel's own, so a cushion edge takes the cushion's AO and the sofa back behind it the sofa back's, without the
// speckled rim of a plain bilinear fetch. Beyond GTAO_FAR the 24-bit depth is too coarse for a 0.45 m reach (speckles on the
// trees and ground outside), so AO fades out from 0.6 × GTAO_FAR.
const multiplyMaterial=()=>new THREE.ShaderMaterial({
 name:'gtao-multiply',uniforms:{tAO:{value:null},tDepth:{value:null},aoSize:{value:new THREE.Vector2(1,1)},cameraNear:{value:.1},cameraFar:{value:100},knee:{value:GTAO_KNEE},intensity:{value:GTAO_INTENSITY},far:{value:GTAO_FAR}},
 depthTest:false,depthWrite:false,
 blending:THREE.CustomBlending,blendEquation:THREE.AddEquation,blendSrc:THREE.ZeroFactor,blendDst:THREE.SrcColorFactor,
 blendEquationAlpha:THREE.AddEquation,blendSrcAlpha:THREE.ZeroFactor,blendDstAlpha:THREE.OneFactor,
 vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
 fragmentShader:`#include <packing>
#define R ${GTAO_UPSAMPLE}
uniform sampler2D tAO;uniform highp sampler2D tDepth;uniform vec2 aoSize;uniform float cameraNear,cameraFar,knee,intensity,far;varying vec2 vUv;
float viewZ(vec2 uv){return perspectiveDepthToViewZ(textureLod(tDepth,uv,0.).x,cameraNear,cameraFar);}
void main(){
 float d=textureLod(tDepth,vUv,0.).x;if(d>=1.){gl_FragColor=vec4(1.);return;}
 float z=perspectiveDepthToViewZ(d,cameraNear,cameraFar);if(-z>=far){gl_FragColor=vec4(1.);return;}
 vec2 t=vUv*aoSize-.5;ivec2 c=ivec2(floor(t+.5)),top=ivec2(aoSize)-1;float sum=0.,wsum=0.;
 for(int j=-R;j<=R;j++)for(int i=-R;i<=R;i++){ivec2 q=clamp(c+ivec2(i,j),ivec2(0),top);vec2 dd=abs(vec2(q)-t);
  float ws=max(0.,float(R)+1.-dd.x)*max(0.,float(R)+1.-dd.y),rel=abs(viewZ((vec2(q)+.5)/aoSize)-z)/max(-z,1e-3);
  float w=ws/(.002+rel)+1e-6;sum+=texelFetch(tAO,q,0).r*w;wsum+=w;}
 float o=clamp(1.-sum/wsum,0.,1.);o*=o/(o+knee);float ao=mix(1.-o,1.,smoothstep(.6*far,far,-z));
 gl_FragColor=vec4(vec3(mix(1.,pow(ao,1./2.2),intensity)),1.);
}`
});

// active(): app state (eye-level view, quality); enabled: the runtime switch (?ao=0, window.xiyuanAO(false)).
export function installGTAO({renderer,scene,camera,active,enabled=true}){
 const pass=new SceneGTAOPass(scene,camera,1,1,undefined,GTAO_PARAMS,GTAO_DENOISE);pass.output=GTAOPass.OUTPUT.Off;
 // Packed normals need no half floats: 8-bit RGBA halves the full-size normal buffer (29 MB less at 3828 × 1905).
 pass.normalRenderTarget.texture.type=THREE.UnsignedByteType;
 const quad=new FullScreenQuad(multiplyMaterial()),U=quad.material.uniforms;U.tAO.value=pass.gtaoMap;U.tDepth.value=pass.depthTexture;
 const size=new THREE.Vector2(),full=[0,0],render=renderer.render;let busy=false;
 const state={pass,get enabled(){return enabled;},set enabled(v){enabled=!!v;},
  // True when the next screen render of the main scene gets AO.
  get on(){return enabled&&active();},
  // [AO buffer w, h, normal + depth buffer w, h]
  size:()=>[pass.width,pass.height,...full],draws:0,
  // Tuning handles (window.xiyuanAO.layer in the console): exposure lift and the multiply's uniforms (knee, intensity, far).
  exposure:GTAO_EXPOSURE,uniforms:U};
 renderer.render=function(s,c){
  if(busy||s!==scene||c!==camera||this.getRenderTarget()!==null||!state.on)return render.call(this,s,c);
  busy=true;const exposure=this.toneMappingExposure,autoReset=this.info.autoReset;
  try{
   this.toneMappingExposure=exposure*state.exposure;render.call(this,s,c);this.toneMappingExposure=exposure;
   // Keep counting through the AO draws, so info.render reports the whole frame (beauty + normal pass + 3 full-screen passes).
   const calls=this.info.render.calls;this.info.autoReset=false;
   // Follow the drawing buffer: the still frame's sharper ratio (app.js setRatio) resizes these with the canvas.
   this.getDrawingBufferSize(size);const w=Math.max(1,Math.round(size.x*GTAO_SCALE)),h=Math.max(1,Math.round(size.y*GTAO_SCALE));
   if(w!==pass.width||h!==pass.height||size.x!==full[0]||size.y!==full[1]){pass.setSize(w,h);pass.normalRenderTarget.setSize(size.x,size.y);full[0]=size.x;full[1]=size.y;U.aoSize.value.set(w,h);}
   pass.render(this,null,null);
   U.cameraNear.value=camera.near;U.cameraFar.value=camera.far;
   this.setRenderTarget(null);const autoClear=this.autoClear;this.autoClear=false;quad.render(this);this.autoClear=autoClear;
   state.draws=this.info.render.calls-calls;
  }finally{this.toneMappingExposure=exposure;this.info.autoReset=autoReset;busy=false;}
 };
 return state;
}
