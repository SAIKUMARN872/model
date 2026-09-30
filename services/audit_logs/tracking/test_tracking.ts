import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  ActivityTracker,
  UserTracker,
} from "./index.js";

describe("ActivityTracker", () => {
  it("tracks an activity", () => {
    const tracker = new ActivityTracker();

    const activity = tracker.track({
      userId: "user-1",
      action: "login",
      description: "User logged in",
    });

    assert.equal(activity.userId, "user-1");
    assert.equal(activity.action, "login");
    assert.equal(activity.success, true);
  });

  it("gets activity by id", () => {
    const tracker = new ActivityTracker();

    const activity = tracker.track({
      userId: "user-1",
      action: "read",
    });

    const result = tracker.getById(activity.id);

    assert.ok(result);
    assert.equal(result.id, activity.id);
  });

  it("gets activities for a user", () => {
    const tracker = new ActivityTracker();

    tracker.track({
      userId: "user-1",
      action: "login",
    });

    tracker.track({
      userId: "user-2",
      action: "login",
    });

    tracker.track({
      userId: "user-1",
      action: "read",
    });

    const activities = tracker.getUserActivities("user-1");

    assert.equal(activities.length, 2);
    assert.ok(
      activities.every(
        (activity) => activity.userId === "user-1",
      ),
    );
  });

  it("filters activities", () => {
    const tracker = new ActivityTracker();

    tracker.track({
      userId: "user-1",
      action: "login",
      success: true,
    });

    tracker.track({
      userId: "user-1",
      action: "delete",
      success: false,
    });

    const failed = tracker.find({
      success: false,
    });

    assert.equal(failed.length, 1);
    assert.equal(failed[0].action, "delete");
  });

  it("counts activities", () => {
    const tracker = new ActivityTracker();

    tracker.track({
      userId: "user-1",
      action: "read",
    });

    tracker.track({
      userId: "user-1",
      action: "update",
    });

    assert.equal(tracker.count(), 2);
  });

  it("deletes an activity", () => {
    const tracker = new ActivityTracker();

    const activity = tracker.track({
      userId: "user-1",
      action: "read",
    });

    assert.equal(tracker.delete(activity.id), true);
    assert.equal(tracker.getById(activity.id), undefined);
  });

  it("clears all activities", () => {
    const tracker = new ActivityTracker();

    tracker.track({
      userId: "user-1",
      action: "read",
    });

    tracker.clear();

    assert.equal(tracker.count(), 0);
  });

  it("returns healthy status", () => {
    const tracker = new ActivityTracker();

    const health = tracker.health();

    assert.equal(health.healthy, true);
    assert.equal(health.activityCount, 0);
  });
});

describe("UserTracker", () => {
  it("creates a user summary", () => {
    const tracker = new UserTracker();

    const summary = tracker.track({
      userId: "user-1",
      action: "login",
    });

    assert.equal(summary.userId, "user-1");
    assert.equal(summary.totalActivities, 1);
    assert.equal(summary.successfulActivities, 1);
    assert.equal(summary.failedActivities, 0);
  });

  it("updates an existing user summary", () => {
    const tracker = new UserTracker();

    tracker.track({
      userId: "user-1",
      action: "login",
    });

    const summary = tracker.track({
      userId: "user-1",
      action: "read",
    });

    assert.equal(summary.totalActivities, 2);
    assert.equal(summary.successfulActivities, 2);
    assert.equal(summary.failedActivities, 0);
  });

  it("tracks failed activities", () => {
    const tracker = new UserTracker();

    tracker.track({
      userId: "user-1",
      action: "login",
      success: false,
    });

    const summary = tracker.getUser("user-1");

    assert.ok(summary);
    assert.equal(summary.totalActivities, 1);
    assert.equal(summary.successfulActivities, 0);
    assert.equal(summary.failedActivities, 1);
  });

  it("checks whether a user exists", () => {
    const tracker = new UserTracker();

    tracker.track({
      userId: "user-1",
      action: "login",
    });

    assert.equal(tracker.exists("user-1"), true);
    assert.equal(tracker.exists("user-2"), false);
  });

  it("deletes a user", () => {
    const tracker = new UserTracker();

    tracker.track({
      userId: "user-1",
      action: "login",
    });

    assert.equal(tracker.deleteUser("user-1"), true);
    assert.equal(tracker.exists("user-1"), false);
  });

  it("returns all tracked users", () => {
    const tracker = new UserTracker();

    tracker.track({
      userId: "user-1",
      action: "login",
    });

    tracker.track({
      userId: "user-2",
      action: "login",
    });

    assert.equal(tracker.getAllUsers().length, 2);
  });

  it("clears all users", () => {
    const tracker = new UserTracker();

    tracker.track({
      userId: "user-1",
      action: "login",
    });

    tracker.clear();

    assert.equal(tracker.count(), 0);
  });

  it("returns healthy status", () => {
    const tracker = new UserTracker();

    const health = tracker.health();

    assert.equal(health.healthy, true);
    assert.equal(health.trackedUsers, 0);
  });
});