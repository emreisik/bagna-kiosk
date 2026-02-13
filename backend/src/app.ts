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

  // Geçici: Eski Service Worker cache temizliği (2026-02-21'e kadar aktif, sonra silinebilir)
  // Clear-Site-Data: "cache" → HTTP cache + Cache API (SW cache) temizler
  // localStorage/cookies'e dokunmaz, sadece cache silinir
  const SW_CLEANUP_DEADLINE = new Date("2026-02-21T00:00:00Z").getTime();
  if (config.NODE_ENV === "production" && Date.now() < SW_CLEANUP_DEADLINE) {
    app.use((_req, res, next) => {
      res.setHeader("Clear-Site-Data", '"cache"');
      next();
    });
  }

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Static files - uploaded images (30 gün cache, görseller nadiren değişir)
  app.use(
    "/uploads",
    express.static(path.join(__dirname, "../uploads"), {
      maxAge: "30d",
    }),
  );

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

    // Hashed assets: immutable cache (dosya adı hash içerir, sonsuza kadar cache'lenebilir)
    app.use(
      "/assets",
      express.static(path.join(frontendDistPath, "assets"), {
        maxAge: "1y",
        immutable: true,
      }),
    );

    // SW kill-switch: asla cache'lenmesin, tarayıcı her zaman güncel versiyonu alsın
    app.get("/sw.js", (_req, res) => {
      res.setHeader("Cache-Control", "no-store");
      res.setHeader("Content-Type", "application/javascript");
      res.sendFile(path.join(frontendDistPath, "sw.js"));
    });

    // Root static files (favicon, robots.txt)
    app.use(express.static(frontendDistPath, { maxAge: "1d" }));

    // SPA fallback
    app.get("*", (req, res) => {
      if (req.path.startsWith("/assets/") && req.path.includes(".")) {
        res.status(404).end();
        return;
      }

      const indexPath = path.join(frontendDistPath, "index.html");
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error("Failed to send index.html:", err);
          res.status(404).send("Frontend not found.");
        }
      });
    });
  }

  // Error handling
  const { errorMiddleware } = await import("./middleware/error.middleware.js");
  app.use(errorMiddleware);

  return app;
}
