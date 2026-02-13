import { Request, Response, NextFunction } from "express";

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error("❌ Error occurred:");
  console.error("  Path:", req.method, req.path);
  console.error("  URL:", req.originalUrl);
  console.error("  Message:", err.message);
  console.error("  Stack:", err.stack);
  console.error("  User-Agent:", req.headers["user-agent"]);
  console.error("  Accept:", req.headers["accept"]);
  console.error("  Accept-Encoding:", req.headers["accept-encoding"]);

  // Log request body (excluding sensitive fields)
  if (req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = "[REDACTED]";
    console.error("  Body:", JSON.stringify(sanitizedBody, null, 2));
  }

  // Headers zaten gönderildiyse tekrar gönderme
  if (res.headersSent) {
    console.error("  ⚠️ Headers already sent, cannot send error response");
    return;
  }

  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
    path: req.path,
  });
}
