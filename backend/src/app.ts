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
        // Production modda sadece FRONTEND_URL'e izin ver
        if (!origin || origin === config.FRONTEND_URL) {
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

  // Error handling
  const { errorMiddleware } = await import("./middleware/error.middleware.js");
  app.use(errorMiddleware);

  return app;
}
