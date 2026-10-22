import { Router } from "express";
import type { RequestHandler } from "express";

export interface AuthRouteHandlers {
  register: RequestHandler;
  login: RequestHandler;
  refresh: RequestHandler;
  logout: RequestHandler;
}

export function createAuthRoutes(
  handlers: AuthRouteHandlers,
): Router {
  const router = Router();
  router.post("/register", handlers.register);
  router.post("/login", handlers.login);
  router.post("/refresh", handlers.refresh);
  router.post("/logout", handlers.logout);
  return router;
}
