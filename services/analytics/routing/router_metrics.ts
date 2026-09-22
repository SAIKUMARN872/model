function generateId(): string {
  const cryptoApi =
    typeof globalThis !== "undefined" &&
    "crypto" in globalThis &&
    globalThis.crypto &&
    typeof globalThis.crypto.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : `metric-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return cryptoApi;
}

export type RoutingDecision =
  | "primary"
  | "fallback"
  | "retry"
  | "blocked";

export type RoutingStatus =
  | "success"
  | "error"
  | "timeout";

export interface RouterMetric {
  id: string;
  organizationId: string;
  requestId?: string;

  provider: string;
  model: string;

  decision: RoutingDecision;
  status: RoutingStatus;

  latencyMs: number;
  cost: number;

  inputTokens: number;
  outputTokens: number;
  totalTokens: number;

  quality?: number;

  timestamp: number;

  metadata?: Record<string, unknown>;
}

export interface CreateRouterMetricInput {
  organizationId: string;
  provider: string;
  model: string;

  requestId?: string;

  decision?: RoutingDecision;
  status?: RoutingStatus;

  latencyMs?: number;
  cost?: number;

  inputTokens?: number;
  outputTokens?: number;

  quality?: number;

  timestamp?: number;

  metadata?: Record<string, unknown>;
}

export interface RouterMetricFilter {
  organizationId?: string;
  provider?: string;
  model?: string;
  requestId?: string;
  decision?: RoutingDecision;
  status?: RoutingStatus;
  startTime?: number;
  endTime?: number;
}

export interface RouterStatistics {
  requestCount: number;
  successCount: number;
  errorCount: number;
  timeoutCount: number;

  primaryCount: number;
  fallbackCount: number;
  retryCount: number;
  blockedCount: number;

  totalCost: number;
  totalTokens: number;

  averageLatencyMs: number;

  successRate: number;
  fallbackRate: number;
}

export interface RouterMetricsHealth {
  connected: boolean;
  healthy: boolean;
  records: number;
  organizations: number;
}

export interface RouterMetricsOptions {
  maxRecords?: number;
  retentionMs?: number;
}

function validateString(value: string, field: string): void {
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

function cloneMetric(metric: RouterMetric): RouterMetric {
  return {
    ...metric,
    metadata: metric.metadata
      ? JSON.parse(JSON.stringify(metric.metadata))
      : undefined,
  };
}

export class RouterMetricsStore {
  private readonly records = new Map<string, RouterMetric>();

  private connected = false;

  private readonly maxRecords: number;

  private readonly retentionMs: number;

  constructor(options: RouterMetricsOptions = {}) {
    this.maxRecords = options.maxRecords ?? 100_000;
    this.retentionMs =
      options.retentionMs ?? 30 * 24 * 60 * 60 * 1000;

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
      throw new Error("RouterMetricsStore is not connected");
    }
  }

  record(input: CreateRouterMetricInput): RouterMetric {
    this.ensureConnected();

    validateString(input.organizationId, "organizationId");
    validateString(input.provider, "provider");
    validateString(input.model, "model");

    const decision = input.decision ?? "primary";
    const status = input.status ?? "success";

    const latencyMs = input.latencyMs ?? 0;
    const cost = input.cost ?? 0;
    const inputTokens = input.inputTokens ?? 0;
    const outputTokens = input.outputTokens ?? 0;
    const timestamp = input.timestamp ?? Date.now();

    validateNumber(latencyMs, "latencyMs");
    validateNumber(cost, "cost");
    validateNumber(inputTokens, "inputTokens");
    validateNumber(outputTokens, "outputTokens");

    if (
      !["primary", "fallback", "retry", "blocked"].includes(
        decision,
      )
    ) {
      throw new Error("Invalid routing decision");
    }

    if (!["success", "error", "timeout"].includes(status)) {
      throw new Error("Invalid routing status");
    }

    if (!Number.isFinite(timestamp)) {
      throw new Error("timestamp must be a finite number");
    }

    if (input.quality !== undefined) {
      if (
        !Number.isFinite(input.quality) ||
        input.quality < 0 ||
        input.quality > 1
      ) {
        throw new Error("quality must be between 0 and 1");
      }
    }

    const metric: RouterMetric = {
      id: generateId(),
      organizationId: input.organizationId,
      provider: input.provider,
      model: input.model,
      requestId: input.requestId,
      decision,
      status,
      latencyMs,
      cost,
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      quality: input.quality,
      timestamp,
      metadata: input.metadata
        ? JSON.parse(JSON.stringify(input.metadata))
        : undefined,
    };

    this.records.set(metric.id, metric);

    this.cleanup();

    return cloneMetric(metric);
  }

  getById(id: string): RouterMetric | undefined {
    this.ensureConnected();

    const metric = this.records.get(id);

    return metric ? cloneMetric(metric) : undefined;
  }

  find(filter: RouterMetricFilter = {}): RouterMetric[] {
    this.ensureConnected();

    return [...this.records.values()]
      .filter((metric) => {
        if (
          filter.organizationId !== undefined &&
          metric.organizationId !== filter.organizationId
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
          filter.requestId !== undefined &&
          metric.requestId !== filter.requestId
        ) {
          return false;
        }

        if (
          filter.decision !== undefined &&
          metric.decision !== filter.decision
        ) {
          return false;
        }

        if (
          filter.status !== undefined &&
          metric.status !== filter.status
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
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(cloneMetric);
  }

  getAll(): RouterMetric[] {
    return this.find();
  }

  getStatistics(
    filter: RouterMetricFilter = {},
  ): RouterStatistics {
    const records = this.find(filter);

    const requestCount = records.length;

    const successCount = records.filter(
      (record) => record.status === "success",
    ).length;

    const errorCount = records.filter(
      (record) => record.status === "error",
    ).length;

    const timeoutCount = records.filter(
      (record) => record.status === "timeout",
    ).length;

    const primaryCount = records.filter(
      (record) => record.decision === "primary",
    ).length;

    const fallbackCount = records.filter(
      (record) => record.decision === "fallback",
    ).length;

    const retryCount = records.filter(
      (record) => record.decision === "retry",
    ).length;

    const blockedCount = records.filter(
      (record) => record.decision === "blocked",
    ).length;

    const totalLatency = records.reduce(
      (sum, record) => sum + record.latencyMs,
      0,
    );

    return {
      requestCount,
      successCount,
      errorCount,
      timeoutCount,

      primaryCount,
      fallbackCount,
      retryCount,
      blockedCount,

      totalCost: records.reduce(
        (sum, record) => sum + record.cost,
        0,
      ),

      totalTokens: records.reduce(
        (sum, record) => sum + record.totalTokens,
        0,
      ),

      averageLatencyMs:
        requestCount > 0
          ? totalLatency / requestCount
          : 0,

      successRate:
        requestCount > 0
          ? successCount / requestCount
          : 0,

      fallbackRate:
        requestCount > 0
          ? fallbackCount / requestCount
          : 0,
    };
  }

  getOrganizationMetrics(
    organizationId: string,
  ): RouterMetric[] {
    return this.find({ organizationId });
  }

  clearOrganization(organizationId: string): number {
    this.ensureConnected();

    validateString(organizationId, "organizationId");

    let deleted = 0;

    for (const [id, metric] of this.records.entries()) {
      if (metric.organizationId === organizationId) {
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
          (record) => record.organizationId,
        ),
      ),
    ];
  }

  health(): RouterMetricsHealth {
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

    const removeCount =
      this.records.size - this.maxRecords;

    for (let index = 0; index < removeCount; index++) {
      this.records.delete(sorted[index].id);
    }
  }
}