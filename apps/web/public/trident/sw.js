const CACHE = 'trident-shell-v3';
const ASSETS = [
  './index.html',
  './style.css',
  './core.mjs',
  './legacy-plan.mjs',
  './app.mjs',
  './manifest.webmanifest',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
];
self.addEventListener('install', (event) =>
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS))),
);
self.addEventListener('activate', (event) =>
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith('trident-shell-') && k !== CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  ),
);
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin)
    return;
  const url = new URL(event.request.url);
  const allowed = ASSETS.map((path) => new URL(path, self.registration.scope).href);
  if (!allowed.includes(url.href) && event.request.mode !== 'navigate') return;
  event.respondWith(
    caches
      .match(event.request)
      .then(
        (hit) =>
          hit ||
          (event.request.mode === 'navigate'
            ? caches.match(new URL('./index.html', self.registration.scope).href)
            : null),
      )
      .then(
        (hit) =>
          hit ||
          fetch(event.request).catch(() =>
            event.request.mode === 'navigate'
              ? caches.match(new URL('./index.html', self.registration.scope).href)
              : Response.error(),
          ),
      ),
  );
});
