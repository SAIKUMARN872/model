import { strict as assert } from "node:assert";
import { test } from "node:test";

import {
  SecurityAuthenticator,
  SecurityRateLimiter,
} from "./index.js";

test("authenticator starts empty", () => {
  const auth = new SecurityAuthenticator();

  assert.equal(auth.getApiKeyCount(), 0);
  assert.equal(auth.getBearerTokenCount(), 0);
  assert.equal(auth.getBasicUserCount(), 0);
});

test("API key authentication works", () => {
  const auth = new SecurityAuthenticator();

  auth.addApiKey({
    key: "test-api-key",
    subject: "user-1",
  });

  const result = auth.authenticate({
    apiKey: "test-api-key",
  });

  assert.equal(result.authenticated, true);
  assert.equal(result.type, "api_key");
  assert.equal(result.subject, "user-1");
});

test("API key header authentication works", () => {
  const auth = new SecurityAuthenticator();

  auth.addApiKey({
    key: "header-key",
    subject: "user-2",
  });

  const result = auth.authenticate({
    headers: {
      "X-API-Key": "header-key",
    },
  });

  assert.equal(result.authenticated, true);
  assert.equal(result.subject, "user-2");
});

test("invalid API key is rejected", () => {
  const auth = new SecurityAuthenticator();

  auth.addApiKey({
    key: "valid-key",
    subject: "user-1",
  });

  const result = auth.authenticate({
    apiKey: "invalid-key",
  });

  assert.equal(result.authenticated, false);
  assert.equal(result.type, "api_key");
});

test("disabled API key is rejected", () => {
  const auth = new SecurityAuthenticator();

  auth.addApiKey({
    key: "disabled-key",
    subject: "user-1",
    enabled: false,
  });

  const result = auth.authenticate({
    apiKey: "disabled-key",
  });

  assert.equal(result.authenticated, false);
  assert.equal(result.reason, "API key is disabled");
});

test("bearer authentication works", () => {
  const auth = new SecurityAuthenticator();

  auth.addBearerToken(
    "bearer-token",
    "user-3",
  );

  const result = auth.authenticate({
    headers: {
      Authorization: "Bearer bearer-token",
    },
  });

  assert.equal(result.authenticated, true);
  assert.equal(result.type, "bearer");
  assert.equal(result.subject, "user-3");
});

test("invalid bearer token is rejected", () => {
  const auth = new SecurityAuthenticator();

  auth.addBearerToken(
    "valid-token",
    "user-1",
  );

  const result = auth.authenticate({
    bearerToken: "invalid-token",
  });

  assert.equal(result.authenticated, false);
  assert.equal(result.type, "bearer");
});

test("basic authentication works", () => {
  const auth = new SecurityAuthenticator();

  auth.addBasicUser(
    "admin",
    "password123",
  );

  const result = auth.authenticate({
    username: "admin",
    password: "password123",
  });

  assert.equal(result.authenticated, true);
  assert.equal(result.type, "basic");
  assert.equal(result.subject, "admin");
});

test("basic authorization header works", () => {
  const auth = new SecurityAuthenticator();

  auth.addBasicUser(
    "admin",
    "password123",
  );

  const encoded = Buffer.from(
    "admin:password123",
  ).toString("base64");

  const result = auth.authenticate({
    headers: {
      Authorization: `Basic ${encoded}`,
    },
  });

  assert.equal(result.authenticated, true);
  assert.equal(result.subject, "admin");
});

test("invalid basic credentials are rejected", () => {
  const auth = new SecurityAuthenticator();

  auth.addBasicUser(
    "admin",
    "password123",
  );

  const result = auth.authenticate({
    username: "admin",
    password: "wrong-password",
  });

  assert.equal(result.authenticated, false);
});

test("missing authentication returns unauthenticated", () => {
  const auth = new SecurityAuthenticator();

  const result = auth.authenticate({});

  assert.equal(result.authenticated, false);
  assert.equal(result.type, "none");
});

test("authenticator removes credentials", () => {
  const auth = new SecurityAuthenticator();

  auth.addApiKey({
    key: "key-1",
    subject: "user-1",
  });

  auth.addBearerToken(
    "token-1",
    "user-2",
  );

  auth.addBasicUser(
    "user-3",
    "password",
  );

  assert.equal(
    auth.removeApiKey("key-1"),
    true,
  );

  assert.equal(
    auth.removeBearerToken("token-1"),
    true,
  );

  assert.equal(
    auth.removeBasicUser("user-3"),
    true,
  );

  assert.equal(auth.getApiKeyCount(), 0);
  assert.equal(auth.getBearerTokenCount(), 0);
  assert.equal(auth.getBasicUserCount(), 0);
});

test("authenticator health works", () => {
  const auth = new SecurityAuthenticator();

  auth.addApiKey({
    key: "key-1",
    subject: "user-1",
  });

  const health = auth.health();

  assert.equal(health.healthy, true);
  assert.equal(health.apiKeys, 1);
});

test("rate limiter creates a rule", () => {
  const limiter = new SecurityRateLimiter();

  limiter.addRule({
    id: "api",
    limit: 3,
    windowMs: 60_000,
  });

  assert.equal(limiter.size(), 1);
});

test("rate limiter allows requests", () => {
  const limiter = new SecurityRateLimiter();

  limiter.addRule({
    id: "api",
    limit: 3,
    windowMs: 60_000,
  });

  const result = limiter.check({
    key: "user-1",
  });

  assert.equal(result.allowed, true);
  assert.equal(result.limit, 3);
  assert.equal(result.remaining, 2);
});

test("rate limiter blocks requests after limit", () => {
  const limiter = new SecurityRateLimiter();

  limiter.addRule({
    id: "api",
    limit: 2,
    windowMs: 60_000,
  });

  const first = limiter.check({
    key: "user-1",
  });

  const second = limiter.check({
    key: "user-1",
  });

  const third = limiter.check({
    key: "user-1",
  });

  assert.equal(first.allowed, true);
  assert.equal(second.allowed, true);
  assert.equal(third.allowed, false);
  assert.equal(third.remaining, 0);
  assert.ok(third.retryAfterMs > 0);
});

test("rate limiter isolates keys", () => {
  const limiter = new SecurityRateLimiter();

  limiter.addRule({
    id: "api",
    limit: 1,
    windowMs: 60_000,
  });

  const user1 = limiter.check({
    key: "user-1",
  });

  const user2 = limiter.check({
    key: "user-2",
  });

  assert.equal(user1.allowed, true);
  assert.equal(user2.allowed, true);
});

test("checkWithoutConsume does not increment usage", () => {
  const limiter = new SecurityRateLimiter();

  limiter.addRule({
    id: "api",
    limit: 2,
    windowMs: 60_000,
  });

  const preview = limiter.checkWithoutConsume({
    key: "user-1",
  });

  assert.equal(preview.allowed, true);
  assert.equal(preview.remaining, 2);

  const actual = limiter.check({
    key: "user-1",
  });

  assert.equal(actual.allowed, true);
  assert.equal(actual.remaining, 1);
});

test("rate limiter reset works", () => {
  const limiter = new SecurityRateLimiter();

  limiter.addRule({
    id: "api",
    limit: 1,
    windowMs: 60_000,
  });

  limiter.check({
    key: "user-1",
  });

  assert.equal(
    limiter.check({
      key: "user-1",
    }).allowed,
    false,
  );

  limiter.reset("user-1");

  assert.equal(
    limiter.check({
      key: "user-1",
    }).allowed,
    true,
  );
});

test("rate limiter update rule works", () => {
  const limiter = new SecurityRateLimiter();

  limiter.addRule({
    id: "api",
    limit: 2,
    windowMs: 60_000,
  });

  const updated = limiter.updateRule(
    "api",
    {
      limit: 10,
    },
  );

  assert.equal(updated.limit, 10);
});

test("disabled rule is ignored", () => {
  const limiter = new SecurityRateLimiter();

  limiter.addRule({
    id: "api",
    limit: 1,
    windowMs: 60_000,
    enabled: false,
  });

  assert.throws(
    () =>
      limiter.check({
        key: "user-1",
      }),
    /No enabled rate limit rule available/,
  );
});

test("rate limiter health works", () => {
  const limiter = new SecurityRateLimiter();

  limiter.addRule({
    id: "api",
    limit: 5,
    windowMs: 60_000,
  });

  const health = limiter.health();

  assert.equal(health.healthy, true);
  assert.equal(health.ruleCount, 1);
});

test("rate limiter clear works", () => {
  const limiter = new SecurityRateLimiter();

  limiter.addRule({
    id: "api",
    limit: 5,
    windowMs: 60_000,
  });

  limiter.check({
    key: "user-1",
  });

  limiter.clear();

  assert.equal(limiter.size(), 0);
  assert.equal(limiter.bucketSize(), 0);
});