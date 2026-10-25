import{t as e}from"./frame-pacer-C2fpi5-G.js";import{t}from"./base-path-eL8HHVK0.js";import{C as n,E as r,S as i,T as a,_ as o,b as s,c,d as l,g as u,h as d,l as f,m as p,n as m,o as h,r as g,s as _,t as v,v as y,w as b,x,y as S}from"./gsap-Xjoobghy.js";var C=15e3;function w(e){return new Promise(t=>{let n=new Image,r=e=>{window.clearTimeout(i),t(e)},i=window.setTimeout(()=>r(null),C);n.addEventListener(`load`,()=>r(n.naturalWidth>0?n:null),{once:!0}),n.addEventListener(`error`,()=>r(null),{once:!0}),n.src=e})}async function ee(e,t){let n=null,r=new AbortController,a=window.setTimeout(()=>r.abort(),C);try{if(typeof window.createImageBitmap==`function`){let t=await fetch(e,{mode:`same-origin`,signal:r.signal});t.ok&&(n=await window.createImageBitmap(await t.blob()))}else n=await w(e)}catch{n=null}finally{window.clearTimeout(a)}if(!n)return null;if(typeof ImageBitmap<`u`&&n instanceof ImageBitmap){let e=n;t({dispose:()=>e.close()})}let o=t(new i(n));return o.colorSpace=y,o.flipY=!1,o.needsUpdate=!0,o}var T=.38,E=e=>e*e*(3-2*e),D=e=>e<0?0:e>1?1:e,O=(e,t,n)=>e+(t-e)*n,k=(e,t,n)=>E(D((e-t)/(n-t)));function A(){return v.timeline({paused:!0,defaults:{ease:`none`}})}function j(e,t,n,r,i,a=E){e.fromTo(t,{[n]:0},{[n]:1,duration:i-r,ease:a,immediateRender:!1},r)}var M=(e,t)=>e.enter+e.hold*t;function te(e,t,n){let r=n.enter+n.hold;j(e,t,`enter`,0,n.enter),e.duration()<r&&e.set({},{},r)}function ne(e,t){return{uNight:{value:0},uGrain:{value:+!!e},uDpr:{value:t},uFade:{value:1}}}var re=(()=>{let e=new h(`#6E8A93`),t=Math.max(e.r,e.g,e.b);return new a(e.r/t,e.g/t,e.b/t)})(),N=`
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
`,P=`
uniform vec3 uColor;
uniform vec3 uSideColor;
uniform float uSideStripes;
uniform float uEdgePx;
uniform float uGrain;
uniform float uNight;
uniform float uDpr;
uniform float uFade;
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
   * 在1倍像素比的屏上也读作均匀的一层灰，不像噪声阈值那样拉出斜纹。
   * 放在最前面，丢掉的片元后面的活一样都不用干。
   */
  if (uFade < 1.0) {
    float threshold = bayer4(gl_FragCoord.xy) + 0.03125;
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
`,ie=new h(`#3E3C35`);function ae(e,t){let n=e.lines,i=e.dot;return{...e.backMap?{uMapBack:{value:null},uUseMapBack:{value:0},uMapBackRect:{value:new r(...e.backMapRect??[0,0,1,1])}}:{},uNight:t.uNight,uGrain:t.uGrain,uDpr:t.uDpr,uFade:t.uFade,uBayTint:{value:re},uColor:{value:new h(e.color)},uSideColor:{value:new h(e.side??e.color)},uSideStripes:{value:e.sideStripes??0},uEdgePx:{value:e.edgePx??1.4},uHinge:{value:+!!e.hinge},uFlip:{value:0},uCurl:{value:0},uLift:{value:0},uMap:{value:e.map??null},uUseMap:{value:+!!e.map},uMapRect:{value:new r(...e.mapRect??[0,0,1,1])},uMapPaper:{value:+!!e.mapPaper},uLines:{value:new r(...n?.rect??[0,0,1,1])},uLineSpec:{value:new a(n?.rows??0,n?.widthPx??.7,n?.seed??0)},uLinesBack:{value:+!!n?.back},uInk:{value:ie},uDot:{value:new r(i?.u??0,i?.v??0,i?.radius??0,+!!i)},uDotColor:{value:new h(i?.color??`#000000`)},uFaceSize:{value:new b(...e.faceSize??[1,1])}}}var F=P.replace(`uniform vec3 uColor;`,`uniform float uMapBias;
uniform vec3 uColor;`).replace(`texture2D(uMap, vec2(m.x, 1.0 - m.y)).rgb`,`texture2D(uMap, vec2(m.x, 1.0 - m.y), uMapBias).rgb`);function I(e,t){let n=ae(e,t);return e.mapBias&&(n.uMapBias=e.mapBias),new s({vertexShader:N,fragmentShader:e.mapBias?F:P,side:2,defines:e.backMap?{BACKMAP:``}:void 0,uniforms:n})}function oe(e){let t=[0];for(let n=1;n<e.length;n+=1)t.push(t[n-1]+e[n].distanceTo(e[n-1]));return{points:e,acc:t}}function L(e,t){let n=ae(e,t),r=e.ink?oe(e.ink.points):null,i=Array.from({length:16},()=>new b);return n.uCard={value:new a(e.halfWidth,e.halfHeight,e.radius)},n.uInkGrow={value:0},n.uInkColor={value:new h(e.ink?.color??`#000000`)},n.uInkPts={value:r?r.points:i},n.uInkAcc={value:r?r.acc:Array(16).fill(0)},e.holo&&(n.uHoloPhase={value:0},n.uHoloSweep={value:.5},n.uHoloStrength={value:e.holo.strength}),new s({vertexShader:N,fragmentShader:P,side:2,defines:e.holo?{CARD:``,INK_N:16,HOLO:``}:{CARD:``,INK_N:16},uniforms:n})}var se=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,R=`
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
`;function z(e){return new s({vertexShader:se,fragmentShader:R,transparent:!0,depthWrite:!1,uniforms:{uColor:{value:new h(74/255,77/255,53/255).convertSRGBToLinear()},uAlpha:{value:.22},uNight:e.uNight,uFade:e.uFade}})}var B={paper:`#FFFDFA`,paperSoft:`#F6F5F1`,paperEdge:`#E4E0D6`,pageEdge:`#E9E4D8`,clay:`#C9C6B4`,olive:`#D5D4C1`,planBrand:`#2563EB`,shuaBrand:`#B4232C`,gangBrand:`#8F1D2C`,cardBrand:`#10666E`,cardMatte:`#182B3D`,cardMark:`#33556E`},ce=t(`/shelf/plan-new-task.v2.webp`),le=.08,V=.09,H=3.3600000000000003,U=2.533333333333333,W=14*Math.PI/180,ue=2.583333333333333,de=3.4400000000000004,fe=ue*Math.cos(W),pe=.012,me=class extends c{constructor(e,t,n){super(),this.turns=e,this.radius=t,this.length=n}getPoint(e,t=new a){let n=e*this.turns*Math.PI*2;return t.set((e-.5)*this.length,Math.cos(n)*this.radius,Math.sin(n)*this.radius)}};function he(e){let t=Math.cos(W),n=Math.sin(W),r=new a(0,-t,e?n:-n),i=new a(e?1:-1,0,0),o=new a().crossVectors(r,i);return new p().makeBasis(r,i,o)}function ge(e){let{detail:t,shared:r,track:a,beats:s,mapBias:c}=e,u=new l,f=new l;f.position.y=-fe/2+.02,u.add(f);let p=new d(a(new o(4.6,2.2)),a(z(r)));p.rotation.x=-Math.PI/2,p.position.y=.004,f.add(p);let m=a(new g(ue,de,.03)),h=a(I({color:B.clay,edgePx:1.3},r));for(let e of[!0,!1]){let t=new l;t.position.y=fe,t.quaternion.setFromRotationMatrix(he(e));let n=new d(m,h);n.position.set(ue/2,0,-.022),t.add(n),f.add(t)}let _=new l;_.position.y=fe,_.quaternion.setFromRotationMatrix(he(!0)),f.add(_);let v=a(new o(U,H,t===`high`?28:14,1));v.translate(U/2,0,0);let b=v.attributes.position,x=v.attributes.uv;for(let e=0;e<b.count;e+=1)x.setXY(e,(b.getY(e)+H/2)/H,1-b.getX(e)/U);x.needsUpdate=!0;let S=new Image;S.decoding=`async`,S.src=ce;let C=a(new i(S));C.colorSpace=y,C.flipY=!1;let w=a(I({color:B.paper,side:B.paperSoft,hinge:!0,edgePx:1.2,map:C,mapRect:[le/H,V/U,1-le/H,2.223333333333333/U],dot:{u:.2/H,v:1-.205/U,radius:.052,color:B.planBrand},lines:{rect:[.34/H,1-.26/U,2.2800000000000002/H,1-.15/U],rows:1,seed:1,widthPx:.9},faceSize:[H,U],mapBias:c},r));w.uniforms.uLift.value=pe,_.add(new d(v,w));let ee=a(new n(new me(8,.066,.4),t===`high`?128:64,.0105,t===`high`?6:4)),E=a(I({color:B.planBrand,edgePx:0},r));for(let e of[-.9,.9]){let t=new d(ee,E);t.position.set(e,fe+.01,0),f.add(t)}let D={enter:0},k=A();return te(k,D,s),{root:u,timeline:k,apply:()=>{let{enter:e}=D;u.position.set(O(1.1,0,e),O(-.8-T,0,e),0),u.rotation.x=.2,u.scale.setScalar(O(.88,1,e)),f.rotation.y=O(1.3,-.38,e)},textures:[C],artwork:[]}}var _e=.936,G=1.3,ve=.12,K=.055,ye=-.26,be=t(`/shelf/card-face.v2.webp`);function xe(e,t,n){let r=new x,i=-e,a=e,o=-t,s=t;return r.moveTo(i+n,o),r.lineTo(a-n,o),r.absarc(a-n,o+n,n,-Math.PI/2,0,!1),r.lineTo(a,s-n),r.absarc(a-n,s-n,n,0,Math.PI/2,!1),r.lineTo(i+n,s),r.absarc(i+n,s-n,n,Math.PI/2,Math.PI,!1),r.lineTo(i,o+n),r.absarc(i+n,o+n,n,Math.PI,Math.PI*1.5,!1),r}function Se(){return Array.from({length:16},(e,t)=>{let n=t/15;return new b(-.4+.8*n,-.2+Math.sin(n*Math.PI*2)*.11)})}function Ce(e){let{detail:t,shared:n,track:r,beats:i}=e,a=new l,s=new d(r(new o(3,1.2)),r(z(n)));s.rotation.x=-Math.PI/2,s.position.y=-1.46,a.add(s);let c=r(new f(xe(_e,G,ve),{depth:K,bevelEnabled:!1,curveSegments:t===`high`?10:5}));c.translate(0,0,-.055/2);let u=r(L({color:B.cardMatte,side:B.cardBrand,edgePx:1.3,halfWidth:_e,halfHeight:G,radius:ve,mapPaper:!0,holo:{strength:.16},ink:{points:Se(),color:B.cardMark}},n));u.uniforms.uInkGrow.value=1;let p=new d(c,u);p.rotation.order=`ZYX`,a.add(p);let m={enter:0},h=A();return te(h,m,i),{root:a,timeline:h,apply:()=>{let{enter:e}=m;a.position.set(O(1.1,0,e),O(-.62-T,0,e),0),a.rotation.x=.12,a.scale.setScalar(O(.9,1,e));let t=O(1.45,ye,e);p.rotation.y=t,u.uniforms.uHoloPhase.value=t*.55,u.uniforms.uHoloSweep.value=.5-Math.sin(t)*.55},textures:[],artwork:[{url:be,apply:e=>{u.uniforms.uMap.value=e,u.uniforms.uUseMap.value=1}}]}}var we=1.08,q=1.05,J=.46,Te=.022,Ee=5,Y=t(`/shelf/shua-card-front.v1.webp`),X=[{x:.29,y:-.12,z:0,tilt:4.5},{x:-.29,y:.12,z:-.05,tilt:-7},{x:.06,y:.03,z:-.1,tilt:1.5},{x:-.05,y:-.02,z:-.15,tilt:-2.5},{x:.02,y:.05,z:-.2,tilt:2}].map(e=>({...e,tilt:e.tilt*Math.PI/180}));function Z(e){let t=Math.min(Math.max(e,0),X.length-1),n=Math.floor(t),r=Math.min(n+1,X.length-1),i=t-n,a=X[n],o=X[r];return{x:O(a.x,o.x,i),y:O(a.y,o.y,i),z:O(a.z,o.z,i),tilt:O(a.tilt,o.tilt,i)}}function De(e,t,n){let r=new x,i=-e,a=e,o=-t,s=t;return r.moveTo(i+n,o),r.lineTo(a-n,o),r.absarc(a-n,o+n,n,-Math.PI/2,0,!1),r.lineTo(a,s-n),r.absarc(a-n,s-n,n,0,Math.PI/2,!1),r.lineTo(i+n,s),r.absarc(i+n,s-n,n,Math.PI/2,Math.PI,!1),r.lineTo(i,o+n),r.absarc(i+n,o+n,n,Math.PI,Math.PI*1.5,!1),r}function Oe(){let e=2*we/21.5*1.5,t=(t,n)=>new b((t-22.75)*e,(22-n)*e),n=new _(t(17.4,22.6),t(18.7,23.6),t(19.5,24.5),t(20,25.3)),r=new _(t(20,25.3),t(21.6,22.6),t(23.4,20.4),t(25.6,18.7)),i=n.getSpacedPoints(5),a=r.getSpacedPoints(16-i.length).slice(1);return[...i,...a]}function ke(e){let{detail:t,shared:n,track:r,beats:i}=e,a=new l,s=new l;a.add(s);let c=new d(r(new o(4,1.5)),r(z(n)));c.rotation.x=-Math.PI/2,c.position.y=-1.48,a.add(c);let u=r(new f(De(we,q,J),{depth:Te,bevelEnabled:!1,curveSegments:t===`high`?10:5}));u.translate(0,0,-.022/2);let p=Oe(),m=[];for(let e=0;e<Ee;e+=1){let t=r(L({color:e%2?B.paperSoft:B.paper,side:B.paperEdge,edgePx:1.3,halfWidth:we,halfHeight:q,radius:J,lines:{rect:[.16,.44,.84,.8],rows:3,seed:e*3+1,widthPx:.85},mapPaper:!0,ink:e===2?{points:p,color:B.shuaBrand}:void 0},n)),i=new d(u,t);i.rotation.order=`ZYX`,s.add(i),m.push({mesh:i,material:t})}let h={enter:0,swipe0:0,swipe1:0,turn2:0,ink:0,swap:0},g=A();te(g,h,i),j(g,h,`swipe0`,M(i,.025),M(i,.25),e=>e),j(g,h,`swipe1`,M(i,.275),M(i,.5),e=>e),j(g,h,`turn2`,M(i,.525),M(i,.65)),j(g,h,`ink`,M(i,.625),M(i,.8)),j(g,h,`swap`,M(i,.825),M(i,.95));let _=(e,t)=>{let n=k(e,0,.5),r=k(e,.45,.7),i=k(e,.68,1),a=X[0],o=Z(t),s=a.x-1.9;return{x:O(O(a.x,s,n),o.x,i),y:O(O(a.y,a.y+.18,n),o.y,i),z:O(a.z+Math.sin(Math.PI*D(e/.5))*.35,o.z-.06*(1-i),r),flip:-Math.PI*n,tilt:O(O(a.tilt,-12*Math.PI/180,n),o.tilt,i)}};return{root:a,timeline:g,apply:()=>{let{enter:e}=h;a.position.set(O(1.1,.05,e),O(-.8-T,.08,e),0),a.rotation.x=.24,a.scale.setScalar(O(.9,1,e)),s.rotation.y=O(1.42,-.2,e);let t=E(D((h.swipe0-.45)/.55)),n=E(D((h.swipe1-.45)/.55));m.forEach(({mesh:e,material:r},i)=>{let a;if(i===0)a=h.swipe0<1?_(h.swipe0,4):{...Z(4-n),flip:-Math.PI};else if(i===1)a=h.swipe1>0?_(h.swipe1,4):{...Z(1-t),flip:0};else{let e=i===2?h.swap:i===3?-h.swap:0,r=Z(i-t-n+e),o=0,s=r.z;i===2?(o=-Math.PI*h.turn2,s+=Math.sin(Math.PI*h.turn2)*.32):i===3&&(s+=Math.sin(Math.PI*h.swap)*.3),a={...r,z:s,flip:o}}e.position.set(a.x,a.y,a.z),e.rotation.set(0,a.flip,a.tilt),i===2&&(r.uniforms.uInkGrow.value=h.ink)})},textures:[],artwork:[{url:Y,apply:e=>{for(let{material:t}of m)t.uniforms.uMap.value=e,t.uniforms.uUseMap.value=1}}]}}var Ae=140,je=4e-4,Me={high:1.75,balanced:1.25,soft:1.5},Ne=8e5,Pe=2,Fe=13e5,Ie=30,Q={enter:.45,hold:.55},Le=new Set([`plan`,`card`]),Re=.575,ze=.5,Be=1,Ve=.3,He=.3,Ue=4,We=3,Ge=8,Ke=4,qe=3.5,Je=3,Ye=-1,Xe=50;function Ze(){let e=navigator.deviceMemory;return typeof e==`number`&&e>4?qe:Je}var Qe=28,$e=3*1.6/2/Math.tan(Qe*Math.PI/360),et={soft:30},tt={capped:.6,free:.55},nt=[30,120],rt=3e3,it=15e3,at=240;function $(){return new Promise(e=>{typeof window.requestIdleCallback==`function`?window.requestIdleCallback(()=>e(),{timeout:300}):window.setTimeout(e,16)})}function ot(e){return e.loading=`eager`,new Promise(t=>{if(e.complete){t(e.naturalWidth>0);return}let n=n=>{window.clearTimeout(a),e.removeEventListener(`load`,r),e.removeEventListener(`error`,i),t(n)},r=()=>n(!0),i=()=>n(!1),a=window.setTimeout(()=>n(!1),it);e.addEventListener(`load`,r),e.addEventListener(`error`,i)}).then(t=>t?Promise.race([e.decode().then(()=>!0,()=>!0),new Promise(e=>window.setTimeout(()=>e(!0),300))]):!1)}async function st(e){if(typeof window.createImageBitmap!=`function`)return null;try{let t=await fetch(e.currentSrc||e.src,{cache:`only-if-cached`,mode:`same-origin`});if(t.ok)return await window.createImageBitmap(await t.blob())}catch{}try{return await window.createImageBitmap(e)}catch{return null}}function ct(t,n){let{canvas:r,context:i}=n,a=n.phone,o=a?We:Ue,s=n.tier,c=0,l=!1,d=!1,f=!1,p=[],h=e=>(l?e.dispose():p.push(e),e),g=()=>{l||d||(d=!0,window.setTimeout(()=>n.onFallback(),0))},_=e=>{let t=window.devicePixelRatio||1;return s===`soft`?Math.min(t,Me.soft,Math.sqrt(Ne/(e||1))):a?Math.min(t,Pe,Math.sqrt(Fe/(e||1))):Math.min(t,Me[s])},y=ne(s===`high`,_(0)),b=new S,x=new u(Qe,1.5,.1,100);x.position.z=$e;let C=null,w=!1,T=t.exhibits.map(e=>({...e,exhibit:null,fade:{value:1},phase:`building`,slot:null})),O=v.context(()=>{}),k=window.matchMedia(`(prefers-color-scheme: dark)`),A=()=>{let e=document.documentElement.classList;return e.contains(`dark`)?!0:!e.contains(`light`)&&k.matches},j=+!!A();y.uNight.value=j;let M=(e,t,n,r=0,i=0,a=t,o=n)=>{let s=e.x+e.width/2,c=e.y+e.height/2,l=Math.max(s,t-s),u=Math.max(c,n-c);x.fov=2*Math.atan(3*(2*u/e.height)/2/$e)*180/Math.PI,x.aspect=l/u,x.setViewOffset(2*l,2*u,l-s+r,u-c+i,a,o),x.updateProjectionMatrix()},te=e=>{for(let t of T)t.exhibit&&(t.exhibit.root.visible=t.exhibit===e.exhibit)},re=(e,t,n)=>{!C||!e.exhibit||(te(e),e.exhibit.timeline.progress(D(t/(Q.enter+Q.hold))),e.exhibit.apply(),e.fade.value=n,C.render(b,x),c+=1)},N=1,P=[0,0],ie=1,ae={value:0},F=0,I=0,oe=null,L=null,se=0,R=[],z=null,B=e=>{if(R.length>=Ge||(R.push(e),R.length<Ge))return;let t=[...R].sort((e,t)=>e-t);z=(t[Ge/2-1]+t[Ge/2])/2,z>Ke&&!f&&(n.onDegrade(`static`),f=!0)},ce=e=>Le.has(e.id)?Q.enter:Q.enter+Q.hold,le=(e,t,n)=>{let r=e.areaTop-t,i=n*Re-e.areaHeight/2;return D((n-r)/(n-i||1))},V=(e,t,n)=>e.spanTop>=t+n?e.spanTop-t-n:e.spanBottom<=t?t-e.spanBottom:-1,H=()=>{if(!C)return;let e=window.scrollY,t=window.innerHeight,n=document.documentElement.clientWidth,r=window.devicePixelRatio||1,i=e=>Math.round(e*r)/r,a=[...document.querySelectorAll(`[data-tool-zone] > h2, [data-tool-open]`)].map(e=>e.getBoundingClientRect()),s=[],c=0,l=0,u=0;for(let t of T){if(!t.exhibit)continue;let r=t.visual.querySelector(`img`),o=t.visual.closest(`[data-tool-card]`);if(!r||!o)continue;let d=t.visual.getBoundingClientRect();if(d.width<=0)continue;let f=d.width/1.5,p=o.getBoundingClientRect(),m=0,h=n;for(let e of o.parentElement?.children??[]){if(e===o)continue;let t=e.getBoundingClientRect();Math.abs(t.top-p.top)>1||(t.right<=p.left?m=Math.max(m,(t.right+p.left)/2):t.left>=p.right&&(h=Math.min(h,(p.right+t.left)/2)))}let g=i(Math.max(m,d.left-d.width*Ve)),_=i(Math.min(h,d.right+d.width*Ve)),v=-1/0;for(let e of a)e.bottom<=d.top+1&&e.right>g&&e.left<_&&(v=Math.max(v,e.bottom));let y=i(Math.max(d.top+e-f*He,v+e+1)),b=i(d.top+e+f),x=_-g,S=b-y;c=Math.max(c,x*S),l=Math.max(l,x),u=Math.max(u,S),s.push([t,{media:r,areaTop:d.top+e,areaHeight:f,width:x,height:S,offsetLeft:g-d.left,offsetTop:y-(d.top+e),spanTop:Math.min(y,d.top+e),spanBottom:Math.max(b,d.bottom+e),view:{x:d.left-g,y:d.top+e-y,width:d.width,height:f}}])}if(!s.length)return;N=_(l*u+o*c),ie=Math.min(window.devicePixelRatio||1,Ze());let d=Math.floor(l*N),f=Math.floor(u*N);(P[0]!==d||P[1]!==f)&&(P[0]=d,P[1]=f,C.setPixelRatio(1),C.setSize(d,f,!1)),y.uDpr.value=N;for(let[n,r]of s){let i=[Math.floor(r.width*N+1e-6),Math.floor(r.height*N+1e-6)],a=n.slot,o={...r,device:i,display:a?.display??null,context2d:a?.context2d??null,target:0,current:0,posed:NaN,sharp:!1};o.target=le(o,e,t),o.current=a&&n.phase===`live`?a.current:o.target,n.slot=o,o.display&&U(o)}w=!0},U=e=>{let t=e.display;t&&(t.style.left=`${e.offsetLeft}px`,t.style.top=`${e.offsetTop}px`,t.style.width=`${e.width}px`,t.style.height=`${e.height}px`)},W=(e,t,n=N)=>{let i=e.slot;if(!C||!e.exhibit||!i)return!1;let a=n>N,[o,s]=a?[Math.floor(i.width*n+1e-6),Math.floor(i.height*n+1e-6)]:i.device,c=t?i.display:null;c&&(c.width!==o||c.height!==s)&&(c.width=o,c.height=s),y.uDpr.value=n,ae.value=a?Ye:0;let l=i.current*ce(e),u=E(D(l/Q.enter)),[d,f]=P;for(let t=0;t<s;t+=f)for(let p=0;p<o;p+=d){let m=Math.min(d,o-p),h=Math.min(f,s-t);if(C.setViewport(0,f-h,m,h),C.clear(),M(i.view,i.width,i.height,p/n,t/n,m/n,h/n),re(e,l,u),!(!c||!i.context2d)){if(i.context2d.globalCompositeOperation=p===0&&t===0?`copy`:`source-over`,a)i.context2d.drawImage(r,0,0,m,h,p,t,m,h);else{let e=performance.now();i.context2d.drawImage(r,0,0,m,h,p,t,m,h),B(performance.now()-e)}}}return y.uDpr.value=N,ae.value=0,c&&(i.posed=i.current,i.sharp=a),!0},ue=e=>{let t=e.slot;if(!t)return!1;let n=document.createElement(`canvas`);n.setAttribute(`aria-hidden`,`true`),n.style.position=`absolute`,n.style.display=`block`,n.style.pointerEvents=`none`;let r=n.getContext(`2d`);return r?(t.display=n,t.context2d=r,U(t),e.visual.appendChild(n),t.current=t.target,W(e,!0),t.media.style.opacity=`0`,e.visual.setAttribute(`data-tool-3d-state`,`live`),e.phase=`live`,!0):!1},de=e=>{let t=e.slot;t&&(t.media.style.removeProperty(`opacity`),e.visual.removeAttribute(`data-tool-3d-state`),t.display&&(t.display.remove(),t.display.width=0,t.display.height=0),t.display=null,t.context2d=null,t.posed=NaN,t.sharp=!1,e.phase=f?`retired`:`ready`)},fe=e=>{let t=window.scrollY,n=window.innerHeight,r=!0;for(let i of T){let a=i.slot;if(a){if(a.target=le(a,t,n),i.phase!==`live`){a.current=a.target;continue}a.current+=(a.target-a.current)*e,Math.abs(a.target-a.current)<je?a.current=a.target:r=!1}}return r},pe=()=>{let e=window.scrollY,t=window.innerHeight,n=!1;for(let r of T){let i=r.slot;r.phase!==`live`||!i?.display||!w&&i.posed===i.current&&!(i.sharp&&V(i,e,t)>=0)||(n=W(r,!0)||n)}return w=!1,n},me=()=>{if(F=0,l||d||f||q||!C)return;let e=window.scrollY,t=window.innerHeight,n=T.filter(n=>n.phase===`live`&&n.slot?.display&&!n.slot.sharp&&V(n.slot,e,t)<0);if(!n.length)return;let r=performance.now();W(n[0],!0,ie);let i=performance.now()-r;I+=1,oe=i,L=Math.max(L??0,i),i>Xe&&(se+=1),n.length>1&&he()},he=()=>{F||ie<=N||(F=typeof window.requestIdleCallback==`function`?window.requestIdleCallback(me,{timeout:500}):window.setTimeout(me,50))},_e=()=>{F&&=(typeof window.cancelIdleCallback==`function`?window.cancelIdleCallback(F):window.clearTimeout(F),0)},G=[],ve=()=>{let e=window.scrollY,t=window.innerHeight,n=0;for(let r of T){let i=r.slot;if(!i)continue;let a=V(i,e,t);if(a>=0&&!f&&G.length>0)for(let e=G.length-1;e>=0;--e){if(G[e].cell!==r)continue;let[t]=G.splice(e,1);t.artwork.apply(t.texture),w=!0}r.phase===`live`&&a>=0&&(f||a>Be*t)&&de(r),r.phase===`live`&&(n+=1)}if(f){n||g();return}let r=T.filter(e=>e.phase===`ready`&&e.slot).map(n=>[n,V(n.slot,e,t)]).filter(([,e])=>e>=0&&e<=ze*t).sort((e,t)=>e[1]-t[1]);for(let[i,a]of r){if(n>=o){let r=T.filter(e=>e.phase===`live`&&e.slot).map(n=>[n,V(n.slot,e,t)]).filter(([,e])=>e>=a).sort((e,t)=>t[1]-e[1])[0];if(!r)break;de(r[0]),--n}ue(i)&&(n+=1)}},K=0,ye=0,be=0,xe=[],Se=()=>{if(s===`high`){s=`balanced`,y.uGrain.value=0,n.onDegrade(`balanced`),H();return}n.onDegrade(`static`),f=!0},we=(e,t)=>{if(!t||f){K=0;return}if(K&&(ye+=e-K,be+=1,xe.push(e-K)),K=e,ye<rt)return;let n=be*1e3/ye,r=a?Ie:et[s],i=[...xe].sort((e,t)=>e-t),o=i[Math.floor(i.length*.05)]||16.7,c=Math.min(nt[1],Math.max(nt[0],1e3/o)),l=r??c,u=r?tt.capped:tt.free;xe=[],ye=0,be=0,n<l*u&&Se()},q=0,J=0,Te=e(),Ee=e=>{if(q=0,l)return;if((s===`soft`||a)&&!Te.ready(e)){q=requestAnimationFrame(Ee);return}let t=J?Math.min(e-J,100):16.7;J=e;let n=1-Math.exp(-t/Ae),r=fe(n),i=+!!A();if(j!==i&&(j+=(i-j)*(1-Math.exp(-t/at)),Math.abs(i-j)<.002?j=i:r=!1,y.uNight.value=j,w=!0),ve(),!d){if(we(e,pe()),r){J=0,K=0,Te.reset(),he();return}q=requestAnimationFrame(Ee)}},Y=()=>{_e(),!q&&!l&&(q=requestAnimationFrame(Ee))},X=()=>{H(),Y()};window.addEventListener(`scroll`,Y,{passive:!0}),window.addEventListener(`resize`,X);let Z=new ResizeObserver(X);Z.observe(document.body);for(let e of T)Z.observe(e.visual);let De=new MutationObserver(Y);De.observe(document.documentElement,{attributes:!0,attributeFilter:[`class`]}),k.addEventListener(`change`,Y);let Oe=e=>{e.preventDefault(),g()};r.addEventListener(`webglcontextlost`,Oe);let qe=(e,t)=>e.id===`plan`?ge(t):e.id===`shua`?ke(t):Ce(t),Je=(e,t)=>{let n=null;return O.add(()=>{n=qe(e,t)}),n};return(async()=>{if(await $(),l)return;try{let e=n.tier===`soft`;C=new m({canvas:r,context:i,alpha:!0,antialias:!e,premultipliedAlpha:!0,failIfMajorPerformanceCaveat:!e})}catch{g();return}C.debug.onShaderError=()=>g(),C.setClearColor(0,0),C.autoClear=!1,C.setPixelRatio(1);let e=s===`soft`?1:C.capabilities.getMaxAnisotropy();for(let e of T){if(await $(),l)return;let t=null;try{t=Je(e,{detail:s,shared:{...y,uFade:e.fade},beats:Q,track:h,mapBias:ae})}catch{t=null}if(!t){e.phase=`failed`;continue}e.exhibit=t,t.root.visible=!1,b.add(t.root)}for(let t of T)for(let n of t.exhibit?.artwork??[])(async()=>{try{let r=await ee(n.url,h);if(await $(),l||d||!C||!r)return;r.anisotropy=Math.min(8,e),C.initTexture(r),G.push({cell:t,artwork:n,texture:r}),Y()}catch{}})();for(let t of T){let n=t.exhibit?.textures??[];if(!n.length)continue;let r=await Promise.all(n.map(e=>ot(e.image)));if(l)return;if(!r.every(Boolean)){t.phase=`failed`;continue}for(let t of n){let n=await st(t.image);if(l){n?.close();return}if(n&&(h({dispose:()=>n.close()}),t.image=n),await $(),l||!C)return;t.anisotropy=Math.min(8,e),t.needsUpdate=!0,C.initTexture(t)}}if(await $(),!(l||!C)&&(await C.compileAsync(b,x),!(l||d))){H();for(let e of T)if(e.phase===`building`){if(await $(),l||d)return;e.slot&&W(e,!1),w=!0,e.phase=`ready`,Y()}T.every(e=>e.phase===`failed`)&&g()}})().catch(()=>g()),{release:()=>{if(!l){l=!0,q&&cancelAnimationFrame(q),q=0,_e(),window.removeEventListener(`scroll`,Y),window.removeEventListener(`resize`,X),Z.disconnect(),De.disconnect(),k.removeEventListener(`change`,Y),r.removeEventListener(`webglcontextlost`,Oe),O.revert();for(let e of T)e.visual.removeAttribute(`data-tool-3d-state`),e.slot&&(e.slot.media.style.removeProperty(`opacity`),e.slot.display?.remove(),e.slot.display=null);for(let e of p)e.dispose();C?(C.dispose(),i.isContextLost()||C.forceContextLoss()):i.isContextLost()||i.getExtension(`WEBGL_lose_context`)?.loseContext()}},status:()=>({pixelRatio:N,canvas:C?[r.width,r.height]:null,frames:c,cells:T.map(e=>({id:e.id,live:e.phase===`live`,sharp:e.slot?.sharp??!1,canvas:e.slot?.display?[e.slot.display.width,e.slot.display.height]:null})),copyCheck:{samples:R.length,medianMs:z,passed:z===null?null:z<=Ke},rest:{ratio:ie,slices:I,lastMs:oe,maxMs:L,over:se}})}}export{ct as mountToolScene};