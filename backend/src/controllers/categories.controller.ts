import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import * as categoriesService from "../services/categories.service.js";
import { getParam } from "../utils/request.js";

// Category controllers
export async function createCategory(req: AuthRequest, res: Response) {
  try {
    const category = await categoriesService.createCategory(req.body);
    res.status(201).json(category);
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ message: "Failed to create category" });
  }
}

export async function updateCategory(req: AuthRequest, res: Response) {
  try {
    const category = await categoriesService.updateCategory(
      getParam(req.params.id),
      req.body,
    );
    res.json(category);
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({ message: "Failed to update category" });
  }
}

export async function deleteCategory(req: AuthRequest, res: Response) {
  try {
    await categoriesService.deleteCategory(getParam(req.params.id));
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ message: "Failed to delete category" });
  }
}

// Subcategory controllers
export async function createSubcategory(req: AuthRequest, res: Response) {
  try {
    const subcategory = await categoriesService.createSubcategory(req.body);
    res.status(201).json(subcategory);
  } catch (error) {
    console.error("Create subcategory error:", error);
    res.status(500).json({ message: "Failed to create subcategory" });
  }
}

export async function updateSubcategory(req: AuthRequest, res: Response) {
  try {
    const subcategory = await categoriesService.updateSubcategory(
      getParam(req.params.id),
      req.body,
    );
    res.json(subcategory);
  } catch (error) {
    console.error("Update subcategory error:", error);
    res.status(500).json({ message: "Failed to update subcategory" });
  }
}

export async function deleteSubcategory(req: AuthRequest, res: Response) {
  try {
    await categoriesService.deleteSubcategory(getParam(req.params.id));
    res.json({ message: "Subcategory deleted successfully" });
  } catch (error) {
    console.error("Delete subcategory error:", error);
    res.status(500).json({ message: "Failed to delete subcategory" });
  }
}
