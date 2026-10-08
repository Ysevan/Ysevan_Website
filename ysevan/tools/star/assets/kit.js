/*
 * kit.js —— 整页弹层套件 window.StarKit（配 assets/kit.css）。总览、收藏页用。
 *
 * 普通脚本（file:// 下不用 module、不用 fetch），页面在 star.js 之后、页专属脚本之前以 defer 加载：
 *   <link rel="stylesheet" href="assets/star.css">
 *   <link rel="stylesheet" href="assets/kit.css">
 *   <script src="assets/star.js" defer></script>
 *   <script src="assets/kit.js" defer></script>
 *   <script src="assets/pages/index.js" defer></script>      页专属脚本里直接用 window.StarKit
 *
 * 交互页「弹窗 · 屋主收集」的样例是手机舞台里的演示（sheets.js）；这里是真在整页上弹的版本，规格照那几条：
 *   ix-sheet-frosted / ix-sheet-ring / ix-sheet-ruler / ix-sheet-photo 的「数值 / 代码」，ix-dialog（>600 居中大卡片），
 *   ix-lightbox（原位放大、缩回原位），ix-sheet-flip（原地翻面）。时长、曲线、错开写在 kit.css，这里只切状态、跟数字。
 *
 * ── API ──────────────────────────────────────────────────────────────────
 *   StarKit.sheet(opts) → { open(trigger), close(), el, panel, body, foot, isOpen(), setTitle(text), destroy() }
 *       整页模态弹层，挂 body 下。≤600 从底部升起，>600 居中大卡片。
 *       opts.title    标题（aria-labelledby 指向它）
 *       opts.kind     "plain"（默认，毛玻璃浮层那一套，遮罩跟模糊档位）| "ring" | "ruler" | "photo"（照片抽屉，见 StarKit.photo）
 *       opts.size     "md"（默认，宽 min(520 × --u, 92vw)）| "lg"（min(920 × --u, 92vw)，ix-dialog）
 *       opts.build(body, api)    建好时调一次：往 body（正文区，会滚）里放内容；api.foot 是固定底栏，空着就不显示
 *       opts.onOpen(body, api)   每次打开时调（换内容放这里）；opts.onClose(api) 每次开始关时调
 *       opts.onClosed(api)       关闭过渡走完、收好之后调（once / destroy 时在从 DOM 拿掉之后）；每次关只调一次，关到一半又打开不算
 *       opts.focus(api) → 元素  打开后焦点给谁（默认第一个能聚焦的，一般是关闭按钮）
 *       opts.onEscape(api) → true 表示这一下 Esc 被页面自己用掉了（一下只退一层）
 *     body 里用 StarKit.ring / StarKit.ruler 画的东西，弹层打开时自动 play()、开始关时自动 reset()。
 *   StarKit.ring(host, { value, max, label, unit, delay }) → { play(), reset(), el }
 *       圆环计数：弧画到 value / max，中心数字跟着同一条曲线从0滚到 value（读圆环过渡自己的 currentTime）。
 *       unit 是数字下面那行小字；label 给读屏的一整句（默认「value／max」）；delay 毫秒，默认500（等面板落定）。
 *   StarKit.ruler(host, { weeks, marks, today, text, textLabel, reveal, delay }) → { play(), reset(), reveal(on), el, week }
 *       刻度尺：weeks 根周刻度（默认53），today（Date，页面传 new Date()；量具拨时钟）落在第几周就走到第几根换强调色停住。
 *       marks: [{ week, level(1–3), label }] 有记录的周，刻度下面一个点。
 *       text 可选：遮住的编号，原地逐字展开、行高不动；reveal "button"（默认，带「显示 / 隐藏」按钮）| "auto"（刻度走完自己展开）。
 *   StarKit.photo(opts) → 同 sheet 的 api（已经打开；关上后自己从 DOM 里拿掉，opts.keep 为真则留着）
 *       照片抽屉：{ src, alt, title, kicker, icon, position, build(drawer), progress: { value, max, label, unit }, trigger, size, onClose }
 *       onClose(api)：关闭过渡走完、从 DOM 拿掉之后调（keep 时是收起之后），只调一次（与 sheet 的 onClosed 同义）。
 *       没有 src（或加载不到）时用强调色渐变封面 + icon（调用方给的 SVG 字符串，线条随 currentColor）。
 *   StarKit.lightbox(img, { src, alt, caption, trigger, onClose }) → { close(), el, isOpen() }
 *       灯箱：img 是缩略图 <img>（或包着它的元素）。从缩略图原位放大，关的时候缩回原位；Esc / 点哪儿 / 关闭按钮都关。
 *       onClose()：关闭过渡走完、灯箱收起（.kit-lb hidden）、焦点还回之后调；中途再关直接到终态、被新灯箱或 sheet 顶掉时也调，只调一次。
 *       可以叠在打开的 sheet 上面（Esc 先退灯箱）。
 *   StarKit.flip({ scene, card, front, back, button, flippedClass, label(flipped), onFace(isBack) }) → { toggle(), set(v), isFlipped() }
 *       原地翻面的行为部分（从收藏页 collection.js 的翻面抽出来，同一套写法）：切 scene 上的类，过90°那一帧换面，
 *       看不见的那一面 aria-hidden + inert。样式用页面自己的（收藏页 .col-flip-*）或 kit.css 的 .kit-flip-*。
 *   StarKit.bezier(x1, y1, x2, y2) / StarKit.findTransition(el, prop) / StarKit.follow(anim, onFrame, onDone)
 *       给数字跟着 CSS 过渡滚用（与 sheets.js 同一套）。
 *   StarKit.isOpen() → 有没有弹层开着（外壳的全局快捷键可以先问一句）；StarKit.reduced() → 是否减弱动效。
 *
 * ── 约定 ─────────────────────────────────────────────────────────────────
 *  - 弹层：role="dialog" + aria-modal + aria-labelledby；打开时 main、aside.side、nav.tabbar（连同跳到正文、「更多」面板）
 *    设 inert，外壳的 aria-live 播报区不动；焦点进框、Tab 在框内转圈；Esc（先判输入法合成态）、关闭按钮、点遮罩都能关；
 *    关了焦点还给打开它的元素。同一时间只开一个 sheet：开新的先关旧的（旧的不还焦点）；灯箱可以叠在 sheet 上。
 *    Esc 时焦点在框里的输入框上：先让它失焦（失焦即存）再关（ix-dialog / ix-esc）。
 *  - 页面在弹层后面不跟着滚：滚轮、触摸只放给框里还能往那个方向滚的元素。
 *  - 遮罩：只有 plain 跟外壳的模糊档位 html[data-blur]（full 糊到26px / lite、off 压暗，外壳 boot.js 写，JS 这边不读）；
 *    ring / ruler / photo 任何档位都是各自条目的 #000 压到 .4（见 kit.css 文件头）。
 *  - 开关只切 data-state，位移、缩放、圆环、刻度全是 CSS 过渡；减弱动效时外壳把过渡全关了，自然直接到终点。
 *    要跟着动画走的 JS（圆环中心数字）不另起时钟：每帧读那条 CSS 过渡自己的 currentTime。
 *    灯箱的幽灵是 WAAPI：每帧按缓动算好、关键帧之间 linear；减弱动效时不起动画，直接开 / 关。
 *  - 收尾走「事件 + 兜底计时器」两条路：后台标签页的动画时钟可能停着，事件不来也能收。
 *  - 凡处理按键，第一行先判输入法合成态。播报只走外壳 StarShell.announce。
 *
 * ── 用法示例 ─────────────────────────────────────────────────────────────
 *   var ring = null;
 *   var s = StarKit.sheet({ title: "本书进度", kind: "ring", build: function (body) {
 *     ring = StarKit.ring(body, { value: 44, max: 160, unit: "条已收录", label: "已收录44条，计划160条" });
 *   } });
 *   btn.addEventListener("click", function () { s.open(btn); });          // 打开时圆环自动画、关时自动收
 *
 *   StarKit.photo({ title: "Remotion 旅行成片", kicker: "有意思的项目", src: "assets/shots/remotion-travel.webp", alt: "",
 *     build: function (drawer) { drawer.appendChild(p); }, trigger: btn });
 *
 *   thumbBtn.addEventListener("click", function () { StarKit.lightbox(thumbBtn.querySelector("img"), { caption: "截图1", trigger: thumbBtn }); });
 */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var mqReduce = null;
  try { mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)"); } catch (e) { mqReduce = null; }
  var canAnimate = typeof Element !== "undefined" && typeof Element.prototype.animate === "function";
  function reduced() { return !!(mqReduce && mqReduce.matches); }
  function $$(sel, box) { return Array.prototype.slice.call((box || doc).querySelectorAll(sel)); }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function composing(e) { return !!(e.isComposing || e.keyCode === 229); }
  function focusNoScroll(el) { if (!el || !el.focus) return; try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } }
  function announce(text) { if (window.StarShell && window.StarShell.announce) window.StarShell.announce(text); }
  function make(tag, cls, text) {
    var n = doc.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  /* 关闭图标：与 nav.js 的 close 同一条路径（线条 1.9、圆头，颜色随 currentColor） */
  var X_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6.6 6.6 10.8 10.8M17.4 6.6 6.6 17.4"/></svg>';
  var CLOSE_MS = 300;   /* kit.css 里所有关闭过渡都是 .3s */

  /* 三次贝塞尔：给定 x（时间进度）求 y（数值进度）。牛顿迭代，不收敛就二分。 */
  function bezier(x1, y1, x2, y2) {
    function a(p1, p2) { return 1 - 3 * p2 + 3 * p1; }
    function b(p1, p2) { return 3 * p2 - 6 * p1; }
    function c(p1) { return 3 * p1; }
    function at(t, p1, p2) { return ((a(p1, p2) * t + b(p1, p2)) * t + c(p1)) * t; }
    function slope(t, p1, p2) { return 3 * a(p1, p2) * t * t + 2 * b(p1, p2) * t + c(p1); }
    return function (x) {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      var t = x;
      for (var i = 0; i < 8; i++) {
        var d = at(t, x1, x2) - x;
        if (Math.abs(d) < 1e-7) return at(t, y1, y2);
        var s = slope(t, x1, x2);
        if (Math.abs(s) < 1e-6) break;
        t -= d / s;
      }
      var lo = 0, hi = 1;
      t = x;
      for (var j = 0; j < 50; j++) {
        var v = at(t, x1, x2);
        if (Math.abs(v - x) < 1e-7) break;
        if (v < x) lo = t; else hi = t;
        t = (lo + hi) / 2;
      }
      return at(t, y1, y2);
    };
  }
  var EASE = bezier(.2, .7, .2, 1);      /* 与 kit.css 的 --kit-ease 同一条 */
  var LB_EASE = bezier(.2, .8, .2, 1);   /* 灯箱：与交互页灯箱样例同一条 */

  /* 元素身上某个属性的 CSS 过渡（CSSTransition）；没有（减弱动效、内核不支持）返回 null */
  function findTransition(el, prop) {
    if (!el || typeof el.getAnimations !== "function") return null;
    var list = el.getAnimations();
    for (var i = 0; i < list.length; i++) if (list[i].transitionProperty === prop) return list[i];
    return null;
  }

  /* 跟着一条过渡走：每帧读它的 currentTime，扣掉它自己的 delay、除以 duration，得到 0–1 的时间进度交给 onFrame。
     过渡被替换（关闭时反向）就停；正常走完调 onDone。返回停止函数。 */
  function follow(anim, onFrame, onDone) {
    var alive = true;
    var raf = 0;
    var timing = anim.effect && anim.effect.getTiming ? anim.effect.getTiming() : {};
    var delay = Number(timing.delay) || 0;
    var dur = Number(timing.duration) || 1;
    function finish() { if (!alive) return; alive = false; cancelAnimationFrame(raf); onDone(); }
    function tick() {
      if (!alive) return;
      var st = anim.playState;
      if (st === "finished") { finish(); return; }
      if (st === "idle") { alive = false; return; }
      var t = anim.currentTime == null ? 0 : Number(anim.currentTime);
      onFrame(clamp((t - delay) / dur, 0, 1));
      raf = requestAnimationFrame(tick);
    }
    tick();
    if (anim.finished && typeof anim.finished.then === "function") anim.finished.then(finish, function () {});
    return function () { alive = false; cancelAnimationFrame(raf); };
  }

  /* 事件 + 兜底计时器：fn 只跑一次。animation 可以是 null（只靠计时器）。 */
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

  /* 整块关掉过渡、改状态、再放回（重放前把上一次留下的状态复位，用户看不见这一下） */
  function silently(el, fn) {
    el.classList.add("kit-instant");
    fn();
    void el.offsetWidth;
    el.classList.remove("kit-instant");
    void el.offsetWidth;
  }

  var FOCUSABLE = "a[href], area[href], button, input, select, textarea, iframe, summary, [contenteditable=''], [contenteditable='true'], [tabindex]";
  function isFocusable(el) {
    if (el.disabled || el.getAttribute("tabindex") === "-1" || el.type === "hidden") return false;
    if (el.closest("[inert]")) return false;
    if (!el.getClientRects().length) return false;
    return getComputedStyle(el).visibility !== "hidden";
  }
  function focusables(box) { return $$(FOCUSABLE, box).filter(isFocusable); }
  function editable(el) {
    if (!el || !el.tagName) return false;
    var t = el.tagName;
    if (t === "TEXTAREA" || el.isContentEditable) return true;
    if (t !== "INPUT") return false;
    return !/^(button|submit|reset|checkbox|radio|range|color|file|image|hidden)$/i.test(el.type || "");
  }

  /* ================================================================
   * 弹层栈：sheet 与灯箱共用。栈空 → 页面（main、侧栏、tab bar……）可达；有一层 → 页面 inert；
   * 灯箱叠在 sheet 上时，下面那个 sheet 整层 inert。Esc、Tab 只给最上面那层。
   * ================================================================ */
  var stack = [];
  /* 外壳的「页面」部分：nav.js 画的四样 + 正文。外壳的 aria-live 播报区（#star-live）不在里面：inert 的播报区不播 */
  var BACKDROP = "main, aside.side, nav.tabbar, a.skip, .more-panel, .more-scrim";
  function pageInert(on) {
    $$(BACKDROP).forEach(function (el) {
      if (el.closest(".kit-layer, .kit-lb")) return;
      if (on) {
        if (!el.inert) { el.inert = true; el.setAttribute("data-kit-inert", ""); }
      } else if (el.hasAttribute("data-kit-inert")) {
        el.inert = false;
        el.removeAttribute("data-kit-inert");
      }
    });
  }
  function push(entry) {
    var i = stack.indexOf(entry);
    if (i >= 0) stack.splice(i, 1);
    if (!stack.length) pageInert(true);
    else stack[stack.length - 1].layer.inert = true;
    stack.push(entry);
    entry.layer.inert = false;
  }
  function pop(entry) {
    var i = stack.indexOf(entry);
    if (i < 0) return;
    var wasTop = i === stack.length - 1;
    stack.splice(i, 1);
    if (!stack.length) pageInert(false);
    else if (wasTop) stack[stack.length - 1].layer.inert = false;
  }
  function trap(box, e) {
    var f = focusables(box);
    if (!f.length) { e.preventDefault(); focusNoScroll(box); return; }
    var first = f[0];
    var last = f[f.length - 1];
    var ae = doc.activeElement;
    if (!box.contains(ae) || ae === box) { e.preventDefault(); focusNoScroll(e.shiftKey ? last : first); return; }
    if (e.shiftKey && ae === first) { e.preventDefault(); focusNoScroll(last); }
    else if (!e.shiftKey && ae === last) { e.preventDefault(); focusNoScroll(first); }
  }
  /* 文档上一处收 Esc 与 Tab：框里的组件自己处理过 Esc（preventDefault）就不再关——一下只退一层 */
  doc.addEventListener("keydown", function (e) {
    if (composing(e)) return;
    var top = stack[stack.length - 1];
    if (!top) return;
    if (e.key === "Escape" || e.key === "Esc") {
      if (e.defaultPrevented) return;
      e.preventDefault();
      top.escape();
      return;
    }
    if (e.key === "Tab") trap(top.box, e);
  });

  /* 页面在弹层后面不跟着滚：滚轮、触摸往下传之前，看框里有没有元素还能往那个方向滚，没有就拦下
     （滚到头的那一下也拦，配合 overscroll-behavior:contain，不会把整页带着走） */
  function canScroll(el, dy) {
    if (el.scrollHeight <= el.clientHeight + 1) return false;
    var oy = getComputedStyle(el).overflowY;
    if (oy !== "auto" && oy !== "scroll") return false;
    if (dy < 0) return el.scrollTop > 0;
    if (dy > 0) return el.scrollTop + el.clientHeight < el.scrollHeight - 1;
    return true;
  }
  function guardScroll(layer) {
    function blocked(target, dy) {
      for (var n = target; n && n !== layer; n = n.parentElement) if (canScroll(n, dy)) return false;
      return true;
    }
    var y0 = 0;
    layer.addEventListener("wheel", function (e) {
      if (e.ctrlKey) return;   /* 触控板捏合缩放交给浏览器 */
      if (blocked(e.target, e.deltaY)) e.preventDefault();
    }, { passive: false });
    layer.addEventListener("touchstart", function (e) { if (e.touches.length === 1) y0 = e.touches[0].clientY; }, { passive: true });
    layer.addEventListener("touchmove", function (e) {
      if (e.touches.length !== 1 || !e.cancelable) return;
      if (blocked(e.target, y0 - e.touches[0].clientY)) e.preventDefault();
    }, { passive: false });
  }

  /* ================================================================
   * sheet：整页模态弹层
   * ================================================================ */
  var seq = 0;
  var KINDS = ["plain", "ring", "ruler", "photo"];

  function sheet(opts) {
    opts = opts || {};
    var kind = KINDS.indexOf(opts.kind) >= 0 ? opts.kind : "plain";
    var n = ++seq;
    var titleId = "kit-title-" + n;

    var layer = make("div", "kit-layer");
    layer.setAttribute("data-kind", kind);
    layer.setAttribute("data-size", opts.size === "lg" ? "lg" : "md");
    layer.setAttribute("data-state", "closed");
    var scrim = make("div", "kit-scrim");
    scrim.setAttribute("data-rm", "fade");
    scrim.setAttribute("aria-hidden", "true");
    var panel = make("div", "kit-panel");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", titleId);
    panel.setAttribute("tabindex", "-1");
    panel.setAttribute("data-rm", "fade");
    panel.inert = true;

    var closeBtn = make("button", "kit-x");
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "关闭");
    closeBtn.innerHTML = X_SVG;

    var titleEl, body, foot, scroller;
    if (kind === "photo") {
      var ph = photoTop(opts, titleId);
      titleEl = ph.title;
      ph.box.appendChild(closeBtn);
      var drawer = make("div", "kit-drawer");
      if (opts.progress) drawer.appendChild(progressBlock(opts.progress));
      body = make("div", "kit-drawer-body");
      foot = make("div", "kit-foot");
      drawer.appendChild(body);
      drawer.appendChild(foot);
      panel.appendChild(ph.box);
      panel.appendChild(drawer);
      scroller = drawer;
    } else {
      var grab = make("span", "kit-grabber");
      grab.setAttribute("aria-hidden", "true");
      var head = make("div", "kit-head");
      titleEl = make("h2", "kit-title", opts.title || "");
      titleEl.id = titleId;
      head.appendChild(titleEl);
      head.appendChild(closeBtn);
      body = make("div", "kit-body");
      foot = make("div", "kit-foot");
      panel.appendChild(grab);
      panel.appendChild(head);
      panel.appendChild(body);
      panel.appendChild(foot);
      scroller = body;
    }
    layer.appendChild(scrim);
    layer.appendChild(panel);
    doc.body.appendChild(layer);
    guardScroll(layer);

    var state = "closed";
    var pendingClosed = false;   /* 这一次关还没报「关好了」（opts.onClosed 只调一次；关到一半又打开，这次不算） */
    var restoreTo = null;
    var endTimer = 0;
    var endFn = null;
    var api = { el: layer, panel: panel, body: body, foot: foot, kind: kind };
    var entry = {
      layer: layer,
      box: panel,
      escape: onEscape,
      close: function (o) { api.close(o); },
      restoreTo: function () { return restoreTo; }
    };

    /* body 里的圆环、刻度尺：打开时自动 play、开始关时自动 reset */
    function components(fn) {
      $$(".kit-ring, .kit-ruler", panel).forEach(function (c) { if (c.__kit && c.__kit[fn]) c.__kit[fn](); });
    }
    /* 正文区装不下、里面又没有能聚焦的东西时，它自己当一个 Tab 位（键盘能滚）；装得下就撤掉 */
    function syncScroller() {
      if (state !== "open") return;
      var over = scroller.scrollHeight > scroller.clientHeight + 1;
      var hasInner = focusables(scroller).some(function (el) { return el !== scroller; });
      if (over && !hasInner) {
        scroller.setAttribute("tabindex", "0");
        scroller.setAttribute("role", "region");
        scroller.setAttribute("aria-labelledby", titleId);
      } else if (scroller.getAttribute("role") === "region") {
        scroller.removeAttribute("tabindex");
        scroller.removeAttribute("role");
        scroller.removeAttribute("aria-labelledby");
      }
    }
    function dropEnd() {
      clearTimeout(endTimer);
      if (endFn) { panel.removeEventListener("transitionend", endFn); endFn = null; }
    }
    function closedDone() {
      if (!pendingClosed) return;
      pendingClosed = false;
      if (opts.onClosed) opts.onClosed(api);
    }

    function onEscape() {
      if (opts.onEscape && opts.onEscape(api) === true) return;   /* 页面自己用掉了这一下 */
      var ae = doc.activeElement;
      if (ae && panel.contains(ae) && editable(ae)) ae.blur();    /* 先失焦（失焦即存）再关 */
      api.close();
    }

    api.open = function (trigger) {
      if (state === "open") return api;
      var t = trigger && trigger.focus ? trigger : (doc.activeElement && doc.activeElement !== doc.body ? doc.activeElement : null);
      /* 同一时间只开一个：别的先关（不还焦点）；打开它的按钮就在旧弹层里时，以后还给旧弹层的打开者 */
      stack.slice().forEach(function (o) {
        if (o === entry) return;
        if (t && o.layer.contains(t)) t = o.restoreTo();
        o.close({ restore: false });
      });
      if (window.StarShell && window.StarShell.closeMore) window.StarShell.closeMore(false);
      restoreTo = t;
      dropEnd();
      pendingClosed = false;
      void layer.offsetWidth;   /* 刚建好就打开时，先按「关着」算一遍样式，过渡才有起点 */
      state = "open";
      push(entry);
      panel.inert = false;
      layer.setAttribute("data-state", "open");
      if (opts.onOpen) opts.onOpen(body, api);
      components("play");
      syncScroller();
      focusNoScroll((opts.focus && opts.focus(api)) || focusables(panel)[0] || panel);
      return api;
    };

    /* o.restore === false：不把焦点还回去（换成另一个弹层时） */
    api.close = function (o) {
      if (state !== "open") return api;
      o = o || {};
      var ae = doc.activeElement;
      var hadFocus = !ae || ae === doc.body || layer.contains(ae);
      state = "closing";
      pendingClosed = true;
      layer.setAttribute("data-state", "closing");
      panel.inert = true;
      pop(entry);
      components("reset");
      if (opts.onClose) opts.onClose(api);
      if (o.restore !== false && hadFocus && restoreTo && restoreTo.isConnected) focusNoScroll(restoreTo);
      dropEnd();
      endFn = function (e) {
        if (e && (e.target !== panel || e.propertyName !== "opacity")) return;
        dropEnd();
        if (state !== "closing") return;
        state = "closed";
        layer.setAttribute("data-state", "closed");
        if (opts.once) api.destroy();   /* destroy 里拿掉 DOM 之后报 onClosed */
        else closedDone();
      };
      panel.addEventListener("transitionend", endFn);
      endTimer = setTimeout(endFn, CLOSE_MS + 120);
      return api;
    };

    api.isOpen = function () { return state === "open"; };
    api.setTitle = function (text) { titleEl.textContent = text == null ? "" : String(text); return api; };
    api.destroy = function () {
      dropEnd();
      if (state === "open") { pop(entry); panel.inert = true; pendingClosed = true; }
      if (state === "closing") pendingClosed = true;
      state = "closed";
      window.removeEventListener("resize", syncScroller);
      if (layer.parentNode) layer.parentNode.removeChild(layer);
      closedDone();
    };

    closeBtn.addEventListener("click", function () { api.close(); });
    scrim.addEventListener("click", function () { api.close(); });
    window.addEventListener("resize", syncScroller);

    if (opts.build) opts.build(body, api);
    return api;
  }

  /* 照片抽屉的上半块：照片（或强调色封面 + 线条图标）、暗角、白色大字 */
  function photoTop(opts, titleId) {
    var box = make("div", "kit-photo");
    var cover = make("div", "kit-photo-cover");
    cover.setAttribute("aria-hidden", "true");
    if (opts.icon) cover.innerHTML = opts.icon;
    box.appendChild(cover);
    if (opts.src) {
      var img = make("img", "kit-photo-img");
      img.alt = opts.alt || "";
      img.decoding = "async";
      if (opts.position) img.style.objectPosition = opts.position;
      img.addEventListener("error", function () { box.classList.add("is-missing"); });
      img.src = opts.src;
      box.appendChild(img);
    } else {
      box.classList.add("is-missing");
    }
    var shade = make("div", "kit-photo-shade");
    shade.setAttribute("aria-hidden", "true");
    box.appendChild(shade);
    var text = make("div", "kit-photo-text");
    if (opts.kicker) text.appendChild(make("p", "kit-photo-kicker", opts.kicker));
    var title = make("h2", "kit-photo-title", opts.title || "");
    title.id = titleId;
    text.appendChild(title);
    box.appendChild(text);
    return { box: box, title: title };
  }

  /* 进度条：抽屉到位之后才涨（kit.css：.8s、delay .6s） */
  function progressBlock(pr) {
    var max = Math.max(0, Number(pr.max) || 0);
    var val = clamp(Number(pr.value) || 0, 0, max);
    var unit = pr.unit || "";
    var label = pr.label || "进度";
    var wrap = make("div", "kit-progress-wrap");
    var head = make("p", "kit-progress-head");
    head.setAttribute("aria-hidden", "true");
    head.appendChild(make("span", null, label));
    head.appendChild(make("b", null, val + "／" + max + unit));
    var bar = make("div", "kit-progress");
    bar.setAttribute("role", "img");
    bar.setAttribute("aria-label", label + val + "／" + max + unit);
    var fill = make("span", "kit-progress-fill");
    fill.style.setProperty("--kit-p", String(max > 0 ? +(val / max).toFixed(4) : 0));
    bar.appendChild(fill);
    wrap.appendChild(head);
    wrap.appendChild(bar);
    wrap.style.display = "grid";
    wrap.style.gap = "calc(8 * var(--u))";
    return wrap;
  }

  function photo(opts) {
    opts = opts || {};
    var o = {};
    for (var k in opts) if (Object.prototype.hasOwnProperty.call(opts, k)) o[k] = opts[k];
    o.kind = "photo";
    o.once = !opts.keep;
    /* photo 的 onClose = 关闭过渡走完、从 DOM 拿掉之后（keep 时是收起之后），只调一次；没有「开始关」那个回调 */
    o.onClose = null;
    o.onClosed = function (a) {
      if (typeof opts.onClose === "function") opts.onClose(a);
      if (typeof opts.onClosed === "function") opts.onClosed(a);
    };
    var s = sheet(o);
    s.open(opts.trigger);
    return s;
  }

  /* ================================================================
   * 圆环计数（ix-sheet-ring）
   * ================================================================ */
  function ring(host, o) {
    o = o || {};
    var max = Math.max(0, Number(o.max) || 0);
    var value = clamp(Number(o.value) || 0, 0, max);
    var ratio = max > 0 ? value / max : 0;
    var wrap = make("div", "kit-ring");
    /* pathLength="100"：dashoffset 100 = 一点没画，100 − 100 × 比例 = 画到那里（原文 26 / 40 → 35） */
    wrap.style.setProperty("--kit-off", String(+(100 - 100 * ratio).toFixed(3)));
    if (o.delay != null) wrap.style.setProperty("--kit-delay", (Number(o.delay) || 0) / 1000 + "s");
    var vis = make("div", "kit-ring-wrap");
    vis.setAttribute("aria-hidden", "true");
    vis.innerHTML = '<svg class="kit-ring-svg" viewBox="0 0 120 120" focusable="false"><circle class="kit-ring-track" cx="60" cy="60" r="52"/><circle class="kit-ring-arc" cx="60" cy="60" r="52" pathLength="100"/></svg>';
    var center = make("div", "kit-ring-center");
    var num = make("span", "kit-ring-num", "0");
    center.appendChild(num);
    if (o.unit) center.appendChild(make("span", "kit-ring-unit", o.unit));
    vis.appendChild(center);
    wrap.appendChild(vis);
    /* 数字在滚的时候不播报：读屏读这一句 */
    wrap.appendChild(make("p", "sr-only", o.label || value + "／" + max));
    host.appendChild(wrap);
    var arc = wrap.querySelector(".kit-ring-arc");
    var stop = null;

    function halt() { if (stop) { stop(); stop = null; } }
    function play() {
      halt();
      /* 从头画：上一次留下的弧先瞬间回到空，再挂 is-on（同一批过渡只从起点走） */
      silently(wrap, function () { wrap.classList.remove("is-on"); });
      wrap.classList.add("is-on");
      var anim = reduced() ? null : findTransition(arc, "stroke-dashoffset");
      if (!anim) { num.textContent = String(value); return; }
      num.textContent = "0";
      /* 圆环那条过渡自己的时钟：delay .5s（等面板落定）、duration 1.2s、同一条曲线 */
      stop = follow(anim, function (p) { num.textContent = String(Math.round(value * EASE(p))); },
        function () { stop = null; num.textContent = String(value); });
    }
    function reset() {
      halt();
      wrap.classList.remove("is-on");   /* 关闭：.3s 收回（kit.css） */
    }
    var api = { play: play, reset: reset, el: wrap };
    wrap.__kit = api;
    return api;
  }

  /* ================================================================
   * 刻度尺（ix-sheet-ruler）
   * ================================================================ */
  function dayOfYear(d) {
    return Math.round((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(d.getFullYear(), 0, 1)) / 864e5) + 1;
  }
  /* 1月1日算第1周，每7天一格 */
  function weekOf(d) { return Math.floor((dayOfYear(d) - 1) / 7) + 1; }

  function ruler(host, o) {
    o = o || {};
    var weeks = Math.max(1, Math.round(Number(o.weeks) || 53));
    var today = o.today instanceof Date && !isNaN(o.today.getTime()) ? o.today : new Date();
    var year = today.getFullYear();
    var now = clamp(weekOf(today), 1, weeks);
    var monthStart = [];
    for (var m = 0; m < 12; m++) monthStart.push(weekOf(new Date(year, m, 1)));
    var marks = {};
    (o.marks || []).forEach(function (mk) {
      var w = Math.round(Number(mk.week));
      if (w >= 1 && w <= weeks) marks[w] = { level: clamp(Math.round(Number(mk.level) || 1), 1, 3), label: mk.label || "" };
    });

    var wrap = make("div", "kit-ruler");
    if (o.delay != null) wrap.style.setProperty("--kit-delay", (Number(o.delay) || 0) / 1000 + "s");
    var ticks = make("div", "kit-ticks");
    ticks.setAttribute("aria-hidden", "true");
    var html = "";
    for (var w = 1; w <= weeks; w++) {
      var cls = "kit-tick" + (w < now ? " is-past" : w === now ? " is-today" : "") + (monthStart.indexOf(w) >= 0 ? " is-month" : "") +
        (w <= 2 ? " is-start" : w >= weeks - 1 ? " is-end" : "");
      html += '<span class="' + cls + '" style="--i:' + (w - 1) + '"><span class="kit-tick-base"></span>' +
        (w === now ? '<span class="kit-tick-now"></span><span class="kit-tick-flag">今天</span>' : "") +
        (marks[w] ? '<span class="kit-tick-dot" data-level="' + marks[w].level + '"></span>' : "") + "</span>";
    }
    ticks.innerHTML = html;
    wrap.appendChild(ticks);
    var axis = make("div", "kit-ruler-axis");
    axis.setAttribute("aria-hidden", "true");
    axis.appendChild(make("span", null, "第1周"));
    axis.appendChild(make("span", null, "第" + weeks + "周"));
    wrap.appendChild(axis);
    var stat = make("p", "kit-ruler-stat");
    stat.setAttribute("aria-hidden", "true");
    var s1 = make("span", null, "已过");
    s1.appendChild(make("b", null, String(now - 1)));
    s1.appendChild(doc.createTextNode("周"));
    var s2 = make("span", null, "还剩");
    s2.appendChild(make("b", null, String(weeks - now)));
    s2.appendChild(doc.createTextNode("周"));
    stat.appendChild(s1);
    stat.appendChild(s2);
    wrap.appendChild(stat);
    var sr = "共" + weeks + "周，今天在第" + now + "周，已过" + (now - 1) + "周，还剩" + (weeks - now) + "周。";
    var markWeeks = Object.keys(marks).map(Number).sort(function (a, b) { return a - b; });
    if (markWeeks.length) sr += "有记录的周：" + markWeeks.map(function (k) { return "第" + k + "周" + (marks[k].label ? "：" + marks[k].label : ""); }).join("；") + "。";
    wrap.appendChild(make("p", "sr-only", sr));

    /* 遮住的编号：每个字一个槽，先占好最终宽高；展开只动 opacity / transform，行高不变 */
    var code = null, codeSr = null, revealBtn = null, digits = 0, lastReal = null, pending = null;
    var text = o.text == null ? "" : String(o.text);
    var textLabel = o.textLabel || "编号";
    var auto = o.reveal === "auto";
    if (text) {
      var card = make("div", "kit-code-card");
      var tx = make("div", "kit-code-text");
      var lab = make("span", "kit-code-label", textLabel);
      lab.id = "kit-code-" + (++seq);
      code = make("span", "kit-code");
      code.setAttribute("aria-hidden", "true");
      var slots = "";
      for (var c = 0; c < text.length; c++) {
        var ch = text.charAt(c);
        if (ch === " ") { slots += '<span class="kit-ch is-gap"></span>'; continue; }
        slots += '<span class="kit-ch" style="--j:' + digits + '"><span class="kit-ch-mask">•</span><span class="kit-ch-real"></span></span>';
        digits++;
      }
      code.innerHTML = slots;
      var reals = $$(".kit-ch-real", code);
      var k2 = 0;
      for (var c2 = 0; c2 < text.length; c2++) if (text.charAt(c2) !== " ") reals[k2++].textContent = text.charAt(c2);
      lastReal = reals[reals.length - 1] || null;
      codeSr = make("span", "sr-only", textLabel + "已隐藏");
      tx.appendChild(lab);
      tx.appendChild(code);
      tx.appendChild(codeSr);
      card.appendChild(tx);
      if (!auto) {
        revealBtn = make("button", "btn btn-tint", "显示");
        revealBtn.type = "button";
        revealBtn.setAttribute("aria-describedby", lab.id);
        revealBtn.addEventListener("click", function () { setRevealed(!code.classList.contains("is-revealed"), 0); });
        card.appendChild(revealBtn);
      }
      wrap.appendChild(card);
    }

    function cancelPending() { if (pending) { pending(); pending = null; } }
    /* lead：等多久再开始逐字（自动展开时 = 刻度走到今天那一刻），秒 */
    function setRevealed(on, lead) {
      if (!code) return;
      cancelPending();
      code.style.setProperty("--kit-rd", (lead || 0) + "s");
      code.classList.toggle("is-revealed", on);
      if (revealBtn) revealBtn.textContent = on ? "隐藏" : "显示";
      wrap.setAttribute("data-revealed", on ? "true" : "false");
      codeSr.textContent = textLabel + "已隐藏";
      if (!on) return;
      /* 最后一个字落定后播一次完整编号：transitionend 与兜底计时器谁先到算谁 */
      var done = false;
      var timer = 0;
      function speak() {
        if (done) return;
        done = true;
        clearTimeout(timer);
        if (lastReal) lastReal.removeEventListener("transitionend", onEnd);
        pending = null;
        codeSr.textContent = textLabel + " " + text;
        announce(textLabel + " " + text);
      }
      function onEnd(e) { if (e.propertyName === "opacity") speak(); }
      if (lastReal) lastReal.addEventListener("transitionend", onEnd);
      timer = setTimeout(speak, reduced() ? 30 : (lead || 0) * 1000 + (digits - 1) * 50 + 200 + 120);
      pending = function () { done = true; clearTimeout(timer); if (lastReal) lastReal.removeEventListener("transitionend", onEnd); };
    }

    function play() {
      cancelPending();
      silently(wrap, function () {
        wrap.classList.remove("is-on");
        if (code) setRevealed(false, 0);
      });
      wrap.classList.add("is-on");
      if (code && auto) {
        /* 刻度走到今天那根落定：delay + (今天 − 1) × 16.7ms + .24s */
        var d = o.delay != null ? (Number(o.delay) || 0) / 1000 : .5;
        setRevealed(true, reduced() ? 0 : +(d + (now - 1) * .0167 + .24).toFixed(3));
      }
    }
    function reset() {
      cancelPending();
      wrap.classList.remove("is-on");   /* 刻度 .2s 退回（kit.css）；编号留到下次 play 再悄悄遮上 */
    }
    var api = { play: play, reset: reset, reveal: function (on) { setRevealed(on !== false, 0); }, el: wrap, week: now };
    wrap.__kit = api;
    host.appendChild(wrap);
    return api;
  }

  /* ================================================================
   * 灯箱（ix-lightbox）：从缩略图原位放大、缩回原位
   * 幽灵：外框从缩略图「看得见的那块」非等比缩放到大图框（当裁切），内图在外框坐标里反向缩放、始终按原图比例；
   * 两只框每帧按缓动算好，关键帧之间 linear（开20帧、关15帧）。只动 transform / opacity。
   * 原图比例差2%以上、没加载、量出0尺寸 → 只淡入；关的时候缩略图不完整可见（滚出视口、被吸顶栏 / tab bar /
   * 裁切祖先挡住）→ 只淡出；动画中途再关 → 直接到终态，不倒着缩回去。
   * ================================================================ */
  var LB_OPEN_MS = 260, LB_CLOSE_MS = 200, LB_OPEN_FRAMES = 20, LB_CLOSE_FRAMES = 15;
  var lb = null;

  function lbDom() {
    if (lb) return lb;
    var wrap = make("div", "kit-lb");
    wrap.hidden = true;
    var scrim = make("div", "kit-lb-scrim");
    scrim.setAttribute("aria-hidden", "true");
    var box = make("div", "kit-lb-box");
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("tabindex", "-1");
    var big = make("div", "kit-lb-big");
    var img = make("img");
    img.alt = "";
    big.appendChild(img);
    var cap = make("p", "kit-lb-cap");
    cap.id = "kit-lb-cap";
    var btn = make("button", "kit-lb-close");
    btn.type = "button";
    btn.setAttribute("aria-label", "关闭大图");
    btn.innerHTML = X_SVG;
    box.appendChild(big);
    box.appendChild(cap);
    box.appendChild(btn);
    wrap.appendChild(scrim);
    wrap.appendChild(box);
    doc.body.appendChild(wrap);
    lb = { wrap: wrap, scrim: scrim, box: box, big: big, img: img, cap: cap, btn: btn,
      state: "closed", anims: [], ghost: null, finish: null, B: null, thumb: null, opener: null, gen: 0, onClose: null };
    lb.entry = {
      layer: wrap,
      box: box,
      escape: function () { lbClose(); },
      close: function (o) { lbHide(!!(o && o.restore === false)); },
      restoreTo: function () { return lb.opener; }
    };
    /* 点哪儿都关：关闭按钮、大图、遮罩 */
    wrap.addEventListener("click", function () { lbClose(); });
    guardScroll(wrap);
    img.addEventListener("load", function () { if (lb.state === "open") lbLayout(); });
    window.addEventListener("resize", function () { if (lb.state === "open") lbLayout(); });
    return lb;
  }

  /* 缩略图实际画出来的那张图（按 object-fit / object-position 算，cover 时会比盒子大） */
  function posAt(v, free) {
    if (/%$/.test(v)) return free * parseFloat(v) / 100;
    if (/px$/.test(v)) return parseFloat(v);
    return free / 2;
  }
  function contentRect(img) {
    var r = img.getBoundingClientRect();
    var nw = img.naturalWidth, nh = img.naturalHeight;
    if (!nw || !nh || !r.width || !r.height) return null;
    var cs = getComputedStyle(img);
    var fit = cs.objectFit;
    var s;
    if (fit === "cover") s = Math.max(r.width / nw, r.height / nh);
    else if (fit === "contain") s = Math.min(r.width / nw, r.height / nh);
    else if (fit === "none") s = 1;
    else if (fit === "scale-down") s = Math.min(1, r.width / nw, r.height / nh);
    else return { x: r.left, y: r.top, w: r.width, h: r.height };   /* fill：按盒子拉伸 */
    var w = nw * s, h = nh * s;
    var pos = String(cs.objectPosition || "50% 50%").split(/\s+/);
    return { x: r.left + posAt(pos[0], r.width - w), y: r.top + posAt(pos[1] || "50%", r.height - h), w: w, h: h };
  }
  /* 缩略图看得见的那块：自己的盒子 ∩ 每一层会裁切的祖先 */
  function visibleRect(el) {
    var r = el.getBoundingClientRect();
    var x1 = r.left, y1 = r.top, x2 = r.right, y2 = r.bottom;
    for (var p = el.parentElement; p && p !== doc.body && p !== root; p = p.parentElement) {
      var cs = getComputedStyle(p);
      if (cs.overflowX === "visible" && cs.overflowY === "visible") continue;
      var q = p.getBoundingClientRect();
      var l = q.left + p.clientLeft, t = q.top + p.clientTop;
      x1 = Math.max(x1, l); y1 = Math.max(y1, t);
      x2 = Math.min(x2, l + p.clientWidth); y2 = Math.min(y2, t + p.clientHeight);
    }
    return { x: x1, y: y1, w: Math.max(0, x2 - x1), h: Math.max(0, y2 - y1) };
  }
  /* 完整可见：没被裁、在视口里、不压在吸顶的顶栏 / 固定的 tab bar 底下 */
  function fullyVisible(el) {
    var r = el.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    var v = visibleRect(el);
    if (Math.abs(v.w - r.width) > .5 || Math.abs(v.h - r.height) > .5) return false;
    if (r.left < -.5 || r.top < -.5 || r.right > root.clientWidth + .5 || r.bottom > root.clientHeight + .5) return false;
    var bars = $$("aside.side, nav.tabbar");
    for (var i = 0; i < bars.length; i++) {
      var cs = getComputedStyle(bars[i]);
      if (cs.display === "none" || (cs.position !== "fixed" && cs.position !== "sticky")) continue;
      var b = bars[i].getBoundingClientRect();
      if (b.left < r.right && b.right > r.left && b.top < r.bottom && b.bottom > r.top) return false;
    }
    return true;
  }
  function sameRatio(a, b) { return a.h > 0 && b.h > 0 && Math.abs(a.w / a.h - b.w / b.h) / (b.w / b.h) <= 0.02; }

  /* 大图框：按原图比例放进视口，上面给关闭按钮、下面给图注留地方；最多放大到原图的2倍 */
  function lbLayout() {
    var L = lb;
    var vw = root.clientWidth, vh = root.clientHeight;
    var t = L.thumb && L.thumb.tagName === "IMG" ? L.thumb : null;
    var nw = L.img.naturalWidth || (t && t.naturalWidth) || 4;
    var nh = L.img.naturalHeight || (t && t.naturalHeight) || 3;
    var padX = Math.max(16, vw * .04);
    var padTop = Math.max(64, vh * .08);
    var padBottom = L.cap.hidden ? Math.max(24, vh * .04) : Math.max(56, vh * .08);
    var aw = Math.max(40, vw - 2 * padX), ah = Math.max(40, vh - padTop - padBottom);
    var s = Math.min(aw / nw, ah / nh, 2);
    var w = nw * s, h = nh * s;
    L.B = { x: (vw - w) / 2, y: padTop + (ah - h) / 2, w: w, h: h };
    L.big.style.left = L.B.x + "px";
    L.big.style.top = L.B.y + "px";
    L.big.style.width = L.B.w + "px";
    L.big.style.height = L.B.h + "px";
  }
  function lerp(a, b, p) { return { x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p, w: a.w + (b.w - a.w) * p, h: a.h + (b.h - a.h) * p }; }
  function lbFrames(fromClip, fromImg, toClip, toImg, n) {
    var B = lb.B;
    var outer = [], inner = [];
    for (var i = 0; i <= n; i++) {
      var p = LB_EASE(i / n);
      var c = lerp(fromClip, toClip, p);
      var m = lerp(fromImg, toImg, p);
      var sx = c.w / B.w, sy = c.h / B.h;
      outer.push({ transform: "translate(" + (c.x - B.x) + "px," + (c.y - B.y) + "px) scale(" + sx + "," + sy + ")" });
      inner.push({ transform: "translate(" + (m.x - c.x) / sx + "px," + (m.y - c.y) / sy + "px) scale(" + m.w / (B.w * sx) + "," + m.h / (B.h * sy) + ")" });
    }
    return { outer: outer, inner: inner };
  }
  function lbGhost() {
    var B = lb.B;
    var g = make("div", "kit-lb-ghost");
    g.setAttribute("aria-hidden", "true");
    g.style.left = B.x + "px";
    g.style.top = B.y + "px";
    g.style.width = B.w + "px";
    g.style.height = B.h + "px";
    var gi = make("img");
    gi.alt = "";
    gi.src = lb.img.currentSrc || lb.img.src;
    gi.style.width = B.w + "px";
    gi.style.height = B.h + "px";
    g.appendChild(gi);
    lb.wrap.appendChild(g);
    return g;
  }
  function lbFade(el, from, to, ms) { return el.animate([{ opacity: from }, { opacity: to }], { duration: ms, easing: "linear", fill: "forwards" }); }
  /* 每次清场换一代：取消动画会让它的 finished 走 reject，settle 照样会跑收尾——上一代的收尾一律作废，
     不然中途关掉之后，被取消的打开动画会在下一个微任务里把状态改回 open（灯箱明明已经收起） */
  function lbStep(fn) {
    var g = lb.gen;
    return function () { if (g === lb.gen) fn(); };
  }
  function lbCleanup() {
    lb.gen++;
    lb.anims.forEach(function (a) { try { a.cancel(); } catch (e) { /* 已经结束 */ } });
    lb.anims = [];
    if (lb.ghost && lb.ghost.parentNode) lb.ghost.parentNode.removeChild(lb.ghost);
    lb.ghost = null;
    lb.wrap.classList.remove("is-morphing");
    lb.finish = null;
  }
  /* 直接到「关着」：noFocus 为真时不还焦点（换成另一个弹层、或马上又要开）。
     收起之后调这一次打开时给的 onClose：正常关完、中途再关直接到终态、被新灯箱或 sheet 顶掉，都在这里，只调一次 */
  function lbHide(noFocus) {
    if (!lb || lb.state === "closed") return;
    lbCleanup();
    lb.wrap.hidden = true;
    lb.state = "closed";
    pop(lb.entry);
    if (!noFocus && lb.opener && lb.opener.isConnected) focusNoScroll(lb.opener);
    var cb = lb.onClose;
    lb.onClose = null;
    if (cb) cb();
  }

  function lightbox(target, opts) {
    opts = opts || {};
    var L = lbDom();
    if (L.state !== "closed") lbHide(true);   /* 打断：上一次直接到终态（它的 onClose 在这里调掉） */
    L.onClose = typeof opts.onClose === "function" ? opts.onClose : null;
    var thumb = target && target.tagName === "IMG" ? target : (target && target.querySelector ? target.querySelector("img") : null);
    L.thumb = thumb || target || null;
    L.opener = opts.trigger || (L.thumb && L.thumb.closest ? L.thumb.closest("button, a[href], [tabindex]") : null) ||
      (doc.activeElement !== doc.body ? doc.activeElement : null);
    var src = opts.src || (thumb ? thumb.currentSrc || thumb.src : "");
    if (L.img.getAttribute("src") !== src) L.img.src = src;
    L.img.alt = opts.alt != null ? opts.alt : (thumb ? thumb.alt : "");
    var caption = opts.caption != null ? String(opts.caption) : L.img.alt;
    L.cap.textContent = caption;
    L.cap.hidden = !caption;
    if (caption) { L.box.setAttribute("aria-labelledby", "kit-lb-cap"); L.box.removeAttribute("aria-label"); }
    else { L.box.removeAttribute("aria-labelledby"); L.box.setAttribute("aria-label", "大图"); }
    if (window.StarShell && window.StarShell.closeMore) window.StarShell.closeMore(false);
    lbLayout();
    L.wrap.hidden = false;
    push(L.entry);
    focusNoScroll(L.btn);
    var api = { close: lbClose, el: L.wrap, isOpen: function () { return L.state !== "closed"; } };
    if (reduced() || !canAnimate) { L.state = "open"; return api; }
    L.state = "opening";
    var clip = thumb ? visibleRect(thumb) : null;
    var cont = thumb ? contentRect(thumb) : null;
    /* 大图刚换 src 时 complete 可能还是 false（第一次打开实测如此）；和已经加载好的缩略图同一个文件，尺寸就是已知的 */
    var loaded = (L.img.complete && L.img.naturalWidth > 0) ||
      !!(thumb && thumb.complete && thumb.naturalWidth > 0 && (thumb.currentSrc || thumb.src) === src);
    if (!loaded || !clip || !clip.w || !clip.h || !cont || !sameRatio(cont, L.B)) {
      L.anims = [lbFade(L.scrim, 0, 1, LB_OPEN_MS), lbFade(L.box, 0, 1, LB_OPEN_MS)];
      L.finish = settle(L.anims[1], LB_OPEN_MS + 120, lbStep(function () { lbCleanup(); L.state = "open"; }));
      return api;
    }
    L.ghost = lbGhost();
    L.wrap.classList.add("is-morphing");
    var f = lbFrames(clip, cont, L.B, L.B, LB_OPEN_FRAMES);
    var t = { duration: LB_OPEN_MS, easing: "linear", fill: "forwards" };
    L.anims = [L.ghost.animate(f.outer, t), L.ghost.firstChild.animate(f.inner, t),
      lbFade(L.scrim, 0, 1, LB_OPEN_MS), lbFade(L.cap, 0, 1, LB_OPEN_MS), lbFade(L.btn, 0, 1, LB_OPEN_MS)];
    L.finish = settle(L.anims[0], LB_OPEN_MS + 120, lbStep(function () { lbCleanup(); L.state = "open"; }));
    return api;
  }

  function lbClose() {
    var L = lb;
    if (!L || L.state === "closed") return;
    if (L.state === "opening" || L.state === "closing") { lbHide(); return; }   /* 动画中途又关：直接到终态 */
    if (reduced() || !canAnimate) { lbHide(); return; }
    L.state = "closing";
    var t = L.thumb;
    if (!t || !t.isConnected || t.tagName !== "IMG" || !fullyVisible(t) || !L.img.naturalWidth) {
      L.anims = [lbFade(L.box, 1, 0, LB_CLOSE_MS), lbFade(L.scrim, 1, 0, LB_CLOSE_MS)];
      L.finish = settle(L.anims[0], LB_CLOSE_MS + 120, lbStep(function () { lbHide(); }));
      return;
    }
    var clip = visibleRect(t), cont = contentRect(t);
    if (!cont) { L.state = "open"; lbHide(); return; }
    L.ghost = lbGhost();
    L.wrap.classList.add("is-morphing");
    var f = lbFrames(L.B, L.B, clip, cont, LB_CLOSE_FRAMES);
    var o = { duration: LB_CLOSE_MS, easing: "linear", fill: "forwards" };
    L.anims = [L.ghost.animate(f.outer, o), L.ghost.firstChild.animate(f.inner, o),
      lbFade(L.scrim, 1, 0, LB_CLOSE_MS), lbFade(L.cap, 1, 0, LB_CLOSE_MS), lbFade(L.btn, 1, 0, LB_CLOSE_MS)];
    L.finish = settle(L.anims[0], LB_CLOSE_MS + 120, lbStep(function () { lbHide(); }));
  }

  /* ================================================================
   * 原地翻面（ix-sheet-flip；行为从收藏页 collection.js 的 flipDemo 抽出来，同一套写法）
   * 透视、角度、时长写在样式里（kit.css .kit-flip-* 或页面自己的类）；这里切类、过90°那一帧换面、读屏同步。
   * ================================================================ */
  function flip(o) {
    o = o || {};
    var scene = o.scene, card = o.card || o.scene, front = o.front, back = o.back;
    var cls = o.flippedClass || "is-flipped";
    var flipped = false, shownBack = false, raf = 0;
    function label() { if (o.button && o.label) o.button.setAttribute("aria-label", o.label(flipped)); }
    /* computed transform 里 rotateY 的角度（0–180） */
    function angle() {
      var tr = getComputedStyle(card).transform;
      if (!tr || tr === "none" || typeof DOMMatrixReadOnly !== "function") return flipped ? 180 : 0;
      var m = new DOMMatrixReadOnly(tr);
      return Math.abs(Math.atan2(m.m31, m.m11) * 180 / Math.PI);
    }
    /* 读屏跟着视觉换面：看不见的那一面 aria-hidden + inert */
    function showFace(isBack) {
      if (isBack === shownBack) return;
      shownBack = isBack;
      if (front) { front.inert = isBack; front.setAttribute("aria-hidden", isBack ? "true" : "false"); }
      if (back) { back.inert = !isBack; back.setAttribute("aria-hidden", isBack ? "false" : "true"); }
      scene.setAttribute("data-face", isBack ? "back" : "front");
      if (o.onFace) o.onFace(isBack);
    }
    /* 翻到90度那一帧换面：每帧读 computed transform，过渡走完再按终态对一次 */
    function watch() {
      cancelAnimationFrame(raf);
      (function tick() {
        if (card.getAnimations && card.getAnimations().length) {
          showFace(angle() > 90);
          raf = requestAnimationFrame(tick);
        } else {
          showFace(flipped);
        }
      })();
    }
    function set(v) {
      flipped = !!v;
      scene.classList.toggle(cls, flipped);
      label();
      if (reduced()) { cancelAnimationFrame(raf); showFace(flipped); return; }
      watch();
    }
    if (front) { front.inert = false; front.setAttribute("aria-hidden", "false"); }
    if (back) { back.inert = true; back.setAttribute("aria-hidden", "true"); }
    scene.setAttribute("data-face", "front");
    label();
    if (o.button) o.button.addEventListener("click", function () { set(!flipped); });
    return { toggle: function () { set(!flipped); }, set: set, isFlipped: function () { return flipped; } };
  }

  window.StarKit = {
    sheet: sheet,
    ring: ring,
    ruler: ruler,
    photo: photo,
    lightbox: lightbox,
    flip: flip,
    bezier: bezier,
    findTransition: findTransition,
    follow: follow,
    reduced: reduced,
    isOpen: function () { return stack.length > 0; }
  };
})();
