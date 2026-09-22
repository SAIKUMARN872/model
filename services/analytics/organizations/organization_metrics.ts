// services/analytics/organizations/organization_metrics.ts

export type OrganizationMetricType =
  | "request"
  | "latency"
  | "token"
  | "cost"
  | "error"
  | "quality"
  | "cache"
  | "custom";

export interface OrganizationMetricRecord {
  id: string;
  organizationId: string;
  metricType: OrganizationMetricType;
  name: string;
  value: number;
  provider?: string;
  model?: string;
  operation?: string;
  requestId?: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface CreateOrganizationMetricInput {
  organizationId: string;
  metricType: OrganizationMetricType;
  name: string;
  value: number;
  provider?: string;
  model?: string;
  operation?: string;
  requestId?: string;
  timestamp?: number;
  metadata?: Record<string, unknown>;
}

export interface OrganizationMetricFilter {
  organizationId?: string;
  metricType?: OrganizationMetricType;
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

export interface OrganizationMetricsOptions {
  maxRecords?: number;
  retentionMs?: number;
}

export interface OrganizationMetricsHealth {
  healthy: boolean;
  connected: boolean;
  records: number;
  organizations: number;
  maxRecords: number;
  retentionMs: number;
}

export interface OrganizationStatistics {
  organizationId: string;
  count: number;
  sum: number;
  average: number;
  min: number;
  max: number;
  p50: number;
  p95: number;
  p99: number;
}

const DEFAULT_MAX_RECORDS = 100_000;
const DEFAULT_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

const VALID_METRIC_TYPES: OrganizationMetricType[] = [
  "request",
  "latency",
  "token",
  "cost",
  "error",
  "quality",
  "cache",
  "custom",
];

function generateId(): string {
  return `org_metric_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 12)}`;
}

export function validateOrganizationId(value: string): void {
  if (!value || typeof value !== "string" || value.trim().length === 0) {
    throw new Error("Organization ID is required");
  }
}

export function validateMetricName(value: string): void {
  if (!value || typeof value !== "string" || value.trim().length === 0) {
    throw new Error("Metric name is required");
  }
}

export function validateMetricType(
  value: OrganizationMetricType,
): void {
  if (!VALID_METRIC_TYPES.includes(value)) {
    throw new Error(`Invalid metric type: ${value}`);
  }
}

export function validateMetricValue(value: number): void {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error("Metric value must be a finite number");
  }
}

function cloneMetadata(
  metadata?: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!metadata) {
    return undefined;
  }

  return JSON.parse(JSON.stringify(metadata)) as Record<string, unknown>;
}

function cloneRecord(
  record: OrganizationMetricRecord,
): OrganizationMetricRecord {
  return {
    ...record,
    metadata: cloneMetadata(record.metadata),
  };
}

function percentile(values: number[], percentileValue: number): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);

  const index = (percentileValue / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) {
    return sorted[lower];
  }

  const weight = index - lower;

  return sorted[lower] + (sorted[upper] - sorted[lower]) * weight;
}

function calculateStatistics(
  organizationId: string,
  records: OrganizationMetricRecord[],
): OrganizationStatistics {
  const values = records.map((record) => record.value);

  if (values.length === 0) {
    return {
      organizationId,
      count: 0,
      sum: 0,
      average: 0,
      min: 0,
      max: 0,
      p50: 0,
      p95: 0,
      p99: 0,
    };
  }

  const sum = values.reduce((total, value) => total + value, 0);

  return {
    organizationId,
    count: values.length,
    sum,
    average: sum / values.length,
    min: Math.min(...values),
    max: Math.max(...values),
    p50: percentile(values, 50),
    p95: percentile(values, 95),
    p99: percentile(values, 99),
  };
}

export class OrganizationMetricsStore {
  private readonly records = new Map<string, OrganizationMetricRecord>();

  private connected = false;

  private readonly maxRecords: number;

  private readonly retentionMs: number;

  constructor(options: OrganizationMetricsOptions = {}) {
    this.maxRecords = options.maxRecords ?? DEFAULT_MAX_RECORDS;
    this.retentionMs = options.retentionMs ?? DEFAULT_RETENTION_MS;

    if (!Number.isInteger(this.maxRecords) || this.maxRecords <= 0) {
      throw new Error("maxRecords must be a positive integer");
    }

    if (!Number.isFinite(this.retentionMs) || this.retentionMs <= 0) {
      throw new Error("retentionMs must be a positive number");
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

  record(input: CreateOrganizationMetricInput): OrganizationMetricRecord {
    this.ensureConnected();

    validateOrganizationId(input.organizationId);
    validateMetricType(input.metricType);
    validateMetricName(input.name);
    validateMetricValue(input.value);

    const timestamp = input.timestamp ?? Date.now();

    if (!Number.isFinite(timestamp) || timestamp <= 0) {
      throw new Error("timestamp must be a positive number");
    }

    if (input.provider !== undefined && !input.provider.trim()) {
      throw new Error("provider cannot be empty");
    }

    if (input.model !== undefined && !input.model.trim()) {
      throw new Error("model cannot be empty");
    }

    const record: OrganizationMetricRecord = {
      id: generateId(),
      organizationId: input.organizationId,
      metricType: input.metricType,
      name: input.name,
      value: input.value,
      provider: input.provider,
      model: input.model,
      operation: input.operation,
      requestId: input.requestId,
      timestamp,
      metadata: cloneMetadata(input.metadata),
    };

    this.records.set(record.id, record);

    this.removeExpired();
    this.enforceRetention();

    return cloneRecord(record);
  }

  getById(id: string): OrganizationMetricRecord | undefined {
    this.ensureConnected();

    const record = this.records.get(id);

    if (!record) {
      return undefined;
    }

    if (this.isExpired(record)) {
      this.records.delete(id);
      return undefined;
    }

    return cloneRecord(record);
  }

  find(filter: OrganizationMetricFilter = {}): OrganizationMetricRecord[] {
    this.ensureConnected();

    this.removeExpired();

    return [...this.records.values()]
      .filter((record) => {
        if (
          filter.organizationId !== undefined &&
          record.organizationId !== filter.organizationId
        ) {
          return false;
        }

        if (
          filter.metricType !== undefined &&
          record.metricType !== filter.metricType
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
          filter.provider !== undefined &&
          record.provider !== filter.provider
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
          filter.operation !== undefined &&
          record.operation !== filter.operation
        ) {
          return false;
        }

        if (
          filter.requestId !== undefined &&
          record.requestId !== filter.requestId
        ) {
          return false;
        }

        if (
          filter.minValue !== undefined &&
          record.value < filter.minValue
        ) {
          return false;
        }

        if (
          filter.maxValue !== undefined &&
          record.value > filter.maxValue
        ) {
          return false;
        }

        if (
          filter.startTime !== undefined &&
          record.timestamp < filter.startTime
        ) {
          return false;
        }

        if (
          filter.endTime !== undefined &&
          record.timestamp > filter.endTime
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(cloneRecord);
  }

  getAll(): OrganizationMetricRecord[] {
    return this.find();
  }

  getOrganizationMetrics(
    organizationId: string,
  ): OrganizationMetricRecord[] {
    validateOrganizationId(organizationId);

    return this.find({ organizationId });
  }

  getStatistics(
    organizationId: string,
    metricType?: OrganizationMetricType,
    name?: string,
  ): OrganizationStatistics {
    validateOrganizationId(organizationId);

    const records = this.find({
      organizationId,
      metricType,
      name,
    });

    return calculateStatistics(organizationId, records);
  }

  getOrganizationIds(): string[] {
    this.ensureConnected();

    this.removeExpired();

    return [...new Set(
      [...this.records.values()].map(
        (record) => record.organizationId,
      ),
    )];
  }

  clearOrganization(organizationId: string): number {
    this.ensureConnected();

    validateOrganizationId(organizationId);

    let deleted = 0;

    for (const [id, record] of this.records.entries()) {
      if (record.organizationId === organizationId) {
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

  health(): OrganizationMetricsHealth {
    this.removeExpired();

    return {
      healthy: this.connected,
      connected: this.connected,
      records: this.records.size,
      organizations: new Set(
        [...this.records.values()].map(
          (record) => record.organizationId,
        ),
      ).size,
      maxRecords: this.maxRecords,
      retentionMs: this.retentionMs,
    };
  }

  private ensureConnected(): void {
    if (!this.connected) {
      throw new Error("Organization metrics store is not connected");
    }
  }

  private isExpired(record: OrganizationMetricRecord): boolean {
    return record.timestamp < Date.now() - this.retentionMs;
  }

  private removeExpired(): void {
    const cutoff = Date.now() - this.retentionMs;

    for (const [id, record] of this.records.entries()) {
      if (record.timestamp < cutoff) {
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

export default OrganizationMetricsStore;