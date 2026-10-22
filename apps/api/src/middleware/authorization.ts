import type { RequestHandler } from "express";
import { AuthenticationError } from "../errors/authentication.error.js";
import { InsufficientPermissionsError } from "../errors/authorization.error.js";
import type { AuthenticatedPrincipal } from "../types/request.types.js";

export interface AuthorizationOptions {
  /** At least one configured role must match by default. */
  readonly roles?: readonly string[];
  /** Every configured scope must match by default. */
  readonly scopes?: readonly string[];
  readonly requireAllRoles?: boolean;
  readonly requireAllScopes?: boolean;
}

function isPrincipal(value: unknown): value is AuthenticatedPrincipal {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.userId === "string" &&
    candidate.userId.trim().length > 0 &&
    Array.isArray(candidate.roles) &&
    candidate.roles.every((role) => typeof role === "string") &&
    Array.isArray(candidate.scopes) &&
    candidate.scopes.every((scope) => typeof scope === "string") &&
    (candidate.tenantId === undefined ||
      (typeof candidate.tenantId === "string" && candidate.tenantId.trim().length > 0))
  );
}

/**
 * Authorizes only the principal attached by trusted authentication middleware.
 * Never derives roles, scopes, or identity from request-body or query fields.
 */
export function createAuthorizationMiddleware(
  options: AuthorizationOptions = {},
): RequestHandler {
  const requiredRoles = [...new Set(options.roles ?? [])];
  const requiredScopes = [...new Set(options.scopes ?? [])];

  if (requiredRoles.some((role) => role.trim().length === 0)) {
    throw new TypeError("Authorization roles must be non-empty strings.");
  }
  if (requiredScopes.some((scope) => scope.trim().length === 0)) {
    throw new TypeError("Authorization scopes must be non-empty strings.");
  }

  return (_req, res, next) => {
    const principal: unknown = res.locals.principal;

    if (!isPrincipal(principal)) {
      next(new AuthenticationError());
      return;
    }

    const principalRoles = new Set(principal.roles);
    const principalScopes = new Set(principal.scopes);

    const roleAllowed =
      requiredRoles.length === 0 ||
      (options.requireAllRoles
        ? requiredRoles.every((role) => principalRoles.has(role))
        : requiredRoles.some((role) => principalRoles.has(role)));

    const scopeAllowed =
      requiredScopes.length === 0 ||
      (options.requireAllScopes
        ? requiredScopes.every((scope) => principalScopes.has(scope))
        : requiredScopes.every((scope) => principalScopes.has(scope)));

    if (!roleAllowed || !scopeAllowed) {
      next(new InsufficientPermissionsError());
      return;
    }

    next();
  };
}
