/*
 * 苹果液态玻璃风的主题：模式（light / dark / auto）+ 强调色（blue / green / indigo / orange / pink / teal），四个工具同一套（docs/SPEC-apple-glass.md §3）。
 * localStorage 键 card-mode / card-accent，默认 light + indigo（card 专属，别的工具默认蓝）；早先六套粉彩的 card-palette 一律作废回落默认。
 * 要在样式表之前同步跑，免得闪默认色；也会被 viewer.js import、被 gallery.js 动态补进来——只跑一次。
 *
 * 自愈（card 的硬约束）：卡页由生成器按它自己的模板重生成，进页面时缺什么补什么——
 * meta color-scheme / theme-color 跟当前模式、补图标、顶栏里没有主题控件就塞一组（分段 + 六色点，≤600px 收成一个按钮弹出）。
 */
(function () {
  if (window.__cardTheme) return;
  window.__cardTheme = true;
  var MODE_KEY = 'card-mode';
  var ACCENT_KEY = 'card-accent';
  var MODES = ['light', 'dark', 'auto'];
  var MODE_NAMES = { light: '浅色', dark: '深色', auto: '自动' };
  var ACCENTS = ['blue', 'green', 'indigo', 'orange', 'pink', 'teal'];
  var ACCENT_NAMES = { blue: '蓝', green: '绿', indigo: '靛', orange: '橙', pink: '粉', teal: '青' };
  var ACCENT_DOT = { blue: '#007AFF', green: '#34C759', indigo: '#5856D6', orange: '#FF9500', pink: '#FF2D55', teal: '#30B0C7' };
  var THEME_COLOR = { light: '#F4F5F9', dark: '#0B0C10' };
  var ICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%235856D6'/%3E%3Crect x='9' y='7' width='14' height='18' rx='3' fill='none' stroke='%23fff' stroke-width='2'/%3E%3C/svg%3E";
  var root = document.documentElement;
  var media = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function read(key, list, fallback) {
    try {
      var value = localStorage.getItem(key);
      return list.indexOf(value) >= 0 ? value : fallback;
    } catch (error) {
      return fallback;
    }
  }
  function write(key, value) {
    try { localStorage.setItem(key, value); } catch (error) { /* 隐私模式存不下就只在这一页生效 */ }
  }
  function effective(mode) {
    return mode === 'auto' ? (media && media.matches ? 'dark' : 'light') : mode;
  }
  function meta(name) {
    var node = document.querySelector('meta[name="' + name + '"]');
    if (!node && document.head) {
      node = document.createElement('meta');
      node.setAttribute('name', name);
      document.head.appendChild(node);
    }
    return node;
  }
  function apply() {
    var mode = read(MODE_KEY, MODES, 'light');
    var accent = read(ACCENT_KEY, ACCENTS, 'indigo');
    var shown = effective(mode);
    root.setAttribute('data-mode', mode);
    root.setAttribute('data-accent', accent);
    // auto 的实际明暗写成 class，样式表里 html[data-mode="auto"].m-dark 与 data-mode="dark" 同一组变量
    root.classList.toggle('m-dark', shown === 'dark');
    var scheme = meta('color-scheme');
    if (scheme) scheme.setAttribute('content', mode === 'auto' ? 'light dark' : shown);
    var theme = meta('theme-color');
    if (theme) theme.setAttribute('content', THEME_COLOR[shown]);
    var segs = document.querySelectorAll('[data-mode-pick]');
    for (var i = 0; i < segs.length; i += 1) {
      var on = segs[i].getAttribute('data-mode-pick') === mode;
      segs[i].setAttribute('aria-checked', on ? 'true' : 'false');
      segs[i].tabIndex = on ? 0 : -1;
    }
    var dots = document.querySelectorAll('[data-accent-pick]');
    for (var j = 0; j < dots.length; j += 1) dots[j].setAttribute('aria-pressed', dots[j].getAttribute('data-accent-pick') === accent ? 'true' : 'false');
  }

  // ── 自愈：图标、品牌图标、控件 ──
  function svg(paths, size) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    el.setAttribute('viewBox', '0 0 24 24');
    el.setAttribute('aria-hidden', 'true');
    if (size) { el.setAttribute('width', size); el.setAttribute('height', size); }
    el.innerHTML = paths;
    return el;
  }
  // 内置品牌图标：一张竖版 0.72 圆角卡微微右倾 8°，卡面一道 45° 斜光带（两条平行短线），右上角一颗四角星；stroke 1.9 圆头
  var BRAND_ICON = '<g transform="rotate(8 11.6 11.5)"><rect x="5.85" y="3.5" width="11.5" height="16" rx="2.4"/><path d="m8.2 14.6 4.6-4.6M10.4 17.2l4.6-4.6"/></g><path d="M20 2.6l.75 1.95L22.7 5.3l-1.95.75L20 8l-.75-1.95L17.3 5.3l1.95-.75z"/>';
  /*
   * 屋主自己画的图标放在 shared/brand/brand-icon.svg（首选）或 brand-icon.png（1024² 透明底），有就优先用、没有就回落内置 SVG。
   * 路径从本脚本或 viewer.js 的 <script src> 推算（画廊在 /、卡页在 /cards/<id>/，两处都指向同一个 shared/brand/）。
   */
  function brandBase() {
    var script = document.querySelector('script[src*="shared/theme.js"], script[src*="shared/viewer.js"]');
    var base = script ? new URL(script.getAttribute('src'), location.href) : new URL('shared/theme.js', location.href);
    return new URL('./brand/', base).href;
  }
  function loadBrandFile(host) {
    var base = brandBase();
    var candidates = [base + 'brand-icon.svg', base + 'brand-icon.png'];
    var img = document.createElement('img');
    img.className = 'brand-file';
    img.alt = '';
    img.decoding = 'async';
    var index = 0;
    img.addEventListener('load', function () { host.classList.add('has-file'); });
    img.addEventListener('error', function () {
      index += 1;
      if (index < candidates.length) img.src = candidates[index];
      else img.remove();
    });
    img.src = candidates[0];
    host.appendChild(img);
  }
  function healHead() {
    if (!document.head) return;
    if (!document.querySelector('link[rel="icon"]')) {
      var icon = document.createElement('link');
      icon.rel = 'icon';
      icon.href = ICON;
      document.head.appendChild(icon);
    }
  }
  function healBrand() {
    var brand = document.querySelector('.brand');
    if (!brand) return;
    var icon = brand.querySelector('.brand-icon');
    if (!icon) {
      var mark = brand.querySelector('.brand-mark');
      icon = document.createElement('span');
      icon.className = 'brand-icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.appendChild(svg(BRAND_ICON));
      if (mark) mark.replaceWith(icon);
      else brand.insertBefore(icon, brand.firstChild);
    }
    if (!icon.querySelector('.brand-file')) loadBrandFile(icon);
  }
  function buildControls() {
    var wrap = document.createElement('div');
    wrap.className = 'theme-controls';
    wrap.setAttribute('data-theme-controls', '');
    var seg = document.createElement('div');
    seg.className = 'seg';
    seg.setAttribute('role', 'radiogroup');
    seg.setAttribute('aria-label', '外观');
    for (var i = 0; i < MODES.length; i += 1) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('role', 'radio');
      b.setAttribute('data-mode-pick', MODES[i]);
      b.setAttribute('aria-checked', 'false');
      b.textContent = MODE_NAMES[MODES[i]];
      seg.appendChild(b);
    }
    var dots = document.createElement('div');
    dots.className = 'accents';
    dots.setAttribute('role', 'group');
    dots.setAttribute('aria-label', '强调色');
    for (var j = 0; j < ACCENTS.length; j += 1) {
      var d = document.createElement('button');
      d.type = 'button';
      d.className = 'accent-dot';
      d.setAttribute('data-accent-pick', ACCENTS[j]);
      d.setAttribute('aria-pressed', 'false');
      d.setAttribute('aria-label', ACCENT_NAMES[ACCENTS[j]]);
      d.style.setProperty('--dot', ACCENT_DOT[ACCENTS[j]]);
      var name = document.createElement('span');
      name.className = 'accent-name';
      name.setAttribute('aria-hidden', 'true');
      name.textContent = ACCENT_NAMES[ACCENTS[j]];
      d.appendChild(name);
      dots.appendChild(d);
    }
    wrap.appendChild(seg);
    wrap.appendChild(dots);
    return wrap;
  }
  function buildToggle() {
    var t = document.createElement('button');
    t.type = 'button';
    t.className = 'theme-toggle';
    t.setAttribute('aria-label', '外观与强调色');
    t.setAttribute('aria-expanded', 'false');
    t.setAttribute('data-theme-toggle', '');
    // 调色盘线条图标
    t.appendChild(svg('<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.3 0 1.9-.8 1.9-1.6 0-.7-.5-1-.5-1.7 0-.9.7-1.5 1.6-1.5h1.6a3.9 3.9 0 0 0 3.9-3.9c0-4.6-3.9-8.3-8.5-8.3z"/><circle cx="8" cy="10" r="1.1"/><circle cx="11.5" cy="7" r="1.1"/><circle cx="15.8" cy="8.6" r="1.1"/>', 20));
    return t;
  }
  function healControls() {
    if (document.querySelector('[data-theme-controls]')) return;
    var host = document.querySelector('.topbar-right, .header-right, .masthead-right');
    if (!host) {
      var header = document.querySelector('header');
      if (!header) return;
      host = document.createElement('div');
      host.className = 'topbar-right';
      header.appendChild(host);
    }
    var back = host.querySelector('.back-link');
    var controls = buildControls();
    var toggle = buildToggle();
    if (back) { host.insertBefore(toggle, back); host.insertBefore(controls, back); }
    else { host.appendChild(toggle); host.appendChild(controls); }
  }

  function ready() {
    healHead();
    healBrand();
    healControls();
    apply();
    document.addEventListener('click', function (event) {
      var seg = event.target.closest('[data-mode-pick]');
      if (seg) { write(MODE_KEY, seg.getAttribute('data-mode-pick')); apply(); return; }
      var dot = event.target.closest('[data-accent-pick]');
      if (dot) { write(ACCENT_KEY, dot.getAttribute('data-accent-pick')); apply(); return; }
      var toggle = event.target.closest('[data-theme-toggle]');
      var controls = document.querySelector('[data-theme-controls]');
      if (toggle && controls) {
        var open = !controls.hasAttribute('data-open');
        controls.toggleAttribute('data-open', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        return;
      }
      if (controls && controls.hasAttribute('data-open') && !event.target.closest('[data-theme-controls]')) {
        controls.removeAttribute('data-open');
        var t = document.querySelector('[data-theme-toggle]');
        if (t) t.setAttribute('aria-expanded', 'false');
      }
    });
    document.addEventListener('keydown', function (event) {
      var seg = event.target.closest && event.target.closest('[data-mode-pick]');
      if (seg && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
        event.preventDefault();
        var index = MODES.indexOf(seg.getAttribute('data-mode-pick'));
        var next = MODES[(index + (event.key === 'ArrowRight' ? 1 : MODES.length - 1)) % MODES.length];
        write(MODE_KEY, next); apply();
        var target = document.querySelector('[data-mode-pick="' + next + '"]');
        if (target) target.focus();
      }
      if (event.key === 'Escape') {
        var controls = document.querySelector('[data-theme-controls][data-open]');
        if (controls) { controls.removeAttribute('data-open'); var t = document.querySelector('[data-theme-toggle]'); if (t) { t.setAttribute('aria-expanded', 'false'); t.focus(); } }
      }
    });
  }

  apply();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
  if (media && media.addEventListener) media.addEventListener('change', apply);
  window.addEventListener('storage', function (event) { if (event.key === MODE_KEY || event.key === ACCENT_KEY) apply(); });
})();
