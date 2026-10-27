// Openings of the owner's B unit after the DWG (fit-out round, 2026-10-26): windows, sliders, the balcony front and its side,
// read from 建发玺院6#-1.dwg. Plan metres (x east, z south), heights above the finished floor; same origin as plan-data.json.
//  - Plan: B'HUXING insert 4784E5 (WINDOW 3-line symbols, $DorLib2D$ door blocks, A$C530E40CA / A$C3D9C6D08 sash blocks),
//    labels in insert 4784E6 (WINDOW_TEXT1 480CCD…480CD9).
//  - Heights: elevations 1~25 (south, level 26.200 at Y −374366), 25~1 (north, Y −477439), K~A (west, Y −374366):
//    WINDOW frames and 窗户开启扇 sash symbols. The sash symbol layer is Continuous, so by GB/T 50104 every casement opens
//    outward, hinged on the side where its two lines meet.
//  - Levels: 6#楼1-1剖面图 (title 47140B): storeys 2950, screed 50 (finish 7B0E0 / slab top 7B0F6), slab 120, so the
//    ceiling (slab soffit) is 2.78 above the floor; every window head in the three elevations is at 2350 (beam soffit).
// Only the owner's unit uses these specs (windowWall()/slider() look them up for the B units); the A units, the common parts
// and the master bay (PC2718a, left as it is) keep the generic builders.
import * as THREE from 'three';
import {mergeGeometries} from './utils/BufferGeometryUtils.js?v=fda7e946b8';

export const LEVELS={storey:2.95,screed:.05,slab:.12,ceiling:2.78,head:2.35,
 source:'6#楼1-1剖面图 47140B: finish 7B0E0 at the level, slab 7B0F6 50 below it and 120 thick; elevations: window heads 2350'};

// u: metres along a→b from a; y: above the floor. frame: outer frame width at a / at b (DWG 50, wider where the model's
// opening is wider than the DWG frame). mull: mullion centres (50 wide, full height). bars: transoms {u:[u0,u1],y:[y0,y1]}.
// sashes: outward casements {u,y,hinge:'a'|'b'}. jambs: plan boxes [x0,z0,x1,z1] where the DWG has wall/column (A-COLUMN,
// 构造柱企口) but the plan-data walls leave a slot beside the frame; filled full height in the wall finish.
// wall: build the kerb (0…bottom) and the header (head…ceiling) although the call passes base=false (no stone sill there).
export const WINDOWS=[
 {code:'PC2018',room:'封闭阳台1（北）',a:[.6,2.45],b:[2.6,2.45],sill:.6,head:2.35,frame:[.05,.05],mull:[1.25],
  bars:[{u:[1.275,1.95],y:[.975,1.025]}],sashes:[{u:[1.275,1.95],y:[1.025,2.3],hinge:'b'}],
  jambs:[[.4,2.25,.6,2.55],[2.6,2.25,2.8,2.55]],
  dwg:'plan WINDOW 47672A–C + 47678C, x 0.60–2.60; columns A$C709B6CA9 47676A/47676B (0.40–0.60, 2.60–2.80); N elev 34A027 600–2350, sash 34A029/34A02C hinge east'},
 {code:'PC1218',room:'北卧凸窗',a:[3.95,2.45],b:[5.2,2.45],sill:.6,head:2.35,frame:[.1,.05],mull:[.65],
  bars:[{u:[.1,1.2],y:[.975,1.025]}],sashes:[{u:[.1,.625],y:[1.025,2.3],hinge:'a'},{u:[.675,1.2],y:[1.025,2.3],hinge:'b'}],
  dwg:'plan A$C530E40CA 47674B/47674A, x 4.00–5.20; N elev 34A031 600–2350, sashes 34A037 (hinge west) / 34A034 (hinge east)'},
 {code:'PC0718a',room:'卫2凸窗',a:[5.4,2.45],b:[6.15,2.45],sill:.6,head:2.35,frame:[.05,.05],
  bars:[{u:[.05,.7],y:[.975,1.025]}],sashes:[{u:[.05,.7],y:[1.025,2.3],hinge:'b'}],
  dwg:'plan 4767A4, x 5.40–6.15; N elev 34A03D 600–2350, sash 34A040 hinge east'},
 {code:'PC1214b',room:'厨房',a:[7.1,.15],b:[8.3,.15],sill:.9,head:2.35,frame:[.05,.05],mull:[.6],
  sashes:[{u:[.05,.575],y:[.95,2.3],hinge:'a'},{u:[.625,1.15],y:[.95,2.3],hinge:'b'}],
  dwg:'plan A$C530E40CA 476773/476772, x 7.10–8.30 (企口 A$C51F4652F / A$C09F75D12 beside it are closed by the CAD wall meshes); N elev 7B6DC 900–2350, sashes 7B6DF / 7B6E2'},
 {code:'PC0714cN',room:'西卫（避难间）',a:[0,5.95],b:[0,6.75],sill:.9,head:2.35,frame:[.1,.05],
  sashes:[{u:[.1,.75],y:[.95,2.3],hinge:'b'}],
  dwg:'plan A$C3D9C6D08 476746, z 6.00–6.75 (企口 47677A 5.95–6.00 under the frame); W elev 38EEEA 900–2350, sash 38EEED hinge south'},
 // Balcony front: the south elevation draws a window wall, not a railing (WINDOW 7BDA3 50–2350, lower lights 100–1150,
 // transom 1150–1200, upper lights 1200–2300, four casements 7BDAA/7BDAD/7BDB0/7BDA7 = plan sash blocks 4767B2/B5/B6/B1).
 {code:'阳台窗',room:'阳台1（南）',a:[3.5,13.4],b:[9.95,13.4],sill:.05,head:2.35,frame:[.05,.05],wall:true,mull:[.75,2.525,3.225,3.925,5.7],
  bars:[{u:[.05,6.4],y:[1.15,1.2]}],
  sashes:[{u:[.05,.725],y:[1.2,2.3],hinge:'a'},{u:[2.55,3.225],y:[1.2,2.3],hinge:'a'},{u:[3.225,3.9],y:[1.2,2.3],hinge:'b'},{u:[5.725,6.4],y:[1.2,2.3],hinge:'b'}],
  dwg:'plan WINDOW 476734/476735/4767B4, x 3.50–9.95 at z 13.35–13.45; S elev 7BDA3; pier 9.95–10.55 is wall (480EA9/480EAA)'}
];
const near=(p,q)=>Math.abs(p[0]-q[0])<1e-6&&Math.abs(p[1]-q[1])<1e-6;
export function windowSpec(a,b){return WINDOWS.find(w=>near(w.a,a)&&near(w.b,b))||null;}

// One window in its group's frame (windowWall(): x along a→b centred, +z = world (−dz, dx), side = room side sign).
// 50 mm aluminium frame 100 deep, mullions and transoms 50; one glass sheet behind; each outward casement has its own 50 mm
// sash frame on the outer face and a 7-shaped handle on the room face at its lock stile, at the sash's mid-height.
// Software rasteriser: the tier gives every metallic finish its own envMap (app.js startup), and the DWG's frames, mullions and
// sashes would be sampled over a large part of a window wall's view (+9 % CPU per frame on the balcony view), so there the
// owner's windows take a matte Lambert twin of the frame finish (same colour object, so the style presets still apply; one draw).
const matteFrames=new WeakMap();
function frameFinish(M,soft){if(!soft)return M.frame;if(!matteFrames.has(M.frame)){const c=new THREE.MeshLambertMaterial({clippingPlanes:M.frame.clippingPlanes});c.color=M.frame.color;matteFrames.set(M.frame,c);}return matteFrames.get(M.frame);}
export function buildWindow(spec,{box,M,g,L,bottom,height,side,arch,soft=false}){
 const fm=frameFinish(M,soft),head=bottom+height,X=u=>-L/2+u,[fa,fb]=spec.frame||[.05,.05];
 if(spec.wall){box(0,0,0,L,bottom,.16,M.wall,g);box(0,head,0,L,Math.max(.01,LEVELS.ceiling-head),.16,M.wall,g);}
 box(0,bottom,0,L,.05,.1,fm,g);box(0,head-.05,0,L,.05,.1,fm,g);
 box(X(fa/2),bottom,0,fa,height,.1,fm,g);box(X(L-fb/2),bottom,0,fb,height,.1,fm,g);
 for(const u of spec.mull||[])box(X(u),bottom+.05,0,.05,height-.1,.1,fm,g);
 for(const t of spec.bars||[])box(X((t.u[0]+t.u[1])/2),t.y[0],0,t.u[1]-t.u[0],t.y[1]-t.y[0],.08,fm,g);
 // Software rasteriser: a window wall as big as the balcony's would be shaded twice over most of the screen (double-sided
 // transparent glass), so there the frames stand without their glass, like the tier's other savings (render-tier.js).
 if(!(soft&&spec.wall)){const q=box(0,bottom+.02,0,L-.03,height-.04,.018,M.glass,g);q.castShadow=false;}
 const out=-side*.034,inner=side*.05;
 for(const s of spec.sashes||[]){
  const [u0,u1]=s.u,[y0,y1]=s.y,w=u1-u0,h=y1-y0,c=X((u0+u1)/2);
  box(c,y0,out,w-.01,.05,.032,fm,g);box(c,y1-.05,out,w-.01,.05,.032,fm,g);
  box(X(u0+.03),y0+.05,out,.05,h-.1,.032,fm,g);box(X(u1-.03),y0+.05,out,.05,h-.1,.032,fm,g);
  const lock=s.hinge==='a'?u1-.035:u0+.035,hy=Math.min(y0+h/2,1.6);
  box(X(lock),hy-.045,inner+side*.006,.03,.09,.012,fm,g);box(X(lock),hy-.15,inner+side*.02,.018,.13,.016,fm,g);
 }
 for(const [x0,z0,x1,z1] of spec.jambs||[])arch(x0,z0,x1,z1,0,LEVELS.ceiling);
 return g;
}

// Sliding doors (TLM…23 = 2300 high). DWG leaf sets: TLM2723b ($DorLib2D$00000138, living 480E79) four leaves on two tracks,
// the inner pair parting to the ends over the fixed outer pair; TLM1823b ($DorLib2D$00000131, south room 480E75, kitchen 480E7D)
// two by-passing leaves. Stowed open (the walk view hides sliding leaves; 'all' shows them): pairs stacked at the ends.
// Frame: head track 60 × 120 (as before), 40 mm jamb posts, a 12 mm bottom track on the 16 mm threshold stone.
// Leaf: 45 mm stiles, 50 / 80 mm rails, 35 deep, glass between; a slim pull on both faces of the free stile.
export const SLIDERS=[
 {code:'TLM2723b',room:'客厅',x:8.6,z:11.55,w:2.7,leaves:4,dwg:'480E79, x 7.25–9.95; leaves 7.25–8.01 / 7.82–8.60 / 8.60–9.38 / 9.19–9.95'},
 {code:'TLM1823b',room:'南卧',x:5.1,z:11.55,w:1.8,leaves:2,dwg:'480E75, x 4.20–6.00 (plan-data opening 4.20–6.00); leaves 4.20–5.14 / 5.07–6.00'},
 {code:'TLM1623（图上无标签）',room:'厨房',x:8,z:3.1,w:1.6,leaves:2,dwg:'480E7D $DorLib2D$00000131 1600, x 7.20–8.80 at z 3.10; leaves 7.20–8.04 / 7.97–8.80'}
];
export function sliderParts({box,M,g,leaf,x,z,w,n=w>2.2?4:2}){
 const fm=M.frame;
 box(x,2.3,z,w,.06,.12,fm,g);box(x-w/2,0,z,.04,2.3,.12,fm,g);box(x+w/2,0,z,.04,2.3,.12,fm,g);box(x,.016,z,w-.04,.012,.1,fm,g);
 const lw=w/n+.03,x0=x-w/2+.02,x1=x+w/2-.02,stack=n===4?[[x0,.022],[x0+.012,-.022],[x1-lw,.022],[x1-lw-.012,-.022]]:[[x0,.022],[x0+.012,-.022]];
 for(const [a,v] of stack){
  const b=a+lw,c=(a+b)/2,zz=z+v,y0=.03,y1=2.285;
  box(a+.0225,y0,zz,.045,y1-y0,.035,fm,leaf);box(b-.0225,y0,zz,.045,y1-y0,.035,fm,leaf);
  box(c,y1-.05,zz,lw-.09,.05,.035,fm,leaf);box(c,y0,zz,lw-.09,.08,.035,fm,leaf);
  const q=box(c,y0+.08,zz,lw-.09,y1-y0-.13,.006,M.glass,leaf);q.castShadow=false;
  const free=a<x?b-.0225:a+.0225;for(const s of [-1,1])box(free,.85,zz+s*.029,.016,.4,.016,fm,leaf);
 }
}

// Balcony side (x 3.45, z 12.35–13.40): the west elevation draws a metal railing there (AE-ELEV-4-RAIL 7B11C…7B138:
// rails at 70–100 and 1030–1050, handrail band to 1150, 20 mm balusters at 120 mm), open above it to the 2350 beam
// (A-LINE 7BFAA); the plan's 3-line symbol (476734/476735) runs on from the window wall. The air-conditioner unit stands
// right behind it (A$C008B4047, x 3.78–4.13) and breathes through it.
export function dwgRail({rod,box,M,parent,a,b,header}){
 const [x1,z1]=a,[x2,z2]=b,L=Math.hypot(x2-x1,z2-z1),at=t=>[x1+(x2-x1)*t,z1+(z2-z1)*t];
 for(const y of [.085,1.04])rod([x1,y,z1],[x2,y,z2],.012,M.metal,parent);
 rod([x1,1.15,z1],[x2,1.15,z2],.025,M.metal,parent);
 for(let d=.06;d<L-.03;d+=.12){const [x,z]=at(d/L);rod([x,.1,z],[x,1.03,z],.01,M.metal,parent);}
 for(const t of [0,1]){const [x,z]=at(t);rod([x,.02,z],[x,1.15,z],.02,M.metal,parent);}
 if(header){const w=Math.abs(x2-x1)||.16,d=Math.abs(z2-z1)||.16;box((x1+x2)/2,header,(z1+z2)/2,w,LEVELS.ceiling-header,d,M.wall,parent);}
}

// Equipment the DWG draws in the B unit (B'HUXING 4784E5), at its plan positions; heights are not in the drawing, so they
// follow common practice (noted per part). Wall-hung parts above 1.28 m are cut with the walls.
//  - South bedroom wall air-conditioner: TTFDWW 4766FC, 800 × 260 on the west wall (x 3.50, z 10.65–11.45). Indoor unit
//    800 × 290 × 210 (a common 1.5 HP size), top 150 below the 2.78 ceiling. The DWG's other indoor units sit where the model
//    has no wall (master 4766FD and north bedroom 476703 on the bay openings, the former children's room 476704 on the balcony
//    cross wall the owner's layouts open), so they are not modelled.
//  - Balcony outdoor units: A$C008B4047 476707 (x 3.78–4.13, z 12.24–12.94) and 4767A6 (x 9.90–10.25, z 12.22–12.92),
//    700 × 350 each: body 700 × 550 high × 300 deep on two rails, the fan facing into the balcony (to the railing / casement).
//  - Condensate stack: K_EQUIPMENT circle 4767AA, Ø100 at (3.634, 11.838): a Ø75 PVC pipe floor to ceiling.
//  - South bedroom, behind its door (east wall x 6.50, facing west): E_EQUIPMENT 476790 distribution board (z 7.15–7.63,
//    flush, lid 300 high, bottom at 1.80 m) and 476791 low-voltage box (z 7.63–8.13, 60 proud in the DWG; lid 400 high,
//    bottom at 0.30 m).
export const SERVICES={wallAC:{box:[3.5,10.65,3.71,11.45],y:[2.34,2.63],src:'TTFDWW 4766FC',central:{dx:-.15}},outdoor:[{box:[3.78,12.24,4.08,12.94],face:-1,src:'476707'},{box:[9.9,12.22,10.2,12.92],face:-1,src:'4767A6'}],
 stack:{x:3.634,z:11.838,r:.0375,src:'K_EQUIPMENT 4767AA'},boards:[{z:[7.15,7.63],y:[1.8,2.1],proud:.02,src:'E_EQUIPMENT 476790'},{z:[7.63,8.13],y:[.3,.7],proud:.03,src:'E_EQUIPMENT 476791'}],boardWall:6.5};
// One vertex-coloured material for all of it (white plastic, dark grilles and slots), cut with the walls: each cluster below is a
// single draw call, frustum-culled on its own, and kept out of the unit's big batches (merged into them, a part in view would make
// the software rasteriser transform every white or dark part of the unit). Equipment colours do not follow the style presets.
// Lambert on the software tier (no environment there, and the cheapest shading).
const servicesMat=new WeakMap();
const WHITE='#eeede5',DARK='#394338';
export function buildServices({box,clipPlane,parent,soft=false,walls=null}){
 const g=new THREE.Group();g.name='dwg-services';parent.add(g);
 if(!servicesMat.has(clipPlane))servicesMat.set(clipPlane,soft?new THREE.MeshLambertMaterial({vertexColors:true,clippingPlanes:[clipPlane]}):new THREE.MeshStandardMaterial({vertexColors:true,roughness:.6,clippingPlanes:[clipPlane]}));
 const m=servicesMat.get(clipPlane),S=SERVICES,clusters={ac:new THREE.Group(),balcony:new THREE.Group(),boards:new THREE.Group()};
 const part=(q,hex)=>{q.userData.hex=hex;return q;};
 const B=(x,y,z,w,h,d,hex,to,r=0)=>part(box(x,y,z,w,h,d,m,to,r),hex);
 const disc=(r,d,n,hex,x,y,z,to)=>{const q=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d,n),m);q.rotation.z=Math.PI/2;q.position.set(x,y,z);to.add(q);part(q,hex);};
 // Wall unit: rounded body, a darker outlet slot along the bottom front, a small display.
 {const [x0,z0,x1,z1]=S.wallAC.box,[y0,y1]=S.wallAC.y,cz=(z0+z1)/2,to=clusters.ac;
  B((x0+x1)/2,y0,cz,x1-x0,y1-y0,z1-z0,WHITE,to,.02);B(x1+.002,y0+.035,cz,.006,.03,z1-z0-.1,DARK,to);B(x1+.002,y0+.13,cz+.25,.006,.012,.05,DARK,to);}
 // The outdoor units: body, fan disc and its hub on the front, two feet rails; and the condensate stack.
 for(const u of S.outdoor){const [x0,z0,x1,z1]=u.box,cx=(x0+x1)/2,cz=(z0+z1)/2,fx=u.face<0?x0:x1,to=clusters.balcony;
  B(cx,.06,cz,x1-x0,.55,z1-z0,WHITE,to,.012);for(const z of [z0+.08,z1-.08])B(cx,0,z,x1-x0-.02,.06,.04,DARK,to);
  disc(.2,.012,20,DARK,fx+u.face*.004,.36,cz-.06,to);disc(.04,.016,10,WHITE,fx+u.face*.008,.36,cz-.06,to);}
 {const q=new THREE.Mesh(new THREE.CylinderGeometry(S.stack.r,S.stack.r,LEVELS.ceiling,10),m);q.position.set(S.stack.x,LEVELS.ceiling/2,S.stack.z);clusters.balcony.add(q);part(q,WHITE);}
 // Boards on the wall face, facing west.
 for(const b of S.boards){const [z0,z1]=b.z,[y0,y1]=b.y,to=clusters.boards;B(S.boardWall-b.proud/2,y0,(z0+z1)/2,b.proud,y1-y0,z1-z0,WHITE,to,.004);
  B(S.boardWall-b.proud-.001,y0+.04,(z0+z1)/2,.002,.012,z1-z0-.08,DARK,to);}
 for(const [name,c] of Object.entries(clusters)){c.updateMatrixWorld(true);const list=[];
  c.traverse(o=>{if(!o.isMesh)return;let q=o.geometry.clone();if(q.index)q=q.toNonIndexed();q.applyMatrix4(o.matrixWorld);
   const col=new THREE.Color(o.userData.hex),n=q.attributes.position.count,a=new Float32Array(n*3);for(let i=0;i<n;i++)a.set([col.r,col.g,col.b],i*3);q.setAttribute('color',new THREE.BufferAttribute(a,3));list.push(q);});
  const q=new THREE.Mesh(mergeGeometries(list,false),m);list.forEach(x=>x.dispose());q.name='dwg-'+name;q.castShadow=true;q.receiveShadow=true;g.add(q);}
 // 04 (layout-central.json) moves the south bedroom's west partition 0.15 m west (wall face x 3.35, 3.50 in the others): the
 // indoor unit goes with its wall, one copy in each layout's wall group so it switches with the walls.
 if(walls){const ac=g.getObjectByName('dwg-ac'),c=ac.clone();walls.original.add(ac);c.position.x+=SERVICES.wallAC.central.dx;walls.central.add(c);}
 return g;
}
