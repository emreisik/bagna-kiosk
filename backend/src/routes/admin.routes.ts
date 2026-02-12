import { Router } from "express";
import * as adminController from "../controllers/admin.controller.js";
import * as brandsController from "../controllers/brands.controller.js";
import * as categoriesController from "../controllers/categories.controller.js";
import * as usersController from "../controllers/users.controller.js";
import * as settingsController from "../controllers/settings.controller.js";
import * as uploadController from "../controllers/upload.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

// Public route - no auth required
router.post("/login", adminController.loginHandler);

// Products (Protected)
router.get("/products", authMiddleware, adminController.getProductsHandler);
router.post("/products", authMiddleware, adminController.createProductHandler);
router.put(
  "/products/:id",
  authMiddleware,
  adminController.updateProductHandler,
);
router.delete(
  "/products/:id",
  authMiddleware,
  adminController.deleteProductHandler,
);
router.post(
  "/products/:id/approve",
  authMiddleware,
  adminController.approveProductHandler,
);
router.post(
  "/products/:id/reject",
  authMiddleware,
  adminController.rejectProductHandler,
);

// Brands (Protected)
router.get("/brands", authMiddleware, brandsController.getAllBrands);
router.get("/brands/:id", authMiddleware, brandsController.getBrand);
router.post("/brands", authMiddleware, brandsController.createBrand);
router.put("/brands/:id", authMiddleware, brandsController.updateBrand);
router.delete("/brands/:id", authMiddleware, brandsController.deleteBrand);

// Categories (Protected)
router.post("/categories", authMiddleware, categoriesController.createCategory);
router.put(
  "/categories/:id",
  authMiddleware,
  categoriesController.updateCategory,
);
router.delete(
  "/categories/:id",
  authMiddleware,
  categoriesController.deleteCategory,
);

// Subcategories (Protected)
router.post(
  "/subcategories",
  authMiddleware,
  categoriesController.createSubcategory,
);
router.put(
  "/subcategories/:id",
  authMiddleware,
  categoriesController.updateSubcategory,
);
router.delete(
  "/subcategories/:id",
  authMiddleware,
  categoriesController.deleteSubcategory,
);

// Users (Protected - Super Admin only)
router.get("/users", authMiddleware, usersController.getAllUsers);
router.get("/users/:id", authMiddleware, usersController.getUser);
router.post("/users", authMiddleware, usersController.createUser);
router.put("/users/:id", authMiddleware, usersController.updateUser);
router.delete("/users/:id", authMiddleware, usersController.deleteUser);

// Settings (Protected)
router.get("/settings", authMiddleware, settingsController.getAllSettings);
router.get("/settings/:key", authMiddleware, settingsController.getSetting);
router.post("/settings", authMiddleware, settingsController.upsertSetting);
router.delete(
  "/settings/:key",
  authMiddleware,
  settingsController.deleteSetting,
);
router.post(
  "/settings/clear-cache",
  authMiddleware,
  settingsController.clearCache,
);

// Upload (Protected)
router.post(
  "/upload/image",
  authMiddleware,
  upload.single("image"),
  uploadController.uploadImageHandler,
);
router.post(
  "/upload/images",
  authMiddleware,
  upload.array("images", 10), // Max 10 images
  uploadController.uploadMultipleImagesHandler,
);

export default router;
