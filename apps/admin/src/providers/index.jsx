import AdminProvider, {
  useAdmin,
  useAdminAuth,
  useAdminOrganization,
  useAdminNotifications,
} from "./AdminProvider";

import AuthProvider, {
  useAuth,
  useRequireAuth,
} from "./AuthProvider";

import ThemeProvider, {
  useTheme,
} from "./ThemeProvider";

/* -------------------------------------------------
   Provider Exports
------------------------------------------------- */

export {
  AdminProvider,
  AuthProvider,
  ThemeProvider,
};

/* -------------------------------------------------
   Admin Hooks
------------------------------------------------- */

export {
  useAdmin,
  useAdminAuth,
  useAdminOrganization,
  useAdminNotifications,
};

/* -------------------------------------------------
   Authentication Hooks
------------------------------------------------- */

export {
  useAuth,
  useRequireAuth,
};

/* -------------------------------------------------
   Theme Hooks
------------------------------------------------- */

export {
  useTheme,
};

/* -------------------------------------------------
   Combined Provider
------------------------------------------------- */

export function AppProviders({
  children,
}) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AdminProvider>
          {children}
        </AdminProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

/* -------------------------------------------------
   Default Export
------------------------------------------------- */

export default AppProviders;