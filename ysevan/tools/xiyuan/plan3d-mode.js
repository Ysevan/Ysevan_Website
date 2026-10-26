// 平面俯视，米家式三维剖切图（2026-10-26，屋主「把现有的平面俯视整体换成米家风格」）。
// 同一个模式按钮、同一个名字、同一个位置。app.js 只多两行：import，和末尾一次 installPlanView({...})。
// 这里不改模式流程：app.js 的 prepare('plan') / changeMode('plan') 照旧先跑（剖切、按钮状态、房间说明、换布置后留在平面），
// 本模块看 body[data-mode] 变成 plan 时接手镜头和画面，离开时把借用的东西还回去。
// ?plan=classic 回到旧的平面俯视（正上方俯视，0.35 米剖切，房间标签进漫游），对照截图或屋主想换回来时用。
import * as THREE from 'three';
import {CUT, LAYERS, PART_LAYER, COLORS, SOURCES, loadData, buildScene, markerSpecs, placeLabels, unitRooms, boxOf, shortName} from './plan3d-layers.js?v=c943babeef';
import {exportDrawing} from './plan3d-export.js?v=7dfcf36dc9';
import {LAYOUTS} from './layout-data.js?v=177b5128ed';
import {PRESETS} from './design-presets.js?v=0154371027';

const FOV = 16, POLAR = 38 * Math.PI / 180, TOP = .002, STORE = 'xiyuan-plan3d-v1';
const icon = (n, cls = 'i') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
// Plain names: the middle-dot separators in the layout and style names become a space (UI text keeps to ，。、（）).
const plain = s => String(s || '').replace(/\s*·\s*/g, ' ').trim();

// A failure here must never stop the rest of the page (and node harnesses that run app.js without a browser skip it).
export function installPlanView(ctx) {
  if (typeof document === 'undefined' || typeof MutationObserver !== 'function' || typeof requestAnimationFrame !== 'function' || typeof location === 'undefined') return null;
  try {return install(ctx);} catch (e) {console.warn('plan view unavailable', e); return null;}
}
function install(ctx) {
  const params = new URLSearchParams(location.search);
  if (params.get('plan') === 'classic') {document.body.classList.add('plan-classic'); return {classic: true};}
  const {THREE: T = THREE, scene, camera, controls, renderer} = ctx, $ = id => document.getElementById(id);
  const phone = () => !!ctx.ui?.phone;
  const S = {active: false, rot: 0, top: false, focusRoom: null, data: null, built: null, key: '', anim: null, lastFov: camera.fov, prevMode: document.body.dataset.mode,
    layers: {}, saved: null, dirty: true, lastCam: '', obstacles: [], obstaclesAt: 0, stats: {placed: 0, hidden: 0}};
  const root = new T.Group(); root.name = 'plan3d'; root.visible = false; scene.add(root);

  // --- layer state, kept per device class ---------------------------------------------------------------------------------------
  let store = {}; try {store = JSON.parse(localStorage.getItem(STORE) || '{}') || {};} catch {}
  const cls = () => phone() ? 'phone' : 'desk';
  function loadLayers() {const own = store[cls()] || {}; for (const l of LAYERS) S.layers[l.id] = typeof own[l.id] === 'boolean' ? own[l.id] : l[cls()];}
  function saveLayers() {store[cls()] = {...S.layers}; try {localStorage.setItem(STORE, JSON.stringify(store));} catch {}}
  loadLayers();

  // --- DOM: the controls inside the room card (desktop), a bar over the tab bar (phone), and the label overlay ------------------------
  const kit = document.createElement('div'); kit.id = 'p3Kit';
  kit.innerHTML = `<div class="p3-chips" role="group" aria-label="图层">${LAYERS.map(l => `<button type="button" class="p3-chip" data-layer="${l.id}" aria-pressed="false">${icon(l.icon)}<span>${l.label}</span></button>`).join('')}</div>
<div class="p3-actions" role="group" aria-label="视角与导出"><button type="button" data-p3="left" aria-label="向左转90度" title="向左转90度（Q）">${icon('rotate-ccw')}</button><button type="button" data-p3="right" aria-label="向右转90度" title="向右转90度（E）">${icon('rotate-cw')}</button><button type="button" data-p3="tilt" aria-pressed="false" title="正上方看，或斜着看（T）">${icon('plan')}<span>正上方</span></button><button type="button" data-p3="reset" title="回到全户">${icon('maximize')}<span>全户</span></button><span class="p3-north" aria-label="指北"><i>${icon('north')}</i><small>北</small></span><button type="button" class="primary p3-export" data-p3="export">${icon('download')}<span>导出图纸</span></button></div>
<div class="p3-room-actions" hidden><button type="button" class="outline small" data-p3="walk">${icon('footprints')}<span>走进这个房间</span></button><button type="button" class="outline small" data-p3="back">${icon('maximize')}<span>回到全户</span></button></div>
<ul class="p3-legend" aria-label="图例"><li><i class="sw sw-bearing"></i>承重墙，不可拆改</li><li><i class="sw sw-cap"></i>其他墙，1.2米处剖开</li><li><i class="sw sw-bay"></i>飘窗台，不可拆</li><li><i class="sw sw-water"></i>水点，坐标已锁定</li><li><i class="sw sw-dim"></i>尺寸 mm，以 DWG 为准</li></ul>
<p class="p3-note">开关插座、灯位、空调是设计示意，不是强弱电图。</p>`;
  $('roomLabel')?.append(kit);
  const bar = document.createElement('div'); bar.id = 'p3Bar'; bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', '平面俯视');
  bar.innerHTML = `<button type="button" data-p3="layers" aria-label="图层">${icon('layers')}<small>图层</small></button><button type="button" data-p3="left" aria-label="向左转90度">${icon('rotate-ccw')}<small>左转</small></button><button type="button" data-p3="right" aria-label="向右转90度">${icon('rotate-cw')}<small>右转</small></button><button type="button" data-p3="tilt" aria-pressed="false" aria-label="正上方看">${icon('plan')}<small>正上方</small></button><button type="button" data-p3="reset" aria-label="回到全户">${icon('maximize')}<small>全户</small></button><button type="button" data-p3="export" aria-label="导出图纸">${icon('download')}<small>导出</small></button><span class="p3-north" aria-label="指北"><i>${icon('north')}</i><small>北</small></span>`;
  document.body.append(bar);
  const overlay = document.createElement('div'); overlay.id = 'p3Overlay'; overlay.setAttribute('aria-label', '平面图标注');
  const NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg'), leaders = document.createElementNS(NS, 'path'), dots = document.createElementNS(NS, 'path');
  svg.setAttribute('class', 'p3-leaders'); leaders.setAttribute('class', 'p3-leader'); dots.setAttribute('class', 'p3-dot'); svg.append(leaders, dots);
  const labelBox = document.createElement('div'); labelBox.className = 'p3-labels'; overlay.append(svg, labelBox);
  ($('roomPins') || document.body).after(overlay);

  // --- helpers ------------------------------------------------------------------------------------------------------------------
  const focusUnit = () => ctx.focusUnit || 'floor', owner = () => focusUnit() === 'bl';
  const scopeRooms = () => focusUnit() === 'floor' ? [] : unitRooms(ctx.rooms, focusUnit());
  const scopeBox = () => {if (S.focusRoom) {const r = ctx.rooms.find(q => q.id === S.focusRoom); if (r) return boxOf([r], .8);} return focusUnit() === 'floor' ? boxOf(ctx.rooms, .6) : boxOf(scopeRooms(), .35);};
  const styleName = () => {const id = document.querySelector('[data-preset][aria-pressed="true"]')?.dataset.preset, p = PRESETS[id]; return p ? `${p.letter} ${plain(p.name)}` : '';};
  const layoutName = () => plain(LAYOUTS[ctx.layout]?.name || '');
  const wallsNow = () => ctx.layout === 'central' ? ctx.walls.central : ctx.walls.original;
  const dirOf = (rot, top) => {const th = rot * Math.PI / 2, ph = top ? TOP : POLAR; return new T.Vector3(Math.sin(ph) * Math.sin(th), Math.cos(ph), Math.sin(ph) * Math.cos(th));};

  // The free part of the screen (left of the tools, right of the room card, between the top bars and the mode bar), in CSS px.
  function safeRect(W = innerWidth, H = innerHeight) {
    const u = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--u')) || 1, vis = el => el && !el.hidden && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden' && getComputedStyle(el).display !== 'none';
    let l = 0, t = 0, r = W, b = H;
    for (const s of ['.unit-nav', 'header .header-actions', '#uiDock']) {const el = document.querySelector(s); if (vis(el)) {const q = el.getBoundingClientRect(); if (q.bottom < H * .35) t = Math.max(t, q.bottom);}}
    for (const s of ['.mode-bar', '#p3Bar', '.footer-meta']) {const el = document.querySelector(s); if (vis(el)) {const q = el.getBoundingClientRect(); if (q.top > H * .55) b = Math.min(b, q.top);}}
    const card = $('roomLabel'); if (vis(card)) {const q = card.getBoundingClientRect(); if (q.width < W * .45 && q.height > H * .3) l = Math.max(l, q.right); else if (q.bottom < H * .3) t = Math.max(t, q.bottom);}
    const tools = document.querySelector('.tools'); if (vis(tools)) {const q = tools.getBoundingClientRect(); if (q.left > W * .6) r = Math.min(r, q.left);}
    const design = $('designPanel'); if (vis(design)) {const q = design.getBoundingClientRect(); if (q.left > W * .4) r = Math.min(r, q.left);}
    const pad = (phone() ? 10 : 22) * u;
    return {x: l + pad, y: t + pad, w: Math.max(80, r - l - 2 * pad), h: Math.max(80, b - t - 2 * pad)};
  }
  // Fit a plan box (and its cut-height walls) into rect of a W×H view seen from dir: returns target and distance.
  function fit(box, rect, W, H, dir, fov = FOV) {
    const cam = new T.PerspectiveCamera(fov, W / H, .5, 2000), c = new T.Vector3((box.x0 + box.x1) / 2, 0, (box.z0 + box.z1) / 2);
    const pts = []; for (const x of [box.x0, box.x1]) for (const z of [box.z0, box.z1]) for (const y of [0, CUT]) pts.push(new T.Vector3(x, y, z));
    let dist = Math.max(box.x1 - box.x0, box.z1 - box.z0) / Math.tan(fov * Math.PI / 360);
    const target = c.clone(), v = new T.Vector3(), right = new T.Vector3(), up = new T.Vector3();
    for (let i = 0; i < 6; i++) {
      cam.position.copy(target).addScaledVector(dir, dist); cam.up.set(0, 1, 0); cam.lookAt(target); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const p of pts) {v.copy(p).project(cam); const sx = (v.x * .5 + .5) * W, sy = (-v.y * .5 + .5) * H; x0 = Math.min(x0, sx); x1 = Math.max(x1, sx); y0 = Math.min(y0, sy); y1 = Math.max(y1, sy);}
      const k = Math.max((x1 - x0) / rect.w, (y1 - y0) / rect.h), wpp = 2 * dist * Math.tan(fov * Math.PI / 360) / H;
      right.setFromMatrixColumn(cam.matrixWorld, 0); up.setFromMatrixColumn(cam.matrixWorld, 1);
      const dx = (rect.x + rect.w / 2) - (x0 + x1) / 2, dy = (rect.y + rect.h / 2) - (y0 + y1) / 2;
      target.addScaledVector(right, -dx * wpp).addScaledVector(up, dy * wpp); dist *= k;
    }
    return {target, dist};
  }

  // --- camera animation (spherical around the target, with the field of view), driven from this module's frame loop ------------------
  function animateTo(target, dist, dir, ms = 900) {
    const sph0 = new T.Spherical().setFromVector3(camera.position.clone().sub(controls.target)), sph1 = new T.Spherical().setFromVector3(dir.clone().multiplyScalar(dist));
    let dt = sph1.theta - sph0.theta; while (dt > Math.PI) dt -= 2 * Math.PI; while (dt < -Math.PI) dt += 2 * Math.PI;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    S.anim = {t0: performance.now(), ms: reduce ? 1 : ms, sph0, sph1, dt, tg0: controls.target.clone(), tg1: target.clone(), fov0: camera.fov};
    controls.maxDistance = Math.max(110, dist * 1.8); controls.minDistance = Math.min(8, dist * .3);
    ctx.invalidate(ms + 200);
  }
  function stepAnim(now) {
    const a = S.anim; if (!a) return;
    const u = Math.min(1, (now - a.t0) / a.ms), e = u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
    const s = new T.Spherical(a.sph0.radius + (a.sph1.radius - a.sph0.radius) * e, a.sph0.phi + (a.sph1.phi - a.sph0.phi) * e, a.sph0.theta + a.dt * e);
    controls.target.lerpVectors(a.tg0, a.tg1, e); camera.position.setFromSpherical(s).add(controls.target);
    setFov(a.fov0 + (FOV - a.fov0) * e); camera.lookAt(controls.target); ctx.invalidate(150);
    if (u >= 1) {S.anim = null; controls.update();}
  }
  function setFov(f) {ctx.setFov(f); camera.updateProjectionMatrix();}
  function frameScope(ms = 900) {const W = innerWidth, H = innerHeight, f = fit(scopeBox(), safeRect(W, H), W, H, dirOf(S.rot, S.top)); animateTo(f.target, f.dist, dirOf(S.rot, S.top), ms);}
  // Turning and tilting re-fit the unit (or the room in focus): its outline changes proportion with the view.
  function turn(step) {S.rot = (S.rot + step + 4) % 4; S.built?.setVeil(dirOf(S.rot, S.top)); frameScope(700); syncButtons(); S.dirty = true;}
  function tilt() {S.top = !S.top; S.built?.setVeil(dirOf(S.rot, S.top)); frameScope(700); syncButtons();}

  // --- furniture in clay: flat, light, desaturated (Mijia's map); original materials come back on leaving -------------------------------
  const clay = new Map(), swapped = new Map();
  const clayColor = (src, out) => {const hsl = {}; src.color.getHSL(hsl); return out.setHSL(hsl.h, hsl.s * .18, Math.min(.95, .6 + hsl.l * .36));};
  const clayable = m => m && (m.isMeshStandardMaterial || m.isMeshLambertMaterial || m.isMeshPhongMaterial) && !m.transparent && !m.alphaMap && m.opacity >= 1;
  // Everything is cut at the same height, also the pieces the scene leaves whole (tall cabinets, shelves of the layouts 02 to 04);
  // a piece cut here for the first time shows its inside faces, so the cut reads as solid.
  const cutPlane = new T.Plane(new T.Vector3(0, -1, 0), CUT);
  function clayOf(m) {let c = clay.get(m); if (!c) {const own = !(m.clippingPlanes && m.clippingPlanes.length); c = new T.MeshLambertMaterial({side: own ? T.DoubleSide : m.side, clippingPlanes: own ? [cutPlane] : m.clippingPlanes, clipShadows: m.clipShadows, polygonOffset: m.polygonOffset, polygonOffsetFactor: m.polygonOffsetFactor, polygonOffsetUnits: m.polygonOffsetUnits, vertexColors: false}); c.userData.clay = true; clay.set(m, c);} clayColor(m, c.color); return c;}
  function swapFurniture(on) {
    if (on) {ctx.groups.allFurnishings?.traverse(o => {if (!o.isMesh || swapped.has(o)) return; const m = o.material; if (Array.isArray(m) ? !m.every(clayable) : !clayable(m)) return; swapped.set(o, m); o.material = Array.isArray(m) ? m.map(clayOf) : clayOf(m);});}
    else {for (const [o, m] of swapped) o.material = m; swapped.clear();}
  }
  // Furniture wholly outside the unit in focus is hidden (the veil covers the neighbours, but tall lamps and shelves would poke through
  // it; it also saves drawing them). Shown again on leaving or on a scope change.
  const offstage = new Set();
  function hideOutside(box) {
    for (const o of offstage) o.visible = true; offstage.clear();
    if (!box) return;
    const b = new T.Box3(), u = new T.Box3(new T.Vector3(box.x0 - .5, -1, box.z0 - .5), new T.Vector3(box.x1 + .5, 9, box.z1 + .5));
    ctx.groups.allFurnishings?.updateMatrixWorld(true);
    ctx.groups.allFurnishings?.traverse(o => {if (!o.isMesh || !o.visible || !o.geometry) return; o.geometry.boundingBox ?? o.geometry.computeBoundingBox(); b.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld); if (!b.intersectsBox(u)) {o.visible = false; offstage.add(o);}});
  }
  function refreshClay() {for (const [src, c] of clay) clayColor(src, c.color); ctx.invalidate(300);}

  // --- 3D layers ----------------------------------------------------------------------------------------------------------------
  function rebuild(force = false) {
    const key = [ctx.layout, focusUnit(), S.focusRoom, !!S.data].join('|');
    if (!force && key === S.key && S.built) return;
    S.key = key;
    if (S.built) {root.remove(S.built.group); S.built.group.traverse(o => {if (o.isMesh) {o.geometry.dispose(); o.material.dispose();}});}
    const rooms = scopeRooms(), box = focusUnit() === 'floor' ? boxOf(ctx.rooms, .6) : boxOf(rooms, .35);
    // The owner's load-bearing walls reach past the rooms (the south-east party wall): keep them inside the unit box (veil hole).
    if (owner() && S.data) for (const w of S.data.bearing) for (const [x, z] of w.polygon) {box.x0 = Math.min(box.x0, x - .1); box.z0 = Math.min(box.z0, z - .1); box.x1 = Math.max(box.x1, x + .1); box.z1 = Math.max(box.z1, z + .1);}
    S.built = buildScene({walls: wallsNow(), data: S.data, rooms: ctx.rooms, focusRooms: rooms, unitBox: box, wins: focusUnit() === 'floor' ? [] : ctx.winSegments, scene, layout: ctx.layout, focusRoom: S.focusRoom, owner: owner(), veil: '#' + scene.background.getHexString(), soft: ctx.renderTier === 'soft'});
    // Marks read the scene once per build (the switch and socket instances), not every frame.
    S.marks = owner() ? markerSpecs({data: S.data, scene, layout: ctx.layout, unitBox: box}) : [];
    root.add(S.built.group); S.built.setVeil(dirOf(S.rot, S.top)); hideOutside(focusUnit() === 'floor' ? null : box); applyLayerVisibility(); S.dirty = true; ctx.invalidate(400, true);
  }
  function applyLayerVisibility() {
    if (!S.built) return;
    for (const [k, m] of Object.entries(S.built.parts)) m.visible = !PART_LAYER[k] || !!S.layers[PART_LAYER[k]];
    for (const b of kit.querySelectorAll('[data-layer]')) {const id = b.dataset.layer, ownOnly = !['rooms', 'dims', 'doors'].includes(id), off = ownOnly && !owner();
      b.setAttribute('aria-pressed', String(!!S.layers[id])); b.disabled = off || (focusUnit() === 'floor' && id !== 'rooms'); b.title = b.disabled ? '这一层只做了我的 B 户型' : '';}
    S.dirty = true; ctx.invalidate(300);
  }

  // --- the card text ------------------------------------------------------------------------------------------------------------
  function syncCard() {
    const r = S.focusRoom && ctx.rooms.find(q => q.id === S.focusRoom), unit = ctx.unitNames?.[focusUnit()] || '整层';
    $('roomKicker').textContent = '平面俯视';
    $('roomTitle').textContent = r ? shortName(r.name) : unit;
    const dims = r && S.built ? S.built.dims.filter(d => d.room === r.id) : [], dx = dims.find(d => d.axis === 'x'), dz = dims.find(d => d.axis === 'z');
    $('roomDesc').textContent = r ? [dx && dz ? `净宽${dx.mm}，净深${dz.mm}（mm）` : '', plain(r.desc || '')].filter(Boolean).join('。').replace(/。。/g, '。')
      : owner() ? `${layoutName()}，${styleName()}。墙体在1.2米高处剖开，点房间可以放大。` : focusUnit() === 'floor' ? '四户住宅和公区。点户型名字放大，施工图层只做了我的 B 户型。' : '邻居户型按 CAD 复建，施工图层只做了我的 B 户型。';
    kit.querySelector('.p3-room-actions').hidden = !r; kit.classList.toggle('focused', !!r);
    syncButtons();
  }
  function syncButtons() {
    for (const b of document.querySelectorAll('[data-p3="tilt"]')) {b.setAttribute('aria-pressed', String(S.top)); b.innerHTML = S.top ? `${icon('box')}<${b.closest('#p3Bar') ? 'small' : 'span'}>斜着看</${b.closest('#p3Bar') ? 'small' : 'span'}>` : `${icon('plan')}<${b.closest('#p3Bar') ? 'small' : 'span'}>正上方</${b.closest('#p3Bar') ? 'small' : 'span'}>`; b.setAttribute('aria-label', S.top ? '斜着看' : '正上方看');}
    for (const b of document.querySelectorAll('[data-p3="export"]')) {b.disabled = !owner(); b.title = owner() ? '导出当前视角的图纸（PNG，宽3200像素）' : '导出图纸只做了我的 B 户型';}
  }

  // --- overlay: room names, marks with leaders, dimension figures; placed without overlaps ------------------------------------------------
  const els = new Map(), sizes = new Map(), v3 = new T.Vector3();
  function project(x, y, z, cam = camera, W = innerWidth, H = innerHeight) {v3.set(x, y, z).project(cam); return v3.z > 1 || v3.z < -1 ? null : [(v3.x * .5 + .5) * W, (-v3.y * .5 + .5) * H];}
  // The things to label, in plan metres, for the current scope and layers (shared with the export).
  function specs() {
    const out = [], fu = focusUnit();
    if (S.layers.rooms) {
      if (fu === 'floor') for (const [id, name] of Object.entries(ctx.unitNames || {})) {const c = ctx.unitCenters?.[id]; if (c) out.push({kind: 'room', key: 'unit.' + id, text: name, unit: id, at: [c[0], 0, c[1]], prio: 1});}
      else for (const r of scopeRooms()) out.push({kind: 'room', key: 'room.' + r.id, text: shortName(r.name), room: r.id, at: [r.x, 0, r.z], prio: 1, on: r.id === S.focusRoom});
    }
    if (fu === 'floor' || !S.built) return out;
    // A room in focus: only what is in it (and just around it) gets a label.
    const fb = S.focusRoom ? scopeBox() : null, inF = ([x, , z]) => !fb || (x >= fb.x0 && x <= fb.x1 && z >= fb.z0 && z <= fb.z1);
    if (S.layers.dims) for (const d of S.built.dims) if (inF([(d.a[0] + d.b[0]) / 2, 0, (d.a[1] + d.b[1]) / 2])) out.push({kind: 'dim', key: `dim.${d.room || 'fit'}.${d.axis || ''}.${d.a}.${d.b}`, text: d.text || String(d.mm), at: [(d.a[0] + d.b[0]) / 2, CUT + .02, (d.a[1] + d.b[1]) / 2], prio: d.fitout ? 4 : 3, tight: d.tight});
    if (owner()) for (const m of S.marks || []) if (S.layers[m.layer] && m.anchors.some(inF)) out.push({...m, kind: 'mark', key: m.id, prio: m.prio ?? ({water: 3, ac: 4, sockets: 5, lights: 6}[m.layer] ?? 5)});
    return out;
  }
  function el(it) {
    let e = els.get(it.key);
    if (!e) {
      if (it.kind === 'room') {e = document.createElement('button'); e.type = 'button'; e.className = 'p3-room'; e.addEventListener('click', () => it.unit ? ctx.selectUnit(it.unit) : focusRoomTo(it.room));}
      else if (it.kind === 'dim') {e = document.createElement('span'); e.className = 'p3-dim';}
      else {e = document.createElement('div'); e.className = 'p3-mark'; e.dataset.layer = it.layer; if (it.tone) e.dataset.tone = it.tone; e.innerHTML = `<span class="p3-ic">${it.badge ? `<b>${it.badge}</b>` : it.icon ? icon(it.icon) : ''}</span><span class="p3-tx"></span>`; if (!it.icon && !it.badge) e.classList.add('p3-flag');}
      e.dataset.key = it.key; els.set(it.key, e); labelBox.append(e);
    }
    return e;
  }
  function measure(it) {
    const e = el(it), text = it.text, k = it.kind + '|' + (it.layer || '') + '|' + (it.badge || '') + '|' + text;
    if (it.kind === 'mark') e.querySelector('.p3-tx').textContent = text; else e.textContent = text;
    e.classList.toggle('on', !!it.on); e.classList.toggle('tight', !!it.tight);
    if (!sizes.has(k)) {e.classList.remove('icon-only'); e.hidden = false; e.style.transform = 'translate(-9999px,0)'; const ic = e.querySelector('.p3-ic'); sizes.set(k, {w: e.offsetWidth, h: e.offsetHeight, wIcon: ic ? ic.offsetWidth : e.offsetWidth});}
    return sizes.get(k);
  }
  function obstacles() {
    const now = performance.now(); if (now - S.obstaclesAt < 400) return S.obstacles; S.obstaclesAt = now;
    const out = [];
    for (const s of ['#roomLabel', '.tools', '.mode-bar', '#p3Bar', '.unit-nav', 'header .header-actions', '.wordmark', '#uiDock', '.layout-flag', '.footer-meta', '#designPanel', '#landBtn', '.project-badge']) for (const e of document.querySelectorAll(s)) {
      if (e.hidden || !e.getClientRects().length) continue; const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) continue;
      const r = e.getBoundingClientRect(); if (r.width && r.height) out.push({x: r.left, y: r.top, w: r.width, h: r.height});}
    return S.obstacles = out;
  }
  function relayout() {
    const W = innerWidth, H = innerHeight, items = [];
    for (const s of specs()) {
      const pts = (s.anchors || [s.at]).map(a => project(...a)).filter(Boolean); if (!pts.length) continue;
      if (pts.every(([x, y]) => x < -40 || y < -40 || x > W + 40 || y > H + 40)) continue;
      const z = measure(s); items.push({...s, anchors: pts, w: z.w, h: z.h, wIcon: z.wIcon});
    }
    const u = S.u ??= parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--u')) || 1;
    const res = placeLabels(items, {W, H, scale: u, obstacles: obstacles(), merge: phone() ? 26 : 24, measure: c => measure(c).w});
    const live = new Set();let dl = '', dd = '';
    for (const p of res.placed) {
      const e = el(p); live.add(p.key);
      if (p.kind === 'mark') {e.querySelector('.p3-tx').textContent = p.text; e.classList.toggle('icon-only', !!p.iconOnly);}
      else e.textContent = p.text;
      e.style.transform = `translate(${Math.round(p.box.x)}px,${Math.round(p.box.y)}px)`; e.hidden = false; e.dataset.placed = '1';
      e.dataset.box = [p.box.x, p.box.y, p.box.w, p.box.h].map(n => n.toFixed(1)).join(',');
      if (p.kind === 'mark') {const cx = p.box.x + p.wIcon / 2, cy = p.box.y + p.box.h / 2; for (const [ax, ay] of p.anchors) {dl += `M${ax.toFixed(1)} ${ay.toFixed(1)}L${cx.toFixed(1)} ${cy.toFixed(1)}`; dd += `M${(ax - 2.4).toFixed(1)} ${ay.toFixed(1)}a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0`;}}
    }
    for (const [k, e] of els) if (!live.has(k)) {e.hidden = true; e.dataset.placed = '';}
    leaders.setAttribute('d', dl); dots.setAttribute('d', dd);
    S.stats = {placed: res.placed.length, hidden: res.hidden.length, hiddenKeys: res.hidden.map(h => h.key)};
    S.last = res;
  }
  function clearOverlay() {for (const e of els.values()) e.hidden = true; leaders.setAttribute('d', ''); dots.setAttribute('d', '');}

  // --- room focus ---------------------------------------------------------------------------------------------------------------
  function focusRoomTo(id) {S.focusRoom = id || null; rebuild(true); syncCard(); frameScope(800);}

  // app.js shows its 01/04 clearance sprites in the plan (syncFitoutDimensions, also on every style click); this view draws them itself.
  const fitoutSprites = () => (ctx.groups.house?.children || []).filter(g => /^fitout-dimensions-/.test(g.name));
  function hideFitoutSprites() {let n = 0; for (const g of fitoutSprites()) if (g.visible) {g.visible = false; n++;} if (n) ctx.invalidate(200);}
  // --- entering, re-entering and leaving ----------------------------------------------------------------------------------------
  function enter() {
    const first = !S.active, from = S.prevMode;
    if (first) {
      S.active = true; document.body.classList.add('plan3d'); root.visible = true; loadLayers();
      S.saved = {near: camera.near, mouse: {...controls.mouseButtons}, touches: {...controls.touches}, shadow: ctx.sun?.shadow.intensity ?? 1, screenSpacePanning: controls.screenSpacePanning};
      controls.mouseButtons = {LEFT: T.MOUSE.PAN, MIDDLE: T.MOUSE.DOLLY, RIGHT: T.MOUSE.PAN}; controls.touches = {ONE: T.TOUCH.PAN, TWO: T.TOUCH.DOLLY_PAN};
      if (ctx.sun) ctx.sun.shadow.intensity = .38;
      if (!S.data) loadData().then(d => {S.data = d; if (S.active) {rebuild(true); syncCard();}}).catch(() => ctx.toast?.('承重墙和水点数据没能读到，请刷新再试'));
    }
    swapFurniture(true); ctx.stopTween?.(); ctx.setCut(CUT);
    hideFitoutSprites();
    // prepare() set the overview fov; keep this mode's (the animation eases from the previous mode's picture to it).
    setFov(first ? S.lastFov : FOV);
    if (S.focusRoom && !scopeRooms().some(r => r.id === S.focusRoom)) S.focusRoom = null;
    rebuild(); syncCard(); applyLayerVisibility();
    $('navHint').textContent = phone() ? '单指拖动平移，双指缩放' : '拖动平移，滚轮缩放，Q E 转向';
    frameScope(first && from !== 'plan' ? 1100 : 800);
    S.dirty = true;
  }
  function leave(next) {
    S.active = false; S.anim = null; document.body.classList.remove('plan3d'); root.visible = false; clearOverlay();
    controls.mouseButtons = S.saved.mouse; controls.touches = S.saved.touches; camera.near = S.saved.near; camera.updateProjectionMatrix();
    if (ctx.sun) ctx.sun.shadow.intensity = S.saved.shadow;
    swapFurniture(false); hideOutside(null); S.key = '';
    // The next overview tweens from here with its own fov: step along the view ray so the first frame shows the same picture.
    const t = ctx.transition;
    if (t && next !== 'walk' && next !== 'tour') {const k = Math.tan(FOV * Math.PI / 360) / Math.tan(camera.fov * Math.PI / 360); camera.position.sub(controls.target).multiplyScalar(k).add(controls.target); t.from.copy(camera.position);}
    ctx.invalidate(600, true);
  }
  const mo = new MutationObserver(() => {
    const m = document.body.dataset.mode;
    if (m === 'plan') enter(); else if (S.active) leave(m);
    S.prevMode = m;
  });
  mo.observe(document.body, {attributes: true, attributeFilter: ['data-mode']});

  // --- input --------------------------------------------------------------------------------------------------------------------
  function act(a) {
    if (!S.active) return;
    if (a === 'left') turn(-1); else if (a === 'right') turn(1); else if (a === 'tilt') tilt();
    else if (a === 'reset') {S.focusRoom = null; rebuild(true); syncCard(); frameScope();}
    else if (a === 'back') focusRoomTo(null);
    else if (a === 'walk') {const id = S.focusRoom; if (id) ctx.goRoom(id);}
    else if (a === 'layers') {ctx.ui?.open?.('room', true);}
    else if (a === 'export') doExport();
  }
  for (const b of [...kit.querySelectorAll('[data-p3]'), ...bar.querySelectorAll('[data-p3]')]) b.addEventListener('click', () => act(b.dataset.p3));
  for (const b of kit.querySelectorAll('[data-layer]')) b.addEventListener('click', () => {S.layers[b.dataset.layer] = !S.layers[b.dataset.layer]; saveLayers(); applyLayerVisibility();});
  // The 复位 tool and the unit bar go through changeMode('plan') → enter(); 复位 also clears a room focus.
  $('resetBtn')?.addEventListener('click', () => {if (S.active) {S.focusRoom = null; rebuild(true); syncCard();}}, true);
  controls.addEventListener('start', () => {S.anim = null;});
  let down = null;
  renderer.domElement.addEventListener('pointerdown', e => {down = S.active && e.isPrimary ? {x: e.clientX, y: e.clientY, t: e.timeStamp} : null;});
  renderer.domElement.addEventListener('pointerup', e => {
    const d = down; down = null; if (!d || !S.active || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6 || e.timeStamp - d.t > 500 || focusUnit() === 'floor') return;
    const ray = new T.Raycaster(), p = new T.Vector3(); ray.setFromCamera(new T.Vector2(e.clientX / innerWidth * 2 - 1, -e.clientY / innerHeight * 2 + 1), camera);
    if (!ray.ray.intersectPlane(new T.Plane(new T.Vector3(0, 1, 0), 0), p)) return;
    const hit = scopeRooms().filter(r => p.x >= r.rect[0] && p.x <= r.rect[2] && p.z >= r.rect[1] && p.z <= r.rect[3]).sort((a, b) => (a.rect[2] - a.rect[0]) * (a.rect[3] - a.rect[1]) - (b.rect[2] - b.rect[0]) * (b.rect[3] - b.rect[1]))[0];
    if (hit && hit.id !== S.focusRoom) focusRoomTo(hit.id); else if (!hit && S.focusRoom) focusRoomTo(null);
  });
  window.addEventListener('keydown', e => {
    if (!S.active || e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target instanceof Element && e.target.closest('input,textarea,select,[contenteditable="true"],#designPanel')) return;
    if (document.querySelector('dialog[open]')) return;
    const k = e.key, pan = (dx, dz) => {const th = S.rot * Math.PI / 2, d = camera.position.distanceTo(controls.target) * .06, mx = (dx * Math.cos(th) + dz * Math.sin(th)) * d, mz = (-dx * Math.sin(th) + dz * Math.cos(th)) * d; controls.target.x += mx; controls.target.z += mz; camera.position.x += mx; camera.position.z += mz; ctx.invalidate(300);};
    const zoom = f => {const off = camera.position.clone().sub(controls.target).multiplyScalar(f); if (off.length() < controls.minDistance || off.length() > controls.maxDistance) return; camera.position.copy(controls.target).add(off); ctx.invalidate(300);};
    if (k === 'q' || k === 'Q') turn(-1); else if (k === 'e' || k === 'E') turn(1); else if (k === 't' || k === 'T') tilt();
    else if (k === 'ArrowLeft') pan(-1, 0); else if (k === 'ArrowRight') pan(1, 0); else if (k === 'ArrowUp') pan(0, -1); else if (k === 'ArrowDown') pan(0, 1);
    else if (k === '+' || k === '=') zoom(.85); else if (k === '-' || k === '_') zoom(1 / .85);
    else if (k === 'Escape' && S.focusRoom) focusRoomTo(null);
    else return;
    e.preventDefault();
  });
  // Styles and lighting change materials the clay copies from.
  for (const id of ['designPanel', 'lightBtn']) for (const type of ['click', 'input', 'change']) $(id)?.addEventListener(type, () => {if (S.active) setTimeout(() => {swapFurniture(true); refreshClay(); syncCard();}, 60);});
  addEventListener('resize', () => {S.dirty = true; S.obstaclesAt = 0; S.u = null;});
  // Panels opening or folding (body.ui-min-*, the design panel) change what the labels must keep clear of.
  new MutationObserver(() => {if (S.active) {S.dirty = true; S.obstaclesAt = 0;}}).observe(document.body, {attributes: true, attributeFilter: ['class']});

  // --- export -------------------------------------------------------------------------------------------------------------------
  async function doExport({download = true} = {}) {
    if (!owner()) {ctx.toast?.('导出图纸只做了我的 B 户型'); return;}
    ctx.toast?.('正在生成图纸，请稍候');
    await new Promise(r => setTimeout(r, 30));
    try {
      const r = S.focusRoom && ctx.rooms.find(q => q.id === S.focusRoom);
      const res = await exportDrawing({THREE: T, renderer, scene, camera, ctx, fit, dir: dirOf(S.rot, S.top), box: scopeBox(), specs: specs(), layers: S.layers, place: placeLabels, project,
        title: r ? `我的 B 户型，${shortName(r.name)}` : '我的 B 户型', subtitle: `${layoutName()}，${styleName()}`, rot: S.rot, top: S.top, fov: FOV, download});
      S.lastExport = res; ctx.toast?.(`图纸已导出，宽${res.width}像素，高${res.height}像素`);
      return res;
    } catch (e) {console.warn('plan export failed', e); ctx.toast?.('导出没有成功，请换精细画质或刷新后再试');}
    finally {ctx.invalidate(800, true);}
  }

  // --- frame loop: camera animation, near plane, overlay ------------------------------------------------------------------------------
  function loop(now) {
    requestAnimationFrame(loop);
    if (!S.active) {S.lastFov = camera.fov; return;}
    stepAnim(now); hideFitoutSprites();
    // Near plane follows the distance: keeps 24-bit depth fine enough for the 6 mm cap offsets at any zoom.
    const dist = camera.position.distanceTo(controls.target), near = Math.min(6, Math.max(.3, dist * .02));
    if (Math.abs(near - camera.near) > .01) {camera.near = near; camera.updateProjectionMatrix();}
    camera.updateMatrixWorld();
    const sig = camera.matrixWorld.elements.map(n => n.toFixed(4)).join(',') + camera.projectionMatrix.elements[0].toFixed(5) + innerWidth + 'x' + innerHeight;
    // Software rendering: while the view moves the labels follow at most every 200 ms (the frame itself is ~100 ms there); the last
    // position is always laid out, because a changed view leaves S.dirty set until it is.
    if (sig !== S.lastCam) {S.lastCam = sig; S.dirty = true; S.movedAt = now;}
    const moving = now - (S.movedAt || 0) < 150;
    if (S.dirty && !(ctx.renderTier === 'soft' && moving && now - (S.laidAt || 0) < 200)) {
      S.dirty = false; S.laidAt = now; relayout();
      const t = controls.target, c0 = project(t.x, 0, t.z), c1 = project(t.x, 0, t.z - 1), deg = c0 && c1 ? Math.round(Math.atan2(c1[0] - c0[0], c0[1] - c1[1]) * 180 / Math.PI) : 0;
      for (const n of document.querySelectorAll('.p3-north i')) n.style.transform = `rotate(${deg}deg)`;
    }
  }
  requestAnimationFrame(loop);

  // Read-only state for QA tools (no data beyond what the page shows).
  const api = {
    get active() {return S.active;}, get animating() {return !!S.anim;}, get layers() {return {...S.layers};}, get stats() {return S.stats;}, get focusRoom() {return S.focusRoom;}, get rot() {return S.rot;}, get top() {return S.top;},
    get built() {return S.built;}, get data() {return S.data;}, sources: SOURCES, cut: CUT, fov: FOV, colors: COLORS,
    labels: () => [...labelBox.children].filter(e => !e.hidden && e.dataset.placed).map(e => ({key: e.dataset.key, cls: e.className, text: e.textContent, box: e.getBoundingClientRect().toJSON(), font: parseFloat(getComputedStyle(e.querySelector('.p3-tx') || e).fontSize)})),
    anchors: () => (S.last?.placed || []).filter(p => p.kind === 'mark').map(p => ({key: p.key, layer: p.layer, anchors: p.anchors, members: (p.members || [p]).map(m => ({key: m.key, src: m.src || null}))})),
    setLayer(id, on) {S.layers[id] = !!on; saveLayers(); applyLayerVisibility();}, focus: focusRoomTo, act, exportDrawing: doExport, specs: () => specs(),
    get furnitureSwapped() {return swapped.size;}
  };
  window.xiyuanPlan = api;
  return api;
}
