export interface Metric {
  name: string;
  value: number;
  timestamp: string;
  dimensions: Record<string, string>;
}

export class MetricCollector {
  private readonly metrics: Metric[] = [];

  collect(
    name: string,
    value: number,
    dimensions: Record<string, string> = {},
  ): Metric {
    if (!name.trim()) {
      throw new Error("Metric name is required");
    }

    if (!Number.isFinite(value)) {
      throw new Error("Metric value must be finite");
    }

    const metric: Metric = {
      name,
      value,
      timestamp: new Date().toISOString(),
      dimensions: { ...dimensions },
    };

    this.metrics.push(metric);

    return {
      ...metric,
      dimensions: { ...metric.dimensions },
    };
  }

  list(): Metric[] {
    return this.metrics.map((metric) => ({
      ...metric,
      dimensions: { ...metric.dimensions },
    }));
  }
}
