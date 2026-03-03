import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import { useCloudinary } from "../middleware/upload.middleware.js";

// Cloudinary yapilandirmasi (CLOUDINARY_URL env var otomatik parse edilir)
if (useCloudinary) {
  cloudinary.config({ secure: true });
  console.log("☁️ Cloudinary aktif - gorseller CDN'e yuklenecek");
}

// Buffer'dan Cloudinary'ye yukle
function uploadToCloudinary(
  buffer: Buffer,
): Promise<{ url: string; public_id: string; bytes: number }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "kiosk",
        resource_type: "image",
        format: "webp",
        quality: "auto:good",
        transformation: [{ width: 1200, crop: "limit" }],
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary upload basarisiz"));
          return;
        }
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
          bytes: result.bytes,
        });
      },
    );
    stream.end(buffer);
  });
}

export async function uploadImageHandler(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Dosya bulunamadı" });
    }

    if (useCloudinary && req.file.buffer) {
      // Cloudinary'ye yukle
      const result = await uploadToCloudinary(req.file.buffer);
      res.json({
        url: result.url,
        filename: result.public_id,
        size: result.bytes,
        mimetype: "image/webp",
      });
    } else {
      // Local dosya sistemi
      const url = `/uploads/${req.file.filename}`;
      res.json({
        url,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
      });
    }
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Dosya yüklenirken hata oluştu" });
  }
}

export async function uploadMultipleImagesHandler(req: Request, res: Response) {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: "Dosya bulunamadı" });
    }

    if (useCloudinary) {
      // Tum dosyalari paralel Cloudinary'ye yukle
      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.buffer),
      );
      const results = await Promise.all(uploadPromises);

      const images = results.map((result) => ({
        url: result.url,
        filename: result.public_id,
        size: result.bytes,
        mimetype: "image/webp",
      }));

      res.json({ images });
    } else {
      // Local dosya sistemi
      const images = req.files.map((file) => ({
        url: `/uploads/${file.filename}`,
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype,
      }));

      res.json({ images });
    }
  } catch (error) {
    console.error("Multiple upload error:", error);
    res.status(500).json({ error: "Dosyalar yüklenirken hata oluştu" });
  }
}
