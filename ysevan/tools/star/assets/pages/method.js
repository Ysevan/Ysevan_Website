/*
 * 「做网站的方法」页专属脚本（defer，排在 star.js 之后）
 *
 * 每条一块演示，按条目顺序一个 init：
 *   1 端正（Cover Flow / 球形选卡）    2 转场的语言（两版门 / 洇一层纸，WAAPI）  3 他画的就是风格
 *   4 名片为主（清单）                 5 借结构不借视觉                        6 小屋六条（tablist）
 *   7 降级的终点（canvas 逐像素比）     8 忘掉的往事                            9 三台设备（按真实比例画框）
 *  10 验收档位                        11 先量后截图（2040 版面缩进框里，量 getBoundingClientRect）
 *  12 设视口不设窗口（模拟）           13 溢出跟目标宽度比（量注入块的真实右缘）
 *  14 七条情景题                      15 先红一次（三棵树 × 两条判据，真派 KeyboardEvent）
 *  16 别读早（真过渡、真读 computed）  17 不掺自己加的量（随机数模拟限帧）       18 阴性附阳性（示例进程表）
 *  19 往后果轻的错（天平）             20 测试不出声（画的喇叭，没有任何音频）     21 软件渲染（真值表 + 点了才真探测）
 *  22 后台暂停 rAF（rAF 计数 + visibilitychange）                              23 量具放哪
 *  24 错话三形态（找错）               25 白名单打包（规则照 scripts/publish-static.mjs）
 *
 * 约定：
 *   · 只改样例自己的属性（data-v、data-mode、aria-*、inline transform），不碰 <html> 的 data-mode / data-accent，
 *     不写 localStorage，不用外壳保留属性（data-mode-set 等）。
 *   · 播报走 StarShell.announce（全站一个 polite 区）；单选组的方向键由 star.js 统一处理（移动焦点并 click），这里只接 click。
 *     tablist、选卡台的方向键自己处理；任何键盘处理第一行先判输入法合成态。
 *   · 动画只动 transform / opacity；减弱动效下直接到终点（外壳关掉 CSS 过渡，WAAPI 这里自己判）。
 *   · 一直在跑的只有两样：rAF 计数（只在点开、看得见、页面没隐藏时跑）与喇叭波纹（CSS，滚出视口暂停）。
 *   · 全是页面内模拟：不开浏览器、不发网络请求、不出声（没有 Audio / AudioContext）。
 *     唯一碰真家伙的是「探测这台浏览器」：点了才建一个 WebGL 上下文，读完立刻释放。
 */
(function () {
  "use strict";
  var doc = document;
  function $(sel, root) { return (root || doc).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); }
  function announce(msg) { if (window.StarShell && window.StarShell.announce) window.StarShell.announce(msg); }
  var mqReduce = null;
  try { mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)"); } catch (e) { mqReduce = null; }
  function reduced() { return !!(mqReduce && mqReduce.matches); }
  function composing(e) { return !!(e.isComposing || e.keyCode === 229); }
  var canAnimate = typeof Element !== "undefined" && typeof Element.prototype.animate === "function";
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fix(n, d) { return Number(n).toFixed(d == null ? 1 : d); }
  function badge(text, tone) { return '<span class="me-badge me-' + tone + '">' + esc(text) + "</span>"; }

  /* 单选组：点哪项选哪项（roving tabindex）；方向键由 star.js 移动焦点并 click */
  function select(group, b) {
    $$('[role="radio"]', group).forEach(function (r) {
      var on = r === b;
      r.setAttribute("aria-checked", on ? "true" : "false");
      r.setAttribute("tabindex", on ? "0" : "-1");
    });
  }
  function radios(group, onPick) {
    if (!group) return;
    group.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest('[role="radio"]') : null;
      if (!b || !group.contains(b) || b.disabled) return;
      select(group, b);
      onPick(b);
    });
  }
  function groupOf(el) { return el ? el.closest('[role="radiogroup"]') : null; }
  function toggle(btn) {
    var on = btn.getAttribute("aria-pressed") !== "true";
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    return on;
  }
  /* 尺寸变了重排（ResizeObserver 不在就退回 resize） */
  function onResize(el, fn) {
    if (typeof ResizeObserver === "function") { new ResizeObserver(function () { fn(); }).observe(el); }
    else window.addEventListener("resize", fn);
  }
  /* 看不看得见：滚出视口的持续演示要停 */
  function onView(el, fn) {
    if (typeof IntersectionObserver !== "function") { fn(true); return; }
    new IntersectionObserver(function (ents) { ents.forEach(function (en) { fn(en.isIntersecting); }); }, { rootMargin: "80px 0px" }).observe(el);
  }

  /* ================================================================ 1 端正 */
  (function () {
    var box = $("[data-up]");
    if (!box) return;
    var cards = $$(".me-up-card", box);
    var n = cards.length;
    var sel = 3;
    var mode = "flow";
    var read = $("[data-up-read]");
    var TILT = 16;
    function layout() {
      var W = box.clientWidth;
      var H = box.clientHeight;
      var cw = cards[0].offsetWidth;
      cards.forEach(function (c, i) {
        var d = i - sel;
        var t, dim = 0, z;
        if (mode === "flow") {
          if (d === 0) { t = "translate3d(0px, 0px, " + fix(H * 0.26, 1) + "px)"; z = 20; }
          else {
            var s = d > 0 ? 1 : -1;
            var a = Math.abs(d);
            /* 两侧等距重叠：第一张让出半张多，往外每张再挪一截，越远越暗（到 .55 黑＝亮度 .45） */
            var x = s * (cw * 0.84 + (a - 1) * Math.min(cw * 0.34, W * 0.075));
            t = "translate3d(" + fix(x, 1) + "px, 0px, " + fix(-H * 0.7, 1) + "px) rotateY(" + (-s * 60) + "deg)";
            dim = Math.min(0.55, a * 0.2);
            z = 20 - a;
          }
        } else {
          /* 球形（示意）：卡排在一圈倾着的球带上，正对你的那张也带着球面的倾角 */
          var th = 360 / n;
          var R = Math.min(W * 0.34, cw * 1.35);
          var ang = d * th;
          var cos = Math.cos(ang * Math.PI / 180);
          t = "translateZ(" + fix(-R, 1) + "px) rotateX(" + TILT + "deg) rotateY(" + fix(ang, 2) + "deg) translateZ(" + fix(R, 1) + "px)";
          dim = Math.max(0, (1 - cos) * 0.3);
          z = Math.round(cos * 10) + 10;
        }
        c.style.transform = t;
        c.style.setProperty("--dim", fix(dim, 2));
        c.style.zIndex = String(z);
      });
      read.textContent = mode === "flow"
        ? "正中第" + (sel + 1) + "张：rotateX 0°、rotateY 0°，端正。"
        : "正中第" + (sel + 1) + "张：跟着球面倾了" + TILT + "°，正对你的这张是歪的。";
    }
    function step(k) {
      var next = Math.max(0, Math.min(n - 1, sel + k));
      if (next === sel) return;
      sel = next;
      layout();
      announce("第" + (sel + 1) + "张到了中间");
    }
    radios($('[aria-label="选卡台怎么摆"]'), function (b) {
      mode = b.getAttribute("data-up-mode");
      box.setAttribute("data-v", mode);
      layout();
      announce(mode === "flow" ? "Cover Flow：正中那张端正" : "球形选卡（示意）：正中那张跟着球面倾着");
    });
    $$("[data-up-step]").forEach(function (b) {
      b.addEventListener("click", function () { step(parseInt(b.getAttribute("data-up-step"), 10)); });
    });
    box.addEventListener("keydown", function (e) {
      if (composing(e)) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
      else if (e.key === "Home") { e.preventDefault(); step(-n); }
      else if (e.key === "End") { e.preventDefault(); step(n); }
    });
    /* 点两侧那张：转到中间 */
    box.addEventListener("click", function (e) {
      var c = e.target.closest ? e.target.closest(".me-up-card") : null;
      if (!c) return;
      var i = cards.indexOf(c);
      if (i >= 0 && i !== sel) step(i - sel);
    });
    onResize(box, layout);
    layout();
  })();

  /* ================================================================ 2 转场用站点自己的语言 */
  (function () {
    var stage = $("[data-ol-stage]");
    if (!stage) return;
    var go = $("[data-ol-go]");
    var read = $("[data-ol-read]");
    var title = $("[data-ol-title]", stage);
    var line = $("[data-ol-line]", stage);
    var doorL = $(".me-ol-l", stage);
    var doorR = $(".me-ol-r", stage);
    var veil = $(".me-ol-veil", stage);
    var PAGES = [{ t: "小屋", l: "这是谁的地方，可以随便逛。" }, { t: "随笔", l: "写写随笔，按日子往下排。" }];
    var READ = {
      slab: "实心双开门：门板、把手、中缝都是新造的物件，站里别处没有它们。",
      lattice: "纸色格心门：换了纸色，还是一扇门——格心、黄铜圆钮照样是外来的。",
      veil: "洇一层纸：用的是小屋自己的水彩——纸、水痕、颜料边，没有多出一件东西。"
    };
    var kind = "veil";
    var page = 0;
    var gen = 0;
    var live = [];
    function swap() {
      page = 1 - page;
      title.textContent = PAGES[page].t;
      line.textContent = PAGES[page].l;
    }
    function clear() {
      live.forEach(function (a) { try { a.cancel(); } catch (e) { /* 已经结束 */ } });
      live = [];
    }
    function anim(el, frames, opt) { var a = el.animate(frames, opt); live.push(a); return a.finished; }
    function done(my) {
      return function () {
        if (my !== gen) return;     /* 换了一代（中途又点了）：旧的收尾作废 */
        clear();
        announce("已换到：" + PAGES[page].t);
      };
    }
    radios($('[aria-label="换页转场"]'), function (b) {
      kind = b.getAttribute("data-ol");
      stage.setAttribute("data-v", kind);
      read.textContent = READ[kind];
      announce(READ[kind]);
    });
    go.addEventListener("click", function () {
      gen++;
      var my = gen;
      clear();
      if (reduced() || !canAnimate) { swap(); announce("已换到：" + PAGES[page].t); return; }
      var fin = done(my);
      if (kind === "veil") {
        var W = stage.clientWidth;
        var H = stage.clientHeight;
        var s = Math.sqrt(W * W + H * H) / (veil.offsetWidth * 0.66) * 1.08;
        anim(veil, [{ opacity: 1, transform: "scale(.05)" }, { opacity: 1, transform: "scale(" + fix(s, 2) + ")" }],
          { duration: 560, easing: "cubic-bezier(.2,.7,.2,1)", fill: "forwards" })
          .then(function () {
            if (my !== gen) return null;
            swap();
            return anim(veil, [{ opacity: 1, transform: "scale(" + fix(s, 2) + ")" }, { opacity: 0, transform: "scale(" + fix(s, 2) + ")" }],
              { duration: 620, easing: "ease-out", fill: "forwards" });
          })
          .then(fin, fin);
      } else {
        /* 合门 0.45s 藏住换页，开门 0.75s 透视外摆（照第一版的数） */
        var close = { duration: 450, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" };
        var open = { duration: 750, easing: "cubic-bezier(.3,.1,.3,1)", fill: "forwards" };
        Promise.all([
          anim(doorL, [{ opacity: 1, transform: "translateX(-100%)" }, { opacity: 1, transform: "translateX(0)" }], close),
          anim(doorR, [{ opacity: 1, transform: "translateX(100%)" }, { opacity: 1, transform: "translateX(0)" }], close)
        ]).then(function () {
          if (my !== gen) return null;
          swap();
          return Promise.all([
            anim(doorL, [{ opacity: 1, transform: "perspective(600px) rotateY(0deg)" }, { opacity: 0, transform: "perspective(600px) rotateY(-96deg)" }], open),
            anim(doorR, [{ opacity: 1, transform: "perspective(600px) rotateY(0deg)" }, { opacity: 0, transform: "perspective(600px) rotateY(96deg)" }], open)
          ]);
        }).then(fin, fin);
      }
    });
  })();

  /* ================================================================ 3 他画的就是风格 */
  (function () {
    var box = $("[data-ds-box]");
    if (!box) return;
    var read = $("[data-ds-read]");
    radios($('[aria-label="这三张图怎么对待"]'), function (b) {
      var v = b.getAttribute("data-ds");
      box.setAttribute("data-v", v);
      read.textContent = v === "keep"
        ? "原样：三张都是屋主画的，少色、几笔线——这就是小屋的手作气质。"
        : "当成占位（示意）：评审单上多了三条「待换图」，下一个人照单换掉，屋主那只手就从站上没了。";
      announce(read.textContent);
    });
  })();

  /* ================================================================ 4 名片为主 */
  (function () {
    var box = $("[data-cf]");
    if (!box) return;
    var read = $("[data-cf-read]");
    var chips = $$("[data-cf-add]");
    function paint(speak) {
      var n = 0;
      chips.forEach(function (c) {
        var on = c.getAttribute("aria-pressed") === "true";
        var part = $('[data-cf-part="' + c.getAttribute("data-cf-add") + '"]', box);
        if (part) part.hidden = !on;
        if (on) n++;
      });
      read.textContent = n === 0 ? "名片：只交付一件事。" : "多了" + n + "件：按「明确不存在的元素」清单，这" + n + "件都要删。";
      if (speak) announce(read.textContent);
    }
    chips.forEach(function (c) { c.addEventListener("click", function () { toggle(c); paint(true); }); });
    paint(false);
  })();

  /* ================================================================ 5 借结构不借视觉 */
  (function () {
    var box = $("[data-bs-box]");
    if (!box) return;
    var read = $("[data-bs-read]");
    var chips = $$("[data-bs-hl]");
    var v = "paper";
    function paintRead() {
      read.textContent = v === "paper"
        ? "借结构：纸底、橄榄墨；身份色只落在序号、主操作这类小面积上。"
        : "连视觉一起借（示意）：大黑底、戏剧化渐变、发光的「产品照」——和暖纸是两套语言。";
    }
    radios($('[aria-label="借什么"]'), function (b) {
      v = b.getAttribute("data-bs");
      box.setAttribute("data-v", v);
      paintRead();
      announce(read.textContent);
    });
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        var on = toggle(c);
        var list = chips.filter(function (x) { return x.getAttribute("aria-pressed") === "true"; })
          .map(function (x) { return x.getAttribute("data-bs-hl"); });
        box.setAttribute("data-hl", list.join(" "));
        announce(c.textContent + (on ? "：已标出" : "：取消标出"));
      });
    });
    paintRead();
  })();

  /* ================================================================ 6 小屋六条（tablist） */
  (function () {
    var tabs = $$("[data-six]");
    if (!tabs.length) return;
    var list = $("[data-six-tabs]");
    var panel = $("[data-six-panel]");
    var scene = $("[data-six-scene]");
    var text = $("[data-six-text]");
    var bad = $("[data-six-bad]");
    var more = $("[data-six-more]");
    var night = $("[data-six-night]");
    var extra = $("[data-six-extra]");
    var read = $("[data-six-read]");
    var P = {
      1: { n: "名片优先", t: "门厅只交付一件事：「这是谁的地方，可以随便逛」。不放任何列表、预览、统计、引导按钮。", b: "加了随笔预览和「开始探索」引导按钮。" },
      2: { n: "少即是真", t: "每个元素要么承载内容，要么承载导航。唯一的例外是四处绿植装饰（右下角那株）：不占布局、不接事件、不带动画。", b: "加了什么都不承载的角标和装饰串。" },
      3: { n: "手作气质，工程克制", t: "楷 / 行楷 / 宋只出现在少数标题与数字上，正文一律黑体；饱和色严格限量、限位置。", b: "正文也用楷书，句子刷成饱和的红，色块换成亮渐变。" },
      4: { n: "零固定高度", t: "内容多就往下长，内容少就居中留白。点「多写两行」看卡片往下长；再看反例。", b: "卡片写死了高度，多出来的字被裁掉。" },
      5: { n: "不阻塞", t: "开场动画、自托管字体、装饰SVG，三者都不能挡住内容首屏，也不能延迟数据获取。", b: "等字体、等开场动画，首屏先白着。" },
      6: { n: "两个时辰，一间屋子", t: "夜里不是反相，是同一间屋子的夜里：底沉进冷夜，字和灯仍是暖的。切换入口是顶栏的墙壁开关。", b: "" }
    };
    var cur = 1;
    function paintRead() {
      var isBad = scene.classList.contains("is-bad") || scene.classList.contains("is-invert");
      read.textContent = P[cur].n + "：" + (isBad ? "反例（示意）——" + (cur === 6 ? "整块反相，暖纸成了冷灰、橄榄成了紫。" : P[cur].b) : "现行。");
    }
    function setTab(k, focus) {
      cur = k;
      tabs.forEach(function (t) {
        var on = parseInt(t.getAttribute("data-six"), 10) === k;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.setAttribute("tabindex", on ? "0" : "-1");
        if (on) { panel.setAttribute("aria-labelledby", t.id); if (focus) t.focus(); }
      });
      text.textContent = P[k].t;
      scene.setAttribute("data-p", String(k));
      scene.classList.remove("is-bad", "is-invert");
      scene.setAttribute("data-mode", "light");
      bad.setAttribute("aria-pressed", "false");
      bad.hidden = k === 6;
      more.hidden = k !== 4;
      more.setAttribute("aria-pressed", "false");
      extra.hidden = true;
      night.hidden = k !== 6;
      select(night, $('[data-six-mode="day"]', night));
      paintRead();
    }
    list.addEventListener("click", function (e) {
      var t = e.target.closest ? e.target.closest('[role="tab"]') : null;
      if (!t) return;
      setTab(parseInt(t.getAttribute("data-six"), 10), false);
      announce(P[cur].n);
    });
    list.addEventListener("keydown", function (e) {
      if (composing(e)) return;
      var k = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") k = cur % 6 + 1;
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") k = (cur + 4) % 6 + 1;
      else if (e.key === "Home") k = 1;
      else if (e.key === "End") k = 6;
      if (k == null) return;
      e.preventDefault();
      setTab(k, true);
      announce(P[cur].n);
    });
    bad.addEventListener("click", function () {
      var on = toggle(bad);
      scene.classList.toggle("is-bad", on);
      if (cur === 4 && on) { extra.hidden = false; more.setAttribute("aria-pressed", "true"); }
      paintRead();
      announce(read.textContent);
    });
    more.addEventListener("click", function () {
      var on = toggle(more);
      extra.hidden = !on;
      announce(on ? "多写了两行" : "收回那两行");
    });
    radios(night, function (b) {
      var m = b.getAttribute("data-six-mode");
      scene.setAttribute("data-mode", m === "night" ? "dark" : "light");
      scene.classList.toggle("is-invert", m === "invert");
      paintRead();
      announce(m === "night" ? "夜里：冷夜暖灯" : m === "invert" ? "反相（示意）" : "白天");
    });
    setTab(1, false);
  })();

  /* ================================================================ 7 降级的终点：逐像素比 */
  (function () {
    var box = $("[data-de-box]");
    if (!box) return;
    var ca = $("[data-de-a]", box), cb = $("[data-de-b]", box), cd = $("[data-de-d]", box);
    var read = $("[data-de-read]");
    var W = ca.width, H = ca.height;
    /* 画面颜色是小屋白天的字面量：两边用同一个函数画，差异只可能来自「降级写法」 */
    function page(ctx, dy) {
      ctx.fillStyle = "#F8F6F1"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#F2EDE2"; ctx.fillRect(150, 0, 90, 34);
      ctx.fillStyle = "#E4E0D6"; ctx.fillRect(0, 14, W, 1);
      ctx.fillStyle = "#FDFCF9"; ctx.fillRect(30, 32 + dy, 180, 92);
      ctx.fillStyle = "#5E6144"; ctx.fillRect(30, 32 + dy, 82, 92);
      ctx.fillStyle = "#F6F4EE"; ctx.fillRect(50, 62 + dy, 42, 30);
      ctx.fillStyle = "#E1E0CE"; ctx.fillRect(124, 54 + dy, 72, 8); ctx.fillRect(124, 70 + dy, 52, 8); ctx.fillRect(124, 98 + dy, 36, 8);
    }
    function leaf(ctx, x, y, r, rot) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
      ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.45, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    function run(v, speak) {
      var a = ca.getContext("2d"), b = cb.getContext("2d"), d = cd.getContext("2d");
      page(a, 0);
      if (v === "slot") {
        /* 增强层的容器在降级档也留着：卡片被往下推了 6px */
        page(b, 6);
      } else {
        page(b, 0);
        if (v === "ghost") {
          /* 降成静态还画着：几片半透明的叶子留在页面上 */
          b.globalAlpha = 0.35; b.fillStyle = "#8B8C6D";
          leaf(b, 204, 22, 9, 0.6); leaf(b, 222, 40, 7, -0.4); leaf(b, 18, 132, 8, 0.9);
          b.globalAlpha = 1;
        }
      }
      var A = a.getImageData(0, 0, W, H).data;
      var B = b.getImageData(0, 0, W, H).data;
      var out = d.createImageData(W, H);
      var o = out.data;
      var diff = 0;
      for (var i = 0; i < A.length; i += 4) {
        if (A[i] !== B[i] || A[i + 1] !== B[i + 1] || A[i + 2] !== B[i + 2] || A[i + 3] !== B[i + 3]) {
          diff++; o[i] = 255; o[i + 1] = 59; o[i + 2] = 48; o[i + 3] = 255;
        } else {
          /* 相同的像素淡成底，只留个影子 */
          o[i] = 255 - (255 - A[i]) * 0.18; o[i + 1] = 255 - (255 - A[i + 1]) * 0.18; o[i + 2] = 255 - (255 - A[i + 2]) * 0.18; o[i + 3] = 255;
        }
      }
      d.putImageData(out, 0, 0);
      box.setAttribute("data-diff", String(diff));
      read.textContent = diff === 0
        ? "差异像素0：降级的终点就是今天那一页。"
        : "差异像素" + diff.toLocaleString("en-US") + "（共" + (W * H).toLocaleString("en-US") + "）：降级档的页面不等于今天那一页，不合格。";
      if (speak) announce(read.textContent);
    }
    radios($('[aria-label="降级怎么写"]'), function (b) { run(b.getAttribute("data-de"), true); });
    run("none", false);
  })();

  /* ================================================================ 8 忘掉的往事 */
  (function () {
    var box = $("[data-fs-box]");
    if (!box) return;
    var listEl = $("[data-fs-list]", box);
    var sum = $("[data-fs-sum]", box);
    var past = $("[data-fs-past]", box);
    var read = $("[data-fs-read]");
    var LIFE = [["周一", "修好自行车"], ["周三", "给家里打电话"], ["周六", "整理书架"], ["周日", "写一篇随笔"]];
    var WORK = [["周二", "交季度报表"], ["周四", "评审会纪要"], ["周五", "更新柜面手册"]];
    var mode = "own";
    function li(day, txt, work) {
      return '<li class="' + (work ? "is-work" : "") + '"><i aria-hidden="true"></i><span>' + esc(txt) + "</span><small>" + esc(day) + (work ? " · 工作" : "") + "</small></li>";
    }
    function paint(speak) {
      var locked = past.getAttribute("aria-pressed") === "true";
      var html = "";
      LIFE.forEach(function (x) { html += li(x[0], x[1], false); });
      if (mode === "merge") {
        if (!locked) WORK.forEach(function (x) { html += li(x[0], x[1], true); });
        else html += '<li class="is-trace"><i aria-hidden="true"></i><span>工作库已上锁，3件看不了</span><small>示意：这也是痕迹</small></li>';
      }
      listEl.innerHTML = html;
      if (mode === "merge" && !locked) sum.textContent = "本周完成：工作" + WORK.length + " · 生活" + LIFE.length;
      else sum.textContent = "本周完成" + LIFE.length + "件";
      if (mode === "own") read.textContent = "只看当前库：往事怎么变，回顾页都一样，也没有另一个库存在过的痕迹。";
      else if (locked) read.textContent = "被否的设计：因为三个月前设过口令，这次回顾里没有工作，还多了一行「看不了」——你想得起为什么吗？";
      else read.textContent = "被否的设计：因为工作库从没设过口令，回顾里混进了工作。哪天设了口令，它们就悄悄消失。";
      box.setAttribute("data-v", mode);
      if (speak) announce(read.textContent);
    }
    radios($('[aria-label="回顾页怎么设计"]'), function (b) { mode = b.getAttribute("data-fs"); paint(true); });
    past.addEventListener("click", function () { toggle(past); paint(true); });
    paint(false);
  })();

  /* ================================================================ 9 三台设备 */
  (function () {
    var box = $("[data-dv]");
    if (!box) return;
    var stage = $("[data-dv-stage]", box);
    var facts = $("[data-dv-facts]", box);
    var DEV = {
      laptop: { name: "笔记本", w: 2552, h: 1274, dpr: 1.5, gpu: "RTX 4060 Laptop", scale: "1.45（封顶；1440×1.45＝2088起就封顶）", d3: "严格探测直接通过，走完整档", use: "只有这档看得出1.45封顶后的样子；比Mac紧18%是封顶的代价，不许写成「一致」。带工具栏的真实高度测2552×1180。" },
      desk: { name: "台式", w: 2040, h: 1019, dpr: 1.25, gpu: "Microsoft Basic Render Driver（WARP软件渲染，没显卡）", scale: "1.417（2040÷1440，未封顶）", d3: "严格探测拿不到，宽松拿得到", use: "带软件渲染旗标测，量长帧；磨砂在这台是瓶颈。物理2560宽×缩放125%。带工具栏的真实高度测2040×930。" },
      mac: { name: "Mac（开发机）", w: 1440, h: 900, dpr: null, gpu: "—", scale: "1（基准）", d3: "—", use: "等比基准：1440及以下一个数都不许变。" },
      phone: { name: "手机", w: 417, h: 750, h2: 903, dpr: 3.5, gpu: "Adreno 750", scale: "1", d3: "严格探测通过", use: "判装不装得下用750（地址栏露着，最坏）；判会不会显得空用903（地址栏收起）。390也要跑，但别拿它代替417。" }
    };
    var unit = "css";
    var bar = 750;
    var pick = "desk";
    function size(k) {
      var d = DEV[k];
      var h = k === "phone" ? bar : d.h;
      if (unit === "phys") return d.dpr ? { w: Math.round(d.w * d.dpr), h: Math.round(h * d.dpr) } : null;
      return { w: d.w, h: h };
    }
    function paint() {
      var keys = ["laptop", "desk", "mac", "phone"];
      var maxW = 0, maxH = 0;
      keys.forEach(function (k) { var s = size(k); if (s) { maxW = Math.max(maxW, s.w); maxH = Math.max(maxH, s.h); } });
      stage.style.setProperty("--ar", maxW + " / " + maxH);
      keys.forEach(function (k) {
        var f = $('[data-dv-frame="' + k + '"]', stage);
        var s = size(k);
        f.hidden = !s;
        if (s) { f.style.setProperty("--w", fix(s.w / maxW * 100, 3) + "%"); f.style.setProperty("--h", fix(s.h / maxH * 100, 3) + "%"); }
        f.classList.toggle("is-on", k === pick);
        f.classList.toggle("is-tall", k === "phone" && bar === 903);
      });
      /* Mac 没记 DPR：物理像素模式下这一台不画、也不能选 */
      var macBtn = $('[data-dv-pick="mac"]', box);
      macBtn.disabled = unit === "phys";
      if (unit === "phys" && pick === "mac") { pick = "desk"; select(groupOf(macBtn), $('[data-dv-pick="desk"]', box)); return paint(); }
      var d = DEV[pick];
      var s = size(pick);
      var vh = pick === "phone" ? bar : d.h;
      var rows = [
        ["设备", d.name],
        ["视口", d.w + "×" + vh + " CSS像素"],
        ["DPR", d.dpr ? String(d.dpr) : "没记"],
        ["物理像素", d.dpr ? Math.round(d.w * d.dpr) + "×" + Math.round(vh * d.dpr) : "—"],
        ["--scale", d.scale],
        ["渲染器", d.gpu],
        ["3D", d.d3],
        ["验收", d.use]
      ];
      facts.innerHTML = rows.map(function (r) { return "<dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd>"; }).join("");
      box.setAttribute("data-pick", pick);
      return s;
    }
    radios($('[aria-label="按什么像素画"]', box.parentNode), function (b) { unit = b.getAttribute("data-dv-unit"); paint(); announce(unit === "css" ? "按CSS像素画" : "按物理像素画：Mac没记DPR，不画"); });
    radios($('[aria-label="手机地址栏"]', box.parentNode), function (b) { bar = parseInt(b.getAttribute("data-dv-bar"), 10); paint(); announce("手机视口高" + bar); });
    radios($('[aria-label="选一台设备"]', box), function (b) { pick = b.getAttribute("data-dv-pick"); paint(); announce(DEV[pick].name + "：" + DEV[pick].w + "×" + (pick === "phone" ? bar : DEV[pick].h)); });
    paint();
  })();

  /* ================================================================ 10 验收档位 */
  (function () {
    var listEl = $("[data-tr-list]");
    if (!listEl) return;
    var note = $("[data-tr-note]");
    var CHECK = { ovf: "横向溢出", bp: "版面档", con: "对比度", fps: "卡不卡", fit: "装不装得下", cap: "等比与封顶" };
    var TIERS = [
      { n: "1440×900@1浅", s: "Mac · 等比基准", c: ["ovf", "bp", "con", "cap"], t: "等比基准：1440及以下数值一个都不许变；对比度按最不利角两法验收（色彩页「对比度两法」）。" },
      { n: "1440×900@1深", s: "同一档的深色", c: ["con"], t: "深色的最不利角和浅色不是同一角（深色取光晕最亮那角），要单独算。" },
      { n: "1100", s: "侧栏还在的窄桌面", c: ["ovf", "bp"], t: "侧栏还在、内容区最窄的桌面档。" },
      { n: "768", s: "顶栏档", c: ["ovf", "bp"], t: "900以下侧栏收成顶栏，600以上还没换底部tab bar。" },
      { n: "390@3", s: "窄手机", c: ["ovf", "bp"], t: "更窄，但会掩盖「417才刚好放不下」那一类，所以417也要跑。" },
      { n: "417×750@3.5触摸", s: "屋主手机 · 地址栏露着", c: ["ovf", "bp", "fit"], t: "屋主手机。750是地址栏露着的最坏高度：判装不装得下、会不会挤破用它。触屏点一下会粘上:hover，悬停效果只写在(hover: hover)里。" },
      { n: "417×903@3.5", s: "地址栏收起", c: ["fit"], t: "同一台手机地址栏收起后：判「会不会显得空」用它。" },
      { n: "2040×1019@1.25软件渲染", s: "屋主台式 · 没显卡", c: ["fps", "cap", "ovf"], t: "带--disable-gpu --use-gl=swiftshader --enable-unsafe-swiftshader；磨砂在这台是瓶颈，量整页rAF的长帧个数。--scale 1.417，还没封顶。" },
      { n: "2040×930", s: "台式 · 带浏览器工具栏", c: ["fit"], t: "浏览器工具栏、任务栏、远程桌面都在吃高度：断言scrollHeight === clientHeight，「刚好装下」不合格。" },
      { n: "2552×1274@1.5", s: "屋主笔记本", c: ["cap", "ovf"], t: "1.45封顶只在这档显形：比Mac紧18%是封顶的主动代价，不许写成「一致」。" },
      { n: "2552×1180", s: "笔记本 · 带工具栏", c: ["fit"], t: "同上，真实可用高度。" },
      { n: "⌘+ 150%", s: "浏览器缩放", c: ["ovf", "bp"], t: "缩放等价视口变窄：不许出横向滚动条，不许固定像素布局把内容挤出去。" }
    ];
    var chips = $$("[data-tr-check]");
    var cur = -1;
    var check = "";
    listEl.innerHTML = TIERS.map(function (t, i) {
      return '<li data-i="' + i + '"><button type="button" aria-pressed="false" data-tr-row="' + i + '"><span class="me-tr-name"><b>' + esc(t.n) + "</b><small>" + esc(t.s) + '</small></span><span class="me-tr-tags">' +
        t.c.map(function (k) { return '<span data-k="' + k + '">' + esc(CHECK[k]) + "</span>"; }).join("") + "</span></button></li>";
    }).join("");
    function paint() {
      $$("li", listEl).forEach(function (li, i) {
        var t = TIERS[i];
        var btn = $("button", li);
        btn.setAttribute("aria-pressed", i === cur ? "true" : "false");
        li.classList.toggle("is-dim", !!check && t.c.indexOf(check) < 0);
        $$("[data-k]", li).forEach(function (s) { s.classList.toggle("is-hit", !!check && s.getAttribute("data-k") === check); });
      });
      chips.forEach(function (c) { c.setAttribute("aria-pressed", c.getAttribute("data-tr-check") === check ? "true" : "false"); });
      if (cur >= 0) note.textContent = TIERS[cur].n + "：" + TIERS[cur].t;
      else if (check) {
        var hits = TIERS.filter(function (t) { return t.c.indexOf(check) >= 0; }).map(function (t) { return t.n; });
        note.textContent = "「" + CHECK[check] + "」由这" + hits.length + "档管：" + hits.join("、") + "。";
      } else note.textContent = "点一档看说明。";
    }
    listEl.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("[data-tr-row]") : null;
      if (!b) return;
      var i = parseInt(b.getAttribute("data-tr-row"), 10);
      cur = cur === i ? -1 : i;
      paint();
      announce(note.textContent);
    });
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        var k = c.getAttribute("data-tr-check");
        check = check === k ? "" : k;
        cur = -1;
        paint();
        announce(note.textContent);
      });
    });
    paint();
  })();

  /* ================================================================ 11 先量后截图 */
  (function () {
    var box = $("[data-mf-box]");
    if (!box) return;
    var vp = $("[data-mf-vp]", box);
    var row = $("[data-mf-row]", box);
    var dock = $("[data-mf-dock]", box);
    var tag = $("[data-mf-tag]", box);
    var probe = $("[data-mf-probe]");
    var read = $("[data-mf-read]");
    var k = 0.3;
    function fit() { k = box.clientWidth / 2040; vp.style.setProperty("--k", fix(k, 5)); }
    function measure(speak) {
      var on = probe.getAttribute("aria-pressed") === "true";
      vp.classList.toggle("is-probe", on);
      tag.hidden = !on;
      if (!on) { read.textContent = "截图缩到这么小，两版看起来一样。"; if (speak) announce(read.textContent); return; }
      /* 量缩放后的框，再除以缩放比，换回 2040 视口里的 CSS 像素 */
      var r = row.getBoundingClientRect();
      var d = dock.getBoundingClientRect();
      var left = (d.left - r.left) / k;
      var right = (r.right - d.right) / k;
      var onShot = (r.right - d.right);
      tag.textContent = "右缘差" + fix(right, 1) + "px";
      box.setAttribute("data-gap", fix(right, 1));
      read.textContent = "探针：停靠栏左缘离行" + fix(left, 1) + "px、右缘差" + fix(right, 1) + "px" +
        (right > 0.5 ? "（这张缩略图上只有" + fix(onShot, 1) + "个像素，看不出来）。" : "：真贴着行的右缘。");
      if (speak) announce(read.textContent);
    }
    radios($('[aria-label="版式"]', box.parentNode), function (b) { vp.setAttribute("data-v", b.getAttribute("data-mf")); measure(true); });
    probe.addEventListener("click", function () { toggle(probe); measure(true); });
    onResize(box, function () { fit(); measure(false); });
    fit();
  })();

  /* ================================================================ 12 设视口不设窗口（模拟） */
  (function () {
    var box = $("[data-vw-box]");
    if (!box) return;
    var shot = $(".me-vw-shot", box);
    var pageEl = $("[data-vw-page]", box);
    var out = $("[data-vw-out]", box);
    var assertBtn = $("[data-vw-assert]");
    var C = {
      window: { pw: 500, dpr: 1, png: "390×844", reads: 500, why: "设的是窗口：macOS最小宽度把它夹到500，不报错。" },
      override: { pw: 390, dpr: 3, png: "1170×2532", reads: 390, why: "设的是视口：渲染层覆盖，不受窗口限制，DPR也对。" },
      blank: { pw: 390, dpr: 3, png: "1170×2532", reads: 980, why: "页面其实排对了，可断言在还没navigate的about:blank上读，读到980。读之前先navigate。" },
      meta: { pw: 980, dpr: 3, png: "1170×2532", reads: 980, why: "mobile:true又没有viewport meta：Chrome给980的默认布局视口，手机版面整个没出现。" }
    };
    var cur = "window";
    function paint(speak) {
      var c = C[cur];
      var on = assertBtn.getAttribute("aria-pressed") === "true";
      var phone = c.pw <= 430;
      pageEl.style.setProperty("--pw", c.pw + "px");
      pageEl.style.setProperty("--k", fix(shot.clientWidth / c.pw, 5));
      pageEl.setAttribute("data-layout", phone ? "phone" : "desk");
      var ok = c.reads === 390;
      var verdict;
      if (!on) verdict = badge("没报错", "gray") + " 截图照样出" + (c.pw !== 390 ? "，可版面是按" + c.pw + "排的" : "");
      else if (ok) verdict = badge("通过", "green") + " innerWidth 390、DPR " + c.dpr;
      else verdict = badge("抛错", "red") + " 读到" + c.reads + " ≠ 390" + (cur === "blank" ? "（这次是冤枉：顺序错了）" : "");
      var rows = [
        ["截图PNG", c.png],
        ["页面里的innerWidth", String(c.pw)],
        ["断言读到", on ? String(c.reads) : "（没读）"],
        ["(max-width:430px)", phone ? "true · 手机版面" : "false · 桌面版面"],
        ["对账断言", verdict]
      ];
      out.innerHTML = rows.map(function (r, i) { return "<dt>" + esc(r[0]) + "</dt><dd>" + (i === 4 ? r[1] : esc(r[1])) + "</dd>"; }).join("") +
        '<dd class="is-full">' + esc(c.why) + "</dd>";
      box.setAttribute("data-case", cur);
      box.setAttribute("data-verdict", !on ? "silent" : ok ? "pass" : "throw");
      if (speak) announce(c.why + (on ? (ok ? "断言通过。" : "断言抛错。") : "断言关着，没报错。"));
    }
    radios($('[aria-label="怎么设手机档"]'), function (b) { cur = b.getAttribute("data-vw"); paint(true); });
    assertBtn.addEventListener("click", function () {
      var on = toggle(assertBtn);
      assertBtn.textContent = on ? "对账断言：开" : "对账断言：关";
      paint(true);
    });
    onResize(shot, function () { paint(false); });
    paint(false);
  })();

  /* ================================================================ 13 溢出跟目标宽度比 */
  (function () {
    var box = $("[data-ov-box]");
    if (!box) return;
    var phone = $(".me-ov-phone", box);
    var pageEl = $("[data-ov-page]", box);
    var block = $("[data-ov-block]", box);
    var out = $("[data-ov-out]", box);
    var add = $("[data-ov-add]");
    var TARGET = 417;
    var how = "hard";
    function paint(speak) {
      var on = add.getAttribute("aria-pressed") === "true";
      block.hidden = !on;
      block.classList.toggle("is-soft", how === "soft");
      pageEl.style.width = TARGET + "px";
      /* 量注入块在页面坐标里的真实右缘（页面没缩放前的 CSS 像素） */
      var right = on ? block.offsetLeft + block.offsetWidth : 0;
      /* 手机模拟：内容撑破时 Chrome 把 innerWidth 本身撑宽到内容那么宽，scrollWidth 跟着一样大 */
      var iw = Math.max(TARGET, right);
      var sw = iw;
      pageEl.style.width = iw + "px";
      pageEl.style.setProperty("--k", fix(phone.clientWidth / iw, 5));
      phone.classList.toggle("is-wide", iw > TARGET);
      phone.style.setProperty("--edge", fix(TARGET / iw * 100, 3) + "%");
      var oldOk = sw === iw;
      var newOk = Math.max(sw, iw) === TARGET;
      var elOk = right <= TARGET;
      var rows = [
        ["旧：scrollWidth === innerWidth", sw + " === " + iw, oldOk ? (iw > TARGET ? ["绿（假的）", "warn"] : ["绿", "green"]) : ["红", "red"]],
        ["新：max(scrollWidth, innerWidth) === 417", Math.max(sw, iw) + (newOk ? " === " : " ≠ ") + TARGET, newOk ? ["绿", "green"] : ["红", "red"]],
        ["逐元素：右缘 ≤ 417", on ? "注入块右缘" + right : "没有越界的元素", elOk ? ["绿", "green"] : ["红", "red"]]
      ];
      if (on) rows.push(["注入物自己越界了吗", right > TARGET ? "是：这次的红才算数" : "否：被页面的max-width夹住了，这次的绿不算数", right > TARGET ? ["是", "green"] : ["没越界", "red"]]);
      out.innerHTML = rows.map(function (r) { return "<li><span>" + esc(r[0]) + "<small>" + esc(r[1]) + "</small></span>" + badge(r[2][0], r[2][1]) + "</li>"; }).join("");
      box.setAttribute("data-iw", String(iw));
      box.setAttribute("data-right", String(right));
      if (speak) {
        if (!on) announce("拿掉了撑破块：三条都绿");
        else if (right > TARGET) announce("塞了477px的块：innerWidth被撑到" + iw + "，旧判据照样绿，新判据和逐元素都红");
        else announce("注入块被夹到" + (right - 14) + "px宽，没越界：判据全绿，但这次不算数");
      }
    }
    add.addEventListener("click", function () { toggle(add); paint(true); });
    radios($('[aria-label="怎么注入"]'), function (b) { how = b.getAttribute("data-ov-how"); paint(true); });
    onResize(phone, function () { paint(false); });
    paint(false);
  })();

  /* ================================================================ 14 七条：情景题 */
  (function () {
    var q = $("[data-q]");
    if (!q) return;
    var no = $("[data-q-no]", q), text = $("[data-q-text]", q), fb = $("[data-q-fb]", q);
    var next = $("[data-q-next]", q), score = $("[data-q-score]", q);
    var opts = $$("[data-q-pick]", q);
    var S = {
      1: "判「保存成功」看的是按钮上那行字有没有变成「已保存」。后来文案改成「已存好」，测试一直红；更糟的是别处碰巧也有这三个字，它就一直绿。",
      2: "输入法回车的测试写完第一次跑就是绿的。没人试过把保护代码拿掉，看它会不会红。",
      3: "回归套件跑到一半，另一个窗口还在往仓库里写文件；跑完全绿，就交了。",
      4: "3D看门狗量帧间隔，间隔里掺着自己加的29ms限帧；阈值50ms，同一份构建三次量到47.7 / 49.7 / 59.6。",
      5: "门禁检查refreshFpsRange、screenFps这几个名字在不在。有人把screenFps直接改成「= 60」，门禁照样绿。",
      6: "汇报「进程都清干净了」，用的是查监听端口；残留的那个是个客户端，挂在已关掉的服务上42分钟。",
      7: "「软件渲染下动画帧间隔中位≤18ms」这条红了——拿去量改动前的树，同样是33.3ms。"
    };
    var WHY = {
      1: "可变的显示文案不当判据：判据要读状态本身。",
      2: "先让它红一次：拿掉保护它必须红，否则是假护栏。",
      3: "门禁跑在验证过的稳定快照上：连续两轮、每轮3秒源树无变化才放行。",
      4: "判据不掺自己加的量：阈值写成承诺帧率的倍数，量均值。",
      5: "断言零件接没接上：断言完整的赋值形状、按规则算出来的结果。",
      6: "阴性结论附阳性证据：先问量具看不看得见要否认的东西；查进程按名字。",
      7: "判据先在改前的树上跑：改前也红，它量的是环境。改成改前改后同机轮流各跑3轮比。"
    };
    var ORDER = [4, 1, 6, 2, 7, 3, 5];
    var i = 0, right = 0, answered = false;
    function show() {
      var k = ORDER[i];
      no.textContent = "第" + (i + 1) + " / " + ORDER.length + "题";
      text.textContent = S[k];
      fb.textContent = "";
      answered = false;
      opts.forEach(function (o) { o.classList.remove("is-right", "is-wrong"); o.removeAttribute("aria-disabled"); });
      next.disabled = true;
      next.textContent = i === ORDER.length - 1 ? "看成绩" : "下一题";
      q.setAttribute("data-step", String(i));
    }
    opts.forEach(function (o) {
      o.addEventListener("click", function () {
        if (answered) return;
        answered = true;
        var k = ORDER[i];
        var pick = parseInt(o.getAttribute("data-q-pick"), 10);
        var ok = pick === k;
        if (ok) right++;
        opts.forEach(function (x) {
          var p = parseInt(x.getAttribute("data-q-pick"), 10);
          if (p === k) x.classList.add("is-right");
          else if (x === o) x.classList.add("is-wrong");
          x.setAttribute("aria-disabled", "true");
        });
        fb.textContent = (ok ? "对。" : "不是这条，是「" + $('[data-q-pick="' + k + '"]', q).textContent + "」。") + WHY[k];
        score.textContent = "答对" + right + "题";
        next.disabled = false;
        announce(fb.textContent);
      });
    });
    next.addEventListener("click", function () {
      if (i < ORDER.length - 1) { i++; show(); opts[0].focus(); return; }
      if (next.getAttribute("data-done") === "1") { i = 0; right = 0; score.textContent = "答对0题"; next.removeAttribute("data-done"); show(); opts[0].focus(); return; }
      no.textContent = "做完了";
      text.textContent = "七题答对" + right + "题。这七种错都长得像成功：全绿、零错误、一片安静。";
      fb.textContent = "";
      next.textContent = "再来一遍";
      next.setAttribute("data-done", "1");
      opts.forEach(function (o) { o.setAttribute("aria-disabled", "true"); });
      answered = true;
      announce(text.textContent);
    });
    show();
  })();

  /* ================================================================ 15 先红一次：三棵树 × 两条判据 */
  (function () {
    var box = $("[data-rf-box]");
    if (!box) return;
    var input = $("[data-rf-input]", box);
    var listEl = $("[data-rf-list]", box);
    var src = $("[data-rf-src]", box);
    var tab = $("[data-rf-tab]");
    var read = $("[data-rf-read]");
    var run = $("[data-rf-run]");
    /* 三棵树的回车处理函数。源码就是下面这几行（找字判据真的读 Function.prototype.toString）。 */
    var TREES = {
      before: function (e, add) {
        if (e.key === "Enter") add();
      },
      after: function (e, add) {
        if (e.isComposing) return;
        if (e.key === "Enter") add();
      },
      unwired: function (e, add) {
        // 回车之前先判 isComposing（注释写了，代码没接上）
        if (e.key === "Enter") add();
      }
    };
    var NAME = { before: "改前", after: "改后", unwired: "改后但没接上" };
    var cur = "before";
    /* toString 带着源文件里的缩进：除第一行外按最小缩进统一去掉 */
    function dedent(s) {
      var lines = s.split("\n");
      var min = Infinity;
      lines.slice(1).forEach(function (l) { if (l.trim()) min = Math.min(min, l.match(/^ */)[0].length); });
      if (!isFinite(min)) return s;
      return [lines[0]].concat(lines.slice(1).map(function (l) { return l.slice(min); })).join("\n");
    }
    function showSrc() {
      var s = esc(dedent(TREES[cur].toString())).replace(/isComposing/g, "<mark>isComposing</mark>");
      src.innerHTML = "// " + NAME[cur] + "\nfunction onKeydown" + s.replace(/^function\s*/, "");
    }
    input.addEventListener("keydown", function (e) {
      TREES[cur](e, function () {
        var v = input.value.trim();
        e.preventDefault();
        if (!v) return;
        var li = doc.createElement("li");
        li.textContent = v;
        listEl.appendChild(li);
        while (listEl.children.length > 6) listEl.removeChild(listEl.firstChild);
        input.value = "";
        announce("记下：" + v);
      });
    });
    radios($('[aria-label="哪棵树"]'), function (b) {
      cur = b.getAttribute("data-rf");
      showSrc();
      listEl.innerHTML = "";
      announce("换到" + NAME[cur]);
    });
    /* 行为判据：真建一个输入框挂上这棵树的处理函数，真派组字中的回车与普通回车 */
    function behave(key) {
      var n = 0;
      var el = doc.createElement("input");
      el.addEventListener("keydown", function (e) { TREES[key](e, function () { n++; }); });
      el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", isComposing: true, bubbles: true, cancelable: true }));
      var afterIme = n;
      el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
      return afterIme === 0 && n === 1;
    }
    function strFind(key) { return TREES[key].toString().indexOf("isComposing") >= 0; }
    run.addEventListener("click", function () {
      var res = {};
      ["before", "after", "unwired"].forEach(function (k) {
        res["b-" + k] = behave(k);
        res["s-" + k] = strFind(k);
      });
      Object.keys(res).forEach(function (id) {
        var cell = $('[data-rf-cell="' + id + '"]', tab);
        var ok = res[id];
        var fake = id === "s-unwired" && ok;
        cell.innerHTML = ok ? badge(fake ? "绿（假的）" : "绿", fake ? "warn" : "green") : badge("红", "red");
        cell.setAttribute("data-res", ok ? "green" : "red");
      });
      tab.hidden = false;
      read.textContent = "行为判据：改前红、改后绿、没接上也红——它看得见这个错，也分得清「接没接上」。" +
        "找字判据：改前也红（先红一次过了），可没接上那棵照样绿——红一次是必要的，不是充分的。";
      announce(read.textContent);
    });
    showSrc();
  })();

  /* ================================================================ 16 别读早 */
  (function () {
    var track = $("[data-re-track]");
    if (!track) return;
    var box = $("[data-re-box]", track);
    var log = $("[data-re-log]");
    var at = 0;
    var busy = 0;
    var baseLeft = box.offsetLeft;     /* CSS 里的起点（8×--u），一次量好 */
    function travel() { return Math.max(0, track.clientWidth - box.offsetWidth - 2 * baseLeft); }
    function cx() {
      var m = getComputedStyle(box).transform;
      if (!m || m === "none") return 0;
      var mm = /matrix(3d)?\(([^)]+)\)/.exec(m);
      if (!mm) return 0;
      var p = mm[2].split(",").map(parseFloat);
      return mm[1] ? p[12] : p[4];
    }
    function add(html) {
      var li = doc.createElement("li");
      li.innerHTML = html;
      log.appendChild(li);
      while (log.children.length > 5) log.removeChild(log.firstChild);
    }
    /* 一次 FLIP 移动：布局位置（left）瞬间换到另一头，transform 先反向抵回去，下一帧清掉、交给 .6s 过渡 */
    function flipMove() {
      var t = travel();
      var from = at ? t : 0;
      at = 1 - at;
      var to = at ? t : 0;
      box.style.transition = "none";
      box.style.left = (baseLeft + to) + "px";
      box.style.transform = "translateX(" + (from - to) + "px)";
      void box.offsetWidth;          /* 强制一次布局，让「反向位移」先落地 */
      box.style.transition = "";
      box.style.transform = "";
      return { dist: Math.abs(to - from) };
    }
    $$("[data-re]").forEach(function (b) {
      b.addEventListener("click", function () {
        var how = b.getAttribute("data-re");
        var my = ++busy;
        var m = flipMove();
        var rm = reduced();
        if (how === "now") {
          requestAnimationFrame(function () {
            var x = cx();
            var early = Math.abs(x) > 0.5;
            add("立刻读（下一帧）：computed还偏<b>" + fix(x, 1) + "px</b>，终点是0 → " + (early ? badge("读早了", "red") : badge("读到终值", "green")) + (rm ? "（减弱动效关了过渡，这一档读早红不了）" : ""));
            track.setAttribute("data-last", early ? "early" : "final");
            announce(early ? "立刻读：读到半路的值，读早了" : "立刻读：已经是终值");
          });
        } else if (how === "settle") {
          var fired = false;
          var finish = function () {
            if (fired || my !== busy) return;
            fired = true;
            box.removeEventListener("transitionend", onEnd);
            var x = cx();
            add("等transitionend再读：computed偏<b>" + fix(x, 1) + "px</b> → " + (Math.abs(x) <= 0.5 ? badge("终值", "green") : badge("还在动", "red")));
            track.setAttribute("data-last", Math.abs(x) <= 0.5 ? "final" : "early");
            announce("等稳了读：终值");
          };
          var onEnd = function (e) { if (e.target === box && e.propertyName === "transform") finish(); };
          box.addEventListener("transitionend", onEnd);
          if (rm || m.dist < 1) requestAnimationFrame(finish);
          else setTimeout(finish, 900);   /* 兜底：页面在后台时 transitionend 可能不来 */
        } else {
          var styleVal = box.style.transform;
          requestAnimationFrame(function () {
            var x = cx();
            add("读el.style.transform：<code>\"" + esc(styleVal) + "\"</code>（空串）；同一刻computed偏<b>" + fix(x, 1) + "px</b> → " + (Math.abs(x) > 0.5 ? badge("拿style判「没在动」是假的", "red") : badge("这一刻刚好不动", "gray")));
            track.setAttribute("data-last", "style");
            announce("el.style.transform是空串，计算样式还在动");
          });
        }
      });
    });
    /* 宽度变了：停在右头的方块跟着挪到新的右头（不做过渡） */
    onResize(track, function () { if (at) { box.style.transition = "none"; box.style.left = (baseLeft + travel()) + "px"; void box.offsetWidth; box.style.transition = ""; } });
  })();

  /* ================================================================ 17 不掺自己加的量（随机数模拟） */
  (function () {
    var box = $("[data-oq-box]");
    if (!box) return;
    var hist = $("[data-oq-hist]", box);
    var runs = $("[data-oq-runs]", box);
    var cost = $("[data-oq-cost]");
    var costOut = $("[data-oq-cost-out]");
    var read = $("[data-oq-read]");
    var crit = "median";
    var seedBase = 0;
    var FRAME = 1000 / 60;
    var CAP = 29;
    var PROMISE = 30;            /* 这一档承诺 30 帧 */
    function rng(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
    function gauss(r) { var u1 = Math.max(1e-9, r()), u2 = r(); return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2); }
    /* 一次「一秒多」的采样：每帧真实耗时 = 机器快慢 + 抖动；限帧 29ms，rAF 只在 16.7ms 的整数倍上来 */
    function sim(c, seed) {
      var r = rng(seed), out = [];
      for (var i = 0; i < 60; i++) {
        var x = Math.max(1, c + gauss(r) * 6);
        out.push(FRAME * Math.ceil(Math.max(CAP, x) / FRAME - 1e-9));
      }
      return out;
    }
    function median(a) { var s = a.slice().sort(function (x, y) { return x - y; }); var m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }
    function mean(a) { return a.reduce(function (x, y) { return x + y; }, 0) / a.length; }
    function verdict(iv) {
      var md = median(iv), mn = mean(iv), fps = 1000 / mn;
      var down = crit === "median" ? md >= 50 - 1e-6 : fps < PROMISE * 0.6;
      return { md: md, mn: mn, fps: fps, down: down };
    }
    function drawHist(iv) {
      var B = [33.3, 50, 66.7, 83.3];
      var cnt = B.map(function (b) { return iv.filter(function (x) { return Math.abs(x - b) < 1; }).length; });
      var max = Math.max.apply(null, cnt.concat([1]));
      hist.innerHTML = B.map(function (b, i) {
        return '<div class="me-oq-bar"><small>' + cnt[i] + '</small><span><i style="--v:' + fix(cnt[i] / max, 3) + '"></i></span><small>' + fix(b, 1) + "</small></div>";
      }).join("");
    }
    cost.addEventListener("input", function () { costOut.textContent = cost.value + "ms"; });
    drawHist([]);
    radios($('[aria-label="判据"]'), function (b) { crit = b.getAttribute("data-oq"); runs.innerHTML = ""; drawHist([]); read.textContent = "换了判据，再跑三次。"; announce(b.textContent); });
    $("[data-oq-run]").addEventListener("click", function () {
      var c = parseInt(cost.value, 10);
      var res = [];
      var last = null;
      for (var k = 1; k <= 3; k++) { last = sim(c, seedBase + k); res.push(verdict(last)); }
      seedBase += 3;
      drawHist(last);
      runs.innerHTML = res.map(function (v, i) {
        return "<li>第" + (i + 1) + "次：中位" + fix(v.md, 1) + "ms · 均值" + fix(v.mn, 1) + "ms（" + fix(v.fps, 1) + "帧/秒）→ " + (v.down ? badge("降档", "red") : badge("不降", "green")) + "</li>";
      }).join("");
      var same = res.every(function (v) { return v.down === res[0].down; });
      box.setAttribute("data-consistent", same ? "yes" : "no");
      read.textContent = (same ? "三次结论一致：" + (res[0].down ? "都降档。" : "都不降。") : "三次结论不一致：同一份构建，降不降档在抛硬币。") +
        (crit === "median" ? "旧判据看的中位数只能落在33.3 / 50 / 66.7这几个台阶上。" : "新判据看这一窗口真送出去几帧，和承诺的30帧比。");
      announce(read.textContent);
    });
  })();

  /* ================================================================ 18 阴性结论附阳性证据 */
  (function () {
    var box = $("[data-ne-box]");
    if (!box) return;
    var ps = $("[data-ne-ps]", box);
    var out = $("[data-ne-out]", box);
    var read = $("[data-ne-read]");
    var runBtn = $("[data-ne-run]");
    var killBtn = $("[data-ne-kill]");
    var BASE = [
      { pid: 1, cmd: "launchd", kind: "sys" },
      { pid: 3120, cmd: "node serve.mjs --port 4175（别的窗口的服务）", kind: "other", listen: true },
      { pid: 4211, cmd: "Google Chrome Helper (Renderer) --user-data-dir=…/prof-me-a", kind: "left" },
      { pid: 4288, cmd: "node watchdog.mjs（客户端，连着已关掉的服务）", kind: "left", name: "watchdog.mjs" },
      { pid: 4302, cmd: "zsh -c node accept.mjs --prof prof-me-", kind: "self" },
      { pid: 4303, cmd: "ugrep -e prof-me- -e watchdog.mjs", kind: "self" }
    ];
    var NAMES = ["prof-me-", "watchdog.mjs"];
    var rows, how = "port", found = [], killed = false;
    function reset() { rows = BASE.map(function (r) { return { pid: r.pid, cmd: r.cmd, kind: r.kind, listen: !!r.listen, gone: false }; }); }
    function paint(marks) {
      ps.innerHTML = rows.map(function (r) {
        var cls = r.gone ? "is-gone" : (marks && marks[r.pid]) || "";
        return '<li class="' + cls + '"><b>' + r.pid + "</b><span>" + esc(r.cmd) + "</span></li>";
      }).join("");
    }
    function hit(r) { return !r.gone && NAMES.some(function (n) { return r.cmd.indexOf(n) >= 0; }); }
    radios($('[aria-label="怎么查残留"]'), function (b) { how = b.getAttribute("data-ne"); if (!killed) killBtn.disabled = true; paint(); out.textContent = "还没查。"; read.textContent = "点「查」。"; });
    runBtn.addEventListener("click", function () {
      var marks = {}, lines = [], verdict, state;
      found = [];
      if (how === "port") {
        lines.push("$ lsof -iTCP -sTCP:LISTEN");
        rows.filter(function (r) { return !r.gone && r.listen; }).forEach(function (r) { lines.push(r.pid + "  " + r.cmd); });
        lines.push("→ 我的量具没有在监听的进程");
        var leftovers = rows.filter(function (r) { return !r.gone && r.kind === "left"; }).length;
        verdict = leftovers ? "说「干净了」，其实还剩" + leftovers + "个：残留的渲染进程和客户端都不监听端口，这把尺子天生看不见它们。" : "这次真的干净——但这把尺子看不见客户端，结论照样不能用。";
        state = "blind";
      } else if (how === "name") {
        lines.push("$ ps -axo pid=,command= | ugrep -e prof-me- -e watchdog.mjs");
        rows.forEach(function (r) { if (hit(r)) { marks[r.pid] = r.kind === "self" ? "is-self" : "is-hit"; lines.push(r.pid + "  " + r.cmd); } });
        var self = rows.filter(function (r) { return hit(r) && r.kind === "self"; }).length;
        var real = rows.filter(function (r) { return hit(r) && r.kind !== "self"; }).length;
        verdict = "数出" + (self + real) + "个：其中" + self + "个是查进程的命令和外层shell自己（命令行里带着同样的名字）。清了残留以后也永远不是0。";
        state = "noisy";
      } else {
        lines.push("# 1、阳性对照：起一个命令行带prof-me-ctrl的空等进程");
        lines.push("$ node -e 'setTimeout(()=>{},20000)' prof-me-ctrl   → pid 4400");
        lines.push("  按名字查prof-me-ctrl：命中1（应为1）✓");
        lines.push("  杀掉4400再查：命中0（应为0）✓  → 这把尺子看得见东西");
        lines.push("# 2、存快照、按名字查，排掉自己和整条祖先链");
        rows.forEach(function (r) {
          if (!hit(r)) return;
          if (r.kind === "self") { marks[r.pid] = "is-self"; return; }
          marks[r.pid] = "is-hit"; found.push(r.pid); lines.push("  残留" + r.pid + "  " + r.cmd);
        });
        verdict = found.length ? "阳性对照通过，查到" + found.length + "个真残留（渲染进程、客户端）。清掉再查一遍。" : "阳性对照通过，残留0：这个「干净了」有证据。";
        state = found.length ? "found" : "clean";
        if (!killed) killBtn.disabled = !found.length;
      }
      paint(marks);
      out.textContent = lines.join("\n");
      read.textContent = verdict;
      box.setAttribute("data-state", state);
      announce(verdict);
    });
    /* 清掉查到的残留 → 再查一遍；清过之后这个按钮变成「放回示例残留」，好从头再试 */
    killBtn.addEventListener("click", function () {
      if (killed) {
        killed = false;
        reset();
        killBtn.textContent = "清掉查到的残留";
        killBtn.disabled = true;
        paint();
        out.textContent = "示例残留放回去了。";
        read.textContent = "选一种查法，点「查」。";
        box.removeAttribute("data-state");
        announce("示例残留放回去了");
        return;
      }
      rows.forEach(function (r) { if (found.indexOf(r.pid) >= 0) r.gone = true; });
      killed = true;
      runBtn.click();
      killBtn.textContent = "放回示例残留";
      killBtn.disabled = false;
    });
    reset();
    paint();
  })();

  /* ================================================================ 19 往后果轻的那边错：天平 */
  (function () {
    var box = $("[data-lc-box]");
    if (!box) return;
    var a = $("[data-lc-a]", box), b = $("[data-lc-b]", box);
    var aOut = $("[data-lc-a-out]", box), bOut = $("[data-lc-b-out]", box);
    var aLab = $("[data-lc-a-label]", box), bLab = $("[data-lc-b-label]", box);
    var barEl = $("[data-lc-bar]", box);
    var verdict = $("[data-lc-verdict]");
    var P = {
      blur: { a: "误判成full（开磨砂）：没显卡那台整页卡", b: "误判成lite（只压暗）：第一次打开少一点景深", av: 9, bv: 2,
        leanB: "没测过显卡时先按lite——本站boot.js就是这么写的，star.js空闲时测一次再改。", leanA: "没测过时先按full。" },
      guard: { a: "误判成慢机器：好机器上的3D被关，整个会话记住", b: "漏判：一个匀速偏慢、还能看的画面继续跑", av: 8, bv: 3,
        leanB: "判据的盲区放在漏判那一侧；丢弃超长卡顿的上限也不放宽。", leanA: "宁可误杀。" },
      ime: { a: "拦提交也认229：安卓键盘的「搜索」键按了没反应", b: "拦提交只认isComposing：万一有输入法只报229，那一下会提前提交", av: 8, bv: 3,
        leanB: "拦提交只认isComposing；「提前return不处理」可以两个都认（那边后果轻）。", leanA: "拦提交两个都认。" }
    };
    var cur = "blur";
    function paint(speak) {
      var p = P[cur];
      var av = parseInt(a.value, 10), bv = parseInt(b.value, 10);
      aOut.textContent = av; bOut.textContent = bv;
      aLab.textContent = p.a; bLab.textContent = p.b;
      /* 重的那头往下沉：右重 → 顺时针 */
      var tilt = Math.max(-22, Math.min(22, (bv - av) * 2.6));
      barEl.style.setProperty("--tilt", fix(tilt, 1) + "deg");
      var html;
      if (av === bv) html = "两边一样重：代价对等时这条规矩帮不上忙，按别的理由定。";
      else if (av > bv) html = "A更重 → 拿不准时往B那边错：<b>" + esc(p.leanB) + "</b>";
      else html = "B更重 → 拿不准时往A那边错：<b>" + esc(p.leanA) + "</b>（这是你拖出来的假设，不是实际的裁定）";
      verdict.innerHTML = html;
      box.setAttribute("data-lean", av === bv ? "even" : av > bv ? "b" : "a");
      if (speak) announce(verdict.textContent);
    }
    radios($('[aria-label="实例"]'), function (btn) {
      cur = btn.getAttribute("data-lc");
      a.value = P[cur].av; b.value = P[cur].bv;
      paint(true);
    });
    a.addEventListener("input", function () { paint(false); });
    b.addEventListener("input", function () { paint(false); });
    a.addEventListener("change", function () { paint(true); });
    b.addEventListener("change", function () { paint(true); });
    paint(false);
  })();

  /* ================================================================ 20 测试不出声（画的喇叭，没有任何音频） */
  (function () {
    var box = $("[data-mu-box]");
    if (!box) return;
    var log = $("[data-mu-log]", box);
    var read = $("[data-mu-read]");
    var runBtn = $("[data-mu-run]");
    var flags = { mute: $('[data-mu-flag="mute"]'), sweep: $('[data-mu-flag="sweep"]') };
    var gen = 0;
    onView(box, function (v) { box.classList.toggle("is-live", v); });
    function on(k) { return flags[k].getAttribute("aria-pressed") === "true"; }
    function setState(s) {
      box.setAttribute("data-state", s);
      read.textContent = s === "loud" ? "扬声器：在响（画的）。" : s === "muted" ? "扬声器：静音（页面照样在播）。" : "扬声器：没声音。";
    }
    Object.keys(flags).forEach(function (k) { flags[k].addEventListener("click", function () { toggle(flags[k]); }); });
    runBtn.addEventListener("click", function () {
      var my = ++gen;
      var mute = on("mute"), sweep = on("sweep");
      var steps = [
        ["启动无头Chrome" + (mute ? "（带--mute-audio）" : "（没带--mute-audio）"), ""],
        ["打开带背景音乐的页面：循环播放", "", mute ? "muted" : "loud"],
        ["断言audio.paused === false、currentTime在走 ✓（静音不影响这两个值）", "good"],
        ["chrome.kill()：只杀了主进程", ""]
      ];
      if (sweep) {
        steps.push(["按profile目录名查进程：残留1个（渲染进程）→ 清掉 → 再查0 ✓", "good", "idle"]);
      } else if (mute) {
        steps.push(["残留的渲染进程还在后台循环放——静音的，没出声，但它还活着、占着CPU", "bad", "muted"]);
      } else {
        steps.push(["残留的渲染进程还在后台循环放：屋主那边在响", "bad", "loud"]);
        steps.push(["「电脑播放音乐吵死了」", "bad", "loud"]);
      }
      log.innerHTML = "";
      setState("idle");
      runBtn.disabled = true;
      var i = 0;
      var gap = reduced() ? 0 : 420;
      (function nextStep() {
        if (my !== gen) return;
        if (i >= steps.length) {
          runBtn.disabled = false;
          box.setAttribute("data-result", sweep ? "clean" : mute ? "lingering" : "loud");
          announce(read.textContent + " " + steps[steps.length - 1][0]);
          return;
        }
        var s = steps[i++];
        var li = doc.createElement("li");
        li.textContent = s[0];
        if (s[1]) li.className = "is-" + s[1];
        log.appendChild(li);
        if (s[2]) setState(s[2]);
        if (gap) setTimeout(nextStep, gap); else nextStep();
      })();
    });
    setState("idle");
  })();

  /* ================================================================ 21 软件渲染 */
  (function () {
    var out = $("[data-sr-out]");
    if (!out) return;
    var probeBtn = $("[data-sr-probe]");
    var probeOut = $("[data-sr-probe-out]");
    var R = {
      none: { s: ["拿得到", "green"], l: ["拿得到", "green"], tier: "完整档（Mac本机无头也走真显卡：ANGLE Metal）", v: "量的是有显卡的情况，不能代表台式机。" },
      nogpu: { s: ["拿不到", "red"], l: ["拿不到", "red"], tier: "静态版：安安静静回落，零请求、控制台零输出", v: "这是对的行为（什么都不做），但量不到软件渲染下3D跑得怎样。" },
      noflag: { s: ["拿不到", "red"], l: ["拿不到", "red"], tier: "静态版", v: "Chrome 122起默认关掉了软件渲染跑WebGL；拿这次说「宽松也拿不到」不能代表Windows（那边多一档WARP）。" },
      soft: { s: ["拿不到", "red"], l: ["拿得到", "green"], tier: "soft档（岗岗实测29.1帧/秒）", v: "最接近台式机的模拟：严格拒绝、宽松拿到。Windows的WARP只能上真机测（3D诊断.html）。" },
      angle: { s: ["拿得到（被当成显卡）", "warn"], l: ["拿得到", "green"], tier: "会被当成完整档；要看渲染器名才认得出SwiftShader", v: "严格探测也通过了，别拿它测软件渲染。" }
    };
    function paint(k, speak) {
      var r = R[k];
      out.innerHTML = "<dt>严格探测</dt><dd>" + badge(r.s[0], r.s[1]) + " <code>failIfMajorPerformanceCaveat: true</code></dd>" +
        "<dt>宽松探测</dt><dd>" + badge(r.l[0], r.l[1]) + "</dd>" +
        "<dt>3D走哪档</dt><dd>" + esc(r.tier) + "</dd>" +
        "<dt>能不能下结论</dt><dd>" + esc(r.v) + "</dd>";
      out.setAttribute("data-k", k);
      if (speak) announce("严格" + r.s[0] + "，宽松" + r.l[0] + "。" + r.v);
    }
    radios($('[aria-label="旗标"]'), function (b) { paint(b.getAttribute("data-sr"), true); });
    function probe(opts) {
      var c = doc.createElement("canvas");
      var gl = null;
      try { gl = c.getContext("webgl", opts); } catch (e) { gl = null; }
      var name = "";
      if (gl) {
        try { name = String(gl.getParameter(gl.RENDERER) || ""); } catch (e) { name = ""; }
        try { var lose = gl.getExtension("WEBGL_lose_context"); if (lose) lose.loseContext(); } catch (e) { /* 释放不了就等回收 */ }
      }
      return { ok: !!gl, name: name };
    }
    probeBtn.addEventListener("click", function () {
      var s = probe({ failIfMajorPerformanceCaveat: true });
      var l = s.ok ? s : probe({ antialias: false });
      var kind = s.ok ? "这台有显卡（严格探测通过）" : l.ok ? "这台是软件渲染：严格拒绝、宽松拿到——会走soft档" : "这台拿不到WebGL：安安静静回静态版";
      probeOut.innerHTML = "严格：" + badge(s.ok ? "拿到" : "拿不到", s.ok ? "green" : "red") + " 宽松：" + badge(l.ok ? "拿到" : "拿不到", l.ok ? "green" : "red") +
        (l.name ? " 渲染器：<code>" + esc(l.name) + "</code>" : "") + "。" + esc(kind) + "。";
      probeOut.setAttribute("data-probe", s.ok ? "gpu" : l.ok ? "soft" : "none");
      announce(kind);
    });
    paint("none", false);
  })();

  /* ================================================================ 22 后台标签页暂停 rAF */
  (function () {
    var box = $("[data-rp-box]");
    if (!box) return;
    var evEl = $("[data-rp-ev]", box), rafEl = $("[data-rp-raf]", box), hidEl = $("[data-rp-hidden]", box);
    var log = $("[data-rp-log]");
    var hitBtn = $("[data-rp-hit]"), bgBtn = $("[data-rp-bg]"), shotBtn = $("[data-rp-shot]");
    var ev = 0, shown = 0, frames = 0, raf = 0, inView = false, simBg = false, started = false;
    var hiddenAt = 0, framesAt = 0;
    function now() { var d = new Date(); return [d.getHours(), d.getMinutes(), d.getSeconds()].map(function (x) { return x < 10 ? "0" + x : String(x); }).join(":"); }
    function add(t) {
      var li = doc.createElement("li");
      li.textContent = now() + "  " + t;
      log.appendChild(li);
      while (log.children.length > 5) log.removeChild(log.firstChild);
    }
    function paintHidden() { hidEl.textContent = doc.hidden ? "true" : simBg ? "true（模拟）" : "false"; }
    function tick() {
      raf = 0;
      frames++;
      if (shown !== ev) { shown = ev; rafEl.textContent = String(shown); }
      rafEl.classList.toggle("is-stale", shown !== ev);
      schedule();
    }
    /* 只在看得见、页面没隐藏、没在模拟后台时跑；别的时候一帧都不排 */
    function schedule() {
      if (raf || !started || !inView || doc.hidden || simBg) return;
      raf = requestAnimationFrame(tick);
    }
    function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }
    /* 碰过这块演示才开始跑 rAF（页面静置时这一页不排任何帧） */
    function start() { if (!started) { started = true; box.setAttribute("data-started", "1"); schedule(); } }
    [hitBtn, bgBtn, shotBtn].forEach(function (b) { b.addEventListener("click", start); });
    hitBtn.addEventListener("click", function () {
      ev++;
      evEl.textContent = String(ev);           /* 监听里同步写：后台照样更新 */
      if (simBg) rafEl.classList.add("is-stale");
      box.setAttribute("data-ev", String(ev));
    });
    bgBtn.addEventListener("click", function () {
      simBg = toggle(bgBtn);
      if (simBg) { stop(); add("模拟：标签页进后台——rAF停了，监听照样在跑"); announce("模拟进后台：rAF停了"); }
      else { add("模拟：回到前台"); schedule(); announce("模拟回到前台"); }
      paintHidden();
    });
    shotBtn.addEventListener("click", function () {
      var was = simBg;
      simBg = false;
      bgBtn.setAttribute("aria-pressed", "false");
      paintHidden();
      schedule();
      requestAnimationFrame(function () {
        add(was ? "模拟截图：标签页被顶到前台，rAF恢复，数字一下跳到" + ev + "（「截图之后就好了」）" : "模拟截图：本来就在前台，没变化");
      });
      announce(was ? "截图把标签页顶到前台，rAF恢复" : "本来就在前台");
    });
    doc.addEventListener("visibilitychange", function () {
      paintHidden();
      if (!started) return;          /* 没开始计数时记不出「期间几帧」，那句话就是没证据的阴性结论 */
      if (doc.hidden) { hiddenAt = Date.now(); framesAt = frames; stop(); add("页面隐藏（真的）：rAF暂停"); }
      else {
        var sec = hiddenAt ? (Date.now() - hiddenAt) / 1000 : 0;
        add("回到前台（真的）：隐藏了" + fix(sec, 1) + "秒，这期间rAF跑了" + (frames - framesAt) + "帧（隐藏前一共跑了" + framesAt + "帧）");
        schedule();
      }
    });
    onView(box, function (v) { inView = v; if (v) schedule(); else stop(); });
    paintHidden();
  })();

  /* ================================================================ 23 量具放哪 */
  (function () {
    var box = $("[data-vh-box]");
    if (!box) return;
    var time = $("[data-vh-time]");
    var timeOut = $("[data-vh-time-out]");
    var read = $("[data-vh-read]");
    var FILES = {
      tmp: [{ n: "accept.mjs", age: 3 }, { n: "perf.mjs", age: 2 }, { n: "probe.html", age: 0 }, { n: "out-accept.json", age: 0 }],
      home: [{ n: "accept.mjs", age: 3 }, { n: "perf.mjs", age: 2 }, { n: "说明.md", age: 9 }]
    };
    function clock(v) { var m = 23 * 60 + v * 10; m %= 24 * 60; var h = Math.floor(m / 60), mi = m % 60; return (h < 10 ? "0" : "") + h + ":" + (mi < 10 ? "0" : "") + mi; }
    function paint(speak) {
      var v = parseInt(time.value, 10);
      var past = v >= 6;
      timeOut.textContent = clock(v);
      ["tmp", "home"].forEach(function (k) {
        var ul = $('[data-vh-dir="' + k + '"]', box);
        ul.innerHTML = FILES[k].map(function (f) {
          var gone = k === "tmp" && past && f.age >= 1;
          return '<li class="' + (gone ? "is-gone" : "") + '"><span>' + esc(f.n) + "</span><small>" + (f.age ? f.age + "天前" : "今天") + (gone ? " · 已清" : "") + "</small></li>";
        }).join("");
      });
      box.setAttribute("data-past", past ? "1" : "0");
      read.textContent = past ? clock(v) + "：过了零点，草稿区按文件年龄清掉了两个旧脚本；本机验收目录一个不少。" : clock(v) + "，两边都在。";
      if (speak) announce(read.textContent);
    }
    time.addEventListener("input", function () { paint(false); });
    time.addEventListener("change", function () { paint(true); });
    $("[data-vh-run]").addEventListener("click", function () {
      var past = parseInt(time.value, 10) >= 6;
      read.textContent = past
        ? "第二天复跑：草稿区找不到accept.mjs、perf.mjs（真事里是从会话记录捞回heredoc、再重放后续改动才恢复的）；本机验收目录照常跑。"
        : "还没过零点，两边都能跑——明天就不一定了。把滑块拖过00:00再试。";
      box.setAttribute("data-rerun", past ? "lost" : "ok");
      announce(read.textContent);
    });
    paint(false);
  })();

  /* ================================================================ 24 错话三形态：找错 */
  (function () {
    var listEl = $("[data-dc-list]");
    if (!listEl) return;
    var read = $("[data-dc-read]");
    var L = [
      { f: "float-scene.ts · 文件头", t: "精简档：像素比1，省显存。", e: 1, w: "① 数字过期：拿旧值「像素比1」全仓grep就能捞出来。" },
      { f: "float-scene.ts · 改动点", t: "const dpr = Math.min(devicePixelRatio, 1.5); // 上限1.5（不再钉1，见文件头）", e: 2, w: "② 这一行本身对，可「见文件头」把人领去信那句错话。写「见X」时顺手打开X看一眼，连它一起改。" },
      { f: "README.md", t: "3D精简档把像素比钉在1。", e: 1, w: "① 数字过期：文档正文复述了旧值。改一个值，要改所有复述它的地方。" },
      { f: "规格 · 随笔球", t: "手机2、精简档1：因为精简档不看DPR、手机看DPR。", e: 3, w: "③ 结论读着没毛病，理由已经悬空：精简档现在也看DPR了。没有过期数字可grep，只能回头读「为什么是这个值」的段落。" },
      { f: "CHANGELOG.md", t: "精简档像素比改为 min(devicePixelRatio, 1.5)。", e: 0, w: "对：这就是这一轮的记录。" },
      { f: "quality.ts", t: "soft: { dprCap: 1.5 }", e: 0, w: "对：实现本身。" },
      { f: "viewer.ts", t: "// 查看器没有精简档，像素比照旧钉1", e: 0, w: "对：说的是另一件东西。相似只是线索，不是结论——每一处单独核。" }
    ];
    var checked = false;
    function render() {
      listEl.innerHTML = L.map(function (x, i) {
        return '<li><button type="button" aria-pressed="false" data-dc="' + i + '"><span class="me-dc-f">' + esc(x.f) + '</span><span class="me-dc-t">' + esc(x.t) +
          '</span><span class="me-dc-r" data-dc-r hidden></span></button></li>';
      }).join("");
      checked = false;
      listEl.removeAttribute("data-score");
      read.textContent = "选好了点「交卷」。";
    }
    listEl.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("[data-dc]") : null;
      if (!b || checked) return;
      var on = toggle(b);
      announce((on ? "标为要改：" : "取消：") + L[parseInt(b.getAttribute("data-dc"), 10)].f);
    });
    $("[data-dc-check]").addEventListener("click", function () {
      var hit = 0, miss = 0, wrong = 0;
      $$("[data-dc]", listEl).forEach(function (b) {
        var x = L[parseInt(b.getAttribute("data-dc"), 10)];
        var on = b.getAttribute("aria-pressed") === "true";
        var r = $("[data-dc-r]", b);
        var tag;
        if (x.e && on) { hit++; tag = badge("找到了", "green"); }
        else if (x.e) { miss++; tag = badge("漏了", "red"); }
        else if (on) { wrong++; tag = badge("错标", "warn"); }
        else tag = badge("没事", "gray");
        r.innerHTML = tag + "<span>" + esc(x.w) + "</span>";
        r.hidden = false;
      });
      checked = true;
      listEl.setAttribute("data-score", hit + "/" + miss + "/" + wrong);
      read.textContent = "4处要改，找到" + hit + "处、漏了" + miss + "处、错标" + wrong + "处。";
      announce(read.textContent);
    });
    $("[data-dc-reset]").addEventListener("click", function () { render(); announce("重来"); });
    render();
  })();

  /* ================================================================ 25 白名单打包（规则照 scripts/publish-static.mjs） */
  (function () {
    var box = $("[data-wl-box]");
    if (!box) return;
    var repo = $("[data-wl-repo]", box), pkg = $("[data-wl-pkg]", box);
    var read = $("[data-wl-read]");
    var WHITE = [/^[^/]+\.html$/, /^assets\/[^/]+\.(js|css)$/, /^assets\/pages\/[^/]+\.(js|css)$/, /^assets\/shots\/[^/]+\.webp$/, /^data\/[^/]+\.js$/, /^brand\/brand-icon\.(svg|png)$/];
    var BLACK = [/^docs\//, /^scripts\//, /^(CLAUDE|README|CHANGELOG)\.md$/, /^\.git/, /^打开设计合集\.[^/]+$/, /^brand\/README\.txt$/, /(^|\/)(\.DS_Store|Thumbs\.db|desktop\.ini)$/];
    var BASE = ["index.html", "color.html", "assets/star.css", "assets/nav.js", "assets/pages/color.js", "data/collection.js", "brand/brand-icon.svg",
      "docs/目录与版式.md", "scripts/publish-static.mjs", "CLAUDE.md", ".git/", "打开设计合集.command", ".DS_Store"];
    var ADD = ["assets/pages/method.js", "草稿.tmp", ".env.local", "notes/私人笔记.md"];
    var added = 0;
    var mode = "white";
    function any(list, f) { return list.some(function (re) { return re.test(f); }); }
    function paint(speak) {
      var files = BASE.concat(ADD.slice(0, added));
      repo.innerHTML = files.map(function (f, i) { return '<li class="' + (i >= BASE.length ? "is-new" : "") + '">' + esc(f) + "</li>"; }).join("");
      var inPkg = [], errs = [], leaks = [];
      files.forEach(function (f, i) {
        var isNew = i >= BASE.length;
        if (mode === "black") {
          if (!any(BLACK, f)) { inPkg.push(f); if (isNew && !any(WHITE, f)) leaks.push(f); }
        } else if (any(WHITE, f)) inPkg.push(f);
        else if (!any(BLACK, f)) errs.push(f);
      });
      pkg.innerHTML = inPkg.map(function (f) { return '<li class="' + (leaks.indexOf(f) >= 0 ? "is-leak" : "") + '">' + esc(f) + (leaks.indexOf(f) >= 0 ? "  ← 跟着走了" : "") + "</li>"; }).join("") +
        errs.map(function (f) { return '<li class="is-err">✗ ' + esc(f) + "：两张表都没写到 → 报错，产物不算数</li>"; }).join("");
      box.setAttribute("data-leaks", String(leaks.length));
      box.setAttribute("data-errs", String(errs.length));
      if (mode === "black") read.textContent = leaks.length ? "黑名单：新文件默认就进包——" + leaks.join("、") + "悄悄跟着走了。" : "黑名单：现在看着没问题；可新加的文件只要没被列进排除表，就会默认进包。";
      else read.textContent = errs.length ? "白名单：认得的新页面脚本自动进包；" + errs.join("、") + "两张表都没写到，报错停下，等人决定。" : "白名单：只拿网页运行要的。";
      if (speak) announce(read.textContent);
    }
    radios($('[aria-label="怎么挑文件"]'), function (b) { mode = b.getAttribute("data-wl"); paint(true); });
    $("[data-wl-add]").addEventListener("click", function () {
      if (added < ADD.length) added++;
      paint(true);
      if (added >= ADD.length) this.disabled = true;
    });
    $("[data-wl-reset]").addEventListener("click", function () { added = 0; $("[data-wl-add]").disabled = false; paint(true); });
    paint(false);
  })();
})();
