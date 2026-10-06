import type { ClassificationResult } from "./classifier.js";
import type { ModelSelection, ModelTier } from "./model-selector.js";
import { listModels } from "../model-registry/model-registry.js";
import type { RegisteredModel } from "../model-registry/model-types.js";
import { performanceService } from "../performance/index.js";

export type AdaptiveCandidate = {
  model: RegisteredModel;
  score: number;
  observed: boolean;
  observedLatencyMs: number | null;
  successRate: number | null;
};

function tierQualityScore(tier: ModelTier): number {
  if (tier === "LLM") return 100;
  if (tier === "MLM") return 75;
  return 50;
}

function costScore(model: RegisteredModel): number {
  const cost = model.inputCostPer1M + model.outputCostPer1M;

  if (cost === 0) return 100;
  if (cost <= 1) return 75;
  if (cost <= 10) return 45;
  return 20;
}

function registryLatencyScore(model: RegisteredModel): number {
  if (model.latencyClass === "low") return 100;
  if (model.latencyClass === "medium") return 65;
  return 30;
}

function observedLatencyScore(latencyMs: number): number {
  if (latencyMs <= 2000) return 100;
  if (latencyMs <= 10000) return 70;
  if (latencyMs <= 30000) return 45;
  if (latencyMs <= 60000) return 20;
  return 0;
}

function supportsCapabilities(
  model: RegisteredModel,
  classification: ClassificationResult,
): boolean {
  return classification.capabilities.every((capability) =>
    model.capabilities.includes(capability),
  );
}

function qualityScore(
  model: RegisteredModel,
  classification: ClassificationResult,
): number {
  const required = classification.qualityRequirement;

  if (required === "maximum") {
    return model.qualityClass === "maximum" ? 100 : 0;
  }

  if (required === "advanced") {
    if (model.qualityClass === "maximum") return 100;
    if (model.qualityClass === "advanced") return 90;
    return 20;
  }

  if (model.qualityClass === "standard") return 100;
  if (model.qualityClass === "advanced") return 90;
  return 85;
}

function calculateCandidate(
  model: RegisteredModel,
  classification: ClassificationResult,
): AdaptiveCandidate {
  const performance = performanceService.getModelPerformance(model.providerModel);
  const observed = performance !== null;

  const latency = observed
    ? observedLatencyScore(performance.averageLatencyMs)
    : registryLatencyScore(model);

  const reliability = performance?.successRate ?? 80;
  const quality = qualityScore(model, classification);
  const cost = costScore(model);
  const capability = supportsCapabilities(model, classification) ? 100 : 0;

  const score =
    capability * 0.30 +
    quality * 0.30 +
    latency * 0.20 +
    cost * 0.10 +
    reliability * 0.10;

  return {
    model,
    score,
    observed,
    observedLatencyMs: performance?.averageLatencyMs ?? null,
    successRate: performance?.successRate ?? null,
  };
}

export function rankAdaptiveCandidates(
  classification: ClassificationResult,
): AdaptiveCandidate[] {
  return listModels()
    .filter((model) => supportsCapabilities(model, classification))
    .map((model) => calculateCandidate(model, classification))
    .sort((a, b) => b.score - a.score);
}

export function selectAdaptiveModel(
  classification: ClassificationResult,
): ModelSelection {
  const ranked = rankAdaptiveCandidates(classification);

  if (ranked.length === 0) {
    throw new Error(
      `No registered model supports the required capabilities: ${classification.capabilities.join(", ")}`,
    );
  }

  const winner = ranked[0];

  let estimatedLatency: "low" | "medium" | "high";

  if (winner.observedLatencyMs !== null) {
    if (winner.observedLatencyMs <= 2000) estimatedLatency = "low";
    else if (winner.observedLatencyMs <= 10000) estimatedLatency = "medium";
    else estimatedLatency = "high";
  } else {
    estimatedLatency = winner.model.latencyClass;
  }

  const totalCost =
    winner.model.inputCostPer1M + winner.model.outputCostPer1M;

  let estimatedCost: "low" | "medium" | "high";

  if (totalCost === 0) estimatedCost = "low";
  else if (totalCost <= 10) estimatedCost = "medium";
  else estimatedCost = "high";

  return {
    tier: winner.model.tier,
    model: winner.model.id,
    estimatedCost,
    estimatedLatency,
    qualityTarget: classification.qualityRequirement,
    score: Math.round(winner.score * 100) / 100,
  };
}

export function explainAdaptiveRouting(
  classification: ClassificationResult,
) {
  return rankAdaptiveCandidates(classification).map((item) => ({
    model: item.model.id,
    provider: item.model.provider,
    providerModel: item.model.providerModel,
    tier: item.model.tier,
    score: Math.round(item.score * 100) / 100,
    observed: item.observed,
    observedLatencyMs: item.observedLatencyMs,
    successRate: item.successRate,
  }));
}
