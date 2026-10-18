export function pointIn(p,poly){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
function segDist(p,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dz);}
const bounds=p=>[Math.min(...p.map(q=>q[0])),Math.min(...p.map(q=>q[1])),Math.max(...p.map(q=>q[0])),Math.max(...p.map(q=>q[1]))];
export function createNavigator({data,windows=[],furniture=[],furnitureEnabled=()=>true,dynamicBoxes=()=>[]}){
 const grid=new Map(),cell=1.5;
 function add(item,b){for(let x=Math.floor((b[0]-.3)/cell);x<=Math.floor((b[2]+.3)/cell);x++)for(let z=Math.floor((b[1]-.3)/cell);z<=Math.floor((b[3]+.3)/cell);z++){const k=x+','+z;if(!grid.has(k))grid.set(k,[]);grid.get(k).push(item);}}
 data.wallPolygons.forEach((p,i)=>add({type:'wall',p,holes:data.wallHoles[i]||[]},bounds(p)));
 for(const p of [data.footprint,...data.floorHoles])for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];add({type:'edge',a,b},bounds([a,b]));}
 for(const s of windows){const a=s.slice(0,2),b=s.slice(2);add({type:'edge',a,b},bounds([a,b]));}
 for(const b of data.walkBlockers)add({type:'block',b},b);
 for(const b of furniture)add({type:'furniture',b},b);
 function inBox(x,z,b,r){return x>b[0]-r&&x<b[2]+r&&z>b[1]-r&&z<b[3]+r;}
 function ringNear(p,ring,r){for(let i=0;i<ring.length;i++)if(segDist(p,ring[i],ring[(i+1)%ring.length])<r)return true;return false;}
 return function canWalk(x,z,r=.16){const p=[x,z];if(!pointIn(p,data.footprint)||data.floorHoles.some(h=>pointIn(p,h)))return false;const furn=furnitureEnabled();
 for(const q of grid.get(Math.floor(x/cell)+','+Math.floor(z/cell))||[]){if(q.type==='wall'){if(pointIn(p,q.p)&&!q.holes.some(h=>pointIn(p,h)))return false;if(ringNear(p,q.p,r)||q.holes.some(h=>ringNear(p,h,r)))return false;}else if(q.type==='edge'){if(segDist(p,q.a,q.b)<r)return false;}else if((q.type!=='furniture'||furn)&&inBox(x,z,q.b,r))return false;}
 for(const b of dynamicBoxes(furn))if(inBox(x,z,b,r))return false;return true;};
}
