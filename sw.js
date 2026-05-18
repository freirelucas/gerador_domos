// sw.js — Service Worker para uso offline no canteiro de obra.
//
// Estratégia:
//   - Pre-cache os assets locais conhecidos no install.
//   - Cache-first para tudo (assets locais + Three.js no unpkg).
//   - Network-first só para a navegação (HTML host) com fallback ao cache.
//   - Bump CACHE_VERSION ao publicar quebra de schema; o sw antigo é purgado.

const CACHE_VERSION = 'dome-v3.3.1';
const CORE = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './tokens.css',
  './wizard-styles.css',
  './wizard-v3-styles.css',
  './synthesis.js',
  './wizard-side-panel.js',
  './dom-helpers.js',
  './geodesic.js',
  './materials-v2.js',
  './programa.js',
  './extras.js',
  './regiao-cargas.js',
  './glossario.js',
  './exporter.js',
  './wizard-steps.js',
  './wizard-dossie.js',
  './wizard-v3-app.js',
  './wizard-v3-step2.js',
  './wizard-v3-extras.js',
  './wizard-v3-galeria.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isNavigation = req.mode === 'navigate';
  const isThree = url.host === 'unpkg.com' && url.pathname.includes('three');
  const isFonts = url.host.endsWith('googleapis.com') || url.host.endsWith('gstatic.com');

  if (isNavigation) {
    // Network-first para HTML — assim atualizações chegam quando online.
    event.respondWith(
      fetch(req).then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
        return resp;
      }).catch(() => caches.match(req).then((r) => r || caches.match('./index.html'))),
    );
    return;
  }

  // Cache-first para tudo (locais + Three.js CDN + fontes Google).
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((resp) => {
        if (!resp.ok) return resp;
        const shouldCache = url.origin === self.location.origin || isThree || isFonts;
        if (shouldCache) {
          const copy = resp.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
        }
        return resp;
      }).catch(() => cached);
    }),
  );
});
