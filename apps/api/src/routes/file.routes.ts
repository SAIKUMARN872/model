import { Router } from "express";
import type { RequestHandler } from "express";
import { createProtectedDomainRoutes } from "./domain.routes.js";

export interface FileRouteHandlers {
  readonly upload: RequestHandler;
  readonly list: RequestHandler;
  readonly get: RequestHandler;
  readonly delete: RequestHandler;
}

export function createFileRoutes(
  authenticate: RequestHandler,
  handlers: FileRouteHandlers,
): Router {
  return createProtectedDomainRoutes(authenticate, [
    { method: "post", path: "/", handler: handlers.upload },
    { method: "get", path: "/", handler: handlers.list },
    { method: "get", path: "/:fileId", handler: handlers.get },
    { method: "delete", path: "/:fileId", handler: handlers.delete },
  ]);
}
