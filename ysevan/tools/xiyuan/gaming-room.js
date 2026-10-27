import * as THREE from 'three';
import {GAMING_MODES,STUDY_UPPER_DISPLAYS} from './design-data.js?v=0d48267e23';
import {deskFrame,monitorArm,officeChair,sofaDay,sofaGuest} from './bedroom-kit.js?v=9d047206ec';
// One laptop + one 27-inch display. Hardware cases are size allowances, not product CAD.
export function createGamingRoom({box,cyl,rod,woodTexture,fabricTexture,clipPlane,materials,south=false}){
 const room=new THREE.Group(),day=new THREE.Group(),guest=new THREE.Group(),chair=new THREE.Group(),shade=new THREE.Group();room.add(day,guest,chair,shade);guest.visible=false;
 const work=new THREE.Group(),collection=new THREE.Group();room.add(work,collection);let target=work;
 const G=materials,device=new THREE.MeshStandardMaterial({color:'#383b3c',roughness:.6}),keys=new THREE.MeshStandardMaterial({color:'#bfc5be',roughness:.8});
 const warm=new THREE.MeshBasicMaterial({color:'#ffe5b7',toneMapped:false});
 const B=(x,y,z,w,h,d,m=G.oak,g=target,r=0)=>box(x,y,z,w,h,d,m,g,r);
 const strip=(x,y,z,w,h,d)=>{const q=B(x,y,z,w,h,d,warm);q.castShadow=false;return q;};
 // No dark floor overlay or opaque wall panel. Materials follow the whole-home palette.
 // Roller-blind box and blind hang above the 1.28 m cut: cut with the walls (material-kit.js cut twins).
 if(!south)B(1.4,2.28,2.52,2.04,.065,.065,G.whiteCut||G.white);
 B(1.4,.51,2.515,1.96,1.77,.015,G.linenCut||G.linen,shade);
 // 2.0 × 0.70 m desk, worktop 0.76 m; cable tray is accessible from below. Fit-out round (bedroom-kit.js): steel side
 // frames at both ends (feet, uprights, bearers), a back beam and an open tray; a three-drawer pedestal (3 mm gaps, bar pulls)
 // between the left frame and the laptop, clear of the frame.
 const Bd=(x,y,z,w,h,d,m,r=0)=>B(1.4+x,y,2.95+z,w,h,d,m,target,r);
 B(1.4,.73,2.95,2,.03,.7,G.oak,target,.01);deskFrame(Bd,{xs:[-.965,.965],depth:.7,top:.73,M:G});
 B(.64,0,2.92,.30,.63,.51,G.white,target,.008);
 for(const [y,h] of [[.03,.2],[.233,.18],[.416,.21]]){B(.64,y,3.177,.294,h,.018,G.white,target,.004);B(.64,y+h-.04,3.19,.12,.012,.01,G.oak);}
 // 27-inch, 16:9 screen envelope ~0.62 × 0.37 m including housing. Model-dependent stand.
 B(1.95,.96,2.77,.62,.37,.035,device);monitorArm(B,work,{x:1.95,zb:2.6,y:.76,armY:.94,screenZ:2.7525,M:G});
 // Laptop open on a ventilated riser, NOT a second desktop display or a tower.
 B(.95,.82,2.98,.40,.023,.28,device);B(.95,.79,2.98,.31,.03,.17,G.metal);
 const laptop=B(.95,.85,2.84,.40,.26,.017,device);laptop.rotation.x=-.12;
 const screenMaterial=()=>new THREE.MeshBasicMaterial({color:'white',toneMapped:false});
 const screens=[B(1.95,.977,2.791,.591,.334,.004,screenMaterial()),B(.95,.867,2.853,.37,.224,.004,screenMaterial())];screens.forEach(q=>{q.castShadow=false;q.geometry.setAttribute('uv',new THREE.BoxGeometry().getAttribute('uv'));});// wallpapers fill the face: 0–1 UVs, not box()'s metres
 function wallpaper(kind){const c=document.createElement('canvas');c.width=640;c.height=360;const ctx=c.getContext('2d'),g=ctx.createLinearGradient(0,0,640,360);g.addColorStop(0,'#6c7e72');g.addColorStop(1,'#bbae91');ctx.fillStyle=g;ctx.fillRect(0,0,640,360);ctx.fillStyle='#ded9c7';ctx.beginPath();ctx.arc(455,130,95,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f7f3e7';ctx.font='28px sans-serif';ctx.fillText(kind==='game'?'':'',36,285);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
 const wallpapers={game:wallpaper('game'),focus:wallpaper('focus')};
 B(1.79,.765,3.105,.8,.006,.34,G.olive,work,.018);
 B(1.76,.777,3.13,.35,.021,.15,device,work,.01);
 for(let row=0;row<5;row++)for(let col=0;col<14;col++)B(1.602+col*.024,.799,3.069+row*.025,.020,.006,.019,keys);
 B(2.12,.778,3.13,.065,.035,.11,keys,work,.025);
 // Work chair is movable; retained balcony threshold is narrow, not a wide office bay.
 // Fit-out round: an ergonomic gaming chair (bedroom-kit.js) with a headrest, its five-spoke base inside the chair box.
 const cx=south?2.1:2.18,cz=3.55,cg=new THREE.Group();cg.position.set(cx,0,cz);chair.add(cg);
 officeChair((x,y,z,w,h,d,m,r=0)=>B(x,y,z,w,h,d,m,cg,r),cg,{M:G,rb:.28,backTop:1.12,head:true});
 if(!south){
 // Entry faces north: west is the left-hand wall. Keep the east aisle clear. Fit-out round (bedroom-kit.js): plinth rail on
 // legs, two seat and two back cushions, upholstered arms; outline 0.86 × 1.94 as before.
 sofaDay((x,y,z,w,h,d,m,r=0)=>B(.12+x,y,4.86+z,w,h,d,m,day,r),{L:1.94,D:.86,M:G});
 // Open sleeper: mattress 1.20 x 1.90, real outer frame 1.24 x 1.94, on legs; the back stays up over the mattress's edge.
 sofaGuest((x,y,z,w,h,d,m,r=0)=>B(.12+x,y,4.86+z,w,h,d,m,guest,r),{L:1.94,D:1.24,M:G});
 B(.78,.52,4.13,.78,.12,.34,G.linen,guest,.03);
 B(.74,.52,5.38,1.20,.03,.55,G.olive,guest);
 }else{
 // Occasional sleeper; 1.90 × 1.20 m, east passage remains about 0.68 m.
 B(1.15,.12,4.45,1.94,.27,.86,G.oak,day,.04);B(1.15,.39,4.48,1.86,.16,.72,G.linen,day,.06);B(1.15,.3,4.08,1.94,.65,.14,G.olive,day,.04);
 for(const x of [.25,2.05])B(x,.49,4.5,.12,.2,.68,G.linen,day,.04);
 B(1.15,.14,4.62,1.94,.20,1.24,G.oak,guest,.04);B(1.15,.34,4.62,1.90,.18,1.20,G.white,guest,.05);B(1.15,.3,4.08,1.94,.65,.14,G.olive,guest,.04);B(.47,.53,4.62,.34,.1,.85,G.linen,guest,.04);B(1.8,.53,4.62,.45,.03,1.2,G.olive,guest);
 }
 const upperDisplays=[],upperWarm=warm.clone();upperWarm.color=warm.color;upperWarm.clippingPlanes=[clipPlane];
 if(south){
 target=collection;
 // 1.50 W × 0.40 D × 2.10 H display cabinet: sliding glass above closed storage.
 // Recheck actual car lengths, shelf loads and anti-tip anchors on site.
 // Carcass and shelves in the preset's cabinet finish, handles in the preset's style (material-kit.js), like the wardrobes.
 const C=G.door||G.oak;B(.95,0,5.65,1.5,.48,.4,C);B(.95,.48,5.827,1.5,1.62,.035,G.white);
 for(const x of [.215,1.685])B(x,.48,5.65,.03,1.62,.4,C);
 for(const y of [.48,.88,1.26,1.64,2.07]){B(.95,y,5.65,1.5,.025,.4,C);strip(.95,y-.012,5.77,1.4,.007,.008);}
 const glass=new THREE.MeshStandardMaterial({color:'#f5f1e8',roughness:.15,transparent:true,opacity:.13,depthWrite:false,clippingPlanes:[clipPlane]});
 for(const x of [.58,1.32]){const q=B(x,.52,5.437,.73,1.52,.008,glass);q.castShadow=false;B(x-.33,1.14,5.422,.012,.22,.012,G.handleBar||G.brass);B(x-.33,1.235,5.422,.03,.03,.012,G.handleKnob||G.brass);B(x-.33,1.08,5.426,.014,.34,.004,G.handlePull||G.brass);}
 // Neutral toy silhouettes indicate display capacity without inventing the user's collection.
 function car(x,y,z,color){const cm=new THREE.MeshStandardMaterial({color,roughness:.5});B(x,y,z,.31,.065,.14,cm,collection,.025);B(x,y+.05,z,.17,.055,.125,device,collection,.018);for(const X of [x-.10,x+.10])for(const Z of [z-.073,z+.073]){const q=cyl(X,y-.015,Z,.033,.017,device,collection);q.rotation.x=Math.PI/2;}}
 car(.55,.54,5.64,'#9e7860');car(1.23,.54,5.64,'#8b9d94');car(.55,.94,5.64,'#c4b29a');car(1.23,.94,5.64,'#9c9eaf');
 for(const y of [1.30,1.68])for(const x of [.48,.93,1.38]){B(x,y,5.64,.10,.13,.09,G.olive,collection,.025);cyl(x,y+.13,5.64,.065,.10,G.linen,collection);}
 }else{
 // Three wall-hung runs. Clear of windows and the door leaf; no floor plinths.
 const C=G.doorCut||G.oakCut||G.whiteCut||G.oak;
 const glass=new THREE.MeshStandardMaterial({color:'#f5f1e8',roughness:.2,transparent:true,opacity:.13,depthWrite:false,clippingPlanes:[clipPlane]});
 for(const spec of STUDY_UPPER_DISPLAYS){
  const [x,z,X,Z]=spec.box,vertical=spec.face!=='north',w=vertical?Z-z:X-x,d=vertical?X-x:Z-z,h=spec.top-spec.bottom;
  const g=new THREE.Group();g.name='upper-display-'+spec.id;g.position.set((x+X)/2,spec.bottom,(z+Z)/2);g.rotation.y=spec.face==='east'?-Math.PI/2:spec.face==='west'?Math.PI/2:0;collection.add(g);upperDisplays.push(g);
  B(0,0,d/2-.01,w,h,.02,C,g);
  for(const xx of [-w/2+.012,w/2-.012])B(xx,0,0,.024,h,d,C,g);
  for(const y of [0,.32,.64,h-.025])B(0,y,0,w,.025,d,C,g);
  B(0,.025,-d/2+.008,w-.05,h-.05,.012,glass,g);
  // Fit-out round: two glass doors meeting at the middle, each in a narrow 20 mm frame (the cabinet finish's cut twin).
  for(const sg of [-1,1]){const a=sg<0?-w/2+.025:.0015,b=sg<0?-.0015:w/2-.025;for(const u of [a+.01,b-.01])B(u,.025,-d/2+.008,.02,h-.05,.016,C,g);for(const v of [.025,h-.045])B((a+b)/2,v,-d/2+.008,b-a-.04,.02,.016,C,g);}
  B(w*.35,.38,-d/2+.008,.012,.18,.014,G.handleBarCut||G.brass,g);B(w*.35,.45,-d/2+.008,.025,.025,.014,G.handleKnobCut||G.brass,g);B(w*.35,.34,-d/2+.008,.012,.26,.012,G.handlePullCut||G.brass,g);
  // A small number of toy/car silhouettes; no brand or collection ownership implied. Fit-out round: they stand on the shelves.
  for(const y of [.03,.35])for(const xx of [-w*.28,w*.26]){
   B(xx,y,0,.24,.055,.12,G.oliveCut||C,g,.018);
   B(xx,y+.055,0,.13,.055,.10,C,g,.015);
   for(const X of [xx-.07,xx+.07])for(const Z of [-.06,.06])B(X,y-.005,Z,.045,.045,.015,device,g,.014);
  }
  for(const xx of [-w*.28,0,w*.28]){
   B(xx,.665,0,.08,.11,.075,G.oliveCut||C,g,.015);
   cyl(xx,.775,0,.06,.085,G.linenCut||C,g);
  }
  for(const y of [.30,.62]){const led=B(0,y,d/2-.04,w-.07,.007,.008,upperWarm,g);led.castShadow=false;}
 }
 }
 const accent=new THREE.PointLight('#ffe5b7',0,2.4,2);accent.position.set(.95,1.4,5.3);accent.castShadow=false;accent.visible=false;collection.add(accent);
 if(south){work.position.set(3.1,0,4.95);chair.position.set(3.1,0,4.95);for(const g of [day,guest]){g.rotation.y=Math.PI/2;g.position.set(.1,0,11.5);}collection.rotation.y=Math.PI/2;collection.position.set(.6,0,10.35);shade.visible=false;}
 let lastScreen='';function setMood(id,preferences={}){const s=GAMING_MODES[id]||GAMING_MODES.focus;shade.visible=!south&&id==='rest';warm.color.set(s.primary).multiplyScalar((preferences.strength??45)/100);if(lastScreen!==s.screen){for(const q of screens){q.material.map=wallpapers[s.screen]||null;q.material.color.set(s.screen==='off'?'#343b37':'white');q.material.needsUpdate=true;}lastScreen=s.screen;}accent.color.set(s.primary);}
 // Do not mutate the shared home's material properties on traversing a room.
 for(const m of [device,keys])m.clippingPlanes=[clipPlane];setMood('focus');return {room,day,guest,chair,shade,accent,setMood,work,collection,upperDisplays};
}
