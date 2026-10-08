/*
 * 交互页（interaction.html）的活样例。普通 defer 脚本（file:// 下不用 module、不用 fetch）。
 *
 * 每个样例一个 init 函数，互不依赖；某个样例的 DOM 缺了就跳过，不拖累别的。
 * 共同写法（照各项目的真实实现）：
 *  - 动画只动 transform / opacity；撑开、让位、补位用 FLIP（先量旧位置 → 改 DOM → 量新位置 → 从旧位置滑回）。
 *  - 每段动画都能被打断：再触发时先取消旧动画、清计时器；收尾走「事件 + 兜底计时器」两条路，谁先到算谁
 *    （后台标签页的动画时钟可能停着，事件不来）。
 *  - prefers-reduced-motion: reduce 时 JS 这边不起动画、不挂动效类，直接到位（CSS 那边另有一道）。
 *  - 凡处理回车 / Esc / 方向键的 keydown，第一行先判输入法合成态；拦表单提交那一处只认 isComposing。
 */
(function () {
  "use strict";

  var doc = document;
  var mqReduce = null;
  try { mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)"); } catch (e) { mqReduce = null; }
  var canAnimate = typeof Element !== "undefined" && typeof Element.prototype.animate === "function";

  function reduced() { return !!(mqReduce && mqReduce.matches); }
  function $(sel, root) { return (root || doc).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function narrow() {
    try { return window.matchMedia("(max-width: 600px)").matches; } catch (e) { return false; }
  }

  var EASE_OUT = "cubic-bezier(.2, .8, .2, 1)";     /* 刷刷 flipMove / 按压按下 / 浮层 */
  var EASE_PLAN = "cubic-bezier(.22, 1, .36, 1)";   /* plan --ease-out：对勾、计数、FLIP */
  var EASE_STD = "cubic-bezier(.4, 0, .2, 1)";      /* 刷刷标签删除、plan --ease-standard */

  /* 事件 + 兜底计时器：fn 只跑一次。animation 可以是 null（只靠计时器）。 */
  function settle(animation, ms, fn) {
    var done = false;
    var timer = 0;
    function run() {
      if (done) return;
      done = true;
      clearTimeout(timer);
      fn();
    }
    timer = setTimeout(run, ms);
    if (animation && animation.finished && typeof animation.finished.then === "function") {
      animation.finished.then(run, run);
    }
    return run;
  }

  /* FLIP（照刷刷 app.js 的 flipMove）：旧位置按「此刻屏幕上的样子」量（含上一轮还没走完的位移），
     量完先撤掉上一轮，再改 DOM、量新位置、从旧位置滑回。
     opts.relative：嵌套元素相对哪个祖先量（plan useFlip：嵌套的 data-flip 按最近一层祖先算，免得补两遍）。
     opts.stagger：依次晚多少毫秒出发；opts.maxDelay 封顶。返回 { result, settleMs }。 */
  var flipAnims = new WeakMap();
  function flipMove(items, mutate, opts) {
    opts = opts || {};
    var duration = opts.duration || 240;
    var easing = opts.easing || EASE_OUT;
    var rel = opts.relative || null;
    var list = items.filter(Boolean);
    function place(el) {
      var r = el.getBoundingClientRect();
      var anchor = rel ? rel(el) : null;
      if (anchor) {
        var a = anchor.getBoundingClientRect();
        return { x: r.left - a.left, y: r.top - a.top };
      }
      return { x: r.left, y: r.top };
    }
    var before = new Map();
    list.forEach(function (el) { before.set(el, place(el)); });
    list.forEach(function (el) {
      var old = flipAnims.get(el);
      if (old) { old.cancel(); flipAnims.delete(el); }
    });
    var result = mutate();
    if (reduced() || !canAnimate) return { result: result, settleMs: 0 };
    var delay = 0;
    var step = opts.stagger || 0;
    var cap = opts.maxDelay == null ? 96 : opts.maxDelay;
    var moved = 0;
    list.forEach(function (el) {
      if (!el.isConnected) return;
      var from = before.get(el);
      var to = place(el);
      var dx = from.x - to.x;
      var dy = from.y - to.y;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
      var d = Math.min(moved * step, cap);
      moved += 1;
      delay = Math.max(delay, d);
      var anim = el.animate(
        [{ transform: "translate(" + dx + "px, " + dy + "px)" }, { transform: "translate(0, 0)" }],
        { duration: duration, easing: easing, delay: d, fill: "backwards" }
      );
      flipAnims.set(el, anim);
      anim.finished.then(function () { if (flipAnims.get(el) === anim) flipAnims.delete(el); }, function () {});
    });
    return { result: result, settleMs: moved ? duration + delay : 0 };
  }

  /* 会「跳一下」的数字（照 plan BumpNumber）：值变了才换一个新 span 重播入场；首次渲染不跳。 */
  function setBump(holder, value, animate) {
    if (!holder) return;
    var cur = holder.firstElementChild;
    var text = String(value);
    if (cur && cur.textContent === text) return;
    var span = doc.createElement("span");
    span.className = "ix-bump";
    span.textContent = text;
    if (cur && animate && !reduced()) span.classList.add("is-bumped");
    holder.textContent = "";
    holder.appendChild(span);
  }

  /* 礼貌播报：只改文字；同一句话连续两次要先清空再写，读屏才会再读一遍。 */
  function say(region, text) {
    if (!region) return;
    if (region.textContent === text) {
      region.textContent = "";
      setTimeout(function () { region.textContent = text; }, 30);
    } else {
      region.textContent = text;
    }
  }

  /* 停手约 400ms 后只播最后一句（岗岗 speakSuggest）；同一次打开里这句没变就不重播；收起时清掉待播。 */
  function makeSpeaker(region, isOpen) {
    var timer = 0;
    var spoken = "";
    return {
      speak: function (text) {
        if (text === spoken && !timer) return;
        spoken = text;
        clearTimeout(timer);
        timer = setTimeout(function () {
          timer = 0;
          if (isOpen()) say(region, text);
        }, 400);
      },
      clear: function () {
        clearTimeout(timer);
        timer = 0;
        spoken = "";
      }
    };
  }

  var SVG = {
    check: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m5 12.6 4.4 4.4L19 7.4"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m7 7 10 10M17 7 7 17"/></svg>',
    hash: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9.6 4.4 7.8 19.6M16.2 4.4l-1.8 15.2M5 9.2h14.4M4.2 14.8h14.4"/></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="10.8" cy="10.8" r="6.4"/><path d="m15.6 15.6 4.2 4.2"/></svg>'
  };

  /* ================================================================
   * 1. 筛选标签（单选，照 plan「全部任务」状态筛选）
   * ================================================================ */
  function initFilter() {
    var root = $("[data-demo='filter']");
    if (!root) return;
    var chipsEl = $(".ixf-chips", root);
    var listEl = $(".ixf-list", root);
    var nEl = $(".ixf-n", root);
    var live = $(".ixf-live", root);
    var CHIPS = [
      { key: "all", label: "全部" },
      { key: "inbox", label: "收件箱" },
      { key: "active", label: "进行中" },
      { key: "done", label: "已完成" },
      { key: "archived", label: "已归档" }
    ];
    var STATE_LABEL = { inbox: "收件箱", done: "已完成", archived: "已归档" };
    var tasks = [
      { id: 1, name: "物业费发票报销", status: "active" },
      { id: 2, name: "体检预约", status: "inbox" },
      { id: 3, name: "护照续签材料", status: "active" },
      { id: 4, name: "给爸妈寄月饼", status: "done" },
      { id: 5, name: "续交宽带", status: "inbox" },
      { id: 6, name: "整理九月照片", status: "archived" },
      { id: 7, name: "改简历", status: "active" },
      { id: 8, name: "车险续保比价", status: "done" }
    ];
    var current = "all";
    var first = true;

    chipsEl.innerHTML = CHIPS.map(function (c) {
      return '<button type="button" class="ix-chip" data-key="' + c.key + '" aria-pressed="false">' +
        '<span class="ix-chip-label"><span>' + c.label + '</span><span class="ix-chip-count" data-count="' + c.key + '"></span></span></button>';
    }).join("");
    var chipEls = $$(".ix-chip", chipsEl);

    function counts() {
      var c = { all: tasks.length, inbox: 0, active: 0, done: 0, archived: 0 };
      tasks.forEach(function (t) { c[t.status] += 1; });
      return c;
    }
    function rows() {
      return tasks.filter(function (t) { return current === "all" || t.status === current; });
    }
    function paintPressed() {
      chipEls.forEach(function (chip) {
        var on = chip.getAttribute("data-key") === current;
        chip.setAttribute("aria-pressed", on ? "true" : "false");
        var check = $(".ix-chip-check", chip);
        if (on && !check) {
          check = doc.createElement("span");
          check.className = "ix-chip-check";
          check.innerHTML = SVG.check;
          if (!first && !reduced()) check.classList.add("is-growing");
          chip.insertBefore(check, chip.firstChild);
        } else if (!on && check) {
          check.remove();
        }
      });
    }
    function paintCounts(animate) {
      var c = counts();
      $$("[data-count]", chipsEl).forEach(function (holder) { setBump(holder, c[holder.getAttribute("data-count")], animate); });
    }
    function paintList(animate) {
      var r = rows();
      listEl.innerHTML = r.length ? r.map(function (t) {
        var state = STATE_LABEL[t.status];
        return '<li class="ixf-row" data-id="' + t.id + '">' +
          '<label class="ixf-check"><input type="checkbox"' + (t.status === "done" ? " checked" : "") + (t.status === "archived" ? " disabled" : "") +
          ' data-toggle="' + t.id + '"><span>' + esc(t.name) + '</span></label>' +
          (state ? '<span class="ixf-state is-' + t.status + '">' + state + "</span>" : "") + "</li>";
      }).join("") : '<li class="ixf-empty">没有符合的任务。</li>';
      setBump(nEl, r.length, animate);
      if (!first) say(live, "显示" + r.length + "项");
    }

    paintPressed();
    paintCounts(false);
    paintList(false);
    live.textContent = "显示" + rows().length + "项";
    first = false;

    chipsEl.addEventListener("click", function (event) {
      var chip = event.target.closest(".ix-chip");
      if (!chip) return;
      var key = chip.getAttribute("data-key");
      if (key === current) return;
      var labels = chipEls.map(function (c) { return $(".ix-chip-label", c); });
      /* 标签本身按绝对位置补位（让位），标签里的文字按相对标签的位置补位（对勾长出来把字往右推） */
      flipMove(chipEls.concat(labels), function () {
        current = key;
        paintPressed();
      }, {
        duration: 220,
        easing: EASE_PLAN,
        relative: function (el) { return el.classList.contains("ix-chip-label") ? el.parentElement : null; }
      });
      paintList(true);
    });

    listEl.addEventListener("change", function (event) {
      var box = event.target.closest("[data-toggle]");
      if (!box) return;
      var id = Number(box.getAttribute("data-toggle"));
      tasks.forEach(function (t) { if (t.id === id) t.status = box.checked ? "done" : "active"; });
      paintCounts(true);
      paintList(true);
    });
  }

  /* ================================================================
   * 1b. 多选筛选胶囊（刷刷 3.13.0 做过、屋主看后撤回的那一版）
   * ================================================================ */
  function initFilterMulti() {
    var root = $("[data-demo='filter-multi']");
    if (!root) return;
    var nEl = $(".ixm-n", root);
    var live = $(".ixm-live", root);
    var GROUPS = [
      { key: "type", label: "题型", items: [["single", "单选", 0.5], ["multi", "多选", 0.3], ["judge", "判断", 0.2]] },
      { key: "level", label: "难度", items: [["easy", "基础", 0.45], ["mid", "进阶", 0.4], ["hard", "难题", 0.15]] },
      { key: "bank", label: "题库", items: [["y26", "年检2026", 799], ["bill", "票据", 240], ["fx", "外汇", 186], ["aml", "反洗钱", 132], ["cred", "信贷", 305]] }
    ];
    var picked = { type: { single: true, multi: true, judge: true }, level: { easy: true, mid: true, hard: true }, bank: { y26: true } };
    var body = $(".ixm-rows", root);
    body.innerHTML = GROUPS.map(function (g) {
      return '<div class="ixm-row"><span class="ixm-label" id="ixm-l-' + g.key + '">' + g.label + '</span>' +
        '<div class="ixm-chips" role="group" aria-labelledby="ixm-l-' + g.key + '" data-group="' + g.key + '">' +
        g.items.map(function (it) {
          return '<button type="button" class="ix-chip is-multi" data-item="' + it[0] + '" aria-pressed="false"><span class="ix-chip-label"><span>' + it[1] + "</span></span></button>";
        }).join("") + "</div></div>";
    }).join("");

    function total() {
      var share = function (g) {
        var s = 0;
        g.items.forEach(function (it) { if (picked[g.key][it[0]]) s += it[2]; });
        return s;
      };
      var banks = 0;
      GROUPS[2].items.forEach(function (it) { if (picked.bank[it[0]]) banks += it[2]; });
      return Math.round(banks * share(GROUPS[0]) * share(GROUPS[1]));
    }
    var first = true;
    function paint(groupEl) {
      $$(".ixm-chips", root).forEach(function (g) {
        if (groupEl && g !== groupEl) return;
        var key = g.getAttribute("data-group");
        $$(".ix-chip", g).forEach(function (chip) {
          var on = !!picked[key][chip.getAttribute("data-item")];
          chip.setAttribute("aria-pressed", on ? "true" : "false");
          var check = $(".ix-chip-check", chip);
          if (on && !check) {
            check = doc.createElement("span");
            check.className = "ix-chip-check";
            check.innerHTML = SVG.check;
            if (!first && !reduced()) check.classList.add("is-growing");
            chip.insertBefore(check, chip.firstChild);
          } else if (!on && check) {
            check.remove();
          }
        });
      });
      var n = total();
      setBump(nEl, n, !first);
      if (!first) say(live, "共" + n + "题");
    }
    paint(null);
    first = false;

    root.addEventListener("click", function (event) {
      var chip = event.target.closest(".ix-chip");
      if (!chip) return;
      var g = chip.closest(".ixm-chips");
      var key = g.getAttribute("data-group");
      var item = chip.getAttribute("data-item");
      var chips = $$(".ix-chip", g);
      var labels = chips.map(function (c) { return $(".ix-chip-label", c); });
      flipMove(chips.concat(labels), function () {
        picked[key][item] = !picked[key][item];
        paint(g);
      }, {
        duration: 240,
        easing: EASE_OUT,
        relative: function (el) { return el.classList.contains("ix-chip-label") ? el.parentElement : null; }
      });
    });
  }

  /* ================================================================
   * 2. 可删除标签 + 输入 # 联想（删除照刷刷搜题框，联想与存法照 plan 笔记标签，键盘照岗岗）
   * ================================================================ */
  function initTags() {
    var root = $("[data-demo='tags']");
    if (!root) return;
    var form = $(".ixt-form", root);
    var box = $(".ixt-box", root);
    var input = $(".ixt-input", root);
    var pop = $(".ixt-pop", root);
    var field = $(".ixt-field", root);
    var live = $(".ixt-live", root);
    var LIBRARY = ["家里", "采购", "体检", "年假", "报销", "旅行", "孩子", "读书", "装修", "保险", "父母", "车", "猫", "学习", "工作"];
    var tags = ["家里", "采购", "体检", "年假", "报销", "旅行", "孩子"];
    var cursor = -1;
    var options = [];
    var dismissed = false;
    var imeKeyDown = false;
    var composing = false;
    var holdToken = 0;
    var holdTimer = 0;
    var speaker = makeSpeaker(live, function () { return !pop.hidden; });

    function tagHtml(tag) {
      return '<span class="ixt-tag" data-tag="' + esc(tag) + '">' +
        '<span class="ixt-tag-bg" aria-hidden="true"></span><span class="ixt-tag-dot" aria-hidden="true"></span>' +
        '<span class="ixt-tag-text">' + esc(tag) + '</span>' +
        '<button type="button" class="ixt-tag-x" aria-label="删除标签“' + esc(tag) + '”">' + SVG.x + "</button></span>";
    }
    function makeTag(tag) {
      var holder = doc.createElement("span");
      holder.innerHTML = tagHtml(tag);
      return holder.firstElementChild;
    }
    box.insertAdjacentHTML("afterbegin", tags.map(tagHtml).join(""));

    /* 补位：排在 anchor 后面的标签与输入框依次晚 24ms（最多晚 96ms）；
       行数变少时框先用一次性 min-height 撑住原高，补位走完一次性放开——不做高度动画。 */
    function reflow(followers, mutate) {
      var heightBefore = box.offsetHeight;
      var out = flipMove(followers, mutate, { duration: 240, easing: EASE_OUT, stagger: 24, maxDelay: 96 });
      box.style.minHeight = "";
      var token = ++holdToken;
      clearTimeout(holdTimer);
      if (!reduced() && out.settleMs && box.offsetHeight < heightBefore) {
        box.style.minHeight = heightBefore + "px";
        holdTimer = setTimeout(function () { if (token === holdToken) box.style.minHeight = ""; }, out.settleMs);
      }
      return out.settleMs;
    }
    function followersOf(el) {
      return $$(".ixt-tag, .ixt-input", box).filter(function (item) {
        return el.compareDocumentPosition(item) & Node.DOCUMENT_POSITION_FOLLOWING;
      });
    }

    function clean(raw) { return String(raw || "").trim().replace(/^#+/, "").trim(); }

    function addTag(raw) {
      var tag = clean(raw);
      input.value = "";
      closePop();
      dismissed = false;
      if (!tag) return;
      if (tags.indexOf(tag) >= 0) { say(live, "已有标签“" + tag + "”"); return; }
      tags.push(tag);
      var el = makeTag(tag);
      reflow([input], function () { box.insertBefore(el, input); });
      if (!reduced() && canAnimate) {
        el.animate([{ opacity: 0, transform: "scale(.6)" }, { opacity: 1, transform: "none" }], { duration: 180, easing: EASE_OUT });
      }
      say(live, "已添加标签“" + tag + "”");
    }

    /* 删除：文字与叉号 100ms 淡出；底色层缩到圆点大小并淡掉（170ms）；中心圆点淡入再缩没（240ms）；
       圆点走完才从 DOM 里拿掉，后面的依次补位。 */
    function removeTag(el) {
      if (!el || el.classList.contains("is-removing")) return;
      var tag = el.getAttribute("data-tag");
      tags = tags.filter(function (t) { return t !== tag; });
      el.classList.add("is-removing");
      el.setAttribute("aria-hidden", "true");
      var btn = $(".ixt-tag-x", el);
      if (btn) { btn.disabled = true; btn.tabIndex = -1; }
      input.focus();
      if (!pop.hidden) update();
      say(live, "已删除标签“" + tag + "”");
      function finish() {
        if (!el.isConnected) return;
        reflow(followersOf(el), function () { el.remove(); });
      }
      if (reduced() || !canAnimate) { finish(); return; }
      var w = el.offsetWidth || 1;
      var h = el.offsetHeight || 1;
      var dot = $(".ixt-tag-dot", el);
      var d = (dot && dot.offsetWidth) || 6;
      $$(".ixt-tag-text, .ixt-tag-x", el).forEach(function (part) {
        part.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 100, easing: EASE_STD, fill: "forwards" });
      });
      var bg = $(".ixt-tag-bg", el);
      if (bg) bg.animate([{ transform: "none", opacity: 1 }, { transform: "scale(" + (d / w) + ", " + (d / h) + ")", opacity: 0 }], { duration: 170, easing: EASE_STD, fill: "forwards" });
      var last = dot ? dot.animate([
        { opacity: 0, transform: "scale(1)" },
        { opacity: 1, transform: "scale(1)", offset: 0.55 },
        { opacity: 0, transform: "scale(.2)" }
      ], { duration: 240, easing: EASE_STD, fill: "forwards" }) : null;
      settle(last, 240 + 120, finish);
    }

    /* ---- 联想浮层 ---- */
    function setCursor(i) {
      var opts = $$("[role='option']", pop);
      cursor = i >= 0 && i < opts.length ? i : -1;
      opts.forEach(function (o, at) { o.setAttribute("aria-selected", at === cursor ? "true" : "false"); });
      if (cursor >= 0) input.setAttribute("aria-activedescendant", opts[cursor].id);
      else input.removeAttribute("aria-activedescendant");
    }
    function placePop() {
      if (narrow()) { pop.style.left = "0px"; return; }
      var left = input.offsetLeft + box.offsetLeft;
      var max = field.clientWidth - pop.offsetWidth;
      pop.style.left = Math.round(clamp(left, 0, Math.max(0, max))) + "px";
    }
    function openPop() {
      var wasOpen = !pop.hidden;
      pop.hidden = false;
      input.setAttribute("aria-expanded", "true");
      placePop();
      if (!wasOpen && !reduced() && canAnimate) {
        pop.animate([{ opacity: 0, transform: "translateY(-4px) scale(.98)" }, { opacity: 1, transform: "none" }], { duration: 140, easing: EASE_OUT });
      }
    }
    function closePop() {
      speaker.clear();
      setCursor(-1);
      pop.hidden = true;
      input.setAttribute("aria-expanded", "false");
    }
    function update() {
      var text = input.value;
      if (text.charAt(0) !== "#" || dismissed) { closePop(); return; }
      var q = text.slice(1).trim();
      options = LIBRARY.filter(function (t) { return tags.indexOf(t) < 0 && t.indexOf(q) >= 0; }).slice(0, 6);
      if (!options.length) { closePop(); return; }
      pop.innerHTML = options.map(function (t, i) {
        return '<li role="option" id="ixt-opt-' + i + '" aria-selected="false" data-value="' + esc(t) + '"><span class="ixt-hash">' + SVG.hash + "</span>" + esc(t) + "</li>";
      }).join("");
      setCursor(-1);
      openPop();
      speaker.speak(options.length + "个标签可选，上下键选择");
    }
    /* 逗号（中英文都认）把前面的字收成标签；组字中不切，由 compositionend 补一次（plan 31.2b）。 */
    function absorb() {
      var v = input.value;
      if (!/[,，]/.test(v)) { update(); return; }
      var parts = v.split(/[,，]/);
      var rest = parts.pop();
      input.value = "";
      parts.forEach(function (p) { if (clean(p)) addTag(p); });
      input.value = rest;
      update();
    }

    input.addEventListener("keydown", function (event) {
      /* 合成态的按键归输入法：选词的回车、取消选词的 Esc、翻候选的方向键。只记旗标，不 preventDefault。 */
      imeKeyDown = Boolean(event.isComposing);
      if (event.isComposing || event.keyCode === 229) return;
      var open = !pop.hidden;
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        if (!open) return;
        event.preventDefault();
        var lastIdx = options.length - 1;
        /* 从「无」按 ↓ 到第 0 项；第 0 项按 ↑ 回到「无」；末项按 ↓ 停住（岗岗 11.3） */
        setCursor(event.key === "ArrowDown" ? Math.min(cursor + 1, lastIdx) : Math.max(cursor - 1, -1));
        return;
      }
      if (event.key === "Enter") {
        if (open && cursor >= 0) {
          event.preventDefault();      /* 挡住表单的隐式提交，改为插入这一项 */
          addTag(options[cursor]);
        }
        return;                         /* 没有当前项：不拦，交给表单提交 */
      }
      if (event.key === "Escape") {
        if (open) {                     /* 第一下只收浮层，框里的字留着 */
          event.preventDefault();
          dismissed = true;
          closePop();
        } else if (input.value) {       /* 第二下才清空 */
          event.preventDefault();
          input.value = "";
          dismissed = false;
        }
        return;
      }
      if (event.key === "Backspace" && !input.value) {
        var all = $$(".ixt-tag:not(.is-removing)", box);
        if (!all.length) return;
        event.preventDefault();
        removeTag(all[all.length - 1]);
      }
    });
    input.addEventListener("keyup", function () { imeKeyDown = false; });
    input.addEventListener("blur", function () { imeKeyDown = false; closePop(); });
    input.addEventListener("compositionstart", function () { composing = true; });
    input.addEventListener("compositionend", function () { composing = false; dismissed = false; absorb(); });
    input.addEventListener("input", function (event) {
      if (event.isComposing || composing) return;
      dismissed = false;
      absorb();
    });
    /* 隐式提交不经过 keydown 分支：这里只认 isComposing（不认 229，安卓软键盘不在合成时也常报 229） */
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (imeKeyDown) return;
      addTag(input.value);
    });

    /* 选项按下不让输入框失焦（否则 blur 先把浮层收掉、click 落空）；键盘与鼠标共用一个高亮 */
    pop.addEventListener("mousedown", function (event) { event.preventDefault(); });
    pop.addEventListener("click", function (event) {
      var opt = event.target.closest("[role='option']");
      if (opt) addTag(opt.getAttribute("data-value"));
    });
    pop.addEventListener("mousemove", function (event) {
      var opt = event.target.closest("[role='option']");
      if (!opt) return;
      var i = $$("[role='option']", pop).indexOf(opt);
      if (i !== cursor) setCursor(i);
    });
    /* 点框里的空白等于点输入框；点叉号不抢焦点 */
    box.addEventListener("mousedown", function (event) {
      if (event.target === input) return;
      event.preventDefault();
      if (!event.target.closest(".ixt-tag-x")) input.focus();
    });
    box.addEventListener("click", function (event) {
      var x = event.target.closest(".ixt-tag-x");
      if (x) removeTag(x.closest(".ixt-tag"));
    });
    window.addEventListener("resize", function () { if (!pop.hidden) placePop(); });
  }

  /* ================================================================
   * 2b. 联想浮层的完整规矩（照岗岗顶栏搜索）
   * ================================================================ */
  function initSuggest() {
    var root = $("[data-demo='suggest']");
    if (!root) return;
    var form = $(".ixs2-form", root);
    var input = $(".ixs2-input", root);
    var pop = $(".ixs2-pop", root);
    var list = $(".ixs2-list", root);
    var note = $(".ixs2-note", root);
    var out = $(".ixs2-out", root);
    var live = $(".ixs2-live", root);
    var ITEMS = [
      ["个人开户", "对私 › 账户"], ["个人销户", "对私 › 账户"], ["借记卡挂失", "对私 › 卡片"], ["借记卡换卡", "对私 › 卡片"],
      ["密码重置", "对私 › 卡片"], ["定期存款开户", "对私 › 存款"], ["大额存单", "对私 › 存款"], ["存款证明", "对私 › 存款"],
      ["跨行转账", "对私 › 汇款"], ["外币兑换", "对私 › 外汇"], ["个人结售汇", "对私 › 外汇"], ["账户冻结查询", "对私 › 查询"],
      ["对公开户", "对公 › 账户"], ["对公销户", "对公 › 账户"], ["单位结算卡", "对公 › 账户"], ["印鉴变更", "对公 › 账户"],
      ["账户年检", "对公 › 账户"], ["票据贴现", "对公 › 票据"], ["支票签发", "对公 › 票据"], ["银行承兑汇票", "对公 › 票据"],
      ["代发工资", "对公 › 代理"], ["代收代付", "对公 › 代理"], ["企业网银开通", "对公 › 渠道"], ["大额支付", "对公 › 汇款"]
    ];
    var cursor = -1;
    var shown = [];
    var term = "";
    var imeKeyDown = false;
    var composing = false;
    var speaker = makeSpeaker(live, function () { return !pop.hidden; });

    function search(q) {
      var hits = [];
      ITEMS.forEach(function (it, i) {
        var at = it[0].indexOf(q);
        if (at >= 0) hits.push({ name: it[0], path: it[1], score: at, i: i });
      });
      hits.sort(function (a, b) { return a.score - b.score || a.name.length - b.name.length || a.i - b.i; });
      return hits;
    }
    function similar(q) {
      var chars = q.split("");
      var scored = ITEMS.map(function (it, i) {
        var n = 0;
        chars.forEach(function (c) { if (it[0].indexOf(c) >= 0) n += 1; });
        return { name: it[0], path: it[1], n: n, i: i };
      }).filter(function (s) { return s.n > 0; });
      scored.sort(function (a, b) { return b.n - a.n || a.i - b.i; });
      return scored.slice(0, 3);
    }
    function setCursor(i) {
      var opts = $$("[role='option']", list);
      cursor = i >= 0 && i < opts.length ? i : -1;
      opts.forEach(function (o, at) { o.setAttribute("aria-selected", at === cursor ? "true" : "false"); });
      if (cursor >= 0) input.setAttribute("aria-activedescendant", opts[cursor].id);
      else input.removeAttribute("aria-activedescendant");
    }
    function close() {
      speaker.clear();
      setCursor(-1);
      term = "";
      pop.hidden = true;
      input.setAttribute("aria-expanded", "false");
    }
    function update() {
      var q = input.value.trim();
      if (!q) { close(); return; }
      if (!pop.hidden && q === term) return;   /* input 与 compositionend 可能各来一次：同一个词不重画 */
      term = q;
      var limit = narrow() ? 5 : 6;
      var hits = search(q);
      var speech;
      var html = "";
      if (hits.length) {
        shown = hits.slice(0, limit);
        note.hidden = true;
        html = shown.map(function (h, i) {
          return '<li role="option" id="ixs2-opt-' + i + '" aria-selected="false" data-name="' + esc(h.name) + '">' +
            '<span class="ixs2-name">' + esc(h.name) + '</span><span class="ixs2-path">' + esc(h.path) + "</span></li>";
        }).join("");
        html += '<li role="option" id="ixs2-opt-' + shown.length + '" aria-selected="false" data-all="1" class="ixs2-all">查看全部' + hits.length + "个结果</li>";
        shown = shown.concat([{ all: true, total: hits.length }]);
        speech = hits.length > limit ? limit + "条联想，上下键选择" : hits.length + "条联想，上下键选择";
      } else {
        var near = similar(q);
        shown = near;
        note.hidden = false;
        note.textContent = near.length ? "没有直接命中「" + q + "」，名称相近的业务：" : "没有找到相关业务";
        html = near.map(function (h, i) {
          return '<li role="option" id="ixs2-opt-' + i + '" aria-selected="false" data-name="' + esc(h.name) + '">' +
            '<span class="ixs2-name">' + esc(h.name) + '</span><span class="ixs2-badge">名称相近</span></li>';
        }).join("");
        speech = near.length ? "没有直接命中，" + near.length + "个相近业务" : "没有找到相关业务";
      }
      list.innerHTML = html;
      var wasOpen = !pop.hidden;
      pop.hidden = false;
      input.setAttribute("aria-expanded", "true");
      setCursor(-1);
      if (!wasOpen && !reduced() && canAnimate) {
        pop.animate([{ opacity: 0, transform: "translateY(-4px) scale(.985)" }, { opacity: 1, transform: "none" }], { duration: 180, easing: EASE_OUT });
      }
      speaker.speak(speech);
    }
    function submit() {
      var q = input.value.trim();
      close();
      if (!q) return;
      var n = search(q).length;
      out.textContent = "进结果页：搜「" + q + "」共" + n + "个结果";
    }
    function activate(opt) {
      if (!opt) return;
      if (opt.hasAttribute("data-all")) {
        close();
        if (typeof form.requestSubmit === "function") form.requestSubmit(); else submit();
        return;
      }
      var name = opt.getAttribute("data-name");
      close();
      input.value = "";
      out.textContent = "已打开业务：" + name;
    }

    input.addEventListener("keydown", function (event) {
      imeKeyDown = Boolean(event.isComposing);
      if (event.isComposing || event.keyCode === 229) return;
      if (event.defaultPrevented) return;
      var open = !pop.hidden;
      if (event.key === "Escape") {
        if (open) { event.preventDefault(); close(); return; }        /* 第一下：只收浮层 */
        if (input.value) { event.preventDefault(); input.value = ""; out.textContent = ""; }  /* 第二下：清空 */
        return;
      }
      if (!open || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        var lastIdx = $$("[role='option']", list).length - 1;
        setCursor(event.key === "ArrowDown" ? Math.min(cursor + 1, lastIdx) : Math.max(cursor - 1, -1));
        return;
      }
      if (event.key !== "Enter" || cursor < 0) return;   /* 没有当前项的回车一概不拦 */
      event.preventDefault();
      activate($$("[role='option']", list)[cursor]);
    });
    input.addEventListener("keyup", function () { imeKeyDown = false; });
    input.addEventListener("blur", function () { imeKeyDown = false; close(); });
    input.addEventListener("compositionstart", function () { composing = true; });
    input.addEventListener("compositionend", function () { composing = false; update(); });
    input.addEventListener("input", function (event) { if (!event.isComposing && !composing) update(); });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (imeKeyDown) return;
      submit();
    });
    pop.addEventListener("mousedown", function (event) { event.preventDefault(); });
    list.addEventListener("click", function (event) { activate(event.target.closest("[role='option']")); });
    list.addEventListener("mousemove", function (event) {
      var opt = event.target.closest("[role='option']");
      if (!opt) return;
      var i = $$("[role='option']", list).indexOf(opt);
      if (i !== cursor) setCursor(i);
    });
  }

  /* ================================================================
   * 3. 按压倾斜卡片（倾角、缩放、弹簧照 card 画廊；撤掉按压的 160ms 不过冲照刷刷）
   * ================================================================ */
  function initPress() {
    var root = $("[data-demo='press']");
    if (!root) return;
    var card = $(".ixp-card", root);
    var countEl = $(".ixp-count", root);
    var TILT = 7;         /* 度：触点在卡边上时的最大倾角（card gallery.js PRESS_TILT） */
    var SCALE = 0.96;
    var DRAG = 6;         /* 拖出 6px 就算拖动，按压撤掉 */
    var state = null;     /* { key:boolean, id, x, y } */
    var endTimer = 0;
    var suppressClick = false;
    var presses = 0;

    function clearEnd() {
      clearTimeout(endTimer);
      card.classList.remove("is-springing", "is-cancelling");
    }
    function press(fx, fy, key) {
      clearEnd();
      card.style.setProperty("--px", (fx * 100).toFixed(2) + "%");
      card.style.setProperty("--py", (fy * 100).toFixed(2) + "%");
      if (!reduced()) {
        /* 触点那侧往屏幕里压：rotateY 为正右缘后退；rotateX 为正上缘后退，所以按下半边取负 */
        card.style.setProperty("--pry", ((fx - 0.5) * 2 * TILT).toFixed(2) + "deg");
        card.style.setProperty("--prx", (-(fy - 0.5) * 2 * TILT).toFixed(2) + "deg");
        card.style.setProperty("--ps", String(SCALE));
      }
      card.classList.add("is-pressed");
    }
    function release(cancelled) {
      if (!card.classList.contains("is-pressed")) return;
      card.classList.remove("is-pressed");
      card.classList.add(cancelled ? "is-cancelling" : "is-springing");
      ["--prx", "--pry", "--ps"].forEach(function (n) { card.style.removeProperty(n); });
      /* 弹簧曲线只管这一次复原；留着的话下一次按下也会过冲。收尾：transitionend 或兜底计时器 */
      var cls = cancelled ? "is-cancelling" : "is-springing";
      var ms = (cancelled ? 160 : 700) + 120;
      var done = false;
      function end(event) {
        if (done) return;
        if (event && (event.target !== card || event.propertyName !== "transform")) return;
        done = true;
        clearTimeout(endTimer);
        card.removeEventListener("transitionend", end);
        card.classList.remove(cls);
      }
      card.addEventListener("transitionend", end);
      endTimer = setTimeout(function () { end(null); }, ms);
    }

    card.addEventListener("pointerdown", function (event) {
      if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
      var r = card.getBoundingClientRect();
      state = { key: false, id: event.pointerId, x: event.clientX, y: event.clientY };
      suppressClick = false;
      press(clamp((event.clientX - r.left) / r.width, 0, 1), clamp((event.clientY - r.top) / r.height, 0, 1), false);
      try { card.setPointerCapture(event.pointerId); } catch (e) { /* 捕获失败不影响按压本身 */ }
    });
    card.addEventListener("pointermove", function (event) {
      if (!state || state.key || event.pointerId !== state.id) return;
      if (Math.abs(event.clientX - state.x) > DRAG || Math.abs(event.clientY - state.y) > DRAG) {
        state = null;
        suppressClick = true;           /* 拖过的不算点击 */
        release(true);
      }
    });
    function endPointer(event, cancelled) {
      if (!state || state.key || event.pointerId !== state.id) return;
      state = null;
      release(cancelled);
    }
    card.addEventListener("pointerup", function (event) { endPointer(event, false); });
    card.addEventListener("pointercancel", function (event) { endPointer(event, true); });
    card.addEventListener("lostpointercapture", function (event) { endPointer(event, false); });

    /* 键盘：空格 / 回车 = 按在正中，不倾斜只缩小；松开键复原。原生 button 的点击时机不动。 */
    card.addEventListener("keydown", function (event) {
      if (event.isComposing || event.keyCode === 229) return;
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key !== " " && event.key !== "Enter") return;
      if (state) return;
      state = { key: true };
      press(0.5, 0.5, true);
    });
    card.addEventListener("keyup", function (event) {
      if (event.key !== " " && event.key !== "Enter") return;
      if (!state || !state.key) return;
      state = null;
      release(false);
    });
    /* 按住时焦点被抢走 / 切走窗口，keyup 永远不来：只复原 */
    card.addEventListener("blur", function () { if (state && state.key) { state = null; release(true); } });
    window.addEventListener("blur", function () { if (state) { state = null; release(true); } });

    card.addEventListener("click", function (event) {
      if (suppressClick) { suppressClick = false; event.preventDefault(); return; }
      presses += 1;
      if (countEl) countEl.textContent = "已按" + presses + "次";
    });
  }

  /* ================================================================
   * 4. 确认：会丢作答时说清丢什么（刷刷）/ 自动保存 + 撤销（plan）/ 点了就生效（岗岗）
   * ================================================================ */
  function initConfirm() {
    var root = $("[data-demo='confirm']");
    if (!root) return;
    var statusEl = $(".ixc-status", root);
    var startBtn = $(".ixc-start", root);
    var resetBtn = $(".ixc-reset", root);
    var dialog = $(".ixc-dialog", root);
    var dialogText = $(".ixc-dialog-text", root);
    var INITIAL = { title: "专项练习·票据", number: 7, total: 20, answered: 6 };
    var pending = null;
    var fresh = false;

    function paint() {
      if (pending) {
        statusEl.textContent = "上次的“" + pending.title + "”做到第" + pending.number + "/" + pending.total + "题、已答" + pending.answered + "题。";
      } else if (fresh) {
        statusEl.textContent = "新的练习：第1/20题、已答0题。";
      }
      resetBtn.hidden = !!pending;
    }
    function reset() {
      pending = { title: INITIAL.title, number: INITIAL.number, total: INITIAL.total, answered: INITIAL.answered };
      fresh = false;
      paint();
    }
    reset();

    var hasDialog = dialog && typeof dialog.showModal === "function";
    startBtn.addEventListener("click", function () {
      if (!pending) { fresh = true; paint(); return; }
      var text = "上次的“" + pending.title + "”做到第" + pending.number + "/" + pending.total + "题、已答" + pending.answered + "题。开始新的练习会放弃它的作答，无法恢复。";
      if (!hasDialog) {
        /* 没有 <dialog> 的老内核退回原生 confirm()，文案同一句 */
        if (window.confirm(text + "要继续吗？")) { pending = null; fresh = true; paint(); }
        startBtn.focus();
        return;
      }
      dialogText.textContent = text;
      dialog.returnValue = "";
      dialog.showModal();
      var cancelBtn = $("[value='cancel']", dialog);
      if (cancelBtn) cancelBtn.focus();
      if (!reduced() && canAnimate) {
        dialog.animate([{ opacity: 0, transform: "scale(.96)" }, { opacity: 1, transform: "none" }], { duration: 240, easing: "cubic-bezier(.32, .72, 0, 1)" });
      }
    });
    if (hasDialog) {
      /* Esc 走原生 cancel 事件：当取消处理，returnValue 留空 */
      dialog.addEventListener("close", function () {
        if (dialog.returnValue === "confirm") { pending = null; fresh = true; paint(); }
        startBtn.focus();              /* 焦点还给触发按钮 */
      });
    }
    resetBtn.addEventListener("click", function () { reset(); startBtn.focus(); });

    /* ---- plan：自动保存 + 3 秒「已保存 · 撤销」 ---- */
    var field = $(".ixc-field", root);
    var toast = $(".ixc-toast", root);
    var undoBtn = $(".ixc-undo", root);
    var saved = field ? field.value : "";
    var snapshot = null;
    var toastTimer = 0;
    var toastAnim = null;
    var imeKeyDown = false;
    function hideToast(now) {
      clearTimeout(toastTimer);
      if (toastAnim) { toastAnim.cancel(); toastAnim = null; }
      if (now || reduced() || !canAnimate || toast.hidden) { toast.hidden = true; return; }
      var anim = toast.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, easing: "linear", fill: "forwards" });
      toastAnim = anim;
      settle(anim, 140 + 120, function () {
        if (toastAnim !== anim) return;
        toastAnim = null;
        anim.cancel();
        toast.hidden = true;
      });
    }
    function showToast() {
      clearTimeout(toastTimer);
      if (toastAnim) { toastAnim.cancel(); toastAnim = null; }
      var wasHidden = toast.hidden;
      toast.hidden = false;
      if (wasHidden && !reduced() && canAnimate) {
        toast.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 180, easing: EASE_OUT });
      }
      toastTimer = setTimeout(function () { hideToast(false); }, 3000);
    }
    function commit() {
      if (!field) return;
      var v = field.value.trim();
      if (!v) { field.value = saved; return; }
      if (v === saved) return;          /* 值没变就什么都不写 */
      snapshot = saved;
      saved = v;
      field.value = v;
      showToast();
    }
    if (field) {
      field.addEventListener("keydown", function (event) {
        imeKeyDown = Boolean(event.isComposing);
        if (event.isComposing || event.keyCode === 229) return;
        if (event.key === "Enter") { event.preventDefault(); commit(); }
        if (event.key === "Escape") { event.preventDefault(); field.value = saved; field.blur(); }
      });
      field.addEventListener("keyup", function () { imeKeyDown = false; });
      field.addEventListener("blur", function () { imeKeyDown = false; commit(); });
    }
    if (undoBtn) {
      undoBtn.addEventListener("click", function () {
        if (snapshot === null) return;
        saved = snapshot;
        snapshot = null;
        field.value = saved;
        hideToast(true);
        say($(".ixc-live", root), "已撤销，任务名回到“" + saved + "”");
      });
    }

    /* ---- 岗岗：清空勾选，点了就生效 ---- */
    var clearBtn = $(".ixc-clear", root);
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        var boxes = $$(".ixc-checks input[type='checkbox']", root);
        boxes.forEach(function (b) { b.checked = false; });
        say($(".ixc-live", root), "已清空勾选，共" + boxes.length + "项");
      });
    }
  }

  /* ================================================================
   * 5. 分段控件 + 六个色点（只改样例自己的小窗）
   * ================================================================ */
  function initSeg() {
    var root = $("[data-demo='seg']");
    if (!root) return;
    var win = $(".ixs-window", root);
    var seg = $(".ixs-seg", root);
    var radios = $$("[role='radio']", seg);
    var dotsEl = $(".ixs-dots", root);
    var dots = $$("[data-ix-accent]", dotsEl);
    var modeNote = $(".ixs-mode-note", root);
    var live = $(".ixs-live", root);
    var LABEL = { light: "浅色", dark: "深色" };
    var ACCENT_LABEL = { blue: "蓝", green: "绿", indigo: "靛", orange: "橙", pink: "粉", teal: "青" };
    var mqDark = null;
    try { mqDark = window.matchMedia("(prefers-color-scheme: dark)"); } catch (e) { mqDark = null; }
    var htmlEl = doc.documentElement;
    var pref = htmlEl.getAttribute("data-mode-pref") || "light";
    if (["light", "dark", "auto"].indexOf(pref) < 0) pref = "light";
    var accent = htmlEl.getAttribute("data-accent") || "blue";
    if (!ACCENT_LABEL[accent]) accent = "blue";

    function resolved() {
      if (pref !== "auto") return pref;
      return mqDark && mqDark.matches ? "dark" : "light";
    }
    function paintMode() {
      var mode = resolved();
      win.setAttribute("data-mode", mode);
      win.setAttribute("data-mode-pref", pref);
      radios.forEach(function (r) {
        var on = r.getAttribute("data-value") === pref;
        r.setAttribute("aria-checked", on ? "true" : "false");
        r.setAttribute("tabindex", on ? "0" : "-1");
        if (r.getAttribute("data-value") === "auto") r.setAttribute("aria-label", "自动，跟随系统：" + LABEL[resolved()]);
      });
      if (modeNote) modeNote.textContent = pref === "auto" ? "跟随系统，当前为" + LABEL[mode] : "已固定为" + LABEL[mode];
    }
    /* 强调色写在整个样例上（控件的选中圈和小窗一起换），明暗只写在小窗上 */
    function paintAccent() {
      root.setAttribute("data-accent", accent);
      dots.forEach(function (d) { d.setAttribute("aria-pressed", d.getAttribute("data-ix-accent") === accent ? "true" : "false"); });
    }
    function setMode(next, announce) {
      if (next === pref) return;
      pref = next;
      paintMode();
      if (announce) say(live, pref === "auto" ? "样例外观已切换为自动，跟随系统：" + LABEL[resolved()] : "样例外观已切换为" + LABEL[pref]);
    }
    function setAccent(next, announce) {
      if (next === accent) return;
      accent = next;
      paintAccent();
      if (announce) say(live, "样例强调色已切换为" + ACCENT_LABEL[accent]);
    }
    paintMode();
    paintAccent();
    if (mqDark) {
      var onSys = function () { if (pref === "auto") paintMode(); };
      if (typeof mqDark.addEventListener === "function") mqDark.addEventListener("change", onSys);
      else if (typeof mqDark.addListener === "function") mqDark.addListener(onSys);
    }

    seg.addEventListener("click", function (event) {
      var r = event.target.closest("[role='radio']");
      if (r) setMode(r.getAttribute("data-value"), true);
    });
    dotsEl.addEventListener("click", function (event) {
      var d = event.target.closest("[data-ix-accent]");
      if (d) setAccent(d.getAttribute("data-ix-accent"), true);
    });

    /* 键盘（照刷刷 app.js「外观控件的键盘操作」）：←/→ 在组内循环并把焦点带过去，Home/End 跳首尾；
       明暗那组是 radiogroup，↑/↓ 同样能换；色点是普通按钮组，↑/↓ 留给页面滚动。 */
    root.addEventListener("keydown", function (event) {
      if (event.isComposing || event.keyCode === 229) return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      var keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
      if (keys.indexOf(event.key) < 0) return;
      var radio = event.target.closest("[role='radio']");
      var dot = event.target.closest("[data-ix-accent]");
      if (!radio && !dot) return;
      if (dot && (event.key === "ArrowUp" || event.key === "ArrowDown")) return;
      var group = radio ? radios : dots;
      var index = group.indexOf(radio || dot);
      if (index < 0) return;
      /* 外壳 star.js 在 document 上也接单选组的方向键，见到 defaultPrevented 就不再处理：同一下按键只处理一遍 */
      event.preventDefault();
      var next = event.key === "Home" ? 0
        : event.key === "End" ? group.length - 1
        : (index + (event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1) + group.length) % group.length;
      var target = group[next];
      if (radio) setMode(target.getAttribute("data-value"), true);
      else setAccent(target.getAttribute("data-ix-accent"), true);
      target.focus();
    });
  }

  /* ================================================================
   * 分组列表：点一行就在下面说打开了哪一行（样例里没有真的去处）
   * ================================================================ */
  function initList() {
    var root = $("[data-demo='list']");
    if (!root) return;
    var out = $(".ixl-out", root);
    root.addEventListener("click", function (event) {
      var row = event.target.closest(".ixl-row");
      if (!row) return;
      out.textContent = "打开了「" + $(".ixl-title", row).textContent + "」";
    });
  }

  /* ================================================================
   * 小屋：墙壁开关（只切样框自己的 data-mode）
   * ================================================================ */
  function initWallSwitch() {
    var root = $("[data-demo='wall-switch']");
    if (!root) return;
    var sw = $(".ixw-switch", root);
    var frame = root.closest(".xw") || root;
    var start = doc.documentElement.getAttribute("data-mode") === "dark";
    function paint(dark) {
      frame.setAttribute("data-mode", dark ? "dark" : "light");
      sw.setAttribute("aria-checked", dark ? "true" : "false");
      sw.setAttribute("aria-label", "夜间模式");   // 名字固定，开没开由 aria-checked 读（同小屋 theme-toggle.tsx）
      sw.setAttribute("title", dark ? "开灯" : "关灯");
    }
    paint(start);
    sw.addEventListener("click", function () {
      paint(sw.getAttribute("aria-checked") !== "true");
    });
  }

  /* ================================================================
   * 通用：输入法回车的事件记录
   * ================================================================ */
  function initIme() {
    var root = $("[data-demo='ime']");
    if (!root) return;
    var form = $(".ixi-form", root);
    var input = $(".ixi-input", root);
    var log = $(".ixi-log", root);
    var imeKeyDown = false;
    function write(text, cls) {
      var li = doc.createElement("li");
      li.textContent = text;
      if (cls) li.className = cls;
      log.insertBefore(li, log.firstChild);
      while (log.children.length > 5) log.removeChild(log.lastChild);
    }
    input.addEventListener("keydown", function (event) {
      imeKeyDown = Boolean(event.isComposing);
      /* 只记回车那一下（按物理键认：输入法经手时 key 可能是 "Process"） */
      var enter = event.key === "Enter" || event.code === "Enter" || event.code === "NumpadEnter";
      if (!enter) return;
      if (event.isComposing || event.keyCode === 229) {
        write("keydown " + event.key + "  isComposing=" + event.isComposing + "  keyCode=" + event.keyCode + "  → 归输入法，不处理", "is-ime");
      } else {
        write("keydown Enter  isComposing=false  keyCode=" + event.keyCode + "  → 放行给表单");
      }
    });
    input.addEventListener("keyup", function () { imeKeyDown = false; });
    input.addEventListener("blur", function () { imeKeyDown = false; });
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (imeKeyDown) { write("submit  → 拦下：这一下回车是选词", "is-ime"); return; }
      var v = input.value.trim();
      write(v ? "submit  → 已提交「" + v + "」" : "submit  → 框里是空的，什么都不做", "is-ok");
      input.value = "";
    });
  }

  /* ================================================================
   * 通用：老站透明导航栏的「去掉黑罩」开关
   * aria-pressed 按钮；只改舞台上的 data-overlay，CSS 那边只渐黑罩的 opacity（减弱动效下外壳关掉过渡，瞬切）。
   * 对比度数字是 1440×900 像素实测（条目「数值 / 代码」里有全表）。
   * ================================================================ */
  function initOldNav() {
    var root = $("[data-demo='oldnav']");
    if (!root) return;
    var btn = $(".ixn-toggle", root);
    var stage = $(".oldnav", root);
    var state = $(".ixn-state", root);
    if (!btn || !stage) return;
    var TEXT = {
      on: "黑罩开着：半透明白链接对比度中位4.8–5.2，刚过4.5",
      off: "黑罩去掉：同一批链接中位只剩2.8–4.0，最差5%低到2.35"
    };
    function paint(bare, announce) {
      btn.setAttribute("aria-pressed", bare ? "true" : "false");
      stage.setAttribute("data-overlay", bare ? "off" : "on");
      if (state) state.textContent = bare ? TEXT.off : TEXT.on;
      if (announce && window.StarShell && window.StarShell.announce) window.StarShell.announce(bare ? TEXT.off : TEXT.on);
    }
    paint(false, false);
    btn.addEventListener("click", function () {
      paint(btn.getAttribute("aria-pressed") !== "true", true);
    });
  }

  /* ================================================================
   * 2026-10-08 补演示：原来只有文字的8条
   * 屋主原话：「star里面，每一个提到的设计都需要在旁边可以现场演示出来效果的，这样子才知道是什么样子」。
   * 共同：结果走外壳那条 aria-live（StarShell.announce）；凡处理回车 / Esc / 方向键的 keydown，第一行先判合成态；
   * 浮层都在样例框里 absolute；减弱动效下不起动画、直接到位；数据全是示例。
   * ================================================================ */
  function announce(text) {
    if (window.StarShell && window.StarShell.announce) window.StarShell.announce(text);
  }
  function composing(e) { return !!(e.isComposing || e.keyCode === 229); }
  function reflow(el) { return el.getBoundingClientRect(); }
  /* cubic-bezier → 缓动函数（牛顿法 + 二分兜底）：灯箱每帧的裁切要在脚本里按缓动算好 */
  function bezier(x1, y1, x2, y2) {
    function a(p1, p2) { return 1 - 3 * p2 + 3 * p1; }
    function b(p1, p2) { return 3 * p2 - 6 * p1; }
    function c(p1) { return 3 * p1; }
    function at(t, p1, p2) { return ((a(p1, p2) * t + b(p1, p2)) * t + c(p1)) * t; }
    function slope(t, p1, p2) { return 3 * a(p1, p2) * t * t + 2 * b(p1, p2) * t + c(p1); }
    return function (x) {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      var t = x;
      for (var i = 0; i < 8; i++) {
        var d = at(t, x1, x2) - x;
        if (Math.abs(d) < 1e-6) return at(t, y1, y2);
        var s = slope(t, x1, x2);
        if (Math.abs(s) < 1e-6) break;
        t -= d / s;
      }
      var lo = 0, hi = 1;
      t = x;
      for (var j = 0; j < 40; j++) {
        var v = at(t, x1, x2);
        if (Math.abs(v - x) < 1e-6) break;
        if (v < x) lo = t; else hi = t;
        t = (lo + hi) / 2;
      }
      return at(t, y1, y2);
    };
  }
  /* 页面自己的单选组：点了选中（方向键由 star.js 统一处理：移动后 click 选中，这里只管 click） */
  function radios(group, onPick) {
    var items = $$('[role="radio"]', group);
    function pick(btn) {
      items.forEach(function (b) {
        var on = b === btn;
        b.setAttribute("aria-checked", on ? "true" : "false");
        b.setAttribute("tabindex", on ? "0" : "-1");
      });
      onPick(btn.getAttribute("data-v"), btn);
    }
    items.forEach(function (b) { b.addEventListener("click", function () { if (b.getAttribute("aria-checked") !== "true") pick(b); }); });
    return pick;
  }
  function logTo(list, text, cls, max) {
    var li = doc.createElement("li");
    li.textContent = text;
    if (cls) li.className = cls;
    list.insertBefore(li, list.firstChild);
    while (list.children.length > (max || 8)) list.removeChild(list.lastChild);
  }
  function togglePressed(btn) {
    var on = btn.getAttribute("aria-pressed") !== "true";
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    return on;
  }

  /* ================================================================
   * 灯箱原位放大 / 缩回 + 复制气泡（岗岗 design-proposal 12.2、12.3）
   * 幽灵：外框从缩略图「看得见的那块」非等比缩放到大图框（当裁切），内图在外框坐标里反向缩放、始终按原图比例；
   * 两只框每帧在脚本里按缓动算好，关键帧之间 linear（开20帧、关15帧）。只动 transform / opacity。
   * 比例差2%以上 → 只淡入；关的时候缩略图不完整可见（被滚出正文框）→ 只淡出；动画中途再关 → 直接到终态。
   * ================================================================ */
  function initLightbox() {
    var root = $("[data-demo='lightbox']");
    if (!root) return;
    var reader = $(".ixlb-reader", root);
    var page = $(".ixlb-page", root);
    var scrim = $(".ixlb-scrim", root);
    var box = $(".ixlb-box", root);
    var big = $(".ixlb-big", root);
    var bigShot = $(".ixlb-shot", big);
    var cap = $(".ixlb-cap", root);
    var closeBtn = $(".ixlb-close", root);
    var instantBtn = $("[data-lb-instant]", root);
    var r1 = $("[data-lb-r1]", root);
    var r2 = $("[data-lb-r2]", root);
    var NAMES = ["申请表", "系统录入页", "回执"];
    var OPEN_MS = 260, CLOSE_MS = 200, OPEN_FRAMES = 20, CLOSE_FRAMES = 15;
    var ease = bezier(.2, .8, .2, 1);
    var state = "closed";
    var opener = null;
    var anims = [];
    var ghost = null;
    var finish = null;
    var gen = 0;   /* 每次清场换一代：取消动画会让它的 finished 走 reject，上一代的收尾照样会跑，不作废就会把已收起的灯箱改回 open */
    var B = null;

    function instant() { return instantBtn.getAttribute("aria-pressed") === "true"; }
    function rel(el) {
      var R = reader.getBoundingClientRect();
      var r = el.getBoundingClientRect();
      return { x: r.left - R.left, y: r.top - R.top, w: r.width, h: r.height };
    }
    function layoutBig() {
      var w0 = reader.clientWidth, h0 = reader.clientHeight;
      var w = Math.min(w0 * 0.84, h0 * 0.72 * 4 / 3);
      var h = w * 3 / 4;
      B = { x: (w0 - w) / 2, y: (h0 - h) / 2 - h0 * 0.03, w: w, h: h };
      big.style.left = B.x + "px";
      big.style.top = B.y + "px";
      big.style.width = B.w + "px";
      big.style.height = B.h + "px";
    }
    function lerp(a, b, p) { return { x: a.x + (b.x - a.x) * p, y: a.y + (b.y - a.y) * p, w: a.w + (b.w - a.w) * p, h: a.h + (b.h - a.h) * p }; }
    function frames(fromClip, fromImg, toClip, toImg, n) {
      var outer = [], inner = [];
      for (var i = 0; i <= n; i++) {
        var p = ease(i / n);
        var c = lerp(fromClip, toClip, p);
        var m = lerp(fromImg, toImg, p);
        var sx = c.w / B.w, sy = c.h / B.h;
        outer.push({ transform: "translate(" + (c.x - B.x) + "px," + (c.y - B.y) + "px) scale(" + sx + "," + sy + ")" });
        inner.push({ transform: "translate(" + (m.x - c.x) / sx + "px," + (m.y - c.y) / sy + "px) scale(" + m.w / (B.w * sx) + "," + m.h / (B.h * sy) + ")" });
      }
      return { outer: outer, inner: inner };
    }
    function makeGhost(kind) {
      var g = doc.createElement("div");
      g.className = "ixlb-ghost";
      g.setAttribute("aria-hidden", "true");
      g.style.left = B.x + "px";
      g.style.top = B.y + "px";
      g.style.width = B.w + "px";
      g.style.height = B.h + "px";
      var s = bigShot.cloneNode(true);
      s.setAttribute("data-kind", String(kind));
      s.style.width = B.w + "px";
      s.style.height = B.h + "px";
      g.appendChild(s);
      reader.appendChild(g);
      return g;
    }
    function current(fn) { var g = gen; return function () { if (g === gen) fn(); }; }
    function cleanup() {
      gen += 1;
      anims.forEach(function (a) { try { a.cancel(); } catch (e) { /* 已经结束 */ } });
      anims = [];
      if (ghost && ghost.parentNode) ghost.parentNode.removeChild(ghost);
      ghost = null;
      box.classList.remove("is-morphing");
      finish = null;
    }
    function hideNow() {
      cleanup();
      box.hidden = true;
      scrim.hidden = true;
      state = "closed";
      if (opener) opener.focus({ preventScroll: true });
    }
    function sameRatio(a, b) { return a.h > 0 && b.h > 0 && Math.abs(a.w / a.h - b.w / b.h) / (b.w / b.h) <= 0.02; }
    function fade(el, from, to, ms) { return el.animate([{ opacity: from }, { opacity: to }], { duration: ms, easing: "linear", fill: "forwards" }); }

    function open(thumb) {
      if (state !== "closed") { if (finish) finish(); cleanup(); box.hidden = true; scrim.hidden = true; state = "closed"; }
      opener = thumb;
      var idx = Number(thumb.getAttribute("data-shot")) || 0;
      bigShot.setAttribute("data-kind", String(idx));
      cap.textContent = "截图" + (idx + 1) + " · " + NAMES[idx] + "（示例）";
      layoutBig();
      scrim.hidden = false;
      box.hidden = false;
      closeBtn.focus({ preventScroll: true });
      announce("已放大截图" + (idx + 1) + "：" + NAMES[idx] + "（示例）");
      if (instant() || reduced() || !canAnimate) {
        state = "open";
        r1.textContent = instant() ? "灯箱：整块瞬间出现（改版前，示意）。" : "灯箱：减弱动效，瞬开。";
        return;
      }
      state = "opening";
      var clip = rel(thumb), img = rel($(".ixlb-shot", thumb));
      if (!clip.w || !clip.h || !sameRatio(img, B)) {
        anims = [fade(scrim, 0, 1, OPEN_MS), fade(box, 0, 1, OPEN_MS)];
        finish = settle(anims[1], OPEN_MS + 120, current(function () { cleanup(); state = "open"; }));
        r1.textContent = "灯箱：比例对不上，只淡入。";
        return;
      }
      ghost = makeGhost(idx);
      box.classList.add("is-morphing");
      var f = frames(clip, img, B, B, OPEN_FRAMES);
      var opts = { duration: OPEN_MS, easing: "linear", fill: "forwards" };
      anims = [ghost.animate(f.outer, opts), ghost.firstChild.animate(f.inner, opts), fade(scrim, 0, 1, OPEN_MS), fade(cap, 0, 1, OPEN_MS), fade(closeBtn, 0, 1, OPEN_MS)];
      finish = settle(anims[0], OPEN_MS + 120, current(function () { cleanup(); state = "open"; }));
      r1.textContent = "灯箱：从缩略图原位放大（" + OPEN_MS + "ms，" + OPEN_FRAMES + "帧，每帧的裁切在脚本里算好）。";
    }
    function fullyVisible(el) {
      var r = el.getBoundingClientRect(), p = page.getBoundingClientRect();
      var vh = window.innerHeight || doc.documentElement.clientHeight;
      return r.width > 0 && r.top >= p.top - 0.5 && r.bottom <= p.bottom + 0.5 && r.left >= p.left - 0.5 && r.right <= p.right + 0.5 && r.top >= 0 && r.bottom <= vh;
    }
    function close() {
      if (state === "closed") return;
      announce("已关闭大图");
      if (state === "opening" || state === "closing") {
        hideNow();
        r1.textContent = "灯箱：动画中途又关，直接到终态，不倒着缩回去。";
        return;
      }
      if (instant() || reduced() || !canAnimate) {
        hideNow();
        r1.textContent = instant() ? "灯箱：整块瞬间消失（改版前，示意），焦点回到缩略图。" : "灯箱：减弱动效，瞬关，焦点回到缩略图。";
        return;
      }
      state = "closing";
      if (!opener || !fullyVisible(opener)) {
        anims = [fade(box, 1, 0, CLOSE_MS), fade(scrim, 1, 0, CLOSE_MS)];
        finish = settle(anims[0], CLOSE_MS + 120, current(hideNow));
        r1.textContent = "灯箱：缩略图看不全，只淡出（" + CLOSE_MS + "ms），焦点回到缩略图。";
        return;
      }
      var clip = rel(opener), img = rel($(".ixlb-shot", opener));
      ghost = makeGhost(Number(opener.getAttribute("data-shot")) || 0);
      box.classList.add("is-morphing");
      var f = frames(B, B, clip, img, CLOSE_FRAMES);
      var opts = { duration: CLOSE_MS, easing: "linear", fill: "forwards" };
      anims = [ghost.animate(f.outer, opts), ghost.firstChild.animate(f.inner, opts), fade(scrim, 1, 0, CLOSE_MS), fade(cap, 1, 0, CLOSE_MS), fade(closeBtn, 1, 0, CLOSE_MS)];
      finish = settle(anims[0], CLOSE_MS + 120, current(hideNow));
      r1.textContent = "灯箱：缩回原位（" + CLOSE_MS + "ms，" + CLOSE_FRAMES + "帧），焦点回到缩略图。";
    }
    page.addEventListener("click", function (e) {
      var t = e.target.closest ? e.target.closest(".ixlb-thumb") : null;
      if (t) open(t);
    });
    closeBtn.addEventListener("click", close);
    scrim.addEventListener("click", close);
    root.addEventListener("keydown", function (e) {
      if (box.hidden || composing(e)) return;
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key === "Tab") { e.preventDefault(); closeBtn.focus({ preventScroll: true }); }
    });
    window.addEventListener("resize", function () { if (state === "open") layoutBig(); });
    instantBtn.addEventListener("click", function () {
      var on = togglePressed(instantBtn);
      announce(on ? "改版前：整块瞬间出现（示意）" : "现行：原位放大、缩回原位");
    });

    /* 复制气泡：插入后量一次；左右离裁切它的祖先边不足4px就整体平移回来，箭头按同一个量反向移、仍指着徽章中心；
       上方被吸顶栏挡住就翻到下方。1400ms 后淡出140ms再删（animationend + 兜底计时器）；读屏只走外壳那条 live。 */
    var codes = $(".ixlb-codes", root);
    var head = $(".ixlb-codes-head", root);
    var bub = null, bubTimer = 0;
    function dropBubble() {
      clearTimeout(bubTimer);
      if (bub && bub.parentNode) bub.parentNode.removeChild(bub);
      bub = null;
    }
    function showBubble(btn, text) {
      dropBubble();
      var el = doc.createElement("span");
      el.className = "ixlb-bubble";
      el.setAttribute("aria-hidden", "true");
      el.textContent = text;
      codes.appendChild(el);
      var C = codes.getBoundingClientRect(), Bt = btn.getBoundingClientRect(), H = head.getBoundingClientRect();
      var w = el.offsetWidth, h = el.offsetHeight, GAP = 8, EDGE = 4;
      var want = Bt.left + Bt.width / 2 - C.left - w / 2;
      var left = clamp(want, EDGE, Math.max(EDGE, C.width - w - EDGE));
      var shift = left - want;
      var ax = clamp(w / 2 - shift, 10, w - 10);
      var above = Bt.top - C.top - GAP - h;
      var below = above < H.bottom - C.top;
      el.style.left = left + "px";
      el.style.top = (below ? Bt.bottom - C.top + GAP : above) + "px";
      el.style.setProperty("--ax", ax + "px");
      if (below) el.classList.add("is-below");
      bub = el;
      var s = Math.round(Math.abs(shift));
      r2.textContent = "气泡：" + (s ? (shift > 0 ? "往右" : "往左") + "躲了" + s + "px，箭头反向移" + s + "px、仍指着「" + btn.getAttribute("data-code") + "」" : "居中，不用躲") +
        (below ? "；上方被吸顶栏挡住，翻到下方。" : "；在上方。");
      var reduce = reduced();
      bubTimer = setTimeout(function () {
        if (bub !== el) return;
        if (reduce) { dropBubble(); return; }
        el.classList.add("is-leaving");
        settle(null, 140 + 60, function () { if (bub === el) dropBubble(); });
        el.addEventListener("animationend", function () { if (bub === el) dropBubble(); });
      }, 1400);
    }
    codes.addEventListener("click", function (e) {
      var btn = e.target.closest ? e.target.closest(".ixlb-code") : null;
      if (!btn) return;
      var code = btn.getAttribute("data-code");
      var p = window.StarShell && window.StarShell.copy ? window.StarShell.copy(code) : Promise.reject(new Error("no copy"));
      p.then(function () { showBubble(btn, "已复制" + code); announce("已复制" + code); },
        function () { showBubble(btn, "请手动复制" + code); announce("复制失败，请手动复制" + code); });
    });
  }

  /* ================================================================
   * 详情：居中对话框 vs 右侧第三栏（plan BUSINESS_LOGIC 25.2）
   * 对话框 scale(.96)→1 + 淡入 240ms cubic-bezier(.32,.72,0,1)；Esc / 关闭 / 点遮罩关，焦点还回那一行；Tab 在框内转圈。
   * 第三栏是被否的做法（示意）：读数里数一下名字被截断了几处（scrollWidth > clientWidth）。
   * ================================================================ */
  function initDialog() {
    var root = $("[data-demo='dialog']");
    if (!root) return;
    var screen = $(".ixd-screen", root);
    var rows = $$(".ixd-row", root);
    var col = $(".ixd-col", root);
    var colEmpty = $(".ixd-col-empty", root);
    var colBody = $(".ixd-col-body", root);
    var scrim = $(".ixd-scrim", root);
    var dlg = $(".ixd-dlg", root);
    var dlgBody = $(".ixd-dlg-body", root);
    var title = $(".ixd-dlg-title", root);
    var xBtn = $(".ixd-x", root);
    var doneBtn = $(".ixd-done", root);
    var readout = $("[data-d-readout]", root);
    var TASKS = [
      { name: "年度体检预约", stages: [["预约体检中心", "10/1–10/4"], ["发通知并收集回执", "10/5–10/9"], ["汇总名单报给人事", "10/10–10/13"]], mats: ["体检名单", "预约确认单", "回执汇总表"] },
      { name: "季度活动报名", stages: [["确定场地和日期", "10/2–10/6"], ["发通知并收集报名", "10/7–10/12"], ["整理名单并订餐", "10/13–10/17"]], mats: ["场地合同", "报名表"] },
      { name: "办公室搬迁", stages: [["清点家具和设备", "10/8–10/15"], ["联系搬家公司比价", "10/16–10/22"], ["打包并贴好标签", "10/23–10/28"]], mats: ["资产清单", "报价单", "标签模板"] }
    ];
    var DOTS = ["var(--accent)", "var(--orange)", "var(--green)"];
    var layout = "dialog", current = -1, opener = null, timer = 0;

    function detail(t, withTitle) {
      var h = withTitle ? '<p class="ixd-d-title">' + esc(t.name) + "</p>" : "";
      h += '<div><p class="ixd-d-sub">阶段</p><ul class="ixd-d-list">';
      t.stages.forEach(function (s, i) { h += '<li style="--c:' + DOTS[i] + '"><i></i><span class="ixd-name">' + esc(s[0]) + "</span><small>" + esc(s[1]) + "</small></li>"; });
      h += '</ul></div><div><p class="ixd-d-sub">材料</p><ul class="ixd-d-list">';
      t.mats.forEach(function (m) { h += '<li style="--c:var(--label3)"><i></i><span class="ixd-name">' + esc(m) + "</span></li>"; });
      return h + "</ul></div>";
    }
    function cut(scope) {
      return $$(".ixd-name", scope).filter(function (n) { return n.scrollWidth > n.clientWidth + 0.5; }).length;
    }
    function paintCol() {
      if (current < 0) {
        colEmpty.hidden = false;
        colBody.hidden = true;
        readout.textContent = "右侧第三栏（示意）：点一行任务，详情挤进右边这条窄栏。";
        return;
      }
      colEmpty.hidden = true;
      colBody.hidden = false;
      colBody.innerHTML = detail(TASKS[current], true);
      readout.textContent = "右侧第三栏（示意）：「" + TASKS[current].name + "」的名字被截断" + cut(colBody) + "处，主区右边空着一大片。";
    }
    function closeDlg(silent) {
      if (dlg.hidden) return;
      scrim.classList.remove("is-on");
      dlg.classList.remove("is-on");
      clearTimeout(timer);
      timer = setTimeout(function () { dlg.hidden = true; scrim.hidden = true; }, 260);
      if (opener) opener.focus({ preventScroll: true });
      if (!silent && current >= 0) {
        readout.textContent = "居中对话框：关上了，焦点回到「" + TASKS[current].name + "」那一行。";
        announce("已关闭详情，焦点回到「" + TASKS[current].name + "」");
      }
    }
    function openDlg(i, row) {
      clearTimeout(timer);
      current = i;
      opener = row;
      title.textContent = TASKS[i].name;
      dlgBody.innerHTML = detail(TASKS[i], false);
      scrim.hidden = false;
      dlg.hidden = false;
      reflow(dlg);
      scrim.classList.add("is-on");
      dlg.classList.add("is-on");
      xBtn.focus({ preventScroll: true });
      readout.textContent = "居中对话框：「" + TASKS[i].name + "」的名字截断" + cut(dlgBody) + "处，长名字可以折行；正文分两列，只有正文区滚动。";
      announce("已打开详情：" + TASKS[i].name);
    }
    radios($(".ixd-seg", root), function (v) {
      closeDlg(true);
      layout = v;
      screen.setAttribute("data-layout", v);
      col.hidden = v !== "column";
      rows.forEach(function (r, i) {
        if (v === "column" && i === current) r.setAttribute("aria-current", "true");
        else r.removeAttribute("aria-current");
      });
      if (v === "column") paintCol();
      else readout.textContent = "居中对话框：点一行任务看详情。";
      announce(v === "column" ? "已切到右侧第三栏（示意）" : "已切到居中对话框");
    });
    rows.forEach(function (row, i) {
      row.addEventListener("click", function () {
        if (layout === "dialog") { openDlg(i, row); return; }
        current = i;
        rows.forEach(function (r) { r.removeAttribute("aria-current"); });
        row.setAttribute("aria-current", "true");
        paintCol();
        announce("第三栏显示「" + TASKS[i].name + "」");
      });
    });
    xBtn.addEventListener("click", function () { closeDlg(); });
    scrim.addEventListener("click", function () { closeDlg(); });
    doneBtn.addEventListener("click", function () {
      announce("示例：「" + TASKS[current].name + "」标记完成");
      closeDlg();
    });
    root.addEventListener("keydown", function (e) {
      if (dlg.hidden || !dlg.classList.contains("is-on") || composing(e)) return;
      if (e.key === "Escape") { e.preventDefault(); closeDlg(); return; }
      if (e.key === "Tab") {
        var f = [xBtn, doneBtn];
        var i = f.indexOf(doc.activeElement);
        e.preventDefault();
        f[e.shiftKey ? (i <= 0 ? f.length - 1 : i - 1) : (i + 1) % f.length].focus({ preventScroll: true });
      }
    });
    window.addEventListener("resize", function () { if (layout === "column" && current >= 0) paintCol(); });
  }

  /* ================================================================
   * 小屋：每个工具恰好一个Tab位。计数器数「这一遍」Tab在卡上停了几次（焦点从卡外进来就重新数）。
   * 反例（示意）：图、序号、标题、规格条都加 tabindex，一张卡变成五个Tab位。
   * ================================================================ */
  function initTabstop() {
    var root = $("[data-demo='tabstop']");
    if (!root) return;
    var card = $(".ixts-card", root);
    var start = $(".ixts-start", root);
    var count = $("[data-ts-count]", root);
    var trail = $("[data-ts-trail]", root);
    var openLink = $("[data-ts-open]", root);
    var art = $(".ixts-art", root);
    var stops = $$("[data-stop]", card);
    var pass = [];
    function paint() {
      count.textContent = String(pass.length);
      count.classList.toggle("is-many", pass.length > 1);
      trail.textContent = pass.length ? "停过：" + pass.join(" → ") : "停过：还没开始";
    }
    radios($(".ixts-seg", root), function (v) {
      var many = v === "many";
      stops.forEach(function (el) { if (many) el.setAttribute("tabindex", "0"); else el.removeAttribute("tabindex"); });
      if (many) { art.removeAttribute("aria-hidden"); art.setAttribute("role", "img"); art.setAttribute("aria-label", "刷刷配图（示例）"); }
      else { art.setAttribute("aria-hidden", "true"); art.removeAttribute("role"); art.removeAttribute("aria-label"); }
      pass = [];
      paint();
      announce(many ? "反例：整张卡多个可聚焦（示意）" : "现行：只有「打开刷刷」可聚焦");
    });
    start.addEventListener("click", function () {
      start.focus();
      pass = [];
      paint();
      announce("从这里开始按Tab");
    });
    card.addEventListener("focusin", function (e) {
      if (!card.contains(e.relatedTarget)) pass = [];
      pass.push(e.target.getAttribute("data-stop") || "打开刷刷");
      paint();
    });
    card.addEventListener("focusout", function (e) {
      if (card.contains(e.relatedTarget)) return;
      if (pass.length) announce("这一遍Tab在卡上停了" + pass.length + "次");
    });
    openLink.addEventListener("click", function (e) {
      e.preventDefault();
      announce("示例链接：真的小屋会在新标签页打开刷刷");
    });
    paint();
  }

  /* ================================================================
   * 小屋：随笔球（轻量示意，不是原物：CSS 3D，不嵌 WebGL）
   * 约80秒一圈；按着、鼠标停在卡上、键盘焦点在球里时停，放开后慢慢恢复。
   * 按下到松开位移 ≤4px（触摸 ≤8px）才算点击；俯仰限位 ±0.7 弧度；松手按最后100ms的速度带惯性；
   * 触摸只认横向；第二根手指落下作废这次拖拽。键盘 ←→ 换一张并转到正面，回车打开。
   * 不在视口、标签页在后台时不跑 rAF；减弱动效：不自转、不带惯性、转到正面瞬切。
   * ================================================================ */
  function initGlobe() {
    var root = $("[data-demo='globe']");
    if (!root || !window.requestAnimationFrame) return;
    var stage = $(".ixg-stage", root);
    var ball = $(".ixg-ball", root);
    var cards = $$(".ixg-card", ball);
    if (!cards.length) return;
    var out = {};
    ["spin", "dist", "verdict", "opened"].forEach(function (k) { out[k] = $("[data-g='" + k + "']", root); });
    var N = cards.length, TAU = Math.PI * 2, SPIN = TAU / 80, PITCH_MAX = 0.7, K = 0.0085;
    var pos = cards.map(function (c, i) {
      var lat = Math.asin(1 - (i + 0.5) * 2 / N) * 0.75;
      var lon = (i * 137.508 * Math.PI / 180) % TAU;
      c.style.transform = "rotateY(" + lon.toFixed(4) + "rad) rotateX(" + lat.toFixed(4) + "rad) translateZ(var(--ixg-r))";
      c.setAttribute("tabindex", i === 0 ? "0" : "-1");
      return { lat: lat, lon: lon };
    });
    stage.classList.add("is-live");
    var yaw = 0, pitch = -0.12, vel = 0, spin = reduced() ? 0 : 1, target = null;
    var pressed = null, hovering = false, focusIn = false, visible = true, raf = 0, last = 0, spinText = "", suppress = false, cur = 0;
    var lastOp = [];
    var fine = false;
    try { fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches; } catch (e) { fine = false; }

    function apply() {
      ball.style.transform = "rotateX(" + pitch.toFixed(4) + "rad) rotateY(" + yaw.toFixed(4) + "rad)";
      var sp = Math.sin(pitch), cp = Math.cos(pitch);
      for (var i = 0; i < N; i++) {
        var f = -Math.sin(pos[i].lat) * sp + Math.cos(pos[i].lat) * Math.cos(pos[i].lon + yaw) * cp;
        var o = f <= 0.02 ? 0 : Math.round(Math.min(1, 0.3 + f) * 50) / 50;
        if (lastOp[i] !== o) {
          lastOp[i] = o;
          cards[i].style.opacity = String(o);
          cards[i].style.pointerEvents = f > 0.2 ? "" : "none";
        }
      }
    }
    function setSpin(t) { if (t !== spinText) { spinText = t; out.spin.textContent = t; } }
    function stopReason() {
      if (reduced()) return "减弱动效：不自转";
      if (pressed) return "停了：手按着";
      if (focusIn) return "停了：键盘焦点在球里";
      if (hovering) return "停了：鼠标停在卡上";
      return "";
    }
    function verdict(text, cls) { out.verdict.textContent = text; out.verdict.className = cls || ""; }
    function frame(now) {
      raf = 0;
      var dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      var why = stopReason();
      var want = why ? 0 : 1;
      spin += (want - spin) * Math.min(1, dt * (want ? 0.9 : 8));
      if (Math.abs(want - spin) < 0.003) spin = want;
      setSpin(why || (spin < 0.97 ? "慢慢恢复自转" : "转着（约80秒一圈）"));
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
      apply();
      if (visible && !doc.hidden && (spin > 0 || vel || target)) raf = requestAnimationFrame(frame);
      else last = 0;
    }
    function kick() {
      if (raf || !visible || doc.hidden) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    }
    function rotateTo(i) {
      var p = pos[i];
      var ty = -p.lon;
      ty += Math.round((yaw - ty) / TAU) * TAU;
      var tp = clamp(-p.lat, -PITCH_MAX, PITCH_MAX);
      vel = 0;
      if (reduced()) { yaw = ty; pitch = tp; target = null; apply(); return; }
      target = { yaw: ty, pitch: tp };
      kick();
    }
    function openCard(c) {
      cards.forEach(function (x) { x.classList.toggle("is-opened", x === c); });
      var name = $("b", c).textContent;
      out.opened.textContent = "「" + name + "」（示例，不跳转）";
      announce("打开「" + name + "」（示例，不跳转）");
    }

    stage.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      if (pressed) {
        if (pressed.id !== e.pointerId) {
          pressed = null;
          stage.classList.remove("is-dragging");
          verdict("第二根手指落下，这次拖拽作废");
          kick();
        }
        return;
      }
      pressed = { id: e.pointerId, x0: e.clientX, y0: e.clientY, lx: e.clientX, ly: e.clientY, type: e.pointerType, card: e.target.closest ? e.target.closest(".ixg-card") : null, samples: [{ t: performance.now(), x: e.clientX }] };
      target = null;
      vel = 0;
      try { stage.setPointerCapture(e.pointerId); } catch (err) { /* 拿不到捕获也能拖 */ }
      stage.classList.add("is-dragging");
      out.dist.textContent = "0px";
      kick();
    });
    stage.addEventListener("pointermove", function (e) {
      if (!pressed || e.pointerId !== pressed.id) return;
      var dx = e.clientX - pressed.lx, dy = e.clientY - pressed.ly;
      pressed.lx = e.clientX;
      pressed.ly = e.clientY;
      yaw += dx * K;
      if (pressed.type !== "touch") pitch = clamp(pitch - dy * K, -PITCH_MAX, PITCH_MAX);
      var now = performance.now();
      pressed.samples.push({ t: now, x: e.clientX });
      while (pressed.samples.length > 2 && now - pressed.samples[0].t > 100) pressed.samples.shift();
      var d = Math.hypot(e.clientX - pressed.x0, e.clientY - pressed.y0);
      var thr = pressed.type === "touch" ? 8 : 4;
      out.dist.textContent = Math.round(d) + "px";
      verdict(d > thr ? "拖动中（已超过" + thr + "px）" : "还算点击（≤" + thr + "px）", d > thr ? "is-drag" : "is-click");
      apply();
    });
    function end(e, cancelled) {
      if (!pressed || e.pointerId !== pressed.id) return;
      var p = pressed;
      pressed = null;
      stage.classList.remove("is-dragging");
      if (cancelled) { verdict("取消了，不算点击也不算拖动"); kick(); return; }
      var d = Math.hypot(e.clientX - p.x0, e.clientY - p.y0);
      var thr = p.type === "touch" ? 8 : 4;
      out.dist.textContent = Math.round(d) + "px";
      suppress = true;
      setTimeout(function () { suppress = false; }, 0);
      if (d <= thr) {
        if (p.card) { verdict("点击（位移" + Math.round(d) + "px ≤ " + thr + "px）", "is-click"); openCard(p.card); }
        else verdict("点在空白处（位移" + Math.round(d) + "px），不打开");
      } else {
        var s = p.samples, a = s[0], b = s[s.length - 1];
        var span = (b.t - a.t) / 1000;
        vel = !reduced() && span > 0.01 ? clamp((b.x - a.x) * K / span, -6, 6) : 0;
        verdict("拖动（位移" + Math.round(d) + "px ＞ " + thr + "px），不算点击", "is-drag");
        announce("拖动：位移" + Math.round(d) + "像素，超过" + thr + "像素，不算点击");
      }
      kick();
    }
    stage.addEventListener("pointerup", function (e) { end(e, false); });
    stage.addEventListener("pointercancel", function (e) { end(e, true); });
    if (fine) {
      ball.addEventListener("pointerover", function (e) {
        if (e.pointerType === "mouse" && !pressed && e.target.closest && e.target.closest(".ixg-card")) { hovering = true; kick(); }
      });
      ball.addEventListener("pointerout", function (e) {
        var to = e.relatedTarget;
        if (e.pointerType === "mouse" && !(to && to.closest && to.closest(".ixg-card"))) { hovering = false; kick(); }
      });
    }
    ball.addEventListener("keydown", function (e) {
      if (composing(e)) return;
      var k = e.key, next = null;
      if (k === "ArrowRight" || k === "ArrowDown") next = cur + 1;
      else if (k === "ArrowLeft" || k === "ArrowUp") next = cur - 1;
      else if (k === "Home") next = 0;
      else if (k === "End") next = N - 1;
      if (next === null) return;
      e.preventDefault();
      cur = (next + N) % N;
      cards.forEach(function (c, j) { c.setAttribute("tabindex", j === cur ? "0" : "-1"); });
      cards[cur].focus({ preventScroll: true });
    });
    ball.addEventListener("focusin", function (e) {
      focusIn = true;
      var i = cards.indexOf(e.target);
      if (i >= 0) {
        cur = i;
        cards.forEach(function (c, j) { c.setAttribute("tabindex", j === cur ? "0" : "-1"); });
        if (!pressed) rotateTo(i);
      }
      kick();
    });
    ball.addEventListener("focusout", function (e) {
      if (ball.contains(e.relatedTarget)) return;
      focusIn = false;
      kick();
    });
    ball.addEventListener("click", function (e) {
      var c = e.target.closest ? e.target.closest(".ixg-card") : null;
      if (!c || suppress) return;
      verdict("键盘：回车／空格打开", "is-click");
      openCard(c);
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        visible = en[en.length - 1].isIntersecting;
        if (visible) kick();
      }).observe(stage);
    }
    doc.addEventListener("visibilitychange", function () { if (!doc.hidden) kick(); });
    if (mqReduce) {
      var onReduce = function () { if (reduced()) { spin = 0; vel = 0; } setSpin(stopReason() || "转着（约80秒一圈）"); kick(); };
      if (mqReduce.addEventListener) mqReduce.addEventListener("change", onReduce);
      else if (mqReduce.addListener) mqReduce.addListener(onReduce);
    }
    apply();
    setSpin(stopReason() || "转着（约80秒一圈）");
    kick();
  }

  /* ================================================================
   * Esc 一下只退一层（岗岗键盘分发：目录抽屉 → 联想浮层（字留着）→ 清空字 → 收起整行搜索）
   * 合成中的 Esc 是取消选词，不算关闭：真输入法认 isComposing / 229；演示用「模拟输入法组字中」开关代替。
   * ================================================================ */
  function initEsc() {
    var root = $("[data-demo='esc']");
    if (!root) return;
    var menu = $(".ixe-menu", root);
    var sbtn = $(".ixe-search", root);
    var row = $(".ixe-row", root);
    var input = $(".ixe-input", root);
    var pop = $(".ixe-pop", root);
    var ime = $(".ixe-ime", root);
    var scrim = $(".ixe-scrim", root);
    var drawer = $(".ixe-drawer", root);
    var links = $$(".ixe-link", root);
    var setupBtn = $(".ixe-setup", root);
    var imeBtn = $(".ixe-imetog", root);
    var stack = $(".ixe-stack", root);
    var log = $(".ixe-log", root);
    var DATA = ["存款开户", "存单挂失", "存折补办", "大额存单", "定期存单转存", "跨行转账", "挂失补办", "个人开户"];
    var active = -1, sim = false, drawerTimer = 0;

    function drawerOn() { return drawer.classList.contains("is-on"); }
    function layers() {
      var L = [];
      if (drawerOn()) L.push("目录抽屉");
      if (!pop.hidden) L.push("联想浮层（框里的字留着）");
      if (!row.hidden && input.value) L.push("框里的字「" + input.value + "」");
      if (!row.hidden) L.push("整行搜索");
      return L;
    }
    function paintStack() {
      var L = layers();
      stack.innerHTML = L.length ? L.map(function (t, i) {
        return "<li" + (i === 0 ? ' class="is-top"' : "") + "><span>" + esc(t) + "</span>" + (i === 0 ? "<small>下一下Esc退这层</small>" : "") + "</li>";
      }).join("") : '<li class="is-empty">什么都没叠，Esc没有可退的</li>';
    }
    function say(text, cls) { logTo(log, text, cls, 8); announce(text); }
    function closePop() {
      pop.hidden = true;
      input.setAttribute("aria-expanded", "false");
      input.removeAttribute("aria-activedescendant");
      active = -1;
      paintStack();
    }
    function renderPop() {
      var q = input.value.trim();
      if (!q) { closePop(); return; }
      var hits = DATA.filter(function (d) { return d.indexOf(q) >= 0; }).slice(0, 6);
      pop.innerHTML = hits.length ? hits.map(function (t, i) { return '<li role="option" id="ixe-opt-' + i + '" aria-selected="false">' + esc(t) + "</li>"; }).join("")
        : '<li role="option" id="ixe-opt-none" aria-disabled="true">没有「' + esc(q) + "」</li>";
      pop.hidden = false;
      input.setAttribute("aria-expanded", "true");
      input.removeAttribute("aria-activedescendant");
      active = -1;
      paintStack();
    }
    function openRow(focus) {
      row.hidden = false;
      sbtn.setAttribute("aria-expanded", "true");
      if (focus) input.focus({ preventScroll: true });
      paintStack();
    }
    function closeRow() {
      var inside = row.contains(doc.activeElement);
      closePop();
      row.hidden = true;
      sbtn.setAttribute("aria-expanded", "false");
      if (inside) sbtn.focus({ preventScroll: true });
      paintStack();
    }
    function openDrawer() {
      clearTimeout(drawerTimer);
      drawer.hidden = false;
      scrim.hidden = false;
      reflow(drawer);
      drawer.classList.add("is-on");
      scrim.classList.add("is-on");
      menu.setAttribute("aria-expanded", "true");
      links[0].focus({ preventScroll: true });
      paintStack();
    }
    function closeDrawer() {
      drawer.classList.remove("is-on");
      scrim.classList.remove("is-on");
      menu.setAttribute("aria-expanded", "false");
      clearTimeout(drawerTimer);
      drawerTimer = setTimeout(function () { if (!drawerOn()) { drawer.hidden = true; scrim.hidden = true; } }, reduced() ? 0 : 260);
      menu.focus({ preventScroll: true });
      paintStack();
    }
    function setSim(on) {
      sim = on;
      imeBtn.setAttribute("aria-pressed", on ? "true" : "false");
      if (on && row.hidden) openRow(false);
      ime.hidden = !on;
      if (on) input.focus({ preventScroll: true });
    }
    function pickOpt(o) {
      input.value = o.textContent;
      closePop();
      say("选了「" + o.textContent + "」，浮层收起");
    }
    function escOnce() {
      if (drawerOn()) { closeDrawer(); say("Esc → 关目录抽屉，焦点还给「目录」按钮"); return; }
      if (!pop.hidden) { closePop(); say("Esc → 收起联想浮层，框里的字留着"); return; }
      if (!row.hidden && input.value) { input.value = ""; paintStack(); say("Esc → 清空框里的字"); return; }
      if (!row.hidden) { closeRow(); say("Esc → 收起整行搜索，焦点还给「搜索」按钮"); return; }
      say("Esc → 没有可退的了，什么都不做");
    }
    root.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      if (composing(e) || sim) {
        if (sim) setSim(false);
        say("Esc（组字中）→ 只取消选词，什么都不关", "is-warn");
        return;
      }
      e.preventDefault();
      escOnce();
    });
    sbtn.addEventListener("click", function () {
      if (row.hidden) { openRow(true); logTo(log, "打开整行搜索"); }
      else { closeRow(); logTo(log, "点「搜索」收起整行搜索"); }
    });
    menu.addEventListener("click", function () {
      if (drawerOn()) closeDrawer();
      else { openDrawer(); logTo(log, "打开目录抽屉"); }
    });
    scrim.addEventListener("click", function () { closeDrawer(); logTo(log, "点遮罩 → 关目录抽屉"); });
    input.addEventListener("input", renderPop);
    input.addEventListener("keydown", function (e) {
      if (composing(e) || sim) return;
      var opts = $$('[role="option"]:not([aria-disabled])', pop);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        if (pop.hidden) renderPop();
        opts = $$('[role="option"]:not([aria-disabled])', pop);
        if (!opts.length) return;
        e.preventDefault();
        active = (active + (e.key === "ArrowDown" ? 1 : -1) + opts.length) % opts.length;
        opts.forEach(function (o, i) { o.setAttribute("aria-selected", i === active ? "true" : "false"); });
        input.setAttribute("aria-activedescendant", opts[active].id);
      } else if (e.key === "Enter" && !pop.hidden && active >= 0 && opts[active]) {
        e.preventDefault();
        pickOpt(opts[active]);
      }
    });
    pop.addEventListener("mousedown", function (e) { e.preventDefault(); });
    pop.addEventListener("click", function (e) {
      var o = e.target.closest ? e.target.closest('[role="option"]:not([aria-disabled])') : null;
      if (o) pickOpt(o);
    });
    links.forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        closeDrawer();
        say("点了「" + a.textContent + "」（示例），抽屉收起");
      });
    });
    drawer.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var i = links.indexOf(doc.activeElement);
      e.preventDefault();
      links[(i + (e.shiftKey ? -1 : 1) + links.length) % links.length].focus({ preventScroll: true });
    });
    setupBtn.addEventListener("click", function () {
      setSim(false);
      openRow(false);
      input.value = "存";
      renderPop();
      openDrawer();
      say("摆好了四层：整行搜索、框里的「存」、联想浮层、目录抽屉。现在连按Esc");
    });
    imeBtn.addEventListener("click", function () {
      setSim(!sim);
      logTo(log, sim ? "开始组字：拼音「cun」还没上屏" : "不再模拟组字", sim ? "is-warn" : "");
    });
    paintStack();
  }

  /* ================================================================
   * 键盘与读屏：迷你页面。播报只走一条 aria-live；「读屏会听到」用 MutationObserver 把它播的、
   * 加上焦点落到哪（按角色＋可读名拼一句），同步写成可见的记录。反例（示意）：每个筛选按钮各带一条 live。
   * ================================================================ */
  function initA11y() {
    var root = $("[data-demo='a11y']");
    if (!root) return;
    var page = $(".ixa-page", root);
    var start = $(".ixa-start", root);
    var skip = $(".ixa-skip", root);
    var main = $(".ixa-main", root);
    var list = $(".ixa-list", root);
    var chips = $$(".ixa-chip", root);
    var openBtn = $(".ixa-open", root);
    var sw = $(".ixa-switch", root);
    var dlg = $(".ixa-dialog", root);
    var closeBtn = $(".ixa-close", root);
    var check = $(".ixa-check input", root);
    var live = $("[data-a-live]", root);
    var scatterBox = $(".ixa-scatter", root);
    var ear = $(".ixa-ear", root);
    var markBtn = $("[data-a-mark]", root);
    var scatterBtn = $("[data-a-scatter]", root);
    var ITEMS = [["交物业费", "doing"], ["周报", "doing"], ["体检预约", "doing"], ["材料收集", "done"], ["报销单", "done"]];
    var NAMES = { all: "全部", doing: "进行中", done: "已完成" };
    var filter = "all", opener = null;
    dlg.setAttribute("tabindex", "-1");
    var scat = ["all", "doing", "done"].map(function (k) {
      var p = doc.createElement("p");
      p.className = "sr-only";
      p.setAttribute("aria-live", "polite");
      p.setAttribute("data-k", k);
      scatterBox.appendChild(p);
      return p;
    });
    function hear(text, cls) { logTo(ear, text, cls, 10); }
    function watch(region, prefix, cls, onlyWhenShown) {
      if (!window.MutationObserver) return;
      new MutationObserver(function () {
        var t = region.textContent.trim();
        if (t && !(onlyWhenShown && scatterBox.hidden)) hear(prefix + t, cls);
      }).observe(region, { childList: true, characterData: true, subtree: true });
    }
    watch(live, "播报：", "is-say", false);
    scat.forEach(function (p) { watch(p, "播报：", "is-noise", true); });
    function speak(region, text) {
      region.textContent = "";
      setTimeout(function () { region.textContent = text; }, 40);
    }
    function count(k) { return ITEMS.filter(function (it) { return k === "all" || it[1] === k; }).length; }
    function render() {
      list.innerHTML = ITEMS.filter(function (it) { return filter === "all" || it[1] === filter; })
        .map(function (it) { return "<li>" + esc(it[0]) + "（示例）</li>"; }).join("");
    }
    function describe(el) {
      if (el === main) return "区域「正文」";
      if (el === dlg) return "对话框「任务详情（示例）」";
      var name = (el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, "");
      if (el.tagName === "A") return "链接「" + name + "」";
      if (el.type === "checkbox") return "复选框「材料已核对」，" + (el.checked ? "已勾选" : "未勾选");
      if (el.getAttribute("role") === "switch") return "开关「" + name + "」，" + (el.getAttribute("aria-checked") === "true" ? "开" : "关");
      if (el.hasAttribute("aria-pressed")) return "切换按钮「" + name + "」，" + (el.getAttribute("aria-pressed") === "true" ? "已按下" : "未按下");
      return "按钮「" + name + "」";
    }
    page.addEventListener("focusin", function (e) { hear("焦点：" + describe(e.target), "is-focus"); });
    start.addEventListener("click", function () {
      ear.innerHTML = "";
      start.focus();
      hear("准备好了：现在按Tab", "is-focus");
    });
    function toMain(e) { e.preventDefault(); main.focus({ preventScroll: true }); }
    skip.addEventListener("click", toMain);
    $$(".ixa-navlink", root).forEach(function (a) { a.addEventListener("click", toMain); });
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        filter = c.getAttribute("data-f");
        chips.forEach(function (x) { x.setAttribute("aria-pressed", x === c ? "true" : "false"); });
        render();
        hear("状态：「" + NAMES[filter] + "」已按下", "is-focus");
        if (!scatterBox.hidden) scat.forEach(function (p) { var k = p.getAttribute("data-k"); speak(p, NAMES[k] + count(k) + "项"); });
        else speak(live, "显示" + count(filter) + "项");
      });
    });
    function closeDlg() {
      dlg.hidden = true;
      if (opener) opener.focus({ preventScroll: true });
    }
    openBtn.addEventListener("click", function () {
      opener = openBtn;
      dlg.hidden = false;
      dlg.focus({ preventScroll: true });
    });
    closeBtn.addEventListener("click", closeDlg);
    dlg.addEventListener("keydown", function (e) {
      if (composing(e)) return;
      if (e.key === "Escape") { e.preventDefault(); closeDlg(); return; }
      if (e.key === "Tab") {
        var f = [check, closeBtn];
        var i = f.indexOf(doc.activeElement);
        e.preventDefault();
        f[e.shiftKey ? (i <= 0 ? f.length - 1 : i - 1) : (i + 1) % f.length].focus({ preventScroll: true });
      }
    });
    check.addEventListener("change", function () { hear("状态：" + (check.checked ? "已勾选" : "未勾选"), "is-focus"); });
    sw.setAttribute("aria-checked", doc.documentElement.getAttribute("data-mode") === "dark" ? "true" : "false");
    sw.addEventListener("click", function () {
      var on = sw.getAttribute("aria-checked") !== "true";
      sw.setAttribute("aria-checked", on ? "true" : "false");
      page.setAttribute("data-mode", on ? "dark" : "light");
      speak(live, "外观：" + (on ? "深色" : "浅色"));
    });
    markBtn.addEventListener("click", function () {
      var on = togglePressed(markBtn);
      page.classList.toggle("is-marked", on);
      announce(on ? "已标出对读屏隐藏的光斑和3D画布" : "不再标出");
    });
    scatterBtn.addEventListener("click", function () {
      var on = togglePressed(scatterBtn);
      scatterBox.hidden = !on;
      announce(on ? "反例：每个筛选按钮各播各的（示意），点一下筛选看看" : "现行：播报集中在一条");
    });
    render();
  }

  /* ================================================================
   * 续做（刷刷 design-proposal 九）：入口要么默认续上、胶囊写「当前题号 / 总数」，要么点之前就写明会从头开始。
   * 存位置在 saveState() 一处抄；signature = 条数 + 首尾题号 + 全部题号的32位哈希（FNV-1a）。
   * 反例（示意）：默认从头，入口上什么都不写，进度被静默丢掉。存档只在这块样例的内存里。
   * ================================================================ */
  function initResume() {
    var root = $("[data-demo='resume']");
    if (!root) return;
    var home = $(".ixr-home", root);
    var quiz = $(".ixr-quiz", root);
    var entries = $$(".ixr-entry", root);
    var note = $("[data-r-note]", root);
    var qno = $("[data-r-qno]", root);
    var toast = $("[data-r-toast]", root);
    var stem = $("[data-r-stem]", root);
    var saveEl = $("[data-r-save]", root);
    var log = $(".ixr-log", root);
    var SETS = { all: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], tail: [7, 8, 9, 10, 11, 12] };
    var NAMES = { all: "连续刷题", tail: "只练后6题" };
    var STEMS = ["办业务前先核对证件。", "挂失补办不用本人到场。", "定期存单到期可以自动转存。", "跨行转账当天一定到账。", "大额存单可以提前支取。",
      "密码连续输错会被锁定。", "代办要带代办人的证件。", "转账限额可以在柜台调整。", "挂失分书面和口头两种。", "利息按日计算。", "存折可以换成银行卡。", "开户要填职业信息。"];
    var mode = "resume", save = null, cur = null;
    function signature(ids) {
      var h = 0x811c9dc5, s = ids.join(",");
      for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
      return ids.length + "题·" + ids[0] + "–" + ids[ids.length - 1] + "·" + ("0000000" + h.toString(16)).slice(-8);
    }
    function paintSave() {
      saveEl.textContent = save ? "{ index: " + save.index + ", signature: \"" + save.signature + "\" }（「" + NAMES[save.set] + "」第" + (save.index + 1) + "题）" : "还没有存档";
    }
    function paintHome() {
      entries.forEach(function (btn) {
        var set = btn.getAttribute("data-set");
        var badge = $("[data-badge]", btn);
        var ids = SETS[set];
        if (mode === "resume" && save) {
          if (save.signature === signature(ids)) { badge.textContent = "第" + (save.index + 1) + "/" + ids.length + "题"; badge.className = "ixr-badge is-resume"; }
          else { badge.textContent = "从第1题开始"; badge.className = "ixr-badge is-restart"; }
        } else {
          badge.textContent = "";
          badge.className = "ixr-badge";
        }
      });
      note.textContent = mode === "resume" ? (save ? "胶囊写着点进去会到哪：同一套题续上，换了范围从第1题开始。" : "还没做过，点进去从第1题开始。") : "反例（示意）：入口上什么都不写，点进去一律从第1题开始。";
      paintSave();
    }
    function saveState() {
      save = { index: cur.index, signature: signature(cur.ids), set: cur.set };
      paintSave();
    }
    function paintQuiz() {
      qno.textContent = "第" + (cur.index + 1) + "/" + cur.ids.length + "题";
      stem.textContent = "第" + cur.ids[cur.index] + "题（假题）：" + STEMS[cur.ids[cur.index] - 1];
    }
    function enter(set) {
      var ids = SETS[set], sig = signature(ids), idx = 0, msg = "", warn = false;
      if (mode === "resume" && save) {
        if (save.signature === sig) msg = "接着上次看到的第" + (save.index + 1) + "题继续";
        else { msg = "题目范围和上次不一样，从第1题开始"; warn = true; }
        if (save.signature === sig) idx = save.index;
      } else if (mode === "restart" && save && save.index > 0) {
        logTo(log, "静默丢了进度：上次在「" + NAMES[save.set] + "」做到第" + (save.index + 1) + "题，这次又从第1题开始（示意）", "is-bad");
      }
      cur = { set: set, ids: ids, index: idx };
      saveState();
      home.hidden = true;
      quiz.hidden = false;
      toast.hidden = !msg;
      toast.textContent = msg;
      toast.className = "ixr-toast" + (warn ? " is-warn" : "");
      paintQuiz();
      qno.focus({ preventScroll: true });
      logTo(log, "进入「" + NAMES[set] + "」：第" + (idx + 1) + "/" + ids.length + "题", msg ? (warn ? "is-warn" : "is-ok") : "");
      announce((msg ? msg + "。" : "") + "第" + (idx + 1) + "/" + ids.length + "题");
    }
    function exit() {
      quiz.hidden = true;
      home.hidden = false;
      paintHome();
      logTo(log, "退出：存档停在第" + (save ? save.index + 1 : 1) + "题");
      var back = entries.filter(function (b) { return b.getAttribute("data-set") === cur.set; })[0];
      if (back) back.focus({ preventScroll: true });
      announce("已退出，回到练习方式");
    }
    entries.forEach(function (b) { b.addEventListener("click", function () { enter(b.getAttribute("data-set")); }); });
    $(".ixr-exit", root).addEventListener("click", exit);
    $$(".ixr-opt", root).forEach(function (b) {
      b.addEventListener("click", function () {
        cur.index += 1;
        if (cur.index >= cur.ids.length) {
          save = null;
          logTo(log, "「" + NAMES[cur.set] + "」做完了，存档清掉", "is-good");
          cur.index = 0;
          quiz.hidden = true;
          home.hidden = false;
          paintHome();
          announce("做完了");
          return;
        }
        saveState();
        toast.hidden = true;
        paintQuiz();
      });
    });
    radios($(".ixr-seg", root), function (v) {
      mode = v;
      if (!quiz.hidden) { quiz.hidden = true; home.hidden = false; }
      paintHome();
      announce(v === "resume" ? "现行：默认续上" : "反例：默认从头（示意）");
    });
    paintHome();
  }

  /* ================================================================
   * 只升级已有交互：六个组件 × 六个项目。数据照条目里那张表逐格搬，表里没单列理由的写「没单列理由」，不补猜测。
   * ================================================================ */
  function initUpgrade() {
    var root = $("[data-demo='upgrade']");
    if (!root) return;
    var picks = $(".ixu-picks", root);
    var thead = $(".ixu-matrix thead", root);
    var tbody = $(".ixu-matrix tbody", root);
    var detail = $("[data-u-detail]", root);
    var MARK = ["①", "②", "③", "④", "⑤", "⑥"];
    var COMP = ["多选筛选标签", "可删除的标签", "输入联想浮层", "拨动字号刻度", "按压倾斜卡片", "长按变录音条"];
    var R6 = "没有一个项目有语音输入，不为它新造麦克风功能";
    var R4 = "各家都没做";
    var PROJ = [
      ["plan", [["d", "只做手感、保持单选：全部任务的状态筛选、笔记页的标签筛选"], ["d", "挪到笔记标签（任务没有标签字段）"], ["d", "挪到笔记标签（任务没有标签字段）"],
        ["n", "正文编辑区有，但工具条和字号偏好都得新造，桌面上也没有「键盘顶部」"], ["n", "全仓没有任务卡片，整行倾斜会让「按的是哪个」变模糊；回顾页的格子点了没反应，给按压反馈等于让不能点的东西看起来能点"], ["n", R6]]],
      ["刷刷", [["b", "专项练习做过，屋主看后撤回"], ["d", "搜题框"], ["d", "搜题框"], ["n", R4], ["d", "首页「练习方式」列表行"], ["n", R6]]],
      ["岗岗", [["n", "分类只是单选切换"], ["n", "没有标签输入"], ["d", "顶栏搜索联想（「以标签插入正文」那一半不做）"], ["n", "没有字号调节，字号靠clamp()随窗口变"], ["n", "没有首页，目录是列表不是卡片"], ["n", R6]]],
      ["card", [["n", null], ["n", null], ["n", null], ["n", R4], ["d", "Cover Flow正中那张和查看器里的卡（两侧侧立的卡不做）"], ["n", R6]]],
      ["old", [["n", null], ["n", null], ["d", "首页搜索"], ["n", R4], ["d", "素材卡；老站友链、ACGN横条、游戏入口。只接有真实去处的卡：链接是#的模板占位卡点了哪也不去，加反馈只会让人以为坏了"], ["n", R6]]],
      ["小屋", [["n", "随笔和归档没有筛选，新造一排等于把禁掉的标签云补回来"], ["n", null], ["n", null], ["n", R4], ["n", "工具页每个工具只有一个Tab位，做按压等于多造入口"], ["n", R6]]]
    ];
    var WORD = { d: "做了", b: "撤回", n: "没做" };
    var CLS = { d: "is-done", b: "is-back", n: "is-no" };
    var sel = 0;
    picks.innerHTML = COMP.map(function (c, i) {
      return '<button type="button" class="ixu-pick" role="radio" data-v="' + i + '" aria-checked="' + (i === sel) + '" tabindex="' + (i === sel ? 0 : -1) + '">' + MARK[i] + esc(c) + "</button>";
    }).join("");
    thead.innerHTML = '<tr><th scope="col"><span class="sr-only">项目</span></th>' + COMP.map(function (c, i) {
      return '<th scope="col"><button type="button" data-col="' + i + '" aria-pressed="false" aria-label="' + MARK[i] + esc(c) + '" title="' + esc(c) + '">' + MARK[i] + "</button></th>";
    }).join("") + "</tr>";
    tbody.innerHTML = PROJ.map(function (p) {
      return '<tr><th scope="row">' + esc(p[0]) + "</th>" + p[1].map(function (cell, i) {
        return '<td data-col="' + i + '"><span class="ixu-cell ' + CLS[cell[0]] + '">' + WORD[cell[0]] + "</span></td>";
      }).join("") + "</tr>";
    }).join("");
    var pick = radios(picks, function (v) { select(Number(v), true); });
    function select(i, speak) {
      sel = i;
      $$("thead button", root).forEach(function (b) { b.setAttribute("aria-pressed", Number(b.getAttribute("data-col")) === i ? "true" : "false"); });
      $$("tbody td", root).forEach(function (td) { td.classList.toggle("is-col", Number(td.getAttribute("data-col")) === i); });
      var done = 0, back = 0, no = 0;
      var items = PROJ.map(function (p) {
        var c = p[1][i];
        if (c[0] === "d") done++; else if (c[0] === "b") back++; else no++;
        return '<li><span class="ixu-cell ' + CLS[c[0]] + '">' + WORD[c[0]] + "</span><b>" + esc(p[0]) + "</b>" +
          (c[1] ? "<span>" + esc(c[1]) + "</span>" : '<span class="is-quiet">没单列理由</span>') + "</li>";
      }).join("");
      var sum = "做了" + done + "家" + (back ? "、撤回" + back + "家" : "") + "、没做" + no + "家";
      detail.innerHTML = '<p class="ixu-dh"><b>' + MARK[i] + esc(COMP[i]) + "</b>：" + sum + '</p><ul class="ixu-list">' + items + "</ul>";
      if (speak) announce(MARK[i] + COMP[i] + "：" + sum);
    }
    thead.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("button[data-col]") : null;
      if (!b) return;
      var btn = $('[role="radio"][data-v="' + b.getAttribute("data-col") + '"]', picks);
      if (btn) pick(btn);
    });
    select(sel, false);
  }

  function start() {
    [initFilter, initFilterMulti, initTags, initSuggest, initPress, initConfirm, initSeg, initList, initWallSwitch, initIme, initOldNav,
      initLightbox, initDialog, initTabstop, initGlobe, initEsc, initA11y, initResume, initUpgrade].forEach(function (fn) {
      try { fn(); } catch (e) {
        /* 一个样例出错不拖累别的；错误照样进控制台 */
        setTimeout(function () { throw e; }, 0);
      }
    });
  }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", start);
  else start();
})();
