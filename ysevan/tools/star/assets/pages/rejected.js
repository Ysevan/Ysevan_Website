/*
 * 否掉的方向（rejected.html）专属脚本（defer，排在 star.js 之后）
 *   1. 共用：播报、减弱动效、单选组（方向键由 star.js 统一处理：移动焦点并 click）、颜色与对比度
 *   2. 虚拟画布：不支持 tan(atan2()) 或容器单位的内核，按框宽补 --k（支持时 CSS 自己算，这里什么都不做）
 *   3. 时间线：按范围筛，播报条数
 *   4. 对照条：拖分界线 / 键盘 / 三档按钮；整块换（swap）；把左边那份缩微页抄一份给右边（data-clone）
 *   5. 变体胶囊：左边换哪一套（data-vars），读数跟着换
 *   6. 粉彩：右边那块的强调色（只改右边容器的 data-accent，不碰全站）
 *   7. 苹果第一版：屋主点的四处（切到对应那版、拉满被否那边、亮出那一圈）
 *   8. 大屏：放大倍数曲线、三台设备、严格等比与填满
 *   9. 球与 Cover Flow
 *  10. 展示五选
 *  11. 夜色：现算对比度
 *  12. 换房间：四版转场（WAAPI，代数守卫：中途重来时旧的一代全部作废）
 * 只改样例自己的属性，不碰 <html> 的 data-mode / data-accent，不写 localStorage，不写外壳保留属性。
 * 任何回车 / Esc 的处理先判输入法合成态；减弱动效下 JS 动画直接到终态（外壳只关得掉 CSS 的）。
 */
(function () {
  "use strict";
  var doc = document;
  var root = doc.documentElement;

  /* ---------- 1. 共用 ---------- */
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return (ctx || doc).querySelectorAll(sel); }
  function announce(msg) { if (window.StarShell && window.StarShell.announce) window.StarShell.announce(msg); }
  var mqReduce = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  function reduced() { return !!(mqReduce && mqReduce.matches); }
  function composing(e) { return !!(e.isComposing || e.keyCode === 229); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  var canAnimate = typeof Element !== "undefined" && typeof Element.prototype.animate === "function";

  /* 单选组：点哪项选哪项（roving tabindex）；方向键由 star.js 移动焦点并 click */
  function selectRadio(group, b) {
    each(group.querySelectorAll('[role="radio"]'), function (r) {
      var on = r === b;
      r.setAttribute("aria-checked", on ? "true" : "false");
      r.setAttribute("tabindex", on ? "0" : "-1");
    });
  }
  function radios(group, onPick) {
    group.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest('[role="radio"]') : null;
      if (!b || !group.contains(b)) return;
      selectRadio(group, b);
      onPick(b);
    });
  }
  function pressGroup(group, sel, b) {
    each(group.querySelectorAll(sel), function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
  }

  /* WCAG 2.x 对比度 */
  function rgb(hex) { var h = hex.replace("#", ""); return [0, 2, 4].map(function (i) { return parseInt(h.slice(i, i + 2), 16); }); }
  function lin(c) { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  function lum(hex) { var c = rgb(hex); return 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]); }
  function ratio(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }

  /* ---------- 2. 虚拟画布：缩放兜底 ---------- */
  var cqOK = !!(window.CSS && CSS.supports && CSS.supports("width: calc(100cqw * tan(atan2(1px, 1px)))"));
  function fitBoxes() {
    if (cqOK) return;
    each($$(".rj-box"), function (box) {
      var mw = parseFloat(getComputedStyle(box).getPropertyValue("--mw")) || 1;
      var k = box.clientWidth / mw;
      each(box.querySelectorAll(".rj-mock"), function (m) { m.style.setProperty("--k", String(k)); });
    });
  }
  fitBoxes();
  if (!cqOK) window.addEventListener("resize", fitBoxes);
  /* 虚拟画布的缩放比（拖动时把屏幕像素换回画布像素用） */
  function boxScale(box) {
    var mw = parseFloat(getComputedStyle(box).getPropertyValue("--mw")) || box.clientWidth || 1;
    return (box.getBoundingClientRect().width || mw) / mw;
  }

  /* ---------- 3. 时间线 ---------- */
  (function () {
    var group = $("[data-tl-filter]");
    var body = $("[data-tl-body]");
    var count = $("[data-tl-count]");
    if (!group || !body) return;
    var names = { all: "全部", tools: "工具", xiaowu: "小屋" };
    function apply(scope) {
      var n = 0;
      each(body.querySelectorAll("tr"), function (tr) {
        var show = scope === "all" || tr.getAttribute("data-scope") === scope;
        tr.hidden = !show;
        if (show) n += 1;
      });
      if (count) count.textContent = "共" + n + "条";
      return n;
    }
    radios(group, function (b) {
      var s = b.getAttribute("data-scope-pick");
      var n = apply(s);
      announce("时间线只看" + names[s] + "，共" + n + "条");
    });
    apply("all");
  })();

  /* ---------- 4. 对照条 ---------- */
  each($$("[data-cmp]"), function (cmp) {
    var box = $("[data-cmp-box]", cmp);
    var oldMock = $('[data-pane="old"] .rj-mock', cmp);
    // 右边那份和左边是同一张页面，只换 data-v：抄一份，免得 HTML 里写两遍
    each(cmp.querySelectorAll("[data-clone]"), function (m) {
      if (!m.firstElementChild && oldMock) m.innerHTML = oldMock.innerHTML;
      // 抄过来的「屋主点的那一处」描边只在左边用
      each(m.querySelectorAll(".mk-spot"), function (s) { s.parentNode.removeChild(s); });
    });
    // plan 详情：对话框里的内容就是栏里那一份
    each(cmp.querySelectorAll(".w-dlg"), function (d) {
      var col = d.parentNode.querySelector(".w-col");
      if (col && !d.firstElementChild) d.innerHTML = col.innerHTML;
    });

    if (cmp.getAttribute("data-mode") === "swap") {
      var segS = $('[role="radiogroup"]', cmp);
      var readS = cmp.parentNode.querySelector("[data-cmp-read]");
      if (segS) radios(segS, function (b) {
        var side = b.getAttribute("data-show-side");
        cmp.setAttribute("data-show", side);
        var t = readS ? readS.getAttribute(side === "old" ? "data-read-old" : "data-read-new") : "";
        if (readS) readS.textContent = t;
        announce(t);
      });
      return;
    }

    var knob = $(".rj-knob", cmp);
    var seg = $('[role="radiogroup"]', cmp);
    var cut = 50;
    function label(v) {
      if (v >= 100) return "只看被否的样子";
      if (v <= 0) return "只看现行";
      if (v === 50) return "被否的样子占一半";
      return "被否的样子占" + v + "%";
    }
    function setCut(v, speak) {
      cut = clamp(Math.round(v), 0, 100);
      cmp.style.setProperty("--cut", cut + "%");
      cmp.classList.toggle("is-no-old", cut < 12);
      cmp.classList.toggle("is-no-new", cut > 88);
      if (knob) {
        knob.setAttribute("aria-valuenow", String(cut));
        knob.setAttribute("aria-valuetext", label(cut));
      }
      if (seg) {
        var hit = null;
        each(seg.querySelectorAll('[role="radio"]'), function (r) { if (+r.getAttribute("data-cut") === cut) hit = r; });
        each(seg.querySelectorAll('[role="radio"]'), function (r) {
          r.setAttribute("aria-checked", r === hit ? "true" : "false");
          // 不在三档上时，Tab 仍停在「对半」那颗
          r.setAttribute("tabindex", (hit ? r === hit : +r.getAttribute("data-cut") === 50) ? "0" : "-1");
        });
      }
      if (speak) announce(label(cut));
    }
    cmp.rjSetCut = setCut;

    /* 鼠标按下就跟；触摸要先横着走出 6px 才算拖（框上 touch-action: pan-y，竖着划是滚页面，
       按下那一刻就挪线的话，手机上每次从框上划过去分界线都会跳到手指那儿）。触摸点一下不划：抬手时挪到那里。 */
    var drag = null;
    function fromPointer(e) {
      var r = box.getBoundingClientRect();
      if (!r.width) return;
      setCut((e.clientX - r.left) / r.width * 100, false);
    }
    box.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      var touch = e.pointerType !== "mouse";
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, live: !touch, touch: touch };
      if (!touch) {
        try { box.setPointerCapture(e.pointerId); } catch (err) {}
        cmp.classList.add("is-dragging");
        fromPointer(e);
        e.preventDefault();
      }
    });
    box.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.live) {
        if (Math.abs(e.clientX - drag.x) < 6 || Math.abs(e.clientX - drag.x) < Math.abs(e.clientY - drag.y)) return;
        drag.live = true;
        try { box.setPointerCapture(e.pointerId); } catch (err) {}
        cmp.classList.add("is-dragging");
      }
      fromPointer(e);
    });
    function end(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var d = drag;
      drag = null;
      cmp.classList.remove("is-dragging");
      if (e.type === "pointercancel" && !d.live) return;
      if (!d.live && d.touch && Math.abs(e.clientX - d.x) < 6 && Math.abs(e.clientY - d.y) < 6) fromPointer(e);
      if (d.live || d.touch) announce(label(cut));
    }
    box.addEventListener("pointerup", end);
    box.addEventListener("pointercancel", end);
    if (knob) knob.addEventListener("keydown", function (e) {
      if (composing(e)) return;
      var v = null;
      switch (e.key) {
        case "ArrowLeft": case "ArrowDown": v = cut - 5; break;
        case "ArrowRight": case "ArrowUp": v = cut + 5; break;
        case "PageDown": v = cut - 20; break;
        case "PageUp": v = cut + 20; break;
        case "Home": v = 0; break;
        case "End": v = 100; break;
      }
      if (v === null) return;
      e.preventDefault();
      setCut(v, true);
    });
    if (seg) radios(seg, function (b) { setCut(+b.getAttribute("data-cut"), true); });
    setCut(50, false);
  });

  /* ---------- 5. 变体胶囊 ---------- */
  each($$("[data-vars]"), function (group) {
    var spec = group.closest(".specimen");
    var target = spec.querySelector("[data-vars-target]") || spec.querySelector('[data-pane="old"] .rj-mock');
    var read = spec.querySelector("[data-vars-read]");
    function pick(b, speak) {
      pressGroup(group, ".rj-var", b);
      if (target) target.setAttribute("data-v", b.getAttribute("data-v"));
      if (read) read.textContent = "左边：" + b.getAttribute("data-note");
      if (speak) announce("左边换成：" + b.textContent.replace(/\s+/g, " ").trim());
      spec.dispatchEvent(new CustomEvent("rj-vars", { detail: b.getAttribute("data-v") }));
    }
    group.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest(".rj-var") : null;
      if (!b || !group.contains(b)) return;
      pick(b, true);
    });
    group.rjPick = function (v, speak) {
      var hit = group.querySelector('.rj-var[data-v="' + v + '"]');
      if (hit) pick(hit, speak);
    };
  });

  /* ---------- 6. 粉彩：右边那块的强调色 ---------- */
  (function () {
    var group = $("[data-acc-group]");
    if (!group) return;
    var pane = group.closest(".rj-cmp").querySelector('[data-pane="new"]');
    var names = { blue: "蓝", green: "绿", indigo: "靛", orange: "橙", pink: "粉", teal: "青" };
    var chosen = null;
    function sync() {
      var cur = chosen || root.getAttribute("data-accent") || "blue";
      each(group.querySelectorAll(".rj-accent"), function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-acc") === cur ? "true" : "false"); });
    }
    group.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest(".rj-accent") : null;
      if (!b) return;
      chosen = b.getAttribute("data-acc");
      pane.setAttribute("data-accent", chosen);
      sync();
      announce("右边的强调色换成" + names[chosen] + "，底子不变");
    });
    if (window.StarTheme && window.StarTheme.onChange) window.StarTheme.onChange(sync);
    sync();
  })();

  /* ---------- 7. 苹果第一版：屋主点的四处 ---------- */
  (function () {
    var list = $("[data-spots]");
    if (!list) return;
    var spec = list.closest(".specimen");
    var cmp = spec.querySelector("[data-cmp]");
    var vars = spec.querySelector("[data-vars]");
    var oldPane = spec.querySelector('[data-pane="old"]');
    list.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest(".rj-spot-btn") : null;
      if (!b) return;
      var on = b.getAttribute("aria-pressed") !== "true";
      pressGroup(list, ".rj-spot-btn", on ? b : null);
      var n = b.getAttribute("data-rj-spot");   /* 不用 data-spot：那是外壳跳转点保留属性 */
      if (on) {
        if (vars && vars.rjPick) vars.rjPick(b.getAttribute("data-spot-v"), false);
        if (cmp && cmp.rjSetCut) cmp.rjSetCut(100, false);
      }
      each(oldPane.querySelectorAll(".mk-spot"), function (s) { s.classList.toggle("is-on", on && s.getAttribute("data-spot-box") === n); });
      announce(on ? "第" + n + "处，屋主说：" + b.getAttribute("data-said") : "收起第" + n + "处");
    });
  })();

  /* ---------- 8. 大屏：放大倍数曲线 ---------- */
  (function () {
    var big = $("[data-big]");
    if (!big) return;
    var svg = $("[data-big-chart]", big);
    var input = $("[data-big-w]", big);
    var out = $("[data-big-wout]", big);
    var read = $("[data-big-read]", big);
    var cur = $("[data-big-cur]", big);
    var strict = $("[data-big-strict]", big);
    var gapEl = $("[data-big-gap]", big);
    var presets = big.querySelector(".rj-presets");
    var g = $("[data-big-grid]", big);
    var NS = "http://www.w3.org/2000/svg";
    // 画布宽跟着框宽走（360–600），窄屏上字不至于缩成一团；高固定 250
    var VW = 600, X0 = 50, X1 = 580, Y0 = 222, Y1 = 14, S0 = 0.95, S1 = 1.5;
    function x(w) { return X0 + (w - 1440) / 1120 * (X1 - X0); }
    function y(s) { return Y0 - (s - S0) / (S1 - S0) * (Y0 - Y1); }
    // 现行：视口 ÷ 1440，1 到 1.45；线性爬坡：1440→2560 一条直线；初版：正文 clamp(13px, .35vw + 10px, 17px) 对 1440 处的倍数
    var F = {
      now: function (w) { return clamp(w / 1440, 1, 1.45); },
      lin: function (w) { return Math.min(1 + (w - 1440) * 0.000401786, 1.45); },
      v1: function (w) { return clamp(0.35 * w / 100 + 10, 13, 17) / (0.35 * 14.4 + 10); }
    };
    function path(fn) {
      var d = "";
      for (var w = 1440; w <= 2560; w += 8) d += (w === 1440 ? "M" : "L") + x(w).toFixed(1) + " " + y(fn(w)).toFixed(1);
      return d;
    }
    function el(tag, attrs, text) {
      var n = doc.createElementNS(NS, tag);
      for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) n.setAttribute(k, attrs[k]);
      if (text) n.textContent = text;
      g.appendChild(n);
      return n;
    }
    function draw() {
      var w = svg.getBoundingClientRect().width || 600;
      var nv = Math.round(clamp(w, 360, 600));
      if (nv === VW && g.firstChild) return;
      VW = nv; X1 = VW - 20;
      svg.setAttribute("viewBox", "0 0 " + VW + " 250");
      while (g.firstChild) g.removeChild(g.firstChild);
      [1, 1.1, 1.2, 1.3, 1.4, 1.5].forEach(function (s) {
        el("line", { "class": s === 1 ? "ax" : "grid", x1: X0, x2: X1, y1: y(s), y2: y(s) });
        el("text", { x: X0 - 8, y: y(s) + 4, "text-anchor": "end" }, s.toFixed(s === 1 ? 0 : 1) + "×");
      });
      el("line", { "class": "ax", x1: X0, x2: X0, y1: Y1, y2: Y0 });
      var narrow = VW < 480;
      [[1440, "1440"], [2040, narrow ? "2040" : "台式2040"], [2088, narrow ? "" : "2088封顶"], [2552, narrow ? "2552" : "笔记本2552"]].forEach(function (d) {
        el("line", { "class": "dev", x1: x(d[0]), x2: x(d[0]), y1: Y1, y2: Y0 });
        // 2088 那根线的字写在顶上，免得和「台式2040」挤在一起
        if (d[1]) el("text", d[0] === 2088 ? { x: x(d[0]) + 4, y: Y1 + 10, "text-anchor": "start" } : { x: x(d[0]), y: Y0 + 16, "text-anchor": "middle" }, d[1]);
      });
      each(big.querySelectorAll("[data-big-ln]"), function (p) { p.setAttribute("d", path(F[p.getAttribute("data-big-ln")])); });
      update(false);
    }
    function update(speak) {
      var w = +input.value;
      var n = F.now(w), l = F.lin(w), v = F.v1(w);
      out.textContent = w + "px";
      cur.setAttribute("transform", "translate(" + x(w).toFixed(1) + " 0)");
      each(cur.querySelectorAll("[data-big-pt]"), function (c) { c.setAttribute("cy", y(F[c.getAttribute("data-big-pt")](w)).toFixed(1)); });
      var t = w + "px：现行" + n.toFixed(3) + "；线性爬坡" + l.toFixed(3) + (n / l > 1.005 ? "（现行是它的" + (n / l).toFixed(2) + "倍）" : "") + "；初版正文只涨到" + v.toFixed(2);
      read.textContent = t;
      // 严格等比：1440 构图 × scale，超出的部分两边留白；填满：没有白边
      var comp = Math.min(w, 1440 * n);
      var gap = Math.max(0, Math.round((w - comp) / 2));
      strict.querySelector("i").style.transform = "scaleX(" + (comp / w).toFixed(4) + ")";
      strict.classList.toggle("is-gap", gap > 0);
      gapEl.textContent = gap > 0 ? "两边各空" + gap + "px" : "这一档还没有白边（2088以下）";
      each(presets.querySelectorAll("[data-big-preset]"), function (b) { b.setAttribute("aria-pressed", +b.getAttribute("data-big-preset") === w ? "true" : "false"); });
      if (speak) announce(t);
    }
    input.addEventListener("input", function () { update(false); });
    input.addEventListener("change", function () { update(true); });
    presets.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("[data-big-preset]") : null;
      if (!b) return;
      input.value = b.getAttribute("data-big-preset");
      update(true);
    });
    draw();
    var rt = 0;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(draw, 120); });
  })();

  /* ---------- 9. 球与 Cover Flow ---------- */
  var HUES = [212, 262, 330, 18, 44, 150, 190, 286, 352, 30, 120, 228, 300];
  function makeCards(scene, n) {
    var cards = [];
    for (var i = 0; i < n; i++) {
      var c = doc.createElement("span");
      c.className = "mk-card";
      c.style.setProperty("--h", String(HUES[i % HUES.length]));
      c.innerHTML = "<b>" + (i < 9 ? "0" : "") + (i + 1) + "</b>";
      scene.appendChild(c);
      cards.push(c);
    }
    return cards;
  }
  /* 舞台：拖动（画布像素）+ 键盘 ←→ / Home / End；回调里各自处理 */
  function stageInput(box, h) {
    var drag = null;
    box.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, k: boxScale(box), moved: false };
      try { box.setPointerCapture(e.pointerId); } catch (err) {}
      box.classList.add("is-dragging");
      if (h.down) h.down();
    });
    box.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = (e.clientX - drag.x) / drag.k, dy = (e.clientY - drag.y) / drag.k;
      if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
      drag.x = e.clientX; drag.y = e.clientY;
      if (h.move) h.move(dx, dy);
    });
    function end(e) {
      if (!drag || e.pointerId !== drag.id) return;
      var moved = drag.moved;
      drag = null;
      box.classList.remove("is-dragging");
      if (h.up) h.up(moved);
    }
    box.addEventListener("pointerup", end);
    box.addEventListener("pointercancel", end);
    box.addEventListener("keydown", function (e) {
      if (composing(e)) return;
      var d = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[e.key];
      if (e.key === "Home") { e.preventDefault(); h.go(0, true); return; }
      if (e.key === "End") { e.preventDefault(); h.go(h.count - 1, true); return; }
      if (!d) return;
      e.preventDefault();
      h.step(d, true);
    });
  }

  /* 球：照 card 18cb755 的几何（见条目「数值」）。CSS 坐标 y 朝下：three 的 Rx(p) = CSS rotateX(-p)，Ry(a) = rotateY(a) */
  var ball = null;
  (function () {
    var box = $("[data-ball]");
    if (!box) return;
    var scene = $("[data-ball-scene]", box);
    var read = $("[data-ball-read]");
    var N = 13, MW = 360, MH = 300;
    var DIST = 4.6, FOV = 30 * Math.PI / 180, CAM = 10 * Math.PI / 180, LIMIT = 1.1;
    var unit = MH / (2 * DIST * Math.tan(FOV / 2));
    scene.style.perspective = (DIST * unit).toFixed(1) + "px";
    var cam = doc.createElement("div");
    cam.className = "mk-ball-cam";
    cam.style.transform = "rotateX(" + (-CAM) + "rad)";
    var globe = doc.createElement("div");
    globe.className = "mk-globe";
    cam.appendChild(globe);
    scene.appendChild(cam);
    var cards = makeCards(globe, N);
    var GOLD = Math.PI * (3 - Math.sqrt(5));
    var dirs = [];
    var cw = 0.5 * unit, ch = 0.75 * unit;
    cards.forEach(function (c, i) {
      var yy = 1 - 2 * (i + 0.5) / N;
      var r = Math.sqrt(1 - yy * yy);
      var th = i * GOLD;
      var d = { x: Math.cos(th) * r, y: yy, z: Math.sin(th) * r };
      d.lon = Math.atan2(d.x, d.z);
      d.lat = Math.asin(d.y);
      dirs.push(d);
      c.style.width = cw.toFixed(1) + "px";
      c.style.height = ch.toFixed(1) + "px";
      c.style.margin = (-ch / 2).toFixed(1) + "px 0 0 " + (-cw / 2).toFixed(1) + "px";
      c.style.transform = "rotateY(" + d.lon.toFixed(4) + "rad) rotateX(" + d.lat.toFixed(4) + "rad) translateZ(" + unit.toFixed(1) + "px)";
      c.querySelector("b").style.fontSize = "9px";
    });
    function facing(d) {
      return { yaw: Math.atan2(-d.x, d.z), pitch: clamp(Math.atan2(d.y, Math.hypot(d.x, d.z)), -LIMIT, LIMIT) };
    }
    function depth(d, yaw, pitch) {
      // three：先 Ry(yaw)、再 Rx(pitch)、再相机俯视 Rx(CAM)，取 z
      var x1 = d.x * Math.cos(yaw) + d.z * Math.sin(yaw), z1 = -d.x * Math.sin(yaw) + d.z * Math.cos(yaw), y1 = d.y;
      var y2 = y1 * Math.cos(pitch) - z1 * Math.sin(pitch), z2 = y1 * Math.sin(pitch) + z1 * Math.cos(pitch);
      return y2 * Math.sin(CAM) + z2 * Math.cos(CAM);
    }
    var start = facing(dirs[6]);
    var st = { yaw: start.yaw, pitch: start.pitch, ty: start.yaw, tp: start.pitch, cur: 6, front: 6, idleAt: 0, spinning: false };
    function nearestTurn(target, ref) { var t = target; while (t - ref > Math.PI) t -= 2 * Math.PI; while (t - ref < -Math.PI) t += 2 * Math.PI; return t; }
    function frontmost() {
      var best = 0, bz = -9;
      dirs.forEach(function (d, i) { var z = depth(d, st.yaw, st.pitch); if (z > bz) { bz = z; best = i; } });
      return best;
    }
    function paint() {
      globe.style.transform = "rotateX(" + (-st.pitch).toFixed(4) + "rad) rotateY(" + st.yaw.toFixed(4) + "rad)";
      var f = frontmost();
      cards.forEach(function (c, i) {
        var z = depth(dirs[i], st.yaw, st.pitch);
        var t = clamp((z + 0.2) / 1.2, 0, 1);
        c.style.opacity = (0.35 + 0.65 * t * t * (3 - 2 * t)).toFixed(3);
        c.classList.toggle("is-cur", i === f);
      });
      if (f !== st.front) { st.front = f; say(false); }
    }
    function say(speak) {
      var d = dirs[st.front];
      var lat = Math.round(d.lat * 180 / Math.PI);
      var t = "正前：第" + (st.front + 1) + "张，纬度" + lat + "°";
      if (Math.abs(d.lat) > LIMIT) t += "——超过俯仰限63°，转不到正面";
      else if (st.spinning) t += "，正在自转";
      read.textContent = t;
      if (speak) announce(t);
    }
    function settle(i, speak) {
      var f = facing(dirs[i]);
      st.cur = i;
      st.ty = nearestTurn(f.yaw, st.yaw);
      st.tp = f.pitch;
      st.spinning = false;
      st.idleAt = performance.now();
      if (reduced()) { st.yaw = st.ty; st.pitch = st.tp; paint(); }
      wake();
      if (speak) { st.front = i; say(true); }
    }
    var raf = 0, last = 0;
    function tick(now) {
      raf = 0;
      var dt = last ? Math.min(64, now - last) : 16;
      last = now;
      var moving = false;
      if (!drag) {
        var k = 1 - Math.exp(-dt / 110);
        if (Math.abs(st.ty - st.yaw) > 0.0006 || Math.abs(st.tp - st.pitch) > 0.0006) {
          st.yaw += (st.ty - st.yaw) * k;
          st.pitch += (st.tp - st.pitch) * k;
          moving = true;
        } else { st.yaw = st.ty; st.pitch = st.tp; }
        // 停 3 秒自转，约 80 秒一圈（只在看得见、没减弱动效时）
        if (!moving && !reduced() && now - st.idleAt > 3000) {
          if (!st.spinning) { st.spinning = true; say(false); }
          st.yaw += (2 * Math.PI / 80) * dt / 1000;
          st.ty = st.yaw;
          moving = true;
        }
      }
      paint();
      if (moving || drag) wake();
      else {
        last = 0;
        // 停稳了：3 秒后再醒来起转（减弱动效不转）
        if (!reduced()) { clearTimeout(idleTimer); idleTimer = setTimeout(wake, Math.max(50, 3000 - (now - st.idleAt) + 30)); }
      }
    }
    var idleTimer = 0;
    var drag = false;
    var live = { visible: false };
    function wake() {
      if (raf || !live.visible || doc.hidden) return;
      raf = requestAnimationFrame(tick);
    }
    function sleep() { if (raf) cancelAnimationFrame(raf); raf = 0; last = 0; clearTimeout(idleTimer); }
    stageInput(box, {
      count: N,
      down: function () { drag = true; st.spinning = false; st.idleAt = performance.now(); wake(); },
      move: function (dx, dy) {
        st.yaw += dx / MW * Math.PI * 1.25;
        st.pitch = clamp(st.pitch + dy / MH * Math.PI * 0.9, -LIMIT, LIMIT);
        st.ty = st.yaw; st.tp = st.pitch;
        if (reduced()) paint();
      },
      up: function (moved) { drag = false; if (moved) settle(frontmost(), true); else wake(); },
      step: function (d, speak) { settle((st.cur + d + N) % N, speak); },
      go: function (i, speak) { settle(i, speak); }
    });
    each($$("[data-ball-step]"), function (b) { b.addEventListener("click", function () { settle((st.cur + +b.getAttribute("data-ball-step") + N) % N, true); }); });
    each($$("[data-ball-go]"), function (b) { b.addEventListener("click", function () { settle(+b.getAttribute("data-ball-go"), true); }); });
    st.idleAt = performance.now();
    paint();
    say(false);
    ball = { box: box, live: live, wake: wake, sleep: sleep };
  })();

  /* Cover Flow（现行）：正中端正、两侧 rotateY ±60° 侧立，越远越暗到 .45；切换 380ms 苹果缓动（CSS 过渡） */
  (function () {
    var box = $("[data-flow]");
    if (!box) return;
    var scene = $("[data-flow-scene]", box);
    var read = $("[data-flow-read]");
    var N = 13, cur = 6;
    var cards = makeCards(scene, N);
    cards.forEach(function (c) { c.style.width = "70px"; c.style.height = "105px"; c.style.margin = "-52.5px 0 0 -35px"; c.querySelector("b").style.fontSize = "10px"; });
    function layout(speak) {
      cards.forEach(function (c, i) {
        var k = i - cur, a = Math.abs(k), s = k < 0 ? -1 : 1;
        var t = k === 0 ? "translateZ(30px) scale(1.15)" :
          "translateX(" + (s * (64 + (a - 1) * 18)) + "px) translateZ(-90px) rotateY(" + (-s * 60) + "deg)";
        c.style.transform = t;
        c.style.opacity = String(Math.max(0.45, 1 - 0.09 * a));
        c.style.zIndex = String(20 - a);
        c.classList.toggle("is-cur", k === 0);
      });
      var txt = "正中：第" + (cur + 1) + "张，端正（rotate 0）";
      read.textContent = txt;
      if (speak) announce(txt);
    }
    function go(i, speak) { cur = clamp(i, 0, N - 1); layout(speak); }
    var acc = 0;
    stageInput(box, {
      count: N,
      down: function () { acc = 0; },
      move: function (dx) {
        acc += dx;
        if (Math.abs(acc) > 26) { go(cur + (acc < 0 ? 1 : -1), false); acc = 0; }
      },
      up: function (moved) { if (moved) announce(read.textContent); },
      step: function (d, speak) { go(cur + d, speak); },
      go: go
    });
    each($$("[data-flow-step]"), function (b) { b.addEventListener("click", function () { go(cur + +b.getAttribute("data-flow-step"), true); }); });
    layout(false);
  })();

  /* ---------- 10. 展示五选（照控制室样张 stage/layouts.html 的变换值） ---------- */
  (function () {
    var box = $("[data-show]");
    if (!box) return;
    var scene = $("[data-show-scene]", box);
    var pick = $("[data-show-pick]");
    var read = $("[data-show-read]");
    var flag = $("[data-show-flag]", box);
    var refl = doc.createElement("div");
    refl.className = "mk-refl";
    box.querySelector(".rj-mock").appendChild(refl);
    var N = 13, sel = 6, mode = "A";
    var CW = 92, CH = 138, SW = 686, SH = 270;
    var cards = makeCards(scene, N);
    cards.forEach(function (c) {
      var dim = doc.createElement("i");
      dim.style.cssText = "position:absolute;inset:0;z-index:2;background:#000;opacity:0;transition:opacity 380ms cubic-bezier(.32,.72,0,1)";
      c.appendChild(dim);
      c.rjDim = dim;
    });
    var NOTE = {
      A: "A Cover Flow（Apple iTunes经典）：正中一张端正朝你，两侧侧立排开、越远越暗。屋主选的这一种。",
      B: "B弧形展架（Apple TV货架）：每张都端正立着，排成一条浅弧，中间最大最近、两端略小略远。",
      C: "C手牌扇形：像手里握着一把牌，选中那张端正地抽高出来；其余每张都是斜的。",
      D: "D钱包叠卡（Apple Wallet）：往后叠，最前一张完整，后面只露顶边，越往后越暗。",
      E: "E玻璃展柜墙：不做3D，13张端端正正铺成一面墙，选中那张抬起来一点。"
    };
    var BX = [0, 44, 102, 162, 220, 276, 330], BZ = [40, -4, -14, -35, -60, -90, -120], BR = [0, 1, 3, 6, 9, 12, 14], BS = [1.05, 1, 1, 0.95, 0.9, 0.85, 0.8];
    var DS = [0.98, 0.96, 0.93, 0.9, 0.87, 0.84, 0.81, 0.78], DB = [0.9, 0.8, 0.72, 0.66, 0.6, 0.55, 0.5, 0.45];
    function place(i) {
      var k = i - sel, a = Math.abs(k), s = k < 0 ? -1 : 1;
      var o = { x: 0, y: 0, z: 0, ry: 0, rz: 0, sc: 1, op: 1, dim: 0, zi: 20 - a, pivot: 0 };
      if (mode === "A") {
        if (k === 0) { o.z = 60; o.sc = 104 / CW; }
        else { o.x = s * (110 + (a - 1) * 38); o.z = -160; o.ry = -s * 60; }
      } else if (mode === "B") {
        if (a > 6) { o.op = 0; return o; }
        o.x = s * BX[a]; o.z = BZ[a]; o.ry = s * BR[a]; o.sc = (k === 0 ? 96 : 72) / CW * BS[a];
        if (a === 1) o.op = 0; // 样张里紧挨选中那张的两张是隐藏的（opacity:0），照抄
      } else if (mode === "C") {
        if (a > 6) { o.op = 0; return o; }
        o.sc = (k === 0 ? 88 : 80) / CW;
        o.pivot = 2.5 * CH * o.sc;
        o.y = 0.2 * CH * o.sc + (k === 0 ? -34 : 0);
        o.rz = k * 7;
      } else if (mode === "D") {
        var j = i - sel;
        if (j < 0 || j > 8) { o.op = 0; o.y = -110; o.sc = 150 / CW * 0.78; return o; }
        o.sc = 150 / CW * (j === 0 ? 1 : DS[j - 1]);
        o.y = j === 0 ? 22 : -12 * j;
        o.dim = j === 0 ? 0 : 1 - DB[j - 1];
        o.zi = 10 - j;
      } else if (mode === "E") {
        var w = Math.min((SW - 60 - 6 * 8) / 7, ((SH - 32 - 8) / 2) / 1.5);
        var h = w * 1.5;
        var col = i % 7, row = Math.floor(i / 7);
        var left = (SW - (7 * w + 48)) / 2, top = (SH - (2 * h + 8)) / 2;
        o.x = left + col * (w + 8) + w / 2 - SW / 2;
        o.y = top + row * (h + 8) + h / 2 - SH / 2;
        o.sc = w / CW * (k === 0 ? 1.12 : 1);
        o.zi = k === 0 ? 20 : 1;
      }
      return o;
    }
    function layout(speak) {
      cards.forEach(function (c, i) {
        var o = place(i);
        var t = "translate3d(" + o.x.toFixed(1) + "px," + o.y.toFixed(1) + "px," + o.z + "px)";
        if (o.pivot) t += " translateY(" + o.pivot.toFixed(1) + "px) rotate(" + o.rz + "deg) translateY(" + (-o.pivot).toFixed(1) + "px)";
        if (o.ry) t += " rotateY(" + o.ry + "deg)";
        t += " scale(" + o.sc.toFixed(4) + ")";
        c.style.transform = t;
        c.style.opacity = String(o.op);
        c.style.zIndex = String(o.zi);
        c.rjDim.style.opacity = String(o.dim.toFixed(2));
        c.classList.toggle("is-cur", i === sel);
      });
      refl.hidden = mode !== "A";
      flag.textContent = mode === "A" ? "现行" : "示意 · 被否";
      flag.className = "rj-flag " + (mode === "A" ? "rj-flag-new" : "rj-flag-old");
      read.textContent = NOTE[mode] + "选中第" + (sel + 1) + "张。";
      if (speak) announce(read.textContent);
    }
    radios(pick, function (b) { mode = b.getAttribute("data-show-v"); layout(true); });
    stageInput(box, {
      count: N,
      move: function () {},
      up: function () {},
      step: function (d, speak) { sel = clamp(sel + d, 0, N - 1); layout(speak); },
      go: function (i, speak) { sel = clamp(i, 0, N - 1); layout(speak); }
    });
    layout(false);
  })();

  /* ---------- 11. 夜色：现算对比度 ---------- */
  (function () {
    var read = $("[data-night-read]");
    if (!read) return;
    var spec = read.closest(".specimen");
    var NIGHT = {
      v1: { name: "v1夜橄榄", bg: "#1C1B17", card: "#24231E", body: "#D7D4CC", link: "#ACB08D", lava: "#E2763C" },
      v2: { name: "v2琥珀棕", bg: "#1C1915", card: "#26221D", body: "#DED9CF", link: "#C8BA93", lava: "#EB8947" },
      mist: { name: "海雾", bg: "#112D4E", card: "#1E1F25", body: "#DBE2EF", link: "#3F72AF", lava: "#EB8947" },
      now: { name: "现行冷夜暖灯", bg: "#15171B", card: "#1E1F25", body: "#DDD9D0", link: "#CDBF98", lava: "#EB8947" }
    };
    function part(v) {
      var n = NIGHT[v];
      function one(lbl, a, b) {
        var r = ratio(a, b);
        return lbl + '<span class="' + (r < 4.5 ? "is-bad" : "is-ok") + '">' + r.toFixed(2) + "</span>";
      }
      return "<b>" + n.name + "</b>：" + one("正文／底", n.body, n.bg) + " · " + one("链接／底", n.link, n.bg) + " · " + one("日期橙／卡", n.lava, n.card);
    }
    function paint(v) { read.innerHTML = "对比度（低于4.5标红）　左：" + part(v) + "；右：" + part("now"); }
    spec.addEventListener("rj-vars", function (e) { paint(e.detail); });
    paint("v1");
  })();

  /* ---------- 12. 换房间：四版转场 ---------- */
  (function () {
    var spec = $("[data-door]");
    if (!spec) return;
    var main = $("[data-door-main]", spec);
    var fx = $("[data-door-fx]", spec);
    var pl = fx.querySelector(".d-panel-l"), pr = fx.querySelector(".d-panel-r");
    var wash = fx.querySelector(".d-wash"), rim = fx.querySelector(".d-rim");
    var go = $("[data-door-go]", spec);
    var night = $("[data-door-night]", spec);
    var pickV = spec.querySelector('[role="radiogroup"]');
    var read = $("[data-door-read]", spec);
    var room = "hall", version = "veil", gen = 0, timers = [], anims = [];
    var NAME = { split: "中缝展开", solid: "实心色板门", paper: "纸色格心门", veil: "洇一层纸" };
    var PLAN = {
      split: "出0.3秒推近淡出 → 进0.55秒从中缝展开（clip-path）",
      solid: "合门0.45秒 → 门后换房间 → 开门0.75秒（外摆96°）",
      paper: "合门0.45秒 → 门后换房间 → 开门0.75秒（纸色格心）",
      veil: "洇开0.55秒 → 纸下换房间 → 干去0.6秒"
    };
    function label() { go.textContent = room === "hall" ? "换房间：去随笔" : "换房间：回小屋"; }
    function swapRoom() {
      room = room === "hall" ? "notes" : "hall";
      each(spec.querySelectorAll("[data-room]"), function (r) { r.hidden = r.getAttribute("data-room") !== room; });
      each(spec.querySelectorAll("[data-door-nav]"), function (n) { n.classList.toggle("on", n.getAttribute("data-door-nav") === room); });
      label();
    }
    function later(fn, ms) { var g = gen; timers.push(setTimeout(function () { if (g === gen) fn(); }, ms)); }
    function anim(el, frames, opt) { var a = el.animate(frames, opt); anims.push(a); return a; }
    function reset() {
      gen += 1;
      timers.forEach(clearTimeout); timers = [];
      anims.forEach(function (a) { try { a.cancel(); } catch (e) {} }); anims = [];
      fx.hidden = true;
    }
    function done() {
      reset();
      read.textContent = NAME[version] + "：到了" + (room === "hall" ? "小屋" : "随笔") + "。" + PLAN[version] + "。";
      announce("到了" + (room === "hall" ? "小屋" : "随笔"));
    }
    function phase(t) { read.textContent = NAME[version] + "：" + t; }
    function run() {
      reset();
      if (reduced() || !canAnimate) { swapRoom(); read.textContent = "减弱动效：直接换房间（" + NAME[version] + "整段不播）。"; announce("到了" + (room === "hall" ? "小屋" : "随笔")); return; }
      announce("播放" + NAME[version]);
      var E_EXIT = "cubic-bezier(0.4, 0, 1, 1)";
      if (version === "split") {
        phase("出——推近、淡出0.3秒");
        anim(main, [{ opacity: 1, transform: "none", filter: "brightness(1)" }, { opacity: 0, transform: "scale(1.045)", filter: "brightness(1.08)" }], { duration: 300, easing: E_EXIT, fill: "forwards" });
        later(function () {
          anims.forEach(function (a) { a.cancel(); }); anims = [];
          swapRoom();
          phase("进——从中缝向两侧展开0.55秒");
          var E = "cubic-bezier(0.22, 0.61, 0.36, 1)";
          anim(main, [
            { clipPath: "inset(0 49.5% 0 49.5%)", transform: "scale(1.02)", filter: "brightness(0.7)", opacity: 0.9, offset: 0, easing: E },
            { clipPath: "inset(0 0% 0 0%)", offset: 0.55, easing: E },
            { clipPath: "inset(0 0% 0 0%)", transform: "scale(1)", filter: "brightness(1)", opacity: 1, offset: 1 }
          ], { duration: 550, fill: "backwards" });
          later(done, 580);
        }, 310);
        return;
      }
      if (version === "solid" || version === "paper") {
        fx.setAttribute("data-door", version);
        fx.hidden = false;
        var EC = "cubic-bezier(0.32, 0, 0.24, 1)", EO = "cubic-bezier(0.3, 0.05, 0.2, 1)";
        phase("合门0.45秒，旧房间朝门口推近");
        anim(pl, [{ transform: "translateX(-101%)" }, { transform: "translateX(0)" }], { duration: 450, easing: EC, fill: "both" });
        anim(pr, [{ transform: "translateX(101%)" }, { transform: "translateX(0)" }], { duration: 450, easing: EC, fill: "both" });
        anim(main, [{ opacity: 1, transform: "none" }, { opacity: 0.35, transform: "scale(1.04)" }], { duration: 450, easing: E_EXIT, fill: "forwards" });
        later(function () {
          anims.forEach(function (a) { if (a.effect && a.effect.target === main) a.cancel(); });
          swapRoom();
          phase("门后换房间");
        }, 460);
        later(function () {
          phase("开门0.75秒，铰链在外侧朝你外摆");
          anim(pl, [{ transform: "rotateY(0deg)" }, { transform: "rotateY(-96deg)" }], { duration: 750, easing: EO, fill: "forwards" });
          anim(pr, [{ transform: "rotateY(0deg)" }, { transform: "rotateY(96deg)" }], { duration: 750, easing: EO, fill: "forwards" });
          later(done, 770);
        }, 620);
        return;
      }
      // 现行：洇一层纸（圆盘画成原物的 1/10、动画里放大 10 倍，见 rejected.css 第11节；倍数照原物 .01→1→1.06）
      fx.setAttribute("data-door", "veil");
      fx.hidden = false;
      phase("洇开0.55秒，旧房间轻轻退后");
      anim(wash, [{ transform: "scale(0.1)" }, { transform: "scale(10)" }], { duration: 550, easing: "cubic-bezier(0.3, 0, 0.16, 1)", fill: "both" });
      anim(rim, [{ transform: "scale(0.1)" }, { transform: "scale(10)" }], { duration: 550, delay: 50, easing: "cubic-bezier(0.34, 0, 0.22, 1)", fill: "both" });
      anim(main, [{ opacity: 1, transform: "none" }, { opacity: 0.45, transform: "scale(0.985)" }], { duration: 550, easing: E_EXIT, fill: "forwards" });
      later(function () {
        anims.forEach(function (a) { if (a.effect && a.effect.target === main) a.cancel(); });
        swapRoom();
        phase("纸下换房间");
      }, 610);
      later(function () {
        phase("干去0.6秒，带一点继续舒展");
        var E = "cubic-bezier(0.3, 0.1, 0.3, 1)";
        anim(wash, [{ transform: "scale(10)", opacity: 1 }, { transform: "scale(10.6)", opacity: 0 }], { duration: 600, easing: E, fill: "forwards" });
        anim(rim, [{ transform: "scale(10)", opacity: 1 }, { transform: "scale(10.6)", opacity: 0 }], { duration: 600, easing: E, fill: "forwards" });
        later(done, 620);
      }, 720);
    }
    go.addEventListener("click", run);
    radios(pickV, function (b) {
      reset();
      version = b.getAttribute("data-door-v");
      read.textContent = (version === "veil" ? "现行：" : "被否：") + NAME[version] + "。" + PLAN[version] + "。";
      announce(read.textContent);
    });
    // 白天 / 夜里：默认跟着全站的明暗；点过之后只改这一块（样例自己的 data-mode）
    function isNight() { return (spec.getAttribute("data-mode") || root.getAttribute("data-mode") || "light") === "dark"; }
    function syncNight() { night.setAttribute("aria-pressed", isNight() ? "true" : "false"); }
    night.addEventListener("click", function () {
      var on = !isNight();
      spec.setAttribute("data-mode", on ? "dark" : "light");
      syncNight();
      announce(on ? "样例换成夜里" : "样例换回白天");
    });
    if (window.StarTheme && window.StarTheme.onChange) window.StarTheme.onChange(syncNight);
    syncNight();
    label();
  })();

  /* ---------- 13. 重演示的开关：球只在看得见时转 ---------- */
  if (ball) {
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          ball.live.visible = en.isIntersecting;
          if (en.isIntersecting) ball.wake(); else ball.sleep();
        });
      }, { rootMargin: "80px 0px" }).observe(ball.box);
    } else {
      ball.live.visible = true;
      ball.wake();
    }
    doc.addEventListener("visibilitychange", function () { if (doc.hidden) ball.sleep(); else ball.wake(); });
  }
})();
