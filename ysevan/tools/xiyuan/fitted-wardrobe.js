import * as THREE from 'three';

// An open-front carcass keeps the recessed sliding fronts visible, while every
// component stays inside the measured cabinet footprint used by navigation.
export function createFittedWardrobe(spec,{box,materials:M,parent}){
 const [x0,z0,x1,z1]=spec.box;
 const group=new THREE.Group(),length=spec.length,depth=spec.depth,height=2.36,t=.024;
 group.name=spec.name;group.position.set((x0+x1)/2,0,(z0+z1)/2);
 group.rotation.y={west:-Math.PI/2,east:Math.PI/2,north:Math.PI,south:0}[spec.face];
 parent.add(group);
 box(0,0,-depth/2+t/2,length,height,t,M.oak,group);
 for(const x of [-(length-t)/2,(length-t)/2])box(x,0,0,t,height,depth,M.oak,group);
 for(const y of [0,height-t])box(0,y,0,length-t*2,t,depth,M.oak,group);
 const frontZ=depth/2-.012;
 const front=box(0,.06,frontZ,length-.05,2.26,.018,M.white,group);
 front.name='sliding-front';
 const n=Math.ceil(length/.75);
 for(let i=1;i<n;i++)box(-length/2+length*i/n,.08,frontZ+.010,.007,2.22,.002,M.oak,group);
 for(let i=0;i<n;i++)box(-length/2+length*(i+.86)/n,1,frontZ+.010,.012,.22,.002,M.brass,group);
 return group;
}
