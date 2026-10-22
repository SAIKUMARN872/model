import { Router } from "express";
import type { RequestHandler } from "express";
import { createProtectedDomainRoutes } from "./domain.routes.js";

export interface FineTuningRouteHandlers {
  readonly createJob: RequestHandler;
  readonly listJobs: RequestHandler;
  readonly getJob: RequestHandler;
  readonly cancelJob: RequestHandler;
}

export function createFineTuningRoutes(
  authenticate: RequestHandler,
  handlers: FineTuningRouteHandlers,
): Router {
  return createProtectedDomainRoutes(authenticate, [
    { method: "post", path: "/jobs", handler: handlers.createJob },
    { method: "get", path: "/jobs", handler: handlers.listJobs },
    { method: "get", path: "/jobs/:jobId", handler: handlers.getJob },
    { method: "post", path: "/jobs/:jobId/cancel", handler: handlers.cancelJob },
  ]);
}
