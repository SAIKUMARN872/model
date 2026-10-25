import type { RequestHandler } from "express";
import type { Pool } from "pg";
import { z } from "zod";
import { ApiError } from "../errors/api.error.js";
import { IdentityRepository } from "../repositories/identity.repository.js";
import { ApiKeyRepository } from "../repositories/api-key.repository.js";
import { ApiKeyManagementService } from "../services/api-key-management.service.js";
import type { AuthenticatedPrincipal } from "../types/request.types.js";
import { createProtectedDomainRoutes } from "./domain.routes.js";

const createSchema = z.object({
  name: z.string().trim().min(1).max(100),
  expiresAt: z.string().datetime({ offset: true }).optional(),
}).strict();

function getPrincipal(value: unknown): AuthenticatedPrincipal {
  if (
    typeof value !== "object" ||
    value === null ||
    !("userId" in value) ||
    typeof value.userId !== "string" ||
    !("roles" in value) ||
    !Array.isArray(value.roles) ||
    !("scopes" in value) ||
    !Array.isArray(value.scopes)
  ) {
    throw new ApiError(401, "UNAUTHENTICATED", "Authentication is required.");
  }

  return value as AuthenticatedPrincipal;
}

function requireService(
  service: ApiKeyManagementService | null,
): ApiKeyManagementService {
  if (!service) {
    throw new ApiError(
      503,
      "API_KEY_STORAGE_UNAVAILABLE",
      "API-key management is temporarily unavailable.",
    );
  }

  return service;
}

export function createApiKeyRoutes(
  authenticate: RequestHandler,
  pool: Pool | undefined,
) {
  const service = pool
    ? new ApiKeyManagementService(
        new ApiKeyRepository(pool),
        new IdentityRepository(pool),
      )
    : null;

  const create: RequestHandler = (req, res, next) => {
    void (async () => {
      const currentService = requireService(service);
      const parsed = createSchema.safeParse(req.body);

      if (!parsed.success) {
        throw new ApiError(
          400,
          "INVALID_API_KEY_INPUT",
          "Provide a valid key name and optional ISO-8601 expiry.",
        );
      }

      const result = await currentService.create(
        getPrincipal(res.locals.principal),
        parsed.data,
      );

      res.status(201).json({
        success: true,
        data: result,
        requestId: res.locals.requestId,
      });
    })().catch(next);
  };

  const list: RequestHandler = (_req, res, next) => {
    void (async () => {
      const result = await requireService(service).list(
        getPrincipal(res.locals.principal),
      );

      res.status(200).json({
        success: true,
        data: result,
        requestId: res.locals.requestId,
      });
    })().catch(next);
  };

  const revoke: RequestHandler = (req, res, next) => {
    void (async () => {
      const id = req.params.id;

      if (typeof id !== "string") {
        throw new ApiError(400, "INVALID_API_KEY_ID", "A valid API-key ID is required.");
      }

      await requireService(service).revoke(
        getPrincipal(res.locals.principal),
        id,
      );

      res.status(200).json({
        success: true,
        data: { id, revoked: true },
        requestId: res.locals.requestId,
      });
    })().catch(next);
  };

  return createProtectedDomainRoutes(authenticate, [
    { method: "post", path: "/", handler: create },
    { method: "get", path: "/", handler: list },
    { method: "delete", path: "/:id", handler: revoke },
  ]);
}