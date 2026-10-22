import type { RequestHandler } from "express";
import { logger } from "../config/logging.js";
import { recordHttpRequest } from "../telemetry/metrics.js";

export const requestLoggerMiddleware: RequestHandler = (req, res, next) => {
  const startedAt = process.hrtime.bigint();

  res.once("finish", () => {
    const rawDurationMs =
      Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const durationMs = Math.round(rawDurationMs * 100) / 100;

    recordHttpRequest({
      method: req.method,
      statusCode: res.statusCode,
      durationMs,
    });

    logger.info("HTTP request completed", {
      requestId: res.locals.requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs,
    });
  });

  next();
};