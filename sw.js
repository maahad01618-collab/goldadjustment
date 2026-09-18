// ============================================================
// Service Worker – GoldAdjustment
// Offline + Lifetime Access Support
// ============================================================

const CACHE_NAME = 'gold-adjustment-cache-v2';

const ASSETS = [
  '/goldadjustment/',
  '/goldadjustment/index.html'
];

// ============================================================
// INSTALL
// ============================================================
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ============================================================
// ACTIVATE
// পুরোনো cache মুছে নতুন cache চালু করবে
// ============================================================
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// ============================================================
// FETCH
// Internet থাকলে নতুন ফাইল নেবে
// Internet না থাকলে Cache থেকে চালাবে
// ============================================================
self.addEventListener('fetch', (event) => {

  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {

        // Valid response হলে cache-এ রাখবে
        if (response && response.status === 200) {
          const responseClone = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseClone);
            });
        }

        return response;
      })
      .catch(() => {

        // Internet না থাকলে Cache থেকে নেবে
        return caches.match(event.request)
          .then((cachedResponse) => {

            if (cachedResponse) {
              return cachedResponse;
            }

            // Navigation request হলে index.html চালাবে
            if (event.request.mode === 'navigate') {
              return caches.match('/goldadjustment/index.html');
            }

            return new Response(
              'Offline - এই ফাইলটি আগে Internet থাকা অবস্থায় খুলতে হবে।',
              {
                status: 503,
                headers: {
                  'Content-Type': 'text/plain; charset=utf-8'
                }
              }
            );
          });
      })
  );
});
