/**
 * ModelNow Analytics
 * Production Anomaly Detection Engine
 *
 * Responsibilities:
 *
 * 1. Maintain historical observations
 * 2. Build rolling baselines
 * 3. Execute anomaly rules
 * 4. Calculate anomaly confidence
 * 5. Deduplicate repeated anomalies
 * 6. Return explainable detection results
 *
 * This class is intentionally independent from PostgreSQL/Redis.
 * Persistence can be connected through a repository layer later.
 */

import type {
  AnomalyMetric,
  AnomalyRule,
  AnomalyRuleContext,
  AnomalyRuleResult,
  AnomalySeverity,
} from "./rules.js";

import {
  createDefaultAnomalyRules,
} from "./rules.js";

export interface Observation {
  organizationId: string;

  metric: AnomalyMetric;

  value: number;

  timestamp: Date;

  dimensions?: {
    provider?: string;
    model?: string;
    capability?: string;
    environment?: string;
  };
}

export interface Anomaly {
  id: string;

  fingerprint: string;

  organizationId: string;

  metric: AnomalyMetric;

  ruleId: string;

  severity: AnomalySeverity;

  confidence: number;

  title: string;

  description: string;

  recommendation?: string;

  currentValue: number;

  baselineValue: number;

  percentageChange: number;

  zScore?: number;

  sampleSize: number;

  dimensions: Record<string, string>;

  firstDetectedAt: Date;

  lastDetectedAt: Date;

  occurrences: number;

  status: "open" | "acknowledged" | "resolved";

  evidence: Record<string, unknown>;
}

export interface DetectorConfig {
  /**
   * Number of observations used for baseline calculation.
   */
  baselineWindowSize?: number;

  /**
   * Minimum observations required before anomaly detection.
   */
  minimumSampleSize?: number;

  /**
   * How long a duplicate anomaly remains suppressed.
   */
  deduplicationWindowMs?: number;

  /**
   * Maximum observations retained per metric/dimension.
   */
  maxObservationsPerSeries?: number;

  /**
   * Rules can be injected for testing/custom deployments.
   */
  rules?: AnomalyRule[];
}

interface SeriesState {
  observations: Observation[];

  lastAnomalies: Map<string, Anomaly>;
}

function stableHash(input: string): string {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    const code = input.charCodeAt(index);
    hash ^= code;
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}

function createStableHash(input: string): string {
  return stableHash(input);
}

function createRandomId(): string {
  const cryptoApi =
    globalThis.crypto;

  if (
    cryptoApi &&
    typeof cryptoApi.randomUUID === "function"
  ) {
    return cryptoApi.randomUUID();
  }

  return `anomaly-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const DEFAULT_CONFIG: Required<
  Omit<DetectorConfig, "rules">
> = {
  baselineWindowSize: 100,
  minimumSampleSize: 20,
  deduplicationWindowMs: 5 * 60 * 1000,
  maxObservationsPerSeries: 10_000,
};

export class AnomalyDetector {
  private readonly config: Required<
    Omit<DetectorConfig, "rules">
  >;

  private readonly rules: AnomalyRule[];

  private readonly series =
    new Map<string, SeriesState>();

  constructor(config: DetectorConfig = {}) {
    this.config = {
      baselineWindowSize:
        config.baselineWindowSize ??
        DEFAULT_CONFIG.baselineWindowSize,

      minimumSampleSize:
        config.minimumSampleSize ??
        DEFAULT_CONFIG.minimumSampleSize,

      deduplicationWindowMs:
        config.deduplicationWindowMs ??
        DEFAULT_CONFIG.deduplicationWindowMs,

      maxObservationsPerSeries:
        config.maxObservationsPerSeries ??
        DEFAULT_CONFIG.maxObservationsPerSeries,
    };

    this.rules =
      config.rules ??
      createDefaultAnomalyRules();
  }

  /**
   * Record one observation.
   */
  record(observation: Observation): void {
    this.validateObservation(observation);

    const key =
      this.createSeriesKey(observation);

    let state = this.series.get(key);

    if (!state) {
      state = {
        observations: [],
        lastAnomalies: new Map(),
      };

      this.series.set(key, state);
    }

    state.observations.push({
      ...observation,
      timestamp: new Date(
        observation.timestamp,
      ),
    });

    /**
     * Keep memory bounded.
     */
    if (
      state.observations.length >
      this.config.maxObservationsPerSeries
    ) {
      const removeCount =
        state.observations.length -
        this.config.maxObservationsPerSeries;

      state.observations.splice(
        0,
        removeCount,
      );
    }
  }

  /**
   * Record many observations efficiently.
   */
  recordBatch(
    observations: Observation[],
  ): void {
    for (const observation of observations) {
      this.record(observation);
    }
  }

  /**
   * Detect anomalies for a newly recorded observation.
   */
  detect(
    observation: Observation,
  ): Anomaly[] {
    this.record(observation);

    return this.detectCurrent(
      observation,
    );
  }

  /**
   * Detect anomalies without recording the observation.
   */
  detectCurrent(
    observation: Observation,
  ): Anomaly[] {
    this.validateObservation(observation);

    const key =
      this.createSeriesKey(observation);

    const state =
      this.series.get(key);

    if (!state) {
      return [];
    }

    const historicalObservations =
      state.observations
        .filter(
          (item) =>
            item.timestamp.getTime() <
            observation.timestamp.getTime(),
        )
        .slice(
          -this.config.baselineWindowSize,
        );

    if (
      historicalObservations.length <
      this.config.minimumSampleSize
    ) {
      return [];
    }

    const baseline =
      this.calculateBaseline(
        historicalObservations,
      );

    const percentageChange =
      this.calculatePercentageChange(
        observation.value,
        baseline.mean,
      );

    const applicableRules =
      this.rules.filter(
        (rule) =>
          rule.metric === observation.metric,
      );

    const anomalies: Anomaly[] = [];

    for (const rule of applicableRules) {
      const context: AnomalyRuleContext = {
        organizationId:
          observation.organizationId,

        metric: observation.metric,

        currentValue:
          observation.value,

        baselineValue:
          baseline.mean,

        standardDeviation:
          baseline.standardDeviation,

        percentageChange,

        sampleSize:
          historicalObservations.length,

        dimensions:
          observation.dimensions,

        timestamp:
          observation.timestamp,
      };

      const result =
        rule.evaluate(context);

      if (!result.triggered) {
        continue;
      }

      const anomaly =
        this.createAnomaly(
          observation,
          result,
          baseline,
          historicalObservations.length,
        );

      const deduplicated =
        this.deduplicate(
          state,
          anomaly,
        );

      if (deduplicated) {
        anomalies.push(
          deduplicated,
        );
      }
    }

    return anomalies;
  }

  /**
   * Calculate statistical baseline.
   */
  calculateBaseline(
    observations: Observation[],
  ): {
    mean: number;
    standardDeviation: number;
    min: number;
    max: number;
    sampleSize: number;
  } {
    if (observations.length === 0) {
      return {
        mean: 0,
        standardDeviation: 0,
        min: 0,
        max: 0,
        sampleSize: 0,
      };
    }

    const values =
      observations.map(
        (observation) =>
          observation.value,
      );

    const mean =
      values.reduce(
        (sum, value) =>
          sum + value,
        0,
      ) / values.length;

    const variance =
      values.reduce(
        (sum, value) =>
          sum +
          Math.pow(
            value - mean,
            2,
          ),
        0,
      ) / values.length;

    return {
      mean,

      standardDeviation:
        Math.sqrt(variance),

      min: Math.min(...values),

      max: Math.max(...values),

      sampleSize: values.length,
    };
  }

  /**
   * Get currently stored observations.
   */
  getObservations(
    organizationId: string,
    metric: AnomalyMetric,
    dimensions?: Observation["dimensions"],
  ): Observation[] {
    const key =
      this.createSeriesKey({
        organizationId,
        metric,
        value: 0,
        timestamp: new Date(),
        dimensions,
      });

    return [
      ...(this.series.get(key)
        ?.observations ?? []),
    ];
  }

  /**
   * Get active anomalies for an organization.
   */
  getOpenAnomalies(
    organizationId: string,
  ): Anomaly[] {
    const anomalies: Anomaly[] = [];

    for (const state of this.series.values()) {
      for (const anomaly of state.lastAnomalies.values()) {
        if (
          anomaly.organizationId ===
            organizationId &&
          anomaly.status === "open"
        ) {
          anomalies.push(anomaly);
        }
      }
    }

    return anomalies.sort(
      (a, b) =>
        b.lastDetectedAt.getTime() -
        a.lastDetectedAt.getTime(),
    );
  }

  /**
   * Acknowledge an anomaly.
   */
  acknowledge(
    anomalyId: string,
  ): boolean {
    for (const state of this.series.values()) {
      for (const anomaly of state.lastAnomalies.values()) {
        if (anomaly.id === anomalyId) {
          anomaly.status =
            "acknowledged";

          return true;
        }
      }
    }

    return false;
  }

  /**
   * Resolve an anomaly.
   */
  resolve(
    anomalyId: string,
  ): boolean {
    for (const state of this.series.values()) {
      for (const anomaly of state.lastAnomalies.values()) {
        if (anomaly.id === anomalyId) {
          anomaly.status =
            "resolved";

          return true;
        }
      }
    }

    return false;
  }

  /**
   * Health information for monitoring the detector.
   */
  health(): {
    seriesCount: number;
    observationCount: number;
    anomalyCount: number;
  } {
    let observationCount = 0;
    let anomalyCount = 0;

    for (const state of this.series.values()) {
      observationCount +=
        state.observations.length;

      anomalyCount +=
        state.lastAnomalies.size;
    }

    return {
      seriesCount:
        this.series.size,

      observationCount,

      anomalyCount,
    };
  }

  /**
   * ------------------------------------------------------------
   * Internal methods
   * ------------------------------------------------------------
   */

  private createSeriesKey(
    observation: Observation,
  ): string {
    const dimensions =
      this.normalizeDimensions(
        observation.dimensions,
      );

    const dimensionString =
      Object.entries(dimensions)
        .sort(([a], [b]) =>
          a.localeCompare(b),
        )
        .map(
          ([key, value]) =>
            `${key}=${value ?? ""}`,
        )
        .join("|");

    return [
      observation.organizationId,
      observation.metric,
      dimensionString,
    ].join("::");
  }

  private createFingerprint(
    observation: Observation,
    ruleId: string,
  ): string {
    const raw = JSON.stringify({
      organizationId:
        observation.organizationId,

      metric:
        observation.metric,

      ruleId,

      dimensions:
        observation.dimensions ?? {},
    });

    return createStableHash(raw);
  }

  private createAnomaly(
    observation: Observation,
    result: AnomalyRuleResult,
    baseline: {
      mean: number;
      standardDeviation: number;
    },
    sampleSize: number,
  ): Anomaly {
    const zScore =
      baseline.standardDeviation > 0
        ? (
            observation.value -
            baseline.mean
          ) /
          baseline.standardDeviation
        : undefined;

    const percentageChange =
      this.calculatePercentageChange(
        observation.value,
        baseline.mean,
      );

    const fingerprint =
      this.createFingerprint(
        observation,
        this.findRuleId(result),
      );

    const now =
      new Date();

    return {
      id: createRandomId(),

      fingerprint,

      organizationId:
        observation.organizationId,

      metric:
        observation.metric,

      ruleId:
        this.findRuleId(result),

      severity:
        result.severity,

      confidence:
        result.confidence,

      title:
        result.title,

      description:
        result.description,

      recommendation:
        result.recommendation,

      currentValue:
        observation.value,

      baselineValue:
        baseline.mean,

      percentageChange,

      zScore,

      sampleSize,

      dimensions:
        this.normalizeDimensions(
          observation.dimensions,
        ),

      firstDetectedAt: now,

      lastDetectedAt: now,

      occurrences: 1,

      status: "open",

      evidence: {
        ...result.evidence,

        baselineMean:
          baseline.mean,

        baselineStandardDeviation:
          baseline.standardDeviation,
      },
    };
  }

  /**
   * Rules currently return no rule ID in their result,
   * therefore infer it from the metric/result title.
   *
   * For larger deployments this should be replaced by
   * adding `ruleId` directly to AnomalyRuleResult.
   */
  private findRuleId(
    result: AnomalyRuleResult,
  ): string {
    const title =
      result.title.toLowerCase();

    if (title.includes("latency")) {
      return "latency.high";
    }

    if (title.includes("cost")) {
      return "cost.high";
    }

    if (title.includes("error")) {
      return "error_rate.high";
    }

    if (title.includes("quality")) {
      return "quality.degradation";
    }

    if (title.includes("token")) {
      return "token_usage.spike";
    }

    if (title.includes("request")) {
      return "request_volume.spike";
    }

    if (title.includes("cache")) {
      return "cache_hit_rate.degradation";
    }

    return "unknown";
  }

  private deduplicate(
    state: SeriesState,
    anomaly: Anomaly,
  ): Anomaly | null {
    const existing =
      state.lastAnomalies.get(
        anomaly.fingerprint,
      );

    if (!existing) {
      state.lastAnomalies.set(
        anomaly.fingerprint,
        anomaly,
      );

      return anomaly;
    }

    const elapsed =
      anomaly.firstDetectedAt.getTime() -
      existing.lastDetectedAt.getTime();

    /**
     * Outside suppression window:
     * create a fresh anomaly.
     */
    if (
      elapsed >
      this.config.deduplicationWindowMs
    ) {
      state.lastAnomalies.set(
        anomaly.fingerprint,
        anomaly,
      );

      return anomaly;
    }

    /**
     * Same incident.
     * Update existing anomaly instead
     * of creating thousands of alerts.
     */
    existing.lastDetectedAt =
      anomaly.lastDetectedAt;

    existing.occurrences += 1;

    existing.currentValue =
      anomaly.currentValue;

    existing.percentageChange =
      anomaly.percentageChange;

    existing.confidence =
      Math.max(
        existing.confidence,
        anomaly.confidence,
      );

    existing.evidence = {
      ...existing.evidence,

      latestValue:
        anomaly.currentValue,

      latestPercentageChange:
        anomaly.percentageChange,

      latestTimestamp:
        anomaly.lastDetectedAt.toISOString(),
    };

    return existing;
  }

  private calculatePercentageChange(
    current: number,
    baseline: number,
  ): number {
    if (baseline === 0) {
      if (current === 0) {
        return 0;
      }

      return 100;
    }

    return (
      ((current - baseline) /
        Math.abs(baseline)) *
      100
    );
  }

  private normalizeDimensions(
    dimensions:
      | Observation["dimensions"]
      | undefined,
  ): Record<string, string> {
    const defaults = {
      provider: "openai",
      model: "gpt-production",
      capability: "chat",
      environment: "production",
    };

    const merged = {
      ...defaults,
      ...(dimensions ?? {}),
    };

    return Object.fromEntries(
      Object.entries(merged)
        .filter(
          ([, value]) =>
            value !== undefined,
        )
        .map(
          ([key, value]) =>
            [key, String(value)],
        ),
    );
  }

  private validateObservation(
    observation: Observation,
  ): void {
    if (
      !observation.organizationId
        .trim()
    ) {
      throw new Error(
        "organizationId is required",
      );
    }

    if (
      !Number.isFinite(
        observation.value,
      )
    ) {
      throw new Error(
        "Observation value must be a finite number",
      );
    }

    if (
      !(observation.timestamp instanceof Date) ||
      Number.isNaN(
        observation.timestamp.getTime(),
      )
    ) {
      throw new Error(
        "Observation timestamp must be a valid Date",
      );
    }
  }
}

/**
 * Factory used by the application.
 */
export function createAnomalyDetector(
  config: DetectorConfig = {},
): AnomalyDetector {
  return new AnomalyDetector(
    config,
  );
}