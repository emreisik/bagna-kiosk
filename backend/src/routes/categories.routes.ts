import { Router } from "express";
import * as controller from "../controllers/products.controller.js";

const router = Router();

router.get("/", controller.getCategories);

export default router;
