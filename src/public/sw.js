const CACHE_NAME = "story-app-shell-v2";
const RUNTIME = "story-app-runtime-v1";
const MAP_CACHE = "story-app-map-cache-v1";

const APP_SHELL = [
  "/",
  "/index.html",
  "/404.html", // ✅ Tambahkan halaman 404 ke cache
  "/manifest.json",
  "/images/logo.png",
  "/favicon.png",
  "/style/styles.css",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Caching app shell");
        return cache.addAll(APP_SHELL);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  const allowedCaches = [CACHE_NAME, RUNTIME, MAP_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (!allowedCaches.includes(key)) {
              console.log("Deleting old cache", key);
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
    event.respondWith(
      caches.match(request).then((response) => response || fetch(request))
    );
    return;
  }

  if (url.hostname.includes("tile.openstreetmap.org")) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        const networkPromise = new Promise((resolve, reject) => {
          const timeoutId = setTimeout(
            () => reject(new Error("Request timeout")),
            3000
          );

          fetch(request)
            .then((response) => {
              clearTimeout(timeoutId);
              const responseClone = response.clone();
              caches.open(MAP_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
              resolve(response);
            })
            .catch((err) => {
              clearTimeout(timeoutId);
              reject(err);
            });
        });

        return networkPromise.catch((error) => {
          console.log("Map tile fetch failed:", error);
          return new Response("Map tile unavailable", {
            status: 503,
            headers: { "Content-Type": "text/plain" },
          });
        });
      })
    );
    return;
  }

  if (
    url.origin === self.location.origin &&
    /\.(js|css|png|jpg|jpeg|gif|woff2?)$/.test(url.pathname)
  ) {
    event.respondWith(
      caches.open(RUNTIME).then((cache) =>
        fetch(request)
          .then((response) => {
            cache.put(request, response.clone());
            return response;
          })
          .catch(() => {
            console.log("Serving from cache:", request.url);
            return caches.match(request);
          })
      )
    );
    return;
  }

  if (url.pathname.includes("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }

          const responseClone = response.clone();
          caches.open(RUNTIME).then((cache) => {
            cache.put(request, responseClone);
          });

          return response;
        })
        .catch((error) => {
          console.log("API request failed, checking cache:", error);
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }

            return new Response(
              JSON.stringify({
                error: "Network error",
                message: "Failed to fetch data. Please check your connection.",
              }),
              {
                status: 503,
                headers: { "Content-Type": "application/json" },
              }
            );
          });
        })
    );
    return;
  }

  // ✅ Handle halaman tidak dikenal
  event.respondWith(
    fetch(request).catch(() => {
      console.log("Fallback for:", request.url);
      if (request.mode === "navigate" && url.origin === self.location.origin) {
        return caches.match("/404.html");
      }

      return new Response("Network error", {
        status: 503,
        headers: { "Content-Type": "text/plain" },
      });
    })
  );
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
