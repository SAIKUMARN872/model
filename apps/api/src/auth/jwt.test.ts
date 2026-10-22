import assert from "node:assert/strict";
import test from "node:test";
import {
  createLocalJWKSet,
  exportJWK,
  generateKeyPair,
  SignJWT,
} from "jose";
import {
  InvalidCredentialsError,
} from "../errors/authentication.error.js";
import {
  createJwtAuthenticationProvider,
} from "./jwt.js";
import {
  createJwtAuthenticationConfig,
} from "./security.js";

const issuer = "https://identity.example.test";
const audience = "modelnow-api";
const kid = "modelnow-test-key";

async function createTestSetup() {
  const { publicKey, privateKey } = await generateKeyPair("RS256");
  const publicJwk = await exportJWK(publicKey);
  publicJwk.kid = kid;
  publicJwk.alg = "RS256";
  publicJwk.use = "sig";

  const resolver = createLocalJWKSet({ keys: [publicJwk] });
  const config = createJwtAuthenticationConfig({
    issuer,
    audience,
    jwksUrl: `${issuer}/.well-known/jwks.json`,
  });
  const provider = createJwtAuthenticationProvider(config, resolver);

  return { privateKey, provider };
}

async function signToken(
  privateKey: CryptoKey,
  overrides: {
    issuer?: string;
    audience?: string;
    subject?: string | null;
    expiration?: string | number;
    payload?: Record<string, unknown>;
  } = {},
) {
  const payload: Record<string, unknown> = {
    tenant_id: "tenant-42",
    roles: ["user", "operator"],
    scope: "chat:read chat:write",
    ...(overrides.payload ?? {}),
  };

  if (overrides.subject === null) {
    delete payload.sub;
  } else {
    payload.sub = overrides.subject ?? "user-42";
  }

  const token = new SignJWT(payload)
    .setProtectedHeader({ alg: "RS256", kid, typ: "JWT" })
    .setIssuer(overrides.issuer ?? issuer)
    .setAudience(overrides.audience ?? audience)
    .setIssuedAt();

  if (overrides.expiration !== undefined) {
    token.setExpirationTime(overrides.expiration);
  } else {
    token.setExpirationTime("5m");
  }

  return token.sign(privateKey);
}

test("accepts a valid signed token and maps principal claims", async () => {
  const { privateKey, provider } = await createTestSetup();
  const token = await signToken(privateKey);

  const principal = await provider.verifyAccessToken(token);

  assert.equal(principal.userId, "user-42");
  assert.equal(principal.tenantId, "tenant-42");
  assert.deepEqual(principal.roles, ["user", "operator"]);
  assert.deepEqual(principal.scopes, ["chat:read", "chat:write"]);
  assert.ok(Object.isFrozen(principal));
  assert.ok(Object.isFrozen(principal.roles));
  assert.ok(Object.isFrozen(principal.scopes));
});

test("rejects an expired token", async () => {
  const { privateKey, provider } = await createTestSetup();
  const token = await signToken(privateKey, { expiration: Math.floor(Date.now() / 1000) - 10 });

  await assert.rejects(
    provider.verifyAccessToken(token),
    InvalidCredentialsError,
  );
});

test("rejects a token with the wrong issuer", async () => {
  const { privateKey, provider } = await createTestSetup();
  const token = await signToken(privateKey, {
    issuer: "https://wrong-issuer.example.test",
  });

  await assert.rejects(
    provider.verifyAccessToken(token),
    InvalidCredentialsError,
  );
});

test("rejects a token with the wrong audience", async () => {
  const { privateKey, provider } = await createTestSetup();
  const token = await signToken(privateKey, {
    audience: "different-api",
  });

  await assert.rejects(
    provider.verifyAccessToken(token),
    InvalidCredentialsError,
  );
});

test("rejects a token without a subject", async () => {
  const { privateKey, provider } = await createTestSetup();
  const token = await signToken(privateKey, { subject: null });

  await assert.rejects(
    provider.verifyAccessToken(token),
    InvalidCredentialsError,
  );
});

test("rejects a token signed with an untrusted key", async () => {
  const { provider } = await createTestSetup();
  const otherKey = await generateKeyPair("RS256");
  const token = await signToken(otherKey.privateKey);

  await assert.rejects(
    provider.verifyAccessToken(token),
    InvalidCredentialsError,
  );
});

test("rejects an empty token", async () => {
  const { provider } = await createTestSetup();

  await assert.rejects(
    provider.verifyAccessToken(" "),
    InvalidCredentialsError,
  );
});

test("rejects malformed roles claim", async () => {
  const { privateKey, provider } = await createTestSetup();
  const token = await signToken(privateKey, {
    payload: { roles: "administrator" },
  });

  await assert.rejects(
    provider.verifyAccessToken(token),
    InvalidCredentialsError,
  );
});

test("rejects malformed tenant claim", async () => {
  const { privateKey, provider } = await createTestSetup();
  const token = await signToken(privateKey, {
    payload: { tenant_id: 42 },
  });

  await assert.rejects(
    provider.verifyAccessToken(token),
    InvalidCredentialsError,
  );
});
