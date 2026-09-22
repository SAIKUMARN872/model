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
  UsageTracker,
} from "./tracker.js";

import {
  aggregateUsage,
  calculateUsageStatistics,
} from "./aggregator.js";

import {
  createUsageReport,
  exportUsageReportToJson,
  exportUsageReportToCsv,
  exportUsageReport,
} from "./reports.js";

await test("usage module", async (t) => {
  await t.test(
    "tracker starts disconnected",
    () => {
      const tracker =
        new UsageTracker();

      assert.equal(
        tracker.isConnected(),
        false,
      );

      assert.throws(
        () =>
          tracker.record({
            organizationId:
              "org-1",
            provider: "openai",
            model: "model-a",
          }),
        /not connected/,
      );
    },
  );

  await t.test(
    "tracker connects successfully",
    () => {
      const tracker =
        new UsageTracker();

      tracker.connect();

      assert.equal(
        tracker.isConnected(),
        true,
      );
    },
  );

  await t.test(
    "records usage successfully",
    () => {
      const tracker =
        new UsageTracker();

      tracker.connect();

      const record =
        tracker.record({
          organizationId:
            "org-1",
          userId: "user-1",
          requestId: "request-1",
          provider: "openai",
          model: "gpt-test",
          capability: "chat",
          status: "success",
          inputTokens: 100,
          outputTokens: 50,
          latencyMs: 250,
          cost: 0.01,
          quality: 0.9,
          metadata: {
            source: "test",
          },
        });

      assert.ok(record.id);

      assert.equal(
        record.organizationId,
        "org-1",
      );

      assert.equal(
        record.userId,
        "user-1",
      );

      assert.equal(
        record.provider,
        "openai",
      );

      assert.equal(
        record.model,
        "gpt-test",
      );

      assert.equal(
        record.totalTokens,
        150,
      );

      assert.equal(
        record.latencyMs,
        250,
      );

      assert.equal(
        record.cost,
        0.01,
      );

      assert.equal(
        record.quality,
        0.9,
      );
    },
  );

  await t.test(
    "gets usage by ID",
    () => {
      const tracker =
        new UsageTracker();

      tracker.connect();

      const record =
        tracker.record({
          organizationId:
            "org-1",
          provider: "openai",
          model: "model-a",
        });

      const found =
        tracker.getById(
          record.id,
        );

      if (!found) {
        throw new Error(
          "Expected usage record to be found",
        );
      }

      assert.equal(
        found.id,
        record.id,
      );

      assert.equal(
        tracker.getById(
          "unknown",
        ),
        undefined,
      );
    },
  );

  await t.test(
    "isolates organizations",
    () => {
      const tracker =
        new UsageTracker();

      tracker.connect();

      tracker.record({
        organizationId:
          "org-1",
        provider: "openai",
        model: "model-a",
      });

      tracker.record({
        organizationId:
          "org-2",
        provider: "anthropic",
        model: "model-b",
      });

      const org1 =
        tracker.getOrganizationUsage(
          "org-1",
        );

      const org2 =
        tracker.getOrganizationUsage(
          "org-2",
        );

      assert.equal(
        org1.length,
        1,
      );

      assert.equal(
        org2.length,
        1,
      );

      assert.equal(
        org1[0]
          .organizationId,
        "org-1",
      );
    },
  );

  await t.test(
    "gets user usage",
    () => {
      const tracker =
        new UsageTracker();

      tracker.connect();

      tracker.record({
        organizationId:
          "org-1",
        userId: "user-1",
        provider: "openai",
        model: "model-a",
      });

      tracker.record({
        organizationId:
          "org-1",
        userId: "user-2",
        provider: "openai",
        model: "model-a",
      });

      const usage =
        tracker.getUserUsage(
          "org-1",
          "user-1",
        );

      assert.equal(
        usage.length,
        1,
      );

      assert.equal(
        usage[0].userId,
        "user-1",
      );
    },
  );

  await t.test(
    "filters usage",
    () => {
      const tracker =
        new UsageTracker();

      tracker.connect();

      tracker.record({
        organizationId:
          "org-1",
        provider: "openai",
        model: "model-a",
        capability: "chat",
        status: "success",
      });

      tracker.record({
        organizationId:
          "org-1",
        provider: "anthropic",
        model: "model-b",
        capability: "embedding",
        status: "error",
      });

      assert.equal(
        tracker.find({
          provider: "openai",
        }).length,
        1,
      );

      assert.equal(
        tracker.find({
          model: "model-b",
        }).length,
        1,
      );

      assert.equal(
        tracker.find({
          status: "error",
        }).length,
        1,
      );

      assert.equal(
        tracker.find({
          capability: "chat",
        }).length,
        1,
      );
    },
  );

  await t.test(
    "calculates statistics",
    () => {
      const tracker =
        new UsageTracker();

      tracker.connect();

      tracker.record({
        organizationId:
          "org-1",
        provider: "openai",
        model: "model-a",
        status: "success",
        inputTokens: 100,
        outputTokens: 50,
        latencyMs: 100,
        cost: 0.01,
        quality: 0.9,
      });

      tracker.record({
        organizationId:
          "org-1",
        provider: "openai",
        model: "model-a",
        status: "success",
        inputTokens: 200,
        outputTokens: 100,
        latencyMs: 300,
        cost: 0.02,
        quality: 0.8,
      });

      tracker.record({
        organizationId:
          "org-1",
        provider: "openai",
        model: "model-a",
        status: "error",
        inputTokens: 50,
        outputTokens: 25,
        latencyMs: 200,
        cost: 0.005,
      });

      const stats =
        tracker.getStatistics({
          organizationId:
            "org-1",
        });

      assert.equal(
        stats.requestCount,
        3,
      );

      assert.equal(
        stats.successCount,
        2,
      );

      assert.equal(
        stats.errorCount,
        1,
      );

      assert.equal(
        stats.totalInputTokens,
        350,
      );

      assert.equal(
        stats.totalOutputTokens,
        175,
      );

      assert.equal(
        stats.totalTokens,
        525,
      );

      assert.equal(
        stats.totalCost,
        0.035,
      );

      assert.equal(
        stats.averageLatencyMs,
        200,
      );

      assert.equal(
        stats.averageQuality,
        0.85,
      );

      assert.equal(
        stats.successRate,
        2 / 3,
      );
    },
  );

  await t.test(
    "aggregates usage by model",
    () => {
      const tracker =
        new UsageTracker();

      tracker.connect();

      const records =
        [
          tracker.record({
            organizationId:
              "org-1",
            provider: "openai",
            model: "model-a",
            inputTokens: 100,
            outputTokens: 50,
          }),

          tracker.record({
            organizationId:
              "org-1",
            provider: "openai",
            model: "model-a",
            inputTokens: 200,
            outputTokens: 100,
          }),

          tracker.record({
            organizationId:
              "org-1",
            provider: "anthropic",
            model: "model-b",
            inputTokens: 50,
            outputTokens: 25,
          }),
        ];

      const aggregation =
        aggregateUsage(
          records,
          {
            groupBy: "model",
          },
        );

      assert.equal(
        aggregation.length,
        2,
      );

      const modelA =
        aggregation.find(
          (item) =>
            item.model ===
            "model-a",
        );

      if (!modelA) {
        throw new Error(
          "Expected aggregated model usage for model-a",
        );
      }

      assert.equal(
        modelA.requestCount,
        2,
      );

      assert.equal(
        modelA.totalTokens,
        450,
      );
    },
  );

  await t.test(
    "aggregates by organization",
    () => {
      const tracker =
        new UsageTracker();

      tracker.connect();

      const records =
        [
          tracker.record({
            organizationId:
              "org-1",
            provider: "openai",
            model: "model-a",
          }),

          tracker.record({
            organizationId:
              "org-1",
            provider: "openai",
            model: "model-b",
          }),

          tracker.record({
            organizationId:
              "org-2",
            provider: "openai",
            model: "model-a",
          }),
        ];

      const aggregation =
        aggregateUsage(
          records,
          {
            groupBy:
              "organization",
          },
        );

      assert.equal(
        aggregation.length,
        2,
      );

      const org1 =
        aggregation.find(
          (item) =>
            item.organizationId ===
            "org-1",
        );

      if (!org1) {
        throw new Error(
          "Expected aggregated usage for org-1",
        );
      }

      assert.equal(
        org1.requestCount,
        2,
      );
    },
  );

  await t.test(
    "calculates statistics from records",
    () => {
      const tracker =
        new UsageTracker();

      tracker.connect();

      const records =
        [
          tracker.record({
            organizationId:
              "org-1",
            provider: "openai",
            model: "model-a",
            latencyMs: 100,
          }),

          tracker.record({
            organizationId:
              "org-1",
            provider: "openai",
            model: "model-a",
            latencyMs: 300,
          }),
        ];

      const stats =
        calculateUsageStatistics(
          records,
        );

      assert.equal(
        stats.requestCount,
        2,
      );

      assert.equal(
        stats.averageLatencyMs,
        200,
      );
    },
  );

  await t.test(
    "creates usage report",
    () => {
      const tracker =
        new UsageTracker();

      tracker.connect();

      tracker.record({
        organizationId:
          "org-1",
        provider: "openai",
        model: "model-a",
        inputTokens: 100,
        outputTokens: 50,
        cost: 0.01,
      });

      const report =
        createUsageReport(
          tracker,
          {
            organizationId:
              "org-1",
          },
        );

      assert.ok(
        report.generatedAt,
      );

      assert.equal(
        report.statistics
          .requestCount,
        1,
      );

      assert.equal(
        report.aggregations
          .length,
        1,
      );
    },
  );

  await t.test(
    "exports report as JSON",
    () => {
      const tracker =
        new UsageTracker();

      tracker.connect();

      tracker.record({
        organizationId:
          "org-1",
        provider: "openai",
        model: "model-a",
      });

      const report =
        createUsageReport(
          tracker,
        );

      const json =
        exportUsageReportToJson(
          report,
        );

      const parsed =
        JSON.parse(json);

      assert.equal(
        parsed.statistics
          .requestCount,
        1,
      );
    },
  );

  await t.test(
    "exports report as CSV",
    () => {
      const tracker =
        new UsageTracker();

      tracker.connect();

      tracker.record({
        organizationId:
          "org-1",
        provider: "openai",
        model: "model-a",
      });

      const report =
        createUsageReport(
          tracker,
        );

      const csv =
        exportUsageReportToCsv(
          report,
        );

      assert.ok(
        csv.includes(
          "provider,model",
        ),
      );

      assert.ok(
        csv.includes(
          "openai,model-a",
        ),
      );
    },
  );

  await t.test(
    "exports using format selector",
    () => {
      const tracker =
        new UsageTracker();

      tracker.connect();

      tracker.record({
        organizationId:
          "org-1",
        provider: "openai",
        model: "model-a",
      });

      const report =
        createUsageReport(
          tracker,
        );

      const json =
        exportUsageReport(
          report,
          "json",
        );

      const csv =
        exportUsageReport(
          report,
          "csv",
        );

      assert.ok(
        json.startsWith("{"),
      );

      assert.ok(
        csv.includes(
          "provider,model",
        ),
      );
    },
  );

  await t.test(
    "supports retention",
    () => {
      const tracker =
        new UsageTracker({
          retentionMs: 100,
        });

      tracker.connect();

      tracker.record({
        organizationId:
          "org-1",
        provider: "openai",
        model: "old-model",
        timestamp:
          Date.now() - 1_000,
      });

      tracker.record({
        organizationId:
          "org-1",
        provider: "openai",
        model: "new-model",
        timestamp:
          Date.now(),
      });

      assert.equal(
        tracker.size(),
        1,
      );
    },
  );

  await t.test(
    "clears organization",
    () => {
      const tracker =
        new UsageTracker();

      tracker.connect();

      tracker.record({
        organizationId:
          "org-1",
        provider: "openai",
        model: "model-a",
      });

      tracker.record({
        organizationId:
          "org-2",
        provider: "openai",
        model: "model-b",
      });

      const deleted =
        tracker.clearOrganization(
          "org-1",
        );

      assert.equal(
        deleted,
        1,
      );

      assert.equal(
        tracker.size(),
        1,
      );
    },
  );

  await t.test(
    "health works",
    () => {
      const tracker =
        new UsageTracker();

      assert.equal(
        tracker.health()
          .healthy,
        false,
      );

      tracker.connect();

      tracker.record({
        organizationId:
          "org-1",
        provider: "openai",
        model: "model-a",
      });

      const health =
        tracker.health();

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
    },
  );

  await t.test(
    "validates usage input",
    () => {
      const tracker =
        new UsageTracker();

      tracker.connect();

      assert.throws(
        () =>
          tracker.record({
            organizationId:
              "",
            provider: "openai",
            model: "model-a",
          }),
        /organizationId is required/,
      );

      assert.throws(
        () =>
          tracker.record({
            organizationId:
              "org-1",
            provider: "",
            model: "model-a",
          }),
        /provider is required/,
      );

      assert.throws(
        () =>
          tracker.record({
            organizationId:
              "org-1",
            provider: "openai",
            model: "model-a",
            quality: 2,
          }),
        /quality must be between 0 and 1/,
      );
    },
  );

  await t.test(
    "clears all records",
    () => {
      const tracker =
        new UsageTracker();

      tracker.connect();

      tracker.record({
        organizationId:
          "org-1",
        provider: "openai",
        model: "model-a",
      });

      assert.equal(
        tracker.size(),
        1,
      );

      tracker.clear();

      assert.equal(
        tracker.size(),
        0,
      );
    },
  );

  await t.test(
    "disconnects successfully",
    () => {
      const tracker =
        new UsageTracker();

      tracker.connect();

      assert.equal(
        tracker.isConnected(),
        true,
      );

      tracker.disconnect();

      assert.equal(
        tracker.isConnected(),
        false,
      );
    },
  );

  console.log(
    "Usage test suite completed successfully.",
  );
});