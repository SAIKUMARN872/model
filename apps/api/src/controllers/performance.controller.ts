import type { Request, Response } from "express";
import { performanceService } from "../services/performance/index.js";

export function performanceController(_req: Request, res: Response) {
  res.status(200).json({
    success: true,
    models: performanceService.listModelPerformance(),
  });
}
