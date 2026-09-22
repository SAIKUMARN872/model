// services/analytics/models/test_models.ts

import {
  ModelMetricsStore,
  benchmarkModels,
  compareModels,
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

await test("models module", async () => {
  await test("starts disconnected", () => {
    const store = new ModelMetricsStore();

    assert.equal(store.isConnected(), false);
    assert.equal(store.size(), 0);
  });

  await test("connects successfully", () => {
    const store = new ModelMetricsStore();

    store.connect();
    assert.equal(store.isConnected(), true);
  });

  await test("records model metric", () => {
    const store = new ModelMetricsStore();

    store.connect();

    const record = store.record({
      organizationId: "org-1",
      provider: "openai",
      model: "gpt-model",
      metricType: "latency",
      value: 250,
    });

    assert.equal(record.organizationId, "org-1");
    assert.equal(record.provider, "openai");
    assert.equal(record.model, "gpt-model");
    assert.equal(record.metricType, "latency");
    assert.equal(record.value, 250);
    assert.equal(store.size(), 1);
  });

  await test("records all metric types", () => {
    const store = new ModelMetricsStore();

    store.connect();

    const types = [
      "request",
      "latency",
      "token",
      "cost",
      "error",
      "quality",
    ] as const;

    for (const metricType of types) {
      store.record({
        organizationId: "org-1",
        provider: "openai",
        model: "gpt-model",
        metricType,
        value: 10,
      });
    }

    assert.equal(store.size(), 6);
  });

  await test("gets record by ID", () => {
    const store = new ModelMetricsStore();

    store.connect();

    const created = store.record({
      organizationId: "org-1",
      provider: "openai",
      model: "gpt-model",
      metricType: "cost",
      value: 0.25,
    });

    const found = store.getById(created.id);

    assert.ok(found);

    const record = found!;
    assert.equal(record.id, created.id);
    assert.equal(record.value, 0.25);
  });

  await test("isolates organizations", () => {
    const store = new ModelMetricsStore();

    store.connect();

    store.record({
      organizationId: "org-1",
      provider: "openai",
      model: "model-a",
      metricType: "latency",
      value: 100,
    });

    store.record({
      organizationId: "org-2",
      provider: "openai",
      model: "model-a",
      metricType: "latency",
      value: 200,
    });

    const result = store.find({ organizationId: "org-1" });

    assert.equal(result.length, 1);
    assert.equal(result[0].value, 100);
  });

  await test("filters by provider and model", () => {
    const store = new ModelMetricsStore();

    store.connect();

    store.record({
      organizationId: "org-1",
      provider: "openai",
      model: "model-a",
      metricType: "latency",
      value: 100,
    });

    store.record({
      organizationId: "org-1",
      provider: "anthropic",
      model: "model-b",
      metricType: "latency",
      value: 200,
    });

    const result = store.find({ provider: "openai", model: "model-a" });

    assert.equal(result.length, 1);
    assert.equal(result[0].value, 100);
  });

  await test("creates model benchmarks", () => {
    const store = new ModelMetricsStore();

    store.connect();

    const records = [
      {
        provider: "openai",
        model: "model-a",
        request: 100,
        latency: 200,
        tokens: 5000,
        cost: 2,
        quality: 0.9,
        errors: 5,
      },
      {
        provider: "anthropic",
        model: "model-b",
        request: 80,
        latency: 300,
        tokens: 4000,
        cost: 3,
        quality: 0.85,
        errors: 4,
      },
    ];

    for (const item of records) {
      store.record({
        organizationId: "org-1",
        provider: item.provider,
        model: item.model,
        metricType: "request",
        value: item.request,
      });

      store.record({
        organizationId: "org-1",
        provider: item.provider,
        model: item.model,
        metricType: "latency",
        value: item.latency,
      });

      store.record({
        organizationId: "org-1",
        provider: item.provider,
        model: item.model,
        metricType: "token",
        value: item.tokens,
      });

      store.record({
        organizationId: "org-1",
        provider: item.provider,
        model: item.model,
        metricType: "cost",
        value: item.cost,
      });

      store.record({
        organizationId: "org-1",
        provider: item.provider,
        model: item.model,
        metricType: "quality",
        value: item.quality,
      });

      store.record({
        organizationId: "org-1",
        provider: item.provider,
        model: item.model,
        metricType: "error",
        value: item.errors,
      });
    }

    const benchmarks = benchmarkModels(store, { organizationId: "org-1" });

    assert.equal(benchmarks.length, 2);

    const modelA = benchmarks.find((item) => item.model === "model-a");

    assert.ok(modelA);

    const model = modelA!;
    assert.equal(model.requestCount, 100);
    assert.equal(model.averageLatency, 200);
    assert.equal(model.totalTokens, 5000);
    assert.equal(model.totalCost, 2);
    assert.equal(model.averageQuality, 0.9);
    assert.equal(model.errorCount, 5);
    assert.equal(model.errorRate, 5);
  });

  await test("calculates latency percentiles", () => {
    const store = new ModelMetricsStore();

    store.connect();

    const values = [100, 200, 300, 400, 500];

    for (const value of values) {
      store.record({
        organizationId: "org-1",
        provider: "openai",
        model: "model-a",
        metricType: "latency",
        value,
      });
    }

    const result = benchmarkModels(store, { organizationId: "org-1" });

    assert.equal(result.length, 1);
    assert.equal(result[0].averageLatency, 300);
    assert.equal(result[0].p50Latency, 300);
    assert.equal(result[0].p95Latency, 480);
    assert.equal(result[0].p99Latency, 496);
  });

  await test("compares models by metric", () => {
    const store = new ModelMetricsStore();

    store.connect();

    store.record({
      organizationId: "org-1",
      provider: "openai",
      model: "slow-model",
      metricType: "latency",
      value: 500,
    });

    store.record({
      organizationId: "org-1",
      provider: "openai",
      model: "fast-model",
      metricType: "latency",
      value: 100,
    });

    const benchmarks = benchmarkModels(store, { organizationId: "org-1" });
    const sorted = compareModels(benchmarks, "averageLatency");

    assert.equal(sorted.length, 2);
    assert.equal(sorted[0].model, "fast-model");
    assert.equal(sorted[1].model, "slow-model");
  });

  await test("supports token metrics", () => {
    const store = new ModelMetricsStore();

    store.connect();

    store.record({
      organizationId: "org-1",
      provider: "openai",
      model: "model-a",
      metricType: "token",
      value: 1000,
      inputTokens: 700,
      outputTokens: 300,
      totalTokens: 1000,
    });

    const record = store.getAll()[0];

    assert.equal(record.inputTokens, 700);
    assert.equal(record.outputTokens, 300);
    assert.equal(record.totalTokens, 1000);
  });

  await test("supports retention", () => {
    const store = new ModelMetricsStore({ maxRecords: 2 });

    store.connect();

    store.record({
      organizationId: "org-1",
      provider: "openai",
      model: "model-a",
      metricType: "latency",
      value: 100,
    });

    store.record({
      organizationId: "org-1",
      provider: "openai",
      model: "model-a",
      metricType: "latency",
      value: 200,
    });

    store.record({
      organizationId: "org-1",
      provider: "openai",
      model: "model-a",
      metricType: "latency",
      value: 300,
    });

    assert.equal(store.size(), 2);

    const records = store.getAll();
    assert.equal(records[0].value, 200);
    assert.equal(records[1].value, 300);
  });

  await test("returns health", () => {
    const store = new ModelMetricsStore();

    store.connect();

    store.record({
      organizationId: "org-1",
      provider: "openai",
      model: "model-a",
      metricType: "request",
      value: 10,
    });

    const health = store.health();

    assert.equal(health.healthy, true);
    assert.equal(health.connected, true);
    assert.equal(health.recordCount, 1);
  });

  await test("rejects disconnected record", () => {
    const store = new ModelMetricsStore();

    assert.throws(
      () =>
        store.record({
          organizationId: "org-1",
          provider: "openai",
          model: "model-a",
          metricType: "request",
          value: 10,
        }),
      /not connected/,
    );
  });

  await test("rejects empty organization", () => {
    const store = new ModelMetricsStore();

    store.connect();

    assert.throws(
      () =>
        store.record({
          organizationId: "",
          provider: "openai",
          model: "model-a",
          metricType: "request",
          value: 10,
        }),
      /Organization ID cannot be empty/,
    );
  });

  await test("rejects empty provider", () => {
    const store = new ModelMetricsStore();

    store.connect();

    assert.throws(
      () =>
        store.record({
          organizationId: "org-1",
          provider: "",
          model: "model-a",
          metricType: "request",
          value: 10,
        }),
      /Provider cannot be empty/,
    );
  });

  await test("rejects empty model", () => {
    const store = new ModelMetricsStore();

    store.connect();

    assert.throws(
      () =>
        store.record({
          organizationId: "org-1",
          provider: "openai",
          model: "",
          metricType: "request",
          value: 10,
        }),
      /Model cannot be empty/,
    );
  });

  await test("rejects NaN metric value", () => {
    const store = new ModelMetricsStore();

    store.connect();

    assert.throws(
      () =>
        store.record({
          organizationId: "org-1",
          provider: "openai",
          model: "model-a",
          metricType: "request",
          value: Number.NaN,
        }),
      /finite number/,
    );
  });

  await test("clears organization", () => {
    const store = new ModelMetricsStore();

    store.connect();

    store.record({
      organizationId: "org-1",
      provider: "openai",
      model: "model-a",
      metricType: "request",
      value: 10,
    });

    store.record({
      organizationId: "org-2",
      provider: "openai",
      model: "model-a",
      metricType: "request",
      value: 20,
    });

    const removed = store.clearOrganization("org-1");

    assert.equal(removed, 1);
    assert.equal(store.size(), 1);
  });

  await test("clears all records", () => {
    const store = new ModelMetricsStore();

    store.connect();

    store.record({
      organizationId: "org-1",
      provider: "openai",
      model: "model-a",
      metricType: "request",
      value: 10,
    });

    store.clear();
    assert.equal(store.size(), 0);
  });

  await test("disconnects successfully", () => {
    const store = new ModelMetricsStore();

    store.connect();
    assert.equal(store.isConnected(), true);

    store.disconnect();
    assert.equal(store.isConnected(), false);
  });

  console.log("Models test suite completed successfully.");
});