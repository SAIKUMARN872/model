import assert from "node:assert/strict";

import {
  AuditEventManager,
  AuditLogger,
} from "./index.js";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
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
console.log("          AUTH AUDIT TEST");
console.log("========================================");
console.log("");

test("Create audit event", () => {
  const manager = new AuditEventManager();

  const event = manager.create({
    userId: "user-001",
    action: "login",
    severity: "info",
    message: "User logged in",
  });

  assert.ok(event.id);
  assert.equal(event.userId, "user-001");
  assert.equal(event.action, "login");
  assert.equal(event.severity, "info");
  assert.equal(event.success, true);
});

test("Get event by ID", () => {
  const manager = new AuditEventManager();

  const event = manager.create({
    action: "read",
  });

  const result = manager.getById(event.id);

  assert.ok(result);
  assert.equal(result.id, event.id);
});

test("Get events by user", () => {
  const manager = new AuditEventManager();

  manager.create({
    userId: "user-001",
    action: "login",
  });

  manager.create({
    userId: "user-001",
    action: "read",
  });

  manager.create({
    userId: "user-002",
    action: "login",
  });

  const events = manager.getByUser("user-001");

  assert.equal(events.length, 2);
});

test("Get events by action", () => {
  const manager = new AuditEventManager();

  manager.create({
    action: "login",
  });

  manager.create({
    action: "read",
  });

  manager.create({
    action: "login",
  });

  const events = manager.getByAction("login");

  assert.equal(events.length, 2);
});

test("Get failed events", () => {
  const manager = new AuditEventManager();

  manager.create({
    action: "login",
    success: true,
  });

  manager.create({
    action: "authentication_failed",
    success: false,
  });

  const events = manager.getFailedEvents();

  assert.equal(events.length, 1);
  assert.equal(events[0].action, "authentication_failed");
});

test("Delete audit event", () => {
  const manager = new AuditEventManager();

  const event = manager.create({
    action: "delete",
  });

  assert.equal(manager.delete(event.id), true);
  assert.equal(manager.getById(event.id), undefined);
});

test("Clear audit events", () => {
  const manager = new AuditEventManager();

  manager.create({
    action: "login",
  });

  manager.create({
    action: "logout",
  });

  assert.equal(manager.count(), 2);

  manager.clear();

  assert.equal(manager.count(), 0);
});

test("Logger creates event", () => {
  const manager = new AuditEventManager();
  const logger = new AuditLogger(manager);

  const event = logger.log({
    userId: "user-001",
    action: "create",
    resource: "document",
  });

  assert.ok(event);
  assert.equal(event.userId, "user-001");
  assert.equal(event.action, "create");
});

test("Logger error creates failed event", () => {
  const manager = new AuditEventManager();
  const logger = new AuditLogger(manager);

  const event = logger.error(
    "authentication_failed",
    "Authentication failed",
  );

  assert.ok(event);
  assert.equal(event.success, false);
  assert.equal(event.severity, "error");
});

test("Logger can be disabled", () => {
  const manager = new AuditEventManager();

  const logger = new AuditLogger(manager, {
    enabled: false,
  });

  const event = logger.log({
    action: "login",
  });

  assert.equal(event, undefined);
  assert.equal(manager.count(), 0);
});

test("Audit health check", () => {
  const manager = new AuditEventManager();
  const logger = new AuditLogger(manager);

  const health = logger.health();

  assert.equal(health.healthy, true);
  assert.equal(health.enabled, true);
  assert.equal(health.eventCount, 0);
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
  console.log("AUTH AUDIT TEST FAILED");
} else {
  console.log("ALL AUTH AUDIT TESTS PASSED ?");
}

console.log("");
