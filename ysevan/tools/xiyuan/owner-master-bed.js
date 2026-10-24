import * as THREE from 'three';
import {bedding} from './furnish-layer.js?v=07d95e76b4';
// Removable platform bed. The mattress remains 1.80 x 2.00; outer frame 1.88 x 2.10.
export function createOwnerMasterBed({cx,cz,width,length=2,rotation},{box,materials:M,parent}){
 const g=new THREE.Group();g.name='owner-master-slim-bed';g.position.set(cx,0,cz);g.rotation.y=rotation;parent.add(g);
 const add=(name,x,y,z,w,h,d,m,r=0)=>{const q=box(x,y,z,w,h,d,m,g,r);q.name=name;return q;};
 add('master-frame',0,.10,0,width+.08,.20,length+.10,M.oak,.02);
 add('master-mattress',0,.32,0,width,.20,length,M.white,.035);
 add('master-headboard',0,.30,-length/2-.02,width+.08,.72,.03,M.olive,.008);
 bedding(g,{width,length,top:.52,M,fit:[width/2+.04,length/2+.05]});return g;
}
