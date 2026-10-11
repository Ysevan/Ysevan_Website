import{t as e}from"./frame-pacer-C2fpi5-G.js";var t=10,n=708.08,r=170,i=800,a=1.7*Math.sqrt(5.8),o=7e3,s=600,c=280,ee=48,l=6e5,u=13e5,d=.12,f=56,p=1.4,te=24,m=`
attribute vec2 aCorner;
attribute vec4 aPose;
attribute vec4 aRect;
attribute float aAlpha;
attribute float aSolid;
uniform vec2 uView;
uniform vec2 uAtlas;
varying vec2 vUv;
varying float vAlpha;
varying float vSolid;
void main() {
  vec2 p = aCorner * abs(aRect.zw) * aPose.w;
  float c = cos(aPose.z), s = sin(aPose.z);
  p = vec2(c * p.x - s * p.y, s * p.x + c * p.y) + aPose.xy;
  gl_Position = vec4(p.x / uView.x * 2.0 - 1.0, 1.0 - p.y / uView.y * 2.0, 0.0, 1.0);
  vUv = (aRect.xy + (aCorner + 0.5) * aRect.zw) / uAtlas;
  vAlpha = aAlpha;
  vSolid = aSolid;
}
`,ne=`
precision mediump float;
uniform sampler2D uHallFloatAtlas;
uniform float uNight;
uniform vec3 uEdge;
varying vec2 vUv;
varying float vAlpha;
varying float vSolid;
void main() {
  vec4 t = texture2D(uHallFloatAtlas, vUv);
  vec2 q = gl_FragCoord.xy;
  float e = smoothstep(0.0, uEdge.x, q.x) * smoothstep(0.0, uEdge.x, uEdge.y - q.x)
          * smoothstep(0.0, uEdge.x, q.y) * smoothstep(0.0, uEdge.x, uEdge.z - q.y);
  if (uNight > 0.0) {
    vec4 n;
    if (vSolid > 0.5) {
      n = vec4(t.rgb * 0.85, t.a);
    } else {
      float ink = 1.0 - smoothstep(0.12, 0.28, dot(t.rgb / max(t.a, 0.001), vec3(0.3, 0.59, 0.11)));
      vec3 d = t.rgb + (1.0 - t.a) * (1.0 - ink) * vec3(0.869, 0.861, 0.843);
      float l = dot(d, vec3(0.3, 0.59, 0.11));
      d = clamp(vec3(l) + (d - vec3(l)) * (1.0 + 0.5 * smoothstep(0.2, 0.45, l)), 0.0, 1.0);
      float cover = 1.0 - pow(1.0 - t.a, 4.0);
      n = vec4(d * cover, cover);
    }
    t = mix(t, n, uNight);
  }
  gl_FragColor = t * (vAlpha * e);
}
`;function h(e,t,n){let r=e.createShader(t);return r?(e.shaderSource(r,n),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:null):null}function g(e,t,n,r,i){return e<-1?n+(e+1)*(n-t):e>1?r+(e-1)*(i-r):(n+r)/2+e*(r-n)/2}function re(e,t,n,r,i,a){let o=Math.abs(t)<=1&&Math.abs(e)>1?(t<0?-1:1)*(1+.6*(Math.abs(e)-1)):t,s=i/2+e*(i/2-f)/2,c=g(o,0,n,r,a);return[Math.min(Math.max(s,f),i-f),Math.min(Math.max(c,f),a-f)]}function _({hall:f,card:_,canvas:v,gl:y,soft:b,atlas:ie,painting:x,onFail:S,paused:C,watch:w,drive:ae,phone:oe}){let{atlasPieces:se,atlasSize:ce,solidPieces:le}=x,T=b?x.layout.filter((e,t)=>t%2==0):x.layout,E=T.length,D=typeof WebGL2RenderingContext<`u`&&y instanceof WebGL2RenderingContext,O=D?null:y.getExtension(`ANGLE_instanced_arrays`),ue=()=>(y.getExtension(`WEBGL_lose_context`)?.loseContext(),S(),()=>{}),de=h(y,y.VERTEX_SHADER,m),fe=h(y,y.FRAGMENT_SHADER,ne),k=y.createProgram();if(!de||!fe||!k||!D&&!O||(y.attachShader(k,de),y.attachShader(k,fe),y.linkProgram(k),!y.getProgramParameter(k,y.LINK_STATUS)))return ue();y.useProgram(k);let pe=y.createBuffer();y.bindBuffer(y.ARRAY_BUFFER,pe),y.bufferData(y.ARRAY_BUFFER,new Float32Array([-.5,-.5,.5,-.5,-.5,.5,.5,.5]),y.STATIC_DRAW);let me=y.getAttribLocation(k,`aCorner`);y.enableVertexAttribArray(me),y.vertexAttribPointer(me,2,y.FLOAT,!1,0,0);let A=new Float32Array(E*t),j=y.createBuffer();y.bindBuffer(y.ARRAY_BUFFER,j),y.bufferData(y.ARRAY_BUFFER,A.byteLength,y.DYNAMIC_DRAW);let he=e=>{D?y.vertexAttribDivisor(e,1):O?.vertexAttribDivisorANGLE(e,1)},ge=0;for(let[e,t]of[[`aPose`,4],[`aRect`,4],[`aAlpha`,1],[`aSolid`,1]]){let n=y.getAttribLocation(k,e);y.enableVertexAttribArray(n),y.vertexAttribPointer(n,t,y.FLOAT,!1,40,ge*4),he(n),ge+=t}let _e=y.createTexture();y.activeTexture(y.TEXTURE0),y.bindTexture(y.TEXTURE_2D,_e),y.pixelStorei(y.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!0),y.texImage2D(y.TEXTURE_2D,0,y.RGBA,y.RGBA,y.UNSIGNED_BYTE,ie),y.generateMipmap(y.TEXTURE_2D),y.texParameteri(y.TEXTURE_2D,y.TEXTURE_MIN_FILTER,y.LINEAR_MIPMAP_LINEAR),y.texParameteri(y.TEXTURE_2D,y.TEXTURE_MAG_FILTER,y.LINEAR),y.texParameteri(y.TEXTURE_2D,y.TEXTURE_WRAP_S,y.CLAMP_TO_EDGE),y.texParameteri(y.TEXTURE_2D,y.TEXTURE_WRAP_T,y.CLAMP_TO_EDGE),y.uniform1i(y.getUniformLocation(k,`uHallFloatAtlas`),0),y.uniform2f(y.getUniformLocation(k,`uAtlas`),ce[0],ce[1]);let ve=y.getUniformLocation(k,`uView`),ye=y.getUniformLocation(k,`uNight`),be=y.getUniformLocation(k,`uEdge`);y.enable(y.BLEND),y.blendFunc(y.ONE,y.ONE_MINUS_SRC_ALPHA),y.clearColor(0,0,0,0);let xe=T.map((e,t)=>t).sort((e,t)=>T[t][3]-T[e][3]),M=new Float32Array(E),N=new Float32Array(E),P=new Float32Array(E),Se=new Float32Array(E),F=new Float32Array(E),I=new Float32Array(E),Ce=T.map((e,t)=>t*2.399),we=new Float32Array(E);xe.forEach((e,n)=>{let[r,,,i,,,a]=T[e],[o,s,c,ee]=se[r],l=n*t;A[l+4]=a?o+c:o,A[l+5]=s,A[l+6]=a?-c:c,A[l+7]=ee,we[n]=1-.55*i,A[l+8]=we[n],A[l+9]=+!!le.includes(r)});let L=1,R=1,z=1,B=1,V=ae===`wake`,H=V,U=()=>{let e=-window.scrollX;for(let t=f;t;t=t.offsetParent)e+=t.offsetLeft;L=document.documentElement.clientWidth||f.clientWidth,R=f.clientHeight;let t=oe?.()??!1;H=V||t,z=b?Math.min(window.devicePixelRatio||1,1.5,Math.sqrt(l/(L*R||1))):H?Math.min(window.devicePixelRatio||1,2,Math.sqrt(u/(L*R||1))):Math.min(window.devicePixelRatio||1,2),v.style.left=`${-e}px`,v.style.width=`${L}px`,v.style.height=`${R}px`,v.width=Math.max(1,Math.round(L*z)),v.height=Math.max(1,Math.round(R*z)),y.viewport(0,0,v.width,v.height),B=Math.max(_.offsetWidth,1)/n*(t?p:1);let r=_.offsetLeft+e,i=_.offsetTop,a=r+_.offsetWidth,o=i+_.offsetHeight;T.forEach(([,e,n],s)=>{if(t){[M[s],N[s]]=re(e,n,i,o,L,R);return}M[s]=g(e,0,r,a,L),N[s]=g(n,0,i,o,R)}),Q()},W=window.matchMedia(`(prefers-color-scheme: dark)`),Te=()=>{let e=document.documentElement.classList;return e.contains(`dark`)?!0:!e.contains(`light`)&&W.matches},Ee=0,De=0,G=!1,K=performance.now(),q=1,Oe=0,J=+!!Te(),Y=0,X=0,Z=e(),ke=0,Ae=0,je=!0,Me=!1,Ne=!1,Pe=C??(()=>{let e=document.documentElement.getAttribute(`data-hall-walk`);return e===`away`||e===`live`}),Fe=e=>{if(Y=0,Ne)return;if(Pe()){X=0,Z.reset();return}if((b||H)&&!Z.ready(e)){Y=requestAnimationFrame(Fe);return}let n=X?Math.min(e-X,50)/1e3:1/60;X=e;let l=+(e-K<o);q+=(l-q)*(1-Math.exp(-n*1e3/s)),q<.01&&l===0&&(q=0),Oe+=n*q;let u=+!!Te();J+=(u-J)*(1-Math.exp(-n*1e3/c)),Math.abs(u-J)<.002&&(J=u);let p=Number.parseFloat(f.style.getPropertyValue(`--hall-tilt-x`))||0,m=Number.parseFloat(f.style.getPropertyValue(`--hall-tilt-y`))||0,ne=V?Math.min(Math.max(window.scrollY,0),R)*d:0,h=H?document.querySelector(`header`):null,g=h?h.getBoundingClientRect().bottom-v.getBoundingClientRect().top:-1/0,re=q>0||J!==u||p!==ke||m!==Ae;ke=p,Ae=m,xe.forEach((e,o)=>{let[,,,s,c,ee]=T[e],l=1-s,u=1-.4*s,d=Ce[e],f=Oe*u,h=B*(6+6*l)*(Math.sin(f*.48+d)+.4*Math.sin(f*.79+2*d)),_=B*(4+4*l)*Math.sin(f*.57+1.7*d),v=.07*Math.sin(f*.67+d),y=B*p*(-5+17*s),b=B*m*(-3+10*s),ie=M[e]+h+y+P[e],x=N[e]+_+b+Se[e]+ne*s,S=-5.8*P[e]-a*F[e],C=-5.8*Se[e]-a*I[e];if(G){let e=ie-Ee,t=x-De,n=Math.hypot(e,t),a=r*B;if(n<a&&n>.001){let r=1-n/a,o=i*B*(1-.5*s)*r*r;S+=e/n*o,C+=t/n*o}}F[e]+=S*n,I[e]+=C*n,P[e]+=F[e]*n,Se[e]+=I[e]*n,(Math.abs(F[e])+Math.abs(I[e])>.03||Math.abs(S)+Math.abs(C)>.3)&&(re=!0);let w=o*t;A[w]=ie,A[w+1]=x,A[w+2]=ee*Math.PI/180+v+P[e]/B*.004;let ae=c*(1-.5*s)*B;A[w+3]=ae;let oe=x-.5*Math.hypot(A[w+6],A[w+7])*ae;A[w+8]=we[o]*Math.min(Math.max((oe-g)/te,0),1)}),y.clear(y.COLOR_BUFFER_BIT),y.uniform2f(ve,L,R),y.uniform3f(be,ee*z,v.width,v.height),y.uniform1f(ye,J),y.bindBuffer(y.ARRAY_BUFFER,j),y.bufferSubData(y.ARRAY_BUFFER,0,A),D?y.drawArraysInstanced(y.TRIANGLE_STRIP,0,4,E):O?.drawArraysInstancedANGLE(y.TRIANGLE_STRIP,0,4,E),Me||(Me=!0,v.style.opacity=`1`),re&&je&&!document.hidden?Y=requestAnimationFrame(Fe):(X=0,Z.reset())};function Q(){!Y&&!Ne&&je&&!document.hidden&&!Pe()&&(Y=requestAnimationFrame(Fe))}let Ie=e=>{if(e.pointerType!==`mouse`)return;let t=v.getBoundingClientRect();Ee=e.clientX-t.left,De=e.clientY-t.top,G=!0,K=performance.now(),Q()},Le=()=>{K=performance.now(),Q()},Re=V?[`scroll`,`pointerdown`,`touchstart`]:[],ze=()=>{H&&!V&&Q()},$=()=>{G=!1,Q()},Be=e=>{e.preventDefault(),S()},Ve=new ResizeObserver(U),He=new IntersectionObserver(([e])=>{je=e?.isIntersecting??!0,Q()}),Ue=new MutationObserver(Q);v.setAttribute(`aria-hidden`,`true`),v.setAttribute(`data-hall-float`,``),Object.assign(v.style,{position:`absolute`,top:`0`,zIndex:`0`,pointerEvents:`none`,opacity:`0`,transition:`opacity 1.2s ease`}),f.insertBefore(v,f.firstChild),window.addEventListener(`pointermove`,Ie,{passive:!0});for(let e of Re)window.addEventListener(e,Le,{passive:!0});return window.addEventListener(`scroll`,ze,{passive:!0}),window.addEventListener(`blur`,$),document.documentElement.addEventListener(`pointerleave`,$),document.addEventListener(`visibilitychange`,Q),W.addEventListener(`change`,Q),window.addEventListener(`resize`,U),v.addEventListener(`webglcontextlost`,Be),Ve.observe(f),Ve.observe(_),He.observe(f),Ue.observe(document.documentElement,{attributes:!0,attributeFilter:[`class`,`data-hall-walk`]}),w&&Ue.observe(w,{attributes:!0,attributeFilter:[`style`]}),U(),()=>{Ne=!0,Y&&cancelAnimationFrame(Y),window.removeEventListener(`pointermove`,Ie);for(let e of Re)window.removeEventListener(e,Le);window.removeEventListener(`scroll`,ze),window.removeEventListener(`blur`,$),document.documentElement.removeEventListener(`pointerleave`,$),document.removeEventListener(`visibilitychange`,Q),W.removeEventListener(`change`,Q),window.removeEventListener(`resize`,U),v.removeEventListener(`webglcontextlost`,Be),Ve.disconnect(),He.disconnect(),Ue.disconnect(),y.deleteBuffer(pe),y.deleteBuffer(j),y.deleteTexture(_e),y.deleteProgram(k),y.deleteShader(de),y.deleteShader(fe),y.getExtension(`WEBGL_lose_context`)?.loseContext(),v.remove()}}export{_ as mountHallFloat};