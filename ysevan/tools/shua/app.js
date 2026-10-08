/**
 * 刷刷 v3.14.1
 * Author: Ysevan
 * 仅限内部学习使用，请勿公开发布题库或源码。
 */
(function () {
  "use strict";

  const projectInfo = window.PROJECT_INFO || {
    version: "3.14.1",
    releaseDate: "2026-09-22",
    author: "Ysevan",
    classification: "仅限内部学习使用",
    distributionNotice: "请勿公开发布题库文件、学习记录或本项目源码。",
    changes: [],
    releaseHistory: [],
  };
  const LEGACY_STORAGE_KEY = "zongfu-quiz-progress-v1";
  const LEGACY_BANK_STORAGE_KEY = "zongfu-quiz-bank-v1";
  const BANK_REGISTRY_KEY = "zongfu-quiz-bank-registry-v2";
  const DEFAULT_BANK_ID = "builtin-zongfu-annual-2026";
  const LEGACY_ZONGFU_BANK_ID = "builtin-zongfu-20230413";
  const DOMESTIC_SETTLEMENT_BANK_ID = "builtin-domestic-settlement-20260810";
  const BILL_FINANCE_BANK_ID = "builtin-bill-finance-2024";
  const BANK_ACCEPTANCE_BANK_ID = "builtin-bank-acceptance-2024";
  const COUNTERFEIT_CURRENCY_BANK_ID = "builtin-counterfeit-currency-2023";
  const FOREIGN_EXCHANGE_BANK_ID = "builtin-foreign-exchange-2026";
  const WARNING_EDUCATION_SANMING_BANK_ID = "builtin-warning-education-sanming";
  const FX_LEVEL_ONE_BANK_ID = "builtin-fx-level-one";
  const QUESTION_TYPES = Object.freeze(["单选题", "多选题", "判断题", "填空题", "简答题"]);
  const SUBJECTIVE_TYPES = Object.freeze(["填空题", "简答题"]);
  const MOCK_EXAM_BLUEPRINT = Object.freeze({
    allocations: Object.freeze({ "单选题": 30, "多选题": 20, "判断题": 10 }),
    points: Object.freeze({ "单选题": 2, "多选题": 1.5, "判断题": 1 }),
    totalScore: 100,
    durationMinutes: 60,
  });
  const comparisonEntries = Array.isArray(window.ANNUAL_INSPECTION_2026_COMPARISONS) ? window.ANNUAL_INSPECTION_2026_COMPARISONS : [];
  // 学习统计「按周回看」的题库色块：9 色 = 6 个分类色 + 紫、褐、黄，固定不随强调色变。
  // 色块底是 color 的 14%（深色 20%）淡底，字用 text / dtext；浅深 18 项对比度实测均 ≥4.5（design-proposal 8.2），别改色值。
  // 内置题库在下面的定义里用 chip 指定序号、short 给显示用的短名；自建题库按 id 哈希落到这 9 色。都只用于显示，不进存储。
  const BANK_CHIP_COLORS = Object.freeze([
    { color: "#0A84FF", text: "#0040DD", dtext: "#6FB6FF" },
    { color: "#34C759", text: "#1F7A36", dtext: "#30DB5B" },
    { color: "#5856D6", text: "#3634A3", dtext: "#A5A3FF" },
    { color: "#30B0C7", text: "#0071A4", dtext: "#5AC8F5" },
    { color: "#FF9500", text: "#C93400", dtext: "#FFB340" },
    { color: "#FF2D55", text: "#C20B3C", dtext: "#FF6482" },
    { color: "#AF52DE", text: "#8944AB", dtext: "#DA8FFF" },
    { color: "#A2845E", text: "#7F6545", dtext: "#C4A582" },
    { color: "#FFCC00", text: "#8F6A00", dtext: "#FFD426" },
  ]);
  const builtInBankDefinitions = [
    {
      id: DEFAULT_BANK_ID,
      name: "【新】2026年度综合服务经理岗位准入资格年检题库",
      short: "年检2026",
      chip: 0,
      createdAt: "2026-08-17T00:00:00.000Z",
      questions: window.ANNUAL_INSPECTION_2026_QUESTION_BANK || [],
    },
    {
      id: LEGACY_ZONGFU_BANK_ID,
      name: "【旧】综合服务经理岗位准入资格考试（2023版）",
      short: "年检2023",
      chip: 8,
      createdAt: "2026-08-10T00:00:00.000Z",
      questions: window.QUESTION_BANK || [],
    },
    {
      id: DOMESTIC_SETTLEMENT_BANK_ID,
      name: "国内结算",
      short: "国内结算",
      chip: 1,
      createdAt: "2026-08-10T00:00:00.000Z",
      questions: window.DOMESTIC_SETTLEMENT_QUESTION_BANK || [],
    },
    {
      id: BILL_FINANCE_BANK_ID,
      name: "票据融资2024",
      short: "票据融资",
      chip: 4,
      createdAt: "2026-08-10T00:00:00.000Z",
      questions: window.BILL_FINANCE_QUESTION_BANK || [],
    },
    {
      id: BANK_ACCEPTANCE_BANK_ID,
      name: "银行承兑业务2024",
      short: "银承2024",
      chip: 5,
      createdAt: "2026-08-10T00:00:00.000Z",
      questions: window.BANK_ACCEPTANCE_QUESTION_BANK || [],
    },
    {
      id: COUNTERFEIT_CURRENCY_BANK_ID,
      name: "2023年现金从业人员反假货币考试",
      short: "反假货币",
      chip: 2,
      createdAt: "2026-08-19T00:00:00.000Z",
      questions: window.COUNTERFEIT_CURRENCY_2023_QUESTION_BANK || [],
    },
    {
      id: FOREIGN_EXCHANGE_BANK_ID,
      name: "福建省分行2026年对公境内外汇与跨境汇款从业资格考试",
      short: "对公外汇",
      chip: 3,
      createdAt: "2026-09-04T00:00:00.000Z",
      questions: window.FOREIGN_EXCHANGE_2026_QUESTION_BANK || [],
    },
    {
      id: WARNING_EDUCATION_SANMING_BANK_ID,
      name: "警示教育",
      short: "警示教育",
      chip: 6,
      createdAt: "2026-09-16T00:00:00.000Z",
      questions: window.WARNING_EDUCATION_SANMING_QUESTION_BANK || [],
    },
    {
      id: FX_LEVEL_ONE_BANK_ID,
      name: "外汇一级题库",
      short: "外汇一级",
      chip: 7,
      createdAt: "2026-09-18T00:00:00.000Z",
      questions: window.FX_LEVEL_ONE_QUESTION_BANK || [],
    },
  ];
  const builtInBankMap = new Map(builtInBankDefinitions.map((definition) => [definition.id, definition]));
  const legacyZongfuQuestions = builtInBankMap.get(LEGACY_ZONGFU_BANK_ID).questions;
  const bankProgressKey = (id) => `zongfu-quiz-progress-v2:${id}`;
  const bankEditKey = (id) => `zongfu-quiz-bank-state-v2:${id}`;
  const bankSourceKey = (id) => `zongfu-quiz-bank-source-v2:${id}`;
  // 答题方式偏好（背题快刷 / 思考做题）是「这台设备怎么刷」，不是某个题库的学习数据：
  // 单独存一个键，不进 state.preferences，这样切题库不会变、导出备份也不会带走它。
  const ANSWER_MODE_KEY = "shua-answer-mode";
  const emptyBankState = () => ({ version: 1, overrides: {}, custom: [], disabled: [] });
  // 搜题联想的关键词来源：41 个常见业务术语，联想里只出词和题数。3.13.0 前每个词还带一段解释，
  // 屋主说不要了，解释正文全部删掉，只留术语名。
  const SEARCH_KEYWORDS = Object.freeze([
    "信用报告",
    "个人信息主体",
    "公平交易权",
    "消费者权益保护",
    "小额账户",
    "日均余额",
    "见证服务",
    "核心银行系统",
    "特殊账号",
    "票据贴现",
    "贴现利息",
    "商业汇票",
    "承兑",
    "承兑人",
    "银行承兑汇票",
    "商业承兑汇票",
    "持票人",
    "付款请求权",
    "追索权",
    "背书",
    "保证金",
    "保证金台账",
    "承兑行",
    "账户行",
    "电子商业汇票",
    "结算账户",
    "清算",
    "账单日",
    "还款日",
    "最低还款额",
    "分期付款",
    "授信",
    "普惠金融",
    "贷款资金",
    "自主支付",
    "受托支付",
    "抵押",
    "质押",
    "反洗钱",
    "客户身份识别",
    "可疑交易",
  ]);

  function normalizeQuestion(question, forcedId = null) {
    const type = QUESTION_TYPES.includes(question?.type) ? question.type : "单选题";
    const difficulty = ["低", "中", "高"].includes(question?.difficulty) ? question.difficulty : "中";
    const subjective = SUBJECTIVE_TYPES.includes(type);
    const options = Array.isArray(question?.options) ? question.options.map((item) => String(item).trim()).filter(Boolean) : [];
    const correct = Array.isArray(question?.correct) ? [...new Set(question.correct.map(Number))].filter((index) => Number.isInteger(index) && index >= 0 && index < options.length).sort((a, b) => a - b) : [];
    const answer = String(question?.answer || "").trim();
    if (!forcedId || !String(question?.stem || "").trim() || (subjective ? !answer : options.length < 1 || options.length > 8 || !correct.length)) throw new Error("invalid-question");
    return {
      id: forcedId,
      number: Number(question.number) || 0,
      type,
      difficulty,
      stem: String(question.stem).trim(),
      options,
      correct,
      ...(subjective ? { answer } : {}),
      explanation: String(question.explanation || "").trim(),
      ...(question.sourceRow ? { sourceRow: question.sourceRow } : {}),
    };
  }

  function hydrateBankState(saved, currentBaseMap = baseQuestionMap) {
    if (!saved || saved.version !== 1) throw new Error("invalid-bank");
    const bank = emptyBankState();
    Object.entries(saved.overrides || {}).forEach(([id, question]) => {
      if (currentBaseMap.has(id)) bank.overrides[id] = normalizeQuestion(question, id);
    });
    const usedIds = new Set(currentBaseMap.keys());
    (saved.custom || []).forEach((question) => {
      const id = String(question?.id || "");
      if (!id.startsWith("custom-") || usedIds.has(id)) throw new Error("invalid-bank");
      bank.custom.push(normalizeQuestion(question, id));
      usedIds.add(id);
    });
    bank.disabled = [...new Set((saved.disabled || []).map(String))].filter((id) => usedIds.has(id));
    return bank;
  }

  function builtInBankMeta(id) {
    const definition = builtInBankMap.get(id);
    if (!definition) throw new Error("unknown-builtin-bank");
    return {
      id: definition.id,
      name: definition.name,
      kind: "builtin",
      createdAt: definition.createdAt,
      questionCount: definition.questions.length,
    };
  }

  function emptyBankRegistry() {
    return {
      version: 2,
      activeBankId: DEFAULT_BANK_ID,
      banks: builtInBankDefinitions.map((definition) => builtInBankMeta(definition.id)),
    };
  }

  function hydrateBankRegistry(saved) {
    if (!saved || saved.version !== 2 || !Array.isArray(saved.banks)) throw new Error("invalid-registry");
    const ids = new Set();
    const banks = saved.banks.map((bank) => {
      const id = String(bank?.id || "");
      const name = String(bank?.name || "").trim();
      const definition = builtInBankMap.get(id);
      const kind = definition ? "builtin" : "local";
      if (!/^[a-z0-9-]{3,80}$/i.test(id) || !name || ids.has(id)) throw new Error("invalid-registry");
      ids.add(id);
      return {
        id,
        // 内置题库名称和排序由随包定义控制，升级后可明确显示新旧标识；本地题库仍保留用户命名。
        name: definition ? definition.name : name.slice(0, 60),
        kind,
        createdAt: definition ? definition.createdAt : String(bank.createdAt || new Date().toISOString()),
        questionCount: definition ? definition.questions.length : Math.max(0, Number(bank.questionCount) || 0),
      };
    });
    const savedById = new Map(banks.map((bank) => [bank.id, bank]));
    const builtIns = builtInBankDefinitions.map((definition) => savedById.get(definition.id) || builtInBankMeta(definition.id));
    const locals = banks.filter((bank) => bank.kind === "local");
    const hydratedBanks = [...builtIns, ...locals];
    const hydratedIds = new Set(hydratedBanks.map((bank) => bank.id));
    const activeBankId = hydratedIds.has(saved.activeBankId) ? saved.activeBankId : DEFAULT_BANK_ID;
    return { version: 2, activeBankId, banks: hydratedBanks };
  }

  function loadBankRegistry() {
    try {
      const saved = JSON.parse(localStorage.getItem(BANK_REGISTRY_KEY));
      return saved ? hydrateBankRegistry(saved) : emptyBankRegistry();
    } catch (_error) {
      return emptyBankRegistry();
    }
  }

  function activeBankMeta() {
    return bankRegistry.banks.find((bank) => bank.id === bankRegistry.activeBankId) || bankRegistry.banks[0];
  }

  function normalizeStoredSource(saved) {
    if (!saved || saved.version !== 1 || !Array.isArray(saved.questions)) throw new Error("invalid-source");
    const usedIds = new Set();
    return saved.questions.map((question, index) => {
      const id = String(question?.id || `q-${index + 1}`);
      if (!/^[a-z0-9-]{1,80}$/i.test(id) || usedIds.has(id)) throw new Error("invalid-source");
      usedIds.add(id);
      return normalizeQuestion(question, id);
    });
  }

  function loadBaseQuestions(bank) {
    const definition = builtInBankMap.get(bank.id);
    if (definition) return definition.questions;
    try {
      return normalizeStoredSource(JSON.parse(localStorage.getItem(bankSourceKey(bank.id))));
    } catch (_error) {
      return [];
    }
  }

  let bankRegistry = loadBankRegistry();
  let currentBank = activeBankMeta();
  let baseQuestions = loadBaseQuestions(currentBank);
  let baseQuestionMap = new Map(baseQuestions.map((question) => [question.id, question]));

  function loadBankStateFor(bank, currentBaseMap) {
    try {
      const currentKey = bankEditKey(bank.id);
      const raw = localStorage.getItem(currentKey) || (bank.id === LEGACY_ZONGFU_BANK_ID ? localStorage.getItem(LEGACY_BANK_STORAGE_KEY) : null);
      const saved = JSON.parse(raw);
      return saved ? hydrateBankState(saved, currentBaseMap) : emptyBankState();
    } catch (_error) {
      return emptyBankState();
    }
  }

  function loadBankState() {
    return loadBankStateFor(currentBank, baseQuestionMap);
  }

  let bankState = loadBankState();
  let questions = [];
  let questionMap = new Map();

  function managedQuestionsFor(sourceQuestions, edits) {
    const managed = sourceQuestions.map((question) => edits.overrides[question.id] || question);
    return [...managed, ...edits.custom].map((question, index) => ({ ...question, number: index + 1 }));
  }

  function allManagedQuestions() {
    return managedQuestionsFor(baseQuestions, bankState);
  }

  function rebuildQuestionBank() {
    const disabled = new Set(bankState.disabled);
    questions = allManagedQuestions().filter((question) => !disabled.has(question.id));
    questionMap = new Map(questions.map((question) => [question.id, question]));
  }

  rebuildQuestionBank();
  const navItems = [
    { id: "home", label: "首页", icon: "house" },
    { id: "practice", label: "专项练习", icon: "list-checks" },
    { id: "search", label: "搜题", icon: "search" },
    { id: "comparison", label: "新旧对比", mobileLabel: "对比", icon: "git-compare-arrows" },
    { id: "library", label: "错题与标记", icon: "bookmark-check" },
    { id: "stats", label: "学习统计", icon: "chart-no-axes-column-increasing" },
    { id: "bank", label: "题库管理", icon: "library-big" },
    { id: "data", label: "数据管理", icon: "database-backup" },
  ];
  const intervals = [1, 3, 7, 15, 30];
  const optionLetters = "ABCDEFGH";
  const view = document.getElementById("view");
  const toast = document.getElementById("toast");
  const backupFile = document.getElementById("backup-file");
  const bankFile = document.getElementById("bank-file");
  const noteDialog = document.getElementById("note-dialog");
  const noteText = document.getElementById("note-text");
  const questionDialog = document.getElementById("question-dialog");
  const questionForm = document.getElementById("question-form");
  const bankDialog = document.getElementById("bank-dialog");
  const bankForm = document.getElementById("bank-form");
  const answerModeDialog = document.getElementById("answer-mode-dialog");
  let currentPage = "home";
  let timerHandle = null;
  let autoAdvanceHandle = null;
  let noteTarget = null;
  let libraryFilter = "wrong";
  let bankPage = 0;
  let editingQuestionId = null;
  let bankDialogMode = "create";
  let lastSummary = null;
  let mobileMoreOpen = false;
  let quizSwipeEnterDirection = "";
  let quizSwipeBusy = false;
  let answerModePending = null;
  const rememberedAnswerMode = readStoredAnswerMode();
  let answerMode = rememberedAnswerMode || "think";
  let answerModeRemembered = Boolean(rememberedAnswerMode);
  const SESSION_HISTORY_LIMIT = 10;

  const emptyState = () => ({
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    records: {},
    daily: {},
    sessions: [],
    preferences: { dailyGoal: 30 },
    brush: { index: 0, completed: 0, cycles: 0, lastAnsweredId: null, lastAnsweredAt: null },
    review: { index: 0, signature: "", lastAt: null },
    activeSession: null,
  });

  function normalizeSessionHistory(items) {
    return (Array.isArray(items) ? items : [])
      .filter((item) => item && item.date && item.title)
      .filter((item, index, list) => list.findIndex((candidate) => candidate.date === item.date && candidate.title === item.title && candidate.total === item.total) === index)
      .sort((left, right) => (Date.parse(right.date) || 0) - (Date.parse(left.date) || 0))
      .slice(0, SESSION_HISTORY_LIMIT);
  }

  function hydrateState(saved) {
    const fresh = emptyState();
    return {
      ...fresh,
      ...saved,
      sessions: normalizeSessionHistory(saved?.sessions),
      preferences: { ...fresh.preferences, ...(saved.preferences || {}) },
      brush: { ...fresh.brush, ...(saved.brush || {}) },
      // review 是 3.11.2 之后才有的字段：老存档里没有，这里补上默认值，读出来就当没看过。
      review: { ...fresh.review, ...(saved.review || {}) },
    };
  }

  function loadStateFor(bank) {
    try {
      const currentKey = bankProgressKey(bank.id);
      const raw = localStorage.getItem(currentKey) || (bank.id === LEGACY_ZONGFU_BANK_ID ? localStorage.getItem(LEGACY_STORAGE_KEY) : null);
      const saved = JSON.parse(raw);
      if (!saved || saved.version !== 1) return emptyState();
      return hydrateState(saved);
    } catch (_error) {
      return emptyState();
    }
  }

  function loadState() {
    return loadStateFor(currentBank);
  }

  let state = loadState();
  const bankContextCache = new Map();

  function getBankContext(bankId) {
    const meta = bankRegistry.banks.find((bank) => bank.id === bankId);
    if (!meta) return null;
    if (bankId === currentBank.id) return { meta: currentBank, questions, questionMap, state };
    if (bankContextCache.has(bankId)) return bankContextCache.get(bankId);
    const sourceQuestions = loadBaseQuestions(meta);
    const sourceMap = new Map(sourceQuestions.map((question) => [question.id, question]));
    const edits = loadBankStateFor(meta, sourceMap);
    const disabled = new Set(edits.disabled);
    const enabledQuestions = managedQuestionsFor(sourceQuestions, edits).filter((question) => !disabled.has(question.id));
    const context = {
      meta,
      questions: enabledQuestions,
      questionMap: new Map(enabledQuestions.map((question) => [question.id, question])),
      state: loadStateFor(meta),
    };
    bankContextCache.set(bankId, context);
    return context;
  }

  function resumableStudies() {
    return bankRegistry.banks.map((bank) => {
      const context = getBankContext(bank.id);
      const session = context?.state?.activeSession;
      if (!session?.ids?.length) return null;
      const validIndex = Math.min(Math.max(0, Number(session.index) || 0), session.ids.length - 1);
      return { bank, context, session, index: validIndex, savedAt: Date.parse(context.state.updatedAt || 0) || 0 };
    }).filter(Boolean).sort((left, right) => right.savedAt - left.savedAt);
  }

  function latestResumableStudy() {
    return resumableStudies()[0] || null;
  }

  function resumeStudy(bankId) {
    const saved = resumableStudies().find((item) => item.bank.id === bankId) || latestResumableStudy();
    if (!saved) return showToast("暂时没有可继续的学习进度");
    if (saved.bank.id !== currentBank.id && !activateQuestionBank(saved.bank.id)) return showToast("无法打开上次使用的题库");
    reconcileActiveSession();
    if (!state.activeSession?.ids?.length) return showToast("上次学习的题目已不可用");
    navigate("quiz");
  }

  function makeQuestionKey(bankId, questionId) {
    return `${bankId}::${questionId}`;
  }

  function parseQuestionKey(key) {
    const parts = String(key || "").split("::");
    if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
    return { bankId: parts[0], questionId: parts[1] };
  }

  function resolveSessionQuestion(session, index = session?.index) {
    if (!session?.ids?.length || index < 0 || index >= session.ids.length) return null;
    const sessionKey = session.ids[index];
    if (session.scope !== "mixed") {
      const question = questionMap.get(sessionKey);
      return question ? { sessionKey, bankId: currentBank.id, questionId: question.id, bankName: currentBank.name, question, context: getBankContext(currentBank.id) } : null;
    }
    const ref = parseQuestionKey(sessionKey);
    const context = ref && getBankContext(ref.bankId);
    const question = context?.questionMap.get(ref.questionId);
    return question ? { sessionKey, bankId: ref.bankId, questionId: ref.questionId, bankName: context.meta.name, question, context } : null;
  }

  function reconcileActiveSession() {
    const session = state.activeSession;
    if (session?.ids?.length) {
      const ids = session.scope === "mixed"
        ? session.ids.filter((id) => resolveSessionQuestion({ ...session, ids: [id], index: 0 }))
        : session.ids.filter((id) => questionMap.has(id));
      if (ids.length) {
        session.ids = ids;
        session.index = Math.min(Math.max(0, session.index), ids.length - 1);
      } else {
        state.activeSession = null;
      }
    }
    state.brush.index = questions.length ? Math.min(Math.max(0, Number(state.brush.index) || 0), questions.length - 1) : 0;
  }

  /* ── 自动看题的位置记忆 ─────────────────────────────────────────────────────
   * 连续刷题靠 state.brush.index 续做，自动看题原来没有任何位置记忆，每次点进去都是第 1 题。
   * 现在同样把位置存进 state（state.review），另外带一个 signature 判断「还是不是上次那批题」：
   * 自动看题的题目集合不像连续刷题那样固定是整个题库——专项练习里选「自动看题」可以是任意子集，
   * 混合题库还会跨库。集合变了就必须从第 1 题重新开始，否则「第 N 题」指的根本不是同一道题。
   *
   * signature 不存整串 id（整库 799 条要 8KB 上下，而且每次翻页都要写一遍），存的是
   * 「条数 + 首尾 id + 全部 id 逐字算出的 32 位哈希」：每个 id 和它的位置都参与运算，
   * 与 startBrush 里逐个 id 比对一样对增、删、换序敏感，但长度固定。
   */
  function sessionSignature(ids) {
    if (!Array.isArray(ids) || !ids.length) return "";
    const joined = ids.join("\u0001");
    let hash = 2166136261;
    for (let index = 0; index < joined.length; index += 1) {
      hash ^= joined.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return `${ids.length}:${ids[0]}:${ids[ids.length - 1]}:${(hash >>> 0).toString(36)}`;
  }

  function reviewProgress(source = state) {
    const saved = source?.review || {};
    return {
      index: Math.max(0, Number(saved.index) || 0),
      signature: String(saved.signature || ""),
      lastAt: saved.lastAt || null,
    };
  }

  // 每次存档时把自动看题的当前题号抄进 state.review。自动翻页、上一题 / 下一题、按题号跳转、
  // 滑动翻页改完 session.index 之后都会调 saveState()，抄在这一处就不会漏掉哪一条路径。
  function rememberReviewPosition() {
    const session = state.activeSession;
    if (session?.mode !== "review" || !session.ids?.length) return;
    state.review = {
      index: Math.min(Math.max(0, Number(session.index) || 0), session.ids.length - 1),
      signature: sessionSignature(session.ids),
      lastAt: new Date().toISOString(),
    };
  }

  function saveBankState() {
    try {
      localStorage.setItem(bankEditKey(currentBank.id), JSON.stringify(bankState));
      rebuildQuestionBank();
      currentBank.questionCount = allManagedQuestions().length;
      localStorage.setItem(BANK_REGISTRY_KEY, JSON.stringify(bankRegistry));
      reconcileActiveSession();
      saveState();
      return true;
    } catch (_error) {
      showToast("题库保存失败，请先导出题库备份");
      return false;
    }
  }

  function saveState() {
    rememberReviewPosition();
    persistProgressFor(currentBank.id, state);
    updateSidebarGoal();
  }

  function persistProgressFor(bankId, progressState) {
    progressState.updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(bankProgressKey(bankId), JSON.stringify(progressState));
      return true;
    } catch (_error) {
      showToast("进度保存失败，请立即导出备份");
      return false;
    }
  }

  function persistBankRegistry() {
    try {
      localStorage.setItem(BANK_REGISTRY_KEY, JSON.stringify(bankRegistry));
      return true;
    } catch (_error) {
      showToast("题库列表保存失败，请减少已导入的题库数量");
      return false;
    }
  }

  function stopQuizTimers() {
    clearInterval(timerHandle);
    clearTimeout(autoAdvanceHandle);
    timerHandle = null;
    autoAdvanceHandle = null;
  }

  function loadActiveBankData() {
    bankContextCache.clear();
    currentBank = activeBankMeta();
    baseQuestions = loadBaseQuestions(currentBank);
    baseQuestionMap = new Map(baseQuestions.map((question) => [question.id, question]));
    bankState = loadBankState();
    rebuildQuestionBank();
    state = loadState();
    reconcileActiveSession();
  }

  function activateQuestionBank(id) {
    if (id === currentBank.id) return true;
    if (!bankRegistry.banks.some((bank) => bank.id === id)) return false;
    stopQuizTimers();
    if (!saveBankState()) return false;
    const previousId = bankRegistry.activeBankId;
    bankRegistry.activeBankId = id;
    if (!persistBankRegistry()) {
      bankRegistry.activeBankId = previousId;
      return false;
    }
    loadActiveBankData();
    editingQuestionId = null;
    noteTarget = null;
    lastSummary = null;
    bankPage = 0;
    saveBankState();
    return true;
  }

  function switchQuestionBank(id, destination = "bank") {
    if (id === currentBank.id || !activateQuestionBank(id)) return;
    showToast(`已切换到“${currentBank.name}”`);
    navigate(destination);
  }

  function recordForState(progressState, id) {
    if (!progressState.records[id]) {
      progressState.records[id] = {
        attempts: 0, correctCount: 0, wrongCount: 0, streak: 0,
        wrong: false, hard: false, favorite: false, mastered: false,
        reviewLevel: 0, nextReview: null, lastAnswer: [], lastCorrect: null,
        lastAnsweredAt: null, note: "",
      };
    }
    return progressState.records[id];
  }

  function recordFor(id) {
    return recordForState(state, id);
  }

  function recordViewForState(progressState, id) {
    return progressState.records[id] || {
      attempts: 0, correctCount: 0, wrongCount: 0, streak: 0,
      wrong: false, hard: false, favorite: false, mastered: false,
      reviewLevel: 0, nextReview: null, lastAnswer: [], lastCorrect: null,
      lastAnsweredAt: null, note: "",
    };
  }

  function recordView(id) {
    return recordViewForState(state, id);
  }

  function localDate(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function addDays(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return localDate(date);
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char]));
  }

  // 3.13.0 起几处交互动效共用：系统开了「减弱动态效果」时一律瞬间变化。
  const prefersReducedMotion = () => Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);

  // 「撑开 / 补位」统一走 FLIP：先量这些元素的旧位置，执行 mutate() 改 DOM，再量新位置，
  // 用 transform 从旧位置滑回新位置。只动 transform（合成层完成），不逐帧改 width / height。
  // 返回 mutate() 的返回值；减弱动态效果时只执行 mutate()，不做动画。
  // 连点时上一轮补位可能还在播：旧位置照「此刻屏幕上的样子」量（含那段位移），量完先撤掉上一轮，
  // 新位置才量得准；不撤的话新位置里还带着上一轮的位移，会一帧跳一截。
  const flipAnimations = new WeakMap();
  function flipMove(elements, mutate, { duration = 240, easing = "cubic-bezier(.2, .8, .2, 1)" } = {}) {
    const items = [...elements].filter(Boolean);
    const before = new Map(items.map((element) => [element, element.getBoundingClientRect()]));
    items.forEach((element) => flipAnimations.get(element)?.cancel());
    const result = mutate();
    if (prefersReducedMotion() || typeof Element.prototype.animate !== "function") return result;
    items.forEach((element) => {
      if (!element.isConnected) return;
      const from = before.get(element);
      const to = element.getBoundingClientRect();
      const dx = from.left - to.left;
      const dy = from.top - to.top;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
      flipAnimations.set(element, element.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }], { duration, easing }));
    });
    return result;
  }

  function icons() {
    if (window.lucide) window.lucide.createIcons({ attrs: { "stroke-width": 1.9 } });
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timeout);
    showToast.timeout = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  function fx(method, ...args) {
    try { return window.ShuaFx?.[method]?.(...args); } catch (_error) { /* 3D 只是点缀，任何异常都不能打断刷题 */ }
  }

  function shuffle(items) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const target = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[target]] = [copy[target], copy[index]];
    }
    return copy;
  }

  function sameAnswer(left = [], right = []) {
    return [...left].sort((a, b) => a - b).join(",") === [...right].sort((a, b) => a - b).join(",");
  }

  function isSubjectiveQuestion(question) {
    return SUBJECTIVE_TYPES.includes(question?.type);
  }

  function fillBlankCount(question) {
    return Math.max(1, (String(question?.stem || "").match(/_{2,}/g) || []).length);
  }

  function fillAnswerParts(question) {
    const expectedCount = fillBlankCount(question);
    let parts = String(question?.answer || "").split(/[，,；;、]/).map((part) => part.trim()).filter(Boolean);
    if (parts.length !== expectedCount) {
      const expanded = String(question?.answer || "").split(/[，,；;、]|或/).map((part) => part.trim()).filter(Boolean);
      if (expanded.length === expectedCount) parts = expanded;
    }
    return parts;
  }

  function fillSubmittedParts(question, answer) {
    if (Array.isArray(answer)) return answer.map((part) => String(part || "").trim());
    const text = String(answer || "").trim();
    if (!text) return Array(fillBlankCount(question)).fill("");
    const parts = text.split(/[，,；;、]/).map((part) => part.trim());
    return parts.length === fillBlankCount(question) ? parts : [text, ...Array(Math.max(0, fillBlankCount(question) - 1)).fill("")];
  }

  function emptyAnswerForQuestion(question) {
    return question?.type === "填空题" ? Array(fillBlankCount(question)).fill("") : (isSubjectiveQuestion(question) ? "" : []);
  }

  function normalizeTextAnswer(value) {
    return String(value || "").toLowerCase().replace(/[\s，,。；;、：:“”"'‘’（）()《》【】\-_]/g, "");
  }

  function answerIsCorrect(question, answer) {
    if (!isSubjectiveQuestion(question)) return sameAnswer(Array.isArray(answer) ? answer : [], question.correct);
    if (question.type === "简答题") return Boolean(normalizeTextAnswer(answer));
    const expectedParts = fillAnswerParts(question).map(normalizeTextAnswer);
    const submittedParts = fillSubmittedParts(question, answer).map(normalizeTextAnswer);
    return expectedParts.length === submittedParts.length && expectedParts.every((part, index) => part === submittedParts[index]);
  }

  function formatSeconds(seconds) {
    const safe = Math.max(0, Math.floor(seconds));
    return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
  }

  function formatSessionDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "时间未知";
    return new Intl.DateTimeFormat("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(date);
  }

  function dueQuestions() {
    const today = localDate();
    return questions.filter((question) => {
      const record = state.records[question.id];
      if (!record || record.mastered || (!record.wrong && !record.hard)) return false;
      return !record.nextReview || record.nextReview <= today;
    }).sort((a, b) => {
      const left = state.records[a.id];
      const right = state.records[b.id];
      return Number(right.hard) - Number(left.hard) || right.wrongCount - left.wrongCount;
    });
  }

  function updateSidebarGoal() {
    const goal = Math.max(1, Number(state.preferences.dailyGoal) || 30);
    const answered = state.daily[localDate()]?.answered || 0;
    const text = document.getElementById("sidebar-goal");
    const bar = document.getElementById("sidebar-progress-bar");
    if (text) text.textContent = `${answered} / ${goal}`;
    if (bar) bar.style.width = `${Math.min(100, answered / goal * 100)}%`;
  }

  /* ── 界面外观：浅/深/自动 + 六个强调色 ──────────────────────────────────────
     偏好由 theme.js 在样式表之前就写进 <html data-mode> / <html data-accent>（免闪色），
     这里只管切换和刷新控件状态。只存 localStorage 的 shua-mode / shua-accent，
     不进题库进度、不进备份。切换不重绘整页：改属性就够了，所有颜色都走 CSS 变量。 */
  const MODE_LABELS = { light: "浅色", dark: "深色", auto: "自动" };
  const ACCENT_LABELS = { blue: "蓝", green: "绿", indigo: "靛", orange: "橙", pink: "粉", teal: "青" };
  const modeList = () => window.ShuaTheme?.modes || Object.keys(MODE_LABELS);
  const accentList = () => window.ShuaTheme?.accents || Object.keys(ACCENT_LABELS);
  const currentMode = () => window.ShuaTheme?.getMode() || document.documentElement.dataset.mode || "light";
  const currentAccent = () => window.ShuaTheme?.getAccent() || document.documentElement.dataset.accent || "blue";

  // 侧栏底部和手机「更多」面板共用这一段；侧栏那份是 index.html 里的静态节点。
  function themeSwitchHtml() {
    const activeMode = currentMode();
    const activeAccent = currentAccent();
    const modes = modeList()
      .map((id) => `<button class="theme-option" type="button" role="radio" data-action="setMode" data-mode="${escapeHtml(id)}" aria-checked="${id === activeMode}" tabindex="${id === activeMode ? 0 : -1}">${escapeHtml(MODE_LABELS[id] || id)}</button>`)
      .join("");
    const accents = accentList()
      .map((id) => `<button class="accent-option" type="button" data-action="setAccent" data-accent="${escapeHtml(id)}" aria-pressed="${id === activeAccent}" aria-label="${escapeHtml(ACCENT_LABELS[id] || id)}"></button>`)
      .join("");
    return `<div class="theme-switch" role="radiogroup" aria-label="界面明暗">${modes}</div><span class="accent-label">强调色</span><div class="accent-switch" role="group" aria-label="强调色">${accents}</div>`;
  }

  function syncThemeControls() {
    const activeMode = currentMode();
    const activeAccent = currentAccent();
    // 明暗是单选（radiogroup + radio + aria-checked），只有选中那项留在 Tab 序列里，组内用方向键换；
    // 强调色是一组 aria-pressed 按钮（SPEC §3），每个都能 Tab 到。
    document.querySelectorAll(".theme-switch [data-mode]").forEach((button) => {
      const checked = button.dataset.mode === activeMode;
      button.setAttribute("aria-checked", String(checked));
      button.tabIndex = checked ? 0 : -1;
    });
    document.querySelectorAll(".accent-switch [data-accent]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.accent === activeAccent));
    });
  }

  // 点已经选中的那一项也照样写一次偏好：这样「我就要浅色」会被真正记下来，
  // 而不是因为当前恰好是默认值就什么都不做。
  function setMode(id) {
    if (!id) return;
    window.ShuaTheme?.setMode(id);
    syncThemeControls();
  }

  function setAccent(id) {
    if (!id) return;
    window.ShuaTheme?.setAccent(id);
    syncThemeControls();
  }

  /* 导航同时产出三份，靠 CSS 断点切换显示，不在 JS 里判断视口：
     - #main-nav：≥901px 是左侧栏、600–900px 收成顶栏（八项横向可滚 + 末尾「更多」）；
     - #mobile-nav：≤600px 的底部玻璃 tab bar（首页 / 专项练习 / 搜题 / 更多）；
     - #more-layer：两个断点共用的「更多」面板，600–900 从顶栏下拉、≤600 从底部弹出。 */
  function renderNav() {
    const renderButton = (item, className = "") => `<button class="nav-item ${className} ${currentPage === item.id ? "active" : ""}" data-nav="${item.id}" type="button"><i data-lucide="${item.icon}"></i><span>${item.mobileLabel || item.label}</span></button>`;
    const learningItems = navItems.filter((item) => !["bank", "data"].includes(item.id));
    const managementItems = navItems.filter((item) => ["bank", "data"].includes(item.id));
    const mobilePrimaryItems = navItems.filter((item) => ["home", "practice", "search"].includes(item.id));
    const mobileSecondaryItems = navItems.filter((item) => !mobilePrimaryItems.includes(item));
    const moreIsActive = mobileMoreOpen || mobileSecondaryItems.some((item) => currentPage === item.id);
    const moreTrigger = (className) => `<button class="nav-item ${className} ${moreIsActive ? "active" : ""}" data-action="toggleMobileMore" type="button" aria-expanded="${mobileMoreOpen}" aria-controls="mobile-more-menu"><i data-lucide="menu"></i><span>更多</span></button>`;
    document.getElementById("main-nav").innerHTML = `${learningItems.map((item) => renderButton(item)).join("")}<div class="nav-section-label">题库与数据</div>${managementItems.map((item) => renderButton(item)).join("")}${moreTrigger("nav-more")}`;
    document.getElementById("mobile-nav").innerHTML = `${mobilePrimaryItems.map((item) => renderButton(item)).join("")}${moreTrigger("mobile-more-trigger")}`;
    document.getElementById("more-layer").innerHTML = mobileMoreOpen
      ? `<section class="mobile-more-sheet" id="mobile-more-menu" aria-label="更多功能">${mobileSecondaryItems.map((item) => renderButton(item, "mobile-more-item")).join("")}${themeSwitchHtml()}<div class="sheet-stamp">v${escapeHtml(projectInfo.version)} · ${escapeHtml(projectInfo.author)}</div></section>`
      : "";
    icons();
    syncThemeControls();
    updateSidebarGoal();
  }

  function navigate(page) {
    stopQuizTimers();
    if (page !== "quiz" && state.activeSession?.mode === "review" && state.activeSession.autoPlaying) {
      state.activeSession.autoPlaying = false;
      state.activeSession.autoNextAt = null;
      saveState();
    }
    currentPage = page;
    mobileMoreOpen = false;
    renderNav();
    if (!["home", "quiz", "summary"].includes(page)) fx("page", "none");
    if (page === "home") renderHome();
    if (page === "practice") renderPractice();
    if (page === "search") renderQuestionSearch();
    if (page === "comparison") renderQuestionComparison();
    if (page === "library") renderLibrary();
    if (page === "stats") { statsWeekOffset = 0; renderStats(); }
    if (page === "bank") renderBankManager();
    if (page === "data") renderData();
    if (page === "quiz") renderQuiz();
    if (page === "summary") renderSummary();
    window.scrollTo({ top: 0, behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ? "auto" : "smooth" });
  }

  function aggregate() {
    const records = Object.values(state.records);
    const answered = records.filter((record) => record.attempts > 0).length;
    const attempts = records.reduce((sum, record) => sum + record.attempts, 0);
    const correct = records.reduce((sum, record) => sum + record.correctCount, 0);
    return {
      answered,
      attempts,
      accuracy: attempts ? Math.round(correct / attempts * 100) : 0,
      wrong: records.filter((record) => record.wrong && !record.mastered).length,
      hard: records.filter((record) => record.hard && !record.mastered).length,
      favorite: records.filter((record) => record.favorite).length,
      mastered: records.filter((record) => record.mastered).length,
      due: dueQuestions().length,
    };
  }

  // 按压光斑层（3.13.0）：「练习方式」每个分组列表末尾一个，垫在所有行底下，平时 opacity 0、不占版面；
  // 放在末尾是为了不改变 .mode-button:first-child。怎么动见下面「首页入口行的按压反馈」。
  const MODE_GLOW = '<span class="mode-glow" aria-hidden="true"></span>';

  function renderHome() {
    const stats = aggregate();
    const today = state.daily[localDate()] || { answered: 0, correct: 0 };
    const goal = Math.max(1, Number(state.preferences.dailyGoal) || 30);
    const percent = Math.min(100, Math.round(today.answered / goal * 100));
    const resumableStudy = latestResumableStudy();
    const resumeChoices = resumableStudies().slice(0, 4);
    const resume = Boolean(resumableStudy);
    // 「最近学习」：≥2 个题库有未完成练习才出现（只有 1 个时，大卡的「继续上次学习」已经指向它）。
    // 放在统计卡那一行、环形卡正下方那一格，卡面与统计卡相同；最多 4 条（上面 slice 定的），桌面上卡内放不下就自身滚动，
    // 所以超过 2 条时标题带上总数，提示下面还有。
    const hasResumeCard = resumeChoices.length > 1;
    const resumeCard = hasResumeCard ? `<div class="resume-card"><div class="metric-head"><span>${resumeChoices.length > 2 ? `最近学习 · 共${resumeChoices.length}个` : "最近学习"}</span><i data-lucide="history"></i></div><div class="resume-list">${resumeChoices.map((item) => {
      const progress = `第${item.index + 1}/${item.session.ids.length}题`;
      const label = `继续${item.bank.name}：${item.session.title || "练习"} · ${progress}`;
      return `<button class="resume-item" data-action="resumeBank" data-bank-id="${escapeHtml(item.bank.id)}" type="button" title="${escapeHtml(label)}" aria-label="${escapeHtml(label)}"><strong>${escapeHtml(item.bank.name)}</strong><span>${progress}</span></button>`;
    }).join("")}</div></div>` : "";
    const resumeDescription = resume ? `上次：${resumableStudy.session.title || "练习"} · 第${resumableStudy.index + 1}/${resumableStudy.session.ids.length}题 · ${resumableStudy.bank.name}` : "每次选择、作答和翻页都会自动保存";
    const brushIndex = Math.min(Math.max(0, Number(state.brush.index) || 0), questions.length - 1);
    const brushActive = state.activeSession?.mode === "brush";
    // 自动看题那一行也用右侧那个胶囊写清楚「点进去会从第几题开始」：首页不新增元素。
    // 首页的「自动看题」看的是当前题库的全部题目、按原顺序，所以拿它算 signature 对账；
    // 专项练习里挑子集的那种自动看题签名不同，这里就不显示，免得数字对不上。
    const reviewSaved = reviewProgress();
    const reviewResumeIndex = reviewSaved.signature && reviewSaved.signature === sessionSignature(questions.map((question) => question.id)) ? Math.min(reviewSaved.index, Math.max(0, questions.length - 1)) : 0;
    const reviewBadge = reviewResumeIndex > 0 ? `${reviewResumeIndex + 1} / ${questions.length}` : "";
    // 左列是按题型刷，右列是按标记刷；两列都用同一种分组列表行，窄屏自动叠成一列。
    const typeRows = [
      modeButton("list-checks", "单选题练习", `从${questions.filter((question) => question.type === "单选题").length}道单选题中随机抽取`, "quickType", "单选题", "green"),
      modeButton("list-plus", "多选题练习", "多选少选均判为错误", "quickType", "多选题", "indigo"),
      modeButton("scan-search", "判断题练习", "快速巩固判断类知识", "quickType", "判断题", "teal"),
      questions.some((question) => question.type === "填空题") ? modeButton("text-cursor-input", "填空题练习", "按题目空位逐空填写", "quickType", "填空题", "teal") : "",
      questions.some((question) => question.type === "简答题") ? modeButton("notebook-tabs", "简答题练习", "先写要点，再对照参考答案", "quickType", "简答题", "green") : "",
    ].join("");
    const markRows = [
      modeButton("badge-help", "不会题专项", `${stats.hard}道手动标记`, "hardPractice", "", "orange", stats.hard || ""),
      modeButton("circle-x", "错题专项", `${stats.wrong}道未掌握错题`, "wrongPractice", "", "red", stats.wrong || ""),
      modeButton("star", "标记题专项", `${stats.favorite}道已标记`, "practiceLibrary", "favorite", "pink", stats.favorite || ""),
      modeButton("timer", "模拟考试", "单选30 · 多选20 · 判断10 · 满分100", "exam", "", "indigo"),
    ].join("");
    view.innerHTML = `
      <div class="page-header"><div>${pageTitle("学习首页")}<p><span class="subtitle-full">当前题库：${escapeHtml(currentBank.name)} · 共${questions.length}道，今天从最需要巩固的内容开始。</span><span class="subtitle-short">题库：${escapeHtml(currentBank.name)}</span></p></div><div class="header-actions"><button class="button glass" data-action="random20"><i data-lucide="shuffle"></i>随机20题</button></div></div>
      <section class="dashboard-band${hasResumeCard ? " has-resume" : ""}">
        <div class="today-panel">
          <div>
            <span class="today-label">今日复习</span>
            <h2>${resume ? "可继续上次学习" : stats.due ? `有${stats.due}道题等待巩固` : "今日复习已清空"}</h2>
            <p>${resume ? escapeHtml(resumeDescription) : stats.hard ? `其中${stats.hard}道由你手动标记为“不会”` : "答错或标记不会的题会按记忆间隔再次出现"}</p>
          </div>
          <div class="today-actions">
            <button class="button primary" data-action="startDue"><i data-lucide="play"></i>${stats.due ? "开始复习" : "随机练习"}</button>
            ${resume ? '<button class="button secondary" data-action="resume"><i data-lucide="rotate-ccw"></i>继续上次学习</button>' : '<button class="button secondary" data-nav="practice"><i data-lucide="sliders-horizontal"></i>专项练习</button>'}
          </div>
          <div class="fx-slot fx-slot-home" data-fx-slot="home"></div>
        </div>
        <div class="goal-panel">
          <div class="goal-ring" style="--progress:${percent * 3.6}deg"><div><strong${today.answered >= 1000 ? ' class="goal-count-long"' : ""}>${today.answered}</strong><span>今日已答</span></div></div>
          <div class="goal-copy"><span class="goal-copy-today">今日已答 ${today.answered} · </span>每日目标${goal}题 · 完成${percent}%</div>
        </div>
        ${metric("circle-check-big", "累计做题", stats.attempts, `覆盖${stats.answered}道`)}
        ${metric("target", "累计正确率", `${stats.accuracy}%`, stats.attempts ? "按全部作答统计" : "完成练习后生成")}
        ${metric("circle-x", "未掌握错题", stats.wrong, "连续答对后可掌握")}
        ${metric("badge-help", "手动标记不会", stats.hard, "始终由你确认移除")}
        ${resumeCard}
      </section>
      <div class="section-title"><h2>练习方式</h2></div>
      <div class="quick-start">
        <section class="mode-grid list-panel">
          ${modeButton("book-open-check", brushActive || state.brush.completed ? "继续连续刷题" : "开始连续刷题", "按题库顺序练习，自动保存每一步", "startBrush", "", "accent", `${brushIndex + 1} / ${questions.length}`)}
          ${modeButton("book-open", reviewBadge ? "继续自动看题" : "自动看题", "显示答案和解析 · 默认每15秒翻页", "startAutoReview", "", "orange", reviewBadge)}
          ${MODE_GLOW}
        </section>
        <div class="two-column">
          <section class="mode-grid list-panel">${typeRows}${MODE_GLOW}</section>
          <section class="mode-grid list-panel">${markRows}${MODE_GLOW}</section>
        </div>
      </div>`;
    icons();
    fx("page", "home", { banks: bankRegistry.banks.map((bank) => ({ id: bank.id, name: bank.name, count: bank.questionCount })), currentId: currentBank.id, onSwitch: (id) => switchQuestionBank(id, "home") });
  }

  /* 手机档（≤600px）不再有顶栏，品牌图标挪进每一页大标题的前面：30px 渐变圆角块，图案与侧栏那枚同一个文件。
     桌面上 .page-brand 是 display: none，所以 600px 以上的页面逐像素不变（只在 DOM 里多一个不显示的 span）。
     图案走和侧栏同一条回落链（svg → png → 内联「叠卡 + 勾」）；brandIconSrc 记着链走到了哪一档，
     页头每次重渲染都直接用那一档，不会每换一页就重新失败一遍、在控制台多留一条 404。 */
  const BRAND_ICON_SVG = "assets/brand/brand-icon.svg";
  const BRAND_ICON_PNG = "assets/brand/brand-icon.png";
  let brandIconSrc = BRAND_ICON_SVG;
  function pageTitle(text) {
    const image = brandIconSrc ? `<img class="brand-icon-file" src="${brandIconSrc}" alt="" decoding="async">` : "";
    return `<h1><span class="brand-mark page-brand" aria-hidden="true">${image}<svg class="brand-icon-inline" viewBox="0 0 24 24"${brandIconSrc ? " hidden" : ""}><rect x="6.5" y="3.5" width="13" height="16" rx="3" opacity=".55"/><rect x="4" y="6.5" width="13" height="14" rx="3"/><path d="m7.6 13.6 2.3 2.3 4.4-4.6"/></svg></span>${text}</h1>`;
  }

  function metric(icon, label, value, note) {
    return `<div class="metric"><div class="metric-head"><span>${label}</span><i data-lucide="${icon}"></i></div><strong>${value}</strong><small>${note}</small></div>`;
  }

  /* 分组列表行：32px 彩色圆角方块图标（白色线条）+ 标题/副标题 + 计数胶囊 + 灰 chevron。
     data-action / data-value 与卡片版完全一致，点击分发一个字都没改。 */
  function modeButton(icon, title, note, action, value, tone = "accent", badge = "") {
    const badgeHtml = badge === "" || badge === 0 ? "" : `<span class="mode-badge">${escapeHtml(String(badge))}</span>`;
    return `<button class="mode-button" data-action="${action}" data-value="${value}" type="button"><span class="mode-icon tone-${tone}"><i data-lucide="${icon}"></i></span><span class="mode-text"><strong>${title}</strong><span>${note}</span></span>${badgeHtml}<span class="mode-chev"><i data-lucide="chevron-right"></i></span></button>`;
  }

  function renderPractice() {
    const defaultCount = Math.max(1, Math.min(20, questions.length));
    const bankChoices = bankRegistry.banks.map((bank) => {
      const available = getBankContext(bank.id)?.questions.length || 0;
      return { ...bank, available };
    });
    view.innerHTML = `
      <div class="page-header"><div>${pageTitle("专项练习")}<p>默认从一个题库出题，也可以选择多个题库混合；学习记录始终分别保存。</p></div></div>
      <form id="practice-form" class="panel">
        <div class="form-grid">
          <div class="field-group practice-scope-field"><span class="field-label">刷题范围</span><div class="segmented" data-segment="scope">
            <button type="button" class="active" data-segment-value="single">单个题库（默认）</button><button type="button" data-segment-value="mixed">混合题库</button>
          </div><input type="hidden" name="scope" value="single"><small class="field-help">单个题库会切换为所选题库；混合刷题时会在每道题上标明来源。</small></div>
          <div class="field-group practice-bank-field" id="single-bank-field"><label class="field-label" for="practice-bank">选择题库</label><select id="practice-bank" name="singleBank">
            ${bankChoices.map((bank) => `<option value="${bank.id}" ${bank.id === currentBank.id ? "selected" : ""} ${bank.available ? "" : "disabled"}>${escapeHtml(bank.name)}（${bank.available}道）</option>`).join("")}
          </select></div>
          <div class="field-group practice-bank-field" id="mixed-bank-field" hidden><span class="field-label">选择要混合的题库（至少2个）</span><div class="scope-bank-list">
            ${bankChoices.map((bank) => `<label class="scope-bank-option ${bank.available ? "" : "disabled"}"><input type="checkbox" name="mixedBank" value="${bank.id}" ${bank.available ? "checked" : "disabled"}><span><strong>${escapeHtml(bank.name)}</strong><small>${bank.available}道</small></span></label>`).join("")}
          </div><small class="field-help">错题、不会标记、收藏、笔记和答题统计仍归属于原题库。</small></div>
          <div class="field-group practice-scope-field"><span class="field-label">一键选题</span><div class="quick-select-row" aria-label="一键选题">
            <button type="button" class="button secondary" data-practice-preset="all">当前条件全部题目</button><button type="button" class="button secondary" data-practice-preset="20">随机20题</button><button type="button" class="button secondary" data-practice-preset="50">随机50题</button><button type="button" class="button secondary" data-practice-preset="100">随机100题</button>
            <button type="button" class="button ghost" data-practice-preset="single">仅单选</button><button type="button" class="button ghost" data-practice-preset="multiple">仅多选</button><button type="button" class="button ghost" data-practice-preset="judge">仅判断</button>
          </div><small class="field-help">一键设置题量或题型；仍可在下方继续微调，点击“开始练习”后自动保存本次进度。</small></div>
          <div class="field-group"><span class="field-label">题型</span><div class="check-row">
            ${QUESTION_TYPES.map((type) => `<label class="check-chip"><input type="checkbox" name="type" value="${type}" checked><span>${type}</span></label>`).join("")}
          </div></div>
          <div class="field-group"><span class="field-label">难度</span><div class="check-row">
            ${["低", "中", "高"].map((level) => `<label class="check-chip"><input type="checkbox" name="difficulty" value="${level}" checked><span>${level}</span></label>`).join("")}
          </div></div>
          <div class="field-group"><label class="field-label" for="practice-count">题目数量</label><input class="number-input" id="practice-count" name="count" type="number" min="1" max="${Math.max(1, questions.length)}" value="${defaultCount}" inputmode="numeric"><small class="field-help" id="count-help">可填写1至${questions.length}道</small></div>
          <div class="field-group"><label class="field-label" for="practice-duration">限时（分钟）</label><input class="number-input" id="practice-duration" name="duration" type="number" min="0" max="600" value="0" inputmode="numeric"><small class="field-help">填写0表示不限时</small></div>
          <div class="field-group"><span class="field-label">顺序</span><div class="segmented" data-segment="order">
            <button type="button" class="active" data-segment-value="random">随机</button><button type="button" data-segment-value="sequential">顺序</button>
          </div><input type="hidden" name="order" value="random"></div>
          <div class="field-group"><span class="field-label">答题方式</span><div class="segmented" data-segment="mode">
            <button type="button" class="active" data-segment-value="practice">逐题反馈</button><button type="button" data-segment-value="exam">统一交卷</button><button type="button" data-segment-value="review">自动看题</button>
          </div><input type="hidden" name="mode" value="practice"></div>
          <div class="field-group" id="review-interval-field" hidden><label class="field-label" for="review-interval">自动翻页间隔</label><select id="review-interval" name="reviewInterval"><option value="5">5秒</option><option value="10">10秒</option><option value="15" selected>15秒</option><option value="30">30秒</option></select><small class="field-help">看题时可随时暂停或调整速度，不会计入答题统计。</small></div>
          <div class="field-group" id="exam-submit-field" hidden><span class="field-label">统一交卷</span><strong>可按已勾选的题型组卷</strong><small class="field-help">完成全部题目后统一查看结果；首页“模拟考试”仍使用单选30、多选20、判断10的固定100分试卷。</small></div>
        </div>
        <div class="form-footer"><span id="pool-count" aria-live="polite">当前条件包含${questions.length}道题</span><button class="button primary" type="submit"><i data-lucide="play"></i>开始练习</button></div>
      </form>`;
    icons();
    document.getElementById("practice-form").addEventListener("change", updatePoolCount);
    document.getElementById("practice-form").addEventListener("click", (event) => {
      const preset = event.target.closest("[data-practice-preset]");
      if (preset) applyPracticePreset(preset.dataset.practicePreset);
    });
    document.getElementById("practice-form").addEventListener("submit", startCustomPractice);
    updatePracticeScopeControls();
    updateReviewControls();
  }

  function updatePracticeScopeControls() {
    const form = document.getElementById("practice-form");
    if (!form) return;
    const mixed = form.elements.scope.value === "mixed";
    document.getElementById("single-bank-field").hidden = mixed;
    document.getElementById("mixed-bank-field").hidden = !mixed;
  }

  function updateReviewControls() {
    const form = document.getElementById("practice-form");
    if (!form) return;
    const review = form.elements.mode.value === "review";
    const exam = form.elements.mode.value === "exam";
    document.getElementById("review-interval-field").hidden = !review;
    document.getElementById("exam-submit-field").hidden = !exam;
    form.elements.duration.disabled = review;
    updatePoolCount();
  }

  function applyPracticePreset(preset) {
    const form = document.getElementById("practice-form");
    if (!form) return;
    const typeByPreset = { single: "单选题", multiple: "多选题", judge: "判断题" };
    if (typeByPreset[preset]) {
      form.querySelectorAll('input[name="type"]').forEach((input) => { input.checked = input.value === typeByPreset[preset]; });
    }
    updatePoolCount();
    const poolSize = currentPracticePool(form).length;
    const countInput = document.getElementById("practice-count");
    if (preset === "all" || typeByPreset[preset]) countInput.value = Math.max(1, poolSize);
    if (/^\d+$/.test(preset)) countInput.value = Math.min(Math.max(1, Number(preset)), Math.max(1, poolSize));
    updatePoolCount();
  }

  function currentPracticePool(form) {
    const types = [...form.querySelectorAll('input[name="type"]:checked')].map((input) => input.value);
    const levels = [...form.querySelectorAll('input[name="difficulty"]:checked')].map((input) => input.value);
    const bankIds = form.elements.scope.value === "mixed"
      ? [...form.querySelectorAll('input[name="mixedBank"]:checked')].map((input) => input.value)
      : [form.elements.singleBank.value];
    return bankIds.flatMap((bankId) => {
      const context = getBankContext(bankId);
      if (!context) return [];
      return context.questions
        .filter((question) => types.includes(question.type) && levels.includes(question.difficulty))
        .map((question) => ({ bankId, bankName: context.meta.name, question }));
    });
  }

  function updatePoolCount() {
    const form = document.getElementById("practice-form");
    const pool = currentPracticePool(form);
    const poolSize = pool.length;
    const mixed = form.elements.scope.value === "mixed";
    const selectedBanks = mixed ? form.querySelectorAll('input[name="mixedBank"]:checked').length : 1;
    const poolBanks = new Set(pool.map((item) => item.bankId)).size;
    const countInput = document.getElementById("practice-count");
    countInput.max = Math.max(1, poolSize);
    countInput.min = mixed ? Math.max(1, poolBanks) : 1;
    if (!poolSize) countInput.value = 1;
    if (Number(countInput.value) > poolSize && poolSize > 0) countInput.value = poolSize;
    if (poolSize > 0 && Number(countInput.value) < Number(countInput.min)) countInput.value = countInput.min;
    document.getElementById("count-help").textContent = poolSize ? `当前条件最多可选${poolSize}道` : "当前条件没有题目";
    document.getElementById("pool-count").textContent = mixed ? `已选${selectedBanks}个题库，当前条件包含${poolSize}道题` : `当前条件包含${poolSize}道题`;
    form.querySelector('button[type="submit"]').disabled = !poolSize || (mixed && (selectedBanks < 2 || poolBanks < 2));
  }

  function selectMixedQuestions(pool, count, randomOrder) {
    const groups = new Map();
    pool.forEach((item) => {
      if (!groups.has(item.bankId)) groups.set(item.bankId, []);
      groups.get(item.bankId).push(item);
    });
    if (!randomOrder) {
      const orderedGroups = [...groups.values()].map((items) => [...items]);
      const selected = [];
      while (selected.length < count && orderedGroups.some((items) => items.length)) {
        orderedGroups.forEach((items) => {
          if (items.length && selected.length < count) selected.push(items.shift());
        });
      }
      return selected;
    }
    const shuffledGroups = shuffle([...groups.values()].map((items) => shuffle(items)));
    const selected = shuffledGroups.map((items) => items.shift()).filter(Boolean);
    const remaining = shuffle(shuffledGroups.flat());
    return shuffle([...selected, ...remaining.slice(0, Math.max(0, count - selected.length))]).slice(0, count);
  }

  function selectMockExamQuestions(pool, randomOrder) {
    const selected = [];
    const missing = [];
    Object.entries(MOCK_EXAM_BLUEPRINT.allocations).forEach(([type, count]) => {
      const candidates = pool.filter((item) => item.question.type === type);
      if (candidates.length < count) {
        missing.push(`${type}需${count}题，当前只有${candidates.length}题`);
        return;
      }
      selected.push(...(randomOrder ? shuffle(candidates) : candidates).slice(0, count));
    });
    if (missing.length) return { selected: [], missing };
    // 模拟考试按题型分区：单选题 → 多选题 → 判断题；“随机顺序”仅打乱各题型内部。
    return { selected, missing: [] };
  }

  function startDefaultMockExam() {
    const pool = questions.map((question) => ({ bankId: currentBank.id, bankName: currentBank.name, question }));
    const result = selectMockExamQuestions(pool, true);
    if (result.missing.length) return showToast(`无法生成模拟考试：${result.missing.join("；")}`);
    startSession(result.selected.map((item) => item.question.id), "exam", "模拟考试（100分）", MOCK_EXAM_BLUEPRINT.durationMinutes, { examBlueprint: MOCK_EXAM_BLUEPRINT });
  }

  function startCustomPractice(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const mixed = form.elements.scope.value === "mixed";
    const selectedMixedBanks = mixed ? form.querySelectorAll('input[name="mixedBank"]:checked').length : 0;
    if (mixed && selectedMixedBanks < 2) return showToast("混合刷题至少需要选择2个有可用题目的题库");
    let pool = currentPracticePool(form);
    if (!pool.length) return showToast(mixed ? "所选题库在当前题型和难度下没有可用题目" : "请至少选择一种题型和难度");
    const poolBankIds = [...new Set(pool.map((item) => item.bankId))];
    if (mixed && poolBankIds.length < 2) return showToast("混合刷题至少需要选择2个有可用题目的题库");
    const exam = form.elements.mode.value === "exam";
    const wantsReview = form.elements.mode.value === "review";
    const count = Math.min(pool.length, Math.max(mixed ? poolBankIds.length : 1, Number(form.elements.count.value) || 20));
    const duration = Math.min(600, Math.max(0, Number(form.elements.duration.value) || 0));
    const randomOrder = form.elements.order.value === "random";
    pool = mixed ? selectMixedQuestions(pool, count, randomOrder) : (randomOrder ? shuffle(pool) : pool).slice(0, count);
    const mode = exam ? "exam" : "practice";
    const title = exam ? "统一交卷练习" : "专项练习";
    const reviewInterval = () => Number(form.elements.reviewInterval.value) || 15;
    if (!mixed) {
      const targetBankId = pool[0].bankId;
      const ids = pool.map((item) => item.question.id);
      const begin = () => {
        if (!activateQuestionBank(targetBankId)) return showToast("无法切换到所选题库");
        if (wantsReview) return startReviewSession(ids, reviewInterval(), "自动看题");
        startSession(ids, mode, title, duration || null);
      };
      if (!exam && !wantsReview) return beginAnswerSession(ids.length, begin);
      return begin();
    }
    const ids = pool.map((item) => makeQuestionKey(item.bankId, item.question.id));
    const extras = { scope: "mixed", bankIds: poolBankIds };
    if (wantsReview) return startReviewSession(ids, reviewInterval(), "混合题库自动看题", extras);
    const mixedTitle = exam ? "混合题库统一交卷" : "混合题库练习";
    if (!exam) return beginAnswerSession(ids.length, () => startSession(ids, mode, mixedTitle, duration || null, extras));
    startSession(ids, mode, mixedTitle, duration || null, extras);
  }

  /* ── 背题快刷 ──────────────────────────────────────────────────────────────
   * 快刷只改「什么时候判分」：单选题和判断题点一下选项就直接走 submitAnswer()，
   * 少点一次提交。判分、统计、错题本、间隔复习和连续刷题位置全部还是 submitAnswer()
   * 那一套，没有第二份记录逻辑。多选题、填空题、简答题不受影响，仍要点提交。
   * 偏好读写都包 try/catch：隐私模式下 localStorage 会直接抛异常，抛了也要能用，
   * 所以内存里留一份 answerMode，切换以它为准，存不存下来是次要的。
   */

  function readStoredAnswerMode() {
    try {
      const stored = localStorage.getItem(ANSWER_MODE_KEY);
      return stored === "fast" || stored === "think" ? stored : "";
    } catch (_error) {
      return "";
    }
  }

  function setAnswerMode(mode) {
    answerMode = mode === "fast" ? "fast" : "think";
    answerModeRemembered = true;
    try {
      localStorage.setItem(ANSWER_MODE_KEY, answerMode);
    } catch (_error) {
      // 隐私模式下写不进去：本次仍按内存里的选择走，下次打开回到默认的思考做题。
    }
  }

  // 快刷只作用于逐题反馈的练习和连续刷题；模拟考试没有即时反馈，自动看题不作答。
  function fastAnswerActive(session) {
    return answerMode === "fast" && (session?.mode === "practice" || session?.mode === "brush");
  }

  function answerModeSwitchable(session) {
    return session?.mode === "practice" || session?.mode === "brush";
  }

  // 开始一个新的、多于一题的逐题反馈会话前问一次；单题练习和无题的情况直接按记住的偏好开始。
  /*
   * 「这次怎么刷」之前先问「要不要放弃上次没做完的」：顺序反过来的话，用户先挑了一次
   * 答题方式、才被告知会丢作答，取消之后那次挑选白挑（偏好还已经被记下了）。
   * proceed() 里面的 startSession / startReviewSession / startBrush 各自也有同一道确认，
   * 那是给不经过这里的直接调用（模拟考试、自动看题）准备的；经过这里时用
   * suppressDiscardConfirm 把内层那次压掉，免得连问两遍。proceed() 是同步的，用
   * try/finally 保证无论如何都复位。
   */
  function beginAnswerSession(count, proceed) {
    if (!confirmDiscardActiveSession()) return;
    const run = () => {
      suppressDiscardConfirm = true;
      try { proceed(); } finally { suppressDiscardConfirm = false; }
    };
    if (!(Number(count) > 1)) return run();
    if (!answerModeDialog || typeof answerModeDialog.showModal !== "function") return run();
    const fastButton = document.getElementById("answer-mode-fast");
    const thinkButton = document.getElementById("answer-mode-think");
    if (!fastButton || !thinkButton) return run();
    const fast = answerMode === "fast";
    fastButton.classList.toggle("is-current", fast);
    thinkButton.classList.toggle("is-current", !fast);
    fastButton.classList.toggle("is-remembered", answerModeRemembered && fast);
    thinkButton.classList.toggle("is-remembered", answerModeRemembered && !fast);
    answerModePending = run;
    answerModeDialog.showModal();
    (fast ? fastButton : thinkButton).focus();
  }

  // 选中某个模式：记住偏好、关掉弹窗，然后才真正开始那次会话。
  // 这里不依赖 <dialog> 的 returnValue 和 close 事件——Chrome 在按过一次 Esc 之后，
  // 同一个弹窗再提交一次不会再抛 close，偏好就丢了。所以按钮自己把事做完。
  function chooseAnswerMode(mode) {
    const proceed = answerModePending;
    answerModePending = null;
    setAnswerMode(mode);
    dismissAnswerModeDialog();
    if (proceed) proceed();
  }

  function dismissAnswerModeDialog() {
    if (answerModeDialog?.open) answerModeDialog.close();
  }

  function toggleAnswerMode() {
    const session = state.activeSession;
    if (!answerModeSwitchable(session)) return;
    setAnswerMode(answerMode === "fast" ? "think" : "fast");
    showToast(answerMode === "fast" ? "背题快刷已开启：点选项立刻出答案" : "已切换回思考做题：选完再点提交");
    renderQuiz();
  }

  /* ── 顶掉半截会话前先问一声 ─────────────────────────────────────────────────
   * 一次只存得下一个 activeSession，所以「开始新练习」就等于放弃旧的那一场。练习和模拟考试
   * 的作答只活在 activeSession 里，被顶掉就真的没了，必须先问。
   *   · 连续刷题（mode === "brush"）不问：位置另存在 state.brush，顶掉不丢东西。
   *   · 自动看题（mode === "review"）也不问：位置另存在 state.review，回来还能续上，而且它不作答。
   * 模拟考试要到结算时才判分，做一半时只有 answers 没有 graded，所以两处都要算进「已答」。
   * 多选题取消勾选会留下一个空数组，按长度过滤掉，免得「点开又取消」也算一题。
   */
  function unfinishedSessionSummary() {
    const session = state.activeSession;
    if (!session?.ids?.length || session.completedAt) return null;
    if (session.mode === "brush" || session.mode === "review") return null;
    const answered = session.ids.filter((sessionKey) => Object.prototype.hasOwnProperty.call(session.graded || {}, sessionKey)
      || (session.answers?.[sessionKey]?.length || 0) > 0).length;
    if (!answered) return null;
    return {
      title: session.title || "练习",
      number: Math.min(Math.max(0, Number(session.index) || 0), session.ids.length - 1) + 1,
      total: session.ids.length,
      answered,
    };
  }

  let suppressDiscardConfirm = false;

  function confirmDiscardActiveSession() {
    if (suppressDiscardConfirm) return true;
    const pending = unfinishedSessionSummary();
    if (!pending) return true;
    return confirm(`上次的“${pending.title}”做到第${pending.number}/${pending.total}题、已答${pending.answered}题。开始新的练习会放弃它的作答，无法恢复。要继续吗？`);
  }

  function startSession(ids, mode = "practice", title = "练习", durationMinutes = null, extras = {}) {
    if (!ids.length) return showToast("当前没有符合条件的题目");
    if (!confirmDiscardActiveSession()) return;
    state.activeSession = {
      ids, mode, title, durationMinutes, index: 0, answers: {}, graded: {},
      startedAt: Date.now(), completedAt: null, ...extras,
    };
    saveState();
    navigate("quiz");
  }

  // 自动看题：题目集合与上次一样就接着上次看到的那一题，变了才从第 1 题开始（并说明一句）。
  function startReviewSession(ids, intervalSeconds = 15, title = "自动看题", extras = {}) {
    if (!ids.length) return showToast("当前题库没有可查看的题目");
    if (!confirmDiscardActiveSession()) return;
    const saved = reviewProgress();
    const signature = sessionSignature(ids);
    const sameBatch = Boolean(saved.signature) && saved.signature === signature;
    const resumed = sameBatch && saved.index > 0 && saved.index < ids.length;
    state.activeSession = {
      ids, mode: "review", title, durationMinutes: null, index: resumed ? saved.index : 0, answers: {}, graded: {},
      autoPlaying: ids.length > 1, autoIntervalSeconds: Math.min(60, Math.max(5, Number(intervalSeconds) || 15)),
      autoNextAt: null, startedAt: Date.now(), completedAt: null, ...extras,
    };
    saveState();
    if (resumed) showToast(`接着上次看到的第${saved.index + 1}题继续`);
    else if (saved.signature && !sameBatch) showToast("题目范围和上次不一样，自动看题从第1题开始");
    navigate("quiz");
  }

  function startBrush() {
    if (!questions.length) return showToast("当前题库没有可练习的题目");
    // 连续刷题自己的位置另存在 state.brush，顶掉一个 brush 会话不丢东西；
    // 但它同样会顶掉半截的专项练习或模拟考试，所以和别的入口一样先问一次。
    // confirmDiscardActiveSession 不把 brush / review 算作「半截」，所以续做自己时不会弹。
    if (!confirmDiscardActiveSession()) return;
    const existing = state.activeSession;
    const currentIds = questions.map((question) => question.id);
    const matchesCurrentBank = existing?.ids?.length === currentIds.length && existing.ids.every((id, index) => id === currentIds[index]);
    if (existing?.mode === "brush" && matchesCurrentBank) {
      const currentId = existing.ids[existing.index];
      if (Object.prototype.hasOwnProperty.call(existing.graded, currentId)) {
        existing.index = Math.min(Math.max(0, Number(state.brush.index) || 0), questions.length - 1);
        existing.answers = {};
        existing.graded = {};
        existing.startedAt = Date.now();
        saveState();
      }
      return navigate("quiz");
    }
    const index = Math.min(Math.max(0, Number(state.brush.index) || 0), questions.length - 1);
    state.activeSession = {
      ids: currentIds, mode: "brush", title: "连续刷题",
      durationMinutes: null, index, answers: {}, graded: {}, startedAt: Date.now(), completedAt: null,
    };
    saveState();
    navigate("quiz");
  }

  function renderQuiz() {
    const session = state.activeSession;
    if (!session || !session.ids?.length) return navigate("home");
    const resolved = resolveSessionQuestion(session);
    if (!resolved) return navigate("home");
    const { question, sessionKey } = resolved;
    const record = recordViewForState(resolved.context.state, question.id);
    const reviewMode = session.mode === "review";
    const selected = session.answers[sessionKey] ?? emptyAnswerForQuestion(question);
    const graded = reviewMode || Object.prototype.hasOwnProperty.call(session.graded, sessionKey);
    const isCorrect = graded && answerIsCorrect(question, selected);
    const immediateFeedback = session.mode !== "exam";
    const fastMode = fastAnswerActive(session);
    const modeSwitchable = answerModeSwitchable(session);
    // 快刷判分后，反馈块标题行右侧多给一颗「下一题」，文案与底部那颗保持一致。
    const fastNextLabel = fastMode && graded ? (session.mode === "brush" ? "继续下一题" : session.index === session.ids.length - 1 ? "完成练习" : "下一题") : "";
    const progress = (session.index + 1) / session.ids.length * 100;
    const questionNumber = question.number || session.index + 1;
    const status = sessionQuestionStatus(session, session.index);
    const previousPreview = renderSwipePreview(session, session.index - 1, "previous");
    const nextPreview = renderSwipePreview(session, session.index + 1, "next");
    const swipeEntryClass = quizSwipeEnterDirection ? ` swipe-enter-from-${quizSwipeEnterDirection}` : "";
    quizSwipeEnterDirection = "";
    view.innerHTML = `
      <div class="quiz-layout">
        <div class="quiz-top">
          <button class="icon-button" data-action="exitQuiz" type="button" aria-label="退出练习" title="退出练习"><i data-lucide="x"></i></button>
          <div class="quiz-progress" aria-label="答题进度"><span style="width:${progress}%"></span></div>
          <span class="quiz-count">${session.index + 1} / ${session.ids.length}</span>
          <div class="fx-slot fx-slot-deck" data-fx-slot="deck" aria-hidden="true"></div>
        </div>
        <div class="quiz-jump-bar">
          <label for="quiz-jump">按题号跳转</label>
          <div class="quiz-jump-input"><input id="quiz-jump-number" type="number" min="1" inputmode="numeric" placeholder="输入题号" aria-label="输入题号"><button class="button secondary" data-action="jumpByNumber" type="button">跳转</button></div>
          <select id="quiz-jump" aria-label="按题号跳转">
            ${session.ids.map((_, index) => quizJumpOption(session, index)).join("")}
          </select>
          <span class="study-status ${status.className}">${status.icon} ${status.label}</span>
        </div>
        <section class="question-surface ${question.type === "多选题" ? "multiple" : ""}">
          <div class="swipe-stage">
          ${previousPreview}
          ${nextPreview}
          <div class="swipe-content${swipeEntryClass}">
          <div class="question-meta">
            <div class="tags"><span class="tag type">${question.type}</span><span class="tag">题号${questionNumber}</span><span class="tag">难度${question.difficulty}</span>${session.scope === "mixed" ? `<span class="tag bank-source">题库：${escapeHtml(resolved.bankName)}</span>` : ""}${session.mode === "exam" ? '<span class="tag">模拟考试</span>' : session.mode === "brush" ? '<span class="tag">连续刷题</span>' : reviewMode ? '<span class="tag">自动看题</span>' : ""}<span class="keyboard-tip">电脑可用 ↑ ↓ ← → 切题${fastMode ? " · 空格下一题" : ""}</span></div>
            <div class="question-actions">
              ${modeSwitchable ? `<button class="icon-button answer-mode-switch ${fastMode ? "active" : ""}" data-action="toggleAnswerMode" type="button" aria-pressed="${fastMode ? "true" : "false"}" aria-label="${fastMode ? "关闭背题快刷" : "开启背题快刷"}" title="${fastMode ? "背题快刷已开启：单选和判断点一下就出答案" : "开启背题快刷：单选和判断点一下就出答案"}"><i data-lucide="zap"></i><span>快刷</span></button>` : ""}
              <button class="icon-button ${record.hard ? "active" : ""}" data-action="toggleHard" type="button" aria-label="${record.hard ? "取消不会标记" : "标记为不会"}" title="${record.hard ? "取消不会标记" : "标记为不会"}"><i data-lucide="badge-help"></i></button>
              <button class="icon-button ${record.favorite ? "active" : ""}" data-action="toggleFavorite" type="button" aria-label="${record.favorite ? "取消收藏" : "收藏题目"}" title="${record.favorite ? "取消收藏" : "收藏题目"}"><i data-lucide="star"></i></button>
              <button class="icon-button ${record.note ? "active" : ""}" data-action="openNote" type="button" aria-label="题目笔记" title="题目笔记"><i data-lucide="notebook-pen"></i></button>
            </div>
          </div>
          <h1 class="question-title">${escapeHtml(question.stem)}</h1>
          ${question.type === "填空题"
            ? `<div class="subjective-answer fill-blank-answer"><span class="subjective-label">请按顺序填写每一空</span><div class="fill-blank-fields">${fillSubmittedParts(question, selected).map((value, index) => `<label class="fill-blank-field"><span>第${index + 1}空</span><input class="fill-blank-input" type="text" value="${escapeHtml(value)}" maxlength="200" placeholder="填写第${index + 1}空" autocomplete="off" ${reviewMode || (graded && session.mode !== "exam") ? "disabled" : ""}></label>`).join("")}</div></div>`
            : question.type === "简答题"
              ? `<div class="subjective-answer"><label for="subjective-answer">写下你的回答</label><textarea id="subjective-answer" rows="7" maxlength="5000" placeholder="先写下要点，提交后对照参考答案" ${reviewMode || (graded && session.mode !== "exam") ? "disabled" : ""}>${escapeHtml(String(selected || ""))}</textarea></div>`
            : `<div class="options">${question.options.map((option, index) => renderOption(question, index, option, selected, graded, session.mode)).join("")}</div>`}
          ${reviewMode ? renderReviewFeedback(question) : graded && immediateFeedback ? renderFeedback(question, isCorrect, record, fastNextLabel) : ""}
          ${reviewMode ? `<div class="review-controls"><label for="review-speed">自动翻页</label><select id="review-speed" aria-label="自动翻页间隔"><option value="5" ${session.autoIntervalSeconds === 5 ? "selected" : ""}>5秒</option><option value="10" ${session.autoIntervalSeconds === 10 ? "selected" : ""}>10秒</option><option value="15" ${session.autoIntervalSeconds === 15 ? "selected" : ""}>15秒</option><option value="30" ${session.autoIntervalSeconds === 30 ? "selected" : ""}>30秒</option></select><button class="button secondary" data-action="toggleAutoReview" type="button"><i data-lucide="${session.autoPlaying ? "pause" : "play"}"></i>${session.autoPlaying ? "暂停" : "继续"}</button></div>` : ""}
          </div>
          </div>
          <div class="question-footer">
            <button class="button ghost" data-action="previous" type="button" ${session.index === 0 ? "disabled" : ""}><i data-lucide="chevron-left"></i>上一题</button>
            <div>
              ${reviewMode ? `<button class="button primary" data-action="${session.index === session.ids.length - 1 ? "finishReview" : "next"}" type="button">${session.index === session.ids.length - 1 ? "完成看题" : "下一题"}<i data-lucide="chevron-right"></i></button>` : ""}
              ${!reviewMode && immediateFeedback && !graded ? '<button class="button primary" data-action="submitAnswer" type="button">提交答案</button>' : ""}
              ${!reviewMode && immediateFeedback && graded ? `<button class="button primary" data-action="next" type="button">${session.mode === "brush" ? "继续下一题" : session.index === session.ids.length - 1 ? "完成练习" : "下一题"}<i data-lucide="chevron-right"></i></button>` : ""}
              ${session.mode === "exam" ? `<button class="button primary" data-action="next" type="button">${session.index === session.ids.length - 1 ? "交卷" : "下一题"}<i data-lucide="chevron-right"></i></button>` : ""}
            </div>
          </div>
        </section>
        <p class="swipe-hint" aria-hidden="true">在题干、标签或解析区域右滑查看上一题，左滑进入下一题</p>
        <div class="quiz-timer" id="quiz-timer"></div>
      </div>`;
    icons();
    document.getElementById("review-speed")?.addEventListener("change", changeReviewSpeed);
    document.getElementById("quiz-jump")?.addEventListener("change", jumpToSessionQuestion);
    // 输入法组字时的回车是选词，不是「跳转」。
    document.getElementById("quiz-jump-number")?.addEventListener("keydown", (event) => { if (event.isComposing || event.keyCode === 229) return; if (event.key === "Enter") { event.preventDefault(); jumpToQuestionNumber(); } });
    enableQuizSwipe();
    stopQuizTimers();
    scheduleAutoAdvance();
    updateTimer();
    timerHandle = setInterval(updateTimer, 1000);
    fx("page", "quiz", { sessionId: String(session.startedAt), index: session.index, total: session.ids.length, mode: session.mode, graded });
  }

  function renderSwipePreview(session, index, direction) {
    const preview = resolveSessionQuestion(session, index);
    if (!preview) return "";
    const { question } = preview;
    const label = direction === "previous" ? "上一题" : "下一题";
    return `<article class="swipe-preview ${direction}" data-swipe-preview="${direction}" aria-hidden="true"><span class="swipe-preview-label">${label}</span><span class="swipe-preview-number">题号${question.number || index + 1}</span><p>${escapeHtml(question.stem)}</p><span class="swipe-preview-tip">继续滑动即可切换</span></article>`;
  }

  function enableQuizSwipe() {
    const surface = view.querySelector(".question-surface");
    const stage = view.querySelector(".swipe-stage");
    const content = view.querySelector(".swipe-content");
    const previousPreview = view.querySelector('[data-swipe-preview="previous"]');
    const nextPreview = view.querySelector('[data-swipe-preview="next"]');
    if (!surface || !stage || !content) return;
    let start = null;
    let returnTimer = null;
    let suppressTap = false;
    let activeSwipeWidth = 0;
    let swipeFrame = 0;
    let pendingSwipe = null;
    let activePreviewDirection = "";
    const reducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const swipeWidth = () => activeSwipeWidth || Math.max(stage.clientWidth || surface.clientWidth, 1);
    const previewAvailable = (direction) => {
      const session = state.activeSession;
      if (!session || quizSwipeBusy) return false;
      if (direction === "previous") return session.index > 0;
      if (session.mode === "review") return session.index < session.ids.length - 1;
      if (session.mode !== "exam" && !Object.prototype.hasOwnProperty.call(session.graded, session.ids[session.index])) return false;
      return session.mode === "brush" || session.index < session.ids.length - 1;
    };
    const canNavigate = (direction) => {
      const session = state.activeSession;
      if (!session || quizSwipeBusy) return false;
      if (direction === "previous") return session.index > 0;
      if (session.mode === "review") return session.index < session.ids.length - 1;
      if (session.mode !== "exam" && !Object.prototype.hasOwnProperty.call(session.graded, session.ids[session.index])) {
        showToast("请先提交本题答案");
        return false;
      }
      return session.mode === "brush" || session.index < session.ids.length - 1;
    };
    const cardTransform = (distance) => {
      const width = swipeWidth();
      const progress = Math.min(.96, Math.abs(distance) / width);
      const rotate = Math.sign(distance) * Math.min(1.15, progress * 1.15);
      const scale = 1 - progress * .018;
      return `translate3d(${Math.round(distance)}px, 0, 0) rotate(${rotate.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
    };
    const resetPreviews = () => {
      activePreviewDirection = "";
      [previousPreview, nextPreview].filter(Boolean).forEach((preview) => {
        preview.classList.remove("is-peeking", "swipe-preview-returning", "swipe-preview-completing");
        preview.style.transform = "";
        preview.style.opacity = "";
      });
    };
    const previewDefaultTransform = (direction) => `translate3d(${direction === "previous" ? "-104%" : "104%"}, 0, 0)`;
    const returnPreviews = () => {
      [[previousPreview, "previous"], [nextPreview, "next"]].forEach(([preview, direction]) => {
        if (!preview) return;
        preview.classList.remove("is-peeking");
        preview.classList.add("swipe-preview-returning");
        preview.style.transform = previewDefaultTransform(direction);
        preview.style.opacity = "0";
      });
    };
    const completePreview = (direction) => {
      const preview = direction === "previous" ? previousPreview : nextPreview;
      if (!preview) return;
      preview.classList.remove("is-peeking");
      preview.classList.add("swipe-preview-completing");
      preview.style.transform = "translate3d(0, 0, 0)";
      preview.style.opacity = "1";
    };
    const resetContent = () => {
      if (swipeFrame) cancelAnimationFrame(swipeFrame);
      swipeFrame = 0;
      pendingSwipe = null;
      activeSwipeWidth = 0;
      if (returnTimer) {
        clearTimeout(returnTimer);
        returnTimer = null;
      }
      content.classList.remove("is-swiping", "swipe-returning", "swipe-completing");
      content.style.transform = "";
      content.style.opacity = "";
      resetPreviews();
    };
    const returnCard = () => {
      if (reducedMotion()) return resetContent();
      content.classList.remove("is-swiping");
      content.classList.add("swipe-returning");
      content.style.transform = "translate3d(0, 0, 0) rotate(0deg) scale(1)";
      content.style.opacity = "1";
      returnPreviews();
      returnTimer = setTimeout(resetContent, 260);
    };
    const startSwipe = (x, y, id, target) => {
      if (target?.closest?.(".question-footer, .question-actions, .review-controls, details, summary, button:not(.option), input, select, textarea, a, label")) return;
      if (returnTimer) clearTimeout(returnTimer);
      returnTimer = null;
      activeSwipeWidth = Math.max(stage.clientWidth || surface.clientWidth, 1);
      activePreviewDirection = "";
      content.classList.remove("swipe-returning");
      start = { x, y, id, horizontal: false, moved: false, startedAt: performance.now(), lastX: x, lastAt: performance.now(), velocityX: 0 };
      content.classList.add("is-swiping");
    };
    const updateSwipeVelocity = (x) => {
      if (!start) return 0;
      const now = performance.now();
      const elapsed = Math.max(1, now - start.lastAt);
      const instantaneous = (x - start.lastX) / elapsed;
      start.velocityX = start.velocityX ? start.velocityX * .35 + instantaneous * .65 : instantaneous;
      start.lastX = x;
      start.lastAt = now;
      return start.velocityX;
    };
    const paintSwipe = ({ dx, direction, canPreview }) => {
      const width = swipeWidth();
      const maxDistance = Math.max(96, width * .78);
      const limited = Math.sign(dx) * Math.min(Math.abs(dx), maxDistance);
      const distance = canPreview ? limited : Math.sign(dx) * Math.min(24, Math.abs(dx) * .18);
      content.style.transform = cardTransform(distance);
      content.style.opacity = String(Math.max(.82, 1 - Math.abs(distance) / Math.max(width * 1.7, 1)));
      const preview = direction === "previous" ? previousPreview : nextPreview;
      const oppositePreview = direction === "previous" ? nextPreview : previousPreview;
      const oppositeDirection = direction === "previous" ? "next" : "previous";
      if (activePreviewDirection !== direction && oppositePreview) {
        oppositePreview.classList.remove("is-peeking");
        oppositePreview.style.transform = previewDefaultTransform(oppositeDirection);
        oppositePreview.style.opacity = "0";
      }
      activePreviewDirection = direction;
      if (preview && canPreview) {
        preview.classList.add("is-peeking");
        preview.style.opacity = String(Math.min(1, .42 + Math.abs(distance) / width));
        preview.style.transform = direction === "previous"
          ? `translate3d(${Math.round(-width + distance)}px, 0, 0)`
          : `translate3d(${Math.round(width + distance)}px, 0, 0)`;
      }
    };
    const moveSwipe = (x, y, id) => {
      if (!start || id !== start.id) return false;
      const dx = x - start.x;
      const dy = y - start.y;
      updateSwipeVelocity(x);
      if (!start.horizontal && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.12) start.horizontal = true;
      if (!start.horizontal) return false;
      start.moved = true;
      const direction = dx > 0 ? "previous" : "next";
      const canPreview = previewAvailable(direction);
      pendingSwipe = { dx, direction, canPreview };
      if (!swipeFrame) swipeFrame = requestAnimationFrame(() => {
        swipeFrame = 0;
        const pending = pendingSwipe;
        pendingSwipe = null;
        if (pending) paintSwipe(pending);
      });
      return true;
    };
    const finishSwipe = (x, y, id) => {
      if (!start || id !== start.id) return;
      const dx = x - start.x;
      const dy = y - start.y;
      updateSwipeVelocity(x);
      const wasHorizontal = start.horizontal || (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.12);
      const moved = start.moved || wasHorizontal;
      const velocityX = start.velocityX;
      if (swipeFrame) cancelAnimationFrame(swipeFrame);
      swipeFrame = 0;
      pendingSwipe = null;
      start = null;
      if (moved) {
        suppressTap = true;
        setTimeout(() => { suppressTap = false; }, 350);
      }
      const threshold = Math.min(128, Math.max(62, swipeWidth() * .16));
      const fastShortSwipe = Math.abs(dx) >= 18 && Math.abs(velocityX) >= .4;
      if (!wasHorizontal || (!fastShortSwipe && Math.abs(dx) < threshold) || Math.abs(dx) <= Math.abs(dy) * 1.12) return returnCard();
      const direction = dx > 0 ? "previous" : "next";
      if (!canNavigate(direction)) return returnCard();
      quizSwipeBusy = true;
      content.classList.remove("is-swiping");
      content.classList.add("swipe-completing");
      const exitDistance = (dx > 0 ? 1 : -1) * (swipeWidth() + 42);
      content.style.transform = cardTransform(exitDistance);
      content.style.opacity = "0";
      completePreview(direction);
      const delay = reducedMotion() ? 0 : 190;
      setTimeout(() => {
        quizSwipeEnterDirection = "";
        quizSwipeBusy = false;
        if (direction === "next") nextQuestion();
        else previousQuestion();
      }, delay);
    };
    surface.addEventListener("click", (event) => {
      if (!suppressTap) return;
      suppressTap = false;
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);
    if (window.PointerEvent) {
      surface.addEventListener("pointerdown", (event) => {
        if (event.pointerType !== "touch") return;
        startSwipe(event.clientX, event.clientY, event.pointerId, event.target);
        if (start) surface.setPointerCapture?.(event.pointerId);
      });
      surface.addEventListener("pointermove", (event) => { if (event.pointerType === "touch" && moveSwipe(event.clientX, event.clientY, event.pointerId)) event.preventDefault(); });
      surface.addEventListener("pointerup", (event) => { if (event.pointerType === "touch") finishSwipe(event.clientX, event.clientY, event.pointerId); });
      surface.addEventListener("pointercancel", () => { start = null; suppressTap = false; resetContent(); });
      return;
    }
    surface.addEventListener("touchstart", (event) => {
      const touch = event.changedTouches[0];
      if (touch) startSwipe(touch.clientX, touch.clientY, touch.identifier, event.target);
    }, { passive: true });
    surface.addEventListener("touchmove", (event) => {
      const touch = event.changedTouches[0];
      if (touch && moveSwipe(touch.clientX, touch.clientY, touch.identifier)) event.preventDefault();
    }, { passive: false });
    surface.addEventListener("touchend", (event) => {
      const touch = event.changedTouches[0];
      if (touch) finishSwipe(touch.clientX, touch.clientY, touch.identifier);
    }, { passive: true });
    surface.addEventListener("touchcancel", () => { start = null; suppressTap = false; resetContent(); }, { passive: true });
  }

  function sessionQuestionStatus(session, index) {
    const resolved = resolveSessionQuestion(session, index);
    if (!resolved) return { className: "neutral", icon: "•", label: "未作答" };
    const sessionKey = resolved.sessionKey;
    if (Object.prototype.hasOwnProperty.call(session.graded || {}, sessionKey)) {
      return session.graded[sessionKey]
        ? { className: "correct", icon: "✓", label: "本次做对" }
        : { className: "wrong", icon: "✕", label: "本次做错" };
    }
    const record = recordViewForState(resolved.context.state, resolved.question.id);
    if (record.hard && !record.mastered) return { className: "hard", icon: "?", label: "标记不会" };
    if (record.attempts) return record.lastCorrect
      ? { className: "correct", icon: "✓", label: "上次做对" }
      : { className: "wrong", icon: "✕", label: "上次做错" };
    return { className: "neutral", icon: "•", label: "未作答" };
  }

  function quizJumpOption(session, index) {
    const resolved = resolveSessionQuestion(session, index);
    if (!resolved) return "";
    const status = sessionQuestionStatus(session, index);
    const number = resolved.question.number || index + 1;
    const source = session.scope === "mixed" ? `${resolved.bankName} · ` : "";
    return `<option value="${index}" ${index === session.index ? "selected" : ""}>${status.icon} ${source}题号${number} · ${status.label}</option>`;
  }

  function jumpToSessionQuestion(event) {
    const session = state.activeSession;
    const index = Number(event.target.value);
    if (!session || !Number.isInteger(index) || index < 0 || index >= session.ids.length) return;
    session.index = index;
    if (session.mode === "review") session.autoNextAt = null;
    saveState();
    renderQuiz();
  }

  function jumpToQuestionNumber() {
    const session = state.activeSession;
    const input = document.getElementById("quiz-jump-number");
    const number = String(input?.value || "").trim();
    if (!session || !number) return showToast("请输入要跳转的题号");
    const matches = session.ids.map((_, index) => ({ index, resolved: resolveSessionQuestion(session, index) }))
      .filter(({ resolved }) => String(resolved?.question.number || "") === number);
    if (!matches.length) return showToast(`本次练习中没有题号${number}`);
    const preferred = matches.find(({ resolved }) => resolved.bankId === currentBank.id) || matches[0];
    session.index = preferred.index;
    if (session.mode === "review") session.autoNextAt = null;
    saveState();
    renderQuiz();
  }

  function renderOption(question, index, option, selected, graded, mode) {
    const chosen = selected.includes(index);
    const reveal = mode === "review" || (graded && mode !== "exam");
    const correct = reveal && question.correct.includes(index);
    const wrong = reveal && mode !== "review" && chosen && !question.correct.includes(index);
    let mark = "";
    if (correct) mark = '<span class="answer-mark good"><i data-lucide="check"></i></span>';
    if (wrong) mark = '<span class="answer-mark bad"><i data-lucide="x"></i></span>';
    return `<button class="option ${chosen ? "selected" : ""} ${correct ? "correct" : ""} ${wrong ? "wrong" : ""}" data-action="selectOption" data-index="${index}" type="button" ${mode === "review" || (graded && mode !== "exam") ? "disabled" : ""}><span class="option-key">${optionLetters[index]}</span><span>${escapeHtml(option)}</span>${mark}</button>`;
  }

  // 题库自带的解析（去掉开头的【考查点】这类标签）；没有就返回空串，不补一句空话。
  // 3.13.0 前导入解析为空的题会被存成下面这句占位，读到它也当作没有。
  const EMPTY_EXPLANATION_FILLER = "请结合正确答案理解并记忆本题知识点。";
  function sourceExplanation(question) {
    const text = String(question?.explanation || "").trim();
    if (!text || text === EMPTY_EXPLANATION_FILLER) return "";
    return text.replace(/^【[^】]+】/, "").trim();
  }

  // 答题反馈、自动看题用：有原解析才出这一块。
  function renderSourceExplanation(question) {
    const text = sourceExplanation(question);
    return text ? `<div class="explanation"><strong><i data-lucide="lightbulb"></i>答题依据与原解析</strong><p>${escapeHtml(text)}</p></div>` : "";
  }

  // fastNextLabel 只在背题快刷下有值：思考做题传空串，反馈块的结构与原来完全一致。
  function renderFeedback(question, isCorrect, record, fastNextLabel = "") {
    const answer = questionAnswer(question);
    const subjectiveLabel = question.type === "简答题" ? "已提交，请对照参考答案检查要点" : (isCorrect ? "关键词匹配" : "请对照参考答案补漏");
    const resultLabel = isSubjectiveQuestion(question) ? subjectiveLabel : (isCorrect ? "回答正确" : "回答错误");
    return `<div class="feedback ${isCorrect ? "good" : "bad"}"><div class="feedback-top"><div><strong>${resultLabel}</strong><span>参考答案：${escapeHtml(answer)}</span></div>${record.streak >= 3 && (record.wrong || record.hard) && !record.mastered ? '<button class="button secondary" data-action="markMastered" type="button"><i data-lucide="badge-check"></i>标记已掌握</button>' : ""}${fastNextLabel ? `<button class="button primary fast-next" data-action="next" type="button">${fastNextLabel}<i data-lucide="chevron-right"></i></button>` : ""}</div>${renderSourceExplanation(question)}</div>`;
  }

  function renderReviewFeedback(question) {
    const answer = questionAnswer(question);
    return `<div class="feedback review-feedback"><div class="feedback-top"><div><strong>正确答案</strong><span>${escapeHtml(answer)}</span></div></div>${renderSourceExplanation(question)}</div>`;
  }

  function scheduleAutoAdvance() {
    clearTimeout(autoAdvanceHandle);
    autoAdvanceHandle = null;
    const session = state.activeSession;
    if (!session || session.mode !== "review" || !session.autoPlaying) return;
    if (session.index >= session.ids.length - 1) {
      session.autoPlaying = false;
      session.autoNextAt = null;
      return;
    }
    const seconds = Math.min(60, Math.max(5, Number(session.autoIntervalSeconds) || 15));
    session.autoIntervalSeconds = seconds;
    if (!Number(session.autoNextAt) || session.autoNextAt <= Date.now()) session.autoNextAt = Date.now() + seconds * 1000;
    autoAdvanceHandle = setTimeout(() => advanceReview(true), Math.max(0, session.autoNextAt - Date.now()));
  }

  function advanceReview(automatic = false) {
    const session = state.activeSession;
    if (!session || session.mode !== "review") return;
    if (session.index >= session.ids.length - 1) {
      session.autoPlaying = false;
      session.autoNextAt = null;
      saveState();
      if (automatic) showToast("已自动看到最后一题");
      return renderQuiz();
    }
    session.index += 1;
    session.autoNextAt = null;
    if (session.index >= session.ids.length - 1) session.autoPlaying = false;
    saveState();
    renderQuiz();
    if (automatic && session.index >= session.ids.length - 1) showToast("已自动看到最后一题");
  }

  function toggleAutoReview() {
    const session = state.activeSession;
    if (!session || session.mode !== "review") return;
    if (!session.autoPlaying && session.index >= session.ids.length - 1) session.index = 0;
    session.autoPlaying = !session.autoPlaying;
    session.autoNextAt = null;
    saveState();
    renderQuiz();
  }

  function changeReviewSpeed(event) {
    const session = state.activeSession;
    if (!session || session.mode !== "review") return;
    session.autoIntervalSeconds = Math.min(60, Math.max(5, Number(event.target.value) || 15));
    session.autoNextAt = null;
    saveState();
    renderQuiz();
  }

  function finishReview() {
    if (state.activeSession?.mode !== "review") return;
    stopQuizTimers();
    // 会话清掉之后 rememberReviewPosition() 就读不到题号了，所以先抄一次位置再清。
    rememberReviewPosition();
    // 看到最后一题才结束，等于看完一轮：下次从第 1 题开始，与连续刷题刷完一轮绕回第 1 题一致。
    if (state.review.index >= state.activeSession.ids.length - 1) state.review = { ...state.review, index: 0 };
    state.activeSession = null;
    saveState();
    showToast("自动看题已结束");
    navigate("home");
  }

  function updateTimer() {
    const element = document.getElementById("quiz-timer");
    const session = state.activeSession;
    if (!element || !session) return;
    if (session.mode === "review") {
      if (session.index >= session.ids.length - 1) element.textContent = "已到最后一题，可返回查看或完成看题";
      else if (!session.autoPlaying) element.textContent = "自动翻页已暂停";
      else element.textContent = `自动翻页 · ${Math.max(1, Math.ceil((session.autoNextAt - Date.now()) / 1000))}秒后显示下一题`;
      return;
    }
    const elapsed = (Date.now() - session.startedAt) / 1000;
    if (session.durationMinutes) {
      const remaining = session.durationMinutes * 60 - elapsed;
      element.textContent = `剩余时间${formatSeconds(remaining)}`;
      if (remaining <= 0) finishSession();
    } else {
      element.textContent = `本次用时${formatSeconds(elapsed)}`;
    }
  }

  function selectOption(index) {
    const session = state.activeSession;
    if (!session || session.mode === "review") return;
    const resolved = resolveSessionQuestion(session);
    if (!resolved) return;
    const { question, sessionKey } = resolved;
    const alreadyGraded = Object.prototype.hasOwnProperty.call(session.graded, sessionKey);
    if (alreadyGraded && session.mode !== "exam") return;
    const selected = session.answers[sessionKey] || [];
    if (question.type === "多选题") {
      session.answers[sessionKey] = selected.includes(index) ? selected.filter((item) => item !== index) : [...selected, index];
    } else {
      session.answers[sessionKey] = [index];
      // 背题快刷：单选题和判断题选完直接交给 submitAnswer()，它会判分、记统计并重绘，
      // 这里不能自己判分，也不要再多渲染一次。多选题不走这条路，仍需点提交。
      if (!alreadyGraded && fastAnswerActive(session) && (question.type === "单选题" || question.type === "判断题")) return submitAnswer();
    }
    saveState();
    renderQuiz();
  }

  function submitAnswer() {
    const session = state.activeSession;
    const resolved = resolveSessionQuestion(session);
    if (!resolved) return;
    const { question, sessionKey } = resolved;
    let selected = session.answers[sessionKey] ?? emptyAnswerForQuestion(question);
    if (question.type === "填空题") {
      selected = [...document.querySelectorAll(".fill-blank-input")].map((input) => input.value.trim());
      session.answers[sessionKey] = selected;
    } else if (question.type === "简答题") {
      selected = String(document.getElementById("subjective-answer")?.value || "").trim();
      session.answers[sessionKey] = selected;
    }
    if (!selected.length || (question.type === "填空题" && selected.some((part) => !part))) return showToast(question.type === "填空题" ? "请填写每一空" : (isSubjectiveQuestion(question) ? "请先填写答案" : "请先选择答案"));
    const correct = answerIsCorrect(question, selected);
    session.graded[sessionKey] = correct;
    applyAttempt(question.id, selected, correct, resolved.context.state);
    if (session.mode === "brush") {
      state.brush.completed += 1;
      state.brush.lastAnsweredId = question.id;
      state.brush.lastAnsweredAt = new Date().toISOString();
      state.brush.index = session.index >= session.ids.length - 1 ? 0 : session.index + 1;
    }
    if (resolved.bankId !== currentBank.id) persistProgressFor(resolved.bankId, resolved.context.state);
    saveState();
    renderQuiz();
    if (session.mode !== "exam") fx("answer", { correct });
  }

  function applyAttempt(id, answer, correct, progressState = state) {
    const record = recordForState(progressState, id);
    record.attempts += 1;
    record.lastAnswer = Array.isArray(answer) ? [...answer] : String(answer || "");
    record.lastCorrect = correct;
    record.lastAnsweredAt = new Date().toISOString();
    if (correct) {
      record.correctCount += 1;
      record.streak += 1;
      record.reviewLevel = Math.min(intervals.length, record.reviewLevel + 1);
      record.nextReview = addDays(intervals[Math.max(0, record.reviewLevel - 1)]);
    } else {
      record.wrongCount += 1;
      record.streak = 0;
      record.wrong = true;
      record.mastered = false;
      record.reviewLevel = 0;
      record.nextReview = localDate();
    }
    const today = localDate();
    progressState.daily[today] ||= { answered: 0, correct: 0, seconds: 0 };
    progressState.daily[today].answered += 1;
    if (correct) progressState.daily[today].correct += 1;
  }

  function nextQuestion() {
    const session = state.activeSession;
    if (!session) return;
    if (session.mode === "review") return advanceReview(false);
    if (session.mode !== "exam" && !Object.prototype.hasOwnProperty.call(session.graded, session.ids[session.index])) return showToast("请先提交本题答案");
    if (session.index >= session.ids.length - 1 && session.mode === "brush") {
      state.brush.cycles += 1;
      state.brush.index = 0;
      session.index = 0;
      session.answers = {};
      session.graded = {};
      session.startedAt = Date.now();
      saveState();
      showToast("已刷完一轮，开始新一轮");
      return renderQuiz();
    }
    if (session.index >= session.ids.length - 1) return finishSession();
    session.index += 1;
    saveState();
    renderQuiz();
  }

  function previousQuestion() {
    if (!state.activeSession || state.activeSession.index === 0) return;
    state.activeSession.index -= 1;
    if (state.activeSession.mode === "review") state.activeSession.autoNextAt = null;
    saveState();
    renderQuiz();
  }

  function finishSession() {
    const session = state.activeSession;
    if (!session) return;
    clearInterval(timerHandle);
    if (session.mode === "exam") {
      session.ids.forEach((sessionKey, index) => {
        const resolved = resolveSessionQuestion(session, index);
        if (!resolved) return;
        const { question } = resolved;
        const answer = session.answers[sessionKey] ?? emptyAnswerForQuestion(question);
        const correct = answerIsCorrect(question, answer);
        session.graded[sessionKey] = correct;
        applyAttempt(question.id, answer, correct, resolved.context.state);
      });
    }
    const correctIds = session.ids.filter((sessionKey) => session.graded[sessionKey] === true);
    const wrongIds = session.ids.filter((sessionKey) => session.graded[sessionKey] !== true);
    const examScore = session.examBlueprint ? session.ids.reduce((total, sessionKey, index) => {
      if (session.graded[sessionKey] !== true) return total;
      const resolved = resolveSessionQuestion(session, index);
      return total + (session.examBlueprint.points?.[resolved?.question.type] || 0);
    }, 0) : null;
    const duration = Math.round((Date.now() - session.startedAt) / 1000);
    const wrongQuestions = session.ids.map((sessionKey, index) => {
      if (session.graded[sessionKey] === true) return null;
      const resolved = resolveSessionQuestion(session, index);
      if (!resolved) return null;
      const savedAnswer = session.answers[sessionKey] ?? emptyAnswerForQuestion(resolved.question);
      return { sessionKey, bankId: resolved.bankId, questionId: resolved.question.id, answer: Array.isArray(savedAnswer) ? [...savedAnswer] : String(savedAnswer) };
    }).filter(Boolean);
    lastSummary = { title: session.title, total: session.ids.length, correct: correctIds.length, wrongIds, wrongQuestions, duration, score: examScore, maxScore: session.examBlueprint?.totalScore || null, scope: session.scope || "single", bankIds: session.bankIds || [currentBank.id] };
    const grouped = new Map();
    session.ids.forEach((sessionKey, index) => {
      const resolved = resolveSessionQuestion(session, index);
      if (!resolved) return;
      if (!grouped.has(resolved.bankId)) grouped.set(resolved.bankId, { context: resolved.context, total: 0, correct: 0 });
      const item = grouped.get(resolved.bankId);
      item.total += 1;
      if (session.graded[sessionKey] === true) item.correct += 1;
    });
    const validTotal = [...grouped.values()].reduce((sum, item) => sum + item.total, 0) || 1;
    const today = localDate();
    grouped.forEach((item, bankId) => {
      const allocatedDuration = Math.round(duration * item.total / validTotal);
      item.context.state.sessions.unshift({ date: new Date().toISOString(), title: session.title, total: item.total, correct: item.correct, duration: allocatedDuration });
      item.context.state.sessions = normalizeSessionHistory(item.context.state.sessions);
      item.context.state.daily[today] ||= { answered: 0, correct: 0, seconds: 0 };
      item.context.state.daily[today].seconds += allocatedDuration;
      if (bankId !== currentBank.id) persistProgressFor(bankId, item.context.state);
    });
    state.activeSession = null;
    saveState();
    navigate("summary");
  }

  function renderSummary() {
    if (!lastSummary) return navigate("home");
    const score = lastSummary.maxScore ? lastSummary.score : (lastSummary.total ? Math.round(lastSummary.correct / lastSummary.total * 100) : 0);
    const scoreLabel = lastSummary.maxScore ? `得分 / ${lastSummary.maxScore}` : "正确率";
    const ratio = Math.min(1, Math.max(0, lastSummary.maxScore ? (lastSummary.score || 0) / lastSummary.maxScore : (lastSummary.total ? lastSummary.correct / lastSummary.total : 0)));
    const ringOffset = Math.round((1 - ratio) * 10000) / 100;
    view.innerHTML = `<section class="panel summary">
      <span class="tag type">${escapeHtml(lastSummary.title)}</span><h1>本次练习完成</h1>
      <div class="fx-slot fx-slot-summary" data-fx-slot="summary" aria-hidden="true"></div>
      <div class="summary-score" data-score="${score}"><svg class="summary-ring" viewBox="0 0 154 154" aria-hidden="true" focusable="false"><circle class="summary-ring-track" cx="77" cy="77" r="71"></circle>${ratio > 0 ? `<circle class="summary-ring-value" cx="77" cy="77" r="71" pathLength="100" stroke-dashoffset="${ringOffset}" data-offset="${ringOffset}"></circle>` : ""}</svg><div><strong><span class="summary-score-roll" aria-hidden="true">${score}</span><span class="sr-only">${score}</span></strong><span>${scoreLabel}</span></div></div>
      <div class="summary-metrics"><div><strong>${lastSummary.total}</strong><span>答题数</span></div><div><strong>${lastSummary.correct}</strong><span>答对</span></div><div><strong>${formatSeconds(lastSummary.duration)}</strong><span>用时</span></div></div>
      <div class="summary-actions"><button class="button secondary" data-nav="home"><i data-lucide="house"></i>返回首页</button>${lastSummary.wrongIds.length ? '<button class="button primary" data-action="retrySummary"><i data-lucide="rotate-ccw"></i>重练本次错题</button>' : ""}</div>
      ${lastSummary.wrongQuestions?.length ? `<section class="summary-wrong-review"><div class="section-title"><h2>错题回顾</h2><span>${lastSummary.wrongQuestions.length}道</span></div><p>已展示本次作答、正确答案和题目解析；未作答的题也会列在这里。</p>${lastSummary.wrongQuestions.map((item, index) => renderSummaryWrongQuestion(item, index)).join("")}</section>` : ""}
    </section>`;
    icons();
    animateSummaryScore(view.querySelector(".summary-score"));
    fx("page", "summary", { total: lastSummary.total, correct: lastSummary.correct, title: lastSummary.title });
  }

  // 结算页分数圈的入场：圆环沿 stroke-dashoffset 从空画到「得分 / 满分」，中心数字同步从 0 滚到得分（3.14.0，借设计合集「圆环计数弹出」的圆环那一半）。
  // 终态已经写在 HTML 里（环的 dashoffset、数字、给读屏的隐藏文字），这里只是从 0 播到终态；减弱动态效果、不支持 WAAPI 时什么都不做。
  // 滚动的那个数字是 aria-hidden：#view 是 aria-live 区域，逐帧改字会被读屏一遍遍念。
  // 数字的进度读动画自己的 getComputedTiming().progress（已经套过 easing），和环走同一条曲线、同一个时钟。
  function animateSummaryScore(scoreEl) {
    const ring = scoreEl?.querySelector(".summary-ring-value");
    const roll = scoreEl?.querySelector(".summary-score-roll");
    if (!ring || !roll || prefersReducedMotion() || typeof ring.animate !== "function") return;
    const target = Number(scoreEl.dataset.score) || 0;
    const animation = ring.animate([{ strokeDashoffset: 100 }, { strokeDashoffset: Number(ring.dataset.offset) || 0 }], { duration: 1200, easing: "cubic-bezier(.2, .7, .2, 1)" });
    roll.textContent = "0";
    const tick = () => {
      if (!roll.isConnected) { animation.cancel(); return; }
      const progress = animation.effect?.getComputedTiming().progress;
      if (progress == null || animation.playState === "finished") { roll.textContent = String(target); return; }
      roll.textContent = String(Math.round(target * progress));
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  function renderSummaryWrongQuestion(item, index) {
    const context = getBankContext(item.bankId);
    const question = context?.questionMap.get(item.questionId);
    if (!question) return "";
    const selected = Array.isArray(item.answer) ? item.answer : [];
    const yourAnswer = question.type === "填空题"
      ? (fillSubmittedParts(question, item.answer).map((answer, answerIndex) => `第${answerIndex + 1}空：${answer || "未作答"}`).join("；"))
      : question.type === "简答题"
        ? (String(item.answer || "").trim() || "未作答")
        : (selected.length ? selected.map((answer) => `${optionLetters[answer] || "?"}. ${question.options[answer] || ""}`).join("；") : "未作答");
    const optionList = isSubjectiveQuestion(question) ? "" : `<ol class="search-options">${question.options.map((option, optionIndex) => `<li class="${question.correct.includes(optionIndex) ? "is-correct" : ""}"><b>${optionLetters[optionIndex]}.</b> ${escapeHtml(option)}</li>`).join("")}</ol>`;
    return `<details class="summary-wrong-item" ${index === 0 ? "open" : ""}><summary><span><strong>第${index + 1}道错题</strong><small>${escapeHtml(context.meta.name)} · ${escapeHtml(question.type)}</small></span><i data-lucide="chevron-down"></i></summary><div class="summary-wrong-body"><h3>${escapeHtml(question.stem)}</h3>${optionList}<div class="summary-answer wrong"><strong>你的答案：</strong>${escapeHtml(yourAnswer)}</div><div class="summary-answer correct"><strong>参考答案：</strong>${escapeHtml(questionAnswer(question))}</div>${sourceExplanation(question) ? `<div class="summary-explanation"><strong>答题依据与原解析：</strong>${escapeHtml(sourceExplanation(question))}</div>` : ""}</div></details>`;
  }

  function renderLibrary() {
    const labels = { wrong: "未掌握错题", hard: "不会的题", favorite: "收藏题", mastered: "已掌握" };
    view.innerHTML = `
      <div class="page-header"><div>${pageTitle("错题与标记")}<p>“不会”标记不会被系统自动移除，由你决定何时掌握。</p></div><div class="header-actions"><button class="button primary" data-action="practiceLibrary"><i data-lucide="play"></i>练习当前题目</button></div></div>
      <div class="filter-bar">
        <div class="search-box"><i data-lucide="search"></i><input id="library-search" type="search" placeholder="搜索题干或选项"></div>
        <select id="library-kind" aria-label="题目状态">${Object.entries(labels).map(([value, label]) => `<option value="${value}" ${libraryFilter === value ? "selected" : ""}>${label}</option>`).join("")}</select>
        <select id="library-type" aria-label="题型"><option value="all">全部题型</option>${QUESTION_TYPES.map((type) => `<option>${type}</option>`).join("")}</select>
      </div>
      <div id="library-results"></div>`;
    document.getElementById("library-search").addEventListener("input", renderLibraryResults);
    document.getElementById("library-kind").addEventListener("change", (event) => { libraryFilter = event.target.value; renderLibraryResults(); });
    document.getElementById("library-type").addEventListener("change", renderLibraryResults);
    renderLibraryResults();
    icons();
  }

  function renderQuestionSearch() {
    const bankChoices = bankRegistry.banks.map((bank) => {
      const available = getBankContext(bank.id)?.questions.length || 0;
      return `<option value="${bank.id}" ${bank.id === currentBank.id ? "selected" : ""}>${escapeHtml(bank.name)}（${available}道）</option>`;
    }).join("");
    // 标签与联想只活在这一页：每次进搜题页从空白开始，和输入框本身一样。
    questionSearchTags = [];
    questionSearchShown = false;
    questionSuggest = { items: [], active: -1, composing: false };
    clearTimeout(questionSearchRefreshHandle);
    glossaryCountCache.clear();
    view.innerHTML = `
      <div class="page-header"><div>${pageTitle("搜题")}<p>输入题干、选项或解析中的关键词，系统会直接展示有关题目和正确答案；搜索不会影响做题记录。</p></div></div>
      <section class="panel search-panel">
        <div class="search-form"><div class="search-box question-search-box" id="question-search-box"><i data-lucide="search"></i><input id="question-search-keyword" type="search" placeholder="例如：票据贴现、结算、保证金" autocomplete="off" aria-label="题目关键词" role="combobox" aria-expanded="false" aria-controls="question-search-suggest" aria-autocomplete="list"><div class="search-suggest" id="question-search-suggest" role="listbox" aria-label="搜索联想" hidden></div></div><select id="question-search-bank" aria-label="搜索范围"><option value="all">全部题库</option>${bankChoices}</select><select id="question-search-type" aria-label="题型筛选"><option value="all">全部题型</option>${QUESTION_TYPES.map((type) => `<option value="${type}">${type}</option>`).join("")}</select><button class="button primary" data-action="searchQuestions" type="button"><i data-lucide="search"></i>搜题</button></div>
        <small class="field-help">支持多个关键词；每个关键词都需出现在题干、选项或解析中。输入时会联想题库名和常用术语，选中后变成可删除的标签。记不清原文时可以只打个大概，允许几个错字，近似结果会排在完全匹配之后。</small>
      </section>
      <div id="question-search-results" class="question-search-results">${QUESTION_SEARCH_EMPTY}</div>`;
    bindQuestionSearchBox();
    icons();
  }

  const QUESTION_SEARCH_EMPTY = '<div class="list-panel empty-state"><i data-lucide="search"></i><div>输入关键词后开始搜题</div></div>';

  // ── 搜题框：输入联想 + 可删除的标签（3.13.0） ─────────────────────────────
  // 标签两种：关键词标签（选常用术语得到，和手打的词一样参与「每个都要出现」的搜索）；
  // 题库标签（选题库名得到，最多一个，和 #question-search-bank 下拉双向同步）。
  // 联想只用已有的两样：题库名（全名或短名包含输入）和常用术语表 SEARCH_KEYWORDS（术语包含输入、且当前范围里至少一道题出现）。
  let questionSearchTags = [];
  let questionSearchShown = false;
  let questionSuggest = { items: [], active: -1, composing: false };
  let questionSearchRefreshHandle = null;
  let questionSearchHoldToken = 0;
  const QUESTION_SUGGEST_LIMIT = 8;
  const questionHaystackCache = new WeakMap();
  const glossaryCountCache = new Map();
  // 标签里的两个小图标直接内联（lucide 的 x 与 library），不为它们整页重跑一遍 createIcons。
  const TAG_ICON_X = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
  const TAG_ICON_BANK = '<svg class="search-tag-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/></svg>';
  // 输入法组字时的按键不算数（回车是选词、上下键是翻候选）：keydown 一律先判这个。
  const isImeKey = (event) => event.isComposing || event.keyCode === 229;

  function questionHaystack(question) {
    let haystack = questionHaystackCache.get(question);
    if (haystack === undefined) {
      haystack = `${question.stem} ${question.options.join(" ")} ${question.answer || ""} ${question.explanation || ""}`.toLocaleLowerCase();
      questionHaystackCache.set(question, haystack);
    }
    return haystack;
  }

  // 当前搜索范围：题库下拉 + 题型下拉。搜题和术语题数用同一份口径。
  function questionSearchScope() {
    const bankId = document.getElementById("question-search-bank")?.value || "all";
    const type = document.getElementById("question-search-type")?.value || "all";
    const contexts = bankId === "all" ? bankRegistry.banks.map((bank) => getBankContext(bank.id)).filter(Boolean) : [getBankContext(bankId)].filter(Boolean);
    return { key: `${bankId}|${type}`, type, contexts };
  }

  function keywordQuestionCount(term, scope) {
    const key = `${scope.key}|${term}`;
    if (glossaryCountCache.has(key)) return glossaryCountCache.get(key);
    const needle = term.toLocaleLowerCase();
    let count = 0;
    scope.contexts.forEach((context) => context.questions.forEach((question) => {
      if ((scope.type === "all" || question.type === scope.type) && questionHaystack(question).includes(needle)) count += 1;
    }));
    glossaryCountCache.set(key, count);
    return count;
  }

  // 关键词 = 标签里的关键词 + 输入框里剩下的文字（按空格拆）。
  function questionSearchKeywords() {
    const typed = (document.getElementById("question-search-keyword")?.value || "").trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    const tagged = questionSearchTags.filter((tag) => tag.kind === "keyword").map((tag) => tag.value.toLocaleLowerCase());
    return [...new Set([...tagged, ...typed])];
  }

  // 光标所在的那一段（两边到空格为止）就是「正在打的文字」：联想按它匹配，选中后删掉的也是它。
  function questionSearchToken(input) {
    const value = input.value;
    const caret = input.selectionStart ?? value.length;
    const start = caret - value.slice(0, caret).match(/\S*$/)[0].length;
    const end = caret + value.slice(caret).match(/^\S*/)[0].length;
    return { text: value.slice(start, end), start, end };
  }

  function questionSuggestions(token) {
    const needle = token.trim().toLocaleLowerCase();
    if (!needle) return [];
    const bankTag = questionSearchTags.find((tag) => tag.kind === "bank");
    const banks = bankRegistry.banks
      .filter((bank) => bank.id !== bankTag?.value)
      .map((bank) => ({ bank, short: bankChipMeta(bank).short }))
      .filter(({ bank, short }) => String(bank.name).toLocaleLowerCase().includes(needle) || short.toLocaleLowerCase().includes(needle))
      .slice(0, QUESTION_SUGGEST_LIMIT)
      .map(({ bank, short }) => ({ kind: "bank", value: bank.id, label: String(bank.name), short, count: getBankContext(bank.id)?.questions.length || 0 }));
    if (banks.length >= QUESTION_SUGGEST_LIMIT) return banks;
    const taken = new Set(questionSearchTags.filter((tag) => tag.kind === "keyword").map((tag) => tag.value));
    const scope = questionSearchScope();
    const terms = SEARCH_KEYWORDS
      .filter((term) => !taken.has(term) && term.toLocaleLowerCase().includes(needle))
      .map((term) => ({ kind: "keyword", value: term, label: term, count: keywordQuestionCount(term, scope) }))
      .filter((item) => item.count > 0)
      // 以输入开头的排前面，其次题多的在前。
      .sort((left, right) => (Number(right.label.startsWith(needle)) - Number(left.label.startsWith(needle))) || right.count - left.count);
    return [...banks, ...terms.slice(0, QUESTION_SUGGEST_LIMIT - banks.length)];
  }

  function highlightMatch(text, token) {
    const needle = token.trim().toLocaleLowerCase();
    const index = needle ? text.toLocaleLowerCase().indexOf(needle) : -1;
    if (index < 0) return escapeHtml(text);
    return `${escapeHtml(text.slice(0, index))}<mark>${escapeHtml(text.slice(index, index + needle.length))}</mark>${escapeHtml(text.slice(index + needle.length))}`;
  }

  function questionSuggestOpen() {
    const list = document.getElementById("question-search-suggest");
    return Boolean(list && !list.hidden);
  }

  function closeQuestionSuggest() {
    const input = document.getElementById("question-search-keyword");
    const list = document.getElementById("question-search-suggest");
    questionSuggest.items = [];
    questionSuggest.active = -1;
    if (list) { list.hidden = true; list.innerHTML = ""; }
    if (input) { input.setAttribute("aria-expanded", "false"); input.removeAttribute("aria-activedescendant"); }
  }

  function updateQuestionSuggest({ highlightFirst = false } = {}) {
    const input = document.getElementById("question-search-keyword");
    const list = document.getElementById("question-search-suggest");
    if (!input || !list || questionSuggest.composing) return;
    const token = questionSearchToken(input).text;
    const items = questionSuggestions(token);
    if (!items.length) return closeQuestionSuggest();
    const wasOpen = !list.hidden;
    questionSuggest.items = items;
    questionSuggest.active = highlightFirst ? 0 : -1;
    const group = (kind, label) => {
      const members = items.map((item, index) => ({ item, index })).filter(({ item }) => item.kind === kind);
      if (!members.length) return "";
      return `<div class="search-suggest-group" role="group" aria-label="${label}"><div class="search-suggest-label" aria-hidden="true">${label}</div>${members.map(({ item, index }) => `<div class="search-suggest-option" role="option" id="question-search-option-${index}" data-index="${index}" aria-selected="false"${item.kind === "bank" ? ` title="${escapeHtml(item.label)}"` : ""}><span class="search-suggest-text">${highlightMatch(item.label, token)}</span><span class="search-suggest-count">${item.count} 题</span></div>`).join("")}</div>`;
    };
    list.innerHTML = group("bank", "题库") + group("keyword", "常用术语");
    list.hidden = false;
    input.setAttribute("aria-expanded", "true");
    setQuestionSuggestActive(questionSuggest.active);
    positionQuestionSuggest();
    if (!wasOpen && !prefersReducedMotion() && typeof list.animate === "function") {
      list.animate([{ opacity: 0, transform: `translateY(${-4}px) scale(.98)` }, { opacity: 1, transform: "none" }], { duration: 140, easing: "cubic-bezier(.2, .8, .2, 1)" });
    }
  }

  function setQuestionSuggestActive(index) {
    const input = document.getElementById("question-search-keyword");
    const list = document.getElementById("question-search-suggest");
    if (!input || !list) return;
    questionSuggest.active = index;
    list.querySelectorAll("[role='option']").forEach((option) => {
      const selected = Number(option.dataset.index) === index;
      option.setAttribute("aria-selected", selected ? "true" : "false");
      option.classList.toggle("is-active", selected);
    });
    if (index >= 0) input.setAttribute("aria-activedescendant", `question-search-option-${index}`);
    else input.removeAttribute("aria-activedescendant");
  }

  // 浮层在搜索框正下方，左端对齐到输入框里光标的横坐标：用 canvas 量光标前那段文字的宽度。
  // 不超出搜索框右缘和屏幕右缘；手机（≤600）浮层与搜索框同宽，直接贴左。
  function positionQuestionSuggest() {
    const box = document.getElementById("question-search-box");
    const input = document.getElementById("question-search-keyword");
    const list = document.getElementById("question-search-suggest");
    if (!box || !input || !list || list.hidden) return;
    if (window.matchMedia?.("(max-width: 600px)")?.matches) { list.style.left = "0px"; return; }
    const style = getComputedStyle(input);
    const context = (positionQuestionSuggest.canvas ||= document.createElement("canvas")).getContext("2d");
    context.font = style.font || `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const before = input.value.slice(0, input.selectionStart ?? input.value.length);
    const inputRect = input.getBoundingClientRect();
    const boxRect = box.getBoundingClientRect();
    const caretX = inputRect.left + parseFloat(style.borderLeftWidth || 0) + parseFloat(style.paddingLeft || 0) + context.measureText(before).width - input.scrollLeft;
    const width = list.offsetWidth;
    const maxLeft = Math.min(box.clientWidth - width, document.documentElement.clientWidth - 8 - boxRect.left - width);
    list.style.left = `${Math.round(Math.max(0, Math.min(caretX - boxRect.left, maxLeft)))}px`;
  }

  function questionSearchTagHtml(tag) {
    const bank = tag.kind === "bank";
    const label = bank ? `删除题库筛选：${tag.label}` : `删除关键词：${tag.label}`;
    return `<span class="search-tag${bank ? " is-bank" : ""}" data-kind="${tag.kind}" data-value="${escapeHtml(tag.value)}"><span class="search-tag-bg" aria-hidden="true"></span><span class="search-tag-dot" aria-hidden="true"></span>${bank ? TAG_ICON_BANK : ""}<span class="search-tag-text"${bank ? ` title="${escapeHtml(tag.title || tag.label)}"` : ""}>${escapeHtml(tag.label)}</span><button class="search-tag-remove" type="button" aria-label="${escapeHtml(label)}">${TAG_ICON_X}</button></span>`;
  }

  function createQuestionSearchTag(tag) {
    const holder = document.createElement("span");
    holder.innerHTML = questionSearchTagHtml(tag);
    return holder.firstElementChild;
  }

  // 在 box 里 mutate 之后，排在 anchor 后面的标签和输入框用 flipMove 依次补位（每个晚 24ms 起步，最多晚 96ms）。
  // 行数变少时，搜索框先保持原高度（一次性写 min-height，不逐帧改），补位滑完再一次性放开、直接收缩。
  function reflowQuestionSearchBox(box, followers, mutate) {
    const heightBefore = box.offsetHeight;
    const previous = new Map(followers.map((element) => [element, new Set(element.getAnimations?.() || [])]));
    flipMove(followers, mutate, { duration: 240 });
    let delay = 0;
    if (!prefersReducedMotion()) {
      followers.forEach((element) => {
        const fresh = (element.getAnimations?.() || []).filter((animation) => !previous.get(element).has(animation));
        if (!fresh.length) return;
        delay = Math.min(delay + 24, 120);
        fresh.forEach((animation) => animation.effect?.updateTiming({ delay: delay - 24, fill: "backwards" }));
      });
    }
    box.style.minHeight = "";
    const token = ++questionSearchHoldToken;
    if (!prefersReducedMotion() && box.offsetHeight < heightBefore) {
      box.style.minHeight = `${heightBefore}px`;
      setTimeout(() => { if (token === questionSearchHoldToken) box.style.minHeight = ""; }, 240 + delay);
    }
    return 240 + delay;
  }

  function addQuestionSearchTag(tag) {
    const box = document.getElementById("question-search-box");
    const input = document.getElementById("question-search-keyword");
    if (!box || !input) return;
    if (tag.kind === "bank") {
      const bankSelect = document.getElementById("question-search-bank");
      if (bankSelect) bankSelect.value = tag.value;
      const existing = questionSearchTags.find((item) => item.kind === "bank");
      if (existing) {
        // 最多一个题库标签：再选别的题库就原地替换，后面的标签随宽度变化补位。
        Object.assign(existing, tag);
        const element = box.querySelector(".search-tag[data-kind='bank']:not(.is-removing)");
        if (element) {
          const followers = [...box.querySelectorAll(".search-tag, #question-search-keyword")].filter((item) => element.compareDocumentPosition(item) & Node.DOCUMENT_POSITION_FOLLOWING);
          const settle = reflowQuestionSearchBox(box, followers, () => element.replaceWith(createQuestionSearchTag(existing)));
          return questionSearchTagsChanged(prefersReducedMotion() ? 0 : settle);
        }
        questionSearchTags = questionSearchTags.filter((item) => item !== existing);
      }
    }
    questionSearchTags.push(tag);
    const element = createQuestionSearchTag(tag);
    const settle = reflowQuestionSearchBox(box, [input], () => box.insertBefore(element, input));
    if (!prefersReducedMotion() && typeof element.animate === "function") {
      element.animate([{ opacity: 0, transform: "scale(.6)" }, { opacity: 1, transform: "none" }], { duration: 180, easing: "cubic-bezier(.2, .8, .2, 1)" });
    }
    questionSearchTagsChanged(prefersReducedMotion() ? 0 : settle);
  }

  // 点叉号 / 空输入框退格 / 下拉改回「全部题库」：标签先缩成小圆点再移除，后面的标签依次补位。
  function removeQuestionSearchTag(element, { fromSelect = false } = {}) {
    const box = document.getElementById("question-search-box");
    const input = document.getElementById("question-search-keyword");
    if (!box || !input || !element || element.classList.contains("is-removing")) return;
    const { kind, value } = element.dataset;
    questionSearchTags = questionSearchTags.filter((tag) => !(tag.kind === kind && tag.value === value));
    if (kind === "bank" && !fromSelect) {
      const bankSelect = document.getElementById("question-search-bank");
      if (bankSelect) bankSelect.value = "all";
    }
    const hadFocus = element.contains(document.activeElement);
    element.classList.add("is-removing");
    element.setAttribute("aria-hidden", "true");
    const button = element.querySelector(".search-tag-remove");
    if (button) { button.disabled = true; button.tabIndex = -1; }
    if (hadFocus) input.focus();
    // 条件立刻变（联想列表马上按新条件更新）；结果区等圆点和补位走完再重排。
    clearTimeout(questionSearchRefreshHandle);
    if (questionSuggestOpen()) updateQuestionSuggest();
    const finish = () => {
      if (!element.isConnected) return;
      const followers = [...box.querySelectorAll(".search-tag, #question-search-keyword")].filter((item) => element.compareDocumentPosition(item) & Node.DOCUMENT_POSITION_FOLLOWING);
      const settle = reflowQuestionSearchBox(box, followers, () => element.remove());
      questionSearchTagsChanged(prefersReducedMotion() ? 0 : settle, { suggest: false });
    };
    if (prefersReducedMotion() || typeof element.animate !== "function") return finish();
    // 缩成圆点：文字和叉号先淡出，底色（只动 transform）缩到一个圆点大小并淡掉，同时中心的圆点淡入、再缩没。
    const width = element.offsetWidth || 1;
    const height = element.offsetHeight || 1;
    const dot = element.querySelector(".search-tag-dot");
    const dotSize = dot?.offsetWidth || 8;
    const easing = "cubic-bezier(.4, 0, .2, 1)";
    element.querySelectorAll(".search-tag-text, .search-tag-remove, .search-tag-icon").forEach((part) => part.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 100, easing, fill: "forwards" }));
    element.querySelector(".search-tag-bg")?.animate([{ transform: "none", opacity: 1 }, { transform: `scale(${dotSize / width}, ${dotSize / height})`, opacity: 0 }], { duration: 170, easing, fill: "forwards" });
    const last = dot?.animate([{ opacity: 0, transform: "scale(1)" }, { opacity: 1, transform: "scale(1)", offset: .55 }, { opacity: 0, transform: "scale(.2)" }], { duration: 240, easing, fill: "forwards" });
    if (last) last.finished.then(finish, finish);
    else finish();
  }

  function questionSearchTagsChanged(delay, { suggest = true } = {}) {
    if (suggest && questionSuggestOpen()) updateQuestionSuggest();
    // 页面上已经有搜索结果才自动重搜；等标签动画走完再重排结果，免得几十张卡片的重排压在补位动画上。
    if (!questionSearchShown) return;
    clearTimeout(questionSearchRefreshHandle);
    questionSearchRefreshHandle = setTimeout(() => renderQuestionSearchResults({ auto: true }), delay);
  }

  function chooseQuestionSuggestion(index) {
    const item = questionSuggest.items[index];
    const input = document.getElementById("question-search-keyword");
    if (!item || !input) return;
    // 删掉正在打的那一段，左右两边剩下的文字之间只留一个空格。
    const { start, end } = questionSearchToken(input);
    const left = input.value.slice(0, start).replace(/\s+$/, "");
    const right = input.value.slice(end).replace(/^\s+/, "");
    input.value = left && right ? `${left} ${right}` : left || right;
    const caret = left ? left.length + (right ? 1 : 0) : 0;
    closeQuestionSuggest();
    input.focus();
    input.setSelectionRange(caret, caret);
    addQuestionSearchTag(item.kind === "bank" ? { kind: "bank", value: item.value, label: item.short, title: item.label } : { kind: "keyword", value: item.value, label: item.label });
  }

  function bindQuestionSearchBox() {
    const box = document.getElementById("question-search-box");
    const input = document.getElementById("question-search-keyword");
    const list = document.getElementById("question-search-suggest");
    const bankSelect = document.getElementById("question-search-bank");
    const typeSelect = document.getElementById("question-search-type");
    if (!box || !input || !list) return;
    input.addEventListener("keydown", (event) => {
      if (isImeKey(event)) return;
      const open = questionSuggestOpen();
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        // 上下键在列表里移动高亮，首尾循环；列表收着时按 ↓ 打开并高亮第一项。
        if (!open) {
          if (event.key !== "ArrowDown") return;
          updateQuestionSuggest({ highlightFirst: true });
          if (questionSuggestOpen()) event.preventDefault();
          return;
        }
        event.preventDefault();
        const count = questionSuggest.items.length;
        const step = event.key === "ArrowDown" ? 1 : -1;
        const current = questionSuggest.active;
        setQuestionSuggestActive(current < 0 ? (step > 0 ? 0 : count - 1) : (current + step + count) % count);
        document.getElementById(`question-search-option-${questionSuggest.active}`)?.scrollIntoView({ block: "nearest" });
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        // 有高亮项时回车选中它；没有高亮项时回车照旧执行搜索。
        if (open && questionSuggest.active >= 0) return chooseQuestionSuggestion(questionSuggest.active);
        closeQuestionSuggest();
        renderQuestionSearchResults();
        return;
      }
      if (event.key === "Escape") {
        // 收起浮层；再按一次也不做别的（也不让 type=search 原生的 Esc 清空输入框）。
        event.preventDefault();
        if (open) closeQuestionSuggest();
        return;
      }
      if (event.key === "Backspace" && !input.value) {
        const tags = [...box.querySelectorAll(".search-tag:not(.is-removing)")];
        if (!tags.length) return;
        event.preventDefault();
        removeQuestionSearchTag(tags[tags.length - 1]);
      }
    });
    input.addEventListener("input", (event) => {
      if (event.isComposing || questionSuggest.composing) return;
      updateQuestionSuggest();
    });
    // 输入法组字期间列表不跟着变，组完（compositionend）立刻按最终文字更新一次。
    input.addEventListener("compositionstart", () => { questionSuggest.composing = true; });
    input.addEventListener("compositionend", () => { questionSuggest.composing = false; updateQuestionSuggest(); });
    input.addEventListener("blur", closeQuestionSuggest);
    input.addEventListener("click", positionQuestionSuggest);
    input.addEventListener("keyup", (event) => { if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) positionQuestionSuggest(); });
    // 按下时阻止默认，输入框不失焦（浮层不会先被 blur 收掉）；点完再选中。
    list.addEventListener("mousedown", (event) => event.preventDefault());
    list.addEventListener("click", (event) => {
      const option = event.target.closest("[role='option']");
      if (option) chooseQuestionSuggestion(Number(option.dataset.index));
    });
    // 点搜索框里的空白或标签文字等于点输入框；点叉号不抢焦点（手机上不会因此弹出或收起键盘）。
    box.addEventListener("mousedown", (event) => {
      if (event.target === input || list.contains(event.target)) return;
      event.preventDefault();
      if (!event.target.closest(".search-tag-remove")) input.focus();
    });
    box.addEventListener("click", (event) => {
      const button = event.target.closest(".search-tag-remove");
      if (button) removeQuestionSearchTag(button.closest(".search-tag"));
    });
    // 下拉 → 标签：已有题库标签时，改成别的题库就换、改回「全部题库」就删；没有题库标签时照旧只改下拉。
    bankSelect?.addEventListener("change", () => {
      const tag = questionSearchTags.find((item) => item.kind === "bank");
      if (!tag) return questionSuggestOpen() && updateQuestionSuggest();
      if (bankSelect.value === "all") return removeQuestionSearchTag(box.querySelector(".search-tag[data-kind='bank']:not(.is-removing)"), { fromSelect: true });
      const bank = bankRegistry.banks.find((item) => item.id === bankSelect.value);
      if (bank && bank.id !== tag.value) addQuestionSearchTag({ kind: "bank", value: bank.id, label: bankChipMeta(bank).short, title: String(bank.name) });
    });
    typeSelect?.addEventListener("change", () => { if (questionSuggestOpen()) updateQuestionSuggest(); });
  }

  // 窗口宽度变了（转屏、拖窗口）浮层跟着光标重新对齐；浮层收着时 positionQuestionSuggest 直接返回。
  window.addEventListener("resize", () => positionQuestionSuggest());

  function sourceQuestionByNumber(bankId, number) {
    const definition = builtInBankMap.get(bankId);
    return definition?.questions.find((question) => Number(question.number) === Number(number)) || null;
  }

  function renderComparisonQuestion(question, bankName, originalNumber, bankId) {
    if (!question) return `<section class="comparison-question missing"><h2>${escapeHtml(bankName)} · 原题号${originalNumber}</h2><p>这道题已不在随包题库中，无法展示。</p></section>`;
    return `<section class="comparison-question"><div class="comparison-question-head"><span class="tag type">${escapeHtml(question.type)}</span><span class="tag">${escapeHtml(bankName)} · 原题号${originalNumber}</span></div><h2>${escapeHtml(question.stem)}</h2><ol class="comparison-options">${question.options.map((option, index) => `<li class="${question.correct.includes(index) ? "is-correct" : ""}"><b>${optionLetters[index]}.</b> ${escapeHtml(option)}</li>`).join("")}</ol><div class="comparison-answer"><strong>正确答案：</strong>${escapeHtml(questionAnswer(question))}</div><button class="button secondary comparison-practice" data-action="practiceComparisonQuestion" data-bank-id="${bankId}" data-id="${escapeHtml(question.id)}" type="button"><i data-lucide="play"></i>练这道题</button></section>`;
  }

  function renderQuestionComparison() {
    const confirmed = comparisonEntries.filter((entry) => entry.level === "确认变化");
    const related = comparisonEntries.filter((entry) => entry.level !== "确认变化");
    if (!comparisonEntries.length) {
      view.innerHTML = '<div class="list-panel empty-state"><i data-lucide="git-compare-arrows"></i><div>暂未载入新旧题库对比数据</div></div>';
      return icons();
    }
    view.innerHTML = `
      <div class="page-header"><div>${pageTitle("新旧题库对比")}<p>新版为【新】2026年检题库，旧版为【旧】2023版。下方展示对照表“确认答案变化”中的重点题目。</p></div></div>
      <section class="comparison-summary"><div><strong>${confirmed.length}</strong><span>条确认变化</span></div><div><strong>${related.length}</strong><span>条相近题提示</span></div><p>确认变化题请以新版答案为准；相近题可能因系统、产品、年份或办理条件不同而答案不同。</p></section>
      <div class="comparison-list">
        ${comparisonEntries.map((entry) => {
          const newQuestion = sourceQuestionByNumber(DEFAULT_BANK_ID, entry.newNumber);
          const oldQuestion = sourceQuestionByNumber(LEGACY_ZONGFU_BANK_ID, entry.oldNumber);
          return `<article class="comparison-card ${entry.level === "确认变化" ? "is-confirmed" : "is-related"}"><div class="comparison-card-head"><div><span class="comparison-level">${escapeHtml(entry.level)}</span><span class="tag type">${escapeHtml(entry.type)}</span></div><p>${escapeHtml(entry.note)}</p></div><div class="comparison-grid">${renderComparisonQuestion(newQuestion, "新版", entry.newNumber, DEFAULT_BANK_ID)}${renderComparisonQuestion(oldQuestion, "旧版", entry.oldNumber, LEGACY_ZONGFU_BANK_ID)}</div></article>`;
        }).join("")}
      </div>`;
    icons();
  }

  function questionAnswer(question) {
    if (isSubjectiveQuestion(question)) return String(question.answer || "");
    return question.correct.map((index) => `${optionLetters[index]}. ${question.options[index]}`).join("；");
  }

  function practiceSearchQuestion(bankId, questionId) {
    const context = getBankContext(bankId);
    if (!context?.questionMap.has(questionId)) return showToast("这道题已不在题库中");
    if (bankId !== currentBank.id && !activateQuestionBank(bankId)) return showToast("无法打开该题所属题库");
    startSession([questionId], "practice", "搜题单题练习");
  }

  // 关键词允许的错字数量：太短的词不做模糊，否则噪声大于收益。
  function searchTolerance(keyword) {
    if (keyword.length <= 2) return 0;
    if (keyword.length <= 4) return 1;
    if (keyword.length <= 8) return 2;
    return 3;
  }

  // 近似子串匹配：在 haystack 的任意位置寻找与 keyword 编辑距离不超过 maxDistance 的片段。
  // 首列恒为 0，因此匹配可以从任意位置开始；错字、漏字和多字都能容忍。
  function fuzzyIncludes(haystack, keyword, maxDistance) {
    if (maxDistance <= 0) return haystack.includes(keyword);
    if (haystack.includes(keyword)) return true;
    const n = keyword.length;
    if (haystack.length < n - maxDistance) return false;
    // 先做一次廉价筛除：命中的字符太少就不可能落在阈值内。
    let shared = 0;
    for (let j = 0; j < n; j += 1) if (haystack.includes(keyword[j])) shared += 1;
    if (shared < n - maxDistance) return false;
    let prev = new Array(n + 1);
    let cur = new Array(n + 1);
    for (let j = 0; j <= n; j += 1) prev[j] = j;
    for (let i = 1; i <= haystack.length; i += 1) {
      cur[0] = 0;
      const ch = haystack.charCodeAt(i - 1);
      for (let j = 1; j <= n; j += 1) {
        const cost = ch === keyword.charCodeAt(j - 1) ? 0 : 1;
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      }
      if (cur[n] <= maxDistance) return true;
      const swap = prev;
      prev = cur;
      cur = swap;
    }
    return false;
  }

  // auto：标签增删触发的自动重搜。那时关键词可能已经删光，就回到初始的空状态，不弹「请输入题目关键词」。
  function renderQuestionSearchResults({ auto = false } = {}) {
    const keywordInput = document.getElementById("question-search-keyword");
    const container = document.getElementById("question-search-results");
    if (!keywordInput || !container) return;
    clearTimeout(questionSearchRefreshHandle);
    const keywords = questionSearchKeywords();
    if (!keywords.length) {
      if (!auto) return showToast("请输入题目关键词");
      questionSearchShown = false;
      container.innerHTML = QUESTION_SEARCH_EMPTY;
      return icons();
    }
    const { type, contexts } = questionSearchScope();
    const tolerances = keywords.map(searchTolerance);
    questionSearchShown = true;
    const candidates = contexts.flatMap((context) => context.questions.map((question) => ({ context, question })))
      .filter(({ question }) => type === "all" || question.type === type)
      .map(({ context, question }) => {
        const haystack = questionHaystack(question);
        const exact = keywords.every((keyword) => haystack.includes(keyword));
        if (exact) return { context, question, exact: true };
        // 精确匹配不到时才退回模糊匹配，常见情况不受影响。
        const fuzzy = keywords.every((keyword, index) => fuzzyIncludes(haystack, keyword, tolerances[index]));
        return fuzzy ? { context, question, exact: false } : null;
      }).filter(Boolean);
    // 完全匹配排在前面，近似匹配补在后面。
    const results = [...candidates.filter((item) => item.exact), ...candidates.filter((item) => !item.exact)].slice(0, 60);
    const approximate = results.filter((item) => !item.exact).length;
    if (!results.length) {
      container.innerHTML = '<div class="list-panel empty-state"><i data-lucide="search-x"></i><div>没有找到有关题目，请换一个更短或更准确的关键词</div></div>';
      return icons();
    }
    container.innerHTML = `<p class="search-result-count">找到${results.length}${results.length === 60 ? "+" : ""}道有关题目，答案已直接展开。${approximate ? `其中${approximate}道是近似匹配，已排在完全匹配之后。` : ""}</p>${results.map(({ context, question, exact }) => `<article class="search-question-card"><div class="tags"><span class="tag type">${question.type}</span>${exact ? "" : '<span class="tag approximate">近似匹配</span>'}<span class="tag">题号${question.number || "-"}</span><span class="tag bank-source">题库：${escapeHtml(context.meta.name)}</span></div><h2>${escapeHtml(question.stem)}</h2><ol class="search-options">${question.options.map((option, index) => `<li class="${question.correct.includes(index) ? "is-correct" : ""}"><b>${optionLetters[index]}.</b> ${escapeHtml(option)}</li>`).join("")}</ol><div class="search-answer"><strong>正确答案：</strong>${escapeHtml(questionAnswer(question))}</div><div class="search-card-actions"><button class="button secondary" data-action="practiceSearchQuestion" data-bank-id="${escapeHtml(context.meta.id)}" data-id="${escapeHtml(question.id)}" type="button"><i data-lucide="play"></i>练这道题</button></div></article>`).join("")}`;
    icons();
  }

  function filteredLibraryQuestions() {
    const search = (document.getElementById("library-search")?.value || "").trim().toLowerCase();
    const type = document.getElementById("library-type")?.value || "all";
    return questions.filter((question) => {
      const record = state.records[question.id];
      if (!record) return false;
      const status = libraryFilter === "wrong" ? record.wrong && !record.mastered : libraryFilter === "hard" ? record.hard && !record.mastered : libraryFilter === "favorite" ? record.favorite : record.mastered;
      const matchesType = type === "all" || question.type === type;
      const haystack = `${question.stem} ${question.options.join(" ")} ${question.answer || ""}`.toLowerCase();
      return status && matchesType && (!search || haystack.includes(search));
    });
  }

  function renderLibraryResults() {
    const container = document.getElementById("library-results");
    if (!container) return;
    const results = filteredLibraryQuestions();
    if (!results.length) {
      container.innerHTML = '<div class="list-panel empty-state"><i data-lucide="inbox"></i><div>当前没有符合条件的题目</div></div>';
    } else {
      container.innerHTML = `<div class="list-panel">${results.slice(0, 150).map((question, index) => {
        const record = state.records[question.id];
        return `<button class="question-row" data-action="openQuestion" data-id="${question.id}" type="button"><span class="row-index">${index + 1}</span><span class="row-content"><strong>${escapeHtml(question.stem)}</strong><span>${question.type} · 难度${question.difficulty} · 作答${record.attempts}次 · 错误${record.wrongCount}次</span></span><span class="row-status">${record.hard ? '<i data-lucide="badge-help"></i>' : ""}${record.favorite ? '<i data-lucide="star"></i>' : ""}${record.note ? '<i data-lucide="notebook-pen"></i>' : ""}</span></button>`;
      }).join("")}</div>${results.length > 150 ? `<p class="muted">当前显示前150道，共${results.length}道。可使用搜索缩小范围。</p>` : ""}`;
    }
    icons();
  }

  function bankSummary() {
    return {
      total: allManagedQuestions().length,
      active: questions.length,
      edited: Object.keys(bankState.overrides).length,
      custom: bankState.custom.length,
      disabled: bankState.disabled.length,
    };
  }

  function isCustomQuestion(id) {
    return !baseQuestionMap.has(id);
  }

  function renderBankManager() {
    const summary = bankSummary();
    view.innerHTML = `
      <div class="page-header"><div>${pageTitle("题库管理")}<p>可创建、导入并切换多个题库；支持JSON和Excel（.xlsx）导入，每个题库的学习记录和连续刷题进度相互独立。</p></div></div>
      <section class="bank-switcher panel">
        <div class="bank-switch-field"><label class="field-label" for="bank-switch">当前题库</label><select id="bank-switch">${bankRegistry.banks.map((bank) => `<option value="${bank.id}" ${bank.id === currentBank.id ? "selected" : ""}>${escapeHtml(bank.name)}（${bank.questionCount}道）</option>`).join("")}</select></div>
        <div class="bank-switch-actions"><button class="button secondary" data-action="bankCreate" type="button"><i data-lucide="folder-plus"></i>新建空题库</button><button class="button secondary" data-action="bankRename" type="button"><i data-lucide="pencil-line"></i>重命名</button><button class="button danger" data-action="bankRemove" type="button" ${currentBank.kind === "builtin" ? "disabled" : ""}><i data-lucide="trash-2"></i>删除当前题库</button></div>
      </section>
      <section class="metric-grid">
        ${metric("library-big", "题目总数", summary.total, `启用${summary.active}道`)}
        ${metric("file-pen-line", "已编辑", summary.edited, "可恢复为原题")}
        ${metric("file-plus-2", "自定义题", summary.custom, "由你本地添加")}
        ${metric("eye-off", "已停用", summary.disabled, "不参与刷题")}
      </section>
      <div class="bank-toolbar">
        <div class="search-box"><i data-lucide="search"></i><input id="bank-search" type="search" placeholder="搜索题干、选项或解析"></div>
        <select id="bank-type" aria-label="题型"><option value="all">全部题型</option>${QUESTION_TYPES.map((type) => `<option>${type}</option>`).join("")}</select>
        <select id="bank-status" aria-label="题库状态"><option value="all">全部状态</option><option value="active">仅启用</option><option value="edited">已编辑</option><option value="custom">自定义题</option><option value="disabled">已停用</option></select>
        <div class="bank-actions">
          <button class="button primary" data-action="bankAdd" type="button"><i data-lucide="plus"></i>添加题目</button>
          <button class="button secondary" data-action="bankExport" type="button"><i data-lucide="download"></i>导出当前题库</button>
          <button class="button secondary" data-action="bankTemplate" type="button"><i data-lucide="file-spreadsheet"></i>下载Excel模板</button>
          <button class="button secondary" data-action="bankImport" type="button"><i data-lucide="upload"></i>导入JSON / Excel</button>
          <button class="icon-button" data-action="bankReset" type="button" aria-label="恢复当前题库" title="恢复当前题库"><i data-lucide="archive-restore"></i></button>
        </div>
      </div>
      <div id="bank-results"></div>
      <p class="bank-footnote"><i data-lucide="info"></i><span>“导出当前题库”会生成包含全部题目的JSON文件；再次导入时会作为独立题库安装，不会覆盖现有题库。当前“导入新题库”只接受JSON；Excel请按使用说明的一行一道题模板整理并转换后导入。</span></p>`;
    document.getElementById("bank-switch").addEventListener("change", (event) => switchQuestionBank(event.target.value));
    document.getElementById("bank-search").addEventListener("input", () => { bankPage = 0; renderBankResults(); });
    document.getElementById("bank-type").addEventListener("change", () => { bankPage = 0; renderBankResults(); });
    document.getElementById("bank-status").addEventListener("change", () => { bankPage = 0; renderBankResults(); });
    renderBankResults();
    icons();
  }

  function filteredBankQuestions() {
    const search = (document.getElementById("bank-search")?.value || "").trim().toLowerCase();
    const type = document.getElementById("bank-type")?.value || "all";
    const status = document.getElementById("bank-status")?.value || "all";
    const disabled = new Set(bankState.disabled);
    return allManagedQuestions().filter((question) => {
      const isCustom = isCustomQuestion(question.id);
      const isEdited = Boolean(bankState.overrides[question.id]);
      const isDisabled = disabled.has(question.id);
      const matchesStatus = status === "all" || (status === "active" && !isDisabled) || (status === "edited" && isEdited) || (status === "custom" && isCustom) || (status === "disabled" && isDisabled);
      const haystack = `${question.stem} ${question.options.join(" ")} ${question.explanation}`.toLowerCase();
      return (type === "all" || question.type === type) && matchesStatus && (!search || haystack.includes(search));
    });
  }

  function renderBankResults() {
    const container = document.getElementById("bank-results");
    if (!container) return;
    const pageSize = 30;
    const results = filteredBankQuestions();
    const pageCount = Math.max(1, Math.ceil(results.length / pageSize));
    bankPage = Math.min(Math.max(0, bankPage), pageCount - 1);
    const start = bankPage * pageSize;
    const disabled = new Set(bankState.disabled);
    if (!results.length) {
      container.innerHTML = '<div class="list-panel empty-state"><i data-lucide="search-x"></i><div>没有符合条件的题目</div></div>';
    } else {
      container.innerHTML = `<div class="bank-result-head"><span>找到${results.length}道题</span><span>第${bankPage + 1} / ${pageCount}页</span></div><div class="list-panel">${results.slice(start, start + pageSize).map((question, index) => {
        const isCustom = isCustomQuestion(question.id);
        const isEdited = Boolean(bankState.overrides[question.id]);
        const isDisabled = disabled.has(question.id);
        const answer = isSubjectiveQuestion(question) ? question.answer : question.correct.map((item) => optionLetters[item]).join("");
        return `<div class="bank-row ${isDisabled ? "disabled" : ""}"><span class="row-index">${start + index + 1}</span><div class="row-content"><strong>${escapeHtml(question.stem)}</strong><span>${question.type} · 难度${question.difficulty} · 答案${answer}${isCustom ? ' · <b>自定义</b>' : isEdited ? ' · <b>已编辑</b>' : ""}${isDisabled ? ' · <b>已停用</b>' : ""}</span></div><div class="bank-row-actions"><button class="icon-button" data-action="bankEdit" data-id="${question.id}" type="button" aria-label="编辑题目" title="编辑题目"><i data-lucide="pencil"></i></button><button class="icon-button" data-action="bankToggle" data-id="${question.id}" type="button" aria-label="${isDisabled ? "启用题目" : "停用题目"}" title="${isDisabled ? "启用题目" : "停用题目"}"><i data-lucide="${isDisabled ? "eye" : "eye-off"}"></i></button>${isCustom ? `<button class="icon-button danger-icon" data-action="bankDelete" data-id="${question.id}" type="button" aria-label="删除自定义题" title="删除自定义题"><i data-lucide="trash-2"></i></button>` : isEdited ? `<button class="icon-button" data-action="bankRestore" data-id="${question.id}" type="button" aria-label="恢复原题" title="恢复原题"><i data-lucide="rotate-ccw"></i></button>` : ""}</div></div>`;
      }).join("")}</div><div class="bank-pagination"><button class="button secondary" data-action="bankPrev" type="button" ${bankPage === 0 ? "disabled" : ""}><i data-lucide="chevron-left"></i>上一页</button><button class="button secondary" data-action="bankNext" type="button" ${bankPage >= pageCount - 1 ? "disabled" : ""}>下一页<i data-lucide="chevron-right"></i></button></div>`;
    }
    icons();
  }

  function openQuestionEditor(id = null) {
    editingQuestionId = id;
    const question = id ? allManagedQuestions().find((item) => item.id === id) : null;
    document.getElementById("question-dialog-title").textContent = question ? "编辑题目" : "添加题目";
    document.getElementById("question-dialog-subtitle").textContent = question ? (isCustomQuestion(id) ? "自定义题目" : `基础题编号${question.number}`) : `新增到“${currentBank.name}”`;
    questionForm.elements.type.value = question?.type || "单选题";
    questionForm.elements.difficulty.value = question?.difficulty || "中";
    questionForm.elements.stem.value = question?.stem || "";
    questionForm.elements.options.value = question?.options.join("\n") || "";
    questionForm.elements.correct.value = isSubjectiveQuestion(question) ? (question?.answer || "") : (question?.correct.map((index) => optionLetters[index]).join("") || "");
    questionForm.elements.explanation.value = question?.explanation || "";
    questionDialog.showModal();
    icons();
    setTimeout(() => questionForm.elements.stem.focus(), 0);
  }

  function saveQuestionEdit(event) {
    event.preventDefault();
    const type = questionForm.elements.type.value;
    const subjective = SUBJECTIVE_TYPES.includes(type);
    const options = questionForm.elements.options.value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
    const answerLetters = [...new Set(questionForm.elements.correct.value.toUpperCase().replace(/[^A-H]/g, ""))];
    const correct = subjective ? [] : answerLetters.map((letter) => optionLetters.indexOf(letter));
    const textAnswer = subjective ? questionForm.elements.correct.value.trim() : "";
    if (subjective ? !textAnswer : ((type !== "多选题" && correct.length !== 1) || correct.some((index) => index >= options.length))) return showToast(subjective ? "请填写参考答案" : "请检查正确答案字母与选项数量");
    try {
      const existing = editingQuestionId ? allManagedQuestions().find((item) => item.id === editingQuestionId) : null;
      const id = editingQuestionId || `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const question = normalizeQuestion({
        ...existing,
        type,
        difficulty: questionForm.elements.difficulty.value,
        stem: questionForm.elements.stem.value,
        options,
        correct,
        answer: textAnswer,
        explanation: questionForm.elements.explanation.value,
      }, id);
      if (baseQuestionMap.has(id)) {
        question.number = baseQuestionMap.get(id).number;
        question.sourceRow = baseQuestionMap.get(id).sourceRow;
        bankState.overrides[id] = question;
      } else {
        const index = bankState.custom.findIndex((item) => item.id === id);
        if (index >= 0) bankState.custom[index] = question;
        else bankState.custom.push(question);
      }
      if (!saveBankState()) return;
      questionDialog.close();
      showToast(editingQuestionId ? "题目修改已保存" : "题目已添加");
      editingQuestionId = null;
      bankPage = 0;
      renderBankManager();
    } catch (_error) {
      showToast("请完整填写题干、答案和解析；选择题还需填写1至8个选项");
    }
  }

  function toggleBankQuestion(id) {
    const disabled = new Set(bankState.disabled);
    const willDisable = !disabled.has(id);
    willDisable ? disabled.add(id) : disabled.delete(id);
    bankState.disabled = [...disabled];
    if (!saveBankState()) return;
    showToast(willDisable ? "题目已停用，不再参与刷题" : "题目已重新启用");
    renderBankManager();
  }

  function restoreBankQuestion(id) {
    if (!bankState.overrides[id] || !confirm("确定放弃这道题的本地修改并恢复原题吗？")) return;
    delete bankState.overrides[id];
    if (!saveBankState()) return;
    showToast("已恢复原题");
    renderBankManager();
  }

  function deleteCustomQuestion(id) {
    if (!isCustomQuestion(id) || !confirm("确定删除这道自定义题吗？相关答题记录会保留，但题目将不再显示。")) return;
    bankState.custom = bankState.custom.filter((question) => question.id !== id);
    bankState.disabled = bankState.disabled.filter((item) => item !== id);
    if (!saveBankState()) return;
    showToast("自定义题已删除");
    renderBankManager();
  }

  function resetQuestionBank() {
    const summary = bankSummary();
    if (!summary.edited && !summary.custom && !summary.disabled) return showToast("当前已经是原始题库");
    if (!confirm(`确定恢复原始题库吗？将清除${summary.edited}项编辑、${summary.custom}道自定义题和${summary.disabled}项停用记录。学习统计不会删除。`)) return;
    bankState = emptyBankState();
    if (!saveBankState()) return;
    showToast("题库已恢复为原始版本");
    renderBankManager();
  }

  function createBankId() {
    const random = globalThis.crypto?.randomUUID?.().replace(/-/g, "").slice(0, 12) || `${Date.now()}${Math.random().toString(36).slice(2, 8)}`;
    return `local-${random.toLowerCase()}`;
  }

  function normalizeImportedQuestions(source) {
    if (!Array.isArray(source) || source.length > 10000) throw new Error("invalid-question-list");
    return source.map((item, index) => {
      const rowLabel = item?.__importRow ? `第${item.__importRow}行：` : "";
      try {
        const typeAliases = { "单选": "单选题", "多选": "多选题", "判断": "判断题", "填空": "填空题", "简答": "简答题" };
        const type = typeAliases[String(item?.type || "").trim()] || String(item?.type || "").trim();
        if (!QUESTION_TYPES.includes(type)) throw new Error("题型只能填写单选题、多选题、判断题、填空题或简答题");
        const subjective = SUBJECTIVE_TYPES.includes(type);
        const options = Array.isArray(item?.options) ? item.options.map((option) => String(option || "").trim()).filter(Boolean) : [];
        const stem = String(item?.stem ?? item?.question ?? "").trim();
        if (!stem) throw new Error("题干不能为空");
        if (!subjective && (options.length < 1 || options.length > 8)) throw new Error("选择题选项数量必须在1至8个之间");
        let rawCorrect = item?.correct ?? item?.answer;
        const textAnswer = subjective ? String(item?.answer ?? item?.correct ?? "").trim() : "";
        if (subjective && !textAnswer) throw new Error("填空题和简答题必须填写文字答案");
        if (!subjective && typeof rawCorrect === "string") rawCorrect = [...new Set(rawCorrect.toUpperCase().replace(/[^A-H]/g, ""))].map((letter) => optionLetters.indexOf(letter));
        if (Array.isArray(rawCorrect)) rawCorrect = rawCorrect.map((value) => typeof value === "string" && /^[A-H]$/i.test(value) ? optionLetters.indexOf(value.toUpperCase()) : Number(value));
        if (!subjective && (!Array.isArray(rawCorrect) || !rawCorrect.length || rawCorrect.some((answer) => !Number.isInteger(answer) || answer < 0 || answer >= options.length))) throw new Error("正确答案与选项不匹配");
        if (!subjective && type !== "多选题" && rawCorrect.length !== 1) throw new Error("单选题和判断题只能填写一个正确答案");
        return {
          ...normalizeQuestion({
            ...item, type, difficulty: ["低", "中", "高"].includes(item?.difficulty) ? item.difficulty : "中", stem, options, correct: subjective ? [] : rawCorrect, answer: textAnswer,
            explanation: item?.explanation ?? item?.analysis,
          }, `q-${index + 1}`),
          disabled: item?.disabled === true || item?.enabled === false,
        };
      } catch (error) {
        throw new Error(`${rowLabel}${error.message || "题目格式不正确"}`);
      }
    });
  }

  function normalizedExcelHeader(value) {
    return String(value || "").trim().replace(/[\s_\-（）()：:]/g, "").toLowerCase();
  }

  function parseExcelQuestionRows(sheets) {
    const aliases = {
      number: ["题号", "序号", "编号"], type: ["题型", "题目类型"], difficulty: ["难度"], stem: ["题干", "题目", "问题"],
      correct: ["正确答案", "答案"], explanation: ["解析", "答案解析", "说明"],
    };
    const findColumn = (headers, names) => {
      const normalizedNames = names.map(normalizedExcelHeader);
      return headers.findIndex((header) => normalizedNames.includes(normalizedExcelHeader(header)));
    };
    const sheet = sheets.find((candidate) => candidate.rows.slice(0, 30).some((row) => findColumn(row, aliases.stem) >= 0 && findColumn(row, aliases.type) >= 0)) || sheets[0];
    const headerRowIndex = sheet.rows.findIndex((row, index) => index < 30 && findColumn(row, aliases.stem) >= 0 && findColumn(row, aliases.type) >= 0 && findColumn(row, aliases.correct) >= 0);
    if (headerRowIndex < 0) throw new Error("未找到标题行，请使用“刷刷题库导入模板.xlsx”填写题库");
    const headers = sheet.rows[headerRowIndex];
    const columns = Object.fromEntries(Object.entries(aliases).map(([key, names]) => [key, findColumn(headers, names)]));
    const optionColumns = optionLetters.split("").map((letter) => findColumn(headers, [`选项${letter}`]));
    if (columns.stem < 0 || columns.type < 0 || columns.correct < 0 || optionColumns.filter((column) => column >= 0).length < 2) throw new Error("模板必须包含题型、题干、选项A、选项B和正确答案列");
    const questions = [];
    sheet.rows.slice(headerRowIndex + 1).forEach((row, rowOffset) => {
      const values = row.map((value) => String(value || "").trim());
      if (!values.some(Boolean)) return;
      const type = values[columns.type] || "";
      const stem = values[columns.stem] || "";
      if (normalizedExcelHeader(type) === "题型" && normalizedExcelHeader(stem) === "题干") return;
      questions.push({
        __importRow: headerRowIndex + rowOffset + 2,
        number: columns.number >= 0 ? Number(values[columns.number]) || questions.length + 1 : questions.length + 1,
        type, difficulty: columns.difficulty >= 0 ? values[columns.difficulty] : "中", stem,
        options: optionColumns.map((column) => column >= 0 ? values[column] : "").filter(Boolean),
        correct: columns.correct >= 0 ? values[columns.correct] : "",
        explanation: columns.explanation >= 0 ? values[columns.explanation] : "",
      });
    });
    if (!questions.length) throw new Error("模板中没有可导入的题目，请至少填写一行题目");
    return { name: sheet.name || "导入题库", questions };
  }

  function installQuestionBank(name, source) {
    const id = createBankId();
    const normalized = normalizeImportedQuestions(source);
    const questionsForStorage = normalized.map(({ disabled: _disabled, ...question }) => question);
    const initialBankState = emptyBankState();
    initialBankState.disabled = normalized.filter((question) => question.disabled).map((question) => question.id);
    const meta = {
      id,
      name: String(name || "导入题库").trim().slice(0, 60) || "导入题库",
      kind: "local",
      createdAt: new Date().toISOString(),
      questionCount: normalized.length,
    };
    try {
      localStorage.setItem(bankSourceKey(id), JSON.stringify({ version: 1, questions: questionsForStorage }));
      localStorage.setItem(bankEditKey(id), JSON.stringify(initialBankState));
      localStorage.setItem(bankProgressKey(id), JSON.stringify(emptyState()));
      bankRegistry.banks.push(meta);
      if (!persistBankRegistry()) throw new Error("registry-save");
      switchQuestionBank(id);
      showToast(`题库“${meta.name}”已导入`);
    } catch (_error) {
      bankRegistry.banks = bankRegistry.banks.filter((bank) => bank.id !== id);
      localStorage.removeItem(bankSourceKey(id));
      localStorage.removeItem(bankEditKey(id));
      localStorage.removeItem(bankProgressKey(id));
      showToast("题库导入失败，可能是文件格式不正确或存储空间不足");
    }
  }

  function createQuestionBank() {
    bankDialogMode = "create";
    document.getElementById("bank-dialog-title").textContent = "新建空题库";
    document.getElementById("bank-dialog-subtitle").textContent = "创建后可手动添加题目或导入完整题库";
    bankForm.elements.name.value = "我的题库";
    bankDialog.showModal();
    icons();
    setTimeout(() => bankForm.elements.name.select(), 0);
  }

  function renameQuestionBank() {
    bankDialogMode = "rename";
    document.getElementById("bank-dialog-title").textContent = "重命名题库";
    document.getElementById("bank-dialog-subtitle").textContent = "只修改当前设备上显示的名称";
    bankForm.elements.name.value = currentBank.name;
    bankDialog.showModal();
    icons();
    setTimeout(() => bankForm.elements.name.select(), 0);
  }

  function saveBankName(event) {
    event.preventDefault();
    const name = bankForm.elements.name.value.trim().slice(0, 60);
    if (!name) return showToast("题库名称不能为空");
    bankDialog.close();
    if (bankDialogMode === "create") return installQuestionBank(name, []);
    const previousName = currentBank.name;
    currentBank.name = name;
    if (!persistBankRegistry()) {
      currentBank.name = previousName;
      return;
    }
    showToast("题库名称已更新");
    renderBankManager();
  }

  function removeQuestionBank() {
    if (currentBank.kind === "builtin") return showToast("内置题库不能删除");
    if (!confirm(`确定删除题库“${currentBank.name}”吗？该题库的题目、答题记录、收藏和笔记都会从本设备删除。`)) return;
    const removedId = currentBank.id;
    stopQuizTimers();
    const previousRegistry = bankRegistry;
    bankRegistry = {
      ...bankRegistry,
      activeBankId: DEFAULT_BANK_ID,
      banks: bankRegistry.banks.filter((bank) => bank.id !== removedId),
    };
    if (!persistBankRegistry()) {
      bankRegistry = previousRegistry;
      return;
    }
    localStorage.removeItem(bankSourceKey(removedId));
    localStorage.removeItem(bankEditKey(removedId));
    localStorage.removeItem(bankProgressKey(removedId));
    loadActiveBankData();
    bankPage = 0;
    showToast("题库已删除，现已切回内置题库");
    navigate("bank");
  }

  function exportQuestionBank() {
    const disabled = new Set(bankState.disabled);
    const exportedQuestions = allManagedQuestions().map((question) => ({ ...question, disabled: disabled.has(question.id) }));
    downloadJson({ backupType: "zongfu-question-bank", version: 2, name: currentBank.name, exportedAt: new Date().toISOString(), questions: exportedQuestions }, `${currentBank.name.replace(/[\\/:*?"<>|]/g, "_")}_${localDate()}.json`);
    showToast("当前题库已完整导出");
  }

  function downloadExcelTemplate() {
    const link = document.createElement("a");
    link.href = "assets/刷刷题库导入模板.xlsx";
    link.download = "刷刷题库导入模板.xlsx";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => link.remove(), 1000);
  }

  async function importQuestionBankFile(file) {
    if (!file) return;
    if (/\.xlsx$/i.test(file.name || "")) {
      try {
        if (!window.XlsxImport?.readWorkbook) throw new Error("Excel导入组件未加载，请刷新页面后重试");
        const workbook = await window.XlsxImport.readWorkbook(file);
        const parsed = parseExcelQuestionRows(workbook);
        const fallbackName = file.name.replace(/\.xlsx$/i, "") || parsed.name || "导入题库";
        installQuestionBank(fallbackName, parsed.questions);
      } catch (error) {
        showToast(`Excel导入失败：${error?.userMessage || error?.message || "请使用模板填写后重试"}`);
      }
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(reader.result);
        const questionList = Array.isArray(payload) ? payload : payload.questions || payload.bank?.questions;
        if (Array.isArray(questionList)) {
          const fallbackName = file.name.replace(/\.json$/i, "") || "导入题库";
          installQuestionBank(payload.name || payload.bank?.name || fallbackName, questionList);
          return;
        }
        const legacy = payload.backupType === "zongfu-question-bank" ? payload.bankState : payload.backupType === "zongfu-quiz" ? payload.bankState : null;
        if (!legacy) throw new Error("invalid-bank-file");
        if (currentBank.id !== LEGACY_ZONGFU_BANK_ID) switchQuestionBank(LEGACY_ZONGFU_BANK_ID);
        bankState = hydrateBankState(legacy, new Map(legacyZongfuQuestions.map((question) => [question.id, question])));
        if (!saveBankState()) return;
        showToast("旧版题库修改已恢复到内置题库");
        bankPage = 0;
        renderBankManager();
      } catch (_error) {
        showToast("无法识别这个题库文件");
      }
    };
    reader.readAsText(file, "utf8");
  }

  // ── 学习统计 · 按周回看 ──────────────────────────────────────────────────
  // 数据来源：各题库各自的 daily（zongfu-quiz-progress-v2:<id>），按日期并起来；当前题库用内存里的 state.daily（可能比存储新）。
  // 不显示任何时长：daily[].seconds 是墙上时钟、没有发呆上限，数字不可信（design-proposal 8.4）。
  const STATS_TAB_KEY = "shua-stats-tab";
  const WEEKDAY_LABELS = Object.freeze(["周一", "周二", "周三", "周四", "周五", "周六", "周日"]);
  let statsWeekOffset = 0;
  let statsTab = null; // 第一次进页面时从 localStorage 读；存储抛错时切换仍然在内存里生效。

  function loadStatsTab() {
    try {
      return localStorage.getItem(STATS_TAB_KEY) === "total" ? "total" : "week";
    } catch (_error) {
      return "week";
    }
  }

  function saveStatsTab(tab) {
    try {
      localStorage.setItem(STATS_TAB_KEY, tab);
    } catch (_error) {
      // 隐私模式写不进去：本次照常切换，下次打开回到默认的按周回看。
    }
  }

  // 自建题库没有短名：去掉【】及其中文字取前 4 个字；颜色按 id 的简单哈希落到 9 色里。
  function bankChipMeta(bank) {
    const definition = builtInBankMap.get(bank.id);
    if (definition) return { short: definition.short, ...BANK_CHIP_COLORS[definition.chip] };
    const name = String(bank.name || "");
    const short = Array.from(name.replace(/【[^】]*】/g, "").trim() || name).slice(0, 4).join("");
    let hash = 0;
    for (const char of String(bank.id)) hash = (hash * 31 + char.codePointAt(0)) >>> 0;
    return { short, ...BANK_CHIP_COLORS[hash % BANK_CHIP_COLORS.length] };
  }

  function dailyByBank() {
    return bankRegistry.banks.map((bank) => {
      let daily = null;
      if (bank.id === currentBank.id) daily = state.daily;
      else {
        try {
          daily = (JSON.parse(localStorage.getItem(bankProgressKey(bank.id))) || emptyState()).daily;
        } catch (_error) {
          daily = null;
        }
      }
      return { bank, daily: daily && typeof daily === "object" ? daily : {} };
    });
  }

  function weekOverview(offset) {
    const sources = dailyByBank();
    const todayKey = localDate();
    const now = new Date();
    // 周一为一周的第一天；用年月日构造日期，跨月、跨年、夏令时都不会错位。
    const dayAt = (shift) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - (now.getDay() + 6) % 7 - offset * 7 + shift);
    let earliest = "";
    sources.forEach(({ daily }) => Object.keys(daily).forEach((key) => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(key) && Number(daily[key]?.answered) > 0 && (!earliest || key < earliest)) earliest = key;
    }));
    const dayTotals = (key) => {
      const rows = sources.map(({ bank, daily }, order) => {
        const answered = Math.max(0, Number(daily[key]?.answered) || 0);
        return { bank, order, answered, correct: Math.min(answered, Math.max(0, Number(daily[key]?.correct) || 0)) };
      }).filter((row) => row.answered > 0).sort((a, b) => b.answered - a.answered || a.order - b.order);
      return { rows, answered: rows.reduce((sum, row) => sum + row.answered, 0), correct: rows.reduce((sum, row) => sum + row.correct, 0) };
    };
    const days = WEEKDAY_LABELS.map((label, index) => {
      const date = dayAt(index);
      const key = localDate(date);
      // 未来的日子一律留空、也不计入汇总（设备时钟被往回拨过时，存储里可能有「未来」的记录）。
      const future = key > todayKey;
      return { key, label, date: date.getDate(), today: key === todayKey, future, ...(future ? { rows: [], answered: 0, correct: 0 } : dayTotals(key)) };
    });
    const lastWeek = WEEKDAY_LABELS.reduce((sum, _label, index) => sum + dayTotals(localDate(dayAt(index - 7))).answered, 0);
    const answered = days.reduce((sum, day) => sum + day.answered, 0);
    const correct = days.reduce((sum, day) => sum + day.correct, 0);
    return {
      days,
      answered,
      lastWeek,
      activeDays: days.filter((day) => day.answered > 0).length,
      accuracy: answered ? Math.round(correct / answered * 100) : 0,
      range: `${days[0].key} ~ ${days[6].key}`,
      // 上一周整周都早于最早一条记录（或根本没有记录）时，左箭头置灰。
      canPrev: Boolean(earliest) && days[0].key > earliest,
      canNext: offset > 0,
    };
  }

  function renderWeekBoard() {
    const week = weekOverview(statsWeekOffset);
    const current = statsWeekOffset === 0;
    const chip = (row) => {
      const meta = bankChipMeta(row.bank);
      return `<span class="bank-chip" style="--chip-base:${meta.color}; --chip-l:${meta.text}; --chip-d:${meta.dtext}" title="${escapeHtml(row.bank.name)}"><span>${escapeHtml(meta.short)}</span><b>${row.answered}</b></span>`;
    };
    // 一天最多 4 行：题数最多的前 3 个题库，其余并成一块中性色「另 N 个题库 · M 题」。
    const chips = (rows) => {
      const shown = rows.length > 3 ? rows.slice(0, 3) : rows;
      const rest = rows.slice(shown.length);
      const more = rest.length ? `<span class="bank-chip is-more"><span>另 ${rest.length} 个题库 · ${rest.reduce((sum, row) => sum + row.answered, 0)} 题</span></span>` : "";
      return `<div class="bank-chips">${shown.map(chip).join("")}${more}</div>`;
    };
    const cellHead = (day) => `<span class="cell-day${day.today ? " is-today" : ""}">${day.label}<span class="cell-date">${day.date}</span></span>`;
    const dayCell = (day) => day.future
      ? `<div class="panel week-cell is-empty" data-date="${day.key}"><div class="cell-head">${cellHead(day)}</div></div>`
      : `<div class="panel week-cell" data-date="${day.key}"><div class="cell-head">${cellHead(day)}${day.answered ? `<span class="cell-total">${day.answered}<small>题</small></span>` : ""}</div>${day.answered ? chips(day.rows) : ""}</div>`;
    const diff = week.answered - week.lastWeek;
    const notes = [
      week.answered ? `${week.activeDays} 天有练习 · 正确率 ${week.accuracy}%` : current ? "本周还没有练习" : "这一周没有练习",
      week.lastWeek ? (diff > 0 ? `比上周多 ${diff} 题` : diff < 0 ? `比上周少 ${-diff} 题` : "和上周一样") : "",
    ].filter(Boolean);
    return `
      <section class="week-view" aria-label="按周回看">
        <div class="week-head">
          <button class="week-step" type="button" data-action="weekPrev" aria-label="上一周" ${week.canPrev ? "" : "disabled"}><i data-lucide="chevron-left"></i></button>
          <span class="week-range">${week.range}</span>
          <button class="week-step" type="button" data-action="weekNext" aria-label="下一周" ${week.canNext ? "" : "disabled"}><i data-lucide="chevron-right"></i></button>
        </div>
        <div class="week-board">
          <div class="panel week-cell week-sum">
            <span class="sum-label">${current ? "本周做题" : "这一周做题"}</span>
            <div class="sum-main"><strong>${week.answered}</strong><span>题</span></div>
            <p class="sum-note">${notes.join("<br>")}</p>
          </div>
          ${week.days.map(dayCell).join("")}
        </div>
      </section>`;
  }

  function renderStats() {
    if (!statsTab) statsTab = loadStatsTab();
    const tab = statsTab;
    const tabs = `<div class="seg-tabs" role="tablist" aria-label="统计视图">${[["week", "按周回看"], ["total", "累计统计"]].map(([value, label]) => `<button class="seg${tab === value ? " on" : ""}" type="button" role="tab" aria-selected="${tab === value}" data-action="statsTab" data-value="${value}">${label}</button>`).join("")}</div>`;
    if (tab === "week") {
      view.innerHTML = `
      <div class="page-header"><div>${pageTitle("学习统计")}<p>按周回看每天做了哪个题库、做了多少，所有题库合在一起算。</p></div></div>
      ${tabs}
      ${renderWeekBoard()}`;
      icons();
      return;
    }
    const stats = aggregate();
    const typeRows = QUESTION_TYPES.map((type) => {
      const ids = questions.filter((q) => q.type === type).map((q) => q.id);
      const records = ids.map((id) => state.records[id]).filter(Boolean);
      const attempts = records.reduce((sum, item) => sum + item.attempts, 0);
      const correct = records.reduce((sum, item) => sum + item.correctCount, 0);
      return { label: type, value: attempts ? Math.round(correct / attempts * 100) : 0 };
    });
    const sessionHistory = normalizeSessionHistory(state.sessions);
    const renderSessionItem = (item) => {
      const total = Math.max(0, Number(item.total) || 0);
      const correct = Math.max(0, Number(item.correct) || 0);
      const accuracy = total ? Math.round(correct / total * 100) : 0;
      return `<li><span><strong>${escapeHtml(item.title)}</strong><small>${formatSessionDate(item.date)} · ${total}题 · ${formatSeconds(item.duration)}</small></span><b>${correct}/${total} · ${accuracy}%</b></li>`;
    };
    const visibleSessions = sessionHistory.slice(0, 2);
    const extraSessions = sessionHistory.slice(2);
    view.innerHTML = `
      <div class="page-header"><div>${pageTitle("学习统计")}<p>${escapeHtml(currentBank.name)} · 各题库的统计相互独立，可通过数据管理完整备份。</p></div></div>
      ${tabs}
      <section class="metric-grid">${metric("layers", "已覆盖题目", stats.answered, `共${questions.length}道`)}${metric("target", "累计正确率", `${stats.accuracy}%`, `累计${stats.attempts}次作答`)}${metric("badge-check", "已掌握", stats.mastered, "由你确认掌握")}${metric("calendar-clock", "今日待复习", stats.due, "按记忆间隔生成")}</section>
      <section class="stat-grid">
        <div class="stat-panel"><h2>各题型正确率</h2>${typeRows.map((row) => `<div class="bar-row"><span>${row.label}</span><div class="bar-track"><span style="width:${row.value}%"></span></div><strong>${row.value}%</strong></div>`).join("")}</div>
      </section>
      ${sessionHistory.length ? `<section class="stat-panel session-history"><div class="session-history-head"><div><h2>练习历史</h2><p>最多保留最近${SESSION_HISTORY_LIMIT}次完成的练习。</p></div><span>${sessionHistory.length}条</span></div><ol>${visibleSessions.map(renderSessionItem).join("")}</ol>${extraSessions.length ? `<details><summary>展开查看其余${extraSessions.length}条</summary><ol>${extraSessions.map(renderSessionItem).join("")}</ol></details>` : ""}</section>` : `<section class="stat-panel session-history empty"><h2>练习历史</h2><p>完成一次专项练习或模拟考试后，记录会显示在这里。</p></section>`}`;
    icons();
  }

  // 3.11.1 起不再有 "file" 这一档：3D 打成经典脚本 bundle，直接双击网页文件（file://）也能显示。
  const FX_BLOCK_REASONS = Object.freeze({
    "reduced-motion": "系统开启了减弱动态效果",
    "save-data": "浏览器开启了省流量模式",
    "low-end": "设备性能较低",
    "slow": "运行帧率过低，本次已自动关闭",
    // 3.11.2 起只有软件渲染也能用精简版 3D，这一条只剩「连软件渲染的 WebGL2 都拿不到」；细分见 FX_NO_WEBGL_STAGES。
    "no-webgl": "浏览器不支持WebGL2",
    "load-failed": "3D组件未能加载（离线且从未加载过时属正常）",
    "offline": "离线且本机还没缓存过3D组件",
    "context-lost": "显卡上下文丢失",
    "error": "3D组件运行出错",
  });

  // no-webgl 按 effects.js 探测走到哪一段细分（status.stage）；stage 为空说明浏览器根本没有 WebGL2 接口，用上面的通用说法。
  const FX_NO_WEBGL_STAGES = Object.freeze({
    "none": "浏览器拿不到WebGL2（没有可用的显卡，浏览器也不提供软件渲染）",
    "webgl1-only": "浏览器只提供旧版WebGL1，3D需要WebGL2",
  });
  const FX_PROBE_LABELS = Object.freeze([["webgl2Strict", "WebGL2（显卡）"], ["webgl2Loose", "WebGL2（软件渲染）"], ["webgl1Loose", "WebGL1"]]);

  function fxStatusText(status) {
    if (!status) return "当前环境不支持。";
    if (status.preference === "off") return "已关闭：界面与未加3D时完全相同。";
    if (status.state === "active" && status.tier === "soft") return "这台机器没有独立显卡，3D用的是精简版，可能略慢；不想要可以关掉。";
    if (status.state === "active") return "已开启：首页题库牌堆、做题小牌堆和结算落堆使用3D纸卡。";
    if (status.state === "pending" || status.state === "loading") return "已开启：打开首页或开始做题时加载。";
    const why = (status.reason === "no-webgl" && FX_NO_WEBGL_STAGES[status.stage]) || FX_BLOCK_REASONS[status.reason] || "原因未知";
    return `本机不显示3D：${why}。界面自动使用平面版，功能不受影响。`;
  }

  // 探测过才有这一行：三段探测各拿没拿到、渲染器叫什么。出问题时截这一行就能定位。
  function fxProbeText(status) {
    if (!status?.stage || !status.probe) return "";
    const steps = FX_PROBE_LABELS.filter(([key]) => typeof status.probe[key] === "boolean").map(([key, label]) => `${label}${status.probe[key] ? "拿到" : "拿不到"}`);
    return `探测：${steps.join("，")}；渲染器：${status.renderer || "浏览器未提供"}。`;
  }

  function renderData() {
    const fxStatus = fx("status") || null;
    const fileProtocol = location.protocol === "file:";
    const localHost = ["localhost", "127.0.0.1", "::1"].includes(location.hostname);
    const lanBrowser = location.protocol === "http:" && !localHost;
    const mobileUsage = lanBrowser
      ? `当前通过局域网地址 <strong>${escapeHtml(location.origin)}</strong> 使用。鸿蒙、安卓和iPhone/iPad可直接用浏览器打开；请保持提供网页的电脑服务窗口开启。局域网HTTP模式不提供手机离线缓存。`
      : location.protocol === "https:"
        ? `当前是HTTPS网页地址 <strong>${escapeHtml(location.origin)}</strong>，鸿蒙、安卓和iPhone/iPad均可直接用浏览器访问，无需安装。学习记录分别保存在各设备浏览器中。`
        : `如需手机或平板直接访问，请在同一Wi-Fi下打开启动窗口显示的局域网地址。鸿蒙、安卓和iPhone/iPad均无需安装软件；电脑需保持服务窗口开启。`;
    const releases = Array.isArray(projectInfo.releaseHistory) && projectInfo.releaseHistory.length
      ? projectInfo.releaseHistory
      : [{ version: projectInfo.version, date: projectInfo.releaseDate, title: "本次更新", changes: projectInfo.changes || [] }];
    view.innerHTML = `
      <div class="page-header"><div>${pageTitle("数据管理")}<p>当前题库：${escapeHtml(currentBank.name)}。题库和学习记录只保存在你的设备上，不会上传。</p></div></div>
      <section class="panel">
        <div class="data-section data-backup"><h2>备份与恢复</h2><p class="backup-lead"><strong>换一台设备接着学？</strong>在这台点「导出备份」，把文件传到另一台，再在那台点「导入备份」——进度、错题、收藏、笔记都会合并进去，不会覆盖那台已有的记录。</p><div class="data-actions backup-primary"><button class="button primary" data-action="exportBackup" type="button"><i data-lucide="download"></i>导出备份</button><button class="button primary" data-action="importBackup" type="button"><i data-lucide="upload"></i>导入备份</button></div><p class="field-help">默认导出全部题库、全部内容；导入默认<strong>合并</strong>。学习记录只存在各设备自己的浏览器里，不会自动同步。</p><details class="backup-more"><summary>只备份部分内容（选题库、选内容）</summary><p>先选择要处理的题库，再选择这些题库要包含的内容。默认是全部题库、全部内容；导入时未勾选的本机数据会保留。</p><h3>第一步：选择题库</h3><div class="backup-parts backup-banks" id="backup-banks">${bankRegistry.banks.map((bank) => `<label><input type="checkbox" data-backup-bank="${escapeHtml(bank.id)}" checked>${escapeHtml(bank.name)}（${bank.questionCount}题）</label>`).join("")}</div><h3>第二步：选择内容</h3><div class="backup-parts" id="backup-parts"><label><input type="checkbox" data-backup-part="banks" checked>题库、题目修改与自建题库</label><label><input type="checkbox" data-backup-part="progress" checked>答题记录、统计与学习进度</label><label><input type="checkbox" data-backup-part="favorites" checked>收藏题目</label><label><input type="checkbox" data-backup-part="hard" checked>不会标记</label><label><input type="checkbox" data-backup-part="notes" checked>题目笔记</label></div><div class="data-actions"><button class="button secondary" data-action="exportSelectedBackup"><i data-lucide="download"></i>导出所选内容</button></div></details><details class="backup-more"><summary>导入时改为「覆盖」本机数据（危险操作）</summary><p>覆盖会用备份完整替换本机题库和学习数据，导入前仍会再次确认。</p><div class="backup-import-line"><label class="field-label" for="backup-import-mode">导入方式</label><select id="backup-import-mode"><option value="merge" selected>合并：保留本机进度（推荐）</option><option value="replace">覆盖：完全使用备份数据</option></select></div></details></div>
        <div class="data-section"><h2>连续刷题进度</h2><p>当前将从第${Math.min(Math.max(0, Number(state.brush.index) || 0), questions.length - 1) + 1}题继续，已累计完成${state.brush.completed}题。重置只影响连续刷题位置，不会删除错题、收藏或答题统计。</p><button class="button secondary" data-action="resetBrush"><i data-lucide="rotate-ccw"></i>从第1题重新开始</button></div>
        <div class="data-section"><h2>每日目标</h2><p>电脑端首页会按目标显示当天完成进度；手机端可在本页查看并修改每日目标。</p><div class="data-line"><div><label class="field-label" for="daily-goal">每天计划完成的题量</label><input class="number-input" id="daily-goal" type="number" min="1" max="1000" value="${state.preferences.dailyGoal}"></div><button class="button primary" data-action="saveGoal">保存目标</button></div></div>
        <div class="data-section"><h2>界面动效</h2><p>该设置只保存在本机浏览器，不随备份迁移。</p><div class="backup-parts"><label><input type="checkbox" id="fx-toggle" ${fxStatus?.preference === "on" ? "checked" : ""} ${fxStatus ? "" : "disabled"}>在首页、做题和结算页使用3D纸卡效果</label></div><p>${escapeHtml(fxStatusText(fxStatus))}</p>${fxProbeText(fxStatus) ? `<p>${escapeHtml(fxProbeText(fxStatus))}</p>` : ""}</div>
        <details class="data-section data-notes"><summary><i data-lucide="chevron-right"></i><h2>使用说明</h2><span>手机与平板浏览器 · 离线使用</span></summary><div class="data-note"><h3>手机与平板浏览器</h3><p>${mobileUsage}</p></div><div class="data-note"><h3>离线使用</h3><p>${fileProtocol ? "当前通过文件方式打开，核心刷题功能可用。通过“打开刷刷”运行后，还可以安装到桌面并使用离线缓存。" : "当前已通过本地服务运行。浏览器支持时，可从地址栏将本应用安装到桌面；安装后无需联网。"}</p></div></details>
        <div class="data-section project-info"><div class="project-title"><div><h2>项目与版本</h2><p>每次发布均记录版本号和变更内容，点击版本即可查看详情。</p></div><span class="version-badge">v${escapeHtml(projectInfo.version)}</span></div>${(projectInfo.changes || [])[0] ? `<p class="version-brief">本次更新：${escapeHtml(projectInfo.changes[0])}</p>` : ""}<details class="version-more"><summary>查看全部版本记录与项目信息</summary><dl class="project-meta"><div><dt>项目作者</dt><dd>${escapeHtml(projectInfo.author)}</dd></div><div><dt>发布日期</dt><dd>${escapeHtml(projectInfo.releaseDate)}</dd></div><div><dt>使用范围</dt><dd>${escapeHtml(projectInfo.classification)}</dd></div></dl><h3>本次更新</h3><ul class="change-list">${projectInfo.changes.map((change) => `<li>${escapeHtml(change)}</li>`).join("")}</ul><div class="release-history"><h3>版本更新记录</h3>${releases.map((release, index) => `<details class="release-item" ${index === 0 ? "open" : ""}><summary><span><strong>v${escapeHtml(release.version)}</strong><small>${escapeHtml(release.date)} · ${escapeHtml(release.title || "版本更新")}</small></span><i data-lucide="chevron-down"></i></summary><ul class="change-list">${(release.changes || []).map((change) => `<li>${escapeHtml(change)}</li>`).join("")}</ul></details>`).join("")}</div></details><p class="distribution-notice"><i data-lucide="shield-alert"></i><span>${escapeHtml(projectInfo.distributionNotice)}</span></p></div>
        <div class="data-section"><h2>清空当前题库记录</h2><p>此操作只会删除“${escapeHtml(currentBank.name)}”的答题记录和标记，不影响其他题库，题目本身也不会删除。</p><button class="button danger" data-action="resetProgress"><i data-lucide="trash-2"></i>清空当前题库记录</button></div>
      </section>`;
    icons();
    syncThemeControls();
    document.getElementById("fx-toggle")?.addEventListener("change", (event) => {
      fx("setEnabled", event.target.checked);
      renderData();
      document.getElementById("fx-toggle")?.focus();
    });
  }

  function toggleFlag(flag) {
    const session = state.activeSession;
    const resolved = resolveSessionQuestion(session);
    if (!resolved) return;
    const record = recordForState(resolved.context.state, resolved.question.id);
    record[flag] = !record[flag];
    if (flag === "hard" && record.hard) { record.mastered = false; record.nextReview = localDate(); }
    if (resolved.bankId !== currentBank.id) persistProgressFor(resolved.bankId, resolved.context.state);
    saveState();
    showToast(flag === "hard" ? (record.hard ? "已标记为不会，将优先复习" : "已取消不会标记") : (record.favorite ? "已收藏" : "已取消收藏"));
    renderQuiz();
  }

  function openNote() {
    const session = state.activeSession;
    if (!session) return;
    if (session.mode === "review" && session.autoPlaying) {
      session.autoPlaying = false;
      session.autoNextAt = null;
      clearTimeout(autoAdvanceHandle);
      saveState();
      renderQuiz();
    }
    const resolved = resolveSessionQuestion(session);
    if (!resolved) return;
    noteTarget = { bankId: resolved.bankId, questionId: resolved.question.id };
    noteText.value = recordForState(resolved.context.state, resolved.question.id).note || "";
    noteDialog.showModal();
    icons();
    setTimeout(() => noteText.focus(), 0);
  }

  function saveNote() {
    if (!noteTarget) return;
    const context = getBankContext(noteTarget.bankId);
    if (!context?.questionMap.has(noteTarget.questionId)) return showToast("这道题已不在当前题库中");
    recordForState(context.state, noteTarget.questionId).note = noteText.value.trim();
    if (noteTarget.bankId !== currentBank.id) persistProgressFor(noteTarget.bankId, context.state);
    saveState();
    showToast("笔记已保存");
    setTimeout(renderQuiz, 0);
  }

  function markMastered() {
    const session = state.activeSession;
    const resolved = resolveSessionQuestion(session);
    if (!resolved) return;
    const record = recordForState(resolved.context.state, resolved.question.id);
    record.mastered = true;
    record.hard = false;
    record.nextReview = addDays(30);
    if (resolved.bankId !== currentBank.id) persistProgressFor(resolved.bankId, resolved.context.state);
    saveState();
    showToast("已标记为掌握");
    renderQuiz();
  }

  function downloadJson(payload, filename) {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => { URL.revokeObjectURL(link.href); link.remove(); }, 1000);
  }

  function exportBackup() {
    if (!saveBankState()) return;
    const banks = bankRegistry.banks.map((meta) => {
      const source = meta.kind === "local" ? JSON.parse(localStorage.getItem(bankSourceKey(meta.id))) : null;
      const savedBankState = JSON.parse(localStorage.getItem(bankEditKey(meta.id))) || emptyBankState();
      const savedState = JSON.parse(localStorage.getItem(bankProgressKey(meta.id))) || emptyState();
      return { meta, source, bankState: savedBankState, state: savedState };
    });
    const payload = { backupType: "zongfu-quiz", version: 2, exportedAt: new Date().toISOString(), activeBankId: currentBank.id, banks };
    downloadJson(payload, `综服刷题完整备份_${localDate()}.json`);
    showToast("完整备份已导出");
  }

  const backupRecordFields = ["attempts", "correctCount", "wrongCount", "streak", "wrong", "mastered", "lastAnsweredAt", "nextReview"];

  function selectedBackupParts() {
    return new Set([...document.querySelectorAll("[data-backup-part]:checked")].map((input) => input.dataset.backupPart));
  }

  function selectedBackupBanks() {
    return new Set([...document.querySelectorAll("[data-backup-bank]:checked")].map((input) => input.dataset.backupBank));
  }

  function selectedProgressState(progressState, parts) {
    const source = hydrateState(progressState);
    const records = {};
    Object.entries(source.records || {}).forEach(([id, record]) => {
      const copy = {};
      if (parts.has("progress")) backupRecordFields.forEach((field) => { if (field in record) copy[field] = record[field]; });
      if (parts.has("favorites")) copy.favorite = Boolean(record.favorite);
      if (parts.has("hard")) copy.hard = Boolean(record.hard);
      if (parts.has("notes")) copy.note = String(record.note || "");
      if (Object.keys(copy).length) records[id] = copy;
    });
    return {
      version: 1,
      updatedAt: source.updatedAt,
      records,
      ...(parts.has("progress") ? { daily: source.daily, sessions: source.sessions, preferences: source.preferences, brush: source.brush, review: source.review, activeSession: source.activeSession } : {}),
    };
  }

  function exportSelectedBackup() {
    const parts = selectedBackupParts();
    if (!parts.size) return showToast("请至少选择一项备份内容");
    const selectedBanks = selectedBackupBanks();
    if (!selectedBanks.size) return showToast("请至少选择一个题库");
    if (parts.has("banks") && !saveBankState()) return;
    const banks = bankRegistry.banks.filter((meta) => selectedBanks.has(meta.id)).map((meta) => {
      const entry = { meta: { ...meta }, state: selectedProgressState(JSON.parse(localStorage.getItem(bankProgressKey(meta.id))) || emptyState(), parts) };
      if (parts.has("banks")) {
        entry.source = meta.kind === "local" ? JSON.parse(localStorage.getItem(bankSourceKey(meta.id))) : null;
        entry.bankState = JSON.parse(localStorage.getItem(bankEditKey(meta.id))) || emptyBankState();
      }
      return entry;
    });
    const payload = {
      backupType: "zongfu-quiz",
      version: 3,
      exportedAt: new Date().toISOString(),
      activeBankId: selectedBanks.has(currentBank.id) ? currentBank.id : banks[0].meta.id,
      parts: [...parts],
      bankIds: [...selectedBanks],
      ...(parts.has("banks") ? { registry: bankRegistry } : {}),
      banks,
    };
    downloadJson(payload, `综服刷题选择备份_${localDate()}.json`);
    showToast(`已导出所选内容：${[...parts].length}项`);
  }

  function applySelectiveProgress(localState, incomingState, parts, mode) {
    const local = hydrateState(localState);
    const incoming = hydrateState(incomingState);
    const records = { ...local.records };
    const ids = new Set([...Object.keys(local.records || {}), ...Object.keys(incoming.records || {})]);
    ids.forEach((id) => {
      const previous = recordViewForState(local, id);
      const next = recordViewForState(incoming, id);
      const merged = { ...previous };
      if (parts.has("progress")) {
        backupRecordFields.forEach((field) => {
          if (mode === "replace") merged[field] = next[field] ?? (typeof previous[field] === "boolean" ? false : field === "lastAnsweredAt" || field === "nextReview" ? null : 0);
          else if (["attempts", "correctCount", "wrongCount", "streak"].includes(field)) merged[field] = Math.max(Number(previous[field]) || 0, Number(next[field]) || 0);
          else if (field === "wrong" || field === "mastered") merged[field] = Boolean(previous[field] || next[field]);
          else if ((Date.parse(next[field] || 0) || 0) > (Date.parse(previous[field] || 0) || 0)) merged[field] = next[field];
        });
      }
      ["favorites", "hard"].forEach((part) => {
        if (!parts.has(part)) return;
        const field = part === "favorites" ? "favorite" : "hard";
        merged[field] = mode === "replace" ? Boolean(next[field]) : Boolean(previous[field] || next[field]);
      });
      if (parts.has("notes")) merged.note = mode === "replace" ? String(next.note || "") : (next.note || previous.note || "");
      records[id] = merged;
    });
    const merged = { ...local, records, updatedAt: new Date().toISOString() };
    if (parts.has("progress")) {
      merged.daily = mode === "replace" ? incoming.daily : mergeProgressStates({ ...emptyState(), records: {}, daily: local.daily, sessions: local.sessions, preferences: local.preferences, brush: local.brush, activeSession: local.activeSession }, { ...emptyState(), records: {}, daily: incoming.daily, sessions: incoming.sessions, preferences: incoming.preferences, brush: incoming.brush, activeSession: incoming.activeSession }).daily;
      merged.sessions = mode === "replace" ? normalizeSessionHistory(incoming.sessions) : normalizeSessionHistory([...local.sessions, ...incoming.sessions]);
      merged.preferences = mode === "replace" ? incoming.preferences : { ...local.preferences, ...incoming.preferences };
      merged.brush = mode === "replace" ? incoming.brush : ((Date.parse(incoming.brush?.lastAnsweredAt || 0) || 0) > (Date.parse(local.brush?.lastAnsweredAt || 0) || 0) ? incoming.brush : local.brush);
      // 自动看题位置照连续刷题的规则来：按时间取新的那一份（老备份里没有 review，取到的就是本机的）。
      merged.review = mode === "replace" ? incoming.review : ((Date.parse(incoming.review?.lastAt || 0) || 0) > (Date.parse(local.review?.lastAt || 0) || 0) ? incoming.review : local.review);
      merged.activeSession = mode === "replace" ? incoming.activeSession : (incoming.activeSession || local.activeSession);
    }
    return hydrateState(merged);
  }

  function importSelectiveBackup(payload, mode, parts, selectedBankIds) {
    const available = new Set(Array.isArray(payload.parts) ? payload.parts : []);
    const chosen = new Set([...parts].filter((part) => available.has(part)));
    if (!chosen.size) return showToast("所选内容不在此备份文件中");
    const allCurrentBanksSelected = selectedBankIds.size === bankRegistry.banks.length;
    const includedIds = new Set((payload.bankIds || payload.banks.map((entry) => entry.meta?.id)).filter((id) => allCurrentBanksSelected || selectedBankIds.has(id)));
    const entries = new Map((payload.banks || []).filter((entry) => includedIds.has(entry.meta?.id)).map((entry) => [entry.meta?.id, entry]));
    if (!entries.size) return showToast("所选题库不在此备份文件中");
    if (chosen.has("banks") && !payload.registry?.banks) return showToast("此备份不包含题库内容");
    // 覆盖确认放在所有分支之前：原来只写在「带题库」那一支里，只含学习进度的文件用覆盖导入会不问就替换本机记录。
    if (mode === "replace" && !confirm("确认覆盖导入所选题库的勾选内容？\n\n只会替换本次选择的题库和内容；未勾选的题库及内容会继续保留。")) return showToast("已取消覆盖导入，本机数据没有变化");
    if (chosen.has("banks")) {
      const candidateRegistry = hydrateBankRegistry({ ...payload.registry, banks: payload.registry.banks.filter((bank) => includedIds.has(bank.id)) });
      const existingIds = new Set(bankRegistry.banks.map((bank) => bank.id));
      candidateRegistry.banks.forEach((meta) => {
        const entry = entries.get(meta.id);
        if (!entry) return;
        const isNewLocalBank = meta.kind === "local" && !existingIds.has(meta.id);
        if ((mode === "replace" || isNewLocalBank) && meta.kind === "local" && entry.source) localStorage.setItem(bankSourceKey(meta.id), JSON.stringify({ version: 1, questions: normalizeStoredSource(entry.source) }));
        if ((mode === "replace" || isNewLocalBank) && entry.bankState) localStorage.setItem(bankEditKey(meta.id), JSON.stringify(entry.bankState));
        if (isNewLocalBank) bankRegistry.banks.push(meta);
      });
      if (!persistBankRegistry()) {
        throw new Error("registry-save");
      }
    }
    let updatedBanks = 0;
    bankRegistry.banks.forEach((bank) => {
      const entry = entries.get(bank.id);
      if (!entry?.state) return;
      const next = applySelectiveProgress(loadStateFor(bank), entry.state, chosen, mode);
      localStorage.setItem(bankProgressKey(bank.id), JSON.stringify(next));
      updatedBanks += 1;
    });
    bankContextCache.clear();
    loadActiveBankData();
    saveBankState();
    showToast(`已${mode === "replace" ? "覆盖" : "合并"}导入${updatedBanks}个题库的所选内容`);
    navigate("home");
  }

  function mergeLearningRecord(localRecord, incomingRecord) {
    const local = recordViewForState({ records: { item: localRecord } }, "item");
    const incoming = recordViewForState({ records: { item: incomingRecord } }, "item");
    const localTime = Date.parse(local.lastAnsweredAt || 0) || 0;
    const incomingTime = Date.parse(incoming.lastAnsweredAt || 0) || 0;
    const recent = incomingTime > localTime ? incoming : local;
    return {
      ...recent,
      attempts: Math.max(Number(local.attempts) || 0, Number(incoming.attempts) || 0),
      correctCount: Math.max(Number(local.correctCount) || 0, Number(incoming.correctCount) || 0),
      wrongCount: Math.max(Number(local.wrongCount) || 0, Number(incoming.wrongCount) || 0),
      streak: Math.max(Number(local.streak) || 0, Number(incoming.streak) || 0),
      wrong: Boolean(local.wrong || incoming.wrong),
      hard: Boolean(local.hard || incoming.hard),
      favorite: Boolean(local.favorite || incoming.favorite),
      note: recent.note || local.note || incoming.note || "",
    };
  }

  function mergeProgressStates(localState, incomingState) {
    const local = hydrateState(localState);
    const incoming = hydrateState(incomingState);
    const localUpdated = Date.parse(local.updatedAt || 0) || 0;
    const incomingUpdated = Date.parse(incoming.updatedAt || 0) || 0;
    const recent = incomingUpdated > localUpdated ? incoming : local;
    const records = {};
    new Set([...Object.keys(local.records || {}), ...Object.keys(incoming.records || {})]).forEach((id) => {
      records[id] = mergeLearningRecord(local.records[id], incoming.records[id]);
    });
    const daily = {};
    new Set([...Object.keys(local.daily || {}), ...Object.keys(incoming.daily || {})]).forEach((date) => {
      const left = local.daily[date] || {};
      const right = incoming.daily[date] || {};
      daily[date] = {
        answered: Math.max(Number(left.answered) || 0, Number(right.answered) || 0),
        correct: Math.max(Number(left.correct) || 0, Number(right.correct) || 0),
        seconds: Math.max(Number(left.seconds) || 0, Number(right.seconds) || 0),
      };
    });
    const sessions = normalizeSessionHistory([...(local.sessions || []), ...(incoming.sessions || [])]);
    return {
      ...recent,
      records,
      daily,
      sessions,
      preferences: { ...incoming.preferences, ...local.preferences },
      brush: Date.parse(incoming.brush?.lastAnsweredAt || 0) > Date.parse(local.brush?.lastAnsweredAt || 0) ? incoming.brush : local.brush,
      review: (Date.parse(incoming.review?.lastAt || 0) || 0) > (Date.parse(local.review?.lastAt || 0) || 0) ? incoming.review : local.review,
      activeSession: recent.activeSession || null,
      updatedAt: new Date().toISOString(),
    };
  }

  function mergeImportedProgress(validated) {
    const importedById = new Map(validated.map((entry) => [entry.meta.id, entry]));
    let mergedBanks = 0;
    bankRegistry.banks.forEach((bank) => {
      const incoming = importedById.get(bank.id);
      if (!incoming) return;
      const merged = mergeProgressStates(loadStateFor(bank), incoming.state);
      localStorage.setItem(bankProgressKey(bank.id), JSON.stringify(merged));
      mergedBanks += 1;
    });
    bankContextCache.clear();
    loadActiveBankData();
    showToast(mergedBanks ? `已融合${mergedBanks}个题库的学习进度` : "备份中没有可融合的同名题库");
    navigate("home");
  }

  function confirmReplaceBackup(payload, candidateRegistry) {
    const exportedAt = Date.parse(payload.exportedAt || 0);
    const date = exportedAt ? new Date(exportedAt).toLocaleString("zh-CN", { hour12: false }) : "未知时间";
    const incomingCount = candidateRegistry.banks.length;
    const currentCount = bankRegistry.banks.length;
    return confirm(`确认覆盖导入？\n\n备份时间：${date}\n备份题库：${incomingCount}个\n本机题库：${currentCount}个\n\n覆盖会替换本机的题库、答题记录、标记、笔记和未完成练习，不能撤销。\n\n如需保留本机数据，请取消后选择“合并”。`);
  }

  function importBackupFile(file, mode = "replace", selectedParts = new Set(["banks", "progress", "favorites", "hard", "notes"]), selectedBankIds = new Set(bankRegistry.banks.map((bank) => bank.id))) {
    if (!file) return;
    if (file.size > 12 * 1024 * 1024) return showToast("备份文件过大，请在电脑上精简题库后再导入");
    const reader = new FileReader();
    reader.onerror = () => showToast("备份文件读取失败，请重新选择JSON备份文件");
    reader.onload = () => {
      try {
        const payload = JSON.parse(reader.result);
        if (payload.backupType !== "zongfu-quiz") throw new Error("invalid");
        if (payload.version === 3 && Array.isArray(payload.banks)) return importSelectiveBackup(payload, mode, selectedParts, selectedBankIds);
        if (payload.version === 2 && Array.isArray(payload.banks)) {
          const candidateRegistry = hydrateBankRegistry({
            version: 2,
            activeBankId: payload.activeBankId,
            banks: payload.banks.map((entry) => entry.meta),
          });
          const entries = new Map(payload.banks.map((entry) => [entry.meta?.id, entry]));
          const validated = candidateRegistry.banks.map((meta) => {
            const entry = entries.get(meta.id) || (meta.kind === "builtin" ? { bankState: emptyBankState(), state: emptyState() } : null);
            if (!entry) throw new Error("missing-bank");
            const definition = builtInBankMap.get(meta.id);
            const sourceQuestions = definition ? definition.questions : normalizeStoredSource(entry.source);
            const sourceMap = new Map(sourceQuestions.map((question) => [question.id, question]));
            const nextBankState = hydrateBankState(entry.bankState || emptyBankState(), sourceMap);
            if (!entry.state || entry.state.version !== 1) throw new Error("invalid-progress");
            const nextState = hydrateState(entry.state);
            meta.questionCount = sourceQuestions.length + nextBankState.custom.length;
            return { meta, sourceQuestions, bankState: nextBankState, state: nextState };
          });
          if (mode === "merge") return mergeImportedProgress(validated);
          if (!confirmReplaceBackup(payload, candidateRegistry)) return showToast("已取消覆盖导入，本机数据没有变化");
          validated.forEach((entry) => {
            if (entry.meta.kind === "local") localStorage.setItem(bankSourceKey(entry.meta.id), JSON.stringify({ version: 1, questions: entry.sourceQuestions }));
            localStorage.setItem(bankEditKey(entry.meta.id), JSON.stringify(entry.bankState));
            localStorage.setItem(bankProgressKey(entry.meta.id), JSON.stringify(entry.state));
          });
          bankRegistry = candidateRegistry;
          bankRegistry.activeBankId = candidateRegistry.banks.some((bank) => bank.id === payload.activeBankId) ? payload.activeBankId : DEFAULT_BANK_ID;
          if (!persistBankRegistry()) throw new Error("registry-save");
          loadActiveBankData();
          saveBankState();
          showToast("全部题库和学习记录已恢复");
          navigate("home");
          return;
        }
        if (!payload.state || payload.state.version !== 1) throw new Error("invalid-legacy");
        const builtinMap = new Map(legacyZongfuQuestions.map((question) => [question.id, question]));
        const restoredBankState = payload.bankState ? hydrateBankState(payload.bankState, builtinMap) : emptyBankState();
        const restoredState = hydrateState(payload.state);
        if (mode === "merge") {
          const merged = mergeProgressStates(loadStateFor({ id: LEGACY_ZONGFU_BANK_ID }), restoredState);
          localStorage.setItem(bankProgressKey(LEGACY_ZONGFU_BANK_ID), JSON.stringify(merged));
          bankContextCache.clear();
          loadActiveBankData();
          showToast("旧版备份的学习进度已合并到内置题库");
          navigate("home");
          return;
        }
        if (!confirm(`确认覆盖导入旧版备份？\n\n这会替换“综合服务经理岗位准入资格考试”的学习记录和题库修改，不能撤销。`)) return showToast("已取消覆盖导入，本机数据没有变化");
        localStorage.setItem(bankEditKey(LEGACY_ZONGFU_BANK_ID), JSON.stringify(restoredBankState));
        localStorage.setItem(bankProgressKey(LEGACY_ZONGFU_BANK_ID), JSON.stringify(restoredState));
        bankRegistry.activeBankId = LEGACY_ZONGFU_BANK_ID;
        if (!persistBankRegistry()) throw new Error("registry-save");
        loadActiveBankData();
        saveBankState();
        showToast("旧版备份已恢复到内置题库");
        navigate("home");
      } catch (_error) {
        showToast("无法识别这个备份文件");
      }
    };
    reader.readAsText(file);
  }

  function resetProgress() {
    if (!confirm(`确定清空题库“${currentBank.name}”的全部答题记录、错题、不会标记、收藏和笔记吗？此操作无法撤销。`)) return;
    state = emptyState();
    saveState();
    showToast("学习记录已清空");
    navigate("home");
  }

  function resetBrush() {
    if (!confirm("确定把连续刷题位置重置到第1题吗？错题、收藏和统计不会删除。")) return;
    state.brush = emptyState().brush;
    if (state.activeSession?.mode === "brush") state.activeSession = null;
    saveState();
    showToast("连续刷题已从第1题重新开始");
    renderData();
  }

  document.addEventListener("click", (event) => {
    const nav = event.target.closest("[data-nav]");
    if (nav) return navigate(nav.dataset.nav);
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;
    if (action === "toggleMobileMore") { mobileMoreOpen = !mobileMoreOpen; renderNav(); return; }
    if (action === "setMode") { setMode(target.dataset.mode); return; }
    if (action === "setAccent") { setAccent(target.dataset.accent); return; }
    if (action === "startBrush") beginAnswerSession(questions.length, () => startBrush());
    if (action === "searchQuestions") renderQuestionSearchResults();
    if (action === "startAutoReview") startReviewSession(questions.map((question) => question.id), 15, "自动看题");
    if (action === "random20") { const ids = shuffle(questions).slice(0, 20).map((q) => q.id); beginAnswerSession(ids.length, () => startSession(ids, "practice", "随机练习")); }
    if (action === "startDue") { const due = dueQuestions(); const ids = (due.length ? due : shuffle(questions).slice(0, 20)).map((q) => q.id); beginAnswerSession(ids.length, () => startSession(ids, "practice", due.length ? "今日复习" : "随机练习")); }
    if (action === "resume") resumeStudy();
    if (action === "resumeBank") resumeStudy(target.dataset.bankId);
    if (action === "quickType") { const type = target.dataset.value; const ids = shuffle(questions.filter((q) => q.type === type)).slice(0, 20).map((q) => q.id); beginAnswerSession(ids.length, () => startSession(ids, "practice", `${type}练习`)); }
    if (action === "hardPractice") { const ids = shuffle(questions.filter((q) => state.records[q.id]?.hard && !state.records[q.id]?.mastered)).map((q) => q.id); beginAnswerSession(ids.length, () => startSession(ids, "practice", "不会题专项")); }
    if (action === "wrongPractice") { const ids = shuffle(questions.filter((q) => state.records[q.id]?.wrong && !state.records[q.id]?.mastered)).map((q) => q.id); beginAnswerSession(ids.length, () => startSession(ids, "practice", "错题专项")); }
    if (action === "exam") startDefaultMockExam();
    if (action === "selectOption") selectOption(Number(target.dataset.index));
    if (action === "submitAnswer") submitAnswer();
    if (action === "jumpByNumber") jumpToQuestionNumber();
    if (action === "next") nextQuestion();
    if (action === "previous") previousQuestion();
    if (action === "toggleAutoReview") toggleAutoReview();
    if (action === "finishReview") finishReview();
    if (action === "exitQuiz" && confirm("退出后会保留当前进度，可从首页继续。")) navigate("home");
    if (action === "toggleHard") toggleFlag("hard");
    if (action === "toggleFavorite") toggleFlag("favorite");
    if (action === "openNote") openNote();
    if (action === "markMastered") markMastered();
    if (action === "toggleAnswerMode") toggleAnswerMode();
    if (action === "reloadForUpdate") location.reload();
    if (action === "dismissUpdate") { const notice = document.getElementById("update-notice"); if (notice) notice.hidden = true; }
    if (action === "chooseAnswerMode") chooseAnswerMode(target.dataset.value);
    if (action === "dismissAnswerMode") { answerModePending = null; dismissAnswerModeDialog(); }
    if (action === "retrySummary") { const ids = shuffle(lastSummary.wrongIds); const extras = lastSummary.scope === "mixed" ? { scope: "mixed", bankIds: lastSummary.bankIds } : {}; beginAnswerSession(ids.length, () => startSession(ids, "practice", "本次错题重练", null, extras)); }
    if (action === "openQuestion") startSession([target.dataset.id], "practice", "单题练习");
    if (action === "practiceSearchQuestion") practiceSearchQuestion(target.dataset.bankId, target.dataset.id);
    if (action === "practiceComparisonQuestion") practiceSearchQuestion(target.dataset.bankId, target.dataset.id);
    if (action === "practiceLibrary") { if (target.dataset.value) libraryFilter = target.dataset.value; const ids = shuffle(filteredLibraryQuestions()).map((q) => q.id); beginAnswerSession(ids.length, () => startSession(ids, "practice", "标记题专项")); }
    if (action === "bankAdd") openQuestionEditor();
    if (action === "bankCreate") createQuestionBank();
    if (action === "bankRename") renameQuestionBank();
    if (action === "bankRemove") removeQuestionBank();
    if (action === "bankEdit") openQuestionEditor(target.dataset.id);
    if (action === "bankToggle") toggleBankQuestion(target.dataset.id);
    if (action === "bankRestore") restoreBankQuestion(target.dataset.id);
    if (action === "bankDelete") deleteCustomQuestion(target.dataset.id);
    if (action === "bankPrev") { bankPage -= 1; renderBankResults(); window.scrollTo({ top: 0, behavior: "smooth" }); }
    if (action === "bankNext") { bankPage += 1; renderBankResults(); window.scrollTo({ top: 0, behavior: "smooth" }); }
    if (action === "bankExport") exportQuestionBank();
    if (action === "bankTemplate") downloadExcelTemplate();
    if (action === "bankImport") bankFile.click();
    if (action === "bankReset") resetQuestionBank();
    if (action === "exportBackup") exportBackup();
    if (action === "exportSelectedBackup") exportSelectedBackup();
    if (action === "importBackup") backupFile.click();
    if (action === "saveGoal") { const value = Math.max(1, Math.min(1000, Number(document.getElementById("daily-goal").value) || 30)); state.preferences.dailyGoal = value; saveState(); showToast("每日目标已保存"); }
    if (action === "resetProgress") resetProgress();
    if (action === "resetBrush") resetBrush();
    if (action === "statsTab") { statsTab = target.dataset.value === "total" ? "total" : "week"; saveStatsTab(statsTab); renderStats(); }
    if (action === "weekPrev" && !target.disabled) { statsWeekOffset += 1; renderStats(); }
    if (action === "weekNext" && !target.disabled) { statsWeekOffset = Math.max(0, statsWeekOffset - 1); renderStats(); }
  });

  document.addEventListener("click", (event) => {
    const segment = event.target.closest("[data-segment-value]");
    if (!segment) return;
    const group = segment.closest("[data-segment]");
    group.querySelectorAll("button").forEach((button) => button.classList.toggle("active", button === segment));
    group.parentElement.querySelector(`input[name="${group.dataset.segment}"]`).value = segment.dataset.segmentValue;
    if (group.dataset.segment === "mode") updateReviewControls();
    if (group.dataset.segment === "scope") {
      updatePracticeScopeControls();
      updatePoolCount();
    }
  });

  /* ── 首页入口行的按压反馈（3.13.0）──────────────────────────────────────────
     只作用于首页「练习方式」里的 .mode-button（.quick-start 之内）。按下：朝触点方向轻微倾斜（按哪边哪边往下沉）
     并缩小一点，行背后的光斑从铺满这一行的淡椭圆向触点聚拢；松手：带一点过冲弹回，光斑淡出。
     全部用 WAAPI 只动 transform / opacity，不拦点击、不 preventDefault、不碰 touch-action：点击分发、
     「会顶掉半截练习」的确认、答题方式弹窗、页面滚动一概照旧。手指按下后开始滚动，浏览器发 pointercancel，当场快速复原（不过冲）。

     幅度：触屏 / 触控笔最大 3°、缩到 0.97；鼠标克制，最大 1°、缩到 0.985。
     行很宽（1440 下 1138、2552 下 2134），同一个角度在长行两端产生的位移 δ ≈ a²·sinθ / d（a 半宽、d 透视距离）
     随行宽平方增长：固定 1°、d = 800 时 1138 宽的行两端要晃 7px。所以左右倾角（rotateY）再按行宽压：
     两端因倾斜产生的位移不超过行高的 1/16（触屏）或 1/32（鼠标），即 sinθ ≤ 比例 × 行高 × d / a²；
     透视距离取行高的 12 倍，整套数字都跟行高走，--u 等比放大时角度不变。落到实处（鼠标）：1440 / 2040 的半宽行 1°、
     通栏行约 0.3°，2552 半宽行约 0.7°、通栏约 0.2°；手机 390 / 417 触屏 3°。上下倾角（rotateX）只动行高那一截，
     两端位移不到 1px，不再压，直接用上限。
     缩放按上面的数整行等比缩，不按行宽压：等比缩放两端对称，看着是「按进去」，不是晃。

     光斑不放在行里，而是每个分组列表（.list-panel）一个、垫在所有行底下（见 styles.css 的 .mode-glow）：
     放在行里就得在行上裁切，一来光斑在行的上下边被切成平边，二来行按下时带透视变换、里面又有一个在动的层，
     裁切会让整行先画进一张中间纹理再投影，手机 3.5 倍屏上字明显发虚。垫在面板里只被面板的圆角裁，轮廓自然，也不压到任何一行的字。

     键盘（焦点在行上按空格或回车）按「中心按下」：不倾斜，只按鼠标那档缩小、光斑落在这一行的中心；松开键复原。
     原生 button 的点击时机（回车在 keydown、空格在 keyup）不动，这里既不调 click() 也不拦默认行为。
     减弱动态效果：不倾斜、不缩放，光斑直接落在触点，只做淡入淡出。 */
  const PRESS_SELECTOR = ".quick-start .mode-button";
  const PRESS_PROFILES = {
    touch: { maxDeg: 3, scale: 0.97, edgeRatio: 1 / 16 },
    mouse: { maxDeg: 1, scale: 0.985, edgeRatio: 1 / 32 },
  };
  const PRESS_PERSPECTIVE_PER_HEIGHT = 12;
  const PRESS_REST = { rx: 0, ry: 0, s: 1 };
  const PRESS_IN = { duration: 150, easing: "cubic-bezier(.2, .8, .2, 1)" };
  const GLOW_IN = { duration: 260, easing: "cubic-bezier(.2, .8, .2, 1)" };
  const PRESS_OUT = { duration: 420, easing: "cubic-bezier(.34, 1.56, .64, 1)" };
  const PRESS_CANCEL = { duration: 160, easing: "cubic-bezier(.2, .8, .2, 1)" };
  const GLOW_OUT = { duration: 320, easing: "cubic-bezier(.2, .8, .2, 1)" };
  const GLOW_FADE = { duration: 140, easing: "linear" };
  const tiltTracks = new WeakMap(); // 行 → { track, depth, pressed }
  const glowTracks = new WeakMap(); // 光斑 → { track, width }
  let pointerPress = null; // { row, pointerId }
  let keyPress = null; // row

  const clampPress = (value, min, max) => Math.min(max, Math.max(min, value));
  // 写进 transform 字符串前统一取 4 位小数：极小的数不会被拼成 1e-7 这种指数写法。
  const pressNum = (value) => Number(value.toFixed(4));
  const tiltTransform = (depth, tilt) => `perspective(${pressNum(depth)}px) rotateX(${pressNum(tilt.rx)}deg) rotateY(${pressNum(tilt.ry)}deg) scale(${pressNum(tilt.s)})`;
  const glowTransform = (glow, width) => `translate(${pressNum(glow.x - width / 2)}px, ${pressNum(glow.y)}px) scale(${pressNum(glow.sx)}, ${pressNum(glow.sy)})`;

  // 某条轨道此刻的值：按动画的缓动后进度在起止之间插值，被打断时从这里接着走，不跳。
  function pressTrackNow(track) {
    if (!track?.animation) return null;
    const progress = track.animation.effect?.getComputedTiming?.().progress;
    const p = typeof progress === "number" ? progress : track.animation.playState === "finished" ? 1 : 0;
    const now = {};
    Object.keys(track.to).forEach((key) => { now[key] = track.from[key] + (track.to[key] - track.from[key]) * p; });
    return now;
  }

  function stopPressTrack(track) {
    if (!track?.animation) return;
    track.animation.onfinish = null;
    track.animation.cancel();
    track.animation = null;
  }

  function runPressTrack(element, track, keyframes, timing, { settle = false } = {}) {
    track.animation = element.animate(keyframes, { ...timing, fill: "forwards" });
    // 松手那一段播完就撤掉动画：行回到 transform: none、光斑回到样式表的 opacity 0，不留合成层。
    if (settle) track.animation.onfinish = () => { stopPressTrack(track); track.done?.(); };
    return track;
  }

  function pressGlow(glow, panel, row, point, reduce) {
    const state = glowTracks.get(glow) || { track: null, width: 0 };
    glowTracks.set(glow, state);
    const from = pressTrackNow(state.track);
    stopPressTrack(state.track);
    glow.style.transform = "";
    const panelRect = panel.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    const width = panel.clientWidth;
    const left = panelRect.left + panel.clientLeft;
    const top = panelRect.top + panel.clientTop;
    const to = {
      x: clampPress(point.x - left, 0, width),
      y: clampPress(point.y - top, rowRect.top - top, rowRect.bottom - top),
      sx: Math.min(1, glow.offsetHeight / Math.max(width, 1)),
      sy: 1,
      o: 1,
    };
    state.width = width;
    if (reduce) {
      glow.style.transform = glowTransform(to, width);
      const o = from?.o || 0;
      state.track = runPressTrack(glow, { from: { o }, to: { o: 1 } }, [{ opacity: o }, { opacity: 1 }], GLOW_FADE);
      return;
    }
    // 上一次的光斑还没淡完就接着它聚拢；它若是减弱动态效果那种只有透明度的轨道，就从铺满这一行的淡椭圆重来。
    const spread = { x: width / 2, y: rowRect.top - top + rowRect.height / 2, sx: 0.9, sy: 1.1, o: 0.35 };
    const start = from && "x" in from && from.o > 0.01 ? from : spread;
    state.track = runPressTrack(glow, { from: start, to }, [{ transform: glowTransform(start, width), opacity: start.o }, { transform: glowTransform(to, width), opacity: 1 }], GLOW_IN);
  }

  function releaseGlow(glow, cancelled) {
    const state = glow && glowTracks.get(glow);
    const from = pressTrackNow(state?.track);
    if (!from) return;
    stopPressTrack(state.track);
    const clear = () => { glow.style.transform = ""; };
    if (!("x" in from)) {
      // 减弱动态效果：只淡出。
      state.track = runPressTrack(glow, { from, to: { o: 0 }, done: clear }, [{ opacity: from.o }, { opacity: 0 }], GLOW_FADE, { settle: true });
      return;
    }
    const to = { ...from, sx: from.sx * 1.6, sy: from.sy * 1.3, o: 0 };
    state.track = runPressTrack(glow, { from, to }, [{ transform: glowTransform(from, state.width), opacity: from.o }, { transform: glowTransform(to, state.width), opacity: 0 }], cancelled ? PRESS_CANCEL : GLOW_OUT, { settle: true });
  }

  function pressRow(row, { clientX, clientY, profile, center }) {
    if (typeof row.animate !== "function") return;
    const state = tiltTracks.get(row) || { track: null, depth: 0, pressed: false };
    tiltTracks.set(row, state);
    const tiltFrom = pressTrackNow(state.track) || PRESS_REST;
    stopPressTrack(state.track);
    state.track = null;
    state.pressed = true;
    // 动画撤掉之后再量，量到的是未变换的盒子。
    const rect = row.getBoundingClientRect();
    const half = { x: rect.width / 2, y: rect.height / 2 };
    const point = center ? { x: rect.left + half.x, y: rect.top + half.y } : { x: clientX, y: clientY };
    const reduce = prefersReducedMotion();
    const panel = row.closest(".list-panel");
    const glow = panel?.querySelector(":scope > .mode-glow");
    if (glow) pressGlow(glow, panel, row, point, reduce);
    if (reduce) return;
    state.depth = rect.height * PRESS_PERSPECTIVE_PER_HEIGHT;
    const sinY = profile.edgeRatio * rect.height * state.depth / Math.max(half.x * half.x, 1);
    const maxY = Math.min(profile.maxDeg, Math.asin(Math.min(1, sinY)) * 180 / Math.PI);
    const tiltTo = {
      rx: -profile.maxDeg * clampPress((point.y - rect.top - half.y) / Math.max(half.y, 1), -1, 1),
      ry: maxY * clampPress((point.x - rect.left - half.x) / Math.max(half.x, 1), -1, 1),
      s: profile.scale,
    };
    state.track = runPressTrack(row, { from: tiltFrom, to: tiltTo }, [{ transform: tiltTransform(state.depth, tiltFrom) }, { transform: tiltTransform(state.depth, tiltTo) }], PRESS_IN);
  }

  function releaseRow(row, { cancelled = false } = {}) {
    const state = row && tiltTracks.get(row);
    if (!state?.pressed) return;
    state.pressed = false;
    const tiltFrom = pressTrackNow(state.track);
    stopPressTrack(state.track);
    state.track = null;
    // 行已经被点击后的重渲染换掉了：动画随元素一起丢掉即可。
    if (!row.isConnected || typeof row.animate !== "function") return;
    releaseGlow(row.closest(".list-panel")?.querySelector(":scope > .mode-glow"), cancelled);
    if (!tiltFrom) return;
    state.track = runPressTrack(row, { from: tiltFrom, to: PRESS_REST }, [{ transform: tiltTransform(state.depth, tiltFrom) }, { transform: tiltTransform(state.depth, PRESS_REST) }], cancelled ? PRESS_CANCEL : PRESS_OUT, { settle: true });
  }

  function releasePointerPress(event, cancelled = false) {
    if (!pointerPress || (event && event.pointerId !== pointerPress.pointerId)) return;
    const { row } = pointerPress;
    pointerPress = null;
    row.removeEventListener("pointerleave", onPressPointerLeave);
    releaseRow(row, { cancelled });
  }
  function onPressPointerLeave(event) { releasePointerPress(event); }

  document.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    const row = event.target?.closest?.(PRESS_SELECTOR);
    if (!row) return;
    if (pointerPress) releasePointerPress();
    pointerPress = { row, pointerId: event.pointerId };
    row.addEventListener("pointerleave", onPressPointerLeave);
    pressRow(row, { clientX: event.clientX, clientY: event.clientY, profile: event.pointerType === "mouse" ? PRESS_PROFILES.mouse : PRESS_PROFILES.touch, center: false });
  }, { passive: true });
  document.addEventListener("pointerup", (event) => releasePointerPress(event), { capture: true, passive: true });
  document.addEventListener("pointercancel", (event) => releasePointerPress(event, true), { capture: true, passive: true });
  document.addEventListener("lostpointercapture", (event) => releasePointerPress(event), { capture: true, passive: true });

  const isPressKey = (event) => event.key === " " || event.key === "Spacebar" || event.key === "Enter";
  const releaseKeyPress = () => {
    if (!keyPress) return;
    const row = keyPress;
    keyPress = null;
    releaseRow(row);
  };
  document.addEventListener("keydown", (event) => {
    if (event.isComposing || event.keyCode === 229) return;
    if (event.repeat || event.altKey || event.ctrlKey || event.metaKey || !isPressKey(event)) return;
    const row = event.target?.closest?.(PRESS_SELECTOR);
    if (!row) return;
    if (keyPress !== row) releaseKeyPress();
    keyPress = row;
    pressRow(row, { profile: PRESS_PROFILES.mouse, center: true });
  });
  document.addEventListener("keyup", (event) => { if (isPressKey(event)) releaseKeyPress(); });
  document.addEventListener("focusout", (event) => { if (keyPress && event.target === keyPress) releaseKeyPress(); });
  window.addEventListener("blur", () => {
    releasePointerPress(null, true);
    releaseKeyPress();
  });

  document.addEventListener("visibilitychange", () => {
    const session = state.activeSession;
    if (!session) return;
    if (document.hidden) {
      if (session.mode === "review") {
        clearTimeout(autoAdvanceHandle);
        autoAdvanceHandle = null;
        session.autoNextAt = null;
      }
      saveState();
    } else if (session.mode === "review" && currentPage === "quiz") {
      renderQuiz();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (currentPage !== "quiz" || !state.activeSession || event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || target?.isContentEditable) return;
    // 焦点落在外观控件里时，←/→ 属于那个控件（切模式或强调色并把焦点带过去），不用来翻题。
    if (target?.closest?.(".theme-switch") || target?.closest?.(".accent-switch")) return;
    if (["ArrowLeft", "ArrowUp"].includes(event.key)) {
      event.preventDefault();
      previousQuestion();
    }
    if (["ArrowRight", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
      nextQuestion();
    }
    // 背题快刷判分后，空格也能翻到下一题。焦点落在按钮或链接上时交给按钮自己处理，
    // 否则焦点在「下一题」上按一次空格会既触发按钮又触发这里，一下翻两题。
    if (event.key === " " || event.key === "Spacebar") {
      if (target instanceof HTMLButtonElement || target instanceof HTMLAnchorElement) return;
      const session = state.activeSession;
      if (!fastAnswerActive(session)) return;
      if (!Object.prototype.hasOwnProperty.call(session.graded, session.ids[session.index])) return;
      event.preventDefault();
      nextQuestion();
    }
  });

  // 外观控件的键盘操作，只在控件内部生效：←/→ 在本组内循环并把焦点带过去，Home/End 跳首尾；
  // 明暗那组是 radiogroup，↑/↓ 同样能换。两组分别是浅/深/自动分段控件和六个强调色圆点；Enter/Space 由 <button> 自己处理。
  document.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    const modeTarget = event.target?.closest?.(".theme-switch [data-mode]");
    const accentTarget = event.target?.closest?.(".accent-switch [data-accent]");
    const group = modeTarget
      ? { button: modeTarget, list: modeList(), value: modeTarget.dataset.mode, apply: setMode, root: ".theme-switch", attribute: "data-mode" }
      : accentTarget
        ? { button: accentTarget, list: accentList(), value: accentTarget.dataset.accent, apply: setAccent, root: ".accent-switch", attribute: "data-accent" }
        : null;
    if (!group) return;
    // ↑/↓ 只归明暗那个 radiogroup（APG 单选组的约定）；色点是普通按钮组，上下键留给页面滚动。
    if ((event.key === "ArrowUp" || event.key === "ArrowDown") && !modeTarget) return;
    const index = group.list.indexOf(group.value);
    if (index < 0) return;
    event.preventDefault();
    const next = event.key === "Home"
      ? 0
      : event.key === "End"
        ? group.list.length - 1
        : (index + (event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1) + group.list.length) % group.list.length;
    group.apply(group.list[next]);
    group.button.closest(group.root)?.querySelector(`[${group.attribute}="${group.list[next]}"]`)?.focus();
  });

  window.addEventListener("pagehide", () => {
    if (state.activeSession?.ids?.length) saveState();
  });

  document.getElementById("save-note").addEventListener("click", saveNote);
  backupFile.addEventListener("change", () => {
    const mode = document.getElementById("backup-import-mode")?.value === "replace" ? "replace" : "merge";
    importBackupFile(backupFile.files[0], mode, selectedBackupParts(), selectedBackupBanks());
    backupFile.value = "";
  });
  bankFile.addEventListener("change", () => { importQuestionBankFile(bankFile.files[0]); bankFile.value = ""; });
  questionForm.addEventListener("submit", saveQuestionEdit);
  bankForm.addEventListener("submit", saveBankName);
  document.getElementById("close-question-dialog").addEventListener("click", () => questionDialog.close());
  document.getElementById("cancel-question-edit").addEventListener("click", () => questionDialog.close());
  document.getElementById("close-bank-dialog").addEventListener("click", () => bankDialog.close());
  document.getElementById("cancel-bank-edit").addEventListener("click", () => bankDialog.close());
  // 模式选择弹窗：Esc、点遮罩和右上角的关闭都算取消——丢掉待开始的会话，不写偏好。
  answerModeDialog?.addEventListener("cancel", () => { answerModePending = null; });
  answerModeDialog?.addEventListener("close", () => { answerModePending = null; });
  answerModeDialog?.addEventListener("click", (event) => {
    if (event.target !== answerModeDialog) return;
    answerModePending = null;
    dismissAnswerModeDialog();
  });

  if ("serviceWorker" in navigator && window.isSecureContext && location.protocol !== "file:") {
    // 升级路径：旧 Service Worker 先把旧版页面从缓存里服出来，新 sw.js 在后台装好后 skipWaiting + clients.claim 接管，
    // 可已经打开的这份页面还是旧版，得再刷新一次才换。这里在新 SW 接管这一刻提示「刷新一次」；
    // 只在页面本来就有 SW 接管时提示（首次安装 controller 为空，不算更新）。
    const hadController = Boolean(navigator.serviceWorker.controller);
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!hadController) return;
      const notice = document.getElementById("update-notice");
      if (notice) notice.hidden = false;
    });
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
  try {
    currentBank.questionCount = allManagedQuestions().length;
    localStorage.setItem(BANK_REGISTRY_KEY, JSON.stringify(bankRegistry));
    if (!localStorage.getItem(bankEditKey(currentBank.id))) localStorage.setItem(bankEditKey(currentBank.id), JSON.stringify(bankState));
    if (!localStorage.getItem(bankProgressKey(currentBank.id))) localStorage.setItem(bankProgressKey(currentBank.id), JSON.stringify(state));
  } catch (_error) {
    showToast("本地存储空间不足，请先导出备份");
  }
  /* ── 品牌图标的回落链 ───────────────────────────────────────────────────────
     渐变方块里显示的是文件 assets/brand/brand-icon.svg，屋主换手绘 logo 直接覆盖它即可。
     两处品牌图标（电脑侧栏那枚、≤600px 每页大标题前那枚，见 pageTitle()）共用这一个函数，不写第二遍。
     链条：svg 加载失败 → 换同目录的 brand-icon.png → 再失败 → 显示内联的那份「叠卡 + 勾」并隐藏 img。
     png 是可选的，磁盘上没有时服务器正常回 404，控制台恰好留一条，不影响任何功能。
     error 事件不冒泡，所以在 document 的捕获阶段统一接：页头那枚每次渲染都是新建的，逐个挂监听会漏。
     注意 img 可能在这段脚本跑到之前就已经失败了（错误事件早就过去），所以除了接 error，
     还要看一眼 complete && naturalWidth === 0 这个「已经失败」的状态。 */
  function setUpBrandIcon() {
    const fallBack = (image) => {
      const inline = image.closest(".brand-mark")?.querySelector(".brand-icon-inline");
      if (!image.getAttribute("src").endsWith(BRAND_ICON_PNG)) {
        image.setAttribute("src", BRAND_ICON_PNG);
        if (brandIconSrc === BRAND_ICON_SVG) brandIconSrc = BRAND_ICON_PNG;
        return;
      }
      brandIconSrc = "";
      // 注意：内联的是 <svg>，SVGElement 没有 HTMLElement 的 hidden 属性，
      // 写 inline.hidden = false 只会加一个 JS 字段，元素还是隐藏的。必须动属性。
      image.setAttribute("hidden", "");
      inline?.removeAttribute("hidden");
    };
    document.addEventListener("error", (event) => {
      const image = event.target;
      if (image instanceof HTMLImageElement && image.classList.contains("brand-icon-file")) fallBack(image);
    }, true);
    document.querySelectorAll(".brand-icon-file").forEach((image) => {
      if (image.complete && image.naturalWidth === 0) fallBack(image);
    });
  }

  const projectStamp = document.getElementById("project-stamp");
  if (projectStamp) projectStamp.textContent = `v${projectInfo.version} · ${projectInfo.author}`;
  setUpBrandIcon();
  renderNav();
  navigate("home");
})();
