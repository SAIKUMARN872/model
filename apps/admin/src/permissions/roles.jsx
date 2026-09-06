import {
  PERMISSIONS,
} from "../permissions/access";

/**
 * Application Role Configuration
 *
 * Responsibilities:
 * - Role definitions
 * - Role hierarchy
 * - Role metadata
 * - Role permissions
 * - Role validation
 * - Role utility functions
 */

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
   Role Metadata
------------------------------------------------- */

export const ROLE_METADATA = {
  [ROLES.SUPER_ADMIN]: {
    label:
      "Super Administrator",

    description:
      "Full unrestricted access to the entire platform.",

    level: 100,

    systemRole: true,
  },

  [ROLES.ADMIN]: {
    label:
      "Administrator",

    description:
      "Manages users, organizations, settings, and platform operations.",

    level: 90,

    systemRole: true,
  },

  [ROLES.ORGANIZATION_ADMIN]: {
    label:
      "Organization Administrator",

    description:
      "Manages users and resources within an organization.",

    level: 70,

    systemRole: false,
  },

  [ROLES.MANAGER]: {
    label:
      "Manager",

    description:
      "Can manage users and access operational reports.",

    level: 60,

    systemRole: false,
  },

  [ROLES.AUDITOR]: {
    label:
      "Auditor",

    description:
      "Can view and export audit logs and reports.",

    level: 50,

    systemRole: false,
  },

  [ROLES.SECURITY_ADMIN]: {
    label:
      "Security Administrator",

    description:
      "Manages security policies, access, and security operations.",

    level: 80,

    systemRole: true,
  },

  [ROLES.BILLING_ADMIN]: {
    label:
      "Billing Administrator",

    description:
      "Manages billing, subscriptions, and financial information.",

    level: 60,

    systemRole: false,
  },

  [ROLES.USER]: {
    label:
      "User",

    description:
      "Standard authenticated platform user.",

    level: 20,

    systemRole: false,
  },

  [ROLES.VIEWER]: {
    label:
      "Viewer",

    description:
      "Read-only access to permitted platform resources.",

    level: 10,

    systemRole: false,
  },
};

/* -------------------------------------------------
   Role Hierarchy
------------------------------------------------- */

export const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: [
    ROLES.SUPER_ADMIN,
    ROLES.ADMIN,
    ROLES.SECURITY_ADMIN,
    ROLES.ORGANIZATION_ADMIN,
    ROLES.MANAGER,
    ROLES.AUDITOR,
    ROLES.BILLING_ADMIN,
    ROLES.USER,
    ROLES.VIEWER,
  ],

  [ROLES.ADMIN]: [
    ROLES.ADMIN,
    ROLES.ORGANIZATION_ADMIN,
    ROLES.MANAGER,
    ROLES.AUDITOR,
    ROLES.BILLING_ADMIN,
    ROLES.USER,
    ROLES.VIEWER,
  ],

  [ROLES.SECURITY_ADMIN]: [
    ROLES.SECURITY_ADMIN,
    ROLES.AUDITOR,
    ROLES.USER,
    ROLES.VIEWER,
  ],

  [ROLES.ORGANIZATION_ADMIN]: [
    ROLES.ORGANIZATION_ADMIN,
    ROLES.MANAGER,
    ROLES.USER,
    ROLES.VIEWER,
  ],

  [ROLES.MANAGER]: [
    ROLES.MANAGER,
    ROLES.USER,
    ROLES.VIEWER,
  ],

  [ROLES.AUDITOR]: [
    ROLES.AUDITOR,
    ROLES.VIEWER,
  ],

  [ROLES.BILLING_ADMIN]: [
    ROLES.BILLING_ADMIN,
    ROLES.VIEWER,
  ],

  [ROLES.USER]: [
    ROLES.USER,
    ROLES.VIEWER,
  ],

  [ROLES.VIEWER]: [
    ROLES.VIEWER,
  ],
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
   Get Role Metadata
------------------------------------------------- */

export function getRoleMetadata(
  role
) {
  return (
    ROLE_METADATA[role] || {
      label: role,

      description:
        "Unknown role.",

      level: 0,

      systemRole: false,
    }
  );
}

/* -------------------------------------------------
   Get Role Permissions
------------------------------------------------- */

export function getRolePermissions(
  role
) {
  return (
    ROLE_PERMISSIONS[role] ||
    []
  );
}

/* -------------------------------------------------
   Get All Roles
------------------------------------------------- */

export function getAllRoles() {
  return Object.values(
    ROLES
  );
}

/* -------------------------------------------------
   Check Role
------------------------------------------------- */

export function isValidRole(
  role
) {
  return getAllRoles().includes(
    role
  );
}

/* -------------------------------------------------
   Check Role Hierarchy
------------------------------------------------- */

export function canManageRole(
  managerRole,
  targetRole
) {
  if (
    !isValidRole(
      managerRole
    ) ||
    !isValidRole(
      targetRole
    )
  ) {
    return false;
  }

  if (
    managerRole ===
    ROLES.SUPER_ADMIN
  ) {
    return true;
  }

  const manageableRoles =
    ROLE_HIERARCHY[
      managerRole
    ] || [];

  return manageableRoles.includes(
    targetRole
  );
}

/* -------------------------------------------------
   Compare Roles
------------------------------------------------- */

export function compareRoles(
  roleA,
  roleB
) {
  const levelA =
    getRoleMetadata(
      roleA
    ).level;

  const levelB =
    getRoleMetadata(
      roleB
    ).level;

  if (
    levelA > levelB
  ) {
    return 1;
  }

  if (
    levelA < levelB
  ) {
    return -1;
  }

  return 0;
}

/* -------------------------------------------------
   Get Highest Role
------------------------------------------------- */

export function getHighestRole(
  roles = []
) {
  const validRoles =
    roles.filter(
      isValidRole
    );

  if (
    validRoles.length ===
    0
  ) {
    return null;
  }

  return validRoles.reduce(
    (
      highest,
      current
    ) =>
      compareRoles(
        current,
        highest
      ) > 0
        ? current
        : highest
  );
}

/* -------------------------------------------------
   Get Roles By Level
------------------------------------------------- */

export function getRolesByLevel(
  minimumLevel = 0
) {
  return getAllRoles()
    .filter(
      (role) =>
        getRoleMetadata(
          role
        ).level >=
        minimumLevel
    )
    .sort(
      (a, b) =>
        getRoleMetadata(
          b
        ).level -
        getRoleMetadata(
          a
        ).level
    );
}

/* -------------------------------------------------
   Get Assignable Roles
------------------------------------------------- */

export function getAssignableRoles(
  managerRole
) {
  return getAllRoles().filter(
    (role) =>
      canManageRole(
        managerRole,
        role
      )
  );
}

/* -------------------------------------------------
   Validate Role Assignment
------------------------------------------------- */

export function validateRoleAssignment(
  managerRole,
  targetRole
) {
  if (
    !isValidRole(
      managerRole
    )
  ) {
    return {
      valid: false,

      reason:
        "Manager role is invalid.",
    };
  }

  if (
    !isValidRole(
      targetRole
    )
  ) {
    return {
      valid: false,

      reason:
        "Target role is invalid.",
    };
  }

  if (
    !canManageRole(
      managerRole,
      targetRole
    )
  ) {
    return {
      valid: false,

      reason:
        "Manager does not have permission to assign this role.",
    };
  }

  return {
    valid: true,

    reason: null,
  };
}

/* -------------------------------------------------
   Default Export
------------------------------------------------- */

export default {
  ROLES,

  ROLE_METADATA,

  ROLE_HIERARCHY,

  ROLE_PERMISSIONS,

  getRoleMetadata,

  getRolePermissions,

  getAllRoles,

  isValidRole,

  canManageRole,

  compareRoles,

  getHighestRole,

  getRolesByLevel,

  getAssignableRoles,

  validateRoleAssignment,
};