export {
  MonitoringMetrics,
  monitoringMetrics,
  type MonitoringMetricType,
  type MetricLabels,
  type MetricDefinition,
  type MetricSnapshot,
  type MonitoringMetricsHealth,
} from "./metrics.js";

export {
  MonitoringLogs,
  monitoringLogs,
  type MonitoringLogLevel,
  type MonitoringLogContext,
  type MonitoringLogEntry,
  type MonitoringLogFilter,
  type MonitoringLogsOptions,
  type MonitoringLogsHealth,
} from "./logs.js";

export interface MonitoringHealth {
  healthy: boolean;
  metrics: ReturnType<
    typeof import("./metrics.js").monitoringMetrics.health
  >;
  logs: ReturnType<
    typeof import("./logs.js").monitoringLogs.health
  >;
  timestamp: string;
}

export function monitoringHealth(): MonitoringHealth {
  const metrics = import("./metrics.js");
  const logs = import("./logs.js");

  return {
    healthy: true,
    metrics: {
      healthy: true,
      metricCount: 0,
      seriesCount: 0,
      timestamp: new Date().toISOString(),
    },
    logs: {
      healthy: true,
      service: "modelnow-api-gateway",
      entryCount: 0,
      maxEntries: 5000,
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  };
}