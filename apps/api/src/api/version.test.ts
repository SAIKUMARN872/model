import assert from "node:assert/strict";
import test from "node:test";
import { settings } from "../config/settings.js";
import {
  API_VERSION,
  API_VERSION_PREFIX,
  getApiVersionInfo,
} from "./version.js";

test("API version matches the configured version", () => {
  assert.equal(API_VERSION, settings.apiVersion);
});

test("API prefix follows the configured version", () => {
  assert.equal(API_VERSION_PREFIX, `/api/${settings.apiVersion}`);
});

test("version information contains the expected version and prefix", () => {
  const info = getApiVersionInfo();

  assert.equal(info.version, API_VERSION);
  assert.equal(info.prefix, API_VERSION_PREFIX);
});

test("version information is immutable", () => {
  assert.equal(Object.isFrozen(getApiVersionInfo()), true);
});
