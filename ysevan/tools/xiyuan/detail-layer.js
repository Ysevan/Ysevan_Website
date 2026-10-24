import * as THREE from 'three';
import {detailMaterials,FRAME,STONE,tint,boxGeo,stripGeo,skirtingGeo,merge,mesh,stopGeo,fixtureGeo,downlightGeo,curtainGeo} from './detail-kit.js?v=95ac5fde41';
// Hard-finish placement (scene detail round 2): reads the CAD walls, the doorway()/slider()/windowWall() specs and the
// owner's layouts, and decides where skirting, thresholds, door stops, sills, switches, downlights and curtains go.
// Plan metres; the right-hand units mirror at x = 41.8 like the scene clones.

export function inPoly(x,z,p){let c=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const [xi,zi]=p[i],[xj,zj]=p[j];if((zi>z)!==(zj>z)&&x<(xj-xi)*(z-zi)/(zj-zi)+xi)c=!c;}return c;}
export const solid=(walls,x,z)=>walls.wallPolygons.some((p,i)=>inPoly(x,z,p)&&!(walls.wallHoles[i]||[]).some(h=>inPoly(x,z,h)));
// Solid wall or a shaft enclosed by one.
const enclosed=(walls,x,z)=>walls.wallPolygons.some(p=>inPoly(x,z,p));
const MX=41.8,mirrorBox=([a,b,c,d])=>[MX-c,b,MX-a,d],inBox=(x,z,[a,b,c,d])=>x>=a&&x<=c&&z>=b&&z<=d;
// Unit interiors, and paved or wet floors: app.js paving boxes and commonTile (lobbies, bridge), the bath rooms with the inner
// bath's window bay, and the A units' bathrooms (no paving box there).
const UNITS=[[-.1,.1,10.75,13.45],[10.75,3.15,20.9,15.15]];
const WET=[[6.35,0,9,3.4],[5.4,3.15,7,5.95],[5.4,2.55,6.35,3.15],[0,5.94,1.9,8.1],[3.35,11.55,10.55,13.35],[0,2.275,2.8,3.925],[5.3,3.15,7,5.95],[.1,5.95,1.8,8.05],[5.3,2.45,6.4,3.2],
 [8.95,-2.3,14.45,1],[10.75,1.15,11.35,3.25],[14.55,1.1,27.25,2.5],[12.45,3.2,14.95,5.4],[14.65,5.6,16.4,8.4],[18.5,5.6,20.8,8.5],[10.35,13.55,17.25,15.05]];
// Fixed bay-window seats (app.js, below the window walls): no skirting or sill in front of them.
const SEATS=[[.705,11.65,2.855,12.15],[3.935,2.49,5.185,2.97],[5.45,2.49,6.15,2.97]];
const both=list=>[...list,...list.map(mirrorBox)];
const units=both(UNITS),wet=both(WET),seats=both(SEATS);

// Wall thickness t and centre offset c across a doorway, measured just beyond both jambs in whichever wall set has a wall
// there; the thinnest reading wins, so a cross wall meeting the jamb is not mistaken for the doorway's own wall.
export function doorReveal(sets,x,z,w,along){
 const P=(u,v)=>along==='z'?[x+v,z-u]:[x+u,z+v];let best=null;
 for(const walls of sets)for(const k of [.03,.08,.15])for(const u of [-w/2-k,w/2+k]){
  let v0=null;for(let k=0;k<=24&&v0===null;k++)for(const v of [k*.005,-k*.005])if(v0===null&&solid(walls,...P(u,v)))v0=v;
  if(v0===null)continue;let a=v0,b=v0;while(a>-.45&&solid(walls,...P(u,a-.005)))a-=.005;while(b<.45&&solid(walls,...P(u,b+.005)))b+=.005;
  const t=Math.round((b-a+.005)*100)/100;if(t>=.06&&(!best||t<best.t))best={t,c:Math.round((a+b)/2*100)/100};
 }
 return best||{t:.1,c:0};
}
// +1 when the room is on the window group's local +z side (world (-dz,dx)), from the floor footprint.
export function windowSide([x1,z1],[x2,z2],footprint){const L=Math.hypot(x2-x1,z2-z1);return inPoly((x1+x2)/2-(z2-z1)/L*.3,(z1+z2)/2+(x2-x1)/L*.3,footprint)?1:-1;}

// Doorway frame in plan: local (u along the opening, v across) ↔ world, honouring the group's mirror and the x=41.8 clone.
function frameOf(d){
 const sx=d.g.scale.x,m=d.mirrored;
 const world=(u,v)=>{const p=sx*u,[x,z]=d.along==='z'?[d.x+v,d.z-p]:[d.x+p,d.z+v];return m?[MX-x,z]:[x,z];};
 const local=(px,pz)=>{if(m)px=MX-px;const dx=px-d.x,dz=pz-d.z;return d.along==='z'?[-dz*sx,dx]:[dx*sx,dz];};
 const half=Math.max(d.t/2,.07);
 return {...d,world,local,half,
  zone:(x,z)=>{const [u,v]=local(x,z);return Math.abs(u)<=d.w/2+(d.kind==='slider'?.04:.12)&&Math.abs(v-d.c)<=half+.03;},
  passage:(x,z)=>{const [u,v]=local(x,z);return Math.abs(u)<=d.w/2&&Math.abs(v-d.c)<=d.t/2+.6;},
  box:(u0,v0,u1,v1)=>{const a=world(u0,v0),b=world(u1,v1);return [Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0],b[0]),Math.max(a[1],b[1])];}};
}
function windowOf(q){
 const a=q.mirrored?[MX-q.a[0],q.a[1]]:q.a,b=q.mirrored?[MX-q.b[0],q.b[1]]:q.b,L=Math.hypot(b[0]-a[0],b[1]-a[1]),dx=(b[0]-a[0])/L,dz=(b[1]-a[1])/L;
 const s=q.mirrored?-q.side:q.side,n=[-dz*s,dx*s],mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;
 const local=(x,z)=>[(x-mx)*dx+(z-mz)*dz,(x-mx)*n[0]+(z-mz)*n[1]];
 const seat=seats.some(r=>inBox(mx+n[0]*.12,mz+n[1]*.12,r));
 return {...q,a,b,L,dir:[dx,dz],n,mid:[mx,mz],local,sill:q.base&&!seat,inBase:(x,z)=>{const [u,v]=local(x,z);return q.base&&Math.abs(u)<=L/2&&Math.abs(v)<=.08;}};
}

// Switches at 1.30 m (centre) by the latch side of each owner door; sockets by beds, desks, the TV wall, sofa and counter.
// [x, y, z, facing]: the plate's back is on the wall (or wainscot / splashback) face, facing = room direction.
const SW=[[10.35,1.3,1.2,'z'],[3.0,1.3,7.05,'-z'],[1.8,1.3,6.15,'x'],[4.1,1.3,5.85,'-z'],[6.6,1.3,5.95,'z']];
const LIVING=[[10.55,.58,7.95,'-x'],[10.55,.58,10.15,'-x'],[6.7,.3,7.55,'x'],[6.7,.3,10.55,'x'],[6.6175,1.12,2.55,'x'],[6.6175,1.12,.75,'x']];
const MASTER=[[.108,.55,8.67,'x'],[.108,.55,10.93,'x']];
export const FIXTURES={
 original:[...SW,[5.5,1.3,7.35,'x'],...LIVING,...MASTER,[6.5,.55,8.25,'-x'],[6.5,.55,10.85,'-x'],[2.8,.9,2.95,'-x'],[3.0,.87,5.5,'x']],
 balanced:[...SW,[5.5,1.3,7.35,'x'],...LIVING,...MASTER,[5.4,.9,7.55,'z']],
 family:[...SW,[5.5,1.3,7.35,'x'],...LIVING,...MASTER,[3.5,.9,9.45,'x']],
 central:[...SW,[4.8,1.3,7.05,'-z'],...LIVING,...MASTER,[6.492,.55,8.75,'-x'],[6.492,.55,11.05,'-x'],[6.38,.9,7.15,'z']]
};
// Owner's ceiling: downlights in living, dining, entry, corridor and bedrooms (none over a pillow), a cove line round the living room.
export const DOWNLIGHTS=[[7.25,7.75],[7.25,9.25],[7.25,10.75],[10,7.75],[10,9.25],[10,10.75],[9.9,3.75],[9.9,5.3],[7.65,6.4],[9.15,6.4],[9.75,1.75],[9.75,2.65],
 [2.75,6.5],[4.1,6.5],[5.45,6.5],[2.3,7.6],[.65,8.65],[2.35,8.65],[.65,11],[2.35,11],[4,8.45],[6,8.45],[4,10.95],[6,10.95],[4.15,3.9],[4.15,5.15],[.8,4.5],[2.1,4.5],[1.45,3.2]];
export const COVE=[6.95,7.3,10.3,11.2];
// Curtains, stacked open at both ends of each window; [a, b, bottom, top], listed so the room is on the left of a→b (curtainGeo()).
// Living and south-room sliders hang from the ceiling, the north bay to its seat; the master bay has its own curtain box
// (bay-window.js). The north-west window only where it is a bedroom.
export const CURTAINS={all:[[[7.4,11.39],[6.95,11.39],.02,2.77],[[10.25,11.39],[9.8,11.39],.02,2.77],[[4.4,11.39],[3.95,11.39],.02,2.77],[[6.25,11.39],[5.8,11.39],.02,2.77],
 [[4.02,2.6],[4.32,2.6],.5,2.77],[[4.98,2.6],[5.28,2.6],.5,2.77]],northWest:[[[.13,2.64],[.53,2.64],.02,2.77],[[2.3,2.64],[2.72,2.64],.02,2.77]]};

export function createDetailLayer({mat,M,clipPlane,footprint,floorHoles,wallSets,groups,doors,windows,mirrored,hidden=[],roof,owner,layouts}){
 const D=detailMaterials({mat,M,clipPlane}),out={skirting:{},doors:[]};
 const specs=doors.filter(d=>!hidden.includes(d.g)).flatMap(d=>mirrored.includes(d.target)?[{...d},{...d,mirrored:true}]:[{...d}]).map(frameOf);
 const wins=windows.flatMap(q=>mirrored.includes(q.target)?[q,{...q,mirrored:true}]:[q]).map(windowOf);
 const indoor=(x,z)=>inPoly(x,z,footprint)&&!floorHoles.some(h=>inPoly(x,z,h))&&units.some(b=>inBox(x,z,b));
 for(const [id,walls] of Object.entries(wallSets)){
  const here=specs.filter(d=>!enclosed(walls,...d.world(0,d.c))),winHere=wins.filter(q=>!solid(walls,...q.mid));
  const room=(x,z)=>indoor(x,z)&&!enclosed(walls,x,z)&&!wet.some(b=>inBox(x,z,b))&&!seats.some(b=>inBox(x,z,b))&&!winHere.some(q=>q.inBase(x,z));
  const jamb=(x,z,d)=>winHere.some(q=>{const [u,v]=q.local(x,z);return Math.abs(d[0]*q.dir[0]+d[1]*q.dir[1])<.2&&Math.abs(u)<=q.L/2+.01&&Math.abs(v)<=.13;});
  // Exact stretches (metres along the edge) where the skirting line meets a doorway: up to the casing's outer edge, or a slider's post.
  const span=(x0,dx,lo,hi)=>Math.abs(dx)<1e-9?(x0>=lo&&x0<=hi?[-1e9,1e9]:null):[(lo-x0)/dx,(hi-x0)/dx].sort((p,q)=>p-q);
  const doorGaps=(a,d,n)=>here.flatMap(q=>{const p=[a[0]+n[0]*.006,a[1]+n[1]*.006],[u0,v0]=q.local(...p),[u1,v1]=q.local(p[0]+d[0],p[1]+d[1]),U=q.w/2+(q.kind==='slider'?.02:.07),V=q.half+.03;
   const A=span(u0,u1-u0,-U,U),B=span(v0,v1-v0,q.c-V,q.c+V);if(!A||!B)return [];const lo=Math.max(A[0],B[0]),hi=Math.min(A[1],B[1]);return hi>lo?[[lo,hi]]:[];});
  // Skirting: 80 × 12 mm, back on the wall face, along every dry indoor wall face except door reveals and window jambs.
  const runs=[];
  for(const ring of walls.wallPolygons)for(let k=0;k<ring.length;k++){
   const a=ring[k],b=ring[(k+1)%ring.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<.005)continue;
   const d=[(b[0]-a[0])/L,(b[1]-a[1])/L];let n=[-d[1],d[0]];const mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;if(enclosed(walls,mx+n[0]*.002,mz+n[1]*.002)&&!enclosed(walls,mx-n[0]*.002,mz-n[1]*.002))n=[-n[0],-n[1]];
   const steps=Math.max(1,Math.ceil(L/.05)),gaps=doorGaps(a,d,n);let start=null;
   const emit=(s0,s1)=>{let pieces=[[s0,s1]];for(const [g0,g1] of gaps)pieces=pieces.flatMap(([p0,p1])=>g1<=p0||g0>=p1?[[p0,p1]]:[[p0,Math.min(p1,g0)],[Math.max(p0,g1),p1]].filter(([x,y])=>y-x>.02));
    for(const [p0,p1] of pieces)runs.push([a[0]+d[0]*p0,a[1]+d[1]*p0,a[0]+d[0]*p1,a[1]+d[1]*p1,n]);};
   for(let s=0;s<=steps;s++){
    const t=(s+.5)/steps,qx=a[0]+d[0]*L*t,qz=a[1]+d[1]*L*t,ok=s<steps&&room(qx+n[0]*.03,qz+n[1]*.03)&&!jamb(qx+n[0]*.006,qz+n[1]*.006,d);
    if(ok&&start===null)start=s;if(!ok&&start!==null){emit(L*start/steps,L*s/steps);start=null;}
   }
  }
  // Under windows with a sill wall (and no seat) the skirting runs along the wall below the sill too.
  for(const q of winHere)if(q.sill&&room(q.mid[0]+q.n[0]*.11,q.mid[1]+q.n[1]*.11))runs.push([...q.a.map((v,j)=>v+q.n[j]*.08),...q.b.map((v,j)=>v+q.n[j]*.08),q.n]);
  // One mesh per unit (see detailMaterials()); the last bin collects what lies outside the four units.
  const unitOf=(x,z)=>{const i=units.findIndex(b=>inBox(x,z,b));return i<0?units.length:i;},bins={},add=(x,z,g,hex)=>(bins[unitOf(x,z)]??=[]).push(tint(g,hex));
  for(const [x0,z0,x1,z1,n] of runs){const L=Math.hypot(x1-x0,z1-z0),dx=(x1-x0)/L,dz=(z1-z0)/L;add((x0+x1)/2+n[0]*.03,(z0+z1)/2+n[1]*.03,skirtingGeo([x0-dx*.012,z0-dz*.012],[x1+dx*.012,z1+dz*.012],n),FRAME);}
  for(const d of here){
   // Threshold: across the reveal and frame, 16 mm, clear of the leaf (raised 20 mm in doorway()).
   const [x0,z0,x1,z1]=d.box(-d.w/2-(d.kind==='slider'?.04:.05),d.c-d.half-.01,d.w/2+(d.kind==='slider'?.04:.05),d.c+d.half+.01);add(...d.world(0,d.c),boxGeo(x0,0,z0,x1,.016,z1),STONE);
   if(d.kind==='slider')continue;
   // Floor stop where the leaf stands at 90°, just outside the passage line; dropped if it would sit in a wall, behind one, or in another doorway's way.
   const [sx,sz]=d.world(-d.w/2-.03,-d.swing*(d.w-.07)),from=d.world(-d.w/2+.05,-d.swing*(d.half+.02)),clear=[...Array(11)].every((_,i)=>!solid(walls,from[0]+(sx-from[0])*i/10,from[1]+(sz-from[1])*i/10));
   if(clear&&!here.some(q=>q!==d&&(q.passage(sx,sz)||q.zone(sx,sz)))){add(...d.world(0,d.c),stopGeo(sx,sz),STONE);out.doors.push({set:id,x:d.x,z:d.z,mirrored:!!d.mirrored,stop:[sx,sz]});}
  }
  // Window sills: 18 mm stone on the sill wall, 25 mm proud into the room, 20 mm ears; not on seats or walls the CAD keeps solid.
  for(const q of winHere)if(q.sill){const e=[q.dir[0]*.02,q.dir[1]*.02];add(q.mid[0]+q.n[0]*.3,q.mid[1]+q.n[1]*.3,stripGeo([q.a[0]-e[0],q.a[1]-e[1]],[q.b[0]+e[0],q.b[1]+e[1]],q.n,-.08,.105,q.bottom,q.bottom+.018),STONE);}
  for(const [i,list] of Object.entries(bins)){const s=mesh(merge(list),D.unit(i));s.name='skirting-stone';groups[id].add(s);}
  out.skirting[id]=runs.map(([x0,z0,x1,z1,n])=>({a:[x0,z0],b:[x1,z1],n}));
 }
 // Ceiling: emissive only, no light sources (lighting belongs to the light pass).
 const [c0,c1,c2,c3]=COVE,w=.03,glow=[...DOWNLIGHTS.map(([x,z])=>downlightGeo(x,z))];
 for(const [x0,z0,x1,z1] of [[c0,c1-w/2,c2,c1+w/2],[c0,c3-w/2,c2,c3+w/2],[c0-w/2,c1,c0+w/2,c3],[c2-w/2,c1,c2+w/2,c3]]){const g=new THREE.PlaneGeometry(x1-x0,z1-z0);g.rotateX(Math.PI/2);g.translate((x0+x1)/2,2.777,(z0+z1)/2);glow.push(g);}
 const lights=mesh(merge(glow),D.glow,{receive:false});lights.name='downlights';roof.add(lights);
 // Curtains: owner's unit only (added after the right-hand B unit was cloned); one mesh per stack, batchStatic() merges them.
 const drape=(list,parent)=>{for(const [a,b,y0,y1] of list){const q=mesh(curtainGeo(a,b,y0,y1),D.curtain,{cast:true});q.name='curtain';parent.add(q);}};
 drape(CURTAINS.all.filter((q,i)=>i!==2&&i!==3),owner);for(const [id,g] of Object.entries(layouts))drape(id==='original'?[[[6.45,11.39],[6.15,11.39],.02,2.77],[[6.15,11.39],[5.85,11.39],.02,2.77]]:[CURTAINS.all[2],CURTAINS.all[3]],g);for(const id of ['balanced','family','central'])if(layouts[id])drape(CURTAINS.northWest,layouts[id]);
 // Switches and sockets: one InstancedMesh per layout fit-out (only the active one is visible). Call after batchStatic(), which would flatten instances.
 out.fixtures=()=>{const geo=fixtureGeo(),R={x:Math.PI/2,'-x':-Math.PI/2,z:0,'-z':Math.PI},m=new THREE.Matrix4(),q=new THREE.Quaternion(),one=new THREE.Vector3(1,1,1);
  for(const [id,list] of Object.entries(FIXTURES)){if(!layouts[id])continue;const im=new THREE.InstancedMesh(geo,D.fixture,list.length);im.name='switches-sockets';im.receiveShadow=true;
   list.forEach(([x,y,z,f],i)=>im.setMatrixAt(i,m.compose(new THREE.Vector3(x,y,z),q.setFromAxisAngle(new THREE.Vector3(0,1,0),R[f]),one)));im.computeBoundingSphere();layouts[id].add(im);}};
 out.materials=D;return out;
}
