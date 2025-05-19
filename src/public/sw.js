const CACHE_NAME = "story-app-shell-v2";
const RUNTIME = "story-app-runtime-v1";

const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.json",
  "/images/logo.png",
  "/favicon.png",
  "/style/styles"
];

// Akan diisi otomatis saat install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(APP_SHELL);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  const allowedCaches = [CACHE_NAME, RUNTIME];
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (!allowedCaches.includes(key)) {
              return caches.delete(key);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (APP_SHELL.includes(url.pathname)) {
    event.respondWith(caches.match(request));
    return;
  }

  // Untuk semua file .js .css .woff dsb dari build
  if (
    url.origin === self.location.origin &&
    /\.(js|css|png|woff2?)$/.test(url.pathname)
  ) {
    event.respondWith(
      caches.open(RUNTIME).then((cache) =>
        fetch(request)
          .then((response) => {
            cache.put(request, response.clone());
            return response;
          })
          .catch(() => caches.match(request))
      )
    );
    return;
  }

  // Fallback default
  event.respondWith(fetch(request).catch(() => caches.match("/")));
});

self.addEventListener("push", (event) => {
  console.log("Push event:", event);
  let data = {
    title: "Story berhasil dibuat",
    options: { body: "Ada story baru!" },
  };

  try {
    data = event.data.json();
  } catch (e) {
    console.error("Push message tidak berupa JSON");
  }

  const tag = data.tag || "story-update";

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.options.body,
      icon: "/images/logo.png",
      badge: "/images/logo.png",
      tag: tag,
      renotify: true,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientsArr) => {
        for (const client of clientsArr) {
          if (client.url === "/" && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow("/");
        }
      })
  );
});
