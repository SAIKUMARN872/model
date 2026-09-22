function generateId(): string {
  const cryptoApi =
    typeof globalThis !== "undefined" &&
    "crypto" in globalThis &&
    globalThis.crypto &&
    typeof globalThis.crypto.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : `usage-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return cryptoApi;
}

export type UsageStatus = "success" | "error" | "timeout";

export interface UsageRecord {
  id: string;
  organizationId: string;
  userId?: string;
  requestId?: string;

  provider: string;
  model: string;
  capability?: string;

  status: UsageStatus;

  inputTokens: number;
  outputTokens: number;
  totalTokens: number;

  latencyMs: number;
  cost: number;

  quality?: number;

  timestamp: number;

  metadata?: Record<string, unknown>;
}

export interface CreateUsageInput {
  organizationId: string;

  userId?: string;
  requestId?: string;

  provider: string;
  model: string;
  capability?: string;

  status?: UsageStatus;

  inputTokens?: number;
  outputTokens?: number;

  latencyMs?: number;
  cost?: number;

  quality?: number;

  timestamp?: number;

  metadata?: Record<string, unknown>;
}

export interface UsageFilter {
  organizationId?: string;
  userId?: string;
  requestId?: string;

  provider?: string;
  model?: string;
  capability?: string;

  status?: UsageStatus;

  startTime?: number;
  endTime?: number;
}

export interface UsageStatistics {
  requestCount: number;

  successCount: number;
  errorCount: number;
  timeoutCount: number;

  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;

  totalCost: number;

  averageLatencyMs: number;

  averageQuality?: number;

  successRate: number;
  errorRate: number;
}

export interface UsageTrackerHealth {
  connected: boolean;
  healthy: boolean;
  records: number;
  organizations: number;
}

export interface UsageTrackerOptions {
  maxRecords?: number;
  retentionMs?: number;
}

function validateRequired(
  value: string,
  field: string,
): void {
  if (!value || !value.trim()) {
    throw new Error(`${field} is required`);
  }
}

function validateNumber(
  value: number,
  field: string,
): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${field} must be a finite number`);
  }

  if (value < 0) {
    throw new Error(`${field} cannot be negative`);
  }
}

function cloneRecord(
  record: UsageRecord,
): UsageRecord {
  return {
    ...record,
    metadata: record.metadata
      ? JSON.parse(JSON.stringify(record.metadata))
      : undefined,
  };
}

function calculateAverage(valueList: number[]): number | undefined {
  if (valueList.length === 0) {
    return undefined;
  }

  const average =
    valueList.reduce((sum, value) => sum + value, 0) /
    valueList.length;

  return Number(
    Math.round((average + Number.EPSILON) * 1_000_000_000_000) /
      1_000_000_000_000,
  );
}

export class UsageTracker {
  private readonly records =
    new Map<string, UsageRecord>();

  private connected = false;

  private readonly maxRecords: number;

  private readonly retentionMs: number;

  constructor(
    options: UsageTrackerOptions = {},
  ) {
    this.maxRecords =
      options.maxRecords ?? 100_000;

    this.retentionMs =
      options.retentionMs ??
      30 * 24 * 60 * 60 * 1000;

    if (this.maxRecords <= 0) {
      throw new Error(
        "maxRecords must be greater than zero",
      );
    }

    if (this.retentionMs <= 0) {
      throw new Error(
        "retentionMs must be greater than zero",
      );
    }
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

  private ensureConnected(): void {
    if (!this.connected) {
      throw new Error(
        "UsageTracker is not connected",
      );
    }
  }

  record(
    input: CreateUsageInput,
  ): UsageRecord {
    this.ensureConnected();

    validateRequired(
      input.organizationId,
      "organizationId",
    );

    validateRequired(
      input.provider,
      "provider",
    );

    validateRequired(
      input.model,
      "model",
    );

    const status =
      input.status ?? "success";

    if (
      !["success", "error", "timeout"].includes(
        status,
      )
    ) {
      throw new Error(
        "Invalid usage status",
      );
    }

    const inputTokens =
      input.inputTokens ?? 0;

    const outputTokens =
      input.outputTokens ?? 0;

    const latencyMs =
      input.latencyMs ?? 0;

    const cost =
      input.cost ?? 0;

    const timestamp =
      input.timestamp ?? Date.now();

    validateNumber(
      inputTokens,
      "inputTokens",
    );

    validateNumber(
      outputTokens,
      "outputTokens",
    );

    validateNumber(
      latencyMs,
      "latencyMs",
    );

    validateNumber(
      cost,
      "cost",
    );

    if (!Number.isFinite(timestamp)) {
      throw new Error(
        "timestamp must be a finite number",
      );
    }

    if (input.quality !== undefined) {
      if (
        !Number.isFinite(input.quality) ||
        input.quality < 0 ||
        input.quality > 1
      ) {
        throw new Error(
          "quality must be between 0 and 1",
        );
      }
    }

    const record: UsageRecord = {
      id: generateId(),

      organizationId:
        input.organizationId,

      userId: input.userId,

      requestId: input.requestId,

      provider: input.provider,

      model: input.model,

      capability:
        input.capability,

      status,

      inputTokens,

      outputTokens,

      totalTokens:
        inputTokens + outputTokens,

      latencyMs,

      cost,

      quality:
        input.quality,

      timestamp,

      metadata: input.metadata
        ? JSON.parse(
            JSON.stringify(input.metadata),
          )
        : undefined,
    };

    this.records.set(
      record.id,
      record,
    );

    this.cleanup();

    return cloneRecord(record);
  }

  getById(
    id: string,
  ): UsageRecord | undefined {
    this.ensureConnected();

    const record =
      this.records.get(id);

    return record
      ? cloneRecord(record)
      : undefined;
  }

  find(
    filter: UsageFilter = {},
  ): UsageRecord[] {
    this.ensureConnected();

    return [...this.records.values()]
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
          filter.userId !== undefined &&
          record.userId !==
            filter.userId
        ) {
          return false;
        }

        if (
          filter.requestId !==
            undefined &&
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
          filter.capability !==
            undefined &&
          record.capability !==
            filter.capability
        ) {
          return false;
        }

        if (
          filter.status !== undefined &&
          record.status !==
            filter.status
        ) {
          return false;
        }

        if (
          filter.startTime !==
            undefined &&
          record.timestamp <
            filter.startTime
        ) {
          return false;
        }

        if (
          filter.endTime !== undefined &&
          record.timestamp >
            filter.endTime
        ) {
          return false;
        }

        return true;
      })
      .sort(
        (a, b) =>
          b.timestamp - a.timestamp,
      )
      .map(cloneRecord);
  }

  getAll(): UsageRecord[] {
    return this.find();
  }

  getOrganizationUsage(
    organizationId: string,
  ): UsageRecord[] {
    validateRequired(
      organizationId,
      "organizationId",
    );

    return this.find({
      organizationId,
    });
  }

  getUserUsage(
    organizationId: string,
    userId: string,
  ): UsageRecord[] {
    validateRequired(
      organizationId,
      "organizationId",
    );

    validateRequired(
      userId,
      "userId",
    );

    return this.find({
      organizationId,
      userId,
    });
  }

  getStatistics(
    filter: UsageFilter = {},
  ): UsageStatistics {
    const records =
      this.find(filter);

    const requestCount =
      records.length;

    const successCount =
      records.filter(
        (record) =>
          record.status === "success",
      ).length;

    const errorCount =
      records.filter(
        (record) =>
          record.status === "error",
      ).length;

    const timeoutCount =
      records.filter(
        (record) =>
          record.status === "timeout",
      ).length;

    const totalLatency =
      records.reduce(
        (sum, record) =>
          sum + record.latencyMs,
        0,
      );

    const qualityValues =
      records
        .map(
          (record) =>
            record.quality,
        )
        .filter(
          (
            value,
          ): value is number =>
            value !== undefined,
        );

    const averageQuality =
      calculateAverage(qualityValues);

    const totalCost = records.reduce(
      (sum, record) => sum + record.cost,
      0,
    );

    return {
      requestCount,

      successCount,

      errorCount,

      timeoutCount,

      totalInputTokens:
        records.reduce(
          (sum, record) =>
            sum +
            record.inputTokens,
          0,
        ),

      totalOutputTokens:
        records.reduce(
          (sum, record) =>
            sum +
            record.outputTokens,
          0,
        ),

      totalTokens:
        records.reduce(
          (sum, record) =>
            sum +
            record.totalTokens,
          0,
        ),

      totalCost: Number(
        Math.round((totalCost + Number.EPSILON) * 1_000_000_000_000) /
          1_000_000_000_000,
      ),

      averageLatencyMs:
        requestCount > 0
          ? totalLatency /
            requestCount
          : 0,

      averageQuality,

      successRate:
        requestCount > 0
          ? successCount /
            requestCount
          : 0,

      errorRate:
        requestCount > 0
          ? errorCount /
            requestCount
          : 0,
    };
  }

  clearOrganization(
    organizationId: string,
  ): number {
    this.ensureConnected();

    validateRequired(
      organizationId,
      "organizationId",
    );

    let deleted = 0;

    for (
      const [
        id,
        record,
      ] of this.records.entries()
    ) {
      if (
        record.organizationId ===
        organizationId
      ) {
        this.records.delete(id);
        deleted++;
      }
    }

    return deleted;
  }

  clear(): void {
    this.ensureConnected();

    this.records.clear();
  }

  size(): number {
    return this.records.size;
  }

  getOrganizationIds(): string[] {
    return [
      ...new Set(
        [...this.records.values()].map(
          (record) =>
            record.organizationId,
        ),
      ),
    ];
  }

  health(): UsageTrackerHealth {
    return {
      connected: this.connected,
      healthy: this.connected,
      records: this.records.size,
      organizations:
        this.getOrganizationIds()
          .length,
    };
  }

  private cleanup(): void {
    const now = Date.now();

    for (
      const [
        id,
        record,
      ] of this.records.entries()
    ) {
      if (
        now - record.timestamp >
        this.retentionMs
      ) {
        this.records.delete(id);
      }
    }

    if (
      this.records.size <=
      this.maxRecords
    ) {
      return;
    }

    const sorted =
      [...this.records.values()]
        .sort(
          (a, b) =>
            a.timestamp -
            b.timestamp,
        );

    const removeCount =
      this.records.size -
      this.maxRecords;

    for (
      let index = 0;
      index < removeCount;
      index++
    ) {
      this.records.delete(
        sorted[index].id,
      );
    }
  }
}