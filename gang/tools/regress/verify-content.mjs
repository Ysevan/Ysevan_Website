#!/usr/bin/env node
/* Content regression for intentional layout changes. Uses the application's real
   render functions in separate Node VMs and an independent Python HTML parser.
   No browser, network, CDP, package install, or writes to the site under test. */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_TARGET = path.resolve(HERE, '../..');
const checks = [];
const check = (name, ok, detail = null) => checks.push({ name, ok: Boolean(ok), detail });
const sha = value => crypto.createHash('sha256').update(value).digest('hex');
const read = (root, file) => fs.readFileSync(path.join(root, file));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const captureTime = Date.now();

function parseArgs(argv) {
  const opts = {
    target: DEFAULT_TARGET,
    baselineRef: '',
    baselineRepo: '',
    work: process.env.GANG_REGRESS_WORK || path.join(os.tmpdir(), 'gang-content-regress'),
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') { opts.help = true; continue; }
    const field = { '--target': 'target', '--baseline-ref': 'baselineRef', '--baseline-repo': 'baselineRepo', '--work': 'work' }[arg];
    if (!field) throw new Error(`Unknown argument: ${arg}`);
    if (++i >= argv.length) throw new Error(`Missing value for ${arg}`);
    opts[field] = argv[i];
  }
  if (!opts.help && !opts.baselineRef) throw new Error('--baseline-ref is required; use the commit before the change, not an identical target');
  return opts;
}

function help() {
  console.log(`Usage: node tools/regress/verify-content.mjs --baseline-ref <commit> [options]

  --target <dir>         Site to inspect; defaults to this script's repository root
  --baseline-ref <ref>   Required baseline commit
  --baseline-repo <dir> Site directory in a Git checkout containing the baseline
                        Defaults to target, then this script's root, then cwd
  --work <dir>           External output directory; defaults to GANG_REGRESS_WORK
                        or the system temp directory's gang-content-regress

Requires Node 24+, Python 3, Git, and tar. No third-party libraries or browser.
Output includes private source text/images and is refused inside a site/repository.
Exit codes: 0 content checks passed; 1 content check failed; 2 runner error.
PASS does not cover CSS visibility, interactions, image decoding, or print pagination.`);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { maxBuffer: 64 * 1024 * 1024, ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed (${result.status}): ${String(result.stderr || '').trim()}`);
  return result.stdout;
}
const git = (directory, ...args) => run('git', ['-C', directory, ...args]);

function gitRoot(directory) {
  const result = spawnSync('git', ['-C', directory, 'rev-parse', '--show-toplevel'], { encoding: 'utf8' });
  return result.status === 0 ? fs.realpathSync(result.stdout.trim()) : null;
}

// Resolve existing ancestors so a symlink cannot place reports back in the repo.
function canonicalPath(value) {
  let current = path.resolve(value);
  const suffix = [];
  while (!fs.existsSync(current)) {
    suffix.unshift(path.basename(current));
    const parent = path.dirname(current);
    if (parent === current) throw new Error(`Cannot resolve output path: ${value}`);
    current = parent;
  }
  return path.join(fs.realpathSync(current), ...suffix);
}

function inside(child, parent) {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

function imageManifest(root) {
  const folder = 'assets/employee-handbook';
  return Object.fromEntries(fs.readdirSync(path.join(root, folder)).sort().map(name => [name, sha(read(root, `${folder}/${name}`))]));
}

function inventory(root) {
  return { app: sha(read(root, 'app.js')), index: sha(read(root, 'index.html')), data: sha(read(root, 'employee-handbook.js')), images: imageManifest(root) };
}

function extractBaseline(repo, commit, output) {
  const baseline = path.join(output, 'baseline');
  const tarPath = path.join(output, 'baseline.tar');
  fs.mkdirSync(baseline);
  const prefix = git(repo, 'rev-parse', '--show-prefix').toString('utf8').trim().replace(/\/$/, '');
  const tree = prefix ? `${commit}:${prefix}` : commit;
  git(repo, 'archive', '--format=tar', `--output=${tarPath}`, tree, '--', 'app.js', 'index.html', 'employee-handbook.js', 'assets/employee-handbook');
  run('tar', ['-xf', tarPath, '-C', baseline]);
  fs.unlinkSync(tarPath);
  return baseline;
}

// Deliberately do not boot the UI. All required renderer functions/constants are
// before this unique boundary; only the outer event/init tail is omitted. A source
// restructure that invalidates the boundary fails instead of silently skipping.
function renderer(app, data, label) {
  const marker = '\n  tabs.addEventListener("click",';
  if (app.split(marker).length !== 2) throw new Error(`${label}: renderer extraction boundary changed; inspect app.js`);
  const prefix = app.slice(0, app.indexOf(marker));
  for (const name of ['allNodes', 'flowFor', 'renderReader', 'renderRawReader', 'buildPrintSheet']) {
    if (!prefix.includes(`function ${name}(`)) throw new Error(`${label}: ${name} is outside the renderer boundary`);
  }
  const printSink = { innerHTML: '' };
  const local = new Map();
  const window = {
    localStorage: { getItem: k => local.get(k) ?? null, setItem: (k, v) => local.set(k, String(v)), removeItem: k => local.delete(k) },
  };
  class CaptureDate extends Date {
    constructor(...args) { super(...(args.length ? args : [captureTime])); }
    static now() { return captureTime; }
  }
  const context = vm.createContext({
    window,
    document: { querySelector: selector => selector === '#print-sheet' ? printSink : null },
    location: { href: 'http://localhost/handbook/', hash: '' },
    Date: CaptureDate,
    console,
  });
  vm.runInContext(data, context, { filename: `${label}/employee-handbook.js`, timeout: 3000 });
  const expose = `
    globalThis.__capture = () => allNodes().map(node => {
      selectedKey = node.key; categoryIndex = node.categoryIndex; activeStage = 0;
      checkState = {}; checkNodeKey = node.key;
      const flow = flowFor(node);
      const reader = renderReader(node, flow);
      const cards = JSON.parse(JSON.stringify(materialCards));
      const figures = JSON.parse(JSON.stringify(lightboxFigures));
      const raw = renderRawReader(node);
      printImages = true; buildPrintSheet(); const printWithImages = printSheet.innerHTML;
      printImages = false; buildPrintSheet(); const printWithoutImages = printSheet.innerHTML;
      return { key: node.key, categoryIndex: node.categoryIndex, title: cleanTitle(node.section.title),
        blocks: node.section.blocks || [], flow: flow.map(s => ({key:s.key, blocks:s.blocks})),
        reader, raw, printWithImages, printWithoutImages, cards, figures };
    });
  })();`;
  vm.runInContext(prefix + expose, context, { filename: `${label}/app.js [renderer prefix]`, timeout: 5000 });
  const nodes = vm.runInContext('__capture()', context, { timeout: 10000 });
  return JSON.parse(JSON.stringify(nodes));
}

try {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) { help(); process.exit(0); }
  const target = fs.realpathSync(path.resolve(opts.target));
  const candidates = opts.baselineRepo ? [path.resolve(opts.baselineRepo)] : [target, DEFAULT_TARGET, process.cwd()];
  const repo = candidates.find(directory => gitRoot(directory));
  if (!repo) throw new Error('No Git checkout found. For an exported preview, pass --baseline-repo <original site directory>.');
  const commit = git(repo, 'rev-parse', '--verify', '--end-of-options', `${opts.baselineRef}^{commit}`).toString('utf8').trim();
  const work = canonicalPath(opts.work);
  const protectedRoots = [target, canonicalPath(DEFAULT_TARGET), fs.realpathSync(repo), gitRoot(repo), gitRoot(target)].filter(Boolean);
  for (const root of protectedRoots) {
    if (inside(work, root)) throw new Error(`--work must be outside the site/repository: ${work} is inside ${root}`);
  }
  fs.mkdirSync(work, { recursive: true });
  const output = fs.mkdtempSync(path.join(work, `content-${commit.slice(0, 7)}-`));
  const beforeTarget = inventory(target);
  const baselineRoot = extractBaseline(repo, commit, output);
  const baselineInventory = inventory(baselineRoot);
  const baselineApp = read(baselineRoot, 'app.js').toString('utf8');
  const baselineData = read(baselineRoot, 'employee-handbook.js').toString('utf8');
  const targetApp = read(target, 'app.js').toString('utf8');
  check('handbook source data byte-for-byte unchanged', baselineInventory.data === beforeTarget.data, beforeTarget.data);
  check('all 114 source image files have identical names and SHA-256', Object.keys(baselineInventory.images).length === 114 && same(baselineInventory.images, beforeTarget.images), { baseline: Object.keys(baselineInventory.images).length, target: Object.keys(beforeTarget.images).length });

  const baseline = renderer(baselineApp, baselineData, 'baseline');
  const candidate = renderer(targetApp, read(target, 'employee-handbook.js').toString('utf8'), 'target');
  check('81 business nodes preserved', baseline.length === 81 && candidate.length === 81, { baseline: baseline.length, target: candidate.length });
  const identities = nodes => nodes.map(({key, categoryIndex, title}) => ({key, categoryIndex, title}));
  check('business keys/order/category/title preserved', same(identities(baseline), identities(candidate)));
  check('real render() still connects enhanced reader', /shell\.reader\.innerHTML\s*=\s*renderReader\(node,\s*flow\)/.test(targetApp));
  check('real render() still connects original-text reader', /shell\.reader\.innerHTML\s*=\s*renderRawReader\(node\)/.test(targetApp));
  check('print events still call the tested builder', /window\.addEventListener\("beforeprint",\s*buildPrintSheet\)/.test(targetApp) && /buildPrintSheet\(\);\s*if\s*\(typeof window\.print/.test(targetApp));
  const index = read(target, 'index.html').toString('utf8');
  const scripts = Array.from(index.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/g), match => match[1].split(/[?#]/)[0]);
  check('index loads the unchanged data before the tested application', scripts.indexOf('employee-handbook.js') >= 0 && scripts.indexOf('employee-handbook.js') < scripts.indexOf('app.js'));

  const payloadPath = path.join(output, 'renderer-captures.json');
  fs.writeFileSync(payloadPath, JSON.stringify({ baseline, candidate }));
  const parsed = spawnSync('python3', [path.join(HERE, 'verify-content-html.py'), payloadPath], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  if (parsed.error) throw parsed.error;
  if (parsed.status !== 0 && parsed.status !== 1) throw new Error(parsed.stderr || 'HTML analysis failed');
  const semantic = JSON.parse(parsed.stdout);
  checks.push(...semantic.checks);
  check('target app/index/data/images stayed unchanged during the run', same(beforeTarget, inventory(target)));
  const report = {
    scope: 'Real renderer output in Node VM plus independent Python HTML parsing; no CSS/layout/browser/event execution.',
    baselineRef: opts.baselineRef, baselineCommit: commit, baselineRepo: fs.realpathSync(repo), target,
    generatedAt: new Date().toISOString(), captureTime: new Date(captureTime).toISOString(),
    hashes: { baselineApp: baselineInventory.app, targetApp: beforeTarget.app, targetIndex: beforeTarget.index, sourceData: baselineInventory.data, images: beforeTarget.images },
    stats: semantic.stats, checks, verdict: checks.every(c => c.ok) ? 'PASS' : 'FAIL',
    limitations: [
      'Does not establish browser DOM parsing, CSS visibility, overflow, sticky offsets, touch targets, focus, history, persistence, image decoding, or print pagination.',
      'Enhanced body text is compared to the baseline renderer, with presentation-only controls excluded; raw reader text is independently checked against source blocks.',
      'Printing compares full printed document text as well as body/tables/images; only the website version inside print-meta is normalized. Both VMs share one clock and location.',
      'Rendering prefix is evaluated instead of booting the full app. Static call-site wiring checks cannot replace interaction tests.',
    ],
  };
  const reportPath = path.join(output, 'report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  const failed = checks.filter(c => !c.ok);
  console.log(JSON.stringify({ verdict: report.verdict, passed: checks.length - failed.length, checks: checks.length, stats: report.stats, failures: failed, report: reportPath }, null, 2));
  process.exitCode = failed.length ? 1 : 0;
} catch (error) {
  console.error(error.stack || String(error));
  process.exitCode = 2;
}
