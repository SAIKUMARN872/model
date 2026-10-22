import { Router } from "express";
import type { RequestHandler } from "express";
import { createProtectedDomainRoutes } from "./domain.routes.js";

export interface SearchRouteHandlers {
  readonly search: RequestHandler;
  readonly get: RequestHandler;
}

export function createSearchRoutes(
  authenticate: RequestHandler,
  handlers: SearchRouteHandlers,
): Router {
  return createProtectedDomainRoutes(authenticate, [
    { method: "post", path: "/", handler: handlers.search },
    { method: "get", path: "/:searchId", handler: handlers.get },
  ]);
}
