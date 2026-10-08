/*
 * 收藏页：读 data/collection.js 的 window.STAR_COLLECTION，按类型分四组画卡片，上方两排筛选（类型单选、标签多选）。
 * 普通 defer 脚本（file:// 下 module / fetch 会静默失效）；数据全部用 textContent 写进 DOM，不拼 HTML。
 * 前面先加载外壳 star.js（StarShell.announce / copy、按压倾斜、跳转点亮）与套件 kit.js（StarKit.photo / lightbox / flip）；
 * 套件没读到时详情、灯箱、翻面不动，筛选与演示照常。
 *
 * 筛选（两排取交集；每次打开都是「全部」，不记住上次——行为不取决于用户忘掉的往事）：
 * - 类型 = 单选（交互页 ix-filter）：全部 / Skill / 项目 / 提示词 / 特效与小游戏。选中那枚左侧长出对勾
 *   （220ms cubic-bezier(.22,1,.36,1)，scale(.2) rotate(-30deg) → 1）、底色从左铺满（scaleX 0→1，同一条曲线），
 *   相邻胶囊 FLIP 让位（220ms 同一条曲线），胶囊里的字按「相对胶囊」的位置补位。再点已选中的不取消，想看全部点「全部」。
 * - 标签 = 多选（ix-filter-multi：刷刷做过、屋主看后撤回；star 是展台，屋主2026-10-08要求用遍，例外写在交互页
 *   「只升级已有交互」）。button + aria-pressed，对勾与铺底同单选，FLIP 照交互页多选样例 240ms cubic-bezier(.2,.8,.2,1)。
 *   标签之间取并集（选了的任一个都算）；有选中时计数旁边出一个「清除」。只出现一次的标签收在「更多标签」后面，
 *   选中的、以及收着时刚取消的那枚留在外面（免得按着的胶囊在手底下消失、焦点掉到页首）。
 * - 计数「显示N条」值变了才跳（bump-in：opacity 0、translateY(-45%) scale(1.15) → 1，220ms；首次渲染不跳）；
 *   筛出几条走外壳 StarShell.announce（全站一个 polite 区 #star-live；外壳也是先清空、隔60ms再写，连点只播最后一句），
 *   页面里不另设 aria-live；外壳没加载时不播。
 * - 减弱动效：不量位置、不起动画，直接到位；卡片只淡入。
 *
 * 详情（ix-dialog 居中大对话框 + ix-sheet-photo 照片抽屉）：卡片标题是按钮（一张卡只多一个Tab位），点开 StarKit.photo，
 *   size "lg"（>600 居中、宽 min(920 × --u, 92vw)、高上限 86svh，只有抽屉滚动；≤600 贴底升起）。照片 = 这条的截图 /
 *   缩略图（翻面卡背面的图、shot 的图、link 的缩略图）；没有图的用强调色封面 + 这一类的图标。抽屉里放全部字段：
 *   是什么、屋主原话（why 不为 null 时，.said 引用）、提示词原文（带复制）、备注、标签、来源与链接、现场演示怎么看。
 *   不画进度条：收藏没有「剩余多少」这种量，「第12／55条」只是排序位置，画成一根涨上去的条是假的。
 *   弹层（详情、灯箱）开着时卸掉正在跑的演示：它被遮住看不见，软件渲染下还在每帧重画；有声音的会在弹层后面响。
 *   关上后（套件的 onClose：关闭过渡走完、收好之后调一次）：点了才跑的那个原样再开，自动跑的交还给「滚到就跑」重新挑。
 *   同一时间只跑一个的规矩不变。
 * 灯箱（ix-lightbox）：shot 的截图、link 的缩略图包在 button 里，点了 StarKit.lightbox 从原位放大、缩回原位，
 *   关了焦点还给那个 button。透明导航栏那张是页面现画的小窗（老站封面 + 黑罩 + 一条导航），不是截图——放大只会放出
 *   没罩的封面，第一帧就对不上，所以它整张仍是「去交互页玩」的链接。
 * 按压倾斜（ix-press）：.col-card 写 data-press，外壳按卡片那套数（7°、.96、松手弹簧）。外壳在按钮、链接、summary、
 *   iframe 上本来就不倾；演示框（.col-demo：没跑时的黑底占位、翻面卡、缩略图）整块写外壳的钩子 data-press-block。
 *   按在卡的空白处与文字上倾，按在能点的东西和演示框里不倾。
 * 跳转点亮（外壳 #spot-名字）：filter（类型那排）、filter-multi（标签那排）、cards（第一张卡）、detail（第一张卡的标题按钮）、
 *   flip（第一张翻面卡）、lightbox（第一个能放大的截图）。
 *
 * 现场演示（每条的 demo 字段，字段说明见 data/collection.js 文件头）：
 * - iframe：老站特效与小游戏放进卡里的16:10演示框。滚到才加载、滚出视口就卸掉（IntersectionObserver；
 *   卸掉 = src 换成 about:blank 再移除 iframe，占位放回）；全站同一时间只跑一个，开新的先卸旧的。
 *   吃显卡（heavy）、有声音（sound）、要线上地址（online）、合集（choices）的不自动跑，点「运行」才跑；
 *   减弱动效下全部不自动跑。file:// 下有 online 的用线上地址，http(s) 下一律用相对路径。
 *   sandbox 只给 allow-scripts allow-same-origin allow-popups；allow="autoplay 'none'"：老页面的音乐只能在演示框里点了才响。
 * - flip：原地翻面，行为交给 StarKit.flip（从这里原来的 flipDemo 抽出去的同一套：切 is-flipped、过90°那一帧换面、
 *   看不见的那一面 aria-hidden + inert）；样式是本页的 .col-flip-*（透视1200px、绕Y轴180°、cubic-bezier(.3,.7,.2,1) 0.8s；
 *   翻面区是真 <button>，空格回车能翻；减弱动效改原地淡入淡出）。
 * - link：缩略图（点了放大）+「去交互页玩」，跳到交互页对应样例。
 * - shot：实在不能现场跑的（Windows 程序），放截图（点了放大）或写明为什么没有。
 */
(function () {
  "use strict";

  var data = window.STAR_COLLECTION;
  var groupsBox = document.getElementById("col-groups");
  var chipsBox = document.getElementById("col-chips");
  var kindsBox = document.getElementById("col-kinds");
  var sideBox = document.getElementById("col-filter-side");
  var countEl = document.getElementById("col-count-n");
  if (!groupsBox || !chipsBox) return;
  if (!Array.isArray(data)) return; // 保留页面里那句「收藏数据没读到」

  var SVG_NS = "http://www.w3.org/2000/svg";
  var EASE = "cubic-bezier(.2,.8,.2,1)";        /* 刷刷 flipMove：卡片进场、多选让位 */
  var EASE_PLAN = "cubic-bezier(.22,1,.36,1)";  /* plan --ease-out：单选让位、计数跳动（ix-filter） */

  /* ---------- 图标：24 网格、线条 1.9、圆头圆角 ---------- */
  var ICONS = {
    skill: '<path d="m4.5 19.5 10-10"/><path d="m13 8 3 3"/><path d="M18 3.5v4M16 5.5h4"/><path d="M19.5 11.5v3M18 13h3"/><path d="M9.5 3.5v3M8 5h3"/>',
    project: '<path d="M12 3.5 19.5 7.7v8.6L12 20.5l-7.5-4.2V7.7z"/><path d="M4.5 7.7 12 12l7.5-4.3"/><path d="M12 12v8.5"/>',
    prompt: '<path d="M5.5 5h13A1.5 1.5 0 0 1 20 6.5v8.5a1.5 1.5 0 0 1-1.5 1.5H12l-4.5 3.5v-3.5h-2A1.5 1.5 0 0 1 4 15V6.5A1.5 1.5 0 0 1 5.5 5z"/><path d="M8 9.5h8M8 12.5h5"/>',
    effect: '<path d="M11 4 12.8 9.2 18 11l-5.2 1.8L11 18l-1.8-5.2L4 11l5.2-1.8z"/><path d="M18.5 3.5v3M17 5h3"/><path d="M18 16.5v3M16.5 18h3"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    external: '<path d="M7.5 16.5 16.5 7.5"/><path d="M9 7.5h7.5V15"/>',
    folder: '<path d="M3.5 7A1.5 1.5 0 0 1 5 5.5h4l2 2h8A1.5 1.5 0 0 1 20.5 9v8.5A1.5 1.5 0 0 1 19 19H5a1.5 1.5 0 0 1-1.5-1.5z"/>',
    chevron: '<path d="m9.5 6 6 6-6 6"/>',
    copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 5.5V5A1.5 1.5 0 0 0 14 3.5H6A1.5 1.5 0 0 0 4.5 5v8A1.5 1.5 0 0 0 6 14.5h.5"/>',
    calendar: '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
    play: '<path d="M8 5.6v12.8a.8.8 0 0 0 1.2.7l10-6.4a.8.8 0 0 0 0-1.4l-10-6.4A.8.8 0 0 0 8 5.6z"/>',
    stop: '<rect x="6.5" y="6.5" width="11" height="11" rx="2"/>',
    window: '<rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="M3.5 9h17"/><path d="M6.5 7h.01M9 7h.01"/>',
    sound: '<path d="M4.5 9.5h3l4.5-4v13l-4.5-4h-3z"/><path d="M15.5 9a4 4 0 0 1 0 6"/><path d="M18 6.5a7.5 7.5 0 0 1 0 11"/>',
    flip: '<path d="M4.5 12a7.5 7.5 0 0 1 13-5.1"/><path d="M18 3.5v3.8h-3.8"/><path d="M19.5 12a7.5 7.5 0 0 1-13 5.1"/><path d="M6 20.5v-3.8h3.8"/>',
    image: '<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m20.5 16-5-5-8.5 8"/>',
    close: '<path d="m7 7 10 10M17 7 7 17"/>'
  };
  function icon(name, cls) {
    var s = document.createElementNS(SVG_NS, "svg");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("fill", "none");
    s.setAttribute("stroke", "currentColor");
    s.setAttribute("stroke-width", "1.9");
    s.setAttribute("stroke-linecap", "round");
    s.setAttribute("stroke-linejoin", "round");
    s.setAttribute("aria-hidden", "true");
    s.setAttribute("focusable", "false");
    s.setAttribute("class", cls ? "i " + cls : "i"); // .i 是外壳的线条图标类
    s.innerHTML = ICONS[name]; // 常量字符串，不含数据
    return s;
  }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function reduced() {
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }
  function canAnimate(node) { return typeof node.animate === "function"; }
  function kit() { return window.StarKit || null; }
  function overlayOpen() { var K = kit(); return !!(K && K.isOpen && K.isOpen()); }

  /* ---------- 四组（scripts/build-data.mjs 从这里抠 KINDS 字面量取分组名：保持纯字面量） ---------- */
  var KINDS = [
    { key: "skill", title: "Skill", label: "Skill", sub: "好看的Agent Skill：装进项目里，让AI照着一套成熟的做法干活。" },
    { key: "project", title: "项目", label: "项目", sub: "有意思的开源项目，以及我们拿它做了什么。" },
    { key: "prompt", title: "提示词", label: "提示词", sub: "屋主写的提示词原文，附落到了哪些项目、哪个没做和为什么。" },
    { key: "effect", title: "特效与小游戏", label: "特效", sub: "老站攒下的网页特效、节日页和小游戏；署名不详的一律写「原作者不详」，不等于屋主原创。" }
  ];
  function kindOf(key) {
    for (var i = 0; i < KINDS.length; i++) if (KINDS[i].key === key) return KINDS[i];
    return null;
  }
  function kindLabel(item) {
    var k = kindOf(item.kind);
    return item.kind === "effect" && item.tags.indexOf("小游戏") !== -1 ? "小游戏" : (k ? k.label : "");
  }

  /* ---------- 卡片 ---------- */
  var FLAG_HEAVY = "【吃显卡】";
  var spotted = {}; // 跳转点只挂在第一个

  function spotOnce(node, name) {
    if (spotted[name]) return;
    spotted[name] = true;
    node.setAttribute("data-spot", name);
  }

  function badge(text, tone) {
    var b = el("span", "col-badge", null);
    b.setAttribute("data-tone", tone);
    b.appendChild(el("span", "col-badge-dot", null)).setAttribute("aria-hidden", "true");
    b.appendChild(document.createTextNode(text));
    return b;
  }
  function badgesOf(item) {
    var notes = item.notes || "";
    var box = el("div", "col-badges", null);
    if (notes.indexOf("屋主改编") !== -1) box.appendChild(badge("屋主改编", "accent"));
    if (notes.indexOf("【用过】") !== -1) box.appendChild(badge("用过", "green"));
    if (notes.indexOf(FLAG_HEAVY) !== -1) box.appendChild(badge("吃显卡", "orange"));
    return box.childNodes.length ? box : null;
  }
  /* notes：去掉【吃显卡】（已经画成徽标），「出处：」那一段另起一行小字 */
  function notesParts(item) {
    var body0 = (item.notes || "").replace(FLAG_HEAVY, "").replace(/\s+$/, "");
    var cut = body0.indexOf("出处：");
    return { main: cut > 0 ? body0.slice(0, cut).replace(/[；;\s]+$/, "") : body0, src: cut > 0 ? body0.slice(cut) : "" };
  }
  function notesInto(box, item) {
    var np = notesParts(item);
    box.appendChild(el("p", "col-notes-text", np.main));
    if (np.src) box.appendChild(pathText(el("p", "col-notes-src", null), np.src));
    return box;
  }
  function tagsList(item) {
    var tags = el("ul", "col-tags", null);
    tags.setAttribute("aria-label", "标签");
    item.tags.forEach(function (t) { tags.appendChild(el("li", null, t)); });
    return tags;
  }
  /* 公开网址、本地位置（「样例见」画成站内链接）、收录日期：卡片底栏与详情共用 */
  function sourceRows(item, box) {
    if (item.link) {
      var a = el("a", "col-link", null);
      a.href = item.link;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.appendChild(icon("external"));
      a.appendChild(el("span", null, item.link.replace(/^https?:\/\//, "").replace(/\/$/, "")));
      box.appendChild(a);
    }
    if (item.source) {
      var src = el("p", "col-source", null);
      src.appendChild(icon("folder"));
      /* source 末尾写「；样例见 某页.html#锚点」时，把这一段画成站内链接（只认本站同目录的 .html，别的照旧是文字） */
      var demo = /^(.*?)[；;]\s*样例见\s*([a-z0-9-]+\.html(?:#[a-z0-9-]+)?)\s*$/.exec(item.source);
      if (demo) {
        var wrap = el("span", "col-source-text", null);
        wrap.appendChild(pathText(el("code", null, null), demo[1]));
        wrap.appendChild(document.createTextNode("；样例见 "));
        var go = el("a", "col-source-link", demo[2]);
        go.href = demo[2];
        wrap.appendChild(go);
        src.appendChild(wrap);
      } else {
        src.appendChild(pathText(el("code", null, null), item.source));
      }
      src.setAttribute("title", "本地位置（相对工作区根）");
      box.appendChild(src);
    }
    var added = el("p", "col-added", null);
    added.appendChild(icon("calendar"));
    added.appendChild(document.createTextNode("收录于"));
    var time = el("time", null, item.added);
    time.setAttribute("datetime", item.added);
    added.appendChild(time);
    box.appendChild(added);
    return box;
  }
  /* 提示词原文 + 复制（卡里的折叠块与详情共用） */
  function promptBody(item) {
    var body = el("div", "col-prompt-body", null);
    var txt = el("p", "col-prompt-text", item.text);
    body.appendChild(txt);
    var copy = el("button", "col-copy", null);
    copy.type = "button";
    copy.appendChild(icon("copy"));
    var copyLabel = el("span", null, "复制");
    copy.appendChild(copyLabel);
    copy.setAttribute("aria-label", "复制「" + item.name + "」提示词原文");
    copy.addEventListener("click", function () { copyText(item.text, txt, copy, copyLabel); });
    body.appendChild(copy);
    return body;
  }

  function buildCard(item, kind) {
    var card = el("article", "col-card", null);
    card.id = "item-" + item.id;
    card.setAttribute("data-kind", item.kind);
    card.setAttribute("data-press", "");
    spotOnce(card, "cards");
    var nameId = "item-" + item.id + "-name";
    card.setAttribute("aria-labelledby", nameId);

    var head = el("header", "col-card-head", null);
    var ic = el("span", "col-icon", null);
    ic.setAttribute("data-kind", item.kind);
    ic.appendChild(icon(item.kind));
    head.appendChild(ic);
    var titles = el("div", "col-card-titles", null);
    /* 标题本身就是「详情」按钮：h3 里只放名字（外壳「接着看」读 h3 的字），图标 aria-hidden */
    var h = el("h3", "col-name", null);
    var nb = el("button", "col-name-btn", null);
    nb.type = "button";
    nb.setAttribute("aria-haspopup", "dialog");
    var nt = el("span", "col-name-text", item.name);
    nt.id = nameId;
    nb.appendChild(nt);
    nb.appendChild(icon("chevron", "col-name-go"));
    nb.addEventListener("click", function () { openDetail(item, nb); });
    spotOnce(nb, "detail");
    h.appendChild(nb);
    titles.appendChild(h);
    titles.appendChild(el("p", "col-kind", kindLabel(item)));
    head.appendChild(titles);

    var badges = badgesOf(item);
    if (badges) head.appendChild(badges);
    card.appendChild(head);

    card.appendChild(el("p", "col-what", item.what));

    var demoEl = buildDemo(item);
    if (demoEl) {
      demoEl.setAttribute("data-press-block", ""); // 按在演示框里卡片不倾（外壳钩子）
      card.appendChild(demoEl);
    }

    var why = el("div", "col-why", null);
    why.appendChild(el("span", "col-label", "好在哪"));
    if (item.why) {
      why.appendChild(el("p", "col-why-text", item.why));
    } else {
      why.classList.add("is-empty");
      why.appendChild(el("p", "col-why-text", "待屋主补一句"));
    }
    card.appendChild(why);

    if (item.kind === "prompt" && item.text) {
      var det = el("details", "col-prompt", null);
      var sum = el("summary", "col-prompt-sum", null);
      sum.appendChild(icon("chevron", "col-chev"));
      sum.appendChild(el("span", null, "提示词原文"));
      det.appendChild(sum);
      det.appendChild(promptBody(item));
      card.appendChild(det);
    }

    if (item.notes) {
      var n = el("div", "col-notes", null);
      n.appendChild(el("span", "col-label", "备注"));
      card.appendChild(notesInto(n, item));
    }

    card.appendChild(tagsList(item));
    card.appendChild(sourceRows(item, el("footer", "col-card-foot", null)));

    return card;
  }

  /* 路径在「/」后留断行点，窄屏上折在目录边界而不是随便哪个字母上 */
  function pathText(node, text) {
    text.split("/").forEach(function (part, i, arr) {
      node.appendChild(document.createTextNode(part + (i < arr.length - 1 ? "/" : "")));
      if (i < arr.length - 1) node.appendChild(document.createElement("wbr"));
    });
    return node;
  }

  /* 复制：用外壳的 StarShell.copy（clipboard 失败回落 execCommand）与全站播报区；外壳没加载时退回只选中文字 */
  function copyText(text, node, btn, label) {
    var shell = window.StarShell;
    function done(ok) {
      btn.classList.toggle("is-done", ok);
      label.textContent = ok ? "已复制" : "已选中";
      if (shell && shell.announce) shell.announce(ok ? "已复制提示词原文" : "复制失败，已选中原文，请手动复制");
      clearTimeout(label._t);
      label._t = setTimeout(function () { btn.classList.remove("is-done"); label.textContent = "复制"; }, 1600);
    }
    function selectOnly() {
      try {
        var r = document.createRange();
        r.selectNodeContents(node);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(r);
      } catch (e) { /* 选不中也不影响页面 */ }
      done(false);
    }
    if (shell && shell.copy) shell.copy(text).then(function () { done(true); }, selectOnly);
    else selectOnly();
  }

  /* ================================================================ 现场演示 */
  var IS_FILE = location.protocol === "file:";
  /* 不吃显卡、没声音的老特效滚到就自动跑（2040软件渲染档实测过开销，数字记在 CHANGELOG）；
     改成 false 就全部点「运行」才跑 */
  var AUTO_RUN = true;
  var AUTO_RATIO = 0.6;    // 演示框露出六成才算「滚到了」
  var AUTO_DWELL = 400;    // 停留这么久才开，快速滚过去不加载
  var demos = [];          // iframe 演示的控制器
  var active = null;       // 正在跑的那一个（全站同一时间只跑一个）
  var parked = null;       // 弹层打开时卸掉的「点了才跑」的那一个，关上后原样再开
  var ctlOf = {};          // 条目 id → 控制器（详情里写「现场演示」用）

  function buildDemo(item) {
    var d = item.demo;
    if (!d) return null;
    if (d.type === "iframe") return frameDemo(item, d);
    if (d.type === "flip") return flipDemo(item, d);
    if (d.type === "link") return linkDemo(item, d);
    if (d.type === "shot") return shotDemo(item, d);
    return null;
  }

  function img(src, w, h, alt) {
    var m = document.createElement("img");
    m.src = src;
    if (w) m.width = w;
    if (h) m.height = h;
    m.alt = alt || "";
    m.loading = "lazy";
    m.decoding = "async";
    return m;
  }

  /* ---------- iframe：老站特效与小游戏 ---------- */
  function hintOf(ctl) {
    var d = ctl.d;
    return ctl.auto ? "滚到这里会自动运行"
      : d.heavy ? "没独显的机器会卡，点了才跑"
      : d.sound ? (d.muted ? "原页面有音乐，框里不放；点了才跑" : "有声音，点了才放")
      : (d.online && IS_FILE) ? "双击打开时要走线上地址，点了才联网加载"
      : d.choices ? "选一个，点了才跑"
      : "点了才跑";
  }
  function frameDemo(item, d) {
    var ctl = { item: item, d: d, choice: d.choices ? d.choices[0] : null, frame: null, ratio: 0, userStopped: false };
    ctl.auto = !d.heavy && !d.sound && !d.online && !d.choices;

    var box = el("div", "col-demo col-live", null);
    box.setAttribute("data-state", "idle");
    var stage = el("div", "col-stage", null);
    stage._colDemo = ctl;
    var ph = el("div", "col-ph", null);
    var run = el("button", "btn col-run", null);
    run.type = "button";
    run.appendChild(icon("play"));
    run.appendChild(el("span", null, d.heavy ? "运行（吃显卡）" : "运行"));
    run.setAttribute("aria-label", "运行演示：" + item.name + (d.heavy ? "，吃显卡" : "") + (d.sound ? "，有声音" : ""));
    run.addEventListener("click", function () { ctl.userStopped = false; start(ctl, true); });
    ph.appendChild(run);
    ph.appendChild(el("p", "col-ph-hint", hintOf(ctl)));
    stage.appendChild(ph);
    box.appendChild(stage);

    if (d.choices) {
      var group = el("div", "col-choices", null);
      group.setAttribute("role", "group");
      group.setAttribute("aria-label", "选一个运行");
      var btns = [];
      d.choices.forEach(function (c, i) {
        var b = el("button", "col-choice", c.label);
        b.type = "button";
        b.setAttribute("aria-pressed", String(i === 0));
        b.addEventListener("click", function () {
          if (ctl.choice === c) return;
          ctl.choice = c;
          btns.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
          syncOpen(ctl);
          syncNote(ctl);
          if (ctl.frame) { unload(ctl, false); start(ctl, false); }
        });
        btns.push(b);
        group.appendChild(b);
      });
      box.appendChild(group);
    }

    var bar = el("div", "col-live-bar", null);
    var stop = el("button", "btn btn-tint col-stop", null);
    stop.type = "button";
    stop.hidden = true;
    stop.appendChild(icon("stop"));
    stop.appendChild(el("span", null, "停止"));
    stop.setAttribute("aria-label", "停止演示：" + item.name);
    /* 点了「停止」＝这一屏想安静：眼下看得见的演示都不再自动开，滚出视口再滚回来才恢复 */
    stop.addEventListener("click", function () {
      demos.forEach(function (x) { if (x.ratio > 0) x.userStopped = true; });
      ctl.userStopped = true;
      unload(ctl, true);
    });
    bar.appendChild(stop);
    var open = el("a", "col-open", null);
    open.target = "_blank";
    open.rel = "noopener noreferrer";
    open.appendChild(icon("window"));
    open.appendChild(el("span", null, "新窗口打开"));
    bar.appendChild(open);
    box.appendChild(bar);

    var note = el("div", "col-live-note", null);
    box.appendChild(note);

    ctl.box = box; ctl.stage = stage; ctl.ph = ph; ctl.run = run; ctl.stop = stop; ctl.open = open; ctl.note = note;
    ctlOf[item.id] = ctl; // 不往数据对象上挂东西
    syncOpen(ctl);
    syncNote(ctl);
    demos.push(ctl);
    return box;
  }

  function cur(ctl) { return ctl.choice || ctl.d; }
  function srcOf(ctl) {
    var c = cur(ctl);
    return IS_FILE && c.online ? c.online : c.src;
  }
  function syncOpen(ctl) {
    ctl.open.href = srcOf(ctl);
    ctl.open.setAttribute("aria-label", "新窗口打开：" + ctl.item.name + (ctl.choice ? "·" + ctl.choice.label : ""));
  }
  /* 声音、提示、线上地址：卡里的演示框底下与详情的「现场演示」共用 */
  function noteLines(ctl) {
    var c = cur(ctl), d = ctl.d;
    var lines = [];
    if (c.note) lines.push(c.note);
    if (c !== d && d.note) lines.push(d.note);
    if (IS_FILE && c.online) lines.push("双击打开时浏览器会拦下它的图片，这里改走线上地址 " + c.online + " ；放到服务器上用本地这份。");
    return lines;
  }
  function soundLine(c) {
    if (!c.sound) return null;
    var s = el("p", "col-live-sound", null);
    s.appendChild(icon("sound"));
    s.appendChild(el("span", null, (c.muted ? "声音：" : "有声音，点了才放：") + c.sound));
    return s;
  }
  function syncNote(ctl) {
    ctl.note.textContent = "";
    var s = soundLine(cur(ctl));
    if (s) ctl.note.appendChild(s);
    noteLines(ctl).forEach(function (t) { ctl.note.appendChild(el("p", "col-live-text", t)); });
    ctl.note.hidden = !ctl.note.childNodes.length;
  }

  /* 有 vw 的页面按 vw 宽排版再缩进框里（老页面写死了像素宽，框太窄会被裁）；框比 vw 宽就原样铺满 */
  function fit(ctl) {
    var f = ctl.frame;
    if (!f) return;
    var vw = cur(ctl).vw || ctl.d.vw || 0;
    var w = ctl.stage.clientWidth, h = ctl.stage.clientHeight;
    if (vw && w && w < vw) {
      var z = w / vw;
      f.style.width = vw + "px";
      f.style.height = (h / z) + "px";
      f.style.transform = "scale(" + z + ")";
    } else {
      f.style.width = ""; f.style.height = ""; f.style.transform = "";
    }
  }

  function start(ctl, byUser) {
    if (ctl.frame) return;
    if (active && active !== ctl) unload(active, false);
    active = ctl;
    var f = document.createElement("iframe");
    f.className = "col-frame";
    f.title = "演示：" + ctl.item.name + (ctl.choice ? "·" + ctl.choice.label : "");
    f.setAttribute("loading", "lazy");
    f.setAttribute("sandbox", "allow-scripts allow-same-origin allow-popups");
    f.setAttribute("allow", "autoplay 'none'");
    f.setAttribute("referrerpolicy", "no-referrer");
    f.src = srcOf(ctl);
    ctl.frame = f;
    ctl.stage.appendChild(f);
    fit(ctl);
    ctl.box.setAttribute("data-state", "running");
    ctl.ph.hidden = true;
    ctl.stop.hidden = false;
    if (byUser) ctl.stop.focus({ preventScroll: true });
  }

  function unload(ctl, byUser) {
    var f = ctl.frame;
    if (!f) return;
    ctl.frame = null;
    try { f.src = "about:blank"; } catch (e) { /* 已经脱离文档也照样移除 */ }
    if (f.parentNode) f.parentNode.removeChild(f);
    var hadFocus = document.activeElement === ctl.stop;
    ctl.box.setAttribute("data-state", "idle");
    ctl.ph.hidden = false;
    ctl.stop.hidden = true;
    if (active === ctl) active = null;
    if (byUser || hadFocus) ctl.run.focus({ preventScroll: true });
  }

  /* 滚到才加载、离开就卸掉；同一时间只跑一个——露出六成以上的候选里挑离视口中线最近的 */
  var autoT = 0;
  function queueAuto() { clearTimeout(autoT); autoT = setTimeout(pickAuto, AUTO_DWELL); }
  function pickAuto() {
    if (!AUTO_RUN || reduced()) return;
    if (overlayOpen()) return; // 详情、灯箱开着：演示被遮住，不开
    if (active && active.ratio > 0) return; // 正在跑的那个还看得见（不管是自动开的还是点开的），不抢
    var best = null, bestD = Infinity, mid = window.innerHeight / 2;
    demos.forEach(function (ctl) {
      if (!ctl.auto || ctl.userStopped || ctl.ratio < AUTO_RATIO) return;
      var r = ctl.stage.getBoundingClientRect();
      var dd = Math.abs((r.top + r.bottom) / 2 - mid);
      if (dd < bestD) { bestD = dd; best = ctl; }
    });
    if (best) start(best, false);
  }
  function watchDemos() {
    if (!demos.length || !("IntersectionObserver" in window)) return; // 没有 IO 的老浏览器：只能点「运行」
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var ctl = en.target._colDemo;
        ctl.ratio = en.isIntersecting ? en.intersectionRatio : 0;
        if (!en.isIntersecting) {
          ctl.userStopped = false; // 滚走再滚回来，又可以自动跑
          if (parked === ctl) parked = null;
          unload(ctl, false);
        }
      });
      queueAuto();
    }, { threshold: [0, AUTO_RATIO] });
    demos.forEach(function (ctl) { io.observe(ctl.stage); });
    var rt = 0;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () { if (active) fit(active); }, 120);
    });
    window.addEventListener("pagehide", function () { if (active) unload(active, false); });
  }

  /* 弹层打开前：卸掉正在跑的演示；点了才跑的记下来，关上后原样再开 */
  function quiet() {
    clearTimeout(autoT);
    if (!active) return;
    parked = active.auto ? null : active;
    unload(active, false);
  }
  /* 弹层的 onClose 里调（套件在关闭过渡走完、收好之后才调）。再让一拍：同一次点击里接着打开的弹层
     （新灯箱顶掉旧灯箱时，旧的 onClose 在新的挂上之前就调了）先挂上，挂上了就等它关 */
  var wakeT = 0;
  function wake() {
    clearTimeout(wakeT);
    wakeT = setTimeout(function () {
      if (overlayOpen()) return;
      var p = parked;
      parked = null;
      if (p && !active && p.ratio > 0 && !p.userStopped) start(p, false);
      else queueAuto();
    }, 0);
  }

  /* ---------- flip：原地翻面（行为交给 StarKit.flip） ---------- */
  function flipDemo(item, d) {
    var box = el("div", "col-demo col-flip", null);
    spotOnce(box, "flip");
    var btn = el("button", "col-flip-btn", null);
    btn.type = "button";
    var card = el("div", "col-flip-card", null);

    var front = el("div", "col-face col-face-front", null);
    front.setAttribute("data-rm", "fade");
    front.appendChild(el("span", "col-face-kicker", "它是什么"));
    front.appendChild(el("p", "col-face-text", d.front));
    var fh = el("span", "col-face-hint", null);
    fh.appendChild(icon("flip"));
    fh.appendChild(el("span", null, "点一下翻到背面看效果"));
    front.appendChild(fh);

    var back = el("div", "col-face col-face-back", null);
    back.setAttribute("data-rm", "fade");
    var b = d.back || {};
    var media = el("div", "col-face-media", null);
    if (b.img) media.appendChild(img(b.img, b.w, b.h, b.alt));
    else if (b.sketch) { media.classList.add("is-sketch"); media.appendChild(sketch(b.sketch, "")); }
    back.appendChild(media);
    var foot = el("div", "col-face-foot", null);
    foot.appendChild(el("p", "col-face-cap", b.caption || ""));
    if (b.live) {
      var go = el("a", "col-face-link", null);
      go.href = b.live;
      go.appendChild(el("span", null, "去看活样例"));
      go.appendChild(icon("chevron"));
      foot.appendChild(go);
    }
    back.appendChild(foot);
    card.appendChild(front);
    card.appendChild(back);
    box.appendChild(btn);
    box.appendChild(card);

    var K = kit();
    if (K && K.flip) {
      K.flip({
        scene: box, card: card, front: front, back: back, button: btn,
        label: function (flipped) { return flipped ? "翻回正面：" + item.name : "翻到背面，看「" + item.name + "」的效果"; }
      });
    } else {
      /* 套件没读到：不翻，只把背面藏好（读屏读不到看不见的那一面） */
      back.inert = true;
      back.setAttribute("aria-hidden", "true");
      btn.setAttribute("aria-label", "「" + item.name + "」：" + d.front);
    }
    return box;
  }

  /* 两条没人做过的提示词：照提示词画的静态示意（常量 SVG，不含数据） */
  var SKETCH = {
    "font-dial":
      '<defs><linearGradient id="col-sk-fade" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".3" stop-color="#fff" stop-opacity="1"/><stop offset=".7" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      '<mask id="col-sk-mask"><rect x="16" y="78" width="288" height="44" fill="url(#col-sk-fade)"/></mask></defs>' +
      '<text class="sk-text" x="24" y="34" font-size="13">正文Aa</text><text class="sk-text sk-big" x="84" y="36" font-size="21" font-weight="600">字号跟着拨</text>' +
      '<rect class="sk-panel" x="12" y="72" width="296" height="56" rx="12"/>' +
      '<g mask="url(#col-sk-mask)" class="sk-ticks">' +
      '<path d="M28 96v10M42 98v8M56 98v8M70 98v8M84 96v10M98 98v8M112 98v8M126 98v8M140 98v8M180 98v8M194 98v8M208 98v8M222 98v8M236 96v10M250 98v8M264 98v8M278 98v8M292 96v10"/>' +
      '<text x="84" y="92" font-size="11" text-anchor="middle">15</text><text x="122" y="92" font-size="11" text-anchor="middle">16</text><text x="198" y="92" font-size="11" text-anchor="middle">18</text><text x="236" y="92" font-size="11" text-anchor="middle">19</text>' +
      '</g>' +
      '<path class="sk-accent-line" d="M160 92v18"/><text class="sk-accent-text" x="160" y="88" font-size="13" font-weight="700" text-anchor="middle">17</text>' +
      '<path class="sk-line" d="M150 140l-8-5m8 5l-8 5m8-5h-30M170 140l8-5m-8 5l8 5m-8-5h30"/>' +
      '<g class="sk-keys"><rect x="40" y="152" width="22" height="14" rx="3"/><rect x="66" y="152" width="22" height="14" rx="3"/><rect x="92" y="152" width="22" height="14" rx="3"/><rect x="118" y="152" width="22" height="14" rx="3"/><rect x="144" y="152" width="22" height="14" rx="3"/><rect x="170" y="152" width="22" height="14" rx="3"/><rect x="196" y="152" width="22" height="14" rx="3"/><rect x="222" y="152" width="22" height="14" rx="3"/><rect x="248" y="152" width="22" height="14" rx="3"/></g>',
    "hold-record":
      '<text class="sk-text" x="20" y="22" font-size="12">平时</text>' +
      '<circle class="sk-panel" cx="112" cy="40" r="20"/><path class="sk-line" d="M112 31v18M103 40h18"/>' +
      '<circle class="sk-accent" cx="170" cy="40" r="20"/><path class="sk-on-accent" d="M170 30a5 5 0 0 1 5 5v6a5 5 0 0 1-10 0v-6a5 5 0 0 1 5-5zM162 41a8 8 0 0 0 16 0M170 49v4"/>' +
      '<path class="sk-line" d="M196 40h30m0 0-6-5m6 5-6 5"/><text class="sk-text" x="234" y="44" font-size="12">长按麦克风</text>' +
      '<text class="sk-text" x="20" y="92" font-size="12">按住时</text>' +
      '<rect class="sk-accent" x="20" y="104" width="280" height="44" rx="22"/>' +
      '<circle class="sk-on-accent-fill" cx="42" cy="126" r="15"/><path class="sk-accent-line" d="M36 120l12 12M48 120l-12 12"/>' +
      '<g class="sk-wave"><path d="M72 126v0M80 120v12M88 114v24M96 119v14M104 110v32M112 117v18M120 122v8M128 112v28M136 118v16M144 108v36M152 116v20M160 121v10M168 113v26M176 118v16M184 111v30M192 119v14M200 115v22M208 121v10M216 117v18M224 123v6"/></g>' +
      '<text class="sk-on-accent-text" x="282" y="130" font-size="12" text-anchor="end">0:07</text>' +
      '<text class="sk-text" x="20" y="170" font-size="11">加号转成取消；松手复原</text>'
  };
  /* tag：同一张示意在详情里再画一份时，渐变与遮罩的 id 加后缀，免得文档里 id 重复 */
  function sketch(name, tag) {
    var s = document.createElementNS(SVG_NS, "svg");
    s.setAttribute("viewBox", "0 0 320 176");
    s.setAttribute("class", "col-sketch");
    s.setAttribute("role", "img");
    s.setAttribute("aria-label", name === "font-dial" ? "示意：键盘顶上一排字号刻度，17居中高亮、两侧渐隐，左右拨动" : "示意：长按麦克风后，两个圆按钮拉长成带波形的录音条，加号转成取消");
    var src = SKETCH[name] || "";
    s.innerHTML = tag ? src.replace(/col-sk-/g, "col-sk-" + tag + "-") : src; // 常量字符串，不含数据
    return s;
  }

  /* ---------- 灯箱：截图 / 缩略图包在 button 里（ix-lightbox） ---------- */
  function zoomButton(cls, image, label, caption) {
    var b = el("button", "col-zoom" + (cls ? " " + cls : ""), null);
    b.type = "button";
    b.setAttribute("aria-label", label);
    b.setAttribute("aria-haspopup", "dialog");
    spotOnce(b, "lightbox");
    b.addEventListener("click", function () {
      var K = kit();
      if (!K || !K.lightbox) return;
      quiet();
      K.lightbox(image, { caption: caption, alt: caption, trigger: b, onClose: wake });
    });
    return b;
  }

  /* ---------- link：缩略图（点了放大）+ 去交互页玩 ---------- */
  function linkDemo(item, d) {
    var cta;
    if (d.mini === "oldnav" || !d.img) {
      /* 透明导航栏：页面现画的小窗，不是截图（理由见文件头），整张仍是链接 */
      var a = el("a", "col-demo col-thumb", null);
      a.href = d.href;
      a.setAttribute("aria-label", "去交互页玩「" + item.name + "」的活样例");
      var m0 = el("span", "col-thumb-media", null);
      if (d.img) m0.appendChild(img(d.img, d.w, d.h, ""));
      if (d.mini === "oldnav") { m0.classList.add("is-cover"); m0.appendChild(oldnavMini()); }
      a.appendChild(m0);
      cta = el("span", "col-thumb-cta", null);
      cta.appendChild(icon("play"));
      cta.appendChild(el("span", null, "去交互页玩"));
      a.appendChild(cta);
      return a;
    }
    var box = el("div", "col-demo col-thumb", null);
    var media = el("span", "col-thumb-media", null);
    var image = img(d.img, d.w, d.h, "");
    media.appendChild(image);
    var zoom = zoomButton("col-thumb-zoom", image, "放大截图：" + item.name, item.name + "：交互页样例截图");
    zoom.appendChild(media);
    box.appendChild(zoom);
    cta = el("a", "col-thumb-cta", null);
    cta.href = d.href;
    cta.setAttribute("aria-label", "去交互页玩「" + item.name + "」的活样例");
    cta.appendChild(icon("play"));
    cta.appendChild(el("span", null, "去交互页玩"));
    box.appendChild(cta);
    return box;
  }
  /* 透明导航栏的缩略小窗：封面图按相对路径引用老站原图（不拷进star），上面压60%黑罩、一条不画底的导航 */
  function oldnavMini() {
    var w = el("span", "col-oldnav", null);
    w.setAttribute("aria-hidden", "true");
    w.appendChild(el("span", "col-oldnav-veil", null));
    var bar = el("span", "col-oldnav-bar", null);
    bar.appendChild(el("b", null, "书生子白 | Home"));
    ["Home", "Explore", "Blog", "ACGN"].forEach(function (t, i) {
      var s = el("span", i === 0 ? "is-current" : null, t);
      bar.appendChild(s);
    });
    bar.appendChild(el("i", null, "主页"));
    w.appendChild(bar);
    return w;
  }

  /* ---------- shot：不能现场跑的（有截图的点了放大） ---------- */
  function shotDemo(item, d) {
    var fig = el("figure", "col-demo col-shot", null);
    if (d.img) {
      var image = img(d.img, d.w, d.h, d.alt || "");
      var m = zoomButton("col-shot-media", image, "放大截图：" + item.name, d.alt || item.name);
      m.appendChild(image);
      fig.appendChild(m);
    } else {
      var empty = el("div", "col-shot-empty", null);
      empty.appendChild(icon("image"));
      empty.appendChild(el("span", null, "没有截图"));
      fig.appendChild(empty);
    }
    fig.appendChild(el("figcaption", "col-shot-cap", d.reason));
    return fig;
  }

  /* ================================================================ 详情：居中大对话框 + 照片抽屉 */
  /* 照片：翻面卡背面的图、shot 的图、link 的缩略图；没有就是强调色封面 + 这一类的图标。caption 是图注（详情里写在最上面） */
  function photoOf(item) {
    var d = item.demo || {};
    if (d.type === "flip" && d.back && d.back.img) return { src: d.back.img, alt: d.back.alt || "", caption: d.back.caption || "" };
    if (d.type === "shot" && d.img) return { src: d.img, alt: d.alt || "", caption: d.reason || "" };
    if (d.type === "link" && d.img) return { src: d.img, alt: "", caption: d.mini === "oldnav" ? "老站首页的封面原图（交互页那条样例按相对路径引用它，不拷进合集）。" : "" };
    return { src: null, alt: "", caption: "" };
  }
  function iconSvg(kind) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[kind] || ICONS.effect) + "</svg>"; // 常量，不含数据
  }
  function section(title, content) {
    var s = el("section", "col-dsec", null);
    s.appendChild(el("h3", "col-dh", title));
    if (content) s.appendChild(content);
    return s;
  }
  function para(cls, text) { return el("p", cls, text); }
  function linkTo(href, text, external) {
    var a = el("a", "col-dlink", null);
    a.href = href;
    if (external) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
    a.appendChild(el("span", null, text));
    a.appendChild(icon(external ? "external" : "chevron"));
    return a;
  }
  /* 「现场演示」：卡上的演示怎么看、要注意什么；没有截图的示意图在这里再画一份 */
  function demoInfo(item) {
    var d = item.demo || {};
    var box = el("div", "col-ddemo", null);
    if (d.type === "iframe" && ctlOf[item.id]) {
      var ctl = ctlOf[item.id];
      box.appendChild(para("col-dp", "卡里的演示框：" + hintOf(ctl) + "；同一时间只跑一个。"));
      if (d.choices) box.appendChild(para("col-dp", "可选" + d.choices.length + "个：" + d.choices.map(function (c) { return c.label; }).join("、") + "。"));
      var s = soundLine(d);
      if (s) box.appendChild(s);
      noteLines({ d: d, choice: null }).forEach(function (t) { box.appendChild(para("col-dp col-dp-sub", t)); });
      var c0 = d.choices ? d.choices[0] : d;
      box.appendChild(linkTo(IS_FILE && c0.online ? c0.online : c0.src, "新窗口打开" + (d.choices ? "「" + c0.label + "」" : ""), true));
    } else if (d.type === "flip") {
      var b = d.back || {};
      box.appendChild(para("col-dp", "卡上点一下翻到背面看效果。"));
      if (b.sketch) {
        var fig = el("figure", "col-dsketch", null);
        fig.appendChild(sketch(b.sketch, "d"));
        fig.appendChild(el("figcaption", "col-dp col-dp-sub", b.caption || ""));
        box.appendChild(fig);
      }
      if (b.live) box.appendChild(linkTo(b.live, "去看活样例", false));
    } else if (d.type === "link") {
      box.appendChild(para("col-dp", d.mini === "oldnav" ? "卡上是照老站画的缩略小窗；活样例在交互页。" : "交互页有能点能拖的活样例；卡上的缩略图点了能放大。"));
      box.appendChild(linkTo(d.href, "去交互页玩", false));
    } else if (d.type === "shot") {
      box.appendChild(para("col-dp", d.img ? "卡上放的是截图，点了能放大。" : d.reason));
    }
    return box;
  }
  function detailBody(item, ph) {
    var wrap = el("div", "col-detail", null);
    var top = badgesOf(item);
    if (top) { top.className = "col-badges col-dbadges"; wrap.appendChild(top); }
    if (ph.caption && ph.src) {
      var cap = el("p", "col-dcap", null);
      cap.appendChild(icon("image"));
      cap.appendChild(el("span", null, ph.caption));
      wrap.appendChild(cap);
    }
    var cols = el("div", "kit-cols col-dcols", null);
    var left = el("div", "col-dcol", null);
    var right = el("div", "col-dcol", null);
    left.appendChild(section("是什么", para("col-dp col-dwhat", item.what)));
    if (item.why) {
      var q = el("blockquote", "said col-dsaid", null);
      q.appendChild(el("p", null, item.why));
      q.appendChild(el("footer", null, "出处见备注"));
      left.appendChild(section("屋主原话", q));
    }
    if (item.kind === "prompt" && item.text) left.appendChild(section("提示词原文", promptBody(item)));
    if (item.notes) left.appendChild(section("备注", notesInto(el("div", "col-notes", null), item)));
    right.appendChild(section("标签", tagsList(item)));
    right.appendChild(section("来源与链接", sourceRows(item, el("div", "col-dsrc", null))));
    right.appendChild(section("现场演示", demoInfo(item)));
    cols.appendChild(left);
    cols.appendChild(right);
    wrap.appendChild(cols);
    return wrap;
  }
  function openDetail(item, btn) {
    var K = kit();
    if (!K || !K.photo) return;
    var ph = photoOf(item);
    quiet();
    K.photo({
      title: item.name,
      kicker: kindLabel(item),
      src: ph.src,
      alt: ph.alt,
      icon: iconSvg(item.kind),
      size: "lg",
      trigger: btn,
      build: function (body) { body.appendChild(detailBody(item, ph)); },
      onClose: wake   // 关闭过渡走完、从 DOM 拿掉之后调一次
    });
  }

  /* ---------- 画四组 ---------- */
  groupsBox.textContent = "";
  var cards = []; // { el, item }
  var groups = []; // { key, section, countEl, cards: [] }
  KINDS.forEach(function (kind) {
    var items = data.filter(function (x) { return x.kind === kind.key; });
    if (!items.length) return;
    var sec = el("section", "group col-group", null);
    sec.id = "kind-" + kind.key;
    var titleId = sec.id + "-title";
    sec.setAttribute("aria-labelledby", titleId);
    var h2 = el("h2", "group-title", kind.title);
    h2.id = titleId;
    var gc = el("span", "col-group-count", String(items.length));
    gc.setAttribute("aria-hidden", "true");
    h2.appendChild(gc);
    var gsr = el("span", "sr-only", "，共" + items.length + "条");
    h2.appendChild(gsr);
    sec.appendChild(h2);
    sec.appendChild(el("p", "group-lede", kind.sub)); // 外壳的分组说明类：压在光晕上只用正文色
    var grid = el("div", "col-grid", null);
    var g = { key: kind.key, title: kind.title, section: sec, countEl: gc, srEl: gsr, cards: [] };
    items.forEach(function (item) {
      var c = buildCard(item, kind);
      grid.appendChild(c);
      var rec = { el: c, item: item };
      cards.push(rec);
      g.cards.push(rec);
    });
    sec.appendChild(grid);
    groupsBox.appendChild(sec);
    groups.push(g);
  });
  /* 类型与标签的组合筛不出东西时（每个类型、每个标签单独都至少有一条） */
  var none = el("p", "col-empty col-none", null);
  none.hidden = true;
  groupsBox.appendChild(none);

  /* ---------- 本页目录 ----------
     外壳 star.js 在 DOMContentLoaded 时按 .group-title 生成目录，但它会把标题里的条数也读进去；
     这里在它之后（同一事件、后注册）用外壳同一套类名（.toc-group / .toc-list / .toc-pill）重写一遍，
     筛选时跟着更新条数、藏掉空组。 */
  var toc = document.querySelector(".page-toc");
  var tocLinks = {};
  function fillToc() {
    if (!toc) return;
    toc.textContent = "";
    var box = el("div", "toc-group", null);
    box.appendChild(el("span", "toc-label", "本页"));
    var ul = el("ul", "toc-list", null);
    groups.forEach(function (g) {
      var li = el("li", null, null);
      var a = el("a", "toc-pill", g.title);
      a.href = "#" + g.section.id;
      var n = el("span", "col-toc-n", String(g.cards.length));
      n.setAttribute("aria-hidden", "true");
      a.appendChild(n);
      li.appendChild(a);
      ul.appendChild(li);
      tocLinks[g.key] = { li: li, n: n };
    });
    box.appendChild(ul);
    toc.appendChild(box);
    syncToc();
  }
  function syncToc() {
    groups.forEach(function (g) {
      var t = tocLinks[g.key];
      if (!t) return;
      var n = g.cards.filter(function (c) { return !c.el.hidden; }).length;
      t.li.hidden = n === 0;
      t.n.textContent = String(n);
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fillToc);
  else fillToc();

  /* ================================================================ 筛选 */
  /* FLIP（照交互页 interaction.js 的 flipMove）：旧位置按「此刻屏幕上的样子」量（含上一轮还没走完的位移），
     量完先撤掉上一轮，再改 DOM、量新位置、从旧位置滑回。opts.relative：胶囊里的字相对胶囊量（对勾把字往右推也是滑过去的）。
     改之前藏着的（「更多标签」里刚露出来的）不参与，它们自己淡入。 */
  var flipAnims = typeof WeakMap === "function" ? new WeakMap() : null;
  function shown(node) { return !!node && node.isConnected && !node.hidden && node.getClientRects().length > 0; }
  function flipMove(items, mutate, opts) {
    var rel = opts.relative || null;
    function place(node) {
      var r = node.getBoundingClientRect();
      var anchor = rel ? rel(node) : null;
      if (anchor) {
        var a = anchor.getBoundingClientRect();
        return { x: r.left - a.left, y: r.top - a.top };
      }
      return { x: r.left, y: r.top };
    }
    var list = items.filter(shown);
    var before = list.map(place);
    list.forEach(function (node) {
      var old = flipAnims && flipAnims.get(node);
      if (old) { old.cancel(); flipAnims.delete(node); }
    });
    mutate();
    if (reduced()) return;
    list.forEach(function (node, i) {
      if (!shown(node) || !canAnimate(node)) return;
      var to = place(node);
      var dx = before[i].x - to.x, dy = before[i].y - to.y;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
      var anim = node.animate(
        [{ transform: "translate(" + dx + "px," + dy + "px)" }, { transform: "translate(0,0)" }],
        { duration: opts.duration, easing: opts.easing, fill: "backwards" }
      );
      if (flipAnims) {
        flipAnims.set(node, anim);
        anim.finished.then(function () { if (flipAnims.get(node) === anim) flipAnims.delete(node); }, function () {});
      }
    });
  }
  function bodyOf(chip) { return chip.querySelector(".col-chip-body"); }
  function chipParent(node) { return node.classList.contains("col-chip-body") ? node.parentElement : null; }

  /* 胶囊：铺底层 + 对勾（选中才占位）+ 字和条数（包在 .col-chip-body 里，FLIP 相对胶囊补位） */
  function makeChip(cls, label, n, aria) {
    var b = el("button", cls, null);
    b.type = "button";
    b.setAttribute("aria-pressed", "false");
    var fill = el("span", "col-chip-fill", null);
    fill.setAttribute("aria-hidden", "true");
    b.appendChild(fill);
    b.appendChild(icon("check", "col-chip-check"));
    var body = el("span", "col-chip-body", null);
    body.appendChild(el("span", "col-chip-label", label));
    body.appendChild(el("span", "col-chip-n", String(n)));
    b.appendChild(body);
    b.setAttribute("aria-label", aria || label + "，" + n + "条");
    return b;
  }

  /* --- 类型（单选） --- */
  var kindChips = []; // { el, key }
  var curKind = "";
  function addKind(key, label, n) {
    var b = makeChip("col-kchip", label, n, null);
    b.addEventListener("click", function () { pickKind(key, b); });
    if (kindsBox) kindsBox.appendChild(b);
    kindChips.push({ el: b, key: key });
  }
  addKind("", "全部", data.length);
  KINDS.forEach(function (k) {
    var n = data.filter(function (x) { return x.kind === k.key; }).length;
    if (n) addKind(k.key, k.title, n);
  });
  function paintKinds() {
    kindChips.forEach(function (c) { c.el.setAttribute("aria-pressed", String(c.key === curKind)); });
  }
  function pickKind(key, node) {
    if (key === curKind) return; // 单选：再点一次已选中的不取消，想看全部点「全部」
    var els = [];
    kindChips.forEach(function (c) { els.push(c.el, bodyOf(c.el)); });
    flipMove(els, function () { curKind = key; paintKinds(); }, { duration: 220, easing: EASE_PLAN, relative: chipParent });
    apply();
    if (node && node.focus && document.activeElement !== node) node.focus();
  }

  /* --- 标签（多选，取并集） --- */
  var tagCount = {};
  var tagOrder = [];
  data.forEach(function (x) {
    x.tags.forEach(function (t) {
      if (!(t in tagCount)) { tagCount[t] = 0; tagOrder.push(t); }
      tagCount[t]++;
    });
  });
  var frequent = tagOrder.filter(function (t) { return tagCount[t] >= 2; })
    .sort(function (a, b) { return tagCount[b] - tagCount[a] || tagOrder.indexOf(a) - tagOrder.indexOf(b); });
  var rare = tagOrder.filter(function (t) { return tagCount[t] < 2; });

  var chips = []; // { el, tag, rare }
  var picked = {}; // 选中的标签
  var nPicked = 0;
  var sticky = {}; // 收着时刚取消的稀有标签：留在外面，下次展开 / 收起或「清除」时再收
  function addTag(tag, n, isRare) {
    var b = makeChip("col-chip", tag, n, null);
    if (isRare) { b.hidden = true; b.classList.add("is-rare"); }
    b.addEventListener("click", function () { toggleTag(tag, b); });
    chipsBox.appendChild(b);
    chips.push({ el: b, tag: tag, rare: isRare });
  }
  frequent.forEach(function (t) { addTag(t, tagCount[t], false); });
  rare.forEach(function (t) { addTag(t, tagCount[t], true); });

  var more = null;
  var expanded = false;
  if (rare.length) {
    more = el("button", "col-more", null);
    more.type = "button";
    more.id = "col-more";
    more.setAttribute("aria-expanded", "false");
    var moreLabel = el("span", null, "更多标签");
    more.appendChild(moreLabel);
    more.appendChild(el("span", "col-chip-n", String(rare.length)));
    more.appendChild(icon("chevron", "col-chev"));
    more.addEventListener("click", function () {
      flipMove(tagFlipList(), function () {
        expanded = !expanded;
        sticky = {};
        more.setAttribute("aria-expanded", String(expanded));
        moreLabel.textContent = expanded ? "收起" : "更多标签";
        syncRare();
      }, { duration: 240, easing: EASE, relative: chipParent });
    });
    chipsBox.appendChild(more);
  }

  /* 「清除」：有选中的标签才出现，放在计数旁边（窄屏胶囊那排横滑，放排尾会滑出屏幕） */
  var clearBtn = el("button", "col-clear", null);
  clearBtn.type = "button";
  clearBtn.hidden = true;
  clearBtn.appendChild(icon("close"));
  clearBtn.appendChild(el("span", null, "清除"));
  clearBtn.addEventListener("click", clearTags);
  if (sideBox) sideBox.insertBefore(clearBtn, sideBox.firstChild);

  function tagFlipList() {
    var els = [];
    chips.forEach(function (c) { els.push(c.el, bodyOf(c.el)); });
    if (more) els.push(more);
    return els;
  }
  function syncRare() {
    chips.forEach(function (c) {
      if (!c.rare) return;
      var show = expanded || !!picked[c.tag] || !!sticky[c.tag];
      if (c.el.hidden === !show) return;
      c.el.hidden = !show;
      if (show && !reduced() && canAnimate(c.el)) {
        c.el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: "linear" });
      }
    });
  }
  function paintTags() {
    chips.forEach(function (c) { c.el.setAttribute("aria-pressed", String(!!picked[c.tag])); });
    var was = !clearBtn.hidden;
    clearBtn.hidden = nPicked === 0;
    clearBtn.setAttribute("aria-label", "清除已选的" + nPicked + "个标签");
    if (!clearBtn.hidden && !was && live && !reduced() && canAnimate(clearBtn)) {
      clearBtn.animate([{ opacity: 0, transform: "scale(.9)" }, { opacity: 1, transform: "none" }], { duration: 160, easing: EASE });
    }
  }
  function toggleTag(tag, node) {
    flipMove(tagFlipList(), function () {
      if (picked[tag]) {
        delete picked[tag];
        nPicked--;
        if (!expanded) sticky[tag] = true; // 收着时取消的那枚不在手底下消失
      } else {
        picked[tag] = true;
        nPicked++;
      }
      paintTags();
      syncRare();
    }, { duration: 240, easing: EASE, relative: chipParent });
    apply();
    if (node && node.focus && document.activeElement !== node) node.focus();
  }
  function clearTags() {
    if (!nPicked) return;
    flipMove(tagFlipList(), function () {
      picked = {};
      nPicked = 0;
      sticky = {};
      paintTags();
      syncRare();
    }, { duration: 240, easing: EASE, relative: chipParent });
    apply();
    /* 「清除」自己藏起来了：焦点交给标签那排第一枚 */
    for (var i = 0; i < chips.length; i++) if (shown(chips[i].el)) { chips[i].el.focus(); break; }
  }

  /* --- 计数、分组、播报 --- */
  function bump(node) {
    if (reduced() || !canAnimate(node)) return;
    node.animate(
      [{ opacity: 0, transform: "translateY(-45%) scale(1.15)" }, { opacity: 1, transform: "none" }],
      { duration: 220, easing: EASE_PLAN }
    );
  }
  function matches(item) {
    if (curKind && item.kind !== curKind) return false;
    if (!nPicked) return true;
    for (var i = 0; i < item.tags.length; i++) if (picked[item.tags[i]]) return true;
    return false;
  }

  var live = false; // 首次渲染之后才跳、才播、才长对勾
  function apply() {
    var count = 0;
    var filtered = !!curKind || nPicked > 0;
    cards.forEach(function (c) {
      var vis = matches(c.item);
      var wasHidden = c.el.hidden;
      c.el.hidden = !vis;
      if (vis) count++;
      if (vis && wasHidden && live && canAnimate(c.el)) {
        c.el.animate(
          reduced()
            ? [{ opacity: 0 }, { opacity: 1 }]
            : [{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }],
          { duration: 220, easing: EASE }
        );
      }
    });
    groups.forEach(function (g) {
      var n = g.cards.filter(function (c) { return !c.el.hidden; }).length;
      g.section.hidden = n === 0;
      g.countEl.textContent = String(n);
      g.srEl.textContent = (filtered ? "，筛出" : "，共") + n + "条";
    });
    var k = kindOf(curKind);
    none.textContent = "「" + (k ? k.title : "全部") + "」里没有带所选标签的收藏：换一个类型，或者点上面的「清除」。";
    none.hidden = count > 0;
    syncToc();
    var changed = countEl.textContent !== String(count);
    countEl.textContent = String(count);
    if (live) {
      // 外壳的 announce 先清空再隔60ms写：连着两次条数相同时读屏也会再播一次，连点只播最后一句
      var shell = window.StarShell;
      if (shell && shell.announce) shell.announce(filtered ? "显示" + count + "条" : "显示全部" + count + "条");
      if (changed) bump(countEl);
    }
  }

  paintKinds();
  paintTags();
  apply();
  live = true;
  if (kindsBox) kindsBox.classList.add("is-live"); // 之后选中才播对勾长出来（首次渲染「全部」那枚不播）
  chipsBox.classList.add("is-live");
  watchDemos();
  document.documentElement.setAttribute("data-collection", "ready");
})();
