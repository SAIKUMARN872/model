import {
  UsageFilter,
  UsageRecord,
  UsageStatistics,
  UsageTracker,
} from "./tracker.js";

import {
  aggregateTrackerUsage,
  UsageAggregation,
} from "./aggregator.js";

export interface UsageReport {
  generatedAt: number;

  filter: UsageFilter;

  statistics: UsageStatistics;

  aggregations: UsageAggregation[];
}

export type UsageReportFormat =
  | "json"
  | "csv";

function calculateAverage(
  valueList: number[],
): number | undefined {
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

function escapeCsv(
  value: unknown,
): string {
  const stringValue =
    String(value ?? "");

  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(
      /"/g,
      '""',
    )}"`;
  }

  return stringValue;
}

export function createUsageReport(
  tracker: UsageTracker,
  filter: UsageFilter = {},
): UsageReport {
  const records =
    tracker.find(filter);

  const aggregations =
    aggregateTrackerUsage(
      tracker,
      filter,
      {
        groupBy: "model",
      },
    );

  const statistics =
    calculateStatistics(records);

  return {
    generatedAt: Date.now(),
    filter: {
      ...filter,
    },
    statistics,
    aggregations,
  };
}

function calculateStatistics(
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
      calculateAverage(qualityValues),

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

export function exportUsageReportToJson(
  report: UsageReport,
  pretty = true,
): string {
  return JSON.stringify(
    report,
    null,
    pretty ? 2 : 0,
  );
}

export function exportUsageReportToCsv(
  report: UsageReport,
): string {
  const headers = [
    "provider",
    "model",
    "requestCount",
    "successCount",
    "errorCount",
    "timeoutCount",
    "totalInputTokens",
    "totalOutputTokens",
    "totalTokens",
    "totalCost",
    "averageLatencyMs",
    "averageQuality",
    "successRate",
    "errorRate",
  ];

  const rows =
    report.aggregations.map(
      (aggregation) =>
        [
          aggregation.provider,
          aggregation.model,
          aggregation.requestCount,
          aggregation.successCount,
          aggregation.errorCount,
          aggregation.timeoutCount,
          aggregation.totalInputTokens,
          aggregation.totalOutputTokens,
          aggregation.totalTokens,
          aggregation.totalCost,
          aggregation.averageLatencyMs,
          aggregation.averageQuality ??
            "",
          aggregation.successRate,
          aggregation.errorRate,
        ]
          .map(escapeCsv)
          .join(","),
    );

  return [
    headers.join(","),
    ...rows,
  ].join("\n");
}

export function exportUsageReport(
  report: UsageReport,
  format: UsageReportFormat,
  pretty = true,
): string {
  switch (format) {
    case "json":
      return exportUsageReportToJson(
        report,
        pretty,
      );

    case "csv":
      return exportUsageReportToCsv(
        report,
      );

    default:
      throw new Error(
        "Unsupported usage report format",
      );
  }
}

export function generateUsageReport(
  tracker: UsageTracker,
  filter: UsageFilter = {},
): UsageReport {
  return createUsageReport(
    tracker,
    filter,
  );
}