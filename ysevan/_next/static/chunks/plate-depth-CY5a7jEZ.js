import{r as e}from"./rolldown-runtime-hePW80VL.js";import{i as t}from"./framework-D3uuXjLH.js";import{t as n}from"./base-path-eL8HHVK0.js";var r=e(t(),1),i=`[data-hall-depth]`,a=`[data-plate-depth]`,o=n(`/xiaowu-plate-depth.png`),s=144,c=204,l=.09,u=.055,d=.015,f=2,p=`
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
`,m=`
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
`;function h(e,t,n){let r=e.createShader(t);return r?(e.shaderSource(r,n),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:null):null}function g(e,t,n){let r=e.createTexture();return e.activeTexture(e.TEXTURE0+t),e.bindTexture(e.TEXTURE_2D,r),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texImage2D(e.TEXTURE_2D,0,e.RGB,e.RGB,e.UNSIGNED_BYTE,n),r}function _(e){let t=document.createElement(`canvas`);t.width=e.naturalWidth,t.height=e.naturalHeight;let n=t.getContext(`2d`);if(!n)return null;n.drawImage(e,0,0);let{data:r,width:i,height:a}=n.getImageData(0,0,t.width,t.height),o=new Float32Array(29725),l=0;for(let e=0;e<=c;e+=1){let t=e/c*(a-1),n=Math.floor(t),u=Math.min(n+1,a-1),d=t-n;for(let e=0;e<=s;e+=1){let t=e/s*(i-1),a=Math.floor(t),c=Math.min(a+1,i-1),f=t-a,p=r[(n*i+a)*4],m=r[(n*i+c)*4],h=r[(u*i+a)*4],g=r[(u*i+c)*4],_=p+(m-p)*f,v=h+(g-h)*f;o[l]=(_+(v-_)*d)/255-.5,l+=1}}return o}function v(){return(0,r.useEffect)(()=>{let e=document.querySelector(i),t=document.querySelector(a),n=t?.querySelector(`img`);if(!e||!t||!n||window.matchMedia(`(prefers-reduced-motion: reduce)`).matches||!window.matchMedia(`(hover: hover) and (pointer: fine)`).matches)return;let r=!1,v=null,y=null,b=0,x=null,S=window.matchMedia(`(prefers-color-scheme: dark)`),C=()=>{let e=document.documentElement.classList;return e.contains(`dark`)?!0:!e.contains(`light`)&&S.matches},w=()=>{b&&cancelAnimationFrame(b),b=0,x?.disconnect(),(y?.getExtension(`WEBGL_lose_context`))?.loseContext(),v?.remove(),v=null,y=null},T=new Image;T.decoding=`async`;let E=()=>Promise.race([n.decode().catch(()=>null),new Promise(e=>setTimeout(e,300))]);return Promise.all([n.complete&&n.naturalWidth?E():new Promise(e=>n.addEventListener(`load`,e,{once:!0})).then(E),new Promise(e=>{T.onload=()=>e(!0),T.onerror=()=>e(!1),T.src=t.dataset.plateDepth||o})]).then(([,i])=>{if(r||!i||!n.naturalWidth)return;let a=_(T);if(!a)return;if(v=document.createElement(`canvas`),v.setAttribute(`aria-hidden`,`true`),v.style.position=`absolute`,v.style.pointerEvents=`none`,v.style.borderRadius=getComputedStyle(n).borderRadius,y=v.getContext(`webgl`,{alpha:!1,antialias:!1,preserveDrawingBuffer:!1,failIfMajorPerformanceCaveat:!0}),!y){v=null;return}let o=h(y,y.VERTEX_SHADER,p),S=h(y,y.FRAGMENT_SHADER,m),E=y.createProgram();if(!o||!S||!E||(y.attachShader(E,o),y.attachShader(E,S),y.linkProgram(E),!y.getProgramParameter(E,y.LINK_STATUS)))return;y.useProgram(E);let D=new Float32Array(59450);for(let e=0,t=0;e<=c;e+=1)for(let n=0;n<=s;n+=1,t+=1)D[t*2]=n/s,D[t*2+1]=e/c;let O=new Uint16Array(176256);for(let e=0,t=0;e<c;e+=1)for(let n=0;n<s;n+=1){let r=e*145+n,i=r+1,a=r+145,o=a+1;O[t++]=r,O[t++]=a,O[t++]=i,O[t++]=i,O[t++]=a,O[t++]=o}let k=y.createBuffer();y.bindBuffer(y.ARRAY_BUFFER,k),y.bufferData(y.ARRAY_BUFFER,D,y.STATIC_DRAW);let A=y.getAttribLocation(E,`aPos`);y.enableVertexAttribArray(A),y.vertexAttribPointer(A,2,y.FLOAT,!1,0,0);let j=y.createBuffer();y.bindBuffer(y.ARRAY_BUFFER,j),y.bufferData(y.ARRAY_BUFFER,a,y.STATIC_DRAW);let M=y.getAttribLocation(E,`aZ`);y.enableVertexAttribArray(M),y.vertexAttribPointer(M,1,y.FLOAT,!1,0,0);let N=y.createBuffer();y.bindBuffer(y.ELEMENT_ARRAY_BUFFER,N),y.bufferData(y.ELEMENT_ARRAY_BUFFER,O,y.STATIC_DRAW),g(y,0,n),g(y,1,T),y.uniform1i(y.getUniformLocation(E,`uTex`),0),y.uniform1i(y.getUniformLocation(E,`uAux`),1),y.uniform2f(y.getUniformLocation(E,`uAmp`),l,u),y.uniform1f(y.getUniformLocation(E,`uPop`),d),y.uniform2f(y.getUniformLocation(E,`uTexel`),1/n.naturalWidth,1/n.naturalHeight),y.uniform2f(y.getUniformLocation(E,`uAuxTexel`),1/T.naturalWidth,1/T.naturalHeight);let P=y.getUniformLocation(E,`uTilt`),F=y.getUniformLocation(E,`uNight`),I=y.getUniformLocation(E,`uTime`);y.enable(y.DEPTH_TEST),y.depthFunc(y.LESS),y.clearColor(.957,.949,.929,1);let L=1,R=()=>Number.parseFloat(e.style.getPropertyValue(`--hall-walk-res`))||1,z=()=>{if(!v||!y)return;let t=Math.min(window.devicePixelRatio||1,2);L=R();let r=Number.parseFloat(e.style.getPropertyValue(`--hall-walk-density`))||t,i=f*n.naturalWidth/Math.max(n.offsetWidth,1),a=L>1?Math.min(Math.max(t,L*r),i,4096/Math.max(n.offsetWidth,n.offsetHeight,1)):t;v.style.left=`${n.offsetLeft}px`,v.style.top=`${n.offsetTop}px`,v.style.width=`${n.offsetWidth}px`,v.style.height=`${n.offsetHeight}px`,v.width=Math.max(1,Math.round(n.offsetWidth*a)),v.height=Math.max(1,Math.round(n.offsetHeight*a)),y.viewport(0,0,v.width,v.height),B=NaN},B=NaN,V=NaN,H=+!!C(),U=H,W=()=>{if(b=requestAnimationFrame(W),!y||document.documentElement.getAttribute(`data-hall-walk`)===`live`)return;R()!==L&&z(),U=+!!C();let t=Number.parseFloat(e.style.getPropertyValue(`--hall-tilt-x`))||0,n=Number.parseFloat(e.style.getPropertyValue(`--hall-tilt-y`))||0,r=Math.abs(U-H)>.001;t===B&&n===V&&!r&&H<.001||(B=t,V=n,r?H+=(U-H)*.06:H=U,y.uniform2f(P,t,n),y.uniform1f(F,H),y.uniform1f(I,performance.now()/1e3),y.clear(y.COLOR_BUFFER_BIT|y.DEPTH_BUFFER_BIT),y.drawElements(y.TRIANGLES,O.length,y.UNSIGNED_SHORT,0))};v.addEventListener(`webglcontextlost`,e=>{e.preventDefault(),w()}),z(),x=new ResizeObserver(z),x.observe(n),t.appendChild(v),W()}),()=>{r=!0,w()}},[]),null}export{v as PlateDepth};