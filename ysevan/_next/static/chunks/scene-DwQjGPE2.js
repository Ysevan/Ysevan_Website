import{t as e}from"./frame-pacer-C2fpi5-G.js";import{t}from"./base-path-eL8HHVK0.js";import{C as n,E as r,S as i,T as a,_ as o,b as s,c,d as l,g as u,h as d,l as f,m as p,n as m,o as h,r as g,s as _,t as ee,v,w as y,x as b,y as x}from"./gsap-Xjoobghy.js";var S=15e3;function C(e){return new Promise(t=>{let n=new Image,r=e=>{window.clearTimeout(i),t(e)},i=window.setTimeout(()=>r(null),S);n.addEventListener(`load`,()=>r(n.naturalWidth>0?n:null),{once:!0}),n.addEventListener(`error`,()=>r(null),{once:!0}),n.src=e})}async function te(e,t){let n=null,r=new AbortController,a=window.setTimeout(()=>r.abort(),S);try{if(typeof window.createImageBitmap==`function`){let t=await fetch(e,{mode:`same-origin`,signal:r.signal});t.ok&&(n=await window.createImageBitmap(await t.blob()))}else n=await C(e)}catch{n=null}finally{window.clearTimeout(a)}if(!n)return null;if(typeof ImageBitmap<`u`&&n instanceof ImageBitmap){let e=n;t({dispose:()=>e.close()})}let o=t(new i(n));return o.colorSpace=v,o.flipY=!1,o.needsUpdate=!0,o}var w=.38,T=.31,E={side:.3,top:.3,bottom:.3},D=e=>e*e*(3-2*e),O=e=>e<0?0:e>1?1:e,k=(e,t,n)=>e+(t-e)*n,A=(e,t,n)=>D(O((e-t)/(n-t)));function j(){return ee.timeline({paused:!0,defaults:{ease:`none`}})}function M(e,t,n,r,i,a=D){e.fromTo(t,{[n]:0},{[n]:1,duration:i-r,ease:a,immediateRender:!1},r)}var N=(e,t)=>e.enter+e.hold*t;function P(e,t,n){let r=n.enter+n.hold+n.exit;M(e,t,`enter`,0,n.enter),M(e,t,`exit`,n.enter+n.hold,r),e.duration()<r&&e.set({},{},r)}function F(e,t){return{uNight:{value:0},uGrain:{value:+!!e},uDpr:{value:t},uFade:{value:1},uFadeFlip:{value:0}}}var I=(()=>{let e=new h(`#6E8A93`),t=Math.max(e.r,e.g,e.b);return new a(e.r/t,e.g/t,e.b/t)})(),L=`
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
`,R=`
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
`,ne=new h(`#3E3C35`);function z(e,t){let n=e.lines,i=e.dot;return{...e.backMap?{uMapBack:{value:null},uUseMapBack:{value:0},uMapBackRect:{value:new r(...e.backMapRect??[0,0,1,1])}}:{},uNight:t.uNight,uGrain:t.uGrain,uDpr:t.uDpr,uFade:t.uFade,uFadeFlip:t.uFadeFlip,uBayTint:{value:I},uColor:{value:new h(e.color)},uSideColor:{value:new h(e.side??e.color)},uSideStripes:{value:e.sideStripes??0},uEdgePx:{value:e.edgePx??1.4},uHinge:{value:+!!e.hinge},uFlip:{value:0},uCurl:{value:0},uLift:{value:0},uMap:{value:e.map??null},uUseMap:{value:+!!e.map},uMapRect:{value:new r(...e.mapRect??[0,0,1,1])},uMapPaper:{value:+!!e.mapPaper},uLines:{value:new r(...n?.rect??[0,0,1,1])},uLineSpec:{value:new a(n?.rows??0,n?.widthPx??.7,n?.seed??0)},uLinesBack:{value:+!!n?.back},uInk:{value:ne},uDot:{value:new r(i?.u??0,i?.v??0,i?.radius??0,+!!i)},uDotColor:{value:new h(i?.color??`#000000`)},uFaceSize:{value:new y(...e.faceSize??[1,1])}}}var re=R.replace(`uniform vec3 uColor;`,`uniform float uMapBias;
uniform vec3 uColor;`).replace(`texture2D(uMap, vec2(m.x, 1.0 - m.y)).rgb`,`texture2D(uMap, vec2(m.x, 1.0 - m.y), uMapBias).rgb`);function B(e,t){let n=z(e,t);return e.mapBias&&(n.uMapBias=e.mapBias),new s({vertexShader:L,fragmentShader:e.mapBias?re:R,side:2,defines:e.backMap?{BACKMAP:``}:void 0,uniforms:n})}function V(e){let t=[0];for(let n=1;n<e.length;n+=1)t.push(t[n-1]+e[n].distanceTo(e[n-1]));return{points:e,acc:t}}function H(e,t){let n=z(e,t),r=e.ink?V(e.ink.points):null,i=Array.from({length:16},()=>new y);return n.uCard={value:new a(e.halfWidth,e.halfHeight,e.radius)},n.uInkGrow={value:0},n.uInkColor={value:new h(e.ink?.color??`#000000`)},n.uInkPts={value:r?r.points:i},n.uInkAcc={value:r?r.acc:Array(16).fill(0)},e.holo&&(n.uHoloPhase={value:0},n.uHoloSweep={value:.5},n.uHoloStrength={value:e.holo.strength}),new s({vertexShader:L,fragmentShader:R,side:2,defines:e.holo?{CARD:``,INK_N:16,HOLO:``}:{CARD:``,INK_N:16},uniforms:n})}var ie=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,ae=`
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
`;function oe(e){return new s({vertexShader:ie,fragmentShader:ae,transparent:!0,depthWrite:!1,uniforms:{uColor:{value:new h(74/255,77/255,53/255).convertSRGBToLinear()},uAlpha:{value:.22},uNight:e.uNight,uFade:e.uFade}})}var U={paper:`#FFFDFA`,paperSoft:`#F6F5F1`,paperEdge:`#E4E0D6`,pageEdge:`#E9E4D8`,clay:`#C9C6B4`,olive:`#D5D4C1`,planBrand:`#2563EB`,shuaBrand:`#B4232C`,gangBrand:`#8F1D2C`,cardBrand:`#10666E`,cardMatte:`#182B3D`,cardMark:`#33556E`},se=.08,W=.09,G=3.3600000000000003,K=2.533333333333333,q=14*Math.PI/180,J=2.583333333333333,ce=3.4400000000000004,le=J*Math.cos(q),ue=[.012,.008,.004],de=[-.004,-.008,-.012],fe=1.5,pe={side:.3,top:.62,bottom:.3},me=class extends c{constructor(e,t,n){super(),this.turns=e,this.radius=t,this.length=n}getPoint(e,t=new a){let n=e*this.turns*Math.PI*2;return t.set((e-.5)*this.length,Math.cos(n)*this.radius,Math.sin(n)*this.radius)}};function he(e){let t=Math.cos(q),n=Math.sin(q),r=new a(0,-t,e?n:-n),i=new a(e?1:-1,0,0),o=new a().crossVectors(r,i);return new p().makeBasis(r,i,o)}function ge(e,t,r){let{detail:a,shared:s,track:c,beats:u,mapBias:f}=e,p=new l,m=new l;m.position.y=-le/2+.02,p.add(m);let h=new d(c(new o(4.6,2.2)),c(oe(s)));h.rotation.x=-Math.PI/2,h.position.y=.004,m.add(h);let _=c(new g(J,ce,.03)),ee=c(B({color:U.clay,edgePx:1.3},s));for(let e of[!0,!1]){let t=new l;t.position.y=le,t.quaternion.setFromRotationMatrix(he(e));let n=new d(_,ee);n.position.set(J/2,0,-.022),t.add(n),m.add(t)}let y=new l;y.position.y=le,y.quaternion.setFromRotationMatrix(he(!0)),m.add(y);let b=c(new o(K,G,a===`high`?28:14,1));b.translate(K/2,0,0);let x=b.attributes.position,S=b.attributes.uv;for(let e=0;e<x.count;e+=1)S.setXY(e,(x.getY(e)+G/2)/G,1-x.getX(e)/K);S.needsUpdate=!0;let C=t.map(e=>{let t=c(new i(e));return t.colorSpace=v,t.flipY=!1,t}),te=C.map((e,t)=>{let n=c(B({color:U.paper,side:U.paperSoft,hinge:!0,edgePx:1.2,map:e,mapRect:[se/G,W/K,1-se/G,2.223333333333333/K],dot:{u:.2/G,v:1-.205/K,radius:.052,color:U.planBrand},lines:{rect:[.34/G,1-.26/K,2.2800000000000002/G,1-.15/K],rows:1,seed:t+1,widthPx:.9},faceSize:[G,K],mapBias:f},s));n.uniforms.uLift.value=ue[t];let r=new d(b,n);return y.add(r),n}),E=c(new n(new me(8,.066,.4),a===`high`?128:64,.0105,a===`high`?6:4)),D=c(B({color:U.planBrand,edgePx:0},s));for(let e of[-.9,.9]){let t=new d(E,D);t.position.set(e,le+.01,0),m.add(t)}let O={enter:0,exit:0,flip0:0,flip1:0},A=j();P(A,O,u);let F=r/u.hold,I=e=>e/t.length;M(A,O,`flip0`,N(u,I(1)-F),N(u,I(1)+F)),M(A,O,`flip1`,N(u,I(2)-F),N(u,I(2)+F));let L=-1,R=[()=>L<0?O.flip0:+(L>0),()=>L<0?O.flip1:+(L>1),()=>0];return{root:p,margins:pe,timeline:A,apply:()=>{let{enter:e,exit:t}=O;p.position.set(k(1.1,0,e)-t*.25,k(-.8-w,0,e)+t*(.3+T),0),p.rotation.x=.2,p.scale.setScalar(k(.88,1,e)),m.rotation.y=k(1.3,-.38,e)-t*.32,te.forEach((e,t)=>{let n=R[t](),r=Math.PI*2-q*2-.035-t*.02,i=n*r,a=-Math.min(fe*Math.sin(Math.PI*n),(r-i)/K*.95);e.uniforms.uFlip.value=i,e.uniforms.uCurl.value=a,e.uniforms.uLift.value=k(ue[t],de[t],n)})},textures:C,artwork:[],page:e=>{L=e}}}var _e=.936,ve=1.3,ye=.12,be=.055,xe=-.26,Se=t(`/shelf/card-face.v2.webp`),Ce=[[.06,.46],[.5,.86]];function we(e,t,n){let r=new b,i=-e,a=e,o=-t,s=t;return r.moveTo(i+n,o),r.lineTo(a-n,o),r.absarc(a-n,o+n,n,-Math.PI/2,0,!1),r.lineTo(a,s-n),r.absarc(a-n,s-n,n,0,Math.PI/2,!1),r.lineTo(i+n,s),r.absarc(i+n,s-n,n,Math.PI/2,Math.PI,!1),r.lineTo(i,o+n),r.absarc(i+n,o+n,n,Math.PI,Math.PI*1.5,!1),r}function Te(){return Array.from({length:16},(e,t)=>{let n=t/15;return new y(-.4+.8*n,-.2+Math.sin(n*Math.PI*2)*.11)})}function Ee(e){let{detail:t,shared:n,track:r,beats:i}=e,a=new l,s=new d(r(new o(3,1.2)),r(oe(n)));s.rotation.x=-Math.PI/2,s.position.y=-1.46,a.add(s);let c=r(new f(we(_e,ve,ye),{depth:be,bevelEnabled:!1,curveSegments:t===`high`?10:5}));c.translate(0,0,-.055/2);let u=r(H({color:U.cardMatte,side:U.cardBrand,edgePx:1.3,halfWidth:_e,halfHeight:ve,radius:ye,mapPaper:!0,holo:{strength:.16},ink:{points:Te(),color:U.cardMark}},n));u.uniforms.uInkGrow.value=1;let p=new d(c,u);p.rotation.order=`ZYX`,a.add(p);let m={enter:0,exit:0,flip0:0,flip1:0},h=j();return P(h,m,i),M(h,m,`flip0`,N(i,Ce[0][0]),N(i,Ce[0][1])),M(h,m,`flip1`,N(i,Ce[1][0]),N(i,Ce[1][1])),{root:a,margins:E,timeline:h,apply:()=>{let{enter:e,exit:t,flip0:n,flip1:r}=m;a.position.set(k(1.1,0,e)-t*.3,k(-.62-w,0,e)+t*(.3+T),0),a.rotation.x=.12,a.scale.setScalar(k(.9,1,e));let i=k(1.45,xe,e)-Math.PI*(n+r)-t*.3;p.rotation.y=i;let o=Math.sin(Math.PI*O(n))+Math.sin(Math.PI*O(r));p.position.set(0,o*.06,o*.14),u.uniforms.uHoloPhase.value=i*.55,u.uniforms.uHoloSweep.value=.5-Math.sin(i)*.55},textures:[],artwork:[{url:Se,apply:e=>{u.uniforms.uMap.value=e,u.uniforms.uUseMap.value=1}}]}}var De=1.08,Oe=1.05,ke=.46,Y=.022,Ae=5,je=t(`/shelf/shua-card-front.v1.webp`),X=[{x:.29,y:-.12,z:0,tilt:4.5},{x:-.29,y:.12,z:-.05,tilt:-7},{x:.06,y:.03,z:-.1,tilt:1.5},{x:-.05,y:-.02,z:-.15,tilt:-2.5},{x:.02,y:.05,z:-.2,tilt:2}].map(e=>({...e,tilt:e.tilt*Math.PI/180}));function Z(e){let t=Math.min(Math.max(e,0),X.length-1),n=Math.floor(t),r=Math.min(n+1,X.length-1),i=t-n,a=X[n],o=X[r];return{x:k(a.x,o.x,i),y:k(a.y,o.y,i),z:k(a.z,o.z,i),tilt:k(a.tilt,o.tilt,i)}}function Me(e,t,n){let r=new b,i=-e,a=e,o=-t,s=t;return r.moveTo(i+n,o),r.lineTo(a-n,o),r.absarc(a-n,o+n,n,-Math.PI/2,0,!1),r.lineTo(a,s-n),r.absarc(a-n,s-n,n,0,Math.PI/2,!1),r.lineTo(i+n,s),r.absarc(i+n,s-n,n,Math.PI/2,Math.PI,!1),r.lineTo(i,o+n),r.absarc(i+n,o+n,n,Math.PI,Math.PI*1.5,!1),r}function Ne(){let e=2*De/21.5*1.5,t=(t,n)=>new y((t-22.75)*e,(22-n)*e),n=new _(t(17.4,22.6),t(18.7,23.6),t(19.5,24.5),t(20,25.3)),r=new _(t(20,25.3),t(21.6,22.6),t(23.4,20.4),t(25.6,18.7)),i=n.getSpacedPoints(5),a=r.getSpacedPoints(16-i.length).slice(1);return[...i,...a]}function Pe(e){let{detail:t,shared:n,track:r,beats:i}=e,a=new l,s=new l;a.add(s);let c=new d(r(new o(4,1.5)),r(oe(n)));c.rotation.x=-Math.PI/2,c.position.y=-1.48,a.add(c);let u=r(new f(Me(De,Oe,ke),{depth:Y,bevelEnabled:!1,curveSegments:t===`high`?10:5}));u.translate(0,0,-.022/2);let p=Ne(),m=[];for(let e=0;e<Ae;e+=1){let t=r(H({color:e%2?U.paperSoft:U.paper,side:U.paperEdge,edgePx:1.3,halfWidth:De,halfHeight:Oe,radius:ke,lines:{rect:[.16,.44,.84,.8],rows:3,seed:e*3+1,widthPx:.85},mapPaper:!0,ink:e===2?{points:p,color:U.shuaBrand}:void 0},n)),i=new d(u,t);i.rotation.order=`ZYX`,s.add(i),m.push({mesh:i,material:t})}let h={enter:0,exit:0,swipe0:0,swipe1:0,turn2:0,ink:0,swap:0},g=j();P(g,h,i),M(g,h,`swipe0`,N(i,.025),N(i,.25),e=>e),M(g,h,`swipe1`,N(i,.275),N(i,.5),e=>e),M(g,h,`turn2`,N(i,.525),N(i,.65)),M(g,h,`ink`,N(i,.625),N(i,.8)),M(g,h,`swap`,N(i,.825),N(i,.95));let _=(e,t)=>{let n=A(e,0,.5),r=A(e,.45,.7),i=A(e,.68,1),a=X[0],o=Z(t),s=a.x-1.9;return{x:k(k(a.x,s,n),o.x,i),y:k(k(a.y,a.y+.18,n),o.y,i),z:k(a.z+Math.sin(Math.PI*O(e/.5))*.35,o.z-.06*(1-i),r),flip:-Math.PI*n,tilt:k(k(a.tilt,-12*Math.PI/180,n),o.tilt,i)}};return{root:a,margins:E,timeline:g,apply:()=>{let{enter:e,exit:t}=h;a.position.set(k(1.1,.05,e)-t*.3,k(-.8-w,.08,e)+t*(.3+T),0),a.rotation.x=.24,a.scale.setScalar(k(.9,1,e)),s.rotation.y=k(1.42,-.2,e)-t*.3;let n=D(O((h.swipe0-.45)/.55)),r=D(O((h.swipe1-.45)/.55));m.forEach(({mesh:e,material:t},i)=>{let a;if(i===0)a=h.swipe0<1?_(h.swipe0,4):{...Z(4-r),flip:-Math.PI};else if(i===1)a=h.swipe1>0?_(h.swipe1,4):{...Z(1-n),flip:0};else{let e=i===2?h.swap:i===3?-h.swap:0,t=Z(i-n-r+e),o=0,s=t.z;i===2?(o=-Math.PI*h.turn2,s+=Math.sin(Math.PI*h.turn2)*.32):i===3&&(s+=Math.sin(Math.PI*h.swap)*.3),a={...t,z:s,flip:o}}e.position.set(a.x,a.y,a.z),e.rotation.set(0,a.flip,a.tilt),i===2&&(t.uniforms.uInkGrow.value=h.ink)})},textures:[],artwork:[{url:je,apply:e=>{for(let{material:t}of m)t.uniforms.uMap.value=e,t.uniforms.uUseMap.value=1}}]}}var Fe=1.9,Ie=2.6,Q=.035,Le=.09,Re=.125,ze=.28,$=ze/2,Be=3,Ve=[.012,.008,.004],He=[.004,.008,.012],Ue=t(`/shelf/gang-cover.v1.webp`),We={a:t(`/shelf/gang-page-a.v1.webp`),b:t(`/shelf/gang-page-b.v1.webp`),c:t(`/shelf/gang-page-c.v1.webp`),d:t(`/shelf/gang-page-d.v1.webp`)},Ge=[-.2,.1],Ke=[[.125,.35],[.375,.6],[.625,.85]],qe=.12,Je=.95,Ye=.26;function Xe(e){let t=.1265,n=t*.72,r=Math.PI/2*n,i=e*(Je+r+Ye);if(i<=Je)return new a(qe,-.3500000000000001-i,t);if(i<=Je+r){let e=(i-Je)/r*(Math.PI/2);return new a(qe,-1.3-Math.sin(e)*n,t-(1-Math.cos(e))*n)}let o=(i-Je-r)/Ye;return new a(qe+o*.07,-1.39108-o*Ye,k(.03542000000000001,.004,Math.min(o*2.5,1)))}function Ze(e){let{detail:t,shared:n,track:r,beats:i}=e,a=new l,s=new l;a.add(s);let c=new l;c.rotation.x=-Math.PI/2,s.add(c);let u=new d(r(new o(5.3,3.9)),r(oe(n)));u.rotation.x=-Math.PI/2,u.position.y=.002,s.add(u);let f=r(B({color:U.olive,edgePx:1.4},n)),p=r(new g(1.96,2.72,Q)),m=(e,t=!1)=>({rect:[.14,.1,.88,.86],rows:11,seed:e,back:t,widthPx:.7}),h=r(new g(Fe,Ie,Le)),_=r(B({color:U.pageEdge,sideStripes:160,edgePx:.9},n)),ee=e=>r(B({color:U.paper,edgePx:1,lines:m(e),mapPaper:!0},n)),v=e=>[_,_,_,_,e,_],y=new d(p,f);y.position.set(1.96/2,0,Q/2);let b=ee(11),x=new d(h,v(b));x.position.set(Fe/2,0,.08),c.add(y,x);let S=new l;S.position.z=$;let C=new d(p,f);C.position.set(-1.96/2,0,Q/2-$);let te=ee(23),D=new d(h,v(te));D.position.set(-1.9/2,0,-.06000000000000001);let O=new d(r(new o(.92,.5)),r(B({color:U.paper,edgePx:1.1,lines:{rect:[.16,.24,.84,.76],rows:2,seed:5,widthPx:1}},n)));O.rotation.y=Math.PI,O.position.set(-1.96/2,.38,-.14-.002);let A=r(B({color:U.olive,edgePx:1.4,mapPaper:!0},n)),F=new d(r(new o(1.96,2.72)),A);F.rotation.y=Math.PI,F.position.set(-1.96/2,0,-.14-.002),F.visible=!1,S.add(C,D,O,F),c.add(S);let I=new d(r(new g(ze,2.72,Q)),f);c.add(I);let L=r(new o(Fe,Ie,t===`high`?24:12,1));L.translate(Fe/2,0,0);let R=[];for(let e=0;e<Be;e+=1){let t=r(B({color:U.paper,side:U.paperSoft,hinge:!0,edgePx:1,lines:m(31+e*7,!0),mapPaper:!0,backMap:!0},n));t.uniforms.uLift.value=Ve[e];let i=new d(L,t);i.position.z=Re,c.add(i),R.push(t)}let ne=r(new o(.1,1,1,t===`high`?32:16)),z=ne.attributes.position;for(let e=0;e<z.count;e+=1){let t=Xe(.5-z.getY(e));z.setXYZ(e,t.x+z.getX(e),t.y,t.z)}z.needsUpdate=!0,ne.computeVertexNormals();let re=new d(ne,r(B({color:U.gangBrand,edgePx:1},n)));c.add(re);let V={enter:0,exit:0,open:0,sheet0:0,sheet1:0,sheet2:0},H=j();P(H,V,i),M(H,V,`open`,N(i,Ge[0]),N(i,Ge[1])),M(H,V,`sheet0`,N(i,Ke[0][0]),N(i,Ke[0][1])),M(H,V,`sheet1`,N(i,Ke[1][0]),N(i,Ke[1][1])),M(H,V,`sheet2`,N(i,Ke[2][0]),N(i,Ke[2][1]));let ie=[()=>V.sheet0,()=>V.sheet1,()=>V.sheet2],ae=()=>{let{enter:e,exit:t,open:n}=V;a.position.set(k(1.1,0,e)-t*.3,k(-.9-w,-.12,e)+t*(.3+T),0),a.rotation.x=.86,a.scale.setScalar(k(.76,.84,e)),s.rotation.y=k(Math.PI/2,-.1,e)-t*.3,c.position.x=-.98*(1-n);let r=Math.PI*(1-n);S.rotation.y=r,I.rotation.y=r/2,I.position.set(k(0,-.035/2,1-n),0,k(-.0165,$,1-n)),R.forEach((e,t)=>{let n=ie[t](),r=n*Math.PI;e.uniforms.uFlip.value=r,e.uniforms.uCurl.value=Math.min(.5*Math.sin(Math.PI*n),r/Fe*.95),e.uniforms.uLift.value=k(Ve[t],-He[t],n)})},se={a:[{material:te},{material:R[1],back:!0}],b:[{material:R[0]},{material:R[2]}],c:[{material:R[0],back:!0},{material:R[2],back:!0}],d:[{material:R[1]},{material:b}]},W=(e,t,n)=>{e[n?`uMapBack`:`uMap`].value=t,e[n?`uUseMapBack`:`uUseMap`].value=1};return{root:a,margins:E,timeline:H,apply:ae,textures:[],artwork:[{url:Ue,apply:e=>{W(A.uniforms,e),F.visible=!0,O.visible=!1}},...Object.entries(We).map(([e,t])=>({url:t,apply:t=>{for(let n of se[e])W(n.material.uniforms,t,n.back)}}))]}}var Qe=140,$e=4e-4;function et(e,t){let n=(e,t)=>Number.parseFloat(getComputedStyle(e).getPropertyValue(t)),r=n(e,`--rail-end`),i=n(e,`--fade`),a=t.map(e=>[n(e,`--hold-start`),n(e,`--hold-end`)]),o=0;for(let[e,t]of a){if(!(e>=o&&t>=e))return null;o=t}return i>0&&a.length>0&&o===r?{end:r,fade:i,holds:a}:null}var tt={high:1.75,balanced:1.25,soft:1.5},nt=8e5,rt=2,it=13e5,at=30,ot={enter:.45,hold:.55,exit:.45},st=new Set([`plan`,`card`]),ct=.575,lt=.5,ut=1,dt=3,ft=8,pt=4,mt=3.5,ht=3,gt=-1,_t=50;function vt(){let e=navigator.deviceMemory;return typeof e==`number`&&e>4?mt:ht}var yt=28,bt=3*(1+2*E.top)/2/Math.tan(yt*Math.PI/360),xt={soft:30},St={capped:.6,free:.55},Ct=[30,120],wt=3e3,Tt=15e3,Et=240,Dt=5e-4,Ot=e=>e.id===`plan`?E:e.exhibit?.margins??E;function kt(e){return Number.parseFloat(e.style.getPropertyValue(`--rail-progress`))||0}function At(e,t){let n=0,r=0;for(let i=e;i&&i!==t;i=i.offsetParent)if(n+=i.offsetLeft,r+=i.offsetTop,i.offsetParent===null)return null;return{x:n,y:r}}function jt(){return new Promise(e=>{typeof window.requestIdleCallback==`function`?window.requestIdleCallback(()=>e(),{timeout:300}):window.setTimeout(e,16)})}function Mt(e){return e.loading=`eager`,new Promise(t=>{if(e.complete){t(e.naturalWidth>0);return}let n=n=>{window.clearTimeout(a),e.removeEventListener(`load`,r),e.removeEventListener(`error`,i),t(n)},r=()=>n(!0),i=()=>n(!1),a=window.setTimeout(()=>n(!1),Tt);e.addEventListener(`load`,r),e.addEventListener(`error`,i)}).then(t=>t?Promise.race([e.decode().then(()=>!0,()=>!0),new Promise(e=>window.setTimeout(()=>e(!0),300))]):!1)}async function Nt(e){if(typeof window.createImageBitmap!=`function`)return null;try{let t=await fetch(e.currentSrc||e.src,{cache:`only-if-cached`,mode:`same-origin`});if(t.ok)return await window.createImageBitmap(await t.blob())}catch{}try{return await window.createImageBitmap(e)}catch{return null}}function Pt(t,n){let{canvas:r,context:i}=n,{rail:a,stage:o}=t,s=n.layout===`cell`,c=n.phone,l=n.tier,d=0,f=!1,p=!1,h=!1,g=[],_=e=>(f?e.dispose():g.push(e),e),v=()=>{f||p||(p=!0,window.setTimeout(()=>n.onFallback(),0))},y={width:0,height:0},b=e=>{let t=window.devicePixelRatio||1;return l===`soft`?Math.min(t,tt.soft,Math.sqrt(nt/(e||1))):c?Math.min(t,rt,Math.sqrt(it/(e||1))):Math.min(t,tt[l])},S=()=>b(y.width*y.height),C=F(l===`high`,S());r.setAttribute(`aria-hidden`,`true`),r.style.position=`absolute`,r.style.display=`block`,r.style.pointerEvents=`none`;let w=new x,T=new u(yt,1.5,.1,100);T.position.z=bt;let E=null,k=!1,A=NaN,j=s?null:et(a,t.layers),M=t.exhibits.flatMap(e=>{let[n,r]=s?[ot.enter,ot.enter+ot.hold]:j?.holds[t.layers.indexOf(e.layer)]??[0,0],i=s?ot.enter:j?.fade??1,a=s&&e.id===`plan`?Math.max(1,e.visual.querySelectorAll(`figure`).length):1,o={value:1};return Array.from({length:a},(t,a)=>({...e,exhibit:null,holdStart:n,holdEnd:r,enterStart:n-i,total:r-n+2*i,fade:o,view:null,phase:`building`,slot:null,page:a}))}),N=(e,t)=>{let n=j?.fade??1;return D(O((t-e.holdStart)/n+1))*(1-D(O((t-e.holdEnd)/n)))},P=0,I=kt(a),L=()=>I*(j?.end??0),R=()=>{if(s){P=0;return}let e=a.getBoundingClientRect(),t=e.height-window.innerHeight;P=t>0?O(-e.top/t):0};if(!s&&!j||M.some(e=>!t.layers.includes(e.layer)))return v(),{release:()=>{f=!0,i.getExtension(`WEBGL_lose_context`)?.loseContext()},status:()=>({pixelRatio:0,canvas:null,frames:0,cells:[],copyCheck:{samples:0,medianMs:null,passed:null},rest:{ratio:0,slices:0,lastMs:null,maxMs:null,over:0}})};let ne=ee.context(()=>{}),z=window.matchMedia(`(prefers-color-scheme: dark)`),re=()=>{let e=document.documentElement.classList;return e.contains(`dark`)?!0:!e.contains(`light`)&&z.matches},B=+!!re();C.uNight.value=B;let V=()=>{if(!E)return;let e=1/0,t=1/0,n=-1/0,i=-1/0,a=new Map;for(let r of M){if(!r.exhibit)continue;let s=At(r.visual,o),c=r.visual.offsetWidth;if(!s||c<=0)continue;let l=c/1.5,{side:u,top:d,bottom:f}=r.exhibit.margins;a.set(r,{x:s.x,y:s.y,width:c,height:l}),e=Math.min(e,s.x-c*u),n=Math.max(n,s.x+c*(1+u)),t=Math.min(t,s.y-l*d),i=Math.max(i,s.y+l*(1+f))}if(!a.size)return;let s=n-e,c=i-t;r.style.left=`${e}px`,r.style.top=`${t}px`,r.style.width=`${s}px`,r.style.height=`${c}px`,y.width=s,y.height=c;for(let n of M){let r=a.get(n);n.view=r?{x:r.x-e,y:r.y-t,width:r.width,height:r.height}:null}E.setPixelRatio(S()),E.setSize(s,c,!1),C.uDpr.value=E.getPixelRatio(),r.isConnected||o.appendChild(r),k=!0},H=e=>{let t=e.view;return t?(ie(t,y.width,y.height),!0):!1},ie=(e,t,n,r=0,i=0,a=t,o=n)=>{let s=e.x+e.width/2,c=e.y+e.height/2,l=Math.max(s,t-s),u=Math.max(c,n-c);T.fov=2*Math.atan(3*(2*u/e.height)/2/bt)*180/Math.PI,T.aspect=l/u,T.setViewOffset(2*l,2*u,l-s+r,u-c+i,a,o),T.updateProjectionMatrix()},ae=e=>{for(let t of M)t.exhibit&&(t.exhibit.root.visible=t.exhibit===e?.exhibit)},oe=(e,t,n)=>!E||!e.exhibit||!H(e)?!1:(U(e,t,n),!0),U=(e,t,n)=>{!E||!e.exhibit||(ae(e),e.exhibit.timeline.progress(O((t-e.enterStart)/e.total)),s&&e.exhibit.page?.(e.page),e.exhibit.apply(),e.fade.value=n,E.clearDepth(),E.render(w,T),d+=1)},se=()=>{if(!E||!k&&A===I)return!1;let e=L();E.clear();let t=!1;for(let n of M){if(n.phase!==`live`)continue;let r=N(n,e);r>Dt&&(t=oe(n,e,r)||t)}return A=I,k=!1,t},W=1,G=[0,0],K=1,q={value:0},J=0,ce=0,le=null,ue=null,de=0,fe=[],pe=null,me=e=>{if(fe.length>=ft||(fe.push(e),fe.length<ft))return;let t=[...fe].sort((e,t)=>e-t);pe=(t[ft/2-1]+t[ft/2])/2,pe>pt&&!h&&(n.onDegrade(`static`),h=!0)},he=e=>st.has(e.id)?e.holdStart:e.holdEnd,_e=(e,t,n)=>{let r=e.areaTop-t,i=n*ct-e.areaHeight/2;return O((n-r)/(n-i||1))},ve=(e,t,n)=>e.spanTop>=t+n?e.spanTop-t-n:e.spanBottom<=t?t-e.spanBottom:-1,ye=()=>{if(!E)return;let e=window.scrollY,t=window.innerHeight,n=document.documentElement.clientWidth,r=[],i=0,a=0,o=0;for(let t of M){if(!t.exhibit)continue;let s=t.visual.querySelectorAll(`figure`),c=s[t.page]??null,l=c?.firstElementChild??t.visual.querySelector(`img`);if(!l)continue;let u=l.getBoundingClientRect(),d=t.visual.getBoundingClientRect(),f=c?c.getBoundingClientRect():d;if(u.width<=0)continue;let p=u.width/1.5,{side:m,top:h,bottom:g}=Ot(t),_=Math.max(0,u.left-u.width*m),ee=Math.min(n,u.right+u.width*m),v=(t.page>0?s[t.page-1]?.querySelector(`figcaption`):t.layer.querySelector(`[data-tool-open]`))?.getBoundingClientRect(),y=Math.max(u.top+e-p*h,v?v.bottom+e+1:-1/0),b=l.closest(`figure`)?.querySelector(`figcaption`)?.getBoundingClientRect(),x=Math.min(u.top+e+p*(1+g),b?b.top+e-1:1/0),S=ee-_,C=x-y;i=Math.max(i,S*C),a=Math.max(a,S),o=Math.max(o,C),r.push([t,{media:l,areaTop:u.top+e,areaHeight:p,width:S,height:C,offsetLeft:_-d.left,offsetTop:y-(d.top+e),spanTop:Math.min(y,f.top+e),spanBottom:Math.max(x,f.bottom+e),view:{x:u.left-_,y:u.top+e-y,width:u.width,height:p}}])}if(!r.length)return;W=b(a*o+dt*i),K=Math.min(window.devicePixelRatio||1,vt());let s=Math.floor(a*W),c=Math.floor(o*W);(G[0]!==s||G[1]!==c)&&(G[0]=s,G[1]=c,E.setPixelRatio(1),E.setSize(s,c,!1)),C.uDpr.value=W;for(let[n,i]of r){let r=[Math.floor(i.width*W),Math.floor(i.height*W)],a=n.slot,o={...i,device:r,display:a?.display??null,context2d:a?.context2d??null,target:0,current:0,posed:NaN,sharp:!1};o.target=_e(o,e,t),o.current=a&&n.phase===`live`?a.current:o.target,n.slot=o,o.display&&be(o)}k=!0},be=e=>{let t=e.display;t&&(t.style.left=`${e.offsetLeft}px`,t.style.top=`${e.offsetTop}px`,t.style.width=`${e.width}px`,t.style.height=`${e.height}px`)},xe=(e,t,n=W)=>{let i=e.slot;if(!E||!e.exhibit||!i)return!1;let a=n>W,[o,s]=a?[Math.floor(i.width*n),Math.floor(i.height*n)]:i.device,c=t?i.display:null;c&&(c.width!==o||c.height!==s)&&(c.width=o,c.height=s),C.uDpr.value=n,q.value=a?gt:0;let l=i.current*he(e),u=D(O(l/ot.enter)),[d,f]=G;for(let t=0;t<s;t+=f)for(let p=0;p<o;p+=d){let m=Math.min(d,o-p),h=Math.min(f,s-t);if(E.setViewport(0,f-h,m,h),E.clear(),ie(i.view,i.width,i.height,p/n,t/n,m/n,h/n),U(e,l,u),!(!c||!i.context2d)){if(i.context2d.globalCompositeOperation=p===0&&t===0?`copy`:`source-over`,a)i.context2d.drawImage(r,0,0,m,h,p,t,m,h);else{let e=performance.now();i.context2d.drawImage(r,0,0,m,h,p,t,m,h),me(performance.now()-e)}}}return C.uDpr.value=W,q.value=0,c&&(i.posed=i.current,i.sharp=a),!0},Se=e=>{let t=e.slot;if(!t)return!1;let n=document.createElement(`canvas`);n.setAttribute(`aria-hidden`,`true`),n.style.position=`absolute`,n.style.display=`block`,n.style.pointerEvents=`none`;let r=n.getContext(`2d`);return r?(t.display=n,t.context2d=r,be(t),e.visual.appendChild(n),t.current=t.target,xe(e,!0),t.media.style.opacity=`0`,e.visual.setAttribute(`data-tool-3d-state`,`cell`),e.phase=`live`,!0):!1},Ce=e=>{let t=e.slot;t&&(t.media.style.removeProperty(`opacity`),M.some(t=>t!==e&&t.visual===e.visual&&t.phase===`live`)||e.visual.removeAttribute(`data-tool-3d-state`),t.display&&(t.display.remove(),t.display.width=0,t.display.height=0),t.display=null,t.context2d=null,t.posed=NaN,t.sharp=!1,e.phase=h?`retired`:`ready`)},we=e=>{let t=window.scrollY,n=window.innerHeight,r=!0;for(let i of M){let a=i.slot;if(a){if(a.target=_e(a,t,n),i.phase!==`live`){a.current=a.target;continue}a.current+=(a.target-a.current)*e,Math.abs(a.target-a.current)<$e?a.current=a.target:r=!1}}return r},Te=()=>{let e=window.scrollY,t=window.innerHeight,n=!1;for(let r of M){let i=r.slot;r.phase!==`live`||!i?.display||!k&&i.posed===i.current&&!(i.sharp&&ve(i,e,t)>=0)||(n=xe(r,!0)||n)}return k=!1,n},De=()=>{if(J=0,f||p||h||Q||!E)return;let e=window.scrollY,t=window.innerHeight,n=M.filter(n=>n.phase===`live`&&n.slot?.display&&!n.slot.sharp&&ve(n.slot,e,t)<0);if(!n.length)return;let r=performance.now();xe(n[0],!0,K);let i=performance.now()-r;ce+=1,le=i,ue=Math.max(ue??0,i),i>_t&&(de+=1),n.length>1&&Oe()},Oe=()=>{!s||J||K<=W||(J=typeof window.requestIdleCallback==`function`?window.requestIdleCallback(De,{timeout:500}):window.setTimeout(De,50))},ke=()=>{J&&=(typeof window.cancelIdleCallback==`function`?window.cancelIdleCallback(J):window.clearTimeout(J),0)},Y=[],Ae=()=>{let e=L(),t=!1;for(let n of M){let r=N(n,e)<=Dt;if(r&&!h&&Y.length>0)for(let e=Y.length-1;e>=0;--e){if(Y[e].cell!==n)continue;let[t]=Y.splice(e,1);t.artwork.apply(t.texture),k=!0}n.phase===`ready`&&r&&!h?(n.phase=`live`,n.visual.setAttribute(`data-tool-3d-state`,`live`),k=!0):n.phase===`live`&&r&&h&&(n.phase=`retired`,n.visual.removeAttribute(`data-tool-3d-state`),k=!0),n.phase===`live`&&(t=!0)}h&&!t&&v()},je=()=>{let e=window.scrollY,t=window.innerHeight,n=0;for(let r of M){let i=r.slot;if(!i)continue;let a=ve(i,e,t);if(a>=0&&!h&&Y.length>0)for(let e=Y.length-1;e>=0;--e){if(Y[e].cell!==r)continue;let[t]=Y.splice(e,1);t.artwork.apply(t.texture),k=!0}r.phase===`live`&&a>=0&&(h||a>ut*t)&&Ce(r),r.phase===`live`&&(n+=1)}if(h){n||v();return}let r=M.filter(e=>e.phase===`ready`&&e.slot).map(n=>[n,ve(n.slot,e,t)]).filter(([,e])=>e>=0&&e<=lt*t).sort((e,t)=>e[1]-t[1]);for(let[i,a]of r){if(n>=dt){let r=M.filter(e=>e.phase===`live`&&e.slot).map(n=>[n,ve(n.slot,e,t)]).filter(([,e])=>e>=a).sort((e,t)=>t[1]-e[1])[0];if(!r)break;Ce(r[0]),--n}Se(i)&&(n+=1)}},X=0,Z=0,Me=0,Ne=[],Fe=()=>{if(l===`high`){l=`balanced`,C.uGrain.value=0,n.onDegrade(`balanced`),Ve();return}n.onDegrade(`static`),h=!0},Ie=(e,t)=>{if(!t||h){X=0;return}if(X&&(Z+=e-X,Me+=1,Ne.push(e-X)),X=e,Z<wt)return;let n=Me*1e3/Z,r=c?at:xt[l],i=[...Ne].sort((e,t)=>e-t),a=i[Math.floor(i.length*.05)]||16.7,o=Math.min(Ct[1],Math.max(Ct[0],1e3/a)),s=r??o,u=r?St.capped:St.free;Ne=[],Z=0,Me=0,n<s*u&&Fe()},Q=0,Le=0,Re=e(),ze=e=>{if(Q=0,f)return;if((l===`soft`||c)&&!Re.ready(e)){Q=requestAnimationFrame(ze);return}let t=Le?Math.min(e-Le,100):16.7;Le=e;let n=1-Math.exp(-t/Qe),r=!0;s?r=we(n):(I+=(P-I)*n,Math.abs(P-I)<$e?I=P:r=!1);let i=+!!re();if(B!==i&&(B+=(i-B)*(1-Math.exp(-t/Et)),Math.abs(i-B)<.002?B=i:r=!1,C.uNight.value=B,k=!0),s?je():Ae(),!p){if(Ie(e,s?Te():se()),r){Le=0,X=0,Re.reset(),Oe();return}Q=requestAnimationFrame(ze)}},$=()=>{ke(),!Q&&!f&&(Q=requestAnimationFrame(ze))},Be=()=>{R(),$()},Ve=()=>s?ye():V(),He=()=>{R(),Ve(),$()};window.addEventListener(`scroll`,Be,{passive:!0}),window.addEventListener(`resize`,He);let Ue=new ResizeObserver(()=>{R(),Ve(),$()});s||Ue.observe(a),Ue.observe(o);for(let e of M)Ue.observe(e.visual);let We=new MutationObserver($);We.observe(document.documentElement,{attributes:!0,attributeFilter:[`class`]}),z.addEventListener(`change`,$);let Ge=e=>{e.preventDefault(),v()};r.addEventListener(`webglcontextlost`,Ge),R();let Ke=(e,t)=>{if(e.id===`plan`){let n=[...e.visual.querySelectorAll(`img`)],r=s?ot.hold/10:Number.parseFloat(getComputedStyle(e.layer).getPropertyValue(`--page-fade`));return n.length===3&&r>0?ge(t,n,r):null}return e.id===`shua`?Pe(t):e.id===`gang`?Ze(t):Ee(t)},qe=e=>{if(!(!E||!e.exhibit)){if(s){e.slot&&xe(e,!1),k=!0;return}E.clear(),oe(e,L(),1),k=!0,se()}},Je=(e,t)=>{let n=null;return ne.add(()=>{n=Ke(e,t)}),n};return(async()=>{if(await jt(),f)return;try{let e=n.tier===`soft`;E=new m({canvas:r,context:i,alpha:!0,antialias:!e,premultipliedAlpha:!0,failIfMajorPerformanceCaveat:!e})}catch{v();return}E.debug.onShaderError=()=>v(),E.setClearColor(0,0),E.autoClear=!1,E.setPixelRatio(S());let e=l===`soft`?1:E.capabilities.getMaxAnisotropy();for(let e of M){if(e.page>0){e.exhibit=M.find(t=>t.id===e.id&&t.page===0)?.exhibit??null,e.exhibit||(e.phase=`failed`);continue}if(await jt(),f)return;let n=null;try{let r={enter:e.holdStart-e.enterStart,hold:e.holdEnd-e.holdStart,exit:e.holdStart-e.enterStart},i={value:t.layers.indexOf(e.layer)%2};n=Je(e,{detail:l,shared:{...C,uFade:e.fade,uFadeFlip:i},beats:r,track:_,mapBias:s?q:void 0})}catch{n=null}if(!n){e.phase=`failed`;continue}e.exhibit=n,n.root.visible=!1,w.add(n.root)}for(let t of M)if(!(t.page>0))for(let n of t.exhibit?.artwork??[])(async()=>{try{let r=await te(n.url,_);if(await jt(),f||p||!E||!r)return;r.anisotropy=Math.min(8,e),E.initTexture(r),Y.push({cell:t,artwork:n,texture:r}),$()}catch{}})();for(let t of M){let n=t.page>0?[]:t.exhibit?.textures??[];if(!n.length)continue;let r=await Promise.all(n.map(e=>Mt(e.image)));if(f)return;if(!r.every(Boolean)){for(let e of M)e.exhibit===t.exhibit&&(e.phase=`failed`);continue}for(let t of n){let n=await Nt(t.image);if(f){n?.close();return}if(n&&(_({dispose:()=>n.close()}),t.image=n),await jt(),f||!E)return;t.anisotropy=Math.min(8,e),t.needsUpdate=!0,E.initTexture(t)}}if(await jt(),!(f||!E)&&(await E.compileAsync(w,T),!(f||p))){Ve();for(let e of M)if(e.phase===`building`){if(await jt(),f||p)return;qe(e),e.phase=`ready`,$()}M.every(e=>e.phase===`failed`)&&v()}})().catch(()=>v()),{release:()=>{if(!f){f=!0,Q&&cancelAnimationFrame(Q),Q=0,ke(),window.removeEventListener(`scroll`,Be),window.removeEventListener(`resize`,He),Ue.disconnect(),We.disconnect(),z.removeEventListener(`change`,$),r.removeEventListener(`webglcontextlost`,Ge),ne.revert();for(let e of M)e.visual.removeAttribute(`data-tool-3d-state`),e.slot&&(e.slot.media.style.removeProperty(`opacity`),e.slot.display?.remove(),e.slot.display=null);r.remove();for(let e of g)e.dispose();E?(E.dispose(),i.isContextLost()||E.forceContextLoss()):i.isContextLost()||i.getExtension(`WEBGL_lose_context`)?.loseContext()}},status:()=>({pixelRatio:s?W:E?.getPixelRatio()??0,canvas:E?[r.width,r.height]:null,frames:d,cells:M.map(e=>({id:e.id,page:e.page,live:e.phase===`live`,sharp:e.slot?.sharp??!1,canvas:e.slot?.display?[e.slot.display.width,e.slot.display.height]:null})),copyCheck:{samples:fe.length,medianMs:pe,passed:pe===null?null:pe<=pt},rest:{ratio:s?K:0,slices:ce,lastMs:le,maxMs:ue,over:de}})}}export{Pt as mountToolScene};