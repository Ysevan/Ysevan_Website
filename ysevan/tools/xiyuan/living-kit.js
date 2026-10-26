import * as THREE from 'three';
import {RoundedBoxGeometry} from './vendor/RoundedBoxGeometry.js?v=c1b7c9bd2c';
import {mergeGeometries,mergeVertices} from './utils/BufferGeometryUtils.js?v=fda7e946b8';
import {metricBoxUV} from './metric-uv.js?v=07dab91ffb';
// Fit-out round (2026-10-26): living room, dining, entry and south balcony pieces built to nominal product sizes instead of
// stacked boxes. Plan metres like app.js (x east, z south, y up). Outlines, positions and collision boxes are the ones the owner
// and Codex fixed (living-balcony.js LIVING_BOXES, app.js collide()); everything here stays inside them. Only the home's shared
// materials are used (M from app.js / material-kit.js), so batchStatic() folds every part into draw calls the unit already
// makes. Parts of one material in one piece are merged here already (fewer scene objects to build and batch).
// seg: the renderer tier's bevel segments (material-kit.js BEVEL.segments: 2 on GPUs, 1 on phones and software rasterisers),
// passed in by the caller (app.js's own BEVEL, or read off a box() it makes: tierSegments()); round parts take fewer facets
// there too. Nominal sizes are common catalogue values (GB/T 3326 table and chair heights, a typical 3-seat sofa, 60 cm front
// loaders, a round column air conditioner), not a particular brand.

// --- Geometry helpers ------------------------------------------------------------------------------------------------------
const KEEP=['position','normal','uv'];
// Metric UVs for any geometry (1 unit = 1 m), projected per vertex on the plane its normal faces; v runs along the longer side
// of that plane (the wood grain, like metricBoxUV).
export function metricUV(g){
 const p=g.attributes.position,n=g.attributes.normal,uv=new Float32Array(p.count*2),s=new THREE.Vector3();g.computeBoundingBox();g.boundingBox.getSize(s);
 for(let i=0;i<p.count;i++){const ax=Math.abs(n.getX(i)),ay=Math.abs(n.getY(i)),az=Math.abs(n.getZ(i));let u,v,su,sv;
  if(ax>=ay&&ax>=az){u=p.getZ(i);v=p.getY(i);su=s.z;sv=s.y;}else if(ay>=az){u=p.getX(i);v=p.getZ(i);su=s.x;sv=s.z;}else{u=p.getX(i);v=p.getY(i);su=s.x;sv=s.y;}
  if(su>sv){const t=u;u=v;v=t;}uv[i*2]=u;uv[i*2+1]=v;}
 g.setAttribute('uv',new THREE.BufferAttribute(uv,2));return g;}
const clean=g=>{const q=g.index?g.toNonIndexed():g;if(q!==g)g.dispose();for(const k of Object.keys(q.attributes))if(!KEEP.includes(k))q.deleteAttribute(k);return q;};
export function mergeGeo(list){const gs=list.filter(Boolean).map(clean),g=gs.length===1?gs[0]:mergeGeometries(gs,false);if(gs.length>1)gs.forEach(q=>q.dispose());return g;}
// Box between two corners; rounded edges (radius r, capped at a third of the shortest side like app.js box()) with metric UVs.
// Radii under 5 mm are not visible at room distance: those stay plain boxes (12 triangles instead of 108–300). Rounded ones
// take the tier's segments (seg) like every rounded box in the house (check:mat).
export function boxGeo(x0,y0,z0,x1,y1,z1,r=0,seg=1){const w=x1-x0,h=y1-y0,d=z1-z0;
 const g=metricBoxUV(r>=.005&&Math.min(w,h,d)>=.015?new RoundedBoxGeometry(w,h,d,seg,Math.min(r,w/3,h/3,d/3)):new THREE.BoxGeometry(w,h,d));g.translate((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);return g;}
// Tapered member, square or rectangular: bottom centre (x0, z0) at y0, top centre (x1, z1) at y1; widths across x (b) and z (d).
export function legGeo([x0,z0],[x1,z1],y0,y1,b0,b1,d0=b0,d1=b1){
 const g=new THREE.BoxGeometry(1,1,1),p=g.attributes.position;
 for(let i=0;i<p.count;i++){const t=p.getY(i)+.5,x=p.getX(i),z=p.getZ(i);p.setXYZ(i,x0+(x1-x0)*t+x*(b0+(b1-b0)*t),y0+(y1-y0)*t,z0+(z1-z0)*t+z*(d0+(d1-d0)*t));}
 g.computeVertexNormals();return metricUV(g);}
// Round post: radius r0 at the bottom (y0), r1 at the top (y1).
export function postGeo(x,y0,z,r0,r1,y1,n=12,open=false){const g=new THREE.CylinderGeometry(r1,r0,y1-y0,n,1,open);g.translate(x,(y0+y1)/2,z);return metricUV(g);}
// Rod between two points (radius r), n facets.
export function rodGeo(a,b,r,n=6){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),d=B.clone().sub(A),g=new THREE.CylinderGeometry(r,r,d.length(),n,1,true);
 g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize()));g.translate(...A.add(B).multiplyScalar(.5).toArray());return metricUV(g);}
// Turned profile [[radius, y], …] about (x, z).
export function latheGeo(x,y,z,profile,n=16){const g=new THREE.LatheGeometry(profile.map(([r,h])=>new THREE.Vector2(r,h)),n);g.translate(x,y,z);return metricUV(g);}
// Upholstered block w × h × d (x, y, z) centred on the origin: rounded edges, faces domed by bulge {top, front(+x), back(−x)};
// welded so the shading runs smoothly over the rounding. Fabric UVs in metres.
export function cushionGeo(w,h,d,r,seg,{top=0,front=0,back=0}={}){
 let g=new RoundedBoxGeometry(w,h,d,seg>1?2:1,Math.min(r,w/3,h/3,d/3));g.deleteAttribute('uv');g.deleteAttribute('normal');g=mergeVertices(g,1e-5);
 const p=g.attributes.position,hw=w/2,hh=h/2,hd=d/2;
 for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);const fx=Math.max(0,1-(x/hw)**2),fy=Math.max(0,1-(y/hh)**2),fz=Math.max(0,1-(z/hd)**2);
  if(y>0)y+=top*fx*fz*Math.min(1,y/hh*1.5);if(x>0)x+=front*fy*fz*Math.min(1,x/hw*1.5);else x-=back*fy*fz*Math.min(1,-x/hw*1.5);p.setXYZ(i,x,y,z);}
 g.computeVertexNormals();return metricUV(g);}
// One mesh per material for a piece; returns it (castShadow/receiveShadow like app.js box()).
export function addMesh(parent,geo,m,name){const q=new THREE.Mesh(geo,m);q.castShadow=true;q.receiveShadow=true;if(name)q.name=name;parent.add(q);return q;}
const roundN=seg=>seg>1?24:16;
// The tier's bevel segments as app.js box() uses them (its BEVEL instance), read off a throwaway rounded box.
export function tierSegments(box,m){const g=new THREE.Group(),q=box(0,0,0,.1,.1,.1,m,g,.02);const n=q.geometry.parameters?.segments||1;q.geometry.dispose();return n;}

// --- Dining chair (app.js chair()) ---------------------------------------------------------------------------------------------
// Local frame: seat centre over the origin, front towards −z. Solid-wood dining chair: seat 0.45 m high (GB/T 3326 seat 0.40–0.44
// plus the pad), pad 0.45 × 0.43, overall 0.845 m; legs taper 34 → 26 mm, the rear legs rise into back posts raked 2.6°, seat
// rails and an H stretcher; a bent-ply backrest 0.40 × 0.32, curved 12 mm and reclined 3.4°. Three meshes: frame (walnut),
// pad (linen), backrest (oak); the backrest is the only part 0.30–0.40 m tall (check:entry-dining finds the back by that).
// Stays inside the old chair's outline (x ±0.225, z −0.215…+0.2175) within 1 cm.
export function chairParts(g,M,seg=1){
 const F=[];
 for(const s of [-1,1]){
  F.push(legGeo([s*.205,-.192],[s*.196,-.176],0,.40,.026,.034));
  F.push(legGeo([s*.204,.205],[s*.196,.19],0,.40,.026,.034));
  F.push(legGeo([s*.196,.19],[s*.19,.21],.40,.845,.034,.026,.034,.024));
  F.push(boxGeo(s*.196-.009,.11,-.165,s*.196+.009,.13,.18));
  F.push(boxGeo(s*.196-.01,.345,-.16,s*.196+.01,.40,.175));
 }
 F.push(boxGeo(-.18,.345,-.186,.18,.40,-.166),boxGeo(-.18,.345,.18,.18,.40,.2),boxGeo(-.187,.11,.003,.187,.13,.021));
 addMesh(g,mergeGeo(F),M.walnut,'chair-frame');
 addMesh(g,boxGeo(-.225,.40,-.215,.225,.45,.215,.02,seg),M.linen,'chair-seat');
 // Backrest: annular sector in plan (chord 0.40, sagitta 12 mm, 18 mm thick) extruded 0.32 up, reclined 3.4° onto the posts.
 const c=.2,sg=.012,R=(c*c+sg*sg)/(2*sg),a=Math.asin(c/R),t=.018,n=seg>1?10:6,sh=new THREE.Shape();
 // Shape y is minus plan z (rotateX(−90°) below turns it back), so the concave face looks forward, at the sitter.
 for(let i=0;i<=n;i++){const q=-a+2*a*i/n,px=(R+t/2)*Math.sin(q),py=R-(R+t/2)*Math.cos(q);i?sh.lineTo(px,py):sh.moveTo(px,py);}
 for(let i=n;i>=0;i--){const q=-a+2*a*i/n;sh.lineTo((R-t/2)*Math.sin(q),R-(R-t/2)*Math.cos(q));}
 const b=new THREE.ExtrudeGeometry(sh,{depth:.32,bevelEnabled:false,curveSegments:1});b.rotateX(-Math.PI/2);b.rotateX(.06);b.translate(0,.525,.182);b.computeVertexNormals();
 addMesh(g,metricUV(b),M.oak,'chair-back');
 return g;
}

// --- Sofa (living-balcony.js, owner's 2.35 × 1.00 m straight sofa) -------------------------------------------------------------
// Within x 6.80–7.80, z 8.03–10.38: six 10 cm tapered legs, upholstered arms (0.16 × 1.00, top 0.75: the throw and check:furnish
// use that arm), back frame 0.78, seat deck, three seat cushions (seat 0.47 uncompressed ≈ 0.44 sat on, usable depth 0.56) with
// piped front edges, three loose back cushions reclined 11° (back 0.90 high). Typical 3-seat sofa: seat 0.42–0.45, depth 0.55–0.60,
// back 0.85–0.90, legs 0.10–0.15.
export const SOFA={x0:6.8,x1:7.8,z0:8.03,z1:10.38,arm:.16,seat:.47,back:7.2};
export function sofaParts(sofa,M,seg=1){
 const {x0,x1,z0,z1,arm}=SOFA,L=M.linen,zi0=z0+arm,zi1=z1-arm,n=roundN(seg)/2;
 // Added front to back (cushions, arms, deck, back frame): batchStatic() merges in this order, so on a software rasteriser
 // the parts hidden behind the cushions fail the depth test instead of being shaded and then overdrawn.
 const w=(zi1-zi0-.01)/3,seats=[],backs=[],pipes=[];
 for(let i=0;i<3;i++){const za=zi0+i*(w+.005),zb=za+w,zc=(za+zb)/2;
  const s=cushionGeo(.79,.17,w,.045,seg,{top:.012,front:.008});s.translate(x0+.195+.395,.30+.085,zc);seats.push(s);
  const k=cushionGeo(.18,.40,w,.05,seg,{front:.016,back:.004,top:.006});k.rotateZ(.2);k.translate(7.106,.684,zc);backs.push(k);
  for(const y of [.457,.313])pipes.push(rodGeo([7.773,y,za+.035],[7.773,y,zb-.035],.0045,seg>1?6:4));}
 addMesh(sofa,mergeGeo([...seats,...pipes]),L,'sofa-seat-cushions');addMesh(sofa,mergeGeo(backs),L,'sofa-back-cushions');
 for(const [a,b] of [[z0,zi0],[zi1,z1]])addMesh(sofa,boxGeo(x0,.10,a,x1,.75,b,.05,seg),L,'sofa-arm');
 addMesh(sofa,boxGeo(x0+.19,.10,zi0,x1-.01,.30,zi1,.04,seg),L,'sofa-deck');
 addMesh(sofa,boxGeo(x0,.10,zi0,x0+.19,.78,zi1,.04,seg),L,'sofa-back-frame');
 const legs=[];for(const x of [x0+.06,x1-.06])for(const z of [z0+.06,(z0+z1)/2,z1-.06])legs.push(postGeo(x,0,z,.016,.021,.105,n));
 addMesh(sofa,mergeGeo(legs),M.walnut,'sofa-legs');
 return sofa;
}

// --- Coffee table (furnish-layer.js table()) -----------------------------------------------------------------------------------
// The owner's 0.72 m square table (README v21 "0.72米方茶几"; footprint COFFEE 8.39–9.11 × 8.99–9.71): 25 mm stone top with
// eased edges at 0.355, walnut apron and four tapered legs (45 → 32 mm), a magazine shelf at 0.10. Coffee tables: 0.35–0.42 high.
export function coffeeTableParts(parent,M,seg=1,[x0,z0,x1,z1]=[8.39,8.99,9.11,9.71]){
 addMesh(parent,boxGeo(x0,.33,z0,x1,.355,z1,.008,seg),M.stone,'coffee-top');
 const F=[],i=.035,b=.045;
 for(const x of [x0+i,x1-i])for(const z of [z0+i,z1-i])F.push(legGeo([x,z],[x,z],0,.33,.032,b));
 for(const z of [z0+i-.01,z1-i-.01])F.push(boxGeo(x0+i+b/2,.27,z,x1-i-b/2,.33,z+.02));
 for(const x of [x0+i-.01,x1-i-.01])F.push(boxGeo(x,.27,z0+i+b/2,x+.02,.33,z1-i-b/2));
 F.push(boxGeo(x0+i,.085,z0+i,x1-i,.103,z1-i,.004,seg));
 addMesh(parent,mergeGeo(F),M.walnut,'coffee-frame');
}

// --- Dining table (app.js line after "// Dining area") ----------------------------------------------------------------------------
// 1.75 × 0.86 oak top 30 mm at 0.76 (GB/T 3326: 0.70–0.76; seat 0.45 → 0.31 to the top), 75 mm apron set in 60 mm, tapered
// walnut legs on the old leg centres (±0.65, ±0.30), 60 → 45 mm.
export function diningTableParts(parent,M,seg=1,{cx,cz,w,d,top=.76}){
 const x0=cx-w/2,x1=cx+w/2,z0=cz-d/2,z1=cz+d/2;
 addMesh(parent,boxGeo(x0,top-.03,z0,x1,top,z1,.012,seg),M.oak,'dining-top');
 const F=[],lx=.65,lz=.30;
 for(const a of [-1,1])for(const b of [-1,1])F.push(legGeo([cx+a*lx,cz+b*lz],[cx+a*lx,cz+b*lz],0,top-.03,.045,.06));
 for(const b of [-1,1])F.push(boxGeo(cx-lx+.03,top-.105,cz+b*lz-.01,cx+lx-.03,top-.03,cz+b*lz+.01));
 for(const a of [-1,1])F.push(boxGeo(cx+a*lx-.01,top-.105,cz-lz+.03,cx+a*lx+.01,top-.03,cz+lz-.03));
 addMesh(parent,mergeGeo(F),M.walnut,'dining-frame');
}
// Dining pendant: ceiling canopy Ø0.10, the cord (app.js rod) ends at yTop, white dome shade Ø0.30 × 0.15 with a brass cap and an
// opal diffuser closing the bottom (the light itself is app.js diningLight, unchanged).
export function pendantParts(parent,M,seg=1,x,yTop,z,ceiling=2.78){
 const n=roundN(seg);
 addMesh(parent,latheGeo(x,ceiling-.022,z,[[0,0],[.05,0],[.046,.022],[0,.022]],n/2),M.white,'pendant-canopy');
 addMesh(parent,latheGeo(x,yTop-.15,z,[[0,.004],[.15,0],[.15,.006],[.142,.03],[.12,.08],[.08,.125],[.03,.148],[0,.15]],n),M.white,'pendant-shade');
 addMesh(parent,postGeo(x,yTop-.012,z,.024,.016,yTop+.02,n/2),M.brass,'pendant-cap');
}

// --- TV storage wall (living-balcony.js, 3.10 × 0.40 × 2.55 m) --------------------------------------------------------------------
// x 10.10–10.50 (fronts face west), z 7.25–10.35. Built-in: 18 mm carcass panels, recessed walnut toe kick 0.10, 18 mm fronts
// with 3 mm joints; lower unit 0.40 (four drawers and an open AV cell 1.0 m in the middle), towers 0.55 wide with a door each,
// six push-to-open upper doors 0.56 high; the 2.00 × 1.49 niche keeps its oak back panel and the television hangs on it on a
// bracket (65-inch class, 1.46 × 0.83, 28 mm), 0.26 m behind the fronts: the recess stays open for ventilation. Handles in the
// preset's style (material-kit.js handle materials, only one visible), 10 mm proud so they stay inside the outline. Parts above
// 1.28 m take cut materials (oak here is living-balcony's cut twin).
export const TV={x0:10.1,xf:10.128,x1:10.5,z0:7.25,z1:10.35,nz0:7.8,nz1:9.8,cell:[8.3,9.3],low:.5,up:1.99,top:2.55,kick:.1,gap:.003};
export function tvWallParts(tv,M,{oak,darkCut,seg=1}){
 const {x0,xf,x1,z0,z1,nz0,nz1,low,up,top,kick,gap:g}=TV,[c0,c1]=TV.cell,t=.018,fx0=xf-t,fx1=xf;
 const carcass=[boxGeo(xf,0,z0,x1,top,z0+t),boxGeo(xf,0,z1-t,x1,top,z1),
  boxGeo(xf,kick,z0+t,x1,low,c0),boxGeo(xf,kick,c1,x1,low,z1-t),boxGeo(xf,kick,c0,x1,kick+t,c1),boxGeo(xf,low-t,c0,x1,low,c1),boxGeo(x1-.015,kick+t,c0,x1,low-t,c1),
  boxGeo(xf,low,z0+t,x1,up,nz0),boxGeo(xf,low,nz1,x1,up,z1-t),boxGeo(xf,up,z0+t,x1,top,z1-t),boxGeo(x1-.032,low,nz0,x1,up,nz1)];
 addMesh(tv,mergeGeo(carcass),oak,'tv-carcass');
 addMesh(tv,boxGeo(xf+.05,0,z0+t,x1-.02,kick,z1-t),M.walnut,'tv-toe-kick');
 // Fronts: lower drawers (white, below the cut), towers and uppers (cut white).
 // Each front stops half a joint short of its division line, so neighbours meet with one 3 mm joint.
 const h=g/2,lower=[[z0,nz0],[nz0,c0],[c1,nz1],[nz1,z1]].map(([a,b])=>[a+h,b-h]);
 const lowF=lower.map(([a,b])=>boxGeo(fx0,kick+h,a,fx1,low-h,b,.002,seg));
 const towers=[[z0+h,nz0-h],[nz1+h,z1-h]],upN=6,uw=(z1-z0)/upN-g;
 const highF=[...towers.map(([a,b])=>boxGeo(fx0,low+h,a,fx1,up-h,b,.002,seg)),...Array.from({length:upN},(_,i)=>{const a=z0+h+i*(uw+g);return boxGeo(fx0,up+h,a,fx1,top-h,a+uw,.002,seg);})];
 addMesh(tv,mergeGeo(lowF),M.white,'tv-front-lower');addMesh(tv,mergeGeo(highF),M.whiteCut,'tv-front-high');
 // Handles: drawers a 160 mm bar / knob / 1 mm pull line at the top centre; tower doors on the niche side at 1.0–1.26 m.
 const H={bar:[],knob:[],pull:[]},hx=x0;
 for(const [a,b] of lower){const zc=(a+b)/2;H.bar.push(boxGeo(hx,.43,zc-.08,fx0,.442,zc+.08,.003,seg));H.knob.push(postGeo(0,0,0,.012,.012,.01,10).rotateZ(Math.PI/2).translate(fx0,.44,zc));H.pull.push(boxGeo(fx0-.001,low-h-.012,a+.02,fx0,low-h-.004,b-.02));}
 for(const [a,b,s] of [...towers.map((t,i)=>[...t,i?-1:1])]){const ze=s>0?b-.045:a+.045;H.bar.push(boxGeo(hx,1.0,ze-.006,fx0,1.26,ze+.006,.003,seg));H.knob.push(postGeo(0,0,0,.014,.014,.01,10).rotateZ(Math.PI/2).translate(fx0,1.1,ze));H.pull.push(boxGeo(fx0-.001,.62,ze-.004,fx0,1.24,ze+.004));}
 for(const [k,m] of [['bar',M.handleBar],['knob',M.handleKnob],['pull',M.handlePull]])addMesh(tv,mergeGeo(H[k]),m||M.brass,'tv-handle-'+k);
 // Open AV cell: a router-sized box on the cell floor.
 addMesh(tv,boxGeo(10.2,kick+t,8.62,10.42,kick+t+.045,8.98,.006,seg),M.dark,'tv-cell-device');
 // Television on its bracket: body, screen, a slimmer back housing and the wall plate.
 const tz0=8.07,tz1=9.53,ty0=.81,ty1=1.64,tf=10.39;
 addMesh(tv,mergeGeo([boxGeo(tf+.003,ty0,tz0,tf+.031,ty1,tz1,.004,seg),boxGeo(tf+.031,ty0+.12,tz0+.3,tf+.05,ty1-.18,tz1-.3,.01,seg),boxGeo(tf+.05,ty0+.2,8.62,x1-.032,ty1-.26,8.98)]),darkCut,'tv-body');
 addMesh(tv,boxGeo(tf,ty0+.008,tz0+.008,tf+.003,ty1-.008,tz1-.008),M.metalCut,'tv-screen');
 return tv;
}
// Scribe fillers closing the 50 mm between the wall's back and the room wall (x 10.50–10.55) at both ends: outside the tv group,
// so the measured 3.10 × 0.40 outline is unchanged.
export function tvScribe(parent,oak){const q=new THREE.Group();q.name='tv-scribe';parent.add(q);
 for(const [a,b] of [[TV.z0,TV.z0+.018],[TV.z1-.018,TV.z1]])addMesh(q,boxGeo(TV.x1,0,a,10.548,TV.top,b),oak,'tv-scribe-panel');return q;}

// --- Floor-standing air conditioner (living-balcony.js, Ø0.48 × 1.80 m column) ----------------------------------------------------
// Round column indoor unit (3 hp class: Ø0.40–0.48 × 1.75–1.85 m): white turned body with an eased top, a recessed grey plinth,
// the front outlet (76° arc, 0.70–1.55 m) with horizontal vanes, a display window at 1.62 m and the low intake slots. Faces west.
export function acParts(ac,M,seg=1,{x=10.15,z=10.8,r=.24,h=1.8}={}){
 const n=seg>1?32:20,front=-Math.PI/2,arc=(a0,a1,rr,y0,y1)=>{const g=new THREE.CylinderGeometry(rr,rr,y1-y0,Math.max(4,Math.round(n*(a1-a0)/(2*Math.PI))),1,true,front+a0,a1-a0);g.translate(x,(y0+y1)/2,z);return metricUV(g);};
 addMesh(ac,latheGeo(x,0,z,[[0,.035],[r-.012,.035],[r-.012,.045],[r,.05],[r,h-.03],[r-.006,h-.012],[r-.022,h],[0,h]],n),M.white,'ac-body');
 addMesh(ac,postGeo(x,0,z,r-.014,r-.014,.036,n,true),M.metal,'ac-plinth');
 const A=.66,vanes=[],dark=[arc(-A,A,r+.0015,.70,1.55),arc(-.2,.2,r+.0015,1.595,1.645)];
 for(let i=0;i<12;i++){const y=.73+i*.067;vanes.push(arc(-A+.02,A-.02,r+.004,y,y+.014));}
 for(let i=0;i<6;i++){const y=.12+i*.045;dark.push(arc(-.9,.9,r+.001,y,y+.008));}
 addMesh(ac,mergeGeo(dark),M.dark,'ac-outlet');addMesh(ac,mergeGeo(vanes),M.white,'ac-vanes');
 return ac;
}

// --- Washer and dryer (living-balcony.js; machine-local frame, front towards −z) ------------------------------------------------
// 60 × 65 × 85 cm front loaders on four 35 mm feet: case (app check names it), control fascia with detergent / water-tank drawer,
// display and program dial, a light-grey door ring Ø0.46 with a domed smoked glass (30 mm proud) and a pull, a kick panel with
// the filter hatch. washer: true; the dryer's drawer is its condenser tank and its glass is bigger (Ø0.38).
export function applianceParts(m,M,seg=1,{washer=true}={}){
 const n=roundN(seg),D=-.325;
 const feet=[];for(const a of [-.25,.25])for(const b of [-.26,.26])feet.push(postGeo(a,0,b,.018,.022,.036,8));addMesh(m,mergeGeo(feet),M.dark,'appliance-feet');
 // Case: separate so check:living-balcony measures it (0.60 × 0.65, 0.035–0.85).
 const kase=new THREE.Mesh(boxGeo(-.3,.035,-.325,.3,.85,.325,.02,seg),M.white);kase.castShadow=kase.receiveShadow=true;kase.name='appliance-case';m.add(kase);
 const F=[boxGeo(-.285,.73,D-.008,.285,.835,D,.004,seg),boxGeo(-.285,.045,D-.004,.285,.115,D,.002,seg)];
 addMesh(m,mergeGeo(F),M.stone,'appliance-fascia');
 const drawerX=-.19,dark=[boxGeo(drawerX-.08,.75,D-.016,drawerX+.08,.815,D-.008,.003,seg),boxGeo(-.02,.765,D-.014,.11,.805,D-.008,.002,seg),boxGeo(.19,.06,D-.008,.26,.1,D-.004,.002,seg)];
 addMesh(m,mergeGeo(dark),M.dark,'appliance-panels');
 const ring=new THREE.TorusGeometry(washer?.205:.21,.024,seg>1?8:6,n);ring.translate(0,.42,D-.02);
 // Glass: a spherical cap Ø0.36 (dryer 0.38), 30 mm proud of the ring's plane.
 const gr=washer?.18:.19,GR=(gr*gr+.03*.03)/.06,th=Math.asin(gr/GR),glass=new THREE.SphereGeometry(GR,n,3,0,Math.PI*2,0,th);glass.rotateX(-Math.PI/2);glass.translate(0,.42,D-.02+GR*Math.cos(th));
 const dial=postGeo(0,0,0,.028,.024,.022,n).rotateX(-Math.PI/2).translate(.2,.785,D-.008);
 addMesh(m,metricUV(ring),M.stone,'appliance-door-ring');addMesh(m,dial,M.metal,'appliance-dial');
 addMesh(m,mergeGeo([metricUV(glass)]),M.dark,'appliance-door-glass');
 const hand=boxGeo(.212,.37,D-.048,.238,.47,D-.022,.008,seg);addMesh(m,hand,M.white,'appliance-door-handle');
 return m;
}
// Laundry counter 1.40 × 0.75, top 0.94, underside 0.90 (living-balcony LIVING_BOXES.laundry): 20 mm solid-surface top with a
// 40 mm front edge, a 8 mm water lip along the front and a 60 mm upstand against the platform wall, end panels and a middle
// support between the machines, all inside x 4.48–5.23, z 11.85–13.25.
export function laundryCounterParts(laundry,M,{oak,seg=1,box:[x0,z0,x1,z1]}){
 const top=addMesh(laundry,mergeGeo([boxGeo(x0,.90,z0,x1,.94,z1,.006,seg)]),M.stone,'continuous-laundry-counter');
 addMesh(laundry,boxGeo(x1-.012,.94,z0+.006,x1-.002,.948,z1-.006,.003,seg),M.stone,'laundry-front-lip');addMesh(laundry,boxGeo(x0,.94,z0,x0+.02,1.0,z1,.004,seg),M.stone,'laundry-upstand');
 for(const [a,b] of [[z0,z0+.03],[z1-.03,z1]])addMesh(laundry,boxGeo(x0,0,a,x1,.90,b,.006,seg),oak,'laundry-counter-support');
 addMesh(laundry,boxGeo(x0+.02,0,12.538,x1-.03,.90,12.558,.004,seg),oak,'laundry-counter-support');
 return top;
}

// --- Tea table and set (living-balcony.js, 0.80 × 0.55 m) -----------------------------------------------------------------------
// Oak top 30 mm at 0.735, 60 mm apron set in 45 mm, tapered legs 42 → 32 mm; a walnut tray with a clay teapot and two cups.
export function teaTableParts(tea,M,seg=1,{box:[x0,z0,x1,z1],top=.735,oak}){
 addMesh(tea,boxGeo(x0,top-.03,z0,x1,top,z1,.01,seg),oak||M.oak,'tea-tabletop');
 const F=[],i=.045;
 for(const x of [x0+i,x1-i])for(const z of [z0+i,z1-i])F.push(legGeo([x,z],[x,z],0,top-.03,.032,.042));
 for(const z of [z0+i,z1-i])F.push(boxGeo(x0+i,top-.09,z-.009,x1-i,top-.03,z+.009));
 for(const x of [x0+i,x1-i])F.push(boxGeo(x-.009,top-.09,z0+i,x+.009,top-.03,z1-i));
 addMesh(tea,mergeGeo(F),M.oak,'tea-frame');
 const cx=(x0+x1)/2,cz=(z0+z1)/2,ty=top+.018,n=roundN(seg)/2+4;
 addMesh(tea,boxGeo(cx-.18,top,cz-.12,cx+.18,ty,cz+.12,.006,seg),M.walnut,'tea-tray');
 addMesh(tea,mergeGeo([latheGeo(cx-.02,ty,cz-.03,[[0,0],[.04,0],[.058,.03],[.06,.06],[.045,.09],[.02,.1],[.022,.112],[0,.115]],n),rodGeo([cx+.03,ty+.05,cz-.03],[cx+.085,ty+.095,cz-.03],.009,5),rodGeo([cx-.075,ty+.06,cz-.03],[cx-.135,ty+.072,cz-.03],.007,6)]),M.terracotta,'tea-pot');
 addMesh(tea,mergeGeo([-1,1].map(s=>latheGeo(cx+s*.11,ty,cz+.06,[[0,0],[.018,0],[.02,.004],[.032,.035],[.034,.04],[.031,.04],[.028,.03],[0,.03]],n))),M.white,'tea-cups');
}

// --- Entry (furnish-layer.js entry()): full-length mirror frame and the hook rail ------------------------------------------------
// Mirror 0.56 × 1.50 glass in a 30 mm brass-finish aluminium frame (all cut: it hangs above 1.28 m); hook rail 0.62 × 0.07 in the
// cabinet finish with four brass double-prong hooks (rose, arm, upturned tip), 1.58–1.65 m.
export function entryMirrorFrame(parent,M,{seg=1,x=9.29,y0=.3,y1=1.86,z=1.2,w=.62,t=.03,d=.026}){
 const F=[boxGeo(x-w/2,y0,z,x-w/2+t,y1,z+d,.003,seg),boxGeo(x+w/2-t,y0,z,x+w/2,y1,z+d,.003,seg),boxGeo(x-w/2+t,y0,z,x+w/2-t,y0+t,z+d,.003,seg),boxGeo(x-w/2+t,y1-t,z,x+w/2-t,y1,z+d,.003,seg),boxGeo(x-w/2+t,y0+t,z,x+w/2-t,y1-t,z+.004)];
 return addMesh(parent,mergeGeo(F),M.brassCut||M.brass,'mirror-frame');
}
export function entryHooks(parent,M,{seg=1,x=8.95,y=1.615,z0=1.54,z1=2.16,zs=[1.61,1.77,1.93,2.09]}){
 addMesh(parent,boxGeo(x,y-.035,z0,x+.02,y+.035,z1,.004,seg),M.doorCut||M.oak,'hook-rail');
 for(const z of zs){const hk=mergeGeo([postGeo(0,0,0,.011,.011,.008,10).rotateZ(-Math.PI/2).translate(x+.024,y,z),rodGeo([x+.026,y,z],[x+.062,y-.022,z],.0045,6),rodGeo([x+.062,y-.022,z],[x+.07,y+.004,z],.0045,6),rodGeo([x+.026,y+.004,z],[x+.05,y+.03,z],.0035,6)]);addMesh(parent,hk,M.brassCut||M.brass,'hook');}
}
