import type { PerformanceMetrics } from "./metrics.js";

export class PerformanceMonitor {
  private readonly records: PerformanceMetrics[] = [];

  record(metrics: PerformanceMetrics): void {
    this.records.push({ ...metrics });
  }

  list(): PerformanceMetrics[] {
    return this.records.map((record) => ({ ...record }));
  }

  latest(): PerformanceMetrics | undefined {
    const value = this.records[this.records.length - 1];

    return value ? { ...value } : undefined;
  }
}
