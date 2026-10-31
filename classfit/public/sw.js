// 안드로이드 Chrome은 서비스 워커를 통해서만 시스템 알림을 표시한다.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

// 같은 태그를 쓰면 새 알림이 쌓이지 않고 기존 D-Day 알림을 덮어쓴다.
self.addEventListener('push', (event) => {
  const message = event.data ? event.data.json() : { title: '수행알리미', body: '' };
  event.waitUntil(
    self.registration.showNotification(message.title, {
      body: message.body,
      tag: 'classfit-dday',
      icon: '/assets/aistudio/images_0069c149.png',
      requireInteraction: true,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      if (windows.length > 0) return windows[0].focus();
      return self.clients.openWindow('/');
    })
  );
});
