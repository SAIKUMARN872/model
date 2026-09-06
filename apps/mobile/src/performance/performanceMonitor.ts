export interface PerformanceMetric {
  id: string;
  name: string;
  duration: number;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];

  public start(
    name: string
  ): () => PerformanceMetric {
    const startTime =
      typeof performance !== "undefined"
        ? performance.now()
        : Date.now();

    return () => {
      const endTime =
        typeof performance !== "undefined"
          ? performance.now()
          : Date.now();

      const metric: PerformanceMetric = {
        id: this.generateId(),
        name,
        duration:
          endTime - startTime,
        timestamp:
          new Date().toISOString(),
      };

      this.metrics.push(metric);

      return metric;
    };
  }

  public record(
    name: string,
    duration: number,
    metadata?: Record<string, unknown>
  ): PerformanceMetric {
    const metric: PerformanceMetric = {
      id: this.generateId(),
      name,
      duration,
      timestamp:
        new Date().toISOString(),
      metadata,
    };

    this.metrics.push(metric);

    return metric;
  }

  public getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  public getMetricsByName(
    name: string
  ): PerformanceMetric[] {
    return this.metrics.filter(
      (metric) => metric.name === name
    );
  }

  public getAverageDuration(
    name: string
  ): number {
    const metrics =
      this.getMetricsByName(name);

    if (metrics.length === 0) {
      return 0;
    }

    const total = metrics.reduce(
      (sum, metric) =>
        sum + metric.duration,
      0
    );

    return total / metrics.length;
  }

  public clear(): void {
    this.metrics = [];
  }

  public count(): number {
    return this.metrics.length;
  }

  private generateId(): string {
    return (
      Date.now().toString(36) +
      Math.random()
        .toString(36)
        .substring(2, 10)
    );
  }
}

const performanceMonitor =
  new PerformanceMonitor();

export default performanceMonitor;