import { randomUUID } from "node:crypto";

export type MonitoringMetricType = "counter" | "gauge" | "histogram";

export type MetricLabels = Record<string, string>;

export interface MetricDefinition {
  name: string;
  type: MonitoringMetricType;
  description?: string;
  unit?: string;
}

export interface MetricSnapshot {
  id: string;
  name: string;
  type: MonitoringMetricType;
  value: number;
  count?: number;
  sum?: number;
  min?: number;
  max?: number;
  average?: number;
  p50?: number;
  p90?: number;
  p95?: number;
  p99?: number;
  labels: MetricLabels;
  timestamp: string;
}

export interface MonitoringMetricsHealth {
  healthy: boolean;
  metricCount: number;
  seriesCount: number;
  timestamp: string;
}

interface MetricSeries {
  definition: MetricDefinition;
  labels: MetricLabels;
  value: number;
  values: number[];
}

function validateMetricName(name: string): void {
  if (!name || !/^[a-zA-Z_:][a-zA-Z0-9_:.-]*$/.test(name)) {
    throw new Error(`Invalid metric name: ${name}`);
  }
}

function validateNumber(value: number, field: string): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${field} must be a finite number`);
  }
}

function labelsKey(labels: MetricLabels): string {
  return Object.entries(labels)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("|");
}

function percentile(values: number[], percentage: number): number | undefined {
  if (values.length === 0) {
    return undefined;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * percentage;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) {
    return sorted[lower];
  }

  const weight = index - lower;
  return sorted[lower] + (sorted[upper] - sorted[lower]) * weight;
}

export class MonitoringMetrics {
  private readonly definitions = new Map<string, MetricDefinition>();

  private readonly series = new Map<string, MetricSeries>();

  register(definition: MetricDefinition): MetricDefinition {
    validateMetricName(definition.name);

    if (!definition.type) {
      throw new Error("Metric type is required");
    }

    const existing = this.definitions.get(definition.name);

    if (existing && existing.type !== definition.type) {
      throw new Error(
        `Metric ${definition.name} already exists as ${existing.type}`,
      );
    }

    this.definitions.set(definition.name, { ...definition });

    return { ...definition };
  }

  registerCounter(
    name: string,
    description?: string,
    unit?: string,
  ): MetricDefinition {
    return this.register({
      name,
      type: "counter",
      description,
      unit,
    });
  }

  registerGauge(
    name: string,
    description?: string,
    unit?: string,
  ): MetricDefinition {
    return this.register({
      name,
      type: "gauge",
      description,
      unit,
    });
  }

  registerHistogram(
    name: string,
    description?: string,
    unit?: string,
  ): MetricDefinition {
    return this.register({
      name,
      type: "histogram",
      description,
      unit,
    });
  }

  private getSeries(
    name: string,
    labels: MetricLabels = {},
  ): MetricSeries {
    const definition = this.definitions.get(name);

    if (!definition) {
      throw new Error(`Metric is not registered: ${name}`);
    }

    const key = `${name}|${labelsKey(labels)}`;

    let series = this.series.get(key);

    if (!series) {
      series = {
        definition,
        labels: { ...labels },
        value: 0,
        values: [],
      };

      this.series.set(key, series);
    }

    return series;
  }

  increment(
    name: string,
    amount = 1,
    labels: MetricLabels = {},
  ): number {
    validateNumber(amount, "amount");

    const series = this.getSeries(name, labels);

    if (series.definition.type !== "counter") {
      throw new Error(`Metric ${name} is not a counter`);
    }

    series.value += amount;

    return series.value;
  }

  setGauge(
    name: string,
    value: number,
    labels: MetricLabels = {},
  ): number {
    validateNumber(value, "value");

    const series = this.getSeries(name, labels);

    if (series.definition.type !== "gauge") {
      throw new Error(`Metric ${name} is not a gauge`);
    }

    series.value = value;

    return series.value;
  }

  incrementGauge(
    name: string,
    amount = 1,
    labels: MetricLabels = {},
  ): number {
    validateNumber(amount, "amount");

    const series = this.getSeries(name, labels);

    if (series.definition.type !== "gauge") {
      throw new Error(`Metric ${name} is not a gauge`);
    }

    series.value += amount;

    return series.value;
  }

  observe(
    name: string,
    value: number,
    labels: MetricLabels = {},
  ): void {
    validateNumber(value, "value");

    const series = this.getSeries(name, labels);

    if (series.definition.type !== "histogram") {
      throw new Error(`Metric ${name} is not a histogram`);
    }

    series.values.push(value);
    series.value = value;
  }

  get(
    name: string,
    labels: MetricLabels = {},
  ): number | undefined {
    const definition = this.definitions.get(name);

    if (!definition) {
      return undefined;
    }

    const key = `${name}|${labelsKey(labels)}`;
    const series = this.series.get(key);

    if (!series) {
      return definition.type === "histogram" ? undefined : 0;
    }

    return series.value;
  }

  getHistogram(
    name: string,
    labels: MetricLabels = {},
  ): MetricSnapshot | undefined {
    const definition = this.definitions.get(name);

    if (!definition) {
      return undefined;
    }

    if (definition.type !== "histogram") {
      throw new Error(`Metric ${name} is not a histogram`);
    }

    const key = `${name}|${labelsKey(labels)}`;
    const series = this.series.get(key);

    if (!series || series.values.length === 0) {
      return undefined;
    }

    const values = [...series.values];

    const sum = values.reduce((total, value) => total + value, 0);
    const min = Math.min(...values);
    const max = Math.max(...values);

    return {
      id: randomUUID(),
      name,
      type: "histogram",
      value: series.value,
      count: values.length,
      sum,
      min,
      max,
      average: sum / values.length,
      p50: percentile(values, 0.5),
      p90: percentile(values, 0.9),
      p95: percentile(values, 0.95),
      p99: percentile(values, 0.99),
      labels: { ...labels },
      timestamp: new Date().toISOString(),
    };
  }

  snapshot(): MetricSnapshot[] {
    const snapshots: MetricSnapshot[] = [];

    for (const series of this.series.values()) {
      const {
        definition,
        labels,
        value,
        values,
      } = series;

      if (definition.type === "histogram") {
        const sum = values.reduce((total, item) => total + item, 0);

        snapshots.push({
          id: randomUUID(),
          name: definition.name,
          type: definition.type,
          value,
          count: values.length,
          sum,
          min: values.length > 0 ? Math.min(...values) : undefined,
          max: values.length > 0 ? Math.max(...values) : undefined,
          average: values.length > 0 ? sum / values.length : undefined,
          p50: percentile(values, 0.5),
          p90: percentile(values, 0.9),
          p95: percentile(values, 0.95),
          p99: percentile(values, 0.99),
          labels: { ...labels },
          timestamp: new Date().toISOString(),
        });
      } else {
        snapshots.push({
          id: randomUUID(),
          name: definition.name,
          type: definition.type,
          value,
          labels: { ...labels },
          timestamp: new Date().toISOString(),
        });
      }
    }

    return snapshots;
  }

  getDefinitions(): MetricDefinition[] {
    return [...this.definitions.values()].map((definition) => ({
      ...definition,
    }));
  }

  reset(name?: string): void {
    if (!name) {
      this.series.clear();
      return;
    }

    validateMetricName(name);

    for (const key of this.series.keys()) {
      if (key.startsWith(`${name}|`)) {
        this.series.delete(key);
      }
    }
  }

  clear(): void {
    this.definitions.clear();
    this.series.clear();
  }

  size(): number {
    return this.definitions.size;
  }

  seriesSize(): number {
    return this.series.size;
  }

  health(): MonitoringMetricsHealth {
    return {
      healthy: true,
      metricCount: this.definitions.size,
      seriesCount: this.series.size,
      timestamp: new Date().toISOString(),
    };
  }
}

export const monitoringMetrics = new MonitoringMetrics();