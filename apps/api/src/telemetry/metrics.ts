const METHODS = new Set([
  "GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "OTHER",
]);

const BUCKETS = Object.freeze([
  5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000,
] as const);

type Method =
  | "GET" | "HEAD" | "POST" | "PUT" | "PATCH"
  | "DELETE" | "OPTIONS" | "OTHER";

type StatusClass = "1xx" | "2xx" | "3xx" | "4xx" | "5xx" | "other";

interface Series {
  requests: number;
  durationSumMs: number;
  buckets: number[];
}

export interface HttpMetricInput {
  readonly method: string;
  readonly statusCode: number;
  readonly durationMs: number;
}

export interface HttpMetricSnapshot {
  readonly requestCount: number;
  readonly durationSumMs: number;
  readonly seriesCount: number;
}

const measurements = new Map<string, Series>();
let requestCount = 0;
let durationSumMs = 0;

function normalizeMethod(value: string): Method {
  const method = value.toUpperCase();
  return METHODS.has(method) ? method as Method : "OTHER";
}

function normalizeStatus(value: number): StatusClass {
  if (!Number.isInteger(value) || value < 100 || value > 599) {
    return "other";
  }
  return `${Math.floor(value / 100)}xx` as StatusClass;
}

export function recordHttpRequest(input: HttpMetricInput): void {
  const method = normalizeMethod(input.method);
  const status = normalizeStatus(input.statusCode);
  const duration =
    Number.isFinite(input.durationMs) && input.durationMs >= 0
      ? input.durationMs
      : 0;

  const key = `${method}|${status}`;
  let item = measurements.get(key);

  if (!item) {
    item = {
      requests: 0,
      durationSumMs: 0,
      buckets: BUCKETS.map(() => 0),
    };
    measurements.set(key, item);
  }

  item.requests += 1;
  item.durationSumMs += duration;

  for (let i = 0; i < BUCKETS.length; i += 1) {
    if (duration <= BUCKETS[i]) {
      item.buckets[i] += 1;
    }
  }

  requestCount += 1;
  durationSumMs += duration;
}

export function getHttpMetricSnapshot(): HttpMetricSnapshot {
  return Object.freeze({
    requestCount,
    durationSumMs,
    seriesCount: measurements.size,
  });
}

export function renderPrometheusMetrics(): string {
  const lines = [
    "# HELP modelnow_http_requests_total Total completed HTTP requests.",
    "# TYPE modelnow_http_requests_total counter",
  ];

  for (const [key, item] of measurements) {
    const [method, status] = key.split("|");
    lines.push(
      `modelnow_http_requests_total{method="${method}",status_class="${status}"} ${item.requests}`,
    );
  }

  lines.push(
    "# HELP modelnow_http_request_duration_ms HTTP request duration in milliseconds.",
    "# TYPE modelnow_http_request_duration_ms histogram",
  );

  for (const [key, item] of measurements) {
    const [method, status] = key.split("|");
    const labels = `method="${method}",status_class="${status}"`;
    for (let i = 0; i < BUCKETS.length; i += 1) {
      lines.push(
        `modelnow_http_request_duration_ms_bucket{${labels},le="${BUCKETS[i]}"} ${item.buckets[i]}`,
      );
    }

    lines.push(
      `modelnow_http_request_duration_ms_bucket{${labels},le="+Inf"} ${item.requests}`,
      `modelnow_http_request_duration_ms_sum{${labels}} ${item.durationSumMs}`,
      `modelnow_http_request_duration_ms_count{${labels}} ${item.requests}`,
    );
  }

  return `${lines.join("\n")}\n`;
}

/** Intended for isolated tests; do not call during normal server operation. */
export function resetHttpMetricsForTests(): void {
  measurements.clear();
  requestCount = 0;
  durationSumMs = 0;
}

export const HTTP_DURATION_BUCKETS_MS = BUCKETS;