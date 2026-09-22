// services/analytics/performance/monitor.ts

import {
  CreatePerformanceMetricInput,
  PerformanceMetric,
  PerformanceMetricFilter,
  PerformanceMetricsHealth,
  PerformanceMetricsOptions,
  PerformanceMetricsStore,
} from "./metrics.js";

export interface PerformanceMonitorOptions
  extends PerformanceMetricsOptions {
  slowLatencyMs?: number;
  highErrorRate?: number;
  lowQuality?: number;
}

export interface PerformanceAlerts {
  slowRequests: number;
  highErrorRate: boolean;
  lowQuality: boolean;
  totalAlerts: number;
}

export interface PerformanceMonitorHealth {
  healthy: boolean;
  metrics: PerformanceMetricsHealth;
  slowLatencyMs: number;
  highErrorRate: number;
  lowQuality: number;
}

export class PerformanceMonitor {
  readonly metrics: PerformanceMetricsStore;

  private readonly slowLatencyMs: number;

  private readonly highErrorRate: number;

  private readonly lowQuality: number;

  constructor(
    options: PerformanceMonitorOptions = {},
  ) {
    this.metrics =
      new PerformanceMetricsStore(options);

    this.slowLatencyMs =
      options.slowLatencyMs ?? 1000;

    this.highErrorRate =
      options.highErrorRate ?? 0.1;

    this.lowQuality =
      options.lowQuality ?? 0.7;

    if (
      this.slowLatencyMs <= 0 ||
      !Number.isFinite(
        this.slowLatencyMs,
      )
    ) {
      throw new Error(
        "slowLatencyMs must be positive",
      );
    }

    if (
      this.highErrorRate < 0 ||
      this.highErrorRate > 1
    ) {
      throw new Error(
        "highErrorRate must be between 0 and 1",
      );
    }

    if (
      this.lowQuality < 0 ||
      this.lowQuality > 1
    ) {
      throw new Error(
        "lowQuality must be between 0 and 1",
      );
    }
  }

  start(): void {
    this.metrics.connect();
  }

  stop(): void {
    this.metrics.disconnect();
  }

  isRunning(): boolean {
    return this.metrics.isConnected();
  }

  record(
    input: CreatePerformanceMetricInput,
  ): PerformanceMetric {
    return this.metrics.record(input);
  }

  getMetrics(
    filter: PerformanceMetricFilter = {},
  ): PerformanceMetric[] {
    return this.metrics.find(filter);
  }

  getSlowRequests(
    organizationId?: string,
  ): PerformanceMetric[] {
    return this.metrics.find({
      organizationId,
      metricType: "latency",
      minValue: this.slowLatencyMs,
    });
  }

  getAlerts(
    organizationId: string,
  ): PerformanceAlerts {
    const slowRequests =
      this.getSlowRequests(
        organizationId,
      ).length;

    const errorMetrics =
      this.metrics.find({
        organizationId,
        metricType: "error_rate",
      });

    const qualityMetrics =
      this.metrics.find({
        organizationId,
        metricType: "quality",
      });

    const errorRate =
      errorMetrics.length > 0
        ? errorMetrics.reduce(
            (sum, metric) =>
              sum + metric.value,
            0,
          ) / errorMetrics.length
        : 0;

    const quality =
      qualityMetrics.length > 0
        ? qualityMetrics.reduce(
            (sum, metric) =>
              sum + metric.value,
            0,
          ) / qualityMetrics.length
        : 1;

    const highErrorRate =
      errorRate >= this.highErrorRate;

    const lowQuality =
      quality <= this.lowQuality;

    return {
      slowRequests,
      highErrorRate,
      lowQuality,
      totalAlerts:
        slowRequests +
        Number(highErrorRate) +
        Number(lowQuality),
    };
  }

  getHealth(): PerformanceMonitorHealth {
    const metricsHealth =
      this.metrics.health();

    return {
      healthy: metricsHealth.healthy,
      metrics: metricsHealth,
      slowLatencyMs: this.slowLatencyMs,
      highErrorRate: this.highErrorRate,
      lowQuality: this.lowQuality,
    };
  }

  clearOrganization(
    organizationId: string,
  ): number {
    return this.metrics.clearOrganization(
      organizationId,
    );
  }

  clear(): number {
    return this.metrics.clear();
  }
}

export default PerformanceMonitor;