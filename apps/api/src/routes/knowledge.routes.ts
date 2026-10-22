import { Router } from "express";
import type { RequestHandler } from "express";
import { createProtectedDomainRoutes } from "./domain.routes.js";

export interface KnowledgeRouteHandlers {
  readonly createCollection: RequestHandler;
  readonly listCollections: RequestHandler;
  readonly getCollection: RequestHandler;
  readonly deleteCollection: RequestHandler;
  readonly addDocument: RequestHandler;
  readonly query: RequestHandler;
}

export function createKnowledgeRoutes(
  authenticate: RequestHandler,
  handlers: KnowledgeRouteHandlers,
): Router {
  return createProtectedDomainRoutes(authenticate, [
    { method: "post", path: "/collections", handler: handlers.createCollection },
    { method: "get", path: "/collections", handler: handlers.listCollections },
    { method: "get", path: "/collections/:collectionId", handler: handlers.getCollection },
    { method: "delete", path: "/collections/:collectionId", handler: handlers.deleteCollection },
    { method: "post", path: "/collections/:collectionId/documents", handler: handlers.addDocument },
    { method: "post", path: "/query", handler: handlers.query },
  ]);
}
