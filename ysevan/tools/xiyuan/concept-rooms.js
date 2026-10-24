import * as THREE from 'three';
import {createFittedWardrobe} from './fitted-wardrobe.js?v=3c06a47c42';
import {bedding} from './furnish-layer.js?v=07d95e76b4';

// All horizontal footprints come from balanced-concept.json, including frames and handles.
// This module adds only removable furnishings; it never creates or edits architectural walls.
export function createConceptRoom(id,plan,{box,materials:M}){
 const group=new THREE.Group(),day=new THREE.Group(),guest=new THREE.Group();
 group.name=`owner-${id}`;group.add(day,guest);guest.visible=false;
 const screenMaterial=new THREE.MeshBasicMaterial({color:'#9db0a4'});
 let itemParent=group;
 const B=(x,y,z,w,h,d,m,parent=itemParent,r=0)=>box(x,y,z,w,h,d,m,parent,r);
 const items=Object.fromEntries(plan.furniture.map(q=>[q.id,q]));
 const mattressMeta=(mesh,item)=>{mesh.name='mattress-'+item.id;};
 function bed(item,parent=itemParent){
  const [x,z,X,Z]=item.box,cx=(x+X)/2,cz=(z+Z)/2,w=X-x,d=Z-z;
  B(cx,.10,cz,w,.20,d,M.oak,parent,.025);
  const mw=item.mattress[1],md=item.mattress[0]; // head is west; length follows x.
  const mattressX=item.slimFrame?(item.head==='east'?X-.1-mw/2:x+.1+mw/2):cx;
  const mattress=B(mattressX,.31,cz,mw,.18,md,M.white,parent,.055);mattressMeta(mattress,item);
  const east=item.head==='east',headX=east?X-.045:x+.045;
  B(headX,.11,cz,.07,.76,d-.035,M.oak,parent,.015);
  // Made bed (furnish-layer.js) in the mattress frame: its length along x, head at the headboard; the cloth stays inside the frame.
  const s=new THREE.Group();s.position.set(mattressX,0,cz);s.rotation.y=east?-Math.PI/2:Math.PI/2;parent.add(s);bedding(s,{width:md,length:mw,top:.49,M,scarf:M.olive,fit:[d/2-.006,(east?mattressX-x:X-mattressX)-.006]});
 }
 function desk(item){
  const [x,z,X,Z]=item.box,longX=X-x>Z-z,length=Math.max(X-x,Z-z),depth=Math.min(X-x,Z-z),g=new THREE.Group();g.position.set((x+X)/2,0,(z+Z)/2);g.rotation.y=item.face==='west'?-Math.PI/2:longX?0:Math.PI/2;itemParent.add(g);
  B(0,.72,0,length,.04,depth,M.oak,g,.015);
  for(const u of [-length/2+.08,length/2-.08])for(const v of [-depth/2+.09,depth/2-.09])B(u,0,v,.035,.72,.035,M.metal,g);
  const monitor=length*.25,laptopX=-length*.25;
  B(monitor,.78,-.18,.62,.37,.032,M.dark,g,.015);B(monitor,.84,-.156,.598,.336,.004,screenMaterial,g);
  B(monitor,.73,-.18,.025,.08,.022,M.metal,g);
  B(laptopX,.78,-.10,.43,.025,.28,M.dark,g,.012);
  const laptop=B(laptopX,.81,-.22,.43,.27,.018,M.dark,g,.01);laptop.rotation.x=-.13;
  B(laptopX,.83,-.208,.40,.23,.003,screenMaterial,g);
  B(.06,.76,.14,.41,.025,.16,M.dark,g,.013);B(length/2-.19,.76,.14,.09,.025,.13,M.white,g,.02);
  if(item.displayWall){
   if(item.displayWall.closed){
    // Wall-hung above the 1.28 m cut, so every part is cut with the walls (material-kit.js cut twins): carcass in the preset's
    // cabinet finish, push-open glass, no handles.
    const w=length-.08,z=-.215,d=.22,y=1.42,h=.64,K=M.doorCut||C,Wh=M.whiteCut||M.white,O=M.oliveCut||M.olive,Dk=M.darkCut||M.dark;
    for(const u of [-w/2+.009,w/2-.009])B(u,y,z,.018,h,d,K,g);
    for(const yy of [y,y+.31,y+h-.018])B(0,yy,z,w,.018,d,K,g);
    B(0,y,z-d/2+.009,w,h,.018,Wh,g);
    for(const u of [-w/6,w/6])B(u,y,z,.018,h,d,K,g);
    B(0,y+.018,z+d/2-.008,w-.036,h-.036,.008,M.glass,g);
    for(const yy of [y+.025,y+.335])for(const u of [-.56,0,.56]){
     B(u,yy,z,.28,.065,.12,O,g,.012);B(u,yy+.06,z,.15,.05,.10,Dk,g,.008);
    }
   }else for(const y of [1.37,1.83]){
    B(0,y,-.20,length-.08,.024,.19,M.oak,g,.006);
    for(const u of [-.61,-.37,-.13,.13,.37,.61]){
     B(u,y+.025,-.20,.12,.065,.12,M.olive,g,.01);B(u,y+.09,-.20,.08,.055,.09,M.dark,g,.008);
    }
   }
  }
 }
 // Display cabinets: carcass and shelves in the preset's cabinet finish (material-kit.js); one handle per style at each glass
 // door, only the preset's style visible (bar 15 cm, knob, or a flush pull strip).
 const C=M.door||M.oak;
 function handle(u,v,alongZ){const P=(a,b,y,w,h,d,m,r)=>alongZ?B(a,y,b,d,h,w,m,itemParent,r):B(a,y,b,w,h,d,m,itemParent,r);
  P(u,v,1.08,.008,.15,.014,M.handleBar||M.brass);P(u,v,1.13,.026,.026,.016,M.handleKnob||M.brass,.01);P(u,v,1.02,.012,.26,.004,M.handlePull||M.brass);}
 function collection(item){
  const [x,z,X,Z]=item.box,cx=(x+X)/2,cz=(z+Z)/2;
  if(X-x>Z-z){
   const w=X-x,d=Z-z,front=z+.012;
   B(cx,0,cz,w,.46,d,C);B(cx,.46,cz,w,1.64,d,M.white);
   for(const xx of [x+.015,X-.015])B(xx,.46,cz,.025,1.64,d,C);
   for(const y of [.47,.88,1.28,1.68,2.07])B(cx,y,cz,w-.05,.022,d,C);
   B(cx,.49,front,w-.05,1.54,.016,M.glass);
   for(const yy of [.58,.99,1.39,1.79])for(const xx of [x+.38,X-.38]){
    B(xx,yy,cz,.19,.055,.21,M.olive,itemParent,.02);B(xx,yy+.05,cz,.11,.045,.13,M.dark,itemParent,.016);
   }
   for(const xx of [x+.38,X-.38])handle(xx,front+.003,0);
   return;
  }
  const front=x>5?x+.012:X-.012;
  B(cx,0,cz,X-x,.46,Z-z,C);
  B(cx,.46,cz,X-x,1.64,Z-z,M.white);
  for(const zz of [z+.015,Z-.015])B(cx,.46,zz,X-x,1.64,.025,C);
  for(const y of [.47,.88,1.28,1.68,2.07])B(cx,y,cz,X-x,.022,Z-z-.05,C);
  B(front,.49,cz,.016,1.54,Z-z-.05,M.glass);
  for(const yy of [.58,.99,1.39,1.79])for(const zz of [z+.38,z+1.06]){
   B(cx,yy,zz,.19,.055,.21,M.olive,itemParent,.02);
   B(cx,yy+.05,zz,.11,.045,.13,M.dark,itemParent,.016);
  }
  for(const zz of [z+.38,z+1.08])handle(front+(front===x+.012?-.003:.003),zz,1);
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
 const chairBox=plan.chairBox|| (id==='balanced'?[4.92,8.17,5.48,8.73]:[4.27,8.37,4.83,8.93]);
 const [x,z,X,Z]=chairBox,cx=(x+X)/2,cz=(z+Z)/2;
 const cg=new THREE.Group();cg.name='work-chair';cg.position.set(cx,0,cz);cg.rotation.y=plan.chairRotation||0;group.add(cg);
 B(0,.40,0,.48,.09,.46,M.olive,cg,.045);B(0,.50,.17,.46,.42,.065,M.linen,cg,.025);
 B(0,.09,0,.035,.31,.035,M.metal,cg);
 B(0,.02,0,.54,.025,.025,M.metal,cg);B(0,.02,0,.025,.025,.54,M.metal,cg);
 const accent=new THREE.PointLight('#ffe5b7',0,2.4,2);accent.visible=false;
 accent.position.set(id==='balanced'?6.0:3.9,1.5,id==='central'?8.0:9.4);group.add(accent);
 function setMood(mood,preferences={}){
  screenMaterial.color.set(mood==='rest'?'#404a44':mood==='game'?'#82b7ae':'#9db0a4');
  accent.color.set(preferences.primary||'#ffe5b7');
 }
 setMood('focus');
 return {group,day,guest,items,accent,setMood};
}
