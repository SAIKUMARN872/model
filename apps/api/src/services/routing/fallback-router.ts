import type { ClassificationResult } from "./classifier.js";
import { rankAdaptiveCandidates, type AdaptiveCandidate } from "./adaptive-router.js";
import { providerManager } from "../providers/provider-manager.js";

export type FallbackCandidate = AdaptiveCandidate & {
  providerAvailable: boolean;
};

export async function rankAvailableCandidates(
  classification: ClassificationResult,
): Promise<FallbackCandidate[]> {
  const candidates = rankAdaptiveCandidates(classification);

  const checked = await Promise.all(
    candidates.map(async (candidate) => {
      const provider = providerManager.get(candidate.model.provider);

      if (!provider) {
        return {
          ...candidate,
          providerAvailable: false,
        };
      }

      try {
        const health = await provider.healthCheck();

        return {
          ...candidate,
          providerAvailable: health.healthy,
        };
      } catch {
        return {
          ...candidate,
          providerAvailable: false,
        };
      }
    }),
  );

  return checked;
}

export async function selectAvailableCandidate(
  classification: ClassificationResult,
): Promise<FallbackCandidate> {
  const candidates = await rankAvailableCandidates(classification);
  const available = candidates.find((candidate) => candidate.providerAvailable);

  if (!available) {
    throw new Error("No healthy provider is available for this request.");
  }

  return available;
}
