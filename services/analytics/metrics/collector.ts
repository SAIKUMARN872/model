// services/analytics/metrics/collector.ts

export type MetricType =
  | "counter"
  | "gauge"
  | "histogram";

export interface MetricRecord {
  id: string;
  organizationId: string;
  name: string;
  type: MetricType;
  value: number;
  timestamp: string;
  provider?: string;
  model?: string;
  operation?: string;
  unit?: string;
  tags: Record<string, string>;
  metadata: Record<string, unknown>;
}

export interface CreateMetricInput {
  organizationId: string;
  name: string;
  value: number;
  type?: MetricType;
  timestamp?: string;
  provider?: string;
  model?: string;
  operation?: string;
  unit?: string;
  tags?: Record<string, string>;
  metadata?: Record<string, unknown>;
}

export interface MetricFilter {
  organizationId?: string;
  name?: string;
  type?: MetricType;
  provider?: string;
  model?: string;
  operation?: string;
  startTime?: string;
  endTime?: string;
  minValue?: number;
  maxValue?: number;
  tags?: Record<string, string>;
}

export interface MetricCollectorOptions {
  maxRecords?: number;
}

export interface MetricCollectorHealth {
  healthy: boolean;
  connected: boolean;
  recordCount: number;
  maxRecords: number;
}

const METRIC_TYPES: readonly MetricType[] = [
  "counter",
  "gauge",
  "histogram",
];

function assertNonEmpty(
  value: string,
  field: string,
): void {
  if (!value || value.trim().length === 0) {
    throw new Error(
      `${field} cannot be empty`,
    );
  }
}

function validateValue(
  value: number,
): void {
  if (!Number.isFinite(value)) {
    throw new Error(
      "Metric value must be a finite number",
    );
  }
}

function validateMetricType(
  type: MetricType,
): void {
  if (!METRIC_TYPES.includes(type)) {
    throw new Error(
      `Invalid metric type: ${type}`,
    );
  }
}

function validateTimestamp(
  timestamp: string,
): void {
  if (Number.isNaN(Date.parse(timestamp))) {
    throw new Error(
      "Invalid metric timestamp",
    );
  }
}

export function validateMetricInput(
  input: CreateMetricInput,
): void {
  assertNonEmpty(
    input.organizationId,
    "Organization ID",
  );

  assertNonEmpty(
    input.name,
    "Metric name",
  );

  validateValue(input.value);

  const type =
    input.type ?? "gauge";

  validateMetricType(type);

  if (input.timestamp !== undefined) {
    validateTimestamp(input.timestamp);
  }

  if (input.provider !== undefined) {
    assertNonEmpty(
      input.provider,
      "Provider",
    );
  }

  if (input.model !== undefined) {
    assertNonEmpty(
      input.model,
      "Model",
    );
  }

  if (input.operation !== undefined) {
    assertNonEmpty(
      input.operation,
      "Operation",
    );

  }
}

function cloneMetric(
  metric: MetricRecord,
): MetricRecord {
  return {
    ...metric,
    tags: {
      ...metric.tags,
    },
    metadata: {
      ...metric.metadata,
    },
  };
}

export class MetricCollector {
  private readonly records: MetricRecord[] =
    [];

  private readonly maxRecords: number;

  private connected = false;

  constructor(
    options: MetricCollectorOptions = {},
  ) {
    const maxRecords =
      options.maxRecords ?? 100_000;

    if (
      !Number.isInteger(maxRecords) ||
      maxRecords <= 0
    ) {
      throw new Error(
        "maxRecords must be a positive integer",
      );
    }

    this.maxRecords = maxRecords;
  }

  connect(): void {
    this.connected = true;
  }

  disconnect(): void {
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  collect(
    input: CreateMetricInput,
  ): MetricRecord {
    if (!this.connected) {
      throw new Error(
        "Metric collector is not connected",
      );
    }

    validateMetricInput(input);

    const metric: MetricRecord = {
      id: crypto.randomUUID(),
      organizationId:
        input.organizationId.trim(),
      name: input.name.trim(),
      type:
        input.type ?? "gauge",
      value: input.value,
      timestamp:
        input.timestamp ??
        new Date().toISOString(),
      provider:
        input.provider?.trim(),
      model:
        input.model?.trim(),
      operation:
        input.operation?.trim(),
      unit:
        input.unit?.trim(),
      tags: {
        ...(input.tags ?? {}),
      },
      metadata: {
        ...(input.metadata ?? {}),
      },
    };

    this.records.push(metric);

    while (
      this.records.length >
      this.maxRecords
    ) {
      this.records.shift();
    }

    return cloneMetric(metric);
  }

  getById(
    id: string,
  ): MetricRecord | undefined {
    const metric =
      this.records.find(
        (item) => item.id === id,
      );

    return metric
      ? cloneMetric(metric)
      : undefined;
  }

  find(
    filter: MetricFilter = {},
  ): MetricRecord[] {
    if (
      filter.minValue !== undefined &&
      !Number.isFinite(filter.minValue)
    ) {
      throw new Error(
        "Minimum value must be finite",
      );
    }

    if (
      filter.maxValue !== undefined &&
      !Number.isFinite(filter.maxValue)
    ) {
      throw new Error(
        "Maximum value must be finite",
      );
    }

    return this.records
      .filter((metric) => {
        if (
          filter.organizationId !==
            undefined &&
          metric.organizationId !==
            filter.organizationId
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
          filter.type !== undefined &&
          metric.type !== filter.type
        ) {
          return false;
        }

        if (
          filter.provider !== undefined &&
          metric.provider !==
            filter.provider
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
          metric.operation !==
            filter.operation
        ) {
          return false;
        }

        if (
          filter.startTime !== undefined &&
          Date.parse(metric.timestamp) <
            Date.parse(filter.startTime)
        ) {
          return false;
        }

        if (
          filter.endTime !== undefined &&
          Date.parse(metric.timestamp) >
            Date.parse(filter.endTime)
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

        if (filter.tags !== undefined) {
          for (const [
            key,
            value,
          ] of Object.entries(
            filter.tags,
          )) {
            if (
              metric.tags[key] !== value
            ) {
              return false;
            }
          }
        }

        return true;
      })
      .map(cloneMetric);
  }

  getAll(): MetricRecord[] {
    return this.records.map(cloneMetric);
  }

  clearOrganization(
    organizationId: string,
  ): number {
    assertNonEmpty(
      organizationId,
      "Organization ID",
    );

    const originalLength =
      this.records.length;

    const remaining =
      this.records.filter(
        (metric) =>
          metric.organizationId !==
          organizationId,
      );

    this.records.length = 0;
    this.records.push(...remaining);

    return (
      originalLength -
      this.records.length
    );
  }

  clear(): void {
    this.records.length = 0;
  }

  size(): number {
    return this.records.length;
  }

  health(): MetricCollectorHealth {
    return {
      healthy: this.connected,
      connected: this.connected,
      recordCount:
        this.records.length,
      maxRecords: this.maxRecords,
    };
  }
}