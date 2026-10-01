#!/usr/bin/env node
/* Execute the actual renderer with source formatting and workflow modules.
   Reports stay outside the website. No browser and no writes to site inputs. */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const options = { target: path.resolve(HERE, '../..'), baselineRef: '01da61a', baselineRepo: '', work: path.join(os.tmpdir(), 'gang-guided-render') };
for (let i = 2; i < process.argv.length; i += 1) {
  const field = { '--target': 'target', '--baseline-ref': 'baselineRef', '--baseline-repo': 'baselineRepo', '--work': 'work' }[process.argv[i]];
  if (!field || !process.argv[i + 1]) throw new Error('Usage: node verify-guided-render.mjs --baseline-repo <repo> [--baseline-ref <ref>] [--target <site>] [--work <external directory>]');
  options[field] = process.argv[++i];
}
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const run = (cmd, args, opts = {}) => {
  const result = spawnSync(cmd, args, { maxBuffer: 128 * 1024 * 1024, ...opts });
  if (result.error || result.status !== 0) throw new Error(result.error?.message || `${cmd}: ${result.stderr}`);
  return result.stdout;
};
const read = (root, name) => fs.readFileSync(path.join(root, name), 'utf8');
const inputs = ['app.js', 'index.html', 'employee-handbook.js', 'employee-handbook-formatting.js', 'source-formatting.js', 'workflow-guide.js'];
const inventory = root => ({
  scripts: Object.fromEntries(inputs.filter(name => fs.existsSync(path.join(root, name))).map(name => [name, sha(read(root, name))])),
  images: Object.fromEntries(fs.readdirSync(path.join(root, 'assets/employee-handbook')).sort().map(name => [name, sha(fs.readFileSync(path.join(root, 'assets/employee-handbook', name)))])),
});
const inside = (child, parent) => { const rel = path.relative(parent, child); return rel === '' || (!rel.startsWith('..' + path.sep) && rel !== '..' && !path.isAbsolute(rel)); };

function capture(root, enhanced) {
  const app = read(root, 'app.js');
  const marker = '\n  tabs.addEventListener("click",';
  if (app.split(marker).length !== 2) throw new Error('Renderer extraction boundary changed');
  const sink = { innerHTML: '' }, local = new Map();
  const window = { localStorage: { getItem: k => local.get(k) ?? null, setItem: (k, v) => local.set(k, String(v)), removeItem: k => local.delete(k) } };
  const context = vm.createContext({ window, document: { querySelector: selector => selector === '#print-sheet' ? sink : null },
    location: { href: 'http://localhost/handbook/', hash: '' }, console });
  for (const name of ['employee-handbook.js', ...(enhanced ? ['employee-handbook-formatting.js', 'source-formatting.js', 'workflow-guide.js'] : [])])
    vm.runInContext(read(root, name), context, { filename: name, timeout: 5000 });
  const extra = enhanced ? `
      const guided = reader; readingMode = 'all'; const continuous = renderReader(node, flow); readingMode = 'guided';
      const guide = guideFor(node);
      const transactionEntries = guide?.transactionEntries || [];
      const preparationRefs = (guide?.beforeNotes || []).filter(ref => ref.phaseKey !== 'prepare');
      const refs = [...(guide?.beforeNotes || []), ...(guide?.closingGroups || []).flatMap(g => g.items), ...(guide?.uncertainItems || [])];
      const quotes = refs.map(ref => ({ ref, html: sourceQuote(node, ref) }));
      const expectedLines = flow.flatMap(phase => layoutLines(phase.blocks).map(line => ({
        sourceIndex: phase.sourceIndices[line.blockIndex], lineIndex: line.lineIndex,
        text: line.text, consumed: line.consumed, table: line.table, images: line.images
      })));
      const rawBlocks = (node.section.blocks || []).map((block, i) => renderRawBlock(block, i, node.key));
      const aside = renderAside(node, flow);
      const legacyCard = cards[0]?.cardKey || '0.0';
      storageSet('hb:check:' + node.key, JSON.stringify({[legacyCard]: [0]}));
      loadChecks(node.key);
      const legacyChecksIgnored = checkedSet(legacyCard, cards[0]?.total || 1).size === 0;
      storageDrop('hb:check:' + node.key);
    ` : '';
  const resultFields = enhanced ? ', continuous, expectedLines, rawBlocks, quotes, preparationRefs, transactionEntries, aside, legacyChecksIgnored, formatting: sourceFormats[node.key] || {blocks:{}}' : '';
  const expose = `
    globalThis.__capture = () => allNodes().map(node => {
      selectedKey = node.key; categoryIndex = node.categoryIndex; activeStage = 0;
      checkState = {}; checkNodeKey = node.key;
      const flow = flowFor(node), reader = renderReader(node, flow);
      const cards = JSON.parse(JSON.stringify(materialCards)), figures = JSON.parse(JSON.stringify(lightboxFigures));
      const raw = renderRawReader(node);
      printImages = true; buildPrintSheet(); const printWithImages = printSheet.innerHTML;
      printImages = false; buildPrintSheet(); const printWithoutImages = printSheet.innerHTML;
      ${extra}
      return { key: node.key, categoryIndex: node.categoryIndex, title: cleanTitle(node.section.title),
        sourceTitle: node.section.title, blocks: node.section.blocks || [],
        flow: flow.map(p => ({ key:p.key, blocks:p.blocks, sourceIndices:p.sourceIndices })),
        reader, raw, printWithImages, printWithoutImages, cards, figures ${resultFields} };
    });
  })();`;
  vm.runInContext(app.slice(0, app.indexOf(marker)) + expose, context, { filename: 'app.js [renderer prefix]', timeout: 5000 });
  return JSON.parse(JSON.stringify(vm.runInContext('__capture()', context, { timeout: 30000 })));
}

try {
  const target = fs.realpathSync(options.target), repo = fs.realpathSync(options.baselineRepo || target);
  const work = path.resolve(options.work);
  if (inside(work, target) || inside(work, repo)) throw new Error('Report directory must be outside website/repository');
  fs.mkdirSync(work, { recursive: true });
  const output = fs.mkdtempSync(path.join(work, 'render-'));
  const baseline = path.join(output, 'baseline'); fs.mkdirSync(baseline);
  const archive = path.join(output, 'baseline.tar');
  const prefix = String(run('git', ['-C', repo, 'rev-parse', '--show-prefix'])).trim().replace(/\/$/, '');
  const revision = String(run('git', ['-C', repo, 'rev-parse', '--verify', options.baselineRef + '^{commit}'])).trim();
  run('git', ['-C', repo, 'archive', '--format=tar', '--output=' + archive, prefix ? revision + ':' + prefix : revision, '--', 'app.js', 'index.html', 'employee-handbook.js', 'assets/employee-handbook']);
  run('tar', ['-xf', archive, '-C', baseline]); fs.unlinkSync(archive);
  const before = inventory(target), original = inventory(baseline);
  if (before.scripts['employee-handbook.js'] !== original.scripts['employee-handbook.js']) throw new Error('Source data changed');
  if (Object.keys(original.images).length !== 114 || JSON.stringify(before.images) !== JSON.stringify(original.images)) throw new Error('Original images changed');
  const payload = { baseline: capture(baseline, false), candidate: capture(target, true) };
  const payloadPath = path.join(output, 'captures.json'); fs.writeFileSync(payloadPath, JSON.stringify(payload));
  const parsed = JSON.parse(String(run('python3', [path.join(HERE, 'verify-guided-render-html.py'), payloadPath])));
  if (parsed.checks.every(c => c.ok)) {
    const negatives = [];
    const paragraph = /<p\b[^>]*data-source-index="\d+"[^>]*>[\s\S]*?<\/p>/;
    const cases = [
      ['lost source paragraph', paragraph, ''],
      ['duplicated source paragraph', paragraph, match => match + match],
      ['wrong original font color', /color:#FF0000/, 'color:#00AA00'],
      ['lost material item text', /<span class="check-text">[\s\S]*?<\/span>/, ''],
      ['unrelated source code on transaction badge', /data-code="H001"/, 'data-code="000000"'],
      ['invented branch context on source excerpt', /(<small class="quote-context">)[^<]*(<\/small>)/, '$1错误适用情形$2'],
    ];
    for (let i = 0; i < cases.length; i += 1) {
      const [name, pattern, replacement] = cases[i];
      const changed = structuredClone(payload);
      const sample = changed.candidate.find(node => pattern.test(node.reader));
      if (!sample) throw new Error('No negative fixture for ' + name);
      sample.reader = sample.reader.replace(pattern, replacement);
      const filename = path.join(output, 'negative-' + i + '.json'); fs.writeFileSync(filename, JSON.stringify(changed));
      const result = JSON.parse(String(run('python3', [path.join(HERE, 'verify-guided-render-html.py'), filename])));
      negatives.push({ name, detected: result.checks.some(c => !c.ok) });
    }
    parsed.negativeControls = negatives;
    parsed.checks.push({ name: 'negative controls detect source loss/duplication, wrong color/material, unrelated code and invented context', ok: negatives.every(n => n.detected), detail: negatives });
  }
  parsed.checks.push({ name: 'source data and all 114 image hashes equal baseline', ok: true });
  parsed.checks.push({ name: 'site inputs unchanged during capture', ok: JSON.stringify(before) === JSON.stringify(inventory(target)) });
  parsed.verdict = parsed.checks.every(c => c.ok) ? 'PASS' : 'FAIL';
  parsed.baseline = revision;
  parsed.limitations = ['Node executes the real renderer prefix with all three new modules; it does not boot browser events.', 'HTML and inline source-format annotations are checked. CSS computed visibility/colors, click/focus, scrolling and print pagination need browser checks.', 'Excerpts and navigation indexes may intentionally repeat source text; unique body coverage excludes those interface copies.'];
  parsed.hashes = before;
  const report = path.join(output, 'report.json'); fs.writeFileSync(report, JSON.stringify(parsed, null, 2));
  console.log(JSON.stringify({ verdict: parsed.verdict, checks: parsed.checks.length, stats: parsed.stats, failures: parsed.failures, report }, null, 2));
  process.exitCode = parsed.verdict === 'PASS' ? 0 : 1;
} catch (error) {
  console.error(error.stack || error.message); process.exitCode = 2;
}
