import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware.js";
import * as settingsService from "../services/settings.service.js";
import { getParam } from "../utils/request.js";

export async function getAllSettings(req: AuthRequest, res: Response) {
  try {
    const settings = await settingsService.getAllSettings();
    res.json(settings);
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({ message: "Failed to fetch settings" });
  }
}

export async function getSetting(req: AuthRequest, res: Response) {
  try {
    const setting = await settingsService.getSettingByKey(
      getParam(req.params.key),
    );
    if (!setting) {
      res.status(404).json({ message: "Setting not found" });
      return;
    }
    res.json(setting);
  } catch (error) {
    console.error("Get setting error:", error);
    res.status(500).json({ message: "Failed to fetch setting" });
  }
}

export async function upsertSetting(req: AuthRequest, res: Response) {
  try {
    const { key, value } = req.body;
    const setting = await settingsService.upsertSetting(key, value);
    res.json(setting);
  } catch (error) {
    console.error("Upsert setting error:", error);
    res.status(500).json({ message: "Failed to save setting" });
  }
}

export async function deleteSetting(req: AuthRequest, res: Response) {
  try {
    await settingsService.deleteSetting(getParam(req.params.key));
    res.json({ message: "Setting deleted successfully" });
  } catch (error) {
    console.error("Delete setting error:", error);
    res.status(500).json({ message: "Failed to delete setting" });
  }
}

export async function clearCache(req: AuthRequest, res: Response) {
  try {
    const timestamp = Date.now().toString();
    await settingsService.upsertSetting("cache_version", timestamp);
    res.json({
      message: "Cache cleared successfully",
      cache_version: timestamp,
    });
  } catch (error) {
    console.error("Clear cache error:", error);
    res.status(500).json({ message: "Failed to clear cache" });
  }
}
