/*
 * boot.js —— 外观预置（同步加载，写在 <head> 里、样式表之前）
 *
 * 只做一件事：在样式表生效之前把 <html> 上的三个属性摆好，首帧就拿到正确的令牌，
 * 深色下不会先白一下，切过强调色后刷新也不会闪一下别的色。
 *   data-mode-pref  偏好：light / dark / auto（存 localStorage「star-mode」）
 *   data-mode       已解析值：light / dark（auto 按 prefers-color-scheme 解析后写这里，CSS 只认它）
 *   data-accent     blue / green / indigo / orange / pink / teal（存「star-accent」）
 * 非法值、读不到存储（file:// 下 localStorage 可能直接抛错）一律回落 light + blue。
 *
 * 另外暴露 window.StarTheme 给 star.js 用（切换、订阅）；matchMedia 监听只在这里挂一次，
 * 偏好是 auto 时系统一翻就重新解析。<meta name="theme-color"> 跟底色：浅 #F4F5F9 / 深 #0B0C10。
 */
(function () {
  var MODES = ["light", "dark", "auto"];
  var ACCENTS = ["blue", "green", "indigo", "orange", "pink", "teal"];
  var THEME_COLOR = { light: "#F4F5F9", dark: "#0B0C10" };
  var root = document.documentElement;
  var pref = "light";
  var accent = "blue";
  var listeners = [];
  var mq = null;

  try {
    var savedMode = window.localStorage.getItem("star-mode");
    if (MODES.indexOf(savedMode) >= 0) pref = savedMode;
    var savedAccent = window.localStorage.getItem("star-accent");
    if (ACCENTS.indexOf(savedAccent) >= 0) accent = savedAccent;
  } catch (e) { /* 读不到就用默认，页面照常 */ }

  try { mq = window.matchMedia("(prefers-color-scheme: dark)"); } catch (e) { mq = null; }

  function resolved() {
    if (pref !== "auto") return pref;
    return mq && mq.matches ? "dark" : "light";
  }

  function save(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* 存不住只影响下次打开 */ }
  }

  function apply() {
    var mode = resolved();
    root.setAttribute("data-mode-pref", pref);
    root.setAttribute("data-mode", mode);
    root.setAttribute("data-accent", accent);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", THEME_COLOR[mode]);
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i]({ pref: pref, mode: mode, accent: accent }); } catch (e) { /* 一个订阅者出错不拖累别的 */ }
    }
  }

  if (mq) {
    var onSystemChange = function () { if (pref === "auto") apply(); };
    if (typeof mq.addEventListener === "function") mq.addEventListener("change", onSystemChange);
    else if (typeof mq.addListener === "function") mq.addListener(onSystemChange);
  }

  /* 首帧占位图标：没有 <link rel="icon"> 时浏览器会去请求 /favicon.ico（部署到服务器上就是一条 404）。
     先放一个空的 data URI 挡住，star.js 起来后按当前强调色换成真正的图标。 */
  if (!document.querySelector('link[rel="icon"]')) {
    var link = document.createElement("link");
    link.rel = "icon";
    link.href = "data:,";
    (document.head || root).appendChild(link);
  }

  window.StarTheme = {
    MODES: MODES.slice(),
    ACCENTS: ACCENTS.slice(),
    pref: function () { return pref; },
    mode: function () { return resolved(); },
    accent: function () { return accent; },
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
    onChange: function (fn) { if (typeof fn === "function") listeners.push(fn); }
  };

  apply();
})();
