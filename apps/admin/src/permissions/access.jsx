import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";

/**
 * Access Control / RBAC
 *
 * Responsibilities:
 * - Permission definitions
 * - Role definitions
 * - Permission checking
 * - Role checking
 * - Resource/action authorization
 * - Admin access
 * - React access hooks
 * - Access control components
 */

/* -------------------------------------------------
   Permission Constants
------------------------------------------------- */

export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW:
    "dashboard:view",

  // Users
  USERS_VIEW:
    "users:view",

  USERS_CREATE:
    "users:create",

  USERS_UPDATE:
    "users:update",

  USERS_DELETE:
    "users:delete",

  USERS_MANAGE:
    "users:manage",

  // Organizations
  ORGANIZATIONS_VIEW:
    "organizations:view",

  ORGANIZATIONS_CREATE:
    "organizations:create",

  ORGANIZATIONS_UPDATE:
    "organizations:update",

  ORGANIZATIONS_DELETE:
    "organizations:delete",

  ORGANIZATIONS_MANAGE:
    "organizations:manage",

  // Roles
  ROLES_VIEW:
    "roles:view",

  ROLES_CREATE:
    "roles:create",

  ROLES_UPDATE:
    "roles:update",

  ROLES_DELETE:
    "roles:delete",

  ROLES_MANAGE:
    "roles:manage",

  // Permissions
  PERMISSIONS_VIEW:
    "permissions:view",

  PERMISSIONS_MANAGE:
    "permissions:manage",

  // Billing
  BILLING_VIEW:
    "billing:view",

  BILLING_MANAGE:
    "billing:manage",

  // Audit
  AUDIT_VIEW:
    "audit:view",

  AUDIT_EXPORT:
    "audit:export",

  // Security
  SECURITY_VIEW:
    "security:view",

  SECURITY_MANAGE:
    "security:manage",

  // Governance
  GOVERNANCE_VIEW:
    "governance:view",

  GOVERNANCE_MANAGE:
    "governance:manage",

  // Settings
  SETTINGS_VIEW:
    "settings:view",

  SETTINGS_MANAGE:
    "settings:manage",

  // API Keys
  API_KEYS_VIEW:
    "api_keys:view",

  API_KEYS_CREATE:
    "api_keys:create",

  API_KEYS_REVOKE:
    "api_keys:revoke",

  // Reports
  REPORTS_VIEW:
    "reports:view",

  REPORTS_EXPORT:
    "reports:export",
};

/* -------------------------------------------------
   Role Constants
------------------------------------------------- */

export const ROLES = {
  SUPER_ADMIN:
    "super_admin",

  ADMIN:
    "admin",

  ORGANIZATION_ADMIN:
    "organization_admin",

  MANAGER:
    "manager",

  AUDITOR:
    "auditor",

  SECURITY_ADMIN:
    "security_admin",

  BILLING_ADMIN:
    "billing_admin",

  USER:
    "user",

  VIEWER:
    "viewer",
};

/* -------------------------------------------------
   Role Permissions
------------------------------------------------- */

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]:
    Object.values(
      PERMISSIONS
    ),

  [ROLES.ADMIN]: [
    PERMISSIONS.DASHBOARD_VIEW,

    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.USERS_MANAGE,

    PERMISSIONS.ORGANIZATIONS_VIEW,
    PERMISSIONS.ORGANIZATIONS_CREATE,
    PERMISSIONS.ORGANIZATIONS_UPDATE,
    PERMISSIONS.ORGANIZATIONS_MANAGE,

    PERMISSIONS.ROLES_VIEW,
    PERMISSIONS.ROLES_CREATE,
    PERMISSIONS.ROLES_UPDATE,

    PERMISSIONS.PERMISSIONS_VIEW,

    PERMISSIONS.BILLING_VIEW,

    PERMISSIONS.AUDIT_VIEW,
    PERMISSIONS.AUDIT_EXPORT,

    PERMISSIONS.SECURITY_VIEW,

    PERMISSIONS.GOVERNANCE_VIEW,

    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_MANAGE,

    PERMISSIONS.API_KEYS_VIEW,
    PERMISSIONS.API_KEYS_CREATE,
    PERMISSIONS.API_KEYS_REVOKE,

    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
  ],

  [ROLES.ORGANIZATION_ADMIN]: [
    PERMISSIONS.DASHBOARD_VIEW,

    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,

    PERMISSIONS.ORGANIZATIONS_VIEW,
    PERMISSIONS.ORGANIZATIONS_UPDATE,

    PERMISSIONS.ROLES_VIEW,

    PERMISSIONS.BILLING_VIEW,

    PERMISSIONS.AUDIT_VIEW,

    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_MANAGE,

    PERMISSIONS.API_KEYS_VIEW,
    PERMISSIONS.API_KEYS_CREATE,
  ],

  [ROLES.MANAGER]: [
    PERMISSIONS.DASHBOARD_VIEW,

    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_UPDATE,

    PERMISSIONS.ORGANIZATIONS_VIEW,

    PERMISSIONS.REPORTS_VIEW,

    PERMISSIONS.AUDIT_VIEW,
  ],

  [ROLES.AUDITOR]: [
    PERMISSIONS.DASHBOARD_VIEW,

    PERMISSIONS.USERS_VIEW,

    PERMISSIONS.ORGANIZATIONS_VIEW,

    PERMISSIONS.AUDIT_VIEW,
    PERMISSIONS.AUDIT_EXPORT,

    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
  ],

  [ROLES.SECURITY_ADMIN]: [
    PERMISSIONS.DASHBOARD_VIEW,

    PERMISSIONS.SECURITY_VIEW,
    PERMISSIONS.SECURITY_MANAGE,

    PERMISSIONS.AUDIT_VIEW,

    PERMISSIONS.USERS_VIEW,

    PERMISSIONS.API_KEYS_VIEW,
    PERMISSIONS.API_KEYS_REVOKE,
  ],

  [ROLES.BILLING_ADMIN]: [
    PERMISSIONS.DASHBOARD_VIEW,

    PERMISSIONS.BILLING_VIEW,
    PERMISSIONS.BILLING_MANAGE,

    PERMISSIONS.ORGANIZATIONS_VIEW,

    PERMISSIONS.REPORTS_VIEW,
  ],

  [ROLES.USER]: [
    PERMISSIONS.DASHBOARD_VIEW,

    PERMISSIONS.SETTINGS_VIEW,

    PERMISSIONS.API_KEYS_VIEW,
  ],

  [ROLES.VIEWER]: [
    PERMISSIONS.DASHBOARD_VIEW,

    PERMISSIONS.USERS_VIEW,

    PERMISSIONS.ORGANIZATIONS_VIEW,

    PERMISSIONS.REPORTS_VIEW,
  ],
};

/* -------------------------------------------------
   Access Control Class
------------------------------------------------- */

export class AccessControl {
  constructor(
    user = null
  ) {
    this.user =
      user || {};

    this.roles =
      this.normalizeRoles(
        this.user.roles
      );

    this.permissions =
      this.normalizePermissions(
        this.user.permissions
      );
  }

  normalizeRoles(
    roles
  ) {
    if (
      Array.isArray(
        roles
      )
    ) {
      return roles;
    }

    if (
      typeof roles ===
      "string"
    ) {
      return [roles];
    }

    if (
      this.user.role
    ) {
      return [
        this.user.role,
      ];
    }

    return [];
  }

  normalizePermissions(
    permissions
  ) {
    if (
      !Array.isArray(
        permissions
      )
    ) {
      return [];
    }

    return permissions;
  }

  isAuthenticated() {
    return Boolean(
      this.user &&
        this.user.id
    );
  }

  isSuperAdmin() {
    return this.hasRole(
      ROLES.SUPER_ADMIN
    );
  }

  hasRole(
    role
  ) {
    if (
      this.isSuperAdmin()
    ) {
      return true;
    }

    return this.roles.includes(
      role
    );
  }

  hasAnyRole(
    roles
  ) {
    if (
      this.isSuperAdmin()
    ) {
      return true;
    }

    return roles.some(
      (role) =>
        this.roles.includes(
          role
        )
    );
  }

  hasAllRoles(
    roles
  ) {
    if (
      this.isSuperAdmin()
    ) {
      return true;
    }

    return roles.every(
      (role) =>
        this.roles.includes(
          role
        )
    );
  }

  hasPermission(
    permission
  ) {
    if (
      this.isSuperAdmin()
    ) {
      return true;
    }

    if (
      this.permissions.includes(
        permission
      )
    ) {
      return true;
    }

    return this.roles.some(
      (role) =>
        (
          ROLE_PERMISSIONS[
            role
          ] || []
        ).includes(
          permission
        )
    );
  }

  hasAnyPermission(
    permissions
  ) {
    if (
      this.isSuperAdmin()
    ) {
      return true;
    }

    return permissions.some(
      (permission) =>
        this.hasPermission(
          permission
        )
    );
  }

  hasAllPermissions(
    permissions
  ) {
    if (
      this.isSuperAdmin()
    ) {
      return true;
    }

    return permissions.every(
      (permission) =>
        this.hasPermission(
          permission
        )
    );
  }

  can(
    permission
  ) {
    return this.hasPermission(
      permission
    );
  }

  cannot(
    permission
  ) {
    return !this.can(
      permission
    );
  }

  canAccess(
    options = {}
  ) {
    const {
      permissions = [],
      roles = [],
      requireAll = false,
    } = options;

    const permissionCheck =
      permissions.length ===
      0
        ? true
        : requireAll
        ? this.hasAllPermissions(
            permissions
          )
        : this.hasAnyPermission(
            permissions
          );

    const roleCheck =
      roles.length === 0
        ? true
        : requireAll
        ? this.hasAllRoles(
            roles
          )
        : this.hasAnyRole(
            roles
          );

    return (
      permissionCheck &&
      roleCheck
    );
  }

  getPermissions() {
    const rolePermissions =
      this.roles.flatMap(
        (role) =>
          ROLE_PERMISSIONS[
            role
          ] || []
      );

    return [
      ...new Set([
        ...this.permissions,
        ...rolePermissions,
      ]),
    ];
  }

  getRoles() {
    return [
      ...this.roles,
    ];
  }
}

/* -------------------------------------------------
   Factory Function
------------------------------------------------- */

export function createAccessControl(
  user
) {
  return new AccessControl(
    user
  );
}

/* -------------------------------------------------
   React Context
------------------------------------------------- */

const AccessControlContext =
  createContext(
    null
  );

/* -------------------------------------------------
   Access Control Provider
------------------------------------------------- */

export function AccessControlProvider({
  user,
  children,
}) {
  const accessControl =
    useMemo(
      () =>
        new AccessControl(
          user
        ),
      [user]
    );

  return (
    <AccessControlContext.Provider
      value={
        accessControl
      }
    >
      {children}
    </AccessControlContext.Provider>
  );
}

/* -------------------------------------------------
   React Hook
------------------------------------------------- */

export function useAccessControl() {
  const context =
    useContext(
      AccessControlContext
    );

  if (!context) {
    throw new Error(
      "useAccessControl must be used inside AccessControlProvider"
    );
  }

  return context;
}

/* -------------------------------------------------
   Permission Hook
------------------------------------------------- */

export function usePermission(
  permission
) {
  const accessControl =
    useAccessControl();

  return accessControl.hasPermission(
    permission
  );
}

/* -------------------------------------------------
   Role Hook
------------------------------------------------- */

export function useRole(
  role
) {
  const accessControl =
    useAccessControl();

  return accessControl.hasRole(
    role
  );
}

/* -------------------------------------------------
   Permission Guard
------------------------------------------------- */

export function PermissionGuard({
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
  children,
}) {
  const accessControl =
    useAccessControl();

  const requiredPermissions =
    permission
      ? [
          permission,
          ...permissions,
        ]
      : permissions;

  const allowed =
    requiredPermissions.length ===
    0
      ? true
      : requireAll
      ? accessControl.hasAllPermissions(
          requiredPermissions
        )
      : accessControl.hasAnyPermission(
          requiredPermissions
        );

  if (!allowed) {
    return fallback;
  }

  return children;
}

/* -------------------------------------------------
   Role Guard
------------------------------------------------- */

export function RoleGuard({
  role,
  roles = [],
  requireAll = false,
  fallback = null,
  children,
}) {
  const accessControl =
    useAccessControl();

  const requiredRoles =
    role
      ? [
          role,
          ...roles,
        ]
      : roles;

  const allowed =
    requiredRoles.length ===
    0
      ? true
      : requireAll
      ? accessControl.hasAllRoles(
          requiredRoles
        )
      : accessControl.hasAnyRole(
          requiredRoles
        );

  if (!allowed) {
    return fallback;
  }

  return children;
}

/* -------------------------------------------------
   Access Guard
------------------------------------------------- */

export function AccessGuard({
  permissions = [],
  roles = [],
  requireAll = false,
  fallback = null,
  children,
}) {
  const accessControl =
    useAccessControl();

  const allowed =
    accessControl.canAccess({
      permissions,
      roles,
      requireAll,
    });

  if (!allowed) {
    return fallback;
  }

  return children;
}

/* -------------------------------------------------
   Permission Utility Functions
------------------------------------------------- */

export function can(
  user,
  permission
) {
  const accessControl =
    new AccessControl(
      user
    );

  return accessControl.hasPermission(
    permission
  );
}

export function canAny(
  user,
  permissions
) {
  const accessControl =
    new AccessControl(
      user
    );

  return accessControl.hasAnyPermission(
    permissions
  );
}

export function canAll(
  user,
  permissions
) {
  const accessControl =
    new AccessControl(
      user
    );

  return accessControl.hasAllPermissions(
    permissions
  );
}

export function hasRole(
  user,
  role
) {
  const accessControl =
    new AccessControl(
      user
    );

  return accessControl.hasRole(
    role
  );
}

/* -------------------------------------------------
   Default Export
------------------------------------------------- */

export default {
  PERMISSIONS,

  ROLES,

  ROLE_PERMISSIONS,

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
};