import assert from "node:assert/strict";
import test from "node:test";
import { createApiContext } from "./api-context.js";

test("creates a context with the supplied request ID and API version", () => {
  const context = createApiContext("request-123", "v1");

  assert.equal(context.requestId, "request-123");
  assert.equal(context.apiVersion, "v1");
});

test("returns an immutable context", () => {
  const context = createApiContext("request-123", "v1");

  assert.equal(Object.isFrozen(context), true);
});

test("rejects an empty request ID", () => {
  assert.throws(
    () => createApiContext("", "v1"),
    /A request ID is required\./,
  );
});

test("rejects a whitespace-only request ID", () => {
  assert.throws(
    () => createApiContext("   ", "v1"),
    /A request ID is required\./,
  );
});

test("rejects an empty API version", () => {
  assert.throws(
    () => createApiContext("request-123", ""),
    /An API version is required\./,
  );
});

test("rejects a whitespace-only API version", () => {
  assert.throws(
    () => createApiContext("request-123", "   "),
    /An API version is required\./,
  );
});
