import * as THREE from 'three';
import {cutFabric} from './detail-kit.js?v=95ac5fde41';
// Soft furnishings and accessories (scene detail round 3): puffy cushions, a throw, made beds, rugs, lamps, prints, the entry
// joinery and the balcony rack. Plan metres like app.js. Parts reuse the home's materials wherever they can (same material,
// shadow flags as box()), so batchStatic() folds them into draw calls the groups already make. No light sources: lamps glow
// (MeshBasic, toneMapped:false) and the light they would throw is an additive patch on the floor or desk (pool()), so the light
// count, and with it every compiled shader, stays the same.

const cache=new Map(),once=(k,f)=>{if(!cache.has(k))cache.set(k,f());return cache.get(k);};
const steps=(a,b,n)=>Array.from({length:n+1},(_,i)=>a+(b-a)*i/n);
// Coffee table in front of the sofa: the original layout's footprint (layout-data.js ROOM_FURNITURE), now in every layout.
export const COFFEE=[8.39,8.99,9.11,9.71];
// Bounds of a mesh in its parent's frame, from its vertices (not the rotated bounding box).
function localBox(q){q.updateMatrix();const b=new THREE.Box3(),v=new THREE.Vector3(),p=q.geometry.attributes.position;for(let i=0;i<p.count;i++)b.expandByPoint(v.fromBufferAttribute(p,i).applyMatrix4(q.matrix));return b;}

// --- Geometry ------------------------------------------------------------------------------------------------------------
// Puffy pillow w (x) × t (y) × d (z): full thickness only in the middle, thin piped edge, pinched corners; UVs in metres.
export function pillowGeo(w,t,d,seg=5){return once(`pillow|${w}|${t}|${d}|${seg}`,()=>{
 const g=new THREE.BoxGeometry(w,t,d,seg,2,seg),p=g.attributes.position,uv=g.attributes.uv;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=Math.min(1,Math.abs(2*x/w)),c=Math.min(1,Math.abs(2*z/d)),f=Math.sqrt((1-a*a)*(1-c*c));
  p.setXYZ(i,x*(1-.07*c*c),y*(.22+.78*f),z*(1-.07*a*a));uv.setXY(i,x+y,z+y);}
 g.computeVertexNormals();return g;});}
// Cloth on a grid of flat (unstretched) coordinates a × b in metres; at(a,b) is the draped point. UVs are the flat coordinates,
// so the fabric texture keeps its real size. Faces up for a along +x and b along +z.
function cloth(as,bs,at){
 const P=[],U=[],I=[],n=as.length;for(const b of bs)for(const a of as){P.push(...at(a,b));U.push(a,b);}
 for(let j=0;j<bs.length-1;j++)for(let i=0;i<n-1;i++){const q=j*n+i,r=q+n;I.push(q,r,q+1,q+1,r,r+1);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.setIndex(I);g.computeVertexNormals();return g;}
// Overhang o past an edge: round a bend of radius R, then straight down. Returns [outward, down].
const bend=(o,R)=>o<=0?[0,0]:o<R*Math.PI/2?[R*Math.sin(o/R),R-R*Math.cos(o/R)]:[R,R+o-R*Math.PI/2];
// Cloth lying at height y over x ∈ [-h, h] and z up to zf (when foot), hanging D past the sides (and the foot); a slight dome
// across the width and soft waves in the hanging parts. reach = flat length that hangs.
function drape({h,zf,y,R,D,puff=0,wave=0,foot=true}){
 return {reach:D-R+R*Math.PI/2,at(a,b){
  const oa=Math.abs(a)-h,ob=foot?b-zf:-1,[ha,va]=bend(oa,R),[hb,vb]=bend(ob,R),s=Math.sign(a)||1,dome=puff*Math.max(0,1-(a/h)**2)*Math.min(1,Math.max(0,foot?(zf-b)/.15:1));
  const wa=oa>0?wave*Math.min(1,oa/.12)*Math.sin(b*13+a*3):0,wb=ob>0?wave*Math.min(1,ob/.12)*Math.sin(a*13+b*3):0;
  return [s*(Math.min(Math.abs(a),h)+ha+wa),y+dome-Math.max(va,vb),(foot?Math.min(b,zf):b)+hb+wb];}};}
// Flat coordinates across a drape: hanging, top, hanging again.
const across=(h,reach,n,m)=>[...steps(-h-reach,-h,m).slice(0,-1),...steps(-h,h,n),...steps(h,h+reach,m).slice(1)];
// Polyline in a plane (u, y) from points and arcs [cu, cy, r, a0, a1]; at(b) by arc length, marks = lengths at the points.
function path(parts,step=.012){const out=[];
 for(const p of parts){if(p.arc){const [cu,cy,r,a0,a1]=p.arc,n=Math.max(2,Math.ceil(Math.abs(a1-a0)*r/step));for(let i=1;i<=n;i++){const a=a0+(a1-a0)*i/n;out.push([cu+r*Math.cos(a),cy+r*Math.sin(a)]);}}
  else{const last=out[out.length-1];if(!last){out.push(p);continue;}const n=Math.max(1,Math.ceil(Math.hypot(p[0]-last[0],p[1]-last[1])/(step*4)));for(let i=1;i<=n;i++)out.push([last[0]+(p[0]-last[0])*i/n,last[1]+(p[1]-last[1])*i/n]);}}
 const len=[0];for(let i=1;i<out.length;i++)len.push(len[i-1]+Math.hypot(out[i][0]-out[i-1][0],out[i][1]-out[i-1][1]));
 return {marks:len,at(b){let i=1;while(i<len.length-1&&len[i]<b)i++;const t=Math.min(1,Math.max(0,(b-len[i-1])/((len[i]-len[i-1])||1)));return [out[i-1][0]+(out[i][0]-out[i-1][0])*t,out[i-1][1]+(out[i][1]-out[i-1][1])*t];}};}
// Leaf blade along +z from its stalk at the origin, 1 m long: pointed oval, folded along the midrib, arched; both faces, 40 triangles.
function leafGeo(){return once('leaf',()=>{const as=[-1,0,1],bs=steps(0,1,5),at=(a,b)=>{const w=.23*Math.sin(Math.PI*Math.min(1,b*1.04))**.8;return [a*w,.09*Math.sin(Math.PI*b*.9)-.06*b*b-Math.abs(a)*w*.35,b];};
 const top=cloth(as,bs,at),bottom=cloth([...as].reverse(),bs,(a,b)=>{const p=at(a,b);p[1]-=.006;return p;}),g=new THREE.BufferGeometry(),n=top.attributes.position.count;
 for(const [k,s] of [['position',3],['normal',3],['uv',2]])g.setAttribute(k,new THREE.Float32BufferAttribute([...top.attributes[k].array,...bottom.attributes[k].array],s));
 g.setIndex([...top.index.array,...[...bottom.index.array].map(i=>i+n)]);return g;});}

// --- Made bed ----------------------------------------------------------------------------------------------------------------
// In the bed's own frame: mattress width W across x, length L along z, head at z = -L/2, mattress top at y = T. A duvet hanging
// 15 cm below the mattress top over both sides and the foot, with the white top sheet turned down over it for 0.32 m below the pillows (a rolled lip),
// a runner across the foot, two pillows against the headboard and two cushions leaning on them. fit = the frame's half width and
// half length: the hanging cloth (gap, bend, waves, outer layers) stays inside it.
export function bedding(parent,{width:W,length:L,top:T,M,scarf=M.terracotta,fit=[W/2+.06,L/2+.06]}){
 const add=(g,m)=>{const q=new THREE.Mesh(g,m);q.castShadow=true;q.receiveShadow=true;parent.add(q);return q;};
 const room=Math.max(.012,Math.min(fit[0]-W/2,fit[1]-L/2)),wave=Math.min(.008,room*.15),R=Math.min(.035,room*.5),dl=Math.min(.012,room*.2),gap=Math.max(.002,room-R-wave-dl);
 const h=W/2+gap,zf=L/2+gap,D=.2,th=.05,z0=-L/2+.58;
 const duvet=drape({h,zf,y:T+th,R,D,puff:.015,wave}),A=across(h,duvet.reach,8,5);
 add(cloth(A,[...steps(z0,zf,7),...steps(zf,zf+duvet.reach,5).slice(1)],duvet.at),M.linen).name='duvet';
 const t=.03,fh=h+dl/2,fold=drape({h:fh,zf,y:T+th+t,R:R+dl/2,D:D-.03,puff:.015}),F=.32,lip=Math.PI*t/2,k=(h+duvet.reach)/(fh+fold.reach);
 add(cloth(across(fh,fold.reach,8,5),[...steps(z0-lip,z0,3).slice(0,-1),...steps(z0,z0+F,4)],(a,b)=>{if(b>=z0)return fold.at(a,b);
  const c=(z0-b)/lip*Math.PI,p=duvet.at(a*k,z0),q=fold.at(a,z0),d=[0,1,2].map(i=>(q[i]-p[i])/2),l=Math.hypot(...d);
  return [0,1,2].map(i=>(p[i]+q[i])/2+d[i]*Math.cos(c)-(i===2?l*Math.sin(c):0));}),M.white).name='duvet-fold';
 const sh=h+dl/2,run=drape({h:sh,zf:L,y:T+th+.012,R:R+dl/2,D:D-.04,puff:.015,wave:Math.min(.004,wave)}),zs=L/2-.66;
 add(cloth(across(sh,run.reach,8,5),steps(zs,zs+.46,3),run.at),scarf).name='bed-runner';
 // Pillows placed by their bounds: resting on the mattress against the headboard (back row), the cushions on the pillows.
 const rest=(q,x,tilt,yaw,minZ)=>{q.rotation.set(tilt,yaw,0,'YXZ');q.position.set(x,0,0);const b=localBox(q);q.position.y=T+.003-b.min.y;q.position.z=minZ-b.min.z;return localBox(q);};
 const pw=+Math.min(.7,(W-.08)/2).toFixed(3),cw=+Math.min(.4,(W-.24)/2).toFixed(3),front=scarf===M.olive?M.terracotta:M.olive;
 for(const s of [-1,1]){const back=add(pillowGeo(pw,.17,.46),M.linen),bb=rest(back,s*W/4,.52,s*.03,-L/2+.012);back.name='pillow';
  const c=add(pillowGeo(cw,.14,.36),front);rest(c,s*W/4.3,.8,-s*.05,bb.min.z+(bb.max.z-bb.min.z)*.5);c.name='pillow';}
}

// --- Furnishing layer ------------------------------------------------------------------------------------------------------
export function createFurnishing({box,cyl,rod,mat,M,clipPlane,rug,vase,contacts,oakCut,soft=false}){
 const cut={clippingPlanes:[clipPlane]};
 // Lamp shades and LED lines: glow in the shared furnishing, glowCut for the lamps in the layouts' rooms (the original master's
 // reading lights hang above 1.28 m), so each group adds one draw call for its lamps; brassCut for brass above 1.28 m.
 // The furnishing's own materials are named furnish-* (check:furnish caps their draw calls).
 const glow=new THREE.MeshBasicMaterial({name:'furnish-glow',color:'#fff1d8',toneMapped:false}),glowCut=new THREE.MeshBasicMaterial({name:'furnish-glow-cut',color:'#fff1d8',toneMapped:false,...cut});
 const brassCut=new THREE.MeshStandardMaterial({name:'furnish-brass-cut',color:'#ad8e54',roughness:.28,metalness:.65,...cut});
 // Mirror: metal for the reflection plus a soft emissive sheen, so it reads as glass rather than a dark panel; also its frame and the
 // hooks. Software tier: matte (no envMap, which that tier attaches to every metal or glossy finish and samples per pixel).
 let mirrorMat=null;const mirror=()=>mirrorMat||(mirrorMat=new THREE.MeshStandardMaterial({name:'furnish-mirror',color:'#e8eeec',roughness:soft?.4:.05,metalness:soft?0:1,emissive:'#ffffff',emissiveMap:sheen(),emissiveIntensity:soft?.75:.9,...cut}));
 // Prints: four compositions in one canvas, one material for every print (cut with the walls).
 let printMat=null;const prints=()=>printMat||(printMat=new THREE.MeshStandardMaterial({name:'furnish-print',map:atlas(),roughness:.86,...cut}));
 // Light patches: additive, unlit, one material (vertex colours carry each patch's strength).
 let poolMat=null;const pools=()=>poolMat||(poolMat=new THREE.MeshBasicMaterial({name:'furnish-light',map:falloff(),vertexColors:true,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-6}));
 const unlit=q=>{q.castShadow=false;q.name='lamp-glow';return q;};
 // An elliptical patch of light w × d on a horizontal surface at height y; strength ≈ linear light added at the centre.
 function pool(parent,x,y,z,w,d,strength){const g=new THREE.PlaneGeometry(w,d);g.rotateX(-Math.PI/2);g.translate(x,y,z);const c=new THREE.Color('#ffe6bf').multiplyScalar(strength),n=g.attributes.position.count;
  g.setAttribute('color',new THREE.Float32BufferAttribute(Array.from({length:n},()=>[c.r,c.g,c.b]).flat(),3));const q=new THREE.Mesh(g,pools());q.renderOrder=2;q.name='light-pool';parent.add(q);return q;}
 // Puffy cushion on a seat at height seat, its back on a backrest plane at back (x or z = back), facing dir (±1) along axis.
 function cushion(parent,{x,z,seat,back,axis='x',dir=1,w=.46,m,lean=.3,yaw=0}){
  const q=new THREE.Mesh(pillowGeo(w,.17,w),m),face=axis==='x'?(dir>0?0:Math.PI):(dir>0?-Math.PI/2:Math.PI/2);q.castShadow=true;q.receiveShadow=true;q.name='cushion';
  q.quaternion.setFromEuler(new THREE.Euler(0,face+yaw,0)).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0,0,-(Math.PI/2-lean))));q.position.set(x,0,z);
  const b=localBox(q);q.position.y=seat+.003-b.min.y;if(axis==='x')q.position.x+=dir>0?back+.004-b.min.x:back-.004-b.max.x;else q.position.z+=dir>0?back+.004-b.min.z:back-.004-b.max.z;parent.add(q);return q;}
 // Wall sconce: plate on the wall at (x, z) facing (nx, nz), an arm and a glowing shade; all below 1.28 m.
 function sconce(parent,x,y,z,nx,nz){box(x+nx*.009,y-.055,z+nz*.009,nx?.018:.075,.11,nx?.075:.018,M.brass,parent);box(x+nx*.069,y-.006,z+nz*.069,nx?.102:.012,.012,nx?.012:.102,M.brass,parent);
  unlit(cyl(x+nx*.125,y-.075,z+nz*.125,.06,.12,glowCut,parent,.045));}
 // Table lamp: base, stem, glowing drum shade.
 function tableLamp(parent,x,y,z,h=.42){cyl(x,y,z,.075,.02,M.brass,parent);cyl(x,y+.02,z,.009,h-.17,M.brass,parent);unlit(cyl(x,y+h-.17,z,.1,.16,glowCut,parent,.075));}
 // Framed print centred at (x, y, z) on a wall face, facing (nx, nz); w × h, composition k (0–3). Cut with the walls.
 function print(parent,x,y,z,w,h,nx,nz,k){box(x+nx*.015,y-h/2,z+nz*.015,nx?.03:w,h,nx?w:.03,oakCut(),parent);
  const g=new THREE.PlaneGeometry(w-.07,h-.07),uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,(k%2+uv.getX(i))/2,(Math.floor(k/2)+uv.getY(i))/2);
  g.rotateY(Math.atan2(nx,nz));g.translate(x+nx*.0312,y,z+nz*.0312);const q=new THREE.Mesh(g,prints());q.receiveShadow=true;q.name='print';parent.add(q);return q;}
 function floorLamp(parent,x,z,h){cyl(x,0,z,.15,.025,M.dark,parent,.16);cyl(x,.025,z,.011,h-.3,M.brass,parent);unlit(cyl(x,h-.29,z,.19,.29,glow,parent,.17));}

 const api={
  // Leafy pot plant: a trunk with broad blades growing from it in a spiral (golden angle), the lower ones drooping. The trunk takes
  // box()'s shadow flags, so it batches with the dark parts a group already has; pot and leaf tones can be the group's own (lobby).
  plant(x,z,h=1,parent,{pot=mat('#c4ba9f',.88),tones=['#859569','#6b8055']}={}){cyl(x,0,z,.22,h*.25,pot,parent,.26);cyl(x,h*.25-.03,z,.235,.02,M.dark,parent);const rng=seed(Math.round((x+z)*100)),top=h*.95,stem=(a,b,r)=>{rod(a,b,r,M.dark,parent).receiveShadow=true;};
   stem([x,h*.2,z],[x+.02,top*.9,z-.015],.014);const n=Math.round(9+7*h);
   for(let i=0;i<n;i++){const t=i/(n-1),y=h*.32+(top-h*.32)*t,a=i*2.4+rng()*.4,len=(.2+.12*h)*(1-.35*t)*(.85+.3*rng()),pitch=-.55+.9*t+rng()*.25,dx=Math.cos(a),dz=Math.sin(a),s=.012;
    const base=[x+dx*s,y,z+dz*s];
    const q=new THREE.Mesh(leafGeo(),mat(tones[i%tones.length],.95));q.position.set(...base);q.rotation.set(-pitch,Math.atan2(dx,dz),0,'YXZ');q.scale.setScalar(len);q.castShadow=true;q.receiveShadow=true;q.name='leaf';parent.add(q);}},
  // Owner's living room (both B units: built before the right-hand unit is cloned): puffy cushions against the back, a throw
  // over the south arm, a floor lamp at the north arm.
  sofa(parent){
   for(let i=0;i<3;i++)cushion(parent,{x:7.12,z:8.17+i*.85,seat:.57,back:6.985,dir:1,m:i===1?M.terracotta:M.olive,lean:.32,yaw:(i-1)*.07});
   // Arm 6.8–7.8 × 10.22–10.38, top 0.75, 5 cm round: from the seat cushion, up the arm's inner face, over it and down the outside.
   const p=path([[9.95,.578],[10.164,.579],{arc:[10.164,.629,.05,-Math.PI/2,0]},[10.214,.7],{arc:[10.27,.7,.056,Math.PI,Math.PI/2]},[10.33,.756],{arc:[10.33,.7,.056,Math.PI/2,0]},[10.386,.66],[10.386,.4]]);
   const g=cloth(steps(7.25,7.75,7),p.marks.filter((_,i,a)=>i%2===0||i===a.length-1),(a,b)=>{const [u,y]=p.at(b),hang=Math.max(0,.7-y)/.3,out=u>10.3?1:0;return [a+.012*Math.sin(b*7)*hang,y-.035*hang*Math.sin(a*9)**2*out,u+out*.014*hang*Math.sin(a*17)];});
   const q=new THREE.Mesh(g,M.terracotta);q.castShadow=true;q.receiveShadow=true;q.name='throw';parent.add(q);
   floorLamp(parent,7.08,7.42,1.62);},
  // Entry (both B units): floating shoe cabinet with doors on the old bench's footprint (collision unchanged), its LED line and
  // the light it throws on the floor; a long mirror on the north wall (clear of the door and not facing it), a polished hook rail
  // with a bag by the door, a mat inside it (below the leaf) and the downlights' light on the floor.
  entry(parent){
   box(10.3475,.15,3.605,.395,.78,1.09,M.oak,parent,.01);box(10.3375,.93,3.605,.415,.025,1.1,M.stone,parent);
   for(const z of [3.335,3.875]){box(10.14,.165,z,.018,.745,.533,M.white,parent,.006);box(10.124,.62,z+(z<3.6?.21:-.21),.014,.16,.016,M.brass,parent);}
   unlit(box(10.17,.142,3.605,.012,.006,1.04,glow,parent));
   box(9.29,.3,1.208,.62,1.56,.016,mirror(),parent);box(9.29,.33,1.219,.56,1.5,.006,mirror(),parent).name='mirror';
   box(8.958,1.58,1.85,.016,.07,.62,mirror(),parent);for(let i=0;i<4;i++){const z=1.61+i*.16;box(8.995,1.6,z,.058,.022,.022,mirror(),parent);box(9.019,1.6,z,.01,.045,.026,mirror(),parent);}
   const bag=cutFabric(M,clipPlane);box(9.03,1.42,1.77,.012,.2,.022,bag,parent);box(9.061,1.08,1.77,.07,.34,.36,bag,parent,.012);
   box(10.09,0,2.0,.68,.011,.86,M.walnut,parent,.004).name='doormat';
   // The LED's and the downlights' patches (not on the software tier: blended fill for a small gain at desktop size).
   if(!soft){pool(parent,10.2,.002,3.6,.7,1.5,.06);pool(parent,9.75,.002,1.75,1.3,1.1,.06);pool(parent,9.75,.002,2.65,1.3,1.1,.06);}},
  // Smart lock on an entry leaf (doorway()'s hinge group): a tall body on each face at the latch edge, around the lever; keypad
  // outside, thumb-turn inside. Brass and shadow flags like the lever, so the leaf still batches to its two meshes.
  smartLock(door){const hinge=door.children.find(c=>c.userData.doorLeaf),x=hinge.children[0].geometry.parameters.width-.075;
   const at=(...a)=>{box(...a,M.brass,hinge).receiveShadow=false;};for(const s of [1,-1])at(x,.86,s*.025,.064,.5,.012);
   for(let r=0;r<4;r++)for(let c=0;c<3;c++)at(x-.018+c*.018,1.14+r*.024,.032,.011,.011,.003);at(x,.93,-.035,.03,.05,.008);return door;},
  // Owner's coffee table (stone on walnut, a vase), the same in every layout: in the owner's shared group after the right-hand unit
  // is cloned, so its parts join draw calls that already span the living room (in a layout's group, which mostly lives in the
  // bedrooms, they would stretch those batches into every view). Around the vase: a tray with a cup, two books laid tangentially.
  table(parent){cyl(8.75,.31,9.35,.36,.045,M.stone,parent);cyl(8.75,.035,9.35,.13,.275,M.walnut,parent);vase(8.75,.355,9.35,parent);
   cyl(8.94,.355,9.46,.11,.016,M.walnut,parent,.1);cyl(8.96,.371,9.45,.035,.07,M.white,parent,.03);
   box(8.58,.355,9.18,.25,.03,.17,M.olive,parent,.004).rotation.y=Math.PI/4;box(8.584,.385,9.176,.22,.026,.15,M.terracotta,parent,.004).rotation.y=Math.PI/4+.22;},
  // Per layout, inside the layout's own group (owner only): bedroom rugs, lamps and prints; the concept layouts' coffee-table patch
  // (the original layout's comes from its footprints, light-layer.js).
  rooms(id,group){if(!BEDROOMS[id])return;if(id!=='original')contacts([COFFEE],group);
   for(const r of BEDROOMS[id]){if(r.rug)rug((r.rug[0]+r.rug[2])/2,(r.rug[1]+r.rug[3])/2,r.rug[2]-r.rug[0],r.rug[3]-r.rug[1],'#c6c6af');
    if(r.print)print(group,...r.print);for(const s of r.sconces||[])sconce(group,...s);if(r.lamp)tableLamp(group,...r.lamp);}},
  // The original master's two reading lights over the pillows (round 1), now lit: wall bracket, brass stem above the headboard and
  // a glowing head, cut with the walls.
  readingLights(cz,parent){for(const z of [cz-.62,cz+.62]){box(.1255,1.2,z,.051,.02,.02,brassCut,parent);box(.16,1.09,z,.018,.26,.018,brassCut,parent);unlit(box(.20,1.27,z,.06,.08,.07,glowCut,parent));}},
  // Gaming desk: a desk lamp at one end (side −1 left, +1 right, seen from the chair), the light it throws on the top (bright
  // under the lamp, faint along the desk) and on the floor where the chair stands. Desk frame: centre (cx, cz), long axis along
  // x when rot = 0 (wall side −z), length × depth, top at y = top.
  desk(group,{cx,cz,rot,length,depth,top,side=-1,floor=1.3}){const g=new THREE.Group();g.position.set(cx,0,cz);g.rotation.y=rot;group.add(g);const u=side*(length/2-.13),v=-depth/2+.12,pw=length*.9;
   cyl(u,top,v,.07,.018,M.metal,g);cyl(u,top+.018,v,.008,.42,M.metal,g);box(u,top+.43,v+.13,.016,.016,.26,M.metal,g);
   cyl(u,top+.37,v+.27,.075,.07,M.metal,g,.04);unlit(cyl(u,top+.365,v+.27,.072,.005,glowCut,g));
   // Patches just above the desk mat (11 mm) and above a tiled floor (14 mm), so neither hides them.
   const pu=side*Math.max(length/2-.47,0);pool(g,pu,top+.013,0,.9,depth-.04,.1);pool(g,side*(length/2-pw/2-.02),top+.013,0,pw,depth-.04,.035);pool(g,0,.016,depth/2+.35,length+.3,floor,.08);return g;},
  // Balcony ceiling (roof group, only shown indoors): a lifting drying rack clear of the locked laundry corner, in the dining
  // pendant's dark metal, and a flush light in the downlights' material.
  balcony(roof,ceilingGlow){const y=2.78;rod([6.75,y-.025,12.5],[8.65,y-.025,12.5],.025,M.dark,roof);
   for(const x of [6.95,8.45]){rod([x,y-.05,12.5],[x,2.34,12.5],.012,M.dark,roof);rod([x,2.32,12.2],[x,2.32,12.8],.02,M.dark,roof);}
   for(const z of [12.26,12.42,12.58,12.74])rod([6.8,2.31,z],[8.6,2.31,z],.011,M.dark,roof);
   cyl(5.3,y-.045,12.5,.17,.045,M.white,roof);const g=new THREE.CircleGeometry(.14,20);g.rotateX(Math.PI/2);g.translate(5.3,y-.047,12.5);const q=new THREE.Mesh(g,ceilingGlow);q.name='balcony-light';roof.add(q);},
  // Neighbours, light touch: two cushions and a floor lamp in the A living room (left A unit, before it is cloned).
  neighbourA(parent){for(const [z,m] of [[10.62,M.terracotta],[11.92,M.olive]])cushion(parent,{x:14.05,z,seat:.57,back:14.21,dir:-1,m,lean:.3});floorLamp(parent,14.2,9.75,1.58);},
  // Lift lobbies, both sides: a plant in a stone planter by the window, one leaf tone (one extra draw call for the common area),
  // and a mat in front of the lift.
  lobby(parent){for(const X of [x=>x,x=>41.8-x]){api.plant(X(14.15),-.85,.95,parent,{pot:M.stone,tones:['#7d9163']});box(X(12.85),0,-1.22,1.2,.011,.55,M.dark,parent,.004);}}};
 return api;
}
function seed(n){let a=n>>>0;return()=>{a=(a*1664525+1013904223)>>>0;return a/4294967296;};}

// Owner bedrooms per layout. rug [x0,z0,x1,z1] (beside or at the foot of the bed, clear of wardrobes, desks and door sweeps);
// print [x,y,z,w,h,nx,nz,k] centred on the bed's head wall above the headboard; sconces [x,y,z,nx,nz] beside or above the
// headboard, below 1.28 m; lamp [x,y,z] on a table (tableLamp()). The original master's lamps are its reading lights (readingLights()).
// Positions follow v15 (e6f7223): the original north room's desk became a wardrobe, C's south bed is centred at z 10.01.
// Rooms that already have a rug or print (ROOM_DECOR, the original master) get none here. check:furnish verifies placement.
const NW={room:'child',rug:[.5,4.64,1.75,5.2],print:[.1,1.36,3.8,.7,.5,1,0,1],sconces:[[.1,.98,2.92,1,0],[.1,.98,4.68,1,0]]};
const MASTER={room:'master',rug:[1.75,8.6,3.2,11.0],sconces:[[.1085,1.0,9.18,1,0],[.1085,1.0,10.42,1,0]]};
export const BEDROOMS={
 original:[{room:'south',print:[3.5,1.55,9.8,.9,.6,1,0,0],sconces:[[3.5,.98,8.65,1,0],[3.5,.98,10.95,1,0]]},
  {room:'north',rug:[4.28,4.5,5.22,4.95],print:[3.0,1.3,3.8,.6,.45,1,0,2],sconces:[[3.0,1.0,4.25,1,0]]}],
 balanced:[MASTER,NW],
 family:[MASTER,NW,{room:'north',rug:[3.65,4.5,5.22,4.95],print:[3.0,1.3,3.8,.6,.45,1,0,3],sconces:[[3.0,1.0,4.25,1,0]]}],
 central:[{room:'south',sconces:[[6.4915,1.0,9.39,-1,0],[6.4915,1.0,10.63,-1,0]]},{...MASTER,rug:[1.75,8.6,3.0,11.0]},NW]
};

// Canvas textures, made on first use (node checks build the scene without a DOM canvas).
function atlas(){const c=document.createElement('canvas');c.width=c.height=512;const a=c.getContext('2d'),t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;if(!a?.arc)return t;
 const q=(i,f)=>{a.save();a.translate((i%2)*256,(1-Math.floor(i/2))*256);a.beginPath();a.rect(0,0,256,256);a.clip();f();a.restore();};
 q(0,()=>{a.fillStyle='#ece6d8';a.fillRect(0,0,256,256);for(const [x,y,r,c] of [[86,150,58,'#7f8f73'],[150,120,72,'#c9ab80'],[190,82,40,'#a7714f']]){a.fillStyle=c;a.globalAlpha=.88;a.beginPath();a.arc(x,y,r,0,7);a.fill();}});
 q(1,()=>{a.fillStyle='#efe9dc';a.fillRect(0,0,256,256);a.fillStyle='#c98f63';a.beginPath();a.arc(170,92,30,0,7);a.fill();for(const [y,c] of [[150,'#9fae95'],[176,'#7d8d70'],[204,'#c5b08f']]){a.fillStyle=c;a.beginPath();a.moveTo(0,256);a.lineTo(0,y);for(let x=0;x<=256;x+=16)a.lineTo(x,y-14*Math.sin(x/40+y));a.lineTo(256,256);a.fill();}});
 q(2,()=>{a.fillStyle='#f0ebe0';a.fillRect(0,0,256,256);a.strokeStyle='#6f7f62';a.lineWidth=3;a.beginPath();a.moveTo(128,226);a.quadraticCurveTo(122,130,140,40);a.stroke();for(let i=0;i<6;i++){const y=200-i*28,s=i%2?1:-1;a.fillStyle=i%2?'#8c9b7b':'#a9b596';a.beginPath();a.ellipse(128+s*24,y,30,11,s*.5,0,7);a.fill();}});
 q(3,()=>{a.fillStyle='#e9e2d4';a.fillRect(0,0,256,256);for(const [x,y,w,h,c] of [[30,40,110,150,'#b69a74'],[120,90,100,120,'#7f8f73'],[60,170,150,50,'#c27f5a']]){a.fillStyle=c;a.globalAlpha=.85;a.fillRect(x,y,w,h);}});
 t.needsUpdate=true;return t;}
function sheen(){const c=document.createElement('canvas');c.width=64;c.height=256;const a=c.getContext('2d'),t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
 if(a?.createLinearGradient){const g=a.createLinearGradient(0,0,0,256);g.addColorStop(0,'#e3e7e4');g.addColorStop(.55,'#c9cfcc');g.addColorStop(1,'#a9b1ae');a.fillStyle=g;a.fillRect(0,0,64,256);
  a.fillStyle='rgba(255,255,255,.35)';for(const [y,h] of [[40,70],[130,24]]){a.beginPath();a.moveTo(0,y+40);a.lineTo(64,y);a.lineTo(64,y+h);a.lineTo(0,y+h+40);a.fill();}t.needsUpdate=true;}return t;}
function falloff(){const c=document.createElement('canvas');c.width=c.height=128;const a=c.getContext('2d'),t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
 if(a?.createRadialGradient){const g=a.createRadialGradient(64,64,0,64,64,64);for(const [s,v] of [[0,1],[.45,.76],[.78,.36],[1,0]])g.addColorStop(s,`rgb(${v*255|0},${v*255|0},${v*255|0})`);a.fillStyle=g;a.fillRect(0,0,128,128);t.needsUpdate=true;}return t;}
