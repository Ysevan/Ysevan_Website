import * as THREE from 'three';
import {createFittedWardrobe} from './fitted-wardrobe.js?v=ee30778e44';

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
  const east=item.head==='east',headX=east?X-.045:x+.045,pillowX=east?X-.31:x+.31;
  B(headX,.11,cz,.07,.76,d-.035,M.oak,parent,.015);
  for(const pz of [cz-md*.26,cz+md*.26])B(pillowX,.48,pz,.39,.075,md*.36,M.linen,parent,.045);
  B(cx+(east?-.30:.30),.49,cz,.62,.02,md*.9,M.olive,parent,.01);
 }
 function desk(item){
  const [x,z,X,Z]=item.box,longX=X-x>Z-z,length=Math.max(X-x,Z-z),depth=Math.min(X-x,Z-z),g=new THREE.Group();g.position.set((x+X)/2,0,(z+Z)/2);g.rotation.y=longX?0:Math.PI/2;itemParent.add(g);
  B(0,.72,0,length,.04,depth,M.oak,g,.015);
  for(const u of [-length/2+.08,length/2-.08])for(const v of [-depth/2+.09,depth/2-.09])B(u,0,v,.035,.72,.035,M.metal,g);
  const monitor=length*.25,laptopX=-length*.25;
  B(monitor,.78,-.18,.60,.36,.032,M.dark,g,.015);B(monitor,.84,-.156,.56,.30,.004,screenMaterial,g);
  B(monitor,.73,-.18,.025,.08,.022,M.metal,g);
  B(laptopX,.78,-.10,.43,.025,.28,M.dark,g,.012);
  const laptop=B(laptopX,.81,-.22,.43,.27,.018,M.dark,g,.01);laptop.rotation.x=-.13;
  B(laptopX,.83,-.208,.40,.23,.003,screenMaterial,g);
  B(.06,.76,.14,.41,.025,.16,M.dark,g,.013);B(length/2-.19,.76,.14,.09,.025,.13,M.white,g,.02);
 }
 function deskL(item){
  // Two adjoining 0.90 m desktop leaves use the former entry recess. The
  // 1.80 m span is not misrepresented as one straight 1.80 m worktop.
  const [left,right]=item.footprints;
  for(const [x,z,X,Z] of [left,right]){
   B((x+X)/2,.72,(z+Z)/2,X-x,.04,Z-z,M.oak,itemParent,.014);
   for(const xx of [x+.06,X-.06])B(xx,0,Z-.07,.035,.72,.035,M.metal,itemParent);
  }
  B(5.96,.78,7.36,.60,.36,.032,M.dark,itemParent,.012);
  B(5.96,.84,7.382,.56,.30,.004,screenMaterial,itemParent);
  B(5.96,.73,7.36,.025,.08,.022,M.metal,itemParent);
  B(5.10,.78,7.78,.43,.025,.28,M.dark,itemParent,.012);
  const laptop=B(5.10,.81,7.65,.43,.27,.018,M.dark,itemParent,.01);
  laptop.rotation.x=-.13;
  B(5.96,.76,7.66,.41,.025,.16,M.dark,itemParent,.012);
  B(6.32,.76,7.65,.09,.025,.13,M.white,itemParent,.02);
  // Shallow display shelves are elevated above the desk, not floor cupboards.
  for(const [x,z,w] of [[5.10,7.66,.84],[6.00,7.26,.84]]){
   for(const y of [1.37,1.83]){
    B(x,y,z,w,.024,.19,M.oak,itemParent,.006);
    for(const dx of [-.26,0,.26]){
     B(x+dx,y+.025,z,.13,.065,.12,M.olive,itemParent,.01);
     B(x+dx,y+.09,z,.08,.055,.09,M.dark,itemParent,.008);
    }
   }
  }
 }
 function collection(item){
  const [x,z,X,Z]=item.box,cx=(x+X)/2,cz=(z+Z)/2;
  if(X-x>Z-z){
   const w=X-x,d=Z-z,front=z+.012;
   B(cx,0,cz,w,.46,d,M.oak);B(cx,.46,cz,w,1.64,d,M.white);
   for(const xx of [x+.015,X-.015])B(xx,.46,cz,.025,1.64,d,M.oak);
   for(const y of [.47,.88,1.28,1.68,2.07])B(cx,y,cz,w-.05,.022,d,M.oak);
   B(cx,.49,front,w-.05,1.54,.016,M.glass);
   for(const yy of [.58,.99,1.39,1.79])for(const xx of [x+.38,X-.38]){
    B(xx,yy,cz,.19,.055,.21,M.olive,itemParent,.02);B(xx,yy+.05,cz,.11,.045,.13,M.dark,itemParent,.016);
   }
   for(const xx of [x+.38,X-.38])B(xx,1.08,front+.003,.008,.15,.014,M.brass);
   return;
  }
  const front=x>5?x+.012:X-.012;
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
  else if(item.kind==='deskL')deskL(item);
  else if(item.kind==='display')collection(item);
  else if(item.kind==='sofa'){group.remove(part);sofa(item,day,false);}
  else if(item.kind==='guest'){group.remove(part);sofa(item,guest,true);}
 }
 itemParent=group;
 const chairBox=plan.chairBox|| (id==='balanced'?[4.92,8.17,5.48,8.73]:[4.27,8.37,4.83,8.93]);
 const [x,z,X,Z]=chairBox,cx=(x+X)/2,cz=(z+Z)/2;
 B(cx,.40,cz,.48,.09,.46,M.olive,group,.045);
 B(cx,.50,cz+.17,.46,.42,.065,M.linen,group,.025);
 B(cx,.09,cz,.035,.31,.035,M.metal);
 for(const s of [-1,1]){B(cx+s*.16,.02,cz,.31,.025,.025,M.metal);B(cx,.02,cz+s*.16,.025,.025,.31,M.metal);}
 const accent=new THREE.PointLight('#ffe5b7',0,2.4,2);
 accent.position.set(id==='balanced'?6.0:3.9,1.5,id==='central'?8.0:9.4);group.add(accent);
 function setMood(mood,preferences={}){
  screenMaterial.color.set(mood==='rest'?'#404a44':mood==='game'?'#82b7ae':'#9db0a4');
  accent.color.set(preferences.primary||'#ffe5b7');
 }
 setMood('focus');
 return {group,day,guest,items,accent,setMood};
}
