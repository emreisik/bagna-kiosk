// Kill switch: Bu dosya eski Service Worker'ı tamamen kaldırır.
// Tarayıcı SW güncellemesi kontrol ettiğinde bu dosyayı bulur,
// yeni versiyon olarak yükler ve kendini imha eder.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", () => {
  self.registration.unregister();
  self.clients.matchAll({ type: "window" }).then((clients) => {
    clients.forEach((client) => client.navigate(client.url));
  });
});
