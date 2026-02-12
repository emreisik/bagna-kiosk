import { Router } from "express";
import * as controller from "../controllers/products.controller.js";

const router = Router();

router.get("/", controller.getAllProducts);
router.get("/:id", controller.getProductById);
router.get("/:id/similar", controller.getSimilarProducts);

export default router;
