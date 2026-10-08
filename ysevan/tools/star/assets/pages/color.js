/*
 * 色彩页专属脚本（defer，排在 star.js 之后）
 *   1. 光晕小窗：三团逐个开关（button + aria-pressed）
 *   2. 主题属性实时读数：读 <html> 上的 data-mode-pref / data-mode / data-accent 与 theme-color
 *   3. 「任何元素都能局部切」：给那一块翻 data-mode
 *   4. 对比度计算器：WCAG 2.x 相对亮度；半透明字先按 alpha 压到底上再算
 *   5. 星野舞台：换这一块的 data-accent
 * 色块点一下复制由 star.js 统一处理（button[data-copy]），这里不管。
 */
(function () {
  "use strict";
  var doc = document;
  var root = doc.documentElement;
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  var announce = window.StarShell ? window.StarShell.announce : function () {};

  /* ---- 1. 光晕开关 ---- */
  each(doc.querySelectorAll(".halo-toggle"), function (btn) {
    btn.addEventListener("click", function () {
      var on = btn.getAttribute("aria-pressed") !== "true";
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      var win = btn.closest(".halo-demo").querySelector(".hb" + btn.getAttribute("data-blob"));
      if (win) win.classList.toggle("is-off", !on);
    });
  });

  /* ---- 2. 主题属性实时读数 ---- */
  function paintLive() {
    var map = {
      pref: root.getAttribute("data-mode-pref") || "（无）",
      mode: root.getAttribute("data-mode") || "（无）",
      accent: root.getAttribute("data-accent") || "（无）",
      meta: (doc.querySelector('meta[name="theme-color"]') || { getAttribute: function () { return "（无）"; } }).getAttribute("content")
    };
    each(doc.querySelectorAll("[data-live]"), function (el) { el.textContent = map[el.getAttribute("data-live")]; });
  }
  paintLive();
  if (window.StarTheme) window.StarTheme.onChange(paintLive);

  /* ---- 3. 局部切深色 ---- */
  each(doc.querySelectorAll("[data-flip-btn]"), function (btn) {
    btn.addEventListener("click", function () {
      var box = btn.closest("[data-flip]");
      var dark = box.getAttribute("data-mode") !== "dark";
      box.setAttribute("data-mode", dark ? "dark" : "light");
      btn.setAttribute("aria-pressed", dark ? "true" : "false");
      btn.textContent = dark ? "切回浅色" : "切到深色";
    });
  });

  /* ---- 4. 对比度计算器 ---- */
  var calc = doc.querySelector("[data-calc]");
  if (calc) {
    var fg = calc.querySelector("[data-calc-fg]");
    var fgHex = calc.querySelector("[data-calc-fg-hex]");
    var bg = calc.querySelector("[data-calc-bg]");
    var bgHex = calc.querySelector("[data-calc-bg-hex]");
    var alpha = calc.querySelector("[data-calc-alpha]");
    var alphaOut = calc.querySelector("[data-calc-alpha-out]");
    var preview = calc.querySelector("[data-calc-preview]");
    var ratioEl = calc.querySelector("[data-calc-ratio]");
    var mixEl = calc.querySelector("[data-calc-mix]");
    var liveEl = calc.querySelector("[data-calc-live]");
    var HEX6 = /^#?([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/;

    var norm = function (v) {
      var m = HEX6.exec(String(v).trim());
      if (!m) return null;
      var h = m[1];
      if (h.length === 3) h = h.replace(/./g, function (c) { return c + c; });
      return "#" + h.toUpperCase();
    };
    var rgb = function (h) { return [1, 3, 5].map(function (i) { return parseInt(h.slice(i, i + 2), 16); }); };
    var lin = function (c) { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    var lum = function (c) { return 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]); };
    var toHex = function (c) { return "#" + c.map(function (v) { return Math.round(v).toString(16).padStart(2, "0"); }).join("").toUpperCase(); };

    var state = { fg: "#3C3C43", bg: "#EFEFFB", a: 0.76 };
    var result = function () {
      var f = rgb(state.fg);
      var b = rgb(state.bg);
      var mixed = f.map(function (v, i) { return v * state.a + b[i] * (1 - state.a); });
      var x = lum(mixed);
      var y = lum(b);
      return { ratio: (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05), mixed: toHex(mixed) };
    };
    var render = function (speak) {
      var r = result();
      var shown = r.ratio.toFixed(2);
      ratioEl.textContent = shown;
      mixEl.textContent = state.a < 1 ? "合成后：" + r.mixed : "不透明：" + state.fg;
      preview.style.background = state.bg;
      preview.style.color = r.mixed;
      alphaOut.textContent = state.a < 1 ? String(state.a.toFixed(2)).replace(/^0/, "") : "1";
      each(calc.querySelectorAll("[data-calc-v]"), function (li) {
        var need = parseFloat(li.getAttribute("data-calc-v"));
        var pass = r.ratio >= need;
        li.classList.toggle("is-pass", pass);
        li.classList.toggle("is-fail", !pass);
      });
      if (speak) liveEl.textContent = "对比度" + shown + "比1";
    };
    var setFg = function (v, from) { var h = norm(v); if (!h) return; state.fg = h; if (from !== fg) fg.value = h.toLowerCase(); if (from !== fgHex) fgHex.value = h; };
    var setBg = function (v, from) { var h = norm(v); if (!h) return; state.bg = h; if (from !== bg) bg.value = h.toLowerCase(); if (from !== bgHex) bgHex.value = h; };

    fg.addEventListener("input", function () { setFg(fg.value, fg); render(false); });
    bg.addEventListener("input", function () { setBg(bg.value, bg); render(false); });
    fgHex.addEventListener("input", function () { setFg(fgHex.value, fgHex); render(false); });
    bgHex.addEventListener("input", function () { setBg(bgHex.value, bgHex); render(false); });
    alpha.addEventListener("input", function () { state.a = parseFloat(alpha.value) || 1; render(false); });
    [fg, bg, fgHex, bgHex, alpha].forEach(function (el) { el.addEventListener("change", function () { render(true); }); });
    each(calc.querySelectorAll("[data-preset]"), function (btn) {
      btn.addEventListener("click", function () {
        var p = btn.getAttribute("data-preset").split(",");
        setFg(p[0]);
        state.a = parseFloat(p[1]);
        alpha.value = String(state.a);
        setBg(p[2]);
        render(true);
      });
    });
    render(false);
  }

  /* ---- 5. 星野舞台换强调色 ---- */
  var stage = doc.querySelector("[data-stage]");
  if (stage) {
    var names = { blue: "蓝", green: "绿", indigo: "靛", orange: "橙", pink: "粉", teal: "青" };
    each(doc.querySelectorAll("[data-stage-accent]"), function (btn) {
      btn.addEventListener("click", function () {
        var a = btn.getAttribute("data-stage-accent");
        stage.setAttribute("data-accent", a);
        each(doc.querySelectorAll("[data-stage-accent]"), function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
        announce("舞台底强调色：" + names[a]);
      });
    });
  }
})();

/*
 * 「用起来」：每条补的真实元素演示（2026-10-08）
 *   6. 中性底：现行 / 反例「靠边框分层」切换（radiogroup，方向键由 star.js 统一处理）
 *   7. 六强调色：样例自己的强调色（默认跟全站走，全站一换这里跟着换）、选中标签、做一题 / 重来、进度条
 *   8. 语义色：红绿色弱模拟（SVG feColorMatrix）
 *   9. 浅底实色：拖光晕浓度，半透明底与实色底上的字实时算对比度（读页面上真实的计算值）
 *  10. 暖纸：顶栏当前项（白天夜里两份同步）
 *  11. 冷夜暖灯：雾与灯晕开关
 *  12. 装饰色：色块悬停 / 聚焦时，盆栽里用到这个色的部件留下、其余淡出
 * 只改样例自己的属性，不碰 <html> 的 data-mode / data-accent，也不写 localStorage。
 */
(function () {
  "use strict";
  var doc = document;
  var root = doc.documentElement;
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  function announce(msg) { if (window.StarShell) window.StarShell.announce(msg); }
  var ACCENT_NAME = { blue: "蓝", green: "绿", indigo: "靛", orange: "橙", pink: "粉", teal: "青" };

  /* 单选组：点哪项选哪项（roving tabindex）；方向键由 star.js 移动焦点并 click */
  function radios(group, onPick) {
    group.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest('[role="radio"]') : null;
      if (!b || !group.contains(b)) return;
      select(group, b);
      onPick(b, true);
    });
  }
  function select(group, b) {
    each(group.querySelectorAll('[role="radio"]'), function (r) {
      var on = r === b;
      r.setAttribute("aria-checked", on ? "true" : "false");
      r.setAttribute("tabindex", on ? "0" : "-1");
    });
  }

  /* 颜色解析与 WCAG 2.x 对比度 */
  function parse(c) {
    c = String(c || "").trim();
    var m = /^#([0-9a-f]{6})$/i.exec(c);
    if (m) return [0, 2, 4].map(function (i) { return parseInt(m[1].slice(i, i + 2), 16); }).concat(1);
    m = /^rgba?\(([^)]+)\)$/i.exec(c);
    if (!m) return null;
    var p = m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);
    return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
  }
  function over(fg, a, bg) { return [0, 1, 2].map(function (i) { return fg[i] * a + bg[i] * (1 - a); }); }
  function lin(v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
  function lum(c) { return 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]); }
  function ratio(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function prop(el, name) { return getComputedStyle(el).getPropertyValue(name).trim(); }

  /* ---- 6. 中性底：现行 / 靠边框 ---- */
  each(doc.querySelectorAll("[data-ug-box]"), function (box) {
    var pair = box.closest(".specimen").querySelector(".layer-pair");
    var group = box.querySelector('[role="radiogroup"]');
    if (!pair || !group) return;
    radios(group, function (b) {
      var v = b.getAttribute("data-ug");
      pair.setAttribute("data-ug", v);
      announce(v === "border" ? "已换成反例：靠边框分层，光晕、玻璃和投影都去掉了" : "已换回现行：玻璃、投影和分隔线");
    });
  });

  /* ---- 7. 六强调色「用起来」 ---- */
  var ua = doc.querySelector("[data-ua]");
  if (ua) {
    var pick = ua.querySelector(".ua-pick");
    var panels = ua.querySelectorAll("[data-ua-panel]");
    var setAccent = function (a, speak) {
      if (!ACCENT_NAME[a]) return;
      each(panels, function (p) { p.setAttribute("data-accent", a); });
      var b = pick.querySelector('[data-ua-accent="' + a + '"]');
      if (b) select(pick, b);
      if (speak) announce("样例强调色：" + ACCENT_NAME[a]);
    };
    radios(pick, function (b) { setAccent(b.getAttribute("data-ua-accent"), true); });
    var globalAccent = root.getAttribute("data-accent") || "blue";
    setAccent(globalAccent, false);
    if (window.StarTheme) window.StarTheme.onChange(function (st) {
      if (st.accent !== globalAccent) { globalAccent = st.accent; setAccent(st.accent, false); }
    });

    each(ua.querySelectorAll(".ua-chip"), function (chip) {
      chip.addEventListener("click", function () {
        var on = chip.getAttribute("aria-pressed") !== "true";
        chip.setAttribute("aria-pressed", on ? "true" : "false");
        announce(chip.textContent.trim() + (on ? "：已选" : "：未选"));
      });
    });

    each(panels, function (p) {
      var n = 8;
      var max = 20;
      var bar = p.querySelector("[data-ua-bar]");
      var num = p.querySelector("[data-ua-num]");
      var track = p.querySelector('[role="progressbar"]');
      var tag = (p.querySelector(".use-tag") || {}).textContent || "";
      var paint = function (speak) {
        bar.style.transform = "scaleX(" + (n / max) + ")";
        num.textContent = n + "/" + max + "题";
        track.setAttribute("aria-valuenow", String(n));
        if (speak) announce(tag + "样例：已完成" + n + "/" + max + "题");
      };
      p.querySelector("[data-ua-next]").addEventListener("click", function () { n = Math.min(max, n + 1); paint(true); });
      p.querySelector("[data-ua-reset]").addEventListener("click", function () { n = 0; paint(true); });
      paint(false);
    });
  }

  /* ---- 8. 语义色：红绿色弱模拟 ---- */
  each(doc.querySelectorAll("[data-us]"), function (stage) {
    var btn = stage.querySelector("[data-us-sim]");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var on = btn.getAttribute("aria-pressed") !== "true";
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      stage.classList.toggle("is-sim", on);
      announce(on ? "已打开红绿色弱模拟：带字的标签照样读得出，只靠色点的那组红绿分不清" : "已关掉红绿色弱模拟");
    });
  });

  /* ---- 9. 浅底实色：拖光晕浓度 ---- */
  each(doc.querySelectorAll("[data-uti]"), function (box) {
    var range = box.querySelector("[data-uti-range]");
    var out = box.querySelector("[data-uti-out]");
    var halo = box.querySelector("[data-uti-halo]");
    var semiEl = box.querySelector("[data-uti-semi]");
    var solidEl = box.querySelector("[data-uti-solid]");
    var semiChip = box.querySelector(".is-semi .uti-chip");
    var solidChip = box.querySelector(".is-solid .uti-chip");
    var stage = box.querySelector(".uti-stage");
    if (!range || !semiChip) return;
    var verdict = function (el, r) {
      el.textContent = r.toFixed(2);
      el.classList.toggle("is-pass", r >= 4.5);
      el.classList.toggle("is-fail", r < 4.5);
    };
    var paint = function (speak) {
      var s = (parseFloat(range.value) || 0) / 100;
      halo.style.opacity = String(s);
      out.textContent = Math.round(s * 100) + "%";
      var bg = parse(prop(stage, "--bg"));
      var blob = parse(prop(stage, "--blob1"));
      var text = parse(getComputedStyle(semiChip).color);
      var semi = parse(getComputedStyle(semiChip).backgroundColor);
      var solid = parse(getComputedStyle(solidChip).backgroundColor);
      if (!bg || !blob || !text || !semi || !solid) return;
      var under = over(blob, blob[3] * s, bg);
      var rs = ratio(text, over(semi, semi[3], under));
      var rd = ratio(text, over(solid, solid[3], under));
      verdict(semiEl, rs);
      verdict(solidEl, rd);
      if (speak) announce("光晕" + Math.round(s * 100) + "%：半透明底" + rs.toFixed(2) + "，实色底" + rd.toFixed(2));
    };
    range.addEventListener("input", function () { paint(false); });
    range.addEventListener("change", function () { paint(true); });
    paint(false);
  });

  /* ---- 10. 暖纸：顶栏当前项（白天夜里两份一起换） ---- */
  var upLinks = doc.querySelectorAll("[data-up-nav]");
  each(upLinks, function (b) {
    b.addEventListener("click", function () {
      var v = b.getAttribute("data-up-nav");
      each(upLinks, function (x) {
        if (x.getAttribute("data-up-nav") === v) x.setAttribute("aria-current", "page");
        else x.removeAttribute("aria-current");
      });
      announce("顶栏当前项：" + b.textContent.trim());
    });
  });

  /* ---- 11. 冷夜暖灯：雾与灯晕 ---- */
  each(doc.querySelectorAll("[data-un]"), function (stage) {
    var btn = stage.querySelector("[data-un-haze]");
    if (!btn) return;
    var label = btn.lastChild;
    btn.addEventListener("click", function () {
      var on = btn.getAttribute("aria-pressed") !== "true";
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      stage.classList.toggle("is-off", !on);
      label.textContent = on ? "雾与灯晕：开" : "雾与灯晕：关";
      announce(on ? "雾与灯晕已打开" : "雾与灯晕已关掉，只剩纸底");
    });
  });

  /* ---- 12. 装饰色：色块对应盆栽部件 ---- */
  var ud = doc.querySelector("[data-ud]");
  var strip = doc.querySelector("#x-deco .deco-strip");
  if (ud && strip) {
    var live = ud.querySelector("[data-ud-live]");
    var current = null;
    var clear = function () {
      current = null;
      ud.classList.remove("is-hl");
      each(ud.querySelectorAll("[data-xc].is-hl"), function (el) { el.classList.remove("is-hl"); });
      each(strip.querySelectorAll(".sw.is-on"), function (el) { el.classList.remove("is-on"); });
    };
    var show = function (sw) {
      var c = (sw.getAttribute("data-copy") || "").toUpperCase();
      if (c === current) return;
      clear();
      var parts = ud.querySelectorAll('[data-xc="' + c + '"]');
      if (!parts.length) return;
      current = c;
      ud.classList.add("is-hl");
      sw.classList.add("is-on");
      each(parts, function (el) { el.classList.add("is-hl"); });
      var name = (sw.querySelector("span") || {}).textContent || c;
      if (live) live.textContent = "盆栽里只留下" + name + c;
    };
    each(strip.querySelectorAll(".sw[data-copy]"), function (sw) {
      sw.addEventListener("mouseenter", function () { show(sw); });
      sw.addEventListener("focus", function () { show(sw); });
      sw.addEventListener("mouseleave", function () { if (doc.activeElement !== sw) clear(); });
      sw.addEventListener("blur", clear);
    });
  }
  /* ---- 6. 黄色只给两天内到期（SPEC §2a）：拖「今天是」，日期标签按离截止几天换档 ----
     档位照 plan dateLabel.ts 的 urgencyTone：<0 逾期红、0 今天截止橙、1–2 黄、其余灰；已完成一律灰、只写绝对日期。
     文案照今日页的 relativeDeadlineLabel：逾期N天 / 今天截止 / 明天截止 / 还有N天。任务和日期都是示例。 */
  var urg = doc.querySelector("[data-urg]");
  if (urg) {
    var day = urg.querySelector("[data-urg-day]");
    var dayOut = urg.querySelector("[data-urg-out]");
    var urgSum = urg.querySelector("[data-urg-sum]");
    var before = urg.querySelector("[data-urg-before]");
    var lists = urg.querySelectorAll("[data-urg-list]");
    var URG_TASKS = [
      { t: "交物业费", due: 6 }, { t: "周报", due: 8, tag: "重要" }, { t: "体检预约", due: 9 }, { t: "材料收集", due: 10 },
      { t: "换季衣物", due: 12, tag: "待重排" }, { t: "季度总结", due: 20 }, { t: "报销单", due: 5, done: true }
    ];
    var WEEK = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    var urgTimer = 0;
    var urgTone = function (d) { return d < 0 ? "overdue" : d === 0 ? "today" : d <= 2 ? "soon" : "normal"; };
    var urgText = function (d) { return d < 0 ? "逾期" + (-d) + "天" : d === 0 ? "今天截止" : d === 1 ? "明天截止" : "还有" + d + "天"; };
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
    var paintUrg = function (speak) {
      var today = Number(day.value);
      var label = "10月" + today + "日 " + WEEK[new Date(2026, 9, today).getDay()];
      dayOut.textContent = label;
      day.setAttribute("aria-valuetext", label);
      var n = { overdue: 0, today: 0, soon: 0, normal: 0, done: 0 };
      var html = URG_TASKS.map(function (it) {
        var d = it.due - today;
        var tone = it.done ? "normal" : urgTone(d);
        if (it.done) n.done++; else n[tone]++;
        var chip = '<span class="urg-chip" data-tone="' + tone + '"' + (it.done ? " data-done" : "") + ">" + (it.done ? "10月" + it.due + "日" : urgText(d)) + "</span>";
        return '<li><span class="urg-task' + (it.done ? " is-done" : "") + '">' + esc(it.t) + (it.done ? "（已完成）" : "") + "</span>" +
          (it.tag ? '<span class="urg-tag">' + esc(it.tag) + "</span>" : "") + chip + "</li>";
      }).join("");
      each(lists, function (ul) { ul.innerHTML = html; });
      urgSum.innerHTML = "<b>" + esc(label) + "</b>：逾期" + n.overdue + "项、今天截止" + n.today + "项、两天内" + n.soon + "项、其余" + n.normal + "项；已完成" + n.done + "项一律灰";
      if (speak) {
        clearTimeout(urgTimer);
        urgTimer = setTimeout(function () { announce(label + "：逾期" + n.overdue + "项，今天截止" + n.today + "项，两天内" + n.soon + "项"); }, 350);
      }
    };
    day.addEventListener("input", function () { paintUrg(true); });
    before.addEventListener("click", function () {
      var on = before.getAttribute("aria-pressed") !== "true";
      before.setAttribute("aria-pressed", on ? "true" : "false");
      urg.classList.toggle("is-before", on);
      announce(on ? "改版前（示意）：日期一律强调色" : "现行：只有急的带颜色");
    });
    paintUrg(false);
  }
})();
