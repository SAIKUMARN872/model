// services/analytics/metrics/processor.ts

import {
  MetricFilter,
  MetricRecord,
} from "./collector.js";

export interface MetricStatistics {
  count: number;
  sum: number;
  average: number;
  minimum: number;
  maximum: number;
  p50: number;
  p90: number;
  p95: number;
  p99: number;
}

export interface MetricAggregation {
  name: string;
  statistics: MetricStatistics;
}

export interface ProcessedMetrics {
  totalRecords: number;
  statistics: MetricStatistics;
  byMetric: MetricAggregation[];
}

export interface TopMetric {
  name: string;
  count: number;
  total: number;
  average: number;
}

function percentile(
  values: number[],
  value: number,
): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort(
    (a, b) => a - b,
  );

  const position =
    (sorted.length - 1) * value;

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

export function calculateMetricStatistics(
  records: MetricRecord[],
): MetricStatistics {
  if (records.length === 0) {
    return {
      count: 0,
      sum: 0,
      average: 0,
      minimum: 0,
      maximum: 0,
      p50: 0,
      p90: 0,
      p95: 0,
      p99: 0,
    };
  }

  const values = records.map(
    (record) => record.value,
  );

  const sum = values.reduce(
    (total, value) =>
      total + value,
    0,
  );

  return {
    count: values.length,
    sum,
    average:
      sum / values.length,
    minimum: Math.min(...values),
    maximum: Math.max(...values),
    p50: percentile(
      values,
      0.50,
    ),
    p90: percentile(
      values,
      0.90,
    ),
    p95: percentile(
      values,
      0.95,
    ),
    p99: percentile(
      values,
      0.99,
    ),
  };
}

export function processMetrics(
  records: MetricRecord[],
): ProcessedMetrics {
  const groups =
    new Map<string, MetricRecord[]>();

  for (const record of records) {
    const existing =
      groups.get(record.name);

    if (existing) {
      existing.push(record);
    } else {
      groups.set(record.name, [
        record,
      ]);
    }
  }

  const byMetric: MetricAggregation[] =
    Array.from(groups.entries()).map(
      ([name, metricRecords]) => ({
        name,
        statistics:
          calculateMetricStatistics(
            metricRecords,
          ),
      }),
    );

  byMetric.sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return {
    totalRecords:
      records.length,
    statistics:
      calculateMetricStatistics(
        records,
      ),
    byMetric,
  };
}

export function filterAndProcessMetrics(
  records: MetricRecord[],
  filter: MetricFilter = {},
): ProcessedMetrics {
  const filtered = records.filter(
    (record) => {
      if (
        filter.organizationId !==
          undefined &&
        record.organizationId !==
          filter.organizationId
      ) {
        return false;
      }

      if (
        filter.name !== undefined &&
        record.name !== filter.name
      ) {
        return false;
      }

      if (
        filter.type !== undefined &&
        record.type !== filter.type
      ) {
        return false;
      }

      if (
        filter.provider !== undefined &&
        record.provider !==
          filter.provider
      ) {
        return false;
      }

      if (
        filter.model !== undefined &&
        record.model !== filter.model
      ) {
        return false;
      }

      return true;
    },
  );

  return processMetrics(filtered);
}

export function getTopMetrics(
  records: MetricRecord[],
  limit = 10,
): TopMetric[] {
  if (
    !Number.isInteger(limit) ||
    limit <= 0
  ) {
    throw new Error(
      "Limit must be a positive integer",
    );
  }

  const groups =
    new Map<string, MetricRecord[]>();

  for (const record of records) {
    const existing =
      groups.get(record.name);

    if (existing) {
      existing.push(record);
    } else {
      groups.set(record.name, [
        record,
      ]);
    }
  }

  const result: TopMetric[] =
    Array.from(groups.entries()).map(
      ([name, metricRecords]) => {
        const total =
          metricRecords.reduce(
            (sum, record) =>
              sum + record.value,
            0,
          );

        return {
          name,
          count:
            metricRecords.length,
          total,
          average:
            total /
            metricRecords.length,
        };
      },
    );

  return result
    .sort((a, b) => {
      if (b.total !== a.total) {
        return b.total - a.total;
      }

      return a.name.localeCompare(
        b.name,
      );
    })
    .slice(0, limit);
}