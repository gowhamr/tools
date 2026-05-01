const CACHE_NAME = 'karuvilab-v16';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './css/pages.css',
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
  './pages/disclaimer.html',
  './pages/guides.html',
  './pages/privacy.html',
  './pages/terms.html',
  './tools/',
  './tools/compress/',
  './tools/convert/',
  './tools/create/',
  './tools/validate/',
  './tools/base64/',
  './tools/regex/',
  './tools/format/',
  './tools/markdown/',
  './tools/qrcode/',
  './tools/split-copy/',
  './pdf-tools/',
  './pdf-tools/compress-pdf/',
  './pdf-tools/image-to-pdf/',
  './pdf-tools/merge-pdf/',
  './pdf-tools/split-pdf/',
  './calculators/',
  './calculators/age-calculator/',
  './calculators/compound-interest/',
  './calculators/currency-converter/',
  './calculators/date-calculator/',
  './calculators/discount-calculator/',
  './calculators/emi-calculator/',
  './calculators/gst-calculator/',
  './calculators/numeral-converter/',
  './calculators/percentage-calculator/',
  './calculators/sip-calculator/',
  './calculators/standard-calculator/',
  './calculators/time-calculator/',
  './calculators/unit-converter/',
  './calculators/utc-ist-converter/',
  './calculators/world-clock/'
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
