// services/analytics/performance/evaluator.ts

import {
  PerformanceMetric,
  PerformanceMetricType,
  PerformanceMetricsStore,
} from "./metrics.js";

export interface PerformanceEvaluation {
  organizationId: string;
  score: number;
  grade: "excellent" | "good" | "fair" | "poor";
  latencyScore: number;
  errorScore: number;
  qualityScore: number;
  costScore: number;
  throughputScore: number;
  totalRequests: number;
  averageLatency: number;
  errorRate: number;
  averageQuality: number;
  totalCost: number;
  throughput: number;
  evaluatedAt: number;
}

export interface PerformanceEvaluationOptions {
  latencyTargetMs?: number;
  errorRateTarget?: number;
  qualityTarget?: number;
  costTarget?: number;
  throughputTarget?: number;
}

const DEFAULTS = {
  latencyTargetMs: 500,
  errorRateTarget: 0.05,
  qualityTarget: 0.9,
  costTarget: 1,
  throughputTarget: 10,
};

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function scoreLowerIsBetter(
  value: number,
  target: number,
): number {
  if (value <= target) {
    return 100;
  }

  if (target <= 0) {
    return 0;
  }

  return clamp((target / value) * 100);
}

function scoreHigherIsBetter(
  value: number,
  target: number,
): number {
  if (value >= target) {
    return 100;
  }

  if (target <= 0) {
    return 0;
  }

  return clamp((value / target) * 100);
}

function average(
  values: number[],
): number {
  if (values.length === 0) {
    return 0;
  }

  return (
    values.reduce(
      (sum, value) => sum + value,
      0,
    ) / values.length
  );
}

function sum(
  values: number[],
): number {
  return values.reduce(
    (total, value) => total + value,
    0,
  );
}

function getValues(
  metrics: PerformanceMetric[],
  type: PerformanceMetricType,
): number[] {
  return metrics
    .filter(
      (metric) => metric.metricType === type,
    )
    .map((metric) => metric.value);
}

export class PerformanceEvaluator {
  private readonly options: Required<PerformanceEvaluationOptions>;

  constructor(
    options: PerformanceEvaluationOptions = {},
  ) {
    this.options = {
      latencyTargetMs:
        options.latencyTargetMs ??
        DEFAULTS.latencyTargetMs,

      errorRateTarget:
        options.errorRateTarget ??
        DEFAULTS.errorRateTarget,

      qualityTarget:
        options.qualityTarget ??
        DEFAULTS.qualityTarget,

      costTarget:
        options.costTarget ??
        DEFAULTS.costTarget,

      throughputTarget:
        options.throughputTarget ??
        DEFAULTS.throughputTarget,
    };

    if (
      this.options.latencyTargetMs <= 0 ||
      !Number.isFinite(
        this.options.latencyTargetMs,
      )
    ) {
      throw new Error(
        "latencyTargetMs must be positive",
      );
    }

    if (
      this.options.errorRateTarget < 0 ||
      this.options.errorRateTarget > 1
    ) {
      throw new Error(
        "errorRateTarget must be between 0 and 1",
      );
    }

    if (
      this.options.qualityTarget < 0 ||
      this.options.qualityTarget > 1
    ) {
      throw new Error(
        "qualityTarget must be between 0 and 1",
      );
    }

    if (
      this.options.costTarget <= 0 ||
      !Number.isFinite(
        this.options.costTarget,
      )
    ) {
      throw new Error(
        "costTarget must be positive",
      );
    }

    if (
      this.options.throughputTarget <= 0 ||
      !Number.isFinite(
        this.options.throughputTarget,
      )
    ) {
      throw new Error(
        "throughputTarget must be positive",
      );
    }
  }

  evaluate(
    organizationId: string,
    metrics: PerformanceMetric[],
  ): PerformanceEvaluation {
    if (
      !organizationId ||
      organizationId.trim().length === 0
    ) {
      throw new Error(
        "Organization ID is required",
      );
    }

    const latencyValues = getValues(
      metrics,
      "latency",
    );

    const errorValues = getValues(
      metrics,
      "error_rate",
    );

    const qualityValues = getValues(
      metrics,
      "quality",
    );

    const costValues = getValues(
      metrics,
      "cost",
    );

    const throughputValues = getValues(
      metrics,
      "throughput",
    );

    const requestValues = getValues(
      metrics,
      "request",
    );

    const averageLatency = average(
      latencyValues,
    );

    const errorRate =
      average(errorValues);

    const averageQuality =
      average(qualityValues);

    const totalCost =
      sum(costValues);

    const throughput =
      average(throughputValues);

    const totalRequests =
      requestValues.length > 0
        ? sum(requestValues)
        : metrics.filter(
            (metric) =>
              metric.name === "requests",
          ).length;

    const latencyScore =
      scoreLowerIsBetter(
        averageLatency,
        this.options.latencyTargetMs,
      );

    const errorScore =
      scoreLowerIsBetter(
        errorRate,
        this.options.errorRateTarget,
      );

    const qualityScore =
      scoreHigherIsBetter(
        averageQuality,
        this.options.qualityTarget,
      );

    const costScore =
      scoreLowerIsBetter(
        totalCost,
        this.options.costTarget,
      );

    const throughputScore =
      scoreHigherIsBetter(
        throughput,
        this.options.throughputTarget,
      );

    const score =
      latencyScore * 0.25 +
      errorScore * 0.2 +
      qualityScore * 0.25 +
      costScore * 0.15 +
      throughputScore * 0.15;

    const roundedScore =
      Math.round(score * 100) / 100;

    let grade: PerformanceEvaluation["grade"];

    if (roundedScore >= 90) {
      grade = "excellent";
    } else if (roundedScore >= 75) {
      grade = "good";
    } else if (roundedScore >= 60) {
      grade = "fair";
    } else {
      grade = "poor";
    }

    return {
      organizationId,
      score: roundedScore,
      grade,
      latencyScore,
      errorScore,
      qualityScore,
      costScore,
      throughputScore,
      totalRequests,
      averageLatency,
      errorRate,
      averageQuality,
      totalCost,
      throughput,
      evaluatedAt: Date.now(),
    };
  }

  evaluateOrganization(
    organizationId: string,
    store: PerformanceMetricsStore,
  ): PerformanceEvaluation {
    const metrics =
      store.getOrganizationMetrics(
        organizationId,
      );

    return this.evaluate(
      organizationId,
      metrics,
    );
  }
}

export default PerformanceEvaluator;