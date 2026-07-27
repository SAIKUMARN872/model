import React from "react";

/**
 * Permissions Module
 *
 * Central entry point for:
 * - Permission constants
 * - Role constants
 * - Role-permission mappings
 * - Access control
 * - Permission guards
 * - Role guards
 * - Access utility functions
 */

/* -------------------------------------------------
   Access Control Imports
------------------------------------------------- */

export {
  AccessControl,

  createAccessControl,

  AccessControlProvider,

  useAccessControl,

  usePermission,

  useRole,

  PermissionGuard,

  RoleGuard,

  AccessGuard,

  can,

  canAny,

  canAll,

  hasRole,

  PERMISSIONS,

  ROLES,

  ROLE_PERMISSIONS,
} from "./access";

/* -------------------------------------------------
   Optional Permission Configuration
------------------------------------------------- */

export const PERMISSION_GROUPS = {
  DASHBOARD: {
    label: "Dashboard",

    permissions: [
      "dashboard:view",
    ],
  },

  USERS: {
    label: "Users",

    permissions: [
      "users:view",
      "users:create",
      "users:update",
      "users:delete",
      "users:manage",
    ],
  },

  ORGANIZATIONS: {
    label: "Organizations",

    permissions: [
      "organizations:view",
      "organizations:create",
      "organizations:update",
      "organizations:delete",
      "organizations:manage",
    ],
  },

  ROLES: {
    label: "Roles",

    permissions: [
      "roles:view",
      "roles:create",
      "roles:update",
      "roles:delete",
      "roles:manage",
    ],
  },

  PERMISSIONS: {
    label: "Permissions",

    permissions: [
      "permissions:view",
      "permissions:manage",
    ],
  },

  BILLING: {
    label: "Billing",

    permissions: [
      "billing:view",
      "billing:manage",
    ],
  },

  AUDIT: {
    label: "Audit",

    permissions: [
      "audit:view",
      "audit:export",
    ],
  },

  SECURITY: {
    label: "Security",

    permissions: [
      "security:view",
      "security:manage",
    ],
  },

  GOVERNANCE: {
    label: "Governance",

    permissions: [
      "governance:view",
      "governance:manage",
    ],
  },

  SETTINGS: {
    label: "Settings",

    permissions: [
      "settings:view",
      "settings:manage",
    ],
  },

  API_KEYS: {
    label: "API Keys",

    permissions: [
      "api_keys:view",
      "api_keys:create",
      "api_keys:revoke",
    ],
  },

  REPORTS: {
    label: "Reports",

    permissions: [
      "reports:view",
      "reports:export",
    ],
  },
};

/* -------------------------------------------------
   Permission Metadata
------------------------------------------------- */

export const PERMISSION_METADATA = {
  "dashboard:view": {
    label: "View Dashboard",
    description:
      "Allows the user to view the admin dashboard.",
    group: "DASHBOARD",
  },

  "users:view": {
    label: "View Users",
    description:
      "Allows the user to view users.",
    group: "USERS",
  },

  "users:create": {
    label: "Create Users",
    description:
      "Allows the user to create new users.",
    group: "USERS",
  },

  "users:update": {
    label: "Update Users",
    description:
      "Allows the user to update user information.",
    group: "USERS",
  },

  "users:delete": {
    label: "Delete Users",
    description:
      "Allows the user to delete users.",
    group: "USERS",
  },

  "users:manage": {
    label: "Manage Users",
    description:
      "Provides full user management access.",
    group: "USERS",
  },

  "organizations:view": {
    label: "View Organizations",
    description:
      "Allows the user to view organizations.",
    group: "ORGANIZATIONS",
  },

  "organizations:create": {
    label: "Create Organizations",
    description:
      "Allows the user to create organizations.",
    group: "ORGANIZATIONS",
  },

  "organizations:update": {
    label: "Update Organizations",
    description:
      "Allows the user to update organizations.",
    group: "ORGANIZATIONS",
  },

  "organizations:delete": {
    label: "Delete Organizations",
    description:
      "Allows the user to delete organizations.",
    group: "ORGANIZATIONS",
  },

  "organizations:manage": {
    label: "Manage Organizations",
    description:
      "Provides full organization management access.",
    group: "ORGANIZATIONS",
  },

  "roles:view": {
    label: "View Roles",
    description:
      "Allows the user to view roles.",
    group: "ROLES",
  },

  "roles:create": {
    label: "Create Roles",
    description:
      "Allows the user to create roles.",
    group: "ROLES",
  },

  "roles:update": {
    label: "Update Roles",
    description:
      "Allows the user to update roles.",
    group: "ROLES",
  },

  "roles:delete": {
    label: "Delete Roles",
    description:
      "Allows the user to delete roles.",
    group: "ROLES",
  },

  "roles:manage": {
    label: "Manage Roles",
    description:
      "Provides full role management access.",
    group: "ROLES",
  },

  "permissions:view": {
    label: "View Permissions",
    description:
      "Allows the user to view permissions.",
    group: "PERMISSIONS",
  },

  "permissions:manage": {
    label: "Manage Permissions",
    description:
      "Allows the user to manage permissions.",
    group: "PERMISSIONS",
  },

  "billing:view": {
    label: "View Billing",
    description:
      "Allows the user to view billing information.",
    group: "BILLING",
  },

  "billing:manage": {
    label: "Manage Billing",
    description:
      "Allows the user to manage billing.",
    group: "BILLING",
  },

  "audit:view": {
    label: "View Audit Logs",
    description:
      "Allows the user to view audit logs.",
    group: "AUDIT",
  },

  "audit:export": {
    label: "Export Audit Logs",
    description:
      "Allows the user to export audit logs.",
    group: "AUDIT",
  },

  "security:view": {
    label: "View Security",
    description:
      "Allows the user to view security information.",
    group: "SECURITY",
  },

  "security:manage": {
    label: "Manage Security",
    description:
      "Allows the user to manage security settings.",
    group: "SECURITY",
  },

  "governance:view": {
    label: "View Governance",
    description:
      "Allows the user to view governance information.",
    group: "GOVERNANCE",
  },

  "governance:manage": {
    label: "Manage Governance",
    description:
      "Allows the user to manage governance settings.",
    group: "GOVERNANCE",
  },

  "settings:view": {
    label: "View Settings",
    description:
      "Allows the user to view settings.",
    group: "SETTINGS",
  },

  "settings:manage": {
    label: "Manage Settings",
    description:
      "Allows the user to manage settings.",
    group: "SETTINGS",
  },

  "api_keys:view": {
    label: "View API Keys",
    description:
      "Allows the user to view API keys.",
    group: "API_KEYS",
  },

  "api_keys:create": {
    label: "Create API Keys",
    description:
      "Allows the user to create API keys.",
    group: "API_KEYS",
  },

  "api_keys:revoke": {
    label: "Revoke API Keys",
    description:
      "Allows the user to revoke API keys.",
    group: "API_KEYS",
  },

  "reports:view": {
    label: "View Reports",
    description:
      "Allows the user to view reports.",
    group: "REPORTS",
  },

  "reports:export": {
    label: "Export Reports",
    description:
      "Allows the user to export reports.",
    group: "REPORTS",
  },
};

/* -------------------------------------------------
   Get Permission Metadata
------------------------------------------------- */

export function getPermissionMetadata(
  permission
) {
  return (
    PERMISSION_METADATA[
      permission
    ] || {
      label: permission,
      description:
        "No description available.",
      group: "UNKNOWN",
    }
  );
}

/* -------------------------------------------------
   Get Permissions By Group
------------------------------------------------- */

export function getPermissionsByGroup(
  group
) {
  return (
    PERMISSION_GROUPS[
      group
    ]?.permissions || []
  );
}

/* -------------------------------------------------
   Get All Permissions
------------------------------------------------- */

export function getAllPermissions() {
  return Object.values(
    PERMISSION_GROUPS
  ).flatMap(
    (group) =>
      group.permissions
  );
}

/* -------------------------------------------------
   Check Permission Exists
------------------------------------------------- */

export function permissionExists(
  permission
) {
  return getAllPermissions().includes(
    permission
  );
}

/* -------------------------------------------------
   Validate Permissions
------------------------------------------------- */

export function validatePermissions(
  permissions = []
) {
  const valid = [];
  const invalid = [];

  permissions.forEach(
    (permission) => {
      if (
        permissionExists(
          permission
        )
      ) {
        valid.push(
          permission
        );
      } else {
        invalid.push(
          permission
        );
      }
    }
  );

  return {
    valid,
    invalid,
    isValid:
      invalid.length === 0,
  };
}

/* -------------------------------------------------
   Permission Builder
------------------------------------------------- */

export function createPermission(
  resource,
  action
) {
  if (
    !resource ||
    !action
  ) {
    throw new Error(
      "Resource and action are required."
    );
  }

  return `${resource}:${action}`;
}

/* -------------------------------------------------
   Permission Parser
------------------------------------------------- */

export function parsePermission(
  permission
) {
  if (
    typeof permission !==
    "string"
  ) {
    return {
      resource: null,
      action: null,
    };
  }

  const [
    resource,
    action,
  ] =
    permission.split(
      ":"
    );

  return {
    resource:
      resource || null,

    action:
      action || null,
  };
}

/* -------------------------------------------------
   Default Export
------------------------------------------------- */

export default {
  PERMISSION_GROUPS,

  PERMISSION_METADATA,

  getPermissionMetadata,

  getPermissionsByGroup,

  getAllPermissions,

  permissionExists,

  validatePermissions,

  createPermission,

  parsePermission,
};