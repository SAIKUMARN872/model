import assert from "node:assert/strict";
import test from "node:test";
import type { NextFunction, Request, Response } from "express";
import { createRateLimitMiddleware } from "./rate-limit.js";

function invoke(
  middleware: ReturnType<typeof createRateLimitMiddleware>,
  key = "client-1",
) {
  const headers: Record<string, string> = {};
  const responseState: { statusCode?: number; body?: unknown } = {};
  const response = {
    locals: { requestId: "request-test" },
    setHeader(name: string, value: string | number) {
      headers[name.toLowerCase()] = String(value);
      return this;
    },
    status(code: number) {
      responseState.statusCode = code;
      return this;
    },
    json(body: unknown) {
      responseState.body = body;
      return this;
    },
  } as unknown as Response;

  let nextCalls = 0;
  let nextError: unknown;
  const request = { ip: key, socket: { remoteAddress: key } } as unknown as Request;
  const next = ((error?: unknown) => {
    nextCalls += 1;
    nextError = error;
  }) as NextFunction;

  middleware(request, response, next);
  return { headers, ...responseState, nextCalls, nextError };
}

test("allows requests within the configured window and sets rate-limit headers", () => {
  let time = 1_000;
  const limiter = createRateLimitMiddleware({
    maxRequests: 2,
    windowMs: 10_000,
    now: () => time,
  });

  const first = invoke(limiter);
  const second = invoke(limiter);

  assert.equal(first.nextCalls, 1);
  assert.equal(first.headers["ratelimit-limit"], "2");
  assert.equal(first.headers["ratelimit-remaining"], "1");
  assert.equal(second.headers["ratelimit-remaining"], "0");

  time += 10_000;
  const afterWindow = invoke(limiter);
  assert.equal(afterWindow.nextCalls, 1);
  assert.equal(afterWindow.statusCode, undefined);
});

test("rejects excess requests with 429 and Retry-After", () => {
  const limiter = createRateLimitMiddleware({
    maxRequests: 1,
    windowMs: 5_000,
    now: () => 20_000,
  });

  invoke(limiter);
  const blocked = invoke(limiter);

  assert.equal(blocked.statusCode, 429);
  assert.equal(blocked.headers["retry-after"], "5");
  assert.deepEqual(blocked.body, {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests. Please try again later.",
    },
    requestId: "request-test",
  });
});

test("tracks clients independently", () => {
  const limiter = createRateLimitMiddleware({ maxRequests: 1, windowMs: 1_000 });

  assert.equal(invoke(limiter, "client-a").nextCalls, 1);
  assert.equal(invoke(limiter, "client-b").nextCalls, 1);
  assert.equal(invoke(limiter, "client-a").statusCode, 429);
});

test("supports skipping selected requests", () => {
  const limiter = createRateLimitMiddleware({
    maxRequests: 1,
    windowMs: 1_000,
    skip: (request) => request.path === "/health",
  });

  const request = {
    ip: "client",
    path: "/health",
    socket: { remoteAddress: "client" },
  } as unknown as Request;
  let nextCalls = 0;
  limiter(request, {} as Response, (() => { nextCalls += 1; }) as NextFunction);
  assert.equal(nextCalls, 1);
});

test("rejects invalid configuration", () => {
  assert.throws(
    () => createRateLimitMiddleware({ maxRequests: 0, windowMs: 1_000 }),
    RangeError,
  );
});

test("fails safely when the bounded key store is full", () => {
  const limiter = createRateLimitMiddleware({
    maxRequests: 2,
    windowMs: 60_000,
    maxKeys: 1,
    now: () => 1_000,
  });

  invoke(limiter, "client-a");
  const overflow = invoke(limiter, "client-b");

  assert.equal(overflow.statusCode, 503);
  assert.equal(overflow.headers["cache-control"], "no-store");
});
