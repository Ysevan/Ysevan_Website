/* 案头手册（design-proposal.md §9）：宽屏右栏末尾一本随阅读进度翻页的 3D 纸质手册。纯装饰，不承载任何信息。
   首屏只做三件事：挂 window.GangDeskBook、读 ?desk3d= 调试参数、注册几个监听——不建 WebGL 上下文，不下载任何东西。
   three 与 GSAP 两份本地运行库只在 §9.4 的闸门全部通过、页面 load 之后的空闲时刻、且右栏末尾接近视口时，
   才用 <script> 标签注入（file:// 双击打开是硬约束：不能用 module、importmap、fetch、动态 import）。
   任何一步不合格或失败都静默退场：宿主节点整个移除，页面回到 v1.6.1 的样子。 */
(() => {
  "use strict";

  if (typeof window === "undefined" || typeof document === "undefined") return;

  const PAGE_COUNT = 8;
  const CANVAS_HEIGHT = 200;
  const DAMP_SECONDS = 0.14;          // 滚动进度的阻尼，与主站同一手感
  const OPEN_SECONDS = 0.8;           // 进入视口时翻开封面
  const TILT_MAX = (6 * Math.PI) / 180;
  const NEAR_MARGIN = "0px 0px 800px 0px";
  /* 精简档 soft（1.7.0 起）：只拿到软件渲染的上下文（没有独立显卡的 Windows 走 WARP、Chrome 走 SwiftShader，
     两者都用 CPU 画）时走这一档。软件渲染下 WebGL 与页面合成都在 CPU 上，所以只砍「每帧多少像素」「每秒几帧」
     「什么时候出帧」，画质本身不动：像素比钉 1、画布物理像素长边再压到 640 以内、出帧限 30、抗锯齿关、
     不跟指针倾斜（只留翻页 / 开合这些离散动画）。 */
  const SOFT = { maxEdgePx: 640, frameIntervalMs: 1000 / 30 };
  /* 帧率卸载要两个量同时超标：出帧间隔太长（掉帧了）**且**手册自己画一帧太久（是手册画慢的）。
     只看间隔会误伤：50Hz/48Hz 屏每帧本来就 20ms 上下，浏览器节能模式限到 30fps 时是 33ms，机器完全够用。

     **判据里不许掺进我们自己加的量**（四家通用规矩，2026-09-23 定；小屋三个 3D 岛踩过：看门狗量的间隔里
     掺着自己加的限帧，阈值又恰好压在量化台阶上，同一份构建跑三次靠抛硬币决定降不降档）。两条做法：
     ① **阈值按「本档自己承诺的帧率」的倍数写，不写绝对毫秒**——精简档承诺 30 帧，所以慢的线 = 承诺间隔
        × SOFT_SLOW_FACTOR（跌破 15 帧才算慢），自身绘制的线 = 一整个承诺帧预算（画一帧就吃光）；
        以后改 30 帧这个数，两条线自己跟着动。高 / 均衡档我们没有加任何限帧、间隔里没有我们的量，
        所以仍按绝对值（18ms / 8ms，1.6.x 起未变）。
     ② **间隔取均值，不取中位数**——限帧之后间隔只剩几个离散值，中位数在「一半一半」那点会整体翻面，
        均值（＝这一窗口真送出去几帧）不会。自身绘制耗时是连续量、没有台阶，仍取中位数（对首次着色器
        编译那种单点尖峰更稳）。
     节流器本身不受这条约束：限帧是闸门，不是判据。

     精简档另两个阈值也一起放宽（照刷刷 effects-3d.js）：软件渲染下一帧真可能超过 250ms，那种帧必须算进
     样本，否则永远攒不满一个窗口；而且要连续两个窗口都慢才卸载——软件渲染的抖动比 GPU 大，一个窗口不足为凭。 */
  const SOFT_SLOW_FACTOR = 2;
  const SLOW_FRAME_MS = { high: 18, balanced: 18, soft: SOFT.frameIntervalMs * SOFT_SLOW_FACTOR };
  const SLOW_DRAW_MS = { high: 8, balanced: 8, soft: SOFT.frameIntervalMs };
  const SLOW_WINDOWS = { high: 1, balanced: 1, soft: 2 };
  const FRAME_GAP_LIMIT_MS = { high: 250, balanced: 250, soft: 1000 };
  const SLOW_WINDOW_MS = 2000;
  const PIXEL_CAP = { high: 1.75, balanced: 1.25, soft: 1 };
  /* 限帧容差：rAF 时间戳有抖动，差一两毫秒不到间隔也照画，免得 60Hz 屏上被凑成每三拍画一次。
     与刷刷 effects-3d.js 取同一个值——写死 4ms 之所以够用，靠的是下面推进「下一次该出帧的时刻」时
     **落后超过一个间隔就重新基准、不累积欠账**那一句；只要不欠账，4ms 在 60→10 拍各档都对。 */
  const FRAME_SLACK_MS = 4;
  /* 两份运行库的路径必须以字面量出现在这里：tools/check-dockerfile-copy.sh 从本文件 grep 出它们，核对容器里都带上了。 */
  const RUNTIME = [
    { src: "vendor/three.min.js", global: "THREE", ok: (lib) => Boolean(lib && typeof lib.WebGLRenderer === "function" && typeof lib.ShaderMaterial === "function") },
    { src: "vendor/gsap.min.js", global: "gsap", ok: (lib) => Boolean(lib && typeof lib.quickTo === "function" && lib.ticker) },
  ];

  /* ?desk3d=force 只供验收：跳过「低端设备」「帧率卸载」两道闸，其余照旧；?desk3d=off 本次打开不启用。
     1.7.0 起它**不再是软件渲染的唯一入口**——软件渲染自己会走精简档 soft，不需要 force 开路。 */
  const debugFlag = (() => {
    try {
      const match = /[?&]desk3d=([^&#]*)/.exec(String(window.location.search || ""));
      return match ? decodeURIComponent(match[1]) : "";
    } catch (error) { return ""; }
  })();
  const force = debugFlag === "force";
  const urlOff = debugFlag === "off";

  /* 注入运行库时沿用本文件自己的 ?v= 查询串，版本号只在 index.html 写一处。 */
  const selfSrc = (document.currentScript && document.currentScript.src) || "";
  const baseUrl = selfSrc.replace(/[?#].*$/, "").replace(/[^/]*$/, "");
  const versionQuery = (/\?[^#]*/.exec(selfSrc) || [""])[0];

  const media = (query) => {
    try { return typeof window.matchMedia === "function" ? window.matchMedia(query) : null; } catch (error) { return null; }
  };
  const listenMedia = (query, run) => {
    if (!query) return;
    if (typeof query.addEventListener === "function") query.addEventListener("change", run);
    else if (typeof query.addListener === "function") query.addListener(run);
  };
  const reduceQuery = media("(prefers-reduced-motion: reduce)");
  const narrowQuery = media("(max-width: 1120px)");
  const pointerQuery = media("(hover: hover) and (pointer: fine)");
  const darkQuery = media("(prefers-color-scheme: dark)");

  const nav = window.navigator || {};
  const memory = typeof nav.deviceMemory === "number" ? nav.deviceMemory : 0; // 0 = 浏览器不报，不据此降级
  const cores = typeof nav.hardwareConcurrency === "number" ? nav.hardwareConcurrency : 0;
  const lowEnd = (memory > 0 && memory <= 2) || (cores > 0 && cores <= 2);
  const baseTier = (memory > 0 && memory <= 4) || (cores > 0 && cores <= 4) ? "balanced" : "high";
  const saveData = () => Boolean(nav.connection && nav.connection.saveData);
  const clock = () => (typeof performance !== "undefined" && typeof performance.now === "function" ? performance.now() : Date.now());
  const reduced = () => Boolean(reduceQuery && reduceQuery.matches);
  const narrow = () => Boolean(narrowQuery && narrowQuery.matches);
  const focusMode = () => Boolean(document.documentElement && document.documentElement.classList.contains("focus-mode"));

  let enabled = true;
  let page = null;          // 最近一次 sync：{ aside, key, doc }
  let hardFail = "";        // 硬失败原因；一旦非空，本次打开不再尝试
  let runtime = "idle";     // idle | loading | loaded
  let loadDone = document.readyState === "complete";
  let idleAsked = false;
  let idleDone = false;
  let probed = false;
  let near = false;
  let nearObserver = null;
  let nearTarget = null;
  let book = null;          // 场景句柄，见 createBook
  /* 上下文探测的结果。probeCanvas / probeGl 是探测时拿到的那一块画布与上下文，一直留到 createBook 手里
     （不再关掉重建：软件渲染下第二次 getContext 未必还给，而且白白多一次几十毫秒的初始化）。 */
  let probeCanvas = null;
  let probeGl = null;
  let stage = null;         // strict | loose | webgl1-only | none，还没探测过为 null
  let software = false;     // 只拿到软件渲染（渲染器名是软件实现，或严格参数被拒、宽松参数才给）
  let rendererName = "";
  let probeChain = { webgl2Strict: null, webgl2Loose: null, webgl1Loose: null };
  let tier = baseTier;      // 实际跑的档：软件渲染一律 soft，其余按内存 / 核数

  /* ================= 闸门（§9.4 的顺序，命中一条即停）=================
     返回 [state, reason]；全部通过返回 null。软闸（off）随时可能放行，硬失败（failed）本次打开不再恢复。 */
  function gate() {
    if (reduced()) return ["off", "reduced-motion"];
    if (narrow()) return ["off", "narrow"];
    if (focusMode()) return ["off", "focus-mode"];
    if (!page) return ["off", "no-page"];
    if (!enabled) return ["off", "switch-off"];
    if (urlOff) return ["off", "url-off"];
    if (saveData()) return ["off", "save-data"];
    if (lowEnd && !force) return ["off", "low-end"];
    if (hardFail) return ["failed", hardFail];
    return null;
  }

  function evaluate() {
    const blocked = gate();
    if (blocked) {
      /* 用户关掉或系统要求减弱动效：连同 WebGL 上下文一起释放；其余软闸（窄屏、专注、搜索页）只摘下宿主并暂停，回来时不必重建。 */
      const hard = blocked[1] === "switch-off" || blocked[1] === "reduced-motion" || blocked[0] === "failed";
      if (book) {
        if (hard) { book.dispose(); book = null; }
        else book.detach();
      } else if (hard && probeGl) {
        /* 场景还没建起来就被关掉：探测拿着的那块上下文同样要还回去，回来时重新探一次。 */
        releaseProbe();
        probed = false;
      }
      return;
    }
    if (book) { book.attach(page); return; }
    advance();
  }

  /* 按「页面 load → 空闲时刻 → WebGL2 探测 → 右栏末尾接近视口 → 注入运行库 → 建场景」往前走，每一步都可能停下等事件。 */
  function advance() {
    if (runtime === "loaded") { build(); return; }
    if (runtime === "loading" || !loadDone) return;
    if (!idleDone) { askIdle(); return; }
    if (!probed) {
      probed = true;
      const why = acquireContext();
      if (why) { fail(why); return; }
      /* 软件渲染一律 soft，完全不看内存与核数：屋主那台没显卡的 Windows 是 32G / 20 核，
         按内存核数会判成 high，软件渲染跑高档就是灾难。 */
      tier = software ? "soft" : baseTier;
    }
    if (!near) { watchNear(); if (!near) return; }
    inject();
  }

  function askIdle() {
    if (idleAsked) return;
    idleAsked = true;
    const run = () => { idleDone = true; evaluate(); };
    if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(run, { timeout: 3000 });
    else setTimeout(run, 400);
  }

  /* three r163 起只支持 WebGL2。探测在下载运行库之前做，分两段（照刷刷 effects.js 的 acquireContext）：

     第一段就是原来那套严参数（`failIfMajorPerformanceCaveat: true`）：有独立显卡的机器在这里拿到，
     之后的一切与 1.6.x 一字不差。拿不到多半是「只有软件渲染」——没有独立显卡的 Windows、没开 3D 加速的
     虚拟机，浏览器按这个标志拒绝给 WARP / SwiftShader 的上下文。
     第二段只把这一条放宽、再关掉抗锯齿（软件渲染下多重采样纯吃 CPU），拿到了就以精简档 soft 运行。
     第二段也可能拿不到：Chrome 122 起默认不给 SwiftShader 的 WebGL（要 --enable-unsafe-swiftshader 才给）。
     两段都拿不到就安静回静态（reason webgl2-unavailable，不报错、不下载运行库）；
     只顺手用宽松参数探一次 WebGL 1，结果记进 status() 供诊断，不为它做场景。

     渲染器名这一关 1.7.0 起从「拒绝」改成「判软件渲染 → 强制 soft」：屋主那台台式机（WARP）
     报的是 `Microsoft Basic Render Driver`，Chrome 被显式指定 --use-angle=swiftshader 时报 SwiftShader，
     这两种情形严格参数都照给上下文，只改第一道标志是拦不住的。判出来之后关掉抗锯齿重取一块，
     取不到就将就用手里这块——反正档位已经钉成 soft 了。
     RENDERER 已经是真名的浏览器（Firefox）不去碰 WEBGL_debug_renderer_info，免得它打弃用警告。 */
  const SOFTWARE_RENDERER = /swiftshader|llvmpipe|lavapipe|softpipe|software|basic render/i;
  const CONTEXT_ATTRIBUTES = { alpha: true, antialias: true, depth: true, stencil: false, premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: "low-power", failIfMajorPerformanceCaveat: true };
  const SOFTWARE_ATTRIBUTES = { alpha: true, antialias: false, depth: true, stencil: false, premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: "low-power", failIfMajorPerformanceCaveat: false };

  /* 每一段都用一块新画布：同一块画布上 getContext 失败之后能不能换参数重试，各浏览器说法不一。 */
  function tryContext(kind, attributes) {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext(kind, attributes);
      return gl ? { canvas, gl } : null;
    } catch (error) { return null; }
  }

  function nameOf(gl) {
    try {
      let name = String(gl.getParameter(gl.RENDERER) || "");
      if (/^webkit webgl$/i.test(name)) {
        const info = gl.getExtension("WEBGL_debug_renderer_info");
        if (info) name = String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL) || name);
      }
      return name;
    } catch (error) { return ""; }
  }

  function loseContext(gl) {
    try {
      const lose = gl && typeof gl.getExtension === "function" ? gl.getExtension("WEBGL_lose_context") : null;
      if (lose) lose.loseContext();
    } catch (error) { /* 拿不到扩展或上下文已经没了，都不影响回静态 */ }
  }

  /* 探测没被 createBook 领走就丢掉（硬失败、用户关开关、减弱动效）：同页 WebGL 上下文数有上限，不留着占额度。 */
  function releaseProbe() {
    if (probeGl) loseContext(probeGl);
    probeGl = null;
    probeCanvas = null;
  }

  /* 严 → 宽 →（都不成时）宽松 WebGL 1 只探不用。结果写进 probeChain / stage / software / rendererName；
     拿到的 WebGL 2 上下文连同它那块画布一起留给 createBook。返回失败原因，成功为空串。 */
  function acquireContext() {
    probeChain = { webgl2Strict: null, webgl2Loose: null, webgl1Loose: null };
    software = false;
    rendererName = "";
    const take = (found, at) => { probeCanvas = found.canvas; probeGl = found.gl; stage = at; return ""; };

    const strict = tryContext("webgl2", CONTEXT_ATTRIBUTES);
    probeChain.webgl2Strict = Boolean(strict);
    if (strict) {
      rendererName = nameOf(strict.gl);
      if (!SOFTWARE_RENDERER.test(rendererName)) return take(strict, "strict");
      software = true;
      const swapped = tryContext("webgl2", SOFTWARE_ATTRIBUTES);
      probeChain.webgl2Loose = Boolean(swapped);
      if (!swapped) return take(strict, "strict");
      loseContext(strict.gl);
      return take(swapped, "loose");
    }

    const loose = tryContext("webgl2", SOFTWARE_ATTRIBUTES);
    probeChain.webgl2Loose = Boolean(loose);
    if (loose) {
      software = true;
      rendererName = nameOf(loose.gl);
      return take(loose, "loose");
    }

    const legacy = tryContext("webgl", SOFTWARE_ATTRIBUTES);
    probeChain.webgl1Loose = Boolean(legacy);
    stage = legacy ? "webgl1-only" : "none";
    if (legacy) { rendererName = nameOf(legacy.gl); loseContext(legacy.gl); }
    return "webgl2-unavailable";
  }

  /* 宿主要等首帧画好才插入，所以「接近视口」只能看右栏里现有的最后一格：它在视口下方 800px 以内，
     或者已经滚到视口上方（手册是 sticky 的，那时它正停在视口里）。 */
  function anchorOf(aside) {
    let node = aside ? aside.lastElementChild : null;
    while (node && node.classList && node.classList.contains("desk-book")) node = node.previousElementSibling;
    return node || aside;
  }

  function watchNear() {
    const anchor = page ? anchorOf(page.aside) : null;
    if (!anchor) return;
    if (typeof window.IntersectionObserver !== "function") { near = true; return; }
    if (!nearObserver) {
      nearObserver = new window.IntersectionObserver((entries) => {
        const entry = entries[entries.length - 1];
        if (!entry || !(entry.isIntersecting || entry.boundingClientRect.bottom < 0)) return;
        near = true;
        nearObserver.disconnect();
        nearTarget = null;
        evaluate();
      }, { rootMargin: NEAR_MARGIN });
    }
    if (nearTarget === anchor) return;
    nearObserver.disconnect();
    nearTarget = anchor;
    nearObserver.observe(anchor);
  }

  /* 语法不被支持时 onload 照样触发、全局却没有挂上，所以每份都要回头核对全局真的在。 */
  function inject() {
    runtime = "loading";
    let left = RUNTIME.length;
    let failed = "";
    const settle = () => {
      left -= 1;
      if (left > 0) return;
      if (failed) { runtime = "idle"; fail(failed); return; }
      runtime = "loaded";
      evaluate();
    };
    RUNTIME.forEach((lib) => {
      const tag = document.createElement("script");
      tag.src = `${baseUrl}${lib.src}${versionQuery}`;
      tag.async = true;
      tag.onload = () => { if (!lib.ok(window[lib.global])) failed = failed || "runtime-missing"; settle(); };
      tag.onerror = () => { failed = failed || "runtime-load"; settle(); };
      (document.head || document.documentElement).appendChild(tag);
    });
  }

  function build() {
    if (book || !page) return;
    /* 手里不一定还有可用的上下文，两种情形都会这样，都要重新探一次而不是当场判失败：
       ① 上一个场景被拆过（用户把开关关了再打开、减弱动效开了再关）——拆场景会 forceContextLoss；
       ② 探测到建场景之间隔着「下载运行库」那一段，期间被浏览器收走（切换显卡、系统休眠）。
       重新探一次仍然拿不到才算硬失败，原因与首次探测一致。 */
    let lost = true;
    try { lost = !probeGl || (typeof probeGl.isContextLost === "function" && probeGl.isContextLost()); } catch (error) { lost = true; }
    if (lost) {
      releaseProbe();
      const why = acquireContext();
      if (why) { fail(why); return; }
      tier = software ? "soft" : baseTier;
    }
    try { book = createBook(); } catch (error) { book = null; fail((error && error.reason) || "scene-error"); return; }
    /* 上下文已经交给渲染器，探测这边松手，免得 releaseProbe 把活着的场景掐掉。 */
    probeGl = null;
    probeCanvas = null;
    if (book) book.attach(page);
  }

  /* 硬失败：释放一切并通知 app.js 撤掉开关（canOffer 从此为假）。 */
  function fail(reason) {
    if (hardFail) return;
    hardFail = String(reason || "failed");
    if (book) { try { book.dispose(); } catch (error) { /* 已经在退场，吞掉 */ } book = null; }
    releaseProbe();
    if (nearObserver) { nearObserver.disconnect(); nearTarget = null; }
    try { window.dispatchEvent(new CustomEvent("gang:desk-book", { detail: { reason: hardFail } })); } catch (error) { /* 老内核没有 CustomEvent 就等下一次重画 */ }
  }

  /* ================= 颜色：全部取 styles.css 的 --book-* 令牌 =================
     这里不留任何兜底色值：令牌读不到（例如缓存里还是旧样式表）就不画，免得出现第二套颜色来源。 */
  const TOKENS = ["--book-cover", "--book-spine", "--book-shade", "--book-ribbon", "--book-shadow", "--book-page", "--book-edge", "--book-ink"];

  function parseColor(text) {
    const value = String(text || "").trim().toLowerCase();
    let match = /^#([0-9a-f]{3,8})$/.exec(value);
    if (match) {
      let hex = match[1];
      if (hex.length === 3 || hex.length === 4) hex = hex.split("").map((digit) => digit + digit).join("");
      if (hex.length !== 6 && hex.length !== 8) return null;
      const byte = (at) => parseInt(hex.slice(at, at + 2), 16) / 255;
      return [byte(0), byte(2), byte(4), hex.length === 8 ? byte(6) : 1];
    }
    match = /^rgba?\(([^)]*)\)$/.exec(value);
    if (!match) return null;
    const parts = match[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat);
    if (parts.length < 3 || parts.slice(0, 3).some((part) => Number.isNaN(part))) return null;
    return [parts[0] / 255, parts[1] / 255, parts[2] / 255, parts.length > 3 && !Number.isNaN(parts[3]) ? parts[3] : 1];
  }

  /* 令牌是 sRGB；着色在线性空间里算，末尾由 three 的 linearToOutputTexel 转回去。 */
  const toLinear = (channel) => (channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4));

  function readTokens() {
    let style = null;
    try { style = window.getComputedStyle(document.documentElement); } catch (error) { return null; }
    const out = {};
    for (const name of TOKENS) {
      out[name] = parseColor(style.getPropertyValue(name));
      if (!out[name]) return null;
    }
    return out;
  }

  /* ================= 着色器 =================
     全部自写，不用 three 的写实材质：三档平涂色阶、背光面掺海湾蓝冷影、面边缘一圈略深的颜料边、
     程序化纸纹颗粒（亮度 ±3%，在输出色上乘，与屏幕亮度成比例）。法线由屏幕空间导数求，永远朝向相机。 */
  const COMMON = `
    uniform vec3 uLight;
    uniform vec3 uShade;
    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
    }
    float aastep(float edge, float x) {
      float w = max(fwidth(x) * 0.75, 1e-5);
      return smoothstep(edge - w, edge + w, x);
    }
    vec3 pigment(vec3 base, float dist, float width) {
      float rim = 1.0 - smoothstep(0.0, width, dist);
      return mix(base, base * 0.84 + uShade * 0.05, rim * 0.6);
    }
    vec3 tone(vec3 base, vec3 viewPos) {
      vec3 n = normalize(cross(dFdx(viewPos), dFdy(viewPos)));
      float l = dot(n, uLight);
      float lit = smoothstep(0.50, 0.56, l);
      float mid = smoothstep(0.02, 0.08, l);
      vec3 dark = mix(base * 0.80, uShade, 0.32);
      vec3 midTone = mix(base * 0.93, uShade, 0.10);
      return mix(dark, mix(midTone, base, lit), mid);
    }
    vec4 finish(vec3 color, vec2 grainAt) {
      vec4 outColor = linearToOutputTexel(vec4(color, 1.0));
      outColor.rgb *= 1.0 + (noise(grainAt) - 0.5) * 0.06;
      return outColor;
    }
  `;

  /* 书页：顶点位置全由 uv 算出。沿页宽是一段曲率恒定的弧（页边领先、像被捏着书口翻过去），
     平放时靠书脊那一截顺着书沟弯下去，于是一叠页从装订处扇形散开。 */
  const PAGE_VERT = `
    uniform float uTheta;
    uniform float uBend;
    uniform float uLift;
    uniform float uW;
    uniform float uH;
    uniform float uGutter;
    varying vec2 vUv;
    varying vec3 vView;
    void main() {
      vUv = uv;
      float s = uv.x * uW;
      float z = (0.5 - uv.y) * uH;
      float c = uBend / uW;
      float a = uTheta + c * s;
      vec2 p = abs(c) < 1e-4 ? s * vec2(cos(uTheta), sin(uTheta)) : vec2(sin(a) - sin(uTheta), cos(uTheta) - cos(a)) / c;
      p += vec2(-sin(a), cos(a)) * uLift * smoothstep(0.0, uGutter, s);
      vec4 mv = modelViewMatrix * vec4(p, z, 1.0);
      vView = mv.xyz;
      gl_Position = projectionMatrix * mv;
    }
  `;

  /* 页上的「字」只有程序生成的淡墨横线：页眉一条短粗线，其余按段落长短错落，段首缩进。正反面各一套版式。 */
  const PAGE_FRAG = `
    ${COMMON}
    uniform vec3 uPaper;
    uniform vec3 uInk;
    uniform vec3 uEdge;
    uniform float uSeed;
    uniform float uW;
    uniform float uH;
    varying vec2 vUv;
    varying vec3 vView;
    float ink(vec2 uv, float seed, bool verso) {
      float x = verso ? 1.0 - uv.x : uv.x;
      float left = verso ? 0.10 : 0.16;
      float right = verso ? 0.84 : 0.90;
      float row = (1.0 - uv.y - 0.09) / 0.052;
      if (row < 0.0 || row > 15.0) return 0.0;
      float index = floor(row);
      float within = fract(row);
      float heading = index < 0.5 ? 1.0 : 0.0;
      float endHere = step(hash(vec2(index, seed)), 0.24);
      float endBefore = index < 1.5 ? 1.0 : step(hash(vec2(index - 1.0, seed)), 0.24);
      if (index > 0.5 && index < 1.5) return 0.0;
      float indent = (endBefore > 0.5 && heading < 0.5) ? 0.07 : 0.0;
      float lineLen = heading > 0.5 ? 0.42 : (endHere > 0.5 ? 0.22 + 0.5 * hash(vec2(seed, index)) : 0.94 + 0.06 * hash(vec2(index, seed + 3.0)));
      float start = left + indent;
      float stop = start + (right - start) * lineLen;
      float thick = heading > 0.5 ? 0.20 : 0.12;
      float band = 1.0 - aastep(thick, abs(within - 0.5));
      float span = aastep(start, x) * (1.0 - aastep(stop, x));
      return band * span * (heading > 0.5 ? 1.25 : 1.0);
    }
    void main() {
      bool verso = !gl_FrontFacing;
      vec3 base = mix(uPaper, uInk, clamp(ink(vUv, uSeed + (verso ? 17.0 : 0.0), verso), 0.0, 1.0) * 0.26);
      vec2 size = vec2(uW, uH);
      vec2 edge = min(vUv, 1.0 - vUv) * size;
      base = mix(base, uEdge, (1.0 - smoothstep(0.0, 0.012, (1.0 - vUv.x) * uW)) * 0.5);
      base = pigment(base, min(edge.x, edge.y), 0.04);
      gl_FragColor = finish(tone(base, vView), vUv * size * 70.0);
    }
  `;

  const SOLID_VERT = `
    varying vec3 vLocal;
    varying vec3 vFace;
    varying vec3 vView;
    void main() {
      vLocal = position;
      vFace = normal;
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vView = mv.xyz;
      gl_Position = projectionMatrix * mv;
    }
  `;

  /* 封面板：外面是封面色，靠书脊一侧包一条书脊色（四分之一装帧）；内面是环衬纸，三边露出封面布的包边。
     板的四条侧边压暗一档。uInside 指明哪一面朝里：前封面合着时朝下（-1），后封面朝上（+1）。 */
  const BOARD_FRAG = `
    ${COMMON}
    uniform vec3 uCover;
    uniform vec3 uSpine;
    uniform vec3 uPaper;
    uniform float uInside;
    uniform vec3 uBox;
    uniform float uHinge;
    varying vec3 vLocal;
    varying vec3 vFace;
    varying vec3 vView;
    void main() {
      float bx = vLocal.x - uHinge;
      float bz = vLocal.z + uBox.z * 0.5;
      float dist = min(min(bx, uBox.x - bx), min(bz, uBox.z - bz));
      vec3 base = uCover * 0.82;
      if (abs(vFace.y) > 0.5) {
        if (vFace.y * uInside > 0.0) {
          float turnIn = 0.03;
          float paper = (1.0 - aastep(uBox.x - turnIn, bx)) * aastep(turnIn, bz) * (1.0 - aastep(uBox.z - turnIn, bz));
          base = mix(uCover, uPaper * 0.95, paper);
        } else {
          base = mix(uSpine, uCover, aastep(0.14, bx));
        }
        base = pigment(base, dist, 0.035);
      }
      gl_FragColor = finish(tone(base, vView), vLocal.xz * 70.0);
    }
  `;

  const FLAT_FRAG = `
    ${COMMON}
    uniform vec3 uColor;
    uniform vec3 uBox;
    varying vec3 vLocal;
    varying vec3 vFace;
    varying vec3 vView;
    void main() {
      vec3 halfBox = uBox * 0.5;
      float dist = min(halfBox.x - abs(vLocal.x), halfBox.z - abs(vLocal.z));
      vec3 base = abs(vFace.y) > 0.5 ? pigment(uColor, dist, 0.02) : uColor * 0.85;
      gl_FragColor = finish(tone(base, vView), vLocal.xz * 70.0);
    }
  `;

  /* 书签丝带：CPU 每帧重算一条折线（贴着书页、翻过书页下沿、落到桌面），尾端剪成燕尾。 */
  const RIBBON_VERT = `
    varying vec2 vUv;
    varying vec3 vView;
    void main() {
      vUv = uv;
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vView = mv.xyz;
      gl_Position = projectionMatrix * mv;
    }
  `;

  const RIBBON_FRAG = `
    ${COMMON}
    uniform vec3 uColor;
    uniform float uLength;
    uniform float uWidth;
    varying vec2 vUv;
    varying vec3 vView;
    void main() {
      float across = abs(vUv.x - 0.5) * 2.0;
      if ((1.0 - vUv.y) * uLength < 0.045 * (1.0 - across)) discard;
      vec3 base = pigment(uColor, (1.0 - across) * uWidth * 0.5, 0.012);
      gl_FragColor = finish(tone(base, vView), vUv * vec2(uWidth, uLength) * 90.0);
    }
  `;

  /* 桌面上的柔边假投影：圆角矩形的有向距离场，外沿羽化；没有实时阴影。 */
  const SHADOW_VERT = `
    varying vec2 vDesk;
    void main() {
      vDesk = vec2(position.x, -position.y);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const SHADOW_FRAG = `
    uniform vec4 uShadow;
    uniform vec4 uRect;
    varying vec2 vDesk;
    void main() {
      vec2 q = abs(vDesk - uRect.xy) - uRect.zw + 0.06;
      float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - 0.06;
      float alpha = uShadow.a * (1.0 - smoothstep(-0.05, 0.17, d));
      gl_FragColor = vec4(linearToOutputTexel(vec4(uShadow.rgb, 1.0)).rgb, alpha);
    }
  `;

  /* ================= 场景 ================= */
  function createBook() {
    const THREE = window.THREE;
    const gsap = window.gsap;
    const W = 1.0;                // 书页宽（书脊到书口）
    const H = 1.4;                // 书页高（天头到地脚）
    const T = 0.035;              // 封面板厚
    const HINGE = 0.03;           // 板与书脊的间隙，书脊条就露在这里
    const GAP = 0.0075;           // 相邻书页平放时的高度差
    const BW = W + 0.05;
    const BH = H + 0.09;
    const PIVOT = T + 0.004;      // 全部书页在书脊处汇于这一条线
    const GUTTER = 0.22;          // 书沟过渡宽度
    const BEND = 0.85;            // 翻到一半时整页的弯曲量（弧度）
    const COVER_CLOSED = PIVOT + (PAGE_COUNT + 1) * GAP;
    const RIBBON_X = 0.06;
    const RIBBON_W = 0.032;
    const RIBBON_SEGMENTS = 44;

    /* 画布与上下文都是探测那一步拿到的那一套，直接交给 three（`{ canvas, context }`）：
       软件渲染下第二次 getContext 未必还给，而且白白多一次初始化。参数已经在探测时定好，这里不再重复传。 */
    const soft = tier === "soft";
    const canvas = probeCanvas;
    const renderer = new THREE.WebGLRenderer({ canvas, context: probeGl, alpha: true, antialias: !soft, premultipliedAlpha: true });
    let shaderBroken = false;
    renderer.debug.onShaderError = () => { shaderBroken = true; };
    renderer.setPixelRatio(pixelRatioFor(0, 0));
    renderer.setClearColor(0x000000, 0);

    /* 像素比：按档封顶；精简档再让画布的物理像素长边不超过 SOFT.maxEdgePx（还量不到尺寸时只按档封顶）。 */
    function pixelRatioFor(boxWidth, boxHeight) {
      const ratio = Math.min(window.devicePixelRatio || 1, PIXEL_CAP[tier]);
      const edge = Math.max(boxWidth, boxHeight);
      return soft && edge > 0 ? Math.min(ratio, SOFT.maxEdgePx / edge) : ratio;
    }

    const host = document.createElement("div");
    host.className = "desk-book";
    host.setAttribute("aria-hidden", "true");
    host.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.5, 20);
    camera.position.set(0.88, 3.54, 3.32);
    camera.lookAt(-0.10, 0.10, -0.10);
    camera.updateMatrixWorld();

    const shared = {
      uLight: { value: new THREE.Vector3(-0.42, 0.86, 0.3).normalize().transformDirection(camera.matrixWorldInverse) },
      uShade: { value: new THREE.Color() },
      uPaper: { value: new THREE.Color() },
      uInk: { value: new THREE.Color() },
      uEdge: { value: new THREE.Color() },
      uCover: { value: new THREE.Color() },
      uSpine: { value: new THREE.Color() },
      uRibbon: { value: new THREE.Color() },
      uShadow: { value: [0, 0, 0, 0] },
    };
    const disposables = [];
    const keep = (item) => { disposables.push(item); return item; };
    const material = (vertexShader, fragmentShader, uniforms) => keep(new THREE.ShaderMaterial({
      vertexShader, fragmentShader, uniforms: { uLight: shared.uLight, uShade: shared.uShade, ...uniforms }, side: THREE.DoubleSide,
    }));

    const tilt = new THREE.Group();
    scene.add(tilt);

    const shadowMaterial = keep(new THREE.ShaderMaterial({
      vertexShader: SHADOW_VERT, fragmentShader: SHADOW_FRAG, transparent: true, depthWrite: false,
      uniforms: { uShadow: shared.uShadow, uRect: { value: [0, 0, 1, 1] } },
    }));
    const shadow = new THREE.Mesh(keep(new THREE.PlaneGeometry(3.4, 2.8)), shadowMaterial);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.0005;
    shadow.renderOrder = -1;
    tilt.add(shadow);

    const boardGeometry = keep(new THREE.BoxGeometry(BW, T, BH));
    boardGeometry.translate(HINGE + BW / 2, T / 2, 0);
    const boardUniforms = (inside) => ({
      uCover: shared.uCover, uSpine: shared.uSpine, uPaper: shared.uPaper,
      uInside: { value: inside }, uBox: { value: new THREE.Vector3(BW, T, BH) }, uHinge: { value: HINGE },
    });
    const back = new THREE.Mesh(boardGeometry, material(SOLID_VERT, BOARD_FRAG, boardUniforms(1)));
    tilt.add(back);
    const coverHinge = new THREE.Group();
    coverHinge.add(new THREE.Mesh(boardGeometry, material(SOLID_VERT, BOARD_FRAG, boardUniforms(-1))));
    tilt.add(coverHinge);

    const spineGeometry = keep(new THREE.BoxGeometry(HINGE * 2, T * 0.9, BH));
    const spine = new THREE.Mesh(spineGeometry, material(SOLID_VERT, FLAT_FRAG, { uColor: shared.uSpine, uBox: { value: new THREE.Vector3(HINGE * 2, T * 0.9, BH) } }));
    spine.position.y = T * 0.45;
    tilt.add(spine);

    const pageGeometry = keep(new THREE.PlaneGeometry(1, 1, 28, 1));
    const pages = [];
    for (let index = 0; index < PAGE_COUNT; index += 1) {
      const uniforms = {
        uPaper: shared.uPaper, uInk: shared.uInk, uEdge: shared.uEdge,
        uTheta: { value: 0 }, uBend: { value: 0 }, uLift: { value: 0 }, uSeed: { value: index * 7.31 + 1.7 },
        uW: { value: W }, uH: { value: H }, uGutter: { value: GUTTER },
      };
      const mesh = new THREE.Mesh(pageGeometry, material(PAGE_VERT, PAGE_FRAG, uniforms));
      mesh.position.y = PIVOT;
      mesh.frustumCulled = false; // 形状全在顶点着色器里算，three 手里的包围球不作数
      tilt.add(mesh);
      pages.push(uniforms);
    }

    const ribbonGeometry = keep(new THREE.BufferGeometry());
    const ribbonPositions = new Float32Array((RIBBON_SEGMENTS + 1) * 2 * 3);
    const ribbonUvs = new Float32Array((RIBBON_SEGMENTS + 1) * 2 * 2);
    const ribbonIndex = [];
    for (let seg = 0; seg < RIBBON_SEGMENTS; seg += 1) {
      const a = seg * 2;
      ribbonIndex.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
    const positionAttribute = new THREE.BufferAttribute(ribbonPositions, 3);
    const uvAttribute = new THREE.BufferAttribute(ribbonUvs, 2);
    ribbonGeometry.setAttribute("position", positionAttribute);
    ribbonGeometry.setAttribute("uv", uvAttribute);
    ribbonGeometry.setIndex(ribbonIndex);
    const ribbonUniforms = { uColor: shared.uRibbon, uLength: { value: 1 }, uWidth: { value: RIBBON_W } };
    const ribbon = new THREE.Mesh(ribbonGeometry, material(RIBBON_VERT, RIBBON_FRAG, ribbonUniforms));
    ribbon.frustumCulled = false;
    tilt.add(ribbon);

    /* 动画状态全在这一个对象上：GSAP 只改它，每帧由 pose() 落到 uniform 与节点上。 */
    const anim = { progress: 0, cover: 0, reveal: 0, tiltX: 0, tiltZ: 0, sway: 0 };
    const progressTo = gsap.quickTo(anim, "progress", { duration: DAMP_SECONDS, ease: "power2.out" });
    const tiltXTo = gsap.quickTo(anim, "tiltX", { duration: 0.6, ease: "power3.out" });
    const tiltZTo = gsap.quickTo(anim, "tiltZ", { duration: 0.6, ease: "power3.out" });
    const swayTo = gsap.quickTo(anim, "sway", { duration: 1.1, ease: "elastic.out(1, 0.35)" });
    let timeline = null;

    const clamp01 = (value) => Math.min(1, Math.max(0, value));
    const smooth = (value) => value * value * (3 - 2 * value);

    /* Catmull-Rom 过一组控制点，给丝带一条顺滑的路径。 */
    function ribbonPath(points, samples) {
      const out = [];
      const count = points.length - 1;
      for (let step = 0; step <= samples; step += 1) {
        const at = (step / samples) * count;
        const seg = Math.min(count - 1, Math.floor(at));
        const t = at - seg;
        const p0 = points[Math.max(0, seg - 1)];
        const p1 = points[seg];
        const p2 = points[seg + 1];
        const p3 = points[Math.min(count, seg + 2)];
        const t2 = t * t;
        const t3 = t2 * t;
        out.push([0, 1, 2].map((axis) => 0.5 * ((2 * p1[axis]) + (-p0[axis] + p2[axis]) * t + (2 * p0[axis] - 5 * p1[axis] + 4 * p2[axis] - p3[axis]) * t2 + (-p0[axis] + 3 * p1[axis] - 3 * p2[axis] + p3[axis]) * t3)));
      }
      return out;
    }

    function poseRibbon(topLift, sway) {
      const gutterAt = smooth(clamp01(RIBBON_X / GUTTER));
      const top = PIVOT + topLift * gutterAt + 0.004;
      const swing = sway * 0.16;
      const path = ribbonPath([
        [0.02, T * 0.9 + 0.003, -BH / 2 + 0.004],
        [RIBBON_X, top, -H / 2 + 0.06],
        [RIBBON_X, top, H / 2 - 0.08],
        [RIBBON_X + 0.008, Math.max(top - 0.006, T + 0.006), H / 2 + 0.01],
        [RIBBON_X + 0.02 + swing * 0.2, T + 0.004, BH / 2 - 0.004],
        [RIBBON_X + 0.035 + swing * 0.55, 0.003, BH / 2 + 0.08],
        [RIBBON_X + 0.05 + swing, 0.003, BH / 2 + 0.3],
      ], RIBBON_SEGMENTS);
      let length = 0;
      for (let index = 0; index < path.length; index += 1) {
        const prev = path[Math.max(0, index - 1)];
        const next = path[Math.min(path.length - 1, index + 1)];
        if (index > 0) length += Math.hypot(path[index][0] - prev[0], path[index][1] - prev[1], path[index][2] - prev[2]);
        let dx = next[0] - prev[0];
        let dz = next[2] - prev[2];
        const norm = Math.hypot(dx, dz) || 1;
        dx /= norm;
        dz /= norm;
        const half = RIBBON_W / 2;
        const at = index * 6;
        ribbonPositions[at] = path[index][0] + dz * half;
        ribbonPositions[at + 1] = path[index][1];
        ribbonPositions[at + 2] = path[index][2] - dx * half;
        ribbonPositions[at + 3] = path[index][0] - dz * half;
        ribbonPositions[at + 4] = path[index][1];
        ribbonPositions[at + 5] = path[index][2] + dx * half;
        ribbonUvs[index * 4] = 0;
        ribbonUvs[index * 4 + 1] = length;
        ribbonUvs[index * 4 + 2] = 1;
        ribbonUvs[index * 4 + 3] = length;
      }
      for (let index = 1; index < ribbonUvs.length; index += 2) ribbonUvs[index] /= length || 1;
      ribbonUniforms.uLength.value = length;
      positionAttribute.needsUpdate = true;
      uvAttribute.needsUpdate = true;
    }

    function pose() {
      const shown = clamp01(anim.progress) * clamp01(anim.reveal);
      const flipped = shown * PAGE_COUNT;
      pages.forEach((uniforms, index) => {
        const eased = smooth(clamp01(flipped - index));
        const theta = Math.PI * eased;
        uniforms.uTheta.value = theta;
        uniforms.uBend.value = BEND * Math.sin(theta);
        uniforms.uLift.value = (PAGE_COUNT - index) * GAP * (1 - eased) - (index + 1) * GAP * eased;
      });
      const cover = clamp01(anim.cover);
      coverHinge.rotation.z = Math.PI * cover;
      coverHinge.position.y = COVER_CLOSED + (T - COVER_CLOSED) * smooth(cover);
      tilt.rotation.x = anim.tiltX;
      tilt.rotation.z = anim.tiltZ;
      const left = HINGE + (-(HINGE + BW) - HINGE) * smooth(cover);
      const right = HINGE + BW;
      shadowMaterial.uniforms.uRect.value = [(left + right) / 2 + 0.04, 0.06, (right - left) / 2, BH / 2 + 0.01];
      poseRibbon((PAGE_COUNT - flipped) * GAP, anim.sway);
    }

    /* 颜色随三态主题与系统深浅即时切换：app.js 改 html[data-theme]，这里跟着重读令牌。 */
    function recolor() {
      const tokens = readTokens();
      if (!tokens) return false;
      const set = (uniform, rgba) => uniform.value.setRGB(toLinear(rgba[0]), toLinear(rgba[1]), toLinear(rgba[2]));
      set(shared.uCover, tokens["--book-cover"]);
      set(shared.uSpine, tokens["--book-spine"]);
      set(shared.uShade, tokens["--book-shade"]);
      set(shared.uRibbon, tokens["--book-ribbon"]);
      set(shared.uPaper, tokens["--book-page"]);
      set(shared.uEdge, tokens["--book-edge"]);
      set(shared.uInk, tokens["--book-ink"]);
      const shade = tokens["--book-shadow"];
      shared.uShadow.value = [toLinear(shade[0]), toLinear(shade[1]), toLinear(shade[2]), shade[3]];
      return true;
    }

    /* ---------- 按需渲染：只在有动画或状态变化时挂上 GSAP 的 ticker，静止时一帧不跑 ---------- */
    let attached = false;
    let visible = false;
    let dirty = true;
    let ticking = false;
    let lastTick = 0;
    let nextDrawAt = 0;       // 精简档限帧用的「下一次该出帧的时刻」
    let drawCosts = [];
    let frameTotal = 0;
    let frameCount = 0;
    let slowWindows = 0;
    let headHeight = 0;
    let lastProgress = 0;
    let lastScrollAt = 0;
    let swayTimer = 0;
    let opened = false;
    let key = "";
    let width = 0;
    let height = 0;

    /* 返回这一帧在主线程上的开销（pose + render），帧率闸拿它区分「手册画得慢」与「刷新率低 / 浏览器限帧」。 */
    function draw() {
      const start = clock();
      pose();
      renderer.render(scene, camera);
      dirty = false;
      return clock() - start;
    }

    function tick() {
      if (attached && visible) {
        /* 精简档限 30 帧：没到该出帧的时刻就这一拍不画，dirty 留着、ticker 不摘，下一拍再看。
           按「到期时刻」排而不是按「离上一帧多久」：软件合成下 rAF 本来就常常不满 60，
           按间隔会被凑成每两拍才画一次（约 23 帧），按到期时刻长期平均仍是 30 帧。卡顿之后不补帧，从当下重排。 */
        if (soft) {
          const at = clock();
          if (nextDrawAt && at < nextDrawAt - FRAME_SLACK_MS) return;
          nextDrawAt = nextDrawAt && at - nextDrawAt < SOFT.frameIntervalMs ? nextDrawAt + SOFT.frameIntervalMs : at + SOFT.frameIntervalMs;
        }
        const now = clock();
        const gap = lastTick ? now - lastTick : 0;
        lastTick = now;
        const cost = draw();
        if (gap) watchFrame(gap, cost);
      }
      if (!book) return;
      if (!attached || !visible || (!dirty && !gsap.isTweening(anim))) {
        gsap.ticker.remove(tick);
        ticking = false;
        lastTick = 0;
        nextDrawAt = 0;
      }
    }

    function wake() {
      dirty = true;
      if (ticking || !attached || !visible) return;
      ticking = true;
      lastTick = 0;
      nextDrawAt = 0;
      gsap.ticker.add(tick);
    }

    /* 只统计动画进行中相邻两帧的间隔与该帧的自身开销（每段动画的第一帧含空闲时间，丢掉；超过本档间隔上限的
       多半是切走了标签页，也丢掉）；累计满 2 秒动画时间算一次，间隔取均值、自身绘制取中位数，
       同时超标才算一个慢窗口（为什么一个均值一个中位数，见文件头 SLOW_FRAME_MS 那段）。
       高 / 均衡档一个慢窗口就卸载；精简档要连续两个——软件渲染的抖动比 GPU 大，一个窗口不足为凭。 */
    function watchFrame(gap, cost) {
      if (force || gap <= 0 || gap > FRAME_GAP_LIMIT_MS[tier]) return;
      drawCosts.push(cost);
      frameTotal += gap;
      frameCount += 1;
      if (frameTotal < SLOW_WINDOW_MS) return;
      const median = (list) => list.slice().sort((a, b) => a - b)[Math.floor(list.length / 2)];
      const gapMean = frameTotal / frameCount;   // 这一窗口真送出去几帧：连续量，不落在限帧的量化台阶上
      const costMedian = median(drawCosts);
      drawCosts = [];
      frameTotal = 0;
      frameCount = 0;
      if (!(gapMean > SLOW_FRAME_MS[tier] && costMedian > SLOW_DRAW_MS[tier])) { slowWindows = 0; return; }
      slowWindows += 1;
      if (slowWindows >= SLOW_WINDOWS[tier]) fail("slow-frames");
    }

    function readHead() {
      try {
        const value = parseFloat(window.getComputedStyle(document.documentElement).getPropertyValue("--head-h"));
        headHeight = Number.isFinite(value) && value > 0 ? value : 128;
      } catch (error) { headHeight = 128; }
    }

    /* 阅读进度 = 正文顶边越过工作台头下沿、到正文底边到达视口底边；正文比视口还短时改看整页滚动。 */
    function readProgress() {
      const doc = page && page.doc;
      const view = window.innerHeight || 0;
      if (!doc || typeof doc.getBoundingClientRect !== "function" || !view) return 0;
      const rect = doc.getBoundingClientRect();
      const travel = rect.height - (view - headHeight);
      if (travel > 1) return clamp01((headHeight - rect.top) / travel);
      const root = document.documentElement;
      const max = root.scrollHeight - view;
      return max > 1 ? clamp01((window.pageYOffset || 0) / max) : 0;
    }

    function onScroll() {
      if (!attached) return;
      const now = clock();
      const next = readProgress();
      const speed = (next - lastProgress) / Math.max(16, now - lastScrollAt) * 1000;
      lastProgress = next;
      lastScrollAt = now;
      progressTo(next);
      swayTo(Math.max(-1, Math.min(1, speed * 0.6 + anim.tiltZ * -2)));
      clearTimeout(swayTimer);
      swayTimer = setTimeout(() => { swayTo(anim.tiltZ * -2); wake(); }, 160);
      wake();
    }

    /* 精简档不跟指针倾斜：鼠标一动就是一串连续帧，软件渲染下这是最贵的一种输入；
       翻页、开合这些离散动画照常演。 */
    function onPointer(event) {
      if (soft || !attached || !visible || !pointerQuery || !pointerQuery.matches) return;
      const rect = canvas.getBoundingClientRect();
      const halfW = (window.innerWidth || 1) / 2;
      const halfH = (window.innerHeight || 1) / 2;
      let dx = (event.clientX - (rect.left + rect.width / 2)) / halfW;
      let dy = (event.clientY - (rect.top + rect.height / 2)) / halfH;
      const size = Math.hypot(dx, dy);
      if (size > 1) { dx /= size; dy /= size; }
      tiltXTo(dy * TILT_MAX);
      tiltZTo(-dx * TILT_MAX);
      swayTo(dx * 0.5);
      wake();
    }

    function onPointerLeave(event) {
      if (soft || event.relatedTarget) return;
      tiltXTo(0);
      tiltZTo(0);
      swayTo(0);
      wake();
    }

    function resize() {
      const nextWidth = Math.max(1, Math.round(host.clientWidth || width || 1));
      const nextHeight = Math.max(1, Math.round(host.clientHeight || CANVAS_HEIGHT));
      if (nextWidth === width && nextHeight === height) return;
      width = nextWidth;
      height = nextHeight;
      /* 精简档的像素比跟着画布尺寸走（长边封顶 640 物理像素），所以每次改尺寸都要重算一次。 */
      const ratio = pixelRatioFor(width, height);
      if (renderer.getPixelRatio() !== ratio) renderer.setPixelRatio(ratio);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      wake();
    }

    function openBook(seconds) {
      if (timeline) timeline.kill();
      opened = true;
      timeline = gsap.timeline({ onUpdate: wake });
      timeline.to(anim, { cover: 1, duration: seconds, ease: "power2.inOut" });
      timeline.to(anim, { reveal: 1, duration: 0.45, ease: "power1.out" }, ">-0.12");
      wake();
    }

    /* 换业务：先把书页收回右侧、再合上封面，然后翻开，页数从新业务的阅读进度接着翻。
       封面始终在全部书页的外侧（合时后到、开时先到），所以它不会从书页中间穿过去。 */
    function swapBook() {
      if (timeline) timeline.kill();
      timeline = gsap.timeline({ onUpdate: wake });
      timeline.to(anim, { reveal: 0, duration: 0.15, ease: "power1.in" });
      timeline.to(anim, { cover: 0, duration: 0.2, ease: "power2.in" }, ">-0.05");
      timeline.to(anim, { cover: 1, duration: 0.22, ease: "power2.out" });
      timeline.to(anim, { reveal: 1, duration: 0.18, ease: "power1.out" }, ">-0.08");
      wake();
    }

    function closeNow() {
      if (timeline) timeline.kill();
      timeline = null;
      anim.cover = 0;
      anim.reveal = 0;
      opened = false;
      dirty = true;
    }

    const seen = typeof window.IntersectionObserver === "function"
      ? new window.IntersectionObserver((entries) => {
        const entry = entries[entries.length - 1];
        visible = Boolean(entry && entry.isIntersecting);
        if (!visible) return;
        if (!opened && entry.intersectionRatio >= 0.35) openBook(OPEN_SECONDS);
        wake();
      }, { threshold: [0, 0.35] })
      : null;
    const sized = typeof window.ResizeObserver === "function" ? new window.ResizeObserver(resize) : null;
    const themeWatch = typeof window.MutationObserver === "function" ? new window.MutationObserver(() => { recolor(); wake(); }) : null;
    const onScheme = () => { recolor(); wake(); };
    const onLost = () => fail("context-lost");
    canvas.addEventListener("webglcontextlost", onLost);

    const onResize = () => { readHead(); onScroll(); };

    function listen(on) {
      const verb = on ? "addEventListener" : "removeEventListener";
      window[verb]("scroll", onScroll, { passive: true });
      window[verb]("resize", onResize, { passive: true });
      document[verb]("pointermove", onPointer, { passive: true });
      document[verb]("pointerout", onPointerLeave, { passive: true });
    }

    function attach(next) {
      const aside = next.aside;
      const fresh = !attached;
      if (host.parentNode !== aside || aside.lastElementChild !== host) aside.appendChild(host);
      readHead();
      if (fresh) {
        attached = true;
        listen(true);
        if (seen) seen.observe(host);
        if (sized) sized.observe(host);
        if (themeWatch) themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ["data-mode", "data-accent"] });
        listenMedia(darkQuery, onScheme);
        recolor();
      }
      if (!seen) visible = true;
      /* 同一业务的重画（切原文对照、开关重点标识）只是把画布搬进新右栏；换了业务才合上再翻开。 */
      const changed = key && key !== next.key;
      key = next.key;
      lastProgress = readProgress();
      if (fresh) progressTo(lastProgress, lastProgress);
      else progressTo(lastProgress);
      if (changed && opened) {
        const rect = host.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < (window.innerHeight || 0)) swapBook();
        else closeNow();
      }
      resize();
      draw();
    }

    function detach() {
      if (!attached) return;
      attached = false;
      listen(false);
      if (seen) seen.disconnect();
      if (sized) sized.disconnect();
      if (themeWatch) themeWatch.disconnect();
      if (darkQuery && typeof darkQuery.removeEventListener === "function") darkQuery.removeEventListener("change", onScheme);
      else if (darkQuery && typeof darkQuery.removeListener === "function") darkQuery.removeListener(onScheme);
      clearTimeout(swayTimer);
      if (ticking) { gsap.ticker.remove(tick); ticking = false; }
      visible = false;
      if (host.parentNode) host.parentNode.removeChild(host);
    }

    function dispose() {
      detach();
      canvas.removeEventListener("webglcontextlost", onLost);
      if (timeline) timeline.kill();
      gsap.killTweensOf(anim);
      disposables.forEach((item) => item.dispose());
      renderer.dispose();
      /* 主动释放上下文（浏览器对同页上下文数有上限）；已经丢失的就别再丢一次，three 会为此打警告。 */
      const gl = renderer.getContext();
      if (gl && typeof gl.isContextLost === "function" && !gl.isContextLost()) renderer.forceContextLoss();
    }

    /* 首帧先在未插入文档的画布上画好：宽度按右栏内容区量，着色器编译失败就当场放弃，页面上什么都不出现。 */
    gsap.config({ autoSleep: 60 });
    if (!recolor()) { dispose(); throw Object.assign(new Error("tokens"), { reason: "tokens-missing" }); }
    const asideStyle = page && page.aside ? window.getComputedStyle(page.aside) : null;
    const guess = page && page.aside ? page.aside.clientWidth - parseFloat(asideStyle.paddingLeft) - parseFloat(asideStyle.paddingRight) : 210;
    width = Math.max(1, Math.round(guess || 210));
    height = CANVAS_HEIGHT;
    renderer.setPixelRatio(pixelRatioFor(width, height));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    draw();
    if (shaderBroken) { dispose(); throw Object.assign(new Error("shader"), { reason: "shader-error" }); }
    width = 0;

    return { attach, detach, dispose, tier };
  }

  /* ================= 对外接口：app.js 调用前一律先判 typeof ================= */
  window.GangDeskBook = {
    configure(options) {
      enabled = !(options && options.enabled === false);
      evaluate();
    },
    canOffer() {
      return !reduced() && !saveData() && !(lowEnd && !force) && !hardFail;
    },
    setEnabled(on) {
      enabled = Boolean(on);
      evaluate();
    },
    sync(state) {
      page = state && state.aside ? { aside: state.aside, key: String(state.key || ""), doc: state.doc || null } : null;
      evaluate();
    },
    /* software / stage / renderer / probe 是诊断字段（1.7.0 增）：
       屋主那台只有 WARP 的台式机走的是哪一段、判成了哪一档，只有它自己答得出，控制台一看便知。 */
    status() {
      const probe = { webgl2Strict: probeChain.webgl2Strict, webgl2Loose: probeChain.webgl2Loose, webgl1Loose: probeChain.webgl1Loose };
      const diag = { software, stage, renderer: rendererName || null, probe };
      const blocked = gate();
      if (blocked) return Object.assign({ state: blocked[0], reason: blocked[1], tier: null }, diag);
      if (book) return Object.assign({ state: "ready", reason: "", tier }, diag);
      if (runtime === "loading") return Object.assign({ state: "loading", reason: "runtime", tier }, diag);
      return Object.assign({ state: "waiting", reason: !loadDone ? "page-load" : !idleDone ? "idle" : "viewport", tier }, diag);
    },
  };

  if (!loadDone) window.addEventListener("load", () => { loadDone = true; evaluate(); }, { once: true });
  listenMedia(reduceQuery, evaluate);
  listenMedia(narrowQuery, evaluate);
})();
