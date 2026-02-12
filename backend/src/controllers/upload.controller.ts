import { Request, Response } from "express";

export async function uploadImageHandler(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Dosya bulunamadı" });
    }

    // Local URL oluştur
    const url = `/uploads/${req.file.filename}`;

    res.json({
      url,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
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

    const images = req.files.map((file) => ({
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
    }));

    res.json({ images });
  } catch (error) {
    console.error("Multiple upload error:", error);
    res.status(500).json({ error: "Dosyalar yüklenirken hata oluştu" });
  }
}
