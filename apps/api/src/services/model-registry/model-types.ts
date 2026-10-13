import type { ModelTier } from "../routing/model-selector.js";

export type ModelProvider =
  | "openai"
  | "anthropic"
  | "google"
  | "deepseek"
  | "mistral"
  | "xai"
  | "qwen"
  | "ollama"
  | "azure-openai"
  | "aws-bedrock"
  | "openrouter";

export type ModelCapability =
  | "basic_qa"
  | "coding"
  | "reasoning"
  | "architecture"
  | "enterprise"
  | "security"
  | "long_context"
  | "multi_step"
  | "multimodal";

export type RegisteredModel = {
  id: string;
  name: string;
  provider: ModelProvider;
  providerModel: string;
  tier: ModelTier;
  capabilities: ModelCapability[];
  contextWindow: number;
  inputCostPer1M: number;
  outputCostPer1M: number;
  latencyClass: "low" | "medium" | "high";
  qualityClass: "standard" | "advanced" | "maximum";
  enabled: boolean;
};
