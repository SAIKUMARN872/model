import assert from "node:assert/strict";
import { test } from "node:test";
import {
  calculateOffset,
  createPaginationMetadata,
  DEFAULT_PAGE,
  DEFAULT_PAGE_LIMIT,
  MAX_PAGE_LIMIT,
} from "./pagination.js";

test("pagination defaults match the common schema", () => {
  assert.equal(DEFAULT_PAGE, 1);
  assert.equal(DEFAULT_PAGE_LIMIT, 20);
  assert.equal(MAX_PAGE_LIMIT, 100);
});

test("calculates offsets for valid pages", () => {
  assert.equal(calculateOffset(1, 20), 0);
  assert.equal(calculateOffset(2, 20), 20);
  assert.equal(calculateOffset(4, 25), 75);
  assert.equal(calculateOffset(3, 100), 200);
});

test("rejects invalid page and limit values", () => {
  for (const page of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(() => calculateOffset(page, 20), RangeError);
  }

  for (const limit of [0, -1, 1.5, 101, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(() => calculateOffset(1, limit), RangeError);
  }
});

test("rejects unsafe offsets and totals", () => {
  assert.throws(
    () => calculateOffset(Number.MAX_SAFE_INTEGER, 100),
    RangeError,
  );

  for (const total of [-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(() => createPaginationMetadata(1, 20, total), RangeError);
  }
});

test("reports whether another page contains results", () => {
  assert.deepEqual(createPaginationMetadata(1, 20, 0), {
    page: 1,
    limit: 20,
    total: 0,
    hasNextPage: false,
  });

  assert.deepEqual(createPaginationMetadata(1, 20, 20), {
    page: 1,
    limit: 20,
    total: 20,
    hasNextPage: false,
  });

  assert.deepEqual(createPaginationMetadata(1, 20, 21), {
    page: 1,
    limit: 20,
    total: 21,
    hasNextPage: true,
  });

  assert.deepEqual(createPaginationMetadata(2, 20, 41), {
    page: 2,
    limit: 20,
    total: 41,
    hasNextPage: true,
  });

  assert.deepEqual(createPaginationMetadata(3, 20, 41), {
    page: 3,
    limit: 20,
    total: 41,
    hasNextPage: false,
  });
});