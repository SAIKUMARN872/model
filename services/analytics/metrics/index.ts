// services/analytics/metrics/index.ts

export {
  MetricCollector,
  validateMetricInput,
} from "./collector.js";

export type {
  CreateMetricInput,
  MetricCollectorHealth,
  MetricCollectorOptions,
  MetricFilter,
  MetricRecord,
  MetricType,
} from "./collector.js";

export {
  calculateMetricStatistics,
  filterAndProcessMetrics,
  getTopMetrics,
  processMetrics,
} from "./processor.js";

export type {
  MetricAggregation,
  MetricStatistics,
  ProcessedMetrics,
  TopMetric,
} from "./processor.js";