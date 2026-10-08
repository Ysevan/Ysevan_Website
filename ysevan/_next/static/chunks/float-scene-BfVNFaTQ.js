var e=1.7*Math.sqrt(5.8),t=7e3,n=600,r=280,i=48,a=6e5,o=29,s=`
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
`,c=`
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
`;function l(e,t,n){let r=e.createShader(t);return r?(e.shaderSource(r,n),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:null):null}function u(e,t,n,r,i){return e<-1?n+(e+1)*(n-t):e>1?r+(e-1)*(i-r):(n+r)/2+e*(r-n)/2}function d({hall:d,card:f,canvas:p,gl:m,soft:h,atlas:g,painting:_,onFail:v,paused:y,watch:b}){let{atlasPieces:x,atlasSize:S,solidPieces:C}=_,w=h?_.layout.filter((e,t)=>t%2==0):_.layout,T=w.length,E=typeof WebGL2RenderingContext<`u`&&m instanceof WebGL2RenderingContext,D=E?null:m.getExtension(`ANGLE_instanced_arrays`),ee=()=>(m.getExtension(`WEBGL_lose_context`)?.loseContext(),v(),()=>{}),O=l(m,m.VERTEX_SHADER,s),k=l(m,m.FRAGMENT_SHADER,c),A=m.createProgram();if(!O||!k||!A||!E&&!D||(m.attachShader(A,O),m.attachShader(A,k),m.linkProgram(A),!m.getProgramParameter(A,m.LINK_STATUS)))return ee();m.useProgram(A);let te=m.createBuffer();m.bindBuffer(m.ARRAY_BUFFER,te),m.bufferData(m.ARRAY_BUFFER,new Float32Array([-.5,-.5,.5,-.5,-.5,.5,.5,.5]),m.STATIC_DRAW);let ne=m.getAttribLocation(A,`aCorner`);m.enableVertexAttribArray(ne),m.vertexAttribPointer(ne,2,m.FLOAT,!1,0,0);let j=new Float32Array(T*10),M=m.createBuffer();m.bindBuffer(m.ARRAY_BUFFER,M),m.bufferData(m.ARRAY_BUFFER,j.byteLength,m.DYNAMIC_DRAW);let re=e=>{E?m.vertexAttribDivisor(e,1):D?.vertexAttribDivisorANGLE(e,1)},ie=0;for(let[e,t]of[[`aPose`,4],[`aRect`,4],[`aAlpha`,1],[`aSolid`,1]]){let n=m.getAttribLocation(A,e);m.enableVertexAttribArray(n),m.vertexAttribPointer(n,t,m.FLOAT,!1,40,ie*4),re(n),ie+=t}let ae=m.createTexture();m.activeTexture(m.TEXTURE0),m.bindTexture(m.TEXTURE_2D,ae),m.pixelStorei(m.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!0),m.texImage2D(m.TEXTURE_2D,0,m.RGBA,m.RGBA,m.UNSIGNED_BYTE,g),m.generateMipmap(m.TEXTURE_2D),m.texParameteri(m.TEXTURE_2D,m.TEXTURE_MIN_FILTER,m.LINEAR_MIPMAP_LINEAR),m.texParameteri(m.TEXTURE_2D,m.TEXTURE_MAG_FILTER,m.LINEAR),m.texParameteri(m.TEXTURE_2D,m.TEXTURE_WRAP_S,m.CLAMP_TO_EDGE),m.texParameteri(m.TEXTURE_2D,m.TEXTURE_WRAP_T,m.CLAMP_TO_EDGE),m.uniform1i(m.getUniformLocation(A,`uHallFloatAtlas`),0),m.uniform2f(m.getUniformLocation(A,`uAtlas`),S[0],S[1]);let oe=m.getUniformLocation(A,`uView`),se=m.getUniformLocation(A,`uNight`),ce=m.getUniformLocation(A,`uEdge`);m.enable(m.BLEND),m.blendFunc(m.ONE,m.ONE_MINUS_SRC_ALPHA),m.clearColor(0,0,0,0);let le=w.map((e,t)=>t).sort((e,t)=>w[t][3]-w[e][3]),ue=new Float32Array(T),de=new Float32Array(T),N=new Float32Array(T),P=new Float32Array(T),F=new Float32Array(T),I=new Float32Array(T),fe=w.map((e,t)=>t*2.399);le.forEach((e,t)=>{let[n,,,r,,,i]=w[e],[a,o,s,c]=x[n],l=t*10;j[l+4]=i?a+s:a,j[l+5]=o,j[l+6]=i?-s:s,j[l+7]=c,j[l+8]=1-.55*r,j[l+9]=+!!C.includes(n)});let L=1,R=1,z=1,B=1,V=()=>{let e=-window.scrollX;for(let t=d;t;t=t.offsetParent)e+=t.offsetLeft;L=document.documentElement.clientWidth||d.clientWidth,R=d.clientHeight,z=h?Math.min(window.devicePixelRatio||1,1.5,Math.sqrt(a/(L*R||1))):Math.min(window.devicePixelRatio||1,2),p.style.left=`${-e}px`,p.style.width=`${L}px`,p.style.height=`${R}px`,p.width=Math.max(1,Math.round(L*z)),p.height=Math.max(1,Math.round(R*z)),m.viewport(0,0,p.width,p.height),B=Math.max(f.offsetWidth,1)/708.08;let t=f.offsetLeft+e,n=f.offsetTop,r=t+f.offsetWidth,i=n+f.offsetHeight;w.forEach(([,e,a],o)=>{ue[o]=u(e,0,t,r,L),de[o]=u(a,0,n,i,R)}),Z()},H=window.matchMedia(`(prefers-color-scheme: dark)`),pe=()=>{let e=document.documentElement.classList;return e.contains(`dark`)?!0:!e.contains(`light`)&&H.matches},me=0,he=0,U=!1,ge=performance.now(),W=1,_e=0,G=+!!pe(),K=0,q=0,ve=0,ye=0,J=!0,be=!1,Y=!1,xe=y??(()=>{let e=document.documentElement.getAttribute(`data-hall-walk`);return e===`away`||e===`live`}),X=a=>{if(K=0,Y)return;if(xe()){q=0;return}if(h&&q&&a-q<o){K=requestAnimationFrame(X);return}let s=q?Math.min(a-q,50)/1e3:1/60;q=a;let c=+(a-ge<t);W+=(c-W)*(1-Math.exp(-s*1e3/n)),W<.01&&c===0&&(W=0),_e+=s*W;let l=+!!pe();G+=(l-G)*(1-Math.exp(-s*1e3/r)),Math.abs(l-G)<.002&&(G=l);let u=Number.parseFloat(d.style.getPropertyValue(`--hall-tilt-x`))||0,f=Number.parseFloat(d.style.getPropertyValue(`--hall-tilt-y`))||0,g=W>0||G!==l||u!==ve||f!==ye;ve=u,ye=f,le.forEach((t,n)=>{let[,,,r,i,a]=w[t],o=1-r,c=1-.4*r,l=fe[t],d=_e*c,p=B*(6+6*o)*(Math.sin(d*.48+l)+.4*Math.sin(d*.79+2*l)),m=B*(4+4*o)*Math.sin(d*.57+1.7*l),h=.07*Math.sin(d*.67+l),_=B*u*(-5+17*r),v=B*f*(-3+10*r),y=ue[t]+p+_+N[t],b=de[t]+m+v+P[t],x=-5.8*N[t]-e*F[t],S=-5.8*P[t]-e*I[t];if(U){let e=y-me,t=b-he,n=Math.hypot(e,t),i=170*B;if(n<i&&n>.001){let a=1-n/i,o=800*B*(1-.5*r)*a*a;x+=e/n*o,S+=t/n*o}}F[t]+=x*s,I[t]+=S*s,N[t]+=F[t]*s,P[t]+=I[t]*s,(Math.abs(F[t])+Math.abs(I[t])>.03||Math.abs(x)+Math.abs(S)>.3)&&(g=!0);let C=n*10;j[C]=y,j[C+1]=b,j[C+2]=a*Math.PI/180+h+N[t]/B*.004,j[C+3]=i*(1-.5*r)*B}),m.clear(m.COLOR_BUFFER_BIT),m.uniform2f(oe,L,R),m.uniform3f(ce,i*z,p.width,p.height),m.uniform1f(se,G),m.bindBuffer(m.ARRAY_BUFFER,M),m.bufferSubData(m.ARRAY_BUFFER,0,j),E?m.drawArraysInstanced(m.TRIANGLE_STRIP,0,4,T):D?.drawArraysInstancedANGLE(m.TRIANGLE_STRIP,0,4,T),be||(be=!0,p.style.opacity=`1`),g&&J&&!document.hidden?K=requestAnimationFrame(X):q=0};function Z(){!K&&!Y&&J&&!document.hidden&&!xe()&&(K=requestAnimationFrame(X))}let Se=e=>{if(e.pointerType!==`mouse`)return;let t=p.getBoundingClientRect();me=e.clientX-t.left,he=e.clientY-t.top,U=!0,ge=performance.now(),Z()},Q=()=>{U=!1,Z()},Ce=e=>{e.preventDefault(),v()},we=new ResizeObserver(V),Te=new IntersectionObserver(([e])=>{J=e?.isIntersecting??!0,Z()}),$=new MutationObserver(Z);return p.setAttribute(`aria-hidden`,`true`),p.setAttribute(`data-hall-float`,``),Object.assign(p.style,{position:`absolute`,top:`0`,zIndex:`0`,pointerEvents:`none`,opacity:`0`,transition:`opacity 1.2s ease`}),d.insertBefore(p,d.firstChild),window.addEventListener(`pointermove`,Se,{passive:!0}),window.addEventListener(`blur`,Q),document.documentElement.addEventListener(`pointerleave`,Q),document.addEventListener(`visibilitychange`,Z),H.addEventListener(`change`,Z),window.addEventListener(`resize`,V),p.addEventListener(`webglcontextlost`,Ce),we.observe(d),we.observe(f),Te.observe(d),$.observe(document.documentElement,{attributes:!0,attributeFilter:[`class`,`data-hall-walk`]}),b&&$.observe(b,{attributes:!0,attributeFilter:[`style`]}),V(),()=>{Y=!0,K&&cancelAnimationFrame(K),window.removeEventListener(`pointermove`,Se),window.removeEventListener(`blur`,Q),document.documentElement.removeEventListener(`pointerleave`,Q),document.removeEventListener(`visibilitychange`,Z),H.removeEventListener(`change`,Z),window.removeEventListener(`resize`,V),p.removeEventListener(`webglcontextlost`,Ce),we.disconnect(),Te.disconnect(),$.disconnect(),m.deleteBuffer(te),m.deleteBuffer(M),m.deleteTexture(ae),m.deleteProgram(A),m.deleteShader(O),m.deleteShader(k),m.getExtension(`WEBGL_lose_context`)?.loseContext(),p.remove()}}export{d as mountHallFloat};