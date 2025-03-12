const CACHE_NAME = 'static-cache';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/index.js',
    '/app.js',
    '/style.css',
    '/timer/timer.html',
    '/timer/timer.js',
    '/upload/upload.html',
    '/upload/upload.js'
];

async function cacheStaticAssets() {
    const cache = await caches.open(CACHE_NAME);
    return cache.addAll(STATIC_ASSETS);
}

self.addEventListener('install', (event) => {
    console.log('Service Worker installing.');
    self.skipWaiting();
    event.waitUntil(cacheStaticAssets());
});
  
async function cleanupCache() {
    const keys = await caches.keys();
    const keysToDelete = keys.map(key => {
      if (key !== CACHE_NAME) {
        return caches.delete(key);
      }
    });
    return Promise.all(keysToDelete);
}

self.addEventListener('activate', (event) => {
    console.log('Service Worker activating.');
    event.waitUntil(cleanupCache());
});

async function fetchAssets(event) {
    try {
      const response = await fetch(event.request);
      return response;
    } catch (err) {
      const cache = await caches.open(CACHE_NAME);
      return cache.match(event.request);
    }
}

self.addEventListener('fetch', (event) => {
    console.log('Service Worker activating.');
    event.respondWith(fetchAssets(event));
});