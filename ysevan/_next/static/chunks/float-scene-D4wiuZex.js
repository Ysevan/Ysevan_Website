import{t as e}from"./frame-pacer-C2fpi5-G.js";var t=10,n=708.08,r=170,i=800,a=1.7*Math.sqrt(5.8),o=7e3,s=600,c=280,l=48,u=6e5,d=`
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
`,f=`
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
`;function p(e,t,n){let r=e.createShader(t);return r?(e.shaderSource(r,n),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:null):null}function m(e,t,n,r,i){return e<-1?n+(e+1)*(n-t):e>1?r+(e-1)*(i-r):(n+r)/2+e*(r-n)/2}function h({hall:h,card:g,canvas:_,gl:v,soft:y,atlas:ee,painting:b,onFail:x,paused:S,watch:C}){let{atlasPieces:w,atlasSize:T,solidPieces:te}=b,E=y?b.layout.filter((e,t)=>t%2==0):b.layout,D=E.length,O=typeof WebGL2RenderingContext<`u`&&v instanceof WebGL2RenderingContext,k=O?null:v.getExtension(`ANGLE_instanced_arrays`),ne=()=>(v.getExtension(`WEBGL_lose_context`)?.loseContext(),x(),()=>{}),A=p(v,v.VERTEX_SHADER,d),j=p(v,v.FRAGMENT_SHADER,f),M=v.createProgram();if(!A||!j||!M||!O&&!k||(v.attachShader(M,A),v.attachShader(M,j),v.linkProgram(M),!v.getProgramParameter(M,v.LINK_STATUS)))return ne();v.useProgram(M);let re=v.createBuffer();v.bindBuffer(v.ARRAY_BUFFER,re),v.bufferData(v.ARRAY_BUFFER,new Float32Array([-.5,-.5,.5,-.5,-.5,.5,.5,.5]),v.STATIC_DRAW);let ie=v.getAttribLocation(M,`aCorner`);v.enableVertexAttribArray(ie),v.vertexAttribPointer(ie,2,v.FLOAT,!1,0,0);let N=new Float32Array(D*t),P=v.createBuffer();v.bindBuffer(v.ARRAY_BUFFER,P),v.bufferData(v.ARRAY_BUFFER,N.byteLength,v.DYNAMIC_DRAW);let ae=e=>{O?v.vertexAttribDivisor(e,1):k?.vertexAttribDivisorANGLE(e,1)},oe=0;for(let[e,t]of[[`aPose`,4],[`aRect`,4],[`aAlpha`,1],[`aSolid`,1]]){let n=v.getAttribLocation(M,e);v.enableVertexAttribArray(n),v.vertexAttribPointer(n,t,v.FLOAT,!1,40,oe*4),ae(n),oe+=t}let se=v.createTexture();v.activeTexture(v.TEXTURE0),v.bindTexture(v.TEXTURE_2D,se),v.pixelStorei(v.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!0),v.texImage2D(v.TEXTURE_2D,0,v.RGBA,v.RGBA,v.UNSIGNED_BYTE,ee),v.generateMipmap(v.TEXTURE_2D),v.texParameteri(v.TEXTURE_2D,v.TEXTURE_MIN_FILTER,v.LINEAR_MIPMAP_LINEAR),v.texParameteri(v.TEXTURE_2D,v.TEXTURE_MAG_FILTER,v.LINEAR),v.texParameteri(v.TEXTURE_2D,v.TEXTURE_WRAP_S,v.CLAMP_TO_EDGE),v.texParameteri(v.TEXTURE_2D,v.TEXTURE_WRAP_T,v.CLAMP_TO_EDGE),v.uniform1i(v.getUniformLocation(M,`uHallFloatAtlas`),0),v.uniform2f(v.getUniformLocation(M,`uAtlas`),T[0],T[1]);let ce=v.getUniformLocation(M,`uView`),le=v.getUniformLocation(M,`uNight`),ue=v.getUniformLocation(M,`uEdge`);v.enable(v.BLEND),v.blendFunc(v.ONE,v.ONE_MINUS_SRC_ALPHA),v.clearColor(0,0,0,0);let de=E.map((e,t)=>t).sort((e,t)=>E[t][3]-E[e][3]),fe=new Float32Array(D),pe=new Float32Array(D),F=new Float32Array(D),I=new Float32Array(D),L=new Float32Array(D),R=new Float32Array(D),me=E.map((e,t)=>t*2.399);de.forEach((e,n)=>{let[r,,,i,,,a]=E[e],[o,s,c,l]=w[r],u=n*t;N[u+4]=a?o+c:o,N[u+5]=s,N[u+6]=a?-c:c,N[u+7]=l,N[u+8]=1-.55*i,N[u+9]=+!!te.includes(r)});let z=1,B=1,V=1,H=1,U=()=>{let e=-window.scrollX;for(let t=h;t;t=t.offsetParent)e+=t.offsetLeft;z=document.documentElement.clientWidth||h.clientWidth,B=h.clientHeight,V=y?Math.min(window.devicePixelRatio||1,1.5,Math.sqrt(u/(z*B||1))):Math.min(window.devicePixelRatio||1,2),_.style.left=`${-e}px`,_.style.width=`${z}px`,_.style.height=`${B}px`,_.width=Math.max(1,Math.round(z*V)),_.height=Math.max(1,Math.round(B*V)),v.viewport(0,0,_.width,_.height),H=Math.max(g.offsetWidth,1)/n;let t=g.offsetLeft+e,r=g.offsetTop,i=t+g.offsetWidth,a=r+g.offsetHeight;E.forEach(([,e,n],o)=>{fe[o]=m(e,0,t,i,z),pe[o]=m(n,0,r,a,B)}),Z()},W=window.matchMedia(`(prefers-color-scheme: dark)`),he=()=>{let e=document.documentElement.classList;return e.contains(`dark`)?!0:!e.contains(`light`)&&W.matches},ge=0,_e=0,G=!1,ve=performance.now(),K=1,ye=0,q=+!!he(),J=0,Y=0,X=e(),be=0,xe=0,Se=!0,Ce=!1,we=!1,Te=S??(()=>{let e=document.documentElement.getAttribute(`data-hall-walk`);return e===`away`||e===`live`}),Ee=e=>{if(J=0,we)return;if(Te()){Y=0,X.reset();return}if(y&&!X.ready(e)){J=requestAnimationFrame(Ee);return}let n=Y?Math.min(e-Y,50)/1e3:1/60;Y=e;let u=+(e-ve<o);K+=(u-K)*(1-Math.exp(-n*1e3/s)),K<.01&&u===0&&(K=0),ye+=n*K;let d=+!!he();q+=(d-q)*(1-Math.exp(-n*1e3/c)),Math.abs(d-q)<.002&&(q=d);let f=Number.parseFloat(h.style.getPropertyValue(`--hall-tilt-x`))||0,p=Number.parseFloat(h.style.getPropertyValue(`--hall-tilt-y`))||0,m=K>0||q!==d||f!==be||p!==xe;be=f,xe=p,de.forEach((e,o)=>{let[,,,s,c,l]=E[e],u=1-s,d=1-.4*s,h=me[e],g=ye*d,_=H*(6+6*u)*(Math.sin(g*.48+h)+.4*Math.sin(g*.79+2*h)),v=H*(4+4*u)*Math.sin(g*.57+1.7*h),y=.07*Math.sin(g*.67+h),ee=H*f*(-5+17*s),b=H*p*(-3+10*s),x=fe[e]+_+ee+F[e],S=pe[e]+v+b+I[e],C=-5.8*F[e]-a*L[e],w=-5.8*I[e]-a*R[e];if(G){let e=x-ge,t=S-_e,n=Math.hypot(e,t),a=r*H;if(n<a&&n>.001){let r=1-n/a,o=i*H*(1-.5*s)*r*r;C+=e/n*o,w+=t/n*o}}L[e]+=C*n,R[e]+=w*n,F[e]+=L[e]*n,I[e]+=R[e]*n,(Math.abs(L[e])+Math.abs(R[e])>.03||Math.abs(C)+Math.abs(w)>.3)&&(m=!0);let T=o*t;N[T]=x,N[T+1]=S,N[T+2]=l*Math.PI/180+y+F[e]/H*.004,N[T+3]=c*(1-.5*s)*H}),v.clear(v.COLOR_BUFFER_BIT),v.uniform2f(ce,z,B),v.uniform3f(ue,l*V,_.width,_.height),v.uniform1f(le,q),v.bindBuffer(v.ARRAY_BUFFER,P),v.bufferSubData(v.ARRAY_BUFFER,0,N),O?v.drawArraysInstanced(v.TRIANGLE_STRIP,0,4,D):k?.drawArraysInstancedANGLE(v.TRIANGLE_STRIP,0,4,D),Ce||(Ce=!0,_.style.opacity=`1`),m&&Se&&!document.hidden?J=requestAnimationFrame(Ee):(Y=0,X.reset())};function Z(){!J&&!we&&Se&&!document.hidden&&!Te()&&(J=requestAnimationFrame(Ee))}let De=e=>{if(e.pointerType!==`mouse`)return;let t=_.getBoundingClientRect();ge=e.clientX-t.left,_e=e.clientY-t.top,G=!0,ve=performance.now(),Z()},Q=()=>{G=!1,Z()},Oe=e=>{e.preventDefault(),x()},ke=new ResizeObserver(U),Ae=new IntersectionObserver(([e])=>{Se=e?.isIntersecting??!0,Z()}),$=new MutationObserver(Z);return _.setAttribute(`aria-hidden`,`true`),_.setAttribute(`data-hall-float`,``),Object.assign(_.style,{position:`absolute`,top:`0`,zIndex:`0`,pointerEvents:`none`,opacity:`0`,transition:`opacity 1.2s ease`}),h.insertBefore(_,h.firstChild),window.addEventListener(`pointermove`,De,{passive:!0}),window.addEventListener(`blur`,Q),document.documentElement.addEventListener(`pointerleave`,Q),document.addEventListener(`visibilitychange`,Z),W.addEventListener(`change`,Z),window.addEventListener(`resize`,U),_.addEventListener(`webglcontextlost`,Oe),ke.observe(h),ke.observe(g),Ae.observe(h),$.observe(document.documentElement,{attributes:!0,attributeFilter:[`class`,`data-hall-walk`]}),C&&$.observe(C,{attributes:!0,attributeFilter:[`style`]}),U(),()=>{we=!0,J&&cancelAnimationFrame(J),window.removeEventListener(`pointermove`,De),window.removeEventListener(`blur`,Q),document.documentElement.removeEventListener(`pointerleave`,Q),document.removeEventListener(`visibilitychange`,Z),W.removeEventListener(`change`,Z),window.removeEventListener(`resize`,U),_.removeEventListener(`webglcontextlost`,Oe),ke.disconnect(),Ae.disconnect(),$.disconnect(),v.deleteBuffer(re),v.deleteBuffer(P),v.deleteTexture(se),v.deleteProgram(M),v.deleteShader(A),v.deleteShader(j),v.getExtension(`WEBGL_lose_context`)?.loseContext(),_.remove()}}export{h as mountHallFloat};