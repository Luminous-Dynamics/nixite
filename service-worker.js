/**
 * Nixite Service Worker
 *
 * Provides offline functionality and caching for PWA features
 */

const CACHE_VERSION = 'nixite-v2.3.0';
const CACHE_NAME = `${CACHE_VERSION}-static`;
const DATA_CACHE_NAME = `${CACHE_VERSION}-data`;

// Files to cache immediately on install
const STATIC_CACHE_FILES = [
    '/',
    '/index.html',
    '/manifest.json',
    '/css/phase11-features.css',
    '/js/favorites.js',
    '/js/comparison.js',
    '/js/history.js',
    '/js/stats.js',
    '/js/enhanced-search.js',
    '/js/recommendations.js',
    '/js/accessibility.js',
    '/js/ui-integration.js',
    '/config.js',
    '/install-manager.js',
    '/ui-feedback-enhancements.js',
    '/voice-input.js'
];

// Data files (packages, etc.)
const DATA_FILES = [
    '/nixite-packages.json'
];

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...', CACHE_VERSION);

    event.waitUntil(
        Promise.all([
            // Cache static files
            caches.open(CACHE_NAME).then((cache) => {
                console.log('[Service Worker] Caching static files');
                return cache.addAll(STATIC_CACHE_FILES);
            }),
            // Cache data files
            caches.open(DATA_CACHE_NAME).then((cache) => {
                console.log('[Service Worker] Caching data files');
                return cache.addAll(DATA_FILES);
            })
        ]).then(() => {
            console.log('[Service Worker] Installation complete');
            return self.skipWaiting();
        })
    );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...', CACHE_VERSION);

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[Service Worker] Activation complete');
            return self.clients.claim();
        })
    );
});

/**
 * Fetch event - serve from cache, fallback to network
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // Handle API requests differently
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(fetchWithNetworkFallback(request, DATA_CACHE_NAME));
        return;
    }

    // Handle data files (JSON)
    if (url.pathname.endsWith('.json')) {
        event.respondWith(fetchWithCacheFallback(request, DATA_CACHE_NAME));
        return;
    }

    // Handle static files
    event.respondWith(fetchWithCacheFallback(request, CACHE_NAME));
});

/**
 * Fetch with cache fallback (cache-first strategy)
 */
async function fetchWithCacheFallback(request, cacheName) {
    try {
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
            console.log('[Service Worker] Serving from cache:', request.url);

            // Update cache in background
            fetchAndCache(request, cacheName);

            return cachedResponse;
        }

        console.log('[Service Worker] Fetching from network:', request.url);
        const networkResponse = await fetch(request);

        // Cache successful responses
        if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.error('[Service Worker] Fetch failed:', error);

        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            return caches.match('/offline.html');
        }

        throw error;
    }
}

/**
 * Fetch with network fallback (network-first strategy)
 */
async function fetchWithNetworkFallback(request, cacheName) {
    try {
        console.log('[Service Worker] Fetching from network (API):', request.url);
        const networkResponse = await fetch(request);

        // Cache successful responses
        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('[Service Worker] Network failed, trying cache:', request.url);
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
            return cachedResponse;
        }

        throw error;
    }
}

/**
 * Fetch and update cache in background
 */
async function fetchAndCache(request, cacheName) {
    try {
        const networkResponse = await fetch(request);

        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
            console.log('[Service Worker] Updated cache:', request.url);
        }
    } catch (error) {
        // Silent fail - we already returned cached version
        console.log('[Service Worker] Background update failed:', request.url);
    }
}

/**
 * Message event - handle messages from clients
 */
self.addEventListener('message', (event) => {
    console.log('[Service Worker] Message received:', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            }).then(() => {
                event.ports[0].postMessage({ success: true });
            })
        );
    }

    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_VERSION });
    }
});

/**
 * Sync event - background sync
 */
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background sync:', event.tag);

    if (event.tag === 'sync-packages') {
        event.waitUntil(syncPackages());
    }
});

/**
 * Sync packages from server
 */
async function syncPackages() {
    try {
        const response = await fetch('/nixite-packages.json');
        const cache = await caches.open(DATA_CACHE_NAME);
        await cache.put('/nixite-packages.json', response);
        console.log('[Service Worker] Packages synced');
    } catch (error) {
        console.error('[Service Worker] Sync failed:', error);
    }
}

/**
 * Push event - push notifications
 */
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push received:', event);

    const options = {
        body: event.data ? event.data.text() : 'New packages available!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Explore',
                icon: '/icons/checkmark.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/icons/xmark.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Nixite', options)
    );
});

/**
 * Notification click event
 */
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification clicked:', event.action);

    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

console.log('[Service Worker] Loaded:', CACHE_VERSION);
