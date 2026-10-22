import assert from "node:assert/strict";
import { test } from "node:test";
import { createCache, type CacheRedisClient } from "./index";

function makeFixture() {
  const values = new Map<string, string>();
  const setCalls: Array<{ key: string; value: string; options?: { EX: number } }> = [];

  const client: CacheRedisClient = {
    async set(key, value, options) {
      values.set(key, value);
      setCalls.push({ key, value, options });
      return "OK";
    },
    async get(key) {
      return values.get(key) ?? null;
    },
    async del(key) {
      return values.delete(key) ? 1 : 0;
    },
    async exists(key) {
      return values.has(key) ? 1 : 0;
    },
  };

  let clientRequests = 0;
  const cache = createCache(async () => {
    clientRequests += 1;
    return client;
  });

  return { cache, values, setCalls, getClientRequests: () => clientRequests };
}

test("stores and retrieves JSON values using a namespaced key", async () => {
  const fixture = makeFixture();
  const value = { id: 42, enabled: true, tags: ["api", "cache"] };

  await fixture.cache.set("user:42", value);
  assert.deepEqual(await fixture.cache.get("user:42"), value);
  assert.equal(fixture.setCalls[0]?.key, "modelnow:cache:user:42");
});

test("returns null for a missing key", async () => {
  const { cache } = makeFixture();
  assert.equal(await cache.get("missing"), null);
});

test("passes a positive TTL to Redis in seconds", async () => {
  const fixture = makeFixture();

  await fixture.cache.set("temporary", "value", { ttlSeconds: 60 });

  assert.deepEqual(fixture.setCalls[0]?.options, { EX: 60 });
});

test("rejects invalid TTL values before connecting", async () => {
  const fixture = makeFixture();

  for (const ttlSeconds of [0, -1, 1.5, Number.NaN, Number.MAX_SAFE_INTEGER + 1]) {
    await assert.rejects(
      fixture.cache.set("key", "value", { ttlSeconds }),
      /ttlSeconds must be a positive safe integer/,
    );
  }

  assert.equal(fixture.getClientRequests(), 0);
});

test("rejects empty and whitespace-only keys", async () => {
  const fixture = makeFixture();

  await assert.rejects(fixture.cache.get(""), /Cache key must be a non-empty string/);
  await assert.rejects(fixture.cache.has("   "), /Cache key must be a non-empty string/);
  await assert.rejects(fixture.cache.delete(""), /Cache key must be a non-empty string/);
  assert.equal(fixture.getClientRequests(), 0);
});

test("rejects values that JSON.stringify cannot represent", async () => {
  const fixture = makeFixture();

  await assert.rejects(
    fixture.cache.set("undefined-value", undefined),
    /Cache value must be JSON-serializable/,
  );

  assert.equal(fixture.getClientRequests(), 0);
});

test("reports whether a key exists and whether deletion removed it", async () => {
  const { cache } = makeFixture();

  assert.equal(await cache.has("item"), false);
  assert.equal(await cache.delete("item"), false);

  await cache.set("item", { value: 1 });

  assert.equal(await cache.has("item"), true);
  assert.equal(await cache.delete("item"), true);
  assert.equal(await cache.has("item"), false);
  assert.equal(await cache.delete("item"), false);
});

test("propagates Redis connection failures", async () => {
  const expected = new Error("Redis unavailable");
  const cache = createCache(async () => {
    throw expected;
  });

  await assert.rejects(cache.get("key"), (error: unknown) => error === expected);
  await assert.rejects(cache.set("key", "value"), (error: unknown) => error === expected);
});

test("reports malformed cached JSON instead of silently returning a miss", async () => {
  const fixture = makeFixture();
  fixture.values.set("modelnow:cache:corrupt", "{invalid-json");

  await assert.rejects(fixture.cache.get("corrupt"), SyntaxError);
});