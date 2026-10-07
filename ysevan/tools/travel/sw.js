/* Build substitutes this exact list. Only public application assets belong here. */
const CACHE = 'travel-shell-edf504e755a39bb4';
const ASSETS = ["/ysevan/tools/travel/","/ysevan/tools/travel/index.html","/ysevan/tools/travel/manifest.webmanifest","/ysevan/tools/travel/icon.svg","/ysevan/tools/travel/icon-192.png","/ysevan/tools/travel/icon-512.png","/ysevan/tools/travel/apple-touch-icon.png","/ysevan/tools/travel/assets/index-CjaCE7rc.css","/ysevan/tools/travel/assets/index-BIrgVprZ.js"];
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
      try {const response = await fetch(event.request); if (response.ok && response.type === 'basic') await cache.put(event.request, response.clone()); return response;} catch {return (await cache.match(`${BASE}index.html`)) || Response.error();}
    }
    return (await cache.match(event.request)) || fetch(event.request);
  }));
});
