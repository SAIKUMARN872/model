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
  ModelUsageStore,
} from "./model_usage.js";

import {
  RouterMetricsStore,
} from "./router_metrics.js";

await test("routing module", async (t) => {
  await t.test("model usage requires connection", () => {
    const store = new ModelUsageStore();

    assert.equal(store.isConnected(), false);

    assert.throws(
      () =>
        store.record({
          organizationId: "org-1",
          provider: "openai",
          model: "gpt-test",
        }),
      /not connected/,
    );
  });

  await t.test("model usage connects successfully", () => {
    const store = new ModelUsageStore();

    store.connect();

    assert.equal(store.isConnected(), true);
  });

  await t.test("records model usage", () => {
    const store = new ModelUsageStore();

    store.connect();

    const record = store.record({
      organizationId: "org-1",
      provider: "openai",
      model: "gpt-test",
      inputTokens: 100,
      outputTokens: 50,
      latencyMs: 500,
      cost: 0.01,
      quality: 0.9,
    });

    assert.ok(record.id);
    assert.equal(record.organizationId, "org-1");
    assert.equal(record.provider, "openai");
    assert.equal(record.model, "gpt-test");
    assert.equal(record.inputTokens, 100);
    assert.equal(record.outputTokens, 50);
    assert.equal(record.totalTokens, 150);
    assert.equal(record.latencyMs, 500);
    assert.equal(record.cost, 0.01);
    assert.equal(record.quality, 0.9);
  });

  await t.test("gets model usage by ID", () => {
    const store = new ModelUsageStore();

    store.connect();

    const record = store.record({
      organizationId: "org-1",
      provider: "openai",
      model: "gpt-test",
    });

    const found = store.getById(record.id);

    if (!found) {
      throw new Error("Expected record to be found");
    }

    assert.equal(found.id, record.id);

    assert.equal(
      store.getById("unknown-id"),
      undefined,
    );
  });

  await t.test("isolates organizations", () => {
    const store = new ModelUsageStore();

    store.connect();

    store.record({
      organizationId: "org-1",
      provider: "openai",
      model: "model-a",
    });

    store.record({
      organizationId: "org-2",
      provider: "anthropic",
      model: "model-b",
    });

    const org1 = store.getOrganizationUsage("org-1");

    assert.equal(org1.length, 1);
    assert.equal(org1[0].organizationId, "org-1");
  });

  await t.test("filters model usage", () => {
    const store = new ModelUsageStore();

    store.connect();

    store.record({
      organizationId: "org-1",
      provider: "openai",
      model: "model-a",
      capability: "chat",
      status: "success",
    });

    store.record({
      organizationId: "org-1",
      provider: "anthropic",
      model: "model-b",
      capability: "chat",
      status: "error",
    });

    assert.equal(
      store.find({
        provider: "openai",
      }).length,
      1,
    );

    assert.equal(
      store.find({
        model: "model-b",
      }).length,
      1,
    );

    assert.equal(
      store.find({
        status: "error",
      }).length,
      1,
    );

    assert.equal(
      store.find({
        capability: "chat",
      }).length,
      2,
    );
  });

  await t.test("summarizes model usage", () => {
    const store = new ModelUsageStore();

    store.connect();

    store.record({
      organizationId: "org-1",
      provider: "openai",
      model: "model-a",
      inputTokens: 100,
      outputTokens: 50,
      latencyMs: 100,
      cost: 0.01,
      quality: 0.9,
      status: "success",
    });

    store.record({
      organizationId: "org-1",
      provider: "openai",
      model: "model-a",
      inputTokens: 200,
      outputTokens: 100,
      latencyMs: 200,
      cost: 0.02,
      quality: 0.8,
      status: "success",
    });

    const summaries = store.summarize({
      organizationId: "org-1",
    });

    assert.equal(summaries.length, 1);
    assert.equal(summaries[0].requestCount, 2);
    assert.equal(summaries[0].successCount, 2);
    assert.equal(summaries[0].totalTokens, 450);
    assert.equal(summaries[0].totalCost, 0.03);
    assert.equal(summaries[0].averageLatencyMs, 150);
    assert.equal(summaries[0].successRate, 1);
  });

  await t.test("model usage supports retention", () => {
    const store = new ModelUsageStore({
      retentionMs: 100,
    });

    store.connect();

    store.record({
      organizationId: "org-1",
      provider: "openai",
      model: "old-model",
      timestamp: Date.now() - 1_000,
    });

    store.record({
      organizationId: "org-1",
      provider: "openai",
      model: "new-model",
      timestamp: Date.now(),
    });

    assert.equal(store.size(), 1);
  });

  await t.test("model usage clears organization", () => {
    const store = new ModelUsageStore();

    store.connect();

    store.record({
      organizationId: "org-1",
      provider: "openai",
      model: "model-a",
    });

    store.record({
      organizationId: "org-2",
      provider: "openai",
      model: "model-b",
    });

    const deleted = store.clearOrganization("org-1");

    assert.equal(deleted, 1);
    assert.equal(store.size(), 1);
    assert.equal(
      store.getOrganizationUsage("org-1").length,
      0,
    );
  });

  await t.test("router metrics require connection", () => {
    const store = new RouterMetricsStore();

    assert.equal(store.isConnected(), false);

    assert.throws(
      () =>
        store.record({
          organizationId: "org-1",
          provider: "openai",
          model: "model-a",
        }),
      /not connected/,
    );
  });

  await t.test("records router metrics", () => {
    const store = new RouterMetricsStore();

    store.connect();

    const metric = store.record({
      organizationId: "org-1",
      provider: "openai",
      model: "model-a",
      decision: "primary",
      status: "success",
      latencyMs: 300,
      cost: 0.02,
      inputTokens: 100,
      outputTokens: 50,
    });

    assert.ok(metric.id);
    assert.equal(metric.decision, "primary");
    assert.equal(metric.status, "success");
    assert.equal(metric.totalTokens, 150);
  });

  await t.test("filters router metrics", () => {
    const store = new RouterMetricsStore();

    store.connect();

    store.record({
      organizationId: "org-1",
      provider: "openai",
      model: "model-a",
      decision: "primary",
    });

    store.record({
      organizationId: "org-1",
      provider: "anthropic",
      model: "model-b",
      decision: "fallback",
    });

    assert.equal(
      store.find({
        decision: "fallback",
      }).length,
      1,
    );

    assert.equal(
      store.find({
        provider: "openai",
      }).length,
      1,
    );
  });

  await t.test("calculates router statistics", () => {
    const store = new RouterMetricsStore();

    store.connect();

    store.record({
      organizationId: "org-1",
      provider: "openai",
      model: "model-a",
      decision: "primary",
      status: "success",
      latencyMs: 100,
      cost: 0.01,
      inputTokens: 100,
      outputTokens: 50,
    });

    store.record({
      organizationId: "org-1",
      provider: "anthropic",
      model: "model-b",
      decision: "fallback",
      status: "success",
      latencyMs: 300,
      cost: 0.02,
      inputTokens: 200,
      outputTokens: 100,
    });

    store.record({
      organizationId: "org-1",
      provider: "openai",
      model: "model-a",
      decision: "retry",
      status: "error",
      latencyMs: 500,
      cost: 0.03,
      inputTokens: 100,
      outputTokens: 50,
    });

    const stats = store.getStatistics({
      organizationId: "org-1",
    });

    assert.equal(stats.requestCount, 3);
    assert.equal(stats.successCount, 2);
    assert.equal(stats.errorCount, 1);
    assert.equal(stats.primaryCount, 1);
    assert.equal(stats.fallbackCount, 1);
    assert.equal(stats.retryCount, 1);
    assert.equal(stats.totalTokens, 600);
    assert.equal(stats.totalCost, 0.06);
    assert.equal(stats.averageLatencyMs, 300);
    assert.equal(
      stats.successRate,
      2 / 3,
    );
    assert.equal(
      stats.fallbackRate,
      1 / 3,
    );
  });

  await t.test("router metrics isolate organizations", () => {
    const store = new RouterMetricsStore();

    store.connect();

    store.record({
      organizationId: "org-1",
      provider: "openai",
      model: "model-a",
    });

    store.record({
      organizationId: "org-2",
      provider: "anthropic",
      model: "model-b",
    });

    assert.equal(
      store.getOrganizationMetrics("org-1").length,
      1,
    );

    assert.equal(
      store.getOrganizationMetrics("org-2").length,
      1,
    );
  });

  await t.test("router metrics health works", () => {
    const store = new RouterMetricsStore();

    assert.equal(store.health().healthy, false);

    store.connect();

    store.record({
      organizationId: "org-1",
      provider: "openai",
      model: "model-a",
    });

    const health = store.health();

    assert.equal(health.connected, true);
    assert.equal(health.healthy, true);
    assert.equal(health.records, 1);
    assert.equal(health.organizations, 1);
  });

  await t.test("validates model usage input", () => {
    const store = new ModelUsageStore();

    store.connect();

    assert.throws(
      () =>
        store.record({
          organizationId: "",
          provider: "openai",
          model: "model-a",
        }),
      /organizationId is required/,
    );

    assert.throws(
      () =>
        store.record({
          organizationId: "org-1",
          provider: "",
          model: "model-a",
        }),
      /provider is required/,
    );

    assert.throws(
      () =>
        store.record({
          organizationId: "org-1",
          provider: "openai",
          model: "model-a",
          quality: 2,
        }),
      /quality must be between 0 and 1/,
    );
  });

  await t.test("validates router metrics input", () => {
    const store = new RouterMetricsStore();

    store.connect();

    assert.throws(
      () =>
        store.record({
          organizationId: "org-1",
          provider: "openai",
          model: "model-a",
          latencyMs: -1,
        }),
      /latencyMs cannot be negative/,
    );

    assert.throws(
      () =>
        store.record({
          organizationId: "org-1",
          provider: "openai",
          model: "model-a",
          quality: 2,
        }),
      /quality must be between 0 and 1/,
    );
  });

  await t.test("clears router metrics", () => {
    const store = new RouterMetricsStore();

    store.connect();

    store.record({
      organizationId: "org-1",
      provider: "openai",
      model: "model-a",
    });

    assert.equal(store.size(), 1);

    store.clear();

    assert.equal(store.size(), 0);

    store.disconnect();

    assert.equal(store.isConnected(), false);
  });

  console.log("Routing test suite completed successfully.");
});