import { Router } from "express";
import type { RequestHandler } from "express";
import { createProtectedDomainRoutes } from "./domain.routes.js";

export interface UsageRouteHandlers {
  readonly getSummary: RequestHandler;
  readonly listEvents: RequestHandler;
}

export function createUsageRoutes(
  authenticate: RequestHandler,
  handlers: UsageRouteHandlers,
): Router {
  return createProtectedDomainRoutes(authenticate, [
    { method: "get", path: "/summary", handler: handlers.getSummary },
    { method: "get", path: "/events", handler: handlers.listEvents },
  ]);
}
