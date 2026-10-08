/*
 * 排版页（type.html）的现场演示。普通 defer 脚本，排在 star.js 之后（file:// 下不用 module、不用 fetch）。
 *
 * 每条一个 init 函数，互不依赖；某条的 DOM 缺了就跳过，不拖累别的。
 *   1 initScale    流式字阶：拖「模拟视口宽」，按 clamp × --scale 算四档字号、画曲线
 *   2 initWeight   字重：canvas 量每个字重的字宽，宽度一样 = 同一款字重；「模拟微软雅黑」按三档换算（示意）
 *   3 initMeasure  行宽：拖阅读栏把手，读第一行实际排了几个字
 *   4 initMin      最小字号：滑块改辅助字、分段改手机正文
 *   5 initKai      楷书巨字：text-indent 补偿量字墨中线；换标题标出子集外的字；回落方式三选一
 *   6 initFamily   五个字族：点字族高亮用到它的地方；「只留黑体」
 *   7 initProse    论文排法：三种排法 + 行距滑块，读行间、段间与比例
 *   8 initStack    字体栈：三条栈换着画；canvas 探测这台机器装了哪些字、中文与西文各由谁出字
 *   9 initNofont   不引外部字体：「重新打开」的过程示意（系统栈 / 被 CSP 拦 / 连不上先空白 3 秒）
 *  10 initSpace    中英文空格：反例由脚本插空格生成（源文件里不写错的文案）；输入框按家族口径整理
 *  11 initTnum     等宽数字：比例与等宽并排计时，量框宽跳了多少；滚到才走、滚走或页面隐藏就停
 *  11b initMono    等宽字族：两条栈画同一段代码，胶囊点了把名字拿出 / 放回栈；用字宽对照明写 Menlo / Courier New 判实际是哪款
 *  12 initCanvas   画布断行：照 Ysevan_web/components/notes-globe/line-break.ts 改写的禁则 vs 逐字折，拖把手改宽
 *  13 initCopy     只说事实：周汇总的文案跟着数变；搜索角标「正文0处」反例
 *  14 initEmpty    空态：勾掉三件看空态；一句话＋一个动作 vs 灰框（示意）
 *  15 initNames    名字不截断：拖详情面板宽，折行 vs 单行省略
 *
 * 共同写法：
 *  - 分段控件是 role=radiogroup，方向键由外壳（star.js）统一处理（移动并 click），这里只接 click。
 *  - 把手（.ty-handle）是 role=slider：指针拖动 + ←→（Shift 一次走五倍）、Home / End；keydown 第一行先判输入法合成态。
 *  - 结果走 StarShell.announce（全站一个 polite 区）；滑块拖动时不播（读屏自己会读 aria-valuetext）。
 *  - 不写外壳保留属性，不改全站主题；局部样式只改样例容器上的属性。
 *  - 动画只动 transform / opacity；prefers-reduced-motion: reduce 时 JS 这边不起动画、直接到终点。
 */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  var mqReduce = null;
  try { mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)"); } catch (e) { mqReduce = null; }
  var canAnimate = typeof Element !== "undefined" && typeof Element.prototype.animate === "function";

  function reduced() { return !!(mqReduce && mqReduce.matches); }
  function $(sel, scope) { return (scope || doc).querySelector(sel); }
  function $$(sel, scope) { return Array.prototype.slice.call((scope || doc).querySelectorAll(sel)); }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function composing(e) { return e.isComposing || e.keyCode === 229; }
  function announce(msg) { if (window.StarShell && window.StarShell.announce) window.StarShell.announce(msg); }
  function fix(n, d) { return (Math.round(n * Math.pow(10, d)) / Math.pow(10, d)).toFixed(d); }
  /* 和外壳同一条公式：--scale = clamp(1, 视口 ÷ 1440, 1.45)；--u = 1px × --scale */
  function unit() { return clamp((root.clientWidth || window.innerWidth) / 1440, 1, 1.45); }
  function el(tag, cls, text) {
    var n = doc.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function bodyFont() { return getComputedStyle(doc.body).fontFamily; }

  /* 单选组：只接 click（方向键外壳管），选中项 aria-checked=true、tabindex=0 */
  function radios(group, onPick) {
    if (!group) return;
    group.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest('[role="radio"]') : null;
      if (!b || !group.contains(b)) return;
      select(group, b);
      onPick(b);
    });
  }
  function select(group, b) {
    $$('[role="radio"]', group).forEach(function (r) {
      var on = r === b;
      r.setAttribute("aria-checked", on ? "true" : "false");
      r.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  /* 只在下一帧跑一次（拖动、改尺寸时合并成一次重排读数） */
  function frame(fn) {
    var pending = false;
    return function () {
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () { pending = false; fn(); });
    };
  }

  /* ---------- 字体探测：一段西文在「这款字, 通用回退」和「通用回退」下各量一次宽，三个回退里有一个不同就是有这款字 ----------
     用 DOM 量不用 canvas：canvas 不认 -apple-system 这类关键字（Chrome 的 CSS 里也不认，它认的是 BlinkMacSystemFont），
     DOM 量出来的就是页面上真实的回落。中文字形没法这样量：方块字在哪款中文字体里都是一个字号宽，
     通用回退的中文又多半落到同一款系统字上，宽度永远一样——所以「有没有中文字形」按名字认（下面这张表）。 */
  var probeCtx = null;
  var probeCache = {};
  var LATIN = "Ysevan 0123456789 mwil";
  var HAN_FONTS = {
    "PingFang SC": 1, "Hiragino Sans GB": 1, "Microsoft YaHei": 1, "Noto Sans CJK SC": 1,
    "Songti SC": 1, "STSong": 1, "SimSun": 1, "Kaiti SC": 1, "STKaiti": 1, "KaiTi": 1,
    "Xingkai SC": 1, "STXingkai": 1, "华文行楷": 1
  };
  var KEYWORD_FONTS = /^(-apple-system|BlinkMacSystemFont|system-ui|ui-monospace)$/;
  function domWidths(list) {
    var span = el("span");
    span.setAttribute("aria-hidden", "true");
    span.style.cssText = "position:absolute;left:0;top:0;visibility:hidden;pointer-events:none;white-space:nowrap;font-size:40px;font-weight:400;font-variant-numeric:normal;font-feature-settings:normal";
    span.textContent = LATIN;
    doc.body.appendChild(span);
    var out = list.map(function (f) { span.style.fontFamily = f; return span.getBoundingClientRect().width; });
    doc.body.removeChild(span);
    return out;
  }
  /* 返回 { have: 有没有, han: 有没有中文字形 } */
  function probeFont(name) {
    if (probeCache[name]) return probeCache[name];
    /* 系统字体关键字不能加引号（加了就成了一个叫这个名字的普通字族，永远找不到） */
    var fam = KEYWORD_FONTS.test(name) ? name : '"' + name + '"';
    var gens = ["monospace", "serif", "sans-serif"];
    var w = domWidths(gens.map(function (g) { return fam + ", " + g; }).concat(gens));
    var have = w[0] !== w[3] || w[1] !== w[4] || w[2] !== w[5];
    probeCache[name] = { have: have, han: have && !!HAN_FONTS[name] };
    return probeCache[name];
  }
  /* 把 font-family 串拆成名字（去引号）；通用族名留着，探测时跳过 */
  var GENERIC = { "serif": 1, "sans-serif": 1, "monospace": 1, "cursive": 1, "fantasy": 1, "system-ui": 1 };
  function familyList(stack) {
    return stack.split(",").map(function (s) { return s.trim().replace(/^["']|["']$/g, ""); }).filter(Boolean);
  }
  /* 一条栈里第一款「装了且有中文字形」的、第一款「装了」的（西文、数字、符号归它） */
  function leaders(stack) {
    var han = "", latin = "";
    familyList(stack).forEach(function (f) {
      if (GENERIC[f]) return;
      var p = probeFont(f);
      if (!latin && p.have) latin = f;
      if (!han && p.han) han = f;
    });
    return { han: han || "系统回退字", latin: latin || "系统回退字" };
  }

  /* ---------- 把手：role=slider 的拖宽控件 ---------- */
  function makeHandle(handle, opts) {
    var dragging = false;
    var startX = 0, startW = 0, pid = null;
    function sync() {
      var w = Math.round(opts.get());
      handle.setAttribute("aria-valuemin", String(Math.round(opts.min())));
      handle.setAttribute("aria-valuemax", String(Math.round(opts.max())));
      handle.setAttribute("aria-valuenow", String(w));
      handle.setAttribute("aria-valuetext", w + "px");
    }
    function set(w, speak) {
      opts.set(clamp(w, opts.min(), opts.max()));
      sync();
      if (speak && opts.say) opts.say();
    }
    handle.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      dragging = true;
      pid = e.pointerId;
      startX = e.clientX;
      startW = opts.get();
      try { handle.setPointerCapture(pid); } catch (err) {}
      handle.classList.add("is-drag");
      e.preventDefault();
    });
    handle.addEventListener("pointermove", function (e) {
      if (!dragging || e.pointerId !== pid) return;
      set(startW + (e.clientX - startX), false);
    });
    function end(e) {
      if (!dragging || (e && e.pointerId !== pid)) return;
      dragging = false;
      handle.classList.remove("is-drag");
      try { handle.releasePointerCapture(pid); } catch (err) {}
      if (opts.say) opts.say();
    }
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
    handle.addEventListener("keydown", function (e) {
      if (composing(e)) return;
      var step = (opts.step || 20) * (e.shiftKey ? 5 : 1);
      var w = opts.get();
      if (e.key === "ArrowRight" || e.key === "ArrowUp") w += step;
      else if (e.key === "ArrowLeft" || e.key === "ArrowDown") w -= step;
      else if (e.key === "Home") w = opts.min();
      else if (e.key === "End") w = opts.max();
      else return;
      e.preventDefault();
      set(w, true);
    });
    return { sync: sync, set: set };
  }

  /* 第一行排了几个字：逐字取矩形，顶边变了就是换行了 */
  function firstLineChars(p) {
    var node = p.firstChild;
    if (!node || node.nodeType !== 3) return 0;
    var r = doc.createRange();
    var top = null, n = 0, len = node.length;
    for (var i = 0; i < len; i++) {
      r.setStart(node, i);
      r.setEnd(node, i + 1);
      var rects = r.getClientRects();
      if (!rects.length) continue;
      var t = rects[0].top;
      if (top === null) top = t;
      else if (Math.abs(t - top) > 3) break;
      n++;
    }
    return n;
  }

  /* =====================================================================
   * 1 流式字阶
   * ===================================================================== */
  function initScale() {
    var box = $("[data-tsc]");
    if (!box) return;
    var range = $("[data-tsc-w]", box);
    var out = $("[data-tsc-read]", box);
    var svg = $("[data-tsc-svg]", box);
    var axis = $("[data-tsc-axis]", box);
    var chart = $("[data-tsc-chart]", box);
    out.setAttribute("aria-live", "off");
    var STEPS = {
      title: { lo: 26, a: 1.4, b: 14, hi: 34.16, name: "大标题", color: "var(--accent)" },
      h2: { lo: 18, a: 0.8, b: 10, hi: 21.52, name: "二级标题", color: "var(--orange)" },
      body: { lo: 13, a: 0.35, b: 10, hi: 15, name: "正文", color: "var(--green)" },
      small: { lo: 12, a: 0.17, b: 10.4, hi: 12.848, name: "小字", color: "var(--label2)" }
    };
    var W0 = 320, W1 = 2560, YMAX = 52;
    function scaleAt(w) { return clamp(w / 1440, 1, 1.45); }
    function sizeAt(s, w) { return clamp(s.a * w / 100 + s.b, s.lo, s.hi) * scaleAt(w); }
    function x(w) { return (w - W0) / (W1 - W0) * 640; }
    function y(px) { return 200 - px / YMAX * 200; }

    /* 曲线画一次：每 20px 一个点；1440、2088 两条虚线（clamp 封顶、--scale 封顶） */
    var NS = "http://www.w3.org/2000/svg";
    function line(cls, x1, y1, x2, y2) {
      var l = doc.createElementNS(NS, "line");
      l.setAttribute("class", cls);
      l.setAttribute("x1", x1); l.setAttribute("y1", y1); l.setAttribute("x2", x2); l.setAttribute("y2", y2);
      svg.appendChild(l);
      return l;
    }
    [10, 20, 30, 40, 50].forEach(function (px) { line("tsc-grid", 0, y(px), 640, y(px)); });
    line("tsc-cap", x(1440), 0, x(1440), 200);
    line("tsc-cap", x(2088), 0, x(2088), 200);
    Object.keys(STEPS).forEach(function (k) {
      var s = STEPS[k];
      var pts = [];
      for (var w = W0; w <= W1; w += 20) pts.push(fix(x(w), 1) + "," + fix(y(sizeAt(s, w)), 1));
      var pl = doc.createElementNS(NS, "polyline");
      pl.setAttribute("class", "tsc-line");
      pl.setAttribute("points", pts.join(" "));
      pl.setAttribute("style", "stroke:" + s.color);
      svg.appendChild(pl);
    });
    var mark = line("tsc-mark", 0, 0, 0, 200);
    /* 刻度字放 HTML 里（svg 按 none 拉伸，字会变形） */
    [[320, "320"], [768, "768"], [1440, "1440"], [2088, "2088封顶"], [2560, "2560"]].forEach(function (t) {
      var sp = el("span", t[0] === 2560 ? "is-end" : "", t[1]);
      sp.style.left = (x(t[0]) / 6.4) + "%";
      axis.appendChild(sp);
    });
    /* 当前宽度上每条曲线一颗点（HTML 圆点，不跟 svg 一起变形） */
    var dots = {};
    Object.keys(STEPS).forEach(function (k) {
      var d = el("i", "tsc-dot");
      d.style.setProperty("--k", STEPS[k].color);
      chart.appendChild(d);
      dots[k] = d;
    });

    var rows = {};
    $$("[data-tsc-step]", box).forEach(function (li) {
      rows[li.getAttribute("data-tsc-step")] = { px: $("[data-tsc-px]", li), sample: $("[data-tsc-sample]", li) };
    });

    function paint() {
      var w = +range.value;
      var sc = scaleAt(w);
      var xx = x(w);
      mark.setAttribute("x1", xx);
      mark.setAttribute("x2", xx);
      Object.keys(STEPS).forEach(function (k) {
        var px = sizeAt(STEPS[k], w);
        rows[k].px.textContent = fix(px, 2).replace(/\.?0+$/, "") + "px";
        rows[k].sample.style.fontSize = px.toFixed(2) + "px";
        dots[k].style.left = "calc(12 * var(--u) + (100% - 24 * var(--u)) * " + (xx / 640).toFixed(4) + ")";
        dots[k].style.top = "calc(10 * var(--u) + (100% - 20 * var(--u)) * " + (y(px) / 200).toFixed(4) + ")";
      });
      var zone = w <= 1440 ? (sizeAt(STEPS.title, w) >= 34.15 ? "clamp到顶" : "clamp插值") : (w >= 2088 ? "1.45倍封顶" : "--scale放大");
      out.textContent = w + "px · --scale " + sc.toFixed(3);
      range.setAttribute("aria-valuetext", w + "px，" + zone + "，大标题" + fix(sizeAt(STEPS.title, w), 2) + "px，正文" + fix(sizeAt(STEPS.body, w), 2) + "px");
    }
    range.addEventListener("input", paint);
    range.addEventListener("keydown", function (e) {
      if (composing(e) || !e.shiftKey) return;
      var d = (e.key === "ArrowRight" || e.key === "ArrowUp") ? 50 : (e.key === "ArrowLeft" || e.key === "ArrowDown") ? -50 : 0;
      if (!d) return;
      e.preventDefault();
      range.value = String(clamp(+range.value + d, W0, W1));
      paint();
    });
    $$("[data-tsc-go]", box).forEach(function (b) {
      b.addEventListener("click", function () {
        var v = b.getAttribute("data-tsc-go");
        var w = v === "here" ? (root.clientWidth || window.innerWidth) : +v;
        range.value = String(clamp(Math.round(w), W0, W1));
        paint();
        announce("模拟视口宽" + range.value + "px：大标题" + fix(sizeAt(STEPS.title, +range.value), 2) + "px，正文" + fix(sizeAt(STEPS.body, +range.value), 2) + "px");
      });
    });
    paint();
  }

  /* =====================================================================
   * 2 字重
   * ===================================================================== */
  function initWeight() {
    var list = $("[data-twt-list]");
    if (!list) return;
    var entry = list.closest(".specimen");
    var sum = $("[data-twt-sum]", entry);
    var WEIGHTS = [300, 400, 500, 600, 650, 700, 750, 800];
    var TEXT = "综合业务练习Excel导出2026";
    var YH = { 300: "细", 400: "常规", 700: "粗" };
    function yahei(w) { return w < 350 ? 300 : w < 600 ? 400 : 700; }
    var mode = "here";
    var lis = WEIGHTS.map(function (w) {
      var li = el("li");
      li.appendChild(el("code", "twt-w", String(w)));
      var s = el("span", "twt-s", TEXT);
      li.appendChild(s);
      li.appendChild(el("span", "twt-px"));
      li.appendChild(el("span", "twt-same"));
      list.appendChild(li);
      return { w: w, li: li, s: s, px: li.children[2], same: li.children[3] };
    });
    function render(speak) {
      var fam = bodyFont();
      var widths = {};
      if (!probeCtx) probeCtx = doc.createElement("canvas").getContext("2d");
      lis.forEach(function (r) {
        var shown = mode === "here" ? r.w : yahei(r.w);
        r.s.style.fontWeight = String(shown);
        if (mode === "here") {
          /* 字重写在字号前面量；宽度一样 = 画的是同一款字重 */
          probeCtx.font = r.w + " 40px " + fam;
          widths[r.w] = Math.round(probeCtx.measureText(TEXT).width * 100) / 100;
        } else widths[r.w] = shown;
      });
      var groups = {};
      lis.forEach(function (r) {
        var key = String(widths[r.w]);
        if (!groups[key]) groups[key] = [];
        groups[key].push(r.w);
        var first = groups[key][0];
        r.px.textContent = mode === "here" ? "宽" + fix(widths[r.w], 1) : "雅黑：" + YH[widths[r.w]];
        r.same.textContent = first !== r.w ? "＝" + first : "";
        r.same.classList.toggle("is-dup", first !== r.w);
      });
      var same = Object.keys(groups).map(function (k) { return groups[k]; }).filter(function (g) { return g.length > 1; });
      var lead = leaders(fam).han;
      var text;
      if (mode === "here") {
        text = same.length ? "这台机器（中文由" + lead + "出字）：" + same.map(function (g) { return g.join("、"); }).join("；") + (same.length > 1 ? "画出来一样宽，每组各是同一款字重。" : "画出来一样宽，是同一款字重。") : "这台机器（中文由" + lead + "出字）：八个字重宽度都不一样。";
      } else {
        text = "微软雅黑上（示意）：300是细，400、500是常规，600、650、700、750、800全是粗——600和700分不出来。";
      }
      sum.textContent = text;
      if (speak) announce(text);
    }
    radios($('[role="radiogroup"]', entry), function (b) {
      mode = b.getAttribute("data-twt-mode");
      render(true);
    });
    render(false);
  }

  /* =====================================================================
   * 3 行宽
   * ===================================================================== */
  function initMeasure() {
    var stage = $("[data-tms]");
    if (!stage) return;
    var entry = stage.closest(".specimen");
    var col = $("[data-tms-col]", stage);
    var p = $("[data-tms-p]", stage);
    var handle = $("[data-tms-handle]", stage);
    var read = $("[data-tms-read]", entry);
    var mode = "measure";
    var w = 0;
    var full = true;
    col.setAttribute("data-mode", mode);
    function avail() { return Math.max(0, stage.clientWidth - parseFloat(getComputedStyle(stage).paddingRight)); }
    function minW() { return Math.min(avail(), 220 * unit()); }
    function paint() {
      var lw = p.getBoundingClientRect().width;
      var n = firstLineChars(p);
      var lh = parseFloat(getComputedStyle(p).lineHeight) / parseFloat(getComputedStyle(p).fontSize);
      read.innerHTML = "";
      read.appendChild(doc.createTextNode("栏宽"));
      read.appendChild(el("b", null, Math.round(w) + "px"));
      read.appendChild(doc.createTextNode(" · 正文行宽"));
      read.appendChild(el("b", null, Math.round(lw) + "px"));
      read.appendChild(doc.createTextNode(" · 第一行"));
      read.appendChild(el("b", null, n + "字"));
      read.appendChild(doc.createTextNode(" · 行高" + fix(lh, 2) + (mode === "measure" && w > lw + 40 ? " · 右边是留白" : "")));
    }
    var paintSoon = frame(paint);
    var h = makeHandle(handle, {
      get: function () { return w; },
      set: function (v) { w = v; full = Math.abs(v - avail()) < 1; col.style.width = Math.round(v) + "px"; paintSoon(); },
      min: minW, max: avail, step: 20,
      say: function () { announce("阅读栏" + Math.round(w) + "px，第一行" + firstLineChars(p) + "字"); }
    });
    function fit() {
      var a = avail();
      if (full || w > a) w = a;
      col.style.width = Math.round(w) + "px";
      h.sync();
      paint();
    }
    radios($('[role="radiogroup"]', entry), function (b) {
      mode = b.getAttribute("data-tms-mode");
      col.setAttribute("data-mode", mode);
      paint();
      announce((mode === "fill" ? "反例：正文铺满，第一行" : "现行：正文收在680px，第一行") + firstLineChars(p) + "字");
    });
    window.addEventListener("resize", frame(fit));
    fit();
  }

  /* =====================================================================
   * 4 最小字号
   * ===================================================================== */
  function initMin() {
    var phone = $("[data-tmn-phone]");
    if (!phone) return;
    var entry = phone.closest(".specimen");
    var aux = $("[data-tmn-aux]", entry);
    var auxOut = $("[data-tmn-aux-out]", entry);
    var read = $("[data-tmn-read]", entry);
    auxOut.setAttribute("aria-live", "off");
    var body = 15;
    function paint(speak) {
      var a = +aux.value;
      phone.style.setProperty("--aux", a + "px");
      phone.style.setProperty("--body", body + "px");
      phone.classList.toggle("is-low", a < 13);
      auxOut.textContent = a + "px";
      aux.setAttribute("aria-valuetext", a + "px" + (a < 13 ? "，低于13px地板" : ""));
      read.innerHTML = "";
      read.appendChild(doc.createTextNode("辅助字"));
      read.appendChild(el("b", null, a + "px"));
      read.appendChild(doc.createTextNode(" · 正文"));
      read.appendChild(el("b", null, body + "px"));
      var warns = [];
      if (a < 13) warns.push("辅助字低于岗岗的13px地板");
      if (body < 15) warns.push("手机正文降到了14px");
      if (warns.length) { read.appendChild(doc.createTextNode(" · ")); read.appendChild(el("span", "ty-warn", warns.join("；"))); }
      if (speak) announce("辅助字" + a + "px，正文" + body + "px" + (warns.length ? "：" + warns.join("；") : ""));
    }
    aux.addEventListener("input", function () { paint(false); });
    aux.addEventListener("change", function () { paint(true); });
    radios($('[role="radiogroup"]', entry), function (b) {
      body = +b.getAttribute("data-tmn-body");
      paint(true);
    });
    paint(false);
  }

  /* =====================================================================
   * 5 楷书巨字
   * ===================================================================== */
  function initKai() {
    var box = $("[data-tkai]");
    if (!box) return;
    var blob = $("[data-tkai-blob]", box);
    var big = $("[data-tkai-big]", box);
    var ink = $("[data-tkai-ink]", box);
    var ghost = $("[data-tkai-ghost]", box);
    var indentBtn = $("[data-tkai-indent]", box);
    var input = $("[data-tkai-title]", box);
    var read = $("[data-tkai-read]", box);
    var SUBSET = "小屋工具架随笔本留言板";
    var FB = { kai: "系统楷体", sans: "黑体", serif: "serif" };
    var fb = "kai";
    var twoW = 0;
    box.setAttribute("data-fb", fb);
    var kaiLead = leaders(getComputedStyle(big).fontFamily);

    function chars(s) { return Array.from ? Array.from(s) : s.split(""); }
    function render(text) {
      big.textContent = "";
      chars(text).forEach(function (c) {
        if (SUBSET.indexOf(c) >= 0) big.appendChild(doc.createTextNode(c));
        else big.appendChild(el("span", "tkai-out", c));
      });
    }
    /* 两个字时色块多宽：临时换成「小屋」量一次（字号随视口变，改尺寸时重量） */
    function measureTwo() {
      var keep = input.value;
      render("小屋");
      twoW = blob.getBoundingClientRect().width;
      render(keep);
    }
    /* 字墨中线：第一个字的左边到最后一个字的左边加一个字号（楷书是方块字，一个字一个 em） */
    function inkCenter() {
      var r = doc.createRange();
      var first = null, last = null;
      var walker = doc.createTreeWalker(big, NodeFilter.SHOW_TEXT, null, false);
      var nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(function (n) {
        for (var i = 0; i < n.length; i++) {
          r.setStart(n, i);
          r.setEnd(n, i + 1);
          var rc = r.getClientRects()[0];
          if (!rc) continue;
          if (!first) first = rc;
          last = rc;
        }
      });
      if (!first) return null;
      var fs = parseFloat(getComputedStyle(big).fontSize);
      return (first.left + last.left + fs) / 2;
    }
    function paint(speak) {
      var text = input.value;
      var list = chars(text);
      var out = list.filter(function (c) { return SUBSET.indexOf(c) < 0; });
      var b = blob.getBoundingClientRect();
      var c = inkCenter();
      var off = c == null ? 0 : c - (b.left + b.width / 2);
      if (c == null) ink.style.opacity = "0";
      else {
        /* 竖向只盖住巨字那一行（字号随视口变，量着放） */
        ink.style.opacity = "1";
        ink.style.top = big.offsetTop + "px";
        ink.style.height = big.offsetHeight + "px";
        ink.style.transform = "translateX(" + (c - b.left - 1).toFixed(2) + "px)";
      }
      var wide = list.length > 0 && list.length !== 2;
      ghost.hidden = !wide;
      if (wide) ghost.style.width = twoW.toFixed(1) + "px";
      read.innerHTML = "";
      read.appendChild(doc.createTextNode("字墨中线"));
      read.appendChild(el("b", null, Math.abs(off) < 0.3 ? "居中" : (off < 0 ? "偏左" : "偏右") + fix(Math.abs(off), 1) + "px"));
      read.appendChild(doc.createTextNode(indentBtn.getAttribute("aria-pressed") === "true" ? "（text-indent补上了）" : "（没补：最后一个字后面多一格字距）"));
      read.appendChild(doc.createTextNode(" · "));
      if (!list.length) read.appendChild(el("span", "ty-warn", "标题空着"));
      else if (out.length) {
        read.appendChild(el("span", "ty-warn", "子集外" + out.length + "个字：" + out.join("、")));
        read.appendChild(doc.createTextNode("，落到" + FB[fb]));
      } else read.appendChild(doc.createTextNode("全在子集里"));
      if (wide) {
        read.appendChild(doc.createTextNode(" · "));
        read.appendChild(el("span", "ty-warn", list.length + "个字：色块比两个字" + (b.width >= twoW ? "宽了" : "窄了") + fix(Math.abs(b.width - twoW), 0) + "px"));
      }
      read.appendChild(doc.createTextNode(" · 本机楷体：" + (kaiLead.han === "系统回退字" ? "没有，落到了serif" : kaiLead.han)));
      if (speak) announce(read.textContent);
    }
    indentBtn.addEventListener("click", function () {
      var on = indentBtn.getAttribute("aria-pressed") !== "true";
      indentBtn.setAttribute("aria-pressed", on ? "true" : "false");
      box.classList.toggle("no-indent", !on);
      measureTwo();
      paint(true);
    });
    input.addEventListener("input", function (e) {
      if (e.isComposing) return;   /* 输入法选词时框里是拼音，选完（compositionend）再画 */
      render(input.value);
      paint(false);
    });
    input.addEventListener("compositionend", function () { render(input.value); paint(false); });
    input.addEventListener("change", function () { paint(true); });
    radios($('[role="radiogroup"]', box), function (b) {
      fb = b.getAttribute("data-tkai-fb");
      box.setAttribute("data-fb", fb);
      measureTwo();
      paint(true);
    });
    window.addEventListener("resize", frame(function () { measureTwo(); paint(false); }));
    render(input.value);
    measureTwo();
    paint(false);
  }

  /* =====================================================================
   * 6 五个字族
   * ===================================================================== */
  function initFamily() {
    var box = $("[data-tfam]");
    if (!box) return;
    var stage = $("[data-tfam-stage]", box);
    var arch = $("[data-tfam-arch]", box);
    var plain = $("[data-tfam-plain]", box);
    var read = $("[data-tfam-read]", box);
    var picks = $$("[data-tfam-pick]", box);
    var STACK = {
      sans: bodyFont(),
      serif: '"Songti SC", "STSong", "SimSun", serif',
      kai: getComputedStyle($('[data-fam="kai"]', stage)).fontFamily,
      xing: '"Xingkai SC", "STXingkai", "华文行楷", ' + getComputedStyle($('[data-fam="kai"]', stage)).fontFamily,
      hand: "cursive"
    };
    var SAY = {
      sans: "黑体：正文、说明、副标题、日期，界面上其余的字全是它。",
      serif: "宋体：工具名、规格数字、归档「以前写的」与随笔球标题。",
      kai: "楷书：只有两个字的巨字。小屋用自托管子集，这里用系统楷体代替。",
      xing: "行楷：站上现在没有页面在用。「以前写的」换回2026-09-28以前的样子（示意）：没装系统行楷的机器会回落到楷书子集，这四个字又都不在子集里。",
      hand: "手写：只有开场「Hey, Ysevan!」。小屋用自托管子集，这里是浏览器的cursive。"
    };
    var cur = "";
    function where(f) {
      if (f === "hand") return "本机：浏览器的cursive";
      var l = leaders(STACK[f]);
      return "本机落到" + l.han;
    }
    function paint(speak) {
      stage.toggleAttribute("data-pick", !!cur);
      if (cur) stage.setAttribute("data-pick", cur);
      arch.classList.toggle("is-xing", cur === "xing");
      $$("[data-fam]", stage).forEach(function (n) {
        n.classList.toggle("is-on", cur === "xing" ? n === arch : n.getAttribute("data-fam") === cur);
      });
      picks.forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-tfam-pick") === cur ? "true" : "false"); });
      var text = cur ? SAY[cur] + where(cur) + "。" : "点上面的字族看它用在哪；再点一次取消。";
      if (stage.classList.contains("is-plain")) text = "只留黑体（示意）：巨字、工具名、归档标题都换成黑体，小屋的手作气质就没了。" + (cur ? " " + text : "");
      read.textContent = text;
      if (speak) announce(text);
    }
    picks.forEach(function (b) {
      b.addEventListener("click", function () {
        var f = b.getAttribute("data-tfam-pick");
        cur = cur === f ? "" : f;
        paint(true);
      });
    });
    plain.addEventListener("click", function () {
      var on = plain.getAttribute("aria-pressed") !== "true";
      plain.setAttribute("aria-pressed", on ? "true" : "false");
      stage.classList.toggle("is-plain", on);
      paint(true);
    });
    paint(false);
  }

  /* =====================================================================
   * 7 论文排法
   * ===================================================================== */
  function initProse() {
    var box = $("[data-tpr]");
    if (!box) return;
    var range = $("[data-tpr-lh]", box);
    var lhOut = $("[data-tpr-lh-out]", box);
    var card = $(".tpr-card", box);
    var ps = $$(".tpr-p", box);
    var read = $("[data-tpr-read]", box);
    lhOut.setAttribute("aria-live", "off");
    var mode = "paper";
    var NAME = { paper: "论文排法", web: "顶格＋空一行（改版前，示意）", zero: "段距0（示意）" };
    box.setAttribute("data-mode", mode);
    function paint(speak) {
      var lh = +range.value;
      card.style.setProperty("--lh", String(lh));
      lhOut.textContent = String(lh);
      var cs = getComputedStyle(ps[0]);
      var fs = parseFloat(cs.fontSize);
      var line = (parseFloat(cs.lineHeight) - fs) / fs;
      var mt = parseFloat(getComputedStyle(ps[1]).marginTop) / fs;
      var para = line + mt;
      var ratio = line > 0 ? para / line : 0;
      var ind = parseFloat(cs.textIndent) / fs;
      read.innerHTML = "";
      read.appendChild(doc.createTextNode(NAME[mode] + "：首行缩进"));
      read.appendChild(el("b", null, fix(ind, 0) + "em"));
      read.appendChild(doc.createTextNode(" · 行间"));
      read.appendChild(el("b", null, fix(line, 2) + "em"));
      read.appendChild(doc.createTextNode(" · 段间"));
      read.appendChild(el("b", null, fix(para, 2) + "em"));
      read.appendChild(doc.createTextNode(" · 段间:行间＝"));
      read.appendChild(el("b", null, fix(ratio, 1) + ":1"));
      var note = "";
      if (mode === "zero") note = "缩进成了唯一的分段信号";
      else if (mode === "web") note = "段间空了一整行，长文看着像一堵墙一块一块";
      else if (Math.abs(lh - 1.8) < 0.01) note = "现行就是这一组";
      if (note) { read.appendChild(doc.createTextNode(" · ")); read.appendChild(el("span", mode === "paper" ? null : "ty-warn", note)); }
      range.setAttribute("aria-valuetext", "行距" + lh + "，段间:行间" + fix(ratio, 1) + "比1");
      if (speak) announce(read.textContent);
    }
    range.addEventListener("input", function () { paint(false); });
    range.addEventListener("change", function () { paint(true); });
    radios($('[role="radiogroup"]', box), function (b) {
      mode = b.getAttribute("data-tpr-mode");
      box.setAttribute("data-mode", mode);
      paint(true);
    });
    paint(false);
  }

  /* =====================================================================
   * 8 字体栈
   * ===================================================================== */
  function initStack() {
    var sample = $("[data-tst-sample]");
    if (!sample) return;
    var entry = sample.closest(".specimen");
    var code = $("[data-tst-code]", entry);
    var hits = $("[data-tst-hits]", entry);
    var read = $("[data-tst-read]", entry);
    var STACKS = {
      cjk: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", -apple-system, BlinkMacSystemFont, sans-serif',
      ui: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif',
      latin: 'Arial, Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif'
    };
    var NAME = { cjk: "中文在前（现行）", ui: "系统UI在前（刷刷）", latin: "西文字体在前（反例，示意）" };
    var mode = "cjk";
    function paint(speak) {
      var st = STACKS[mode];
      sample.style.fontFamily = st;
      code.textContent = "font-family: " + st + ";";
      hits.textContent = "";
      var lead = leaders(st);
      familyList(st).forEach(function (f) {
        if (GENERIC[f]) return;
        var p = probeFont(f);
        var li = el("li", p.han ? "is-have" : p.have ? "is-latin" : "", f + (p.han ? " ✓" : p.have ? " · 只有西文" : " · 没有"));
        if (f === lead.han || f === lead.latin) li.classList.add("is-lead");
        hits.appendChild(li);
      });
      var text = NAME[mode] + "：中文由" + lead.han + "出字，西文、数字、箭头和中点由" + lead.latin + "出字" +
        (lead.han === lead.latin ? "，一段话一套字形。" : "，一段话里两套字形。");
      read.textContent = text;
      if (speak) announce(text);
    }
    radios($('[role="radiogroup"]', entry), function (b) {
      mode = b.getAttribute("data-tst-stack");
      paint(true);
    });
    paint(false);
  }

  /* =====================================================================
   * 9 不引外部字体
   * ===================================================================== */
  function initNofont() {
    var win = $("[data-tnf]");
    if (!win) return;
    var entry = win.closest(".specimen");
    var run = $("[data-tnf-run]", win);
    var time = $("[data-tnf-time]", win);
    var prog = $("[data-tnf-prog]", win);
    var text = $("[data-tnf-text]", win);
    var con = $("[data-tnf-console]", win);
    var read = $("[data-tnf-read]", entry);
    var mode = "system";
    var timers = [];
    var anim = null;
    var t0 = 0;
    var gen = 0;
    function clear() {
      gen++;
      timers.forEach(function (t) { clearTimeout(t); clearInterval(t); });
      timers = [];
      if (anim) { anim.cancel(); anim = null; }
    }
    function log(line, err) {
      var p = el("p", err ? "is-err" : null, line);
      con.appendChild(p);
    }
    function done(msg, speak) {
      read.textContent = msg;
      if (speak) announce(msg);
    }
    function start(speak) {
      clear();
      var my = gen;
      con.textContent = "";
      prog.style.transform = "scaleX(0)";
      text.classList.remove("is-blank");
      time.textContent = "0.0秒";
      if (mode === "system") {
        log("（不发字体请求：系统里就有这几款字）");
        prog.style.transform = "scaleX(1)";
        done("系统字体栈：第0秒就画出来。", speak);
        return;
      }
      if (mode === "csp") {
        log("Refused to load the font 'https://fonts.gstatic.com/…' because it violates the following Content Security Policy directive: \"font-src 'self' data:\".", true);
        prog.style.transform = "scaleX(1)";
        done("被CSP拦下：请求当场失败，控制台报一条错，字一直是回退字——设计稿上那款字一次都没画出来。", speak);
        return;
      }
      /* 连不上：先空白，最多约 3 秒才用回退字（浏览器默认的阻塞期，示意） */
      log("GET https://fonts.gstatic.com/… （挂着，没有回音）");
      if (reduced()) {
        prog.style.transform = "scaleX(1)";
        time.textContent = "3.0秒";
        log("3秒到了，先用回退字；那款字一直没到。");
        done("连不上：0到3秒这段字是空白的，3秒后才用回退字（减弱动效下直接显示结果）。", speak);
        return;
      }
      text.classList.add("is-blank");
      t0 = Date.now();
      if (canAnimate) anim = prog.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: 3000, easing: "linear", fill: "forwards" });
      else prog.style.transform = "scaleX(1)";
      timers.push(setInterval(function () {
        if (my !== gen) return;
        time.textContent = fix(Math.min(3, (Date.now() - t0) / 1000), 1) + "秒";
      }, 100));
      read.textContent = "连不上：字先空着，等那款字……";
      if (speak) announce("连不上：字先空着，最多等3秒");
      timers.push(setTimeout(function () {
        if (my !== gen) return;
        clear();
        time.textContent = "3.0秒";
        prog.style.transform = "scaleX(1)";
        text.classList.remove("is-blank");
        log("3秒到了，先用回退字；那款字一直没到。");
        done("连不上：前3秒一个字都没有，之后才用回退字。", true);
      }, 3000));
    }
    run.addEventListener("click", function () { start(true); });
    radios($('[role="radiogroup"]', entry), function (b) {
      mode = b.getAttribute("data-tnf-mode");
      start(true);
    });
    start(false);
  }

  /* =====================================================================
   * 10 中英文空格
   * ===================================================================== */
  var HAN_RE = /[⺀-鿿豈-﫿　-〿＀-￯]/;
  var LD_RE = /[A-Za-z0-9]/;
  /* 反例：在中文与英文 / 数字的交界插一个空格（源文件里不写错的文案，由这里生成） */
  function spaced(s) {
    var out = [];
    var cs = Array.from ? Array.from(s) : s.split("");
    for (var i = 0; i < cs.length; i++) {
      var a = cs[i], b = cs[i + 1];
      out.push({ t: a });
      if (b && ((HAN_RE.test(a) && LD_RE.test(b)) || (LD_RE.test(a) && HAN_RE.test(b)))) out.push({ gap: true });
    }
    return out;
  }
  /* 家族口径整理：返回片段 [{ s, kind: "keep" | "del" | "add" | "swap" }] */
  var URL_RE = /(?:https?:\/\/|www\.)[^\s　-〿＀-￯一-鿿]+/g;
  var HALF = { ",": "，", ";": "；", ":": "：", "?": "？", "!": "！" };
  function normalize(src) {
    var urls = [];
    var m;
    URL_RE.lastIndex = 0;
    while ((m = URL_RE.exec(src))) {
      var end = m.index + m[0].length;
      /* 句末标点（半角）不算网址的一部分 */
      while (end > m.index && /[.,;:!?)]/.test(src.charAt(end - 1))) end--;
      urls.push([m.index, end]);
    }
    function inUrl(i) { for (var k = 0; k < urls.length; k++) if (i >= urls[k][0] && i < urls[k][1]) return urls[k]; return null; }
    function isUrlStart(i) { for (var k = 0; k < urls.length; k++) if (urls[k][0] === i) return true; return false; }
    function isUrlEnd(i) { for (var k = 0; k < urls.length; k++) if (urls[k][1] === i) return true; return false; }
    var parts = [];
    var i = 0;
    while (i < src.length) {
      var u = inUrl(i);
      if (u) {
        var prev = parts.length ? parts[parts.length - 1].s.slice(-1) : "";
        if (prev && !/\s/.test(prev)) parts.push({ s: " ", kind: "add" });
        parts.push({ s: src.slice(u[0], u[1]), kind: "keep" });
        i = u[1];
        var next = src.charAt(i);
        if (next && !/\s/.test(next)) parts.push({ s: " ", kind: "add" });
        continue;
      }
      var c = src.charAt(i);
      if (c === " " || c === "\t" || c === " ") {
        var j = i;
        while (j < src.length && (src.charAt(j) === " " || src.charAt(j) === "\t" || src.charAt(j) === " ")) j++;
        var before = src.charAt(i - 1), after = src.charAt(j);
        var nearUrl = isUrlEnd(i) || isUrlStart(j);
        if (!nearUrl && before && after && !/\n/.test(before) && !/\n/.test(after) && (HAN_RE.test(before) || HAN_RE.test(after))) {
          parts.push({ s: src.slice(i, j), kind: "del" });
        } else parts.push({ s: src.slice(i, j), kind: "keep" });
        i = j;
        continue;
      }
      if (c === "~") {
        var pb = src.charAt(i - 1), pa = src.charAt(i + 1);
        if ((pb && (HAN_RE.test(pb) || /\d/.test(pb))) || (pa && (HAN_RE.test(pa) || /\d/.test(pa)))) {
          parts.push({ s: "～", kind: "swap", from: c });
          i++;
          continue;
        }
      }
      /* 半角标点：前一个字是中文，或者后面（隔着空格）跟的是中文，就换成全角 */
      if (HALF[c] && (HAN_RE.test(src.charAt(i - 1) || "") || HAN_RE.test((src.slice(i + 1).match(/^[ \t]*(.)/) || [])[1] || ""))) {
        parts.push({ s: HALF[c], kind: "swap", from: c });
        i++;
        continue;
      }
      var last = parts[parts.length - 1];
      if (last && last.kind === "keep" && !/\s/.test(last.s) && !inUrl(i - 1)) last.s += c;
      else parts.push({ s: c, kind: "keep" });
      i++;
    }
    return parts;
  }
  function initSpace() {
    var good = $("[data-tsp-good]");
    var bad = $("[data-tsp-bad]");
    if (!good || !bad) return;
    var entry = good.closest(".specimen");
    var input = $("[data-tsp-in]", entry);
    var out = $("[data-tsp-out]", entry);
    var read = $("[data-tsp-read]", entry);
    $$("li", good).forEach(function (li) {
      var row = el("li");
      spaced(li.textContent).forEach(function (piece) {
        if (piece.gap) row.appendChild(el("span", "tsp-gap", " "));
        else row.appendChild(doc.createTextNode(piece.t));
      });
      bad.appendChild(row);
    });
    /* 默认这段故意写错（示例）：中英、中数之间有空格，网址贴着字，~ 当 ～ 用 */
    input.value = ["Ysevan", " 的小屋：共 ", "12", " 题，做完要 ", "30", " 分钟。", "9~12", "点在线，说明见", "https://old.ysevan.com/ysevan", " 。"].join("");
    function paint(speak) {
      var parts = normalize(input.value);
      out.textContent = "";
      var del = 0, add = 0, swap = 0;
      parts.forEach(function (p) {
        if (p.kind === "del") {
          del++;
          var d = el("i", "tsp-mark is-del");
          d.setAttribute("title", "去掉的空格");
          out.appendChild(d);
        } else if (p.kind === "add") {
          add++;
          var a = el("i", "tsp-mark is-add");
          a.setAttribute("title", "补上的空格");
          out.appendChild(a);
          out.appendChild(doc.createTextNode(p.s));
        } else if (p.kind === "swap") {
          swap++;
          var s = el("u", "tsp-mark is-swap", p.s);
          s.setAttribute("title", "原来是" + p.from);
          out.appendChild(s);
        } else out.appendChild(doc.createTextNode(p.s));
      });
      var text = del + add + swap === 0 ? "已经符合家族口径。" :
        "去掉" + del + "处空格 · 网址两侧补了" + add + "个空格 · 换了" + swap + "个半角标点";
      read.textContent = text;
      if (speak) announce(text);
    }
    input.addEventListener("input", function (e) {
      if (e.isComposing) return;   /* 输入法选词期间框里是拼音，不整理 */
      paint(false);
    });

    /* 拼接反例（控制室 10-08，岗岗踩到）：逐个字面量扫，扫不出；拼出来的字带空格 */
    var cat = $("[data-tsp-cat]", entry);
    if (cat) {
      var LITS = ["有 ", " 处"];
      var catN = 3;
      /* 数的是「夹在汉字与数字之间的空格」本身（用前后断言，「有 3 处」两段空格各算一处） */
      var HAN_NUM = /(?<=[\u4e00-\u9fff])[ \t]+(?=\d)|(?<=\d)[ \t]+(?=[\u4e00-\u9fff])/g;
      var scanOut = $("[data-tsp-cat-scan]", cat);
      var outEl = $("[data-tsp-cat-out]", cat);
      var hitEl = $("[data-tsp-cat-hit]", cat);
      var paintCat = function (speak) {
        var scanned = LITS.reduce(function (sum, l) { return sum + (l.match(HAN_NUM) || []).length; }, 0);
        var shown = LITS[0] + catN + LITS[1];
        var hits = (shown.match(HAN_NUM) || []).length;
        scanOut.textContent = scanned + "处";
        outEl.textContent = "";
        /* 原样画拼出来的串，只把空格标红 */
        shown.split("").forEach(function (ch) {
          if (ch === " ") outEl.appendChild(el("span", "tsp-gap", " "));
          else outEl.appendChild(doc.createTextNode(ch));
        });
        hitEl.textContent = "带空格" + hits + "处";
        if (speak) announce("扫源码" + scanned + "处，画出来带空格" + hits + "处");
      };
      $("[data-tsp-cat-n]", cat).addEventListener("click", function () {
        catN = catN >= 99 ? 3 : catN * 3 + 1;
        paintCat(true);
      });
      paintCat(false);
    }
    input.addEventListener("compositionend", function () { paint(false); });
    input.addEventListener("change", function () { paint(true); });
    paint(false);
  }

  /* =====================================================================
   * 11 等宽数字
   * ===================================================================== */
  function initTnum() {
    var box = $("[data-ttn]");
    if (!box) return;
    var runBtn = $("[data-ttn-run]", box);
    var nextBtn = $("[data-ttn-next]", box);
    var read = $("[data-ttn-read]", box);
    var figs = $$("[data-ttn-box]", box).map(function (f) {
      return { kind: f.getAttribute("data-ttn-box"), clock: $("[data-ttn-clock]", f), q: $("[data-ttn-q]", f), jit: $("[data-ttn-jit]", f), lo: Infinity, hi: 0, diff: 0 };
    });
    var NAME = { pf: "中文字族打头", num: "--font-num" };
    var ROWS = [["年检2026", "1186"], ["国内结算", "980"], ["票据融资", "111"], ["反假货币", "1018"], ["对公外汇", "449"]];
    $$("[data-ttn-rows]", box).forEach(function (tb) {
      ROWS.forEach(function (r) {
        var tr = el("tr");
        tr.appendChild(el("td", null, r[0]));
        tr.appendChild(el("td", null, r[1] + "题"));
        tb.appendChild(tr);
      });
    });
    var ms = 0, q = 1, timer = 0, last = 0;
    var running = false, userStopped = false, inView = false;
    function fmt(t) {
      var s = Math.floor(t / 1000);
      var mm = Math.floor(s / 60), ss = s % 60, d = Math.floor((t % 1000) / 100);
      return (mm < 10 ? "0" : "") + mm + ":" + (ss < 10 ? "0" : "") + ss + "." + d;
    }
    /* 静态量一次：同一个框里「11:11.1」和「00:00.0」差多宽（不用等计时就有数） */
    function staticDiff() {
      figs.forEach(function (f) {
        var keep = f.clock.textContent;
        f.clock.textContent = "11:11.1";
        var a = f.clock.getBoundingClientRect().width;
        f.clock.textContent = "00:00.0";
        var b = f.clock.getBoundingClientRect().width;
        f.clock.textContent = keep;
        f.diff = Math.abs(b - a);
      });
    }
    function readout() {
      figs.forEach(function (f) {
        f.jit.textContent = "";
        f.jit.appendChild(doc.createTextNode("「1」比「0」窄"));
        f.jit.appendChild(el("b", null, fix(f.diff / 5, 1) + "px"));
        if (f.hi > 0) {
          f.jit.appendChild(doc.createTextNode(" · 计时时框宽跳了"));
          f.jit.appendChild(el("b", f.hi - f.lo > 0.5 ? "ty-warn" : null, fix(f.hi - f.lo, 1) + "px"));
        }
      });
      var pf = figs.filter(function (f) { return f.kind === "pf"; })[0];
      var num = figs.filter(function (f) { return f.kind === "num"; })[0];
      var text = "这台机器：" + figs.map(function (f) {
        return NAME[f.kind] + "时「1」比「0」窄" + fix(f.diff / 5, 1) + "px" + (f.hi > 0 ? "、计时框宽跳了" + fix(f.hi - f.lo, 1) + "px" : "");
      }).join("；") + "。";
      /* 按写的栈认（计算样式里 Chrome 会把 BlinkMacSystemFont 写成 "system-ui"，读出来认不准是谁） */
      var rs = getComputedStyle(root);
      text += "中文字族打头时数字由" + leaders(rs.getPropertyValue("--font")).latin + "画" + (pf.diff > 0.5 ? "，这个浏览器里它不认等宽" : "，这个浏览器里它也认等宽") + "；";
      text += "--font-num时由" + leaders(rs.getPropertyValue("--font-num")).latin + "画" + (num.diff > 0.5 ? "，还是会跳（这台机器要另核）。" : "，等宽生效。");
      read.textContent = text;
    }
    function measure() {
      figs.forEach(function (f) {
        var w = f.clock.getBoundingClientRect().width;
        f.lo = Math.min(f.lo, w);
        f.hi = Math.max(f.hi, w);
      });
      readout();
    }
    function paint() {
      var t = fmt(ms);
      figs.forEach(function (f) { f.clock.textContent = t; f.q.textContent = "第" + q + "/120题"; });
      measure();
    }
    function tick() {
      var now = Date.now();
      ms += now - last;
      last = now;
      paint();
    }
    function start() {
      if (running) return;
      running = true;
      last = Date.now();
      timer = setInterval(tick, 100);
      runBtn.setAttribute("aria-pressed", "true");
      runBtn.textContent = "暂停";
    }
    function stop() {
      if (!running) return;
      running = false;
      clearInterval(timer);
      runBtn.setAttribute("aria-pressed", "false");
      runBtn.textContent = "开始计时";
    }
    function jumps() { return figs.map(function (f) { return NAME[f.kind] + fix(f.hi - f.lo, 1) + "px"; }).join("，"); }
    runBtn.addEventListener("click", function () {
      if (running) { stop(); userStopped = true; announce("计时暂停。框宽跳了：" + jumps()); }
      else { figs.forEach(function (f) { f.lo = Infinity; f.hi = 0; }); userStopped = false; start(); announce("计时开始"); }
    });
    nextBtn.addEventListener("click", function () {
      q = q % 120 + 1;
      paint();
      announce("第" + q + "题");
    });
    /* 滚到才走、滚走就停、页面隐藏就停；减弱动效下不自动走（点了才走） */
    function auto() {
      if (inView && !doc.hidden && !userStopped && !reduced()) start();
      else if (running && (!inView || doc.hidden)) stop();
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        inView = es[es.length - 1].isIntersecting;
        auto();
      }, { threshold: 0.3 }).observe(box);
    }
    doc.addEventListener("visibilitychange", auto);
    window.addEventListener("resize", frame(function () { staticDiff(); readout(); }));
    staticDiff();
    paint();
    /* 开页那一下的宽度不算「跳」：从第一次走动开始记 */
    figs.forEach(function (f) { f.lo = Infinity; f.hi = 0; });
    readout();
  }

  /* =====================================================================
   * 11b 等宽字族：名字写了不等于取得到
   * ===================================================================== */
  function initMono() {
    var box = $("[data-tmo]");
    if (!box) return;
    var OLD = 'ui-monospace, "SF Mono", Consolas, "Courier New", monospace';
    var cur = getComputedStyle(root).getPropertyValue("--mono").trim() || 'ui-monospace, "SF Mono", Menlo, Consolas, "Courier New", monospace';
    var SAMPLE = "--mono: var(--x); 0O 1lI {}[] const n = 0x1F;";
    function split(st) { return st.split(",").map(function (x) { return x.trim(); }).filter(Boolean); }
    function strip(n) { return n.replace(/^["']|["']$/g, ""); }
    function widthIn(fam) {
      var sp = el("span");
      sp.setAttribute("aria-hidden", "true");
      sp.style.cssText = "position:absolute;left:0;top:0;visibility:hidden;white-space:pre;pointer-events:none;font-size:40px;font-weight:400";
      sp.style.fontFamily = fam;
      sp.textContent = SAMPLE;
      doc.body.appendChild(sp);
      var w = sp.getBoundingClientRect().width;
      doc.body.removeChild(sp);
      return w;
    }
    var REF = null;
    function refs() {
      if (!REF) REF = { menlo: widthIn('"Menlo"'), courier: widthIn('"Courier New"') };
      return REF;
    }
    /* 字宽判：和明写的两款比，差 ≤0.3px 算同一款 */
    function judge(stack) {
      var w = widthIn(stack), r = refs();
      if (Math.abs(w - r.menlo) <= 0.3) return "Menlo";
      if (Math.abs(w - r.courier) <= 0.3) return "Courier New";
      return "别的等宽字";
    }
    var boxes = $$("[data-tmo-box]", box).map(function (fig) {
      var kind = fig.getAttribute("data-tmo-box");
      var names = split(kind === "old" ? OLD : cur);
      return { kind: kind, fig: fig, code: $("[data-tmo-code]", fig), chips: $("[data-tmo-chips]", fig), read: $("[data-tmo-read]", fig), list: names.map(function (n) { return { n: n, on: true }; }) };
    });
    function stackOf(b) {
      var on = b.list.filter(function (x) { return x.on; }).map(function (x) { return x.n; });
      return on.length ? on.join(", ") : "monospace";
    }
    function paint(b, speak) {
      var st = stackOf(b);
      b.code.style.fontFamily = st;
      var lead = "";
      b.chips.textContent = "";
      b.list.forEach(function (x, i) {
        var name = strip(x.n);
        var gen = GENERIC[name];
        var have = gen ? true : probeFont(name).have;
        if (x.on && have && !lead) lead = gen ? "通用回退" + name : name;
        var btn = el("button", "ty-chip " + (have ? "is-have" : "is-miss"), name + (gen ? " · 通用回退" : have ? " · 取得到" : " · 取不到"));
        btn.type = "button";
        btn.setAttribute("aria-pressed", x.on ? "true" : "false");
        btn.setAttribute("data-i", String(i));
        b.chips.appendChild(btn);
      });
      $$(".ty-chip", b.chips).forEach(function (c) { if (c.textContent.indexOf(lead.replace("通用回退", "")) === 0 && lead) c.classList.add("is-lead"); });
      var j = judge(st);
      b.read.textContent = "";
      b.read.appendChild(doc.createTextNode("栈里第一个取得到的：" + (lead || "没有") + " · 量字宽判："));
      b.read.appendChild(el("b", j === "Courier New" ? "ty-warn" : null, j));
      if (speak) announce((b.kind === "old" ? "改前的栈" : "现行的栈") + "：实际是" + j);
    }
    boxes.forEach(function (b) {
      b.chips.addEventListener("click", function (e) {
        var c = e.target.closest ? e.target.closest(".ty-chip") : null;
        if (!c) return;
        var i = +c.getAttribute("data-i");
        b.list[i].on = !b.list[i].on;
        paint(b, true);
        var again = $('.ty-chip[data-i="' + i + '"]', b.chips);
        if (again) again.focus();   /* 重画后焦点留在刚点的那个胶囊上 */
      });
      paint(b, false);
    });
  }

  /* =====================================================================
   * 12 画布断行（照 Ysevan_web/components/notes-globe/line-break.ts 改写成 ES5）
   * ===================================================================== */
  var NO_START = "，。、；：？！）」』》】〉〕〗｝］’”…‥—～·・%,.;:?!)]}";
  var NO_END = "（「『《【〈〔〖｛［‘“([{";
  var MAX_PUSH = 4;
  function units(text) {
    var res = [];
    var src = text.replace(/\s+/g, " ").trim();
    var re = /[A-Za-z0-9]+(?:[._\-/]+[A-Za-z0-9]+)*/y;
    var i = 0;
    while (i < src.length) {
      re.lastIndex = i;
      var m = re.exec(src);
      if (m) { res.push({ text: m[0], space: false }); i += m[0].length; continue; }
      var cp = src.codePointAt(i);
      var ch = String.fromCodePoint(cp);
      res.push({ text: ch, space: ch === " " });
      i += ch.length;
    }
    return res;
  }
  function join(list) { return list.map(function (u) { return u.text; }).join(""); }
  function trimSp(list) {
    var s = 0, e = list.length;
    while (s < e && list[s].space) s++;
    while (e > s && list[e - 1].space) e--;
    return list.slice(s, e);
  }
  function breakRules(text, maxW, measure) {
    var queue = units(text);
    var lines = [];
    var line = [];
    function fits(list) { return measure(join(trimSp(list))) <= maxW; }
    function startsBad(u) { return !!u && NO_START.indexOf(u.text) >= 0; }
    function endsBad(u) { return !!u && NO_END.indexOf(u.text) >= 0; }
    for (var idx = 0; idx < queue.length; idx++) {
      var unit = queue[idx];
      if (!line.length && unit.space) continue;
      if (fits(line.concat([unit]))) { line.push(unit); continue; }
      /* 英文串比一整行还宽：只有这时才劈开，逐字接着排 */
      if (!unit.space && unit.text.length > 1 && !fits([unit])) {
        var split = unit.text.split("").map(function (c) { return { text: c, space: false }; });
        Array.prototype.splice.apply(queue, [idx, 1].concat(split));
        idx -= 1;
        continue;
      }
      if (unit.space) { lines.push(line); line = []; continue; }
      var rest = line.concat([unit]);
      var cut = -1;
      for (var cand = line.length; cand >= Math.max(1, line.length - MAX_PUSH); cand--) {
        var head = trimSp(rest.slice(cand))[0];
        var kept = trimSp(line.slice(0, cand));
        if (!kept.length) break;
        if (startsBad(head) || endsBad(kept[kept.length - 1])) continue;
        cut = cand;
        break;
      }
      if (cut > 0) { lines.push(trimSp(line.slice(0, cut))); line = trimSp(rest.slice(cut)); continue; }
      if (startsBad(unit)) { line.push(unit); lines.push(line); line = []; }
      else { lines.push(line); line = [unit]; }
    }
    if (trimSp(line).length) lines.push(line);
    return lines.map(trimSp).filter(function (l) { return l.length; }).map(join);
  }
  /* 改版前：逐字量，放不下就断 */
  function breakNaive(text, maxW, measure) {
    var src = text.replace(/\s+/g, " ").trim();
    var cs = Array.from(src);
    var lines = [], line = "";
    cs.forEach(function (c) {
      if (!line && c === " ") return;
      if (measure(line + c) <= maxW || !line) line += c;
      else { lines.push(line.replace(/ +$/, "")); line = c === " " ? "" : c; }
    });
    if (line) lines.push(line);
    return lines;
  }
  function initCanvas() {
    var stage = $("[data-tcv]");
    if (!stage) return;
    var entry = stage.closest(".specimen");
    var card = $("[data-tcv-card]", stage);
    var cv = $("[data-tcv-canvas]", stage);
    var handle = $("[data-tcv-handle]", stage);
    var read = $("[data-tcv-read]", entry);
    var ctx = cv.getContext("2d");
    var TEXT = "睡前把node_modules删了重装，127.0.0.1:3000终于能打开了（v1.6.0那版不行）。Windows上util-linux那套命令不一样，得换成PowerShell的写法……明天再看。";
    var mode = "rules";
    var w = 0, full = true;
    /* 英文串所在的区间：判「拆开的英文串」用 */
    var runOf = [];
    var runText = [];
    (function () {
      var re = /[A-Za-z0-9]+(?:[._\-/]+[A-Za-z0-9]+)*/g, m, id = 0;
      while ((m = re.exec(TEXT))) { id++; runText[id] = m[0]; for (var k = m.index; k < m.index + m[0].length; k++) runOf[k] = id; }
    })();
    function avail() { return Math.max(0, stage.clientWidth - parseFloat(getComputedStyle(stage).paddingRight)); }
    function minW() { return Math.min(avail(), 120 * unit()); }
    function tok(name) { return getComputedStyle(card).getPropertyValue(name).trim() || "#000"; }
    var last = null;
    function draw() {
      var u = unit();
      var dpr = window.devicePixelRatio || 1;
      var pad = 16 * u, fs = 15 * u, lh = fs * 1.6, top = 12 * u;
      var fam = bodyFont();
      ctx.font = fs + "px " + fam;
      var measure = function (s) { return ctx.measureText(s).width; };
      var maxW = Math.max(10, w - pad * 2);
      var lines = mode === "rules" ? breakRules(TEXT, maxW, measure) : breakNaive(TEXT, maxW, measure);
      /* 把每行对回原文的位置，数毛病 */
      var pos = 0, spans = [];
      lines.forEach(function (ln) {
        while (pos < TEXT.length && TEXT.charAt(pos) === " ") pos++;
        spans.push([pos, pos + ln.length]);
        pos += ln.length;
      });
      var badStart = [], split = [], badEnd = 0, hard = 0;
      lines.forEach(function (ln, k) {
        if (k > 0 && NO_START.indexOf(ln.charAt(0)) >= 0) badStart.push(k);
        if (k < lines.length - 1 && NO_END.indexOf(ln.charAt(ln.length - 1)) >= 0) badEnd++;
        if (k > 0) {
          var e = spans[k - 1][1], s = spans[k][0];
          if (e === s && runOf[e - 1] && runOf[e - 1] === runOf[s]) {
            /* 串本身比一整行还宽时，规则允许硬断，不算毛病 */
            if (measure(runText[runOf[s]]) > maxW) hard++;
            else split.push(k);
          }
        }
      });
      var h = Math.ceil(top + 18 * u + lines.length * lh + pad * 0.8);
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      cv.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = tok("--raised");
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(0, 0, w, h, 12 * u); else ctx.rect(0, 0, w, h);
      ctx.fill();
      ctx.font = (12 * u) + "px " + fam;
      ctx.fillStyle = tok("--label2");
      ctx.textBaseline = "top";
      ctx.fillText("2026年9月20日 · 示例", pad, top);
      ctx.font = fs + "px " + fam;
      var y0 = top + 18 * u;
      lines.forEach(function (ln, k) {
        var y = y0 + k * lh;
        if (badStart.indexOf(k) >= 0) {
          var cw = measure(ln.charAt(0));
          ctx.fillStyle = tok("--red-tint");
          ctx.fillRect(pad - 2, y + (lh - fs) / 2 - 2, cw + 4, fs + 4);
        }
        if (split.indexOf(k) >= 0) {
          /* 上一行末尾那截和这一行开头那截都画橙线 */
          var run = runOf[spans[k][0]];
          var head = 0;
          while (head < ln.length && runOf[spans[k][0] + head] === run) head++;
          var prev = lines[k - 1], tail = 0;
          while (tail < prev.length && runOf[spans[k - 1][1] - 1 - tail] === run) tail++;
          ctx.fillStyle = tok("--orange");
          ctx.fillRect(pad, y + (lh + fs) / 2 + 1, measure(ln.slice(0, head)), 2);
          ctx.fillRect(pad + measure(prev.slice(0, prev.length - tail)), y - lh + (lh + fs) / 2 + 1, measure(prev.slice(prev.length - tail)), 2);
        }
        ctx.fillStyle = tok("--label");
        ctx.fillText(ln, pad, y + (lh - fs) / 2);
      });
      last = { lines: lines, badStart: badStart.length, split: split.length, badEnd: badEnd };
      cv.setAttribute("aria-label", "画在画布上的随笔卡片，" + lines.length + "行：" + lines.join(" / "));
      read.innerHTML = "";
      read.appendChild(doc.createTextNode("宽" + Math.round(w) + "px · " + lines.length + "行 · 行首标点"));
      read.appendChild(el("b", badStart.length ? "ty-warn" : null, badStart.length + "处"));
      read.appendChild(doc.createTextNode(" · 拆开的英文串"));
      read.appendChild(el("b", split.length ? "ty-warn" : null, split.length + "处"));
      read.appendChild(doc.createTextNode(" · 行尾开括号"));
      read.appendChild(el("b", badEnd ? "ty-warn" : null, badEnd + "处"));
      if (hard) read.appendChild(doc.createTextNode("（另有" + hard + "处是英文串比一整行还宽，规则允许硬断）"));
    }
    var drawSoon = frame(draw);
    function say() {
      if (!last) return;
      announce("宽" + Math.round(w) + "px，" + last.lines.length + "行，行首标点" + last.badStart + "处，拆开的英文串" + last.split + "处");
    }
    var h = makeHandle(handle, {
      get: function () { return w; },
      set: function (v) { w = v; full = Math.abs(v - avail()) < 1; card.style.width = Math.round(v) + "px"; drawSoon(); },
      min: minW, max: avail, step: 10, say: say
    });
    function fit() {
      var a = avail();
      if (!w) w = Math.min(a, 320 * unit());
      else if (full || w > a) w = a;
      card.style.width = Math.round(w) + "px";
      h.sync();
      draw();
    }
    radios($('[role="radiogroup"]', entry), function (b) {
      mode = b.getAttribute("data-tcv-mode");
      draw();
      say();
    });
    window.addEventListener("resize", frame(fit));
    if (window.StarTheme && window.StarTheme.onChange) window.StarTheme.onChange(function () { requestAnimationFrame(draw); });
    fit();
  }

  /* =====================================================================
   * 13 只说事实
   * ===================================================================== */
  function initCopy() {
    var box = $("[data-tcp]");
    if (!box) return;
    var entry = box.closest(".specimen");
    var big = $("[data-tcp-big]", box);
    var fact = $("[data-tcp-fact]", box);
    var badges = $$("[data-tcp-badge]", box);
    var mode = "fact", n = 6, d = 4;
    function render(speak) {
      big.hidden = n === 0;
      big.textContent = String(n);
      big.appendChild(el("small", null, "项完成"));
      var line;
      if (mode === "fact") line = n ? "本周完成" + n + "项 · " + d + "天有进展" : "本周没有完成记录。";
      else line = n ? "太棒了！本周完成了" + n + "项！！继续保持，加油哦！！！" : "别灰心！！下周一定可以的！！！";
      fact.textContent = line;
      badges.forEach(function (b) {
        var k = b.getAttribute("data-tcp-badge");
        var t = k === "body" ? "正文3处" : (k === "path" && mode === "cheer" ? "正文0处" : "");
        b.textContent = t;
        b.classList.toggle("is-wrong", k === "path" && mode === "cheer");
      });
      if (speak) announce(line + (mode === "cheer" ? "；搜索第三条出了「正文0处」" : ""));
    }
    $("[data-tcp-add]", box).addEventListener("click", function () {
      n++;
      d = Math.min(7, Math.max(1, Math.round(n * 0.6)));
      render(true);
    });
    $("[data-tcp-clear]", box).addEventListener("click", function () { n = 0; d = 0; render(true); });
    radios($('[role="radiogroup"]', entry), function (b) {
      mode = b.getAttribute("data-tcp-mode");
      render(true);
    });
    render(false);
  }

  /* =====================================================================
   * 14 空态
   * ===================================================================== */
  function initEmpty() {
    var page = $("[data-tem]");
    if (!page) return;
    var entry = page.closest(".specimen");
    var list = $("[data-tem-list]", page);
    var empty = $("[data-tem-empty]", page);
    var reset = $("[data-tem-reset]", entry);
    var TASKS = ["交季度对账单", "回复网点的材料问题", "整理本周会议纪要"];
    var mode = "line";
    var CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m5.5 12.5 4.2 4.2 8.8-9.4"/></svg>';
    function fill() {
      list.textContent = "";
      TASKS.forEach(function (t) {
        var li = el("li");
        var b = el("button", "tem-check");
        b.type = "button";
        b.setAttribute("aria-pressed", "false");
        b.setAttribute("aria-label", "完成：" + t);
        b.innerHTML = CHECK;
        li.appendChild(b);
        li.appendChild(el("span", "tem-t", t));
        list.appendChild(li);
      });
      empty.hidden = true;
    }
    function renderEmpty() {
      empty.textContent = "";
      empty.className = "tem-empty";
      if (mode === "line") {
        var p = el("p", null, "今天没有要做的事。");
        var a = el("button", "tem-link", "看看本周的日程 →");
        a.type = "button";
        a.setAttribute("data-tem-week", "");
        p.appendChild(a);
        empty.appendChild(p);
      } else {
        /* 反例（示意）：虚线灰框 + 插画 + 两句话，文案由脚本生成 */
        empty.classList.add("is-box");
        empty.insertAdjacentHTML("beforeend", '<svg viewBox="0 0 64 56" aria-hidden="true" focusable="false"><rect x="14" y="8" width="36" height="44" rx="5"/><path d="M24 8V5h16v3"/><path d="M22 22h20M22 30h20M22 38h12"/></svg>');
        empty.appendChild(el("p", "tem-big", "这里空空如也～"));
        empty.appendChild(el("p", null, "今天还没有任务哦！休息一下，或者快去添加新任务，开始高效的一天吧！"));
      }
    }
    function remaining() { return $$("li", list).length; }
    function becameEmpty() {
      renderEmpty();
      empty.hidden = false;
      var go = $("[data-tem-week]", empty);
      if (go) go.focus(); else reset.focus();
      announce(mode === "line" ? "今天没有要做的事。看看本周的日程" : "反例：灰框、插画、两句话");
    }
    list.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest(".tem-check") : null;
      if (!b || b.getAttribute("aria-pressed") === "true") return;
      var li = b.closest("li");
      var name = li.textContent;
      b.setAttribute("aria-pressed", "true");
      var nextLi = li.nextElementSibling || li.previousElementSibling;
      function gone() {
        if (!li.parentNode) return;
        li.parentNode.removeChild(li);
        if (!remaining()) becameEmpty();
        else {
          var nb = nextLi && nextLi.parentNode ? $(".tem-check", nextLi) : $(".tem-check", list);
          if (nb) nb.focus();
          announce("已完成：" + name + "；还剩" + remaining() + "件");
        }
      }
      if (reduced()) { gone(); return; }
      li.classList.add("is-going");
      var timer = setTimeout(gone, 260);
      li.addEventListener("transitionend", function te(ev) {
        if (ev.propertyName !== "opacity") return;
        li.removeEventListener("transitionend", te);
        clearTimeout(timer);
        gone();
      });
    });
    empty.addEventListener("click", function (e) {
      var go = e.target.closest ? e.target.closest("[data-tem-week]") : null;
      if (!go) return;
      fill();
      var first = $(".tem-check", list);
      if (first) first.focus();
      announce("（示例）这里会跳到日程页；清单已放回");
    });
    reset.addEventListener("click", function () {
      fill();
      announce("清单已放回：三件");
    });
    radios($('[role="radiogroup"]', entry), function (b) {
      mode = b.getAttribute("data-tem-mode");
      if (!empty.hidden) renderEmpty();
      announce(mode === "line" ? "现行：一句话加一个动作" : "反例：灰框、插画、两句话（示意）");
    });
    fill();
  }

  /* =====================================================================
   * 15 名字不截断
   * ===================================================================== */
  function initNames() {
    var stage = $("[data-tnm]");
    if (!stage) return;
    var entry = stage.closest(".specimen");
    var panel = $("[data-tnm-panel]", stage);
    var handle = $("[data-tnm-handle]", stage);
    var read = $("[data-tnm-read]", entry);
    var names = $$(".tnm-name", panel);
    var mode = "wrap";
    var w = 0, full = false;
    panel.setAttribute("data-mode", mode);
    function avail() { return Math.max(0, stage.clientWidth - parseFloat(getComputedStyle(stage).paddingRight)); }
    function minW() { return Math.min(avail(), 180 * unit()); }
    function state() {
      var cut = [], wrapped = 0;
      names.forEach(function (n) {
        if (n.scrollWidth > n.clientWidth + 1) cut.push(n.textContent);
        var lh = parseFloat(getComputedStyle(n).lineHeight) || 20;
        if (n.getBoundingClientRect().height > lh * 1.5) wrapped++;
      });
      return { cut: cut, wrapped: wrapped };
    }
    function paint() {
      var s = state();
      read.innerHTML = "";
      read.appendChild(doc.createTextNode("面板宽" + Math.round(w) + "px · "));
      if (s.cut.length) read.appendChild(el("span", "ty-warn", "被截掉" + s.cut.length + "个名字：" + s.cut.join("、")));
      else read.appendChild(el("b", null, "四个名字都完整" + (s.wrapped ? "（" + s.wrapped + "个折了行）" : "")));
    }
    var paintSoon = frame(paint);
    function say() {
      var s = state();
      announce("面板" + Math.round(w) + "px，" + (s.cut.length ? "被截掉" + s.cut.length + "个名字" : "名字都完整" + (s.wrapped ? "，" + s.wrapped + "个折了行" : "")));
    }
    var h = makeHandle(handle, {
      get: function () { return w; },
      set: function (v) { w = v; full = Math.abs(v - avail()) < 1; panel.style.width = Math.round(v) + "px"; paintSoon(); },
      min: minW, max: avail, step: 20, say: say
    });
    function fit() {
      var a = avail();
      if (!w) w = Math.min(a, 520 * unit());
      if (full || w > a) w = a;
      panel.style.width = Math.round(w) + "px";
      h.sync();
      paint();
    }
    radios($('[role="radiogroup"]', entry), function (b) {
      mode = b.getAttribute("data-tnm-mode");
      panel.setAttribute("data-mode", mode);
      paint();
      say();
    });
    window.addEventListener("resize", frame(fit));
    fit();
  }

  [initScale, initWeight, initMeasure, initMin, initKai, initFamily, initProse, initStack, initNofont, initSpace, initTnum, initMono, initCanvas, initCopy, initEmpty, initNames].forEach(function (fn) {
    try { fn(); } catch (err) {
      /* 某一块坏了不拖累别的；控制台留一条，验收会抓到 */
      if (window.console) console.error("[type] " + (fn.name || "init") + "：", err);
    }
  });
})();
