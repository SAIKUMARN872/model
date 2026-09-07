"use strict";

/**
 * =========================================================
 * Application Constants
 * =========================================================
 */

/**
 * Application name.
 */
export const APP_NAME = "AI Console";

/**
 * Application version.
 */
export const APP_VERSION = "1.0.0";

/**
 * Default API timeout.
 */
export const API_TIMEOUT = 30000;

/**
 * Default pagination values.
 */
export const DEFAULT_PAGE = 1;

export const DEFAULT_PAGE_SIZE = 20;

export const PAGE_SIZE_OPTIONS = [
  10,
  20,
  50,
  100,
];

/**
 * =========================================================
 * Environments
 * =========================================================
 */

export const ENVIRONMENT = Object.freeze({
  DEVELOPMENT: "development",
  TEST: "test",
  STAGING: "staging",
  PRODUCTION: "production",
});

/**
 * Environment labels.
 */
export const ENVIRONMENT_LABELS =
  Object.freeze({
    development: "Development",
    test: "Test",
    staging: "Staging",
    production: "Production",
  });

/**
 * =========================================================
 * Application Status
 * =========================================================
 */

export const STATUS = Object.freeze({
  ACTIVE: "active",
  INACTIVE: "inactive",
  ENABLED: "enabled",
  DISABLED: "disabled",
  PENDING: "pending",
  SUCCESS: "success",
  FAILED: "failed",
  ERROR: "error",
  DRAFT: "draft",
  ARCHIVED: "archived",
});

/**
 * =========================================================
 * User Roles
 * =========================================================
 */

export const USER_ROLES = Object.freeze({
  OWNER: "owner",
  ADMIN: "admin",
  MEMBER: "member",
  VIEWER: "viewer",
  DEVELOPER: "developer",
});

/**
 * =========================================================
 * Permissions
 * =========================================================
 */

export const PERMISSIONS =
  Object.freeze({
    VIEW_DASHBOARD:
      "dashboard:view",

    VIEW_MODELS:
      "models:view",

    MANAGE_MODELS:
      "models:manage",

    VIEW_PLAYGROUND:
      "playground:view",

    USE_PLAYGROUND:
      "playground:use",

    VIEW_PROMPTS:
      "prompts:view",

    MANAGE_PROMPTS:
      "prompts:manage",

    VIEW_USAGE:
      "usage:view",

    VIEW_ANALYTICS:
      "analytics:view",

    VIEW_COST:
      "cost:view",

    VIEW_LATENCY:
      "latency:view",

    VIEW_LOGS:
      "logs:view",

    VIEW_API_KEYS:
      "api_keys:view",

    MANAGE_API_KEYS:
      "api_keys:manage",

    VIEW_BILLING:
      "billing:view",

    MANAGE_BILLING:
      "billing:manage",

    VIEW_GOVERNANCE:
      "governance:view",

    MANAGE_GOVERNANCE:
      "governance:manage",

    VIEW_SECURITY:
      "security:view",

    MANAGE_SECURITY:
      "security:manage",

    VIEW_INTEGRATIONS:
      "integrations:view",

    MANAGE_INTEGRATIONS:
      "integrations:manage",

    MANAGE_SETTINGS:
      "settings:manage",
  });

/**
 * =========================================================
 * Log Levels
 * =========================================================
 */

export const LOG_LEVELS =
  Object.freeze({
    DEBUG: "debug",
    INFO: "info",
    WARN: "warn",
    ERROR: "error",
    FATAL: "fatal",
  });

export const LOG_LEVEL_LABELS =
  Object.freeze({
    debug: "Debug",
    info: "Info",
    warn: "Warning",
    error: "Error",
    fatal: "Fatal",
  });

/**
 * =========================================================
 * Log Level Options
 * =========================================================
 */

export const LOG_LEVEL_OPTIONS = [
  {
    value: "debug",
    label: "Debug",
  },
  {
    value: "info",
    label: "Info",
  },
  {
    value: "warn",
    label: "Warning",
  },
  {
    value: "error",
    label: "Error",
  },
  {
    value: "fatal",
    label: "Fatal",
  },
];

/**
 * =========================================================
 * Billing Plans
 * =========================================================
 */

export const BILLING_PLANS =
  Object.freeze({
    FREE: "free",
    STARTER: "starter",
    PROFESSIONAL:
      "professional",
    ENTERPRISE: "enterprise",
  });

export const BILLING_PLAN_LABELS =
  Object.freeze({
    free: "Free",
    starter: "Starter",
    professional:
      "Professional",
    enterprise: "Enterprise",
  });

/**
 * =========================================================
 * Billing Status
 * =========================================================
 */

export const BILLING_STATUS =
  Object.freeze({
    ACTIVE: "active",
    TRIALING: "trialing",
    PAST_DUE: "past_due",
    CANCELED: "canceled",
    INCOMPLETE: "incomplete",
  });

/**
 * =========================================================
 * API Key Status
 * =========================================================
 */

export const API_KEY_STATUS =
  Object.freeze({
    ACTIVE: "active",
    REVOKED: "revoked",
    EXPIRED: "expired",
    DISABLED: "disabled",
  });

/**
 * =========================================================
 * Model Status
 * =========================================================
 */

export const MODEL_STATUS =
  Object.freeze({
    ACTIVE: "active",
    INACTIVE: "inactive",
    AVAILABLE: "available",
    UNAVAILABLE: "unavailable",
    DEPRECATED: "deprecated",
  });

/**
 * =========================================================
 * Model Providers
 * =========================================================
 */

export const MODEL_PROVIDERS =
  Object.freeze({
    OPENAI: "openai",
    ANTHROPIC: "anthropic",
    GOOGLE: "google",
    AZURE: "azure",
    AWS: "aws",
    MISTRAL: "mistral",
    COHERE: "cohere",
    CUSTOM: "custom",
  });

/**
 * =========================================================
 * Model Capabilities
 * =========================================================
 */

export const MODEL_CAPABILITIES =
  Object.freeze({
    CHAT: "chat",
    COMPLETION: "completion",
    EMBEDDING: "embedding",
    VISION: "vision",
    FUNCTION_CALLING:
      "function_calling",
    TOOL_USE: "tool_use",
    STREAMING: "streaming",
  });

/**
 * =========================================================
 * Playground Roles
 * =========================================================
 */

export const MESSAGE_ROLES =
  Object.freeze({
    SYSTEM: "system",
    USER: "user",
    ASSISTANT: "assistant",
    TOOL: "tool",
  });

/**
 * =========================================================
 * Usage Intervals
 * =========================================================
 */

export const USAGE_INTERVALS =
  Object.freeze({
    HOUR: "hour",
    DAY: "day",
    WEEK: "week",
    MONTH: "month",
  });

export const USAGE_INTERVAL_OPTIONS = [
  {
    value: "hour",
    label: "Hourly",
  },
  {
    value: "day",
    label: "Daily",
  },
  {
    value: "week",
    label: "Weekly",
  },
  {
    value: "month",
    label: "Monthly",
  },
];

/**
 * =========================================================
 * Date Range Options
 * =========================================================
 */

export const DATE_RANGES =
  Object.freeze({
    TODAY: "today",
    YESTERDAY: "yesterday",
    LAST_7_DAYS:
      "last_7_days",
    LAST_30_DAYS:
      "last_30_days",
    LAST_90_DAYS:
      "last_90_days",
    THIS_MONTH:
      "this_month",
    LAST_MONTH:
      "last_month",
    CUSTOM: "custom",
  });

/**
 * =========================================================
 * Cost Metrics
 * =========================================================
 */

export const COST_METRICS =
  Object.freeze({
    TOTAL: "total",
    INPUT: "input",
    OUTPUT: "output",
    AVERAGE: "average",
  });

/**
 * =========================================================
 * Currency
 * =========================================================
 */

export const CURRENCIES =
  Object.freeze({
    USD: "USD",
    EUR: "EUR",
    GBP: "GBP",
    INR: "INR",
  });

export const DEFAULT_CURRENCY =
  "USD";

/**
 * =========================================================
 * Latency Percentiles
 * =========================================================
 */

export const LATENCY_PERCENTILES =
  Object.freeze({
    P50: "p50",
    P75: "p75",
    P90: "p90",
    P95: "p95",
    P99: "p99",
  });

/**
 * =========================================================
 * Governance
 * =========================================================
 */

export const POLICY_STATUS =
  Object.freeze({
    ACTIVE: "active",
    INACTIVE: "inactive",
    DRAFT: "draft",
    ARCHIVED: "archived",
  });

export const APPROVAL_STATUS =
  Object.freeze({
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
    CANCELED: "canceled",
  });

/**
 * =========================================================
 * Security
 * =========================================================
 */

export const SECURITY_SEVERITY =
  Object.freeze({
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
    CRITICAL: "critical",
  });

export const SECURITY_EVENT_STATUS =
  Object.freeze({
    OPEN: "open",
    INVESTIGATING:
      "investigating",
    RESOLVED: "resolved",
    DISMISSED: "dismissed",
  });

/**
 * =========================================================
 * Navigation Routes
 * =========================================================
 */

export const ROUTES =
  Object.freeze({
    LOGIN: "/login",

    DASHBOARD: "/dashboard",

    MODELS: "/models",

    PLAYGROUND: "/playground",

    PROMPTS: "/prompts",

    USAGE: "/usage",

    ANALYTICS: "/analytics",

    COST: "/cost",

    LATENCY: "/latency",

    LOGS: "/logs",

    API_KEYS: "/api-keys",

    BILLING: "/billing",

    GOVERNANCE:
      "/governance",

    SECURITY:
      "/security",

    INTEGRATIONS:
      "/integrations",

    SETTINGS: "/settings",
  });

/**
 * =========================================================
 * API Endpoints
 * =========================================================
 */

export const API_ENDPOINTS =
  Object.freeze({
    AUTH: "/api/auth",

    USERS: "/api/users",

    MODELS: "/api/models",

    AGENTS: "/api/agents",

    PROMPTS: "/api/prompts",

    USAGE: "/api/usage",

    ANALYTICS:
      "/api/analytics",

    COST: "/api/cost",

    LATENCY:
      "/api/latency",

    LOGS: "/api/logs",

    API_KEYS:
      "/api/api-keys",

    BILLING:
      "/api/billing",

    GOVERNANCE:
      "/api/governance",

    SECURITY:
      "/api/security",

    INTEGRATIONS:
      "/api/integrations",

    PLAYGROUND:
      "/api/playground",

    CONSOLE:
      "/api/console",
  });

/**
 * =========================================================
 * HTTP Methods
 * =========================================================
 */

export const HTTP_METHODS =
  Object.freeze({
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    PATCH: "PATCH",
    DELETE: "DELETE",
  });

/**
 * =========================================================
 * HTTP Status Codes
 * =========================================================
 */

export const HTTP_STATUS =
  Object.freeze({
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,

    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    VALIDATION_ERROR: 422,
    RATE_LIMITED: 429,

    SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
  });

/**
 * =========================================================
 * Storage Keys
 * =========================================================
 */

export const STORAGE_KEYS =
  Object.freeze({
    ACCESS_TOKEN:
      "console_access_token",

    REFRESH_TOKEN:
      "console_refresh_token",

    USER:
      "console_user",

    ORGANIZATION:
      "console_organization",

    THEME:
      "console_theme",

    LANGUAGE:
      "console_language",

    SIDEBAR_STATE:
      "console_sidebar_state",
  });

/**
 * =========================================================
 * Theme
 * =========================================================
 */

export const THEMES =
  Object.freeze({
    LIGHT: "light",
    DARK: "dark",
    SYSTEM: "system",
  });

/**
 * =========================================================
 * Languages
 * =========================================================
 */

export const LANGUAGES =
  Object.freeze({
    ENGLISH: "en",
  });

export const DEFAULT_LANGUAGE =
  "en";

/**
 * =========================================================
 * Toast Types
 * =========================================================
 */

export const TOAST_TYPES =
  Object.freeze({
    SUCCESS: "success",
    ERROR: "error",
    WARNING: "warning",
    INFO: "info",
  });

/**
 * =========================================================
 * Export Formats
 * =========================================================
 */

export const EXPORT_FORMATS =
  Object.freeze({
    CSV: "csv",
    JSON: "json",
    XLSX: "xlsx",
    PDF: "pdf",
  });

/**
 * =========================================================
 * Sort Directions
 * =========================================================
 */

export const SORT_DIRECTIONS =
  Object.freeze({
    ASC: "asc",
    DESC: "desc",
  });

/**
 * =========================================================
 * Default Configuration
 * =========================================================
 */

export const DEFAULT_CONFIG =
  Object.freeze({
    apiTimeout:
      API_TIMEOUT,

    page:
      DEFAULT_PAGE,

    pageSize:
      DEFAULT_PAGE_SIZE,

    environment:
      ENVIRONMENT.DEVELOPMENT,

    theme:
      THEMES.SYSTEM,

    language:
      DEFAULT_LANGUAGE,

    currency:
      DEFAULT_CURRENCY,
  });

/**
 * =========================================================
 * Default Export
 * =========================================================
 */

export default {
  APP_NAME,
  APP_VERSION,
  API_TIMEOUT,

  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,

  ENVIRONMENT,
  ENVIRONMENT_LABELS,

  STATUS,

  USER_ROLES,

  PERMISSIONS,

  LOG_LEVELS,
  LOG_LEVEL_LABELS,
  LOG_LEVEL_OPTIONS,

  BILLING_PLANS,
  BILLING_PLAN_LABELS,
  BILLING_STATUS,

  API_KEY_STATUS,

  MODEL_STATUS,
  MODEL_PROVIDERS,
  MODEL_CAPABILITIES,

  MESSAGE_ROLES,

  USAGE_INTERVALS,
  USAGE_INTERVAL_OPTIONS,

  DATE_RANGES,

  COST_METRICS,

  CURRENCIES,
  DEFAULT_CURRENCY,

  LATENCY_PERCENTILES,

  POLICY_STATUS,
  APPROVAL_STATUS,

  SECURITY_SEVERITY,
  SECURITY_EVENT_STATUS,

  ROUTES,

  API_ENDPOINTS,

  HTTP_METHODS,
  HTTP_STATUS,

  STORAGE_KEYS,

  THEMES,

  LANGUAGES,
  DEFAULT_LANGUAGE,

  TOAST_TYPES,

  EXPORT_FORMATS,

  SORT_DIRECTIONS,

  DEFAULT_CONFIG,
};