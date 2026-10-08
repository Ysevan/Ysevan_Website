/*
 * 布局与自适应页（layout.html）的活样例。普通 defer 脚本（file:// 下不用 module、不用 fetch）。
 *
 * 每个样例一个 init 函数，互不依赖；某个样例的 DOM 缺了就跳过，不拖累别的。
 * 共同写法：
 *  - 「缩小的视口」（.l-vpbox > .l-vp）：画布按目标视口的宽高排版（px），fitVp 算出缩放比 k，整块 transform: scale(k)
 *    缩进框里，框高跟着设。框宽变了（ResizeObserver）重算一次。画布里量东西：尺寸用 offsetWidth / offsetHeight
 *    （布局值，不受 transform 影响），位置用 getBoundingClientRect 再除以 k。
 *  - 读数都是当场量出来的（计算样式、盒子尺寸、scrollWidth），只有写明「按公式实算」的才是算的。
 *  - 不起任何自己跑的动画：所有变化都是点、拖、滚动直接驱动，所以减弱动效下天然直接到终点。
 *  - 单选组（role=radiogroup）的方向键由 star.js 统一处理（移动并 click），这里只接 click。
 *  - 回车 / Esc 处理的第一行先判输入法合成态（isComposing 或 keyCode 229）。
 *  - 播报走外壳 StarShell.announce（全站一个 polite 区）；滑块连续拖动只在停手后播一次。
 *  - 不写外壳保留属性（data-mode-set / data-accent-set …），不碰全站主题与 localStorage。
 *    「大屏」那条嵌本站自己的色彩页：点了才建，「收起」就拆掉。sandbox 给 allow-scripts + allow-same-origin——
 *    只给 allow-scripts 时被嵌页面是不透明源，file:// 下连它自己的 star.css / boot.js 都不许加载（实测「Not allowed to
 *    load local resource」，屋主双击打开时框里是一页没样式的字）。这是自家页面，同源可以（CLAUDE.md「测试」那条）。
 *    外壳只在用户动了外观控件、或滚动停下时才写存储；框是 inert（点不进、滚不动、Tab 不进去），所以它只读不写：
 *    跟着屋主现在的外观走，不会改外观设置，也不会改「接着看」记录。
 */
(function () {
  "use strict";

  var doc = document;
  var win = window;

  function $(sel, root) { return (root || doc).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function r1(n) { return Math.round(n * 10) / 10; }
  function r2(n) { return Math.round(n * 100) / 100; }
  function px(n) { return r1(n) + "px"; }
  function composing(e) { return !!(e && (e.isComposing || e.keyCode === 229)); }
  function announce(text) {
    if (win.StarShell && typeof win.StarShell.announce === "function") win.StarShell.announce(text);
  }
  var sayTimer = 0;
  function sayLater(text) {
    clearTimeout(sayTimer);
    sayTimer = setTimeout(function () { announce(text); }, 600);
  }
  /* rAF 合并：同一帧里连续触发只跑一次 */
  function batched(fn) {
    var queued = false;
    return function () {
      if (queued) return;
      queued = true;
      win.requestAnimationFrame(function () { queued = false; fn(); });
    };
  }

  /* 单选组：只接 click（键盘由 star.js 转成 click） */
  function radios(group, onPick) {
    if (!group) return;
    group.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest('[role="radio"]') : null;
      if (!b || !group.contains(b)) return;
      selectRadio(group, b);
      onPick(b);
    });
  }
  function selectRadio(group, b) {
    $$('[role="radio"]', group).forEach(function (r) {
      var on = r === b;
      r.setAttribute("aria-checked", on ? "true" : "false");
      r.setAttribute("tabindex", on ? "0" : "-1");
    });
  }
  function checkedValue(group, attr) {
    var b = group ? $('[role="radio"][aria-checked="true"]', group) : null;
    return b ? b.getAttribute(attr) : null;
  }
  function setPressed(btn, on) { btn.setAttribute("aria-pressed", on ? "true" : "false"); }

  /* 滑块：值写到旁边的读数里，并给读屏一个带单位的 aria-valuetext */
  function bindRange(input, out, unit, onInput) {
    if (!input) return;
    function show() {
      var v = input.value;
      if (out) out.textContent = v + (unit || "");
      input.setAttribute("aria-valuetext", v + (unit === "px" || !unit ? "像素" : unit));
    }
    input.addEventListener("input", function () { show(); onInput(+input.value); });
    show();
  }

  /* ---------- 缩小的视口 ---------- */
  /* opts: maxH 框最高多少（页面 px）；kFixed 固定缩放比；center 窄了就居中 */
  function fitVp(box, vp, w, h, opts) {
    opts = opts || {};
    vp.style.width = w + "px";
    vp.style.height = h == null ? "" : h + "px";
    var bw = box.clientWidth;
    var hh = h == null ? vp.offsetHeight : h;
    var k = opts.kFixed != null ? opts.kFixed : Math.min(opts.maxK || 1, bw / w);
    if (opts.maxH) k = Math.min(k, opts.maxH / hh);
    if (!(k > 0)) k = 1;
    vp.style.transform = "scale(" + k + ")";
    vp.style.left = opts.center ? Math.max(0, (bw - w * k) / 2) + "px" : "0px";
    var border = box.offsetHeight - box.clientHeight;
    /* boxH：框高钉死（内容高随宽度变的画布，拖的时候框不跟着一伸一缩，下面整页就不用每帧重排） */
    box.style.height = Math.ceil((opts.boxH != null ? opts.boxH : hh * k) + border) + "px";
    vp.__k = k;
    return k;
  }
  /* 框宽变了才重排（框高是我们自己设的，变了不用管） */
  function onBoxWidth(box, fn) {
    if (typeof win.ResizeObserver !== "function") { win.addEventListener("resize", batched(fn)); return; }
    var last = -1;
    var ro = new win.ResizeObserver(function () {
      var w = box.clientWidth;
      if (Math.abs(w - last) < 0.5) return;
      last = w;
      fn();
    });
    ro.observe(box);
  }
  /* 在画布里量：相对画布左上角、按画布自己的 px */
  function rectIn(el, vp) {
    var k = vp.__k || 1;
    var a = el.getBoundingClientRect();
    var b = vp.getBoundingClientRect();
    return { left: (a.left - b.left) / k, top: (a.top - b.top) / k, right: (a.right - b.left) / k, bottom: (a.bottom - b.top) / k, width: a.width / k, height: a.height / k };
  }
  /* 页面自己的 --scale（量一个 100×--u 的探针；外壳的公式与兜底都算进去） */
  var scaleProbe = null;
  function pageScale() {
    if (!scaleProbe) {
      scaleProbe = doc.createElement("i");
      scaleProbe.setAttribute("aria-hidden", "true");
      scaleProbe.style.cssText = "position:absolute;left:0;top:0;height:0;visibility:hidden;pointer-events:none;width:calc(100 * var(--u))";
      var main = $("#main") || doc.body;
      main.appendChild(scaleProbe);
    }
    return (scaleProbe.getBoundingClientRect().width || 100) / 100;
  }
  function kv(dl, rows) {
    dl.innerHTML = rows.map(function (r) {
      return "<div><dt>" + r[0] + "</dt><dd>" + r[1] + (r[2] ? "<small>" + r[2] + "</small>" : "") + "</dd></div>";
    }).join("");
  }

  /* ---------- 仿本站侧栏（骨架、扁视口共用） ---------- */
  var DOTS = [["#007AFF", "#5AC8FA"], ["#34C759", "#A8E063"], ["#5856D6", "#BF5AF2"], ["#FF9500", "#FFD60A"], ["#FF2D55", "#FF9AA2"], ["#30B0C7", "#64D2FF"]];
  var NAV_GROUPS = [["开始", ["总览"]], ["做法", ["色彩", "排版", "布局与自适应", "材质", "交互", "动画", "3D与性能"]], ["避坑", ["否掉的方向", "做网站的方法"]], ["收藏", ["收藏"]]];
  function mockShellHtml(withMain) {
    var nav = NAV_GROUPS.map(function (g) {
      return '<p class="l-mg">' + g[0] + "</p>" + g[1].map(function (t) {
        return '<span class="l-mit' + (t === "布局与自适应" ? " is-on" : "") + '">' + t + "</span>";
      }).join("");
    }).join("");
    var dots = DOTS.map(function (c) { return '<i style="background:linear-gradient(135deg,' + c[0] + "," + c[1] + ')"></i>'; }).join("");
    var side = '<aside class="l-mside" data-m-side>' +
      '<div class="l-mbrand"><i class="l-mlogo"></i><span><b>设计合集</b><small>屋主的审美与做法</small></span></div>' +
      '<div class="l-msearch"><span>搜索条目、#标签</span></div>' +
      '<nav class="l-mnav" data-m-nav>' + nav + "</nav>" +
      '<div class="l-mfoot" data-m-foot>' +
        '<div class="l-mseg"><i class="is-on">浅色</i><i>深色</i><i>自动</i></div>' +
        '<div class="l-mdots">' + dots + "</div>" +
        '<div class="l-mrow"><span>背景模糊</span><div class="l-mseg l-mseg-sm"><i class="is-on">自动</i><i>开</i><i>关</i></div></div>' +
        '<div class="l-mver"><span>恢复默认</span><span>v' + (win.STAR_NAV && win.STAR_NAV.version || "0.4.0") + "</span></div>" +   /* 版本号跟外壳 nav.js 的 VERSION 走，免得发版后复制品还写旧号 */
      "</div></aside>";
    var main = '<div class="l-mmain"><div class="l-mhead"><b>布局与自适应</b><p>工具类是一条玻璃侧栏加内容区，按1440等比放大、900收顶栏、600换底部tab bar。</p></div>' +
      (withMain ? '<div class="l-mcards"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><ul class="l-mlist"><li></li><li></li><li></li><li></li></ul>' : "") +
      "</div>";
    return '<div class="l-m" data-m>' + side + main + "</div>";
  }

  /* ================================================================
   * 1. 骨架：视口高 + 三种写法
   * ================================================================ */
  function initSkeleton() {
    var root = $('[data-demo="skeleton"]');
    if (!root) return;
    var box = $("[data-sk-box]", root);
    var vp = $("[data-sk-vp]", root);
    var range = $("[data-sk-h]", root);
    var read = $("[data-sk-read]", root);
    var group = $('[role="radiogroup"]', root);
    vp.innerHTML = mockShellHtml(true);
    vp.setAttribute("aria-hidden", "true");
    var side = $("[data-m-side]", vp);
    var nav = $("[data-m-nav]", vp);
    var foot = $("[data-m-foot]", vp);
    var mode = "nav";
    vp.setAttribute("data-sk", mode);

    function measure() {
      var h = +range.value;
      side.scrollTop = 0;
      nav.scrollTop = 0;
      var s = rectIn(side, vp);
      var f = rectIn(foot, vp);
      var below = Math.max(0, f.bottom - Math.min(s.bottom, h));
      var navOver = Math.max(0, nav.scrollHeight - nav.clientHeight);
      var sideOver = Math.max(0, side.scrollHeight - side.clientHeight);
      var text;
      if (mode === "nav") {
        text = below < 0.5
          ? "外观控件看得见，钉在侧栏底部。" + (navOver > 0 ? "导航在自己那一段里滚，要滚" + Math.round(navOver) + "px。" : "导航这个高度不用滚。")
          : "外观控件被挤出" + Math.round(below) + "px（导航已经压到0了，侧栏整条兜底能滚）。";
      } else if (mode === "clip") {
        text = below > 0.5
          ? "外观控件被裁掉" + Math.round(below) + "px，侧栏没有滚动条——看不出这里少了东西，只会以为「没有换色的地方」。"
          : "这个高度还装得下，再压矮一点看。";
      } else {
        text = sideOver > 0.5
          ? "外观控件在视口下方" + Math.round(below) + "px，要把整条侧栏滚到底才看得见，滚回去又看不见导航顶上。"
          : "这个高度还装得下，再压矮一点看。";
      }
      read.textContent = "视口1440×" + h + "：" + text;
      return text;
    }
    function layout() {
      fitVp(box, vp, 1440, +range.value);
      measure();
    }
    bindRange(range, $("[data-sk-hout]", root), "px", function () { layout(); sayLater(read.textContent); });
    radios(group, function (b) {
      mode = b.getAttribute("data-sk-mode");
      vp.setAttribute("data-sk", mode);
      announce(b.textContent + "：" + measure());
    });
    onBoxWidth(box, layout);
    layout();
  }

  /* ================================================================
   * 迷你外壳（clamp、断点共用）：容器查询 + cqw 令牌，探针量实际值
   * ================================================================ */
  function miniShellHtml() {
    var items = ["总览", "色彩", "排版", "布局", "交互", "收藏"];
    var nav = items.map(function (t, i) { return "<span" + (i === 3 ? ' class="is-on"' : "") + ">" + t + "</span>"; }).join("");
    var tab = ["总览", "色彩", "交互", "收藏", "更多"].map(function (t, i) { return "<span" + (i === 0 ? ' class="is-on"' : "") + ">" + t + "</span>"; }).join("");
    var probes = ["title", "body", "gap", "pad", "side", "pagex"].map(function (p) { return '<i class="l-ms-probe" data-p="' + p + '"></i>'; }).join("");
    return '<div class="l-ms" data-ms>' + probes +
      '<aside class="l-ms-side" data-ms-side><span class="l-ms-brand"><i></i>设计合集</span><nav class="l-ms-nav">' + nav + '</nav><span class="l-ms-more">更多</span><div class="l-ms-foot"><i></i><i></i></div></aside>' +
      '<div class="l-ms-main"><div class="l-ms-head"><b class="l-ms-title">布局与自适应</b><span class="l-ms-sub">骨架、clamp、大屏等比放大、断点、dvh（示例页）</span></div>' +
      '<div class="l-ms-cards"><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="l-ms-list"><i></i><i></i><i></i></div></div>' +
      '<nav class="l-ms-tab" data-ms-tab>' + tab + "</nav></div>";
  }
  function shellForm(vp) {
    var tab = $("[data-ms-tab]", vp);
    var side = $("[data-ms-side]", vp);
    if (tab && getComputedStyle(tab).display !== "none") return "tab";
    if (side && getComputedStyle(side).flexDirection === "row") return "top";
    return "side";
  }
  var FORM_NAME = { side: "左侧栏", top: "顶栏（品牌＋横排导航＋「更多」）", tab: "底部tab bar（顶栏只剩品牌）" };

  /* ================================================================
   * 2. clamp：视口宽 + ⌘+ 缩放，量六个令牌
   * ================================================================ */
  function initClamp() {
    var root = $('[data-demo="clamp"]');
    if (!root) return;
    var box = $("[data-cl-box]", root);
    var vp = $("[data-cl-vp]", root);
    var range = $("[data-cl-w]", root);
    var read = $("[data-cl-read]", root);
    var zooms = $$("[data-cl-zoom]", root);
    vp.innerHTML = miniShellHtml();
    vp.setAttribute("aria-hidden", "true");
    var ms = $("[data-ms]", vp);
    var SPEC = {
      title: [26, 34.16], body: [14, 15], gap: [10, 14.4], pad: [18, 28], side: [200, 244.8], pagex: [16, 43.2]
    };
    var NAME = { title: "标题", body: "正文", gap: "间距", pad: "卡片内边距", side: "侧栏", pagex: "页边距" };

    function update() {
      var w = +range.value;
      fitVp(box, vp, w, 520, { maxH: 420 * pageScale() });
      var vals = {};
      Object.keys(SPEC).forEach(function (key) {
        var probe = $('.l-ms-probe[data-p="' + key + '"]', vp);
        var v = parseFloat(getComputedStyle(probe).width) || 0;
        vals[key] = v;
        var row = $('[data-cl-t="' + key + '"]', root);
        if (!row) return;
        $("[data-v]", row).textContent = r2(v) + "px";
        var lo = SPEC[key][0], hi = SPEC[key][1];
        $("[data-bar]", row).style.width = clamp((v - lo) / (hi - lo), 0, 1) * 100 + "%";
      });
      var zoom = null;
      zooms.forEach(function (b) {
        var z = +b.getAttribute("data-cl-zoom");
        var hit = Math.round(1440 / z) === w;
        setPressed(b, hit);
        if (hit) zoom = z;
      });
      var over = Math.max(0, Math.round(ms.scrollWidth - ms.clientWidth));
      var form = shellForm(vp);
      read.textContent = "视口" + w + "px" + (zoom ? "（1440的窗口按⌘+放大到" + Math.round(zoom * 100) + "%）" : "") +
        "：标题" + r2(vals.title) + "px、正文" + r2(vals.body) + "px、侧栏" + (form === "side" ? r2(vals.side) + "px" : "收成了顶栏") +
        "；横向溢出" + over + "px。";
      return read.textContent;
    }
    bindRange(range, $("[data-cl-wout]", root), "px", function () { sayLater(update()); });
    zooms.forEach(function (b) {
      b.addEventListener("click", function () {
        var z = +b.getAttribute("data-cl-zoom");
        range.value = String(clamp(Math.round(1440 / z), +range.min, +range.max));
        range.dispatchEvent(new Event("input"));
        announce(update());
      });
    });
    onBoxWidth(box, update);
    update();
  }

  /* ================================================================
   * 3. 大屏：设备读数（按外壳公式实算）+ 曲线 + 嵌本站页面
   * ================================================================ */
  var DEVICES = {
    mac: { w: 1440, h: 900, name: "Mac 1440×900" },
    desk: { w: 2040, h: 1019, name: "台式2040×1019" },
    laptop: { w: 2552, h: 1274, name: "笔记本2552×1274" },
    phone: { w: 417, h: 750, name: "手机417×750" }
  };
  function scaleOf(w) { return clamp(w / 1440, 1, 1.45); }
  function linOf(w) { return clamp(1 + (w - 1440) * 0.000401786, 1, 1.45); }
  function initScale() {
    var root = $('[data-demo="scale"]');
    if (!root) return;
    var group = $('[role="radiogroup"]', root);
    var svg = $("[data-sc-chart]", root);
    var cap = $("[data-sc-cap]", root);
    var dl = $("[data-sc-read]", root);
    var box = $("[data-sc-box]", root);
    var loadBtn = $("[data-sc-load]", root);
    var unloadBtn = $("[data-sc-unload]", root);
    var state = $("[data-sc-state]", root);
    var frame = null;
    var dev = checkedValue(group, "data-sc-dev") || "desk";

    /* 曲线：x 1440–2600，y 1.0–1.5 */
    var X0 = 56, X1 = 584, Y0 = 196, Y1 = 26;
    function x(w) { return X0 + (w - 1440) / (2600 - 1440) * (X1 - X0); }
    function y(v) { return Y0 - (v - 1) / 0.5 * (Y0 - Y1); }
    var NS = "http://www.w3.org/2000/svg";
    function el(name, attrs, text) {
      var n = doc.createElementNS(NS, name);
      Object.keys(attrs).forEach(function (a) { n.setAttribute(a, attrs[a]); });
      if (text != null) n.textContent = text;
      svg.appendChild(n);
      return n;
    }
    [1, 1.1, 1.2, 1.3, 1.4, 1.5].forEach(function (v) {
      el("line", { x1: X0, x2: X1, y1: y(v), y2: y(v), "class": "ax" });
      el("text", { x: X0 - 8, y: y(v) + 4, "text-anchor": "end", "class": "tx" }, v.toFixed(1));
    });
    [1440, 1800, 2088, 2400].forEach(function (w) {
      el("text", { x: x(w), y: Y0 + 20, "text-anchor": "middle", "class": "tx" }, String(w));
    });
    el("line", { x1: x(2088), x2: x(2088), y1: Y1, y2: Y0, "class": "guide" });
    el("polyline", { points: [x(1440), y(1), x(2088), y(1.45), x(2600), y(1.45)].join(" "), "class": "eq" });
    el("polyline", { points: [x(1440), y(1), x(2560), y(1.45), x(2600), y(1.45)].join(" "), "class": "lin" });
    el("text", { x: x(2140), y: y(1.45) - 8, "class": "lb lb-eq" }, "等比：视口÷1440");
    el("text", { x: x(2200), y: y(1.32) + 14, "class": "lb lb-lin" }, "线性爬坡（被否）");
    var g1 = el("line", { "class": "guide" });
    var m2 = el("circle", { r: 5, "class": "mk2" });
    var m1 = el("circle", { r: 6, "class": "mk" });

    function render() {
      var d = DEVICES[dev];
      var w = d.w;
      var s = scaleOf(w);
      var wide = w > 900;
      var title = clamp(0.014 * w + 14, 26, 34.16) * s;
      var body = clamp(0.0015 * w + 12.84, 14, 15) * s;
      var side = wide ? clamp(0.17 * w, 200, 244.8) * s : 0;
      var pagex = clamp(0.03 * w, 16, 43.2) * s;
      var fill = w - side - 2 * pagex;
      var strict = (1440 - 244.8 - 86.4) * s;
      kv(dl, [
        ["<code>--scale</code>", s.toFixed(3) + (s >= 1.45 ? "（封顶）" : w <= 1440 ? "（≤1440恒为1）" : ""), "视口÷1440，夹在1与1.45之间"],
        ["侧栏宽", wide ? px(side) : "—", wide ? "1440处244.8×scale" : "≤900收成顶栏"],
        ["标题字号", px(title), "1440处34.16×scale"],
        ["正文字号", px(body), "1440处15×scale"],
        ["内容宽：填满", wide ? px(fill) : px(w - 2 * pagex), "视口−侧栏−左右页边距"],
        ["内容宽：严格等比", wide && w >= 1440 ? px(strict) : "—", wide && w >= 1440 ? (Math.abs(fill - strict) < 1 ? "和填满一样：没到封顶，两者是同一件事" : "填满多" + Math.round(fill - strict) + "px，只给卡片与列表轨道") : ""]
      ]);
      var ww = clamp(w, 1440, 2600);
      m1.setAttribute("cx", x(ww)); m1.setAttribute("cy", y(scaleOf(ww)));
      m2.setAttribute("cx", x(ww)); m2.setAttribute("cy", y(linOf(ww)));
      g1.setAttribute("x1", x(ww)); g1.setAttribute("x2", x(ww)); g1.setAttribute("y1", Y1); g1.setAttribute("y2", Y0);
      var e = scaleOf(ww), l = linOf(ww);
      cap.textContent = w <= 1440
        ? d.name + "：≤1440两种写法都是1，一个数不变。"
        : d.name + "：等比" + e.toFixed(3) + "，线性爬坡" + l.toFixed(3) + ((e / l - 1) >= 0.005 ? "，等比要大" + Math.round((e / l - 1) * 100) + "%" : "——这里两种写法几乎一样，差别在1440到2560的中段") + "。";
      if (frame) fitFrame();
      return cap.textContent;
    }
    function fitFrame() {
      var d = DEVICES[dev];
      frame.style.width = d.w + "px";
      frame.style.height = d.h + "px";
      box.hidden = false;
      var bw = box.clientWidth;
      var maxH = 520 * pageScale();
      var k = Math.min(1, bw / d.w, maxH / d.h);
      frame.style.transform = "scale(" + k + ")";
      frame.style.left = Math.max(0, (bw - d.w * k) / 2) + "px";
      var border = box.offsetHeight - box.clientHeight;
      box.style.height = Math.ceil(d.h * k + border) + "px";
      frame.title = "本站色彩页，按" + d.name + "的视口（只看，不能点）";
      state.textContent = "框里是" + d.name + "的视口，缩到" + Math.round(k * 100) + "%显示；--scale " + scaleOf(d.w).toFixed(3) + "。";
    }
    radios(group, function (b) {
      dev = b.getAttribute("data-sc-dev");
      announce(render());
    });
    loadBtn.addEventListener("click", function () {
      if (frame) return;
      frame = doc.createElement("iframe");
      frame.setAttribute("sandbox", "allow-scripts allow-same-origin");
      frame.setAttribute("loading", "eager");
      frame.setAttribute("tabindex", "-1");
      frame.setAttribute("aria-hidden", "true");
      frame.src = "color.html";
      box.inert = true;
      box.setAttribute("aria-hidden", "true");
      box.appendChild(frame);
      loadBtn.hidden = true;
      unloadBtn.hidden = false;
      fitFrame();
      frame.addEventListener("load", function () { announce("已装进来：" + DEVICES[dev].name); });
      unloadBtn.focus();
    });
    unloadBtn.addEventListener("click", function () {
      if (!frame) return;
      frame.remove();
      frame = null;
      box.hidden = true;
      box.style.height = "";
      state.textContent = "";
      unloadBtn.hidden = true;
      loadBtn.hidden = false;
      loadBtn.focus();
      announce("已收起");
    });
    onBoxWidth(root, function () { if (frame) fitFrame(); });
    render();
  }

  /* ================================================================
   * 4. 兜底探针：读两块真 @supports 的结果
   * ================================================================ */
  function initProbe() {
    var root = $('[data-demo="probe"]');
    if (!root) return;
    var range = $("[data-pb-w]", root);
    var read = $("[data-pb-read]", root);
    var hits = {};
    $$(".l-pb-card", root).forEach(function (card) {
      var kind = card.getAttribute("data-pb");
      var hit = getComputedStyle(card).getPropertyValue("--l-pb").replace(/["'\s]/g, "") === "hit";
      hits[kind] = hit;
      card.classList.toggle("is-hit", hit);
      var sup = false;
      try { sup = !!(win.CSS && CSS.supports(kind, "tan(atan2(1px, 1px))")); } catch (e) { sup = false; }
      $("[data-pb-sup]", card).textContent = "CSS.supports('" + kind + "', 'tan(atan2(1px, 1px))') = " + sup;
      var msg;
      if (kind === "width") msg = hit ? "命中：在这台浏览器上它也判「不支持」，台阶值会盖住公式" : "没命中（这台浏览器很特别，记下来）";
      else msg = hit ? "命中：这台浏览器真的不认三角函数，走台阶" : "没命中：这台浏览器认三角函数，公式照常";
      $("[data-pb-hit]", card).textContent = msg;
    });
    function step(w) { return w >= 2200 ? 1.45 : w >= 2000 ? 1.39 : w >= 1800 ? 1.25 : w >= 1600 ? 1.11 : 1; }
    function update() {
      var w = +range.value;
      var f = scaleOf(w), s = step(w);
      read.textContent = "视口" + w + "：公式给" + f.toFixed(3) + "，台阶给" + s.toFixed(2) +
        (Math.abs(f - s) > 0.0005 ? "（差" + Math.round(Math.abs(f - s) / f * 1000) / 10 + "%）" : "（一样）") +
        "。" + (hits.width ? "要是探针写成 width:，这台浏览器拿到的就是台阶" + s.toFixed(2) + "。" : "");
      return read.textContent;
    }
    bindRange(range, $("[data-pb-wout]", root), "px", function () { sayLater(update()); });
    update();
  }

  /* ================================================================
   * 5. 断点：拖右边沿 / 滑块 / 预设
   * ================================================================ */
  function initBreakpoints() {
    var root = $('[data-demo="breakpoints"]');
    if (!root) return;
    var box = $("[data-bp-box]", root);
    var vp = $("[data-bp-vp]", root);
    var range = $("[data-bp-w]", root);
    var read = $("[data-bp-read]", root);
    var handle = $("[data-bp-handle]", root);
    var presets = $$("[data-bp-preset]", root);
    vp.innerHTML = miniShellHtml();
    vp.setAttribute("aria-hidden", "true");
    var lastForm = "";
    var kFixed = 1;

    function layout() {
      var w = +range.value;
      var bw = box.parentNode.clientWidth;
      /* 框够宽时按「1440 铺满框」的固定比例画，拖边沿就是拖视口宽；框窄（手机）时按当前宽铺满框 */
      var wideBox = bw >= 560;
      kFixed = wideBox ? bw / 1440 : Math.min(1, bw / w);
      box.style.width = wideBox ? Math.ceil(w * kFixed + 2) + "px" : "";
      fitVp(box, vp, w, 560, { kFixed: kFixed });
      handle.hidden = !wideBox;
      handle.style.left = (box.offsetWidth) + "px";
      presets.forEach(function (b) { setPressed(b, +b.getAttribute("data-bp-preset") === w); });
      var form = shellForm(vp);
      read.textContent = "视口" + w + "px：" + FORM_NAME[form] + "。" + (form === "side" ? "宽过900。" : form === "top" ? "601–900这一档。" : "≤600这一档。");
      if (form !== lastForm && lastForm) announce("变成" + FORM_NAME[form]);
      lastForm = form;
    }
    bindRange(range, $("[data-bp-wout]", root), "px", layout);
    presets.forEach(function (b) {
      b.addEventListener("click", function () {
        range.value = b.getAttribute("data-bp-preset");
        range.dispatchEvent(new Event("input"));
      });
    });
    /* 拖右边沿：指针捕获，鼠标与触摸同一套 */
    var drag = null;
    handle.addEventListener("pointerdown", function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      e.preventDefault();
      drag = { id: e.pointerId };
      handle.classList.add("is-drag");
      try { handle.setPointerCapture(e.pointerId); } catch (err) { /* 捕获不了也能拖 */ }
    });
    handle.addEventListener("pointermove", function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var left = box.getBoundingClientRect().left;
      var w = Math.round(clamp((e.clientX - left) / kFixed, +range.min, +range.max));
      if (String(w) !== range.value) {
        range.value = String(w);
        range.dispatchEvent(new Event("input"));
      }
    });
    function end(e) {
      if (!drag || e.pointerId !== drag.id) return;
      drag = null;
      handle.classList.remove("is-drag");
      announce(read.textContent);
    }
    handle.addEventListener("pointerup", end);
    handle.addEventListener("pointercancel", end);
    onBoxWidth(box.parentNode, layout);
    layout();
  }

  /* ================================================================
   * 6. 手机档：「更多」面板两种写法、顶栏要不要
   * ================================================================ */
  function initPhone() {
    var root = $('[data-demo="phone"]');
    if (!root) return;
    var box = $("[data-ph-box]", root);
    var vp = $("[data-ph-vp]", root);
    var dl = $("[data-ph-read]", root);
    var sheet = $("[data-ph-sheet]", root);
    var scrim = $("[data-ph-scrim]", root);
    var more = $("[data-ph-more]", root);
    var groups = $$('[role="radiogroup"]', root);
    vp.setAttribute("data-panel", "maxh");
    vp.setAttribute("data-top", "none");
    sheet.id = "l-ph-sheet";
    more.setAttribute("aria-controls", sheet.id);

    function measure() {
      var tab = $(".l-ph-tab", vp);
      var tabTop = tab.offsetTop;
      var shown = 0;
      var lastName = "";
      $$(".l-ph-page > *", vp).forEach(function (n) {
        var r = rectIn(n, vp);
        if (r.bottom <= tabTop + 0.5) {
          shown++;
          lastName = n.querySelector("b") ? n.querySelector("b").textContent : n.textContent.slice(0, 6);
        }
      });
      var rows = [
        ["顶栏", vp.getAttribute("data-top") === "keep" ? "留着一条56px" : "没有", vp.getAttribute("data-top") === "keep" ? "改前（示意）" : "品牌图标在大标题前"],
        ["首屏露出", shown + "块", "tab bar上面完整看得见的，到「" + lastName + "」为止"]
      ];
      if (!sheet.hidden) {
        var row = $("span", sheet);
        var sr = rectIn(sheet, vp);
        rows.push(["面板高", Math.round(sheet.offsetHeight) + "px", vp.getAttribute("data-panel") === "tb" ? "定高：上沿顶到屏幕顶下8px" : "内容多高就多高，放不下自己滚"]);
        rows.push(["每一行", Math.round(row.offsetHeight) + "px", vp.getAttribute("data-panel") === "tb" ? "被网格拉高了（该是44）" : "44px触控高"]);
        rows.push(["上沿离屏幕顶", Math.round(sr.top) + "px", ""]);
      } else {
        rows.push(["「更多」面板", "关着", "点tab bar上的「更多」"]);
      }
      kv(dl, rows);
    }
    function layout() { fitVp(box, vp, 417, 750); measure(); }
    function openSheet(on) {
      sheet.hidden = !on;
      scrim.hidden = !on;
      more.setAttribute("aria-expanded", on ? "true" : "false");
      measure();
      if (on) announce("「更多」面板开了：高" + Math.round(sheet.offsetHeight) + "像素，每行" + Math.round($("span", sheet).offsetHeight) + "像素");
    }
    more.addEventListener("click", function () { openSheet(sheet.hidden); });
    scrim.addEventListener("click", function () { openSheet(false); more.focus(); });
    root.addEventListener("keydown", function (e) {
      if (composing(e)) return;
      if (e.key === "Escape" && !sheet.hidden) {
        e.preventDefault();
        e.stopPropagation();
        openSheet(false);
        more.focus();
      }
    });
    radios(groups[0], function (b) {
      vp.setAttribute("data-panel", b.getAttribute("data-ph-panel"));
      if (sheet.hidden) openSheet(true); else measure();
      announce(b.textContent + "：面板高" + Math.round(sheet.offsetHeight) + "像素，每行" + Math.round($("span", sheet).offsetHeight) + "像素");
    });
    radios(groups[1], function (b) {
      vp.setAttribute("data-top", b.getAttribute("data-ph-top"));
      measure();
      announce(b.textContent);
    });
    onBoxWidth(box, layout);
    layout();
  }

  /* ================================================================
   * 7. plan 手机顶栏：两行 + 点了才展开的搜索
   * ================================================================ */
  function initTopbar() {
    var root = $('[data-demo="topbar"]');
    if (!root) return;
    var box = $("[data-tb-box]", root);
    var vp = $("[data-tb-vp]", root);
    var dl = $("[data-tb-read]", root);
    var log = $("[data-tb-log]", root);
    var btn = $("[data-tb-search]", root);
    var row = $("[data-tb-row]", root);
    var input = $("[data-tb-input]", root);
    var cancel = $("[data-tb-cancel]", root);
    var bar = $("[data-tb-bar]", root);
    var groups = $$('[role="radiogroup"]', root);

    function measure() {
      var first = $("[data-tb-tasks] li", vp);
      var y = Math.round(rectIn(first, vp).top);
      var mode = vp.getAttribute("data-mode-tb");
      kv(dl, [
        ["顶栏高", Math.round(bar.offsetHeight) + "px", mode === "before" ? "改前三行（plan实测167）" : row.hidden ? "两行（plan实测90）" : "搜索展开（plan实测134）"],
        ["第一条任务", "y = " + y + "px", "plan实测412 → 334"],
        ["焦点环", vp.getAttribute("data-ring") === "two" ? "两圈（修前）" : "一圈", "点进搜索框看"]
      ]);
    }
    function layout() { fitVp(box, vp, 417, 750); measure(); }
    function openSearch() {
      row.hidden = false;
      btn.setAttribute("aria-expanded", "true");
      measure();
      input.focus();
      announce("搜索框展开了，顶栏高" + Math.round(bar.offsetHeight) + "像素");
    }
    function closeSearch(text) {
      input.value = "";
      row.hidden = true;
      btn.setAttribute("aria-expanded", "false");
      measure();
      btn.focus();
      if (text) { log.textContent = text; announce(text); }
    }
    btn.addEventListener("click", function () {
      if (row.hidden) openSearch(); else closeSearch("收起了，没搜");
    });
    cancel.addEventListener("click", function () { closeSearch("取消：收起了，没搜"); });
    input.addEventListener("keydown", function (e) {
      if (composing(e)) return;       /* 输入法选词的回车不算提交 */
      if (e.key === "Enter") {
        e.preventDefault();
        var v = input.value.trim();
        closeSearch(v ? "搜索「" + v + "」（示例，不跳转），搜完收起" : "空的，没搜，收起了");
      } else if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        closeSearch("Esc：收起了，没搜");
      }
    });
    radios(groups[0], function (b) {
      var m = b.getAttribute("data-tb-mode");
      vp.setAttribute("data-mode-tb", m);
      if (m === "before" && !row.hidden) { row.hidden = true; btn.setAttribute("aria-expanded", "false"); }
      measure();
      announce(b.textContent + "：顶栏高" + Math.round(bar.offsetHeight) + "像素");
    });
    radios(groups[1], function (b) {
      vp.setAttribute("data-ring", b.getAttribute("data-tb-ring"));
      measure();
      announce(b.textContent);
    });
    onBoxWidth(box, layout);
    layout();
  }

  /* ================================================================
   * 8. plan 侧栏磁贴：改前 / 现在，数字三种状态
   * ================================================================ */
  var ICONS = {
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/>',
    alert: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.8v4.8M12 16.2v.01"/>',
    cal: '<rect x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4M8 14h4M14 17h2.5"/>',
    inbox: '<path d="M4 13.5 6.6 6.2A2 2 0 0 1 8.5 5h7a2 2 0 0 1 1.9 1.2L20 13.5V18a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18z"/><path d="M4 13.5h4.5l1.2 2.2h4.6l1.2-2.2H20"/>'
  };
  function initTiles() {
    var root = $('[data-demo="tiles"]');
    if (!root) return;
    var side = $("[data-ti-side]", root);
    var tilesEl = $("[data-ti-tiles]", root);
    var nav = $("[data-ti-nav]", root);
    var dl = $("[data-ti-read]", root);
    var group = $('[role="radiogroup"]', root);
    var inboxBtn = $("[data-ti-inbox]", root);
    var n = { today: 4, overdue: 2, week: 7, inbox: 3 };
    var TILES = [
      { k: "today", l: "今天", ink: "var(--accent-text)", fill: "var(--accent)", ic: "sun" },
      { k: "overdue", l: "逾期", ink: "var(--red-text)", fill: "var(--red)", ic: "alert" },
      { k: "week", l: "本周", ink: "var(--orange-text)", fill: "var(--orange)", ic: "cal" },
      { k: "inbox", l: "收件箱", ink: "var(--lt, #00608B) var(--dk, #5AC8F5)", fill: "#30B0C7", ic: "inbox" }
    ];
    function render() {
      tilesEl.innerHTML = TILES.map(function (t) {
        var c = n[t.k];
        var cls = "l-tile" + (c === 0 ? " is-zero" : "") + (t.k === "overdue" && c > 0 ? " is-alert" : "");
        return '<span class="' + cls + '" style="--tile-ink:' + t.ink + ";--tile-fill:" + t.fill + '">' +
          '<span class="l-tile-ic"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[t.ic] + "</svg></span>" +
          '<span class="l-tile-l">' + t.l + '</span><b class="l-tile-n">' + c + "</b></span>";
      }).join("");
      measure();
    }
    function measure() {
      var s = pageScale();
      var tileH = tilesEl.firstElementChild ? tilesEl.firstElementChild.offsetHeight : 0;
      var y = nav.firstElementChild.getBoundingClientRect().top - side.getBoundingClientRect().top;
      var before = side.getAttribute("data-ti") === "before";
      kv(dl, [
        ["磁贴区高", Math.round(tilesEl.offsetHeight / s) + "px", before ? "plan实测227" : "plan实测78"],
        ["单块", Math.round(tileH / s) + "px", before ? "plan实测109" : "plan实测35"],
        ["导航第一项", "距侧栏顶" + Math.round(y / s) + "px", "plan实测 y = 363 → 214（侧栏上面还有别的）"],
        ["逾期", n.overdue > 0 ? n.overdue + "（标红）" : "0（淡下去）", "数字只有逾期不为0时是红的"]
      ]);
    }
    radios(group, function (b) {
      side.setAttribute("data-ti", b.getAttribute("data-ti-mode"));
      measure();
      announce(b.textContent + "：磁贴区高" + Math.round(tilesEl.offsetHeight / pageScale()) + "像素");
    });
    $$("[data-ti-over]", root).forEach(function (b) {
      b.addEventListener("click", function () {
        n.overdue = b.getAttribute("data-ti-over") === "0" ? 0 : Math.min(9, n.overdue + 1);
        render();
        announce(n.overdue > 0 ? "逾期" + n.overdue + "，数字标红" : "逾期清零，数字淡下去");
      });
    });
    inboxBtn.addEventListener("click", function () {
      var on = inboxBtn.getAttribute("aria-pressed") !== "true";
      setPressed(inboxBtn, on);
      n.inbox = on ? 0 : 3;
      render();
      announce(on ? "收件箱清空，数字淡下去" : "收件箱3件");
    });
    win.addEventListener("resize", batched(measure));
    render();
  }

  /* ================================================================
   * 9. 扁视口紧凑排：媒体查询判定 + 侧栏复制品
   * ================================================================ */
  var COMPACT_Q = "(min-width: 901px) and (min-aspect-ratio: 1601/1000), (min-width: 901px) and (max-height: 899.98px)";
  function compactHit(w, h) {
    if (w < 901) return 0;
    if (w / h >= 1.601) return 1;
    if (h <= 899.98) return 2;
    return 0;
  }
  function initCompact() {
    var root = $('[data-demo="compact"]');
    if (!root) return;
    var box = $("[data-cp-box]", root);
    var vp = $("[data-cp-vp]", root);
    var rw = $("[data-cp-w]", root);
    var rh = $("[data-cp-h]", root);
    var dl = $("[data-cp-read]", root);
    var live = $("[data-cp-live]", root);
    var group = $('[role="radiogroup"]', root);
    var presets = $$("[data-cp-preset]", root);
    vp.innerHTML = mockShellHtml(false);
    vp.setAttribute("aria-hidden", "true");
    var m = $("[data-m]", vp);
    var side = $("[data-m-side]", vp);
    var nav = $("[data-m-nav]", vp);
    var foot = $("[data-m-foot]", vp);
    var mode = "on";

    function update() {
      var w = +rw.value, h = +rh.value;
      var s = scaleOf(w);
      m.style.setProperty("--m", String(s));
      var hit = compactHit(w, h);
      side.classList.toggle("is-compact", mode === "on" && hit > 0);
      fitVp(box, vp, w, h, { maxH: 400 * pageScale() });
      side.scrollTop = 0; nav.scrollTop = 0;
      var over = Math.max(0, Math.round(nav.scrollHeight - nav.clientHeight));
      var navR = rectIn(nav, vp);
      var last = rectIn(nav.lastElementChild, vp);
      var spare = Math.round(navR.bottom - last.bottom);
      var hidden = $$(".l-mit", nav).filter(function (it) { return rectIn(it, vp).bottom > navR.bottom + 0.5; }).length;
      var footR = rectIn(foot, vp);
      var footOk = footR.bottom <= h + 0.5;
      presets.forEach(function (b) { setPressed(b, b.getAttribute("data-cp-preset") === w + "x" + h); });
      var why = hit === 1 ? "第1条：宽高比" + r2(w / h) + "，大于1.6" : hit === 2 ? "第2条：高" + h + "，不到900" : (w / h).toFixed(2) + "、高" + h + "，两条都不中";
      kv(dl, [
        ["媒体查询", hit ? "命中" : "不中", why],
        ["<code>--scale</code>", s.toFixed(3), ""],
        ["导航", over > 0 ? "要滚" + over + "px" : "不用滚", over > 0 ? hidden + "项在导航区外，得滚才看得见" : "最后一项下面还空" + Math.max(0, spare) + "px"],
        ["外观控件", footOk ? "在视口里" : "被挤出视口", mode === "on" ? (hit ? "紧凑排开着" : "这一档不需要收") : "紧凑排关着（改前）"]
      ]);
      return "视口" + w + "×" + h + "：媒体查询" + (hit ? "命中" : "不中") + "，导航" + (over > 0 ? "要滚" + over + "像素" : "不用滚");
    }
    function liveLine() {
      var hitNow = false;
      try { hitNow = win.matchMedia(COMPACT_Q).matches; } catch (e) { hitNow = false; }
      live.textContent = "这一页此刻：视口" + win.innerWidth + "×" + win.innerHeight + "，紧凑排" + (hitNow ? "命中（侧栏已经收紧）" : "没命中") + "。";
    }
    bindRange(rw, $("[data-cp-wout]", root), "", function () { sayLater(update()); });
    bindRange(rh, $("[data-cp-hout]", root), "", function () { sayLater(update()); });
    presets.forEach(function (b) {
      b.addEventListener("click", function () {
        var p = b.getAttribute("data-cp-preset").split("x");
        rw.value = p[0]; rh.value = p[1];
        rw.dispatchEvent(new Event("input")); rh.dispatchEvent(new Event("input"));
        announce(update());
      });
    });
    radios(group, function (b) {
      mode = b.getAttribute("data-cp-mode");
      announce(b.textContent + "：" + update());
    });
    onBoxWidth(box, update);
    win.addEventListener("resize", batched(liveLine));
    update();
    liveLine();
  }

  /* ================================================================
   * 10. 门厅一屏名片：--card-u（现行）与各吃一条 vw clamp（旧）
   * ================================================================ */
  function cardU(w, h) {
    var room = h - 66 - clamp(0.04 * h, 24, 52) - clamp(0.08 * h, 44, 88);
    var wl = 0.3514 * w + 202.064;
    var hl = 1.3231 * room;
    var u = clamp(Math.min(wl, hl), 440, 900);
    var by = u <= 440 + 1e-6 ? (hl < wl ? "下界440（高度保险已经压到它下面）" : "下界440") : u >= 900 - 1e-6 ? "上界900（画的分辨率）" : hl < wl ? "高度保险（矮窗口）" : "宽度法则";
    return { u: u, by: by };
  }
  function initHall() {
    var root = $('[data-demo="hall"]');
    if (!root) return;
    var box = $("[data-ha-box]", root);
    var vp = $("[data-ha-vp]", root);
    var rw = $("[data-ha-w]", root);
    var rh = $("[data-ha-h]", root);
    var dl = $("[data-ha-read]", root);
    var group = $('[role="radiogroup"]', root);
    var presets = $$("[data-ha-preset]", root);
    vp.setAttribute("aria-hidden", "true");
    var mode = "new";

    function cardOf(which) {
      var c = $('[data-ha-card="' + which + '"] .l-ha-card', vp);
      var r = rectIn(c, vp);
      return { w: r.width, h: r.height, a: r.width / r.height, bottom: r.bottom };
    }
    function update() {
      var w = +rw.value, h = +rh.value;
      fitVp(box, vp, w, h, { maxH: 460 * pageScale(), center: true });
      var cu = cardU(w, h);
      var now = cardOf("new"), old = cardOf("old");
      var cur = mode === "new" ? now : old;
      presets.forEach(function (b) { setPressed(b, b.getAttribute("data-ha-preset") === w + "x" + h); });
      kv(dl, [
        ["现行", Math.round(now.w) + "×" + Math.round(now.h), "长宽比" + now.a.toFixed(3)],
        ["旧写法", Math.round(old.w) + "×" + Math.round(old.h), "长宽比" + old.a.toFixed(3)],
        ["<code>--card-u</code>", r1(cu.u) + "px", cu.by],
        ["离视口底", Math.round(h - cur.bottom) + "px", mode === "new" ? "现行" : "旧写法"]
      ]);
      return "视口" + w + "×" + h + "：现行长宽比" + now.a.toFixed(3) + "，旧写法" + old.a.toFixed(3) + "；" + cu.by + "在管";
    }
    bindRange(rw, $("[data-ha-wout]", root), "", function () { sayLater(update()); });
    bindRange(rh, $("[data-ha-hout]", root), "", function () { sayLater(update()); });
    presets.forEach(function (b) {
      b.addEventListener("click", function () {
        var p = b.getAttribute("data-ha-preset").split("x");
        rw.value = p[0]; rh.value = p[1];
        rw.dispatchEvent(new Event("input")); rh.dispatchEvent(new Event("input"));
        announce(update());
      });
    });
    radios(group, function (b) {
      mode = b.getAttribute("data-ha-mode");
      vp.setAttribute("data-ha", mode);
      announce(b.textContent + "：" + update());
    });
    onBoxWidth(box, update);
    /* 画加载完卡片尺寸不变（width / height 属性先占好了比例），这里只为保险再量一次 */
    $$("img", vp).forEach(function (img) { img.addEventListener("load", batched(update)); });
    update();
  }

  /* ================================================================
   * 11. 窄屏横构图
   * ================================================================ */
  function initNarrow() {
    var root = $('[data-demo="narrow"]');
    if (!root) return;
    var box = $("[data-na-box]", root);
    var vp = $("[data-na-vp]", root);
    var range = $("[data-na-w]", root);
    var dl = $("[data-na-read]", root);
    var group = $('[role="radiogroup"]', root);
    vp.setAttribute("aria-hidden", "true");
    var card = $(".l-na-card", vp);
    var big = $(".l-na-big", vp);
    var plate = $(".l-na-plate", vp);
    var img = $(".l-na-plate img", vp);

    function update() {
      var w = +range.value;
      fitVp(box, vp, w, null, { maxH: 520 * pageScale(), center: true });
      var cr = rectIn(card, vp);
      var stack = vp.getAttribute("data-na") === "stack";
      kv(dl, [
        ["卡", Math.round(cr.width) + "×" + Math.round(cr.height), stack ? "竖着：画在下面" : "长宽比" + (cr.width / cr.height).toFixed(2)],
        ["巨字", r1(parseFloat(getComputedStyle(big).fontSize)) + "px", "clamp(40.25px, 11.5vw, 84px)"],
        [stack ? "画" : "右半宽", stack ? Math.round(img.offsetWidth) + "×" + Math.round(img.offsetHeight) : Math.round(plate.offsetWidth) + "px", stack ? "被max-height砍到300高，左右全是卡纸" : "clamp(100px, 30vw, 206px)"]
      ]);
      return "视口" + w + "：卡" + Math.round(cr.width) + "×" + Math.round(cr.height);
    }
    bindRange(range, $("[data-na-wout]", root), "", function () { sayLater(update()); });
    radios(group, function (b) {
      vp.setAttribute("data-na", b.getAttribute("data-na-mode"));
      announce(b.textContent + "：" + update());
    });
    onBoxWidth(box, update);
    $$("img", vp).forEach(function (im) { im.addEventListener("load", batched(update)); });
    update();
  }

  /* ================================================================
   * 12. 工具页轨道：滚动 → 进度 → 每层的入场 / 停留 / 退场
   * ================================================================ */
  var RAIL = [
    { k: "hero", hs: 0, he: 12, name: "门面" },
    { k: "plan", hs: 52, he: 112, name: "01 · 日程安排" },
    { k: "shua", hs: 152, he: 192, name: "02 · 刷刷" },
    { k: "gang", hs: 232, he: 272, name: "03 · 岗岗" },
    { k: "card", hs: 312, he: 352, name: "04 · card" }
  ];
  var RAIL_END = 352, FADE = 32, COPY_FADE = 22, HERO_FADE = 27;
  function smooth(t) { return t * t * (3 - 2 * t); }
  function enterT(d, hs, f) { return smooth(clamp((d - hs) / f + 1, 0, 1)); }
  function exitT(d, he, f) { return smooth(clamp((d - he) / f, 0, 1)); }
  function railPresent(L, d) {
    if (L.k === "hero") return 1 - exitT(d, L.he, HERO_FADE);
    return enterT(d, L.hs, FADE) * (1 - exitT(d, L.he, FADE));
  }
  function initRail() {
    var root = $('[data-demo="rail"]');
    if (!root) return;
    var scroller = $("[data-ra-scroll]", root);
    var rail = $("[data-ra-rail]", root);
    var stage = $("[data-ra-stage]", root);
    var range = $("[data-ra-d]", root);
    var out = $("[data-ra-dout]", root);
    var read = $("[data-ra-read]", root);
    var layers = {};
    RAIL.forEach(function (L) {
      var el = $('[data-ra-layer="' + L.k + '"]', stage);
      layers[L.k] = {
        el: el, copy: $(".l-ra-copy", el), visual: $(".l-ra-visual", el), hero: $(".l-ra-herocard", el),
        bar: $('[data-ra-bar="' + L.k + '"]', root)
      };
    });
    /* 整条轨道上「最多那一件」的最低值：按这套时间表算（右栏那组窗口），每 0.25svh 取一次 */
    var minVal = 1, minAt = 0;
    for (var dd = 0; dd <= RAIL_END; dd += 0.25) {
      var best = 0;
      for (var i = 0; i < RAIL.length; i++) best = Math.max(best, railPresent(RAIL[i], dd));
      if (best < minVal) { minVal = best; minAt = dd; }
    }
    var H = 0, span = 1;
    function size() {
      H = scroller.clientHeight;
      stage.style.height = H + "px";
      rail.style.height = Math.round(H * (1 + RAIL_END / 100)) + "px";
      span = Math.max(1, rail.offsetHeight - H);
      apply();
    }
    var lastActive = "";
    function apply() {
      var d = clamp(scroller.scrollTop / span, 0, 1) * RAIL_END;
      var u = H / 900;      /* 规格里的位移是 1440×900 舞台上的 px，按舞台高换算 */
      var bestK = "", bestV = -1;
      RAIL.forEach(function (L) {
        var o = layers[L.k];
        var p = railPresent(L, d);
        if (L.k === "hero") {
          o.hero.style.opacity = String(p);
        } else {
          var eV = enterT(d, L.hs, FADE), xV = exitT(d, L.he, FADE);
          var eC = enterT(d, L.hs, COPY_FADE), xC = exitT(d, L.he, COPY_FADE);
          o.visual.style.opacity = String(eV * (1 - xV));
          o.visual.style.transform = "translateY(" + r2(((1 - eV) * 42 - xV * 34) * u) + "px)";
          o.copy.style.opacity = String(eC * (1 - xC));
          o.copy.style.transform = "translateY(" + r2(((1 - eC) * 26 - xC * 26) * u) + "px)";
        }
        if (p >= bestV) { bestV = p; bestK = L.k; }   /* 打平给后一层 */
        if (o.bar) {
          $("s", o.bar).style.width = (p * 100).toFixed(1) + "%";
          $("b", o.bar).textContent = p.toFixed(2);
        }
      });
      RAIL.forEach(function (L) {
        var on = L.k === bestK;
        layers[L.k].el.classList.toggle("is-active", on);
        if (layers[L.k].bar) layers[L.k].bar.classList.toggle("is-active", on);
      });
      var di = Math.round(d);
      if (String(di) !== range.value) range.value = String(di);
      out.textContent = di + "svh";
      range.setAttribute("aria-valuetext", di + "svh");
      var name = RAIL.filter(function (L) { return L.k === bestK; })[0].name;
      read.textContent = "d = " + di + "svh，接指针的是「" + name + "」。按这套时间表算，整条轨道上最淡的那一刻也还有" + minVal.toFixed(2) + "（d≈" + Math.round(minAt) + "），任何一刻都有一件东西看得见。";
      if (bestK !== lastActive && lastActive) sayLater("现在是" + name);
      lastActive = bestK;
    }
    scroller.addEventListener("scroll", batched(apply), { passive: true });
    range.addEventListener("input", function () {
      scroller.scrollTop = (+range.value / RAIL_END) * span;
      apply();
    });
    if (typeof win.ResizeObserver === "function") new win.ResizeObserver(batched(size)).observe(scroller);
    else win.addEventListener("resize", batched(size));
    size();

    /* 改前 / 现在：一屏一屏要滚多远（规格里 1440×900 的实测数，示意） */
    var STRIPS = {
      before: [["h", 351], ["f", 255], ["b", 930], ["f", 255], ["h", 522], ["f", 174], ["b", 930], ["f", 174], ["h", 522], ["f", 174], ["b", 930], ["f", 174], ["h", 525]],
      after: [["h", 177], ["f", 354], ["h", 546], ["f", 354], ["h", 366], ["f", 354], ["h", 363]]
    };
    var total = { before: 5916, after: 2514 };
    Object.keys(STRIPS).forEach(function (key) {
      var strip = $('[data-ra-strip="' + key + '"]', root);
      if (!strip) return;
      strip.style.width = (total[key] / total.before * 100).toFixed(1) + "%";
      strip.innerHTML = STRIPS[key].map(function (s) { return '<span class="' + s[0] + '" style="flex:' + s[1] + ' 1 0"></span>'; }).join("");
    });
  }

  /* ================================================================
   * 13. 默认竖排页：环境开关 × 两种写法
   * ================================================================ */
  function initVertical() {
    var root = $('[data-demo="vertical"]');
    if (!root) return;
    var mini = $("[data-ve-mini]", root);
    var read = $("[data-ve-read]", root);
    var live = $("[data-ve-live]", root);
    var group = $('[role="radiogroup"]', root);
    var env = {};
    $$("[data-ve-env]", root).forEach(function (b) { env[b.getAttribute("data-ve-env")] = b; });
    function on(k) { return env[k].getAttribute("aria-pressed") === "true"; }
    function update() {
      var js = on("js"), wide = on("wide"), reduce = on("reduce");
      var way = checkedValue(group, "data-ve-way") || "add";
      var enhanced = js && wide && !reduce;
      var state;
      if (way === "add") state = enhanced ? "stacked-live" : "vertical";
      else state = (!wide || reduce) ? "vertical" : js ? "stacked-live" : "stacked-dead";
      mini.setAttribute("data-ve", state);
      var q = "增强查询" + (enhanced ? "命中" : "不中") + "。";
      var text = state === "vertical" ? "竖排页：门面和四件工具都看得见，不钉住、不擦洗。"
        : state === "stacked-live" ? "叠放：脚本在写进度，往下滚逐层交接（这里停在进度0，只露门面）。"
        : "叠放但没有脚本：进度永远是0，下面四件的不透明度都是0——这位访客只看得见门面。";
      read.textContent = q + text;
      return read.textContent;
    }
    Object.keys(env).forEach(function (k) {
      env[k].addEventListener("click", function () {
        setPressed(env[k], !on(k));
        announce(env[k].textContent + (on(k) ? "：开" : "：关") + "。" + update());
      });
    });
    radios(group, function (b) { announce(b.textContent + "：" + update()); });
    var mq = null;
    try { mq = win.matchMedia("(scripting: enabled)"); } catch (e) { mq = null; }
    if (!mq || mq.media === "not all") live.textContent = "这台浏览器不认 scripting 这个媒体特性：走的就是默认那张竖排页。";
    else live.textContent = "这台浏览器：(scripting: enabled) " + (mq.matches ? "命中" : "不中") + "。";
    update();
  }

  /* ================================================================
   * 14. 随笔日记流
   * ================================================================ */
  function initNotes() {
    var root = $('[data-demo="notes"]');
    if (!root) return;
    var box = $("[data-no-box]", root);
    var vp = $("[data-no-vp]", root);
    var range = $("[data-no-w]", root);
    var dl = $("[data-no-read]", root);
    var group = $('[role="radiogroup"]', root);
    var longBtn = $("[data-no-long]", root);
    var p = $("[data-no-p]", root);
    vp.setAttribute("aria-hidden", "true");
    var head = $(".l-no-head", vp);
    function update() {
      var w = +range.value;
      var maxH = 560 * pageScale();
      fitVp(box, vp, w, null, { maxH: maxH, boxH: Math.min(maxH, box.clientWidth / 360 * 900) });
      var flow = vp.getAttribute("data-no") === "flow";
      var list = flow ? $(".l-no-list", vp) : $(".l-no-oldlist", vp);
      var two = Math.abs(head.offsetTop - list.offsetTop) < 1;
      var cards = $$(".l-no-card", vp);
      var gap = cards.length > 1 ? cards[1].offsetTop - (cards[0].offsetTop + cards[0].offsetHeight) : 0;
      kv(dl, [
        ["栏数", two ? "两栏" : "一栏", w > 900 ? "宽过900" : "≤900塌成单列"],
        ["左栏宽", Math.round(head.offsetWidth) + "px", two ? "按内容自然宽，280封顶" : "单列时占满"],
        ["卡与卡", flow ? Math.round(gap) + "px间距" : "—", flow ? "靠间距分隔，没有线" : "旧列表：标题＋摘要＋竖线"]
      ]);
      return "视口" + w + "：" + (two ? "两栏" : "一栏") + "，左栏" + Math.round(head.offsetWidth) + "像素";
    }
    bindRange(range, $("[data-no-wout]", root), "", function () { sayLater(update()); });
    radios(group, function (b) {
      vp.setAttribute("data-no", b.getAttribute("data-no-mode"));
      announce(b.textContent + "：" + update());
    });
    longBtn.addEventListener("click", function () {
      var on = longBtn.getAttribute("aria-pressed") !== "true";
      setPressed(longBtn, on);
      p.textContent = on ? "多半是工作里的琐事，偶尔是折腾工具的记录。" : "想到什么写什么。";
      announce(update());
    });
    onBoxWidth(box, update);
    update();
  }

  /* ================================================================
   * 15. 零固定高度
   * ================================================================ */
  var ZE_TEXT = {
    short: "离线刷题。",
    mid: "离线刷题，错题自动收进错题本。",
    long: "离线刷题，错题自动收进错题本；换设备时导出一份备份，到另一台导入就能接着刷，连续刷题的进度也一起带过去。"
  };
  function initZero() {
    var root = $('[data-demo="zero"]');
    if (!root) return;
    var card = $("[data-ze-card]", root);
    var desc = $("[data-ze-desc]", root);
    var read = $("[data-ze-read]", root);
    var groups = $$('[role="radiogroup"]', root);
    var wide = $("[data-ze-wide]", root);
    function update() {
      var len = checkedValue(groups[0], "data-ze-len") || "mid";
      var way = checkedValue(groups[1], "data-ze-way") || "free";
      desc.textContent = ZE_TEXT[len];
      card.setAttribute("data-ze", way);
      card.classList.toggle("is-wide", wide.getAttribute("aria-pressed") === "true");
      var hid = Math.max(0, Math.round(card.scrollHeight - card.clientHeight));
      var dh = Math.max(0, Math.round(desc.scrollHeight - desc.clientHeight));
      if (way === "free") read.textContent = "卡高" + Math.round(card.offsetHeight) + "px：内容多高卡就多高，什么都没藏。";
      else if (hid || dh) read.textContent = "盒高写死300px：" + (hid ? "内容要" + Math.round(card.scrollHeight) + "px，底下藏掉" + hid + "px；" : "") + (dh ? "说明被截成两行，藏掉" + dh + "px。" : "") + "页面上看不出少了什么。";
      else read.textContent = "盒高写死300px：这一档刚好装下——换长文案或「字宽一点」再看。";
      return read.textContent;
    }
    groups.forEach(function (g) { radios(g, function (b) { announce(b.textContent + "：" + update()); }); });
    wide.addEventListener("click", function () {
      setPressed(wide, wide.getAttribute("aria-pressed") !== "true");
      announce(update());
    });
    win.addEventListener("resize", batched(update));
    update();
  }

  /* ================================================================
   * 16. svh / dvh 分场景（控制室 10-08 定）：三种场景 × 用对 / 用错，地址栏露着 / 收起；下面是内容尺寸公式
   *   手机417宽：可视高 露着 750 / 收起 903。100vh 按收起算（903）；100svh 按露着算（750）；100dvh 跟着可视高走。
   * ================================================================ */
  var DV = { SHOW: 750, HIDE: 903, SCROLL: 300, SHEET: 1000 };
  function dvUnit(unit, vis) { return unit === "vh" ? DV.HIDE : unit === "svh" ? DV.SHOW : vis; }
  function initDvh() {
    var root = $('[data-demo="dvh"]');
    if (!root) return;
    var scns = $("[data-dv-scns]", root);
    var group = $('[role="radiogroup"]', root);
    var rh = $("[data-dv-h]", root);
    var rr = $("[data-dv-rest]", root);
    var calcRead = $("[data-dv-calcread]", root);
    function phones(n) { return $$('[data-dv-ph="' + n + '"]', scns); }
    function render() {
      var bar = scns.getAttribute("data-bar");
      var vis = bar === "show" ? DV.SHOW : DV.HIDE;
      var out = [];
      /* ① 页面已经滚了300px：卡片在屏上的 y = 首屏高 − 300；滚动时间表 d = 300 ÷ 1个单位 */
      var r1 = phones(1).map(function (ph) {
        var unit = ph.getAttribute("data-unit");
        var H = dvUnit(unit, vis);
        ph.style.setProperty("--h", H + "px");
        var y = H - DV.SCROLL;
        var d = DV.SCROLL / (H / 100);
        var jump = H !== DV.SHOW;               /* 跟露着的时候比 */
        ph.classList.toggle("is-jump", jump);
        return { unit: unit, y: y, d: d, jump: jump };
      });
      var ok1 = r1[0], bad1 = r1[1];
      $('[data-dv-read="1"]', root).innerHTML = "svh：卡片在屏上y=<b>" + ok1.y + "</b>，时间表d=" + Math.round(ok1.d) + '，<span class="ok">地址栏怎么动都不变</span>。dvh：y=<b>' + bad1.y + "</b>，d=" + Math.round(bad1.d) +
        (bad1.jump ? '，<span class="bad">卡片往下跳了' + (bad1.y - ok1.y) + "px，时间表倒回去" + Math.round(ok1.d - bad1.d) + "svh</span>。" : "（地址栏露着时两边一样，收起来再看）。");
      out.push(bad1.jump ? "①dvh那台卡片跳了" + (bad1.y - ok1.y) + "像素" : "①两边一样");
      /* ② 全屏弹层：高 = 1个单位的100，可见区比它高的部分就是缝 */
      var r2 = phones(2).map(function (ph) {
        var H = dvUnit(ph.getAttribute("data-unit"), vis);
        var gap = Math.max(0, vis - H);
        ph.style.setProperty("--h", Math.min(H, vis) + "px");
        ph.style.setProperty("--gap", gap + "px");
        return gap;
      });
      $('[data-dv-read="2"]', root).innerHTML = 'dvh：<span class="ok">正好盖满' + vis + "</span>。svh：" +
        (r2[1] > 0 ? '<span class="bad">底下露出' + r2[1] + "px的缝</span>，看得见后面的页面。" : "地址栏露着时也正好（收起来再看）。");
      out.push(r2[1] > 0 ? "②svh那台底下露缝" + r2[1] + "像素" : "②两边都盖满");
      /* ③ 底部抽屉：高 = min(内容1000, 1个单位的100 − 40)；比可见区高的部分被裁 */
      var r3 = phones(3).map(function (ph) {
        var cap = dvUnit(ph.getAttribute("data-unit"), vis) - 40;
        var h = Math.min(DV.SHEET, cap);
        var cut = Math.max(0, h - vis);
        ph.style.setProperty("--h", h + "px");
        ph.classList.toggle("is-cut", cut > 0);
        return { h: h, cut: cut };
      });
      $('[data-dv-read="3"]', root).innerHTML = "svh：抽屉封顶<b>" + r3[0].h + '</b>，<span class="ok">地址栏露着也放得下</span>。vh：封顶' + r3[1].h +
        (r3[1].cut > 0 ? '，<span class="bad">顶上' + r3[1].cut + "px压在地址栏底下，点不到</span>。" : "（收起时放得下，露着时就被裁）。") + "要是写dvh，抽屉高跟着地址栏" + (DV.SHOW - 40) + "↔" + (DV.HIDE - 40) + "一跳一跳。";
      out.push(r3[1].cut > 0 ? "③vh那台顶上被裁" + r3[1].cut + "像素" : "③两边都放得下");
      return "可视高" + vis + "：" + out.join("，");
    }
    var U = 1.417;
    function calc() {
      var h = +rh.value, rest = +rr.value;
      var a = 540 * U, b = h - rest, c = 0.69 * h;
      var stage = Math.max(0, Math.min(a, b));
      var winA = a <= b;
      var max = Math.max(a, b, c, 1);
      function set(sel, v, cls) {
        var el = $(sel, root);
        el.style.width = clamp(v / max, 0, 1) * 100 + "%";
        el.className = cls || "";
      }
      set("[data-dv-a]", a, winA ? "is-win" : "");
      set("[data-dv-b]", b, winA ? "" : "is-win");
      set("[data-dv-c]", c, c > b ? "is-over" : "");
      $("[data-dv-av]", root).textContent = Math.round(a) + "px";
      $("[data-dv-bv]", root).textContent = Math.round(b) + "px";
      $("[data-dv-cv]", root).textContent = Math.round(c) + "px";
      calcRead.textContent = "舞台 = min(" + Math.round(a) + ", " + Math.round(b) + ") = " + Math.round(stage) + "px：" +
        (winA ? "等比项在管，构图和Mac一致" : "可用高度项在管，余量来自结构，任何高度都装得下") +
        "。写死69svh是" + Math.round(c) + "px，" + (c > b ? "比可用高多" + Math.round(c - b) + "px，出滚动条、上下不对称。" : "这一档恰好装下——工具栏一多就溢出。");
      return calcRead.textContent;
    }
    radios(group, function (b) {
      scns.setAttribute("data-bar", b.getAttribute("data-dv-bar"));
      announce(render());
    });
    bindRange(rh, $("[data-dv-hout]", root), "", function () { sayLater(calc()); });
    bindRange(rr, $("[data-dv-restout]", root), "", function () { sayLater(calc()); });
    render();
    calc();
  }

  /* ================================================================
   * 17. 陷阱集：每个小框一个量法
   * ================================================================ */
  function inter(a, b) {
    var w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
    var h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    return w > 0 && h > 0 ? w * h : 0;
  }
  var TRAPS = {
    fixed: function (st, fix) {
      var view = $(".l-tf-view", st), bar = $(".l-tf-bar", st), ps = $$(".l-tf-panel p", st);
      var vr = view.getBoundingClientRect(), br = bar.getBoundingClientRect(), lr = ps[ps.length - 1].getBoundingClientRect();
      var where = view.scrollTop < 2 ? "顶" : view.scrollTop >= view.scrollHeight - view.clientHeight - 2 ? "底" : "中间";
      var visible = br.top >= vr.top - 0.5 && br.bottom <= vr.bottom + 0.5;
      var cover = Math.round(Math.max(0, Math.min(br.bottom, lr.bottom) - Math.max(br.top, lr.top)));
      if (fix) return '滚在' + where + '：<span class="ok">底栏贴着框底</span>' + (where === "底" ? "，到末尾落回原位、不压内容" : "") + "。";
      if (!visible) return '滚在' + where + '：<span class="bad">底栏不在框里</span>——它贴在面板最底下，滚到底才出现。';
      return '滚在' + where + '：底栏出现了，<span class="bad">压住最后一项' + cover + "px</span>。";
    },
    stretch: function (st, fix) {
      var h = Math.round($(".l-ts-top", st).offsetHeight);
      return "顶栏那一行<b>" + h + "px</b>（内容40）" + (h > 41 ? '，<span class="bad">多出' + (h - 40) + "px</span>" : '，<span class="ok">正好</span>') + "。";
    },
    colauto: function (st) {
      var col = $(".l-tc-col", st), sg = $(".l-tc-stage", st);
      var avail = col.clientWidth - 20;
      var w = Math.round(sg.offsetWidth);
      return "舞台宽<b>" + w + "</b> / 可用" + Math.round(avail) + "px" + (w < avail - 1 ? '，<span class="bad">缩成了内容宽</span>' : '，<span class="ok">撑满</span>') + "。";
    },
    twoauto: function (st) {
      var row = $(".l-tw-row", st), link = $(".l-tw-link", st), cnt = $(".l-tw-count", st);
      var gap = Math.round(cnt.getBoundingClientRect().left - link.getBoundingClientRect().right);
      return "「全部 ›」和计数之间<b>" + gap + "px</b>" + (gap > 12 ? '，<span class="bad">链接飘在中间</span>' : '，<span class="ok">挨着、整体靠右</span>') + "。";
    },
    pct: function (st) {
      var img = $(".l-tp-img", st), brand = $(".l-tp-brand", st);
      var cs = getComputedStyle(img);
      var pl = parseFloat(cs.paddingLeft) || 0;
      var content = img.clientWidth - pl - (parseFloat(cs.paddingRight) || 0);
      return "图标画出来<b>" + r1(content) + "px</b>宽" + (pl > 0 ? '（padding ' + r1(pl) + "px＝包含块" + Math.round(brand.offsetWidth) + 'px×8%），<span class="bad">压没了</span>' : '（34×84%），<span class="ok">正常</span>') + "。";
    },
    input: function (st, fix) {
      var el = fix ? $("textarea", st) : $("input", st);
      if (!el.value) return "点「填入两行」：第一行当标题、其余进正文。";
      var lines = el.value.split("\n");
      var body = lines.slice(1).join("\n");
      return "标题「" + lines[0] + "」，正文" + (body ? "「" + body + '」，<span class="ok">拆开了</span>' : '<span class="bad">是空的</span>（换行被吃掉）') + "。";
    },
    figure: function (st) {
      var fig = $("figure", st);
      var ml = parseFloat(getComputedStyle(fig).marginLeft) || 0;
      return "figure左右外边距各<b>" + r1(ml) + "px</b>" + (ml > 0 ? '，<span class="bad">卡片被撑宽' + Math.round(ml * 2) + "px</span>，哪条规则里都找不到" : '，<span class="ok">卡片宽正常</span>') + "。";
    },
    negright: function (st) {
      var page = $(".l-tn-page", st);
      var over = Math.round(page.scrollWidth - page.clientWidth);
      return over > 0 ? 'scrollWidth被顶大<span class="bad">' + over + "px</span>：框不显示滚动条，可iOS照样能左右拖。" : '<span class="ok">scrollWidth没被顶大</span>。';
    },
    clipdeco: function (st, fix) {
      var pot = $(fix ? ".l-td-out" : ".l-td-in", st);
      var pr = pot.getBoundingClientRect();
      var clipR = fix ? $(".l-td-set", st).getBoundingClientRect() : $(".l-td-card", st).getBoundingClientRect();
      var pct = Math.round(inter(pr, clipR) / (pr.width * pr.height) * 100);
      return "盆栽露出<b>" + pct + "%</b>" + (pct < 99 ? '，<span class="bad">被卡片的圆角裁掉了</span>' : '，<span class="ok">完整</span>') + "。";
    },
    gridmax: function (st) {
      var sheet = $(".l-tm-sheet", st), vpEl = $(".l-tm-vp", st);
      var sr = sheet.getBoundingClientRect(), vr = vpEl.getBoundingClientRect();
      var cut = Math.round(Math.max(0, vr.top - sr.top));
      var scrolls = sheet.scrollHeight > sheet.clientHeight + 1;
      return cut > 0 ? '面板' + Math.round(sheet.offsetHeight) + 'px高，<span class="bad">上面' + cut + "px在框外</span>，面板自己又不滚——顶上那几行点不到。"
        : '面板封顶' + Math.round(sheet.offsetHeight) + "px" + (scrolls ? '，<span class="ok">自己能滚</span>，每一行都点得到。' : "。");
    },
    anchor: function (st) {
      var view = $("[data-ta-view]", st);
      if (!view.__jumped) return "点「跳到第3节」看落点。";
      var bar = $(".l-ta-bar", st), t = $("[data-ta-target]", st);
      var gap = Math.round(t.getBoundingClientRect().top - bar.getBoundingClientRect().bottom);
      return "第3节离顶栏下沿<b>" + gap + "px</b>" + (gap > 24 ? '，<span class="bad">顶栏高被算了两次</span>（该是20）' : '，<span class="ok">正好</span>') + "。";
    }
  };
  function initTraps() {
    $$(".l-trap").forEach(function (trap) {
      var kind = trap.getAttribute("data-trap");
      var st = $(".l-trap-stage", trap);
      var btn = $("[data-trap-fix]", trap);
      var read = $("[data-trap-read]", trap);
      var fn = TRAPS[kind];
      if (!fn || !st || !btn || !read) return;
      var title = $(".l-trap-t", trap).textContent.replace(/^\d+/, "");
      function update() {
        var fix = st.getAttribute("data-fix") === "1";
        read.innerHTML = fn(st, fix);
        return read.textContent;
      }
      btn.addEventListener("click", function () {
        var fix = st.getAttribute("data-fix") !== "1";
        st.setAttribute("data-fix", fix ? "1" : "0");
        setPressed(btn, fix);
        btn.textContent = fix ? "看反例" : "看修法";
        if (kind === "anchor" && $("[data-ta-view]", st).__jumped) jump(st);
        announce(title + "：" + (fix ? "修法" : "反例") + "。" + update());
      });
      if (kind === "fixed") $(".l-tf-view", st).addEventListener("scroll", batched(update), { passive: true });
      if (kind === "input") {
        $("[data-ti-fill]", st).addEventListener("click", function () {
          var v = "交季度报表\n记得附上审计意见";
          $("input", st).value = v;
          $("textarea", st).value = v;
          announce(update());
        });
        $$("input, textarea", st).forEach(function (f) { f.addEventListener("input", update); });
      }
      if (kind === "anchor") {
        $("[data-ta-go]", st).addEventListener("click", function () { jump(st); announce(update()); });
      }
      trap.__update = update;
      update();
    });
    win.addEventListener("resize", batched(function () { $$(".l-trap").forEach(function (t) { if (t.__update) t.__update(); }); }));
  }
  /* 锚点落点交给 CSS（scroll-padding-top / scroll-margin-top）；scrollIntoView 会顺带滚动页面，滚完把页面放回原处 */
  function jump(st) {
    var view = $("[data-ta-view]", st);
    var target = $("[data-ta-target]", st);
    var x = win.scrollX, y = win.scrollY;
    target.scrollIntoView({ block: "start", inline: "nearest", behavior: "instant" });
    win.scrollTo({ left: x, top: y, behavior: "instant" });
    view.__jumped = true;
  }

  function boot() {
    [initSkeleton, initClamp, initScale, initProbe, initBreakpoints, initPhone, initTopbar, initTiles, initCompact,
      initHall, initNarrow, initRail, initVertical, initNotes, initZero, initDvh, initTraps].forEach(function (fn) {
      try { fn(); } catch (e) { if (win.console) console.warn("[layout] " + (fn.name || "init") + "没起来：", e); }
    });
  }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
