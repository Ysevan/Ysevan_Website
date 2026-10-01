#!/usr/bin/env node
/* Independent data checks for the source-linked reading guide. No browser,
   packages, network, or writes. The handbook and formatting inputs are frozen
   before the real module runs. Excerpts may be indexed in several guide lists;
   full source blocks must occur exactly once in the ordered phase body. */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ORIGINAL_SHA256 = '094e2e97829d77339b83f950c97180865807360f13b0088bfecc724d673f44f1';
const PHASE_KEYS = ['prepare', 'operate', 'review', 'archive'];
const GROUP_KEYS = ['print', 'voucher', 'receipts', 'review', 'supervisorSignature', 'customerSignature', 'customerSeal', 'otherSeals'];
const failures = [];
let checkCount = 0;
const stats = { businesses: 0, blocks: 0, tables: 0, imageReferences: 0, uniqueImages: 0, excerpts: 0,
  branches: 0, branchBlocks: 0, sourceOrderFallbacks: 0, formattingNodes: 0, formattingSpans: 0,
  colorSpans: 0, highlightSpans: 0, fixtures: 0, mutationGuards: 0, closingMentions: {},
  transactionEntries: 0, transactionCodeMentions: 0, realTransactionRegressions: 0 };
const check = (ok, label) => { checkCount += 1; if (!ok) failures.push(label); };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const sequence = length => Array.from({ length }, (_, i) => i);
function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) Object.freeze(value);
  if (value && typeof value === 'object') Object.values(value).forEach(freeze);
  return value;
}
function load(filename, context) {
  vm.runInContext(fs.readFileSync(filename, 'utf8'), context, { filename, timeout: 5000 });
}
function args() {
  let target = ROOT;
  for (let i = 2; i < process.argv.length; i += 1) {
    if (['--help', '-h'].includes(process.argv[i])) {
      console.log('Usage: node tools/regress/verify-workflow.mjs [--target <site directory>]\nChecks original data, formatting offsets, guide provenance/order, and semantic negative fixtures.\nDoes not test browser rendering, actual business correctness, or DOCX extraction itself.\nExit: 0 pass, 1 failed assertions, 2 runner error. Writes no files.');
      process.exit(0);
    }
    if (process.argv[i] !== '--target' || !process.argv[i + 1]) throw new Error('Expected --target <site directory>');
    target = path.resolve(process.argv[++i]);
  }
  return target;
}

// Traverse source sections directly, independently of app.js and its layout.
function collect(handbook) {
  const sections = new Map(), businesses = [];
  function visit(section, indices) {
    const key = indices.join('-');
    sections.set(key, section);
    if ((section.blocks || []).length) businesses.push({ key, section });
    (section.children || []).forEach((child, index) => visit(child, [...indices, index]));
  }
  handbook.content.children.forEach((category, index) => visit(category, [index]));
  return { sections, businesses };
}

function sourceValue(block, ref) {
  if (ref.field === 'text') return typeof block?.text === 'string' ? block.text : null;
  if (ref.field === 'rows' && Number.isInteger(ref.rowIndex) && Number.isInteger(ref.cellIndex)) {
    return block?.rows?.[ref.rowIndex]?.[ref.cellIndex] ?? null;
  }
  return null;
}

function checkRef(ref, blocks, model, label, isBranch = false) {
  check(Number.isInteger(ref.sourceIndex) && ref.sourceIndex >= 0 && ref.sourceIndex < blocks.length, `${label}: sourceIndex exists`);
  const value = sourceValue(blocks[ref.sourceIndex], ref);
  check(typeof value === 'string', `${label}: named source text/table cell exists`);
  if (typeof value !== 'string') return;
  const offsets = Number.isInteger(ref.start) && Number.isInteger(ref.end) && ref.start >= 0 && ref.end >= ref.start && ref.end <= value.length;
  check(offsets, `${label}: UTF-16 offsets are in range`);
  check(offsets && value.slice(ref.start, ref.end) === ref.text, `${label}: excerpt equals exact source slice`);
  const lines = value.split('\n');
  check(Number.isInteger(ref.lineIndex) && ref.lineIndex >= 0 && ref.lineIndex < lines.length, `${label}: lineIndex exists`);
  const expectedStart = lines.slice(0, ref.lineIndex).reduce((n, line) => n + line.length + 1, 0);
  check(ref.start === expectedStart && ref.text === lines[ref.lineIndex] && ref.end === expectedStart + (lines[ref.lineIndex]?.length || 0), `${label}: complete original line and its offsets preserved`);
  if (!isBranch) {
    check(ref.phaseKey === model.sources[ref.sourceIndex]?.phaseKey, `${label}: excerpt phase agrees with its source`);
    if (ref.contextSourceIndex != null) {
      check(Number.isInteger(ref.contextSourceIndex) && ref.contextSourceIndex >= 0 && ref.contextSourceIndex <= ref.sourceIndex, `${label}: context comes from an earlier/current source`);
      check(ref.context === String(blocks[ref.contextSourceIndex]?.text || '').split(/\r?\n/, 1)[0].trim(), `${label}: context is source heading, not invented text`);
    } else check(ref.context === '', `${label}: no invented context without source`);
    if (ref.branchSourceIndex != null) {
      const branch = model.branches.find(item => item.sourceIndex === ref.branchSourceIndex);
      check(Boolean(branch) && ref.branchTitle === branch.title && branch.sourceIndices.includes(ref.sourceIndex), `${label}: case label and source stay within the same condition branch`);
    } else check(!ref.branchTitle, `${label}: shared content has no invented branch label`);
    check(['explicit-before', 'see-source-context'].includes(ref.timing), `${label}: timing does not assert a new business rule`);
  }
}

function validate(node, model, count = true) {
  const label = node.key, blocks = node.section.blocks || [];
  check(model.sources.length === blocks.length, `${label}: source registry covers all blocks`);
  const phaseSources = model.phases.flatMap(phase => phase.sourceIndices);
  const phaseBlocks = model.phases.flatMap(phase => phase.blocks);
  check(same(model.phases.map(phase => phase.key), PHASE_KEYS), `${label}: phase keys/order`);
  check(same(phaseSources, sequence(blocks.length)), `${label}: phase body contains every source index once in original order`);
  check(phaseBlocks.length === blocks.length && phaseBlocks.every((block, i) => block === blocks[i]), `${label}: phase body retains original block identity exactly once`);
  model.sources.forEach((source, i) => {
    check(source.sourceIndex === i && source.block === blocks[i], `${label}/source ${i}: source index and object have same origin`);
    check(PHASE_KEYS.includes(source.phaseKey), `${label}/source ${i}: phase exists`);
  });
  model.phases.forEach(phase => {
    check(phase.blocks.length === phase.sourceIndices.length, `${label}/${phase.key}: blocks and sourceIndices align`);
    phase.sourceIndices.forEach((index, i) => check(phase.blocks[i] === blocks[index] && model.sources[index]?.phaseKey === phase.key, `${label}/${phase.key}/${i}: block/index/registry agree`));
    check(phase.headingSourceIndices.every(index => phase.sourceIndices.includes(index)), `${label}/${phase.key}: heading references remain inside owning phase`);
    check(new Set(phase.headingSourceIndices).size === phase.headingSourceIndices.length, `${label}/${phase.key}: no repeated heading index`);
    if (!phase.blocks.length) check(phase.status === 'not-stated' && Boolean(phase.notice), `${label}/${phase.key}: empty phase is unspecified, not waived`);
  });
  check(same([...model.closingGroups.map(group => group.key)].sort(), [...GROUP_KEYS].sort()), `${label}: closing groups distinguish actors and outputs`);
  check(Array.isArray(model.transactionEntries), `${label}: transaction references are explicitly available`);
  check(typeof model.transactionNotice === 'string' && /不是完整|不完整|有限/.test(model.transactionNotice), `${label}: transaction index does not claim to be exhaustive`);
  for (const [name, items] of [
    ['beforeNotes', model.beforeNotes], ['operationNotes', model.operationNotes], ['cautions', model.cautions], ['uncertainItems', model.uncertainItems],
    ['transactionEntries', model.transactionEntries || []],
    ...model.closingGroups.map(group => [`closing/${group.key}`, group.items])
  ]) {
    const ids = new Set();
    items.forEach((ref, i) => {
      checkRef(ref, blocks, model, `${label}/${name}/${i}`);
      const id = JSON.stringify([ref.sourceIndex, ref.field, ref.rowIndex, ref.cellIndex, ref.start, ref.end]);
      check(!ids.has(id), `${label}/${name}/${i}: no repeated excerpt within one index`);
      ids.add(id);
      if (count) stats.excerpts += 1;
    });
  }
  (model.transactionEntries || []).forEach((entry, i) => {
    const codes = entry.codes;
    check(Array.isArray(codes) && codes.length > 0, `${label}/transaction ${i}: explicit nonempty code list`);
    if (!Array.isArray(codes)) return;
    check(new Set(codes).size === codes.length, `${label}/transaction ${i}: no duplicate code inside one source line`);
    const tokens = Array.from(entry.text.matchAll(/[A-Za-z0-9]+/g));
    let previousPosition = -1;
    codes.forEach(code => {
      check(typeof code === 'string' && /^(?:[A-Za-z]\d+|\d+)$/.test(code), `${label}/transaction ${i}: code retains original alphanumeric characters`);
      const token = tokens.find(match => match[0] === code && match.index > previousPosition);
      check(Boolean(token), `${label}/transaction ${i}: every code is a complete original substring in source order`);
      if (token) previousPosition = token.index;
    });
    if (count) { stats.transactionEntries += 1; stats.transactionCodeMentions += codes.length; }
  });
  for (const group of model.closingGroups) {
    check(group.status === (group.items.length ? 'source-mentions' : 'not-stated'), `${label}/${group.key}: mentions do not assert that action is mandatory or deferred`);
    if (count) stats.closingMentions[group.key] = (stats.closingMentions[group.key] || 0) + group.items.length;
  }
  let lastBranch = -1;
  const branchIndices = new Set();
  model.branches.forEach((branch, i) => {
    checkRef(branch, blocks, model, `${label}/branch ${i}`, true);
    check(branch.sourceIndex > lastBranch && branch.title === branch.text, `${label}/branch ${i}: case title/order unchanged`);
    check(['source-case', 'inline-case'].includes(branch.kind) && branch.sequence === 'not-inferred', `${label}/branch ${i}: alternatives are not presented as mandatory sequential actions`);
    const nextStart = model.branches[i + 1]?.sourceIndex ?? blocks.length;
    const end = branch.sourceIndices.at(-1) + 1;
    check(end > branch.sourceIndex && end <= nextStart && same(branch.sourceIndices, sequence(end - branch.sourceIndex).map(n => n + branch.sourceIndex)), `${label}/branch ${i}: contiguous case range keeps source order and does not enter another case`);
    if (branch.kind === 'source-case') check(end === nextStart, `${label}/branch ${i}: full numbered case retains its entire original range`);
    branch.sourceIndices.forEach(index => { check(!branchIndices.has(index), `${label}/branch ${i}: cases do not overlap`); branchIndices.add(index); });
    lastBranch = branch.sourceIndex;
  });
  check(Boolean(model.fallback) === (model.mode === 'source-order'), `${label}: ambiguous ordering uses stated source-order fallback`);
  if (model.fallback) check(model.phases.find(phase => phase.key === 'operate').blocks.length === blocks.length, `${label}: fallback retains one continuous source sequence`);
  if (count) {
    stats.businesses += 1; stats.blocks += blocks.length; stats.branches += model.branches.length;
    stats.branchBlocks += branchIndices.size; stats.sourceOrderFallbacks += Number(Boolean(model.fallback));
    stats.tables += blocks.filter(block => block.kind === 'table').length;
    stats.imageReferences += blocks.reduce((n, block) => n + (block.images || []).length, 0);
  }
}

function verifyFormatting(formatting, sections) {
  function field(meta, text, label) {
    check(typeof text === 'string' && meta.text === text, `${label}: formatting text matches original field`);
    (meta.spans || []).forEach((span, i) => {
      check(Number.isInteger(span.start) && Number.isInteger(span.end) && span.start >= 0 && span.end > span.start && span.end <= text.length, `${label}/span ${i}: original emphasis offsets valid`);
      for (const name of ['color', 'highlight', 'shading']) if (span[name]) check(/^#[0-9A-F]{6}$/i.test(span[name]), `${label}/span ${i}: ${name} retains explicit source color`);
      stats.formattingSpans += 1; stats.colorSpans += Number(Boolean(span.color)); stats.highlightSpans += Number(Boolean(span.highlight));
    });
  }
  check(formatting.offsetUnit === 'utf16', 'formatting metadata uses the same UTF-16 offsets as source references');
  for (const [key, meta] of Object.entries(formatting.nodes)) {
    const section = sections.get(key);
    check(Boolean(section), `formatting/${key}: source section exists`);
    if (!section) continue;
    stats.formattingNodes += 1;
    if (meta.title) field(meta.title, section.title, `formatting/${key}/title`);
    for (const [index, blockMeta] of Object.entries(meta.blocks || {})) {
      const block = section.blocks?.[Number(index)];
      check(Boolean(block), `formatting/${key}/${index}: source block exists`);
      if (!block) continue;
      if ('text' in blockMeta) field(blockMeta, block.text, `formatting/${key}/${index}`);
      if (blockMeta.cells) {
        check(same(blockMeta.cells.map(row => row.length), (block.rows || []).map(row => row.length)), `formatting/${key}/${index}: complete source table shape`);
        blockMeta.cells.forEach((row, ri) => row.forEach((cell, ci) => field(cell, block.rows?.[ri]?.[ci], `formatting/${key}/${index}/${ri}/${ci}`)));
      }
    }
  }
}

function fixtures(build) {
  const paragraph = text => ({ kind: 'paragraph', text });
  function sample(name, blocks) {
    const node = freeze({ key: `fixture/${name}`, section: { title: name, blocks: blocks.map(block => typeof block === 'string' ? paragraph(block) : block) } });
    const model = build(node); validate(node, model, false); stats.fixtures += 1;
    return { node, model };
  }
  function classify(name, text, present, absent, uncertain = false) {
    const { model } = sample(name, [text]);
    const has = key => Boolean(model.closingGroups.find(group => group.key === key)?.items.length);
    present.forEach(key => check(has(key), `${name}: contains ${key}`));
    absent.forEach(key => check(!has(key), `${name}: does not infer ${key}`));
    if (uncertain) check(model.uncertainItems.length > 0, `${name}: unclear role remains explicitly uncertain`);
  }
  classify('copy-is-not-review', '客户身份证复印件作传票。', ['voucher'], ['review', 'supervisorSignature', 'customerSignature']);
  classify('authorization-is-not-signature', '主管授权，客户签字。', ['customerSignature'], ['supervisorSignature']);
  classify('supervisor-checks-customer-signature', '主管审核客户签字。', ['customerSignature'], ['supervisorSignature']);
  classify('customer-hands-to-supervisor', '客户将资料交主管签字。', ['supervisorSignature'], ['customerSignature']);
  classify('reviewer-delivery-signature', '需让复核人员将网银认证工具交予客户并在单据上签字注明时间', ['review'], ['customerSignature', 'supervisorSignature'], true);
  classify('explicit-supervisor-signature', '请主管在申请书上签字。', ['supervisorSignature'], ['customerSignature']);
  classify('explicit-customer-signature', '请客户在申请书上签字。', ['customerSignature'], ['supervisorSignature']);
  classify('customer-electronic-signature', '客户电子签名确认。', ['customerSignature'], ['supervisorSignature']);
  classify('customer-device-confirmation-signature', '客户通过柜外清确认业务办理结果无误后进行电子签名操作。', ['customerSignature'], ['supervisorSignature']);
  classify('legal-representative-signature', '法定代表人签字。', ['customerSignature'], ['supervisorSignature']);
  classify('ambiguous-double-sign', '双签后传复核。', ['review'], ['customerSignature', 'supervisorSignature'], true);
  classify('unspecified-sign-and-seal', '单据签章后留存。', [], ['customerSignature', 'supervisorSignature', 'customerSeal'], true);
  classify('customer-seal-explicit', '客户盖章后交柜台。', ['customerSeal'], ['supervisorSignature']);
  classify('seal-without-actor', '申请书加盖公章和法人章。', ['otherSeals'], ['customerSeal']);
  classify('bank-seal-not-customer', '加盖银行业务公章。', [], ['customerSeal']);
  classify('receipt-is-not-voucher', '打印回单交客户。', ['print', 'receipts'], ['voucher']);
  classify('archive-is-not-voucher', '单据放入客户档案。', ['receipts'], ['voucher']);
  const local = sample('local-operation-notes', ['一.客户环节', '审核材料：身份证原件。', '二.操作流程', '输入交易码。', '操作流程注意事项：', '不得漏录联系电话。', '①传票打印后核对。', '三.业务完结注意事项', '核对结果。']);
  for (const index of [3, 4, 5, 6]) check(local.model.sources[index].phaseKey === 'operate', `local-operation-notes: block ${index} stays with its operation`);
  check(local.model.operationNotes.some(ref => ref.sourceIndex === 5), 'local-operation-notes: warning remains indexed beside operation');
  const phases = sample('repeat-phases-preserve-order', ['一.客户环节', '材料甲。', '二.操作流程', '操作甲。', '一.客户环节', '材料乙。', '二.操作流程', '操作乙。']);
  check(phases.model.mode === 'source-order', 'repeat-phases-preserve-order: do not move second-case materials before first-case operation');
  const cases = sample('conditional-cases-preserve-order', ['一.预制卡开立', '满足条件甲时办理。', '二.操作流程', '只做甲操作。', '三.修改密码', '满足条件乙时办理。', '四.操作流程', '只做乙操作。']);
  check(cases.model.branches.length === 2 && cases.model.mode === 'source-order', 'conditional-cases-preserve-order: preserve separate source cases and ordering');
  check(same(cases.model.branches.map(branch => branch.sourceIndices), [[0, 1, 2, 3], [4, 5, 6, 7]]), 'conditional-cases-preserve-order: neither case loses its own condition or operation');
  const inline = sample('inline-cases-share-following-notes', ['二.操作流程', '新开户新开网银：按新开户条件办理。', '打印新开户凭证。', '存量变更操作员：按变更条件办理。', '打印变更凭证。', '存量客户办理换key业务：按换key条件办理。', '打印换key凭证。', '操作流程注意事项：', '所有适用情形均需复核。']);
  check(same(inline.model.branches.map(branch => branch.sourceIndices), [[1, 2], [3, 4], [5, 6]]), 'inline-cases-share-following-notes: alternatives end before shared notes');
  check(inline.model.operationNotes.some(ref => ref.sourceIndex === 8 && ref.branchSourceIndex == null), 'inline-cases-share-following-notes: common warning is not exclusive to last alternative');
  sample('utf16-tables-and-images', ['一.客户环节', '📄打印材料。\r\n客户签字。', { kind: 'table', rows: [['字段', '内容'], ['说明', '📎客户盖章。\n复核后留存。']] }, { kind: 'paragraph', text: '', images: ['original.png'] }]);
  sample('no-source-content', []);

  function transactions(name, text, expected) {
    const { model } = sample(name, [text]);
    check(same(model.transactionEntries.flatMap(entry => entry.codes), expected), `${name}: only explicitly grounded transaction codes are indexed`);
  }
  transactions('transaction-short-letter-code', 'H001开户，对公开户双录系统', ['H001']);
  transactions('transaction-igtb-code', '存量变更操作员：H0221-录入要素查询-提交主管授权', ['H0221']);
  transactions('transaction-parenthetical-operation', 'H00101(外币开户)', ['H00101']);
  transactions('transaction-numbered-list', '核心交易码：①1010;②8214105（集约）', ['1010', '8214105']);
  transactions('transaction-letter-and-numeric-list', '使用G04001/S001/8101100办理', ['G04001', 'S001', '8101100']);
  transactions('transaction-input-with-screen-context', '输入H00101进入交易界面。', ['H00101']);
  transactions('transaction-code-alongside-amount-account', '交易码1010，金额10000元，账号20260205', ['1010']);
  transactions('transaction-code-alongside-year', '交易码1010，年份2026，日期20260205', ['1010']);
  transactions('transaction-default-password', '默认密码000000', []);
  transactions('transaction-quoted-password', '密码为“123456”', []);
  transactions('transaction-hotline', '热线95566；联系电话12345678；热线12363；热线12378', []);
  transactions('transaction-amount', '金额10000元，限额50000元', []);
  transactions('transaction-account', '账号20260205，卡号12345678', []);
  transactions('transaction-year', '2026年办理，年份2026', []);
  transactions('transaction-unlabelled-numeric-input', '输入123456', []);
  transactions('transaction-unlabelled-letter-input', '输入H00101', []);
  transactions('transaction-codes-repeat-in-line', '交易码H001/H001/E52210', ['H001', 'E52210']);
  transactions('transaction-circled-change-and-semicolon-query', '④8201301变更客户层信息；8201200查询受益人信息变更。', ['8201301', '8201200']);
  transactions('transaction-parenthetical-review-alternative', '⑤E52002（E52005）复审账户信息变更：按实际需要办理。', ['E52002', 'E52005']);
  transactions('transaction-code-led-explicit-input-action', '⑥E52211输入相应信息，提交复审，向人行报备。', ['E52211']);
  transactions('transaction-code-led-query-action', '8201200查询受益人信息变更。', ['8201200']);
  transactions('transaction-account-layer-currency-continuation', '账户层信息变更：人民币E52002、E52005\n（外币：E52502、E52505）⑤', ['E52002', 'E52005', 'E52502', 'E52505']);
  transactions('transaction-account-change-excludes-noncode-fields', '客户层信息变更：8201301，默认密码000000，账号12345678，年份2026，日期20261001，金额10000元', ['8201301']);
  transactions('transaction-numeric-password-input-is-not-action', '④123456输入密码。', []);
  transactions('transaction-currency-without-operation-context', '人民币：E52002、E52005', []);
  transactions('transaction-account-change-excludes-hotline', '客户层信息变更：8201301；热线95566', ['8201301']);
  const repeat = sample('transaction-same-code-distinct-source', ['二.操作流程', '交易码H001开户。', '核对原文要求。', '交易码H001查询。']);
  check(same(repeat.model.transactionEntries.map(entry => [entry.sourceIndex, entry.codes]), [[1, ['H001']], [3, ['H001']]]), 'transaction-same-code-distinct-source: repeated code keeps each distinct source occurrence');
  const cellCode = sample('transaction-table-and-utf16-offset', [{ kind: 'table', rows: [['📄说明\n交易码H001开户。', '金额10000元']] }]);
  check(same(cellCode.model.transactionEntries.map(entry => [entry.field, entry.rowIndex, entry.cellIndex, entry.lineIndex, entry.start, entry.codes]), [['rows', 0, 0, 1, 5, ['H001']]]), 'transaction-table-and-utf16-offset: table code retains precise cell/line offset');

  // Prove the guards fail for corruption, rather than merely mirroring outputs.
  const pristine = sample('guard-self-check', ['一.客户环节', '客户签字。', '二.操作流程', '交易码H001打印回单。']);
  function rejects(name, mutate) {
    const model = build(pristine.node); mutate(model);
    const start = failures.length, beforeChecks = checkCount; validate(pristine.node, model, false);
    const caught = failures.length > start; failures.splice(start);
    checkCount = beforeChecks;
    check(caught, `mutation guard: detects ${name}`); stats.mutationGuards += 1;
  }
  rejects('omitted block', model => { model.phases[0].blocks.pop(); model.phases[0].sourceIndices.pop(); });
  rejects('duplicated block', model => { model.phases[0].blocks.push(model.phases[0].blocks[0]); model.phases[0].sourceIndices.push(0); });
  rejects('wrong block/index pairing', model => { model.phases[0].sourceIndices.reverse(); });
  rejects('invented excerpt', model => { model.closingGroups.find(group => group.key === 'customerSignature').items[0].text += '新增要求'; });
  rejects('wrong excerpt offset', model => { model.closingGroups.find(group => group.key === 'customerSignature').items[0].start += 1; });
  rejects('invented transaction code', model => { model.transactionEntries[0].codes.push('H99999'); });
  rejects('partial transaction code', model => { model.transactionEntries[0].codes[0] = 'H00'; });
  rejects('wrong transaction source position', model => { model.transactionEntries[0].sourceIndex = 1; });
}

function realTransactions(build, sections) {
  // Expectations were checked against these original source paragraphs, not
  // generated from the classifier. They lock key corporate operation contexts.
  const expected = [
    ['1-0-0-0', [[5, ['H001']], [6, ['E52210', 'E52005']]]],
    ['1-0-0-1', [[10, ['H00101']], [11, ['8201200']], [14, ['E52505']]]],
    ['1-2-0-0', [[10, ['H00101']], [12, ['H0221']], [15, ['H00221']]]],
    ['1-2-2-0', [[3, ['H00101']], [15, ['8203101']], [38, ['8203102']]]],
  ];
  expected.forEach(([key, entries]) => {
    const section = sections.get(key);
    check(Boolean(section), `${key}: real transaction regression section exists`);
    if (!section) return;
    const model = build({ key, section });
    check(same(model.transactionEntries.map(entry => [entry.sourceIndex, entry.codes]), entries), `${key}: real transaction codes keep exact original paragraph associations`);
    if (key === '1-0-0-0') check(model.cautions.some(ref => ref.sourceIndex === 8 && ref.text === section.blocks[8].text), `${key}: original opening risk paragraph stays visible as a source-linked caution`);
    if (key === '1-2-0-0') check(same(model.transactionEntries.map(entry => [entry.sourceIndex, entry.branchSourceIndex]), [[10, 10], [12, 12], [15, 15]]), `${key}: new-account/operator-change/key-replacement codes remain in their own conditions`);
    if (key === '1-2-2-0') check(!model.transactionEntries.some(entry => entry.codes.includes('000000')), `${key}: original settlement-card default password never becomes a transaction code`);
    stats.realTransactionRegressions += 1;
  });
  const changeKey = '1-0-2', changeSection = sections.get(changeKey);
  check(Boolean(changeSection), `${changeKey}: real corporate account-change section exists`);
  if (changeSection) {
    const model = build({ key: changeKey, section: changeSection });
    const expectedLines = [
      [5, 5, 195, 256, ['8201301', '8201200']],
      [5, 6, 257, 369, ['E52002', 'E52005']],
      [5, 7, 370, 395, ['E52211']],
      [8, 0, 0, 24, ['8201301', '8201200']],
      [9, 0, 0, 24, ['E52002', 'E52005']],
      [9, 1, 25, 44, ['E52502', 'E52505']],
    ];
    check(same(model.transactionEntries.map(entry => [entry.sourceIndex, entry.lineIndex, entry.start, entry.end, entry.codes]), expectedLines), `${changeKey}: all six original operation/currency lines retain their exact codes and offsets`);
    const conditional = model.transactionEntries.find(entry => entry.sourceIndex === 5 && entry.lineIndex === 6);
    check(conditional?.text === changeSection.blocks[5].text.split('\n')[6] && conditional.text.includes('按实际需要'), `${changeKey}: review alternatives retain the complete original qualifying condition`);
    const foreignCurrency = model.transactionEntries.find(entry => entry.sourceIndex === 9 && entry.lineIndex === 1);
    check(foreignCurrency?.text === '（外币：E52502、E52505）⑤', `${changeKey}: foreign-currency condition stays attached to its own original codes`);
    stats.realTransactionRegressions += 1;
  }
}

try {
  const target = fs.realpathSync(args());
  const context = vm.createContext({ window: {} });
  const source = fs.readFileSync(path.join(target, 'employee-handbook.js'));
  const sourceHash = crypto.createHash('sha256').update(source).digest('hex');
  load(path.join(target, 'employee-handbook.js'), context);
  load(path.join(target, 'employee-handbook-formatting.js'), context);
  const handbook = freeze(context.window.EMPLOYEE_HANDBOOK);
  const formatting = freeze(context.window.EMPLOYEE_HANDBOOK_FORMATTING);
  const before = JSON.stringify({ handbook, formatting });
  load(path.join(target, 'workflow-guide.js'), context);
  const build = context.window.HandbookWorkflow?.build;
  if (typeof build !== 'function') throw new Error('workflow-guide.js must expose window.HandbookWorkflow.build(node)');
  check(sourceHash === ORIGINAL_SHA256, 'handbook bytes equal the original 2026-02-05 source snapshot');
  check(formatting.sourceDataSha256 === sourceHash && formatting.handbookVersion === handbook.version, 'formatting is associated with this exact source/version');
  const { sections, businesses } = collect(handbook);
  check(businesses.length === 81, 'original 81 business sections remain present');
  for (const node of businesses) validate(node, build(node));
  stats.uniqueImages = new Set(businesses.flatMap(node => node.section.blocks.flatMap(block => block.images || []))).size;
  verifyFormatting(formatting, sections);
  fixtures(build);
  realTransactions(build, sections);
  check(before === JSON.stringify({ handbook, formatting }), 'real source data and formatting remain unchanged after all builds');
  console.log(JSON.stringify({ verdict: failures.length ? 'FAIL' : 'PASS', target, sourceSha256: sourceHash,
    checks: checkCount, failures, stats,
    scope: 'Frozen original source and format metadata; actual workflow module; source provenance, one-time body coverage, ordering, and semantic negative fixtures. No browser/CSS/DOM validation; no independent DOCX extraction validation.' }, null, 2));
  process.exitCode = failures.length ? 1 : 0;
} catch (error) {
  console.error(error.stack || String(error));
  process.exitCode = 2;
}
