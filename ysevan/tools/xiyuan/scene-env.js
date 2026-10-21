import * as THREE from 'three';
import {mergeGeometries} from './utils/BufferGeometryUtils.js?v=fda7e946b8';
// What the windows look out on (owner, 2026-10-21): a gradient sky and a ring of generic low-poly massing 240–320 m out.
// Abstract by design: no real neighbouring buildings, river or surveyed view. Sky and skyline are one mesh with one material
// (vertex colours, no fog, no tone mapping, like scene.background), drawn after every opaque mesh (renderOrder 1) so walls
// and furniture depth-reject most of its pixels; keep it out of batchStatic so that order survives.
export const HORIZON='#d8e2d9'; // the walk background and fog colour: fogged land and the skyline's foot meet the sky without a seam
export const SKY_STOPS=[[-1,HORIZON],[0,HORIZON],[.05,'#d4e0dc'],[.18,'#c9d9df'],[.45,'#b9cfdc'],[1,'#adc5d7']]; // by sin(elevation)
export const SKY_RADIUS=360,SKYLINE_RING=[240,320],SKYLINE_GREYS=['#b3bec4','#bcc5c9','#aab6bd','#c1c8ca'];
const seeded=n=>{let a=n>>>0;return()=>{a=(a*1664525+1013904223)>>>0;return a/4294967296;};};
const lin=hex=>new THREE.Color(hex);
export function skyColor(s,out=new THREE.Color()){for(let i=1;i<SKY_STOPS.length;i++){const [s1,c1]=SKY_STOPS[i];if(s<=s1||i===SKY_STOPS.length-1){const [s0,c0]=SKY_STOPS[i-1];return out.copy(lin(c0)).lerp(lin(c1),THREE.MathUtils.clamp((s-s0)/(s1-s0),0,1));}}return out;}
function paint(g,fn){const p=g.attributes.position,n=g.attributes.normal,c=new Float32Array(p.count*3),col=new THREE.Color();for(let i=0;i<p.count;i++){fn(col,p.getX(i),p.getY(i),p.getZ(i),n.getX(i),n.getY(i),n.getZ(i));col.toArray(c,i*3);}g.setAttribute('color',new THREE.BufferAttribute(c,3));g.deleteAttribute('uv');g.deleteAttribute('normal');return g;}
export function createSky({center=[20.9,5.5],seed=480}={}){
 const [cx,cz]=center,parts=[],haze=lin(HORIZON);
 // Dome in 6° rows down to the horizon: below it the sky would only repeat the background colour (= HORIZON), so it is left to the
 // clear, which saves the software tier the depth tests. Centred on the floor plate, wound inside-out so FrontSide faces the camera.
 const dome=new THREE.SphereGeometry(SKY_RADIUS,40,15,0,Math.PI*2,0,Math.PI/2),ix=dome.index.array;for(let i=0;i<ix.length;i+=3){const t=ix[i+1];ix[i+1]=ix[i+2];ix[i+2]=t;}dome.translate(cx,0,cz);
 parts.push(paint(dome,(c,x,y)=>skyColor(y/SKY_RADIUS,c)));
 // Skyline: ~55 boxes facing the centre, three height bands, some with a set-back crown. Feet fade into the horizon haze,
 // tops keep more of their own cool grey; sides are shaded by a fixed light from the south-west.
 const rnd=seeded(seed),N=60,light=new THREE.Vector3(-.55,0,.83);
 const block=(x,z,yaw,w,h,d,y0,grey,far)=>{const g=new THREE.BoxGeometry(w,h,d);g.translate(0,y0+h/2,0);g.rotateY(yaw);g.translate(x,0,z);const base=lin(grey),top=y0+h;
  parts.push(paint(g,(c,X,Y,Z,nx,ny,nz)=>{const shade=ny>.5?1.04:.9+.1*Math.max(0,nx*light.x+nz*light.z);c.copy(base).multiplyScalar(shade).lerp(haze,THREE.MathUtils.lerp(.88,.42+.18*far,Math.min(1,Y/Math.max(top,1))));}));};
 for(let i=0;i<N;i++){const a=(i+rnd()*.7)/N*Math.PI*2,r=SKYLINE_RING[0]+rnd()*(SKYLINE_RING[1]-SKYLINE_RING[0]),gap=rnd()<.14,band=rnd(),w=14+rnd()*16,d=11+rnd()*9,grey=SKYLINE_GREYS[Math.floor(rnd()*SKYLINE_GREYS.length)],crown=rnd();
  if(gap)continue;const h=band<.15?12+rnd()*8:band<.72?24+rnd()*24:52+rnd()*36,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r,yaw=-a+(rnd()-.5)*.5,far=(r-SKYLINE_RING[0])/(SKYLINE_RING[1]-SKYLINE_RING[0]);
  block(x,z,yaw,w,h,d,0,grey,far);if(h>40&&crown<.45)block(x,z,yaw,w*.62,6+crown*28,d*.7,h,grey,far);}
 const geometry=mergeGeometries(parts,false);parts.forEach(g=>g.dispose());geometry.computeBoundingSphere();
 const sky=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({vertexColors:true,fog:false,toneMapped:false}));
 sky.name='sky';sky.renderOrder=1;sky.castShadow=sky.receiveShadow=false;sky.matrixAutoUpdate=false;sky.updateMatrix();return sky;
}
// Eye-level views (walk, tour inside): keep the base vertical fov, but at least hMin° across (portrait phones: 64° vertical
// is only ~32° across) and at most hMax° across (2:1 desktops: 64° vertical stretches the edges to ~103° across).
// Below aspect ~0.48 both cannot hold under the vMax cap: a 417×900 phone gets 100° vertical, ~58° across.
// Per render tier: GPU and phone tiers cap at 90° across. The software tier allows 103°, so a 2:1 desktop keeps 64° vertical
// there: narrowing a wide view costs it ~2.5% per frame per few degrees in the living room (more of the frame lands on costlier
// surfaces), so the edge-stretch fix is left to the tiers that can afford it.
export const FOV={gpu:{hMin:60,hMax:90,vMax:100},phone:{hMin:60,hMax:90,vMax:100},soft:{hMin:60,hMax:103,vMax:100}};
const D=Math.PI/180;
export const hFov=(v,aspect)=>2*Math.atan(Math.tan(v*D/2)*aspect)/D;
export const vFov=(h,aspect)=>2*Math.atan(Math.tan(h*D/2)/aspect)/D;
export function eyeFov(v,aspect,tier='gpu'){const f=FOV[tier]||FOV.gpu,h=hFov(v,aspect);return h<f.hMin?Math.max(v,Math.min(f.vMax,vFov(f.hMin,aspect))):h>f.hMax?vFov(f.hMax,aspect):v;}
// True when the straight line p → q passes through any mesh under `root` (each mesh's local bounding box; world matrices current).
const _inv=new THREE.Matrix4(),_a=new THREE.Vector3(),_b=new THREE.Vector3();
export function crosses(root,p,q){let hit=false;root.traverse(m=>{if(hit||!m.isMesh)return;const g=m.geometry;if(!g.boundingBox)g.computeBoundingBox();const {min,max}=g.boundingBox;_inv.copy(m.matrixWorld).invert();_a.set(...p).applyMatrix4(_inv);_b.set(...q).applyMatrix4(_inv);
 let t0=0,t1=1;for(const k of ['x','y','z']){const d=_b[k]-_a[k];if(Math.abs(d)<1e-12){if(_a[k]<min[k]||_a[k]>max[k])return;continue;}let u=(min[k]-_a[k])/d,w=(max[k]-_a[k])/d;if(u>w)[u,w]=[w,u];t0=Math.max(t0,u);t1=Math.min(t1,w);if(t0>t1)return;}hit=true;});return hit;}
