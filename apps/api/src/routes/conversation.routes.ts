import { Router } from "express";
import type { RequestHandler } from "express";
import { createProtectedDomainRoutes } from "./domain.routes.js";

export interface ConversationRouteHandlers {
  readonly create: RequestHandler;
  readonly list: RequestHandler;
  readonly get: RequestHandler;
  readonly update: RequestHandler;
  readonly delete: RequestHandler;
  readonly sendMessage: RequestHandler;
  readonly listMessages: RequestHandler;
}

export function createConversationRoutes(
  authenticate: RequestHandler,
  handlers: ConversationRouteHandlers,
): Router {
  return createProtectedDomainRoutes(authenticate, [
    { method: "post", path: "/", handler: handlers.create },
    { method: "get", path: "/", handler: handlers.list },
    { method: "get", path: "/:conversationId", handler: handlers.get },
    { method: "patch", path: "/:conversationId", handler: handlers.update },
    { method: "delete", path: "/:conversationId", handler: handlers.delete },
    { method: "post", path: "/:conversationId/messages", handler: handlers.sendMessage },
    { method: "get", path: "/:conversationId/messages", handler: handlers.listMessages },
  ]);
}
