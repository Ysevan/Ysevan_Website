import * as THREE from 'three';
// Metric UVs: 1 UV unit = 1 m on every face, so a texture's repeat alone sets its real size (tex() in app.js).
// box(): each face takes metres along its two tangent axes; texture v (the wood grain) runs along the face's
// longer side. RoundedBoxGeometry's rounding is unrolled about each face normal by the length of its facets: a vertex
// whose normal is θ off the face normal sits at the summed chords of the facets before it (knots at tan θ = j/segments,
// RoundedBoxGeometry's own), plus the chord from the last knot, 2% shorter on the corner diagonal. Exact on the edge strips
// for any segment count (one segment: Lambert azimuthal equal-area, 2r·sin(θ/2)); the eight doubly curved corner patches
// stay within 0.93–1.09 (one segment) and 0.91–1.12 (two).
// Faces are found by vertex order (px,nx,py,ny,pz,nz, equal counts), which BoxGeometry and RoundedBoxGeometry share.
const TANGENTS=[[2,1],[0,2],[0,1]];
function unroll(r,S){const knot=[...Array(S+1)].map((_,j)=>Math.atan(j/S)),C=[0];for(let j=0;j<S;j++)C.push(C[j]+2*r*Math.sin((knot[j+1]-knot[j])/2));
 return th=>{const j=Math.min(S-1,Math.floor(S*Math.tan(th)+1e-9));return C[j]+2*r*Math.sin((th-knot[j])/2);};}
export function metricBoxUV(g){
 const {width,height,depth,radius:r=0,segments:S=1}=g.parameters,half=[width/2,height/2,depth/2],size=[width,height,depth],rho=r?unroll(r,S):null;
 const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv,per=p.count/6;
 for(let i=0;i<p.count;i++){
  const k=Math.floor(i/per)>>1,[a,b]=TANGENTS[k];let s=p.getComponent(i,a),t=p.getComponent(i,b);
  const na=n.getComponent(i,a),nb=n.getComponent(i,b),side=Math.hypot(na,nb);
  if(r&&side>1e-6){const d=rho(Math.acos(Math.min(1,Math.abs(n.getComponent(i,k)))))*(1-.04*Math.abs(na*nb)/(side*side))/side,ca=half[a]-r,cb=half[b]-r;s=Math.max(-ca,Math.min(ca,s))+na*d;t=Math.max(-cb,Math.min(cb,t))+nb*d;}
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
