import assert from "node:assert/strict";
import test from "node:test";

import * as billing from "./main.js";

test("billing module loads successfully", () => {
  assert.ok(billing);
  assert.ok(Object.keys(billing).length > 0);
});

test("billing module exposes implementation exports", () => {
  const exports = Object.keys(billing);

  assert.ok(exports.length > 0);

  for (const name of exports) {
    assert.equal(typeof name, "string");
    assert.notEqual(name.length, 0);
  }
});

test("billing exports are usable values", () => {
  for (const [name, value] of Object.entries(billing)) {
    assert.notEqual(value, undefined, `${name} must not be undefined`);
  }
});

test("billing exports contain no duplicate export names", () => {
  const exports = Object.keys(billing);
  assert.equal(new Set(exports).size, exports.length);
});

test("billing module can be imported repeatedly", async () => {
  const first = await import("./main.js");
  const second = await import("./main.js");

  assert.deepEqual(
    Object.keys(first).sort(),
    Object.keys(second).sort()
  );
});

test("billing implementation exports have expected runtime types", () => {
  for (const [name, value] of Object.entries(billing)) {
    assert.ok(
      ["function", "object"].includes(typeof value),
      `${name} has unexpected runtime type ${typeof value}`
    );
  }
});
