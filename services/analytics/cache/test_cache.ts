// services/analytics/cache/test_cache.ts

import {
  CacheManager,
} from "./manager.js";

import {
  InMemoryRedisClient,
} from "./redis.js";

type TestFunction = () => void | Promise<void>;

function assert(
  condition: boolean,
  message: string,
): void {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual<T>(
  actual: T,
  expected: T,
  message: string,
): void {
  if (actual !== expected) {
    throw new Error(
      `${message}\nExpected: ${String(
        expected,
      )}\nActual: ${String(actual)}`,
    );
  }
}

async function assertThrows(
  fn: () => Promise<unknown>,
  message: string,
): Promise<void> {
  let thrown = false;

  try {
    await fn();
  } catch {
    thrown = true;
  }

  assert(thrown, message);
}

async function test(
  name: string,
  fn: TestFunction,
): Promise<void> {
  try {
    await fn();

    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);

    throw error;
  }
}

function createCache(): CacheManager {
  return new CacheManager(
    new InMemoryRedisClient(),
    {
      defaultTtlSeconds: 300,
      keyPrefix: "modelnow:test",
      maxValueSizeBytes:
        1024 * 1024,
    },
  );
}

await test(
  "CacheManager initializes correctly",
  async () => {
    const cache = createCache();

    const health =
      await cache.health();

    assertEqual(
      health.healthy,
      true,
      "Cache should be healthy",
    );

    const stats = cache.stats();

    assertEqual(
      stats.hits,
      0,
      "Initial hits should be zero",
    );

    assertEqual(
      stats.misses,
      0,
      "Initial misses should be zero",
    );
  },
);

await test(
  "stores and retrieves JSON values",
  async () => {
    const cache = createCache();

    await cache.set(
      "org-001",
      "user:123",
      {
        name: "Prasanth",
        role: "AI Engineer",
      },
    );

    const result =
      await cache.get<{
        name: string;
        role: string;
      }>(
        "org-001",
        "user:123",
      );

    assert(
      result !== null,
      "Cached value should exist",
    );

    assertEqual(
      result?.name,
      "Prasanth",
      "Name should match",
    );

    assertEqual(
      result?.role,
      "AI Engineer",
      "Role should match",
    );
  },
);

await test(
  "records cache hits",
  async () => {
    const cache = createCache();

    await cache.set(
      "org-001",
      "key",
      {
        value: "hello",
      },
    );

    await cache.get(
      "org-001",
      "key",
    );

    const stats = cache.stats();

    assertEqual(
      stats.hits,
      1,
      "One cache hit should be recorded",
    );

    assertEqual(
      stats.misses,
      0,
      "There should be no cache miss",
    );
  },
);

await test(
  "records cache misses",
  async () => {
    const cache = createCache();

    const result =
      await cache.get(
        "org-001",
        "missing-key",
      );

    assertEqual(
      result,
      null,
      "Missing key should return null",
    );

    const stats = cache.stats();

    assertEqual(
      stats.misses,
      1,
      "One cache miss should be recorded",
    );
  },
);

await test(
  "calculates hit rate",
  async () => {
    const cache = createCache();

    await cache.set(
      "org-001",
      "key",
      "value",
    );

    await cache.get(
      "org-001",
      "key",
    );

    await cache.get(
      "org-001",
      "missing",
    );

    const stats = cache.stats();

    assertEqual(
      stats.hitRate,
      0.5,
      "Hit rate should be 50%",
    );
  },
);

await test(
  "supports getOrSet",
  async () => {
    const cache = createCache();

    let loaderCalls = 0;

    const first =
      await cache.getOrSet(
        "org-001",
        "model-response",
        async () => {
          loaderCalls++;

          return {
            answer: "Hello",
          };
        },
      );

    const second =
      await cache.getOrSet(
        "org-001",
        "model-response",
        async () => {
          loaderCalls++;

          return {
            answer: "Should not execute",
          };
        },
      );

    assertEqual(
      first.answer,
      "Hello",
      "First result should come from loader",
    );

    assertEqual(
      second.answer,
      "Hello",
      "Second result should come from cache",
    );

    assertEqual(
      loaderCalls,
      1,
      "Loader should execute only once",
    );
  },
);

await test(
  "isolates organizations",
  async () => {
    const cache = createCache();

    await cache.set(
      "org-A",
      "same-key",
      {
        organization: "A",
      },
    );

    await cache.set(
      "org-B",
      "same-key",
      {
        organization: "B",
      },
    );

    const orgA =
      await cache.get<{
        organization: string;
      }>(
        "org-A",
        "same-key",
      );

    const orgB =
      await cache.get<{
        organization: string;
      }>(
        "org-B",
        "same-key",
      );

    assertEqual(
      orgA?.organization,
      "A",
      "Organization A must receive its own value",
    );

    assertEqual(
      orgB?.organization,
      "B",
      "Organization B must receive its own value",
    );
  },
);

await test(
  "checks cache existence",
  async () => {
    const cache = createCache();

    assertEqual(
      await cache.has(
        "org-001",
        "key",
      ),
      false,
      "Key should not exist initially",
    );

    await cache.set(
      "org-001",
      "key",
      "value",
    );

    assertEqual(
      await cache.has(
        "org-001",
        "key",
      ),
      true,
      "Key should exist after set",
    );
  },
);

await test(
  "deletes cache entries",
  async () => {
    const cache = createCache();

    await cache.set(
      "org-001",
      "key",
      "value",
    );

    await cache.delete(
      "org-001",
      "key",
    );

    assertEqual(
      await cache.get(
        "org-001",
        "key",
      ),
      null,
      "Deleted value should not exist",
    );
  },
);

await test(
  "supports TTL expiration",
  async () => {
    const redis =
      new InMemoryRedisClient();

    const cache = new CacheManager(
      redis,
      {
        defaultTtlSeconds: 1,
      },
    );

    await cache.set(
      "org-001",
      "temporary",
      {
        value: "expires",
      },
      {
        ttlSeconds: 0.01,
      },
    );

    const immediate =
      await cache.get(
        "org-001",
        "temporary",
      );

    assert(
      immediate !== null,
      "Value should exist before expiration",
    );

    await new Promise(
      (resolve) =>
        setTimeout(resolve, 30),
    );

    const expired =
      await cache.get(
        "org-001",
        "temporary",
      );

    assertEqual(
      expired,
      null,
      "Value should expire",
    );
  },
);

await test(
  "updates TTL",
  async () => {
    const cache = createCache();

    await cache.set(
      "org-001",
      "key",
      "value",
      {
        ttlSeconds: 10,
      },
    );

    await cache.expire(
      "org-001",
      "key",
      1,
    );

    assertEqual(
      await cache.has(
        "org-001",
        "key",
      ),
      true,
      "Entry should still exist",
    );
  },
);

await test(
  "generates deterministic SHA-256 key hashes",
  async () => {
    const cache = createCache();

    const first =
      cache.hashKey(
        "organization:model:prompt",
      );

    const second =
      cache.hashKey(
        "organization:model:prompt",
      );

    assertEqual(
      first,
      second,
      "Same input should produce same hash",
    );

    assertEqual(
      first.length,
      64,
      "SHA-256 hash should be 64 characters",
    );
  },
);

await test(
  "builds tenant-isolated keys",
  async () => {
    const cache = createCache();

    const orgA =
      cache.buildKey(
        "org-A",
        "model-response",
      );

    const orgB =
      cache.buildKey(
        "org-B",
        "model-response",
      );

    assert(
      orgA !== orgB,
      "Different organizations must have different keys",
    );
  },
);

await test(
  "rejects empty organization IDs",
  async () => {
    const cache = createCache();

    await assertThrows(
      () =>
        cache.set(
          "",
          "key",
          "value",
        ),
      "Empty organization ID should be rejected",
    );
  },
);

await test(
  "rejects empty cache keys",
  async () => {
    const cache = createCache();

    await assertThrows(
      () =>
        cache.set(
          "org-001",
          "",
          "value",
        ),
      "Empty cache key should be rejected",
    );
  },
);

await test(
  "rejects invalid TTL",
  async () => {
    const cache = createCache();

    await assertThrows(
      () =>
        cache.set(
          "org-001",
          "key",
          "value",
          {
            ttlSeconds: 0,
          },
        ),
      "Invalid TTL should be rejected",
    );
  },
);

await test(
  "rejects values exceeding maximum size",
  async () => {
    const cache =
      new CacheManager(
        new InMemoryRedisClient(),
        {
          maxValueSizeBytes: 10,
        },
      );

    await assertThrows(
      () =>
        cache.set(
          "org-001",
          "large-value",
          "This value is definitely larger than ten bytes",
        ),
      "Large cache value should be rejected",
    );
  },
);

await test(
  "clears the cache",
  async () => {
    const cache = createCache();

    await cache.set(
      "org-001",
      "key-1",
      "value-1",
    );

    await cache.set(
      "org-002",
      "key-2",
      "value-2",
    );

    await cache.clear();

    assertEqual(
      await cache.get(
        "org-001",
        "key-1",
      ),
      null,
      "Organization A cache should be cleared",
    );

    assertEqual(
      await cache.get(
        "org-002",
        "key-2",
      ),
      null,
      "Organization B cache should be cleared",
    );
  },
);

await test(
  "returns cache health",
  async () => {
    const cache = createCache();

    await cache.set(
      "org-001",
      "key",
      "value",
    );

    await cache.get(
      "org-001",
      "key",
    );

    const health =
      await cache.health();

    assertEqual(
      health.healthy,
      true,
      "Cache should be healthy",
    );

    assertEqual(
      health.hits,
      1,
      "Health should report cache hits",
    );
  },
);

console.log("");
console.log(
  "Cache test suite completed successfully.",
);