import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

export interface AuthRequest extends Request {
  adminId?: string;
}

export function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const decoded = jwt.verify(token, config.JWT_SECRET) as {
      adminId: string;
    };

    req.adminId = decoded.adminId;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: "Token expired" });
      return;
    }
    res.status(500).json({ message: "Authentication error" });
  }
}
