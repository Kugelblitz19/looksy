/* Looksy service worker — minimal: makes the app installable and serves a
   cached shell when offline. Network-first for navigations; everything else
   (API, auth, images) passes straight through so nothing stale is served. */
const CACHE = "looksy-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.add("/"))
      .catch(() => {}),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || request.mode !== "navigate") return;
  event.respondWith(
    fetch(request).catch(() =>
      caches.match("/").then((r) => r || Response.error()),
    ),
  );
});
