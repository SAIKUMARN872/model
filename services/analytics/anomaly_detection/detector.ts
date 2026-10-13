import { randomUUID } from "node:crypto";
import {
  AnalyticsEvent,
  Anomaly,
  AnomalySeverity,
  validateEvent,
} from "./rules.js";

export class AnomalyDetector {
  detect(
    event: AnalyticsEvent,
    expected: number,
    threshold = 0.2,
  ): Anomaly | null {
    validateEvent(event);

    if (!Number.isFinite(expected) || expected === 0) {
      throw new Error("Expected value must be a non-zero number");
    }

    if (!Number.isFinite(threshold) || threshold < 0) {
      throw new Error("Threshold must be a non-negative number");
    }

    const deviation = Math.abs(event.value - expected) / Math.abs(expected);

    if (deviation <= threshold) {
      return null;
    }

    let severity: AnomalySeverity = "low";

    if (deviation >= 1) {
      severity = "critical";
    } else if (deviation >= 0.75) {
      severity = "high";
    } else if (deviation >= 0.5) {
      severity = "medium";
    }

    return {
      id: randomUUID(),
      metric: event.metric,
      value: event.value,
      expected,
      deviation,
      severity,
      detectedAt: new Date().toISOString(),
    };
  }
}
