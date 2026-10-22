import type { Request, Response } from "express";
import { getHealthStatus } from "../health/health.service.js";
import { getLivenessStatus } from "../health/liveness.js";
import { getReadinessStatus } from "../health/readiness.js";

export async function healthController(_req: Request, res: Response) {
  return res.status(200).json(await getHealthStatus());
}

export function livenessController(_req: Request, res: Response) {
  return res.status(200).json(getLivenessStatus());
}

export async function readinessController(_req: Request, res: Response) {
  const status = await getReadinessStatus();
  return res.status(status.success ? 200 : 503).json(status);
}