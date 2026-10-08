/*
 * 材质页（material.html）的活样例。普通 defer 脚本（file:// 下不用 module、不用 fetch），排在 star.js 之后。
 *
 * 每个样例一段，互不依赖；某段的 DOM 缺了就跳过，不拖累别的。共同约定：
 *  - 单选组是 .seg[role=radiogroup] > button[role=radio]：这里只处理 click（改 aria-checked / tabindex 再回调）；
 *    方向键 / Home / End 由外壳 star.js 统一处理（移动焦点并 click 选中），空格 / 回车是按钮原生的 click。
 *  - 开关按钮用 aria-pressed；结果走外壳的 StarShell.announce（全站一个 polite 区）。
 *  - 磨砂（backdrop-filter）只在样例框看得见时挂：[data-m-heavy] 的样例框进视口附近挂 .is-live，CSS 据此挂模糊；
 *    滚走就摘。需要跟着开关的逻辑用 onLive(样例框, fn) 订阅。
 *  - 唯一一个每帧跑的东西是「模糊的代价」那块变色方块（回调名 costFrame）：只在点了开关、样例看得见、页面没隐藏时跑。
 *  - 不碰外壳保留属性（data-mode-set / data-accent-set / data-blur-set），不写 localStorage；
 *    「模糊三档」里的「现测一次」只读不存。任何回车 / Esc 先判输入法合成态。
 *  - 减弱动效：外壳已关掉 CSS 过渡；这里没有 JS 动画（变色方块不是位移，是被演示的「重画」本身）。
 */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;

  function $(sel, scope) { return (scope || doc).querySelector(sel); }
  function $$(sel, scope) { return Array.prototype.slice.call((scope || doc).querySelectorAll(sel)); }
  function composing(e) { return !!(e.isComposing || e.keyCode === 229); }
  function announce(text) {
    if (window.StarShell && typeof window.StarShell.announce === "function") window.StarShell.announce(text);
  }
  function supports(a, b) {
    try {
      if (!window.CSS || typeof window.CSS.supports !== "function") return false;
      return b === undefined ? window.CSS.supports(a) : window.CSS.supports(a, b);
    } catch (e) { return false; }
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }
  function computedBf(el) {
    var cs = window.getComputedStyle(el);
    var v = cs.backdropFilter;
    if (v === undefined) v = cs.webkitBackdropFilter;
    return v === undefined ? "（本浏览器没有这个属性）" : v;
  }

  /* ---------- 0. 小工具：单选组、开关、「看得见才挂磨砂」 ---------- */
  function radios(group, fn) {
    if (!group) return;
    group.addEventListener("click", function (e) {
      var b = e.target && e.target.closest ? e.target.closest('[role="radio"]') : null;
      if (!b || !group.contains(b) || b.getAttribute("aria-checked") === "true") return;
      $$('[role="radio"]', group).forEach(function (x) {
        var on = x === b;
        x.setAttribute("aria-checked", on ? "true" : "false");
        x.setAttribute("tabindex", on ? "0" : "-1");
      });
      fn(b.getAttribute("data-v"), b);
    });
  }
  function radioValue(group) {
    var b = group ? group.querySelector('[role="radio"][aria-checked="true"]') : null;
    return b ? b.getAttribute("data-v") : null;
  }
  function setRadio(group, v) {
    if (!group) return;
    $$('[role="radio"]', group).forEach(function (x) {
      var on = x.getAttribute("data-v") === v;
      x.setAttribute("aria-checked", on ? "true" : "false");
      x.setAttribute("tabindex", on ? "0" : "-1");
    });
  }
  function toggle(btn, fn) {
    if (!btn) return;
    btn.addEventListener("click", function () {
      var on = btn.getAttribute("aria-pressed") !== "true";
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      fn(on);
    });
  }
  var liveHooks = [];
  function onLive(spec, fn) { if (spec) liveHooks.push({ el: spec, fn: fn }); }
  function isLive(spec) { return !!(spec && spec.classList.contains("is-live")); }
  function setLive(spec, on) {
    if (isLive(spec) === on) return;
    spec.classList.toggle("is-live", on);
    liveHooks.forEach(function (h) { if (h.el === spec) h.fn(on); });
  }

  /* ---------- 1. 两档玻璃 ---------- */
  (function () {
    var grid = $("[data-m-glass]");
    if (!grid) return;
    var spec = grid.closest(".specimen");
    function read() {
      var v = computedBf(grid.querySelector(".m-gcard"));
      if (!isLive(spec) && grid.getAttribute("data-tier") !== "0") v = "（滚到这里才挂）";
      $$("[data-m-glass-read]", grid).forEach(function (c) { c.textContent = v; });
    }
    radios($("[data-m-glass-tier]"), function (v) {
      grid.setAttribute("data-tier", v);
      read();
      announce(v === "0" ? "不模糊，只剩.62的不透明度" : v === "30" ? "视口面一档：模糊30像素、饱和度160%" : "卡片一档：模糊24像素、饱和度150%");
    });
    toggle($("[data-m-glass-edge]"), function (on) {
      grid.setAttribute("data-edge", on ? "on" : "off");
      announce(on ? "顶边亮线开" : "顶边亮线关");
    });
    onLive(spec, read);
    read();
  })();

  /* ---------- 2. 光晕画在哪 ---------- */
  (function () {
    var demo = $("[data-m-halo]");
    if (!demo) return;
    var tag = $("[data-m-halo-tag]", demo);
    var note = $("[data-m-halo-note]", demo);
    radios($("[data-m-halo-seg]"), function (v) {
      var bad = v === "bad";
      demo.setAttribute("data-state", bad ? "bad" : "good");
      tag.textContent = bad ? "body { background: var(--bg) }" : "body { background: transparent }";
      note.textContent = bad ? "写了不透明的底：画在光晕之上，把它整个盖住" : "没写，透明——这一层什么都不画";
      announce(bad ? "html和body都写了底色：光晕被body的底盖住" : "底色只写在html：光晕露出来");
    });
  })();

  /* ---------- 3. 前缀顺序：源码 → 产物 → 产物套在玻璃块上 ---------- */
  (function () {
    var box = $("[data-m-pfx]");
    if (!box) return;
    var spec = box.closest(".specimen");
    var gOrder = $("[data-m-pfx-order]");
    var gBuild = $("[data-m-pfx-build]");
    var srcEl = $("[data-m-pfx-src]", box);
    var outEl = $("[data-m-pfx-out]", box);
    var tile = $("[data-m-pfx-tile]", box);
    var readEl = $("[data-m-pfx-read]");
    var envEl = $("[data-m-pfx-env]");
    var VAL = "blur(24px)";

    function decls(order) {
      var wk = ["-webkit-backdrop-filter", VAL];
      var std = ["backdrop-filter", VAL];
      return order === "std" ? [std, wk] : [wk, std];
    }
    /* 压缩器那一步是示意，照 plan 2026-09-23 实测：标准在前时标准那条被并掉、产物只剩前缀；前缀在前两条都留。
       静态站不过压缩，原样交付。 */
    function produce(order, build) {
      return decls(order).map(function (d) {
        var kept = build === "static" || order === "wk" || d[0] !== "backdrop-filter";
        return { p: d[0], v: d[1], kept: kept };
      });
    }
    function render() {
      var order = radioValue(gOrder) || "wk";
      var build = radioValue(gBuild) || "static";
      var out = produce(order, build);
      srcEl.innerHTML = ".glass {\n" + decls(order).map(function (d) { return "  " + esc(d[0] + ": " + d[1] + ";"); }).join("\n") + "\n}";
      outEl.innerHTML = ".glass {\n" + out.map(function (d) {
        var line = "  " + esc(d.p + ": " + d.v + ";");
        return d.kept ? line : '<span class="m-gone">' + line + "</span>";
      }).join("\n") + "\n}" + (build === "static" ? "\n/* 原样交付 */" : out.every(function (d) { return d.kept; }) ? "\n/* 两条都留下了 */" : "\n/* 标准那条被并掉了 */");
      /* 产物真的套到玻璃块上（看得见时才套；setProperty 遇到本浏览器不认的属性会静默忽略——这正是要看的） */
      tile.style.removeProperty("backdrop-filter");
      tile.style.removeProperty("-webkit-backdrop-filter");
      if (isLive(spec)) {
        out.forEach(function (d) { if (d.kept) tile.style.setProperty(d.p, d.v); });
        var v = computedBf(tile);
        var blurred = v && v !== "none" && v.indexOf("blur") >= 0;
        readEl.innerHTML = "玻璃块此刻的计算值：<code>backdrop-filter: " + esc(v) + "</code>　" +
          (blurred ? '<span class="m-chip" data-tone="good">糊开了</span>' :
            '<span class="m-chip" data-tone="bad">没糊：产物里剩下的只有本浏览器不认的那条</span>');
        return blurred;
      }
      readEl.textContent = "玻璃块滚到视口里才套产物。";
      return null;
    }
    envEl.innerHTML = "本浏览器：<code>CSS.supports(\"backdrop-filter\", \"blur(1px)\")</code> → <b>" + supports("backdrop-filter", "blur(1px)") +
      "</b>；<code>CSS.supports(\"-webkit-backdrop-filter\", \"blur(1px)\")</code> → <b>" + supports("-webkit-backdrop-filter", "blur(1px)") + "</b>";
    function changed() {
      var ok = render();
      if (ok === true) announce("产物在玻璃块上糊开了");
      else if (ok === false) announce("产物只剩前缀那条，本浏览器不认，玻璃块没糊");
    }
    radios(gOrder, changed);
    radios(gBuild, changed);
    onLive(spec, function () { render(); });
    render();
  })();

  /* ---------- 4. 降级探针：写法 × 设备 ---------- */
  (function () {
    var win = $("[data-m-probe-win]");
    if (!win) return;
    var gWay = $("[data-m-probe-way]");
    var gDev = $("[data-m-probe-dev]");
    var codeEl = $("[data-m-probe-code]");
    var verdictEl = $("[data-m-probe-verdict]");
    var lookEl = $("[data-m-probe-look]");
    var A = "(backdrop-filter: blur(1px))";
    var B = "(-webkit-backdrop-filter: blur(1px))";
    var COND = { good: "not (" + A + " or " + B + ")", narrow: "not " + A, noparen: "not " + A + " or " + B };
    /* 代码框里分两行写，窄屏也不用横滑 */
    var SHOW = {
      good: "@supports not (" + A + "\n              or " + B + ") {",
      narrow: "@supports not " + A + " {",
      noparen: "@supports not " + A + "\n          or " + B + " {"
    };
    /* 三类浏览器（示意）：std 认标准写法、wk 认前缀写法 */
    var DEV = { modern: { std: true, wk: false }, ios17: { std: false, wk: true }, old: { std: false, wk: false } };
    var LOOK = { frost: "磨砂", solid: "兜底：.9实色", bare: ".62，没磨砂也没兜底" };
    var SAY = {
      good: {
        modern: ["good", "认标准写法，条件不成立，不走兜底：磨砂。"],
        ios17: ["good", "前缀那条成立，条件不成立，不走兜底：磨砂。"],
        old: ["good", "两条都不认，条件成立：玻璃提到.9，后面的字透不上来。"]
      },
      narrow: {
        modern: ["good", "认标准写法，条件不成立：磨砂（这一类碰巧没事）。"],
        ios17: ["bad", "误判：只测了标准写法，它不认，条件恒成立——明明糊得出来，却被打成.9的实心白块。"],
        old: ["good", "条件成立：兜底.9。"]
      },
      noparen: {
        modern: ["warn", "整条@supports语法不对、被丢掉；这台本来就糊得出来，看不出问题。"],
        ios17: ["warn", "整条被丢掉；前缀声明照样生效，还是磨砂，看不出问题。"],
        old: ["bad", "整条被丢掉，兜底永远不生效：没有磨砂、也没提到.9，.62的玻璃直接压在后面的字上。"]
      }
    };
    function look(way, d) {
      var can = d.std || d.wk;
      var fallback = way === "good" ? !can : way === "narrow" ? !d.std : false;   /* 少括号：整条被丢，兜底永不生效 */
      if (fallback) return "solid";
      return can ? "frost" : "bare";
    }
    function render(say) {
      var way = radioValue(gWay) || "good";
      var dev = radioValue(gDev) || "modern";
      var l = look(way, DEV[dev]);
      var s = SAY[way][dev];
      win.setAttribute("data-look", l);
      lookEl.textContent = LOOK[l];
      codeEl.textContent = SHOW[way] + "\n  :root { --glass: rgba(255,255,255,.9); }\n}";
      verdictEl.innerHTML = '<span class="m-chip" data-tone="' + s[0] + '">' + (s[0] === "bad" ? "出错" : s[0] === "warn" ? "碰巧没事" : "对") + "</span> " + esc(s[1]);
      if (say) announce(s[1]);
    }
    radios(gWay, function () { render(true); });
    radios(gDev, function () { render(true); });
    render(false);

    /* 本浏览器的真实回答：条件成不成立（CSS.supports），以及整条规则解析后还在不在（构造样式表数规则） */
    $$("[data-m-probe-live] tr[data-q]").forEach(function (tr) {
      var q = tr.getAttribute("data-q");
      var cells = tr.querySelectorAll("td");
      var holds = supports(COND[q]);
      var kept = "—";
      try {
        if (typeof CSSStyleSheet === "function") {
          var sh = new CSSStyleSheet();
          sh.replaceSync("@supports " + COND[q] + " { .m-x { color: red; } }");
          kept = sh.cssRules.length ? "留下了" : "被丢掉（语法不对）";
        }
      } catch (e) { kept = "—"; }
      cells[0].textContent = kept.indexOf("丢") >= 0 ? "—（整条不成立）" : holds ? "成立：走兜底" : "不成立：照常磨砂";
      cells[1].textContent = kept;
    });
  })();

  /* ---------- 5. 磨砂放在哪 ---------- */
  (function () {
    var range = $("[data-m-where-len]");
    if (!range) return;
    var outEl = $("[data-m-where-len-out]");
    var gDev = $("[data-m-where-dev]");
    var gFrost = $("[data-m-where-frost]");
    var meter = $("[data-m-where-meter]");
    var readEl = $("[data-m-where-read]");
    var LIMIT = 16384;
    var MAXS = Number(range.max) || 20;
    var DEV = { phone: { h: 750, dpr: 3.5 }, desk: { h: 1019, dpr: 1.25 } };
    function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
    function update(say) {
      var s = Number(range.value);
      var d = DEV[radioValue(gDev) || "phone"];
      var px = Math.round(s * d.h * d.dpr);
      var max = MAXS * d.h * d.dpr;
      var over = px > LIMIT;
      var frost = radioValue(gFrost) === "frost";
      var label = (s % 1 ? s.toFixed(1) : String(s)) + "屏";
      outEl.textContent = label;
      range.setAttribute("aria-valuetext", label + "，约" + px + "设备像素");
      meter.style.setProperty("--m-p", String(Math.min(1, px / max)));
      meter.style.setProperty("--m-limit", (Math.min(1, LIMIT / max) * 100).toFixed(1) + "%");
      meter.setAttribute("data-over", over ? "true" : "false");
      var tone, text;
      if (!frost) { tone = "good"; text = "只靠.78的不透明度、不挂磨砂：多长都碰不到纹理上限。"; }
      else if (!over) { tone = "warn"; text = "没超16384，但挂着磨砂，每次滚动整层要重新光栅化。"; }
      else { tone = "bad"; text = "超过16384：整层可能被丢掉——岗岗真机上切配色后整栏空白，要等下次滚动才出现。"; }
      readEl.innerHTML = "<b>" + label + "</b> ≈ <b>" + fmt(px) + "</b>设备像素。" + '<span class="m-chip" data-tone="' + tone + '">' + (tone === "good" ? "没事" : tone === "warn" ? "贵" : "会丢层") + "</span> " + esc(text);
      if (say) announce(text);
    }
    range.addEventListener("input", function () { update(false); });
    radios(gDev, function () { update(true); });
    radios(gFrost, function () { update(true); });
    update(false);

    var pop = $("[data-m-where-popel]");
    var popRead = $("[data-m-where-pop-read]");
    function popUpdate(v, say) {
      pop.setAttribute("data-look", v);
      var t = v === "glass" ? "半透明的底上，糊开的正文和候选叠在一起，字的底不可预测；跟着打字频繁开合，磨砂的开销落在最高频的动作上。"
        : "实色底：候选的字只压在一种颜色上，读得清；开合不碰模糊。";
      popRead.textContent = t;
      if (say) announce(t);
    }
    radios($("[data-m-where-pop]"), function (v) { popUpdate(v, true); });
    popUpdate("solid", false);
  })();

  /* ---------- 6. 模糊的代价 ---------- */
  (function () {
    var win = $("[data-m-cost-win]");
    if (!win) return;
    var spec = win.closest(".specimen");
    var range = $("[data-m-cost-r]");
    var rOut = $("[data-m-cost-r-out]");
    var runBtn = $("[data-m-cost-run]");
    var offBtn = $("[data-m-cost-off]");
    var dot = $("[data-m-cost-dot]");
    var glassRead = $("[data-m-cost-glass-read]");
    var glassBig = win.querySelector(".m-cost-glass b");
    var liveEl = $("[data-m-cost-live]");
    var refEl = $("[data-m-cost-ref]");
    var bar = $("[data-m-cost-bar]");
    var running = false;
    var raf = 0;
    var iv = [];
    var last = 0;
    var lastPaint = 0;

    function radius() { return Number(range.value); }
    /* 「没显卡那档」读数：各家在 2040×1019@1.25 软件合成下量过的数，按半径对上（出处写在条目的「数值」表与出处里）。
       本页自己在本机无头 Chrome 里也量过（perf-cost.mjs）：这台 Mac 的 CPU 快，这么小一块玻璃各半径都是 16.7ms、零长帧，
       看不出代价——所以这里不拿本机的数冒充「没显卡那台」。 */
    var BASE = 16.7;
    function refFor(r, off) {
      if (off) return { ms: BASE, tone: "good", html: "不挂<code>backdrop-filter</code>：<span class=\"m-big\">16.7ms</span>一帧（基线，满60帧）。" };
      if (r === 0) return { ms: BASE, tone: "good", html: "<code>blur(0)</code>只剩saturate：<span class=\"m-big\">16.7ms</span>——刷刷实测「只留saturate(150%)」就回到满帧。" };
      var lead = r < 4 ? "1–3px没单独量过；4px已经和24px一样贵：" : "有blur就贵，半径不是关键：";
      return { ms: 33.3, tone: "bad", html: lead + "<span class=\"m-big\">33.3ms</span>一帧（掉到30帧）——刷刷按压列表行，blur 24px和4px帧间隔中位都是33.3ms；岗岗30px的浮层P95 33.4ms、长帧34–52个。" };
    }
    function showRef() {
      var off = offBtn.getAttribute("aria-pressed") === "true";
      var ref = refFor(radius(), off);
      refEl.innerHTML = ref.html;
      bar.style.setProperty("--m-p", String(ref.ms / 33.3));
      bar.setAttribute("data-tone", ref.tone);
    }
    function applyRadius() {
      var r = radius();
      var off = offBtn.getAttribute("aria-pressed") === "true";
      win.style.setProperty("--m-r", String(r));
      win.setAttribute("data-off", off ? "true" : "false");
      rOut.textContent = r + "px";
      range.setAttribute("aria-valuetext", r + "像素");
      glassBig.textContent = off ? "无" : r + "px";
      glassRead.textContent = off ? "backdrop-filter: none" : "blur(" + r + "px) saturate(150%)";
      showRef();
    }
    function median(a) {
      if (!a.length) return 0;
      var s = a.slice().sort(function (x, y) { return x - y; });
      return s[Math.floor((s.length - 1) / 2)];
    }
    /* 每帧：方块换一个色相（玻璃底下一处重画），顺手记帧间隔；每半秒更新一次读数 */
    function costFrame(ts) {
      raf = 0;
      if (!shouldRun()) { stop(); return; }
      if (last) {
        iv.push({ t: ts, d: ts - last });
        while (iv.length && iv[0].t < ts - 1000) iv.shift();
      }
      last = ts;
      dot.style.backgroundColor = "hsl(" + Math.round((ts / 8) % 360) + ", 80%, 55%)";
      if (ts - lastPaint > 500 && iv.length > 3) {
        lastPaint = ts;
        var ds = iv.map(function (x) { return x.d; });
        var longN = ds.filter(function (d) { return d > 25; }).length;
        liveEl.innerHTML = "整页帧间隔中位 <span class=\"m-big\">" + median(ds).toFixed(1) + "ms</span>，最近1秒长帧（&gt;25ms）<b>" + longN + "</b>个、共" + ds.length + "帧。";
      }
      raf = window.requestAnimationFrame(costFrame);
    }
    function shouldRun() { return running && isLive(spec) && !doc.hidden; }
    function start() {
      if (raf || !shouldRun()) return;
      last = 0; lastPaint = 0; iv = [];
      liveEl.textContent = "量着……";
      raf = window.requestAnimationFrame(costFrame);
    }
    function stop() {
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
      dot.style.backgroundColor = "";
      if (!running) liveEl.textContent = "没在量。打开「玻璃底下有一块在变色」才开始量。";
      else if (!isLive(spec)) liveEl.textContent = "样例滚出视口，先停着。";
    }
    range.addEventListener("input", applyRadius);
    toggle(runBtn, function (on) {
      running = on;
      if (on) start(); else stop();
      announce(on ? "开始变色并量帧间隔" : "停了");
    });
    toggle(offBtn, function (on) { applyRadius(); announce(on ? "整条backdrop-filter关掉" : "backdrop-filter恢复"); });
    onLive(spec, function (on) { if (on) start(); else stop(); });
    doc.addEventListener("visibilitychange", function () { if (doc.hidden) stop(); else start(); });
    applyRadius();

  })();

  /* ---------- 7. 模糊三档 ---------- */
  (function () {
    var win = $("[data-m-tier-win]");
    if (!win) return;
    var seg = $("[data-m-tier-seg]");
    var openBtn = $("[data-m-tier-open]");
    var closeBtn = $("[data-m-tier-close]");
    var scrim = $("[data-m-tier-scrim]");
    var say = $("[data-m-tier-say]");
    var T = window.StarTheme || null;
    var SAY = {
      full: "full：遮罩糊开26px、不压暗；面板.88玻璃＋自己的磨砂。",
      lite: "lite：遮罩不模糊、压暗淡入；面板不模糊、底提到.97。侧栏的磨砂照旧。",
      off: "off：同lite，并且侧栏的常驻磨砂也关了，玻璃提到近乎不透明。"
    };
    function siteTier() {
      if (window.StarShell && typeof window.StarShell.blurTier === "function") return window.StarShell.blurTier();
      return root.getAttribute("data-blur") || "lite";
    }
    function setTier(v) {
      win.setAttribute("data-tier", v);
      say.textContent = SAY[v];
    }
    /* 小窗默认跟着全站此刻的档位走（外壳 load 后才测显卡，测完档位可能变）；用户自己切过就不再跟 */
    var touched = false;
    function follow() {
      if (touched) return;
      var t = siteTier();
      if (win.getAttribute("data-tier") === t && radioValue(seg) === t) return;
      setRadio(seg, t);
      setTier(t);
    }
    follow();
    radios(seg, function (v) { touched = true; setTier(v); announce("小窗档位：" + SAY[v]); });

    function isOpen() { return win.classList.contains("is-open"); }
    function open() {
      if (isOpen()) return;
      win.classList.add("is-open");
      openBtn.setAttribute("aria-expanded", "true");
      window.setTimeout(function () { closeBtn.focus(); }, 30);
    }
    function close(back) {
      if (!isOpen()) return;
      win.classList.remove("is-open");
      openBtn.setAttribute("aria-expanded", "false");
      if (back) openBtn.focus();
    }
    openBtn.addEventListener("click", open);
    closeBtn.addEventListener("click", function () { close(true); });
    scrim.addEventListener("click", function () { close(true); });
    win.addEventListener("keydown", function (e) {
      if (composing(e)) return;
      if (e.key === "Escape" && isOpen()) { e.preventDefault(); e.stopPropagation(); close(true); }
    });

    /* 这台机器上「自动」的真实判法：读外壳的偏好、档位、显卡缓存；「现测一次」只读不存 */
    var prefEl = $("[data-m-tier-pref]");
    var nowEl = $("[data-m-tier-now]");
    var gpuEl = $("[data-m-tier-gpu]");
    var probeEl = $("[data-m-tier-probe]");
    var PREF = { auto: "自动", on: "开", off: "关" };
    var TIER = { full: "full（磨砂）", lite: "lite（只压暗）", off: "off（关）" };
    function paint() {
      follow();
      var pref = T && T.blurPref ? T.blurPref() : (root.getAttribute("data-blur-pref") || "auto");
      var tier = siteTier();
      var gpu = T && T.gpu ? T.gpu() : null;
      prefEl.textContent = (PREF[pref] || pref) + "（data-blur-pref=" + pref + "）";
      nowEl.textContent = TIER[tier] || tier;
      gpuEl.textContent = gpu === true ? "测过：有显卡" : gpu === false ? "测过：没显卡（软件渲染）" : "还没测过";
      var k = pref === "on" ? "on" : pref === "off" ? "off" : gpu === true ? "gpu" : gpu === false ? "soft" : "none";
      $$("[data-m-tier-flow] li").forEach(function (li) { li.setAttribute("data-on", li.getAttribute("data-k") === k ? "true" : "false"); });
    }
    paint();
    if (T && typeof T.onChange === "function") T.onChange(paint);
    /* 外壳 load 之后空闲时才测，测完会 apply（上面 onChange 会收到）；再兜一次底 */
    window.addEventListener("load", function () { window.setTimeout(paint, 1500); });

    $("[data-m-tier-test]").addEventListener("click", function () {
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
      var t = ok ? "拿到了WebGL上下文：有显卡，「自动」会走full。" : "拿不到：软件渲染（没显卡），「自动」会走lite。";
      probeEl.textContent = t;
      announce(t);
    });
  })();

  /* ---------- 8. 圆角阶 ---------- */
  (function () {
    var box = $("[data-m-rad]");
    if (!box) return;
    var range = $("[data-m-rad-s]");
    var out = $("[data-m-rad-s-out]");
    var bad = false;
    function update() {
      var s = Number(range.value);
      box.style.setProperty("--m-s", String(s));
      var note = Math.abs(s - 1.417) < 0.004 ? "（2040宽）" : s >= 1.45 ? "（封顶）" : s === 1 ? "（1440及以下）" : "";
      out.textContent = s.toFixed(3);
      range.setAttribute("aria-valuetext", s.toFixed(3) + note);
      $$("b[data-r]", box).forEach(function (b) {
        var r = Number(b.getAttribute("data-r"));
        if (r >= 999) { b.textContent = "999px"; return; }
        b.textContent = bad ? r + "px（没乘）" : (r * s).toFixed(1).replace(/\.0$/, "") + "px";
      });
    }
    range.addEventListener("input", update);
    toggle($("[data-m-rad-bad]"), function (on) {
      bad = on;
      box.setAttribute("data-bad", on ? "true" : "false");
      update();
      announce(on ? "圆角不跟着乘：零件变大，角还是原来的像素" : "圆角跟着缩放系数一起乘");
    });
    update();
  })();

  /* ---------- 9. 小屋 · 暖墨阴影 ---------- */
  (function () {
    var box = $("[data-m-sh]");
    if (!box) return;
    var set = $("[data-m-sh-set]", box);
    var range = $("[data-m-sh-tilt]");
    var out = $("[data-m-sh-tilt-out]");
    var cap1 = $("[data-m-sh-cap1]");
    var cap2 = $("[data-m-sh-cap2]");
    var CAP = {
      warm: ["墙上：挂画投影<code>0 16px 34px -14px</code>暖墨.22", "地毯上：浮起<code>0 8px 20px -10px</code>暖墨.11"],
      black: ["墙上：同样的投影换成纯黑.22（反例）", "地毯上：纯黑.11（反例）"],
      night: ["墙上：夜里换黑加深<code>rgba(0,0,0,.55)</code>，发丝线换浅色", "地毯上：浮起档夜里没另写，照旧暖墨.11"]
    };
    radios($("[data-m-sh-seg]"), function (v) {
      box.setAttribute("data-mode", v === "night" ? "dark" : "light");
      box.setAttribute("data-ink", v === "black" ? "black" : "warm");
      cap1.innerHTML = CAP[v][0];
      cap2.innerHTML = CAP[v][1];
      announce(v === "night" ? "夜里：卡纸变夜卡纸、发丝线变浅、投影换黑加深" : v === "black" ? "白天纯黑阴影：压在暖纸上发灰" : "白天暖墨阴影");
    });
    function tilt(x, y) {
      box.style.setProperty("--m-tx", String(x));
      box.style.setProperty("--m-ty", String(y));
      out.textContent = (Math.round(x * 100) / 100).toString();
    }
    range.addEventListener("input", function () { tilt(Number(range.value), 0); });
    /* 鼠标在门厅卡上移动也能倾（只认鼠标；触屏用上面的滑杆） */
    set.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse") return;
      var r = set.getBoundingClientRect();
      var x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
      var y = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
      range.value = String(Math.round(x * 20) / 20);
      tilt(Number(range.value), Math.round(y * 20) / 20);
    });
  })();

  /* ---------- 10. 小屋 · 水彩绿植 ---------- */
  (function () {
    var box = $("[data-m-plant]");
    if (!box) return;
    var NAME = { wash: "水洗底", back: "后层浅叶", cool: "冷调叶影", front: "前层中叶", second: "二道水" };
    function setLayer(k, on) {
      var btn = box.querySelector('[data-m-layer="' + k + '"]');
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      var g = box.querySelector('svg [data-layer="' + k + '"]');
      if (on) g.removeAttribute("data-off"); else g.setAttribute("data-off", "true");
    }
    $$("[data-m-layer]", box).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var k = btn.getAttribute("data-m-layer");
        var on = btn.getAttribute("aria-pressed") !== "true";
        setLayer(k, on);
        announce((on ? "打开" : "关掉") + NAME[k]);
      });
    });
    $$("[data-m-plant-preset]", box).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var flat = btn.getAttribute("data-m-plant-preset") === "flat";
        Object.keys(NAME).forEach(function (k) { setLayer(k, flat ? k === "front" : true); });
        announce(flat ? "只留前层：扁平图标的样子" : "四层全开");
      });
    });
    radios($("[data-m-plant-time]", box), function (v) {
      box.setAttribute("data-mode", v);
      announce(v === "dark" ? "夜里：整体收一档亮度" : "白天");
    });
  })();

  /* ---------- 11. backdrop root ---------- */
  (function () {
    var parent = $("[data-m-root-parent]");
    if (!parent) return;
    var spec = parent.closest(".specimen");
    var tag = $("[data-m-root-tag]");
    var readEl = $("[data-m-root-read]");
    var sayEl = $("[data-m-root-say]");
    var chip = parent.querySelector(".m-root-chip");
    var TAG = { none: "父框", vt: "父框 · view-transition-name", opacity: "父框 · opacity: .99", filter: "父框 · filter: saturate(100%)" };
    function read() {
      var v = isLive(spec) ? computedBf(chip) : "（滚到这里才挂）";
      readEl.textContent = v;
      var p = parent.getAttribute("data-p");
      sayEl.innerHTML = p === "none"
        ? '<span class="m-chip" data-tone="good">糊得到</span> 小卡后面的条纹糊开了。'
        : '<span class="m-chip" data-tone="bad">够不着</span> 小卡的计算值还是<code>' + esc(v) + "</code>，后面的条纹却清清楚楚——父框成了backdrop root，小卡只糊得到父框自己画的那点东西。";
    }
    radios($("[data-m-root-seg]"), function (v) {
      parent.setAttribute("data-p", v);
      tag.textContent = TAG[v];
      read();
      announce(v === "none" ? "父框什么都不加：小卡糊得到后面" : "父框加了" + TAG[v].replace("父框 · ", "") + "：小卡的磨砂够不着后面");
    });
    onLive(spec, read);
    read();
    /* 跨页离开时摘掉名字，别让这个演示框混进跨文档过渡；回来（bfcache）再按选中的挂回去 */
    window.addEventListener("pageswap", function () { if (parent.getAttribute("data-p") === "vt") parent.setAttribute("data-p", "none"); });
    window.addEventListener("pageshow", function () {
      var v = radioValue($("[data-m-root-seg]"));
      if (v) parent.setAttribute("data-p", v);
    });
  })();

  /* ---------- 0c. 看得见才挂磨砂：最后再开始观察（各段的 onLive 都已登记） ---------- */
  var heavy = $$("[data-m-heavy]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (list) {
      list.forEach(function (en) { setLive(en.target, en.isIntersecting); });
    }, { rootMargin: "160px 0px" });
    heavy.forEach(function (el) { io.observe(el); });
  } else {
    heavy.forEach(function (el) { setLive(el, true); });
  }
})();
