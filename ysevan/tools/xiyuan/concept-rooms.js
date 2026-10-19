import * as THREE from 'three';
import {createFittedWardrobe} from './fitted-wardrobe.js';

// All horizontal footprints come from balanced-concept.json, including frames and handles.
// This module adds only removable furnishings; it never creates or edits architectural walls.
export function createConceptRoom(id,plan,{box,materials:M}){
 const group=new THREE.Group(),day=new THREE.Group(),guest=new THREE.Group();
 group.name=`owner-${id}`;group.add(day,guest);guest.visible=false;
 const screenMaterial=new THREE.MeshBasicMaterial({color:'#9db0a4'});
 let itemParent=group;
 const B=(x,y,z,w,h,d,m,parent=itemParent,r=0)=>box(x,y,z,w,h,d,m,parent,r);
 const items=Object.fromEntries(plan.furniture.map(q=>[q.id,q]));
 function bed(item,parent=itemParent){
  const [x,z,X,Z]=item.box,cx=(x+X)/2,cz=(z+Z)/2,w=X-x,d=Z-z;
  B(cx,.10,cz,w,.20,d,M.oak,parent,.025);
  const mw=item.mattress[1],md=item.mattress[0]; // head is west; length follows x.
  B(cx,.31,cz,mw,.18,md,M.white,parent,.055);
  B(x+.045,.11,cz,.07,.76,d-.035,M.oak,parent,.015);
  for(const pz of [cz-md*.26,cz+md*.26])B(x+.31,.48,pz,.39,.075,md*.36,M.linen,parent,.045);
  B(cx+.30,.49,cz,.62,.02,md*.9,M.olive,parent,.01);
 }
 function desk(item){
  const [x,z,X,Z]=item.box,longX=X-x>Z-z,g=new THREE.Group();g.position.set((x+X)/2,0,(z+Z)/2);g.rotation.y=longX?0:Math.PI/2;itemParent.add(g);
  B(0,.72,0,2,.04,.7,M.oak,g,.015);
  for(const u of [-.92,.92])for(const v of [-.26,.26])B(u,0,v,.035,.72,.035,M.metal,g);
  B(.5,.78,-.20,.60,.36,.032,M.dark,g,.015);B(.5,.84,-.176,.56,.30,.004,screenMaterial,g);
  B(.5,.73,-.20,.025,.08,.022,M.metal,g);
  B(-.53,.78,-.12,.43,.025,.28,M.dark,g,.012);
  const laptop=B(-.53,.81,-.25,.43,.27,.018,M.dark,g,.01);laptop.rotation.x=-.13;
  B(-.53,.83,-.238,.40,.23,.003,screenMaterial,g);
  B(.08,.76,.15,.41,.025,.16,M.dark,g,.013);B(.62,.76,.15,.09,.025,.13,M.white,g,.02);
 }
 function collection(item){
  const [x,z,X,Z]=item.box,cx=(x+X)/2,cz=(z+Z)/2,front=x>5?x+.012:X-.012;
  B(cx,0,cz,X-x,.46,Z-z,M.oak);
  B(cx,.46,cz,X-x,1.64,Z-z,M.white);
  for(const zz of [z+.015,Z-.015])B(cx,.46,zz,X-x,1.64,.025,M.oak);
  for(const y of [.47,.88,1.28,1.68,2.07])B(cx,y,cz,X-x,.022,Z-z-.05,M.oak);
  B(front,.49,cz,.016,1.54,Z-z-.05,M.glass);
  for(const yy of [.58,.99,1.39,1.79])for(const zz of [z+.38,z+1.06]){
   B(cx,yy,zz,.19,.055,.21,M.olive,itemParent,.02);
   B(cx,yy+.05,zz,.11,.045,.13,M.dark,itemParent,.016);
  }
  for(const zz of [z+.38,z+1.08])B(front+(front===x+.012?-.003:.003),1.08,zz,.008,.15,.014,M.brass);
 }
 function sofa(item,parent,opened){
  const [x,z,X,Z]=item.box,cx=(x+X)/2,cz=(z+Z)/2,w=X-x,d=Z-z;
  B(cx,.10,cz,w,.22,d,M.oak,parent,.035);
  B(cx,.32,cz,w-.04,.15,d-.05,opened?M.white:M.linen,parent,.045);
  B(x+.07,.22,cz,.12,.47,d-.04,M.olive,parent,.025);
  if(opened){for(const zz of [cz-.42,cz+.42])B(x+.28,.49,zz,.35,.07,.34,M.linen,parent,.035);}
 }
 for(const item of plan.furniture){
  const part=new THREE.Group();part.name=`item-${item.id}`;group.add(part);itemParent=part;
  if(item.kind==='bed')bed(item);
  else if(item.kind==='wardrobe')createFittedWardrobe(item,{box,materials:M,parent:part});
  else if(item.kind==='desk')desk(item);
  else if(item.kind==='display')collection(item);
  else if(item.kind==='sofa'){group.remove(part);sofa(item,day,false);}
  else if(item.kind==='guest'){group.remove(part);sofa(item,guest,true);}
 }
 itemParent=group;
 const chairBox=id==='balanced'?[4.92,8.17,5.48,8.73]:[4.27,8.37,4.83,8.93];
 const [x,z,X,Z]=chairBox,cx=(x+X)/2,cz=(z+Z)/2;
 B(cx,.40,cz,.48,.09,.46,M.olive,group,.045);
 B(cx,.50,cz+.17,.46,.42,.065,M.linen,group,.025);
 B(cx,.09,cz,.035,.31,.035,M.metal);
 for(const s of [-1,1]){B(cx+s*.16,.02,cz,.31,.025,.025,M.metal);B(cx,.02,cz+s*.16,.025,.025,.31,M.metal);}
 const accent=new THREE.PointLight('#ffe5b7',0,2.4,2);
 accent.position.set(id==='balanced'?6.0:3.9,1.5,9.4);group.add(accent);
 function setMood(mood,preferences={}){
  screenMaterial.color.set(mood==='rest'?'#404a44':mood==='game'?'#82b7ae':'#9db0a4');
  accent.color.set(preferences.primary||'#ffe5b7');
 }
 setMood('focus');
 return {group,day,guest,items,accent,setMood};
}
