// Version this - increment to force update on all clients
const CACHE_VERSION = 'v9'
const CACHE_NAME = `peptide-ai-${CACHE_VERSION}`

// Only cache truly static assets
const STATIC_ASSETS = [
  '/api/icon/192',
  '/api/icon/512',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing new version:', CACHE_VERSION)
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  // Force the waiting service worker to become active
  self.skipWaiting()
})

// Activate event - clean up old caches and take control immediately
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new version:', CACHE_VERSION)
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('peptide-ai-') && name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name)
            return caches.delete(name)
          })
      )
    })
  )
  // Take control of all clients immediately
  self.clients.claim()
})

// Fetch event - Network first for HTML/JS, cache for assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Skip non-GET requests
  if (event.request.method !== 'GET') return

  // Skip API calls - always network
  if (url.pathname.startsWith('/api/')) return

  // Skip external requests
  if (url.origin !== location.origin) return

  // For HTML pages - always try network first, no caching
  // This ensures updates are seen immediately
  if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Only use cache as offline fallback
        return caches.match('/') || new Response('Offline', { status: 503 })
      })
    )
    return
  }

  // For static assets (icons, etc) - cache first, then network
  if (url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
          return response
        })
      })
    )
    return
  }

  // For everything else (JS, CSS) - network first for freshness
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Don't cache if not successful
        if (!response.ok) return response

        const clone = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        return response
      })
      .catch(() => caches.match(event.request))
  )
})

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting()
  }
})
