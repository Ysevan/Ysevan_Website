import * as THREE from 'three';
import {BAKE_DATA} from './bake-data.js?v=37702a6e10';
// Baked lighting (2026-10-26): Blender (Cycles) bakes the daylight of the owner's B unit, sun through the windows, sky, every
// bounce and the occlusion of that layout's furniture, into lightmaps for the unit's walls, floors and ceilings. Light only,
// never colour: a texel is the light that reaches the surface, so the four finish styles (and any custom colour) still apply.
// One lightmap per layout and lighting preset (4 × 3), loaded only for the current pair. Used at eye level only (walking, the
// tour's rooms: under the roof the bake was made with); the cut overviews keep the real-time lights they always had.
//
// How it fits the scene. app.js builds the unit as before; this module then takes the unit's own surface triangles out of the
// merged meshes (the floor plate, the wall sets, the window and door walls, the wet-room tiles, the roof's underside and the
// wet rooms' 2.40 m ceilings) into child meshes, split exactly at the unit outline, so a merged mesh that runs through the
// neighbours keeps their part. Those children share their source's material, so the page looks the same until a lightmap is
// in use; then they switch to a twin of that material that reads the lightmap in place of every diffuse light:
//  - GPU and phone tiers: the same MeshStandardMaterial (colour, maps, roughness, normal map, sun and environment
//    reflections as before), diffuse from the lightmap; point lights (the room lamps, the dining pendant, the gaming accent)
//    still add their own pool of light.
//  - software rasteriser: MeshBasicMaterial (colour map × lightmap, no light loop, no shadow lookups), which is cheaper.
// The fake ambient-occlusion bands along the walls of the unit hide (the bake has the real corners) and the contact patches
// under the owner's furniture fade to CONTACT_KEEP (the floor under them is baked; rugs and the furniture are not).
//
// Lightmap UVs (uv1) are made here, from the geometry, by the same code in every tier and in the bake export
// (scripts/bake/export.mjs), so the atlas the page builds is the atlas Blender baked into; BAKE_DATA.atlas.signature is
// checked, and a page whose atlas differs (a wall or floor edit without a rebake) keeps real-time light and says so in the
// console. Lightmap texels: RGB = baked light in log2 over 10 stops (scripts/bake/encode.py), A = ambient occlusion (0.8 m).
// Switch: ?bake=0 in the address (app.js then never loads this module), or xiyuanBake(false) / xiyuanBake(true) in the console.

// Light level. bake-data.js gives each lightmap its scale (and fill, for an unfolded map): a texel lights its surface with
// E = scale · rgb + fill · alpha in three's irradiance units, where the bake pipeline folded the calibrated light level into
// rgb (scripts/bake/calibration.json: the eye-level views keep the brightness they had, see README「Blender 光照烘焙」).
// tune({lighting: {indirect, fill}}) overrides it at run time on unfolded lightmaps, for scripts/bake/calibrate.mjs only.
export const BAKE_TUNE={};
// Contact patches under the owner's furniture keep this much of their strength while the bake is in use.
export const CONTACT_KEEP=.45;
// Plane lines along the unit outline, where merged triangles are split (plan metres; the outline is rectilinear).
export const ATLAS={size:2048,pad:3};

export function inPolygon(x,z,p){let c=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const [xi,zi]=p[i],[xj,zj]=p[j];if((zi>z)!==(zj>z)&&x<(xj-xi)*(z-zi)/(zj-zi)+xi)c=!c;}return c;}
// Which triangles each surface kind takes (world face normal n, centroid c).
export const CEILINGS=[2.78,2.4];
export const KINDS={
 floor:(n,c)=>n[1]>.99&&c[1]<.05,
 // Only the ceiling planes themselves (the roof's underside at 2.78 m, the wet rooms' ceilings at 2.40 m): fittings hanging under
 // them are drawn with the same white and their bevels differ by render tier, so they would make the atlas depend on the tier.
 ceiling:(n,c)=>n[1]<-.99&&CEILINGS.some(y=>Math.abs(c[1]-y)<.004),
 wall:(n,c)=>!(n[1]>.5&&c[1]>2.7)&&!(n[1]<-.5&&c[1]<.05),
 any:()=>true
};

// --- splitting merged meshes at the unit outline ----------------------------------------------------------------------------
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function faceOf(w){const n=cross(sub(w[1],w[0]),sub(w[2],w[0])),l=Math.hypot(...n);return {n:l>0?n.map(v=>v/l):[0,0,0],area:l/2,c:[0,1,2].map(k=>(w[0][k]+w[1][k]+w[2][k])/3)};}
// A mirrored mesh (determinant < 0: the mirrored door sets, the right-hand units) is drawn with its winding reversed, so its
// front-face normal is the world winding's, negated.
// Vertex record: world position w, and every attribute's components (local space) in v.
const lerpRec=(a,b,t)=>({w:a.w.map((x,i)=>x+(b.w[i]-x)*t),v:a.v.map((x,i)=>x+(b.v[i]-x)*t)});
function clipHalf(poly,axis,value,below){const out=[];for(let i=0;i<poly.length;i++){const A=poly[i],B=poly[(i+1)%poly.length];let sa=A.w[axis]-value,sb=B.w[axis]-value;if(Math.abs(sa)<1e-7)sa=0;if(Math.abs(sb)<1e-7)sb=0;
 if(below?sa<=0:sa>=0)out.push(A);if((sa<0&&sb>0)||(sa>0&&sb<0))out.push(lerpRec(A,B,sa/(sa-sb)));}return out;}
// A triangle (three records) cut by the plane w[axis] = value into up to three triangles, winding kept.
export function splitTriangle(tri,axis,value){
 const s=tri.map(r=>r.w[axis]-value);if(Math.min(...s)>-1e-6||Math.max(...s)<1e-6)return [tri];
 const out=[];for(const below of [true,false]){const p=clipHalf(tri,axis,value,below);for(let i=1;i+1<p.length;i++){const t=[p[0],p[i],p[i+1]];if(faceOf(t.map(r=>r.w)).area>1e-10)out.push(t);}}return out;
}
// Takes the triangles of `mesh` that `take(n,c)` accepts inside `region` into a new geometry (source local space) and leaves the
// rest in the mesh; triangles crossing a split line are cut first. Returns the taken geometry or null.
function partition(mesh,{region,box,lines,take,seen}){
 let g=mesh.geometry;if(g.index)g=g.toNonIndexed();
 const names=Object.keys(g.attributes).filter(k=>!g.attributes[k].isInterleavedBufferAttribute),A=names.map(k=>g.attributes[k]),P=g.attributes.position,W=mesh.matrixWorld,e=W.elements,flip=W.determinant()<0;
 const world=i=>{const x=P.getX(i),y=P.getY(i),z=P.getZ(i);return [e[0]*x+e[4]*y+e[8]*z+e[12],e[1]*x+e[5]*y+e[9]*z+e[13],e[2]*x+e[6]*y+e[10]*z+e[14]];};
 const rec=i=>({w:world(i),v:A.flatMap(a=>{const r=[];for(let k=0;k<a.itemSize;k++)r.push(a.array[i*a.itemSize+k]);return r;})});
 const inside=(n,c)=>{if(flip)n=n.map(v=>-v);const q=[c[0]+n[0]*.03,c[1]+n[1]*.03,c[2]+n[2]*.03];return q[1]>-.05&&q[1]<2.85&&inPolygon(q[0],q[2],region)&&take(n,c);};
 const parent=mesh.parent?.uuid||'',dup=w=>{if(!seen)return false;const k=parent+'|'+w.map(p=>p.map(v=>Math.round(v*2000)).join(',')).sort().join('|');if(seen.has(k))return true;seen.add(k);return false;};
 const keepI=[],takeI=[],keepR=[],takeR=[];let changed=false;
 for(let t=0;t<P.count/3;t++){
  const w=[world(3*t),world(3*t+1),world(3*t+2)];
  if(Math.max(w[0][0],w[1][0],w[2][0])<box[0]||Math.min(w[0][0],w[1][0],w[2][0])>box[2]||Math.max(w[0][2],w[1][2],w[2][2])<box[1]||Math.min(w[0][2],w[1][2],w[2][2])>box[3]){keepI.push(t);continue;}
  let tris=null;
  for(const [axis,value] of lines){const lo=Math.min(w[0][axis],w[1][axis],w[2][axis]),hi=Math.max(w[0][axis],w[1][axis],w[2][axis]);if(lo<value-1e-6&&hi>value+1e-6){tris??=[[rec(3*t),rec(3*t+1),rec(3*t+2)]];tris=tris.flatMap(q=>splitTriangle(q,axis,value));}}
  if(!tris){const f=faceOf(w);if(inside(f.n,f.c)){changed=true;if(!dup(w))takeI.push(t);}else keepI.push(t);continue;}
  changed=true;for(const q of tris){const ww=q.map(r=>r.w),f=faceOf(ww);if(inside(f.n,f.c)){if(!dup(ww))takeR.push(q);}else keepR.push(q);}
 }
 if(!changed)return null;
 const build=(I,R)=>{const out=new THREE.BufferGeometry(),n=(I.length+R.length)*3;names.forEach((k,j)=>{const a=A[j],s=a.itemSize,arr=new a.array.constructor(n*s);let o=0;
   for(const t of I){arr.set(a.array.subarray(t*3*s,t*3*s+3*s),o);o+=3*s;}
   const off=A.slice(0,j).reduce((m,b)=>m+b.itemSize,0);for(const q of R)for(const r of q){for(let k=0;k<s;k++)arr[o+k]=r.v[off+k];o+=s;}
   out.setAttribute(k,new THREE.BufferAttribute(arr,s,a.normalized));});out.computeBoundingSphere();out.computeBoundingBox();return out;};
 mesh.geometry=build(keepI,keepR);
 return build(takeI,takeR);
}
// Every mesh under `root` drawn with `material` (hidden ones too: both wall sets, every layout).
function meshesOf(root,material){const out=[];root.traverse(o=>{if(o.isMesh&&o.material===material&&!o.userData.bakePiece)out.push(o);});return out;}
// The unit's surfaces as child meshes of their sources. surfaces: [{root, material, kind}]; suppress: [{root, material} or {meshes}]
// (fake AO in the unit, taken whole: any kind). Returns {pieces, hidden}.
export function extractShell({region,surfaces=[],suppress=[]}){
 const xs=[...new Set(region.map(p=>p[0]))].sort((a,b)=>a-b),zs=[...new Set(region.map(p=>p[1]))].sort((a,b)=>a-b);
 const lines=[...xs.map(v=>[0,v]),...zs.map(v=>[2,v])],box=[xs[0]-.05,zs[0]-.05,xs.at(-1)+.05,zs.at(-1)+.05],seen=new Set(),pieces=[],hidden=[];
 const child=(src,geo,role,kind)=>{const q=new THREE.Mesh(geo,src.material);q.name='bake-'+role+(kind?'-'+kind:'');q.castShadow=src.castShadow;q.receiveShadow=src.receiveShadow;q.renderOrder=src.renderOrder;q.frustumCulled=src.frustumCulled;
  q.userData.bakePiece=role;q.userData.bakeKind=kind;q.userData.bakeSource=src;src.add(q);q.updateMatrixWorld(true);return q;};
 for(const {root,material,kind} of surfaces){root.updateMatrixWorld(true);for(const m of meshesOf(root,material)){const g=partition(m,{region,box,lines,take:KINDS[kind],seen});if(g?.attributes.position.count)pieces.push(child(m,g,'shell',kind));}}
 for(const s of suppress){for(const m of s.meshes||meshesOf(s.root,s.material)){m.updateMatrixWorld(true);const g=partition(m,{region,box,lines,take:KINDS.any});if(g?.attributes.position.count)hidden.push(child(m,g,'hidden'));}}
 return {pieces,hidden};
}

// --- lightmap atlas -----------------------------------------------------------------------------------------------------------
// Charts: coplanar triangles that share a vertex (both wall sets' identical faces fall into one chart: one texel per point of
// the unit). Each chart is projected on its plane (floors and ceilings: plan x, z; walls: along the wall, height), at one
// density for the whole atlas, packed on shelves, tallest first, at the highest density that fits. Deterministic: the same
// triangles give the same atlas in any order.
const fnv=s=>{let h=0x811c9dc5;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return (h>>>0).toString(16).padStart(8,'0');};
export function buildAtlas(pieces,{size=ATLAS.size,pad=ATLAS.pad}={}){
 const tris=[],vkey=new Map(),parent=[];
 const find=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;},union=(a,b)=>{a=find(a);b=find(b);if(a!==b)parent[Math.max(a,b)]=Math.min(a,b);};
 for(const piece of pieces){piece.updateMatrixWorld(true);const P=piece.geometry.attributes.position,e=piece.matrixWorld.elements,flip=piece.matrixWorld.determinant()<0;
  for(let t=0;t<P.count/3;t++){const w=[0,1,2].map(k=>{const i=3*t+k,x=P.getX(i),y=P.getY(i),z=P.getZ(i);return [e[0]*x+e[4]*y+e[8]*z+e[12],e[1]*x+e[5]*y+e[9]*z+e[13],e[2]*x+e[6]*y+e[10]*z+e[14]];});
   const f=faceOf(w);if(flip)f.n=f.n.map(v=>-v);const nq=f.n.map(v=>Math.round(v*1000)+0),nl=Math.hypot(...nq)||1,n=nq.map(v=>v/nl);
   const [U,V]=Math.abs(n[1])>.9?[[1,0,0],[0,0,1]]:(()=>{const h=Math.hypot(n[0],n[2])||1;return [[-n[2]/h,0,n[0]/h],[0,1,0]];})();
   const plane=nq.join(',')+'|'+(Math.round((n[0]*f.c[0]+n[1]*f.c[1]+n[2]*f.c[2])*1000)+0),uv=w.map(p=>[p[0]*U[0]+p[1]*U[1]+p[2]*U[2],p[0]*V[0]+p[1]*V[1]+p[2]*V[2]]),id=tris.length;
   tris.push({piece,t,plane,uv});parent.push(id);
   for(const [u,v] of uv){const k=plane+'|'+(Math.round(u*1000)+0)+','+(Math.round(v*1000)+0);if(vkey.has(k))union(id,vkey.get(k));else vkey.set(k,id);}}}
 const groups=new Map();tris.forEach((q,i)=>{const r=find(i);if(!groups.has(r))groups.set(r,[]);groups.get(r).push(q);});
 const charts=[...groups.values()].map(list=>{let u0=Infinity,v0=Infinity,u1=-Infinity,v1=-Infinity;for(const q of list)for(const [u,v] of q.uv){u0=Math.min(u0,u);v0=Math.min(v0,v);u1=Math.max(u1,u);v1=Math.max(v1,v);}
  return {list,u0,v0,du:u1-u0,dv:v1-v0,key:list[0].plane+'|'+(Math.round(u0*1000)+0)+','+(Math.round(v0*1000)+0)};});
 charts.sort((a,b)=>a.key<b.key?-1:a.key>b.key?1:0);
 const dims=D=>charts.map(c=>[Math.max(1,Math.ceil(c.du*D-1e-9))+2*pad,Math.max(1,Math.ceil(c.dv*D-1e-9))+2*pad]);
 const pack=D=>{const d=dims(D),order=charts.map((c,i)=>i).sort((a,b)=>d[b][1]-d[a][1]||d[b][0]-d[a][0]||(charts[a].key<charts[b].key?-1:1));let x=0,y=0,row=0;const at=[];
  for(const i of order){const [w,h]=d[i];if(w>size)return null;if(x+w>size){y+=row;x=0;row=0;}if(y+h>size)return null;at[i]=[x,y,w,h];x+=w;row=Math.max(row,h);}return at;};
 let lo=1,hi=400;for(let k=0;k<40;k++){const mid=(lo+hi)/2;if(pack(mid))lo=mid;else hi=mid;}
 const D=Math.floor(lo*100)/100,at=pack(D);let area=0;
 charts.forEach((c,i)=>{const [x,y]=at[i];area+=c.du*c.dv;for(const q of c.list){const a=q.piece.geometry.attributes,uv1=a.uv1?.array||new Float32Array(a.position.count*2);
  q.uv.forEach(([u,v],k)=>{uv1[(3*q.t+k)*2]=(x+pad+(u-c.u0)*D)/size;uv1[(3*q.t+k)*2+1]=(y+pad+(v-c.v0)*D)/size;});if(!a.uv1)q.piece.geometry.setAttribute('uv1',new THREE.BufferAttribute(uv1,2));}});
 for(const p of pieces)if(p.geometry.attributes.uv1)p.geometry.attributes.uv1.needsUpdate=true;
 const signature=fnv(size+'|'+pad+'|'+D+'|'+tris.length+'|'+charts.map((c,i)=>c.key+':'+at[i].join(',')).join(';'));
 return {size,pad,texelsPerMetre:D,charts:charts.length,triangles:tris.length,area:+area.toFixed(2),used:+(at.reduce((s,[,,w,h])=>s+w*h,0)/size/size).toFixed(4),signature};
}

// --- materials ------------------------------------------------------------------------------------------------------------
// Shared uniforms: bake.x = the lightmap's scale, bake.y = level (the gaming room's rest mood dims it like the hemisphere),
// bake.z = the second map's scale, bake.w = the log2 range of a texel (texel t is light 2^((t − 1) · w), times the scale).
// A shipped (folded) lightmap (XY_TINT) is a grey brightness map (lossless) and a half-size colour map: light = brightness ×
// (1 + (tint − ½) / gain). Before calibration (XY_REST, scripts/bake/calibrate.mjs) it is the sun with AO in alpha, the rest
// of the light as a second map (rest) and an adjustable fill; there
// the fill only lifts weak light: E = g + fill · AO / (1 + (Y(g) / gate)⁴), g = the sun + the boosted rest rolled off above
// knee (rest / √(1 + (Y(rest) / knee)²): the sky seen straight through a window would otherwise glare), Y = luminance.
const POINT_MARK='#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )';
const BASIC_LINE='reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;';
export const TWIN_FOLLOW=['map','roughness','metalness','roughnessMap','normalMap','normalScale','vertexColors','visible','side','envMapIntensity'];
export function twinMaterial(src,tier,U){
 const basic=tier==='soft',m=basic?new THREE.MeshBasicMaterial({map:src.map,vertexColors:src.vertexColors,side:src.side}):src.clone();
 m.color=src.color;m.clippingPlanes=src.clippingPlanes;m.lightMapIntensity=0;m.name=(src.name||'')+'+bake';m.userData.bakeTwinOf=src;
 m.onBeforeCompile=sh=>{sh.uniforms.xyBake=U.bake;sh.uniforms.xyFill=U.fill;sh.uniforms.xyRest=U.rest;sh.uniforms.xyGate=U.gate;sh.uniforms.xyKnee=U.knee;sh.uniforms.xyTint=U.tint;sh.uniforms.xyTintGain=U.tintGain;let f=sh.fragmentShader.replace('void main() {','uniform vec4 xyBake;\nuniform vec3 xyFill;\n#if defined( XY_REST )\nuniform sampler2D xyRest;\nuniform float xyGate;\nuniform float xyKnee;\nvec3 xyLight( vec4 t ) { vec3 q = exp2( ( texture2D( xyRest, vLightMapUv ).rgb - 1.0 ) * xyBake.w ) * xyBake.z; float k = dot( q, vec3( .2126, .7152, .0722 ) ) / xyKnee; vec3 g = exp2( ( t.rgb - 1.0 ) * xyBake.w ) * xyBake.x + q / sqrt( 1.0 + k * k ); float r = dot( g, vec3( .2126, .7152, .0722 ) ) / xyGate; r *= r; return g + xyFill * t.a / ( 1.0 + r * r ); }\n#elif defined( XY_TINT )\nuniform sampler2D xyTint;\nuniform float xyTintGain;\nvec3 xyLight( vec4 t ) { return exp2( ( t.r - 1.0 ) * xyBake.w ) * xyBake.x * ( 1.0 + ( texture2D( xyTint, vLightMapUv ).rgb - 0.5 ) / xyTintGain ); }\n#else\nvec3 xyLight( vec4 t ) { return exp2( ( t.rgb - 1.0 ) * xyBake.w ) * xyBake.x + xyFill * t.a; }\n#endif\n#define XY_LIGHT(t) xyLight( t )\n'+'void main() {');
  if(basic)f=f.replace(BASIC_LINE,'reflectedLight.indirectDiffuse += XY_LIGHT( lightMapTexel ) * xyBake.y * RECIPROCAL_PI;');
  else f=f.replace('#include <lights_fragment_begin>',THREE.ShaderChunk.lights_fragment_begin.replace(POINT_MARK,'vec3 xyPoint = reflectedLight.directDiffuse;\n'+POINT_MARK))
   .replace('#include <lights_fragment_end>','#include <lights_fragment_end>\n#ifdef USE_LIGHTMAP\n\treflectedLight.indirectDiffuse = XY_LIGHT( texture2D( lightMap, vLightMapUv ) ) * xyBake.y * BRDF_Lambert( material.diffuseColor );\n\treflectedLight.directDiffuse = xyPoint;\n#endif');
  sh.fragmentShader=f;};
 m.customProgramCacheKey=()=>'xiyuan-bake-'+(basic?'basic':'standard');
 return m;
}
function follow(m){const s=m.userData.bakeTwinOf;let swap=false;for(const k of TWIN_FOLLOW){if(!(k in m)||!(k in s))continue;const a=m[k],b=s[k];if(a===b)continue;
 if(a?.isVector2){a.copy(b);continue;}if(k.endsWith('Map')||k==='map'||k==='vertexColors'||k==='side')swap=swap||(!a!==!b)||k==='vertexColors'||k==='side';m[k]=b;}if(swap)m.needsUpdate=true;}

// --- the layer ------------------------------------------------------------------------------------------------------------
// state(): {interior, layout, lighting, furniture, level}; contactRoot: the owner's furniture (its contact patches are drawn
// with `shade`);
// invalidate(): ask app.js for a frame. assetBase: where lightmaps live (the page's ./assets/).
export function installBake({scene,tier,region,surfaces,suppress,shade,contactRoot=null,state,invalidate=()=>{},data=BAKE_DATA,assetBase='./assets/',loadTexture}){
 const t0=performance.now(),{pieces,hidden}=extractShell({region,surfaces,suppress}),atlas=buildAtlas(pieces),U={bake:{value:new THREE.Vector4(0,1,0,0)},fill:{value:new THREE.Vector3()},rest:{value:null},gate:{value:2},knee:{value:8},tint:{value:null},tintGain:{value:4}};
 const match=!!data.atlas&&data.atlas.signature===atlas.signature;
 if(data.atlas&&!match)console.warn('[bake] the scene\'s lightmap atlas ('+atlas.signature+') is not the one baked ('+data.atlas.signature+'): walls or floors changed since the bake; real-time light only. Rerun npm run bake.');
 const twins=new Map();for(const p of pieces)if(!twins.has(p.material))twins.set(p.material,twinMaterial(p.material,tier,U));
 const shadeSoft=shade?Object.assign(shade.clone(),{opacity:shade.opacity*CONTACT_KEEP}):null;if(shadeSoft)shadeSoft.clippingPlanes=shade.clippingPlanes;
 const loader=loadTexture||(url=>new THREE.TextureLoader().loadAsync(url));
 const cache=new Map();let enabled=true,active=false,current=null,want='',stats={loads:0,failed:[]};
 function entry(layout,lighting){return data.layouts?.[layout]?.[lighting]||null;}
 const prep=tex=>{tex.colorSpace=THREE.NoColorSpace;tex.channel=1;tex.flipY=true;tex.generateMipmaps=false;tex.minFilter=THREE.LinearFilter;tex.magFilter=THREE.LinearFilter;tex.premultiplyAlpha=false;tex.needsUpdate=true;return tex;};
 const urlOf=f=>f.startsWith('data:')?f:assetBase+f,drop=v=>{v?.main?.dispose();v?.rest?.dispose();v?.tint?.dispose();};
 function request(key){if(cache.has(key))return;const [layout,lighting]=key.split('|'),e=entry(layout,lighting);if(!e||!match){cache.set(key,null);return;}cache.set(key,'loading');
  Promise.all([loader(urlOf(e.file)),e.rest?loader(urlOf(e.rest.file)):null,e.tint?loader(urlOf(e.tint.file)):null]).then(([main,rest,tint])=>{
   // Keep only the pair in use: switching layout or lighting frees the one before.
   for(const [k,v] of cache)if(k!==key&&v?.main&&k!==want){drop(v);cache.delete(k);}
   cache.set(key,{main:prep(main),rest:rest?prep(rest):null,tint:tint?prep(tint):null,entry:e});stats.loads++;invalidate(400);}).catch(err=>{cache.set(key,null);stats.failed.push(key);console.warn('[bake] lightmap unavailable: '+key,err?.message||err);});}
 function apply(on,set,s){
  if(on){const e=set.entry,o=e.rest?BAKE_TUNE[s.lighting]:null,tex=set.main,rest=!!set.rest;U.bake.value.set(e.scale,s.level??1,rest?e.rest.scale*(o?.indirect??1):0,data.atlas.stops??10);U.fill.value.fromArray(o?.fill??e.fill??[0,0,0]);U.gate.value=o?.gate??2;U.knee.value=o?.knee??8;U.rest.value=set.rest;U.tint.value=set.tint;U.tintGain.value=e.tint?.gain??4;
   const mode=rest?'XY_REST':set.tint?'XY_TINT':'';
   for(const m of twins.values()){if(m.lightMap!==tex){if(!m.lightMap)m.needsUpdate=true;m.lightMap=tex;}if((m.userData.bakeMode??'')!==mode){m.defines={...(m.defines||{})};delete m.defines.XY_REST;delete m.defines.XY_TINT;if(mode)m.defines[mode]='';m.userData.bakeMode=mode;m.needsUpdate=true;}}}
  else U.bake.value.y=s.level??1;
  if(on!==active){active=on;for(const p of pieces)p.material=on?twins.get(p.userData.bakeSource.material)||p.material:p.userData.bakeSource.material;for(const q of hidden)q.visible=!on;}
  if(shade&&contactRoot)contactRoot.traverse(q=>{if(q.isMesh&&q.material===(on?shade:shadeSoft))q.material=on?shadeSoft:shade;});
 }
 const before=scene.onBeforeRender;
 scene.onBeforeRender=function(...args){before.apply(this,args);for(const m of twins.values())follow(m);
  const s=state(),key=s.layout+'|'+s.lighting;if(key!==want){want=key;}request(key);
  const set=cache.get(key),on=enabled&&match&&!!s.interior&&!!s.furniture&&!!set?.main;
  // Materials change only when the bake turns on or off (eye level only), so modes that lend the scene other materials for a
  // while (平面俯视's clay furniture, plan3d-mode.js) keep theirs.
  if(on)current=set.main;apply(on,set,s);};
 const api=Object.assign(on=>{if(on!==undefined){enabled=!!on;invalidate(300);}return {enabled,active,match,key:want,atlas:atlas.signature,loads:stats.loads,failed:stats.failed.slice()};},
  {layer:{pieces,hidden,atlas,twins,uniforms:U,data,extractMs:Math.round(performance.now()-t0),tune(level){/* {lighting: {indirect, fill}}: unfolded lightmaps only */for(const k of Object.keys(BAKE_TUNE))delete BAKE_TUNE[k];Object.assign(BAKE_TUNE,level||{});invalidate(300);},get active(){return active;},get texture(){return current;},scene}});
 return api;
}
