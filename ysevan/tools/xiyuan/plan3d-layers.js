// 平面俯视（米家式三维剖切图，2026-10-26）的数据与图层。只读：这里不写任何坐标，每个点位都从已有数据或建好的场景里取，
// 换布置、换风格、装修分支改了家具或细部，这里跟着变。来源逐层写在 SOURCES 里，check:plan3d 会核对。
//  - 墙与剖切面：app.js 传进来的 layout-original.json / layout-central.json 墙轮廓（DWG WALL、COLUMN 提取）。
//  - 承重墙：assets/structure-audit.json 的 structuralFootprints（DWG COLUMN 闭合轮廓）里面积大于 0.3 平方米的 8 处，
//    即 DWG 黑色实心填充的 8 面墙（其余 9 处是 0.04 平方米以下的小柱头）；与 black-walls.json 逐处比对过（面积交并比 0.99 以上）。
//  - 飘窗台：layout-data.js 的 BAY.opening（check:bay 守着的那份）。
//  - 水点：assets/water-points.json（check:wetfix 断言场景里的水点等于它），坐标原样用，不取整。
//  - 强电、弱电、灯位（2026-10-28 取代原来的开关插座、灯位两层）：assets/electrical-points.json 的建议点位，按当前布置的 layouts 过滤，
//    每个点归哪一层看 types[type].layer；坐标、离地高度、几联、备注和依据都原样用，不取整、不补点。只做了 01 和 04，02、03 下三层置灰。
//  - 空调：living-balcony.js LIVING_BOXES.ac（客厅柜式空调占位，机型待定）。
//  - 门：场景里 userData.doorLeaf 的门扇（铰链位置、门宽、开向都从门扇本身量）；窗：app.js 的 winSegments（windowWall 建窗时登记）。
//  - 尺寸：房间净距从房间中心向四面打射线，碰到上面的墙、窗、关着的门扇为止；01 和 04 的家具净距取 fitout-dimensions.js。
import * as THREE from 'three';
import {mergeGeometries} from './utils/BufferGeometryUtils.js?v=fda7e946b8';
import * as LAYOUT from './layout-data.js?v=3e32bfce2c';
import * as LIVING from './living-balcony.js?v=d171d5c24b';
import * as FITOUT from './fitout-dimensions.js?v=40ecd197db';

// Cut height 1.2 m: above beds, desks, sofas, counters (0.45–0.94 m) and the bay sill (0.5 m), so every piece and the sill still read;
// below the window heads and door heads (2.1–2.3 m), so every opening shows as a gap; wardrobes (2.76 m) show their real footprint.
// Close to the 1.28 m of the existing overview, so switching between them does not jump.
export const CUT = 1.2;
// Structural footprints above this area are the DWG's black-filled walls; the largest of the rest is 0.04 m².
export const BEARING_MIN_AREA = .3;
export const SOURCES = {
  walls: 'layout-original.json、layout-central.json 的墙轮廓（DWG）',
  bearing: 'structure-audit.json 的 structuralFootprints，面积大于0.3平方米的8处（DWG黑色填充）',
  bay: 'layout-data.js 的 BAY.opening',
  water: 'water-points.json',
  power: 'electrical-points.json 里 layer 为 power 的建议点位（插座、专用插座、强电箱），按当前布置过滤',
  weak: 'electrical-points.json 里 layer 为 weak 的建议点位（网络、电视、弱电箱），按当前布置过滤',
  lights: 'electrical-points.json 里 layer 为 lights 的建议点位（开关、主灯、筒灯、灯带、吸顶灯），按当前布置过滤',
  ac: 'living-balcony.js 的 LIVING_BOXES.ac',
  doors: '场景里 userData.doorLeaf 的门扇，app.js 的 winSegments',
  dims: 'DWG 墙轮廓上量的房间净距，fitout-dimensions.js'
};
// Layer chips, in the order shown. phone / desk: on by default.
export const LAYERS = [
  {id: 'rooms', label: '房间名', icon: 'home', phone: true, desk: true},
  {id: 'bearing', label: '承重墙', icon: 'brick-wall', phone: true, desk: true},
  {id: 'water', label: '水点', icon: 'droplet', phone: false, desk: true},
  {id: 'power', label: '强电', icon: 'plug', phone: false, desk: false},
  {id: 'weak', label: '弱电', icon: 'monitor', phone: false, desk: false},
  {id: 'lights', label: '灯位', icon: 'lightbulb', phone: false, desk: false},
  {id: 'ac', label: '空调', icon: 'air-vent', phone: false, desk: true},
  {id: 'dims', label: '尺寸', icon: 'ruler', phone: false, desk: true},
  {id: 'doors', label: '门窗', icon: 'door', phone: false, desk: true}
];
export const COLORS = {cap: '#aab39f', bearingSide: '#4a5446', bearingCap: '#27302a', dim: '#3f5a3a', door: '#6d7c64', window: '#4f86a8', bay: '#a0622c',
  tint: {sleep: '#ead9bf', living: '#dfe7d2', kitchen: '#e8dcc5', wet: '#d3e0e3', balcony: '#e2e6da', other: '#e6e2d6'},
  // Mark tones (the same values are in style.css .p3-mark[data-layer=…] and used by the export): water blue, power red, weak violet,
  // lights the earlier lamp ochre, air conditioning teal; none of them is the bearing-wall ink, the bay brown or the dimension green.
  tone: {water: '#2f6f93', power: '#c2303a', weak: '#6b4fa0', lights: '#7d6410', ac: '#356b68', bearing: '#27302a', bay: '#a0622c'}};
const WATER_NAMES = {basin: '洗手盆', drain: '地漏', shower: '淋浴', showerHead: '花洒', toilet: '马桶', faucet: '龙头', sink: '水槽', 'drain-stack': '排水立管', laundry: '洗衣（旧登记位）'};

// --- geometry helpers ------------------------------------------------------------------------------------------------------------
export function inPoly(x, z, p) {let c = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) {const [xi, zi] = p[i], [xj, zj] = p[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c;} return c;}
export const area = p => Math.abs(p.reduce((s, [x, z], i) => {const [X, Z] = p[(i + 1) % p.length]; return s + x * Z - X * z;}, 0)) / 2;
const centroid = p => {let a = 0, cx = 0, cz = 0; for (let i = 0; i < p.length; i++) {const [x0, z0] = p[i], [x1, z1] = p[(i + 1) % p.length], f = x0 * z1 - x1 * z0; a += f; cx += (x0 + x1) * f; cz += (z0 + z1) * f;} return Math.abs(a) < 1e-9 ? [p[0][0], p[0][1]] : [cx / (3 * a), cz / (3 * a)];};
const solid = (walls, x, z) => walls.wallPolygons.some((p, i) => inPoly(x, z, p) && !(walls.wallHoles[i] || []).some(h => inPoly(x, z, h)));
// Shape in plan metres (x east, z south) → horizontal geometry at height y, facing up.
function flat(poly, holes, y) {
  const s = new THREE.Shape(poly.map(([x, z]) => new THREE.Vector2(x, -z)));
  for (const h of holes || []) s.holes.push(new THREE.Path(h.map(([x, z]) => new THREE.Vector2(x, -z))));
  const g = new THREE.ShapeGeometry(s); g.rotateX(-Math.PI / 2); g.translate(0, y, 0); return g;
}
function prism(poly, h) {
  const s = new THREE.Shape(poly.map(([x, z]) => new THREE.Vector2(x, -z)));
  const g = new THREE.ExtrudeGeometry(s, {depth: h, bevelEnabled: false}); g.rotateX(-Math.PI / 2); return g;
}
// A flat strip (line with a real width) from a to b at height y.
function strip(a, b, w, y) {
  const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz); if (L < 1e-6) return null;
  const nx = -dz / L * w / 2, nz = dx / L * w / 2, g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([a[0] + nx, y, a[1] + nz, b[0] + nx, y, b[1] + nz, b[0] - nx, y, b[1] - nz, a[0] + nx, y, a[1] + nz, b[0] - nx, y, b[1] - nz, a[0] - nx, y, a[1] - nz], 3));
  return g;
}
const dashed = (a, b, w, y, on = .12, off = .08) => {const L = Math.hypot(b[0] - a[0], b[1] - a[1]), out = []; for (let s = 0; s < L; s += on + off) {const e = Math.min(L, s + on), p = t => [a[0] + (b[0] - a[0]) * t / L, a[1] + (b[1] - a[1]) * t / L]; out.push(strip(p(s), p(e), w, y));} return out;};
const merged = (list, material, name, order = 0) => {list = list.filter(Boolean); if (!list.length) return null; const nonIndexed = list.map(g => g.index ? g.toNonIndexed() : g); for (const g of nonIndexed) for (const k of Object.keys(g.attributes)) if (!['position', 'color'].includes(k)) g.deleteAttribute(k);
  const g = mergeGeometries(nonIndexed, false); for (const q of list) q.dispose(); const m = new THREE.Mesh(g, material); m.name = name; m.renderOrder = order; m.matrixAutoUpdate = false; return m;};
const basic = (color, extra = {}) => new THREE.MeshBasicMaterial({color, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2, ...extra});

// --- data -----------------------------------------------------------------------------------------------------------------------
let dataPromise = null;
export function loadData() {
  dataPromise ??= Promise.all([
    fetch('./assets/water-points.json?v=f2a2a49d7e').then(r => r.json()),
    fetch('./assets/structure-audit.json?v=7cf373f25f').then(r => r.json()),
    // The suggested points are their own file: if it cannot be read the walls and water points still show, the three chips go grey.
    fetch('./assets/electrical-points.json?v=20a70517bb').then(r => r.ok ? r.json() : null).catch(() => null)
  ]).then(([water, structure, points]) => ({water, bearing: bearingWalls(structure), points: points && Array.isArray(points.points) ? points : null})).catch(e => {dataPromise = null; throw e;});
  return dataPromise;
}
export function bearingWalls(structure) {
  const list = (structure?.structuralFootprints || []).filter(p => area(p) > BEARING_MIN_AREA).map(p => ({polygon: p, c: centroid(p), area: area(p)}));
  // Numbered in reading order on the plan: north to south, then west to east.
  list.sort((a, b) => Math.round(a.c[1] * 2) - Math.round(b.c[1] * 2) || a.c[0] - b.c[0]);
  return list.map((w, i) => ({...w, no: i + 1}));
}
const CIRCLED = '①②③④⑤⑥⑦⑧⑨⑩';

// --- suggested electrical points (electrical-points.json) -----------------------------------------------------------------------------
export const ELEC_LAYERS = ['power', 'weak', 'lights'];
// Line icons from the sprite in index.html; the network outlet has no sprite symbol, so it is drawn here (same 24 grid and stroke).
const TYPE_ICON = {'ac-wall': 'air-vent', 'ac-floor': 'air-vent', panel: 'panels', 'weak-panel': 'panels', tv: 'monitor', switch: 'toggle'};
const LAYER_ICON = {power: 'plug', weak: 'monitor', lights: 'lightbulb'};
export const GLYPHS = {data: '<rect x="4" y="4" width="16" height="13" rx="2"/><path d="M9 17v3h6v-3"/><path d="M8.5 8.5v3"/><path d="M12 8.5v3"/><path d="M15.5 8.5v3"/>'};
// One-character corner tags tell the dedicated outlets and the lamp kinds apart when a mark has room for its icon only.
export const TYPE_TAG = {fridge: '冰', hood: '烟', washer: '洗', dryer: '烘', 'water-heater': '热', toilet: '马', bath: '溅', counter: '台', 'ac-wall': '挂', 'ac-floor': '柜', 'main-light': '主', 'ceiling-light': '吸', strip: '带'};
const GANG = {2: '双联', 3: '三联', 4: '四联'};
const typeOf = (json, t) => json?.types?.[t] || null;
// The points of one layout, each with its layer and label resolved from the file's own type table (a point whose type has no layer is
// left out, and check:plan3d counts that against the file).
export function elecPoints(json, layout) {
  const out = [];
  for (const p of json?.points || []) {const t = typeOf(json, p.type); if (!t || !ELEC_LAYERS.includes(t.layer) || !(p.layouts || []).includes(layout)) continue; if (!Number.isFinite(p.x) || !Number.isFinite(p.z)) continue; out.push({...p, layer: t.layer, label: String(t.label || p.type)});}
  return out;
}
export const pointLayouts = json => new Set((json?.points || []).flatMap(p => p.layouts || []));
// Mark text: type, height above the floor in mm, how many gangs. Ceiling lamps keep the type only (the height is the ceiling).
export function pointText(p) {
  const mm = Math.round(p.y * 1000), lamp = p.layer === 'lights' && p.type !== 'switch' && p.y >= 2.4, box = /panel$/.test(p.type), out = [p.label];
  if (!lamp && Number.isFinite(p.y)) out.push((box ? '箱底离地' : '离地') + mm);
  if (p.gang > 1) out.push(GANG[p.gang] || p.gang + '联');
  return out.join('，');
}
// The card's line for a point: the mark text, protection, the circuit, the note and what it rests on.
const circuitOf = c => {c = String(c).trim(); return '，' + (c.endsWith('回路') ? c : c + '回路');};
export function pointDetail(p) {
  const head = pointText(p) + (p.layer === 'lights' && p.type !== 'switch' && p.y >= 2.4 ? '，安装面离地' + Math.round(p.y * 1000) : '') + (p.protect?.length ? '，' + p.protect.join('、') : '') + (p.circuit ? circuitOf(p.circuit) : '');
  const end = s => {s = String(s || '').trim(); return s && !s.endsWith('。') ? s + '。' : s;};
  return end(head) + end(p.note) + (p.ref ? end((p.basis === '图纸' ? '图纸 ' : '依据 ') + p.ref) : '');
}

// Owner's rooms of a unit and the bounding box of a set of rooms (from the scene's room records, never a literal).
export const unitRooms = (rooms, unit) => rooms.filter(r => r.unit === unit && r.rect);
export function boxOf(list, pad = 0) {
  let x0 = Infinity, z0 = Infinity, x1 = -Infinity, z1 = -Infinity;
  for (const r of list) {const [a, b, c, d] = r.rect; x0 = Math.min(x0, a); z0 = Math.min(z0, b); x1 = Math.max(x1, c); z1 = Math.max(z1, d);}
  return {x0: x0 - pad, z0: z0 - pad, x1: x1 + pad, z1: z1 + pad};
}
const inBox = (x, z, b, m = 0) => x >= b.x0 - m && x <= b.x1 + m && z >= b.z0 - m && z <= b.z1 + m;
export const shortName = n => String(n || '').split(' · ')[0].trim();
const roomKind = id => /master|south|north|child|bed|cloak/.test(id) ? 'sleep' : /living|dining|hall/.test(id) ? 'living' : /kitchen/.test(id) ? 'kitchen' : /bath/.test(id) ? 'wet' : /balcony/.test(id) ? 'balcony' : 'other';

// --- scene readers --------------------------------------------------------------------------------------------------------------
function shown(o) {for (let q = o; q; q = q.parent) if (!q.visible) return false; return true;}
// Visible doors (the leaf's own visibility is the door view, not whether the door exists): hinge, width, closed and 90° open tips.
export function doorSpecs(scene, box) {
  const out = [], inv = new THREE.Matrix4(), m = new THREE.Matrix4(), b = new THREE.Box3(), v = new THREE.Vector3();
  scene.updateMatrixWorld(true);
  scene.traverse(g => {
    if (!g.userData?.doorLeaf || !g.parent || !shown(g.parent)) return;
    inv.copy(g.matrixWorld).invert(); const lb = new THREE.Box3();
    g.traverse(o => {if (!o.isMesh || !o.geometry) return; o.geometry.boundingBox ?? o.geometry.computeBoundingBox(); b.copy(o.geometry.boundingBox).applyMatrix4(m.multiplyMatrices(inv, o.matrixWorld)); lb.union(b);});
    if (lb.isEmpty()) return;
    const along = Math.abs(lb.max.x) >= Math.abs(lb.min.x) ? lb.max.x : lb.min.x, width = Math.abs(along);
    if (width < .3 || width > 2.6) return;
    const swing = g.userData.swing ?? 0, at = rot => {const q = new THREE.Matrix4().compose(g.position, new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rot), g.scale); return q.premultiply(g.parent.matrixWorld);};
    const P = (mat, x) => {v.set(x, 0, 0).applyMatrix4(mat); return [v.x, v.z];};
    const closed = at(0), hinge = P(closed, 0), tip = P(closed, along);
    if (!inBox(hinge[0], hinge[1], box, .3)) return;
    const spec = {hinge, tip, width, slider: !swing};
    if (swing) {const open = at(Math.sign(swing) * Math.PI / 2); spec.open = P(open, along);
      // Arc points from the closed tip to the open one, around the hinge.
      const a0 = Math.atan2(tip[1] - hinge[1], tip[0] - hinge[0]), a1 = Math.atan2(spec.open[1] - hinge[1], spec.open[0] - hinge[0]); let d = a1 - a0; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
      spec.arc = [...Array(19)].map((_, i) => [hinge[0] + Math.cos(a0 + d * i / 18) * width, hinge[1] + Math.sin(a0 + d * i / 18) * width]);}
    out.push(spec);
  });
  return out;
}

// --- rays for room clear dimensions -------------------------------------------------------------------------------------------------
function segmentsOf(walls, wins, doors, box) {
  const segs = [], near = (a, b) => inBox(a[0], a[1], box, 1.5) || inBox(b[0], b[1], box, 1.5);
  for (const ring of [...walls.wallPolygons, ...walls.wallHoles.flat().filter(h => h && h.length)]) for (let i = 0; i < ring.length; i++) {const a = ring[i], b = ring[(i + 1) % ring.length]; if (near(a, b)) segs.push([a, b]);}
  for (const w of wins) {const a = [w[0], w[1]], b = [w[2], w[3]]; if (near(a, b)) segs.push([a, b]);}
  for (const d of doors) segs.push([d.hinge, d.tip]);
  return segs;
}
function cast(segs, o, d, max) {
  let best = max;
  for (const [a, b] of segs) {
    const ex = b[0] - a[0], ez = b[1] - a[1], den = d[0] * ez - d[1] * ex; if (Math.abs(den) < 1e-12) continue;
    const t = ((a[0] - o[0]) * ez - (a[1] - o[1]) * ex) / den, u = ((a[0] - o[0]) * d[1] - (a[1] - o[1]) * d[0]) / den;
    if (t > 1e-4 && u >= -1e-6 && u <= 1 + 1e-6 && t < best) best = t;
  }
  return best;
}
// Clear width along x and depth along z of each room, measured on the DWG walls through its middle (5 parallel rays per axis, the
// most common reading wins; a ray that leaves the room's record by more than 0.35 m went through an opening and is dropped).
export function roomDims(rooms, walls, wins, doors) {
  const box = boxOf(rooms), segs = segmentsOf(walls, wins, doors, box), out = [];
  for (const r of rooms) {
    const [x0, z0, x1, z1] = r.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, dims = [];
    for (const axis of ['x', 'z']) {
      const span = axis === 'x' ? z1 - z0 : x1 - x0, reads = [];
      for (const f of [-.3, -.15, 0, .15, .3]) {
        const o = axis === 'x' ? [cx, cz + f * span] : [cx + f * span, cz]; if (solid(walls, ...o)) continue;
        const dn = axis === 'x' ? [1, 0] : [0, 1], lo = cast(segs, o, [-dn[0], -dn[1]], 20), hi = cast(segs, o, dn, 20);
        const a = axis === 'x' ? [o[0] - lo, o[1]] : [o[0], o[1] - lo], b = axis === 'x' ? [o[0] + hi, o[1]] : [o[0], o[1] + hi];
        const e0 = axis === 'x' ? x0 : z0, e1 = axis === 'x' ? x1 : z1, p0 = axis === 'x' ? a[0] : a[1], p1 = axis === 'x' ? b[0] : b[1];
        if (Math.abs(p0 - e0) > .35 || Math.abs(p1 - e1) > .35) continue;
        reads.push({a, b, mm: Math.round((lo + hi) * 1000), f});
      }
      if (!reads.length) continue;
      const count = new Map(); for (const q of reads) count.set(q.mm, (count.get(q.mm) || 0) + 1);
      const mm = [...count].sort((p, q) => q[1] - p[1] || Math.abs(reads.find(x => x.mm === p[0]).f) - Math.abs(reads.find(x => x.mm === q[0]).f))[0][0];
      const pick = reads.filter(q => q.mm === mm).sort((p, q) => Math.abs(p.f) - Math.abs(q.f))[0];
      dims.push({room: r.id, axis, a: pick.a, b: pick.b, mm});
    }
    out.push(...dims);
  }
  return out;
}
export function fitoutDims(layout) {
  const list = FITOUT.FITOUT_DIMENSIONS?.[layout] || [];
  return list.map(d => ({a: d.a, b: d.b, mm: Math.round(d.metres * 1000), text: String(d.label).replace(/\s*[\d.]+m/, ' ' + Math.round(d.metres * 1000)), tight: d.metres < .6 + 1e-9, fitout: true}));
}

// --- marker specs (anchors in world metres, y = height of the anchor) -------------------------------------------------------------
export function markerSpecs({data, scene, layout, unitBox}) {
  const out = [];
  if (data) for (const p of data.water.points || []) out.push({layer: 'water', icon: 'droplet', id: 'water.' + p.id, text: WATER_NAMES[p.kind] || p.kind, anchors: [[p.x, 0, p.z]], src: p});
  // Suggested points, straight from the file: one mark each, anchored at its plan position on the floor like the water points. Marks of one
  // room, type, height and gang count gather under one label (reach: several times the usual merge distance, see placeLabels).
  if (data?.points) for (const p of elecPoints(data.points, layout)) {const text = pointText(p);
    out.push({layer: p.layer, icon: TYPE_ICON[p.type] || LAYER_ICON[p.layer], glyph: GLYPHS[p.type] || null, tag: TYPE_TAG[p.type] || null, id: 'pt.' + p.id, text, group: `${p.type}|${text}`, cluster: p.room, reach: 6, anchors: [[p.x, 0, p.z]], src: p, prio: /panel$/.test(p.type) ? 4 : p.layer === 'lights' ? 6 : 5});}
  const ac = LIVING.LIVING_BOXES?.ac; if (ac) out.push({layer: 'ac', icon: 'air-vent', id: 'ac.living', text: '柜式空调（占位，机型待定）', anchors: [[(ac[0] + ac[2]) / 2, 0, (ac[1] + ac[3]) / 2]]});
  if (data) for (const w of data.bearing) out.push({layer: 'bearing', badge: CIRCLED[w.no - 1] || String(w.no), id: 'bearing.' + w.no, text: '承重墙', anchors: [[w.c[0], CUT, w.c[1]]], tone: 'bearing', prio: 2});
  const bay = LAYOUT.BAY?.opening; if (bay) out.push({layer: 'bearing', id: 'bay', text: '飘窗台，不可拆', anchors: [[(bay.x0 + bay.x1) / 2, CUT, (bay.face + bay.glass) / 2]], tone: 'bay', prio: 2});
  return out.filter(s => s.anchors.every(([x, , z]) => Number.isFinite(x) && Number.isFinite(z)));
}

// --- 3D layers ---------------------------------------------------------------------------------------------------------------------
// Returns {group, parts:{caps, bearing, tints, dims, doors, windows, bay}, dims:[...], doors:[...]}; all meshes merged per layer.
export function buildScene({walls, data, rooms, focusRooms, unitBox, wins, scene, layout, focusRoom, owner, veil, soft = false}) {
  const group = new THREE.Group(); group.name = 'plan3d-layers';
  const parts = {}, add = (k, m) => {if (m) {parts[k] = m; group.add(m);}};
  // Wall caps over the whole floor (the cut is everywhere), so room outlines read at a glance.
  add('caps', merged(walls.wallPolygons.map((p, i) => flat(p, walls.wallHoles[i], CUT + .006)), basic(COLORS.cap, {side: THREE.DoubleSide}), 'plan3d-caps', 1));
  const bearing = owner && data ? data.bearing : [];
  add('bearing', merged(bearing.map(w => prism(w.polygon, CUT + .012)), new THREE.MeshLambertMaterial({color: COLORS.bearingSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4}), 'plan3d-bearing', 1));
  add('bearingCap', merged(bearing.map(w => flat(w.polygon, [], CUT + .013)), basic(COLORS.bearingCap, {side: THREE.DoubleSide, polygonOffsetFactor: -3, polygonOffsetUnits: -6}), 'plan3d-bearing-cap', 2));
  // Bay sill: dashed outline on the cut plane and light hatching.
  const bay = owner ? LAYOUT.BAY?.opening : null;
  if (bay) {const y = CUT + .016, p = [[bay.x0, bay.face], [bay.x1, bay.face], [bay.x1, bay.glass], [bay.x0, bay.glass]], g = [];
    for (let i = 0; i < 4; i++) g.push(...dashed(p[i], p[(i + 1) % 4], .025, y));
    for (let x = bay.x0 + .1; x < bay.x1; x += .16) g.push(strip([x, bay.glass], [Math.min(bay.x1, x + (bay.glass - bay.face)), bay.face], .012, y));
    add('bay', merged(g, basic(COLORS.bay), 'plan3d-bay', 3));}
  // Room tints (owner's unit, or whichever unit is in focus). Not on the software tier: a blended layer over the floors costs it ~20%.
  const tintGeos = [];
  for (const r of soft ? [] : focusRooms) {const [x0, z0, x1, z1] = r.rect, g = new THREE.PlaneGeometry(x1 - x0, z1 - z0); g.rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, .028, (z0 + z1) / 2);
    const c = new THREE.Color(COLORS.tint[roomKind(r.id)]), on = focusRoom && r.id === focusRoom; const col = []; for (let i = 0; i < g.attributes.position.count; i++) col.push(c.r, c.g, c.b); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.userData.on = on; tintGeos.push(g);}
  add('tints', merged(tintGeos.filter(g => !g.userData.on), new THREE.MeshBasicMaterial({vertexColors: true, transparent: true, opacity: focusRoom ? .22 : .36, depthWrite: false}), 'plan3d-tints', 0));
  add('tintOn', merged(tintGeos.filter(g => g.userData.on), new THREE.MeshBasicMaterial({vertexColors: true, transparent: true, opacity: .62, depthWrite: false}), 'plan3d-tint-focus', 0));
  // Doors (swing arcs and open leaves on the floor) and windows (three lines in the wall gap on the cut plane).
  const doors = doorSpecs(scene, unitBox), dg = [];
  for (const d of doors) {if (d.slider) {dg.push(strip(d.hinge, d.tip, .03, .03)); continue;} dg.push(strip(d.hinge, d.open, .022, .03)); for (let i = 0; i < d.arc.length - 1; i++) dg.push(strip(d.arc[i], d.arc[i + 1], .014, .03));}
  add('doors', merged(dg, basic(COLORS.door, {depthWrite: false}), 'plan3d-doors', 3));
  const wg = [];
  for (const w of wins) {const a = [w[0], w[1]], b = [w[2], w[3]]; if (!inBox(a[0], a[1], unitBox, .3) && !inBox(b[0], b[1], unitBox, .3)) continue; const L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < .05) continue;
    const n = [-(b[1] - a[1]) / L, (b[0] - a[0]) / L]; const gap = .06; for (const o of [-gap, 0, gap]) wg.push(strip([a[0] + n[0] * o, a[1] + n[1] * o], [b[0] + n[0] * o, b[1] + n[1] * o], .014, CUT + .01));}
  add('windows', merged(wg, basic(COLORS.window), 'plan3d-windows', 3));
  // Dimensions on the cut plane: room clear dimensions on the DWG walls, plus the layout's fit-out clearances (01 and 04).
  const dims = [...roomDims(focusRooms, walls, wins, doors), ...(owner ? fitoutDims(layout) : [])], mg = [];
  for (const d of dims) {const y = CUT + .02, L = Math.hypot(d.b[0] - d.a[0], d.b[1] - d.a[1]), u = [(d.b[0] - d.a[0]) / L, (d.b[1] - d.a[1]) / L], t = .07;
    mg.push(strip(d.a, d.b, .014, y)); for (const p of [d.a, d.b]) mg.push(strip([p[0] - (u[0] + u[1]) * t, p[1] - (u[1] - u[0]) * t], [p[0] + (u[0] + u[1]) * t, p[1] + (u[1] - u[0]) * t], .02, y));}
  add('dims', merged(mg, basic(COLORS.dim), 'plan3d-dims', 4));
  // Veil over the neighbours: a cream sheet just above the cut with the focused unit cut out, so the home reads on its own (Mijia's
  // map). The hole is widened towards the camera by the cut height's parallax, so the unit's floor edge is not veiled at a slant.
  // Opaque and the page colour: hides the neighbours completely and, drawn early, saves shading them (software rendering).
  const veilMat = new THREE.MeshBasicMaterial({color: veil || '#e7e4db', side: THREE.DoubleSide});
  const setVeil = dir => {
    if (parts.veil) {group.remove(parts.veil); parts.veil.geometry.dispose(); delete parts.veil;}
    if (!focusRooms.length || !veil) return;
    const k = (CUT + .04) / Math.max(.2, dir.y), sx = dir.x * k, sz = dir.z * k, big = 400;
    const hole = [[unitBox.x0 + Math.min(0, sx), unitBox.z0 + Math.min(0, sz)], [unitBox.x1 + Math.max(0, sx), unitBox.z0 + Math.min(0, sz)], [unitBox.x1 + Math.max(0, sx), unitBox.z1 + Math.max(0, sz)], [unitBox.x0 + Math.min(0, sx), unitBox.z1 + Math.max(0, sz)]];
    const m = merged([flat([[-big, -big], [big, -big], [big, big], [-big, big]], [hole], CUT + .04)], veilMat, 'plan3d-veil', -1); m.updateMatrix(); parts.veil = m; group.add(m);
  };
  for (const m of Object.values(parts)) m.updateMatrix();
  return {group, parts, dims, doors, setVeil};
}
// Which 3D parts belong to which layer chip.
export const PART_LAYER = {bearing: 'bearing', bearingCap: 'bearing', bay: 'bearing', doors: 'doors', windows: 'doors', dims: 'dims'};

// --- label placement (shared by the live overlay and the PNG export) ------------------------------------------------------------------
// items: [{key, kind:'room'|'mark'|'dim', layer, prio, anchors:[[sx,sy]], w, h, wIcon}] in screen px. Clusters same-layer marks whose
// anchors are closer than `merge` px (a mark with `reach` uses reach × merge, and one with `cluster` only joins marks of the same
// cluster, e.g. the suggested points of one room), then places each by priority on the first free candidate (never overlapping a placed
// label or an obstacle rect); a mark that finds no room with its text tries icon only, then is left out (counted in `hidden`).
export function placeLabels(items, {W, H, scale = 1, obstacles = [], merge = 22, margin = 4, measure = null} = {}) {
  const placed = [], hidden = [], m = margin * scale;
  const hit = r => r.x < m || r.y < m || r.x + r.w > W - m || r.y + r.h > H - m || obstacles.some(o => r.x < o.x + o.w && r.x + r.w > o.x && r.y < o.y + o.h && r.y + r.h > o.y) || placed.some(p => r.x < p.box.x + p.box.w + 2 * scale && r.x + r.w + 2 * scale > p.box.x && r.y < p.box.y + p.box.h + 2 * scale && r.y + r.h + 2 * scale > p.box.y);
  // Clusters: marks of one layer (and one group, e.g. sockets at one height) within `merge` px of each other.
  const marks = items.filter(i => i.kind === 'mark'), rest = items.filter(i => i.kind !== 'mark'), clusters = [];
  for (const it of marks) {
    const r = merge * scale * (it.reach || 1);
    const c = clusters.find(c => c.layer === it.layer && (c.group || '') === (it.group || '') && (c.cluster ?? null) === (it.cluster ?? null) && c.members.some(o => o.anchors.some(a => it.anchors.some(b => Math.hypot(a[0] - b[0], a[1] - b[1]) < r))));
    if (c) c.members.push(it); else clusters.push({...it, members: [it]});
  }
  for (const c of clusters) {
    if (c.members.length > 1) {c.anchors = c.members.flatMap(o => o.anchors); const texts = [...new Set(c.members.map(o => o.text))]; c.count = c.members.length; c.text = texts.join('、') + `（${c.count}处）`; c.key = c.members.map(o => o.key).join('|'); if (measure) c.w = measure(c);}
  }
  const order = [...rest, ...clusters].sort((a, b) => (a.prio ?? 5) - (b.prio ?? 5));
  for (const it of order) {
    const ax = it.anchors.reduce((s, a) => s + a[0], 0) / it.anchors.length, ay = it.anchors.reduce((s, a) => s + a[1], 0) / it.anchors.length;
    const L = (it.kind === 'mark' ? 30 : 12) * scale, cands = it.kind === 'room' ? [[0, 0], [0, -L], [0, L], [L * 2, 0], [-L * 2, 0], [0, -2 * L], [0, 2 * L], [L * 3, -L], [-L * 3, -L], [L * 3, L], [-L * 3, L]]
      : it.kind === 'dim' ? [[0, 0], [0, -L * 1.4], [0, L * 1.4], [L * 3, 0], [-L * 3, 0], [0, -L * 2.8], [0, L * 2.8]]
      : [[0, -L], [L * .9, -L], [-L * .9, -L], [0, -L * 1.7], [L * 1.4, -L * .3], [-L * 1.4, -L * .3], [L * 1.6, -L * 1.4], [-L * 1.6, -L * 1.4], [0, L], [0, -L * 2.5], [L * 2.4, -L * .8], [-L * 2.4, -L * .8], [L * 1.2, L * .8], [-L * 1.2, L * .8], [0, -L * 3.3]];
    let done = false;
    for (const iconOnly of it.kind === 'mark' ? [false, true] : [false]) {
      const w = iconOnly ? it.wIcon : it.w, h = it.h;
      for (const [dx, dy] of cands) {
        // Marks hang their icon (left end) over the candidate point; rooms and dimensions are centred on it.
        const x = it.kind === 'mark' ? ax + dx - it.wIcon / 2 : ax + dx - w / 2, y = ay + dy - h / 2, box = {x, y, w, h};
        if (hit(box)) continue;
        placed.push({...it, box, iconOnly, ax, ay}); done = true; break;
      }
      if (done) break;
    }
    if (!done) hidden.push(it);
  }
  return {placed, hidden};
}
