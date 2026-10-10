/*
 * nav.js —— 全站导航只在这里定义一次
 *
 * 用法：每页 <body> 里紧跟 skip 链接写
 *   <div id="shell-nav"></div><script src="assets/nav.js"></script>
 * 同步执行，把占位换成这几样东西（都是 <body> 的直接子元素）：
 *   aside.side      侧栏（>900）/ 顶栏（≤900）——磨砂玻璃；品牌下方是搜索框（>900），≤900 换成品牌右边的搜索按钮
 *   nav.tabbar      底部 tab bar（≤600）——磨砂玻璃，position:fixed
 *   .more-scrim     「更多」面板的遮罩（.scrim-frost：按模糊档位糊开或压暗）
 *   .more-panel     「更多」面板（搜索入口 + 其余章节 + 外观控件）——position:fixed
 *   .search-scrim / #search-sheet   ≤900 的整页搜索浮层（遮罩 + 顶上一条玻璃面板）。搜索框本身只有一份（侧栏里那个），
 *                   star.js 打开浮层时把它搬进面板、关了搬回去，两处的字和标签天然一致
 *   #star-search-pop  搜索结果（里面的 ul 是 role=listbox），position:fixed 贴着输入框；≤900 浮层开着时 star.js 把它搬进浮层面板
 * tab bar、更多面板、搜索浮层与结果列表都**不能**放进侧栏：侧栏带 backdrop-filter（还有 overflow），
 * 祖先有 backdrop-filter / filter / transform 时 position:fixed 会改以那个祖先为参照，手机上滚到中途才露馅。
 *
 * 外观控件（侧栏底部、「更多」面板各一份，star.js 同步）：外观分段、六个色点、「背景模糊」分段（自动 / 开 / 关）、
 * 「恢复默认」小按钮。几处带 data-spot（theme / accent / blur / reset / search），给「本站这里在用」的跳转点亮用。
 *
 * 当前页取自 <body data-page="...">，对应下面 PAGES 的 id。
 * 新增一页：在 PAGES 里改 ready:true（并确认文件存在）；条目数变了同一轮改 count（star.js 会在控制台提醒对不上）。
 * 同时暴露 window.STAR_NAV（页面清单 + 图标），总览页的章节目录、star.js 的 favicon 都从这里取，不另抄一份。
 */
(function () {
  var VERSION = "0.4.2";

  /* 图标：24×24 视窗，线条 stroke 1.9、圆头圆角（SPEC §5b）；颜色一律 currentColor。
     只有本来就是实心的形（「更多」的三个点）用填充。 */
  var ICONS = {
    overview: '<rect x="4" y="4" width="6.6" height="6.6" rx="1.8"/><rect x="13.4" y="4" width="6.6" height="6.6" rx="1.8"/><rect x="4" y="13.4" width="6.6" height="6.6" rx="1.8"/><rect x="13.4" y="13.4" width="6.6" height="6.6" rx="1.8"/>',
    color: '<path d="M12 3.6a8.4 8.4 0 1 0 0 16.8c1.1 0 1.8-.8 1.8-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.8-1.7 1.7-1.7h2.1a3.8 3.8 0 0 0 3.8-3.8C20.4 6.9 16.6 3.6 12 3.6z"/><circle cx="7.6" cy="11.4" r="1.15" fill="currentColor" stroke="none"/><circle cx="9.7" cy="7.6" r="1.15" fill="currentColor" stroke="none"/><circle cx="14.2" cy="7.3" r="1.15" fill="currentColor" stroke="none"/>',
    type: '<path d="M3.6 19 8.6 5.4 13.6 19"/><path d="M5.4 14.4h6.4"/><circle cx="17.6" cy="15.7" r="3"/><path d="M20.6 12.6V19"/>',
    layout: '<rect x="3.6" y="4.6" width="16.8" height="14.8" rx="2.6"/><path d="M9.2 4.6v14.8"/><path d="M12.6 9.2h4.6M12.6 12.8h3"/>',
    material: '<path d="M12 4.2 20.2 8.6 12 13 3.8 8.6z"/><path d="m3.8 12.4 8.2 4.4 8.2-4.4"/><path d="m3.8 16.2 8.2 4.4 8.2-4.4"/>',
    interaction: '<path d="M6.8 4.4v13.4l3.5-3.2 2.5 5.4 2.4-1.1-2.5-5.3h4.8z"/>',
    motion: '<circle cx="15" cy="12" r="5"/><path d="M3.4 8.8h4.2M2.6 12h5M3.4 15.2h4.2"/>',
    cube: '<path d="M12 3.6 19.6 7.8v8.4L12 20.4 4.4 16.2V7.8z"/><path d="M4.4 7.8 12 12l7.6-4.2"/><path d="M12 12v8.4"/>',
    rejected: '<circle cx="12" cy="12" r="8.4"/><path d="m6.1 6.1 11.8 11.8"/>',
    method: '<path d="m4.6 7.4 1.7 1.7 3-3.2"/><path d="m4.6 15.4 1.7 1.7 3-3.2"/><path d="M12.4 8h7M12.4 16h7"/>',
    heart: '<path d="M12 19.6s-7.6-4.5-7.6-10.1A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 7.6 2.5c0 5.6-7.6 10.1-7.6 10.1z"/>',
    more: '<circle cx="6" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1.6" fill="currentColor" stroke="none"/>',
    chevron: '<path d="m9.8 6.2 5.8 5.8-5.8 5.8"/>',
    search: '<circle cx="10.8" cy="10.8" r="6.4"/><path d="m15.6 15.6 4.2 4.2"/>',
    arrow: '<path d="M5 12h13.4"/><path d="m13 6.6 5.4 5.4-5.4 5.4"/>',
    hash: '<path d="M9.6 4.4 7.8 19.6M16.2 4.4l-1.8 15.2M5 9.2h14.4M4.2 14.8h14.4"/>',
    reset: '<path d="M4.8 12a7.2 7.2 0 1 0 2.1-5.1"/><path d="M4.6 4.6v4.2h4.2"/>',
    close: '<path d="m6.6 6.6 10.8 10.8M17.4 6.6 6.6 17.4"/>',
    copy: '<rect x="8.6" y="8.6" width="11" height="11" rx="2.4"/><path d="M15.4 8.6V6.3a1.8 1.8 0 0 0-1.8-1.8H6.3a1.8 1.8 0 0 0-1.8 1.8v7.3a1.8 1.8 0 0 0 1.8 1.8h2.3"/>',
    check: '<path d="m5 12.6 4.4 4.4L19 7.4"/>',
    alert: '<path d="M12 4.8 20.6 19.2H3.4z"/><path d="M12 10.2v4.2"/><path d="M12 16.9v.01"/>',
    doc: '<path d="M7.4 3.6h6.2L18 8v10.9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 18.9V5.1a1.5 1.5 0 0 1 1.4-1.5z"/><path d="M13.4 3.6v4.6H18"/><path d="M9 12.6h6M9 16h4"/>',
    /* 品牌：一叠扇形展开的色卡（后一张向左转 20°，只露出左缘与圆角）+ 前一张端正的色卡，上半色块里一颗五角星。
       星的外接框在色块里上下居中（圆心下移 0.0955R 抵掉五角星上尖下平的偏差），内外半径比 0.5，圆角接头；
       后卡线条与前卡左缘留 1.2 的缝，读得出前后。整组外接框在 24 视窗里居中。 */
    brand: '<path d="M7.9 16.31 4.9 8.4A2.6 2.6 0 0 1 6.42 5.08L7.9 4.55"/><rect x="9.1" y="3.8" width="10" height="16.4" rx="2.6"/><path d="M9.1 15.4h10"/><path d="M14.1 6.62 15.07 8.58 17.24 8.9 15.67 10.43 16.04 12.58 14.1 11.57 12.16 12.58 12.53 10.43 10.96 8.9 13.13 8.58z"/>'
  };

  function icon(name, cls) {
    return '<svg class="' + (cls || "i") + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[name] || "") + "</svg>";
  }

  var GROUPS = ["开始", "做法", "避坑", "收藏"];

  /* ready：这一轮文件存在、可点；tab：≤600 底部 tab bar 里的四项（第五项固定是「更多」）；
     tint：总览页分组列表里 32px 方块图标的底色（分类色，不随强调色变）；count：页面里 .entry 的条数。
     收藏页不写 count：它的卡片是 collection.js 按数据画的 .col-card，不是 .entry，写了自检会报假 warn（条数看 data/collection.js）。 */
  var PAGES = [
    { id: "index", file: "index.html", title: "总览", group: "开始", icon: "overview", tint: "#007AFF", sub: "怎么用这本合集、两种气质、屋主的审美原则", ready: true, tab: true },
    { id: "color", file: "color.html", title: "色彩", group: "做法", icon: "color", tint: "linear-gradient(135deg,#FF9500,#FF2D55 55%,#AF52DE)", sub: "玻璃风色板、强调色两档、光晕、对比度；小屋暖纸与身份色", ready: true, tab: true, count: 17 },
    { id: "type", file: "type.html", title: "排版", group: "做法", icon: "type", tint: "#FF9500", sub: "字体栈、字阶、行宽、中英文空格、楷书巨字", ready: true, count: 16 },
    { id: "layout", file: "layout.html", title: "布局与自适应", group: "做法", icon: "layout", tint: "#30B0C7", sub: "骨架、clamp、大屏等比放大、断点、dvh", ready: true, count: 17 },
    { id: "material", file: "material.html", title: "材质", group: "做法", icon: "material", tint: "#8E8E93", sub: "液态玻璃写法与降级、磨砂放在哪、暖墨阴影", ready: true, count: 11 },
    { id: "interaction", file: "interaction.html", title: "交互", group: "做法", icon: "interaction", tint: "#AF52DE", sub: "分组列表、主题切换、自动保存、输入法、Esc、弹窗", ready: true, tab: true, count: 27 },
    { id: "motion", file: "motion.html", title: "动画", group: "做法", icon: "motion", tint: "#00C7BE", sub: "曲线与时长、FLIP、减弱动效、手写开场", ready: true, count: 17 },
    { id: "3d", file: "3d.html", title: "3D与性能", group: "做法", icon: "cube", tint: "#A2845E", sub: "叠加不替换、两段式探测、看门狗、停稳重画", ready: true, count: 12 },
    { id: "rejected", file: "rejected.html", title: "否掉的方向", group: "避坑", icon: "rejected", tint: "#FF3B30", sub: "按时间线：否掉了什么、原话、为什么不是那样", ready: true, count: 10 },
    { id: "method", file: "method.html", title: "做网站的方法", group: "避坑", icon: "method", tint: "#34C759", sub: "验收档位、先量后截图、防假信号、测试静音", ready: true, count: 25 },
    { id: "collection", file: "collection.html", title: "收藏", group: "收藏", icon: "heart", tint: "#FF2D55", sub: "好看的skill、有意思的项目、提示词、老站特效", ready: true, tab: true }
  ];

  /* 待建页（ready:false）在导航上标的字。0.4.0 起十章全部上线、没有页面用到它；留着给以后新加的章 */
  var PENDING_LABEL = "下一轮补";
  var body = document.body;
  var current = body ? body.getAttribute("data-page") : "";

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }

  /* 侧栏 / 顶栏里的一项。待建页不是链接：没有 href、不进 tab 序列，读屏读作「链接，不可用」。 */
  function navItem(p) {
    var inner = '<span class="nav-ic">' + icon(p.icon) + '</span><span class="nav-text">' + esc(p.title) + "</span>";
    if (!p.ready) {
      return '<li class="is-pending"><a class="nav-item" role="link" aria-disabled="true">' + inner +
        '<span class="nav-tag">' + PENDING_LABEL + "</span></a></li>";
    }
    var cur = p.id === current ? ' aria-current="page"' : "";
    return '<li><a class="nav-item" href="' + p.file + '"' + cur + ">" + inner + "</a></li>";
  }

  /* 外观控件：侧栏底部一份、「更多」面板一份，两份由 star.js 同步。n 用来区分 id；tail 放在「恢复默认」同一行的右边
     （侧栏传版本号：屋主台式 2040×1019 等比放大后侧栏很挤，少一行是一行）。
     「背景模糊」那组的「自动」和外观的「自动」同名，所以这一行的标签是看得见的（另两行的标签只给读屏）。 */
  function themeControls(n, tail) {
    var modes = [["light", "浅色"], ["dark", "深色"], ["auto", "自动"]];
    var accents = [["blue", "蓝"], ["green", "绿"], ["indigo", "靛"], ["orange", "橙"], ["pink", "粉"], ["teal", "青"]];
    var blurs = [["auto", "自动"], ["on", "开"], ["off", "关"]];
    var h = '<div class="theme" data-theme-controls>';
    h += '<div class="theme-row"><span class="theme-label" id="mode-label-' + n + '">外观</span>';
    h += '<div class="seg" role="radiogroup" aria-labelledby="mode-label-' + n + '" data-spot="theme">';
    for (var i = 0; i < modes.length; i++) {
      h += '<button type="button" role="radio" data-mode-set="' + modes[i][0] + '" aria-checked="false" tabindex="-1">' + modes[i][1] + "</button>";
    }
    h += "</div></div>";
    h += '<div class="theme-row"><span class="theme-label" id="accent-label-' + n + '">强调色</span>';
    h += '<div class="dots" role="group" aria-labelledby="accent-label-' + n + '" data-spot="accent">';
    for (var j = 0; j < accents.length; j++) {
      h += '<button type="button" class="dot" data-accent-set="' + accents[j][0] + '" aria-pressed="false" aria-label="' + accents[j][1] + '">' +
        '<span class="dot-name" aria-hidden="true">' + accents[j][1] + "</span></button>";
    }
    h += "</div></div>";
    h += '<div class="theme-row theme-row-blur"><span class="theme-label is-shown" id="blur-label-' + n + '">背景模糊</span>';
    h += '<div class="seg seg-sm" role="radiogroup" aria-labelledby="blur-label-' + n + '" data-spot="blur">';
    for (var b = 0; b < blurs.length; b++) {
      h += '<button type="button" role="radio" data-blur-set="' + blurs[b][0] + '" aria-checked="false" tabindex="-1">' + blurs[b][1] + "</button>";
    }
    h += "</div></div>";
    h += '<div class="theme-foot"><button type="button" class="theme-reset" data-theme-reset data-spot="reset">' + icon("reset") + "<span>恢复默认</span></button>" + (tail || "") + "</div>";
    h += "</div>";
    return h;
  }

  /* 搜索框：只有这一份（侧栏品牌下方）。≤900 时侧栏里这一格藏起来，star.js 打开整页浮层时把整个 form 搬过去。
     结果列表挂 body（见下面 #star-search-pop），id 写死给 aria-controls 用。 */
  function searchField() {
    return '<div class="side-search" data-search-home><form class="search-field" role="search" autocomplete="off" data-spot="search">' +
      '<span class="search-ic" aria-hidden="true">' + icon("search") + "</span>" +
      '<input class="search-input" id="star-search" type="text" role="combobox" aria-autocomplete="list" aria-expanded="false" ' +
      'aria-controls="star-search-list" aria-label="搜索全站" aria-describedby="star-search-help" placeholder="搜索全站" enterkeyhint="search" autocomplete="off" spellcheck="false">' +
      '<kbd class="search-kbd" aria-hidden="true">/</kbd>' +
      '<span class="sr-only" id="star-search-help">输入#联想标签；上下键选结果，回车打开，Esc一下退一层</span>' +
      "</form></div>";
  }

  function brandIcon() {
    return '<span class="brand-icon" aria-hidden="true">' + icon("brand", "brand-svg") + "</span>";
  }

  /* ---- 侧栏 ---- */
  var side = '<aside class="side" aria-label="站点导航"><a class="brand" href="index.html">' + brandIcon() +
    '<span class="brand-text"><b>设计合集</b><span>Ysevan的审美与做法</span></span></a>';
  side += '<button type="button" class="top-search" data-search-open aria-haspopup="dialog" aria-expanded="false" aria-controls="search-sheet" aria-label="搜索全站">' +
    icon("search") + "</button>";
  side += searchField();
  side += '<nav class="side-nav" aria-label="章节">';
  for (var g = 0; g < GROUPS.length; g++) {
    var items = "";
    for (var k = 0; k < PAGES.length; k++) if (PAGES[k].group === GROUPS[g]) items += navItem(PAGES[k]);
    side += '<div class="side-sec"><h2 class="side-group">' + GROUPS[g] + '</h2><ul class="side-list">' + items + "</ul></div>";
  }
  side += "</nav>";
  side += '<button type="button" class="top-more" data-more-toggle aria-haspopup="dialog" aria-expanded="false" aria-controls="more-panel">' +
    icon("more") + '<span>更多</span></button>';
  side += '<div class="side-foot">' + themeControls(1, '<span class="side-ver">v' + VERSION + " · Ysevan</span>") + "</div></aside>";

  /* ---- 底部 tab bar ---- */
  var tab = '<nav class="tabbar" aria-label="快捷导航">';
  for (var t = 0; t < PAGES.length; t++) {
    var p = PAGES[t];
    if (!p.tab) continue;
    tab += '<a class="tab" href="' + p.file + '"' + (p.id === current ? ' aria-current="page"' : "") + ">" + icon(p.icon) + "<span>" + esc(p.title) + "</span></a>";
  }
  tab += '<button type="button" class="tab" data-more-toggle aria-haspopup="dialog" aria-expanded="false" aria-controls="more-panel">' + icon("more") + "<span>更多</span></button></nav>";

  /* ---- 「更多」面板：tab bar 以外的章节 + 外观 ---- */
  var more = '<div class="more-scrim scrim-frost"></div><div class="more-panel" id="more-panel" role="dialog" aria-modal="true" aria-labelledby="more-title" hidden>';
  more += '<div class="more-head"><h2 class="more-title" id="more-title">更多</h2><button type="button" class="more-close" data-more-close aria-label="关闭">' + icon("close") + "</button></div>";
  /* ≤600 顶栏随页面滚走、搜索按钮跟着走了：面板顶上再放一个入口 */
  more += '<button type="button" class="more-search" data-search-open aria-haspopup="dialog" aria-controls="search-sheet">' +
    icon("search") + '<span>搜索全站</span><kbd aria-hidden="true">/</kbd></button>';
  more += '<h3 class="more-sub">其余章节</h3><ul class="more-list">';
  for (var m = 0; m < PAGES.length; m++) {
    var q = PAGES[m];
    if (q.tab) continue;
    var block = '<span class="ico" style="background:' + q.tint + '">' + icon(q.icon) + '</span><span class="t"><b>' + esc(q.title) + "</b><small>" + esc(q.sub) + "</small></span>";
    if (q.ready) more += '<li><a class="row" href="' + q.file + '"' + (q.id === current ? ' aria-current="page"' : "") + ">" + block + '<span class="chev">' + icon("chevron") + "</span></a></li>";
    else more += '<li><span class="row" role="link" aria-disabled="true">' + block + '<span class="badge">' + PENDING_LABEL + "</span></span></li>";
  }
  more += '</ul><h3 class="more-sub">外观</h3>' + themeControls(2) + '<p class="more-ver">v' + VERSION + " · Ysevan</p></div>";

  /* ---- ≤900 的整页搜索浮层 + 结果列表（两处共用一个列表）---- */
  var search = '<div class="search-scrim scrim-frost" data-search-close></div>' +
    '<div class="search-sheet" id="search-sheet" role="dialog" aria-modal="true" aria-label="搜索全站">' +
    '<div class="search-slot"></div><button type="button" class="search-cancel" data-search-close>取消</button></div>' +
    '<div class="search-pop" id="star-search-pop" hidden><p class="search-note" hidden></p>' +
    '<ul class="search-list" id="star-search-list" role="listbox" aria-label="搜索结果"></ul><p class="search-foot" hidden></p></div>';

  var html = side + tab + more + search;
  var holder = document.getElementById("shell-nav");
  if (holder) {
    holder.insertAdjacentHTML("beforebegin", html);
    holder.parentNode.removeChild(holder);
  } else if (body) {
    body.insertAdjacentHTML("afterbegin", html);
  }

  window.STAR_NAV = {
    version: VERSION,
    groups: GROUPS.slice(),
    pages: PAGES,
    current: current,
    pendingLabel: PENDING_LABEL,
    icons: ICONS,
    icon: icon
  };
})();
