import type { RegisteredModel } from "./model-types.js";

const models: RegisteredModel[] = [
  {
    id: "qwen-small",
    name: "Qwen Small",
    provider: "ollama",
    providerModel: "qwen3:1.7b",
    tier: "SLM",
    capabilities: ["basic_qa", "coding"],
    contextWindow: 32768,
    inputCostPer1M: 0,
    outputCostPer1M: 0,
    latencyClass: "high",
    qualityClass: "standard",
    enabled: true,
  },
  {
    id: "deepseek-code-mid",
    name: "DeepSeek Code Mid",
    provider: "deepseek",
    providerModel: "deepseek-chat",
    tier: "MLM",
    capabilities: ["coding", "reasoning", "multi_step"],
    contextWindow: 65536,
    inputCostPer1M: 0.28,
    outputCostPer1M: 0.42,
    latencyClass: "medium",
    qualityClass: "advanced",
    enabled: true,
  },
  {
    id: "deepseek-mid",
    name: "DeepSeek Mid",
    provider: "deepseek",
    providerModel: "deepseek-chat",
    tier: "MLM",
    capabilities: ["basic_qa", "reasoning", "multi_step"],
    contextWindow: 65536,
    inputCostPer1M: 0.28,
    outputCostPer1M: 0.42,
    latencyClass: "medium",
    qualityClass: "advanced",
    enabled: true,
  },
  {
    id: "foundation-reasoning",
    name: "Foundation Reasoning",
    provider: "openai",
    providerModel: "configured-foundation-model",
    tier: "LLM",
    capabilities: [
      "reasoning",
      "coding",
      "architecture",
      "enterprise",
      "security",
      "long_context",
      "multi_step",
    ],
    contextWindow: 128000,
    inputCostPer1M: 5.00,
    outputCostPer1M: 15.00,
    latencyClass: "medium",
    qualityClass: "maximum",
    enabled: true,
  },
];

export function listModels(): RegisteredModel[] {
  return models.filter((model) => model.enabled);
}

export function getModel(modelId: string): RegisteredModel | undefined {
  return models.find(
    (model) => model.id === modelId && model.enabled,
  );
}

export function getModelsByTier(tier: RegisteredModel["tier"]): RegisteredModel[] {
  return listModels().filter((model) => model.tier === tier);
}
