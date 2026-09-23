import assert from "node:assert/strict";
import { test } from "node:test";

import {
  MetricsCollector,
  MetricsRegistry,
} from "./index.js";

test("registers counter metric", () => {
  const registry =
    new MetricsRegistry();

  registry.registerCounter(
    "requests_total",
    "Total requests",
    "requests",
  );

  const definition =
    registry.getDefinition(
      "requests_total",
    );

  assert.ok(definition);

  assert.equal(
    definition.name,
    "requests_total",
  );

  assert.equal(
    definition.type,
    "counter",
  );
});

test("counter increments correctly", () => {
  const registry =
    new MetricsRegistry();

  registry.registerCounter(
    "requests_total",
  );

  registry.increment(
    "requests_total",
  );

  registry.increment(
    "requests_total",
    4,
  );

  assert.equal(
    registry.getCounter(
      "requests_total",
    ),
    5,
  );
});

test("counter supports labels", () => {
  const registry =
    new MetricsRegistry();

  registry.registerCounter(
    "requests_total",
  );

  registry.increment(
    "requests_total",
    3,
    {
      method: "GET",
    },
  );

  registry.increment(
    "requests_total",
    2,
    {
      method: "POST",
    },
  );

  assert.equal(
    registry.getCounter(
      "requests_total",
      {
        method: "GET",
      },
    ),
    3,
  );

  assert.equal(
    registry.getCounter(
      "requests_total",
      {
        method: "POST",
      },
    ),
    2,
  );
});

test("gauge can be set", () => {
  const registry =
    new MetricsRegistry();

  registry.registerGauge(
    "active_requests",
  );

  registry.setGauge(
    "active_requests",
    10,
  );

  assert.equal(
    registry.getGauge(
      "active_requests",
    ),
    10,
  );
});

test("gauge can increment and decrement", () => {
  const registry =
    new MetricsRegistry();

  registry.registerGauge(
    "active_requests",
  );

  registry.incrementGauge(
    "active_requests",
  );

  registry.incrementGauge(
    "active_requests",
    4,
  );

  registry.decrementGauge(
    "active_requests",
    2,
  );

  assert.equal(
    registry.getGauge(
      "active_requests",
    ),
    3,
  );
});

test("histogram calculates statistics", () => {
  const registry =
    new MetricsRegistry();

  registry.registerHistogram(
    "request_duration_ms",
  );

  registry.observe(
    "request_duration_ms",
    10,
  );

  registry.observe(
    "request_duration_ms",
    20,
  );

  registry.observe(
    "request_duration_ms",
    30,
  );

  registry.observe(
    "request_duration_ms",
    40,
  );

  registry.observe(
    "request_duration_ms",
    50,
  );

  const histogram =
    registry.getHistogram(
      "request_duration_ms",
    );

  assert.equal(
    histogram.count,
    5,
  );

  assert.equal(
    histogram.sum,
    150,
  );

  assert.equal(
    histogram.min,
    10,
  );

  assert.equal(
    histogram.max,
    50,
  );

  assert.equal(
    histogram.average,
    30,
  );

  assert.equal(
    histogram.p50,
    30,
  );

  assert.equal(
    histogram.p95,
    48,
  );
});

test("unregistered metric throws error", () => {
  const registry =
    new MetricsRegistry();

  assert.throws(
    () => {
      registry.increment(
        "unknown_metric",
      );
    },
    /Metric is not registered/,
  );
});

test("wrong metric type throws error", () => {
  const registry =
    new MetricsRegistry();

  registry.registerGauge(
    "memory_usage",
  );

  assert.throws(
    () => {
      registry.increment(
        "memory_usage",
      );
    },
    /expected 'counter'/,
  );
});

test("duplicate metric registration throws error", () => {
  const registry =
    new MetricsRegistry();

  registry.registerCounter(
    "requests_total",
  );

  assert.throws(
    () => {
      registry.registerCounter(
        "requests_total",
      );
    },
    /Metric already registered/,
  );
});

test("request metrics are collected", () => {
  const registry =
    new MetricsRegistry();

  const collector =
    new MetricsCollector(registry);

  collector.recordRequest({
    method: "GET",
    route: "/api/users",
    statusCode: 200,
    durationMs: 125,
  });

  assert.equal(
    registry.getCounter(
      "http_requests_total",
      {
        method: "GET",
        route: "/api/users",
        status_code: 200,
      },
    ),
    1,
  );

  const histogram =
    registry.getHistogram(
      "http_request_duration_ms",
      {
        method: "GET",
        route: "/api/users",
      },
    );

  assert.equal(
    histogram.count,
    1,
  );

  assert.equal(
    histogram.average,
    125,
  );
});

test("HTTP errors are collected", () => {
  const registry =
    new MetricsRegistry();

  const collector =
    new MetricsCollector(registry);

  collector.recordRequest({
    method: "POST",
    route: "/api/users",
    statusCode: 500,
    durationMs: 250,
  });

  assert.equal(
    registry.getCounter(
      "http_errors_total",
      {
        method: "POST",
        route: "/api/users",
        status_code: 500,
      },
    ),
    1,
  );
});

test("model metrics are collected", () => {
  const registry =
    new MetricsRegistry();

  const collector =
    new MetricsCollector(registry);

  collector.recordModelRequest({
    provider: "openai",
    model: "gpt-model",
    durationMs: 500,
    inputTokens: 100,
    outputTokens: 50,
    success: true,
  });

  const labels = {
    provider: "openai",
    model: "gpt-model",
  };

  assert.equal(
    registry.getCounter(
      "model_requests_total",
      labels,
    ),
    1,
  );

  assert.equal(
    registry.getCounter(
      "model_input_tokens_total",
      labels,
    ),
    100,
  );

  assert.equal(
    registry.getCounter(
      "model_output_tokens_total",
      labels,
    ),
    50,
  );

  const histogram =
    registry.getHistogram(
      "model_request_duration_ms",
      labels,
    );

  assert.equal(
    histogram.average,
    500,
  );
});

test("model errors are collected", () => {
  const registry =
    new MetricsRegistry();

  const collector =
    new MetricsCollector(registry);

  collector.recordModelRequest({
    provider: "openai",
    model: "gpt-model",
    durationMs: 800,
    success: false,
  });

  assert.equal(
    registry.getCounter(
      "model_errors_total",
      {
        provider: "openai",
        model: "gpt-model",
      },
    ),
    1,
  );
});

test("cache metrics are collected", () => {
  const registry =
    new MetricsRegistry();

  const collector =
    new MetricsCollector(registry);

  collector.recordCacheHit("redis");

  collector.recordCacheMiss("redis");

  assert.equal(
    registry.getCounter(
      "cache_hits_total",
      {
        cache: "redis",
      },
    ),
    1,
  );

  assert.equal(
    registry.getCounter(
      "cache_misses_total",
      {
        cache: "redis",
      },
    ),
    1,
  );
});

test("active request gauge works", () => {
  const registry =
    new MetricsRegistry();

  const collector =
    new MetricsCollector(registry);

  collector.setActiveRequests(5);

  collector.incrementActiveRequests();

  collector.decrementActiveRequests();

  assert.equal(
    registry.getGauge(
      "active_requests",
    ),
    5,
  );
});

test("authentication metrics work", () => {
  const registry =
    new MetricsRegistry();

  const collector =
    new MetricsCollector(registry);

  collector.recordAuthentication(
    "success",
  );

  collector.recordAuthentication(
    "failure",
  );

  assert.equal(
    registry.getCounter(
      "authentication_attempts_total",
      {
        outcome: "success",
      },
    ),
    1,
  );

  assert.equal(
    registry.getCounter(
      "authentication_attempts_total",
      {
        outcome: "failure",
      },
    ),
    1,
  );
});

test("authorization metrics work", () => {
  const registry =
    new MetricsRegistry();

  const collector =
    new MetricsCollector(registry);

  collector.recordAuthorization(
    "allowed",
  );

  collector.recordAuthorization(
    "denied",
  );

  assert.equal(
    registry.getCounter(
      "authorization_checks_total",
      {
        outcome: "allowed",
      },
    ),
    1,
  );

  assert.equal(
    registry.getCounter(
      "authorization_checks_total",
      {
        outcome: "denied",
      },
    ),
    1,
  );
});

test("snapshot returns metrics", () => {
  const registry =
    new MetricsRegistry();

  const collector =
    new MetricsCollector(registry);

  collector.recordRequest({
    method: "GET",
    route: "/health",
    statusCode: 200,
    durationMs: 20,
  });

  const snapshot =
    collector.snapshot();

  assert.ok(
    snapshot.length > 0,
  );

  const requestMetric =
    snapshot.find(
      (metric) =>
        metric.name ===
        "http_requests_total",
    );

  assert.ok(requestMetric);

  assert.equal(
    requestMetric?.type,
    "counter",
  );
});

test("health returns metric information", () => {
  const registry =
    new MetricsRegistry();

  const collector =
    new MetricsCollector(registry);

  const health =
    collector.health();

  assert.equal(
    health.status,
    "healthy",
  );

  assert.ok(
    health.registeredMetrics > 0,
  );
});

test("reset removes metric values", () => {
  const registry =
    new MetricsRegistry();

  const collector =
    new MetricsCollector(registry);

  collector.recordRequest({
    method: "GET",
    route: "/test",
    statusCode: 200,
    durationMs: 100,
  });

  registry.reset();

  assert.equal(
    registry.getCounter(
      "http_requests_total",
      {
        method: "GET",
        route: "/test",
        status_code: 200,
      },
    ),
    0,
  );

  assert.equal(
    registry.getHistogram(
      "http_request_duration_ms",
      {
        method: "GET",
        route: "/test",
      },
    ).count,
    0,
  );

  assert.ok(
    registry.getDefinition(
      "http_requests_total",
    ),
  );
});

test("clear removes definitions and values", () => {
  const registry =
    new MetricsRegistry();

  registry.registerCounter(
    "test_counter",
  );

  registry.increment(
    "test_counter",
  );

  registry.clear();

  assert.equal(
    registry.size(),
    0,
  );

  assert.equal(
    registry.getDefinition(
      "test_counter",
    ),
    undefined,
  );
});