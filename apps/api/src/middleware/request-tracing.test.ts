import assert from "node:assert/strict";
import { test } from "node:test";
import type { NextFunction, Request, Response } from "express";
import { requestTracingMiddleware } from "./request-tracing.js";
import { parseTraceparent } from "../telemetry/tracing.js";

function invokeTracing(traceparent?: string) {
  const headers: Record<string, string> = {};
  const locals: Record<string, unknown> = {};
  let nextCalled = false;
  let nextError: unknown;

  const req = {
    headers: traceparent === undefined ? {} : { traceparent },
  };

  const res = {
    locals,
    setHeader(name: string, value: string | number | readonly string[]) {
      headers[name.toLowerCase()] = String(value);
      return this;
    },
  };

  const next: NextFunction = (error?: unknown) => {
    nextCalled = true;
    nextError = error;
  };

  requestTracingMiddleware(
    req as Request,
    res as unknown as Response,
    next,
  );

  return { headers, locals, nextCalled, nextError };
}

test("valid incoming traceparent preserves trace ID and flags with a new span ID", () => {
  const incoming = "00-1234567890abcdef1234567890abcdef-1234567890abcdef-01";
  const result = invokeTracing(incoming);
  const responseContext = parseTraceparent(result.headers.traceparent);

  assert.equal(result.nextCalled, true);
  assert.equal(result.nextError, undefined);
  assert.ok(responseContext);
  assert.equal(responseContext.traceId, "1234567890abcdef1234567890abcdef");
  assert.equal(responseContext.traceFlags, "01");
  assert.notEqual(responseContext.spanId, "1234567890abcdef");
  assert.equal(result.locals.traceContext !== undefined, true);
});

test("missing traceparent creates a valid local trace context", () => {
  const result = invokeTracing();
  const responseContext = parseTraceparent(result.headers.traceparent);

  assert.ok(responseContext);
  assert.equal(responseContext.traceFlags, "00");
  assert.equal(result.nextCalled, true);
});

test("malformed traceparent is ignored and replaced with a valid local context", () => {
  const result = invokeTracing("invalid");
  const responseContext = parseTraceparent(result.headers.traceparent);

  assert.ok(responseContext);
  assert.equal(responseContext.traceId.length, 32);
  assert.equal(result.nextCalled, true);
});