// 刷刷 3D 纸卡点缀的加载器：判定本机能不能用 3D、在空闲时按需加载场景模块、把页面调用转给场景。
// 3D 只是点缀：这里的任何方法都不能把异常抛给 app.js，任何失败的终点都是原来的 2D 界面。
(function () {
  "use strict";

  // 发布核对（scripts/release-check.mjs）会逐字比对这个地址与 sw.js 的 ON_DEMAND，改版本参数两边一起改。
  // 3.11.2 起加载的是经典脚本 bundle（IIFE，全局名 __shuaFx3d），不是 ES module：
  // 浏览器对 file:// 禁用 ES module，屋主在手机上只能直接双击 index.html，import() 在那里必然失败。
  // 经典脚本用 <script src> 注入，http 与 file:// 走同一条路。CSP 是 script-src 'self'，同源脚本放行。
  const BUNDLE_URL = "./effects-3d.bundle.js?v=3.12.0";
  const GLOBAL_NAME = "__shuaFx3d";
  const PREFERENCE_KEY = "shua-fx-3d";
  const TIER_KEY = "shua-fx-tier";
  // 本机加载成功过 3D 的记号。有它才在首次渲染前预留槽位：3D 总在首屏之后才到，
  // 没加载成功过的设备若也预留，失败时就得收回、版面跳一下；成功过的设备文件已在离线缓存里，几乎必成。
  const LOADED_KEY = "shua-fx-ok";
  // 这些失败说明「这台设备上次能行、这次不行」的前提已经不成立，清掉记号，下次不再预留。
  const FORGET_REASONS = Object.freeze(["no-webgl", "load-failed", "offline", "context-lost", "error"]);
  const LOAD_TIMEOUT_MS = 10000;
  const SLOT_NAMES = Object.freeze({ home: "home", quiz: "deck", summary: "summary" });
  const SCENE_FAIL_REASONS = Object.freeze(["context-lost", "slow", "error"]);
  // 这些原因是设备或环境的硬伤，同一页面生命周期内不再重试；只有用户在设置里关了再开才清掉。
  const STICKY_REASONS = Object.freeze(["no-webgl", "load-failed", "offline", "context-lost", "slow", "error"]);
  /*
   * 上下文分两段取（3.11.2 起）。第一段就是原来的严参数：有显卡的机器在这里拿到，之后的一切与改前一字不差。
   * 拿不到多半是「只有软件渲染」（没有独立显卡的 Windows、没开 3D 加速的虚拟机：failIfMajorPerformanceCaveat
   * 让浏览器拒绝给 SwiftShader / WARP 之类的上下文）。第二段只把这一条放宽、再关掉抗锯齿（软件渲染下多重采样
   * 纯吃 CPU），拿到了就以精简档 "soft" 运行。
   * 第二段也可能拿不到：Chrome 122 起默认不给 SwiftShader 的 WebGL（要 --enable-unsafe-swiftshader 才给），
   * 而 Windows 的 WARP 不受这条限制——屋主那台机器走哪条只有它自己答得出。两段都拿不到就 fail("no-webgl")，
   * 不重试、不提示、不写存储；只顺手探一次宽松参数的 WebGL 1，结果记进 status() 供诊断，不为它做场景。
   * 精简档只看这一次探测的结果，不读也不写任何存储：file:// 下 Safari 碰 localStorage 会直接抛 SecurityError。
   */
  const CONTEXT_ATTRIBUTES = Object.freeze({ alpha: true, antialias: true, depth: true, stencil: false, premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: "default", failIfMajorPerformanceCaveat: true });
  const SOFTWARE_ATTRIBUTES = Object.freeze({ ...CONTEXT_ATTRIBUTES, antialias: false, failIfMajorPerformanceCaveat: false });
  const root = document.documentElement;
  const reducedMotion = safeMatchMedia("(prefers-reduced-motion: reduce)");

  let preference = readStorage("localStorage", PREFERENCE_KEY) === "off" ? "off" : "on";
  let state = "off";
  let reason = null;
  let sticky = false;
  let controller = null;
  let probeContext = null;
  let canvas = null;
  // 当前场景跑在哪一档（high / balanced / soft），没有场景时为 null。
  let tier = null;
  // 最近一次上下文探测：三项各为 true / false / null（没试到）；stage 是走到了哪一段，还没探测过为 null。
  // software = 只拿到了软件渲染（第二段才成）；renderer 是 WEBGL_debug_renderer_info 报的渲染器名，拿不到为 null。
  let probeChain = { webgl2Strict: null, webgl2Loose: null, webgl1Loose: null };
  let stage = null;
  let software = false;
  let renderer = null;
  let latest = { name: "none", data: {} };
  // 每次拆除都递增；异步加载回来时代次对不上，说明期间已经拆过，结果直接丢弃。
  let generation = 0;
  let scheduledFor = -1;

  function safeMatchMedia(query) {
    try {
      return typeof window.matchMedia === "function" ? window.matchMedia(query) : null;
    } catch (_error) {
      return null;
    }
  }

  function readStorage(area, key) {
    try {
      return window[area].getItem(key);
    } catch (_error) {
      return null;
    }
  }

  function writeStorage(area, key, value) {
    try {
      window[area].setItem(key, value);
    } catch (_error) {
      // 隐私模式或禁用存储时只是记不住，本页面内的内存状态照常生效。
    }
  }

  function removeStorage(area, key) {
    try {
      window[area].removeItem(key);
    } catch (_error) {
      // 同 writeStorage。
    }
  }

  function positive(value) {
    return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
  }

  function blockedReason() {
    if (preference === "off") return "user-off";
    if (reducedMotion?.matches) return "reduced-motion";
    if (navigator.connection?.saveData === true) return "save-data";
    const memory = positive(navigator.deviceMemory);
    const cores = positive(navigator.hardwareConcurrency);
    if ((memory !== null && memory <= 2) || (cores !== null && cores <= 2)) return "low-end";
    if (readStorage("sessionStorage", TIER_KEY) === "off") return "slow";
    if (typeof WebGL2RenderingContext === "undefined") return "no-webgl";
    return null;
  }

  function startTier() {
    if (readStorage("sessionStorage", TIER_KEY) === "balanced") return "balanced";
    const memory = positive(navigator.deviceMemory);
    const cores = positive(navigator.hardwareConcurrency);
    if ((memory !== null && memory <= 4) || (cores !== null && cores <= 4)) return "balanced";
    return safeMatchMedia("(hover: hover) and (pointer: fine)")?.matches ? "high" : "balanced";
  }

  // 同步执行：effects.js 在 app.js 之前加载，要预留就必须赶在首次渲染前加上 fx-ready，槽位版面才不会跳。
  // 只有本机加载成功过才预留；否则等 3D 真正就绪再加（见 load），加载不成就始终不占位。
  // 判定未通过时 state 记 off（什么都没尝试过），reason 记代号给设置页显示。
  function evaluate() {
    const blocked = blockedReason();
    if (blocked) {
      root.classList.remove("fx-ready");
      state = "off";
      reason = blocked;
      return false;
    }
    root.classList.toggle("fx-ready", readStorage("localStorage", LOADED_KEY) === "1");
    state = "pending";
    reason = null;
    return true;
  }

  function wantsScene() {
    return Boolean(SLOT_NAMES[latest.name]);
  }

  function schedule() {
    if (state !== "pending" || !wantsScene() || scheduledFor === generation) return;
    const token = generation;
    scheduledFor = token;
    const run = () => {
      if (token !== generation || state !== "pending") return;
      load(token).catch(() => fail("error", token));
    };
    if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(run, { timeout: 1500 });
    else window.setTimeout(run, 400);
  }

  function withTimeout(promise, milliseconds) {
    return new Promise((resolve, reject) => {
      const timer = window.setTimeout(() => reject(new Error("timeout")), milliseconds);
      promise.then((value) => { window.clearTimeout(timer); resolve(value); }, (error) => { window.clearTimeout(timer); reject(error); });
    });
  }

  // 注入经典脚本并等它执行完。已经注入过就直接用全局对象（拆除重建时不重复下载）；
  // 注入过的 <script> 用完不删——删了不会卸载已执行的代码，只会让「已在页面上」这个判断失真。
  function loadBundle() {
    if (window[GLOBAL_NAME]) return Promise.resolve(window[GLOBAL_NAME]);
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[data-shua-fx="${GLOBAL_NAME}"]`);
      const element = existing || document.createElement("script");
      const done = () => {
        const loaded = window[GLOBAL_NAME];
        if (loaded) resolve(loaded);
        else reject(new Error("missing-global"));
      };
      element.addEventListener("load", done, { once: true });
      element.addEventListener("error", () => reject(new Error("load-failed")), { once: true });
      if (existing) return;
      element.async = false;
      element.setAttribute("data-shua-fx", GLOBAL_NAME);
      element.src = BUNDLE_URL;
      document.head.appendChild(element);
    });
  }

  // 每一段都用一块新画布：同一块画布上一次 getContext 失败之后能不能换参数重试，各浏览器说法不一。
  function tryContext(kind, attributes) {
    const surface = document.createElement("canvas");
    surface.className = "fx-canvas";
    surface.setAttribute("aria-hidden", "true");
    let context = null;
    try {
      context = surface.getContext(kind, attributes);
    } catch (_error) {
      context = null;
    }
    return context ? { surface, context } : null;
  }

  function rendererName(context) {
    try {
      const info = context.getExtension("WEBGL_debug_renderer_info");
      const name = info ? context.getParameter(info.UNMASKED_RENDERER_WEBGL) : null;
      return typeof name === "string" && name ? name : null;
    } catch (_error) {
      return null;
    }
  }

  // 严 → 宽 → （都不成时）宽松 WebGL 1 只探不用。结果写进 probeChain / stage / software / renderer，拿到的 WebGL 2 上下文交回去。
  function acquireContext() {
    probeChain = { webgl2Strict: null, webgl2Loose: null, webgl1Loose: null };
    software = false;
    renderer = null;
    const strict = tryContext("webgl2", CONTEXT_ATTRIBUTES);
    probeChain.webgl2Strict = Boolean(strict);
    if (strict) {
      stage = "strict";
      renderer = rendererName(strict.context);
      return strict;
    }
    const loose = tryContext("webgl2", SOFTWARE_ATTRIBUTES);
    probeChain.webgl2Loose = Boolean(loose);
    if (loose) {
      stage = "loose";
      software = true;
      renderer = rendererName(loose.context);
      return loose;
    }
    const legacy = tryContext("webgl", SOFTWARE_ATTRIBUTES);
    probeChain.webgl1Loose = Boolean(legacy);
    stage = legacy ? "webgl1-only" : "none";
    if (legacy) {
      renderer = rendererName(legacy.context);
      loseContext(legacy.context);
    }
    return null;
  }

  async function load(token) {
    state = "loading";
    const acquired = acquireContext();
    if (!acquired) return fail("no-webgl", token);
    const { surface, context } = acquired;
    // 用的是宽松那次拿到的上下文 → 一律精简档，完全不看内存、核数、指针，也不读 sessionStorage 里记的档位。
    // 屋主那台没显卡的 Windows（Edge + WARP）内存 32G、20 核、有鼠标，按 startTier() 会判成 high——软件渲染跑高档就是灾难。
    const startingTier = software ? "soft" : startTier();
    canvas = surface;
    probeContext = context;

    let module;
    try {
      module = await withTimeout(loadBundle(), LOAD_TIMEOUT_MS);
    } catch (_error) {
      return fail("load-failed", token);
    }
    if (token !== generation) return;
    // sw.js 离线时给按需文件回的占位模块：本机从没缓存过 3D，安静地回 2D，不调用 createFx。
    if (module?.shuaOffline === true) return fail("offline", token);
    if (typeof module?.createFx !== "function") return fail("load-failed", token);

    let created;
    try {
      created = await module.createFx({
        canvas: surface,
        context,
        tier: startingTier,
        onFail: (why) => fail(SCENE_FAIL_REASONS.includes(why) ? why : "error", token),
        // 只有高档会降到均衡档；精简档不降档，扛不住直接 fail("slow")。
        onTier: (next) => {
          if (next !== "balanced") return;
          writeStorage("sessionStorage", TIER_KEY, "balanced");
          if (token === generation) tier = "balanced";
        },
      });
    } catch (_error) {
      return fail("load-failed", token);
    }
    if (token !== generation) {
      dispose(created);
      return;
    }
    if (!created) return fail("load-failed", token);
    controller = created;
    probeContext = null;
    tier = startingTier;
    state = "active";
    // 先撑开槽位再 show：槽位 display:none 时场景量不到画布尺寸。
    root.classList.add("fx-ready");
    writeStorage("localStorage", LOADED_KEY, "1");
    replay();
    warmOfflineCache();
  }

  // 请 Service Worker 把 3D 文件补进离线缓存（清单在 sw.js 的 ON_DEMAND，这里不重复）。
  // 首次访问时页面还没被接管，要等 controllerchange 再发。
  function warmOfflineCache() {
    guard(() => {
      const worker = navigator.serviceWorker;
      if (!worker) return;
      const post = () => guard(() => worker.controller?.postMessage({ type: "shua-fx-warm" }));
      if (worker.controller) post();
      else worker.addEventListener("controllerchange", post, { once: true });
    });
  }

  function dispose(target) {
    try {
      target?.dispose?.();
    } catch (_error) {
      // 场景自己拆不干净也只能到此为止，接下来页面照样回 2D。
    }
  }

  function loseContext(context) {
    try {
      context?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch (_error) {
      // 上下文已经丢了或浏览器不给扩展，都不影响回 2D。
    }
  }

  // 所有失败与拆除的统一出口。代次递增让还在路上的加载结果作废；用户关闭记 off，其余记 failed。
  function teardown(nextState, nextReason) {
    generation += 1;
    const current = controller;
    const probe = probeContext;
    const surface = canvas;
    controller = null;
    probeContext = null;
    canvas = null;
    tier = null;
    if (current) dispose(current);
    else if (probe) loseContext(probe);
    surface?.remove();
    root.classList.remove("fx-ready");
    state = nextState;
    reason = nextReason;
  }

  function fail(why, token) {
    if (token !== generation) return;
    if (why === "slow") writeStorage("sessionStorage", TIER_KEY, "off");
    if (FORGET_REASONS.includes(why)) removeStorage("localStorage", LOADED_KEY);
    if (STICKY_REASONS.includes(why)) sticky = true;
    teardown("failed", why);
  }

  function call(method, ...args) {
    if (!controller) return;
    try {
      controller[method](...args);
    } catch (_error) {
      fail("error", generation);
    }
  }

  // 只转发最新一次页面调用：同步、不等待、不排队，场景据此直接跳到终点。
  function replay() {
    const slotName = SLOT_NAMES[latest.name];
    const slot = slotName ? document.querySelector(`[data-fx-slot="${slotName}"]`) : null;
    if (slot) call("show", latest.name, { ...latest.data, slot });
    else call("hide");
  }

  function reconsider() {
    if (sticky || preference === "off" || state === "pending" || state === "loading" || state === "active") return;
    if (evaluate()) schedule();
  }

  function onMotionChange() {
    if (reducedMotion?.matches) {
      if (state === "pending" || state === "loading" || state === "active") teardown("failed", "reduced-motion");
      return;
    }
    if (reason === "reduced-motion") reconsider();
  }

  function guard(action) {
    try {
      return action();
    } catch (_error) {
      return undefined;
    }
  }

  guard(() => {
    if (typeof reducedMotion?.addEventListener === "function") reducedMotion.addEventListener("change", onMotionChange);
    else if (typeof reducedMotion?.addListener === "function") reducedMotion.addListener(onMotionChange);
  });
  guard(evaluate);

  window.ShuaFx = Object.freeze({
    page(name, data) {
      guard(() => {
        latest = { name: SLOT_NAMES[name] ? name : "none", data: data && typeof data === "object" ? data : {} };
        if (state === "active") replay();
        else schedule();
      });
    },
    answer(data) {
      guard(() => {
        if (state === "active") call("answer", data && typeof data === "object" ? data : {});
      });
    },
    status() {
      return { preference, state, reason, tier, stage, software, renderer, probe: { ...probeChain } };
    },
    setEnabled(on) {
      guard(() => {
        if (!on) {
          preference = "off";
          writeStorage("localStorage", PREFERENCE_KEY, "off");
          sticky = false;
          teardown("off", "user-off");
          return;
        }
        preference = "on";
        writeStorage("localStorage", PREFERENCE_KEY, "on");
        sticky = false;
        reconsider();
      });
    },
  });
})();
