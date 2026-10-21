import * as THREE from 'three';
import {mergeGeometries} from './utils/BufferGeometryUtils.js?v=fda7e946b8';
// Hard-finish parts (scene detail round 2): geometry and materials only. detail-layer.js decides where they go.
// Every part is a plain BufferGeometry in world (or its parent's) metres, so a whole family merges into one draw call.

// Shared materials; above 1.28 m everything is cut with the walls. Skirting (the door-frame colour, FRAME) and the stone of
// thresholds, door stops and sills (STONE) are one vertex-coloured finish, one material per unit (unit(i)): batchStatic() merges
// by material, so each unit is a single draw and the units out of view are frustum-culled (on a software rasteriser every draw
// call and every transformed triangle of the whole floor would otherwise count).
export const FRAME='#a79274',STONE='#8f8b82';
export function detailMaterials({mat,M,clipPlane}){
 const cut={clippingPlanes:[clipPlane]},perUnit=new Map();
 const D={frame:mat(FRAME,.68,cut),fixture:mat('#f4f3ee',.45,cut),curtain:cutFabric(M,clipPlane),glow:new THREE.MeshBasicMaterial({color:'#fff2d9',toneMapped:false}),finish:[],
  unit(i){if(!perUnit.has(i)){const m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.58});perUnit.set(i,m);D.finish.push(m);}return perUnit.get(i);}};
 return D;
}
// Vertex colour for the shared finish (THREE.Color converts the sRGB hex to the linear values vertex colours carry).
export function tint(g,hex){const c=new THREE.Color(hex),n=g.attributes.position.count,a=new Float32Array(n*3);for(let i=0;i<n;i++)a.set([c.r,c.g,c.b],i*3);g.setAttribute('color',new THREE.BufferAttribute(a,3));return g;}
// Curtain fabric: the home's linen colour (same colour object, so palettes apply), cut with the walls. Matte Lambert, no texture,
// front faces only (curtain geometry faces the room): the cut is a discard, so on a software rasteriser every curtain pixel is
// shaded on top of the wall behind it, and the cheapest matte shading keeps that overdraw small.
// One instance per palette, shared by the master bay's drapes (bay-window.js) and the curtains here, so they batch together.
const fabrics=new WeakMap();
export function cutFabric(M,clipPlane){if(!fabrics.has(M.linen)){const c=new THREE.MeshLambertMaterial({clippingPlanes:[clipPlane]});c.color=M.linen.color;fabrics.set(M.linen,c);}return fabrics.get(M.linen);}
// Box between two corners; UVs in metres like box() (the finishes here are untextured, the curtain fabric is not a box).
export function boxGeo(x0,y0,z0,x1,y1,z1){const g=new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0);g.translate((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);return g;}
// Box along a plan segment a→b: `from`…`to` metres off the line along unit normal n, y0…y1 high.
export function stripGeo([ax,az],[bx,bz],[nx,nz],from,to,y0,y1){
 const L=Math.hypot(bx-ax,bz-az),g=new THREE.BoxGeometry(L,y1-y0,to-from),m=(from+to)/2;
 g.rotateY(-Math.atan2(bz-az,bx-ax));g.translate((ax+bx)/2+nx*m,(y0+y1)/2,(az+bz)/2+nz*m);return g;
}
// Skirting run a→b with its back on the wall line: only the front and top faces (back, bottom and ends are against the wall,
// the floor or the next run), 4 triangles, metre UVs.
export function skirtingGeo(a,b,[nx,nz],depth=.012,height=.08){
 const pos=[],nor=[],uv=[],index=[],L=Math.hypot(b[0]-a[0],b[1]-a[1]);
 const quad=(p,q,want,u)=>{const i=pos.length/3,e1=new THREE.Vector3(...p[1]).sub(new THREE.Vector3(...p[0])),e2=new THREE.Vector3(...p[2]).sub(new THREE.Vector3(...p[0]));
  for(const v of p){pos.push(...v);nor.push(...want);}uv.push(...u);index.push(...(e1.cross(e2).dot(new THREE.Vector3(...want))>0?[i,i+1,i+2,i,i+2,i+3]:[i,i+2,i+1,i,i+3,i+2]));};
 const fa=[a[0]+nx*depth,a[1]+nz*depth],fb=[b[0]+nx*depth,b[1]+nz*depth];
 quad([[fa[0],0,fa[1]],[fb[0],0,fb[1]],[fb[0],height,fb[1]],[fa[0],height,fa[1]]],0,[nx,0,nz],[0,0,L,0,L,height,0,height]);
 quad([[fa[0],height,fa[1]],[fb[0],height,fb[1]],[b[0],height,b[1]],[a[0],height,a[1]]],0,[0,1,0],[0,0,L,0,L,depth,0,depth]);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(index);return g;
}
export const merge=list=>{const g=mergeGeometries(list.filter(Boolean),false);list.forEach(q=>q&&q.dispose());return g;};
export function mesh(geometry,material,{cast=false,receive=true}={}){const q=new THREE.Mesh(geometry,material);q.castShadow=cast;q.receiveShadow=receive;return q;}

// Lever handle with a square rose on both faces of a leaf (leaf-local: hinge at x=0, leaf to x=w, faces at z=±half).
// 6 boxes, 72 triangles; built once per width and reused by every leaf.
const handles=new Map();
export function leverGeo(w,half=.019,y=1.02){
 const key=w+'|'+half+'|'+y;if(handles.has(key))return handles.get(key);
 const x=w-.075,parts=[];
 for(const s of [1,-1]){const f=v=>s*(half+v),z=(a,b)=>[Math.min(f(a),f(b)),Math.max(f(a),f(b))];
  let [a,b]=z(0,.008);parts.push(boxGeo(x-.025,y-.025,a,x+.025,y+.025,b));
  [a,b]=z(.008,.05);parts.push(boxGeo(x-.007,y-.007,a,x+.007,y+.007,b));
  [a,b]=z(.04,.058);parts.push(boxGeo(x-.13,y-.009,a,x+.007,y+.009,b));}
 const g=merge(parts);handles.set(key,g);return g;
}
// Floor door stop, 6 sides.
export function stopGeo(x,z){const g=new THREE.CylinderGeometry(.016,.02,.035,6);g.translate(x,.0175,z);return g;}
// Switch / socket: 86 mm plate with a raised key; local +z faces the room, back on the wall at z=0.
export function fixtureGeo(){return merge([boxGeo(-.043,-.043,0,.043,.043,.009),boxGeo(-.029,-.029,.009,.029,.029,.013)]);}
// Downlight: a 76 mm disc just under the ceiling, facing down.
export function downlightGeo(x,z,y=2.776){const g=new THREE.CircleGeometry(.038,10);g.rotateX(Math.PI/2);g.translate(x,y,z);return g;}
// Gathered curtain, one mesh: sine pleats across the width (pitch `pitch`), deeper towards the hem.
// Lies in a plane along a→b at y0…y1; depth `amp` swings either side of the line. Faces the left of a→b, i.e. (-dz, dx):
// list a and b so that side is the room. UVs: metres across, metres up.
export function curtainGeo([ax,az],[bx,bz],y0,y1,{pitch=.09,amp=.03}={}){
 const L=Math.hypot(bx-ax,bz-az),dx=(bx-ax)/L,dz=(bz-az)/L,nx=-dz,nz=dx,cols=Math.max(4,Math.round(L/pitch*4)),rows=[0,1];
 const pos=[],uv=[],index=[];
 for(const r of rows)for(let i=0;i<=cols;i++){const u=L*i/cols,y=y1-(y1-y0)*r,o=amp*(.8+.4*r)*Math.sin(2*Math.PI*u/pitch);pos.push(ax+dx*u+nx*o,y,az+dz*u+nz*o);uv.push(u,y);}
 for(let r=0;r<rows.length-1;r++)for(let i=0;i<cols;i++){const a=r*(cols+1)+i,b=a+1,c=a+cols+1,d=c+1;index.push(a,c,b,b,c,d);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(index);g.computeVertexNormals();return g;
}
