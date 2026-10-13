import type { CostRecord } from "./calculator.js";

export interface CostReport {
  model: string;
  records: number;
  totalCost: number;
}

export function createCostReport(
  records: CostRecord[],
): CostReport[] {
  const grouped = new Map<string, CostReport>();

  for (const record of records) {
    const inputCost =
      (record.inputTokens / 1000) * record.inputRate;

    const outputCost =
      (record.outputTokens / 1000) * record.outputRate;

    const existing = grouped.get(record.model);

    if (existing) {
      existing.records += 1;
      existing.totalCost += inputCost + outputCost;
    } else {
      grouped.set(record.model, {
        model: record.model,
        records: 1,
        totalCost: inputCost + outputCost,
      });
    }
  }

  return Array.from(grouped.values());
}
