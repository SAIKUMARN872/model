import type { LatencySample } from "./tracker.js";

export interface LatencyAnalysis {
  count: number;
  averageMs: number;
  minMs: number;
  maxMs: number;
}

export function analyzeLatency(
  samples: LatencySample[],
): LatencyAnalysis {
  if (samples.length === 0) {
    return {
      count: 0,
      averageMs: 0,
      minMs: 0,
      maxMs: 0,
    };
  }

  const values = samples.map((sample) => sample.durationMs);
  const total = values.reduce((sum, value) => sum + value, 0);

  return {
    count: values.length,
    averageMs: total / values.length,
    minMs: Math.min(...values),
    maxMs: Math.max(...values),
  };
}
