import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const context = vm.createContext({ window: {} });
for (const name of ['source-formatting.js', 'employee-handbook.js', 'employee-handbook-formatting.js'])
  vm.runInContext(fs.readFileSync(path.join(root, name), 'utf8'), context, { filename: name });
const helper = context.window.HandbookSourceFormatting;
const data = context.window.EMPLOYEE_HANDBOOK_FORMATTING;
assert.equal(data.offsetUnit, 'utf16');
assert.equal(data.sourceDataSha256, createHash('sha256').update(fs.readFileSync(path.join(root, 'employee-handbook.js'))).digest('hex'));
const originalNodes = new Map();
function indexNodes(section, indexes = []) {
  originalNodes.set(indexes.length ? indexes.join('-') : '$root', section);
  (section.children || []).forEach((child, i) => indexNodes(child, [...indexes, i]));
}
indexNodes(context.window.EMPLOYEE_HANDBOOK.content);
const plain = html => html.replace(/<\/?(?:span|mark)\b[^>]*>/g, '').replace(/&(?:amp|lt|gt|quot|#39);/g, value => ({
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'",
})[value]);

const text = '<script>&"\'中😀文\n';
assert.equal(plain(helper.render(text, [{ start: 0, end: text.length, color: '#FF0000', highlight: '#FFFF00', bold: true }])), text);
assert.ok(!helper.render('<img onerror=x>', []).includes('<img'));
assert.ok(!helper.render('text', [{ start: 0, end: 4, color: 'red;position:fixed', highlight: '" onerror="x' }]).includes('style='));
assert.equal(helper.render('abc', [{ start: 0, end: 2 }, { start: 1, end: 3 }]), 'abc');
assert.equal(helper.valid('😀', [{ start: 0, end: 1, bold: true }]), false);
assert.equal(helper.valid('😀', [{ start: 0, end: 2, bold: true }]), true);
assert.throws(() => helper.slice('😀', [], 0, 1), /UTF-16/);
const clipped = helper.slice('一二三四', [{ start: 0, end: 3, color: '#0000FF' }], 1, 4);
assert.equal(clipped.text, '二三四');
assert.equal(JSON.stringify(clipped.spans), JSON.stringify([{ start: 0, end: 2, color: '#0000FF' }]));
assert.match(helper.render('a', [{ start: 0, end: 1, bold: false }]), /font-weight:400/);
// An existing source correction adds an explanatory wrapper. Its generic 注
// must not inherit the source 注意事项 color through an accidental text match.
const deletionNote = data.nodes['1-1-4-0'].blocks['44'];
assert.equal(deletionNote.text, '（原稿此节标注：删除）');
assert.equal(deletionNote.spans.map(span => deletionNote.text.slice(span.start, span.end)).join(''), '删除');

let entries = 0, spans = 0;
function verify(entry) {
  assert.equal(helper.valid(entry.text, entry.spans), true);
  assert.equal(plain(helper.render(entry.text, entry.spans)), entry.text);
  entries += 1;
  spans += entry.spans.length;
}
for (const [key, node] of Object.entries(data.nodes)) {
  const source = originalNodes.get(key);
  assert.ok(source, `Missing source node ${key}`);
  if (node.title) {
    assert.equal(node.title.text, source.title);
    verify(node.title);
  }
  for (const [index, block] of Object.entries(node.blocks)) {
    const original = source.blocks[Number(index)];
    assert.ok(original, `Missing source block ${key}/${index}`);
    if (block.cells) {
      assert.equal(JSON.stringify(block.cells.map(row => row.map(cell => cell.text))), JSON.stringify(original.rows));
      block.cells.flat().forEach(verify);
    } else {
      assert.equal(block.text, original.text);
      verify(block);
    }
  }
}
console.log(JSON.stringify({ verdict: 'PASS', entries, spans, checks: 'escaping, color whitelist, overlap fallback, UTF-16 boundaries, clipping, source text conservation' }, null, 2));
