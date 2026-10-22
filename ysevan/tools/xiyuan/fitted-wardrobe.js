import * as THREE from 'three';

// An open-front carcass keeps the recessed sliding fronts visible, while every
// component stays inside the measured cabinet footprint used by navigation.
export function createFittedWardrobe(spec,{box,materials:M,parent}){
 const [x0,z0,x1,z1]=spec.box;
 const group=new THREE.Group(),length=spec.length,depth=spec.depth,height=spec.height||2.36,top=spec.topBand||0,t=.024;
 group.name=spec.name;group.position.set((x0+x1)/2,0,(z0+z1)/2);
 group.rotation.y={west:-Math.PI/2,east:Math.PI/2,north:Math.PI,south:0}[spec.face];
 parent.add(group);
 // Carcass and fronts in the preset's cabinet finish (material-kit.js: wood grain or plain), door joints in walnut. The
 // fronts sit 30 mm behind the carcass edge, so framed doors and handles stay inside the measured footprint.
 const C=M.door||M.oak,F=M.door||M.white,J=M.walnut||M.oak;
 box(0,0,-depth/2+t/2,length,height,t,C,group);
 for(const x of [-(length-t)/2,(length-t)/2])box(x,0,0,t,height,depth,C,group);
 for(const y of [0,height-t])box(0,y,0,length-t*2,t,depth,C,group);
 const frontZ=depth/2-.03,face=frontZ+.009;
 const front=box(0,.06,frontZ,length-.05,height-.1-top,.018,F,group);
 front.name='sliding-front';
 const n=Math.ceil(length/.75),y1=height-.04-top;
 for(let i=1;i<n;i++)box(-length/2+length*i/n,.08,frontZ+.010,.007,height-.14-top,.002,J,group);
 // Segmented doors: a separate upper band for bulky, seldom-used items (reference videos, 2026-10-20).
 if(top){box(0,y1+.01,frontZ,length-.05,top-.02,.018,F,group);for(let i=1;i<n;i++)box(-length/2+length*i/n,y1+.02,frontZ+.010,.007,top-.04,.002,J,group);}
 // Framed doors (M.doorFrame, shown only for framed presets): 30 mm stiles and rails, 8 mm proud, 4 mm off each joint; the
 // stiles stay clear of the sight lines check:wardrobes casts at 0.30, 0.64 and 0.81 of the length.
 const FR=M.doorFrame||M.oak,frame=(a,b,lo,hi)=>{for(const u of [a+.004,b-.034])box(u+.015,lo,face+.004,.03,hi-lo,.008,FR,group);for(const v of [lo,hi-.03])box((a+b)/2,v,face+.004,b-a-.076,.03,.008,FR,group);};
 for(let i=0;i<n;i++){const a=-length/2+length*i/n,b=a+length/n;frame(a,b,.06,y1);if(top)frame(a,b,y1+.01,height-.05);}
 // Handles: slim bar, round knob or hidden pull channel, each its own material (only the preset's style is visible), all
 // below the 1.28 m cut and the 1.4 m sight line.
 for(let i=0;i<n;i++){const x=-length/2+length*(i+.86)/n;
  box(x,.98,face+.008,.012,.26,.016,M.handleBar||M.brass,group);box(x,1.06,face+.01,.032,.032,.02,M.handleKnob||M.brass,group,.012);box(x,.76,face+.0005,.016,.5,.001,M.handlePull||M.brass,group);}
 return group;
}
