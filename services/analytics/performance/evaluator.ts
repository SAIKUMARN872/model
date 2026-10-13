import type { PerformanceMetrics } from "./metrics.js";

export class PerformanceEvaluator {
  evaluate(
    latencyMs: number,
    requests: number,
    errors: number,
  ): PerformanceMetrics {
    if (latencyMs < 0) {
      throw new Error("Latency cannot be negative");
    }

    if (
      !Number.isInteger(requests) ||
      requests < 0 ||
      !Number.isInteger(errors) ||
      errors < 0 ||
      errors > requests
    ) {
      throw new Error("Invalid request/error counts");
    }

    return {
      latencyMs,
      throughput: requests,
      errorRate: requests === 0 ? 0 : errors / requests,
      timestamp: new Date().toISOString(),
    };
  }
}
