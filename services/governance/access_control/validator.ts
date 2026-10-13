import { hasPermission, type PermissionAction, type Permission } from "./permissions.js";
import { resolveRole } from "./roles.js";

export interface AccessRequest {
    role: string;
    resource: string;
    action: PermissionAction;
    extraPermissions?: Permission[];
}

export interface AccessDecision {
    allowed: boolean;
    reason: string;
}

export function validateAccess(request: AccessRequest): AccessDecision {
    const role = resolveRole(request.role);
    if (!role) return { allowed: false, reason: "Unknown role" };

    const permissions = [...role.permissions, ...(request.extraPermissions ?? [])];
    const allowed = hasPermission(permissions, request.resource, request.action);

    return {
        allowed,
        reason: allowed ? "Permission granted" : "Permission denied"
    };
}
