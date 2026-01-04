const VERSION = "v1";
const STATIC_CACHE = `mindbridge-static-${VERSION}`;
const PAGE_CACHE = `mindbridge-pages-${VERSION}`;
const OFFLINE_URL = "/offline.html";
const PRECACHE_PAGES = ["/", "/research", "/methodology", OFFLINE_URL];

const isExcludedPath = (pathname) =>
  pathname.startsWith("/api") ||
  pathname.startsWith("/dashboard") ||
  pathname.startsWith("/intake") ||
  pathname.startsWith("/invite") ||
  pathname.startsWith("/t/");

const isStaticAsset = (request, url) => {
  if (request.destination) {
    return ["style", "script", "image", "font"].includes(request.destination);
  }
  return url.pathname.startsWith("/_next/static") || url.pathname.startsWith("/icons");
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGE_CACHE)
      .then((cache) => cache.addAll(PRECACHE_PAGES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => ![STATIC_CACHE, PAGE_CACHE].includes(key))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isStaticAsset(request, url)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            cache.put(request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  if (request.mode === "navigate") {
    if (isExcludedPath(url.pathname)) return;
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(PAGE_CACHE).then((cache) => {
            cache.put(url.pathname, copy).catch(() => {});
          });
          return response;
        })
        .catch(() =>
          caches
            .match(url.pathname)
            .then((cached) => cached || caches.match(OFFLINE_URL))
        )
    );
  }
});
