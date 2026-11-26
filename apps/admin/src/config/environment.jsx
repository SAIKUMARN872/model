/**
 * Enterprise Environment Configuration
 *
 * Centralized runtime environment configuration.
 *
 * Responsibilities:
 * - Manage API URLs
 * - Identify application environment
 * - Configure request timeouts
 * - Configure feature behavior
 * - Prevent hardcoded environment values
 *
 * Supported environments:
 * - development
 * - staging
 * - production
 */

/* =========================================================
   Environment Detection
========================================================= */

const NODE_ENV =
  import.meta?.env?.MODE ||
  process.env.NODE_ENV ||
  "development";

/* =========================================================
   Environment Helpers
========================================================= */

const isDevelopment =
  NODE_ENV === "development";

const isProduction =
  NODE_ENV === "production";

const isTest =
  NODE_ENV === "test";

const isStaging =
  NODE_ENV === "staging";

/* =========================================================
   Environment Variables
========================================================= */

const env =
  import.meta?.env || {};

/* =========================================================
   API Configuration
========================================================= */

const API_BASE_URL =
  env.VITE_API_BASE_URL ||
  process.env.REACT_APP_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000/api";

/* =========================================================
   Application Configuration
========================================================= */

const APP_NAME =
  env.VITE_APP_NAME ||
  "Enterprise Admin Console";

const APP_VERSION =
  env.VITE_APP_VERSION ||
  "1.0.0";

const APP_URL =
  env.VITE_APP_URL ||
  "http://localhost:3000";

/* =========================================================
   Authentication Configuration
========================================================= */

const AUTH_TOKEN_KEY =
  env.VITE_AUTH_TOKEN_KEY ||
  "enterprise_admin_access_token";

const REFRESH_TOKEN_KEY =
  env.VITE_REFRESH_TOKEN_KEY ||
  "enterprise_admin_refresh_token";

/* =========================================================
   Request Configuration
========================================================= */

const API_TIMEOUT =
  Number(
    env.VITE_API_TIMEOUT ||
      30000
  );

/* =========================================================
   Feature Configuration
========================================================= */

const ENABLE_ANALYTICS =
  env.VITE_ENABLE_ANALYTICS !==
  "false";

const ENABLE_AUDIT_LOGS =
  env.VITE_ENABLE_AUDIT_LOGS !==
  "false";

const ENABLE_BILLING =
  env.VITE_ENABLE_BILLING !==
  "false";

const ENABLE_SECURITY =
  env.VITE_ENABLE_SECURITY !==
  "false";

/* =========================================================
   Logging Configuration
========================================================= */

const ENABLE_DEBUG_LOGGING =
  isDevelopment ||
  env.VITE_ENABLE_DEBUG_LOGGING ===
    "true";

/* =========================================================
   Complete Configuration
========================================================= */

const environment = Object.freeze({
  app: {
    name: APP_NAME,

    version:
      APP_VERSION,

    url:
      APP_URL,
  },

  env: {
    name:
      NODE_ENV,

    isDevelopment,

    isProduction,

    isStaging,

    isTest,
  },

  api: {
    baseURL:
      API_BASE_URL,

    timeout:
      API_TIMEOUT,
  },

  auth: {
    accessTokenKey:
      AUTH_TOKEN_KEY,

    refreshTokenKey:
      REFRESH_TOKEN_KEY,
  },

  features: {
    analytics:
      ENABLE_ANALYTICS,

    auditLogs:
      ENABLE_AUDIT_LOGS,

    billing:
      ENABLE_BILLING,

    security:
      ENABLE_SECURITY,
  },

  logging: {
    debug:
      ENABLE_DEBUG_LOGGING,
  },
});

/* =========================================================
   Development Diagnostics
========================================================= */

if (
  isDevelopment &&
  ENABLE_DEBUG_LOGGING
) {
  console.info(
    "[Environment] Loaded configuration:",
    {
      environment:
        environment.env.name,

      apiBaseURL:
        environment.api.baseURL,

      app:
        environment.app.name,
    }
  );
}

/* =========================================================
   Exports
========================================================= */

export {
  NODE_ENV,

  API_BASE_URL,

  API_TIMEOUT,

  APP_NAME,

  APP_VERSION,

  APP_URL,

  AUTH_TOKEN_KEY,

  REFRESH_TOKEN_KEY,

  isDevelopment,

  isProduction,

  isStaging,

  isTest,
};

export default environment;