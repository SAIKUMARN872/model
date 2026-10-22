import type { RequestHandler } from "express";
import {
  createTraceContext,
  formatTraceparent,
  parseTraceparent,
} from "../telemetry/tracing.js";

export const requestTracingMiddleware: RequestHandler = (req, res, next) => {
  const incoming = req.headers.traceparent;
  const parsed = typeof incoming === "string"
    ? parseTraceparent(incoming)
    : undefined;

  const parent = parsed ?? createTraceContext();
  const traceContext = Object.freeze({
    traceId: parent.traceId,
    spanId: createTraceContext().spanId,
    traceFlags: parent.traceFlags,
  });

  res.locals.traceContext = traceContext;
  res.setHeader("traceparent", formatTraceparent(traceContext));

  next();
};