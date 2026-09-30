import assert from "node:assert/strict";

import {
  getEnvironment,
  loadSettings,
  validateSettings,
  isValidSettings,
} from "./index.js";

let passed = 0;
let failed = 0;

function test(
  name: string,
  fn: () => void,
): void {
  try {
    fn();
    console.log(`? PASS: ${name}`);
    passed++;
  } catch (error) {
    console.log(`? FAIL: ${name}`);

    if (error instanceof Error) {
      console.log(`  ${error.message}`);
    } else {
      console.log(`  ${String(error)}`);
    }

    failed++;
  }
}

console.log("");
console.log("========================================");
console.log("          AUTH CONFIG TEST");
console.log("========================================");
console.log("");

test("Development environment", () => {
  const result = getEnvironment("development");

  assert.equal(result.name, "development");
  assert.equal(result.isDevelopment, true);
  assert.equal(result.isProduction, false);
});

test("Test environment", () => {
  const result = getEnvironment("test");

  assert.equal(result.name, "test");
  assert.equal(result.isTest, true);
});

test("Staging environment", () => {
  const result = getEnvironment("staging");

  assert.equal(result.name, "staging");
  assert.equal(result.isStaging, true);
});

test("Production environment", () => {
  const result = getEnvironment("production");

  assert.equal(result.name, "production");
  assert.equal(result.isProduction, true);
});

test("Prod alias", () => {
  const result = getEnvironment("prod");

  assert.equal(result.name, "production");
});

test("Unknown environment defaults to development", () => {
  const result = getEnvironment("unknown");

  assert.equal(result.name, "development");
  assert.equal(result.isDevelopment, true);
});

test("Load default settings", () => {
  const result = loadSettings({});

  assert.equal(result.appName, "ModelNow Auth Service");
  assert.equal(result.version, "1.0.0");
  assert.equal(result.port, 3000);
  assert.equal(result.host, "0.0.0.0");
  assert.equal(result.apiPrefix, "/api");
  assert.equal(result.requestTimeoutMs, 30_000);
});

test("Load custom settings", () => {
  const result = loadSettings({
    APP_NAME: "Test Auth",
    APP_VERSION: "2.0.0",
    PORT: "8080",
    HOST: "127.0.0.1",
    DEBUG: "true",
    LOG_LEVEL: "debug",
    API_PREFIX: "/v1",
    REQUEST_TIMEOUT_MS: "5000",
  });

  assert.equal(result.appName, "Test Auth");
  assert.equal(result.version, "2.0.0");
  assert.equal(result.port, 8080);
  assert.equal(result.host, "127.0.0.1");
  assert.equal(result.debug, true);
  assert.equal(result.logLevel, "debug");
  assert.equal(result.apiPrefix, "/v1");
  assert.equal(result.requestTimeoutMs, 5000);
});

test("Invalid port is detected", () => {
  const result = loadSettings({
    PORT: "70000",
  });

  const errors = validateSettings(result);

  assert.ok(
    errors.some((error) =>
      error.includes("PORT"),
    ),
  );
});

test("Invalid API prefix is detected", () => {
  const result = loadSettings({
    API_PREFIX: "api",
  });

  const errors = validateSettings(result);

  assert.ok(
    errors.some((error) =>
      error.includes("API_PREFIX"),
    ),
  );
});

test("Valid settings return true", () => {
  const result = loadSettings({
    APP_NAME: "Auth Service",
    PORT: "4000",
    API_PREFIX: "/api/v1",
  });

  assert.equal(isValidSettings(result), true);
});

test("Invalid settings return false", () => {
  const result = loadSettings({
    PORT: "99999",
  });

  assert.equal(isValidSettings(result), false);
});

console.log("");
console.log("========================================");
console.log("              TEST RESULT");
console.log("========================================");
console.log(`Total Tests : ${passed + failed}`);
console.log(`Passed      : ${passed}`);
console.log(`Failed      : ${failed}`);
console.log("========================================");
console.log("");

if (failed > 0) {
  process.exitCode = 1;
  console.log("AUTH CONFIG TEST FAILED");
} else {
  console.log("ALL AUTH CONFIG TESTS PASSED ?");
}

console.log("");
