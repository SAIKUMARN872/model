import type { ClassificationResult } from "./classifier.js";

export type ModelTier = "SLM" | "MLM" | "LLM";

export type ModelSelection = {
  tier: ModelTier;
  model: string;
  estimatedCost: "low" | "medium" | "high";
  estimatedLatency: "low" | "medium" | "high";
  qualityTarget: "standard" | "advanced" | "maximum";
  score: number;
};

export function selectModel(
  classification: ClassificationResult,
): ModelSelection {
  const { complexity, qualityRequirement, capabilities } = classification;

  const requiresMaximumQuality = qualityRequirement === "maximum";
  const requiresAdvancedQuality = qualityRequirement === "advanced";
  const requiresArchitecture = capabilities.includes("architecture");
  const requiresSecurity = capabilities.includes("security");
  const requiresLongContext = capabilities.includes("long_context");

  if (
    requiresMaximumQuality ||
    requiresArchitecture ||
    (requiresSecurity && complexity >= 60) ||
    (requiresLongContext && complexity >= 70)
  ) {
    return {
      tier: "LLM",
      model: "foundation-reasoning",
      estimatedCost: "high",
      estimatedLatency: "medium",
      qualityTarget: "maximum",
      score: complexity,
    };
  }

  if (requiresAdvancedQuality || complexity >= 40) {
    return {
      tier: "MLM",
      model: classification.codingRequired ? "deepseek-code-mid" : "deepseek-mid",
      estimatedCost: "medium",
      estimatedLatency: "medium",
      qualityTarget: "advanced",
      score: complexity,
    };
  }

  return {
    tier: "SLM",
    model: "qwen-small",
    estimatedCost: "low",
    estimatedLatency: "low",
    qualityTarget: "standard",
    score: complexity,
  };
}
