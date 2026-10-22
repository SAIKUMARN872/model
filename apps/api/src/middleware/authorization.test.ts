import assert from "node:assert/strict";
import test from "node:test";
import type { NextFunction, Request, Response } from "express";
import { AuthenticationError } from "../errors/authentication.error.js";
import { InsufficientPermissionsError } from "../errors/authorization.error.js";
import { createAuthorizationMiddleware } from "./authorization.js";

const principal = {
  userId: "user-1",
  tenantId: "tenant-1",
  roles: ["user", "operator"],
  scopes: ["chat:read", "chat:write"],
};

function invoke(options: Parameters<typeof createAuthorizationMiddleware>[0], value: unknown) {
  const req = {} as Request;
  const res = { locals: { principal: value } } as unknown as Response;
  let calls = 0;
  let error: unknown;
  const next = ((nextError?: unknown) => {
    calls += 1;
    error = nextError;
  }) as NextFunction;

  createAuthorizationMiddleware(options)(req, res, next);
  return { calls, error };
}

test("allows a principal with a matching role and all required scopes", () => {
  const result = invoke({ roles: ["admin", "operator"], scopes: ["chat:read", "chat:write"] }, principal);
  assert.equal(result.calls, 1);
  assert.equal(result.error, undefined);
});

test("rejects missing or malformed principals as unauthenticated", () => {
  for (const value of [undefined, null, {}, { ...principal, roles: "admin" }]) {
    const result = invoke({}, value);
    assert.ok(result.error instanceof AuthenticationError);
  }
});

test("rejects principals without a required role", () => {
  const result = invoke({ roles: ["admin"] }, principal);
  assert.ok(result.error instanceof InsufficientPermissionsError);
});

test("requires every configured scope", () => {
  const result = invoke({ scopes: ["chat:read", "billing:write"] }, principal);
  assert.ok(result.error instanceof InsufficientPermissionsError);
});

test("can require all configured roles", () => {
  const result = invoke({ roles: ["user", "admin"], requireAllRoles: true }, principal);
  assert.ok(result.error instanceof InsufficientPermissionsError);
});

test("rejects empty configured role names", () => {
  assert.throws(() => createAuthorizationMiddleware({ roles: [" "] }), TypeError);
});
