// 刷刷 v3.12.0 — macOS / Node.js 本地静态服务
// 只暴露运行刷刷所需的白名单文件，不提供目录浏览。

import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { networkInterfaces } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.dirname(fileURLToPath(import.meta.url));
const defaultPort = 8765;
const publicFiles = new Set([
  "index.html",
  "theme.js",
  "styles.css",
  "project.js",
  "app.js",
  "effects.js",
  // 3.11.2 起 3D 只发布这一个经典脚本 bundle；effects-3d.js 与 vendor 下的 three、gsap 子集只是构建输入。
  "effects-3d.bundle.js",
  "vendor/xlsx-import.js",
  "questions.js",
  "annual-inspection-2026-questions.js",
  "annual-inspection-2026-comparison.js",
  "domestic-settlement-questions.js",
  "bill-finance-questions.js",
  "bank-acceptance-questions.js",
  "counterfeit-currency-2023-questions.js",
  "foreign-exchange-2026-questions.js",
  "warning-education-sanming-questions.js",
  "fx-level-one-questions.js",
  "manifest.webmanifest",
  "sw.js",
  "robots.txt",
  "vendor/lucide.min.js",
  "assets/brand/brand-icon.svg",
  // png 是可选的备选 logo：白名单里有、磁盘上没有时正常回 404，页面按回落链换下一档。
  "assets/brand/brand-icon.png",
  "assets/刷刷题库导入模板.xlsx"
]);
const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
  [".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".svg", "image/svg+xml"],
  [".ico", "image/x-icon"],
  [".txt", "text/plain; charset=utf-8"]
]);

function parseOptions(argumentsList) {
  let port = defaultPort;
  let openBrowser = true;

  for (let index = 0; index < argumentsList.length; index += 1) {
    const argument = argumentsList[index];
    if (argument === "--no-browser") {
      openBrowser = false;
      continue;
    }
    if (argument === "--port") {
      port = Number(argumentsList[index + 1]);
      index += 1;
      continue;
    }
    throw new Error(`未知参数：${argument}`);
  }

  if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    throw new Error("端口必须是 1024 至 65535 之间的整数。");
  }

  return { openBrowser, port };
}

function securityHeaders(contentType, contentLength) {
  return {
    "Cache-Control": "no-cache",
    "Content-Length": String(contentLength),
    "Content-Security-Policy": "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
    "Content-Type": contentType,
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet"
  };
}

function send(response, statusCode, contentType, body, headOnly = false) {
  response.writeHead(statusCode, securityHeaders(contentType, body.length));
  response.end(headOnly ? undefined : body);
}

function requestedFile(requestUrl) {
  const pathname = new URL(requestUrl ?? "/", "http://localhost").pathname;
  const decoded = decodeURIComponent(pathname).replace(/^\/+/, "");
  const relativePath = decoded || "index.html";

  if (relativePath.includes("\\") || relativePath.includes("\0") || !publicFiles.has(relativePath)) {
    return null;
  }
  return relativePath;
}

function openUrl(url) {
  const command = process.platform === "darwin" ? "open" : process.platform === "win32" ? "cmd" : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];
  const child = spawn(command, args, { detached: true, stdio: "ignore", windowsHide: true });
  child.on("error", () => {
    console.warn(`浏览器没有自动打开，请手动访问：${url}`);
  });
  child.unref();
}

function privateIpv4Addresses() {
  const addresses = [];
  for (const [name, entries] of Object.entries(networkInterfaces())) {
    for (const entry of entries ?? []) {
      if (entry.family !== "IPv4" || entry.internal) continue;
      const [a, b] = entry.address.split(".").map(Number);
      const isPrivate = a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
      if (isPrivate) addresses.push({ address: entry.address, name });
    }
  }
  return addresses.sort((left, right) => left.address.localeCompare(right.address));
}

const { openBrowser, port } = parseOptions(process.argv.slice(2));
const localUrl = `http://localhost:${port}/`;
const server = createServer(async (request, response) => {
  const headOnly = request.method === "HEAD";
  if (request.method !== "GET" && !headOnly) {
    send(response, 405, "text/plain; charset=utf-8", Buffer.from("Method not allowed"));
    return;
  }

  let relativePath;
  try {
    relativePath = requestedFile(request.url);
  } catch {
    send(response, 400, "text/plain; charset=utf-8", Buffer.from("Bad request"), headOnly);
    return;
  }

  if (!relativePath) {
    send(response, 404, "text/plain; charset=utf-8", Buffer.from("Not found"), headOnly);
    return;
  }

  try {
    const body = await readFile(path.join(appRoot, relativePath));
    const contentType = mimeTypes.get(path.extname(relativePath).toLowerCase()) ?? "application/octet-stream";
    send(response, 200, contentType, body, headOnly);
  } catch {
    send(response, 404, "text/plain; charset=utf-8", Buffer.from("Not found"), headOnly);
  }
});

server.on("clientError", (_error, socket) => {
  socket.end("HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n");
});

server.on("error", async (error) => {
  if (error.code === "EADDRINUSE") {
    try {
      const response = await fetch(localUrl, { signal: AbortSignal.timeout(2_000) });
      const content = await response.text();
      if (response.ok && content.includes("<title>刷刷</title>")) {
        console.log("刷刷已经在运行，正在打开页面……");
        if (openBrowser) openUrl(localUrl);
        process.exit(0);
      }
    } catch {
      // 端口被非 HTTP 服务占用时走下面的明确错误。
    }
    console.error(`端口 ${port} 已被其他程序占用，刷刷无法启动。`);
    process.exit(1);
  }
  console.error(`刷刷启动失败：${error.message}`);
  process.exit(1);
});

server.listen(port, "0.0.0.0", () => {
  console.log("");
  console.log("刷刷已启动");
  console.log(`电脑访问：${localUrl}`);
  const addresses = privateIpv4Addresses();
  if (addresses.length) {
    console.log("");
    console.log("手机 / 平板访问地址（与电脑连接同一 Wi-Fi）：");
    for (const { address, name } of addresses) console.log(`  http://${address}:${port}/  [${name}]`);
  }
  console.log("");
  console.log("使用期间请保持此窗口开启；按 Ctrl+C 或关闭窗口即可停止刷刷。");
  if (openBrowser) openUrl(localUrl);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
