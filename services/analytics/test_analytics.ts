import assert from "node:assert/strict";

import { AnomalyDetector } from "./anomaly_detection/detector.js";
import { AuditLogger } from "./audit/logger.js";
import { CacheManager } from "./cache/manager.js";
import { RedisClient } from "./cache/redis.js";
import { loadAnalyticsConfig } from "./config/settings.js";
import { CostAnalyzer } from "./cost/analyzer.js";
import { createCostReport } from "./cost/reports.js";
import { createOrganizationMetrics } from "./organizations/organization_metrics.js";
import { AnalyticsEventConsumer } from "./events/consumer.js";
import { DatabaseConnection } from "./database/connection.js";
import { Predictor } from "./forecasting/predictor.js";
import { LatencyTracker } from "./latency/tracker.js";
import { analyzeLatency } from "./latency/analyzer.js";
import { MetricCollector } from "./metrics/collector.js";
import { processMetrics } from "./metrics/processor.js";
import { calculateModelMetrics } from "./models/model_metrics.js";
import { PerformanceEvaluator } from "./performance/evaluator.js";
import { PerformanceMonitor } from "./performance/monitor.js";
import { ReportExporter } from "./reports/exporter.js";
import { summarizeRouterMetrics } from "./routing/router_metrics.js";
import { UsageTracker } from "./usage/tracker.js";
import { aggregateUsage } from "./usage/aggregator.js";
import { createUsageReport } from "./usage/reports.js";
import { analyzeUserBehavior } from "./users/behavior.js";

console.log("Running ModelNow Analytics Service tests...");
console.log("");

async function runTest(
  name: string,
  test: () => unknown | Promise<unknown>,
): Promise<void> {
  try {
    await test();
    console.log(`? ${name}`);
  } catch (error) {
    console.error(`? ${name}`);
    throw error;
  }
}

async function expectError(
  operation: () => unknown | Promise<unknown>,
): Promise<void> {
  await assert.rejects(async () => {
    await operation();
  });
}

/* ============================================================
   ANOMALY DETECTION
   ============================================================ */

await runTest("anomaly detection", () => {
  const detector = new AnomalyDetector();

  const anomaly = detector.detect(
    {
      id: "event-1",
      metric: "latency",
      value: 200,
      timestamp: new Date().toISOString(),
    },
    100,
    0.2,
  );

  assert.ok(anomaly);
  assert.equal(anomaly.metric, "latency");
  assert.equal(anomaly.value, 200);
  assert.equal(anomaly.expected, 100);
  assert.equal(anomaly.severity, "critical");
  assert.ok(anomaly.deviation > 0.2);
});

await runTest("normal event detection", () => {
  const detector = new AnomalyDetector();

  const anomaly = detector.detect(
    {
      id: "event-2",
      metric: "latency",
      value: 105,
      timestamp: new Date().toISOString(),
    },
    100,
    0.2,
  );

  assert.equal(anomaly, null);
});

await runTest("anomaly validation", async () => {
  const detector = new AnomalyDetector();

  await expectError(() =>
    detector.detect(
      {
        id: "event-3",
        metric: "",
        value: 100,
        timestamp: new Date().toISOString(),
      },
      100,
    ),
  );

  await expectError(() =>
    detector.detect(
      {
        id: "event-4",
        metric: "latency",
        value: 100,
        timestamp: new Date().toISOString(),
      },
      0,
    ),
  );
});

/* ============================================================
   AUDIT
   ============================================================ */

await runTest("audit logging", () => {
  const logger = new AuditLogger();

  const event = logger.log(
    "user-1",
    "create",
    "agent",
    "agent-1",
    {
      source: "test",
    },
  );

  assert.ok(event.id);
  assert.equal(event.actorId, "user-1");
  assert.equal(event.action, "create");
  assert.equal(event.resource, "agent");
  assert.equal(event.resourceId, "agent-1");
  assert.equal(event.metadata.source, "test");
  assert.equal(logger.list().length, 1);
});

await runTest("audit metadata protection", () => {
  const logger = new AuditLogger();

  const metadata = {
    nested: {
      value: 10,
    },
  };

  logger.log(
    "user-1",
    "update",
    "agent",
    "agent-1",
    metadata,
  );

  metadata.nested.value = 99;

  const stored = logger.list()[0];

  assert.ok(stored);
  assert.equal(
    (stored.metadata.nested as { value: number }).value,
    10,
  );
});

await runTest("audit clear", () => {
  const logger = new AuditLogger();

  logger.log(
    "user-1",
    "delete",
    "agent",
    "agent-1",
  );

  assert.equal(logger.list().length, 1);

  logger.clear();

  assert.equal(logger.list().length, 0);
});

/* ============================================================
   CACHE
   ============================================================ */

await runTest("cache set and get", () => {
  const cache = new CacheManager();

  cache.set("user:1", {
    name: "Test User",
  });

  const value = cache.get<{ name: string }>("user:1");

  assert.deepEqual(value, {
    name: "Test User",
  });
});

await runTest("cache update", () => {
  const cache = new CacheManager();

  cache.set("key", "first");
  cache.set("key", "second");

  assert.equal(cache.get<string>("key"), "second");
});

await runTest("cache delete", () => {
  const cache = new CacheManager();

  cache.set("key", "value");

  assert.equal(cache.delete("key"), true);
  assert.equal(cache.get("key"), undefined);
  assert.equal(cache.delete("key"), false);
});

await runTest("cache clear", () => {
  const cache = new CacheManager();

  cache.set("a", 1);
  cache.set("b", 2);

  cache.clear();

  assert.equal(cache.get("a"), undefined);
  assert.equal(cache.get("b"), undefined);
});

await runTest("cache expiration", async () => {
  const cache = new CacheManager();

  cache.set("temporary", "value", 10);

  assert.equal(
    cache.get<string>("temporary"),
    "value",
  );

  await new Promise((resolve) => {
    setTimeout(resolve, 20);
  });

  assert.equal(
    cache.get("temporary"),
    undefined,
  );
});

await runTest("cache validation", async () => {
  const cache = new CacheManager();

  await expectError(() =>
    cache.set("", "value"),
  );

  await expectError(() =>
    cache.set("key", "value", -1),
  );
});

/* ============================================================
   REDIS
   ============================================================ */

await runTest("redis client", async () => {
  const redis = new RedisClient({
    host: "localhost",
    port: 6379,
    database: 1,
  });

  assert.deepEqual(redis.getConfig(), {
    host: "localhost",
    port: 6379,
    database: 1,
  });

  assert.equal(await redis.ping(), "PONG");
});

/* ============================================================
   CONFIG
   ============================================================ */

await runTest("analytics configuration", () => {
  const originalEnvironment = process.env.NODE_ENV;
  const originalPort = process.env.ANALYTICS_PORT;

  process.env.NODE_ENV = "test";
  process.env.ANALYTICS_PORT = "4999";

  const config = loadAnalyticsConfig();

  assert.equal(config.environment, "test");
  assert.equal(config.port, 4999);
  assert.equal(
    config.serviceName,
    "modelnow-analytics",
  );

  if (originalEnvironment === undefined) {
    delete process.env.NODE_ENV;
  } else {
    process.env.NODE_ENV = originalEnvironment;
  }

  if (originalPort === undefined) {
    delete process.env.ANALYTICS_PORT;
  } else {
    process.env.ANALYTICS_PORT = originalPort;
  }
});

/* ============================================================
   COST
   ============================================================ */

await runTest("cost record creation", () => {
  const analyzer = new CostAnalyzer();

  const record = analyzer.add({
    model: "model-a",
    inputTokens: 1000,
    outputTokens: 500,
    inputRate: 1,
    outputRate: 2,
  });

  assert.ok(record.id);
  assert.equal(record.model, "model-a");
  assert.equal(record.inputTokens, 1000);
  assert.equal(record.outputTokens, 500);
});

await runTest("cost calculation", () => {
  const analyzer = new CostAnalyzer();

  const record = analyzer.add({
    model: "model-a",
    inputTokens: 1000,
    outputTokens: 500,
    inputRate: 1,
    outputRate: 2,
  });

  const result = analyzer.calculate(record);

  assert.equal(result.inputCost, 1);
  assert.equal(result.outputCost, 1);
  assert.equal(result.totalCost, 2);
});

await runTest("cost report", () => {
  const analyzer = new CostAnalyzer();

  analyzer.add({
    model: "model-a",
    inputTokens: 1000,
    outputTokens: 0,
    inputRate: 1,
    outputRate: 2,
  });

  analyzer.add({
    model: "model-a",
    inputTokens: 1000,
    outputTokens: 500,
    inputRate: 1,
    outputRate: 2,
  });

  analyzer.add({
    model: "model-b",
    inputTokens: 2000,
    outputTokens: 0,
    inputRate: 2,
    outputRate: 2,
  });

  const report = createCostReport(
    analyzer.list(),
  );

  assert.equal(report.length, 2);

  const modelA = report.find(
    (item) => item.model === "model-a",
  );

  const modelB = report.find(
    (item) => item.model === "model-b",
  );

  assert.ok(modelA);
  assert.ok(modelB);

  assert.equal(modelA.records, 2);
  assert.equal(modelB.records, 1);
  assert.equal(modelA.totalCost, 3);
  assert.equal(modelB.totalCost, 4);
});

await runTest("cost validation", async () => {
  const analyzer = new CostAnalyzer();

  await expectError(() =>
    analyzer.add({
      model: "",
      inputTokens: 100,
      outputTokens: 100,
      inputRate: 1,
      outputRate: 1,
    }),
  );

  await expectError(() =>
    analyzer.add({
      model: "model-a",
      inputTokens: -1,
      outputTokens: 100,
      inputRate: 1,
      outputRate: 1,
    }),
  );
});

/* ============================================================
   DASHBOARDS
   ============================================================ */

await runTest("dashboard and widget types", () => {
  const dashboard = {
    id: "dashboard-1",
    name: "Operations",
    ownerId: "user-1",
    widgetIds: ["widget-1"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const widget = {
    id: "widget-1",
    type: "metric" as const,
    title: "Requests",
    configuration: {
      metric: "requests",
    },
  };

  assert.equal(dashboard.name, "Operations");
  assert.equal(widget.type, "metric");
  assert.equal(widget.configuration.metric, "requests");
});

/* ============================================================
   DATABASE
   ============================================================ */

await runTest("database connection", async () => {
  const database = new DatabaseConnection({
    host: "localhost",
    port: 5432,
    database: "modelnow_test",
  });

  assert.deepEqual(database.getConfig(), {
    host: "localhost",
    port: 5432,
    database: "modelnow_test",
  });

  await database.connect();
  await database.disconnect();
});

/* ============================================================
   EVENTS
   ============================================================ */

await runTest("event consumer", () => {
  const consumer = new AnalyticsEventConsumer();

  let received = 0;

  consumer.subscribe("metric.created", () => {
    received += 1;
  });

  consumer.publish({
    id: "event-1",
    type: "metric.created",
    timestamp: new Date().toISOString(),
    payload: {
      metric: "requests",
      value: 10,
    },
  });

  assert.equal(received, 1);
});

await runTest("event unsubscribe", () => {
  const consumer = new AnalyticsEventConsumer();

  let received = 0;

  const unsubscribe = consumer.subscribe(
    "metric.created",
    () => {
      received += 1;
    },
  );

  unsubscribe();

  consumer.publish({
    id: "event-1",
    type: "metric.created",
    timestamp: new Date().toISOString(),
    payload: {},
  });

  assert.equal(received, 0);
});

await runTest("multiple event handlers", () => {
  const consumer = new AnalyticsEventConsumer();

  let first = 0;
  let second = 0;

  consumer.subscribe("test", () => {
    first += 1;
  });

  consumer.subscribe("test", () => {
    second += 1;
  });

  consumer.publish({
    id: "event-1",
    type: "test",
    timestamp: new Date().toISOString(),
    payload: {},
  });

  assert.equal(first, 1);
  assert.equal(second, 1);
});

/* ============================================================
   FORECASTING
   ============================================================ */

await runTest("forecast generation", () => {
  const predictor = new Predictor();

  const forecast = predictor.predict(
    "requests",
    [10, 20, 30],
    3,
  );

  assert.equal(forecast.metric, "requests");
  assert.equal(forecast.points.length, 3);

  for (const point of forecast.points) {
    assert.equal(point.value, 20);
    assert.ok(point.timestamp);
  }
});

await runTest("forecast validation", async () => {
  const predictor = new Predictor();

  await expectError(() =>
    predictor.predict("", [10, 20], 2),
  );

  await expectError(() =>
    predictor.predict("requests", [], 2),
  );

  await expectError(() =>
    predictor.predict("requests", [10], 0),
  );
});

/* ============================================================
   LATENCY
   ============================================================ */

await runTest("latency tracking", () => {
  const tracker = new LatencyTracker();

  const first = tracker.record(
    "request",
    100,
  );

  const second = tracker.record(
    "request",
    200,
  );

  assert.ok(first.id);
  assert.ok(second.id);
  assert.equal(tracker.list().length, 2);
});

await runTest("latency analysis", () => {
  const tracker = new LatencyTracker();

  tracker.record("request", 100);
  tracker.record("request", 200);
  tracker.record("request", 300);

  const analysis = analyzeLatency(
    tracker.list(),
  );

  assert.equal(analysis.count, 3);
  assert.equal(analysis.averageMs, 200);
  assert.equal(analysis.minMs, 100);
  assert.equal(analysis.maxMs, 300);
});

await runTest("empty latency analysis", () => {
  const analysis = analyzeLatency([]);

  assert.equal(analysis.count, 0);
  assert.equal(analysis.averageMs, 0);
  assert.equal(analysis.minMs, 0);
  assert.equal(analysis.maxMs, 0);
});

await runTest("latency validation", async () => {
  const tracker = new LatencyTracker();

  await expectError(() =>
    tracker.record("", 100),
  );

  await expectError(() =>
    tracker.record("request", -1),
  );
});

/* ============================================================
   METRICS
   ============================================================ */

await runTest("metric collection", () => {
  const collector = new MetricCollector();

  const metric = collector.collect(
    "requests",
    100,
    {
      environment: "test",
    },
  );

  assert.equal(metric.name, "requests");
  assert.equal(metric.value, 100);
  assert.equal(
    metric.dimensions.environment,
    "test",
  );

  assert.equal(
    collector.list().length,
    1,
  );
});

await runTest("metric processing", () => {
  const collector = new MetricCollector();

  collector.collect("requests", 10);
  collector.collect("requests", 20);
  collector.collect("requests", 30);
  collector.collect("errors", 2);

  const processed = processMetrics(
    collector.list(),
  );

  const requests = processed.find(
    (metric) => metric.name === "requests",
  );

  const errors = processed.find(
    (metric) => metric.name === "errors",
  );

  assert.ok(requests);
  assert.ok(errors);

  assert.equal(requests.count, 3);
  assert.equal(requests.sum, 60);
  assert.equal(requests.average, 20);
  assert.equal(requests.minimum, 10);
  assert.equal(requests.maximum, 30);

  assert.equal(errors.count, 1);
  assert.equal(errors.average, 2);
});

await runTest("metric validation", async () => {
  const collector = new MetricCollector();

  await expectError(() =>
    collector.collect("", 100),
  );

  await expectError(() =>
    collector.collect("requests", Number.NaN),
  );
});

/* ============================================================
   MODELS
   ============================================================ */

await runTest("model metrics", () => {
  const timestamp = new Date().toISOString();

  const metrics = calculateModelMetrics([
    {
      model: "model-a",
      latencyMs: 100,
      qualityScore: 0.9,
      costPer1KTokens: 1,
      timestamp,
    },
    {
      model: "model-a",
      latencyMs: 200,
      qualityScore: 0.8,
      costPer1KTokens: 2,
      timestamp,
    },
    {
      model: "model-b",
      latencyMs: 300,
      qualityScore: 0.7,
      costPer1KTokens: 3,
      timestamp,
    },
  ]);

  assert.equal(metrics.length, 2);

  const modelA = metrics.find(
    (metric) => metric.model === "model-a",
  );

  assert.ok(modelA);

  assert.equal(modelA.sampleCount, 2);
  assert.equal(modelA.averageLatencyMs, 150);
  assert.ok(Math.abs(modelA.averageQuality - 0.85) < 1e-6);
  assert.equal(modelA.averageCost, 1.5);
});

/* ============================================================
   ORGANIZATIONS
   ============================================================ */

await runTest("organization metrics", () => {
  const metrics = createOrganizationMetrics(
    "org-1",
  );

  assert.equal(metrics.organizationId, "org-1");
  assert.equal(metrics.requests, 0);
  assert.equal(metrics.tokens, 0);
  assert.equal(metrics.cost, 0);
  assert.equal(metrics.activeUsers, 0);
  assert.ok(metrics.updatedAt);
});

await runTest("organization validation", async () => {
  await expectError(() =>
    createOrganizationMetrics(""),
  );
});

/* ============================================================
   PERFORMANCE
   ============================================================ */

await runTest("performance evaluation", () => {
  const evaluator = new PerformanceEvaluator();

  const metrics = evaluator.evaluate(
    100,
    100,
    5,
  );

  assert.equal(metrics.latencyMs, 100);
  assert.equal(metrics.throughput, 100);
  assert.equal(metrics.errorRate, 0.05);
  assert.ok(metrics.timestamp);
});

await runTest("performance zero requests", () => {
  const evaluator = new PerformanceEvaluator();

  const metrics = evaluator.evaluate(
    50,
    0,
    0,
  );

  assert.equal(metrics.errorRate, 0);
});

await runTest("performance monitoring", () => {
  const evaluator = new PerformanceEvaluator();
  const monitor = new PerformanceMonitor();

  const first = evaluator.evaluate(
    100,
    100,
    5,
  );

  const second = evaluator.evaluate(
    200,
    200,
    10,
  );

  monitor.record(first);
  monitor.record(second);

  assert.equal(monitor.list().length, 2);
  assert.equal(
    monitor.latest()?.latencyMs,
    200,
  );
});

await runTest("performance validation", async () => {
  const evaluator = new PerformanceEvaluator();

  await expectError(() =>
    evaluator.evaluate(-1, 10, 1),
  );

  await expectError(() =>
    evaluator.evaluate(100, 10, 11),
  );

  await expectError(() =>
    evaluator.evaluate(100, -1, 0),
  );
});

/* ============================================================
   REPORTS
   ============================================================ */

await runTest("report creation", () => {
  const exporter = new ReportExporter();

  const report = exporter.create(
    "Analytics Report",
    {
      requests: 100,
      errors: 5,
    },
  );

  assert.ok(report.id);
  assert.equal(
    report.title,
    "Analytics Report",
  );

  assert.equal(
    report.data.requests,
    100,
  );
});

await runTest("report JSON export", () => {
  const exporter = new ReportExporter();

  const report = exporter.create(
    "Analytics Report",
    {
      requests: 100,
    },
  );

  const json = exporter.toJson(report);

  const parsed = JSON.parse(json) as {
    title: string;
    data: {
      requests: number;
    };
  };

  assert.equal(
    parsed.title,
    "Analytics Report",
  );

  assert.equal(
    parsed.data.requests,
    100,
  );
});

await runTest("report data protection", () => {
  const exporter = new ReportExporter();

  const data = {
    nested: {
      value: 10,
    },
  };

  const report = exporter.create(
    "Protected Report",
    data,
  );

  data.nested.value = 99;

  assert.equal(
    (
      report.data.nested as {
        value: number;
      }
    ).value,
    10,
  );
});

await runTest("report validation", async () => {
  const exporter = new ReportExporter();

  await expectError(() =>
    exporter.create("", {}),
  );
});

/* ============================================================
   ROUTING
   ============================================================ */

await runTest("router metrics", () => {
  const timestamp = new Date().toISOString();

  const result = summarizeRouterMetrics([
    {
      model: "model-a",
      requests: 10,
      tokens: 1000,
      timestamp,
    },
    {
      model: "model-a",
      requests: 5,
      tokens: 500,
      timestamp,
    },
    {
      model: "model-b",
      requests: 20,
      tokens: 2000,
      timestamp,
    },
  ]);

  assert.equal(result.length, 2);

  const modelA = result.find(
    (item) => item.model === "model-a",
  );

  const modelB = result.find(
    (item) => item.model === "model-b",
  );

  assert.ok(modelA);
  assert.ok(modelB);

  assert.equal(modelA.requestCount, 15);
  assert.equal(modelA.tokenCount, 1500);

  assert.equal(modelB.requestCount, 20);
  assert.equal(modelB.tokenCount, 2000);
});

/* ============================================================
   USAGE
   ============================================================ */

await runTest("usage tracking", () => {
  const tracker = new UsageTracker();

  const first = tracker.record(
    "user-1",
    "model-a",
    10,
    1000,
  );

  const second = tracker.record(
    "user-1",
    "model-a",
    5,
    500,
  );

  assert.ok(first.id);
  assert.ok(second.id);

  assert.equal(
    tracker.list().length,
    2,
  );
});

await runTest("usage aggregation", () => {
  const tracker = new UsageTracker();

  tracker.record(
    "user-1",
    "model-a",
    10,
    1000,
  );

  tracker.record(
    "user-1",
    "model-b",
    5,
    500,
  );

  tracker.record(
    "user-2",
    "model-a",
    20,
    2000,
  );

  const result = aggregateUsage(
    tracker.list(),
  );

  assert.equal(result.length, 2);

  const user1 = result.find(
    (item) => item.userId === "user-1",
  );

  assert.ok(user1);
  assert.equal(user1.requests, 15);
  assert.equal(user1.tokens, 1500);
});

await runTest("usage report", () => {
  const tracker = new UsageTracker();

  tracker.record(
    "user-1",
    "model-a",
    10,
    1000,
  );

  tracker.record(
    "user-2",
    "model-a",
    20,
    2000,
  );

  const report = createUsageReport(
    tracker.list(),
  );

  assert.equal(report.users, 2);
  assert.equal(report.totalRequests, 30);
  assert.equal(report.totalTokens, 3000);
  assert.equal(report.byUser.length, 2);
  assert.ok(report.generatedAt);
});

await runTest("usage validation", async () => {
  const tracker = new UsageTracker();

  await expectError(() =>
    tracker.record(
      "",
      "model-a",
      1,
      100,
    ),
  );

  await expectError(() =>
    tracker.record(
      "user-1",
      "",
      1,
      100,
    ),
  );

  await expectError(() =>
    tracker.record(
      "user-1",
      "model-a",
      -1,
      100,
    ),
  );

  await expectError(() =>
    tracker.record(
      "user-1",
      "model-a",
      1,
      -1,
    ),
  );
});

/* ============================================================
   USERS
   ============================================================ */

await runTest("user behavior analysis", () => {
  const now = Date.now();

  const activities = [
    {
      userId: "user-1",
      action: "login",
      timestamp: new Date(
        now - 3000,
      ).toISOString(),
      metadata: {},
    },
    {
      userId: "user-1",
      action: "execute",
      timestamp: new Date(
        now - 2000,
      ).toISOString(),
      metadata: {},
    },
    {
      userId: "user-1",
      action: "execute",
      timestamp: new Date(
        now - 1000,
      ).toISOString(),
      metadata: {},
    },
    {
      userId: "user-2",
      action: "login",
      timestamp: new Date(
        now - 500,
      ).toISOString(),
      metadata: {},
    },
  ];

  const behavior =
    analyzeUserBehavior(activities);

  assert.equal(behavior.length, 2);

  const user1 = behavior.find(
    (item) => item.userId === "user-1",
  );

  const user2 = behavior.find(
    (item) => item.userId === "user-2",
  );

  assert.ok(user1);
  assert.ok(user2);

  assert.equal(user1.actionCount, 3);
  assert.equal(user1.uniqueActions, 2);

  assert.equal(user2.actionCount, 1);
  assert.equal(user2.uniqueActions, 1);

  assert.ok(user1.lastActivity);
  assert.ok(user2.lastActivity);
});

/* ============================================================
   COMPLETE SERVICE COVERAGE
   ============================================================ */

await runTest("analytics module integration", () => {
  const detector = new AnomalyDetector();
  const cache = new CacheManager();
  const metrics = new MetricCollector();
  const usage = new UsageTracker();
  const latency = new LatencyTracker();
  const audit = new AuditLogger();

  const timestamp = new Date().toISOString();

  metrics.collect(
    "requests",
    100,
    {
      environment: "test",
    },
  );

  usage.record(
    "user-1",
    "model-a",
    100,
    10000,
  );

  latency.record(
    "request",
    125,
  );

  audit.log(
    "user-1",
    "execute",
    "analytics",
  );

  const anomaly = detector.detect(
    {
      id: "integration-event",
      metric: "requests",
      value: 200,
      timestamp,
    },
    100,
    0.2,
  );

  cache.set(
    "analytics:last-anomaly",
    anomaly,
  );

  assert.equal(
    metrics.list().length,
    1,
  );

  assert.equal(
    usage.list().length,
    1,
  );

  assert.equal(
    latency.list().length,
    1,
  );

  assert.equal(
    audit.list().length,
    1,
  );

  assert.ok(
    cache.get("analytics:last-anomaly"),
  );
});

/* ============================================================
   FINAL
   ============================================================ */

console.log("");
console.log(
  "All ModelNow Analytics Service tests passed.",
);
