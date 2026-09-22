import {
  AnomalyDetector,
} from "./detector.js";

const assert = {
  equal(
    actual: unknown,
    expected: unknown,
    message?: string,
  ): void {
    if (actual !== expected) {
      throw new Error(
        message ??
          `Expected ${String(expected)} but received ${String(actual)}`,
      );
    }
  },

  ok(
    condition: unknown,
    message?: string,
  ): void {
    if (!condition) {
      throw new Error(
        message ?? "Assertion failed",
      );
    }
  },

  notEqual(
    actual: unknown,
    expected: unknown,
    message?: string,
  ): void {
    if (actual === expected) {
      throw new Error(
        message ??
          `Expected values to differ, but both were ${String(actual)}`,
      );
    }
  },

  throws(
    fn: () => void,
    expected?: RegExp | string,
    message?: string,
  ): void {
    try {
      fn();
      throw new Error(
        message ?? "Expected function to throw",
      );
    } catch (error) {
      if (expected) {
        const thrown =
          error instanceof Error
            ? error.message
            : String(error);

        if (
          typeof expected === "string" &&
          !thrown.includes(expected)
        ) {
          throw new Error(
            message ??
              `Expected thrown error to include "${expected}", got "${thrown}"`,
          );
        }

        if (
          expected instanceof RegExp &&
          !expected.test(thrown)
        ) {
          throw new Error(
            message ??
              `Expected thrown error to match ${expected}, got "${thrown}"`,
          );
        }
      }
    }
  },
};

const test = (
  name: string,
  fn: () => void,
): void => {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
};

function expectDefined<T>(
  value: T | null | undefined,
  message: string,
): T {
  if (value == null) {
    throw new Error(message);
  }

  return value;
}

import {
  HighLatencyRule,
  HighCostRule,
  ErrorRateRule,
  QualityDegradationRule,
  TokenUsageSpikeRule,
  RequestVolumeSpikeRule,
  CacheHitRateDegradationRule,
} from "./rules.js";

/**
 * ModelNow
 * Anomaly Detection Test Suite
 *
 * Covers:
 * - baseline creation
 * - latency anomalies
 * - cost anomalies
 * - error-rate anomalies
 * - quality degradation
 * - token spikes
 * - request-volume spikes
 * - cache degradation
 * - multi-tenant isolation
 * - deduplication
 * - acknowledge / resolve
 * - invalid input handling
 */

const ORGANIZATION_ID =
  "org-modelnow-test";

const OTHER_ORGANIZATION_ID =
  "org-other-test";

function createDetector(): AnomalyDetector {
  return new AnomalyDetector({
    baselineWindowSize: 100,
    minimumSampleSize: 20,
    deduplicationWindowMs: 5 * 60 * 1000,
    maxObservationsPerSeries: 10_000,
  });
}

function createTimestamp(
  offsetMinutes: number,
): Date {
  return new Date(
    Date.now() +
      offsetMinutes * 60 * 1000,
  );
}

/**
 * Add normal historical observations.
 */
function addBaseline(
  detector: AnomalyDetector,
  metric:
    | "latency"
    | "cost"
    | "error_rate"
    | "quality"
    | "token_usage"
    | "request_volume"
    | "cache_hit_rate",
  value: number,
  options?: {
    organizationId?: string;
    provider?: string;
    model?: string;
    capability?: string;
    environment?: string;
  },
): void {
  const organizationId =
    options?.organizationId ??
    ORGANIZATION_ID;

  for (let i = 1; i <= 30; i++) {
    detector.record({
      organizationId,

      metric,

      value,

      timestamp:
        createTimestamp(-i),

      dimensions: {
        provider:
          options?.provider ??
          "openai",

        model:
          options?.model ??
          "gpt-production",

        capability:
          options?.capability ??
          "chat",

        environment:
          options?.environment ??
          "production",
      },
    });
  }
}

/**
 * ============================================================
 * 1. Detector initialization
 * ============================================================
 */

test(
  "AnomalyDetector initializes correctly",
  () => {
    const detector =
      createDetector();

    const health =
      detector.health();

    assert.equal(
      health.seriesCount,
      0,
    );

    assert.equal(
      health.observationCount,
      0,
    );

    assert.equal(
      health.anomalyCount,
      0,
    );
  },
);

/**
 * ============================================================
 * 2. Baseline calculation
 * ============================================================
 */

test(
  "calculates statistical baseline correctly",
  () => {
    const detector =
      createDetector();

    const observations = [
      100,
      110,
      90,
      100,
      100,
    ].map((value, index) => ({
      organizationId:
        ORGANIZATION_ID,

      metric:
        "latency" as const,

      value,

      timestamp:
        createTimestamp(-index),
    }));

    const baseline =
      detector.calculateBaseline(
        observations,
      );

    assert.equal(
      baseline.sampleSize,
      5,
    );

    assert.equal(
      baseline.mean,
      100,
    );

    assert.equal(
      baseline.min,
      90,
    );

    assert.equal(
      baseline.max,
      110,
    );

    assert.ok(
      baseline.standardDeviation > 0,
    );
  },
);

/**
 * ============================================================
 * 3. Insufficient baseline
 * ============================================================
 */

test(
  "does not detect anomaly when baseline sample is insufficient",
  () => {
    const detector =
      createDetector();

    for (let i = 1; i <= 5; i++) {
      detector.record({
        organizationId:
          ORGANIZATION_ID,

        metric: "latency",

        value: 100,

        timestamp:
          createTimestamp(-i),
      });
    }

    const anomalies =
      detector.detect({
        organizationId:
          ORGANIZATION_ID,

        metric: "latency",

        value: 5000,

        timestamp:
          createTimestamp(1),
      });

    assert.equal(
      anomalies.length,
      0,
    );
  },
);

/**
 * ============================================================
 * 4. High latency detection
 * ============================================================
 */

test(
  "detects high latency anomaly",
  () => {
    const detector =
      createDetector();

    addBaseline(
      detector,
      "latency",
      100,
      {
        provider: "openai",
        model: "gpt-production",
      },
    );

    const anomalies =
      detector.detect({
        organizationId:
          ORGANIZATION_ID,

        metric: "latency",

        value: 3000,

        timestamp:
          createTimestamp(1),

        dimensions: {
          provider: "openai",
          model: "gpt-production",
          capability: "chat",
          environment: "production",
        },
      });

    assert.ok(
      anomalies.length >= 1,
    );

    const anomaly =
      expectDefined(
        anomalies.find(
          (item) =>
            item.ruleId ===
            "latency.high",
        ),
        "Expected latency anomaly to be present",
      );

    assert.equal(
      anomaly.metric,
      "latency",
    );

    assert.equal(
      anomaly.organizationId,
      ORGANIZATION_ID,
    );

    assert.ok(
      anomaly.currentValue >= 3000,
    );

    assert.ok(
      anomaly.baselineValue > 0,
    );

    assert.ok(
      anomaly.confidence > 0,
    );

    assert.equal(
      anomaly.status,
      "open",
    );
  },
);

/**
 * ============================================================
 * 5. Normal latency should not trigger
 * ============================================================
 */

test(
  "does not trigger anomaly for normal latency",
  () => {
    const detector =
      createDetector();

    addBaseline(
      detector,
      "latency",
      100,
    );

    const anomalies =
      detector.detect({
        organizationId:
          ORGANIZATION_ID,

        metric: "latency",

        value: 105,

        timestamp:
          createTimestamp(1),
      });

    assert.equal(
      anomalies.length,
      0,
    );
  },
);

/**
 * ============================================================
 * 6. Cost anomaly
 * ============================================================
 */

test(
  "detects high cost anomaly",
  () => {
    const detector =
      createDetector();

    addBaseline(
      detector,
      "cost",
      0.01,
      {
        provider: "openai",
        model: "gpt-production",
      },
    );

    const anomalies =
      detector.detect({
        organizationId:
          ORGANIZATION_ID,

        metric: "cost",

        value: 0.05,

        timestamp:
          createTimestamp(1),

        dimensions: {
          provider: "openai",
          model: "gpt-production",
          capability: "chat",
          environment: "production",
        },
      });

    const anomaly =
      expectDefined(
        anomalies.find(
          (item) =>
            item.ruleId ===
            "cost.high",
        ),
        "Expected cost anomaly to be present",
      );

    assert.equal(
      anomaly.metric,
      "cost",
    );

    assert.ok(
      anomaly.percentageChange >=
        300,
    );
  },
);

/**
 * ============================================================
 * 7. Error rate anomaly
 * ============================================================
 */

test(
  "detects elevated error rate",
  () => {
    const detector =
      createDetector();

    addBaseline(
      detector,
      "error_rate",
      0.01,
    );

    const anomalies =
      detector.detect({
        organizationId:
          ORGANIZATION_ID,

        metric: "error_rate",

        value: 0.20,

        timestamp:
          createTimestamp(1),
      });

    const anomaly =
      expectDefined(
        anomalies.find(
          (item) =>
            item.ruleId ===
            "error_rate.high",
        ),
        "Expected error-rate anomaly to be present",
      );

    assert.equal(
      anomaly.metric,
      "error_rate",
    );

    assert.equal(
      anomaly.currentValue,
      0.20,
    );

    assert.ok(
      anomaly.severity ===
        "medium" ||
      anomaly.severity ===
        "high" ||
      anomaly.severity ===
        "critical",
    );
  },
);

/**
 * ============================================================
 * 8. Quality degradation
 * ============================================================
 */

test(
  "detects quality degradation",
  () => {
    const detector =
      createDetector();

    addBaseline(
      detector,
      "quality",
      0.90,
    );

    const anomalies =
      detector.detect({
        organizationId:
          ORGANIZATION_ID,

        metric: "quality",

        value: 0.60,

        timestamp:
          createTimestamp(1),
      });

    const anomaly =
      expectDefined(
        anomalies.find(
          (item) =>
            item.ruleId ===
            "quality.degradation",
        ),
        "Expected quality anomaly to be present",
      );

    assert.equal(
      anomaly.metric,
      "quality",
    );

    assert.ok(
      anomaly.currentValue <
        anomaly.baselineValue,
    );

    assert.ok(
      anomaly.severity ===
        "high" ||
      anomaly.severity ===
        "critical",
    );
  },
);

/**
 * ============================================================
 * 9. Token usage spike
 * ============================================================
 */

test(
  "detects token usage spike",
  () => {
    const detector =
      createDetector();

    addBaseline(
      detector,
      "token_usage",
      1000,
    );

    const anomalies =
      detector.detect({
        organizationId:
          ORGANIZATION_ID,

        metric: "token_usage",

        value: 5000,

        timestamp:
          createTimestamp(1),
      });

    const anomaly =
      expectDefined(
        anomalies.find(
          (item) =>
            item.ruleId ===
            "token_usage.spike",
        ),
        "Expected token anomaly to be present",
      );

    assert.equal(
      anomaly.metric,
      "token_usage",
    );

    assert.ok(
      anomaly.percentageChange >=
        300,
    );
  },
);

/**
 * ============================================================
 * 10. Request volume spike
 * ============================================================
 */

test(
  "detects request volume spike",
  () => {
    const detector =
      createDetector();

    addBaseline(
      detector,
      "request_volume",
      1000,
    );

    const anomalies =
      detector.detect({
        organizationId:
          ORGANIZATION_ID,

        metric: "request_volume",

        value: 5000,

        timestamp:
          createTimestamp(1),
      });

    const anomaly =
      expectDefined(
        anomalies.find(
          (item) =>
            item.ruleId ===
            "request_volume.spike",
        ),
        "Expected request-volume anomaly to be present",
      );

    assert.equal(
      anomaly.metric,
      "request_volume",
    );

    assert.ok(
      anomaly.percentageChange >=
        300,
    );
  },
);

/**
 * ============================================================
 * 11. Cache hit-rate degradation
 * ============================================================
 */

test(
  "detects cache hit-rate degradation",
  () => {
    const detector =
      createDetector();

    addBaseline(
      detector,
      "cache_hit_rate",
      0.90,
    );

    const anomalies =
      detector.detect({
        organizationId:
          ORGANIZATION_ID,

        metric: "cache_hit_rate",

        value: 0.50,

        timestamp:
          createTimestamp(1),
      });

    const anomaly =
      expectDefined(
        anomalies.find(
          (item) =>
            item.ruleId ===
            "cache_hit_rate.degradation",
        ),
        "Expected cache anomaly to be present",
      );

    assert.equal(
      anomaly.metric,
      "cache_hit_rate",
    );

    assert.ok(
      anomaly.currentValue <
        anomaly.baselineValue,
    );
  },
);

/**
 * ============================================================
 * 12. Multi-tenant isolation
 * ============================================================
 */

test(
  "isolates observations between organizations",
  () => {
    const detector =
      createDetector();

    addBaseline(
      detector,
      "latency",
      100,
      {
        organizationId:
          ORGANIZATION_ID,
      },
    );

    addBaseline(
      detector,
      "latency",
      500,
      {
        organizationId:
          OTHER_ORGANIZATION_ID,
      },
    );

    const anomalies =
      detector.detect({
        organizationId:
          ORGANIZATION_ID,

        metric: "latency",

        value: 3000,

        timestamp:
          createTimestamp(1),
      });

    assert.ok(
      anomalies.length >= 1,
    );

    for (const anomaly of anomalies) {
      assert.equal(
        anomaly.organizationId,
        ORGANIZATION_ID,
      );

      assert.notEqual(
        anomaly.organizationId,
        OTHER_ORGANIZATION_ID,
      );
    }
  },
);

/**
 * ============================================================
 * 13. Dimension isolation
 * ============================================================
 */

test(
  "keeps provider/model dimensions isolated",
  () => {
    const detector =
      createDetector();

    addBaseline(
      detector,
      "latency",
      100,
      {
        provider: "openai",
        model: "model-a",
      },
    );

    addBaseline(
      detector,
      "latency",
      500,
      {
        provider: "anthropic",
        model: "model-b",
      },
    );

    const anomalies =
      detector.detect({
        organizationId:
          ORGANIZATION_ID,

        metric: "latency",

        value: 3000,

        timestamp:
          createTimestamp(1),

        dimensions: {
          provider: "openai",
          model: "model-a",
          capability: "chat",
          environment: "production",
        },
      });

    assert.ok(
      anomalies.length >= 1,
    );

    for (const anomaly of anomalies) {
      assert.equal(
        anomaly.dimensions.provider,
        "openai",
      );

      assert.equal(
        anomaly.dimensions.model,
        "model-a",
      );
    }
  },
);

/**
 * ============================================================
 * 14. Deduplication
 * ============================================================
 */

test(
  "deduplicates repeated anomalies",
  () => {
    const detector =
      createDetector();

    addBaseline(
      detector,
      "latency",
      100,
    );

    const timestamp =
      createTimestamp(1);

    const first =
      detector.detect({
        organizationId:
          ORGANIZATION_ID,

        metric: "latency",

        value: 3000,

        timestamp,
      });

    assert.ok(
      first.length >= 1,
    );

    const second =
      detector.detect({
        organizationId:
          ORGANIZATION_ID,

        metric: "latency",

        value: 3500,

        timestamp:
          createTimestamp(2),
      });

    assert.ok(
      second.length >= 1,
    );

    const openAnomalies =
      detector.getOpenAnomalies(
        ORGANIZATION_ID,
      );

    /**
     * The same incident should not
     * generate unlimited anomaly records.
     */
    assert.equal(
      openAnomalies.length,
      1,
    );

    assert.ok(
      openAnomalies[0].occurrences >=
        2,
    );
  },
);

/**
 * ============================================================
 * 15. Acknowledge anomaly
 * ============================================================
 */

test(
  "acknowledges an anomaly",
  () => {
    const detector =
      createDetector();

    addBaseline(
      detector,
      "latency",
      100,
    );

    const anomalies =
      detector.detect({
        organizationId:
          ORGANIZATION_ID,

        metric: "latency",

        value: 3000,

        timestamp:
          createTimestamp(1),
      });

    assert.ok(
      anomalies.length >= 1,
    );

    const anomaly =
      anomalies[0];

    const result =
      detector.acknowledge(
        anomaly.id,
      );

    assert.equal(
      result,
      true,
    );

    const open =
      detector.getOpenAnomalies(
        ORGANIZATION_ID,
      );

    assert.equal(
      open.length,
      0,
    );
  },
);

/**
 * ============================================================
 * 16. Resolve anomaly
 * ============================================================
 */

test(
  "resolves an anomaly",
  () => {
    const detector =
      createDetector();

    addBaseline(
      detector,
      "latency",
      100,
    );

    const anomalies =
      detector.detect({
        organizationId:
          ORGANIZATION_ID,

        metric: "latency",

        value: 3000,

        timestamp:
          createTimestamp(1),
      });

    assert.ok(
      anomalies.length >= 1,
    );

    const anomaly =
      anomalies[0];

    const result =
      detector.resolve(
        anomaly.id,
      );

    assert.equal(
      result,
      true,
    );

    const open =
      detector.getOpenAnomalies(
        ORGANIZATION_ID,
      );

    assert.equal(
      open.length,
      0,
    );
  },
);

/**
 * ============================================================
 * 17. Invalid organization ID
 * ============================================================
 */

test(
  "rejects empty organization ID",
  () => {
    const detector =
      createDetector();

    assert.throws(
      () => {
        detector.record({
          organizationId: "",

          metric: "latency",

          value: 100,

          timestamp: new Date(),
        });
      },
      /organizationId is required/,
    );
  },
);

/**
 * ============================================================
 * 18. Invalid numeric value
 * ============================================================
 */

test(
  "rejects NaN observation values",
  () => {
    const detector =
      createDetector();

    assert.throws(
      () => {
        detector.record({
          organizationId:
            ORGANIZATION_ID,

          metric: "latency",

          value: Number.NaN,

          timestamp: new Date(),
        });
      },
      /finite number/,
    );
  },
);

/**
 * ============================================================
 * 19. Invalid Infinity
 * ============================================================
 */

test(
  "rejects Infinity observation values",
  () => {
    const detector =
      createDetector();

    assert.throws(
      () => {
        detector.record({
          organizationId:
            ORGANIZATION_ID,

          metric: "cost",

          value:
            Number.POSITIVE_INFINITY,

          timestamp: new Date(),
        });
      },
      /finite number/,
    );
  },
);

/**
 * ============================================================
 * 20. Observation retention
 * ============================================================
 */

test(
  "limits retained observations",
  () => {
    const detector =
      new AnomalyDetector({
        baselineWindowSize: 20,
        minimumSampleSize: 5,
        maxObservationsPerSeries: 10,
      });

    for (let i = 0; i < 100; i++) {
      detector.record({
        organizationId:
          ORGANIZATION_ID,

        metric: "latency",

        value: 100,

        timestamp:
          createTimestamp(-i),
      });
    }

    const observations =
      detector.getObservations(
        ORGANIZATION_ID,
        "latency",
      );

    assert.equal(
      observations.length,
      10,
    );
  },
);

/**
 * ============================================================
 * 21. Health metrics
 * ============================================================
 */

test(
  "returns detector health information",
  () => {
    const detector =
      createDetector();

    addBaseline(
      detector,
      "latency",
      100,
    );

    addBaseline(
      detector,
      "cost",
      0.01,
    );

    const health =
      detector.health();

    assert.ok(
      health.seriesCount >= 2,
    );

    assert.ok(
      health.observationCount >= 60,
    );

    assert.equal(
      typeof health.anomalyCount,
      "number",
    );
  },
);

/**
 * ============================================================
 * 22. Rule-level unit tests
 * ============================================================
 */

test(
  "HighLatencyRule has expected rule ID",
  () => {
    const rule =
      new HighLatencyRule();

    assert.equal(
      rule.id,
      "latency.high",
    );

    assert.equal(
      rule.metric,
      "latency",
    );
  },
);

test(
  "HighCostRule has expected rule ID",
  () => {
    const rule =
      new HighCostRule();

    assert.equal(
      rule.id,
      "cost.high",
    );

    assert.equal(
      rule.metric,
      "cost",
    );
  },
);

test(
  "ErrorRateRule has expected rule ID",
  () => {
    const rule =
      new ErrorRateRule();

    assert.equal(
      rule.id,
      "error_rate.high",
    );

    assert.equal(
      rule.metric,
      "error_rate",
    );
  },
);

test(
  "QualityDegradationRule has expected rule ID",
  () => {
    const rule =
      new QualityDegradationRule();

    assert.equal(
      rule.id,
      "quality.degradation",
    );

    assert.equal(
      rule.metric,
      "quality",
    );
  },
);

test(
  "TokenUsageSpikeRule has expected rule ID",
  () => {
    const rule =
      new TokenUsageSpikeRule();

    assert.equal(
      rule.id,
      "token_usage.spike",
    );

    assert.equal(
      rule.metric,
      "token_usage",
    );
  },
);

test(
  "RequestVolumeSpikeRule has expected rule ID",
  () => {
    const rule =
      new RequestVolumeSpikeRule();

    assert.equal(
      rule.id,
      "request_volume.spike",
    );

    assert.equal(
      rule.metric,
      "request_volume",
    );
  },
);

test(
  "CacheHitRateDegradationRule has expected rule ID",
  () => {
    const rule =
      new CacheHitRateDegradationRule();

    assert.equal(
      rule.id,
      "cache_hit_rate.degradation",
    );

    assert.equal(
      rule.metric,
      "cache_hit_rate",
    );
  },
);