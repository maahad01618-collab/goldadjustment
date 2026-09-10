self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('gold-adjustment-v1').then((cache) => {
      return cache.addAll([
        '/goldadjustment/',
        '/goldadjustment/index.html',
      ]);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});