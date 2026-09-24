/*
 * 刷刷 v3.12.0 — 外观预置脚本（浅/深/自动 + 六个强调色）| Author: Ysevan | 仅限内部学习使用
 *
 * 这个文件必须是外部脚本、必须同步加载、必须排在样式表 <link> 之前：
 * - 外部：本站的 CSP 是 script-src 'self'（serve.mjs / serve.ps1 / docker/nginx.conf 三处一致），
 *   内联的 <script> 会被直接拦掉，外观就会一直是默认那套。
 * - 同步且在样式表之前：先把 <html data-mode> 与 <html data-accent> 设好，样式表才是带着正确
 *   主题第一次生效的，页面不会先闪一下浅色再跳到深色（defer / DOMContentLoaded 都来不及）。
 *
 * 偏好只存在 localStorage 的 shua-mode / shua-accent 里：不进题库进度、不进备份，换机器就是默认那套。
 * 读写都包 try/catch——隐私模式、禁用站点数据时 localStorage 会直接抛。
 *
 * data-mode="auto" 时深色由 CSS 的 @media (prefers-color-scheme: dark) 决定，这里只负责让
 * <meta name="theme-color"> 跟着系统切换（CSS 管不到 meta），所以脚本要一直监听 matchMedia。
 */
(function () {
  "use strict";

  var MODE_KEY = "shua-mode";
  var ACCENT_KEY = "shua-accent";
  // 3.11.0 开发期间短暂存在过的六套粉彩偏好键，升级后清掉一次，免得一直留在浏览器里。
  var LEGACY_KEY = "shua-palette";
  var DEFAULT_MODE = "light";
  var DEFAULT_ACCENT = "blue";
  // 顺序即控件里的顺序，也是键盘 ←/→ 的循环顺序。
  var MODES = ["light", "dark", "auto"];
  var ACCENTS = ["blue", "green", "indigo", "orange", "pink", "teal"];
  // theme-color 只有两档：跟页面底色走（浅 #F4F5F9 / 深 #0B0C10），与 styles.css 的 --bg 一致。
  var THEME_COLORS = { light: "#F4F5F9", dark: "#0B0C10" };
  // PWA 清单只在 http(s) 下挂。直接双击 index.html 打开时是 file:// + origin null，
  // 浏览器仍会去取清单并因跨源被拦，在控制台留两条红字；而 file:// 本来就没有 Service Worker，
  // 清单在那里一点用也没有。所以不写死在 index.html 里，由这里按协议决定挂不挂。
  // 发布核对（scripts/release-check.mjs）会拿这个常量去比对 sw.js 的预缓存清单。
  var MANIFEST_URL = "manifest.webmanifest";

  var darkQuery = null;
  try {
    darkQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  } catch (_error) {
    darkQuery = null;
  }

  function normalize(list, value, fallback) {
    return list.indexOf(value) >= 0 ? value : fallback;
  }

  function stored(key, list, fallback) {
    try {
      return normalize(list, window.localStorage.getItem(key), fallback);
    } catch (_error) {
      return fallback;
    }
  }

  function remember(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (_error) {
      // 存不下就只在本次会话生效，不影响刷题。
    }
  }

  function forgetLegacy() {
    try {
      window.localStorage.removeItem(LEGACY_KEY);
    } catch (_error) {
      // 同上：清不掉也没关系，没人再读它了。
    }
  }

  function systemPrefersDark() {
    return Boolean(darkQuery && darkQuery.matches);
  }

  function resolvedMode() {
    return mode === "auto" ? (systemPrefersDark() ? "dark" : "light") : mode;
  }

  function applyMode() {
    document.documentElement.setAttribute("data-mode", mode);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", THEME_COLORS[resolvedMode()]);
  }

  function applyAccent() {
    document.documentElement.setAttribute("data-accent", accent);
  }

  function attachManifest() {
    if (location.protocol === "file:" || !document.head) return;
    var link = document.createElement("link");
    link.rel = "manifest";
    link.href = MANIFEST_URL;
    document.head.appendChild(link);
  }

  var mode = stored(MODE_KEY, MODES, DEFAULT_MODE);
  var accent = stored(ACCENT_KEY, ACCENTS, DEFAULT_ACCENT);
  forgetLegacy();
  applyMode();
  applyAccent();
  attachManifest();

  // 自动档跟着系统走时，CSS 会自己换色，但 meta 得手动跟上。
  if (darkQuery) {
    var onChange = function () {
      if (mode === "auto") applyMode();
    };
    if (typeof darkQuery.addEventListener === "function") darkQuery.addEventListener("change", onChange);
    else if (typeof darkQuery.addListener === "function") darkQuery.addListener(onChange);
  }

  window.ShuaTheme = Object.freeze({
    getMode: function () {
      return mode;
    },
    setMode: function (value) {
      mode = normalize(MODES, value, DEFAULT_MODE);
      remember(MODE_KEY, mode);
      applyMode();
      return mode;
    },
    getAccent: function () {
      return accent;
    },
    setAccent: function (value) {
      accent = normalize(ACCENTS, value, DEFAULT_ACCENT);
      remember(ACCENT_KEY, accent);
      applyAccent();
      return accent;
    },
    modes: Object.freeze(MODES.slice()),
    accents: Object.freeze(ACCENTS.slice()),
    resolvedMode: resolvedMode
  });
})();
