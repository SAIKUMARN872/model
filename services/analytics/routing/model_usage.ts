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

export interface ModelUsageRecord {
  id: string;
  organizationId: string;
  provider: string;
  model: string;
  requestId?: string;
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

export interface CreateModelUsageInput {
  organizationId: string;
  provider: string;
  model: string;
  requestId?: string;
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

export interface ModelUsageFilter {
  organizationId?: string;
  provider?: string;
  model?: string;
  capability?: string;
  status?: UsageStatus;
  requestId?: string;
  startTime?: number;
  endTime?: number;
}

export interface ModelUsageSummary {
  provider: string;
  model: string;
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
}

export interface ModelUsageHealth {
  connected: boolean;
  healthy: boolean;
  records: number;
  organizations: number;
}

export interface ModelUsageOptions {
  maxRecords?: number;
  retentionMs?: number;
}

function validatePositiveNumber(
  value: number,
  field: string,
  allowZero = true,
): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${field} must be a finite number`);
  }

  if (allowZero && value < 0) {
    throw new Error(`${field} cannot be negative`);
  }

  if (!allowZero && value <= 0) {
    throw new Error(`${field} must be greater than zero`);
  }
}

function validateOrganizationId(value: string): void {
  if (!value || !value.trim()) {
    throw new Error("organizationId is required");
  }
}

function validateString(value: string, field: string): void {
  if (!value || !value.trim()) {
    throw new Error(`${field} is required`);
  }
}

function cloneRecord(record: ModelUsageRecord): ModelUsageRecord {
  return {
    ...record,
    metadata: record.metadata
      ? JSON.parse(JSON.stringify(record.metadata))
      : undefined,
  };
}

export class ModelUsageStore {
  private readonly records = new Map<string, ModelUsageRecord>();

  private connected = false;

  private readonly maxRecords: number;

  private readonly retentionMs: number;

  constructor(options: ModelUsageOptions = {}) {
    this.maxRecords = options.maxRecords ?? 100_000;
    this.retentionMs = options.retentionMs ?? 30 * 24 * 60 * 60 * 1000;

    if (this.maxRecords <= 0) {
      throw new Error("maxRecords must be greater than zero");
    }

    if (this.retentionMs <= 0) {
      throw new Error("retentionMs must be greater than zero");
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
      throw new Error("ModelUsageStore is not connected");
    }
  }

  record(input: CreateModelUsageInput): ModelUsageRecord {
    this.ensureConnected();

    validateOrganizationId(input.organizationId);
    validateString(input.provider, "provider");
    validateString(input.model, "model");

    const status = input.status ?? "success";

    const inputTokens = input.inputTokens ?? 0;
    const outputTokens = input.outputTokens ?? 0;
    const latencyMs = input.latencyMs ?? 0;
    const cost = input.cost ?? 0;
    const timestamp = input.timestamp ?? Date.now();

    validatePositiveNumber(inputTokens, "inputTokens");
    validatePositiveNumber(outputTokens, "outputTokens");
    validatePositiveNumber(latencyMs, "latencyMs");
    validatePositiveNumber(cost, "cost");

    if (!["success", "error", "timeout"].includes(status)) {
      throw new Error("Invalid usage status");
    }

    if (!Number.isFinite(timestamp)) {
      throw new Error("timestamp must be a finite number");
    }

    if (input.quality !== undefined) {
      if (!Number.isFinite(input.quality) || input.quality < 0 || input.quality > 1) {
        throw new Error("quality must be between 0 and 1");
      }
    }

    const record: ModelUsageRecord = {
      id: generateId(),
      organizationId: input.organizationId,
      provider: input.provider,
      model: input.model,
      requestId: input.requestId,
      capability: input.capability,
      status,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      latencyMs,
      cost,
      quality: input.quality,
      timestamp,
      metadata: input.metadata
        ? JSON.parse(JSON.stringify(input.metadata))
        : undefined,
    };

    this.records.set(record.id, record);

    this.cleanup();

    return cloneRecord(record);
  }

  getById(id: string): ModelUsageRecord | undefined {
    this.ensureConnected();

    const record = this.records.get(id);

    return record ? cloneRecord(record) : undefined;
  }

  find(filter: ModelUsageFilter = {}): ModelUsageRecord[] {
    this.ensureConnected();

    return [...this.records.values()]
      .filter((record) => {
        if (
          filter.organizationId !== undefined &&
          record.organizationId !== filter.organizationId
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
          filter.capability !== undefined &&
          record.capability !== filter.capability
        ) {
          return false;
        }

        if (
          filter.status !== undefined &&
          record.status !== filter.status
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
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(cloneRecord);
  }

  getAll(): ModelUsageRecord[] {
    return this.find();
  }

  getOrganizationUsage(organizationId: string): ModelUsageRecord[] {
    validateOrganizationId(organizationId);

    return this.find({ organizationId });
  }

  summarize(filter: ModelUsageFilter = {}): ModelUsageSummary[] {
    const records = this.find(filter);

    const groups = new Map<string, ModelUsageRecord[]>();

    for (const record of records) {
      const key = `${record.provider}::${record.model}`;

      const existing = groups.get(key);

      if (existing) {
        existing.push(record);
      } else {
        groups.set(key, [record]);
      }
    }

    return [...groups.values()].map((items) => {
      const first = items[0];

      const successCount = items.filter(
        (item) => item.status === "success",
      ).length;

      const errorCount = items.filter(
        (item) => item.status === "error",
      ).length;

      const timeoutCount = items.filter(
        (item) => item.status === "timeout",
      ).length;

      const totalLatency = items.reduce(
        (sum, item) => sum + item.latencyMs,
        0,
      );

      const qualityValues = items
        .map((item) => item.quality)
        .filter((value): value is number => value !== undefined);

      const averageQuality =
        qualityValues.length > 0
          ? qualityValues.reduce((sum, value) => sum + value, 0) /
            qualityValues.length
          : undefined;

      return {
        provider: first.provider,
        model: first.model,
        requestCount: items.length,
        successCount,
        errorCount,
        timeoutCount,
        totalInputTokens: items.reduce(
          (sum, item) => sum + item.inputTokens,
          0,
        ),
        totalOutputTokens: items.reduce(
          (sum, item) => sum + item.outputTokens,
          0,
        ),
        totalTokens: items.reduce(
          (sum, item) => sum + item.totalTokens,
          0,
        ),
        totalCost: items.reduce(
          (sum, item) => sum + item.cost,
          0,
        ),
        averageLatencyMs:
          items.length > 0 ? totalLatency / items.length : 0,
        averageQuality,
        successRate:
          items.length > 0 ? successCount / items.length : 0,
      };
    });
  }

  getModelUsage(
    provider: string,
    model: string,
    organizationId?: string,
  ): ModelUsageRecord[] {
    return this.find({
      provider,
      model,
      organizationId,
    });
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

  clear(): void {
    this.ensureConnected();
    this.records.clear();
  }

  size(): number {
    return this.records.size;
  }

  getOrganizationIds(): string[] {
    return [...new Set(
      [...this.records.values()].map(
        (record) => record.organizationId,
      ),
    )];
  }

  health(): ModelUsageHealth {
    return {
      connected: this.connected,
      healthy: this.connected,
      records: this.records.size,
      organizations: this.getOrganizationIds().length,
    };
  }

  private cleanup(): void {
    const now = Date.now();

    for (const [id, record] of this.records.entries()) {
      if (now - record.timestamp > this.retentionMs) {
        this.records.delete(id);
      }
    }

    if (this.records.size <= this.maxRecords) {
      return;
    }

    const sorted = [...this.records.values()].sort(
      (a, b) => a.timestamp - b.timestamp,
    );

    const removeCount = this.records.size - this.maxRecords;

    for (let index = 0; index < removeCount; index++) {
      this.records.delete(sorted[index].id);
    }
  }
}