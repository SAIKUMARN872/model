import type {
  GatewayMetric,
} from "./metrics.js";

export class MetricsCollector {
  private readonly metrics: GatewayMetric[] = [];

  record(
    name: string,
    value: number,
    tags: Record<string, string> = {},
  ): GatewayMetric {
    if (!name.trim()) {
      throw new Error("Metric name is required");
    }

    if (!Number.isFinite(value)) {
      throw new Error("Metric value must be finite");
    }

    const metric: GatewayMetric = {
      name,
      value,
      timestamp: new Date().toISOString(),
      tags: { ...tags },
    };

    this.metrics.push(metric);

    return {
      ...metric,
      tags: { ...metric.tags },
    };
  }

  list(): GatewayMetric[] {
    return this.metrics.map((metric) => ({
      ...metric,
      tags: { ...metric.tags },
    }));
  }

  clear(): void {
    this.metrics.length = 0;
  }
}
