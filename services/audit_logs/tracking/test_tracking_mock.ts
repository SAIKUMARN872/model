import assert from "node:assert/strict";

import {
  ActivityTracker,
  UserTracker,
} from "./index.js";

console.log("");
console.log("========================================");
console.log(" AUDIT LOGS - TRACKING MOCK TEST");
console.log("========================================");
console.log("");

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`✓ PASS: ${name}`);
    passed++;
  } catch (error) {
    console.log(`✗ FAIL: ${name}`);

    if (error instanceof Error) {
      console.log(`  ${error.message}`);
    } else {
      console.log(`  ${String(error)}`);
    }

    failed++;
  }
}

// ActivityTracker tests

test("ActivityTracker - create activity", () => {
  const tracker = new ActivityTracker();

  const activity = tracker.track({
    userId: "user-001",
    action: "login",
    description: "User logged in",
  });

  assert.equal(activity.userId, "user-001");
  assert.equal(activity.action, "login");
  assert.equal(activity.success, true);
});

test("ActivityTracker - create failed activity", () => {
  const tracker = new ActivityTracker();

  const activity = tracker.track({
    userId: "user-002",
    action: "login",
    success: false,
  });

  assert.equal(activity.success, false);
});

test("ActivityTracker - get activity by ID", () => {
  const tracker = new ActivityTracker();

  const created = tracker.track({
    userId: "user-001",
    action: "read",
    resource: "document",
  });

  const result = tracker.getById(created.id);

  assert.ok(result);
  assert.equal(result.id, created.id);
  assert.equal(result.resource, "document");
});

test("ActivityTracker - user activity tracking", () => {
  const tracker = new ActivityTracker();

  tracker.track({
    userId: "user-001",
    action: "login",
  });

  tracker.track({
    userId: "user-001",
    action: "read",
  });

  tracker.track({
    userId: "user-002",
    action: "login",
  });

  const activities = tracker.getUserActivities("user-001");

  assert.equal(activities.length, 2);
});

test("ActivityTracker - filter by action", () => {
  const tracker = new ActivityTracker();

  tracker.track({
    userId: "user-001",
    action: "login",
  });

  tracker.track({
    userId: "user-001",
    action: "read",
  });

  tracker.track({
    userId: "user-001",
    action: "delete",
  });

  const results = tracker.find({
    action: "delete",
  });

  assert.equal(results.length, 1);
  assert.equal(results[0].action, "delete");
});

test("ActivityTracker - filter failed activities", () => {
  const tracker = new ActivityTracker();

  tracker.track({
    userId: "user-001",
    action: "read",
    success: true,
  });

  tracker.track({
    userId: "user-001",
    action: "delete",
    success: false,
  });

  const failedActivities = tracker.find({
    success: false,
  });

  assert.equal(failedActivities.length, 1);
  assert.equal(failedActivities[0].action, "delete");
});

test("ActivityTracker - count activities", () => {
  const tracker = new ActivityTracker();

  tracker.track({
    userId: "user-001",
    action: "login",
  });

  tracker.track({
    userId: "user-001",
    action: "read",
  });

  tracker.track({
    userId: "user-002",
    action: "login",
  });

  assert.equal(tracker.count(), 3);
});

test("ActivityTracker - delete activity", () => {
  const tracker = new ActivityTracker();

  const activity = tracker.track({
    userId: "user-001",
    action: "read",
  });

  assert.equal(tracker.delete(activity.id), true);
  assert.equal(tracker.getById(activity.id), undefined);
});

test("ActivityTracker - clear activities", () => {
  const tracker = new ActivityTracker();

  tracker.track({
    userId: "user-001",
    action: "login",
  });

  tracker.track({
    userId: "user-002",
    action: "login",
  });

  tracker.clear();

  assert.equal(tracker.count(), 0);
});

test("ActivityTracker - health check", () => {
  const tracker = new ActivityTracker();

  const health = tracker.health();

  assert.equal(health.healthy, true);
  assert.equal(health.activityCount, 0);
});

// UserTracker tests

test("UserTracker - create user summary", () => {
  const tracker = new UserTracker();

  const summary = tracker.track({
    userId: "user-001",
    action: "login",
  });

  assert.equal(summary.userId, "user-001");
  assert.equal(summary.totalActivities, 1);
  assert.equal(summary.successfulActivities, 1);
  assert.equal(summary.failedActivities, 0);
});

test("UserTracker - update user activity count", () => {
  const tracker = new UserTracker();

  tracker.track({
    userId: "user-001",
    action: "login",
  });

  const summary = tracker.track({
    userId: "user-001",
    action: "read",
  });

  assert.equal(summary.totalActivities, 2);
  assert.equal(summary.successfulActivities, 2);
});

test("UserTracker - track failed activity", () => {
  const tracker = new UserTracker();

  tracker.track({
    userId: "user-001",
    action: "login",
    success: false,
  });

  const summary = tracker.getUser("user-001");

  assert.ok(summary);
  assert.equal(summary.totalActivities, 1);
  assert.equal(summary.successfulActivities, 0);
  assert.equal(summary.failedActivities, 1);
});

test("UserTracker - mixed success and failure", () => {
  const tracker = new UserTracker();

  tracker.track({
    userId: "user-001",
    action: "login",
    success: true,
  });

  tracker.track({
    userId: "user-001",
    action: "read",
    success: true,
  });

  tracker.track({
    userId: "user-001",
    action: "delete",
    success: false,
  });

  const summary = tracker.getUser("user-001");

  assert.ok(summary);
  assert.equal(summary.totalActivities, 3);
  assert.equal(summary.successfulActivities, 2);
  assert.equal(summary.failedActivities, 1);
});

test("UserTracker - check user exists", () => {
  const tracker = new UserTracker();

  tracker.track({
    userId: "user-001",
    action: "login",
  });

  assert.equal(tracker.exists("user-001"), true);
  assert.equal(tracker.exists("user-999"), false);
});

test("UserTracker - get all users", () => {
  const tracker = new UserTracker();

  tracker.track({
    userId: "user-001",
    action: "login",
  });

  tracker.track({
    userId: "user-002",
    action: "login",
  });

  tracker.track({
    userId: "user-003",
    action: "login",
  });

  const users = tracker.getAllUsers();

  assert.equal(users.length, 3);
});

test("UserTracker - delete user", () => {
  const tracker = new UserTracker();

  tracker.track({
    userId: "user-001",
    action: "login",
  });

  assert.equal(tracker.deleteUser("user-001"), true);
  assert.equal(tracker.exists("user-001"), false);
});

test("UserTracker - clear users", () => {
  const tracker = new UserTracker();

  tracker.track({
    userId: "user-001",
    action: "login",
  });

  tracker.track({
    userId: "user-002",
    action: "login",
  });

  tracker.clear();

  assert.equal(tracker.count(), 0);
});

test("UserTracker - health check", () => {
  const tracker = new UserTracker();

  const health = tracker.health();

  assert.equal(health.healthy, true);
  assert.equal(health.trackedUsers, 0);
});

console.log("");
console.log("========================================");
console.log(" MOCK TEST RESULT");
console.log("========================================");
console.log(`Total Tests : ${passed + failed}`);
console.log(`Passed      : ${passed}`);
console.log(`Failed      : ${failed}`);
console.log("========================================");
console.log("");

if (failed > 0) {
  process.exitCode = 1;
} else {
  console.log("ALL MOCK TESTS PASSED ✓");
}
