import type { ModelBenchmark } from "./benchmark.js";

export interface ModelMetrics {
  model: string;
  sampleCount: number;
  averageLatencyMs: number;
  averageQuality: number;
  averageCost: number;
}

export function calculateModelMetrics(
  records: ModelBenchmark[],
): ModelMetrics[] {
  const groups = new Map<string, ModelBenchmark[]>();

  for (const record of records) {
    const current = groups.get(record.model) ?? [];
    current.push(record);
    groups.set(record.model, current);
  }

  return Array.from(groups.entries()).map(([model, values]) => ({
    model,
    sampleCount: values.length,
    averageLatencyMs:
      values.reduce((sum, item) => sum + item.latencyMs, 0) /
      values.length,
    averageQuality:
      values.reduce((sum, item) => sum + item.qualityScore, 0) /
      values.length,
    averageCost:
      values.reduce(
        (sum, item) => sum + item.costPer1KTokens,
        0,
      ) / values.length,
  }));
}
