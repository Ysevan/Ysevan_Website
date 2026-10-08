/*
 * star.js —— 外壳行为（defer 加载，每页都有）
 *
 *   1. 外观控件：分段「浅色 / 深色 / 自动」= role=radiogroup + role=radio + aria-checked + roving tabindex
 *      （←→↑↓ 循环、Home / End）；六个色点 = button + aria-pressed。两份控件（侧栏底部、「更多」面板）同步。
 *      只认 nav.js 画的这两处容器（aside.side 与 #more-panel 里的 [data-theme-controls]）：页面样例里就算写了
 *      data-mode-set / data-accent-set，也不会改全站主题（这两个属性是外壳保留的，见 star.css 文件头）。
 *      单选组方向键对页面自己的 radiogroup 也生效（移动并 click 选中）；页面自己处理过、调了 preventDefault 的不再重复处理。
 *   2. favicon：按当前 --accent / --accent-2 的计算值生成自带渐变底的圆角方块（rx = 边长 22.37%），
 *      data URI 一律 encodeURIComponent（# 不转义会把 URI 从第一个颜色处截断）。
 *   3. 品牌图标可换文件：brand/brand-icon.svg（首选）或 .png 存在时换上，JS 注入 img、load 且 naturalWidth>0 才算
 *      （file:// 下不能 fetch 探测）。仓库自带一份默认 brand-icon.svg（就是内置那枚，按 84% 的放法补了留白），
 *      第一次就命中、不再去找 .png——探测落空时浏览器必记一条网络错误，控制台要零错误。
 *      只换外壳的品牌方块（侧栏里的、以及页面里写了 data-icon="brand" 的）；样例里自己画示意图的 .brand-icon 不动。
 *   4. 代码块「复制」、button[data-copy] 点一下复制：clipboard 失败回落 execCommand，结果用 aria-live 播报。
 *   5. 「更多」面板：开 / 关、Esc 关、点遮罩关、Tab 困在面板里、关了焦点还给打开它的按钮。
 *   6. 页内目录：按 .group-title 与 .entry h3 生成 .page-toc 里的胶囊（DOMContentLoaded 时生成——
 *      晚于所有 defer 脚本，页专属脚本渲染出来的分组也收得到；之后重渲染了可调 StarShell.buildToc()）。
 *   7. [data-chapter-list]：从 nav.js 的 STAR_NAV 画章节分组列表（总览页用）。
 *   8. 条目数自检：页面 .entry 条数与 nav.js 里 count 对不上时在控制台提醒（warn，不是 error）。
 *   9. <span data-icon="chevron"> 这类占位：用 nav.js 同一套图标填进去（页面里不再抄 SVG 路径）。
 */
(function () {
  "use strict";
  var doc = document;
  var root = doc.documentElement;
  var T = window.StarTheme;
  var NAV = window.STAR_NAV || null;
  var MODE_LABEL = { light: "浅色", dark: "深色", auto: "自动" };
  var ACCENT_LABEL = { blue: "蓝", green: "绿", indigo: "靛", orange: "橙", pink: "粉", teal: "青" };

  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  function icon(name) { return NAV ? NAV.icon(name) : ""; }

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

  /* ---------- 1. 外观控件 ---------- */
  /* 外壳自己的两处主题控件容器（nav.js 同步画好，defer 的本脚本执行时已在 DOM 里）。
     下面的点击、键盘、重绘都只认这两处：样例里写了同名属性也不会改全站主题。 */
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
  }

  function setMode(v) {
    if (!T || v === T.pref()) return;
    T.setMode(v);
    announce(v === "auto" ? "外观：自动，跟随系统，当前" + MODE_LABEL[T.mode()] : "外观：" + MODE_LABEL[v]);
  }

  doc.addEventListener("click", function (e) {
    if (!T) return;
    var m = shellControl(e.target, "data-mode-set");
    if (m) { setMode(m.getAttribute("data-mode-set")); return; }
    var d = shellControl(e.target, "data-accent-set");
    if (!d) return;
    var a = d.getAttribute("data-accent-set");
    if (a !== T.accent()) { T.setAccent(a); announce("强调色：" + ACCENT_LABEL[a]); }
  });

  /* 单选组键盘：方向键移动并选中（选中跟着焦点走，这是 radio 的标准行为），首尾循环；Home / End 到两端。
     页面自己的 radiogroup 也吃这一套（移动后 click 选中）；页面已经处理过这一下（preventDefault）就不再处理。 */
  doc.addEventListener("keydown", function (e) {
    if (e.defaultPrevented) return;
    var t = e.target;
    if (!t || !t.getAttribute || t.getAttribute("role") !== "radio") return;
    var group = t.closest('[role="radiogroup"]');
    if (!group) return;
    var shell = !!shellControl(t, "data-mode-set");
    var radios = Array.prototype.slice.call(group.querySelectorAll('[role="radio"]'));
    var i = radios.indexOf(t);
    var next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % radios.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + radios.length) % radios.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = radios.length - 1;
    else if (e.key === " " || e.key === "Enter") {
      /* 外壳的按钮自己处理；页面的 radio 若是 <button>，交给浏览器原生的点击，不拦 */
      if (shell) { e.preventDefault(); setMode(t.getAttribute("data-mode-set")); }
      return;
    }
    if (next < 0) return;
    e.preventDefault();
    var target = radios[next];
    if (shell) setMode(target.getAttribute("data-mode-set"));
    else target.click();
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

  /* ---------- 4. 复制 ---------- */
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

  function tip(el, text) {
    var old = el.querySelector(".copy-tip");
    if (old) old.parentNode.removeChild(old);
    var t = doc.createElement("span");
    t.className = "copy-tip";
    t.setAttribute("aria-hidden", "true");
    t.textContent = text;
    el.appendChild(t);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 1300);
  }

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
        tip(btn, "已复制");
        announce("已复制 " + text);
      }
    }, function () {
      announce("复制失败，请手动选择");
      if (!btn.classList.contains("copy-btn")) tip(btn, "复制失败");
    });
  });

  /* ---------- 5. 「更多」面板 ---------- */
  var panel = doc.getElementById("more-panel");
  var scrim = doc.querySelector(".more-scrim");
  var opener = null;
  function focusables() {
    return Array.prototype.filter.call(panel.querySelectorAll('a[href],button:not([disabled]),[tabindex="0"]'), function (el) {
      return el.offsetParent !== null || el === doc.activeElement;
    });
  }
  function setExpanded(v) {
    each(doc.querySelectorAll("[data-more-toggle]"), function (b) { b.setAttribute("aria-expanded", v ? "true" : "false"); });
  }
  function openMore(trigger) {
    if (!panel) return;
    opener = trigger || null;
    panel.hidden = false;
    if (scrim) scrim.hidden = false;
    setExpanded(true);
    var close = panel.querySelector("[data-more-close]");
    if (close) close.focus();
  }
  function closeMore(restore) {
    if (!panel || panel.hidden) return;
    panel.hidden = true;
    if (scrim) scrim.hidden = true;
    setExpanded(false);
    if (restore !== false && opener && opener.focus) opener.focus();
  }
  doc.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-more-toggle],[data-more-close]") : null;
    if (t && t.hasAttribute("data-more-toggle")) { if (panel && panel.hidden) openMore(t); else closeMore(); return; }
    if (t && t.hasAttribute("data-more-close")) { closeMore(); return; }
    if (scrim && e.target === scrim) closeMore();
  });
  doc.addEventListener("keydown", function (e) {
    if (!panel || panel.hidden) return;
    if (e.key === "Escape") { e.preventDefault(); closeMore(); return; }
    if (e.key !== "Tab") return;
    var f = focusables();
    if (!f.length) return;
    var first = f[0];
    var last = f[f.length - 1];
    if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
    else if (!panel.contains(doc.activeElement)) { e.preventDefault(); first.focus(); }
  });
  if (window.matchMedia) {
    try {
      var wide = window.matchMedia("(min-width: 901px)");
      var onWide = function () { if (wide.matches) closeMore(false); };
      if (wide.addEventListener) wide.addEventListener("change", onWide); else if (wide.addListener) wide.addListener(onWide);
    } catch (e) { /* 没有 matchMedia 就不自动收 */ }
  }

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
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
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
    if (n !== cur.count) console.warn("[star] nav.js 里「" + cur.title + "」的 count 是 " + cur.count + "，页面实际 " + n + " 条：同一轮改一处。");
  }

  /* 页面里的 <span data-icon="名字"> 占位：从 nav.js 的同一套图标填进去（data-icon-class 可换 svg 的类名） */
  each(doc.querySelectorAll("[data-icon]"), function (el) {
    if (!NAV || el.firstElementChild) return;
    el.innerHTML = NAV.icon(el.getAttribute("data-icon"), el.getAttribute("data-icon-class") || "i");
  });

  enhanceCode(doc);
  buildChapters();
  function onReady() { buildToc(); enhanceCode(doc); checkCount(); }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", onReady);
  else onReady();

  window.StarShell = { buildToc: buildToc, enhanceCode: enhanceCode, announce: announce, copy: copyText, closeMore: closeMore };
})();
