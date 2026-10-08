/*
 * 动画页（motion.html）的活样例。普通 defer 脚本（file:// 下不用 module、不用 fetch）。
 *
 * 每个样例一个 init 函数，互不依赖；某个样例的 DOM 缺了就跳过，不拖累别的。共同写法：
 *  - 动画只动 transform / opacity（例外写在 motion.css 文件头）；能用 WAAPI 就用 WAAPI，rAF 只给「每帧要算」的。
 *  - 每段动画都能被打断：再触发时先收掉旧的；收尾走「事件 + 兜底计时器」两条路，谁先到算谁，旧一轮的收尾作废。
 *  - prefers-reduced-motion: reduce 时 JS 这边不起动画、直接到终点（CSS 那边外壳另有一道）。演示里的「模拟减弱动效」
 *    只在样框里局部模拟，不改系统设置、不碰全站属性（data-mode-set 这些外壳保留属性一个都不写）。
 *  - 凡处理回车 / Esc / 方向键的 keydown，第一行先判输入法合成态。
 *  - 每帧都跑的演示（漂浮叶子、灯呼吸、走进小屋播放中）滚到才开、滚走就停、页面隐藏就停；同一时间只让一个跑
 *    （heavy：后来的那个占住，先前的暂停，放手后再接着跑）。
 *  - 读屏：样框里的读数一律 aria-hidden 或 polite；要播的走外壳 StarShell.announce（全站一个 polite 区）。
 */
(function () {
  "use strict";

  var doc = document;
  function mm(q) { try { return window.matchMedia(q); } catch (e) { return null; } }
  function onMq(m, fn) {
    if (!m) return;
    if (typeof m.addEventListener === "function") m.addEventListener("change", fn);
    else if (typeof m.addListener === "function") m.addListener(fn);
  }
  var mqReduce = mm("(prefers-reduced-motion: reduce)");
  function reduced() { return !!(mqReduce && mqReduce.matches); }
  var canAnimate = typeof Element !== "undefined" && typeof Element.prototype.animate === "function";
  var raf = window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function (fn) { return setTimeout(function () { fn(Date.now()); }, 16); };
  var caf = window.cancelAnimationFrame ? window.cancelAnimationFrame.bind(window) : clearTimeout;

  function $(sel, root) { return (root || doc).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function composing(e) { return !!(e.isComposing || e.keyCode === 229); }
  function now() { return (window.performance && performance.now) ? performance.now() : Date.now(); }
  function pct(v, d) { return (v * 100).toFixed(d == null ? 0 : d) + "%"; }
  function announce(t) { try { if (window.StarShell && typeof StarShell.announce === "function") StarShell.announce(t); } catch (e) { /* 外壳没起来就算了 */ } }
  function pressed(btn) { return !!btn && btn.getAttribute("aria-pressed") === "true"; }
  function setPressed(btn, on) { if (btn) btn.setAttribute("aria-pressed", on ? "true" : "false"); }

  var EASE_OUT = "cubic-bezier(.2, .8, .2, 1)";     /* 刷刷 flipMove、按压按下、本站切页进场 */
  var EASE_IN = "cubic-bezier(.4, 0, 1, 1)";        /* 离场：本站跨页旧页淡出、小屋旧页退后 */
  var EASE_STD = "cubic-bezier(.4, 0, .2, 1)";      /* 小屋主题交叉淡化、开场淡出 */
  var SPRING_POINTS = [0, .06, .208, .4, .6, .784, .935, 1.047, 1.119, 1.155, 1.163, 1.149, 1.123, 1.091, 1.059, 1.03, 1.007, .99, .979, .974, .974, .976, .981, .986, .991, .996, 1, 1.002, 1];
  var linearOk = false;
  try { linearOk = !!(window.CSS && CSS.supports && CSS.supports("transition-timing-function", "linear(0, 1)")); } catch (e) { linearOk = false; }
  var SPRING_CSS = linearOk ? "linear(" + SPRING_POINTS.join(", ") + ")" : "cubic-bezier(.34, 1.56, .64, 1)";

  /* cubic-bezier(x1,y1,x2,y2) → f(x)：牛顿法解 t，解不出退二分（和浏览器同一条曲线） */
  function bezier(x1, y1, x2, y2) {
    var cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    var cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    function sx(t) { return ((ax * t + bx) * t + cx) * t; }
    function sy(t) { return ((ay * t + by) * t + cy) * t; }
    function dx(t) { return (3 * ax * t + 2 * bx) * t + cx; }
    return function (x) {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      var t = x, i;
      for (i = 0; i < 8; i++) {
        var e = sx(t) - x, d = dx(t);
        if (Math.abs(e) < 1e-6) return sy(t);
        if (Math.abs(d) < 1e-6) break;
        t -= e / d;
      }
      var lo = 0, hi = 1;
      t = x;
      for (i = 0; i < 40; i++) {
        if (sx(t) < x) lo = t; else hi = t;
        t = (lo + hi) / 2;
      }
      return sy(t);
    };
  }
  /* linear(...) 等分点 → f(x)（分段线性） */
  function linearFn(pts) {
    var n = pts.length - 1;
    return function (x) {
      if (x <= 0) return pts[0];
      if (x >= 1) return pts[n];
      var i = Math.floor(x * n), f = x * n - i;
      return pts[i] + (pts[i + 1] - pts[i]) * f;
    };
  }
  function fmtNum(v) {
    var s = v.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
    if (s === "-0") s = "0";
    return s.replace(/^(-?)0\./, "$1.");
  }

  /* 事件 + 兜底计时器：fn 只跑一次。animation 可以是 null（只靠计时器）。cancel() 会让 finished 走 reject，照样会跑 fn——
     调用方自己比代数（本站 CLAUDE.md「外壳的坑」）。 */
  function settle(animation, ms, fn) {
    var done = false;
    var timer = 0;
    function run() {
      if (done) return;
      done = true;
      clearTimeout(timer);
      fn();
    }
    timer = setTimeout(run, ms);
    if (animation && animation.finished && typeof animation.finished.then === "function") animation.finished.then(run, run);
    return run;
  }

  /* 单选组：点了就选中、roving tabindex；方向键由外壳（star.js）移动并 click */
  function radios(group, fn) {
    if (!group) return;
    var btns = $$('[role="radio"]', group);
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        btns.forEach(function (x) {
          var on = x === b;
          x.setAttribute("aria-checked", on ? "true" : "false");
          x.setAttribute("tabindex", on ? "0" : "-1");
        });
        fn(b);
      });
    });
  }
  /* 开关胶囊（aria-pressed） */
  function toggle(btn, fn) {
    if (!btn) return;
    btn.addEventListener("click", function () {
      var on = !pressed(btn);
      setPressed(btn, on);
      fn(on);
    });
  }
  /* 事件日志：最新的在最上面，最多留 max 条 */
  function logTo(list, text, cls, max) {
    if (!list) return;
    var li = doc.createElement("li");
    if (cls) li.className = cls;
    li.textContent = text;
    list.insertBefore(li, list.firstChild);
    while (list.children.length > (max || 5)) list.removeChild(list.lastChild);
  }
  /* 看得见吗：IntersectionObserver + 页面隐藏。fn(visible) 只在变化时调 */
  function watch(el, fn, threshold) {
    var inView = false, last = null;
    function emit() {
      var v = inView && !doc.hidden;
      if (v === last) return;
      last = v;
      fn(v);
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        inView = en[en.length - 1].isIntersecting;
        emit();
      }, { threshold: threshold || 0 }).observe(el);
    } else { inView = true; emit(); }
    doc.addEventListener("visibilitychange", emit);
    return function () { return inView && !doc.hidden; };
  }
  /* 每帧都跑的演示同一时间只让一个跑：claim 时把正在跑的那个暂停（记下它在等），release 时让等着的接着跑 */
  var heavy = (function () {
    var owner = null;
    var regs = {};
    return {
      register: function (name, pause, resume) { regs[name] = { pause: pause, resume: resume, waiting: false }; },
      claim: function (name) {
        if (owner === name) return;
        if (owner && regs[owner]) { regs[owner].waiting = true; try { regs[owner].pause(); } catch (e) { /* 一个演示出错不拖累别的 */ } }
        owner = name;
      },
      release: function (name) {
        if (owner !== name) return;
        owner = null;
        Object.keys(regs).forEach(function (k) {
          if (k !== name && regs[k].waiting && !owner) {
            regs[k].waiting = false;
            try { regs[k].resume(); } catch (e) { /* 同上 */ }
          }
        });
      },
      busy: function (name) { return !!owner && owner !== name; },
      wait: function (name) { if (regs[name]) regs[name].waiting = true; }
    };
  })();

  /* ---------- 示例小页面（切明暗、交叉淡化、跳过条件共用）：骨架线条，颜色全是外壳令牌 ---------- */
  function miniPage() {
    var nav = "", cards = "", i;
    for (i = 0; i < 4; i++) nav += '<span class="mp-nav' + (i === 0 ? " is-on" : "") + '"><i></i><b></b></span>';
    for (i = 0; i < 3; i++) cards += '<span class="mp-card"><span class="mp-ico"></span><b></b><s></s><span class="mp-chip"></span></span>';
    return '<div class="mp" data-mode="light" data-accent="blue" aria-hidden="true">' +
      '<div class="mp-side"><span class="mp-brand"></span>' + nav + '<span class="mp-seg"><i class="is-on"></i><i></i><i></i></span></div>' +
      '<div class="mp-main"><span class="mp-h"></span><span class="mp-p"></span><div class="mp-cards">' + cards + '</div>' +
      '<span class="mp-btns"><span class="mp-btn"></span><span class="mp-btn2"></span></span></div></div>';
  }
  function setMpMode(mp, mode) {
    mp.setAttribute("data-mode", mode);
    var seg = $$(".mp-seg i", mp);
    seg.forEach(function (x, i) { x.classList.toggle("is-on", (mode === "light" && i === 0) || (mode === "dark" && i === 1)); });
  }
  /* 圆形揭开：新画面（克隆一份、换成新的明暗）盖在上面，clip-path 圆从 origin 张开到最远那个角；
     走完把底下那份换过去、拆掉上面那份。clip-path 不是 transform / opacity——View Transition 原物就是动它，例外。 */
  function makeReveal(frame) {
    frame.innerHTML = miniPage();
    var live = $(".mp", frame);
    var cur = null;
    function mode() { return live.getAttribute("data-mode"); }
    function finishNow() { if (cur) cur.finish(); }
    function run(origin, opts) {
      finishNow();
      var next = mode() === "dark" ? "light" : "dark";
      if (opts.instant || reduced() || !canAnimate) {
        setMpMode(live, next);
        if (opts.onDone) opts.onDone(next, true);
        return;
      }
      var over = live.cloneNode(true);
      over.classList.add("mp-over");
      setMpMode(over, next);
      frame.appendChild(over);
      var w = frame.clientWidth, h = frame.clientHeight;
      var x = clamp(origin.x, 0, w), y = clamp(origin.y, 0, h);
      var r = Math.ceil(Math.sqrt(Math.pow(Math.max(x, w - x), 2) + Math.pow(Math.max(y, h - y), 2)));
      var at = " at " + x.toFixed(1) + "px " + y.toFixed(1) + "px)";
      var anim;
      try {
        anim = over.animate({ clipPath: ["circle(0px" + at, "circle(" + r + "px" + at] }, { duration: opts.ms, easing: opts.ease, fill: "forwards" });
      } catch (e) { anim = null; }
      var me = { done: false };
      var t0 = now(), loop = 0;
      function tick() {
        loop = 0;
        if (me.done) return;
        var t = clamp((now() - t0) / opts.ms, 0, 1);
        if (anim && typeof anim.currentTime === "number") t = clamp(anim.currentTime / opts.ms, 0, 1);
        if (opts.onFrame) opts.onFrame(t);
        if (t < 1) loop = raf(tick);
      }
      me.finish = function () {
        if (me.done) return;
        me.done = true;
        if (cur === me) cur = null;
        if (loop) caf(loop);
        if (anim) { try { anim.cancel(); } catch (e) { /* 已结束 */ } }
        setMpMode(live, next);
        if (over.parentNode) over.parentNode.removeChild(over);
        if (opts.onFrame) opts.onFrame(1);
        if (opts.onDone) opts.onDone(next, false);
      };
      cur = me;
      settle(anim, opts.ms + 120, me.finish);
      if (opts.onFrame) loop = raf(tick);
    }
    return { run: run, mode: mode, live: live, finishNow: finishNow };
  }
  /* 圆心为 (x, y)、半径 r 的圆盖住 w×h 矩形的比例（网格取样，够用） */
  function coverage(r, x, y, w, h) {
    var nx = 48, ny = 27, hit = 0;
    for (var i = 0; i < nx; i++) {
      for (var j = 0; j < ny; j++) {
        var px = (i + 0.5) * w / nx, py = (j + 0.5) * h / ny;
        if ((px - x) * (px - x) + (py - y) * (py - y) <= r * r) hit++;
      }
    }
    return hit / (nx * ny);
  }

  /* ================================================================
   * 1 曲线与时长：每行一条曲线，点「走一遍」小方块按这条曲线走；勾上几行一起跑
   * ================================================================ */
  var CURVES = [
    { id: "out", name: "通用缓出", css: "cubic-bezier(.2,.8,.2,1)", b: [.2, .8, .2, 1], ms: 240, use: "刷刷FLIP补位" },
    { id: "plan", name: "plan缓出", css: "cubic-bezier(.22,1,.36,1)", b: [.22, 1, .36, 1], ms: 220, use: "plan对勾、计数、FLIP" },
    { id: "apple", name: "苹果ease", css: "cubic-bezier(.32,.72,0,1)", b: [.32, .72, 0, 1], ms: 380, use: "card Cover Flow切卡" },
    { id: "std", name: "标准", css: "cubic-bezier(.4,0,.2,1)", b: [.4, 0, .2, 1], ms: 500, use: "小屋主题交叉淡化" },
    { id: "in", name: "缓入（离场）", css: "cubic-bezier(.4,0,1,1)", b: [.4, 0, 1, 1], ms: 200, use: "本站跨页旧页淡出" },
    { id: "over", name: "过冲", css: "cubic-bezier(.34,1.56,.64,1)", b: [.34, 1.56, .64, 1], ms: 420, use: "刷刷按压松手" },
    { id: "spring", name: "弹簧", css: "linear(0,.06,.208,…,1.002,1)", pts: SPRING_POINTS, ms: 700, use: "card按压松手" },
    { id: "reveal", name: "揭开", css: "cubic-bezier(.25,.5,.3,1)", b: [.25, .5, .3, 1], ms: 420, use: "本站切明暗" },
    { id: "viewin", name: "小屋入场", css: "cubic-bezier(.2,.7,.3,1)", b: [.2, .7, .3, 1], ms: 440, use: "小屋页面入场" },
    { id: "veil", name: "洇纸", css: "cubic-bezier(.3,0,.16,1)", b: [.3, 0, .16, 1], ms: 550, use: "小屋换房间洇开" },
    { id: "hand", name: "写字", css: "cubic-bezier(.34,.06,.42,1)", b: [.34, .06, .42, 1], ms: 1750, use: "小屋开场手写" }
  ];
  function curveFn(c) { return c.pts ? linearFn(c.pts) : bezier(c.b[0], c.b[1], c.b[2], c.b[3]); }
  function curveEasing(c) { return c.pts ? SPRING_CSS : c.css; }
  function initCurves() {
    var root = $("[data-demo='curves']");
    if (!root) return;
    var list = $(".moc-list", root);
    var out = $("[data-c='out']", root);
    var nOut = $("[data-c='n']", root);
    var slowBtn = $("[data-c='slow']", root);
    var durMode = "own";
    var rows = CURVES.map(function (c) {
      var f = curveFn(c);
      var d = "";
      for (var i = 0; i <= 30; i++) {
        var x = i / 30;
        d += (i ? "L" : "M") + (2 + x * 42).toFixed(1) + "," + (30 - f(x) * 24).toFixed(1);
      }
      var li = doc.createElement("li");
      li.className = "moc-row";
      li.innerHTML =
        '<button type="button" class="mo-tog moc-pick" aria-pressed="false"><span>勾上：' + c.name + "</span></button>" +
        '<svg class="moc-thumb" viewBox="0 0 46 34" aria-hidden="true" focusable="false"><path class="ax" d="M2 30H44M2 6H44"/><path class="cv" d="' + d + '"/></svg>' +
        '<span class="moc-meta"><b>' + c.name + "</b><code>" + c.css + "</code><small>" + c.ms + "ms · " + c.use + "</small></span>" +
        '<span class="moc-lane" aria-hidden="true"><i class="moc-dot"></i></span>' +
        '<button type="button" class="moc-run" aria-label="走一遍：' + c.name + "，" + c.ms + '毫秒">走一遍</button>';
      list.appendChild(li);
      return { c: c, li: li, pick: $(".moc-pick", li), dot: $(".moc-dot", li), lane: $(".moc-lane", li), anim: null };
    });
    function geometry(r) {
      var lw = r.lane.clientWidth, dw = r.dot.offsetWidth || 20;
      var end = Math.max(20, (lw - dw - 6) / 1.17);    /* 留出过冲那一截（弹簧最多 1.163） */
      r.lane.style.setProperty("--end", (3 + end + dw / 2 - 1).toFixed(1) + "px");
      return end;
    }
    rows.forEach(geometry);
    window.addEventListener("resize", function () {
      rows.forEach(function (r) { if (r.anim) { r.anim.cancel(); r.anim = null; } r.dot.style.transform = ""; geometry(r); });
    });
    function msOf(c) { return (durMode === "own" ? c.ms : 600) * (pressed(slowBtn) ? 4 : 1); }
    function run(sel) {
      if (!sel.length) return;
      sel.forEach(function (r) {
        var end = geometry(r);
        if (r.anim) { r.anim.cancel(); r.anim = null; }
        r.dot.style.transform = "";
        if (reduced() || !canAnimate) { r.dot.style.transform = "translateX(" + end.toFixed(1) + "px)"; return; }
        r.anim = r.dot.animate([{ transform: "translateX(0)" }, { transform: "translateX(" + end.toFixed(1) + "px)" }],
          { duration: msOf(r.c), easing: curveEasing(r.c), fill: "forwards" });
      });
      var names = sel.map(function (r) { return r.c.name + msOf(r.c) + "ms"; }).join("、");
      var msg = (sel.length > 1 ? "同一刻出发：" : "走一遍：") + names + (reduced() ? "（减弱动效：直接到终点）" : "");
      out.textContent = msg;
      announce(msg);
    }
    function picked() { return rows.filter(function (r) { return pressed(r.pick); }); }
    rows.forEach(function (r) {
      r.pick.addEventListener("click", function () {
        setPressed(r.pick, !pressed(r.pick));
        nOut.textContent = "（" + picked().length + "行）";
      });
      $(".moc-run", r.li).addEventListener("click", function () { run([r]); });
    });
    $("[data-c='run-sel']", root).addEventListener("click", function () {
      var sel = picked();
      if (!sel.length) { out.textContent = "先勾上几行（每行最左边那颗）。"; announce("先勾上几行"); return; }
      run(sel);
    });
    radios($(".mo-seg", root), function (b) { durMode = b.getAttribute("data-dur"); });
    toggle(slowBtn, function () {});
  }

  /* ================================================================
   * 2 FLIP：打乱 / 删一个 / 加一个；直接跳对照；反例按布局位置量
   * ================================================================ */
  function initFlip() {
    var root = $("[data-demo='flip']");
    if (!root) return;
    var grid = $(".mof-grid", root);
    var out = $("[data-f='out']", root);
    var staggerBtn = $("[data-f='stagger']", root);
    var badBtn = $("[data-f='bad']", root);
    var COLORS = ["#007AFF", "#34C759", "#FF9500", "#FF2D55", "#5856D6", "#30B0C7", "#AF52DE", "#FFCC00"];
    var mode = "flip", seq = 0;
    var running = typeof WeakMap === "function" ? new WeakMap() : null;
    function tile() {
      seq += 1;
      var li = doc.createElement("li");
      li.className = "mof-tile" + (seq % 3 === 0 ? " is-wide" : "");
      li.style.setProperty("--c", COLORS[(seq - 1) % COLORS.length]);
      li.textContent = "示例" + seq;
      return li;
    }
    for (var i = 0; i < 8; i++) grid.appendChild(tile());
    function place(el) {
      var g = grid.getBoundingClientRect(), r = el.getBoundingClientRect();
      return { x: r.left - g.left, y: r.top - g.top };
    }
    function layoutPlace(el) { return { x: el.offsetLeft, y: el.offsetTop }; }
    function cancelAll(items) {
      if (!running) return;
      items.forEach(function (el) { var a = running.get(el); if (a) { a.cancel(); running.delete(el); } });
    }
    function report(text) { out.textContent = text; }
    function act(mutate, added, label) {
      var items = $$(".mof-tile", grid);
      if (mode === "jump" || reduced() || !canAnimate) {
        cancelAll(items);
        mutate();
        report(label + "：" + (reduced() ? "减弱动效，只改不动" : "直接跳，布局一次到位、没有中间帧") + "。");
        return;
      }
      var bad = pressed(badBtn);
      var before = new Map();
      items.forEach(function (el) { before.set(el, bad ? layoutPlace(el) : place(el)); });   /* 反例：按布局量，不含正在走的位移 */
      cancelAll(items);                                                                        /* 量完先撤掉上一轮 */
      mutate();
      var moved = [];
      $$(".mof-tile", grid).forEach(function (el) {
        if (el === added || !before.has(el)) return;
        var from = before.get(el), to = bad ? layoutPlace(el) : place(el);
        var dx = from.x - to.x, dy = from.y - to.y;
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
        moved.push({ el: el, dx: dx, dy: dy });
      });
      var stag = pressed(staggerBtn);
      moved.forEach(function (m, k) {
        var a = m.el.animate([{ transform: "translate(" + m.dx.toFixed(1) + "px, " + m.dy.toFixed(1) + "px)" }, { transform: "translate(0, 0)" }],
          { duration: 240, easing: EASE_OUT, delay: stag ? Math.min(k, 8) * 30 : 0, fill: "backwards" });
        if (running) running.set(m.el, a);
        a.finished.then(function () { if (running && running.get(m.el) === a) running.delete(m.el); }, function () {});
      });
      if (added) {
        var a2 = added.animate([{ opacity: 0, transform: "scale(.6)" }, { opacity: 1, transform: "none" }], { duration: 240, easing: EASE_OUT });
        if (running) running.set(added, a2);
      }
      var probe = moved.length ? moved[0].el : null;
      var head = label + "：" + moved.length + "块从旧位置滑回0（240ms" + (stag ? "，依次晚30ms" : "") + "）" + (bad ? "；反例按布局量，连点时会跳一截" : "");
      report(head + "。");
      if (probe) {
        setTimeout(function () {
          var inline = probe.style.transform || "";
          var comp = getComputedStyle(probe).transform;
          report(head + "；第80ms读el.style.transform得「" + inline + "」，读getComputedStyle得" + (comp === "none" ? "none（已走完）" : comp) + "。");
        }, 80);
      }
    }
    $("[data-f='shuffle']", root).addEventListener("click", function () {
      act(function () {
        var items = $$(".mof-tile", grid);
        var copy = items.slice();
        for (var n = copy.length - 1; n > 0; n--) {
          var j = Math.floor(Math.random() * (n + 1));
          var t = copy[n]; copy[n] = copy[j]; copy[j] = t;
        }
        if (copy.every(function (el, k) { return el === items[k]; })) copy.push(copy.shift());
        copy.forEach(function (el) { grid.appendChild(el); });
      }, null, "打乱");
    });
    $("[data-f='remove']", root).addEventListener("click", function () {
      var items = $$(".mof-tile", grid);
      if (items.length <= 3) { report("至少留3块。"); return; }
      var victim = items[Math.floor(Math.random() * items.length)];
      act(function () { grid.removeChild(victim); }, null, "删掉「" + victim.textContent + "」");
    });
    $("[data-f='add']", root).addEventListener("click", function () {
      var items = $$(".mof-tile", grid);
      if (items.length >= 12) { report("最多12块。"); return; }
      var t = tile();
      var at = Math.floor(Math.random() * (items.length + 1));
      act(function () { grid.insertBefore(t, items[at] || null); }, t, "加上「" + t.textContent + "」");
    });
    radios($(".mo-seg", root), function (b) { mode = b.getAttribute("data-mode"); });
    toggle(staggerBtn, function () {});
    toggle(badBtn, function () {});
  }

  /* ================================================================
   * 3 只动 transform / opacity：A 动 box-shadow、B 动伪元素 opacity；各量3秒帧间隔
   * ================================================================ */
  function initCheap() {
    var root = $("[data-demo='cheap']");
    if (!root || !window.requestAnimationFrame) return;
    var boxA = $(".mos-a", root), boxB = $(".mos-b", root);
    var out = $("[data-s='out']", root);
    var liftBtn = $("[data-s='lift']", root);
    var measureBtn = $("[data-s='measure']", root);
    [boxA, boxB].forEach(function (box) { for (var i = 0; i < 12; i++) { var s = doc.createElement("span"); s.className = "mos-card"; box.appendChild(s); } });
    liftBtn.addEventListener("click", function () {
      var on = !pressed(liftBtn);
      setPressed(liftBtn, on);
      boxA.classList.toggle("is-lift", on);
      boxB.classList.toggle("is-lift", on);
    });
    heavy.register("cheap", function () {}, function () {});
    var busy = false;
    function stats(t) {
      var s = t.slice().sort(function (a, b) { return a - b; });
      function q(p) { return s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : 0; }
      return { n: t.length, med: q(0.5), p95: q(0.95), long: t.filter(function (x) { return x > 25; }).length };
    }
    function runSide(box, ms, done) {
      var times = [], t0 = 0, last = 0, flipT = 0, landed = false, hidden = false;
      var probe = box.children[2];
      box.classList.remove("is-lift");
      function frame(t) {
        if (doc.hidden) hidden = true;
        if (!t0) { t0 = t; flipT = t; }
        if (last) times.push(t - last);
        last = t;
        if (t - flipT >= 300) { box.classList.toggle("is-lift"); flipT = t; }
        /* 断言操作真落地：浮起后过 200ms 读一张卡的计算位移，真的上去了才算 */
        if (!landed && box.classList.contains("is-lift") && t - flipT > 200) {
          var m = getComputedStyle(probe).transform;
          var ty = 0;
          if (m && m !== "none") { var p = m.replace(/^matrix(3d)?\(|\)$/g, "").split(","); ty = parseFloat(p[p.length === 16 ? 13 : 5]); }
          if (ty < -1) landed = true;
        }
        if (t - t0 < ms) raf(frame);
        else { box.classList.remove("is-lift"); done(stats(times), landed, hidden); }
      }
      raf(frame);
    }
    function fill(side, s, landed) {
      var tr = $("tr[data-row='" + side + "']", root);
      var tds = $$("td", tr);
      tds[0].textContent = String(s.n);
      tds[1].textContent = s.med.toFixed(1) + "ms";
      tds[2].textContent = s.p95.toFixed(1) + "ms";
      tds[3].textContent = String(s.long) + (landed ? "" : "（没浮起来，不算）");
    }
    measureBtn.addEventListener("click", function () {
      if (busy) return;
      busy = true;
      measureBtn.disabled = true;
      setPressed(liftBtn, false);
      boxA.classList.remove("is-lift");
      boxB.classList.remove("is-lift");
      heavy.claim("cheap");
      out.textContent = "在量A（3秒，别切走页面）…";
      runSide(boxA, 3000, function (sa, la, ha) {
        fill("a", sa, la);
        out.textContent = "在量B（3秒）…";
        runSide(boxB, 3000, function (sb, lb, hb) {
          fill("b", sb, lb);
          var td = $$("tr[data-row] td", root);
          td[3].className = sa.long > sb.long ? "is-bad" : "";
          td[7].className = sb.long <= sa.long ? "is-ok" : "";
          var msg = (ha || hb) ? "中途切到了后台，帧间隔不可信，再量一次。"
            : "量完：A超过25ms的帧" + sa.long + "个、P95 " + sa.p95.toFixed(1) + "ms；B " + sb.long + "个、P95 " + sb.p95.toFixed(1) + "ms。" +
              (reduced() ? "（减弱动效下没有过渡，两边都是瞬间跳，差不出来）" : (sa.long > sb.long + 2 ? "动box-shadow的那边长帧多。" : "帧间隔看不出差别：光栅在别的线程上，这么小的卡还压不垮帧；差在A每一帧都在重画（实测次数见下面「为什么」）。"));
          out.textContent = msg;
          announce(msg);
          busy = false;
          measureBtn.disabled = false;
          heavy.release("cheap");
        });
      });
    });
  }

  /* ================================================================
   * 4 减弱动效两道保险：样框里局部模拟
   * ================================================================ */
  function initReduce() {
    var root = $("[data-demo='reduce']");
    if (!root) return;
    root.classList.add("mor");
    var stage = $("[data-r='stage']", root);
    var list = $("[data-r='log']", root);
    var simBtn = $("[data-r='sim']", root);
    var gateBtn = $("[data-r='gate']", root);
    var cssMode = "tiny", endMode = "event";
    var gen = 0, veil = null, timers = [];
    function apply() { if (pressed(simBtn)) root.setAttribute("data-sim", cssMode); else root.removeAttribute("data-sim"); }
    apply();
    function clear() {
      timers.forEach(clearTimeout);
      timers = [];
      if (veil && veil.parentNode) veil.parentNode.removeChild(veil);
      veil = null;
    }
    function log(t, cls) { logTo(list, t, cls, 5); }
    function play() {
      gen += 1;
      var my = gen;
      clear();
      var sim = pressed(simBtn);
      var isReduced = sim || reduced();
      if (reduced() && !sim) log("你的系统开着减弱动效：外壳已把动画全关成none，这里两种写法看起来一样。", "is-warn");
      if (pressed(gateBtn) && isReduced) { log("第二道：组件判到减弱动效，整段不渲染——门厅直接露出来，没有闪一下。", "is-ok"); announce("第二道保险：遮罩不渲染"); return; }
      if (pressed(gateBtn) && !isReduced) log("第二道只在减弱动效下起作用；现在没开（模拟关着），照常播。");
      veil = doc.createElement("div");
      veil.className = "mor-veil";
      veil.setAttribute("aria-hidden", "true");
      veil.textContent = "开场（示例）";
      stage.appendChild(veil);
      log("渲染遮罩，停0.6秒后起淡出" + (sim ? "（模拟：第一道写" + (cssMode === "tiny" ? "0.01ms" : "none") + "）" : "") + "。");
      timers.push(setTimeout(function () {
        if (my !== gen || !veil) return;
        var v = veil, t0 = now();
        function finish(how) {
          if (my !== gen || veil !== v) return;
          if (v.parentNode) v.parentNode.removeChild(v);
          veil = null;
          log("收尾：拆掉遮罩（" + how + "，起淡出后" + Math.round(now() - t0) + "ms）。", "is-ok");
          announce("收尾：遮罩拆掉了");
        }
        v.addEventListener("animationend", function () { finish("animationend"); });
        v.classList.add("is-out");
        if (endMode === "timer") timers.push(setTimeout(function () { finish("兜底计时器"); }, 500 + 120));
        /* 演示用的看门狗（不是组件的一部分）：1.5秒后还盖着就报卡住 */
        timers.push(setTimeout(function () {
          if (my === gen && veil === v) { log("1.5秒了animationend还没来：遮罩一直盖着，底下的门厅点不到（卡住了）。", "is-bad"); announce("卡住了：遮罩一直盖着"); }
        }, 1500));
      }, 600));
    }
    toggle(simBtn, function () { apply(); });
    toggle(gateBtn, function () {});
    radios($("[aria-labelledby='mor-l1']", root), function (b) { cssMode = b.getAttribute("data-css"); apply(); });
    radios($("[aria-labelledby='mor-l2']", root), function (b) { endMode = b.getAttribute("data-end"); });
    $("[data-r='play']", root).addEventListener("click", play);
  }

  /* ================================================================
   * 5 收尾与打断：直接到终态 / 倒着走回去；三个反例
   * ================================================================ */
  function initInterrupt() {
    var root = $("[data-demo='interrupt']");
    if (!root) return;
    var panel = $("[data-i='panel']", root);
    var btn = $("[data-i='toggle']", root);
    var list = $("[data-i='log']", root);
    var stateBox = $(".moi-state", root);
    var o = { want: $("[data-i='want']", root), state: $("[data-i='state']", root), gen: $("[data-i='gen']", root) };
    var noGen = $("[data-i='nogen']", root), noTimer = $("[data-i='notimer']", root), stuck = $("[data-i='stuck']", root);
    var MS = 900;
    var KF = [{ opacity: 0, transform: "translateY(24px) scale(.94)" }, { opacity: 1, transform: "none" }];
    var way = "end", want = false, st = "closed", gen = 0, cur = null;
    function log(t, cls) { logTo(list, t, cls, 6); }
    function show() {
      o.want.textContent = want ? "开着" : "关着";
      o.state.textContent = st;
      o.gen.textContent = String(gen);
      var ok = want ? (st === "open" || st === "opening") : (st === "closed" || st === "closing");
      stateBox.classList.toggle("is-wrong", !ok);
      return ok;
    }
    function setRest(open) {
      if (cur) { try { cur.cancel(); } catch (e) { /* 已结束 */ } cur = null; }
      panel.getAnimations && panel.getAnimations().forEach(function (a) { a.cancel(); });
      panel.classList.toggle("is-open", open);
      panel.classList.remove("is-moving");
      st = open ? "open" : "closed";
    }
    function attach(anim, ms, open, my) {
      var once = false;
      function done() {
        if (once) return;
        once = true;
        if (!pressed(noGen) && my !== gen) { log("第" + my + "代的收尾来了：代数不对，作废。", "is-ok"); return; }
        if (cur === anim) cur = null;
        setRest(open);
        var ok = show();
        log("第" + my + "代收尾：状态改成" + st + (ok ? "" : "——可按钮说的是" + (want ? "开着" : "关着") + "，被旧收尾改回来了"), ok ? "" : "is-bad");
        if (!ok) announce("状态错了：被旧一代的收尾改回来了");
      }
      if (!pressed(stuck)) anim.finished.then(done, done);
      if (!pressed(noTimer)) setTimeout(done, ms + 120);
    }
    function start(open) {
      gen += 1;
      var my = gen;
      if (reduced() || !canAnimate) { setRest(open); show(); log("减弱动效：直接到终态" + st + "。"); return; }
      panel.classList.remove("is-open");
      panel.classList.add("is-moving");
      cur = panel.animate(KF, { duration: MS, easing: open ? EASE_OUT : EASE_IN, fill: "forwards", direction: open ? "normal" : "reverse" });
      st = open ? "opening" : "closing";
      show();
      log("第" + my + "代：开始" + (open ? "打开" : "关上") + "（900ms，慢放）。");
      attach(cur, MS, open, my);
      if (pressed(stuck) && pressed(noTimer)) {
        setTimeout(function () {
          if (my === gen && (st === "opening" || st === "closing")) { show(); log("画面早走完了，状态还停在" + st + "：事件没来、又没有计时器兜底。", "is-bad"); }
        }, MS + 400);
      }
    }
    btn.addEventListener("click", function () {
      want = !want;
      btn.setAttribute("aria-expanded", want ? "true" : "false");
      if (cur && (st === "opening" || st === "closing")) {
        if (way === "end") {
          var old = cur;
          cur = null;
          gen += 1;
          try { old.cancel(); } catch (e) { /* 已结束 */ }
          setRest(want);
          show();
          log("打断：直接到终态（" + st + "），cancel()让上一代的finished走reject。", "is-warn");
        } else {
          gen += 1;
          var my = gen;
          var t = typeof cur.currentTime === "number" ? cur.currentTime : 0;
          cur.reverse();
          st = want ? "opening" : "closing";
          show();
          log("打断：从这一帧倒着走回去（第" + my + "代，还要约" + Math.round(t) + "ms）。", "is-warn");
          attach(cur, t, want, my);
        }
        announce("打断：" + (want ? "打开" : "关上"));
        return;
      }
      start(want);
      announce(want ? "打开示例面板" : "关上示例面板");
    });
    radios($(".mo-seg", root), function (b) { way = b.getAttribute("data-way"); });
    toggle(noGen, function () {});
    toggle(noTimer, function () {});
    toggle(stuck, function () {});
    show();
  }

  /* ================================================================
   * 6 整页换色：各写transition（反例）/ 快照交叉淡化
   * ================================================================ */
  function initXfade() {
    var root = $("[data-demo='xfade']");
    if (!root) return;
    var frame = $("[data-x='frame']", root);
    var out = $("[data-x='out']", root);
    frame.innerHTML = miniPage();
    var live = $(".mp", frame);
    var ACC = ["blue", "green", "indigo", "orange", "pink", "teal"];
    var NAME = { blue: "蓝", green: "绿", indigo: "靛", orange: "橙", pink: "粉", teal: "青" };
    var way = "snap", ms = 260, cur = null;
    var groups = $$(".mo-seg", root);
    function finishCur() { if (cur) cur(); }
    function change(kind) {
      finishCur();
      var acc = live.getAttribute("data-accent"), mode = live.getAttribute("data-mode");
      var nextAcc = kind === "accent" ? ACC[(ACC.indexOf(acc) + 1) % ACC.length] : acc;
      var nextMode = kind === "mode" ? (mode === "dark" ? "light" : "dark") : mode;
      function apply() { live.setAttribute("data-accent", nextAcc); setMpMode(live, nextMode); }
      var what = kind === "accent" ? "强调色换成" + NAME[nextAcc] : "换成" + (nextMode === "dark" ? "深色" : "浅色");
      if (reduced() || !canAnimate) {
        frame.classList.remove("mox-each");
        apply();
        out.textContent = what + "：减弱动效，直接切。";
        announce(out.textContent);
        return;
      }
      if (way === "each") {
        frame.classList.add("mox-each");
        apply();
        out.textContent = what + "：各写transition——底150ms、卡片350ms、侧栏500ms、标题600ms、导航1秒、图标1.2秒才到位；按钮、品牌方块和光晕没写过渡，直接跳。";
      } else {
        frame.classList.remove("mox-each");
        var snap = live.cloneNode(true);
        snap.classList.add("mp-over");
        frame.appendChild(snap);
        apply();
        var anim = snap.animate([{ opacity: 1 }, { opacity: 0 }], { duration: ms, easing: EASE_STD, fill: "forwards" });
        var stop = settle(anim, ms + 120, function () {
          if (snap.parentNode) snap.parentNode.removeChild(snap);
          if (cur === stop) cur = null;
        });
        cur = stop;
        out.textContent = what + "：快照交叉淡化——整块在" + ms + "ms里一起淡过去。";
      }
      announce(what);
    }
    $("[data-x='accent']", root).addEventListener("click", function () { change("accent"); });
    $("[data-x='mode']", root).addEventListener("click", function () { change("mode"); });
    radios(groups[0], function (b) { way = b.getAttribute("data-way"); });
    radios(groups[1], function (b) { ms = Number(b.getAttribute("data-ms")) || 260; });
  }

  /* ================================================================
   * 7 弹簧：拖刚度、阻尼比；按1/240秒细分积分；烤成 linear()
   * ================================================================ */
  function springSim(k, z, T, coarse, fine) {
    var c = 2 * z * Math.sqrt(k), a = 0, v = 0, t = 0, out = [{ t: 0, x: 0 }], h = coarse ? 0.06 : (fine || 1 / 240);
    var diverged = false;
    while (t < T - 1e-9) {
      var step = Math.min(h, T - t);
      if (!coarse) { v += (k * (1 - a) - c * v) * step; a += v * step; }
      else { v += (k * (1 - a) - c * v) * h; a += v * h; step = h; }
      t += step;
      if (!isFinite(a) || Math.abs(a) > 1e6) { diverged = true; a = a > 0 ? 1e6 : -1e6; }
      out.push({ t: t, x: a });
      if (diverged) break;
    }
    return { pts: out, diverged: diverged || out.some(function (p) { return Math.abs(p.x) > 4; }) };
  }
  function springSettle(k, z, band) {
    var c = 2 * z * Math.sqrt(k), a = 0, v = 0, t = 0, h = 1 / 2400, last = 0;
    while (t < 20) {
      v += (k * (1 - a) - c * v) * h;
      a += v * h;
      t += h;
      if (Math.abs(a - 1) > band || Math.abs(v) > band * 10) last = t;
    }
    return last;
  }
  function initSpring() {
    var root = $("[data-demo='spring']");
    if (!root) return;
    var kIn = $("[data-p='k']", root), zIn = $("[data-p='z']", root);
    var kv = $("[data-p='kv']", root), zv = $("[data-p='zv']", root);
    var plot = $("[data-p='plot']", root), statsEl = $("[data-p='stats']", root);
    var ball = $("[data-p='ball']", root), track = $(".mop-track", root);
    var linBtn = $("[data-p='linear']", root), coarseBtn = $("[data-p='coarse']", root);
    var presets = $$("[data-preset]", root);
    var k = 219, z = 0.5, loop = 0, linStr = "";
    function travel() { return Math.max(40, (track.clientWidth - ball.offsetWidth - 8) * 0.55); }
    function placeGoal() { track.style.setProperty("--goal", (4 + travel() + ball.offsetWidth / 2 - 1).toFixed(1) + "px"); }
    function draw() {
      var coarse = pressed(coarseBtn);
      var s05 = springSettle(k, z, 0.005), s01 = springSettle(k, z, 0.01);
      var T = clamp(s05 * 1.25, 0.4, 8);
      var sim = springSim(k, z, T, coarse);
      var X0 = 30, X1 = 312, Y0 = 128, Y1 = 14, lo = -0.25, hi = 1.85;
      function px(t) { return X0 + (t / T) * (X1 - X0); }
      function py(x) { return Y0 - (clamp(x, lo, hi) - lo) / (hi - lo) * (Y0 - Y1); }
      var d = "";
      sim.pts.forEach(function (p, i) { d += (i ? "L" : "M") + px(p.t).toFixed(1) + "," + py(p.x).toFixed(1); });
      plot.innerHTML =
        '<path class="ax" d="M' + X0 + " " + Y0 + "H" + X1 + "M" + X0 + " " + Y1 + "V" + Y0 + '"/>' +
        '<path class="goal" d="M' + X0 + " " + py(1).toFixed(1) + "H" + X1 + '"/>' +
        '<text x="6" y="' + (py(1) + 3).toFixed(1) + '">1</text><text x="6" y="' + (py(0) + 3).toFixed(1) + '">0</text>' +
        '<text x="' + X0 + '" y="144">0</text><text x="' + (X1 - 30) + '" y="144">' + T.toFixed(2) + "s</text>" +
        '<path class="cv' + (sim.diverged ? " cv-bad" : "") + '" d="' + d + '"/>' +
        (sim.diverged ? '<text x="' + (X0 + 8) + '" y="26" fill="currentColor">发散了</text>' : "");
      var w = Math.sqrt(k), over = z < 1 ? Math.exp(-Math.PI * z / Math.sqrt(1 - z * z)) : 0;
      var D = Math.max(0.2, Math.ceil(s05 / 0.05 - 1e-9) * 0.05);
      var samples = springSim(k, z, D + 1e-6, false, 1 / 4800).pts;   /* 烤曲线按更细的步长积（接近解析解），画图那条照 card 的 1/240 */
      var vals = [];
      for (var i = 0; i < 29; i++) {
        var tt = D * i / 28, x = 0;
        for (var j = 1; j < samples.length; j++) { if (samples[j].t >= tt - 1e-9) { var p0 = samples[j - 1], p1 = samples[j], f = (tt - p0.t) / ((p1.t - p0.t) || 1); x = p0.x + (p1.x - p0.x) * f; break; } }
        vals.push(i === 28 ? 1 : x);
      }
      linStr = "transition: transform " + fmtNum(D) + "s linear(" + vals.map(fmtNum).join(",") + ");";
      linBtn.textContent = linStr;
      var cardDiff = "";
      if (Math.abs(k - 219) < 0.5 && Math.abs(z - 0.5) < 0.005) {
        var md = 0;
        vals.forEach(function (v, n) { md = Math.max(md, Math.abs(v - SPRING_POINTS[n])); });
        cardDiff = "<div><dt>和card那条比</dt><dd>逐点最大差" + md.toFixed(3) + "</dd></div>";
      }
      statsEl.innerHTML =
        "<div><dt>阻尼c = 2ζ√k</dt><dd>" + (2 * z * w).toFixed(1) + "</dd></div>" +
        "<div><dt>ω = √k</dt><dd>" + w.toFixed(1) + " rad/s · 周期" + (2 * Math.PI / w).toFixed(2) + "s</dd></div>" +
        "<div><dt>过冲</dt><dd>" + (over > 0.0005 ? pct(over, 1) : "无（临界或过阻尼）") + "</dd></div>" +
        "<div><dt>落定（±1%）</dt><dd>" + s01.toFixed(2) + "s</dd></div>" +
        "<div><dt>积分</dt><dd>" + (coarse ? "一步0.06秒" + (sim.diverged ? "：发散" : "：还没散") : "1/240秒细分") + "</dd></div>" + cardDiff;
    }
    function syncPresets() {
      presets.forEach(function (b) {
        var p = b.getAttribute("data-preset").split(",");
        setPressed(b, Math.abs(Number(p[0]) - k) < 0.5 && Math.abs(Number(p[1]) - z) < 0.005);
      });
    }
    function read() {
      k = Number(kIn.value);
      z = Number(zIn.value);
      kv.textContent = String(Math.round(k * 10) / 10);
      zv.textContent = z.toFixed(2);
      syncPresets();
      draw();
    }
    kIn.addEventListener("input", read);
    zIn.addEventListener("input", read);
    presets.forEach(function (b) {
      b.addEventListener("click", function () {
        var p = b.getAttribute("data-preset").split(",");
        kIn.value = p[0];
        zIn.value = p[1];
        read();
        if (Number(p[0]) < Number(kIn.min)) { k = Number(p[0]); kv.textContent = p[0]; syncPresets(); draw(); }
      });
    });
    toggle(coarseBtn, draw);
    linBtn.addEventListener("click", function () {
      /* 复制要接住失败：剪贴板被拒时不留未处理的 rejection，成功失败都播报（同 interaction.js 复制气泡） */
      if (window.StarShell && typeof StarShell.copy === "function") StarShell.copy(linStr).then(function () { announce("已复制linear()"); }, function () { announce("复制失败，请手动选择"); });
    });
    function go() {
      if (loop) { caf(loop); loop = 0; }
      placeGoal();
      var tr = travel(), coarse = pressed(coarseBtn);
      if (reduced() || !window.requestAnimationFrame) { ball.style.transform = "translateX(" + tr.toFixed(1) + "px)"; announce("减弱动效：直接到终点"); return; }
      var a = 0, v = 0, last = 0, c = 2 * z * Math.sqrt(k), t0 = 0, kk = k;
      function frame(t) {
        loop = 0;
        if (!t0) t0 = t;
        var dt = last ? Math.min(0.06, (t - last) / 1000) : 1 / 60;
        last = t;
        if (coarse) { v += (kk * (1 - a) - c * v) * 0.06; a += v * 0.06; }
        else { for (var left = dt; left > 0; left -= 1 / 240) { var h = Math.min(left, 1 / 240); v += (kk * (1 - a) - c * v) * h; a += v * h; } }
        var shown = clamp(a, -0.3, 2.2);
        ball.style.transform = "translateX(" + (shown * tr).toFixed(1) + "px)";
        var settled = Math.abs(a - 1) < 0.001 && Math.abs(v) < 0.01;
        var blown = !isFinite(a) || Math.abs(a) > 50;
        if (blown) { announce("发散了"); return; }
        if (!settled && t - t0 < 9000) loop = raf(frame);
        else ball.style.transform = "translateX(" + tr.toFixed(1) + "px)";
      }
      ball.style.transform = "translateX(0)";
      loop = raf(frame);
      announce("松手：刚度" + Math.round(k) + "，阻尼比" + z.toFixed(2));
    }
    $("[data-p='go']", root).addEventListener("click", go);
    window.addEventListener("resize", function () { placeGoal(); ball.style.transform = ""; });
    placeGoal();
    read();
  }

  /* ================================================================
   * 8 切明暗圆形揭开：三条曲线、面积图、两种「盖住了多少」
   * ================================================================ */
  var REVEAL = {
    now: { name: "现行", b: [.25, .5, .3, 1], css: "cubic-bezier(.25, .5, .3, 1)" },
    steep: { name: "先试的", b: [.32, .72, 0, 1], css: "cubic-bezier(.32, .72, 0, 1)" },
    linear: { name: "半径匀速", b: null, css: "linear" }
  };
  function revealFn(key) { var e = REVEAL[key]; return e.b ? bezier(e.b[0], e.b[1], e.b[2], e.b[3]) : function (x) { return clamp(x, 0, 1); }; }
  function segCenter(frame) {
    var seg = $(".mp .mp-seg", frame), fr = frame.getBoundingClientRect();
    if (!seg) return { x: fr.width / 2, y: 0 };
    var r = seg.getBoundingClientRect();
    return { x: r.left - fr.left + r.width / 2, y: r.top - fr.top + r.height / 2 };
  }
  function initReveal() {
    var root = $("[data-demo='reveal']");
    if (!root) return;
    var frame = $("[data-v='frame']", root);
    var plot = $("[data-v='plot']", root);
    var statsEl = $("[data-v='stats']", root);
    var slowBtn = $("[data-v='slow']", root);
    var R = makeReveal(frame);
    var key = "now", dot = null;
    var X0 = 30, X1 = 212, Y0 = 122, Y1 = 14;
    function draw() {
      var html = '<path class="ax" d="M' + X0 + " " + Y0 + "H" + X1 + "M" + X0 + " " + Y1 + "V" + Y0 + '"/>' +
        '<text x="4" y="' + (Y1 + 4) + '">100%</text><text x="14" y="' + (Y0 + 3) + '">0</text>' +
        '<text x="' + X0 + '" y="140">0</text><text x="' + (X1 - 34) + '" y="140">420ms</text>';
      Object.keys(REVEAL).forEach(function (k) {
        var f = revealFn(k), d = "";
        for (var i = 0; i <= 50; i++) { var t = i / 50, a = f(t) * f(t); d += (i ? "L" : "M") + (X0 + t * (X1 - X0)).toFixed(1) + "," + (Y0 - a * (Y0 - Y1)).toFixed(1); }
        html += '<path class="' + (k === key ? "cv" : "cv-alt") + '" d="' + d + '"/>';
      });
      var f = revealFn(key);
      [0.25, 0.5, 0.75].forEach(function (t) {
        var a = f(t) * f(t), x = X0 + t * (X1 - X0), y = Y0 - a * (Y0 - Y1);
        html += '<circle class="mk" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="3"/><text x="' + (x - 8).toFixed(1) + '" y="' + (y - 6).toFixed(1) + '">' + Math.round(a * 100) + "%</text>";
      });
      html += '<circle class="now" r="4" cx="' + X0 + '" cy="' + Y0 + '" data-v="dot"/>';
      plot.innerHTML = html;
      dot = $("[data-v='dot']", plot);
    }
    function stats(origin) {
      var f = revealFn(key), w = frame.clientWidth, h = frame.clientHeight;
      var x = origin ? origin.x : w / 2, y = origin ? origin.y : 0;
      var R0 = Math.sqrt(Math.pow(Math.max(x, w - x), 2) + Math.pow(Math.max(y, h - y), 2));
      var rows = [0.25, 0.5, 0.75].map(function (t) {
        var r = f(t);
        return "<div><dt>" + (t === 0.25 ? "1/4" : t === 0.5 ? "一半" : "3/4") + "时长</dt><dd>圆面积" + pct(r * r) + " · 这块屏盖住" + pct(coverage(r * R0, x, y, w, h)) + "</dd></div>";
      }).join("");
      statsEl.innerHTML = rows + "<div><dt>圆心</dt><dd>" + (origin ? Math.round(x) + ", " + Math.round(y) + "px" : "（还没点）") + "</dd></div>";
    }
    function go(origin, how) {
      var ms = 420 * (pressed(slowBtn) ? 4 : 1);
      var f = revealFn(key);
      stats(origin);
      R.run(origin, {
        ms: ms, ease: REVEAL[key].css,
        onFrame: function (t) {
          if (!dot) return;
          var a = f(t) * f(t);
          dot.setAttribute("cx", (X0 + t * (X1 - X0)).toFixed(1));
          dot.setAttribute("cy", (Y0 - a * (Y0 - Y1)).toFixed(1));
        },
        onDone: function (mode, instant) { if (instant) announce("减弱动效：直接切到" + (mode === "dark" ? "深色" : "浅色")); }
      });
      announce("示例小页面切到" + (R.mode() === "dark" ? "浅色" : "深色") + "，从" + how + "圆形揭开");
    }
    frame.addEventListener("click", function (e) {
      var r = frame.getBoundingClientRect();
      go({ x: e.clientX - r.left, y: e.clientY - r.top }, "点击点");
    });
    $("[data-v='go']", root).addEventListener("click", function () { go(segCenter(frame), "主题控件中心"); });
    radios($(".mo-seg", root), function (b) { key = b.getAttribute("data-ease"); draw(); stats(null); });
    toggle(slowBtn, function () {});
    draw();
    stats(null);
  }

  /* ================================================================
   * 9 切页进场：侧栏不动 / 整页一起淡；跨页过渡；file:// 下的两个坑
   * ================================================================ */
  var PAGES = [
    { t: "色彩", p: "玻璃风色板、强调色两档、光晕（示例）。" },
    { t: "交互", p: "筛选标签、按压倾斜、六种弹窗（示例）。" },
    { t: "动画", p: "曲线与时长、FLIP、减弱动效（示例）。" }
  ];
  function initPage() {
    var root = $("[data-demo='page']");
    if (!root) return;
    var frame = $("[data-g='frame']", root);
    var list = $("[data-g='log']", root);
    var vtBtn = $("[data-g='vt']", root), hashBtn = $("[data-g='hash']", root);
    var segs = $$(".mo-seg", root);
    var mode = "main", bug = "none", cur = 0, running = [];
    var navs = PAGES.map(function (p, i) { return '<button type="button" class="mg-nav" data-n="' + i + '"' + (i === 0 ? ' aria-current="page"' : "") + ">" + p.t + "</button>"; }).join("");
    frame.innerHTML = '<div class="mg"><div class="mg-side" data-g="side"><span class="mg-brand" aria-hidden="true"></span>' + navs + '</div><div class="mg-main" data-g="main"></div></div>';
    var win = $(".mg", frame), side = $("[data-g='side']", frame), main = $("[data-g='main']", frame);
    function page(i) {
      var d = doc.createElement("div");
      d.className = "mg-page";
      d.innerHTML = '<b class="mg-title">' + PAGES[i].t + "</b><p>" + PAGES[i].p + '</p><div class="mg-cards" aria-hidden="true"><span class="mg-card"></span><span class="mg-card"></span><span class="mg-card"></span><span class="mg-card"></span></div>';
      return d;
    }
    main.appendChild(page(0));
    function log(t, cls) { logTo(list, t, cls, 4); }
    function stopAll() {
      running.forEach(function (a) { try { a.cancel(); } catch (e) { /* 已结束 */ } });
      running = [];
      $$(".mg-page", main).slice(0, -1).forEach(function (el) { el.parentNode.removeChild(el); });
    }
    function go(i) {
      if (i === cur) return;
      cur = i;
      $$(".mg-nav", side).forEach(function (b, n) { if (n === i) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
      stopAll();
      var oldPage = $(".mg-page", main), next = page(i);
      var hash = pressed(hashBtn), vt = pressed(vtBtn);
      var name = "切到「" + PAGES[i].t + "」：";
      if (reduced() || !canAnimate) { main.replaceChild(next, oldPage); log(name + "减弱动效，直接换，没有进场。"); return; }
      if (mode === "all") {
        main.replaceChild(next, oldPage);
        running.push(win.animate([{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }], { duration: 260, easing: EASE_OUT }));
        log(name + "整页一起淡入，侧栏也跟着闪了一下（反例）。", "is-warn");
        return;
      }
      var inKf = [{ opacity: 0, transform: (hash && !vt) ? "none" : "translateY(8px)" }, { opacity: 1, transform: "none" }];
      if (!vt) {
        main.replaceChild(next, oldPage);
        running.push(next.animate(inKf, { duration: 260, easing: EASE_OUT, fill: "backwards" }));
        log(name + "只有CSS进场（lite档的样子）：正文260ms" + (hash ? "只淡入、不上移（带#锚点，落点不偏8px）" : "淡入上移8px") + "，侧栏不动。");
        return;
      }
      if (bug === "abort") {
        main.replaceChild(next, oldPage);
        log(name + "过渡被中止：新页判开关时外部样式表还没到，一下就换了；控制台留一条InvalidStateError（示意）。", "is-bad");
        return;
      }
      main.appendChild(next);
      var aOut = oldPage.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: EASE_IN, fill: "forwards" });
      running.push(aOut, next.animate(inKf, { duration: 260, easing: EASE_OUT, fill: "backwards" }));
      settle(aOut, 320, function () { if (oldPage.parentNode) oldPage.parentNode.removeChild(oldPage); });
      if (bug === "noside") {
        running.push(side.animate([{ opacity: 1 }, { opacity: 0, offset: 0.77 }, { opacity: 0 }], { duration: 260, easing: "linear" }));
        log(name + "首帧早于侧栏：新画面里没有侧栏，旧侧栏淡出、过渡完新侧栏才冒出来。", "is-bad");
      } else {
        log(name + "跨页过渡：侧栏起了名、原地不动；旧页200ms淡出，新页260ms淡入上移8px" + (hash ? "（带#锚点也照常上移：位移在快照上，不影响落点）" : "") + "。", "is-ok");
      }
    }
    side.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest(".mg-nav") : null;
      if (b) { go(Number(b.getAttribute("data-n"))); announce("示例窗口切到" + PAGES[cur].t); }
    });
    radios(segs[0], function (b) { mode = b.getAttribute("data-pg"); });
    radios(segs[1], function (b) { bug = b.getAttribute("data-bug"); });
    toggle(vtBtn, function () {});
    toggle(hashBtn, function () {});
  }

  /* ================================================================
   * 10 整页过渡跳过条件：四个条件摆好，切一下看走哪条
   * ================================================================ */
  function initSkip() {
    var root = $("[data-demo='skip']");
    if (!root) return;
    var frame = $("[data-k='frame']", root);
    var verdict = $("[data-k='verdict']", root);
    var rm = $("[data-k='rm']", root), hid = $("[data-k='hidden']", root), nos = $("[data-k='nosupport']", root);
    var R = makeReveal(frame);
    var tier = "full";
    radios($(".mo-seg", root), function (b) { tier = b.getAttribute("data-tier"); });
    [rm, hid, nos].forEach(function (b) { toggle(b, function () {}); });
    function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]; }); }
    $("[data-k='go']", root).addEventListener("click", function () {
      var why = [];
      if (pressed(nos)) why.push("浏览器没有startViewTransition");
      if (pressed(rm)) why.push("开了减弱动效");
      if (tier === "unknown") why.push("自动档还没测过显卡：先按lite（误判成full的代价是没显卡那台卡一下）");
      else if (tier !== "full") why.push("模糊档位是" + tier + "（没显卡，或者关了模糊）");
      if (pressed(hid)) why.push("页面在后台（浏览器本来也会跳过，还会让ready走reject）");
      var origin = segCenter(frame);
      if (why.length) {
        R.run(origin, { instant: true });
        verdict.innerHTML = '<b class="is-skip">直接切</b>：' + esc(why.join("；")) + "。换色照样发生，只是不拍快照。跨页那两侧在pageswap / pagereveal里调skipTransition()，三个promise先接住。";
        announce("直接切：" + why[0]);
      } else if (reduced() || !canAnimate) {
        R.run(origin, { instant: true });
        verdict.innerHTML = "<b>四个条件都过了</b>，可你的系统本身开着减弱动效，所以这里也直接切。";
        announce("系统开着减弱动效，直接切");
      } else {
        R.run(origin, { ms: 420, ease: REVEAL.now.css });
        verdict.innerHTML = "<b>圆形揭开</b>：full档、没开减弱动效、页面看得见、支持startViewTransition，四个都过了，从主题控件那一点420ms揭开。跨页时挂vt-nav，侧栏原地不动。";
        announce("圆形揭开");
      }
    });
  }

  /* ================================================================
   * 11 小屋：手写开场（描边 + 遮罩两条动画；五种跳过）
   * ================================================================ */
  function initIntro() {
    var root = $("[data-demo='intro']");
    if (!root) return;
    var stage = $("[data-w='stage']", root);
    var intro = $("[data-w='intro']", root);
    var text = $("[data-w='text']", root);
    var mask = $("[data-w='mask']", root);
    var hall = $(".mow-hall", root);
    var head = $("[data-w='head']", root);
    var line = $(".mow-line", root);
    var out = $("[data-w='out']", root);
    var badBtn = $("[data-w='bad']", root);
    var gen = 0, playing = false, leaving = false, timers = [], loop = 0, t0 = 0, started = false;
    intro.hidden = true;
    function clear() { timers.forEach(clearTimeout); timers = []; if (loop) { caf(loop); loop = 0; } }
    function measure() {
      try {
        text.removeAttribute("transform");
        var b = text.getBBox();
        var dy = 130 - (b.y + b.height / 2);
        if (Math.abs(dy) > 0.5) text.setAttribute("transform", "translate(0," + dy.toFixed(1) + ")");
        mask.style.setProperty("--sx", (b.x - 10) + "px");
        mask.style.setProperty("--sw", (b.width + 34) + "px");
        text.style.setProperty("--len", String(Math.round((b.width + b.height) * 2.2)));
      } catch (e) { /* 量不到就用 CSS 里的默认值 */ }
    }
    function headAt(t) { head.style.transform = "translateX(" + (clamp(t / 2800, 0, 1) * line.clientWidth).toFixed(1) + "px)"; }
    function tick() {
      loop = 0;
      var t = now() - t0;
      headAt(t);
      if (playing && t < 2800) loop = raf(tick);
    }
    function finish(skipped, how) {
      if (!playing || leaving) return;
      leaving = true;
      var my = gen;
      if (skipped) intro.classList.add("is-fast");
      intro.classList.add("is-out");
      hall.classList.remove("is-settle");
      void hall.offsetWidth;
      hall.classList.add("is-settle");
      var at = ((now() - t0) / 1000).toFixed(2);
      timers.push(setTimeout(function () {
        if (my !== gen) return;
        intro.hidden = true;
        playing = false;
        if (loop) { caf(loop); loop = 0; }
        headAt(skipped ? (now() - t0) : 2800);
      }, skipped ? 300 : 560));
      out.textContent = skipped ? "跳过（" + how + "）：在" + at + "秒处收起，走0.26秒快速淡出。" : "播完：2.35秒起淡出，2.8秒收起，门厅跟着浮上来落定。";
      announce(skipped ? "开场跳过：" + how : "开场播完");
    }
    function play() {
      gen += 1;
      var my = gen;
      clear();
      playing = false;
      leaving = false;
      if (reduced()) {
        intro.hidden = true;
        hall.classList.remove("is-settle");
        out.textContent = "减弱动效：开场整段不渲染（原物就是这样），门厅直接露出来。";
        announce(out.textContent);
        return;
      }
      intro.className = "mow-intro";
      intro.hidden = false;
      hall.classList.remove("is-settle");
      headAt(0);
      started = false;
      function start() {
        if (started || my !== gen) return;
        started = true;
        measure();
        void intro.offsetWidth;
        intro.classList.add("is-play");
        if (pressed(badBtn)) intro.classList.add("is-bad");
        playing = true;
        t0 = now();
        loop = raf(tick);
        timers.push(setTimeout(function () { if (my === gen) finish(false); }, 2350));
        out.textContent = pressed(badBtn) ? "在播（反例：遮罩0.5秒就拉完了，后面的字还没轮到，笔画先露头）…" : "在播：0.12秒起笔，1.75秒写完…";
      }
      /* 字体门控：等 fonts.ready，1200ms 兜底 */
      if (doc.fonts && doc.fonts.ready) { doc.fonts.ready.then(start, start); timers.push(setTimeout(start, 1200)); }
      else start();
    }
    $("[data-w='play']", root).addEventListener("click", play);
    toggle(badBtn, function () {});
    /* 五种跳过：点击、Esc、回车、空格，以及滚动意图（滚轮、触摸滑动、↓↑PgDn PgUp Home End）。
       滚轮与触摸一律 passive、不拦；空格和回车落在聚焦的样框上会滚动页面 / 触发别的，这里拦下（演示框不是整页遮罩） */
    stage.addEventListener("click", function () { if (playing && !leaving) finish(true, "点击"); });
    stage.addEventListener("wheel", function () { if (playing && !leaving) finish(true, "滚轮"); }, { passive: true });
    stage.addEventListener("touchmove", function () { if (playing && !leaving) finish(true, "触摸滑动"); }, { passive: true });
    stage.addEventListener("keydown", function (e) {
      if (composing(e)) return;
      if (!playing || leaving) return;
      var k = e.key;
      if (k === "Escape") finish(true, "Esc");
      else if (k === "Enter" || k === " ") { e.preventDefault(); finish(true, k === " " ? "空格" : "回车"); }
      else if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End"].indexOf(k) >= 0) finish(true, "滚动键" + k);
    });
    var seen = false;
    watch(stage, function (v) { if (v && !seen) { seen = true; play(); } }, 0.5);
  }

  /* ================================================================
   * 12 小屋：洇一层纸（对照被否的两扇门，示意）
   * ================================================================ */
  var ROOMS = [
    '<span class="xw-kai">小屋</span><p>门没锁，随便逛（示例）</p>',
    '<span class="xw-kai">工具架</span><div class="moe-row"><span></span><span></span><span></span></div>',
    '<span class="xw-kai">随笔本</span><p>想到什么写什么（示例）</p><div class="moe-row"><span></span><span></span></div>'
  ];
  var ROOM_NAME = ["小屋", "工具", "随笔"];
  function initVeil() {
    var root = $("[data-demo='veil']");
    if (!root) return;
    var main = $("[data-e='main']", root);
    var veil = $("[data-e='veil']", root), wash = $(".moe-wash", veil), rim = $(".moe-rim", veil);
    var door = $("[data-e='door']", root), leafL = $(".moe-leaf-l", door), leafR = $(".moe-leaf-r", door);
    var out = $("[data-e='out']", root);
    var slowBtn = $("[data-e='slow']", root);
    var navBtns = $$(".moe-bar button", root);
    var cur = 0, busy = false, tr = "veil", anims = [];
    main.innerHTML = ROOMS[0];
    function render(i) { main.innerHTML = ROOMS[i]; }
    function track(a) { anims.push(a); return a; }
    function cleanup() { anims.forEach(function (a) { try { a.cancel(); } catch (e) { /* 已结束 */ } }); anims = []; veil.classList.remove("is-on"); door.classList.remove("is-on"); busy = false; }
    function go(i) {
      if (busy || i === cur) return;
      cur = i;
      navBtns.forEach(function (b, n) { if (n === i) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); });
      if (reduced() || !canAnimate) { render(i); out.textContent = "减弱动效：不播转场，直接换（原物也是这样）。"; announce("换到" + ROOM_NAME[i]); return; }
      busy = true;
      var k = pressed(slowBtn) ? 3 : 1;
      if (tr === "veil") {
        veil.classList.add("is-on");
        var grow = [{ transform: "scale(.01)" }, { transform: "scale(1)" }];
        var w1 = track(wash.animate(grow, { duration: 550 * k, easing: "cubic-bezier(.3, 0, .16, 1)", fill: "both" }));
        track(rim.animate(grow, { duration: 550 * k, delay: 50 * k, easing: "cubic-bezier(.34, 0, .22, 1)", fill: "both" }));
        track(main.animate([{ opacity: 1, transform: "none" }, { opacity: 0.45, transform: "scale(.985)" }], { duration: 550 * k, easing: EASE_IN, fill: "both" }));
        out.textContent = "洇开" + 550 * k + "ms：纸色从中间洇开，颜料边晚" + 50 * k + "ms，旧房间退到.45、缩到.985…";
        settle(w1, 550 * k + 120, function () {
          anims.forEach(function (a) { if (a !== w1) { try { a.cancel(); } catch (e) { /* 已结束 */ } } });
          render(i);
          var dry = [{ transform: "scale(1)", opacity: 1 }, { transform: "scale(1.06)", opacity: 0 }];
          var o1 = track(wash.animate(dry, { duration: 600 * k, easing: "cubic-bezier(.3, .1, .3, 1)", fill: "both" }));
          track(rim.animate(dry, { duration: 600 * k, easing: "cubic-bezier(.3, .1, .3, 1)", fill: "both" }));
          try { w1.cancel(); } catch (e) { /* 已结束 */ }
          out.textContent = "纸下换到「" + ROOM_NAME[i] + "」，纸" + 600 * k + "ms干去（scale 1→1.06、opacity 1→0）。";
          settle(o1, 600 * k + 120, cleanup);
        });
      } else {
        door.classList.toggle("is-lattice", tr === "lattice");
        door.classList.add("is-on");
        var c1 = track(leafL.animate([{ transform: "translateX(-100%)" }, { transform: "none" }], { duration: 450 * k, easing: EASE_STD, fill: "both" }));
        track(leafR.animate([{ transform: "translateX(100%)" }, { transform: "none" }], { duration: 450 * k, easing: EASE_STD, fill: "both" }));
        track(main.animate([{ opacity: 1, transform: "none" }, { opacity: 0.6, transform: "scale(1.03)" }], { duration: 450 * k, easing: EASE_IN, fill: "both" }));
        out.textContent = (tr === "door" ? "被否的双开门板" : "被否的纸色格心门") + "（示意）：合门" + 450 * k + "ms…";
        settle(c1, 450 * k + 120, function () {
          anims.forEach(function (a) { try { a.cancel(); } catch (e) { /* 已结束 */ } });
          anims = [];
          render(i);
          var o1 = track(leafL.animate([{ transform: "none", opacity: 1 }, { transform: "rotateY(-100deg)", opacity: 0 }], { duration: 750 * k, easing: EASE_OUT, fill: "both" }));
          track(leafR.animate([{ transform: "none", opacity: 1 }, { transform: "rotateY(100deg)", opacity: 0 }], { duration: 750 * k, easing: EASE_OUT, fill: "both" }));
          out.textContent = "门后换到「" + ROOM_NAME[i] + "」，开门" + 750 * k + "ms、铰链在外侧朝人外摆。屋主裁定：不够优雅——转场造了一个新物件。";
          settle(o1, 750 * k + 120, cleanup);
        });
      }
      announce("换到" + ROOM_NAME[i]);
    }
    navBtns.forEach(function (b, n) { b.addEventListener("click", function () { go(n); }); });
    radios($(".mo-seg", root), function (b) { tr = b.getAttribute("data-tr"); });
    toggle(slowBtn, function () {});
  }

  /* ================================================================
   * 13 小屋：走进小屋（定时5秒 / 擦洗 / 播放头叠 ease-in-out）
   * ================================================================ */
  function rush(t) { return (1 - Math.exp(-3 * t)) / (1 - Math.exp(-3)); }
  function p1in(t) { return t * t; }
  function p1out(t) { return 1 - (1 - t) * (1 - t); }
  function sineOut(t) { return Math.sin(t * Math.PI / 2); }
  function inOut(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }   /* power2.inOut */
  function initWalk() {
    var root = $("[data-demo='walk']");
    if (!root) return;
    var stage = $("[data-k2='stage']", root);
    var card = $("[data-k2='card']", root), room = $("[data-k2='room']", root), wash = $("[data-k2='wash']", root);
    var plot = $("[data-k2='plot']", root), statsEl = $("[data-k2='stats']", root), out = $("[data-k2='out']", root);
    var PLAY = 5000, S1 = 3.4, STEP = 0.085;
    var mode = "timed", h = 0, dir = 0, target = 0, loop = 0, last = 0, startAt = 0, cursor = null;
    function visual() { return mode === "eased" ? inOut(h) : h; }
    function pose(p) {
      var W = stage.clientWidth, H = stage.clientHeight;
      var cw = W * 0.62, ch = cw / 1.8348, cl = W * 0.19, ct = H * 0.31;
      var doorX = cl + cw * 0.75, doorY = ct + ch * 0.62;
      var r, s;
      if (p <= 0.17) { r = rush(p / 0.17); s = Math.pow(S1, r); }
      else { r = 1; s = S1 * (1 + 0.18 * clamp((p - 0.17) / 0.13, 0, 1)); }
      card.style.transform = "translate(" + ((W / 2 - doorX) * r).toFixed(1) + "px," + ((H / 2 - doorY) * r).toFixed(1) + "px) scale(" + s.toFixed(4) + ")";
      card.style.opacity = p < 0.30 ? "1" : "0";
      var g = p < 0.17 ? 0 : p < 0.30 ? p1in((p - 0.17) / 0.13) : 1;
      var wo = p < 0.31 ? 1 : p < 0.39 ? 1 - p1out((p - 0.31) / 0.08) : 0;
      wash.style.transform = "scale(" + g.toFixed(4) + ")";
      wash.style.opacity = String(wo.toFixed(3));
      var q = clamp((p - 0.31) / 0.69, 0, 1), so = sineOut(q);
      room.style.opacity = p >= 0.30 ? "1" : "0";
      room.style.transform = "translateY(" + ((1 - so) * 8).toFixed(2) + "%) scale(" + (1.5 - 0.5 * so).toFixed(4) + ")";
    }
    function phase(p) { return p <= 0 ? "顶上：门厅名片" : p < 0.17 ? "画放大" : p < 0.30 ? "推近、纸从门那一点洇开" : p < 0.31 ? "纸底下穿门" : p < 0.39 ? "纸干去、进屋" : p < 1 ? "屋里那一段" : "墙角，页面到底"; }
    /* 进度随时间：三种走法各画一条（擦洗按「每0.42秒滚一格、140ms 阻尼」画） */
    var X0 = 26, X1 = 212, Y0 = 122, Y1 = 14;
    function curveOf(m) {
      var pts = [], i, t;
      if (m === "scrub") {
        var p = 0, tg = 0, dt = 1 / 60;
        for (t = 0; t <= 5.0001; t += dt) {
          if (Math.floor(t / 0.42) > Math.floor((t - dt) / 0.42) && t > 0) tg = Math.min(1, tg + STEP);
          p += (tg - p) * (1 - Math.exp(-dt * 1000 / 140));
          pts.push([t, p]);
        }
      } else {
        for (i = 0; i <= 100; i++) { t = i / 100; pts.push([t * 5, m === "eased" ? inOut(t) : t]); }
      }
      return pts.map(function (q, n) { return (n ? "L" : "M") + (X0 + q[0] / 5 * (X1 - X0)).toFixed(1) + "," + (Y0 - q[1] * (Y0 - Y1)).toFixed(1); }).join("");
    }
    function drawPlot() {
      var html = '<path class="ax" d="M' + X0 + " " + Y0 + "H" + X1 + "M" + X0 + " " + Y1 + "V" + Y0 + '"/>' +
        '<text x="2" y="' + (Y1 + 4) + '">墙角</text><text x="2" y="' + (Y0 + 3) + '">顶上</text><text x="' + X0 + '" y="140">0</text><text x="' + (X1 - 14) + '" y="140">5s</text>';
      ["timed", "eased", "scrub"].forEach(function (m) { if (m !== mode) html += '<path class="cv-alt" d="' + curveOf(m) + '"/>'; });
      html += '<path class="cv" d="' + curveOf(mode) + '"/><circle class="now" r="4" cx="' + X0 + '" cy="' + Y0 + '" data-k2="dot"/>';
      plot.innerHTML = html;
      cursor = $("[data-k2='dot']", plot);
    }
    /* 起播后多久画面动出看得见的一点：卡片放大到 1.03 倍 */
    function firstMove(m) {
      for (var t = 0; t <= 2; t += 0.001) {
        var hh = t / 5, p = m === "eased" ? inOut(hh) : hh;
        if (Math.pow(S1, rush(Math.min(p, 0.17) / 0.17)) >= 1.03) return t;
      }
      return 2;
    }
    statsEl.innerHTML = "<div><dt>起播后放大到1.03倍</dt><dd>定时" + firstMove("timed").toFixed(3) + "秒 · 叠ease-in-out " + firstMove("eased").toFixed(2) + "秒</dd></div>" +
      "<div><dt>擦洗一格</dt><dd>8.5%，顶上到墙角12格</dd></div><div><dt>现在</dt><dd data-k2=\"now\">p=0.00 · 顶上</dd></div>";
    var nowEl = $("[data-k2='now']", statsEl);
    function showNow(p, tsec) {
      nowEl.textContent = "p=" + p.toFixed(2) + " · " + phase(p);
      if (cursor) {
        var tt = mode === "scrub" ? clamp(tsec, 0, 5) : h * 5;
        cursor.setAttribute("cx", (X0 + tt / 5 * (X1 - X0)).toFixed(1));
        cursor.setAttribute("cy", (Y0 - p * (Y0 - Y1)).toFixed(1));
      }
    }
    function frame(t) {
      loop = 0;
      var dt = last ? Math.min(64, t - last) : 16;
      last = t;
      var moving = false;
      if (mode === "scrub") {
        h += (target - h) * (1 - Math.exp(-dt / 140));
        if (Math.abs(target - h) < 0.0005) h = target; else moving = true;
      } else if (dir) {
        h = clamp(h + dir * dt / PLAY, 0, 1);
        if ((dir > 0 && h >= 1) || (dir < 0 && h <= 0)) { dir = 0; out.textContent = h >= 1 ? "到墙角了：页面到底，停稳。" : "回到顶上：门厅名片，一像素不变。"; announce(out.textContent); }
        else moving = true;
      }
      var p = visual();
      pose(p);
      showNow(p, (t - startAt) / 1000);
      if (moving && !doc.hidden) loop = raf(frame);
      else { last = 0; heavy.release("walk"); }
    }
    function kick() {
      if (loop) return;
      heavy.claim("walk");
      last = 0;
      loop = raf(frame);
    }
    function down() {
      if (reduced()) { h = target = 1; dir = 0; pose(visual()); showNow(visual(), 5); out.textContent = "减弱动效：原物没有跑道（静态档），这里直接跳到墙角。"; announce(out.textContent); return; }
      if (mode === "scrub") {
        if (target >= 1) { out.textContent = "墙角往下：没有路了，交给原生滚动。"; return; }
        if (h <= 0 && target <= 0) startAt = now();
        target = Math.min(1, target + STEP);
        out.textContent = "滚一格：进度+8.5%，过140ms阻尼——一格一格地顿。";
        kick();
        return;
      }
      if (h >= 1) { out.textContent = "墙角往下：没有路了，交给原生滚动。"; return; }
      if (dir > 0) { out.textContent = "播放中再往下：不理，不加速、不打断。"; return; }
      if (dir < 0) { dir = 1; out.textContent = "倒放中往下：再反过来，接着往墙角走。"; announce(out.textContent); kick(); return; }
      dir = 1;
      startAt = now() - h * PLAY;
      out.textContent = mode === "eased" ? "起播（反例：播放头叠了ease-in-out，起步要慢一拍才看得出在动）…" : "起播：固定5秒，和滚多快、滚几下无关。";
      announce("起播");
      kick();
    }
    function up() {
      if (reduced()) { h = target = 0; dir = 0; pose(0); showNow(0, 0); out.textContent = "减弱动效：直接回到顶上。"; return; }
      if (mode === "scrub") {
        if (target <= 0) { out.textContent = "顶上往上：没有路了，交给原生滚动。"; return; }
        target = Math.max(0, target - STEP);
        out.textContent = "往回滚一格：进度−8.5%。";
        kick();
        return;
      }
      if (h <= 0) { out.textContent = "顶上往上：没有路了，交给原生滚动。"; return; }
      if (dir < 0) { out.textContent = "倒放中再往上：不理。"; return; }
      dir = -1;
      out.textContent = "往上：从这一帧（p=" + visual().toFixed(2) + "）原路倒放，还要" + (h * 5).toFixed(2) + "秒。";
      announce("从这一帧原路倒放");
      kick();
    }
    $("[data-k2='down']", root).addEventListener("click", down);
    $("[data-k2='up']", root).addEventListener("click", up);
    /* 原物一次 preventDefault 都没有（靠锁住滚动挡）；演示框锁不了整页，就在样框里把滚轮和方向键拦下，免得页面滚走 */
    var acc = 0;
    stage.addEventListener("wheel", function (e) {
      e.preventDefault();
      if (mode === "scrub") {
        acc += e.deltaY;
        while (acc >= 60) { acc -= 100; down(); }
        while (acc <= -60) { acc += 100; up(); }
      } else if (e.deltaY > 0) down(); else if (e.deltaY < 0) up();
    }, { passive: false });
    stage.addEventListener("keydown", function (e) {
      if (composing(e)) return;
      var k = e.key;
      if (k === "ArrowDown" || k === "PageDown" || k === " " || k === "End") { e.preventDefault(); down(); }
      else if (k === "ArrowUp" || k === "PageUp" || k === "Home") { e.preventDefault(); up(); }
    });
    radios($(".mo-seg", root), function (b) {
      var m = b.getAttribute("data-walk");
      if (loop) { caf(loop); loop = 0; heavy.release("walk"); }
      var p = visual();
      mode = m;
      dir = 0;
      h = target = (m === "eased") ? p : p;   /* 换走法时停在原处 */
      if (m === "eased") { /* 反解：让画面不跳 */ var lo = 0, hi = 1; for (var i = 0; i < 30; i++) { var mid = (lo + hi) / 2; if (inOut(mid) < p) lo = mid; else hi = mid; } h = target = (lo + hi) / 2; }
      drawPlot();
      pose(visual());
      showNow(visual(), 0);
    });
    heavy.register("walk", function () { if (loop) { caf(loop); loop = 0; } dir = 0; }, function () {});
    window.addEventListener("resize", function () { pose(visual()); });
    drawPlot();
    pose(0);
  }

  /* ================================================================
   * 14 小屋：擦洗两条教训（窗口交叠 / 擦洗曲线）
   * ================================================================ */
  function smooth(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function easeOut3(t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); }
  function initScrub() {
    var root = $("[data-demo='scrub']");
    if (!root) return;
    var range = $("[data-u='p']", root), pv = $("[data-u='pv']", root);
    var w0 = $("[data-u='w0']", root), w1 = $("[data-u='w1']", root), fout = $("[data-u='fout']", root);
    var dots = [0, 1, 2].map(function (i) { return $("[data-u='d" + i + "']", root); });
    var vals = [0, 1, 2].map(function (i) { return $("[data-u='v" + i + "']", root); });
    var live = $("[data-u='live']", root);
    var FN = [smooth, easeOut3, function (t) { return clamp(t, 0, 1); }];
    var NAMES = ["smoothstep", "ease-out", "linear"];
    var win = "seq";
    function update() {
      var p = Number(range.value) / 1000;
      pv.textContent = pct(p, 1);
      var a, b;
      if (win === "seq") { a = 1 - smooth((p - 0.3) / 0.2); b = smooth((p - 0.5) / 0.2); }
      else { a = 1 - smooth((p - 0.25) / 0.5); b = smooth((p - 0.25) / 0.5); }
      w0.style.opacity = a.toFixed(3);
      w1.style.opacity = b.toFixed(3);
      var both = a > 0.08 && b > 0.08;
      fout.textContent = "工具架" + a.toFixed(2) + "　随笔本" + b.toFixed(2) + (both ? "　——两段同时在，叠成双重曝光" : win === "seq" ? "　——首尾相接，任何时刻只有一段" : "");
      dots.forEach(function (d, i) {
        var tr = d.parentNode.clientWidth - d.offsetWidth - 6;
        var v = FN[i](p);
        d.style.setProperty("--x", (v * tr).toFixed(1) + "px");
        vals[i].textContent = pct(v, 1);
      });
    }
    range.addEventListener("input", update);
    $("[data-u='step']", root).addEventListener("click", function () {
      var before = Number(range.value) / 1000;
      range.value = String(Math.min(1000, Number(range.value) + 85));
      var after = Number(range.value) / 1000;
      update();
      var msg = "滚一格（+8.5%）：" + NAMES.map(function (n, i) { return n + "走了" + pct(FN[i](after) - FN[i](before), 1); }).join("，") + "。";
      live.textContent = msg;
      announce(msg);
    });
    $("[data-u='reset']", root).addEventListener("click", function () { range.value = "0"; update(); });
    radios($(".mo-seg", root), function (b) { win = b.getAttribute("data-win"); update(); });
    window.addEventListener("resize", update);
    update();
  }

  /* ================================================================
   * 15 小屋：卡片跟指针侧过来（rAF 里按 55ms 时间常数跟）
   * ================================================================ */
  function initTilt() {
    var root = $("[data-demo='tilt']");
    if (!root) return;
    var stage = $("[data-t='stage']", root);
    var set = $("[data-t='set']", root), vine = $("[data-t='vine']", root), pot = $("[data-t='pot']", root), dotEl = $("[data-t='dot']", root);
    var out = $("[data-t='out']", root);
    var shadow = doc.createElement("span");
    shadow.className = "mot-shadow";
    set.insertBefore(shadow, set.firstChild);
    var P = { now: { ry: 2.8, rx: 1.9, per: 900, vine: 6, pot: -8 }, v1: { ry: 1.6, rx: 1.1, per: 1200, vine: 6, pot: -8 }, flip: { ry: 2.8, rx: 1.9, per: 900, vine: -20, pot: 8 } };
    var cfg = P.now, tx = 0, ty = 0, cx = 0, cy = 0, loop = 0, last = 0, rest = null, lastOut = 0, drag = null;
    function k() { return set.offsetWidth / 710; }
    function measureRest() {
      var a = cx, b = cy;
      cx = cy = 0; apply();
      var s = set.getBoundingClientRect(), p = pot.getBoundingClientRect(), v = vine.getBoundingClientRect();
      rest = { sl: s.left, sr: s.right, pl: p.left, vl: v.left };
      cx = a; cy = b; apply();
    }
    function apply() {
      var kk = k();
      stage.style.perspective = (cfg.per * kk).toFixed(0) + "px";
      if (reduced()) { set.style.transform = vine.style.transform = pot.style.transform = shadow.style.transform = ""; return; }
      set.style.transform = "rotateY(" + (cx * cfg.ry).toFixed(3) + "deg) rotateX(" + (cy * -cfg.rx).toFixed(3) + "deg)";
      pot.style.transform = "translate3d(" + (cx * cfg.pot * kk).toFixed(2) + "px," + (cy * -5 * kk).toFixed(2) + "px,0)";
      vine.style.transform = "translate3d(" + (cx * cfg.vine * kk).toFixed(2) + "px," + (cy * 3 * kk).toFixed(2) + "px,0)";
      shadow.style.transform = "translate3d(" + (cx * -9 * kk).toFixed(2) + "px," + (cy * 5 * kk).toFixed(2) + "px,0)";
      dotEl.style.transform = "translate(" + (tx * stage.clientWidth / 2).toFixed(1) + "px," + (ty * stage.clientHeight / 2).toFixed(1) + "px)";
    }
    function report(force) {
      var t = now();
      if (!force && t - lastOut < 150) return;
      lastOut = t;
      if (reduced()) { out.textContent = "减弱动效：不倾斜（变量默认0，原样）。"; return; }
      if (!rest) measureRest();
      var s = set.getBoundingClientRect(), p = pot.getBoundingClientRect(), v = vine.getBoundingClientRect();
      out.textContent = "指针x=" + tx.toFixed(2) + "、y=" + ty.toFixed(2) + "：卡片左缘挪" + (s.left - rest.sl).toFixed(1) + "px、右缘" + (s.right - rest.sr).toFixed(1) +
        "px；盆栽" + (p.left - rest.pl).toFixed(1) + "px；垂柳" + (v.left - rest.vl).toFixed(1) + "px（这块样框里卡宽" + Math.round(set.offsetWidth) + "px）。";
    }
    function frame(t) {
      loop = 0;
      var dt = last ? Math.min(t - last, 100) : 16.7;
      last = t;
      var f = 1 - Math.exp(-dt / 55);
      cx += (tx - cx) * f;
      cy += (ty - cy) * f;
      var settled = Math.abs(tx - cx) < 0.0008 && Math.abs(ty - cy) < 0.0008;
      if (settled) { cx = tx; cy = ty; }
      apply();
      report(settled);
      if (!settled && !doc.hidden) loop = raf(frame); else last = 0;
    }
    function kick() { if (reduced()) { apply(); report(true); return; } if (!loop) { last = 0; loop = raf(frame); } }
    function aim(clientX, clientY) {
      var r = stage.getBoundingClientRect();
      tx = clamp((clientX - r.left) / r.width * 2 - 1, -1, 1);
      ty = clamp((clientY - r.top) / r.height * 2 - 1, -1, 1);
      kick();
    }
    stage.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch" && !drag) return;
      stage.classList.remove("is-keys");
      aim(e.clientX, e.clientY);
    });
    stage.addEventListener("pointerleave", function (e) { if (e.pointerType !== "touch") { tx = ty = 0; kick(); } });
    stage.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "touch") return;
      drag = e.pointerId;
      stage.classList.add("is-dragging");
      aim(e.clientX, e.clientY);
    });
    function endDrag(e) { if (drag === null || e.pointerId !== drag) return; drag = null; stage.classList.remove("is-dragging"); tx = ty = 0; kick(); }
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);
    stage.addEventListener("keydown", function (e) {
      if (composing(e)) return;
      var key = e.key, s = 0.25;
      if (key === "ArrowLeft") tx = clamp(tx - s, -1, 1);
      else if (key === "ArrowRight") tx = clamp(tx + s, -1, 1);
      else if (key === "ArrowUp") ty = clamp(ty - s, -1, 1);
      else if (key === "ArrowDown") ty = clamp(ty + s, -1, 1);
      else if (key === "Home") { tx = 0; ty = 0; }
      else return;
      e.preventDefault();
      stage.classList.add("is-keys");
      kick();
      announce("指针x" + tx.toFixed(2) + "，y" + ty.toFixed(2));
    });
    radios($(".mo-seg", root), function (b) { cfg = P[b.getAttribute("data-tl")]; rest = null; apply(); report(true); });
    window.addEventListener("resize", function () { rest = null; apply(); });
    apply();
    report(true);
  }

  /* ================================================================
   * 16 小屋：漂浮叶子（正弦叠加 + 斥力 + 阻尼弹簧；风停了不出帧）
   * ================================================================ */
  var LEAF_HOME = [
    [0.10, 0.20, 0.30], [0.22, 0.66, 0.65], [0.07, 0.52, 0.85], [0.26, 0.88, 0.25], [0.88, 0.18, 0.45], [0.80, 0.72, 0.10],
    [0.94, 0.52, 0.70], [0.70, 0.10, 0.55], [0.43, 0.09, 0.90], [0.58, 0.91, 0.20], [0.36, 0.74, 0.50], [0.64, 0.27, 0.60]
  ];
  var LEAF_FILL = ["#A9BC96", "#7E9367", "#9BAE86", "#6F855C", "#8FA47A"];
  function initLeaves() {
    var root = $("[data-demo='leaves']");
    if (!root || !window.requestAnimationFrame) return;
    var stage = $("[data-l='stage']", root), box = $("[data-l='leaves']", root);
    var meter = $("[data-l='meter']", root), out = $("[data-l='out']", root), card = $(".mol-card", root);
    var N = LEAF_HOME.length;
    var leaves = LEAF_HOME.map(function (h, i) {
      var el = doc.createElement("span");
      el.className = "mol-leaf";
      var fill = LEAF_FILL[i % LEAF_FILL.length];
      el.innerHTML = '<svg viewBox="0 0 26 26" focusable="false"><path d="M13 2C20 6 22 15 13 24C4 15 6 6 13 2Z" fill="' + fill + '"/><path d="M13 5V22" stroke="#4F5B3E" stroke-opacity=".35" stroke-width="1" fill="none"/></svg>';
      el.style.opacity = String((1 - 0.55 * h[2]).toFixed(2));
      box.appendChild(el);
      return { el: el, hx: h[0], hy: h[1], far: h[2], angle: (i * 47) % 360 - 180, px: 0, py: 0, vx: 0, vy: 0, phase: i * 2.399 };
    });
    var K = 5.8, C = 2 * 0.85 * Math.sqrt(K), RADIUS = 170, STRENGTH = 800, IDLE = 7000, WIND_TAU = 600;
    var wind = 1, time = 0, lastMove = now(), lastFrame = 0, loop = 0, visible = false, pointerIn = false, ptx = 0, pty = 0;
    var frames = 0, secAt = now(), state = "";
    function say(s) { if (s !== state) { state = s; out.textContent = s; } }
    function unit() { return card.offsetWidth / 708.08; }
    function frame(t) {
      loop = 0;
      var dt = lastFrame ? Math.min(t - lastFrame, 50) / 1000 : 1 / 60;
      lastFrame = t;
      var windTarget = now() - lastMove < IDLE ? 1 : 0;
      wind += (windTarget - wind) * (1 - Math.exp(-dt * 1000 / WIND_TAU));
      if (wind < 0.01 && windTarget === 0) wind = 0;
      time += dt * wind;
      var u = unit(), W = stage.clientWidth, H = stage.clientHeight, moving = wind > 0;
      for (var i = 0; i < N; i++) {
        var L = leaves[i], near = 1 - L.far, slow = 1 - 0.4 * L.far, p = L.phase, tt = time * slow;
        var driftX = u * (6 + 6 * near) * (Math.sin(tt * 0.48 + p) + 0.4 * Math.sin(tt * 0.79 + 2 * p));
        var driftY = u * (4 + 4 * near) * Math.sin(tt * 0.57 + 1.7 * p);
        var sway = 0.07 * Math.sin(tt * 0.67 + p);
        var x = L.hx * W + driftX + L.px, y = L.hy * H + driftY + L.py;
        var fx = -K * L.px - C * L.vx, fy = -K * L.py - C * L.vy;
        if (pointerIn) {
          var dx = x - ptx, dy = y - pty, d = Math.sqrt(dx * dx + dy * dy), rad = RADIUS * u;
          if (d < rad && d > 0.001) {
            var fall = 1 - d / rad, str = STRENGTH * u * (1 - 0.5 * L.far) * fall * fall;
            fx += dx / d * str;
            fy += dy / d * str;
          }
        }
        L.vx += fx * dt; L.vy += fy * dt;
        L.px += L.vx * dt; L.py += L.vy * dt;
        if (Math.abs(L.vx) + Math.abs(L.vy) > 0.03 || Math.abs(fx) + Math.abs(fy) > 0.3) moving = true;
        var rot = L.angle + (sway + (L.px / u) * 0.004) * 180 / Math.PI;
        L.el.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) rotate(" + rot.toFixed(1) + "deg) scale(" + ((1 - 0.5 * L.far) * Math.max(0.6, u * 1.6)).toFixed(3) + ")";
      }
      frames += 1;
      if (t - secAt >= 500) { meter.textContent = "出帧" + Math.round(frames * 1000 / (t - secAt)) + "/秒"; frames = 0; secAt = t; }
      if (moving && visible) {
        loop = raf(frame);
        say(wind > 0.99 ? "在漂：指针停" + Math.ceil((IDLE - (now() - lastMove)) / 1000) + "秒后风停。" : "风在停…");
      } else {
        lastFrame = 0;
        meter.textContent = "静止 · 0帧/秒";
        if (!moving) say("风停了，弹簧也停稳：不再请求下一帧，画面静止。");
        heavy.release("leaves");
      }
    }
    function kick() {
      if (reduced()) { meter.textContent = "静止 · 0帧/秒"; say("减弱动效：叶子不动（原物这时整层不加载）。"); return; }
      if (loop || !visible) return;
      heavy.claim("leaves");
      lastFrame = 0;
      frames = 0;
      secAt = now();
      loop = raf(frame);
    }
    function stop() { if (loop) { caf(loop); loop = 0; } lastFrame = 0; meter.textContent = "暂停 · 0帧/秒"; }
    heavy.register("leaves", function () { stop(); say("让给了别的演示：暂停。"); }, function () { if (visible) { lastMove = now(); kick(); } });
    stage.addEventListener("pointermove", function (e) {
      var r = stage.getBoundingClientRect();
      ptx = e.clientX - r.left; pty = e.clientY - r.top; pointerIn = true; lastMove = now();
      kick();
    });
    stage.addEventListener("pointerleave", function () { pointerIn = false; });
    $("[data-l='push']", root).addEventListener("click", function () {
      ptx = stage.clientWidth / 2; pty = stage.clientHeight / 2; pointerIn = true; lastMove = now();
      kick();
      setTimeout(function () { pointerIn = false; }, 450);
      announce("从中间推了一下");
    });
    watch(stage, function (v) {
      visible = v;
      if (v) { lastMove = now(); kick(); }
      else { stop(); heavy.release("leaves"); }
    });
    /* 先摆好一帧（不跑循环）：没滚到时也是叶子在家的样子 */
    var u0 = unit(), W0 = stage.clientWidth, H0 = stage.clientHeight;
    leaves.forEach(function (L) { L.el.style.transform = "translate(" + (L.hx * W0).toFixed(1) + "px," + (L.hy * H0).toFixed(1) + "px) rotate(" + L.angle + "deg) scale(" + ((1 - 0.5 * L.far) * Math.max(0.6, u0 * 1.6)).toFixed(3) + ")"; });
    meter.textContent = "静止 · 0帧/秒";
  }

  /* ================================================================
   * 17 小屋：灯呼吸（完整档一直要下一帧；精简档停稳后重画一次就停）
   * ================================================================ */
  function initBreath() {
    var root = $("[data-demo='breath']");
    if (!root || !window.requestAnimationFrame) return;
    var wall = $("[data-b='wall']", root), glows = [$("[data-b='glow']", root), $("[data-b='glow2']", root)];
    var meterEl = $("[data-b='meter']", root), out = $("[data-b='out']", root), ampBtn = $("[data-b='amp']", root);
    var tier = "full", loop = 0, visible = false, walking = false, walkT0 = 0, redrawn = false, frames = 0, secAt = now(), fps = 0, lastRet = null;
    meterEl.innerHTML = '<div><dt>render()返回</dt><dd data-m="ret">—</dd></div><div><dt>出帧</dt><dd data-m="fps">0/秒</dd></div>' +
      '<div><dt>画质</dt><dd data-m="q">走动档（60万像素）</dd></div><div><dt>灯</dt><dd data-m="b">1.000×</dd></div>';
    var m = { ret: $("[data-m='ret']", meterEl), fps: $("[data-m='fps']", meterEl), q: $("[data-m='q']", meterEl), b: $("[data-m='b']", meterEl) };
    wall.classList.add("is-walk");
    function setGlow(v) { glows.forEach(function (g) { g.style.opacity = clamp(0.85 * v, 0, 1).toFixed(3); }); }
    function render(t) {
      /* 返回 true = 下一帧还要画 */
      if (walking) {
        var q = clamp((t - walkT0) / 1500, 0, 1), e = sineOut(q);
        wall.style.transform = "scale(" + (1.12 - 0.12 * e).toFixed(4) + ")";
        if (q >= 1) { walking = false; wall.style.transform = ""; }
      }
      var breathing = tier === "full" && !reduced();
      var amp = pressed(ampBtn) ? 0.3 : 0.05;
      var b = breathing ? 1 + amp * Math.sin(t / 1000 * 0.785) : 1;
      setGlow(b);
      m.b.textContent = b.toFixed(3) + "×";
      if (!walking && !breathing) {
        if (!redrawn) {
          redrawn = true;
          wall.classList.remove("is-walk");
          m.q.textContent = "停稳档（325万像素）";
          m.q.className = "is-ok";
        }
        return false;
      }
      return true;
    }
    function frame(t) {
      loop = 0;
      var more = render(t);
      frames += 1;
      if (t - secAt >= 500) { fps = Math.round(frames * 1000 / (t - secAt)); frames = 0; secAt = t; m.fps.textContent = fps + "/秒"; }
      if (more !== lastRet) {
        lastRet = more;
        m.ret.textContent = more ? "true（还要下一帧）" : "false（停稳，循环退出）";
        m.ret.className = more ? "is-bad" : "is-ok";
        if (!more) {
          out.textContent = "精简档：停稳后重画一次清楚的，然后不再出帧。";
          announce(out.textContent);
        } else if (!walking && tier === "full") {
          out.textContent = "完整档：灯一直在呼吸，render()永远返回true，循环不退出，「停稳后重画」等不到。";
        }
      }
      if (more && visible && !doc.hidden) loop = raf(frame);
      else {
        if (!more) { m.fps.textContent = "0/秒"; frames = 0; }
        heavy.release("breath");
      }
    }
    function kick() {
      if (reduced()) { setGlow(1); m.ret.textContent = "—"; m.fps.textContent = "0/秒"; out.textContent = "减弱动效：灯不动（原物整块3D都不加载）。"; return; }
      if (loop || !visible) return;
      if (heavy.busy("breath")) { heavy.wait("breath"); out.textContent = "让给了别的演示，等它停了接着跑。"; return; }
      heavy.claim("breath");
      frames = 0;
      secAt = now();
      loop = raf(frame);
    }
    function stop() { if (loop) { caf(loop); loop = 0; } m.fps.textContent = "0/秒"; }
    heavy.register("breath", stop, function () { kick(); });
    function walk() {
      walking = true;
      walkT0 = now();
      redrawn = false;
      lastRet = null;
      wall.classList.add("is-walk");
      m.q.textContent = "走动档（60万像素）";
      m.q.className = "";
      out.textContent = "走到墙角（1.5秒）…";
      if (loop) { caf(loop); loop = 0; }
      heavy.release("breath");
      kick();
    }
    $("[data-b='walk']", root).addEventListener("click", walk);
    radios($(".mo-seg", root), function (b) {
      tier = b.getAttribute("data-bt");
      redrawn = false;
      lastRet = null;
      wall.classList.add("is-walk");
      m.q.textContent = "走动档（60万像素）";
      m.q.className = "";
      if (!loop) kick();
    });
    toggle(ampBtn, function () {});
    watch(root, function (v) {
      visible = v;
      if (v) kick();
      else { stop(); heavy.release("breath"); }
    });
  }

  /* 减弱动效中途打开：每帧跑的那几个当场停在终点（下一次交互按减弱动效走） */
  onMq(mqReduce, function () {
    if (!reduced()) return;
    $$(".moc-dot").forEach(function (d) { if (d.getAnimations) d.getAnimations().forEach(function (a) { a.finish(); }); });
  });

  [initCurves, initFlip, initCheap, initReduce, initInterrupt, initXfade, initSpring, initReveal, initPage, initSkip,
    initIntro, initVeil, initWalk, initScrub, initTilt, initLeaves, initBreath].forEach(function (fn) {
    try { fn(); } catch (e) {
      /* 一个样例坏了不拖累别的；控制台留一条，量具会抓 */
      if (window.console && console.error) console.error("motion.js", fn.name, e);
    }
  });
})();
