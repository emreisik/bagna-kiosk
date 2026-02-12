import { Request, Response } from "express";
import * as adminService from "../services/admin.service.js";
import * as productsService from "../services/products.service.js";
import { AuthRequest } from "../middleware/auth.middleware.js";
import { prisma } from "../config/database.js";

export async function loginHandler(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const result = await adminService.login({ email, password });
    res.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid credentials") {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getProductsHandler(req: AuthRequest, res: Response) {
  try {
    const adminId = req.adminId;
    if (!adminId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Get admin with brands
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      include: { brands: true },
    });

    if (!admin) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // If brand-specific admin (has brand assignments), filter by authorized brands
    // Super admins and admins without brand assignments can see all products
    // IMPORTANT: Pass empty array for super_admin to show ALL statuses (not just approved)
    let brandIds: string[] | undefined = [];
    if (admin.role !== "super_admin" && admin.brands.length > 0) {
      brandIds = admin.brands.map((b) => b.brandId);
    }

    const params = {
      category: req.query.category as string | undefined,
      subcategory: req.query.subcategory as string | undefined,
      tags: req.query.tags
        ? Array.isArray(req.query.tags)
          ? (req.query.tags as string[])
          : [req.query.tags as string]
        : undefined,
      search: req.query.search as string | undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      brandIds,
    };

    const result = await productsService.getProducts(params);
    res.json(result);
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
}

export async function createProductHandler(req: AuthRequest, res: Response) {
  try {
    const adminId = req.adminId;
    if (!adminId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Get admin with brands
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      include: { brands: true },
    });

    if (!admin) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // If brand-specific admin (has brand assignments), validate brandId
    // Super admins and admins without brand assignments can create for any brand
    if (admin.role !== "super_admin" && admin.brands.length > 0) {
      const authorizedBrandIds = admin.brands.map((b) => b.brandId);

      if (!req.body.brandId) {
        res.status(400).json({ message: "Brand ID is required" });
        return;
      }

      if (!authorizedBrandIds.includes(req.body.brandId)) {
        res.status(403).json({
          message: "You are not authorized to create products for this brand",
        });
        return;
      }
    }

    const product = await adminService.createProduct(
      req.body,
      admin.role,
      admin.requiresApproval,
    );
    res.status(201).json(product);
  } catch (error) {
    console.error("❌ Create product error:", error);

    // Send detailed error message to frontend
    let errorMessage = "Failed to create product";

    if (error instanceof Error) {
      // Check for unique constraint violation (duplicate productCode)
      if (error.message.includes("Unique constraint failed")) {
        if (error.message.includes("productCode")) {
          errorMessage = `Bu ürün kodu zaten mevcut: ${req.body.productCode}`;
        } else {
          errorMessage = "Bu kayıt zaten mevcut (benzersiz alan hatası)";
        }
      } else {
        errorMessage = error.message;
      }
    }

    res.status(400).json({
      message: errorMessage,
      details: error instanceof Error ? error.stack : undefined,
    });
  }
}

export async function updateProductHandler(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const adminId = req.adminId;

    if (!adminId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Get admin with brands
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      include: { brands: true },
    });

    if (!admin) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    console.log("📦 Update product request received:");
    console.log("  Product ID:", id);
    console.log("  Admin role:", admin.role);
    console.log("  Request body:", req.body);
    console.log("  Status in request:", req.body.status);

    // If brand-specific admin (has brand assignments), validate brandId
    // Super admins and admins without brand assignments can update any product
    if (admin.role !== "super_admin" && admin.brands.length > 0) {
      const authorizedBrandIds = admin.brands.map((b) => b.brandId);

      // Get existing product to check current brandId
      const existingProduct = await prisma.product.findUnique({
        where: { id },
      });

      if (!existingProduct) {
        res.status(404).json({ message: "Product not found" });
        return;
      }

      // Check if admin can access existing product
      if (
        existingProduct.brandId &&
        !authorizedBrandIds.includes(existingProduct.brandId)
      ) {
        res
          .status(403)
          .json({ message: "You are not authorized to update this product" });
        return;
      }

      // If changing brandId, validate new brandId
      if (req.body.brandId && req.body.brandId !== existingProduct.brandId) {
        if (!authorizedBrandIds.includes(req.body.brandId)) {
          res.status(403).json({
            message: "You are not authorized to assign products to this brand",
          });
          return;
        }
      }
    }

    const product = await adminService.updateProduct(id, req.body, admin.role);
    console.log("✅ Product updated successfully, new status:", product.status);
    res.json(product);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
}

export async function deleteProductHandler(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    await adminService.deleteProduct(id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
}

export async function approveProductHandler(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const adminId = req.adminId;

    if (!adminId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Get admin
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Only super admins can approve products
    if (admin.role !== "super_admin") {
      res
        .status(403)
        .json({ message: "Only super admins can approve products" });
      return;
    }

    const product = await adminService.approveProduct(id);
    res.json(product);
  } catch (error) {
    console.error("Approve product error:", error);
    res.status(500).json({ message: "Failed to approve product" });
  }
}

export async function rejectProductHandler(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const adminId = req.adminId;

    if (!adminId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Get admin
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Only super admins can reject products
    if (admin.role !== "super_admin") {
      res
        .status(403)
        .json({ message: "Only super admins can reject products" });
      return;
    }

    const product = await adminService.rejectProduct(id);
    res.json(product);
  } catch (error) {
    console.error("Reject product error:", error);
    res.status(500).json({ message: "Failed to reject product" });
  }
}

export async function createCategoryHandler(req: AuthRequest, res: Response) {
  try {
    const { name, displayName } = req.body;
    const category = await adminService.createCategory(name, displayName);
    res.status(201).json(category);
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ message: "Failed to create category" });
  }
}
