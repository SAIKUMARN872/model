import { Router } from "express";
import type { RequestHandler } from "express";
import { createApiRoutes } from "../routes/index.js";
import type { DomainRouteMount } from "../routes/index.js";
import { API_VERSION_PREFIX } from "./version.js";

export function createVersionedApiRouter(
  authenticationMiddleware: RequestHandler,
  domainRoutes: readonly DomainRouteMount[] = [],
): Router {
  const router = Router();

  router.use(
    API_VERSION_PREFIX,
    createApiRoutes({
      authenticationMiddleware,
      domainRoutes,
    }),
  );

  return router;
}
