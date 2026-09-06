import {
  useCallback,
  useMemo,
} from "react";

/**
 * Permission Hook
 *
 * Handles:
 * - Permission checks
 * - Role checks
 * - Multiple permission checks
 * - Any / all permission checks
 * - Resource-based permissions
 *
 * Expected permission format:
 *
 * "users.read"
 * "users.create"
 * "users.update"
 * "users.delete"
 *
 * "organizations.read"
 * "workspaces.manage"
 *
 * You can also use:
 *
 * "*"
 * "users.*"
 */

/* ----------------------------------------
 * Default Roles
 * -------------------------------------- */

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  MANAGER: "manager",
  AUDITOR: "auditor",
  VIEWER: "viewer",
};

/* ----------------------------------------
 * Permission Constants
 * -------------------------------------- */

export const PERMISSIONS = {
  USERS_READ: "users.read",
  USERS_CREATE: "users.create",
  USERS_UPDATE: "users.update",
  USERS_DELETE: "users.delete",

  TEAMS_READ: "teams.read",
  TEAMS_CREATE: "teams.create",
  TEAMS_UPDATE: "teams.update",
  TEAMS_DELETE: "teams.delete",

  WORKSPACES_READ:
    "workspaces.read",
  WORKSPACES_CREATE:
    "workspaces.create",
  WORKSPACES_UPDATE:
    "workspaces.update",
  WORKSPACES_DELETE:
    "workspaces.delete",

  ORGANIZATIONS_READ:
    "organizations.read",
  ORGANIZATIONS_CREATE:
    "organizations.create",
  ORGANIZATIONS_UPDATE:
    "organizations.update",
  ORGANIZATIONS_DELETE:
    "organizations.delete",

  AUDIT_READ: "audit.read",

  BILLING_READ: "billing.read",
  BILLING_MANAGE:
    "billing.manage",

  SETTINGS_READ:
    "settings.read",
  SETTINGS_UPDATE:
    "settings.update",

  API_KEYS_READ:
    "api_keys.read",
  API_KEYS_CREATE:
    "api_keys.create",
  API_KEYS_DELETE:
    "api_keys.delete",
};

/* ----------------------------------------
 * Permission Matching
 * -------------------------------------- */

const permissionMatches = (
  userPermission,
  requiredPermission
) => {
  if (
    userPermission === "*"
  ) {
    return true;
  }

  if (
    userPermission ===
    requiredPermission
  ) {
    return true;
  }

  if (
    userPermission.endsWith(
      ".*"
    )
  ) {
    const resource =
      userPermission.slice(
        0,
        -2
      );

    return (
      requiredPermission.startsWith(
        `${resource}.`
      )
    );
  }

  return false;
};

/* ----------------------------------------
 * usePermissions Hook
 * -------------------------------------- */

export const usePermissions = (
  options = {}
) => {
  const {
    permissions = [],
    role = null,
  } = options;

  /**
   * Normalize permissions.
   */
  const normalizedPermissions =
    useMemo(() => {
      if (
        !Array.isArray(
          permissions
        )
      ) {
        return [];
      }

      return permissions.filter(
        Boolean
      );
    }, [permissions]);

  /**
   * Check a single permission.
   */
  const hasPermission =
    useCallback(
      (permission) => {
        if (!permission) {
          return false;
        }

        if (
          role ===
          ROLES.SUPER_ADMIN
        ) {
          return true;
        }

        return normalizedPermissions.some(
          (userPermission) =>
            permissionMatches(
              userPermission,
              permission
            )
        );
      },
      [
        role,
        normalizedPermissions,
      ]
    );

  /**
   * Check whether the user has
   * at least one permission.
   */
  const hasAnyPermission =
    useCallback(
      (requiredPermissions) => {
        if (
          !Array.isArray(
            requiredPermissions
          )
        ) {
          return false;
        }

        if (
          role ===
          ROLES.SUPER_ADMIN
        ) {
          return true;
        }

        return requiredPermissions.some(
          (permission) =>
            hasPermission(
              permission
            )
        );
      },
      [
        role,
        hasPermission,
      ]
    );

  /**
   * Check whether the user has
   * all required permissions.
   */
  const hasAllPermissions =
    useCallback(
      (requiredPermissions) => {
        if (
          !Array.isArray(
            requiredPermissions
          )
        ) {
          return false;
        }

        if (
          requiredPermissions.length ===
          0
        ) {
          return true;
        }

        if (
          role ===
          ROLES.SUPER_ADMIN
        ) {
          return true;
        }

        return requiredPermissions.every(
          (permission) =>
            hasPermission(
              permission
            )
        );
      },
      [
        role,
        hasPermission,
      ]
    );

  /**
   * Check role.
   */
  const hasRole = useCallback(
    (requiredRole) => {
      if (!requiredRole) {
        return false;
      }

      if (
        role ===
        ROLES.SUPER_ADMIN
      ) {
        return true;
      }

      return role === requiredRole;
    },
    [role]
  );

  /**
   * Check multiple roles.
   */
  const hasAnyRole = useCallback(
    (requiredRoles) => {
      if (
        !Array.isArray(
          requiredRoles
        )
      ) {
        return false;
      }

      if (
        role ===
        ROLES.SUPER_ADMIN
      ) {
        return true;
      }

      return requiredRoles.includes(
        role
      );
    },
    [role]
  );

  /**
   * Check whether user can
   * access a resource.
   *
   * Example:
   *
   * canAccess("users", "read")
   *
   * becomes:
   *
   * "users.read"
   */
  const canAccess = useCallback(
    (
      resource,
      action
    ) => {
      if (
        !resource ||
        !action
      ) {
        return false;
      }

      return hasPermission(
        `${resource}.${action}`
      );
    },
    [hasPermission]
  );

  /**
   * Check whether user can
   * manage a resource.
   *
   * Example:
   *
   * canManage("users")
   *
   * Checks:
   *
   * users.create
   * users.update
   * users.delete
   */
  const canManage = useCallback(
    (resource) => {
      if (!resource) {
        return false;
      }

      return hasAllPermissions([
        `${resource}.create`,
        `${resource}.update`,
        `${resource}.delete`,
      ]);
    },
    [hasAllPermissions]
  );

  /**
   * Get permission status map.
   */
  const permissionMap = useMemo(
    () => {
      return normalizedPermissions.reduce(
        (map, permission) => {
          map[permission] = true;

          return map;
        },
        {}
      );
    },
    [normalizedPermissions]
  );

  /**
   * Check whether current user
   * has administrative access.
   */
  const isAdmin = useMemo(() => {
    return (
      role === ROLES.ADMIN ||
      role ===
        ROLES.SUPER_ADMIN
    );
  }, [role]);

  /**
   * Check whether current user
   * is a super administrator.
   */
  const isSuperAdmin = useMemo(
    () => {
      return (
        role ===
        ROLES.SUPER_ADMIN
      );
    },
    [role]
  );

  return {
    // User information
    role,
    permissions:
      normalizedPermissions,

    // Permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    // Role checks
    hasRole,
    hasAnyRole,

    // Resource checks
    canAccess,
    canManage,

    // Permission map
    permissionMap,

    // Role flags
    isAdmin,
    isSuperAdmin,
  };
};

export default usePermissions;