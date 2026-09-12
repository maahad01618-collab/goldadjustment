// ============================================================
// Service Worker – GoldAdjustment
// ============================================================

const CACHE_NAME = 'gold-adjustment-cache';

const ASSETS = [
  '/goldadjustment/',
  '/goldadjustment/index.html',
];

// INSTALL: ক্যাশ তৈরি + সাথে সাথে সক্রিয়
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// ACTIVATE: সব ট্যাব নিয়ন্ত্রণ নেয়
self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

// FETCH: Network-First (ইন্টারনেট থাকলে নতুন, না থাকলে ক্যাশ)
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, clone);
        });
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
