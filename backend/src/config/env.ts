import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.string().transform(Number).default("3001"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("7d"),
  // FRONTEND_URL artık gerekli değil - production'da same-origin
  FRONTEND_URL: z.string().url().optional(),
  // Railway Volume mount path - production'da /data/uploads, dev'de relative path
  UPLOAD_DIR: z.string().optional(),
  // Resend email
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().default("noreply@bagnaxclusive.com"),
});

export const config = envSchema.parse(process.env);
