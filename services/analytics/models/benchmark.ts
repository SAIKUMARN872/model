// services/analytics/models/benchmark.ts

import {
  ModelMetricRecord,
  ModelMetricsStore,
} from "./model_metrics.js";

export interface ModelBenchmark {
  provider: string;
  model: string;
  requestCount: number;
  averageLatency: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
  totalTokens: number;
  totalCost: number;
  averageQuality: number;
  errorCount: number;
  errorRate: number;
}

export interface BenchmarkFilter {
  organizationId?: string;
  provider?: string;
  model?: string;
}

function percentile(
  values: number[],
  percentileValue: number,
): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort(
    (a, b) => a - b,
  );

  const position =
    (sorted.length - 1) *
    percentileValue;

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

function average(
  values: number[],
): number {
  if (values.length === 0) {
    return 0;
  }

  return (
    values.reduce(
      (sum, value) => sum + value,
      0,
    ) / values.length
  );
}

function buildBenchmark(
  records: ModelMetricRecord[],
  provider: string,
  model: string,
): ModelBenchmark {
  const modelRecords =
    records.filter(
      (record) =>
        record.provider === provider &&
        record.model === model,
    );

  const requestRecords =
    modelRecords.filter(
      (record) =>
        record.metricType ===
        "request",
    );

  const latencyRecords =
    modelRecords.filter(
      (record) =>
        record.metricType ===
        "latency",
    );

  const tokenRecords =
    modelRecords.filter(
      (record) =>
        record.metricType ===
        "token",
    );

  const costRecords =
    modelRecords.filter(
      (record) =>
        record.metricType ===
        "cost",
    );

  const qualityRecords =
    modelRecords.filter(
      (record) =>
        record.metricType ===
        "quality",
    );

  const errorRecords =
    modelRecords.filter(
      (record) =>
        record.metricType ===
        "error",
    );

  const latencyValues =
    latencyRecords.map(
      (record) => record.value,
    );

  const totalTokens =
    tokenRecords.reduce(
      (sum, record) =>
        sum + record.value,
      0,
    );

  const totalCost =
    costRecords.reduce(
      (sum, record) =>
        sum + record.value,
      0,
    );

  const errorCount =
    errorRecords.reduce(
      (sum, record) =>
        sum + record.value,
      0,
    );

  const requestCount =
    requestRecords.reduce(
      (sum, record) =>
        sum + record.value,
      0,
    );

  const errorRate =
    requestCount > 0
      ? (errorCount /
          requestCount) *
        100
      : 0;

  return {
    provider,
    model,
    requestCount,
    averageLatency:
      average(latencyValues),
    p50Latency: percentile(
      latencyValues,
      0.5,
    ),
    p95Latency: percentile(
      latencyValues,
      0.95,
    ),
    p99Latency: percentile(
      latencyValues,
      0.99,
    ),
    totalTokens,
    totalCost,
    averageQuality:
      average(
        qualityRecords.map(
          (record) => record.value,
        ),
      ),
    errorCount,
    errorRate,
  };
}

export function benchmarkModels(
  store: ModelMetricsStore,
  filter: BenchmarkFilter = {},
): ModelBenchmark[] {
  const records =
    store.find({
      organizationId:
        filter.organizationId,
      provider:
        filter.provider,
      model:
        filter.model,
    });

  const combinations =
    new Map<
      string,
      {
        provider: string;
        model: string;
      }
    >();

  for (const record of records) {
    const key = `${record.provider}::${record.model}`;

    if (!combinations.has(key)) {
      combinations.set(key, {
        provider:
          record.provider,
        model:
          record.model,
      });
    }
  }

  return Array.from(
    combinations.values(),
  )
    .map((item) =>
      buildBenchmark(
        records,
        item.provider,
        item.model,
      ),
    )
    .sort((a, b) => {
      const providerCompare =
        a.provider.localeCompare(
          b.provider,
        );

      if (
        providerCompare !== 0
      ) {
        return providerCompare;
      }

      return a.model.localeCompare(
        b.model,
      );
    });
}

export function compareModels(
  benchmarks: ModelBenchmark[],
  metric:
    | "requestCount"
    | "averageLatency"
    | "p95Latency"
    | "p99Latency"
    | "totalTokens"
    | "totalCost"
    | "averageQuality"
    | "errorRate",
): ModelBenchmark[] {
  return [...benchmarks].sort(
    (a, b) =>
      a[metric] - b[metric],
  );
}