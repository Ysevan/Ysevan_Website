import{t as e}from"./frame-pacer-C2fpi5-G.js";import{S as t,T as n,_ as r,b as i,d as a,g as o,h as s,i as c,n as l,o as u,t as d,u as f,v as p,w as m,y as h}from"./gsap-Xjoobghy.js";var g=new Set(Array.from(`，。、；：？！）」』》】〉〕〗｝］’”…‥—～·・%,.;:?!)]}`)),_=new Set(Array.from(`（「『《【〈〔〖｛［‘“([{`)),v=4,y=/[A-Za-z0-9]+(?:[._\-/]+[A-Za-z0-9]+)*/y;function b(e){let t=[],n=e.replace(/\s+/g,` `).trim(),r=0;for(;r<n.length;){y.lastIndex=r;let e=y.exec(n);if(e){t.push({text:e[0],space:!1}),r+=e[0].length;continue}let i=String.fromCodePoint(n.codePointAt(r)??0);t.push({text:i,space:i===` `}),r+=i.length}return t}var x=e=>e.map(e=>e.text).join(``);function S(e){let t=0,n=e.length;for(;t<n&&e[t].space;)t+=1;for(;n>t&&e[n-1].space;)--n;return e.slice(t,n)}var C=e=>e!==void 0&&g.has(e.text),w=e=>e!==void 0&&_.has(e.text);function ee(e,t,n,r=1/0){if(r<=0)return[];let i=b(e),a=[],o=[],s=e=>n(x(S(e)))<=t;for(let e=0;e<i.length;e+=1){let t=i[e];if(o.length===0&&t.space)continue;if(s([...o,t])){o.push(t);continue}if(!t.space&&t.text.length>1&&!s([t])){i.splice(e,1,...Array.from(t.text,e=>({text:e,space:!1}))),--e;continue}if(t.space){a.push(o),o=[];continue}let n=[...o,t],r=-1;for(let e=o.length;e>=Math.max(1,o.length-v);--e){let t=S(n.slice(e))[0],i=S(o.slice(0,e));if(i.length===0)break;if(!(C(t)||w(i[i.length-1]))){r=e;break}}if(r>0){a.push(S(o.slice(0,r))),o=S(n.slice(r));continue}C(t)?(o.push(t),a.push(o),o=[]):(a.push(o),o=[t])}S(o).length>0&&a.push(o);let c=a.map(S).filter(e=>e.length>0);if(c.length<=r)return c.map(x);let l=c.slice(0,r).map(x),u=Array.from(l[r-1]),d=()=>{for(;u.length&&(u[u.length-1]===` `||_.has(u[u.length-1]));)u.pop()};for(d();u.length&&n(`${u.join(``)}…`)>t;)u.pop(),d();return l[r-1]=`${u.join(``)}…`,l}var T={paper:`#FFFDFA`,paperBack:`#F3F1EA`,pageLight:`#F8F6F1`,ink:`#2E2D28`,inkBody:`#3E3C35`,ink3:`#6B685B`,ring:`#5E6144`,bay:`#6E8A93`},E=[{color:`#D5D4C1`,strength:.95},{color:`#8B8C6D`,strength:.4},{color:`#6E8A93`,strength:.34},{color:`#C9C6B4`,strength:.9},{color:`#A9BC96`,strength:.5},{color:`#E6DCC8`,strength:1}],D=[74,77,53],O=.22,k=1.25,te=130,ne=2048,A=4,re=15e3,ie=250,ae=`"Songti SC", "STSong", "SimSun", serif`;function j(e){return e.loading=`eager`,new Promise(t=>{if(e.complete){t(e.naturalWidth>0);return}let n=n=>{window.clearTimeout(a),e.removeEventListener(`load`,r),e.removeEventListener(`error`,i),t(n)},r=()=>n(!0),i=()=>n(!1),a=window.setTimeout(()=>n(!1),re);e.addEventListener(`load`,r),e.addEventListener(`error`,i)}).then(t=>t?Promise.race([e.decode().then(()=>!0,()=>!0),new Promise(e=>window.setTimeout(()=>e(!0),300))]):!1)}function oe(e,t,n,r){return ee(t,n,t=>e.measureText(t).width,r)}function M(e,t,n,r,i,a,o){let s=a/te,c=12*s,l=a-2*c;e.fillStyle=T.paper,e.fillRect(r,i,a,o),e.textBaseline=`top`,e.textAlign=`left`;let u=i+c,d=10.5*s;e.fillStyle=T.ink3,e.font=`${d}px ${n.sans}`,e.fillText(t.date,r+c,u),u+=d*1.5+6*s;let f=13.5*s;e.fillStyle=T.ink,e.font=`600 ${f}px ${n.serif}`;for(let n of oe(e,t.title,l,3))e.fillText(n,r+c,u),u+=f*1.45;if(u+=5*s,!t.excerpt)return;let p=11*s,m=p*1.65,h=Math.floor((i+o-c-u)/m);e.fillStyle=T.inkBody,e.globalAlpha=.78,e.font=`${p}px ${n.sans}`;for(let n of oe(e,t.excerpt,l,Math.min(3,h)))e.fillText(n,r+c,u),u+=m;e.globalAlpha=1}function N(e,t,n,r,i,a){let o=i/te,s=5*o;e.fillStyle=T.paper,e.fillRect(n,r,i,a);let c=i-2*s,l=a-2*s,u=Math.max(c/t.naturalWidth,l/t.naturalHeight),d=c/u,f=l/u;e.save(),e.beginPath(),typeof e.roundRect==`function`?e.roundRect(n+s,r+s,c,l,5*o):e.rect(n+s,r+s,c,l),e.clip(),e.drawImage(t,(t.naturalWidth-d)/2,(t.naturalHeight-f)/2,d,f,n+s,r+s,c,l),e.restore()}function P(e,t,n,r,i){let a=r/te,o=5*a;e.fillStyle=T.paper,e.fillRect(t,n,r,i),e.fillStyle=T.pageLight,e.beginPath(),typeof e.roundRect==`function`?e.roundRect(t+o,n+o,r-2*o,i-2*o,5*a):e.rect(t+o,n+o,r-2*o,i-2*o),e.fill()}async function se(e,t,n,r){let i=Math.max(e.length,1),a=Math.max(1,Math.ceil(Math.sqrt(i*k))),o=Math.ceil(i/a),s=Math.floor(Math.min(t+8,ne/a,ne/(o*k))),c=Math.floor(s*k),l=document.createElement(`canvas`);l.width=a*s,l.height=o*c;let u=l.getContext(`2d`);if(!u)return null;u.fillStyle=T.paper,u.fillRect(0,0,l.width,l.height);let d=e.map(e=>e.link.querySelector(`span`)).find(Boolean),f={serif:d&&getComputedStyle(d).fontFamily||ae,sans:getComputedStyle(document.body).fontFamily||`sans-serif`},p=[],m=[];for(let t=0;t<e.length;t+=1){let i=e[t],o=t%a*s+A,d=Math.floor(t/a)*c+A,h=s-8,g=c-8;p.push([o/l.width,d/l.height,(o+h)/l.width,(d+g)/l.height]);let _=i.image;if(!_){if(!await n())return null;M(u,i,f,o,d,h,g),m.push(`title`);continue}let v=j(_),y=await Promise.race([v,new Promise(e=>window.setTimeout(()=>e(null),ie))]);if(!await n())return null;if(y===!1){M(u,i,f,o,d,h,g),m.push(`title`);continue}if(m.push(`photo`),y===!0){N(u,_,o,d,h,g);continue}P(u,o,d,h,g),v.then(async e=>{await n()&&(e?N(u,_,o,d,h,g):M(u,i,f,o,d,h,g),r())})}return{canvas:l,rects:p,kinds:m}}var F={center:`aCenter`,card:`aCard`,rect:`aRect`,tint:`aTint`},I=`
attribute vec3 aCenter;
attribute vec4 aCard;
attribute vec4 aRect;
attribute vec4 aTint;

uniform float uLift[SLOTS];

varying vec2 vUv;
varying vec4 vCard;
varying vec4 vRect;
varying vec4 vTint;
varying vec3 vNormal;
varying float vFacing;

void main() {
  float lift = uLift[int(aCard.x + 0.5)];
  /* 悬停浮出：沿法线往外推一点，并以卡心为中心放大一点 */
  vec3 p = aCenter * (1.0 + 0.12 * lift) + (position - aCenter) * (1.0 + 0.1 * lift);
  vUv = uv;
  vCard = aCard;
  vRect = aRect;
  vTint = aTint;
  vNormal = normalize(normalMatrix * normalize(position));
  /* 卡心法线在视空间里的 z：1 = 正对观者，-1 = 背面那半球最远处 */
  vFacing = normalize(normalMatrix * aCenter).z;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`,L=`
uniform sampler2D uAtlas;
uniform vec2 uCardSize;
uniform vec3 uPaperBack;
uniform vec3 uPageLight;
uniform vec3 uBayTint;
uniform vec3 uBg;
uniform vec3 uRing;
uniform float uFocus;
uniform float uFocusAmount;
uniform float uNight;
uniform float uGrain;
uniform float uDpr;

varying vec2 vUv;
varying vec4 vCard;
varying vec4 vRect;
varying vec4 vTint;
varying vec3 vNormal;
varying float vFacing;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float sdRoundRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  float kind = vCard.y;
  float seed = vCard.z;
  vec2 q = (vUv - 0.5) * uCardSize;
  float sd = sdRoundRect(q, uCardSize * 0.5, 0.03);

  /* 补位色块的边界带一点毛：两层值噪声推一推距离场 */
  float wobble = noise(q * 15.0 + seed * 37.0) * 0.6 + noise(q * 34.0 + seed * 11.0) * 0.4;
  float edgeSd = kind < 0.5 ? sd + (wobble - 0.5) * 0.022 : sd;
  float px = max(fwidth(edgeSd), 1e-6);

  /*
   * 贴图在分支与 discard 之前采样：mipmap 要靠相邻像素的导数，放进按像素走的分支里是未定义行为。
   * 正反两面各采一次。图集的矩形按画布像素（y 向下）记，贴图上传时翻了 y，所以这里再翻回来。
   */
  vec2 cell = vec2(vUv.x, 1.0 - vUv.y);
  vec2 frontUv = mix(vRect.xy, vRect.zw, cell);
  vec2 backUv = mix(vRect.xy, vRect.zw, vec2(1.0 - cell.x, cell.y));
  vec3 front = texture2D(uAtlas, vec2(frontUv.x, 1.0 - frontUv.y)).rgb;
  vec3 back = texture2D(uAtlas, vec2(backUv.x, 1.0 - backUv.y)).rgb;

  float mask = 1.0 - smoothstep(-px, px, edgeSd);
  if (mask < 0.02) discard;
  /* 离边多少个屏幕像素 */
  float inPx = -edgeSd / px;

  vec3 col;
  if (kind < 0.5) {
    /*
     * 水彩洗色：颜料在纸上是平的，只在干掉的边上积出细细一道深线（3个像素上下）；
     * 里面叠两层大小不一的晕染，深浅斑驳。背面是透过纸背的颜料，淡一半。
     */
    float dried = 1.0 - smoothstep(0.0, 3.0 * uDpr, inPx);
    float bloom = noise(q * 3.2 + seed * 5.0) * 0.65 + noise(q * 9.0 + seed * 2.0) * 0.35;
    float pigment = (0.8 + 0.32 * bloom) * (1.0 + 0.28 * dried);
    float amount = clamp(vTint.a * pigment * (gl_FrontFacing ? 1.0 : 0.5), 0.0, 1.0);
    col = mix(uPageLight, vTint.rgb, amount);
  } else if (gl_FrontFacing) {
    col = front;
  } else {
    /* 卡背：纸面次白，透出一点镜像的正面，像对着光看一张纸的背面 */
    col = mix(uPaperBack, back, 0.1);
  }

  /* ② 平涂三档 + 背光冷影。光从左上前方来，固定在观者一侧。 */
  vec3 n = normalize(vNormal) * (gl_FrontFacing ? 1.0 : -1.0);
  float lambert = dot(n, normalize(vec3(-0.42, 0.72, 0.55)));
  float toMid = smoothstep(-0.08, 0.1, lambert);
  float toLit = smoothstep(0.34, 0.5, lambert);
  col *= mix(0.8, mix(0.915, 1.0, toLit), toMid);
  col *= mix(vec3(1.0), uBayTint, ((1.0 - toMid) * 0.34 + (1.0 - toLit) * 0.08) * (1.0 - uNight));

  /* ③ 纸纹：照片上不加 */
  float isPhoto = kind > 1.5 && gl_FrontFacing ? 1.0 : 0.0;
  if (uGrain > 0.5 && isPhoto < 0.5) {
    vec2 gp = q * 260.0;
    float fiber = noise(gp * vec2(1.0, 0.3)) * 0.6 + noise(gp * 2.1 + 7.0) * 0.4;
    col *= 1.0 + (fiber - 0.5) * 0.06;
  }

  /* ④ 颜料边：卡片贴边一道深线，再往里一层很淡的晕（色块的干边已经在上面算过了） */
  if (kind > 0.5) {
    float rim = 1.0 - smoothstep(0.0, 1.4 * uDpr, inPx);
    float halo = 1.0 - smoothstep(0.0, 7.0 * uDpr, inPx);
    col *= 1.0 - rim * 0.13 - halo * 0.045;
  }

  /*
   * ⑥ 入夜：只压暗、不变色（灰度系数，三个通道乘同一个数）。照片压得轻一点，免得夜里糊成一片；
   * 补位色块压得最深：夜里整只球几十块浅色会亮成一片，随笔卡应当是灯下那几张
   * （静态版的色块夜里也是压到0.42的透明度）。
   */
  float dusk = mix(0.34, 0.5, isPhoto) * (kind < 0.5 ? 0.3 : 1.0);
  col = mix(col, col * dusk, uNight);

  /* ⑤ 远近：白天背面半球往页面底色（暖纸）里褪；夜里往暗处沉，不褪向夜空的冷炭色 */
  float far = smoothstep(0.2, -0.85, vFacing);
  col = mix(col, mix(uBg, col * 0.4, uNight), far * 0.5);

  /* 键盘焦点环：离边2–4个像素那一圈，颜色取页面的 --ring，不跟着入夜压暗 */
  if (abs(vCard.x - uFocus) < 0.5 && kind > 0.5) {
    float ring = 1.0 - smoothstep(1.0 * uDpr, 1.8 * uDpr, abs(inPx - 3.2 * uDpr));
    col = mix(col, uRing, ring * uFocusAmount);
  }

  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
  gl_FragColor = vec4(gl_FragColor.rgb * mask, mask);
}
`;function R(){let e=new u(T.bay),t=Math.max(e.r,e.g,e.b);return new n(e.r/t,e.g/t,e.b/t)}function ce(e){let t={uAtlas:{value:null},uCardSize:{value:new m(...e.cardSize)},uPaperBack:{value:new u(T.paperBack)},uPageLight:{value:new u(T.pageLight)},uBayTint:{value:R()},uBg:{value:new u(T.pageLight)},uRing:{value:new u(T.ring)},uFocus:{value:-1},uFocusAmount:{value:0},uNight:{value:0},uGrain:{value:+!!e.grain},uDpr:{value:e.dpr},uLift:{value:new Float32Array(e.slots)}},n=new i({vertexShader:I,fragmentShader:L,side:2,defines:{SLOTS:e.slots},uniforms:t});return n.alphaToCoverage=!0,{material:n,uniforms:t}}function le(e,t){let n=getComputedStyle(document.documentElement).getPropertyValue(t).match(/([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/);return n?(e.setHSL(Number(n[1])/360,Number(n[2])/100,Number(n[3])/100,p),!0):!1}var z=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,ue=`
uniform vec3 uColor;
uniform float uAlpha;
uniform float uNight;
varying vec2 vUv;
void main() {
  float r = length(vUv * 2.0 - 1.0);
  float a = uAlpha * pow(1.0 - smoothstep(0.0, 1.0, r), 1.6);
  vec3 c = mix(uColor, uColor * 0.3, uNight);
  gl_FragColor = vec4(c, 1.0);
  #include <colorspace_fragment>
  float alpha = a * (1.0 + uNight * 0.4);
  gl_FragColor = vec4(gl_FragColor.rgb * alpha, alpha);
}
`;function de(e){return new i({vertexShader:z,fragmentShader:ue,transparent:!0,premultipliedAlpha:!0,depthWrite:!1,uniforms:{uColor:{value:new u(D[0]/255,D[1]/255,D[2]/255).convertSRGBToLinear()},uAlpha:{value:O},uNight:e}})}var fe=.36,pe=fe*1.25,me=.06;function B(e){let t=Math.sin(e*127.1+311.7)*43758.5453;return t-Math.floor(t)}function he(e){let t=Math.PI*(3-Math.sqrt(5));return Array.from({length:e},(r,i)=>{let a=1-2*(i+.5)/e,o=Math.sqrt(1-a*a),s=i*t;return new n(Math.cos(s)*o,a,Math.sin(s)*o)})}function ge(e,t){let n=e.map((e,t)=>({slot:t,score:e.z-.6*Math.abs(e.y)})).sort((e,t)=>t.score-e.score).map(e=>e.slot),r=n.slice(0,t),i=_e(e[n[0]]);return{slotOfCard:r,restYaw:i.yaw,restPitch:i.pitch+me}}function _e(e){let t=Math.hypot(e.x,e.z);return{yaw:Math.atan2(-e.x,e.z),pitch:Math.atan2(e.y,t)}}function ve(e,t,r){let i=(r+1)*(r+1),a=e.length*i,o=new Float32Array(a*3),s=new Float32Array(a*2),l=new Float32Array(a*3),d=new Float32Array(a*4),p=new Float32Array(a*4),m=new Float32Array(a*4),h=[],g=new n(0,1,0),_=new n,v=new n,y=new n,b=new n,x=new n,S=new u;e.forEach((e,n)=>{let a=t[n],c=a.kind===`wash`?0:a.kind===`title`?1:2,u=B(n*1.7+.5)*10,f=E[Math.floor(B(n+.29)*E.length)%E.length];S.set(f.color),_.crossVectors(g,e).normalize(),v.crossVectors(e,_);let C=(B(n+.61)-.5)*.08;y.copy(_).multiplyScalar(Math.cos(C)).addScaledVector(v,Math.sin(C)),b.copy(v).multiplyScalar(Math.cos(C)).addScaledVector(_,-Math.sin(C));let w=n*i;for(let t=0;t<=r;t+=1)for(let i=0;i<=r;i+=1){let h=i/r,g=t/r,_=w+t*(r+1)+i;x.copy(e).addScaledVector(y,(h-.5)*fe).addScaledVector(b,(g-.5)*pe).normalize(),o.set([x.x,x.y,x.z],_*3),s.set([h,g],_*2),l.set([e.x,e.y,e.z],_*3),d.set([n,c,u,0],_*4),a.kind===`wash`?m.set([S.r,S.g,S.b,f.strength],_*4):p.set(a.rect,_*4)}for(let e=0;e<r;e+=1)for(let t=0;t<r;t+=1){let n=w+e*(r+1)+t,i=n+1,a=n+r+1,o=a+1;h.push(n,i,o,n,o,a)}});let C=new c;return C.setAttribute(`position`,new f(o,3)),C.setAttribute(`uv`,new f(s,2)),C.setAttribute(F.center,new f(l,3)),C.setAttribute(F.card,new f(d,4)),C.setAttribute(F.rect,new f(p,4)),C.setAttribute(F.tint,new f(m,4)),C.setIndex(h),C}function ye(e){let t=new n(0,1,0);return e.map((e,r)=>{let i=new n().crossVectors(t,e).normalize(),a=new n().crossVectors(e,i),o=(B(r+.61)-.5)*.08,s=i.clone().multiplyScalar(Math.cos(o)).addScaledVector(a,Math.sin(o)),c=a.clone().multiplyScalar(Math.cos(o)).addScaledVector(i,-Math.sin(o));return{center:e.clone(),right:s,up:c}})}var be=`data-notes-globe-state`,V=`data-notes-globe-pointer`,xe={high:1.75,balanced:1.25,soft:1.5},Se={high:320,balanced:224,soft:224},Ce={high:6,balanced:3,soft:3},we=1e6,Te=2,Ee=13e5,De=.078,Oe=.7,ke=4.2,Ae=.42,je=.52,Me=.44,Ne=.06,Pe={mouse:4,touch:8},Fe={soft:30},Ie=30,Le={capped:.6,free:.55},Re=[30,120],ze=3e3,Be=240;function H(){return new Promise(e=>{typeof window.requestIdleCallback==`function`?window.requestIdleCallback(()=>e(),{timeout:300}):window.setTimeout(e,16)})}var U=(e,t,n)=>Math.min(n,Math.max(t,e));function W(i,c,f){let{canvas:m,context:g}=f,_=Math.max(f.slots,c.length),v=f.tier,y=f.readLayout()===`phone`,b=!1,x=!1,S=!1,C=[],w=e=>(C.push(e),e),ee=e=>Math.sqrt(e/(i.clientWidth*i.clientHeight||1)),T=()=>{let e=window.devicePixelRatio||1;return v===`soft`?Math.min(e,xe.soft,ee(we)):y?Math.min(e,Te,ee(Ee)):Math.min(e,xe[v])};m.setAttribute(`aria-hidden`,`true`),m.setAttribute(`role`,`presentation`),i.appendChild(m);let E=new h,D=new o(30,1.5,.1,20);D.position.set(0,0,ke);let O=new a;O.position.y=Ne,E.add(O);let k=he(_),te=ye(k),{slotOfCard:ne,restYaw:A,restPitch:re}=ge(k,c.length),ie=new Map(ne.map((e,t)=>[e,t])),{material:ae,uniforms:j}=ce({slots:_,cardSize:[fe,pe],grain:v===`high`,dpr:T()});w(ae);let oe=w(de(j.uNight)),M=new s(w(new r(2.1,.24)),oe);M.position.y=-1.0999999999999999,M.renderOrder=1,E.add(M);let N=null,P=null,F=()=>{b||x||(x=!0,window.setTimeout(()=>f.onFallback(),0))},I={yaw:A-.9,pitch:re,spin:0,scale:.9},L=Array.from({length:_},()=>({value:0})),R={slot:-1,amount:0},z=d.context(()=>{}),ue=window.matchMedia(`(prefers-color-scheme: dark)`),me=()=>{let e=document.documentElement.classList;return e.contains(`dark`)?!0:!e.contains(`light`)&&ue.matches},B=+!!me();j.uNight.value=B;let W=new u,Ve=()=>{le(W,`--background`),le(j.uRing.value,`--ring`)};Ve(),j.uBg.value.copy(W);let He=1,G=()=>{let e=i.clientWidth,t=i.clientHeight;if(!N||e===0||t===0)return;y=f.readLayout()===`phone`,He=y?Math.min(je*e,Me*t):Ae*Math.min(e,t,window.innerHeight*.95);let n=1/Math.sqrt(1-1/(ke*ke))*(t/2)/He;D.fov=2*Math.atan(n/ke)*180/Math.PI,D.aspect=e/t,D.updateProjectionMatrix(),N.setPixelRatio(T()),N.setSize(e,t,!1),j.uDpr.value=N.getPixelRatio(),$()},K={origin:new n,direction:new n},Ue={center:new n,normal:new n,right:new n,up:new n,hit:new n},We=(e,t)=>{let n=m.getBoundingClientRect();if(n.width===0||n.height===0)return-1;O.updateMatrixWorld(),D.updateMatrixWorld();let r=(e-n.left)/n.width*2-1,i=-((t-n.top)/n.height)*2+1;K.origin.copy(D.position),K.direction.set(r,i,.5).unproject(D).sub(K.origin).normalize();let a=-1,o=1/0,s=O.matrixWorld;return te.forEach((e,t)=>{let n=L[t].value,{center:r,normal:i,right:c,up:l,hit:u}=Ue;if(i.copy(e.center).transformDirection(s),i.dot(K.direction)>=0)return;r.copy(e.center).multiplyScalar(1+.12*n).applyMatrix4(s);let d=(r.dot(i)-K.origin.dot(i))/K.direction.dot(i);if(d<=0||d>=o)return;u.copy(K.origin).addScaledVector(K.direction,d).sub(r);let f=(1+.1*n)*I.scale;c.copy(e.right).transformDirection(s),l.copy(e.up).transformDirection(s),!(Math.abs(u.dot(c))>.36/2*f)&&(Math.abs(u.dot(l))>.44999999999999996/2*f||(a=t,o=d))}),a},q=-1,Ge=(e,t=0)=>{z.add(()=>{d.to(I,{spin:e,duration:e>0?1.6:.5,delay:t,ease:`sine.inOut`,overwrite:`auto`,onUpdate:$})})},J=(e,t)=>{e<0||z.add(()=>{d.to(L[e],{value:t,duration:t>0?.35:.45,ease:t>0?`power2.out`:`power2.inOut`,overwrite:`auto`,onUpdate:$})})},Ke=e=>{let t=ie.has(e)?e:-1;t!==q&&(q>=0&&q!==R.slot&&J(q,0),q=t,q>=0&&J(q,1),i.setAttribute(V,q>=0?`card`:`globe`),R.slot<0&&Ge(q>=0?0:1,q>=0?0:.4))},qe=e=>{if(!S)return;let t=e?.closest?.(`[data-globe-card]`),n=c.findIndex(e=>e.link===t);if(n<0)return;let r=ne[n];R.slot>=0&&R.slot!==r&&R.slot!==q&&J(R.slot,0),R.slot=r,j.uFocus.value=r;let i=c[n].link.matches(`:focus-visible`),a=_e(k[r]),o=a.yaw+2*Math.PI*Math.round((I.yaw-a.yaw)/(2*Math.PI));z.add(()=>{d.to(R,{amount:+!!i,duration:.3,overwrite:`auto`,onUpdate:$}),d.to(I,{yaw:o,pitch:U(a.pitch,-.7,Oe),duration:.8,ease:`power2.inOut`,overwrite:`auto`,onUpdate:$}),d.to(I,{spin:0,duration:.3,overwrite:!1,onUpdate:$})}),J(r,1)},Je=e=>qe(e.target),Ye=e=>{R.slot<0||e.relatedTarget?.closest?.(`[data-globe-card]`)||(R.slot!==q&&J(R.slot,0),R.slot=-1,z.add(()=>{d.to(R,{amount:0,duration:.25,overwrite:`auto`,onUpdate:$,onComplete:()=>void(j.uFocus.value=-1)})}),Ge(1,.4))},Y=null,Xe=e=>{i.setAttribute(V,`globe`);let t=Y?.samples??[],n=performance.now(),r=t.filter(e=>n-e.t<100),a=0,o=0;if(e&&r.length>=2){let e=r[0],t=r[r.length-1],n=Math.max((t.t-e.t)/1e3,.016);a=(t.yaw-e.yaw)/n,o=(t.pitch-e.pitch)/n}let s=Math.hypot(a,o);z.add(()=>{s>.05&&d.to(I,{yaw:I.yaw+a*.45,pitch:U(I.pitch+o*.45,-.7,Oe),duration:U(.6+s*.25,.6,2.2),ease:`power3.out`,overwrite:`auto`,onUpdate:$})}),Ge(1,s>.05?1.2:.6)},Ze=e=>{if(!S||Y){Y&&e.pointerId!==Y.id&&(Y.dragging&&Xe(!1),Y=null);return}(e.pointerType!==`mouse`||e.button===0)&&(Y={id:e.pointerId,type:e.pointerType,startX:e.clientX,startY:e.clientY,lastX:e.clientX,lastY:e.clientY,dragging:!1,samples:[]})},Qe=e=>{if(!S)return;if(!Y){f.finePointer&&e.pointerType===`mouse`&&Ke(We(e.clientX,e.clientY));return}if(e.pointerId!==Y.id)return;let t=Y.type===`touch`,n=e.clientX-Y.startX,r=e.clientY-Y.startY;if(!Y.dragging){if(Math.hypot(n,r)<(t?Pe.touch:Pe.mouse))return;if(t&&Math.abs(r)>Math.abs(n)){Y=null;return}Y.dragging=!0;try{i.setPointerCapture(Y.id)}catch{}d.killTweensOf(I,`yaw,pitch,spin`),I.spin=0,q>=0&&Ke(-1),i.setAttribute(V,`drag`)}let a=e.clientX-Y.lastX,o=e.clientY-Y.lastY;Y.lastX=e.clientX,Y.lastY=e.clientY,I.yaw+=a/He,t||(I.pitch=U(I.pitch+o/He,-.7,Oe));let s=performance.now();Y.samples.push({t:s,yaw:I.yaw,pitch:I.pitch}),Y.samples.length>12&&Y.samples.shift(),$()},$e=e=>{if(!Y||e.pointerId!==Y.id)return;let t=Y.dragging;if(t)Xe(!0);else if(S){let t=We(e.clientX,e.clientY),n=ie.get(t);n!==void 0&&f.navigate(c[n].slug)}Y=null,t&&f.finePointer&&e.pointerType===`mouse`&&Ke(We(e.clientX,e.clientY))},et=e=>{!Y||e.pointerId!==Y.id||(Y.dragging&&Xe(!0),Y=null)},tt=e=>{e.pointerType===`mouse`&&!Y&&Ke(-1)},X=0,nt=0,rt=0,it=[],at=()=>{if(v===`high`){v=`balanced`,j.uGrain.value=0,f.onDegrade(`balanced`),G();return}f.onDegrade(`static`),F()},ot=(e,t)=>{if(!t){X=0;return}if(X&&(nt+=e-X,rt+=1,it.push(e-X)),X=e,nt<ze)return;let n=rt*1e3/nt,r=y?Ie:Fe[v],i=[...it].sort((e,t)=>e-t),a=i[Math.floor(i.length*.05)]||16.7,o=Math.min(Re[1],Math.max(Re[0],1e3/a)),s=r??o,c=r?Le.capped:Le.free;it=[],nt=0,rt=0,n<s*c&&at()},Z=0,Q=0,st=e(),ct=!0,lt=!0,ut=()=>I.spin>0||Y?.dragging===!0||d.isTweening(I)||d.isTweening(R)||L.some(e=>d.isTweening(e))||B!==+!!me()||!j.uBg.value.equals(W),dt=e=>{if(Z=0,b||x||!N||!P)return;if((v===`soft`||y&&!Y?.dragging)&&!st.ready(e)){Z=requestAnimationFrame(dt);return}let t=Q?Math.min(e-Q,100):16.7;Q=e,Y?.dragging||(I.yaw+=De*I.spin*t/1e3);let n=+!!me(),r=1-Math.exp(-t/Be);B!==n&&(B+=(n-B)*r,Math.abs(n-B)<.002&&(B=n),j.uNight.value=B);let i=j.uBg.value;i.equals(W)||(i.lerp(W,r),Math.abs(i.r-W.r)+Math.abs(i.g-W.g)+Math.abs(i.b-W.b)<.003&&i.copy(W)),O.rotation.set(I.pitch,I.yaw,0),O.scale.setScalar(I.scale);for(let e=0;e<_;e+=1)j.uLift.value[e]=L[e].value;j.uFocusAmount.value=R.amount,N.render(E,D),lt=!1;let a=ut();ot(e,a&&!Y?.dragging),a&&ct&&!document.hidden?Z=requestAnimationFrame(dt):(Q=0,st.reset())};function $(){if(Z||b||x||!ct||document.hidden||!N||!P){lt=!0;return}Z=requestAnimationFrame(dt)}let ft=()=>{document.hidden?(Z&&cancelAnimationFrame(Z),Z=0,Q=0,st.reset(),X=0):(lt||ut())&&$()},pt=new IntersectionObserver(e=>{ct=e.some(e=>e.isIntersecting),ct?$():(Z&&cancelAnimationFrame(Z),Z=0,Q=0,st.reset(),X=0)});pt.observe(i),document.addEventListener(`visibilitychange`,ft);let mt=new ResizeObserver(G);mt.observe(i),window.addEventListener(`resize`,G);let ht=()=>{Ve(),$()},gt=new MutationObserver(ht);gt.observe(document.documentElement,{attributes:!0,attributeFilter:[`class`]}),ue.addEventListener(`change`,ht);let _t=e=>{e.preventDefault(),F()};return m.addEventListener(`webglcontextlost`,_t),i.addEventListener(`pointerdown`,Ze),i.addEventListener(`pointermove`,Qe),i.addEventListener(`pointerup`,$e),i.addEventListener(`pointercancel`,et),i.addEventListener(`pointerleave`,tt),i.addEventListener(`focusin`,Je),i.addEventListener(`focusout`,Ye),(async()=>{if(await H(),b)return;try{let e=f.tier===`soft`;N=new l({canvas:m,context:g,alpha:!0,antialias:!e,premultipliedAlpha:!0,failIfMajorPerformanceCaveat:!e})}catch{F();return}N.debug.onShaderError=()=>F(),N.setClearColor(0,0),G();let e=await se(c,Se[v],async()=>(await H(),!b),()=>{b||!j.uAtlas.value||(j.uAtlas.value.needsUpdate=!0,$())});if(b||!N)return;if(!e){F();return}let n=w(new t(e.canvas));n.colorSpace=p,n.anisotropy=v===`soft`?1:Math.min(8,N.capabilities.getMaxAnisotropy()),n.needsUpdate=!0,j.uAtlas.value=n;let r=k.map((t,n)=>{let r=ie.get(n);return r===void 0?{kind:`wash`}:{kind:e.kinds[r],rect:e.rects[r]}});if(await H(),b)return;let a=w(ve(k,r,Ce[v]));P=new s(a,ae),O.add(P),await H(),!(b||!N)&&(N.initTexture(n),await H(),!(b||!N)&&(await N.compileAsync(E,D),!(b||x)&&(O.rotation.set(I.pitch,I.yaw,0),O.scale.setScalar(I.scale),N.render(E,D),S=!0,i.setAttribute(be,`live`),i.setAttribute(V,`globe`),f.onReady(),z.add(()=>{d.to(I,{yaw:A,scale:1,duration:1.6,ease:`power2.out`,onUpdate:$})}),Ge(1,1.4),document.activeElement&&i.contains(document.activeElement)&&qe(document.activeElement),$())))})().catch(()=>F()),()=>{if(!b){if(b=!0,S=!1,Z&&cancelAnimationFrame(Z),Z=0,pt.disconnect(),document.removeEventListener(`visibilitychange`,ft),mt.disconnect(),gt.disconnect(),window.removeEventListener(`resize`,G),ue.removeEventListener(`change`,ht),m.removeEventListener(`webglcontextlost`,_t),i.removeEventListener(`pointerdown`,Ze),i.removeEventListener(`pointermove`,Qe),i.removeEventListener(`pointerup`,$e),i.removeEventListener(`pointercancel`,et),i.removeEventListener(`pointerleave`,tt),i.removeEventListener(`focusin`,Je),i.removeEventListener(`focusout`,Ye),Y){try{i.releasePointerCapture(Y.id)}catch{}Y=null}z.revert(),d.killTweensOf([I,R,...L]),i.removeAttribute(V),m.remove();for(let e of C)e.dispose();N?(N.dispose(),g.isContextLost()||N.forceContextLoss()):g.isContextLost()||g.getExtension(`WEBGL_lose_context`)?.loseContext()}}}export{W as mountNotesGlobe};