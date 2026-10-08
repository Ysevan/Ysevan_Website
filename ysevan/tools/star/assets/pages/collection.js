/*
 * 收藏页：读 data/collection.js 的 window.STAR_COLLECTION，按类型分四组画卡片，上方一排按标签筛选的胶囊。
 * 普通 defer 脚本（file:// 下 module / fetch 会静默失效）；数据全部用 textContent 写进 DOM，不拼 HTML。
 *
 * 筛选：单选（和 plan 状态筛选同一口径：只升级手感，不改规则）。选中那枚左侧长出对勾、底色从左铺满，
 * 相邻胶囊 FLIP 让位，计数跳一下；筛出几条由一条隐藏的 aria-live="polite" 播报「显示N条」。
 * 不记住上次选了什么——每次打开都是「全部」，行为不取决于用户忘掉的往事。
 * 动画只动 transform / opacity；prefers-reduced-motion 时 FLIP 与跳动跳过、卡片只淡入。
 *
 * 现场演示（每条的 demo 字段，字段说明见 data/collection.js 文件头）：
 * - iframe：老站特效与小游戏放进卡里的16:10演示框。滚到才加载、滚出视口就卸掉（IntersectionObserver；
 *   卸掉 = src 换成 about:blank 再移除 iframe，占位放回）；全站同一时间只跑一个，开新的先卸旧的。
 *   吃显卡（heavy）、有声音（sound）、要线上地址（online）、合集（choices）的不自动跑，点「运行」才跑；
 *   减弱动效下全部不自动跑。file:// 下有 online 的用线上地址，http(s) 下一律用相对路径。
 *   sandbox 只给 allow-scripts allow-same-origin allow-popups；allow="autoplay 'none'"：老页面的音乐只能在演示框里点了才响。
 * - flip：原地翻面（透视1200px、绕Y轴180°、cubic-bezier(.3,.7,.2,1) 0.8s，过90°那一帧换面，读屏同步 inert / aria-hidden；
 *   翻面区是真 <button>，空格回车能翻；减弱动效改原地淡入淡出）。
 * - link：缩略图 +「去交互页玩」，点了跳到交互页对应样例。
 * - shot：实在不能现场跑的（Windows 程序），放截图或写明为什么没有。
 */
(function () {
  "use strict";

  var data = window.STAR_COLLECTION;
  var groupsBox = document.getElementById("col-groups");
  var chipsBox = document.getElementById("col-chips");
  var statusEl = document.getElementById("col-status");
  var countEl = document.getElementById("col-count-n");
  if (!groupsBox || !chipsBox) return;
  if (!Array.isArray(data)) return; // 保留页面里那句「收藏数据没读到」

  var SVG_NS = "http://www.w3.org/2000/svg";
  var EASE = "cubic-bezier(.2,.8,.2,1)";

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
    image: '<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m20.5 16-5-5-8.5 8"/>'
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

  /* ---------- 四组 ---------- */
  var KINDS = [
    { key: "skill", title: "Skill", label: "Skill", sub: "好看的Agent Skill：装进项目里，让AI照着一套成熟的做法干活。" },
    { key: "project", title: "项目", label: "项目", sub: "有意思的开源项目，以及我们拿它做了什么。" },
    { key: "prompt", title: "提示词", label: "提示词", sub: "屋主写的提示词原文，附落到了哪些项目、哪个没做和为什么。" },
    { key: "effect", title: "特效与小游戏", label: "特效", sub: "老站攒下的网页特效、节日页和小游戏；署名不详的一律写「原作者不详」，不等于屋主原创。" }
  ];

  /* ---------- 卡片 ---------- */
  var FLAG_HEAVY = "【吃显卡】";

  function badge(text, tone) {
    var b = el("span", "col-badge", null);
    b.setAttribute("data-tone", tone);
    b.appendChild(el("span", "col-badge-dot", null)).setAttribute("aria-hidden", "true");
    b.appendChild(document.createTextNode(text));
    return b;
  }

  function buildCard(item, kind) {
    var card = el("article", "col-card", null);
    card.id = "item-" + item.id;
    card.setAttribute("data-kind", item.kind);
    var nameId = "item-" + item.id + "-name";
    card.setAttribute("aria-labelledby", nameId);

    var head = el("header", "col-card-head", null);
    var ic = el("span", "col-icon", null);
    ic.setAttribute("data-kind", item.kind);
    ic.appendChild(icon(item.kind));
    head.appendChild(ic);
    var titles = el("div", "col-card-titles", null);
    var h = el("h3", "col-name", item.name);
    h.id = nameId;
    titles.appendChild(h);
    var isGame = item.tags.indexOf("小游戏") !== -1;
    titles.appendChild(el("p", "col-kind", item.kind === "effect" && isGame ? "小游戏" : kind.label));
    head.appendChild(titles);

    var notes = item.notes || "";
    var badges = el("div", "col-badges", null);
    if (notes.indexOf("屋主改编") !== -1) badges.appendChild(badge("屋主改编", "accent"));
    if (notes.indexOf("【用过】") !== -1) badges.appendChild(badge("用过", "green"));
    if (notes.indexOf(FLAG_HEAVY) !== -1) badges.appendChild(badge("吃显卡", "orange"));
    if (badges.childNodes.length) head.appendChild(badges);
    card.appendChild(head);

    card.appendChild(el("p", "col-what", item.what));

    var demoEl = buildDemo(item);
    if (demoEl) card.appendChild(demoEl);

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
      det.appendChild(body);
      card.appendChild(det);
    }

    if (notes) {
      var n = el("div", "col-notes", null);
      n.appendChild(el("span", "col-label", "备注"));
      var body0 = notes.replace(FLAG_HEAVY, "").replace(/\s+$/, "");
      var cut = body0.indexOf("出处：");
      var main0 = cut > 0 ? body0.slice(0, cut).replace(/[；;\s]+$/, "") : body0;
      n.appendChild(el("p", "col-notes-text", main0));
      if (cut > 0) n.appendChild(pathText(el("p", "col-notes-src", null), body0.slice(cut)));
      card.appendChild(n);
    }

    var tags = el("ul", "col-tags", null);
    tags.setAttribute("aria-label", "标签");
    item.tags.forEach(function (t) { tags.appendChild(el("li", null, t)); });
    card.appendChild(tags);

    var foot = el("footer", "col-card-foot", null);
    if (item.link) {
      var a = el("a", "col-link", null);
      a.href = item.link;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.appendChild(icon("external"));
      a.appendChild(el("span", null, item.link.replace(/^https?:\/\//, "").replace(/\/$/, "")));
      foot.appendChild(a);
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
      foot.appendChild(src);
    }
    var added = el("p", "col-added", null);
    added.appendChild(icon("calendar"));
    added.appendChild(document.createTextNode("收录于"));
    var time = el("time", null, item.added);
    time.setAttribute("datetime", item.added);
    added.appendChild(time);
    foot.appendChild(added);
    card.appendChild(foot);
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
    var hint = ctl.auto ? "滚到这里会自动运行"
      : d.heavy ? "没独显的机器会卡，点了才跑"
      : d.sound ? (d.muted ? "原页面有音乐，框里不放；点了才跑" : "有声音，点了才放")
      : (d.online && IS_FILE) ? "双击打开时要走线上地址，点了才联网加载"
      : d.choices ? "选一个，点了才跑"
      : "点了才跑";
    ph.appendChild(el("p", "col-ph-hint", hint));
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
  function syncNote(ctl) {
    var c = cur(ctl), d = ctl.d;
    ctl.note.textContent = "";
    if (c.sound) {
      var s = el("p", "col-live-sound", null);
      s.appendChild(icon("sound"));
      s.appendChild(el("span", null, (c.muted ? "声音：" : "有声音，点了才放：") + c.sound));
      ctl.note.appendChild(s);
    }
    var lines = [];
    if (c.note) lines.push(c.note);
    if (c !== d && d.note) lines.push(d.note);
    if (IS_FILE && c.online) lines.push("双击打开时浏览器会拦下它的图片，这里改走线上地址 " + c.online + " ；放到服务器上用本地这份。");
    lines.forEach(function (t) { ctl.note.appendChild(el("p", "col-live-text", t)); });
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

  /* ---------- flip：原地翻面 ---------- */
  function flipDemo(item, d) {
    var box = el("div", "col-demo col-flip", null);
    var btn = el("button", "col-flip-btn", null);
    btn.type = "button";
    var card = el("div", "col-flip-card", null);

    var front = el("div", "col-face col-face-front", null);
    front.setAttribute("data-rm", "fade");
    front.setAttribute("aria-hidden", "false");
    front.appendChild(el("span", "col-face-kicker", "它是什么"));
    front.appendChild(el("p", "col-face-text", d.front));
    var fh = el("span", "col-face-hint", null);
    fh.appendChild(icon("flip"));
    fh.appendChild(el("span", null, "点一下翻到背面看效果"));
    front.appendChild(fh);

    var back = el("div", "col-face col-face-back", null);
    back.setAttribute("data-rm", "fade");
    back.setAttribute("aria-hidden", "true");
    back.inert = true;
    var b = d.back || {};
    var media = el("div", "col-face-media", null);
    if (b.img) media.appendChild(img(b.img, b.w, b.h, b.alt));
    else if (b.sketch) { media.classList.add("is-sketch"); media.appendChild(sketch(b.sketch)); }
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

    var flipped = false, shownBack = false, raf = 0;
    function label() {
      btn.setAttribute("aria-label", flipped ? "翻回正面：" + item.name : "翻到背面，看「" + item.name + "」的效果");
    }
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
      front.inert = isBack;
      front.setAttribute("aria-hidden", isBack ? "true" : "false");
      back.inert = !isBack;
      back.setAttribute("aria-hidden", isBack ? "false" : "true");
      box.setAttribute("data-face", isBack ? "back" : "front");
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
    btn.addEventListener("click", function () {
      flipped = !flipped;
      box.classList.toggle("is-flipped", flipped);
      label();
      if (reduced()) { showFace(flipped); return; }
      watch();
    });
    box.setAttribute("data-face", "front");
    label();
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
  function sketch(name) {
    var s = document.createElementNS(SVG_NS, "svg");
    s.setAttribute("viewBox", "0 0 320 176");
    s.setAttribute("class", "col-sketch");
    s.setAttribute("role", "img");
    s.setAttribute("aria-label", name === "font-dial" ? "示意：键盘顶上一排字号刻度，17居中高亮、两侧渐隐，左右拨动" : "示意：长按麦克风后，两个圆按钮拉长成带波形的录音条，加号转成取消");
    s.innerHTML = SKETCH[name] || ""; // 常量字符串，不含数据
    return s;
  }

  /* ---------- link：缩略图 + 去交互页玩 ---------- */
  function linkDemo(item, d) {
    var a = el("a", "col-demo col-thumb", null);
    a.href = d.href;
    a.setAttribute("aria-label", "去交互页玩「" + item.name + "」的活样例");
    var media = el("span", "col-thumb-media", null);
    if (d.img) media.appendChild(img(d.img, d.w, d.h, ""));
    if (d.mini === "oldnav") { media.classList.add("is-cover"); media.appendChild(oldnavMini()); }
    a.appendChild(media);
    var cta = el("span", "col-thumb-cta", null);
    cta.appendChild(icon("play"));
    cta.appendChild(el("span", null, "去交互页玩"));
    a.appendChild(cta);
    return a;
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

  /* ---------- shot：不能现场跑的 ---------- */
  function shotDemo(item, d) {
    var fig = el("figure", "col-demo col-shot", null);
    if (d.img) {
      var m = el("div", "col-shot-media", null);
      m.appendChild(img(d.img, d.w, d.h, d.alt || ""));
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

  /* ---------- 标签胶囊 ---------- */
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
  function makeChip(tag, n, isRare) {
    var b = el("button", "col-chip", null);
    b.type = "button";
    b.setAttribute("aria-pressed", "false");
    var fill = el("span", "col-chip-fill", null);
    fill.setAttribute("aria-hidden", "true");
    b.appendChild(fill);
    b.appendChild(icon("check", "col-chip-check"));
    b.appendChild(el("span", "col-chip-label", tag === "" ? "全部" : tag));
    var num = el("span", "col-chip-n", String(n));
    b.appendChild(num);
    b.setAttribute("aria-label", (tag === "" ? "全部" : tag) + "，" + n + "条");
    if (isRare) { b.hidden = true; b.classList.add("is-rare"); }
    b.addEventListener("click", function () { select(tag, b); });
    chipsBox.appendChild(b);
    chips.push({ el: b, tag: tag, rare: isRare });
    return b;
  }
  makeChip("", data.length, false);
  frequent.forEach(function (t) { makeChip(t, tagCount[t], false); });
  rare.forEach(function (t) { makeChip(t, tagCount[t], true); });

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
      var before = snapshot();
      expanded = !expanded;
      more.setAttribute("aria-expanded", String(expanded));
      moreLabel.textContent = expanded ? "收起" : "更多标签";
      syncRare();
      playFlip(before);
    });
    chipsBox.appendChild(more);
  }

  var current = "";
  function syncRare() {
    chips.forEach(function (c) {
      if (!c.rare) return;
      var show = expanded || c.tag === current;
      if (c.el.hidden === !show) return;
      c.el.hidden = !show;
      if (show && !reduced() && canAnimate(c.el)) {
        c.el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: "linear" });
      }
    });
  }

  /* FLIP：量位置 → 改 DOM → 反向位移再归零 */
  function snapshot() {
    var m = new Map();
    chips.forEach(function (c) { if (!c.el.hidden) m.set(c.el, c.el.getBoundingClientRect()); });
    if (more) m.set(more, more.getBoundingClientRect());
    return m;
  }
  function playFlip(before) {
    if (reduced()) return;
    before.forEach(function (r, node) {
      if (node.hidden || !canAnimate(node)) return;
      var now = node.getBoundingClientRect();
      var dx = r.left - now.left, dy = r.top - now.top;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
      node.animate(
        [{ transform: "translate(" + dx + "px," + dy + "px)" }, { transform: "none" }],
        { duration: 280, easing: EASE }
      );
    });
  }

  function bump(node) {
    if (reduced() || !canAnimate(node)) return;
    node.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.22)" }, { transform: "scale(1)" }],
      { duration: 320, easing: EASE }
    );
  }

  var firstRun = true;
  function apply() {
    var shown = 0;
    cards.forEach(function (c) {
      var vis = current === "" || c.item.tags.indexOf(current) !== -1;
      var wasHidden = c.el.hidden;
      c.el.hidden = !vis;
      if (vis) shown++;
      if (vis && wasHidden && !firstRun && canAnimate(c.el)) {
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
      g.srEl.textContent = (current === "" ? "，共" : "，筛出") + n + "条";
    });
    syncToc();
    var changed = countEl.textContent !== String(shown);
    countEl.textContent = String(shown);
    if (!firstRun) {
      // 先清空再隔一拍写入：连着两次条数相同（比如都是7条）时，读屏也会再播一次
      var msg = current === "" ? "显示全部" + shown + "条" : "显示" + shown + "条";
      statusEl.textContent = "";
      clearTimeout(statusEl._t);
      statusEl._t = setTimeout(function () { statusEl.textContent = msg; }, 60);
      if (changed) bump(countEl);
    }
    firstRun = false;
  }

  function select(tag, node) {
    if (tag === current) return; // 单选：再点一次已选中的不取消，想看全部点「全部」
    var before = snapshot();
    current = tag;
    chips.forEach(function (c) { c.el.setAttribute("aria-pressed", String(c.tag === current)); });
    syncRare();
    playFlip(before);
    apply();
    if (node && node.focus && document.activeElement !== node) node.focus();
  }

  chips[0].el.setAttribute("aria-pressed", "true");
  apply();
  watchDemos();
  document.documentElement.setAttribute("data-collection", "ready");
})();
