/* ECOM ACADEMY PRO - Service Worker (notifications) */
const CACHE_NAME = 'ecom-academy-pro-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Afficher une notification demandée par la page
self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'SHOW_NOTIFICATION') {
    const title = data.title || 'ECOM ACADEMY PRO';
    const options = {
      body: data.body || '',
      icon: data.icon || '/favicon.ico',
      badge: data.badge || '/favicon.ico',
      tag: data.tag || 'ecom-notif',
      renotify: true,
      data: data.payload || {},
      requireInteraction: !!data.requireInteraction
    };
    event.waitUntil(self.registration.showNotification(title, options));
  }
});

// Clic sur la notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const payload = event.notification.data || {};
  let url = payload.url || '/';
  if (payload.signToken) {
    url = '/?sign=' + encodeURIComponent(payload.signToken);
  } else if (payload.path) {
    url = payload.path;
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({ type: 'NOTIFICATION_CLICK', payload: payload });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// Push distant (si un serveur envoie un payload JSON)
self.addEventListener('push', (event) => {
  let title = 'ECOM ACADEMY PRO';
  let options = {
    body: 'Nouvelle notification',
    icon: '/favicon.ico',
    data: {}
  };
  try {
    if (event.data) {
      const json = event.data.json();
      title = json.title || title;
      options.body = json.body || options.body;
      options.tag = json.tag || 'ecom-push';
      options.data = json.data || {};
      if (json.icon) options.icon = json.icon;
    }
  } catch (e) {
    if (event.data) {
      options.body = event.data.text();
    }
  }
  event.waitUntil(self.registration.showNotification(title, options));
});
