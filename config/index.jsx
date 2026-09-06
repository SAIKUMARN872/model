import environment from "./environment";
import features from "./features";

/**
 * Application Configuration
 *
 * Centralized configuration layer for the Admin application.
 *
 * Responsibilities:
 * - Environment configuration
 * - API configuration
 * - Feature flags
 * - Security configuration
 * - Runtime behavior
 * - Observability
 *
 * This module should be imported instead of directly
 * accessing environment variables throughout the application.
 */

const isDevelopment =
  environment.NODE_ENV === "development";

const isProduction =
  environment.NODE_ENV === "production";

const isTest =
  environment.NODE_ENV === "test";

const config = Object.freeze({
  /**
   * Application
   */
  app: Object.freeze({
    name:
      environment.APP_NAME ||
      "Enterprise Admin Console",

    version:
      environment.APP_VERSION ||
      "1.0.0",

    environment:
      environment.NODE_ENV ||
      "development",

    isDevelopment,
    isProduction,
    isTest,
  }),

  /**
   * API Configuration
   */
  api: Object.freeze({
    baseUrl:
      environment.API_BASE_URL ||
      "/api",

    timeout:
      Number(
        environment.API_TIMEOUT
      ) || 30000,

    retryAttempts:
      Number(
        environment.API_RETRY_ATTEMPTS
      ) || 3,

    retryDelay:
      Number(
        environment.API_RETRY_DELAY
      ) || 1000,

    version:
      environment.API_VERSION ||
      "v1",
  }),

  /**
   * Authentication
   */
  auth: Object.freeze({
    tokenStorageKey:
      environment.AUTH_TOKEN_KEY ||
      "admin_access_token",

    refreshTokenStorageKey:
      environment.AUTH_REFRESH_TOKEN_KEY ||
      "admin_refresh_token",

    sessionStorageKey:
      environment.AUTH_SESSION_KEY ||
      "admin_session",

    sessionTimeout:
      Number(
        environment.AUTH_SESSION_TIMEOUT
      ) || 30 * 60 * 1000,

    refreshBeforeExpiry:
      Number(
        environment.AUTH_REFRESH_BEFORE_EXPIRY
      ) || 5 * 60 * 1000,

    enableRefresh:
      environment.AUTH_ENABLE_REFRESH !==
      "false",

    enableRememberMe:
      environment.AUTH_ENABLE_REMEMBER_ME !==
      "false",
  }),

  /**
   * Feature Flags
   */
  features: Object.freeze({
    ...features,
  }),

  /**
   * Security
   */
  security: Object.freeze({
    enableCSP:
      environment.SECURITY_ENABLE_CSP !==
      "false",

    enableCSRF:
      environment.SECURITY_ENABLE_CSRF !==
      "false",

    enableStrictMode:
      environment.SECURITY_STRICT_MODE !==
      "false",

    enableSecureCookies:
      isProduction,

    allowedOrigins:
      environment.SECURITY_ALLOWED_ORIGINS
        ? environment.SECURITY_ALLOWED_ORIGINS.split(
            ","
          ).map((origin) =>
            origin.trim()
          )
        : [],
  }),

  /**
   * Monitoring and Observability
   */
  monitoring: Object.freeze({
    enabled:
      environment.MONITORING_ENABLED !==
      "false",

    errorTracking:
      environment.ERROR_TRACKING_ENABLED !==
      "false",

    performanceTracking:
      environment.PERFORMANCE_TRACKING_ENABLED !==
      "false",

    healthChecks:
      environment.HEALTH_CHECKS_ENABLED !==
      "false",

    sampleRate:
      Number(
        environment.MONITORING_SAMPLE_RATE
      ) || 1,
  }),

  /**
   * Analytics
   */
  analytics: Object.freeze({
    enabled:
      environment.ANALYTICS_ENABLED !==
      "false",

    provider:
      environment.ANALYTICS_PROVIDER ||
      "internal",

    trackingId:
      environment.ANALYTICS_TRACKING_ID ||
      null,

    anonymizeIp:
      environment.ANALYTICS_ANONYMIZE_IP !==
      "false",
  }),

  /**
   * Logging
   */
  logging: Object.freeze({
    level:
      environment.LOG_LEVEL ||
      (isDevelopment
        ? "debug"
        : "info"),

    enableConsole:
      isDevelopment,

    enableRemote:
      isProduction &&
      environment.REMOTE_LOGGING_ENABLED !==
        "false",

    serviceName:
      environment.LOG_SERVICE_NAME ||
      "admin-console",
  }),

  /**
   * Pagination
   */
  pagination: Object.freeze({
    defaultPageSize:
      Number(
        environment.DEFAULT_PAGE_SIZE
      ) || 25,

    maxPageSize:
      Number(
        environment.MAX_PAGE_SIZE
      ) || 100,

    defaultPage:
      1,
  }),

  /**
   * Upload Configuration
   */
  uploads: Object.freeze({
    maxFileSize:
      Number(
        environment.MAX_FILE_SIZE
      ) ||
      10 * 1024 * 1024,

    allowedFileTypes:
      environment.ALLOWED_FILE_TYPES
        ? environment.ALLOWED_FILE_TYPES.split(
            ","
          ).map((type) =>
            type.trim()
          )
        : [
            "image/jpeg",
            "image/png",
            "application/pdf",
          ],
  }),

  /**
   * AI Configuration
   */
  ai: Object.freeze({
    enabled:
      environment.AI_ENABLED !==
      "false",

    defaultModel:
      environment.AI_DEFAULT_MODEL ||
      "default",

    maxTokens:
      Number(
        environment.AI_MAX_TOKENS
      ) || 4096,

    temperature:
      Number(
        environment.AI_TEMPERATURE
      ) || 0.2,

    streamingEnabled:
      environment.AI_STREAMING_ENABLED !==
      "false",

    semanticSearchEnabled:
      environment.AI_SEMANTIC_SEARCH_ENABLED !==
      "false",
  }),

  /**
   * UI Configuration
   */
  ui: Object.freeze({
    defaultTheme:
      environment.DEFAULT_THEME ||
      "system",

    defaultLanguage:
      environment.DEFAULT_LANGUAGE ||
      "en",

    enableDarkMode:
      environment.ENABLE_DARK_MODE !==
      "false",

    enableAnimations:
      environment.ENABLE_ANIMATIONS !==
      "false",
  }),

  /**
   * URLs
   */
  urls: Object.freeze({
    application:
      environment.APP_URL ||
      "http://localhost:3000",

    documentation:
      environment.DOCUMENTATION_URL ||
      "/docs",

    support:
      environment.SUPPORT_URL ||
      "/support",

    privacy:
      environment.PRIVACY_URL ||
      "/privacy",

    terms:
      environment.TERMS_URL ||
      "/terms",
  }),
});

/**
 * Get configuration value using a dot path.
 *
 * Example:
 *
 * getConfig("api.baseUrl")
 *
 * @param {string} path
 * @param {*} fallback
 * @returns {*}
 */
export const getConfig = (
  path,
  fallback = undefined
) => {
  if (
    typeof path !==
    "string"
  ) {
    return fallback;
  }

  const value =
    path
      .split(".")
      .reduce(
        (current, key) =>
          current?.[key],
        config
      );

  return value === undefined
    ? fallback
    : value;
};

/**
 * Check whether a feature is enabled.
 *
 * Example:
 *
 * isFeatureEnabled("analytics")
 *
 * @param {string} featureName
 * @returns {boolean}
 */
export const isFeatureEnabled = (
  featureName
) => {
  if (
    typeof featureName !==
    "string"
  ) {
    return false;
  }

  return Boolean(
    features[featureName]
  );
};

/**
 * Check current application environment.
 *
 * @param {"development"|"production"|"test"} targetEnvironment
 * @returns {boolean}
 */
export const isEnvironment = (
  targetEnvironment
) => {
  return (
    config.app.environment ===
    targetEnvironment
  );
};

/**
 * Return a safe configuration
 * object for debugging.
 *
 * Sensitive values are intentionally
 * excluded from the output.
 */
export const getPublicConfig =
  () => ({
    app: config.app,
    api: {
      baseUrl:
        config.api.baseUrl,
      version:
        config.api.version,
    },
    features:
      config.features,
    monitoring: {
      enabled:
        config.monitoring.enabled,
    },
    analytics: {
      enabled:
        config.analytics.enabled,
      provider:
        config.analytics.provider,
    },
    ai: {
      enabled:
        config.ai.enabled,
      defaultModel:
        config.ai.defaultModel,
      streamingEnabled:
        config.ai.streamingEnabled,
    },
    ui: config.ui,
  });

export {
  environment,
  features,
};

export default config;