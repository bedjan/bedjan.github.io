const cacheName = 'moje-odkazy-v1';
// Seznam souborů, které se mají uložit pro offline režim
const assets = [
  './',
  './index.html',
  './styl.css'
];

// Při instalaci uloží soubory do cache
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// Při požadavku zkusí nejdřív cache, pak síť
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
