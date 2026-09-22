// services/analytics/latency/test_latency.ts

import {
  LatencyAnalyzer,
  LatencyTracker,
  calculateLatencyStatistics,
} from "./index.js";

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
          (expected instanceof RegExp &&
            !expected.test(message))
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
  fn: () => Promise<void> | void,
): Promise<void> {
  try {
    await fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

await test("latency module", async () => {
  await test(
    "starts disconnected",
    () => {
      const tracker =
        new LatencyTracker();

      assert.equal(
        tracker.isConnected(),
        false,
      );

      assert.equal(
        tracker.size(),
        0,
      );
    },
  );

  await test(
    "connects successfully",
    () => {
      const tracker =
        new LatencyTracker();

      tracker.connect();

      assert.equal(
        tracker.isConnected(),
        true,
      );
    },
  );

  await test(
    "records latency",
    () => {
      const tracker =
        new LatencyTracker();

      tracker.connect();

      const record =
        tracker.record({
          organizationId: "org-1",
          requestId: "req-1",
          provider: "openai",
          model: "gpt-model",
          operation: "chat",
          latencyMs: 250,
        });

      assert.equal(
        record.organizationId,
        "org-1",
      );

      assert.equal(
        record.latencyMs,
        250,
      );

      assert.equal(
        record.provider,
        "openai",
      );

      assert.equal(
        record.model,
        "gpt-model",
      );

      assert.equal(
        tracker.size(),
        1,
      );
    },
  );

  await test(
    "gets record by ID",
    () => {
      const tracker =
        new LatencyTracker();

      tracker.connect();

      const created =
        tracker.record({
          organizationId: "org-1",
          latencyMs: 300,
        });

      const result =
        tracker.getById(created.id);

      assert.ok(result);

      const record =
        result!;

      assert.equal(
        record.id,
        created.id,
      );

      assert.equal(
        record.latencyMs,
        300,
      );
    },
  );

  await test(
    "isolates organizations",
    () => {
      const tracker =
        new LatencyTracker();

      tracker.connect();

      tracker.record({
        organizationId: "org-1",
        latencyMs: 100,
      });

      tracker.record({
        organizationId: "org-2",
        latencyMs: 200,
      });

      const org1 =
        tracker.find({
          organizationId: "org-1",
        });

      assert.equal(
        org1.length,
        1,
      );

      assert.equal(
        org1[0].latencyMs,
        100,
      );
    },
  );

  await test(
    "filters by provider",
    () => {
      const tracker =
        new LatencyTracker();

      tracker.connect();

      tracker.record({
        organizationId: "org-1",
        provider: "provider-a",
        latencyMs: 100,
      });

      tracker.record({
        organizationId: "org-1",
        provider: "provider-b",
        latencyMs: 200,
      });

      const result =
        tracker.find({
          provider: "provider-a",
        });

      assert.equal(
        result.length,
        1,
      );

      assert.equal(
        result[0].latencyMs,
        100,
      );
    },
  );

  await test(
    "filters by model",
    () => {
      const tracker =
        new LatencyTracker();

      tracker.connect();

      tracker.record({
        organizationId: "org-1",
        model: "model-a",
        latencyMs: 100,
      });

      tracker.record({
        organizationId: "org-1",
        model: "model-b",
        latencyMs: 300,
      });

      const result =
        tracker.find({
          model: "model-b",
        });

      assert.equal(
        result.length,
        1,
      );

      assert.equal(
        result[0].latencyMs,
        300,
      );
    },
  );

  await test(
    "calculates latency statistics",
    () => {
      const tracker =
        new LatencyTracker();

      tracker.connect();

      const values = [
        100,
        200,
        300,
        400,
        500,
      ];

      for (const latencyMs of values) {
        tracker.record({
          organizationId: "org-1",
          latencyMs,
        });
      }

      const analyzer =
        new LatencyAnalyzer(tracker);

      const stats =
        analyzer.getStatistics({
          organizationId: "org-1",
        });

      assert.equal(
        stats.count,
        5,
      );

      assert.equal(
        stats.minimum,
        100,
      );

      assert.equal(
        stats.maximum,
        500,
      );

      assert.equal(
        stats.average,
        300,
      );

      assert.equal(
        stats.p50,
        300,
      );

      assert.equal(
        stats.p90,
        460,
      );

      assert.equal(
        stats.p95,
        480,
      );

      assert.equal(
        stats.p99,
        496,
      );

      assert.equal(
        stats.total,
        1500,
      );
    },
  );

  await test(
    "detects slow requests",
    () => {
      const tracker =
        new LatencyTracker();

      tracker.connect();

      tracker.record({
        organizationId: "org-1",
        latencyMs: 200,
      });

      tracker.record({
        organizationId: "org-1",
        latencyMs: 1200,
      });

      tracker.record({
        organizationId: "org-1",
        latencyMs: 2500,
      });

      const analyzer =
        new LatencyAnalyzer(tracker, {
          slowThresholdMs: 1000,
        });

      const slow =
        analyzer.getSlowRequests({
          organizationId: "org-1",
        });

      assert.equal(
        slow.length,
        2,
      );

      assert.equal(
        slow[0].latencyMs,
        1200,
      );

      assert.equal(
        slow[1].latencyMs,
        2500,
      );
    },
  );

  await test(
    "supports request filtering",
    () => {
      const tracker =
        new LatencyTracker();

      tracker.connect();

      tracker.record({
        organizationId: "org-1",
        requestId: "request-a",
        latencyMs: 100,
      });

      tracker.record({
        organizationId: "org-1",
        requestId: "request-b",
        latencyMs: 500,
      });

      const result =
        tracker.find({
          requestId: "request-b",
        });

      assert.equal(
        result.length,
        1,
      );

      assert.equal(
        result[0].latencyMs,
        500,
      );
    },
  );

  await test(
    "filters by latency range",
    () => {
      const tracker =
        new LatencyTracker();

      tracker.connect();

      tracker.record({
        organizationId: "org-1",
        latencyMs: 100,
      });

      tracker.record({
        organizationId: "org-1",
        latencyMs: 500,
      });

      tracker.record({
        organizationId: "org-1",
        latencyMs: 1000,
      });

      const result =
        tracker.find({
          minLatencyMs: 400,
          maxLatencyMs: 800,
        });

      assert.equal(
        result.length,
        1,
      );

      assert.equal(
        result[0].latencyMs,
        500,
      );
    },
  );

  await test(
    "supports retention",
    () => {
      const tracker =
        new LatencyTracker({
          maxRecords: 2,
        });

      tracker.connect();

      tracker.record({
        organizationId: "org-1",
        latencyMs: 100,
      });

      tracker.record({
        organizationId: "org-1",
        latencyMs: 200,
      });

      tracker.record({
        organizationId: "org-1",
        latencyMs: 300,
      });

      assert.equal(
        tracker.size(),
        2,
      );

      const records =
        tracker.getAll();

      assert.equal(
        records[0].latencyMs,
        200,
      );

      assert.equal(
        records[1].latencyMs,
        300,
      );
    },
  );

  await test(
    "clears organization",
    () => {
      const tracker =
        new LatencyTracker();

      tracker.connect();

      tracker.record({
        organizationId: "org-1",
        latencyMs: 100,
      });

      tracker.record({
        organizationId: "org-2",
        latencyMs: 200,
      });

      const removed =
        tracker.clearOrganization("org-1");

      assert.equal(
        removed,
        1,
      );

      assert.equal(
        tracker.size(),
        1,
      );

      assert.equal(
        tracker.getAll()[0].organizationId,
        "org-2",
      );
    },
  );

  await test(
    "returns health status",
    () => {
      const tracker =
        new LatencyTracker();

      tracker.connect();

      tracker.record({
        organizationId: "org-1",
        latencyMs: 100,
      });

      const health =
        tracker.health();

      assert.equal(
        health.healthy,
        true,
      );

      assert.equal(
        health.connected,
        true,
      );

      assert.equal(
        health.recordCount,
        1,
      );
    },
  );

  await test(
    "rejects recording while disconnected",
    () => {
      const tracker =
        new LatencyTracker();

      assert.throws(
        () =>
          tracker.record({
            organizationId: "org-1",
            latencyMs: 100,
          }),
        /not connected/,
      );
    },
  );

  await test(
    "rejects negative latency",
    () => {
      const tracker =
        new LatencyTracker();

      tracker.connect();

      assert.throws(
        () =>
          tracker.record({
            organizationId: "org-1",
            latencyMs: -10,
          }),
        /non-negative finite number/,
      );
    },
  );

  await test(
    "rejects empty organization",
    () => {
      const tracker =
        new LatencyTracker();

      tracker.connect();

      assert.throws(
        () =>
          tracker.record({
            organizationId: "",
            latencyMs: 100,
          }),
        /Organization ID cannot be empty/,
      );
    },
  );

  await test(
    "calculates empty statistics",
    () => {
      const stats =
        calculateLatencyStatistics([]);

      assert.equal(
        stats.count,
        0,
      );

      assert.equal(
        stats.average,
        0,
      );

      assert.equal(
        stats.p50,
        0,
      );

      assert.equal(
        stats.p99,
        0,
      );
    },
  );

  await test(
    "clears all records",
    () => {
      const tracker =
        new LatencyTracker();

      tracker.connect();

      tracker.record({
        organizationId: "org-1",
        latencyMs: 100,
      });

      tracker.record({
        organizationId: "org-2",
        latencyMs: 200,
      });

      tracker.clear();

      assert.equal(
        tracker.size(),
        0,
      );
    },
  );

  await test(
    "disconnects successfully",
    () => {
      const tracker =
        new LatencyTracker();

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
    "Latency test suite completed successfully.",
  );
});