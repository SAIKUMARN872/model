import assert from "node:assert/strict";

import {
  DatabaseConnection,
  AuthRepository,
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
console.log("        AUTH DATABASE TEST");
console.log("========================================");
console.log("");

test("Database starts disconnected", () => {
  const connection = new DatabaseConnection(
    "test-db",
    1,
  );

  assert.equal(
    connection.isConnected(),
    false,
  );
});

test("Database connects", () => {
  const connection = new DatabaseConnection(
    "test-db",
    1,
  );

  connection.connect();

  assert.equal(
    connection.isConnected(),
    true,
  );
});

test("Database disconnects", () => {
  const connection = new DatabaseConnection(
    "test-db",
    1,
  );

  connection.connect();
  connection.disconnect();

  assert.equal(
    connection.isConnected(),
    false,
  );
});

test("Database configuration", () => {
  const connection = new DatabaseConnection(
    "auth-db",
    2,
  );

  const config = connection.getConfig();

  assert.equal(config.name, "auth-db");
  assert.equal(config.version, 2);
  assert.equal(config.connected, false);
});

test("Database health", () => {
  const connection = new DatabaseConnection(
    "health-db",
    1,
  );

  connection.connect();

  const health = connection.health();

  assert.equal(health.healthy, true);
  assert.equal(health.connected, true);
});

test("Create authentication record", () => {
  const repository = new AuthRepository();

  const record = repository.create({
    userId: "user-001",
    email: "user@example.com",
    username: "user001",
    role: "user",
  });

  assert.ok(record.id);
  assert.equal(record.userId, "user-001");
  assert.equal(
    record.email,
    "user@example.com",
  );
  assert.equal(record.role, "user");
  assert.equal(record.status, "active");
});

test("Get record by ID", () => {
  const repository = new AuthRepository();

  const record = repository.create({
    userId: "user-002",
  });

  const result = repository.getById(record.id);

  assert.ok(result);
  assert.equal(result.id, record.id);
});

test("Get records by user ID", () => {
  const repository = new AuthRepository();

  repository.create({
    userId: "user-003",
  });

  repository.create({
    userId: "user-003",
  });

  repository.create({
    userId: "user-004",
  });

  const records =
    repository.getByUserId("user-003");

  assert.equal(records.length, 2);
});

test("Get records by email", () => {
  const repository = new AuthRepository();

  repository.create({
    userId: "user-005",
    email: "same@example.com",
  });

  repository.create({
    userId: "user-006",
    email: "same@example.com",
  });

  const records =
    repository.getByEmail("same@example.com");

  assert.equal(records.length, 2);
});

test("Update authentication record", () => {
  const repository = new AuthRepository();

  const record = repository.create({
    userId: "user-007",
    role: "user",
  });

  const updated = repository.update(
    record.id,
    {
      role: "admin",
      status: "active",
    },
  );

  assert.ok(updated);
  assert.equal(updated.role, "admin");
  assert.equal(updated.status, "active");
});

test("Delete authentication record", () => {
  const repository = new AuthRepository();

  const record = repository.create({
    userId: "user-008",
  });

  const deleted =
    repository.delete(record.id);

  assert.equal(deleted, true);
  assert.equal(
    repository.getById(record.id),
    undefined,
  );
});

test("Check record exists", () => {
  const repository = new AuthRepository();

  const record = repository.create({
    userId: "user-009",
  });

  assert.equal(
    repository.exists(record.id),
    true,
  );

  assert.equal(
    repository.exists("missing-id"),
    false,
  );
});

test("Count records", () => {
  const repository = new AuthRepository();

  repository.create({
    userId: "user-010",
  });

  repository.create({
    userId: "user-011",
  });

  assert.equal(repository.count(), 2);
});

test("Clear records", () => {
  const repository = new AuthRepository();

  repository.create({
    userId: "user-012",
  });

  repository.create({
    userId: "user-013",
  });

  repository.clear();

  assert.equal(repository.count(), 0);
});

test("Repository health", () => {
  const connection = new DatabaseConnection(
    "repository-db",
    1,
  );

  const repository =
    new AuthRepository(connection);

  const record = repository.create({
    userId: "user-014",
  });

  assert.ok(record);

  const health = repository.health();

  assert.equal(health.healthy, true);
  assert.equal(health.connected, true);
  assert.equal(health.recordCount, 1);
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
  console.log("AUTH DATABASE TEST FAILED");
} else {
  console.log("ALL AUTH DATABASE TESTS PASSED ?");
}

console.log("");
