// 刷刷 v3.12.0 | Author: Ysevan | 仅限内部学习使用
const CACHE = "zongfu-quiz-v66";
const FILES = ["./", "./index.html", "./theme.js?v=3.12.0", "./styles.css?v=3.12.0&rev=5", "./project.js?v=3.12.0", "./effects.js?v=3.12.0", "./app.js?v=3.12.0&rev=6", "./questions.js?v=3.12.0", "./annual-inspection-2026-questions.js?v=3.12.0", "./annual-inspection-2026-comparison.js?v=3.12.0", "./domestic-settlement-questions.js?v=3.12.0", "./bill-finance-questions.js?v=3.12.0", "./bank-acceptance-questions.js?v=3.12.0", "./counterfeit-currency-2023-questions.js?v=3.12.0", "./foreign-exchange-2026-questions.js?v=3.12.0&rev=2", "./warning-education-sanming-questions.js?v=3.12.0&rev=2", "./fx-level-one-questions.js?v=3.12.0", "./manifest.webmanifest", "./vendor/lucide.min.js", "./vendor/xlsx-import.js?v=3.12.0&rev=1", "./assets/brand/brand-icon.svg", "./assets/刷刷题库导入模板.xlsx"];
// 3D 点缀按需加载的那一个 bundle，故意不进 install 预缓存：不拖慢离线安装，也不让减弱动效、低端设备白下载。
// 够格的设备加载成功后，effects.js 发 shua-fx-warm 消息，由下面的 message 处理器补进缓存，之后离线也有 3D。
// 只靠 fetch 处理器不够：首次访问时页面还没被 Service Worker 接管，那一次加载不经过这里。
// 这个文件内容有任何变化也必须递增 CACHE，否则旧缓存会继续供旧文件。
const ON_DEMAND = ["./effects-3d.bundle.js?v=3.12.0"];
const ON_DEMAND_URLS = new Set(ON_DEMAND.map((path) => new URL(path, self.registration.scope).href));
// 离线且从没缓存过 3D 时给按需文件的占位脚本。回 index.html 的话浏览器会按 MIME 报红色错误；
// effects.js 看到这个标记就安静地回 2D。3.11.2 起按需文件是经典脚本（不是 ES module），
// 占位里写 export 会当场语法错误，所以改成直接挂全局对象。
const OFFLINE_MODULE = "window.__shuaFx3d = { shuaOffline: true };\n";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "shua-fx-warm") return;
  event.waitUntil(caches.open(CACHE).then(async (cache) => {
    for (const path of ON_DEMAND) {
      if (!(await cache.match(path))) await cache.add(path);
    }
  }).catch(() => {}));
});

function offlineResponse(request) {
  if (request.mode !== "navigate" && ON_DEMAND_URLS.has(request.url)) {
    return new Response(OFFLINE_MODULE, { status: 200, headers: { "Content-Type": "text/javascript; charset=utf-8" } });
  }
  return caches.match("./index.html");
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    // 只缓存成功的响应：404 一旦进缓存，按需加载的 3D 文件会一直 404 到下次递增 CACHE。
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, copy));
    }
    return response;
  }).catch(() => offlineResponse(event.request))));
});
