import assert from "node:assert/strict";
import test from "node:test";
import type { RequestHandler } from "express";
import { createProtectedDomainRoutes } from "./domain.routes.js";

const authenticate: RequestHandler = (_request, _response, next) => {
  next();
};

const handler: RequestHandler = (_request, response) => {
  response.status(204).end();
};

test("requires authentication middleware", () => {
  assert.throws(
    () => createProtectedDomainRoutes(undefined as unknown as RequestHandler, [
      { method: "get", path: "/", handler },
    ]),
    TypeError,
  );
});

test("rejects an empty route definition list", () => {
  assert.throws(
    () => createProtectedDomainRoutes(authenticate, []),
    TypeError,
  );
});

test("rejects invalid route definitions", () => {
  const invalidDefinitions = [
    null,
    {},
    { method: "trace", path: "/", handler },
    { method: "get", path: "relative", handler },
    { method: "get", path: "//outside", handler },
    { method: "get", path: "/items?admin=true", handler },
    { method: "get", path: "/items#fragment", handler },
    { method: "get", path: "/items\\private", handler },
    { method: "get", path: "/items/../private", handler },
    { method: "get", path: "/items/./private", handler },
    { method: "get", path: "/", handler: undefined },
  ];

  for (const definition of invalidDefinitions) {
    assert.throws(
      () =>
        createProtectedDomainRoutes(
          authenticate,
          [definition as never],
        ),
      TypeError,
    );
  }
});

test("rejects duplicate method and path combinations", () => {
  assert.throws(
    () =>
      createProtectedDomainRoutes(authenticate, [
        { method: "get", path: "/", handler },
        { method: "get", path: "/", handler },
      ]),
    /Duplicate domain route/,
  );
});

test("allows the same path for different HTTP methods", () => {
  assert.doesNotThrow(() =>
    createProtectedDomainRoutes(authenticate, [
      { method: "get", path: "/", handler },
      { method: "post", path: "/", handler },
    ]),
  );
});

test("registers protected handlers only after authentication middleware", () => {
  const router = createProtectedDomainRoutes(authenticate, [
    { method: "get", path: "/", handler },
  ]);

  const stack = (router as unknown as {
    stack: Array<{ name?: string; route?: unknown }>;
  }).stack;

  assert.equal(stack.length, 2);
  assert.equal(stack[0]?.name, "authenticate");
  assert.ok(stack[1]?.route);
});

test("rejects a missing route handler", () => {
  assert.throws(
    () =>
      createProtectedDomainRoutes(authenticate, [
        {
          method: "post",
          path: "/",
          handler: null as unknown as RequestHandler,
        },
      ]),
    TypeError,
  );
});
