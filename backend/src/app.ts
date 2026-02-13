import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import path from "path";
import fs from "fs";
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
      // Origin yoksa izin ver (same-origin istekler, curl, vb.)
      if (!origin) {
        callback(null, true);
        return;
      }

      if (config.NODE_ENV === "development") {
        if (
          origin.startsWith("http://localhost:") ||
          origin.startsWith("http://127.0.0.1:")
        ) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      } else {
        // Production: FRONTEND_URL veya aynı domain izinli
        if (config.FRONTEND_URL && origin === config.FRONTEND_URL) {
          callback(null, true);
        } else {
          // Railway domain'i otomatik algıla - same-origin crossorigin istekleri için
          console.warn(
            `⚠️ CORS: origin=${origin} reddedildi (FRONTEND_URL=${config.FRONTEND_URL || "YOK"})`,
          );
          callback(new Error("Not allowed by CORS"));
        }
      }
    },
    credentials: true,
  };

  // CORS sadece API route'larına uygula
  // Static dosyalar (JS/CSS/images) CORS gerektirmez ve Vite'ın crossorigin attribute'u
  // nedeniyle browser same-origin'de bile Origin header gönderir
  app.use("/api", cors(corsOptions));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Static files - uploaded images (30 gün cache, görseller nadiren değişir)
  app.use(
    "/uploads",
    express.static(path.join(__dirname, "../uploads"), {
      maxAge: "30d",
    }),
  );

  // Frontend dist path (production'da kullanılır)
  const frontendDistPath = path.join(__dirname, "../../dist");

  // Health check - frontend dosyalarını da kontrol et
  app.get("/health", (_req, res) => {
    const distExists = fs.existsSync(frontendDistPath);
    const indexExists = fs.existsSync(
      path.join(frontendDistPath, "index.html"),
    );
    const assetsExists = fs.existsSync(path.join(frontendDistPath, "assets"));

    res.json({
      status: distExists && indexExists ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      env: config.NODE_ENV,
      frontend: {
        distExists,
        indexExists,
        assetsExists,
      },
    });
  });

  // Diagnostik endpoint - Railway dosya sistemi durumunu görmek için
  app.get("/api/debug", (_req, res) => {
    const info: Record<string, unknown> = {
      __dirname,
      frontendDistPath,
      cwd: process.cwd(),
      nodeVersion: process.version,
      env: config.NODE_ENV,
    };

    // dist/ klasörünü kontrol et
    if (fs.existsSync(frontendDistPath)) {
      info.distFiles = fs.readdirSync(frontendDistPath);
      const assetsPath = path.join(frontendDistPath, "assets");
      if (fs.existsSync(assetsPath)) {
        info.assetFiles = fs.readdirSync(assetsPath);
      } else {
        info.assetFiles = "ASSETS KLASÖRÜ YOK!";
      }
    } else {
      info.distFiles = "DIST KLASÖRÜ YOK!";
      info.assetFiles = "DIST YOK, ASSETS DE YOK!";
    }

    res.json(info);
  });

  // API Routes
  const routes = await import("./routes/index.js");
  app.use("/api", routes.default);

  // Frontend static files (Production only)
  if (config.NODE_ENV === "production") {
    console.log(`📁 Frontend dist path: ${frontendDistPath}`);
    console.log(`📁 Dist exists: ${fs.existsSync(frontendDistPath)}`);
    if (fs.existsSync(frontendDistPath)) {
      console.log(
        `📁 Dist contents: ${fs.readdirSync(frontendDistPath).join(", ")}`,
      );
      const ap = path.join(frontendDistPath, "assets");
      if (fs.existsSync(ap)) {
        console.log(`📁 Assets contents: ${fs.readdirSync(ap).join(", ")}`);
      }
    }

    // Hashed assets: 1 saat cache
    app.use(
      "/assets",
      express.static(path.join(frontendDistPath, "assets"), {
        maxAge: "1h",
      }),
    );

    // Root static files (favicon, robots.txt)
    app.use(express.static(frontendDistPath, { maxAge: "1h" }));

    // SPA fallback - sadece HTML sayfaları için, asset isteklerini yakala ve logla
    app.get("*", (req, res) => {
      // Asset isteği SPA fallback'e düştüyse, dosya bulunamadı demektir
      if (req.path.startsWith("/assets/")) {
        console.warn(`⚠️ Asset bulunamadı (SPA fallback'e düştü): ${req.path}`);
        console.warn(`  User-Agent: ${req.headers["user-agent"]}`);
        console.warn(`  Accept: ${req.headers["accept"]}`);
        res.status(404).send("Asset not found");
        return;
      }

      const indexPath = path.join(frontendDistPath, "index.html");
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Cache-Control", "no-cache");
      res.sendFile(indexPath, (err) => {
        if (err) {
          console.error("❌ Failed to send index.html:", err);
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
