const CACHE_NAME = 'radius-v3';
const ASSETS_TO_PRECACHE = [
    '/',
    '/index.html',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

// Install — skip waiting so new SW activates immediately
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_PRECACHE))
    );
    self.skipWaiting();
});

// Activate — claim clients immediately, clear old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
        ).then(() => self.clients.claim())
    );
});

// Fetch — network-first for JS/CSS (always fresh), cache-first for images/fonts
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    if (event.request.url.includes('/api/')) return;

    const url = new URL(event.request.url);
    const isAsset = /\.(js|css)$/.test(url.pathname);

    if (isAsset) {
        // Network-first: always try network, fall back to cache
        event.respondWith(
            fetch(event.request).then((networkResponse) => {
                const clone = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                return networkResponse;
            }).catch(() => caches.match(event.request))
        );
    } else {
        // Cache-first for images, icons, HTML
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                if (cachedResponse) return cachedResponse;
                return fetch(event.request).then((networkResponse) => {
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse.clone()));
                    return networkResponse;
                }).catch(() => {
                    if (event.request.mode === 'navigate') return caches.match('/index.html');
                });
            })
        );
    }
});
