import * as THREE from 'three';
import {pointIn} from './navigation.js?v=3af6116843';
import {layoutBoxes,BAY_BOXES} from './layout-data.js?v=e4f2bd0850';
import {STUDY_COLLISIONS} from './design-data.js?v=0d48267e23';

// Round 2 light layer: the sun-shadow fit for a unit, contact shadows under furniture and fake ambient occlusion along
// the walls. Shading is vertex-alpha geometry drawn with one unlit material that writes no depth, built as whole geometries
// (one per furniture group, a foot and a ceiling one per wall set), so batchStatic() adds no draw calls of its own.

// Orthographic sun-shadow bounds that just cover a unit: its outline, floor to ceiling, seen from the sun.
// A shadow caster always shares its receiver's spot in this view, so covering the receivers is enough.
export function lightSpaceBounds(eye,target,outline,{y0=0,y1=2.78,margin=.6}={}){
 const X=new THREE.Vector3(),Y=new THREE.Vector3(),Z=new THREE.Vector3(),p=new THREE.Vector3();
 new THREE.Matrix4().lookAt(eye,target,new THREE.Vector3(0,1,0)).extractBasis(X,Y,Z);
 let left=Infinity,right=-Infinity,bottom=Infinity,top=-Infinity;
 for(const [x,z] of outline)for(const y of [y0,y1]){p.set(x,y,z).sub(eye);const u=p.dot(X),v=p.dot(Y);left=Math.min(left,u);right=Math.max(right,u);bottom=Math.min(bottom,v);top=Math.max(top,v);}
 return {left:left-margin,right:right+margin,bottom:bottom-margin,top:top+margin};
}

// Furniture that gets a contact shadow, per layout, as [x0,z0,x1,z1]. The owner's master bed is rebuilt with its width
// and carries its own patch (app.js bed()); the bay joinery is the same in every layout and sits outside the fit-outs.
// Concept layouts: every item of the layout's JSON except the opened guest bed, which shares the sofa's base.
export function layoutFootprints(id,concept){
 if(id==='original'){const S=STUDY_COLLISIONS;return [...layoutBoxes('original').filter(b=>!BAY_BOXES.includes(b)),S.desk,S.storage,S.day];}
 return [...concept.furniture.filter(q=>q.kind!=='guest').flatMap(q=>q.footprints||[q.box]),...(concept.chairBox?[concept.chairBox]:[])];
}

const TINT=[.03,.028,.022];
export function shadeMaterial(clipPlane){return new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,depthWrite:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-4,clippingPlanes:clipPlane?[clipPlane]:null});}
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function shade(){
 const P=[],C=[];
 const tri=(a,b,c)=>{for(const [p,k] of [a,b,c]){P.push(...p);C.push(...TINT,k);}};
 return {
  // A grid of quads at O + U·u + V·v with alpha amp·au·av, wound to face n.
  sheet(O,U,us,V,vs,n,amp){
   const at=(i,j)=>[[O[0]+U[0]*us[i][0]+V[0]*vs[j][0],O[1]+U[1]*us[i][0]+V[1]*vs[j][0],O[2]+U[2]*us[i][0]+V[2]*vs[j][0]],amp*us[i][1]*vs[j][1]];
   for(let i=0;i+1<us.length;i++)for(let j=0;j+1<vs.length;j++){
    const a=at(i,j),b=at(i+1,j),c=at(i+1,j+1),d=at(i,j+1);if(a[1]+b[1]+c[1]+d[1]<=0)continue;
    if(dot(cross(sub(b[0],a[0]),sub(d[0],a[0])),n)>=0){tri(a,b,c);tri(a,c,d);}else{tri(a,c,b);tri(a,d,c);}
   }
  },
  geometry(){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,4));g.computeBoundingSphere();return g;}
 };
}

// Contact shadow: darkest under the piece, eased out over 14 cm past its footprint (a rounded falloff at the corners).
// Drawn 3.7 cm up, just over the rugs (top 3.5 cm): beds and sofas mostly stand on one, which would hide a floor-level patch.
const CONTACT=[[-.06,1],[0,.85],[.035,.45],[.07,.18],[.14,0]];
function falloff(a,b,ring){const h=Math.min(-ring[0][0],(b-a)*.45),r=ring.map(([d,k])=>[d<0?-h:d,k]);return [...r.slice().reverse().map(([d,k])=>[a-d,k]),...r.map(([d,k])=>[b+d,k])];}
export function contactGeometry(boxes,{alpha=.36,y=.037}={}){
 const s=shade();for(const [x0,z0,x1,z1] of boxes)s.sheet([0,y,0],[1,0,0],falloff(x0,x1,CONTACT),[0,0,1],falloff(z0,z1,CONTACT),[0,1,0],alpha);return s.geometry();
}

// Fake ambient occlusion along every wall face that has floor (and so roof) in front of it: a 25 cm band up the wall
// foot and 18 cm out across the floor, and a 12 cm band each side of every inside corner (foot); the same pair of bands
// below the ceiling (ceiling, a separate geometry: it only shows indoors). Window spans and the facade toward open air
// get none; door openings are gaps in the wall outlines already.
const FOOT_WALL=[[0,1],[.05,.55],[.12,.2],[.25,0]],FOOT_FLOOR=[[.004,1],[.04,.55],[.09,.18],[.18,0]];
const CEIL_WALL=[[0,1],[.05,.6],[.12,.25],[.25,0]],CEIL_FLOOR=[[.004,1],[.05,.5],[.1,.18],[.2,0]],SEAM=[[0,1],[.03,.5],[.065,.18],[.12,0]];
export const AO={foot:.24,ceiling:.16,seam:.13,height:2.78,offset:.004,floorY:.016,minRun:.25,windowGap:.32};
function cleanRing(ring){
 let r=ring.filter((p,i)=>{const q=ring[(i+1)%ring.length];return Math.hypot(p[0]-q[0],p[1]-q[1])>.002;});
 for(let changed=true;changed&&r.length>3;){changed=false;
  for(let i=0;i<r.length;i++){const a=r[(i+r.length-1)%r.length],b=r[i],c=r[(i+1)%r.length],u=[b[0]-a[0],b[1]-a[1]],v=[c[0]-b[0],c[1]-b[1]],lu=Math.hypot(...u),lv=Math.hypot(...v);
   if(Math.abs(u[0]*v[1]-u[1]*v[0])/(lu*lv)<.002&&u[0]*v[0]+u[1]*v[1]>0){r.splice(i,1);changed=true;break;}}}
 return r;
}
export function wallAOGeometry(plan,{footprint,floorHoles=[],windows=[]}={}){
 const s=shade(),top=shade(),H=AO.height,o=AO.offset;
 const solids=plan.wallPolygons.map((p,i)=>{const holes=plan.wallHoles?.[i]||[],xs=p.map(q=>q[0]),zs=p.map(q=>q[1]);return {p,holes,b:[Math.min(...xs),Math.min(...zs),Math.max(...xs),Math.max(...zs)]};});
 const inWall=(x,z)=>solids.some(w=>x>=w.b[0]&&x<=w.b[2]&&z>=w.b[1]&&z<=w.b[3]&&pointIn([x,z],w.p)&&!w.holes.some(h=>pointIn([x,z],h)));
 const onFloor=(x,z)=>pointIn([x,z],footprint)&&!floorHoles.some(h=>pointIn([x,z],h));
 // Window spans: wall faces parallel to a window line and within a wall's thickness of it. A window whose middle lies
 // inside a wall outline is buried in solid wall (no opening to see), so its face keeps the band.
 const open=windows.filter(([x1,z1,x2,z2])=>!inWall((x1+x2)/2,(z1+z2)/2));
 const nearWindow=(x,z,d)=>open.some(([x1,z1,x2,z2])=>{const wx=x2-x1,wz=z2-z1,L=Math.hypot(wx,wz);if(L<1e-6||Math.abs(wx*d[1]-wz*d[0])/L>.08)return false;const t=((x-x1)*wx+(z-z1)*wz)/(L*L);if(t<-.01/L||t>1+.01/L)return false;return Math.abs((x-x1)*wz-(z-z1)*wx)/L<AO.windowGap;});
 const strip=(a,d,n,t0,t1)=>{const O=[a[0]+d[0]*t0,0,a[1]+d[1]*t0],U=[d[0],0,d[1]],N=[n[0],0,n[1]],L=t1-t0,us=[[0,1],[L,1]],W=[O[0]+N[0]*o,0,O[2]+N[2]*o];
  s.sheet(W,U,us,[0,1,0],FOOT_WALL,N,AO.foot);s.sheet([O[0],AO.floorY,O[2]],U,us,N,FOOT_FLOOR,[0,1,0],AO.foot);
  top.sheet([W[0],H,W[2]],U,us,[0,-1,0],CEIL_WALL,N,AO.ceiling);top.sheet([O[0],H-o,O[2]],U,us,N,CEIL_FLOOR,[0,-1,0],AO.ceiling);};
 const stats={edges:0,runs:0,seams:0};
 for(const w of solids)for(const ring of [w.p,...w.holes]){
  const r=cleanRing(ring),edges=[];
  for(let i=0;i<r.length;i++){
   const a=r[i],b=r[(i+1)%r.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]),d=[(b[0]-a[0])/L,(b[1]-a[1])/L];let n=[d[1],-d[0]];
   const m=[(a[0]+b[0])/2,(a[1]+b[1])/2],q=[m[0]+n[0]*.01,m[1]+n[1]*.01];if(pointIn(q,w.p)&&!w.holes.some(h=>pointIn(q,h)))n=[-n[0],-n[1]];
   // Sample every 2.5 cm: open air in front (not another wall), floor under the whole band, not a window span.
   const step=.025,k=Math.max(1,Math.round(L/step)),ok=[];
   for(let j=0;j<k;j++){const t=(j+.5)*L/k,x=a[0]+d[0]*t,z=a[1]+d[1]*t;ok.push(!inWall(x+n[0]*.02,z+n[1]*.02)&&onFloor(x+n[0]*.02,z+n[1]*.02)&&onFloor(x+n[0]*.19,z+n[1]*.19)&&!nearWindow(x,z,d));}
   const runs=[];for(let j=0;j<k;){if(!ok[j]){j++;continue;}let e=j;while(e<k&&ok[e])e++;runs.push([j*L/k,e*L/k]);j=e;}
   edges.push({a,d,n,L,runs:runs.filter(([t0,t1])=>t1-t0>=AO.minRun),start:ok[0],end:ok[k-1]});stats.edges++;
  }
  for(const e of edges)for(const [t0,t1] of e.runs){strip(e.a,e.d,e.n,t0,t1);stats.runs++;}
  // Inside corners: the next face turns toward the open side of this one.
  for(let i=0;i<edges.length;i++){const e1=edges[i],e2=edges[(i+1)%edges.length];
   if(e2.d[0]*e1.n[0]+e2.d[1]*e1.n[1]<.5||!e1.end||!e2.start||!e1.runs.length||!e2.runs.length)continue;
   const c=[e2.a[0],0,e2.a[1]],w1=Math.min(SEAM.at(-1)[0],e1.L),w2=Math.min(SEAM.at(-1)[0],e2.L),prof=w=>SEAM.map(([u,k])=>[u*w/SEAM.at(-1)[0],k]),vs=[[0,1],[H,1]];
   s.sheet([c[0]+e1.n[0]*o,0,c[2]+e1.n[1]*o],[-e1.d[0],0,-e1.d[1]],prof(w1),[0,1,0],vs,[e1.n[0],0,e1.n[1]],AO.seam);
   s.sheet([c[0]+e2.n[0]*o,0,c[2]+e2.n[1]*o],[e2.d[0],0,e2.d[1]],prof(w2),[0,1,0],vs,[e2.n[0],0,e2.n[1]],AO.seam);stats.seams++;}
 }
 return {foot:s.geometry(),ceiling:top.geometry(),stats};
}
