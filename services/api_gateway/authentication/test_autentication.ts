const assert = {
  equal(actual: unknown, expected: unknown): void {
    if (actual !== expected) {
      throw new Error(
        `Expected ${String(expected)} but received ${String(actual)}`,
      );
    }
  },

  deepEqual(actual: unknown, expected: unknown): void {
    const a = JSON.stringify(actual);
    const b = JSON.stringify(expected);

    if (a !== b) {
      throw new Error(
        `Expected ${String(b)} but received ${String(a)}`,
      );
    }
  },

  ok(value: unknown): void {
    if (!value) {
      throw new Error("Assertion failed");
    }
  },

  throws(fn: () => void, expected?: RegExp | string): void {
    try {
      fn();
      throw new Error("Expected function to throw");
    } catch (error) {
      if (expected) {
        const message =
          error instanceof Error
            ? error.message
            : String(error);

        if (
          (typeof expected === "string" &&
            !message.includes(expected)) ||
          (expected instanceof RegExp && !expected.test(message))
        ) {
          throw new Error(
            `Expected thrown error to match ${String(expected)}, got ${message}`,
          );
        }
      }
    }
  },
};

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

import {
  JwtService,
  OAuthService,
  SessionStore,
} from "./index.js";

test("JWT authentication", () => {
  const jwt = new JwtService({
    secret: "modelnow-test-secret",
    issuer: "modelnow",
    audience: "api",
    expiresInSeconds: 3600,
  });

  const token = jwt.generateToken({
    sub: "user-1",
    organizationId: "org-1",
    roles: ["admin"],
    permissions: ["read", "write"],
    iss: "modelnow",
    aud: "api",
  });

  assert.ok(token.split(".").length === 3);

  const payload = jwt.verifyToken(token);

  assert.equal(payload.sub, "user-1");
  assert.equal(payload.organizationId, "org-1");
  assert.deepEqual(payload.roles, ["admin"]);
  assert.deepEqual(payload.permissions, [
    "read",
    "write",
  ]);

  const decoded = jwt.decodeToken(token);

  assert.equal(decoded.header.alg, "HS256");
  assert.equal(decoded.header.typ, "JWT");

  assert.equal(jwt.health().healthy, true);
});

test("JWT rejects invalid signature", () => {
  const jwt = new JwtService({
    secret: "correct-secret",
  });

  const token = jwt.generateToken({
    sub: "user-1",
    organizationId: "org-1",
    roles: [],
    permissions: [],
  });

  const parts = token.split(".");

  const tamperedToken =
    `${parts[0]}.${parts[1]}.invalid-signature`;

  assert.throws(
    () => jwt.verifyToken(tamperedToken),
    /Invalid JWT signature/,
  );
});

test("JWT rejects expired token", () => {
  const jwt = new JwtService({
    secret: "test-secret",
  });

  const token = jwt.generateToken({
    sub: "user-1",
    organizationId: "org-1",
    roles: [],
    permissions: [],
    iat: Math.floor(Date.now() / 1000) - 100,
    exp: Math.floor(Date.now() / 1000) - 10,
  });

  assert.throws(
    () => jwt.verifyToken(token),
    /expired/,
  );
});

test("OAuth authorization flow", () => {
  const oauth = new OAuthService("google", {
    clientId: "client-id",
    clientSecret: "client-secret",
    redirectUri:
      "https://modelnow.example.com/oauth/callback",
    authorizationEndpoint:
      "https://accounts.example.com/oauth/authorize",
    tokenEndpoint:
      "https://accounts.example.com/oauth/token",
  });

  const request =
    oauth.createAuthorizationRequest();

  assert.ok(request.state);
  assert.equal(request.provider, "google");
  assert.ok(
    request.authorizationUrl.includes(
      "client_id=client-id",
    ),
  );

  assert.equal(
    oauth.validateState(request.state),
    true,
  );

  const consumed =
    oauth.consumeState(request.state);

  assert.equal(consumed.state, request.state);

  assert.equal(
    oauth.validateState(request.state),
    false,
  );

  assert.equal(
    oauth.getPendingStateCount(),
    0,
  );
});

test("OAuth profile creation", () => {
  const oauth = new OAuthService("microsoft", {
    clientId: "client-id",
    clientSecret: "client-secret",
    redirectUri:
      "https://modelnow.example.com/oauth/callback",
    authorizationEndpoint:
      "https://login.example.com/authorize",
    tokenEndpoint:
      "https://login.example.com/token",
  });

  const profile = oauth.createProfile({
    providerUserId: "provider-user-1",
    email: "USER@EXAMPLE.COM",
    name: "Test User",
    organizationId: "org-1",
    roles: ["user"],
    permissions: ["read"],
  });

  assert.equal(
    profile.provider,
    "microsoft",
  );

  assert.equal(
    profile.email,
    "user@example.com",
  );

  assert.equal(
    profile.organizationId,
    "org-1",
  );

  assert.deepEqual(
    profile.roles,
    ["user"],
  );

  assert.equal(
    oauth.health().healthy,
    true,
  );
});

test("Session store lifecycle", () => {
  const store = new SessionStore({
    defaultTtlMs: 60_000,
    maxSessions: 100,
  });

  assert.equal(store.isConnected(), false);

  assert.throws(
    () => store.create({
      userId: "user-1",
      organizationId: "org-1",
    }),
    /not connected/,
  );

  store.connect();

  const session = store.create({
    userId: "user-1",
    organizationId: "org-1",
    roles: ["admin"],
    permissions: ["read", "write"],
    metadata: {
      source: "web",
    },
  });

  assert.ok(session.id);
  assert.equal(session.userId, "user-1");
  assert.equal(
    session.organizationId,
    "org-1",
  );

  const loaded = store.getById(session.id);

  assert.ok(loaded);
  assert.equal(loaded?.userId, "user-1");

  const sessions = store.find({
    organizationId: "org-1",
  });

  assert.equal(sessions.length, 1);

  const activeSessions = store.find({
    userId: "user-1",
    activeOnly: true,
  });

  assert.equal(activeSessions.length, 1);
});

test("Session refresh and revoke", () => {
  const store = new SessionStore();

  store.connect();

  const session = store.create({
    userId: "user-1",
    organizationId: "org-1",
  });

  const refreshed = store.refresh(
    session.id,
    60_000,
  );

  assert.ok(
    refreshed.expiresAt > refreshed.createdAt,
  );

  assert.equal(
    store.revoke(session.id),
    true,
  );

  assert.equal(
    store.getById(session.id),
    undefined,
  );
});

test("Session organization isolation", () => {
  const store = new SessionStore();

  store.connect();

  store.create({
    userId: "user-1",
    organizationId: "org-1",
  });

  store.create({
    userId: "user-2",
    organizationId: "org-2",
  });

  assert.equal(
    store.find({
      organizationId: "org-1",
    }).length,
    1,
  );

  assert.equal(
    store.find({
      organizationId: "org-2",
    }).length,
    1,
  );

  assert.equal(
    store.revokeOrganizationSessions("org-1"),
    1,
  );

  assert.equal(
    store.find({
      organizationId: "org-1",
    }).length,
    0,
  );

  assert.equal(
    store.find({
      organizationId: "org-2",
    }).length,
    1,
  );
});

test("Session user revocation", () => {
  const store = new SessionStore();

  store.connect();

  store.create({
    userId: "user-1",
    organizationId: "org-1",
  });

  store.create({
    userId: "user-1",
    organizationId: "org-1",
  });

  store.create({
    userId: "user-2",
    organizationId: "org-1",
  });

  assert.equal(
    store.revokeUserSessions("user-1"),
    2,
  );

  assert.equal(
    store.find({
      userId: "user-1",
    }).length,
    0,
  );

  assert.equal(
    store.find({
      userId: "user-2",
    }).length,
    1,
  );
});

test("Session health", () => {
  const store = new SessionStore();

  assert.equal(
    store.health().healthy,
    false,
  );

  store.connect();

  store.create({
    userId: "user-1",
    organizationId: "org-1",
  });

  store.create({
    userId: "user-2",
    organizationId: "org-2",
  });

  const health = store.health();

  assert.equal(health.healthy, true);
  assert.equal(health.connected, true);
  assert.equal(health.sessionCount, 2);
  assert.equal(health.organizationCount, 2);
  assert.equal(health.userCount, 2);
});

test("Session validation", () => {
  const store = new SessionStore();

  store.connect();

  assert.throws(
    () => store.create({
      userId: "",
      organizationId: "org-1",
    }),
    /userId cannot be empty/,
  );

  assert.throws(
    () => store.create({
      userId: "user-1",
      organizationId: "",
    }),
    /organizationId cannot be empty/,
  );
});

test("Session clear", () => {
  const store = new SessionStore();

  store.connect();

  store.create({
    userId: "user-1",
    organizationId: "org-1",
  });

  assert.equal(store.size(), 1);

  store.clear();

  assert.equal(store.size(), 0);

  store.disconnect();

  assert.equal(store.isConnected(), false);
});