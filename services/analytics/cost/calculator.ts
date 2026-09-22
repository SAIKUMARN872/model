// services/analytics/cost/calculator.ts

export interface ModelPricing {
  provider: string;
  model: string;
  inputPer1KTokens: number;
  outputPer1KTokens: number;
  cachedInputPer1KTokens?: number;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens?: number;
}

export interface CostBreakdown {
  inputCost: number;
  outputCost: number;
  cachedInputCost: number;
  totalCost: number;
  currency: "USD";
}

function assertNonEmpty(
  value: string,
  field: string,
): void {
  if (!value || value.trim().length === 0) {
    throw new Error(`${field} must not be empty`);
  }
}

function validateNumber(
  value: number,
  field: string,
): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(
      `${field} must be a finite number >= 0`,
    );
  }
}

function validatePricing(
  pricing: ModelPricing,
): void {
  assertNonEmpty(pricing.provider, "provider");
  assertNonEmpty(pricing.model, "model");

  validateNumber(
    pricing.inputPer1KTokens,
    "inputPer1KTokens",
  );

  validateNumber(
    pricing.outputPer1KTokens,
    "outputPer1KTokens",
  );

  if (
    pricing.cachedInputPer1KTokens !== undefined
  ) {
    validateNumber(
      pricing.cachedInputPer1KTokens,
      "cachedInputPer1KTokens",
    );
  }
}

function validateUsage(
  usage: TokenUsage,
): void {
  validateNumber(
    usage.inputTokens,
    "inputTokens",
  );

  validateNumber(
    usage.outputTokens,
    "outputTokens",
  );

  if (
    usage.cachedInputTokens !== undefined
  ) {
    validateNumber(
      usage.cachedInputTokens,
      "cachedInputTokens",
    );
  }

  if (
    usage.cachedInputTokens !== undefined &&
    usage.cachedInputTokens > usage.inputTokens
  ) {
    throw new Error(
      "cachedInputTokens cannot exceed inputTokens",
    );
  }
}

export function calculateCost(
  pricing: ModelPricing,
  usage: TokenUsage,
): CostBreakdown {
  validatePricing(pricing);
  validateUsage(usage);

  const cachedInputTokens =
    usage.cachedInputTokens ?? 0;

  const nonCachedInputTokens =
    usage.inputTokens - cachedInputTokens;

  const inputCost =
    (nonCachedInputTokens / 1000) *
    pricing.inputPer1KTokens;

  const outputCost =
    (usage.outputTokens / 1000) *
    pricing.outputPer1KTokens;

  const cachedInputCost =
    pricing.cachedInputPer1KTokens === undefined
      ? 0
      : (cachedInputTokens / 1000) *
        pricing.cachedInputPer1KTokens;

  const totalCost =
    inputCost +
    outputCost +
    cachedInputCost;

  return {
    inputCost,
    outputCost,
    cachedInputCost,
    totalCost,
    currency: "USD",
  };
}

export function calculateCostFromTotalInput(
  pricing: ModelPricing,
  inputTokens: number,
  outputTokens: number,
): CostBreakdown {
  return calculateCost(
    pricing,
    {
      inputTokens,
      outputTokens,
    },
  );
}