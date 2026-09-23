import assert from "node:assert/strict";
import test from "node:test";

import {
  MonitoringMetrics,
  monitoringMetrics,
} from "./metrics.js";

import {
  MonitoringLogs,
  monitoringLogs,
} from "./logs.js";

import {
  monitoringHealth,
} from "./index.js";

test("MonitoringMetrics registers metrics", () => {
  const metrics = new MonitoringMetrics();

  metrics.registerCounter(
    "api_requests_total",
    "Total API requests",
    "requests",
  );

  metrics.registerGauge(
    "active_requests",
    "Active requests",
    "requests",
  );

  metrics.registerHistogram(
    "request_duration_ms",
    "Request duration",
    "ms",
  );

  assert.equal(metrics.size(), 3);
});

test("counter increments correctly", () => {
  const metrics = new MonitoringMetrics();

  metrics.registerCounter("requests_total");

  assert.equal(metrics.increment("requests_total"), 1);
  assert.equal(metrics.increment("requests_total", 4), 5);
  assert.equal(metrics.get("requests_total"), 5);
});

test("counter supports labels", () => {
  const metrics = new MonitoringMetrics();

  metrics.registerCounter("requests_total");

  metrics.increment("requests_total", 2, {
    method: "GET",
  });

  metrics.increment("requests_total", 3, {
    method: "POST",
  });

  assert.equal(
    metrics.get("requests_total", { method: "GET" }),
    2,
  );

  assert.equal(
    metrics.get("requests_total", { method: "POST" }),
    3,
  );
});

test("gauge works correctly", () => {
  const metrics = new MonitoringMetrics();

  metrics.registerGauge("active_requests");

  metrics.setGauge("active_requests", 10);

  assert.equal(metrics.get("active_requests"), 10);

  metrics.incrementGauge("active_requests", 5);

  assert.equal(metrics.get("active_requests"), 15);

  metrics.incrementGauge("active_requests", -3);

  assert.equal(metrics.get("active_requests"), 12);
});

test("histogram records request latency", () => {
  const metrics = new MonitoringMetrics();

  metrics.registerHistogram("request_latency_ms");

  metrics.observe("request_latency_ms", 10);
  metrics.observe("request_latency_ms", 20);
  metrics.observe("request_latency_ms", 30);
  metrics.observe("request_latency_ms", 40);
  metrics.observe("request_latency_ms", 50);

  const histogram = metrics.getHistogram("request_latency_ms");

  assert.ok(histogram);
  assert.equal(histogram.count, 5);
  assert.equal(histogram.sum, 150);
  assert.equal(histogram.min, 10);
  assert.equal(histogram.max, 50);
  assert.equal(histogram.average, 30);
  assert.equal(histogram.p50, 30);
});

test("metrics snapshot works", () => {
  const metrics = new MonitoringMetrics();

  metrics.registerCounter("api_requests_total");

  metrics.increment("api_requests_total", 10, {
    status: "200",
  });

  const snapshot = metrics.snapshot();

  assert.equal(snapshot.length, 1);
  assert.equal(snapshot[0].name, "api_requests_total");
  assert.equal(snapshot[0].value, 10);
  assert.equal(snapshot[0].labels.status, "200");
});

test("metrics reset works", () => {
  const metrics = new MonitoringMetrics();

  metrics.registerCounter("requests_total");

  metrics.increment("requests_total", 10);

  assert.equal(metrics.get("requests_total"), 10);

  metrics.reset("requests_total");

  assert.equal(metrics.get("requests_total"), 0);
});

test("metric type mismatch throws error", () => {
  const metrics = new MonitoringMetrics();

  metrics.registerCounter("requests_total");

  assert.throws(() => {
    metrics.setGauge("requests_total", 10);
  });
});

test("MonitoringLogs stores structured logs", () => {
  const logs = new MonitoringLogs({
    serviceName: "test-service",
    consoleOutput: false,
  });

  const entry = logs.info("Request completed", {
    requestId: "req-123",
    statusCode: 200,
  });

  assert.equal(entry.level, "info");
  assert.equal(entry.service, "test-service");
  assert.equal(entry.message, "Request completed");
  assert.equal(entry.context?.requestId, "req-123");
  assert.equal(logs.size(), 1);
});

test("MonitoringLogs supports log levels", () => {
  const logs = new MonitoringLogs();

  logs.debug("Debug message");
  logs.info("Info message");
  logs.warn("Warning message");
  logs.error("Error message");
  logs.fatal("Fatal message");

  assert.equal(logs.size(), 5);
});

test("MonitoringLogs redacts sensitive information", () => {
  const logs = new MonitoringLogs();

  const entry = logs.info("Authentication event", {
    username: "prasanth",
    password: "secret-password",
    access_token: "secret-token",
    apiKey: "secret-key",
  });

  assert.equal(entry.context?.username, "prasanth");
  assert.equal(entry.context?.password, "[REDACTED]");
  assert.equal(entry.context?.access_token, "[REDACTED]");
  assert.equal(entry.context?.apiKey, "[REDACTED]");
});

test("MonitoringLogs stores errors", () => {
  const logs = new MonitoringLogs();

  const error = new Error("Database connection failed");

  const entry = logs.error(
    "Database operation failed",
    {
      operation: "query",
    },
    error,
  );

  assert.equal(entry.level, "error");
  assert.equal(entry.error?.name, "Error");
  assert.equal(
    entry.error?.message,
    "Database connection failed",
  );
});

test("MonitoringLogs supports filtering", () => {
  const logs = new MonitoringLogs({
    serviceName: "api-gateway",
  });

  logs.info("Request started", {
    requestId: "req-1",
  });

  logs.error("Request failed", {
    requestId: "req-2",
  });

  logs.info("Request completed", {
    requestId: "req-3",
  });

  const errors = logs.query({
    level: "error",
  });

  assert.equal(errors.length, 1);
  assert.equal(errors[0].message, "Request failed");
});

test("MonitoringLogs respects max entries", () => {
  const logs = new MonitoringLogs({
    maxEntries: 3,
  });

  logs.info("Message 1");
  logs.info("Message 2");
  logs.info("Message 3");
  logs.info("Message 4");

  assert.equal(logs.size(), 3);

  const entries = logs.getAll();

  assert.equal(entries[0].message, "Message 2");
  assert.equal(entries[2].message, "Message 4");
});

test("MonitoringLogs exportJson works", () => {
  const logs = new MonitoringLogs();

  logs.info("Test message");

  const json = logs.exportJson();

  assert.equal(typeof json, "string");

  const parsed = JSON.parse(json) as unknown[];

  assert.equal(parsed.length, 1);
});

test("global monitoring instances are available", () => {
  monitoringMetrics.clear();
  monitoringLogs.clear();

  monitoringMetrics.registerCounter("global_requests_total");
  monitoringMetrics.increment("global_requests_total", 5);

  monitoringLogs.info("Global monitoring test");

  assert.equal(
    monitoringMetrics.get("global_requests_total"),
    5,
  );

  assert.equal(monitoringLogs.size(), 1);
});

test("monitoring health works", () => {
  const health = monitoringHealth();

  assert.equal(typeof health.healthy, "boolean");
  assert.equal(health.metrics.healthy, true);
  assert.equal(health.logs.healthy, true);
  assert.ok(health.timestamp);
});