import * as THREE from 'three';
import {mergeGeometries} from './utils/BufferGeometryUtils.js?v=fda7e946b8';
import {metricBoxUV,WALL_UV} from './metric-uv.js?v=07dab91ffb';
// Kitchen and bathroom fixtures as real products (fit-out round, 2026-10-26), in the owner's unit (left B) only.
// The locked segments of app.js (services-lock.json: kitchen, bathrooms) stay as written: every water point, fixture anchor
// and turn is theirs. Their placeholder meshes keep their objects, materials and transforms; only the geometry inside is
// replaced, within the same outline (toilet() and basin(): each side within 1 cm, see check-wet-fixtures.mjs), before
// batchStatic() merges the unit. The right-hand B unit is a clone made earlier and keeps the old shapes.
// - toilets: a compact skirted one-piece (bowl, seat ring and lid with a hinge, cistern with an overhanging lid and a dual
//   flush button); the locked outline is 0.39 × 0.565 m, shallower than the 0.68–0.72 m of most close-coupled products and the
//   CAD symbol's 0.65 m: the bowl is not lengthened (that would move it into the room; listed for the owner);
// - basins: a vanity on a recessed plinth with two doors (3 mm joint, the home's handles), an integrated ceramic top 90 mm
//   thick with a 126 mm deep bowl, a single-lever mixer whose body stands where the locked riser stood;
// - kitchen base runs: carcass fronts set back for 18 mm doors and drawers with 3 mm joints, the home's handles (all three
//   styles built, one shown by its material), a 100 mm kick recessed 56–58 mm; the locked brass pulls are hidden;
// - kitchen east run along the east wall from the CAD (A-LVTRY 476780 / 476784: 600 mm deep, front x 8.25, to the fridge),
//   up to the tall column wet-rooms.js puts beside the fridge; splashback panels where the worktops meet a wall;
// - sink: a top-mount stainless rim on the plate's outline and a 200 mm deep bowl through a cut in the worktop (the bowl in
//   the locked inner plate's grey), gooseneck mixer on the locked riser's axis; hob: burner heads, cast pan supports, knobs;
//   fridge: freezer drawer and door with joints and handles;
// - showers: the locked riser and head get their mixer bar (two wall elbows 160 mm apart), a head arm, a wall bracket and a
//   hand shower on its hose; toilet-roll holders beside the toilets.
// Plan metres (x east, z south, y up). Materials are the home's (M), so presets restyle them; batchStatic merges each with the
// unit's other parts of that finish (the cabinet-door finish and the shown handle style are new to the unit: two more draws).
// Faces under doors, worktops and kicks are left out (software rendering shades every covered face). Segment counts drop on
// phones and software rendering.

// DWG references used here (建发玺院6#-1.dwg, B'HUXING insert 4784E5; plan metres, see the wet audit for the full list).
export const CAD={
 kitchenRuns:{handle:'476780/476784',layer:'A-LVTRY',front:{north:.9,west:7.15,east:8.25},eastRun:[8.25,.9,8.85,2.05]},
 sink:{handle:'47670A',layer:'A-LVTRY',box:[7.372,.393,8.028,.812]},hob:{handle:'476781',layer:'A-LVTRY',box:[6.6,1.305,7.02,1.945]},
 hood:{handle:'476783',layer:'B-平面-洁、厨具',box:[6.6,1.22,7.05,2.03]},fridge:{handle:'47670B',layer:'A-LVTRY',box:[8.1,2.05,8.85,3.05]},
 toilets:{bath1:{handle:'47673A',box:[1.075,6.15,1.575,6.8]},bath2:{handle:'476755',box:[6.35,4.25,7.0,4.75]}},
 basins:{bath1:{handle:'47673C',box:[.155,7.29,.555,7.81],counter:[.1,7.05,.7,8.05]},bath2:{handle:'476750',box:[6.545,5.085,6.945,5.605],counter:[6.4,4.95,7,5.75]}},
};
// Kitchen fronts (door planes and module joints). West run doors face +x on x 7.19–7.208, north run doors face +z on
// z 0.862–0.88, east run doors face −x on x 8.262–8.28 (its worktop front on the CAD line x 8.25); each list: fillers, then
// [from, to, kind, opening side].
export const KITCHEN_FRONTS={
 west:{axis:'z',plane:7.19,dir:1,kick:7.15,fill:[[.88,.93]],mods:[[.93,1.25,'door','lo'],[1.25,1.85,'drawers'],[1.85,2.4,'door','hi'],[2.4,2.95,'door','lo']]},
 north:{axis:'x',plane:.862,dir:1,kick:.824,fill:[[7.208,7.258],[8.212,8.262]],mods:[[7.258,7.598,'door','lo'],[7.598,7.938,'door','hi'],[7.938,8.212,'door','lo']]},
 east:{axis:'z',plane:8.28,dir:-1,kick:8.32,fill:[[.88,.93]],mods:[[.93,1.7,'drawers']]},
};
export const EAST_RUN={carcass:[8.28,.3,8.85,1.7],worktop:[[8.25,.91,8.85,1.7],[8.535,.3,8.85,.91]],collide:[8.25,.3,8.85,1.7]};
const TOP=.895,UNDER=.86,KICK=.1,DOOR=.018,GAP=.003,FRONT=[.103,.857],DRAWERS=[[.103,.283],[.286,.566],[.569,.857]];

// --- Geometry helpers ---------------------------------------------------------------------------------------------------
const box=(x0,y0,z0,x1,y1,z1)=>metricBoxUV(new THREE.BoxGeometry(x1-x0,y1-y0,z1-z0)).translate((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);
// Drops faces of a box (px nx py ny pz nz) that are never seen.
const shut=(g,...faces)=>{const drop=faces.map(f=>['px','nx','py','ny','pz','nz'].indexOf(f)),i=[...g.index.array];g.setIndex(i.filter((_,k)=>!drop.includes(Math.floor(k/6))));return g;};
const cylY=(x,y0,z,r,h,n=12,rt=r)=>new THREE.CylinderGeometry(rt,r,h,n).translate(x,y0+h/2,z);
function rod(a,b,r,n=8){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A),g=new THREE.CylinderGeometry(r,r,d.length(),n);
 g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize()));return g.translate(...A.add(B).multiplyScalar(.5).toArray());}
const tube=(pts,r,seg=24,n=6)=>new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p))),seg,r,n,false);
const flat=g=>{g=g.index?g.toNonIndexed():g;if(!g.attributes.uv)g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));for(const k of Object.keys(g.attributes))if(!['position','normal','uv'].includes(k))g.deleteAttribute(k);return g;};
const merge=list=>mergeGeometries(list.filter(Boolean).map(flat),false);
// A plan outline: two half superellipses joined at the widest line z = zm (back half to zb with exponent pb, front half to
// zf with pf), half width hw about cx, at height y; n points from +x towards +z (outward faces with rings going up).
function oval({cx=0,hw,zm=0,zb,zf,pb=2,pf=2,y},n){const pts=[];for(let i=0;i<n;i++){const t=2*Math.PI*i/n,c=Math.cos(t),s=Math.sin(t),p=s<0?pb:pf;
 pts.push([cx+hw*Math.sign(c)*Math.abs(c)**(2/p),y,zm+(s<0?zm-zb:zf-zm)*Math.sign(s)*Math.abs(s)**(2/p)]);}return pts;}
const hard=r=>(r.hard=true,r);
// Lofts rings of equal point count into one smooth sheet (hard rings keep their own normals on each side); caps are fans.
function loft(rings,{top=false,bottom=false}={}){
 const n=rings[0].length,pos=[],uv=[],idx=[],at=[],dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);let v=0;
 const push=(R,w)=>{const b=pos.length/3;let s=0;for(let i=0;i<n;i++){if(i)s+=dist(R[i],R[i-1]);pos.push(...R[i]);uv.push(s,w);}return b;};
 rings.forEach((R,k)=>{if(k)v+=R.reduce((s,p,i)=>s+dist(p,rings[k-1][i]),0)/n;const a=push(R,v);at.push([a,R.hard&&k&&k<rings.length-1?push(R,v):a]);});
 for(let k=0;k+1<rings.length;k++){const A=at[k][1],B=at[k+1][0];for(let i=0;i<n;i++){const j=(i+1)%n;idx.push(A+i,B+j,A+j,A+i,B+i,B+j);}}
 const cap=(R,up)=>{const c=R.reduce((s,p)=>s.map((v,k)=>v+p[k]/n),[0,0,0]),b=pos.length/3;pos.push(...c);uv.push(c[0],c[2]);for(const p of R){pos.push(...p);uv.push(p[0],p[2]);}
  for(let i=0;i<n;i++){const j=(i+1)%n;if(up)idx.push(b,b+1+j,b+1+i);else idx.push(b,b+1+i,b+1+j);}};
 if(top)cap(rings.at(-1),true);if(bottom)cap(rings[0],false);
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
// A worktop slab (y0–y1) over a plan rectangle with rounded-rectangle holes, metre UVs on top (app.js slab()).
function slabWithHoles([x0,z0,x1,z1],holes,y0,y1){
 const s=new THREE.Shape([[x0,z0],[x1,z0],[x1,z1],[x0,z1]].map(([x,z])=>new THREE.Vector2(x,-z)));
 for(const [cx,cz,hw,hd,r] of holes){const p=new THREE.Path();p.moveTo(cx-hw+r,-(cz-hd));p.lineTo(cx+hw-r,-(cz-hd));p.quadraticCurveTo(cx+hw,-(cz-hd),cx+hw,-(cz-hd+r));p.lineTo(cx+hw,-(cz+hd-r));
  p.quadraticCurveTo(cx+hw,-(cz+hd),cx+hw-r,-(cz+hd));p.lineTo(cx-hw+r,-(cz+hd));p.quadraticCurveTo(cx-hw,-(cz+hd),cx-hw,-(cz+hd-r));p.lineTo(cx-hw,-(cz-hd+r));p.quadraticCurveTo(cx-hw,-(cz-hd),cx-hw+r,-(cz-hd));s.holes.push(p);}
 const g=new THREE.ExtrudeGeometry(s,{depth:y1-y0,bevelEnabled:false,curveSegments:4,UVGenerator:WALL_UV});g.rotateX(-Math.PI/2);return g.translate(0,y0,0);}
// Puts geometry built in the parent's frame into a mesh without touching its transform (the old geometry stays: the
// right-hand B unit's clone still uses it).
function swap(mesh,geo){mesh.updateMatrix();mesh.geometry=geo.applyMatrix4(mesh.matrix.clone().invert());geo.computeBoundingBox();geo.computeBoundingSphere();}
const localBox=(group)=>{const b=new THREE.Box3();group.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(group.matrixWorld).invert();
 for(const q of group.children)if(q.isMesh&&q.visible){q.geometry.computeBoundingBox();b.union(q.geometry.boundingBox.clone().applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv,q.matrixWorld)));}return b;};
const r4=v=>Math.round(v*1e4)/1e4,boxArr=b=>[b.min.x,b.min.y,b.min.z,b.max.x,b.max.y,b.max.z].map(r4);

// --- Products (local frames) --------------------------------------------------------------------------------------------
// Toilet in toilet()'s frame: width along x, cistern towards −z, outline x ±0.195, z −0.30…+0.265, y 0…0.64.
function toiletGeos(n){
 const O=(o,y)=>oval({...o,y},n),B={zm:-.03,zb:-.255,pb:6,pf:2.4};
 const body=loft([O({...B,hw:.150,zf:.185},0),O({...B,hw:.158,zf:.200},.05),O({...B,hw:.171,zm:-.02,zf:.228},.22),O({...B,hw:.181,zm:0,zf:.250,pf:2.3},.32),
  O({...B,hw:.186,zm:0,zf:.257,pf:2.2},.36),O({...B,hw:.182,zm:0,zb:-.25,zf:.252,pf:2.2},.372)],{top:true});
 const S={zm:.03,pb:3,pf:2.2};
 const seat=merge([loft([O({...S,hw:.172,zb:-.13,zf:.254},.372),O({...S,hw:.180,zb:-.134,zf:.261},.381),O({...S,hw:.177,zb:-.132,zf:.258},.39)],{top:true,bottom:true}),
  loft([O({...S,hw:.170,zb:-.122,zf:.251},.392),O({...S,hw:.177,zb:-.126,zf:.258},.403),O({...S,hw:.169,zb:-.12,zf:.249},.413)],{top:true,bottom:true}),
  box(-.1,.372,-.152,-.05,.396,-.118),box(.05,.372,-.152,.1,.396,-.118)]);
 const T={zm:-.21,pb:7,pf:7};
 const tank=merge([loft([O({...T,hw:.176,zb:-.288,zf:-.132},.3),O({...T,hw:.182,zb:-.291,zf:-.129},.56),O({...T,hw:.18,zb:-.289,zf:-.131},.612)],{top:true}),
  loft([O({...T,hw:.183,zb:-.294,zf:-.125,pb:8,pf:8},.611),O({...T,hw:.188,zb:-.297,zf:-.121,pb:8,pf:8},.626),O({...T,hw:.186,zb:-.295,zf:-.123,pb:8,pf:8},.636),O({...T,hw:.179,zb:-.289,zf:-.129,pb:8,pf:8},.64)],{top:true,bottom:true})]);
 const button=merge([cylY(-.0115,.637,-.21,.0105,.005,10),cylY(.0115,.637,-.21,.0105,.005,10)]);
 return {body,seat,tank,button};
}
// Basin in basin()'s frame (w wide along x, the faucet towards −z): outline x ±(w+0.03)/2, z ±0.245, y 0…1.04.
function basinGeos(w,n){
 const hw=w/2,tw=hw+.015,O=(o,y)=>oval({...o,y},n),out={hw:tw,zm:0,zb:-.245,zf:.245,pb:12,pf:12},bowl={hw:.185,zm:.035,zb:-.095,zf:.175,pb:3.2,pf:3.2};
 const ins=(o,d)=>({...o,hw:o.hw-d,zb:o.zb+d,zf:o.zf-d}),sc=(o,k)=>({...o,hw:o.hw*k,zb:o.zm+(o.zb-o.zm)*k,zf:o.zm+(o.zf-o.zm)*k});
 const top=loft([O(ins(out,.02),.75),hard(O(out,.75)),O(out,.83),O(ins(out,.005),.84),O(ins(bowl,-.012),.84),O(ins(bowl,-.003),.836),O(bowl,.82),O(sc(bowl,.9),.775),O(sc(bowl,.62),.727),O(sc(bowl,.28),.712)],{top:true});
 const carcass=merge([shut(box(-hw,KICK,-.23,hw,.75,.2),'py','pz','nz','ny'),shut(box(-hw+.015,0,-.23,hw-.015,KICK,.138),'pz','nz','ny')]);
 const doors=merge([box(-hw+.0015,.103,.2,-.0015,.745,.2+DOOR),box(.0015,.103,.2,hw-.0015,.745,.2+DOOR),box(-hw+.015,.005,.138,hw-.015,.095,.15)]);
 const joint=box(-.002,KICK,.198,.002,.75,.2);
 const f=.2+DOOR,handles={bar:merge([-1,1].flatMap(s=>[box(s*.035-.005,.55,f+.012,s*.035+.005,.67,f+.022),box(s*.035-.004,.565,f,s*.035+.004,.573,f+.012),box(s*.035-.004,.647,f,s*.035+.004,.655,f+.012)])),
  knob:merge([-1,1].map(s=>new THREE.CylinderGeometry(.013,.01,.024,12).rotateX(Math.PI/2).translate(s*.04,.66,f+.012))),
  pull:merge([-1,1].map(s=>box(s>0?.012:-hw+.012,.727,f,s>0?hw-.012:-.012,.745,f+.014)))};
 // Single-lever mixer: body on the locked riser's axis (0, −0.15), 0.155 m tall and 44 mm across; spout and lever apart.
 const riser=merge([cylY(0,.84,-.15,.023,.007,16),cylY(0,.846,-.15,.021,.139,16),cylY(0,.985,-.15,.021,.01,16,.016)]);
 const spout=merge([box(-.013,.944,-.135,.013,.966,-.035),cylY(0,.932,-.045,.009,.012,10),rod([0,.997,-.15],[0,1.032,-.212],.006,8)]);
 const drain=cylY(0,.7105,.035,.02,.003,12);
 return {top,carcass,doors,joint,handles,riser,spout,drain};
}
// Handles for a front: [axis 'x'|'z', face coordinate, out direction, u0, u1, y0, y1], kind door / drawer, opening side.
function frontHandles(F,kind,open){
 const [axis,face,dir,u0,u1,y0,y1]=F,P=(u,y,o)=>axis==='z'?[face+dir*o,y,u]:[u,y,face+dir*o];
 const B=(ua,ub,ya,yb,oa,ob)=>{const [x0,,z0]=P(ua,0,oa),[x1,,z1]=P(ub,0,ob);return box(Math.min(x0,x1),ya,Math.min(z0,z1),Math.max(x0,x1),yb,Math.max(z0,z1));};
 const um=(u0+u1)/2,ue=open==='lo'?u0+.045:u1-.045;
 const bar=kind==='drawer'?merge([B(um-.08,um+.08,y1-.051,y1-.039,.022,.032),B(um-.068,um-.06,y1-.049,y1-.041,0,.022),B(um+.06,um+.068,y1-.049,y1-.041,0,.022)])
  :merge([B(ue-.006,ue+.006,y1-.21,y1-.07,.022,.032),B(ue-.004,ue+.004,y1-.2,y1-.192,0,.022),B(ue-.004,ue+.004,y1-.088,y1-.08,0,.022)]);
 const kp=P(kind==='drawer'?um:ue,y1-.055,.012),knob=new THREE.CylinderGeometry(.013,.01,.024,12);
 if(axis==='z')knob.rotateZ(Math.PI/2);else knob.rotateX(Math.PI/2);knob.translate(...kp);
 const pull=B(u0+.012,u1-.012,y1-.018,y1,0,.014);
 return {bar,knob,pull};
}
// Kitchen fronts, joints behind the gaps, kicks and the home's handles for one run (KITCHEN_FRONTS).
function runFronts(R){
 const fronts=[],joints=[],kicks=[],hs={bar:[],knob:[],pull:[]},d=R.dir,face=R.plane+d*DOOR;
 const panel=(u0,u1,y0,y1)=>R.axis==='z'?box(Math.min(R.plane,face),y0,u0,Math.max(R.plane,face),y1,u1):box(u0,y0,Math.min(R.plane,face),u1,y1,Math.max(R.plane,face));
 const s0=R.plane,s1=R.plane+d*.002,strip=(u0,u1,y0,y1)=>R.axis==='z'?box(Math.min(s0,s1),y0,u0,Math.max(s0,s1),y1,u1):box(u0,y0,Math.min(s0,s1),u1,y1,Math.max(s0,s1));
 const handle=(u0,u1,y0,y1,kind,open)=>{const h=frontHandles([R.axis,face,d,u0,u1,y0,y1],kind,open);for(const k of Object.keys(hs))hs[k].push(h[k]);};
 for(const [u0,u1] of R.fill)fronts.push(panel(u0+GAP/2,u1-GAP/2,FRONT[0],FRONT[1]));
 const all=[...R.fill.map(([a,b])=>[a,b]),...R.mods].sort((p,q)=>p[0]-q[0]);
 for(const [u0,u1,kind,open] of R.mods){
  const a=u0+GAP/2,b=u1-GAP/2;
  if(kind==='drawers'){for(const [y0,y1] of DRAWERS){fronts.push(panel(a,b,y0,y1));handle(a,b,y0,y1,'drawer');}for(const [,y1] of DRAWERS.slice(0,-1))joints.push(strip(a,b,y1-.001,y1+.004));}
  else{fronts.push(panel(a,b,FRONT[0],FRONT[1]));handle(a,b,FRONT[0],FRONT[1],'door',open);}
 }
 for(const [,u1] of all.slice(0,-1))joints.push(strip(u1-.003,u1+.003,KICK,UNDER));
 const lo=Math.min(...all.map(m=>m[0])),hi=Math.max(...all.map(m=>m[1])),kd=R.kick-d*.012;
 joints.push(strip(lo,hi,KICK-.002,FRONT[0]+.002),strip(lo,hi,FRONT[1]-.002,UNDER));
 kicks.push(R.axis==='z'?box(Math.min(R.kick,kd),.005,lo,Math.max(R.kick,kd),.098,hi):box(lo,.005,Math.min(R.kick,kd),hi,.098,Math.max(R.kick,kd)));
 return {fronts,joints,kicks,hs};
}
// Shower fittings round a locked riser (x, z, bottom y0, top y1) and head (hx, hz) on a wall (axis 'x' at x = wall, or 'z').
function showerGeos({riser:[x,z],y0,y1,head:[hx,hz],wallAxis,wall}){
 const out=wallAxis==='z'?[0,Math.sign(z-wall)]:[Math.sign(x-wall),0],along=wallAxis==='z'?[1,0]:[0,1];
 const at=(u,o,y)=>[x+along[0]*u+out[0]*o,y,z+along[1]*u+out[1]*o],off=wallAxis==='z'?Math.abs(z-wall):Math.abs(x-wall),my=y0-.07;
 const W=(u,y)=>at(u,-off,y);
 const parts=[rod(at(-.105,0,my),at(.105,0,my),.026,16),rod(at(-.13,0,my),at(-.105,0,my),.031,16),rod(at(.105,0,my),at(.13,0,my),.031,16),
  rod(at(-.08,0,my),W(-.08,my),.011),rod(at(.08,0,my),W(.08,my),.011),rod(W(-.08,my),at(-.08,-off+.006,my),.03,16),rod(W(.08,my),at(.08,-off+.006,my),.03,16),
  rod(at(0,0,my+.02),at(0,0,y0+.005),.012),rod(at(0,0,y1-.012),[hx,y1-.012,hz],.009),rod(at(0,0,y1-.24),W(0,y1-.24),.007),rod(W(0,y1-.24),at(0,-off+.005,y1-.24),.02,12),
  rod(at(0,0,1.43),at(0,.05,1.43),.009),cylY(...at(0,0,0).map((v,i)=>i===1?1.415:v),.017,.03,12)];
 const hb=at(0,.06,1.40),ht=at(0,.075,1.58);parts.push(rod(hb,ht,.015,10),rod(at(0,.075,1.575),at(0,.105,1.6),.042,16));
 parts.push(tube([hb,at(.03,.07,1.1),at(.05,.06,.86),at(.04,.03,.9),at(0,0,my-.02)],.006,28,6));
 return merge(parts);
}
// Toilet-roll holder on a wall (axis 'x' at x = wall, or 'z'), centre u along the wall, roll axis parallel to the wall.
function rollGeos({wallAxis,wall,u,dir,y=.69}){
 const P=(a,o,yy)=>wallAxis==='x'?[wall+dir*o,yy,a]:[a,yy,wall+dir*o],B=(a0,a1,o0,o1,y0,y1)=>{const p=P(a0,o0,y0),q=P(a1,o1,y1);return box(Math.min(p[0],q[0]),y0,Math.min(p[2],q[2]),Math.max(p[0],q[0]),y1,Math.max(p[2],q[2]));};
 const axis=wallAxis==='x'?'z':'x',spindle=(a0,a1,o,yy,r,n)=>rod(P(a0,o,yy),P(a1,o,yy),r,n);
 return {holder:merge([B(u-.06,u+.06,0,.008,y+.03,y+.07),B(u+.052,u+.06,.008,.075,y+.04,y+.06),spindle(u-.055,u+.058,.072,y,.006,8)]),roll:merge([spindle(u-.05,u+.05,.072,y,.055,16)]),axis};
}

// --- Main ---------------------------------------------------------------------------------------------------------------
// M: the home's materials; owner: the left B group before batching; collisions: the owner's extra collision boxes (walking,
// contact shadows); tier: 'gpu' | 'phone' | 'soft'. Returns what was found, replaced, hidden and added, with outlines.
export function refineWetFixtures({M,owner,collisions,tier='gpu'}){
 const n=tier==='gpu'?40:tier==='phone'?28:20,rep={tier,found:[],missing:[],hidden:[],added:[],outline:{},collide:[]};
 const near=(a,b,e=2e-4)=>Math.abs(a-b)<=e,par=o=>o.geometry?.parameters||{};
 const is=(o,m,dims,[x,y,z])=>o.isMesh&&(typeof m==='string'?o.material?.color?.getHexString?.()===m:o.material===m)&&dims.every(([k,v])=>near(par(o)[k],v))&&near(o.position.x,x)&&near(o.position.y,y)&&near(o.position.z,z);
 const WHD=(w,h,d)=>[['width',w],['height',h],['depth',d]],CYL=(r,h)=>[['radiusTop',r],['height',h]];
 const one=(name,test,list=owner.children)=>{const l=list.filter(test);if(l.length!==1){rep.missing.push(`${name} (${l.length} found)`);return null;}rep.found.push(name);return l[0];};
 const add=(name,geo,m,parent=owner)=>{if(!geo||!m)return null;const q=new THREE.Mesh(geo,m);q.name=name;q.castShadow=q.receiveShadow=true;parent.add(q);rep.added.push(name);return q;};
 const handleMats={bar:M.handleBar,knob:M.handleKnob,pull:M.handlePull};

 // Toilets and basins: the groups toilet() and basin() put in the unit (three white parts; oak, white and two metal rods).
 const groups=owner.children.filter(g=>g.isGroup);
 const toilets=groups.filter(g=>g.children.length===3&&is(g.children[0],M.white,WHD(.35,.35,.48),[0,.175,0])&&is(g.children[1],M.white,WHD(.39,.055,.53),[0,.3675,0])&&is(g.children[2],M.white,WHD(.37,.48,.16),[0,.4,-.22]));
 const basins=groups.filter(g=>g.children.length===4&&g.children[0].material===M.oak&&near(par(g.children[0]).height,.75)&&near(par(g.children[0]).depth,.46)&&g.children[1].material===M.white&&near(par(g.children[1]).height,.09)&&g.children[2].material===M.metal&&g.children[3].material===M.metal);
 if(toilets.length!==2)rep.missing.push(`toilets (${toilets.length} found, 2 expected)`);
 if(basins.length!==2)rep.missing.push(`basins (${basins.length} found, 2 expected)`);
 const T=toiletGeos(n);
 for(const g of toilets){const id=`toilet@${r4(g.position.x)},${r4(g.position.z)}`,before=boxArr(localBox(g));
  swap(g.children[0],T.body.clone());swap(g.children[1],T.seat.clone());swap(g.children[2],T.tank.clone());add('toilet-button',T.button.clone(),M.metal,g);
  rep.outline[id]={rot:r4(g.rotation.y),before,after:boxArr(localBox(g))};rep.found.push(id);}
 for(const g of basins){const w=par(g.children[0]).width,id=`basin@${r4(g.position.x)},${r4(g.position.z)}`,before=boxArr(localBox(g)),B=basinGeos(w,n);
  swap(g.children[0],B.carcass);swap(g.children[1],B.top);swap(g.children[2],B.riser);swap(g.children[3],B.spout);
  add('basin-door',B.doors,M.door,g);add('basin-joint',B.joint,M.dark,g);add('basin-drain',B.drain,M.metal,g);for(const [k,m] of Object.entries(handleMats))add('basin-handle-'+k,B.handles[k],m,g);
  rep.outline[id]={rot:r4(g.rotation.y),w,before,after:boxArr(localBox(g))};rep.found.push(id);}

 // Kitchen (the locked kitchen segment's meshes, found by finish, size and place).
 const west=one('kitchen west carcass',o=>is(o,M.oak,WHD(.6,.86,2.7),[6.91,.43,1.67])),north=one('kitchen north carcass',o=>is(o,M.oak,WHD(1.85,.86,.58),[7.61,.43,.59]));
 const northTop=one('kitchen north worktop',o=>is(o,M.stone,WHD(1.85,.035,.64),[7.61,.8775,.59]));
 const plate=one('sink plate',o=>is(o,M.metal,WHD(.66,.02,.42),[7.6,.91,.59])),inner=one('sink inner',o=>is(o,'82908c',WHD(.53,.01,.3),[7.6,.923,.59]));
 const riser=one('kitchen faucet riser',o=>is(o,M.metal,CYL(.016,.27),[7.65,1.045,.36])),spout=one('kitchen faucet spout',o=>is(o,M.metal,CYL(.016,.22),[7.65,1.18,.47]));
 const hob=one('hob',o=>is(o,'25312a',WHD(.49,.012,.62),[6.9,.908,1.55])),burners=[1.37,1.72].map(z=>one('burner '+z,o=>is(o,M.metal,CYL(.12,.015),[6.92,.9225,z])));
 const fridge=one('fridge',o=>is(o,'a9b2a3',WHD(.62,1.94,.63),[8.48,.97,2.65])),fridgeHandle=one('fridge handle',o=>is(o,M.dark,WHD(.017,.02,.57),[8.145,1.11,2.65]));
 const pulls=[.6,1.2,1.9,2.6].map(z=>one('brass pull '+z,o=>is(o,M.brass,WHD(.016,.04,.18),[7.224,.67,z])));
 // Carcasses: fronts set back 18 mm for the doors, a plinth behind the kick; the north run open on top over the sink bowl.
 // Faces the doors, kicks, worktop, walls or the other runs cover are dropped: a software rasteriser would shade them under
 // the fronts for nothing (the joints behind the 3 mm gaps are dark strips, see runFronts).
 if(west)swap(west,merge([shut(box(6.61,KICK,.32,7.19,UNDER,3.02),'px','nx','py','ny','pz','nz'),shut(box(6.61,0,.32,7.138,KICK,3.02),'px','nx','ny','pz','nz')]));
 if(north)swap(north,merge([shut(box(6.685,KICK,.3,8.535,UNDER,.862),'px','nx','py','ny','pz','nz'),shut(box(6.685,0,.3,8.535,KICK,.812),'px','nx','ny','pz','nz')]));
 for(const q of pulls)if(q){q.visible=false;rep.hidden.push('brass pull '+r4(q.position.z));}
 // East run (CAD): carcass, kick plinth, worktop (L into the corner the north run leaves), upstands on the walls.
 const [ex0,ez0,ex1,ez1]=EAST_RUN.carcass;add('kitchen-east-carcass',merge([shut(box(ex0,KICK,ez0,ex1,UNDER,ez1),'px','nx','py','ny','pz','nz'),shut(box(8.332,0,ez0,ex1,KICK,ez1),'px','nx','ny','pz','nz')]),M.oak);
 add('kitchen-east-worktop',merge(EAST_RUN.worktop.map(([a,b,c,d])=>box(a,UNDER,b,c,TOP,d))),M.stone);
 // Splashback panels like the locked one on the hob wall (its finish, cut with the walls), on the east wall over the new run
 // and the north wall beside the window. (A stone upstand would be taken for the worktop by check-wet: it reads the worktop
 // height as the highest stone under 1 m.)
 const splash=one('kitchen splashback',o=>is(o,'d2d3be',WHD(.035,.48,2.55),[6.6,1.15,1.65]));
 // One mesh per panel (batchStatic merges them; apart here, each panel's box is its own for check-detail's sockets and switches).
 if(splash)for(const [k,g] of [['east',box(8.815,TOP,.335,8.85,1.39,ez1)],['north-east',box(8.3,TOP,.3,8.85,1.39,.335)],['north-west',box(6.6175,TOP,.3,7.1,1.39,.335)]])add('kitchen-splashback-'+k,g,splash.material);
 collisions?.push(EAST_RUN.collide);rep.collide.push(EAST_RUN.collide);
 const F={fronts:[],joints:[],kicks:[],hs:{bar:[],knob:[],pull:[]}};
 for(const R of Object.values(KITCHEN_FRONTS)){const r=runFronts(R);F.fronts.push(...r.fronts);F.joints.push(...r.joints);F.kicks.push(...r.kicks);for(const k of Object.keys(F.hs))F.hs[k].push(...r.hs[k]);}
 add('kitchen-fronts',merge([...F.fronts,...F.kicks]),M.door);add('kitchen-joints',merge(F.joints),M.dark);
 for(const [k,m] of Object.entries(handleMats))add('kitchen-handle-'+k,merge(F.hs[k]),m);
 // Sink: worktop cut, stainless rim on the plate's outline (its bottom 3 mm over the worktop, as the plate), bowl in the inner
 // plate's grey down to 0.70 m with a waste; gooseneck mixer on the riser's axis (7.65, 0.36). The locked parts stay under 1.28 m
 // (check-wetfix: a locked piece off the floor reaching higher must be cut with the walls): mixer 0.375 m tall, fridge handle to 1.27 m.
 const S={cx:7.6,cz:.59};
 if(northTop)swap(northTop,slabWithHoles([6.685,.27,8.535,.91],[[S.cx,S.cz,.3,.18,.035]],UNDER,TOP));
 const rimO={cx:S.cx,hw:.33,zm:S.cz,zb:S.cz-.21,zf:S.cz+.21,pb:14,pf:14},bowlO={cx:S.cx,hw:.295,zm:S.cz,zb:S.cz-.175,zf:S.cz+.175,pb:9,pf:9};
 const insO=(o,d)=>({...o,hw:o.hw-d,zb:o.zb+d,zf:o.zf-d});
 if(plate)swap(plate,loft([oval({...rimO,y:.897},n),oval({...insO(rimO,.004),y:.909},n),oval({...insO(bowlO,-.008),y:.909},n),oval({...bowlO,y:.903},n)]));
 if(inner)swap(inner,loft([oval({...bowlO,y:.903},n),oval({...insO(bowlO,.004),y:.86},n),hard(oval({...insO(bowlO,.018),y:.715},n)),oval({...insO(bowlO,.03),y:.70},n)],{top:true}));
 // One dark composite sink with the mixer: the bowl in graphite to match the rim. The rim keeps M.metal, which is how the
 // water-point export finds the locked sink (scripts/export-water-points.mjs).
 if(inner)inner.material=new THREE.MeshStandardMaterial({color:'#343c37',roughness:.6,metalness:0});
 add('sink-waste',cylY(S.cx+.12,.7,S.cz,.042,.004,16),M.metal);
 if(riser)swap(riser,merge([cylY(7.65,TOP,.36,.024,.012,16),cylY(7.65,TOP+.012,.36,.021,.29,16)]));
 if(spout)swap(spout,merge([tube([[7.65,1.19,.36],[7.65,1.243,.385],[7.65,1.26,.46],[7.65,1.234,.54],[7.65,1.205,.574]],.0125,24,10),cylY(7.65,1.13,.578,.019,.08,16),rod([7.672,1.06,.36],[7.74,1.09,.36],.006,8)]));
 // Hob: burner heads in place of the flat discs (same centres), cast pan supports in the hob's black, two knobs in front.
 burners.forEach((q,i)=>{if(!q)return;const z=[1.37,1.72][i];swap(q,merge([cylY(6.92,.914,z,.05,.012,20),cylY(6.92,.926,z,.036,.008,20)]));});
 if(hob){const parts=[];for(const z of [1.37,1.72]){parts.push(new THREE.TorusGeometry(.105,.005,6,24).rotateX(Math.PI/2).translate(6.92,.934,z));
   for(let k=0;k<5;k++){const a=k*2*Math.PI/5+.3,c=Math.cos(a),s=Math.sin(a);parts.push(rod([6.92+c*.06,.937,z+s*.06],[6.92+c*.11,.937,z+s*.11],.004,6),rod([6.92+c*.105,.914,z+s*.105],[6.92+c*.105,.934,z+s*.105],.004,6));}}
  add('hob-supports',merge(parts),hob.material);add('hob-knobs',merge([1.37,1.72].map(z=>cylY(7.105,.914,z,.022,.018,16))),M.metal);}
 // Fridge: body behind 30 mm fronts, a freezer drawer under the door (5 mm joint), a vent at the foot; handles on the fronts.
 if(fridge)swap(fridge,merge([shut(box(8.2,0,2.335,8.79,1.94,2.965),'nx','ny'),box(8.17,.06,2.338,8.2,.7,2.962),box(8.17,.705,2.338,8.2,1.94,2.962),box(8.19,0,2.36,8.2,.06,2.94)]));
 if(fridgeHandle)swap(fridgeHandle,merge([box(8.198,.7,2.338,8.2,.705,2.962),box(8.135,.9,2.915,8.147,1.27,2.927),box(8.147,.92,2.917,8.17,.93,2.925),box(8.147,1.24,2.917,8.17,1.25,2.925),
  box(8.135,.61,2.42,8.147,.622,2.88),box(8.147,.612,2.44,8.17,.62,2.45),box(8.147,.612,2.85,8.17,.62,2.86)]));

 // Showers and toilet rolls (wall-hung above 1.28 m: the cut twin, as the locked risers).
 // One mesh per bathroom and finish (batchStatic merges them; kept apart here so each can be checked where it stands).
 add('shower-fittings-bath1',showerGeos({riser:[.25,6.08],y0:1.2,y1:2.1,head:[.25,6.2],wallAxis:'z',wall:5.95}),M.metalCut);
 add('shower-fittings-bath2',showerGeos({riser:[6.83,3.38],y0:1.25,y1:2.05,head:[6.73,3.38],wallAxis:'x',wall:7}),M.metalCut);
 for(const [id,spec] of [['bath1',{wallAxis:'x',wall:1.7,u:6.7,dir:-1}],['bath2',{wallAxis:'z',wall:4.85,u:6.41,dir:-1}]]){const r=rollGeos(spec);add('roll-holder-'+id,r.holder,M.metal);add('toilet-roll-'+id,r.roll,M.white);}
 return rep;
}
