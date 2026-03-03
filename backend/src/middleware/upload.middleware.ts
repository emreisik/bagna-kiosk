import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { config } from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload klasörü: UPLOAD_DIR env var veya default relative path (Cloudinary yoksa kullanilir)
export const uploadDir =
  config.UPLOAD_DIR || path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cloudinary varsa memory storage (buffer -> Cloudinary), yoksa disk storage (local dosya)
const useCloudinary = !!config.CLOUDINARY_URL;

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  },
});

const memoryStorage = multer.memoryStorage();

// File filter - sadece belirli resim formatlarini kabul et
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(
      new Error("Sadece JPEG, PNG, GIF ve WebP formatları kabul edilmektedir"),
    );
  }
};

// Multer instance
export const upload = multer({
  storage: useCloudinary ? memoryStorage : diskStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

export { useCloudinary };
