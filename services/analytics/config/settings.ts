// services/analytics/config/settings.ts

export type AppEnvironment =
  | "development"
  | "test"
  | "staging"
  | "production";

export interface DatabaseConfig {
  url: string;
  poolMin: number;
  poolMax: number;
  connectionTimeoutMs: number;
}

export interface RedisConfig {
  url: string;
  keyPrefix: string;
  defaultTtlSeconds: number;
  connectionTimeoutMs: number;
}

export interface AnalyticsConfig {
  enabled: boolean;
  retentionDays: number;
  maxEventsPerBatch: number;
  flushIntervalMs: number;
}

export interface AnomalyDetectionConfig {
  enabled: boolean;
  baselineWindowSize: number;
  minimumSampleSize: number;
  deduplicationWindowMs: number;
  maxObservationsPerSeries: number;
}

export interface CacheConfig {
  enabled: boolean;
  defaultTtlSeconds: number;
  maxValueSizeBytes: number;
  keyPrefix: string;
}

export interface AuditConfig {
  enabled: boolean;
  retentionDays: number;
  maxEvents: number;
  hashChainEnabled: boolean;
}

export interface LogConfig {
  level: "debug" | "info" | "warn" | "error";
  pretty: boolean;
}

export interface AppConfig {
  environment: AppEnvironment;
  serviceName: string;
  serviceVersion: string;
  port: number;
  host: string;

  database: DatabaseConfig;
  redis: RedisConfig;
  analytics: AnalyticsConfig;
  anomalyDetection: AnomalyDetectionConfig;
  cache: CacheConfig;
  audit: AuditConfig;
  log: LogConfig;
}

const DEFAULTS = {
  environment: "development" as AppEnvironment,
  serviceName: "modelnow-analytics",
  serviceVersion: "1.0.0",

  host: "0.0.0.0",
  port: 3000,

  database: {
    url: "memory://analytics",
    poolMin: 2,
    poolMax: 10,
    connectionTimeoutMs: 5000,
  },

  redis: {
    url: "memory://cache",
    keyPrefix: "modelnow:cache",
    defaultTtlSeconds: 300,
    connectionTimeoutMs: 3000,
  },

  analytics: {
    enabled: true,
    retentionDays: 90,
    maxEventsPerBatch: 500,
    flushIntervalMs: 5000,
  },

  anomalyDetection: {
    enabled: true,
    baselineWindowSize: 100,
    minimumSampleSize: 20,
    deduplicationWindowMs: 5 * 60 * 1000,
    maxObservationsPerSeries: 10_000,
  },

  cache: {
    enabled: true,
    defaultTtlSeconds: 300,
    maxValueSizeBytes: 5 * 1024 * 1024,
    keyPrefix: "modelnow:cache",
  },

  audit: {
    enabled: true,
    retentionDays: 365,
    maxEvents: 100_000,
    hashChainEnabled: true,
  },

  log: {
    level: "info" as const,
    pretty: true,
  },
} as const;

type EnvMap = Record<string, string | undefined>;

function getEnv(
  env: EnvMap,
  key: string,
): string | undefined {
  const value = env[key];

  if (
    value === undefined ||
    value.trim().length === 0
  ) {
    return undefined;
  }

  return value.trim();
}

function getString(
  env: EnvMap,
  key: string,
  defaultValue: string,
): string {
  return getEnv(env, key) ?? defaultValue;
}

function getInteger(
  env: EnvMap,
  key: string,
  defaultValue: number,
  minimum = 0,
): number {
  const raw = getEnv(env, key);

  if (raw === undefined) {
    return defaultValue;
  }

  const value = Number(raw);

  if (
    !Number.isInteger(value) ||
    value < minimum
  ) {
    throw new Error(
      `${key} must be an integer >= ${minimum}`,
    );
  }

  return value;
}

function getBoolean(
  env: EnvMap,
  key: string,
  defaultValue: boolean,
): boolean {
  const raw = getEnv(env, key);

  if (raw === undefined) {
    return defaultValue;
  }

  const normalized = raw.toLowerCase();

  if (
    normalized === "true" ||
    normalized === "1" ||
    normalized === "yes"
  ) {
    return true;
  }

  if (
    normalized === "false" ||
    normalized === "0" ||
    normalized === "no"
  ) {
    return false;
  }

  throw new Error(
    `${key} must be a boolean: true/false`,
  );
}

function getEnvironment(
  env: EnvMap,
): AppEnvironment {
  const value =
    getEnv(env, "NODE_ENV") ??
    DEFAULTS.environment;

  if (
    value !== "development" &&
    value !== "test" &&
    value !== "staging" &&
    value !== "production"
  ) {
    throw new Error(
      "NODE_ENV must be development, test, staging, or production",
    );
  }

  return value;
}

function getLogLevel(
  env: EnvMap,
): LogConfig["level"] {
  const value =
    getEnv(env, "LOG_LEVEL") ??
    DEFAULTS.log.level;

  if (
    value !== "debug" &&
    value !== "info" &&
    value !== "warn" &&
    value !== "error"
  ) {
    throw new Error(
      "LOG_LEVEL must be debug, info, warn, or error",
    );
  }

  return value;
}

function validateConfig(
  config: AppConfig,
): void {
  if (config.port < 1 || config.port > 65_535) {
    throw new Error(
      "PORT must be between 1 and 65535",
    );
  }

  if (config.database.poolMin > config.database.poolMax) {
    throw new Error(
      "DB_POOL_MIN cannot be greater than DB_POOL_MAX",
    );
  }

  if (
    config.anomalyDetection.minimumSampleSize >
    config.anomalyDetection.baselineWindowSize
  ) {
    throw new Error(
      "ANOMALY_MINIMUM_SAMPLE_SIZE cannot be greater than ANOMALY_BASELINE_WINDOW_SIZE",
    );
  }

  if (
    config.cache.maxValueSizeBytes <= 0
  ) {
    throw new Error(
      "CACHE_MAX_VALUE_SIZE_BYTES must be greater than 0",
    );
  }

  if (
    config.audit.retentionDays <= 0
  ) {
    throw new Error(
      "AUDIT_RETENTION_DAYS must be greater than 0",
    );
  }
}

export function loadConfig(
  env: EnvMap = (() => {
    const globalObject =
      globalThis as typeof globalThis & {
        process?: {
          env?: Record<string, string | undefined>;
        };
      };

    return globalObject.process?.env ?? {};
  })(),
): AppConfig {
  const config: AppConfig = {
    environment: getEnvironment(env),

    serviceName: getString(
      env,
      "SERVICE_NAME",
      DEFAULTS.serviceName,
    ),

    serviceVersion: getString(
      env,
      "SERVICE_VERSION",
      DEFAULTS.serviceVersion,
    ),

    host: getString(
      env,
      "HOST",
      DEFAULTS.host,
    ),

    port: getInteger(
      env,
      "PORT",
      DEFAULTS.port,
      1,
    ),

    database: {
      url: getString(
        env,
        "DATABASE_URL",
        DEFAULTS.database.url,
      ),

      poolMin: getInteger(
        env,
        "DB_POOL_MIN",
        DEFAULTS.database.poolMin,
        0,
      ),

      poolMax: getInteger(
        env,
        "DB_POOL_MAX",
        DEFAULTS.database.poolMax,
        1,
      ),

      connectionTimeoutMs: getInteger(
        env,
        "DB_CONNECTION_TIMEOUT_MS",
        DEFAULTS.database.connectionTimeoutMs,
        1,
      ),
    },

    redis: {
      url: getString(
        env,
        "REDIS_URL",
        DEFAULTS.redis.url,
      ),

      keyPrefix: getString(
        env,
        "REDIS_KEY_PREFIX",
        DEFAULTS.redis.keyPrefix,
      ),

      defaultTtlSeconds: getInteger(
        env,
        "REDIS_DEFAULT_TTL_SECONDS",
        DEFAULTS.redis.defaultTtlSeconds,
        1,
      ),

      connectionTimeoutMs: getInteger(
        env,
        "REDIS_CONNECTION_TIMEOUT_MS",
        DEFAULTS.redis.connectionTimeoutMs,
        1,
      ),
    },

    analytics: {
      enabled: getBoolean(
        env,
        "ANALYTICS_ENABLED",
        DEFAULTS.analytics.enabled,
      ),

      retentionDays: getInteger(
        env,
        "ANALYTICS_RETENTION_DAYS",
        DEFAULTS.analytics.retentionDays,
        1,
      ),

      maxEventsPerBatch: getInteger(
        env,
        "ANALYTICS_MAX_EVENTS_PER_BATCH",
        DEFAULTS.analytics.maxEventsPerBatch,
        1,
      ),

      flushIntervalMs: getInteger(
        env,
        "ANALYTICS_FLUSH_INTERVAL_MS",
        DEFAULTS.analytics.flushIntervalMs,
        1,
      ),
    },

    anomalyDetection: {
      enabled: getBoolean(
        env,
        "ANOMALY_DETECTION_ENABLED",
        DEFAULTS.anomalyDetection.enabled,
      ),

      baselineWindowSize: getInteger(
        env,
        "ANOMALY_BASELINE_WINDOW_SIZE",
        DEFAULTS.anomalyDetection.baselineWindowSize,
        1,
      ),

      minimumSampleSize: getInteger(
        env,
        "ANOMALY_MINIMUM_SAMPLE_SIZE",
        DEFAULTS.anomalyDetection.minimumSampleSize,
        1,
      ),

      deduplicationWindowMs: getInteger(
        env,
        "ANOMALY_DEDUPLICATION_WINDOW_MS",
        DEFAULTS.anomalyDetection.deduplicationWindowMs,
        1,
      ),

      maxObservationsPerSeries: getInteger(
        env,
        "ANOMALY_MAX_OBSERVATIONS_PER_SERIES",
        DEFAULTS.anomalyDetection.maxObservationsPerSeries,
        1,
      ),
    },

    cache: {
      enabled: getBoolean(
        env,
        "CACHE_ENABLED",
        DEFAULTS.cache.enabled,
      ),

      defaultTtlSeconds: getInteger(
        env,
        "CACHE_DEFAULT_TTL_SECONDS",
        DEFAULTS.cache.defaultTtlSeconds,
        1,
      ),

      maxValueSizeBytes: getInteger(
        env,
        "CACHE_MAX_VALUE_SIZE_BYTES",
        DEFAULTS.cache.maxValueSizeBytes,
        1,
      ),

      keyPrefix: getString(
        env,
        "CACHE_KEY_PREFIX",
        DEFAULTS.cache.keyPrefix,
      ),
    },

    audit: {
      enabled: getBoolean(
        env,
        "AUDIT_ENABLED",
        DEFAULTS.audit.enabled,
      ),

      retentionDays: getInteger(
        env,
        "AUDIT_RETENTION_DAYS",
        DEFAULTS.audit.retentionDays,
        1,
      ),

      maxEvents: getInteger(
        env,
        "AUDIT_MAX_EVENTS",
        DEFAULTS.audit.maxEvents,
        1,
      ),

      hashChainEnabled: getBoolean(
        env,
        "AUDIT_HASH_CHAIN_ENABLED",
        DEFAULTS.audit.hashChainEnabled,
      ),
    },

    log: {
      level: getLogLevel(env),

      pretty: getBoolean(
        env,
        "LOG_PRETTY",
        DEFAULTS.log.pretty,
      ),
    },
  };

  validateConfig(config);

  return config;
}

/**
 * Return configuration safe for logging.
 *
 * Secrets such as database/Redis URLs are not exposed.
 */
export function toSafeConfig(
  config: AppConfig,
): Record<string, unknown> {
  return {
    environment: config.environment,
    serviceName: config.serviceName,
    serviceVersion: config.serviceVersion,
    host: config.host,
    port: config.port,

    database: {
      configured: Boolean(config.database.url),
      poolMin: config.database.poolMin,
      poolMax: config.database.poolMax,
      connectionTimeoutMs:
        config.database.connectionTimeoutMs,
    },

    redis: {
      configured: Boolean(config.redis.url),
      keyPrefix: config.redis.keyPrefix,
      defaultTtlSeconds:
        config.redis.defaultTtlSeconds,
      connectionTimeoutMs:
        config.redis.connectionTimeoutMs,
    },

    analytics: config.analytics,
    anomalyDetection:
      config.anomalyDetection,
    cache: config.cache,
    audit: config.audit,
    log: config.log,
  };
}