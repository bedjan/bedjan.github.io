const cacheName = 'moje-odkazy-v1';
const assets = [
  './',
  './index.html',
  './styl.css'
];

// Instalace - uložení souborů do paměti
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      cache.addAll(assets);
    })
  );
});

// Aktivace při zapnutí offline režimu
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});
