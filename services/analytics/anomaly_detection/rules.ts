/**
 * ModelNow Analytics
 * Anomaly Detection Rules
 *
 * Design goals:
 * - Deterministic
 * - Explainable
 * - Tenant-aware
 * - Extensible
 * - No external dependencies
 */

export type AnomalySeverity =
  | "info"
  | "low"
  | "medium"
  | "high"
  | "critical";

export type AnomalyMetric =
  | "latency"
  | "cost"
  | "error_rate"
  | "quality"
  | "token_usage"
  | "request_volume"
  | "cache_hit_rate";

export interface AnomalyRuleContext {
  organizationId: string;
  metric: AnomalyMetric;

  /**
   * Current observed value.
   */
  currentValue: number;

  /**
   * Historical baseline.
   */
  baselineValue: number;

  /**
   * Standard deviation of historical observations.
   */
  standardDeviation?: number;

  /**
   * Optional percentage change from baseline.
   *
   * Example:
   * baseline = 100
   * current = 150
   * percentageChange = 50
   */
  percentageChange: number;

  /**
   * Number of observations used for baseline.
   */
  sampleSize: number;

  /**
   * Optional dimensions.
   */
  dimensions?: {
    provider?: string;
    model?: string;
    capability?: string;
    environment?: string;
  };

  timestamp: Date;
}

export interface AnomalyRuleResult {
  triggered: boolean;

  severity: AnomalySeverity;

  confidence: number;

  title: string;

  description: string;

  evidence: Record<string, unknown>;

  recommendation?: string;
}

export interface AnomalyRule {
  readonly id: string;

  readonly metric: AnomalyMetric;

  evaluate(context: AnomalyRuleContext): AnomalyRuleResult;
}

/**
 * Utility functions
 */

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function calculateZScore(
  currentValue: number,
  baselineValue: number,
  standardDeviation?: number,
): number {
  if (
    standardDeviation === undefined ||
    standardDeviation <= 0
  ) {
    return 0;
  }

  return (
    (currentValue - baselineValue) /
    standardDeviation
  );
}

function confidenceFromZScore(zScore: number): number {
  const magnitude = Math.abs(zScore);

  if (magnitude >= 5) return 0.99;
  if (magnitude >= 4) return 0.97;
  if (magnitude >= 3) return 0.95;
  if (magnitude >= 2.5) return 0.90;
  if (magnitude >= 2) return 0.80;

  return clamp(magnitude / 2, 0, 0.79);
}

function confidenceFromPercentageChange(
  percentageChange: number,
): number {
  const magnitude = Math.abs(percentageChange);

  if (magnitude >= 500) return 0.99;
  if (magnitude >= 250) return 0.97;
  if (magnitude >= 150) return 0.95;
  if (magnitude >= 75) return 0.90;
  if (magnitude >= 25) return 0.80;

  return clamp(magnitude / 25, 0, 0.79);
}

/**
 * Base class used by numerical anomaly rules.
 */
abstract class BaseAnomalyRule implements AnomalyRule {
  abstract readonly id: string;
  abstract readonly metric: AnomalyMetric;

  abstract evaluate(
    context: AnomalyRuleContext,
  ): AnomalyRuleResult;

  protected result(
    context: AnomalyRuleContext,
    params: {
      severity: AnomalySeverity;
      title: string;
      description: string;
      triggered: boolean;
      zScore?: number;
      recommendation?: string;
    },
  ): AnomalyRuleResult {
    const zScore =
      params.zScore ??
      calculateZScore(
        context.currentValue,
        context.baselineValue,
        context.standardDeviation,
      );

    const confidence = params.triggered
      ? Math.max(
          confidenceFromZScore(zScore),
          confidenceFromPercentageChange(
            context.percentageChange,
          ),
        )
      : 0;

    return {
      triggered: params.triggered,
      severity: params.severity,
      confidence,
      title: params.title,
      description: params.description,

      evidence: {
        organizationId: context.organizationId,
        metric: context.metric,
        currentValue: context.currentValue,
        baselineValue: context.baselineValue,
        standardDeviation:
          context.standardDeviation ?? null,
        percentageChange:
          context.percentageChange,
        sampleSize: context.sampleSize,
        zScore,
        dimensions: context.dimensions ?? {},
        timestamp: context.timestamp.toISOString(),
      },

      recommendation: params.recommendation,
    };
  }
}

/**
 * High latency detection
 */
export class HighLatencyRule extends BaseAnomalyRule {
  readonly id = "latency.high";
  readonly metric: AnomalyMetric = "latency";

  evaluate(
    context: AnomalyRuleContext,
  ): AnomalyRuleResult {
    const zScore = calculateZScore(
      context.currentValue,
      context.baselineValue,
      context.standardDeviation,
    );

    const triggered =
      context.currentValue >= 1000 &&
      (
        context.percentageChange >= 50 ||
        zScore >= 2.5
      );

    let severity: AnomalySeverity = "low";

    if (context.currentValue >= 5000) {
      severity = "critical";
    } else if (context.currentValue >= 3000) {
      severity = "high";
    } else if (context.currentValue >= 2000) {
      severity = "medium";
    }

    return this.result(context, {
      triggered,
      severity,
      zScore,

      title: "High latency detected",

      description:
        `Latency increased to ${context.currentValue.toFixed(2)}ms ` +
        `from a baseline of ${context.baselineValue.toFixed(2)}ms ` +
        `(${context.percentageChange.toFixed(2)}% change).`,

      recommendation:
        "Inspect provider latency, model selection, prompt size, " +
        "retrieval latency, network latency, and downstream dependencies.",
    });
  }
}

/**
 * High cost detection
 */
export class HighCostRule extends BaseAnomalyRule {
  readonly id = "cost.high";
  readonly metric: AnomalyMetric = "cost";

  evaluate(
    context: AnomalyRuleContext,
  ): AnomalyRuleResult {
    const zScore = calculateZScore(
      context.currentValue,
      context.baselineValue,
      context.standardDeviation,
    );

    const triggered =
      context.percentageChange >= 40 ||
      zScore >= 2.5;

    let severity: AnomalySeverity = "low";

    if (
      context.percentageChange >= 200 ||
      zScore >= 5
    ) {
      severity = "critical";
    } else if (
      context.percentageChange >= 100 ||
      zScore >= 4
    ) {
      severity = "high";
    } else if (
      context.percentageChange >= 70 ||
      zScore >= 3
    ) {
      severity = "medium";
    }

    return this.result(context, {
      triggered,
      severity,
      zScore,

      title: "AI cost anomaly detected",

      description:
        `Cost increased to ${context.currentValue.toFixed(6)} ` +
        `from a baseline of ${context.baselineValue.toFixed(6)} ` +
        `(${context.percentageChange.toFixed(2)}% change).`,

      recommendation:
        "Inspect token consumption, model routing, retry volume, " +
        "prompt growth, unnecessary context, and model pricing.",
    });
  }
}

/**
 * Error-rate detection
 */
export class ErrorRateRule extends BaseAnomalyRule {
  readonly id = "error_rate.high";
  readonly metric: AnomalyMetric = "error_rate";

  evaluate(
    context: AnomalyRuleContext,
  ): AnomalyRuleResult {
    const zScore = calculateZScore(
      context.currentValue,
      context.baselineValue,
      context.standardDeviation,
    );

    const triggered =
      context.currentValue >= 0.05 &&
      (
        context.percentageChange >= 50 ||
        zScore >= 2.5
      );

    let severity: AnomalySeverity = "low";

    if (context.currentValue >= 0.30) {
      severity = "critical";
    } else if (context.currentValue >= 0.15) {
      severity = "high";
    } else if (context.currentValue >= 0.08) {
      severity = "medium";
    }

    return this.result(context, {
      triggered,
      severity,
      zScore,

      title: "Elevated error rate detected",

      description:
        `Error rate increased to ${(context.currentValue * 100).toFixed(2)}% ` +
        `from ${(context.baselineValue * 100).toFixed(2)}%.`,

      recommendation:
        "Inspect provider failures, rate limits, timeouts, invalid requests, " +
        "authentication failures, downstream services, and retry storms.",
    });
  }
}

/**
 * Quality degradation detection.
 *
 * Quality is different from latency/cost:
 * lower is worse.
 */
export class QualityDegradationRule
  extends BaseAnomalyRule {

  readonly id = "quality.degradation";
  readonly metric: AnomalyMetric = "quality";

  evaluate(
    context: AnomalyRuleContext,
  ): AnomalyRuleResult {
    const drop =
      context.baselineValue -
      context.currentValue;

    const percentageDrop =
      context.baselineValue === 0
        ? 0
        : (drop / context.baselineValue) * 100;

    const triggered =
      percentageDrop >= 10 ||
      (
        context.standardDeviation !== undefined &&
        context.standardDeviation > 0 &&
        calculateZScore(
          context.currentValue,
          context.baselineValue,
          context.standardDeviation,
        ) <= -2.5
      );

    let severity: AnomalySeverity = "low";

    if (percentageDrop >= 40) {
      severity = "critical";
    } else if (percentageDrop >= 25) {
      severity = "high";
    } else if (percentageDrop >= 15) {
      severity = "medium";
    }

    return this.result(context, {
      triggered,
      severity,

      title: "AI quality degradation detected",

      description:
        `Quality decreased from ${context.baselineValue.toFixed(4)} ` +
        `to ${context.currentValue.toFixed(4)} ` +
        `(${percentageDrop.toFixed(2)}% degradation).`,

      recommendation:
        "Inspect retrieval quality, prompt changes, model routing, " +
        "context quality, evaluation datasets, and recent deployments.",
    });
  }
}

/**
 * Token usage spike
 */
export class TokenUsageSpikeRule extends BaseAnomalyRule {
  readonly id = "token_usage.spike";
  readonly metric: AnomalyMetric = "token_usage";

  evaluate(
    context: AnomalyRuleContext,
  ): AnomalyRuleResult {
    const zScore = calculateZScore(
      context.currentValue,
      context.baselineValue,
      context.standardDeviation,
    );

    const triggered =
      context.percentageChange >= 50 ||
      zScore >= 3;

    return this.result(context, {
      triggered,

      severity:
        context.percentageChange >= 200
          ? "critical"
          : context.percentageChange >= 100
            ? "high"
            : context.percentageChange >= 70
              ? "medium"
              : "low",

      zScore,

      title: "Token usage spike detected",

      description:
        `Token consumption increased by ` +
        `${context.percentageChange.toFixed(2)}%.`,

      recommendation:
        "Inspect prompt length, retrieved context size, conversation history, " +
        "tool output size, and recursive agent execution.",
    });
  }
}

/**
 * Request volume spike
 */
export class RequestVolumeSpikeRule extends BaseAnomalyRule {
  readonly id = "request_volume.spike";
  readonly metric: AnomalyMetric = "request_volume";

  evaluate(
    context: AnomalyRuleContext,
  ): AnomalyRuleResult {
    const zScore = calculateZScore(
      context.currentValue,
      context.baselineValue,
      context.standardDeviation,
    );

    const triggered =
      context.percentageChange >= 100 ||
      zScore >= 3;

    return this.result(context, {
      triggered,

      severity:
        context.percentageChange >= 500
          ? "critical"
          : context.percentageChange >= 300
            ? "high"
            : context.percentageChange >= 150
              ? "medium"
              : "low",

      zScore,

      title: "Request volume spike detected",

      description:
        `Request volume increased by ` +
        `${context.percentageChange.toFixed(2)}%.`,

      recommendation:
        "Inspect traffic sources, automation loops, retry storms, " +
        "bot traffic, abuse, and unexpected application behavior.",
    });
  }
}

/**
 * Cache hit-rate degradation.
 *
 * Lower cache hit rate can indirectly increase:
 * - latency
 * - token consumption
 * - provider cost
 */
export class CacheHitRateDegradationRule
  extends BaseAnomalyRule {

  readonly id = "cache_hit_rate.degradation";
  readonly metric: AnomalyMetric = "cache_hit_rate";

  evaluate(
    context: AnomalyRuleContext,
  ): AnomalyRuleResult {
    const drop =
      context.baselineValue -
      context.currentValue;

    const triggered =
      drop >= 0.15 ||
      (
        context.standardDeviation !== undefined &&
        context.standardDeviation > 0 &&
        calculateZScore(
          context.currentValue,
          context.baselineValue,
          context.standardDeviation,
        ) <= -2.5
      );

    return this.result(context, {
      triggered,

      severity:
        drop >= 0.40
          ? "critical"
          : drop >= 0.30
            ? "high"
            : drop >= 0.20
              ? "medium"
              : "low",

      title: "Cache hit-rate degradation detected",

      description:
        `Cache hit rate dropped from ` +
        `${(context.baselineValue * 100).toFixed(2)}% to ` +
        `${(context.currentValue * 100).toFixed(2)}%.`,

      recommendation:
        "Inspect cache keys, TTL configuration, cache eviction, " +
        "embedding/query normalization, and cache capacity.",
    });
  }
}

/**
 * Default production rules.
 */
export function createDefaultAnomalyRules(): AnomalyRule[] {
  return [
    new HighLatencyRule(),
    new HighCostRule(),
    new ErrorRateRule(),
    new QualityDegradationRule(),
    new TokenUsageSpikeRule(),
    new RequestVolumeSpikeRule(),
    new CacheHitRateDegradationRule(),
  ];
}