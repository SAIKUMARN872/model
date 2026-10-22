import assert from "node:assert/strict";
import test from "node:test";
import type { NextFunction, Request, Response } from "express";
import {
  AuthenticationError,
  InvalidCredentialsError,
} from "../errors/authentication.error.js";
import type { AuthenticatedPrincipal } from "../types/request.types.js";
import type { AuthenticationProvider } from "./authentication-provider.js";
import { createAuthenticationMiddleware } from "./authentication.js";

const principal: AuthenticatedPrincipal = {
  userId: "user-test-1",
  tenantId: "tenant-test-1",
  roles: ["user"],
  scopes: ["chat:read"],
};

interface InvocationResult {
  readonly locals: Record<string, unknown>;
  readonly nextError: unknown;
  readonly nextCalled: boolean;
}

async function invokeMiddleware(
  authorization: string | undefined,
  provider: AuthenticationProvider,
): Promise<InvocationResult> {
  const req = {
    get: (name: string) =>
      name.toLowerCase() === "authorization" ? authorization : undefined,
  } as unknown as Request;

  const res = {
    locals: {},
  } as unknown as Response;

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

  createAuthenticationMiddleware(provider)(req, res, next);
  await completed;

  return {
    locals: res.locals as Record<string, unknown>,
    nextError,
    nextCalled,
  };
}

test("missing authorization header is rejected", async () => {
  const provider: AuthenticationProvider = {
    verifyAccessToken: async () => principal,
  };

  const result = await invokeMiddleware(undefined, provider);

  assert.equal(result.nextCalled, true);
  assert.ok(result.nextError instanceof AuthenticationError);
  assert.equal(result.locals.principal, undefined);
});

test("non-Bearer credentials are rejected", async () => {
  const provider: AuthenticationProvider = {
    verifyAccessToken: async () => principal,
  };

  const result = await invokeMiddleware("Basic example-token", provider);

  assert.ok(result.nextError instanceof InvalidCredentialsError);
  assert.equal(result.locals.principal, undefined);
});

test("valid token attaches the verified principal", async () => {
  let receivedToken: string | undefined;

  const provider: AuthenticationProvider = {
    verifyAccessToken: async (token) => {
      receivedToken = token;
      return principal;
    },
  };

  const result = await invokeMiddleware("Bearer test-token-123", provider);

  assert.equal(receivedToken, "test-token-123");
  assert.equal(result.nextCalled, true);
  assert.equal(result.nextError, undefined);
  assert.equal(result.locals.principal, principal);
});

test("invalid token errors are forwarded without attaching a principal", async () => {
  const provider: AuthenticationProvider = {
    verifyAccessToken: async () => {
      throw new InvalidCredentialsError();
    },
  };

  const result = await invokeMiddleware("Bearer invalid-token", provider);

  assert.ok(result.nextError instanceof InvalidCredentialsError);
  assert.equal(result.locals.principal, undefined);
});

test("unexpected verifier failures are forwarded to central error handling", async () => {
  const verifierFailure = new Error("Identity provider unavailable");

  const provider: AuthenticationProvider = {
    verifyAccessToken: async () => {
      throw verifierFailure;
    },
  };

  const result = await invokeMiddleware("Bearer test-token", provider);

  assert.equal(result.nextError, verifierFailure);
  assert.equal(result.locals.principal, undefined);
});


test("rejects oversized bearer tokens before invoking the verifier", async () => {
  let verifierCalled = false;
  const provider: AuthenticationProvider = {
    verifyAccessToken: async () => {
      verifierCalled = true;
      return principal;
    },
  };

  const result = await invokeMiddleware(
    `Bearer ${"a".repeat(16_385)}`,
    provider,
  );

  assert.ok(result.nextError instanceof InvalidCredentialsError);
  assert.equal(verifierCalled, false);
  assert.equal(result.locals.principal, undefined);
});

test("forwards synchronous verifier throws to error handling", async () => {
  const failure = new Error("Verifier failed synchronously");
  const provider: AuthenticationProvider = {
    verifyAccessToken: (() => {
      throw failure;
    }) as AuthenticationProvider["verifyAccessToken"],
  };

  const result = await invokeMiddleware("Bearer test-token", provider);

  assert.equal(result.nextError, failure);
  assert.equal(result.locals.principal, undefined);
});

test("rejects malformed principals returned by the verifier", async () => {
  const provider: AuthenticationProvider = {
    verifyAccessToken: async () => ({
      userId: "user-test-2",
      roles: ["user"],
      scopes: [""],
    }) as AuthenticatedPrincipal,
  };

  const result = await invokeMiddleware("Bearer test-token", provider);

  assert.ok(result.nextError instanceof Error);
  assert.equal(result.locals.principal, undefined);
});
