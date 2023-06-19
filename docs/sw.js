import { getTestValue } from './db.js';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  console.log('SW - fetching: ', event);
  event.waitUntil(
    (async () => {
      if (!event.clientId) return;
      const client = await clients.get(event.clientId);
      if (!client) return console.warn('No client?');
      const result = await getTestValue();
      console.log('Value: ', result);
      client.postMessage({
        msg: result
      });
    })()
  );
});
