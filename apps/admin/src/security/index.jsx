/**
 * Security Guards
 *
 * Central export point for:
 * - Admin route protection
 * - Permission-based access control
 * - Role-based access control
 * - Permission checking utilities
 */

/* =================================================
   Admin Guard
================================================= */

export {
  default as AdminGuard,

  AdminOnlyGuard,

  SuperAdminGuard,

  isAdminUser,

  isSuperAdminUser,
} from "./AdminGuard";

/* =================================================
   Permission Guard
================================================= */

export {
  default as PermissionGuard,

  AnyPermissionGuard,

  AllPermissionsGuard,

  Can,

  usePermission,

  usePermissions,

  hasPermission,

  getUserPermissions,

  getUserRoles,

  isSuperAdmin,
} from "./PermissionGuard";