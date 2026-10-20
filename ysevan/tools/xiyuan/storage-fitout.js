import * as THREE from 'three';
import {SOUTH_SIDE_CABINET} from './layout-data.js?v=8f9f3283af';
// Slim open side cabinet from the owner's reference videos (2026-10-20): scarves and bags by the bedroom door.
export function createSideCabinet({box,materials:M,parent}){
 const g=new THREE.Group();g.name='south-side-cabinet';parent.add(g);
 const [x0,z0,x1,z1]=SOUTH_SIDE_CABINET.box,H=SOUTH_SIDE_CABINET.height,t=.018;
 const warm=new THREE.MeshBasicMaterial({color:'#ffe5b7',toneMapped:false});
 const B=(a0,y0,b0,a1,y1,b1,m)=>box((a0+a1)/2,y0,(b0+b1)/2,a1-a0,y1-y0,b1-b0,m,g);
 B(x0,0,z0,x1,H,z0+t,M.oak);B(x0,0,z1-t,x1,H,z1,M.oak);B(x0,0,z0,x0+t,H,z1,M.white);
 for(const y of SOUTH_SIDE_CABINET.levels)B(x0+t,y,z0+t,x1,y+t,z1-t,M.oak);
 B(x0+t,H-.06,z0+t,x0+t+.006,H-.03,z1-t,warm).castShadow=false;
 // A few scarves and bags as size allowances, not products.
 for(const [y,h,c] of [[.92,.34,M.linen],[1.32,.3,M.terracotta],[1.72,.32,M.olive]])box(x0+.08,y,(z0+z1)/2,.1,h,.34,c,g,.02);
 return g;
}
