/*
 * 总览页专属脚本（defer，排在 star.js 之后）：「屋主的审美原则」十条旁边的对比小样
 *   01 两种气质：右边那张卡在液态玻璃 / 暖纸之间切（radiogroup）
 *   02 偏软偏轻：一个开关换成被否的黑红（aria-pressed）
 *   03 审美例外只开一处：换强调色，白字对渐变两端、文字档对底的比值现算（WCAG 2.x）
 *   04 要好看不要更紧凑：短名胶囊 / 带全名的卡片，两边都能真选
 *   05 构图不变、等比放大：拖视口宽，缩微版面按三种做法排好再缩进框里，显示 --scale
 *   06 首页净增为零：「首页加一个新功能」——仪表盘多一块，清单首页不变、新功能进二级页
 *   07 真线条图标：样例自己切浅深
 *   08 暖要靠冷底：只换底色相的拖动块
 *   09 上下留白对称：拖工具栏吃掉的高度，凑参数的会溢出，余量来自结构的不会
 *   10 分阶段交付：点哪一阶段看交付了什么、故意没做什么
 * 只改小样自己的属性，不碰 <html> 的 data-mode / data-accent，也不写 localStorage。
 * 单选组的方向键由 star.js 统一处理（移动焦点并 click），这里只管 click。
 */
(function () {
  "use strict";
  var doc = document;
  var root = doc.documentElement;
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return (ctx || doc).querySelectorAll(sel); }
  function announce(msg) { if (window.StarShell) window.StarShell.announce(msg); }
  var ACCENT_NAME = { blue: "蓝", green: "绿", indigo: "靛", orange: "橙", pink: "粉", teal: "青" };
  var themeListeners = [];
  var lastTheme = { mode: root.getAttribute("data-mode") || "light", accent: root.getAttribute("data-accent") || "blue" };
  if (window.StarTheme) window.StarTheme.onChange(function (st) {
    var prev = lastTheme;
    lastTheme = { mode: st.mode, accent: st.accent };
    each(themeListeners, function (fn) { fn(st, prev); });
  });

  function radios(group, onPick) {
    group.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest('[role="radio"]') : null;
      if (!b || !group.contains(b)) return;
      select(group, b);
      onPick(b);
    });
  }
  function select(group, b) {
    each(group.querySelectorAll('[role="radio"]'), function (r) {
      var on = r === b;
      r.setAttribute("aria-checked", on ? "true" : "false");
      r.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  /* 颜色：解析 #RRGGBB / rgb()，WCAG 2.x 相对亮度与对比度 */
  function parse(c) {
    c = String(c || "").trim();
    var m = /^#([0-9a-f]{6})$/i.exec(c);
    if (m) return [0, 2, 4].map(function (i) { return parseInt(m[1].slice(i, i + 2), 16); });
    m = /^rgba?\(([^)]+)\)$/i.exec(c);
    if (!m) return null;
    return m[1].split(/[\s,\/]+/).filter(Boolean).slice(0, 3).map(parseFloat);
  }
  function lin(v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
  function lum(c) { return 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]); }
  function ratio(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function hex(c) { return "#" + c.map(function (v) { var h = Math.round(v).toString(16); return h.length < 2 ? "0" + h : h; }).join("").toUpperCase(); }
  function tok(el, name) { return parse(getComputedStyle(el).getPropertyValue(name)); }
  function px(n) { return Math.round(n) + "px"; }

  /* ---- 01 两种气质 ---- */
  each($$('[data-tp="1"]'), function (box) {
    var stack = $("[data-tp1-stack]", box);
    var label = $("[data-tp1-label]", box);
    radios($('[role="radiogroup"]', box), function (b) {
      var v = b.getAttribute("data-tp1");
      stack.setAttribute("data-style", v);
      label.textContent = b.textContent.trim();
      announce("右边那张卡换成" + b.textContent.trim());
    });
  });

  /* ---- 02 偏软偏轻 ---- */
  each($$('[data-tp="2"]'), function (box) {
    var btn = $("[data-tp2]", box);
    var stack = $("[data-tp2-stack]", box);
    var state = $("[data-tp2-state]", box);
    btn.addEventListener("click", function () {
      var red = btn.getAttribute("aria-pressed") !== "true";
      btn.setAttribute("aria-pressed", red ? "true" : "false");
      stack.setAttribute("data-v", red ? "red" : "glass");
      state.innerHTML = red
        ? '<span class="tp-flag tp-no">被否</span>黑侧栏 + 刷刷红（示意）：深色块压着、正红很重'
        : '<span class="tp-flag tp-yes">现行</span>液态玻璃：偏软、偏轻、有颜色';
      announce(red ? "已换成被否的黑红：黑侧栏、深色今日面板、正红按钮" : "已换回现行的液态玻璃");
    });
  });

  /* ---- 03 审美例外只开一处 ---- */
  var tp3 = $('[data-tp="3"]');
  if (tp3) {
    var t3box = $("[data-tp3-box]", tp3);
    var t3group = $('[role="radiogroup"]', tp3);
    var t3dark = $("[data-tp3-dark]", tp3);
    var WHITE = [255, 255, 255];
    var deepen = function (c) {
      for (var k = 0; k <= 1.0001; k += 0.01) {
        var d = c.map(function (v) { return v * (1 - k); });
        if (ratio(WHITE, d) >= 4.5) return d;
      }
      return [0, 0, 0];
    };
    var put = function (sel, v) { $(sel, tp3).textContent = v.toFixed(2); };
    var paint3 = function () {
      var a = tok(t3box, "--accent");
      var a2 = tok(t3box, "--accent-2");
      var at = tok(t3box, "--accent-text");
      var ati = tok(t3box, "--accent-tint");
      var raised = tok(t3box, "--raised");
      if (!a || !a2 || !at || !ati || !raised) return;
      var d1 = deepen(a);
      var d2 = deepen(a2);
      t3dark.style.background = "linear-gradient(135deg, " + hex(d1) + ", " + hex(d2) + ")";
      put("[data-tp3-d1]", ratio(WHITE, d1));
      put("[data-tp3-d2]", ratio(WHITE, d2));
      put("[data-tp3-b1]", ratio(WHITE, a));
      put("[data-tp3-b2]", ratio(WHITE, a2));
      put("[data-tp3-l]", ratio(at, raised));
      put("[data-tp3-c]", ratio(at, ati));
    };
    var setAccent3 = function (acc, speak) {
      if (!ACCENT_NAME[acc]) return;
      t3box.setAttribute("data-accent", acc);
      var b = $('[data-tp3-accent="' + acc + '"]', tp3);
      if (b) select(t3group, b);
      paint3();
      if (speak) {
        announce(ACCENT_NAME[acc] + "：主按钮白字对深端" + $("[data-tp3-b1]", tp3).textContent + "、浅端" + $("[data-tp3-b2]", tp3).textContent +
          "，记录不断言；链接" + $("[data-tp3-l]", tp3).textContent + "、标签" + $("[data-tp3-c]", tp3).textContent);
      }
    };
    radios(t3group, function (b) { setAccent3(b.getAttribute("data-tp3-accent"), true); });
    setAccent3(lastTheme.accent, false);
    themeListeners.push(function (st, prev) {
      if (st.accent !== prev.accent) setAccent3(st.accent, false);
      else paint3();
    });
  }

  /* ---- 04 要好看不要更紧凑 ---- */
  each($$("[data-tp4-set]"), function (set) {
    var sum = $("[data-tp4-sum]", set);
    var chips = $$(".tp4-chip", set);
    var boxes = $$('input[type="checkbox"]', set);
    var count = function (speak) {
      var n = 0;
      var total = 0;
      each(chips, function (c) { if (c.getAttribute("aria-pressed") === "true") { n += 1; total += +c.getAttribute("data-n"); } });
      each(boxes, function (c) { if (c.checked) { n += 1; total += +c.getAttribute("data-n"); } });
      sum.textContent = n ? "已选" + n + "个题库 · 共" + total + "道" : "一个题库都没选";
      if (speak) announce(sum.textContent);
    };
    each(chips, function (c) {
      c.addEventListener("click", function () {
        c.setAttribute("aria-pressed", c.getAttribute("aria-pressed") === "true" ? "false" : "true");
        count(true);
      });
    });
    each(boxes, function (c) { c.addEventListener("change", function () { count(true); }); });
    count(false);
  });

  /* ---- 05 构图不变、等比放大 ---- */
  var tp5 = $('[data-tp="5"]');
  if (tp5) {
    var w5 = $("[data-tp5-w]", tp5);
    var wout = $("[data-tp5-wout]", tp5);
    var read5 = $("[data-tp5-read]", tp5);
    var flag5 = $("[data-tp5-flag]", tp5);
    var cap5 = $("[data-tp5-cap]", tp5);
    var frames = $$("[data-tp5-frame]", tp5);
    var mode5 = "scale";
    var MODE_LABEL = { scale: "现行：等比放大", column: "错法一：居中窄柱", dense: "错法二：加列变密" };
    /* 三种做法各自的参数（示意）：
       scale  = clamp(1, W/1440, 1.45)，构图不变、填满（SPEC「自适应」现行规则）
       column = 尺寸不放大、内容列封顶居中，两边空着（错法一）
       dense  = 字号只从1涨到2560处的约1.15倍、内容上限1560、≥1600加列（错法二，SPEC 里作废的初版） */
    var geo = function (W, mode) {
      if (mode === "column") return { s: 1, cols: 3, cmax: 1100 };
      if (mode === "dense") {
        var s = 1 + 0.15 * Math.min(1, Math.max(0, (W - 1440) / (2560 - 1440)));
        return { s: s, cols: W >= 2200 ? 5 : W >= 1600 ? 4 : 3, cmax: 1560 };
      }
      return { s: Math.min(1.45, Math.max(1, W / 1440)), cols: 3, cmax: 0 };
    };
    var layout = function (frame, W) {
      var page = $(".tp5-page", frame);
      var g = geo(W, mode5);
      page.style.setProperty("--W", String(W));
      page.style.setProperty("--s", g.s.toFixed(4));
      page.style.setProperty("--ss", g.s.toFixed(4));
      page.style.setProperty("--cols", String(g.cols));
      page.style.setProperty("--cmax", g.cmax ? g.cmax + "px" : "100000px");
      page.style.setProperty("--k", (frame.clientWidth / W).toFixed(5));
      return g;
    };
    var paint5 = function (speak) {
      var W = parseInt(w5.value, 10) || 1440;
      var g;
      each(frames, function (f) {
        var r = layout(f, f.getAttribute("data-tp5-frame") === "ref" ? 1440 : W);
        if (f.getAttribute("data-tp5-frame") === "cur") g = r;
      });
      wout.textContent = W + "px";
      cap5.textContent = W + "排好再缩到同宽";
      var ok = mode5 === "scale";
      flag5.textContent = ok ? "现行" : "被否";
      flag5.className = "tp-flag " + (ok ? "tp-yes" : "tp-no");
      var text;
      if (mode5 === "scale") {
        var raw = W / 1440;
        text = "--scale = " + g.s.toFixed(3) + "（" + W + " ÷ 1440" + (raw > 1.45 ? " = " + raw.toFixed(3) + "，封顶1.45" : "，1.45封顶") + "）";
      } else if (mode5 === "column") {
        var side = Math.max(0, (W - 240 - 86 - 1100) / 2);
        text = "--scale恒为1：内容列封顶1100px居中，两边各空" + Math.round(side) + "px";
      } else {
        text = "字号只放大到" + g.s.toFixed(2) + "倍、内容上限1560，" + (g.cols > 3 ? "加到" + g.cols + "列：版面变密、构图变了" : "1600以下还是3列");
      }
      read5.textContent = text;
      if (speak) announce("视口" + W + "px，" + MODE_LABEL[mode5] + "：" + text);
    };
    w5.addEventListener("input", function () { paint5(false); });
    w5.addEventListener("change", function () { paint5(true); });
    each($$("[data-tp5-preset]", tp5), function (b) {
      b.addEventListener("click", function () { w5.value = b.getAttribute("data-tp5-preset"); paint5(true); });
    });
    radios($('[role="radiogroup"]', tp5), function (b) { mode5 = b.getAttribute("data-tp5-mode"); paint5(true); });
    if (window.ResizeObserver) new ResizeObserver(function () { paint5(false); }).observe(frames[0]);
    else window.addEventListener("resize", function () { paint5(false); });
    paint5(false);
  }

  /* ---- 06 首页净增为零 ---- */
  var tp6 = $('[data-tp="6"]');
  if (tp6) {
    var dash = $("[data-tp6-dash]", tp6);
    var second = $("[data-tp6-second]", tp6);
    var dcount = $("[data-tp6-dcount]", tp6);
    var lcount = $("[data-tp6-lcount]", tp6);
    var add = $("[data-tp6-add]", tp6);
    var added = 0;
    var MAX = 6;
    var paint6 = function () {
      dcount.textContent = "首页" + (6 + added) + "个面板" + (added ? "（+" + added + "）" : "");
      lcount.textContent = "首页净增0" + (added ? "，二级页多了" + added + "个" : "");
      add.disabled = added >= MAX;
      add.textContent = added >= MAX ? "够乱了，先到这" : "首页加一个新功能";
    };
    add.addEventListener("click", function () {
      if (added >= MAX) return;
      added += 1;
      var p = doc.createElement("div");
      p.className = "tp6-p is-new";
      p.innerHTML = "<b>新功能" + added + "</b><i></i>";
      dash.appendChild(p);
      if (added === 1) second.textContent = "";
      var s = doc.createElement("span");
      s.className = "tp6-new";
      s.textContent = "新功能" + added;
      second.appendChild(s);
      paint6();
      announce("仪表盘多了一个面板，现在" + (6 + added) + "个；清单首页不变，新功能" + added + "进了二级页");
    });
    $("[data-tp6-reset]", tp6).addEventListener("click", function () {
      added = 0;
      each($$(".tp6-p.is-new", dash), function (p) { p.parentNode.removeChild(p); });
      second.textContent = "还没有新功能";
      paint6();
      announce("已复原：仪表盘6个面板，二级页没有新功能");
    });
    paint6();
  }

  /* ---- 07 真线条图标：样例自己切浅深（默认跟着全站） ---- */
  var tp7 = $('[data-tp="7"]');
  if (tp7) {
    var t7box = $("[data-tp7-box]", tp7);
    var t7group = $('[role="radiogroup"]', tp7);
    var setMode7 = function (m, speak) {
      t7box.setAttribute("data-mode", m);
      var b = $('[data-tp7="' + m + '"]', tp7);
      if (b) select(t7group, b);
      if (speak) announce(m === "dark" ? "图标样例切到深色：emoji不跟字色走，线条图标跟着换色" : "图标样例切到浅色");
    };
    radios(t7group, function (b) { setMode7(b.getAttribute("data-tp7"), true); });
    setMode7(lastTheme.mode === "dark" ? "dark" : "light", false);
    themeListeners.push(function (st, prev) { if (st.mode !== prev.mode) setMode7(st.mode, false); });
  }

  /* ---- 08 暖要靠冷底：只换底色相 ---- */
  var tp8 = $('[data-tp="8"]');
  if (tp8) {
    var h8 = $("[data-tp8-h]", tp8);
    var hout = $("[data-tp8-hout]", tp8);
    var live8 = $("[data-tp8-live]", tp8);
    var paint8 = function (speak) {
      var h = parseInt(h8.value, 10) || 0;
      live8.style.setProperty("--n-bg", "hsl(" + h + " 13% 9.5%)");
      live8.style.setProperty("--n-card", "hsl(" + h + " 12% 13%)");
      live8.style.setProperty("--n-block", "hsl(" + h + " 14% 19%)");
      live8.style.setProperty("--n-border", "hsl(" + h + " 9% 23%)");
      hout.textContent = h + "°";
      if (speak) announce("底色相" + h + "度" + (h >= 200 ? "，冷底：暖字和炉火橙显出来了" : h <= 60 ? "，暖底：全屋一片暖" : ""));
    };
    h8.addEventListener("input", function () { paint8(false); });
    h8.addEventListener("change", function () { paint8(true); });
    paint8(false);
  }

  /* ---- 09 上下留白对称 ---- */
  var tp9 = $('[data-tp="9"]');
  if (tp9) {
    var t9 = $("[data-tp9-t]", tp9);
    var tout = $("[data-tp9-tout]", tp9);
    var sims = $$("[data-tp9-sim]", tp9);
    var H = 1019;
    var U = 2040 / 1440;
    var HEAD = 150;
    var FOOT = 114;
    var read = {};
    var paint9 = function (speak) {
      var t = parseInt(t9.value, 10) || 0;
      var A = H - t;
      tout.textContent = t + "px";
      each(sims, function (sim) {
        var kind = sim.getAttribute("data-tp9-sim");
        var frame = sim.parentNode;
        sim.style.setProperty("--k", (frame.clientWidth / 2040).toFixed(5));
        sim.style.setProperty("--t", String(t));
        var page = $(".tp9-page", sim);
        var stage = $(".tp9-stage", sim);
        var card = $(".tp9-card", sim);
        var scroll = $(".tp9-scroll", sim);
        var out = $('[data-tp9-r="' + kind + '"]', tp9);
        var st, ch, top, bottom;
        if (kind === "fit") {
          /* 凑参数：舞台写死 69svh，上留白 48；固定部分 312 是在裸视口 1019 上凑出「卡底剩 4px」的 */
          top = 48;
          st = 0.69 * A;
          ch = st - 40;
          bottom = A - (top + HEAD + st + FOOT);
        } else {
          /* 余量来自结构：上下各 32，舞台 flex:1 吃掉剩余高度，卡片取「舞台减上下各 24」与等比值 621×u 的较小者 */
          top = 32;
          st = A - 2 * top - HEAD - FOOT;
          ch = Math.min(621 * U, st - 48);
          bottom = top;
        }
        page.style.paddingTop = px(top);
        stage.style.height = px(st);
        card.style.height = px(ch);
        card.style.width = px(ch * 63 / 88);
        var over = bottom < 0;
        sim.classList.toggle("is-over", over);
        if (over) {
          var content = A - bottom;
          scroll.style.height = px(Math.max(40, (A - 16) * A / content));
        }
        if (kind === "fit") {
          out.innerHTML = over
            ? "上留白48px · <b>下面溢出" + Math.round(-bottom) + "px，出滚动条</b>"
            : "上留白48px · 下留白" + Math.round(bottom) + "px" + (bottom <= 8 ? "（刚好装下）" : "（上下不对称）");
        } else {
          out.textContent = "上下留白各32px · 卡片缩到" + Math.round(ch) + "px高，在舞台里上下各" + Math.round((st - ch) / 2) + "px";
        }
        read[kind] = out.textContent;
      });
      if (speak) announce("工具栏吃掉" + t + "px。凑参数那版：" + read.fit + "。现行：" + read.flex);
    };
    t9.addEventListener("input", function () { paint9(false); });
    t9.addEventListener("change", function () { paint9(true); });
    each($$("[data-tp9-preset]", tp9), function (b) {
      b.addEventListener("click", function () { t9.value = b.getAttribute("data-tp9-preset"); paint9(true); });
    });
    if (window.ResizeObserver) new ResizeObserver(function () { paint9(false); }).observe(sims[0].parentNode);
    else window.addEventListener("resize", function () { paint9(false); });
    paint9(false);
  }

  /* ---- 10 分阶段交付 ---- */
  var tp10 = $('[data-tp="10"]');
  if (tp10) {
    var steps = $$("[data-tp10]", tp10);
    var cards = $$("[data-tp10-card]", tp10);
    var fill = $("[data-tp10-fill]", tp10);
    var show = function (i, speak) {
      each(steps, function (s, j) { s.classList.toggle("is-done", j < i); });
      each(cards, function (c) { c.hidden = +c.getAttribute("data-tp10-card") !== i; });
      fill.style.transform = "scaleX(" + (i / (steps.length - 1)).toFixed(4) + ")";
      if (speak) {
        var c = $('[data-tp10-card="' + i + '"]', tp10);
        announce(c ? c.querySelector(".tp10-when").textContent : "");
      }
    };
    radios($('[role="radiogroup"]', tp10), function (b) { show(+b.getAttribute("data-tp10"), true); });
    var cur = 0;
    each(steps, function (s, j) { if (s.getAttribute("aria-checked") === "true") cur = j; });
    show(cur, false);
  }
})();
