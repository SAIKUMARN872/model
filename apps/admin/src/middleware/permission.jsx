import React, {
  useEffect,
  useState,
} from "react";

import {
  getCurrentUser,
} from "./auth";

/**
 * Permission Middleware
 *
 * Responsibilities:
 * - Check user permissions
 * - Check user roles
 * - Protect UI components
 * - Protect admin routes
 * - Support any/all permission checks
 * - Provide reusable authorization guards
 */

/**
 * Get permissions from the current user.
 */
export function getUserPermissions(
  user = null
) {
  try {
    const currentUser =
      user ||
      getCurrentUser();

    if (!currentUser) {
      return [];
    }

    // Support different backend
    // permission structures.
    if (
      Array.isArray(
        currentUser.permissions
      )
    ) {
      return currentUser.permissions;
    }

    if (
      currentUser.permissions &&
      typeof currentUser.permissions ===
        "object"
    ) {
      return Object.keys(
        currentUser.permissions
      ).filter(
        (permission) =>
          currentUser.permissions[
            permission
          ]
      );
    }

    if (
      Array.isArray(
        currentUser.permissionList
      )
    ) {
      return currentUser.permissionList;
    }

    return [];
  } catch (error) {
    console.error(
      "Failed to get user permissions:",
      error
    );

    return [];
  }
}

/**
 * Get roles from the current user.
 */
export function getUserRoles(
  user = null
) {
  try {
    const currentUser =
      user ||
      getCurrentUser();

    if (!currentUser) {
      return [];
    }

    if (
      Array.isArray(
        currentUser.roles
      )
    ) {
      return currentUser.roles;
    }

    if (
      typeof currentUser.role ===
      "string"
    ) {
      return [
        currentUser.role,
      ];
    }

    if (
      Array.isArray(
        currentUser.role
      )
    ) {
      return currentUser.role;
    }

    return [];
  } catch (error) {
    console.error(
      "Failed to get user roles:",
      error
    );

    return [];
  }
}

/**
 * Check whether a user has
 * a specific permission.
 *
 * Supports:
 * - users.read
 * - users.create
 * - users.update
 * - users.delete
 * - *
 */
export function hasPermission(
  permission,
  user = null
) {
  if (!permission) {
    return false;
  }

  const permissions =
    getUserPermissions(
      user
    );

  // Super permission
  if (
    permissions.includes("*")
  ) {
    return true;
  }

  // Exact permission
  if (
    permissions.includes(
      permission
    )
  ) {
    return true;
  }

  // Wildcard permission
  //
  // Example:
  // users.*
  //
  // Grants:
  // users.read
  // users.create
  // users.update
  // users.delete
  const parts =
    permission.split(".");

  if (
    parts.length > 1
  ) {
    const resource =
      parts[0];

    if (
      permissions.includes(
        `${resource}.*`
      )
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Check whether user has
 * at least one permission.
 */
export function hasAnyPermission(
  permissions,
  user = null
) {
  if (
    !Array.isArray(
      permissions
    ) ||
    permissions.length === 0
  ) {
    return false;
  }

  return permissions.some(
    (permission) =>
      hasPermission(
        permission,
        user
      )
  );
}

/**
 * Check whether user has
 * all required permissions.
 */
export function hasAllPermissions(
  permissions,
  user = null
) {
  if (
    !Array.isArray(
      permissions
    ) ||
    permissions.length === 0
  ) {
    return true;
  }

  return permissions.every(
    (permission) =>
      hasPermission(
        permission,
        user
      )
  );
}

/**
 * Check whether user has
 * a specific role.
 */
export function hasRole(
  role,
  user = null
) {
  if (!role) {
    return false;
  }

  const roles =
    getUserRoles(user);

  const normalizedRoles =
    roles.map(
      (item) =>
        String(item)
          .toLowerCase()
    );

  return normalizedRoles.includes(
    String(role).toLowerCase()
  );
}

/**
 * Check whether user has
 * at least one role.
 */
export function hasAnyRole(
  roles,
  user = null
) {
  if (
    !Array.isArray(roles) ||
    roles.length === 0
  ) {
    return false;
  }

  return roles.some(
    (role) =>
      hasRole(
        role,
        user
      )
  );
}

/**
 * Check whether user has
 * all required roles.
 */
export function hasAllRoles(
  roles,
  user = null
) {
  if (
    !Array.isArray(roles) ||
    roles.length === 0
  ) {
    return true;
  }

  return roles.every(
    (role) =>
      hasRole(
        role,
        user
      )
  );
}

/**
 * Check authorization.
 */
export function checkPermission(
  options = {}
) {
  const {
    permission,
    permissions = [],
    requireAll = true,
    role,
    roles = [],
    user = null,
  } = options;

  const currentUser =
    user ||
    getCurrentUser();

  // Permission check
  let permissionAllowed =
    true;

  if (permission) {
    permissionAllowed =
      hasPermission(
        permission,
        currentUser
      );
  }

  if (
    permissions.length > 0
  ) {
    permissionAllowed =
      requireAll
        ? hasAllPermissions(
            permissions,
            currentUser
          )
        : hasAnyPermission(
            permissions,
            currentUser
          );
  }

  // Role check
  let roleAllowed = true;

  if (role) {
    roleAllowed =
      hasRole(
        role,
        currentUser
      );
  }

  if (
    roles.length > 0
  ) {
    roleAllowed =
      requireAll
        ? hasAllRoles(
            roles,
            currentUser
          )
        : hasAnyRole(
            roles,
            currentUser
          );
  }

  return {
    allowed:
      permissionAllowed &&
      roleAllowed,

    user:
      currentUser,

    permissions:
      getUserPermissions(
        currentUser
      ),

    roles:
      getUserRoles(
        currentUser
      ),
  };
}

/**
 * Require a specific permission.
 */
export function requirePermission(
  permission,
  options = {}
) {
  return checkPermission({
    ...options,
    permission,
  }).allowed;
}

/**
 * React Permission Guard.
 *
 * Usage:
 *
 * <PermissionGuard
 *   permission="users.read"
 * >
 *   <UsersPage />
 * </PermissionGuard>
 */
export function PermissionGuard({
  children,
  permission,
  permissions = [],
  requireAll = true,
  role,
  roles = [],
  user,
  fallback = null,
  loadingComponent,
  onDenied,
}) {
  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    allowed,
    setAllowed,
  ] = useState(false);

  useEffect(() => {
    let mounted = true;

    const verifyPermission =
      async () => {
        try {
          const result =
            checkPermission({
              permission,
              permissions,
              requireAll,
              role,
              roles,
              user,
            });

          if (!mounted) {
            return;
          }

          setAllowed(
            result.allowed
          );

          setLoading(false);

          if (
            !result.allowed &&
            typeof onDenied ===
              "function"
          ) {
            onDenied(result);
          }
        } catch (error) {
          console.error(
            "Permission check failed:",
            error
          );

          if (!mounted) {
            return;
          }

          setAllowed(false);
          setLoading(false);
        }
      };

    verifyPermission();

    return () => {
      mounted = false;
    };
  }, [
    permission,
    permissions,
    requireAll,
    role,
    roles,
    user,
    onDenied,
  ]);

  if (loading) {
    if (
      loadingComponent
    ) {
      return loadingComponent;
    }

    return (
      <div
        style={
          styles.loadingContainer
        }
      >
        Checking permissions...
      </div>
    );
  }

  if (!allowed) {
    return fallback;
  }

  return children;
}

/**
 * Higher-order component
 * for permission protection.
 *
 * Example:
 *
 * export default withPermission(
 *   UsersPage,
 *   {
 *     permission:
 *       "users.read"
 *   }
 * );
 */
export function withPermission(
  Component,
  options = {}
) {
  function ProtectedComponent(
    props
  ) {
    return (
      <PermissionGuard
        {...options}
      >
        <Component
          {...props}
        />
      </PermissionGuard>
    );
  }

  ProtectedComponent.displayName =
    `withPermission(${
      Component.displayName ||
      Component.name ||
      "Component"
    })`;

  return ProtectedComponent;
}

/**
 * Check access to a resource.
 *
 * Example:
 *
 * canAccess(
 *   "users",
 *   "read"
 * );
 *
 * Returns:
 * users.read
 */
export function canAccess(
  resource,
  action,
  user = null
) {
  if (
    !resource ||
    !action
  ) {
    return false;
  }

  return hasPermission(
    `${resource}.${action}`,
    user
  );
}

/**
 * Create permission checker
 * for a specific user.
 */
export function createPermissionChecker(
  user = null
) {
  return {
    hasPermission:
      (permission) =>
        hasPermission(
          permission,
          user
        ),

    hasAnyPermission:
      (permissions) =>
        hasAnyPermission(
          permissions,
          user
        ),

    hasAllPermissions:
      (permissions) =>
        hasAllPermissions(
          permissions,
          user
        ),

    hasRole:
      (role) =>
        hasRole(
          role,
          user
        ),

    hasAnyRole:
      (roles) =>
        hasAnyRole(
          roles,
          user
        ),

    hasAllRoles:
      (roles) =>
        hasAllRoles(
          roles,
          user
        ),

    canAccess:
      (
        resource,
        action
      ) =>
        canAccess(
          resource,
          action,
          user
        ),
  };
}

const styles = {
  loadingContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent:
      "center",
    minHeight: "100px",
    color: "#64748b",
    fontSize: "14px",
  },
};