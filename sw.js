// ============================================================
// GoldAdjustment Service Worker — Offline Support
// ============================================================
const CACHE_NAME = 'goldadjustment-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Install — cache core files
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch(err => {
        console.warn('[SW] Some assets failed to cache:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch — network-first, fallback to cache
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle GET
  if (req.method !== 'GET') return;

  // Skip Firebase / Google APIs — always try network
  const url = req.url;
  if (
    url.includes('firebase') ||
    url.includes('gstatic.com') ||
    url.includes('googleapis.com') ||
    url.includes('google-analytics') ||
    url.includes('googletagmanager')
  ) {
    return;
  }

  event.respondWith(
    fetch(req)
      .then((res) => {
        // Cache successful same-origin responses
        if (res && res.status === 200 && url.startsWith(self.location.origin)) {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, resClone).catch(() => {});
          });
        }
        return res;
      })
      .catch(() => {
        // Network failed → try cache
        return caches.match(req).then((cached) => {
          if (cached) return cached;
          // If HTML navigation, return index.html from cache
          if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
            return caches.match('./index.html');
          }
          return new Response('Offline — resource not cached', {
            status: 503,
            statusText: 'Offline'
          });
        });
      })
  );
});
