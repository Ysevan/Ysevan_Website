/*
 * 交互页「弹窗 · 屋主收集」六个活样例（配 sheets.css）。普通 defer 脚本：file:// 下不用 module、不用 fetch。
 *
 * 每个样例一个 init，互不依赖；某个样例的 DOM 缺了就跳过。共同写法：
 *  - 开关只切类名（is-open），位移、缩放、填充、圆环、刻度全是 CSS 过渡；减弱动效时外壳把过渡全关了，自然直接到终点。
 *  - 要跟着动画走的 JS（圆环中心数字、翻面时读屏换面）不另起时钟：每帧读那条 CSS 过渡自己的 currentTime，
 *    按它自己的 delay / duration 折成进度，再按同一条三次贝塞尔算值。暂停、拖进度时两边也对得上；不用 setInterval。
 *  - 弹窗：role="dialog" + aria-modal + aria-labelledby；打开时舞台里的假页面 inert、焦点进框、Tab 在框内转圈；
 *    Esc、关闭按钮、点遮罩都能关，关了焦点还给打开按钮。凡处理按键，第一行先判输入法合成态。
 *  - 收尾走「事件 + 兜底」两条路：后台标签页的动画时钟可能停着，rAF 不来，过渡结束事件照样会来。
 */
(function () {
  "use strict";

  var doc = document;
  var mqReduce = null;
  try { mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)"); } catch (e) { mqReduce = null; }
  function reduced() { return !!(mqReduce && mqReduce.matches); }
  function $(sel, root) { return (root || doc).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function composing(e) { return !!(e.isComposing || e.keyCode === 229); }
  function focusNoScroll(el) { if (!el) return; try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } }

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
  var EASE = bezier(.2, .7, .2, 1);   /* 与 sheets.css 的 --sh-ease 同一条 */

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

  function focusables(root) {
    return $$("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])", root).filter(function (el) {
      if (el.disabled || el.closest("[inert]")) return false;
      if (!el.getClientRects().length) return false;
      return getComputedStyle(el).visibility !== "hidden";
    });
  }

  /* 一块舞台里的弹窗。opts：onOpen / onClose(instant) / onEscape()→true 表示这一下 Esc 已被样例自己用掉 / focus()→初始焦点 */
  function Sheet(stage, opts) {
    opts = opts || {};
    var page = $(".sh-page", stage);
    var dialog = $("[role='dialog']", stage);
    var openBtn = $(".sh-open", stage);
    var api = { stage: stage, dialog: dialog, isOpen: false };

    api.open = function () {
      if (api.isOpen) return;
      api.isOpen = true;
      if (opts.beforeOpen) opts.beforeOpen();
      if (page) page.inert = true;
      dialog.inert = false;
      stage.classList.add("is-open");
      stage.setAttribute("data-state", "open");
      if (opts.onOpen) opts.onOpen();
      focusNoScroll((opts.focus && opts.focus()) || focusables(dialog)[0] || dialog);
    };

    /* instant：重放用，过渡全关、瞬间回到关着的样子；keepFocus：不把焦点还回去（马上又要打开） */
    api.close = function (instant, keepFocus) {
      if (!api.isOpen) return;
      api.isOpen = false;
      /* 焦点在框里、或者点遮罩时被鼠标挪到了 body / 舞台上，关了都还给打开按钮 */
      var ae = doc.activeElement;
      var hadFocus = !ae || ae === doc.body || stage.contains(ae);
      if (instant) stage.classList.add("is-instant");
      stage.classList.remove("is-open");
      stage.setAttribute("data-state", "closed");
      dialog.inert = true;
      if (page) page.inert = false;
      if (opts.onClose) opts.onClose(!!instant);
      if (instant) {
        void stage.offsetWidth;                 /* 先按「关着、无过渡」算一遍样式 */
        stage.classList.remove("is-instant");
        void stage.offsetWidth;                 /* 值没变，放回过渡不会触发任何动画 */
      }
      if (!keepFocus && hadFocus) focusNoScroll(openBtn);
    };

    api.replay = function () {
      if (api.isOpen) api.close(true, true);
      api.open();
    };

    if (openBtn) openBtn.addEventListener("click", function () { api.open(); });
    $$("[data-close], .sh-close, .sh-close-main", stage).forEach(function (el) {
      el.addEventListener("click", function () { api.close(); });
    });
    dialog.addEventListener("keydown", function (e) {
      if (composing(e)) return;
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        if (opts.onEscape && opts.onEscape()) return;   /* 一下只退一层 */
        api.close();
        return;
      }
      if (e.key !== "Tab") return;
      var f = focusables(dialog);
      if (!f.length) { e.preventDefault(); return; }
      var first = f[0];
      var last = f[f.length - 1];
      if (e.shiftKey && (doc.activeElement === first || !dialog.contains(doc.activeElement))) { e.preventDefault(); focusNoScroll(last); }
      else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); focusNoScroll(first); }
    });
    return api;
  }

  function wireReplay(spec, sheet) {
    var btn = $(".sh-replay", spec);
    if (btn) btn.addEventListener("click", function () { sheet.replay(); });
  }

  /* 整块舞台关掉过渡、改状态、再放回（打开前把上一次留下的翻面 / 展开 / 显示复位，用户看不见这一下） */
  function silently(stage, fn) {
    stage.classList.add("is-instant");
    fn();
    void stage.offsetWidth;
    stage.classList.remove("is-instant");
    void stage.offsetWidth;
  }

  /* ---------------------------------------------------------------- 1 毛玻璃浮层 */
  function initFrosted() {
    var spec = $("[data-demo='sheet-frosted']");
    if (!spec) return;
    var stage = $(".sh-stage", spec);
    var sheet = Sheet(stage, {});
    wireReplay(spec, sheet);
    var sw = $(".sh-switch", spec);
    if (sw) sw.addEventListener("click", function () {
      var on = sw.getAttribute("aria-checked") !== "true";
      sw.setAttribute("aria-checked", on ? "true" : "false");
      stage.setAttribute("data-variant", on ? "dim" : "blur");
    });
  }

  /* ---------------------------------------------------------------- 2 圆环计数 */
  function initRing() {
    var spec = $("[data-demo='sheet-ring']");
    if (!spec) return;
    var stage = $(".sh-stage", spec);
    var arc = $(".sh-ring-arc", stage);
    var num = $(".sh-ring-num", stage);
    var target = Number(num.getAttribute("data-target")) || 0;
    var stop = null;
    var sheet = Sheet(stage, {
      onOpen: function () {
        if (stop) { stop(); stop = null; }
        var anim = reduced() ? null : findTransition(arc, "stroke-dashoffset");
        if (!anim) { num.textContent = String(target); return; }
        num.textContent = "0";
        /* 圆环那条过渡自己的时钟：delay .5s（等面板落定）、duration 1.2s、同一条曲线 */
        stop = follow(anim, function (p) { num.textContent = String(Math.round(target * EASE(p))); },
          function () { num.textContent = String(target); });
      },
      onClose: function () { if (stop) { stop(); stop = null; } }
    });
    wireReplay(spec, sheet);
  }

  /* ---------------------------------------------------------------- 3 刻度尺进度 */
  function initRuler() {
    var spec = $("[data-demo='sheet-ruler']");
    if (!spec) return;
    var stage = $(".sh-stage", spec);
    var ruler = $(".sh-ruler", stage);
    var weeks = Number(ruler.getAttribute("data-weeks")) || 53;
    var today = Number(ruler.getAttribute("data-today")) || 1;
    /* 2026年各月1日落在第几周（1月1日算第1周，每7天一格） */
    var monthStart = [1, 5, 9, 13, 18, 22, 26, 31, 35, 40, 44, 48];
    var html = "";
    for (var w = 1; w <= weeks; w++) {
      var cls = "sh-tick" + (w < today ? " is-past" : w === today ? " is-today" : "") + (monthStart.indexOf(w) >= 0 ? " is-month" : "");
      html += '<span class="' + cls + '" style="--i:' + (w - 1) + '"><span class="sh-tick-base"></span>' +
        (w === today ? '<span class="sh-tick-now"></span><span class="sh-tick-flag">今天</span>' : "") + "</span>";
    }
    ruler.innerHTML = html;

    var code = $(".sh-code", stage);
    var value = code.getAttribute("data-code") || "";
    var digits = 0;
    var slots = "";
    for (var c = 0; c < value.length; c++) {
      var ch = value.charAt(c);
      if (ch === " ") { slots += '<span class="sh-ch is-gap"></span>'; continue; }
      slots += '<span class="sh-ch" style="--j:' + digits + '"><span class="sh-ch-mask">•</span><span class="sh-ch-real">' + ch + "</span></span>";
      digits++;
    }
    code.innerHTML = slots;
    var reveal = $(".sh-reveal", stage);
    var live = $(".sh-live", stage);
    var srText = $(".sh-code-sr", stage);
    var lastReal = $$(".sh-ch-real", code).pop();
    var pending = null;

    function cancelPending() { if (pending) { pending(); pending = null; } }
    function setRevealed(on) {
      cancelPending();
      code.classList.toggle("is-revealed", on);
      reveal.textContent = on ? "隐藏" : "显示";
      stage.setAttribute("data-revealed", on ? "true" : "false");
      srText.textContent = "编号已隐藏";
      live.textContent = "";
      if (!on) return;
      /* 最后一个字落定后播一次完整编号：transitionend 与兜底计时器谁先到算谁 */
      var done = false;
      var timer = 0;
      function announce() {
        if (done) return;
        done = true;
        clearTimeout(timer);
        lastReal.removeEventListener("transitionend", onEnd);
        pending = null;
        srText.textContent = "编号 " + value;
        live.textContent = "编号 " + value;
      }
      function onEnd(e) { if (e.propertyName === "opacity") announce(); }
      lastReal.addEventListener("transitionend", onEnd);
      timer = setTimeout(announce, reduced() ? 30 : (digits - 1) * 50 + 200 + 120);
      pending = function () { done = true; clearTimeout(timer); lastReal.removeEventListener("transitionend", onEnd); };
    }
    reveal.addEventListener("click", function () { setRevealed(!code.classList.contains("is-revealed")); });

    var sheet = Sheet(stage, {
      beforeOpen: function () { if (code.classList.contains("is-revealed")) silently(stage, function () { setRevealed(false); }); },
      focus: function () { return reveal; },
      onClose: function () { cancelPending(); }
    });
    wireReplay(spec, sheet);
  }

  /* ---------------------------------------------------------------- 4 照片抽屉 */
  function initPhoto() {
    var spec = $("[data-demo='sheet-photo']");
    if (!spec) return;
    var stage = $(".sh-stage", spec);
    var sheet = Sheet(stage, {});
    wireReplay(spec, sheet);
  }

  /* ---------------------------------------------------------------- 5 原地翻面 */
  function initFlip() {
    var spec = $("[data-demo='sheet-flip']");
    if (!spec) return;
    var stage = $(".sh-stage", spec);
    var scene = $(".sh-flip-scene", stage);
    var card = $(".sh-flip-card", stage);
    var btn = $(".sh-flip-btn", stage);
    var front = $(".sh-face-front", stage);
    var back = $(".sh-face-back", stage);
    var flipped = false;
    var shownBack = false;
    var raf = 0;

    /* computed transform 里 rotateY 的角度（0–180） */
    function angle() {
      var tr = getComputedStyle(card).transform;
      if (!tr || tr === "none" || typeof DOMMatrixReadOnly !== "function") return flipped ? 180 : 0;
      var m = new DOMMatrixReadOnly(tr);
      return Math.abs(Math.atan2(m.m31, m.m11) * 180 / Math.PI);
    }
    /* 读屏这边跟着视觉换面：看不见的那一面 aria-hidden + inert */
    function showFace(isBack) {
      if (isBack === shownBack) return;
      shownBack = isBack;
      front.inert = isBack;
      front.setAttribute("aria-hidden", isBack ? "true" : "false");
      back.inert = !isBack;
      back.setAttribute("aria-hidden", isBack ? "false" : "true");
      stage.setAttribute("data-face", isBack ? "back" : "front");
    }
    /* 翻到 90 度那一帧换面：每帧读 computed transform，过渡没了再按终态对一次 */
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
    function setFlipped(v) {
      flipped = v;
      scene.classList.toggle("is-flipped", v);
      btn.setAttribute("aria-label", v ? "翻回正面" : "翻到背面，出示编号");
      if (reduced()) { showFace(v); return; }
      watch();
    }
    btn.addEventListener("click", function () { setFlipped(!flipped); });

    var sheet = Sheet(stage, {
      beforeOpen: function () {
        if (!flipped) return;
        cancelAnimationFrame(raf);
        silently(stage, function () { setFlipped(false); showFace(false); });
      },
      focus: function () { return btn; },
      onClose: function () { }
    });
    wireReplay(spec, sheet);
  }

  /* ---------------------------------------------------------------- 6 下拉展开 */
  function initPull() {
    var spec = $("[data-demo='sheet-pull']");
    if (!spec) return;
    var stage = $(".sh-stage", spec);
    var box = $(".sh-pull-sheet", stage);
    var lower = $(".sh-pull-lower", stage);
    var handle = $(".sh-pull-handle", stage);
    var toggle = $(".sh-pull-toggle", stage);
    var info = $(".sh-pull-info", stage);
    var handleText = $("span", handle);
    var expanded = false;
    var drag = null;
    var swallowClick = false;
    var THRESHOLD = .4;   /* 原文：超过40%松手就展开 */

    function dist() { return info.offsetHeight || 124; }
    function setExpanded(v, how) {
      expanded = v;
      box.classList.toggle("is-expanded", v);
      lower.setAttribute("data-release", how || "");
      handle.setAttribute("aria-expanded", v ? "true" : "false");
      toggle.setAttribute("aria-expanded", v ? "true" : "false");
      toggle.textContent = v ? "收起完整信息" : "展开完整信息";
      handle.setAttribute("aria-label", v ? "向上推回，收起完整信息" : "下拉展开完整信息");
      if (handleText) handleText.textContent = v ? "向上推回" : "向下拉开";
      info.inert = !v;
      info.setAttribute("aria-hidden", v ? "false" : "true");
      stage.setAttribute("data-expanded", v ? "true" : "false");
    }

    handle.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      swallowClick = false;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, d: dist(), moved: false, p: expanded ? 1 : 0, from: expanded };
      try { handle.setPointerCapture(e.pointerId); } catch (err) { /* 不支持就靠冒泡 */ }
    });
    handle.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dy = e.clientY - drag.y;
      var dx = e.clientX - drag.x;
      if (!drag.moved) {
        if (Math.abs(dy) < 4 && Math.abs(dx) < 4) return;
        drag.moved = true;
        lower.classList.add("is-dragging");   /* 拖动中关掉过渡，直接跟手 */
      }
      var y = (drag.from ? drag.d : 0) + dy;
      if (y > drag.d) y = drag.d + (y - drag.d) / 3;   /* 拉过头带阻尼 */
      if (y < 0) y = 0;
      var p = y / drag.d;
      drag.p = p;
      /* 摆动：随拉开程度先歪后正（正弦），左右拖再加一点；封顶 ±2 度 */
      var rot = clamp(2 * Math.sin(Math.min(p, 1) * Math.PI) + dx * .04, -2, 2);
      lower.style.transform = "translateY(" + y.toFixed(2) + "px) rotate(" + rot.toFixed(3) + "deg)";
    });
    function endDrag(e, cancelled) {
      if (!drag || e.pointerId !== drag.id) return;
      var d = drag;
      drag = null;
      if (!d.moved) return;   /* 没拖动：交给 click */
      /* 拖过的那一下要吞掉随后的 click：鼠标松开紧跟着就是 click（同一个任务里）。触摸拖动后根本没有 click，
         旗标留着会把下一次键盘回车 / 空格的 click 吃掉——所以下一拍就放掉，且键盘的 click（detail 0）从不吞 */
      swallowClick = true;
      setTimeout(function () { swallowClick = false; }, 0);
      lower.classList.remove("is-dragging");
      lower.style.transform = "";
      var next = cancelled ? d.from : (d.from ? d.p > 1 - THRESHOLD : d.p > THRESHOLD);
      setExpanded(next, next ? "expand" : "spring");
    }
    handle.addEventListener("pointerup", function (e) { endDrag(e, false); });
    handle.addEventListener("pointercancel", function (e) { endDrag(e, true); });
    handle.addEventListener("click", function (e) {
      if (swallowClick && e.detail > 0) { swallowClick = false; return; }
      setExpanded(!expanded, expanded ? "spring" : "expand");
    });
    handle.addEventListener("keydown", function (e) {
      if (composing(e)) return;
      if (e.key === "ArrowDown") { e.preventDefault(); if (!expanded) setExpanded(true, "expand"); }
      else if (e.key === "ArrowUp") { e.preventDefault(); if (expanded) setExpanded(false, "spring"); }
    });
    toggle.addEventListener("click", function () { setExpanded(!expanded, expanded ? "spring" : "expand"); });

    var sheet = Sheet(stage, {
      beforeOpen: function () { if (expanded) silently(stage, function () { setExpanded(false, ""); }); },
      focus: function () { return handle; },
      onEscape: function () {
        if (!expanded) return false;
        setExpanded(false, "spring");
        return true;
      },
      onClose: function () {
        if (drag) { drag = null; lower.classList.remove("is-dragging"); lower.style.transform = ""; }
      }
    });
    wireReplay(spec, sheet);
  }

  function init() {
    initFrosted();
    initRing();
    initRuler();
    initPhoto();
    initFlip();
    initPull();
  }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", init);
  else init();
})();
