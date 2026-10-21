import type { ClassificationResult } from "../routing/classifier.js";
import type { AdaptiveCandidate } from "../routing/adaptive-router.js";
import type { OptimizationPriority, OptimizationResult, OptimizationWeights } from "./optimization-types.js";

export function getOptimizationWeights(
  priority: OptimizationPriority = "balanced",
): OptimizationWeights {
  switch (priority) {
    case "cost":
      return { cost: 0.50, latency: 0.10, quality: 0.15, capability: 0.15, reliability: 0.10 };
    case "latency":
      return { cost: 0.05, latency: 0.50, quality: 0.15, capability: 0.20, reliability: 0.10 };
    case "quality":
      return { cost: 0.05, latency: 0.10, quality: 0.55, capability: 0.20, reliability: 0.10 };
    default:
      return { cost: 0.20, latency: 0.25, quality: 0.30, capability: 0.15, reliability: 0.10 };
  }
}

function qualityRank(quality: "standard" | "advanced" | "maximum"): number {
  if (quality === "maximum") return 3;
  if (quality === "advanced") return 2;
  return 1;
}

function meetsQualityFloor(
  candidate: AdaptiveCandidate,
  classification: ClassificationResult,
): boolean {
  return qualityRank(candidate.model.qualityClass) >=
    qualityRank(classification.qualityRequirement);
}

function meetsContextRequirement(
  candidate: AdaptiveCandidate,
  classification: ClassificationResult,
): boolean {
  if (!classification.longContext) return true;

  return candidate.model.contextWindow >= 32000;
}

function getQualityScore(candidate: AdaptiveCandidate): number {
  if (candidate.model.qualityClass === "maximum") return 100;
  if (candidate.model.qualityClass === "advanced") return 85;
  return 65;
}

function getCostScore(candidate: AdaptiveCandidate): number {
  const cost = candidate.model.inputCostPer1M + candidate.model.outputCostPer1M;

  if (cost === 0) return 100;
  if (cost <= 1) return 75;
  if (cost <= 10) return 45;
  return 20;
}

function getLatencyScore(candidate: AdaptiveCandidate): number {
  if (candidate.observedLatencyMs !== null) {
    const latency = candidate.observedLatencyMs;

    if (latency <= 2000) return 100;
    if (latency <= 10000) return 75;
    if (latency <= 30000) return 50;
    if (latency <= 60000) return 25;
    return 0;
  }

  if (candidate.model.latencyClass === "low") return 100;
  if (candidate.model.latencyClass === "medium") return 65;
  return 30;
}

function getCapabilityScore(
  candidate: AdaptiveCandidate,
  classification: ClassificationResult,
): number {
  const supported = classification.capabilities.every((capability) =>
    candidate.model.capabilities.includes(capability),
  );

  return supported ? 100 : 0;
}

function getReliabilityScore(candidate: AdaptiveCandidate): number {
  return candidate.successRate ?? 80;
}

function calculateScore(
  candidate: AdaptiveCandidate,
  classification: ClassificationResult,
  weights: OptimizationWeights,
): number {
  const costScore = getCostScore(candidate);
  const latencyScore = getLatencyScore(candidate);
  const qualityScore = getQualityScore(candidate);
  const capabilityScore = getCapabilityScore(candidate, classification);
  const reliabilityScore = getReliabilityScore(candidate);

  const score =
    costScore * weights.cost +
    latencyScore * weights.latency +
    qualityScore * weights.quality +
    capabilityScore * weights.capability +
    reliabilityScore * weights.reliability;

  return score;
}

export function optimizeCandidates(
  candidates: AdaptiveCandidate[],
  classification: ClassificationResult,
  priority: OptimizationPriority = "balanced",
): OptimizationResult[] {
  const weights = getOptimizationWeights(priority);

  const eligibleCandidates = candidates.filter((candidate) =>
    meetsQualityFloor(candidate, classification) &&
    meetsContextRequirement(candidate, classification),
  );

  return eligibleCandidates
    .map((candidate): OptimizationResult => ({
      model: candidate.model.id,
      provider: candidate.model.provider,
      tier: candidate.model.tier,
      score: Math.round(calculateScore(candidate, classification, weights) * 100) / 100,
      weights,
      observed: candidate.observed,
      observedLatencyMs: candidate.observedLatencyMs,
      successRate: candidate.successRate,
    }))
    .sort((a, b) => b.score - a.score);
}
