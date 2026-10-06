import type { ClassificationResult } from "../routing/classifier.js";
import type { RegisteredModel } from "../model-registry/model-types.js";
import type { RoutingDecision } from "../routing/routing-decision.js";
import { createRoutingDecision } from "../routing/routing-decision.js";
import { providerManager } from "../providers/provider-manager.js";

export type CandidateExplanation = {
  model: string;
  provider: string;
  tier: "SLM" | "MLM" | "LLM";
  capabilityEligible: boolean;
  executionEligible: boolean;
  eligible: boolean;
  providerAvailable: boolean;
  providerHealthy: boolean;
  decisions: RoutingDecision[];
};

function qualityRank(quality: "standard" | "advanced" | "maximum"): number {
  if (quality === "maximum") return 3;
  if (quality === "advanced") return 2;
  return 1;
}

export async function explainRegisteredModels(
  models: RegisteredModel[],
  classification: ClassificationResult,
): Promise<CandidateExplanation[]> {
  const explanations: CandidateExplanation[] = [];

  const healthResults = await providerManager.healthCheckAll();

  for (const model of models) {
    const decisions: RoutingDecision[] = [];

    for (const capability of classification.capabilities) {
      if (!model.capabilities.includes(capability)) {
        decisions.push(
          createRoutingDecision(
            "MISSING_CAPABILITY",
            `Missing capability: ${capability}`,
          ),
        );
      }
    }

    if (
      qualityRank(model.qualityClass) <
      qualityRank(classification.qualityRequirement)
    ) {
      decisions.push(
        createRoutingDecision(
          "QUALITY_REQUIREMENT",
          `Quality below requirement: ${classification.qualityRequirement}`,
        ),
      );
    }

    if (classification.longContext && model.contextWindow < 32000) {
      decisions.push(
        createRoutingDecision(
          "CONTEXT_REQUIREMENT",
          "Insufficient context window for long-context request",
        ),
      );
    }

    if (!model.enabled) {
      decisions.push(
        createRoutingDecision(
          "MODEL_DISABLED",
          `Model is disabled: ${model.id}`,
        ),
      );
    }

    const capabilityEligible = decisions.length === 0;

    const providerAvailable = providerManager.get(model.provider) !== undefined;
    let providerHealthy = false;

    if (!providerAvailable) {
      decisions.push(
        createRoutingDecision(
          "PROVIDER_UNAVAILABLE",
          `Provider is not registered: ${model.provider}`,
        ),
      );
    } else {
      const health = healthResults.get(model.provider);

      if (!health) {
        decisions.push(
          createRoutingDecision(
            "PROVIDER_UNHEALTHY",
            `Provider health result unavailable: ${model.provider}`,
          ),
        );
      } else {
        providerHealthy = health.healthy;

        if (!providerHealthy) {
          decisions.push(
            createRoutingDecision(
              "PROVIDER_UNHEALTHY",
              health.error ?? `Provider is unhealthy: ${model.provider}`,
            ),
          );
        }
      }
    }

    const executionEligible =
      capabilityEligible &&
      providerAvailable &&
      providerHealthy;

    explanations.push({
      model: model.id,
      provider: model.provider,
      tier: model.tier,
      capabilityEligible,
      executionEligible,
      eligible: capabilityEligible && executionEligible,
      providerAvailable,
      providerHealthy,
      decisions:
        decisions.length === 0
          ? [
              createRoutingDecision(
                "ELIGIBLE",
                "Model satisfies routing, provider, and health requirements",
              ),
            ]
          : decisions,
    });
  }

  return explanations;
}
