const CACHE_NAME = 'rontogiannis-mini-app-v3';
const APP_BASE = '/app/';
const OFFLINE_URL = APP_BASE;

const PRECACHE_URLS = [
  APP_BASE,
  APP_BASE + 'index.html',
  APP_BASE + 'entypa.html',
  APP_BASE + 'odigies.html',
  APP_BASE + 'meta-prp.html',
  APP_BASE + 'meta-yalouroniko.html',
  APP_BASE + 'meta-kortizoni.html',
  APP_BASE + 'prin-prp.html',
  APP_BASE + 'prin-xeirourgeio.html',
  APP_BASE + 'arthroskopisi-gonatou.html',
  APP_BASE + 'arthroskopisi-omou.html',
  APP_BASE + 'arthroplastiki-gonatou-robotiki.html',
  APP_BASE + 'arthroplastiki-isxiou-amis.html',
  APP_BASE + 'style.css?v=10',
  APP_BASE + 'style.css',
  APP_BASE + 'manifest.json',
  APP_BASE + 'images/icon-192.png',
  APP_BASE + 'images/icon-512.png',
  APP_BASE + 'fonts/inter-a375c31d43.woff2',
  APP_BASE + 'fonts/inter-13755630d7.woff2',
  APP_BASE + 'fonts/inter-da72a9f738.woff2',
  APP_BASE + 'fonts/inter-3b78c6fa64.woff2',
  APP_BASE + 'fonts/inter-f059b71e05.woff2',
  APP_BASE + 'fonts/inter-b6db4a06c1.woff2',
  APP_BASE + 'fonts/inter-6ab57b19c6.woff2'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.allSettled(PRECACHE_URLS.map(url => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      ))
      .then(() => clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin !== self.location.origin || !requestUrl.pathname.startsWith(APP_BASE)) {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request));
    return;
  }

  event.respondWith(cacheFirst(event.request));
});

function networkFirst(request) {
  return fetch(request)
    .then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
      return response;
    })
    .catch(() => caches.match(request).then(cached => cached || caches.match(OFFLINE_URL)));
}

function cacheFirst(request) {
  return caches.match(request)
    .then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }

        return response;
      });
    });
}
