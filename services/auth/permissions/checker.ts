import {
  rbacService,
} from "./rbac.js";

export interface PermissionCheckRequest {
  roleId: string;
  permissionId: string;
}

export interface PermissionCheckResult {
  allowed: boolean;
  roleId: string;
  permissionId: string;
  reason: string;
}

export class PermissionChecker {
  check(
    request: PermissionCheckRequest,
  ): PermissionCheckResult {
    const roleId = request.roleId.trim();
    const permissionId =
      request.permissionId.trim();

    if (!roleId) {
      return {
        allowed: false,
        roleId,
        permissionId,
        reason: "Role ID is required",
      };
    }

    if (!permissionId) {
      return {
        allowed: false,
        roleId,
        permissionId,
        reason: "Permission ID is required",
      };
    }

    const role = rbacService.getRole(roleId);

    if (!role) {
      return {
        allowed: false,
        roleId,
        permissionId,
        reason: "Role not found",
      };
    }

    const allowed =
      rbacService.hasPermission(
        roleId,
        permissionId,
      );

    return {
      allowed,
      roleId,
      permissionId,
      reason: allowed
        ? "Permission granted"
        : "Permission denied",
    };
  }

  checkAny(
    roleId: string,
    permissionIds: string[],
  ): PermissionCheckResult {
    for (const permissionId of permissionIds) {
      const result = this.check({
        roleId,
        permissionId,
      });

      if (result.allowed) {
        return result;
      }
    }

    return {
      allowed: false,
      roleId,
      permissionId:
        permissionIds.join(","),
      reason: "None of the permissions are granted",
    };
  }

  checkAll(
    roleId: string,
    permissionIds: string[],
  ): PermissionCheckResult {
    for (const permissionId of permissionIds) {
      const result = this.check({
        roleId,
        permissionId,
      });

      if (!result.allowed) {
        return result;
      }
    }

    return {
      allowed: true,
      roleId,
      permissionId:
        permissionIds.join(","),
      reason: "All permissions granted",
    };
  }

  can(
    roleId: string,
    permissionId: string,
  ): boolean {
    return this.check({
      roleId,
      permissionId,
    }).allowed;
  }

  canAny(
    roleId: string,
    permissionIds: string[],
  ): boolean {
    return this.checkAny(
      roleId,
      permissionIds,
    ).allowed;
  }

  canAll(
    roleId: string,
    permissionIds: string[],
  ): boolean {
    return this.checkAll(
      roleId,
      permissionIds,
    ).allowed;
  }
}

export const permissionChecker =
  new PermissionChecker();
