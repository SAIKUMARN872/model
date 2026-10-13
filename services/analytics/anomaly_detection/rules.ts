export type AnomalySeverity = "low" | "medium" | "high" | "critical";

export interface AnalyticsEvent {
  id: string;
  metric: string;
  value: number;
  timestamp: string;
  dimensions?: Record<string, string>;
}

export interface Anomaly {
  id: string;
  metric: string;
  value: number;
  expected: number;
  deviation: number;
  severity: AnomalySeverity;
  detectedAt: string;
}

export function validateEvent(event: AnalyticsEvent): void {
  if (!event || typeof event !== "object") {
    throw new Error("Analytics event is required");
  }

  if (!event.metric?.trim()) {
    throw new Error("Metric is required");
  }

  if (!Number.isFinite(event.value)) {
    throw new Error("Metric value must be finite");
  }
}
