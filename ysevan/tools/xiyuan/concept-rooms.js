import * as THREE from 'three';
import {createFittedWardrobe} from './fitted-wardrobe.js?v=c03b30a317';
import {bedding} from './furnish-layer.js?v=bc9ae48c34';
import {conceptBedParts,deskFrame,monitorArm,officeChair,sofaDay,sofaGuest,groundOf} from './bedroom-kit.js?v=91fb07a8ba';

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
 // Bed after real products (bedroom-kit.js): frame on legs, timber-framed upholstered headboard; mattress and outline as before.
 function bed(item,parent=itemParent){
  const [x,z,X,Z]=item.box,cz=(z+Z)/2,d=Z-z,east=item.head==='east',mw=item.mattress[1],md=item.mattress[0];
  const {mattress,mattressX}=conceptBedParts(item,parent,{box,M,layout:id});mattressMeta(mattress,item);
  // Made bed (furnish-layer.js) in the mattress frame: its length along x, head at the headboard; the cloth stays inside the frame.
  const s=new THREE.Group();s.position.set(mattressX,0,cz);s.rotation.y=east?-Math.PI/2:Math.PI/2;parent.add(s);bedding(s,{width:md,length:mw,top:.49,M,scarf:M.olive,fit:[d/2-.006,(east?mattressX-x:X-mattressX)-.006]});
 }
 function desk(item){
  const [x,z,X,Z]=item.box,longX=X-x>Z-z,length=Math.max(X-x,Z-z),depth=Math.min(X-x,Z-z),g=new THREE.Group();g.position.set((x+X)/2,0,(z+Z)/2);g.rotation.y=item.face==='west'?-Math.PI/2:longX?0:Math.PI/2;itemParent.add(g);
  // Steel frame desk (bedroom-kit.js): side frames on feet, back beam, cable tray; monitor on a clamp arm.
  const Bg=(x0,y,z0,w,h,d,m,r=0)=>B(x0,y,z0,w,h,d,m,g,r);
  B(0,.72,0,length,.04,depth,M.oak,g,.015);deskFrame(Bg,{xs:[-length/2+.1,length/2-.1],depth,top:.72,M});
  const monitor=length*.25,laptopX=-length*.25;
  B(monitor,.78,-.18,.62,.37,.032,M.dark,g,.015);B(monitor,.84,-.156,.598,.336,.004,screenMaterial,g);
  monitorArm(Bg,g,{x:monitor,zb:-depth/2,y:.76,armY:.9,screenZ:-.196,M});
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
 // Fit-out round: the model cars stand on the shelves (they floated 8.8 cm above them, hidden in the white block before).
 function collection(item){
  const [x,z,X,Z]=item.box,cx=(x+X)/2,cz=(z+Z)/2;
  if(X-x>Z-z){
   const w=X-x,d=Z-z,front=z+.012;
   // The white is the back panel against the wall, not a block filling the case (it hid the models behind the glass).
   B(cx,0,cz,w,.46,d,C);B(cx,.46,Z-.009,w,1.64,.018,M.white);
   for(const xx of [x+.015,X-.015])B(xx,.46,cz,.025,1.64,d,C);
   for(const y of [.47,.88,1.28,1.68,2.07])B(cx,y,cz,w-.05,.022,d,C);
   B(cx,.49,front,w-.05,1.54,.016,M.glass);
   // Fit-out round: two glass doors meeting at the middle in narrow 20 mm frames (cabinet finish).
   for(const sg of [-1,1]){const a=sg<0?x+.025:cx+.0015,b=sg<0?cx-.0015:X-.025;for(const u of [a+.01,b-.01])B(u,.49,front,.02,1.54,.018,C);for(const v of [.49,2.01])B((a+b)/2,v,front,b-a-.04,.02,.018,C);}
   for(const yy of [.492,.902,1.302,1.702])for(const xx of [x+.38,X-.38]){
    B(xx,yy,cz,.19,.055,.21,M.olive,itemParent,.02);B(xx,yy+.05,cz,.11,.045,.13,M.dark,itemParent,.016);
   }
   for(const xx of [x+.38,X-.38])handle(xx,front+.003,0);
   return;
  }
  const front=x>5?x+.012:X-.012;
  B(cx,0,cz,X-x,.46,Z-z,C);
  B(x>5?X-.009:x+.009,.46,cz,.018,1.64,Z-z,M.white);
  for(const zz of [z+.015,Z-.015])B(cx,.46,zz,X-x,1.64,.025,C);
  for(const y of [.47,.88,1.28,1.68,2.07])B(cx,y,cz,X-x,.022,Z-z-.05,C);
  B(front,.49,cz,.016,1.54,Z-z-.05,M.glass);
  for(const sg of [-1,1]){const a=sg<0?z+.025:cz+.0015,b=sg<0?cz-.0015:Z-.025;for(const u of [a+.01,b-.01])B(front,.49,u,.018,1.54,.02,C);for(const v of [.49,2.01])B(front,v,(a+b)/2,.018,.02,b-a-.04,C);}
  for(const yy of [.492,.902,1.302,1.702])for(const zz of [z+.38,z+1.06]){
   B(cx,yy,zz,.19,.055,.21,M.olive,itemParent,.02);
   B(cx,yy+.05,zz,.11,.045,.13,M.dark,itemParent,.016);
  }
  for(const zz of [z+.38,z+1.08])handle(front+(front===x+.012?-.003:.003),zz,1);
 }
 // Sofa bed after real products (bedroom-kit.js): back at the west wall, length along z; opened: frame, mattress, pillow, throw.
 function sofa(item,parent,opened){
  const [x,z,X,Z]=item.box,cz=(z+Z)/2,w=X-x,d=Z-z,g=new THREE.Group();g.position.set(x,0,cz);parent.add(g);
  const Bs=(x0,y,z0,ww,h,dd,m,r=0)=>B(x0,y,z0,ww,h,dd,m,g,r),ground=(u,v)=>groundOf(id)(x+u,cz+v);
  if(!opened){sofaDay(Bs,{L:d,D:w,M,ground});return;}
  sofaGuest(Bs,{L:d,D:w,M,ground,mattress:item.mattress||[1.2,1.9]});
  Bs(w/2,.52,d/2-.24,.7,.12,.34,M.linen,.03);Bs(w/2,.52,-d/2+.42,1.16,.03,.5,M.olive);
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
 // Office chair (bedroom-kit.js): five-spoke base on casters inside the chair box, gas lift, padded seat, curved back, arms.
 officeChair((x0,y,z0,w,h,d,m,r=0)=>B(x0,y,z0,w,h,d,m,cg,r),cg,{M,rb:.27});
 const accent=new THREE.PointLight('#ffe5b7',0,2.4,2);accent.visible=false;
 accent.position.set(id==='balanced'?6.0:3.9,1.5,id==='central'?8.0:9.4);group.add(accent);
 function setMood(mood,preferences={}){
  screenMaterial.color.set(mood==='rest'?'#404a44':mood==='game'?'#82b7ae':'#9db0a4');
  accent.color.set(preferences.primary||'#ffe5b7');
 }
 setMood('focus');
 return {group,day,guest,items,accent,setMood};
}
