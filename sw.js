// ============================================================
// Service Worker – GoldAdjustment (Auto Update Version)
// ============================================================
// ✨ কোনো ভার্সন নম্বর বদলাতে হবে না
// ✨ ইন্টারনেট থাকলেই অটোমেটিক আপডেট হবে
// ============================================================

const CACHE_NAME = 'gold-adjustment-cache';  // ⬅️ নাম কখনো বদলাবেন না

const ASSETS = [
  '/goldadjustment/',
  '/goldadjustment/index.html',
];

// ------------------------------------------------------------
// INSTALL: ক্যাশ তৈরি + সাথে সাথে সক্রিয়
// ------------------------------------------------------------
self.addEventListener('install', (e) => {
  self.skipWaiting();  // নতুন SW সাথে সাথে চালু
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// ------------------------------------------------------------
// ACTIVATE: সব ট্যাব নিয়ন্ত্রণ নেয় (পুরনো ক্যাশ মোছে না)
// ------------------------------------------------------------
self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

// ------------------------------------------------------------
// FETCH: Network-First কৌশল
// ইন্টারনেট থাকলে → নতুন ফাইল
// ইন্টারনেট না থাকলে → ক্যাশ থেকে
// ------------------------------------------------------------
self.addEventListener('fetch', (e) => {
  // শুধু GET রিকোয়েস্ট হ্যান্ডেল করি
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // নতুন রেসপন্স ক্যাশে আপডেট করে রাখি
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, clone);
        });
        return response;
      })
      .catch(() => {
        // ইন্টারনেট নেই → ক্যাশ থেকে দাও
        return caches.match(e.request);
      })
  );
});
