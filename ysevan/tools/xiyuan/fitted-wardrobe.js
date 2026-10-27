import * as THREE from 'three';
import {WARDROBE_FULL} from './layout-data.js?v=3e32bfce2c';

// Built-in wardrobe with sliding doors (DWG A-家具 block 2222: 600 deep, 31 mm sides, 20 mm back, two door tracks), every part
// inside the measured cabinet footprint used by navigation. Local frame: length along x, the doors face +z.
// Fit-out round (2026-10-26), after real built-ins: an 80 mm toe kick set back 30 mm; aluminium bottom and top tracks; the
// leaves alternate on a front and a back track 26 mm apart and overlap 30 mm (no painted joint lines); a fixed 30 mm rail
// between the sliding leaves and the upper band; the upper band's push-to-open doors have 3 mm gaps; a to-the-slab cabinet gets
// a scribe strip closing the last 2 cm to the ceiling (收口). Framed presets put 30 mm stiles and rails on every leaf (M.doorFrame,
// shown only for framed presets); one handle per style on each sliding leaf (bar on standoffs, round knob, flush pull strip;
// only the preset's style is visible; back-track leaves take only the flush pull), all below the 1.28 m cut and clear of the 1.4 m sight lines check:wardrobes casts at the
// centre of every leaf.
export function createFittedWardrobe(spec,{box,materials:M,parent}){
 const [x0,z0,x1,z1]=spec.box;
 const group=new THREE.Group(),L=spec.length,D=spec.depth,H=spec.height||2.36,top=spec.topBand||0,t=.024;
 group.name=spec.name;group.position.set((x0+x1)/2,0,(z0+z1)/2);
 group.rotation.y={west:-Math.PI/2,east:Math.PI/2,north:Math.PI,south:0}[spec.face];
 parent.add(group);
 const B=(x,y,z,w,h,d,m,r=0)=>box(x,y,z,w,h,d,m,group,r);
 // Carcass and fronts in the preset's cabinet finish (material-kit.js: wood grain or plain), tracks in the dark metal.
 const C=M.door||M.oak,F=M.door||M.white,FR=M.doorFrame||M.oak,T=M.metal||M.oak;
 const K=.08,Li=L-2*t,front=D/2-.022,zF=front-.009,zR=zF-.026,slab=WARDROBE_FULL.slab;
 B(0,0,-D/2+t/2,L,H,t,C);
 for(const x of [-(L-t)/2,(L-t)/2])B(x,0,0,t,H,D,C,.01);
 // Top board: full depth (its front edge the cornice over the top track) or, under an upper band, behind the band's doors.
 if(top)B(0,H-t,(zF-.01-D/2)/2,Li,t,zF-.01+D/2,C);else B(0,H-t,0,Li,t,D,C);
 B(0,K,(t-.026)/2,Li,t,D-t-.026,C);
 B(0,0,D/2-.039,Li,K,.018,C);
 if(H>slab-.05)B(0,H,zF,L,slab-H-.001,.018,C);
 // Sliding zone: bottom track on the bottom board, top track under the fixed rail (or under the top board).
 const yb=K+t+.01,yt=top?H-top-.03:H-t,yl=yt-.016;
 for(const y of [K+t,yl+.002])B(0,y,(zR+zF)/2,Li,.01,.044,T);
 if(top)B(0,H-top-.03,zF,Li,.03,.018,C);
 const n=Math.ceil(L/.75),p=Li/n,ov=.03,frame=(a,b,lo,hi,z)=>{for(const u of [a+.004,b-.034])B(u+.015,lo,z+.013,.03,hi-lo,.008,FR);for(const v of [lo,hi-.03])B((a+b)/2,v,z+.013,b-a-.076,.03,.008,FR);};
 for(let i=0;i<n;i++){
  const a=Math.max(-Li/2,-Li/2+i*p-ov/2),b=Math.min(Li/2,-Li/2+(i+1)*p+ov/2),z=i%2?zR:zF,face=z+.009;
  const leaf=B((a+b)/2,yb,z,b-a,yl-yb,.018,F);leaf.name='sliding-front';
  frame(a,b,yb,yl,z);
  // Handles near each leaf's right edge (bar 260 mm on two standoffs, 32 mm knob, 500 mm flush pull strip). A back-track leaf
  // passes 8 mm behind the front leaves, so it only takes the flush pull (a bar or knob there would catch on them).
  const x=a+(b-a)*.86;
  if(!(i%2)){for(const y of [1.0,1.2])B(x,y,face+.005,.008,.012,.01,M.handleBar||M.brass);
   B(x,.98,face+.0145,.012,.26,.009,M.handleBar||M.brass);B(x,1.06,face+.01,.032,.032,.02,M.handleKnob||M.brass,.012);}
  B(x,.76,face+.0005,.016,.5,.001,M.handlePull||M.brass);
 }
 // Upper band: push-to-open doors in the front plane, 3 mm gaps, overlaying the top board.
 if(top)for(let i=0;i<n;i++){const a=-Li/2+i*p+.0015,b=a+p-.003;B((a+b)/2,H-top+.003,zF,b-a,top-.006,.018,F);frame(a,b,H-top+.003,H-.003,zF);}
 return group;
}
