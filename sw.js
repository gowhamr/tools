const CACHE_NAME = 'karuvilab-v13';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/theme.js',
  './js/utils.js',
  './js/format-utils.js',
  './js/image-tools.js',
  './js/pdf-tools.js',
  './js/validator.js',
  './js/markdown-tool.js',
  './js/qrcode-tool.js',
  './js/shell.js',
  './js/home.js',
  './js/split-tool.js',
  './js/lib/qrcode.min.js',
  './manifest.json',
  './icons/icon.svg',
  './pages/about.html',
  './pages/contact.html',
  './pages/privacy.html',
  './pages/terms.html',
  './tools/',
  './tools/compress/',
  './tools/convert/',
  './tools/create/',
  './tools/pdf/',
  './tools/pdf/merge/',
  './tools/pdf/split/',
  './tools/pdf/img-to-pdf/',
  './tools/pdf/compress/',
  './tools/validate/',
  './tools/calculators/',
  './tools/calculators/sip/',
  './tools/calculators/compound/',
  './tools/calculators/loan/',
  './tools/calculators/gst/',
  './tools/calculators/discount/',
  './tools/calculators/currency/',
  './tools/calculators/age/',
  './tools/calculators/date/',
  './tools/calculators/time/',
  './tools/calculators/world-clock/',
  './tools/calculators/utc-ist/',
  './tools/calculators/standard/',
  './tools/calculators/percent/',
  './tools/calculators/numeral/',
  './tools/calculators/storage/',
  './tools/calculators/temp/',
  './tools/calculators/speed/',
  './tools/base64/',
  './tools/regex/',
  './tools/format/',
  './tools/markdown/',
  './tools/qrcode/',
  './tools/split-copy/'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Try network first, then cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((response) => {
          if (response) return response;
          // Return offline page for navigation requests if nothing matches
          if (event.request.mode === 'navigate') {
            return caches.match('./');
          }
          return null;
        });
      })
  );
});
