import type { ModelUsage } from "./model_usage.js";

export interface RouterMetrics {
  model: string;
  requestCount: number;
  tokenCount: number;
}

export function summarizeRouterMetrics(
  usage: ModelUsage[],
): RouterMetrics[] {
  const groups = new Map<string, RouterMetrics>();

  for (const item of usage) {
    const existing = groups.get(item.model);

    if (existing) {
      existing.requestCount += item.requests;
      existing.tokenCount += item.tokens;
    } else {
      groups.set(item.model, {
        model: item.model,
        requestCount: item.requests,
        tokenCount: item.tokens,
      });
    }
  }

  return Array.from(groups.values());
}
