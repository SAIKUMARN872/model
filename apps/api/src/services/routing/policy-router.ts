import type { ModelSelection, ModelTier } from "./model-selector.js";

export type RoutingPolicy = {
  preferredTier?: ModelTier;
  prioritize?: "cost" | "latency" | "quality";
};

export type PolicyResult = ModelSelection & {
  policy: "balanced" | "cost" | "latency" | "quality";
};

export function applyPolicy(
  selection: ModelSelection,
  policy: RoutingPolicy = {},
): PolicyResult {
  const prioritize = policy.prioritize ?? "balanced";

  if (prioritize === "cost" && selection.tier === "LLM") {
    return {
      ...selection,
      tier: "MLM",
      model: "deepseek-mid",
      estimatedCost: "medium",
      qualityTarget: "advanced",
      policy: "cost",
    };
  }

  if (prioritize === "latency" && selection.tier !== "SLM") {
    return {
      ...selection,
      tier: "SLM",
      model: "qwen-small",
      estimatedCost: "low",
      estimatedLatency: "low",
      qualityTarget: "standard",
      policy: "latency",
    };
  }

  if (prioritize === "quality" && selection.tier !== "LLM") {
    return {
      ...selection,
      tier: "LLM",
      model: "foundation-reasoning",
      estimatedCost: "high",
      estimatedLatency: "medium",
      qualityTarget: "maximum",
      policy: "quality",
    };
  }

  return {
    ...selection,
    policy: "balanced",
  };
}
