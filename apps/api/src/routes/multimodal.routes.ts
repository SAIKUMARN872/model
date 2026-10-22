import { Router } from "express";
import type { RequestHandler } from "express";
import { createProtectedDomainRoutes } from "./domain.routes.js";

export interface MultimodalRouteHandlers {
  readonly analyze: RequestHandler;
  readonly generate: RequestHandler;
}

export function createMultimodalRoutes(
  authenticate: RequestHandler,
  handlers: MultimodalRouteHandlers,
): Router {
  return createProtectedDomainRoutes(authenticate, [
    { method: "post", path: "/analyze", handler: handlers.analyze },
    { method: "post", path: "/generate", handler: handlers.generate },
  ]);
}
