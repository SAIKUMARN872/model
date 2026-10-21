import type { Request, Response } from "express";

export function healthController(_req: Request, res: Response) {
  res.status(200).json({
    success: true,
    service: "modelnow-api",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
}
