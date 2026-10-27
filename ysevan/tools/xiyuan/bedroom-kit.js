import * as THREE from 'three';
import {ROOM_DECOR} from './layout-data.js?v=3e32bfce2c';
import {BEDROOMS} from './furnish-layer.js?v=bc9ae48c34';
// Bedroom furniture after real products (fit-out round, 2026-10-26): beds, headboards, nightstands, freestanding wardrobes,
// desks, chairs and the sofa bed, built inside the outlines the layouts already give them (footprints, collision boxes and
// named meshes are unchanged). Plan metres like app.js; every part is a box()/cylinder in the home's existing materials, so
// batchStatic() folds them into draw calls the groups already make. Large faces take box()'s bevel (material-kit.js grades:
// casework 1–1.5 cm, upholstery 4–8 cm); small parts stay plain boxes (12 triangles) to keep phones and software rendering light.
// Nominal sizes (common catalogue sizes, not one maker's drawing):
//  bed legs 4.5–5 cm square, 10–13 cm high; side rails 19–20 cm; upholstered headboard 8–12 cm thick, channels 13–17 cm wide,
//  stitch line 5–6 mm; nightstand drawers 3 mm gaps; office chair seat 0.44–0.50 m high, 5-star base 0.55–0.60 m across,
//  casters 50 mm; steel desk frame 60 × 30 mm sections, feet 60 mm; wardrobe doors 2–3 mm gaps, toe kick 80 mm.

// --- Ground: legs stand on the floor, or on a rug's top where a rug lies under them ----------------------------------------
// Rugs per layout: the south room's ROOM_DECOR rug, furnish-layer.js BEDROOMS rugs, and the rug app.js's fit-out loop lays
// in the original master (2.4 × 2.7 m at 1.35, 9.8). Rug top 0.035 m (app.js rug()). check:bedroom-kit measures the real rugs.
export const RUG_TOP=.035;
const FITOUT_RUGS={original:[[.15,8.45,2.55,11.15]],redesign:[[.3,8.45,3.2,11.15]]};
export function rugsOf(layout){if(!layout)return [];return [...(ROOM_DECOR[layout]?[ROOM_DECOR[layout].rug.box]:[]),...(BEDROOMS[layout]||[]).filter(r=>r.rug).map(r=>r.rug),...(FITOUT_RUGS[layout]||[])];}
export function groundOf(layout){const R=rugsOf(layout);return (x,z)=>R.some(([a,b,c,d])=>x>a-.03&&x<c+.03&&z>b-.03&&z<d+.03)?RUG_TOP:0;}
// Plan point of local (u, v) in a group at (cx, cz) turned by rot about y (three.js: x' = x cos + z sin, z' = −x sin + z cos).
export const toWorld=(cx,cz,rot)=>(u,v)=>[cx+u*Math.cos(rot)+v*Math.sin(rot),cz-u*Math.sin(rot)+v*Math.cos(rot)];
const localGround=(layout,cx,cz,rot)=>{const g=groundOf(layout),w=toWorld(cx,cz,rot);return (u,v)=>g(...w(u,v));};

// Plain cylinder (shadow flags like box(), so it batches with the group's boxes).
export function cylinder(parent,x,y,z,r,h,m,seg=10,rt=r){const q=new THREE.Mesh(new THREE.CylinderGeometry(rt,r,h,seg),m);q.position.set(x,y+h/2,z);q.castShadow=q.receiveShadow=true;parent.add(q);return q;}
// Bar from a to b (local points), square section s.
function bar(parent,a,b,s,m){const A=new THREE.Vector3(...a),Bv=new THREE.Vector3(...b),d=Bv.clone().sub(A),q=new THREE.Mesh(new THREE.BoxGeometry(s,d.length(),s),m);q.position.copy(A.add(Bv).multiplyScalar(.5));q.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());q.castShadow=q.receiveShadow=true;parent.add(q);return q;}
// Square legs s × s from the ground (ground(u, v), local) up to `top`.
function legs(B,pts,top,s,m,ground=()=>0){for(const [u,v] of pts){const y=ground(u,v);B(u,y,v,s,top-y,s,m);}}
// Channel-stitched upholstery: n padded strips across x0…x1 with a stitch gap between them, y0…y1, z0 (back) to z1 (face).
function channels(B,{x0,x1,y0,y1,z0,z1,n,m,gap=.006,r=.012}){const w=(x1-x0-gap*(n-1))/n;for(let i=0;i<n;i++)B(x0+w/2+i*(w+gap),y0,(z0+z1)/2,w,y1-y0,z1-z0,m,r);}

// --- Beds (local frame: width across x, length along z, head at −z) ----------------------------------------------------------
// Owner's slim platform bed (owner-master-bed.js): frame 1.88 × 2.10 × 0.20 on four 45 mm legs inset 70 mm; a 30 mm headboard:
// walnut backing board (the named headboard, 12 mm) under twelve padded channels 18 mm thick with 5 mm stitch lines, 2 cm of
// the backing showing round them. The legs stand on the rug where one lies under them.
export function slimBedParts(B,{width,length,ground},M){
 const fw=width+.08,fl=length+.10,frame=B(0,.10,0,fw,.20,fl,M.oak,.015);
 legs(B,[-1,1].flatMap(a=>[-1,1].map(b=>[a*(fw/2-.07),b*(fl/2-.08)])),.10,.045,M.oak,ground);
 const mattress=B(0,.32,0,width,.20,length,M.white,.035);
 const hz=-length/2-.035,head=B(0,.30,hz+.006,fw,.72,.012,M.walnut,.004);
 channels(B,{x0:-fw/2+.02,x1:fw/2-.02,y0:.32,y1:1.0,z0:hz+.012,z1:hz+.03,n:12,m:M.olive,gap:.005,r:.006});
 return {frame,mattress,head};
}
// Upholstered headboard in a timber frame, back at zb, depth d, top y1, across ±w/2: two posts to the ground, a top rail, an
// olive backing and channel padding between the posts. Oak parts along a wall are deeper than 5 cm (check:decor reads a thin oak
// strip 1 m long on a headboard wall as the wainscot), the padding stops at the face.
function framedHeadboard(B,{w,zb,d,y0,y1,M,ground,rail=.05,post=.06,pad=.04,n}){
 const zc=zb+(d-.01)/2,inner=w-2*post;
 for(const s of [-1,1]){const y=ground(s*(w/2-post/2),zc);B(s*(w/2-post/2),y,zc,post,y1-y,d-.01,M.oak,.01);}
 B(0,y1-rail,zc,inner,rail,d-.01,M.oak,.01);
 B(0,y0,zb+(d-pad)/2,inner,y1-rail-y0,d-pad,M.olive,.008);
 channels(B,{x0:-inner/2,x1:inner/2,y0:Math.max(y0,.28),y1:y1-rail-.004,z0:zb+d-pad,z1:zb+d,n:n||Math.max(4,Math.round(inner/.155)),m:M.olive,gap:.006,r:.014});
}
// Generic bed (app.js bed(): the owner's original south bed and the neighbours' beds), outline as before: frame (W + 0.12) ×
// (L + 0.12) at 0.13–0.32, headboard W + 0.20 wide, 0.12 deep, top 1.08. Frame on four legs; timber-framed upholstered headboard.
export function createBed({cx,cz,width,length=2,rot=0,layout=null},{box,M,parent,bedding}){
 const g=new THREE.Group();g.position.set(cx,0,cz);g.rotation.y=rot;g.name='bed';parent.add(g);
 const B=(x,y,z,w,h,d,m,r=0)=>box(x,y,z,w,h,d,m,g,r),ground=localGround(layout,cx,cz,rot),fw=width+.12,fl=length+.12;
 B(0,.13,0,fw,.19,fl,M.oak,.015);
 legs(B,[-1,1].flatMap(a=>[[a*(fw/2-.06),fl/2-.07],[a*(fw/2-.06),-fl/2+.14]]),.13,.05,M.oak,ground);
 B(0,.32,0,width,.2,length,M.white,.08);
 framedHeadboard(B,{w:width+.2,zb:-length/2-.12,d:.12,y0:.16,y1:1.08,M,ground});
 bedding(g,{width,length,top:.52,M});return g;
}
// Compact single bed (original north room; the hidden redesign's north-west bed): mattress W × 2.00, frame (W + 0.06) × 2.08 at
// 0.08–0.30 on four legs, a slatted oak headboard 0.04 deep standing on its posts, top 0.82 (as before).
export function createCompactBed({cx,cz,rot,width,layout},{box,M,parent,bedding}){
 const nb=new THREE.Group();nb.position.set(cx,0,cz);nb.rotation.y=rot;nb.name='compact-bed';parent.add(nb);
 const B=(x,y,z,w,h,d,m,r=0)=>box(x,y,z,w,h,d,m,nb,r),ground=localGround(layout,cx,cz,rot),fw=width+.06;
 B(0,.08,0,fw,.22,2.08,M.oak,.015);
 legs(B,[-1,1].flatMap(a=>[[a*(fw/2-.05),.97],[a*(fw/2-.05),-.9]]),.08,.045,M.oak,ground);
 B(0,.30,0,width,.18,2,M.white,.03);
 for(const s of [-1,1]){const y=ground(s*(fw/2-.025),-1.02);B(s*(fw/2-.025),y,-1.02,.05,.82-y,.04,M.oak,.01);}
 B(0,.76,-1.02,fw-.1,.06,.04,M.oak,.01);B(0,.30,-1.02,fw-.1,.05,.04,M.oak);
 const n=Math.round((fw-.1)/.075),sw=.045,step=(fw-.1-sw)/(n-1);for(let i=0;i<n;i++)B(-(fw-.1)/2+sw/2+i*step,.35,-1.025,sw,.41,.025,M.oak);
 bedding(nb,{width,length:2,top:.48,M,fit:[width/2+.03,1.04]});return nb;
}
// Concept-layout bed in its plan box (concept-rooms.js): frame over the whole box at 0.10–0.30 on legs, mattress as before,
// timber-framed upholstered headboard 0.07 deep at the head wall (1 cm off it), top 0.87 (sconces hang above it).
export function conceptBedParts(item,parent,{box,M,layout}){
 const [x,z,X,Z]=item.box,cx=(x+X)/2,cz=(z+Z)/2,w=X-x,d=Z-z,east=item.head==='east',rot=east?-Math.PI/2:Math.PI/2;
 const g=new THREE.Group();g.position.set(cx,0,cz);g.rotation.y=rot;parent.add(g);
 const B=(x0,y,z0,ww,h,dd,m,r=0)=>box(x0,y,z0,ww,h,dd,m,g,r),ground=localGround(layout,cx,cz,rot);
 // Mattress as before (centred, or 0.10 m off the head wall for a slim frame); where the frame is only 8 cm longer than the
 // mattress (1.5 m bed, 2.08 m frame) it moves to 1 cm off the foot so the headboard no longer cuts into it.
 const mw=item.mattress[1],md=item.mattress[0],zb=-w/2+.01;let mv=item.slimFrame?-w/2+.1+mw/2:0;
 if(mv-mw/2-.005-zb<.05)mv=w/2-.012-mw/2;
 const hd=Math.min(.07,mv-mw/2-.005-zb),mattressX=cx+(east?-mv:mv);
 B(0,.10,hd/2+.005,d,.20,w-hd-.01,M.oak,.015);
 legs(B,[-1,1].flatMap(a=>[[a*(d/2-.07),w/2-.08],[a*(d/2-.07),-w/2+.16]]),.10,.05,M.oak,ground);
 const mattress=B(0,.31,mv,md,.18,mw,M.white,.055);
 framedHeadboard(B,{w:d-.035,zb,d:hd,y0:.11,y1:.87,M,ground,post:.06,pad:Math.min(.035,hd-.02)});
 return {group:g,mattress,mattressX};
}

// --- Nightstand (app.js nightstand(): the neighbours' units) ---------------------------------------------------------------
// Outline as before: 0.42 × 0.42, top 0.47, lamp on top. Carcass on a 5 cm plinth, two drawers with 3 mm gaps, a short bar pull
// each; front faces local +z (rot turns it to the room).
export function createNightstand({x,z,rot=0},{box,cyl,M,parent}){
 const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;parent.add(g);const B=(a,y,c,w,h,d,m,r=0)=>box(a,y,c,w,h,d,m,g,r);
 B(0,0,-.01,.36,.05,.36,M.walnut);
 B(0,.445,0,.42,.025,.42,M.oak,.01);for(const s of [-1,1])B(s*.2,.05,0,.02,.395,.42,M.oak);B(0,.05,-.2,.38,.395,.02,M.oak);B(0,.05,0,.38,.018,.40,M.oak);
 for(const [y0,h] of [[.071,.181],[.255,.187]]){B(0,y0,.19,.374,h,.018,M.oak,.006);B(0,y0+h/2-.006,.204,.09,.012,.01,M.brass);}
 cyl(0,.47,0,.1,.21,M.stone,g);cyl(0,.68,0,.16,.2,M.linen,g,.12);return g;
}

// --- Freestanding wardrobe (app.js wardrobe(): the neighbours' units) ------------------------------------------------------
// Outline as before (w × d × h); doors on the long side facing the room (face: 'south' = +z, 'west' = −x, 'east' = +x; default
// +z when w ≥ d, else −x): an 80 mm toe kick set back 40 mm, carcass, hinged doors about 0.5 m wide with 3 mm gaps, bar pulls.
export function createWardrobe({x,z,w,d,h=2.38,face},{box,M,parent}){
 face=face||(w>=d?'south':'west');const along=face==='south'?w:d,deep=face==='south'?d:w;
 const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y={south:0,west:-Math.PI/2,east:Math.PI/2}[face];parent.add(g);const B=(a,y,c,ww,hh,dd,m,r=0)=>box(a,y,c,ww,hh,dd,m,g,r);
 B(0,0,-.02,along-.04,.08,deep-.04,M.walnut);
 B(0,.08,-.015,along,h-.08,deep-.03,M.oak,.01);
 const n=Math.max(1,Math.round(along/.5)),dw=(along-.003*(n+1))/n;
 for(let i=0;i<n;i++){const u=-along/2+.003+dw/2+i*(dw+.003);B(u,.083,deep/2-.021,dw,h-.086,.018,M.oak,.004);const hx=u+(i%2?-1:1)*(dw/2-.05);B(hx,.95,deep/2-.006,.014,.22,.012,M.brass);}
 return g;
}

// --- Desks and chairs ------------------------------------------------------------------------------------------------------
// Steel desk frame (local: length along x, depth along z, user at +z): two side frames (60 × 30 mm feet on the floor, an upright,
// a top bearer), a back beam, an open cable tray under the back edge and a grommet; at the side frames' x positions xs.
export function deskFrame(B,{xs,depth,top,M,metal=M.metal,tray=true,trayLen}){
 for(const u of xs){B(u,0,0,.06,.03,depth-.06,metal);B(u,.03,-.02,.06,top-.06,.05,metal);B(u,top-.03,0,.06,.03,depth-.1,metal);}
 const span=Math.abs(xs[1]-xs[0]);B((xs[0]+xs[1])/2,top-.12,-depth/2+.09,span,.06,.025,metal);
 if(tray){const L=trayLen||span-.2;B((xs[0]+xs[1])/2,top-.2,-depth/2+.12,L,.008,.14,metal);B((xs[0]+xs[1])/2,top-.2,-depth/2+.19,L,.07,.006,metal);}
}
// Monitor arm clamped to the back edge (local: desk back at zb, top at y): clamp, pole, an arm at armY to a VESA bracket on the
// screen's back (screenZ: the back face). The bracket reaches below the arm, so the screen hangs from it (check:mat's support chain).
export function monitorArm(B,parent,{x,zb,y,armY,screenZ,M,metal=M.metal}){
 B(x,y-.05,zb+.035,.06,.05,.07,metal);B(x,y,zb+.035,.06,.015,.07,metal);
 cylinder(parent,x,y+.015,zb+.035,.016,armY+.02-y-.015,metal,8);
 B(x,armY-.02,(zb+.035+screenZ)/2,.04,.04,Math.abs(screenZ-zb-.035),metal);B(x,armY-.02,screenZ-.006,.1,.2,.012,metal);
}
// Office chair facing −z (backrest at +z), base radius rb: five-spoke base with casters, gas lift, seat on a shell, curved
// backrest in three tilted panels (lumbar to shoulders), arms. seat: seat fabric, back: back fabric.
export function officeChair(B,parent,{M,seat=M.olive,back=M.linen,frame=M.metal,dark=M.dark,rb=.27,seatY=.44,backTop=1.0,head=false,arms=true}){
 for(let i=0;i<5;i++){const a=i*Math.PI*2/5+Math.PI/2,ex=Math.cos(a)*(rb-.035),ez=Math.sin(a)*(rb-.035);bar(parent,[Math.cos(a)*.04,.075,Math.sin(a)*.04],[ex,.055,ez],.03,frame);cylinder(parent,ex,0,ez,.024,.045,dark,8);}
 cylinder(parent,0,.05,0,.05,.05,frame,10,.045);cylinder(parent,0,.1,0,.022,seatY-.16,frame,8);cylinder(parent,0,.1,0,.032,.16,dark,8);
 B(0,seatY-.06,0,.24,.03,.24,dark);B(0,seatY-.035,0,.47,.03,.45,dark,.01);B(0,seatY-.01,-.015,.49,.075,.44,seat,.035);
 bar(parent,[0,seatY-.04,.11],[0,seatY+.12,.165],.04,frame);
 // Backrest: three panels, each tilted a little further back (lumbar, middle, shoulders), 50 mm thick, inside the chair box.
 const panel=(y0,y1,z0,z1,w,m)=>{const q=bar(parent,[0,y0,z0],[0,y1,z1],.05,m);q.scale.set(w/.05,1,1);return q;};
 const t=(backTop-seatY-.1)/3;panel(seatY+.1,seatY+.1+t,.165,.175,.42,back);panel(seatY+.1+t,seatY+.1+2*t,.175,.192,.46,back);panel(seatY+.1+2*t,backTop,.192,.212,.44,back);
 if(head)panel(backTop-.01,backTop+.145,.212,.222,.28,back);
 if(arms)for(const s of [-1,1]){B(s*.235,seatY-.02,.03,.025,.22,.03,frame);B(s*.235,seatY+.2,.01,.06,.025,.24,dark,.008);}
}
// Timber writing desk (original north room: 1.20 × 0.60, top 0.75): local length along x, user at +z. A 40 mm top with 1 cm
// edges on four 45 mm legs, aprons 90 mm deep, a shallow drawer in the user-side apron (3 mm gaps, a small bar pull).
export function createWritingDesk({cx,cz,rot,len,dep,top=.75},{box,M,parent}){
 const g=new THREE.Group();g.position.set(cx,0,cz);g.rotation.y=rot;g.name='writing-desk';parent.add(g);const B=(x,y,z,w,h,d,m,r=0)=>box(x,y,z,w,h,d,m,g,r);
 B(0,top-.04,0,len,.04,dep,M.oak,.01);
 for(const sx of [-1,1])for(const sz of [-1,1])B(sx*(len/2-.04),0,sz*(dep/2-.04),.045,top-.04,.045,M.oak);
 B(0,top-.13,-dep/2+.04,len-.17,.09,.02,M.oak);for(const sx of [-1,1])B(sx*(len/2-.04),top-.13,0,.02,.09,dep-.17,M.oak);
 const span=len-.17,dw=.46,side=(span-dw-.006)/2;
 for(const sx of [-1,1])B(sx*(dw/2+.003+side/2),top-.13,dep/2-.05,side,.09,.02,M.oak);
 B(0,top-.127,dep/2-.05,dw,.084,.02,M.oak,.004);B(0,top-.09,dep/2-.035,.1,.01,.01,M.brass);
 return g;
}
// Side chair group at (cx, cz), facing local −z turned by rot (sideChair below).
export function createSideChair({cx,cz,rot},{box,M,parent}){const g=new THREE.Group();g.position.set(cx,0,cz);g.rotation.y=rot;g.name='side-chair';parent.add(g);sideChair((x,y,z,w,h,d,m,r=0)=>box(x,y,z,w,h,d,m,g,r),{M});return g;}
// Timber side chair facing −z: four legs, seat frame, padded seat, two back posts with a curved top rail and slats.
export function sideChair(B,{M,seat=M.linen,w=.44,d=.44,seatY=.45,backTop=.84}){
 for(const sx of [-1,1])for(const sz of [-1,1])B(sx*(w/2-.025),0,sz*(d/2-.025),.035,seatY-.04,.035,M.oak);
 B(0,seatY-.08,0,w,.05,d,M.oak,.01);B(0,seatY-.03,-.01,w-.03,.05,d-.04,seat,.02);
 for(const sx of [-1,1])B(sx*(w/2-.025),seatY-.04,d/2-.025,.035,backTop-seatY+.04,.035,M.oak);
 B(0,backTop-.08,d/2-.02,w-.05,.08,.03,M.oak,.01);for(const sx of [-.1,0,.1])B(sx,seatY+.04,d/2-.022,.035,backTop-seatY-.12,.018,M.oak);
}

// --- Sofa bed (day: sofa; guest: opened sleeper), local: length along z (±L/2), seat depth along +x from the back at x = 0 -----
// Day: plinth rail on legs, two seat cushions, two back cushions against an upholstered back, rolled arms at both ends.
export function sofaDay(B,{L,D,M,ground=()=>0,back=M.olive,seat=M.linen}){
 B(D/2+.01,.1,0,D-.02,.24,L-.04,M.oak,.012);legs(B,[[.06,-L/2+.08],[.06,L/2-.08],[D-.07,-L/2+.08],[D-.07,L/2-.08]],.1,.045,M.oak,ground);
 B(.07,.1,0,.14,.7,L-.24,back,.03);
 const arm=.12,ins=L-2*arm,cw=(ins-.01)/2;for(const s of [-1,1])B(.17+(D-.19)/2,.34,s*(cw/2+.005),D-.19,.15,cw,seat,.05);
 for(const s of [-1,1]){const q=B(.21,.44,s*(cw/2+.005),.16,.4,cw-.04,back,.05);q.rotation.z=.12;}
 for(const s of [-1,1])B(D/2,.1,s*(L/2-arm/2),D,.56,arm,seat,.05);
}
// Guest: frame on legs, a 1.20 × 1.90 mattress (as before), the back left upright, a pillow and a folded blanket.
// Guest: the seat unfolded into a frame on legs carrying a 1.20 × 1.90 mattress (as before); the back stays up over the mattress's
// back edge like a low headboard rail. Pillow and blanket are the caller's.
export function sofaGuest(B,{L,D,M,ground=()=>0,mattress=[1.2,1.9]}){
 B(D/2,.14,0,D,.2,L,M.oak,.015);legs(B,[[.06,-L/2+.08],[.06,L/2-.08],[D-.07,-L/2+.08],[D-.07,L/2-.08]],.14,.045,M.oak,ground);
 const mattressMesh=B(D/2,.34,0,mattress[0],.18,mattress[1],M.white,.04);
 B(.07,.52,0,.14,.43,L,M.olive,.03);return mattressMesh;
}
