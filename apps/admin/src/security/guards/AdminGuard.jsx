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
 * AdminGuard
 *
 * Protects routes that require administrator access.
 *
 * Access allowed for:
 * - admin
 * - super_admin
 *
 * Supports:
 * - Authentication check
 * - Loading state
 * - Role-based authorization
 * - Redirect to login
 * - Redirect to unauthorized page
 * - Preserving the original requested URL
 */

/* -------------------------------------------------
   Loading Component
------------------------------------------------- */

function AdminGuardLoading() {
  return (
    <div
      className="admin-guard-loading"
      role="status"
      aria-live="polite"
    >
      <div
        className="admin-guard-spinner"
      />

      <p>
        Verifying administrator
        access...
      </p>
    </div>
  );
}

/* -------------------------------------------------
   AdminGuard
------------------------------------------------- */

export function AdminGuard({
  children,

  allowedRoles = [
    "admin",
    "super_admin",
  ],
}) {
  const {
    user,

    isAuthenticated,

    isLoading,
  } = useAuth();

  const location =
    useLocation();

  /* -----------------------------------------------
     Authentication Loading
  ------------------------------------------------ */

  if (isLoading) {
    return (
      <AdminGuardLoading />
    );
  }

  /* -----------------------------------------------
     Authentication Check
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
     Get User Roles
  ------------------------------------------------ */

  const userRoles = [
    ...(user?.roles || []),
  ];

  if (user?.role) {
    userRoles.push(
      user.role
    );
  }

  /* -----------------------------------------------
     Super Admin
  ------------------------------------------------ */

  const isSuperAdmin =
    userRoles.includes(
      "super_admin"
    );

  if (isSuperAdmin) {
    return (
      children || (
        <Outlet />
      )
    );
  }

  /* -----------------------------------------------
     Admin Role Check
  ------------------------------------------------ */

  const hasAdminRole =
    allowedRoles.some(
      (role) =>
        userRoles.includes(
          role
        )
    );

  /* -----------------------------------------------
     Unauthorized
  ------------------------------------------------ */

  if (!hasAdminRole) {
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{
          from:
            location.pathname,
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
   Admin Only Guard
------------------------------------------------- */

export function AdminOnlyGuard({
  children,
}) {
  return (
    <AdminGuard
      allowedRoles={[
        "admin",
        "super_admin",
      ]}
    >
      {children}
    </AdminGuard>
  );
}

/* -------------------------------------------------
   Super Admin Guard
------------------------------------------------- */

export function SuperAdminGuard({
  children,
}) {
  return (
    <AdminGuard
      allowedRoles={[
        "super_admin",
      ]}
    >
      {children}
    </AdminGuard>
  );
}

/* -------------------------------------------------
   Check Admin Access
------------------------------------------------- */

export function isAdminUser(
  user
) {
  if (!user) {
    return false;
  }

  const roles = [
    ...(user.roles || []),
  ];

  if (user.role) {
    roles.push(
      user.role
    );
  }

  return (
    roles.includes(
      "admin"
    ) ||
    roles.includes(
      "super_admin"
    )
  );
}

/* -------------------------------------------------
   Check Super Admin Access
------------------------------------------------- */

export function isSuperAdminUser(
  user
) {
  if (!user) {
    return false;
  }

  const roles = [
    ...(user.roles || []),
  ];

  if (user.role) {
    roles.push(
      user.role
    );
  }

  return roles.includes(
    "super_admin"
  );
}

/* -------------------------------------------------
   Default Export
------------------------------------------------- */

export default AdminGuard;