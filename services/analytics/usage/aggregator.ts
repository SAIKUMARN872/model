import {
  UsageFilter,
  UsageRecord,
  UsageStatistics,
  UsageTracker,
} from "./tracker.js";

export interface UsageAggregation {
  key: string;

  organizationId?: string;

  provider?: string;

  model?: string;

  capability?: string;

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

export interface UsageAggregationOptions {
  groupBy:
    | "organization"
    | "provider"
    | "model"
    | "capability";
}

function groupRecords(
  records: UsageRecord[],
  options: UsageAggregationOptions,
): Map<string, UsageRecord[]> {
  const groups =
    new Map<string, UsageRecord[]>();

  for (const record of records) {
    let key: string;

    switch (options.groupBy) {
      case "organization":
        key = record.organizationId;
        break;

      case "provider":
        key = record.provider;
        break;

      case "model":
        key = `${record.provider}:${record.model}`;
        break;

      case "capability":
        key =
          record.capability ??
          "unknown";
        break;

      default:
        throw new Error(
          "Unsupported aggregation group",
        );
    }

    const existing =
      groups.get(key);

    if (existing) {
      existing.push(record);
    } else {
      groups.set(key, [record]);
    }
  }

  return groups;
}

function calculateAggregation(
  key: string,
  records: UsageRecord[],
  groupBy: UsageAggregationOptions["groupBy"],
): UsageAggregation {
  const first = records[0];

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
    qualityValues.length > 0
      ? Number(
          Math.round(
            (qualityValues.reduce(
              (sum, value) => sum + value,
              0,
            ) /
              qualityValues.length +
              Number.EPSILON) *
              1_000_000_000_000,
          ) /
            1_000_000_000_000,
        )
      : undefined;

  const requestCount =
    records.length;

  const totalCost = records.reduce(
    (sum, record) => sum + record.cost,
    0,
  );

  const aggregation: UsageAggregation = {
    key,

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
        ? records.reduce(
            (sum, record) =>
              sum +
              record.latencyMs,
            0,
          ) / requestCount
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

  if (
    groupBy ===
    "organization"
  ) {
    aggregation.organizationId =
      first.organizationId;
  }

  if (
    groupBy === "provider"
  ) {
    aggregation.provider =
      first.provider;
  }

  if (
    groupBy === "model"
  ) {
    aggregation.provider =
      first.provider;

    aggregation.model =
      first.model;
  }

  if (
    groupBy ===
    "capability"
  ) {
    aggregation.capability =
      first.capability;
  }

  return aggregation;
}

export function aggregateUsage(
  records: UsageRecord[],
  options: UsageAggregationOptions,
): UsageAggregation[] {
  const groups =
    groupRecords(
      records,
      options,
    );

  return [
    ...groups.entries(),
  ]
    .map(
      ([key, items]) =>
        calculateAggregation(
          key,
          items,
          options.groupBy,
        ),
    )
    .sort(
      (a, b) =>
        b.requestCount -
        a.requestCount,
    );
}

export function aggregateTrackerUsage(
  tracker: UsageTracker,
  filter: UsageFilter = {},
  options: UsageAggregationOptions,
): UsageAggregation[] {
  return aggregateUsage(
    tracker.find(filter),
    options,
  );
}

export function calculateUsageStatistics(
  records: UsageRecord[],
): UsageStatistics {
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

    totalCost:
      records.reduce(
        (sum, record) =>
          sum + record.cost,
        0,
      ),

    averageLatencyMs:
      requestCount > 0
        ? records.reduce(
            (sum, record) =>
              sum +
              record.latencyMs,
            0,
          ) / requestCount
        : 0,

    averageQuality:
      qualityValues.length > 0
        ? qualityValues.reduce(
            (sum, value) =>
              sum + value,
            0,
          ) /
          qualityValues.length
        : undefined,

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