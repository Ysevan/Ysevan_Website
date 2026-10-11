import{t as e}from"./frame-pacer-C2fpi5-G.js";import{t}from"./base-path-eL8HHVK0.js";import{C as n,E as r,S as i,T as a,_ as o,b as s,c,d as l,g as u,h as d,l as f,m as p,n as m,o as h,r as g,s as _,t as v,v as y,w as b,x,y as ee}from"./gsap-Xjoobghy.js";var S=15e3;function C(e){return new Promise(t=>{let n=new Image,r=e=>{window.clearTimeout(i),t(e)},i=window.setTimeout(()=>r(null),S);n.addEventListener(`load`,()=>r(n.naturalWidth>0?n:null),{once:!0}),n.addEventListener(`error`,()=>r(null),{once:!0}),n.src=e})}async function te(e,t){let n=null,r=new AbortController,a=window.setTimeout(()=>r.abort(),S);try{if(typeof window.createImageBitmap==`function`){let t=await fetch(e,{mode:`same-origin`,signal:r.signal});t.ok&&(n=await window.createImageBitmap(await t.blob()))}else n=await C(e)}catch{n=null}finally{window.clearTimeout(a)}if(!n)return null;if(typeof ImageBitmap<`u`&&n instanceof ImageBitmap){let e=n;t({dispose:()=>e.close()})}let o=t(new i(n));return o.colorSpace=y,o.flipY=!1,o.needsUpdate=!0,o}var ne=.38,w=.31,T={side:.3,top:.3,bottom:.3},E=e=>e*e*(3-2*e),D=e=>e<0?0:e>1?1:e,O=(e,t,n)=>e+(t-e)*n,k=(e,t,n)=>E(D((e-t)/(n-t)));function A(){return v.timeline({paused:!0,defaults:{ease:`none`}})}function j(e,t,n,r,i,a=E){e.fromTo(t,{[n]:0},{[n]:1,duration:i-r,ease:a,immediateRender:!1},r)}var M=(e,t)=>e.enter+e.hold*t;function N(e,t,n){let r=n.enter+n.hold+n.exit;j(e,t,`enter`,0,n.enter),j(e,t,`exit`,n.enter+n.hold,r),e.duration()<r&&e.set({},{},r)}function P(e,t){return{uNight:{value:0},uGrain:{value:+!!e},uDpr:{value:t},uFade:{value:1},uFadeFlip:{value:0}}}var F=(()=>{let e=new h(`#6E8A93`),t=Math.max(e.r,e.g,e.b);return new a(e.r/t,e.g/t,e.b/t)})(),I=`
uniform float uHinge;
uniform float uFlip;
uniform float uCurl;
uniform float uLift;

varying vec2 vUv;
varying vec3 vLocal;
varying vec3 vObjNormal;
varying vec3 vNormal;
#ifdef HOLO
/* 观察方向（视空间，未归一化）。只有全息闪卡要它，别的程序连这个插值量都不带。 */
varying vec3 vView;
#endif

void main() {
  vec3 p = position;
  vec3 n = normal;
  /*
   * 翻页纸：position.x 是离铰链的距离，铰链是物体空间的 y 轴。纸页绕铰链翻 uFlip，
   * 同时整张纸按常曲率 uCurl 弯着：为正时离铰链越远角度越落后，自由端「拖」在后面（手册的纸页
   * 被带起来）；为负时自由端领先（台历捏着页底往上翻）。硬板翻页是整张一起转，软纸才会弯。
   * 常曲率的弧长积分有闭式解，不用分段累加。
   */
  if (uHinge > 0.5) {
    float a = uFlip - uCurl * p.x;
    vec2 arc = abs(uCurl) < 1e-4
      ? p.x * vec2(cos(uFlip), sin(uFlip))
      : vec2(sin(uFlip) - sin(a), cos(a) - cos(uFlip)) / uCurl;
    vec2 up = vec2(-sin(a), cos(a));
    float lift = p.z + uLift;
    p = vec3(arc.x + up.x * lift, p.y, arc.y + up.y * lift);
    n = vec3(up.x, 0.0, up.y) * (normal.z < 0.0 ? -1.0 : 1.0);
  }
  vUv = uv;
  vLocal = position;
  vObjNormal = normal;
  vNormal = normalize(normalMatrix * n);
#ifdef HOLO
  vView = -(modelViewMatrix * vec4(p, 1.0)).xyz;
#endif
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`,L=`
uniform vec3 uColor;
uniform vec3 uSideColor;
uniform float uSideStripes;
uniform float uEdgePx;
uniform float uGrain;
uniform float uNight;
uniform float uDpr;
uniform float uFade;
uniform float uFadeFlip;
uniform vec3 uBayTint;

uniform sampler2D uMap;
uniform float uUseMap;
uniform vec4 uMapRect;
/* 0 = 台历那三张界面图，1 = 屋主手绘的画。见下面 screenArt。 */
uniform float uMapPaper;

#ifdef BACKMAP
uniform sampler2D uMapBack;
uniform float uUseMapBack;
uniform vec4 uMapBackRect;
#endif

uniform vec4 uLines;
uniform vec3 uLineSpec;
uniform float uLinesBack;
uniform vec3 uInk;

uniform vec4 uDot;
uniform vec3 uDotColor;
uniform vec2 uFaceSize;

#ifdef CARD
uniform vec3 uCard;
uniform float uInkGrow;
uniform vec3 uInkColor;
uniform vec2 uInkPts[INK_N];
uniform float uInkAcc[INK_N];
#endif

#ifdef HOLO
/* 三个都由 card.ts 每帧按卡的倾角写进来，见文件头 ⑨。 */
uniform float uHoloPhase;
uniform float uHoloSweep;
uniform float uHoloStrength;
#endif

varying vec2 vUv;
varying vec3 vLocal;
varying vec3 vObjNormal;
varying vec3 vNormal;
#ifdef HOLO
varying vec3 vView;
#endif

/* 4×4 Bayer 有序抖动的阈值，0到15/16：由2×2的那一张递推。 */
float bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x / 2.0 + a.y * a.y * 0.75);
}

float bayer4(vec2 a) {
  return bayer2(0.5 * a) * 0.25 + bayer2(a);
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

/* 淡墨横线：像一页手写的字，每行长短不一，第一行短一点当标题。线宽按屏幕像素算。 */
float lines(vec2 uv, vec2 fw) {
  if (uLineSpec.x < 0.5) return 0.0;
  vec2 q = (uv - uLines.xy) / (uLines.zw - uLines.xy);
  if (q.x < 0.0 || q.x > 1.0 || q.y < 0.0 || q.y > 1.0) return 0.0;
  float rows = uLineSpec.x;
  float t = (1.0 - q.y) * rows;
  float row = floor(t);
  float len = row < 0.5 ? 0.46 : 0.62 + 0.36 * hash(vec2(row, uLineSpec.z));
  if (row > rows - 1.5) len *= 0.55;
  float along = 1.0 - smoothstep(len - 0.012, len, q.x);
  float dy = abs(fract(t) - 0.5) / rows * (uLines.w - uLines.y);
  float px = dy / fw.y;
  float halfWidth = uLineSpec.y * uDpr;
  return along * (1.0 - smoothstep(halfWidth - 0.5, halfWidth + 0.5, px));
}

#ifdef CARD
float sdRoundRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

/* 勾：按弧长只画到 uInkGrow 那一段，笔头是圆的——笔画生长。 */
float ink(vec2 p, float px) {
  float written = uInkGrow * uInkAcc[INK_N - 1];
  float best = 1e3;
  for (int i = 0; i < INK_N - 1; i++) {
    float from = uInkAcc[i];
    float to = uInkAcc[i + 1];
    if (written <= from) break;
    vec2 a = uInkPts[i];
    vec2 b = mix(a, uInkPts[i + 1], clamp((written - from) / max(to - from, 1e-5), 0.0, 1.0));
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-8), 0.0, 1.0);
    best = min(best, length(pa - ba * h));
  }
  float width = 0.052;
  return 1.0 - smoothstep(width - px, width + px, best);
}
#endif

void main() {
  /*
   * ⑦ 屏幕门淡入淡出。阈值用4×4 Bayer：按屏幕像素取、不随物件移动；一半透明时正好是棋盘格，
   * 在1倍像素比的屏上也读作均匀的一层灰，不像噪声阈值那样拉出斜纹。uFadeFlip 把阈值倒过来（见文件头 ⑦）。
   * 放在最前面，丢掉的片元后面的活一样都不用干。
   */
  if (uFade < 1.0) {
    float threshold = bayer4(gl_FragCoord.xy) + 0.03125;
    threshold = mix(threshold, 1.0 - threshold, uFadeFlip);
    if (threshold > uFade) discard;
  }

#ifdef CARD
  vec2 suv = vLocal.xy / (2.0 * uCard.xy) + 0.5;
  float sd = -sdRoundRect(vLocal.xy, uCard.xy, uCard.z);
  float sdw = max(fwidth(sd), 1e-6);
#else
  vec2 suv = vUv;
#endif
  vec2 fw = max(fwidth(suv), vec2(1e-6));

  /* 1 = 正面（图案面），-1 = 背面，0 = 侧面（纸边） */
  float face = vObjNormal.z > 0.5 ? (gl_FrontFacing ? 1.0 : -1.0) : (vObjNormal.z < -0.5 ? -1.0 : 0.0);

  vec3 col = face == 0.0 ? uSideColor : uColor;

  /* 页块侧面：一叠纸的细纹 */
  if (face == 0.0 && uSideStripes > 0.0) {
    float s = abs(fract(vLocal.z * uSideStripes) - 0.5);
    col *= 0.97 + 0.03 * smoothstep(0.1, 0.35, s);
  }

  /*
   * 贴图在分支外采样：mipmap 要靠相邻像素的导数，放进按像素走的分支里是未定义行为。
   * 贴图不翻转上传（ImageBitmap 不认 UNPACK_FLIP_Y），第0行是图的顶边，所以这里翻 v。
   */
  vec2 m = (suv - uMapRect.xy) / (uMapRect.zw - uMapRect.xy);
  vec3 mapColor = texture2D(uMap, vec2(m.x, 1.0 - m.y)).rgb;
  float inMap = uUseMap > 0.5 && face > 0.5 && m.x >= 0.0 && m.x <= 1.0 && m.y >= 0.0 && m.y <= 1.0 ? 1.0 : 0.0;
#ifdef BACKMAP
  /*
   * 背面也有画（手册那三张翻页纸的反面）。翻过去之后书缝还在原处、看到的左右是反的，
   * 所以 u 取镜像——和下面背面淡墨横线同一个式子。只有声明了 BACKMAP 的材质编这一段，
   * 台历那条路径的着色器源码一个字不差（多一个 inBack = 0.0的常量，行为逐像素相同）。
   */
  vec2 mb = (vec2(1.0 - suv.x, suv.y) - uMapBackRect.xy) / (uMapBackRect.zw - uMapBackRect.xy);
  vec3 backColor = texture2D(uMapBack, vec2(mb.x, 1.0 - mb.y)).rgb;
  float inBack = uUseMapBack > 0.5 && face < -0.5 && mb.x >= 0.0 && mb.x <= 1.0 && mb.y >= 0.0 && mb.y <= 1.0 ? 1.0 : 0.0;
#else
  float inBack = 0.0;
#endif
  if (face > 0.5) {
    col = mix(col, mapColor, inMap);
    if (uDot.w > 0.5) {
      float d = length((suv - uDot.xy) * uFaceSize);
      float aa = fw.x * uFaceSize.x;
      col = mix(col, uDotColor, 1.0 - smoothstep(uDot.z - aa, uDot.z + aa, d));
    }
    /*
     * 淡墨横线只画在**没被画盖住**的纸上（1 - inMap）：贴了画的那一面不再往画上画线，
     * 画没到（或下不来）时线照旧——不用在换图的那一刻去改哪个开关，少一处会忘的状态。
     * 台历不受影响：它的页眉横线与「今天」那个圆点都在 uMapRect 之外（界面图只占页面中段），
     * 那里 inMap 恒为0。
     */
    col = mix(col, uInk, lines(suv, fw) * 0.16 * (1.0 - inMap));
  } else if (face < -0.5) {
#ifdef BACKMAP
    col = mix(col, backColor, inBack);
#endif
    if (uLinesBack > 0.5) col = mix(col, uInk, lines(vec2(1.0 - suv.x, suv.y), fw) * 0.16 * (1.0 - inBack));
  }

  /*
   * 「这块像素是界面截图吗」。台历那三页是真界面（uMapPaper = 0）：不加纸纹，夜色也压得轻，
   * 免得夜里字糊成一片。屋主手绘的画（uMapPaper = 1）是**纸**，和程序化的纸走同一档——
   * 纸纹照加、夜色照压，贴了画的那张纸与旁边没贴画的纸在夜里是同一个暗度。
   */
  float screenArt = max(inMap, inBack) * (1.0 - uMapPaper);

#ifdef CARD
  if (face < -0.5 && uInkGrow > 0.0) {
    float stroke = ink(vec2(-vLocal.x, vLocal.y), sdw * 1.2);
    col = mix(col, uInkColor, stroke);
  }
#endif

#ifdef HOLO
  /* ⑨ 镭射：一条随倾角滑过卡面的软带，带里取一点薄膜虹彩。只在正面，只加不乘。 */
  if (face > 0.5) {
    vec3 holoNormal = normalize(vNormal) * (gl_FrontFacing ? 1.0 : -1.0);
    /* 掠视角 = 1，正视 = 0。真闪卡就是斜着看才闪，所以相位和亮度都跟着它走。 */
    float grazing = 1.0 - clamp(dot(holoNormal, normalize(vView)), 0.0, 1.0);
    /* 斜向的高斯窄带，沿卡面对角线；中心 uHoloSweep 由卡的 yaw 推着走 */
    float along = suv.x * 0.42 + suv.y * 0.58;
    /*
     * 相位三项：卡的倾角（整体推）、逐像素的视角项（带有厚度）、带自己的坐标
     * （**带里横着也要变色**——少了这一项，整条带是一个均匀的色块，不像虹彩）。
     */
    float phase = uHoloPhase + grazing * 1.5 + along * 0.85;
    /* 三通道错相当彩虹用：比 HSV 转换省一大截指令，色相也更柔（不会出纯红纯绿） */
    vec3 spectrum = 0.5 + 0.5 * cos(6.2831853 * phase + vec3(0.0, 2.0944, 4.1888));
    float t = (along - uHoloSweep) / 0.17;
    float band = exp(-t * t);
    /* 入夜：强度减半、虹彩往海湾蓝里掺——同别的物件一条规矩（⑥） */
    float gain = uHoloStrength * (0.5 + 0.8 * grazing) * mix(1.0, 0.5, uNight);
    col += mix(spectrum, spectrum * uBayTint, uNight * 0.6) * band * gain;
  }
#endif

  /* ② 平涂三档 + 背光冷影。光从左上前方来，固定在观者一侧，像摆在窗边的静物。 */
  vec3 n = normalize(vNormal) * (gl_FrontFacing ? 1.0 : -1.0);
  float lambert = dot(n, normalize(vec3(-0.42, 0.72, 0.55)));
  float toMid = smoothstep(-0.08, 0.1, lambert);
  float toLit = smoothstep(0.34, 0.5, lambert);
  col *= mix(0.8, mix(0.915, 1.0, toLit), toMid);
  col *= mix(vec3(1.0), uBayTint, (1.0 - toMid) * 0.34 + (1.0 - toLit) * 0.08);

  /* ③ 纸纹：纤维方向拉长的两层值噪声。界面图上不加——那是真实界面，颜色要和页面里的图一致。 */
  if (uGrain > 0.5 && screenArt < 0.5) {
    vec2 gp = (vLocal.xy + vLocal.zz * 1.3) * 90.0;
    float fiber = noise(gp * vec2(1.0, 0.3)) * 0.6 + noise(gp * 2.1 + 7.0) * 0.4;
    col *= 1.0 + (fiber - 0.5) * 0.06;
  }

  /* ④ 颜料边：贴边一道深线，再往里一层很淡的晕，都按屏幕像素算宽度 */
  if (uEdgePx > 0.0) {
#ifdef CARD
    float edgeDist = face == 0.0 ? 0.0 : sd / sdw;
#else
    vec2 d = min(suv, 1.0 - suv) / fw;
    float edgeDist = min(d.x, d.y);
#endif
    float rim = 1.0 - smoothstep(0.0, uEdgePx * uDpr, edgeDist);
    float halo = 1.0 - smoothstep(0.0, uEdgePx * uDpr * 5.0, edgeDist);
    col *= 1.0 - rim * 0.13 - halo * 0.045;
  }

  /*
   * ⑥ 入夜：压暗偏冷。这里是线性空间，乘子要比门厅那幅画（在 sRGB 上乘0.56/0.60/0.72）小一截
   * 才是同样的暗度。界面图压得轻一点，免得夜里台历上的字糊成一片。
   */
  vec3 dusk = mix(vec3(0.3, 0.33, 0.45), vec3(0.45, 0.48, 0.62), screenArt);
  col = mix(col, col * dusk, uNight);

  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`,re=new h(`#3E3C35`);function R(e,t){let n=e.lines,i=e.dot;return{...e.backMap?{uMapBack:{value:null},uUseMapBack:{value:0},uMapBackRect:{value:new r(...e.backMapRect??[0,0,1,1])}}:{},uNight:t.uNight,uGrain:t.uGrain,uDpr:t.uDpr,uFade:t.uFade,uFadeFlip:t.uFadeFlip,uBayTint:{value:F},uColor:{value:new h(e.color)},uSideColor:{value:new h(e.side??e.color)},uSideStripes:{value:e.sideStripes??0},uEdgePx:{value:e.edgePx??1.4},uHinge:{value:+!!e.hinge},uFlip:{value:0},uCurl:{value:0},uLift:{value:0},uMap:{value:e.map??null},uUseMap:{value:+!!e.map},uMapRect:{value:new r(...e.mapRect??[0,0,1,1])},uMapPaper:{value:+!!e.mapPaper},uLines:{value:new r(...n?.rect??[0,0,1,1])},uLineSpec:{value:new a(n?.rows??0,n?.widthPx??.7,n?.seed??0)},uLinesBack:{value:+!!n?.back},uInk:{value:re},uDot:{value:new r(i?.u??0,i?.v??0,i?.radius??0,+!!i)},uDotColor:{value:new h(i?.color??`#000000`)},uFaceSize:{value:new b(...e.faceSize??[1,1])}}}function z(e,t){return new s({vertexShader:I,fragmentShader:L,side:2,defines:e.backMap?{BACKMAP:``}:void 0,uniforms:R(e,t)})}function B(e){let t=[0];for(let n=1;n<e.length;n+=1)t.push(t[n-1]+e[n].distanceTo(e[n-1]));return{points:e,acc:t}}function V(e,t){let n=R(e,t),r=e.ink?B(e.ink.points):null,i=Array.from({length:16},()=>new b);return n.uCard={value:new a(e.halfWidth,e.halfHeight,e.radius)},n.uInkGrow={value:0},n.uInkColor={value:new h(e.ink?.color??`#000000`)},n.uInkPts={value:r?r.points:i},n.uInkAcc={value:r?r.acc:Array(16).fill(0)},e.holo&&(n.uHoloPhase={value:0},n.uHoloSweep={value:.5},n.uHoloStrength={value:e.holo.strength}),new s({vertexShader:I,fragmentShader:L,side:2,defines:e.holo?{CARD:``,INK_N:16,HOLO:``}:{CARD:``,INK_N:16},uniforms:n})}var H=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,ie=`
uniform vec3 uColor;
uniform float uAlpha;
uniform float uNight;
uniform float uFade;
varying vec2 vUv;
void main() {
  float r = length(vUv * 2.0 - 1.0);
  float a = uAlpha * pow(1.0 - smoothstep(0.0, 1.0, r), 1.6);
  vec3 c = mix(uColor, uColor * 0.3, uNight);
  // 投影本来就是半透明的一层淡影，交接时直接乘 uFade，不用抖动
  gl_FragColor = vec4(c, a * (1.0 + uNight * 0.4) * uFade);
  #include <colorspace_fragment>
}
`;function ae(e){return new s({vertexShader:H,fragmentShader:ie,transparent:!0,depthWrite:!1,uniforms:{uColor:{value:new h(74/255,77/255,53/255).convertSRGBToLinear()},uAlpha:{value:.22},uNight:e.uNight,uFade:e.uFade}})}var U={paper:`#FFFDFA`,paperSoft:`#F6F5F1`,paperEdge:`#E4E0D6`,pageEdge:`#E9E4D8`,clay:`#C9C6B4`,olive:`#D5D4C1`,planBrand:`#2563EB`,shuaBrand:`#B4232C`,gangBrand:`#8F1D2C`,cardBrand:`#10666E`,cardMatte:`#182B3D`,cardMark:`#33556E`},oe=.08,se=.09,W=3.3600000000000003,G=2.533333333333333,K=14*Math.PI/180,q=2.583333333333333,ce=3.4400000000000004,le=q*Math.cos(K),ue=[.012,.008,.004],de=[-.004,-.008,-.012],fe=1.5,pe={side:.3,top:.62,bottom:.3},me=class extends c{constructor(e,t,n){super(),this.turns=e,this.radius=t,this.length=n}getPoint(e,t=new a){let n=e*this.turns*Math.PI*2;return t.set((e-.5)*this.length,Math.cos(n)*this.radius,Math.sin(n)*this.radius)}};function he(e){let t=Math.cos(K),n=Math.sin(K),r=new a(0,-t,e?n:-n),i=new a(e?1:-1,0,0),o=new a().crossVectors(r,i);return new p().makeBasis(r,i,o)}function ge(e,t,r){let{detail:a,shared:s,track:c,beats:u}=e,f=new l,p=new l;p.position.y=-le/2+.02,f.add(p);let m=new d(c(new o(4.6,2.2)),c(ae(s)));m.rotation.x=-Math.PI/2,m.position.y=.004,p.add(m);let h=c(new g(q,ce,.03)),_=c(z({color:U.clay,edgePx:1.3},s));for(let e of[!0,!1]){let t=new l;t.position.y=le,t.quaternion.setFromRotationMatrix(he(e));let n=new d(h,_);n.position.set(q/2,0,-.022),t.add(n),p.add(t)}let v=new l;v.position.y=le,v.quaternion.setFromRotationMatrix(he(!0)),p.add(v);let b=c(new o(G,W,a===`high`?28:14,1));b.translate(G/2,0,0);let x=b.attributes.position,ee=b.attributes.uv;for(let e=0;e<x.count;e+=1)ee.setXY(e,(x.getY(e)+W/2)/W,1-x.getX(e)/G);ee.needsUpdate=!0;let S=t.map(e=>{let t=c(new i(e));return t.colorSpace=y,t.flipY=!1,t}),C=S.map((e,t)=>{let n=c(z({color:U.paper,side:U.paperSoft,hinge:!0,edgePx:1.2,map:e,mapRect:[oe/W,se/G,1-oe/W,2.223333333333333/G],dot:{u:.2/W,v:1-.205/G,radius:.052,color:U.planBrand},lines:{rect:[.34/W,1-.26/G,2.2800000000000002/W,1-.15/G],rows:1,seed:t+1,widthPx:.9},faceSize:[W,G]},s));n.uniforms.uLift.value=ue[t];let r=new d(b,n);return v.add(r),n}),te=c(new n(new me(8,.066,.4),a===`high`?128:64,.0105,a===`high`?6:4)),T=c(z({color:U.planBrand,edgePx:0},s));for(let e of[-.9,.9]){let t=new d(te,T);t.position.set(e,le+.01,0),p.add(t)}let E={enter:0,exit:0,flip0:0,flip1:0},D=A();N(D,E,u);let k=r/u.hold,P=e=>e/t.length;j(D,E,`flip0`,M(u,P(1)-k),M(u,P(1)+k)),j(D,E,`flip1`,M(u,P(2)-k),M(u,P(2)+k));let F=[()=>E.flip0,()=>E.flip1,()=>0];return{root:f,margins:pe,timeline:D,apply:()=>{let{enter:e,exit:t}=E;f.position.set(O(1.1,0,e)-t*.25,O(-.8-ne,0,e)+t*(.3+w),0),f.rotation.x=.2,f.scale.setScalar(O(.88,1,e)),p.rotation.y=O(1.3,-.38,e)-t*.32,C.forEach((e,t)=>{let n=F[t](),r=Math.PI*2-K*2-.035-t*.02,i=n*r,a=-Math.min(fe*Math.sin(Math.PI*n),(r-i)/G*.95);e.uniforms.uFlip.value=i,e.uniforms.uCurl.value=a,e.uniforms.uLift.value=O(ue[t],de[t],n)})},textures:S,artwork:[]}}var _e=.936,ve=1.3,ye=.12,J=.055,be=-.26,xe=t(`/shelf/card-face.v2.webp`),Y=[[.06,.46],[.5,.86]];function Se(e,t,n){let r=new x,i=-e,a=e,o=-t,s=t;return r.moveTo(i+n,o),r.lineTo(a-n,o),r.absarc(a-n,o+n,n,-Math.PI/2,0,!1),r.lineTo(a,s-n),r.absarc(a-n,s-n,n,0,Math.PI/2,!1),r.lineTo(i+n,s),r.absarc(i+n,s-n,n,Math.PI/2,Math.PI,!1),r.lineTo(i,o+n),r.absarc(i+n,o+n,n,Math.PI,Math.PI*1.5,!1),r}function Ce(){return Array.from({length:16},(e,t)=>{let n=t/15;return new b(-.4+.8*n,-.2+Math.sin(n*Math.PI*2)*.11)})}function we(e){let{detail:t,shared:n,track:r,beats:i}=e,a=new l,s=new d(r(new o(3,1.2)),r(ae(n)));s.rotation.x=-Math.PI/2,s.position.y=-1.46,a.add(s);let c=r(new f(Se(_e,ve,ye),{depth:J,bevelEnabled:!1,curveSegments:t===`high`?10:5}));c.translate(0,0,-.055/2);let u=r(V({color:U.cardMatte,side:U.cardBrand,edgePx:1.3,halfWidth:_e,halfHeight:ve,radius:ye,mapPaper:!0,holo:{strength:.16},ink:{points:Ce(),color:U.cardMark}},n));u.uniforms.uInkGrow.value=1;let p=new d(c,u);p.rotation.order=`ZYX`,a.add(p);let m={enter:0,exit:0,flip0:0,flip1:0},h=A();return N(h,m,i),j(h,m,`flip0`,M(i,Y[0][0]),M(i,Y[0][1])),j(h,m,`flip1`,M(i,Y[1][0]),M(i,Y[1][1])),{root:a,margins:T,timeline:h,apply:()=>{let{enter:e,exit:t,flip0:n,flip1:r}=m;a.position.set(O(1.1,0,e)-t*.3,O(-.62-ne,0,e)+t*(.3+w),0),a.rotation.x=.12,a.scale.setScalar(O(.9,1,e));let i=O(1.45,be,e)-Math.PI*(n+r)-t*.3;p.rotation.y=i;let o=Math.sin(Math.PI*D(n))+Math.sin(Math.PI*D(r));p.position.set(0,o*.06,o*.14),u.uniforms.uHoloPhase.value=i*.55,u.uniforms.uHoloSweep.value=.5-Math.sin(i)*.55},textures:[],artwork:[{url:xe,apply:e=>{u.uniforms.uMap.value=e,u.uniforms.uUseMap.value=1}}]}}var Te=1.08,Ee=1.05,De=.46,X=.022,Oe=5,ke=t(`/shelf/shua-card-front.v1.webp`),Z=[{x:.29,y:-.12,z:0,tilt:4.5},{x:-.29,y:.12,z:-.05,tilt:-7},{x:.06,y:.03,z:-.1,tilt:1.5},{x:-.05,y:-.02,z:-.15,tilt:-2.5},{x:.02,y:.05,z:-.2,tilt:2}].map(e=>({...e,tilt:e.tilt*Math.PI/180}));function Q(e){let t=Math.min(Math.max(e,0),Z.length-1),n=Math.floor(t),r=Math.min(n+1,Z.length-1),i=t-n,a=Z[n],o=Z[r];return{x:O(a.x,o.x,i),y:O(a.y,o.y,i),z:O(a.z,o.z,i),tilt:O(a.tilt,o.tilt,i)}}function Ae(e,t,n){let r=new x,i=-e,a=e,o=-t,s=t;return r.moveTo(i+n,o),r.lineTo(a-n,o),r.absarc(a-n,o+n,n,-Math.PI/2,0,!1),r.lineTo(a,s-n),r.absarc(a-n,s-n,n,0,Math.PI/2,!1),r.lineTo(i+n,s),r.absarc(i+n,s-n,n,Math.PI/2,Math.PI,!1),r.lineTo(i,o+n),r.absarc(i+n,o+n,n,Math.PI,Math.PI*1.5,!1),r}function je(){let e=2*Te/21.5*1.5,t=(t,n)=>new b((t-22.75)*e,(22-n)*e),n=new _(t(17.4,22.6),t(18.7,23.6),t(19.5,24.5),t(20,25.3)),r=new _(t(20,25.3),t(21.6,22.6),t(23.4,20.4),t(25.6,18.7)),i=n.getSpacedPoints(5),a=r.getSpacedPoints(16-i.length).slice(1);return[...i,...a]}function Me(e){let{detail:t,shared:n,track:r,beats:i}=e,a=new l,s=new l;a.add(s);let c=new d(r(new o(4,1.5)),r(ae(n)));c.rotation.x=-Math.PI/2,c.position.y=-1.48,a.add(c);let u=r(new f(Ae(Te,Ee,De),{depth:X,bevelEnabled:!1,curveSegments:t===`high`?10:5}));u.translate(0,0,-.022/2);let p=je(),m=[];for(let e=0;e<Oe;e+=1){let t=r(V({color:e%2?U.paperSoft:U.paper,side:U.paperEdge,edgePx:1.3,halfWidth:Te,halfHeight:Ee,radius:De,lines:{rect:[.16,.44,.84,.8],rows:3,seed:e*3+1,widthPx:.85},mapPaper:!0,ink:e===2?{points:p,color:U.shuaBrand}:void 0},n)),i=new d(u,t);i.rotation.order=`ZYX`,s.add(i),m.push({mesh:i,material:t})}let h={enter:0,exit:0,swipe0:0,swipe1:0,turn2:0,ink:0,swap:0},g=A();N(g,h,i),j(g,h,`swipe0`,M(i,.025),M(i,.25),e=>e),j(g,h,`swipe1`,M(i,.275),M(i,.5),e=>e),j(g,h,`turn2`,M(i,.525),M(i,.65)),j(g,h,`ink`,M(i,.625),M(i,.8)),j(g,h,`swap`,M(i,.825),M(i,.95));let _=(e,t)=>{let n=k(e,0,.5),r=k(e,.45,.7),i=k(e,.68,1),a=Z[0],o=Q(t),s=a.x-1.9;return{x:O(O(a.x,s,n),o.x,i),y:O(O(a.y,a.y+.18,n),o.y,i),z:O(a.z+Math.sin(Math.PI*D(e/.5))*.35,o.z-.06*(1-i),r),flip:-Math.PI*n,tilt:O(O(a.tilt,-12*Math.PI/180,n),o.tilt,i)}};return{root:a,margins:T,timeline:g,apply:()=>{let{enter:e,exit:t}=h;a.position.set(O(1.1,.05,e)-t*.3,O(-.8-ne,.08,e)+t*(.3+w),0),a.rotation.x=.24,a.scale.setScalar(O(.9,1,e)),s.rotation.y=O(1.42,-.2,e)-t*.3;let n=E(D((h.swipe0-.45)/.55)),r=E(D((h.swipe1-.45)/.55));m.forEach(({mesh:e,material:t},i)=>{let a;if(i===0)a=h.swipe0<1?_(h.swipe0,4):{...Q(4-r),flip:-Math.PI};else if(i===1)a=h.swipe1>0?_(h.swipe1,4):{...Q(1-n),flip:0};else{let e=i===2?h.swap:i===3?-h.swap:0,t=Q(i-n-r+e),o=0,s=t.z;i===2?(o=-Math.PI*h.turn2,s+=Math.sin(Math.PI*h.turn2)*.32):i===3&&(s+=Math.sin(Math.PI*h.swap)*.3),a={...t,z:s,flip:o}}e.position.set(a.x,a.y,a.z),e.rotation.set(0,a.flip,a.tilt),i===2&&(t.uniforms.uInkGrow.value=h.ink)})},textures:[],artwork:[{url:ke,apply:e=>{for(let{material:t}of m)t.uniforms.uMap.value=e,t.uniforms.uUseMap.value=1}}]}}var $=1.9,Ne=2.6,Pe=.035,Fe=.09,Ie=.125,Le=.28,Re=Le/2,ze=3,Be=[.012,.008,.004],Ve=[.004,.008,.012],He=t(`/shelf/gang-cover.v1.webp`),Ue={a:t(`/shelf/gang-page-a.v1.webp`),b:t(`/shelf/gang-page-b.v1.webp`),c:t(`/shelf/gang-page-c.v1.webp`),d:t(`/shelf/gang-page-d.v1.webp`)},We=[-.2,.1],Ge=[[.125,.35],[.375,.6],[.625,.85]],Ke=.12,qe=.95,Je=.26;function Ye(e){let t=.1265,n=t*.72,r=Math.PI/2*n,i=e*(qe+r+Je);if(i<=qe)return new a(Ke,-.3500000000000001-i,t);if(i<=qe+r){let e=(i-qe)/r*(Math.PI/2);return new a(Ke,-1.3-Math.sin(e)*n,t-(1-Math.cos(e))*n)}let o=(i-qe-r)/Je;return new a(Ke+o*.07,-1.39108-o*Je,O(.03542000000000001,.004,Math.min(o*2.5,1)))}function Xe(e){let{detail:t,shared:n,track:r,beats:i}=e,a=new l,s=new l;a.add(s);let c=new l;c.rotation.x=-Math.PI/2,s.add(c);let u=new d(r(new o(5.3,3.9)),r(ae(n)));u.rotation.x=-Math.PI/2,u.position.y=.002,s.add(u);let f=r(z({color:U.olive,edgePx:1.4},n)),p=r(new g(1.96,2.72,Pe)),m=(e,t=!1)=>({rect:[.14,.1,.88,.86],rows:11,seed:e,back:t,widthPx:.7}),h=r(new g($,Ne,Fe)),_=r(z({color:U.pageEdge,sideStripes:160,edgePx:.9},n)),v=e=>r(z({color:U.paper,edgePx:1,lines:m(e),mapPaper:!0},n)),y=e=>[_,_,_,_,e,_],b=new d(p,f);b.position.set(1.96/2,0,Pe/2);let x=v(11),ee=new d(h,y(x));ee.position.set($/2,0,.08),c.add(b,ee);let S=new l;S.position.z=Re;let C=new d(p,f);C.position.set(-1.96/2,0,Pe/2-Re);let te=v(23),E=new d(h,y(te));E.position.set(-1.9/2,0,-.06000000000000001);let D=new d(r(new o(.92,.5)),r(z({color:U.paper,edgePx:1.1,lines:{rect:[.16,.24,.84,.76],rows:2,seed:5,widthPx:1}},n)));D.rotation.y=Math.PI,D.position.set(-1.96/2,.38,-.14-.002);let k=r(z({color:U.olive,edgePx:1.4,mapPaper:!0},n)),P=new d(r(new o(1.96,2.72)),k);P.rotation.y=Math.PI,P.position.set(-1.96/2,0,-.14-.002),P.visible=!1,S.add(C,E,D,P),c.add(S);let F=new d(r(new g(Le,2.72,Pe)),f);c.add(F);let I=r(new o($,Ne,t===`high`?24:12,1));I.translate($/2,0,0);let L=[];for(let e=0;e<ze;e+=1){let t=r(z({color:U.paper,side:U.paperSoft,hinge:!0,edgePx:1,lines:m(31+e*7,!0),mapPaper:!0,backMap:!0},n));t.uniforms.uLift.value=Be[e];let i=new d(I,t);i.position.z=Ie,c.add(i),L.push(t)}let re=r(new o(.1,1,1,t===`high`?32:16)),R=re.attributes.position;for(let e=0;e<R.count;e+=1){let t=Ye(.5-R.getY(e));R.setXYZ(e,t.x+R.getX(e),t.y,t.z)}R.needsUpdate=!0,re.computeVertexNormals();let B=new d(re,r(z({color:U.gangBrand,edgePx:1},n)));c.add(B);let V={enter:0,exit:0,open:0,sheet0:0,sheet1:0,sheet2:0},H=A();N(H,V,i),j(H,V,`open`,M(i,We[0]),M(i,We[1])),j(H,V,`sheet0`,M(i,Ge[0][0]),M(i,Ge[0][1])),j(H,V,`sheet1`,M(i,Ge[1][0]),M(i,Ge[1][1])),j(H,V,`sheet2`,M(i,Ge[2][0]),M(i,Ge[2][1]));let ie=[()=>V.sheet0,()=>V.sheet1,()=>V.sheet2],oe=()=>{let{enter:e,exit:t,open:n}=V;a.position.set(O(1.1,0,e)-t*.3,O(-.9-ne,-.12,e)+t*(.3+w),0),a.rotation.x=.86,a.scale.setScalar(O(.76,.84,e)),s.rotation.y=O(Math.PI/2,-.1,e)-t*.3,c.position.x=-.98*(1-n);let r=Math.PI*(1-n);S.rotation.y=r,F.rotation.y=r/2,F.position.set(O(0,-.035/2,1-n),0,O(-.0165,Re,1-n)),L.forEach((e,t)=>{let n=ie[t](),r=n*Math.PI;e.uniforms.uFlip.value=r,e.uniforms.uCurl.value=Math.min(.5*Math.sin(Math.PI*n),r/$*.95),e.uniforms.uLift.value=O(Be[t],-Ve[t],n)})},se={a:[{material:te},{material:L[1],back:!0}],b:[{material:L[0]},{material:L[2]}],c:[{material:L[0],back:!0},{material:L[2],back:!0}],d:[{material:L[1]},{material:x}]},W=(e,t,n)=>{e[n?`uMapBack`:`uMap`].value=t,e[n?`uUseMapBack`:`uUseMap`].value=1};return{root:a,margins:T,timeline:H,apply:oe,textures:[],artwork:[{url:He,apply:e=>{W(k.uniforms,e),P.visible=!0,D.visible=!1}},...Object.entries(Ue).map(([e,t])=>({url:t,apply:t=>{for(let n of se[e])W(n.material.uniforms,t,n.back)}}))]}}var Ze=140,Qe=4e-4;function $e(e,t){let n=(e,t)=>Number.parseFloat(getComputedStyle(e).getPropertyValue(t)),r=n(e,`--rail-end`),i=n(e,`--fade`),a=t.map(e=>[n(e,`--hold-start`),n(e,`--hold-end`)]),o=0;for(let[e,t]of a){if(!(e>=o&&t>=e))return null;o=t}return i>0&&a.length>0&&o===r?{end:r,fade:i,holds:a}:null}var et={high:1.75,balanced:1.25,soft:1.5},tt=8e5,nt=2,rt=13e5,it=30,at={enter:.45,hold:.55,exit:.45},ot=new Set([`plan`,`card`]),st=.575,ct=.5,lt=1,ut=2,dt=8,ft=4,pt=28,mt=3*(1+2*T.top)/2/Math.tan(pt*Math.PI/360),ht={soft:30},gt={capped:.6,free:.55},_t=[30,120],vt=3e3,yt=15e3,bt=240,xt=5e-4,St=e=>e.id===`plan`?T:e.exhibit?.margins??T;function Ct(e){return Number.parseFloat(e.style.getPropertyValue(`--rail-progress`))||0}function wt(e,t){let n=0,r=0;for(let i=e;i&&i!==t;i=i.offsetParent)if(n+=i.offsetLeft,r+=i.offsetTop,i.offsetParent===null)return null;return{x:n,y:r}}function Tt(){return new Promise(e=>{typeof window.requestIdleCallback==`function`?window.requestIdleCallback(()=>e(),{timeout:300}):window.setTimeout(e,16)})}function Et(e){return e.loading=`eager`,new Promise(t=>{if(e.complete){t(e.naturalWidth>0);return}let n=n=>{window.clearTimeout(a),e.removeEventListener(`load`,r),e.removeEventListener(`error`,i),t(n)},r=()=>n(!0),i=()=>n(!1),a=window.setTimeout(()=>n(!1),yt);e.addEventListener(`load`,r),e.addEventListener(`error`,i)}).then(t=>t?Promise.race([e.decode().then(()=>!0,()=>!0),new Promise(e=>window.setTimeout(()=>e(!0),300))]):!1)}async function Dt(e){if(typeof window.createImageBitmap!=`function`)return null;try{let t=await fetch(e.currentSrc||e.src,{cache:`only-if-cached`,mode:`same-origin`});if(t.ok)return await window.createImageBitmap(await t.blob())}catch{}try{return await window.createImageBitmap(e)}catch{return null}}function Ot(t,n){let{canvas:r,context:i}=n,{rail:a,stage:o}=t,s=n.layout===`cell`,c=n.phone,l=n.tier,d=0,f=!1,p=!1,h=!1,g=[],_=e=>(f?e.dispose():g.push(e),e),y=()=>{f||p||(p=!0,window.setTimeout(()=>n.onFallback(),0))},b={width:0,height:0},x=e=>{let t=window.devicePixelRatio||1;return l===`soft`?Math.min(t,et.soft,Math.sqrt(tt/(e||1))):c?Math.min(t,nt,Math.sqrt(rt/(e||1))):Math.min(t,et[l])},S=()=>x(b.width*b.height),C=P(l===`high`,S());r.setAttribute(`aria-hidden`,`true`),r.style.position=`absolute`,r.style.display=`block`,r.style.pointerEvents=`none`;let ne=new ee,w=new u(pt,1.5,.1,100);w.position.z=mt;let T=null,O=!1,k=NaN,A=s?null:$e(a,t.layers),j=t.exhibits.map(e=>{let[n,r]=s?[at.enter,at.enter+at.hold]:A?.holds[t.layers.indexOf(e.layer)]??[0,0],i=s?at.enter:A?.fade??1;return{...e,exhibit:null,holdStart:n,holdEnd:r,enterStart:n-i,total:r-n+2*i,fade:{value:1},view:null,phase:`building`,slot:null}}),M=(e,t)=>{let n=A?.fade??1;return E(D((t-e.holdStart)/n+1))*(1-E(D((t-e.holdEnd)/n)))},N=0,F=Ct(a),I=()=>F*(A?.end??0),L=()=>{if(s){N=0;return}let e=a.getBoundingClientRect(),t=e.height-window.innerHeight;N=t>0?D(-e.top/t):0};if(!s&&!A||j.some(e=>!t.layers.includes(e.layer)))return y(),{release:()=>{f=!0,i.getExtension(`WEBGL_lose_context`)?.loseContext()},status:()=>({pixelRatio:0,canvas:null,frames:0,cells:[],copyCheck:{samples:0,medianMs:null,passed:null}})};let re=v.context(()=>{}),R=window.matchMedia(`(prefers-color-scheme: dark)`),z=()=>{let e=document.documentElement.classList;return e.contains(`dark`)?!0:!e.contains(`light`)&&R.matches},B=+!!z();C.uNight.value=B;let V=()=>{if(!T)return;let e=1/0,t=1/0,n=-1/0,i=-1/0,a=new Map;for(let r of j){if(!r.exhibit)continue;let s=wt(r.visual,o),c=r.visual.offsetWidth;if(!s||c<=0)continue;let l=c/1.5,{side:u,top:d,bottom:f}=r.exhibit.margins;a.set(r,{x:s.x,y:s.y,width:c,height:l}),e=Math.min(e,s.x-c*u),n=Math.max(n,s.x+c*(1+u)),t=Math.min(t,s.y-l*d),i=Math.max(i,s.y+l*(1+f))}if(!a.size)return;let s=n-e,c=i-t;r.style.left=`${e}px`,r.style.top=`${t}px`,r.style.width=`${s}px`,r.style.height=`${c}px`,b.width=s,b.height=c;for(let n of j){let r=a.get(n);n.view=r?{x:r.x-e,y:r.y-t,width:r.width,height:r.height}:null}T.setPixelRatio(S()),T.setSize(s,c,!1),C.uDpr.value=T.getPixelRatio(),r.isConnected||o.appendChild(r),O=!0},H=e=>{let t=e.view;return t?(ie(t,b.width,b.height),!0):!1},ie=(e,t,n)=>{let r=e.x+e.width/2,i=e.y+e.height/2,a=Math.max(r,t-r),o=Math.max(i,n-i);w.fov=2*Math.atan(3*(2*o/e.height)/2/mt)*180/Math.PI,w.aspect=a/o,w.setViewOffset(2*a,2*o,a-r,o-i,t,n),w.updateProjectionMatrix()},ae=e=>{for(let t of j)t.exhibit&&(t.exhibit.root.visible=t===e)},U=(e,t,n)=>!T||!e.exhibit||!H(e)?!1:(oe(e,t,n),!0),oe=(e,t,n)=>{!T||!e.exhibit||(ae(e),e.exhibit.timeline.progress(D((t-e.enterStart)/e.total)),e.exhibit.apply(),e.fade.value=n,T.clearDepth(),T.render(ne,w),d+=1)},se=()=>{if(!T||!O&&k===F)return!1;let e=I();T.clear();let t=!1;for(let n of j){if(n.phase!==`live`)continue;let r=M(n,e);r>xt&&(t=U(n,e,r)||t)}return k=F,O=!1,t},W=1,G=[0,0],K=[],q=null,ce=e=>{if(K.length>=dt||(K.push(e),K.length<dt))return;let t=[...K].sort((e,t)=>e-t);q=(t[dt/2-1]+t[dt/2])/2,q>ft&&!h&&(n.onDegrade(`static`),h=!0)},le=e=>ot.has(e.id)?e.holdStart:e.holdEnd,ue=(e,t,n)=>{let r=e.areaTop-t,i=n*st-e.areaHeight/2;return D((n-r)/(n-i||1))},de=(e,t,n)=>e.spanTop>=t+n?e.spanTop-t-n:e.spanBottom<=t?t-e.spanBottom:-1,fe=()=>{if(!T)return;let e=window.scrollY,t=window.innerHeight,n=document.documentElement.clientWidth,r=[],i=0,a=0,o=0;for(let t of j){if(!t.exhibit)continue;let s=t.visual.querySelector(`figure`)?.firstElementChild??t.visual.querySelector(`img`);if(!s)continue;let c=s.getBoundingClientRect(),l=t.visual.getBoundingClientRect();if(c.width<=0)continue;let u=c.width/1.5,{side:d,top:f,bottom:p}=St(t),m=Math.max(0,c.left-c.width*d),h=Math.min(n,c.right+c.width*d),g=t.layer.querySelector(`[data-tool-open]`)?.getBoundingClientRect(),_=Math.max(c.top+e-u*f,g?g.bottom+e+1:-1/0),v=s.closest(`figure`)?.querySelector(`figcaption`)?.getBoundingClientRect(),y=Math.min(c.top+e+u*(1+p),v?v.top+e-1:1/0),b=h-m,x=y-_;i=Math.max(i,b*x),a=Math.max(a,b),o=Math.max(o,x),r.push([t,{media:s,areaTop:c.top+e,areaHeight:u,width:b,height:x,offsetLeft:m-l.left,offsetTop:_-(l.top+e),spanTop:Math.min(_,l.top+e),spanBottom:Math.max(y,l.bottom+e),view:{x:c.left-m,y:c.top+e-_,width:c.width,height:u}}])}if(!r.length)return;W=x(a*o+ut*i);let s=Math.floor(a*W),c=Math.floor(o*W);(G[0]!==s||G[1]!==c)&&(G[0]=s,G[1]=c,T.setPixelRatio(1),T.setSize(s,c,!1)),C.uDpr.value=W;for(let[n,i]of r){let r=[Math.floor(i.width*W),Math.floor(i.height*W)],a=n.slot,o={...i,device:r,display:a?.display??null,context2d:a?.context2d??null,target:0,current:0,posed:NaN};o.target=ue(o,e,t),o.current=a&&n.phase===`live`?a.current:o.target,n.slot=o,o.display&&pe(o)}O=!0},pe=e=>{let t=e.display;t&&(t.style.left=`${e.offsetLeft}px`,t.style.top=`${e.offsetTop}px`,t.style.width=`${e.width}px`,t.style.height=`${e.height}px`,t.width!==e.device[0]&&(t.width=e.device[0]),t.height!==e.device[1]&&(t.height=e.device[1]))},me=(e,t)=>{let n=e.slot;if(!T||!e.exhibit||!n)return!1;let[i,a]=n.device;T.setViewport(0,G[1]-a,i,a),T.clear(),ie(n.view,n.width,n.height);let o=n.current*le(e);if(oe(e,o,E(D(o/at.enter))),t&&n.context2d){n.context2d.globalCompositeOperation=`copy`;let e=performance.now();n.context2d.drawImage(r,0,0,i,a,0,0,i,a),ce(performance.now()-e),n.posed=n.current}return!0},he=e=>{let t=e.slot;if(!t)return!1;let n=document.createElement(`canvas`);n.setAttribute(`aria-hidden`,`true`),n.style.position=`absolute`,n.style.display=`block`,n.style.pointerEvents=`none`;let r=n.getContext(`2d`);return r?(t.display=n,t.context2d=r,pe(t),e.visual.appendChild(n),t.current=t.target,me(e,!0),t.media.style.opacity=`0`,e.visual.setAttribute(`data-tool-3d-state`,`cell`),e.phase=`live`,!0):!1},_e=e=>{let t=e.slot;t&&(t.media.style.removeProperty(`opacity`),e.visual.removeAttribute(`data-tool-3d-state`),t.display&&(t.display.remove(),t.display.width=0,t.display.height=0),t.display=null,t.context2d=null,t.posed=NaN,e.phase=h?`retired`:`ready`)},ve=e=>{let t=window.scrollY,n=window.innerHeight,r=!0;for(let i of j){let a=i.slot;if(a){if(a.target=ue(a,t,n),i.phase!==`live`){a.current=a.target;continue}a.current+=(a.target-a.current)*e,Math.abs(a.target-a.current)<Qe?a.current=a.target:r=!1}}return r},ye=()=>{let e=!1;for(let t of j){let n=t.slot;t.phase!==`live`||!n?.display||!O&&n.posed===n.current||(e=me(t,!0)||e)}return O=!1,e},J=[],be=()=>{let e=I(),t=!1;for(let n of j){let r=M(n,e)<=xt;if(r&&!h&&J.length>0)for(let e=J.length-1;e>=0;--e){if(J[e].cell!==n)continue;let[t]=J.splice(e,1);t.artwork.apply(t.texture),O=!0}n.phase===`ready`&&r&&!h?(n.phase=`live`,n.visual.setAttribute(`data-tool-3d-state`,`live`),O=!0):n.phase===`live`&&r&&h&&(n.phase=`retired`,n.visual.removeAttribute(`data-tool-3d-state`),O=!0),n.phase===`live`&&(t=!0)}h&&!t&&y()},xe=()=>{let e=window.scrollY,t=window.innerHeight,n=0;for(let r of j){let i=r.slot;if(!i)continue;let a=de(i,e,t);if(a>=0&&!h&&J.length>0)for(let e=J.length-1;e>=0;--e){if(J[e].cell!==r)continue;let[t]=J.splice(e,1);t.artwork.apply(t.texture),O=!0}r.phase===`live`&&a>=0&&(h||a>lt*t)&&_e(r),r.phase===`live`&&(n+=1)}if(h){n||y();return}let r=j.filter(e=>e.phase===`ready`&&e.slot).map(n=>[n,de(n.slot,e,t)]).filter(([,e])=>e>=0&&e<=ct*t).sort((e,t)=>e[1]-t[1]);for(let[i,a]of r){if(n>=ut){let r=j.filter(e=>e.phase===`live`&&e.slot).map(n=>[n,de(n.slot,e,t)]).filter(([,e])=>e>=a).sort((e,t)=>t[1]-e[1])[0];if(!r)break;_e(r[0]),--n}he(i)&&(n+=1)}},Y=0,Se=0,Ce=0,Te=[],Ee=()=>{if(l===`high`){l=`balanced`,C.uGrain.value=0,n.onDegrade(`balanced`),je();return}n.onDegrade(`static`),h=!0},De=(e,t)=>{if(!t||h){Y=0;return}if(Y&&(Se+=e-Y,Ce+=1,Te.push(e-Y)),Y=e,Se<vt)return;let n=Ce*1e3/Se,r=c?it:ht[l],i=[...Te].sort((e,t)=>e-t),a=i[Math.floor(i.length*.05)]||16.7,o=Math.min(_t[1],Math.max(_t[0],1e3/a)),s=r??o,u=r?gt.capped:gt.free;Te=[],Se=0,Ce=0,n<s*u&&Ee()},X=0,Oe=0,ke=e(),Z=e=>{if(X=0,f)return;if((l===`soft`||c)&&!ke.ready(e)){X=requestAnimationFrame(Z);return}let t=Oe?Math.min(e-Oe,100):16.7;Oe=e;let n=1-Math.exp(-t/Ze),r=!0;s?r=ve(n):(F+=(N-F)*n,Math.abs(N-F)<Qe?F=N:r=!1);let i=+!!z();if(B!==i&&(B+=(i-B)*(1-Math.exp(-t/bt)),Math.abs(i-B)<.002?B=i:r=!1,C.uNight.value=B,O=!0),s?xe():be(),!p){if(De(e,s?ye():se()),r){Oe=0,Y=0,ke.reset();return}X=requestAnimationFrame(Z)}},Q=()=>{!X&&!f&&(X=requestAnimationFrame(Z))},Ae=()=>{L(),Q()},je=()=>s?fe():V(),$=()=>{L(),je(),Q()};window.addEventListener(`scroll`,Ae,{passive:!0}),window.addEventListener(`resize`,$);let Ne=new ResizeObserver(()=>{L(),je(),Q()});s||Ne.observe(a),Ne.observe(o);for(let e of j)Ne.observe(e.visual);let Pe=new MutationObserver(Q);Pe.observe(document.documentElement,{attributes:!0,attributeFilter:[`class`]}),R.addEventListener(`change`,Q);let Fe=e=>{e.preventDefault(),y()};r.addEventListener(`webglcontextlost`,Fe),L();let Ie=(e,t)=>{if(e.id===`plan`){let n=[...e.visual.querySelectorAll(`img`)],r=s?at.hold/10:Number.parseFloat(getComputedStyle(e.layer).getPropertyValue(`--page-fade`));return n.length===3&&r>0?ge(t,n,r):null}return e.id===`shua`?Me(t):e.id===`gang`?Xe(t):we(t)},Le=e=>{if(!(!T||!e.exhibit)){if(s){e.slot&&me(e,!1),O=!0;return}T.clear(),U(e,I(),1),O=!0,se()}},Re=(e,t)=>{let n=null;return re.add(()=>{n=Ie(e,t)}),n};return(async()=>{if(await Tt(),f)return;try{let e=n.tier===`soft`;T=new m({canvas:r,context:i,alpha:!0,antialias:!e,premultipliedAlpha:!0,failIfMajorPerformanceCaveat:!e})}catch{y();return}T.debug.onShaderError=()=>y(),T.setClearColor(0,0),T.autoClear=!1,T.setPixelRatio(S());let e=l===`soft`?1:T.capabilities.getMaxAnisotropy();for(let e of j){if(await Tt(),f)return;let n=null;try{let r={enter:e.holdStart-e.enterStart,hold:e.holdEnd-e.holdStart,exit:e.holdStart-e.enterStart},i={value:t.layers.indexOf(e.layer)%2};n=Re(e,{detail:l,shared:{...C,uFade:e.fade,uFadeFlip:i},beats:r,track:_})}catch{n=null}if(!n){e.phase=`failed`;continue}e.exhibit=n,n.root.visible=!1,ne.add(n.root)}for(let t of j)for(let n of t.exhibit?.artwork??[])(async()=>{try{let r=await te(n.url,_);if(await Tt(),f||p||!T||!r)return;r.anisotropy=Math.min(8,e),T.initTexture(r),J.push({cell:t,artwork:n,texture:r}),Q()}catch{}})();for(let t of j){let n=t.exhibit?.textures??[];if(!n.length)continue;let r=await Promise.all(n.map(e=>Et(e.image)));if(f)return;if(!r.every(Boolean)){t.phase=`failed`;continue}for(let t of n){let n=await Dt(t.image);if(f){n?.close();return}if(n&&(_({dispose:()=>n.close()}),t.image=n),await Tt(),f||!T)return;t.anisotropy=Math.min(8,e),t.needsUpdate=!0,T.initTexture(t)}}if(await Tt(),!(f||!T)&&(await T.compileAsync(ne,w),!(f||p))){je();for(let e of j)if(e.phase===`building`){if(await Tt(),f||p)return;Le(e),e.phase=`ready`,Q()}j.every(e=>e.phase===`failed`)&&y()}})().catch(()=>y()),{release:()=>{if(!f){f=!0,X&&cancelAnimationFrame(X),X=0,window.removeEventListener(`scroll`,Ae),window.removeEventListener(`resize`,$),Ne.disconnect(),Pe.disconnect(),R.removeEventListener(`change`,Q),r.removeEventListener(`webglcontextlost`,Fe),re.revert();for(let e of j)e.visual.removeAttribute(`data-tool-3d-state`),e.slot&&(e.slot.media.style.removeProperty(`opacity`),e.slot.display?.remove(),e.slot.display=null);r.remove();for(let e of g)e.dispose();T?(T.dispose(),i.isContextLost()||T.forceContextLoss()):i.isContextLost()||i.getExtension(`WEBGL_lose_context`)?.loseContext()}},status:()=>({pixelRatio:s?W:T?.getPixelRatio()??0,canvas:T?[r.width,r.height]:null,frames:d,cells:j.map(e=>({id:e.id,live:e.phase===`live`,canvas:e.slot?.display?[e.slot.display.width,e.slot.display.height]:null})),copyCheck:{samples:K.length,medianMs:q,passed:q===null?null:q<=ft}})}}export{Ot as mountToolScene};