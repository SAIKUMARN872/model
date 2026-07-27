import React from "react";

import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import {
  useAuth,
} from "../../providers/AuthProvider";

/**
 * PermissionGuard
 *
 * Protects routes and components based on permissions.
 *
 * Supports:
 * - Authentication check
 * - Loading state
 * - Single permission
 * - Multiple permissions
 * - "any" permission mode
 * - "all" permission mode
 * - Super admin bypass
 * - Unauthorized redirect
 * - Preserving requested URL
 */

/* -------------------------------------------------
   Loading Component
------------------------------------------------- */

function PermissionGuardLoading() {
  return (
    <div
      className="permission-guard-loading"
      role="status"
      aria-live="polite"
    >
      <div
        className="permission-guard-spinner"
      />

      <p>
        Checking permissions...
      </p>
    </div>
  );
}

/* -------------------------------------------------
   Normalize Permissions
------------------------------------------------- */

function normalizePermissions(
  permissions
) {
  if (!permissions) {
    return [];
  }

  if (
    typeof permissions ===
    "string"
  ) {
    return [
      permissions,
    ];
  }

  if (
    Array.isArray(
      permissions
    )
  ) {
    return permissions.filter(
      Boolean
    );
  }

  return [];
}

/* -------------------------------------------------
   Get User Permissions
------------------------------------------------- */

export function getUserPermissions(
  user
) {
  if (!user) {
    return [];
  }

  const permissions =
    new Set();

  /* Direct permissions */

  if (
    Array.isArray(
      user.permissions
    )
  ) {
    user.permissions.forEach(
      (permission) => {
        permissions.add(
          permission
        );
      }
    );
  }

  /* Permission objects */

  if (
    Array.isArray(
      user.permissionList
    )
  ) {
    user.permissionList.forEach(
      (permission) => {
        if (
          typeof permission ===
          "string"
        ) {
          permissions.add(
            permission
          );
        }

        if (
          typeof permission ===
            "object" &&
          permission.name
        ) {
          permissions.add(
            permission.name
          );
        }

        if (
          typeof permission ===
            "object" &&
          permission.key
        ) {
          permissions.add(
            permission.key
          );
        }
      }
    );
  }

  return Array.from(
    permissions
  );
}

/* -------------------------------------------------
   Get User Roles
------------------------------------------------- */

export function getUserRoles(
  user
) {
  if (!user) {
    return [];
  }

  const roles = [
    ...(user.roles || []),
  ];

  if (user.role) {
    roles.push(
      user.role
    );
  }

  return [
    ...new Set(
      roles
    ),
  ];
}

/* -------------------------------------------------
   Check Super Admin
------------------------------------------------- */

export function isSuperAdmin(
  user
) {
  const roles =
    getUserRoles(
      user
    );

  return roles.includes(
    "super_admin"
  );
}

/* -------------------------------------------------
   Check Permission
------------------------------------------------- */

export function hasPermission(
  user,
  requiredPermissions,
  mode = "any"
) {
  /* Super admin bypass */

  if (
    isSuperAdmin(
      user
    )
  ) {
    return true;
  }

  const required =
    normalizePermissions(
      requiredPermissions
    );

  /* No permission required */

  if (
    required.length === 0
  ) {
    return true;
  }

  const userPermissions =
    getUserPermissions(
      user
    );

  /* Wildcard permission */

  if (
    userPermissions.includes(
      "*"
    )
  ) {
    return true;
  }

  /* Full wildcard */

  if (
    userPermissions.includes(
      "*:*"
    )
  ) {
    return true;
  }

  /* ALL permissions required */

  if (
    mode === "all"
  ) {
    return required.every(
      (permission) =>
        userPermissions.includes(
          permission
        )
    );
  }

  /* ANY permission required */

  return required.some(
    (permission) =>
      userPermissions.includes(
        permission
      )
  );
}

/* -------------------------------------------------
   Permission Guard
------------------------------------------------- */

export function PermissionGuard({
  permission,

  permissions,

  mode = "any",

  children,
}) {
  const {
    user,

    isAuthenticated,

    isLoading,
  } = useAuth();

  const location =
    useLocation();

  /* -----------------------------------------------
     Loading
  ------------------------------------------------ */

  if (isLoading) {
    return (
      <PermissionGuardLoading />
    );
  }

  /* -----------------------------------------------
     Authentication
  ------------------------------------------------ */

  if (
    !isAuthenticated
  ) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname +
            location.search,
        }}
      />
    );
  }

  /* -----------------------------------------------
     Combine Permissions
  ------------------------------------------------ */

  const requiredPermissions =
    normalizePermissions(
      permission
    ).concat(
      normalizePermissions(
        permissions
      )
    );

  /* -----------------------------------------------
     Authorization
  ------------------------------------------------ */

  const authorized =
    hasPermission(
      user,
      requiredPermissions,
      mode
    );

  /* -----------------------------------------------
     Access Denied
  ------------------------------------------------ */

  if (!authorized) {
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{
          from:
            location.pathname,

          requiredPermissions,
        }}
      />
    );
  }

  /* -----------------------------------------------
     Authorized
  ------------------------------------------------ */

  return (
    children || (
      <Outlet />
    )
  );
}

/* -------------------------------------------------
   Any Permission Guard
------------------------------------------------- */

export function AnyPermissionGuard({
  permissions,

  children,
}) {
  return (
    <PermissionGuard
      permissions={
        permissions
      }
      mode="any"
    >
      {children}
    </PermissionGuard>
  );
}

/* -------------------------------------------------
   All Permissions Guard
------------------------------------------------- */

export function AllPermissionsGuard({
  permissions,

  children,
}) {
  return (
    <PermissionGuard
      permissions={
        permissions
      }
      mode="all"
    >
      {children}
    </PermissionGuard>
  );
}

/* -------------------------------------------------
   Permission Component
------------------------------------------------- */

export function Can({
  permission,

  permissions,

  mode = "any",

  children,

  fallback = null,
}) {
  const {
    user,
  } = useAuth();

  const requiredPermissions =
    normalizePermissions(
      permission
    ).concat(
      normalizePermissions(
        permissions
      )
    );

  const authorized =
    hasPermission(
      user,
      requiredPermissions,
      mode
    );

  if (!authorized) {
    return fallback;
  }

  return (
    <>
      {children}
    </>
  );
}

/* -------------------------------------------------
   Permission Check Hook
------------------------------------------------- */

export function usePermission(
  permission,
  mode = "any"
) {
  const {
    user,
  } = useAuth();

  return hasPermission(
    user,
    permission,
    mode
  );
}

/* -------------------------------------------------
   Multiple Permission Check Hook
------------------------------------------------- */

export function usePermissions(
  permissions
) {
  const {
    user,
  } = useAuth();

  const normalized =
    normalizePermissions(
      permissions
    );

  return {
    canAny:
      hasPermission(
        user,
        normalized,
        "any"
      ),

    canAll:
      hasPermission(
        user,
        normalized,
        "all"
      ),

    permissions:
      getUserPermissions(
        user
      ),
  };
}

/* -------------------------------------------------
   Default Export
------------------------------------------------- */

export default PermissionGuard;