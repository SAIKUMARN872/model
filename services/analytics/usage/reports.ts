import type { UsageRecord } from "./tracker.js";
import { aggregateUsage } from "./aggregator.js";

export interface UsageReport {
  generatedAt: string;
  users: number;
  totalRequests: number;
  totalTokens: number;
  byUser: ReturnType<typeof aggregateUsage>;
}

export function createUsageReport(
  records: UsageRecord[],
): UsageReport {
  const byUser = aggregateUsage(records);

  return {
    generatedAt: new Date().toISOString(),
    users: byUser.length,
    totalRequests: records.reduce(
      (sum, record) => sum + record.requests,
      0,
    ),
    totalTokens: records.reduce(
      (sum, record) => sum + record.tokens,
      0,
    ),
    byUser,
  };
}
