// Authlog Service Worker
// Provides: offline fallback, static asset caching, cache cleanup

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `authlog-static-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

// Assets to pre-cache on install
const PRE_CACHE_ASSETS = [
  OFFLINE_URL,
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// ─── Install ────────────────────────────────────────────────────────────────
// Pre-cache essential assets so the offline page is always available
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRE_CACHE_ASSETS))
  );
  // Take control immediately without waiting for old SW to go idle
  self.skipWaiting();
});

// ─── Activate ───────────────────────────────────────────────────────────────
// Remove caches from previous versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  // Claim all open clients immediately
  self.clients.claim();
});

// ─── Fetch ──────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests (e.g. API calls to localhost:5000)
  if (url.origin !== location.origin) return;

  // Skip Next.js HMR and internal routes in dev
  if (url.pathname.startsWith('/_next/webpack-hmr')) return;
  if (url.pathname.startsWith('/_next/static/webpack')) return;

  // ── Strategy: Network first, fallback to cache, then offline page ──
  if (request.mode === 'navigate') {
    // Page navigation — try network, fall back to offline page
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL).then((cached) => cached || Response.error())
      )
    );
    return;
  }

  // Static assets (_next/static, icons, fonts, images)
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.match(/\.(woff2?|ttf|eot|svg|png|jpg|jpeg|webp|ico)$/)
  ) {
    // Cache first for static assets
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          // Only cache valid responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const clone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // Everything else — network only (API calls handled by Next.js)
});
