import{r as e}from"./rolldown-runtime-hePW80VL.js";import{i as t}from"./framework-D3uuXjLH.js";import{t as n}from"./frame-pacer-C2fpi5-G.js";import{t as r}from"./base-path-eL8HHVK0.js";var i=e(t(),1),a=`[data-hall-depth]`,o=`[data-plate-depth]`,s=r(`/xiaowu-plate-depth.png`),c=13e5,ee=7e3,l=600,u=270,d=300,f=.7,p=.22,te=.12,m=new Set([`slow-2g`,`2g`,`3g`]);function h(){if(window.matchMedia(`(prefers-reduced-motion: reduce)`).matches)return!0;let e=navigator.connection;return e?.saveData||e?.effectiveType&&m.has(e.effectiveType)?!0:window.matchMedia(`(prefers-reduced-data: reduce)`).matches}function g(e,t){let n=performance.now(),r=0,i=0,a=()=>document.documentElement.style.overflow===`hidden`||!!e.querySelector(`:scope > [role="presentation"]`)||typeof e.getAnimations==`function`&&e.getAnimations().some(e=>e.playState===`running`),o=()=>{a()&&performance.now()-n<8e3?i=window.setTimeout(s,250):t()},s=()=>{r=typeof window.requestIdleCallback==`function`?window.requestIdleCallback(o,{timeout:800}):window.setTimeout(o,120)};return s(),()=>{window.clearTimeout(i),typeof window.cancelIdleCallback==`function`?window.cancelIdleCallback(r):window.clearTimeout(r)}}var _=144,v=204,ne=.09,re=.055,ie=.015,ae=2,oe=`
attribute vec2 aPos;
attribute float aZ;
/* uTilt 顶点片元共用；顶点侧默认 highp、片元是 mediump，精度不标齐链接直接失败 */
uniform mediump vec2 uTilt;
uniform vec2 uAmp;
uniform float uPop;
varying vec2 vUv;
void main() {
  vUv = aPos;
  vec2 clip = vec2(aPos.x * 2.0 - 1.0, 1.0 - aPos.y * 2.0);
  float z = aZ * 2.0;
  clip *= 1.0 + z * uPop;
  clip += uTilt * uAmp * z;
  gl_Position = vec4(clip, -aZ, 1.0);
}
`,se=`
precision mediump float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform sampler2D uAux;
uniform vec2 uTexel;
uniform vec2 uAuxTexel;
uniform vec2 uTilt;
uniform float uNight;
uniform float uTime;

float lum(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

void main() {
  vec3 day = texture2D(uTex, vUv).rgb;

  /* 纸纹微法线：画自身的亮度梯度。粗起伏：深度梯度。光的方向跟指针相反侧。 */
  float gx = lum(texture2D(uTex, vUv + vec2(uTexel.x, 0.0)).rgb) - lum(texture2D(uTex, vUv - vec2(uTexel.x, 0.0)).rgb);
  float gy = lum(texture2D(uTex, vUv + vec2(0.0, uTexel.y)).rgb) - lum(texture2D(uTex, vUv - vec2(0.0, uTexel.y)).rgb);
  float dx = texture2D(uAux, vUv + vec2(uAuxTexel.x, 0.0)).r - texture2D(uAux, vUv - vec2(uAuxTexel.x, 0.0)).r;
  float dy = texture2D(uAux, vUv + vec2(0.0, uAuxTexel.y)).r - texture2D(uAux, vUv - vec2(0.0, uAuxTexel.y)).r;

  float tiltMag = min(length(uTilt), 1.0);
  vec2 lightDir = tiltMag > 0.001 ? normalize(vec2(-uTilt.x, uTilt.y)) : vec2(0.0);
  float grain = (gx * lightDir.x + gy * lightDir.y) * 1.3;
  float relief = (dx * lightDir.x + dy * lightDir.y) * 1.1;
  /* 夜里纸纹光减半：屋里的灯才是主角 */
  vec3 lit = day * (1.0 + (grain + relief) * tiltMag * (1.0 - uNight * 0.5));

  /* 入夜：压暗偏冷 + 门窗里的暖光 + 8秒极缓呼吸 */
  float glow = texture2D(uAux, vUv).g;
  float breath = 1.0 + 0.05 * sin(uTime * 0.785);
  vec3 dusk = lit * vec3(0.56, 0.60, 0.72);
  vec3 warm = vec3(1.0, 0.80, 0.52);
  vec3 night = dusk + lit * warm * (glow * 1.45 * breath) + warm * glow * glow * 0.20 * breath;

  gl_FragColor = vec4(mix(lit, night, uNight), 1.0);
}
`;function y(e,t,n){let r=e.createShader(t);return r?(e.shaderSource(r,n),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:null):null}function b(e,t,n){let r=e.createTexture();return e.activeTexture(e.TEXTURE0+t),e.bindTexture(e.TEXTURE_2D,r),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texImage2D(e.TEXTURE_2D,0,e.RGB,e.RGB,e.UNSIGNED_BYTE,n),r}function ce(e){let t=document.createElement(`canvas`);t.width=e.naturalWidth,t.height=e.naturalHeight;let n=t.getContext(`2d`);if(!n)return null;n.drawImage(e,0,0);let{data:r,width:i,height:a}=n.getImageData(0,0,t.width,t.height),o=new Float32Array(29725),s=0;for(let e=0;e<=v;e+=1){let t=e/v*(a-1),n=Math.floor(t),c=Math.min(n+1,a-1),ee=t-n;for(let e=0;e<=_;e+=1){let t=e/_*(i-1),a=Math.floor(t),l=Math.min(a+1,i-1),u=t-a,d=r[(n*i+a)*4],f=r[(n*i+l)*4],p=r[(c*i+a)*4],te=r[(c*i+l)*4],m=d+(f-d)*u,h=p+(te-p)*u;o[s]=(m+(h-m)*ee)/255-.5,s+=1}}return o}function x(){return(0,i.useEffect)(()=>{let e=document.querySelector(a),t=document.querySelector(o),r=t?.querySelector(`img`);if(!e||!t||!r)return;let i=!window.matchMedia(`(hover: hover) and (pointer: fine)`).matches,m={stage:null,ratio:0,frames:0},x=window.__xiaowu3d??={};x.plateDepth=()=>({tier:C?.isConnected?`high`:`static`,stage:m.stage,software:!1,renderer:null,probe:{webglStrict:m.stage&&m.stage===`strict`},drive:i?`wake`:`pointer`,pixelRatio:m.ratio,canvas:C?[C.width,C.height]:null,frames:m.frames});let S=!1,C=null,w=null,T=0,E=null,D=null;if(h())return()=>{delete x.plateDepth};let O=window.matchMedia(`(prefers-color-scheme: dark)`),k=()=>{let e=document.documentElement.classList;return e.contains(`dark`)?!0:!e.contains(`light`)&&O.matches},A=()=>{T&&cancelAnimationFrame(T),T=0,E?.disconnect(),D?.(),D=null,(w?.getExtension(`WEBGL_lose_context`))?.loseContext(),C?.remove(),C=null,w=null},j=new Image;j.decoding=`async`;let M=()=>Promise.race([r.decode().catch(()=>null),new Promise(e=>setTimeout(e,300))]);Promise.all([r.complete&&r.naturalWidth?M():new Promise(e=>r.addEventListener(`load`,e,{once:!0})).then(M),new Promise(e=>{j.onload=()=>e(!0),j.onerror=()=>e(!1),j.src=t.dataset.plateDepth||s})]).then(([,t])=>{S||!t||!r.naturalWidth||(i?D=g(e,()=>N()):N())});let N=()=>{if(D=null,S)return;let a=ce(j);if(!a)return;if(C=document.createElement(`canvas`),C.setAttribute(`aria-hidden`,`true`),C.style.position=`absolute`,C.style.pointerEvents=`none`,C.style.borderRadius=getComputedStyle(r).borderRadius,w=C.getContext(`webgl`,{alpha:!1,antialias:!1,preserveDrawingBuffer:!1,failIfMajorPerformanceCaveat:!0}),m.stage=w?`strict`:`none`,!w){C=null;return}let o=w.drawElements.bind(w);w.drawElements=(e,t,n,r)=>{m.frames+=1,o(e,t,n,r)};let s=y(w,w.VERTEX_SHADER,oe),h=y(w,w.FRAGMENT_SHADER,se),g=w.createProgram();if(!s||!h||!g||(w.attachShader(g,s),w.attachShader(g,h),w.linkProgram(g),!w.getProgramParameter(g,w.LINK_STATUS)))return;w.useProgram(g);let x=new Float32Array(59450);for(let e=0,t=0;e<=v;e+=1)for(let n=0;n<=_;n+=1,t+=1)x[t*2]=n/_,x[t*2+1]=e/v;let M=new Uint16Array(176256);for(let e=0,t=0;e<v;e+=1)for(let n=0;n<_;n+=1){let r=e*145+n,i=r+1,a=r+145,o=a+1;M[t++]=r,M[t++]=a,M[t++]=i,M[t++]=i,M[t++]=a,M[t++]=o}let N=w.createBuffer();w.bindBuffer(w.ARRAY_BUFFER,N),w.bufferData(w.ARRAY_BUFFER,x,w.STATIC_DRAW);let le=w.getAttribLocation(g,`aPos`);w.enableVertexAttribArray(le),w.vertexAttribPointer(le,2,w.FLOAT,!1,0,0);let ue=w.createBuffer();w.bindBuffer(w.ARRAY_BUFFER,ue),w.bufferData(w.ARRAY_BUFFER,a,w.STATIC_DRAW);let P=w.getAttribLocation(g,`aZ`);w.enableVertexAttribArray(P),w.vertexAttribPointer(P,1,w.FLOAT,!1,0,0);let de=w.createBuffer();w.bindBuffer(w.ELEMENT_ARRAY_BUFFER,de),w.bufferData(w.ELEMENT_ARRAY_BUFFER,M,w.STATIC_DRAW),b(w,0,r),b(w,1,j),w.uniform1i(w.getUniformLocation(g,`uTex`),0),w.uniform1i(w.getUniformLocation(g,`uAux`),1),w.uniform2f(w.getUniformLocation(g,`uAmp`),ne,re),w.uniform1f(w.getUniformLocation(g,`uPop`),ie),w.uniform2f(w.getUniformLocation(g,`uTexel`),1/r.naturalWidth,1/r.naturalHeight),w.uniform2f(w.getUniformLocation(g,`uAuxTexel`),1/j.naturalWidth,1/j.naturalHeight);let F=w.getUniformLocation(g,`uTilt`),I=w.getUniformLocation(g,`uNight`),L=w.getUniformLocation(g,`uTime`);w.enable(w.DEPTH_TEST),w.depthFunc(w.LESS),w.clearColor(.957,.949,.929,1);let R=1,z=()=>Number.parseFloat(e.style.getPropertyValue(`--hall-walk-res`))||1,B=()=>{if(!C||!w)return;let t=i?Math.min(window.devicePixelRatio||1,2,Math.sqrt(c/Math.max(r.offsetWidth*r.offsetHeight,1))):Math.min(window.devicePixelRatio||1,2);R=z();let n=Number.parseFloat(e.style.getPropertyValue(`--hall-walk-density`))||t,a=ae*r.naturalWidth/Math.max(r.offsetWidth,1),o=R>1?Math.min(Math.max(t,R*n),a,4096/Math.max(r.offsetWidth,r.offsetHeight,1)):t;C.style.left=`${r.offsetLeft}px`,C.style.top=`${r.offsetTop}px`,C.style.width=`${r.offsetWidth}px`,C.style.height=`${r.offsetHeight}px`,C.width=Math.max(1,Math.round(r.offsetWidth*o)),C.height=Math.max(1,Math.round(r.offsetHeight*o)),w.viewport(0,0,C.width,C.height),m.ratio=o,V=NaN},V=NaN,H=NaN,U=+!!k(),W=U,G=()=>{if(T=requestAnimationFrame(G),!w||document.documentElement.getAttribute(`data-hall-walk`)===`live`)return;z()!==R&&B(),W=+!!k();let t=Number.parseFloat(e.style.getPropertyValue(`--hall-tilt-x`))||0,n=Number.parseFloat(e.style.getPropertyValue(`--hall-tilt-y`))||0,r=Math.abs(W-U)>.001;t===V&&n===H&&!r&&U<.001||(V=t,H=n,r?U+=(W-U)*.06:U=W,w.uniform2f(F,t,n),w.uniform1f(I,U),w.uniform1f(L,performance.now()/1e3),w.clear(w.COLOR_BUFFER_BIT|w.DEPTH_BUFFER_BIT),w.drawElements(w.TRIANGLES,M.length,w.UNSIGNED_SHORT,0))};C.addEventListener(`webglcontextlost`,e=>{e.preventDefault(),A()});let K=n(),q=performance.now(),J=1,Y=0,X=1,Z=0,fe=!0,Q=e=>{if(T=0,!w||!C||!fe||document.hidden){Z=0,K.reset();return}if(!K.ready(e)){T=requestAnimationFrame(Q);return}let t=document.documentElement.getAttribute(`data-hall-walk`);if(t===`live`){Z=0,K.reset();return}let n=Z?Math.min(e-Z,50):1e3/30;Z=e,z()!==R&&B();let i=+(e-q<ee);J+=(i-J)*(1-Math.exp(-n/l)),J<.01&&i===0&&(J=0),Y+=n/1e3*J;let a=t===`away`?0:1;X+=(a-X)*(1-Math.exp(-n/d)),Math.abs(a-X)<.002&&(X=a),W=+!!k(),U+=(W-U)*(1-Math.exp(-n/u)),Math.abs(W-U)<.001&&(U=W);let o=r.getBoundingClientRect(),s=window.innerHeight/2||1,c=Math.max(-1,Math.min(1,(o.top+o.height/2-s)/s)),m=X*p*(Math.sin(Y*.52)+.4*Math.sin(Y*.83+1.3)),h=X*(f*c+te*Math.sin(Y*.61+.7));w.uniform2f(F,m,h),w.uniform1f(I,U),w.uniform1f(L,Y),w.clear(w.COLOR_BUFFER_BIT|w.DEPTH_BUFFER_BIT),w.drawElements(w.TRIANGLES,M.length,w.UNSIGNED_SHORT,0),J>0||U!==W||X!==a?T=requestAnimationFrame(Q):(Z=0,K.reset())},$=()=>{!T&&w&&(T=requestAnimationFrame(Q))},pe=()=>{q=performance.now(),$()};if(B(),E=new ResizeObserver(()=>{B(),i&&$()}),E.observe(r),t.appendChild(C),!i){G();return}let me=[`scroll`,`pointerdown`,`touchstart`];for(let e of me)window.addEventListener(e,pe,{passive:!0});O.addEventListener(`change`,$),document.addEventListener(`visibilitychange`,$);let he=new MutationObserver($);he.observe(document.documentElement,{attributes:!0,attributeFilter:[`class`,`data-hall-walk`]});let ge=new IntersectionObserver(([e])=>{fe=e?.isIntersecting??!0,$()});ge.observe(r),D=()=>{for(let e of me)window.removeEventListener(e,pe);O.removeEventListener(`change`,$),document.removeEventListener(`visibilitychange`,$),he.disconnect(),ge.disconnect()},Q(performance.now())};return()=>{S=!0,A(),delete x.plateDepth}},[]),null}export{x as PlateDepth};