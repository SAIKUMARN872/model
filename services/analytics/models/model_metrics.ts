// services/analytics/models/model_metrics.ts

export type ModelMetricType =
  | "request"
  | "latency"
  | "token"
  | "cost"
  | "error"
  | "quality";

export interface ModelMetricRecord {
  id: string;
  organizationId: string;
  provider: string;
  model: string;
  metricType: ModelMetricType;
  value: number;
  timestamp: string;
  requestId?: string;
  operation?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  metadata: Record<string, unknown>;
}

export interface CreateModelMetricInput {
  organizationId: string;
  provider: string;
  model: string;
  metricType: ModelMetricType;
  value: number;
  timestamp?: string;
  requestId?: string;
  operation?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  metadata?: Record<string, unknown>;
}

export interface ModelMetricFilter {
  organizationId?: string;
  provider?: string;
  model?: string;
  metricType?: ModelMetricType;
  operation?: string;
  startTime?: string;
  endTime?: string;
  minValue?: number;
  maxValue?: number;
}

export interface ModelMetricsOptions {
  maxRecords?: number;
}

export interface ModelMetricsHealth {
  healthy: boolean;
  connected: boolean;
  recordCount: number;
  maxRecords: number;
}

export interface ModelStatistics {
  provider: string;
  model: string;
  requestCount: number;
  latencyCount: number;
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

const METRIC_TYPES: readonly ModelMetricType[] = [
  "request",
  "latency",
  "token",
  "cost",
  "error",
  "quality",
];

function assertNonEmpty(
  value: string,
  field: string,
): void {
  if (!value || value.trim().length === 0) {
    throw new Error(`${field} cannot be empty`);
  }
}

function assertFinite(
  value: number,
  field: string,
): void {
  if (!Number.isFinite(value)) {
    throw new Error(
      `${field} must be a finite number`,
    );
  }
}

function validateMetricType(
  type: ModelMetricType,
): void {
  if (!METRIC_TYPES.includes(type)) {
    throw new Error(
      `Invalid model metric type: ${type}`,
    );
  }
}

function validateTimestamp(
  timestamp: string,
): void {
  if (Number.isNaN(Date.parse(timestamp))) {
    throw new Error(
      "Invalid timestamp",
    );
  }
}

function validateOptionalToken(
  value: number | undefined,
  field: string,
): void {
  if (value === undefined) {
    return;
  }

  if (
    !Number.isInteger(value) ||
    value < 0
  ) {
    throw new Error(
      `${field} must be a non-negative integer`,
    );
  }
}

export function validateModelMetricInput(
  input: CreateModelMetricInput,
): void {
  assertNonEmpty(
    input.organizationId,
    "Organization ID",
  );

  assertNonEmpty(
    input.provider,
    "Provider",
  );

  assertNonEmpty(
    input.model,
    "Model",
  );

  validateMetricType(
    input.metricType,
  );

  assertFinite(
    input.value,
    "Metric value",
  );

  if (input.timestamp !== undefined) {
    validateTimestamp(input.timestamp);
  }

  if (input.requestId !== undefined) {
    assertNonEmpty(
      input.requestId,
      "Request ID",
    );
  }

  if (input.operation !== undefined) {
    assertNonEmpty(
      input.operation,
      "Operation",
    );
  }

  validateOptionalToken(
    input.inputTokens,
    "Input tokens",
  );

  validateOptionalToken(
    input.outputTokens,
    "Output tokens",
  );

  validateOptionalToken(
    input.totalTokens,
    "Total tokens",
  );
}

function cloneRecord(
  record: ModelMetricRecord,
): ModelMetricRecord {
  return {
    ...record,
    metadata: {
      ...record.metadata,
    },
  };
}

export class ModelMetricsStore {
  private readonly records: ModelMetricRecord[] =
    [];

  private readonly maxRecords: number;

  private connected = false;

  constructor(
    options: ModelMetricsOptions = {},
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

  record(
    input: CreateModelMetricInput,
  ): ModelMetricRecord {
    if (!this.connected) {
      throw new Error(
        "Model metrics store is not connected",
      );
    }

    validateModelMetricInput(input);

    const record: ModelMetricRecord = {
      id: crypto.randomUUID(),
      organizationId:
        input.organizationId.trim(),
      provider:
        input.provider.trim(),
      model:
        input.model.trim(),
      metricType:
        input.metricType,
      value: input.value,
      timestamp:
        input.timestamp ??
        new Date().toISOString(),
      requestId:
        input.requestId?.trim(),
      operation:
        input.operation?.trim(),
      inputTokens:
        input.inputTokens,
      outputTokens:
        input.outputTokens,
      totalTokens:
        input.totalTokens,
      metadata: {
        ...(input.metadata ?? {}),
      },
    };

    this.records.push(record);

    while (
      this.records.length >
      this.maxRecords
    ) {
      this.records.shift();
    }

    return cloneRecord(record);
  }

  getById(
    id: string,
  ): ModelMetricRecord | undefined {
    const record =
      this.records.find(
        (item) => item.id === id,
      );

    return record
      ? cloneRecord(record)
      : undefined;
  }

  find(
    filter: ModelMetricFilter = {},
  ): ModelMetricRecord[] {
    return this.records
      .filter((record) => {
        if (
          filter.organizationId !==
            undefined &&
          record.organizationId !==
            filter.organizationId
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

        if (
          filter.metricType !==
            undefined &&
          record.metricType !==
            filter.metricType
        ) {
          return false;
        }

        if (
          filter.operation !==
            undefined &&
          record.operation !==
            filter.operation
        ) {
          return false;
        }

        if (
          filter.startTime !==
            undefined &&
          Date.parse(record.timestamp) <
            Date.parse(filter.startTime)
        ) {
          return false;
        }

        if (
          filter.endTime !==
            undefined &&
          Date.parse(record.timestamp) >
            Date.parse(filter.endTime)
        ) {
          return false;
        }

        if (
          filter.minValue !==
            undefined &&
          record.value <
            filter.minValue
        ) {
          return false;
        }

        if (
          filter.maxValue !==
            undefined &&
          record.value >
            filter.maxValue
        ) {
          return false;
        }

        return true;
      })
      .map(cloneRecord);
  }

  getAll(): ModelMetricRecord[] {
    return this.records.map(cloneRecord);
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
        (record) =>
          record.organizationId !==
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

  health(): ModelMetricsHealth {
    return {
      healthy: this.connected,
      connected: this.connected,
      recordCount:
        this.records.length,
      maxRecords: this.maxRecords,
    };
  }
}