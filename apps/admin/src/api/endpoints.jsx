 /**
  * Enterprise API Endpoint Registry
  *
  * Responsibilities:
  * - Centralize backend API routes
  * - Prevent hard-coded URLs across services
  * - Provide consistent route generation
  * - Support dynamic resource IDs
  * - Keep frontend and backend contracts organized
  *
  * Architecture:
  *
  * Components
  *     ↓
  * Hooks
  *     ↓
  * Services
  *     ↓
  * API Endpoints
  *     ↓
  * API Client
  *     ↓
  * Backend
  */

/* =========================================================
   API Version
========================================================= */

const API_VERSION = "/v1";

/* =========================================================
   Base API Routes
========================================================= */

const API_ENDPOINTS = {
  /* =======================================================
     Authentication
  ======================================================= */

  AUTH: {
    LOGIN: `${API_VERSION}/auth/login`,

    LOGOUT: `${API_VERSION}/auth/logout`,

    REFRESH:
      `${API_VERSION}/auth/refresh`,

    ME:
      `${API_VERSION}/auth/me`,

    VERIFY:
      `${API_VERSION}/auth/verify`,

    CHANGE_PASSWORD:
      `${API_VERSION}/auth/change-password`,

    FORGOT_PASSWORD:
      `${API_VERSION}/auth/forgot-password`,

    RESET_PASSWORD:
      `${API_VERSION}/auth/reset-password`,
  },

  /* =======================================================
     Admin
  ======================================================= */

  ADMIN: {
    DASHBOARD:
      `${API_VERSION}/admin/dashboard`,

    HEALTH:
      `${API_VERSION}/admin/health`,

    CONFIG:
      `${API_VERSION}/admin/config`,
  },

  /* =======================================================
     Agents
  ======================================================= */

  AGENTS: {
    LIST:
      `${API_VERSION}/agents`,

    CREATE:
      `${API_VERSION}/agents`,

    GET: (agentId) =>
      `${API_VERSION}/agents/${agentId}`,

    UPDATE: (agentId) =>
      `${API_VERSION}/agents/${agentId}`,

    DELETE: (agentId) =>
      `${API_VERSION}/agents/${agentId}`,

    START: (agentId) =>
      `${API_VERSION}/agents/${agentId}/start`,

    STOP: (agentId) =>
      `${API_VERSION}/agents/${agentId}/stop`,

    PAUSE: (agentId) =>
      `${API_VERSION}/agents/${agentId}/pause`,

    RESUME: (agentId) =>
      `${API_VERSION}/agents/${agentId}/resume`,

    HEALTH: (agentId) =>
      `${API_VERSION}/agents/${agentId}/health`,

    LOGS: (agentId) =>
      `${API_VERSION}/agents/${agentId}/logs`,

    EXECUTIONS: (agentId) =>
      `${API_VERSION}/agents/${agentId}/executions`,
  },

  /* =======================================================
     Analytics
  ======================================================= */

  ANALYTICS: {
    OVERVIEW:
      `${API_VERSION}/analytics/overview`,

    DASHBOARD:
      `${API_VERSION}/analytics/dashboard`,

    SUMMARY:
      `${API_VERSION}/analytics/summary`,

    PERFORMANCE:
      `${API_VERSION}/analytics/performance`,

    USAGE:
      `${API_VERSION}/analytics/usage`,

    COST:
      `${API_VERSION}/analytics/cost`,

    TRENDS:
      `${API_VERSION}/analytics/trends`,

    INSIGHTS:
      `${API_VERSION}/analytics/insights`,

    AGENTS:
      `${API_VERSION}/analytics/agents`,

    AGENT: (agentId) =>
      `${API_VERSION}/analytics/agents/${agentId}`,
  },

  /* =======================================================
     Analytics Engine
  ======================================================= */

  ANALYTICS_ENGINE: {
    RUN:
      `${API_VERSION}/analytics-engine/run`,

    STATUS:
      `${API_VERSION}/analytics-engine/status`,

    METRICS:
      `${API_VERSION}/analytics-engine/metrics`,

    HEALTH:
      `${API_VERSION}/analytics-engine/health`,

    INSIGHTS:
      `${API_VERSION}/analytics-engine/insights`,
  },

  /* =======================================================
     API Keys
  ======================================================= */

  API_KEYS: {
    LIST:
      `${API_VERSION}/api-keys`,

    CREATE:
      `${API_VERSION}/api-keys`,

    GET: (keyId) =>
      `${API_VERSION}/api-keys/${keyId}`,

    UPDATE: (keyId) =>
      `${API_VERSION}/api-keys/${keyId}`,

    DELETE: (keyId) =>
      `${API_VERSION}/api-keys/${keyId}`,

    ROTATE: (keyId) =>
      `${API_VERSION}/api-keys/${keyId}/rotate`,

    REVOKE: (keyId) =>
      `${API_VERSION}/api-keys/${keyId}/revoke`,
  },

  /* =======================================================
     Users
  ======================================================= */

  USERS: {
    LIST:
      `${API_VERSION}/users`,

    CREATE:
      `${API_VERSION}/users`,

    GET: (userId) =>
      `${API_VERSION}/users/${userId}`,

    UPDATE: (userId) =>
      `${API_VERSION}/users/${userId}`,

    DELETE: (userId) =>
      `${API_VERSION}/users/${userId}`,

    ACTIVATE: (userId) =>
      `${API_VERSION}/users/${userId}/activate`,

    DEACTIVATE: (userId) =>
      `${API_VERSION}/users/${userId}/deactivate`,

    ROLES: (userId) =>
      `${API_VERSION}/users/${userId}/roles`,

    PERMISSIONS: (userId) =>
      `${API_VERSION}/users/${userId}/permissions`,
  },

  /* =======================================================
     Organizations
  ======================================================= */

  ORGANIZATIONS: {
    LIST:
      `${API_VERSION}/organizations`,

    CREATE:
      `${API_VERSION}/organizations`,

    GET: (organizationId) =>
      `${API_VERSION}/organizations/${organizationId}`,

    UPDATE: (organizationId) =>
      `${API_VERSION}/organizations/${organizationId}`,

    DELETE: (organizationId) =>
      `${API_VERSION}/organizations/${organizationId}`,

    MEMBERS: (organizationId) =>
      `${API_VERSION}/organizations/${organizationId}/members`,

    SETTINGS: (organizationId) =>
      `${API_VERSION}/organizations/${organizationId}/settings`,

    USAGE: (organizationId) =>
      `${API_VERSION}/organizations/${organizationId}/usage`,
  },

  /* =======================================================
     Workspaces
  ======================================================= */

  WORKSPACES: {
    LIST:
      `${API_VERSION}/workspaces`,

    CREATE:
      `${API_VERSION}/workspaces`,

    GET: (workspaceId) =>
      `${API_VERSION}/workspaces/${workspaceId}`,

    UPDATE: (workspaceId) =>
      `${API_VERSION}/workspaces/${workspaceId}`,

    DELETE: (workspaceId) =>
      `${API_VERSION}/workspaces/${workspaceId}`,

    MEMBERS: (workspaceId) =>
      `${API_VERSION}/workspaces/${workspaceId}/members`,
  },

  /* =======================================================
     Teams
  ======================================================= */

  TEAMS: {
    LIST:
      `${API_VERSION}/teams`,

    CREATE:
      `${API_VERSION}/teams`,

    GET: (teamId) =>
      `${API_VERSION}/teams/${teamId}`,

    UPDATE: (teamId) =>
      `${API_VERSION}/teams/${teamId}`,

    DELETE: (teamId) =>
      `${API_VERSION}/teams/${teamId}`,

    MEMBERS: (teamId) =>
      `${API_VERSION}/teams/${teamId}/members`,
  },

  /* =======================================================
     Roles
  ======================================================= */

  ROLES: {
    LIST:
      `${API_VERSION}/roles`,

    CREATE:
      `${API_VERSION}/roles`,

    GET: (roleId) =>
      `${API_VERSION}/roles/${roleId}`,

    UPDATE: (roleId) =>
      `${API_VERSION}/roles/${roleId}`,

    DELETE: (roleId) =>
      `${API_VERSION}/roles/${roleId}`,

    PERMISSIONS: (roleId) =>
      `${API_VERSION}/roles/${roleId}/permissions`,
  },

  /* =======================================================
     Permissions
  ======================================================= */

  PERMISSIONS: {
    LIST:
      `${API_VERSION}/permissions`,

    CHECK:
      `${API_VERSION}/permissions/check`,

    USER: (userId) =>
      `${API_VERSION}/users/${userId}/permissions`,

    ROLE: (roleId) =>
      `${API_VERSION}/roles/${roleId}/permissions`,
  },

  /* =======================================================
     Policies
  ======================================================= */

  POLICIES: {
    LIST:
      `${API_VERSION}/policies`,

    CREATE:
      `${API_VERSION}/policies`,

    GET: (policyId) =>
      `${API_VERSION}/policies/${policyId}`,

    UPDATE: (policyId) =>
      `${API_VERSION}/policies/${policyId}`,

    DELETE: (policyId) =>
      `${API_VERSION}/policies/${policyId}`,

    EVALUATE:
      `${API_VERSION}/policies/evaluate`,
  },

  /* =======================================================
     Audit Logs
  ======================================================= */

  AUDIT: {
    LOGS:
      `${API_VERSION}/audit/logs`,

    LOG: (logId) =>
      `${API_VERSION}/audit/logs/${logId}`,

    EXPORT:
      `${API_VERSION}/audit/logs/export`,

    EVENTS:
      `${API_VERSION}/audit/events`,
  },

  /* =======================================================
     Billing
  ======================================================= */

  BILLING: {
    OVERVIEW:
      `${API_VERSION}/billing/overview`,

    PLANS:
      `${API_VERSION}/billing/plans`,

    SUBSCRIPTION:
      `${API_VERSION}/billing/subscription`,

    INVOICES:
      `${API_VERSION}/billing/invoices`,

    INVOICE: (invoiceId) =>
      `${API_VERSION}/billing/invoices/${invoiceId}`,

    PAYMENT_METHODS:
      `${API_VERSION}/billing/payment-methods`,

    USAGE:
      `${API_VERSION}/billing/usage`,
  },

  /* =======================================================
     Usage
  ======================================================= */

  USAGE: {
    OVERVIEW:
      `${API_VERSION}/usage/overview`,

    DAILY:
      `${API_VERSION}/usage/daily`,

    MONTHLY:
      `${API_VERSION}/usage/monthly`,

    AGENTS:
      `${API_VERSION}/usage/agents`,

    USERS:
      `${API_VERSION}/usage/users`,
  },

  /* =======================================================
     Security
  ======================================================= */

  SECURITY: {
    OVERVIEW:
      `${API_VERSION}/security/overview`,

    EVENTS:
      `${API_VERSION}/security/events`,

    THREATS:
      `${API_VERSION}/security/threats`,

    INCIDENTS:
      `${API_VERSION}/security/incidents`,

    SESSIONS:
      `${API_VERSION}/security/sessions`,

    DEVICES:
      `${API_VERSION}/security/devices`,
  },

  /* =======================================================
     Compliance
  ======================================================= */

  COMPLIANCE: {
    OVERVIEW:
      `${API_VERSION}/compliance/overview`,

    FRAMEWORKS:
      `${API_VERSION}/compliance/frameworks`,

    CONTROLS:
      `${API_VERSION}/compliance/controls`,

    REPORTS:
      `${API_VERSION}/compliance/reports`,

    EXPORT:
      `${API_VERSION}/compliance/export`,
  },

  /* =======================================================
     Governance
  ======================================================= */

  GOVERNANCE: {
    OVERVIEW:
      `${API_VERSION}/governance/overview`,

    POLICIES:
      `${API_VERSION}/governance/policies`,

    MODELS:
      `${API_VERSION}/governance/models`,

    RISK:
      `${API_VERSION}/governance/risk`,

    CONTROLS:
      `${API_VERSION}/governance/controls`,
  },

  /* =======================================================
     Models
  ======================================================= */

  MODELS: {
    LIST:
      `${API_VERSION}/models`,

    CREATE:
      `${API_VERSION}/models`,

    GET: (modelId) =>
      `${API_VERSION}/models/${modelId}`,

    UPDATE: (modelId) =>
      `${API_VERSION}/models/${modelId}`,

    DELETE: (modelId) =>
      `${API_VERSION}/models/${modelId}`,

    HEALTH: (modelId) =>
      `${API_VERSION}/models/${modelId}/health`,

    USAGE: (modelId) =>
      `${API_VERSION}/models/${modelId}/usage`,
  },

  /* =======================================================
     Notifications
  ======================================================= */

  NOTIFICATIONS: {
    LIST:
      `${API_VERSION}/notifications`,

    UNREAD:
      `${API_VERSION}/notifications/unread`,

    MARK_READ: (notificationId) =>
      `${API_VERSION}/notifications/${notificationId}/read`,

    MARK_ALL_READ:
      `${API_VERSION}/notifications/read-all`,

    DELETE: (notificationId) =>
      `${API_VERSION}/notifications/${notificationId}`,
  },

  /* =======================================================
     Integrations
  ======================================================= */

  INTEGRATIONS: {
    LIST:
      `${API_VERSION}/integrations`,

    CREATE:
      `${API_VERSION}/integrations`,

    GET: (integrationId) =>
      `${API_VERSION}/integrations/${integrationId}`,

    UPDATE: (integrationId) =>
      `${API_VERSION}/integrations/${integrationId}`,

    DELETE: (integrationId) =>
      `${API_VERSION}/integrations/${integrationId}`,

    TEST: (integrationId) =>
      `${API_VERSION}/integrations/${integrationId}/test`,
  },

  /* =======================================================
     Knowledge
  ======================================================= */

  KNOWLEDGE: {
    LIST:
      `${API_VERSION}/knowledge`,

    CREATE:
      `${API_VERSION}/knowledge`,

    GET: (knowledgeId) =>
      `${API_VERSION}/knowledge/${knowledgeId}`,

    UPDATE: (knowledgeId) =>
      `${API_VERSION}/knowledge/${knowledgeId}`,

    DELETE: (knowledgeId) =>
      `${API_VERSION}/knowledge/${knowledgeId}`,

    SEARCH:
      `${API_VERSION}/knowledge/search`,
  },

  /* =======================================================
     Reports
  ======================================================= */

  REPORTS: {
    LIST:
      `${API_VERSION}/reports`,

    CREATE:
      `${API_VERSION}/reports`,

    GET: (reportId) =>
      `${API_VERSION}/reports/${reportId}`,

    DELETE: (reportId) =>
      `${API_VERSION}/reports/${reportId}`,

    EXPORT: (reportId) =>
      `${API_VERSION}/reports/${reportId}/export`,
  },

  /* =======================================================
     System Health
  ======================================================= */

  SYSTEM: {
    HEALTH:
      `${API_VERSION}/system/health`,

    READINESS:
      `${API_VERSION}/system/readiness`,

    LIVENESS:
      `${API_VERSION}/system/liveness`,

    VERSION:
      `${API_VERSION}/system/version`,
  },
};

/* =========================================================
   Endpoint Utility Functions
========================================================= */

const buildQueryString = (
  params = {}
) => {
  const searchParams =
    new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        if (
          Array.isArray(value)
        ) {
          value.forEach(
            (item) => {
              searchParams.append(
                key,
                String(item)
              );
            }
          );
        } else {
          searchParams.set(
            key,
            String(value)
          );
        }
      }
    }
  );

  const query =
    searchParams.toString();

  return query
    ? `?${query}`
    : "";
};

/* =========================================================
   Dynamic Endpoint Builder
========================================================= */

const buildEndpoint = (
  endpoint,
  params = {}
) => {
  return `${endpoint}${buildQueryString(
    params
  )}`;
};

/* =========================================================
   Public Exports
========================================================= */

export {
  API_VERSION,

  API_ENDPOINTS,

  buildEndpoint,

  buildQueryString,
};

export default API_ENDPOINTS;