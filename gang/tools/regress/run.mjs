#!/usr/bin/env node
/* 岗岗「3D 案头手册」A/B 回归与闸门测试套件。
   零依赖：Node v24 自带 WebSocket + fetch（只连本机 CDP 端口），Chrome headless 用 file:// 打开两份站点，
   逐节点、逐关键词比对 DOM，并检查各降级条件下 vendor/ 运行库一个字节都不加载。
   用法见同目录 README.md。 */
import { spawn, spawnSync } from "node:child_process";
import { rmSync, mkdirSync, writeFileSync, existsSync, readFileSync, cpSync, readdirSync, statSync, openSync, closeSync, renameSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import os from "node:os";

const HERE = path.dirname(new URL(import.meta.url).pathname);
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9241;
/* 被测目录默认就是本套件所在的仓库根（tools/regress 的上两级），任何克隆里都对。 */
const REPO_ROOT = path.resolve(HERE, "../..");
const DEFAULT_TARGET = REPO_ROOT;
/* 工作目录：Chrome profile、被测快照、结果 JSON、--dump 的捕获、解出来的基线全放这儿。
   一律在仓库之外——手册是内部资料，明细 JSON 与快照里带着正文和截图路径，绝不能落进仓库。
   优先取环境变量 GANG_REGRESS_WORK，其次系统临时目录；--work <dir> 可覆盖。 */
const DEFAULT_WORK = process.env.GANG_REGRESS_WORK || path.join(os.tmpdir(), "gang-regress");
let WORK = DEFAULT_WORK;
const workPath = (...parts) => path.join(WORK, ...parts);
const ensureWork = () => { mkdirSync(WORK, { recursive: true }); return WORK; };
const KEYWORDS = ["开户", "结算卡", "挂失", "8201200", "对公", "销户", "密码", "代理", "身份证", "xyzabc"];
const ALL_MODES = ["default", "force", "reduced", "narrow", "off", "off-ls"];
const VENDOR_FILES = ["vendor/three.min.js", "vendor/gsap.min.js"];
const FIELDS = ["title", "hash", "headBiz", "rail", "toc", "reader", "pageAside", "asideHost", "manualShell", "bodyHTML", "bodyText"];
const SEARCH_FIELDS = ["title", "hash", "headBiz", "rail", "manualShell", "bodyHTML", "bodyText"];
const FIELD_LABEL = {
  title: "document.title", hash: "location.hash", headBiz: "#head-biz 文本", rail: "#stage-rail-host innerHTML",
  toc: ".toc innerHTML", reader: ".reader-host innerHTML", pageAside: ".page-aside innerHTML（去装饰）",
  asideHost: ".aside-host innerHTML（去装饰）", manualShell: ".manual-shell innerHTML（去装饰）",
  bodyHTML: "body innerHTML（去装饰/脚本/注释）", bodyText: "body innerText（去装饰）",
};

/* 每个模式：视口、URL 查询串、媒体特性模拟、每次新文档开头预置的 localStorage。
   prefers-color-scheme 与 prefers-reduced-motion 一律显式钉死：app.js 的「自动」主题提示文字随系统深浅变，
   系统若开了减弱动效，不钉死的话 default 模式会悄悄变成 reduced。 */
const MODES = {
  /* deskMaxMs：settle 里等 desk-book 离开 waiting/loading 的上限。1.7.0 起 default 在本套件的 swiftshader 下
     也会真的去下载两份运行库（530KB 的 three 从 SMB 卷上读，冷启动那一次会超过默认的 4 秒），所以放宽到 9 秒。 */
  default: { query: "", width: 1440, height: 900, motion: "no-preference", presets: {}, deskWait: true, deskMaxMs: 9000 },
  force: { query: "?desk3d=force", width: 1440, height: 900, motion: "no-preference", presets: {}, deskWait: true, deskMaxMs: 9000 },
  reduced: { query: "", width: 1440, height: 900, motion: "reduce", presets: {}, deskWait: true },
  narrow: { query: "", width: 1000, height: 900, motion: "no-preference", presets: {}, deskWait: true },
  off: { query: "?desk3d=off", width: 1440, height: 900, motion: "no-preference", presets: {}, deskWait: true },
  "off-ls": { query: "", width: 1440, height: 900, motion: "no-preference", presets: { "hb:desk3d": "off" }, deskWait: true },
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const log = (...args) => process.stderr.write(args.join(" ") + "\n");
const median = (values) => {
  const list = values.filter((v) => typeof v === "number" && Number.isFinite(v)).sort((a, b) => a - b);
  if (!list.length) return null;
  const mid = Math.floor(list.length / 2);
  return list.length % 2 ? list[mid] : (list[mid - 1] + list[mid]) / 2;
};

/* ================= 命令行 ================= */
function parseArgs(argv) {
  const opts = { target: DEFAULT_TARGET, baseline: null, baselineRef: null, work: null, modes: ALL_MODES.slice(), nodes: "all", mutation: true, timing: true, timingRuns: 5, domOnly: false, snapshot: false, dump: false, maxDiffPrint: 4 };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => { i += 1; if (i >= argv.length) throw new Error(`${arg} 缺少参数`); return argv[i]; };
    if (arg === "--target") opts.target = path.resolve(next());
    else if (arg === "--baseline") opts.baseline = path.resolve(next());
    else if (arg === "--baseline-ref") opts.baselineRef = next();
    else if (arg === "--work") opts.work = path.resolve(next());
    else if (arg === "--modes") opts.modes = next().split(",").map((s) => s.trim()).filter(Boolean);
    else if (arg === "--nodes") opts.nodes = next();
    else if (arg === "--no-mutation") opts.mutation = false;
    else if (arg === "--no-timing") opts.timing = false;
    else if (arg === "--timing-runs") opts.timingRuns = Math.max(1, Number(next()) || 5);
    else if (arg === "--dom-only") opts.domOnly = true;
    else if (arg === "--snapshot") opts.snapshot = true;
    else if (arg === "--dump") opts.dump = true;
    else if (arg === "--max-diff-print") opts.maxDiffPrint = Math.max(0, Number(next()) || 0);
    else if (arg === "-h" || arg === "--help") { opts.help = true; }
    else throw new Error(`未知参数：${arg}`);
  }
  for (const mode of opts.modes) if (!MODES[mode]) throw new Error(`未知模式：${mode}（可选：${ALL_MODES.join(",")}）`);
  if (opts.nodes !== "all" && !(Number(opts.nodes) > 0)) throw new Error("--nodes 只接受 all 或正整数");
  if (opts.baseline && opts.baselineRef) throw new Error("--baseline 与 --baseline-ref 只能给一个：前者用现成目录，后者从提交解一份出来。");
  /* WORK 在这里定稿（--work 可能出现在 --baseline 之后），默认基线目录随之落到 WORK 下。 */
  if (opts.work) WORK = opts.work;
  if (!opts.baseline) opts.baseline = opts.baselineRef ? workPath(`baseline-${opts.baselineRef}`) : workPath("baseline");
  return opts;
}

/* 没有现成基线目录时，用只读的 git archive 从某个提交解一份出来（默认解到 WORK/baseline-<ref>）。
   已经解好的直接复用，不重复解；解到临时目录再整体改名，中途断掉不会留下半份被当成好的。 */
function extractBaseline(ref, dest, repoRoot) {
  if (existsSync(path.join(dest, "index.html"))) { log(`复用已解出的基线：${dest}`); return dest; }
  ensureWork();
  const tmpDir = `${dest}.part-${process.pid}`;
  const tarFile = `${dest}.part-${process.pid}.tar`;
  rmSync(tmpDir, { recursive: true, force: true });
  rmSync(dest, { recursive: true, force: true });
  mkdirSync(tmpDir, { recursive: true });
  log(`从 ${ref} 解基线到 ${dest} …`);
  try {
    const fd = openSync(tarFile, "w");
    let git;
    try { git = spawnSync("git", ["-C", repoRoot, "archive", ref], { stdio: ["ignore", fd, "pipe"] }); }
    finally { closeSync(fd); }
    if (git.error) throw new Error(`git archive 起不来：${git.error.message}`);
    if (git.status !== 0) throw new Error(`git -C ${repoRoot} archive ${ref} 失败（退出码 ${git.status}）：${String(git.stderr || "").trim()}`);
    const tar = spawnSync("tar", ["-x", "-f", tarFile, "-C", tmpDir], { stdio: ["ignore", "pipe", "pipe"] });
    if (tar.error) throw new Error(`tar 起不来：${tar.error.message}`);
    if (tar.status !== 0) throw new Error(`tar 解包失败（退出码 ${tar.status}）：${String(tar.stderr || "").trim()}`);
    if (!existsSync(path.join(tmpDir, "index.html"))) throw new Error(`${ref} 解出来没有 index.html，确认这个提交是岗岗仓库的提交。`);
    renameSync(tmpDir, dest);
  } catch (error) {
    rmSync(tmpDir, { recursive: true, force: true });
    throw error;
  } finally {
    rmSync(tarFile, { force: true });
  }
  return dest;
}

/* ================= 极简 CDP 客户端 ================= */
class CDP {
  constructor(url) { this.url = url; this.seq = 0; this.pending = new Map(); this.listeners = new Set(); this.closed = false; }
  async open() {
    this.ws = new WebSocket(this.url);
    await new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", () => reject(new Error("CDP WebSocket 连接失败")), { once: true });
    });
    this.ws.addEventListener("message", (event) => this.onMessage(event));
    this.ws.addEventListener("close", () => {
      this.closed = true;
      for (const waiter of this.pending.values()) waiter.reject(new Error("CDP 连接已关闭"));
      this.pending.clear();
    });
  }
  onMessage(event) {
    const msg = JSON.parse(typeof event.data === "string" ? event.data : Buffer.from(event.data).toString("utf8"));
    if (msg.id !== undefined) {
      const waiter = this.pending.get(msg.id);
      if (!waiter) return;
      this.pending.delete(msg.id);
      clearTimeout(waiter.timer);
      if (msg.error) waiter.reject(new Error(`${waiter.method}: ${JSON.stringify(msg.error)}`));
      else waiter.resolve(msg.result);
      return;
    }
    for (const fn of this.listeners) { try { fn(msg); } catch (error) { log("监听器异常", error.message); } }
  }
  send(method, params = {}, timeout = 60000) {
    if (this.closed) return Promise.reject(new Error("CDP 连接已关闭"));
    const id = ++this.seq;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error(`${method} 超时`)); }, timeout);
      this.pending.set(id, { resolve, reject, timer, method });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  on(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  waitEvent(method, timeout, predicate) {
    return new Promise((resolve, reject) => {
      const off = this.on((msg) => {
        if (msg.method !== method || (predicate && !predicate(msg.params))) return;
        clearTimeout(timer); off(); resolve(msg.params);
      });
      const timer = setTimeout(() => { off(); reject(new Error(`等待 ${method} 超时`)); }, timeout);
    });
  }
  close() { try { this.ws.close(); } catch { /* 已关 */ } }
}

async function portAlive() {
  try { const res = await fetch(`http://127.0.0.1:${PORT}/json/version`, { signal: AbortSignal.timeout(800) }); return res.ok; } catch { return false; }
}

let liveChrome = null;
async function launchChrome(tag) {
  if (await portAlive()) throw new Error(`端口 ${PORT} 已被占用（可能是上次残留的 Chrome）。请先关掉它再跑。`);
  const profile = workPath(`chrome-profile-${tag}`);
  ensureWork();
  rmSync(profile, { recursive: true, force: true });
  const args = [
    "--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
    "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--window-size=1440,900",
    /* 静音：四家规矩，测试时屋主的电脑绝不能出声（无头 Chrome 的自动播放默认是「允许」）。岗岗本身没有声音，这条防的是将来。 */
    "--mute-audio",
    /* 以下只为减少噪声（首启向导、后台联网、组件更新、钥匙串弹窗），与 file:// 访问权限无关。 */
    "--no-first-run", "--no-default-browser-check", "--disable-background-networking", "--disable-component-update",
    "--disable-sync", "--use-mock-keychain", "--password-store=basic",
    "about:blank",
  ];
  const proc = spawn(CHROME, args, { stdio: ["ignore", "ignore", "pipe"] });
  let stderr = "";
  proc.stderr.on("data", (chunk) => { stderr += chunk; if (stderr.length > 40000) stderr = stderr.slice(-20000); });
  let version = null; let page = null;
  for (let i = 0; i < 200 && !page; i += 1) {
    try {
      version = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json();
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      page = list.find((t) => t.type === "page") || null;
    } catch { /* 还没起来 */ }
    if (!page) await sleep(100);
  }
  if (!page) { proc.kill("SIGKILL"); throw new Error(`Chrome 启动失败：${stderr.slice(-2000)}`); }
  const cdp = new CDP(page.webSocketDebuggerUrl);
  await cdp.open();
  const handle = {
    proc, cdp, version, profile,
    async close() {
      cdp.close();
      const exited = new Promise((resolve) => proc.once("exit", resolve));
      proc.kill("SIGTERM");
      await Promise.race([exited, sleep(5000)]);
      if (proc.exitCode === null && proc.signalCode === null) proc.kill("SIGKILL");
      for (let i = 0; i < 50 && await portAlive(); i += 1) await sleep(100);
      liveChrome = null;
    },
  };
  liveChrome = handle;
  return handle;
}
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => { try { liveChrome && liveChrome.proc.kill("SIGKILL"); } catch { /* 忽略 */ } process.exit(130); });

/* ================= 页面侧函数（toString 后注入，不挂任何全局） ================= */
/* 去装饰：允许位置就这几个，各最多一个——
     ① .page-aside 的「最后一个子元素且是 .desk-book」
     ② .aside-tools 的直接子元素，五个开关类名各至多一个：
        .theme-switch / .palette-switch（1.7.0 粉彩那一版的名字，基线那一侧有）
        .mode-switch  / .accent-switch （1.7.0 玻璃版的名字，改动这一侧有）
        .desk-switch  （案头手册开关，两侧都有）
        —— 两侧同样处理，所以「主题开关改名 + 配色开关换成强调色圆点」不算 DOM 回归，
        而「把它们放错位置或放两个」一定显形为差异。
     ③ body 的直接子元素 nav.tab-bar 至多一个（1.7.0 玻璃版新增的手机快捷栏，>600px 不渲染）。
     ④ .brand 的直接子元素 img.brand-icon 至多一个（可换的品牌图标，由 app.js 运行时注入；
        仓库默认不带图标文件，取不到时 app.js 自己把它摘掉，所以默认态本来就没有这个节点）。
   别处出现、或出现第二个，都原样保留——它们必须在比对里显形为差异。 */
const P_SWITCHES = ["theme-switch", "mode-switch", "palette-switch", "accent-switch", "desk-switch"];
function P_strip(root) {
  const asides = [];
  if (root && root.nodeType === 1 && root.matches(".page-aside")) asides.push(root);
  if (root && root.querySelectorAll) asides.push(...root.querySelectorAll(".page-aside"));
  let book = 0; let sw = 0; let tab = 0;
  for (const aside of asides) {
    const last = aside.lastElementChild;
    if (last && last.classList.contains("desk-book")) { last.remove(); book += 1; }
    for (const name of P_SWITCHES) {
      const node = aside.querySelector(".aside-tools > ." + name);
      if (node) { node.remove(); sw += 1; }
    }
  }
  /* tab bar 只可能挂在 body 直属：采集时 root 是 body 的克隆，用 :scope > 锁死「直接子元素」。 */
  if (root && root.nodeType === 1 && typeof root.querySelector === "function") {
    const bar = root.matches("body") || root.tagName === "BODY" ? root.querySelector(":scope > nav.tab-bar") : null;
    if (bar) { bar.remove(); tab += 1; }
    const icon = root.querySelector(".brand > img.brand-icon");
    if (icon) { icon.remove(); tab += 1; }
    /* 图标文件加载成功时 app.js 会给 .brand 加一个 has-brand-file 类（CSS 据此撤掉内置图标那一层）。
       它和上面那个 <img> 是同一件装饰的两半，必须一起剥——否则「仓库里有没有放图标文件」
       会被当成 DOM 回归。两侧同样处理：基线那一版没有这个类，剥掉即等价。 */
    for (const b of root.querySelectorAll(".brand.has-brand-file")) b.classList.remove("has-brand-file");
  }
  return { book, sw, tab };
}
/* body 级规范化（两边同样处理）：去 <script>、去注释、合并相邻文本节点后把纯空白文本节点压成一个空格。
   不碰任何可见文字——可见文字另由 innerText 字段逐字比对兜底。 */
function P_cleanBody(body) {
  body.querySelectorAll("script").forEach((node) => node.remove());
  const walker = document.createTreeWalker(body, NodeFilter.SHOW_COMMENT);
  const comments = [];
  while (walker.nextNode()) comments.push(walker.currentNode);
  comments.forEach((node) => node.remove());
  body.normalize();
  const texts = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
  const blanks = [];
  while (texts.nextNode()) {
    const node = texts.currentNode;
    if (!node.nodeValue.trim() && !(node.parentElement && node.parentElement.closest("pre,textarea"))) blanks.push(node);
  }
  blanks.forEach((node) => { node.nodeValue = " "; });
}
function P_fnv(text) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) { hash ^= text.charCodeAt(i); hash = Math.imul(hash, 0x01000193); }
  return (hash >>> 0).toString(16);
}
function P_desk() {
  try {
    const api = window.GangDeskBook;
    if (!api || typeof api.status !== "function") return null;
    const s = api.status();
    if (!s || typeof s !== "object") return { state: String(s) };
    const p = s.probe && typeof s.probe === "object" ? s.probe : {};
    /* 1.7.0 增的精简档诊断字段（software / stage / renderer / probe）：老版本没有，一律记 null，
       基线那一侧就是这样，所以不能拿它们直接比对两侧，只对被测侧设断言。 */
    return {
      state: s.state === undefined ? null : String(s.state),
      reason: s.reason === undefined ? null : String(s.reason),
      tier: s.tier === undefined ? null : String(s.tier),
      software: s.software === undefined ? null : Boolean(s.software),
      stage: s.stage === undefined || s.stage === null ? null : String(s.stage),
      renderer: s.renderer === undefined || s.renderer === null ? null : String(s.renderer),
      probe: { strict: p.webgl2Strict === undefined ? null : p.webgl2Strict, loose: p.webgl2Loose === undefined ? null : p.webgl2Loose, gl1: p.webgl1Loose === undefined ? null : p.webgl1Loose },
    };
  } catch (error) { return { state: "throw", reason: String((error && error.message) || error) }; }
}
function P_contract() {
  const book = document.querySelector(".desk-book");
  if (!book) return null;
  const parent = book.parentElement;
  return {
    count: document.querySelectorAll(".desk-book").length,
    tag: book.tagName,
    ariaHidden: book.getAttribute("aria-hidden"),
    parentIsAside: Boolean(parent && parent.classList.contains("page-aside")),
    isLastChild: Boolean(parent && parent.lastElementChild === book),
    hasCanvas: Boolean(book.querySelector("canvas")),
    focusables: book.querySelectorAll("a[href],button,input,select,textarea,iframe,[contenteditable],[tabindex]:not([tabindex='-1'])").length + (book.hasAttribute("tabindex") && book.getAttribute("tabindex") !== "-1" ? 1 : 0),
  };
}
function P_liveText() {
  /* innerText 依赖布局，只能在活 DOM 上取：同一个同步任务里摘下两个装饰节点、读 innerText、原位装回。 */
  const aside = document.querySelector(".page-aside");
  const saved = [];
  if (aside) {
    const last = aside.lastElementChild;
    if (last && last.classList.contains("desk-book")) saved.push([last, aside, null]);
    for (const name of P_SWITCHES) {
      const node = aside.querySelector(".aside-tools > ." + name);
      if (node) saved.push([node, node.parentNode, node.nextSibling]);
    }
  }
  const bar = document.querySelector("body > nav.tab-bar");
  if (bar) saved.push([bar, bar.parentNode, bar.nextSibling]);
  const icon = document.querySelector(".brand > img.brand-icon");
  if (icon) saved.push([icon, icon.parentNode, icon.nextSibling]);
  for (const [node, parent] of saved) parent.removeChild(node);
  try { return document.body ? document.body.innerText : null; }
  finally {
    for (let i = saved.length - 1; i >= 0; i -= 1) {
      const [node, parent, next] = saved[i];
      parent.insertBefore(node, next && next.parentNode === parent ? next : null);
    }
  }
}
function P_fp() {
  let html = "";
  if (document.body) { const clone = document.body.cloneNode(true); P_strip(clone); P_cleanBody(clone); html = clone.innerHTML; }
  const images = Array.from(document.images);
  return {
    fp: P_fnv(`${html}${document.title}${location.hash}`),
    ready: document.readyState,
    imgs: images.length,
    imgsDone: images.filter((img) => img.complete).length,
    desk: P_desk(),
  };
}
function P_capture() {
  const q = (sel) => document.querySelector(sel);
  const stripped = (el) => { if (!el) return { html: null, book: 0, sw: 0 }; const clone = el.cloneNode(true); const r = P_strip(clone); return { html: clone.innerHTML, book: r.book, sw: r.sw }; };
  const aside = stripped(q(".page-aside"));
  let bodyHTML = null;
  if (document.body) { const clone = document.body.cloneNode(true); P_strip(clone); P_cleanBody(clone); bodyHTML = clone.innerHTML; }
  const out = {
    title: document.title,
    hash: location.hash,
    headBiz: q("#head-biz") ? q("#head-biz").textContent : null,
    rail: q("#stage-rail-host") ? q("#stage-rail-host").innerHTML : null,
    toc: q(".toc") ? q(".toc").innerHTML : null,
    reader: q(".reader-host") ? q(".reader-host").innerHTML : null,
    pageAside: aside.html,
    asideHost: stripped(q(".aside-host")).html,
    manualShell: stripped(q(".manual-shell")).html,
    bodyHTML,
    bodyText: P_liveText(),
  };
  out.meta = {
    strippedBook: aside.book, strippedSwitch: aside.sw,
    deskBookCount: document.querySelectorAll(".desk-book").length,
    deskSwitchCount: document.querySelectorAll(".desk-switch").length,
    switchCount: P_SWITCHES.reduce((n, name) => n + document.querySelectorAll("." + name).length, 0),
    tabBarCount: document.querySelectorAll("nav.tab-bar").length,
    brandIconCount: document.querySelectorAll("img.brand-icon").length,
    brandHasFile: Boolean(document.querySelector(".brand.has-brand-file")),
    deskCanvas: Boolean(q(".page-aside > .desk-book canvas")),
    status: P_desk(),
    contract: P_contract(),
    vendorScripts: Array.from(document.querySelectorAll("script[src]")).map((s) => s.getAttribute("src")).filter((src) => /(^|\/)vendor\//.test(src)),
    resourceVendor: performance.getEntriesByType("resource").map((e) => e.name).filter((n) => /\/vendor\//.test(n)),
    resourceCount: performance.getEntriesByType("resource").length,
    deskBookScript: Boolean(q('script[src*="desk-book.js"]')),
    THREE: typeof window.THREE, gsap: typeof window.gsap,
    htmlAttrs: Array.from(document.documentElement.attributes).map((a) => `${a.name}=${a.value}`).join(" "),
    scrollY: window.scrollY,
    motionReduce: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    innerWidth: window.innerWidth,
  };
  return out;
}
const PAGE_LIB = ["const P_SWITCHES = " + JSON.stringify(P_SWITCHES) + ";"].concat([P_strip, P_cleanBody, P_fnv, P_desk, P_contract, P_liveText, P_fp, P_capture].map((fn) => fn.toString())).join("\n");
const pageExpr = (body) => `(() => { ${PAGE_LIB}\n${body} })()`;

/* 节点枚举：与 app.js 的 collectNodes/allNodes/hasContent/isEditorialLine/textFor 同一口径（直接照抄判定），
   读的是页面里真实加载的 window.EMPLOYEE_HANDBOOK；每个 key 打开后还会核对 location.hash 没被 app.js 纠正回默认业务。 */
const ENUM_EXPR = `(() => {
  const h = window.EMPLOYEE_HANDBOOK;
  const textFor = (block) => String((block && block.text) || "").trim() || ((block && block.rows) || []).flat().join(" ");
  const hasContent = (s) => ((s && s.blocks) || []).some((b) => textFor(b) || (b.images || []).length);
  const isEditorialLine = (s) => /^\\d+[.、]\\D/.test(String((s && s.title) || "")) && !/^\\d+\\.\\d+/.test(String((s && s.title) || ""));
  const collect = (section, indexPath) => {
    const own = hasContent(section) && !isEditorialLine(section)
      ? [{ key: indexPath.join("-"), title: String(section.title || ""), len: (section.blocks || []).reduce((n, b) => n + textFor(b).length, 0) }] : [];
    return (section.children || []).reduce((all, child, i) => all.concat(collect(child, indexPath.concat([i]))), own);
  };
  const cats = (h && h.content && h.content.children) || [];
  return cats.flatMap((c, i) => collect(c, [i]));
})()`;

/* 懒加载图片去随机：app.js 的正文截图全是 loading="lazy"，markSmallFigures 只在图片 load 回调里补 .is-small；
   哪些懒图在采集前加载完，取决于 Chrome 的懒加载距离阈值（随网络质量估计变，新 profile 首次导航尤其不同）和时序——
   基线自比实测 0-0-0-0 一侧有 is-small 一侧没有。做法（两边同样）：临时改 eager → 等全部图片 load/error →
   原样改回 loading="lazy"。app.js 的 load 回调注册在先、先执行，所以 is-small 变成确定值，而不是被规范化掉。 */
const EAGER_IMAGES_EXPR = `(async () => {
  const lazy = Array.from(document.querySelectorAll('img[loading="lazy"]'));
  lazy.forEach((img) => { img.loading = "eager"; });
  const all = Array.from(document.images);
  const pending = all.filter((img) => !img.complete).map((img) => new Promise((resolve) => { img.addEventListener("load", resolve, { once: true }); img.addEventListener("error", resolve, { once: true }); }));
  let timedOut = false;
  await Promise.race([Promise.all(pending), new Promise((resolve) => setTimeout(() => { timedOut = true; resolve(); }, 12000))]);
  await new Promise((resolve) => setTimeout(resolve, 0));
  lazy.forEach((img) => { img.setAttribute("loading", "lazy"); });
  return { total: all.length, lazy: lazy.length, waited: pending.length, broken: all.filter((img) => img.complete && !img.naturalWidth).length, timedOut };
})()`;

/* 每个新文档最先执行（两边同一份）：清空 localStorage → 写入本模式预置 → 打「首次业务渲染」性能标记。 */
function preludeSource({ clear, presets }) {
  return `(() => {
  try { if (location.protocol === "file:") { ${clear ? "localStorage.clear();" : ""} const p = ${JSON.stringify(presets || {})}; for (const k of Object.keys(p)) localStorage.setItem(k, p[k]); } } catch (e) {}
  try {
    const mark = () => { if (document.querySelector(".reader-host h1, .search-page")) { performance.mark("hb-first-render"); return true; } return false; };
    const mo = new MutationObserver(() => { if (mark()) mo.disconnect(); });
    mo.observe(document, { childList: true, subtree: true });
  } catch (e) {}
})();`;
}

/* ================= 标签页驱动 ================= */
class Tab {
  constructor(chrome, side, modeName) {
    this.chrome = chrome; this.cdp = chrome.cdp; this.side = side; this.modeName = modeName; this.mode = MODES[modeName];
    this.errors = []; this.context = "init";
    this.resetTracking();
    this.cdp.on((msg) => this.onEvent(msg));
  }
  resetTracking() { this.requests = new Map(); }
  onEvent({ method, params }) {
    if (method === "Network.requestWillBeSent") {
      const url = params.request.url;
      if (/^(data|blob|about|chrome|devtools|chrome-extension):/.test(url)) return;
      if (params.redirectResponse) return;
      this.requests.set(params.requestId, { url, t: Date.now(), done: false, failed: null, context: this.context });
    } else if (method === "Network.loadingFinished") {
      const r = this.requests.get(params.requestId); if (r) r.done = true;
    } else if (method === "Network.loadingFailed") {
      const r = this.requests.get(params.requestId);
      if (r) { r.done = true; r.failed = params.errorText; }
      if (!params.canceled) this.errors.push({ kind: "网络失败", text: `${params.errorText}${params.blockedReason ? ` (${params.blockedReason})` : ""}`, url: r ? r.url : "", context: this.context });
    } else if (method === "Runtime.exceptionThrown") {
      const d = params.exceptionDetails || {};
      this.errors.push({ kind: "未捕获异常", text: (d.exception && (d.exception.description || d.exception.value)) || d.text, url: d.url || "", line: d.lineNumber, context: this.context });
    } else if (method === "Log.entryAdded") {
      const e = params.entry || {};
      if (e.level === "error") this.errors.push({ kind: `Log(${e.source})`, text: e.text, url: e.url || "", context: this.context });
    } else if (method === "Runtime.consoleAPICalled") {
      if (params.type === "error" || params.type === "assert") {
        const text = (params.args || []).map((a) => (a.value !== undefined ? String(a.value) : a.description || a.type)).join(" ");
        this.errors.push({ kind: `console.${params.type}`, text, url: "", context: this.context });
      }
    }
  }
  async init() {
    const send = (m, p) => this.cdp.send(m, p);
    await send("Page.enable"); await send("Network.enable"); await send("Runtime.enable"); await send("Log.enable");
    await this.setViewport(this.mode.width, this.mode.height);
    await this.setMotion(this.mode.motion);
    await this.setPrelude({ clear: true, presets: this.mode.presets });
  }
  async setViewport(width, height) {
    await this.cdp.send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
  }
  async setMotion(value) {
    await this.cdp.send("Emulation.setEmulatedMedia", { media: "", features: [{ name: "prefers-reduced-motion", value }, { name: "prefers-color-scheme", value: "light" }] });
  }
  async setPrelude(opts) {
    if (this.preludeId) await this.cdp.send("Page.removeScriptToEvaluateOnNewDocument", { identifier: this.preludeId });
    const r = await this.cdp.send("Page.addScriptToEvaluateOnNewDocument", { source: preludeSource(opts) });
    this.preludeId = r.identifier;
  }
  async evaluate(expression, timeout = 30000) {
    const r = await this.cdp.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }, timeout);
    if (r.exceptionDetails) throw new Error(`页面求值异常：${(r.exceptionDetails.exception && r.exceptionDetails.exception.description) || r.exceptionDetails.text}`);
    return r.result.value;
  }
  async navigate(url, timeout = 30000) {
    const loaded = this.cdp.waitEvent("Page.loadEventFired", timeout);
    const r = await this.cdp.send("Page.navigate", { url });
    if (r.errorText) { loaded.catch(() => {}); throw new Error(`导航失败 ${url}: ${r.errorText}`); }
    await loaded;
  }
  /* 每个 URL 都是一次全新文档：先去 about:blank，旧文档的事件在它 load 前全部落定，再清账、打开目标。 */
  async goto(url, context) {
    await this.navigate("about:blank", 10000).catch(() => {});
    await sleep(30);
    this.resetTracking();
    this.context = context || url;
    await this.navigate(url);
  }
  async reload(context) {
    this.resetTracking();
    this.context = context || this.context;
    const loaded = this.cdp.waitEvent("Page.loadEventFired", 30000);
    await this.cdp.send("Page.reload", { ignoreCache: true });
    await loaded;
  }
  inflight() {
    const now = Date.now();
    let n = 0;
    for (const r of this.requests.values()) if (!r.done && now - r.t < 8000) n += 1;
    return n;
  }
  /* 稳定判据：readyState=complete、无在途请求、去装饰后的 body 指纹连续 3 次（≥450ms）不变；
     deskWait 时再等 GangDeskBook 离开 waiting/loading（最多 deskMaxMs）。 */
  async settle({ deskWait = false, maxMs = 15000, deskMaxMs = 4000 } = {}) {
    const t0 = Date.now();
    const images = await this.evaluate(EAGER_IMAGES_EXPR, 20000);
    let last = null; let same = 0; let deskDeadline = 0; let s = null;
    while (Date.now() - t0 < maxMs) {
      s = await this.evaluate(pageExpr("return P_fp();"));
      if (s.fp === last && s.ready === "complete" && this.inflight() === 0) same += 1; else same = 0;
      last = s.fp;
      if (same >= 3) {
        const busy = deskWait && s.desk && (s.desk.state === "waiting" || s.desk.state === "loading");
        if (!busy) return { stable: true, ms: Date.now() - t0, desk: s.desk, images };
        if (!deskDeadline) deskDeadline = Date.now() + deskMaxMs;
        if (Date.now() > deskDeadline) return { stable: true, ms: Date.now() - t0, desk: s.desk, deskTimedOut: true, images };
      }
      await sleep(150);
    }
    return { stable: false, ms: Date.now() - t0, desk: s && s.desk, images };
  }
  capture() { return this.evaluate(pageExpr("return P_capture();")); }
  vendorRequests() { return [...this.requests.values()].filter((r) => /\/vendor\//.test(r.url)); }
  remoteRequests() { return [...this.requests.values()].filter((r) => /^(https?|wss?|ftp):/i.test(r.url)); }
}

/* ================= 比对 ================= */
function firstDiff(field, a, b) {
  if (a === b) return null;
  const sa = a === null || a === undefined ? `«${a}»` : String(a);
  const sb = b === null || b === undefined ? `«${b}»` : String(b);
  let i = 0;
  const n = Math.min(sa.length, sb.length);
  while (i < n && sa.charCodeAt(i) === sb.charCodeAt(i)) i += 1;
  return {
    field, label: FIELD_LABEL[field] || field, index: i, baselineLength: sa.length, targetLength: sb.length,
    before: sa.slice(Math.max(0, i - 200), i),
    baselineAfter: sa.slice(i, i + 200),
    targetAfter: sb.slice(i, i + 200),
  };
}
function compareCaptures(base, test, fields) {
  const diffs = [];
  for (const field of fields) { const d = firstDiff(field, base[field], test[field]); if (d) diffs.push(d); }
  return diffs;
}
const sha = (text) => createHash("sha256").update(text).digest("hex");
function fieldHashes(capture, fields) {
  const out = {};
  for (const f of fields) out[f] = capture[f] === null || capture[f] === undefined ? null : `${sha(String(capture[f])).slice(0, 16)}:${String(capture[f]).length}`;
  return out;
}

/* ================= 断言工具 ================= */
const check = (name, ok, detail) => ({ name, ok: Boolean(ok), detail: detail === undefined ? null : detail });
function deskContractChecks(contract) {
  if (!contract) return [check("装饰节点存在（.page-aside > .desk-book）", false, "未找到 .desk-book")];
  return [
    check("装饰节点只有一个", contract.count === 1, contract.count),
    check("装饰节点是 <div>", contract.tag === "DIV", contract.tag),
    check('装饰节点 aria-hidden="true"', contract.ariaHidden === "true", contract.ariaHidden),
    check("装饰节点位于 .page-aside 且为最后一个子元素", contract.parentIsAside && contract.isLastChild, { parentIsAside: contract.parentIsAside, isLastChild: contract.isLastChild }),
    check("装饰节点内含 canvas", contract.hasCanvas),
    check("装饰节点内无可聚焦元素", contract.focusables === 0, contract.focusables),
  ];
}
function gateChecks(tab, cap, { noSwitch = false, label = "" } = {}) {
  const vendor = tab.vendorRequests();
  const out = [
    check(`${label}无 vendor/ 请求（CDP Network）`, vendor.length === 0, vendor.map((r) => r.url.split("/").slice(-2).join("/"))),
    check(`${label}DOM 中无 vendor/ 脚本标签`, cap.meta.vendorScripts.length === 0, cap.meta.vendorScripts),
    check(`${label}resource timing 中无 vendor/（file:// 下此项为盲区，仅作附带）`, cap.meta.resourceVendor.length === 0, cap.meta.resourceVendor),
    check(`${label}无 .desk-book`, cap.meta.deskBookCount === 0, cap.meta.deskBookCount),
  ];
  if (noSwitch) out.push(check(`${label}无 .desk-switch`, cap.meta.deskSwitchCount === 0, cap.meta.deskSwitchCount));
  return out;
}
const briefStatus = (s) => (s ? `${s.state}${s.reason ? `/${s.reason}` : ""}${s.tier ? `/${s.tier}` : ""}${s.software ? `/software` : ""}${s.stage ? `/${s.stage}` : ""}` : "（无 GangDeskBook）");

/* ================= 静态检查（只读目标目录） ================= */
/* 粗剥 JS 注释：块注释整段去掉；行注释只在 // 前不是冒号或引号时才算（保住 "https://…" 与 "//cdn…" 字符串）。
   只用于静态扫描，命中项会连名字一起报出来，由人复核。 */
function stripJsComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`\\])\/\/[^\n]*/gm, "$1");
}
function staticChecks(dir) {
  const checks = []; const info = {};
  const file = (rel) => path.join(dir, rel);
  const deskPath = file("desk-book.js");
  /* HTML 注释先剥掉：index.html 自己的注释里就写着 type="module" 字样（解释为什么不用它）。 */
  const html = (existsSync(file("index.html")) ? readFileSync(file("index.html"), "utf8") : "").replace(/<!--[\s\S]*?-->/g, "");
  const scripts = [...html.matchAll(/<script\b([^>]*)>/gi)].map((m) => m[1]);
  const srcOf = (attrs) => { const m = /\bsrc\s*=\s*["']([^"']+)["']/i.exec(attrs); return m ? m[1] : null; };
  const deskIdx = scripts.findIndex((a) => /desk-book\.js/.test(srcOf(a) || ""));
  const appIdx = scripts.findIndex((a) => /(^|\/)app\.js/.test(srcOf(a) || ""));
  checks.push(check("desk-book.js 文件存在", existsSync(deskPath)));
  checks.push(check("index.html 引用 desk-book.js 且在 app.js 之前", deskIdx >= 0 && appIdx >= 0 && deskIdx < appIdx, { deskIdx, appIdx }));
  if (deskIdx >= 0) {
    const attrs = scripts[deskIdx];
    checks.push(check("desk-book.js 是经典脚本（无 type=module / async / defer）", !/type\s*=\s*["']?module/i.test(attrs) && !/\basync\b/i.test(attrs) && !/\bdefer\b/i.test(attrs), attrs.trim()));
  }
  checks.push(check("index.html 未直接引用 vendor/（只许运行时注入）", !/vendor\//.test(html)));
  checks.push(check("index.html 无 importmap / type=module", !/importmap|type\s*=\s*["']?module/i.test(html)));
  if (existsSync(deskPath)) {
    const src = readFileSync(deskPath, "utf8");
    info.deskBookBytes = Buffer.byteLength(src);
    info.deskBookSha256 = sha(src);
    const bad = [
      ["fetch(", /\bfetch\s*\(/], ["XMLHttpRequest", /XMLHttpRequest/], ["动态 import()", /\bimport\s*\(/],
      ["import/export 语句", /^\s*(import|export)\s[^(]/m], ['type="module"', /["']module["']/], ["importmap", /importmap/i],
      ["http(s) 地址", /https?:\/\/(?!www\.w3\.org)/],
      ["协议相对远程地址", /["'`]\/\/[a-z0-9.-]+\.[a-z]{2,}/i],
    ].filter(([, re]) => re.test(stripJsComments(src)));
    checks.push(check("desk-book.js 不用 fetch/XHR/动态 import/ES module/远程地址（file:// 硬约束）", bad.length === 0, bad.map(([n]) => n)));
  }
  for (const rel of VENDOR_FILES) {
    const p = file(rel);
    checks.push(check(`${rel} 存在`, existsSync(p)));
    if (existsSync(p)) {
      const src = readFileSync(p, "utf8");
      info[rel] = { bytes: Buffer.byteLength(src), sha256: sha(src), license: /@license|license|Copyright/i.test(src.slice(0, 2000)), esmMarkers: /(^|[;\n])\s*export\s*[{*]|import\.meta/.test(src) };
      checks.push(check(`${rel} 不含 ES module 语法（export {…} / import.meta）`, !info[rel].esmMarkers));
    }
  }
  return { checks, info };
}

function hashFiles(dir) {
  const out = {};
  for (const rel of ["index.html", "app.js", "styles.css", "desk-book.js", "employee-handbook.js", "search-module.js", "visit-store.js", ...VENDOR_FILES]) {
    const p = path.join(dir, rel);
    out[rel] = existsSync(p) ? sha(readFileSync(p)).slice(0, 16) : null;
  }
  return out;
}

function snapshotTarget(src) {
  const dest = workPath(`target-snapshot-${stamp()}`);
  mkdirSync(dest, { recursive: true });
  for (const name of readdirSync(src)) {
    if (name === ".git" || name === ".claude" || /\.docx$/i.test(name)) continue;
    cpSync(path.join(src, name), path.join(dest, name), { recursive: true });
  }
  return dest;
}
function stamp() { const d = new Date(); const p = (n) => String(n).padStart(2, "0"); return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`; }

/* ================= 单侧运行 ================= */
const fileUrl = (dir, query, hash) => `file://${encodeURI(path.join(dir, "index.html"))}${query || ""}${hash || ""}`;

async function runSide({ side, dir, modeName, nodes, opts, probeNodes }) {
  const mode = MODES[modeName];
  const chrome = await launchChrome(`${modeName}-${side}`);
  const tab = new Tab(chrome, side, modeName);
  const result = { side, dir, chromeVersion: chrome.version && chrome.version.Browser, nodes: {}, search: {}, probes: [], mutation: null, timing: null, errors: null, unstable: [] };
  const captures = { nodes: {}, search: {} };
  try {
    await tab.init();
    const isTarget = side === "target";
    /* ---- 全部业务节点 ---- */
    let i = 0;
    for (const node of nodes) {
      i += 1;
      const hash = `#/${node.key}/0`;
      await tab.goto(fileUrl(dir, mode.query, hash), `node ${node.key}`);
      const settle = await tab.settle({ deskWait: mode.deskWait, deskMaxMs: mode.deskMaxMs });
      const cap = await tab.capture();
      if (!settle.stable) result.unstable.push({ node: node.key, ms: settle.ms });
      captures.nodes[node.key] = cap;
      const entry = { key: node.key, settle, status: cap.meta.status, meta: { deskBookCount: cap.meta.deskBookCount, deskSwitchCount: cap.meta.deskSwitchCount, switchCount: cap.meta.switchCount, tabBarCount: cap.meta.tabBarCount, brandIconCount: cap.meta.brandIconCount, brandHasFile: cap.meta.brandHasFile, strippedBook: cap.meta.strippedBook, strippedSwitch: cap.meta.strippedSwitch, deskBookScript: cap.meta.deskBookScript, htmlAttrs: cap.meta.htmlAttrs, motionReduce: cap.meta.motionReduce, innerWidth: cap.meta.innerWidth }, vendorRequests: tab.vendorRequests().map((r) => r.url), remoteRequests: tab.remoteRequests().map((r) => r.url), hashes: fieldHashes(cap, FIELDS) };
      entry.assertions = [check("hash 未被纠正（节点 key 有效）", cap.hash === hash, cap.hash)];
      if (isTarget) entry.assertions.push(...nodeAssertions(modeName, tab, cap));
      result.nodes[node.key] = entry;
      if (i % 20 === 0 || i === nodes.length) log(`  [${modeName}/${side}] 节点 ${i}/${nodes.length}`);
    }
    /* ---- 搜索页 ---- */
    for (const kw of KEYWORDS) {
      await tab.goto(fileUrl(dir, mode.query, ""), `search ${kw}`);
      await tab.settle({ deskWait: mode.deskWait });
      await tab.evaluate(`(() => { const input = document.querySelector("#global-search-input"); input.value = ${JSON.stringify(kw)}; input.dispatchEvent(new Event("input", { bubbles: true })); document.querySelector("#global-search").requestSubmit(); return true; })()`);
      const settle = await tab.settle({ deskWait: false });
      const cap = await tab.capture();
      if (!settle.stable) result.unstable.push({ search: kw, ms: settle.ms });
      captures.search[kw] = cap;
      const entry = { keyword: kw, settle, status: cap.meta.status, vendorRequests: tab.vendorRequests().map((r) => r.url), hashes: fieldHashes(cap, SEARCH_FIELDS), assertions: [check("确实进入了搜索结果页", /class="search-page"/.test(cap.manualShell || ""))] };
      if (isTarget) {
        entry.assertions.push(check("搜索结果页无 .desk-book", cap.meta.deskBookCount === 0, cap.meta.deskBookCount));
        /* default 与 force 两个模式下运行库本来就该加载（default 在 swiftshader 下走精简档），
           所以「无 vendor 请求」只对真正该拦下的那四个模式断言。搜索页无 `.desk-book` 是所有模式都要的。 */
        if (modeName !== "force" && modeName !== "default") entry.assertions.push(check("无 vendor/ 请求（CDP Network）", tab.vendorRequests().length === 0, tab.vendorRequests().map((r) => r.url)));
      }
      result.search[kw] = entry;
    }
    log(`  [${modeName}/${side}] 搜索 ${KEYWORDS.length} 个关键词完成`);
    /* ---- 探针（只在被测侧跑；基线自比时被测就是基线） ---- */
    if (isTarget) result.probes = await runProbes({ tab, dir, modeName, probeNodes, opts });
    /* ---- 计时 ---- */
    if (opts.timing && (modeName === "default" || modeName === "force")) result.timing = await runTiming({ tab, dir, modeName, runs: opts.timingRuns, waitReady: modeName === "force" && isTarget });
  } finally {
    result.errors = tab.errors;
    await chrome.close();
  }
  return { result, captures };
}

function nodeAssertions(modeName, tab, cap) {
  const s = cap.meta.status;
  const out = [];
  out.push(check("无 http(s) 远程请求", tab.remoteRequests().length === 0, tab.remoteRequests().map((r) => r.url)));
  /* 反向断言（「没加载」）只有在 desk-book 已经落定时才算数：还在 waiting/loading 就采集，运行库可能稍后才来。
     实测冷启动首个节点曾在 waiting/idle 时被采集——所以各模式都等 deskWait，并用这条断言兜底。 */
  if (modeName !== "force" && modeName !== "default") out.push(check("采集时 desk-book 已落定（不是 waiting/loading）", !s || !["waiting", "loading"].includes(s.state), briefStatus(s)));
  if (modeName === "default") {
    /* 1.7.0 起 default 在本套件的 swiftshader 下**应当加载**：渲染器名判出软件渲染 → 强制精简档 soft。
       （1.6.x 时它被「只有软件渲染」这道闸拦下，断言是反向的「一个字节都不加载」。）
       逐节点只断言「判定对了」：探测在页面 load 后的空闲时刻就做完，与右栏末尾有没有进视口无关，
       所以 software / stage / tier 三项任何节点上都成立；至于场景建没建起来，取决于那一节的右栏有多长，
       不能逐节点钉死——真正的正向断言由本模式的探针做（滚到中部，必须 ready 且 tier=soft）。 */
    out.push(check("判成了软件渲染（status().software === true）", Boolean(s && s.software === true), briefStatus(s)));
    out.push(check("档位是精简档（status().tier === 'soft'）", Boolean(s && s.tier === "soft"), briefStatus(s)));
    out.push(check("探测链走到了宽松那一段（stage === 'loose'）", Boolean(s && s.stage === "loose"), s && s.stage));
    /* 没有被任何闸门拦下才是 default 这一档的要害：ready（场景已建）、waiting（右栏末尾还没进视口）、
       loading（运行库还在 SMB 卷上读）都算通过，failed / off 一律不通过。 */
    out.push(check("没有被闸门拦下（state 不是 failed / off）", Boolean(s && s.state !== "failed" && s.state !== "off"), briefStatus(s)));
    if (cap.meta.deskBookCount > 0) out.push(...deskContractChecks(cap.meta.contract));
  } else if (modeName === "reduced") {
    out.push(...gateChecks(tab, cap, { noSwitch: true }));
  } else if (modeName === "narrow" || modeName === "off" || modeName === "off-ls") {
    out.push(...gateChecks(tab, cap));
  } else if (modeName === "force") {
    if (cap.meta.deskBookCount > 0) out.push(...deskContractChecks(cap.meta.contract));
  }
  return out;
}

/* ================= 探针 ================= */
async function runProbes({ tab, dir, modeName, probeNodes, opts }) {
  const probes = [];
  const url = (node, query) => fileUrl(dir, query, `#/${node.key}/0`);
  const snapshot = async () => {
    const cap = await tab.capture();
    return { cap, vendor: tab.vendorRequests().map((r) => ({ url: r.url.split(/[?#]/)[0].split("/").slice(-2).join("/"), rawUrl: r.url, done: r.done, failed: r.failed })) };
  };
  const waitForDesk = async (states, maxMs) => {
    const t0 = Date.now(); let s = null;
    while (Date.now() - t0 < maxMs) { s = await tab.evaluate(pageExpr("return P_desk();")); if (s && states.includes(s.state)) return s; await sleep(100); }
    return s;
  };
  /* 对照：同一节点、force、去掉被测闸门后是否真的 ready——决定该闸门探针有没有区分力。 */
  const control = async (node) => {
    await tab.goto(url(node, "?desk3d=force"), `control ${node.key}`);
    await tab.settle({ deskWait: true, deskMaxMs: 6000 });
    const s = await waitForDesk(["ready", "failed", "off"], 3000);
    return { state: briefStatus(s), ready: Boolean(s && s.state === "ready") };
  };

  /* default 的正向探针（1.7.0 增）：本套件的 Chrome 跑在 `--use-angle=swiftshader` 上，渲染器名是 SwiftShader，
     所以**不带任何调试参数**也必须走精简档把书建出来。滚到长正文中部、等 3 秒，核对：
     两份运行库都到位、ready、tier=soft、software=true、画布在、装饰契约合格，并记下画布的物理像素与像素比。
     这条探针天然有区分力（它不是「没加载」那种反向断言），所以不需要 force 对照。 */
  if (modeName === "default" && !opts.domOnly) {
    for (const node of probeNodes) {
      await tab.goto(url(node, ""), `probe default-soft ${node.key}`);
      await tab.settle({ deskWait: true, deskMaxMs: 8000 });
      const scrolled = await tab.evaluate(`(() => { const y = Math.max(0, Math.round((document.documentElement.scrollHeight - innerHeight) / 2)); window.scrollTo(0, y); return { y, h: document.documentElement.scrollHeight }; })()`);
      await waitForDesk(["ready", "failed", "off"], 8000);
      await sleep(3000);
      const { cap, vendor } = await snapshot();
      const got = (rel) => vendor.find((r) => r.url === rel);
      const s = cap.meta.status;
      const canvas = await tab.evaluate(`(() => {
        const el = document.querySelector(".page-aside > .desk-book canvas");
        if (!el) return null;
        const out = { w: el.width, h: el.height, cssW: Math.round(el.clientWidth), cssH: Math.round(el.clientHeight), dpr: window.devicePixelRatio };
        try { const gl = el.getContext("webgl2"); const a = gl ? gl.getContextAttributes() : null; if (a) out.antialias = a.antialias; } catch (error) { out.antialias = null; }
        return out;
      })()`);
      const assertions = [
        check("vendor/three.min.js 已请求且加载成功", Boolean(got("vendor/three.min.js") && got("vendor/three.min.js").done && !got("vendor/three.min.js").failed), got("vendor/three.min.js") || null),
        check("vendor/gsap.min.js 已请求且加载成功", Boolean(got("vendor/gsap.min.js") && got("vendor/gsap.min.js").done && !got("vendor/gsap.min.js").failed), got("vendor/gsap.min.js") || null),
        check("GangDeskBook.status().state === 'ready'", Boolean(s && s.state === "ready"), briefStatus(s)),
        check("软件渲染下走精简档（software===true 且 tier==='soft'）", Boolean(s && s.software === true && s.tier === "soft"), briefStatus(s)),
        check(".page-aside > .desk-book canvas 存在", cap.meta.deskCanvas),
        check("精简档像素比钉在 1（画布物理像素 = CSS 像素）", Boolean(canvas && canvas.w === canvas.cssW && canvas.h === canvas.cssH), canvas),
        check("精简档画布物理像素长边 ≤640", Boolean(canvas && Math.max(canvas.w, canvas.h) <= 640), canvas),
        check("精简档关掉了抗锯齿", canvas ? canvas.antialias === false : false, canvas),
        ...deskContractChecks(cap.meta.contract),
      ];
      probes.push({ name: `default（无调试参数）在 swiftshader 下走精简档：${node.key}`, node: node.key, kind: "positive", scrolled, info: { status: cap.meta.status, canvas, THREE: cap.meta.THREE, gsap: cap.meta.gsap, vendor }, assertions });
    }
  }

  if (modeName === "force" && !opts.domOnly) {
    for (const node of probeNodes) {
      await tab.goto(url(node, "?desk3d=force"), `probe force-long ${node.key}`);
      await tab.settle({ deskWait: true, deskMaxMs: 6000 });
      const scrolled = await tab.evaluate(`(() => { const y = Math.max(0, Math.round((document.documentElement.scrollHeight - innerHeight) / 2)); window.scrollTo(0, y); return { y, h: document.documentElement.scrollHeight }; })()`);
      await sleep(3000);
      const { cap, vendor } = await snapshot();
      const got = (rel) => vendor.find((r) => r.url === rel);
      const assertions = [
        check("vendor/three.min.js 已请求且加载成功", got("vendor/three.min.js") && got("vendor/three.min.js").done && !got("vendor/three.min.js").failed, got("vendor/three.min.js") || null),
        check("vendor/gsap.min.js 已请求且加载成功", got("vendor/gsap.min.js") && got("vendor/gsap.min.js").done && !got("vendor/gsap.min.js").failed, got("vendor/gsap.min.js") || null),
        check("两个 vendor 脚本标签都在 DOM 中", VENDOR_FILES.every((rel) => cap.meta.vendorScripts.some((src) => src.includes(rel))), cap.meta.vendorScripts),
        check("GangDeskBook.status().state === 'ready'", cap.meta.status && cap.meta.status.state === "ready", briefStatus(cap.meta.status)),
        check(".page-aside > .desk-book canvas 存在", cap.meta.deskCanvas),
        ...deskContractChecks(cap.meta.contract),
      ];
      probes.push({ name: `force 长正文滚到中部等 3 秒：${node.key}`, node: node.key, kind: "positive", scrolled, info: { status: cap.meta.status, THREE: cap.meta.THREE, gsap: cap.meta.gsap, vendor }, assertions });
    }
  }

  if (modeName === "reduced") {
    /* A. 闸门区分力：force + reduce（force 只跳软件渲染/低端/帧率三道闸，减弱动效仍须拦下） */
    for (const node of probeNodes) {
      await tab.setMotion("no-preference");
      const ctl = await control(node);
      await tab.setMotion("reduce");
      await tab.goto(url(node, "?desk3d=force"), `probe force+reduce ${node.key}`);
      await tab.settle({ deskWait: true });
      await sleep(1500);
      const { cap } = await snapshot();
      probes.push({ name: `force + 减弱动效：${node.key}`, node: node.key, kind: "gate", control: ctl, info: { status: cap.meta.status }, assertions: gateChecks(tab, cap, { noSwitch: true }) });
    }
    /* B. 协调方追加：localStorage 先写 hb:desk3d="on"，再模拟 reduce，然后重载——存的值不起作用。plain 与 force 两个变体。 */
    for (const variant of [{ label: "普通", query: "" }, { label: "force", query: "?desk3d=force" }]) {
      const node = probeNodes[0];
      await tab.setMotion("no-preference");
      await tab.goto(url(node, variant.query), `probe stored-on ${variant.label}`);
      await tab.settle({ deskWait: true, deskMaxMs: 6000 });
      const before = await tab.evaluate(pageExpr("return { desk: P_desk(), book: document.querySelectorAll('.desk-book').length };"));
      await tab.setPrelude({ clear: false, presets: {} });
      await tab.evaluate(`localStorage.setItem("hb:desk3d", "on")`);
      await tab.setMotion("reduce");
      await tab.reload(`probe stored-on ${variant.label} reload`);
      await tab.settle({ deskWait: true });
      await sleep(1500);
      const { cap } = await snapshot();
      const stored = await tab.evaluate(`(() => { try { return localStorage.getItem("hb:desk3d"); } catch (e) { return "ERR"; } })()`);
      await tab.setPrelude({ clear: true, presets: MODES[modeName].presets });
      probes.push({
        name: `存 hb:desk3d=on → 模拟 reduce → 重载（${variant.label}）`, node: node.key, kind: "gate",
        control: { state: briefStatus(before.desk), ready: Boolean(before.desk && before.desk.state === "ready"), deskBook: before.book },
        info: { status: cap.meta.status, storedAfterReload: stored, motionReduce: cap.meta.motionReduce },
        assertions: [check("前提成立：重载后 hb:desk3d 仍为 on、reduce 已生效", stored === "on" && cap.meta.motionReduce, { stored, motionReduce: cap.meta.motionReduce }), ...gateChecks(tab, cap, { noSwitch: true })],
      });
    }
    /* C. 协调方追加：运行中切换。force 下等到 ready → 切 reduce → .desk-book 当场移除；切回 no-preference 只记录。 */
    {
      const node = probeNodes[0];
      await tab.setMotion("no-preference");
      await tab.goto(url(node, "?desk3d=force"), "probe runtime-toggle");
      await tab.settle({ deskWait: true, deskMaxMs: 6000 });
      let s = await waitForDesk(["ready"], 4000);
      if (!(s && s.state === "ready")) {
        await tab.evaluate(`window.scrollTo(0, Math.max(0, Math.round((document.documentElement.scrollHeight - innerHeight) / 2)))`);
        s = await waitForDesk(["ready"], 4000);
      }
      const reached = Boolean(s && s.state === "ready");
      const probe = { name: "运行中切换：ready 后切 reduce，再切回 no-preference", node: node.key, kind: opts.domOnly ? "gate" : "positive", info: { before: briefStatus(s) }, assertions: [] };
      if (!opts.domOnly) probe.assertions.push(check("前提：force 下先达到 ready", reached, briefStatus(s)));
      if (reached) {
        const bookBefore = await tab.evaluate(`document.querySelectorAll(".desk-book").length`);
        const t0 = Date.now();
        await tab.setMotion("reduce");
        let removedAt = null; let polls = 0;
        while (Date.now() - t0 < 2000) {
          polls += 1;
          const n = await tab.evaluate(`document.querySelectorAll(".desk-book").length`);
          if (n === 0) { removedAt = Date.now() - t0; break; }
          await sleep(25);
        }
        const afterReduce = await tab.evaluate(pageExpr("const s = document.querySelector('.desk-switch'); return { desk: P_desk(), book: document.querySelectorAll('.desk-book').length, sw: document.querySelectorAll('.desk-switch').length, swVisible: Boolean(s && s.getClientRects().length) };"));
        probe.assertions.push(check("切到 reduce 后 .desk-book 当场移除（2 秒内）", removedAt !== null, { removedAfterMs: removedAt, bookBefore, polls }));
        probe.info.afterReduce = { status: briefStatus(afterReduce.desk), deskBook: afterReduce.book, deskSwitch: afterReduce.sw, deskSwitchVisible: afterReduce.swVisible, removedAfterMs: removedAt };
        const vendorBefore = tab.vendorRequests().length;
        await tab.setMotion("no-preference");
        await sleep(3000);
        const back = await tab.evaluate(pageExpr("return { desk: P_desk(), book: document.querySelectorAll('.desk-book').length, sw: document.querySelectorAll('.desk-switch').length };"));
        probe.info.afterRestore = { status: briefStatus(back.desk), deskBook: back.book, deskSwitch: back.sw, newVendorRequests: tab.vendorRequests().length - vendorBefore, note: "只记录，不设断言" };
      } else {
        probe.info.skipped = "未达到 ready，切换部分未执行";
      }
      await tab.setMotion("reduce");
      probes.push(probe);
    }
  }

  if (modeName === "narrow") {
    for (const node of probeNodes) {
      await tab.setViewport(1440, 900);
      const ctl = await control(node);
      await tab.setViewport(1000, 900);
      await tab.goto(url(node, "?desk3d=force"), `probe force+narrow ${node.key}`);
      await tab.settle({ deskWait: true });
      await sleep(1500);
      const { cap } = await snapshot();
      probes.push({ name: `force + 1000px 窄屏：${node.key}`, node: node.key, kind: "gate", control: ctl, info: { status: cap.meta.status, innerWidth: cap.meta.innerWidth }, assertions: [check("前提：视口确为 1000px", cap.meta.innerWidth === 1000, cap.meta.innerWidth), ...gateChecks(tab, cap)] });
    }
  }

  if (modeName === "off") {
    const node = probeNodes[0];
    await tab.goto(url(node, "?desk3d=off"), "probe off-param status");
    await tab.settle({});
    const { cap } = await snapshot();
    probes.push({ name: "?desk3d=off 的 status 记录（1.7.0 起 default 在 swiftshader 下会加载，所以这条「未加载」有了区分力）", node: node.key, kind: "gate", info: { status: cap.meta.status }, assertions: gateChecks(tab, cap) });
  }

  if (modeName === "off-ls") {
    /* 字面流程：force 打开（对照）→ 写 hb:desk3d=off → 重载 → 不得加载。 */
    for (const node of probeNodes) {
      await tab.setPrelude({ clear: true, presets: {} });
      const ctl = await control(node);
      await tab.setPrelude({ clear: false, presets: {} });
      await tab.evaluate(`localStorage.setItem("hb:desk3d", "off")`);
      await tab.reload(`probe force+ls-off reload ${node.key}`);
      await tab.settle({ deskWait: true });
      await sleep(1500);
      const { cap } = await snapshot();
      const stored = await tab.evaluate(`(() => { try { return localStorage.getItem("hb:desk3d"); } catch (e) { return "ERR"; } })()`);
      await tab.setPrelude({ clear: true, presets: MODES[modeName].presets });
      probes.push({ name: `force 打开 → 存 hb:desk3d=off → 重载：${node.key}`, node: node.key, kind: "gate", control: ctl, info: { status: cap.meta.status, storedAfterReload: stored, deskSwitch: cap.meta.deskSwitchCount }, assertions: [check("前提：重载后 hb:desk3d 仍为 off", stored === "off", stored), ...gateChecks(tab, cap)] });
    }
  }
  return probes;
}

/* ================= 突变自测：证明套件会咬人 ================= */
async function runMutation({ dir, nodes, baselineCaptures, cleanNodes }) {
  const chrome = await launchChrome("mutation-target");
  const tab = new Tab(chrome, "target", "default");
  try { await tab.init(); return await mutationCases({ tab, dir, nodes, baselineCaptures, cleanNodes }); }
  finally { await chrome.close(); }
}
async function mutationCases({ tab, dir, nodes, baselineCaptures, cleanNodes }) {
  const cases = [
    { id: "M1", name: "在 .reader-host 某段文字里改一个字", expect: "FAIL", fields: ["reader"], inject: `(() => {
        const host = document.querySelector(".reader-host");
        const walker = document.createTreeWalker(host, NodeFilter.SHOW_TEXT, { acceptNode: (n) => n.nodeValue.trim().length >= 6 ? 1 : 3 });
        const list = []; while (walker.nextNode()) list.push(walker.currentNode);
        if (!list.length) return null;
        const node = list[Math.floor(list.length / 2)];
        const v = node.nodeValue; const i = v.search(/\\S/) + 2; const ch = v[i] === "改" ? "动" : "改";
        node.nodeValue = v.slice(0, i) + ch + v.slice(i + 1);
        return { was: v.slice(Math.max(0, i - 8), i + 8), now: node.nodeValue.slice(Math.max(0, i - 8), i + 8) };
      })()` },
    { id: "M2", name: "往 .reader-host 注入一个 <div class=\"desk-book\">（不在允许位置）", expect: "FAIL", fields: ["reader"], inject: `(() => { document.querySelector(".reader-host").insertAdjacentHTML("beforeend", '<div class="desk-book" aria-hidden="true"><canvas width="8" height="8"></canvas></div>'); return true; })()` },
    { id: "M3", name: ".page-aside 末尾放两个 .desk-book（只允许一个）", expect: "FAIL", fields: ["pageAside"], inject: `(() => { const a = document.querySelector(".page-aside"); a.insertAdjacentHTML("beforeend", '<div class="desk-book" aria-hidden="true"><canvas></canvas></div><div class="desk-book" aria-hidden="true"><canvas></canvas></div>'); return true; })()` },
    { id: "M4", name: "把 .desk-switch 直接放在 .page-aside 下（不在 .aside-tools 里）", expect: "FAIL", fields: ["pageAside"], inject: `(() => { const a = document.querySelector(".page-aside"); a.insertAdjacentHTML("afterbegin", '<div class="desk-switch"><button type="button" data-desk-set="on">开</button><button type="button" data-desk-set="off">关</button></div>'); return true; })()` },
    { id: "M5", name: "对照：在约定位置放合法装饰（.page-aside 末尾 .desk-book + .aside-tools 内 .desk-switch / .mode-switch / .accent-switch）", expect: "PASS", fields: [], inject: `(() => {
        const a = document.querySelector(".page-aside"); const tools = a.querySelector(".aside-tools");
        if (!tools.querySelector(":scope > .desk-switch")) tools.insertAdjacentHTML("beforeend", '<div class="desk-switch"><span>案头手册</span><button type="button" data-desk-set="on" aria-pressed="true">开</button><button type="button" data-desk-set="off" aria-pressed="false">关</button></div>');
        if (!tools.querySelector(":scope > .mode-switch")) tools.insertAdjacentHTML("beforeend", '<div class="mode-switch"><span class="theme-switch-label">外观</span><div class="mode-seg" role="radiogroup"><button type="button" role="radio" data-mode-set="light" aria-checked="true">浅色</button></div></div>');
        if (!tools.querySelector(":scope > .accent-switch")) tools.insertAdjacentHTML("beforeend", '<div class="accent-switch"><span class="theme-switch-label">强调色</span><div class="accent-seg" role="group"><button type="button" data-accent-set="blue" aria-pressed="true" aria-label="蓝"><span class="accent-dot"></span><span class="accent-name">蓝</span></button></div></div>');
        if (!(a.lastElementChild && a.lastElementChild.classList.contains("desk-book"))) a.insertAdjacentHTML("beforeend", '<div class="desk-book" aria-hidden="true"><canvas width="210" height="200"></canvas></div>');
        return true;
      })()` },
    { id: "M6", name: "把 .accent-switch 放在 .aside-tools 之外（直接挂在 .page-aside 下）", expect: "FAIL", fields: ["pageAside"], inject: `(() => { const a = document.querySelector(".page-aside"); a.insertAdjacentHTML("afterbegin", '<div class="accent-switch"><span class="theme-switch-label">强调色</span><div class="accent-seg"><button type="button" data-accent-set="blue" aria-pressed="true" aria-label="蓝"><span class="accent-dot"></span><span class="accent-name">蓝</span></button></div></div>'); return true; })()` },
    { id: "M7", name: "在 .aside-tools 里放**第二个** .mode-switch（每种开关只允许一个）", expect: "FAIL", fields: ["pageAside"], inject: `(() => { const tools = document.querySelector(".page-aside .aside-tools"); tools.insertAdjacentHTML("beforeend", '<div class="mode-switch"><span class="theme-switch-label">外观</span><div class="mode-seg" role="radiogroup"><button type="button" role="radio" data-mode-set="dark" aria-checked="false">深色</button></div></div>'); return true; })()` },
    { id: "M8", name: "把 nav.tab-bar 挪进 .manual-shell（只允许 body 直属）", expect: "FAIL", fields: ["manualShell", "bodyHTML"], inject: `(() => { const bar = document.querySelector("body > nav.tab-bar"); const shell = document.querySelector(".manual-shell"); if (!bar || !shell) return null; shell.appendChild(bar); return true; })()` },
    { id: "M9", name: "把 img.brand-icon 放到 .brand 之外（塞进 .reader-host）", expect: "FAIL", fields: ["reader"], inject: `(() => { document.querySelector(".reader-host").insertAdjacentHTML("beforeend", '<img class="brand-icon" alt="" aria-hidden="true">'); return true; })()` },
  ];
  /* 选一个本身（未突变）已与基线一致、且有 .page-aside 的节点，免得对照组因真实回归而误判。 */
  const candidates = nodes.slice(Math.floor(nodes.length / 2)).concat(nodes.slice(0, Math.floor(nodes.length / 2)));
  const node = candidates.find((n) => baselineCaptures.nodes[n.key] && cleanNodes.has(n.key)) || candidates.find((n) => baselineCaptures.nodes[n.key]);
  if (!node) return { skipped: "没有可用的基线采集" };
  const base = baselineCaptures.nodes[node.key];
  const out = { node: node.key, nodeWasClean: cleanNodes.has(node.key), cases: [] };
  for (const c of cases) {
    await tab.goto(fileUrl(dir, "", `#/${node.key}/0`), `mutation ${c.id}`);
    await tab.settle({});
    const injected = await tab.evaluate(c.inject);
    await sleep(100);
    const cap = await tab.capture();
    const diffs = compareCaptures(base, cap, FIELDS);
    const verdict = diffs.length ? "FAIL" : "PASS";
    const fieldsHit = diffs.map((d) => d.field);
    const asExpected = verdict === c.expect && c.fields.every((f) => fieldsHit.includes(f));
    out.cases.push({ id: c.id, name: c.name, expect: c.expect, verdict, asExpected, injected, fieldsHit, firstDiff: diffs[0] || null });
  }
  return out;
}

/* ================= 计时（只报告不断言） ================= */
async function runTiming({ tab, dir, modeName, runs, waitReady }) {
  const rows = [];
  const url = fileUrl(dir, MODES[modeName].query, "");
  for (let i = 0; i < runs; i += 1) {
    await tab.goto(url, `timing ${i}`);
    const t = await tab.evaluate(`(() => { const n = performance.getEntriesByType("navigation")[0]; const m = performance.getEntriesByName("hb-first-render")[0]; const T = performance.timing; return { dcl: n ? n.domContentLoadedEventEnd : T.domContentLoadedEventEnd - T.navigationStart, load: n ? n.loadEventEnd : T.loadEventEnd - T.navigationStart, firstRender: m ? m.startTime : null }; })()`);
    if (waitReady) {
      const t0 = Date.now(); let s = null; let at = null;
      while (Date.now() - t0 < 10000) {
        s = await tab.evaluate(pageExpr("return { d: P_desk(), now: performance.now() };"));
        if (s.d && ["ready", "failed", "off"].includes(s.d.state)) { at = s.now; break; }
        await sleep(50);
      }
      t.readyState = s && s.d ? s.d.state : null;
      t.ready = at;
    }
    rows.push(t);
  }
  const pick = (k) => median(rows.map((r) => r[k]));
  return { runs: rows, median: { dcl: pick("dcl"), load: pick("load"), firstRender: pick("firstRender"), ready: waitReady ? pick("ready") : undefined } };
}

/* ================= 主流程 ================= */
async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) { process.stdout.write(readFileSync(path.join(HERE, "README.md"), "utf8")); return 0; }
  if (opts.baselineRef) extractBaseline(opts.baselineRef, opts.baseline, REPO_ROOT);
  if (!existsSync(path.join(opts.baseline, "index.html"))) {
    throw new Error([
      `基线目录里没有 index.html：${opts.baseline}`,
      "基线不在仓库里（17MB，且含手册内部资料），要用时现解。两条路：",
      "  1) 让套件自己解（推荐）——把改动前的那个提交给它，解出来放在工作目录里、可反复复用：",
      `     node ${path.relative(process.cwd(), path.join(HERE, "run.mjs")) || path.join(HERE, "run.mjs")} --baseline-ref <改动前的提交>`,
      "  2) 手工解一份再指过去：",
      `     mkdir -p ${opts.baseline} && git -C ${REPO_ROOT} archive <改动前的提交> | tar -x -C ${opts.baseline}`,
      `     node ${path.join(HERE, "run.mjs")} --baseline ${opts.baseline}`,
      "（3D 案头手册那一轮，改动前的提交是 84c5e4d。）",
    ].join("\n"));
  }
  if (!existsSync(path.join(opts.target, "index.html"))) throw new Error(`被测目录没有 index.html：${opts.target}`);
  const startedAt = new Date();
  const originalTarget = opts.target;
  if (opts.snapshot) { opts.target = snapshotTarget(opts.target); log(`已把被测目录快照到本地：${opts.target}`); }
  const hashesStart = hashFiles(opts.target);
  const statics = staticChecks(opts.target);
  log(`被测：${opts.target}\n基线：${opts.baseline}\n产物（profile / 快照 / 结果 JSON，均在仓库外）：${WORK}`);
  const report = { startedAt: startedAt.toISOString(), argv: process.argv.slice(2), target: opts.target, originalTarget, baseline: opts.baseline, work: WORK, modes: opts.modes, domOnly: opts.domOnly, keywords: KEYWORDS, statics, hashesStart, modeResults: {}, cleanNodes: new Set() };

  /* 节点枚举：两边各枚举一次并核对一致。 */
  const enumerate = async (dir, tag) => {
    const chrome = await launchChrome(`enum-${tag}`);
    try {
      const tab = new Tab(chrome, tag, "default"); await tab.init();
      await tab.goto(fileUrl(dir, "", ""), "enumerate");
      await tab.settle({});
      return await tab.evaluate(ENUM_EXPR);
    } finally { await chrome.close(); }
  };
  const allNodes = await enumerate(opts.baseline, "baseline");
  const targetNodes = await enumerate(opts.target, "target");
  const sameList = JSON.stringify(allNodes.map((n) => n.key)) === JSON.stringify(targetNodes.map((n) => n.key));
  report.nodeTotal = allNodes.length;
  report.nodeListsEqual = sameList;
  let nodes = allNodes;
  if (opts.nodes !== "all") {
    const n = Math.min(Number(opts.nodes), allNodes.length);
    nodes = Array.from({ length: n }, (_, k) => allNodes[Math.floor((k * allNodes.length) / n)]);
  }
  const probeNodes = allNodes.slice().sort((a, b) => b.len - a.len).slice(0, 3);
  report.nodesTested = nodes.map((n) => n.key);
  report.probeNodes = probeNodes.map((n) => ({ key: n.key, title: n.title, len: n.len }));
  log(`节点共 ${allNodes.length} 个（本次测 ${nodes.length} 个）；两边节点清单${sameList ? "一致" : "不一致！"}；长正文探针节点：${probeNodes.map((n) => `${n.key}(${n.len}字)`).join("、")}`);

  const dumpDir = opts.dump ? workPath("out", `${stamp()}-captures`) : null;
  if (dumpDir) mkdirSync(dumpDir, { recursive: true });

  for (const modeName of opts.modes) {
    log(`== 模式 ${modeName} ==`);
    const base = await runSide({ side: "baseline", dir: opts.baseline, modeName, nodes, opts, probeNodes, report });
    const test = await runSide({ side: "target", dir: opts.target, modeName, nodes, opts, probeNodes });
    const mr = { baseline: base.result, target: test.result, nodes: [], search: [] };
    for (const node of nodes) {
      const b = base.captures.nodes[node.key]; const t = test.captures.nodes[node.key];
      const diffs = b && t ? compareCaptures(b, t, FIELDS) : [{ field: "*", label: "采集缺失", index: 0 }];
      if (!diffs.length && modeName === "default") report.cleanNodes.add(node.key);
      const htmlAttrsDiff = b && t && b.meta.htmlAttrs !== t.meta.htmlAttrs ? { baseline: b.meta.htmlAttrs, target: t.meta.htmlAttrs } : null;
      mr.nodes.push({ key: node.key, title: node.title, pass: diffs.length === 0, diffs, htmlAttrsDiff, unstable: !(base.result.nodes[node.key].settle.stable && test.result.nodes[node.key].settle.stable) });
    }
    for (const kw of KEYWORDS) {
      const b = base.captures.search[kw]; const t = test.captures.search[kw];
      const diffs = b && t ? compareCaptures(b, t, SEARCH_FIELDS) : [{ field: "*", label: "采集缺失", index: 0 }];
      mr.search.push({ keyword: kw, pass: diffs.length === 0, diffs });
    }
    if (dumpDir) {
      writeFileSync(path.join(dumpDir, `${modeName}-baseline.json`), JSON.stringify(base.captures));
      writeFileSync(path.join(dumpDir, `${modeName}-target.json`), JSON.stringify(test.captures));
    }
    report.modeResults[modeName] = mr;
    printModeSummary(modeName, mr, opts);
    /* 突变自测：在被测上做运行时注入，拿 default 模式的基线采集比对，证明套件会咬人（结果单列）。 */
    if (modeName === "default" && opts.mutation) {
      log("== 突变自测 ==");
      report.mutation = await runMutation({ dir: opts.target, nodes, baselineCaptures: base.captures, cleanNodes: report.cleanNodes });
      for (const c of (report.mutation.cases || [])) log(`  ${c.asExpected ? "✓" : "✗"} ${c.id} 期望 ${c.expect} 实际 ${c.verdict} ${c.firstDiff ? `${c.firstDiff.label} @${c.firstDiff.index}` : ""}`);
    }
  }
  report.hashesEnd = hashFiles(opts.target);
  report.targetChangedDuringRun = Object.keys(report.hashesStart).filter((k) => report.hashesStart[k] !== report.hashesEnd[k]);
  report.finishedAt = new Date().toISOString();
  return finish(report, opts);
}

/* ================= 汇总 ================= */
function countAssertions(list) { let pass = 0; let fail = 0; for (const a of list) (a.ok ? pass++ : fail++); return { pass, fail }; }
function modeTallies(mr, opts) {
  const nodePass = mr.nodes.filter((n) => n.pass).length;
  const searchPass = mr.search.filter((s) => s.pass).length;
  const asserts = [];
  for (const e of Object.values(mr.target.nodes)) asserts.push(...e.assertions.map((a) => ({ ...a, where: e.key })));
  for (const e of Object.values(mr.target.search)) asserts.push(...e.assertions.map((a) => ({ ...a, where: `搜索:${e.keyword}` })));
  for (const e of Object.values(mr.baseline.nodes)) asserts.push(...e.assertions.map((a) => ({ ...a, where: `基线 ${e.key}` })));
  const targetErrors = mr.target.errors;
  asserts.push(check("被测零报错（异常 / console.error / Log error / 网络失败）", targetErrors.length === 0, targetErrors.length));
  const a = countAssertions(asserts);
  const probeAsserts = mr.target.probes.flatMap((p) => p.assertions.map((x) => ({ ...x, where: p.name })));
  const p = countAssertions(probeAsserts);
  return { nodePass, nodeTotal: mr.nodes.length, searchPass, searchTotal: mr.search.length, asserts, a, probeAsserts, p, targetErrors };
}
function printModeSummary(modeName, mr, opts) {
  const t = modeTallies(mr, opts);
  const unstable = mr.baseline.unstable.length + mr.target.unstable.length;
  const lines = [];
  lines.push(`[${modeName}] DOM 等价：节点 ${t.nodePass}/${t.nodeTotal}，搜索 ${t.searchPass}/${t.searchTotal} ｜ 断言 ${t.a.pass}/${t.a.pass + t.a.fail} ｜ 探针断言 ${t.p.pass}/${t.p.pass + t.p.fail} ｜ 报错 被测 ${t.targetErrors.length} / 基线 ${mr.baseline.errors.length} ｜ 不稳定采集 ${unstable}`);
  const failedNodes = mr.nodes.filter((n) => !n.pass).concat(mr.search.filter((s) => !s.pass));
  for (const n of failedNodes.slice(0, opts.maxDiffPrint)) {
    const d = n.diffs[0];
    lines.push(`    ✗ ${n.key ? `节点 ${n.key} ${n.title || ""}` : `搜索「${n.keyword}」`}：${n.diffs.map((x) => x.field).join(",")} 不等；首个差异 ${d.label} @${d.index}`);
    if (d.before !== undefined) {
      lines.push(`      前文…${JSON.stringify(d.before.slice(-80))}`);
      lines.push(`      基线→${JSON.stringify((d.baselineAfter || "").slice(0, 120))}`);
      lines.push(`      被测→${JSON.stringify((d.targetAfter || "").slice(0, 120))}`);
    }
  }
  if (failedNodes.length > opts.maxDiffPrint) lines.push(`    …另有 ${failedNodes.length - opts.maxDiffPrint} 处 DOM 差异见 JSON`);
  const failedAsserts = t.asserts.filter((a) => !a.ok);
  const grouped = new Map();
  for (const a of failedAsserts) { const g = grouped.get(a.name) || []; g.push(a); grouped.set(a.name, g); }
  for (const [name, list] of grouped) lines.push(`    ✗ 断言「${name}」失败 ${list.length} 处，例：${list[0].where} → ${JSON.stringify(list[0].detail).slice(0, 200)}`);
  for (const probe of mr.target.probes) {
    const bad = probe.assertions.filter((a) => !a.ok);
    const ctl = probe.control ? `；对照(force 去闸门) ${probe.control.state}${probe.control.ready ? " → 有区分力" : " → 无区分力"}` : "";
    lines.push(`    ${bad.length ? "✗" : "✓"} 探针「${probe.name}」${probe.assertions.length - bad.length}/${probe.assertions.length}${ctl}${bad.length ? `；失败：${bad.map((b) => `${b.name}=${JSON.stringify(b.detail).slice(0, 120)}`).join("；")}` : ""}`);
  }
  if (t.targetErrors.length) for (const e of t.targetErrors.slice(0, 5)) lines.push(`    ! 被测报错 [${e.kind}] ${String(e.text).slice(0, 200)} @ ${e.context}`);
  if (mr.baseline.errors.length) for (const e of mr.baseline.errors.slice(0, 3)) lines.push(`    · 基线本来就有 [${e.kind}] ${String(e.text).slice(0, 160)} @ ${e.context}`);
  log(lines.join("\n"));
}

function finish(report, opts) {
  const out = [];
  let ok = true;
  out.push("");
  out.push("================ 岗岗 3D 案头手册 A/B 回归汇总 ================");
  out.push(`被测：${report.target}${report.originalTarget !== report.target ? `（快照自 ${report.originalTarget}）` : ""}`);
  out.push(`基线：${report.baseline}`);
  out.push(`节点总数 ${report.nodeTotal}，本次测 ${report.nodesTested.length}；两边节点清单${report.nodeListsEqual ? "一致" : "不一致 ✗"}；关键词 ${KEYWORDS.length} 个：${KEYWORDS.join("、")}`);
  if (!report.nodeListsEqual) ok = false;
  const sc = report.statics.checks;
  if (!opts.domOnly) {
    const bad = sc.filter((c) => !c.ok);
    out.push(`静态检查（file:// 硬约束与交付物）：${sc.length - bad.length}/${sc.length} 通过${bad.length ? "；失败：" + bad.map((c) => c.name).join("；") : ""}`);
    if (bad.length) ok = false;
  } else out.push(`静态检查：--dom-only 下只记录不计入（${sc.filter((c) => c.ok).length}/${sc.length}）`);
  for (const [modeName, mr] of Object.entries(report.modeResults)) {
    const t = modeTallies(mr, opts);
    const probeCtl = mr.target.probes.filter((p) => p.control).map((p) => (p.control.ready ? "有" : "无"));
    const modeOk = t.nodePass === t.nodeTotal && t.searchPass === t.searchTotal && t.a.fail === 0 && t.p.fail === 0;
    if (!modeOk) ok = false;
    out.push(`[${modeName.padEnd(7)}] ${modeOk ? "通过" : "失败"} ｜ 节点 ${t.nodePass}/${t.nodeTotal} ｜ 搜索 ${t.searchPass}/${t.searchTotal} ｜ 断言 ${t.a.pass}/${t.a.pass + t.a.fail} ｜ 探针断言 ${t.p.pass}/${t.p.pass + t.p.fail}${probeCtl.length ? `（区分力：${probeCtl.join("")}）` : ""} ｜ 报错 被测${t.targetErrors.length}/基线${mr.baseline.errors.length} ｜ 不稳定 ${mr.baseline.unstable.length + mr.target.unstable.length}`);
  }
  const mut = report.mutation;
  if (opts.mutation) {
    if (!mut) { out.push("突变自测：未跑（需要 default 模式）"); }
    else if (mut.skipped) { out.push(`突变自测：跳过（${mut.skipped}）`); ok = false; }
    else {
      const good = mut.cases.filter((c) => c.asExpected).length;
      out.push(`突变自测（节点 ${mut.node}${mut.nodeWasClean ? "" : "，该节点未突变时本就有差异，对照组不可信"}）：${good}/${mut.cases.length} 符合预期`);
      for (const c of mut.cases) out.push(`   ${c.asExpected ? "✓" : "✗"} ${c.id} ${c.name}：期望 ${c.expect}，实际 ${c.verdict}${c.firstDiff ? `（${c.firstDiff.label} @${c.firstDiff.index}）` : ""}`);
      if (good !== mut.cases.length) ok = false;
    }
  }
  if (opts.timing) {
    for (const modeName of ["default", "force"]) {
      const mr = report.modeResults[modeName]; if (!mr) continue;
      const f = (tm) => (tm ? `DCL ${fmt(tm.median.dcl)} / load ${fmt(tm.median.load)} / 首次业务渲染 ${fmt(tm.median.firstRender)}${tm.median.ready !== undefined ? ` / 3D 就绪 ${fmt(tm.median.ready)}` : ""}` : "未测");
      out.push(`计时中位数 ms（${modeName}，各 ${opts.timingRuns} 次，只报告）：基线 ${f(mr.baseline.timing)} ｜ 被测 ${f(mr.target.timing)}`);
    }
    if (!report.target.startsWith(WORK) && report.baseline.startsWith(WORK)) out.push("  注：被测在 SMB 网络卷、基线在本地盘，计时差异含存储介质因素；要公平对比请加 --snapshot。");
  }
  if (report.targetChangedDuringRun.length) { out.push(`✗ 运行期间被测文件发生变化：${report.targetChangedDuringRun.join("、")} —— 本次结果不可信，请重跑或用 --snapshot`); ok = false; }
  const file = workPath("out", `${stamp()}.json`);
  mkdirSync(path.dirname(file), { recursive: true });
  const serializable = { ...report, cleanNodes: [...report.cleanNodes], verdict: ok ? "PASS" : "FAIL" };
  writeFileSync(file, JSON.stringify(serializable, null, 2));
  out.push(`结论：${ok ? "通过" : "失败"}（退出码 ${ok ? 0 : 1}）`);
  out.push(`明细：${file}`);
  process.stdout.write(out.join("\n") + "\n");
  return ok ? 0 : 1;
}
const fmt = (v) => (typeof v === "number" ? v.toFixed(0) : "—");

main().then((code) => process.exit(code), async (error) => {
  log(`运行中断：${error && error.stack ? error.stack : error}`);
  try { if (liveChrome) await liveChrome.close(); } catch { /* 忽略 */ }
  process.exit(2);
});
