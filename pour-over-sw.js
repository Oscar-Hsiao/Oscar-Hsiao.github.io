/* 手沖計時器離線用：只管 pour-over-timer.html 這一頁（scope 就是頁面路徑），網站其他頁面完全不受影響。
   有網路時永遠拿最新版並更新快取；沒網路時才用快取。 */
const CACHE = "pour-over-v2";
const PAGE = new URL(self.registration.scope).pathname;

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.add(PAGE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("pour-over-") && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if(e.request.method !== "GET" || u.pathname !== PAGE) return;
  e.respondWith(
    fetch(e.request).then(r => {
      if(r && r.ok){ const copy = r.clone(); caches.open(CACHE).then(c => c.put(PAGE, copy)); }
      return r;
    }).catch(() => caches.match(PAGE))
  );
});
