/*
 * boot.js —— 外观预置（同步加载，写在 <head> 里、样式表之前）
 *
 * 在样式表生效之前把 <html> 上的属性摆好，首帧就拿到正确的令牌，
 * 深色下不会先白一下，切过强调色、关过模糊后刷新也不会闪一下别的样子。
 *   data-mode-pref  偏好：light / dark / auto（存 localStorage「star-mode」）
 *   data-mode       已解析值：light / dark（auto 按 prefers-color-scheme 解析后写这里，CSS 只认它）
 *   data-accent     blue / green / indigo / orange / pink / teal（存「star-accent」）
 *   data-blur-pref  背景模糊偏好：auto / on / off（存「star-blur」）
 *   data-blur       已解析的模糊档位：full / lite / off（CSS 与 kit 只认它，规则见 star.css 文件头「模糊档位」）
 *                   on → full；off → off；auto → 看「star-gpu」缓存：测过、有显卡 → full；没显卡 → lite；
 *                   **没测过也按 lite**——误判成 full 的代价是没显卡那台整页卡（磨砂是它的瓶颈），
 *                   误判成 lite 只是第一次打开少一点景深，往后果轻的那边错。star.js 空闲时测一次再改。
 *   data-jump       地址带 #锚点 打开时先挂上：CSS 里它把 scroll-behavior 压回 auto，长页跳锚点不再慢慢滚
 *                   （量具读早、看着跑偏）；star.js 在 load 之后摘掉。同时挂 class="jump-in"（不摘）：正文进场只淡入不上移。
 * 非法值、读不到存储（file:// 下 localStorage 可能直接抛错）一律回落 light + blue + 模糊自动。
 *
 * 「star-gpu」= {"ua": navigator.userAgent, "ok": true|false}：UA 变了（换浏览器、升级）就作废重测。
 *
 * 另外暴露 window.StarTheme 给 star.js 用（切换、订阅）；matchMedia 监听只在这里挂一次，
 * 偏好是 auto 时系统一翻就重新解析。<meta name="theme-color"> 跟底色：浅 #F4F5F9 / 深 #0B0C10。
 *
 * 跨页过渡：pagereveal 必须在首帧之前挂上，所以写在这里（star.js 是 defer，来不及）；@view-transition 开关也在这里
 * 用构造样式表再挂一份（file:// 下只靠 star.css 那份时有时无，见下面那段注释）。
 * 新页面带着跨文档 View Transition 进来时：减弱动效、模糊档位不是 full → 直接跳过过渡，
 * 正文照 CSS 自己淡入上移；否则给 <html> 挂 vt-nav，CSS 据此给侧栏 / tab bar 起名、关掉正文的 CSS 进场（别两套叠）。
 */
(function () {
  var MODES = ["light", "dark", "auto"];
  var ACCENTS = ["blue", "green", "indigo", "orange", "pink", "teal"];
  var BLURS = ["auto", "on", "off"];
  var THEME_COLOR = { light: "#F4F5F9", dark: "#0B0C10" };
  var DEFAULTS = { mode: "light", accent: "blue", blur: "auto" };
  var root = document.documentElement;
  var pref = DEFAULTS.mode;
  var accent = DEFAULTS.accent;
  var blurPref = DEFAULTS.blur;
  var gpu = null;              /* true 有显卡 / false 软件渲染 / null 没测过（或 UA 变了） */
  var listeners = [];
  var mq = null;
  var mqReduce = null;
  var ua = "";
  try { ua = String(navigator.userAgent || ""); } catch (e) { ua = ""; }

  try {
    var savedMode = window.localStorage.getItem("star-mode");
    if (MODES.indexOf(savedMode) >= 0) pref = savedMode;
    var savedAccent = window.localStorage.getItem("star-accent");
    if (ACCENTS.indexOf(savedAccent) >= 0) accent = savedAccent;
    var savedBlur = window.localStorage.getItem("star-blur");
    if (BLURS.indexOf(savedBlur) >= 0) blurPref = savedBlur;
    var savedGpu = JSON.parse(window.localStorage.getItem("star-gpu") || "null");
    if (savedGpu && savedGpu.ua === ua && typeof savedGpu.ok === "boolean") gpu = savedGpu.ok;
  } catch (e) { /* 读不到、或缓存不是合法 JSON：用默认，页面照常 */ }

  try { mq = window.matchMedia("(prefers-color-scheme: dark)"); } catch (e) { mq = null; }
  try { mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)"); } catch (e) { mqReduce = null; }

  function resolved() {
    if (pref !== "auto") return pref;
    return mq && mq.matches ? "dark" : "light";
  }
  function blurTier() {
    if (blurPref === "on") return "full";
    if (blurPref === "off") return "off";
    return gpu === true ? "full" : "lite";
  }

  function save(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* 存不住只影响下次打开 */ }
  }

  function apply() {
    var mode = resolved();
    var tier = blurTier();
    root.setAttribute("data-mode-pref", pref);
    root.setAttribute("data-mode", mode);
    root.setAttribute("data-accent", accent);
    root.setAttribute("data-blur-pref", blurPref);
    root.setAttribute("data-blur", tier);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", THEME_COLOR[mode]);
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i]({ pref: pref, mode: mode, accent: accent, blurPref: blurPref, blur: tier }); } catch (e) { /* 一个订阅者出错不拖累别的 */ }
    }
  }

  if (mq) {
    var onSystemChange = function () { if (pref === "auto") apply(); };
    if (typeof mq.addEventListener === "function") mq.addEventListener("change", onSystemChange);
    else if (typeof mq.addListener === "function") mq.addListener(onSystemChange);
  }

  /* 带锚点打开：先关平滑滚动，star.js load 之后摘掉。
     另挂 class="jump-in"（不摘）：正文进场只淡入、不上移——浏览器跳锚点时按「带位移的盒子」算落点，
     进场那 8px 还没走完就会让落点偏 8px（实测 16 → 7.6）。 */
  try {
    if (window.location.hash && window.location.hash.length > 1) {
      root.setAttribute("data-jump", "");
      root.classList.add("jump-in");
    }
  } catch (e) { /* 读不到 location 就算了 */ }

  /* 首帧占位图标：没有 <link rel="icon"> 时浏览器会去请求 /favicon.ico（部署到服务器上就是一条 404）。
     先放一个空的 data URI 挡住，star.js 起来后按当前强调色换成真正的图标。 */
  if (!document.querySelector('link[rel="icon"]')) {
    var link = document.createElement("link");
    link.rel = "icon";
    link.href = "data:,";
    (document.head || root).appendChild(link);
  }

  /* 跨页过渡的开关（@view-transition）在这里再挂一份「构造样式表」：file:// 下只写在 star.css 里不可靠——
     实测 Chrome 155 双击打开时，新页面判「开没开跨页过渡」那一刻外部样式表时有时无（20次跳转9–10次被中止），
     中止时新页面控制台还留一条拿不到手的 Uncaught (in promise) InvalidStateError「ViewTransition opt-in disabled」。
     同步脚本在 <head> 里挂的构造样式表（adoptedStyleSheets）首帧之前一定在：20/20 次都有过渡、零报错。
     用构造样式表不用 <style>：以后加 CSP 的 style-src 'self' 不会拦它。star.css 第14节那份留着（http 下本来就可靠）。 */
  try {
    if (typeof CSSStyleSheet === "function" && "adoptedStyleSheets" in document) {
      var vtSheet = new CSSStyleSheet();
      vtSheet.replaceSync("@media (prefers-reduced-motion: no-preference) { @view-transition { navigation: auto; } }");
      document.adoptedStyleSheets = document.adoptedStyleSheets.concat([vtSheet]);
    }
  } catch (e) { /* 不支持构造样式表：只剩 star.css 那份 */ }

  /* 新页面首帧等到 #main 解析出来再画（<link rel="expect" blocking="render">）：跨页过渡的新画面是首帧截的，
     首帧要是早于 nav.js 插进侧栏，新画面里就没有侧栏——旧侧栏淡出、过渡完了新侧栏才突然冒出来（实测 file:// 下
     20次里有几次首帧连侧栏都没有）。只在会做跨页过渡时挂（full 档、没开减弱动效）；#main 紧跟在 nav.js 后面，
     页面又是本地文件，多等的只是解析到 <main> 那一小段。 */
  try {
    if (blurTier() === "full" && !(mqReduce && mqReduce.matches) && document.head) {
      var expect = document.createElement("link");
      expect.rel = "expect";
      expect.href = "#main";
      expect.setAttribute("blocking", "render");
      document.head.appendChild(expect);
    }
  } catch (e) { /* 不认 rel=expect 的内核：照常首帧 */ }

  /* 跨页过渡（新页这一侧）。旧页那一侧（pageswap）在 star.js。file:// 下也做（屋主是双击打开的）。
     三个 promise 先全接住再说跳不跳：跳过会让 ready reject，没接住就是控制台里一条 Uncaught (in promise)。 */
  window.addEventListener("pagereveal", function (e) {
    var vt = e && e.viewTransition;
    if (!vt) return;
    var noop = function () {};
    var done = function () { root.classList.remove("vt-nav"); };
    if (vt.ready && typeof vt.ready.then === "function") vt.ready.then(noop, done);
    if (vt.finished && typeof vt.finished.then === "function") vt.finished.then(done, done);
    if (vt.updateCallbackDone && typeof vt.updateCallbackDone.then === "function") vt.updateCallbackDone.then(noop, noop);
    if ((mqReduce && mqReduce.matches) || blurTier() !== "full") {
      try { vt.skipTransition(); } catch (err) { /* 已经结束了就算了 */ }
      return;
    }
    root.classList.add("vt-nav");
  });

  window.StarTheme = {
    MODES: MODES.slice(),
    ACCENTS: ACCENTS.slice(),
    BLURS: BLURS.slice(),
    DEFAULTS: { mode: DEFAULTS.mode, accent: DEFAULTS.accent, blur: DEFAULTS.blur },
    pref: function () { return pref; },
    mode: function () { return resolved(); },
    accent: function () { return accent; },
    blurPref: function () { return blurPref; },
    blur: function () { return blurTier(); },
    gpu: function () { return gpu; },
    setMode: function (next) {
      if (MODES.indexOf(next) < 0) return;
      pref = next;
      save("star-mode", pref);
      apply();
    },
    setAccent: function (next) {
      if (ACCENTS.indexOf(next) < 0) return;
      accent = next;
      save("star-accent", accent);
      apply();
    },
    setBlur: function (next) {
      if (BLURS.indexOf(next) < 0) return;
      blurPref = next;
      save("star-blur", blurPref);
      apply();
    },
    /* 三项一起改、只重绘一次（「恢复默认」与撤销用）；缺的项不动 */
    setAll: function (o) {
      o = o || {};
      if (MODES.indexOf(o.mode) >= 0) { pref = o.mode; save("star-mode", pref); }
      if (ACCENTS.indexOf(o.accent) >= 0) { accent = o.accent; save("star-accent", accent); }
      if (BLURS.indexOf(o.blur) >= 0) { blurPref = o.blur; save("star-blur", blurPref); }
      apply();
    },
    /* star.js 的显卡探测结果：连 UA 一起存，UA 变了重测 */
    setGpu: function (ok) {
      gpu = !!ok;
      save("star-gpu", JSON.stringify({ ua: ua, ok: gpu }));
      apply();
    },
    onChange: function (fn) { if (typeof fn === "function") listeners.push(fn); }
  };

  apply();
})();
