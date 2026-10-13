export interface QualityDimensions {
  accuracy?: number;
  relevance?: number;
  completeness?: number;
  consistency?: number;
  clarity?: number;
}

export interface QualityWeights {
  accuracy?: number;
  relevance?: number;
  completeness?: number;
  consistency?: number;
  clarity?: number;
}

export interface QualityScoreResult {
  score: number;
  percentage: number;
  grade: "excellent" | "good" | "fair" | "poor";
  dimensions: Required<QualityDimensions>;
  weights: Required<QualityWeights>;
}

const DEFAULT_WEIGHTS: Required<QualityWeights> = {
  accuracy: 0.4,
  relevance: 0.2,
  completeness: 0.2,
  consistency: 0.1,
  clarity: 0.1,
};

function normalizeDimension(value: number | undefined, name: string): number {
  const normalized = value ?? 0;

  if (!Number.isFinite(normalized) || normalized < 0 || normalized > 1) {
    throw new RangeError(`${name} must be a number between 0 and 1.`);
  }

  return normalized;
}

export function calculateQualityScore(
  dimensions: QualityDimensions,
  weights: QualityWeights = {},
): QualityScoreResult {
  const normalizedDimensions: Required<QualityDimensions> = {
    accuracy: normalizeDimension(dimensions.accuracy, "accuracy"),
    relevance: normalizeDimension(dimensions.relevance, "relevance"),
    completeness: normalizeDimension(dimensions.completeness, "completeness"),
    consistency: normalizeDimension(dimensions.consistency, "consistency"),
    clarity: normalizeDimension(dimensions.clarity, "clarity"),
  };

  const normalizedWeights: Required<QualityWeights> = {
    accuracy: weights.accuracy ?? DEFAULT_WEIGHTS.accuracy,
    relevance: weights.relevance ?? DEFAULT_WEIGHTS.relevance,
    completeness: weights.completeness ?? DEFAULT_WEIGHTS.completeness,
    consistency: weights.consistency ?? DEFAULT_WEIGHTS.consistency,
    clarity: weights.clarity ?? DEFAULT_WEIGHTS.clarity,
  };

  for (const [name, weight] of Object.entries(normalizedWeights)) {
    if (!Number.isFinite(weight) || weight < 0) {
      throw new RangeError(`${name} weight must be a non-negative finite number.`);
    }
  }

  const totalWeight = Object.values(normalizedWeights).reduce(
    (total, weight) => total + weight,
    0,
  );

  if (totalWeight <= 0) {
    throw new RangeError("At least one quality weight must be greater than zero.");
  }

  const weightedScore =
    normalizedDimensions.accuracy * normalizedWeights.accuracy +
    normalizedDimensions.relevance * normalizedWeights.relevance +
    normalizedDimensions.completeness * normalizedWeights.completeness +
    normalizedDimensions.consistency * normalizedWeights.consistency +
    normalizedDimensions.clarity * normalizedWeights.clarity;

  const score = weightedScore / totalWeight;
  const percentage = score * 100;

  let grade: QualityScoreResult["grade"];

  if (percentage >= 90) {
    grade = "excellent";
  } else if (percentage >= 75) {
    grade = "good";
  } else if (percentage >= 50) {
    grade = "fair";
  } else {
    grade = "poor";
  }

  return {
    score,
    percentage,
    grade,
    dimensions: normalizedDimensions,
    weights: normalizedWeights,
  };
}
