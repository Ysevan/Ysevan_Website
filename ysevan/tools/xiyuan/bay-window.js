import * as THREE from 'three';
import {BAY} from './layout-data.js?v=f41b5854f9';
// Master-bedroom bay window after the owner's reference video (2026-10-20), fitted to the DWG-derived room.
// The sill and the wall under it are not cut: the desk rests on the sill, the shelf stands on the floor.
export function createBayWindow({box,cyl,book,vase,materials:M,parent}){
 const g=new THREE.Group();g.name='bay-window';parent.add(g);
 const warm=new THREE.MeshBasicMaterial({color:'#ffe5b7',toneMapped:false});
 const sheer=new THREE.MeshStandardMaterial({color:'#f6f3ec',roughness:.95,transparent:true,opacity:.42,depthWrite:false,side:THREE.DoubleSide});
 const mirror=new THREE.MeshStandardMaterial({color:'#dfe5e3',roughness:.08,metalness:.85});
 const B=(x0,y0,z0,x1,y1,z1,m,r=0)=>box((x0+x1)/2,y0,(z0+z1)/2,x1-x0,y1-y0,z1-z0,m,g,r);
 const {top,thick,niche,knee}=BAY.desk,lip=top-thick;
 // Step 2: one top over the whole sill; the 0.30 m knee overhang is only at the west end (dead end of the bed-side lane).
 B(niche[0],lip,niche[1],niche[2],top,niche[3],M.oak);B(knee[0],lip,knee[1],knee[2],top,knee[3],M.oak);
 for(const x of [niche[0]+.02,(niche[0]+niche[2])/2,niche[2]-.02])B(x-.009,BAY.opening.sill,niche[1]+.02,x+.009,lip,niche[3]-.02,M.oak);
 B(niche[0]+.03,lip-.008,niche[1]+.005,niche[2]-.03,lip,niche[1]+.015,warm).castShadow=false;
 book(1.32,BAY.opening.sill,11.68,'#b9ad93',g);book(1.36,BAY.opening.sill+.035,11.7,'#a7b29e',g);book(2.32,BAY.opening.sill,11.7,'#c9b48f',g);
 // Step 3 (reduced): no L-return, both side walls are taken; the west end of the desk doubles as the vanity.
 const disk=(r,d,m,z)=>{const q=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d,40),m);q.rotation.x=Math.PI/2;q.position.set(1.02,top+.27,z);q.castShadow=true;g.add(q);};
 disk(.165,.014,M.oak,11.735);disk(.15,.01,mirror,11.725);B(.99,top,11.72,1.05,top+.12,11.75,M.oak);B(.94,top,11.70,1.10,top+.015,11.78,M.oak);
 const [sx,sz]=BAY.stool.use,sr=BAY.stool.diameter/2;cyl(sx,0,sz,sr-.04,BAY.stool.seat-.06,M.oak,g,sr-.06);cyl(sx,BAY.stool.seat-.06,sz,sr,.06,M.linen,g);
 // Step 4: open shelf column in the window corner (doubles as the south bedside); fixed to the wall, no chasing.
 const [a0,b0,a1,b1]=BAY.shelf.box,H=BAY.shelf.height;
 B(a0,0,b0,a0+.018,H,b1,M.oak);B(a1-.018,0,b0,a1,H,b1,M.oak);B(a0,H-.02,b0,a1,H,b1,M.oak);B(a0,0,b0,a1,.06,b1,M.oak);
 for(const y of BAY.shelf.levels.slice(1))B(a0+.018,y,b0+.01,a1-.018,y+.02,b1,M.oak);
 B(a1-.03,.1,b0+.006,a1-.018,H-.06,b0+.016,warm).castShadow=false;
 for(let i=0;i<4;i++)box(a0+.08+i*.045,BAY.shelf.levels[3]+.02,(b0+b1)/2,.03,.24-i%2*.03,.19,i%2?M.linen:M.olive,g);
 vase((a0+a1)/2,BAY.shelf.levels[4]+.02,(b0+b1)/2,g);
 for(const y of [BAY.shelf.levels[1],BAY.shelf.levels[2]])box((a0+a1)/2,y+.02,(b0+b1)/2,.3,.14,.22,M.linen,g,.02);
 // Step 1: 0.18 m curtain box at the window head (bottom = head, never below it), sheer + fabric on two tracks.
 const c=BAY.curtain,[c0,c1,c2,c3]=c.box,drop=top+c.stopAboveDesk;
 B(c0,c.bottom,c1,c2,c.bottom+c.height,c3,M.white);
 for(const [x0,x1] of [[c0,c0+.3],[c2-.3,c2]])for(let i=0;i<5;i++)B(x0+i*.06,drop,c1+.03+(i%2)*.025,x0+i*.06+.06,c.bottom,c1+.06+(i%2)*.025,M.linen);
 for(const [x0,x1] of [[c0,c0+.22],[c2-.22,c2]])B(x0,drop,c3-.05,x1,c.bottom,c3-.03,sheer).castShadow=false;
 return g;
}
