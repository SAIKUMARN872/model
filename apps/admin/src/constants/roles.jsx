/**
 * Enterprise Role-Based Access Control (RBAC)
 *
 * Centralized role definitions and role utilities.
 *
 * Role hierarchy:
 *
 * SUPER_ADMIN
 *      ↓
 * PLATFORM_ADMIN
 *      ↓
 * ORGANIZATION_ADMIN
 *      ↓
 * SECURITY_ADMIN / COMPLIANCE_ADMIN / BILLING_ADMIN
 *      ↓
 * MANAGER
 *      ↓
 * ANALYST
 *      ↓
 * SUPPORT
 *      ↓
 * VIEWER
 *
 * Important:
 * Frontend roles are used for UI and routing decisions.
 * The backend must independently enforce authorization.
 */

/* =========================================================
   Role Identifiers
========================================================= */

export const ROLES =
  Object.freeze({
    SUPER_ADMIN:
      "super_admin",

    PLATFORM_ADMIN:
      "platform_admin",

    ORGANIZATION_ADMIN:
      "organization_admin",

    SECURITY_ADMIN:
      "security_admin",

    COMPLIANCE_ADMIN:
      "compliance_admin",

    BILLING_ADMIN:
      "billing_admin",

    USER_ADMIN:
      "user_admin",

    AI_ADMIN:
      "ai_admin",

    ANALYST:
      "analyst",

    MANAGER:
      "manager",

    SUPPORT:
      "support",

    MEMBER:
      "member",

    VIEWER:
      "viewer",
  });

/* =========================================================
   Role Hierarchy
========================================================= */

export const ROLE_HIERARCHY =
  Object.freeze({
    [ROLES.VIEWER]:
      10,

    [ROLES.MEMBER]:
      20,

    [ROLES.SUPPORT]:
      30,

    [ROLES.ANALYST]:
      40,

    [ROLES.MANAGER]:
      50,

    [ROLES.USER_ADMIN]:
      60,

    [ROLES.AI_ADMIN]:
      65,

    [ROLES.BILLING_ADMIN]:
      70,

    [ROLES.COMPLIANCE_ADMIN]:
      75,

    [ROLES.SECURITY_ADMIN]:
      80,

    [ROLES.ORGANIZATION_ADMIN]:
      90,

    [ROLES.PLATFORM_ADMIN]:
      100,

    [ROLES.SUPER_ADMIN]:
      1000,
  });

/* =========================================================
   Role Labels
========================================================= */

export const ROLE_LABELS =
  Object.freeze({
    [ROLES.SUPER_ADMIN]:
      "Super Administrator",

    [ROLES.PLATFORM_ADMIN]:
      "Platform Administrator",

    [ROLES.ORGANIZATION_ADMIN]:
      "Organization Administrator",

    [ROLES.SECURITY_ADMIN]:
      "Security Administrator",

    [ROLES.COMPLIANCE_ADMIN]:
      "Compliance Administrator",

    [ROLES.BILLING_ADMIN]:
      "Billing Administrator",

    [ROLES.USER_ADMIN]:
      "User Administrator",

    [ROLES.AI_ADMIN]:
      "AI Administrator",

    [ROLES.ANALYST]:
      "Analyst",

    [ROLES.MANAGER]:
      "Manager",

    [ROLES.SUPPORT]:
      "Support",

    [ROLES.MEMBER]:
      "Member",

    [ROLES.VIEWER]:
      "Viewer",
  });

/* =========================================================
   Role Descriptions
========================================================= */

export const ROLE_DESCRIPTIONS =
  Object.freeze({
    [ROLES.SUPER_ADMIN]:
      "Full unrestricted platform administration.",

    [ROLES.PLATFORM_ADMIN]:
      "Manages platform-wide infrastructure and administration.",

    [ROLES.ORGANIZATION_ADMIN]:
      "Manages users, workspaces, teams, and settings within an organization.",

    [ROLES.SECURITY_ADMIN]:
      "Manages security controls, access policies, and security events.",

    [ROLES.COMPLIANCE_ADMIN]:
      "Manages compliance frameworks, controls, evidence, and remediation.",

    [ROLES.BILLING_ADMIN]:
      "Manages billing, subscriptions, invoices, and financial settings.",

    [ROLES.USER_ADMIN]:
      "Manages users, invitations, and user lifecycle operations.",

    [ROLES.AI_ADMIN]:
      "Manages AI agents, models, prompts, and AI configurations.",

    [ROLES.ANALYST]:
      "Views analytics, reports, usage, and operational insights.",

    [ROLES.MANAGER]:
      "Manages assigned teams, users, and operational workflows.",

    [ROLES.SUPPORT]:
      "Provides customer and operational support with limited administrative access.",

    [ROLES.MEMBER]:
      "Standard authenticated platform user.",

    [ROLES.VIEWER]:
      "Read-only access to permitted resources.",
  });

/* =========================================================
   System Roles
========================================================= */

export const SYSTEM_ROLES =
  Object.freeze([
    ROLES.SUPER_ADMIN,

    ROLES.PLATFORM_ADMIN,

    ROLES.ORGANIZATION_ADMIN,

    ROLES.SECURITY_ADMIN,

    ROLES.COMPLIANCE_ADMIN,

    ROLES.BILLING_ADMIN,

    ROLES.USER_ADMIN,

    ROLES.AI_ADMIN,
  ]);

/* =========================================================
   Administrative Roles
========================================================= */

export const ADMIN_ROLES =
  Object.freeze([
    ROLES.SUPER_ADMIN,

    ROLES.PLATFORM_ADMIN,

    ROLES.ORGANIZATION_ADMIN,

    ROLES.SECURITY_ADMIN,

    ROLES.COMPLIANCE_ADMIN,

    ROLES.BILLING_ADMIN,

    ROLES.USER_ADMIN,

    ROLES.AI_ADMIN,
  ]);

/* =========================================================
   Read-Only Roles
========================================================= */

export const READ_ONLY_ROLES =
  Object.freeze([
    ROLES.ANALYST,

    ROLES.VIEWER,
  ]);

/* =========================================================
   Role Permissions
========================================================= */

export const ROLE_PERMISSIONS =
  Object.freeze({
    [ROLES.SUPER_ADMIN]: [
      "system:admin",
    ],

    [ROLES.PLATFORM_ADMIN]: [
      "system:manage",

      "organizations:read",
      "organizations:create",
      "organizations:update",
      "organizations:delete",
      "organizations:manage",

      "users:read",
      "users:create",
      "users:update",
      "users:delete",
      "users:manage",

      "security:read",
      "security:update",
      "security:manage",

      "audit_logs:read",
      "audit_logs:export",

      "compliance:read",
      "compliance:manage",

      "billing:read",
      "billing:manage",
    ],

    [ROLES.ORGANIZATION_ADMIN]: [
      "organizations:read",
      "organizations:update",

      "users:read",
      "users:create",
      "users:update",
      "users:invite",

      "workspaces:read",
      "workspaces:create",
      "workspaces:update",
      "workspaces:delete",
      "workspaces:manage",

      "teams:read",
      "teams:create",
      "teams:update",
      "teams:delete",
      "teams:manage",

      "roles:read",

      "analytics:read",

      "audit_logs:read",

      "settings:read",
      "settings:update",
    ],

    [ROLES.SECURITY_ADMIN]: [
      "security:read",
      "security:update",
      "security:manage",
      "security:revoke",

      "audit:read",
      "audit:export",

      "audit_logs:read",
      "audit_logs:export",
      "audit_logs:manage",

      "permissions:read",
      "permissions:manage",

      "roles:read",
      "roles:manage",
    ],

    [ROLES.COMPLIANCE_ADMIN]: [
      "compliance:read",
      "compliance:create",
      "compliance:update",
      "compliance:delete",
      "compliance:export",
      "compliance:manage",

      "audit_logs:read",
      "audit_logs:export",

      "governance:read",
      "governance:update",
      "governance:manage",
    ],

    [ROLES.BILLING_ADMIN]: [
      "billing:read",
      "billing:create",
      "billing:update",
      "billing:delete",
      "billing:manage",
      "billing:export",

      "usage:read",
      "usage:export",

      "cost:read",
      "cost:export",
    ],

    [ROLES.USER_ADMIN]: [
      "users:read",
      "users:create",
      "users:update",
      "users:delete",
      "users:manage",
      "users:invite",

      "organizations:read",

      "workspaces:read",

      "teams:read",
      "teams:assign",

      "roles:read",
    ],

    [ROLES.AI_ADMIN]: [
      "agents:read",
      "agents:create",
      "agents:update",
      "agents:delete",
      "agents:manage",
      "agents:execute",

      "models:read",
      "models:create",
      "models:update",
      "models:delete",
      "models:manage",

      "prompts:read",
      "prompts:create",
      "prompts:update",
      "prompts:delete",
      "prompts:manage",

      "knowledge:read",
      "knowledge:create",
      "knowledge:update",
      "knowledge:delete",
      "knowledge:manage",

      "integrations:read",
      "integrations:manage",
    ],

    [ROLES.ANALYST]: [
      "dashboard:view",

      "analytics:view",
      "analytics:read",
      "analytics:export",

      "reports:read",
      "reports:export",

      "usage:read",
      "usage:export",

      "cost:read",
      "cost:export",
    ],

    [ROLES.MANAGER]: [
      "dashboard:view",

      "users:read",
      "users:update",

      "teams:read",
      "teams:update",
      "teams:assign",

      "workspaces:read",

      "analytics:view",
      "analytics:read",

      "reports:read",
    ],

    [ROLES.SUPPORT]: [
      "dashboard:view",

      "users:read",

      "organizations:read",

      "workspaces:read",

      "tickets:read",

      "tickets:update",
    ],

    [ROLES.MEMBER]: [
      "dashboard:view",

      "organizations:read",

      "workspaces:read",

      "teams:read",

      "agents:read",

      "agents:execute",

      "models:read",

      "knowledge:read",
    ],

    [ROLES.VIEWER]: [
      "dashboard:view",

      "organizations:read",

      "workspaces:read",

      "analytics:view",

      "reports:read",
    ],
  });

/* =========================================================
   Role Utilities
========================================================= */

/**
 * Check whether a user has a specific role.
 */

export const hasRole = (
  userRoles = [],
  requiredRole
) => {
  if (
    !requiredRole ||
    !Array.isArray(
      userRoles
    )
  ) {
    return false;
  }

  return userRoles.includes(
    requiredRole
  );
};

/* =========================================================
   Any Role Check
========================================================= */

export const hasAnyRole = (
  userRoles = [],
  requiredRoles = []
) => {
  if (
    !Array.isArray(
      userRoles
    ) ||
    !Array.isArray(
      requiredRoles
    )
  ) {
    return false;
  }

  return requiredRoles.some(
    (role) =>
      userRoles.includes(
        role
      )
  );
};

/* =========================================================
   All Roles Check
========================================================= */

export const hasAllRoles = (
  userRoles = [],
  requiredRoles = []
) => {
  if (
    !Array.isArray(
      userRoles
    ) ||
    !Array.isArray(
      requiredRoles
    )
  ) {
    return false;
  }

  return requiredRoles.every(
    (role) =>
      userRoles.includes(
        role
      )
  );
};

/* =========================================================
   Role Hierarchy Check
========================================================= */

export const hasMinimumRole = (
  userRoles = [],
  requiredRole
) => {
  if (
    !Array.isArray(
      userRoles
    ) ||
    !requiredRole
  ) {
    return false;
  }

  const requiredLevel =
    ROLE_HIERARCHY[
      requiredRole
    ] || 0;

  return userRoles.some(
    (role) => {
      const userLevel =
        ROLE_HIERARCHY[
          role
        ] || 0;

      return (
        userLevel >=
        requiredLevel
      );
    }
  );
};

/* =========================================================
   Get Role Permissions
========================================================= */

export const getRolePermissions = (
  role
) => {
  return (
    ROLE_PERMISSIONS[
      role
    ] || []
  );
};

/* =========================================================
   Get User Permissions
========================================================= */

export const getUserPermissions = (
  userRoles = []
) => {
  if (
    !Array.isArray(
      userRoles
    )
  ) {
    return [];
  }

  const permissions =
    userRoles.flatMap(
      (role) =>
        getRolePermissions(
          role
        )
    );

  return [
    ...new Set(
      permissions
    ),
  ];
};

/* =========================================================
   Role Label Helper
========================================================= */

export const getRoleLabel = (
  role
) => {
  return (
    ROLE_LABELS[
      role
    ] ||
    "Unknown Role"
  );
};

/* =========================================================
   Role Metadata
========================================================= */

export const ROLE_METADATA =
  Object.freeze(
    Object.keys(
      ROLES
    ).reduce(
      (
        metadata,
        roleKey
      ) => {
        const role =
          ROLES[
            roleKey
          ];

        metadata[
          role
        ] = {
          label:
            ROLE_LABELS[
              role
            ],

          description:
            ROLE_DESCRIPTIONS[
              role
            ],

          hierarchy:
            ROLE_HIERARCHY[
              role
            ] || 0,

          permissions:
            ROLE_PERMISSIONS[
              role
            ] || [],
        };

        return metadata;
      },
      {}
    )
  );

/* =========================================================
   Default Export
========================================================= */

const roles =
  Object.freeze({
    ROLES,

    ROLE_HIERARCHY,

    ROLE_LABELS,

    ROLE_DESCRIPTIONS,

    SYSTEM_ROLES,

    ADMIN_ROLES,

    READ_ONLY_ROLES,

    ROLE_PERMISSIONS,

    ROLE_METADATA,

    hasRole,

    hasAnyRole,

    hasAllRoles,

    hasMinimumRole,

    getRolePermissions,

    getUserPermissions,

    getRoleLabel,
  });

export default roles;