/**
 * Service Worker — Eachother Being Together
 * Cache name: ebt-v1
 *
 * Strategy:
 *  - App shell ("/")          → Cache-first, fallback to network
 *  - /assets/ JS/CSS/JSON     → Network-first, fallback to cache
 *  - Google Fonts             → Network-first, fallback to cache
 *  - Everything else          → Network-first, fallback to cache
 *  - Total failure            → Inline offline HTML
 */

const CACHE_NAME = 'ebt-v1';

/** Resources pre-cached at install time (app shell). */
const PRECACHE_URLS = [
  '/',
];

/** Simple offline fallback returned when network + cache both fail. */
const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#0d0a12" />
  <title>Eachother Being Together — Offline</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      height: 100%;
      background: #0d0a12;
      color: #f0d6dc;
      font-family: system-ui, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .card {
      padding: 2rem;
      max-width: 340px;
    }
    .heart {
      font-size: 4rem;
      margin-bottom: 1rem;
      display: block;
    }
    h1 {
      font-size: 1.4rem;
      margin-bottom: 0.75rem;
      color: #c4556a;
    }
    p {
      font-size: 1rem;
      line-height: 1.6;
      opacity: 0.8;
    }
  </style>
</head>
<body>
  <div class="card">
    <span class="heart">💕</span>
    <h1>You're offline.</h1>
    <p>Connect to the internet to keep playing together.</p>
  </div>
</body>
</html>`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns true if the request URL matches a Google Fonts origin. */
function isGoogleFont(url) {
  return (
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com'
  );
}

/** Returns true if the request targets a local JS / CSS / JSON asset. */
function isLocalAsset(url) {
  return (
    url.pathname.startsWith('/assets/') &&
    /\.(js|css|json)(\?.*)?$/.test(url.pathname)
  );
}

/** Returns true if this request is for the app shell. */
function isAppShell(url, request) {
  return (
    url.pathname === '/' ||
    request.mode === 'navigate'
  );
}

/**
 * Network-first strategy.
 * Try the network; on failure return the cached response (if any);
 * on total failure return the offline HTML (for navigation requests only).
 */
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      // Only cache same-origin or CORS-enabled cross-origin responses.
      const shouldCache =
        networkResponse.type === 'basic' ||
        networkResponse.type === 'cors';
      if (shouldCache) {
        cache.put(request, networkResponse.clone());
      }
    }
    return networkResponse;
  } catch (_err) {
    const cached = await cache.match(request);
    if (cached) return cached;

    // For navigation requests return the offline page.
    if (request.mode === 'navigate') {
      return new Response(OFFLINE_HTML, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // For everything else just propagate the failure.
    throw _err;
  }
}

/**
 * Cache-first strategy.
 * Return the cached response immediately; if absent, fetch from network,
 * cache the result, and return it.
 */
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (_err) {
    if (request.mode === 'navigate') {
      return new Response(OFFLINE_HTML, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
    throw _err;
  }
}

// ---------------------------------------------------------------------------
// Install — pre-cache the app shell
// ---------------------------------------------------------------------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ---------------------------------------------------------------------------
// Activate — delete stale caches and immediately control all clients
// ---------------------------------------------------------------------------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ---------------------------------------------------------------------------
// Fetch — route each request to the appropriate strategy
// ---------------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  // Only handle GET requests.
  if (event.request.method !== 'GET') return;

  let url;
  try {
    url = new URL(event.request.url);
  } catch {
    return; // Invalid URL — let the browser handle it.
  }

  // Skip non-http(s) schemes (e.g. chrome-extension://).
  if (!url.protocol.startsWith('http')) return;

  // --- Routing ---

  if (isAppShell(url, event.request)) {
    // App shell → cache-first so it loads instantly offline.
    event.respondWith(cacheFirst(event.request));
    return;
  }

  if (isLocalAsset(url)) {
    // Versioned assets → network-first so updates are picked up quickly.
    event.respondWith(networkFirst(event.request));
    return;
  }

  if (isGoogleFont(url)) {
    // Fonts → network-first with cache fallback.
    event.respondWith(networkFirst(event.request));
    return;
  }

  // Default → network-first for everything else.
  event.respondWith(networkFirst(event.request));
});
