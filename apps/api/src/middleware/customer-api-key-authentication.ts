import { createHash } from "node:crypto";
import type { RequestHandler } from "express";
import { ApiError } from "../errors/api.error.js";
import { InvalidCredentialsError } from "../errors/authentication.error.js";
import { InsufficientPermissionsError } from "../errors/authorization.error.js";
import type { ApiKeyRepository } from "../repositories/api-key.repository.js";
import type { IdentityRepository } from "../repositories/identity.repository.js";

const CUSTOMER_KEY_PATTERN = /^mn_[A-Za-z0-9_-]{43}$/;
const MAX_CUSTOMER_KEY_LENGTH = 128;
const REQUIRED_SCOPE = "inference:invoke";

function hashCustomerApiKey(key: string): string {
  return createHash("sha256").update(key, "utf8").digest("hex");
}

export function createCustomerApiKeyAuthenticationMiddleware(
  apiKeys: ApiKeyRepository,
  identities: IdentityRepository,
): RequestHandler {
  return (req, res, next) => {
    const key = req.get("x-api-key");

    if (
      typeof key !== "string" ||
      key.length > MAX_CUSTOMER_KEY_LENGTH ||
      !CUSTOMER_KEY_PATTERN.test(key)
    ) {
      next(new InvalidCredentialsError());
      return;
    }

    void (async () => {
      const storedKey = await apiKeys.authenticateAndMarkUsed(
        hashCustomerApiKey(key),
      );

      if (!storedKey) {
        throw new InvalidCredentialsError();
      }

      if (!storedKey.userId || storedKey.organizationId !== null) {
        throw new InvalidCredentialsError();
      }

      if (!storedKey.scopes.includes(REQUIRED_SCOPE)) {
        throw new InsufficientPermissionsError();
      }

      const identity = await identities.findActiveByUserId(storedKey.userId);
      if (!identity) {
        throw new InvalidCredentialsError();
      }

      res.locals.principal = {
        userId: identity.authSubject,
        roles: ["user"],
        scopes: [...storedKey.scopes],
      };
      res.locals.customerApiKeyId = storedKey.id;

      next();
    })().catch((error: unknown) => {
      if (error instanceof ApiError) {
        next(error);
        return;
      }

      next(
        new ApiError(
          503,
          "API_KEY_AUTHENTICATION_UNAVAILABLE",
          "Customer API-key authentication is temporarily unavailable.",
        ),
      );
    });
  };
}