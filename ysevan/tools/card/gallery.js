/*
 * 蓝调幻光卡册首页。
 *
 * 平铺列表是底：cards.json 一读到就先把玻璃列表建出来，任何情况下它都能用（≤600px 与 JS 出错时的常态）。
 * 视口 > 600px 时在列表上叠一个 Cover Flow 选卡台（屋主 2026-09-23 选定，替代此前的转盘 / 球）：
 *   正中一张端正朝屏幕、最大最近（translateZ 前移），两侧的卡侧立（rotateY ±60°、translateZ 后退）、等距排开、彼此重叠、越远越暗，
 *   13 张全部可见不裁切（间距按舞台宽算）。纯 CSS 3D，不用 WebGL（查看器自己用 three，画廊不再共用）。
 * 交互：滚轮 / 触控板横向或纵向滑、左右拖动、键盘 ← →、点两侧任一张转到中间、点中间那张进查看器；切换 380ms 苹果 ease，减弱动效直接切。
 * 全息扫光只在中间那张跟指针。舞台底是 D 星野（CSS，见 gallery.css）。
 * 按压（屋主给的组件 5）：只在中间那张。鼠标 / 触屏按下朝触点倾斜、缩小一点，全息光团向触点聚拢；拖出 6px 就算拖动、按压撤掉；
 * 键盘在中间卡或舞台上按空格 / 回车，按下时正压（不倾斜），松开时进查看器。减弱动效时只让光团原地淡入淡出。
 *
 * 自愈：collection/index.html 由生成器（holo-card-studio 的 Skill）在加卡时整页重写，只保留 <script src="./gallery.js" defer> 和 #cards。
 * 所以这里不指望页面带选卡台标记、主题控件、浅色 meta——缺什么补什么：选卡台的 DOM 缺了就建；theme.js 没加载就补一个 <script>。
 * 本文件写成既能当 module 也能当普通脚本。壳是苹果液态玻璃风（shared/theme.css，真源 docs/SPEC-apple-glass.md）：图标一律真 SVG 线条。
 */

// SVG 线条图标（ensureShowcase 在顶层就会用到，所以要在它之前定义——const 不提升）
const ICONS = {
  chevronRight: '<path d="m9 6 6 6-6 6"/>',
  chevronLeft: '<path d="m15 6-6 6 6 6"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>'
};
function icon(name, size = 20) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  el.setAttribute('viewBox', '0 0 24 24');
  el.setAttribute('aria-hidden', 'true');
  el.setAttribute('width', size);
  el.setAttribute('height', size);
  el.innerHTML = ICONS[name];
  return el;
}

const grid = document.querySelector('#cards');
const globeRoot = ensureShowcase();
const stage = globeRoot ? globeRoot.querySelector('#globe-stage') : null;
ensureTheme();

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const wide = matchMedia('(min-width: 601px)');

/** 切换动画：苹果 ease，380ms。 */
const EASE_MS = 380;

let cards = [];
let flow = null;

function ensureShowcase() {
  const existing = document.querySelector('#globe');
  if (existing || !grid) return existing;
  const host = document.createElement('div');
  host.innerHTML = `<div class="globe glass" id="globe" hidden>
        <div class="globe-display">
          <div class="globe-stage" id="globe-stage" tabindex="0" role="group" aria-roledescription="选卡台" aria-label="选卡台：左右滑动或拖动切换，左右方向键切换，回车打开当前卡"><div class="flow" id="flow"></div><div class="flow-refl" aria-hidden="true"></div></div>
        </div>
        <div class="globe-info" aria-live="polite">
          <p class="globe-meta"><span class="chip" id="globe-edition"></span><span class="chip chip-grey" id="globe-collection"></span></p>
          <h2 class="globe-title" id="globe-title"></h2>
          <p class="globe-subtitle" id="globe-subtitle"></p>
          <p class="globe-description" id="globe-description"></p>
          <div class="globe-actions">
            <button type="button" id="globe-prev" class="icon-btn" aria-label="上一张"></button>
            <a class="btn" id="globe-open" href="./"><span>打开这张卡</span></a>
            <button type="button" id="globe-next" class="icon-btn" aria-label="下一张"></button>
          </div>
        </div>
      </div>`;
  const node = host.firstElementChild;
  node.querySelector('#globe-prev').append(icon('chevronLeft'));
  node.querySelector('#globe-next').append(icon('chevronRight'));
  node.querySelector('#globe-open').append(icon('arrowRight', 18));
  grid.parentNode.insertBefore(node, grid);
  return node;
}

function ensureTheme() {
  if (window.__cardTheme || document.querySelector('script[src$="shared/theme.js"]')) return;
  const script = document.createElement('script');
  script.src = new URL('./shared/theme.js', document.baseURI).href;
  document.head.appendChild(script);
}

async function loadCollection() {
  const response = await fetch('./cards.json');
  if (!response.ok) throw new Error('卡册清单暂时无法读取');
  const list = await response.json();
  if (!Array.isArray(list) || !list.length) throw new Error('卡册暂无卡片');
  cards = list;
  buildGrid(list);
}

/** 封面读 web 版（cards/<id>/web/cover.webp，build-web-assets 生成）；cards.json 由生成器写、仍指向 cover.png，这里映射。 */
const webCover = card => (typeof card.cover === 'string' ? card.cover.replace(/(^|\/)cover\.png$/, '$1web/cover.webp') : card.cover);
/** web 版不存在（本机没跑构建）就回退源 PNG。 */
function loadCover(img, card) {
  const web = webCover(card);
  if (web !== card.cover) img.addEventListener('error', () => { img.src = card.cover; }, { once: true });
  img.src = web;
}

/** 回退列表：玻璃列表行——缩略图 + 标题/副标题 + 编号 chip + chevron。也是 ≤600px 的常态。 */
function buildGrid(list) {
  const fragment = document.createDocumentFragment();
  for (const card of list) {
    const link = document.createElement('a');
    link.className = 'row card';
    link.href = card.url;
    link.setAttribute('aria-label', `${card.title}，${card.edition}，打开互动闪卡`);
    link.style.setProperty('--accent-art', card.accent);
    link.style.setProperty('--matte', card.matte);
    const thumb = document.createElement('span');
    thumb.className = 'thumb';
    const img = document.createElement('img');
    img.alt = card.alt;
    img.decoding = 'async';
    img.loading = 'lazy';
    loadCover(img, card);
    thumb.append(img);
    const text = document.createElement('span');
    text.className = 't';
    const title = document.createElement('b');
    title.textContent = card.title;
    const sub = document.createElement('small');
    sub.textContent = `${card.subtitle} · ${[...new Set(card.themes || [])].join(' · ')}`;
    text.append(title, sub);
    const number = document.createElement('span');
    number.className = 'chip';
    number.textContent = card.edition;
    const chev = document.createElement('span');
    chev.className = 'chev';
    chev.append(icon('chevronRight', 18));
    link.append(thumb, text, number, chev);
    fragment.append(link);
  }
  grid.replaceChildren(fragment);
  const count = document.querySelector('#collection-count');
  if (count) count.textContent = `${list.length} 枚收藏`;
}

function showGrid() {
  globeRoot.hidden = true;
  grid.hidden = false;
}

function teardownFlow() {
  if (!flow) return;
  flow.dispose();
  flow = null;
  showGrid();
}

function syncFlow() {
  if (!cards.length || !globeRoot || !stage) return;
  if (!wide.matches) {
    teardownFlow();
    return;
  }
  if (flow) return;
  try {
    flow = createFlow(cards);
  } catch (error) {
    console.warn('选卡台无法创建，停在列表。', error);
    return;
  }
  grid.hidden = true;
  globeRoot.hidden = false;
  flow.start();
}
Object.defineProperty(window, '__cardGlobe', { get: () => flow, configurable: true });

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function createFlow(list) {
  const count = list.length;
  const controller = new AbortController();
  const { signal } = controller;
  const on = (target, type, handler, options) => target.addEventListener(type, handler, { ...options, signal });
  const track = stage.querySelector('#flow');
  track.replaceChildren();

  // ── 卡片 DOM ──
  const items = list.map((card, index) => {
    const link = document.createElement('a');
    link.className = 'flow-card';
    link.href = card.url;
    link.dataset.index = String(index);
    link.setAttribute('aria-label', `${card.title}，${card.edition}`);
    link.style.setProperty('--matte', card.matte);
    link.draggable = false;
    const img = document.createElement('img');
    img.alt = card.alt;
    img.decoding = 'async';
    img.draggable = false;
    loadCover(img, card);
    const shine = document.createElement('span');
    shine.className = 'flow-shine';
    shine.setAttribute('aria-hidden', 'true');
    const glow = document.createElement('span');
    glow.className = 'flow-press';
    glow.setAttribute('aria-hidden', 'true');
    link.append(img, shine, glow);
    track.append(link);
    return link;
  });

  const info = {
    edition: document.querySelector('#globe-edition'),
    collection: document.querySelector('#globe-collection'),
    subtitle: document.querySelector('#globe-subtitle'),
    title: document.querySelector('#globe-title'),
    description: document.querySelector('#globe-description'),
    open: document.querySelector('#globe-open'),
    prev: document.querySelector('#globe-prev'),
    next: document.querySelector('#globe-next')
  };

  let current = 0;
  let geometry = { H: 0, W: 0, step: 0, scale: 1 };
  let wheelAccumulated = 0;
  let wheelLockedUntil = 0;
  const pointer = { id: null, startX: 0, startY: 0, lastX: 0, moved: false, startCurrent: 0 };

  /*
   * 几何：按舞台高 H 定卡宽，按舞台宽定两侧间距，保证最远的第 6 张仍在舞台内。
   *   中间：宽 .50H，translateZ +.16H（投影后高 ≈ .81H，上下各留 ≈ .095H，**上下留白相等**，倒影住在下边距里、碰到舞台底之前淡完——
   *   屋主 2026-09-23「上下留白要对称」，倒影是装饰不是版面，放不下就缩倒影不推卡）；两侧：宽 .44H，rotateY ±60°，translateZ −.6H（透视 P = 2.2H，投影缩放 s = P/(P+.6H)）。
   *   第 d 张的 3D x = ±(x0 + (d−1)·step)，x0 = 中间卡半宽 + .28H；step 按该侧张数由舞台半宽反算，夹在 .015H–.15H（当前卡在边上时另一侧 12 张也全在）。
   */
  function measure() {
    const H = stage.clientHeight;
    const W = stage.clientWidth;
    const P = 2.2 * H;
    const scale = P / (P + 0.6 * H);
    const centerW = 0.50 * H;
    const sideW = 0.44 * H;
    const x0 = centerW / 2 + 0.28 * H;
    // reach：最远一张的 3D 中心 x 上限。侧立卡绕自身中心转 60°，两条竖边一近一远、投影倍率不同，
    // 按真实投影解（近边 dx=+.25w / dz=+.433w，远边 dx=−.25w / dz=−.433w），不用近似系数——
    // 旧的 .42 近似在舞台宽高比越大时越不够（2552 的笔记本上头尾两张各露出 2px）。
    const edge = 0.433 * sideW;
    const nearScale = P / (P + 0.6 * H - edge);
    const farScale = P / (P + 0.6 * H + edge);
    const limit = W / 2 - 10;
    const reach = Math.min(limit / nearScale - 0.25 * sideW, limit / farScale + 0.25 * sideW);
    geometry = { H, W, scale, centerW, sideW, x0, reach, P, step: 0 };
    stage.style.setProperty('--perspective', `${P}px`);
    stage.style.setProperty('--center-w', `${centerW}px`);
    stage.style.setProperty('--side-w', `${sideW}px`);
    stage.style.setProperty('--center-z', `${0.16 * H}px`);
    stage.style.setProperty('--side-z', `${-0.6 * H}px`);
  }

  /** 两侧各自按张数定间距：多的一侧压紧、少的一侧摊开，当前卡在最边上时另一侧 12 张也全在舞台内。 */
  function stepFor(n) {
    const { H, x0, reach } = geometry;
    return clamp((reach - x0) / Math.max(1, n - 1), 0.015 * H, 0.15 * H);
  }
  function place() {
    const { x0 } = geometry;
    const stepLeft = stepFor(current);
    const stepRight = stepFor(count - 1 - current);
    geometry.step = Math.min(stepLeft, stepRight);
    items.forEach((item, index) => {
      const d = index - current;
      const dist = Math.abs(d);
      const side = Math.sign(d);
      const step = side < 0 ? stepLeft : stepRight;
      item.classList.toggle('is-center', d === 0);
      item.style.setProperty('--x', d === 0 ? '0px' : `${side * (x0 + (dist - 1) * step)}px`);
      item.style.setProperty('--ry', d === 0 ? '0deg' : `${-side * 60}deg`);
      item.style.setProperty('--b', d === 0 ? '1' : String(Math.max(0.45, 1 - 0.09 * dist)));
      item.style.zIndex = String(count - dist);
      item.tabIndex = d === 0 ? 0 : -1;
      item.setAttribute('aria-current', d === 0 ? 'true' : 'false');
    });
  }

  function showCard(index) {
    if (pressed && index !== current) release();
    current = (index + count) % count;
    const card = list[current];
    info.edition.textContent = card.edition;
    if (info.collection) info.collection.textContent = [...new Set(card.themes || [])].join(' · ');
    info.subtitle.textContent = card.subtitle;
    info.title.textContent = card.title;
    info.description.textContent = card.description;
    info.open.href = card.url;
    info.open.setAttribute('aria-label', `打开 ${card.title}`);
    stage.setAttribute('aria-valuetext', `${card.title}，${card.edition}`);
    place();
  }

  function step(delta) {
    showCard(clamp(current + delta, 0, count - 1));
  }

  // ── 全息扫光：只在中间那张跟指针 ──
  on(track, 'pointermove', event => {
    if (!finePointer.matches || reduced.matches || pointer.id !== null) return;
    const center = items[current];
    const rect = center.getBoundingClientRect();
    const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);
    center.style.setProperty('--mx', `${x * 100}%`);
    center.style.setProperty('--my', `${y * 100}%`);
    center.classList.toggle('is-lit', event.target.closest('.flow-card') === center);
  });
  on(track, 'pointerleave', () => items[current].classList.remove('is-lit'));

  // ── 按压：中间那张按下倾斜、缩小、光团聚拢，松手弹簧复原（曲线在 gallery.css 的 .is-springing） ──
  const PRESS_TILT = 7; // 度，触点在卡边上时的最大倾角
  let pressed = null;   // { card, key }：key 为 true 表示是键盘按下的，松开时要进查看器
  let springTimer = 0;
  function press(card, fx, fy, key = false) {
    clearTimeout(springTimer);
    card.style.setProperty('--px', `${fx * 100}%`);
    card.style.setProperty('--py', `${fy * 100}%`);
    if (!reduced.matches) {
      // 触点那一侧往屏幕里压。CSS 的 y 朝下：rotateY 为正 → 右缘后退；rotateX 为正 → 上缘后退，所以下半边按下要取负
      card.style.setProperty('--pry', `${((fx - 0.5) * 2 * PRESS_TILT).toFixed(2)}deg`);
      card.style.setProperty('--prx', `${(-(fy - 0.5) * 2 * PRESS_TILT).toFixed(2)}deg`);
      card.style.setProperty('--ps', '0.96');
    }
    card.classList.remove('is-springing');
    card.classList.add('is-pressed');
    pressed = { card, key };
  }
  function release() {
    if (!pressed) return;
    const { card } = pressed;
    pressed = null;
    card.classList.remove('is-pressed');
    card.classList.add('is-springing');
    for (const name of ['--prx', '--pry', '--ps']) card.style.removeProperty(name);
    // 弹簧曲线只管这一次复原；留着的话下一次切卡也会过冲
    springTimer = setTimeout(() => card.classList.remove('is-springing'), 720);
  }

  // ── 拖动：横向位移换算成张数；没怎么动就是点击 ──
  on(stage, 'pointerdown', event => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    const center = items[current];
    if (event.target.closest('.flow-card') === center) {
      const rect = center.getBoundingClientRect();
      press(center, clamp((event.clientX - rect.left) / rect.width, 0, 1), clamp((event.clientY - rect.top) / rect.height, 0, 1));
    }
    pointer.id = event.pointerId;
    pointer.startX = pointer.lastX = event.clientX;
    pointer.startY = event.clientY;
    pointer.moved = false;
    pointer.startCurrent = current;
    stage.classList.add('is-dragging');
    stage.setPointerCapture(event.pointerId);
  });
  on(stage, 'pointermove', event => {
    if (event.pointerId !== pointer.id) return;
    const dx = event.clientX - pointer.startX;
    if (Math.abs(dx) > 6 || Math.abs(event.clientY - pointer.startY) > 6) {
      pointer.moved = true;
      if (pressed && !pressed.key) release();
    }
    const perCard = Math.max(40, geometry.step * geometry.scale * 1.6);
    const target = clamp(pointer.startCurrent - Math.round(dx / perCard), 0, count - 1);
    if (target !== current) showCard(target);
  });
  function endPointer(event) {
    if (event.pointerId !== pointer.id) return;
    pointer.id = null;
    stage.classList.remove('is-dragging');
    if (pressed && !pressed.key) release();
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
  }
  on(stage, 'pointerup', endPointer);
  on(stage, 'pointercancel', endPointer);
  // 点击：两侧的转到中间；中间的走链接进查看器；拖过的不算点击
  on(track, 'click', event => {
    const link = event.target.closest('.flow-card');
    if (!link) return;
    const index = Number(link.dataset.index);
    if (pointer.moved || index !== current) {
      event.preventDefault();
      if (!pointer.moved) showCard(index);
      pointer.moved = false;
    }
  });

  // ── 滚轮 / 触控板：横向或纵向都算，累计到阈值步进一张，锁 350ms 防惯性连翻 ──
  on(stage, 'wheel', event => {
    event.preventDefault();
    const now = performance.now();
    if (now < wheelLockedUntil) return;
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    wheelAccumulated += event.deltaMode === 1 ? delta * 16 : delta;
    if (Math.abs(wheelAccumulated) < 40) return;
    const direction = Math.sign(wheelAccumulated);
    wheelAccumulated = 0;
    wheelLockedUntil = now + 350;
    step(direction);
  }, { passive: false });

  // ── 键盘 ──
  on(stage, 'keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        step(-1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        step(1);
        break;
      case 'Enter':
      case ' ': {
        // 焦点在两侧某张卡上（点过它）就让链接自己处理；中间卡与舞台本身：按下只压卡，松开才打开（见 keyup）
        const card = event.target.closest('.flow-card');
        if (card && card !== items[current]) return;
        event.preventDefault();
        if (!event.repeat && !pressed) press(items[current], 0.5, 0.5, true);
        break;
      }
      case 'Home':
        event.preventDefault();
        showCard(0);
        break;
      case 'End':
        event.preventDefault();
        showCard(count - 1);
        break;
      default:
    }
  });
  on(stage, 'keyup', event => {
    if ((event.key !== 'Enter' && event.key !== ' ') || !pressed?.key) return;
    event.preventDefault();
    release();
    location.href = list[current].url;
  });
  // 按住时焦点被抢走 / 切走窗口，keyup 永远不来：只复原，不打开
  on(stage, 'focusout', () => { if (pressed?.key) release(); });
  on(window, 'blur', release);
  on(info.prev, 'click', () => step(-1));
  on(info.next, 'click', () => step(1));

  const resizeObserver = new ResizeObserver(() => {
    measure();
    place();
  });
  resizeObserver.observe(stage);

  return {
    /** 只给测试脚本看的状态快照。 */
    state() {
      return { mode: 'flow', count, current, step: geometry.step, centerW: geometry.centerW, stageW: geometry.W, stageH: geometry.H, transition: getComputedStyle(items[current]).transitionDuration, pressed: pressed ? { key: pressed.key } : null };
    },
    start() {
      measure();
      // 开场停在正中那张（13 张就是第 7 张），两侧对称，一眼看出是 Cover Flow；不然第 1 张在最左、整叠堆在右边
      showCard(Math.floor((count - 1) / 2));
    },
    dispose() {
      clearTimeout(springTimer);
      controller.abort();
      resizeObserver.disconnect();
      stage.classList.remove('is-dragging');
      track.replaceChildren();
    }
  };
}

loadCollection()
  .then(syncFlow)
  .catch(error => {
    const status = document.createElement('p');
    status.className = 'status';
    status.setAttribute('role', 'alert');
    status.textContent = `${error.message}。请刷新重试。`;
    grid.replaceChildren(status);
  });
wide.addEventListener('change', () => {
  syncFlow();
});
