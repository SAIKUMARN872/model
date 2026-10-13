import { randomUUID } from "node:crypto";
import { CostRecord, CostResult } from "./calculator.js";

export class CostAnalyzer {
  private readonly records: CostRecord[] = [];

  add(record: Omit<CostRecord, "id" | "timestamp">): CostRecord {
    if (!record.model.trim()) {
      throw new Error("Model is required");
    }

    if (
      record.inputTokens < 0 ||
      record.outputTokens < 0 ||
      record.inputRate < 0 ||
      record.outputRate < 0
    ) {
      throw new Error("Cost values cannot be negative");
    }

    const result: CostRecord = {
      ...record,
      id: randomUUID(),
      timestamp: new Date().toISOString(),
    };

    this.records.push(result);
    return { ...result };
  }

  calculate(record: CostRecord): CostResult {
    const inputCost =
      (record.inputTokens / 1000) * record.inputRate;

    const outputCost =
      (record.outputTokens / 1000) * record.outputRate;

    return {
      inputCost,
      outputCost,
      totalCost: inputCost + outputCost,
    };
  }

  list(): CostRecord[] {
    return this.records.map((record) => ({ ...record }));
  }
}
