import { Router } from "express";
import productsRouter from "./products.routes.js";
import categoriesRouter from "./categories.routes.js";
import settingsRouter from "./settings.routes.js";
import adminRouter from "./admin.routes.js";
import brandsRouter from "./brands.routes.js";
import ordersRouter from "./orders.routes.js";

const router = Router();

router.use("/products", productsRouter);
router.use("/categories", categoriesRouter);
router.use("/settings", settingsRouter);
router.use("/brands", brandsRouter);
router.use("/admin", adminRouter);
router.use("/orders", ordersRouter);

export default router;
