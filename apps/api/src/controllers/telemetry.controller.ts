import type { Request, Response } from "express";
import { telemetryService } from "../services/telemetry/telemetry-service.js";

export function telemetryController(_req: Request, res: Response) {
  res.status(200).json({
    success: true,
    records: telemetryService.list(),
  });
}
