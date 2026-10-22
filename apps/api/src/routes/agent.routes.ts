import { Router } from "express";
import type { RequestHandler } from "express";

export interface AgentRouteHandlers {
  create: RequestHandler;
  list: RequestHandler;
  get: RequestHandler;
  update: RequestHandler;
  delete: RequestHandler;
  run: RequestHandler;
}

export function createAgentRoutes(
  authenticate: RequestHandler,
  handlers: AgentRouteHandlers,
): Router {
  const router = Router();
  router.use(authenticate);
  router.post("/", handlers.create);
  router.get("/", handlers.list);
  router.get("/:agentId", handlers.get);
  router.patch("/:agentId", handlers.update);
  router.delete("/:agentId", handlers.delete);
  router.post("/:agentId/run", handlers.run);
  return router;
}
