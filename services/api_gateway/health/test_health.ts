import assert from "node:assert/strict";
import { test } from "node:test";

import {
  HealthService,
  checkEnvironment,
  checkMemory,
  checkProcess,
  runHealthCheck,
} from "./index.js";

test("process health check is healthy", async () => {
  const result = await checkProcess();

  assert.equal(result.name, "process");
  assert.equal(result.status, "healthy");
  assert.ok(result.responseTimeMs >= 0);
  assert.ok(result.timestamp);
});

test("memory health check works", async () => {
  const result = await checkMemory(999999);

  assert.equal(result.name, "memory");
  assert.equal(result.status, "healthy");
  assert.ok(result.details);
});

test("memory check can detect degraded state", async () => {
  const result = await checkMemory(0.000001);

  assert.equal(result.name, "memory");
  assert.equal(result.status, "degraded");
});

test("environment health check passes", async () => {
  const result = await checkEnvironment([]);

  assert.equal(result.name, "environment");
  assert.equal(result.status, "healthy");
});

test("environment health check detects missing variables", async () => {
  const variableName =
    "MODELNOW_TEST_REQUIRED_VARIABLE";

  delete process.env[variableName];

  const result = await checkEnvironment([
    variableName,
  ]);

  assert.equal(result.name, "environment");
  assert.equal(result.status, "unhealthy");

  assert.deepEqual(
    result.details?.missingVariables,
    [variableName],
  );
});

test("environment health check passes with configured variable", async () => {
  const variableName =
    "MODELNOW_TEST_CONFIGURED_VARIABLE";

  process.env[variableName] = "configured";

  const result = await checkEnvironment([
    variableName,
  ]);

  assert.equal(result.name, "environment");
  assert.equal(result.status, "healthy");

  delete process.env[variableName];
});

test("custom health check works", async () => {
  const result = await runHealthCheck(
    "database",
    async () => ({
      status: "healthy",
      message: "Database connection is healthy.",
      details: {
        connected: true,
      },
    }),
  );

  assert.equal(result.name, "database");
  assert.equal(result.status, "healthy");
  assert.equal(
    result.message,
    "Database connection is healthy.",
  );
  assert.deepEqual(result.details, {
    connected: true,
  });
});

test("failed custom health check becomes unhealthy", async () => {
  const result = await runHealthCheck(
    "database",
    async () => {
      throw new Error("Database connection failed");
    },
  );

  assert.equal(result.name, "database");
  assert.equal(result.status, "unhealthy");
  assert.equal(
    result.message,
    "Database connection failed",
  );
});

test("timed out health check becomes unhealthy", async () => {
  const result = await runHealthCheck(
    "slow-service",
    async () => {
      await new Promise((resolve) =>
        setTimeout(resolve, 100),
      );

      return {
        status: "healthy" as const,
      };
    },
    {
      timeoutMs: 10,
    },
  );

  assert.equal(result.name, "slow-service");
  assert.equal(result.status, "unhealthy");
  assert.match(
    result.message ?? "",
    /timed out/i,
  );
});

test("HealthService returns complete health report", async () => {
  const service = new HealthService(
    "modelnow-api-gateway",
    "1.0.0",
  );

  const report = await service.check();

  assert.equal(
    report.service,
    "modelnow-api-gateway",
  );

  assert.equal(report.version, "1.0.0");

  assert.ok(
    ["healthy", "degraded", "unhealthy"].includes(
      report.status,
    ),
  );

  assert.ok(Array.isArray(report.checks));
  assert.ok(report.checks.length >= 2);
  assert.ok(report.timestamp);
});

test("custom health checks can be registered", async () => {
  const service = new HealthService();

  service.registerCheck(
    "redis",
    async () => ({
      status: "healthy",
      message: "Redis is healthy.",
    }),
  );

  assert.equal(
    service.hasCheck("redis"),
    true,
  );

  assert.deepEqual(
    service.getCheckNames(),
    ["redis"],
  );

  const report = await service.check();

  const redisCheck = report.checks.find(
    (check) => check.name === "redis",
  );

  assert.ok(redisCheck);
  assert.equal(redisCheck.status, "healthy");
});

test("duplicate custom checks are rejected", () => {
  const service = new HealthService();

  service.registerCheck(
    "database",
    async () => ({
      status: "healthy",
    }),
  );

  assert.throws(
    () =>
      service.registerCheck(
        "database",
        async () => ({
          status: "healthy",
        }),
      ),
    /already exists/,
  );
});

test("custom check can be removed", () => {
  const service = new HealthService();

  service.registerCheck(
    "redis",
    async () => ({
      status: "healthy",
    }),
  );

  assert.equal(
    service.removeCheck("redis"),
    true,
  );

  assert.equal(
    service.hasCheck("redis"),
    false,
  );

  assert.equal(
    service.removeCheck("redis"),
    false,
  );
});

test("liveness endpoint returns alive status", async () => {
  const service = new HealthService();

  const result = await service.liveness();

  assert.equal(result.alive, true);
  assert.equal(result.status, "healthy");
  assert.equal(result.checks.length, 1);
  assert.equal(result.checks[0].name, "process");
});

test("readiness endpoint returns ready status", async () => {
  const service = new HealthService();

  const result = await service.readiness();

  assert.equal(result.ready, true);
  assert.equal(result.status, "healthy");
});

test("health service reports registered check count", () => {
  const service = new HealthService();

  service.registerCheck(
    "database",
    async () => ({
      status: "healthy",
    }),
  );

  service.registerCheck(
    "redis",
    async () => ({
      status: "healthy",
    }),
  );

  assert.deepEqual(service.health(), {
    status: "ok",
    component: "health-service",
    checks: 2,
  });
});

test("invalid health service name is rejected", () => {
  assert.throws(
    () => new HealthService("", "1.0.0"),
    /Service name is required/,
  );
});

test("invalid health service version is rejected", () => {
  assert.throws(
    () => new HealthService("modelnow", ""),
    /Service version is required/,
  );
});

test("invalid health check name is rejected", async () => {
  await assert.rejects(
    async () =>
      runHealthCheck(
        "",
        async () => ({
          status: "healthy",
        }),
      ),
    /Health check name is required/,
  );
});