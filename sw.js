/* Service Worker — Image & PDF Tool */
const CACHE = 'img-pdf-tool-v2';

const SHELL = [
  './',
  './index.html',
  './css/style.css',
  './css/pages.css',
  './js/utils.js',
  './js/format-utils.js',
  './js/validator.js',
  './js/image-tools.js',
  './js/pdf-tools.js',
  './js/app.js',
  './manifest.json',
  './icons/icon.svg',
  './pages/about.html',
  './pages/calculators.html',
  './pages/contact.html',
  './pages/privacy.html',
  './pages/terms.html',
  './pages/disclaimer.html',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const { request } = e;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // For navigation requests (HTML pages), use network-first with cache fallback
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then(res => { caches.open(CACHE).then(c => c.put(request, res.clone())); return res; })
        .catch(() => caches.match(request).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // For same-origin assets (CSS, JS, images), use cache-first with background update
  if (request.url.startsWith(self.location.origin)) {
    e.respondWith(
      caches.match(request).then(cached => {
        const network = fetch(request).then(res => {
          caches.open(CACHE).then(c => c.put(request, res.clone()));
          return res;
        });
        return cached || network;
      })
    );
    return;
  }

  // For CDN resources (fonts, libraries), use cache-first — network fallback only
  if (
    request.url.includes('fonts.googleapis.com') ||
    request.url.includes('fonts.gstatic.com') ||
    request.url.includes('cdnjs.cloudflare.com') ||
    request.url.includes('unpkg.com') ||
    request.url.includes('cdn.jsdelivr.net')
  ) {
    e.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(res => {
          if (res.ok) caches.open(CACHE).then(c => c.put(request, res.clone()));
          return res;
        });
      })
    );
  }
});
