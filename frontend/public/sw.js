// frontend/public/sw.js - Fixed version
const CACHE_NAME = 'taskflow-v1.0.0';
const API_CACHE_NAME = 'taskflow-api-v1.0.0';

// Files to cache for offline use
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        console.log('📦 Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      }),
      caches.open(API_CACHE_NAME).then((cache) => {
        console.log('📦 Preparing API cache');
        return Promise.resolve();
      })
    ])
  );
  
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
    return;
  }
  
  // Handle static assets and navigation
  event.respondWith(handleStaticRequest(request));
});

// Handle API requests with cache-first strategy for GET, network-first for others
async function handleAPIRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  
  // For GET requests, try cache first
  if (request.method === 'GET') {
    try {
      // Try network first for fresh data
      const networkResponse = await fetch(request);
      
      if (networkResponse.ok) {
        // Cache successful responses
        cache.put(request, networkResponse.clone());
        return networkResponse;
      }
      
      // If network fails, try cache
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        console.log('📱 Serving API from cache:', request.url);
        return cachedResponse;
      }
      
      // Return network response even if not ok (for proper error handling)
      return networkResponse;
    } catch (error) {
      // Network error, try cache
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        console.log('📱 Serving API from cache (network error):', request.url);
        return cachedResponse;
      }
      
      // Return offline response
      return new Response(
        JSON.stringify({ 
          error: 'Offline', 
          message: 'No network connection and no cached data available' 
        }),
        { 
          status: 503, 
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
  
  // For POST, PUT, DELETE requests - try network first
  try {
    const response = await fetch(request);
    
    if (!response.ok && ['POST', 'PUT', 'DELETE'].includes(request.method)) {
      // Store failed request for background sync
      await storeFailedRequest(request);
    }
    
    return response;
  } catch (error) {
    // Store failed request for background sync
    await storeFailedRequest(request);
    
    return new Response(
      JSON.stringify({ 
        error: 'Request queued', 
        message: 'Request will be processed when connection is restored' 
      }),
      { 
        status: 202, 
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static requests with cache-first strategy
async function handleStaticRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  // Try cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    console.log('📱 Serving from cache:', request.url);
    return cachedResponse;
  }
  
  // Try network
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // For navigation requests, return the cached index.html
    if (request.mode === 'navigate') {
      const indexResponse = await cache.match('/');
      if (indexResponse) {
        console.log('📱 Serving offline page');
        return indexResponse;
      }
    }
    
    // Return offline page or error
    return new Response(
      'Offline - Content not available',
      { status: 503 }
    );
  }
}

// Store failed requests for background sync - FIXED VERSION
async function storeFailedRequest(request) {
  try {
    // Clone the request to avoid body stream issues
    const requestClone = request.clone();
    
    // Read the body safely
    let body = null;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        body = await requestClone.text();
      } catch (bodyError) {
        console.warn('Could not read request body:', bodyError);
        body = null;
      }
    }
    
    const requestData = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers),
      body: body,
      timestamp: Date.now()
    };
    
    // Use IndexedDB-like storage via Cache API
    const cache = await caches.open('taskflow-pending-requests');
    const response = new Response(JSON.stringify(requestData));
    await cache.put(`pending-${Date.now()}-${Math.random()}`, response);
    
    console.log('📤 Stored failed request for later sync:', request.url);
  } catch (error) {
    console.error('Failed to store request:', error);
  }
}

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'taskflow-sync') {
    event.waitUntil(syncPendingRequests());
  }
});

// Sync pending requests when connection is restored
async function syncPendingRequests() {
  try {
    const cache = await caches.open('taskflow-pending-requests');
    const requests = await cache.keys();
    
    console.log(`🔄 Syncing ${requests.length} pending requests`);
    
    for (const request of requests) {
      try {
        const response = await cache.match(request);
        const requestData = await response.json();
        
        // Retry the original request
        const retryResponse = await fetch(requestData.url, {
          method: requestData.method,
          headers: requestData.headers,
          body: requestData.body
        });
        
        if (retryResponse.ok) {
          // Remove from pending cache
          await cache.delete(request);
          console.log('✅ Successfully synced request:', requestData.url);
        }
      } catch (error) {
        console.error('Failed to sync request:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notification event
self.addEventListener('push', (event) => {
  console.log('📬 Push notification received');
  
  const options = {
    body: 'You have new task updates!',
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
        title: 'View Tasks',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };
  
  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.data = { ...options.data, ...data };
  }
  
  event.waitUntil(
    self.registration.showNotification('TaskFlow', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    // Open the app to tasks page
    event.waitUntil(
      clients.openWindow('/tasks')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message event for communication with main app
self.addEventListener('message', (event) => {
  console.log('💬 Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});