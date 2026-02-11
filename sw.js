// Service Worker untuk Music Hub PWA
const CACHE_NAME = 'music-hub-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/homepage.html',
  '/manifest.json',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - network first, cache fallback
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle API requests
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache API responses
          const clonedResponse = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then(cache => cache.put(event.request, clonedResponse));
          return response;
        })
        .catch(() => {
          // Return cached API response if network fails
          return caches.match(event.request);
        })
    );
    return;
  }

  // For other requests: cache first, network fallback
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then(response => {
            // Don't cache non-GET requests or opaque responses
            if (event.request.method !== 'GET' || 
                response.type === 'opaque' || 
                !response.ok) {
              return response;
            }
            
            // Cache the response
            const responseToCache = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then(cache => cache.put(event.request, responseToCache));
            
            return response;
          });
      })
  );
});

// Background sync for playlists
self.addEventListener('sync', event => {
  if (event.tag === 'sync-playlists') {
    console.log('[Service Worker] Background sync: playlists');
    // Implement playlist sync logic here
  }
});

// Handle push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data?.text() || 'Music Hub Notification',
    icon: '/assets/icon-192.png',
    badge: '/assets/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '2'
    },
    actions: [
      {
        action: 'play',
        title: 'Play',
        icon: '/assets/play-icon.png'
      },
      {
        action: 'pause',
        title: 'Pause',
        icon: '/assets/pause-icon.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Music Hub', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'play') {
    // Send message to client to play music
    clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'PLAYBACK_CONTROL',
          action: 'play'
        });
      });
    });
  } else if (event.action === 'pause') {
    // Send message to client to pause music
    clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'PLAYBACK_CONTROL',
          action: 'pause'
        });
      });
    });
  } else {
    // Default: open the app
    event.waitUntil(
      clients.openWindow('/index.html')
    );
  }
});

// Handle messages from the client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});