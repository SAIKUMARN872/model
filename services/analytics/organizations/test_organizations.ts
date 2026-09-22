// services/analytics/organizations/test_organizations.ts

import {
  OrganizationMetricsStore,
  validateMetricName,
  validateMetricType,
  validateMetricValue,
} from "./organization_metrics.js";

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

const store = new OrganizationMetricsStore({
  maxRecords: 100,
  retentionMs: 60 * 60 * 1000,
});

await test("organizations module", async () => {
  await test("starts disconnected", () => {
    assert.equal(store.isConnected(), false);
    assert.equal(store.size(), 0);
  });

  await test("rejects recording while disconnected", () => {
    assert.throws(
      () =>
        store.record({
          organizationId: "org-1",
          metricType: "request",
          name: "requests",
          value: 1,
        }),
      /not connected/,
    );
  });

  await test("connects successfully", () => {
    store.connect();
    assert.equal(store.isConnected(), true);
  });

  await test("records organization metric", () => {
    const record = store.record({
      organizationId: "org-1",
      metricType: "request",
      name: "requests",
      value: 10,
      provider: "openai",
      model: "gpt-4o",
      operation: "chat",
      requestId: "req-1",
      metadata: {
        environment: "test",
      },
    });

    assert.ok(record.id);
    assert.equal(record.organizationId, "org-1");
    assert.equal(record.metricType, "request");
    assert.equal(record.name, "requests");
    assert.equal(record.value, 10);
    assert.equal(record.provider, "openai");
    assert.equal(record.model, "gpt-4o");
  });

  await test("records multiple organizations", () => {
    store.record({
      organizationId: "org-1",
      metricType: "latency",
      name: "latency",
      value: 100,
    });

    store.record({
      organizationId: "org-2",
      metricType: "request",
      name: "requests",
      value: 20,
    });

    assert.equal(store.getOrganizationIds().length, 2);
  });

  await test("isolates organizations", () => {
    const org1 = store.getOrganizationMetrics("org-1");
    const org2 = store.getOrganizationMetrics("org-2");

    assert.ok(org1.length > 0);
    assert.ok(org2.length > 0);
    assert.ok(org1.every((record) => record.organizationId === "org-1"));
    assert.ok(org2.every((record) => record.organizationId === "org-2"));
  });

  await test("filters by metric type", () => {
    const latency = store.find({
      organizationId: "org-1",
      metricType: "latency",
    });

    assert.ok(latency.length > 0);
    assert.ok(latency.every((record) => record.metricType === "latency"));
  });

  await test("filters by provider and model", () => {
    const records = store.find({
      organizationId: "org-1",
      provider: "openai",
      model: "gpt-4o",
    });

    assert.ok(records.length > 0);
    assert.ok(
      records.every(
        (record) => record.provider === "openai" && record.model === "gpt-4o",
      ),
    );
  });

  await test("filters by value range", () => {
    store.record({
      organizationId: "org-1",
      metricType: "cost",
      name: "cost",
      value: 0.5,
    });

    store.record({
      organizationId: "org-1",
      metricType: "cost",
      name: "cost",
      value: 2.5,
    });

    const records = store.find({
      organizationId: "org-1",
      minValue: 1,
      maxValue: 3,
    });

    assert.ok(records.length > 0);
    assert.ok(records.every((record) => record.value >= 1 && record.value <= 3));
  });

  await test("returns statistics", () => {
    store.record({
      organizationId: "org-stats",
      metricType: "latency",
      name: "latency",
      value: 100,
    });

    store.record({
      organizationId: "org-stats",
      metricType: "latency",
      name: "latency",
      value: 200,
    });

    store.record({
      organizationId: "org-stats",
      metricType: "latency",
      name: "latency",
      value: 300,
    });

    const stats = store.getStatistics("org-stats", "latency", "latency");

    assert.equal(stats.organizationId, "org-stats");
    assert.equal(stats.count, 3);
    assert.equal(stats.sum, 600);
    assert.equal(stats.average, 200);
    assert.equal(stats.min, 100);
    assert.equal(stats.max, 300);
    assert.equal(stats.p50, 200);
    assert.equal(stats.p95, 290);
    assert.equal(stats.p99, 298);
  });

  await test("returns metric by ID", () => {
    const record = store.record({
      organizationId: "org-get",
      metricType: "quality",
      name: "quality",
      value: 0.95,
    });

    const result = store.getById(record.id);
    assert.ok(result);

    const item = result!;
    assert.equal(item.id, record.id);
    assert.equal(item.organizationId, "org-get");
  });

  await test("returns undefined for unknown ID", () => {
    assert.equal(store.getById("does-not-exist"), undefined);
  });

  await test("clears one organization", () => {
    store.record({
      organizationId: "org-clear",
      metricType: "request",
      name: "requests",
      value: 1,
    });

    store.record({
      organizationId: "org-clear",
      metricType: "cost",
      name: "cost",
      value: 2,
    });

    const deleted = store.clearOrganization("org-clear");

    assert.equal(deleted, 2);
    assert.equal(store.getOrganizationMetrics("org-clear").length, 0);
  });

  await test("retention removes old records", () => {
    const retentionStore = new OrganizationMetricsStore({
      maxRecords: 100,
      retentionMs: 1000,
    });

    retentionStore.connect();

    retentionStore.record({
      organizationId: "org-retention",
      metricType: "request",
      name: "old",
      value: 1,
      timestamp: Date.now() - 10_000,
    });

    retentionStore.record({
      organizationId: "org-retention",
      metricType: "request",
      name: "new",
      value: 2,
    });

    const records = retentionStore.getAll();

    assert.equal(records.length, 1);
    assert.equal(records[0].name, "new");
  });

  await test("enforces maximum records", () => {
    const limitedStore = new OrganizationMetricsStore({
      maxRecords: 2,
      retentionMs: 60 * 60 * 1000,
    });

    limitedStore.connect();

    limitedStore.record({
      organizationId: "org-limit",
      metricType: "request",
      name: "first",
      value: 1,
      timestamp: Date.now() - 3000,
    });

    limitedStore.record({
      organizationId: "org-limit",
      metricType: "request",
      name: "second",
      value: 2,
      timestamp: Date.now() - 2000,
    });

    limitedStore.record({
      organizationId: "org-limit",
      metricType: "request",
      name: "third",
      value: 3,
      timestamp: Date.now() - 1000,
    });

    assert.equal(limitedStore.size(), 2);

    const records = limitedStore.getAll();
    assert.equal(records[0].name, "second");
    assert.equal(records[1].name, "third");
  });

  await test("health is healthy when connected", () => {
    const health = store.health();

    assert.equal(health.healthy, true);
    assert.equal(health.connected, true);
    assert.ok(health.records >= 0);
    assert.ok(health.organizations >= 0);
  });

  await test("rejects invalid metric values", () => {
    assert.throws(() => validateMetricValue(Number.NaN), /finite number/);
    assert.throws(
      () => validateMetricValue(Number.POSITIVE_INFINITY),
      /finite number/,
    );
  });

  await test("rejects invalid metric names", () => {
    assert.throws(() => validateMetricName(""), /required/);
  });

  await test("rejects invalid metric types", () => {
    assert.throws(
      () => validateMetricType("invalid" as never),
      /Invalid metric type/,
    );
  });

  await test("clear removes all records", () => {
    const countBefore = store.size();
    const deleted = store.clear();

    assert.equal(deleted, countBefore);
    assert.equal(store.size(), 0);
  });

  await test("disconnects successfully", () => {
    store.disconnect();
    assert.equal(store.isConnected(), false);
  });

  console.log("Organizations module test suite completed successfully.");
});