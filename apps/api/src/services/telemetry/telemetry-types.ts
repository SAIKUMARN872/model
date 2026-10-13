import type { ModelTier } from "../routing/model-selector.js";

export type ExecutionTelemetry = {
  timestamp: string;
  provider: string;
  model: string;
  tier: ModelTier;
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  success: boolean;
  error?: string;
};
