import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import * as brandsService from "../services/brands.service.js";
import { getParam } from "../utils/request.js";

export async function getAllBrands(req: AuthRequest, res: Response) {
  try {
    const brands = await brandsService.getAllBrands();
    res.json(brands);
  } catch (error) {
    console.error("Get brands error:", error);
    res.status(500).json({ message: "Failed to fetch brands" });
  }
}

export async function getBrand(req: AuthRequest, res: Response) {
  try {
    const brand = await brandsService.getBrandById(getParam(req.params.id));
    if (!brand) {
      res.status(404).json({ message: "Brand not found" });
      return;
    }
    res.json(brand);
  } catch (error) {
    console.error("Get brand error:", error);
    res.status(500).json({ message: "Failed to fetch brand" });
  }
}

export async function createBrand(req: AuthRequest, res: Response) {
  try {
    const { name, logo } = req.body;
    const brand = await brandsService.createBrand({ name, logo });
    res.status(201).json(brand);
  } catch (error) {
    console.error("Create brand error:", error);
    res.status(500).json({ message: "Failed to create brand" });
  }
}

export async function updateBrand(req: AuthRequest, res: Response) {
  try {
    const { name, logo } = req.body;
    const brand = await brandsService.updateBrand(getParam(req.params.id), {
      name,
      logo,
    });
    res.json(brand);
  } catch (error) {
    console.error("Update brand error:", error);
    res.status(500).json({ message: "Failed to update brand" });
  }
}

export async function deleteBrand(req: AuthRequest, res: Response) {
  try {
    await brandsService.deleteBrand(getParam(req.params.id));
    res.json({ message: "Brand deleted successfully" });
  } catch (error) {
    console.error("Delete brand error:", error);
    res.status(500).json({ message: "Failed to delete brand" });
  }
}

// Public endpoints - no auth required
export async function getAllBrandsPublic(req: any, res: Response) {
  try {
    const brands = await brandsService.getAllBrands();
    res.json(brands);
  } catch (error) {
    console.error("Get all brands error:", error);
    res.status(500).json({ message: "Failed to fetch brands" });
  }
}

export async function getBrandBySlug(req: any, res: Response) {
  try {
    const brand = await brandsService.getBrandBySlug(getParam(req.params.slug));
    if (!brand) {
      res.status(404).json({ message: "Brand not found" });
      return;
    }
    res.json(brand);
  } catch (error) {
    console.error("Get brand by slug error:", error);
    res.status(500).json({ message: "Failed to fetch brand" });
  }
}
