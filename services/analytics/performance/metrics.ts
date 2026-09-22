// services/analytics/performance/metrics.ts

export type PerformanceMetricType =
  | "latency"
  | "throughput"
  | "error_rate"
  | "success_rate"
  | "token_usage"
  | "request"
  | "cost"
  | "quality"
  | "cache_hit_rate"
  | "custom";

export interface PerformanceMetric {
  id: string;
  organizationId: string;
  metricType: PerformanceMetricType;
  name: string;
  value: number;
  unit: string;
  provider?: string;
  model?: string;
  operation?: string;
  requestId?: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface CreatePerformanceMetricInput {
  organizationId: string;
  metricType: PerformanceMetricType;
  name: string;
  value: number;
  unit: string;
  provider?: string;
  model?: string;
  operation?: string;
  requestId?: string;
  timestamp?: number;
  metadata?: Record<string, unknown>;
}

export interface PerformanceMetricFilter {
  organizationId?: string;
  metricType?: PerformanceMetricType;
  name?: string;
  provider?: string;
  model?: string;
  operation?: string;
  requestId?: string;
  minValue?: number;
  maxValue?: number;
  startTime?: number;
  endTime?: number;
}

export interface PerformanceMetricStatistics {
  count: number;
  sum: number;
  average: number;
  min: number;
  max: number;
  p50: number;
  p90: number;
  p95: number;
  p99: number;
}

export interface PerformanceMetricsOptions {
  maxRecords?: number;
  retentionMs?: number;
}

export interface PerformanceMetricsHealth {
  healthy: boolean;
  connected: boolean;
  records: number;
  organizations: number;
  maxRecords: number;
  retentionMs: number;
}

const DEFAULT_MAX_RECORDS = 100_000;
const DEFAULT_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

const VALID_TYPES: PerformanceMetricType[] = [
  "latency",
  "throughput",
  "error_rate",
  "success_rate",
  "token_usage",
  "request",
  "cost",
  "quality",
  "cache_hit_rate",
  "custom",
];

function createId(): string {
  return `performance_metric_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 12)}`;
}

function cloneMetadata(
  metadata?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!metadata) {
    return undefined;
  }

  return JSON.parse(JSON.stringify(metadata)) as Record<
    string,
    unknown
  >;
}

function cloneMetric(
  metric: PerformanceMetric,
): PerformanceMetric {
  return {
    ...metric,
    metadata: cloneMetadata(metric.metadata),
  };
}

export function validateOrganizationId(value: string): void {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    throw new Error("Organization ID is required");
  }
}

export function validateMetricName(value: string): void {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    throw new Error("Metric name is required");
  }
}

export function validateMetricUnit(value: string): void {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    throw new Error("Metric unit is required");
  }
}

export function validateMetricType(
  value: PerformanceMetricType,
): void {
  if (!VALID_TYPES.includes(value)) {
    throw new Error(`Invalid performance metric type: ${value}`);
  }
}

export function validateMetricValue(value: number): void {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    throw new Error("Metric value must be a finite number");
  }
}

function percentile(
  values: number[],
  percentileValue: number,
): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);

  const position =
    (percentileValue / 100) * (sorted.length - 1);

  const lower = Math.floor(position);
  const upper = Math.ceil(position);

  if (lower === upper) {
    return sorted[lower];
  }

  const weight = position - lower;

  return (
    sorted[lower] +
    (sorted[upper] - sorted[lower]) * weight
  );
}

export function calculateStatistics(
  values: number[],
): PerformanceMetricStatistics {
  if (values.length === 0) {
    return {
      count: 0,
      sum: 0,
      average: 0,
      min: 0,
      max: 0,
      p50: 0,
      p90: 0,
      p95: 0,
      p99: 0,
    };
  }

  const sum = values.reduce(
    (total, value) => total + value,
    0,
  );

  return {
    count: values.length,
    sum,
    average: sum / values.length,
    min: Math.min(...values),
    max: Math.max(...values),
    p50: percentile(values, 50),
    p90: percentile(values, 90),
    p95: percentile(values, 95),
    p99: percentile(values, 99),
  };
}

export class PerformanceMetricsStore {
  private readonly records =
    new Map<string, PerformanceMetric>();

  private connected = false;

  private readonly maxRecords: number;

  private readonly retentionMs: number;

  constructor(
    options: PerformanceMetricsOptions = {},
  ) {
    this.maxRecords =
      options.maxRecords ?? DEFAULT_MAX_RECORDS;

    this.retentionMs =
      options.retentionMs ?? DEFAULT_RETENTION_MS;

    if (
      !Number.isInteger(this.maxRecords) ||
      this.maxRecords <= 0
    ) {
      throw new Error(
        "maxRecords must be a positive integer",
      );
    }

    if (
      !Number.isFinite(this.retentionMs) ||
      this.retentionMs <= 0
    ) {
      throw new Error(
        "retentionMs must be a positive number",
      );
    }
  }

  connect(): void {
    this.connected = true;
    this.removeExpired();
    this.enforceRetention();
  }

  disconnect(): void {
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  record(
    input: CreatePerformanceMetricInput,
  ): PerformanceMetric {
    this.ensureConnected();

    validateOrganizationId(input.organizationId);
    validateMetricType(input.metricType);
    validateMetricName(input.name);
    validateMetricUnit(input.unit);
    validateMetricValue(input.value);

    const timestamp = input.timestamp ?? Date.now();

    if (
      !Number.isFinite(timestamp) ||
      timestamp <= 0
    ) {
      throw new Error(
        "timestamp must be a positive number",
      );
    }

    const metric: PerformanceMetric = {
      id: createId(),
      organizationId: input.organizationId,
      metricType: input.metricType,
      name: input.name,
      value: input.value,
      unit: input.unit,
      provider: input.provider,
      model: input.model,
      operation: input.operation,
      requestId: input.requestId,
      timestamp,
      metadata: cloneMetadata(input.metadata),
    };

    this.records.set(metric.id, metric);

    this.removeExpired();
    this.enforceRetention();

    return cloneMetric(metric);
  }

  getById(
    id: string,
  ): PerformanceMetric | undefined {
    this.ensureConnected();

    const metric = this.records.get(id);

    if (!metric) {
      return undefined;
    }

    if (this.isExpired(metric)) {
      this.records.delete(id);
      return undefined;
    }

    return cloneMetric(metric);
  }

  find(
    filter: PerformanceMetricFilter = {},
  ): PerformanceMetric[] {
    this.ensureConnected();

    this.removeExpired();

    return [...this.records.values()]
      .filter((metric) => {
        if (
          filter.organizationId !== undefined &&
          metric.organizationId !== filter.organizationId
        ) {
          return false;
        }

        if (
          filter.metricType !== undefined &&
          metric.metricType !== filter.metricType
        ) {
          return false;
        }

        if (
          filter.name !== undefined &&
          metric.name !== filter.name
        ) {
          return false;
        }

        if (
          filter.provider !== undefined &&
          metric.provider !== filter.provider
        ) {
          return false;
        }

        if (
          filter.model !== undefined &&
          metric.model !== filter.model
        ) {
          return false;
        }

        if (
          filter.operation !== undefined &&
          metric.operation !== filter.operation
        ) {
          return false;
        }

        if (
          filter.requestId !== undefined &&
          metric.requestId !== filter.requestId
        ) {
          return false;
        }

        if (
          filter.minValue !== undefined &&
          metric.value < filter.minValue
        ) {
          return false;
        }

        if (
          filter.maxValue !== undefined &&
          metric.value > filter.maxValue
        ) {
          return false;
        }

        if (
          filter.startTime !== undefined &&
          metric.timestamp < filter.startTime
        ) {
          return false;
        }

        if (
          filter.endTime !== undefined &&
          metric.timestamp > filter.endTime
        ) {
          return false;
        }

        return true;
      })
      .sort(
        (a, b) => a.timestamp - b.timestamp,
      )
      .map(cloneMetric);
  }

  getAll(): PerformanceMetric[] {
    return this.find();
  }

  getOrganizationMetrics(
    organizationId: string,
  ): PerformanceMetric[] {
    validateOrganizationId(organizationId);

    return this.find({ organizationId });
  }

  getStatistics(
    filter: PerformanceMetricFilter = {},
  ): PerformanceMetricStatistics {
    const records = this.find(filter);

    return calculateStatistics(
      records.map((record) => record.value),
    );
  }

  clearOrganization(
    organizationId: string,
  ): number {
    this.ensureConnected();

    validateOrganizationId(organizationId);

    let deleted = 0;

    for (const [
      id,
      metric,
    ] of this.records.entries()) {
      if (metric.organizationId === organizationId) {
        this.records.delete(id);
        deleted++;
      }
    }

    return deleted;
  }

  clear(): number {
    this.ensureConnected();

    const count = this.records.size;

    this.records.clear();

    return count;
  }

  size(): number {
    return this.records.size;
  }

  getOrganizationIds(): string[] {
    this.ensureConnected();

    this.removeExpired();

    return [
      ...new Set(
        [...this.records.values()].map(
          (metric) => metric.organizationId,
        ),
      ),
    ];
  }

  health(): PerformanceMetricsHealth {
    this.removeExpired();

    return {
      healthy: this.connected,
      connected: this.connected,
      records: this.records.size,
      organizations: new Set(
        [...this.records.values()].map(
          (metric) => metric.organizationId,
        ),
      ).size,
      maxRecords: this.maxRecords,
      retentionMs: this.retentionMs,
    };
  }

  private ensureConnected(): void {
    if (!this.connected) {
      throw new Error(
        "Performance metrics store is not connected",
      );
    }
  }

  private isExpired(
    metric: PerformanceMetric,
  ): boolean {
    return (
      metric.timestamp <
      Date.now() - this.retentionMs
    );
  }

  private removeExpired(): void {
    const cutoff =
      Date.now() - this.retentionMs;

    for (const [
      id,
      metric,
    ] of this.records.entries()) {
      if (metric.timestamp < cutoff) {
        this.records.delete(id);
      }
    }
  }

  private enforceRetention(): void {
    while (this.records.size > this.maxRecords) {
      const oldest = [...this.records.values()].sort(
        (a, b) => a.timestamp - b.timestamp,
      )[0];

      if (!oldest) {
        break;
      }

      this.records.delete(oldest.id);
    }
  }
}

export default PerformanceMetricsStore;