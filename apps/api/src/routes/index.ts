import { Router } from "express";
import type { RequestHandler } from "express";
import healthRoutes from "./health.routes.js";
import { chatController } from "../controllers/chat.controller.js";

export interface DomainRouteMount {
  readonly path: string;
  readonly router: Router;
}

export interface ApiRouteOptions {
  readonly authenticationMiddleware: RequestHandler;
  readonly domainRoutes?: readonly DomainRouteMount[];
}

export function createApiRoutes(options: ApiRouteOptions): Router {
  const router = Router();

  router.use("/health", healthRoutes);
  router.post(
    "/chat",
    options.authenticationMiddleware,
    chatController,
  );

  for (const domain of options.domainRoutes ?? []) {
    if (
      !domain.path.startsWith("/") ||
      domain.path === "/health" ||
      domain.path === "/chat"
    ) {
      throw new TypeError("Invalid or reserved domain route path.");
    }

    router.use(domain.path, domain.router);
  }

  return router;
}
