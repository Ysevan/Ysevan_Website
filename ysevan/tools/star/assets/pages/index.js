/*
 * 总览页专属脚本（defer，排在 star.js → kit.js → data/search-index.js → data/updates.js 之后）。
 *
 * 一、开头的门面（第二阶段，2026-10-08；规格取自交互页 / 色彩页对应条目的「数值 / 代码」）
 *   条目星球（ix-xw-globe，底是 c-stage 星野舞台）：星上每个点是十章里的一条（STAR_SEARCH 里 p 为 nav.js PAGES 里
 *     除总览、收藏以外各页的项，0.4.0 起152条），字用短名 n、去掉括号注记，没有 n 就截标题，按章节着色（PAGES 的 tint）；
 *     舞台副标题与读屏说明里的「除收藏外9章的152条」从数据现算（收藏的卡片不是条目，不上星）。
 *     朝里那半边只留点、不显示字，转到正面渐显；朝外那半边两个标签框相交时，离观者远的那个字淡掉、点留着
 *     （只改字的 opacity，框按开页量好的宽高乘缩放算，每帧不读布局）。约80秒一圈；手按下去立刻停，
 *     鼠标停在点上、键盘选中时也停，放开后慢慢恢复；按下那一点跟着指针走（转速 = 1 / 半径），俯仰限位 ±0.7 弧度，
 *     松手按最后100ms的速度带惯性；按下到松开期间最大位移 ≤4px（触摸 ≤8px）且按在点上才算点，跳到那一条（item.f）；
 *     触摸只认横向，舞台 touch-action: pan-y pinch-zoom，第二根手指落下作废这次拖拽。
 *     键盘与读屏（ix-xw-tabstop 的意思）：整颗星只占一个Tab位（role=application + aria-label 说清怎么用），
 *     星点 aria-hidden；聚焦后 ←→ 换「选中」的那颗、转到正面、播报标题，Home / End 到头尾，Enter 打开。
 *     减弱动效：不自转、不带惯性，拖动照常，换选中直接到位。
 *     性能：只在星球看得见（IntersectionObserver）、页面可见、没有整页弹层开着时跑 rAF（回调名 globeFrame，量具按名字数）；
 *     每帧只写 transform（透明度、层级、能不能点只在变了时写）；没人碰、自己慢慢转时画面更新压到约30帧
 *     （152个点各占一层，没显卡时合成按层算）。星点闪烁同样只在舞台看得见时走。
 *   随便翻一条（c-button 的主按钮）：是个链接，href 在星上那些条目（十章）里随机挑一条；回到本页（bfcache）时重挑。
 *   本书进度（ix-sheet-ring）：StarKit.sheet kind:"ring"，圆环与中心数字都是「已上线的章 / 全部章」（nav.js PAGES 现算，
 *     总览不算一章），下面列各章状态与条数（count；收藏按 STAR_SEARCH 里 p=collection 的条数）。
 *   更新记录（ix-sheet-ruler）：StarKit.sheet kind:"ruler"，StarKit.ruler 画53周、today 传 new Date()；marks 是
 *     STAR_UPDATES 里有日期的版本落在今年第几周（与 kit 同一算法：1月1日算第1周、每7天一格），「未发布」记在本周。
 *     遮住的编号是最近一次发布的版本号（还没发布过就是「未发布」）。下面按版本从新到旧列条目：每条先露到第一个句号
 *     （或前40字），点「展开」原地接着露出全文（首句不动，后文淡入，按钮 aria-expanded；不是 ix-sheet-pull 的拖开）。
 *   接着看（ix-resume）：读 localStorage「star-last」（外壳 star.js 第16条写），有就「接着看：交互 › 圆环计数」链到那一条；
 *     没有就写明「从色彩开始」；记的那条已经不在了也写明从那一章开头看——点之前就知道会落到哪。
 *
 * 二、「屋主的审美原则」十条旁边的对比小样
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

  /* ================================================================
   * 一、开头的门面
   * ================================================================ */
  var NAV = window.STAR_NAV || null;
  var SEARCH = window.STAR_SEARCH && window.STAR_SEARCH.items ? window.STAR_SEARCH : null;
  var KIT = window.StarKit || null;
  var mqReduce = null;
  try { mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)"); } catch (e) { mqReduce = null; }
  function reduced() { return !!(mqReduce && mqReduce.matches); }
  function onMq(m, fn) {
    if (!m) return;
    if (typeof m.addEventListener === "function") m.addEventListener("change", fn);
    else if (typeof m.addListener === "function") m.addListener(fn);
  }
  function composing(e) { return !!(e.isComposing || e.keyCode === 229); }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function pageOf(id) {
    if (!NAV) return null;
    for (var i = 0; i < NAV.pages.length; i++) if (NAV.pages[i].id === id) return NAV.pages[i];
    return null;
  }
  function pageTitle(id) { var p = pageOf(id); return p ? p.title : ""; }
  /* 星上、「接着看」里用的短名：目录短名 n；没有就截标题到第一个冒号 / 逗号，最多10个字 */
  function shortName(it) {
    if (it.n) return it.n;
    var t = String(it.t || "").split(/[：，；（]/)[0];
    return t.length > 10 ? t.slice(0, 10) + "…" : t;
  }
  /* 章节色（nav.js 的 tint）是渐变时取中间那个色当光晕色：box-shadow 不认渐变 */
  /* 星上的字：短名去掉括号注记（「多选版（已撤回）」只显示「多选版」）；全名在下面那行和播报里 */
  function globeName(it) {
    var t = shortName(it).split(/[（(]/)[0].replace(/\s+$/, "");
    return t || shortName(it);
  }
  function glowOf(tint) {
    var m = String(tint || "").match(/#[0-9a-f]{6}/gi);
    return m ? m[Math.floor(m.length / 2)] : "#FFFFFF";
  }
  /* 星上收哪几章：nav.js PAGES 里除了总览、收藏的页（「做法」「避坑」两组），顺序照 PAGES */
  var GLOBE_PAGES = NAV ? NAV.pages.filter(function (p) { return p.id !== "index" && p.id !== "collection"; }).map(function (p) { return p.id; }) : ["color", "interaction"];
  var globeItems = SEARCH ? SEARCH.items.filter(function (it) { return GLOBE_PAGES.indexOf(it.p) >= 0 && it.f; }) : [];
  /* 星上实际有条目的章（索引还没跟上的章不算）：「除收藏外9章」/「色彩、交互两章」/「3章」。
     收藏也算一章（「本书进度」的10章里有它），但它的卡片不是条目、不上星，所以写明除了它 */
  var globeChapters = GLOBE_PAGES.filter(function (id) { return globeItems.some(function (it) { return it.p === id; }); });
  function globeScope() {
    var n = globeChapters.length;
    if (n > 1 && n === GLOBE_PAGES.length) {
      var left = NAV ? NAV.pages.filter(function (p) { return p.id !== "index" && GLOBE_PAGES.indexOf(p.id) < 0; }).map(function (p) { return p.title; }) : [];
      return (left.length ? "除" + left.join("、") + "外" : "全部") + n + "章";
    }
    if (n === 1) return pageTitle(globeChapters[0]);
    if (n === 2) return globeChapters.map(pageTitle).join("、") + "两章";
    return n + "章";
  }
  function kitOpen() { return !!(KIT && KIT.isOpen && KIT.isOpen()); }
  var globeKick = function () {};

  /* ---- 条目星球（ix-xw-globe） ---- */
  (function initGlobe() {
    var hero = $("[data-hero]");
    var host = $("[data-globe]");
    if (!hero || !host) return;
    var nOut = $("[data-globe-n]");
    var scopeOut = $("[data-globe-scope]");
    if (nOut && globeItems.length) nOut.textContent = String(globeItems.length);
    if (scopeOut && globeItems.length) scopeOut.textContent = globeScope();
    if (!globeItems.length || !window.requestAnimationFrame) return;
    var ball = $(".globe-ball", host);
    var cap = $(".globe-cap", host);
    var N = globeItems.length;
    var TAU = Math.PI * 2;
    var SPIN = TAU / 80;          /* 约80秒一圈 */
    var PITCH_MAX = 0.7;          /* 俯仰限位 ±0.7 弧度 */
    var D = 3;                    /* 透视：视点在球心前 3 个半径处；正面那点缩放为1、背面一半 */
    var EXTENT = 0.7071;          /* 这个透视下投影出来的最大半径 ≈ 0.707R（z = 1/3 处），按它把整颗星装进框 */
    var NAME_Z0 = 0.1, NAME_ZR = 0.3;   /* 字只在朝外那半边显示：深度 z ≤ .1 没有字（只留点），.1 → .4 渐显，再往前全显 */

    /* 位置：广义螺旋（Rakhmanov–Saff–Zhou），从北往南一圈圈排，分布均匀；页面顺序相邻的两条在球上也挨着，
       键盘 ←→ 一步只转一小段。纬度压到 ±57° 以内，免得两极那几条转到正面也被俯仰限位卡着、斜着看 */
    var pts = [];
    var lon = 0;
    var frag = doc.createDocumentFragment();
    for (var i = 0; i < N; i++) {
      var h = N > 1 ? 1 - 2 * (i + 0.5) / N : 0;
      if (i > 0) lon += 3.6 / Math.sqrt(N) / Math.sqrt(1 - h * h);
      var lat = Math.asin(h * 0.86);
      var it = globeItems[i];
      var pg = pageOf(it.p);
      var tint = pg ? pg.tint : "#FFFFFF";
      var el = doc.createElement("span");
      el.className = "gl-pt";
      el.setAttribute("data-i", String(i));
      el.style.setProperty("--c", tint);
      el.style.setProperty("--g", glowOf(tint));
      el.innerHTML = '<i class="gl-dot"></i><span class="gl-name"></span>';
      el.lastChild.textContent = globeName(it);
      frag.appendChild(el);
      pts.push({ el: el, name: el.lastChild, x: Math.cos(lat) * Math.sin(lon), y: -Math.sin(lat), z: Math.cos(lat) * Math.cos(lon), lat: lat, lon: lon,
        tf: "", o: -1, zi: -1, pe: null, na: -1, depth: 0, X: 0, Y: 0, sc: 1, w: 0, h: 0 });
    }
    ball.appendChild(frag);
    /* 球面轮廓：一圈很淡的边和一点受光，只在尺寸变了时摆，平时不动（让一团字读得出是一颗球） */
    var orb = doc.createElement("i");
    orb.className = "globe-orb";
    ball.insertBefore(orb, ball.firstChild);

    /* 整颗星一个Tab位：容器可聚焦，星点 aria-hidden（球本身在 HTML 里是 aria-hidden，这里有了内容才放出来） */
    host.removeAttribute("aria-hidden");
    ball.setAttribute("aria-hidden", "true");
    cap.setAttribute("aria-hidden", "true");
    host.setAttribute("tabindex", "0");
    host.setAttribute("role", "application");
    host.setAttribute("aria-roledescription", "条目星球");
    host.setAttribute("aria-label", "条目星球：" + globeScope() + "共" + N + "条。左右方向键换一条并转到正面，Home、End到头尾，回车打开那一条。");

    var yaw = 0.35, pitch = -0.16, vel = 0, spin = reduced() ? 0 : 1, target = null;
    var pressed = null, hovering = -1, kbd = false, sel = -1;
    var visible = true, raf = 0, last = 0;
    var R = 100, cx = 0, cy = 0, K = 0.01;
    var fine = false;
    try { fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches; } catch (e) { fine = false; }

    function measure() {
      var w = host.clientWidth, hh = host.clientHeight;
      var lw = 0, lh = 0;
      /* 每个标签的盒子（不含 transform）只在这里量一次，每帧避让按它乘缩放算，不再读布局 */
      for (var j = 0; j < N; j++) {
        var pj = pts[j], dot = pj.el.firstChild;
        pj.w = pj.el.offsetWidth;
        pj.h = pj.el.offsetHeight;
        /* 点相对标签中心的横向偏移与半径（点在标签最左边）：避让时点也算一个小框 */
        pj.dx = dot.offsetLeft + dot.offsetWidth / 2 - pj.w / 2;
        pj.dr = dot.offsetWidth / 2 + 3;
        lw = Math.max(lw, pj.w);
        lh = Math.max(lh, pj.h);
      }
      /* 最宽那个名字在左右两边也不出框：横向留半个名字宽，纵向留半个名字高 */
      var ax = w / 2 - lw * 0.45;
      var ay = hh / 2 - lh / 2 - 4;
      R = Math.max(40, Math.min(ax, ay) / EXTENT);
      cx = w / 2;
      cy = hh / 2;
      K = 1 / R;                  /* 按下那一点跟着指针走：正面一个像素 = 1/R 弧度 */
      var rr = R * EXTENT;
      orb.style.width = orb.style.height = (2 * rr).toFixed(1) + "px";
      orb.style.transform = "translate(" + (cx - rr).toFixed(1) + "px," + (cy - rr).toFixed(1) + "px)";
    }
    function lit(j) { return j === hovering || (j === sel && kbd); }
    function apply() {
      var cY = Math.cos(yaw), sY = Math.sin(yaw), cP = Math.cos(pitch), sP = Math.sin(pitch);
      for (var j = 0; j < N; j++) {
        var p = pts[j];
        var x1 = p.x * cY + p.z * sY;
        var z1 = -p.x * sY + p.z * cY;
        var y2 = p.y * cP - z1 * sP;
        var z2 = p.y * sP + z1 * cP;
        var s = (D - 1) / (D - z2);
        var on = lit(j);
        p.X = cx + R * x1 * s;
        p.Y = cy + R * y2 * s;
        p.sc = s * (on ? 1.12 : 1);
        var tf = "translate3d(" + p.X.toFixed(1) + "px," + p.Y.toFixed(1) + "px,0) scale(" + p.sc.toFixed(3) + ") translate(-50%,-50%)";
        if (tf !== p.tf) { p.tf = tf; p.el.style.transform = tf; }
        /* 背面淡、正面亮（.12 → 1）；真正写进去在 declutter 里（被前面的字压着的点还要再压淡），只在跨过 1/40 档时写 */
        p.ob = on ? 1 : Math.round((0.12 + 0.88 * Math.pow((z2 + 1) / 2, 2)) * 40) / 40;
        var zi = on ? 99 : Math.round((z2 + 1) * 20);
        if (zi !== p.zi) { p.zi = zi; p.el.style.zIndex = String(zi); }
        /* 只有朝前的那半能点：背面那些被前面的挡着，点不准 */
        var pe = z2 > NAME_Z0;
        if (pe !== p.pe) { p.pe = pe; p.el.classList.toggle("is-back", !pe); }
        p.depth = z2;
      }
      declutter();
    }
    /* 前半球的避让：从离观者最近的往后排（悬停 / 键盘选中的那颗排最前），后来的标签框和已摆下的字框相交、
       或者压着更近的那些点，它的字就淡掉、点留着；更远的点落在已摆下的字框里，整颗压到 .1（不从字缝里透出来）。
       只改 opacity（字的过渡 .25s 在 CSS 里），框大小用 measure() 量好的宽高乘缩放，不读布局。
       已经显示的允许压2px、还没显示的要先空出3px才亮：转到边界上时不来回闪。 */
    var order = [];
    for (var oi = 0; oi < N; oi++) order.push(oi);
    var boxes = [];     /* 已摆下的字框：中心 x、y、半宽、半高 */
    var dots = [];      /* 已经过的（更近的）朝前那半的点：中心 x、y、半径 */
    function nearFirst(a, b) {
      var la = lit(a), lb = lit(b);
      if (la !== lb) return la ? -1 : 1;
      return pts[b].depth - pts[a].depth;
    }
    function declutter() {
      order.sort(nearFirst);
      var nb = 0, nd = 0, b;
      for (var k = 0; k < N; k++) {
        var j = order[k], p = pts[j], on = lit(j), a = 0;
        var px = p.X + p.dx * p.sc, pr = p.dr * p.sc;
        /* 这颗点落在更近那些已摆下的字框里：压淡，免得从字缝里透出来 */
        var under = false;
        if (!on) {
          for (b = 0; b < nb; b += 4) {
            if (Math.abs(px - boxes[b]) < boxes[b + 2] && Math.abs(p.Y - boxes[b + 1]) < boxes[b + 3]) { under = true; break; }
          }
        }
        if (on || p.depth > NAME_Z0) {
          a = on ? 1 : Math.min(1, Math.round((p.depth - NAME_Z0) / NAME_ZR * 10) / 10);
          var hw = p.w * p.sc / 2, hh = p.h * p.sc / 2, m = p.na > 0 ? -2 : 3, hit = under;
          if (!on && !hit) {
            for (b = 0; b < nb; b += 4) {
              if (Math.abs(p.X - boxes[b]) < hw + boxes[b + 2] + m && Math.abs(p.Y - boxes[b + 1]) < hh + boxes[b + 3] + m) { hit = true; break; }
            }
          }
          /* 字框压着更近的点（那颗点画在字上面）也不显示 */
          if (!on && !hit) {
            for (b = 0; b < nd; b += 3) {
              if (Math.abs(p.X - dots[b]) < hw + dots[b + 2] + m && Math.abs(p.Y - dots[b + 1]) < hh + dots[b + 2] + m) { hit = true; break; }
            }
          }
          if (hit) a = 0;
          else if (a > 0) { boxes[nb++] = p.X; boxes[nb++] = p.Y; boxes[nb++] = hw; boxes[nb++] = hh; }
        }
        if (p.depth > NAME_Z0 && !under) { dots[nd++] = px; dots[nd++] = p.Y; dots[nd++] = pr; }
        var o = under ? Math.min(p.ob, 0.1) : p.ob;
        if (o !== p.o) { p.o = o; p.el.style.opacity = String(o); }
        if (a !== p.na) {
          p.na = a;
          p.name.style.opacity = String(a);
          p.name.style.pointerEvents = a > 0 ? "" : "none";   /* 淡掉的字不挡点击：点得到它后面那颗 */
        }
      }
    }
    function stopped() { return reduced() || !!pressed || kbd || hovering >= 0; }
    function running() { return visible && !doc.hidden && !kitOpen() && (spin > 0 || vel !== 0 || !!target || !stopped()); }
    /* 回调名给量具用：按函数名数 rAF 次数（看不见、页面在后台时必须是0） */
    var drawnAt = 0;
    var IDLE_MS = 30;             /* 自转时两次画面更新至少隔30ms（≈30帧） */
    function globeFrame(now) {
      raf = 0;
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      var want = stopped() ? 0 : 1;
      /* 停：很快降到0（手按着时干脆不转，见下）；恢复：慢慢回到原速 */
      spin += (want - spin) * Math.min(1, dt * (want ? 0.9 : 8));
      if (Math.abs(want - spin) < 0.003) spin = want;
      if (target) {
        var k = Math.min(1, dt * 9);
        yaw += (target.yaw - yaw) * k;
        pitch += (target.pitch - pitch) * k;
        if (Math.abs(target.yaw - yaw) < 0.002 && Math.abs(target.pitch - pitch) < 0.002) { yaw = target.yaw; pitch = target.pitch; target = null; }
      } else if (!pressed) {
        yaw += (SPIN * spin + vel) * dt;
        vel *= Math.pow(0.05, dt);
        if (Math.abs(vel) < 0.01) vel = 0;
      }
      /* 降帧：只在「没人碰、自己慢慢转」时把画面更新压到约30帧（每帧位移不到1px，看不出来），
         152个点各占一层，没显卡的机器上合成那一步按层算；拖动、惯性、转到选中那颗、停下的那一帧照常每帧画 */
      var idle = !target && !pressed && vel === 0 && spin === 1 && hovering < 0 && !kbd;
      if (!idle || now - drawnAt >= IDLE_MS || !drawnAt) { drawnAt = now; apply(); }
      if (running()) raf = window.requestAnimationFrame(globeFrame);
      else { last = 0; drawnAt = 0; }
    }
    function kick() {
      if (raf || !visible || doc.hidden || kitOpen()) return;
      last = 0;
      raf = window.requestAnimationFrame(globeFrame);
    }
    globeKick = kick;
    function frontMost() {
      var best = 0;
      for (var j = 1; j < N; j++) if (pts[j].depth > pts[best].depth) best = j;
      return best;
    }
    function rotateTo(j) {
      var p = pts[j];
      var ty = -p.lon;
      ty += Math.round((yaw - ty) / TAU) * TAU;
      var tp = clamp(-p.lat, -PITCH_MAX, PITCH_MAX);
      vel = 0;
      if (reduced()) { yaw = ty; pitch = tp; target = null; apply(); return; }
      target = { yaw: ty, pitch: tp };
      kick();
    }
    function setCap(j) {
      if (j < 0) { cap.classList.remove("is-on"); return; }
      var it2 = globeItems[j];
      cap.textContent = pageTitle(it2.p) + " · " + it2.t;
      cap.classList.add("is-on");
    }
    function markSel() {
      for (var j = 0; j < N; j++) pts[j].el.classList.toggle("is-sel", j === sel);
      host.classList.toggle("is-kbd", kbd);
    }
    function go(j) {
      var it2 = globeItems[j];
      if (it2 && it2.f) window.location.href = it2.f;
    }

    /* ---- 指针：手一碰就停；拖动跟手；位移阈值分开点开与拖动 ---- */
    host.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      if (pressed) {
        /* 第二根手指落下：这次拖拽作废，交给浏览器（双指缩放） */
        if (pressed.id !== e.pointerId) {
          pressed = null;
          host.classList.remove("is-dragging");
          kick();
        }
        return;
      }
      var pt = e.target.closest ? e.target.closest(".gl-pt") : null;
      pressed = { id: e.pointerId, x0: e.clientX, y0: e.clientY, lx: e.clientX, ly: e.clientY, max: 0, type: e.pointerType,
        i: pt ? +pt.getAttribute("data-i") : -1, samples: [{ t: performance.now(), x: e.clientX }] };
      target = null;
      vel = 0;
      try { host.setPointerCapture(e.pointerId); } catch (err) { /* 拿不到捕获也能拖 */ }
      host.classList.add("is-dragging");
      kick();
    });
    host.addEventListener("pointermove", function (e) {
      if (!pressed || e.pointerId !== pressed.id) return;
      var dx = e.clientX - pressed.lx, dy = e.clientY - pressed.ly;
      pressed.lx = e.clientX;
      pressed.ly = e.clientY;
      yaw += dx * K;
      if (pressed.type !== "touch") pitch = clamp(pitch - dy * K, -PITCH_MAX, PITCH_MAX);
      var now = performance.now();
      pressed.samples.push({ t: now, x: e.clientX });
      while (pressed.samples.length > 2 && now - pressed.samples[0].t > 100) pressed.samples.shift();
      pressed.max = Math.max(pressed.max, Math.sqrt(Math.pow(e.clientX - pressed.x0, 2) + Math.pow(e.clientY - pressed.y0, 2)));
      apply();
    });
    function end(e, cancelled) {
      if (!pressed || e.pointerId !== pressed.id) return;
      var p = pressed;
      pressed = null;
      host.classList.remove("is-dragging");
      if (!cancelled) {
        var d = Math.max(p.max, Math.sqrt(Math.pow(e.clientX - p.x0, 2) + Math.pow(e.clientY - p.y0, 2)));
        var thr = p.type === "touch" ? 8 : 4;
        if (d <= thr) {
          if (p.i >= 0) { go(p.i); return; }
        } else if (!reduced()) {
          /* 惯性：最后100ms的平均速度 */
          var s = p.samples, a = s[0], b = s[s.length - 1];
          var span = (b.t - a.t) / 1000;
          vel = span > 0.01 ? clamp((b.x - a.x) * K / span, -6, 6) : 0;
        }
      }
      kick();
    }
    host.addEventListener("pointerup", function (e) { end(e, false); });
    host.addEventListener("pointercancel", function (e) { end(e, true); });
    /* 拖的时候别让浏览器把字选上、拖出图片 */
    host.addEventListener("dragstart", function (e) { e.preventDefault(); });

    /* 悬停（只在有悬停的细指针设备上）：停转、那颗浮出放大一点、下面显示全名 */
    if (fine) {
      ball.addEventListener("pointerover", function (e) {
        if (e.pointerType !== "mouse" || pressed) return;
        var pt = e.target.closest ? e.target.closest(".gl-pt") : null;
        if (!pt) return;
        var j = +pt.getAttribute("data-i");
        if (j === hovering) return;
        if (hovering >= 0) pts[hovering].el.classList.remove("is-hover");
        hovering = j;
        pt.classList.add("is-hover");
        setCap(j);
        apply();
        kick();
      });
      ball.addEventListener("pointerout", function (e) {
        if (e.pointerType !== "mouse" || hovering < 0) return;
        var to = e.relatedTarget;
        if (to && to.closest && to.closest(".gl-pt") && ball.contains(to)) return;
        pts[hovering].el.classList.remove("is-hover");
        hovering = -1;
        setCap(kbd ? sel : -1);
        apply();
        kick();
      });
    }

    /* ---- 键盘：一个Tab位，←→ 换选中、转到正面、播报；Enter 打开 ---- */
    function pick(j, speak) {
      sel = (j + N) % N;
      kbd = true;
      markSel();
      rotateTo(sel);
      setCap(sel);
      apply();
      if (speak) {
        var it2 = globeItems[sel];
        announce(pageTitle(it2.p) + "：" + it2.t + "（" + (sel + 1) + "／" + N + "）");
      }
    }
    host.addEventListener("focus", function () {
      var vis = true;
      try { vis = host.matches(":focus-visible"); } catch (err) { vis = true; }
      if (!vis) return;               /* 鼠标点进来的焦点不算「键盘选中」，不然拖完它一直停着不转 */
      pick(sel >= 0 ? sel : frontMost(), false);
      kick();
    });
    host.addEventListener("blur", function () {
      kbd = false;
      markSel();
      setCap(hovering);
      apply();
      kick();
    });
    host.addEventListener("keydown", function (e) {
      if (composing(e)) return;
      var k = e.key;
      if (k === "Enter") {
        if (sel >= 0 && kbd) { e.preventDefault(); go(sel); }
        return;
      }
      var next = null;
      if (k === "ArrowRight") next = sel + 1;
      else if (k === "ArrowLeft") next = sel - 1;
      else if (k === "Home") next = 0;
      else if (k === "End") next = N - 1;
      if (next === null) return;
      e.preventDefault();
      if (sel < 0 || !kbd) next = sel >= 0 ? sel : frontMost();
      pick(next, true);
    });

    /* ---- 只在看得见时跑：星球进出视口、页面前后台；舞台滚走时星点也停闪 ---- */
    var heroSeen = true;
    function still() { hero.classList.toggle("is-still", !heroSeen || doc.hidden); }
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (list) {
        each(list, function (en) {
          if (en.target === host) { visible = en.isIntersecting; if (visible) kick(); }
          else { heroSeen = en.isIntersecting; still(); }
        });
      });
      io.observe(host);
      io.observe(hero);
    }
    doc.addEventListener("visibilitychange", function () { still(); if (!doc.hidden) kick(); });
    onMq(mqReduce, function () {
      if (reduced()) { spin = 0; vel = 0; if (target) { yaw = target.yaw; pitch = target.pitch; target = null; } apply(); }
      kick();
    });
    if (window.ResizeObserver) new ResizeObserver(function () { measure(); apply(); }).observe(host);
    else window.addEventListener("resize", function () { measure(); apply(); });

    measure();
    apply();
    /* 首帧画好再整颗淡入（.is-live 之前星点是透明的，也还不能拖） */
    window.requestAnimationFrame(function () { host.classList.add("is-live"); });
    kick();
  })();

  /* ---- 随便翻一条（c-button 主按钮）：链接，href 在星上那些条目里随机挑；回到本页时重挑 ---- */
  (function initRandom() {
    var a = $("[data-random]");
    if (!a || !globeItems.length) return;
    function roll() { a.setAttribute("href", globeItems[Math.floor(Math.random() * globeItems.length)].f); }
    roll();
    /* 新标签页打开（Ctrl / ⌘ / Shift / 中键）：本页留着，下一次换一条 */
    a.addEventListener("click", function (e) { if (e.ctrlKey || e.metaKey || e.shiftKey) setTimeout(roll, 0); });
    a.addEventListener("auxclick", function () { setTimeout(roll, 0); });
    window.addEventListener("pageshow", function (e) { if (e.persisted) roll(); });
  })();

  /* ---- 本书进度（ix-sheet-ring）：圆环与中心数字都是「已上线的章 / 全部章」 ---- */
  function chapterCount(p) {
    if (typeof p.count === "number") return p.count;
    if (p.id === "collection" && SEARCH) return SEARCH.items.filter(function (it) { return it.p === "collection"; }).length;
    return null;
  }
  function buildProgress(body) {
    var chapters = NAV.pages.filter(function (p) { return p.id !== "index"; });   /* 总览不算一章：总览 + 10章 */
    var ready = chapters.filter(function (p) { return p.ready; });
    KIT.ring(body, {
      value: ready.length, max: chapters.length,
      unit: "章已上线 · 共" + chapters.length + "章",
      label: "已上线" + ready.length + "章，共" + chapters.length + "章"
    });
    var total = 0;
    var parts = [];
    ready.forEach(function (p) {
      var n = chapterCount(p);
      if (n === null) return;
      total += n;
      parts.push(p.title + n);
    });
    var sum = doc.createElement("p");
    sum.className = "pg-sum";
    /* 全部上线时不写「其余0章还没写」 */
    sum.textContent = ready.length === chapters.length
      ? chapters.length + "章都已上线，共收" + total + "条：" + parts.join("、") + "。"
      : "上线的" + ready.length + "章共收" + total + "条：" + parts.join("、") + "。其余" + (chapters.length - ready.length) +
        "章还没写，导航里标「" + NAV.pendingLabel + "」。";
    body.appendChild(sum);
    var html = "";
    NAV.groups.forEach(function (g) {
      chapters.forEach(function (p) {
        if (p.group !== g) return;
        var block = '<span class="ico" style="background:' + p.tint + '">' + NAV.icon(p.icon) + '</span><span class="t"><b></b><small></small></span>';
        if (p.ready) {
          var n = chapterCount(p);
          html += '<li><a class="row" href="' + p.file + '" data-pg="' + p.id + '">' + block + '<span class="badge is-ready">已上线' +
            (n === null ? "" : " · " + n + "条") + '</span><span class="chev">' + NAV.icon("chevron") + "</span></a></li>";
        } else {
          html += '<li><span class="row" role="link" aria-disabled="true" data-pg="' + p.id + '">' + block + '<span class="badge">' + NAV.pendingLabel + "</span></span></li>";
        }
      });
    });
    var list = doc.createElement("ul");
    list.className = "list pg-list";
    list.setAttribute("aria-label", "各章状态");
    list.innerHTML = html;
    each(list.querySelectorAll("[data-pg]"), function (row) {
      var p = pageOf(row.getAttribute("data-pg"));
      row.querySelector(".t b").textContent = p.title;
      row.querySelector(".t small").textContent = p.sub;
    });
    body.appendChild(list);
  }

  /* ---- 更新记录（ix-sheet-ruler）：53周刻度尺 + 按版本列更新 ---- */
  /* 与 kit.js 刻度尺同一算法：1月1日算第1周，每7天一格 */
  function weekOf(d) {
    var day = Math.round((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(d.getFullYear(), 0, 1)) / 864e5) + 1;
    return Math.floor((day - 1) / 7) + 1;
  }
  function parseDay(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ""));
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }
  /* 每条先露到第一个句号（含）；句号在40字以后、或没有句号，就露前40字 */
  function firstSentence(s) {
    var i = s.indexOf("。");
    if (i >= 0 && i < 40) return { head: s.slice(0, i + 1), rest: s.slice(i + 1), cut: false };
    if (s.length <= 40) return { head: s, rest: "", cut: false };
    return { head: s.slice(0, 40), rest: s.slice(40), cut: true };
  }
  var upSeq = 0;
  function buildUpdates(body) {
    var U = window.STAR_UPDATES && window.STAR_UPDATES.length ? window.STAR_UPDATES : [];
    var now = new Date();
    var nowWeek = weekOf(now);
    var marks = [];
    var latest = null;
    U.forEach(function (v) {
      var d = parseDay(v.date);
      if (d) {
        if (d.getFullYear() === now.getFullYear()) marks.push({ week: weekOf(d), level: 3, label: v.v + "（" + v.date + "）" });
        latest = v;      /* 数据从早到晚排，最后一个有日期的就是最近一次发布 */
      } else {
        marks.push({ week: nowWeek, level: 2, label: v.v + "（本周进行中）" });
      }
    });
    var code = latest ? latest.v : "未发布";
    var ruler = KIT.ruler(body, { weeks: 53, today: now, marks: marks, text: code, textLabel: latest ? "最近发布的版本" : "版本" });
    /* 编号槽按等宽数字的 .62em 占位：汉字要一整格，不然被裁掉一半 */
    each(ruler.el.querySelectorAll(".kit-ch-real"), function (r) {
      if (/[^\x00-\x7f]/.test(r.textContent)) r.parentNode.style.width = "1em";
    });
    var wrap = doc.createElement("div");
    wrap.className = "up-vers";
    if (!U.length) {
      wrap.innerHTML = '<p class="up-note">更新记录没读到（data/updates.js）。</p>';
      body.appendChild(wrap);
      return;
    }
    U.slice().reverse().forEach(function (v) {
      var sec = doc.createElement("section");
      sec.className = "up-ver";
      var d = parseDay(v.date);
      var h3 = doc.createElement("h3");
      var b = doc.createElement("b");
      b.textContent = v.v;
      var meta = doc.createElement("span");
      meta.textContent = d ? v.date + " · 第" + weekOf(d) + "周" : "本周进行中 · 第" + nowWeek + "周";
      h3.appendChild(b);
      h3.appendChild(meta);
      sec.appendChild(h3);
      if (v.note) {
        var note = doc.createElement("p");
        note.className = "up-note";
        note.textContent = v.note;
        sec.appendChild(note);
      }
      (v.groups || []).forEach(function (g) {
        var gh = doc.createElement("h4");
        gh.className = "up-g";
        gh.textContent = g.name;
        sec.appendChild(gh);
        var ul = doc.createElement("ul");
        ul.className = "up-items";
        (g.items || []).forEach(function (text) {
          var li = doc.createElement("li");
          var p = doc.createElement("p");
          var fs = firstSentence(String(text));
          var head = doc.createElement("span");
          head.className = "up-head";
          head.textContent = fs.head;
          p.appendChild(head);
          if (fs.rest) {
            var id = "up-rest-" + (++upSeq);
            var dots = doc.createElement("span");
            dots.className = "up-dots";
            dots.setAttribute("aria-hidden", "true");
            dots.textContent = fs.cut ? "…" : "";
            var rest = doc.createElement("span");
            rest.className = "up-rest";
            rest.id = id;
            rest.hidden = true;
            rest.textContent = fs.rest;
            var btn = doc.createElement("button");
            btn.type = "button";
            btn.className = "up-more";
            btn.setAttribute("aria-expanded", "false");
            btn.setAttribute("aria-controls", id);
            btn.textContent = "展开";
            p.appendChild(dots);
            p.appendChild(rest);
            p.appendChild(btn);
          }
          li.appendChild(p);
          ul.appendChild(li);
        });
        sec.appendChild(ul);
      });
      wrap.appendChild(sec);
    });
    /* 原地展开：首句留在原处，后文接着淡入；按钮跟到全文末尾、焦点不动 */
    wrap.addEventListener("click", function (e) {
      var btn = e.target.closest ? e.target.closest(".up-more") : null;
      if (!btn) return;
      var rest = doc.getElementById(btn.getAttribute("aria-controls"));
      if (!rest) return;
      var open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.textContent = open ? "收起" : "展开";
      rest.hidden = !open;
      var dots = rest.previousSibling;
      if (dots && dots.className === "up-dots") dots.hidden = open;
    });
    body.appendChild(wrap);
  }

  /* 两个弹层第一次点开时才建（「今天」按打开那一刻算）；弹层开着时星球停转，关了接着转 */
  function sheetButton(sel, opts) {
    var btn = $(sel);
    if (!btn) return;
    if (!KIT || !NAV) { btn.hidden = true; return; }
    var s = null;
    btn.addEventListener("click", function () {
      if (!s) s = KIT.sheet({ title: opts.title, kind: opts.kind, build: opts.build, onClose: function () { setTimeout(globeKick, 0); } });
      s.open(btn);
    });
  }
  sheetButton("[data-open-progress]", { title: "本书进度", kind: "ring", build: buildProgress });
  sheetButton("[data-open-updates]", { title: "更新记录", kind: "ruler", build: buildUpdates });

  /* ---- 接着看（ix-resume）：要么续上并写清续到哪，要么点之前就写明从头开始 ---- */
  function two(n) { return (n < 10 ? "0" : "") + n; }
  function sameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
  function ago(at) {
    if (typeof at !== "number" || !isFinite(at)) return "";
    var nowMs = Date.now();
    var mins = Math.floor((nowMs - at) / 60000);
    if (mins < 1) return "刚刚";
    if (mins < 60) return mins + "分钟前";
    var d = new Date(at), n = new Date(nowMs);
    var hm = d.getHours() + ":" + two(d.getMinutes());
    if (sameDay(d, n)) return "今天" + hm;
    if (sameDay(d, new Date(n.getFullYear(), n.getMonth(), n.getDate() - 1))) return "昨天" + hm;
    return (d.getFullYear() === n.getFullYear() ? "" : d.getFullYear() + "年") + (d.getMonth() + 1) + "月" + d.getDate() + "日";
  }
  (function initResume() {
    var box = $("[data-resume]");
    if (!box || !NAV) return;
    var link = $("[data-resume-link]", box);
    var title = $("[data-resume-title]", box);
    var sub = $("[data-resume-sub]", box);
    var when = $("[data-resume-when]", box);
    var ico = $("[data-resume-ico]", box);
    function paint(pg, href, t, s, w) {
      link.setAttribute("href", href);
      title.textContent = t;
      sub.textContent = s;
      when.textContent = w || "";
      when.hidden = !w;
      ico.style.background = pg.tint;
      ico.innerHTML = NAV.icon(pg.icon);
    }
    function render() {
      var rec = null;
      try { rec = JSON.parse(window.localStorage.getItem("star-last") || "null"); } catch (e) { rec = null; }
      var pg = rec && typeof rec.p === "string" ? pageOf(rec.p) : null;
      if (!pg || !pg.ready || pg.id === "index" || !rec.id || typeof rec.id !== "string") {
        var first = pageOf("color") || NAV.pages[1];
        paint(first, first.file, "从" + first.title + "开始", "还没有看过的记录，点了从" + first.title + "第一条开始", "");
        return;
      }
      var f = pg.file + "#" + rec.id;
      var it = null;
      if (SEARCH) for (var i = 0; i < SEARCH.items.length; i++) if (SEARCH.items[i].f === f) { it = SEARCH.items[i]; break; }
      if (SEARCH && !it) {
        /* 记的那条已经不在了（改过名、删了）：写明会从这一章开头看 */
        paint(pg, pg.file, "从" + pg.title + "开始", "上次看的「" + (rec.t || "那一条") + "」已经不在了，点了从" + pg.title + "第一条开始", "");
        return;
      }
      var name = it ? shortName(it) : String(rec.t || "");
      paint(pg, f, "接着看：" + pg.title + " › " + name, it ? it.t : String(rec.t || ""), ago(rec.at));
    }
    render();
    window.addEventListener("pageshow", function (e) { if (e.persisted) render(); });
  })();

  /* ================================================================
   * 二、「屋主的审美原则」十条旁边的对比小样
   * ================================================================ */

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
