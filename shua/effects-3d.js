// 刷刷 3D 点缀：场景模块 | Author: Ysevan | 仅限内部学习使用
import {
  CanvasTexture,
  Color,
  CubicBezierCurve,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  RedFormat,
  Scene,
  ShaderMaterial,
  Shape,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderer
} from "./vendor/three.subset.min.js";
import { gsap } from "./vendor/gsap-core.min.js";

/*
 * 三个落点（首页题库牌堆、做题小牌堆、结算落堆）共用一个渲染器、一块画布，画布跟着 show() 搬进当前槽位。
 * 接口由加载器 effects.js 定死（design-proposal.md 第六章），这里只实现、不扩展。
 *
 * 纸的做法照搬小屋主站工具页那叠闪卡（Ysevan_web 的 components/tool-3d/scene/paper.ts），只留卡片一种；
 * 纸色在 v3.11.0 随液态玻璃改版对齐了界面上的玻璃卡（纯白 + 偏冷的次白 + 淡灰蓝纸边）：
 * 三档平涂 + 背光掺海湾蓝冷影、程序化纸纤维 ±3%、按屏幕像素算宽度的颜料边、柔边椭圆假投影、
 * 圆角卡 SDF 上按弧长生长的笔画。身份色 #B4232C 每个场景只落在一个勾上；答错的叉用淡墨。
 *
 * 模块顶层只有 import 与定义：离线时加载器可能只加载不调用，加载本身不能碰 DOM、不能建上下文。
 * （gsap-core 被 import 时会自己起一次 ticker，约两秒没有补间就休眠，那是 GSAP 自身的行为。）
 *
 * ── 出帧 ─────────────────────────────────────────────────────────────
 * 不常驻 rAF。补间的 onUpdate 只置「要重画」并把 tick 挂上 gsap.ticker；tick 在 GSAP 更新完补间之后、
 * 同一帧里画，某一帧发现没东西要画就把自己摘掉。挂 gsap.ticker 而不自己要 rAF，是为了画出来的永远是
 * 这一帧补间更新之后的状态（GSAP 的 updateRoot 是 ticker 的第一个监听）。
 * ticker 休眠后被 add() 唤醒时会同步派发一次，所以 tick 在 show/answer 的调用栈里一律跳过、等下一帧：
 * 这两个方法必须常数时间返回，答题流程不能因为 3D 多等一毫秒。
 */

const FONT = "\"PingFang SC\", \"Hiragino Sans GB\", \"Microsoft YaHei\", \"Noto Sans CJK SC\", sans-serif";

// 纸色对齐界面上的白卡：卡纸白就是纯白，次白偏一点冷，纸边是淡灰蓝。
// 身份红 BRAND 不变——它是整站唯一还留着品牌红的地方（每个场景只落在一个手写的勾上）。
const PAPER = "#FFFFFF";
const PAPER_SOFT = "#F6F7FB";
const PAPER_EDGE = "#D9DEEA";
const BRAND = "#B4232C";
const INK = "#1C1C1E";
const BAY = "#6E8A93";
const SHADOW_LIGHT = "#4A4D35";
const SHADOW_DARK = "#07090B";

const PIXEL_RATIO_CAP = { high: 1.75, balanced: 1.25, soft: 1 };
const LABEL_SIZE = { high: [512, 384], balanced: [384, 288], soft: [384, 288] };

/*
 * 精简档 soft（3.11.2 起）：加载器只拿到软件渲染的上下文（没有独立显卡，WARP / SwiftShader 用 CPU 画）时用这一档。
 * 软件渲染下 WebGL 和页面合成都在 CPU 上，所以只砍「每帧多少像素」「每秒几帧」「什么时候出帧」，别的画质与均衡档相同：
 *   - 像素比封顶 1，画布物理像素长边再压到 640 以内（CSS 尺寸不变，浏览器拉伸显示，略糊）；
 *   - 出帧限 30：补间照常按 rAF 走，画面到点才画；
 *   - 关纸纹、几何细分取低档（这两样均衡档本来就关）；上下文由加载器关掉抗锯齿；
 *   - 不跟指针轻倾、不随滚动后仰（见 show 里的 bindInteraction）：只在翻牌、答题、落堆这些离散事件时出帧。
 * 投影、双面两遍、牌堆张数减半这几样实测过（SwiftShader、屋主视口 2040×1019@1.25），各自的贡献都在噪声里，
 * 没有采用（控制室裁定「帧率够就别再砍画质」）。实测的大头根本不在 WebGL：软件合成下，玻璃卡（backdrop-filter）
 * 里任何一处重绘都要重算模糊，3D 关着、只让一个 24px 小方块在「今日复习」卡里变色，页面就掉到 4 帧上下。
 * 精简档不降档：帧守卫的目标就是这里限的 30 帧（见 SLOW_FPS_RATIO），连续两个窗口都太慢才放弃、回平面界面。
 */
const SOFT = {
  maxEdgePx: 640,
  frameIntervalMs: 1000 / 30
};
// 限帧的容差：rAF 的时间戳有抖动，差一两毫秒不到间隔也照画，免得 60Hz 屏上掉成每三帧画一次
const FRAME_INTERVAL_SLACK_MS = 4;

// 卡片 4:3，和卡面贴图同比例；圆角比主站那张图标卡小，给文字留出版心
const CARD_W = 1.2;
const CARD_H = 0.9;
const CARD_R = 0.2;
const INK_N = 16;

/*
 * 帧守卫的判据（3.11.2 改）：一个窗口 = 最近 40 个帧间隔，看**平均出帧率**（40 / 窗口总时长），
 * 和**这一档自己的目标帧率**按比例比；低于比例算一个慢窗口，连续 SLOW_WINDOWS 个才动手。
 *
 * 为什么是比例而不是绝对毫秒：卡顿让间隔变成双峰分布（一堆 16.7ms 加几个 100ms+），
 * 中位数落在常见值上、完全看不见长尾——仿真里「60Hz 每 4 帧一次 120ms 卡顿」真实只有 22.0 帧，
 * 旧判据（40 帧中位数 > 28ms）报正常；反过来「干净 30Hz 屏」真实 30.1 帧、在 30Hz 屏上完全流畅，
 * 旧判据却因为 33.3ms > 28ms 判慢、把 3D 关掉。平均出帧率连续、不在量化台阶上翻面，
 * 按屏幕自己的节奏取目标，两种错都不会犯。
 */
const SLOW_FPS_RATIO = { high: 0.55, balanced: 0.55, soft: 0.6 };
/*
 * 目标帧率：精简档就是我们自己限的 30 帧（SOFT.frameIntervalMs）；高档、均衡档不限帧，
 * 目标应当是屏幕实际刷新率——没有 API 能问，用窗口内间隔的第 5 百分位估（最快的那批间隔代表屏幕节奏），
 * 夹在 30～120 之间（低于 30 的「快帧」只会是估计噪声，高于 120 的高刷屏没必要追）。
 */
const REFRESH_SAMPLE_PCTL = 0.05;
const REFRESH_FPS_MIN = 30;
const REFRESH_FPS_MAX = 120;
/*
 * 出帧到这个数以上一律不算慢。p5 估计在「高刷屏上忽快忽慢」时不稳：144Hz 屏上稳定送 64 帧的窗口里
 * 只要有两帧赶上了满刷新，p5 就估出 120，0.55×120 = 66 帧的线反而把它判慢、把好机器降档。
 * 50 帧以上人眼已经看不出卡，不追着刷新率跑。仿真里加这条上限只改掉这一个误判，其余判定一个不变。
 *
 * 为什么它和上面「阈值写成比例、不写绝对毫秒」那条不打架（2026-09-23 控制室裁定，原样记在这里）：
 *   相对阈值防的是「我们自己加的限帧混进判据」；绝对上限防的是「把一个人眼看不出的差别当成故障」。
 *   两者管的是不同的失败面，不冲突。
 *   120Hz 屏稳定送 64 帧，对一个装饰性 3D 来说没有任何问题。把它判慢然后关掉 3D，
 *   是拿一个用户感觉不到的差距去换一个用户看得见的损失。看门狗要问的是「这东西是不是让页面变难用了」，
 *   不是「它有没有追平刷新率」。
 * 风险方向也是安全的：它唯一能造成的错是「该降档时没降」，而触发条件是「已经送出 ≥50 帧」——
 * 送出 50 帧的机器按定义就不需要降档，所以它不会制造新的坏情况。
 */
const SMOOTH_ENOUGH_FPS = 50;
const SLOW_WINDOWS = { high: 1, balanced: 1, soft: 2 };
const FRAME_WINDOW = 40;
// 超过这个间隔的不算帧时长：多半是标签页被挡住、rAF 被节流，不是机器慢。
// 精简档放宽到 1 秒：软件渲染真扛不住时一帧就可能超过 250ms，那种帧要算进去，否则守卫永远攒不满样本。
const FRAME_GAP_LIMIT_MS = { high: 250, balanced: 250, soft: 1000 };
// 两次牌堆动画的起点靠得比这更近，后一次不播、直接落定（连点「下一题」时不排队）
const QUIZ_THROTTLE_MS = 150;
const QUIZ_VISIBLE_MAX = 6;
const HOME_CARDS_MAX = 8;
const SUMMARY_CARDS_MAX = 12;

const DEG = Math.PI / 180;

const cardVertexShader = `
varying vec3 vLocal;
varying vec3 vObjNormal;
varying vec3 vNormal;

void main() {
  vLocal = position;
  vObjNormal = normal;
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const cardFragmentShader = `
uniform vec3 uColor;
uniform vec3 uSideColor;
uniform float uEdgePx;
uniform float uGrain;
uniform float uGrainScale;
uniform float uDpr;
uniform vec3 uBayTint;
uniform float uOpacity;

uniform sampler2D uMap;
uniform float uUseMap;
uniform vec3 uTextInk;

uniform vec4 uLineRect;
uniform vec4 uLineSpec;
uniform vec3 uLineInk;

uniform vec3 uCard;
uniform float uInkGrow;
uniform float uInkFace;
uniform float uInkWidth;
uniform float uInkGap;
uniform vec3 uInkColor;
uniform vec2 uInkPts[${INK_N}];
uniform float uInkAcc[${INK_N}];

varying vec3 vLocal;
varying vec3 vObjNormal;
varying vec3 vNormal;

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

/* 淡墨横线：像一道手写的题，每行长短不一，首行短一点当题干。线宽按屏幕像素算。 */
float lines(vec2 uv, vec2 fw) {
  if (uLineSpec.x < 0.5) return 0.0;
  vec2 q = (uv - uLineRect.xy) / (uLineRect.zw - uLineRect.xy);
  if (q.x < 0.0 || q.x > 1.0 || q.y < 0.0 || q.y > 1.0) return 0.0;
  float rows = uLineSpec.x;
  float t = (1.0 - q.y) * rows;
  float row = floor(t);
  float len = row < 0.5 ? 0.46 : 0.62 + 0.36 * hash(vec2(row, uLineSpec.z));
  if (row > rows - 1.5) len *= 0.55;
  float along = 1.0 - smoothstep(len - 0.012, len, q.x);
  float dy = abs(fract(t) - 0.5) / rows * (uLineRect.w - uLineRect.y);
  float px = dy / fw.y;
  float halfWidth = uLineSpec.y * uDpr;
  return along * (1.0 - smoothstep(halfWidth - 0.5, halfWidth + 0.5, px));
}

/* 笔画：按弧长只画到 uInkGrow 那一段，笔头是圆的。uInkGap 那一段是提笔（叉的两笔之间），只占时间不落墨。 */
float ink(vec2 p, float px) {
  float written = uInkGrow * uInkAcc[${INK_N - 1}];
  float best = 1e3;
  for (int i = 0; i < ${INK_N - 1}; i++) {
    float from = uInkAcc[i];
    float to = uInkAcc[i + 1];
    if (written <= from) break;
    if (float(i) == uInkGap) continue;
    vec2 a = uInkPts[i];
    vec2 b = mix(a, uInkPts[i + 1], clamp((written - from) / max(to - from, 1e-5), 0.0, 1.0));
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-8), 0.0, 1.0);
    best = min(best, length(pa - ba * h));
  }
  return 1.0 - smoothstep(uInkWidth - px, uInkWidth + px, best);
}

void main() {
  vec2 suv = vLocal.xy / (2.0 * uCard.xy) + 0.5;
  float sd = -sdRoundRect(vLocal.xy, uCard.xy, uCard.z);
  float sdw = max(fwidth(sd), 1e-6);
  vec2 fw = max(fwidth(suv), vec2(1e-6));

  /* 1 = 正面，-1 = 背面，0 = 纸边 */
  float face = vObjNormal.z > 0.5 ? (gl_FrontFacing ? 1.0 : -1.0) : (vObjNormal.z < -0.5 ? -1.0 : 0.0);
  vec3 col = face == 0.0 ? uSideColor : uColor;

  /*
   * 卡面字是单通道覆盖率（R8 贴图），背面镜像着采样，两面读起来都是正的。采样放在分支外：
   * mipmap 靠相邻像素求导，放进按像素走的分支是未定义行为。
   * 字和纸在 sRGB 空间里混：浏览器画字就是这么混的，线性空间里混出来的字会发虚发细。
   */
  float cover = texture2D(uMap, vec2(face < -0.5 ? 1.0 - suv.x : suv.x, suv.y)).r;
  bool onMap = (face > 0.5 && uUseMap > 0.5) || (face < -0.5 && uUseMap > 1.5);
  if (onMap) {
    col = pow(mix(pow(col, vec3(0.4545)), uTextInk, cover), vec3(2.2));
  }
  if (face > 0.5) {
    col = mix(col, uLineInk, lines(suv, fw) * uLineSpec.w);
  }

  if (uInkGrow > 0.0 && face != 0.0 && (uInkFace == 0.0 || face == uInkFace)) {
    vec2 p = face > 0.0 ? vLocal.xy : vec2(-vLocal.x, vLocal.y);
    col = mix(col, uInkColor, ink(p, sdw * 1.2));
  }

  /* 平涂三档 + 背光冷影。光从左上前方来，固定在观者一侧。 */
  vec3 n = normalize(vNormal) * (gl_FrontFacing ? 1.0 : -1.0);
  float lambert = dot(n, normalize(vec3(-0.42, 0.72, 0.55)));
  float toMid = smoothstep(-0.08, 0.1, lambert);
  float toLit = smoothstep(0.34, 0.5, lambert);
  col *= mix(0.8, mix(0.915, 1.0, toLit), toMid);
  col *= mix(vec3(1.0), uBayTint, (1.0 - toMid) * 0.34 + (1.0 - toLit) * 0.08);

  /* 纸纹：纤维方向拉长的两层值噪声。频率按屏幕像素定，卡再小也不闪成噪点。 */
  if (uGrain > 0.5) {
    vec2 gp = (vLocal.xy + vLocal.zz * 1.3) * uGrainScale;
    float fiber = noise(gp * vec2(1.0, 0.3)) * 0.6 + noise(gp * 2.1 + 7.0) * 0.4;
    col *= 1.0 + (fiber - 0.5) * 0.06;
  }

  /* 颜料边：贴边一道深线，再往里一层很淡的晕，都按屏幕像素算宽度 */
  float edgeDist = face == 0.0 ? 0.0 : sd / sdw;
  float rim = 1.0 - smoothstep(0.0, uEdgePx * uDpr, edgeDist);
  float halo = 1.0 - smoothstep(0.0, uEdgePx * uDpr * 5.0, edgeDist);
  col *= 1.0 - rim * 0.13 - halo * 0.045;

  gl_FragColor = vec4(col, uOpacity);
  #include <colorspace_fragment>
}
`;

const shadowVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/*
 * 假投影：柔边椭圆（uPow 调方圆，2 就是椭圆），中心就是给定的颜色与不透明度，往外柔到 0。
 * 主站的投影落在立着的物件脚下，从中心就开始柔；这里的卡平躺在页面上，影子要在卡边外才露出来，
 * 所以留一个实心的芯（uCore 以内满值），芯外再柔。
 */
const shadowFragmentShader = `
uniform vec3 uColor;
uniform float uAlpha;
uniform float uPow;
uniform float uCore;
varying vec2 vUv;
void main() {
  vec2 q = abs(vUv * 2.0 - 1.0) + 1e-4;
  float r = pow(pow(q.x, uPow) + pow(q.y, uPow), 1.0 / uPow);
  float a = uAlpha * pow(1.0 - smoothstep(uCore, 1.0, r), 1.4);
  gl_FragColor = vec4(uColor, a);
  #include <colorspace_fragment>
}
`;

/* 两端零速度。不用 ease-out：它在起点速度最大，纸会「蹿」出去。 */
const smoothstep = (t) => t * t * (3 - 2 * t);
const clamp01 = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
const lerp = (a, b, t) => a + (b - a) * t;
/** 把 [from, to] 这一段重新映射到 0→1 再过 smoothstep。 */
const phase = (t, from, to) => smoothstep(clamp01((t - from) / (to - from)));
/** 按序号取的伪随机：同一组数据每次落成同一个样子。 */
const jitter = (seed) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

function roundedCardShape() {
  const shape = new Shape();
  const x0 = -CARD_W;
  const x1 = CARD_W;
  const y0 = -CARD_H;
  const y1 = CARD_H;
  const r = CARD_R;
  shape.moveTo(x0 + r, y0);
  shape.lineTo(x1 - r, y0);
  shape.absarc(x1 - r, y0 + r, r, -Math.PI / 2, 0, false);
  shape.lineTo(x1, y1 - r);
  shape.absarc(x1 - r, y1 - r, r, 0, Math.PI / 2, false);
  shape.lineTo(x0 + r, y1);
  shape.absarc(x0 + r, y1 - r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(x0, y0 + r);
  shape.absarc(x0 + r, y0 + r, r, Math.PI, Math.PI * 1.5, false);
  return shape;
}

/** 累计弧长；gap 那一段按前一笔长度的 gapWeight 倍记时长（提笔的停顿），不按两点距离。 */
function strokeOf(points, gap, gapWeight) {
  const acc = [0];
  for (let i = 1; i < points.length; i += 1) {
    const length = i - 1 === gap ? acc[i - 1] * gapWeight : points[i].distanceTo(points[i - 1]);
    acc.push(acc[i - 1] + length);
  }
  return { points, acc, gap };
}

/*
 * 勾：照搬刷刷图标的路径 M17.4 22.6 c1.3 1 2.1 1.9 2.6 2.7 1.6-2.7 3.4-4.9 5.6-6.6（与主站 checkStroke 同源），
 * 以勾自己的包围盒中心 (21.5, 22) 为原点、y 翻成向上，按给定宽度缩放。短撇 5 段、长挑 10 段，共 16 个点。
 */
function checkStroke(cx, cy, width) {
  const scale = width / 8.2;
  const p = (x, y) => new Vector2(cx + (x - 21.5) * scale, cy + (22 - y) * scale);
  const first = new CubicBezierCurve(p(17.4, 22.6), p(18.7, 23.6), p(19.5, 24.5), p(20, 25.3));
  const second = new CubicBezierCurve(p(20, 25.3), p(21.6, 22.6), p(23.4, 20.4), p(25.6, 18.7));
  const head = first.getSpacedPoints(5);
  const tail = second.getSpacedPoints(INK_N - head.length).slice(1);
  return strokeOf([...head, ...tail], -1, 0);
}

/** 叉：两笔各 8 个点，略带弧度像手写；第 7 段是两笔之间的提笔。 */
function crossStroke(cx, cy, size) {
  const h = size / 2;
  const v = (x, y) => new Vector2(cx + x * h, cy + y * h);
  const first = new CubicBezierCurve(v(-0.95, 0.9), v(-0.35, 0.36), v(0.2, -0.22), v(0.92, -0.96)).getSpacedPoints(7);
  const second = new CubicBezierCurve(v(0.9, 0.96), v(0.4, 0.3), v(-0.25, -0.34), v(-0.86, -0.92)).getSpacedPoints(7);
  return strokeOf([...first, ...second], 7, 0.35);
}

const CJK = /[⺀-鿿가-힯豈-﫿＀-￯]/u;
const LATIN_RUNS = /[A-Za-z0-9._%'’-]+|[\s\S]/gu;

/*
 * 折行的最小单位：中文逐字可断；连续的拉丁字母 / 数字（ATM、2026、英文单词）是一整块。
 * 有 Intl.Segmenter 就按它的词边界切，含中文的段再拆成单字；相邻的非中文、非空白段并成一块，
 * 免得 "Anti-Money" 在连字符前断开、下一行以 "-" 开头。没有 Segmenter 就用正则取连续的字母数字。
 */
function breakUnits(text) {
  if (typeof Intl === "undefined" || typeof Intl.Segmenter !== "function") return text.match(LATIN_RUNS) || [];
  const units = [];
  let glued = false;
  for (const { segment } of new Intl.Segmenter("zh", { granularity: "word" }).segment(text)) {
    if (CJK.test(segment)) {
      units.push(...segment.match(LATIN_RUNS));
      glued = false;
    } else if (/^\s+$/.test(segment)) {
      units.push(" ");
      glued = false;
    } else if (glued) {
      units[units.length - 1] += segment;
    } else {
      units.push(segment);
      glued = true;
    }
  }
  return units;
}

function wrapLines(ctx, text, maxWidth, maxLines) {
  const fits = (value) => ctx.measureText(value).width <= maxWidth;
  const lines = [];
  let line = "";
  const push = () => {
    lines.push(line.trimEnd());
    line = "";
  };
  for (const unit of breakUnits(String(text ?? "").replace(/\s+/g, " ").trim())) {
    if (!line && unit === " ") continue;
    if (fits(line + unit)) {
      line += unit;
      continue;
    }
    if (line) push();
    if (unit === " ") continue;
    if (fits(unit)) {
      line = unit;
      continue;
    }
    // 单个词比一整行还宽：只有这时才退回逐字断
    for (const char of Array.from(unit)) {
      if (line && !fits(line + char)) push();
      line += char;
    }
  }
  if (line) push();
  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  const last = Array.from(kept[maxLines - 1]);
  while (last.length && !fits(`${last.join("").trimEnd()}…`)) last.pop();
  kept[maxLines - 1] = `${last.join("").trimEnd()}…`;
  return kept;
}

function place(mesh, pose) {
  mesh.position.set(pose.x, pose.y, pose.z);
  mesh.rotation.set(0, pose.flip || 0, pose.tilt || 0);
  mesh.scale.setScalar(pose.scale || 1);
}

function mixPose(a, b, t) {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    z: lerp(a.z, b.z, t),
    tilt: lerp(a.tilt || 0, b.tilt || 0, t),
    flip: lerp(a.flip || 0, b.flip || 0, t),
    scale: lerp(a.scale || 1, b.scale || 1, t)
  };
}

/* 首页牌堆的八个位置（0 在最上）。前两张照图标错开：前卡略偏右下、后卡偏左上，其余只带一点乱。 */
const HOME_SLOTS = [
  [0.05, -0.03, 2.5],
  [-0.17, 0.1, -5.5],
  [0.14, 0.07, 4.5],
  [-0.07, -0.1, -2.5],
  [0.09, 0.12, 1.5],
  [-0.13, -0.02, -4],
  [0.03, -0.12, 3],
  [-0.04, 0.05, -1]
];

const QUIZ_TILTS = [1.5, -2, 2.5, -1, 2, -2.5, 1];

function homeSlot(value, spread) {
  const clamped = clamp(value, 0, HOME_SLOTS.length - 1);
  const lower = Math.floor(clamped);
  const upper = Math.min(lower + 1, HOME_SLOTS.length - 1);
  const t = clamped - lower;
  const a = HOME_SLOTS[lower];
  const b = HOME_SLOTS[upper];
  const fan = 1 + spread * 1.1;
  return {
    x: lerp(a[0], b[0], t) * fan,
    y: lerp(a[1], b[1], t) * fan,
    z: -value * (0.05 + spread * 0.07),
    tilt: lerp(a[2], b[2], t) * DEG * (1 + spread * 0.6),
    flip: 0,
    scale: 1
  };
}

function quizSlot(value) {
  const clamped = clamp(value, 0, QUIZ_TILTS.length - 1);
  const lower = Math.floor(clamped);
  const upper = Math.min(lower + 1, QUIZ_TILTS.length - 1);
  return {
    x: (value - 2) * 0.06,
    y: -(value - 2) * 0.07,
    z: -value * 0.075,
    tilt: lerp(QUIZ_TILTS[lower], QUIZ_TILTS[upper], clamped - lower) * DEG,
    flip: 0,
    scale: 1
  };
}

export async function createFx({ canvas, context, tier, onFail, onTier }) {
  let detail = tier === "soft" ? "soft" : tier === "balanced" ? "balanced" : "high";
  // 精简档从头到尾不变（它不升不降），高档降到均衡档不影响这个值
  const soft = detail === "soft";
  let disposed = false;
  let failed = false;
  let shaderBroken = false;

  const renderer = new WebGLRenderer({ canvas, context, alpha: true, antialias: !soft, premultipliedAlpha: true });
  renderer.debug.onShaderError = () => {
    shaderBroken = true;
  };
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(pixelRatioFor(0, 0));
  canvas.classList.add("fx-canvas");
  canvas.setAttribute("aria-hidden", "true");

  /* 画布的像素比：按档封顶；精简档再让物理像素长边不超过 SOFT.maxEdgePx（尺寸还量不到时只按档封顶）。 */
  function pixelRatioFor(width, height) {
    const ratio = Math.min(window.devicePixelRatio || 1, PIXEL_RATIO_CAP[detail]);
    const edge = Math.max(width, height);
    return soft && edge > 0 ? Math.min(ratio, SOFT.maxEdgePx / edge) : ratio;
  }

  /*
   * 海湾蓝按自身最大分量归一后当乘子：只偏色不压暗。直接乘原色会把背光面压成一块灰蓝，
   * 水彩里的冷影是「纸还是那张纸，只是冷了一点」。
   */
  const bay = new Color(BAY);
  const bayMax = Math.max(bay.r, bay.g, bay.b);
  const shared = {
    uGrain: { value: detail === "high" ? 1 : 0 },
    uGrainScale: { value: 60 },
    uDpr: { value: renderer.getPixelRatio() },
    uBayTint: { value: new Vector3(bay.r / bayMax, bay.g / bayMax, bay.b / bayMax) }
  };
  const colors = {
    paper: new Color(PAPER),
    paperSoft: new Color(PAPER_SOFT),
    edge: new Color(PAPER_EDGE),
    brand: new Color(BRAND),
    ink: new Color(INK),
    shadowLight: new Color(SHADOW_LIGHT),
    shadowDark: new Color(SHADOW_DARK),
    // 字色 #2e2d28 留在 sRGB：着色器在 sRGB 空间里把字混进纸
    text: new Vector3(46 / 255, 45 / 255, 40 / 255)
  };
  const emptyInk = strokeOf(Array.from({ length: INK_N }, () => new Vector2()), -1, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(20, 1, 0.1, 100);

  function cardMaterial(options) {
    const lines = options.lines || null;
    return new ShaderMaterial({
      vertexShader: cardVertexShader,
      fragmentShader: cardFragmentShader,
      // 全部双面、全部 transparent：两者都进程序的缓存键，统一之后全站的卡只编一个程序
      side: DoubleSide,
      transparent: true,
      uniforms: {
        uGrain: shared.uGrain,
        uGrainScale: shared.uGrainScale,
        uDpr: shared.uDpr,
        uBayTint: shared.uBayTint,
        uColor: { value: options.color },
        uSideColor: { value: colors.edge },
        uEdgePx: { value: options.edgePx ?? 1.2 },
        uOpacity: { value: 1 },
        uMap: { value: options.map || null },
        uUseMap: { value: options.map ? 2 : 0 },
        uTextInk: { value: colors.text },
        uLineRect: { value: new Vector4(...(lines ? lines.rect : [0, 0, 1, 1])) },
        uLineSpec: { value: new Vector4(lines ? lines.rows : 0, lines ? lines.widthPx : 0.7, lines ? lines.seed : 0, lines ? lines.alpha : 0) },
        uLineInk: { value: colors.ink },
        uCard: { value: new Vector3(CARD_W, CARD_H, CARD_R) },
        uInkGrow: { value: 0 },
        uInkFace: { value: 1 },
        uInkWidth: { value: 0.06 },
        uInkGap: { value: -1 },
        uInkColor: { value: colors.brand },
        uInkPts: { value: emptyInk.points },
        uInkAcc: { value: emptyInk.acc }
      }
    });
  }

  function setInk(material, stroke, color, face, width) {
    const uniforms = material.uniforms;
    uniforms.uInkPts.value = stroke.points;
    uniforms.uInkAcc.value = stroke.acc;
    uniforms.uInkGap.value = stroke.gap;
    uniforms.uInkColor.value = color;
    uniforms.uInkFace.value = face;
    uniforms.uInkWidth.value = width;
    uniforms.uInkGrow.value = 0;
  }

  function shadowMaterial(color, alpha, power, core) {
    return new ShaderMaterial({
      vertexShader: shadowVertexShader,
      fragmentShader: shadowFragmentShader,
      transparent: true,
      depthWrite: false,
      uniforms: { uColor: { value: color }, uAlpha: { value: alpha }, uPow: { value: power }, uCore: { value: core } }
    });
  }

  /*
   * 预编译：卡与投影两个程序在这里编好、先画一帧（three 第一次用程序时才查编译错误）。
   * 这两份材质一直留到 dispose：three 在最后一个用某程序的材质释放时会删掉程序，
   * hide() 释放场景之后，下一次 show() 就又得现编一次。
   */
  const warmScene = new Scene();
  const warmGeometry = new PlaneGeometry(0.2, 0.2);
  const warmCard = new Mesh(warmGeometry, cardMaterial({ color: colors.paper, lines: { rect: [0, 0, 1, 1], rows: 3, widthPx: 0.7, seed: 1, alpha: 0.2 } }));
  const warmShadow = new Mesh(warmGeometry, shadowMaterial(colors.shadowLight, 0.2, 2, 0));
  warmCard.frustumCulled = false;
  warmShadow.frustumCulled = false;
  warmScene.add(warmCard, warmShadow);
  camera.position.set(0, 0, 5);
  camera.updateProjectionMatrix();

  /*
   * 上下文在预编译途中丢了，three 的 compileAsync 会一直等一个永远编不完的程序（丢失后查询状态恒为假），
   * createFx 就永远不返回。所以和「丢失」与一个兜底超时赛跑，谁先到算谁。
   */
  let ready = false;
  let abortWarm = null;
  const onContextLost = (event) => {
    event.preventDefault();
    if (!ready) {
      if (abortWarm) abortWarm(new Error("context-lost"));
      return;
    }
    fail("context-lost");
  };
  canvas.addEventListener("webglcontextlost", onContextLost);
  let warmTimer = 0;
  try {
    await Promise.race([
      renderer.compileAsync(warmScene, camera),
      new Promise((resolve, reject) => {
        abortWarm = reject;
        warmTimer = window.setTimeout(() => reject(new Error("预编译超时")), 10000);
      })
    ]);
    renderer.render(warmScene, camera);
    renderer.clear();
    if (shaderBroken) throw new Error("着色器编译失败");
  } catch (error) {
    canvas.removeEventListener("webglcontextlost", onContextLost);
    warmGeometry.dispose();
    warmCard.material.dispose();
    warmShadow.material.dispose();
    renderer.dispose();
    throw error;
  } finally {
    window.clearTimeout(warmTimer);
    abortWarm = null;
  }
  ready = true;
  renderer.debug.onShaderError = () => fail("error");

  // ── 状态 ─────────────────────────────────────────────────────────

  let view = null;
  let slot = null;
  let ticking = false;
  let needsRender = false;
  let layoutDirty = true;
  let apiDepth = 0;
  let lastRenderAt = 0;
  // 精简档限帧用：下一次该出帧的时刻（0 = 静止之后的第一帧，立即画）
  let nextDrawAt = 0;
  let slowWindows = 0;
  const frameSamples = [];
  const sizeProbe = new Vector2();
  const geometries = new Map();
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  let pointerHost = null;
  let scrollBound = false;
  let fadeTween = null;
  let labelCanvas = null;
  let flipButton = null;
  let switchButton = null;
  let refocusFlip = false;

  function fail(reason) {
    if (failed || disposed) return;
    failed = true;
    stop();
    // 加载器收到后会调 dispose()，推到下一个任务，免得在这条调用栈里把正在用的东西拆掉
    window.setTimeout(() => {
      try {
        if (typeof onFail === "function") onFail(reason);
      } catch {
        // 加载器自己的错不归这里管
      }
    }, 0);
  }

  const safe = (fn) =>
    function safeCallback(...args) {
      if (failed || disposed) return undefined;
      try {
        return fn.apply(this, args);
      } catch {
        fail("error");
        return undefined;
      }
    };

  const guard = (fn) => (...args) => {
    if (failed || disposed) return undefined;
    apiDepth += 1;
    try {
      return fn(...args);
    } catch {
      fail("error");
      return undefined;
    } finally {
      apiDepth -= 1;
    }
  };

  function invalidate() {
    needsRender = true;
    kick();
  }

  function kick() {
    if (ticking || failed || disposed || !view) return;
    ticking = true;
    gsap.ticker.add(tick);
  }

  function stop() {
    if (ticking) gsap.ticker.remove(tick);
    ticking = false;
    lastRenderAt = 0;
    nextDrawAt = 0;
  }

  function tick() {
    if (apiDepth > 0) return;
    if (failed || disposed || !view || document.hidden) {
      stop();
      return;
    }
    try {
      if (layoutDirty && !layout()) {
        stop();
        return;
      }
      if (view.prepare) view.prepare();
      if (!needsRender) {
        stop();
        return;
      }
      /*
       * 精简档限 30 帧：没到下一次该出帧的时刻就这一拍不画，needsRender 留着、ticker 不摘，下一拍再看。
       * 按「到期时刻」排而不是按「离上一帧多久」：软件合成下 rAF 常常只有 40 多帧，按间隔会被凑成每两拍画一次（约 23 帧），
       * 按到期时刻则长期平均仍是 30 帧。卡顿之后不补帧，从当下重新排。
       */
      if (soft && SOFT.frameIntervalMs > 0) {
        const now = performance.now();
        if (nextDrawAt && now < nextDrawAt - FRAME_INTERVAL_SLACK_MS) return;
        nextDrawAt = nextDrawAt && now - nextDrawAt < SOFT.frameIntervalMs ? nextDrawAt + SOFT.frameIntervalMs : now + SOFT.frameIntervalMs;
      }
      needsRender = false;
      view.apply();
      renderer.render(scene, camera);
      sampleFrame();
    } catch {
      fail("error");
    }
  }

  /*
   * 帧守卫：只量相邻两帧都画了的间隔（静止时不画，那段空白不算），最近 40 个间隔算一个窗口的**平均出帧率**，
   * 低于这一档目标帧率的 SLOW_FPS_RATIO 倍算一个慢窗口（判据与目标帧率的由来见 SLOW_FPS_RATIO 一段）。
   * 高档扛不住就地降到均衡档（降像素比、关纸纹），均衡档还扛不住就放弃。
   * 精简档没有下一档可降：目标只有 30 帧、线放在 18 帧，连续两个慢窗口才放弃（回平面界面，本次会话记住）。
   */
  function sampleFrame() {
    const now = performance.now();
    if (lastRenderAt) {
      const gap = now - lastRenderAt;
      if (gap < FRAME_GAP_LIMIT_MS[detail]) {
        frameSamples.push(gap);
        if (frameSamples.length > FRAME_WINDOW) frameSamples.shift();
      }
    }
    lastRenderAt = now;
    if (frameSamples.length < FRAME_WINDOW) return;
    let span = 0;
    for (let i = 0; i < frameSamples.length; i += 1) span += frameSamples[i];
    const windowFps = span > 0 ? (frameSamples.length / span) * 1000 : 0;
    let targetFps = 1000 / SOFT.frameIntervalMs;
    if (detail !== "soft") {
      const sorted = frameSamples.slice().sort((a, b) => a - b);
      const fastGap = sorted[Math.max(0, Math.ceil(sorted.length * REFRESH_SAMPLE_PCTL) - 1)];
      targetFps = Math.min(REFRESH_FPS_MAX, Math.max(REFRESH_FPS_MIN, 1000 / fastGap));
    }
    if (windowFps >= Math.min(targetFps * SLOW_FPS_RATIO[detail], SMOOTH_ENOUGH_FPS)) {
      slowWindows = 0;
      return;
    }
    frameSamples.length = 0;
    slowWindows += 1;
    if (slowWindows < SLOW_WINDOWS[detail]) return;
    slowWindows = 0;
    if (detail !== "high") {
      fail("slow");
      return;
    }
    detail = "balanced";
    shared.uGrain.value = 0;
    layoutDirty = true;
    needsRender = true;
    try {
      if (typeof onTier === "function") onTier("balanced");
    } catch {
      // 记账失败不影响降档本身
    }
  }

  /*
   * 相机永远正对着牌堆中心（view.frame 给出它在画布里的位置），画布只是按 setViewOffset 截出来的一块：
   * 做题页的画布向左多伸出 150px，牌堆在画布右侧，但透视仍以牌堆为中心，不会被斜着看。
   */
  function layout() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height || !canvas.isConnected) return false;
    layoutDirty = false;
    const ratio = pixelRatioFor(width, height);
    if (renderer.getPixelRatio() !== ratio) renderer.setPixelRatio(ratio);
    renderer.getSize(sizeProbe);
    if (sizeProbe.x !== width || sizeProbe.y !== height) renderer.setSize(width, height, false);
    shared.uDpr.value = ratio;

    const frame = view.frame(width, height);
    const fullWidth = 2 * Math.max(frame.cx, width - frame.cx, 1);
    const fullHeight = 2 * Math.max(frame.cy, height - frame.cy, 1);
    camera.fov = (2 * Math.atan(fullHeight / frame.ppu / 2 / frame.distance) * 180) / Math.PI;
    camera.aspect = fullWidth / fullHeight;
    camera.near = Math.max(0.1, frame.distance - 8);
    camera.far = frame.distance + 8;
    camera.position.set(0, 0, frame.distance);
    camera.setViewOffset(fullWidth, fullHeight, fullWidth / 2 - frame.cx, fullHeight / 2 - frame.cy, width, height);
    camera.updateProjectionMatrix();
    // 纸纤维一格约 1.4 个设备像素：再细就闪，再粗就成了斑
    shared.uGrainScale.value = (frame.ppu * ratio) / 1.4;

    if (view.rig && slot) {
      const rect = slot.getBoundingClientRect();
      view.rig.docTop = rect.top + window.scrollY;
      view.rig.docHeight = rect.height;
      if (!view.rig.leanReady) {
        view.rig.leanReady = true;
        view.rig.state.lean = leanTarget(view.rig);
      }
    }
    needsRender = true;
    return true;
  }

  function cardGeometry(depth) {
    const key = `${detail}:${depth}`;
    let geometry = geometries.get(key);
    if (!geometry) {
      geometry = new ExtrudeGeometry(roundedCardShape(), {
        depth,
        bevelEnabled: false,
        curveSegments: detail === "high" ? 8 : 4
      });
      geometry.translate(0, 0, -depth / 2);
      geometries.set(key, geometry);
    }
    return geometry;
  }

  function releaseGeometries() {
    for (const geometry of geometries.values()) geometry.dispose();
    geometries.clear();
  }

  function cardMesh(geometry, material) {
    const mesh = new Mesh(geometry, material);
    // 先绕自身竖轴翻面、再在牌堆平面里倾斜：倾角永远按「看上去」的方向算，翻过去不会镜像
    mesh.rotation.order = "ZYX";
    return mesh;
  }

  /** 影子平面是卡的 spread 倍大；芯收在卡边以内一点，卡边外那一圈柔开。 */
  function shadowMesh(spread, color, alpha) {
    const mesh = new Mesh(new PlaneGeometry(2 * CARD_W * spread, 2 * CARD_H * spread), shadowMaterial(color, alpha, 3, 0.85 / spread));
    mesh.renderOrder = -1;
    return mesh;
  }

  function disposeMesh(mesh, ownGeometry) {
    if (!mesh) return;
    if (mesh.parent) mesh.parent.remove(mesh);
    if (ownGeometry) mesh.geometry.dispose();
    mesh.material.dispose();
  }

  // ── 倾斜与后仰（首页、结算共用；做题页只用固定视角） ──────────────

  function makeRig(baseTilt) {
    const root = new Group();
    const tilt = new Group();
    root.add(tilt);
    scene.add(root);
    const state = { x: 0, y: 0, lean: 0 };
    const follow = (key, duration) => gsap.quickTo(state, key, { duration, ease: "sine.out", onUpdate: invalidate });
    const rig = {
      root,
      tilt,
      state,
      docTop: 0,
      docHeight: 1,
      leanReady: false,
      toX: follow("x", 0.7),
      toY: follow("y", 0.7),
      toLean: follow("lean", 0.55),
      apply() {
        tilt.rotation.x = baseTilt - state.y * 0.14 - state.lean * 0.42;
        tilt.rotation.y = state.x * 0.2;
      },
      dispose() {
        rig.toX.tween.kill();
        rig.toY.tween.kill();
        rig.toLean.tween.kill();
        scene.remove(root);
      }
    };
    return rig;
  }

  /* 滚到槽位整个离开视口顶边时后仰到底；页面在顶上时不仰。 */
  function leanTarget(rig) {
    return clamp01(window.scrollY / Math.max(rig.docTop + rig.docHeight, 1));
  }

  const onScroll = safe(() => {
    if (view && view.rig) view.rig.toLean(leanTarget(view.rig));
  });

  const onPointerMove = safe((event) => {
    if (!view || !view.rig || !view.focus || !pointerHost) return;
    const host = pointerHost.getBoundingClientRect();
    const box = canvas.getBoundingClientRect();
    const dx = (event.clientX - (box.left + view.focus.cx)) / Math.max(host.width * 0.5, 1);
    const dy = (box.top + view.focus.cy - event.clientY) / Math.max(host.height * 0.5, 1);
    view.rig.toX(clamp(dx, -1, 1));
    view.rig.toY(clamp(dy, -1, 1));
  });

  const onPointerLeave = safe(() => {
    if (!view || !view.rig) return;
    view.rig.toX(0);
    view.rig.toY(0);
  });

  function bindInteraction(withRig) {
    const host = withRig && slot ? slot.parentElement : null;
    if (pointerHost !== host) {
      if (pointerHost) {
        pointerHost.removeEventListener("pointermove", onPointerMove);
        pointerHost.removeEventListener("pointerleave", onPointerLeave);
      }
      pointerHost = null;
      if (host && finePointer.matches) {
        pointerHost = host;
        host.addEventListener("pointermove", onPointerMove, { passive: true });
        host.addEventListener("pointerleave", onPointerLeave, { passive: true });
      }
    }
    if (withRig && !scrollBound) {
      window.addEventListener("scroll", onScroll, { passive: true });
      scrollBound = true;
    } else if (!withRig && scrollBound) {
      window.removeEventListener("scroll", onScroll);
      scrollBound = false;
    }
  }

  function fadeIn() {
    if (fadeTween) fadeTween.kill();
    const fade = { v: 0 };
    canvas.style.opacity = "0";
    fadeTween = gsap.to(fade, {
      v: 1,
      duration: 0.35,
      ease: "sine.inOut",
      onUpdate: safe(() => {
        canvas.style.opacity = String(fade.v);
      }),
      onComplete: safe(() => {
        canvas.style.opacity = "";
        fadeTween = null;
      })
    });
  }

  // ── 首页题库牌堆 ────────────────────────────────────────────────

  function labelSurface() {
    if (!labelCanvas) labelCanvas = document.createElement("canvas");
    return labelCanvas;
  }

  function labelContext(width, height) {
    labelSurface();
    if (labelCanvas.width !== width) labelCanvas.width = width;
    if (labelCanvas.height !== height) labelCanvas.height = height;
    return labelCanvas.getContext("2d");
  }

  /*
   * 卡面字画成单通道覆盖率：黑底白字，次要文字画成 70% 灰——#6c6a61 正好是 #2e2d28 在纸上
   * 按 sRGB 叠 70%。一张 R8 贴图只占 RGBA 的四分之一显存。
   * 所有卡共用一块 2D 画布：画完立刻 initTexture 传上显卡，之后这张贴图不会再读画布。
   */
  function paintLabel(card) {
    const [width, height] = card.labelSize;
    const ctx = labelContext(width, height);
    const s = width / 512;
    const pad = 44 * s;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#fff";
    ctx.font = `700 ${Math.round(50 * s)}px ${FONT}`;
    wrapLines(ctx, card.bank.name, width - pad * 2, 3).forEach((line, index) => {
      ctx.fillText(line, pad, pad + 48 * s + index * 66 * s);
    });
    ctx.fillStyle = "rgb(179, 179, 179)";
    ctx.font = `400 ${Math.round(36 * s)}px ${FONT}`;
    ctx.fillText(`${Math.max(0, Math.round(Number(card.bank.count) || 0))}道`, pad, height - pad);
    card.texture.image = labelCanvas;
    card.texture.needsUpdate = true;
    renderer.initTexture(card.texture);
  }

  function buildHome() {
    const rig = makeRig(-0.22);
    const shadow = shadowMesh(1.32, colors.shadowDark, 0.62);
    rig.tilt.add(shadow);
    const geometry = cardGeometry(0.024);
    const check = checkStroke(0.74, -0.5, 0.52);

    const home = {
      kind: "home",
      rig,
      cards: [],
      order: [],
      currentId: null,
      onSwitch: null,
      swipe: null,
      ink: { v: 0 },
      inkTween: null,
      pendingLabels: new Set(),
      focus: null,

      frame(width, height) {
        const usable = Math.max(height - 48, 60);
        const cardWidth = clamp(Math.min(width * 0.56, usable * 0.62 * (CARD_W / CARD_H)), 72, 176);
        home.focus = { cx: width / 2, cy: usable / 2 + 4 };
        return { cx: home.focus.cx, cy: home.focus.cy, ppu: cardWidth / (2 * CARD_W), distance: 12 };
      },

      prepare() {
        if (!home.pendingLabels.size) return;
        for (const card of home.pendingLabels) paintLabel(card);
        home.pendingLabels.clear();
        needsRender = true;
      },

      makeCard(bank, index) {
        const texture = new CanvasTexture(labelSurface());
        texture.format = RedFormat;
        const material = cardMaterial({ color: index % 2 ? colors.paperSoft : colors.paper, map: texture, edgePx: 1.3 });
        setInk(material, check, colors.brand, 0, 0.042);
        const mesh = cardMesh(geometry, material);
        rig.tilt.add(mesh);
        const card = { id: String(bank.id), bank, texture, material, mesh, flip: 0, labelSize: LABEL_SIZE[detail] };
        home.pendingLabels.add(card);
        return card;
      },

      clearCards() {
        home.finishSwipe();
        for (const card of home.cards) {
          disposeMesh(card.mesh, false);
          card.texture.dispose();
        }
        home.cards = [];
        home.order = [];
        home.pendingLabels.clear();
      },

      update(data) {
        home.onSwitch = typeof data.onSwitch === "function" ? data.onSwitch : null;
        const banks = (Array.isArray(data.banks) ? data.banks : []).filter((bank) => bank && bank.id != null);
        const currentId = data.currentId == null ? null : String(data.currentId);
        const current = banks.find((bank) => String(bank.id) === currentId) || null;
        const picked = (current ? [current, ...banks.filter((bank) => bank !== current)] : banks).slice(0, HOME_CARDS_MAX);
        const sameSet =
          picked.length === home.cards.length &&
          picked.every((bank) => home.cards.some((card) => card.id === String(bank.id)));

        if (!sameSet) {
          home.clearCards();
          home.cards = picked.map((bank, index) => home.makeCard(bank, index));
          home.order = home.cards.slice();
          home.currentId = currentId;
          home.growInk(0.3);
        } else {
          for (const bank of picked) {
            const card = home.cards.find((item) => item.id === String(bank.id));
            if (card.bank.name !== bank.name || Number(card.bank.count) !== Number(bank.count)) home.pendingLabels.add(card);
            card.bank = bank;
          }
          if (currentId !== home.currentId) {
            home.currentId = currentId;
            const next = home.cards.find((card) => card.id === currentId);
            // 刚从「切换到这个题库」回来：新的当前题库正是顶卡，牌堆原样不动，只把勾换过去
            if (next && home.order[0] !== next) {
              home.finishSwipe();
              home.order = [next, ...home.order.filter((card) => card !== next)];
            }
            home.growInk(0.05);
          }
        }
        home.syncSwitch();
        invalidate();
      },

      growInk(delay) {
        if (home.inkTween) home.inkTween.kill();
        home.ink.v = 0;
        home.inkTween = gsap.to(home.ink, { v: 1, duration: 0.5, delay, ease: "none", onUpdate: invalidate });
      },

      currentCard() {
        return home.cards.find((card) => card.id === home.currentId) || null;
      },

      syncSwitch() {
        if (!switchButton) return;
        const top = home.order[0];
        const show = Boolean(top && top.id !== home.currentId && home.onSwitch);
        switchButton.hidden = !show;
        if (show) switchButton.setAttribute("aria-label", `切换到题库：${top.bank.name}`);
      },

      flip() {
        if (!home.order.length) return;
        home.finishSwipe();
        const card = home.order.shift();
        home.order.push(card);
        const swipe = { card, t: 0, flipFrom: card.flip, tween: null };
        swipe.tween = gsap.to(swipe, {
          t: 1,
          duration: 0.62,
          ease: "none",
          onUpdate: invalidate,
          onComplete: safe(() => home.endSwipe(swipe))
        });
        home.swipe = swipe;
        home.syncSwitch();
      },

      finishSwipe() {
        const swipe = home.swipe;
        if (!swipe) return;
        swipe.tween.progress(1);
        swipe.tween.kill();
        home.endSwipe(swipe);
      },

      endSwipe(swipe) {
        if (home.swipe !== swipe) return;
        // 两面印着同一张卡面，翻过去的卡背朝上塞回底下，轮到它时照样读得出来
        swipe.card.flip = swipe.flipFrom - Math.PI <= -2 * Math.PI + 1e-6 ? 0 : swipe.flipFrom - Math.PI;
        home.swipe = null;
        invalidate();
      },

      switchToTop() {
        const top = home.order[0];
        if (!top || top.id === home.currentId || !home.onSwitch) return;
        refocusFlip = document.activeElement === switchButton;
        home.onSwitch(top.bank.id);
      },

      /* 被刷走的卡：滑出去、翻面，沉到后面，再塞回最底下（主站 flashcards.ts 的 swipePath，距离收窄到 280px 的槽里）。 */
      swipePose(t, toRank, spread, flipFrom) {
        const out = phase(t, 0, 0.45);
        const sink = phase(t, 0.42, 0.66);
        const tuck = phase(t, 0.62, 1);
        const from = homeSlot(0, spread);
        const to = homeSlot(toRank, spread);
        return {
          x: lerp(lerp(from.x, from.x - 1.05, out), to.x, tuck),
          y: lerp(lerp(from.y, from.y + 0.16, out), to.y, tuck),
          z: lerp(from.z + Math.sin(Math.PI * clamp01(t / 0.5)) * 0.55, to.z - 0.05 * (1 - tuck), sink),
          flip: flipFrom - Math.PI * phase(t, 0.04, 0.5),
          tilt: lerp(lerp(from.tilt, -10 * DEG, out), to.tilt, tuck),
          scale: 1
        };
      },

      apply() {
        rig.apply();
        const spread = rig.state.lean;
        const count = home.order.length;
        const swipe = home.swipe;
        const rise = swipe ? phase(swipe.t, 0.36, 0.92) : 1;
        const current = home.currentCard();
        home.order.forEach((card, rank) => {
          let pose;
          if (swipe && card === swipe.card) {
            pose = home.swipePose(swipe.t, count - 1, spread, swipe.flipFrom);
          } else {
            pose = homeSlot(rank + (swipe ? 1 - rise : 0), spread);
            pose.flip = card.flip;
          }
          place(card.mesh, pose);
          card.material.uniforms.uInkGrow.value = card === current ? home.ink.v : 0;
        });
        shadow.visible = count > 0;
        shadow.position.set(0.12, -0.18, homeSlot(Math.max(count - 1, 0), spread).z - 0.12);
        shadow.scale.setScalar(1 + spread * 0.18);
      },

      dispose() {
        home.clearCards();
        if (home.inkTween) home.inkTween.kill();
        disposeMesh(shadow, true);
        rig.dispose();
      }
    };
    return home;
  }

  function ensureButtons() {
    if (flipButton) return;
    flipButton = document.createElement("button");
    flipButton.type = "button";
    flipButton.className = "fx-flip";
    flipButton.setAttribute("aria-label", "翻看下一个题库");
    switchButton = document.createElement("button");
    switchButton.type = "button";
    switchButton.className = "fx-switch";
    switchButton.hidden = true;
    switchButton.textContent = "切换到这个题库";
    flipButton.addEventListener("click", onFlipClick);
    switchButton.addEventListener("click", onSwitchClick);
  }

  const onFlipClick = guard(() => {
    if (view && view.kind === "home") view.flip();
  });

  const onSwitchClick = guard(() => {
    if (view && view.kind === "home") view.switchToTop();
  });

  function detachButtons() {
    if (flipButton) flipButton.remove();
    if (switchButton) switchButton.remove();
  }

  // ── 做题小牌堆 ──────────────────────────────────────────────────

  function buildQuiz(data) {
    const rig = makeRig(-0.42);
    const geometry = cardGeometry(0.06);
    const shadow = shadowMesh(1.4, colors.shadowLight, 0.22);
    shadow.position.set(0.14, -0.26, -0.55);
    rig.tilt.add(shadow);
    const check = checkStroke(0, 0.02, 1.5);
    const cross = crossStroke(0, 0, 1.08);
    const pool = [];
    let serial = 0;

    const quiz = {
      kind: "quiz",
      rig: null,
      sessionId: data.sessionId,
      index: Number(data.index) || 0,
      total: Number(data.total) || 0,
      mode: data.mode,
      stack: [],
      anim: null,
      lastAnimAt: -Infinity,
      answered: null,

      frame(width, height) {
        const box = canvas.getBoundingClientRect();
        const target = slot.getBoundingClientRect();
        const cx = target.left + target.width / 2 - box.left;
        const cy = target.top + target.height / 2 - box.top;
        const cardWidth = Math.max(20, Math.min(target.width * 0.74, target.height * 0.74 * (CARD_W / CARD_H)));
        return { cx, cy, ppu: cardWidth / (2 * CARD_W), distance: 20 };
      },

      acquire() {
        let card = pool.pop();
        if (!card) {
          serial += 1;
          const material = cardMaterial({
            color: serial % 2 ? colors.paper : colors.paperSoft,
            edgePx: 1,
            lines: { rect: [0.16, 0.34, 0.84, 0.78], rows: 3, widthPx: 0.55, seed: serial * 3 + 1, alpha: 0.3 }
          });
          card = { material, mesh: cardMesh(geometry, material) };
          rig.tilt.add(card.mesh);
        }
        card.material.uniforms.uInkGrow.value = 0;
        card.material.uniforms.uOpacity.value = 1;
        card.mesh.visible = true;
        return card;
      },

      release(card) {
        card.mesh.visible = false;
        card.material.uniforms.uInkGrow.value = 0;
        pool.push(card);
      },

      target() {
        return clamp(quiz.total - quiz.index, 0, QUIZ_VISIBLE_MAX);
      },

      /* 张数对齐到目标：多的从底下抽走，少的从底下补上。底下那张几乎全被盖住，增减看不出跳动。 */
      reconcile(target) {
        while (quiz.stack.length > target) quiz.release(quiz.stack.pop());
        while (quiz.stack.length < target) quiz.stack.push(quiz.acquire());
      },

      canAnimate() {
        const now = performance.now();
        if (now - quiz.lastAnimAt < QUIZ_THROTTLE_MS) return false;
        quiz.lastAnimAt = now;
        return true;
      },

      start(kind, card, duration, extra) {
        const anim = { kind, card, t: 0, tween: null, ...extra };
        anim.tween = gsap.to(anim, {
          t: 1,
          duration,
          ease: "none",
          onUpdate: invalidate,
          onComplete: safe(() => quiz.land(anim))
        });
        quiz.anim = anim;
      },

      /* 任何时刻最多一条牌堆动画：新事件来了，旧的直接推到终点，不排队。 */
      finish() {
        const anim = quiz.anim;
        if (!anim) return;
        anim.tween.progress(1);
        anim.tween.kill();
        quiz.land(anim);
      },

      land(anim) {
        if (quiz.anim !== anim) return;
        quiz.anim = null;
        if (anim.kind === "correct" || anim.kind === "away") {
          quiz.release(anim.card);
        } else if (anim.kind === "wrong") {
          // 塞回底下之后翻回正面、擦掉叉：它被上面的卡盖着，这一下看不见
          anim.card.material.uniforms.uInkGrow.value = 0;
        }
        invalidate();
      },

      deal() {
        quiz.reconcile(quiz.target());
        if (quiz.stack.length && quiz.canAnimate()) {
          quiz.start("deal", null, 0.3 + (quiz.stack.length - 1) * 0.04, {});
        }
        invalidate();
      },

      go(data) {
        const index = Number(data.index) || 0;
        quiz.total = Number(data.total) || 0;
        quiz.mode = data.mode;
        const diff = index - quiz.index;
        if (diff === 0) {
          if (!quiz.anim) quiz.reconcile(quiz.target());
          return;
        }
        quiz.finish();
        const answered = quiz.answered;
        quiz.index = index;
        quiz.answered = null;
        if (diff === 1 && !answered && quiz.stack.length) {
          // 模拟考试、自动看题：顶卡直接滑走，不翻面——不泄露对错
          const top = quiz.stack.shift();
          quiz.reconcile(quiz.target());
          if (quiz.canAnimate()) quiz.start("away", top, 0.42, {});
          else quiz.release(top);
        } else if (diff === -1) {
          const card = quiz.acquire();
          quiz.stack.unshift(card);
          quiz.reconcile(quiz.target());
          if (quiz.stack[0] === card && quiz.canAnimate()) quiz.start("back", card, 0.42, {});
        } else {
          quiz.reconcile(quiz.target());
        }
        invalidate();
      },

      answer(correct) {
        // 模拟考试与自动看题照约定不会调这里；万一调了也不翻面，宁可不动也不泄露对错
        if (quiz.mode === "exam" || quiz.mode === "review") return;
        if (quiz.answered || !quiz.stack.length) return;
        quiz.finish();
        quiz.answered = correct ? "correct" : "wrong";
        const top = quiz.stack.shift();
        if (correct) {
          setInk(top.material, check, colors.brand, -1, 0.14);
        } else {
          setInk(top.material, cross, colors.ink, -1, 0.1);
          quiz.stack.push(top);
        }
        if (quiz.canAnimate()) {
          quiz.start(correct ? "correct" : "wrong", top, correct ? 0.72 : 0.78, {});
        } else if (correct) {
          quiz.release(top);
        }
        invalidate();
      },

      /*
       * 答题：抬起（往上、往镜头）、原地翻面，背面写勾或叉。勾刷向右上、碰到画布边之前淡完；
       * 叉先升过牌堆顶边、再退到牌堆后面、再落下去塞回最底——全程不从别的卡中间穿过。
       *
       * 槽位左边就是题数（「4 / 20」），画布向左只多 6px：卡在任何时刻都不能越过槽位左缘。
       * 所以横向只许往右走；放大 1.12、抬高 1.5 之后（透视约 1.07），最左边离槽位左缘仍有 6px 余量
       * ——和静止时顶卡离左缘一样近，动画里不会更近。
       * 抬高 1.5 是按翻面算的：卡半宽 1.2×1.12 ≈ 1.34，翻到一半卡边下探 1.34，还压不到牌堆顶。
       *
       * 往上也要省着用：桌面上页面在顶部时槽位离视口顶只有约 38px，手机上离固定顶栏只有 18–28px。
       * 所以「抬起」主要朝镜头（z），往上只挪 0.3；勾主要往右刷；叉只升到刚好越过牌堆顶边的高度。
       * 这组数字改之前先在测试页扫一遍槽位左侧那几列像素（fx-harness 的 leftScan）。
       */
      answerPose(anim, from, bottom, alone) {
        const t = anim.t;
        const lift = phase(t, 0, 0.26);
        const pose = {
          x: lerp(from.x, 0.12, lift),
          y: from.y + 0.3 * lift,
          z: from.z + 1.5 * lift,
          flip: -Math.PI * phase(t, 0.04, 0.32),
          tilt: lerp(from.tilt, 2 * DEG, lift),
          scale: 1 + 0.12 * lift,
          opacity: 1
        };
        anim.card.material.uniforms.uInkGrow.value = phase(t, 0.28, 0.55);
        if (anim.kind === "correct") {
          const away = phase(t, 0.58, 1);
          pose.x += 2.6 * away;
          pose.y += 0.7 * away;
          pose.z += 0.3 * away;
          pose.tilt += 12 * DEG * away;
          pose.opacity = 1 - phase(t, 0.6, 0.92);
          return pose;
        }
        /*
         * 翻完之后卡是平的，只要还在牌堆上方（z > 0.06）就碰不到任何一张：所以「升」和「往后」可以斜着一起走，
         * 升到卡的下沿刚好高过牌堆顶边（2.1 - 0.9 > 0.14 + 0.9 + 倾角），再退到牌堆后面、落下去。
         */
        const over = phase(t, 0.54, 0.72);
        const back = phase(t, 0.7, 0.82);
        const down = phase(t, 0.8, 1);
        pose.y = lerp(lerp(pose.y, 2.1, over), bottom.y, down);
        pose.z = lerp(lerp(pose.z, 0.12, over), bottom.z - 0.06 * (1 - down), back);
        pose.x = lerp(pose.x, bottom.x, down);
        pose.scale = lerp(pose.scale, 1, over);
        pose.tilt = lerp(pose.tilt, bottom.tilt, down);
        // 只剩这一张时它塞回去也没有东西盖着：落定前翻回正面，别在最后一帧突然换面
        pose.flip = lerp(pose.flip, alone ? -2 * Math.PI : -Math.PI, down);
        return pose;
      },

      /* 考试 / 看题翻页：只往右上滑走（或从右上滑回来），不翻面、不往左。 */
      awayPose(u, from) {
        return {
          x: from.x + 2.4 * u,
          y: from.y + 2 * u,
          z: from.z + 0.6 * u,
          tilt: from.tilt + 16 * DEG * u,
          flip: 0,
          scale: 1,
          opacity: 1 - phase(u, 0.3, 1)
        };
      },

      apply() {
        rig.apply();
        const anim = quiz.anim;
        const count = quiz.stack.length;
        // 其余的卡：刷走 / 滑走时往上顶一格，滑回来时往下让一格
        let shift = 0;
        if (anim && (anim.kind === "correct" || anim.kind === "away")) shift = 1 - phase(anim.t, 0.4, 0.9);
        if (anim && anim.kind === "wrong") shift = 1 - phase(anim.t, 0.66, 1);
        if (anim && anim.kind === "back") shift = -(1 - phase(anim.t, 0.1, 0.8));

        quiz.stack.forEach((card, rank) => {
          if (anim && card === anim.card) return;
          let pose = quizSlot(rank + shift);
          let opacity = 1;
          if (anim && anim.kind === "deal") {
            const delay = (count - 1 - rank) * 0.04;
            const u = clamp01((anim.t * anim.tween.duration() - delay) / 0.3);
            // 从右上方发下来：左边是题数，发牌也不许从那边过
            const rest = pose;
            const from = { x: rest.x + 1.6, y: rest.y + 1.6, z: rest.z + 1, tilt: rest.tilt + 18 * DEG, flip: 0, scale: 1 };
            pose = mixPose(from, rest, smoothstep(u));
            opacity = phase(u, 0, 0.35);
          }
          place(card.mesh, pose);
          card.mesh.visible = opacity > 0.001;
          card.material.uniforms.uOpacity.value = opacity;
        });

        if (anim && anim.card) {
          const card = anim.card;
          let pose;
          if (anim.kind === "correct" || anim.kind === "wrong") {
            pose = quiz.answerPose(anim, quizSlot(0), quizSlot(Math.max(count - 1, 0)), count <= 1);
          } else if (anim.kind === "away") {
            pose = quiz.awayPose(smoothstep(anim.t), quizSlot(0));
          } else {
            pose = quiz.awayPose(smoothstep(1 - anim.t), quizSlot(0));
          }
          place(card.mesh, pose);
          card.mesh.visible = pose.opacity > 0.001;
          card.material.uniforms.uOpacity.value = pose.opacity;
        }
        shadow.visible = count > 0;
      },

      dispose() {
        if (quiz.anim) quiz.anim.tween.kill();
        quiz.anim = null;
        for (const card of [...quiz.stack, ...pool]) disposeMesh(card.mesh, false);
        quiz.stack = [];
        pool.length = 0;
        disposeMesh(shadow, true);
        rig.dispose();
      }
    };
    return quiz;
  }

  // ── 结算落堆 ────────────────────────────────────────────────────

  function buildSummary(data) {
    const rig = makeRig(-0.5);
    const geometry = cardGeometry(0.024);
    const total = Math.max(0, Math.round(Number(data.total) || 0));
    const correctCount = clamp(Math.round(Number(data.correct) || 0), 0, total);
    const count = Math.min(total, SUMMARY_CARDS_MAX);
    const right = total ? Math.round((correctCount / total) * count) : 0;
    const piles = { right: [], wrong: [] };
    const cards = [];
    for (let i = 0; i < count; i += 1) {
      // 对错按比例交错着落（Bresenham），两叠一起长高
      const isRight = Math.floor(((i + 1) * right) / count) > Math.floor((i * right) / count);
      const pile = isRight ? "right" : "wrong";
      const level = piles[pile].length;
      const material = cardMaterial({
        color: i % 2 ? colors.paperSoft : colors.paper,
        edgePx: 1.2,
        lines: { rect: [0.16, 0.36, 0.84, 0.78], rows: 3, widthPx: 0.6, seed: i * 5 + 2, alpha: 0.22 }
      });
      const mesh = cardMesh(geometry, material);
      mesh.visible = false;
      rig.tilt.add(mesh);
      const card = { pile, level, material, mesh, seed: i + 1, delay: 0.1 + i * 0.07 };
      piles[pile].push(card);
      cards.push(card);
    }
    const topRight = piles.right[piles.right.length - 1] || null;
    if (topRight) setInk(topRight.material, checkStroke(0.04, 0.02, 1.3), colors.brand, 1, 0.085);
    const shadows = {
      right: shadowMesh(1.32, colors.shadowLight, 0.22),
      wrong: shadowMesh(1.55, colors.shadowLight, 0.22)
    };
    rig.tilt.add(shadows.right, shadows.wrong);
    const drop = { t: 0 };
    const ink = { v: 0 };
    const dropDuration = count ? cards[count - 1].delay + 0.45 : 0;

    const summary = {
      kind: "summary",
      rig,
      key: `${total}|${correctCount}|${data.title ?? ""}`,
      focus: null,
      spreadX: 1.6,
      tweens: [],

      frame(width, height) {
        const cardHeight = clamp(height * 0.36, 40, 80);
        const cardWidth = cardHeight * (CARD_W / CARD_H);
        const ppu = cardWidth / (2 * CARD_W);
        summary.spreadX = Math.max(cardWidth * 0.86, width * 0.17) / ppu;
        summary.focus = { cx: width / 2, cy: height / 2 + 6 };
        return { cx: summary.focus.cx, cy: summary.focus.cy, ppu, distance: 12 };
      },

      pileX(pile) {
        if (!piles.right.length || !piles.wrong.length) return 0;
        return pile === "right" ? -summary.spreadX : summary.spreadX;
      },

      rest(card) {
        const r = (k) => jitter(card.seed * 7 + k) - 0.5;
        const messy = card.pile === "wrong";
        return {
          x: summary.pileX(card.pile) + r(1) * (messy ? 0.36 : 0.05),
          y: r(2) * (messy ? 0.28 : 0.05),
          z: card.level * 0.03,
          tilt: r(3) * (messy ? 28 : 2.5) * DEG,
          flip: 0,
          scale: 1
        };
      },

      apply() {
        rig.apply();
        const elapsed = drop.t * dropDuration;
        const landed = { right: 0, wrong: 0 };
        for (const card of cards) {
          const u = clamp01((elapsed - card.delay) / 0.45);
          const rest = summary.rest(card);
          const r = (k) => jitter(card.seed * 11 + k) - 0.5;
          const from = { x: rest.x + r(1) * 0.5, y: rest.y + 0.75, z: rest.z + 2, tilt: rest.tilt + r(2) * 0.5, flip: 0, scale: 1 };
          place(card.mesh, mixPose(from, rest, smoothstep(u)));
          const opacity = phase(u, 0, 0.4);
          card.mesh.visible = opacity > 0.001;
          card.material.uniforms.uOpacity.value = opacity;
          landed[card.pile] += phase(u, 0.5, 1);
        }
        if (topRight) topRight.material.uniforms.uInkGrow.value = ink.v;
        for (const pile of ["right", "wrong"]) {
          const shadow = shadows[pile];
          const size = piles[pile].length;
          shadow.visible = size > 0;
          shadow.position.set(summary.pileX(pile) + 0.12, -0.16, -0.08);
          shadow.material.uniforms.uAlpha.value = size ? 0.22 * (0.4 + (0.6 * landed[pile]) / size) * Math.min(1, landed[pile]) : 0;
        }
      },

      start() {
        if (!count) return;
        const tween = gsap.to(drop, { t: 1, duration: dropDuration, ease: "none", onUpdate: invalidate });
        summary.tweens.push(tween);
        if (topRight) {
          summary.tweens.push(gsap.to(ink, { v: 1, duration: 0.5, delay: dropDuration + 0.05, ease: "none", onUpdate: invalidate }));
        }
      },

      dispose() {
        for (const tween of summary.tweens) tween.kill();
        for (const card of cards) disposeMesh(card.mesh, false);
        disposeMesh(shadows.right, true);
        disposeMesh(shadows.wrong, true);
        rig.dispose();
      }
    };
    return summary;
  }

  // ── 场景切换 ────────────────────────────────────────────────────

  function summaryKey(data) {
    const total = Math.max(0, Math.round(Number(data.total) || 0));
    return `${total}|${clamp(Math.round(Number(data.correct) || 0), 0, total)}|${data.title ?? ""}`;
  }

  function releaseView() {
    if (!view) return;
    const old = view;
    view = null;
    stop();
    old.dispose();
    releaseGeometries();
    // 旧的一帧还留在绘图缓冲里：清掉，免得画布搬进新槽位时先闪一帧上一页的牌堆
    if (!context.isContextLost()) {
      renderer.setRenderTarget(null);
      renderer.clear();
    }
  }

  function attach(nextSlot) {
    if (canvas.parentElement !== nextSlot) nextSlot.prepend(canvas);
    if (slot !== nextSlot) {
      slot = nextSlot;
      layoutDirty = true;
    }
  }

  const onResize = safe(() => {
    layoutDirty = true;
    invalidate();
  });

  const onVisibility = safe(() => {
    if (document.hidden) return;
    lastRenderAt = 0;
    if (view) invalidate();
  });

  const observer = new ResizeObserver(onResize);
  observer.observe(canvas);
  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("resize", onResize);

  function showHome(data) {
    ensureButtons();
    if (!view || view.kind !== "home") {
      releaseView();
      view = buildHome();
      fadeIn();
    }
    slot.append(flipButton, switchButton);
    view.update(data);
    if (refocusFlip) {
      refocusFlip = false;
      flipButton.focus({ preventScroll: true });
    }
  }

  function showQuiz(data) {
    detachButtons();
    if (!view || view.kind !== "quiz" || view.sessionId !== data.sessionId) {
      releaseView();
      view = buildQuiz(data);
      view.deal();
      return;
    }
    view.go(data);
  }

  function showSummary(data) {
    detachButtons();
    if (view && view.kind === "summary" && view.key === summaryKey(data)) return;
    releaseView();
    view = buildSummary(data);
    view.start();
  }

  function clearFade() {
    if (fadeTween) fadeTween.kill();
    fadeTween = null;
    canvas.style.opacity = "";
  }

  function hideAll() {
    clearFade();
    releaseView();
    bindInteraction(false);
    detachButtons();
    canvas.remove();
    slot = null;
    layoutDirty = true;
  }

  const controller = {
    show: guard((page, data = {}) => {
      const nextSlot = data && data.slot;
      if (!nextSlot || !(page === "home" || page === "quiz" || page === "summary")) {
        hideAll();
        return;
      }
      if (page !== "home") clearFade();
      attach(nextSlot);
      if (page === "home") showHome(data);
      else if (page === "quiz") showQuiz(data);
      else showSummary(data);
      // 精简档不跟指针轻倾、不随滚动后仰：这两样只要鼠标在动、页面在滚就连续出帧，软件合成下每一帧都要重算周围的玻璃模糊
      bindInteraction(page !== "quiz" && !soft);
      layoutDirty = true;
      invalidate();
    }),

    hide: guard(() => {
      hideAll();
    }),

    answer: guard((result = {}) => {
      if (view && view.kind === "quiz") view.answer(Boolean(result && result.correct));
    }),

    dispose() {
      if (disposed) return;
      // 每一步单独兜住：前面哪一步出错，后面照样把监听撤掉、把上下文还掉
      const steps = [
        () => hideAll(),
        () => {
          disposed = true;
          stop();
        },
        () => observer.disconnect(),
        () => document.removeEventListener("visibilitychange", onVisibility),
        () => window.removeEventListener("resize", onResize),
        () => window.removeEventListener("scroll", onScroll),
        () => {
          if (flipButton) flipButton.removeEventListener("click", onFlipClick);
          if (switchButton) switchButton.removeEventListener("click", onSwitchClick);
          flipButton = null;
          switchButton = null;
        },
        () => {
          warmGeometry.dispose();
          warmCard.material.dispose();
          warmShadow.material.dispose();
        },
        () => {
          if (!labelCanvas) return;
          labelCanvas.width = 0;
          labelCanvas.height = 0;
          labelCanvas = null;
        },
        () => canvas.removeEventListener("webglcontextlost", onContextLost),
        () => canvas.remove(),
        () => renderer.dispose(),
        () => {
          if (!context.isContextLost()) renderer.forceContextLoss();
        }
      ];
      for (const step of steps) {
        try {
          step();
        } catch {
          // dispose 不能抛
        }
      }
      disposed = true;
    }
  };
  return controller;
}
