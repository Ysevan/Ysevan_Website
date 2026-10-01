/* ===========================================================================
   岗岗 · 三期搜索模块（预研版）
   ---------------------------------------------------------------------------
   纯函数模块：不碰 DOM、不读写全局、不依赖 app.js 的任何内部变量。
   唯一的输入契约是 collectNodes 产出的节点形态：

     { section: { title, blocks: [{ kind, text?, rows?, images?, shape? }, ...] },
       path:    ["常见对私业务", "2.账户管理", "2.1个人信息（…）", "2.1.1开客户号"],
       key:     "0-1-2-3",        // 结构下标链，首段即分类下标
       categoryIndex?: 0,          // app.js 的 allNodes 会补
       categoryTitle?: "常见对私业务" }   // phase1/lib.js 的 allNodes 会补

   categoryTitle 不存在时回退 path[0]；categoryIndex 不存在时取 key 的首段。
   两条回退让本模块对 app.js / lib.js 两种 allNodes 都成立。

   对外接口：
     buildIndex(nodes, options?)          -> index          （可选的预处理）
     search(indexOrNodes, query, options?) -> 结果对象        （nodes 直接传入则内部临时建索引）
     extractCodes(text)                    -> ["G04002", ...] （交易码提取，带字母前缀）
     STAGES / SCORE / DEFAULTS             -> 常量，便于调用方渲染与调参

   结果对象形态：
     { query, normalized, total,
       groups: [ { category, categoryIndex, count, topScore, results: [ {
           key, title, path, pathText, category, categoryIndex,
           score, codeExact, matchedCode, codes, codeCount, titleHit, pathHit, occurrences,
           snippets: [ { text, matchStart, matchEnd, sourceStage, sourceStageLabel,
                         sourceKind, truncatedHead, truncatedTail } ] } ] } ],
       suggestions: [ { key, title, path, category, similarity, reason } ] }

   suggestions 只在「查询非空但零结果」时非空，其余情况一律 []。
   =========================================================================== */

(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module === "object" && module && module.exports) module.exports = api;
  else root.HandbookSearch = api; // 浏览器下只挂这一个名字，不改动别的全局
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  /* ================= 常量 ================= */

  /* 四个环节：与 app.js 的 STAGES 同序同 key，snippets.sourceStage 就用这里的 key。 */
  var STAGES = [
    { key: "prepare", label: "办前准备" },
    { key: "operate", label: "办理操作" },
    { key: "review", label: "办结核对" },
    { key: "archive", label: "单据去向" }
  ];
  var STAGE_LABEL = STAGES.reduce(function (all, stage) { all[stage.key] = stage.label; return all; }, { title: "业务标题" });

  /* 评分权重。三档之间留出量级差，保证：
       交易码精确 > 标题命中 > 路径命中 > 正文出现次数累加
     全库正文共 7.2 万字，单业务最长 8319 字，单查询词的出现次数上限远小于 20000，
     因此 PATH=20000 已足以让「路径命中」永远压过纯正文堆量，不必再对次数封顶。 */
  var SCORE = {
    CODE_EXACT: 10000000, // 交易码精确匹配：绝对置顶
    TITLE: 100000,        // 业务标题命中
    PATH: 20000,          // 上级路径（分类/分组标题）命中
    OCCURRENCE: 1         // 正文每出现一次 +1
  };

  var DEFAULTS = {
    contextRadius: 30, // 片段取命中位置前后各 30 字
    maxSnippets: 3,    // 每条结果最多 3 个片段
    maxSuggestions: 3  // 无结果时给 3 条相近业务
  };

  /* ---- 交易码：完整保留字母前缀，剔除客服热线与金额 ----
     正则口径来自 phase1/codes-sample30-annotated.txt 的修正结论：
       旧 /(?<!\d)\d{5,8}(?!\d)/g 只挡相邻数字，会把 G04002 截成 04002（全库 114 处）；
       改为两侧都挡字母数字，并允许一个可选字母前缀。 */
  var CODE_PATTERN = "(?<![0-9A-Za-z])([A-Za-z]?\\d{5,8})(?![0-9A-Za-z])";
  /* 「查询串整体是不是一个完整的码」用这条：可选字母前缀 + 5~8 位数字，首尾无余物。
     "8101"（前缀）、"G04002查询"（带尾巴）都不算，不会被误顶到最上面。 */
  var CODE_WHOLE = /^[A-Za-z]?\d{5,8}$/;
  var CODE_HOTLINE = /^(?:95566|4006695566|12363|12378)$/;
  var CODE_MONEY = /^\s*(?:美元|元|万|港币|欧元|日元|人民币|美金)/;

  /* ================= 小工具（全部无副作用） ================= */

  var toStr = function (value) { return value === null || value === undefined ? "" : String(value); };

  /* 等长小写折叠：片段下标要能切回原串，所以绝不允许小写后长度变化。
     绝大多数字符走快路径；只有 U+0130 这类小写会变两个码元的字符才逐字回退。 */
  function foldCase(value) {
    var source = toStr(value);
    var lower = source.toLowerCase();
    if (lower.length === source.length) return lower;
    var out = "";
    for (var i = 0; i < source.length; i += 1) {
      var one = source.charAt(i).toLowerCase();
      out += one.length === 1 ? one : source.charAt(i);
    }
    return out;
  }

  /* 查询串归一：去首尾空白（含全角空格），中间连续空白压成一个半角空格。
     只做这一步——不做同义词、不做分词，保证「切片即命中词」这条契约成立。 */
  function normalizeQuery(query) {
    return toStr(query).replace(/[\s　 ]+/g, " ").trim();
  }

  /* 交易码比较用形态：全角字母数字转半角 + 转大写。
     只作用于「码是否相等」的判断，正文子串匹配仍用原查询串，不影响下标。 */
  function toCodeForm(value) {
    return toStr(value).replace(/[０-９Ａ-Ｚａ-ｚ]/g, function (ch) {
      return String.fromCharCode(ch.charCodeAt(0) - 0xfee0);
    }).toUpperCase();
  }

  function isCode(code, after) {
    return !CODE_HOTLINE.test(code) && !CODE_MONEY.test(toStr(after));
  }

  /* 从任意文本里抽出交易码（保序、可重复，去重交给调用方）。 */
  function extractCodes(text) {
    var source = toStr(text);
    if (!source) return [];
    var pattern = new RegExp(CODE_PATTERN, "g");
    var found = [];
    var matched = pattern.exec(source);
    while (matched) {
      if (isCode(matched[1], source.slice(matched.index + matched[0].length))) found.push(matched[1]);
      matched = pattern.exec(source);
    }
    return found;
  }

  /* 展示层标题清洗：与 app.js 的 cleanTitle 同口径（剥编号前缀与 Word 编辑批注尾巴）。
     调用方可以用 options.cleanTitle 覆盖，避免两处口径漂移。 */
  var editorialTail = /\s*(?:此模块[^，。；]{0,24}，|无此类业务，)?建议删除[。．.]?\s*[（(]\s*建议[^）)]{0,24}[）)]\s*$/;
  function defaultCleanTitle(value) {
    return toStr(value)
      .replace(/^\s*\d+(?:\.\d+)*[.、．]?\s*/, "")
      .replace(/^\s*[一二三四五六七八九十]+[.、．]\s*/, "")
      .replace(editorialTail, "")
      .trim() || "未命名业务";
  }

  /* ---- 环节归属：与 app.js 的 stageFor / flowFor 同口径 ----
     片段要标出「这句话出自哪一步」，所以必须自带一份判定，不去 import app.js。
     调用方若担心口径漂移，可用 options.stageOf(block, node) 直接注入 app.js 的判定。 */
  var stageLabels = "审核材料|所需材料|所需资料|填写单据|填单图样|客户环节|客户需提供|提交资料|审核填写材料|基础材料|操作流程|系统操作|核心交易|核心操作|核心系统环节|处理流程|集约交易|发起业务|注意事项|业务完结|业务完完结|业务结束|审核要点|要点提示|常见Q|风险提示|相关附件|尽职调查|相关文件|文件依据|操作提示|资料留存|归档|传票|回单";
  var headingLead = new RegExp("^(?:[一二三四五六七八九十]+\\s*[.、．,，]|[①②③④⑤⑥⑦⑧⑨⑩]\\s*[、.．]?|[.、．]?(?:" + stageLabels + "))");
  var stageLabelRe = new RegExp("(?:" + stageLabels + ")");
  var bracketLead = /^[（(][一二三四五六七八九十]+[）)]/;

  function isStageHeading(text) {
    if (headingLead.test(text)) return true;
    if (text.length > 30) return false;
    return bracketLead.test(text) || (/[：:]$/.test(text) && stageLabelRe.test(text));
  }

  function blockText(block) {
    var text = toStr(block && block.text).trim();
    if (text) return text;
    var rows = (block && block.rows) || [];
    return rows.map(function (row) { return (row || []).join(" "); }).join(" ");
  }

  function stageKeyOf(block) {
    var text = blockText(block).replace(/\s+/g, " ").trim();
    if (!isStageHeading(text)) return "";
    if (/客户环节|审核材料|所需材料|所需资料|填写单据|填单图样|基础材料|客户需提供|提交资料|审核填写材料/.test(text)) return "prepare";
    if (/注意事项|审核要点|要点提示|常见Q|风险提示|相关附件|尽职调查|相关文件|文件依据|操作提示/.test(text)) return "review";
    if (/操作流程|系统操作|核心交易|核心操作|核心系统环节|处理流程|集约交易|发起业务|交易码|流程/.test(text)) return "operate";
    if (/资料留存|归档|传票|回单/.test(text)) return "archive";
    return "";
  }

  /* ---- 行拆分：片段绝不跨行拼接 ----
     一个 block 可能是多行浮动文本框（全库 196 个块含换行），也可能是表格。
     段落块按 \n 拆行；表格按「一行一条」拆，单元格用空格连接（与 app.js 的 textFor 同形）。
     每行都单独作为片段的取材单位，因此片段永远落在原文的同一行内。 */
  function linesOfBlock(block) {
    var text = toStr(block && block.text);
    if (text.trim()) {
      return text.split("\n").map(function (line) { return { text: line.trim(), kind: "text" }; })
        .filter(function (line) { return line.text; });
    }
    /* 表格行拼出来的片段读起来不像句子（“手工比对 录入信息 居民身份证 长度18位…”），
       所以单独标 kind:"table"，渲染层可以加一个「表格」角标而不是当正文展示。 */
    var rows = (block && block.rows) || [];
    return rows.map(function (row) { return { text: (row || []).join(" ").replace(/\s+/g, " ").trim(), kind: "table" }; })
      .filter(function (line) { return line.text; });
  }

  /* ================= 建索引 ================= */

  function categoryOf(node) {
    var title = toStr(node && node.categoryTitle).trim();
    if (title) return title;
    var path = (node && node.path) || [];
    return toStr(path[0]).trim() || "未分类";
  }

  function categoryIndexOf(node) {
    if (node && typeof node.categoryIndex === "number" && isFinite(node.categoryIndex)) return node.categoryIndex;
    var head = toStr(node && node.key).split("-")[0]; // key 的首段就是分类下标
    var parsed = parseInt(head, 10);
    return isFinite(parsed) ? parsed : 0;
  }

  /* 字符 bigram：用于「无结果时的相近业务推荐」。
     长度 <2 的串退化为单字集合，保证一个字的查询也算得出重合度。 */
  function bigramsOf(value) {
    var source = toStr(value).replace(/\s+/g, "");
    if (!source) return [];
    if (source.length < 2) return [source];
    var out = [];
    for (var i = 0; i + 1 < source.length; i += 1) out.push(source.substr(i, 2));
    return out;
  }

  function entryOf(node, options) {
    var clean = options.cleanTitle;
    var rawTitle = toStr(node && node.section && node.section.title);
    var title = clean(rawTitle);
    var path = ((node && node.path) || []).map(clean);
    var pathText = path.join(" › ");
    var blocks = (node && node.section && node.section.blocks) || [];

    /* 环节归属沿用 app.js 的推进方式：只有小节标题会切换环节，正文一律跟随当前环节。 */
    var active = "prepare";
    var lines = [];
    var codeSource = [rawTitle];
    blocks.forEach(function (block) {
      var key = options.stageOf(block, node);
      if (key) active = key;
      var stage = active;
      var raw = blockText(block);
      if (raw) codeSource.push(raw);
      linesOfBlock(block).forEach(function (line) {
        lines.push({ text: line.text, lower: foldCase(line.text), stage: stage, kind: line.kind });
      });
    });

    /* 交易码集合：标题 + 全部正文，去重后按大写形态存放，供「精确相等」判定用。 */
    var codes = [];
    var seen = Object.create(null);
    extractCodes(codeSource.join("\n")).forEach(function (code) {
      var upper = code.toUpperCase();
      if (seen[upper]) return;
      seen[upper] = true;
      codes.push(upper);
    });

    /* 标题命中用「清洗后标题 + 原标题」两份一起找：
       用户既可能输入界面上看到的「开客户号」，也可能连编号一起粘「2.1.1开客户号」。 */
    var titleHay = foldCase(title + " " + rawTitle);
    var pathHay = foldCase(path.slice(0, -1).join(" "));

    var bigrams = Object.create(null);
    bigramsOf(title).forEach(function (gram) { bigrams[gram] = true; });

    return {
      key: toStr(node && node.key),
      title: title,
      rawTitle: rawTitle,
      path: path,
      pathText: pathText,
      category: categoryOf(node),
      categoryIndex: categoryIndexOf(node),
      titleHay: titleHay,
      titleLower: foldCase(title),
      pathHay: pathHay,
      lines: lines,
      codes: codes,
      codeSet: seen,
      bigrams: bigrams,
      bigramCount: Object.keys(bigrams).length
    };
  }

  function resolveOptions(options) {
    var given = options || {};
    return {
      contextRadius: typeof given.contextRadius === "number" && given.contextRadius >= 0 ? given.contextRadius : DEFAULTS.contextRadius,
      maxSnippets: typeof given.maxSnippets === "number" && given.maxSnippets >= 0 ? given.maxSnippets : DEFAULTS.maxSnippets,
      maxSuggestions: typeof given.maxSuggestions === "number" && given.maxSuggestions >= 0 ? given.maxSuggestions : DEFAULTS.maxSuggestions,
      cleanTitle: typeof given.cleanTitle === "function" ? given.cleanTitle : defaultCleanTitle,
      stageOf: typeof given.stageOf === "function" ? given.stageOf : stageKeyOf
    };
  }

  /* buildIndex：一次预处理，之后每次 search 只做匹配。
     索引是纯数据（可反复复用），81 个业务/7.2 万字量级下建一次约 10ms 内。 */
  function buildIndex(nodes, options) {
    var opts = resolveOptions(options);
    var list = Array.isArray(nodes) ? nodes : [];
    var entries = list.map(function (node) { return entryOf(node, opts); });
    var categories = [];
    var known = Object.create(null);
    entries.forEach(function (entry) {
      if (known[entry.category]) return;
      known[entry.category] = true;
      categories.push({ title: entry.category, categoryIndex: entry.categoryIndex });
    });
    categories.sort(function (a, b) { return a.categoryIndex - b.categoryIndex; });
    return { __searchIndex: true, entries: entries, categories: categories, options: opts, size: entries.length };
  }

  function isIndex(value) {
    return Boolean(value && value.__searchIndex && Array.isArray(value.entries));
  }

  /* ================= 匹配与片段 ================= */

  /* 单行内计数：返回本行出现次数与各命中起点。 */
  function hitsInLine(lower, term) {
    var hits = [];
    var from = 0;
    var at = lower.indexOf(term, from);
    while (at >= 0) {
      hits.push(at);
      from = at + term.length;
      at = lower.indexOf(term, from);
    }
    return hits;
  }

  /* 片段：命中位置前后各 contextRadius 字，落在同一行内，互不重叠。
     text.slice(matchStart, matchEnd) 必然等于原文中被命中的那一段（大小写按原文）。 */
  function snippetAt(line, at, length, radius) {
    var start = Math.max(0, at - radius);
    var end = Math.min(line.text.length, at + length + radius);
    return {
      text: line.text.slice(start, end),
      matchStart: at - start,
      matchEnd: at - start + length,
      sourceStage: line.stage,
      sourceStageLabel: STAGE_LABEL[line.stage] || "",
      sourceKind: line.kind || "text", // "text" | "table" | "title"
      truncatedHead: start > 0,
      truncatedTail: end < line.text.length
    };
  }

  function scoreEntry(entry, term, codeForm, opts) {
    var titleHit = term && entry.titleHay.indexOf(term) >= 0;
    var pathHit = term && entry.pathHay.indexOf(term) >= 0;
    var codeExact = Boolean(codeForm) && Boolean(entry.codeSet[codeForm]);

    var occurrences = 0;
    var snippets = [];
    var radius = opts.contextRadius;
    var limit = opts.maxSnippets;

    for (var i = 0; i < entry.lines.length; i += 1) {
      var line = entry.lines[i];
      var hits = hitsInLine(line.lower, term);
      if (!hits.length) continue;
      occurrences += hits.length;
      if (snippets.length >= limit) continue; // 次数还要继续累加，片段够了就不再取
      var coveredTo = -1;
      for (var h = 0; h < hits.length && snippets.length < limit; h += 1) {
        if (hits[h] < coveredTo) continue; // 同一行里被上一片段窗口覆盖的命中不再单独出片段
        var snippet = snippetAt(line, hits[h], term.length, radius);
        snippets.push(snippet);
        coveredTo = hits[h] + term.length + radius;
      }
    }

    /* 只在标题命中而正文没有的业务（如查「开客户号」），也要给一个可读片段：
       用标题本身兜底，sourceStage 标为 "title"，渲染时可据此换一种样式。 */
    if (!snippets.length && titleHit) {
      var at = entry.titleLower.indexOf(term);
      if (at >= 0) snippets.push(snippetAt({ text: entry.title, lower: entry.titleLower, stage: "title", kind: "title" }, at, term.length, radius));
    }

    var score = (codeExact ? SCORE.CODE_EXACT : 0)
      + (titleHit ? SCORE.TITLE : 0)
      + (pathHit ? SCORE.PATH : 0)
      + occurrences * SCORE.OCCURRENCE;

    if (!score) return null;
    return {
      key: entry.key,
      title: entry.title,
      path: entry.path,
      pathText: entry.pathText,
      category: entry.category,
      categoryIndex: entry.categoryIndex,
      score: score,
      codeExact: codeExact,
      matchedCode: codeExact ? codeForm : "", // 精确命中的那个码（大写形态），渲染「精确匹配 G04002」徽章用
      codes: entry.codes.slice(0, 3),         // 与右栏徽章同口径：只取前 3 个
      codeCount: entry.codes.length,
      titleHit: Boolean(titleHit),
      pathHit: Boolean(pathHit),
      occurrences: occurrences,
      snippets: snippets
    };
  }

  /* ================= 相近业务推荐（仅零结果时） ================= */

  /* Dice 系数：2×交集 / (两边 bigram 数之和)。纯字面重合，不引入任何词典。 */
  function similarityOf(entry, queryGrams) {
    if (!queryGrams.length || !entry.bigramCount) return { score: 0, shared: [] };
    var shared = [];
    for (var i = 0; i < queryGrams.length; i += 1) {
      if (entry.bigrams[queryGrams[i]] && shared.indexOf(queryGrams[i]) < 0) shared.push(queryGrams[i]);
    }
    return { score: (2 * shared.length) / (queryGrams.length + entry.bigramCount), shared: shared };
  }

  function suggestFor(index, normalized, opts) {
    var limit = opts.maxSuggestions;
    if (!limit || !index.entries.length) return [];
    var queryGrams = [];
    bigramsOf(normalized).forEach(function (gram) { if (queryGrams.indexOf(gram) < 0) queryGrams.push(gram); });

    var ranked = index.entries.map(function (entry, order) {
      var sim = similarityOf(entry, queryGrams);
      return { entry: entry, order: order, score: sim.score, shared: sim.shared };
    }).filter(function (item) { return item.score > 0; });

    /* 二次兜底：连一个 bigram 都对不上时（如查「不存在词xyz」），退到单字重合。 */
    var mode = "bigram";
    if (!ranked.length) {
      var chars = [];
      toStr(normalized).replace(/\s+/g, "").split("").forEach(function (ch) { if (chars.indexOf(ch) < 0) chars.push(ch); });
      ranked = index.entries.map(function (entry, order) {
        var shared = chars.filter(function (ch) { return entry.titleLower.indexOf(foldCase(ch)) >= 0; });
        return { entry: entry, order: order, score: shared.length ? shared.length / (chars.length + entry.title.length) : 0, shared: shared };
      }).filter(function (item) { return item.score > 0; });
      mode = "char";
    }

    ranked.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      if (a.entry.title.length !== b.entry.title.length) return a.entry.title.length - b.entry.title.length; // 同分优先短标题，更像“正主”
      return a.order - b.order;
    });

    /* 三次兜底：字面上完全无关（或凑不满 3 条）时，按书中顺序补齐常办业务，
       保证「无结果页永远有 3 条可点的路」，不会出现空推荐或只有 1 条的尴尬版面。 */
    if (ranked.length < limit) {
      if (!ranked.length) mode = "fallback";
      var taken = Object.create(null);
      ranked.forEach(function (item) { taken[item.entry.key] = true; });
      for (var i = 0; i < index.entries.length && ranked.length < limit; i += 1) {
        if (taken[index.entries[i].key]) continue;
        ranked.push({ entry: index.entries[i], order: i, score: 0, shared: [] });
      }
    }

    return ranked.slice(0, limit).map(function (item) {
      return {
        key: item.entry.key,
        title: item.entry.title,
        path: item.entry.path,
        pathText: item.entry.pathText,
        category: item.entry.category,
        similarity: Math.round(item.score * 1000) / 1000,
        reason: reasonText(mode, normalized, item)
      };
    });
  }

  /* 推荐理由要写清「凭什么推它」，柜面才敢点。三种口径分别对应三层兜底。 */
  function reasonText(mode, normalized, item) {
    var shared = item.shared || [];
    if (mode === "bigram" && shared.length) {
      return "名称与「" + normalized + "」有 " + shared.length + " 处字面重合（" + shared.slice(0, 3).join("、") + "）";
    }
    if (mode === "char" && shared.length) {
      return "名称与「" + normalized + "」共用「" + shared.slice(0, 3).join("") + "」" + shared.length + " 个字";
    }
    return "手册中没有与「" + normalized + "」更接近的名称，按原书顺序补一条「" + item.entry.category + "」常办业务";
  }

  /* ================= 主入口 ================= */

  /* search 既接受 buildIndex 的产物，也接受原始 nodes 数组（内部临时建一次索引）。
     渲染层建议在 handbook 载入后建一次索引存起来，每次回车只调 search。 */
  function search(indexOrNodes, query, options) {
    var index = isIndex(indexOrNodes) ? indexOrNodes : buildIndex(indexOrNodes, options);
    var opts = options ? resolveOptions(options) : index.options;
    var raw = toStr(query);
    var normalized = normalizeQuery(raw);
    var empty = { query: raw, normalized: normalized, total: 0, groups: [], suggestions: [] };

    /* 空串与纯空白：直接空结果，也不给推荐（没有可比对的字面，推荐没有意义）。 */
    if (!normalized) return empty;

    var term = foldCase(normalized);
    /* 只有「查询串本身就长得像一个完整交易码」时才走精确匹配，
       否则 "8101" 这类前缀不该把任何业务顶到最上面。 */
    var codeForm = toCodeForm(normalized);
    if (!CODE_WHOLE.test(codeForm)) codeForm = "";

    var results = [];
    for (var i = 0; i < index.entries.length; i += 1) {
      var hit = scoreEntry(index.entries[i], term, codeForm, opts);
      if (hit) results.push(hit);
    }

    if (!results.length) {
      return { query: raw, normalized: normalized, total: 0, groups: [], suggestions: suggestFor(index, normalized, opts) };
    }

    /* 分组：按分类（对私 / 对公）。组内先按分数降序，
       同分时短路径优先（越靠上层的业务越可能是用户要的正主），再按 key 稳定收尾。 */
    var buckets = [];
    var byCategory = Object.create(null);
    results.forEach(function (item) {
      var bucket = byCategory[item.category];
      if (!bucket) {
        bucket = { category: item.category, categoryIndex: item.categoryIndex, count: 0, topScore: 0, results: [] };
        byCategory[item.category] = bucket;
        buckets.push(bucket);
      }
      bucket.results.push(item);
      if (item.score > bucket.topScore) bucket.topScore = item.score;
    });

    buckets.forEach(function (bucket) {
      bucket.results.sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        if (a.path.length !== b.path.length) return a.path.length - b.path.length;
        return a.key < b.key ? -1 : (a.key > b.key ? 1 : 0);
      });
      bucket.count = bucket.results.length;
    });

    /* 组序：命中最强的分类在前——这样交易码精确匹配所在的分类必然排在最上面，
       「绝对置顶」在分组视图下依然成立；分数持平时回落到书中原有的分类顺序。 */
    buckets.sort(function (a, b) {
      if (b.topScore !== a.topScore) return b.topScore - a.topScore;
      return a.categoryIndex - b.categoryIndex;
    });

    return { query: raw, normalized: normalized, total: results.length, groups: buckets, suggestions: [] };
  }

  return {
    STAGES: STAGES,
    STAGE_LABEL: STAGE_LABEL,
    SCORE: SCORE,
    DEFAULTS: DEFAULTS,
    CODE_PATTERN: CODE_PATTERN,
    buildIndex: buildIndex,
    search: search,
    extractCodes: extractCodes,
    normalizeQuery: normalizeQuery,
    toCodeForm: toCodeForm,
    cleanTitle: defaultCleanTitle
  };
});
