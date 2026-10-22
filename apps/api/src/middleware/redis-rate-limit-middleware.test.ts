import assert from "node:assert/strict";
import type { Request, Response, NextFunction } from "express";
import { test } from "node:test";
import {
  createRateLimitMiddleware,
  type RateLimitStore,
} from "./rate-limit.js";

interface MockResponse {
  headers: Map<string, string>;
  statusCode: number;
  body: unknown;
  locals: { requestId: string };
  setHeader(name: string, value: string): MockResponse;
  status(code: number): MockResponse;
  json(body: unknown): MockResponse;
}

function makeResponse(): MockResponse {
  const response: MockResponse = {
    headers: new Map(),
    statusCode: 200,
    body: undefined,
    locals: { requestId: "rate-limit-test-request" },
    setHeader(name, value) {
      this.headers.set(name.toLowerCase(), value);
      return this;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
  return response;
}

function makeRequest(): Request {
  return {
    ip: "client-a",
    socket: { remoteAddress: "127.0.0.1" },
  } as Request;
}

async function invoke(
  middleware: ReturnType<typeof createRateLimitMiddleware>,
  request = makeRequest(),
) {
  const response = makeResponse();
  let nextCalled = false;
  let nextError: unknown;

  await middleware(
    request,
    response as unknown as Response,
    ((error?: unknown) => {
      nextCalled = true;
      nextError = error;
    }) as NextFunction,
  );

  return { response, nextCalled, nextError };
}

test("shared store allows requests within the limit and sets headers", async () => {
  let count = 0;
  const store: RateLimitStore = {
    async consume() {
      count += 1;
      return { count, resetAt: 120000 };
    },
  };

  const middleware = createRateLimitMiddleware({
    maxRequests: 2,
    windowMs: 60000,
    store,
    now: () => 60000,
  });

  const result = await invoke(middleware);

  assert.equal(result.response.statusCode, 200);
  assert.equal(result.nextCalled, true);
  assert.equal(result.response.headers.get("ratelimit-limit"), "2");
  assert.equal(result.response.headers.get("ratelimit-remaining"), "1");
  assert.equal(result.response.headers.get("cache-control"), "no-store");
});

test("shared store rejects excess requests with 429", async () => {
  const store: RateLimitStore = {
    async consume() {
      return { count: 3, resetAt: 120000 };
    },
  };

  const middleware = createRateLimitMiddleware({
    maxRequests: 2,
    windowMs: 60000,
    store,
    now: () => 60000,
  });

  const result = await invoke(middleware);
  const body = result.response.body as {
    success: boolean;
    error: { code: string };
    requestId: string;
  };

  assert.equal(result.response.statusCode, 429);
  assert.equal(result.nextCalled, false);
  assert.equal(body.success, false);
  assert.equal(body.error.code, "RATE_LIMIT_EXCEEDED");
  assert.equal(body.requestId, "rate-limit-test-request");
  assert.equal(result.response.headers.get("retry-after"), "60");
});

test("shared store failure fails closed with 503", async () => {
  const store: RateLimitStore = {
    async consume() {
      throw new Error("connection details must not reach the client");
    },
  };

  const middleware = createRateLimitMiddleware({
    maxRequests: 2,
    windowMs: 60000,
    store,
  });

  const result = await invoke(middleware);
  const body = result.response.body as {
    success: boolean;
    error: { code: string; message: string };
    requestId: string;
  };

  assert.equal(result.response.statusCode, 503);
  assert.equal(result.nextCalled, false);
  assert.equal(body.success, false);
  assert.equal(body.error.code, "RATE_LIMITER_UNAVAILABLE");
  assert.equal(body.error.message.includes("connection details"), false);
  assert.equal(body.requestId, "rate-limit-test-request");
  assert.equal(result.response.headers.get("cache-control"), "no-store");
});


test("invalid shared-store counters fail closed with 503", async () => {
  const store: RateLimitStore = {
    async consume() {
      return { count: 0, resetAt: 120000 };
    },
  };

  const middleware = createRateLimitMiddleware({
    maxRequests: 2,
    windowMs: 60000,
    store,
  });

  const result = await invoke(middleware);
  const body = result.response.body as { error: { code: string } };

  assert.equal(result.response.statusCode, 503);
  assert.equal(result.nextCalled, false);
  assert.equal(body.error.code, "RATE_LIMITER_UNAVAILABLE");
  assert.equal(result.response.headers.get("cache-control"), "no-store");
});

test("throwing key generators are forwarded to error handling", async () => {
  const failure = new Error("key generator failed");
  const middleware = createRateLimitMiddleware({
    maxRequests: 2,
    windowMs: 60000,
    keyGenerator: () => {
      throw failure;
    },
  });

  const result = await invoke(middleware);

  assert.equal(result.nextCalled, true);
  assert.equal(result.nextError, failure);
  assert.equal(result.response.statusCode, 200);
});
