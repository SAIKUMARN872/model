// services/analytics/cost/analyzer.ts

import {
  calculateCost,
  type ModelPricing,
  type TokenUsage,
} from "./calculator.js";

export interface CostRecord {
  id: string;
  organizationId: string;
  provider: string;
  model: string;
  capability?: string;
  environment?: string;
  requestId?: string;
  timestamp: number;

  inputTokens: number;
  outputTokens: number;
  cachedInputTokens: number;

  inputCost: number;
  outputCost: number;
  cachedInputCost: number;
  totalCost: number;

  currency: "USD";
}

export interface CostSummary {
  organizationId?: string;
  provider?: string;
  model?: string;

  requestCount: number;
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens: number;

  inputCost: number;
  outputCost: number;
  cachedInputCost: number;
  totalCost: number;

  currency: "USD";
}

export interface CostAnalyzerOptions {
  maxRecords?: number;
}

const DEFAULT_MAX_RECORDS = 100_000;

function assertNonEmpty(
  value: string,
  field: string,
): void {
  if (!value || value.trim().length === 0) {
    throw new Error(`${field} must not be empty`);
  }
}

function validateTimestamp(
  timestamp: number,
): void {
  if (
    !Number.isFinite(timestamp) ||
    timestamp <= 0
  ) {
    throw new Error(
      "timestamp must be a positive finite number",
    );
  }
}

function generateId(): string {
  return [
    Date.now().toString(36),
    Math.random()
      .toString(36)
      .slice(2, 12),
  ].join("-");
}

export class CostAnalyzer {
  private readonly records: CostRecord[] = [];

  private readonly maxRecords: number;

  constructor(
    options: CostAnalyzerOptions = {},
  ) {
    this.maxRecords =
      options.maxRecords ??
      DEFAULT_MAX_RECORDS;

    if (
      !Number.isInteger(this.maxRecords) ||
      this.maxRecords <= 0
    ) {
      throw new Error(
        "maxRecords must be a positive integer",
      );
    }
  }

  record(
    organizationId: string,
    pricing: ModelPricing,
    usage: TokenUsage,
    options: {
      capability?: string;
      environment?: string;
      requestId?: string;
      timestamp?: number;
    } = {},
  ): CostRecord {
    assertNonEmpty(
      organizationId,
      "organizationId",
    );

    const timestamp =
      options.timestamp ?? Date.now();

    validateTimestamp(timestamp);

    const breakdown =
      calculateCost(
        pricing,
        usage,
      );

    const record: CostRecord = {
      id: generateId(),

      organizationId,

      provider: pricing.provider,

      model: pricing.model,

      capability:
        options.capability,

      environment:
        options.environment,

      requestId:
        options.requestId,

      timestamp,

      inputTokens:
        usage.inputTokens,

      outputTokens:
        usage.outputTokens,

      cachedInputTokens:
        usage.cachedInputTokens ?? 0,

      inputCost:
        breakdown.inputCost,

      outputCost:
        breakdown.outputCost,

      cachedInputCost:
        breakdown.cachedInputCost,

      totalCost:
        breakdown.totalCost,

      currency:
        breakdown.currency,
    };

    this.records.push(record);

    if (
      this.records.length >
      this.maxRecords
    ) {
      this.records.splice(
        0,
        this.records.length -
          this.maxRecords,
      );
    }

    return { ...record };
  }

  getById(
    id: string,
  ): CostRecord | null {
    assertNonEmpty(id, "id");

    const record =
      this.records.find(
        (item) => item.id === id,
      );

    return record
      ? { ...record }
      : null;
  }

  getRecords(options: {
    organizationId?: string;
    provider?: string;
    model?: string;
    startTime?: number;
    endTime?: number;
  } = {}): CostRecord[] {
    if (
      options.startTime !== undefined &&
      !Number.isFinite(options.startTime)
    ) {
      throw new Error(
        "startTime must be finite",
      );
    }

    if (
      options.endTime !== undefined &&
      !Number.isFinite(options.endTime)
    ) {
      throw new Error(
        "endTime must be finite",
      );
    }

    if (
      options.startTime !== undefined &&
      options.endTime !== undefined &&
      options.startTime > options.endTime
    ) {
      throw new Error(
        "startTime cannot be greater than endTime",
      );
    }

    return this.records
      .filter((record) => {
        if (
          options.organizationId !==
            undefined &&
          record.organizationId !==
            options.organizationId
        ) {
          return false;
        }

        if (
          options.provider !== undefined &&
          record.provider !==
            options.provider
        ) {
          return false;
        }

        if (
          options.model !== undefined &&
          record.model !==
            options.model
        ) {
          return false;
        }

        if (
          options.startTime !== undefined &&
          record.timestamp <
            options.startTime
        ) {
          return false;
        }

        if (
          options.endTime !== undefined &&
          record.timestamp >
            options.endTime
        ) {
          return false;
        }

        return true;
      })
      .map((record) => ({
        ...record,
      }));
  }

  summarize(
    options: {
      organizationId?: string;
      provider?: string;
      model?: string;
      startTime?: number;
      endTime?: number;
    } = {},
  ): CostSummary {
    const records =
      this.getRecords(options);

    const summary: CostSummary = {
      organizationId:
        options.organizationId,

      provider:
        options.provider,

      model:
        options.model,

      requestCount:
        records.length,

      inputTokens: 0,

      outputTokens: 0,

      cachedInputTokens: 0,

      inputCost: 0,

      outputCost: 0,

      cachedInputCost: 0,

      totalCost: 0,

      currency: "USD",
    };

    for (const record of records) {
      summary.inputTokens +=
        record.inputTokens;

      summary.outputTokens +=
        record.outputTokens;

      summary.cachedInputTokens +=
        record.cachedInputTokens;

      summary.inputCost +=
        record.inputCost;

      summary.outputCost +=
        record.outputCost;

      summary.cachedInputCost +=
        record.cachedInputCost;

      summary.totalCost +=
        record.totalCost;
    }

    return summary;
  }

  summarizeByOrganization(): CostSummary[] {
    const organizationIds =
      new Set(
        this.records.map(
          (record) =>
            record.organizationId,
        ),
      );

    return [...organizationIds]
      .sort()
      .map((organizationId) =>
        this.summarize({
          organizationId,
        }),
      );
  }

  summarizeByModel(): CostSummary[] {
    const groups = new Set(
      this.records.map(
        (record) =>
          `${record.provider}::${record.model}`,
      ),
    );

    return [...groups]
      .sort()
      .map((group) => {
        const [
          provider,
          model,
        ] = group.split("::");

        return this.summarize({
          provider,
          model,
        });
      });
  }

  clear(): void {
    this.records.length = 0;
  }

  size(): number {
    return this.records.length;
  }

  health(): {
    healthy: boolean;
    records: number;
  } {
    return {
      healthy: true,
      records: this.records.length,
    };
  }
}