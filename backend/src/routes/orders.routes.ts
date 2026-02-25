import { Router } from "express";
import * as ordersController from "../controllers/orders.controller.js";

const router = Router();

// Public: kiosk kullanicilari auth olmadan siparis olusturabilir
router.post("/", ordersController.createOrder);

export default router;
