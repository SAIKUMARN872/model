import React, {
  lazy,
  Suspense,
} from "react";

import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import {
  useAuth,
} from "../providers/AuthProvider";

/* =================================================
   Lazy Loaded Pages
================================================= */

const DashboardPage = lazy(
  () =>
    import(
      "../app/dashboard/page"
    )
);

const UsersPage = lazy(
  () =>
    import(
      "../app/users/page"
    )
);

const OrganizationsPage =
  lazy(
    () =>
      import(
        "../app/organizations/page"
      )
  );

const PermissionsPage =
  lazy(
    () =>
      import(
        "../app/permissions/page"
      )
  );

const RolesPage = lazy(
  () =>
    import(
      "../app/roles/page"
    )
);

const SecurityPage = lazy(
  () =>
    import(
      "../app/security/page"
    )
);

const AuditPage = lazy(
  () =>
    import(
      "../app/audit/page"
    )
);

const BillingPage = lazy(
  () =>
    import(
      "../app/billing/page"
    )
);

const CompliancePage =
  lazy(
    () =>
      import(
        "../app/compliance/page"
      )
  );

const GovernancePage =
  lazy(
    () =>
      import(
        "../app/governance/page"
      )
  );

const SettingsPage = lazy(
  () =>
    import(
      "../app/settings/page"
    )
);

const UsagePage = lazy(
  () =>
    import(
      "../app/usage/page"
    )
);

const WorkspacesPage =
  lazy(
    () =>
      import(
        "../app/workspaces/page"
      )
  );

/* =================================================
   Loading Component
================================================= */

export function RouteLoading() {
  return (
    <div
      className="route-loading"
      role="status"
      aria-live="polite"
    >
      <div className="route-loading-spinner" />

      <p>
        Loading page...
      </p>
    </div>
  );
}

/* =================================================
   Error / 404 Page
================================================= */

export function NotFoundPage() {
  return (
    <div className="not-found-page">
      <h1>
        404
      </h1>

      <h2>
        Page Not Found
      </h2>

      <p>
        The page you are looking
        for does not exist.
      </p>

      <a href="/dashboard">
        Go to Dashboard
      </a>
    </div>
  );
}

/* =================================================
   Unauthorized Page
================================================= */

export function UnauthorizedPage() {
  return (
    <div className="unauthorized-page">
      <h1>
        403
      </h1>

      <h2>
        Access Denied
      </h2>

      <p>
        You do not have permission
        to access this page.
      </p>

      <a href="/dashboard">
        Return to Dashboard
      </a>
    </div>
  );
}

/* =================================================
   Authentication Guard
================================================= */

export function RequireAuth() {
  const {
    isAuthenticated,
    isLoading,
  } = useAuth();

  const location =
    useLocation();

  if (isLoading) {
    return (
      <RouteLoading />
    );
  }

  if (
    !isAuthenticated
  ) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname,
        }}
      />
    );
  }

  return (
    <Outlet />
  );
}

/* =================================================
   Guest Guard
================================================= */

export function RequireGuest() {
  const {
    isAuthenticated,
    isLoading,
  } = useAuth();

  if (isLoading) {
    return (
      <RouteLoading />
    );
  }

  if (
    isAuthenticated
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return (
    <Outlet />
  );
}

/* =================================================
   Role Guard
================================================= */

export function RequireRole({
  roles = [],
}) {
  const {
    user,
    isAuthenticated,
    isLoading,
  } = useAuth();

  if (isLoading) {
    return (
      <RouteLoading />
    );
  }

  if (
    !isAuthenticated
  ) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  const userRoles = [
    ...(user?.roles || []),
  ];

  if (user?.role) {
    userRoles.push(
      user.role
    );
  }

  const isAuthorized =
    roles.length === 0 ||
    roles.some(
      (role) =>
        userRoles.includes(
          role
        )
    );

  if (!isAuthorized) {
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  return (
    <Outlet />
  );
}

/* =================================================
   Permission Guard
================================================= */

export function RequirePermission({
  permissions = [],
}) {
  const {
    user,
    isAuthenticated,
    isLoading,
  } = useAuth();

  if (isLoading) {
    return (
      <RouteLoading />
    );
  }

  if (
    !isAuthenticated
  ) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  const userPermissions =
    user?.permissions ||
    [];

  const isSuperAdmin =
    user?.role ===
      "super_admin" ||
    user?.roles?.includes(
      "super_admin"
    );

  const hasPermission =
    isSuperAdmin ||
    permissions.length ===
      0 ||
    permissions.some(
      (permission) =>
        userPermissions.includes(
          permission
        )
    );

  if (
    !hasPermission
  ) {
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  return (
    <Outlet />
  );
}

/* =================================================
   Protected Layout
================================================= */

export function ProtectedRoutes() {
  return (
    <RequireAuth>
      <Outlet />
    </RequireAuth>
  );
}

/* =================================================
   Page Wrapper
================================================= */

export function LazyPage({
  children,
}) {
  return (
    <Suspense
      fallback={
        <RouteLoading />
      }
    >
      {children}
    </Suspense>
  );
}

/* =================================================
   Application Routes
================================================= */

export function AppRoutes() {
  return (
    <Routes>

      {/* -------------------------------------------
          Root
      -------------------------------------------- */}

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      {/* -------------------------------------------
          Public Routes
      -------------------------------------------- */}

      <Route element={<RequireGuest />}>

        <Route
          path="/login"
          element={
            <div>
              Login Page
            </div>
          }
        />

      </Route>

      {/* -------------------------------------------
          Protected Routes
      -------------------------------------------- */}

      <Route
        element={
          <ProtectedRoutes />
        }
      >

        {/* Dashboard */}

        <Route
          path="/dashboard"
          element={
            <LazyPage>
              <DashboardPage />
            </LazyPage>
          }
        />

        {/* Users */}

        <Route
          path="/users"
          element={
            <LazyPage>
              <UsersPage />
            </LazyPage>
          }
        />

        {/* Organizations */}

        <Route
          path="/organizations"
          element={
            <LazyPage>
              <OrganizationsPage />
            </LazyPage>
          }
        />

        {/* Permissions */}

        <Route
          path="/permissions"
          element={
            <LazyPage>
              <PermissionsPage />
            </LazyPage>
          }
        />

        {/* Roles */}

        <Route
          path="/roles"
          element={
            <LazyPage>
              <RolesPage />
            </LazyPage>
          }
        />

        {/* Security */}

        <Route
          path="/security"
          element={
            <LazyPage>
              <SecurityPage />
            </LazyPage>
          }
        />

        {/* Audit */}

        <Route
          path="/audit"
          element={
            <LazyPage>
              <AuditPage />
            </LazyPage>
          }
        />

        {/* Billing */}

        <Route
          path="/billing"
          element={
            <LazyPage>
              <BillingPage />
            </LazyPage>
          }
        />

        {/* Compliance */}

        <Route
          path="/compliance"
          element={
            <LazyPage>
              <CompliancePage />
            </LazyPage>
          }
        />

        {/* Governance */}

        <Route
          path="/governance"
          element={
            <LazyPage>
              <GovernancePage />
            </LazyPage>
          }
        />

        {/* Settings */}

        <Route
          path="/settings"
          element={
            <LazyPage>
              <SettingsPage />
            </LazyPage>
          }
        />

        {/* Usage */}

        <Route
          path="/usage"
          element={
            <LazyPage>
              <UsagePage />
            </LazyPage>
          }
        />

        {/* Workspaces */}

        <Route
          path="/workspaces"
          element={
            <LazyPage>
              <WorkspacesPage />
            </LazyPage>
          }
        />

      </Route>

      {/* -------------------------------------------
          Unauthorized
      -------------------------------------------- */}

      <Route
        path="/unauthorized"
        element={
          <UnauthorizedPage />
        }
      />

      {/* -------------------------------------------
          404
      -------------------------------------------- */}

      <Route
        path="*"
        element={
          <NotFoundPage />
        }
      />

    </Routes>
  );
}

/* =================================================
   Route Configuration
================================================= */

export const ROUTES = {
  HOME: "/",

  LOGIN: "/login",

  DASHBOARD:
    "/dashboard",

  USERS: "/users",

  ORGANIZATIONS:
    "/organizations",

  PERMISSIONS:
    "/permissions",

  ROLES: "/roles",

  SECURITY:
    "/security",

  AUDIT: "/audit",

  BILLING:
    "/billing",

  COMPLIANCE:
    "/compliance",

  GOVERNANCE:
    "/governance",

  SETTINGS:
    "/settings",

  USAGE:
    "/usage",

  WORKSPACES:
    "/workspaces",

  UNAUTHORIZED:
    "/unauthorized",
};

/* =================================================
   Default Export
================================================= */

export default AppRoutes;