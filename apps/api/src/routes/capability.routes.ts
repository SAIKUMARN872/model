import { Router } from "express";
import type { RequestHandler } from "express";
import { createProtectedDomainRoutes } from "./domain.routes.js";

export interface CapabilityRouteHandlers {
  readonly list: RequestHandler;
  readonly get: RequestHandler;
}

export function createCapabilityRoutes(
  authenticate: RequestHandler,
  handlers: CapabilityRouteHandlers,
): Router {
  return createProtectedDomainRoutes(authenticate, [
    { method: "get", path: "/", handler: handlers.list },
    { method: "get", path: "/:capabilityId", handler: handlers.get },
  ]);
}
