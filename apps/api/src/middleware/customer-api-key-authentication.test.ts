import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../errors/api.error.js";
import { InvalidCredentialsError } from "../errors/authentication.error.js";
import { InsufficientPermissionsError } from "../errors/authorization.error.js";
import type { ApiKeyRepository, StoredApiKey } from "../repositories/api-key.repository.js";
import type { IdentityRepository } from "../repositories/identity.repository.js";
import {
  createCustomerApiKeyAuthenticationMiddleware,
} from "./customer-api-key-authentication.js";

const validKey = `mn_${"A".repeat(43)}`;
const ownerId = "8f14e45f-ea2b-4f93-a1c4-6e4e8b2a9c10";
const authSubject = "auth0|customer-test";

function storedKey(
  overrides: Partial<StoredApiKey> = {},
): StoredApiKey {
  return {
    id: "api-key-test-id",
    userId: ownerId,
    organizationId: null,
    name: "test-key",
    keyPrefix: "mn_AAAAAAAA",
    scopes: ["inference:invoke"],
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    expiresAt: null,
    lastUsedAt: null,
    revokedAt: null,
    ...overrides,
  } as StoredApiKey;
}

interface InvocationResult {
  readonly locals: Record<string, unknown>;
  readonly nextCalled: boolean;
  readonly nextError: unknown;
}

async function invokeMiddleware(
  key: string | undefined,
  apiKeyResult: StoredApiKey | null | Error,
  identityResult: { userId: string; authSubject: string } | null | Error = {
    userId: ownerId,
    authSubject,
  },
): Promise<InvocationResult> {
  let receivedHash: string | undefined;
  let apiKeyCalls = 0;
  let identityCalls = 0;

  const apiKeys = {
    authenticateAndMarkUsed: async (hash: string) => {
      apiKeyCalls++;
      receivedHash = hash;
      if (apiKeyResult instanceof Error) throw apiKeyResult;
      return apiKeyResult;
    },
  } as unknown as ApiKeyRepository;

  const identities = {
    findActiveByUserId: async (userId: string) => {
      identityCalls++;
      assert.equal(userId, ownerId);
      if (identityResult instanceof Error) throw identityResult;
      return identityResult;
    },
  } as unknown as IdentityRepository;

  const req = {
    get: (name: string) =>
      name.toLowerCase() === "x-api-key" ? key : undefined,
  } as unknown as Request;

  const res = { locals: {} } as unknown as Response;

  let nextCalled = false;
  let nextError: unknown;
  let resolveNext!: () => void;
  const completed = new Promise<void>((resolve) => {
    resolveNext = resolve;
  });

  const next = ((error?: unknown) => {
    nextCalled = true;
    nextError = error;
    resolveNext();
  }) as NextFunction;

  createCustomerApiKeyAuthenticationMiddleware(apiKeys, identities)(
    req,
    res,
    next,
  );

  await completed;

  return {
    locals: res.locals as Record<string, unknown>,
    nextCalled,
    nextError,
  };
}

test("valid customer key is hashed and attaches the active identity principal", async () => {
  const result = await invokeMiddleware(validKey, storedKey());

  assert.equal(result.nextCalled, true);
  assert.equal(result.nextError, undefined);
  assert.equal(result.locals.customerApiKeyId, "api-key-test-id");
  assert.deepEqual(result.locals.principal, {
    userId: authSubject,
    roles: ["user"],
    scopes: ["inference:invoke"],
  });
});

test("repository receives only the SHA-256 hash, never the raw key", async () => {
  const expectedHash = createHash("sha256")
    .update(validKey, "utf8")
    .digest("hex");

  let receivedHash: string | undefined;
  const apiKeys = {
    authenticateAndMarkUsed: async (hash: string) => {
      receivedHash = hash;
      return storedKey();
    },
  } as unknown as ApiKeyRepository;

  const identities = {
    findActiveByUserId: async () => ({
      userId: ownerId,
      authSubject,
    }),
  } as unknown as IdentityRepository;

  const req = {
    get: (name: string) =>
      name.toLowerCase() === "x-api-key" ? validKey : undefined,
  } as unknown as Request;
  const res = { locals: {} } as unknown as Response;

  let nextError: unknown;
  let resolveNext!: () => void;
  const completed = new Promise<void>((resolve) => {
    resolveNext = resolve;
  });

  createCustomerApiKeyAuthenticationMiddleware(apiKeys, identities)(
    req,
    res,
    ((error?: unknown) => {
      nextError = error;
      resolveNext();
    }) as NextFunction,
  );

  await completed;

  assert.equal(receivedHash, expectedHash);
  assert.notEqual(receivedHash, validKey);
  assert.equal(nextError, undefined);
});

test("malformed key is rejected before repository access", async () => {
  const result = await invokeMiddleware("not-a-valid-key", storedKey());

  assert.ok(result.nextError instanceof InvalidCredentialsError);
  assert.equal(result.locals.principal, undefined);
});

test("unknown, expired, or revoked keys returned as absent are rejected", async () => {
  const result = await invokeMiddleware(validKey, null);

  assert.ok(result.nextError instanceof InvalidCredentialsError);
  assert.equal(result.locals.principal, undefined);
});

test("key without inference:invoke scope is denied", async () => {
  const result = await invokeMiddleware(
    validKey,
    storedKey({ scopes: ["chat:read"] }),
  );

  assert.ok(result.nextError instanceof InsufficientPermissionsError);
  assert.equal(result.locals.principal, undefined);
});

test("organization-owned key fails closed", async () => {
  const result = await invokeMiddleware(
    validKey,
    storedKey({
      userId: null,
      organizationId: "org-test-id",
    }),
  );

  assert.ok(result.nextError instanceof InvalidCredentialsError);
  assert.equal(result.locals.principal, undefined);
});

test("key without a user owner is rejected", async () => {
  const result = await invokeMiddleware(
    validKey,
    storedKey({ userId: null, organizationId: null }),
  );

  assert.ok(result.nextError instanceof InvalidCredentialsError);
  assert.equal(result.locals.principal, undefined);
});

test("inactive or missing identity is rejected", async () => {
  const result = await invokeMiddleware(validKey, storedKey(), null);

  assert.ok(result.nextError instanceof InvalidCredentialsError);
  assert.equal(result.locals.principal, undefined);
});

test("repository failures become a generic 503 API error", async () => {
  const result = await invokeMiddleware(
    validKey,
    new Error("private database diagnostic"),
  );

  assert.ok(result.nextError instanceof ApiError);
  assert.equal((result.nextError as ApiError).statusCode, 503);
  assert.equal(
    (result.nextError as ApiError).code,
    "API_KEY_AUTHENTICATION_UNAVAILABLE",
  );
  assert.equal(
    (result.nextError as Error).message.includes("private database diagnostic"),
    false,
  );
  assert.equal(result.locals.principal, undefined);
});

test("identity repository failures become a generic 503 API error", async () => {
  const result = await invokeMiddleware(
    validKey,
    storedKey(),
    new Error("private identity diagnostic"),
  );

  assert.ok(result.nextError instanceof ApiError);
  assert.equal((result.nextError as ApiError).statusCode, 503);
  assert.equal(result.locals.principal, undefined);
});