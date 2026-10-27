// 平面俯视的「导出图纸」：在浏览器里把当前视角（全户或点开的房间、当前转向和图层）画成一张 3200 像素宽的 PNG，带图签。
// 全部在本机做，不上传。三维部分用页面自己的渲染器放大画一帧再拷出来（色调、颜色与屏幕一致），标注用同一套避让算法重排。
// 图签只写：户型或房间名、布置和风格、图例、指北、「尺寸单位 mm，以 DWG 为准」、日期。不写楼号、所在层和费用。
// 强电、弱电、灯位（electrical-points.json 的建议点位）开着就画进去，图例带这三层和「建议点位，以电工现场为准」。
import {COLORS, ELEC_LAYERS} from './plan3d-layers.js?v=ec1c126436';
const W = 3200, H = 2263, BAND = 330, PAD = 70;
const FONT = '-apple-system,BlinkMacSystemFont,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans CJK SC",sans-serif';
const INK = '#303a32', MUTED = '#5a6155', CREAM = '#f8f7f1';
const TONES = COLORS.tone;
const LEGEND_ICON = {power: 'plug', weak: 'monitor', lights: 'lightbulb'};
export const EXPORT_SIZE = {width: W, height: H};

// The drawing buffer itself is resized for one frame and copied in the same task (nothing is composited in between, the canvas keeps
// its CSS size). Rendering into a render target instead would compile a second program for every material (no tone mapping, linear
// output): about 30 s on SwiftShader. Same programs, same tone mapping and colour as the screen.
function render3D(T, renderer, scene, cam, g) {
  const ratio = renderer.getPixelRatio(), size = renderer.getSize(new T.Vector2());
  try {renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.render(scene, cam); g.drawImage(renderer.domElement, 0, 0, W, H);}
  finally {renderer.setPixelRatio(ratio); renderer.setSize(size.x, size.y, false);}
}
const iconCache = new Map();
// A sprite symbol by name, or a glyph's own markup (plan3d-layers.js GLYPHS) for a symbol the sprite lacks.
function iconImage(name, color, glyph = null) {
  const k = (glyph || name) + color; if (iconCache.has(k)) return iconCache.get(k);
  const sym = glyph ? null : document.getElementById('i-' + name), p = new Promise(res => {
    if (!sym && !glyph) return res(null);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${sym?.getAttribute('viewBox') || '0 0 24 24'}" fill="none" stroke="${color}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" color="${color}">${glyph || sym.innerHTML}</svg>`;
    const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
  iconCache.set(k, p); return p;
}
function pill(g, x, y, w, h, fill, stroke) {g.beginPath(); g.roundRect(x, y, w, h, h / 2); g.fillStyle = fill; g.fill(); if (stroke) {g.lineWidth = 2; g.strokeStyle = stroke; g.stroke();}}
const today = () => {const d = new Date(); return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;};

export async function exportDrawing({THREE: T, renderer, scene, camera, fit, dir, box, specs, layers, place, project, title, subtitle, fov, download = true}) {
  const t0 = performance.now(), ms = {};
  const rect = {x: PAD, y: PAD, w: W - 2 * PAD, h: H - BAND - 2 * PAD};
  const f = fit(box, rect, W, H, dir, fov), cam = new T.PerspectiveCamera(fov, W / H, Math.max(.3, f.dist * .02), Math.max(600, f.dist * 4));
  cam.position.copy(f.target).addScaledVector(dir, f.dist); cam.up.set(0, 1, 0); cam.lookAt(f.target); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
  const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H; const g = canvas.getContext('2d');
  render3D(T, renderer, scene, cam, g); ms.render = Math.round(performance.now() - t0);
  // Labels: the same specs and placement as on screen, at print sizes (S × the 1440 design px).
  const S = 2.2, size = {room: 14 * S, mark: 11.5 * S, dim: 11.5 * S}, items = [];
  const font = (k, wgt = 600) => `${wgt} ${Math.round(size[k])}px ${FONT}`;
  for (const s of specs) {
    const pts = (s.anchors || [s.at]).map(a => project(...a, cam, W, H)).filter(Boolean); if (!pts.length) continue;
    const k = s.kind === 'room' ? 'room' : s.kind === 'dim' ? 'dim' : 'mark'; g.font = font(k, k === 'dim' ? 600 : k === 'room' ? 600 : 400);
    const h = k === 'room' ? size.room * 2.1 : size.mark * 2.2, wIcon = k === 'mark' && (s.icon || s.badge) ? h : 0;
    items.push({...s, anchors: pts, h, wIcon}); items.at(-1).w = widthOf(items.at(-1));
  }
  function widthOf(it) {const k = it.kind === 'room' ? 'room' : it.kind === 'dim' ? 'dim' : 'mark'; g.font = font(k, k === 'mark' ? 400 : 600); const tw = g.measureText(it.text).width; return (k === 'mark' ? it.wIcon + (it.wIcon ? 14 : 20) * S : k === 'room' ? 30 * S : 14 * S) + tw;}
  const res = place(items, {W, H, scale: S, obstacles: [{x: 0, y: H - BAND - 10, w: W, h: BAND + 10}], merge: 22, measure: widthOf});
  // Leaders and anchor dots under the labels; a suggested point's dot is in its layer colour and is drawn also when its label had no room.
  const elecDot = (ax, ay, tone) => {g.beginPath(); g.arc(ax, ay, 7.5, 0, Math.PI * 2); g.fillStyle = tone; g.fill(); g.lineWidth = 2.5; g.strokeStyle = '#ffffff'; g.stroke();};
  for (const p of res.placed) if (p.kind === 'mark') {const cx = p.box.x + p.wIcon / 2, cy = p.box.y + p.box.h / 2; for (const [ax, ay] of p.anchors) {g.lineWidth = 2.2; g.strokeStyle = 'rgba(48,58,50,.6)'; g.beginPath(); g.moveTo(ax, ay); g.lineTo(cx, cy); g.stroke();}}
  for (const p of res.placed) if (p.kind === 'mark') for (const [ax, ay] of p.anchors) if (ELEC_LAYERS.includes(p.layer)) elecDot(ax, ay, TONES[p.layer]); else {g.beginPath(); g.arc(ax, ay, 5, 0, Math.PI * 2); g.fillStyle = INK; g.fill();}
  for (const p of res.hidden) if (ELEC_LAYERS.includes(p.layer)) for (const [ax, ay] of p.anchors) elecDot(ax, ay, TONES[p.layer]);
  for (const p of res.placed) {
    const {x, y, w, h} = p.box;
    if (p.kind === 'room') {pill(g, x, y, w, h, p.on ? '#556b4d' : '#ffffff', 'rgba(48,58,50,.14)'); g.fillStyle = p.on ? '#ffffff' : '#71955d'; g.beginPath(); g.arc(x + 12 * S, y + h / 2, 3 * S, 0, Math.PI * 2); g.fill();
      g.font = font('room'); g.fillStyle = p.on ? '#ffffff' : INK; g.textBaseline = 'middle'; g.fillText(p.text, x + 20 * S, y + h / 2 + 1);}
    else if (p.kind === 'dim') {pill(g, x, y, w, h, p.tight ? '#fbefe9' : 'rgba(255,255,255,.94)', p.tight ? '#ac583e' : '#3f5a3a'); g.font = font('dim'); g.fillStyle = p.tight ? '#8d4630' : '#2f4a2b'; g.textBaseline = 'middle'; g.fillText(p.text, x + 7 * S, y + h / 2 + 1);}
    else {
      const tone = TONES[p.tone] || TONES[p.layer] || INK, text = p.text;
      if (!p.iconOnly) {g.font = font('mark', 400); const tw = g.measureText(text).width; pill(g, x + p.wIcon * .55, y + h * .1, p.wIcon ? p.wIcon * .45 + 14 * S + tw - 6 * S : 20 * S + tw, h * .8, p.tone === 'bay' ? '#fbf1e6' : 'rgba(255,255,255,.95)', p.tone === 'bay' ? tone : 'rgba(48,58,50,.16)'); g.fillStyle = p.tone === 'bay' ? '#7a4718' : INK; g.textBaseline = 'middle'; g.fillText(text, x + (p.wIcon ? p.wIcon + 6 * S : 10 * S), y + h / 2 + 1);}
      if (p.wIcon) {const r = p.wIcon / 2; g.beginPath(); g.arc(x + r, y + h / 2, r - 1, 0, Math.PI * 2); g.fillStyle = p.badge ? tone : '#ffffff'; g.fill(); g.lineWidth = 3; g.strokeStyle = tone; g.stroke();
        if (p.badge) {g.fillStyle = '#ffffff'; g.font = `700 ${Math.round(r * 1.15)}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(p.badge, x + r, y + h / 2 + 1); g.textAlign = 'left';}
        else if (p.icon || p.glyph) {const im = await iconImage(p.icon, tone, p.glyph); if (im) g.drawImage(im, x + r * .45, y + h / 2 - r * .55, r * 1.1, r * 1.1);}
        if (p.tag) {const tr = r * .5, tx = x + 2 * r - tr * .7, ty = y + h / 2 + r - tr * .7; g.beginPath(); g.arc(tx, ty, tr, 0, Math.PI * 2); g.fillStyle = tone; g.fill(); g.lineWidth = 2; g.strokeStyle = '#ffffff'; g.stroke();
          g.fillStyle = '#ffffff'; g.font = `600 ${Math.round(tr * 1.35)}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(p.tag, tx, ty + 1); g.textAlign = 'left';}}
    }
  }
  // Title band.
  const y0 = H - BAND; g.fillStyle = CREAM; g.fillRect(0, y0, W, BAND); g.fillStyle = 'rgba(69,82,61,.22)'; g.fillRect(0, y0, W, 3);
  g.textBaseline = 'alphabetic'; g.fillStyle = INK; g.font = `700 64px ${FONT}`; g.fillText(title, PAD, y0 + 104);
  g.font = `400 36px ${FONT}`; g.fillStyle = MUTED; g.fillText(subtitle, PAD, y0 + 162); g.fillText('平面俯视，墙体在1.2米高处剖开', PAD, y0 + 214); g.fillText(today(), PAD, y0 + 266);
  // Legend: the layers that are on (the suggested points only when this layout has some), in columns of five rows, measured and kept
  // clear of the north arrow and the two notes on the right (their boxes are returned for the QA tools).
  const has = k => specs.some(s => s.layer === k), on = k => ['cap', 'bay'].includes(k) || (ELEC_LAYERS.includes(k) ? layers[k] && has(k) : layers[k]);
  const legend = [['bearing', '承重墙（DWG黑色填充），不可拆改'], ['cap', '其他墙，剖切高度1.2米'], ['bay', '飘窗台和窗下墙，不可拆'], ['water', '水点，坐标已锁定，地漏和排污口以现场为准'],
    ['power', '强电，插座和电箱'], ['weak', '弱电，网络、电视和弱电箱'], ['lights', '灯位和开关'], ['ac', '空调（占位，机型待定）'], ['dims', '尺寸，图上墙线净距'], ['doors', '门开向与窗']].filter(([k]) => on(k));
  const lastElec = legend.map(([k]) => ELEC_LAYERS.includes(k)).lastIndexOf(true);
  if (lastElec >= 0) legend.splice(lastElec + 1, 0, ['note', '强弱电和灯位是建议点位，以电工现场为准']);
  const nx = W - PAD - 70, ny = y0 + 110, notes = ['尺寸单位 mm，以 DWG 为准', '模型示意，施工前请现场复核'];
  g.font = `400 32px ${FONT}`;
  const reserved = [{x: nx - 50, y: y0 + 40, w: 100, h: 190}, ...notes.map((t, i) => {const w = g.measureText(t).width; return {x: W - PAD - 160 - w, y: y0 + 214 + i * 52 - 28, w, h: 36};})];
  const clash = b => reserved.some(o => b.x < o.x + o.w + 16 && b.x + b.w + 16 > o.x && b.y < o.y + o.h && b.y + b.h > o.y);
  const boxes = []; let colX = 1150, row = 0, colW = 0;
  for (const [k, t] of legend) {
    const tw = g.measureText(t).width, sw = k === 'note' ? 0 : 66;
    for (;;) {
      if (row >= 5) {colX += colW + 56; colW = 0; row = 0;}
      const cy = y0 + 58 + row * 54, b = {k, t, cx: colX, cy, x: colX, y: cy - 22, w: sw + tw, h: 38}; row++;
      if (clash(b) && colX < W) continue;
      boxes.push(b); colW = Math.max(colW, b.w); break;
    }
  }
  for (const {k, t, cx, cy} of boxes) {
    if (k === 'bearing') {g.fillStyle = '#27302a'; g.fillRect(cx, cy - 18, 46, 30);} else if (k === 'cap') {g.fillStyle = '#aab39f'; g.fillRect(cx, cy - 18, 46, 30);}
    else if (k === 'bay') {const dash = 10, gapLen = 7; g.setLineDash([dash, gapLen]); g.lineWidth = 4; g.strokeStyle = '#a0622c'; g.strokeRect(cx + 2, cy - 16, 42, 26); g.setLineDash([]);}
    else if (k === 'dims') {g.fillStyle = '#3f5a3a'; g.fillRect(cx, cy - 4, 46, 4); g.fillRect(cx, cy - 14, 4, 24); g.fillRect(cx + 42, cy - 14, 4, 24);}
    else if (k === 'doors') {g.lineWidth = 3; g.strokeStyle = '#6d7c64'; g.beginPath(); g.moveTo(cx + 4, cy + 12); g.lineTo(cx + 4, cy - 20); g.arc(cx + 4, cy + 12, 32, -Math.PI / 2, 0); g.stroke();}
    else if (k !== 'note') {g.beginPath(); g.arc(cx + 23, cy - 3, 19, 0, Math.PI * 2); g.fillStyle = '#fff'; g.fill(); g.lineWidth = 4; g.strokeStyle = TONES[k]; g.stroke();
      if (LEGEND_ICON[k]) {const im = await iconImage(LEGEND_ICON[k], TONES[k]); if (im) g.drawImage(im, cx + 9, cy - 17, 28, 28);}}
    g.fillStyle = k === 'note' ? MUTED : INK; g.font = `400 32px ${FONT}`; g.textBaseline = 'alphabetic'; g.fillText(t, cx + (k === 'note' ? 0 : 66), cy + 9);
  }
  // North arrow from the export camera, then the scale note.
  const c0 = project(f.target.x, 0, f.target.z, cam, W, H), c1 = project(f.target.x, 0, f.target.z - 1, cam, W, H), ang = c0 && c1 ? Math.atan2(c1[0] - c0[0], c0[1] - c1[1]) : 0;
  g.save(); g.translate(nx, ny); g.rotate(ang); g.beginPath(); g.moveTo(0, -58); g.lineTo(30, 40); g.lineTo(0, 22); g.lineTo(-30, 40); g.closePath(); g.fillStyle = INK; g.fill(); g.restore();
  g.font = `700 36px ${FONT}`; g.textAlign = 'center'; g.fillStyle = INK; g.fillText('北', nx, y0 + 214); g.textAlign = 'right'; g.font = `400 32px ${FONT}`; g.fillStyle = MUTED;
  notes.forEach((t, i) => g.fillText(t, W - PAD - 160, y0 + 214 + i * 52)); g.textAlign = 'left';
  ms.draw = Math.round(performance.now() - t0);
  const blob = await new Promise(r => canvas.toBlob(r, 'image/png')); ms.png = Math.round(performance.now() - t0);
  const name = `玺院-B户型-平面-${title.replace(/^我的 B 户型，?/, '') || '全户'}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.png`;
  if (download && blob) {const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 60000);}
  const marks = specs.filter(s => ELEC_LAYERS.includes(s.layer)).length, hiddenPts = res.hidden.filter(p => ELEC_LAYERS.includes(p.layer)).reduce((n, p) => n + p.anchors.length, 0);
  return {width: W, height: H, bytes: blob?.size || 0, name, placed: res.placed.length, hidden: res.hidden.length, northDeg: Math.round(ang * 180 / Math.PI), ms, blob,
    legend: boxes.map(({k, t, x, y, w, h}) => ({k, t, x, y, w, h})), reserved, points: {specs: marks, hiddenWithoutLabel: hiddenPts}, labels: res.placed.map(p => ({key: p.key, layer: p.layer, kind: p.kind, box: p.box, iconOnly: !!p.iconOnly}))};
}
