import { Router } from "express";
import * as brandsController from "../controllers/brands.controller.js";

const router = Router();

// Public routes - no auth required
router.get("/", brandsController.getAllBrandsPublic);
router.get("/:slug", brandsController.getBrandBySlug);

export default router;
