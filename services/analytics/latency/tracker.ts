import { randomUUID } from "node:crypto";

export interface LatencySample {
  id: string;
  operation: string;
  durationMs: number;
  timestamp: string;
}

export class LatencyTracker {
  private readonly samples: LatencySample[] = [];

  record(
    operation: string,
    durationMs: number,
  ): LatencySample {
    if (!operation.trim()) {
      throw new Error("Operation is required");
    }

    if (!Number.isFinite(durationMs) || durationMs < 0) {
      throw new Error("Duration must be a non-negative number");
    }

    const sample: LatencySample = {
      id: randomUUID(),
      operation,
      durationMs,
      timestamp: new Date().toISOString(),
    };

    this.samples.push(sample);

    return { ...sample };
  }

  list(): LatencySample[] {
    return this.samples.map((sample) => ({ ...sample }));
  }
}
