export type PermissionAction =
    | "read"
    | "create"
    | "update"
    | "delete"
    | "approve"
    | "admin";

export interface Permission {
    resource: string;
    actions: PermissionAction[];
}

export const defaultPermissions: Permission[] = [
    { resource: "policies", actions: ["read"] },
    { resource: "reports", actions: ["read"] },
    { resource: "reviews", actions: ["read", "create"] }
];

export function hasPermission(
    permissions: readonly Permission[],
    resource: string,
    action: PermissionAction
): boolean {
    return permissions.some(
        (permission) =>
            (permission.resource === resource || permission.resource === "*") &&
            (permission.actions.includes(action) || permission.actions.includes("admin"))
    );
}
