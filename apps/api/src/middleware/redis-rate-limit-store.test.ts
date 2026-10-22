import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import {
  RedisRateLimitStore,
  type RedisScriptExecutor,
} from "./redis-rate-limit-store.js";

test("uses one atomic Redis script and hashes the client key", async () => {
  let capturedScript = "";
  let capturedOptions: {
    keys: string[];
    arguments: string[];
  } | undefined;

  const executor: RedisScriptExecutor = {
    async eval(script, options) {
      capturedScript = script;
      capturedOptions = options;
      return [3, 4500];
    },
  };

  const store = new RedisRateLimitStore(
    executor,
    "modelnow:test",
    () => 10000,
  );

  const result = await store.consume("client-ip-example", 60000);

  assert.deepEqual(result, { count: 3, resetAt: 14500 });
  assert.match(capturedScript, /redis\.call\("INCR"/);
  assert.match(capturedScript, /redis\.call\("PEXPIRE"/);
  assert.match(capturedScript, /redis\.call\("PTTL"/);

  assert.ok(capturedOptions);
  assert.deepEqual(capturedOptions.arguments, ["60000"]);
  assert.equal(
    capturedOptions.keys[0],
    `modelnow:test:${createHash("sha256")
      .update("client-ip-example")
      .digest("hex")}`,
  );
  assert.equal(capturedOptions.keys[0].includes("client-ip-example"), false);
});

test("rejects invalid window durations before calling Redis", async () => {
  let calls = 0;
  const executor: RedisScriptExecutor = {
    async eval() {
      calls += 1;
      return [1, 1000];
    },
  };

  const store = new RedisRateLimitStore(executor);

  await assert.rejects(
    store.consume("client-a", 0),
    /windowMs must be a positive safe integer/,
  );
  assert.equal(calls, 0);
});

test("rejects malformed Redis responses", async () => {
  const executor: RedisScriptExecutor = {
    async eval() {
      return ["invalid", -1];
    },
  };

  const store = new RedisRateLimitStore(executor);

  await assert.rejects(
    store.consume("client-a", 60000),
    /invalid rate-limit counter result/,
  );
});

test("propagates Redis connection failures to the caller", async () => {
  const executor: RedisScriptExecutor = {
    async eval() {
      throw new Error("Redis unavailable");
    },
  };

  const store = new RedisRateLimitStore(executor);

  await assert.rejects(store.consume("client-a", 60000), /Redis unavailable/);
});
