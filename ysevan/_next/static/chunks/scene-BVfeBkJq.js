import{t as e}from"./frame-pacer-C2fpi5-G.js";import{S as t,T as n,_ as r,a as i,b as a,f as o,g as s,h as c,n as l,o as u,p as d,t as f,v as p,w as m,y as ee}from"./gsap-Xjoobghy.js";var h=.015,g=`
uniform sampler2D uDepth;
uniform vec2 uDepthSize;
uniform float uRelief;
uniform float uPop;
uniform float uOrder;
varying vec2 vUv;
void main() {
  vUv = vec2(uv.x, 1.0 - uv.y);
  vec2 s = (vUv * (uDepthSize - 1.0) + 0.5) / uDepthSize;
  float d = texture2D(uDepth, s).r - 0.5;
  vec3 p = position;
  p.xy *= 1.0 + 2.0 * d * uPop;
  p.z += d * uRelief;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  /* 模仿 plate-depth 的那段时间里几何是平的，靠这一点偏移让近处盖住远处 */
  gl_Position.z -= d * uOrder * gl_Position.w;
}
`,_=`
uniform sampler2D uMap;
uniform sampler2D uDepth;
uniform vec2 uTexel;
uniform vec2 uDepthTexel;
uniform float uLight;
uniform vec2 uLightDir;
uniform float uNight;
uniform float uGlow;
uniform float uTime;
uniform vec3 uPaper;
uniform float uEdge;
varying vec2 vUv;

float lum(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

void main() {
  vec2 uv = vUv;
  vec3 day = texture2D(uMap, uv).rgb;

  /* 纸纹与起伏的光：同 plate-depth（画自己的亮度梯度 + 深度梯度），这里光的方向固定，强度从0慢慢给到 */
  float gx = lum(texture2D(uMap, uv + vec2(uTexel.x, 0.0)).rgb) - lum(texture2D(uMap, uv - vec2(uTexel.x, 0.0)).rgb);
  float gy = lum(texture2D(uMap, uv + vec2(0.0, uTexel.y)).rgb) - lum(texture2D(uMap, uv - vec2(0.0, uTexel.y)).rgb);
  float dx = texture2D(uDepth, uv + vec2(uDepthTexel.x, 0.0)).r - texture2D(uDepth, uv - vec2(uDepthTexel.x, 0.0)).r;
  float dy = texture2D(uDepth, uv + vec2(0.0, uDepthTexel.y)).r - texture2D(uDepth, uv - vec2(0.0, uDepthTexel.y)).r;
  float grain = (gx * uLightDir.x + gy * uLightDir.y) * 1.3;
  float relief = (dx * uLightDir.x + dy * uLightDir.y) * 1.1;
  vec3 lit = day * (1.0 + (grain + relief) * uLight * (1.0 - uNight * 0.5));

  /* 入夜：plate-depth 的配方原样——压暗偏冷，G 通道的灯发暖光，8秒一次极缓的呼吸 */
  float glow = texture2D(uDepth, uv).g * uGlow;
  float breath = 1.0 + 0.05 * sin(uTime * 0.785);
  vec3 dusk = lit * vec3(0.56, 0.60, 0.72);
  vec3 warm = vec3(1.0, 0.80, 0.52);
  vec3 night = dusk + lit * warm * (glow * 1.45 * breath) + warm * glow * glow * 0.20 * breath;
  vec3 col = mix(lit, night, uNight);

  /* 屋里的两面墙：纸边化进纸底，贴边一道极淡的颜料边。门厅那幅不走这里（uEdge = 0） */
  if (uEdge > 0.0) {
    float edge = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
    float keep = smoothstep(0.0, uEdge, edge);
    float rim = smoothstep(uEdge * 0.35, uEdge, edge) * (1.0 - smoothstep(uEdge, uEdge * 1.8, edge));
    col *= 1.0 - rim * 0.045;
    col = mix(uPaper, col, keep);
  }

  gl_FragColor = vec4(col, 1.0);
}
`;function v(){return{uNight:{value:0},uTime:{value:0},uPaper:{value:new n(.973,.965,.945)}}}function y(e,n,r=1){let i=new t(e);return i.flipY=!1,i.generateMipmaps=n,i.minFilter=n?d:o,i.magFilter=o,i.anisotropy=r,i.needsUpdate=!0,i}function b(e){let t=e;return[t.naturalWidth||t.width,t.naturalHeight||t.height]}function te(e,t,n,r,i,o){let s={uMap:{value:e},uDepth:{value:t},uDepthSize:{value:new m(r[0],r[1])},uTexel:{value:new m(1/n[0],1/n[1])},uDepthTexel:{value:new m(1/r[0],1/r[1])},uRelief:{value:0},uPop:{value:0},uOrder:{value:0},uLight:{value:0},uLightDir:{value:new m(.6,-.8)},uNight:i.uNight,uGlow:{value:1},uTime:i.uTime,uPaper:i.uPaper,uEdge:{value:o}};return{material:new a({vertexShader:g,fragmentShader:_,uniforms:s}),uniforms:s}}var x=`
varying vec2 vNdc;
void main() {
  vNdc = position.xy;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`,S=`
uniform float uGrow;
uniform float uFade;
uniform vec2 uAspect;
uniform vec2 uCenter;
uniform vec3 uPaper;
uniform vec3 uRim;
varying vec2 vNdc;
void main() {
  float r = length((vNdc - uCenter) * uAspect);
  /*
   * 洇到多远：按「从洇开的那一点到画面最远的那个角」折算，uGrow = 1时正好盖满，早一点都不满。
   * 写死一个常数（原来是4.8，按中心可能偏到±0.9的最坏情形定）的话，中心在正中时半途就盖满了，
   * 后半段白白盯着一屏纸（2026-09-20）。
   */
  float far = length((abs(uCenter) + 1.0) * uAspect) * 1.01;
  float reach = uGrow * far / 0.72;
  float body = 1.0 - smoothstep(reach * 0.72, reach, r);
  float rim = smoothstep(reach * 0.55, reach * 0.84, r) * (1.0 - smoothstep(reach * 0.84, reach, r));
  vec3 c = mix(uPaper, uRim, rim * 0.16);
  gl_FragColor = vec4(c, body * (1.0 - uFade));
}
`;function ne(e){let t={uGrow:{value:0},uFade:{value:0},uAspect:{value:new m(1,1)},uCenter:{value:new m(0,0)},uPaper:e.uPaper,uRim:{value:new n(.545,.549,.427)}};return{material:new a({vertexShader:x,fragmentShader:S,uniforms:t,transparent:!0,depthTest:!1,depthWrite:!1}),uniforms:t}}var C=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,w=`
uniform float uNight;
varying vec2 vUv;
void main() {
  float r = length(vUv * 2.0 - 1.0);
  float a = 0.2 * pow(1.0 - smoothstep(0.0, 1.0, r), 1.8);
  vec3 c = mix(vec3(0.290, 0.302, 0.208), vec3(0.02, 0.02, 0.03), uNight);
  gl_FragColor = vec4(c, a * (1.0 + uNight * 0.6));
}
`;function T(e){return new a({vertexShader:C,fragmentShader:w,uniforms:{uNight:e.uNight},transparent:!0,depthWrite:!1,side:2})}var E=38,D=1,O=.45,k=1.18,A=Math.tan(40*Math.PI/360);function j(e,t,r){let i=new n(Math.cos(t),0,-Math.sin(t)),a=[];for(let t of[-.5,.5])for(let o of[-.5,.5])a.push(e.clone().addScaledVector(i,t*r).add(new n(0,o*D,0)));return a}function M(e,t,n){let r=r=>t.every(t=>{let i=r-t.z;if(i<=.01)return!1;let a=t.x/(i*A*e),o=(t.y-n)/(i*A);return Math.abs(a)<=.9299999999999999&&Math.abs(o)<=.9299999999999999}),i=.3,a=12;for(let e=0;e<40;e+=1){let e=(i+a)/2;r(e)?a=e:i=e}return a}function N(e,t,r){let a=e.width/e.height,{cover:o}=e,s=o.h,c=e.height/(s*2*A),l=new n(-(o.x+o.w/2-e.width/2)/s,(o.y+o.h/2-e.height/2)/s,c),u=o.w/o.h,d=new n((t.door.u-.5)*u,.5-t.door.v,t.doorDepth*t.relief),f=E*Math.PI/180,p=D*r.leftAspect,m=D*r.rightAspect,ee=new n(-Math.cos(f)*p*.5,0,Math.sin(f)*p*.5),h=new n(Math.cos(f)*m*.5,0,Math.sin(f)*m*.5),g=-.04,_=-(M(a,[...j(ee,f,p),...j(h,-f,m)],g)+O),v=new n(0,0,_),y={corner:v,left:{center:ee.clone().add(v),yaw:f,width:p},right:{center:h.clone().add(v),yaw:-f,width:m},floorY:-1/2},b=new n(0,g,-.45),te=new n(l.x+(d.x-l.x)*.6,l.y+(d.y-l.y)*.6,d.z+(l.z-d.z)*.38),x=new n(d.x*.45,d.y*.45+g*.55,d.z+(b.z-d.z)*.45),S=new i([l,te,d,x,b],!1,`centripetal`),ne=S.getLengths(400),C=ne[200]/ne[400],w=l.z/k,T=0,N=C;for(let e=0;e<24;e+=1){let e=(T+N)/2;S.getPointAt(e).z>w?T=e:N=e}return{curve:S,doorFraction:C,creepFraction:N,door:d,room:y}}var P=e=>e<=0?0:e>=1?1:e*e*(3-2*e),F=.32,I=.08;function re(e,t,n,r){let i=f.timeline({paused:!0,defaults:{ease:`none`}}),a=(e,t,n,a=P)=>{i.fromTo(r,{[e]:0},{[e]:1,duration:n-t,ease:a,immediateRender:!1},t)},o=t+(1-t)*F;return a(`creep`,e.take,e.wash,`none`),a(`blind`,e.wash,e.arrive,`none`),a(`walk`,e.arrive,e.settle,`sine.out`),a(`depth`,e.take,e.wash),a(`grow`,e.take,e.wash,`power1.in`),a(`fade`,e.arrive,e.arrive+I,`power1.out`),i.duration()<1&&i.set({},{},1),{timeline:i,arriveFraction:o,creepFraction:n}}var ie=`data-hall-walk-state`,ae=.08,oe=.1,se=.02,ce=.5,le=.05,ue=280,de={soft:30},fe={capped:.6,free:.55},pe=[30,120],me=3e3,he=200;function L(){return new Promise(e=>{typeof window.requestIdleCallback==`function`?window.requestIdleCallback(()=>e(),{timeout:300}):window.setTimeout(e,16)})}async function R(e){return await Promise.race([e.decode().catch(()=>void 0),new Promise(e=>window.setTimeout(e,300))]),e}var ge=-.2;function z(t){let{canvas:i,context:a}=t,o=!1,d=!1,m=!1,g=!1,_=t.detail,x=1/0,S=t.view,C=()=>Math.min(S.density,x),w=[],E=e=>(w.push(e),e);i.setAttribute(`aria-hidden`,`true`),Object.assign(i.style,{position:`fixed`,inset:`0`,width:`100%`,height:`100%`,zIndex:`20`,display:`block`,pointerEvents:`none`,visibility:`hidden`}),document.body.appendChild(i);let D=()=>{o||d||(d=!0,window.setTimeout(()=>t.onFail(),0))},O=e=>{e.preventDefault(),D()};i.addEventListener(`webglcontextlost`,O);let k=null,A=null,j=null,M=v(),P={creep:0,blind:0,walk:0,depth:0,grow:0,fade:0},F=1,I=0,z=null,B=null,V=null,H=null,U=null,W=null,G=null,K=null,q=null,J=null,_e=(()=>{let[e,n]=b(t.plate.image);return e/n})(),ve=b(t.shelf.image),ye=b(t.board.image),be=window.matchMedia(`(prefers-color-scheme: dark)`),xe=()=>{let e=document.documentElement.classList;return e.contains(`dark`)?!0:!e.contains(`light`)&&be.matches},Y=+!!xe(),Se=()=>{let e=getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g);if(!e||e.length<3)return;let[t,n,r]=[Number(e[0])/255,Number(e[1])/255,Number(e[2])/255];M.uPaper.value.set(t,n,r),V?.setClearColor(Ce.setRGB(t,n,r,p),1)},Ce=new u,we=e=>{if(S=e,!V||!A||!j)return;V.setPixelRatio(C()),V.setSize(S.width,S.height,!1),A.aspect=S.width/S.height,A.updateProjectionMatrix(),B=N(S,{door:t.plate.door,doorDepth:ge,relief:ae},{leftAspect:ve[0]/ve[1],rightAspect:ye[0]/ye[1]});let{room:n}=B;H&&(H.scale.x=S.cover.w/S.cover.h/_e),W&&G&&K&&(W.position.copy(n.left.center),W.rotation.set(0,n.left.yaw,0),G.position.copy(n.right.center),G.rotation.set(0,n.right.yaw,0),K.position.set(0,n.floorY-.002,n.corner.z+.28)),J?.uAspect.value.set(A.aspect,1),z?.kill(),j.add(()=>{let e=re(t.beats,B.doorFraction,B.creepFraction,P);z=e.timeline,F=e.arriveFraction,I=e.creepFraction}),X=NaN},X=NaN,Te=0,Ee=e(),Z=new n,De=e=>{if(!A||!z||!B||!H||!U||!W||!G||!K||!q||!J)return;z.progress(e);let n=Math.min(1,Math.max(0,I*P.creep+(F-I)*P.blind+(1-F)*P.walk));A.position.copy(B.curve.getPointAt(n)),A.updateMatrixWorld();let r=n>=B.doorFraction;H.visible=!r&&P.grow<.999,W.visible=r,G.visible=r,K.visible=r;let i=P.depth,a=t.plate.mode===`flat`;U.uPop.value=a?0:h*(1-i),U.uOrder.value=a?0:se*(1-i),U.uRelief.value=ae*i,U.uLight.value=ce*i,U.uNight.value=a?Y*i:Y;let o=P.grow>0&&P.fade<1;q.visible=o,o&&(Z.copy(B.door).project(A),Z.z<1&&Number.isFinite(Z.x)&&J.uCenter.value.set(Math.max(-.9,Math.min(.9,Z.x)),Math.max(-.9,Math.min(.9,Z.y))),J.uGrow.value=P.grow,J.uFade.value=P.fade)},Q=0,$=0,Oe=0,ke=[],Ae=e=>{if(Q){let t=e-Q;t<he&&($+=t,Oe+=1,ke.push(t))}if(Q=e,$<me)return;let n=Oe*1e3/$,r=de[_],i=[...ke].sort((e,t)=>e-t),a=i[Math.floor(i.length*.05)]||16.7,o=Math.min(pe[1],Math.max(pe[0],1e3/a)),s=r??o,c=r?fe.capped:fe.free;ke=[],$=0,Oe=0,!(n>=s*c)&&(_===`high`?(_=`balanced`,x=1,t.onDegrade(`balanced`),we(S)):t.onDegrade(`static`))},je=(e,t)=>{if(!m||o||d||!V||!k||!A)return!1;let n=Te?Math.min(t-Te,100):16.7;Te=t;let r=+!!xe();if(!g)return Y!==r&&(Y=r,M.uNight.value=Y,Se()),!1;let i=Math.abs(r-Y)>.002;Y=i?Y+(r-Y)*(1-Math.exp(-n/ue)):r,M.uNight.value=Y,M.uTime.value=performance.now()/1e3;let a=_!==`soft`&&Y>.001;return e===X&&!a&&!i?!1:_===`soft`&&!Ee.ready(t)||(i&&Se(),De(e),V.render(k,A),X=e,Ae(t),a||i)},Me=e=>{e!==g&&(g=e&&m,i.style.visibility=g?`visible`:`hidden`,g?i.setAttribute(ie,`live`):m&&i.setAttribute(ie,`ready`),X=NaN,Q=0)};(async()=>{if(await L(),o||(k=new ee,A=new s(40,1,.004,30),await L(),o)||(j=f.context(()=>{}),await L(),o))return;try{let e=t.detail===`soft`;V=new l({canvas:i,context:a,alpha:!1,antialias:!e,failIfMajorPerformanceCaveat:!e})}catch{D();return}V.debug.onShaderError=()=>D(),V.setPixelRatio(C()),Se();let e=_===`soft`?1:Math.min(8,V.capabilities.getMaxAnisotropy()),n=await Promise.all([R(t.plate.image),R(t.plate.depth),R(t.shelf.image),R(t.shelf.depth),R(t.board.image),R(t.board.depth)]);if(o)return;let[u,p,h,g,v,x]=n,w=[E(y(u,!1)),E(y(p,!1)),E(y(h,!0,e)),E(y(g,!1)),E(y(v,!0,e)),E(y(x,!1))];for(let e of w){if(await L(),o||!V)return;V.initTexture(e)}if(await L(),o)return;let O=te(w[0],w[1],b(u),b(p),M,0);U=O.uniforms;let N=_===`soft`?[48,68]:[144,204];if(H=new c(E(new r(_e,1,N[0],N[1])),E(O.material)),await L(),o||!k||!A)return;let P=_===`high`?[96,136]:_===`soft`?[30,42]:[60,85],F=(e,t,n,i)=>{let a=te(e,t,n,b(i),M,le);return a.uniforms.uRelief.value=oe,a.uniforms.uLight.value=ce,new c(E(new r(n[0]/n[1],1,P[0],P[1])),E(a.material))};W=F(w[2],w[3],ve,g),G=F(w[4],w[5],ye,x),K=new c(E(new r(2.2,1.1)),E(T(M))),K.rotation.x=-Math.PI/2,K.renderOrder=-1;let I=ne(M);if(J=I.uniforms,q=new c(E(new r(2,2)),E(I.material)),q.frustumCulled=!1,q.renderOrder=10,k.add(H,W,G,K,q),await L(),!o&&(we(S),await L(),!(o||!V||!k||!A)&&(await V.compileAsync(k,A),!(o||d)&&(await L(),!(o||d||!V||!k||!A))))){De(t.beats.take);for(let e of[H,W,G,K])e.visible=!0;V.render(k,A),De(t.beats.take),m=!0,i.setAttribute(ie,`ready`),t.onReady()}})().catch(()=>D());let Ne=new MutationObserver(()=>{X=NaN});return Ne.observe(document.documentElement,{attributes:!0,attributeFilter:[`class`]}),{layout:we,render:je,setLive:Me,resize:(e,t)=>{!V||!k||!A||o||d||!m||(S={...S,density:e},V.setPixelRatio(C()),V.setSize(S.width,S.height,!1),!(!t||!g)&&(V.render(k,A),Q=0))},release(){if(!o){o=!0,Ne.disconnect(),i.removeEventListener(`webglcontextlost`,O),z?.kill(),j?.revert(),i.remove();for(let e of w)e.dispose();V?(V.dispose(),a.isContextLost()||V.forceContextLoss()):a.isContextLost()||a.getExtension(`WEBGL_lose_context`)?.loseContext()}}}}export{z as mountHallWalk};