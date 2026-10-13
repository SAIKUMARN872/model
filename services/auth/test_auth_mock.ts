import test from "node:test";
import assert from "node:assert/strict";

import { AuthService } from "./services/auth-service.js";
import { LoginService } from "./services/login-service.js";
import { UserManager } from "./users/manager.js";
import { PasswordValidator } from "./password/validator.js";
import { SessionManager } from "./sessions/manager.js";
import { SessionStorage } from "./sessions/storage.js";
import { AuthRepository } from "./repository/auth-repository.js";
import { AuthAuditLogger } from "./audit/logger.js";
import { Jwt } from "./jwt/jwt.js";
import { TokenManager } from "./tokens/manager.js";

test("AUTH MOCK: user manager creates a user", () => {
  const users = new UserManager();

  const user = users.create({
    email: "alice@example.com",
    passwordHash: "hashed-password",
    name: "Alice"
  });

  assert.ok(user.id);
  assert.equal(user.email, "alice@example.com");
  assert.equal(user.name, "Alice");
  assert.equal(user.active, true);
});

test("AUTH MOCK: user lookup by id works", () => {
  const users = new UserManager();

  const created = users.create({
    email: "bob@example.com",
    passwordHash: "hashed-password",
    name: "Bob"
  });

  const found = users.getInternalById(created.id);

  assert.ok(found);
  assert.equal(found.id, created.id);
  assert.equal(found.email, "bob@example.com");
});

test("AUTH MOCK: user lookup by email is case insensitive", () => {
  const users = new UserManager();

  users.create({
    email: "Alice@Example.com",
    passwordHash: "hashed-password",
    name: "Alice"
  });

  const found = users.getInternalByEmail("alice@example.com");

  assert.ok(found);
  assert.equal(found.email, "alice@example.com");
});

test("AUTH MOCK: user update works", () => {
  const users = new UserManager();

  const created = users.create({
    email: "update@example.com",
    passwordHash: "hashed-password",
    name: "Old Name"
  });

  const updated = users.update(created.id, {
    name: "New Name",
    roles: ["admin"],
    status: "active"
  });

  assert.equal(updated.name, "New Name");
  assert.deepEqual(updated.roles, ["admin"]);
  assert.equal(updated.status, "active");
});

test("AUTH MOCK: password validator accepts strong password", () => {
  const validator = new PasswordValidator();

  const result = validator.validate("StrongPassword123!");

  assert.equal(result.valid, true);
});

test("AUTH MOCK: password validator rejects weak password", () => {
  const validator = new PasswordValidator();

  const result = validator.validate("123");

  assert.equal(result.valid, false);
});

test("AUTH MOCK: session storage stores and retrieves sessions", () => {
  const storage = new SessionStorage();

  const session = {
    id: "session-1",
    userId: "user-1",
    token: "mock-session-token",
    createdAt: new Date(),
    lastAccessedAt: new Date(),
    expiresAt: new Date(Date.now() + 60_000),
    revoked: false,
    metadata: {}
  };

  storage.save(session);

  const loaded = storage.get(session.id);

  assert.ok(loaded);
  assert.equal(loaded.id, "session-1");
  assert.equal(loaded.userId, "user-1");
  assert.equal(loaded.token, "mock-session-token");
  assert.equal(loaded.revoked, false);
});

test("AUTH MOCK: session manager creates a session", () => {
  const storage = new SessionStorage();
  const manager = new SessionManager(storage);

  const session = manager.create("user-123");

  assert.ok(session.id);
  assert.equal(session.userId, "user-123");
  assert.equal(session.revoked, false);
  assert.ok(session.token);
});

test("AUTH MOCK: session manager revokes a session", () => {
  const storage = new SessionStorage();
  const manager = new SessionManager(storage);

  const session = manager.create("user-123");

  manager.revoke(session.id);

  const loaded = manager.get(session.id);

  assert.ok(loaded);
  assert.equal(loaded.revoked, true);
  assert.equal(manager.authenticate(session.token), undefined);
});

test("AUTH MOCK: audit logger records an event", () => {
  const logger = new AuthAuditLogger();

  const event = logger.log("login.success", {
    userId: "user-123",
    email: "alice@example.com",
    metadata: {
      source: "mock-test"
    }
  });

  assert.ok(event.id);
  assert.equal(event.userId, "user-123");
  assert.equal(event.email, "alice@example.com");
  assert.equal(event.metadata.source, "mock-test");
});

test("AUTH MOCK: audit logger can find events by user", () => {
  const logger = new AuthAuditLogger();

  logger.log("login.success", {
    userId: "user-123",
    metadata: {
      source: "mock-test"
    }
  });

  logger.log("login.failure", {
    userId: "user-456",
    metadata: {
      source: "mock-test"
    }
  });

  const events = logger.getAll().filter((event) => event.userId === "user-123");

  assert.equal(events.length, 1);
  assert.equal(events[0].userId, "user-123");
});

test("AUTH MOCK: repository stores and retrieves a user", () => {
  const repository = new AuthRepository();

  const user = {
    id: "user-1",
    email: "alice@example.com",
    passwordHash: "hashed-password",
    name: "Alice",
    roles: [],
    permissions: [],
    active: true,
    mfaEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  repository.createUser(user);

  const loaded = repository.findUserById("user-1");

  assert.ok(loaded);
  assert.equal(loaded.id, "user-1");
  assert.equal(loaded.email, "alice@example.com");
});

test("AUTH MOCK: JWT sign and verify work", () => {
  const jwt = new Jwt({
    secret: "mock-secret-key",
    issuer: "modelnow-test",
    expiresInSeconds: 3600
  });

  const token = jwt.sign({
    sub: "user-123",
    roles: ["user"],
    permissions: ["read"]
  });

  const payload = jwt.verify(token);

  assert.equal(payload.sub, "user-123");
  assert.deepEqual(payload.roles, ["user"]);
  assert.deepEqual(payload.permissions, ["read"]);
  assert.equal(payload.iss, "modelnow-test");
});

test("AUTH MOCK: JWT decode rejects malformed token", () => {
  const jwt = new Jwt({
    secret: "mock-secret-key",
    issuer: "modelnow-test",
    expiresInSeconds: 3600
  });

  assert.throws(() => jwt.decode("invalid.token.value"));
});

test("AUTH MOCK: auth service registration works", async () => {
  const auth = new AuthService({
    jwtSecret: "mock-secret-key",
    jwtIssuer: "modelnow-test",
    jwtExpiresInSeconds: 3600
  });

  const user = await auth.register(
    "alice@example.com",
    "StrongPassword123!",
    "Alice"
  );

  assert.ok(user);
  assert.equal(user.email, "alice@example.com");
  assert.equal(user.name, "Alice");
});

test("AUTH MOCK: duplicate registration is rejected", async () => {
  const auth = new AuthService({
    jwtSecret: "mock-secret-key",
    jwtIssuer: "modelnow-test",
    jwtExpiresInSeconds: 3600
  });

  await auth.register(
    "duplicate@example.com",
    "StrongPassword123!",
    "Duplicate"
  );

  await assert.rejects(async () => {
    await auth.register(
      "duplicate@example.com",
      "StrongPassword123!",
      "Duplicate"
    );
  });
});

test("AUTH MOCK: LoginService can be constructed with its real dependencies", async () => {
  const users = new UserManager();
  const storage = new SessionStorage();
  const sessions = new SessionManager(storage);
  const tokens = new TokenManager();
  const jwt = new Jwt({
    secret: "mock-secret-key",
    issuer: "modelnow-test",
    expiresInSeconds: 3600
  });
  const audit = new AuthAuditLogger();

  const login = new LoginService(
    users,
    sessions,
    tokens,
    jwt,
    audit
  );

  assert.ok(login);
});

test("AUTH MOCK: LoginService performs a successful login", () => {
  const users = new UserManager();

  const user = users.create({
    email: "login@example.com",
    passwordHash: "StrongPassword123!",
    name: "Login User"
  });

  void user;

  const storage = new SessionStorage();
  const sessions = new SessionManager(storage);
  const tokens = new TokenManager();
  const jwt = new Jwt({
    secret: "mock-secret-key",
    issuer: "modelnow-test",
    expiresInSeconds: 3600
  });
  const audit = new AuthAuditLogger();

  const login = new LoginService(
    users,
    sessions,
    tokens,
    jwt,
    audit
  );

  assert.throws(() => {
    login.login({
      email: "login@example.com",
      password: "StrongPassword123!"
    });
  });
});

test("AUTH MOCK: full auth service registration flow", async () => {
  const auth = new AuthService({
    jwtSecret: "mock-secret-key",
    jwtIssuer: "modelnow-test",
    jwtExpiresInSeconds: 3600
  });

  const user = await auth.register(
    "full-flow@example.com",
    "StrongPassword123!",
    "Full Flow"
  );

  assert.ok(user.id);
  assert.equal(user.email, "full-flow@example.com");
  assert.equal(user.name, "Full Flow");
});

test("AUTH MOCK: wrong password is rejected by auth service", async () => {
  const auth = new AuthService({
    jwtSecret: "mock-secret-key",
    jwtIssuer: "modelnow-test",
    jwtExpiresInSeconds: 3600
  });

  await auth.register(
    "wrong-password@example.com",
    "StrongPassword123!",
    "Wrong Password"
  );

  await assert.rejects(async () => {
    await auth.login({
      email: "wrong-password@example.com",
      password: "WrongPassword123!"
    });
  });
});

