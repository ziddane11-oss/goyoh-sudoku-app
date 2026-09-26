// 고요 스도쿠 오프라인 캐시 (PWA판 전용, 토스판에는 들어가지 않는다).
// 빌드할 때 아래 두 자리표시자에 캐시 버전(파일 내용 해시)과 미리 저장할 파일 목록이 채워진다.
const CACHE = 'goyoh-sudoku-83a5b52f4424';
const PRECACHE = ["./","./assets/index-CAXtN0q0.js","./assets/index-DpVpLkRC.css","./favicon.svg","./icons/icon-192.png","./icons/icon-512.png","./icons/icon-maskable-512.png","./index.html","./manifest.json","./privacy.html"];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith('goyoh-sudoku-') && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    // 화면(HTML)은 새 버전을 먼저 받아 보고, 인터넷이 없으면 저장해 둔 화면을 쓴다.
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put('./', copy));
          }
          return response;
        })
        .catch(() => caches.match('./').then((hit) => hit || caches.match('./index.html'))),
    );
    return;
  }

  // JS·CSS는 파일 이름에 내용 해시가 붙어 있어서 저장본을 먼저 써도 안전하다.
  event.respondWith(caches.match(request, { ignoreSearch: true }).then((hit) => hit || fetch(request)));
});
