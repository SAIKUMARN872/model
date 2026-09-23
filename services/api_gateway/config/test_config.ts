import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createSettings,
  loadEnvironment,
} from "./index.js";

test("loads development environment by default", () => {
  const config = loadEnvironment({});

  assert.equal(config.name, "development");
  assert.equal(config.isDevelopment, true);
  assert.equal(config.isProduction, false);
  assert.equal(config.port, 3000);
  assert.equal(config.host, "0.0.0.0");
});

test("loads production environment", () => {
  const config = loadEnvironment({
    NODE_ENV: "production",
    PORT: "8080",
    HOST: "127.0.0.1",
  });

  assert.equal(config.name, "production");
  assert.equal(config.isProduction, true);
  assert.equal(config.port, 8080);
  assert.equal(config.host, "127.0.0.1");
});

test("supports environment aliases", () => {
  assert.equal(loadEnvironment({ NODE_ENV: "dev" }).name, "development");
  assert.equal(loadEnvironment({ NODE_ENV: "stage" }).name, "staging");
  assert.equal(loadEnvironment({ NODE_ENV: "prod" }).name, "production");
});

test("rejects invalid environment", () => {
  assert.throws(
    () => loadEnvironment({ NODE_ENV: "invalid" }),
    /Invalid NODE_ENV/,
  );
});

test("rejects invalid port", () => {
  assert.throws(
    () => loadEnvironment({ PORT: "99999" }),
    /Invalid PORT/,
  );
});

test("creates application settings", () => {
  const config = createSettings({
    NODE_ENV: "development",
    APP_NAME: "ModelNow",
    APP_VERSION: "1.0.0",
    PORT: "4000",
    HOST: "localhost",
    JWT_SECRET: "test-secret",
    JWT_ISSUER: "modelnow-test",
    JWT_AUDIENCE: "modelnow-client",
    SESSION_TTL_SECONDS: "7200",
    API_PREFIX: "/api/v1",
    REQUEST_TIMEOUT_MS: "15000",
    MAX_BODY_SIZE_MB: "20",
    LOG_LEVEL: "debug",
    CORS_ENABLED: "true",
    CORS_ORIGINS: "http://localhost:3000,http://localhost:5173",
  });

  assert.equal(config.appName, "ModelNow");
  assert.equal(config.version, "1.0.0");
  assert.equal(config.environment, "development");

  assert.equal(config.server.port, 4000);
  assert.equal(config.server.host, "localhost");

  assert.equal(config.security.jwtSecret, "test-secret");
  assert.equal(config.security.jwtIssuer, "modelnow-test");
  assert.equal(config.security.jwtAudience, "modelnow-client");
  assert.equal(config.security.sessionTtlSeconds, 7200);

  assert.equal(config.api.prefix, "/api/v1");
  assert.equal(config.api.requestTimeoutMs, 15000);
  assert.equal(config.api.maxBodySizeMb, 20);

  assert.equal(config.logging.level, "debug");

  assert.equal(config.cors.enabled, true);
  assert.deepEqual(config.cors.origins, [
    "http://localhost:3000",
    "http://localhost:5173",
  ]);
});

test("uses default settings", () => {
  const config = createSettings({
    NODE_ENV: "test",
    JWT_SECRET: "test-secret",
  });

  assert.equal(config.appName, "ModelNow API Gateway");
  assert.equal(config.server.port, 3000);
  assert.equal(config.security.jwtIssuer, "modelnow");
  assert.equal(config.security.jwtAudience, "modelnow-api");
  assert.equal(config.security.sessionTtlSeconds, 3600);
  assert.equal(config.api.prefix, "/api/v1");
  assert.equal(config.logging.level, "info");
  assert.equal(config.cors.enabled, true);
  assert.deepEqual(config.cors.origins, ["*"]);
});

test("parses false CORS setting", () => {
  const config = createSettings({
    NODE_ENV: "test",
    JWT_SECRET: "test-secret",
    CORS_ENABLED: "false",
  });

  assert.equal(config.cors.enabled, false);
});

test("rejects invalid log level", () => {
  assert.throws(
    () =>
      createSettings({
        NODE_ENV: "test",
        JWT_SECRET: "test-secret",
        LOG_LEVEL: "invalid",
      }),
    /Invalid LOG_LEVEL/,
  );
});

test("rejects invalid numeric settings", () => {
  assert.throws(
    () =>
      createSettings({
        NODE_ENV: "test",
        JWT_SECRET: "test-secret",
        REQUEST_TIMEOUT_MS: "invalid",
      }),
    /Invalid REQUEST_TIMEOUT_MS/,
  );
});

test("requires JWT secret in production", () => {
  assert.throws(
    () =>
      createSettings({
        NODE_ENV: "production",
      }),
    /JWT_SECRET must be configured/,
  );
});

test("accepts custom production JWT secret", () => {
  const config = createSettings({
    NODE_ENV: "production",
    JWT_SECRET: "strong-production-secret",
  });

  assert.equal(config.environment, "production");
  assert.equal(config.security.jwtSecret, "strong-production-secret");
});