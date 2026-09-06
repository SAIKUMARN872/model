"use client";

/**
 * Enterprise Environment Configuration
 *
 * Responsibilities:
 * - Centralize environment variables
 * - Detect current runtime environment
 * - Provide API configuration
 * - Provide authentication configuration
 * - Provide feature flags
 * - Provide application metadata
 * - Prevent direct environment variable access
 *   throughout the application
 *
 * Supported environments:
 * - development
 * - test
 * - staging
 * - production
 */

/**
 * Safely read an environment variable.
 */
const getEnv = (
  key,
  fallback = ""
) => {
  if (
    typeof process ===
    "undefined"
  ) {
    return fallback;
  }

  return (
    process.env?.[key] ??
    fallback
  );
};

/**
 * Convert environment string
 * to boolean.
 *
 * Supported:
 * true
 * 1
 * yes
 * on
 */
const getBooleanEnv = (
  key,
  fallback = false
) => {
  const value =
    getEnv(key, "");

  if (!value) {
    return fallback;
  }

  return [
    "true",
    "1",
    "yes",
    "on",
  ].includes(
    String(value)
      .trim()
      .toLowerCase()
  );
};

/**
 * Convert environment string
 * to number.
 */
const getNumberEnv = (
  key,
  fallback
) => {
  const value =
    Number(
      getEnv(key, "")
    );

  return Number.isFinite(
    value
  )
    ? value
    : fallback;
};

/**
 * Normalize API URL.
 *
 * Removes trailing slash so
 * endpoints can safely be appended.
 */
const normalizeUrl = (
  url
) => {
  if (!url) {
    return "";
  }

  return String(url).replace(
    /\/+$/,
    ""
  );
};

/**
 * Determine application environment.
 */
const nodeEnvironment =
  getEnv(
    "NODE_ENV",
    "development"
  );

const appEnvironment =
  getEnv(
    "NEXT_PUBLIC_APP_ENV",
    nodeEnvironment
  );

/**
 * Determine production status.
 */
const isProduction =
  appEnvironment ===
    "production" ||
  nodeEnvironment ===
    "production";

/**
 * Determine development status.
 */
const isDevelopment =
  appEnvironment ===
    "development";

/**
 * Determine staging status.
 */
const isStaging =
  appEnvironment ===
  "staging";

/**
 * API Configuration
 */
const apiBaseUrl = normalizeUrl(
  getEnv(
    "NEXT_PUBLIC_API_URL",
    "http://localhost:4000/api"
  )
);

/**
 * Application Configuration
 */
const appName = getEnv(
  "NEXT_PUBLIC_APP_NAME",
  "Enterprise AI Console"
);

const appVersion = getEnv(
  "NEXT_PUBLIC_APP_VERSION",
  "1.0.0"
);

const appUrl = normalizeUrl(
  getEnv(
    "NEXT_PUBLIC_APP_URL",
    "http://localhost:3000"
  )
);

/**
 * Authentication Configuration
 */
const authConfig = {
  loginPath: getEnv(
    "NEXT_PUBLIC_AUTH_LOGIN_PATH",
    "/auth/login"
  ),

  logoutPath: getEnv(
    "NEXT_PUBLIC_AUTH_LOGOUT_PATH",
    "/auth/logout"
  ),

  refreshPath: getEnv(
    "NEXT_PUBLIC_AUTH_REFRESH_PATH",
    "/auth/refresh"
  ),

  currentUserPath: getEnv(
    "NEXT_PUBLIC_AUTH_ME_PATH",
    "/auth/me"
  ),

  sessionPath: getEnv(
    "NEXT_PUBLIC_AUTH_SESSION_PATH",
    "/auth/session"
  ),

  tokenRefreshEnabled:
    getBooleanEnv(
      "NEXT_PUBLIC_TOKEN_REFRESH_ENABLED",
      true
    ),
};

/**
 * HTTP Configuration
 */
const httpConfig = {
  timeout: getNumberEnv(
    "NEXT_PUBLIC_API_TIMEOUT",
    30000
  ),

  retryAttempts:
    getNumberEnv(
      "NEXT_PUBLIC_API_RETRY_ATTEMPTS",
      2
    ),

  retryDelay:
    getNumberEnv(
      "NEXT_PUBLIC_API_RETRY_DELAY",
      1000
    ),

  credentials: getEnv(
    "NEXT_PUBLIC_API_CREDENTIALS",
    "include"
  ),
};

/**
 * Feature Flags
 *
 * These flags allow enterprise
 * features to be enabled or disabled
 * without changing application logic.
 */
const features = {
  analytics:
    getBooleanEnv(
      "NEXT_PUBLIC_FEATURE_ANALYTICS",
      true
    ),

  billing:
    getBooleanEnv(
      "NEXT_PUBLIC_FEATURE_BILLING",
      true
    ),

  playground:
    getBooleanEnv(
      "NEXT_PUBLIC_FEATURE_PLAYGROUND",
      true
    ),

  agents:
    getBooleanEnv(
      "NEXT_PUBLIC_FEATURE_AGENTS",
      true
    ),

  governance:
    getBooleanEnv(
      "NEXT_PUBLIC_FEATURE_GOVERNANCE",
      true
    ),

  security:
    getBooleanEnv(
      "NEXT_PUBLIC_FEATURE_SECURITY",
      true
    ),

  apiKeys:
    getBooleanEnv(
      "NEXT_PUBLIC_FEATURE_API_KEYS",
      true
    ),

  auditLogs:
    getBooleanEnv(
      "NEXT_PUBLIC_FEATURE_AUDIT_LOGS",
      true
    ),
};

/**
 * Observability Configuration
 */
const observability = {
  enabled:
    getBooleanEnv(
      "NEXT_PUBLIC_OBSERVABILITY_ENABLED",
      true
    ),

  sentryDsn: getEnv(
    "NEXT_PUBLIC_SENTRY_DSN",
    ""
  ),

  environment:
    getEnv(
      "NEXT_PUBLIC_SENTRY_ENVIRONMENT",
      appEnvironment
    ),
};

/**
 * Security Configuration
 */
const security = {
  secureCookies:
    getBooleanEnv(
      "NEXT_PUBLIC_SECURE_COOKIES",
      isProduction
    ),

  csrfProtection:
    getBooleanEnv(
      "NEXT_PUBLIC_CSRF_PROTECTION",
      isProduction
    ),

  strictTransportSecurity:
    getBooleanEnv(
      "NEXT_PUBLIC_HSTS_ENABLED",
      isProduction
    ),
};

/**
 * Complete application environment.
 */
const environment = {
  /**
   * Application metadata.
   */
  app: {
    name: appName,

    version: appVersion,

    url: appUrl,

    environment:
      appEnvironment,

    nodeEnvironment,

    isProduction,

    isDevelopment,

    isStaging,
  },

  /**
   * API configuration.
   */
  api: {
    baseUrl:
      apiBaseUrl,

    ...httpConfig,
  },

  /**
   * Authentication configuration.
   */
  auth: authConfig,

  /**
   * Feature flags.
   */
  features,

  /**
   * Observability.
   */
  observability,

  /**
   * Security.
   */
  security,
};

/**
 * Validate required configuration.
 *
 * In production, the API URL must be
 * explicitly configured.
 */
export const validateEnvironment =
  () => {
    const errors = [];

    if (
      isProduction &&
      !apiBaseUrl
    ) {
      errors.push(
        "API base URL is required in production."
      );
    }

    if (
      !appUrl
    ) {
      errors.push(
        "Application URL is not configured."
      );
    }

    if (
      httpConfig.timeout <= 0
    ) {
      errors.push(
        "API timeout must be greater than zero."
      );
    }

    if (
      httpConfig.retryAttempts <
      0
    ) {
      errors.push(
        "API retry attempts cannot be negative."
      );
    }

    if (
      errors.length > 0
    ) {
      throw new Error(
        `Environment configuration is invalid:\n${errors.join(
          "\n"
        )}`
      );
    }

    return true;
  };

/**
 * Helper to check whether
 * a feature is enabled.
 */
export const isFeatureEnabled =
  (
    featureName
  ) => {
    return Boolean(
      environment.features?.[
        featureName
      ]
    );
  };

/**
 * Export individual configuration
 * values for convenient imports.
 */
export {
  apiBaseUrl,
  appEnvironment,
  nodeEnvironment,
  isProduction,
  isDevelopment,
  isStaging,
  authConfig,
  httpConfig,
  features,
  observability,
  security,
};

/**
 * Default configuration export.
 */
export default environment;