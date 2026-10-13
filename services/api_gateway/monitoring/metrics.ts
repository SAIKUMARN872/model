export interface MonitoringMetric {
  name: string;
  value: number;
  timestamp: string;
}

export class MonitoringMetrics {
  private readonly metrics: MonitoringMetric[] = [];

  record(
    name: string,
    value: number,
  ): MonitoringMetric {
    if (!name.trim()) {
      throw new Error("Metric name is required");
    }

    if (!Number.isFinite(value)) {
      throw new Error("Metric value must be finite");
    }

    const metric: MonitoringMetric = {
      name,
      value,
      timestamp: new Date().toISOString(),
    };

    this.metrics.push(metric);

    return { ...metric };
  }

  list(): MonitoringMetric[] {
    return this.metrics.map((metric) => ({
      ...metric,
    }));
  }
}
