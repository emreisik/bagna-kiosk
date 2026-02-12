import { Router } from "express";
import * as settingsController from "../controllers/settings.controller.js";

const router = Router();

// Public settings endpoint - anyone can read
router.get("/", settingsController.getAllSettings);

export default router;
