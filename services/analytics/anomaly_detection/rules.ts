export type AnomalyMetric =
  | "cost"
  | "latency"
  | "tokens"
  | "requests"
  | "error_rate"
  | "quality"
  | "throughput"
  | "usage";

export type AnomalyRuleType =
  | "threshold"
  | "spike"
  | "drop"
  | "z_score"
  | "trend";

export type AnomalySeverity =
  | "low"
  | "medium"
  | "high"
  | "critical";

export interface AnomalyRule {
  id: string;

  name: string;

  metric: AnomalyMetric;

  type: AnomalyRuleType;

  enabled: boolean;

  threshold?: number;

  zScoreThreshold?: number;

  percentageThreshold?: number;

  severity: AnomalySeverity;

  windowSize?: number;

  description?: string;

  metadata?: Record<string, unknown>;
}

export const DEFAULT_ANOMALY_RULES: AnomalyRule[] = [
  {
    id: "latency-threshold",
    name: "High Latency",
    metric: "latency",
    type: "threshold",
    enabled: true,
    threshold: 5000,
    severity: "high",
    description:
      "Detects requests whose latency exceeds the configured limit.",
  },

  {
    id: "error-rate-threshold",
    name: "High Error Rate",
    metric: "error_rate",
    type: "threshold",
    enabled: true,
    threshold: 0.1,
    severity: "high",
    description:
      "Detects an elevated service or model error rate.",
  },

  {
    id: "cost-spike",
    name: "Cost Spike",
    metric: "cost",
    type: "spike",
    enabled: true,
    percentageThreshold: 0.5,
    severity: "high",
    description:
      "Detects a significant increase in AI request cost.",
  },

  {
    id: "latency-z-score",
    name: "Latency Statistical Outlier",
    metric: "latency",
    type: "z_score",
    enabled: true,
    zScoreThreshold: 3,
    severity: "medium",
    windowSize: 30,
    description:
      "Detects latency values that significantly deviate from historical behavior.",
  },

  {
    id: "request-volume-spike",
    name: "Request Volume Spike",
    metric: "requests",
    type: "spike",
    enabled: true,
    percentageThreshold: 1,
    severity: "medium",
    windowSize: 10,
    description:
      "Detects abnormal increases in request volume.",
  },
];