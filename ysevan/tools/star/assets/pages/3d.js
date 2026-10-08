/*
 * 3D与性能页（3d.html）的活样例。普通 defer 脚本（file:// 下不用 module、不用 fetch、不用动态 import），
 * 排在 star.js → kit.js 之后。每个样例一个 init 函数，互不依赖；DOM 缺了就跳过。
 *
 * 这一页自己守本章的纪律（屋主台式机 2040×1019@1.25 没显卡，那一档不能卡）：
 *  - 重的演示（WebGL 画布、模拟循环、慢放）滚到才开：Heavy.watch 用 IntersectionObserver，进视口（上下多看 120px）
 *    才建 WebGL 上下文、画一帧静态的；滚出去就停循环、WEBGL_lose_context 把上下文还给浏览器、摘掉画布。
 *  - 同一时间只跑一个：任何会连续要帧的东西（看门狗模拟、慢放、交接一遍、播时间线、拖动、自转）先 Heavy.claim，
 *    别的正在跑的会被叫停；页面藏起（visibilitychange）全部叫停。
 *  - 按需渲染：拖动、按键、换选项才画一帧（同一帧里多次输入合并成一次 rAF），静止零帧。
 *  - 演示自己的 WebGL 也走两段式：严参数先要，被拒放宽（关抗锯齿）走精简档——像素比 1、物理长边 ≤640；
 *    画布右下角的小标签写着这块画布是哪一段拿到的。两段都拿不到就停在一句说明（降级的终点）。
 *  - 减弱动效：慢放、交接一遍、播时间线、自转、阻尼都直接到终点；看门狗模拟不转纸卡，只报数。
 *  - 凡处理按键，第一行先判输入法合成态（e.isComposing || keyCode 229）。播报只走 StarShell.announce。
 *  - 只改样例自己的属性（局部 data-mode 只写在样例框上），不碰 <html>、不写 localStorage。
 *  - 单选组（role=radiogroup）的方向键由 star.js 统一处理（移动焦点并 click），这里只管 click。
 * 量具接口：window.StarThreeD = { running() 正在跑的演示名, contexts() 此刻活着的演示上下文数, views() 各画布状态 }。
 */
(function () {
  "use strict";
  var doc = document;
  var root = doc.documentElement;
  function mm(q) { try { return window.matchMedia(q); } catch (e) { return null; } }
  var mqReduce = mm("(prefers-reduced-motion: reduce)");
  function reduced() { return !!(mqReduce && mqReduce.matches); }
  function $(s, r) { return (r || doc).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function announce(t) { if (window.StarShell && window.StarShell.announce) window.StarShell.announce(t); }
  function dpr() { return Math.max(1, window.devicePixelRatio || 1); }
  function kitOpen() { var K = window.StarKit; return !!(K && K.isOpen && K.isOpen()); }
  function f1(n) { return (Math.round(n * 10) / 10).toFixed(1); }
  function f2(n) { return (Math.round(n * 100) / 100).toFixed(2); }
  function wan(px) { return px >= 1e6 ? (px / 1e4).toFixed(0) + "万" : (px / 1e4).toFixed(1) + "万"; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function composing(e) { return e.isComposing || e.keyCode === 229; }
  function hexRgb(h) { return [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255]; }
  /* 计算样式里的 rgb(…) → [0..1]×3；读不出来给纸色 */
  function cssRgb(s) {
    var m = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/.exec(s || "");
    return m ? [+m[1] / 255, +m[2] / 255, +m[3] / 255] : [0.973, 0.965, 0.945];
  }
  /* 样例框此刻是不是夜里：自己写了 data-mode 就认自己的，否则跟 <html> */
  function isDark(el) {
    var own = el && el.closest ? el.closest("[data-mode]") : null;
    return (own ? own.getAttribute("data-mode") : root.getAttribute("data-mode")) === "dark";
  }

  /* ---------- 单选组 / 开关 ---------- */
  function radios(group, onPick) {
    if (!group) return function () { return null; };
    group.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest('[role="radio"]') : null;
      if (!b || !group.contains(b) || b.getAttribute("aria-checked") === "true") return;
      $$('[role="radio"]', group).forEach(function (x) {
        var on = x === b;
        x.setAttribute("aria-checked", on ? "true" : "false");
        x.tabIndex = on ? 0 : -1;
      });
      onPick(b.getAttribute("data-v"), b);
    });
    return function () { var b = $('[role="radio"][aria-checked="true"]', group); return b ? b.getAttribute("data-v") : null; };
  }
  function toggle(btn, onChange) {
    if (!btn) return function () { return false; };
    btn.addEventListener("click", function () {
      var on = btn.getAttribute("aria-pressed") !== "true";
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      onChange(on);
    });
    return function () { return btn.getAttribute("aria-pressed") === "true"; };
  }
  function setPressed(btn, on) { if (btn) btn.setAttribute("aria-pressed", on ? "true" : "false"); }

  /* ---------- Heavy：滚到才开、滚走就停、同一时间只跑一个 ---------- */
  var Heavy = (function () {
    var cur = null;
    var list = [];
    var io = null;
    function claim(id, stop) {
      if (cur && cur.id !== id) { var prev = cur; cur = null; try { prev.stop(); } catch (e) { /* 停不下来也不拖累别的 */ } }
      cur = { id: id, stop: stop };
    }
    function release(id) { if (cur && cur.id === id) cur = null; }
    function stopAll() { if (cur) { var prev = cur; cur = null; try { prev.stop(); } catch (e) { /* 同上 */ } } }
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          list.forEach(function (w) {
            if (w.el !== en.target) return;
            if (en.isIntersecting && !w.on) { w.on = true; w.enter(); }
            else if (!en.isIntersecting && w.on) { w.on = false; w.leave(); }
          });
        });
      }, { rootMargin: "120px 0px" });
    }
    function watch(el, enter, leave) {
      var w = { el: el, enter: enter, leave: leave, on: false };
      list.push(w);
      if (io) io.observe(el); else { w.on = true; enter(); }
      return w;
    }
    doc.addEventListener("visibilitychange", function () { if (doc.hidden) stopAll(); });
    return { claim: claim, release: release, stopAll: stopAll, running: function () { return cur ? cur.id : null; }, watch: watch };
  })();

  /* ---------- 小矩阵（列主序，给 WebGL） ---------- */
  var M4 = {
    persp: function (fovy, aspect, near, far) {
      var f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
      return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
    },
    mul: function (a, b) {
      var o = new Array(16);
      for (var c = 0; c < 4; c++) for (var r = 0; r < 4; r++) {
        var s = 0;
        for (var k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
        o[c * 4 + r] = s;
      }
      return o;
    },
    chain: function () { var m = arguments[0]; for (var i = 1; i < arguments.length; i++) m = M4.mul(m, arguments[i]); return m; },
    trans: function (x, y, z) { return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]; },
    scale: function (x, y, z) { return [x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1]; },
    rotX: function (a) { var c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]; },
    rotY: function (a) { var c = Math.cos(a), s = Math.sin(a); return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]; },
    rotZ: function (a) { var c = Math.cos(a), s = Math.sin(a); return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; },
    /* 法线矩阵：模型里只有旋转、平移和正的等比缩放，取左上 3×3 就够（着色器里再归一） */
    nm: function (m) { return [m[0], m[1], m[2], m[4], m[5], m[6], m[8], m[9], m[10]]; },
    apply3: function (m, v) { return [m[0] * v[0] + m[4] * v[1] + m[8] * v[2], m[1] * v[0] + m[5] * v[1] + m[9] * v[2], m[2] * v[0] + m[6] * v[1] + m[10] * v[2]]; }
  };

  /* ---------- WebGL 小工具：两段式拿上下文、编程序、还上下文 ---------- */
  var GL = (function () {
    var STRICT = { alpha: false, antialias: true, depth: true, stencil: false, premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: "default", failIfMajorPerformanceCaveat: true };
    function loose(a) { var o = {}, k; for (k in a) o[k] = a[k]; o.antialias = false; o.failIfMajorPerformanceCaveat = false; return o; }
    /* 每一段一块新画布：同一块画布上一次 getContext 失败之后能不能换参数重试，各浏览器说法不一 */
    function attempt(kind, attrs) {
      var c = doc.createElement("canvas");
      try { var g = c.getContext(kind, attrs); return g ? { canvas: c, gl: g } : null; } catch (e) { return null; }
    }
    function rendererName(gl) {
      try {
        var x = gl.getExtension("WEBGL_debug_renderer_info");
        var n = x ? gl.getParameter(x.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
        return n ? String(n) : null;
      } catch (e) { return null; }
    }
    function lose(gl) { try { var x = gl && gl.getExtension("WEBGL_lose_context"); if (x) x.loseContext(); } catch (e) { /* 已经丢了 */ } }
    var live = 0;
    function open() {
      var r = attempt("webgl", STRICT);
      if (r) r.stage = "strict";
      else { r = attempt("webgl", loose(STRICT)); if (r) r.stage = "loose"; }
      if (!r) return null;
      r.soft = r.stage === "loose";
      live++;
      return r;
    }
    function close(r) { if (!r) return; lose(r.gl); live = Math.max(0, live - 1); }
    function shader(gl, type, src) {
      var s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        if (!gl.isContextLost() && window.console) console.warn("3d.js 着色器编不过：", gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    }
    function program(gl, vs, fs) {
      var v = shader(gl, gl.VERTEX_SHADER, vs), f = shader(gl, gl.FRAGMENT_SHADER, fs);
      if (!v || !f) return null;
      var p = gl.createProgram();
      gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
      return p;
    }
    function locs(gl, p, names) {
      var o = {};
      names.forEach(function (n) { o[n] = n.charAt(0) === "a" ? gl.getAttribLocation(p, n) : gl.getUniformLocation(p, n); });
      return o;
    }
    return { STRICT: STRICT, loose: loose, attempt: attempt, rendererName: rendererName, lose: lose, open: open, close: close, program: program, locs: locs, live: function () { return live; } };
  })();

  /* ---------- 画布宿主：进视口建上下文、出视口还回去；按宿主尺寸定缓冲 ---------- */
  var views = [];
  function glView(spec, host, opts) {
    var v = { spec: spec, host: host, ctx: null, gl: null, canvas: null, badge: null, k: null, w: 0, h: 0, cssW: 0, cssH: 0, ratio: 1, soft: false, stage: null, failed: false, name: opts.name, draws: 0 };
    var msg = $("[data-gl-msg]", host);
    var aspect = parseFloat(host.getAttribute("data-aspect")) || 0.62;
    host.style.aspectRatio = "1 / " + aspect;
    var label = host.getAttribute("aria-label") || "";
    var raf = 0;
    function size() {
      var cw = host.clientWidth, ch = host.clientHeight;
      if (!v.ctx || !cw || !ch) return false;
      var r = opts.ratio ? opts.ratio(v) : (v.soft ? 1 : Math.min(dpr(), 2));
      if (v.soft && !opts.noCap) r = Math.min(r, 640 / Math.max(cw, ch));   // 精简档：物理长边 ≤640
      var W = Math.max(1, Math.round(cw * r)), H = Math.max(1, Math.round(ch * r));
      if (v.canvas.width !== W) v.canvas.width = W;
      if (v.canvas.height !== H) v.canvas.height = H;
      v.w = W; v.h = H; v.cssW = cw; v.cssH = ch; v.ratio = r;
      if (v.badge) v.badge.textContent = (v.soft ? "宽参数 · 精简档" : "严参数拿到") + " · 像素比" + f2(r);
      return true;
    }
    function draw() { raf = 0; if (v.ctx && !v.gl.isContextLost() && size()) { v.draws++; opts.draw(v); } }
    /* 同一帧里的多次输入合并成一次绘制（按需渲染） */
    function request() { if (!raf && v.ctx) raf = window.requestAnimationFrame(draw); }
    function now() { if (raf) { window.cancelAnimationFrame(raf); raf = 0; } draw(); }
    function fail(text) {
      v.failed = true;
      msg.textContent = text;
      msg.hidden = false;
      host.setAttribute("aria-label", text);
    }
    function enter() {
      if (v.ctx || v.failed) return;
      var ctx = GL.open();
      if (!ctx) { fail("这台浏览器拿不到WebGL（严、宽两段都不给），演示停在这句说明——这正是降级的终点。"); return; }
      v.ctx = ctx; v.gl = ctx.gl; v.canvas = ctx.canvas; v.soft = ctx.soft; v.stage = ctx.stage;
      v.canvas.setAttribute("aria-hidden", "true");
      v.canvas.addEventListener("webglcontextlost", function (e) { e.preventDefault(); });
      host.insertBefore(v.canvas, host.firstChild);
      v.badge = doc.createElement("span");
      v.badge.className = "td-badge";
      v.badge.setAttribute("aria-hidden", "true");
      host.appendChild(v.badge);
      v.k = opts.setup(v);
      if (!v.k) { leave(); fail("着色器在这台浏览器上编不过，演示停在说明。"); return; }
      msg.hidden = true;
      if (label) host.setAttribute("aria-label", label);
      now();
      if (opts.entered) opts.entered(v);
    }
    function leave() {
      if (raf) { window.cancelAnimationFrame(raf); raf = 0; }
      if (opts.stop) opts.stop(v);
      if (!v.ctx) return;
      if (v.k && v.k.dispose) { try { v.k.dispose(); } catch (e) { /* 上下文可能已经丢了 */ } }
      GL.close(v.ctx);
      if (v.canvas.parentNode) v.canvas.parentNode.removeChild(v.canvas);
      if (v.badge && v.badge.parentNode) v.badge.parentNode.removeChild(v.badge);
      v.ctx = v.gl = v.canvas = v.badge = v.k = null;
      if (!v.failed) { msg.textContent = "滚走了：WebGL上下文已还给浏览器，回来再建。"; msg.hidden = false; }
    }
    v.request = request; v.now = now; v.size = size;
    Heavy.watch(spec, enter, leave);
    if (window.ResizeObserver) new ResizeObserver(function () { if (v.ctx) request(); }).observe(host);
    views.push(v);
    return v;
  }
  /* 换主题（或样例框局部切了夜里）：活着的画布各重画一帧，清屏色跟着样例框的底 */
  if (window.StarTheme && window.StarTheme.onChange) window.StarTheme.onChange(function () { views.forEach(function (v) { if (v.ctx) v.request(); }); });
  function hostBg(host) { return cssRgb(getComputedStyle(host).backgroundColor); }

  /* ---------- 纸物件：卡片长方体 + 地上一块投影；着色像水彩（d-paint 那一条） ---------- */
  function cuboid(w, h, d) {
    var hw = w / 2, hh = h / 2, hd = d / 2;
    /* 面：中心、u 轴、v 轴、法线、类型（1 正面 / 2 背面 / 0 纸边）。背面 u 取反：从背后看图案是正的 */
    var faces = [
      { c: [0, 0, hd], u: [hw, 0, 0], v: [0, hh, 0], n: [0, 0, 1], t: 1 },
      { c: [0, 0, -hd], u: [-hw, 0, 0], v: [0, hh, 0], n: [0, 0, -1], t: 2 },
      { c: [hw, 0, 0], u: [0, 0, -hd], v: [0, hh, 0], n: [1, 0, 0], t: 0 },
      { c: [-hw, 0, 0], u: [0, 0, hd], v: [0, hh, 0], n: [-1, 0, 0], t: 0 },
      { c: [0, hh, 0], u: [hw, 0, 0], v: [0, 0, -hd], n: [0, 1, 0], t: 0 },
      { c: [0, -hh, 0], u: [hw, 0, 0], v: [0, 0, hd], n: [0, -1, 0], t: 0 }
    ];
    var out = [];
    var k = [[-1, -1], [1, -1], [1, 1], [-1, -1], [1, 1], [-1, 1]];
    faces.forEach(function (f) {
      k.forEach(function (q) {
        out.push(f.c[0] + f.u[0] * q[0] + f.v[0] * q[1], f.c[1] + f.u[1] * q[0] + f.v[1] * q[1], f.c[2] + f.u[2] * q[0] + f.v[2] * q[1],
          f.n[0], f.n[1], f.n[2], (q[0] + 1) / 2, (q[1] + 1) / 2, f.t);
      });
    });
    return new Float32Array(out);
  }
  function groundQuad() {
    var out = [];
    [[-1, -1], [1, -1], [1, 1], [-1, -1], [1, 1], [-1, 1]].forEach(function (q) { out.push(q[0], 0, q[1], 0, 1, 0, (q[0] + 1) / 2, (q[1] + 1) / 2, 3); });
    return new Float32Array(out);
  }
  var VS_PAPER = [
    "attribute vec3 aPos; attribute vec3 aNor; attribute vec2 aUv; attribute float aType;",
    "uniform mat4 uMVP; uniform mat4 uModel; uniform mat3 uNM;",
    "varying vec3 vN; varying vec2 vUv; varying float vType; varying vec3 vW;",
    "void main() {",
    "  vN = uNM * aNor; vUv = aUv; vType = aType;",
    "  vW = (uModel * vec4(aPos, 1.0)).xyz;",
    "  gl_Position = uMVP * vec4(aPos, 1.0);",
    "}"
  ].join("\n");
  var FS_PAPER = [
    "#ifdef GL_FRAGMENT_PRECISION_HIGH",
    "precision highp float;",
    "#else",
    "precision mediump float;",
    "#endif",
    "varying vec3 vN; varying vec2 vUv; varying float vType; varying vec3 vW;",
    "uniform vec3 uL, uEye, uFront, uBack, uEdgeC, uInk, uRed, uBay, uShC;",
    "uniform float uMode, uSteps, uCool, uGrain, uEdge, uNight, uWash, uLines, uCheck;",
    "uniform float uFade, uFlip, uDither, uShadow, uShA;",
    "float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }",
    /* 4×4 Bayer：bayer2 是 [[0,.5],[.75,.25]]，两层叠出 0..15/16 */
    "float bayer2(vec2 a) { a = floor(a); return fract(a.x * .5 + a.y * a.y * .75); }",
    "float bayer4(vec2 a) { return bayer2(.5 * a) * .25 + bayer2(a); }",
    "float seg(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0., 1.); return length(pa - ba * h); }",
    "void main() {",
    "  vec3 night = mix(vec3(1.), vec3(.30, .33, .45), uNight);",
    /* 投影本来就是半透明的一层：不抖动，alpha 直接乘 uFade */
    "  if (uShadow > .5) {",
    "    float r = length((vUv - .5) * 2.);",
    "    float a = uMode < .5 ? uShA * (1. - smoothstep(.15, 1., r)) : .5 * (1. - smoothstep(.84, .9, r));",
    "    vec3 c = uMode < .5 ? uShC * night : vec3(0.);",
    "    gl_FragColor = vec4(c, a * uFade);",
    "    return;",
    "  }",
    "  float alpha = 1.;",
    "  if (uDither > .5) {",
    "    float th = bayer4(gl_FragCoord.xy) + 1. / 32.;",
    "    if (uFlip > .5) th = 1. - th;",
    "    if (uFade < th) discard;",
    "  } else alpha = uFade;",
    "  vec3 base = vType > 1.5 ? uBack : (vType > .5 ? uFront : uEdgeC);",
    "  if (vType > .5 && vType < 1.5) {",
    "    float w = 1. - smoothstep(.16, .34, length((vUv - vec2(.5, .66)) * vec2(1., 1.25)));",
    "    base = mix(base, uBay, w * .42 * uWash);",
    "    float l = 1. - smoothstep(.05, .12, abs(fract(vUv.y * 11.) - .5));",
    "    l *= step(.14, vUv.x) * step(vUv.x, .86) * step(.1, vUv.y) * step(vUv.y, .4);",
    "    base = mix(base, uInk, l * .38 * uLines);",
    "  }",
    "  if (vType > 1.5 && uCheck > 0.) {",
    "    float d = min(seg(vUv, vec2(.34, .5), vec2(.46, .38)), seg(vUv, vec2(.46, .38), vec2(.7, .66)));",
    "    base = mix(base, uRed, (1. - smoothstep(.022, .036, d)) * uCheck);",
    "  }",
    "  vec3 N = normalize(vN);",
    "  float d = max(dot(N, uL), 0.);",
    "  vec3 col;",
    "  if (uMode < .5) {",
    "    float l = uSteps > .5 ? (d > .6 ? 1. : (d > .25 ? .87 : .76)) : (.72 + .28 * d);",
    "    col = base * l;",
    "    if (uCool > .5) col = mix(col, col * uBay * 1.38, (1. - d) * .5);",
    "    if (uEdge > .5) { float e = min(min(vUv.x, 1. - vUv.x), min(vUv.y, 1. - vUv.y)); col *= 1. - .16 * (1. - smoothstep(0., .06, e)); }",
    "    if (uGrain > .5) col *= 1. + (hash(floor(vUv * vec2(230., 320.))) - .5) * .06;",
    "  } else {",
    "    vec3 V = normalize(uEye - vW);",
    "    vec3 H = normalize(uL + V);",
    "    col = base * (.14 + .86 * d) + vec3(.95) * pow(max(dot(N, H), 0.), 60.);",
    "  }",
    "  gl_FragColor = vec4(col * night, alpha);",
    "}"
  ].join("\n");
  var PAPER = { front: hexRgb("#FFFDFA"), back: hexRgb("#F6F5F1"), edge: hexRgb("#E4E0D6"), ink: hexRgb("#3E3C35"), red: hexRgb("#B4232C"), bay: hexRgb("#6E8A93"), sh: [74 / 255, 77 / 255, 53 / 255] };
  var CAM = { tilt: 0.2, back: 4.3, up: 0.12 };
  function paperKit(v) {
    var gl = v.gl;
    var p = GL.program(gl, VS_PAPER, FS_PAPER);
    if (!p) return null;
    var L = GL.locs(gl, p, ["aPos", "aNor", "aUv", "aType", "uMVP", "uModel", "uNM", "uL", "uEye", "uFront", "uBack", "uEdgeC", "uInk", "uRed", "uBay", "uShC",
      "uMode", "uSteps", "uCool", "uGrain", "uEdge", "uNight", "uWash", "uLines", "uCheck", "uFade", "uFlip", "uDither", "uShadow", "uShA"]);
    function mesh(arr) { var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW); return { buf: b, n: arr.length / 9 }; }
    var card = mesh(cuboid(1, 1.4, 0.035));
    var ground = mesh(groundQuad());
    function bind(m) {
      gl.bindBuffer(gl.ARRAY_BUFFER, m.buf);
      gl.enableVertexAttribArray(L.aPos); gl.vertexAttribPointer(L.aPos, 3, gl.FLOAT, false, 36, 0);
      gl.enableVertexAttribArray(L.aNor); gl.vertexAttribPointer(L.aNor, 3, gl.FLOAT, false, 36, 12);
      gl.enableVertexAttribArray(L.aUv); gl.vertexAttribPointer(L.aUv, 2, gl.FLOAT, false, 36, 24);
      gl.enableVertexAttribArray(L.aType); gl.vertexAttribPointer(L.aType, 1, gl.FLOAT, false, 36, 32);
    }
    var light = (function () { var l = [-0.35, 0.55, 0.85], n = Math.hypot(l[0], l[1], l[2]); return [l[0] / n, l[1] / n, l[2] / n]; })();
    var view = M4.mul(M4.trans(0, -CAM.up, -CAM.back), M4.rotX(CAM.tilt));
    var eye = M4.apply3(M4.rotX(-CAM.tilt), [0, CAM.up, CAM.back]);
    /* o = { bg, look:{mode,steps,cool,grain,edge,night,shadow}, blend, items:[{model,fade,flip,front,wash,lines,check}], shadows:[{model,fade}] } */
    function frame(o) {
      var lk = o.look;
      gl.viewport(0, 0, v.w, v.h);
      gl.clearColor(o.bg[0], o.bg[1], o.bg[2], 1);
      gl.clearDepth(1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(p);
      var vp = M4.mul(M4.persp(0.62, v.w / v.h, 0.1, 20), view);
      gl.uniform3fv(L.uL, light); gl.uniform3fv(L.uEye, eye);
      gl.uniform3fv(L.uBack, PAPER.back); gl.uniform3fv(L.uEdgeC, PAPER.edge); gl.uniform3fv(L.uInk, PAPER.ink);
      gl.uniform3fv(L.uRed, PAPER.red); gl.uniform3fv(L.uBay, PAPER.bay); gl.uniform3fv(L.uShC, PAPER.sh);
      gl.uniform1f(L.uMode, lk.mode === "cg" ? 1 : 0);
      gl.uniform1f(L.uSteps, lk.steps ? 1 : 0); gl.uniform1f(L.uCool, lk.cool ? 1 : 0); gl.uniform1f(L.uGrain, lk.grain ? 1 : 0);
      gl.uniform1f(L.uEdge, lk.edge ? 1 : 0); gl.uniform1f(L.uNight, lk.night ? 1 : 0);
      gl.uniform1f(L.uShA, 0.22);
      function setModel(m) {
        gl.uniformMatrix4fv(L.uMVP, false, new Float32Array(M4.mul(vp, m)));
        gl.uniformMatrix4fv(L.uModel, false, new Float32Array(m));
        gl.uniformMatrix3fv(L.uNM, false, new Float32Array(M4.nm(m)));
      }
      gl.enable(gl.DEPTH_TEST);
      /* 投影先画：半透明一层，混合、不写深度 */
      if (lk.shadow !== false) {
        gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
        bind(ground);
        gl.uniform1f(L.uShadow, 1);
        (o.shadows || []).forEach(function (s) { setModel(s.model); gl.uniform1f(L.uFade, s.fade == null ? 1 : s.fade); gl.drawArrays(gl.TRIANGLES, 0, ground.n); });
        gl.depthMask(true);
      }
      gl.uniform1f(L.uShadow, 0);
      if (o.blend) { gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); } else gl.disable(gl.BLEND);
      gl.uniform1f(L.uDither, o.blend ? 0 : 1);
      bind(card);
      o.items.forEach(function (it) {
        setModel(it.model);
        gl.uniform1f(L.uFade, it.fade == null ? 1 : it.fade);
        gl.uniform1f(L.uFlip, it.flip ? 1 : 0);
        gl.uniform3fv(L.uFront, it.front || PAPER.front);
        gl.uniform1f(L.uWash, it.wash || 0); gl.uniform1f(L.uLines, it.lines || 0); gl.uniform1f(L.uCheck, it.check || 0);
        gl.drawArrays(gl.TRIANGLES, 0, card.n);
      });
      gl.disable(gl.BLEND);
    }
    return {
      frame: frame,
      dispose: function () { gl.deleteBuffer(card.buf); gl.deleteBuffer(ground.buf); gl.deleteProgram(p); }
    };
  }
  /* 地上那块投影：x、z 处平放一块椭圆，sx / sz 是半径 */
  function shadowAt(x, z, sx, sz, yaw) { return M4.chain(M4.rotY(yaw || 0), M4.trans(x, -0.74, z), M4.scale(sx, 1, sz)); }

  /* 拖动 / 方向键转动纸物件（按需渲染：每次输入请求一帧）；拖动期间占着「正在跑」 */
  function orbit(v, st, id, onChange) {
    var host = v.host;
    var drag = null;
    host.addEventListener("pointerdown", function (e) {
      if (!v.ctx || (e.pointerType === "mouse" && e.button !== 0)) return;
      drag = { x: e.clientX, y: e.clientY, yaw: st.yaw, pitch: st.pitch, id: e.pointerId };
      try { host.setPointerCapture(e.pointerId); } catch (err) { /* 有的指针捕获不了 */ }
      Heavy.claim(id, function () { drag = null; });
    });
    host.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      st.yaw = drag.yaw + (e.clientX - drag.x) * 0.012;
      st.pitch = clamp(drag.pitch + (e.clientY - drag.y) * 0.006, -0.15, 0.55);
      v.request();
    });
    function end(e) { if (!drag || (e && e.pointerId !== drag.id)) return; drag = null; Heavy.release(id); if (onChange) onChange(); }
    host.addEventListener("pointerup", end);
    host.addEventListener("pointercancel", end);
    host.addEventListener("keydown", function (e) {
      if (composing(e)) return;
      var k = e.key;
      if (k === "ArrowLeft" || k === "ArrowRight") st.yaw += k === "ArrowLeft" ? -0.18 : 0.18;
      else if (k === "ArrowUp" || k === "ArrowDown") st.pitch = clamp(st.pitch + (k === "ArrowUp" ? -0.08 : 0.08), -0.15, 0.55);
      else return;
      e.preventDefault();
      v.request();
      if (onChange) onChange();
    });
  }

  /* ======================================================================
   * 1 叠加不替换（d-overlay）：DOM 示意页 + 请求列表；3D 那层是 CSS 3D 的纸卡叠（只动 transform）
   * ====================================================================== */
  (function initOverlay() {
    var spec = $('[data-demo="overlay"]');
    if (!spec) return;
    var page = $("[data-ov-page]", spec), slot = $("[data-ov-slot]", spec), text = $("[data-ov-text]", spec);
    var net = $("[data-ov-net]", spec), sum = $("[data-ov-sum]", spec), read = $("[data-ov-read]", spec);
    var stack = $("[data-ov-stack]", spec), tag = $("[data-ov-tag]", spec), btn = $("[data-ov-scroll]", spec);
    var NAME = { gpu: "有显卡", soft: "只有软件渲染", none: "拿不到WebGL", rm: "开了减弱动效" };
    var dev = "gpu", bad = false, timers = [], phase = "first", before = 0;
    function textTop() { return Math.round(text.getBoundingClientRect().top - page.getBoundingClientRect().top); }
    function row(name, size, is3d, isNew) {
      var li = doc.createElement("li");
      if (is3d) li.className = "is-3d";
      if (isNew && !reduced()) li.className += " is-new";
      li.innerHTML = "<code>" + esc(name) + "</code><small>" + esc(size) + "</small>";
      net.appendChild(li);
    }
    function clear() { timers.forEach(clearTimeout); timers = []; }
    function reset() {
      clear();
      phase = "first";
      net.innerHTML = "";
      row("index.html", "首屏");
      row("styles.css", "首屏");
      row("app.js", "首屏");
      row("effects.js", "判定与调度，几KB");
      sum.textContent = "3D字节：0（首屏）";
      slot.classList.remove("is-live", "is-replaced");
      stack.style.transform = "";
      btn.disabled = false;
      before = textTop();
      read.textContent = "下面那段字离示例页顶" + before + "px。";
    }
    function afterScroll() {
      phase = "scrolled";
      btn.disabled = true;
      before = textTop();   /* 「3D前」在这一刻量：开页之后窗口可能改过宽（版面跟着变），不能拿开页时的数比 */
      if (dev === "rm" || dev === "none") {
        sum.textContent = "3D字节：0——" + (dev === "rm" ? "减弱动效" : "两段都拿不到WebGL") + "，不够格，一个字节都不下";
        read.textContent = "停在静态版：海报就是完整的一格，下面那段字还在" + textTop() + "px。";
        announce("不够格：一个3D字节都不下，停在静态版");
        return;
      }
      sum.textContent = "第一次滚动了，等浏览器空闲……";
      timers.push(setTimeout(function () {
        row("effects-3d.bundle.js", "626KB（gzip 172KB）", true, true);
        sum.textContent = "3D字节：gzip 172KB（第一次滚动之后、空闲时）";
        timers.push(setTimeout(function () {
          phase = "live";
          tag.textContent = dev === "soft" ? "3D · 精简档（不跟指针）" : "3D · 完整档";
          slot.classList.add(bad ? "is-replaced" : "is-live");
          var after = textTop();
          var d = after - before;
          read.textContent = bad
            ? "反例：海报被摘掉、换成更高的画布，下面那段字从" + before + "px跳到" + after + "px（跳了" + d + "px）。"
            : "3D叠在海报上面：下面那段字" + before + "px → " + after + "px，" + (d === 0 ? "一像素没动。" : "动了" + d + "px。");
          announce(bad ? "反例：下面那段字跳了" + d + "像素" : "3D接管，下面那段字一像素没动");
        }, 520));
      }, 380));
    }
    radios($("[data-ov-dev]", spec), function (v) { dev = v; reset(); announce("这台机器：" + NAME[v] + "，从头来"); });
    toggle($("[data-ov-bad]", spec), function (on) { bad = on; reset(); });
    btn.addEventListener("click", function () { if (phase === "first") afterScroll(); });
    $("[data-ov-reset]", spec).addEventListener("click", reset);
    /* 完整档跟指针轻倾（≤6°，只在精确指针上）；精简档不跟指针 */
    slot.addEventListener("pointermove", function (e) {
      if (phase !== "live" || dev !== "gpu" || bad || e.pointerType !== "mouse") return;
      var r = slot.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      stack.style.transform = "rotateX(" + f1(8 - y * 12) + "deg) rotateY(" + f1(-14 + x * 12) + "deg)";
    });
    slot.addEventListener("pointerleave", function () { stack.style.transform = ""; });
    reset();
  })();

  /* ======================================================================
   * 2 两段式探测（d-probe）：进视口时在这台浏览器上真探一次；另三种机器是示意
   * ====================================================================== */
  (function initProbe() {
    var spec = $('[data-demo="probe"]');
    if (!spec) return;
    var flow = $("[data-pr-flow]", spec), dl = $("[data-pr-dl]", spec), star = $("[data-pr-star]", spec), runBtn = $("[data-pr-run]", spec);
    var SOFT_RE = /swiftshader|llvmpipe|lavapipe|softpipe|software|basic render/i;
    var mode = "live", last = null, ran = false;
    function probeLive() {
      var t0 = performance.now();
      var strictA = { alpha: false, antialias: true, depth: true, stencil: false, premultipliedAlpha: true, preserveDrawingBuffer: false, powerPreference: "default", failIfMajorPerformanceCaveat: true };
      var res = { strict: null, loose: null, gl1: null, renderer: null };
      var s = GL.attempt("webgl2", strictA);
      res.strict = !!s;
      var got = s;
      if (!s) { got = GL.attempt("webgl2", GL.loose(strictA)); res.loose = !!got; }
      if (got) { res.renderer = GL.rendererName(got.gl); GL.lose(got.gl); }
      else {
        var g1 = GL.attempt("webgl", GL.loose(strictA));
        res.gl1 = !!g1;
        if (g1) { res.renderer = GL.rendererName(g1.gl); GL.lose(g1.gl); }
      }
      res.ms = performance.now() - t0;
      return res;
    }
    var SIM = {
      gpu: { strict: true, loose: null, gl1: null, renderer: "（示意）Apple M5 Pro（Metal）——岗岗实测时那台的名字", ms: null },
      soft: { strict: false, loose: true, gl1: null, renderer: "（示意）ANGLE (Microsoft, Microsoft Basic Render Driver … D3D11)——屋主那台虚拟机报的", ms: null },
      none: { strict: false, loose: false, gl1: false, renderer: null, ms: null }
    };
    function pill(li, txt, tone) { var p = $("[data-st]", li); p.textContent = txt; p.setAttribute("data-tone", tone); }
    function stepState(v) { return v === true ? ["拿到了", "ok"] : v === false ? ["被拒", "bad"] : ["没试", "off"]; }
    function show(r, live) {
      var steps = { strict: $('[data-step="strict"]', flow), loose: $('[data-step="loose"]', flow), gl1: $('[data-step="gl1"]', flow), tier: $('[data-step="tier"]', flow) };
      ["strict", "loose", "gl1"].forEach(function (k) { var s = stepState(r[k]); pill(steps[k], s[0], s[1]); steps[k].classList.toggle("is-skip", r[k] === null); });
      var mem = navigator.deviceMemory, cores = navigator.hardwareConcurrency;
      var tier, why, tone;
      if (r.strict) {
        var low = live && ((mem && mem <= 4) || (cores && cores <= 4));
        tier = live ? (low ? "完整档·均衡" : "完整档·高") : "完整档";
        why = "严参数拿到：有显卡，之后一字不变；再按内存、核数起步（≤4 → 均衡）。";
        tone = "ok";
      } else if (r.loose) {
        tier = "精简档soft"; why = "严参数被拒、宽参数拿到：只有软件渲染。一律精简档，不看内存核数。"; tone = "soft";
      } else {
        tier = "静态"; why = "两段都拿不到" + (r.gl1 ? "（WebGL1倒是有，只记进诊断）" : "") + "：安静回静态，零请求、零报错。"; tone = "off";
      }
      pill(steps.tier, tier, tone);
      $("[data-pr-why]", flow).textContent = why;
      var name = r.renderer || "（没有）";
      var softName = r.renderer ? SOFT_RE.test(r.renderer) : false;
      $('[data-k="renderer"]', dl).textContent = name;
      $('[data-k="software"]', dl).textContent = (r.strict ? "否（严参数拿到）" : r.loose ? "是（只拿到宽参数）" : "无从判断") +
        (r.renderer ? "；名字" + (softName ? "命中" : "不命中") + "软件渲染正则（岗岗会据此判soft，小屋只记诊断）" : "");
      $('[data-k="hw"]', dl).textContent = live ? (mem === undefined ? "浏览器不报" : mem + "G") + " · " + (cores === undefined ? "浏览器不报" : cores + "核") : "（示意不算）";
      $('[data-k="ms"]', dl).textContent = r.ms == null ? "（示意）" : f1(r.ms) + "ms（三块临时画布，探完都已loseContext）";
      return tier;
    }
    function showStar() {
      var T = window.StarTheme;
      if (!T) { star.textContent = "本站外壳：读不到外观设置。"; return; }
      var g = T.gpu(), pref = T.blurPref(), tier = T.blur();
      var gtxt = g === true ? "有显卡" : g === false ? "没显卡" : "还没测（先按没显卡）";
      var ttxt = { full: "full（糊开）", lite: "lite（只压暗、不模糊）", off: "off（连常驻磨砂也关）" }[tier] || tier;
      star.textContent = pref === "auto"
        ? "本站外壳：显卡探测缓存star-gpu＝" + gtxt + " → 背景模糊「自动」落" + ttxt + "。外壳只探一段WebGL1严参数：它只需要知道有没有显卡。"
        : "本站外壳：背景模糊被设成「" + (pref === "on" ? "开" : "关") + "」，不看探测，现在是" + ttxt + "（显卡探测缓存：" + gtxt + "）。";
    }
    function render(user) {
      var tier;
      if (mode === "live") {
        if (!last) last = probeLive();
        tier = show(last, true);
        if (user) announce("现场探测：" + (last.strict ? "严参数拿到" : last.loose ? "严参数被拒、宽参数拿到" : "两段都拿不到") + "，落在" + tier);
      } else {
        tier = show(SIM[mode], false);
        if (user) announce("示意：落在" + tier);
      }
      runBtn.disabled = mode !== "live";
      showStar();
    }
    radios($("[data-pr-mode]", spec), function (v) { mode = v; render(true); });
    runBtn.addEventListener("click", function () { last = probeLive(); render(true); });
    if (window.StarTheme && window.StarTheme.onChange) window.StarTheme.onChange(showStar);
    /* 滚到才探：进视口第一次时跑一次（建了就还，不留上下文） */
    Heavy.watch(spec, function () { if (!ran) { ran = true; render(false); } }, function () {});
    showStar();
  })();

  /* ======================================================================
   * 3 soft 档参数（d-soft）：按口径算像素比与缓冲，2D 小画按算出来的缓冲画再拉伸
   * ====================================================================== */
  (function initSoft() {
    var spec = $('[data-demo="soft"]');
    if (!spec) return;
    var dl = $("[data-so-dl]", spec), cv = $("[data-so-cv]", spec), cap = $("[data-so-cap]", spec);
    var DEV = {
      desk: { name: "屋主台式", w: 2040, h: 1019, dpr: 1.25, gpu: false },
      laptop: { name: "屋主笔记本", w: 2552, h: 1274, dpr: 1.5, gpu: true },
      phone: { name: "屋主手机", w: 417, h: 750, dpr: 3.5, gpu: true }
    };
    var dev = "desk", who = "tools";
    function calc() {
      var d = DEV[dev];
      var o = { slot: [793, 652], slotName: "工具页展品那一格793×652", note: "" };
      if (dev === "phone") { o.slot = [377, 460]; o.slotName = who === "xw" ? "随笔球手机舞台377×460" : "示例尺寸377×460"; }
      var area = o.slot[0] * o.slot[1];
      if (who === "tools") {
        if (!d.gpu) {
          o.tier = "精简soft"; o.tone = "soft";
          o.r = Math.min(1, d.dpr, 640 / Math.max(o.slot[0], o.slot[1]));
          o.rWhy = "像素比≤1，再按物理长边≤640压";
          o.fps = "限30帧（按到期时刻跳帧）"; o.aa = "关"; o.ptr = "不跟指针、不随滚动"; o.q = "同均衡档，不另砍";
        } else if (dev === "phone") {
          o.tier = "均衡（触屏起步）"; o.tone = "accent";
          o.r = Math.min(d.dpr, 1.25); o.rWhy = "均衡档像素比≤1.25";
          o.fps = "不限（跟rAF）"; o.aa = "开"; o.ptr = "跟指针"; o.q = "关纸纹、细分4";
          o.note = "岗岗窄屏不出3D；刷刷首页牌堆要≥1180，手机上只有做题、结算两处。";
        } else {
          o.tier = "高"; o.tone = "ok";
          o.r = Math.min(d.dpr, 1.75); o.rWhy = "高档像素比≤1.75";
          o.fps = "不限（跟rAF）"; o.aa = "开"; o.ptr = "跟指针轻倾、随滚动后仰"; o.q = "全部效果";
        }
      } else {
        if (!d.gpu) {
          o.tier = "精简soft"; o.tone = "soft";
          var r0 = Math.min(d.dpr, 1.5), rc = Math.sqrt(800000 / area);
          o.r = Math.min(r0, rc); o.rWhy = "min(dpr, 1.5)＝" + f2(r0) + "，再按80万像素压到" + f2(rc) + "，两者取小";
          o.fps = "限30帧（按到期时刻，lib/frame-pacer.ts）"; o.aa = "关（无MSAA）"; o.ptr = "—"; o.q = "关纸纹、各向异性1、几何同均衡";
        } else if (dev === "phone") {
          o.tier = "手机版面（随笔球）"; o.tone = "accent";
          var rp = Math.min(d.dpr, 2), rpc = Math.sqrt(1300000 / area);
          o.r = Math.min(rp, rpc); o.rWhy = "min(dpr, 2) 与130万像素取小";
          o.fps = "限30帧（拖动中不限）"; o.aa = "开"; o.ptr = "拖动"; o.q = "什么都不砍";
          o.note = "工具页展品、走进小屋在≤900一律静态，只有随笔球有手机版面。";
        } else {
          o.tier = "高"; o.tone = "ok";
          o.r = Math.min(d.dpr, 1.75); o.rWhy = "工具页高档像素比≤1.75";
          o.fps = "不限（跟rAF）"; o.aa = "开"; o.ptr = "随滚动"; o.q = "全部效果";
        }
      }
      o.W = Math.round(o.slot[0] * o.r); o.H = Math.round(o.slot[1] * o.r);
      return o;
    }
    function drawPreview(r) {
      var cssW = cv.clientWidth || 260, cssH = cv.clientHeight || 170;
      /* 缓冲 = CSS 尺寸 × 算出来的像素比，浏览器再按你这块屏放大：比你的屏低就糊 */
      var W = Math.max(1, Math.round(cssW * r)), H = Math.max(1, Math.round(cssH * r));
      cv.width = W; cv.height = H;
      var c = cv.getContext("2d");
      c.setTransform(r, 0, 0, r, 0, 0);
      c.fillStyle = "#FDFCF9"; c.fillRect(0, 0, cssW, cssH);
      var g = c.createRadialGradient(cssW * 0.32, cssH * 0.45, 4, cssW * 0.32, cssH * 0.45, cssH * 0.42);
      g.addColorStop(0, "rgba(110,138,147,.42)"); g.addColorStop(0.75, "rgba(110,138,147,.2)"); g.addColorStop(1, "rgba(110,138,147,0)");
      c.fillStyle = g; c.fillRect(0, 0, cssW, cssH);
      c.strokeStyle = "rgba(94,97,68,.55)"; c.lineWidth = 1.4;
      c.strokeRect(cssW * 0.12, cssH * 0.3, cssW * 0.4, cssH * 0.5);
      c.strokeStyle = "#3E3C35"; c.lineWidth = 0.75;
      for (var i = 0; i < 6; i++) { c.beginPath(); c.moveTo(cssW * 0.6, cssH * (0.28 + i * 0.08)); c.lineTo(cssW * (0.9 - (i % 3) * 0.05), cssH * (0.28 + i * 0.08)); c.stroke(); }
      c.fillStyle = "#3E3C35"; c.font = "9px " + getComputedStyle(doc.body).fontFamily;
      c.fillText("留言板 · 9px的字", cssW * 0.6, cssH * 0.84);
      c.strokeStyle = "#B4232C"; c.lineWidth = 2; c.lineCap = "round"; c.lineJoin = "round";
      c.beginPath(); c.moveTo(cssW * 0.22, cssH * 0.56); c.lineTo(cssW * 0.29, cssH * 0.65); c.lineTo(cssW * 0.42, cssH * 0.44); c.stroke();
      return [W, H];
    }
    function render(user) {
      var o = calc();
      var rows = [
        ["档位", '<span class="td-pill" data-tone="' + o.tone + '">' + esc(o.tier) + "</span>"],
        ["画布", esc(o.slotName)],
        ["像素比", f2(o.r) + "（" + esc(o.rWhy) + "）"],
        ["绘制缓冲", o.W + "×" + o.H + "，约" + wan(o.W * o.H) + "像素"],
        ["帧率", esc(o.fps)],
        ["抗锯齿", esc(o.aa)],
        ["指针", esc(o.ptr)],
        ["画质", esc(o.q)]
      ];
      if (o.note) rows.push(["另外", esc(o.note)]);
      dl.innerHTML = rows.map(function (r) { return "<div><dt>" + r[0] + "</dt><dd>" + r[1] + "</dd></div>"; }).join("");
      var wh = drawPreview(o.r);
      cap.textContent = "这一块按像素比" + f2(o.r) + "画成" + wh[0] + "×" + wh[1] + "，再拉伸到同样大小（你这块屏的像素比是" + f2(dpr()) + "）。";
      if (user) announce(DEV[dev].name + "、" + (who === "tools" ? "刷刷岗岗" : "小屋") + "口径：" + o.tier + "，像素比" + f2(o.r) + "，缓冲" + o.W + "×" + o.H);
    }
    radios($("[data-so-dev]", spec), function (v) { dev = v; render(true); });
    radios($("[data-so-who]", spec), function (v) { who = v; render(true); });
    render(false);
    if (window.ResizeObserver) new ResizeObserver(function () { render(false); }).observe(cv);
  })();

  /* ======================================================================
   * 4 看门狗（d-watchdog）：模拟画布每送出一帧才转；送出率 + 相对阈值 vs 旧的中位间隔
   * ====================================================================== */
  (function initWatchdog() {
    var spec = $('[data-demo="watchdog"]');
    if (!spec) return;
    var cv = $("[data-wd-cv]", spec), runBtn = $("[data-wd-run]", spec), dl = $("[data-wd-dl]", spec), log = $("[data-wd-log]", spec), chart = $("[data-wd-chart]", spec);
    var costIn = $("[data-wd-cost]", spec), costOut = $("[data-wd-cost-out]", spec);
    var TIER = { high: "高", balanced: "均衡", soft: "精简", "static": "静态" };
    var cfg = { tier0: "high", cost: 8, stall: false, hz30: false };
    var s = null, raf = 0, running = false, history = [];
    function fresh() {
      return { tier: cfg.tier0, busyUntil: 0, nextDue: 0, nextVsync: 0, delivered: 0, t0: 0, last: 0, activeMs: 0, activeFrames: 0, ivs: [], lastShow: 0, recent: [] };
    }
    s = fresh();
    function sizeCv() {
      var r = Math.min(dpr(), 2), w = cv.clientWidth || 240, h = cv.clientHeight || 160;
      var W = Math.round(w * r), H = Math.round(h * r);
      if (cv.width !== W) cv.width = W;
      if (cv.height !== H) cv.height = H;
      return { r: r, w: w, h: h };
    }
    /* 字色、字体每帧都读会逼一次样式计算：开始时、换主题时各读一次 */
    var ink = "#1C1C1E", family = "sans-serif";
    function readStyle() { ink = getComputedStyle(spec).color; family = getComputedStyle(doc.body).fontFamily; }
    if (window.StarTheme && window.StarTheme.onChange) window.StarTheme.onChange(function () { readStyle(); if (!running) draw(0); });
    function draw(t) {
      var z = sizeCv(), c = cv.getContext("2d");
      c.setTransform(z.r, 0, 0, z.r, 0, 0);
      c.clearRect(0, 0, z.w, z.h);
      if (s.tier === "static") {
        c.fillStyle = ink; c.font = "600 13px " + family; c.textAlign = "center";
        c.fillText("已退回静态版（画布摘掉）", z.w / 2, z.h / 2 + 4);
        return;
      }
      var ang = reduced() ? -0.12 : (t / 1000) * 1.3;
      c.save();
      c.translate(z.w / 2, z.h / 2 - 6);
      c.rotate(ang);
      c.fillStyle = "#FFFDFA"; c.strokeStyle = "#D8D3C6"; c.lineWidth = 1;
      c.beginPath(); c.rect(-34, -46, 68, 92); c.fill(); c.stroke();
      c.strokeStyle = "rgba(62,60,53,.45)"; c.lineWidth = 1.6;
      for (var i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-22, -28 + i * 13); c.lineTo(i % 2 ? 12 : 22, -28 + i * 13); c.stroke(); }
      c.strokeStyle = "#B4232C"; c.lineWidth = 3; c.lineCap = "round";
      c.beginPath(); c.moveTo(-8, 26); c.lineTo(-1, 33); c.lineTo(14, 16); c.stroke();
      c.restore();
      c.fillStyle = ink; c.font = "12px " + family; c.textAlign = "left";
      var n = s.recent.length;
      c.fillText("最近一秒送出" + n + "帧", 8, z.h - 8);
    }
    function judge() {
      var n = s.activeFrames;
      var delivered = (n * 1000) / s.activeMs;
      var sorted = s.ivs.slice().sort(function (a, b) { return a - b; });
      var fastest = sorted[Math.floor(sorted.length * 0.05)] || 16.7;
      var screenFps = clamp(1000 / fastest, 30, 120);
      var capped = s.tier === "soft" ? 30 : null;
      var target = capped || screenFps;
      var ratio = capped ? 0.6 : 0.55;
      var line = target * ratio;
      var slowNew = delivered < line;
      var median = sorted[Math.floor(sorted.length / 2)] || 0;
      var oldLine = s.tier === "soft" ? 50 : 18;
      var slowOld = median > oldLine;
      var from = s.tier;
      var to = from;
      if (slowNew) to = from === "high" ? "balanced" : "static";
      var rec = { from: from, to: to, delivered: delivered, screen: screenFps, capped: capped, line: line, median: median, oldLine: oldLine, slowNew: slowNew, slowOld: slowOld };
      history.push(rec);
      if (history.length > 8) history.shift();
      var li = doc.createElement("li");
      if (slowNew) li.className = "is-down";
      li.innerHTML = "<b>" + TIER[from] + "</b>：送出" + f1(delivered) + "帧/秒；目标" + (capped ? "30（限帧）" : "≈" + Math.round(screenFps) + "Hz（第5百分位估）") +
        "×" + ratio + "＝" + f1(line) + " → " + (slowNew ? "降到" + TIER[to] : "不降") +
        "。旧判据：中位间隔" + f1(median) + "ms" + (slowOld ? "＞" : "≤") + oldLine + "ms → " + (slowOld ? "会降" : "说正常") + "。";
      log.insertBefore(li, log.firstChild);
      while (log.children.length > 5) log.removeChild(log.lastChild);
      drawChart();
      announce(TIER[from] + "：送出" + f1(delivered) + "帧，线" + f1(line) + "，" + (slowNew ? "降到" + TIER[to] : "不降") + "；旧判据" + (slowOld ? "会降" : "说正常"));
      s.activeMs = 0; s.activeFrames = 0; s.ivs = [];
      if (to !== from) {
        s.tier = to;
        $('[data-k="tier"]', dl).textContent = TIER[to] + (to === "balanced" ? "（耗时减半：像素比1.75→1.25）" : to === "static" ? "（本会话记住，下次进页面直接静态）" : "");
        s.last = 0;
        if (to === "static") { stop(); draw(performance.now()); }
      }
    }
    function drawChart() {
      var w = 100, h = 40, n = history.length, bw = w / 8;
      /* 纵轴：0 到「60 与这几窗里最大的送出率、线」再留一成 */
      var top = 60;
      history.forEach(function (r) { top = Math.max(top, r.delivered, r.line); });
      top *= 1.1;
      var out = '<svg viewBox="0 0 ' + w + " " + h + '" preserveAspectRatio="none">';
      history.forEach(function (r, i) {
        var bh = clamp(r.delivered / top, 0.02, 1) * (h - 4);
        var x = i * bw + 1.5, lh = clamp(r.line / top, 0, 1) * (h - 4);
        out += '<rect x="' + x + '" y="' + (h - bh) + '" width="' + (bw - 3) + '" height="' + bh + '" rx="1" fill="' + (r.slowNew ? "var(--orange)" : "var(--accent)") + '"/>';
        out += '<rect x="' + (x - 0.5) + '" y="' + (h - lh - 0.4) + '" width="' + (bw - 2) + '" height="0.8" fill="var(--label)"/>';
      });
      chart.innerHTML = out + "</svg>";
      chart.setAttribute("data-n", n);
    }
    /* 一拍：模拟30Hz屏 → 限30帧（soft）→ 上一帧还没「画完」（每帧耗时）→ 送出 */
    function wdFrame(t) {
      raf = 0;
      if (!running) return;
      if (!s.t0) s.t0 = t;
      var ok = true;
      if (cfg.hz30) {
        if (s.nextVsync && t < s.nextVsync - 4) ok = false;
        else s.nextVsync = s.nextVsync && t - s.nextVsync < 33.33 ? s.nextVsync + 33.33 : t + 33.33;
      }
      if (ok && s.tier === "soft") {
        if (s.nextDue && t < s.nextDue - 4) ok = false;
        else s.nextDue = s.nextDue && t - s.nextDue < 33.33 ? s.nextDue + 33.33 : t + 33.33;
      }
      if (ok && t < s.busyUntil) ok = false;
      if (ok) {
        s.delivered++;
        var cost = cfg.cost * (s.tier === "balanced" ? 0.5 : 1);
        if (cfg.stall && s.delivered % 4 === 0) cost += 120;
        s.busyUntil = t + cost - 1;
        s.recent.push(t);
        while (s.recent.length && s.recent[0] < t - 1000) s.recent.shift();
        draw(t);
        if (s.last) {
          var iv = t - s.last;
          if (iv < 200) { s.activeMs += iv; s.activeFrames++; s.ivs.push(iv); }
        }
        s.last = t;
        if (s.activeMs >= 3000) judge();
      }
      if (t - s.lastShow > 250) {
        s.lastShow = t;
        $('[data-k="now"]', dl).textContent = "攒了" + f1(s.activeMs / 1000) + "秒，最近一秒送出" + s.recent.length + "帧";
      }
      if (running) raf = window.requestAnimationFrame(wdFrame);
    }
    function start() {
      if (running) return;
      if (s.tier === "static") reset();
      running = true;
      runBtn.textContent = "停止"; setPressed(runBtn, true);
      s.last = 0; s.nextDue = 0; s.nextVsync = 0; s.busyUntil = 0;
      Heavy.claim("watchdog", stop);
      raf = window.requestAnimationFrame(wdFrame);
    }
    function stop() {
      running = false;
      if (raf) { window.cancelAnimationFrame(raf); raf = 0; }
      runBtn.textContent = "开始"; setPressed(runBtn, false);
      Heavy.release("watchdog");
    }
    function reset() {
      stop();
      s = fresh(); history = [];
      log.innerHTML = ""; chart.innerHTML = '<span class="td-wd-empty">每攒够3秒一根柱，横线是那一窗的线</span>';
      $('[data-k="tier"]', dl).textContent = TIER[s.tier];
      $('[data-k="now"]', dl).textContent = "还没开始";
      draw(0);
    }
    radios($("[data-wd-tier]", spec), function (v) { cfg.tier0 = v; reset(); });
    costIn.addEventListener("input", function () { cfg.cost = +costIn.value; costOut.textContent = cfg.cost + "ms"; });
    toggle($("[data-wd-stall]", spec), function (on) { cfg.stall = on; });
    toggle($("[data-wd-30]", spec), function (on) { cfg.hz30 = on; s.nextVsync = 0; });
    runBtn.addEventListener("click", function () { if (running) stop(); else start(); });
    $("[data-wd-reset]", spec).addEventListener("click", reset);
    Heavy.watch(spec, function () { readStyle(); draw(0); }, stop);
    readStyle();
    reset();
  })();

  /* ======================================================================
   * 5 限帧按到期时刻（d-cap）：同一串 rAF 时间戳交给三种限帧器
   * ====================================================================== */
  (function initCap() {
    var spec = $('[data-demo="cap"]');
    if (!spec) return;
    var rows = $("[data-cp-rows]", spec), playBtn = $("[data-cp-play]", spec);
    var I = 1000 / 30;
    var cfg = { hz: 45, jit: false, stall: false };
    var LIM = [
      { id: "interval", name: "按间隔", sub: "离上一帧≥29ms才画（小屋四处2026-10-09以前）" },
      { id: "debt", name: "按到期时刻·累积欠账", sub: "画了就next += 33.3，从不重排" },
      { id: "due", name: "按到期时刻·不累积", sub: "落后超过一个间隔就从当下重排（刷刷、岗岗，小屋2026-10-09起）" }
    ];
    var sim = null, raf = 0, t0 = 0;
    function rnd(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
    function ticks() {
      var r = rnd(7), dt = 1000 / cfg.hz, out = [], t = 0, stalled = false;
      out.stallAt = -1;
      while (t < 3000) {
        out.push(t);
        var step = dt + (cfg.jit ? r() * 6 - 3 : 0);
        if (cfg.stall && !stalled && t >= 300) { out.stallAt = t + dt; step += 200; stalled = true; }
        t += step;
      }
      return out;
    }
    function run(id, ts) {
      var out = [], last = -1e9, next = 0;
      ts.forEach(function (t) {
        if (id === "interval") { if (t - last >= 29) { out.push(t); last = t; } return; }
        if (next && t < next - 4) return;
        out.push(t);
        if (id === "debt") next = next ? next + I : t + I;
        else next = next && t - next < I ? next + I : t + I;
      });
      return out;
    }
    function build() {
      var ts = ticks();
      sim = { ts: ts, res: {} };
      var best = null;
      LIM.forEach(function (l) {
        var d = run(l.id, ts);
        var minGap = Infinity;
        for (var i = 1; i < d.length; i++) minGap = Math.min(minGap, d[i] - d[i - 1]);
        sim.res[l.id] = { draws: d, fps: d.length / 3, minGap: minGap };
      });
      rows.innerHTML = LIM.map(function (l) {
        var r = sim.res[l.id];
        var svg = '<svg viewBox="0 0 1000 38" preserveAspectRatio="none" aria-hidden="true">';
        if (ts.stallAt >= 0) svg += '<rect x="' + Math.round(ts.stallAt) + '" y="0" width="200" height="38" fill="var(--orange-tint)"/>';
        ts.forEach(function (t) { if (t < 1000) svg += '<rect x="' + (t - 0.6).toFixed(1) + '" y="22" width="1.2" height="14" fill="var(--label3)"/>'; });
        r.draws.forEach(function (t) { if (t < 1000) svg += '<rect x="' + (t - 2).toFixed(1) + '" y="6" width="4" height="30" rx="1" fill="var(--accent)"/>'; });
        svg += "</svg>";
        return '<div class="td-cp-row" data-row="' + l.id + '"><div><b>' + l.name + "</b><small>" + l.sub + '</small></div><div class="td-cp-strip">' + svg + '<span class="td-cp-dot"></span></div>' +
          '<div class="td-cp-fps">' + f1(r.fps) + "<small>帧/秒</small><small>最短" + Math.round(r.minGap) + "ms</small></div></div>";
      }).join("");
      var top = Math.max(sim.res.interval.fps, sim.res.debt.fps, sim.res.due.fps);
      $('[data-row="due"]', rows).classList.toggle("is-best", sim.res.due.fps >= top - 0.4);
      return sim;
    }
    function summary() {
      return "rAF " + cfg.hz + "拍" + (cfg.stall ? "、插一次200ms卡顿" : "") + "：按间隔" + f1(sim.res.interval.fps) + "帧，累积欠账" + f1(sim.res.debt.fps) + "帧（最短间隔" + Math.round(sim.res.debt.minGap) + "ms），到期不累积" + f1(sim.res.due.fps) + "帧";
    }
    function stopPlay() {
      if (raf) { window.cancelAnimationFrame(raf); raf = 0; }
      $$(".td-cp-strip", rows).forEach(function (s) { s.classList.remove("is-playing"); });
      Heavy.release("cap");
    }
    function cpFrame(now) {
      raf = 0;
      var p = (now - t0) / 3000;           /* 慢放三倍：3 秒走完 1 秒 */
      var ms = Math.min(1000, p * 1000);
      LIM.forEach(function (l) {
        var d = sim.res[l.id].draws, x = 0;
        for (var i = 0; i < d.length && d[i] <= ms; i++) x = d[i];
        var dot = $('[data-row="' + l.id + '"] .td-cp-dot', rows);
        if (dot) dot.style.transform = "translateX(" + (x / 1000 * dot.parentNode.clientWidth).toFixed(1) + "px)";
      });
      if (p < 1) raf = window.requestAnimationFrame(cpFrame);
      else { Heavy.release("cap"); }
    }
    function play() {
      if (reduced()) { announce("减弱动效：不慢放。" + summary()); return; }
      stopPlay();
      $$(".td-cp-strip", rows).forEach(function (s) { s.classList.add("is-playing"); });
      Heavy.claim("cap", stopPlay);
      t0 = performance.now();
      raf = window.requestAnimationFrame(cpFrame);
    }
    radios($("[data-cp-hz]", spec), function (v) { cfg.hz = +v; stopPlay(); build(); announce(summary()); });
    toggle($("[data-cp-jit]", spec), function (on) { cfg.jit = on; stopPlay(); build(); announce(summary()); });
    toggle($("[data-cp-stall]", spec), function (on) { cfg.stall = on; stopPlay(); build(); announce(summary()); });
    playBtn.addEventListener("click", play);
    Heavy.watch(spec, function () {}, stopPlay);
    build();
  })();

  var odProbe = null;
  /* ======================================================================
   * 6 按需渲染（d-ondemand）：纸卡 140ms 阻尼朝指针倾；三道闸是真的
   * ====================================================================== */
  (function initOnDemand() {
    var spec = $('[data-demo="ondemand"]');
    if (!spec) return;
    var stage = $("[data-od-stage]", spec), cv = $("[data-od-cv]", spec), dl = $("[data-od-dl]", spec), gates = $("[data-od-gates]", spec);
    var sheetBtn = $("[data-od-sheet]", spec);
    var st = { tx: 0, ty: 0, cx: 0, cy: 0, ang: 0 };
    var spin = false, bad = false, visible = false, raf = 0, last = 0, calls = 0, drawn = [], idleTimer = 0, sheet = null;
    function gatesOpen() { return visible && !doc.hidden && !kitOpen(); }
    function moving() { return Math.abs(st.tx - st.cx) > 0.0015 || Math.abs(st.ty - st.cy) > 0.0015; }
    function wants() { return gatesOpen() && (bad || (spin && !reduced()) || moving()); }
    var gateKey = "";
    function showGates() {
      var g = { vis: visible, page: !doc.hidden, kit: !kitOpen() };
      var key = [g.vis, g.page, g.kit].join();
      if (key === gateKey) return;      /* 没变不写 DOM（pointermove 每次都会走到这里） */
      gateKey = key;
      Object.keys(g).forEach(function (k) {
        var p = $('[data-g="' + k + '"] [data-st]', gates);
        p.setAttribute("data-tone", g[k] ? "ok" : "bad");
        p.textContent = { vis: g.vis ? "看得见" : "滚出视口", page: g.page ? "页面可见" : "页面藏起", kit: g.kit ? "没弹层" : "弹层开着" }[k];
      });
    }
    function readout(state) {
      var now = performance.now();
      while (drawn.length && drawn[0] < now - 1000) drawn.shift();
      $('[data-k="fps"]', dl).textContent = drawn.length + "帧";
      $('[data-k="total"]', dl).textContent = calls + "次";
      if (state) $('[data-k="state"]', dl).textContent = state;
    }
    function draw() {
      var r = Math.min(dpr(), 2), w = cv.clientWidth || 280, h = cv.clientHeight || 180;
      var W = Math.round(w * r), H = Math.round(h * r);
      if (cv.width !== W) cv.width = W;
      if (cv.height !== H) cv.height = H;
      var c = cv.getContext("2d");
      c.setTransform(r, 0, 0, r, 0, 0);
      c.clearRect(0, 0, w, h);
      /* 纸卡四个角做一次 3D 旋转 + 透视，画成四边形（只为看得出倾斜，不求精确） */
      var ry = st.cx * 0.5 + st.ang, rx = -st.cy * 0.4, f = 420;
      var cosY = Math.cos(ry), sinY = Math.sin(ry), cosX = Math.cos(rx), sinX = Math.sin(rx);
      var pts = [[-52, -62], [52, -62], [52, 62], [-52, 62]].map(function (p) {
        var x = p[0] * cosY, z = -p[0] * sinY;
        var y = p[1] * cosX - z * sinX; z = p[1] * sinX + z * cosX;
        var k = f / (f + z);
        return [w / 2 + x * k, h / 2 - 4 + y * k];
      });
      c.fillStyle = "rgba(74,77,53,.18)";
      c.beginPath(); c.ellipse(w / 2, h / 2 + 70, 60 * Math.abs(cosY) + 14, 7, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); pts.forEach(function (p, i) { if (i) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]); }); c.closePath();
      var front = cosY >= 0;
      c.fillStyle = front ? "#FFFDFA" : "#F1EFEA"; c.fill();
      c.strokeStyle = "#D8D3C6"; c.lineWidth = 1; c.stroke();
      if (front) {
        c.strokeStyle = "rgba(62,60,53,.4)"; c.lineWidth = 1.4;
        for (var i = 0; i < 4; i++) {
          var a = 0.22, b = 0.78, v = 0.22 + i * 0.13;
          var p0 = lerp2(lerp2(pts[0], pts[3], v), lerp2(pts[1], pts[2], v), a), p1 = lerp2(lerp2(pts[0], pts[3], v), lerp2(pts[1], pts[2], v), i % 2 ? b - 0.18 : b);
          c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); c.stroke();
        }
      }
    }
    function lerp2(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; }
    /* 回调名 odFrame：量具按名字数 rAF 次数（静止、滚走、藏起、弹层开着时必须是0） */
    function odFrame(now) {
      raf = 0;
      calls++;
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      if (reduced()) { st.cx = st.tx; st.cy = st.ty; }
      else {
        var k = 1 - Math.exp(-dt * 1000 / 140);    /* 140ms 指数阻尼（岗岗手册、小屋同一手感） */
        st.cx += (st.tx - st.cx) * k; st.cy += (st.ty - st.cy) * k;
        if (Math.abs(st.tx - st.cx) < 0.0015) st.cx = st.tx;
        if (Math.abs(st.ty - st.cy) < 0.0015) st.cy = st.ty;
        if (spin) st.ang += dt * 0.9;
      }
      draw();
      drawn.push(now);
      if (wants()) { raf = window.requestAnimationFrame(odFrame); readout(bad ? "反例：一直在要帧" : spin ? "自转：一直在动" : "阻尼没收敛：在动"); }
      else { last = 0; Heavy.release("ondemand"); readout(gatesOpen() ? "静止·零帧" : "闸关着·零帧"); settleSoon(); }
    }
    /* 停下来以后「这一秒画了几帧」要回到0：只在停下那一刻排一次，不常驻计时器 */
    function settleSoon() { clearTimeout(idleTimer); idleTimer = setTimeout(function () { if (!raf) readout(); }, 1050); }
    /* 别的演示把「正在跑」拿走、或页面藏起时：只暂停（取消这一帧），开关状态留着；
       回到可见 / 进视口这类被动事件只在没有别人在跑时才接着跑，不抢；用户自己动它才抢过来 */
    function pause() { if (raf) { window.cancelAnimationFrame(raf); raf = 0; } last = 0; readout("被叫停·零帧"); settleSoon(); }
    function kick(user) {
      showGates();
      if (raf || !wants()) { if (!raf) readout(gatesOpen() ? "静止·零帧" : "闸关着·零帧"); return; }
      var other = Heavy.running();
      if (!user && other && other !== "ondemand") { readout("别的演示在跑·零帧"); return; }
      Heavy.claim("ondemand", pause);
      last = 0;
      raf = window.requestAnimationFrame(odFrame);
    }
    stage.addEventListener("pointermove", function (e) {
      var r = cv.getBoundingClientRect();
      st.tx = clamp(((e.clientX - r.left) / r.width - 0.5) * 2, -1, 1);
      st.ty = clamp(((e.clientY - r.top) / r.height - 0.5) * 2, -1, 1);
      kick(true);
    });
    stage.addEventListener("pointerleave", function () { st.tx = 0; st.ty = 0; kick(true); });
    stage.addEventListener("keydown", function (e) {
      if (composing(e)) return;
      var k = e.key;
      if (k === "ArrowLeft") st.tx = clamp(st.tx - 0.5, -1, 1);
      else if (k === "ArrowRight") st.tx = clamp(st.tx + 0.5, -1, 1);
      else if (k === "ArrowUp") st.ty = clamp(st.ty - 0.5, -1, 1);
      else if (k === "ArrowDown") st.ty = clamp(st.ty + 0.5, -1, 1);
      else if (k === "Home") { st.tx = 0; st.ty = 0; }
      else return;
      e.preventDefault();
      kick(true);
    });
    toggle($("[data-od-spin]", spec), function (on) { spin = on; if (on && reduced()) announce("减弱动效：不自转"); kick(true); });
    toggle($("[data-od-bad]", spec), function (on) { bad = on; kick(true); });
    sheetBtn.addEventListener("click", function () {
      var K = window.StarKit;
      if (!K || !K.sheet) { announce("弹层套件没读到"); return; }
      if (!sheet) {
        sheet = K.sheet({
          title: "弹层开着",
          build: function (body) {
            body.innerHTML = "<p>弹层开着时，后面那张纸卡的循环一次都不跑：<code>running()</code> 第三道闸 <code>!kitOpen()</code> 关着。</p><p>关掉弹层，回去看「rAF累计」从这一刻起有没有涨。</p>";
          },
          onOpen: function () { showGates(); readout(); },
          onClosed: function () { kick(false); }
        });
      }
      sheet.open(sheetBtn);
      setTimeout(function () { showGates(); readout(gatesOpen() ? null : "闸关着·零帧"); }, 0);
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (list) {
        list.forEach(function (en) { visible = en.isIntersecting; kick(false); });
      }).observe(stage);
    } else { visible = true; }
    doc.addEventListener("visibilitychange", function () { kick(false); });
    draw();
    showGates();
    readout("静止·零帧");
    odProbe = { calls: function () { return calls; }, running: function () { return !!raf; } };
  })();

  /* ======================================================================
   * 7 打包纪律（d-bundle）：三处写法各换一种，看打包结果与门禁
   * ====================================================================== */
  (function initBundle() {
    var spec = $('[data-demo="bundle"]');
    if (!spec) return;
    var code = $("[data-bd-code]", spec), bars = $("[data-bd-bars]", spec), checks = $("[data-bd-checks]", spec);
    var st = { ssr: "guard", imp: "named", lic: "legal" };
    var SSR = {
      guard: { code: 'const loadScene = import.meta.env.SSR ? null : () => import("./scene");', kib: 11, label: "+11KiB（只有守卫本身）", leak: false },
      "var": { code: 'const env = import.meta.env;\nconst loadScene = env.SSR ? null : () => import("./scene");', kib: 622, label: "+622KiB（three、gsap又打了一份）", leak: true },
      effect: { code: 'useEffect(() => { import("./scene").then(start); }, []);', kib: 690, label: "+660–690KiB", leak: true },
      dynamic: { code: 'const Scene = dynamic(() => import("./scene"), { ssr: false });', kib: 690, label: "+660–690KiB", leak: true }
    };
    var IMP = { named: 'import { WebGLRenderer, PerspectiveCamera, Mesh } from "three";', star: 'import * as THREE from "three";' };
    var LIC = { legal: "comments: { legal: true, annotation: false, jsdoc: false }", "default": "// 默认压缩：/*! @license … */ 被删掉" };
    var OK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.6 4.4 4.4L19 7.4"/></svg>';
    var NO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6.6 6.6 10.8 10.8M17.4 6.6 6.6 17.4"/></svg>';
    function bar(name, frac, label, bad) {
      return '<div class="td-bar"><span>' + name + '</span><span class="td-bar-track"><span class="td-bar-fill" data-tone="' + (bad ? "bad" : "ok") + '" style="transform:scaleX(' + clamp(frac, 0.015, 1).toFixed(3) + ')"></span></span><b>' + label + "</b></div>";
    }
    function check(ok, txt) { return '<li class="' + (ok ? "" : "is-bad") + '">' + (ok ? OK : NO) + "<span>" + txt + "</span></li>"; }
    function render(user) {
      var s = SSR[st.ssr];
      code.textContent = "// 场景怎么引进来\n" + s.code + "\n\n// scene/ 里\n" + IMP[st.imp] + "\n\n// vite.config.ts → build.rolldownOptions.output\n" + LIC[st.lic];
      bars.innerHTML =
        bar("服务端包多出", s.kib / 700, s.label, s.leak) +
        bar("多余的three", st.imp === "star" ? 48 / 60 : 0, st.imp === "star" ? "约48KB（整包）" : "0（逐符号子集）", st.imp === "star") +
        bar("每页首屏多出", st.lic === "legal" ? 825 / 2000 : 0, st.lic === "legal" ? "约825字节gzip（许可头）" : "0", false);
      var nBad = (s.leak ? 2 : 0) + (st.imp === "star" ? 1 : 0) + (st.lic === "default" ? 1 : 0);
      checks.innerHTML =
        check(!s.leak, "dist/server里搜不到WebGLRenderer、ScrollTrigger") +
        check(st.ssr === "guard", "runtime:check认得出原样那一行") +
        check(st.imp === "named", "没有import * as THREE；只有scene/能import three") +
        check(st.lic === "legal", "3D包里GSAP与three两份许可注释都在" + (st.lic === "legal" ? "" : "（GSAP许可证禁止删）"));
      if (user) announce(nBad ? "门禁红" + nBad + "条" : "门禁全绿");
    }
    $$("[data-bd]", spec).forEach(function (g) {
      radios(g, function (v) { st[g.getAttribute("data-bd")] = v; render(true); });
    });
    render(false);
  })();

  /* ======================================================================
   * 8 各家3D一览（d-roster）
   * ====================================================================== */
  (function initRoster() {
    var spec = $('[data-demo="roster"]');
    if (!spec) return;
    var list = $("[data-ro-list]", spec), note = $("[data-ro-note]", spec);
    var DEV = { gpu: "有显卡", soft: "屋主台式（只有软件渲染）", none: "拿不到WebGL", phone: "屋主手机417" };
    var RO = [
      { id: "shua", name: "刷刷 · 纸闪卡", what: "首页牌堆、做题小牌堆、结算落堆", src: "tools/shua/design-proposal.md:259、:280–282、:290",
        st: { gpu: ["ok", "完整档"], soft: ["soft", "精简档"], none: ["off", "原来的2D"], phone: ["accent", "均衡档"] },
        why: { gpu: "严参数拿到WebGL2，按内存、核数起步：高档像素比≤1.75，均衡≤1.25。", soft: "严参数被拒、宽参数拿到：精简档，像素比≤1、长边≤640、限30帧、不跟指针不随滚动。", none: "两段都拿不到：三个槽位不占位，界面和今天逐像素相同。", phone: "触屏起步就是均衡档（像素比≤1.25、关纸纹）；首页牌堆要视口≥1180才出，手机上只有做题、结算两处。" } },
      { id: "gang", name: "岗岗 · 案头手册", what: "宽屏右栏末尾一本摊开的书", src: "tools/gang/design-proposal.md:410、:441、:445、:467；memory/ship-staged-not-perfect.md:8",
        st: { gpu: ["ok", "完整档"], soft: ["soft", "精简档"], none: ["off", "不出现"], phone: ["off", "不出"] },
        why: { gpu: "严参数拿到：内存或核数≤4走均衡，其余高档。", soft: "判出软件渲染一律soft，不看内存核数：像素比1、长边≤640、限30帧、关抗锯齿、不跟鼠标。", none: "两段都拿不到：安静回静态，状态记webgl2-unavailable，控制台一个字都不打。", phone: "窗口≤1120不出（右栏不是常驻栏）；手机3D屋主嫌代价大：「岗可以不管」。" } },
      { id: "plan", name: "plan · 台历", what: "侧栏空白处的纸台历、甘特板落位、纸条飞进台历", src: "tools/plan/docs/3d-decor-proposal.md:14、:36、:40、:46；控制室10-08定（软件渲染照四家样板）",
        st: { gpu: ["ok", "完整档"], soft: ["off", "不出（正在对齐）"], none: ["off", "不出"], phone: ["off", "不出"] },
        why: { gpu: "WebGL2严参数拿到就出。", soft: "现状仍是「只有软件渲染就不出」。已定（控制室10-08定）：照四家样板，严参数被拒就走精简档，两段都拿不到才不出；plan正在对齐。", none: "不下载3D代码，侧栏和改版前逐字相同。", phone: "视口≤900不出：这一档侧栏改成顶栏，本来就没有那块空白。" } },
      { id: "card", name: "card · 卡集", what: "画廊Cover Flow（纯CSS 3D）；单卡查看器（three）", src: "tools/card/CLAUDE.md:160、:193、:194；tools/card/collection/shared/viewer.js:189、:220（card 537d878，2026-10-08）",
        st: { gpu: ["ok", "画廊＋查看器3D"], soft: ["soft", "画廊照常·查看器省力档"], none: ["off", "画廊照常·查看器原图"], phone: ["accent", "玻璃列表·查看器3D"] },
        why: { gpu: "画廊不靠WebGL；查看器严参数拿到、渲染器名不是软件渲染就走满档，画面和改前逐像素相同。", soft: "查看器两段（2026-10-08起）：严参数被拒、或渲染器名是软件渲染，就关抗锯齿走省力档；像素比不压，画不许为性能牺牲（2040×1019@1.25帧耗时约40→19ms）。", none: "两段都拿不到：查看器安静回原图，不下载three、控制台不报错。", phone: "选卡台只在视口＞600出现，≤600是玻璃列表；查看器照常。" } },
      { id: "shelf", name: "小屋 · 工具页展品", what: "/projects右栏四件纸物件，three＋GSAP（ScrollTrigger）", src: "Ysevan_web/docs/xiaowu-ui-spec.md「6.9.5 分档与降级」（「视口 ≤900px」「只拿到宽松那一段」「工具页展品」）",
        st: { gpu: ["ok", "完整档"], soft: ["soft", "精简档"], none: ["off", "静态海报"], phone: ["off", "静态"] },
        why: { gpu: "严参数拿到：按内存、核数、精确指针起步。", soft: "精简档：min(dpr, 1.5)与80万像素取小、限30帧、关纸纹。", none: "静态版：日程安排三张界面图，刷刷、岗岗、card三张海报（3D终态那一帧）。", phone: "视口≤900一律静态，连3D包都不下。" } },
      { id: "walk", name: "小屋 · 走进小屋", what: "门厅第一次往下滚，5秒走进两幅画围成的墙角", src: "Ysevan_web/docs/xiaowu-ui-spec.md「4.9.3 什么时候有跑道（分档与降级）」、「6.9.5 分档与降级」（「走进小屋」）",
        st: { gpu: ["ok", "完整档"], soft: ["soft", "精简档"], none: ["off", "一屏名片"], phone: ["off", "静态"] },
        why: { gpu: "严参数拿到：标上跑道，第一次滚动起播。", soft: "精简档：走动60万像素、停稳后重画一帧325万（见本页「停稳重画」）。", none: "没有跑道：门厅就是今天那一屏名片。", phone: "视口≤900不标跑道。" } },
      { id: "globe", name: "小屋 · 随笔球", what: "/notes/globe，随笔排在球面上慢慢转", src: "Ysevan_web/docs/xiaowu-ui-spec.md「6.9.5 分档与降级」（「随笔球·手机版面」）、「7.5.5 分档与降级」（「网格」）",
        st: { gpu: ["ok", "完整档"], soft: ["soft", "精简档"], none: ["off", "卡片网格"], phone: ["ok", "手机版面"] },
        why: { gpu: "严参数拿到：高档像素比≤1.75。", soft: "精简档：min(dpr, 1.5)与100万像素取小、限30帧。", none: "两段都拿不到：普通卡片网格，内容一张不少。", phone: "2026-09-23起有手机版面：像素比min(dpr, 2)与130万取小，自转限30帧、拖动不限。" } },
      { id: "plate", name: "小屋 · 画内景深", what: "门厅与两处门面画上的视差，手写WebGL约3.4KB", src: "Ysevan_web/docs/xiaowu-ui-spec.md「4.6.1 视差层只在真显卡上挂」（「做不好就别做」「不挂之后走的是已经上线的那条路」）",
        st: { gpu: ["ok", "挂上"], soft: ["off", "不挂"], none: ["off", "不挂"], phone: ["off", "不挂"] },
        why: { gpu: "严参数拿到才挂画布。", soft: "只要严参数、不做第二段：「做不好就别做」——它盖在一张已经好看的图上，软件渲染只会把画变差。", none: "不挂，就是那张图。", phone: "触摸屏上这一层本来就不挂。" } },
      { id: "float", name: "小屋 · 漂浮层", what: "卡片后十几片从画里取下的叶子，手写WebGL", src: "Ysevan_web/docs/xiaowu-ui-spec.md「4.8.4 触发与降级」（「拿到宽松那一遍」）、「6.9.5 分档与降级」（「三页漂浮层」）",
        st: { gpu: ["ok", "完整档"], soft: ["soft", "精简档"], none: ["off", "不挂"], phone: ["off", "不挂"] },
        why: { gpu: "第一次动鼠标之后，空闲时探WebGL再下载。", soft: "精简档：min(dpr, 1.5)、60万像素、限30帧、片数减半；至今没有看门狗。", none: "严、宽两遍都拿不到：今天的这一页。", phone: "触摸屏、没有精确指针就不挂。" } }
    ];
    var dev = "gpu", sel = null;
    function render(user) {
      list.innerHTML = RO.map(function (r) {
        var s = r.st[dev];
        return '<li><button type="button" class="td-ro-row" data-ro="' + r.id + '" aria-pressed="' + (sel === r.id ? "true" : "false") + '"><b>' + esc(r.name) + "</b><small>" + esc(r.what) +
          '</small><span class="td-pill" data-tone="' + s[0] + '">' + esc(s[1]) + "</span></button></li>";
      }).join("");
      showNote();
      if (user) {
        var c = { ok: 0, soft: 0, other: 0 };
        RO.forEach(function (r) { var t = r.st[dev][0]; if (t === "ok") c.ok++; else if (t === "soft") c.soft++; else c.other++; });
        announce(DEV[dev] + "：完整" + c.ok + "处、精简" + c.soft + "处、其余" + c.other + "处");
      }
    }
    function showNote() {
      var r = null;
      RO.forEach(function (x) { if (x.id === sel) r = x; });
      if (!r) { note.innerHTML = "点一行看依据。"; return; }
      note.innerHTML = "<b>" + esc(r.name) + " · " + esc(DEV[dev]) + "</b>：" + esc(r.why[dev]) + "<small>出处：" + esc(r.src) + "</small>";
    }
    list.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("[data-ro]") : null;
      if (!b) return;
      var id = b.getAttribute("data-ro");
      sel = sel === id ? null : id;
      $$("[data-ro]", list).forEach(function (x) { x.setAttribute("aria-pressed", x.getAttribute("data-ro") === sel ? "true" : "false"); });
      showNote();
      if (sel) announce(note.textContent);
    });
    radios($("[data-ro-dev]", spec), function (v) { dev = v; render(true); });
    render(false);
  })();

  /* ======================================================================
   * 9 像水彩不像 CG（d-paint）
   * ====================================================================== */
  (function initPaint() {
    var spec = $('[data-demo="paint"]');
    if (!spec) return;
    var host = $("[data-gl-host]", spec);
    var look = { mode: "wc", steps: true, cool: true, grain: true, edge: true, shadow: true, night: isDark(spec) };
    var st = { yaw: -0.55, pitch: 0.12 };
    var v = glView(spec, host, {
      name: "paint",
      setup: paperKit,
      draw: function (v) {
        var base = M4.mul(M4.rotX(st.pitch), M4.rotY(st.yaw));
        var cg = look.mode === "cg";
        v.k.frame({
          bg: hostBg(host),
          look: { mode: look.mode, steps: !cg && look.steps, cool: !cg && look.cool, grain: !cg && look.grain, edge: !cg && look.edge, night: look.night, shadow: cg || look.shadow },
          items: [
            { model: M4.chain(base, M4.trans(0.22, 0.02, -0.26), M4.rotY(0.2), M4.rotZ(-0.07)), front: PAPER.back, lines: 1 },
            { model: M4.chain(base, M4.trans(-0.14, -0.02, 0.1), M4.rotZ(0.05)), wash: 1, lines: 1, check: 1 }
          ],
          shadows: [{ model: M4.mul(M4.rotX(st.pitch), shadowAt(0.04, -0.06, 0.95, 0.42, st.yaw)) }]
        });
      }
    });
    orbit(v, st, "paint");
    radios($("[data-pa-mode]", spec), function (m) {
      look.mode = m;
      $$("[data-pa]", spec).forEach(function (b) { if (b.getAttribute("data-pa") !== "night") b.disabled = m === "cg"; });
      v.request();
      announce(m === "cg" ? "CG画法：平滑漫反射、镜面高光、硬黑投影" : "水彩画法");
    });
    $$("[data-pa]", spec).forEach(function (b) {
      var key = b.getAttribute("data-pa");
      if (key === "night") setPressed(b, look.night);
      toggle(b, function (on) {
        look[key] = on;
        if (key === "night") spec.setAttribute("data-mode", on ? "dark" : "light");   /* 局部切夜里：样例框自己的 data-mode，不碰全站 */
        v.request();
      });
    });
    /* 全站换了浅深、样例框又没被手动切过：入夜跟着全站走 */
    if (window.StarTheme && window.StarTheme.onChange) window.StarTheme.onChange(function () {
      if (spec.hasAttribute("data-mode")) return;
      look.night = isDark(spec);
      setPressed($('[data-pa="night"]', spec), look.night);
    });
  })();

  /* ======================================================================
   * 10 屏幕门抖动交接（d-dither）
   * ====================================================================== */
  (function initDither() {
    var spec = $('[data-demo="dither"]');
    if (!spec) return;
    var host = $("[data-gl-host]", spec), mag = $("[data-di-mag]", spec), pIn = $("[data-di-p]", spec), pOut = $("[data-di-out]", spec), playBtn = $("[data-di-play]", spec);
    var st = { p: 0.4, mode: "dither", flip: true, ratio: 1 };
    var raf = 0, t0 = 0;
    var tentBase = M4.chain(M4.trans(0.36, 0, 0.02), M4.rotY(-0.42));
    var sceneA = [
      { model: M4.chain(M4.trans(-0.26, 0.02, -0.2), M4.rotY(0.32), M4.rotZ(-0.05)), front: PAPER.back, lines: 1 },
      { model: M4.chain(M4.trans(-0.42, -0.01, 0.06), M4.rotY(0.16)), wash: 1, lines: 1 }
    ];
    var sceneB = [
      { model: M4.chain(tentBase, M4.trans(0, -0.05, 0.24), M4.rotX(-0.36)), lines: 1 },
      { model: M4.chain(tentBase, M4.trans(0, -0.05, -0.24), M4.rotX(0.36)), wash: 1 }
    ];
    function magnify(v) {
      var c = mag.getContext("2d");
      c.imageSmoothingEnabled = false;
      var sw = 32, sx = Math.round(v.w / 2 - sw / 2 - v.w * 0.03), sy = Math.round(v.h / 2 - sw / 2 - v.h * 0.12);
      c.clearRect(0, 0, mag.width, mag.height);
      try { c.drawImage(v.canvas, sx, sy, sw, sw, 0, 0, mag.width, mag.height); } catch (e) { /* 画布刚被收走 */ }
    }
    var v = glView(spec, host, {
      name: "dither",
      ratio: function () { return st.ratio; },
      noCap: false,
      setup: paperKit,
      draw: function (v) {
        var a = 1 - st.p, b = st.p, blend = st.mode === "blend";
        v.k.frame({
          bg: hostBg(host),
          look: { mode: "wc", steps: true, cool: true, grain: true, edge: true, night: isDark(spec), shadow: true },
          blend: blend,
          items: sceneA.map(function (it) { return { model: it.model, front: it.front, wash: it.wash, lines: it.lines, fade: a, flip: false }; })
            .concat(sceneB.map(function (it) { return { model: it.model, front: it.front, wash: it.wash, lines: it.lines, fade: b, flip: st.flip }; })),
          shadows: [{ model: shadowAt(-0.34, -0.05, 0.85, 0.4), fade: a }, { model: shadowAt(0.36, 0.02, 0.6, 0.5), fade: b }]
        });
        magnify(v);   /* 同一个任务里拷：preserveDrawingBuffer 为 false，下一帧缓冲就没了 */
      }
    });
    function setP(p, say) {
      st.p = clamp(p, 0, 1);
      pIn.value = Math.round(st.p * 100);
      pOut.textContent = Math.round(st.p * 100) + "%";
      v.request();
      if (say) announce("交接进度" + Math.round(st.p * 100) + "%");
    }
    pIn.addEventListener("input", function () { setP(+pIn.value / 100, false); });
    radios($("[data-di-mode]", spec), function (m) { st.mode = m; v.request(); announce(m === "blend" ? "半透明混合：后画的那件在前一件后面的部分被深度挡掉" : "屏幕门抖动"); });
    radios($("[data-di-dpr]", spec), function (r) { st.ratio = +r; v.request(); });
    toggle($("[data-di-flip]", spec), function (on) { st.flip = on; v.request(); });
    function stopPlay() { if (raf) { window.cancelAnimationFrame(raf); raf = 0; } Heavy.release("dither"); }
    function diFrame(now) {
      raf = 0;
      var t = clamp((now - t0) / 1600, 0, 1);
      setP(t, false);
      if (t < 1) raf = window.requestAnimationFrame(diFrame);
      else { Heavy.release("dither"); announce("交接完：台历完全接管"); }
    }
    playBtn.addEventListener("click", function () {
      if (!v.ctx) return;
      if (reduced()) { setP(1, true); return; }
      stopPlay();
      Heavy.claim("dither", stopPlay);
      t0 = performance.now();
      raf = window.requestAnimationFrame(diFrame);
    });
    spec.addEventListener("pointerdown", function () { if (raf) stopPlay(); });
  })();

  /* ======================================================================
   * 11 静态海报 = 3D 终态那一帧（d-poster）
   * ====================================================================== */
  (function initPoster() {
    var spec = $('[data-demo="poster"]');
    if (!spec) return;
    var host = $("[data-gl-host]", spec), img = $("[data-po-img]", spec), cap = $("[data-po-cap]", spec), diff = $("[data-po-diff]", spec), dl = $("[data-po-dl]", spec);
    var playBtn = $("[data-po-play]", spec), takeBtn = $("[data-po-take]", spec), shotBtn = $("[data-po-shot]", spec);
    var at = "end", t = 1, raf = 0, t0 = 0, poster = null;   /* poster = { at, w, h, bytes } */
    function ease(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
    function pose(x) {
      var e = ease(clamp(x, 0, 1));
      var yaw = -0.62 + (1 - e) * (Math.PI + 1.3);
      return { model: M4.chain(M4.trans(0, (1 - e) * 0.26 - 0.02, 0), M4.rotY(yaw), M4.rotX(0.08 - (1 - e) * 0.12), M4.rotZ((1 - e) * 0.14)), lift: (1 - e) * 0.26, yaw: yaw };
    }
    var v = glView(spec, host, {
      name: "poster",
      setup: paperKit,
      draw: function (v) {
        var p = pose(t);
        v.k.frame({
          bg: hostBg(host),
          look: { mode: "wc", steps: true, cool: true, grain: true, edge: true, night: isDark(spec), shadow: true },
          items: [{ model: p.model, wash: 1, lines: 1, check: 1 }],
          shadows: [{ model: shadowAt(0, 0, 0.8 * Math.max(0.35, Math.abs(Math.cos(p.yaw))) + 0.1, 0.36), fade: 1 - p.lift * 1.6 }]
        });
      },
      entered: function () { shoot(false); },
      stop: function () { stopPlay(); }
    });
    /* 把当前画布拷进 2D 画布（同一个任务里，缓冲还在） */
    function grab(v) { var c = doc.createElement("canvas"); c.width = v.w; c.height = v.h; c.getContext("2d").drawImage(v.canvas, 0, 0); return c; }
    function shoot(say) {
      if (!v.ctx) return;
      stopPlay();
      t = at === "end" ? 1 : 0.6;
      v.now();
      var c = grab(v);
      var url = c.toDataURL("image/webp", 0.82);
      var webp = url.indexOf("data:image/webp") === 0;
      poster = { at: at, w: v.w, h: v.h, dark: isDark(spec), bytes: Math.round((url.length - url.indexOf(",") - 1) * 3 / 4), webp: webp };
      img.src = url;
      img.hidden = false;
      cap.textContent = "槽位：静态海报（" + (at === "end" ? "终态那一帧" : "进度0.6那一帧") + "，" + (webp ? "WebP" : "PNG") + "约" + f1(poster.bytes / 1024) + "KB）";
      ["p8", "max", "mean"].forEach(function (k) { $('[data-k="' + k + '"]', dl).textContent = "—"; });
      diff.getContext("2d").clearRect(0, 0, diff.width, diff.height);
      if (say) announce("截好海报：" + (at === "end" ? "终态那一帧" : "进度0.6那一帧"));
    }
    function compare() {
      if (!v.ctx) return;
      /* 截海报之后改过画布尺寸或换过浅深：先按现在的样子重截，不然比出来的是底色差 */
      if (!poster || poster.w !== v.w || poster.h !== v.h || poster.dark !== isDark(spec)) { var keep = at; at = poster ? poster.at : at; shoot(false); at = keep; }
      stopPlay();
      t = 1;
      v.now();
      var live = grab(v);
      img.hidden = true;
      cap.textContent = "槽位：3D接管（活的终态）";
      var ready = img.decode ? img.decode() : Promise.resolve();
      ready.then(function () {
        var w = poster.w, h = poster.h;
        var pc = doc.createElement("canvas"); pc.width = w; pc.height = h;
        var px = pc.getContext("2d"); px.drawImage(img, 0, 0, w, h);
        var A = live.getContext("2d").getImageData(0, 0, w, h).data, B = px.getImageData(0, 0, w, h).data;
        diff.width = w; diff.height = h;
        var dc = diff.getContext("2d"), out = dc.createImageData(w, h), D = out.data;
        var n8 = 0, mx = 0, sum = 0, N = w * h;
        for (var i = 0; i < A.length; i += 4) {
          var dr = Math.abs(A[i] - B[i]), dg = Math.abs(A[i + 1] - B[i + 1]), db = Math.abs(A[i + 2] - B[i + 2]);
          var m = Math.max(dr, dg, db);
          if (m > 8) n8++;
          if (m > mx) mx = m;
          sum += dr + dg + db;
          var gray = (A[i] + A[i + 1] + A[i + 2]) / 3 * 0.35 + 150;
          var k = Math.min(1, m / 48);
          D[i] = gray + (230 - gray) * k; D[i + 1] = gray * (1 - k * 0.8); D[i + 2] = gray * (1 - k * 0.8); D[i + 3] = 255;
        }
        dc.putImageData(out, 0, 0);
        var p8 = n8 / N * 100, mean = sum / (N * 3);
        $('[data-k="p8"]', dl).textContent = f2(p8) + "%";
        $('[data-k="max"]', dl).textContent = mx + "（满量程255）";
        $('[data-k="mean"]', dl).textContent = f2(mean);
        announce("3D接管：通道差大于8的像素" + f2(p8) + "%，最大差" + mx + (poster.at === "end" ? "，只剩有损压缩的噪点" : "，姿态跳了"));
      }, function () { announce("海报还没解出来，再点一次"); });
    }
    function stopPlay() { if (raf) { window.cancelAnimationFrame(raf); raf = 0; } Heavy.release("poster"); }
    function poFrame(now) {
      raf = 0;
      t = clamp((now - t0) / 2400, 0, 1);
      v.now();
      if (t < 1) raf = window.requestAnimationFrame(poFrame);
      else { Heavy.release("poster"); cap.textContent = "槽位：3D（播完停在终态）"; announce("播完：停在终态，和终态海报是同一帧"); }
    }
    radios($("[data-po-at]", spec), function (x) { at = x; shoot(true); });
    shotBtn.addEventListener("click", function () { shoot(true); });
    takeBtn.addEventListener("click", compare);
    playBtn.addEventListener("click", function () {
      if (!v.ctx) return;
      img.hidden = true;
      if (reduced()) { t = 1; v.now(); cap.textContent = "槽位：3D（减弱动效，直接到终态）"; return; }
      stopPlay();
      Heavy.claim("poster", stopPlay);
      cap.textContent = "槽位：3D（从头播）";
      t0 = performance.now();
      raf = window.requestAnimationFrame(poFrame);
    });
  })();

  /* ======================================================================
   * 12 停稳重画（d-rest）：走动按 0.537 画，停稳后排下一帧按屏幕像素比重画一次
   * ====================================================================== */
  (function initRest() {
    var spec = $('[data-demo="rest"]');
    if (!spec) return;
    var host = $("[data-gl-host]", spec), dl = $("[data-re-dl]", spec);
    var WALK = 0.537;   /* 屋主那台：√(60万 ÷ (2040×1019)) */
    var st = { panX: 0, panY: 0.02, zoom: 1, walking: false, bad: false, after: 0, settled: false };
    var restTimer = 0, settleRaf = 0, walkRaf = 0, walk0 = null;
    var VS = "attribute vec2 aP; void main() { gl_Position = vec4(aP, 0., 1.); }";
    var FS = [
      "#ifdef GL_FRAGMENT_PRECISION_HIGH",
      "precision highp float;",
      "#else",
      "precision mediump float;",
      "#endif",
      "uniform vec2 uRes; uniform vec2 uPan; uniform float uZoom; uniform float uNight;",
      "float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }",
      "float noise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);",
      "  return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y); }",
      "float fbm(vec2 p) { return .55 * noise(p) + .3 * noise(p * 2.1 + 3.1) + .15 * noise(p * 4.3 + 7.7); }",
      "float seg(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0., 1.); return length(pa - ba * h); }",
      "float box(vec2 p, vec2 c, vec2 s) { vec2 d = abs(p - c) - s; return length(max(d, 0.)) + min(max(d.x, d.y), 0.); }",
      /* 一层水彩：里面染色，贴边内侧深一圈（颜料边） */
      "vec3 wash(vec3 col, vec3 pig, float sd) {",
      "  float inside = 1. - smoothstep(-.003, .003, sd);",
      "  float ring = (1. - smoothstep(0., .022, abs(sd + .01))) * inside;",
      "  col = mix(col, col * pig, inside);",
      "  return mix(col, col * pig * .84, ring * .7);",
      "}",
      "void main() {",
      "  vec2 uv = (gl_FragCoord.xy - .5 * uRes) / uRes.y;",
      "  vec2 p = uv / uZoom + uPan;",
      "  float wob = (fbm(p * 9.) - .5) * .04;",
      "  vec3 col = vec3(.992, .988, .976) * (1. + (fbm(p * 90.) - .5) * .07);",
      "  col = wash(col, vec3(.83, .9, .94), .02 - p.y + wob);",
      "  col = wash(col, vec3(.9, .92, .82), box(p, vec2(0., -.17), vec2(.26, .16)) + wob * .5);",
      "  vec2 r = p - vec2(0., .02);",
      "  col = wash(col, vec3(.86, .66, .55), max(abs(r.x) * .62 + r.y * .9 - .17, -r.y) + wob * .4);",
      "  col = wash(col, vec3(.98, .84, .6), box(p, vec2(-.11, -.13), vec2(.05, .045)) + wob * .3);",
      "  col = wash(col, vec3(.74, .78, .7), box(p, vec2(.1, -.2), vec2(.045, .13)) + wob * .3);",
      "  col = wash(col, vec3(.78, .86, .74), length((p - vec2(-.38, -.24)) * vec2(1., 1.4)) - .1 + wob);",
      "  float w = .0016;",
      "  float d = min(min(seg(p, vec2(-.26, -.33), vec2(.26, -.33)), seg(p, vec2(-.26, -.33), vec2(-.26, -.01))), seg(p, vec2(.26, -.33), vec2(.26, -.01)));",
      "  d = min(d, min(seg(p, vec2(-.29, -.01), vec2(0., .2)), seg(p, vec2(0., .2), vec2(.29, -.01))));",
      "  d = min(d, min(abs(box(p, vec2(-.11, -.13), vec2(.05, .045))), abs(box(p, vec2(.1, -.2), vec2(.045, .13)))));",
      "  d = min(d, min(seg(p, vec2(-.16, -.13), vec2(-.06, -.13)), seg(p, vec2(-.11, -.175), vec2(-.11, -.085))));",
      /* 门上一块小牌子，牌子上几笔字样的细线（任何分辨率都读不出，看的是清不清楚） */
      "  for (int i = 0; i < 3; i++) { float fi = float(i); d = min(d, seg(p, vec2(.072 + fi * .02, -.115), vec2(.082 + fi * .02, -.1))); d = min(d, seg(p, vec2(.07 + fi * .02, -.105), vec2(.088 + fi * .02, -.108))); }",
      "  d = min(d, abs(box(p, vec2(.1, -.105), vec2(.04, .018))));",
      "  col = mix(col, vec3(.24, .23, .2), (1. - smoothstep(w * .5, w * 1.6, d)) * .85);",
      "  col *= mix(vec3(1.), vec3(.42, .45, .58), uNight);",
      "  gl_FragColor = vec4(col, 1.);",
      "}"
    ].join("\n");
    function restRatio() { return Math.min(dpr(), 1.5); }
    var v = glView(spec, host, {
      name: "rest",
      noCap: true,
      ratio: function () { return st.walking || st.bad ? WALK : restRatio(); },
      setup: function (v) {
        var gl = v.gl, p = GL.program(gl, VS, FS);
        if (!p) return null;
        var L = GL.locs(gl, p, ["aP", "uRes", "uPan", "uZoom", "uNight"]);
        var b = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, b);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
        return {
          frame: function () {
            gl.viewport(0, 0, v.w, v.h);
            gl.useProgram(p);
            gl.bindBuffer(gl.ARRAY_BUFFER, b);
            gl.enableVertexAttribArray(L.aP); gl.vertexAttribPointer(L.aP, 2, gl.FLOAT, false, 8, 0);
            gl.uniform2f(L.uRes, v.w, v.h); gl.uniform2f(L.uPan, st.panX, st.panY); gl.uniform1f(L.uZoom, st.zoom); gl.uniform1f(L.uNight, isDark(spec) ? 1 : 0);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
          },
          dispose: function () { gl.deleteBuffer(b); gl.deleteProgram(p); }
        };
      },
      draw: function (v) {
        v.k.frame();
        if (st.settled && !st.walking) { st.after++; show(); }
      },
      entered: function () { st.walking = false; st.settled = false; st.after = 0; show("刚建好：按屏幕像素比画了一帧"); },
      stop: function () { clearTimeout(restTimer); if (settleRaf) { window.cancelAnimationFrame(settleRaf); settleRaf = 0; } if (walkRaf) { window.cancelAnimationFrame(walkRaf); walkRaf = 0; } st.walking = false; }
    });
    function show(state) {
      if (state) $('[data-k="state"]', dl).textContent = state;
      $('[data-k="buf"]', dl).textContent = v.ctx ? v.w + "×" + v.h + "（像素比" + f2(v.ratio) + "）" : "—";
      $('[data-k="after"]', dl).textContent = st.settled ? st.after + "帧" : "—";
    }
    /* 走一步：换成走动那一档、画一帧，停手 160ms 后排「下一帧」重画 */
    function step() {
      if (!v.ctx) return;
      Heavy.claim("rest", function () { clearTimeout(restTimer); st.walking = false; });
      st.settled = false; st.after = 0;
      if (!st.walking) { st.walking = true; }
      show("走动：按" + WALK + "画");
      v.request();
      clearTimeout(restTimer);
      restTimer = setTimeout(settle, 160);
    }
    function settle() {
      if (settleRaf) return;
      settleRaf = window.requestAnimationFrame(function () {
        settleRaf = 0;
        if (!v.ctx) return;
        st.walking = false;
        /* 改密度、改尺寸、重画、读一个像素强制同步——同一个任务里做完，合成器看不到中间状态 */
        var t0 = performance.now();
        v.size();
        v.k.frame();
        var px = new Uint8Array(4);
        v.gl.readPixels(0, 0, 1, 1, v.gl.RGBA, v.gl.UNSIGNED_BYTE, px);
        var ms = performance.now() - t0;
        st.settled = true; st.after = 0;
        $('[data-k="cost"]', dl).textContent = st.bad ? "（反例：没有这一帧）" : f1(ms) + "ms（readPixels强制同步量，不进看门狗）";
        show(st.bad ? "停下了，但不分档：还是" + WALK + "，一直糊" : "停稳：按像素比" + f2(v.ratio) + "重画了一帧，之后一帧不画");
        Heavy.release("rest");
        announce(st.bad ? "反例：停下来还是走动那一档" : "停稳重画：" + v.w + "×" + v.h + "，" + f1(ms) + "毫秒");
      });
    }
    var drag = null;
    host.addEventListener("pointerdown", function (e) {
      if (!v.ctx || (e.pointerType === "mouse" && e.button !== 0)) return;
      drag = { x: e.clientX, y: e.clientY, px: st.panX, py: st.panY, id: e.pointerId };
      try { host.setPointerCapture(e.pointerId); } catch (err) { /* 捕获不了就算了 */ }
    });
    host.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var hgt = host.clientHeight || 300;
      st.panX = clamp(drag.px - (e.clientX - drag.x) / hgt / st.zoom, -0.5, 0.5);
      st.panY = clamp(drag.py + (e.clientY - drag.y) / hgt / st.zoom, -0.35, 0.3);
      step();
    });
    function end(e) { if (!drag || (e && e.pointerId !== drag.id)) return; drag = null; clearTimeout(restTimer); settle(); }
    host.addEventListener("pointerup", end);
    host.addEventListener("pointercancel", end);
    host.addEventListener("keydown", function (e) {
      if (composing(e)) return;
      var k = e.key, d = 0.04 / st.zoom;
      if (k === "ArrowLeft") st.panX = clamp(st.panX - d, -0.5, 0.5);
      else if (k === "ArrowRight") st.panX = clamp(st.panX + d, -0.5, 0.5);
      else if (k === "ArrowUp") st.panY = clamp(st.panY + d, -0.35, 0.3);
      else if (k === "ArrowDown") st.panY = clamp(st.panY - d, -0.35, 0.3);
      else return;
      e.preventDefault();
      step();
    });
    /* 走两步：700ms 拉近 / 退回（播放头匀速，缓动在节拍里），走完停稳 */
    function reFrame(now) {
      walkRaf = 0;
      if (!v.ctx) return;
      var x = clamp((now - walk0.t) / 700, 0, 1), e = 1 - Math.pow(1 - x, 3);
      st.zoom = walk0.from + (walk0.to - walk0.from) * e;
      step();
      if (x < 1) walkRaf = window.requestAnimationFrame(reFrame);
      else { clearTimeout(restTimer); settle(); }
    }
    $$("[data-re-walk]", spec).forEach(function (b) {
      b.addEventListener("click", function () {
        if (!v.ctx) return;
        var to = clamp(st.zoom * (b.getAttribute("data-re-walk") === "in" ? 1.6 : 1 / 1.6), 1, 4);
        if (reduced()) { st.zoom = to; step(); clearTimeout(restTimer); settle(); return; }
        if (walkRaf) window.cancelAnimationFrame(walkRaf);
        walk0 = { t: performance.now(), from: st.zoom, to: to };
        walkRaf = window.requestAnimationFrame(reFrame);
      });
    });
    toggle($("[data-re-bad]", spec), function (on) { st.bad = on; st.settled = false; v.request(); setTimeout(settle, 0); });
  })();

  /* ---------- 量具接口 ---------- */
  window.StarThreeD = {
    running: function () { return Heavy.running(); },
    ondemand: function () { return odProbe ? { calls: odProbe.calls(), running: odProbe.running() } : null; },
    contexts: function () { return GL.live(); },
    views: function () { return views.map(function (v) { return { name: v.name, live: !!v.ctx, stage: v.stage, soft: v.soft, w: v.w, h: v.h, ratio: v.ratio, failed: v.failed, draws: v.draws }; }); }
  };
})();
