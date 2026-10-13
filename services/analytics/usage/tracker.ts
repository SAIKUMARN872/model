import { randomUUID } from "node:crypto";

export interface UsageRecord {
  id: string;
  userId: string;
  model: string;
  requests: number;
  tokens: number;
  timestamp: string;
}


export class UsageTracker {
  private readonly records: UsageRecord[] = [];

  record(
    userId: string,
    model: string,
    requests: number,
    tokens: number,
  ): UsageRecord {
    if (!userId.trim()) {
      throw new Error("User ID is required");
    }

    if (!model.trim()) {
      throw new Error("Model is required");
    }

    if (
      !Number.isInteger(requests) ||
      requests < 0 ||
      !Number.isInteger(tokens) ||
      tokens < 0
    ) {
      throw new Error("Usage values must be non-negative integers");
    }

    const record: UsageRecord = {
      id: randomUUID(),
      userId,
      model,
      requests,
      tokens,
      timestamp: new Date().toISOString(),
    };

    this.records.push(record);

    return { ...record };
  }

  list(): UsageRecord[] {
    return this.records.map((record) => ({ ...record }));
  }
}
