/* Build substitutes this exact list. Only public application assets belong here. */
const CACHE = 'travel-shell-f3840b1977480f1e';
const ASSETS = ["/ysevan/tools/travel/","/ysevan/tools/travel/index.html","/ysevan/tools/travel/manifest.webmanifest","/ysevan/tools/travel/icon.svg","/ysevan/tools/travel/icon-192.png","/ysevan/tools/travel/icon-512.png","/ysevan/tools/travel/apple-touch-icon.png","/ysevan/tools/travel/assets/index-Dsaxq85i.css","/ysevan/tools/travel/assets/index-myS8Q_19.js"];
const BASE = "/ysevan/tools/travel/";
const allowed = new Set(ASSETS);
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('travel-shell-') && key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // APIs, authentication, external services, map tiles and unknown files always use the network.
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || url.search || !allowed.has(url.pathname)) return;
  event.respondWith(caches.open(CACHE).then(async (cache) => {
    if (event.request.mode === 'navigate') {
      // Offline, answer with the directory address itself. Hosts like Cloudflare Pages 308 index.html to the directory,
      // so the precached index.html copy is a redirected response, and browsers refuse those for navigations.
      try {const response = await fetch(event.request); if (response.ok && response.type === 'basic') await cache.put(event.request, response.clone()); return response;} catch {return (await cache.match(BASE)) || Response.error();}
    }
    return (await cache.match(event.request)) || fetch(event.request);
  }));
});
