export interface Permission {
  id: string;
  resource: string;
  action: string;
  description?: string;
}

export interface PermissionCheck {
  resource: string;
  action: string;
}

export interface PermissionRegistryHealth {
  healthy: boolean;
  permissionCount: number;
}

function validateText(value: string, field: string): void {
  if (!value.trim()) {
    throw new Error(`${field} cannot be empty`);
  }
}

export class PermissionRegistry {
  private readonly permissions = new Map<string, Permission>();

  register(permission: Permission): Permission {
    validateText(permission.id, "permission id");
    validateText(permission.resource, "resource");
    validateText(permission.action, "action");

    if (this.permissions.has(permission.id)) {
      throw new Error(
        `Permission already exists: ${permission.id}`,
      );
    }

    const normalized: Permission = {
      id: permission.id,
      resource: permission.resource,
      action: permission.action,
      description: permission.description,
    };

    this.permissions.set(permission.id, normalized);

    return { ...normalized };
  }

  upsert(permission: Permission): Permission {
    validateText(permission.id, "permission id");
    validateText(permission.resource, "resource");
    validateText(permission.action, "action");

    const normalized: Permission = {
      id: permission.id,
      resource: permission.resource,
      action: permission.action,
      description: permission.description,
    };

    this.permissions.set(permission.id, normalized);

    return { ...normalized };
  }

  getById(id: string): Permission | undefined {
    return this.permissions.get(id)
      ? { ...this.permissions.get(id)! }
      : undefined;
  }

  getAll(): Permission[] {
    return [...this.permissions.values()].map(
      (permission) => ({ ...permission }),
    );
  }

  findByResource(resource: string): Permission[] {
    validateText(resource, "resource");

    return this.getAll().filter(
      (permission) =>
        permission.resource === resource,
    );
  }

  has(id: string): boolean {
    return this.permissions.has(id);
  }

  remove(id: string): boolean {
    return this.permissions.delete(id);
  }

  clear(): void {
    this.permissions.clear();
  }

  size(): number {
    return this.permissions.size;
  }

  checkPermission(
    permissionId: string,
    check: PermissionCheck,
  ): boolean {
    const permission =
      this.permissions.get(permissionId);

    if (!permission) {
      return false;
    }

    return (
      permission.resource === check.resource &&
      permission.action === check.action
    );
  }

  health(): PermissionRegistryHealth {
    return {
      healthy: true,
      permissionCount: this.permissions.size,
    };
  }
}