export type Permission =
  | "read"
  | "write"
  | "create"
  | "update"
  | "delete"
  | "manage";

export const PERMISSIONS: Permission[] = [
  "read",
  "write",
  "create",
  "update",
  "delete",
  "manage",
];

export function hasPermission(
  permissions: Permission[],
  requiredPermission: Permission
): boolean {
  return permissions.includes(
    requiredPermission
  );
}

export function addPermission(
  permissions: Permission[],
  permission: Permission
): Permission[] {
  if (
    permissions.includes(permission)
  ) {
    return [...permissions];
  }

  return [
    ...permissions,
    permission,
  ];
}

export function removePermission(
  permissions: Permission[],
  permission: Permission
): Permission[] {
  return permissions.filter(
    (item) => item !== permission
  );
}

export function canRead(
  permissions: Permission[]
): boolean {
  return hasPermission(
    permissions,
    "read"
  );
}

export function canWrite(
  permissions: Permission[]
): boolean {
  return hasPermission(
    permissions,
    "write"
  );
}

export function canCreate(
  permissions: Permission[]
): boolean {
  return hasPermission(
    permissions,
    "create"
  );
}

export function canUpdate(
  permissions: Permission[]
): boolean {
  return hasPermission(
    permissions,
    "update"
  );
}

export function canDelete(
  permissions: Permission[]
): boolean {
  return hasPermission(
    permissions,
    "delete"
  );
}

export function canManage(
  permissions: Permission[]
): boolean {
  return hasPermission(
    permissions,
    "manage"
  );
}