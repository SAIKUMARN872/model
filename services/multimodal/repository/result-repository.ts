import type { ProcessingResult } from "../interfaces.js";
import { createId } from "../utils.js";

export class ResultRepository {
  private records = new Map<string, ProcessingResult>();

  async create(
    input: Omit<ProcessingResult, "id" | "createdAt">,
  ): Promise<ProcessingResult> {
    const record: ProcessingResult = {
      id: createId("result"),
      createdAt: new Date(),
      ...input,
    };
    this.records.set(record.id, record);
    return { ...record };
  }

  async getById(id: string): Promise<ProcessingResult | null> {
    const item = this.records.get(id);
    return item ? { ...item } : null;
  }

  async list(): Promise<ProcessingResult[]> {
    return [...this.records.values()].map((item) => ({ ...item }));
  }
}
