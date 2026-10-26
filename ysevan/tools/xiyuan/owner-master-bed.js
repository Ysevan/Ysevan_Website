import * as THREE from 'three';
import {bedding} from './furnish-layer.js?v=bc9ae48c34';
import {slimBedParts,groundOf,toWorld} from './bedroom-kit.js?v=91fb07a8ba';
// Removable platform bed. The mattress remains 1.80 x 2.00; outer frame 1.88 x 2.10. Fit-out round: the frame stands on four
// legs (on the rug's top where the rug lies under it), the 30 mm headboard is a walnut backing board under channel padding.
export function createOwnerMasterBed({cx,cz,width,length=2,rotation,layout='original'},{box,materials:M,parent}){
 const g=new THREE.Group();g.name='owner-master-slim-bed';g.position.set(cx,0,cz);g.rotation.y=rotation;parent.add(g);
 const B=(x,y,z,w,h,d,m,r=0)=>box(x,y,z,w,h,d,m,g,r),world=toWorld(cx,cz,rotation),ground=groundOf(layout);
 const {frame,mattress,head}=slimBedParts(B,{width,length,ground:(u,v)=>ground(...world(u,v))},M);
 frame.name='master-frame';mattress.name='master-mattress';head.name='master-headboard';
 bedding(g,{width,length,top:.52,M,fit:[width/2+.04,length/2+.05]});return g;
}
