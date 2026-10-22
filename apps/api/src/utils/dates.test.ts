import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getCurrentTimestamp,
  isValidDate,
  parseDate,
} from "./dates.js";

test("current timestamp is a valid ISO timestamp", () => {
  const timestamp = getCurrentTimestamp();

  assert.equal(Number.isFinite(Date.parse(timestamp)), true);
  assert.equal(new Date(timestamp).toISOString(), timestamp);
});

test("validates valid and invalid Date objects", () => {
  assert.equal(isValidDate(new Date("2025-01-01T00:00:00.000Z")), true);
  assert.equal(isValidDate(new Date(Number.NaN)), false);
  assert.equal(isValidDate(null), false);
  assert.equal(isValidDate("2025-01-01"), false);
  assert.equal(isValidDate(0), false);
});

test("parses valid date strings", () => {
  const result = parseDate("2025-01-01T00:00:00.000Z");

  assert.ok(result instanceof Date);
  assert.equal(result.toISOString(), "2025-01-01T00:00:00.000Z");
});

test("returns null for empty or invalid date strings", () => {
  assert.equal(parseDate(""), null);
  assert.equal(parseDate("   "), null);
  assert.equal(parseDate("not-a-date"), null);
  assert.equal(parseDate(null), null);
  assert.equal(parseDate(undefined), null);
  assert.equal(parseDate(123), null);
  assert.equal(parseDate({}), null);
});