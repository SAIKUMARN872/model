import { Router } from "express";
import type { RequestHandler } from "express";

export interface WebhookRouteHandlers {
  readonly receive: RequestHandler;
}

export function createWebhookRoutes(
  verifySignature: RequestHandler,
  handlers: WebhookRouteHandlers,
): Router {
  const router = Router();

  router.post("/:provider", verifySignature, handlers.receive);

  return router;
}
