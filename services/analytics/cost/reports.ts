// services/analytics/cost/reports.ts

import type {
  CostAnalyzer,
  CostRecord,
  CostSummary,
} from "./analyzer.js";

export interface CostReport {
  generatedAt: number;
  filters: {
    organizationId?: string;
    provider?: string;
    model?: string;
    startTime?: number;
    endTime?: number;
  };
  summary: CostSummary;
  records: CostRecord[];
}

export interface CostReportByModel {
  provider: string;
  model: string;
  requestCount: number;
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens: number;
  totalCost: number;
  currency: "USD";
}

export function createCostReport(
  analyzer: CostAnalyzer,
  filters: {
    organizationId?: string;
    provider?: string;
    model?: string;
    startTime?: number;
    endTime?: number;
  } = {},
): CostReport {
  return {
    generatedAt: Date.now(),

    filters: {
      ...filters,
    },

    summary:
      analyzer.summarize(filters),

    records:
      analyzer.getRecords(filters),
  };
}

export function createModelCostReport(
  analyzer: CostAnalyzer,
  organizationId?: string,
): CostReportByModel[] {
  const records =
    analyzer.getRecords({
      organizationId,
    });

  const groups = new Map<
    string,
    CostReportByModel
  >();

  for (const record of records) {
    const key =
      `${record.provider}::${record.model}`;

    const existing =
      groups.get(key);

    if (existing) {
      existing.requestCount += 1;

      existing.inputTokens +=
        record.inputTokens;

      existing.outputTokens +=
        record.outputTokens;

      existing.cachedInputTokens +=
        record.cachedInputTokens;

      existing.totalCost +=
        record.totalCost;

      continue;
    }

    groups.set(key, {
      provider:
        record.provider,

      model:
        record.model,

      requestCount: 1,

      inputTokens:
        record.inputTokens,

      outputTokens:
        record.outputTokens,

      cachedInputTokens:
        record.cachedInputTokens,

      totalCost:
        record.totalCost,

      currency: "USD",
    });
  }

  return [...groups.values()]
    .sort(
      (a, b) =>
        b.totalCost -
        a.totalCost,
    );
}

export function reportToJson(
  report: CostReport,
): string {
  return JSON.stringify(
    report,
    null,
    2,
  );
}

export function reportToCsv(
  report: CostReport,
): string {
  const headers = [
    "id",
    "organizationId",
    "provider",
    "model",
    "capability",
    "environment",
    "requestId",
    "timestamp",
    "inputTokens",
    "outputTokens",
    "cachedInputTokens",
    "inputCost",
    "outputCost",
    "cachedInputCost",
    "totalCost",
    "currency",
  ];

  const escapeCsv = (
    value: unknown,
  ): string => {
    const text =
      String(value ?? "");

    if (
      text.includes(",") ||
      text.includes('"') ||
      text.includes("\n")
    ) {
      return `"${text.replace(
        /"/g,
        '""',
      )}"`;
    }

    return text;
  };

  const rows = report.records.map(
    (record) =>
      [
        record.id,
        record.organizationId,
        record.provider,
        record.model,
        record.capability,
        record.environment,
        record.requestId,
        record.timestamp,
        record.inputTokens,
        record.outputTokens,
        record.cachedInputTokens,
        record.inputCost,
        record.outputCost,
        record.cachedInputCost,
        record.totalCost,
        record.currency,
      ]
        .map(escapeCsv)
        .join(","),
  );

  return [
    headers.join(","),
    ...rows,
  ].join("\n");
}