import { Router } from "express";
import type { RequestHandler } from "express";
import { createProtectedDomainRoutes } from "./domain.routes.js";

export interface AutomationRouteHandlers {
  readonly create: RequestHandler;
  readonly list: RequestHandler;
  readonly get: RequestHandler;
  readonly update: RequestHandler;
  readonly delete: RequestHandler;
  readonly run: RequestHandler;
}

export function createAutomationRoutes(
  authenticate: RequestHandler,
  handlers: AutomationRouteHandlers,
): Router {
  return createProtectedDomainRoutes(authenticate, [
    { method: "post", path: "/", handler: handlers.create },
    { method: "get", path: "/", handler: handlers.list },
    { method: "get", path: "/:automationId", handler: handlers.get },
    { method: "patch", path: "/:automationId", handler: handlers.update },
    { method: "delete", path: "/:automationId", handler: handlers.delete },
    { method: "post", path: "/:automationId/run", handler: handlers.run },
  ]);
}
