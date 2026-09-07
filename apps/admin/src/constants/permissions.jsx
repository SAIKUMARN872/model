/**
 * Enterprise Permission Constants
 *
 * Centralized RBAC and permission definitions.
 *
 * Permission format:
 *
 * resource:action
 *
 * Examples:
 * - users:read
 * - users:create
 * - organizations:update
 * - audit_logs:export
 *
 * These permissions should be aligned with
 * backend authorization policies.
 */

/* =========================================================
   Permission Actions
========================================================= */

export const PERMISSION_ACTIONS =
  Object.freeze({
    READ:
      "read",

    CREATE:
      "create",

    UPDATE:
      "update",

    DELETE:
      "delete",

    MANAGE:
      "manage",

    EXPORT:
      "export",

    IMPORT:
      "import",

    APPROVE:
      "approve",

    REVOKE:
      "revoke",

    INVITE:
      "invite",

    ASSIGN:
      "assign",

    EXECUTE:
      "execute",

    VIEW:
      "view",
  });

/* =========================================================
   Resources
========================================================= */

export const PERMISSION_RESOURCES =
  Object.freeze({
    DASHBOARD:
      "dashboard",

    USERS:
      "users",

    ORGANIZATIONS:
      "organizations",

    WORKSPACES:
      "workspaces",

    TEAMS:
      "teams",

    ROLES:
      "roles",

    PERMISSIONS:
      "permissions",

    AGENTS:
      "agents",

    MODELS:
      "models",

    PROMPTS:
      "prompts",

    KNOWLEDGE:
      "knowledge",

    INTEGRATIONS:
      "integrations",

    ANALYTICS:
      "analytics",

    REPORTS:
      "reports",

    MONITORING:
      "monitoring",

    OBSERVABILITY:
      "observability",

    AUDIT:
      "audit",

    AUDIT_LOGS:
      "audit_logs",

    COMPLIANCE:
      "compliance",

    GOVERNANCE:
      "governance",

    SECURITY:
      "security",

    BILLING:
      "billing",

    USAGE:
      "usage",

    COST:
      "cost",

    API_KEYS:
      "api_keys",

    NOTIFICATIONS:
      "notifications",

    SETTINGS:
      "settings",
  });

/* =========================================================
   Permission Definitions
========================================================= */

export const PERMISSIONS =
  Object.freeze({
    /* -------------------------------------------------------
       Dashboard
    ------------------------------------------------------- */

    DASHBOARD_VIEW:
      "dashboard:view",

    DASHBOARD_READ:
      "dashboard:read",

    /* -------------------------------------------------------
       Users
    ------------------------------------------------------- */

    USERS_READ:
      "users:read",

    USERS_CREATE:
      "users:create",

    USERS_UPDATE:
      "users:update",

    USERS_DELETE:
      "users:delete",

    USERS_MANAGE:
      "users:manage",

    USERS_INVITE:
      "users:invite",

    USERS_EXPORT:
      "users:export",

    USERS_ASSIGN:
      "users:assign",

    /* -------------------------------------------------------
       Organizations
    ------------------------------------------------------- */

    ORGANIZATIONS_READ:
      "organizations:read",

    ORGANIZATIONS_CREATE:
      "organizations:create",

    ORGANIZATIONS_UPDATE:
      "organizations:update",

    ORGANIZATIONS_DELETE:
      "organizations:delete",

    ORGANIZATIONS_MANAGE:
      "organizations:manage",

    ORGANIZATIONS_EXPORT:
      "organizations:export",

    /* -------------------------------------------------------
       Workspaces
    ------------------------------------------------------- */

    WORKSPACES_READ:
      "workspaces:read",

    WORKSPACES_CREATE:
      "workspaces:create",

    WORKSPACES_UPDATE:
      "workspaces:update",

    WORKSPACES_DELETE:
      "workspaces:delete",

    WORKSPACES_MANAGE:
      "workspaces:manage",

    /* -------------------------------------------------------
       Teams
    ------------------------------------------------------- */

    TEAMS_READ:
      "teams:read",

    TEAMS_CREATE:
      "teams:create",

    TEAMS_UPDATE:
      "teams:update",

    TEAMS_DELETE:
      "teams:delete",

    TEAMS_MANAGE:
      "teams:manage",

    TEAMS_ASSIGN:
      "teams:assign",

    /* -------------------------------------------------------
       Roles
    ------------------------------------------------------- */

    ROLES_READ:
      "roles:read",

    ROLES_CREATE:
      "roles:create",

    ROLES_UPDATE:
      "roles:update",

    ROLES_DELETE:
      "roles:delete",

    ROLES_MANAGE:
      "roles:manage",

    /* -------------------------------------------------------
       Permissions
    ------------------------------------------------------- */

    PERMISSIONS_READ:
      "permissions:read",

    PERMISSIONS_CREATE:
      "permissions:create",

    PERMISSIONS_UPDATE:
      "permissions:update",

    PERMISSIONS_DELETE:
      "permissions:delete",

    PERMISSIONS_MANAGE:
      "permissions:manage",

    /* -------------------------------------------------------
       AI Agents
    ------------------------------------------------------- */

    AGENTS_READ:
      "agents:read",

    AGENTS_CREATE:
      "agents:create",

    AGENTS_UPDATE:
      "agents:update",

    AGENTS_DELETE:
      "agents:delete",

    AGENTS_MANAGE:
      "agents:manage",

    AGENTS_EXECUTE:
      "agents:execute",

    /* -------------------------------------------------------
       Models
    ------------------------------------------------------- */

    MODELS_READ:
      "models:read",

    MODELS_CREATE:
      "models:create",

    MODELS_UPDATE:
      "models:update",

    MODELS_DELETE:
      "models:delete",

    MODELS_MANAGE:
      "models:manage",

    /* -------------------------------------------------------
       Prompts
    ------------------------------------------------------- */

    PROMPTS_READ:
      "prompts:read",

    PROMPTS_CREATE:
      "prompts:create",

    PROMPTS_UPDATE:
      "prompts:update",

    PROMPTS_DELETE:
      "prompts:delete",

    PROMPTS_MANAGE:
      "prompts:manage",

    /* -------------------------------------------------------
       Knowledge
    ------------------------------------------------------- */

    KNOWLEDGE_READ:
      "knowledge:read",

    KNOWLEDGE_CREATE:
      "knowledge:create",

    KNOWLEDGE_UPDATE:
      "knowledge:update",

    KNOWLEDGE_DELETE:
      "knowledge:delete",

    KNOWLEDGE_MANAGE:
      "knowledge:manage",

    /* -------------------------------------------------------
       Integrations
    ------------------------------------------------------- */

    INTEGRATIONS_READ:
      "integrations:read",

    INTEGRATIONS_CREATE:
      "integrations:create",

    INTEGRATIONS_UPDATE:
      "integrations:update",

    INTEGRATIONS_DELETE:
      "integrations:delete",

    INTEGRATIONS_MANAGE:
      "integrations:manage",

    /* -------------------------------------------------------
       Analytics
    ------------------------------------------------------- */

    ANALYTICS_VIEW:
      "analytics:view",

    ANALYTICS_READ:
      "analytics:read",

    ANALYTICS_EXPORT:
      "analytics:export",

    ANALYTICS_MANAGE:
      "analytics:manage",

    /* -------------------------------------------------------
       Reports
    ------------------------------------------------------- */

    REPORTS_READ:
      "reports:read",

    REPORTS_CREATE:
      "reports:create",

    REPORTS_EXPORT:
      "reports:export",

    REPORTS_DELETE:
      "reports:delete",

    /* -------------------------------------------------------
       Monitoring
    ------------------------------------------------------- */

    MONITORING_READ:
      "monitoring:read",

    MONITORING_MANAGE:
      "monitoring:manage",

    /* -------------------------------------------------------
       Observability
    ------------------------------------------------------- */

    OBSERVABILITY_READ:
      "observability:read",

    OBSERVABILITY_MANAGE:
      "observability:manage",

    /* -------------------------------------------------------
       Audit
    ------------------------------------------------------- */

    AUDIT_READ:
      "audit:read",

    AUDIT_EXPORT:
      "audit:export",

    AUDIT_MANAGE:
      "audit:manage",

    /* -------------------------------------------------------
       Audit Logs
    ------------------------------------------------------- */

    AUDIT_LOGS_READ:
      "audit_logs:read",

    AUDIT_LOGS_EXPORT:
      "audit_logs:export",

    AUDIT_LOGS_DELETE:
      "audit_logs:delete",

    AUDIT_LOGS_MANAGE:
      "audit_logs:manage",

    /* -------------------------------------------------------
       Compliance
    ------------------------------------------------------- */

    COMPLIANCE_READ:
      "compliance:read",

    COMPLIANCE_CREATE:
      "compliance:create",

    COMPLIANCE_UPDATE:
      "compliance:update",

    COMPLIANCE_DELETE:
      "compliance:delete",

    COMPLIANCE_EXPORT:
      "compliance:export",

    COMPLIANCE_MANAGE:
      "compliance:manage",

    /* -------------------------------------------------------
       Governance
    ------------------------------------------------------- */

    GOVERNANCE_READ:
      "governance:read",

    GOVERNANCE_UPDATE:
      "governance:update",

    GOVERNANCE_MANAGE:
      "governance:manage",

    /* -------------------------------------------------------
       Security
    ------------------------------------------------------- */

    SECURITY_READ:
      "security:read",

    SECURITY_UPDATE:
      "security:update",

    SECURITY_MANAGE:
      "security:manage",

    SECURITY_REVOKE:
      "security:revoke",

    /* -------------------------------------------------------
       Billing
    ------------------------------------------------------- */

    BILLING_READ:
      "billing:read",

    BILLING_CREATE:
      "billing:create",

    BILLING_UPDATE:
      "billing:update",

    BILLING_DELETE:
      "billing:delete",

    BILLING_MANAGE:
      "billing:manage",

    BILLING_EXPORT:
      "billing:export",

    /* -------------------------------------------------------
       Usage
    ------------------------------------------------------- */

    USAGE_READ:
      "usage:read",

    USAGE_EXPORT:
      "usage:export",

    USAGE_MANAGE:
      "usage:manage",

    /* -------------------------------------------------------
       Cost
    ------------------------------------------------------- */

    COST_READ:
      "cost:read",

    COST_EXPORT:
      "cost:export",

    COST_MANAGE:
      "cost:manage",

    /* -------------------------------------------------------
       API Keys
    ------------------------------------------------------- */

    API_KEYS_READ:
      "api_keys:read",

    API_KEYS_CREATE:
      "api_keys:create",

    API_KEYS_REVOKE:
      "api_keys:revoke",

    API_KEYS_MANAGE:
      "api_keys:manage",

    /* -------------------------------------------------------
       Notifications
    ------------------------------------------------------- */

    NOTIFICATIONS_READ:
      "notifications:read",

    NOTIFICATIONS_MANAGE:
      "notifications:manage",

    /* -------------------------------------------------------
       Settings
    ------------------------------------------------------- */

    SETTINGS_READ:
      "settings:read",

    SETTINGS_UPDATE:
      "settings:update",

    SETTINGS_MANAGE:
      "settings:manage",

    /* -------------------------------------------------------
       Global Administration
    ------------------------------------------------------- */

    SYSTEM_ADMIN:
      "system:admin",

    SYSTEM_MANAGE:
      "system:manage",
  });

/* =========================================================
   Permission Groups
========================================================= */

export const PERMISSION_GROUPS =
  Object.freeze({
    USERS: [
      PERMISSIONS.USERS_READ,
      PERMISSIONS.USERS_CREATE,
      PERMISSIONS.USERS_UPDATE,
      PERMISSIONS.USERS_DELETE,
      PERMISSIONS.USERS_MANAGE,
      PERMISSIONS.USERS_INVITE,
      PERMISSIONS.USERS_EXPORT,
      PERMISSIONS.USERS_ASSIGN,
    ],

    ORGANIZATIONS: [
      PERMISSIONS.ORGANIZATIONS_READ,
      PERMISSIONS.ORGANIZATIONS_CREATE,
      PERMISSIONS.ORGANIZATIONS_UPDATE,
      PERMISSIONS.ORGANIZATIONS_DELETE,
      PERMISSIONS.ORGANIZATIONS_MANAGE,
      PERMISSIONS.ORGANIZATIONS_EXPORT,
    ],

    AGENTS: [
      PERMISSIONS.AGENTS_READ,
      PERMISSIONS.AGENTS_CREATE,
      PERMISSIONS.AGENTS_UPDATE,
      PERMISSIONS.AGENTS_DELETE,
      PERMISSIONS.AGENTS_MANAGE,
      PERMISSIONS.AGENTS_EXECUTE,
    ],

    SECURITY: [
      PERMISSIONS.SECURITY_READ,
      PERMISSIONS.SECURITY_UPDATE,
      PERMISSIONS.SECURITY_MANAGE,
      PERMISSIONS.SECURITY_REVOKE,
    ],

    COMPLIANCE: [
      PERMISSIONS.COMPLIANCE_READ,
      PERMISSIONS.COMPLIANCE_CREATE,
      PERMISSIONS.COMPLIANCE_UPDATE,
      PERMISSIONS.COMPLIANCE_DELETE,
      PERMISSIONS.COMPLIANCE_EXPORT,
      PERMISSIONS.COMPLIANCE_MANAGE,
    ],

    BILLING: [
      PERMISSIONS.BILLING_READ,
      PERMISSIONS.BILLING_CREATE,
      PERMISSIONS.BILLING_UPDATE,
      PERMISSIONS.BILLING_DELETE,
      PERMISSIONS.BILLING_MANAGE,
      PERMISSIONS.BILLING_EXPORT,
    ],
  });

/* =========================================================
   Permission Helpers
========================================================= */

export const hasPermission = (
  userPermissions = [],
  requiredPermission
) => {
  if (
    !requiredPermission ||
    !Array.isArray(
      userPermissions
    )
  ) {
    return false;
  }

  if (
    userPermissions.includes(
      PERMISSIONS.SYSTEM_ADMIN
    )
  ) {
    return true;
  }

  return userPermissions.includes(
    requiredPermission
  );
};

/* =========================================================
   Multiple Permission Check
========================================================= */

export const hasAllPermissions = (
  userPermissions = [],
  requiredPermissions = []
) => {
  if (
    !Array.isArray(
      userPermissions
    ) ||
    !Array.isArray(
      requiredPermissions
    )
  ) {
    return false;
  }

  if (
    userPermissions.includes(
      PERMISSIONS.SYSTEM_ADMIN
    )
  ) {
    return true;
  }

  return requiredPermissions.every(
    (permission) =>
      userPermissions.includes(
        permission
      )
  );
};

/* =========================================================
   Any Permission Check
========================================================= */

export const hasAnyPermission = (
  userPermissions = [],
  requiredPermissions = []
) => {
  if (
    !Array.isArray(
      userPermissions
    ) ||
    !Array.isArray(
      requiredPermissions
    )
  ) {
    return false;
  }

  if (
    userPermissions.includes(
      PERMISSIONS.SYSTEM_ADMIN
    )
  ) {
    return true;
  }

  return requiredPermissions.some(
    (permission) =>
      userPermissions.includes(
        permission
      )
  );
};

/* =========================================================
   Permission Group Check
========================================================= */

export const hasPermissionGroup = (
  userPermissions = [],
  group
) => {
  const requiredPermissions =
    PERMISSION_GROUPS[
      group
    ];

  if (
    !requiredPermissions
  ) {
    return false;
  }

  return hasAnyPermission(
    userPermissions,
    requiredPermissions
  );
};

/* =========================================================
   Permission Metadata
========================================================= */

export const PERMISSION_METADATA =
  Object.freeze({
    [PERMISSIONS.USERS_READ]: {
      name: "View Users",
      resource: "users",
      action: "read",
    },

    [PERMISSIONS.USERS_CREATE]: {
      name: "Create Users",
      resource: "users",
      action: "create",
    },

    [PERMISSIONS.USERS_UPDATE]: {
      name: "Update Users",
      resource: "users",
      action: "update",
    },

    [PERMISSIONS.USERS_DELETE]: {
      name: "Delete Users",
      resource: "users",
      action: "delete",
    },

    [PERMISSIONS.AUDIT_LOGS_READ]: {
      name: "View Audit Logs",
      resource: "audit_logs",
      action: "read",
    },

    [PERMISSIONS.COMPLIANCE_READ]: {
      name: "View Compliance",
      resource: "compliance",
      action: "read",
    },

    [PERMISSIONS.SECURITY_MANAGE]: {
      name: "Manage Security",
      resource: "security",
      action: "manage",
    },

    [PERMISSIONS.BILLING_MANAGE]: {
      name: "Manage Billing",
      resource: "billing",
      action: "manage",
    },
  });

/* =========================================================
   Default Export
========================================================= */

const permissions =
  Object.freeze({
    ACTIONS:
      PERMISSION_ACTIONS,

    RESOURCES:
      PERMISSION_RESOURCES,

    PERMISSIONS,

    GROUPS:
      PERMISSION_GROUPS,

    METADATA:
      PERMISSION_METADATA,

    hasPermission,

    hasAllPermissions,

    hasAnyPermission,

    hasPermissionGroup,
  });

export default permissions;