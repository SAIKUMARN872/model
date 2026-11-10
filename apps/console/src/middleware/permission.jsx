import { isKnownPermission } from "../constants/permissions.jsx";

export class PermissionDeniedError extends Error {
  constructor(permission) {
    super("The requested permission has not been verified.");
    this.name = "PermissionDeniedError";
    this.code = "PERMISSION_DENIED";
    this.permission = permission;
  }
}

/**
 * UI-only permission evaluation. This is never a substitute for server-side
 * authorization, tenant isolation, or resource-level access checks.
 */
export function hasPermission(grantedPermissions, requiredPermission) {
  if (!isKnownPermission(requiredPermission)) return false;
  if (!Array.isArray(grantedPermissions)) return false;

  return grantedPermissions.includes(requiredPermission);
}

export function requirePermission(grantedPermissions, requiredPermission) {
  if (!hasPermission(grantedPermissions, requiredPermission)) {
    throw new PermissionDeniedError(requiredPermission);
  }

  return true;
}

export function filterByPermission(items, grantedPermissions, getPermission) {
  if (!Array.isArray(items) || typeof getPermission !== "function") return [];

  return items.filter(item => {
    const permission = getPermission(item);
    return permission == null ||
      hasPermission(grantedPermissions, permission);
  });
}
