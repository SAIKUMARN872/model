import { Router } from "express";
import type { RequestHandler } from "express";
import { createProtectedDomainRoutes } from "./domain.routes.js";

export interface ModelRouteHandlers {
  readonly list: RequestHandler;
  readonly get: RequestHandler;
}

export function createModelRoutes(
  authenticate: RequestHandler,
  handlers: ModelRouteHandlers,
): Router {
  return createProtectedDomainRoutes(authenticate, [
    { method: "get", path: "/", handler: handlers.list },
    { method: "get", path: "/:modelId", handler: handlers.get },
  ]);
}
