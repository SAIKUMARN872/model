import { Router } from "express";
import type { RequestHandler } from "express";
import { createProtectedDomainRoutes } from "./domain.routes.js";

export interface ExecutionRouteHandlers {
  readonly create: RequestHandler;
  readonly get: RequestHandler;
  readonly cancel: RequestHandler;
}

export function createExecutionRoutes(
  authenticate: RequestHandler,
  handlers: ExecutionRouteHandlers,
): Router {
  return createProtectedDomainRoutes(authenticate, [
    { method: "post", path: "/", handler: handlers.create },
    { method: "get", path: "/:executionId", handler: handlers.get },
    { method: "post", path: "/:executionId/cancel", handler: handlers.cancel },
  ]);
}
