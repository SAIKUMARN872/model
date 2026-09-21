import {
  AnomalyMetric,
  AnomalyRule,
  AnomalyRuleType,
  AnomalySeverity,
  DEFAULT_ANOMALY_RULES,
} from "./rules";

export interface MetricPoint {
  timestamp: Date;
  value: number;
}

export interface AnomalyDetectionRequest {
  metric: AnomalyMetric;

  entityId: string;

  entityType:
    | "model"
    | "provider"
    | "tenant"
    | "workspace"
    | "organization"
    | "system";

  points: MetricPoint[];

  rules?: AnomalyRule[];

  metadata?: Record<string, unknown>;
}

export interface Anomaly {
  id: string;

  ruleId: string;

  metric: AnomalyMetric;

  entityId: string;

  entityType: AnomalyDetectionRequest["entityType"];

  type: AnomalyRuleType;

  severity: AnomalySeverity;

  score: number;

  currentValue: number;

  expectedValue?: number;

  deviation?: number;

  detectedAt: Date;

  reason: string;

  metadata?: Record<string, unknown>;
}

export class AnomalyDetector {
  private readonly defaultRules: AnomalyRule[];

  constructor(
    rules: AnomalyRule[] = DEFAULT_ANOMALY_RULES,
  ) {
    this.defaultRules = rules;
  }

  detect(
    request: AnomalyDetectionRequest,
  ): Anomaly[] {
    this.validateRequest(request);

    const rules = (
      request.rules ?? this.defaultRules
    ).filter(
      (rule) =>
        rule.enabled &&
        rule.metric === request.metric,
    );

    const anomalies: Anomaly[] = [];

    for (const rule of rules) {
      const anomaly =
        this.evaluateRule(
          request,
          rule,
        );

      if (anomaly) {
        anomalies.push(anomaly);
      }
    }

    return anomalies;
  }

  detectHighestRisk(
    request: AnomalyDetectionRequest,
  ): Anomaly | null {
    const anomalies =
      this.detect(request);

    if (anomalies.length === 0) {
      return null;
    }

    return anomalies.reduce(
      (highest, current) =>
        current.score > highest.score
          ? current
          : highest,
    );
  }

  private evaluateRule(
    request: AnomalyDetectionRequest,
    rule: AnomalyRule,
  ): Anomaly | null {
    switch (rule.type) {
      case "threshold":
        return this.evaluateThreshold(
          request,
          rule,
        );

      case "spike":
        return this.evaluateSpike(
          request,
          rule,
        );

      case "drop":
        return this.evaluateDrop(
          request,
          rule,
        );

      case "z_score":
        return this.evaluateZScore(
          request,
          rule,
        );

      case "trend":
        return this.evaluateTrend(
          request,
          rule,
        );

      default:
        return null;
    }
  }

  private evaluateThreshold(
    request: AnomalyDetectionRequest,
    rule: AnomalyRule,
  ): Anomaly | null {
    if (
      rule.threshold === undefined ||
      request.points.length === 0
    ) {
      return null;
    }

    const current =
      request.points[
        request.points.length - 1
      ];

    if (current.value <= rule.threshold) {
      return null;
    }

    const excess =
      current.value - rule.threshold;

    const score = this.normalizeScore(
      excess /
        Math.max(
          Math.abs(rule.threshold),
          1,
        ),
    );

    return this.createAnomaly(
      request,
      rule,
      score,
      current.value,
      rule.threshold,
      excess,
      `Current ${request.metric} value ${current.value} exceeded threshold ${rule.threshold}.`,
      current.timestamp,
    );
  }

  private evaluateSpike(
    request: AnomalyDetectionRequest,
    rule: AnomalyRule,
  ): Anomaly | null {
    if (
      request.points.length < 2 ||
      rule.percentageThreshold ===
        undefined
    ) {
      return null;
    }

    const current =
      request.points[
        request.points.length - 1
      ];

    const previous =
      request.points[
        request.points.length - 2
      ];

    if (previous.value === 0) {
      return null;
    }

    const change =
      (current.value - previous.value) /
      Math.abs(previous.value);

    if (
      change < rule.percentageThreshold
    ) {
      return null;
    }

    const score = this.normalizeScore(
      change /
        Math.max(
          rule.percentageThreshold,
          0.01,
        ),
    );

    return this.createAnomaly(
      request,
      rule,
      score,
      current.value,
      previous.value,
      current.value - previous.value,
      `Metric increased by ${(change * 100).toFixed(2)}% compared with the previous measurement.`,
      current.timestamp,
    );
  }

  private evaluateDrop(
    request: AnomalyDetectionRequest,
    rule: AnomalyRule,
  ): Anomaly | null {
    if (
      request.points.length < 2 ||
      rule.percentageThreshold ===
        undefined
    ) {
      return null;
    }

    const current =
      request.points[
        request.points.length - 1
      ];

    const previous =
      request.points[
        request.points.length - 2
      ];

    if (previous.value === 0) {
      return null;
    }

    const change =
      (previous.value - current.value) /
      Math.abs(previous.value);

    if (
      change < rule.percentageThreshold
    ) {
      return null;
    }

    const score = this.normalizeScore(
      change /
        Math.max(
          rule.percentageThreshold,
          0.01,
        ),
    );

    return this.createAnomaly(
      request,
      rule,
      score,
      current.value,
      previous.value,
      current.value - previous.value,
      `Metric decreased by ${(change * 100).toFixed(2)}% compared with the previous measurement.`,
      current.timestamp,
    );
  }

  private evaluateZScore(
    request: AnomalyDetectionRequest,
    rule: AnomalyRule,
  ): Anomaly | null {
    if (
      rule.zScoreThreshold ===
        undefined ||
      request.points.length < 3
    ) {
      return null;
    }

    const values =
      request.points.map(
        (point) => point.value,
      );

    const current =
      values[values.length - 1];

    const historical =
      values.slice(0, -1);

    const average =
      this.mean(historical);

    const deviation =
      this.standardDeviation(
        historical,
      );

    if (deviation === 0) {
      return null;
    }

    const zScore =
      Math.abs(
        (current - average) /
          deviation,
      );

    if (
      zScore <
      rule.zScoreThreshold
    ) {
      return null;
    }

    const score = this.normalizeScore(
      zScore /
        rule.zScoreThreshold,
    );

    return this.createAnomaly(
      request,
      rule,
      score,
      current,
      average,
      current - average,
      `Current value is ${zScore.toFixed(2)} standard deviations from the historical mean.`,
      request.points[
        request.points.length - 1
      ].timestamp,
    );
  }

  private evaluateTrend(
    request: AnomalyDetectionRequest,
    rule: AnomalyRule,
  ): Anomaly | null {
    const windowSize =
      rule.windowSize ?? 5;

    if (
      request.points.length <
      windowSize
    ) {
      return null;
    }

    const points =
      request.points.slice(
        -windowSize,
      );

    let increasing = true;
    let decreasing = true;

    for (let i = 1; i < points.length; i++) {
      if (
        points[i].value <=
        points[i - 1].value
      ) {
        increasing = false;
      }

      if (
        points[i].value >=
        points[i - 1].value
      ) {
        decreasing = false;
      }
    }

    if (!increasing && !decreasing) {
      return null;
    }

    const first = points[0].value;
    const last =
      points[points.length - 1].value;

    if (first === 0) {
      return null;
    }

    const change =
      Math.abs(last - first) /
      Math.abs(first);

    const threshold =
      rule.percentageThreshold ?? 0.5;

    if (change < threshold) {
      return null;
    }

    const score = this.normalizeScore(
      change / threshold,
    );

    return this.createAnomaly(
      request,
      rule,
      score,
      last,
      first,
      last - first,
      `Metric shows a sustained ${increasing ? "increasing" : "decreasing"} trend of ${(change * 100).toFixed(2)}%.`,
      points[points.length - 1]
        .timestamp,
    );
  }

  private createAnomaly(
    request: AnomalyDetectionRequest,
    rule: AnomalyRule,
    score: number,
    currentValue: number,
    expectedValue: number,
    deviation: number,
    reason: string,
    timestamp: Date,
  ): Anomaly {
    return {
      id: this.generateId(),

      ruleId: rule.id,

      metric: request.metric,

      entityId: request.entityId,

      entityType: request.entityType,

      type: rule.type,

      severity: this.calculateSeverity(
        score,
      ),

      score,

      currentValue,

      expectedValue,

      deviation,

      detectedAt: timestamp,

      reason,

      metadata: {
        ...request.metadata,
        ruleName: rule.name,
      },
    };
  }

  private calculateSeverity(
    score: number,
  ): AnomalySeverity {
    if (score >= 1) {
      return "critical";
    }

    if (score >= 0.75) {
      return "high";
    }

    if (score >= 0.5) {
      return "medium";
    }

    return "low";
  }

  private normalizeScore(
    score: number,
  ): number {
    return Math.max(
      0,
      Math.min(1, score),
    );
  }

  private mean(
    values: number[],
  ): number {
    if (values.length === 0) {
      return 0;
    }

    return (
      values.reduce(
        (sum, value) =>
          sum + value,
        0,
      ) / values.length
    );
  }

  private standardDeviation(
    values: number[],
  ): number {
    if (values.length === 0) {
      return 0;
    }

    const average =
      this.mean(values);

    const variance =
      values.reduce(
        (sum, value) =>
          sum +
          Math.pow(
            value - average,
            2,
          ),
        0,
      ) / values.length;

    return Math.sqrt(variance);
  }

  private validateRequest(
    request: AnomalyDetectionRequest,
  ): void {
    if (!request.entityId) {
      throw new Error(
        "entityId is required",
      );
    }

    if (!request.metric) {
      throw new Error(
        "metric is required",
      );
    }

    if (!Array.isArray(request.points)) {
      throw new Error(
        "points must be an array",
      );
    }

    for (const point of request.points) {
      if (
        !Number.isFinite(point.value)
      ) {
        throw new Error(
          "Metric values must be finite numbers",
        );
      }

      if (!(point.timestamp instanceof Date)) {
        throw new Error(
          "Metric timestamps must be Date instances",
        );
      }
    }
  }

  private generateId(): string {
    return `anomaly_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 10)}`;
  }
}