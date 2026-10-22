import * as THREE from 'three';
import {mergeGeometries} from './utils/BufferGeometryUtils.js?v=fda7e946b8';
import {metricBoxUV} from './metric-uv.js?v=ff624541bd';
// Kitchen and bathroom fit-out (scene detail round 3). The water points, worktops, sanitaryware and shower screens stay
// exactly as app.js builds them (hashed in services-lock.json); this module only adds around them, after they exist,
// on the owner's CAD walls (layout-original.json; the central set is identical in these rooms):
// - kitchen: integrated ceiling at 2.40 m with its bulkhead to the dining side, the drain stack (CAD wD2) boxed in,
//   wall cabinets on the hob wall up to that ceiling (the existing white cabinet joins the run behind their doors),
//   a hood over the hob, LED strips under the cabinets, a tall oven / microwave column beside the fridge, a few things
//   on the worktop;
// - both bathrooms: the same ceiling, a mirror cabinet over the basin (on the wall the CAD basin backs onto) with a light
//   bar, a towel rail clear of the door, the floor drains at the CAD points, wall tiles (retile(): the faces of the
//   batched walls that look into a bathroom move to a tile material, so tiling adds no overdraw).
// Parts are batched per room and material with app.js batchStatic() (each room's meshes frustum-cull on their own, and a room
// out of sight behind walls is not drawn while walking), cut with the walls above 1.28 m, and lit only by emissive (unlit,
// not tone-mapped) strips: no light sources. Cabinet doors and handles take the home's finishes when given (materials).
// Neighbours get wall cabinets and mirror cabinets only, in one vertex-coloured mesh per unit. Plan metres (x east, z south);
// the right-hand units mirror at x = 41.8.

export const CEILING=2.4;
const TOP=.895,UP=1.51;
export const KITCHEN={rect:[6.55,.3,8.85,3.1],wall:6.55,front:6.88,pipe:[6.55,.3,6.72,.46],uppers:[[.46,1.15]],hood:[1.15,1.75],
 locked:[6.6,1.75,6.86,2.89],tall:[8.22,1.7,8.85,2.31],opening:[7.2,3.07,8.8,3.13]};
// Wet rooms: the bathrooms (and the vanity niche outside the inner bathroom's door) whose walls are tiled, ceiling boxes, the
// mirror cabinet (on the wall line x facing dir, centre z, width w), towel rail [from, to] and drains (CAD points).
export const BATHS=[
 {id:'bath1',rooms:[[.1,5.95,1.7,8.05],[0,5.95,.1,6.75]],ceiling:[[.08,5.95,1.7,8.05]],mirror:{x:.1,dir:1,z:7.55,w:.7},
  rail:[[1.635,1.2,6.45],[1.635,1.2,7]],railWall:[1.7,'x'],drains:[[.5,6.25],[.4,7.08]],light:[.95,7]},
 {id:'bath2',rooms:[[5.4,3.15,7,4.85],[5.4,2.55,6.35,3.15],[6.3,4.95,7,5.75]],ceiling:[[5.4,3.15,7,4.85],[5.4,2.55,6.35,3.15]],mirror:{x:7,dir:-1,z:5.37,w:.7},
  rail:[[6.42,1.15,4.785],[6.95,1.15,4.785]],railWall:[4.85,'z'],drains:[[6.55,3.45]],light:[6.2,4.4]}
];
const C={white:'#ecebe4',wood:'#c8ae8a',grey:'#a6aaa6',dark:'#1d2322',glass:'#2a3231',face:'#c9d3d2',board:'#c8a576',plinth:'#7d817c',cream:'#e7e1d3',amber:'#a97a45',cap:'#2c2e2b',red:'#9e4a3b',steel:'#c3c6c2',joint:'#76736b'};

const box=(x0,y0,z0,x1,y1,z1)=>metricBoxUV(new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0)).translate((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);
function cyl(x,y0,z,r,h,rt=r,n=12){const g=new THREE.CylinderGeometry(rt,r,h,n);g.translate(x,y0+h/2,z);return g;}
function rodGeo(a,b,r){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A),g=new THREE.CylinderGeometry(r,r,d.length(),8);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize()));g.translate(...A.add(B).multiplyScalar(.5).toArray());return g;}
function paint(g,hex){const c=new THREE.Color(hex),n=g.attributes.position.count,a=new Float32Array(n*3);for(let i=0;i<n;i++)a.set([c.r,c.g,c.b],i*3);g.setAttribute('color',new THREE.BufferAttribute(a,3));return g;}
// A plan box seen from a wall: u along the wall, v out of it (dir = +1 / -1 for the room side), y up.
const onX=(x,dir)=>(z0,z1,d0,d1,y0,y1)=>box(Math.min(x+dir*d0,x+dir*d1),y0,z0,Math.max(x+dir*d0,x+dir*d1),y1,z1);
// Drops one face of a box (behind doors it would be shaded for nothing on a software rasteriser): px nx py ny pz nz.
const shut=(g,face)=>{const n=['px','nx','py','ny','pz','nz'].indexOf(face),i=[...g.index.array];g.setIndex(i.filter((_,k)=>Math.floor(k/6)!==n));return g;};
const onZ=(z,dir)=>(x0,x1,d0,d1,y0,y1)=>box(x0,y0,Math.min(z+dir*d0,z+dir*d1),x1,y1,Math.max(z+dir*d0,z+dir*d1));

// A cut twin of a home material: the same colour object (palettes apply); maps, finish and visibility follow the source (sync()
// before each frame), except the keys in `own`. On software rendering the twin is matte (Lambert): there every pixel of these
// fittings is shaded on top of the wall behind it, so they get the cheapest lit shading.
function twin(src,clipPlane,own={},matte=false){const m=matte?new THREE.MeshLambertMaterial({map:src.map,transparent:src.transparent,opacity:src.opacity}):src.clone();m.color=src.color;m.clippingPlanes=[clipPlane];m.visible=src.visible;
 for(const [k,v] of Object.entries(own))if(k in m)m[k]=v;m.userData.twinOf=src;m.userData.own=Object.keys(own);return m;}
const FOLLOW=['map','roughness','metalness','roughnessMap','bumpMap','normalMap','visible'];
function follow(m){const s=m.userData.twinOf;if(!s)return;let swap=false;for(const k of FOLLOW){if(!(k in m)||!(k in s)||m.userData.own.includes(k)||m[k]===s[k])continue;if(k.endsWith('Map')||k==='map')swap=swap||!m[k]!==!s[k];m[k]=s[k];}if(swap)m.needsUpdate=true;}

// materials: {door, handle} or {door, handles:{bar, knob, pull}} from the home's finishes (cabinet doors and bodies, handles;
// the three handle styles are all built, each preset shows one by its material's visibility). Without them: the home's oak,
// and dark pulls in the matte finish. plans: the wall sets' plan data, for the line-of-sight culling of the rooms.
export function createWetRooms({M,clipPlane,envMap,owner,arch,walls,plans=[],neighbours={},collisions,batch,materials={},soft=false}){
 const roomOf=(px,pz)=>BATHS.find(b=>b.rooms.some(([a,c,d,e])=>px>a+1e-4&&px<d-1e-4&&pz>c+1e-4&&pz<e-1e-4))?.id;
 const cut={clippingPlanes:[clipPlane]},T=(src,own)=>twin(src,clipPlane,own,soft),H=materials.handles||(materials.handle?{one:materials.handle}:{});
 // Per room at most: cabinet finish, one vertex-coloured matte finish for everything else that is lit (white, steel, glass,
 // jars…; not metallic, so software rendering gives it no environment map), handles, emissive strips, the mirror. Each is a
 // draw call. Wall tiles are drawn with the walls. The mirror reflects the room environment at full strength; software rendering
 // dims every reflection to the indoor environment level (app.js), so there its base glow is brighter.
 const W={door:T(materials.door||M.oak),tint:soft?new THREE.MeshLambertMaterial({vertexColors:true,...cut}):new THREE.MeshStandardMaterial({vertexColors:true,roughness:.5,...cut}),
  glow:new THREE.MeshBasicMaterial({vertexColors:true,toneMapped:false,...cut}),mirror:new THREE.MeshStandardMaterial({color:'#e2e8e6',metalness:1,roughness:.03,envMap:envMap||null,emissive:soft?'#7b8584':'#465050',...cut}),
  tile:T(M.tile,{roughness:.42}),...Object.fromEntries(Object.entries(H).map(([k,m])=>['h'+k,T(m)]))};
 const out={materials:W,groups:{},tiles:[]};
 // One group per room, one mesh per part; batch() (app.js batchStatic) then merges each group by material.
 let group=null;
 const add=(key,kind,g,hex)=>{if(key==='white'||key==='steel'){hex??=C[key];key='tint';}if(hex)paint(g,hex);const q=new THREE.Mesh(g,W[key]);q.name=kind;q.castShadow=q.receiveShadow=true;group.add(q);return q;};
 const open=(id,parent)=>{group=new THREE.Group();group.name='wet-'+id;parent.add(group);out.groups[id]=group;};
 // Fittings cast no shadows (see the culling below); on software rendering they receive none either: shadow lookups are a third
 // of their cost there, and the wet rooms get little sun.
 const close=()=>{batch?.(group);for(const q of group.children){q.castShadow=false;q.receiveShadow=!soft;}};
 // Handles: every style the home provides (one shows), else the default (pull on wall cabinets, bar on drawers) in `one` or dark.
 const grip=(style,g,def)=>{if(H.bar||H.knob||H.pull){if(H[style])add('h'+style,'handle-'+style,g);}else if(def)H.one?add('hone','handle',g):add('tint','handle',g,C.joint);};

 // --- Kitchen ------------------------------------------------------------------------------------------------------------
 open('kitchen',owner);
 const K=KITCHEN,x=K.wall,f=K.front,west=onX(x,1);
 add('white','ceiling',box(x,CEILING,.3,8.85,CEILING+.02,3.1));add('white','bulkhead',box(...[K.opening[0],CEILING,K.opening[1]],...[K.opening[2],2.78,K.opening[3]]));
 add('glow','light',box(7.55,CEILING-.005,1.4,7.85,CEILING-.001,2),'#fff6e6');
 add('white','pipe',box(K.pipe[0],TOP,K.pipe[1],K.pipe[2],CEILING,K.pipe[3]));
 // Wall cabinets in the cabinet finish (the home's oak by default), level with the existing white one (bottom 1.51 m,
 // 0.615 m over the worktop), 0.33 m deep: doors 0.3–0.4 m wide with 3 mm joints (dark behind), handles as above.
 const fronts=(z0,z1,y0,y1)=>{const n=Math.max(1,Math.round((z1-z0)/.4));for(let i=0;i<n;i++){const a=z0+(z1-z0)*i/n,b=z0+(z1-z0)*(i+1)/n;add('door','upper',west(a+.0015,b-.0015,.31,.33,y0+.002,y1-.002));if(i)add('tint','joint',west(a-.002,a+.002,.29,.328,y0,y1),C.joint);}
  grip('pull',west(z0+.002,z1-.002,.31,.333,y0+.003,y0+.016),true);
  if(y0<1.9)for(let i=0;i<n;i++){const b=z0+(z1-z0)*(i+1)/n;grip('bar',west(b-.045,b-.033,.33,.352,y0+.03,y0+.15));grip('knob',west(b-.05,b-.026,.33,.352,y0+.045,y0+.069));}};
 for(const [z0,z1] of K.uppers){add('door','upper',shut(west(z0,z1,0,.31,UP,CEILING),'px'));fronts(z0,z1,UP,CEILING);add('glow','strip',box(f-.05,UP-.006,z0+.02,f-.025,UP-.001,z1-.02),'#fff1d6');}
 // Hood: a canopy over the hob with a dark glass front, two lamps under it, a cabinet above holding the duct.
 const [h0,h1]=K.hood;add('steel','hood',west(h0+.01,h1-.01,0,.5,1.55,1.6));add('steel','hood',west(h0+.01,h1-.01,0,.33,1.6,1.98));add('tint','hood',west(h0+.03,h1-.03,.33,.335,1.64,1.94),C.glass);
 for(const z of [h0+.17,h1-.17])add('glow','hood-lamp',box(x+.35,1.546,z-.03,x+.42,1.55,z+.03),'#fff3dc');
 add('door','upper',shut(west(h0,h1,0,.31,1.98,CEILING),'px'));fronts(h0,h1,1.98,CEILING);
 // The existing white cabinet (app.js: 0.26 m deep, 50 mm off the wall, top 2.27 m) joins the run: back and top fillers,
 // doors on its face up to the ceiling, an end panel to the wall, a strip under it. Its own code and size are untouched.
 const [l0,l1,l2,l3]=K.locked;add('door','filler',box(x,UP,l1,l0,CEILING,l3));add('door','filler',box(l0,2.27,l1,l2,CEILING,l3));fronts(l1,l3,UP,CEILING);add('door','filler',west(l3,2.95,0,.33,UP,CEILING));
 add('glow','strip',box(f-.05,UP-.006,l1+.02,f-.025,UP-.001,l3-.02),'#fff1d6');
 // Tall column beside the fridge (front 50 mm behind the fridge's, so its door opens past 90°): drawers, oven, microwave, store.
 const [t0,t1,t2,t3]=K.tall,face=(y0,y1,d=.02)=>box(t0,y0,t1+.003,t0+d,y1,t3-.003);
 add('tint','plinth',box(t0+.05,0,t1+.02,t2,.1,t3-.02),C.plinth);add('door','tall',box(t0+.02,.1,t1,t2,CEILING,t3));
 add('door','tall',face(.1,.445));add('door','tall',face(.45,.78));add('door','tall',face(1.885,CEILING-.002));
 for(const y of [.415,.745]){grip('bar',box(t0-.022,y-.01,t1+.15,t0,y+.002,t3-.15),true);grip('pull',box(t0-.013,y+.012,t1+.04,t0,y+.024,t3-.04));grip('knob',box(t0-.022,y-.016,(t1+t3)/2-.012,t0,y+.008,(t1+t3)/2+.012));}
 add('steel','oven',face(.8,1.395,.025));add('tint','oven',box(t0-.004,.86,t1+.07,t0,1.25,t3-.07),C.glass);add('steel','oven',rodGeo([t0-.035,1.32,t1+.08],[t0-.035,1.32,t3-.08],.009));
 add('glow','display',box(t0-.005,1.345,(t1+t3)/2-.08,t0-.001,1.37,(t1+t3)/2+.08),'#9fd8ff');
 add('steel','microwave',face(1.45,1.85,.025));add('tint','microwave',box(t0-.004,1.5,t1+.05,t0,1.8,t3-.2),C.glass);add('glow','display',box(t0-.005,1.74,t3-.15,t0-.001,1.765,t3-.06),'#9fd8ff');
 collisions?.push([t0-.02,t1,t2,t3]);
 // On the worktop: a chopping board in the corner, a spice rack against the splashback past the hob, a kettle at the end.
 add('tint','board',box(6.74,TOP,.5,7.06,TOP+.018,.88),C.board);
 add('steel','rack',box(6.63,TOP,2.02,6.75,TOP+.008,2.4));add('steel','rack',box(6.63,1.025,2.02,6.75,1.033,2.4));for(const z of [2.02,2.392])add('steel','rack',box(6.63,TOP,z,6.75,1.16,z+.008));
 [2.08,2.16,2.25,2.33].forEach((z,i)=>{for(const y of [TOP+.008,1.033]){add('tint','jar',cyl(6.69,y,z,.022,.075,.022,8),C.amber);add('tint','jar',cyl(6.69,y+.075,z,.023,.014,.023,8),[C.cap,C.red,C.white,C.cap][i]);}});
 add('tint','kettle',cyl(6.98,TOP,2.72,.085,.015),C.cap);add('tint','kettle',cyl(6.98,TOP+.015,2.72,.078,.18,.064),C.cream);add('tint','kettle',cyl(6.98,TOP+.195,2.72,.04,.016,.03),C.cap);
 add('tint','kettle',box(6.97,TOP+.05,2.79,6.99,TOP+.19,2.815),C.cap);add('tint','kettle',box(6.97,TOP+.14,2.62,6.99,TOP+.16,2.66),C.cream);
 close();

 // --- Bathrooms ----------------------------------------------------------------------------------------------------------
 for(const b of BATHS){
  open(b.id,owner);const m=b.mirror,wall=onX(m.x,m.dir),z0=m.z-m.w/2,z1=m.z+m.w/2;
  for(const [a,c,d,e] of b.ceiling)add('white','ceiling',box(a,CEILING,c,d,CEILING+.02,e));
  add('glow','light',box(b.light[0]-.15,CEILING-.005,b.light[1]-.15,b.light[0]+.15,CEILING-.001,b.light[1]+.15),'#fff6e6');
  // Mirror cabinet 0.70 × 0.70 m, 125 mm deep, 0.5 m over the basin; LED bar above it.
  add('white','mirror-cabinet',wall(z0,z1,0,.125,1.35,2.05));add('mirror','mirror',wall(z0+.005,z1-.005,.125,.132,1.355,2.045));
  add('steel','mirror-light',wall(z0+.1,z1-.1,0,.09,2.08,2.11));add('glow','mirror-light',wall(z0+.11,z1-.11,.02,.088,2.076,2.08),'#fff4e2');
  // Towel rail: a 22 mm bar 65 mm off the tiled wall on two posts.
  const [p,q]=b.rail,[w,ax]=b.railWall;add('steel','towel-rail',rodGeo(p,q,.011));
  for(const s of [0,1]){const t=s?q:p,k=s?-1:1,o=ax==='x'?[t[0],t[1],t[2]+k*.02]:[t[0]+k*.02,t[1],t[2]],wpt=ax==='x'?[w,o[1],o[2]]:[o[0],o[1],w];add('steel','towel-rail',rodGeo(o,wpt,.012));}
  // Floor drains: 100 mm stainless plates 2 mm proud of the floor tiles (top 14 mm) with three raised slot bars.
  for(const [dx,dz] of b.drains){add('steel','drain',box(dx-.05,.012,dz-.05,dx+.05,.016,dz+.05));for(const k of [-1,0,1])add('steel','drain',box(dx-.035,.016,dz+k*.022-.006,dx+.035,.0175,dz+k*.022+.006));}
  close();
 }

 // --- Neighbours: wall cabinets and mirror cabinets only, one vertex-coloured mesh per unit ---------------------------------
 const light=(list,id,parent)=>{if(!parent)return;open(id,parent);for(const [g,hex] of list)add('tint','neighbour',g,hex);close();};
 const bList=()=>[[west(.46,1.15,0,.33,UP,CEILING),C.wood],[west(1.16,1.74,0,.5,1.55,1.6),C.grey],[west(1.16,1.74,0,.31,1.6,1.98),C.grey],[west(1.15,1.75,0,.33,1.98,CEILING),C.wood],
  [box(l0,2.27,l1,l2,CEILING,l3),C.wood],[box(x,UP,l1,l0,CEILING,l3),C.wood],[west(l1,l3,.31,.33,UP,CEILING),C.wood],[west(l3,2.95,0,.33,UP,CEILING),C.wood],
  ...BATHS.flatMap(b=>{const m=b.mirror,w=onX(m.x,m.dir);return [[w(m.z-.35,m.z+.35,0,.125,1.35,2.05),C.white],[w(m.z-.345,m.z+.345,.125,.13,1.355,2.045),C.face]];})];
 light(bList(),'neighbourB',neighbours.rightB);
 const aWest=onX(12.7,1),aNorth=onZ(3.4,1),aList=()=>[[aWest(3.4,4.2,0,.33,1.5,2.3),C.wood],[aWest(4.8,5.1,0,.33,1.5,2.3),C.wood],[aWest(4.2,4.8,0,.5,1.55,1.6),C.grey],[aWest(4.2,4.8,0,.33,1.6,1.95),C.grey],
  [aNorth(13.03,14.5,0,.33,1.5,2.3),C.wood],[onZ(8.4,-1)(14.73,15.27,0,.12,1.35,2),C.white],[onZ(8.4,-1)(14.735,15.265,.12,.125,1.355,1.995),C.face],
  [onX(20.8,-1)(7.12,7.68,0,.12,1.35,2),C.white],[onX(20.8,-1)(7.125,7.675,.12,.125,1.355,1.995),C.face]];
 light(aList(),'neighbourA',neighbours.leftA);light(aList(),'neighbourA2',neighbours.rightA);

 // --- Wall tiles ---------------------------------------------------------------------------------------------------------
 // The wall-finish triangles that look into a bathroom leave their meshes (the batched wall sets, and the window / door walls
 // batched into arch; single parts when unbatched) for one tile mesh per bathroom in each wall set, so each culls on its own.
 // The wall sets (layoutWalls) are identical here, so the window / door wall faces join each of them.
 const shared=[],sets=Object.values(walls||{}).map(v=>v.group||v),inSet=q=>{for(let a=q;a;a=a.parent)if(sets.includes(a))return a;return null;},hosts=[];
 arch.updateMatrixWorld(true);arch.traverse(q=>{if(q.isMesh&&q.material===M.wall)hosts.push(q);});
 const taken=new Map(sets.map(g=>[g,[]]));
 for(const mesh of hosts){const t=retile(mesh,roomOf);if(t)(inSet(mesh)?taken.get(inSet(mesh)):shared).push(...t);}
 for(const g of sets)for(const b of BATHS){const list=[...taken.get(g),...shared].filter(t=>t.room===b.id).map(t=>t.geometry);if(!list.length)continue;
  const geo=mergeGeometries(list,false);geo.applyMatrix4(g.matrixWorld.clone().invert());const q=new THREE.Mesh(geo,W.tile);q.name='wet-tile';q.castShadow=q.receiveShadow=true;g.add(q);out.tiles.push(q);}

 // --- Rooms out of sight ---------------------------------------------------------------------------------------------------
 // Walking (eye below 2.6 m), a room's fittings are drawn only from inside it or with one of its openings in plain sight past
 // the walls every wall set shares (plan line of sight; door leaves do not block). The fittings cast no shadows, so the
 // shadow map never depends on this. Twins follow their sources here too (a hidden material is never drawn, so never re-read).
 const same=(p,q)=>p.length===q.length&&p.every((a,i)=>Math.abs(a[0]-q[i][0])<.005&&Math.abs(a[1]-q[i][1])<.005);
 const edges=(plans[0]?.wallPolygons||[]).filter(p=>plans.every(q=>q.wallPolygons.some(r=>same(r,p)))).flatMap(p=>p.map((a,i)=>[a,p[(i+1)%p.length]]));
 const side=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 const sees=(a,b)=>!edges.some(([c,d])=>Math.max(c[0],d[0])>=Math.min(a[0],b[0])&&Math.min(c[0],d[0])<=Math.max(a[0],b[0])&&Math.max(c[1],d[1])>=Math.min(a[1],b[1])&&Math.min(c[1],d[1])<=Math.max(a[1],b[1])&&side(a,b,c)*side(a,b,d)<0&&side(c,d,a)*side(c,d,b)<0);
 const inR=(x,z,[a,b,c,d])=>x>a-.05&&x<c+.05&&z>b-.05&&z<d+.05;
 out.view={kitchen:{rooms:[KITCHEN.rect],gates:[[[7.25,3.1],[8.75,3.1]]]},bath1:{rooms:BATHS[0].rooms,gates:[[[1.75,7.25],[1.75,7.95]]]},bath2:{rooms:[...BATHS[1].rooms,[5.4,4.95,7,5.95]],gates:[[[5.45,5.9],[6.35,5.9]]]}};
 out.visibleFrom=(x,y,z,id)=>{const v=out.view[id];return y>2.6||v.rooms.some(r=>inR(x,z,r))||v.gates.some(([a,b])=>[.05,.275,.5,.725,.95].some(t=>sees([x,z],[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t])));};
 let scene=owner,last='';while(scene.parent)scene=scene.parent;const twins=Object.values(W).filter(m=>m.userData.twinOf),before=scene.onBeforeRender;
 scene.onBeforeRender=function(renderer,s,camera,...rest){before.call(this,renderer,s,camera,...rest);for(const m of twins)follow(m);
  const p=camera.position,key=p.y>2.6?'all':Math.round(p.x*50)+','+Math.round(p.z*50);if(key===last)return;last=key;
  for(const id of Object.keys(out.view))out.groups[id].visible=out.visibleFrom(p.x,p.y,p.z,id);};
 return out;
}

// Splits a wall-finish mesh: triangles facing into a wet room (world normal level, a point 3 cm in front in the room) come out as
// world-space geometries per room (position, normal, uv); the mesh keeps the rest.
export function retile(mesh,roomOf){
 const g=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry,P=g.attributes.position,N=g.attributes.normal,keep=[],take=new Map();
 const W=mesh.matrixWorld,nm=new THREE.Matrix3().getNormalMatrix(W),n=new THREE.Vector3(),v=new THREE.Vector3(),c=new THREE.Vector3();
 for(let t=0;t<P.count/3;t++){n.set(0,0,0);c.set(0,0,0);for(let k=0;k<3;k++){n.add(v.fromBufferAttribute(N,3*t+k));c.add(v.fromBufferAttribute(P,3*t+k));}
  n.applyMatrix3(nm).normalize();c.multiplyScalar(1/3).applyMatrix4(W);const room=Math.abs(n.y)<.2?roomOf(c.x+n.x*.03,c.z+n.z*.03):null;if(room)(take.get(room)??take.set(room,[]).get(room)).push(t);else keep.push(t);}
 if(!take.size)return null;
 const pick=(list,keys)=>{const q=new THREE.BufferGeometry();for(const k of keys){const a=g.attributes[k],s=a.itemSize*3,arr=new a.array.constructor(list.length*s);list.forEach((t,i)=>arr.set(a.array.subarray(t*s,t*s+s),i*s));q.setAttribute(k,new THREE.BufferAttribute(arr,a.itemSize,a.normalized));}return q;};
 mesh.geometry=pick(keep,Object.keys(g.attributes));mesh.geometry.computeBoundingSphere();
 return [...take].map(([room,list])=>({room,geometry:pick(list,['position','normal','uv']).applyMatrix4(W)}));
}
