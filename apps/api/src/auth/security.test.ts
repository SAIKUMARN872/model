import assert from "node:assert/strict";
import test from "node:test";
import {
  createJwtAuthenticationConfig,
  createOAuthConfiguration,
} from "./security.js";

const validJwtConfig = {
  issuer: "https://identity.example.test",
  audience: "modelnow-api",
  jwksUrl: "https://identity.example.test/.well-known/jwks.json",
};

test("accepts valid HTTPS JWT configuration and applies secure defaults", () => {
  const config = createJwtAuthenticationConfig(validJwtConfig);

  assert.equal(config.issuer, "https://identity.example.test");
  assert.equal(config.audience, "modelnow-api");
  assert.deepEqual(config.algorithms, ["RS256"]);
  assert.equal(config.clockToleranceSeconds, 5);
  assert.ok(Object.isFrozen(config));
});

test("rejects an HTTP issuer", () => {
  assert.throws(
    () => createJwtAuthenticationConfig({
      ...validJwtConfig,
      issuer: "http://identity.example.test",
    }),
    /HTTPS/,
  );
});

test("rejects an HTTP JWKS URL", () => {
  assert.throws(
    () => createJwtAuthenticationConfig({
      ...validJwtConfig,
      jwksUrl: "http://identity.example.test/jwks",
    }),
    /HTTPS/,
  );
});

test("rejects unsupported JWT algorithms", () => {
  assert.throws(
    () => createJwtAuthenticationConfig({
      ...validJwtConfig,
      algorithms: ["HS256" as never],
    }),
    /unsupported/,
  );
});

test("rejects empty or duplicated algorithms", () => {
  assert.throws(
    () => createJwtAuthenticationConfig({
      ...validJwtConfig,
      algorithms: [],
    }),
    /empty/,
  );
  assert.throws(
    () => createJwtAuthenticationConfig({
      ...validJwtConfig,
      algorithms: ["RS256", "RS256"],
    }),
    /duplicated/,
  );
});

test("rejects unsafe clock tolerance", () => {
  assert.throws(
    () => createJwtAuthenticationConfig({
      ...validJwtConfig,
      clockToleranceSeconds: 61,
    }),
    /between 0 and 60/,
  );
});

test("rejects missing audience", () => {
  assert.throws(
    () => createJwtAuthenticationConfig({
      ...validJwtConfig,
      audience: " ",
    }),
    /audience is required/,
  );
});

test("creates OAuth configuration with default scopes", () => {
  const config = createOAuthConfiguration({
    issuer: "https://identity.example.test",
    clientId: "modelnow-client",
    redirectUri: "https://app.example.test/callback",
  });

  assert.deepEqual(config.scopes, ["openid", "profile"]);
  assert.ok(Object.isFrozen(config.scopes));
});

test("rejects an OAuth configuration without openid scope", () => {
  assert.throws(
    () => createOAuthConfiguration({
      issuer: "https://identity.example.test",
      clientId: "modelnow-client",
      redirectUri: "https://app.example.test/callback",
      scopes: ["profile"],
    }),
    /include openid/,
  );
});
