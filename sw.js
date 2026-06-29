const CACHE_NAME = 'rontogiannis-mini-app-v4';
const APP_BASE = new URL('./', self.registration.scope).pathname;
const OFFLINE_URL = APP_BASE;

const PRECACHE_PATHS = [
  '',
  'index.html',
  'entypa.html',
  'odigies.html',
  'meta-prp.html',
  'meta-yalouroniko.html',
  'meta-kortizoni.html',
  'prin-prp.html',
  'prin-xeirourgeio.html',
  'arthroskopisi-gonatou.html',
  'arthroskopisi-omou.html',
  'arthroplastiki-gonatou-robotiki.html',
  'arthroplastiki-isxiou-amis.html',
  'style.css?v=11',
  'style.css',
  'manifest.json',
  'images/icon-192.png',
  'images/icon-512.png',
  'fonts/inter-a375c31d43.woff2',
  'fonts/inter-13755630d7.woff2',
  'fonts/inter-da72a9f738.woff2',
  'fonts/inter-3b78c6fa64.woff2',
  'fonts/inter-f059b71e05.woff2',
  'fonts/inter-b6db4a06c1.woff2',
  'fonts/inter-6ab57b19c6.woff2'
];

const PRECACHE_URLS = PRECACHE_PATHS.map(path => new URL(path, self.registration.scope).toString());

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
