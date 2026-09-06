"use client";

/**
 * Enterprise RBAC Permission Constants
 *
 * Responsibilities:
 * - Define application resources
 * - Define supported actions
 * - Define standardized permissions
 * - Define system roles
 * - Map roles to permissions
 * - Provide permission helper functions
 *
 * Permission format:
 *
 * resource:action
 *
 * Examples:
 * models:read
 * models:create
 * models:update
 * models:delete
 */

/**
 * Application resources.
 */
export const RESOURCES = Object.freeze({
  DASHBOARD: "dashboard",
  MODELS: "models",
  PLAYGROUND: "playground",
  PROMPTS: "prompts",
  AGENTS: "agents",
  API_KEYS: "api_keys",
  BILLING: "billing",
  USAGE: "usage",
  LOGS: "logs",
  ANALYTICS: "analytics",
  GOVERNANCE: "governance",
  SECURITY: "security",
  TEAMS: "teams",
  USERS: "users",
  ROLES: "roles",
  SETTINGS: "settings",
  INTEGRATIONS: "integrations",
});

/**
 * Supported actions.
 */
export const ACTIONS = Object.freeze({
  READ: "read",
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
  EXECUTE: "execute",
  MANAGE: "manage",
  APPROVE: "approve",
  EXPORT: "export",
});

/**
 * System roles.
 */
export const ROLES = Object.freeze({
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  DEVELOPER: "developer",
  ANALYST: "analyst",
  BILLING_ADMIN: "billing_admin",
  SECURITY_ADMIN: "security_admin",
  VIEWER: "viewer",
});

/**
 * Create a permission string.
 */
export const createPermission = (
  resource,
  action
) => {
  if (
    !resource ||
    !action
  ) {
    return "";
  }

  return `${resource}:${action}`;
};

/**
 * Centralized permission registry.
 */
export const PERMISSIONS =
  Object.freeze({
    /**
     * Dashboard
     */
    DASHBOARD_READ:
      createPermission(
        RESOURCES.DASHBOARD,
        ACTIONS.READ
      ),

    /**
     * Models
     */
    MODELS_READ:
      createPermission(
        RESOURCES.MODELS,
        ACTIONS.READ
      ),

    MODELS_CREATE:
      createPermission(
        RESOURCES.MODELS,
        ACTIONS.CREATE
      ),

    MODELS_UPDATE:
      createPermission(
        RESOURCES.MODELS,
        ACTIONS.UPDATE
      ),

    MODELS_DELETE:
      createPermission(
        RESOURCES.MODELS,
        ACTIONS.DELETE
      ),

    MODELS_MANAGE:
      createPermission(
        RESOURCES.MODELS,
        ACTIONS.MANAGE
      ),

    /**
     * Playground
     */
    PLAYGROUND_READ:
      createPermission(
        RESOURCES.PLAYGROUND,
        ACTIONS.READ
      ),

    PLAYGROUND_EXECUTE:
      createPermission(
        RESOURCES.PLAYGROUND,
        ACTIONS.EXECUTE
      ),

    /**
     * Prompts
     */
    PROMPTS_READ:
      createPermission(
        RESOURCES.PROMPTS,
        ACTIONS.READ
      ),

    PROMPTS_CREATE:
      createPermission(
        RESOURCES.PROMPTS,
        ACTIONS.CREATE
      ),

    PROMPTS_UPDATE:
      createPermission(
        RESOURCES.PROMPTS,
        ACTIONS.UPDATE
      ),

    PROMPTS_DELETE:
      createPermission(
        RESOURCES.PROMPTS,
        ACTIONS.DELETE
      ),

    /**
     * Agents
     */
    AGENTS_READ:
      createPermission(
        RESOURCES.AGENTS,
        ACTIONS.READ
      ),

    AGENTS_CREATE:
      createPermission(
        RESOURCES.AGENTS,
        ACTIONS.CREATE
      ),

    AGENTS_UPDATE:
      createPermission(
        RESOURCES.AGENTS,
        ACTIONS.UPDATE
      ),

    AGENTS_DELETE:
      createPermission(
        RESOURCES.AGENTS,
        ACTIONS.DELETE
      ),

    AGENTS_EXECUTE:
      createPermission(
        RESOURCES.AGENTS,
        ACTIONS.EXECUTE
      ),

    /**
     * API Keys
     */
    API_KEYS_READ:
      createPermission(
        RESOURCES.API_KEYS,
        ACTIONS.READ
      ),

    API_KEYS_CREATE:
      createPermission(
        RESOURCES.API_KEYS,
        ACTIONS.CREATE
      ),

    API_KEYS_DELETE:
      createPermission(
        RESOURCES.API_KEYS,
        ACTIONS.DELETE
      ),

    API_KEYS_MANAGE:
      createPermission(
        RESOURCES.API_KEYS,
        ACTIONS.MANAGE
      ),

    /**
     * Billing
     */
    BILLING_READ:
      createPermission(
        RESOURCES.BILLING,
        ACTIONS.READ
      ),

    BILLING_MANAGE:
      createPermission(
        RESOURCES.BILLING,
        ACTIONS.MANAGE
      ),

    BILLING_EXPORT:
      createPermission(
        RESOURCES.BILLING,
        ACTIONS.EXPORT
      ),

    /**
     * Usage
     */
    USAGE_READ:
      createPermission(
        RESOURCES.USAGE,
        ACTIONS.READ
      ),

    USAGE_EXPORT:
      createPermission(
        RESOURCES.USAGE,
        ACTIONS.EXPORT
      ),

    /**
     * Logs
     */
    LOGS_READ:
      createPermission(
        RESOURCES.LOGS,
        ACTIONS.READ
      ),

    LOGS_EXPORT:
      createPermission(
        RESOURCES.LOGS,
        ACTIONS.EXPORT
      ),

    /**
     * Analytics
     */
    ANALYTICS_READ:
      createPermission(
        RESOURCES.ANALYTICS,
        ACTIONS.READ
      ),

    ANALYTICS_EXPORT:
      createPermission(
        RESOURCES.ANALYTICS,
        ACTIONS.EXPORT
      ),

    /**
     * Governance
     */
    GOVERNANCE_READ:
      createPermission(
        RESOURCES.GOVERNANCE,
        ACTIONS.READ
      ),

    GOVERNANCE_MANAGE:
      createPermission(
        RESOURCES.GOVERNANCE,
        ACTIONS.MANAGE
      ),

    GOVERNANCE_APPROVE:
      createPermission(
        RESOURCES.GOVERNANCE,
        ACTIONS.APPROVE
      ),

    /**
     * Security
     */
    SECURITY_READ:
      createPermission(
        RESOURCES.SECURITY,
        ACTIONS.READ
      ),

    SECURITY_MANAGE:
      createPermission(
        RESOURCES.SECURITY,
        ACTIONS.MANAGE
      ),

    /**
     * Teams
     */
    TEAMS_READ:
      createPermission(
        RESOURCES.TEAMS,
        ACTIONS.READ
      ),

    TEAMS_CREATE:
      createPermission(
        RESOURCES.TEAMS,
        ACTIONS.CREATE
      ),

    TEAMS_UPDATE:
      createPermission(
        RESOURCES.TEAMS,
        ACTIONS.UPDATE
      ),

    TEAMS_DELETE:
      createPermission(
        RESOURCES.TEAMS,
        ACTIONS.DELETE
      ),

    /**
     * Users
     */
    USERS_READ:
      createPermission(
        RESOURCES.USERS,
        ACTIONS.READ
      ),

    USERS_CREATE:
      createPermission(
        RESOURCES.USERS,
        ACTIONS.CREATE
      ),

    USERS_UPDATE:
      createPermission(
        RESOURCES.USERS,
        ACTIONS.UPDATE
      ),

    USERS_DELETE:
      createPermission(
        RESOURCES.USERS,
        ACTIONS.DELETE
      ),

    /**
     * Roles
     */
    ROLES_READ:
      createPermission(
        RESOURCES.ROLES,
        ACTIONS.READ
      ),

    ROLES_MANAGE:
      createPermission(
        RESOURCES.ROLES,
        ACTIONS.MANAGE
      ),

    /**
     * Settings
     */
    SETTINGS_READ:
      createPermission(
        RESOURCES.SETTINGS,
        ACTIONS.READ
      ),

    SETTINGS_UPDATE:
      createPermission(
        RESOURCES.SETTINGS,
        ACTIONS.UPDATE
      ),

    /**
     * Integrations
     */
    INTEGRATIONS_READ:
      createPermission(
        RESOURCES.INTEGRATIONS,
        ACTIONS.READ
      ),

    INTEGRATIONS_CREATE:
      createPermission(
        RESOURCES.INTEGRATIONS,
        ACTIONS.CREATE
      ),

    INTEGRATIONS_UPDATE:
      createPermission(
        RESOURCES.INTEGRATIONS,
        ACTIONS.UPDATE
      ),

    INTEGRATIONS_DELETE:
      createPermission(
        RESOURCES.INTEGRATIONS,
        ACTIONS.DELETE
      ),
  });

/**
 * Super Admin
 *
 * Full system access.
 */
const SUPER_ADMIN_PERMISSIONS =
  Object.values(
    PERMISSIONS
  );

/**
 * Administrator permissions.
 */
const ADMIN_PERMISSIONS = [
  PERMISSIONS.DASHBOARD_READ,

  PERMISSIONS.MODELS_READ,
  PERMISSIONS.MODELS_CREATE,
  PERMISSIONS.MODELS_UPDATE,
  PERMISSIONS.MODELS_DELETE,
  PERMISSIONS.MODELS_MANAGE,

  PERMISSIONS.PLAYGROUND_READ,
  PERMISSIONS.PLAYGROUND_EXECUTE,

  PERMISSIONS.PROMPTS_READ,
  PERMISSIONS.PROMPTS_CREATE,
  PERMISSIONS.PROMPTS_UPDATE,
  PERMISSIONS.PROMPTS_DELETE,

  PERMISSIONS.AGENTS_READ,
  PERMISSIONS.AGENTS_CREATE,
  PERMISSIONS.AGENTS_UPDATE,
  PERMISSIONS.AGENTS_DELETE,
  PERMISSIONS.AGENTS_EXECUTE,

  PERMISSIONS.API_KEYS_READ,
  PERMISSIONS.API_KEYS_CREATE,
  PERMISSIONS.API_KEYS_DELETE,
  PERMISSIONS.API_KEYS_MANAGE,

  PERMISSIONS.BILLING_READ,

  PERMISSIONS.USAGE_READ,
  PERMISSIONS.USAGE_EXPORT,

  PERMISSIONS.LOGS_READ,
  PERMISSIONS.LOGS_EXPORT,

  PERMISSIONS.ANALYTICS_READ,
  PERMISSIONS.ANALYTICS_EXPORT,

  PERMISSIONS.GOVERNANCE_READ,
  PERMISSIONS.GOVERNANCE_MANAGE,
  PERMISSIONS.GOVERNANCE_APPROVE,

  PERMISSIONS.SECURITY_READ,

  PERMISSIONS.TEAMS_READ,
  PERMISSIONS.TEAMS_CREATE,
  PERMISSIONS.TEAMS_UPDATE,
  PERMISSIONS.TEAMS_DELETE,

  PERMISSIONS.USERS_READ,
  PERMISSIONS.USERS_CREATE,
  PERMISSIONS.USERS_UPDATE,
  PERMISSIONS.USERS_DELETE,

  PERMISSIONS.ROLES_READ,

  PERMISSIONS.SETTINGS_READ,
  PERMISSIONS.SETTINGS_UPDATE,

  PERMISSIONS.INTEGRATIONS_READ,
  PERMISSIONS.INTEGRATIONS_CREATE,
  PERMISSIONS.INTEGRATIONS_UPDATE,
  PERMISSIONS.INTEGRATIONS_DELETE,
];

/**
 * Developer permissions.
 */
const DEVELOPER_PERMISSIONS = [
  PERMISSIONS.DASHBOARD_READ,

  PERMISSIONS.MODELS_READ,

  PERMISSIONS.PLAYGROUND_READ,
  PERMISSIONS.PLAYGROUND_EXECUTE,

  PERMISSIONS.PROMPTS_READ,
  PERMISSIONS.PROMPTS_CREATE,
  PERMISSIONS.PROMPTS_UPDATE,
  PERMISSIONS.PROMPTS_DELETE,

  PERMISSIONS.AGENTS_READ,
  PERMISSIONS.AGENTS_CREATE,
  PERMISSIONS.AGENTS_UPDATE,
  PERMISSIONS.AGENTS_DELETE,
  PERMISSIONS.AGENTS_EXECUTE,

  PERMISSIONS.API_KEYS_READ,
  PERMISSIONS.API_KEYS_CREATE,
  PERMISSIONS.API_KEYS_DELETE,

  PERMISSIONS.USAGE_READ,

  PERMISSIONS.LOGS_READ,

  PERMISSIONS.ANALYTICS_READ,

  PERMISSIONS.INTEGRATIONS_READ,
  PERMISSIONS.INTEGRATIONS_CREATE,
  PERMISSIONS.INTEGRATIONS_UPDATE,
];

/**
 * Analyst permissions.
 */
const ANALYST_PERMISSIONS = [
  PERMISSIONS.DASHBOARD_READ,

  PERMISSIONS.MODELS_READ,

  PERMISSIONS.PLAYGROUND_READ,

  PERMISSIONS.PROMPTS_READ,

  PERMISSIONS.AGENTS_READ,

  PERMISSIONS.USAGE_READ,
  PERMISSIONS.USAGE_EXPORT,

  PERMISSIONS.LOGS_READ,
  PERMISSIONS.LOGS_EXPORT,

  PERMISSIONS.ANALYTICS_READ,
  PERMISSIONS.ANALYTICS_EXPORT,

  PERMISSIONS.BILLING_READ,

  PERMISSIONS.GOVERNANCE_READ,
];

/**
 * Billing administrator permissions.
 */
const BILLING_ADMIN_PERMISSIONS = [
  PERMISSIONS.DASHBOARD_READ,

  PERMISSIONS.BILLING_READ,
  PERMISSIONS.BILLING_MANAGE,
  PERMISSIONS.BILLING_EXPORT,

  PERMISSIONS.USAGE_READ,
  PERMISSIONS.USAGE_EXPORT,

  PERMISSIONS.ANALYTICS_READ,
  PERMISSIONS.ANALYTICS_EXPORT,
];

/**
 * Security administrator permissions.
 */
const SECURITY_ADMIN_PERMISSIONS = [
  PERMISSIONS.DASHBOARD_READ,

  PERMISSIONS.SECURITY_READ,
  PERMISSIONS.SECURITY_MANAGE,

  PERMISSIONS.API_KEYS_READ,
  PERMISSIONS.API_KEYS_MANAGE,

  PERMISSIONS.LOGS_READ,
  PERMISSIONS.LOGS_EXPORT,

  PERMISSIONS.GOVERNANCE_READ,
  PERMISSIONS.GOVERNANCE_MANAGE,
  PERMISSIONS.GOVERNANCE_APPROVE,

  PERMISSIONS.ANALYTICS_READ,
];

/**
 * Viewer permissions.
 */
const VIEWER_PERMISSIONS = [
  PERMISSIONS.DASHBOARD_READ,

  PERMISSIONS.MODELS_READ,

  PERMISSIONS.PLAYGROUND_READ,

  PERMISSIONS.PROMPTS_READ,

  PERMISSIONS.AGENTS_READ,

  PERMISSIONS.USAGE_READ,

  PERMISSIONS.ANALYTICS_READ,

  PERMISSIONS.GOVERNANCE_READ,

  PERMISSIONS.SECURITY_READ,
];

/**
 * Role-to-permission mapping.
 */
export const ROLE_PERMISSIONS =
  Object.freeze({
    [ROLES.SUPER_ADMIN]:
      SUPER_ADMIN_PERMISSIONS,

    [ROLES.ADMIN]:
      ADMIN_PERMISSIONS,

    [ROLES.DEVELOPER]:
      DEVELOPER_PERMISSIONS,

    [ROLES.ANALYST]:
      ANALYST_PERMISSIONS,

    [ROLES.BILLING_ADMIN]:
      BILLING_ADMIN_PERMISSIONS,

    [ROLES.SECURITY_ADMIN]:
      SECURITY_ADMIN_PERMISSIONS,

    [ROLES.VIEWER]:
      VIEWER_PERMISSIONS,
  });

/**
 * Get permissions assigned
 * to a role.
 */
export const getRolePermissions =
  (
    role
  ) => {
    if (!role) {
      return [];
    }

    return (
      ROLE_PERMISSIONS[
        role
      ] || []
    );
  };

/**
 * Check whether a role has
 * a specific permission.
 */
export const roleHasPermission =
  (
    role,
    permission
  ) => {
    if (
      !role ||
      !permission
    ) {
      return false;
    }

    return getRolePermissions(
      role
    ).includes(
      permission
    );
  };

/**
 * Check whether a user has
 * a specific permission.
 *
 * Supports users with:
 *
 * {
 *   role: "admin"
 * }
 *
 * or:
 *
 * {
 *   roles: ["admin", "developer"]
 * }
 */
export const userHasPermission =
  (
    user,
    permission
  ) => {
    if (
      !user ||
      !permission
    ) {
      return false;
    }

    /**
     * Super admin bypass.
     */
    if (
      user.role ===
        ROLES.SUPER_ADMIN ||
      user.roles?.includes(
        ROLES.SUPER_ADMIN
      )
    ) {
      return true;
    }

    /**
     * Direct permissions.
     */
    if (
      Array.isArray(
        user.permissions
      ) &&
      user.permissions.includes(
        permission
      )
    ) {
      return true;
    }

    /**
     * Single role.
     */
    if (
      user.role &&
      roleHasPermission(
        user.role,
        permission
      )
    ) {
      return true;
    }

    /**
     * Multiple roles.
     */
    if (
      Array.isArray(
        user.roles
      )
    ) {
      return user.roles.some(
        (role) =>
          roleHasPermission(
            role,
            permission
          )
      );
    }

    return false;
  };

/**
 * Check whether a user has
 * all required permissions.
 */
export const userHasAllPermissions =
  (
    user,
    permissions = []
  ) => {
    if (
      !Array.isArray(
        permissions
      )
    ) {
      return false;
    }

    return permissions.every(
      (permission) =>
        userHasPermission(
          user,
          permission
        )
    );
  };

/**
 * Check whether a user has
 * at least one permission.
 */
export const userHasAnyPermission =
  (
    user,
    permissions = []
  ) => {
    if (
      !Array.isArray(
        permissions
      )
    ) {
      return false;
    }

    return permissions.some(
      (permission) =>
        userHasPermission(
          user,
          permission
        )
    );
  };

/**
 * Check whether a user has
 * a specific role.
 */
export const userHasRole = (
  user,
  role
) => {
  if (
    !user ||
    !role
  ) {
    return false;
  }

  if (
    user.role === role
  ) {
    return true;
  }

  return (
    Array.isArray(
      user.roles
    ) &&
    user.roles.includes(
      role
    )
  );
};

/**
 * Get all permissions.
 */
export const getAllPermissions =
  () => {
    return Object.values(
      PERMISSIONS
    );
  };

/**
 * Get all roles.
 */
export const getAllRoles = () => {
  return Object.values(
    ROLES
  );
};

/**
 * Default export.
 */
export default {
  RESOURCES,
  ACTIONS,
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  createPermission,
  getRolePermissions,
  roleHasPermission,
  userHasPermission,
  userHasAllPermissions,
  userHasAnyPermission,
  userHasRole,
  getAllPermissions,
  getAllRoles,
};