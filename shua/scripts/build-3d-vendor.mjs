/*
 * 生成 3D 点缀要发布的那个文件。场景代码改了就得重跑一次（它会被打进产物），
 * 升级 three / gsap 或增减 three 符号时同理；产物连同本脚本的改动一起提交。
 *
 *   node scripts/build-3d-vendor.mjs --modules <目录>
 *
 * 产物：
 *   vendor/three.subset.min.js   three 按需子集（ES module，只含 THREE_EXPORTS 里的符号）——构建输入，不发布
 *   vendor/gsap-core.min.js      GSAP 核心（ES module，不含 CSSPlugin 与任何插件）——构建输入，不发布
 *   effects-3d.bundle.js         上面两个 + effects-3d.js 打成一个**经典脚本**（IIFE），唯一要发布的 3D 文件
 *
 * ── 为什么要打成经典脚本 ─────────────────────────────────────────────────
 * 屋主在手机上只能直接双击 index.html（file:// 地址）。浏览器对 file:// 禁用 ES module
 * （跨源限制，动态 import() 直接抛错），原来 effects.js 用 import() 加载场景模块，file:// 下必然失败，
 * 所以 3.11.1 之前干脆在 blockedReason() 里把 file: 判成不支持。3.11.1 起改成一个 IIFE bundle，
 * 由 effects.js 用 <script src> 注入——经典脚本在 file:// 下照常执行，http 与 file:// 走同一条路，
 * 不维护两套。全局名 __shuaFx3d 暴露 createFx。离线仍然不可用（file:// 没有 Service Worker），
 * 但 3D、刷题、统计、备份都在。
 *
 * <目录> 下要有 node_modules/three、node_modules/gsap、node_modules/esbuild，版本与下面的常量一致。
 * 找一个**本机磁盘**上的临时目录装：
 *
 *   npm i --no-save three@0.186.0 gsap@3.15.0 esbuild@0.28.1
 *
 * 不要装进刷刷目录，也不要装在网络卷上：刷刷是零依赖静态站，没有 package.json；
 * 网络卷上的 node_modules 会被另一个平台的 npm install 清掉平台二进制（esbuild 首当其冲）。
 *
 * ── 为什么自己打包，不直接拷 three 的发行文件 ─────────────────────────────
 * 0.186 的发行文件只有未压缩的 three.core.js + three.module.js，共 2.1 MB。整包压缩后
 * 742 KB（gzip 189 KB），按需子集（17 个符号）547 KB（gzip 140 KB）。GSAP 只取核心：场景只补间普通
 * 对象，用不到操作 DOM 样式的 CSSPlugin。
 *
 * ── 许可 ─────────────────────────────────────────────────────────────────
 * three 是 MIT；GSAP 是 GreenSock 标准免费许可，条款禁止删改它的版权声明。
 * esbuild 的 legalComments: "inline" 会原样保留两者源码里的 @license 注释；文件头再加一段
 * 来源说明（three 那份附 MIT 全文）。scripts/release-check.mjs 会核对这些注释仍在。
 *
 * ── 改符号清单 ───────────────────────────────────────────────────────────
 * effects-3d.js 从子集里 import 的每个名字都必须在 THREE_EXPORTS 里，否则浏览器在链接模块时
 * 就报错，3D 静默退回 2D。release-check.mjs 会在 Node 里真的 import 子集来核对这一点。
 * 清单只放用到的符号：每多导出一个，没用上的代码也会被打进来。
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const THREE_VERSION = "0.186.0";
const GSAP_VERSION = "3.15.0";
const ESBUILD_VERSION = "0.28.1";

export const THREE_EXPORTS = [
  "CanvasTexture",
  "Color",
  "CubicBezierCurve",
  "DoubleSide",
  "ExtrudeGeometry",
  "Group",
  "Mesh",
  "PerspectiveCamera",
  "PlaneGeometry",
  "RedFormat",
  "Scene",
  "ShaderMaterial",
  "Shape",
  "Vector2",
  "Vector3",
  "Vector4",
  "WebGLRenderer"
];

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function option(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}

const modulesDir = option("--modules");
if (!modulesDir) fail("用法：node scripts/build-3d-vendor.mjs --modules <装了 three、gsap、esbuild 的目录>");
const base = resolve(modulesDir);
const requireFromBase = createRequire(join(base, "package.json"));

function installedVersion(name) {
  try {
    return JSON.parse(readFileSync(join(base, "node_modules", name, "package.json"), "utf8")).version;
  } catch {
    return null;
  }
}

for (const [name, expected] of [["three", THREE_VERSION], ["gsap", GSAP_VERSION], ["esbuild", ESBUILD_VERSION]]) {
  const actual = installedVersion(name);
  if (actual !== expected) fail(`${name} 版本不对：要 ${expected}，${base} 里是 ${actual ?? "没装"}`);
}

const esbuild = requireFromBase("esbuild");
const threeLicense = readFileSync(join(base, "node_modules", "three", "LICENSE"), "utf8").trim();

const banners = {
  three: [
    "/*!",
    ` * 刷刷 3D 点缀用的 three.js 按需子集：three@${THREE_VERSION}，共 ${THREE_EXPORTS.length} 个符号。`,
    " * 由 scripts/build-3d-vendor.mjs 用 esbuild 打包，未改动 three 的代码；",
    " * 下文的 @license 注释为 three.js 原文。three.js 以 MIT 许可发布，全文如下：",
    " *",
    ...threeLicense.split(/\r?\n/).map((line) => (line ? ` * ${line}` : " *")),
    " */"
  ].join("\n"),
  gsap: [
    "/*!",
    ` * 刷刷 3D 点缀用的 GSAP 核心：gsap@${GSAP_VERSION} 的 gsap-core.js（不含 CSSPlugin 与插件）。`,
    " * 由 scripts/build-3d-vendor.mjs 用 esbuild 重新打包为 ES module，未改动 GSAP 的代码；",
    " * 下文 GreenSock 的 @license 版权声明为原文，使用条款见 https://gsap.com/standard-license",
    " */"
  ].join("\n")
};

async function bundle(contents, sourcefile, banner, outfile) {
  const result = await esbuild.build({
    stdin: { contents, resolveDir: base, sourcefile, loader: "js" },
    bundle: true,
    format: "esm",
    minify: true,
    target: "es2020",
    charset: "utf8",
    legalComments: "inline",
    banner: { js: banner },
    write: false,
    logLevel: "silent"
  });
  const text = `${result.outputFiles[0].text.replace(/\r\n/g, "\n").trimEnd()}\n`;
  writeFileSync(join(root, outfile), text, "utf8");
  const bytes = Buffer.byteLength(text);
  console.log(`${outfile}：${(bytes / 1024).toFixed(1)} KB，gzip ${(gzipSync(text, { level: 9 }).length / 1024).toFixed(1)} KB`);
  return text;
}

const three = await bundle(
  `export { ${THREE_EXPORTS.join(", ")} } from "three";\n`,
  "three-subset-entry.js",
  banners.three,
  "vendor/three.subset.min.js"
);
const gsap = await bundle(
  'export { gsap, gsap as default } from "gsap/gsap-core.js";\n',
  "gsap-core-entry.js",
  banners.gsap,
  "vendor/gsap-core.min.js"
);

if (!/@license[\s\S]{0,80}Three\.js Authors/.test(three)) fail("three 子集里没找到 three.js 的 @license 注释，打包参数可能变了");
if (!three.includes("Permission is hereby granted")) fail("three 子集的文件头缺 MIT 许可全文");
if (!/@license[\s\S]{0,120}GreenSock/.test(gsap) || !gsap.includes("gsap.com/standard-license")) fail("gsap 核心里没找到 GreenSock 的 @license 注释，打包参数可能变了");

/* ── 发布产物：场景 + 两个子集打成一个经典脚本 ─────────────────────────────
   resolveDir 是仓库根：入口里的 "./effects-3d.js" 和它 import 的两个 vendor 文件都按根解析。
   format: "iife" + globalName 让产物在经典脚本里执行完把 createFx 挂到 window.__shuaFx3d。
   legalComments: "inline" 让两个子集文件头的 @license（含 MIT 全文）原样进产物。 */
const bundleResult = await esbuild.build({
  stdin: { contents: 'export { createFx } from "./effects-3d.js";\n', resolveDir: root, sourcefile: "effects-3d-bundle-entry.js", loader: "js" },
  bundle: true,
  format: "iife",
  globalName: "__shuaFx3d",
  minify: true,
  target: "es2020",
  charset: "utf8",
  legalComments: "inline",
  banner: { js: [
    "/*!",
    " * 刷刷 3D 点缀的发布产物：effects-3d.js（场景）+ three 按需子集 + GSAP 核心，",
    " * 由 scripts/build-3d-vendor.mjs 用 esbuild 打成一个经典脚本（IIFE），全局名 __shuaFx3d。",
    " * 勿手改：改场景请改 effects-3d.js 后重跑构建脚本。下文的 @license 注释为第三方原文。",
    " */"
  ].join("\n") },
  write: false,
  logLevel: "silent"
});
const bundleText = `${bundleResult.outputFiles[0].text.replace(/\r\n/g, "\n").trimEnd()}\n`;
writeFileSync(join(root, "effects-3d.bundle.js"), bundleText, "utf8");
const bundleBytes = Buffer.byteLength(bundleText);
console.log(`effects-3d.bundle.js：${(bundleBytes / 1024).toFixed(1)} KB，gzip ${(gzipSync(bundleText, { level: 9 }).length / 1024).toFixed(1)} KB`);

if (!/@license[\s\S]{0,80}Three\.js Authors/.test(bundleText)) fail("产物里没找到 three.js 的 @license 注释");
if (!bundleText.includes("Permission is hereby granted")) fail("产物里缺 three 的 MIT 许可全文");
if (!/@license[\s\S]{0,120}GreenSock/.test(bundleText) || !bundleText.includes("gsap.com/standard-license")) fail("产物里没找到 GreenSock 的 @license 注释");
if (!bundleText.includes("__shuaFx3d")) fail("产物里没有全局名 __shuaFx3d，globalName 参数可能变了");

console.log("完成：两段许可注释都在，产物挂在 window.__shuaFx3d。记得跑 node scripts/release-check.mjs。");
