import type { ModelTier } from "../routing/model-selector.js";

export type ObservedLatencyClass = "low" | "medium" | "high";

export type ModelPerformance = {
  model: string;
  tier: ModelTier;
  executions: number;
  successfulExecutions: number;
  failedExecutions: number;
  successRate: number;
  averageLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  observedLatency: ObservedLatencyClass;
};
