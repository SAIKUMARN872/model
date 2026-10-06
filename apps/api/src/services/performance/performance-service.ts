import type { ExecutionTelemetry } from "../telemetry/telemetry-types.js";
import type { ModelPerformance, ObservedLatencyClass } from "./performance-types.js";

function percentile(values: number[], percentileValue: number): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentileValue / 100) * sorted.length) - 1;
  const safeIndex = Math.max(0, Math.min(index, sorted.length - 1));

  return sorted[safeIndex];
}

function classifyLatency(latencyMs: number): ObservedLatencyClass {
  if (latencyMs <= 2000) return "low";
  if (latencyMs <= 10000) return "medium";
  return "high";
}

export class PerformanceService {
  constructor(
    private readonly telemetryProvider: () => ExecutionTelemetry[],
  ) {}

  getModelPerformance(model: string): ModelPerformance | null {
    const records = this.telemetryProvider().filter(
      (record) => record.model === model,
    );

    if (records.length === 0) return null;

    const successful = records.filter((record) => record.success);
    const latencies = successful.map((record) => record.latencyMs);

    const averageLatencyMs =
      latencies.length > 0
        ? latencies.reduce((sum, latency) => sum + latency, 0) / latencies.length
        : 0;

    const totalInputTokens = successful.reduce(
      (sum, record) => sum + (record.inputTokens ?? 0),
      0,
    );

    const totalOutputTokens = successful.reduce(
      (sum, record) => sum + (record.outputTokens ?? 0),
      0,
    );

    const totalTokens = successful.reduce(
      (sum, record) => sum + (record.totalTokens ?? 0),
      0,
    );

    return {
      model,
      tier: records[0].tier,
      executions: records.length,
      successfulExecutions: successful.length,
      failedExecutions: records.length - successful.length,
      successRate: (successful.length / records.length) * 100,
      averageLatencyMs,
      p50LatencyMs: percentile(latencies, 50),
      p95LatencyMs: percentile(latencies, 95),
      totalInputTokens,
      totalOutputTokens,
      totalTokens,
      observedLatency: classifyLatency(averageLatencyMs),
    };
  }

  listModelPerformance(): ModelPerformance[] {
    const records = this.telemetryProvider();
    const models = [...new Set(records.map((record) => record.model))];

    return models
      .map((model) => this.getModelPerformance(model))
      .filter((performance): performance is ModelPerformance => performance !== null);
  }
}
