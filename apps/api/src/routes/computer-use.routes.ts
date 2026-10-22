import { Router } from "express";
import type { RequestHandler } from "express";
import { createProtectedDomainRoutes } from "./domain.routes.js";

export interface ComputerUseRouteHandlers {
  readonly createSession: RequestHandler;
  readonly getSession: RequestHandler;
  readonly executeAction: RequestHandler;
  readonly closeSession: RequestHandler;
}

export function createComputerUseRoutes(
  authenticate: RequestHandler,
  handlers: ComputerUseRouteHandlers,
): Router {
  return createProtectedDomainRoutes(authenticate, [
    { method: "post", path: "/sessions", handler: handlers.createSession },
    { method: "get", path: "/sessions/:sessionId", handler: handlers.getSession },
    { method: "post", path: "/sessions/:sessionId/actions", handler: handlers.executeAction },
    { method: "delete", path: "/sessions/:sessionId", handler: handlers.closeSession },
  ]);
}
