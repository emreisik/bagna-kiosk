import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { prisma } from "../config/database.js";
import * as excelImportService from "../services/excel-import.service.js";

export async function bulkImportHandler(req: AuthRequest, res: Response) {
  try {
    const adminId = req.adminId;
    if (!adminId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      include: { brands: true },
    });

    if (!admin) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { products, brandId, status } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      res.status(400).json({ message: "Urun listesi bos veya gecersiz" });
      return;
    }

    // Brand yetkisi kontrolu
    if (admin.role !== "super_admin" && admin.brands.length > 0 && brandId) {
      const authorizedBrandIds = admin.brands.map((b) => b.brandId);
      if (!authorizedBrandIds.includes(brandId)) {
        res.status(403).json({
          message: "Bu marka icin urun olusturma yetkiniz yok",
        });
        return;
      }
    }

    const result = await excelImportService.bulkImportProducts(
      { products, brandId, status },
      admin.role,
      admin.requiresApproval,
    );

    res.json({
      message: `${result.created} urun olusturuldu, ${result.skipped} atlandi`,
      ...result,
    });
  } catch (error: any) {
    console.error("Bulk import error:", error);
    res.status(500).json({
      message: error.message || "Toplu import sirasinda hata olustu",
    });
  }
}

export async function addPhotosToProductHandler(
  req: AuthRequest,
  res: Response,
) {
  try {
    const adminId = req.adminId;
    if (!adminId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { productCode, imageUrls, replaceExisting } = req.body;

    if (!productCode || !imageUrls || !Array.isArray(imageUrls)) {
      res.status(400).json({ message: "productCode ve imageUrls gerekli" });
      return;
    }

    const product = await excelImportService.findProductByCode(productCode);

    if (!product) {
      res.status(404).json({ message: `Urun bulunamadi: ${productCode}` });
      return;
    }

    const updated = await excelImportService.addImagesToProduct(
      product.id,
      imageUrls,
      replaceExisting ?? false,
    );

    res.json(updated);
  } catch (error: any) {
    console.error("Add photos error:", error);
    res.status(500).json({
      message: error.message || "Fotograf ekleme sirasinda hata olustu",
    });
  }
}

// Urun koduna gore urun varligini kontrol et
export async function checkProductCodeHandler(req: AuthRequest, res: Response) {
  try {
    const adminId = req.adminId;
    if (!adminId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const productCode = req.query.code as string;
    if (!productCode) {
      res.status(400).json({ message: "code parametresi gerekli" });
      return;
    }

    const product = await excelImportService.findProductByCode(productCode);

    res.json({
      exists: !!product,
      product: product
        ? {
            id: product.id,
            productCode: product.productCode,
            imageCount: product.images.length,
          }
        : null,
    });
  } catch (error: any) {
    console.error("Check product code error:", error);
    res.status(500).json({ message: "Kontrol sirasinda hata olustu" });
  }
}
