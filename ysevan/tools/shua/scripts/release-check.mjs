/*
 * 发版前跑一次：导出 stats.json，并核对整张静态资源图（页面、离线缓存、容器、两份本机白名单、3D 按需模块）。
 *
 *   node scripts/release-check.mjs           # 重新生成 stats.json，再做核对
 *   node scripts/release-check.mjs --check   # 只核对不写文件（CI 用）：stats.json 过期也算失败
 *
 * ── 为什么要 stats.json ─────────────────────────────────────────────────────
 * 小屋主站的工具页上写着刷刷有几个题库、多少道题。那个数字以前是手抄的，
 * 2026-09 半个月里过期了两次（4475 → 4708 → 4877），每次都是刷刷发了版、主站没人跟。
 * 现在刷刷自己把数字导出成 stats.json，主站构建时从旁边这个目录读——数字只在这里
 * 产生一次，从题库文件实点出来，不从 CHANGELOG 抄。
 *
 * 两个系统之间的墙不破：主站运行时不访问刷刷（刷刷在 Authentik 后面），只在构建时
 * 读一个本地文件，读完的快照提交进主站自己的仓库。
 *
 * ── 为什么要核对三处 ────────────────────────────────────────────────────────
 * 新题库文件要同时进 index.html（页面加载）、sw.js（离线预缓存）、Dockerfile（容器复制）。
 * 2026-09-04 的 3.9.0 只进了前两处：容器里 404，而 sw.js 的 cache.addAll() 任一文件
 * 失败整个 Service Worker 就装不上，离线全废。本机 serve.mjs 直接读目录，看不出来，
 * 于是两周没人发现，直到 3.9.1 又漏了两个。
 *
 * ── 为什么要核对整张资源图、为什么 vendor 也要进 ───────────────────────────
 * 一个静态文件要在好几处同时登记才算真正发布了：index.html 或 effects.js 引用它，sw.js 缓存它
 * （FILES 预缓存或 ON_DEMAND 按需），Dockerfile 复制它，serve.mjs 与 serve.ps1 的白名单放行它。
 * 漏任何一处都只在某一种运行形态下坏——容器里 404、Windows 本机 404、离线打不开——而开发时
 * 用的那一种形态往往恰好是好的，所以只在自己机器上打开看看是查不出来的。
 * 查询串也必须逐字一致：页面请求 app.js?v=3.9.1&rev=5 而缓存里存的是 rev=4，离线时就找不到。
 *
 * vendor/ 是整目录复制进容器的，Dockerfile 那一处天然不漏，最容易漏的反而是其余几处：3D 用的
 * three、gsap 子集不在 index.html 里，是 effects-3d.js 用 import 拉进来的，只有顺着 import 核对
 * 才发现得了它们没进白名单或离线清单；反过来 vendor 里多出一个谁都不引用的文件，也会被原样
 * 打进容器。所以 vendor 下每个文件都必须在 FILES 或 ON_DEMAND 里有归属，再逐项过一遍上面几处。
 *
 * 3D 子集还有两个只在浏览器里才炸的坑，也在这里核对：场景 import 的 three 符号不在子集里
 * （模块链接失败，3D 静默退回 2D，控制台之外毫无征兆），以及许可注释被删（three 的 MIT、
 * GSAP 的标准许可都要求保留版权声明）。前者在 Node 里真的 import 子集取导出名。
 *
 * ── 3.11.1 起：3D 只发布一个 bundle ───────────────────────────────────────
 * effects-3d.js 与 vendor 下的 three、gsap 两个子集从此只是**构建输入**（BUILD_INPUTS），
 * 由 scripts/build-3d-vendor.mjs 打成经典脚本 effects-3d.bundle.js，只有它进离线清单、容器和
 * 两份白名单。原因是浏览器对 file:// 禁用 ES module，而屋主在手机上只能直接双击 index.html。
 * 所以核对三对 BUILD_INPUTS 网开一面（留在 vendor/ 不算孤儿），另加一组针对 bundle 的核对：
 * 存在、含两段许可注释、含全局名 __shuaFx3d、effects.js 的地址常量与 ON_DEMAND 逐字一致。
 *
 * stats.json 里故意不放生成时间：放了的话 --check 永远判「过期」。
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// 只参与构建、不发布的文件：不进 sw.js 清单、不进容器、不进白名单，也就不算 vendor/ 下的孤儿。
const BUILD_INPUTS = ["effects-3d.js", "vendor/three.subset.min.js", "vendor/gsap-core.min.js"];
const SCENE_PATH = "effects-3d.js";
const BUNDLE_PATH = "effects-3d.bundle.js";
const checkOnly = process.argv.includes("--check");
const failures = [];
const notes = [];
let checks = 0;

const read = (name) => readFileSync(join(root, name), "utf8");
const indexHtml = read("index.html");
const version = read("VERSION").trim();

function statOf(name) {
  try {
    return statSync(join(root, name));
  } catch {
    return null;
  }
}

const isFile = (name) => Boolean(statOf(name)?.isFile());
const isDirectory = (name) => Boolean(statOf(name)?.isDirectory());
const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function expect(condition, message) {
  checks += 1;
  if (!condition) failures.push(message);
  return condition;
}

// 清单里的地址 → 磁盘上的相对路径：去掉 ./ 和查询串；"./" 本身就是 index.html。
function pathOf(url) {
  const bare = url.replace(/^\.\//, "").replace(/[?#].*$/, "");
  try {
    return decodeURI(bare) || "index.html";
  } catch {
    return bare || "index.html";
  }
}

const asEntry = (url) => (url.startsWith("./") ? url : `./${url}`);

/* ── 页面资源：index.html 的本地脚本、样式表与清单，保留查询串 ─────────────── */

const isRemote = (url) => /^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith("//");
const pageResources = [
  ...[...indexHtml.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map((m) => m[1]),
  ...[...indexHtml.matchAll(/<link\b[^>]*>/g)]
    .filter((m) => /\brel="(?:stylesheet|manifest)"/.test(m[0]))
    .map((m) => m[0].match(/\bhref="([^"]+)"/)?.[1])
    .filter(Boolean)
].filter((url) => !isRemote(url));
const scripts = [...indexHtml.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)]
  .map((m) => m[1])
  .filter((url) => !isRemote(url))
  .map(pathOf);

/* ── sw.js 的两张清单 ──────────────────────────────────────────────────────── */

const swSource = read("sw.js");

function swList(name) {
  const match = swSource.match(new RegExp(`const ${name} = (\\[[^\\]]*\\]);`));
  if (!match) {
    failures.push(`sw.js 里找不到 const ${name} = [...]——本脚本靠它核对离线缓存，清单改名或拆行要同步改这里`);
    return [];
  }
  try {
    const list = JSON.parse(match[1]);
    if (Array.isArray(list) && list.every((item) => typeof item === "string")) return list;
  } catch {
    // 落到下面统一报错。
  }
  failures.push(`sw.js 的 ${name} 解析不了：它必须是一行双引号字符串数组，本脚本靠它核对离线缓存`);
  return [];
}

const precache = swList("FILES");
const onDemand = swList("ON_DEMAND");

/* ── Dockerfile 复制了什么（含 .dockerignore 排除） ─────────────────────────── */

const copiedFiles = new Set();
const copiedDirs = [];
for (const line of read("Dockerfile").replace(/\\\r?\n/g, " ").split(/\r?\n/)) {
  const tokens = line.trim().split(/\s+/);
  if (tokens[0] !== "COPY") continue;
  const args = tokens.slice(1).filter((token) => !token.startsWith("--"));
  for (const source of args.slice(0, -1)) {
    const clean = source.replace(/^\.\//, "");
    if (clean.endsWith("/") || isDirectory(clean)) copiedDirs.push(clean.replace(/\/?$/, "/"));
    else copiedFiles.add(clean);
  }
}

function globToRegExp(pattern) {
  const clean = pattern.replace(/^\/+/, "").replace(/\/+$/, "");
  let source = "";
  for (let index = 0; index < clean.length; index += 1) {
    const char = clean[index];
    if (char === "*" && clean[index + 1] === "*") {
      source += ".*";
      index += clean[index + 2] === "/" ? 2 : 1;
    } else if (char === "*") {
      source += "[^/]*";
    } else if (char === "?") {
      source += "[^/]";
    } else {
      source += escapeRegExp(char);
    }
  }
  // 排除一个目录就排除了它下面的一切。
  return new RegExp(`^${source}(?:/.*)?$`);
}

const dockerIgnore = isFile(".dockerignore")
  ? read(".dockerignore").split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith("#"))
    .map((line) => ({ negated: line.startsWith("!"), pattern: globToRegExp(line.replace(/^!/, "")) }))
  : [];

function dockerIgnored(path) {
  let ignored = false;
  for (const rule of dockerIgnore) {
    if (rule.pattern.test(path)) ignored = !rule.negated;
  }
  return ignored;
}

const dockerCopies = (path) => copiedFiles.has(path) || copiedDirs.some((dir) => path.startsWith(dir));

/* ── 两份本机白名单 ────────────────────────────────────────────────────────── */

const serveMjs = read("serve.mjs").match(/const publicFiles = new Set\(\[([\s\S]*?)\]\);/);
const mjsFiles = new Set(serveMjs ? [...serveMjs[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]) : []);
if (!serveMjs) failures.push("serve.mjs 里找不到 publicFiles 白名单——本脚本核对不了 macOS 本机启动会不会 404");
const servePs1 = read("serve.ps1").match(/\$publicFiles = @\{([\s\S]*?)\r?\n\}/);
const ps1Files = new Set(servePs1 ? [...servePs1[1].matchAll(/'([^']+)'\s*=\s*\$true/g)].map((m) => m[1]) : []);
if (!servePs1) failures.push("serve.ps1 里找不到 $publicFiles 白名单——本脚本核对不了 Windows 本机启动会不会 404");

/* ── 核对一：页面资源逐字进预缓存 ─────────────────────────────────────────── */

for (const url of pageResources) {
  const entry = asEntry(url);
  const samePath = precache.filter((item) => pathOf(item) === pathOf(url));
  expect(precache.includes(entry), samePath.length
    ? `index.html 请求的是 ${entry}，而 sw.js 的 FILES 里是 ${samePath.join("、")}——查询串不一致，离线时页面请求的地址在缓存里找不到，${pathOf(url)} 加载不出来`
    : `sw.js 没有预缓存 ${entry}——离线时这个${/\.css$/.test(pathOf(url)) ? "样式表" : "脚本"}加载不出来`);
}

/* ── 核对二：资源图里每个文件都在磁盘上、进了容器、进了两份白名单 ─────────── */

const resources = new Map();
function addResource(url, origin) {
  const path = pathOf(url);
  if (!resources.has(path)) resources.set(path, { path, origins: new Set(), urls: new Set() });
  resources.get(path).origins.add(origin);
  resources.get(path).urls.add(asEntry(url));
}
pageResources.forEach((url) => addResource(url, "index.html"));
precache.forEach((url) => addResource(url, "FILES"));
onDemand.forEach((url) => addResource(url, "ON_DEMAND"));

for (const { path, origins, urls } of resources.values()) {
  const lazy = origins.has("ON_DEMAND") && !origins.has("FILES") && !origins.has("index.html");
  const consequence = origins.has("FILES")
    ? "而 sw.js 预缓存它，cache.addAll() 任一文件 404 整个 Service Worker 就装不上，离线全废"
    : lazy
      ? "3D 按需加载时拿不到它，3D 永远退回 2D"
      : "页面加载它时 404";
  const listed = [...origins].map((origin) => (origin === "index.html" ? "index.html 引用了" : `sw.js 的 ${origin} 列了`)).join("、");
  expect(isFile(path), lazy
    ? `按需模块缺失：磁盘上没有 ${path}——sw.js 的 ON_DEMAND 列了它（${[...urls].join("、")}），3D 会去加载它；缺了它 3D 永远退回 2D`
    : `磁盘上没有 ${path}——${listed}它；${consequence}`);
  expect(dockerCopies(path), `Dockerfile 没有复制 ${path}——容器里会 404，${consequence}`);
  expect(!dockerIgnored(path), `.dockerignore 排除了 ${path}——Dockerfile 复制时它被静默跳过，容器里会 404，${consequence}`);
  expect(mjsFiles.has(path), `serve.mjs 的白名单 publicFiles 没有 ${path}——macOS 本机启动（打开刷刷.command）时它 404，${consequence}`);
  expect(ps1Files.has(path), `serve.ps1 的白名单 $publicFiles 没有 ${path}——Windows 本机启动（打开刷刷.bat）时它 404，${consequence}`);
}

/* ── 核对二半：PWA 清单由 theme.js 动态挂载，地址仍要在预缓存里 ─────────────── */

if (isFile("theme.js")) {
  const manifestUrl = read("theme.js").match(/\bvar\s+MANIFEST_URL\s*=\s*["']([^"']+)["']/)?.[1] ?? null;
  if (expect(manifestUrl !== null, "theme.js 里找不到 var MANIFEST_URL = \"…\"——3.11.1 起 <link rel=manifest> 由它按协议动态挂载，本脚本靠这个常量核对清单有没有进离线缓存")) {
    expect(precache.some((item) => pathOf(item) === pathOf(manifestUrl)),
      `theme.js 挂的 ${manifestUrl} 不在 sw.js 的 FILES 里——离线时取不到 PWA 清单`);
    expect(isFile(pathOf(manifestUrl)), `磁盘上没有 ${pathOf(manifestUrl)}——theme.js 会去挂它`);
  }
}

/* ── 核对三：vendor/ 下每个文件都有归属 ───────────────────────────────────── */

function listFiles(directory) {
  if (!isDirectory(directory)) return [];
  return readdirSync(join(root, directory), { withFileTypes: true })
    // .DS_Store、._* 之类系统文件不进仓库也不进容器（.gitignore / .dockerignore 已排除），不算孤儿。
    .filter((entry) => !entry.name.startsWith("."))
    .flatMap((entry) => (entry.isDirectory() ? listFiles(`${directory}/${entry.name}`) : [`${directory}/${entry.name}`]))
    .sort();
}

const vendorFiles = listFiles("vendor");
for (const file of vendorFiles) {
  // 构建输入留在 vendor/ 里是有意的：它们是 effects-3d.bundle.js 的原料，产物才发布。
  if (BUILD_INPUTS.includes(file)) continue;
  const origins = resources.get(file)?.origins;
  expect(Boolean(origins?.has("FILES") || origins?.has("ON_DEMAND")),
    `${file} 既不在 sw.js 的 FILES 也不在 ON_DEMAND 里——要么是没人用的孤儿（vendor/ 整目录复制，它会被原样打进容器），要么是漏了缓存（离线时加载不出来）；也就没人核对它有没有进两份本机白名单`);
}
for (const file of BUILD_INPUTS) {
  expect(isFile(file), `构建输入 ${file} 不在磁盘上——effects-3d.bundle.js 是从它打出来的，没有它就没法重新构建 3D`);
  const origins = resources.get(file)?.origins;
  expect(!origins, `${file} 只是构建输入，不该出现在 sw.js 的 FILES / ON_DEMAND 或 index.html 里——3.11.1 起 3D 只发布 ${BUNDLE_PATH} 一个文件`);
}

/* ── 核对四：按需模块图（effects.js → effects-3d.js → vendor） ──────────────── */

for (const url of onDemand) {
  expect(!precache.some((item) => pathOf(item) === pathOf(url)),
    `${url} 同时在 sw.js 的 ON_DEMAND 和 FILES 里——按需文件进了 install 预缓存，每台设备（包括根本不显示 3D 的）安装离线功能时都要白下载它`);
  expect(!pageResources.some((item) => pathOf(item) === pathOf(url)),
    `index.html 直接加载了按需文件 ${pathOf(url)}——它会在首屏就下载执行，不再是按需`);
}

let bundleUrl = null;
if (isFile("effects.js")) {
  const loader = read("effects.js");
  bundleUrl = loader.match(/\bconst\s+BUNDLE_URL\s*=\s*["']([^"']+)["']/)?.[1] ?? null;
  if (expect(bundleUrl !== null, "effects.js 里找不到 const BUNDLE_URL = \"…\"——本脚本靠它核对 3D 产物有没有进离线清单；改名要同步改这里")) {
    const samePath = onDemand.filter((item) => pathOf(item) === pathOf(bundleUrl));
    expect(onDemand.includes(bundleUrl), samePath.length
      ? `effects.js 加载的是 ${bundleUrl}，而 sw.js 的 ON_DEMAND 里是 ${samePath.join("、")}——两边必须逐字一致：版本参数只改了一边，离线缓存和这份核对管的就不是真正加载的那个地址`
      : `effects.js 加载的 ${bundleUrl} 不在 sw.js 的 ON_DEMAND 里——离线时它不在缓存里，3D 退回 2D；它也就没被核对有没有进容器和白名单`);
    expect(pathOf(bundleUrl) === BUNDLE_PATH, `effects.js 的 BUNDLE_URL 指向 ${pathOf(bundleUrl)}，但发布产物是 ${BUNDLE_PATH}`);
  }
  // 注释里提到 import() 是在解释为什么不用它，所以先把注释去掉再查真正的代码。
  const loaderCode = loader.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
  expect(!/\bimport\s*\(/.test(loaderCode), "effects.js 里还有 import(…)——3.11.1 起 3D 走 <script src> 注入的经典脚本，import() 在 file:// 下会直接抛错，屋主手机上就是 file://");
}
expect(onDemand.length === 1, `sw.js 的 ON_DEMAND 现在应该只有 ${BUNDLE_PATH} 一项，实际有 ${onDemand.length} 项：${onDemand.join("、")}——三个 3D 文件已经打成一个 bundle`);

function resolveSpecifier(importer, specifier) {
  const base = new URL(importer, "https://shua.invalid/");
  const target = new URL(specifier, base);
  if (target.origin !== base.origin) return null;
  return `./${decodeURI(target.pathname.slice(1))}${target.search}`;
}

function importedNames(clause, source) {
  const names = new Set();
  if (!clause) return names;
  const braces = clause.match(/\{([^}]*)\}/);
  if (braces) {
    for (const part of braces[1].split(",")) {
      const name = part.trim().split(/\s+as\s+/)[0].trim();
      if (name) names.add(name);
    }
  }
  for (const part of clause.replace(/\{[^}]*\}/, "").split(",").map((item) => item.trim()).filter(Boolean)) {
    const namespace = part.match(/^\*\s*as\s+([\w$]+)$/);
    if (namespace) {
      for (const use of source.matchAll(new RegExp(`\\b${escapeRegExp(namespace[1])}\\.([A-Za-z_$][\\w$]*)`, "g"))) names.add(use[1]);
    } else if (/^[\w$]+$/.test(part)) {
      names.add("default");
    }
  }
  return names;
}

// 只认语句开头的静态 import / export … from；绑定部分的字符集跨不过分号、括号和引号，
// 所以不会把字符串或动态 import() 误当成依赖。
function staticImports(source) {
  const pattern = /(?:^|[;}])\s*(import|export)\s*(?:([\w$*{},\s]+?)\s*from\s*)?(["'])([^"'\n]+)\3/gm;
  return [...source.matchAll(pattern)].map((m) => ({ specifier: m[4], names: importedNames(m[2], source) }));
}

// 场景与两个子集现在只是构建输入，不上线；但它们之间的 import 仍然必须对得上，
// 否则下一次 build-3d-vendor.mjs 会打出一个链接不起来的 bundle。
const modulePath = SCENE_PATH;
const sceneImports = [];
if (isFile(modulePath)) {
  for (const item of staticImports(read(modulePath))) {
    const relative = /^(?:\.{1,2}\/|\/)/.test(item.specifier);
    const resolved = relative ? resolveSpecifier(`./${modulePath}`, item.specifier) : null;
    if (!expect(resolved !== null, relative
      ? `${modulePath} import 了跨域地址 "${item.specifier}"——打包时解析不到`
      : `${modulePath} import 了裸模块名 "${item.specifier}"——刷刷是零依赖静态站，打包时解析不到`)) continue;
    expect(BUILD_INPUTS.includes(pathOf(resolved)),
      `${modulePath} import 了 "${item.specifier}"（解析为 ${resolved}），但它不在 BUILD_INPUTS 里——要么路径写错，要么新增了依赖却没登记，构建会失败`);
    sceneImports.push({ ...item, resolved });
  }
}

/* ── 核对五：第三方许可注释 ───────────────────────────────────────────────── */

const LICENSES = [
  { path: "vendor/three.subset.min.js", needles: ["@license", "Three.js Authors", "Permission is hereby granted"], why: "three.js 以 MIT 发布，随刷刷分发就必须保留版权与许可声明" },
  { path: "vendor/gsap-core.min.js", needles: ["@license", "GreenSock", "gsap.com/standard-license"], why: "GreenSock 标准许可明文禁止删改它的版权声明" },
  // 真正随刷刷分发的是 bundle：两段许可必须都在它里面。
  { path: BUNDLE_PATH, needles: ["@license", "Three.js Authors", "Permission is hereby granted", "GreenSock", "gsap.com/standard-license", "__shuaFx3d"], why: "它是唯一会被分发的 3D 文件，three 的 MIT 与 GreenSock 的版权声明都必须随它走；__shuaFx3d 是 effects.js 取场景的全局名" }
];

for (const { path, needles, why } of LICENSES) {
  if (!expect(isFile(path), `缺少 ${path}——3D 点缀依赖它；用 scripts/build-3d-vendor.mjs 生成`)) continue;
  const text = read(path);
  for (const needle of needles) {
    expect(text.includes(needle), `${path} 缺少「${needle}」——${why}；用 scripts/build-3d-vendor.mjs 重新生成，不要手改，也不要换别的压缩工具`);
  }
}

/* ── 核对六：场景用到的符号都在子集里 ─────────────────────────────────────── */

const exportCache = new Map();
async function exportsOf(path) {
  if (!exportCache.has(path)) {
    try {
      exportCache.set(path, new Set(Object.keys(await import(pathToFileURL(join(root, path)).href))));
    } catch (error) {
      failures.push(`${path} 在 Node 里 import 失败：${error.message}——浏览器链接这个模块同样会失败，3D 静默退回 2D`);
      exportCache.set(path, null);
    }
  }
  return exportCache.get(path);
}

const THREE_PATH = "vendor/three.subset.min.js";
const GSAP_PATH = "vendor/gsap-core.min.js";
let symbolCount = 0;

if (isFile(GSAP_PATH)) {
  const gsapExports = await exportsOf(GSAP_PATH);
  if (gsapExports) expect(gsapExports.has("gsap"), `${GSAP_PATH} 没有导出 gsap——场景按名字 import 它，模块链接会失败，3D 静默退回 2D`);
}

for (const item of sceneImports) {
  const path = pathOf(item.resolved);
  if (!/\.m?js$/.test(path) || !isFile(path) || item.names.size === 0) continue;
  const exported = await exportsOf(path);
  if (!exported) continue;
  for (const name of item.names) {
    symbolCount += 1;
    expect(exported.has(name), `${modulePath} 从 ${path} import 了 ${name}，但它不在导出里——浏览器链接模块时就报错，3D 静默退回 2D${path === THREE_PATH ? "；把它加进 scripts/build-3d-vendor.mjs 的 THREE_EXPORTS 再重新生成子集" : ""}`);
  }
}

const threeImports = sceneImports.filter((item) => pathOf(item.resolved) === THREE_PATH);
if (threeImports.length && isFile(THREE_PATH)) {
  const threeExports = await exportsOf(THREE_PATH);
  const used = new Set(threeImports.flatMap((item) => [...item.names]));
  const unused = threeExports ? [...threeExports].filter((name) => !used.has(name)).sort() : [];
  if (unused.length) {
    notes.push(`提示：${THREE_PATH} 导出了 ${threeExports.size} 个符号，其中 ${unused.join("、")} 没被 ${modulePath} 用到——可以从 scripts/build-3d-vendor.mjs 的 THREE_EXPORTS 删掉以减小体积（不算失败）`);
  }
}

/* ── 实点题库 ───────────────────────────────────────────────────────────── */

const bankFiles = scripts.filter((src) => /questions\.js$/.test(src));
const banks = [];

for (const file of bankFiles) {
  const win = {};
  try {
    vm.runInContext(read(file), vm.createContext({ window: win, self: win }), { filename: file });
  } catch (error) {
    failures.push(`${file} 无法求值：${error.message}`);
    continue;
  }
  for (const [name, value] of Object.entries(win)) {
    // 题库是「元素带 type 字段的数组」；同文件里的 *_META 对象不算。
    if (Array.isArray(value) && value.length > 0 && value[0] && typeof value[0] === "object" && "type" in value[0]) {
      const byType = {};
      for (const question of value) {
        byType[question.type] = (byType[question.type] ?? 0) + 1;
      }
      banks.push({ file, global: name, questions: value.length, byType });
    }
  }
}

if (banks.length === 0) {
  failures.push("一个题库都没点到——index.html 的脚本清单或题库文件的挂载方式变了，先查这个脚本");
}

const stats = {
  generatedBy: "scripts/release-check.mjs（勿手改，发版时重新生成）",
  version,
  banks: banks.length,
  questions: banks.reduce((sum, bank) => sum + bank.questions, 0),
  byBank: banks
};
const serialized = `${JSON.stringify(stats, null, 2)}\n`;

let current = null;
try {
  current = read("stats.json");
} catch {
  current = null;
}

if (checkOnly) {
  if (current !== serialized) {
    failures.push("stats.json 已过期（或不存在）：先跑 node scripts/release-check.mjs 重新生成再提交");
  }
} else if (current !== serialized) {
  writeFileSync(join(root, "stats.json"), serialized, "utf8");
  console.log(`已写入 stats.json：v${version} · ${stats.banks} 个题库 · ${stats.questions} 道题`);
} else {
  console.log(`stats.json 已是最新：v${version} · ${stats.banks} 个题库 · ${stats.questions} 道题`);
}

for (const note of notes) console.log(note);

if (failures.length > 0) {
  console.error(`发布核对失败，共 ${failures.length} 项：`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`核对通过，共 ${checks} 项：页面资源 ${pageResources.length} 个都已逐字进 sw.js 预缓存；资源图 ${resources.size} 个文件（预缓存 ${precache.length} 项、按需 ${onDemand.length} 项、vendor/ 下 ${vendorFiles.length} 个）都在磁盘上、进了 Dockerfile 与 serve.mjs / serve.ps1 白名单；3D 模块图 ${sceneImports.length} 条 import、${symbolCount} 个符号与两份许可注释均已核对。`);
