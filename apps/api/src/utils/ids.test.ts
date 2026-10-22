import assert from "node:assert/strict";
import { test } from "node:test";
import { createId, isValidId } from "./ids.js";

test("creates unique UUIDs accepted by the validator", () => {
  const first = createId();
  const second = createId();

  assert.equal(isValidId(first), true);
  assert.equal(isValidId(second), true);
  assert.notEqual(first, second);
});

test("accepts valid UUID versions and variants", () => {
  assert.equal(isValidId("550e8400-e29b-41d4-a716-446655440000"), true);
  assert.equal(isValidId("550E8400-E29B-41D4-A716-446655440000"), true);
});

test("rejects malformed UUIDs and non-string inputs", () => {
  for (const value of [
    "",
    " ",
    "not-a-uuid",
    "550e8400e29b41d4a716446655440000",
    "550e8400-e29b-01d4-a716-446655440000",
    "550e8400-e29b-41d4-0716-446655440000",
    null,
    undefined,
    42,
    {},
  ]) {
    assert.equal(isValidId(value), false);
  }
});