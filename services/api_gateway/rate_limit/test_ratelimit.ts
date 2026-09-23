import assert from "node:assert/strict";
import test from "node:test";

import {
  RateLimiter,
} from "./limiter.js";

import {
  RateLimitRuleRegistry,
} from "./rules.js";

import {
  QuotaManager,
} from "./quota.js";

test("RateLimitRuleRegistry adds a rule", () => {
  const registry =
    new RateLimitRuleRegistry();

  const rule = registry.add({
    id: "api-rule",
    name: "API Requests",
    keyType: "ip",
    limit: 5,
    windowMs: 60_000,
  });

  assert.equal(rule.id, "api-rule");
  assert.equal(rule.limit, 5);
  assert.equal(registry.size(), 1);
});

test("RateLimitRuleRegistry rejects duplicate rule", () => {
  const registry =
    new RateLimitRuleRegistry();

  registry.add({
    id: "api-rule",
    name: "API Requests",
    keyType: "ip",
    limit: 5,
    windowMs: 60_000,
  });

  assert.throws(() => {
    registry.add({
      id: "api-rule",
      name: "Duplicate",
      keyType: "ip",
      limit: 10,
      windowMs: 60_000,
    });
  });
});

test("RateLimitRuleRegistry updates rule", () => {
  const registry =
    new RateLimitRuleRegistry();

  registry.add({
    id: "api-rule",
    name: "API Requests",
    keyType: "ip",
    limit: 5,
    windowMs: 60_000,
  });

  const updated =
    registry.update("api-rule", {
      limit: 10,
    });

  assert.equal(updated.limit, 10);
});

test("RateLimitRuleRegistry matches IP", () => {
  const registry =
    new RateLimitRuleRegistry();

  registry.add({
    id: "ip-rule",
    name: "IP Rate Limit",
    keyType: "ip",
    limit: 10,
    windowMs: 60_000,
  });

  const matches = registry.match({
    ip: "127.0.0.1",
  });

  assert.equal(matches.length, 1);
  assert.equal(
    matches[0].key,
    "127.0.0.1",
  );
});

test("RateLimiter allows requests within limit", () => {
  const registry =
    new RateLimitRuleRegistry();

  registry.add({
    id: "test-rule",
    name: "Test Rule",
    keyType: "ip",
    limit: 3,
    windowMs: 60_000,
  });

  const limiter = new RateLimiter({
    registry,
  });

  const first = limiter.check({
    ip: "10.0.0.1",
  });

  const second = limiter.check({
    ip: "10.0.0.1",
  });

  const third = limiter.check({
    ip: "10.0.0.1",
  });

  assert.equal(first[0].allowed, true);
  assert.equal(second[0].allowed, true);
  assert.equal(third[0].allowed, true);

  assert.equal(third[0].remaining, 0);
});

test("RateLimiter blocks requests after limit", () => {
  const registry =
    new RateLimitRuleRegistry();

  registry.add({
    id: "test-rule",
    name: "Test Rule",
    keyType: "ip",
    limit: 2,
    windowMs: 60_000,
  });

  const limiter = new RateLimiter({
    registry,
  });

  limiter.check({
    ip: "10.0.0.2",
  });

  limiter.check({
    ip: "10.0.0.2",
  });

  const result = limiter.check({
    ip: "10.0.0.2",
  });

  assert.equal(result[0].allowed, false);
  assert.equal(result[0].remaining, 0);
  assert.ok(result[0].retryAfterMs >= 0);
});

test("RateLimiter isolates different clients", () => {
  const registry =
    new RateLimitRuleRegistry();

  registry.add({
    id: "ip-rule",
    name: "IP Rule",
    keyType: "ip",
    limit: 1,
    windowMs: 60_000,
  });

  const limiter = new RateLimiter({
    registry,
  });

  const clientOne =
    limiter.check({
      ip: "10.0.0.1",
    });

  const clientTwo =
    limiter.check({
      ip: "10.0.0.2",
    });

  assert.equal(
    clientOne[0].allowed,
    true,
  );

  assert.equal(
    clientTwo[0].allowed,
    true,
  );
});

test("RateLimiter works with user based limits", () => {
  const registry =
    new RateLimitRuleRegistry();

  registry.add({
    id: "user-rule",
    name: "User Rule",
    keyType: "user",
    limit: 2,
    windowMs: 60_000,
  });

  const limiter = new RateLimiter({
    registry,
  });

  limiter.check({
    userId: "user-1",
  });

  limiter.check({
    userId: "user-1",
  });

  const result =
    limiter.check({
      userId: "user-1",
    });

  assert.equal(
    result[0].allowed,
    false,
  );
});

test("RateLimiter supports checkWithoutConsume", () => {
  const registry =
    new RateLimitRuleRegistry();

  registry.add({
    id: "test-rule",
    name: "Test Rule",
    keyType: "ip",
    limit: 2,
    windowMs: 60_000,
  });

  const limiter = new RateLimiter({
    registry,
  });

  const before =
    limiter.checkWithoutConsume({
      ip: "127.0.0.1",
    });

  assert.equal(
    before[0].allowed,
    true,
  );

  assert.equal(
    before[0].remaining,
    2,
  );

  const actual =
    limiter.check({
      ip: "127.0.0.1",
    });

  assert.equal(
    actual[0].remaining,
    1,
  );
});

test("RateLimiter reset works", () => {
  const registry =
    new RateLimitRuleRegistry();

  registry.add({
    id: "test-rule",
    name: "Test Rule",
    keyType: "ip",
    limit: 1,
    windowMs: 60_000,
  });

  const limiter = new RateLimiter({
    registry,
  });

  limiter.check({
    ip: "127.0.0.1",
  });

  const blocked =
    limiter.check({
      ip: "127.0.0.1",
    });

  assert.equal(
    blocked[0].allowed,
    false,
  );

  limiter.reset(
    "test-rule",
    "127.0.0.1",
  );

  const allowed =
    limiter.check({
      ip: "127.0.0.1",
    });

  assert.equal(
    allowed[0].allowed,
    true,
  );
});

test("RateLimiter health works", () => {
  const registry =
    new RateLimitRuleRegistry();

  registry.add({
    id: "health-rule",
    name: "Health Rule",
    keyType: "ip",
    limit: 10,
    windowMs: 60_000,
  });

  const limiter = new RateLimiter({
    registry,
  });

  const health = limiter.health();

  assert.equal(
    health.healthy,
    true,
  );

  assert.equal(
    health.rules,
    1,
  );
});

test("QuotaManager creates quota", () => {
  const quota =
    new QuotaManager();

  const definition =
    quota.addQuota({
      id: "monthly-api",
      name: "Monthly API Quota",
      limit: 100,
      periodMs: 30 * 24 * 60 * 60 * 1000,
    });

  assert.equal(
    definition.limit,
    100,
  );

  assert.equal(
    quota.size(),
    1,
  );
});

test("QuotaManager consumes quota", () => {
  const quota =
    new QuotaManager();

  quota.addQuota({
    id: "api-quota",
    name: "API Quota",
    limit: 10,
    periodMs: 60_000,
  });

  const result =
    quota.consume(
      "api-quota",
      "user-1",
      3,
    );

  assert.equal(
    result.used,
    3,
  );

  assert.equal(
    result.remaining,
    7,
  );
});

test("QuotaManager blocks when quota is exceeded", () => {
  const quota =
    new QuotaManager();

  quota.addQuota({
    id: "api-quota",
    name: "API Quota",
    limit: 5,
    periodMs: 60_000,
  });

  quota.consume(
    "api-quota",
    "user-1",
    5,
  );

  assert.equal(
    quota.isAllowed(
      "api-quota",
      "user-1",
      1,
    ),
    false,
  );
});

test("QuotaManager allows different users", () => {
  const quota =
    new QuotaManager();

  quota.addQuota({
    id: "api-quota",
    name: "API Quota",
    limit: 2,
    periodMs: 60_000,
  });

  quota.consume(
    "api-quota",
    "user-1",
    2,
  );

  assert.equal(
    quota.isAllowed(
      "api-quota",
      "user-1",
      1,
    ),
    false,
  );

  assert.equal(
    quota.isAllowed(
      "api-quota",
      "user-2",
      1,
    ),
    true,
  );
});

test("QuotaManager reset works", () => {
  const quota =
    new QuotaManager();

  quota.addQuota({
    id: "api-quota",
    name: "API Quota",
    limit: 2,
    periodMs: 60_000,
  });

  quota.consume(
    "api-quota",
    "user-1",
    2,
  );

  assert.equal(
    quota.isAllowed(
      "api-quota",
      "user-1",
      1,
    ),
    false,
  );

  quota.reset(
    "api-quota",
    "user-1",
  );

  assert.equal(
    quota.isAllowed(
      "api-quota",
      "user-1",
      1,
    ),
    true,
  );
});

test("QuotaManager update works", () => {
  const quota =
    new QuotaManager();

  quota.addQuota({
    id: "api-quota",
    name: "API Quota",
    limit: 10,
    periodMs: 60_000,
  });

  const updated =
    quota.updateQuota(
      "api-quota",
      {
        limit: 20,
      },
    );

  assert.equal(
    updated.limit,
    20,
  );
});