// services/analytics/metrics/test_metrics.ts

import {
  MetricCollector,
  calculateMetricStatistics,
  getTopMetrics,
  processMetrics,
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

await test("metrics module", async () => {
  await test(
    "starts disconnected",
    () => {
      const collector =
        new MetricCollector();

      assert.equal(
        collector.isConnected(),
        false,
      );

      assert.equal(
        collector.size(),
        0,
      );
    },
  );

  await test(
    "connects successfully",
    () => {
      const collector =
        new MetricCollector();

      collector.connect();

      assert.equal(
        collector.isConnected(),
        true,
      );
    },
  );

  await test(
    "collects a metric",
    () => {
      const collector =
        new MetricCollector();

      collector.connect();

      const metric =
        collector.collect({
          organizationId: "org-1",
          name: "request_count",
          value: 10,
          type: "counter",
          provider: "openai",
          model: "gpt-model",
          operation: "chat",
          unit: "requests",
        });

      assert.equal(
        metric.organizationId,
        "org-1",
      );

      assert.equal(
        metric.name,
        "request_count",
      );

      assert.equal(
        metric.value,
        10,
      );

      assert.equal(
        metric.type,
        "counter",
      );

      assert.equal(
        metric.provider,
        "openai",
      );

      assert.equal(
        metric.model,
        "gpt-model",
      );

      assert.equal(
        collector.size(),
        1,
      );
    },
  );

  await test(
    "supports gauge metrics",
    () => {
      const collector =
        new MetricCollector();

      collector.connect();

      const metric =
        collector.collect({
          organizationId: "org-1",
          name: "cpu_usage",
          value: 72.5,
          type: "gauge",
        });

      assert.equal(
        metric.type,
        "gauge",
      );

      assert.equal(
        metric.value,
        72.5,
      );
    },
  );

  await test(
    "supports histogram metrics",
    () => {
      const collector =
        new MetricCollector();

      collector.connect();

      const metric =
        collector.collect({
          organizationId: "org-1",
          name: "latency",
          value: 350,
          type: "histogram",
        });

      assert.equal(
        metric.type,
        "histogram",
      );

      assert.equal(
        metric.value,
        350,
      );
    },
  );

  await test(
    "supports tags and metadata",
    () => {
      const collector =
        new MetricCollector();

      collector.connect();

      const metric =
        collector.collect({
          organizationId: "org-1",
          name: "requests",
          value: 100,
          tags: {
            environment: "production",
            region: "india",
          },
          metadata: {
            source: "api-gateway",
          },
        });

      assert.equal(
        metric.tags.environment,
        "production",
      );

      assert.equal(
        metric.tags.region,
        "india",
      );

      assert.equal(
        metric.metadata.source,
        "api-gateway",
      );
    },
  );

  await test(
    "gets metric by ID",
    () => {
      const collector =
        new MetricCollector();

      collector.connect();

      const created =
        collector.collect({
          organizationId: "org-1",
          name: "requests",
          value: 50,
        });

      const found =
        collector.getById(created.id);

      assert.ok(found);

      const metric = found!;

      assert.equal(
        metric.id,
        created.id,
      );

      assert.equal(
        metric.value,
        50,
      );
    },
  );

  await test(
    "isolates organizations",
    () => {
      const collector =
        new MetricCollector();

      collector.connect();

      collector.collect({
        organizationId: "org-1",
        name: "requests",
        value: 100,
      });

      collector.collect({
        organizationId: "org-2",
        name: "requests",
        value: 200,
      });

      const result =
        collector.find({
          organizationId: "org-1",
        });

      assert.equal(
        result.length,
        1,
      );

      assert.equal(
        result[0].value,
        100,
      );
    },
  );

  await test(
    "filters by metric name",
    () => {
      const collector =
        new MetricCollector();

      collector.connect();

      collector.collect({
        organizationId: "org-1",
        name: "request_count",
        value: 100,
      });

      collector.collect({
        organizationId: "org-1",
        name: "error_count",
        value: 5,
      });

      const result =
        collector.find({
          name: "error_count",
        });

      assert.equal(
        result.length,
        1,
      );

      assert.equal(
        result[0].value,
        5,
      );
    },
  );

  await test(
    "filters by provider and model",
    () => {
      const collector =
        new MetricCollector();

      collector.connect();

      collector.collect({
        organizationId: "org-1",
        name: "latency",
        value: 100,
        provider: "provider-a",
        model: "model-a",
      });

      collector.collect({
        organizationId: "org-1",
        name: "latency",
        value: 200,
        provider: "provider-b",
        model: "model-b",
      });

      const result =
        collector.find({
          provider: "provider-a",
          model: "model-a",
        });

      assert.equal(
        result.length,
        1,
      );

      assert.equal(
        result[0].value,
        100,
      );
    },
  );

  await test(
    "filters by tags",
    () => {
      const collector =
        new MetricCollector();

      collector.connect();

      collector.collect({
        organizationId: "org-1",
        name: "requests",
        value: 100,
        tags: {
          environment: "production",
        },
      });

      collector.collect({
        organizationId: "org-1",
        name: "requests",
        value: 50,
        tags: {
          environment: "development",
        },
      });

      const result =
        collector.find({
          tags: {
            environment: "production",
          },
        });

      assert.equal(
        result.length,
        1,
      );

      assert.equal(
        result[0].value,
        100,
      );
    },
  );

  await test(
    "calculates statistics",
    () => {
      const collector =
        new MetricCollector();

      collector.connect();

      const values = [
        10,
        20,
        30,
        40,
        50,
      ];

      for (const value of values) {
        collector.collect({
          organizationId: "org-1",
          name: "latency",
          value,
        });
      }

      const records =
        collector.find({
          organizationId: "org-1",
          name: "latency",
        });

      const stats =
        calculateMetricStatistics(records);

      assert.equal(
        stats.count,
        5,
      );

      assert.equal(
        stats.sum,
        150,
      );

      assert.equal(
        stats.average,
        30,
      );

      assert.equal(
        stats.minimum,
        10,
      );

      assert.equal(
        stats.maximum,
        50,
      );

      assert.equal(
        stats.p50,
        30,
      );

      assert.equal(
        stats.p90,
        46,
      );

      assert.equal(
        stats.p95,
        48,
      );

      assert.equal(
        stats.p99,
        49.6,
      );
    },
  );

  await test(
    "processes metrics by name",
    () => {
      const collector =
        new MetricCollector();

      collector.connect();

      collector.collect({
        organizationId: "org-1",
        name: "requests",
        value: 100,
      });

      collector.collect({
        organizationId: "org-1",
        name: "requests",
        value: 200,
      });

      collector.collect({
        organizationId: "org-1",
        name: "errors",
        value: 10,
      });

      const records =
        collector.getAll();

      const result =
        processMetrics(records);

      assert.equal(
        result.totalRecords,
        3,
      );

      assert.equal(
        result.byMetric.length,
        2,
      );

      const requests =
        result.byMetric.find(
          (item) => item.name === "requests",
        );

      assert.ok(requests);

      const requestMetrics = requests!;

      assert.equal(
        requestMetrics.statistics.count,
        2,
      );

      assert.equal(
        requestMetrics.statistics.sum,
        300,
      );

      assert.equal(
        requestMetrics.statistics.average,
        150,
      );
    },
  );

  await test(
    "gets top metrics",
    () => {
      const collector =
        new MetricCollector();

      collector.connect();

      collector.collect({
        organizationId: "org-1",
        name: "requests",
        value: 100,
      });

      collector.collect({
        organizationId: "org-1",
        name: "requests",
        value: 200,
      });

      collector.collect({
        organizationId: "org-1",
        name: "errors",
        value: 10,
      });

      const top =
        getTopMetrics(collector.getAll(), 1);

      assert.equal(
        top.length,
        1,
      );

      assert.equal(
        top[0].name,
        "requests",
      );

      assert.equal(
        top[0].count,
        2,
      );

      assert.equal(
        top[0].total,
        300,
      );

      assert.equal(
        top[0].average,
        150,
      );
    },
  );

  await test(
    "supports retention",
    () => {
      const collector =
        new MetricCollector({
          maxRecords: 2,
        });

      collector.connect();

      collector.collect({
        organizationId: "org-1",
        name: "metric",
        value: 10,
      });

      collector.collect({
        organizationId: "org-1",
        name: "metric",
        value: 20,
      });

      collector.collect({
        organizationId: "org-1",
        name: "metric",
        value: 30,
      });

      assert.equal(
        collector.size(),
        2,
      );

      const records =
        collector.getAll();

      assert.equal(
        records[0].value,
        20,
      );

      assert.equal(
        records[1].value,
        30,
      );
    },
  );

  await test(
    "clears organization",
    () => {
      const collector =
        new MetricCollector();

      collector.connect();

      collector.collect({
        organizationId: "org-1",
        name: "metric",
        value: 10,
      });

      collector.collect({
        organizationId: "org-2",
        name: "metric",
        value: 20,
      });

      const removed =
        collector.clearOrganization("org-1");

      assert.equal(
        removed,
        1,
      );

      assert.equal(
        collector.size(),
        1,
      );

      assert.equal(
        collector.getAll()[0].organizationId,
        "org-2",
      );
    },
  );

  await test(
    "returns health",
    () => {
      const collector =
        new MetricCollector();

      collector.connect();

      collector.collect({
        organizationId: "org-1",
        name: "metric",
        value: 10,
      });

      const health =
        collector.health();

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
    "rejects collection while disconnected",
    () => {
      const collector =
        new MetricCollector();

      assert.throws(
        () =>
          collector.collect({
            organizationId: "org-1",
            name: "metric",
            value: 10,
          }),
        /not connected/,
      );
    },
  );

  await test(
    "rejects empty organization",
    () => {
      const collector =
        new MetricCollector();

      collector.connect();

      assert.throws(
        () =>
          collector.collect({
            organizationId: "",
            name: "metric",
            value: 10,
          }),
        /Organization ID cannot be empty/,
      );
    },
  );

  await test(
    "rejects empty metric name",
    () => {
      const collector =
        new MetricCollector();

      collector.connect();

      assert.throws(
        () =>
          collector.collect({
            organizationId: "org-1",
            name: "",
            value: 10,
          }),
        /Metric name cannot be empty/,
      );
    },
  );

  await test(
    "rejects NaN values",
    () => {
      const collector =
        new MetricCollector();

      collector.connect();

      assert.throws(
        () =>
          collector.collect({
            organizationId: "org-1",
            name: "metric",
            value: Number.NaN,
          }),
        /finite number/,
      );
    },
  );

  await test(
    "handles empty statistics",
    () => {
      const stats =
        calculateMetricStatistics([]);

      assert.equal(
        stats.count,
        0,
      );

      assert.equal(
        stats.sum,
        0,
      );

      assert.equal(
        stats.average,
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
      const collector =
        new MetricCollector();

      collector.connect();

      collector.collect({
        organizationId: "org-1",
        name: "metric",
        value: 10,
      });

      collector.clear();

      assert.equal(
        collector.size(),
        0,
      );
    },
  );

  await test(
    "disconnects successfully",
    () => {
      const collector =
        new MetricCollector();

      collector.connect();

      assert.equal(
        collector.isConnected(),
        true,
      );

      collector.disconnect();

      assert.equal(
        collector.isConnected(),
        false,
      );
    },
  );

  console.log(
    "Metrics test suite completed successfully.",
  );
});