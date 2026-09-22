// services/analytics/performance/test_performance.ts

import {
  PerformanceEvaluator,
  PerformanceMonitor,
  PerformanceMetricsStore,
  validateMetricType,
  validateMetricValue,
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
          (typeof expected === "string" && !message.includes(expected)) ||
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

const store = new PerformanceMetricsStore({
  maxRecords: 100,
  retentionMs: 60 * 60 * 1000,
});

await test("performance module", async () => {
  await test("starts disconnected", () => {
    assert.equal(store.isConnected(), false);
    assert.equal(store.size(), 0);
  });

  await test("rejects recording while disconnected", () => {
    assert.throws(
      () =>
        store.record({
          organizationId: "org-1",
          metricType: "latency",
          name: "latency",
          value: 100,
          unit: "ms",
        }),
      /not connected/,
    );
  });

  await test("connects successfully", () => {
    store.connect();
    assert.equal(store.isConnected(), true);
  });

  await test("records latency metric", () => {
    const metric = store.record({
      organizationId: "org-1",
      metricType: "latency",
      name: "request_latency",
      value: 250,
      unit: "ms",
      provider: "openai",
      model: "gpt-4o",
      operation: "chat",
      requestId: "req-1",
    });

    assert.ok(metric.id);
    assert.equal(metric.organizationId, "org-1");
    assert.equal(metric.metricType, "latency");
    assert.equal(metric.value, 250);
    assert.equal(metric.unit, "ms");
  });

  await test("records different metric types", () => {
    store.record({
      organizationId: "org-1",
      metricType: "throughput",
      name: "throughput",
      value: 20,
      unit: "req/s",
    });

    store.record({
      organizationId: "org-1",
      metricType: "error_rate",
      name: "error_rate",
      value: 0.02,
      unit: "ratio",
    });

    store.record({
      organizationId: "org-1",
      metricType: "quality",
      name: "quality",
      value: 0.95,
      unit: "score",
    });

    store.record({
      organizationId: "org-1",
      metricType: "cost",
      name: "cost",
      value: 0.25,
      unit: "USD",
    });

    assert.ok(store.size() >= 5);
  });

  await test("isolates organizations", () => {
    store.record({
      organizationId: "org-2",
      metricType: "latency",
      name: "latency",
      value: 500,
      unit: "ms",
    });

    const org1 = store.getOrganizationMetrics("org-1");
    const org2 = store.getOrganizationMetrics("org-2");

    assert.ok(org1.length > 0);
    assert.ok(org2.length > 0);
    assert.ok(org1.every((metric) => metric.organizationId === "org-1"));
    assert.ok(org2.every((metric) => metric.organizationId === "org-2"));
  });

  await test("filters by provider", () => {
    const records = store.find({
      organizationId: "org-1",
      provider: "openai",
    });

    assert.ok(records.length > 0);
    assert.ok(records.every((metric) => metric.provider === "openai"));
  });

  await test("filters by model", () => {
    const records = store.find({
      organizationId: "org-1",
      model: "gpt-4o",
    });

    assert.ok(records.length > 0);
  });

  await test("filters by value", () => {
    const records = store.find({
      organizationId: "org-1",
      minValue: 0.1,
      maxValue: 1,
    });

    assert.ok(records.length > 0);
    assert.ok(records.every((metric) => metric.value >= 0.1 && metric.value <= 1));
  });

  await test("returns statistics", () => {
    const stats = store.getStatistics({
      organizationId: "org-1",
      metricType: "latency",
      name: "request_latency",
    });

    assert.ok(stats.count >= 1);
    assert.ok(stats.average > 0);
    assert.ok(stats.p50 > 0);
    assert.ok(stats.p95 > 0);
    assert.ok(stats.p99 > 0);
  });

  await test("gets metric by ID", () => {
    const metric = store.record({
      organizationId: "org-get",
      metricType: "cost",
      name: "cost",
      value: 0.5,
      unit: "USD",
    });

    const result = store.getById(metric.id);

    assert.ok(result);
    const item = result!;
    assert.equal(item.id, metric.id);
  });

  await test("returns undefined for unknown ID", () => {
    assert.equal(store.getById("unknown-id"), undefined);
  });

  await test("evaluates organization performance", () => {
    const evaluator = new PerformanceEvaluator({
      latencyTargetMs: 500,
      errorRateTarget: 0.05,
      qualityTarget: 0.9,
      costTarget: 10,
      throughputTarget: 10,
    });

    const evaluation = evaluator.evaluateOrganization("org-1", store);

    assert.equal(evaluation.organizationId, "org-1");
    assert.ok(evaluation.score >= 0);
    assert.ok(evaluation.score <= 100);
    assert.ok(["excellent", "good", "fair", "poor"].includes(evaluation.grade));
  });

  await test("monitor starts and records", () => {
    const monitor = new PerformanceMonitor({
      slowLatencyMs: 1000,
      highErrorRate: 0.1,
      lowQuality: 0.7,
    });

    monitor.start();
    assert.equal(monitor.isRunning(), true);

    const metric = monitor.record({
      organizationId: "org-monitor",
      metricType: "latency",
      name: "latency",
      value: 1500,
      unit: "ms",
    });

    assert.ok(metric.id);

    monitor.stop();
    assert.equal(monitor.isRunning(), false);
  });

  await test("detects slow requests", () => {
    const monitor = new PerformanceMonitor({
      slowLatencyMs: 500,
    });

    monitor.start();

    monitor.record({
      organizationId: "org-slow",
      metricType: "latency",
      name: "latency",
      value: 1000,
      unit: "ms",
    });

    monitor.record({
      organizationId: "org-slow",
      metricType: "latency",
      name: "latency",
      value: 200,
      unit: "ms",
    });

    const slow = monitor.getSlowRequests("org-slow");

    assert.equal(slow.length, 1);
    assert.equal(slow[0].value, 1000);

    monitor.stop();
  });

  await test("detects high error rate", () => {
    const monitor = new PerformanceMonitor({
      highErrorRate: 0.1,
    });

    monitor.start();

    monitor.record({
      organizationId: "org-error",
      metricType: "error_rate",
      name: "error_rate",
      value: 0.25,
      unit: "ratio",
    });

    const alerts = monitor.getAlerts("org-error");

    assert.equal(alerts.highErrorRate, true);

    monitor.stop();
  });

  await test("detects low quality", () => {
    const monitor = new PerformanceMonitor({
      lowQuality: 0.7,
    });

    monitor.start();

    monitor.record({
      organizationId: "org-quality",
      metricType: "quality",
      name: "quality",
      value: 0.5,
      unit: "score",
    });

    const alerts = monitor.getAlerts("org-quality");

    assert.equal(alerts.lowQuality, true);

    monitor.stop();
  });

  await test("returns monitor health", () => {
    const monitor = new PerformanceMonitor();

    monitor.start();

    const health = monitor.getHealth();

    assert.equal(health.healthy, true);
    assert.equal(health.metrics.connected, true);

    monitor.stop();
  });

  await test("clears organization", () => {
    const monitor = new PerformanceMonitor();

    monitor.start();

    monitor.record({
      organizationId: "org-clear",
      metricType: "request",
      name: "requests",
      value: 10,
      unit: "count",
    });

    const deleted = monitor.clearOrganization("org-clear");

    assert.equal(deleted, 1);
    assert.equal(monitor.metrics.getOrganizationMetrics("org-clear").length, 0);

    monitor.stop();
  });

  await test("rejects invalid metric values", () => {
    assert.throws(() => validateMetricValue(Number.NaN), /finite number/);
    assert.throws(
      () => validateMetricValue(Number.POSITIVE_INFINITY),
      /finite number/,
    );
  });

  await test("rejects invalid metric types", () => {
    assert.throws(
      () => validateMetricType("invalid" as never),
      /Invalid performance metric type/,
    );
  });

  await test("enforces record retention", () => {
    const limited = new PerformanceMetricsStore({
      maxRecords: 2,
      retentionMs: 60 * 60 * 1000,
    });

    limited.connect();

    limited.record({
      organizationId: "org-retention",
      metricType: "request",
      name: "first",
      value: 1,
      unit: "count",
      timestamp: Date.now() - 3000,
    });

    limited.record({
      organizationId: "org-retention",
      metricType: "request",
      name: "second",
      value: 2,
      unit: "count",
      timestamp: Date.now() - 2000,
    });

    limited.record({
      organizationId: "org-retention",
      metricType: "request",
      name: "third",
      value: 3,
      unit: "count",
      timestamp: Date.now() - 1000,
    });

    assert.equal(limited.size(), 2);

    const records = limited.getAll();
    assert.equal(records[0].name, "second");
    assert.equal(records[1].name, "third");
  });

  await test("clears all records", () => {
    const count = store.size();
    const deleted = store.clear();

    assert.equal(deleted, count);
    assert.equal(store.size(), 0);
  });

  await test("disconnects successfully", () => {
    store.disconnect();
    assert.equal(store.isConnected(), false);
  });

  console.log("Performance module test suite completed successfully.");
});