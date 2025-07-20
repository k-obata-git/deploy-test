// キャッシュ戦略の基本設定
self.addEventListener('install', (event) => {
  console.log('[SW] install');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] activate');
  event.waitUntil(self.clients.claim());
});

// Workbox が inject する manifest を使って precache
self.__WB_MANIFEST;

// fetchハンドラ（任意）
self.addEventListener('fetch', (event) => {
  // 任意のキャッシュ処理をここに書いてもOK
});

self.addEventListener('push', function (event) {
  const data = event.data?.json() || {};

  const title = data.title || '通知';
  const options = {
    body: data.body || '新しい通知があります',
    icon: '/icons/icon-192.png',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
