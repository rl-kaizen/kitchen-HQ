const CACHE_NAME = 'kitchen-hq-v11';
const BASE_PATH = '/kitchen-HQ';
const STATIC_ASSETS = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/manifest.json`,
  `${BASE_PATH}/css/styles.css`,
  `${BASE_PATH}/js/app.js`,
  `${BASE_PATH}/js/storage.js`,
  `${BASE_PATH}/js/settings.js`,
  `${BASE_PATH}/js/recipe.js`,
  `${BASE_PATH}/js/calendar.js`,
  `${BASE_PATH}/js/screensaver.js`,
  `${BASE_PATH}/js/google-auth.js`,
  `${BASE_PATH}/assets/icons/icon-192.png`,
  `${BASE_PATH}/assets/icons/icon-512.png`,
  `${BASE_PATH}/favicon.svg`
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first for static assets, network-first for API calls
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Don't cache API calls or Google auth
  if (url.hostname === 'api.anthropic.com' ||
      url.hostname === 'www.googleapis.com' ||
      url.hostname === 'drive.google.com' ||
      url.hostname === 'accounts.google.com') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok && event.request.method === 'GET' && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
