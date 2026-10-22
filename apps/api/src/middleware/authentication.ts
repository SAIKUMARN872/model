import type { RequestHandler } from "express";
import { AuthenticationError, InvalidCredentialsError } from "../errors/authentication.error.js";
import type { AuthenticatedPrincipal } from "../types/request.types.js";
import type { AuthenticationProvider } from "./authentication-provider.js";

/**
 * Creates authentication middleware backed by a trusted token verifier.
 * Authentication is enabled only on routes that explicitly mount this handler.
 */
const MAX_ACCESS_TOKEN_LENGTH = 16_384;

function isAuthenticatedPrincipal(
  value: unknown,
): value is AuthenticatedPrincipal {
  if (typeof value !== "object" || value === null) return false;

  const candidate = value as Record<string, unknown>;
  const validStringArray = (items: unknown): items is readonly string[] =>
    Array.isArray(items) &&
    items.every(
      (item) => typeof item === "string" && item.trim().length > 0,
    );

  return (
    typeof candidate.userId === "string" &&
    candidate.userId.trim().length > 0 &&
    (candidate.tenantId === undefined ||
      (typeof candidate.tenantId === "string" &&
        candidate.tenantId.trim().length > 0)) &&
    validStringArray(candidate.roles) &&
    validStringArray(candidate.scopes)
  );
}

export function createAuthenticationMiddleware(
  provider: AuthenticationProvider,
): RequestHandler {
  return (req, res, next) => {
    const authorization = req.get("authorization");

    if (!authorization) {
      next(new AuthenticationError());
      return;
    }

    const match = /^Bearer\s+(\S+)$/i.exec(authorization);

    if (!match) {
      next(new InvalidCredentialsError());
      return;
    }

    const token = match[1];

    if (token.length > MAX_ACCESS_TOKEN_LENGTH) {
      next(new InvalidCredentialsError());
      return;
    }

    // Convert synchronous provider throws into the same safe error path as
    // rejected promises. Never attach an unvalidated principal to the request.
    void Promise.resolve()
      .then(() => provider.verifyAccessToken(token))
      .then((principal: AuthenticatedPrincipal) => {
        if (!isAuthenticatedPrincipal(principal)) {
          next(new Error("Authentication provider returned an invalid principal."));
          return;
        }

        res.locals.principal = principal;
        next();
      })
      .catch((error: unknown) => {
        next(error);
      });
  };
}
