import test from "node:test";
import assert from "node:assert/strict";

import {
  HTTP_DURATION_BUCKETS_MS,
  getHttpMetricSnapshot,
  recordHttpRequest,
  renderPrometheusMetrics,
  resetHttpMetricsForTests,
  telemetryLogger,
  createTraceContext,
  formatTraceparent,
  parseTraceparent,
} from "./index.js";

test("telemetry logger exposes all standard levels", () => {
  for (const level of ["debug", "info", "warn", "error"] as const) {
    assert.equal(typeof telemetryLogger[level], "function");
  }
});

test("metrics start empty and record completed requests", () => {
  resetHttpMetricsForTests();

  assert.deepEqual(getHttpMetricSnapshot(), {
    requestCount: 0,
    durationSumMs: 0,
    seriesCount: 0,
  });

  recordHttpRequest({
    method: "GET",
    statusCode: 200,
    durationMs: 12.5,
  });

  recordHttpRequest({
    method: "POST",
    statusCode: 503,
    durationMs: 37.5,
  });

  assert.deepEqual(getHttpMetricSnapshot(), {
    requestCount: 2,
    durationSumMs: 50,
    seriesCount: 2,
  });
});

test("metrics normalize unbounded method and status values", () => {
  resetHttpMetricsForTests();

  recordHttpRequest({
    method: "UNRECOGNIZED_METHOD",
    statusCode: 0,
    durationMs: 1,
  });

  const output = renderPrometheusMetrics();

  assert.match(
    output,
    /modelnow_http_requests_total\{method="OTHER",status_class="other"\} 1/,
  );
});

test("Prometheus histogram buckets are cumulative and valid", () => {
  resetHttpMetricsForTests();

  recordHttpRequest({
    method: "GET",
    statusCode: 200,
    durationMs: 7,
  });

  recordHttpRequest({
    method: "GET",
    statusCode: 200,
    durationMs: 200,
  });

  const output = renderPrometheusMetrics();
  const valueFor = (bound: string): number => {
    const escaped = bound.replace(/[+]/g, "\\+");
    const expression = new RegExp(
      `modelnow_http_request_duration_ms_bucket\\{method="GET",status_class="2xx",le="${escaped}"\\} (\\d+)`,
    );
    const match = output.match(expression);

    assert.ok(match, `Missing histogram bucket ${bound}`);
    return Number(match[1]);
  };

  assert.equal(valueFor("5"), 0);
  assert.equal(valueFor("10"), 1);
  assert.equal(valueFor("100"), 1);
  assert.equal(valueFor("250"), 2);
  assert.equal(valueFor("+Inf"), 2);
  assert.ok(HTTP_DURATION_BUCKETS_MS.length > 0);
});

test("invalid durations are safely normalized", () => {
  resetHttpMetricsForTests();

  recordHttpRequest({
    method: "GET",
    statusCode: 200,
    durationMs: Number.NaN,
  });

  assert.equal(getHttpMetricSnapshot().requestCount, 1);
  assert.equal(getHttpMetricSnapshot().durationSumMs, 0);
});

test("trace context generation produces valid W3C version 00 values", () => {
  const context = createTraceContext();
  const header = formatTraceparent(context);

  assert.equal(header.length, 55);
  assert.deepEqual(parseTraceparent(header), context);
  assert.match(context.traceId, /^[0-9a-f]{32}$/);
  assert.match(context.spanId, /^[0-9a-f]{16}$/);
});

test("traceparent parser rejects malformed and zero identifiers", () => {
  assert.equal(parseTraceparent(undefined), undefined);
  assert.equal(parseTraceparent(""), undefined);
  assert.equal(parseTraceparent("not-a-trace"), undefined);
  assert.equal(
    parseTraceparent("00-00000000000000000000000000000000-1234567890123456-00"),
    undefined,
  );
  assert.equal(
    parseTraceparent("00-12345678901234567890123456789012-0000000000000000-00"),
    undefined,
  );
  assert.equal(
    parseTraceparent("00-12345678901234567890123456789012-1234567890123456-gg"),
    undefined,
  );
});

test("traceparent formatter rejects invalid contexts", () => {
  assert.throws(
    () => formatTraceparent({
      traceId: "00000000000000000000000000000000",
      spanId: "1234567890123456",
      traceFlags: "00",
    }),
    TypeError,
  );
});

test("test reset clears metrics between isolated runs", () => {
  resetHttpMetricsForTests();

  recordHttpRequest({
    method: "DELETE",
    statusCode: 204,
    durationMs: 3,
  });

  resetHttpMetricsForTests();

  assert.deepEqual(getHttpMetricSnapshot(), {
    requestCount: 0,
    durationSumMs: 0,
    seriesCount: 0,
  });
});