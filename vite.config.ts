import { defineConfig } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png"],
      manifest: {
        name: "Kiosk QR - Katalog",
        short_name: "Kiosk QR",
        description: "Premium minimal kiosk katalog deneyimi",
        theme_color: "#000000",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "any",
        start_url: "/",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        // Eski bozuk cache'i temizle
        cleanupOutdatedCaches: true,
        // Yeni SW hemen devreye girsin
        skipWaiting: true,
        clientsClaim: true,
        // Cloudinary gibi harici CDN URL'lerini SW'den haric tut
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            // Cloudinary gorselleri - NetworkFirst (CDN zaten hizli, SW karismasin)
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "cloudinary-images",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 gun
              },
              networkTimeoutSeconds: 5,
            },
          },
          {
            // Yerel gorseller (same-origin) - StaleWhileRevalidate
            urlPattern: /\/uploads\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "uploads-cache",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 gun
              },
            },
          },
          {
            urlPattern: /\/api\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 dakika
              },
              networkTimeoutSeconds: 10,
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ["**/*.svg", "**/*.csv"],

  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/uploads": {
        target: "https://bagnaxclusive.com",
        changeOrigin: true,
      },
    },
  },
});
