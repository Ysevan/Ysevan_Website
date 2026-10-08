/*
 * star.js —— 外壳行为（defer 加载，每页都有）
 *
 *   1. 外观控件：分段「浅色 / 深色 / 自动」与「背景模糊：自动 / 开 / 关」= role=radiogroup + role=radio + aria-checked
 *      + roving tabindex（←→↑↓ 循环、Home / End）；六个色点 = button + aria-pressed。两份控件（侧栏底部、「更多」面板）同步。
 *      只认 nav.js 画的这两处容器（aside.side 与 #more-panel 里的 [data-theme-controls]）：页面样例里就算写了
 *      data-mode-set / data-accent-set / data-blur-set，也不会改全站外观（这几个属性是外壳保留的，见 star.css 文件头）。
 *      单选组方向键对页面自己的 radiogroup 也生效（移动并 click 选中）；页面自己处理过、调了 preventDefault 的不再重复处理。
 *      切换带过渡（document.startViewTransition）：明暗一变，新画面从点的那个控件处圆形揭开（clip-path circle，420ms，
 *      曲线 cubic-bezier(.25,.5,.3,1)；鼠标取点击点，键盘取控件中心）；强调色走 View Transition 默认的交叉淡入，260ms。
 *      不支持 startViewTransition、减弱动效、模糊档位 lite / off、页面不可见时一律直接切。
 *      为什么是这条曲线和时长：圆盖住的面积随半径平方涨，半径匀速涨看起来是越铺越快、最后一下猛地盖满，所以半径要前快后慢；
 *      但太陡也不行——先试的 cubic-bezier(.32,.72,0,1) 在一半时长时半径已到95%、面积91%，后210ms几乎不动，等于白等。
 *      这条按面积算：1/4 时长盖住30%、一半74%、3/4 95%，从控件处张开得快、铺到远角时慢下来落定，又没有空等。
 *      时长：圆要跨过整条视口对角线（2040 屏上约2300px），比 260ms 的局部过渡长一档，又不到半秒、不拖手。
 *   2. favicon：按当前 --accent / --accent-2 的计算值生成自带渐变底的圆角方块（rx = 边长 22.37%），
 *      data URI 一律 encodeURIComponent（# 不转义会把 URI 从第一个颜色处截断）。
 *   3. 品牌图标可换文件：brand/brand-icon.svg（首选）或 .png 存在时换上，JS 注入 img、load 且 naturalWidth>0 才算
 *      （file:// 下不能 fetch 探测）。仓库自带一份默认 brand-icon.svg（就是内置那枚，按 84% 的放法补了留白），
 *      第一次就命中、不再去找 .png——探测落空时浏览器必记一条网络错误，控制台要零错误。
 *      只换外壳的品牌方块（侧栏里的、以及页面里写了 data-icon="brand" 的）；样例里自己画示意图的 .brand-icon 不动。
 *   4. 代码块「复制」、button[data-copy] 点一下复制：clipboard 失败回落 execCommand，结果走 announce 播报。
 *      [data-copy] 的「已复制」气泡（ix-lightbox 气泡那半）：挂 body、position:fixed，浮在按钮上方、箭头指着按钮中心；
 *      贴视口左右边时整体挪进来、箭头按同一个量反向移（--ax）仍对准按钮；上方被吸顶的顶栏或视口顶挡住就翻到下方。
 *      出现 160ms（opacity + 4px 位移 + scale(.92)→1，原点在箭头那端），1400ms 后淡出 140ms 再删；滚动时跟着按钮走。
 *   5. 「更多」面板：开 / 关、Esc 关（先判合成态）、点遮罩关、Tab 困在面板里、关了焦点还给打开它的按钮。
 *      遮罩是 .scrim-frost（按模糊档位糊开或压暗，见 star.css 文件头）。
 *   6. 页内目录：按 .group-title 与 .entry h3 生成 .page-toc 里的胶囊（DOMContentLoaded 时生成——
 *      晚于所有 defer 脚本，页专属脚本渲染出来的分组也收得到；之后重渲染了可调 StarShell.buildToc()）。
 *   7. [data-chapter-list]：从 nav.js 的 STAR_NAV 画章节分组列表（总览页用）。
 *   8. 条目数自检：页面 .entry 条数与 nav.js 里 count 对不上时在控制台提醒（warn，不是 error）。
 *   9. <span data-icon="chevron"> 这类占位：用 nav.js 同一套图标填进去（页面里不再抄 SVG 路径）。
 *  10. 模糊档位的显卡探测（ix-sheet-frosted 的降级档）：偏好「自动」时按 html[data-blur] 走；没测过时 boot.js 先按 lite。
 *      load 之后空闲时测一次：canvas.getContext("webgl", {failIfMajorPerformanceCaveat:true}) 拿不到＝软件渲染＝没显卡；
 *      拿到的上下文用 WEBGL_lose_context 释放。结果连 UA 存「star-gpu」，UA 变了重测（boot.js 判作废）。
 *  11. 恢复默认外观 + 撤销（ix-confirm「能撤销的不问」）：点了立刻回到浅色、蓝、模糊自动，底部提示条
 *      「已恢复默认外观 · 撤销」，5秒自动收（鼠标停在上面或焦点在里面时暂停计时），点撤销换回之前三项。
 *      提示条挂 body、role=status（页面加载时就在，空着；后插的 live 区有的读屏不播），≤600 在 tab bar 上面。
 *      Esc 关提示条：先判合成态；只在焦点在提示条里、或没有别的层开着时才管。
 *  12. 搜索（ix-suggest、ix-tags、ix-ime、ix-esc、ix-a11y）：
 *      >900 侧栏品牌下方一个搜索框；≤900 顶栏品牌右边一个搜索按钮，点开整页浮层（遮罩按模糊档位，面板顶上一条）；
 *      「更多」面板顶上也有入口（≤600 顶栏随页面滚走）。快捷键「/」与 Ctrl/⌘+K（焦点在输入框、可编辑区时不抢）。
 *      输入框 role=combobox + aria-expanded / aria-controls / aria-activedescendant；结果列表挂 body、fixed 贴着输入框
 *      （≤900 浮层开着时搬进浮层面板里：浮层是 aria-modal，列表在外面读屏读不到，见 popInto）。
 *      最多6条（≤600 5条）、↓ 到末项停住不回卷、↑ 从第0项回到「无」；零结果列「相近的」最多3条；
 *      播报停手400ms只播最后一句（「找到N条，上下键选择」），同一句不重播，收起时清掉待播。
 *      Enter：有当前项打开当前项；没有就打开第一条命中（合成中不算：keydown 先判合成态，表单提交只认 isComposing）。
 *      Esc 一下只退一层：先收列表（字留着）→ 再清空字和标签 → 再离开输入框（浮层模式下关浮层、焦点还给打开它的按钮）。
 *      输入「#」联想已有标签（STAR_SEARCH.tags），选中变成框里的标签胶囊、按标签筛（多个标签取交集）；
 *      框空着按退格删最后一枚，动画照 ix-tags：缩成圆点再消失、后面的依次补位（FLIP）。
 *      数据 window.STAR_SEARCH（data/search-index.js），第一次聚焦 / 悬停 / 快捷键时才注入 <script>；
 *      页面里已经有 STAR_SEARCH 就直接用；没读到给一句「索引没读到」，不抛错。匹配字段：t 标题、n 目录短名、k 标签、
 *      g 分组 / pt 页面名、s 摘要（按这个顺序排名）；结果项 = 标题（命中 <mark>）+ 章节名 + 摘要一行，点或回车跳 item.f。
 *  13. 跳转点亮（「本站这里在用」的落点）：地址是 #spot-名字 时，找 [data-spot~="名字"] 里第一个看得见的；
 *      看不见但在「更多」面板里的（≤900 的外观控件）先打开面板。内置几个不用写属性的：copy / pull / trap / theme /
 *      accent / blur / reset / search / nav / brand / skip / more / pagein（正文页头，mo-page）（见 spotBuiltin）。瞬间滚到视口中间（不平滑，长页会跑偏），
 *      外壳固定 / 吸顶部件只滚到「刚好看得见」；一圈强调色光环亮两下（1.2s；减弱动效改静态描边2秒）。hashchange 也处理，
 *      同一个地址再点一次也亮。带普通 #锚点 打开时 boot.js 先关平滑滚动，这里 load 之后摘掉 data-jump。
 *  14. 按压倾斜（ix-press）：委托在 document 上，作用于 a.row、.list .row 与任何 [data-press]。
 *      行（宽）照刷刷首页列表行那套：鼠标最大1°缩到.985、触屏最大3°缩到.97，透视 = 行高×12，左右倾角按行宽压
 *      （两端位移不超过行高的1/32、1/16）；卡片（[data-press]，或 data-press="card"）照 card 画廊：最大7°、.96、透视900×--u。
 *      按下 140ms cubic-bezier(.2,.8,.2,1)；松手 700ms 弹簧 linear(…)（不认 linear() 退回 cubic-bezier(.34,1.56,.64,1)）；
 *      拖出 6px / pointercancel：160ms 直接回位、不过冲。键盘空格 / 回车 = 按在正中，不倾斜只缩放。WAAPI 只动 transform，
 *      走完就撤掉动画（静止时 computed transform 回到 none）。按在里面的 button / a[href] / summary / input / select /
 *      textarea / .specimen / iframe / [data-press-block] 上不倾（被按的元素本身就是那个链接 / 按钮的除外）；.specimen 里的行不归外壳（样例演示的是它自己的手感），
 *      要外壳接管就写 data-press。减弱动效不做。
 *  15. 长代码下拉展开（ix-sheet-pull）：enhanceCode 里超过14行的 <pre>（样例框外的）先只露前8行，下沿一条虚线＋把手；
 *      拖把手跟手下移带≤2°摆动（2·sin(p·π) + dx·.04，封顶±2°），过40%松手展开、不到弹回（.5s cubic-bezier(.3,1.35,.5,1)；
 *      展开 .45s cubic-bezier(.2,.7,.2,1)）；点把手、空格 / 回车直接展开 / 收起，↓ 展开、↑ 或 Esc 收起；
 *      把手是 button + aria-expanded + aria-controls，名字「展开全部N行代码」；复制按钮永远复制全文。
 *      阈值：十一页样例框外的 <pre> 共137段，行数分布 2–19，超过14行的14段（15–19行：动画7、交互3、布局3、材质1；0.4.0时量）。不往下调：
 *      13行以下收到8行只藏得住5行以内，拉一下换5行不划算；14行以上藏掉的至少和露出来的差不多多。
 *      例外（不只动 transform）：代码块在正文流里，展开必须把下面的内容往下推，所以动的是 .code-clip 的 height
 *      （拖动中每帧一次布局；松手 height 过渡）；把手那一截的摆动是 transform。减弱动效：拖动照样跟手，松手直接到位。
 *  16. 「接着看」记录（ix-resume；显示由总览页做）：滚动停下1.5秒后，把视口里最上面那条 .entry（收藏页 .col-card）
 *      记到 localStorage「star-last」＝{p:页面id, pt:页面名, id, t:标题, at:时间戳}。只记录不显示。
 *  17. 大图上的透明顶栏（ix-oldnav）：页面里有 [data-hero]、视口≤900、它还整条压在顶栏底下时，给 <html> 挂 data-over-hero，
 *      顶栏透明、字和图标改白、不挂模糊（可读性交给大图自己的压暗）；滚过去恢复玻璃。>900 没有顶栏不处理。
 *      判定按布局位置算：扣掉正文 CSS 进场（page-in）此刻的 translateY，开页第一帧就判得对；进场 animationend 再判一次兜底。
 *      第一次判完挂 data-hero-checked（摘掉 star.css 的开页预判），下一帧才挂 hero-live 放开切换过渡：开页不渐变。
 *  18. 切页：正文 .page 的 CSS 进场在 star.css；跨文档 View Transition 新页一侧在 boot.js（pagereveal），
 *      旧页一侧在这里（pageswap）：模糊档位不是 full、减弱动效 → 跳过；≤600 顶栏已经滚出视口就不给它起名。
 *  19. 侧栏导航装不下时（视口比 1440×900 扁，star.css 第19节先收紧了竖向节奏），把当前页那一项滚到看得见（只滚 .side-nav 自己）；601–900的顶栏里导航横排、在自己框里横滑，当前页那项同样横向滚进来。
 *
 * window.StarShell：
 *   buildToc() / enhanceCode(scope) / announce(text) / copy(text) → Promise / closeMore(restoreFocus)
 *   blurTier() → "full" | "lite" | "off"（与 html[data-blur] 同值）
 *   openSearch(fromEl)   打开搜索（>900 聚焦侧栏搜索框；≤900 打开整页浮层），关了焦点还给 fromEl
 *   spot(name)           按名字点亮一个跳转点（不改地址）；返回找到的元素或 null
 *   refreshHero()        页面增删了 [data-hero] 后调一下，重新判顶栏透不透明
 *   resetLook(fromEl)    恢复默认外观（等于点「恢复默认」）
 */
(function () {
  "use strict";
  var doc = document;
  var root = doc.documentElement;
  var T = window.StarTheme;
  var NAV = window.STAR_NAV || null;
  var MODE_LABEL = { light: "浅色", dark: "深色", auto: "自动" };
  var ACCENT_LABEL = { blue: "蓝", green: "绿", indigo: "靛", orange: "橙", pink: "粉", teal: "青" };
  var BLUR_LABEL = { auto: "自动", on: "开", off: "关" };
  var TIER_LABEL = { full: "开（磨砂）", lite: "只压暗、不模糊", off: "关" };
  var EASE_OUT = "cubic-bezier(.2, .8, .2, 1)";
  var EASE_STD = "cubic-bezier(.4, 0, .2, 1)";

  function mm(q) { try { return window.matchMedia(q); } catch (e) { return null; } }
  function onMq(m, fn) {
    if (!m) return;
    if (typeof m.addEventListener === "function") m.addEventListener("change", fn);
    else if (typeof m.addListener === "function") m.addListener(fn);
  }
  var mqReduce = mm("(prefers-reduced-motion: reduce)");
  var mqNarrow = mm("(max-width: 900px)");
  var mqPhone = mm("(max-width: 600px)");
  var mqDark = mm("(prefers-color-scheme: dark)");
  function reduced() { return !!(mqReduce && mqReduce.matches); }
  function narrow() { return !!(mqNarrow && mqNarrow.matches); }
  function phone() { return !!(mqPhone && mqPhone.matches); }
  var canAnimate = typeof Element !== "undefined" && typeof Element.prototype.animate === "function";

  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  function icon(name, cls) { return NAV ? NAV.icon(name, cls) : ""; }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function composing(e) { return !!(e.isComposing || e.keyCode === 229); }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }
  function blurTier() { return T && T.blur ? T.blur() : (root.getAttribute("data-blur") || "lite"); }
  /* kit 的整页弹层开着吗（有 StarKit 时先问它）：外壳的全局 Esc、快捷键让它先，一下只退一层 */
  function kitOpen() {
    try { return !!(window.StarKit && typeof window.StarKit.isOpen === "function" && window.StarKit.isOpen()); } catch (e) { return false; }
  }
  /* 看得见：有盒子、不是 visibility:hidden（[hidden] 与 display:none 的祖先里拿不到盒子） */
  function visible(el) {
    if (!el || !el.getClientRects || !el.getClientRects().length) return false;
    return getComputedStyle(el).visibility !== "hidden";
  }
  function focusNoScroll(el) { if (!el || !el.focus) return; try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } }
  /* 尺寸系数：与 star.css 的 --scale 同一条（1440 以下为 1，封顶 1.45） */
  function scaleU() { return clamp((doc.documentElement.clientWidth || window.innerWidth) / 1440, 1, 1.45); }

  /* ---------- 读屏播报：一个全站共用的 polite 区域，页面加载时就在（后插的 live 区域有的读屏不播） ---------- */
  var live = doc.createElement("div");
  live.className = "sr-only";
  live.id = "star-live";
  live.setAttribute("role", "status");
  live.setAttribute("aria-live", "polite");
  doc.body.appendChild(live);
  var liveTimer = 0;
  function announce(msg) {
    live.textContent = "";
    clearTimeout(liveTimer);
    liveTimer = setTimeout(function () { live.textContent = msg; }, 60);
  }

  /* ---------- 1. 外观控件 + 切换过渡 ---------- */
  /* 外壳自己的两处主题控件容器（nav.js 同步画好，defer 的本脚本执行时已在 DOM 里）。
     下面的点击、键盘、重绘都只认这两处：样例里写了同名属性也不会改全站外观。 */
  var themeBoxes = Array.prototype.slice.call(doc.querySelectorAll("aside.side [data-theme-controls], #more-panel [data-theme-controls]"));
  function shellControl(el, attr) {
    var t = el && el.closest ? el.closest("[" + attr + "]") : null;
    if (!t) return null;
    for (var i = 0; i < themeBoxes.length; i++) if (themeBoxes[i].contains(t)) return t;
    return null;
  }
  function eachShell(attr, fn) {
    each(themeBoxes, function (box) { each(box.querySelectorAll("[" + attr + "]"), fn); });
  }

  function paintControls() {
    if (!T) return;
    var pref = T.pref();
    var mode = T.mode();
    var accent = T.accent();
    var bp = T.blurPref ? T.blurPref() : "auto";
    var tier = blurTier();
    eachShell("data-mode-set", function (b) {
      var v = b.getAttribute("data-mode-set");
      var on = v === pref;
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.setAttribute("tabindex", on ? "0" : "-1");
      if (v === "auto") b.setAttribute("aria-label", "自动，跟随系统：当前" + MODE_LABEL[mode]);
    });
    eachShell("data-accent-set", function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-accent-set") === accent ? "true" : "false");
    });
    eachShell("data-blur-set", function (b) {
      var v = b.getAttribute("data-blur-set");
      var on = v === bp;
      b.setAttribute("aria-checked", on ? "true" : "false");
      b.setAttribute("tabindex", on ? "0" : "-1");
      if (v === "auto") b.setAttribute("aria-label", "自动，按显卡：当前" + TIER_LABEL[tier]);
    });
  }

  /* View Transition：kind = "reveal"（明暗，圆形揭开）| "fade"（强调色，默认交叉淡入）。
     origin = {x, y} 视口坐标；没有就从视口顶部正中揭开。 */
  var VT_REVEAL_MS = 420;
  var VT_REVEAL_EASE = "cubic-bezier(.25, .5, .3, 1)";
  var activeVT = null;
  function noop() {}
  function canVT() {
    return typeof doc.startViewTransition === "function" && !reduced() && blurTier() === "full" && !doc.hidden;
  }
  function transition(kind, origin, change) {
    if (!canVT()) { change(); return null; }
    if (activeVT) { try { activeVT.skipTransition(); } catch (e) { /* 已经结束 */ } }
    root.classList.remove("vt-reveal", "vt-fade", "vt-nav");
    root.classList.add(kind === "reveal" ? "vt-reveal" : "vt-fade");
    var vt;
    try { vt = doc.startViewTransition(change); } catch (e) {
      root.classList.remove("vt-reveal", "vt-fade");
      change();
      return null;
    }
    activeVT = vt;
    function cleanup() {
      if (activeVT !== vt) return;
      activeVT = null;
      root.classList.remove("vt-reveal", "vt-fade");
    }
    /* 三个 promise 都接住：没接住的 reject 会变成控制台里的 Uncaught (in promise) */
    if (vt.updateCallbackDone) vt.updateCallbackDone.then(noop, noop);
    vt.finished.then(cleanup, cleanup);
    vt.ready.then(function () {
      if (kind !== "reveal") return;
      var w = doc.documentElement.clientWidth || window.innerWidth;
      var h = window.innerHeight;
      var x = origin ? origin.x : w / 2;
      var y = origin ? origin.y : 0;
      var dx = Math.max(x, w - x);
      var dy = Math.max(y, h - y);
      var r = Math.ceil(Math.sqrt(dx * dx + dy * dy));
      var at = " at " + Math.round(x) + "px " + Math.round(y) + "px)";
      try {
        root.animate({ clipPath: ["circle(0px" + at, "circle(" + r + "px" + at] },
          { duration: VT_REVEAL_MS, easing: VT_REVEAL_EASE, pseudoElement: "::view-transition-new(root)" });
      } catch (e) { /* 不认 pseudoElement：退成默认淡入 */ }
    }, cleanup);
    return vt;
  }
  /* 圆心：鼠标 / 触摸点了就用点击点；键盘（或合成的 click）取控件中心 */
  function originOf(el, e) {
    if (e && e.detail > 0 && typeof e.clientX === "number" && (e.clientX || e.clientY)) return { x: e.clientX, y: e.clientY };
    if (!el || !el.getBoundingClientRect) return null;
    var r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  function modeOf(pref) { return pref === "auto" ? (mqDark && mqDark.matches ? "dark" : "light") : pref; }

  function setMode(v, origin) {
    if (!T || v === T.pref()) return;
    var willBe = modeOf(v);
    var go = function () { T.setMode(v); };
    if (willBe !== T.mode()) transition("reveal", origin, go); else go();
    announce(v === "auto" ? "外观：自动，跟随系统，当前" + MODE_LABEL[willBe] : "外观：" + MODE_LABEL[v]);
  }
  function setAccent(a) {
    if (!T || a === T.accent()) return;
    transition("fade", null, function () { T.setAccent(a); });
    announce("强调色：" + ACCENT_LABEL[a]);
  }
  function setBlur(v) {
    if (!T || !T.setBlur || v === T.blurPref()) return;
    T.setBlur(v);
    announce("背景模糊：" + BLUR_LABEL[v] + (v === "auto" ? "，当前" + TIER_LABEL[blurTier()] : ""));
  }

  doc.addEventListener("click", function (e) {
    if (!T) return;
    var m = shellControl(e.target, "data-mode-set");
    if (m) { setMode(m.getAttribute("data-mode-set"), originOf(m, e)); return; }
    var bl = shellControl(e.target, "data-blur-set");
    if (bl) { setBlur(bl.getAttribute("data-blur-set")); return; }
    var rs = shellControl(e.target, "data-theme-reset");
    if (rs) { resetLook(rs, e); return; }
    var d = shellControl(e.target, "data-accent-set");
    if (d) setAccent(d.getAttribute("data-accent-set"));
  });

  /* 单选组键盘：方向键移动并选中（选中跟着焦点走，这是 radio 的标准行为），首尾循环；Home / End 到两端。
     页面自己的 radiogroup 也吃这一套（移动后 click 选中）；页面已经处理过这一下（preventDefault）就不再处理。 */
  doc.addEventListener("keydown", function (e) {
    if (composing(e) || e.defaultPrevented) return;
    var t = e.target;
    if (!t || !t.getAttribute || t.getAttribute("role") !== "radio") return;
    var group = t.closest('[role="radiogroup"]');
    if (!group) return;
    var isMode = !!shellControl(t, "data-mode-set");
    var isBlur = !!shellControl(t, "data-blur-set");
    var shell = isMode || isBlur;
    var radios = Array.prototype.slice.call(group.querySelectorAll('[role="radio"]'));
    var i = radios.indexOf(t);
    var next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % radios.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + radios.length) % radios.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = radios.length - 1;
    else if (e.key === " " || e.key === "Enter") {
      /* 外壳的按钮自己处理；页面的 radio 若是 <button>，交给浏览器原生的点击，不拦 */
      if (isMode) { e.preventDefault(); setMode(t.getAttribute("data-mode-set"), originOf(t)); }
      else if (isBlur) { e.preventDefault(); setBlur(t.getAttribute("data-blur-set")); }
      return;
    }
    if (next < 0) return;
    e.preventDefault();
    var target = radios[next];
    if (isMode) setMode(target.getAttribute("data-mode-set"), originOf(target));
    else if (isBlur) setBlur(target.getAttribute("data-blur-set"));
    else if (!shell) target.click();
    target.focus();
  });

  /* ---------- 2. favicon ---------- */
  var HEX = /^#[0-9a-fA-F]{3,8}$/;
  function faviconSvg(from, to) {
    var s = 64;
    var rx = (s * 0.2237).toFixed(2);
    /* 图形在 24 视窗里画，放大到方块边长的 84% 居中；线宽跟着放大，16px 标签页上约 1px */
    var k = (s * 0.84) / 24;
    var off = ((s - 24 * k) / 2).toFixed(2);
    var paths = NAV && NAV.icons ? NAV.icons.brand : "";
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + s + " " + s + '" width="' + s + '" height="' + s + '">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + from + '"/><stop offset="1" stop-color="' + to + '"/></linearGradient></defs>' +
      '<rect width="' + s + '" height="' + s + '" rx="' + rx + '" fill="url(#g)"/>' +
      '<g transform="translate(' + off + " " + off + ") scale(" + k.toFixed(4) + ')" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' +
      paths + "</g></svg>";
  }
  var favKey = "";
  function syncFavicon() {
    var from = "#007AFF";
    var to = "#5AC8FA";
    try {
      var cs = getComputedStyle(root);
      var a = String(cs.getPropertyValue("--accent") || "").trim();
      var b = String(cs.getPropertyValue("--accent-2") || "").trim();
      if (HEX.test(a)) from = a;
      if (HEX.test(b)) to = b;
    } catch (e) { /* 读不到计算值就用默认蓝 */ }
    if (from + to === favKey) return;          /* 只换了模糊档位之类：图标不变，不重写 */
    favKey = from + to;
    var link = doc.querySelector('link[rel="icon"]');
    if (!link) {
      link = doc.createElement("link");
      link.rel = "icon";
      doc.head.appendChild(link);
    }
    link.setAttribute("type", "image/svg+xml");
    link.setAttribute("href", "data:image/svg+xml," + encodeURIComponent(faviconSvg(from, to)));
  }

  if (T) T.onChange(function () { paintControls(); syncFavicon(); });
  paintControls();
  syncFavicon();

  /* ---------- 3. 品牌图标可换文件 ---------- */
  (function probeBrand() {
    /* 外壳的品牌方块：侧栏里那枚 + 页面里用 data-icon="brand" 画内置图标的（如总览页的外壳缩略图）。
       交互页「品牌图标」样例里自己画示意图的 .brand-icon 不在此列，换了文件它也照旧。 */
    var boxes = doc.querySelectorAll(".side .brand-icon, .brand-icon[data-icon='brand']");
    if (!boxes.length) return;
    var list = ["brand/brand-icon.svg", "brand/brand-icon.png"];
    function tryAt(i) {
      if (i >= list.length) return;
      var img = new Image();
      img.onload = function () { if (img.naturalWidth > 0) use(list[i]); else tryAt(i + 1); };
      img.onerror = function () { tryAt(i + 1); };
      img.src = list[i];
    }
    function use(src) {
      each(boxes, function (box) {
        var im = doc.createElement("img");
        im.className = "brand-file";
        im.alt = "";
        im.src = src;
        box.appendChild(im);
        box.classList.add("has-file");
      });
    }
    tryAt(0);
  })();

  /* ---------- 4. 复制 + 气泡 ---------- */
  function copyText(text) {
    return new Promise(function (resolve, reject) {
      var active = doc.activeElement;
      function fallback() {
        try {
          var ta = doc.createElement("textarea");
          ta.value = text;
          ta.setAttribute("readonly", "");
          ta.style.position = "fixed";
          ta.style.top = "0";
          ta.style.left = "-9999px";
          ta.style.opacity = "0";
          doc.body.appendChild(ta);
          ta.select();
          var ok = doc.execCommand("copy");
          doc.body.removeChild(ta);
          if (active && active.focus) active.focus();
          if (ok) resolve(); else reject(new Error("execCommand"));
        } catch (err) { reject(err); }
      }
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(resolve, fallback);
      } else fallback();
    });
  }
  window.StarCopy = copyText;

  /* 气泡：挂 body、fixed。量一次按钮与气泡：左右离视口边不足 8px 就整体平移回来，箭头按同一个量反向移、仍指着按钮中心；
     上方被顶栏（≤900 吸顶）或视口顶挡住就翻到下方。滚动时重新量（按钮在动，气泡跟着走）。 */
  var bub = null;
  var bubFor = null;
  var bubTimer = 0;
  var BUB_GAP = 8;
  var BUB_EDGE = 8;
  function dropBubble() {
    clearTimeout(bubTimer);
    if (bub && bub.parentNode) bub.parentNode.removeChild(bub);
    bub = null;
    bubFor = null;
  }
  function topCover() {
    if (!narrow()) return 0;
    var s = doc.querySelector(".side");
    if (!s) return 0;
    var r = s.getBoundingClientRect();
    return r.bottom > 0 ? r.bottom : 0;
  }
  function placeBubble() {
    if (!bub || !bubFor) return;
    if (!bubFor.isConnected) { dropBubble(); return; }
    var r = bubFor.getBoundingClientRect();
    var vw = doc.documentElement.clientWidth || window.innerWidth;
    var w = bub.offsetWidth;
    var h = bub.offsetHeight;
    var cx = r.left + r.width / 2;
    var want = cx - w / 2;
    /* 离边留 8px；按钮自己贴边贴得更近时让到 2px，箭头（半宽5）才够得着按钮中心 */
    var lo = Math.min(BUB_EDGE, Math.max(2, cx - 12));
    var hi = Math.max(lo, vw - w - Math.min(BUB_EDGE, Math.max(2, vw - cx - 12)));
    var left = clamp(want, lo, hi);
    var ax = clamp(cx - left, 7, w - 7);
    var above = r.top - BUB_GAP - h;
    var below = above < topCover() + 4;
    bub.style.left = Math.round(left) + "px";
    bub.style.top = Math.round(below ? r.bottom + BUB_GAP : above) + "px";
    bub.style.setProperty("--ax", Math.round(ax) + "px");
    bub.classList.toggle("is-below", below);
  }
  function showBubble(btn, text) {
    dropBubble();
    var el = doc.createElement("span");
    el.className = "copy-bubble";
    el.setAttribute("aria-hidden", "true");
    el.textContent = text;
    doc.body.appendChild(el);
    bub = el;
    bubFor = btn;
    placeBubble();
    bubTimer = setTimeout(function () {
      if (bub !== el) return;
      if (reduced() || !canAnimate) { dropBubble(); return; }
      el.classList.add("is-leaving");
      var done = function () { if (bub === el) dropBubble(); };
      el.addEventListener("animationend", done);
      bubTimer = setTimeout(done, 140 + 80);
    }, 1400);
  }
  window.addEventListener("scroll", function () { if (bub) placeBubble(); }, { passive: true, capture: true });
  window.addEventListener("resize", function () { if (bub) placeBubble(); });

  var codeSeq = 0;
  function enhanceCode(scope) {
    each((scope || doc).querySelectorAll(".page pre"), function (pre) {
      if (pre.closest(".codebox") || pre.hasAttribute("data-no-copy")) return;
      var box = doc.createElement("div");
      box.className = "codebox";
      pre.parentNode.insertBefore(box, pre);
      box.appendChild(pre);
      var btn = doc.createElement("button");
      btn.type = "button";
      btn.className = "copy-btn";
      btn.setAttribute("aria-label", "复制这段代码");
      btn.innerHTML = icon("copy") + "<span>复制</span>";
      box.appendChild(btn);
      var n = lineCount(pre);
      if (n > PULL_MIN && !pre.closest(".specimen") && !pre.hasAttribute("data-no-pull")) setupPull(box, pre, n);
    });
  }

  doc.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".copy-btn,[data-copy]") : null;
    if (!btn) return;
    var text;
    if (btn.classList.contains("copy-btn")) {
      var pre = btn.parentNode.querySelector("pre");
      text = pre ? pre.innerText.replace(/\n$/, "") : "";
    } else text = btn.getAttribute("data-copy");
    if (!text) return;
    copyText(text).then(function () {
      if (btn.classList.contains("copy-btn")) {
        var label = btn.querySelector("span");
        btn.classList.add("is-done");
        if (label) label.textContent = "已复制";
        setTimeout(function () { btn.classList.remove("is-done"); if (label) label.textContent = "复制"; }, 1600);
        announce("已复制代码");
      } else {
        showBubble(btn, "已复制");
        announce("已复制" + text);
      }
    }, function () {
      announce("复制失败，请手动选择");
      if (!btn.classList.contains("copy-btn")) showBubble(btn, "复制失败");
    });
  });

  /* ---------- 5. 「更多」面板 ---------- */
  var panel = doc.getElementById("more-panel");
  var scrim = doc.querySelector(".more-scrim");
  var moreOpener = null;
  function panelOpen() { return !!(panel && !panel.hidden); }
  function focusables(box) {
    return Array.prototype.filter.call(box.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),[tabindex="0"]'), function (el) {
      return (el.offsetParent !== null || el === doc.activeElement) && getComputedStyle(el).visibility !== "hidden";
    });
  }
  function setExpanded(v) {
    each(doc.querySelectorAll("[data-more-toggle]"), function (b) { b.setAttribute("aria-expanded", v ? "true" : "false"); });
  }
  function moreToggleVisible() {
    var list = doc.querySelectorAll("[data-more-toggle]");
    for (var i = 0; i < list.length; i++) if (visible(list[i])) return list[i];
    return null;
  }
  function openMore(trigger) {
    if (!panel) return;
    moreOpener = trigger || moreToggleVisible();
    panel.hidden = false;
    if (scrim) scrim.classList.add("is-open");
    setExpanded(true);
    var close = panel.querySelector("[data-more-close]");
    if (close) close.focus();
  }
  function closeMore(restore) {
    if (!panelOpen()) return;
    panel.hidden = true;
    if (scrim) scrim.classList.remove("is-open");
    setExpanded(false);
    if (restore !== false && moreOpener && moreOpener.focus) moreOpener.focus();
  }
  doc.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-more-toggle],[data-more-close]") : null;
    if (t && t.hasAttribute("data-more-toggle")) { if (!panelOpen()) openMore(t); else closeMore(); return; }
    if (t && t.hasAttribute("data-more-close")) { closeMore(); return; }
    if (scrim && e.target === scrim) closeMore();
  });
  doc.addEventListener("keydown", function (e) {
    if (!panelOpen() || composing(e) || kitOpen()) return;
    if (e.key === "Escape") { if (e.defaultPrevented) return; e.preventDefault(); closeMore(); return; }
    if (e.key !== "Tab") return;
    var f = focusables(panel);
    if (!f.length) return;
    var first = f[0];
    var last = f[f.length - 1];
    if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    else if (!panel.contains(doc.activeElement)) { e.preventDefault(); first.focus(); }
  });
  onMq(mqNarrow, function () { if (!narrow()) closeMore(false); });

  /* ---------- 6. 页内目录 ---------- */
  function textOf(el) { return el ? el.textContent.replace(/\s+/g, " ").trim() : ""; }
  function buildToc() {
    var toc = doc.querySelector(".page-toc");
    if (!toc) return;
    var groups = doc.querySelectorAll(".page .group");
    var html = "";
    var loose = "";
    var n = 0;
    each(groups, function (g, gi) {
      var title = g.querySelector(".group-title");
      if (!g.id) g.id = "g-" + (gi + 1);
      var entries = g.querySelectorAll(".entry");
      if (!entries.length) {
        if (title) loose += '<li><a class="toc-pill" href="#' + g.id + '">' + esc(textOf(title)) + "</a></li>";
        return;
      }
      var pills = "";
      each(entries, function (en) {
        n += 1;
        if (!en.id) en.id = "entry-" + n;
        var label = en.getAttribute("data-toc") || textOf(en.querySelector("h3"));
        pills += '<li><a class="toc-pill" href="#' + en.id + '" title="' + esc(textOf(en.querySelector("h3"))) + '">' + esc(label) + "</a></li>";
      });
      html += '<div class="toc-group"><span class="toc-label">' + esc(textOf(title)) + '</span><ul class="toc-list">' + pills + "</ul></div>";
    });
    if (loose) html = '<div class="toc-group"><span class="toc-label">本页</span><ul class="toc-list">' + loose + "</ul></div>" + html;
    toc.innerHTML = html;
  }

  /* ---------- 7. 章节分组列表 ---------- */
  function buildChapters() {
    if (!NAV) return;
    each(doc.querySelectorAll("[data-chapter-list]"), function (host) {
      var html = "";
      each(NAV.groups, function (g) {
        var rows = "";
        each(NAV.pages, function (p) {
          if (p.group !== g) return;
          var block = '<span class="ico" style="background:' + p.tint + '">' + icon(p.icon) + '</span><span class="t"><b>' + esc(p.title) + "</b><small>" + esc(p.sub) + "</small></span>";
          if (p.ready) {
            var badge = typeof p.count === "number" ? '<span class="badge">' + p.count + "条</span>" : "";
            rows += '<li><a class="row" href="' + p.file + '"' + (p.id === NAV.current ? ' aria-current="page"' : "") + ">" + block + badge + '<span class="chev">' + icon("chevron") + "</span></a></li>";
          } else {
            rows += '<li><span class="row" role="link" aria-disabled="true">' + block + '<span class="badge">' + NAV.pendingLabel + "</span></span></li>";
          }
        });
        html += '<div class="chapter-group" data-group="' + g + '"><h3 class="chapter-title">' + g + '</h3><ul class="list">' + rows + "</ul></div>";
      });
      host.innerHTML = html;
    });
  }

  /* ---------- 8. 条目数自检 ---------- */
  function checkCount() {
    if (!NAV) return;
    var cur = null;
    each(NAV.pages, function (p) { if (p.id === NAV.current) cur = p; });
    if (!cur || typeof cur.count !== "number") return;
    var n = doc.querySelectorAll(".page .entry").length;
    if (n !== cur.count) console.warn("[star] nav.js 里「" + cur.title + "」的 count 是" + cur.count + "，页面实际" + n + "条：同一轮改一处。");
  }

  /* ---------- 9. 图标占位 ---------- */
  /* 页面里的 <span data-icon="名字"> 占位：从 nav.js 的同一套图标填进去（data-icon-class 可换 svg 的类名） */
  each(doc.querySelectorAll("[data-icon]"), function (el) {
    if (!NAV || el.firstElementChild) return;
    el.innerHTML = NAV.icon(el.getAttribute("data-icon"), el.getAttribute("data-icon-class") || "i");
  });

  /* ---------- 10. 模糊档位：显卡探测 ---------- */
  function probeGpu() {
    if (!T || !T.setGpu || T.gpu() !== null) return;
    var ok = false;
    try {
      var cv = doc.createElement("canvas");
      var gl = cv.getContext("webgl", { failIfMajorPerformanceCaveat: true });
      ok = !!gl;
      if (gl) {
        var lose = gl.getExtension("WEBGL_lose_context");
        if (lose) lose.loseContext();
      }
    } catch (e) { ok = false; }
    T.setGpu(ok);
  }
  (function scheduleProbe() {
    if (!T || !T.gpu || T.gpu() !== null) return;
    function run() {
      if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(probeGpu, { timeout: 3000 });
      else setTimeout(probeGpu, 300);
    }
    if (doc.readyState === "complete") run(); else window.addEventListener("load", run);
  })();

  /* ---------- 11. 恢复默认外观 + 撤销 ---------- */
  var toast = doc.createElement("div");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  doc.body.appendChild(toast);
  var toastTimer = 0;
  var toastLeft = 0;
  var toastSince = 0;
  var toastHold = false;
  var toastUndo = null;
  var toastBack = null;
  var TOAST_MS = 5000;
  function toastOpen() { return toast.classList.contains("is-open"); }
  function toastRun(ms) {
    clearTimeout(toastTimer);
    toastLeft = ms;
    toastSince = Date.now();
    toastTimer = setTimeout(function () { hideToast(); }, ms);
  }
  /* 每条新提示都从头计时；鼠标正停在上面、焦点正在里面就先暂停 */
  function showToast(text, undo, back) {
    clearTimeout(toastTimer);
    toast.innerHTML = '<span class="toast-text"></span>' +
      (undo ? '<span class="toast-dot" aria-hidden="true"></span><button type="button" class="toast-undo">撤销</button>' : "");
    toast.firstChild.textContent = text;
    toastUndo = undo || null;
    toastBack = back || null;
    toast.classList.add("is-open");
    toastHold = false;
    toastRun(undo ? TOAST_MS : 2400);
    if (toastHover || toast.contains(doc.activeElement)) toastPause();
  }
  function hideToast() {
    clearTimeout(toastTimer);
    var hadFocus = toast.contains(doc.activeElement);
    toast.classList.remove("is-open");
    toastUndo = null;
    toastHold = false;
    if (hadFocus) {
      if (toastBack && visible(toastBack)) toastBack.focus();
      else if (doc.activeElement && doc.activeElement.blur) doc.activeElement.blur();
    }
    setTimeout(function () { if (!toastOpen()) toast.textContent = ""; }, 260);
  }
  /* 鼠标停在上面、或焦点在里面：暂停计时；两样都离开后接着走剩下的（至少1.5秒）。
     悬停自己记旗标，不靠 :hover（指针刚移走那一拍 :hover 可能还没更新） */
  var toastHover = false;
  function toastPause() {
    if (!toastOpen() || toastHold) return;
    toastHold = true;
    clearTimeout(toastTimer);
    toastLeft = Math.max(0, toastLeft - (Date.now() - toastSince));
  }
  function toastResume() {
    if (!toastOpen() || !toastHold) return;
    if (toastHover || toast.contains(doc.activeElement)) return;
    toastHold = false;
    toastRun(Math.max(1500, toastLeft));
  }
  toast.addEventListener("mouseenter", function () { toastHover = true; toastPause(); });
  toast.addEventListener("focusin", toastPause);
  toast.addEventListener("mouseleave", function () { toastHover = false; setTimeout(toastResume, 0); });
  toast.addEventListener("focusout", function () { setTimeout(toastResume, 0); });
  toast.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest(".toast-undo") : null;
    if (!b || !toastUndo) return;
    var fn = toastUndo;
    toastUndo = null;
    var hadFocus = toast.contains(doc.activeElement);
    fn(b, e);
    if (hadFocus && toastBack && visible(toastBack)) toastBack.focus();
  });
  /* 焦点在提示条里：Esc 先关它（在 toast 上处理，赶在「更多」面板之类的文档级处理之前） */
  toast.addEventListener("keydown", function (e) {
    if (composing(e) || e.key !== "Escape") return;
    e.preventDefault();
    e.stopPropagation();
    hideToast();
  });
  /* 焦点不在提示条里：只在没有别的层开着时才由 Esc 关它 */
  function otherLayerOpen() {
    if (panelOpen() || S.sheetOpen || (sPop && !sPop.hidden) || kitOpen()) return true;
    var modals = doc.querySelectorAll('[aria-modal="true"], .kit-layer[data-state="open"]');
    for (var i = 0; i < modals.length; i++) if (visible(modals[i])) return true;
    return false;
  }
  doc.addEventListener("keydown", function (e) {
    if (composing(e) || e.key !== "Escape" || e.defaultPrevented || !toastOpen()) return;
    if (otherLayerOpen()) return;
    hideToast();
  });

  function sameLook(a, b) { return a.mode === b.mode && a.accent === b.accent && a.blur === b.blur; }
  function applyLook(look, origin) {
    var modeChanges = modeOf(look.mode) !== T.mode();
    var accentChanges = look.accent !== T.accent();
    var go = function () { T.setAll(look); };
    if (modeChanges) transition("reveal", origin, go);
    else if (accentChanges) transition("fade", null, go);
    else go();
  }
  function resetLook(btn, e) {
    if (!T || !T.setAll) return;
    var D = T.DEFAULTS;
    var prev = { mode: T.pref(), accent: T.accent(), blur: T.blurPref() };
    if (sameLook(prev, D)) { showToast("已经是默认外观", null, btn); return; }
    applyLook(D, originOf(btn, e));
    showToast("已恢复默认外观", function (undoBtn, ev) {
      applyLook(prev, originOf(undoBtn, ev));
      showToast("已撤销，外观换回去了", null, btn);
    }, btn);
  }

  /* ---------- 12. 搜索 ---------- */
  var sField = doc.querySelector(".search-field");
  var sInput = sField ? sField.querySelector(".search-input") : null;
  var sKbd = sField ? sField.querySelector(".search-kbd") : null;
  var sHome = doc.querySelector("[data-search-home]");
  var sSheet = doc.getElementById("search-sheet");
  var sScrim = doc.querySelector(".search-scrim");
  var sSlot = sSheet ? sSheet.querySelector(".search-slot") : null;
  var sPop = doc.getElementById("star-search-pop");
  var sList = sPop ? sPop.querySelector(".search-list") : null;
  var sNote = sPop ? sPop.querySelector(".search-note") : null;
  var sFoot = sPop ? sPop.querySelector(".search-foot") : null;
  var S = {
    state: "idle",        /* idle 没注入 / loading / ready / failed */
    data: null,
    tags: [],             /* 框里的标签胶囊（标签名） */
    cursor: -1,
    shown: [],            /* 列表里每一项：{ it: 条目 } 或 { tag: 标签名 } */
    dismissed: false,     /* Esc 收了列表：再打字才重新弹 */
    imeKeyDown: false,
    composing: false,
    sheetOpen: false,
    opener: null,         /* 浮层关了焦点还给它 */
    returnTo: null,       /* 快捷键聚焦前的焦点：第三下 Esc 还回去 */
    spoken: "",
    speakTimer: 0,
    prefix: "",           /* 下一句播报的前缀（「已加标签…，」） */
    homeTimer: 0
  };

  function loadIndex() {
    if (S.state !== "idle") return;
    if (window.STAR_SEARCH && window.STAR_SEARCH.items) { S.data = window.STAR_SEARCH; S.state = "ready"; return; }
    S.state = "loading";
    var sc = doc.createElement("script");
    sc.src = "data/search-index.js";
    sc.setAttribute("data-star-search", "");
    sc.onload = function () {
      var d = window.STAR_SEARCH;
      if (d && d.items && d.items.length) { S.data = d; S.state = "ready"; } else S.state = "failed";
      if (doc.activeElement === sInput) update();
    };
    sc.onerror = function () { S.state = "failed"; if (doc.activeElement === sInput) update(); };
    (doc.head || doc.body).appendChild(sc);
  }

  function norm(s) { return String(s == null ? "" : s).toLowerCase(); }
  function prep(it) {
    if (it._t != null) return;
    it._t = norm(it.t);
    it._n = norm(it.n);
    it._k = (it.k || []).map(norm);
    it._g = norm(it.g) + " " + norm(it.pt);
    it._s = norm(it.s);
  }
  /* 一个词在一条里的名次：越小越靠前；-1 = 哪儿都没有 */
  function rank(it, term) {
    var at = it._t.indexOf(term);
    if (at === 0) return 0;
    if (at > 0) return 1;
    if (it._n && it._n.indexOf(term) >= 0) return 2;
    for (var k = 0; k < it._k.length; k++) if (it._k[k].indexOf(term) >= 0) return 3;
    if (it._g.indexOf(term) >= 0) return 4;
    if (it._s.indexOf(term) >= 0) return 5;
    return -1;
  }
  function hasTags(it) {
    for (var i = 0; i < S.tags.length; i++) if (!it.k || it.k.indexOf(S.tags[i]) < 0) return false;
    return true;
  }
  function termsOf(q) { return norm(q).split(/\s+/).filter(Boolean); }
  function search(q) {
    var terms = termsOf(q);
    var hits = [];
    each(S.data.items, function (it, i) {
      if (!hasTags(it)) return;
      prep(it);
      var sum = 0;
      for (var j = 0; j < terms.length; j++) {
        var r = rank(it, terms[j]);
        if (r < 0) return;
        sum += r;
      }
      hits.push({ it: it, score: sum, i: i });
    });
    hits.sort(function (a, b) { return a.score - b.score || a.i - b.i; });   /* 同名次按页面顺序（总览 → 色彩 → 交互 → 收藏），条目在前、收藏的指针在后 */
    return hits;
  }
  /* 零结果：按「输入里的字在标题 / 短名里出现了几个」挑最多3条（岗岗「名称相近」的做法） */
  function similar(q) {
    var chars = [];
    each(norm(q).replace(/\s+/g, "").split(""), function (c) { if (c !== "#" && chars.indexOf(c) < 0) chars.push(c); });
    var scored = [];
    each(S.data.items, function (it, i) {
      if (!hasTags(it)) return;
      prep(it);
      var n = 0;
      for (var j = 0; j < chars.length; j++) if (it._t.indexOf(chars[j]) >= 0 || it._n.indexOf(chars[j]) >= 0) n += 1;
      if (n > 0) scored.push({ it: it, n: n, i: i });
    });
    scored.sort(function (a, b) { return b.n - a.n || a.i - b.i; });
    return scored.slice(0, 3);
  }
  function tagOptions(q, limit) {
    var tq = norm(q);
    var list = (S.data.tags || []).filter(function (t) { return S.tags.indexOf(t.name) < 0 && norm(t.name).indexOf(tq) >= 0; });
    list.sort(function (a, b) {
      var pa = norm(a.name).indexOf(tq) === 0 ? 0 : 1;
      var pb = norm(b.name).indexOf(tq) === 0 ? 0 : 1;
      return pa - pb || b.n - a.n;
    });
    return list.slice(0, limit);
  }
  /* 标题里命中的字包 <mark>（逐字标记再合并成段，转义后拼） */
  function hl(text, terms) {
    var low = norm(text);
    var on = [];
    each(terms, function (term) {
      var from = 0;
      var at;
      while (term && (at = low.indexOf(term, from)) >= 0) {
        for (var j = at; j < at + term.length; j++) on[j] = true;
        from = at + term.length;
      }
    });
    var out = "";
    var run = "";
    var inMark = false;
    for (var i = 0; i < text.length; i++) {
      var m = !!on[i];
      if (m !== inMark) {
        out += inMark ? "<mark>" + esc(run) + "</mark>" : esc(run);
        run = "";
        inMark = m;
      }
      run += text.charAt(i);
    }
    out += inMark ? "<mark>" + esc(run) + "</mark>" : esc(run);
    return out;
  }
  function whereOf(it) { return (it.pt || "") + (it.g ? " · " + it.g : ""); }
  function optionHtml(k, inner, cls) {
    return '<li role="option" id="star-opt-' + k + '" aria-selected="false" data-k="' + k + '" class="so' + (cls ? " " + cls : "") + '">' + inner + "</li>";
  }
  function itemHtml(k, it, terms, near) {
    return optionHtml(k,
      '<span class="so-line"><span class="so-title">' + hl(it.t, terms) + "</span>" +
      (near ? '<span class="so-badge">相近</span>' : "") +
      '<span class="so-where">' + esc(whereOf(it)) + "</span></span>" +
      (it.s ? '<span class="so-sum">' + esc(it.s) + "</span>" : ""), near ? "is-near" : "");
  }

  function speak(text) {
    if (!text) return;
    if (text === S.spoken && !S.speakTimer) return;
    S.spoken = text;
    clearTimeout(S.speakTimer);
    S.speakTimer = setTimeout(function () {
      S.speakTimer = 0;
      if (sPop && !sPop.hidden) announce(text);
    }, 400);
  }
  function hush() {
    clearTimeout(S.speakTimer);
    S.speakTimer = 0;
    S.spoken = "";
  }
  function setCursor(i) {
    var opts = sList ? sList.querySelectorAll('[role="option"]') : [];
    S.cursor = i >= 0 && i < opts.length ? i : -1;
    each(opts, function (o, at) { o.setAttribute("aria-selected", at === S.cursor ? "true" : "false"); });
    if (S.cursor >= 0) {
      sInput.setAttribute("aria-activedescendant", opts[S.cursor].id);
      var o = opts[S.cursor];
      var top = o.offsetTop;
      var bottom = top + o.offsetHeight;
      if (top < sPop.scrollTop) sPop.scrollTop = top - 4;
      else if (bottom > sPop.scrollTop + sPop.clientHeight) sPop.scrollTop = bottom - sPop.clientHeight + 4;
    } else sInput.removeAttribute("aria-activedescendant");
  }
  function closePop() {
    if (!sPop) return;
    hush();
    if (sInput) { setCursor(-1); sInput.setAttribute("aria-expanded", "false"); }
    sPop.hidden = true;
    S.shown = [];
  }
  /* 结果列表放哪：>900 挂 body、fixed 贴着侧栏的输入框（侧栏有 overflow 与 backdrop-filter，放里面会被裁、fixed 会错参照）；
     ≤900 浮层开着时搬进 #search-sheet 里、absolute 挂在面板下沿——浮层是 aria-modal 的对话框，VoiceOver 会把对话框外面的
     东西对读屏藏起来，列表在外面的话 aria-activedescendant 指过去也读不出来。面板自己带 backdrop-filter，所以这时用 absolute。 */
  var sPopHome = sPop ? sPop.parentNode : null;
  function popInto(sheetMode) {
    if (!sPop) return;
    var host = sheetMode && sSheet ? sSheet : sPopHome;
    if (host && sPop.parentNode !== host) host.appendChild(sPop);
  }
  function placePop() {
    if (!sPop || sPop.hidden || !sField) return;
    var vw = doc.documentElement.clientWidth || window.innerWidth;
    var vh = window.innerHeight;
    if (S.sheetOpen && sSheet && sPop.parentNode === sSheet) {
      var sr = sSheet.getBoundingClientRect();
      sPop.style.left = sPop.style.top = sPop.style.width = "";
      sPop.style.maxHeight = Math.max(120, Math.round(vh - sr.bottom - 18)) + "px";
      return;
    }
    var r = sField.getBoundingClientRect();
    var width = Math.min(vw - 16, Math.max(r.width, Math.round(440 * scaleU())));
    var left = clamp(r.left, 8, Math.max(8, vw - width - 8));
    var top = r.bottom + 6;
    sPop.style.left = Math.round(left) + "px";
    sPop.style.top = Math.round(top) + "px";
    sPop.style.width = Math.round(width) + "px";
    sPop.style.maxHeight = Math.max(120, Math.round(vh - top - 12)) + "px";
  }
  function showPop(html, note, foot) {
    var wasOpen = !sPop.hidden;
    sList.innerHTML = html;
    sNote.hidden = !note;
    sNote.textContent = note || "";
    sFoot.hidden = !foot;
    sFoot.textContent = foot || "";
    sPop.hidden = false;
    sInput.setAttribute("aria-expanded", "true");
    setCursor(-1);
    sPop.scrollTop = 0;
    placePop();
    if (!wasOpen && !reduced() && canAnimate) {
      sPop.animate([{ opacity: 0, transform: "translateY(-4px) scale(.985)" }, { opacity: 1, transform: "none" }], { duration: 180, easing: EASE_OUT });
    }
  }
  function tagWords() { return S.tags.map(function (t) { return "「" + t + "」"; }).join(""); }
  function update() {
    if (!sInput || !sPop) return;
    var text = sInput.value;
    var q = text.trim();
    if ((!q && !S.tags.length) || S.dismissed) { closePop(); return; }
    loadIndex();
    var limit = phone() ? 5 : 6;
    var html = "";
    var note = "";
    var foot = "";
    var speech = "";
    var prefix = S.prefix;
    S.prefix = "";
    S.shown = [];
    if (S.state === "loading" || S.state === "idle") {
      note = "正在读索引…";
    } else if (S.state === "failed") {
      note = "索引没读到（data/search-index.js），搜不了。";
      speech = "索引没读到";
    } else if (q.charAt(0) === "#") {
      var tq = q.slice(1).trim();
      var tags = tagOptions(tq, limit);
      S.shown = tags.map(function (t) { return { tag: t.name }; });
      html = tags.map(function (t, k) {
        return optionHtml(k, '<span class="so-line"><span class="so-hash" aria-hidden="true">' + icon("hash", "so-hash-i") + '</span><span class="so-title">' +
          hl(t.name, tq ? [norm(tq)] : []) + '</span><span class="so-n">' + t.n + "条</span></span>", "so-tag");
      }).join("");
      note = tags.length ? "" : "没有叫「" + tq + "」的标签";
      speech = tags.length ? tags.length + "个标签可选，上下键选择" : "没有这个标签";
    } else {
      var terms = termsOf(q);
      var hits = q ? search(q) : S.data.items.map(function (it, i) { return { it: it, i: i }; }).filter(function (h) { return hasTags(h.it); });
      if (hits.length) {
        var top = hits.slice(0, limit);
        S.shown = top.map(function (h) { return { it: h.it }; });
        html = top.map(function (h, k) { return itemHtml(k, h.it, terms, false); }).join("");
        if (hits.length > limit) foot = "共" + hits.length + "条，只列前" + limit + "条；多打几个字缩小范围";
        speech = (q ? "找到" : "标签" + tagWords() + "下有") + hits.length + "条，上下键选择";
      } else {
        var near = similar(q);
        S.shown = near.map(function (h) { return { it: h.it, near: true }; });
        html = near.map(function (h, k) { return itemHtml(k, h.it, terms, true); }).join("");
        note = near.length ? "没有直接命中「" + q + "」，相近的：" : "没有找到「" + q + "」";
        speech = near.length ? "没有直接命中，" + near.length + "条相近的" : "没有找到";
      }
    }
    showPop(html, note, foot);
    speak(prefix + speech);
  }

  function chipFor(name) {
    var holder = doc.createElement("span");
    holder.innerHTML = '<span class="search-chip" data-tag="' + esc(name) + '"><span class="sc-bg" aria-hidden="true"></span><span class="sc-dot" aria-hidden="true"></span>' +
      '<span class="sc-text">#' + esc(name) + '</span><button type="button" class="sc-x" aria-label="去掉标签“' + esc(name) + '”">' + icon("close", "sc-x-i") + "</button></span>";
    return holder.firstChild;
  }
  /* FLIP（照 interaction.js 的 flipMove）：量旧位置 → 改 DOM → 量新位置 → 从旧位置滑回；依次晚 stagger、封顶 maxDelay */
  var flipAnims = typeof WeakMap === "function" ? new WeakMap() : null;
  function flipMove(items, mutate, opts) {
    var list = items.filter(Boolean);
    var before = list.map(function (el) { var r = el.getBoundingClientRect(); return { x: r.left, y: r.top }; });
    if (flipAnims) list.forEach(function (el) { var a = flipAnims.get(el); if (a) { a.cancel(); flipAnims.delete(el); } });
    mutate();
    if (reduced() || !canAnimate) return 0;
    var moved = 0;
    var last = 0;
    list.forEach(function (el, i) {
      if (!el.isConnected) return;
      var r = el.getBoundingClientRect();
      var dx = before[i].x - r.left;
      var dy = before[i].y - r.top;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
      var d = Math.min(moved * (opts.stagger || 0), opts.maxDelay == null ? 96 : opts.maxDelay);
      moved += 1;
      last = Math.max(last, d);
      var a = el.animate([{ transform: "translate(" + dx + "px, " + dy + "px)" }, { transform: "translate(0, 0)" }],
        { duration: opts.duration, easing: opts.easing, delay: d, fill: "backwards" });
      if (flipAnims) flipAnims.set(el, a);
    });
    return moved ? opts.duration + last : 0;
  }
  function followers(el) {
    return Array.prototype.filter.call(sField.querySelectorAll(".search-chip, .search-input, .search-kbd"), function (item) {
      return item !== el && !!(el.compareDocumentPosition(item) & 4);
    });
  }
  /* 补位期间框先用一次性 min-height 撑住原高，走完一次性放开——不做高度动画（ix-tags「高度」） */
  var holdTimer = 0;
  function reflow(list, mutate) {
    var h0 = sField.offsetHeight;
    sField.style.minHeight = "";
    var ms = flipMove(list, mutate, { duration: 240, easing: EASE_OUT, stagger: 24, maxDelay: 96 });
    clearTimeout(holdTimer);
    if (ms && sField.offsetHeight < h0) {
      sField.style.minHeight = h0 + "px";
      holdTimer = setTimeout(function () { sField.style.minHeight = ""; if (!sPop.hidden) placePop(); }, ms);
    }
    if (!sPop.hidden) placePop();
  }
  function addTag(name) {
    sInput.value = "";
    S.dismissed = false;
    if (!name) { update(); return; }
    if (S.tags.indexOf(name) >= 0) { S.prefix = "已经有标签「" + name + "」，"; update(); return; }
    S.tags.push(name);
    var chip = chipFor(name);
    reflow([sInput, sKbd], function () { sField.insertBefore(chip, sInput); });
    if (!reduced() && canAnimate) chip.animate([{ opacity: 0, transform: "scale(.6)" }, { opacity: 1, transform: "none" }], { duration: 180, easing: EASE_OUT });
    S.prefix = "已加标签「" + name + "」，";
    update();
  }
  /* 删除：文字与叉号 100ms 淡出；底色层缩到圆点大小并淡掉（170ms）；中心圆点淡入、55% 处最亮、再缩到 .2 淡出（240ms）；
     圆点走完才从 DOM 里拿掉（finished 或兜底 240+120ms），后面的依次补位。 */
  function removeTag(chip) {
    if (!chip || chip.classList.contains("is-removing")) return;
    var name = chip.getAttribute("data-tag");
    S.tags = S.tags.filter(function (t) { return t !== name; });
    chip.classList.add("is-removing");
    chip.setAttribute("aria-hidden", "true");
    var x = chip.querySelector(".sc-x");
    if (x) { x.disabled = true; x.tabIndex = -1; }
    if (doc.activeElement !== sInput) focusNoScroll(sInput);
    S.prefix = "已去掉标签「" + name + "」，";
    update();
    if (sPop.hidden) announce("已去掉标签「" + name + "」");
    var finished = false;
    function finish() {
      if (finished || !chip.isConnected) return;
      finished = true;
      reflow(followers(chip), function () { chip.parentNode.removeChild(chip); });
    }
    if (reduced() || !canAnimate) { finish(); return; }
    var w = chip.offsetWidth || 1;
    var h = chip.offsetHeight || 1;
    var dot = chip.querySelector(".sc-dot");
    var d = (dot && dot.offsetWidth) || 6;
    each(chip.querySelectorAll(".sc-text, .sc-x"), function (part) {
      part.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 100, easing: EASE_STD, fill: "forwards" });
    });
    var bg = chip.querySelector(".sc-bg");
    if (bg) bg.animate([{ transform: "none", opacity: 1 }, { transform: "scale(" + (d / w) + ", " + (d / h) + ")", opacity: 0 }], { duration: 170, easing: EASE_STD, fill: "forwards" });
    var lastAnim = dot ? dot.animate([
      { opacity: 0, transform: "scale(1)" },
      { opacity: 1, transform: "scale(1)", offset: 0.55 },
      { opacity: 0, transform: "scale(.2)" }
    ], { duration: 240, easing: EASE_STD, fill: "forwards" }) : null;
    if (lastAnim && lastAnim.finished) lastAnim.finished.then(finish, finish);
    setTimeout(finish, 240 + 120);
  }
  function clearAll() {
    sInput.value = "";
    S.tags = [];
    each(sField.querySelectorAll(".search-chip"), function (c) { c.parentNode.removeChild(c); });
    sField.style.minHeight = "";
  }

  function fileOf(path) {
    var name = String(path || "");
    name = name.slice(name.lastIndexOf("/") + 1);
    try { name = decodeURIComponent(name); } catch (e) { /* 保持原样 */ }
    name = name.replace(/\.html?$/i, "");
    return name || "index";
  }
  /* 同页跳锚点：先挂 data-jump 关平滑滚动（长页平滑滚会跑偏），落地后把焦点给目标（键盘接着从这里走） */
  function jumpHash(hash) {
    var id = hash.replace(/^#/, "");
    var target = id ? doc.getElementById(id) : null;
    root.setAttribute("data-jump", "");
    if (window.location.hash === hash && target) target.scrollIntoView({ block: "start", behavior: "instant" });
    else window.location.hash = hash;
    if (target) {
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      focusNoScroll(target);
    }
    setTimeout(function () { root.removeAttribute("data-jump"); }, 300);
  }
  function go(it) {
    var f = String(it.f || "");
    var at = f.indexOf("#");
    var file = at >= 0 ? f.slice(0, at) : f;
    var hash = at >= 0 ? f.slice(at) : "";
    closePop();
    clearAll();
    if (S.sheetOpen) closeSheet(false);
    if (!file || fileOf(file) === fileOf(window.location.pathname)) {
      if (hash) jumpHash(hash);
      return;
    }
    window.location.href = f;
  }
  function activate(i) {
    var entry = S.shown[i];
    if (!entry) return;
    if (entry.tag) { addTag(entry.tag); return; }
    go(entry.it);
  }
  function exactTag(q) {
    var list = (S.data && S.data.tags) || [];
    for (var i = 0; i < list.length; i++) if (norm(list[i].name) === norm(q)) return list[i].name;
    return "";
  }

  function setSearchExpanded(v) {
    each(doc.querySelectorAll(".top-search[data-search-open]"), function (b) { b.setAttribute("aria-expanded", v ? "true" : "false"); });
  }
  function openSheet(opener) {
    if (!sSheet || !sSlot || !sField) return;
    if (S.sheetOpen) { focusNoScroll(sInput); return; }
    clearTimeout(S.homeTimer);
    S.sheetOpen = true;
    S.opener = opener || null;
    sSlot.appendChild(sField);
    popInto(true);
    sSheet.classList.add("is-open");
    if (sScrim) sScrim.classList.add("is-open");
    setSearchExpanded(true);
    loadIndex();
    focusNoScroll(sInput);
  }
  function closeSheet(restore) {
    if (!S.sheetOpen) return;
    S.sheetOpen = false;
    closePop();
    sSheet.classList.remove("is-open");
    if (sScrim) sScrim.classList.remove("is-open");
    setSearchExpanded(false);
    var back = S.opener;
    S.opener = null;
    if (restore !== false && back && back.isConnected && visible(back)) back.focus();
    else if (doc.activeElement === sInput) sInput.blur();
    /* 面板淡出走完再把搜索框搬回侧栏（窗口变宽了就立刻搬） */
    clearTimeout(S.homeTimer);
    var home = function () {
      if (S.sheetOpen) return;
      if (sHome && sField.parentNode !== sHome) sHome.appendChild(sField);
      popInto(false);
    };
    if (narrow() && !reduced()) S.homeTimer = setTimeout(home, 260); else home();
  }
  function openSearch(from) {
    if (!sInput) return;
    loadIndex();
    if (narrow()) {
      if (panelOpen()) { var op = moreOpener; closeMore(false); from = op || from; }
      openSheet(from && from !== doc.body ? from : null);
    } else {
      S.returnTo = from && from !== doc.body && from !== sInput ? from : null;
      sInput.focus();
      sInput.select();
    }
  }

  if (sInput && sField && sPop) {
    sInput.addEventListener("focus", function () { loadIndex(); S.dismissed = false; update(); });
    sInput.addEventListener("blur", function () { S.imeKeyDown = false; closePop(); });
    sInput.addEventListener("compositionstart", function () { S.composing = true; });
    sInput.addEventListener("compositionend", function () { S.composing = false; S.dismissed = false; update(); });
    sInput.addEventListener("input", function (e) {
      if (e.isComposing || S.composing) return;      /* 组字期间不更新，compositionend 补一次 */
      S.dismissed = false;
      update();
    });
    sInput.addEventListener("keyup", function () { S.imeKeyDown = false; });
    sInput.addEventListener("keydown", function (e) {
      /* 合成态的按键归输入法：选词的回车、取消选词的 Esc、翻候选的方向键。只记旗标，不 preventDefault。 */
      S.imeKeyDown = Boolean(e.isComposing);
      if (composing(e)) return;
      var open = !sPop.hidden;
      if (e.key === "Escape") {
        e.preventDefault();
        if (open) { S.dismissed = true; closePop(); return; }                     /* 第一下：只收列表 */
        if (sInput.value || S.tags.length) { clearAll(); S.dismissed = false; announce("已清空搜索"); return; }  /* 第二下：清空 */
        if (S.sheetOpen) { closeSheet(); return; }                               /* 第三下：离开 */
        var back = S.returnTo;
        S.returnTo = null;
        if (back && back.isConnected && visible(back)) back.focus(); else sInput.blur();
        return;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        if (!open) {
          if (e.key === "ArrowDown" && (sInput.value.trim() || S.tags.length)) { e.preventDefault(); S.dismissed = false; update(); }
          return;
        }
        e.preventDefault();
        var lastIdx = sList.querySelectorAll('[role="option"]').length - 1;
        /* 从「无」按 ↓ 到第0项；第0项按 ↑ 回到「无」；末项按 ↓ 停住（不回卷） */
        setCursor(e.key === "ArrowDown" ? Math.min(S.cursor + 1, lastIdx) : Math.max(S.cursor - 1, -1));
        return;
      }
      if (e.key === "Enter") {
        if (open && S.cursor >= 0) { e.preventDefault(); activate(S.cursor); }
        return;                                    /* 没有当前项：不拦，交给表单提交 */
      }
      if (e.key === "Backspace" && !sInput.value && sInput.selectionStart === 0) {
        var chips = sField.querySelectorAll(".search-chip:not(.is-removing)");
        if (!chips.length) return;
        e.preventDefault();
        removeTag(chips[chips.length - 1]);
      }
    });
    /* 隐式提交不经过 keydown 分支：这里只认 isComposing（不认 229，安卓软键盘不在合成时也常报 229） */
    sField.addEventListener("submit", function (e) {
      e.preventDefault();
      if (S.imeKeyDown) return;
      var q = sInput.value.trim();
      if (q.charAt(0) === "#") { var t = exactTag(q.slice(1).trim()); if (t) addTag(t); return; }
      if (S.cursor >= 0) { activate(S.cursor); return; }
      for (var i = 0; i < S.shown.length; i++) if (S.shown[i].it && !S.shown[i].near) { go(S.shown[i].it); return; }
    });
    /* 点框里的空白等于点输入框；点胶囊叉号不抢焦点 */
    sField.addEventListener("mousedown", function (e) {
      if (e.target === sInput) return;
      e.preventDefault();
      if (!e.target.closest(".sc-x")) focusNoScroll(sInput);
    });
    sField.addEventListener("click", function (e) {
      var x = e.target.closest ? e.target.closest(".sc-x") : null;
      if (x) removeTag(x.closest(".search-chip"));
    });
    sField.addEventListener("pointerenter", loadIndex);
    /* 选项按下不让输入框失焦（否则 blur 先把列表收掉、click 落空）；键盘与鼠标共用一个高亮 */
    sPop.addEventListener("mousedown", function (e) { e.preventDefault(); });
    sPop.addEventListener("click", function (e) {
      var o = e.target.closest ? e.target.closest('[role="option"]') : null;
      if (o) activate(Number(o.getAttribute("data-k")));
    });
    sPop.addEventListener("mousemove", function (e) {
      var o = e.target.closest ? e.target.closest('[role="option"]') : null;
      if (!o) return;
      var k = Number(o.getAttribute("data-k"));
      if (k !== S.cursor) setCursor(k);
    });
    window.addEventListener("resize", function () { if (!sPop.hidden) placePop(); });
    window.addEventListener("scroll", function () { if (!sPop.hidden) placePop(); }, { passive: true, capture: true });
  }

  /* 打开入口：顶栏搜索钮、「更多」面板里的入口；悬停 / 聚焦时先把索引注入 */
  doc.addEventListener("click", function (e) {
    var o = e.target.closest ? e.target.closest("[data-search-open]") : null;
    if (o) { openSearch(panel && panel.contains(o) ? (moreOpener || moreToggleVisible()) : o); return; }
    var c = e.target.closest ? e.target.closest("[data-search-close]") : null;
    if (c && S.sheetOpen) closeSheet();
  });
  each(doc.querySelectorAll("[data-search-open]"), function (b) {
    b.addEventListener("pointerenter", loadIndex);
    b.addEventListener("focus", loadIndex);
  });
  /* 浮层：Tab 困在面板里；焦点不在输入框上时 Esc 直接关（输入框自己的 Esc 分层在上面） */
  if (sSheet) sSheet.addEventListener("keydown", function (e) {
    if (composing(e)) return;
    if (e.key === "Escape") {
      if (e.defaultPrevented || e.target === sInput) return;
      e.preventDefault();
      closeSheet();
      return;
    }
    if (e.key !== "Tab") return;
    var f = focusables(sSheet);
    if (!f.length) return;
    var first = f[0];
    var last = f[f.length - 1];
    if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  onMq(mqNarrow, function () {
    if (!narrow() && S.sheetOpen) closeSheet(false);
    if (narrow() && !S.sheetOpen && doc.activeElement === sInput) sInput.blur();
  });

  /* 快捷键：「/」与 Ctrl/⌘+K。焦点在输入框、可编辑区，或别的弹层开着时不抢。 */
  function editable(el) {
    if (!el || el === doc.body) return false;
    if (el.isContentEditable) return true;
    var tag = el.tagName;
    if (tag === "TEXTAREA" || tag === "SELECT") return true;
    if (tag === "INPUT") return !/^(button|checkbox|radio|range|color|file|image|reset|submit)$/i.test(el.type || "text");
    var role = el.getAttribute && el.getAttribute("role");
    return role === "textbox" || role === "combobox" || role === "searchbox";
  }
  doc.addEventListener("keydown", function (e) {
    if (composing(e) || e.defaultPrevented) return;
    var slash = e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey;
    var cmdK = (e.key === "k" || e.key === "K") && (e.ctrlKey || e.metaKey) && !e.altKey && !e.shiftKey;
    if (!slash && !cmdK) return;
    if (editable(doc.activeElement)) return;
    if (S.sheetOpen || kitOpen()) return;
    var modals = doc.querySelectorAll('[aria-modal="true"], .kit-layer[data-state="open"]');
    for (var i = 0; i < modals.length; i++) if (modals[i] !== panel && modals[i] !== sSheet && visible(modals[i])) return;
    e.preventDefault();
    openSearch(doc.activeElement);
  });

  /* ---------- 13. 跳转点亮 ---------- */
  var ring = null;
  function cssStr(s) { return '"' + String(s).replace(/["\\]/g, "\\$&") + '"'; }
  function firstVisible(sel) {
    var list = doc.querySelectorAll(sel);
    for (var i = 0; i < list.length; i++) if (visible(list[i])) return list[i];
    return null;
  }
  /* 外壳内置的跳转点：不用在页面上写 data-spot */
  function spotBuiltin(name) {
    switch (name) {
      case "copy": return firstVisible(".page [data-copy]") || firstVisible("[data-copy]");
      case "pull": return firstVisible(".codebox.is-pull");
      case "trap": return firstVisible(".fact.trap");
      case "search": return firstVisible(".search-field") || firstVisible(".top-search");
      case "nav": return phone() ? firstVisible(".tabbar") : firstVisible(".side-nav");
      case "brand": return firstVisible(".side .brand");
      case "skip": return doc.querySelector(".skip");
      case "pagein": return firstVisible("main.page > .page-head");   /* 切页进场（mo-page）：进场的是正文，页头是第一眼看到的那块 */
      case "more":
        if (!narrow()) return firstVisible(".side-foot");
        if (!panelOpen()) openMore(moreToggleVisible());
        return panel;
      default: return null;
    }
  }
  function spotTarget(name) {
    var list = doc.querySelectorAll("[data-spot~=" + cssStr(name) + "]");
    var i;
    for (i = 0; i < list.length; i++) if (visible(list[i])) return list[i];
    /* 看不见、但在「更多」面板里（≤900 的外观控件）：先打开面板 */
    for (i = 0; i < list.length; i++) {
      if (panel && panel.contains(list[i]) && narrow()) {
        if (!panelOpen()) openMore(moreToggleVisible());
        return list[i];
      }
    }
    return spotBuiltin(name);
  }
  function dropRing() {
    if (ring && ring.parentNode) ring.parentNode.removeChild(ring);
    ring = null;
  }
  function ringOn(el) {
    dropRing();
    var rm = reduced();
    var r0 = doc.createElement("div");
    r0.className = "spot-ring" + (rm ? " is-static" : "");
    r0.setAttribute("aria-hidden", "true");
    var rad = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0;
    r0.style.borderRadius = Math.round(rad + 5) + "px";
    doc.body.appendChild(r0);
    ring = r0;
    var until = Date.now() + (rm ? 2000 : 1200);
    var last = "";
    function place() {
      if (ring !== r0) return;
      if (Date.now() > until || !el.isConnected) { dropRing(); return; }
      var b = el.getBoundingClientRect();
      var key = [b.left, b.top, b.width, b.height].join();
      if (key !== last) {
        last = key;
        r0.style.left = Math.round(b.left - 5) + "px";
        r0.style.top = Math.round(b.top - 5) + "px";
        r0.style.width = Math.round(b.width + 10) + "px";
        r0.style.height = Math.round(b.height + 10) + "px";
      }
      window.requestAnimationFrame(place);
    }
    place();
    setTimeout(function () { if (ring === r0) dropRing(); }, (rm ? 2000 : 1200) + 200);   /* 后台标签页 rAF 停着时的兜底 */
  }
  function spot(name) {
    if (!name) return null;
    var el = spotTarget(name);
    if (!el) return null;
    var inShell = el.closest(".side, .tabbar, .more-panel, .search-sheet, .skip");
    el.scrollIntoView({ block: inShell ? "nearest" : "center", inline: "nearest", behavior: "instant" });
    if (name === "skip") el.focus();
    ringOn(el);
    return el;
  }
  function spotFromHash() {
    var h = window.location.hash || "";
    if (h.indexOf("#spot-") !== 0) return null;
    var name = h.slice(6);
    try { name = decodeURIComponent(name); } catch (e) { /* 保持原样 */ }
    return spot(name);
  }
  window.addEventListener("hashchange", spotFromHash);
  /* 同一个 #spot- 地址再点一次：地址没变不会有 hashchange，这里补一下 */
  doc.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest('a[href*="#spot-"]') : null;
    if (!a || a.hash !== window.location.hash) return;
    if (fileOf(a.pathname) !== fileOf(window.location.pathname)) return;
    spotFromHash();
  });

  /* ---------- 14. 按压倾斜 ---------- */
  var PRESS_SEL = "a.row, .list .row, [data-press]";
  /* 按在这些上面不倾（只拦被按元素里面的后代；被按的元素自己是链接 / 按钮时照常倾）。[data-press-block] 是给页面的钩子 */
  var PRESS_BLOCK = "button, a[href], summary, input, select, textarea, .specimen, iframe, [data-press-block]";
  var PRESS_ROW = {
    mouse: { maxDeg: 1, scale: 0.985, edge: 1 / 32 },
    touch: { maxDeg: 3, scale: 0.97, edge: 1 / 16 }
  };
  var PRESS_CARD = { maxDeg: 7, scale: 0.96 };
  var SPRING_LINEAR = "linear(0, .06, .208, .4, .6, .784, .935, 1.047, 1.119, 1.155, 1.163, 1.149, 1.123, 1.091, 1.059, 1.03, 1.007, .99, .979, .974, .974, .976, .981, .986, .991, .996, 1, 1.002, 1)";
  var springOk = false;
  try { springOk = !!(window.CSS && CSS.supports && CSS.supports("transition-timing-function", "linear(0, 1)")); } catch (e) { springOk = false; }
  var PRESS_IN = { duration: 140, easing: EASE_OUT };
  var PRESS_OUT = { duration: 700, easing: springOk ? SPRING_LINEAR : "cubic-bezier(.34, 1.56, .64, 1)" };
  var PRESS_CANCEL = { duration: 160, easing: EASE_OUT };
  var PRESS_DRAG = 6;
  var REST = { rx: 0, ry: 0, s: 1 };
  var pressTracks = typeof WeakMap === "function" ? new WeakMap() : null;
  var pp = null;   /* 指针按压 { el, id, x, y } */
  var kp = null;   /* 键盘按压的元素 */
  function n4(v) { return Number(v.toFixed(4)); }
  function tiltCss(depth, t) {
    return "perspective(" + n4(depth) + "px) rotateX(" + n4(t.rx) + "deg) rotateY(" + n4(t.ry) + "deg) scale(" + n4(t.s) + ")";
  }
  /* 此刻的值：按动画的（缓动后）进度在起止之间插值，被打断时从这里接着走，不跳 */
  function trackNow(tr) {
    if (!tr || !tr.anim) return null;
    var p = tr.anim.effect && tr.anim.effect.getComputedTiming ? tr.anim.effect.getComputedTiming().progress : null;
    if (typeof p !== "number") p = tr.anim.playState === "finished" ? 1 : 0;
    return { rx: tr.from.rx + (tr.to.rx - tr.from.rx) * p, ry: tr.from.ry + (tr.to.ry - tr.from.ry) * p, s: tr.from.s + (tr.to.s - tr.from.s) * p };
  }
  function trackStop(tr) {
    if (!tr || !tr.anim) return;
    tr.anim.onfinish = null;
    tr.anim.cancel();
    tr.anim = null;
  }
  function pressTarget(t) {
    if (!t || !t.closest) return null;
    var el = t.closest(PRESS_SEL);
    if (!el || el.getAttribute("aria-disabled") === "true") return null;
    if (!el.hasAttribute("data-press") && el.closest(".specimen")) return null;   /* 样例里的行演示的是它自己的手感 */
    var block = t.closest(PRESS_BLOCK);
    if (block && block !== el && el.contains(block)) return null;
    return el;
  }
  function isRow(el) {
    var p = el.getAttribute("data-press");
    if (p === "row") return true;
    if (p === "card") return false;
    return el.matches("a.row, .list .row");
  }
  function pressOn(el, x, y, touch, center) {
    if (!canAnimate || !pressTracks || reduced()) return;
    var st = pressTracks.get(el) || { tr: null, depth: 0, pressed: false };
    pressTracks.set(el, st);
    var from = trackNow(st.tr) || REST;
    trackStop(st.tr);
    st.pressed = true;
    var rect = el.getBoundingClientRect();     /* 动画撤掉之后再量：量到的是没变换的盒子 */
    var hx = rect.width / 2;
    var hy = rect.height / 2;
    var fx = center ? 0 : clamp((x - rect.left - hx) / Math.max(hx, 1), -1, 1);
    var fy = center ? 0 : clamp((y - rect.top - hy) / Math.max(hy, 1), -1, 1);
    var to;
    if (isRow(el)) {
      var prof = touch ? PRESS_ROW.touch : PRESS_ROW.mouse;
      if (center) prof = PRESS_ROW.mouse;
      st.depth = rect.height * 12;
      /* 两端因倾斜产生的位移 ≈ 半宽² · sinθ / 透视距离，不超过行高 × edge */
      var sinY = prof.edge * rect.height * st.depth / Math.max(hx * hx, 1);
      var maxY = Math.min(prof.maxDeg, Math.asin(Math.min(1, sinY)) * 180 / Math.PI);
      to = { rx: -prof.maxDeg * fy, ry: maxY * fx, s: prof.scale };
    } else {
      st.depth = 900 * scaleU();
      to = { rx: -PRESS_CARD.maxDeg * fy, ry: PRESS_CARD.maxDeg * fx, s: PRESS_CARD.scale };
    }
    st.tr = { from: from, to: to, anim: el.animate([{ transform: tiltCss(st.depth, from) }, { transform: tiltCss(st.depth, to) }], { duration: PRESS_IN.duration, easing: PRESS_IN.easing, fill: "forwards" }) };
  }
  function pressOff(el, cancelled) {
    var st = el && pressTracks ? pressTracks.get(el) : null;
    if (!st || !st.pressed) return;
    st.pressed = false;
    var from = trackNow(st.tr);
    trackStop(st.tr);
    st.tr = null;
    if (!from || !el.isConnected) return;
    var tm = cancelled ? PRESS_CANCEL : PRESS_OUT;
    var tr = { from: from, to: REST, anim: null };
    tr.anim = el.animate([{ transform: tiltCss(st.depth, from) }, { transform: tiltCss(st.depth, REST) }], { duration: tm.duration, easing: tm.easing, fill: "forwards" });
    /* 弹簧只管这一次复原：走完就撤掉动画，回到 transform:none，下一次按下不会也过冲 */
    tr.anim.onfinish = function () { if (st.tr === tr) { trackStop(tr); st.tr = null; } };
    st.tr = tr;
  }
  function releasePointer(e, cancelled) {
    if (!pp || (e && e.pointerId !== pp.id)) return;
    var el = pp.el;
    pp = null;
    pressOff(el, cancelled);
  }
  doc.addEventListener("pointerdown", function (e) {
    if (!e.isPrimary || e.button !== 0) return;
    var el = pressTarget(e.target);
    if (!el) return;
    if (pp) releasePointer(null, true);
    pp = { el: el, id: e.pointerId, x: e.clientX, y: e.clientY };
    pressOn(el, e.clientX, e.clientY, e.pointerType !== "mouse", false);
  }, { passive: true });
  doc.addEventListener("pointermove", function (e) {
    if (!pp || e.pointerId !== pp.id) return;
    if (Math.abs(e.clientX - pp.x) > PRESS_DRAG || Math.abs(e.clientY - pp.y) > PRESS_DRAG) releasePointer(e, true);
  }, { passive: true });
  doc.addEventListener("pointerup", function (e) { releasePointer(e, false); }, { capture: true, passive: true });
  doc.addEventListener("pointercancel", function (e) { releasePointer(e, true); }, { capture: true, passive: true });
  doc.addEventListener("dragstart", function () { if (pp) releasePointer(null, true); }, true);
  function pressKey(e) { return e.key === " " || e.key === "Enter"; }
  doc.addEventListener("keydown", function (e) {
    if (composing(e) || e.repeat || e.altKey || e.ctrlKey || e.metaKey || !pressKey(e)) return;
    var el = e.target && e.target.matches && e.target.matches(PRESS_SEL) ? pressTarget(e.target) : null;
    if (!el || kp) return;
    kp = el;
    pressOn(el, 0, 0, false, true);
  });
  doc.addEventListener("keyup", function (e) {
    if (!kp || !pressKey(e)) return;
    var el = kp;
    kp = null;
    pressOff(el, false);
  });
  window.addEventListener("blur", function () {
    if (pp) releasePointer(null, true);
    if (kp) { var el = kp; kp = null; pressOff(el, true); }
  });

  /* ---------- 15. 长代码下拉展开 ---------- */
  var PULL_MIN = 14;           /* 超过这么多行才收起（理由见文件头第15条） */
  var PULL_SHOW = 8;
  var PULL_AT = 0.4;           /* 原文：超过40%松手就展开 */
  var pulls = [];
  function lineCount(pre) {
    var t = String(pre.textContent || "").replace(/\n+$/, "");
    return t ? t.split("\n").length : 0;
  }
  function pullMeasure(P) {
    var cs = getComputedStyle(P.pre);
    var lh = parseFloat(cs.lineHeight);
    if (!lh) lh = (parseFloat(cs.fontSize) || 13) * 1.65;
    var top = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.borderTopWidth) || 0);
    P.h0 = Math.round(top + PULL_SHOW * lh);
    P.h1 = Math.max(P.h0, P.pre.offsetHeight);
    P.clip.style.setProperty("--code-h", P.h0 + "px");
    P.clip.style.setProperty("--code-full", P.h1 + "px");
  }
  function pullLabel(P) {
    P.handle.setAttribute("aria-expanded", P.open ? "true" : "false");
    P.handle.setAttribute("aria-label", P.open ? "收起，只看前" + PULL_SHOW + "行" : "展开全部" + P.n + "行代码");
    P.text.textContent = P.open ? "向上推回，只看前" + PULL_SHOW + "行" : "向下拉开，共" + P.n + "行";
  }
  function pullSet(P, v) {
    P.open = v;
    P.box.classList.toggle("is-open", v);
    pullLabel(P);
  }
  function setupPull(box, pre, n) {
    var clip = doc.createElement("div");
    clip.className = "code-clip";
    box.insertBefore(clip, pre);
    clip.appendChild(pre);
    if (!pre.id) pre.id = "star-code-" + (++codeSeq);
    var strip = doc.createElement("div");
    strip.className = "code-pull";
    strip.innerHTML = '<button type="button" class="code-handle" aria-controls="' + pre.id + '"><i aria-hidden="true"></i><span class="code-handle-text" aria-hidden="true"></span></button>';
    box.appendChild(strip);
    box.classList.add("is-pull");
    var P = { box: box, clip: clip, pre: pre, strip: strip, handle: strip.firstChild, text: strip.querySelector(".code-handle-text"), n: n, open: false, h0: 0, h1: 0, drag: null, swallow: false };
    pullLabel(P);
    pullMeasure(P);
    pulls.push(P);
    var h = P.handle;
    h.addEventListener("pointerdown", function (e) {
      if (e.button !== 0 || !e.isPrimary) return;
      P.swallow = false;
      pullMeasure(P);
      P.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false, p: P.open ? 1 : 0, from: P.open, d: Math.max(1, P.h1 - P.h0) };
      try { h.setPointerCapture(e.pointerId); } catch (err) { /* 不支持就靠冒泡 */ }
    });
    h.addEventListener("pointermove", function (e) {
      var D = P.drag;
      if (!D || e.pointerId !== D.id) return;
      var dy = e.clientY - D.y;
      var dx = e.clientX - D.x;
      if (!D.moved) {
        if (Math.abs(dy) < 4 && Math.abs(dx) < 4) return;
        D.moved = true;
        box.classList.add("is-dragging");      /* 拖动中关掉过渡，直接跟手 */
      }
      var y = (D.from ? D.d : 0) + dy;
      if (y > D.d) y = D.d + (y - D.d) / 3;    /* 拉过头带阻尼 */
      if (y < 0) y = y / 3;
      var p = y / D.d;
      D.p = p;
      /* 摆动：随拉开程度先歪后正（正弦），左右拖再加一点；封顶 ±2 度 */
      var rot = clamp(2 * Math.sin(clamp(p, 0, 1) * Math.PI) + dx * 0.04, -2, 2);
      clip.style.height = Math.max(0, P.h0 + y).toFixed(1) + "px";
      strip.style.transform = "rotate(" + rot.toFixed(3) + "deg)";
    });
    function end(e, cancelled) {
      var D = P.drag;
      if (!D || e.pointerId !== D.id) return;
      P.drag = null;
      if (!D.moved) return;                    /* 没拖动：交给 click */
      /* 拖过的那一下要吞掉随后的 click（鼠标松开紧跟着就是 click，同一个任务里）；触摸拖动后根本没有 click，
         旗标不能留到下一次——下一拍就放掉，不然键盘的回车会被它吃掉（2026-10-08 417 触摸实测） */
      P.swallow = true;
      setTimeout(function () { P.swallow = false; }, 0);
      box.classList.remove("is-dragging");
      clip.style.height = "";
      strip.style.transform = "";
      pullSet(P, cancelled ? D.from : (D.from ? D.p > 1 - PULL_AT : D.p > PULL_AT));
    }
    h.addEventListener("pointerup", function (e) { end(e, false); });
    h.addEventListener("pointercancel", function (e) { end(e, true); });
    h.addEventListener("click", function (e) {
      if (P.swallow && e.detail > 0) { P.swallow = false; return; }   /* 键盘的 click（detail 0）从不吞 */
      pullMeasure(P);
      pullSet(P, !P.open);
    });
    h.addEventListener("keydown", function (e) {
      if (composing(e)) return;
      if (e.key === "ArrowDown" && !P.open) { e.preventDefault(); pullMeasure(P); pullSet(P, true); }
      else if ((e.key === "ArrowUp" || e.key === "Escape") && P.open) { e.preventDefault(); e.stopPropagation(); pullSet(P, false); }
    });
  }
  var pullRaf = 0;
  function remeasurePulls() {
    cancelAnimationFrame(pullRaf);
    pullRaf = requestAnimationFrame(function () { each(pulls, function (P) { if (!P.drag) pullMeasure(P); }); });
  }
  window.addEventListener("resize", remeasurePulls);
  window.addEventListener("load", remeasurePulls);

  /* ---------- 16. 「接着看」记录 ---------- */
  var resumeTimer = 0;
  function recordResume() {
    var page = NAV ? NAV.current : (doc.body.getAttribute("data-page") || "");
    if (!page) return;
    var sel = page === "collection" ? ".col-card" : ".page .entry";
    var list = doc.querySelectorAll(sel);
    if (!list.length) return;
    var topLine = narrow() ? topCover() : 0;
    var vh = window.innerHeight;
    var hit = null;
    for (var i = 0; i < list.length; i++) {
      var r = list[i].getBoundingClientRect();
      if (r.bottom > topLine + 8 && r.top < vh && r.height > 0) { hit = list[i]; break; }
    }
    if (!hit || !hit.id) return;
    var pt = "";
    if (NAV) each(NAV.pages, function (p) { if (p.id === page) pt = p.title; });
    var rec = { p: page, pt: pt, id: hit.id, t: textOf(hit.querySelector("h3")), at: Date.now() };
    try { window.localStorage.setItem("star-last", JSON.stringify(rec)); } catch (e) { /* 存不住就算了 */ }
  }
  window.addEventListener("scroll", function () {
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(recordResume, 1500);
  }, { passive: true });

  /* ---------- 17. 大图上的透明顶栏 ---------- */
  var heroRaf = 0;
  var heroLive = false;
  var side = doc.querySelector(".side");
  var pageEl = doc.querySelector("main.page");
  /* 正文此刻被 CSS 进场（page-in，下移8px 回到0）挪了多少：判定按布局位置算，扣掉这段位移——
     不扣的话开页第一帧图还没顶到顶，首屏会判成不透明（index 子代理 417 实测） */
  function pageShiftY() {
    if (!pageEl) return 0;
    var t = getComputedStyle(pageEl).transform;
    if (!t || t === "none") return 0;
    try {
      var M = window.DOMMatrixReadOnly || window.DOMMatrix || window.WebKitCSSMatrix;
      return M ? new M(t).m42 || 0 : 0;
    } catch (e) { return 0; }
  }
  function refreshHero() {
    heroRaf = 0;
    var over = false;
    var hero = doc.querySelector("[data-hero]");
    if (hero && side && narrow()) {
      var b = side.getBoundingClientRect();
      var h = hero.getBoundingClientRect();
      var dy = pageEl && pageEl.contains(hero) ? pageShiftY() : 0;
      /* 整条顶栏都压在大图上才透明：图的上沿不低于顶栏上沿、下沿不高于顶栏下沿 */
      over = b.bottom > 0 && h.top - dy <= b.top + 1 && h.bottom - dy >= b.bottom - 1;
    }
    if (over !== root.hasAttribute("data-over-hero")) {
      if (over) root.setAttribute("data-over-hero", ""); else root.removeAttribute("data-over-hero");
    }
    /* 第一次判完：摘掉 CSS 的开页预判（data-hero-checked，见 star.css 第18节），下一帧再放开切换过渡——
       开页那一下直接是对的样子，不从玻璃渐变成透明 */
    if (!heroLive) {
      heroLive = true;
      root.setAttribute("data-hero-checked", "");
      window.requestAnimationFrame(function () { root.classList.add("hero-live"); });
    }
  }
  function queueHero() { if (!heroRaf) heroRaf = window.requestAnimationFrame(refreshHero); }
  window.addEventListener("scroll", queueHero, { passive: true });
  window.addEventListener("resize", queueHero);
  onMq(mqNarrow, queueHero);
  /* 进场走完再判一次（兜底：位移读不到的内核） */
  if (pageEl) pageEl.addEventListener("animationend", function (e) { if (e.target === pageEl) queueHero(); });

  /* ---------- 18. 切页：旧页一侧 ---------- */
  window.addEventListener("pageswap", function (e) {
    var vt = e && e.viewTransition;
    if (!vt) return;
    /* 三个 promise 先接住（跳过会让它们 reject）。file:// 下也做（Chrome 会给同目录页面起跨文档过渡，屋主是双击打开的） */
    if (vt.ready) vt.ready.then(noop, noop);
    if (vt.finished) vt.finished.then(noop, noop);
    if (vt.updateCallbackDone) vt.updateCallbackDone.then(noop, noop);
    if (reduced() || blurTier() !== "full") {
      try { vt.skipTransition(); } catch (err) { /* 已结束 */ }
      return;
    }
    /* ≤600 顶栏随页面滚走：滚出视口了就不给它起名（不然新页的顶栏会从视口外飞进来） */
    if (side) {
      var r = side.getBoundingClientRect();
      side.style.viewTransitionName = r.bottom > 0 && r.top < window.innerHeight ? "" : "none";
    }
    root.classList.add("vt-nav");
  });
  window.addEventListener("pageshow", function (e) {
    if (!e.persisted) return;
    root.classList.remove("vt-nav");
    if (side) side.style.viewTransitionName = "";
  });

  /* ---------- 起步 ---------- */
  /* 侧栏导航只滚中间那段（视口比 1440 构图扁时装不下，见 star.css 第7节）：当前页那一项要在看得见的地方，
     只动 .side-nav 自己的 scrollTop，不滚页面。601–900的顶栏里导航横排（第12节），十章全上线后768一屏装不下，
     同样只动它自己的 scrollLeft；≤600时导航在底部 tab bar，不管 */
  function revealCurrentNav() {
    if (phone()) return;
    var nav = doc.querySelector(".side-nav");
    var cur = nav ? nav.querySelector(".nav-item[aria-current]") : null;
    if (!cur) return;
    var nr = nav.getBoundingClientRect();
    var ir = cur.getBoundingClientRect();
    if (narrow()) {
      if (nav.scrollWidth <= nav.clientWidth + 1) return;
      if (ir.right > nr.right - 4) nav.scrollLeft += ir.right - nr.right + 12;
      else if (ir.left < nr.left + 4) nav.scrollLeft -= nr.left - ir.left + 12;
      return;
    }
    if (nav.scrollHeight <= nav.clientHeight + 1) return;
    if (ir.bottom > nr.bottom - 4) nav.scrollTop += ir.bottom - nr.bottom + 12;
    else if (ir.top < nr.top + 4) nav.scrollTop -= nr.top - ir.top + 12;
  }
  onMq(mqNarrow, revealCurrentNav);   /* 窗口跨过900：导航从竖排换横排（或反过来），重新滚一次 */
  onMq(mqPhone, revealCurrentNav);
  enhanceCode(doc);
  buildChapters();
  function onReady() { buildToc(); enhanceCode(doc); checkCount(); queueHero(); revealCurrentNav(); }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", onReady);
  else onReady();
  /* load 之后：跳转点亮（页专属脚本渲染的元素这时都在了），再摘掉 data-jump 放回平滑滚动 */
  function onLoad() {
    window.requestAnimationFrame(function () {
      spotFromHash();
      setTimeout(function () { root.removeAttribute("data-jump"); }, 300);
    });
  }
  if (doc.readyState === "complete") onLoad(); else window.addEventListener("load", onLoad);

  window.StarShell = {
    buildToc: buildToc,
    enhanceCode: enhanceCode,
    announce: announce,
    copy: copyText,
    closeMore: closeMore,
    blurTier: blurTier,
    openSearch: openSearch,
    spot: spot,
    refreshHero: refreshHero,
    resetLook: function (from) { resetLook(from || null, null); }
  };
})();
