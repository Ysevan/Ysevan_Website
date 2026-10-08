import{S as e,T as t,_ as n,a as r,b as i,f as a,g as o,h as s,n as ee,o as c,p as l,t as u,v as d,w as f,y as p}from"./gsap-Xjoobghy.js";var m=.015,h=`
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
`,g=`
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

  /* 纸纹与起伏的光：同 plate-depth（画自己的亮度梯度 + 深度梯度），这里光的方向固定，强度从 0 慢慢给到 */
  float gx = lum(texture2D(uMap, uv + vec2(uTexel.x, 0.0)).rgb) - lum(texture2D(uMap, uv - vec2(uTexel.x, 0.0)).rgb);
  float gy = lum(texture2D(uMap, uv + vec2(0.0, uTexel.y)).rgb) - lum(texture2D(uMap, uv - vec2(0.0, uTexel.y)).rgb);
  float dx = texture2D(uDepth, uv + vec2(uDepthTexel.x, 0.0)).r - texture2D(uDepth, uv - vec2(uDepthTexel.x, 0.0)).r;
  float dy = texture2D(uDepth, uv + vec2(0.0, uDepthTexel.y)).r - texture2D(uDepth, uv - vec2(0.0, uDepthTexel.y)).r;
  float grain = (gx * uLightDir.x + gy * uLightDir.y) * 1.3;
  float relief = (dx * uLightDir.x + dy * uLightDir.y) * 1.1;
  vec3 lit = day * (1.0 + (grain + relief) * uLight * (1.0 - uNight * 0.5));

  /* 入夜：plate-depth 的配方原样——压暗偏冷，G 通道的灯发暖光，8 秒一次极缓的呼吸 */
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
`;function _(){return{uNight:{value:0},uTime:{value:0},uPaper:{value:new t(.973,.965,.945)}}}function v(t,n,r=1){let i=new e(t);return i.flipY=!1,i.generateMipmaps=n,i.minFilter=n?l:a,i.magFilter=a,i.anisotropy=r,i.needsUpdate=!0,i}function y(e){let t=e;return[t.naturalWidth||t.width,t.naturalHeight||t.height]}function b(e,t,n,r,a,o){let s={uMap:{value:e},uDepth:{value:t},uDepthSize:{value:new f(r[0],r[1])},uTexel:{value:new f(1/n[0],1/n[1])},uDepthTexel:{value:new f(1/r[0],1/r[1])},uRelief:{value:0},uPop:{value:0},uOrder:{value:0},uLight:{value:0},uLightDir:{value:new f(.6,-.8)},uNight:a.uNight,uGlow:{value:1},uTime:a.uTime,uPaper:a.uPaper,uEdge:{value:o}};return{material:new i({vertexShader:h,fragmentShader:g,uniforms:s}),uniforms:s}}var x=`
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
   * 洇到多远：按「从洇开的那一点到画面最远的那个角」折算，uGrow = 1 时正好盖满，早一点都不满。
   * 写死一个常数（原来是 4.8，按中心可能偏到 ±0.9 的最坏情形定）的话，中心在正中时半途就盖满了，
   * 后半段白白盯着一屏纸（2026-09-20）。
   */
  float far = length((abs(uCenter) + 1.0) * uAspect) * 1.01;
  float reach = uGrow * far / 0.72;
  float body = 1.0 - smoothstep(reach * 0.72, reach, r);
  float rim = smoothstep(reach * 0.55, reach * 0.84, r) * (1.0 - smoothstep(reach * 0.84, reach, r));
  vec3 c = mix(uPaper, uRim, rim * 0.16);
  gl_FragColor = vec4(c, body * (1.0 - uFade));
}
`;function C(e){let n={uGrow:{value:0},uFade:{value:0},uAspect:{value:new f(1,1)},uCenter:{value:new f(0,0)},uPaper:e.uPaper,uRim:{value:new t(.545,.549,.427)}};return{material:new i({vertexShader:x,fragmentShader:S,uniforms:n,transparent:!0,depthTest:!1,depthWrite:!1}),uniforms:n}}var w=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,T=`
uniform float uNight;
varying vec2 vUv;
void main() {
  float r = length(vUv * 2.0 - 1.0);
  float a = 0.2 * pow(1.0 - smoothstep(0.0, 1.0, r), 1.8);
  vec3 c = mix(vec3(0.290, 0.302, 0.208), vec3(0.02, 0.02, 0.03), uNight);
  gl_FragColor = vec4(c, a * (1.0 + uNight * 0.6));
}
`;function te(e){return new i({vertexShader:w,fragmentShader:T,uniforms:{uNight:e.uNight},transparent:!0,depthWrite:!1,side:2})}var E=38,D=1,O=.45,k=1.18,A=Math.tan(40*Math.PI/360);function j(e,n,r){let i=new t(Math.cos(n),0,-Math.sin(n)),a=[];for(let n of[-.5,.5])for(let o of[-.5,.5])a.push(e.clone().addScaledVector(i,n*r).add(new t(0,o*D,0)));return a}function M(e,t,n){let r=r=>t.every(t=>{let i=r-t.z;if(i<=.01)return!1;let a=t.x/(i*A*e),o=(t.y-n)/(i*A);return Math.abs(a)<=.9299999999999999&&Math.abs(o)<=.9299999999999999}),i=.3,a=12;for(let e=0;e<40;e+=1){let e=(i+a)/2;r(e)?a=e:i=e}return a}function N(e,n,i){let a=e.width/e.height,{cover:o}=e,s=o.h,ee=e.height/(s*2*A),c=new t(-(o.x+o.w/2-e.width/2)/s,(o.y+o.h/2-e.height/2)/s,ee),l=o.w/o.h,u=new t((n.door.u-.5)*l,.5-n.door.v,n.doorDepth*n.relief),d=E*Math.PI/180,f=D*i.leftAspect,p=D*i.rightAspect,m=new t(-Math.cos(d)*f*.5,0,Math.sin(d)*f*.5),h=new t(Math.cos(d)*p*.5,0,Math.sin(d)*p*.5),g=-.04,_=-(M(a,[...j(m,d,f),...j(h,-d,p)],g)+O),v=new t(0,0,_),y={corner:v,left:{center:m.clone().add(v),yaw:d,width:f},right:{center:h.clone().add(v),yaw:-d,width:p},floorY:-1/2},b=new t(0,g,-.45),x=new t(c.x+(u.x-c.x)*.6,c.y+(u.y-c.y)*.6,u.z+(c.z-u.z)*.38),S=new t(u.x*.45,u.y*.45+g*.55,u.z+(b.z-u.z)*.45),C=new r([c,x,u,S,b],!1,`centripetal`),w=C.getLengths(400),T=w[200]/w[400],te=c.z/k,N=0,P=T;for(let e=0;e<24;e+=1){let e=(N+P)/2;C.getPointAt(e).z>te?N=e:P=e}return{curve:C,doorFraction:T,creepFraction:P,door:u,room:y}}var P=e=>e<=0?0:e>=1?1:e*e*(3-2*e),F=.32,I=.08;function ne(e,t,n,r){let i=u.timeline({paused:!0,defaults:{ease:`none`}}),a=(e,t,n,a=P)=>{i.fromTo(r,{[e]:0},{[e]:1,duration:n-t,ease:a,immediateRender:!1},t)},o=t+(1-t)*F;return a(`creep`,e.take,e.wash,`none`),a(`blind`,e.wash,e.arrive,`none`),a(`walk`,e.arrive,e.settle,`sine.out`),a(`depth`,e.take,e.wash),a(`grow`,e.take,e.wash,`power1.in`),a(`fade`,e.arrive,e.arrive+I,`power1.out`),i.duration()<1&&i.set({},{},1),{timeline:i,arriveFraction:o,creepFraction:n}}var re=`data-hall-walk-state`,ie=.08,ae=.1,oe=.02,se=.5,ce=.05,le=280,ue={soft:30},de={capped:.6,free:.55},fe=[30,120],pe=3e3,me=200,he=29;function L(){return new Promise(e=>{typeof window.requestIdleCallback==`function`?window.requestIdleCallback(()=>e(),{timeout:300}):window.setTimeout(e,16)})}async function R(e){return await Promise.race([e.decode().catch(()=>void 0),new Promise(e=>window.setTimeout(e,300))]),e}var ge=-.2;function z(e){let{canvas:r,context:i}=e,a=!1,l=!1,f=!1,h=!1,g=e.detail,x=1/0,S=e.view,w=()=>Math.min(S.density,x),T=[],E=e=>(T.push(e),e);r.setAttribute(`aria-hidden`,`true`),Object.assign(r.style,{position:`fixed`,inset:`0`,width:`100%`,height:`100%`,zIndex:`20`,display:`block`,pointerEvents:`none`,visibility:`hidden`}),document.body.appendChild(r);let D=()=>{a||l||(l=!0,window.setTimeout(()=>e.onFail(),0))},O=e=>{e.preventDefault(),D()};r.addEventListener(`webglcontextlost`,O);let k=null,A=null,j=null,M=_(),P={creep:0,blind:0,walk:0,depth:0,grow:0,fade:0},F=1,I=0,z=null,B=null,V=null,H=null,U=null,W=null,G=null,K=null,q=null,J=null,_e=(()=>{let[t,n]=y(e.plate.image);return t/n})(),ve=y(e.shelf.image),ye=y(e.board.image),be=window.matchMedia(`(prefers-color-scheme: dark)`),xe=()=>{let e=document.documentElement.classList;return e.contains(`dark`)?!0:!e.contains(`light`)&&be.matches},Y=+!!xe(),Se=()=>{let e=getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g);if(!e||e.length<3)return;let[t,n,r]=[Number(e[0])/255,Number(e[1])/255,Number(e[2])/255];M.uPaper.value.set(t,n,r),V?.setClearColor(Ce.setRGB(t,n,r,d),1)},Ce=new c,we=t=>{if(S=t,!V||!A||!j)return;V.setPixelRatio(w()),V.setSize(S.width,S.height,!1),A.aspect=S.width/S.height,A.updateProjectionMatrix(),B=N(S,{door:e.plate.door,doorDepth:ge,relief:ie},{leftAspect:ve[0]/ve[1],rightAspect:ye[0]/ye[1]});let{room:n}=B;H&&(H.scale.x=S.cover.w/S.cover.h/_e),W&&G&&K&&(W.position.copy(n.left.center),W.rotation.set(0,n.left.yaw,0),G.position.copy(n.right.center),G.rotation.set(0,n.right.yaw,0),K.position.set(0,n.floorY-.002,n.corner.z+.28)),J?.uAspect.value.set(A.aspect,1),z?.kill(),j.add(()=>{let t=ne(e.beats,B.doorFraction,B.creepFraction,P);z=t.timeline,F=t.arriveFraction,I=t.creepFraction}),X=NaN},X=NaN,Te=0,Ee=0,Z=new t,De=t=>{if(!A||!z||!B||!H||!U||!W||!G||!K||!q||!J)return;z.progress(t);let n=Math.min(1,Math.max(0,I*P.creep+(F-I)*P.blind+(1-F)*P.walk));A.position.copy(B.curve.getPointAt(n)),A.updateMatrixWorld();let r=n>=B.doorFraction;H.visible=!r&&P.grow<.999,W.visible=r,G.visible=r,K.visible=r;let i=P.depth,a=e.plate.mode===`flat`;U.uPop.value=a?0:m*(1-i),U.uOrder.value=a?0:oe*(1-i),U.uRelief.value=ie*i,U.uLight.value=se*i,U.uNight.value=a?Y*i:Y;let o=P.grow>0&&P.fade<1;q.visible=o,o&&(Z.copy(B.door).project(A),Z.z<1&&Number.isFinite(Z.x)&&J.uCenter.value.set(Math.max(-.9,Math.min(.9,Z.x)),Math.max(-.9,Math.min(.9,Z.y))),J.uGrow.value=P.grow,J.uFade.value=P.fade)},Q=0,$=0,Oe=0,ke=[],Ae=t=>{if(Q){let e=t-Q;e<me&&($+=e,Oe+=1,ke.push(e))}if(Q=t,$<pe)return;let n=Oe*1e3/$,r=ue[g],i=[...ke].sort((e,t)=>e-t),a=i[Math.floor(i.length*.05)]||16.7,o=Math.min(fe[1],Math.max(fe[0],1e3/a)),s=r??o,ee=r?de.capped:de.free;ke=[],$=0,Oe=0,!(n>=s*ee)&&(g===`high`?(g=`balanced`,x=1,e.onDegrade(`balanced`),we(S)):e.onDegrade(`static`))},je=(e,t)=>{if(!f||a||l||!V||!k||!A)return!1;let n=Te?Math.min(t-Te,100):16.7;Te=t;let r=+!!xe();if(!h)return Y!==r&&(Y=r,M.uNight.value=Y,Se()),!1;let i=Math.abs(r-Y)>.002;Y=i?Y+(r-Y)*(1-Math.exp(-n/le)):r,M.uNight.value=Y,M.uTime.value=performance.now()/1e3;let o=g!==`soft`&&Y>.001;return e===X&&!o&&!i?!1:g===`soft`&&t-Ee<he||(Ee=t,i&&Se(),De(e),V.render(k,A),X=e,Ae(t),o||i)},Me=e=>{e!==h&&(h=e&&f,r.style.visibility=h?`visible`:`hidden`,h?r.setAttribute(re,`live`):f&&r.setAttribute(re,`ready`),X=NaN,Q=0)};(async()=>{if(await L(),a||(k=new p,A=new o(40,1,.004,30),await L(),a)||(j=u.context(()=>{}),await L(),a))return;try{let t=e.detail===`soft`;V=new ee({canvas:r,context:i,alpha:!1,antialias:!t,failIfMajorPerformanceCaveat:!t})}catch{D();return}V.debug.onShaderError=()=>D(),V.setPixelRatio(w()),Se();let t=g===`soft`?1:Math.min(8,V.capabilities.getMaxAnisotropy()),c=await Promise.all([R(e.plate.image),R(e.plate.depth),R(e.shelf.image),R(e.shelf.depth),R(e.board.image),R(e.board.depth)]);if(a)return;let[d,m,h,_,x,T]=c,O=[E(v(d,!1)),E(v(m,!1)),E(v(h,!0,t)),E(v(_,!1)),E(v(x,!0,t)),E(v(T,!1))];for(let e of O){if(await L(),a||!V)return;V.initTexture(e)}if(await L(),a)return;let N=b(O[0],O[1],y(d),y(m),M,0);U=N.uniforms;let P=g===`soft`?[48,68]:[144,204];if(H=new s(E(new n(_e,1,P[0],P[1])),E(N.material)),await L(),a||!k||!A)return;let F=g===`high`?[96,136]:g===`soft`?[30,42]:[60,85],I=(e,t,r,i)=>{let a=b(e,t,r,y(i),M,ce);return a.uniforms.uRelief.value=ae,a.uniforms.uLight.value=se,new s(E(new n(r[0]/r[1],1,F[0],F[1])),E(a.material))};W=I(O[2],O[3],ve,_),G=I(O[4],O[5],ye,T),K=new s(E(new n(2.2,1.1)),E(te(M))),K.rotation.x=-Math.PI/2,K.renderOrder=-1;let ne=C(M);if(J=ne.uniforms,q=new s(E(new n(2,2)),E(ne.material)),q.frustumCulled=!1,q.renderOrder=10,k.add(H,W,G,K,q),await L(),!a&&(we(S),await L(),!(a||!V||!k||!A)&&(await V.compileAsync(k,A),!(a||l)&&(await L(),!(a||l||!V||!k||!A))))){De(e.beats.take);for(let e of[H,W,G,K])e.visible=!0;V.render(k,A),De(e.beats.take),f=!0,r.setAttribute(re,`ready`),e.onReady()}})().catch(()=>D());let Ne=new MutationObserver(()=>{X=NaN});return Ne.observe(document.documentElement,{attributes:!0,attributeFilter:[`class`]}),{layout:we,render:je,setLive:Me,resize:(e,t)=>{!V||!k||!A||a||l||!f||(S={...S,density:e},V.setPixelRatio(w()),V.setSize(S.width,S.height,!1),!(!t||!h)&&(V.render(k,A),Q=0))},release(){if(!a){a=!0,Ne.disconnect(),r.removeEventListener(`webglcontextlost`,O),z?.kill(),j?.revert(),r.remove();for(let e of T)e.dispose();V?(V.dispose(),i.isContextLost()||V.forceContextLoss()):i.isContextLost()||i.getExtension(`WEBGL_lose_context`)?.loseContext()}}}}export{z as mountHallWalk};