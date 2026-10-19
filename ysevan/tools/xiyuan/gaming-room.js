import * as THREE from 'three';
import {GAMING_MODES} from './design-data.js';
// One laptop + one 27-inch display. Hardware cases are size allowances, not product CAD.
export function createGamingRoom({box,cyl,rod,woodTexture,fabricTexture,clipPlane,materials,south=false}){
 const room=new THREE.Group(),day=new THREE.Group(),guest=new THREE.Group(),chair=new THREE.Group(),shade=new THREE.Group();room.add(day,guest,chair,shade);guest.visible=false;
 const work=new THREE.Group(),collection=new THREE.Group();room.add(work,collection);let target=work;
 const G=materials,device=new THREE.MeshStandardMaterial({color:'#383b3c',roughness:.6}),keys=new THREE.MeshStandardMaterial({color:'#bfc5be',roughness:.8});
 const warm=new THREE.MeshBasicMaterial({color:'#ffe5b7',toneMapped:false});
 const B=(x,y,z,w,h,d,m=G.oak,g=target,r=0)=>box(x,y,z,w,h,d,m,g,r);
 const strip=(x,y,z,w,h,d)=>{const q=B(x,y,z,w,h,d,warm);q.castShadow=false;return q;};
 // No dark floor overlay or opaque wall panel. Materials follow the whole-home palette.
 if(!south)B(1.4,2.28,2.52,2.04,.065,.065,G.white);
 B(1.4,.51,2.515,1.96,1.77,.015,G.linen,shade);
 // 2.0 × 0.70 m desk, worktop 0.76 m; cable tray is accessible from below.
 B(1.4,.73,2.95,2,.03,.7);for(const x of [.48,2.32])B(x,0,2.94,.045,.73,.55,G.metal);
 B(1.4,.59,2.69,1.65,.05,.12,G.metal);B(.56,0,2.92,.30,.63,.53,G.white);
 for(const y of [.2,.4])B(.56,y,3.19,.26,.008,.005,G.oak);
 // 27-inch, 16:9 screen envelope ~0.62 × 0.37 m including housing. Model-dependent stand.
 B(1.95,.96,2.77,.62,.37,.035,device);rod([1.95,.76,2.66],[1.95,1.09,2.75],.018,G.metal,work);
 // Laptop open on a ventilated riser, NOT a second desktop display or a tower.
 B(.95,.82,2.98,.40,.023,.28,device);B(.95,.79,2.98,.31,.03,.17,G.metal);
 const laptop=B(.95,.85,2.84,.40,.26,.017,device);laptop.rotation.x=-.12;
 const screenMaterial=()=>new THREE.MeshBasicMaterial({color:'white',toneMapped:false});
 const screens=[B(1.95,.977,2.791,.591,.334,.004,screenMaterial()),B(.95,.867,2.853,.37,.224,.004,screenMaterial())];screens.forEach(q=>q.castShadow=false);
 function wallpaper(kind){const c=document.createElement('canvas');c.width=640;c.height=360;const ctx=c.getContext('2d'),g=ctx.createLinearGradient(0,0,640,360);g.addColorStop(0,'#6c7e72');g.addColorStop(1,'#bbae91');ctx.fillStyle=g;ctx.fillRect(0,0,640,360);ctx.fillStyle='#ded9c7';ctx.beginPath();ctx.arc(455,130,95,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f7f3e7';ctx.font='28px sans-serif';ctx.fillText(kind==='game'?'PLAY AT HOME':'HOME STUDIO',36,285);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
 const wallpapers={game:wallpaper('game'),focus:wallpaper('focus')};
 B(1.79,.765,3.105,.8,.006,.34,G.olive,work,.018);
 B(1.76,.777,3.13,.35,.021,.15,device,work,.01);
 for(let row=0;row<5;row++)for(let col=0;col<14;col++)B(1.602+col*.024,.799,3.069+row*.025,.020,.006,.019,keys);
 B(2.12,.778,3.13,.065,.035,.11,keys,work,.025);
 // Work chair is movable; retained balcony threshold is narrow, not a wide office bay.
 const cx=south?2.1:2.18,cz=3.55;
 B(cx,.43,cz,.49,.08,.46,G.olive,chair,.05);B(cx,.52,cz+.18,.45,.52,.06,G.linen,chair,.04);
 for(const x of [cx-.26,cx+.26])B(x,.63,cz+.03,.035,.035,.24,G.metal,chair);
 cyl(cx,.08,cz,.035,.35,G.metal,chair);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;rod([cx,.1,cz],[cx+Math.cos(a)*.28,.045,cz+Math.sin(a)*.28],.015,G.metal,chair);}
 // Occasional sleeper; 1.90 × 1.20 m, east passage remains about 0.68 m.
 B(1.15,.12,4.45,1.94,.27,.86,G.oak,day,.04);B(1.15,.39,4.48,1.86,.16,.72,G.linen,day,.06);B(1.15,.3,4.08,1.94,.65,.14,G.olive,day,.04);
 for(const x of [.25,2.05])B(x,.49,4.5,.12,.2,.68,G.linen,day,.04);
 B(1.15,.14,4.62,1.94,.20,1.24,G.oak,guest,.04);B(1.15,.34,4.62,1.90,.18,1.20,G.white,guest,.05);B(1.15,.3,4.08,1.94,.65,.14,G.olive,guest,.04);B(.47,.53,4.62,.34,.1,.85,G.linen,guest,.04);B(1.8,.53,4.62,.45,.03,1.2,G.olive,guest);
 target=collection;
 // 1.50 W × 0.40 D × 2.10 H display cabinet: sliding glass above closed storage.
 // Recheck actual car lengths, shelf loads and anti-tip anchors on site.
 B(.95,0,5.65,1.5,.48,.4,G.oak);B(.95,.48,5.827,1.5,1.62,.035,G.white);
 for(const x of [.215,1.685])B(x,.48,5.65,.03,1.62,.4,G.oak);
 for(const y of [.48,.88,1.26,1.64,2.07]){B(.95,y,5.65,1.5,.025,.4,G.oak);strip(.95,y-.012,5.77,1.4,.007,.008);}
 const glass=new THREE.MeshStandardMaterial({color:'#f5f1e8',roughness:.15,transparent:true,opacity:.13,depthWrite:false,clippingPlanes:[clipPlane]});
 for(const x of [.58,1.32]){const q=B(x,.52,5.437,.73,1.52,.008,glass);q.castShadow=false;B(x-.33,1.14,5.422,.012,.22,.012,G.brass);}
 // Neutral toy silhouettes indicate display capacity without inventing the user's collection.
 function car(x,y,z,color){const cm=new THREE.MeshStandardMaterial({color,roughness:.5});B(x,y,z,.31,.065,.14,cm,collection,.025);B(x,y+.05,z,.17,.055,.125,device,collection,.018);for(const X of [x-.10,x+.10])for(const Z of [z-.073,z+.073]){const q=cyl(X,y-.015,Z,.033,.017,device,collection);q.rotation.x=Math.PI/2;}}
 car(.55,.54,5.64,'#9e7860');car(1.23,.54,5.64,'#8b9d94');car(.55,.94,5.64,'#c4b29a');car(1.23,.94,5.64,'#9c9eaf');
 for(const y of [1.30,1.68])for(const x of [.48,.93,1.38]){B(x,y,5.64,.10,.13,.09,G.olive,collection,.025);cyl(x,y+.13,5.64,.065,.10,G.linen,collection);}
 const accent=new THREE.PointLight('#ffe5b7',0,2.4,2);accent.position.set(.95,1.4,5.3);accent.castShadow=false;collection.add(accent);
 if(south){work.position.set(3.1,0,4.95);chair.position.set(3.1,0,4.95);for(const g of [day,guest]){g.rotation.y=Math.PI/2;g.position.set(.1,0,11.5);}collection.rotation.y=Math.PI/2;collection.position.set(.6,0,10.35);shade.visible=false;}
 let lastScreen='';function setMood(id,preferences={}){const s=GAMING_MODES[id]||GAMING_MODES.focus;shade.visible=!south&&id==='rest';warm.color.set(s.primary).multiplyScalar((preferences.strength??45)/100);if(lastScreen!==s.screen){for(const q of screens){q.material.map=wallpapers[s.screen]||null;q.material.color.set(s.screen==='off'?'#343b37':'white');q.material.needsUpdate=true;}lastScreen=s.screen;}accent.color.set(s.primary);}
 // Do not mutate the shared home's material properties on traversing a room.
 for(const m of [device,keys])m.clippingPlanes=[clipPlane];setMood('focus');return {room,day,guest,chair,shade,accent,setMood,work,collection};
}
