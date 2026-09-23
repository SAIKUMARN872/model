export type MetricType =
  | "counter"
  | "gauge"
  | "histogram";

export type MetricLabels = Record<
  string,
  string | number | boolean
>;

export interface MetricDefinition {
  name: string;
  type: MetricType;
  description?: string;
  unit?: string;
}

export interface HistogramSnapshot {
  count: number;
  sum: number;
  min: number;
  max: number;
  average: number;
  p50: number;
  p90: number;
  p95: number;
  p99: number;
}

export interface MetricSnapshot {
  name: string;
  type: MetricType;
  description?: string;
  unit?: string;
  labels: MetricLabels;
  value?: number;
  histogram?: HistogramSnapshot;
}

interface CounterEntry {
  definition: MetricDefinition;
  labels: MetricLabels;
  value: number;
}

interface GaugeEntry {
  definition: MetricDefinition;
  labels: MetricLabels;
  value: number;
}

interface HistogramEntry {
  definition: MetricDefinition;
  labels: MetricLabels;
  values: number[];
}

function labelsKey(
  labels: MetricLabels,
): string {
  return Object.keys(labels)
    .sort()
    .map(
      (key) =>
        `${key}=${String(labels[key])}`,
    )
    .join(",");
}

function calculatePercentile(
  values: number[],
  percentile: number,
): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort(
    (a, b) => a - b,
  );

  const index =
    (sorted.length - 1) * percentile;

  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) {
    return sorted[lower];
  }

  const weight = index - lower;

  return (
    sorted[lower] +
    (sorted[upper] - sorted[lower]) *
      weight
  );
}

export class MetricsRegistry {
  private readonly definitions =
    new Map<string, MetricDefinition>();

  private readonly counters =
    new Map<string, CounterEntry>();

  private readonly gauges =
    new Map<string, GaugeEntry>();

  private readonly histograms =
    new Map<string, HistogramEntry>();

  register(
    definition: MetricDefinition,
  ): void {
    if (!definition.name.trim()) {
      throw new Error(
        "Metric name is required",
      );
    }

    if (
      this.definitions.has(
        definition.name,
      )
    ) {
      throw new Error(
        `Metric already registered: ${definition.name}`,
      );
    }

    this.definitions.set(
      definition.name,
      {
        ...definition,
      },
    );
  }

  registerCounter(
    name: string,
    description?: string,
    unit?: string,
  ): void {
    this.register({
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
  ): void {
    this.register({
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
  ): void {
    this.register({
      name,
      type: "histogram",
      description,
      unit,
    });
  }

  getDefinition(
    name: string,
  ): MetricDefinition | undefined {
    const definition =
      this.definitions.get(name);

    return definition
      ? { ...definition }
      : undefined;
  }

  getDefinitions(): MetricDefinition[] {
    return Array.from(
      this.definitions.values(),
    ).map((definition) => ({
      ...definition,
    }));
  }

  increment(
    name: string,
    amount = 1,
    labels: MetricLabels = {},
  ): number {
    const definition =
      this.requireMetric(
        name,
        "counter",
      );

    if (!Number.isFinite(amount)) {
      throw new Error(
        "Counter amount must be finite",
      );
    }

    const key = `${name}|${labelsKey(labels)}`;

    const existing =
      this.counters.get(key);

    if (existing) {
      existing.value += amount;
      return existing.value;
    }

    const entry: CounterEntry = {
      definition,
      labels: { ...labels },
      value: amount,
    };

    this.counters.set(key, entry);

    return amount;
  }

  getCounter(
    name: string,
    labels: MetricLabels = {},
  ): number {
    this.requireMetric(
      name,
      "counter",
    );

    const key = `${name}|${labelsKey(labels)}`;

    return (
      this.counters.get(key)?.value ?? 0
    );
  }

  setGauge(
    name: string,
    value: number,
    labels: MetricLabels = {},
  ): void {
    const definition =
      this.requireMetric(
        name,
        "gauge",
      );

    if (!Number.isFinite(value)) {
      throw new Error(
        "Gauge value must be finite",
      );
    }

    const key = `${name}|${labelsKey(labels)}`;

    this.gauges.set(key, {
      definition,
      labels: { ...labels },
      value,
    });
  }

  incrementGauge(
    name: string,
    amount = 1,
    labels: MetricLabels = {},
  ): number {
    const current = this.getGauge(
      name,
      labels,
    );

    const next = current + amount;

    this.setGauge(
      name,
      next,
      labels,
    );

    return next;
  }

  decrementGauge(
    name: string,
    amount = 1,
    labels: MetricLabels = {},
  ): number {
    return this.incrementGauge(
      name,
      -amount,
      labels,
    );
  }

  getGauge(
    name: string,
    labels: MetricLabels = {},
  ): number {
    this.requireMetric(
      name,
      "gauge",
    );

    const key = `${name}|${labelsKey(labels)}`;

    return (
      this.gauges.get(key)?.value ?? 0
    );
  }

  observe(
    name: string,
    value: number,
    labels: MetricLabels = {},
  ): void {
    const definition =
      this.requireMetric(
        name,
        "histogram",
      );

    if (!Number.isFinite(value)) {
      throw new Error(
        "Histogram value must be finite",
      );
    }

    const key = `${name}|${labelsKey(labels)}`;

    const existing =
      this.histograms.get(key);

    if (existing) {
      existing.values.push(value);
      return;
    }

    this.histograms.set(key, {
      definition,
      labels: { ...labels },
      values: [value],
    });
  }

  getHistogram(
    name: string,
    labels: MetricLabels = {},
  ): HistogramSnapshot {
    this.requireMetric(
      name,
      "histogram",
    );

    const key = `${name}|${labelsKey(labels)}`;

    const values =
      this.histograms.get(key)?.values ??
      [];

    if (values.length === 0) {
      return {
        count: 0,
        sum: 0,
        min: 0,
        max: 0,
        average: 0,
        p50: 0,
        p90: 0,
        p95: 0,
        p99: 0,
      };
    }

    const sum = values.reduce(
      (total, value) => total + value,
      0,
    );

    return {
      count: values.length,
      sum,
      min: Math.min(...values),
      max: Math.max(...values),
      average: sum / values.length,
      p50: calculatePercentile(
        values,
        0.5,
      ),
      p90: calculatePercentile(
        values,
        0.9,
      ),
      p95: calculatePercentile(
        values,
        0.95,
      ),
      p99: calculatePercentile(
        values,
        0.99,
      ),
    };
  }

  snapshot(): MetricSnapshot[] {
    const result: MetricSnapshot[] = [];

    for (const entry of this.counters.values()) {
      result.push({
        name: entry.definition.name,
        type: "counter",
        description:
          entry.definition.description,
        unit: entry.definition.unit,
        labels: { ...entry.labels },
        value: entry.value,
      });
    }

    for (const entry of this.gauges.values()) {
      result.push({
        name: entry.definition.name,
        type: "gauge",
        description:
          entry.definition.description,
        unit: entry.definition.unit,
        labels: { ...entry.labels },
        value: entry.value,
      });
    }

    for (const entry of this.histograms.values()) {
      result.push({
        name: entry.definition.name,
        type: "histogram",
        description:
          entry.definition.description,
        unit: entry.definition.unit,
        labels: { ...entry.labels },
        histogram: this.getHistogram(
          entry.definition.name,
          entry.labels,
        ),
      });
    }

    return result;
  }

  reset(): void {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
  }

  clear(): void {
    this.reset();
    this.definitions.clear();
  }

  size(): number {
    return (
      this.definitions.size
    );
  }

  health(): {
    status: "healthy";
    registeredMetrics: number;
    activeSeries: number;
  } {
    return {
      status: "healthy",
      registeredMetrics:
        this.definitions.size,
      activeSeries:
        this.counters.size +
        this.gauges.size +
        this.histograms.size,
    };
  }

  private requireMetric(
    name: string,
    expectedType: MetricType,
  ): MetricDefinition {
    const definition =
      this.definitions.get(name);

    if (!definition) {
      throw new Error(
        `Metric is not registered: ${name}`,
      );
    }

    if (
      definition.type !== expectedType
    ) {
      throw new Error(
        `Metric '${name}' is type '${definition.type}', expected '${expectedType}'`,
      );
    }

    return definition;
  }
}

export const metrics =
  new MetricsRegistry();