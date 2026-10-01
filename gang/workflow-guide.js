/* Source-linked reading guide. This module does not establish business rules or
   turn alternative cases into a transaction sequence. It never edits a block.
   All indices are zero-based. start/end are UTF-16 offsets into block.text (or
   the indicated table cell); end is exclusive. References retain complete lines.
   Closing groups are an index of mentions THROUGHOUT the source, not instructions
   to defer those actions until closing. Missing means “原文未注明”, not “无需办理”. */
(function (root) {
  "use strict";

  const PHASES = ["prepare", "operate", "review", "archive"];
  const GROUPS = [
    ["print", "打印"], ["voucher", "传票"], ["receipts", "回单 / 档案"], ["review", "复审 / 复核"],
    ["supervisorSignature", "主管签字"], ["customerSignature", "客户签字"],
    ["customerSeal", "客户盖章"], ["otherSeals", "其他签章要求 · 原文未注明人员"]
  ];
  const MAIN_NUMBER = /^([一二三四五六七八九十]+)\s*[.、．,，]\s*/;
  const MINOR_NUMBER = /^(?:\d+[.、．]\s*|[（(]\d+[）)]\s*|[①②③④⑤⑥⑦⑧⑨⑩]\s*[、.．]?\s*)/;
  const NOTE_TITLE = /^(?:客户环节|操作环节|操作流程|开户过程)?(?:注意事项|风险提示|风险点|要点提示)(?:[：:]|$)/;
  const PREP_LABEL = /^(?:审核材料|所需材料|所需资料|企业所需材料|填写单据|需填写凭证|提交资料|客户需提供)(?:[：:]|$)/;
  const PRECONDITION = /开户前|办理前|开卡前|签约前|交易前|需先|必须先|前提|才能|方可/;

  function firstLine(block) {
    return String(block && block.text || "").split(/\r?\n/, 1)[0].trim();
  }

  function heading(block) {
    const line = firstLine(block);
    if (!line || block.kind === "table") return null;
    const numbered = MAIN_NUMBER.test(line);
    const label = line.replace(MAIN_NUMBER, "").trim();
    // These are local notes, even when numbered; they never change a phase.
    if (NOTE_TITLE.test(label)) return null;
    // Only a whole, explicit heading matches. Numbered material headings may
    // carry their material text after a colon, which is retained in the block.
    if (/^(?:客户环节|所需材料|所需资料|审核材料|审核填写材料|审核客户所提供基础材料|基础材料|填写单据|提交资料|客户需提供)[：:]?$/.test(label) ||
        (numbered && /^(?:所需材料|所需资料|审核填写材料|审核客户所提供基础材料)[：:]/.test(label))) {
      return { key: "prepare", label: line, numbered, kind: "heading" };
    }
    if (/^(?:操作流程|系统操作|核心操作|核心系统环节|处理流程|核心交易|核心交易码|集约交易)[：:]?$/.test(label)) {
      return { key: "operate", label: line, numbered, kind: "heading" };
    }
    if (/^(?:业务完结|业务完完结|业务结束|业务办结)(?:注意事项|核对)?(?:[：:].*)?$/.test(label) ||
        /^(?:办结核对|完成后核对)[：:]?$/.test(label)) {
      return { key: "review", label: line, numbered, kind: "heading" };
    }
    if (/^(?:资料留存|归档|单据归档|传票归档|传票整理|单据去向)[：:]?$/.test(label) ||
        (numbered && label === "传票打印客户签字+盖章")) {
      return { key: "archive", label: line, numbered, kind: "heading" };
    }
    return null;
  }

  function linesOf(block, sourceIndex) {
    const result = [];
    function addLines(value, field, rowIndex, cellIndex) {
      if (typeof value !== "string") return;
      let offset = 0;
      value.split("\n").forEach((text, lineIndex) => {
        if (text.trim()) result.push({
          text, sourceIndex, lineIndex, start: offset, end: offset + text.length,
          field, ...(field === "rows" ? { rowIndex, cellIndex } : {})
        });
        offset += text.length + 1;
      });
    }
    addLines(block && block.text, "text");
    (block && block.rows || []).forEach((row, ri) => row.forEach((cell, ci) => addLines(cell, "rows", ri, ci)));
    return result;
  }

  function noteTitle(block) {
    return NOTE_TITLE.test(firstLine(block).replace(MAIN_NUMBER, "").trim());
  }

  function materialStart(block) {
    const line = firstLine(block).replace(MAIN_NUMBER, "").replace(MINOR_NUMBER, "").trim();
    return PREP_LABEL.test(line) || /^(?:核准类、报备类需要的材料)[：:]/.test(line) || /^结构性存款(?:签约|认购)审核材料/.test(line);
  }

  function operationStart(block) {
    const line = firstLine(block).replace(MAIN_NUMBER, "").replace(MINOR_NUMBER, "").trim();
    return /^(?:操作流程|系统操作|核心操作|核心交易(?:码)?|核心交易操作界面截图?|入口交易|交易码)[：:]?/.test(line) && !/注意事项/.test(line);
  }

  function unknownMainHeading(block) {
    const line = firstLine(block);
    if (!MAIN_NUMBER.test(line) || heading(block) || noteTitle(block)) return false;
    const label = line.replace(MAIN_NUMBER, "");
    // Long numbered rules are prose, not evidence for a new case. These two
    // source labels are headings despite their attached material text.
    if (/^结构性存款(?:签约|认购)审核材料/.test(label)) return true;
    if (label.length > 48 || /[；;。]/.test(label)) return false;
    if (/^(?:相关附件|相关文件|文件依据|审核要点|要点提示|办理人员尽职调查要求|.*常见Q)/.test(label)) return false;
    return /(?:开立|开户|预制卡|修改密码|清机|长短款|记账|询证函|资信证明)/.test(label);
  }

  function branchReferences(blocks) {
    const explicit = [];
    blocks.forEach((block, sourceIndex) => {
      const line = firstLine(block);
      if (unknownMainHeading(block) || /^(?:新开户新开网银|存量变更操作员|存量客户办理换key业务)[：:]/i.test(line)) {
        const ref = linesOf(block, sourceIndex).find(item => item.field === "text" && item.lineIndex === 0);
        if (ref) explicit.push({ ...ref, title: ref.text, kind: unknownMainHeading(block) ? "source-case" : "inline-case", sequence: "not-inferred" });
      }
    });
    return explicit;
  }

  function classify(blocks, branches) {
    const headings = blocks.map(heading);
    const majorCases = branches.filter(ref => MAIN_NUMBER.test(ref.text));
    const relevant = headings.filter(Boolean);
    let fallback = null;
    if (majorCases.length > 1) {
      fallback = { code: "multiple-source-cases", notice: "原文包含不同办理情形，正文按原顺序保留；请先确认适用情形，不要把各情形当成连续步骤。" };
    } else if (!relevant.some(item => item.key === "operate")) {
      fallback = { code: "no-explicit-phase-headings", notice: "原文未明确划分办理环节，正文按原顺序保留；材料、注意事项及单据索引均引用原文，不据此推定办理先后。" };
    }
    let active = relevant.length && relevant[0].key === "operate" && headings.findIndex(Boolean) === 0 ? 1 : 0;
    const tentative = blocks.map((block, sourceIndex) => {
      const hit = headings[sourceIndex];
      if (hit) {
        const next = PHASES.indexOf(hit.key);
        // An unnumbered material label inside an operation remains local to it.
        // A fresh 客户环节 or numbered prepare heading indicates a new flow.
        const isLocalMaterial = next === 0 && active > 0 && !hit.numbered && !/^客户环节/.test(hit.label);
        if (!isLocalMaterial) {
          if (next < active && !fallback) fallback = {
            code: "repeated-or-out-of-order-phases",
            notice: "原文中办理环节重复或交错，正文按原顺序保留，避免把不同流程的材料、操作和注意事项拆开。"
          };
          active = next;
        }
      }
      return PHASES[active];
    });
    return { headings, tentative, keys: fallback ? blocks.map(() => "operate") : tentative, fallback };
  }

  function explicitActorAction(text, actors, action) {
    const actor = new RegExp(actors, "g");
    let match;
    while ((match = actor.exec(text))) {
      // In “交予客户并在单据上签字”, 客户 is the recipient, not the actor.
      if (/(?:交予|交给|交于|递交|交到|交至)$/.test(text.slice(0, match.index))) continue;
      const tail = text.slice(actor.lastIndex);
      const qualifiers = "(?:(?:本人|需|须|应|要|必须|亲自|亲笔|手工|当场|现场|通过柜外清确认业务办理结果无误后|确认后|核对后|确认处|确认|核对|并|再次|再|进行|电子|已|柜外清/回单|柜外清|回单)|(?:在|于)[^，,。；;签]{1,12}(?:上|处))*";
      if (new RegExp("^" + qualifiers + "(?:" + action + ")").test(tail)) return true;
    }
    return false;
  }

  function classifyClosing(text) {
    const groups = [];
    if (/打印|屏打|补打/.test(text)) groups.push("print");
    if (/传票/.test(text)) groups.push("voucher");
    if (/回单|输出凭证|跟档案|归档|资料留存|档案/.test(text)) groups.push("receipts");
    // 复印 is deliberately absent. 审核 is not automatically a second review.
    if (/复审|复核|复查|双人核对|双人验印|双人签章|审核材料无遗落|审核材料无遗漏/.test(text)) groups.push("review");
    // A supervisor's authorization and a customer's signature are separate acts.
    // Do not infer the actor of 签章 / 双签 / 签字 from another clause.
    if (explicitActorAction(text, "(?:运营主管|业务主管|主管|柜台经理)", "签字|签名")) groups.push("supervisorSignature");
    if (explicitActorAction(text, "(?:客户|法定代表人|法人|指定持卡人)", "签字|签名")) groups.push("customerSignature");
    const customerSeal = explicitActorAction(text, "客户", "盖章|签字\\s*(?:[+、及和]|并)?\\s*盖章|(?:加盖|盖)(?:公章|法人章|预留印鉴(?:章)?|银行预留印章)");
    if (customerSeal) groups.push("customerSeal");
    if (/公章|法人章|财务章|骑缝章|私章|印章|预留印鉴|签章|盖章|验印|双签|用印/.test(text) && !customerSeal) groups.push("otherSeals");
    return groups;
  }

  // A deliberately limited entry index. Numeric-looking text is not enough:
  // require an explicit transaction label, a direct operation verb, or a
  // code-led operation name. Retain each occurrence's own case and conditions.
  function transactionCodes(text, blockHead) {
    const value = String(text || "");
    // Some original procedures use short core codes (e.g. 490 / 500, 10 / 45).
    // Accept them only when an explicit label or a tightly recognized code-led
    // operation makes their meaning clear; bare dates, amounts and numbered prose stay out.
    const candidates = /(?<![A-Za-z0-9])(?:[A-Za-z]\d{3,8}|\d{2,8})(?![A-Za-z0-9])/g;
    const head = value.trim().replace(MAIN_NUMBER, "").replace(MINOR_NUMBER, "");
    const accountAction = /^(?:客户层|账户层)信息(?:变更|维护|查询)[：:]/;
    const accountLine = accountAction.test(head) || accountAction.test(String(blockHead || "")) && /^[（(]?(?:人民币|外币)[：:]/.test(head);
    const labelled = /^(?:核心)?(?:交易码|交易代码|交易入口|入口交易|系统交易)(?:[：:\s]|[A-Za-z0-9])/.test(head);
    const found = [];
    let match, previousEnd = -1;
    while ((match = candidates.exec(value))) {
      const code = match[0], before = value.slice(0, match.index), after = value.slice(candidates.lastIndex);
      const clauseLead = before.split(/[，,。；;\n]/).pop();
      const nonTransactionField = /(?:默认密码|密码|账号|帐号|账户(?:号码)?|卡号|手机号|证件号|日期|年份|金额|限额|联系电话|热线|序列号|编号)[：:\s为是须应需设定输入“"（(]*$/.test(clauseLead);
      if (/^(?:0+|95566|12363|12378)$/.test(code) || nonTransactionField ||
          /^\s*(?:元|万元|美元|港币|欧元|日元|人民币|美金|年|月|日|%|％)/.test(after) ||
          /^(?:19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])$/.test(code)) continue;
      const directLabel = /(?:交易码|交易代码|入口交易|系统交易|代码|输入代码|(?:客户层|账户层)信息(?:变更|维护|查询))[：:\s“"（(]*[①②③④⑤⑥⑦⑧⑨⑩]?\s*$/.test(before);
      const directCase = /^(?:新开户新开网银|存量变更操作员|存量客户办理换key业务)[：:\s“"]*$/i.test(before.trim());
      const verb = /(?:使用|进入|执行|发起|通过|选择|登录|联动)(?:核心)?[：:\s“"（(]*$/.test(before);
      const inputTransaction = /输入[：:\s“"（(]*$/.test(before) && /^[”"）)\s]*(?:进入)?交易(?:画面|界面)/.test(after);
      // A semicolon can begin another code-led action in the same source line.
      // Circled source numbering is presentation, not part of the code.
      const leading = !clauseLead.trim().replace(MAIN_NUMBER, "").replace(MINOR_NUMBER, "").replace(/^[（(]\s*$/, "");
      // In E52002（E52005）复审…, the parenthesized alternative shares the
      // explicit action; retain both codes in this one original-line reference.
      const operationTail = after
        .replace(/^\s*[（(]\s*[A-Za-z]?\d{2,8}(?:\s*[/、,，]\s*[A-Za-z]?\d{2,8})*\s*[）)]/, "")
        .replace(/^\s*[/、,，]\s*[A-Za-z]?\d{2,8}(?:\s*[/、,，]\s*[A-Za-z]?\d{2,8})*/, "");
      const operationName = /^[\s“”"（(—\-→]*(?:外币|人民币|单位|个人|对公|对私)?(?:开户|开立|查询|维护|办理|客户|综合查询|综合收费|回单|打印|核心|交易|挂失|解挂|重置|销户|停用|合并|补录|同步|更新|变更|复审|修改|撤销|解除|激活|企业网银)/.test(operationTail) ||
        /^[\s“”"（(—\-→]*(?:有折现金存款|无折现金存款|有折转账|无折转账|支持(?:一次性)?(?:打印|查询)|(?:集约)?发起|点击创建客户)/.test(operationTail) ||
        /^[A-Za-z]/.test(code) && /^[\s“”"（(—\-→]*输入(?:相应|相关|交易|账户|客户)/.test(operationTail);
      const sameCodeList = previousEnd >= 0 && /^[\s/、，,;；()（）①②③④⑤⑥⑦⑧⑨⑩]*$/.test(value.slice(previousEnd, match.index));
      const explicitShortCode = code.length <= 3 && (directLabel || /^(?:有折|无折)(?:现金存款|转账)/.test(after));
      const codeLedOperation = /^\s*(?:有折现金存款|无折现金存款|有折转账|无折转账|支持(?:一次性)?(?:打印|查询))/.test(operationTail);
      const leadingCodeList = leading && /^(?:[；;,，]\s*[②③④⑤⑥⑦⑧⑨⑩]?\s*[A-Za-z]?\d{2,8})/.test(after);
      if (!(accountLine || labelled && (leading || sameCodeList) || directLabel || directCase || verb || inputTransaction || explicitShortCode || codeLedOperation || leadingCodeList || leading && operationName || sameCodeList)) continue;
      if (!found.includes(code)) found.push(code);
      previousEnd = candidates.lastIndex;
    }
    return found;
  }

  function build(node) {
    const blocks = node && node.section && Array.isArray(node.section.blocks) ? node.section.blocks : [];
    const branches = branchReferences(blocks);
    const model = classify(blocks, branches);
    const sources = blocks.map((block, sourceIndex) => ({ sourceIndex, block, phaseKey: model.keys[sourceIndex] }));
    const phases = PHASES.map(key => ({
      key, blocks: [], sourceIndices: [], headingSourceIndices: [], status: "not-stated", notice: "原文未单列本环节。"
    }));
    sources.forEach(source => {
      const phase = phases[PHASES.indexOf(source.phaseKey)];
      phase.blocks.push(source.block);
      phase.sourceIndices.push(source.sourceIndex);
      if (model.headings[source.sourceIndex]) phase.headingSourceIndices.push(source.sourceIndex);
      phase.status = model.fallback ? "source-order" : "source-heading";
      phase.notice = model.fallback ? model.fallback.notice : "按原文标题分组，组内保持原顺序。";
    });

    const closingGroups = GROUPS.map(([key, label]) => ({ key, label, items: [], status: "not-stated", notice: "原文未注明" }));
    const beforeNotes = [], operationNotes = [], cautions = [], uncertainItems = [], transactionEntries = [];
    let context = "", contextSourceIndex = null, materialScope = false, noteScope = false, operationScope = false;
    let branchTitle = "", branchSourceIndex = null;
    blocks.forEach((block, sourceIndex) => {
      const major = model.headings[sourceIndex];
      const line = firstLine(block);
      const isCase = branches.some(ref => ref.sourceIndex === sourceIndex);
      if (major || isCase) {
        context = line;
        contextSourceIndex = sourceIndex;
        materialScope = major && major.key === "prepare";
        noteScope = false;
        operationScope = Boolean(major && major.key === "operate");
      }
      if (isCase) { branchTitle = line; branchSourceIndex = sourceIndex; }
      if (operationStart(block)) { materialScope = false; noteScope = false; operationScope = true; }
      if (/查询/.test(line) && !/材料|证件|原件|复印件|证明|申请|凭证/.test(line) && !noteTitle(block)) materialScope = false;
      if (materialStart(block)) materialScope = true;
      if (noteTitle(block)) {
        noteScope = true; context = line; contextSourceIndex = sourceIndex;
        // Notes following inline alternatives are not declared exclusive to the
        // last alternative. Keep them shared unless the source says otherwise.
        if (branches.some(ref => ref.sourceIndex === branchSourceIndex && ref.kind === "inline-case")) {
          branchTitle = ""; branchSourceIndex = null;
        }
      }
      // A standalone caption / image never terminates a note; source text does.
      const phaseKey = model.keys[sourceIndex];
      const tentativeKey = model.tentative[sourceIndex];
      const refs = linesOf(block, sourceIndex).map(ref => ({
        ...ref, phaseKey, context, contextSourceIndex, branchTitle, branchSourceIndex,
        timing: PRECONDITION.test(ref.text) ? "explicit-before" : "see-source-context"
      }));
      for (const ref of refs) {
        const codes = transactionCodes(ref.text, line);
        if (codes.length) transactionEntries.push({ ...ref, codes });
        const pureTitle = ref.lineIndex === 0 && ref.field === "text" &&
          (major && /^[^：:]*[：:]?$/.test(ref.text) && !/打印|签字|签名|盖章/.test(ref.text) || noteTitle(block) && /^[^：:]*[：:]?$/.test(ref.text));
        if (pureTitle) continue;
        const materialLine = materialScope || materialStart(block);
        if (tentativeKey === "prepare" && !model.fallback || materialLine || PRECONDITION.test(ref.text)) beforeNotes.push(ref);
        if (noteScope) {
          cautions.push(ref);
          if (tentativeKey === "operate" || operationScope) operationNotes.push(ref);
          if (tentativeKey === "prepare" && !model.fallback && !beforeNotes.includes(ref)) beforeNotes.push(ref);
        }
        const groups = classifyClosing(ref.text);
        groups.forEach(key => closingGroups.find(group => group.key === key).items.push(ref));
        if (/签章|双签|签字|签名|盖章|用印|验印/.test(ref.text) &&
            (/签章|双签/.test(ref.text) || !groups.some(key => ["supervisorSignature", "customerSignature", "customerSeal"].includes(key)))) {
          uncertainItems.push({ ...ref, reason: "原句涉及签署、印章或核验；未明确的执行人、动作及时间须结合原文核对，不补作主管或客户签字要求。" });
        }
      }
    });
    closingGroups.forEach(group => {
      if (group.items.length) { group.status = "source-mentions"; group.notice = "以下为原文相关句，办理时间和执行人以原句为准，不统一延后至收尾。"; }
    });
    branches.forEach((branch, index) => {
      let end = branches[index + 1] ? branches[index + 1].sourceIndex : blocks.length;
      if (branch.kind === "inline-case") {
        const notesAt = blocks.findIndex((block, i) => i > branch.sourceIndex && i < end && noteTitle(block));
        if (notesAt >= 0) end = notesAt;
      }
      branch.sourceIndices = sources.slice(branch.sourceIndex, end).map(source => source.sourceIndex);
    });
    return {
      version: 1, sources, phases, closingGroups, beforeNotes, operationNotes, cautions, uncertainItems, branches, transactionEntries,
      transactionNotice: "仅收录原文有明确交易或操作上下文的编号；不是完整交易清单，按原句及适用情形办理。",
      fallback: model.fallback, mode: model.fallback ? "source-order" : "source-headings",
      notice: "本指南只整理原文，不新增业务规则；条件分支按适用情形办理。原文未注明不代表无需办理。"
    };
  }

  root.HandbookWorkflow = Object.freeze({ build });
})(typeof window !== "undefined" ? window : globalThis);
