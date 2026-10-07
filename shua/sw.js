// 刷刷已从 /shua/ 搬到 /ysevan/tools/shua/（2026-10-07）。旧地址上装过的 Service Worker 会更新成这一版：
// 安装就接管，激活时只删缓存里属于旧地址 /shua/ 的条目（新地址和别的工具共用同一个源，别误删）、注销自己，
// 再把开着的旧地址页面带到新地址（Service Worker 看不到 #，所以这一步带不上 #；直接打开旧地址时由 index.html 带 #）。
const OLD = "/shua/", NEW = "/ysevan/tools/shua/";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    await self.clients.claim();
    for (const name of await caches.keys()) {
      const cache = await caches.open(name);
      const reqs = await cache.keys();
      const mine = reqs.filter((r) => new URL(r.url).pathname.startsWith(OLD));
      await Promise.all(mine.map((r) => cache.delete(r)));
      if (mine.length && mine.length === reqs.length) await caches.delete(name);
    }
    await self.registration.unregister();
    for (const c of await self.clients.matchAll({ type: "window" })) {
      const u = new URL(c.url);
      if (!u.pathname.startsWith(OLD)) continue;
      const rest = u.pathname.slice(OLD.length);
      try { await c.navigate(NEW + (rest === "index.html" ? "" : rest) + u.search); } catch (e) {}
    }
  })());
});
