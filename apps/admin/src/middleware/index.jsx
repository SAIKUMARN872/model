export {
  AuthGuard,
  withAuth,
  requireAuth,
  authMiddleware,
  isAuthenticated,
  hasAuthToken,
  getAuthToken,
  getCurrentUser,
  checkAuthentication,
  redirectToLogin,
  logout,
  clearAuthStorage,
} from "./auth";

export {
  PermissionGuard,
  withPermission,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  requirePermission,
} from "./permission";