import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";
import "express-async-errors";
import { config } from "./config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createApp(): Promise<Express> {
  const app = express();

  // Security & Performance Middleware
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }, // Görsellere erişim için
      contentSecurityPolicy:
        config.NODE_ENV === "production"
          ? {
              directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"], // Vite inline scripts için
                styleSrc: ["'self'", "'unsafe-inline'"], // Tailwind inline styles için
                imgSrc: [
                  "'self'",
                  "data:",
                  "https:",
                  "http:", // Allow all HTTP sources (includes localhost and local IPs)
                ],
                connectSrc: ["'self'", "https://api.qrserver.com"], // QR code API için
              },
            }
          : false,
    }),
  );
  app.use(compression());

  // CORS configuration
  const corsOptions = {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Development modda tüm localhost portlarına izin ver
      if (config.NODE_ENV === "development") {
        // Same-origin istekler (origin undefined) veya localhost istekleri
        if (
          !origin ||
          origin.startsWith("http://localhost:") ||
          origin.startsWith("http://127.0.0.1:")
        ) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      } else {
        // Production modda same-origin (backend frontend'i serve eder)
        // Same-origin isteklerde origin header gelmez, bu yüzden !origin check yeterli
        if (
          !origin ||
          (config.FRONTEND_URL && origin === config.FRONTEND_URL)
        ) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      }
    },
    credentials: true,
  };

  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Static files - uploaded images
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

  // Health check
  app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      env: config.NODE_ENV,
    });
  });

  // API Routes
  const routes = await import("./routes/index.js");
  app.use("/api", routes.default);

  // Frontend static files (Production only)
  if (config.NODE_ENV === "production") {
    const frontendDistPath = path.join(__dirname, "../../dist");

    // Clear-Site-Data: Eski bozuk SW cache'lerini sunucu tarafından temizle
    // Tarayıcı bu header'ı gördüğünde tüm cache/storage'ı siler
    // NOT: Tüm client'lar temizlendikten sonra bu blok kaldırılabilir
    app.use((req, res, next) => {
      // Sadece HTML navigation isteklerinde tetikle (asset'lere dokunma)
      const accept = req.headers.accept || "";
      if (
        accept.includes("text/html") &&
        !req.path.startsWith("/api/") &&
        !req.path.startsWith("/uploads/")
      ) {
        res.setHeader("Clear-Site-Data", '"cache", "storage"');
      }
      next();
    });

    // Hashed assets: immutable cache (dosya adı hash içerir, sonsuza kadar cache'lenebilir)
    app.use(
      "/assets",
      express.static(path.join(frontendDistPath, "assets"), {
        maxAge: "1y",
        immutable: true,
      }),
    );

    // Root static files (favicon, manifest, sw.js): kısa cache
    app.use(
      express.static(frontendDistPath, {
        maxAge: 0,
        setHeaders: (res, filePath) => {
          // SW ve manifest her zaman taze olmalı
          if (filePath.endsWith("sw.js") || filePath.endsWith(".webmanifest")) {
            res.setHeader(
              "Cache-Control",
              "no-cache, no-store, must-revalidate",
            );
          }
        },
      }),
    );

    // SPA fallback - sadece navigation istekleri (dosya uzantısı olmayanlar)
    app.get("*", (req, res) => {
      // Dosya uzantısı olan istekleri 404 yap (eski hash'li asset'ler)
      if (req.path.includes(".") && req.path.startsWith("/assets/")) {
        res.status(404).send("Asset not found");
        return;
      }

      const indexPath = path.join(frontendDistPath, "index.html");
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache");
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error("❌ Failed to send index.html:", err);
          res.status(404).send("Frontend not found. Build may have failed.");
        }
      });
    });
  }

  // Error handling
  const { errorMiddleware } = await import("./middleware/error.middleware.js");
  app.use(errorMiddleware);

  return app;
}
