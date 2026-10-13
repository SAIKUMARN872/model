import type { UsageRecord } from "./tracker.js";

export interface UsageSummary {
  userId: string;
  requests: number;
  tokens: number;
}

export function aggregateUsage(
  records: UsageRecord[],
): UsageSummary[] {
  const groups = new Map<string, UsageSummary>();

  for (const record of records) {
    const existing = groups.get(record.userId);

    if (existing) {
      existing.requests += record.requests;
      existing.tokens += record.tokens;
    } else {
      groups.set(record.userId, {
        userId: record.userId,
        requests: record.requests,
        tokens: record.tokens,
      });
    }
  }

  return Array.from(groups.values());
}
