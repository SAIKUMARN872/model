import { Router } from "express";
import type { RequestHandler } from "express";
import { createProtectedDomainRoutes } from "./domain.routes.js";

export interface ProjectRouteHandlers {
  readonly create: RequestHandler;
  readonly list: RequestHandler;
  readonly get: RequestHandler;
  readonly update: RequestHandler;
  readonly delete: RequestHandler;
}

export function createProjectRoutes(
  authenticate: RequestHandler,
  handlers: ProjectRouteHandlers,
): Router {
  return createProtectedDomainRoutes(authenticate, [
    { method: "post", path: "/", handler: handlers.create },
    { method: "get", path: "/", handler: handlers.list },
    { method: "get", path: "/:projectId", handler: handlers.get },
    { method: "patch", path: "/:projectId", handler: handlers.update },
    { method: "delete", path: "/:projectId", handler: handlers.delete },
  ]);
}
