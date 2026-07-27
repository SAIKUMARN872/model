/**
 * Enterprise Application Constants
 *
 * Centralized constants used across the Admin Console.
 *
 * Responsibilities:
 * - Application-wide immutable values
 * - API configuration constants
 * - Pagination defaults
 * - Storage keys
 * - UI configuration
 * - Audit and security constants
 * - Feature and module identifiers
 *
 * Note:
 * Domain-specific constants should remain in their
 * dedicated files, for example:
 *
 * constants/permissions.jsx
 * constants/roles.jsx
 * constants/routes.jsx
 */

/* =========================================================
   Application
========================================================= */

export const APP_CONSTANTS =
  Object.freeze({
    NAME:
      "Enterprise Admin Console",

    VERSION:
      "1.0.0",

    DEFAULT_LANGUAGE:
      "en",

    DEFAULT_TIMEZONE:
      "UTC",
  });

/* =========================================================
   API
========================================================= */

export const API_CONSTANTS =
  Object.freeze({
    DEFAULT_TIMEOUT:
      30000,

    RETRY_COUNT:
      3,

    RETRY_DELAY:
      1000,

    MAX_REQUEST_SIZE:
      10 * 1024 * 1024,

    CONTENT_TYPE:
      "application/json",
  });

/* =========================================================
   Pagination
========================================================= */

export const PAGINATION =
  Object.freeze({
    DEFAULT_PAGE:
      1,

    DEFAULT_PAGE_SIZE:
      25,

    PAGE_SIZE_OPTIONS:
      Object.freeze([
        10,
        25,
        50,
        100,
      ]),

    MAX_PAGE_SIZE:
      100,
  });

/* =========================================================
   Authentication
========================================================= */

export const AUTH_CONSTANTS =
  Object.freeze({
    ACCESS_TOKEN_KEY:
      "enterprise_admin_access_token",

    REFRESH_TOKEN_KEY:
      "enterprise_admin_refresh_token",

    SESSION_KEY:
      "enterprise_admin_session",

    USER_KEY:
      "enterprise_admin_user",

    SESSION_TIMEOUT:
      30 * 60 * 1000,

    REFRESH_THRESHOLD:
      5 * 60 * 1000,
  });

/* =========================================================
   Storage
========================================================= */

export const STORAGE_KEYS =
  Object.freeze({
    ACCESS_TOKEN:
      "enterprise_admin_access_token",

    REFRESH_TOKEN:
      "enterprise_admin_refresh_token",

    USER:
      "enterprise_admin_user",

    THEME:
      "enterprise_admin_theme",

    LANGUAGE:
      "enterprise_admin_language",

    SIDEBAR_STATE:
      "enterprise_admin_sidebar_state",

    ORGANIZATION:
      "enterprise_admin_organization",

    WORKSPACE:
      "enterprise_admin_workspace",
  });

/* =========================================================
   UI
========================================================= */

export const UI_CONSTANTS =
  Object.freeze({
    SIDEBAR_WIDTH:
      260,

    SIDEBAR_COLLAPSED_WIDTH:
      72,

    HEADER_HEIGHT:
      64,

    MODAL_Z_INDEX:
      1000,

    DROPDOWN_Z_INDEX:
      1100,

    TOAST_Z_INDEX:
      1200,

    MAX_CONTENT_WIDTH:
      1600,
  });

/* =========================================================
   Status
========================================================= */

export const STATUS =
  Object.freeze({
    ACTIVE:
      "active",

    INACTIVE:
      "inactive",

    ENABLED:
      "enabled",

    DISABLED:
      "disabled",

    PENDING:
      "pending",

    PROCESSING:
      "processing",

    SUCCESS:
      "success",

    FAILED:
      "failed",

    ERROR:
      "error",

    CANCELED:
      "canceled",
  });

/* =========================================================
   Request States
========================================================= */

export const REQUEST_STATUS =
  Object.freeze({
    IDLE:
      "idle",

    LOADING:
      "loading",

    SUCCESS:
      "success",

    ERROR:
      "error",
  });

/* =========================================================
   Audit
========================================================= */

export const AUDIT_CONSTANTS =
  Object.freeze({
    ACTIONS:
      Object.freeze([
        "create",
        "update",
        "delete",
        "login",
        "logout",
        "access",
        "export",
        "revoke",
      ]),

    SEVERITIES:
      Object.freeze([
        "info",
        "warning",
        "critical",
      ]),

    DEFAULT_PAGE_SIZE:
      25,

    MAX_EXPORT_ROWS:
      10000,
  });

/* =========================================================
   Compliance
========================================================= */

export const COMPLIANCE_CONSTANTS =
  Object.freeze({
    CONTROL_STATUSES:
      Object.freeze([
        "compliant",
        "non_compliant",
        "in_review",
        "not_applicable",
      ]),

    RISK_LEVELS:
      Object.freeze([
        "low",
        "medium",
        "high",
        "critical",
      ]),

    DEFAULT_COMPLIANCE_SCORE:
      0,
  });

/* =========================================================
   Billing
========================================================= */

export const BILLING_CONSTANTS =
  Object.freeze({
    BILLING_INTERVALS:
      Object.freeze([
        "month",
        "year",
      ]),

    SUBSCRIPTION_STATUSES:
      Object.freeze([
        "active",
        "trialing",
        "past_due",
        "canceled",
        "inactive",
      ]),

    INVOICE_STATUSES:
      Object.freeze([
        "paid",
        "open",
        "pending",
        "failed",
        "void",
      ]),

    DEFAULT_CURRENCY:
      "USD",
  });

/* =========================================================
   Security
========================================================= */

export const SECURITY_CONSTANTS =
  Object.freeze({
    PASSWORD_MIN_LENGTH:
      12,

    PASSWORD_MAX_LENGTH:
      128,

    MAX_LOGIN_ATTEMPTS:
      5,

    LOCKOUT_DURATION:
      15 * 60 * 1000,

    SESSION_IDLE_TIMEOUT:
      30 * 60 * 1000,

    MFA_CODE_LENGTH:
      6,
  });

/* =========================================================
   File Upload
========================================================= */

export const FILE_CONSTANTS =
  Object.freeze({
    MAX_FILE_SIZE:
      10 * 1024 * 1024,

    MAX_AVATAR_SIZE:
      5 * 1024 * 1024,

    ALLOWED_IMAGE_TYPES:
      Object.freeze([
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/svg+xml",
      ]),

    ALLOWED_DOCUMENT_TYPES:
      Object.freeze([
        "application/pdf",
        "text/csv",
        "application/json",
      ]),
  });

/* =========================================================
   Notification
========================================================= */

export const NOTIFICATION_CONSTANTS =
  Object.freeze({
    DEFAULT_DURATION:
      5000,

    MAX_VISIBLE:
      5,

    TYPES:
      Object.freeze([
        "success",
        "info",
        "warning",
        "error",
      ]),
  });

/* =========================================================
   Module Names
========================================================= */

export const MODULES =
  Object.freeze({
    DASHBOARD:
      "dashboard",

    AGENTS:
      "agents",

    ANALYTICS:
      "analytics",

    ANALYTICS_ENGINE:
      "analytics_engine",

    API_KEYS:
      "api_keys",

    AUDIT:
      "audit",

    AUDIT_LOGS:
      "audit_logs",

    BILLING:
      "billing",

    COMPLIANCE:
      "compliance",

    COST_ENGINE:
      "cost_engine",

    GOVERNANCE:
      "governance",

    INTEGRATIONS:
      "integrations",

    KNOWLEDGE:
      "knowledge",

    MONITORING:
      "monitoring",

    NOTIFICATIONS:
      "notifications",

    OBSERVABILITY:
      "observability",

    ORGANIZATIONS:
      "organizations",

    PERMISSIONS:
      "permissions",

    PROMPTS:
      "prompts",

    REPORTS:
      "reports",

    SECURITY:
      "security",

    SETTINGS:
      "settings",

    TEAMS:
      "teams",

    USAGE:
      "usage",

    USERS:
      "users",

    WORKSPACES:
      "workspaces",
  });

/* =========================================================
   HTTP Status Codes
========================================================= */

export const HTTP_STATUS =
  Object.freeze({
    OK:
      200,

    CREATED:
      201,

    NO_CONTENT:
      204,

    BAD_REQUEST:
      400,

    UNAUTHORIZED:
      401,

    FORBIDDEN:
      403,

    NOT_FOUND:
      404,

    CONFLICT:
      409,

    UNPROCESSABLE_ENTITY:
      422,

    TOO_MANY_REQUESTS:
      429,

    INTERNAL_SERVER_ERROR:
      500,

    SERVICE_UNAVAILABLE:
      503,
  });

/* =========================================================
   Export Formats
========================================================= */

export const EXPORT_FORMATS =
  Object.freeze({
    CSV:
      "csv",

    JSON:
      "json",

    PDF:
      "pdf",

    XLSX:
      "xlsx",
  });

/* =========================================================
   Date Formats
========================================================= */

export const DATE_FORMATS =
  Object.freeze({
    DATE:
      "yyyy-MM-dd",

    DATETIME:
      "yyyy-MM-dd HH:mm:ss",

    DISPLAY_DATE:
      "MMM dd, yyyy",

    DISPLAY_DATETIME:
      "MMM dd, yyyy HH:mm",
  });

/* =========================================================
   Default Export
========================================================= */

const constants =
  Object.freeze({
    APP_CONSTANTS,

    API_CONSTANTS,

    PAGINATION,

    AUTH_CONSTANTS,

    STORAGE_KEYS,

    UI_CONSTANTS,

    STATUS,

    REQUEST_STATUS,

    AUDIT_CONSTANTS,

    COMPLIANCE_CONSTANTS,

    BILLING_CONSTANTS,

    SECURITY_CONSTANTS,

    FILE_CONSTANTS,

    NOTIFICATION_CONSTANTS,

    MODULES,

    HTTP_STATUS,

    EXPORT_FORMATS,

    DATE_FORMATS,
  });

export default constants;