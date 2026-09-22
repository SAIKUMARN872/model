// services/analytics/latency/tracker.ts

export interface LatencyRecord {
  id: string;
  organizationId: string;
  requestId?: string;
  provider?: string;
  model?: string;
  operation?: string;
  latencyMs: number;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export interface CreateLatencyInput {
  organizationId: string;
  requestId?: string;
  provider?: string;
  model?: string;
  operation?: string;
  latencyMs: number;
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

export interface LatencyFilter {
  organizationId?: string;
  requestId?: string;
  provider?: string;
  model?: string;
  operation?: string;
  startTime?: string;
  endTime?: string;
  minLatencyMs?: number;
  maxLatencyMs?: number;
}

export interface LatencyTrackerOptions {
  maxRecords?: number;
}

export interface LatencyTrackerHealth {
  healthy: boolean;
  connected: boolean;
  recordCount: number;
  maxRecords: number;
}

function assertNonEmpty(
  value: string,
  field: string,
): void {
  if (!value || value.trim().length === 0) {
    throw new Error(`${field} cannot be empty`);
  }
}

function validateLatency(
  latencyMs: number,
): void {
  if (
    !Number.isFinite(latencyMs) ||
    latencyMs < 0
  ) {
    throw new Error(
      "Latency must be a non-negative finite number",
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

export function validateLatencyInput(
  input: CreateLatencyInput,
): void {
  assertNonEmpty(
    input.organizationId,
    "Organization ID",
  );

  validateLatency(input.latencyMs);

  if (input.timestamp !== undefined) {
    validateTimestamp(input.timestamp);
  }

  if (input.requestId !== undefined) {
    assertNonEmpty(
      input.requestId,
      "Request ID",
    );
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

function cloneRecord(
  record: LatencyRecord,
): LatencyRecord {
  return {
    ...record,
    metadata: {
      ...record.metadata,
    },
  };
}

export class LatencyTracker {
  private readonly records: LatencyRecord[] = [];

  private readonly maxRecords: number;

  private connected = false;

  constructor(
    options: LatencyTrackerOptions = {},
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
    input: CreateLatencyInput,
  ): LatencyRecord {
    if (!this.connected) {
      throw new Error(
        "Latency tracker is not connected",
      );
    }

    validateLatencyInput(input);

    const record: LatencyRecord = {
      id: crypto.randomUUID(),
      organizationId:
        input.organizationId.trim(),
      requestId:
        input.requestId?.trim(),
      provider:
        input.provider?.trim(),
      model:
        input.model?.trim(),
      operation:
        input.operation?.trim(),
      latencyMs: input.latencyMs,
      timestamp:
        input.timestamp ??
        new Date().toISOString(),
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
  ): LatencyRecord | undefined {
    const record =
      this.records.find(
        (item) => item.id === id,
      );

    return record
      ? cloneRecord(record)
      : undefined;
  }

  find(
    filter: LatencyFilter = {},
  ): LatencyRecord[] {
    if (
      filter.minLatencyMs !== undefined &&
      filter.minLatencyMs < 0
    ) {
      throw new Error(
        "Minimum latency cannot be negative",
      );
    }

    if (
      filter.maxLatencyMs !== undefined &&
      filter.maxLatencyMs < 0
    ) {
      throw new Error(
        "Maximum latency cannot be negative",
      );
    }

    return this.records
      .filter((record) => {
        if (
          filter.organizationId !== undefined &&
          record.organizationId !==
            filter.organizationId
        ) {
          return false;
        }

        if (
          filter.requestId !== undefined &&
          record.requestId !==
            filter.requestId
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
          filter.operation !== undefined &&
          record.operation !==
            filter.operation
        ) {
          return false;
        }

        const timestamp =
          Date.parse(record.timestamp);

        if (
          filter.startTime !== undefined &&
          timestamp <
            Date.parse(filter.startTime)
        ) {
          return false;
        }

        if (
          filter.endTime !== undefined &&
          timestamp >
            Date.parse(filter.endTime)
        ) {
          return false;
        }

        if (
          filter.minLatencyMs !== undefined &&
          record.latencyMs <
            filter.minLatencyMs
        ) {
          return false;
        }

        if (
          filter.maxLatencyMs !== undefined &&
          record.latencyMs >
            filter.maxLatencyMs
        ) {
          return false;
        }

        return true;
      })
      .map(cloneRecord);
  }

  getAll(): LatencyRecord[] {
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

  health(): LatencyTrackerHealth {
    return {
      healthy: this.connected,
      connected: this.connected,
      recordCount:
        this.records.length,
      maxRecords: this.maxRecords,
    };
  }
}