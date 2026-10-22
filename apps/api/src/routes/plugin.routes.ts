import { Router } from "express";
import type { RequestHandler } from "express";
import { createProtectedDomainRoutes } from "./domain.routes.js";

export interface PluginRouteHandlers {
  readonly list: RequestHandler;
  readonly connect: RequestHandler;
  readonly disconnect: RequestHandler;
}

export function createPluginRoutes(
  authenticate: RequestHandler,
  handlers: PluginRouteHandlers,
): Router {
  return createProtectedDomainRoutes(authenticate, [
    { method: "get", path: "/", handler: handlers.list },
    { method: "post", path: "/:pluginId/connect", handler: handlers.connect },
    { method: "post", path: "/:pluginId/disconnect", handler: handlers.disconnect },
  ]);
}
