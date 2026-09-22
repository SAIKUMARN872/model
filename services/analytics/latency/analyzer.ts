// services/analytics/latency/analyzer.ts

import {
  LatencyFilter,
  LatencyRecord,
  LatencyTracker,
} from "./tracker.js";

export interface LatencyStatistics {
  count: number;
  minimum: number;
  maximum: number;
  average: number;
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  total: number;
}

export interface LatencyAnalysis {
  statistics: LatencyStatistics;
  slowRequests: LatencyRecord[];
}

export interface LatencyAnalyzerOptions {
  slowThresholdMs?: number;
}

function calculatePercentile(
  values: number[],
  percentile: number,
): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort(
    (a, b) => a - b,
  );

  const position =
    (sorted.length - 1) *
    percentile;

  const lower = Math.floor(position);
  const upper = Math.ceil(position);

  if (lower === upper) {
    return sorted[lower];
  }

  const weight = position - lower;

  return (
    sorted[lower] +
    (sorted[upper] -
      sorted[lower]) *
      weight
  );
}

export function calculateLatencyStatistics(
  records: LatencyRecord[],
): LatencyStatistics {
  if (records.length === 0) {
    return {
      count: 0,
      minimum: 0,
      maximum: 0,
      average: 0,
      p50: 0,
      p90: 0,
      p95: 0,
      p99: 0,
      total: 0,
    };
  }

  const values = records.map(
    (record) => record.latencyMs,
  );

  const total = values.reduce(
    (sum, value) => sum + value,
    0,
  );

  return {
    count: values.length,
    minimum: Math.min(...values),
    maximum: Math.max(...values),
    average:
      total / values.length,
    p50: calculatePercentile(
      values,
      0.50,
    ),
    p90: calculatePercentile(
      values,
      0.90,
    ),
    p95: calculatePercentile(
      values,
      0.95,
    ),
    p99: calculatePercentile(
      values,
      0.99,
    ),
    total,
  };
}

export class LatencyAnalyzer {
  private readonly tracker: LatencyTracker;

  private readonly slowThresholdMs: number;

  constructor(
    tracker: LatencyTracker,
    options: LatencyAnalyzerOptions = {},
  ) {
    this.tracker = tracker;

    const threshold =
      options.slowThresholdMs ?? 1000;

    if (
      !Number.isFinite(threshold) ||
      threshold < 0
    ) {
      throw new Error(
        "Slow threshold must be a non-negative finite number",
      );
    }

    this.slowThresholdMs = threshold;
  }

  analyze(
    filter: LatencyFilter = {},
  ): LatencyAnalysis {
    const records =
      this.tracker.find(filter);

    const statistics =
      calculateLatencyStatistics(
        records,
      );

    const slowRequests =
      records.filter(
        (record) =>
          record.latencyMs >=
          this.slowThresholdMs,
      );

    return {
      statistics,
      slowRequests,
    };
  }

  getStatistics(
    filter: LatencyFilter = {},
  ): LatencyStatistics {
    return this.analyze(filter)
      .statistics;
  }

  getSlowRequests(
    filter: LatencyFilter = {},
  ): LatencyRecord[] {
    return this.analyze(filter)
      .slowRequests;
  }

  getSlowThreshold(): number {
    return this.slowThresholdMs;
  }
}