// services/analytics/config/test_config.ts

import {
  loadConfig,
  toSafeConfig,
} from "./settings.js";

type TestFunction = () => void | Promise<void>;

let passed = 0;
let failed = 0;

function assert(
  condition: boolean,
  message: string,
): void {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual<T>(
  actual: T,
  expected: T,
  message: string,
): void {
  if (actual !== expected) {
    throw new Error(
      `${message}\nExpected: ${String(expected)}\nActual: ${String(actual)}`,
    );
  }
}

function assertThrows(
  fn: () => unknown,
  message: string,
): void {
  let threw = false;

  try {
    fn();
  } catch {
    threw = true;
  }

  assert(threw, message);
}

async function test(
  name: string,
  fn: TestFunction,
): Promise<void> {
  try {
    await fn();

    passed++;

    console.log(`✓ ${name}`);
  } catch (error) {
    failed++;

    console.error(`✗ ${name}`);

    throw error;
  }
}

await test(
  "loads default configuration",
  () => {
    const config = loadConfig({});

    assertEqual(
      config.environment,
      "development",
      "Default environment should be development",
    );

    assertEqual(
      config.serviceName,
      "modelnow-analytics",
      "Default service name is incorrect",
    );

    assertEqual(
      config.port,
      3000,
      "Default port is incorrect",
    );
  },
);

await test(
  "loads custom environment variables",
  () => {
    const config = loadConfig({
      NODE_ENV: "production",
      SERVICE_NAME: "analytics-service",
      SERVICE_VERSION: "2.0.0",
      HOST: "127.0.0.1",
      PORT: "8080",
    });

    assertEqual(
      config.environment,
      "production",
      "Environment should be production",
    );

    assertEqual(
      config.serviceName,
      "analytics-service",
      "Service name is incorrect",
    );

    assertEqual(
      config.serviceVersion,
      "2.0.0",
      "Service version is incorrect",
    );

    assertEqual(
      config.host,
      "127.0.0.1",
      "Host is incorrect",
    );

    assertEqual(
      config.port,
      8080,
      "Port is incorrect",
    );
  },
);

await test(
  "parses boolean environment variables",
  () => {
    const config = loadConfig({
      CACHE_ENABLED: "false",
      ANALYTICS_ENABLED: "0",
      AUDIT_ENABLED: "yes",
      AUDIT_HASH_CHAIN_ENABLED: "true",
    });

    assertEqual(
      config.cache.enabled,
      false,
      "CACHE_ENABLED should be false",
    );

    assertEqual(
      config.analytics.enabled,
      false,
      "ANALYTICS_ENABLED should be false",
    );

    assertEqual(
      config.audit.enabled,
      true,
      "AUDIT_ENABLED should be true",
    );

    assertEqual(
      config.audit.hashChainEnabled,
      true,
      "AUDIT_HASH_CHAIN_ENABLED should be true",
    );
  },
);

await test(
  "parses database configuration",
  () => {
    const config = loadConfig({
      DATABASE_URL:
        "postgresql://localhost/modelnow",
      DB_POOL_MIN: "5",
      DB_POOL_MAX: "25",
      DB_CONNECTION_TIMEOUT_MS: "10000",
    });

    assertEqual(
      config.database.url,
      "postgresql://localhost/modelnow",
      "Database URL is incorrect",
    );

    assertEqual(
      config.database.poolMin,
      5,
      "Database minimum pool is incorrect",
    );

    assertEqual(
      config.database.poolMax,
      25,
      "Database maximum pool is incorrect",
    );

    assertEqual(
      config.database.connectionTimeoutMs,
      10000,
      "Database timeout is incorrect",
    );
  },
);

await test(
  "parses Redis configuration",
  () => {
    const config = loadConfig({
      REDIS_URL:
        "redis://localhost:6379",
      REDIS_KEY_PREFIX:
        "modelnow:production",
      REDIS_DEFAULT_TTL_SECONDS:
        "600",
    });

    assertEqual(
      config.redis.url,
      "redis://localhost:6379",
      "Redis URL is incorrect",
    );

    assertEqual(
      config.redis.keyPrefix,
      "modelnow:production",
      "Redis key prefix is incorrect",
    );

    assertEqual(
      config.redis.defaultTtlSeconds,
      600,
      "Redis TTL is incorrect",
    );
  },
);

await test(
  "loads analytics configuration",
  () => {
    const config = loadConfig({
      ANALYTICS_RETENTION_DAYS: "180",
      ANALYTICS_MAX_EVENTS_PER_BATCH: "1000",
      ANALYTICS_FLUSH_INTERVAL_MS: "2000",
    });

    assertEqual(
      config.analytics.retentionDays,
      180,
      "Analytics retention is incorrect",
    );

    assertEqual(
      config.analytics.maxEventsPerBatch,
      1000,
      "Analytics batch size is incorrect",
    );

    assertEqual(
      config.analytics.flushIntervalMs,
      2000,
      "Analytics flush interval is incorrect",
    );
  },
);

await test(
  "loads anomaly detection configuration",
  () => {
    const config = loadConfig({
      ANOMALY_BASELINE_WINDOW_SIZE: "200",
      ANOMALY_MINIMUM_SAMPLE_SIZE: "30",
      ANOMALY_DEDUPLICATION_WINDOW_MS:
        "600000",
      ANOMALY_MAX_OBSERVATIONS_PER_SERIES:
        "20000",
    });

    assertEqual(
      config.anomalyDetection.baselineWindowSize,
      200,
      "Baseline window is incorrect",
    );

    assertEqual(
      config.anomalyDetection.minimumSampleSize,
      30,
      "Minimum sample size is incorrect",
    );

    assertEqual(
      config.anomalyDetection.deduplicationWindowMs,
      600000,
      "Deduplication window is incorrect",
    );

    assertEqual(
      config.anomalyDetection.maxObservationsPerSeries,
      20000,
      "Observation limit is incorrect",
    );
  },
);

await test(
  "rejects invalid environment",
  () => {
    assertThrows(
      () =>
        loadConfig({
          NODE_ENV: "invalid",
        }),
      "Invalid NODE_ENV should throw",
    );
  },
);

await test(
  "rejects invalid port",
  () => {
    assertThrows(
      () =>
        loadConfig({
          PORT: "70000",
        }),
      "Invalid port should throw",
    );
  },
);

await test(
  "rejects invalid integer",
  () => {
    assertThrows(
      () =>
        loadConfig({
          PORT: "abc",
        }),
      "Non-numeric port should throw",
    );
  },
);

await test(
  "rejects invalid boolean",
  () => {
    assertThrows(
      () =>
        loadConfig({
          CACHE_ENABLED: "maybe",
        }),
      "Invalid boolean should throw",
    );
  },
);

await test(
  "rejects invalid database pool configuration",
  () => {
    assertThrows(
      () =>
        loadConfig({
          DB_POOL_MIN: "20",
          DB_POOL_MAX: "10",
        }),
      "poolMin greater than poolMax should throw",
    );
  },
);

await test(
  "rejects invalid anomaly configuration",
  () => {
    assertThrows(
      () =>
        loadConfig({
          ANOMALY_BASELINE_WINDOW_SIZE: "10",
          ANOMALY_MINIMUM_SAMPLE_SIZE: "20",
        }),
      "Minimum sample size greater than baseline should throw",
    );
  },
);

await test(
  "validates cache size",
  () => {
    const config = loadConfig({
      CACHE_MAX_VALUE_SIZE_BYTES: "2048",
    });

    assertEqual(
      config.cache.maxValueSizeBytes,
      2048,
      "Cache maximum size is incorrect",
    );
  },
);

await test(
  "loads logging configuration",
  () => {
    const config = loadConfig({
      LOG_LEVEL: "debug",
      LOG_PRETTY: "false",
    });

    assertEqual(
      config.log.level,
      "debug",
      "Log level is incorrect",
    );

    assertEqual(
      config.log.pretty,
      false,
      "Log pretty setting is incorrect",
    );
  },
);

await test(
  "creates safe configuration",
  () => {
    const config = loadConfig({
      DATABASE_URL:
        "postgresql://user:secret@localhost/db",
      REDIS_URL:
        "redis://:secret@localhost:6379",
    });

    const safe = toSafeConfig(config);

    const database =
      safe.database as Record<string, unknown>;

    const redis =
      safe.redis as Record<string, unknown>;

    assert(
      !("url" in database),
      "Safe database config must not expose URL",
    );

    assert(
      !("url" in redis),
      "Safe Redis config must not expose URL",
    );
  },
);

await test(
  "supports test environment",
  () => {
    const config = loadConfig({
      NODE_ENV: "test",
    });

    assertEqual(
      config.environment,
      "test",
      "Test environment should be supported",
    );
  },
);

console.log("");
console.log(
  `Config test suite completed successfully.`,
);
console.log(
  `Passed: ${passed}, Failed: ${failed}`,
);