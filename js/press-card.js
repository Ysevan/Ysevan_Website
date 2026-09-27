// 老站卡片的按压反馈（2026-09-27）：按下时卡片朝触点方向轻轻倾斜、缩小一点，
// 一团柔光聚拢到触点；松手弹性复原，柔光散开淡掉。鼠标、触屏、键盘（回车 / 空格）都能触发。
//
// 给老站共用（现在接着的是 EV's world 的 Explore、ACGN 两页；书生子白四页和 Game 页 2026-09-27 已删），
// 颜色和幅度由各页自己传进来，跟着各站原来的风格走：
//   PressCard.bind({ links: 'a.link-block', target: function (a) { return a; },
//                    glow: 'rgba(23,132,251,.35)', tilt: 5, scale: 0.975 });
// 只接有真实去处的链接：href 为空或 "#" 的占位卡片不接（点了哪也不去，按压反馈只会让人以为坏了）。
//
// 规矩：动画只动 transform 和 opacity；减弱动效时卡片不动，柔光只在触点淡入淡出。
// 不改原页面的样式表：位移和倾斜写在元素的行内 transform 上（叠在它原有的 transform 后面），
// 柔光是运行时插进去的一个 span，松手动画结束后行内样式还原。
(function () {
  'use strict';
  var reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var PRESS = 'transform .16s cubic-bezier(.2, .7, .3, 1)';
  var BACK = 'transform .6s cubic-bezier(.34, 1.56, .64, 1)';

  function realHref(a) {
    var h = a.getAttribute('href');
    return h != null && h.trim() !== '' && h.trim() !== '#';
  }

  function setup(a, box, opt) {
    if (box.__pressCard) return;
    box.__pressCard = true;
    var cs = getComputedStyle(box);
    if (cs.position === 'static') box.style.position = 'relative';
    if (cs.overflow === 'visible') box.style.overflow = 'hidden';

    var glow = document.createElement('span');
    glow.setAttribute('aria-hidden', 'true');
    glow.className = 'press-card-glow';
    var size = 320;
    glow.style.cssText = 'position:absolute;left:50%;top:50%;width:' + size + 'px;height:' + size + 'px;' +
      'margin:-' + size / 2 + 'px 0 0 -' + size / 2 + 'px;border-radius:50%;pointer-events:none;' +
      'z-index:' + (opt.glowZ == null ? 1 : opt.glowZ) + ';' +
      'background:radial-gradient(closest-side,' + opt.glow + ',transparent);' +
      (opt.blend ? 'mix-blend-mode:' + opt.blend + ';' : '') +
      'opacity:0;transform:translate(0,0) scale(1.9);transition:transform .45s ease,opacity .45s ease;';
    box.appendChild(glow);

    // 元素原来的行内 transform / transition 和页面给它的 transition，开局记一次；
    // 我们的 transform 叠在原来的后面，transition 追加在页面原有的后面（同名属性后写的生效）
    var inlineTransform = box.style.transform || '';
    var inlineTransition = box.style.transition || '';
    var pageTransition = getComputedStyle(box).transition;
    if (!pageTransition || /^all 0s ease 0s$/.test(pageTransition)) pageTransition = '';
    var pressed = false, pointer = null, raf = 0, last = null;
    function base() { return pageTransition; }
    var restTransform = inlineTransform;
    var lastPersp = 800; // 弹回用按下时同一个透视距离，否则过渡中途透视会跟着变

    function aim(x, y) {
      var r = box.getBoundingClientRect();
      var w = box.offsetWidth || r.width, h = box.offsetHeight || r.height;
      var px = Math.min(Math.max((x - r.left) / r.width, 0), 1);
      var py = Math.min(Math.max((y - r.top) / r.height, 0), 1);
      glow.style.transform = 'translate(' + ((px - 0.5) * w).toFixed(1) + 'px,' + ((py - 0.5) * h).toFixed(1) + 'px) scale(1)';
      if (reduce.matches) return;
      // 触点那一侧往里压（右边按下 → rotateY 为正，上边按下 → rotateX 为正；正负号是量出来的）。
      // 透视距离跟着卡片大小走，宽横条和小按钮倾斜同样角度时看起来一样轻
      var persp = lastPersp = Math.max(800, 2 * Math.max(w, h));
      box.style.transform = (restTransform ? restTransform + ' ' : '') + 'perspective(' + persp + 'px) rotateX(' +
        ((0.5 - py) * 2 * opt.tilt).toFixed(2) + 'deg) rotateY(' + ((px - 0.5) * 2 * opt.tilt).toFixed(2) + 'deg) scale(' + opt.scale + ')';
    }

    function press(x, y) {
      // 挂着入场动画（WOW.js 的 fadeInUp，fill-mode both 停在最后一帧）时，动画值会一直盖住行内 transform，
      // 倾斜就出不来；那段动画早就播完了，按下时摘掉它，外观不变
      if (getComputedStyle(box).animationName !== 'none') box.style.animation = 'none';
      var b = base();
      pressed = true;
      box.classList.add('is-pressed');
      if (!reduce.matches) box.style.transition = (b ? b + ', ' : '') + PRESS;
      glow.style.transition = reduce.matches ? 'opacity .2s linear' : 'transform .22s cubic-bezier(.2, .7, .3, 1), opacity .16s ease-out';
      glow.style.opacity = '1';
      if (x == null) {
        var r = box.getBoundingClientRect();
        x = r.left + r.width / 2; y = r.top + r.height / 2;
      }
      aim(x, y);
    }

    function release() {
      if (!pressed) return;
      pressed = false;
      box.classList.remove('is-pressed');
      glow.style.transition = reduce.matches ? 'opacity .2s linear' : 'transform .45s ease, opacity .45s ease';
      glow.style.opacity = '0';
      if (!reduce.matches) {
        glow.style.transform = glow.style.transform.replace(/scale\([^)]*\)/, 'scale(1.9)');
        var b = base();
        box.style.transition = (b ? b + ', ' : '') + BACK;
        box.style.transform = (restTransform ? restTransform + ' ' : '') + 'perspective(' + lastPersp + 'px) rotateX(0deg) rotateY(0deg) scale(1)';
      }
    }

    box.addEventListener('transitionend', function (ev) {
      if (ev.target !== box || ev.propertyName !== 'transform' || pressed) return;
      // 弹回结束：行内样式还原成原来的样子
      box.style.transform = inlineTransform;
      box.style.transition = inlineTransition;
    });

    a.addEventListener('pointerdown', function (ev) {
      if (ev.pointerType === 'mouse' && ev.button !== 0) return;
      pointer = ev.pointerId;
      press(ev.clientX, ev.clientY);
    });
    a.addEventListener('pointermove', function (ev) {
      if (ev.pointerId !== pointer) return;
      last = ev;
      if (!raf) raf = requestAnimationFrame(function () { raf = 0; if (pointer != null && last) aim(last.clientX, last.clientY); });
    });
    function end(ev) {
      if (ev && ev.pointerId !== pointer) return;
      pointer = null; last = null;
      release();
    }
    a.addEventListener('pointerup', end);
    a.addEventListener('pointercancel', end); // 触屏上开始滚动页面时浏览器会发这个
    a.addEventListener('pointerleave', end);
    a.addEventListener('keydown', function (ev) {
      if (ev.isComposing || ev.keyCode === 229 || ev.repeat) return;
      if (ev.key === 'Enter' || ev.key === ' ') {
        if (ev.key === ' ') ev.preventDefault(); // 空格别滚页面；松开时当点击
        press();
      }
    });
    a.addEventListener('keyup', function (ev) {
      if (ev.key !== 'Enter' && ev.key !== ' ') return;
      var was = pressed;
      release();
      if (ev.key === ' ' && was) a.click();
    });
    a.addEventListener('blur', release);
  }

  window.PressCard = {
    bind: function (opt) {
      var o = {
        links: opt.links,
        target: opt.target || function (a) { return a; },
        glow: opt.glow || 'rgba(255,255,255,.35)',
        blend: opt.blend || '',
        glowZ: opt.glowZ,
        tilt: opt.tilt == null ? 5 : opt.tilt,
        scale: opt.scale == null ? 0.975 : opt.scale
      };
      var list = document.querySelectorAll(o.links);
      for (var i = 0; i < list.length; i++) {
        var a = list[i];
        if (!realHref(a)) continue;
        if (!a.textContent.trim() && !a.querySelector('img')) continue; // 模板里多出来的空链接
        var box = o.target(a);
        if (box) setup(a, box, o);
      }
    }
  };
})();
