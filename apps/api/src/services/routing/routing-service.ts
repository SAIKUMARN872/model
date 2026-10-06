import { classifyPrompt } from "./classifier.js";
import { rankAdaptiveCandidates } from "./adaptive-router.js";
import {
  optimizeCandidates,
  type OptimizationPriority,
} from "../optimization/index.js";
import { explainRegisteredModels } from "../optimization/routing-explainability.js";
import { getModel, listModels } from "../model-registry/model-registry.js";
import { providerManager } from "../providers/provider-manager.js";

export class RoutingError extends Error {
  readonly classification: ReturnType<typeof classifyPrompt>;
  readonly explainability: Awaited<
    ReturnType<typeof explainRegisteredModels>
  >;

  constructor(
    message: string,
    classification: ReturnType<typeof classifyPrompt>,
    explainability: Awaited<ReturnType<typeof explainRegisteredModels>>,
  ) {
    super(message);
    this.name = "RoutingError";
    this.classification = classification;
    this.explainability = explainability;
  }
}

export async function routePrompt(
  prompt: string,
  policy: { prioritize?: OptimizationPriority } = {},
) {
  const classification = classifyPrompt(prompt);

  const explainability = await explainRegisteredModels(
    listModels(),
    classification,
  );

  const executionEligibleIds = new Set(
    explainability
      .filter((candidate) => candidate.executionEligible)
      .map((candidate) => candidate.model),
  );

  const adaptiveCandidates = rankAdaptiveCandidates(classification);

  const capableCandidates = adaptiveCandidates.map((candidate) => {
    const explanation = explainability.find(
      (item) => item.model === candidate.model.id,
    );

    return {
      candidate,
      explanation,
    };
  });

  const executionEligibleCandidates = capableCandidates
    .filter((item) => executionEligibleIds.has(item.candidate.model.id))
    .map((item) => item.candidate);

  if (executionEligibleCandidates.length === 0) {
    throw new RoutingError(
      "No execution-eligible model is available for this request.",
      classification,
      explainability,
    );
  }

  const optimizationResults = optimizeCandidates(
    executionEligibleCandidates,
    classification,
    policy.prioritize ?? "balanced",
  );

  const winner = optimizationResults[0];

  if (!winner) {
    throw new RoutingError(
      "Optimization engine could not select a model.",
      classification,
      explainability,
    );
  }

  const registeredModel = getModel(winner.model);

  if (!registeredModel) {
    throw new RoutingError(
      `Model is not registered: ${winner.model}`,
      classification,
      explainability,
    );
  }

  const provider = providerManager.get(registeredModel.provider);

  if (!provider) {
    throw new RoutingError(
      `Provider is not registered: ${registeredModel.provider}`,
      classification,
      explainability,
    );
  }

  let estimatedLatency: "low" | "medium" | "high";

  if (winner.observedLatencyMs !== null) {
    if (winner.observedLatencyMs <= 2000) {
      estimatedLatency = "low";
    } else if (winner.observedLatencyMs <= 10000) {
      estimatedLatency = "medium";
    } else {
      estimatedLatency = "high";
    }
  } else {
    estimatedLatency = registeredModel.latencyClass;
  }

  const totalCost =
    registeredModel.inputCostPer1M + registeredModel.outputCostPer1M;

  let estimatedCost: "low" | "medium" | "high";

  if (totalCost === 0) {
    estimatedCost = "low";
  } else if (totalCost <= 10) {
    estimatedCost = "medium";
  } else {
    estimatedCost = "high";
  }

  return {
    classification,
    routing: {
      tier: registeredModel.tier,
      model: registeredModel.id,
      estimatedCost,
      estimatedLatency,
      qualityTarget: classification.qualityRequirement,
      score: winner.score,
      policy: policy.prioritize ?? "balanced",
    },
    model: registeredModel,
    provider,
    candidates: optimizationResults.map((result) => ({
      ...result,
      providerAvailable: true,
    })),
    explainability,
  };
}