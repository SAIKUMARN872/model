import type { Metric } from "./collector.js";

export interface ProcessedMetric {
  name: string;
  count: number;
  sum: number;
  average: number;
  minimum: number;
  maximum: number;
}

export function processMetrics(
  metrics: Metric[],
): ProcessedMetric[] {
  const groups = new Map<string, number[]>();

  for (const metric of metrics) {
    const values = groups.get(metric.name) ?? [];
    values.push(metric.value);
    groups.set(metric.name, values);
  }

  return Array.from(groups.entries()).map(([name, values]) => {
    const sum = values.reduce((total, value) => total + value, 0);

    return {
      name,
      count: values.length,
      sum,
      average: sum / values.length,
      minimum: Math.min(...values),
      maximum: Math.max(...values),
    };
  });
}
