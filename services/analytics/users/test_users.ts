const assert = {
  equal(actual: unknown, expected: unknown): void {
    if (actual !== expected) {
      throw new Error(
        `Expected ${String(expected)} but received ${String(actual)}`,
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

async function test(
  name: string,
  fn: (t: { test: (subName: string, subFn: () => Promise<void> | void) => Promise<void> }) => Promise<void> | void,
): Promise<void> {
  const context = {
    async test(
      subName: string,
      subFn: () => Promise<void> | void,
    ): Promise<void> {
      await test(subName, async () => {
        await subFn();
      });
    },
  };

  try {
    await fn(context);
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

import {
  UserActivityStore,
} from "./activity.js";

import {
  analyzeUserBehavior,
  analyzeOrganizationBehavior,
  getActiveUsers,
  getMostActiveUsers,
  calculateActivityTrend,
} from "./behavior.js";

await test("users module", async (t) => {
  await t.test(
    "activity store starts disconnected",
    () => {
      const store =
        new UserActivityStore();

      assert.equal(
        store.isConnected(),
        false,
      );

      assert.throws(
        () =>
          store.record({
            organizationId:
              "org-1",
            userId: "user-1",
            activityType:
              "login",
          }),
        /not connected/,
      );
    },
  );

  await t.test(
    "connects successfully",
    () => {
      const store =
        new UserActivityStore();

      store.connect();

      assert.equal(
        store.isConnected(),
        true,
      );
    },
  );

  await t.test(
    "records user activity",
    () => {
      const store =
        new UserActivityStore();

      store.connect();

      const activity =
        store.record({
          organizationId:
            "org-1",
          userId: "user-1",
          activityType:
            "chat",
          action:
            "send_message",
          resource:
            "chat",
          resourceId:
            "chat-1",
          success: true,
          durationMs: 250,
          metadata: {
            source: "web",
          },
        });

      assert.ok(activity.id);

      assert.equal(
        activity.organizationId,
        "org-1",
      );

      assert.equal(
        activity.userId,
        "user-1",
      );

      assert.equal(
        activity.activityType,
        "chat",
      );

      assert.equal(
        activity.success,
        true,
      );

      assert.equal(
        activity.durationMs,
        250,
      );
    },
  );

  await t.test(
    "gets activity by ID",
    () => {
      const store =
        new UserActivityStore();

      store.connect();

      const activity =
        store.record({
          organizationId:
            "org-1",
          userId: "user-1",
          activityType:
            "login",
        });

      const found =
        store.getById(
          activity.id,
        );

      if (!found) {
        throw new Error(
          "Expected activity to be found",
        );
      }

      assert.equal(
        found.id,
        activity.id,
      );

      assert.equal(
        store.getById(
          "unknown-id",
        ),
        undefined,
      );
    },
  );

  await t.test(
    "isolates organizations",
    () => {
      const store =
        new UserActivityStore();

      store.connect();

      store.record({
        organizationId:
          "org-1",
        userId: "user-1",
        activityType:
          "login",
      });

      store.record({
        organizationId:
          "org-2",
        userId: "user-2",
        activityType:
          "login",
      });

      const org1 =
        store.find({
          organizationId:
            "org-1",
        });

      assert.equal(
        org1.length,
        1,
      );

      assert.equal(
        org1[0].userId,
        "user-1",
      );
    },
  );

  await t.test(
    "gets user activity",
    () => {
      const store =
        new UserActivityStore();

      store.connect();

      store.record({
        organizationId:
          "org-1",
        userId: "user-1",
        activityType:
          "login",
      });

      store.record({
        organizationId:
          "org-1",
        userId: "user-1",
        activityType:
          "chat",
      });

      store.record({
        organizationId:
          "org-1",
        userId: "user-2",
        activityType:
          "login",
      });

      const userActivity =
        store.getUserActivity(
          "org-1",
          "user-1",
        );

      assert.equal(
        userActivity.length,
        2,
      );
    },
  );

  await t.test(
    "filters activity",
    () => {
      const store =
        new UserActivityStore();

      store.connect();

      store.record({
        organizationId:
          "org-1",
        userId: "user-1",
        activityType:
          "login",
        success: true,
      });

      store.record({
        organizationId:
          "org-1",
        userId: "user-1",
        activityType:
          "error",
        success: false,
      });

      assert.equal(
        store.find({
          activityType:
            "login",
        }).length,
        1,
      );

      assert.equal(
        store.find({
          success: false,
        }).length,
        1,
      );
    },
  );

  await t.test(
    "calculates activity statistics",
    () => {
      const store =
        new UserActivityStore();

      store.connect();

      store.record({
        organizationId:
          "org-1",
        userId: "user-1",
        activityType:
          "chat",
        success: true,
        durationMs: 100,
      });

      store.record({
        organizationId:
          "org-1",
        userId: "user-1",
        activityType:
          "chat",
        success: true,
        durationMs: 300,
      });

      store.record({
        organizationId:
          "org-1",
        userId: "user-1",
        activityType:
          "error",
        success: false,
        durationMs: 200,
      });

      const stats =
        store.getStatistics({
          organizationId:
            "org-1",
        });

      assert.equal(
        stats.activityCount,
        3,
      );

      assert.equal(
        stats.successfulActivities,
        2,
      );

      assert.equal(
        stats.failedActivities,
        1,
      );

      assert.equal(
        stats.successRate,
        2 / 3,
      );

      assert.equal(
        stats.averageDurationMs,
        200,
      );

      assert.equal(
        stats.activityTypes.chat,
        2,
      );

      assert.equal(
        stats.activityTypes.error,
        1,
      );
    },
  );

  await t.test(
    "analyzes user behavior",
    () => {
      const store =
        new UserActivityStore();

      store.connect();

      store.record({
        organizationId:
          "org-1",
        userId: "user-1",
        activityType:
          "chat",
        success: true,
      });

      store.record({
        organizationId:
          "org-1",
        userId: "user-1",
        activityType:
          "chat",
        success: true,
      });

      store.record({
        organizationId:
          "org-1",
        userId: "user-1",
        activityType:
          "login",
        success: true,
      });

      const behavior =
        analyzeUserBehavior(
          store,
          {
            organizationId:
              "org-1",
            userId: "user-1",
          },
        );

      assert.equal(
        behavior.totalActivities,
        3,
      );

      assert.equal(
        behavior.successRate,
        1,
      );

      assert.equal(
        behavior.topActivityType,
        "chat",
      );
    },
  );

  await t.test(
    "analyzes organization behavior",
    () => {
      const store =
        new UserActivityStore();

      store.connect();

      store.record({
        organizationId:
          "org-1",
        userId: "user-1",
        activityType:
          "chat",
      });

      store.record({
        organizationId:
          "org-1",
        userId: "user-2",
        activityType:
          "login",
      });

      store.record({
        organizationId:
          "org-2",
        userId: "user-3",
        activityType:
          "chat",
      });

      const results =
        analyzeOrganizationBehavior(
          store,
          "org-1",
        );

      assert.equal(
        results.length,
        2,
      );

      assert.ok(
        results.some(
          (item) =>
            item.userId ===
            "user-1",
        ),
      );

      assert.ok(
        results.some(
          (item) =>
            item.userId ===
            "user-2",
        ),
      );
    },
  );

  await t.test(
    "gets active users",
    () => {
      const store =
        new UserActivityStore();

      store.connect();

      store.record({
        organizationId:
          "org-1",
        userId: "user-1",
        activityType:
          "chat",
      });

      store.record({
        organizationId:
          "org-1",
        userId: "user-2",
        activityType:
          "login",
      });

      const users =
        getActiveUsers(
          store,
          {
            organizationId:
              "org-1",
          },
        );

      assert.equal(
        users.length,
        2,
      );

      assert.ok(
        users.includes(
          "user-1",
        ),
      );

      assert.ok(
        users.includes(
          "user-2",
        ),
      );
    },
  );

  await t.test(
    "gets most active users",
    () => {
      const store =
        new UserActivityStore();

      store.connect();

      for (let i = 0; i < 3; i++) {
        store.record({
          organizationId:
            "org-1",
          userId: "user-1",
          activityType:
            "chat",
        });
      }

      for (let i = 0; i < 2; i++) {
        store.record({
          organizationId:
            "org-1",
          userId: "user-2",
          activityType:
            "chat",
        });
      }

      store.record({
        organizationId:
          "org-1",
        userId: "user-3",
        activityType:
          "login",
      });

      const users =
        getMostActiveUsers(
          store,
          "org-1",
          2,
        );

      assert.equal(
        users.length,
        2,
      );

      assert.equal(
        users[0].userId,
        "user-1",
      );

      assert.equal(
        users[0].activityCount,
        3,
      );

      assert.equal(
        users[1].userId,
        "user-2",
      );
    },
  );

  await t.test(
    "calculates activity trend",
    () => {
      const store =
        new UserActivityStore();

      store.connect();

      const now = Date.now();

      const start =
        now - 1_000;

      const bucket =
        1_000;

      store.record({
        organizationId:
          "org-1",
        userId: "user-1",
        activityType:
          "chat",
        success: true,
        timestamp: start + 100,
      });

      store.record({
        organizationId:
          "org-1",
        userId: "user-1",
        activityType:
          "chat",
        success: false,
        timestamp: start + 1_500,
      });

      const trend =
        calculateActivityTrend(
          store,
          {
            organizationId:
              "org-1",
            userId: "user-1",
            startTime: start,
            endTime: start + 2_000,
            bucketMs: bucket,
          },
        );

      assert.equal(
        trend.length,
        2,
      );

      assert.equal(
        trend[0].activityCount,
        1,
      );

      assert.equal(
        trend[0].successCount,
        1,
      );

      assert.equal(
        trend[1].activityCount,
        1,
      );

      assert.equal(
        trend[1].failureCount,
        1,
      );
    },
  );

  await t.test(
    "supports retention",
    () => {
      const store =
        new UserActivityStore({
          retentionMs: 100,
        });

      store.connect();

      store.record({
        organizationId:
          "org-1",
        userId: "user-1",
        activityType:
          "login",
        timestamp:
          Date.now() - 1_000,
      });

      store.record({
        organizationId:
          "org-1",
        userId: "user-1",
        activityType:
          "chat",
        timestamp:
          Date.now(),
      });

      assert.equal(
        store.size(),
        1,
      );
    },
  );

  await t.test(
    "clears a user",
    () => {
      const store =
        new UserActivityStore();

      store.connect();

      store.record({
        organizationId:
          "org-1",
        userId: "user-1",
        activityType:
          "login",
      });

      store.record({
        organizationId:
          "org-1",
        userId: "user-2",
        activityType:
          "login",
      });

      const deleted =
        store.clearUser(
          "org-1",
          "user-1",
        );

      assert.equal(
        deleted,
        1,
      );

      assert.equal(
        store.size(),
        1,
      );
    },
  );

  await t.test(
    "clears organization",
    () => {
      const store =
        new UserActivityStore();

      store.connect();

      store.record({
        organizationId:
          "org-1",
        userId: "user-1",
        activityType:
          "login",
      });

      store.record({
        organizationId:
          "org-2",
        userId: "user-2",
        activityType:
          "login",
      });

      const deleted =
        store.clearOrganization(
          "org-1",
        );

      assert.equal(
        deleted,
        1,
      );

      assert.equal(
        store.size(),
        1,
      );
    },
  );

  await t.test(
    "health works",
    () => {
      const store =
        new UserActivityStore();

      assert.equal(
        store.health()
          .healthy,
        false,
      );

      store.connect();

      store.record({
        organizationId:
          "org-1",
        userId: "user-1",
        activityType:
          "login",
      });

      const health =
        store.health();

      assert.equal(
        health.connected,
        true,
      );

      assert.equal(
        health.healthy,
        true,
      );

      assert.equal(
        health.records,
        1,
      );

      assert.equal(
        health.organizations,
        1,
      );

      assert.equal(
        health.users,
        1,
      );
    },
  );

  await t.test(
    "validates input",
    () => {
      const store =
        new UserActivityStore();

      store.connect();

      assert.throws(
        () =>
          store.record({
            organizationId:
              "",
            userId: "user-1",
            activityType:
              "login",
          }),
        /organizationId is required/,
      );

      assert.throws(
        () =>
          store.record({
            organizationId:
              "org-1",
            userId: "",
            activityType:
              "login",
          }),
        /userId is required/,
      );

      assert.throws(
        () =>
          store.record({
            organizationId:
              "org-1",
            userId: "user-1",
            activityType:
              "login",
            durationMs: -1,
          }),
        /durationMs cannot be negative/,
      );
    },
  );

  await t.test(
    "clears all records",
    () => {
      const store =
        new UserActivityStore();

      store.connect();

      store.record({
        organizationId:
          "org-1",
        userId: "user-1",
        activityType:
          "login",
      });

      assert.equal(
        store.size(),
        1,
      );

      store.clear();

      assert.equal(
        store.size(),
        0,
      );
    },
  );

  await t.test(
    "disconnects successfully",
    () => {
      const store =
        new UserActivityStore();

      store.connect();

      assert.equal(
        store.isConnected(),
        true,
      );

      store.disconnect();

      assert.equal(
        store.isConnected(),
        false,
      );
    },
  );

  console.log(
    "Users test suite completed successfully.",
  );
});