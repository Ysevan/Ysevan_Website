/* 新员工业务手册 v1.7.0：四步同页连续文档 + 吸顶工作台头与四步锚点条；
   本版接入两个独立模块（分组搜索 search-module.js、最近查看/常办 visit-store.js），
   新增三态主题开关（自动/浅色/深色）、截图胶片条与灯箱按环节筛图、打印「含截图」开关。
   展示层整理，不改变原始手册事实口径。 */
(() => {
  "use strict";

  const handbook = window.EMPLOYEE_HANDBOOK;
  /* 两个三期模块：各自只挂一个全局名，缺一个只降级那一块，主流程一行不受影响。
     必须走 window.* 取值——它们把自己挂在宿主全局上，裸标识符在受控宿主里未必解析得到。 */
  const Search = (window && window.HandbookSearch) || null;
  const view = document.querySelector(".manual-shell");
  const tabs = document.querySelector("#category-tabs");
  const headEl = document.querySelector(".workbench-head");
  const railHost = document.querySelector("#stage-rail-host");
  const liveRegion = document.querySelector("#live-region");
  const searchForm = document.querySelector("#global-search");
  const searchInput = document.querySelector("#global-search-input");
  /* 阅读顶栏在所有宽度保留搜索与工具；目录在 1100px 以下使用抽屉。 */
  const headTop = document.querySelector(".head-top");
  const headBiz = document.querySelector("#head-biz");
  const searchToggle = document.querySelector("#head-search-toggle");
  const drawerButton = document.querySelector("#toc-drawer-open");
  const toolsButton = document.querySelector("#tools-open");
  let tocCollapsed = false;
  const skipLink = document.querySelector(".skip-link");
  const printSheet = document.querySelector("#print-sheet");
  const brandLink = document.querySelector(".brand");
  const lightbox = document.querySelector("#lightbox");
  const helpDialog = document.querySelector("#hotkey-help");
  const searchClear = document.querySelector("#global-search-clear");
  /* 搜索联想浮层（静态写在搜索表单末尾）：三个节点任一缺失，联想整块不工作，搜索框照旧只有回车提交一条路。 */
  const suggestPop = document.querySelector("#search-suggest-pop");
  const suggestList = document.querySelector("#search-suggest");
  const suggestNote = suggestPop ? suggestPop.querySelector(".suggest-note") : null;
  const HANDBOOK_VERSION = "2026-02-05";
  const SITE_VERSION = "v1.8.2";
  const STAGES = [
    { key: "prepare", label: "准备材料", hint: "先核验客户、材料和单据是否齐全" },
    { key: "operate", label: "办理步骤", hint: "按系统或柜面流程依次办理" },
    { key: "review", label: "核对重点", hint: "提交前复核要素、风险点和特殊情形" },
    { key: "archive", label: "办结归档", hint: "完成后留存资料、回单或传票" },
  ];
  /* 空环节的口径说明：制度框架在每个业务上都可见可解释，不再让环节整段消失。 */
  const vacantNotice = (label) => `原手册在此业务中未单列“${label}”内容，请按所在机构及最新制度的归档/核对要求执行。`;
  const CONDENSE_ON = 80;      // 向下滚过此距离压缩工作台头
  const CONDENSE_OFF = 40;     // 回弹阈值另设一档，临界处不来回抖
  const LINK_LINE = 16;        // 联动判定线：吸顶头下沿再往下 16px
  const HASH_THROTTLE = 300;   // 滚动联动改写 hash 的最小间隔
  const HASH_THROTTLE_SOFT = 1000; // replaceState 不可用（file://）时改用的宽松间隔
  const SCROLL_THROTTLE = 150; // 滚动联动重算高亮的节流
  const SCROLL_IDLE = 200;     // 无 scrollend 时，静默多久算“滚动停止”
  let categoryIndex = 0;
  let selectedKey = "";
  let activeStage = 0;
  let keyword = "";
  let focusMode = false;
  /* 分类切换记忆：每个分类记住本次会话中最近访问的业务，切回来时恢复；仅内存，不持久化。 */
  const lastBusiness = {};
  /* 最近查看 / 标星常办：与分类记忆同一区域声明，区别是它要落 localStorage（失败即内存态）。
     visit-store.js 没能加载时用这份空壳兜底——接口一致、恒空，快速入口整块不渲染，主流程一行不受影响。 */
  const emptyVisitStore = {
    recordVisit() {}, getRecents() { return []; }, getStars() { return []; },
    isStarred() { return false; }, toggleStar() { return false; }, removeRecent() { return false; },
    clearRecents() {}, clearStars() {},
  };
  const visits = typeof (window && window.createVisitStore) === "function" ? window.createVisitStore() : emptyVisitStore;
  let starNotice = false; // 版本闸清空过常办：快速入口区留一行静态提示，下一次交互后消失
  /* 原文对照视图（§4.9）：只影响正文区，状态不持久化，切业务与进搜索页都自动退出。 */
  let rawMode = false;
  let rawModeKey = "";
  /* 布局壳常驻：目录只在切分类、首次进入、从搜索页返回时重建，正文与右栏各渲染进自己的容器。 */
  let shell = null;
  let tocBuiltFor = -1;
  let tocSelectedKey = "";
  let tocFilter = "";
  let tocTotal = 0;
  let tocFolded = null;
  let pendingFocus = null;
  /* 滚动联动状态：linkSuppressed 在程序化滚动期间为真，其间既不改高亮也不改写 hash。 */
  let observer = null;
  let linkSuppressed = false;
  let idleTimer = 0;
  let linkTimer = 0;
  let hashTimer = 0;
  let lastHashWrite = 0;
  let replaceStateOk = true;
  /* 灯箱状态：图片清单随正文渲染登记，opener 用于关闭后归还焦点。 */
  let lightboxFigures = [];
  let lightboxIndex = 0;
  let lightboxZoom = 1;
  let lightboxOpener = null;
  /* 灯箱开合动效进行中的那一段（§12）：null 或 { phase: "wait" | "open" | "close", anims, ghost, timer }。 */
  let lightboxMotion = null;
  /* 复制气泡：同一时刻只有一只，copyTimer 管它当前这一段（到点淡出 / 淡出兜底）。 */
  let copyTimer = 0;
  /* 材料勾选卡：materialCards 由本次正文渲染登记（打印稿不登记），checkState 是当前业务的勾选下标集合。 */
  let materialCards = [];
  let checkNodeKey = "";
  let checkState = {};
  let riskOff = false;
  /* 外观三态：light（默认）/ dark / auto（跟随 prefers-color-scheme），存 hb:mode。
     三档**都写 html[data-mode] 属性**（含 auto）——深色块的选择器写成
     :root:not([data-mode="light"])，auto 自然落进 prefers-color-scheme 那一支。 */
  let mode = "light";
  /* 六个强调色：blue 蓝（默认）/ green 绿 / indigo 靛 / orange 橙 / pink 粉 / teal 青，
     存 hb:accent（英文名），由 html[data-accent] 驱动强调色组换值。
     这一档同样**始终写属性**（包括默认的 blue）：CSS 里 :root 已经是 blue 的值，
     写上去只是让「当前是哪一个」在 DOM 上一眼可查，也让 head 里的预置脚本与这里口径一致。 */
  let accent = "blue";
  /* 打印「含截图」：默认开，存 hb:print-images；只影响 buildPrintSheet 里图片 figure 出不出，正文文字不受影响。 */
  let printImages = true;
  /* 灯箱按环节筛图："" = 全部；筛选期间上一张/下一张只在该环节内循环。 */
  let lightboxStage = "";
  /* 900–1120px 中间态的「正文顶部横向要点条」：收起只出一行摘要，展开为完整速查卡。
     仅内存，不持久化；其余断点由 CSS 置 display:none，桌面与手机形态一字不变。 */
  let asideBarOpen = false;
  let flashTimer = 0;
  /* 目录抽屉（仅 ≤900px 可达）：opener 用于关闭后归还焦点。 */
  let tocDrawerOpener = null;
  /* 速查卡底部抽屉（仅 ≤600px 是弹层形态）：同样记下触发者，关闭后把焦点还回去。 */
  let asideOpener = null;
  /* 那只抽屉正在收回（挂着 .is-closing）的宿主与它的兜底计时器（§12）。 */
  let asideClosing = null;
  let asideClosingTimer = 0;
  /* 案头手册（§9）开关：存 hb:desk3d，只有显式存过 "off" 才是关；这个键只由 app.js 读写。 */
  let deskOn = false;

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[character]));
  /* 原始 Word 稿在个别标题尾部留有编辑批注（如“……建议删除（建议保留）”），只在展示层剥离，不改数据文件。 */
  const editorialTail = /\s*(?:此模块[^，。；]{0,24}，|无此类业务，)?建议删除[。．.]?\s*[（(]\s*建议[^）)]{0,24}[）)]\s*$/;
  const cleanTitle = (value) => String(value || "").replace(/^\s*\d+(?:\.\d+)*[.、．]?\s*/, "").replace(/^\s*[一二三四五六七八九十]+[.、．]\s*/, "").replace(editorialTail, "").trim() || "未命名业务";
  const textFor = (block) => String(block?.text || "").trim() || (block?.rows || []).flat().join(" ");
  const imageUrl = (name) => /^image\d+\.(?:png|jpe?g)$/i.test(String(name || "")) ? `assets/employee-handbook/${name}` : "";

  /* ================= 轻量状态存储：localStorage 能用就用，用不了静默退回内存 =================
     file:// 下个别浏览器读 window.localStorage 本身就抛 SecurityError，隐私模式下写入也可能抛；
     一旦抛过就整轮改走内存 Map（刷新即失效，但页面功能完全不受影响），调用方三个函数接口一致。 */
  const memoryStore = new Map();
  let storageOk = null;

  function storageBox() {
    if (storageOk === false) return null;
    try {
      const box = typeof window !== "undefined" ? window.localStorage : null;
      if (!box || typeof box.getItem !== "function" || typeof box.setItem !== "function") { storageOk = false; return null; }
      return box;
    } catch (error) { storageOk = false; return null; }
  }

  function storageGet(key) {
    const box = storageBox();
    if (box) {
      try {
        const value = box.getItem(key);
        storageOk = true;
        return value === null || value === undefined ? "" : String(value);
      } catch (error) { storageOk = false; }
    }
    return memoryStore.has(key) ? memoryStore.get(key) : "";
  }

  function storageSet(key, value) {
    memoryStore.set(key, String(value));
    const box = storageBox();
    if (!box) return;
    try { box.setItem(key, String(value)); storageOk = true; } catch (error) { storageOk = false; }
  }

  function storageDrop(key) {
    memoryStore.delete(key);
    const box = storageBox();
    if (!box) return;
    try { box.removeItem(key); } catch (error) { storageOk = false; }
  }

  /* ================= 版本闸：手册换版就把最近查看与常办清空 =================
     key 是结构下标链，手册重生成时中间插删一个 section，其后所有 key 全部平移——
     旧 key 可能还“有效”却指到另一个业务上，这是唯一检测不出来的一类错，宁可清空重来。
     hb:ver 走上面那对 storageGet/storageSet（自带 try/catch 与内存兜底），file:// 下本就是内存态。 */
  (function gateHandbookVersion() {
    const version = String((handbook && handbook.version) || HANDBOOK_VERSION);
    if (storageGet("hb:ver") === version) return;
    const hadStars = visits.getStars().length > 0;
    visits.clearRecents();
    visits.clearStars();
    storageSet("hb:ver", version);
    /* 最近查看被清掉无所谓；常办是柜员手动积累的，只有它被清才值得打扰一次。 */
    starNotice = hadStars;
  })();

  function hasContent(section) {
    return (section?.blocks || []).some((block) => textFor(block) || (block.images || []).length);
  }

  function isEditorialLine(section) {
    return /^\d+[.、]\D/.test(String(section?.title || "")) && !/^\d+\.\d+/.test(String(section?.title || ""));
  }

  /* key 用结构下标链（如 "0-1-2-3"），标题重复的业务也能各自定位；indexPath 以分类下标开头。 */
  function collectNodes(section, path = [], indexPath = []) {
    const nextPath = [...path, section.title];
    const own = hasContent(section) && !isEditorialLine(section)
      ? [{ section, path: nextPath, key: indexPath.join("-") }]
      : [];
    return (section.children || []).reduce((all, child, index) => all.concat(collectNodes(child, nextPath, [...indexPath, index])), own);
  }

  function categories() {
    return handbook?.content?.children || [];
  }

  function allNodes() {
    return categories().flatMap((category, index) => collectNodes(category, [], [index]).map((node) => ({ ...node, categoryIndex: index })));
  }

  function currentNode() {
    const nodes = allNodes();
    if (!nodes.length) return null;
    let node = nodes.find((item) => item.key === selectedKey && item.categoryIndex === categoryIndex);
    if (!node) node = nodes.find((item) => item.categoryIndex === categoryIndex) || nodes[0];
    selectedKey = node.key;
    categoryIndex = node.categoryIndex;
    lastBusiness[node.categoryIndex] = node.key; // 分类切换记忆：记住本分类最近访问的业务
    // 不再展示或新增最近查看记录；分类切换的会话记忆与常办仍然保留。
    return node;
  }

  /* 原手册的小节标签词，既用于判断一行是不是小节标题，也用于把标题归到对应环节。 */
  const stageLabels = "审核材料|所需材料|所需资料|填写单据|填单图样|客户环节|客户需提供|提交资料|审核填写材料|基础材料|操作流程|系统操作|核心交易|核心操作|核心系统环节|处理流程|集约交易|发起业务|注意事项|业务完结|业务完完结|业务结束|审核要点|要点提示|常见Q|风险提示|相关附件|尽职调查|相关文件|文件依据|操作提示|资料留存|归档|传票|回单";
  /* 编号分隔符容错到逗号、标签词前多打的一个点，都是原稿的录入笔误。 */
  const headingLead = new RegExp(`^(?:[一二三四五六七八九十]+\\s*[.、．,，]|[①②③④⑤⑥⑦⑧⑨⑩]\\s*[、.．]?|[.、．]?(?:${stageLabels}))`);
  const stageLabel = new RegExp(`(?:${stageLabels})`);
  /* 括号编号（“（四）注意事项”）要连同长度一起判断：原稿里长句也用“(一)”起头分条，那是正文不是标题。 */
  const bracketLead = /^[（(][一二三四五六七八九十]+[）)]/;

  /* 只有“标题式”的行才算小节标题：中文编号、圈码编号、以标签词起头，或短行用括号编号 / 以冒号收尾且含标签词。 */
  function isStageHeading(text) {
    if (headingLead.test(text)) return true;
    if (text.length > 30) return false;
    return bracketLead.test(text) || (/[：:]$/.test(text) && stageLabel.test(text));
  }

  /* 只有小节标题会切换环节，普通正文一律跟随当前环节，避免正文里的个别词语打乱原手册顺序。 */
  function stageFor(block) {
    const text = textFor(block).replace(/\s+/g, " ").trim();
    if (!isStageHeading(text)) return "";
    if (/客户环节|审核材料|所需材料|所需资料|填写单据|填单图样|基础材料|客户需提供|提交资料|审核填写材料/.test(text)) return "prepare";
    if (/注意事项|审核要点|要点提示|常见Q|风险提示|相关附件|尽职调查|相关文件|文件依据|操作提示/.test(text)) return "review";
    if (/操作流程|系统操作|核心交易|核心操作|核心系统环节|处理流程|集约交易|发起业务|交易码|流程/.test(text)) return "operate";
    if (/资料留存|归档|传票|回单/.test(text)) return "archive";
    return "";
  }

  function flowFor(node) {
    const flow = STAGES.map((stage) => ({ ...stage, blocks: [] }));
    let active = 0;
    (node?.section?.blocks || []).forEach((block) => {
      const key = stageFor(block);
      const found = flow.findIndex((stage) => stage.key === key);
      if (found >= 0) active = found;
      flow[active].blocks.push(block);
    });
    return flow;
  }

  /* 原手册未单列的环节视为空环节：连续文档下它仍占一段，正文位置改出一条口径说明条。 */
  function isFilled(stage) {
    return Boolean(stage?.blocks?.length);
  }

  /* 锚点条上的内容量：条 = 该环节渲染出的非空正文行数（一张表按 1 条计），图 = 图片张数。
     取数直接走 layoutLines，与正文实际渲染的行一一对应，不另立一套统计口径。 */
  function stageCounts(stage) {
    const blocks = stage?.blocks || [];
    let lines = 0;
    let images = 0;
    layoutLines(blocks).forEach((line) => {
      if (line.consumed) return;
      if (line.table) { if (line.last) lines += 1; return; }
      if (normLine(line.text)) lines += 1;
    });
    blocks.forEach((block) => { images += (block.images || []).length; });
    return { lines, images };
  }

  /* ================= 正文渲染引擎：行模型 + 归类规则 =================
     阈值与守卫全部照搬取证脚本的规则库，只做归类与版式，不删改任何原文字符：
     渲染出的可见文字 = 原文全部字符（仅行首尾空白归一）。判定用归一串，取字用原串，
     两者等长（全角空格 → 半角是 1:1 替换，首尾空白两边同样被去掉），因此可按下标互相切片。 */
  const normLine = (value) => String(value ?? "").replace(/[ 　]/g, " ").trim();
  const trimLine = (value) => String(value ?? "").replace(/^\s+/, "").replace(/\s+$/, "");

  /* 编号前缀六种样式；圈码范围 ①(U+2460) – ⑳(U+2473)。 */
  const NUM_STYLES = [
    ["arabic", /^(\d{1,2})\s*[.、．]\s*(?!\d)/],
    ["arabicParen", /^(\d{1,2})\s*[)）]\s*/],
    ["circled", /^([①-⑳])\s*[、.．]?\s*/],
    ["brArabic", /^[（(]\s*(\d{1,2})\s*[）)]\s*/],
    ["cnNum", /^([一二三四五六七八九十]{1,3})\s*[.、．，,]\s*/],
    ["brCnNum", /^[（(]\s*([一二三四五六七八九十]{1,3})\s*[）)]\s*/],
  ];
  const CN_DIGIT = { 一: 1, 二: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 };

  function numPrefix(text) {
    const value = normLine(text);
    for (let index = 0; index < NUM_STYLES.length; index += 1) {
      const style = NUM_STYLES[index][0];
      const matched = NUM_STYLES[index][1].exec(value);
      if (!matched) continue;
      const token = matched[1];
      let ordinal = null;
      if (style === "circled") ordinal = token.charCodeAt(0) - 0x2460 + 1;
      else if (style === "cnNum" || style === "brCnNum") ordinal = token.length === 1 ? (CN_DIGIT[token] ?? null) : token === "十一" ? 11 : token === "十二" ? 12 : token === "二十" ? 20 : null;
      else ordinal = Number(token);
      return { style, ordinal, prefix: matched[0], body: value.slice(matched[0].length) };
    }
    return { style: null, ordinal: null, prefix: "", body: value };
  }

  /* 定义行「X：Y」的 X 必须名词性：只含汉字/拉丁字母/数字/※＊&《》，长度 2–10；纯数字的是交易码不是标签。 */
  const LABEL_X = "[\\u4e00-\\u9fa5A-Za-z0-9\\uff06&*\\uff0a\\u203b\\u300a\\u300b]{2,10}";
  const LABEL_LINE = new RegExp(`^(${LABEL_X})[：:]\\s*(\\S[\\s\\S]*)$`);
  const LABEL_ONLY = new RegExp(`^(${LABEL_X})[：:]\\s*$`);
  const LABEL_X_NUMERIC = /^\d+$/;
  const LABEL_WORD_LEAD = new RegExp(`^[.、．]?(?:${stageLabels})`);
  const HEADING_MAX = 20;          // 标题长度上限（实测阈值）
  const SENTENCE_END = /[。；;！!？?]\s*$/;  // 句末标点 → 完整句子，不是标题
  const COLON_WITH_BODY = /[：:]\s*\S/;      // 冒号后仍有内容 → 定义行，不是标题
  const ENUM_COMMA = /[、，]/;               // 顿号/逗号 → 在列举，不是标题
  const HAS_CODE = /\d{4,}/;                 // 含 4 位以上数字 → 交易码说明行，不是标题

  function classifyBody(body) {
    const value = normLine(body);
    if (!value) return { type: "empty" };
    const only = LABEL_ONLY.exec(value);
    if (only && !LABEL_X_NUMERIC.test(only[1])) return { type: "labelOnly", label: only[1], value: "" };
    const labelled = LABEL_LINE.exec(value);
    if (labelled && !LABEL_X_NUMERIC.test(labelled[1])) return { type: "label", label: labelled[1], value: labelled[2] };
    return { type: null };
  }

  /* 纯标题：短 + 无「冒号+内容」+ 无句末标点 + 无顿号列举 + 无长数字，且以中文序号/括号中文序号/小节标签词起头。
     圈码一律不作标题引导（实测圈码行绝大多数是步骤正文）。 */
  function isPureHeading(text) {
    const value = normLine(text);
    if (!value || value.length > HEADING_MAX) return false;
    if (COLON_WITH_BODY.test(value)) return false;
    if (SENTENCE_END.test(value)) return false;
    if (ENUM_COMMA.test(value)) return false;
    if (HAS_CODE.test(value)) return false;
    const pre = numPrefix(value);
    if (pre.style === "cnNum" || pre.style === "brCnNum") return true;
    return LABEL_WORD_LEAD.test(pre.style ? pre.body : value);
  }

  function classifyLine(text) {
    const value = normLine(text);
    if (!value) return { cls: "empty", pre: numPrefix(""), body: "", label: "", value: "", numbered: false };
    const pre = numPrefix(value);
    const info = classifyBody(pre.body);
    let cls;
    if (info.type === "label") cls = "label";
    else if (info.type === "labelOnly") cls = "heading";
    else if (isPureHeading(value)) cls = "heading";
    else cls = "para";
    return { cls, pre, body: pre.body, label: info.label || "", value: info.value || "", numbered: Boolean(pre.style) };
  }

  /* 连续编号行成组：同样式、行相邻、组内 ≥2 行、标题行不入组、序号严格递增。
     中文序号（“一、”“五、”）一律不参与成组：它在原稿里同时充当小节标题，混进列表会让同一份清单出现三种形态。 */
  function groupRuns(lines, options) {
    const opts = options || {};
    const runs = [];
    let current = null;
    const flush = () => { if (current && current.items.length >= 2) runs.push(current); current = null; };
    lines.forEach((line, index) => {
      const info = line.info;
      const eligible = info && info.numbered && info.cls !== "heading" && info.cls !== "empty" && info.pre.style !== "cnNum";
      if (!eligible) {
        /* 办理步骤环节专用：紧跟编号行之后的纯图片块（无文字、无表格、非提示条）是该步骤的截图，
           不再打断编号组，其图片改挂到上一条 li 上作节点缩略图。图片本身的渲染顺序与登记顺序不变。 */
        if (opts.bridgeImages && current && current.end === index - 1 && line.last && line.images > 0
          && !normLine(line.text) && !line.rows && !line.table && !line.notice && !line.consumed) {
          current.end = index;
          (current.bridges = current.bridges || []).push(index);
          return;
        }
        flush();
        return;
      }
      const style = info.pre.style;
      const ordinal = info.pre.ordinal;
      const rising = current && (current.lastOrdinal == null || ordinal == null || ordinal > current.lastOrdinal);
      if (current && current.style === style && current.end === index - 1 && rising) {
        current.items.push(index);
        current.end = index;
        current.lastOrdinal = ordinal ?? current.lastOrdinal;
        return;
      }
      flush();
      current = { style, items: [index], start: index, end: index, lastOrdinal: ordinal };
    });
    flush();
    /* 只有真正成组（≥2 条）的组，桥接进来的图片块才算“挂上了节点”；落单组被丢弃时桥接一并作废，
       那些图片仍走原来的独立图片块渲染，不多不少。 */
    if (opts.bridged) runs.forEach((run) => (run.bridges || []).forEach((index) => opts.bridged.add(index)));
    return runs;
  }

  /* ---------------- 交易码：完整保留字母前缀，剔除客服热线与金额 ---------------- */
  const CODE_PATTERN = "(?<![0-9A-Za-z])([A-Za-z]?\\d{5,8})(?![0-9A-Za-z])";
  const CODE_HOTLINE = /^(?:95566|4006695566|12363|12378)$/;
  const CODE_MONEY = /^\s*(?:美元|元|万|港币|欧元|日元|人民币|美金)/;
  const isCode = (code, after) => !CODE_HOTLINE.test(code) && !CODE_MONEY.test(String(after || ""));

  function codesIn(text) {
    const source = String(text || "");
    const pattern = new RegExp(CODE_PATTERN, "g");
    const found = [];
    let matched = pattern.exec(source);
    while (matched) {
      if (isCode(matched[1], source.slice(matched.index + matched[0].length))) found.push(matched[1]);
      matched = pattern.exec(source);
    }
    return found;
  }

  /* 徽章包裹在 escapeHtml 之后进行：交易码只含字母数字，转义既不改它的字符也不改它的边界。 */
  function withCodes(html) {
    return String(html).replace(new RegExp(CODE_PATTERN, "g"), (whole, code, offset, all) =>
      isCode(code, all.slice(offset + whole.length)) ? `<button type="button" class="code-badge" data-code="${code}">${code}</button>` : whole);
  }

  const inlineText = (text, badges) => {
    const safe = escapeHtml(text);
    return (badges ? withCodes(safe) : safe).replace(/\n/g, "<br>");
  };

  /* ---------------- 图注：五级优先链 ---------------- */
  const FIGURE_HINT = /(?:图样|截图|界面|图示|示例|样张|图例|图片)\s*[：:]?\s*$/;

  function blockLines(block) {
    const raw = String(block?.text || "");
    return block?.shape ? raw.split("\n") : [raw];
  }

  /* 现行 ① 级：紧邻下一块以“图一/图二…”开头，整块拿来当图注，且该块不再单独渲染。 */
  function imageCaptions(text, imageCount) {
    const source = String(text || "").trim();
    if (!source || !imageCount || !/^图[一二三四五六七八九十\d]/.test(source)) return [];
    const captions = [...source.matchAll(/图[一二三四五六七八九十\d]+(?:[（(][^）)]{1,24}[）)])?/g)].map((match) => match[0]);
    if (imageCount === 1 && captions.length) return [source];
    return captions.length === imageCount ? captions : [];
  }

  function previousLineText(blocks, index) {
    for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
      const parts = blockLines(blocks[cursor]).map(normLine).filter(Boolean);
      if (parts.length) return parts[parts.length - 1];
    }
    return "";
  }

  /* ① 下一行“图N”→ ② 图片块自带的非标题文字 → ③ 上一行以“图样/截图/界面…”收尾 → ④ 图片块文字以上述词收尾 → ⑤ 兜底。
     明确不做“无条件取上一行”：取证显示那样会给近三成图片配上明显不是图注的正文句子。 */
  function figureCaptions(blocks, index) {
    const block = blocks[index] || {};
    const count = (block.images || []).length;
    if (!count) return { level: 0, texts: [] };
    const spread = (text) => Array.from({ length: count }, () => text);
    const byNext = imageCaptions((blocks[index + 1] || {}).text, count);
    if (byNext.length) return { level: 1, texts: byNext };
    const own = normLine(block.text);
    if (own && classifyLine(own).cls !== "heading") return { level: 2, texts: spread(own) };
    const previous = previousLineText(blocks, index);
    if (previous && FIGURE_HINT.test(previous)) return { level: 3, texts: spread(previous) };
    if (own && FIGURE_HINT.test(own)) return { level: 4, texts: spread(own) };
    return { level: 5, texts: [] };
  }

  function renderImages(blocks, index, ctx) {
    const block = blocks[index] || {};
    const images = block.images || [];
    /* ctx.images === false 是打印稿的「不含截图」：图片 figure 整块不出。
       它**不影响任何一个字**——被「① 级图注」消费掉的那些块本来就不在正文桶里（consumed 与开关无关），
       所以两种打印形态的文字部分逐字相同（有专门断言证明）。 */
    if (!images.length || ctx.images === false) return "";
    const picked = figureCaptions(blocks, index);
    const total = images.length;
    const figures = images.map((name, order) => {
      const source = imageUrl(name);
      if (!source) return "";
      const label = String(picked.texts[order] || `原始操作图${order + 1}`).trim();
      const alt = total > 1 ? `${label}（第${order + 1}张，共${total}张）` : label;
      const sequence = total > 1 && picked.level >= 2 ? `<span class="figure-seq">${order + 1} / ${total}</span>` : "";
      const raw = `<a class="figure-raw" href="${source}" target="_blank" rel="noopener">在新标签页打开原图</a>`;
      const caption = `<figcaption><span class="figure-label">${escapeHtml(label)}</span>${sequence}${raw}</figcaption>`;
      /* 打印视图不接灯箱：缩略图退回普通链接，按钮在打印样式里是被隐藏的。 */
      if (!ctx.figures) return `<figure class="source-figure"><a class="figure-thumb" href="${source}" target="_blank" rel="noopener"><img src="${source}" alt="${escapeHtml(alt)}" loading="lazy"></a>${caption}</figure>`;
      const seat = ctx.figures.push({ src: source, caption: label, alt }) - 1;
      return `<figure class="source-figure"><button type="button" class="figure-thumb" data-figure-index="${seat}" aria-label="放大查看：${escapeHtml(alt)}"><img src="${source}" alt="${escapeHtml(alt)}" loading="lazy"></button>${caption}</figure>`;
    }).join("");
    return figures ? `<div class="source-images">${figures}</div>` : "";
  }

  /* ---------------- 表格 ---------------- */
  const flatCell = (value) => String(value ?? "").replace(/\s+/g, "");

  /* 只有“首行每格都短、都非空、都不以句末标点收尾”才当表头 —— 即现行 CSS 已按表头加粗的那一类。 */
  function looksLikeHeader(rows) {
    const first = rows[0] || [];
    if (rows.length < 2 || first.length < 2) return false;
    return first.every((value) => {
      const flat = flatCell(value);
      return Boolean(flat) && flat.length <= 24 && !/[。；;！!？?]$/.test(flat);
    });
  }

  function renderTable(block, ctx) {
    const rows = block?.rows || [];
    if (!rows.length) return "";
    const header = looksLikeHeader(rows);
    const cell = (value, badges) => inlineText(String(value ?? ""), badges);
    const head = header ? `<thead><tr>${(rows[0] || []).map((value) => `<th scope="col">${cell(value, false)}</th>`).join("")}</tr></thead>` : "";
    const body = rows.map((row, rowIndex) => {
      if (header && rowIndex === 0) return "";
      const cells = (row || []).map((value, columnIndex) => {
        const previous = (rows[rowIndex - 1] || [])[0];
        /* 相邻行首列文本相同：视觉上并成一格，读屏仍读到全文。 */
        if (columnIndex === 0 && rowIndex > 0 && flatCell(value) && flatCell(value) === flatCell(previous)) {
          return `<td class="is-repeat"><span class="sr-only">${cell(value, false)}</span></td>`;
        }
        return `<td>${cell(value, ctx.badges)}</td>`;
      }).join("");
      return `<tr>${cells}</tr>`;
    }).join("");
    const caption = `<caption class="sr-only">表格：${escapeHtml(ctx.bizName || "本业务")}</caption>`;
    return `<div class="table-frame"><div class="table-wrap"><table>${caption}${head}<tbody>${body}</tbody></table></div></div>`;
  }

  /* ---------------- 逐行渲染 ---------------- */
  function layoutLines(blocks) {
    const lines = [];
    blocks.forEach((block, blockIndex) => {
      const previous = blocks[blockIndex - 1] || {};
      const consumed = !(block.images || []).length && imageCaptions(block.text, (previous.images || []).length).length > 0;
      const notice = block.kind === "notice";
      const table = block.kind === "table";
      const parts = blockLines(block);
      parts.forEach((text, lineIndex) => {
        lines.push({
          block, blockIndex, lineIndex, text, consumed, notice, table,
          last: lineIndex === parts.length - 1,
          images: (block.images || []).length,
          rows: (block.rows || []).length,
          info: notice || table ? null : classifyLine(text),
        });
      });
    });
    return lines;
  }

  function lineKind(line, inRun) {
    if (line.table) return "table";
    if (line.notice) return "notice";
    if (!normLine(line.text)) return line.images ? "image" : line.rows ? "table" : "empty";
    if (inRun) return line.info.cls === "label" ? "li-label" : "li";
    return line.info.cls;
  }

  /* 定义行版式：编号前缀、标签、冒号、冒号后的空白全部留在标签一侧，值超 120 字改标签独行的堆叠版式。
     keepPrefix=false 只用于编号组成员：那里的前缀已经单独渲染成序标，再算进标签就会重复。 */
  function definitionParts(display, info, keepPrefix) {
    const body = display.slice(keepPrefix ? 0 : info.pre.prefix.length);
    const size = info.value.length;
    return { head: body.slice(0, body.length - size), value: body.slice(body.length - size), stacked: size > 120 };
  }

  /* ---------------- 材料勾选卡（准备材料环节） ----------------
     切分只发生在“标签属材料集”的定义行上，且是**无损**的：每一项记下它在原值里的原始切片 raw，
     全部 raw 首尾相接必然等于原值本身；页面上显示的 text 只是把项尾的分隔符与空白让给了“原文”折叠。 */
  const MATERIAL_LABELS = new Set(["审核材料", "填写单据", "所需材料", "所需资料", "客户需提供", "提交资料", "基础材料", "审核填写材料"]);
  const MAT_OPEN = "（(《";
  const MAT_CLOSE = "）)》";
  const MAT_SEP = /[、，；,]/;
  const MAT_TAIL = /[、，；,]\s*$/;
  const materialText = (raw) => String(raw).replace(MAT_TAIL, "").trim();

  /* 括号与书名号内不切：（）()《》 记深度，深度 >0 时的分隔符只是项内标点。 */
  function materialSegments(value) {
    const segments = [];
    let depth = 0;
    let start = 0;
    for (let index = 0; index < value.length; index += 1) {
      const character = value[index];
      if (MAT_OPEN.indexOf(character) >= 0) { depth += 1; continue; }
      if (MAT_CLOSE.indexOf(character) >= 0) { if (depth > 0) depth -= 1; continue; }
      if (depth === 0 && MAT_SEP.test(character)) { segments.push(value.slice(start, index + 1)); start = index + 1; }
    }
    if (start < value.length) segments.push(value.slice(start));
    return segments;
  }

  /* 切出的项不足 2 字（“卡”“等”这类）并回上一项；首项过短则并入下一项。
     切完只剩 1 项 = 无法可靠切分，返回单条，调用方据此退回普通定义行版式（整行作一条）。 */
  function splitMaterials(value) {
    const raws = [];
    materialSegments(value).forEach((raw) => {
      if (raws.length && materialText(raw).length < 2) { raws[raws.length - 1] += raw; return; }
      raws.push(raw);
    });
    while (raws.length > 1 && materialText(raws[0]).length < 2) { raws[1] = raws[0] + raws[1]; raws.shift(); }
    return raws.map((raw) => ({ raw, text: materialText(raw) }));
  }

  const checkedSet = (cardKey, total) => {
    const stored = checkState ? checkState[cardKey] : null;
    const picked = new Set();
    (Array.isArray(stored) ? stored : []).forEach((value) => { if (Number.isInteger(value) && value >= 0 && (!total || value < total)) picked.add(value); });
    return picked;
  };

  /* 卡片 = 卡头（原文标签 + 已备齐 n/m + 清空勾选）+ 勾选项 + “原文”折叠（逐字原文）。
     卡键用“块下标.行下标”，同一业务内稳定，作为 localStorage 里的分卡下标集合的键。 */
  function materialCard(line, display, ctx, keepPrefix) {
    if (!ctx.cards || !line.info || !MATERIAL_LABELS.has(line.info.label)) return "";
    const parts = definitionParts(display, line.info, keepPrefix);
    const items = splitMaterials(parts.value);
    if (items.length < 2) return "";
    const cardKey = `${line.blockIndex}.${line.lineIndex}`;
    const picked = checkedSet(cardKey, items.length);
    /* 折叠里的“原文”= 该行去掉编号组序标后的全部字符；序标本身已由 li-num 原样渲染在卡外。 */
    const source = keepPrefix ? display : display.slice(line.info.pre.prefix.length);
    ctx.cards.push({ cardKey, total: items.length });
    const list = items.map((item, order) => {
      // 汉字约占一个字宽，ASCII 约半个；长名称跨列，保持阅读顺序与完整文字。
      const length = Array.from(item.text).reduce((sum, char) => sum + (/[^\x00-\x7f]/.test(char) ? 1 : 0.55), 0);
      const size = length > 32 ? "check-wide check-full" : length > 14 ? "check-wide" : "";
      return `<li${size ? ` class="${size}"` : ""}><label class="check-item"><input type="checkbox" data-check-index="${order}"${picked.has(order) ? " checked" : ""}><span class="check-text">${inlineText(item.text, false)}</span></label></li>`;
    }).join("");
    return `<div class="check-card" data-check-card="${escapeHtml(cardKey)}"><div class="check-head"><b class="def-label">${inlineText(parts.head, false)}</b><span class="check-progress" data-check-progress>已备齐${picked.size}/${items.length}</span><button type="button" class="check-clear" data-check-clear>清空勾选</button></div><ul class="check-list">${list}</ul><details class="check-source"><summary>原文</summary><p class="check-raw">${inlineText(source, ctx.badges)}</p></details></div>`;
  }

  /* ---------------- 核对重点：行级风险分级 ----------------
     只有段落行与列表项参与分级；小节标题（h3）、定义行、提示条、表格一律不参与，
     “三.业务完结注意事项”这类纯标题行因此既不会挂标签，也不会进右栏风险摘要。 */
  const RISK_HIGH = /不得|严禁|禁止|必须|务必|责任重大/;
  const RISK_MID = /注意|核对|确认|审核|复核|提醒/;
  const RISK_TAG = { 1: "【禁止】", 2: "【注意】" };
  const riskLevel = (text) => (RISK_HIGH.test(text) ? 1 : RISK_MID.test(text) ? 2 : 0);

  function riskModel(blocks) {
    const lines = layoutLines(blocks || []);
    const inRun = new Map();
    groupRuns(lines).forEach((run, runIndex) => run.items.forEach((index) => inRun.set(index, runIndex)));
    const marks = new Map();
    const list = [];
    lines.forEach((line, index) => {
      if (line.consumed || !line.info) return;
      const kind = lineKind(line, inRun.has(index));
      if (kind !== "para" && kind !== "li" && kind !== "li-label") return;
      const text = normLine(line.text);
      const level = riskLevel(text);
      if (!level) return;
      const anchor = list.length;
      marks.set(index, { level, anchor });
      list.push({ anchor, level, text });
    });
    return { marks, list };
  }

  function renderLine(line, kind, ctx, index) {
    const display = trimLine(line.text);
    const mark = ctx.risk ? ctx.risk.get(index) : null;
    /* 风险标识是界面附属提示：只加左色条与行首小标签，原文一个字都不动，也绝不折叠或隐藏。 */
    const riskAttr = mark ? ` class="risk-line risk-${mark.level}" data-line-anchor="${mark.anchor}"` : "";
    const riskTag = mark ? `<span class="risk-tag">${RISK_TAG[mark.level]}</span>` : "";
    if (kind === "heading") return `<h3>${inlineText(display, false)}</h3>`;
    if (kind === "notice") return `<aside class="notice-block">${inlineText(display, ctx.badges)}</aside>`;
    if (kind === "label") {
      const card = materialCard(line, display, ctx, true);
      if (card) return card;
      const parts = definitionParts(display, line.info, true);
      return `<div class="def-line${parts.stacked ? " is-stacked" : ""}"><b class="def-label">${inlineText(parts.head, false)}</b><span class="def-value">${inlineText(parts.value, ctx.badges)}</span></div>`;
    }
    if (kind === "li" || kind === "li-label") {
      const marker = display.slice(0, line.info.pre.prefix.length);
      const rest = display.slice(line.info.pre.prefix.length);
      const number = `<span class="li-num">${inlineText(marker, false)}</span>`;
      if (kind === "li") return `<li${riskAttr}>${number}<span class="li-text">${riskTag}${inlineText(rest, ctx.badges)}</span></li>`;
      const card = materialCard(line, display, ctx, false);
      if (card) return `<li>${number}${card}</li>`;
      const parts = definitionParts(display, line.info, false);
      return `<li${riskAttr}>${number}<span class="li-text def-line${parts.stacked ? " is-stacked" : ""}">${riskTag}<b class="def-label">${inlineText(parts.head, false)}</b><span class="def-value">${inlineText(parts.value, ctx.badges)}</span></span></li>`;
    }
    if (kind === "para") return `<p${riskAttr}>${riskTag}${inlineText(display, ctx.badges)}</p>`;
    return "";
  }

  /* blocks 为“同一业务、同一环节”的块序列：先按 \n 拆行统一归类与成组，再逐行出版式；
     表格与图片挂在所属块的最后一行之后输出，顺序与原文一致。 */
  function renderBlocks(blocks = [], options = {}) {
    const ctx = {
      figures: options.figures || null,
      bizName: options.bizName || "",
      badges: options.badges !== false,
      images: options.images !== false,
      risk: options.risk || null,
      cards: options.cards || null,
    };
    /* 时间线只在“办理步骤”环节的屏幕视图上启用；打印稿与其他环节保持一期版式。 */
    const timeline = options.stage === "operate" && options.enhance === true;
    const lines = layoutLines(blocks);
    const inRun = new Map();
    const bridged = new Set();
    groupRuns(lines, { bridgeImages: timeline, bridged }).forEach((run, runIndex) => run.items.forEach((index) => inRun.set(index, runIndex)));
    let html = "";
    let pendingLi = ""; // 当前这条 li 的开头部分，等它可能的节点截图挂上去之后再收尾
    let listOpen = -1;  // 当前打开的 ol 属于第几组；相邻但不同组的编号行不并成一张清单
    const flushLi = () => { if (pendingLi) { html += `${pendingLi}</li>`; pendingLi = ""; } };
    const closeList = () => { flushLi(); if (listOpen >= 0) { html += "</ol>"; listOpen = -1; } };
    lines.forEach((line, index) => {
      const kind = lineKind(line, inRun.has(index));
      /* 被桥接的纯图片块：图片挂进上一条 li，编号组不断开；图片仍走灯箱、figure 登记顺序不变。
         上一条 li 已经因为自带图片而收尾时没有可挂的节点，退回独立图片块，绝不吐出游离的 </li>。 */
      if (bridged.has(index)) {
        const shots = renderImages(blocks, line.blockIndex, ctx);
        if (!shots) return;
        if (pendingLi) { pendingLi += `<div class="step-shot">${shots}</div>`; return; }
        closeList();
        html += shots;
        return;
      }
      if (!line.consumed) {
        if (kind === "li" || kind === "li-label") {
          const run = inRun.get(index);
          if (listOpen !== run) { closeList(); html += `<ol class="step-list${timeline ? " is-timeline" : ""}">`; listOpen = run; }
          flushLi();
          pendingLi = renderLine(line, kind, ctx, index).replace(/<\/li>$/, "");
        } else {
          closeList();
          html += renderLine(line, kind, ctx, index);
        }
      } else closeList();
      if (!line.last) return;
      const extras = `${line.table ? renderTable(line.block, ctx) : ""}${renderImages(blocks, line.blockIndex, ctx)}`;
      if (extras) { closeList(); html += extras; }
    });
    closeList();
    return html;
  }

  function unique(items) {
    return [...new Set(items.map((item) => String(item || "").replace(/\s+/g, " ").trim()).filter(Boolean))];
  }

  function extractCodes(node) {
    const source = (node.section.blocks || []).map(textFor).join(" ");
    return unique(codesIn(source)).slice(0, 3);
  }

  /* 右栏风险摘要：一级优先、其次二级，各自按正文出现顺序，最多 4 条，每条截 40 字。
     取数直接走行级风险模型，因此与正文里挂标签的行、data-line-anchor 序号完全同源。 */
  function riskDigest(flow) {
    const list = riskModel((flow[2] || {}).blocks).list;
    return list.slice().sort((left, right) => left.level - right.level || left.anchor - right.anchor).slice(0, 4)
      .map((item) => ({ ...item, brief: item.text.length > 40 ? `${item.text.slice(0, 40)}…` : item.text }));
  }

  /* 分类按钮只在数量变化时重建，平时只切换当前态，避免点分类后焦点掉回 body。 */
  function renderTabs(items) {
    const buttons = tabs.querySelectorAll("button");
    if (buttons.length !== items.length) {
      tabs.innerHTML = items.map((category, index) => {
        const current = !keyword && categoryIndex === index;
        return `<button type="button" class="${current ? "active" : ""}"${current ? ` aria-current="true"` : ""} data-category-index="${index}">${escapeHtml(category.title)}</button>`;
      }).join("");
      return;
    }
    Array.prototype.forEach.call(buttons, (button, index) => {
      const current = !keyword && categoryIndex === index;
      button.classList.toggle("active", current);
      if (current) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    });
  }

  function catalogGroups(category) {
    const all = collectNodes(category, [], [categoryIndex]);
    const groups = (category.children || []).map((group) => ({ group, nodes: all.filter((item) => item.path.includes(group.title)) })).filter((item) => item.nodes.length);
    return { all, groups };
  }

  /* ================= 目录点阵（§4.7）=================
     四个点对应四个环节，实心 = 原手册在该业务里单列了这一环节的内容。
     纯 span + CSS，条目高度与触控目标不缩水；整块用 role="img" + aria-label 一次读出全文，
     hover 时同一句话作 title 出现——单个点不带任何语义，读屏不会被四个空 span 刷屏。 */
  const STAGE_SHORT = ["准备", "办理", "核对", "归档"];

  function dotsLabel(filled) {
    const on = STAGE_SHORT.filter((name, index) => filled[index]);
    const off = STAGE_SHORT.filter((name, index) => !filled[index]);
    if (!off.length) return `${STAGE_SHORT.join("、")}四个环节都有内容`;
    if (!on.length) return `${STAGE_SHORT.join("、")}四个环节原手册均未单列`;
    return `${on.join("、")}有内容，${off.join("、")}未单列`;
  }

  function renderTocDots(item) {
    const filled = flowFor(item).map((stage) => isFilled(stage));
    const label = dotsLabel(filled);
    const dots = filled.map((on) => `<span class="toc-dot${on ? " is-on" : ""}"></span>`).join("");
    return `<span class="toc-dots" role="img" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}">${dots}</span>`;
  }

  /* ================= 快速入口：常办 =================
     独立小岛，夹在目录过滤框与目录滚动区之间。类名刻意避开 .toc-group / .toc-item——
     applyTocFilter() 是按这两个类名统计「命中 N / 全部 M」的，避开即自动绕开，那边一行都不用改。
     ≤900px 目录整体进抽屉，这块跟着一起进去，形态由 CSS 决定，这里不分断点。 */
  const QUICK_LIMIT = 6;

  /* key 是结构索引，手册重生成后可能失效；渲染前静默清理，不提示、不报错、不惊动柜员。 */
  function pruneVisits(nodes) {
    const alive = new Set(nodes.map((item) => item.key));
    visits.getRecents().forEach((key) => { if (!alive.has(key)) visits.removeRecent(key); });
    visits.getStars().forEach((key) => { if (!alive.has(key)) visits.toggleStar(key); });
  }

  function quickRow(item, kind) {
    const title = cleanTitle(item.section.title);
    const main = `<button type="button" class="quick-item" data-node-key="${escapeHtml(item.key)}"><span class="quick-name">${escapeHtml(title)}</span></button>`;
    /* 取消标星只在常办组里就地提供：那几条是本期新写的 DOM，可以自由用「主按钮 + 取消按钮」的行结构，
       不必去动目录条目那个「按钮里不能再套按钮」的老结构。 */
    const drop = kind === "star" ? `<button type="button" class="quick-drop" data-unstar-key="${escapeHtml(item.key)}" aria-label="从常办移出：${escapeHtml(title)}">取消</button>` : "";
    return `<li class="quick-row">${main}${drop}</li>`;
  }

  function quickGroup(kind, label, items) {
    if (!items.length) return "";
    return `<section class="quick-group" data-quick-kind="${kind}"><p class="quick-head">${label}<span>${items.length}</span></p><ul class="quick-list">${items.map((item) => quickRow(item, kind)).join("")}</ul></section>`;
  }

  /* 没有常办（且没有版本提示）时整块不渲染，不保留空壳或最近记录。 */
  function renderQuickEntry(nodeKey) {
    const nodes = allNodes();
    pruneVisits(nodes);
    const byKey = new Map(nodes.map((item) => [item.key, item]));
    const pick = (keys) => keys.map((key) => byKey.get(key)).filter(Boolean);
    const stars = pick(visits.getStars()).slice(0, QUICK_LIMIT);
    const notice = starNotice ? `<p class="quick-alert">手册已更新，常办清单需要重新标记</p>` : "";
    const body = quickGroup("star", "常办", stars);
    return body || notice ? `${notice}${body}` : "";
  }

  /* 同分类内切业务走 updateCatalogSelection()，目录整体不重建（滚动位置、分组展开、过滤词都要留住），
     所以这块做成独立小岛单独重画（≤12 个按钮，成本可忽略），否则它会停在切分类那一刻的状态。 */
  function paintQuickEntry(nodeKey) {
    if (!shell || tocBuiltFor < 0) return;
    const host = shell.toc.querySelector("[data-quick-entry]");
    if (!host) return;
    host.innerHTML = renderQuickEntry(nodeKey);
  }

  /* 目录整体重建：只在切分类、首次进入、从搜索页返回时发生，顺带清空过滤词。 */
  function buildCatalog(category, node) {
    const { all, groups } = catalogGroups(category);
    tocTotal = all.length;
    tocFilter = "";
    tocFolded = null;
    shell.toc.innerHTML = `<div class="toc-sticky"><div class="toc-heading"><h2>目录</h2><span class="toc-count">全部${all.length}项</span></div><div class="toc-filter"><label class="sr-only" for="toc-filter-input">过滤业务</label><input id="toc-filter-input" type="search" autocomplete="off" placeholder="过滤业务，例如：存折"></div><div class="quick-entry" data-quick-entry aria-label="常办业务"></div><div class="toc-scroll">${groups.map(({ group, nodes }) => `<details class="toc-group" ${nodes.some((item) => item.key === node.key) ? "open" : ""}><summary>${escapeHtml(cleanTitle(group.title))}<small>${nodes.length} 项</small></summary><div>${nodes.map((item) => {
      const title = cleanTitle(item.section.title);
      const selected = item.key === node.key;
      const starred = visits.isStarred(item.key);
      /* 已标星的条目只加一个 class：★ 由 .toc-item.is-starred::after 纯 CSS 出，
         绕开「按钮里不能再套按钮」，目录结构与二期一字不差。 */
      return `<button type="button" class="toc-item${selected ? " selected" : ""}${starred ? " is-starred" : ""}" data-node-key="${escapeHtml(item.key)}" data-toc-title="${escapeHtml(title.toLocaleLowerCase())}"${selected ? ` aria-current="true"` : ""}><span>${escapeHtml(title)}</span>${renderTocDots(item)}</button>`;
    }).join("")}</div></details>`).join("")}</div><p class="toc-note">实际办理中，若制度、系统提示与本手册不一致，请以最新要求为准。</p></div>`;
    tocBuiltFor = categoryIndex;
    tocSelectedKey = node.key;
    applyTocFilter();
  }

  /* 同分类内切业务：只挪选中态并展开所在组，不收起其他组，也不重建任何节点。 */
  function updateCatalogSelection(node) {
    const previous = shell.toc.querySelector(".toc-item.selected");
    if (previous) { previous.classList.remove("selected"); previous.removeAttribute("aria-current"); }
    /* 必须限定 .toc-item：快速入口的 .quick-item 也带 data-node-key，且在 DOM 里排在目录之前。 */
    const target = shell.toc.querySelector(`.toc-item[data-node-key="${node.key}"]`);
    tocSelectedKey = node.key;
    if (!target) return;
    target.classList.add("selected");
    target.setAttribute("aria-current", "true");
    const group = target.closest(".toc-group");
    if (!group) return;
    if (!group.open) group.open = true;
    if (tocFolded) { // 过滤期间选中的业务，清空过滤后也要留在展开的组里
      const index = Array.prototype.indexOf.call(shell.toc.querySelectorAll(".toc-group"), group);
      if (index >= 0) tocFolded[index] = true;
    }
  }

  /* 过滤只切 class，不动 DOM 结构，所以切业务、切环节后过滤状态与滚动位置都还在。
     过滤期间临时展开有命中的分组（否则命中数与看得见的条目对不上），清空过滤时还原折叠状态。 */
  function applyTocFilter() {
    if (!shell || tocBuiltFor < 0) return;
    const term = tocFilter.trim().toLocaleLowerCase();
    const groups = shell.toc.querySelectorAll(".toc-group");
    if (term && !tocFolded) tocFolded = Array.prototype.map.call(groups, (group) => group.open);
    let hits = 0;
    Array.prototype.forEach.call(groups, (group, index) => {
      let visible = 0;
      Array.prototype.forEach.call(group.querySelectorAll(".toc-item"), (item) => {
        const matched = !term || String(item.dataset.tocTitle || "").includes(term);
        item.classList.toggle("is-hidden", !matched);
        if (matched) visible += 1;
      });
      group.classList.toggle("is-hidden", visible === 0);
      if (term && visible) group.open = true;
      else if (!term && tocFolded) group.open = tocFolded[index];
      hits += visible;
    });
    if (!term) tocFolded = null;
    const count = shell.toc.querySelector(".toc-count");
    if (count) count.textContent = term ? `命中${hits}/全部${tocTotal}项` : `全部${tocTotal}项`;
  }

  /* view 即将被整体重建：抽屉必须先收回（把分类条挪回吸顶栏），否则 #category-tabs 会被留在废弃的 DOM 里。 */
  function resetShell() {
    setAsideBar(false, null, true);
    closeTocDrawer(true);
    dockCategoryTabs(false);
    shell = null;
    tocBuiltFor = -1;
    tocSelectedKey = "";
    tocFilter = "";
    tocFolded = null;
  }

  /* 目录在宽屏作为侧栏，1100px 及以下作为抽屉；分类控件始终置于目录顶部。 */
  function ensureShell() {
    if (shell) return shell;
    dockCategoryTabs(false);
    view.innerHTML = `<div class="manual-layout"><div class="toc-dock" id="toc-drawer" aria-label="业务目录"><div class="toc-drawer-head"><span class="toc-drawer-grip" aria-hidden="true"></span><div class="toc-drawer-tabs"></div><button type="button" class="toc-drawer-close" data-toc-close>关闭</button></div><aside class="toc" aria-label="手册目录"></aside></div><div class="reader-host" id="reader-main" tabindex="-1"></div><div class="aside-host" id="tools-drawer" role="dialog" aria-label="阅读工具" aria-hidden="true" inert></div><div class="toc-scrim" data-toc-close aria-hidden="true"></div></div>`;
    const layout = view.querySelector(".manual-layout");
    const dock = layout.querySelector(".toc-dock");
    shell = { layout, dock, toc: layout.querySelector(".toc"), reader: layout.querySelector(".reader-host"), aside: layout.querySelector(".aside-host") };
    /* 弹层状态随 dock 一起新建：modalTrap 闭包绑定的是具体元素，壳重建后必须换一份。 */
    shell.dockModal = { native: false, fallbackClass: "toc-drawer-fallback", rootClass: "toc-on", trap: null, defer: (event) => lightboxOpen() || helpOpen() || deferToTocFilter(event) };
    shell.dockModal.trap = modalTrap(dock, shell.dockModal, () => escapeFromDrawer());
    shell.toolsModal = { native: false, fallbackClass: "tools-drawer-fallback", rootClass: "aside-on", trap: null, defer: () => lightboxOpen() || helpOpen() };
    shell.toolsModal.trap = modalTrap(shell.aside, shell.toolsModal, () => setAsideBar(false));
    dockCategoryTabs(true);
    syncDrawerButton();
    /* scroll 不冒泡，用捕获阶段听整块正文即可覆盖所有表格容器。 */
    if (typeof shell.reader.addEventListener === "function") shell.reader.addEventListener("scroll", () => syncTableShadows(shell.reader), true);
    return shell;
  }

  /* 轻量环节选择器与连续正文共用 activeStage，滚动时只更新选中值。 */
  function renderRail(flow) {
    return `<label class="stage-picker"><span>当前环节</span><select id="current-stage-select" aria-label="跳转办理环节">${flow.map((stage, index) => `<option value="${index}"${index === activeStage ? " selected" : ""}>${index + 1}. ${escapeHtml(stage.label)}</option>`).join("")}</select></label>`;
  }

  /* 下一环节保留在正文末尾，始终参与文档流。 */

  function renderProgressBar() {
    const next = activeStage + 1 < STAGES.length ? activeStage + 1 : -1;
    return `<nav class="step-footer" aria-label="阅读进度"><button type="button" data-back-to-toc>回到目录</button><span class="step-now">当前：第${activeStage + 1}步 · ${escapeHtml(STAGES[activeStage].label)}</span><button type="button" class="next" data-stage-index="${next}"${next < 0 ? " disabled" : ""}>${next >= 0 ? `下一环节：${escapeHtml(STAGES[next].label)}` : "已到最后一个环节"}</button></nav>`;
  }

  function renderReader(node, flow) {
    const title = cleanTitle(node.section.title);
    /* 面包屑两份：桌面出全路径，≤900px 只出「上级 › 当前」两级（另一份被 CSS 置 display:none，读屏也不会读到）。 */
    const crumbs = node.path.map(cleanTitle);
    const breadcrumbs = `<span class="crumb-full">${escapeHtml(crumbs.join(" › "))}</span><span class="crumb-short">${escapeHtml(crumbs.slice(-2).join(" › "))}</span>`;
    /* 灯箱清单 = 当前业务全部四个环节的图片，按环节顺序登记，可跨环节连续翻页。 */
    lightboxFigures = [];
    materialCards = [];
    const sections = flow.map((stage, index) => {
      const filled = isFilled(stage);
      const seat = lightboxFigures.length;
      /* 三个环节各自的增强件：准备材料 → 勾选卡，办理步骤 → 时间线 + 节点截图，核对重点 → 风险分级。 */
      const body = filled
        ? renderBlocks(stage.blocks, {
          figures: lightboxFigures,
          bizName: title,
          enhance: true,
          stage: stage.key,
          cards: stage.key === "prepare" ? materialCards : null,
          risk: stage.key === "review" ? riskModel(stage.blocks).marks : null,
        })
        : `<aside class="stage-notice">${escapeHtml(vacantNotice(stage.label))}</aside>`;
      /* 图注只在灯箱清单里补所属环节前缀，页面上的 figcaption 一字不动。
         同时给每张图记下所属环节：胶片条的角标与灯箱里的按环节筛图都取这一份，不另立索引。 */
      for (let seq = seat; seq < lightboxFigures.length; seq += 1) {
        lightboxFigures[seq].caption = `${stage.label} · ${lightboxFigures[seq].caption}`;
        lightboxFigures[seq].stage = stage.key;
        lightboxFigures[seq].stageLabel = stage.label;
      }
      return `<section class="stage-section${filled ? "" : " is-vacant"}" id="stage-${index}" data-stage-index="${index}" aria-labelledby="stage-title-${index}"><header class="document-heading"><p>第${index + 1}步</p><h2 id="stage-title-${index}">${escapeHtml(stage.label)}</h2><span>${escapeHtml(stage.hint)}</span></header><div class="document-body">${body}</div></section>`;
    }).join("");
    return `<section class="reader"><p class="breadcrumbs">${breadcrumbs}</p><div class="reader-heading"><div><h1 tabindex="-1">${escapeHtml(title)}</h1></div><div class="reader-actions">${renderStarButton(node.key)}<button type="button" data-print-page>打印</button><button type="button" data-raw-toggle aria-pressed="false">原文</button></div></div><article class="document">${sections}</article>${renderProgressBar()}</section>`;
  }

  /* 标星入口全站只有这一个（目录里的 ★ 是只读的，取消集中在快速入口的常办组），
     因此不会出现「两处星标状态不同步」那类经典 bug。 */
  const starText = (on) => (on ? "★ 已在常办" : "☆ 加入常办");

  function renderStarButton(nodeKey) {
    const on = visits.isStarred(nodeKey);
    return `<button type="button" class="star-toggle" data-toggle-star aria-pressed="${on ? "true" : "false"}">${starText(on)}</button>`;
  }

  /* 切换只重画三小块：标题旁的按钮、目录条目的 is-starred、快速入口。
     不整页 render()——那会白白重建正文并丢掉滚动位置。 */
  function paintStarState(nodeKey, on) {
    if (!shell) return;
    const button = shell.reader.querySelector("[data-toggle-star]");
    if (button && nodeKey === selectedKey) {
      button.setAttribute("aria-pressed", on ? "true" : "false");
      button.textContent = starText(on);
    }
    const item = shell.toc.querySelector(`.toc-item[data-node-key="${nodeKey}"]`);
    if (item && item.classList) item.classList.toggle("is-starred", on);
    starNotice = false; // 有交互了，版本提示这一行随下一次重画消失
    paintQuickEntry(selectedKey);
  }

  function toggleStarCurrent() {
    if (!shell || !selectedKey) return;
    const on = visits.toggleStar(selectedKey);
    paintStarState(selectedKey, on);
    announce(on ? "已加入常办" : "已移出常办");
  }

  /* 常办组里的「取消」：被点的那一行当场消失，焦点必须显式安置，不能掉回 body。 */
  function unstarFromQuick(nodeKey) {
    if (!nodeKey || !visits.isStarred(nodeKey)) return;
    visits.toggleStar(nodeKey);
    paintStarState(nodeKey, false);
    announce("已移出常办");
    if (!shell) return;
    const next = shell.toc.querySelector(".quick-drop") || shell.toc.querySelector("#toc-filter-input");
    if (!next || typeof next.focus !== "function") return;
    try { next.focus({ preventScroll: true }); } catch (error) { next.focus(); }
  }

  /* 右栏速查卡：每一条都能点回正文出处（编号 → 首次出现的徽章，材料 → 准备材料环节，风险 → 该行）。
     与面包屑重复的「所属业务」一节已删除；免责小字与交易码口径说明原样保留。 */
  /* ================= 截图胶片条（§4.5）=================
     取数就是 lightboxFigures——正文渲染时按环节顺序登记的那一份，与灯箱、与正文缩略图同源，
     所以「胶片条第 n 张」与「灯箱第 n 张」永远是同一张，不存在第二套编号。
     角标用环节短名（准备/办理/核对/归档）。无图业务返回空串，整节不渲染。 */
  function renderFilmstrip() {
    if (!lightboxFigures.length) return "";
    const shots = lightboxFigures.map((item, seat) => {
      const short = STAGE_SHORT[STAGES.findIndex((stage) => stage.key === item.stage)] || "";
      /* 角标本身 aria-hidden（它是给眼睛看的两个字），但「这张属于哪个环节」是胶片条唯一的分组信息，
         不写进可及名就等于读屏用户听到的 5 条只剩图注、分不出环节（§6.3 视觉信息须同步给读屏）。
         用完整环节名（短名是它的前缀，SC 2.5.3「可见文字须包含在可及名里」照样成立）。 */
      const badge = short ? `<span class="film-stage" aria-hidden="true">${escapeHtml(short)}</span>` : "";
      const stageName = (STAGES.find((stage) => stage.key === item.stage) || {}).label || "";
      const shotName = `${stageName ? `${stageName} · ` : ""}${item.alt || item.caption || ""}`;
      return `<button type="button" class="film-shot" data-figure-index="${seat}" aria-label="放大查看：${escapeHtml(shotName)}"><img src="${item.src}" alt="" loading="lazy">${badge}</button>`;
    }).join("");
    return `<section class="qc-film"><h3>截图<span class="qc-film-count">共${lightboxFigures.length}张</span></h3><div class="film-strip">${shots}</div></section>`;
  }

  /* 外观开关：浅 / 深 / 自动分段控件。role=radiogroup + role=radio，选中走 aria-checked，
     roving tabindex（选中那枚 0，其余 -1）由 paintModeSwitch 写；组内方向键换档在统一键盘分发的 handleModeKey。 */
  function renderModeSwitch() {
    const buttons = MODES.map((value) => `<button type="button" role="radio" data-mode-set="${value}" aria-checked="${value === mode ? "true" : "false"}" tabindex="${value === mode ? "0" : "-1"}">${MODE_LABEL[value]}</button>`).join("");
    return `<div class="mode-switch"><span class="theme-switch-label" id="mode-switch-label">外观</span><div class="mode-seg" role="radiogroup" aria-labelledby="mode-switch-label">${buttons}</div><p class="theme-hint" data-mode-hint></p></div>`;
  }

  /* 强调色开关：六枚圆点（SPEC §3）。圆点本身是装饰（aria-hidden），
     **可及名靠每枚按钮的 aria-label 中文名**，所以读屏答得出「蓝」「绿」；
     可见的中文名默认压成 0 宽（不是 display:none），hover 或键盘聚焦时就地展开，
     鼠标党同样答得出这是哪一个。点的颜色由 styles.css 按 [data-accent-set] 上色，这里不写色值。 */
  function renderAccentSwitch() {
    const buttons = ACCENTS.map((value) => `<button type="button" data-accent-set="${value}" aria-pressed="${value === accent ? "true" : "false"}" aria-label="${ACCENT_LABEL[value]}"><span class="accent-dot" aria-hidden="true"></span><span class="accent-name">${ACCENT_LABEL[value]}</span></button>`).join("");
    return `<div class="accent-switch"><span class="theme-switch-label" id="accent-switch-label">强调色</span><div class="accent-seg" role="group" aria-labelledby="accent-switch-label">${buttons}</div></div>`;
  }

  /* ================= 案头手册（§9）=================
     desk-book.js 缺失、或它判定本设备不合格（canOffer 为假）时开关整块不渲染，这几处调用全部空转。
     ≤1120px 与「减弱动态效果」下开关由 CSS 隐藏：那两种情况手册本来就不出现。 */
  const deskBook = () => {
    const desk = window.GangDeskBook;
    return desk && typeof desk.sync === "function" && typeof desk.canOffer === "function" ? desk : null;
  };

  function renderDeskSwitch() {
    const desk = deskBook();
    if (!desk || !desk.canOffer()) return "";
    const buttons = [["on", "开"], ["off", "关"]].map(([value, label]) => `<button type="button" data-desk-set="${value}" aria-pressed="${(value === "on") === deskOn ? "true" : "false"}">${label}</button>`).join("");
    return `<div class="desk-switch"><span class="theme-switch-label" id="desk-switch-label">案头手册</span><div class="theme-seg" role="group" aria-labelledby="desk-switch-label">${buttons}</div><p class="theme-hint">右栏末尾的3D装饰，不影响阅读</p></div>`;
  }

  function setDeskBook(on) {
    if (Boolean(on) === deskOn) return;
    deskOn = Boolean(on);
    storageSet("hb:desk3d", deskOn ? "on" : "off");
    if (shell) each(shell.aside.querySelectorAll("[data-desk-set]"), (button) => {
      button.setAttribute("aria-pressed", (button.dataset.deskSet === "on") === deskOn ? "true" : "false");
    });
    const desk = deskBook();
    if (desk && typeof desk.setEnabled === "function") desk.setEnabled(deskOn);
    announce(deskOn ? "案头手册已打开" : "案头手册已关闭");
  }

  /* 正文与右栏重建之后把当前业务交给 desk-book.js（它把画布搬进新右栏）；搜索页与空态交 null，它据此卸下并暂停。 */
  function syncDeskBook() {
    const desk = deskBook();
    if (!desk) return;
    const aside = shell && asideBarOpen && !keyword.trim() ? shell.aside.querySelector(".page-aside") : null;
    desk.sync(aside ? { aside, key: selectedKey, doc: shell.reader.querySelector("article.document") } : null);
  }

  function renderAside(node, flow) {
    const codes = extractCodes(node);
    const risks = riskDigest(flow);
    /* 标题上的「共 N 条」取全部一二级风险行，不是右栏只展示的那 4 条：两者不等是有意的。 */
    const riskTotal = riskModel((flow[2] || {}).blocks).list.length;
    const total = materialCards.reduce((sum, card) => sum + card.total, 0);
    const done = materialCards.reduce((sum, card) => sum + checkedSet(card.cardKey, card.total).size, 0);
    const codeSection = codes.length
      ? `<section class="qc-codes"><h3>原文中出现的编号</h3>${codes.map((code) => `<button type="button" class="transaction-code" data-code-jump="${escapeHtml(code)}" title="定位到正文中首次出现处">${escapeHtml(code)}</button>`).join("")}<p class="aside-hint">取自原文，请以系统实际交易码为准</p></section>`
      : "";
    const docSection = materialCards.length
      ? `<section class="qc-docs"><h3>材料清单</h3><button type="button" class="qc-jump" data-stage-index="0"><b data-check-summary>已备齐${done}/${total}</b><small>${materialCards.length}张勾选卡 · 点此回到准备材料</small></button></section>`
      : "";
    const riskSection = risks.length
      ? `<section class="qc-risk"><h3>风险摘要<span class="qc-risk-count">共${riskTotal}条</span></h3><ul>${risks.map((item) => `<li><button type="button" class="qc-risk-item risk-${item.level}" data-risk-anchor="${item.anchor}"><span class="risk-tag">${RISK_TAG[item.level]}</span>${escapeHtml(item.brief)}</button></li>`).join("")}</ul></section>`
      : "";
    return `<div class="tools-drawer-head"><h2>阅读工具</h2><button type="button" data-aside-close aria-label="关闭阅读工具">关闭</button></div><aside class="page-aside" id="page-aside" aria-label="本页速查卡"><h2>本业务速查</h2>${codeSection}${docSection}${riskSection}${renderFilmstrip()}<div class="aside-tools"><button type="button" class="aside-switch" data-risk-toggle aria-pressed="${riskOff ? "false" : "true"}">重点标识：${riskOff ? "关" : "开"}</button><button type="button" class="aside-switch aside-raw" data-raw-toggle aria-pressed="${rawMode ? "true" : "false"}">原文对照：${rawMode ? "开" : "关"}</button><button type="button" class="aside-print" data-print-page>打印本业务</button><label class="print-opt"><input type="checkbox" data-print-images${printImages ? " checked" : ""}><span>含截图</span></label><button type="button" class="aside-focus" data-focus-mode aria-pressed="${focusMode ? "true" : "false"}">${focusMode ? "退出专注模式" : "专注模式"}</button>${renderModeSwitch()}${renderAccentSwitch()}${renderDeskSwitch()}</div><p class="aside-source">由原文自动提取，完整表述以正文为准</p></aside>`;
  }

  /* ================= 原文对照视图（§4.9 合规兜底）=================
     当前业务的全部块按**原稿顺序**逐块渲染：只做转义与最基本的段落/表格/图片版式，
     不做四步拆分、不跑标题启发式、不加交易码徽章 / 勾选卡 / 风险标识 / 时间线。
     因此这里可见的文字 = 全部块原文按原顺序拼接，字符守恒天然成立（有专门断言证明）。
     图片不配图注：图注是本站生成的界面文本，出现在这个视图里就破坏了「未做任何整理」这句承诺。 */
  function rawImages(block) {
    const images = (block && block.images) || [];
    if (!images.length) return "";
    const figures = images.map((name, order) => {
      const source = imageUrl(name);
      return source ? `<img class="raw-image" src="${source}" alt="原稿图片（第${order + 1}张）" loading="lazy">` : "";
    }).join("");
    return figures ? `<div class="raw-images">${figures}</div>` : "";
  }

  function renderRawBlock(block) {
    const images = rawImages(block);
    if (block && block.kind === "table") {
      const rows = (block.rows || []).map((row) => `<tr>${(row || []).map((cell) => `<td>${inlineText(String(cell ?? ""), false)}</td>`).join("")}</tr>`).join("");
      return `<div class="table-frame"><div class="table-wrap"><table class="raw-table"><tbody>${rows}</tbody></table></div></div>${images}`;
    }
    const text = String((block && block.text) || "");
    return `${text ? `<p class="raw-para">${inlineText(text, false)}</p>` : ""}${images}`;
  }

  function renderRawReader(node) {
    const title = cleanTitle(node.section.title);
    const crumbs = node.path.map(cleanTitle);
    const breadcrumbs = `<span class="crumb-full">${escapeHtml(crumbs.join(" › "))}</span><span class="crumb-short">${escapeHtml(crumbs.slice(-2).join(" › "))}</span>`;
    const blocks = node.section.blocks || [];
    return `<section class="reader is-raw"><p class="breadcrumbs">${breadcrumbs}</p><div class="reader-heading"><div><h1 tabindex="-1">${escapeHtml(title)}</h1></div></div><div class="raw-bar"><p class="raw-note">原文对照视图：按原稿顺序逐块显示，未做任何整理</p><button type="button" class="raw-exit" data-raw-exit>返回整理后的视图</button></div><article class="document raw-document" data-raw-document>${blocks.map(renderRawBlock).join("")}</article></section>`;
  }

  /* 状态不持久化：刷新、切业务、进搜索页都回到整理后的视图。 */
  function setRawMode(on) {
    const want = Boolean(on);
    if (want === rawMode) return;
    if (asideBarOpen) setAsideBar(false, null, true);
    rawMode = want;
    activeStage = 0;
    suppressScrollLink();
    render();
    if (typeof window.scrollTo === "function") window.scrollTo({ top: 0, behavior: reduceMotion() ? "auto" : "smooth" });
    announce(want ? "已切换到原文对照视图：按原稿顺序逐块显示，未做任何整理" : "已返回整理后的视图");
    /* 焦点跟着走：进视图落到「返回」按钮上，退出落回右栏那枚开关。 */
    const target = shell ? (want ? shell.reader.querySelector("[data-raw-exit]") : shell.reader.querySelector("[data-raw-toggle]") || toolsButton) : null;
    if (!target || typeof target.focus !== "function") return;
    try { target.focus({ preventScroll: true }); } catch (error) { target.focus(); }
  }

  /* 只改当前态、不重建 DOM：滚动联动与点锚点都走这里，锚点条与进度条同步。 */
  function paintProgress() {
    const picker = railHost ? railHost.querySelector("#current-stage-select") : null;
    if (picker) picker.value = String(activeStage);
    each(railHost ? railHost.querySelectorAll(".rail-node") : [], (node, index) => {
      node.classList.toggle("active", index === activeStage);
      if (index === activeStage) node.setAttribute("aria-current", "true");
      else node.removeAttribute("aria-current");
    });
    if (!shell) return;
    const bar = shell.reader.querySelector(".step-footer");
    if (!bar) return;
    const now = bar.querySelector(".step-now");
    if (now) now.textContent = `当前：第${activeStage + 1}步 · ${STAGES[activeStage].label}`;
    const button = bar.querySelector("button.next");
    if (!button) return;
    const next = activeStage + 1 < STAGES.length ? activeStage + 1 : -1;
    button.setAttribute("data-stage-index", String(next));
    button.disabled = next < 0;
    button.textContent = next >= 0 ? `下一环节：${STAGES[next].label}` : "已到最后一个环节";
  }

  /* ================= 搜索结果页 =================
     打分、过滤、排序、分组、片段、无结果推荐全部在 search-module.js 里完成，
     这里只负责把它返回的纯数据变成 HTML。结果项上的 key 就是结构索引 key，
     与 data-node-key、hash 深链、selectNode() 完全同源，没有任何映射层。 */
  const SNIPPET_DESKTOP = 3;
  const SNIPPET_NARROW = 2;  // ≤900px 只出 2 条：靠 CSS 隐藏的话元素仍在 DOM 里、读屏照读
  const GROUP_PAGE = 20;     // 每组默认渲染前 20 条，其余收进「展开其余 N 条」
  let searchIndex = null;
  let searchExpanded = {};    // 分类名 -> true：本次查询里已展开的组
  let searchExpandedFor = ""; // 上面那份展开状态属于哪个查询词
  let searchCursor = -1;      // 结果列表的键盘游标；-1 = 尚未进入列表

  /* 索引懒建一次即可：手册是静态文件，一次加载后不会变。
     必须注入 app.js 自己的 cleanTitle 与 stageFor——模块内自带的那份复制品只为 Node 侧独立测试，
     不注入的话 stageLabels / editorialTail 任何一次改动都会让「片段标的环节」与正文各自漂移。 */
  function ensureSearchIndex() {
    if (!Search) return null;
    if (!searchIndex) searchIndex = Search.buildIndex(allNodes(), { cleanTitle: cleanTitle, stageOf: stageFor });
    return searchIndex;
  }

  /* 高亮一律切片，不做「转义后再正则替换」：那样查 amp / lt / quot / #39 会命中转义实体内部，
     产出 <mark>amp</mark>; 这类坏结果（原文里确有 &，例如「网点ATM清机&长短款挂/销账」）。
     切片式让转义永远发生在 <mark> 之外，实体内部不可能被命中。 */
  function markSlice(text, start, end) {
    const source = String(text || "");
    const from = Math.max(0, Math.min(source.length, Number(start) || 0));
    const to = Math.max(from, Math.min(source.length, Number(end) || 0));
    if (to <= from) return escapeHtml(source);
    return `${escapeHtml(source.slice(0, from))}<mark>${escapeHtml(source.slice(from, to))}</mark>${escapeHtml(source.slice(to))}`;
  }

  function markSnippet(snippet) {
    return `${snippet.truncatedHead ? "…" : ""}${markSlice(snippet.text, snippet.matchStart, snippet.matchEnd)}${snippet.truncatedTail ? "…" : ""}`;
  }

  /* 标题与路径没有现成的命中下标，这里自己找一次；大小写折叠改变长度时（极个别字符）
     退回纯转义，绝不拿错位的下标去切片。 */
  function markText(value, term) {
    const source = String(value || "");
    const needle = String(term || "");
    if (!needle) return escapeHtml(source);
    const lower = source.toLocaleLowerCase();
    const target = needle.toLocaleLowerCase();
    if (lower.length !== source.length) return escapeHtml(source);
    const at = lower.indexOf(target);
    if (at < 0) return escapeHtml(source);
    return markSlice(source, at, at + target.length);
  }

  const searchHeader = (term) => `<header><p class="breadcrumbs">手册搜索</p><h1>“${escapeHtml(term)}”的相关业务</h1><p>可按标题、原始正文、单据名称或交易码搜索。选择结果后会直接进入对应业务。</p></header>`;

  function renderSearchToolbar(result) {
    const parts = (result.groups || []).map((group) => `${group.category}${group.count}`);
    /* 组序按「组内最高分」排，不是按分类 tab 的书中顺序——查交易码时对公组可能排到对私之前，
       所以这里必须把「按相关度排序」写在明处。 */
    const meta = parts.length ? ` · ${parts.join(" · ")} · 按相关度排序` : "";
    return `<div class="search-toolbar"><span>找到<strong>${result.total}</strong>个结果${meta}</span><button type="button" data-clear-search>返回目录</button></div>`;
  }

  /* 结果按钮内不放任何可聚焦元素：分组标题、片段行、角标、「打开业务」都不是 button/a，也不带 tabindex。
     片段里更不能调 withCodes()——那会生成 <button> 套 <button>（HTML 非法），
     二期的 ↑↓ 会当场错乱。要展示精确命中的码，用下面这个非交互的 .code-exact-badge。 */
  function renderResultItem(item, term) {
    const badge = item.codeExact && item.matchedCode ? `<span class="code-exact-badge">交易码精确匹配${escapeHtml(item.matchedCode)}</span>` : "";
    const limit = isNarrow() ? SNIPPET_NARROW : SNIPPET_DESKTOP;
    /* sourceStage === "title" 的片段不渲染：标题就在上一行，重复一遍没有信息量。 */
    const picked = (item.snippets || []).filter((snippet) => snippet.sourceStage !== "title").slice(0, limit);
    const snippets = picked.map((snippet) => {
      /* 表格行是把单元格用空格拼起来的，读起来不像句子，角标标出来读者才不会以为是排版坏了。 */
      const label = `${snippet.sourceStageLabel || "正文"}${snippet.sourceKind === "table" ? " · 表格" : ""}`;
      return `<span class="snippet"><span class="snippet-stage" data-stage="${escapeHtml(snippet.sourceStage || "")}">${escapeHtml(label)}</span><span class="snippet-text">${markSnippet(snippet)}</span></span>`;
    }).join("");
    return `<li><button type="button" data-node-key="${escapeHtml(item.key)}"><span class="result-main"><strong class="result-title">${markText(item.title, term)}${badge}</strong><small class="result-path">${markText(item.pathText, term)}</small>${snippets ? `<span class="result-snippets">${snippets}</span>` : ""}</span><em>打开业务</em></button></li>`;
  }

  function renderResultGroup(group, term, order) {
    const id = `rg-${order}`;
    const open = searchExpanded[group.category] === true;
    /* 每组默认只渲染前 20 条：「客户」命中 77/81 项，每项挂 3 条片段就是 200 多行卡片。
       其余的不是隐藏而是压根不渲染——隐藏元素仍在 DOM 里、仍被读屏读到，↑↓ 也会停在看不见的按钮上。 */
    const shown = open ? group.results : group.results.slice(0, GROUP_PAGE);
    const rest = group.results.length - shown.length;
    const more = rest > 0 ? `<button type="button" class="result-more" data-expand-group="${escapeHtml(group.category)}">展开其余${rest}条</button>` : "";
    return `<section class="result-group" data-group="${escapeHtml(group.category)}" aria-labelledby="${id}"><h2 id="${id}" class="result-group-head">${escapeHtml(group.category)}<small>${group.count}项</small></h2><ol class="result-list">${shown.map((item) => renderResultItem(item, term)).join("")}</ol>${more}</section>`;
  }

  /* 推荐列表保留 result-list 类名：二期写死的 .result-list 选择器直接覆盖推荐项，
     「无结果 → ↓ 选推荐 → Enter 打开」闭环零改动成立。 */
  function renderNoResults(result) {
    const list = (result.suggestions || []).map((item) => `<li><button type="button" data-node-key="${escapeHtml(item.key)}"><span class="result-main"><strong class="result-title">${escapeHtml(item.title)}</strong><small class="result-path">${escapeHtml(item.pathText)}</small><span class="suggest-reason">${escapeHtml(item.reason)}</span></span><em>打开业务</em></button></li>`).join("");
    return `<div class="no-results"><h2>没有找到「${escapeHtml(result.normalized)}」相关的业务</h2><p>可尝试业务名称、单据名称、核心交易码或更短的关键词。${list ? "下面是名称最接近的业务：" : ""}</p>${list ? `<ol class="result-list suggest-list">${list}</ol>` : ""}<button type="button" data-clear-search>返回业务目录</button></div>`;
  }

  function searchAnnouncement(result) {
    if (!result.normalized) return "";
    if (!result.total) return `没有找到「${result.normalized}」，已推荐${(result.suggestions || []).length}个相近业务`;
    const parts = result.groups.map((group) => `${group.category}${group.count}个`).join("，");
    const top = result.groups[0] && result.groups[0].results[0];
    return `找到${result.total}个结果：${parts}${top && top.codeExact ? "，交易码精确匹配已置顶" : ""}`;
  }

  /* search-module.js 缺失时（拷贝漏了、被杀软拦了）的极简结果页：标题子串过滤，一条自足的降级路径。
     没有分组也没有片段，但结果按钮形态、点击委托与键盘链完全一致，控制台零报错——
     柜面场景下「功能降级但不白屏」比「新功能」重要。 */
  function renderSearchFallback(term) {
    const needle = term.toLocaleLowerCase();
    const hits = term ? allNodes().filter((node) => cleanTitle(node.section.title).toLocaleLowerCase().indexOf(needle) >= 0) : [];
    const list = hits.map((node) => `<li><button type="button" data-node-key="${escapeHtml(node.key)}"><span class="result-main"><strong class="result-title">${markText(cleanTitle(node.section.title), term)}</strong><small class="result-path">${escapeHtml(node.path.map(cleanTitle).join(" › "))}</small></span><em>打开业务</em></button></li>`).join("");
    view.innerHTML = `<section class="search-page">${searchHeader(term)}<div class="search-toolbar"><span>找到<strong>${hits.length}</strong>个结果 · 仅按业务名称匹配</span><button type="button" data-clear-search>返回目录</button></div>${hits.length ? `<ol class="result-list">${list}</ol>` : `<div class="no-results"><h2>没有找到相关业务</h2><p>可尝试业务名称、单据名称、核心交易码或更短的关键词。</p><button type="button" data-clear-search>返回业务目录</button></div>`}</section>`;
    announce(`找到${hits.length}个结果`);
  }

  /* 结果页每次整片重建：键盘游标回到「尚未进入列表」。这里刻意**不** focus()——
     回车提交后焦点应留在搜索框里方便改词重搜，第一次按 ↓ 才跳进结果列表（与目录过滤框手感一致）。 */
  function resetSearchCursor() {
    searchCursor = -1;
  }

  function renderSearch() {
    const term = keyword.trim();
    if (searchExpandedFor !== term) { searchExpanded = {}; searchExpandedFor = term; }
    const index = ensureSearchIndex();
    if (!index) { renderSearchFallback(term); resetSearchCursor(); return; }
    const result = Search.search(index, term);
    const body = result.total
      ? result.groups.map((group, order) => renderResultGroup(group, result.normalized, order)).join("")
      : renderNoResults(result);
    view.innerHTML = `<section class="search-page">${searchHeader(term)}${renderSearchToolbar(result)}${body}</section>`;
    resetSearchCursor();
    announce(searchAnnouncement(result));
  }

  /* 展开一组：重画整页，焦点落到新露出来的第一条上，键盘不至于掉回 body。 */
  function expandSearchGroup(category) {
    if (!category) return;
    searchExpanded[category] = true;
    renderSearch();
    const section = listOf(view.querySelectorAll(".result-group")).find((item) => (item.dataset ? item.dataset.group : "") === category);
    if (!section) return;
    const items = listOf(section.querySelectorAll("[data-node-key]"));
    const target = items[GROUP_PAGE] || items[items.length - 1];
    if (!target || typeof target.focus !== "function") return;
    searchCursor = searchResultButtons().indexOf(target);
    try { target.focus({ preventScroll: true }); } catch (error) { target.focus(); }
  }

  const searchResultButtons = () => listOf(view.querySelectorAll("[data-node-key]")).filter((button) => button.closest(".result-list"));

  /* 重建后的焦点归还：正文标题或正文容器；连续文档下切环节不再重建 DOM，无需为环节按钮留归还目标。 */
  function focusTarget(spec) {
    if (!spec || !shell) return null;
    if (spec.type === "reader") return shell.reader;
    if (spec.type === "title") return shell.reader.querySelector("h1") || shell.reader;
    return null;
  }

  function applyPendingFocus() {
    const spec = pendingFocus;
    pendingFocus = null;
    const target = focusTarget(spec);
    if (!target || typeof target.focus !== "function") return;
    try { target.focus({ preventScroll: true }); } catch (error) { target.focus(); }
  }

  /* ================= 截图缩略图、表格滚动提示 ================= */
  const each = (list, run) => Array.prototype.forEach.call(list || [], run);

  /* ================= 读屏播报 =================
     只在“点锚点 / 深链定位”这类明确的定位动作与搜索结果渲染时播报；
     滚动联动引起的高亮变化不播报，否则读屏会被刷屏。 */
  function announce(message) {
    if (!liveRegion) return;
    liveRegion.textContent = String(message || "");
  }

  /* ================= 工作台头：高度测量与压缩态 ================= */
  const reduceMotion = () => {
    if (typeof window.matchMedia !== "function") return false;
    try { return Boolean(window.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch (error) { return false; }
  };

  function headHeight() {
    if (!headEl) return 0;
    const value = headEl.offsetHeight;
    return typeof value === "number" && value > 0 ? value : 0;
  }

  /* 两行叠加高度写进 --head-h：表格滚动框限高、锚点滚动偏移、IO 的 rootMargin 共用同一个数。 */
  function measureHead() {
    const root = document.documentElement;
    const height = headHeight();
    if (!height || !root || !root.style || typeof root.style.setProperty !== "function") return;
    root.style.setProperty("--head-h", `${Math.round(height)}px`);
  }

  /* 压缩态用两档阈值，临界位置来回微动时不会反复切换。 */
  function syncCondensed() {
    if (!headEl || !headEl.classList) return;
    const offset = typeof window.pageYOffset === "number" ? window.pageYOffset : 0;
    const on = headEl.classList.contains("is-condensed");
    const want = on ? offset > CONDENSE_OFF : offset > CONDENSE_ON;
    if (want === on) return;
    headEl.classList.toggle("is-condensed", want);
    measureHead();
  }

  /* ================= 滚动联动：几何读数、抑制旗标、hash 回写 =================
     几何读数全部集中在 railMetrics，浏览器里读真实布局，桩测时可整体替换。 */
  let railMetrics = {
    head: () => headHeight(),
    top: (section) => (section && typeof section.getBoundingClientRect === "function" ? section.getBoundingClientRect().top : Number.NaN),
    atBottom: () => {
      const root = document.documentElement;
      if (!root || typeof root.scrollHeight !== "number") return false;
      const offset = typeof window.pageYOffset === "number" ? window.pageYOffset : 0;
      const height = typeof window.innerHeight === "number" ? window.innerHeight : 0;
      return height > 0 && offset + height >= root.scrollHeight - 2;
    },
  };

  const stageSections = () => (shell ? shell.reader.querySelectorAll(".stage-section") : []);

  /* 当前环节 = 最后一个顶边越过判定线的段落；滚到页面底部时直接取末段，
     否则最后一个很短的环节（例如只有一条口径说明）永远高亮不到。 */
  function stageFromGeometry() {
    const sections = stageSections();
    if (!sections.length) return -1;
    const line = railMetrics.head() + LINK_LINE;
    let active = 0;
    for (let index = 0; index < sections.length; index += 1) {
      const top = railMetrics.top(sections[index]);
      if (typeof top === "number" && !Number.isNaN(top) && top <= line) active = index;
    }
    if (railMetrics.atBottom()) active = sections.length - 1;
    return active;
  }

  function armIdleRelease() {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { idleTimer = 0; linkSuppressed = false; }, SCROLL_IDLE);
  }

  /* 程序化滚动（点锚点、深链进入、前进后退）期间置旗标：联动既不改高亮也不回写 hash。
     滚动停止后解除——有 scrollend 就用它，没有就靠“200ms 无 scroll 事件”兜底。 */
  function suppressScrollLink() {
    linkSuppressed = true;
    armIdleRelease();
  }

  function releaseScrollLink() {
    if (idleTimer) { clearTimeout(idleTimer); idleTimer = 0; }
    linkSuppressed = false;
  }

  function writeStageHash() {
    if (!shell || linkSuppressed || keyword.trim() || !selectedKey) return;
    lastHashWrite = Date.now();
    syncHash(true); // 只 replaceState：同业务内换环节绝不产生历史记录
  }

  /* file:// 下 Chrome 拒绝 replaceState，syncHash 会退回 location.replace（同样不新增历史记录，
     但那是一次真导航）。这种情况下把滚动联动的回写间隔放宽一档，免得连续导航被浏览器限流。 */
  function scheduleStageHash() {
    if (hashTimer) return;
    const gap = replaceStateOk ? HASH_THROTTLE : HASH_THROTTLE_SOFT;
    const wait = Math.max(0, gap - (Date.now() - lastHashWrite));
    hashTimer = setTimeout(() => { hashTimer = 0; writeStageHash(); }, wait);
  }

  function onScrollLink() {
    if (!shell || linkSuppressed || keyword.trim()) return;
    const index = stageFromGeometry();
    if (index < 0) return;
    if (index !== activeStage) { activeStage = index; paintProgress(); }
    scheduleStageHash();
  }

  function teardownObserver() {
    if (observer && typeof observer.disconnect === "function") observer.disconnect();
    observer = null;
  }

  /* 优先 IntersectionObserver：rootMargin 上边按吸顶高度内缩，下边留 55% 让判定落在视口上半区。
     IO 只作“边界跨越”的触发器，具体是哪一段仍由 stageFromGeometry 统一判定，
     两条路径（IO / 节流 scroll）因此结论完全一致。 */
  function setupObserver() {
    teardownObserver();
    if (typeof IntersectionObserver !== "function" || !shell) return;
    const sections = stageSections();
    if (!sections.length) return;
    try {
      observer = new IntersectionObserver(() => onScrollLink(), {
        rootMargin: `-${Math.round(headHeight()) + LINK_LINE}px 0px -55% 0px`,
        threshold: [0, 1],
      });
      each(sections, (section) => observer.observe(section));
    } catch (error) { observer = null; }
  }

  /* ================= 定位到某个环节 ================= */
  function scrollToStage(index, smooth) {
    if (!shell) return;
    const section = shell.reader.querySelector(`#stage-${index}`);
    if (!section) return;
    const behavior = smooth && !reduceMotion() ? "smooth" : "auto";
    if (typeof window.scrollTo !== "function" || typeof section.getBoundingClientRect !== "function") {
      if (typeof section.scrollIntoView === "function") section.scrollIntoView({ block: "start" });
      return;
    }
    /* 第 1 步就在业务标题之下，直接回页首更符合“打开这个业务”的预期。 */
    if (index <= 0) { window.scrollTo({ top: 0, behavior }); return; }
    const offset = typeof window.pageYOffset === "number" ? window.pageYOffset : 0;
    const top = section.getBoundingClientRect().top + offset - headHeight() - 8;
    window.scrollTo({ top: Math.max(0, top), behavior });
  }

  function gotoStage(index, options) {
    const opts = options || {};
    activeStage = Math.min(Math.max(0, Number(index) || 0), STAGES.length - 1);
    paintProgress();
    suppressScrollLink();
    scrollToStage(activeStage, opts.smooth !== false);
    if (opts.write !== false) writeStageHashNow();
    if (opts.announce !== false) announce(`已定位到第${activeStage + 1}步 ${STAGES[activeStage].label}`);
  }

  /* 点锚点走的是即时回写（仍是 replaceState），不排队、不受节流影响。 */
  function writeStageHashNow() {
    if (!selectedKey || keyword.trim()) return;
    if (hashTimer) { clearTimeout(hashTimer); hashTimer = 0; }
    lastHashWrite = Date.now();
    syncHash(true);
  }

  /* ================= 专注模式 =================
     跨会话记住：每次状态变化都写 hb:focus-mode，初始化时读回来并应用。
     进搜索页时的自动退出同样走这里，所以存的永远是「用户最后看到的那个状态」，不会出现存 1 而页面是关的错位。 */
  function setFocusMode(on, keepFocus) {
    focusMode = Boolean(on);
    storageSet("hb:focus-mode", focusMode ? "1" : "0");
    const root = document.documentElement;
    if (root && root.classList) root.classList.toggle("focus-mode", focusMode);
    const button = view.querySelector("[data-focus-mode]");
    if (button) {
      button.setAttribute("aria-pressed", focusMode ? "true" : "false");
      button.textContent = focusMode ? "退出专注模式" : "专注模式";
      if (keepFocus && toolsButton && typeof toolsButton.focus === "function") {
        try { toolsButton.focus({ preventScroll: true }); } catch (error) { toolsButton.focus(); }
      }
    }
    syncDrawerButton();
    measureHead();
    syncDeskBook();
  }

  function backToCatalog() {
    if (isNarrow()) { openTocDrawer(drawerButton); return; }
    setTocCollapsed(false);
    if (focusMode) setFocusMode(false, false);
    suppressScrollLink();
    if (typeof window.scrollTo === "function") window.scrollTo({ top: 0, behavior: reduceMotion() ? "auto" : "smooth" });
    const target = shell ? (shell.toc.querySelector(".toc-item.selected") || shell.toc.querySelector("#toc-filter-input")) : null;
    if (!target || typeof target.focus !== "function") return;
    try { target.focus({ preventScroll: true }); } catch (error) { target.focus(); }
  }

  /* ================= 材料勾选卡：状态读写与进度回填 ================= */
  function loadChecks(nodeKey) {
    checkNodeKey = String(nodeKey || "");
    checkState = {};
    if (!checkNodeKey) return;
    const raw = storageGet(`hb:check:${checkNodeKey}`);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return;
      Object.keys(parsed).forEach((cardKey) => {
        if (!Array.isArray(parsed[cardKey])) return;
        checkState[cardKey] = parsed[cardKey].map(Number).filter((value) => Number.isInteger(value) && value >= 0);
      });
    } catch (error) { checkState = {}; } // 存的东西被外部改坏了就当没勾过，不影响正文
  }

  function saveChecks() {
    if (!checkNodeKey) return;
    const out = {};
    Object.keys(checkState).forEach((cardKey) => { if (checkState[cardKey] && checkState[cardKey].length) out[cardKey] = checkState[cardKey]; });
    if (!Object.keys(out).length) { storageDrop(`hb:check:${checkNodeKey}`); return; }
    storageSet(`hb:check:${checkNodeKey}`, JSON.stringify(out));
  }

  function cardStat(card) {
    const boxes = card.querySelectorAll("[data-check-index]");
    let done = 0;
    each(boxes, (box) => { if (box.checked) done += 1; });
    return { done, total: boxes.length };
  }

  function paintCard(card) {
    const stat = cardStat(card);
    const label = card.querySelector("[data-check-progress]");
    if (label) label.textContent = `已备齐${stat.done}/${stat.total}`;
    return stat;
  }

  /* 右栏「材料清单」的合计随正文里的实际勾选走，不另存一份计数；
     中间态要点条上的那一段（收起时唯一能看到的材料进度）与它同源同步。 */
  function paintMaterialSummary() {
    if (!shell) return;
    const label = shell.aside.querySelector("[data-check-summary]");
    const bar = shell.aside.querySelector("[data-bar-checks]");
    if (!label && !bar) return;
    let done = 0;
    let total = 0;
    each(shell.reader.querySelectorAll(".check-card"), (card) => {
      const stat = cardStat(card);
      done += stat.done;
      total += stat.total;
    });
    if (label) label.textContent = `已备齐${done}/${total}`;
    if (bar) bar.textContent = `材料已备齐${done}/${total}`;
  }

  function toggleCheck(input) {
    const card = typeof input.closest === "function" ? input.closest(".check-card") : null;
    if (!card) return;
    const cardKey = card.dataset ? card.dataset.checkCard : "";
    const order = Number(input.dataset ? input.dataset.checkIndex : NaN);
    if (!cardKey || !Number.isInteger(order)) return;
    const picked = new Set(checkState[cardKey] || []);
    if (input.checked) picked.add(order);
    else picked.delete(order);
    checkState[cardKey] = [...picked].sort((left, right) => left - right);
    saveChecks();
    paintCard(card);
    paintMaterialSummary();
  }

  function clearCard(card) {
    each(card.querySelectorAll("[data-check-index]"), (box) => { box.checked = false; box.removeAttribute("checked"); });
    const cardKey = card.dataset ? card.dataset.checkCard : "";
    if (cardKey) delete checkState[cardKey];
    saveChecks();
    const stat = paintCard(card);
    paintMaterialSummary();
    announce(`已清空该卡的勾选，共${stat.total}项`);
  }

  /* ================= 外观三态（§10 苹果液态玻璃风）=================
     浅色 / 深色 / 自动，存 hb:mode，由 html[data-mode] 驱动全套令牌换值。
     与上一轮不同：**「自动」也显式写 data-mode="auto"**，DOM 上一眼看得出当前选的是哪一档；
     深浅那一档仍整个交给 CSS 的 prefers-color-scheme（深色块的选择器是
     :root:not([data-mode="light"])，"auto" 自然落进去），JS 不做任何配色判断。
     JS 只在「自动」时读一次系统偏好，用来把当下解析成哪一档写进说明文字与 theme-color。 */
  const MODES = ["light", "dark", "auto"];
  const MODE_LABEL = { light: "浅色", dark: "深色", auto: "自动" };
  /* 顶栏色＝页面底色（SPEC §3）：浅 #F4F5F9 / 深 #0B0C10。这是 <meta> 不是样式，
     值只能写在 JS 里，与 styles.css 里 --ground 的两个值一一对应，改一处要改两处。 */
  const MODE_THEME_COLOR = { light: "#F4F5F9", dark: "#0B0C10" };

  function systemDark() {
    if (typeof window.matchMedia !== "function") return false;
    try { return Boolean(window.matchMedia("(prefers-color-scheme: dark)").matches); } catch (error) { return false; }
  }

  /* 当前真正生效的是哪一档：自动 → 看系统，其余 → 就是它自己。 */
  function resolvedMode() {
    return mode === "auto" ? (systemDark() ? "dark" : "light") : mode;
  }

  function syncThemeColor() {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta && typeof meta.setAttribute === "function") meta.setAttribute("content", MODE_THEME_COLOR[resolvedMode()]);
  }

  function paintModeSwitch() {
    if (!shell) return;
    const resolved = resolvedMode();
    each(shell.aside.querySelectorAll("[data-mode-set]"), (button) => {
      const value = button.dataset ? button.dataset.modeSet : "";
      const on = value === mode;
      /* 分段控件是 role=radiogroup + role=radio，选中态走 aria-checked（不是 aria-pressed）。 */
      button.setAttribute("aria-checked", on ? "true" : "false");
      button.setAttribute("tabindex", on ? "0" : "-1");
      if (value !== "auto") return;
      /* 「自动」这一档单独把解析结果写进无障碍名，读屏才答得出现在到底是深还是浅。 */
      button.setAttribute("aria-label", `自动，跟随系统：${MODE_LABEL[resolved]}`);
    });
    const hint = shell.aside.querySelector("[data-mode-hint]");
    if (hint) hint.textContent = mode === "auto" ? `跟随系统，当前为${MODE_LABEL[resolved]}` : `已固定为${MODE_LABEL[mode]}`;
  }

  function applyMode(next, save) {
    mode = MODES.indexOf(String(next)) >= 0 ? String(next) : "light";
    const root = document.documentElement;
    if (root && typeof root.setAttribute === "function") root.setAttribute("data-mode", mode);
    syncThemeColor();
    if (save) storageSet("hb:mode", mode);
    paintModeSwitch();
  }

  function setMode(next) {
    if (String(next) === mode) return;
    applyMode(next, true);
    announce(mode === "auto" ? `外观已切换为自动，跟随系统：${MODE_LABEL[resolvedMode()]}` : `外观已切换为${MODE_LABEL[mode]}`);
  }

  /* ================= 六个强调色（§10 表 A）=================
     blue 蓝（默认）/ green 绿 / indigo 靛 / orange 橙 / pink 粉 / teal 青，
     存 hb:accent，由 html[data-accent] 驱动强调色组换值。
     换的只有 --accent* 那一组与三团光晕；面、线、字、圆角、阴影六套共用，
     所以这里不需要重渲染任何节点，写一个属性就够了。
     旧版本存过的六套粉彩名（sky/mint/lilac/candy/mist/meadow）与更早的 p1/p2/p3
     都不在这张表里，会被下面的校验一律落回 blue。 */
  const ACCENTS = ["blue", "green", "indigo", "orange", "pink", "teal"];
  const ACCENT_LABEL = { blue: "蓝", green: "绿", indigo: "靛", orange: "橙", pink: "粉", teal: "青" };

  function paintAccentSwitch() {
    if (!shell) return;
    each(shell.aside.querySelectorAll("[data-accent-set]"), (button) => {
      const value = button.dataset ? button.dataset.accentSet : "";
      button.setAttribute("aria-pressed", value === accent ? "true" : "false");
    });
  }

  /* ================= 标签页图标随强调色换（§10.14c）=================
     静态的 assets/brand/favicon.svg 负责首帧（固定是默认蓝那一组）；强调色一换，这里就地把
     <link rel="icon"> 的 href 改成同一张图的 data URI，只换渐变两端的颜色。
     **首帧用的一定是静态文件、不是这里生成的那一张**，这是可接受的：默认蓝进来的人看不出差别，
     切过强调色的人会在 app.js 跑到这一步时（初始化里 applyAccent 那一趟）看到它换过去。

     两端的颜色**不写常量表，直接读计算值**：`getComputedStyle(root).getPropertyValue("--accent")`
     读的是层叠算完之后的值，不需要碰 `document.styleSheets.cssRules`——后者在 `file://` 下取不到，
     前者取得到（2026-09-23 实测）。这样 styles.css 里改了令牌，favicon 自动跟着改，**颜色这一项**不存在两处维护。
     （**几何是两份**：这里的 faviconSvg() 与 assets/brand/favicon.svg 是两份拷贝，改一处不会同步另一处，
     必须逐字同构——当前唯一差别是渐变 id。做不成一份，因为 favicon 必须自包含、`file://` 下又不能 fetch。）
     只接受纯十六进制（六套强调色、prefers-contrast 那一档写的都是十六进制），读不到或不是十六进制
     就落回默认蓝——顺带也堵死了「把别的字符串拼进 SVG」这条路。

     **只挂在强调色这一个钩子上**：深浅切换不重画。同一个强调色的浅/深两组值差得极小
     （蓝 #007AFF / #0A84FF、绿 #34C759 / #30D158 …），16px 的标签页图标上分辨不出来，
     不值得再往 applyMode 与 prefers-color-scheme 监听上各挂一份。

     `<link rel="icon">` 找不到时静默跳过（比如有人把 index.html 那一行删了），不报错。 */
  const FAVICON_ACCENT_FALLBACK = ["#007AFF", "#5AC8FA"];
  const HEX_COLOR = /^#[0-9a-fA-F]{3,8}$/;

  /* 与 assets/brand/favicon.svg 同一张图：圆角 229（1024 的 22.37%，iOS 比例），
     线条整块缩到 84% 居中（81.92 = (1024 - 1024 × .84) / 2），路径逐字取自屋主的 brand-icon.svg。 */
  function faviconSvg(from, to) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">' +
      '<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' + from + '"/><stop offset="1" stop-color="' + to + '"/>' +
      '</linearGradient>' +
      '<rect width="1024" height="1024" rx="229" fill="url(#g)"/>' +
      '<g transform="translate(81.92 81.92) scale(.84)" fill="none" stroke="#fff" stroke-width="78" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M512 274C438 215 342 208 230 244v548c110-36 205-29 282 30"/>' +
      '<path d="M512 274c74-59 170-66 282-30v548c-110-36-205-29-282 30"/>' +
      '<path d="M512 274v548"/>' +
      '<path d="M286 405c72-24 135-18 206 18M286 540c72-24 135-18 206 18M286 675c72-24 135-18 206 18" stroke-width="52"/>' +
      '<path d="M738 405c-72-24-135-18-206 18M738 540c-72-24-135-18-206 18M738 675c-72-24-135-18-206 18" stroke-width="52"/>' +
      '</g></svg>';
  }

  function syncFavicon() {
    const link = document.querySelector('link[rel="icon"]');
    if (!link || typeof link.setAttribute !== "function") return;
    let from = FAVICON_ACCENT_FALLBACK[0];
    let to = FAVICON_ACCENT_FALLBACK[1];
    try {
      const style = window.getComputedStyle(document.documentElement);
      const a = String(style.getPropertyValue("--accent") || "").trim();
      const b = String(style.getPropertyValue("--accent-2") || "").trim();
      if (HEX_COLOR.test(a)) from = a;
      if (HEX_COLOR.test(b)) to = b;
    } catch (error) { /* 取不到计算值就用默认蓝那一组，图标照样在 */ }
    /* encodeURIComponent 是必须的：`#` 不转义会被当成 URL 的片段分隔符，data URI 从第一个颜色那里就被截断。 */
    link.setAttribute("href", "data:image/svg+xml," + encodeURIComponent(faviconSvg(from, to)));
  }

  function applyAccent(next, save) {
    accent = ACCENTS.indexOf(String(next)) >= 0 ? String(next) : "blue";
    const root = document.documentElement;
    if (root && typeof root.setAttribute === "function") root.setAttribute("data-accent", accent);
    if (save) storageSet("hb:accent", accent);
    paintAccentSwitch();
    /* 属性刚写上去，getComputedStyle 会同步触发一次样式重算，读到的就是新强调色。 */
    syncFavicon();
  }

  function setAccent(next) {
    if (String(next) === accent) return;
    applyAccent(next, true);
    announce(`强调色已切换为${ACCENT_LABEL[accent]}`);
  }

  /* 系统在深浅之间翻转时：自动态下页面由 CSS 自己换过去，这里只需要把说明文字与 theme-color 重写一遍。 */
  (function watchColorScheme() {
    if (typeof window.matchMedia !== "function") return;
    try {
      const query = window.matchMedia("(prefers-color-scheme: dark)");
      const onChange = () => { if (mode === "auto") { paintModeSwitch(); syncThemeColor(); } };
      if (typeof query.addEventListener === "function") query.addEventListener("change", onChange);
      else if (typeof query.addListener === "function") query.addListener(onChange);
    } catch (error) { /* 用不了就只是说明文字停在进入页面那一刻的判断上，配色本身照常跟随 */ }
  })();

  /* ================= 打印「含截图」 ================= */
  function setPrintImages(on, save) {
    printImages = Boolean(on);
    if (save) storageSet("hb:print-images", printImages ? "1" : "0");
    if (!shell) return;
    const box = shell.aside.querySelector("[data-print-images]");
    if (box && box.checked !== printImages) box.checked = printImages;
  }

  /* ================= 重点标识开关 ================= */
  function applyRiskOff(on, save) {
    riskOff = Boolean(on);
    const root = document.documentElement;
    if (root && root.classList) root.classList.toggle("risk-off", riskOff);
    if (save) storageSet("hb:risk-off", riskOff ? "1" : "0");
    if (!shell) return;
    const button = shell.aside.querySelector("[data-risk-toggle]");
    if (!button) return;
    button.setAttribute("aria-pressed", riskOff ? "false" : "true");
    button.textContent = `重点标识：${riskOff ? "关" : "开"}`;
  }

  /* ================= 阅读工具抽屉 =================
     所有宽度共用一个面板、焦点陷阱和关闭入口；进入新业务前先收起。 */
  function setAsideBar(on, trigger, silent) {
    const host = shell ? shell.aside : null;
    const want = Boolean(on && host);
    const wasOpen = asideBarOpen;
    asideBarOpen = want;
    endAsideClosing();
    if (want) {
      if (tocDrawerOpen()) closeTocDrawer(true);
      if (searchOpen()) setSearchOpen(false, false);
      asideOpener = trigger || asideOpener || toolsButton;
      host.removeAttribute("inert");
      host.setAttribute("aria-hidden", "false");
      host.setAttribute("aria-modal", "true");
      host.classList.add("is-open");
      if (!wasOpen) modalShow(host, shell.toolsModal);
      const close = host.querySelector("[data-aside-close]");
      if (!wasOpen && close) {
        void host.offsetHeight;
        try { close.focus({ preventScroll: true }); } catch (error) { close.focus(); }
      }
    } else {
      if (host) {
        if (modalIsOpen(host)) modalHide(host, shell.toolsModal);
        host.classList.remove("is-open");
        host.removeAttribute("aria-modal");
      }
      if (document.documentElement) document.documentElement.classList.remove("aside-on");
      const opener = asideOpener;
      asideOpener = null;
      if (wasOpen && !silent && opener && typeof opener.focus === "function") {
        try { opener.focus({ preventScroll: true }); } catch (error) { opener.focus(); }
      }
      if (host) { host.setAttribute("inert", ""); host.setAttribute("aria-hidden", "true"); }
    }
    syncToolsButton();
    syncDeskBook();
  }

  /* 动效收尾保留为兼容钩子；阅读布局的工具面板不在关闭后留可聚焦内容。 */

  function endAsideClosing() {
    if (asideClosingTimer) { clearTimeout(asideClosingTimer); asideClosingTimer = 0; }
    const host = asideClosing;
    asideClosing = null;
    if (host && host.classList) host.classList.remove("is-closing");
  }

  if (view && typeof view.addEventListener === "function") view.addEventListener("animationend", (event) => {
    if (asideClosing && event.target === asideClosing && event.animationName === "aside-drawer-out") endAsideClosing();
  });

  /* ================= 定位到正文某一行：程序化滚动 + 短暂高亮 ================= */
  function flashNode(element) {
    if (!element || !element.classList) return;
    if (shell) each(shell.reader.querySelectorAll(".is-flash"), (old) => old.classList.remove("is-flash"));
    if (reduceMotion()) return; // 减少动态偏好下只定位，不闪
    element.classList.add("is-flash");
    if (flashTimer) clearTimeout(flashTimer);
    flashTimer = setTimeout(() => { flashTimer = 0; element.classList.remove("is-flash"); }, 1500);
  }

  function scrollElementTo(element) {
    const behavior = reduceMotion() ? "auto" : "smooth";
    if (typeof window.scrollTo !== "function" || typeof element.getBoundingClientRect !== "function") {
      if (typeof element.scrollIntoView === "function") element.scrollIntoView({ block: "start" });
      return;
    }
    const offset = typeof window.pageYOffset === "number" ? window.pageYOffset : 0;
    const top = element.getBoundingClientRect().top + offset - headHeight() - 16;
    window.scrollTo({ top: Math.max(0, top), behavior });
  }

  /* 走 U1 的程序化滚动路径：置抑制旗标，滚动期间联动既不改高亮也不回写 hash；
     落点所在环节手工同步一次，锚点条与地址栏仍与正文一致。 */
  function locateLine(element, message) {
    if (!element) return false;
    /* 落点在「原文」折叠里时先展开，免得滚过去只看到一行标题。 */
    const box = typeof element.closest === "function" ? element.closest("details") : null;
    if (box && !box.open) box.open = true;
    suppressScrollLink();
    scrollElementTo(element);
    const section = typeof element.closest === "function" ? element.closest(".stage-section") : null;
    const index = section && section.dataset ? Number(section.dataset.stageIndex) : Number.NaN;
    if (Number.isInteger(index) && index !== activeStage) { activeStage = index; paintProgress(); writeStageHashNow(); }
    flashNode(element);
    if (message) announce(message);
    return true;
  }

  function locateCode(code) {
    if (!shell || !code) return;
    const badge = shell.reader.querySelector(`.code-badge[data-code="${code}"]`);
    if (!badge) { announce(`正文中未找到编号${code}`); return; }
    locateLine(badge, `已定位到编号${code}在正文中的首次出现处`);
  }

  function locateRisk(anchor) {
    if (!shell) return;
    const line = shell.reader.querySelector(`[data-line-anchor="${anchor}"]`);
    if (!line) return;
    locateLine(line, "已定位到核对重点中的该条");
  }

  /* 比瓦片还小的截图不放大：换成按原始尺寸居中显示，避免 44×30 的小图被撑成一片糊。 */
  function markSmallFigures(root) {
    if (!root || typeof root.querySelectorAll !== "function") return;
    each(root.querySelectorAll("img"), (image) => {
      const figure = typeof image.closest === "function" ? image.closest(".source-figure") : null;
      if (!figure) return;
      const check = () => { if (image.naturalWidth && (image.naturalWidth < 360 || image.naturalHeight < 250)) figure.classList.add("is-small"); };
      if (image.complete) check();
      else if (typeof image.addEventListener === "function") image.addEventListener("load", check);
    });
  }

  /* 表格左右还能滚时，在容器对应一侧显示渐隐阴影。 */
  function syncTableShadows(root) {
    if (!root || typeof root.querySelectorAll !== "function") return;
    each(root.querySelectorAll(".table-wrap"), (wrap) => {
      const frame = wrap.parentNode;
      if (!frame || !frame.classList) return;
      const left = wrap.scrollLeft || 0;
      const room = (wrap.scrollWidth || 0) - (wrap.clientWidth || 0);
      frame.classList.toggle("can-left", left > 2);
      frame.classList.toggle("can-right", room > 2 && left < room - 2);
    });
  }

  /* ================= 交易码一键复制（特性检测在点击时进行，便于降级实测） ================= */
  function copyStatus(message) {
    if (typeof document.createElement !== "function") return;
    let region = document.querySelector("#copy-status");
    if (!region) {
      region = document.createElement("div");
      region.id = "copy-status";
      region.className = "sr-only";
      region.setAttribute("role", "status");
      region.setAttribute("aria-live", "polite");
      document.body.appendChild(region);
    }
    region.textContent = message;
  }

  /* 气泡本身 aria-hidden，读屏只走上面那个 live region；下面三段只管看得见的那一半（§12）。 */
  function showBubble(badge, message) {
    copyStatus(`${badge.dataset ? badge.dataset.code || "" : ""} ${message}`.trim());
    if (typeof document.createElement !== "function") return;
    /* 连续复制：旧气泡照旧立即删（不等它淡出），新的重新弹。 */
    each(document.querySelectorAll(".copy-bubble"), (old) => { if (old.parentNode) old.parentNode.removeChild(old); });
    const bubble = document.createElement("span");
    bubble.className = "copy-bubble";
    bubble.setAttribute("aria-hidden", "true");
    bubble.textContent = message;
    badge.appendChild(bubble);
    placeBubble(badge, bubble);
    if (copyTimer) clearTimeout(copyTimer);
    copyTimer = setTimeout(() => { copyTimer = 0; dismissBubble(bubble); }, 1400);
  }

  /* 碰撞处理：插入后量一次。
     左右：离视口边不足 8px（或被裁切它的横滚表格挡住）就整体平移回来，平移量写进 --bubble-shift，
     CSS 里箭头按同一个量反向移，仍指着徽章中心；箭头不许越过圆角悬空，所以平移量另有上限。
     上下：上方放不下（视口顶、吸顶栏底边、裁切它的祖先顶边——徽章可能在 .table-wrap 里）且下方更宽裕，就翻到徽章下方。
     量不到尺寸的环境（桩测、display:none 的祖先）什么都不做，气泡照改前那样居中在上方。 */
  function placeBubble(badge, bubble) {
    if (typeof badge.getBoundingClientRect !== "function" || !bubble.classList || !bubble.style || typeof bubble.style.setProperty !== "function") return;
    const width = bubble.offsetWidth || 0;
    const height = bubble.offsetHeight || 0;
    if (!width || !height) return;
    const gap = 8;
    const anchor = badge.getBoundingClientRect();
    const bounds = viewBounds(badge);
    const root = document.documentElement;
    const viewWidth = (root && root.clientWidth) || window.innerWidth || 0;
    const minLeft = Math.max(gap, bounds.left + 4);
    const maxRight = Math.min(viewWidth - gap, bounds.right - 4);
    const naturalLeft = anchor.left + anchor.width / 2 - width / 2;
    let shift = 0;
    if (width > maxRight - minLeft || naturalLeft < minLeft) shift = minLeft - naturalLeft;
    else if (naturalLeft + width > maxRight) shift = maxRight - (naturalLeft + width);
    const reach = Math.max(0, width / 2 - 5 - 6); // 箭头半宽 5px + 圆角余量 6px
    shift = Math.max(-reach, Math.min(reach, shift));
    // 不取整：offsetWidth 本身已取整，再四舍五入到整像素，最多会比 8px 边距多贴近 0.75px（2552 档实测 7.28px）
    if (Math.abs(shift) >= 0.5) bubble.style.setProperty("--bubble-shift", `${shift.toFixed(2)}px`);
    const above = anchor.top - bounds.top;
    const below = bounds.bottom - anchor.bottom;
    if (above < height + gap && below > above) bubble.classList.add("is-below");
  }

  /* 到点先播 .14s 淡出再删：animationend 与兜底计时器谁先到算谁（后台标签页里动画可能不跑、事件不来）。
     减弱动效下没有淡出，到点直接删。 */
  function dismissBubble(bubble) {
    if (!bubble.parentNode) return;
    const drop = () => { if (bubble.parentNode) bubble.parentNode.removeChild(bubble); };
    if (reduceMotion() || !bubble.classList || typeof bubble.addEventListener !== "function") { drop(); return; }
    bubble.addEventListener("animationend", (event) => { if (event.target === bubble && event.animationName === "copy-bubble-out") drop(); });
    bubble.classList.add("is-leaving");
    copyTimer = setTimeout(() => { copyTimer = 0; drop(); }, 140 + 100);
  }

  /* 一个元素在屏幕上真能被看见的那块区域：视口，扣掉吸顶栏，
     再与每一个会裁切它的祖先（overflow 不是 visible：.table-wrap、横滚的胶片条、速查卡抽屉自己的滚动框……）的内框求交。
     复制气泡拿它判「上方会不会被挡」，灯箱拿它判缩略图是否完整可见。 */
  function viewBounds(node) {
    const root = document.documentElement;
    const bounds = {
      top: headHeight(),
      left: 0,
      right: (root && root.clientWidth) || window.innerWidth || 0,
      bottom: (root && root.clientHeight) || window.innerHeight || 0,
    };
    if (typeof window.getComputedStyle !== "function") return bounds;
    for (let el = node ? node.parentElement : null; el && el !== document.body && el !== root; el = el.parentElement) {
      let style = null;
      try { style = window.getComputedStyle(el); } catch (error) { style = null; }
      if (!style || (style.overflowX === "visible" && style.overflowY === "visible")) continue;
      if (typeof el.getBoundingClientRect !== "function") continue;
      const box = el.getBoundingClientRect();
      const top = box.top + (el.clientTop || 0);
      const left = box.left + (el.clientLeft || 0);
      bounds.top = Math.max(bounds.top, top);
      bounds.left = Math.max(bounds.left, left);
      bounds.right = Math.min(bounds.right, left + (el.clientWidth || box.width));
      bounds.bottom = Math.min(bounds.bottom, top + (el.clientHeight || box.height));
    }
    return bounds;
  }

  function legacyCopy(code) {
    if (typeof document.createElement !== "function" || typeof document.execCommand !== "function") return false;
    const area = document.createElement("textarea");
    area.value = code;
    area.setAttribute("readonly", "");
    area.style.cssText = "position:fixed;top:0;left:-9999px;opacity:0;";
    document.body.appendChild(area);
    let done = false;
    try { area.select(); done = document.execCommand("copy"); } catch (error) { done = false; }
    if (area.parentNode) area.parentNode.removeChild(area);
    return done;
  }

  function selectForManualCopy(badge) {
    try {
      const selection = window.getSelection ? window.getSelection() : null;
      const range = document.createRange ? document.createRange() : null;
      if (selection && range) { range.selectNodeContents(badge); selection.removeAllRanges(); selection.addRange(range); }
    } catch (error) { /* 选不中就只留提示 */ }
    showBubble(badge, "请手动复制");
  }

  function copyCode(badge) {
    const code = (badge.dataset && badge.dataset.code) || String(badge.textContent || "").trim();
    if (!code) return;
    const fallback = () => { if (legacyCopy(code)) showBubble(badge, "已复制"); else selectForManualCopy(badge); };
    const clipboard = typeof navigator !== "undefined" ? navigator.clipboard : null; // 点击时检测：file:// 下不是安全上下文，这里会取不到
    if (clipboard && typeof clipboard.writeText === "function") {
      try {
        const result = clipboard.writeText(code);
        if (result && typeof result.then === "function") { result.then(() => showBubble(badge, "已复制"), fallback); return; }
        showBubble(badge, "已复制");
        return;
      } catch (error) { /* 落到兜底 */ }
    }
    fallback();
  }

  /* ================= 站内灯箱 ================= */
  const lightboxOpen = () => Boolean(lightbox && (lightbox.open || lightbox.hasAttribute("open")));

  function ensureLightboxShell() {
    if (!lightbox || lightbox.querySelector(".lightbox-inner")) return;
    lightbox.innerHTML = `<div class="lightbox-inner"><div class="lightbox-top"><p class="lightbox-count"></p><button type="button" class="lightbox-close" data-lightbox="close">关闭</button></div><div class="lightbox-stage" data-lightbox="zoom"><img class="lightbox-image" src="" alt=""></div><p class="lightbox-caption"></p><div class="lightbox-filter" data-lightbox-filter></div><div class="lightbox-actions"><button type="button" data-lightbox="prev">上一张</button><button type="button" class="lightbox-zoom" data-lightbox="zoom">放大</button><a class="lightbox-raw" href="" target="_blank" rel="noopener">在新标签页打开原图</a><button type="button" data-lightbox="next">下一张</button></div></div>`;
  }

  /* ================= 灯箱：按环节筛图（§4.5）=================
     筛选只改「翻页在哪几张之间循环」，不改 lightboxFigures 本身，也不改任何一张的下标——
     胶片条、正文缩略图与深链里的 seat 因此始终指同一张。 */
  function lightboxScope() {
    const all = lightboxFigures.map((item, seat) => seat);
    if (!lightboxStage) return all;
    return all.filter((seat) => lightboxFigures[seat].stage === lightboxStage);
  }

  /* 出现在当前业务图片里的环节，按四步原序排列。 */
  function lightboxStages() {
    return STAGES.filter((stage) => lightboxFigures.some((item) => item.stage === stage.key));
  }

  function paintLightboxFilter() {
    if (!lightbox) return;
    const host = lightbox.querySelector("[data-lightbox-filter]");
    if (!host) return;
    const stages = lightboxStages();
    /* 只有一张图时筛不出名堂，整条不渲染（也就不进焦点链）。 */
    if (lightboxFigures.length < 2 || !stages.length) { host.innerHTML = ""; return; }
    const chip = (value, label, count) => `<button type="button" data-lightbox-stage="${escapeHtml(value)}" aria-pressed="${value === lightboxStage ? "true" : "false"}">${escapeHtml(label)}<span class="sr-only">，${count}张</span></button>`;
    const chips = stages.map((stage) => chip(stage.key, stage.label, lightboxFigures.filter((item) => item.stage === stage.key).length)).join("");
    host.innerHTML = `<span class="filter-head">按环节筛图</span>${chip("", "全部", lightboxFigures.length)}${chips}`;
  }

  /* 换筛选：当前这张不在新范围里就落到范围内的第一张，绝不留在一张「筛掉了却还显示着」的图上。 */
  function setLightboxStage(value) {
    const next = String(value || "");
    if (next === lightboxStage) return;
    if (!lightboxSettled()) return; // 收场动画期间不理；开场动画直接到终态（§12）
    lightboxStage = next;
    const scope = lightboxScope();
    if (!scope.length) { lightboxStage = ""; }
    else if (scope.indexOf(lightboxIndex) < 0) { lightboxIndex = scope[0]; lightboxZoom = 1; }
    /* 筛选条是整片重画的：不接住焦点，被点的那枚 chip 当场消失、焦点掉回 body，
       键盘用户的下一次 Tab 得从弹层开头重来（§6.1 焦点归还）。
       重画前记下焦点是否在这条里，重画后还给「等价元素」= 现在处于按下态的那一枚。 */
    const filterHost = lightbox ? lightbox.querySelector("[data-lightbox-filter]") : null;
    const keepFocus = Boolean(filterHost) && typeof filterHost.contains === "function"
      && filterHost.contains(document.activeElement);
    paintLightboxFilter();
    if (keepFocus && filterHost) {
      const back = filterHost.querySelector(`[data-lightbox-stage="${lightboxStage}"]`);
      if (back && typeof back.focus === "function") {
        try { back.focus({ preventScroll: true }); } catch (error) { back.focus(); }
      }
    }
    paintLightbox();
    const label = lightboxStage ? (lightboxStages().find((stage) => stage.key === lightboxStage) || {}).label : "";
    announce(lightboxStage ? `已按环节筛图：${label}，共${lightboxScope().length}张` : `已恢复全部截图，共${lightboxFigures.length}张`);
  }

  /* 预取的是「筛选范围内的前后两张」——正是按上一张/下一张真会走到的那两张。 */
  function prefetchNeighbours() {
    if (typeof Image !== "function") return;
    const scope = lightboxScope();
    const at = scope.indexOf(lightboxIndex);
    if (at < 0 || scope.length < 2) return;
    [-1, 1].forEach((step) => {
      const item = lightboxFigures[scope[(at + step + scope.length) % scope.length]];
      if (item) new Image().src = item.src;
    });
  }

  /* 只更新内容不重建结构：翻页时焦点仍留在“上一张/下一张”按钮上。 */
  function paintLightbox() {
    if (!lightbox) return;
    const item = lightboxFigures[lightboxIndex] || {};
    const total = lightboxFigures.length;
    const scope = lightboxScope();
    const seat = scope.indexOf(lightboxIndex);
    const set = (selector, run) => { const node = lightbox.querySelector(selector); if (node) run(node); };
    /* 未筛选时文案与 v1.5.0 一字不差；筛了才在前面挂上环节名，说明「第 n 张」是在哪个范围里数的。 */
    set(".lightbox-count", (node) => {
      node.textContent = lightboxStage
        ? `${item.stageLabel || ""} · 第${Math.max(0, seat) + 1}/共${scope.length}张`
        : `第${lightboxIndex + 1}/共${total}张`;
    });
    set(".lightbox-image", (node) => {
      node.setAttribute("src", item.src || "");
      node.setAttribute("alt", item.alt || "");
      node.classList.toggle("is-zoomed", lightboxZoom > 1);
    });
    set(".lightbox-caption", (node) => { node.textContent = item.caption || ""; });
    set(".lightbox-raw", (node) => node.setAttribute("href", item.src || ""));
    set(".lightbox-zoom", (node) => { node.textContent = lightboxZoom > 1 ? "缩小" : "放大"; });
    each(lightbox.querySelectorAll("button"), (button) => {
      const role = button.dataset ? button.dataset.lightbox : "";
      if (role === "prev" || role === "next") button.disabled = scope.length < 2;
    });
    prefetchNeighbours();
  }

  /* 只收“真的能被 Tab 停住”的元素：折叠分组里的目录条目没有布局盒，浏览器本来就跳过它们，
     把它们算进循环会让首尾判定落在看不见的元素上，焦点就从弹层里漏出去了（实测过）。
     量不到布局的环境（桩测）一律视为可用，行为与改动前一致。 */
  function focusablesIn(root) {
    const found = [];
    const usable = (node) => {
      /* 折叠 <details> 里的内容在 Chrome 下仍有布局盒（content-visibility:hidden），
         getClientRects / offsetParent 都分辨不出来，只有 checkVisibility 与「能否聚焦」一致（实测过）。 */
      if (typeof node.checkVisibility === "function") return node.checkVisibility();
      if (typeof node.closest === "function") {
        const box = node.closest("details");
        if (box && !box.open && node !== box.querySelector("summary")) return false;
      }
      if (typeof node.getClientRects !== "function") return true;
      const rects = node.getClientRects();
      return Boolean(rects && rects.length);
    };
    each(root.querySelectorAll('button, a[href], input, select, textarea, summary, [tabindex]'), (node) => {
      if (node.disabled || node.tabIndex < 0 || node.closest("[inert]")) return;
      if (usable(node)) found.push(node);
    });
    return found;
  }

  /* ---------------- 原生 dialog / 回退覆盖层：灯箱与快捷键说明面板共用的双路径 ----------------
     有 showModal 就用原生（自带焦点陷阱与 Esc），没有就退回同一元素的覆盖层 + 手写焦点陷阱；
     两条路径都在打开时记下触发元素，关闭后把焦点还回去。 */
  const modalIsOpen = (element) => Boolean(element && (element.open || element.hasAttribute("open")));

  function modalTrap(element, state, close) {
    return (event) => {
      /* 合成态的按键归输入法（选词的回车、取消选词的 Esc、翻候选的方向键）。这一行是**防御性的**、不是修漏洞：
         合成中过滤框里一定有字（拼音就在框里），defer 本来就会把 Esc 让给过滤框，实测改前抽屉也不会被关掉；
         补上只为与统一分发、过滤框那两处口径一致（design-proposal.md §11.4）。 */
      if (event.isComposing || event.keyCode === 229) return;
      if (!modalIsOpen(element) || state.native) return;
      /* 同时开着两层弹层时，这个陷阱是注册在 document 捕获阶段的，会抢在统一分发之前跑；
         已经被更上层处理掉的按键在这里一律不再动第二次（顺序谁先谁后，结论都一样）。 */
      if (event.defaultPrevented) return;
      /* state.defer 让弹层把某几下按键让给它内部的部件先消化（目录抽屉用它把「过滤框里的 Esc」让出去）；
         不设这个钩子的弹层（灯箱、快捷键说明）行为完全不变。 */
      if (typeof state.defer === "function" && state.defer(event)) return;
      if (event.key === "Escape") { event.preventDefault(); close(); return; }
      if (event.key !== "Tab") return;
      const items = focusablesIn(element);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !element.contains(active))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (active === last || !element.contains(active))) { event.preventDefault(); first.focus(); }
    };
  }

  function modalShow(element, state) {
    state.native = typeof element.showModal === "function";
    if (state.native) { if (!element.open) element.showModal(); }
    else {
      element.classList.add(state.fallbackClass);
      element.setAttribute("open", "");
      document.addEventListener("keydown", state.trap, true);
    }
    if (document.documentElement && document.documentElement.classList) document.documentElement.classList.add(state.rootClass);
  }

  function modalHide(element, state) {
    if (state.native) {
      try { element.close(); } catch (error) { element.removeAttribute("open"); }
    } else {
      element.removeAttribute("open");
      element.classList.remove(state.fallbackClass);
      document.removeEventListener("keydown", state.trap, true);
    }
  }

  const lightboxModal = { native: false, fallbackClass: "lightbox-fallback", rootClass: "lightbox-on", trap: null };
  lightboxModal.trap = modalTrap(lightbox, lightboxModal, () => closeLightbox());

  function openLightbox(seat, trigger) {
    if (!lightbox || !lightboxFigures.length) return;
    /* 上一次的收场还没播完（dialog 仍开着）：先把它收到终态，再按全新的一次打开走。 */
    if (lightboxMotion) { if (lightboxMotion.phase === "close") finishLightboxClose(); else stopLightboxMotion(); }
    ensureLightboxShell();
    lightboxIndex = Math.min(Math.max(0, Number(seat) || 0), lightboxFigures.length - 1);
    lightboxZoom = 1;
    lightboxStage = ""; // 每次打开都从「全部」起步：上一次的筛选不该埋伏在下一次点开的那张图上
    lightboxOpener = trigger || null;
    paintLightboxFilter();
    paintLightbox();
    modalShow(lightbox, lightboxModal);
    const close = lightbox.querySelector(".lightbox-close");
    if (close && typeof close.focus === "function") close.focus();
    beginLightboxOpen(trigger);
  }

  /* 幂等：无论关闭是我们发起的还是浏览器用 Esc 关的（close 事件），收尾都只有效一次。
     浏览器自己直接关掉的（拦不住的 cancel，如部分安卓返回手势）也走到这里，所以进行中的动效、幽灵与类名在这里一并清掉；
     灯箱此刻又开着（关完马上被重新打开，迟到的 close 事件）就不碰它的新动效。 */
  function afterLightboxClose() {
    if (!lightboxOpen()) stopLightboxMotion();
    if (document.documentElement && document.documentElement.classList) document.documentElement.classList.remove("lightbox-on");
    const opener = lightboxOpener;
    lightboxOpener = null;
    if (!opener || typeof opener.focus !== "function") return;
    try { opener.focus({ preventScroll: true }); } catch (error) { opener.focus(); }
  }

  /* immediate 为真：当场关、不播动画——render() 马上要重建正文，缩略图即将消失，没有落点可缩回。 */
  function closeLightbox(immediate) {
    if (!lightbox || !lightboxOpen()) return;
    /* 关闭中又来一次（再按 Esc、安卓再按返回）：不开第二段动画，直接到终态。
       打开动画还没播完就被关：同样直接到终态——从半路倒着缩回去那一段不值得它带来的复杂度。 */
    if (immediate || lightboxMotion || !lightboxCanMove()) { finishLightboxClose(); return; }
    beginLightboxClose();
  }

  function finishLightboxClose() {
    stopLightboxMotion();
    modalHide(lightbox, lightboxModal);
    afterLightboxClose(); // 不等 close 事件：个别内核不派发它，收尾必须当场做完
  }

  /* ================= 灯箱开合动效：原位放大 / 缩回（design-proposal.md §12）=================
     打开：一个临时「幽灵」从缩略图的可见框变形到大图的最终框，卡片与遮罩同时淡入；
     关闭：缩回当前这张图在页面上完整可见的那枚缩略图，找不到（或正放大着）就只淡出。
     幽灵是「外框 overflow:hidden + 内图反向缩放」：外框从缩略图框非等比缩放到大图框、管裁切；
     内图始终按原图比例——起点是 cover + 顶端对齐裁出来的那一块，终点是整张大图。两只框每一帧都在这里按缓动算好
     （关键帧之间 linear），所以裁切逐帧精确，而且只动 transform。
     没有 Element.prototype.animate、走回退覆盖层（没有 showModal）、减弱动效：一律瞬开瞬关，与改前一字不差。 */
  const LIGHTBOX_OPEN_MS = 260;
  const LIGHTBOX_CLOSE_MS = 200;
  const LIGHTBOX_DECODE_WAIT = 250;
  const LIGHTBOX_EASING = "cubic-bezier(.2,.8,.2,1)";
  const LIGHTBOX_MOTION_CLASSES = ["is-veiled", "is-entering", "is-leaving", "is-morphing"];
  const lightboxEase = cubicBezier(0.2, 0.8, 0.2, 1);

  function lightboxCanMove() {
    return Boolean(lightbox && lightboxModal.native && typeof lightbox.animate === "function") && !reduceMotion();
  }

  /* 与 CSS cubic-bezier() 同一条曲线：给时间进度 x 解出参数 t（牛顿迭代，不收敛再二分），返回位移进度 y。 */
  function cubicBezier(x1, y1, x2, y2) {
    const cx = 3 * x1;
    const bx = 3 * (x2 - x1) - cx;
    const ax = 1 - cx - bx;
    const cy = 3 * y1;
    const by = 3 * (y2 - y1) - cy;
    const ay = 1 - cy - by;
    const curveX = (t) => ((ax * t + bx) * t + cx) * t;
    const curveY = (t) => ((ay * t + by) * t + cy) * t;
    const slopeX = (t) => (3 * ax * t + 2 * bx) * t + cx;
    return (x) => {
      if (!(x > 0)) return 0;
      if (x >= 1) return 1;
      let t = x;
      for (let i = 0; i < 8; i += 1) {
        const error = curveX(t) - x;
        if (Math.abs(error) < 1e-6) return curveY(t);
        const slope = slopeX(t);
        if (Math.abs(slope) < 1e-6) break;
        t -= error / slope;
      }
      let low = 0;
      let high = 1;
      t = x;
      for (let i = 0; i < 40; i += 1) {
        const value = curveX(t);
        if (Math.abs(value - x) < 1e-6) break;
        if (value < x) low = t; else high = t;
        t = (low + high) / 2;
      }
      return curveY(t);
    };
  }

  /* 一张 <img> 在屏幕上的两只框：clip＝看得见的那一块（cover 裁过的缩略图就是元素框本身），
     image＝整张原图按它当前的 object-fit / object-position 摆出来的框（cover 时比 clip 大、伸到框外）。
     没解码、没布局、量出 0 尺寸都返回 null——调用方据此退回只淡入淡出。 */
  function imageFrames(img) {
    if (!img || typeof img.getBoundingClientRect !== "function") return null;
    const naturalWidth = img.naturalWidth || 0;
    const naturalHeight = img.naturalHeight || 0;
    const box = img.getBoundingClientRect();
    if (!naturalWidth || !naturalHeight || !(box.width > 0) || !(box.height > 0)) return null;
    let fit = "fill";
    let position = "50% 50%";
    try {
      const style = window.getComputedStyle(img);
      fit = style.objectFit || fit;
      position = style.objectPosition || position;
    } catch (error) { /* 量不到样式就按默认的 fill 算 */ }
    let scaleX = box.width / naturalWidth;
    let scaleY = box.height / naturalHeight;
    if (fit === "cover") { scaleX = Math.max(scaleX, scaleY); scaleY = scaleX; }
    else if (fit === "contain") { scaleX = Math.min(scaleX, scaleY); scaleY = scaleX; }
    else if (fit === "none") { scaleX = 1; scaleY = 1; }
    else if (fit === "scale-down") { scaleX = Math.min(1, scaleX, scaleY); scaleY = scaleX; }
    const w = naturalWidth * scaleX;
    const h = naturalHeight * scaleY;
    const parts = String(position).trim().split(/\s+/);
    const offset = (token, room) => {
      const value = parseFloat(token);
      if (!isFinite(value)) return room / 2;
      return /%$/.test(token) ? room * value / 100 : value;
    };
    const image = { x: box.left + offset(parts[0], box.width - w), y: box.top + offset(parts[1] || parts[0], box.height - h), w, h };
    const left = Math.max(box.left, image.x);
    const top = Math.max(box.top, image.y);
    const right = Math.min(box.left + box.width, image.x + w);
    const bottom = Math.min(box.top + box.height, image.y + h);
    if (!(right - left > 0.5) || !(bottom - top > 0.5)) return null;
    return { clip: { x: left, y: top, w: right - left, h: bottom - top }, image };
  }

  /* 两头必须是同一张图（宽高比差 2% 以内），否则内图的比例在半路会变形——那种情况宁可只淡入淡出。 */
  const sameShape = (a, b) => Math.abs(a.image.w / a.image.h - b.image.w / b.image.h) <= 0.02 * (b.image.w / b.image.h);

  /* 逐帧算好两只框：外框 translate + 非等比 scale 到 clip，内图在外框坐标里反向缩放，落在 image 上。
     base 是幽灵在布局里的真实框（打开时 = 大图最终框，关闭时 = 大图当前框），变换原点一律左上角。 */
  function morphFrames(from, to, base, duration) {
    const steps = Math.max(12, Math.round(duration / 14));
    const mix = (a, b, e) => a + (b - a) * e;
    const box = (a, b, e) => ({ x: mix(a.x, b.x, e), y: mix(a.y, b.y, e), w: Math.max(0.5, mix(a.w, b.w, e)), h: Math.max(0.5, mix(a.h, b.h, e)) });
    const outer = [];
    const inner = [];
    for (let i = 0; i <= steps; i += 1) {
      const e = lightboxEase(i / steps);
      const clip = box(from.clip, to.clip, e);
      const image = box(from.image, to.image, e);
      const sx = clip.w / base.w;
      const sy = clip.h / base.h;
      outer.push({ transform: `translate(${clip.x - base.x}px, ${clip.y - base.y}px) scale(${sx}, ${sy})` });
      inner.push({ transform: `translate(${(image.x - clip.x) / sx}px, ${(image.y - clip.y) / sy}px) scale(${image.w / clip.w}, ${image.h / clip.h})` });
    }
    return { outer, inner };
  }

  /* 幽灵放在 dialog 里（顶层之内才压得住遮罩与卡片），position:fixed、不接点击、读屏读不到，动画完就删。 */
  function runLightboxGhost(motion, image, from, to, base, duration, fill) {
    const ghost = document.createElement("div");
    ghost.className = "lightbox-ghost";
    ghost.setAttribute("aria-hidden", "true");
    ghost.style.cssText = `left:${base.x}px;top:${base.y}px;width:${base.w}px;height:${base.h}px;`;
    const picture = document.createElement("img");
    picture.setAttribute("alt", "");
    picture.decoding = "sync"; // 同一张图此刻已解码在缓存里，别让幽灵第一帧是空的
    picture.style.cssText = `width:${base.w}px;height:${base.h}px;`;
    picture.setAttribute("src", image.currentSrc || image.src || "");
    ghost.appendChild(picture);
    lightbox.appendChild(ghost);
    motion.ghost = ghost;
    const frames = morphFrames(from, to, base, duration);
    const timing = { duration, easing: "linear", fill };
    motion.anims.push(ghost.animate(frames.outer, timing), picture.animate(frames.inner, timing));
  }

  /* 大图解码好才量得到最终框：最多等 limit 毫秒，超时或出错就 ready=false。 */
  function whenImageReady(img, limit, done) {
    let settled = false;
    let timer = 0;
    const finish = (ready) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      done(ready);
    };
    timer = setTimeout(() => finish(false), limit);
    if (typeof img.decode === "function") {
      try { img.decode().then(() => finish(true), () => finish(false)); } catch (error) { finish(false); }
      return;
    }
    if (img.complete && img.naturalWidth) { finish(true); return; }
    if (typeof img.addEventListener !== "function") return; // 只剩计时器那一路
    img.addEventListener("load", () => finish(true));
    img.addEventListener("error", () => finish(false));
  }

  /* 收尾两条路：领头那段动画的 finish 事件，或兜底计时器（后台标签页里动画时钟可能停着、事件不来）；
     谁先到算谁，且只认本段——被别的路径抢先收掉的，这里什么都不做。 */
  function watchLightboxMotion(motion, duration, done) {
    const finish = () => { if (lightboxMotion === motion) done(); };
    const lead = motion.anims[0];
    if (lead) lead.onfinish = finish;
    motion.timer = setTimeout(finish, duration + 120);
  }

  /* 直接到终态：取消动画（fill 的残留随之撤掉）、删幽灵、清类名、清计时器。幂等，任何时候调都安全。 */
  function stopLightboxMotion() {
    const motion = lightboxMotion;
    lightboxMotion = null;
    if (lightbox && lightbox.classList) LIGHTBOX_MOTION_CLASSES.forEach((name) => lightbox.classList.remove(name));
    if (!motion) return;
    if (motion.timer) clearTimeout(motion.timer);
    motion.anims.forEach((anim) => {
      try { anim.onfinish = null; anim.cancel(); } catch (error) { /* 已结束的动画 cancel 也无害，兜住就行 */ }
    });
    if (motion.ghost && motion.ghost.parentNode) motion.ghost.parentNode.removeChild(motion.ghost);
  }

  /* 动效进行中来了翻页 / 缩放 / 筛图：开场直接到终态（大图马上要换，幽灵叼着的还是旧图）；
     收场期间一概不理——灯箱已经在关了。返回 false 表示这次操作作废。 */
  function lightboxSettled() {
    if (!lightboxMotion) return true;
    if (lightboxMotion.phase === "close") return false;
    stopLightboxMotion();
    return true;
  }

  function beginLightboxOpen(trigger) {
    if (!lightboxCanMove()) return;
    const image = lightbox.querySelector(".lightbox-image");
    const inner = lightbox.querySelector(".lightbox-inner");
    if (!image || !inner) return;
    /* 这时 showModal 已经挂上 html.lightbox-on：Windows 经典滚动条被收掉、页面横移的那几像素已经发生，
       这里强制排版量出来的就是用户眼前那一只缩略图。 */
    const source = trigger && typeof trigger.querySelector === "function" ? trigger.querySelector("img") : null;
    const from = imageFrames(source);
    const motion = { phase: "wait", anims: [], ghost: null, timer: 0 };
    lightboxMotion = motion;
    lightbox.classList.add("is-veiled");
    whenImageReady(image, LIGHTBOX_DECODE_WAIT, (ready) => {
      if (lightboxMotion !== motion) return;
      const to = ready ? imageFrames(image) : null;
      playLightboxOpen(motion, inner, image, from && to && sameShape(from, to) ? { from, to } : null);
    });
  }

  function playLightboxOpen(motion, inner, image, morph) {
    motion.phase = "open";
    try {
      lightbox.classList.remove("is-veiled");
      lightbox.classList.add("is-entering");
      motion.anims.push(inner.animate([{ opacity: 0 }, { opacity: 1 }], { duration: LIGHTBOX_OPEN_MS, easing: LIGHTBOX_EASING, fill: "backwards" }));
      if (morph) {
        lightbox.classList.add("is-morphing");
        runLightboxGhost(motion, image, morph.from, morph.to, morph.to.clip, LIGHTBOX_OPEN_MS, "backwards");
      }
    } catch (error) { stopLightboxMotion(); return; }
    watchLightboxMotion(motion, LIGHTBOX_OPEN_MS, stopLightboxMotion);
  }

  /* 缩回的落点：优先打开时的触发元素（它仍指着当前这张、且完整可见），否则页面上第一枚指着当前这张且完整可见的。
     返回缩略图里的 <img>——它的框才是用户看得见的那一块。 */
  function lightboxThumb(index) {
    const opener = lightboxOpener;
    const candidates = [];
    if (opener && opener.dataset && Number(opener.dataset.figureIndex) === index) candidates.push(opener);
    each(document.querySelectorAll(`[data-figure-index="${index}"]`), (node) => { if (node !== opener) candidates.push(node); });
    for (let i = 0; i < candidates.length; i += 1) {
      const picture = typeof candidates[i].querySelector === "function" ? candidates[i].querySelector("img") : null;
      if (picture && fullyInView(picture)) return picture;
    }
    return null;
  }

  /* 「完整可见」：矩形整个落在 viewBounds 里——视口之内、不被吸顶栏与 ≤600px 的 tab bar 盖住、
     也不被裁切它的祖先（横滚的胶片条、速查卡抽屉的滚动框）裁掉。折叠着、display:none 的量出来是 0×0，天然不算。 */
  function fullyInView(node) {
    if (!node || typeof node.getBoundingClientRect !== "function") return false;
    const rect = node.getBoundingClientRect();
    if (!(rect.width > 0) || !(rect.height > 0)) return false;
    const bounds = viewBounds(node);
    const slack = 1; // clientWidth / clientHeight 是取整过的
    return rect.top >= bounds.top - slack && rect.left >= bounds.left - slack
      && rect.bottom <= bounds.bottom + slack && rect.right <= bounds.right + slack;
  }

  function beginLightboxClose() {
    const inner = lightbox.querySelector(".lightbox-inner");
    const image = lightbox.querySelector(".lightbox-image");
    if (!inner) { finishLightboxClose(); return; }
    /* 先摘 html.lightbox-on 再量：滚动条回来造成的横移发生在遮罩还不透明的时候，缩回的落点才准。 */
    const root = document.documentElement;
    if (root && root.classList) root.classList.remove("lightbox-on");
    /* 放大态、或当前这张（用户可能在灯箱里翻过页）在页面上找不到完整可见的缩略图：只淡出。 */
    const from = lightboxZoom > 1 ? null : imageFrames(image);
    const to = from ? imageFrames(lightboxThumb(lightboxIndex)) : null;
    const motion = { phase: "close", anims: [], ghost: null, timer: 0 };
    lightboxMotion = motion;
    try {
      lightbox.classList.add("is-leaving");
      motion.anims.push(inner.animate([{ opacity: 1 }, { opacity: 0 }], { duration: LIGHTBOX_CLOSE_MS, easing: LIGHTBOX_EASING, fill: "forwards" }));
      if (from && to && sameShape(from, to)) {
        lightbox.classList.add("is-morphing");
        runLightboxGhost(motion, image, from, to, from.clip, LIGHTBOX_CLOSE_MS, "forwards");
      }
    } catch (error) { finishLightboxClose(); return; }
    watchLightboxMotion(motion, LIGHTBOX_CLOSE_MS, finishLightboxClose);
  }

  /* ================= 快捷键说明面板：静态清单，走灯箱同一套双路径 ================= */
  const helpOpen = () => modalIsOpen(helpDialog);
  let helpOpener = null;
  const helpModal = { native: false, fallbackClass: "hotkey-fallback", rootClass: "help-on", trap: null };
  helpModal.trap = modalTrap(helpDialog, helpModal, () => closeHelp());

  function openHelp(trigger) {
    if (!helpDialog || helpOpen()) return;
    helpOpener = trigger || document.activeElement || null;
    modalShow(helpDialog, helpModal);
    const close = helpDialog.querySelector(".hotkey-close");
    if (close && typeof close.focus === "function") close.focus();
  }

  function closeHelp() {
    if (!helpDialog || !helpOpen()) return;
    modalHide(helpDialog, helpModal);
    afterHelpClose();
  }

  function afterHelpClose() {
    if (document.documentElement && document.documentElement.classList) document.documentElement.classList.remove("help-on");
    const opener = helpOpener;
    helpOpener = null;
    if (!opener || typeof opener.focus !== "function") return;
    try { opener.focus({ preventScroll: true }); } catch (error) { opener.focus(); }
  }

  if (helpDialog) {
    helpDialog.addEventListener("close", afterHelpClose);
    helpDialog.addEventListener("click", (event) => {
      if (event.target.closest("[data-hotkey='close']") || event.target === helpDialog) closeHelp();
    });
    helpDialog.addEventListener("keydown", (event) => {
      if (event.isComposing || event.keyCode === 229) return;
      if (event.key === "Escape") { event.preventDefault(); closeHelp(); }
      else if (event.key === "?" || (event.key === "/" && event.shiftKey)) { event.preventDefault(); closeHelp(); }
    });
  }

  /* ================= 目录：宽屏可收起侧栏、窄屏模态抽屉 ================= */
  const tocDrawerOpen = () => Boolean(shell && shell.dock && modalIsOpen(shell.dock));

  /* 分类控件保留同一节点；重建壳时暂存顶栏，随后立即放回目录插槽。 */
  function dockCategoryTabs(into) {
    if (!tabs) return;
    const slot = into && shell && shell.dock ? shell.dock.querySelector(".toc-drawer-tabs") : null;
    const target = slot || headTop;
    if (!target || typeof target.appendChild !== "function" || tabs.parentNode === target) return;
    target.appendChild(tabs);
  }

  function syncDrawerButton() {
    const on = isNarrow() ? tocDrawerOpen() : !tocCollapsed && !focusMode;
    if (drawerButton) {
      drawerButton.setAttribute("aria-expanded", on && Boolean(shell) ? "true" : "false");
      drawerButton.setAttribute("aria-label", on && shell ? "收起业务目录" : "打开业务目录");
      drawerButton.disabled = !categories().length;
    }
    if (shell && shell.dock) {
      const hidden = isNarrow() ? !tocDrawerOpen() : tocCollapsed || focusMode;
      if (hidden) shell.dock.setAttribute("inert", ""); else shell.dock.removeAttribute("inert");
      shell.dock.setAttribute("aria-hidden", hidden ? "true" : "false");
    }
    syncToolsButton();
  }

  function syncToolsButton() {
    if (!toolsButton) return;
    toolsButton.setAttribute("aria-expanded", asideBarOpen ? "true" : "false");
    toolsButton.disabled = !categories().length;
  }

  function setTocCollapsed(on) {
    tocCollapsed = Boolean(on);
    if (tocCollapsed && shell && shell.dock.contains(document.activeElement) && drawerButton) drawerButton.focus();
    document.documentElement.classList.toggle("toc-collapsed", tocCollapsed);
    syncDrawerButton();
    measureHead();
  }

  function restoreReadingPage() {
    if (shell && !keyword.trim()) return;
    keyword = "";
    render();
    syncHash(true);
  }

  function openTocDrawer(trigger) {
    restoreReadingPage();
    if (!shell || !shell.dock || tocDrawerOpen()) return;
    if (!isNarrow()) { if (focusMode) setFocusMode(false, false); setTocCollapsed(false); return; }
    shell.dock.removeAttribute("inert");
    shell.dock.setAttribute("aria-hidden", "false");
    tocDrawerOpener = trigger || drawerButton || null;
    dockCategoryTabs(true);
    shell.dock.setAttribute("role", "dialog");
    shell.dock.setAttribute("aria-modal", "true");
    if (asideBarOpen) setAsideBar(false, null, true);
    if (searchOpen()) setSearchOpen(false, false);
    modalShow(shell.dock, shell.dockModal);
    syncDrawerButton();
    /* 抽屉的显隐是 CSS 过渡出来的：先强制一次样式/布局回流，等面板真的可见再移焦点，
       否则 focus() 落在还是 visibility:hidden 的元素上会被浏览器丢弃（实测过）。 */
    if (typeof shell.dock.offsetHeight === "number") void shell.dock.offsetHeight;
    const close = shell.dock.querySelector(".toc-drawer-close");
    if (close && typeof close.focus === "function") {
      try { close.focus({ preventScroll: true }); } catch (error) { close.focus(); }
    }
  }

  /* silent=true 用于 view 即将重建的场合：只收拢结构，不做焦点归还。 */
  function closeTocDrawer(silent) {
    if (!tocDrawerOpen()) { dockCategoryTabs(Boolean(shell)); syncDrawerButton(); return; }
    modalHide(shell.dock, shell.dockModal);
    shell.dock.removeAttribute("role");
    shell.dock.removeAttribute("aria-modal");
    if (document.documentElement && document.documentElement.classList) document.documentElement.classList.remove("toc-on");
    dockCategoryTabs(true);
    syncDrawerButton();
    const opener = tocDrawerOpener;
    tocDrawerOpener = null;
    if (silent || !opener || typeof opener.focus !== "function") return;
    try { opener.focus({ preventScroll: true }); } catch (error) { opener.focus(); }
  }

  /* 抽屉的焦点陷阱跑在 document 捕获阶段，会先于统一分发拿到 Esc；这里让它照同一条优先级链往下走，
     所以无论「陷阱先跑」（浏览器）还是「统一分发先跑」（无捕获语义的桩环境），关掉的都是最上面那一层。 */
  function escapeFromDrawer() {
    if (lightboxOpen()) { closeLightbox(); return; }
    if (helpOpen()) { closeHelp(); return; }
    closeTocDrawer();
  }

  /* 过滤框里还有过滤词时的 Esc 归过滤框自己（只清词），抽屉的陷阱不抢；
     框已经清空后的下一次 Esc 才轮到抽屉。捕获阶段先跑的陷阱因此不会越过这一层。 */
  function deferToTocFilter(event) {
    if (event.key !== "Escape") return false;
    const target = event.target;
    if (!target || typeof target.closest !== "function" || !target.closest("#toc-filter-input")) return false;
    return Boolean(target.value || tocFilter);
  }

  if (drawerButton) drawerButton.addEventListener("click", () => {
    const wasSearching = Boolean(keyword);
    restoreReadingPage();
    if (!isNarrow()) {
      if (focusMode) { setFocusMode(false, false); setTocCollapsed(false); }
      else setTocCollapsed(wasSearching ? false : !tocCollapsed);
      return;
    }
    if (tocDrawerOpen()) closeTocDrawer(); else openTocDrawer(drawerButton);
  });

  if (toolsButton) toolsButton.addEventListener("click", () => {
    restoreReadingPage();
    setAsideBar(!asideBarOpen, toolsButton);
  });

  /* ================= 吸顶栏上的搜索展开（≤900px）=================
     展开时搜索框占满整行，品牌缩写、业务名与目录按钮让位；收起按钮与 Esc 都能还原。 */
  const searchOpen = () => Boolean(headTop && headTop.classList && headTop.classList.contains("is-search-open"));

  function setSearchOpen(on, keepFocus) {
    if (on) {
      if (tocDrawerOpen()) closeTocDrawer(true);
      if (asideBarOpen) setAsideBar(false, null, true);
    }
    if (!headTop || !headTop.classList) return;
    headTop.classList.toggle("is-search-open", Boolean(on));
    if (searchToggle) {
      searchToggle.setAttribute("aria-expanded", on ? "true" : "false");
      searchToggle.setAttribute("aria-label", on ? "收起搜索框" : "展开搜索框");
      searchToggle.textContent = on ? "收起" : "搜索";
    }
    measureHead();
    /* 展开后焦点直接落进输入框；收起后还给「搜索」按钮本身（keepFocus=false 用于提交后的静默收起）。 */
    const target = on ? searchInput : (keepFocus ? searchToggle : null);
    if (!target || typeof target.focus !== "function") return;
    try { target.focus({ preventScroll: true }); } catch (error) { target.focus(); }
  }

  if (searchToggle) searchToggle.addEventListener("click", () => setSearchOpen(!searchOpen(), true));

  /* 当前业务名：只写吸顶栏上那一处，>900px 时该元素 display:none，桌面上不可见也不占位。 */
  function syncHeadBiz(text) {
    if (!headBiz) return;
    headBiz.textContent = String(text || "");
  }

  /* 翻页只在当前筛选范围内循环；范围里只剩一张时上一张/下一张已被置灰，这里再兜一次。 */
  function stepLightbox(step) {
    if (!lightboxSettled()) return;
    const scope = lightboxScope();
    if (scope.length < 2) return;
    const at = scope.indexOf(lightboxIndex);
    lightboxIndex = at < 0
      ? scope[step > 0 ? 0 : scope.length - 1]
      : scope[(at + step + scope.length) % scope.length];
    lightboxZoom = 1;
    paintLightbox();
  }

  function toggleZoom(level) {
    if (!lightboxSettled()) return;
    lightboxZoom = level === undefined ? (lightboxZoom > 1 ? 1 : 2) : level;
    paintLightbox();
  }

  if (lightbox) {
    lightbox.addEventListener("close", afterLightboxClose);
    /* 原生 cancel（安卓返回手势、部分内核的 Esc 路径）：拦得住就改走带动画的关闭；拦不住（cancelable 为 false）
       浏览器会直接关掉并派 close 事件，收尾在 afterLightboxClose 里（连进行中的动画、幽灵、类名一起清）。 */
    lightbox.addEventListener("cancel", (event) => {
      if (!event.cancelable || !lightboxCanMove()) return;
      event.preventDefault();
      closeLightbox();
    });
    lightbox.addEventListener("click", (event) => {
      const chip = event.target.closest("[data-lightbox-stage]");
      if (chip) { setLightboxStage(chip.dataset.lightboxStage); return; }
      const control = event.target.closest("[data-lightbox]");
      if (!control) { if (event.target === lightbox) closeLightbox(); return; } // 点遮罩关闭
      const role = control.dataset.lightbox;
      if (role === "close") closeLightbox();
      else if (role === "prev") stepLightbox(-1);
      else if (role === "next") stepLightbox(1);
      else if (role === "zoom") toggleZoom();
    });
    lightbox.addEventListener("keydown", (event) => {
      if (event.isComposing || event.keyCode === 229) return;
      /* 原生 dialog 自己也处理 Esc；这里显式关一次，两条路径都不依赖对方。 */
      if (event.key === "Escape") { event.preventDefault(); closeLightbox(); }
      else if (event.key === "ArrowLeft") { event.preventDefault(); stepLightbox(-1); }
      else if (event.key === "ArrowRight") { event.preventDefault(); stepLightbox(1); }
      else if (event.key === "+" || event.key === "=") { event.preventDefault(); toggleZoom(2); }
      else if (event.key === "-") { event.preventDefault(); toggleZoom(1); }
    });
  }

  function render() {
    if (asideBarOpen) setAsideBar(false, null, true);
    const items = categories();
    if (lightboxOpen()) closeLightbox(true); // 正文要重建，灯箱里的触发元素即将消失：当场关，不播缩回动画（没有落点）
    if (!items.length) { resetShell(); teardownObserver(); view.innerHTML = `<section class="no-results"><h1>手册内容暂未载入</h1><p>请确认employee-handbook.js与网页在同一文件夹后再刷新。</p></section>`; syncDeskBook(); return; }
    categoryIndex = Math.min(Math.max(0, categoryIndex), items.length - 1);
    renderTabs(items);
    /* 框里的字被改写（深链、切分类、选中业务）：浮层画的是旧词，一并收起。 */
    if (searchInput.value !== keyword) { searchInput.value = keyword; closeSuggest(); }
    syncSearchClear();
    if (keyword.trim()) {
      /* 搜索页没有右栏，专注模式的那枚浮动「退出」按钮也就跟着消失了——
         鼠标用户在这里会被困住（只剩 Esc 一条出路），所以进搜索页一律先退出专注模式。
         原文对照同理：它的「返回」按钮也在正文区，进搜索页一并退出。 */
      if (focusMode) setFocusMode(false, false);
      rawMode = false;
      rawModeKey = "";
      resetShell();
      teardownObserver();
      if (railHost) railHost.innerHTML = ""; // 搜索页没有业务上下文，锚点条整条收起
      renderSearch();
      syncHeadBiz(`搜索：${keyword.trim()}`);
      syncDrawerButton();
      measureHead(); // 锚点条收起后头变矮了，--head-h 必须当场重量，否则停在业务页的旧值
      syncDeskBook();
      return;
    }
    const node = currentNode();
    /* 切业务自动退出原文对照：这个视图是「核对眼前这一条」用的，跟着走没有意义。 */
    if (rawMode && rawModeKey && rawModeKey !== node.key) { rawMode = false; rawModeKey = ""; }
    const flow = flowFor(node);
    loadChecks(node.key); // 勾选状态先就位，卡片一次渲染出来就是恢复后的样子
    /* 连续文档下四个环节都在页面上，越界只需 clamp，不再往“第一个有内容的环节”吸附。 */
    activeStage = Math.min(Math.max(0, activeStage), flow.length - 1);
    ensureShell();
    if (tocBuiltFor !== categoryIndex) buildCatalog(items[categoryIndex], node);
    else if (tocSelectedKey !== node.key) updateCatalogSelection(node);
    paintQuickEntry(node.key);
    if (rawMode) {
      /* 未加工视图没有勾选卡、没有灯箱清单：两份登记清空，速查卡据此自动收起「材料清单」一节。 */
      rawModeKey = node.key;
      lightboxFigures = [];
      materialCards = [];
      shell.reader.innerHTML = renderRawReader(node);
    } else {
      rawModeKey = "";
      shell.reader.innerHTML = renderReader(node, flow);
    }
    shell.aside.innerHTML = renderAside(node, flow);
    setAsideBar(asideBarOpen); // 要点条的展开态跨业务保留（类挂在常驻的 host 上，这里只做一次对齐）
    paintModeSwitch();         // 分段控件的 aria-checked 已随模板渲染好，这一趟补「自动」那一档的解析说明
    /* 锚点条在原文对照视图里整条收起：那里没有四步可跳。 */
    if (railHost) railHost.innerHTML = rawMode ? "" : renderRail(flow);
    markSmallFigures(shell.reader);
    syncTableShadows(shell.reader);
    applyRiskOff(riskOff, false);
    syncHeadBiz(cleanTitle(node.section.title));
    syncDrawerButton();
    measureHead();
    setupObserver();
    applyPendingFocus();
    syncDeskBook();
  }

  function selectNode(key, focus) {
    const node = allNodes().find((item) => item.key === key);
    if (!node) return;
    selectedKey = node.key;
    categoryIndex = node.categoryIndex;
    keyword = "";
    activeStage = 0;
    starNotice = false; // 有交互了，版本提示这一行随下一次重画消失
    pendingFocus = focus || null; // 目录点选不设归还目标：目录不重建，焦点本来就还在所点条目上
    suppressScrollLink();
    render();
    syncHash(false); // 切业务留历史记录
    if (typeof window.scrollTo === "function") window.scrollTo({ top: 0, behavior: reduceMotion() ? "auto" : "smooth" });
  }

  /* 地址栏定位：#/<结构索引 key>/<环节序号>。格式不变，语义由“显示第 N 步”改为“定位到第 N 步”：
     换业务仍写 location.hash 留历史记录，同业务内换环节一律 replaceState，不进历史。 */
  function hashFor() {
    return `#/${selectedKey}/${activeStage}`;
  }

  function syncHash(replace) {
    if (!selectedKey || keyword.trim()) return;
    const next = hashFor();
    if (location.hash === next) return;
    if (!replace) { location.hash = next; return; }
    /* 本地 file:// 打开时 replaceState 会被浏览器拒绝；location.replace 同样是“替换当前记录”，
       不会新增历史，只是走一次同文档导航——记下这件事，好让滚动联动放宽回写节奏。 */
    try { history.replaceState(null, "", next); } catch (error) { replaceStateOk = false; location.replace(next); }
  }

  /* key 无效 → 返回 null（调用方回默认业务）；stage 越界 → clamp 到 0..3。 */
  function parseHash() {
    const matched = /^#\/([\d-]+)(?:\/(\d+))?$/.exec(location.hash || "");
    if (!matched) return null;
    const node = allNodes().find((item) => item.key === matched[1]);
    if (!node) return null;
    const stage = Number(matched[2] || 0);
    return { key: node.key, categoryIndex: node.categoryIndex, stage: Math.min(Math.max(0, Number.isFinite(stage) ? stage : 0), STAGES.length - 1) };
  }

  function applyHash() {
    const state = parseHash();
    if (!state) return false;
    selectedKey = state.key;
    categoryIndex = state.categoryIndex;
    activeStage = state.stage;
    keyword = "";
    return true;
  }

  /* 打印日期：本地日历日，纸质件归档时答得出「这份是哪天打的」（§5.3 页脚版式）。 */
  function printDate() {
    const now = new Date();
    const pad = (value) => String(value).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }

  /* 打印视图：把当前业务的全部非空环节按顺序渲染进常驻的 #print-sheet，正文复用 renderBlocks，不另造内容。
     页脚那行深链取自运行时 location（不是任何写死的绝对路径），因此站点挂在 /tools/ganggang/
     这类子路径下时，纸面上的深链自带子路径前缀，照着敲回来落到同一业务同一环节。 */
  function buildPrintSheet() {
    if (!printSheet) return;
    const node = currentNode();
    if (!node) { printSheet.innerHTML = ""; return; }
    const flow = flowFor(node);
    const link = `${String(location.href || "").split("#")[0]}${hashFor()}`;
    /* 核对重点的风险标记随打印稿一起上纸：黑白安全口径（§5.3）——纸面上只出【禁止】【注意】
       文字标记与一条黑色细线，彩色左条由 @media print 改成黑色，靠颜色区分的信息一概不留。
       这里**无条件**渲染，不看「重点标识」开关：那是屏幕上的个人偏好，而打印件是给他人看、要归档的，
       §5.3「黑白打印不丢信息」是对纸面的无条件承诺。@media print 里另有一条规则保证
       html.risk-off 状态下 #print-sheet 里的标记依然显示。 */
    const stages = flow.map((stage, index) => isFilled(stage)
      ? `<section class="print-stage"><h2>${index + 1}. ${escapeHtml(stage.label)}</h2><div class="document-body">${renderBlocks(stage.blocks, { figures: null, badges: false, images: printImages, bizName: cleanTitle(node.section.title), risk: stage.key === "review" ? riskModel(stage.blocks).marks : null })}</div></section>`
      : "").join("");
    printSheet.innerHTML = `<article class="print-doc"><div class="print-head"><h1>${escapeHtml(cleanTitle(node.section.title))}</h1><p class="print-path">${escapeHtml(node.path.map(cleanTitle).join(" › "))}</p><p class="print-meta">手册版本${HANDBOOK_VERSION} · 网站${SITE_VERSION}</p></div>${stages}<div class="print-foot"><p class="print-link">${escapeHtml(link)}</p><p class="print-when">打印于${printDate()}${printImages ? "" : " · 本份不含截图"}</p><p>实际办理请以最新制度、系统提示及所在机构要求为准</p></div></article>`;
  }

  function clearPrintSheet() {
    if (printSheet) printSheet.innerHTML = "";
  }

  tabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category-index]");
    if (!button) return;
    // 分类选择会打开该类最近的业务，先退出目录模态再将焦点交给正文。
    closeTocDrawer(true);
    categoryIndex = Number(button.dataset.categoryIndex) || 0;
    /* 分类切换记忆：回到该分类最近看过的业务；本次会话里没进过就落在首个业务。 */
    selectedKey = lastBusiness[categoryIndex] || "";
    activeStage = 0;
    keyword = "";
    /* 切分类同样是「换了业务」：焦点交给新业务的标题，与深链、后退前进、搜索结果三条路同一口径。
       分类按钮本身没有被重建，Shift+Tab 一步就能回到它。 */
    pendingFocus = { type: "title" };
    suppressScrollLink();
    render();
    syncHash(false);
    if (typeof window.scrollTo === "function") window.scrollTo({ top: 0, behavior: reduceMotion() ? "auto" : "smooth" });
  });

  /* 提交 = 进结果页。联想浮层里「查看全部 N 个结果」那一条也走这一个函数（经 requestSubmit 或直接调用），不另抄一份。 */
  function submitSearch() {
    closeSuggest();
    keyword = searchInput.value.trim();
    if (searchOpen()) setSearchOpen(false, true); // ≤900px：结果页要占满首屏，输入行收回按钮态
    render();
  }

  searchForm.addEventListener("submit", (event) => {
    /* 输入法选词的那一下回车：隐式提交是回车的默认动作，不经过任何 keydown 分支，光在 keydown 里 return 挡不住
       （2026-09-27 在 625efcc 上实测：拼音「kai」合成中按回车，submit 照样触发，结果页拿「kai」去搜）。
       所以由输入框的 keydown 记下「这一下是输入法的」（imeKeyDown，见「搜索联想浮层」一节），在这里只拦提交。 */
    if (imeKeyDown) { event.preventDefault(); return; }
    event.preventDefault();
    submitSearch();
  });

  /* ================= 搜索框清空按钮（×）=================
     只在框里有字时出现。它只清框内文字并把焦点还回输入框，不改 keyword、不动结果页——
     与 Esc 在框内那一档是同一件事，两者按同一条口径收敛，不会互相打架。 */
  function syncSearchClear() {
    if (!searchClear) return;
    if (searchInput && searchInput.value) searchClear.removeAttribute("hidden");
    else searchClear.setAttribute("hidden", "");
  }

  function clearSearchInput(keepFocus) {
    if (!searchInput) return;
    searchInput.value = "";
    closeSuggest(); // 词没了，浮层跟着收。点 × 时输入框不一定失焦（各浏览器对按钮取不取焦点不一致），不能指望 blur 那一路
    syncSearchClear();
    if (!keepFocus || typeof searchInput.focus !== "function") return;
    try { searchInput.focus({ preventScroll: true }); } catch (error) { searchInput.focus(); }
  }

  if (searchInput) searchInput.addEventListener("input", syncSearchClear);
  if (searchClear) searchClear.addEventListener("click", () => clearSearchInput(true));

  /* ================= 搜索联想浮层（combobox + listbox，design-proposal.md §11）=================
     边输边出：非合成态的 input 与 compositionend 两路都接（各浏览器两者谁先谁后不一样），渲染幂等——
     浮层开着、词没变就不重画；输入法合成期间框里是拼音字母，一律不更新。search-module.js 缺失时永远不打开。
     焦点始终留在输入框：选项不可聚焦（不放 button、不设 tabindex），当前项靠 aria-activedescendant 指过去，
     键盘与鼠标共用这一个游标。浮层关着时这里的键盘监听除了记下「是不是输入法的按键」之外什么都不做——
     回车提交、↓ 进结果列表、Esc 清字，旧行为一字不变（唯一的例外是输入法选词那一下回车不再提交，见 submit 那段）。 */
  const SUGGEST_DESKTOP = 6;
  const SUGGEST_NARROW = 5;        // ≤600px：浮层下面还压着软键盘，少一条
  const SUGGEST_NEAR = 3;          // 零结果时「名称相近」最多几条
  const SUGGEST_SPEAK_DELAY = 400; // 播报等输入停一停再说，只播最后一次
  let suggestCursor = -1;  // 当前项下标；-1 = 没有当前项（此时回车不拦，照旧提交）
  let suggestTerm = "";    // 浮层此刻画的是哪个词：幂等判据
  let suggestSpoken = "";  // 本次打开后已排进播报的那一句：条数没变就不再播
  let suggestSpeakTimer = 0;
  /* 这一下 keydown 是不是「合成中」的。keydown 第一行写入、keyup 清掉；submit 靠它拦掉「选词回车」带出来的隐式提交。
     只认 isComposing，**不认 keyCode 229**：229 只说明「这个键被输入法经手过」，安卓软键盘上不在合成中的按键
     也常报 229，拿它拦提交可能把键盘上的「搜索」键拦成按了没反应——那比「拼音被当成词搜了一次」后果重得多。
     blur 也清一次：焦点在按下与抬起之间被挪走时 keyup 落不到输入框，旗标不能留到下一次点「搜索」按钮。 */
  let imeKeyDown = false;

  const suggestIsOpen = () => Boolean(suggestPop && suggestPop.classList && suggestPop.classList.contains("is-open"));
  const suggestOptions = () => (suggestList ? listOf(suggestList.querySelectorAll('[role="option"]')) : []);

  /* 各组摊平后全局重排，口径与模块组内排序一致：分数降序 → 同分短路径优先 → 按 key 稳定收尾。
     不能直接取「第一组的前 N 条」：组序按组内最高分排，第二组的第二名可能比第一组的第二名更相关。 */
  function rankSuggest(result, limit) {
    const flat = [];
    (result.groups || []).forEach((group) => (group.results || []).forEach((item) => flat.push(item)));
    flat.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.path.length !== b.path.length) return a.path.length - b.path.length;
      return a.key < b.key ? -1 : (a.key > b.key ? 1 : 0);
    });
    return flat.slice(0, limit);
  }

  /* 角标只回答「凭什么命中」：交易码精确匹配给码；标题命中不出（标题里的高亮已经说明了）；其余给正文出现次数。
     只命中上级路径、正文 0 处的那种不出角标——写「正文0处」是错话。 */
  function suggestBadge(item) {
    if (item.codeExact && item.matchedCode) return `交易码 ${item.matchedCode}`;
    if (item.titleHit) return "";
    return item.occurrences ? `正文${item.occurrences}处` : "";
  }

  /* 一行：标题（高亮命中）+ 上级路径（path 末段就是标题本身，去掉）+ 右侧角标。行内没有任何可聚焦元素。 */
  function suggestRow(index, item, term, badge) {
    const parent = (item.path || []).slice(0, -1).join(" › ");
    return `<li role="option" id="ss-${index}" aria-selected="false" data-suggest-key="${escapeHtml(item.key)}"><span class="suggest-main"><span class="suggest-title">${markText(item.title, term)}</span>${parent ? `<span class="suggest-path">${escapeHtml(parent)}</span>` : ""}</span>${badge ? `<span class="suggest-badge">${escapeHtml(badge)}</span>` : ""}</li>`;
  }

  /* 条目随输入整片替换、瞬间到位（不做任何布局动画）；返回这一版该播报的那句话。 */
  function paintSuggest(result) {
    const term = result.normalized;
    let rows = "";
    let note = "";
    let speech = "";
    if (result.total) {
      const picked = rankSuggest(result, isNarrow() ? SUGGEST_NARROW : SUGGEST_DESKTOP);
      /* 末尾固定一条「查看全部」：选它 = 点「搜索」按钮，进原来的结果页。 */
      rows = picked.map((item, index) => suggestRow(index, item, term, suggestBadge(item))).join("")
        + `<li role="option" id="ss-${picked.length}" aria-selected="false" data-suggest-all>查看全部 ${result.total} 个结果</li>`;
      speech = `${picked.length}条联想，上下键选择`;
    } else {
      /* 零结果：模块给的「名称相近」最多 3 条，不出「查看全部」（结果页也是零条，去了没有意义）。 */
      const near = (result.suggestions || []).slice(0, SUGGEST_NEAR);
      rows = near.map((item, index) => suggestRow(index, item, term, "名称相近")).join("");
      note = near.length ? `没有直接命中「${term}」，名称相近的业务：` : "没有找到相关业务";
      speech = near.length ? `没有直接命中，${near.length}个相近业务` : "没有找到相关业务";
    }
    suggestList.innerHTML = rows;
    if (suggestNote) {
      suggestNote.textContent = note;
      if (note) suggestNote.removeAttribute("hidden");
      else suggestNote.setAttribute("hidden", "");
    }
    return speech;
  }

  /* 游标：-1 = 没有当前项。reveal 只给键盘用——鼠标指着的那条本来就看得见，滚动反而会让它从指针下溜走。 */
  function setSuggestCursor(index, reveal) {
    const options = suggestOptions();
    suggestCursor = index >= 0 && index < options.length ? index : -1;
    options.forEach((option, at) => option.setAttribute("aria-selected", at === suggestCursor ? "true" : "false"));
    if (!searchInput) return;
    const current = suggestCursor >= 0 ? options[suggestCursor] : null;
    if (!current) { searchInput.removeAttribute("aria-activedescendant"); return; }
    searchInput.setAttribute("aria-activedescendant", current.id);
    if (reveal && typeof current.scrollIntoView === "function") current.scrollIntoView({ block: "nearest" });
  }

  /* 播报去抖：连续敲字时定时器一直往后推，停手约 400ms 后只播最后那一句；同一次打开里条数没变就不再播。 */
  function speakSuggest(message) {
    suggestSpoken = message;
    if (suggestSpeakTimer) clearTimeout(suggestSpeakTimer);
    suggestSpeakTimer = setTimeout(() => {
      suggestSpeakTimer = 0;
      if (suggestIsOpen()) announce(message);
    }, SUGGEST_SPEAK_DELAY);
  }

  function updateSuggest() {
    if (!suggestPop || !suggestList || !searchInput) return;
    const term = searchInput.value.trim();
    const index = term ? ensureSearchIndex() : null;
    if (!index) { closeSuggest(); return; } // 空词收起；search-module.js 缺失时这里恒为 null，永远不打开、不出声
    if (suggestIsOpen() && term === suggestTerm) return; // input 与 compositionend 可能各来一次：同一个词不重画
    const speech = paintSuggest(Search.search(index, term));
    suggestTerm = term;
    setSuggestCursor(-1, false);
    suggestPop.classList.add("is-open");
    searchInput.setAttribute("aria-expanded", "true");
    if (speech !== suggestSpoken || suggestSpeakTimer) speakSuggest(speech);
  }

  /* 收起：清掉待播的那一句（否则 400ms 后它会盖掉结果页或业务页自己的播报）。
     条目先留在 DOM 里，淡出时不至于是一只空盒子；下次打开整片重画。 */
  function closeSuggest() {
    if (suggestSpeakTimer) { clearTimeout(suggestSpeakTimer); suggestSpeakTimer = 0; }
    suggestSpoken = "";
    suggestTerm = "";
    if (!suggestPop) return;
    setSuggestCursor(-1, false);
    if (suggestPop.classList) suggestPop.classList.remove("is-open");
    if (searchInput) searchInput.setAttribute("aria-expanded", "false");
  }

  function activateSuggest(option) {
    if (!option) return;
    if (option.hasAttribute("data-suggest-all")) {
      closeSuggest();
      /* 与点「搜索」按钮完全同一条路：requestSubmit 会派发 submit 事件；老内核没有它就直接调提交函数。 */
      if (typeof searchForm.requestSubmit === "function") searchForm.requestSubmit();
      else submitSearch();
      return;
    }
    const key = option.getAttribute("data-suggest-key");
    if (!key) return;
    closeSuggest();
    if (searchOpen()) setSearchOpen(false, false); // ≤900px：整行搜索收回按钮态，焦点交给下面的业务标题
    selectNode(key, { type: "title" });
  }

  if (searchInput) {
    /* 它挂在输入框上，先于 document 的统一分发执行；这里 preventDefault 过的按键，统一分发第一行就跳过。 */
    searchInput.addEventListener("keydown", (event) => {
      /* 合成态的按键归输入法（选词的回车、取消选词的 Esc、翻候选的方向键）。只记旗标、不 preventDefault——
         拦了可能在某些平台上打断上屏；选词回车带出来的隐式提交不经过这里，由 submit 那段看旗标拦掉。 */
      imeKeyDown = Boolean(event.isComposing);
      if (event.isComposing || event.keyCode === 229) return;
      /* 已被更上层处理掉的按键不动第二次（目录抽屉的陷阱跑在捕获阶段，Esc 先关抽屉）；浮层关着就什么都不做。 */
      if (event.defaultPrevented || !suggestIsOpen()) return;
      /* Esc 只收浮层、保留框内文字；下一次 Esc 才轮到统一分发里「清空搜索框」那一档。 */
      if (event.key === "Escape") { event.preventDefault(); closeSuggest(); return; }
      if (event.ctrlKey || event.metaKey || event.altKey) return; // 带修饰键的组合照旧让给浏览器（与统一分发同一口径）
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        /* 从「无」按 ↓ 到第 0 项；第 0 项按 ↑ 回到「无」；末项按 ↓ 停在末项。
           preventDefault 让统一分发整个跳过，「↓ 跳进结果列表」那条旧路此时不会被触发。 */
        event.preventDefault();
        const last = suggestOptions().length - 1;
        setSuggestCursor(event.key === "ArrowDown" ? Math.min(suggestCursor + 1, last) : Math.max(suggestCursor - 1, -1), true);
        return;
      }
      if (event.key !== "Enter" || suggestCursor < 0) return; // 没有当前项的回车一概不拦：表单照旧提交进结果页
      const option = suggestOptions()[suggestCursor];
      if (!option) return;
      event.preventDefault(); // 挡住表单的隐式提交，改为打开这一项
      activateSuggest(option);
    });
    searchInput.addEventListener("keyup", () => { imeKeyDown = false; });
    searchInput.addEventListener("input", (event) => { if (!event.isComposing) updateSuggest(); });
    searchInput.addEventListener("compositionend", () => updateSuggest());
    searchInput.addEventListener("blur", () => { imeKeyDown = false; closeSuggest(); });
  }

  if (suggestPop) {
    /* 按下不让输入框失焦：否则 blur 先把浮层收掉，随后的 click 就落空了。 */
    suggestPop.addEventListener("mousedown", (event) => event.preventDefault());
    suggestPop.addEventListener("click", (event) => {
      const option = event.target && typeof event.target.closest === "function" ? event.target.closest('[role="option"]') : null;
      if (option) activateSuggest(option);
    });
    /* 鼠标移到哪条，游标就到哪条：键盘与鼠标共用一个高亮，不会同时亮两条。只在换条时写一次。 */
    suggestPop.addEventListener("mousemove", (event) => {
      const option = event.target && typeof event.target.closest === "function" ? event.target.closest('[role="option"]') : null;
      if (!option) return;
      const at = suggestOptions().indexOf(option);
      if (at >= 0 && at !== suggestCursor) setSuggestCursor(at, false);
    });
  }

  view.addEventListener("click", (event) => {
    /* 遮罩是目录抽屉与速查卡抽屉共用的那一层：哪个开着就关哪个（目录在上，先判它）。 */
    if (event.target.closest("[data-aside-close]")) { setAsideBar(false); return; }
    if (event.target.closest("[data-toc-close]")) {
      if (tocDrawerOpen()) closeTocDrawer();
      else if (asideBarOpen) setAsideBar(false);
      else if (!isNarrow()) { setTocCollapsed(true); if (drawerButton) drawerButton.focus(); }
      return;
    }
    if (event.target.closest("[data-print-page]")) {
      buildPrintSheet();
      if (typeof window.print === "function") window.print();
      return;
    }
    const modeButton = event.target.closest("[data-mode-set]");
    if (modeButton) { setMode(modeButton.dataset.modeSet); return; }
    const accentButton = event.target.closest("[data-accent-set]");
    if (accentButton) { setAccent(accentButton.dataset.accentSet); return; }
    const deskButton = event.target.closest("[data-desk-set]");
    if (deskButton) { setDeskBook(deskButton.dataset.deskSet === "on"); return; }
    if (event.target.closest("[data-aside-toggle]")) { setAsideBar(!asideBarOpen, event.target.closest("[data-aside-toggle]")); return; }
    if (event.target.closest("[data-focus-mode]")) { setAsideBar(false); setFocusMode(!focusMode, false); return; }
    if (event.target.closest("[data-back-to-toc]")) { backToCatalog(); return; }
    if (event.target.closest("[data-risk-toggle]")) { applyRiskOff(!riskOff, true); return; }
    if (event.target.closest("[data-raw-toggle]")) { setRawMode(!rawMode); return; }
    if (event.target.closest("[data-raw-exit]")) { setRawMode(false); return; }
    if (event.target.closest("[data-toggle-star]")) { toggleStarCurrent(); return; }
    const unstar = event.target.closest("[data-unstar-key]");
    if (unstar) { unstarFromQuick(unstar.dataset.unstarKey); return; }
    const expand = event.target.closest("[data-expand-group]");
    if (expand) { expandSearchGroup(expand.dataset.expandGroup); return; }
    const clearButton = event.target.closest("[data-check-clear]");
    if (clearButton) { const card = clearButton.closest(".check-card"); if (card) clearCard(card); return; }
    /* 速查卡里的编号是“定位”，正文里的徽章仍是“复制”——两者用不同的 data 属性区分，互不干扰。 */
    const codeJump = event.target.closest("[data-code-jump]");
    if (codeJump) { setAsideBar(false); locateCode(codeJump.dataset.codeJump); return; }
    const riskJump = event.target.closest("[data-risk-anchor]");
    if (riskJump) { setAsideBar(false); locateRisk(riskJump.dataset.riskAnchor); return; }
    const badge = event.target.closest(".code-badge");
    if (badge) { copyCode(badge); return; }
    const thumb = event.target.closest("[data-figure-index]");
    if (thumb) { openLightbox(thumb.dataset.figureIndex, thumb); return; }
    /* 快速入口这一支必须排在通用 [data-node-key] 之前：它每次 render 都重画，跨分类点击还会触发
       buildCatalog() 整体重建，被点的按钮当场消失——所以要显式把焦点交给新业务的标题。 */
    const quickButton = event.target.closest(".quick-item[data-node-key]");
    if (quickButton) { if (tocDrawerOpen()) closeTocDrawer(true); selectNode(quickButton.dataset.nodeKey, { type: "title" }); return; }
    const nodeButton = event.target.closest("[data-node-key]");
    if (nodeButton) {
      const fromDrawer = Boolean(nodeButton.closest(".toc")) && tocDrawerOpen();
      selectNode(nodeButton.dataset.nodeKey, nodeButton.closest(".toc") ? null : { type: "title" });
      if (fromDrawer) closeTocDrawer(); // 选中业务即收抽屉，焦点归还给吸顶栏上的目录按钮
      return;
    }
    /* 只认 button：环节段落 <section class="stage-section" data-stage-index> 是正文全部内容的祖先，
       写成裸 [data-stage-index] 会把「点勾选框 / 点正文行 / 展开原文」一并当成点了锚点——
       页面被强行滚回该环节开头、地址栏改写、还播报一句「已定位到第 N 步」（实测）。
       四个真锚点控件（锚点条 / 底部下一环节 / 浮动按钮 / 速查卡回跳）都是 button，收得干干净净。 */
    const stageButton = event.target.closest("button[data-stage-index]");
    if (stageButton && !stageButton.disabled) { goToStageControl(stageButton); return; }
    if (event.target.closest("[data-clear-search]")) { keyword = ""; render(); syncHash(true); }
  });

  /* 锚点条与进度条上的“跳到第 N 步”走同一条路：只滚动定位 + replaceState，不重建正文、不进历史。 */
  function goToStageControl(control) {
    const index = Number(control.dataset.stageIndex);
    if (!Number.isInteger(index) || index < 0 || index >= STAGES.length) return;
    if (asideBarOpen) setAsideBar(false);
    gotoStage(index, { smooth: true });
  }

  if (railHost) railHost.addEventListener("change", (event) => {
    if (!event.target || event.target.id !== "current-stage-select") return;
    const index = Number(event.target.value);
    if (Number.isInteger(index) && index >= 0 && index < STAGES.length) gotoStage(index, { smooth: true });
  });

  if (railHost) railHost.addEventListener("click", (event) => {
    /* 空环节节点用 aria-disabled 而非 disabled：它仍可点，落到自己的口径说明条上。 */
    const control = event.target.closest("[data-stage-index]");
    if (control) goToStageControl(control);
  });

  view.addEventListener("input", (event) => {
    const input = event.target.closest("#toc-filter-input");
    if (!input) return;
    tocFilter = input.value || "";
    applyTocFilter();
  });

  /* 勾选框走 change：键盘空格与鼠标点击是同一条路径。 */
  view.addEventListener("change", (event) => {
    if (!event.target || typeof event.target.closest !== "function") return;
    const printBox = event.target.closest("[data-print-images]");
    if (printBox) { setPrintImages(printBox.checked, true); return; }
    const box = event.target.closest("[data-check-index]");
    if (box) toggleCheck(box);
  });

  view.addEventListener("keydown", (event) => {
    /* 合成态的按键归输入法（选词的回车、取消选词的 Esc、翻候选的方向键）：拼音打到一半按 Esc 是取消选词，不是清过滤。 */
    if (event.isComposing || event.keyCode === 229) return;
    if (event.key !== "Escape") return;
    const input = event.target.closest("#toc-filter-input");
    if (!input) return;
    /* 有过滤词时：只清过滤，不向外冒泡（不会顺手关抽屉、退专注模式）。
       框内已经是空的：放行让它冒泡出去，站在抽屉里按 Esc 才关得掉抽屉。 */
    if (!input.value && !tocFilter) return;
    event.stopPropagation();
    event.preventDefault();
    input.value = "";
    tocFilter = "";
    applyTocFilter();
  });

  if (skipLink) skipLink.addEventListener("click", (event) => {
    event.preventDefault(); // 不让 #reader-main 顶掉地址栏里的业务深链
    const target = document.querySelector("#reader-main") || view;
    if (typeof target.scrollIntoView === "function") target.scrollIntoView({ block: "start" });
    if (typeof target.focus === "function") target.focus();
  });

  /* ================= 统一键盘分发 =================
     输入框 / 文本域内除 Esc（以及搜索框里「↓ 跳进结果列表」那一支）外一律不劫持；带修饰键的组合一律让给浏览器；
     输入法合成态的按键一概不接。搜索联想浮层开着时的 ↑↓ / Enter / Esc 由输入框自己的 keydown 先处理（见「搜索联想浮层」一节）。 */
  const TYPING_TAGS = { INPUT: true, TEXTAREA: true, SELECT: true };

  function isTypingTarget(target) {
    if (!target || target.nodeType !== 1) return false;
    if (target.isContentEditable) return true;
    return Boolean(TYPING_TAGS[target.tagName]);
  }

  /* Esc 的优先级：灯箱 ＞ 快捷键说明面板 ＞ 目录抽屉 ＞ 工具抽屉
     ＞ 清空搜索框内文字 ＞ 退出专注模式。
     目录过滤框内、且框里还有过滤词时，Esc 已在 view 上 stopPropagation，压根到不了这里。
     搜索联想浮层开着时，Esc 先被输入框自己的 keydown 收掉浮层（preventDefault），同样到不了这里；
     所以「清空搜索框内文字」是浮层收起之后的下一次 Esc。
     搜索框内文字清空之后再按一次 Esc，才收起 ≤900px 的整行搜索输入（桌面搜索框常驻，无此态）。 */
  function handleEscape(event) {
    if (lightboxOpen()) { event.preventDefault(); closeLightbox(); return; }
    if (helpOpen()) { event.preventDefault(); closeHelp(); return; }
    if (tocDrawerOpen()) { event.preventDefault(); closeTocDrawer(); return; }
    /* 阅读工具在所有宽度下均为可退出的模态层。 */
    if (asideBarOpen) { event.preventDefault(); setAsideBar(false); return; }
    if (event.target === searchInput) {
      if (searchInput.value) { event.preventDefault(); clearSearchInput(false); return; }
      if (searchOpen()) { event.preventDefault(); setSearchOpen(false, true); }
      return;
    }
    if (!focusMode) return;
    event.preventDefault();
    setFocusMode(false, true);
  }

  const listOf = (nodes) => Array.prototype.slice.call(nodes || []);

  function moveFocus(items, current, step) {
    if (!items.length) return false;
    let index = items.indexOf(current);
    if (index < 0) index = step > 0 ? -1 : items.length;
    const next = items[Math.min(Math.max(0, index + step), items.length - 1)];
    if (!next || typeof next.focus !== "function") return false;
    try { next.focus({ preventScroll: false }); } catch (error) { next.focus(); }
    return true;
  }

  /* 目录内 ↑↓ 只在“看得见”的条目之间走：被过滤隐藏的、所在分组已折叠的都跳过。 */
  function visibleTocItems() {
    if (!shell) return [];
    return listOf(shell.toc.querySelectorAll(".toc-item")).filter((item) => {
      if (item.classList.contains("is-hidden")) return false;
      const group = typeof item.closest === "function" ? item.closest(".toc-group") : null;
      return !group || group.open;
    });
  }

  function handleArrow(event, step) {
    const target = event.target;
    if (!target || typeof target.closest !== "function") return false;
    if (target.closest(".toc-item")) return moveFocus(visibleTocItems(), target.closest(".toc-item"), step);
    /* 结果按钮的选择器一个字都没变：分组标题只是穿插在若干个 <ol> 之间，
       querySelectorAll 返回的仍是文档顺序，也就是视觉从上到下、跨组连续的顺序。
       无结果页的推荐列表沿用 result-list 类名，因此同一条路也覆盖了它。 */
    if (target.closest(".result-list")) {
      const buttons = searchResultButtons();
      const moved = moveFocus(buttons, target.closest("button"), step);
      if (moved) searchCursor = buttons.indexOf(document.activeElement);
      return moved;
    }
    /* 焦点还在搜索框里时按 ↓：这才跳进结果列表的第一条（提交后不抢焦点，方便改词重搜）。
       联想浮层开着时 ↓ 归浮层，输入框自己的 keydown 已 preventDefault，走不到这一支。 */
    if (target === searchInput && step > 0 && keyword.trim()) {
      const buttons = searchResultButtons();
      if (!buttons.length) return false;
      const moved = moveFocus(buttons, null, 1);
      if (moved) searchCursor = 0;
      return moved;
    }
    return false;
  }

  /* 外观分段控件是 radiogroup（只有选中那枚在 Tab 序列里，见 paintModeSwitch），组内换档靠方向键：
     ← ↑ 上一档、→ ↓ 下一档（首尾循环），Home / End 跳首尾；按下即生效，焦点跟到新的那枚上。
     照刷刷 3.13.1 的做法（APG 单选组）。强调色是一组 aria-pressed 按钮、每个都能 Tab 到，不归这里。 */
  const MODE_STEP = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 };

  function handleModeKey(event) {
    const target = event.target;
    if (!target || typeof target.closest !== "function") return false;
    const radio = target.closest("[data-mode-set]");
    if (!radio || !radio.dataset) return false;
    const index = MODES.indexOf(radio.dataset.modeSet);
    if (index < 0) return false;
    let next;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = MODES.length - 1;
    else if (MODE_STEP[event.key]) next = (index + MODE_STEP[event.key] + MODES.length) % MODES.length;
    else return false;
    setMode(MODES[next]);
    const group = radio.closest(".mode-seg");
    const button = group ? group.querySelector(`[data-mode-set="${MODES[next]}"]`) : null;
    if (button && typeof button.focus === "function") button.focus();
    return true;
  }

  document.addEventListener("keydown", (event) => {
    /* 合成态的按键归输入法（选词的回车、取消选词的 Esc、翻候选的方向键）。不挡的话：搜索框里拼音打到一半按 ↓，
       焦点会被拽进结果列表（2026-09-27 在 625efcc 上实测）；按 Esc 会把搜索框清空。 */
    if (event.isComposing || event.keyCode === 229) return;
    if (event.defaultPrevented) return;
    if (event.key === "Escape") { handleEscape(event); return; }
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === "?" || (event.key === "/" && event.shiftKey)) {
      if (isTypingTarget(event.target)) return;
      event.preventDefault();
      if (helpOpen()) closeHelp(); else openHelp(event.target);
      return;
    }
    if (handleModeKey(event)) { event.preventDefault(); return; } // 焦点在外观单选组里：方向键 / Home / End 换档，不滚页面
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (handleArrow(event, event.key === "ArrowDown" ? 1 : -1)) event.preventDefault();
      return;
    }
    if (isTypingTarget(event.target)) return;
    if (event.key === "/") {
      event.preventDefault();
      setSearchOpen(true, true);
      if (searchInput && typeof searchInput.select === "function") searchInput.select();
      return;
    }
    if (event.key !== "[" && event.key !== "]") return;
    if (!shell || keyword.trim() || rawMode) return;
    const next = event.key === "[" ? activeStage - 1 : activeStage + 1;
    if (next < 0 || next >= STAGES.length) return;
    event.preventDefault();
    if (asideBarOpen) setAsideBar(false);
    if (tocDrawerOpen()) closeTocDrawer();
    gotoStage(next, { smooth: true }); // 定位 + replaceState + 播报
  });

  /* hash 语义迁移的落点：同业务内只“定位”，不重建正文；跨业务才整页重渲染并留焦点归还。 */
  window.addEventListener("hashchange", () => {
    const state = parseHash();
    if (!state) { // key 无效（或手改成别的形状）：回默认业务并把地址栏纠正过来
      if (!location.hash) return;
      selectedKey = "";
      activeStage = 0;
      keyword = "";
      render();
      syncHash(true);
      return;
    }
    const sameBiz = !keyword.trim() && state.key === selectedKey && state.categoryIndex === categoryIndex;
    if (sameBiz && state.stage === activeStage) return; // 我们自己刚写进去的那一份，不重复动作
    if (sameBiz) { gotoStage(state.stage, { smooth: false, write: false }); return; }
    selectedKey = state.key;
    categoryIndex = state.categoryIndex;
    activeStage = state.stage;
    keyword = "";
    /* 换业务后的焦点一律落在业务标题上（与「从搜索结果打开业务」同一口径）：
       落在正文容器上时读屏只报出一个无名的区域，落在 h1 上才直接读出「现在看的是哪个业务」。 */
    pendingFocus = { type: "title" };
    suppressScrollLink();
    render();
    gotoStage(state.stage, { smooth: false, write: false });
  });

  /* 品牌链接不再让 #top 覆盖地址栏里的业务深链，只滚回页首。 */
  if (brandLink) brandLink.addEventListener("click", (event) => {
    event.preventDefault();
    restoreReadingPage();
    suppressScrollLink();
    window.scrollTo({ top: 0, behavior: reduceMotion() ? "auto" : "smooth" });
    gotoStage(0, { smooth: false, announce: false });
  });

  /* ================= 可换的品牌图标（§10.14b）=================
     放 assets/brand/brand-icon.svg（首选）或 .png（1024² 透明底白线）即生效，不用改任何代码；
     两个文件都没有时回落到 CSS 里那枚内置的「打开的书」。**屋主手绘的这两个文件已随 7b4cb2b 入库**，
     所以默认态就是「用屋主那一枚」，内置的「打开的书」退成回落态——回落这条路仍然要留着，
     因为「把图标文件删掉」是本来就支持的用法，删了页面不能缺图也不能报错。

     为什么由 JS 注入而不是在 index.html 里静态写 <img>：
     ① `tools/check-dockerfile-copy.sh` 要求 index.html 引用到的文件必须真的在仓库里；静态写会把
        「文件必须在」钉死，一旦有人删掉图标文件（回落态是要支持的），那道门禁就会红；
     ② `file://` 下不能 fetch 探测文件在不在。
        （**2026-09-23 更正**：这里原先还写着「容器的 CSP 也不允许内联事件处理器」——**岗岗的容器里根本没有 CSP**，
        `docker/nginx.conf` 全文只有两条 `Cache-Control`。那句话是连着刷刷那套规矩一起抄过来的，在刷刷那里是真的。
        JS 注入这个做法本身不变，靠上面第 ① 条与这一条就够。）
     所以这里注入一个 <img> 让浏览器自己去试：error 就换下一个候选，都失败就把 img 摘掉。
     相对路径与其余资源一致（assets/…），挂子路径部署照常。
     img 是纯装饰：alt="" + aria-hidden，读屏读不到，可及名仍来自 .brand 自己的 aria-label。 */
  (function brandIcon() {
    if (!brandLink || typeof document.createElement !== "function") return;
    const sources = ["assets/brand/brand-icon.svg", "assets/brand/brand-icon.png"];
    let index = 0;
    const img = document.createElement("img");
    img.className = "brand-icon";
    img.alt = "";
    img.setAttribute("aria-hidden", "true");
    img.setAttribute("decoding", "async");
    img.addEventListener("load", () => {
      /* 有些浏览器对 404 页面也会触发 load（返回的是 HTML），naturalWidth 为 0 时按失败处理。 */
      if (!img.naturalWidth) { next(); return; }
      if (brandLink.classList) brandLink.classList.add("has-brand-file");
    });
    img.addEventListener("error", next);
    function next() {
      index += 1;
      if (index < sources.length) { img.src = sources[index]; return; }
      if (brandLink.classList) brandLink.classList.remove("has-brand-file");
      if (img.parentNode) img.parentNode.removeChild(img);
    }
    img.src = sources[0];
    brandLink.appendChild(img);
  })();

  /* 滚动：压缩态每次都算（很轻），联动重算节流到 150ms；
     抑制期内只负责把“滚动停止”的计时往后推，绝不改高亮、不回写 hash。 */
  window.addEventListener("scroll", () => {
    syncCondensed();
    if (linkSuppressed) { armIdleRelease(); return; }
    if (linkTimer) return;
    linkTimer = setTimeout(() => { linkTimer = 0; onScrollLink(); }, SCROLL_THROTTLE);
  });
  if ("onscrollend" in window) window.addEventListener("scrollend", () => { releaseScrollLink(); onScrollLink(); });

  /* 判不出宽度时（无 matchMedia 也无 innerWidth 的环境）按“窄屏”处理：只用于 resize 时要不要自动收抽屉，
     宁可留着也不要在量不到宽度的环境里把它强行关掉。 */
  function isNarrow() {
    if (typeof window.matchMedia === "function") {
      try { return Boolean(window.matchMedia("(max-width:1100px)").matches); } catch (error) { /* 落到下面 */ }
    }
    return typeof window.innerWidth === "number" ? window.innerWidth <= 1100 : true;
  }

  /* 工具始终为弹层；目录跨过 1100px 才在侧栏和弹层之间切换。 */
  function releaseNarrowForms() {
    if (!isNarrow() && tocDrawerOpen()) closeTocDrawer(true);
    dockCategoryTabs(Boolean(shell));
    syncDrawerButton();
  }

  /* 断点翻转用 matchMedia 的 change 事件盯着最准（缩放引起的翻转不一定伴随 resize）；
     老内核没有 addEventListener 的 MediaQueryList 就只靠下面的 resize 兜底。 */
  (function watchBreakpoint() {
    if (typeof window.matchMedia !== "function") return;
    try {
      const query = window.matchMedia("(max-width:1100px)");
      const onChange = () => releaseNarrowForms();
      if (typeof query.addEventListener === "function") query.addEventListener("change", onChange);
      else if (typeof query.addListener === "function") query.addListener(onChange);
    } catch (error) { /* 用不了就只留 resize 兜底 */ }
  })();

  window.addEventListener("resize", () => {
    releaseNarrowForms();
    measureHead();
    setupObserver(); // rootMargin 跟着吸顶高度变，重建一次最省事
    if (shell) syncTableShadows(shell.reader);
  });
  window.addEventListener("beforeprint", buildPrintSheet);
  window.addEventListener("afterprint", clearPrintSheet);
  /* desk-book.js 运行中判定设备不合格（WebGL2 探测失败、上下文丢失、帧率卸载）时发这个事件：开关当场撤掉，不等下一次重画。 */
  window.addEventListener("gang:desk-book", () => {
    const desk = deskBook();
    if (!shell || !desk || desk.canOffer()) return;
    const box = shell.aside.querySelector(".desk-switch");
    if (box && box.parentNode) box.parentNode.removeChild(box);
  });

  riskOff = storageGet("hb:risk-off") === "1"; // 重点标识开关跨会话记住
  focusMode = storageGet("hb:focus-mode") === "1"; // 专注模式同样跨会话记住
  printImages = storageGet("hb:print-images") !== "0"; // 打印含截图：默认开，只有显式存过 0 才是关
  /* 装饰默认关闭；本次阅读布局不加载 desk-book.js，相关兼容接口均为空转。 */
  if (deskBook()) {
    deskOn = storageGet("hb:desk3d") === "on";
    if (typeof window.GangDeskBook.configure === "function") window.GangDeskBook.configure({ enabled: deskOn });
  }
  /* 主题必须在首帧渲染之前落到 html 上（index.html 的 <head> 里另有一段同样口径的内联脚本先做一次，
     那一段负责消除样式表生效前的一瞬白闪；这里是权威的一次，两边读同一个 hb:mode）。 */
  /* 迁移：hb:mode 没有时，读一次旧的 hb:theme（auto/light/dark）当初值并**写回** hb:mode，
     老用户的「我选过深色」不会因为改键名而丢。旧的 hb:palette 一律忽略（六套粉彩整组作废），
     强调色因此从 blue 重新开始。<head> 里那段预置脚本做同一件事、同一套校验，两边口径一致。 */
  (function bootMode() {
    const saved = storageGet("hb:mode");
    if (MODES.indexOf(String(saved)) >= 0) { applyMode(saved, false); return; }
    const legacy = String(storageGet("hb:theme") || "");
    const initial = MODES.indexOf(legacy) >= 0 ? legacy : "light";
    applyMode(initial, true);
  })();
  /* 强调色同理：<head> 里那段内联脚本已先写过一次消闪，这里是权威的一次，两边读同一个 hb:accent。 */
  applyAccent(storageGet("hb:accent"), false);
  const deepLinked = applyHash();
  render();
  /* 右栏按钮的文案与 aria-pressed 在 render 里已按 focusMode 渲染好，这一趟补的是 html 上的类；
     搜索页深链进来时 render 已经把它退掉了，这里读到的 focusMode 也就是 false，不会又打开一次。 */
  if (focusMode) setFocusMode(true, false);
  syncHash(true);
  measureHead();
  syncCondensed();
  if (deepLinked) gotoStage(activeStage, { smooth: false, write: false });
  /* 版本闸清空过常办：这是整轮初始化里唯一值得打扰柜员的一件事，放在最后播报，
     免得被 gotoStage 的定位播报盖掉；快速入口区那一行静态提示同时在场。 */
  if (starNotice) announce("手册已更新，常办清单需要重新标记");
})();
