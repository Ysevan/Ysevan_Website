import * as THREE from 'three';
// Metric UVs: 1 UV unit = 1 m on every face, so a texture's repeat alone sets its real size (tex() in app.js).
// box(): each face takes metres along its two tangent axes; texture v (the wood grain) runs along the face's
// longer side. RoundedBoxGeometry's rounding is unrolled about each face normal by chord length (Lambert azimuthal
// equal-area): exact on the edge strips, within ~10% on the eight doubly curved corner patches.
// Faces are found by vertex order (px,nx,py,ny,pz,nz, equal counts), which BoxGeometry and RoundedBoxGeometry share.
const TANGENTS=[[2,1],[0,2],[0,1]];
export function metricBoxUV(g){
 const {width,height,depth,radius:r=0}=g.parameters,half=[width/2,height/2,depth/2],size=[width,height,depth];
 const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv,per=p.count/6;
 for(let i=0;i<p.count;i++){
  const k=Math.floor(i/per)>>1,[a,b]=TANGENTS[k];let s=p.getComponent(i,a),t=p.getComponent(i,b);
  const na=n.getComponent(i,a),nb=n.getComponent(i,b),side=Math.hypot(na,nb);
  if(r&&side>1e-6){const rho=2*r*Math.sin(Math.acos(Math.min(1,Math.abs(n.getComponent(i,k))))/2)/side,ca=half[a]-r,cb=half[b]-r;s=Math.max(-ca,Math.min(ca,s))+na*rho;t=Math.max(-cb,Math.min(cb,t))+nb*rho;}
  if(size[a]>size[b])uv.setXY(i,t,s);else uv.setXY(i,s,t);
 }
 uv.needsUpdate=true;return g;
}
// slab() ExtrudeGeometry, before its rotateX(-PI/2): shape (x,y) is world (x,-z), depth is world height.
// Tops and bottoms take world (x,z); each side wall takes (distance along its wall edge, height).
export const WALL_UV={
 generateTopUV(g,v,a,b,c){return [a,b,c].map(i=>new THREE.Vector2(v[i*3],-v[i*3+1]));},
 generateSideWallUV(g,v,a,b,c,d){let dx=v[b*3]-v[a*3],dy=v[b*3+1]-v[a*3+1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;return [a,b,c,d].map(i=>new THREE.Vector2(v[i*3]*dx+v[i*3+1]*dy,v[i*3+2]));}
};
