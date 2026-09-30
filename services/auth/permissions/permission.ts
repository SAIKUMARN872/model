export type PermissionAction =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "execute"
  | "manage";

export interface Permission {
  id: string;
  resource: string;
  action: PermissionAction;
  description?: string;
}

export interface PermissionInput {
  resource: string;
  action: PermissionAction;
  description?: string;
}

export class PermissionService {
  private readonly permissions =
    new Map<string, Permission>();

  create(input: PermissionInput): Permission {
    const resource = input.resource.trim();

    if (!resource) {
      throw new Error("Permission resource is required");
    }

    const id = `${resource}:${input.action}`;

    const existing = this.permissions.get(id);

    if (existing) {
      return this.clone(existing);
    }

    const permission: Permission = {
      id,
      resource,
      action: input.action,
      description: input.description,
    };

    this.permissions.set(id, permission);

    return this.clone(permission);
  }

  get(id: string): Permission | undefined {
    const permission = this.permissions.get(id);

    return permission
      ? this.clone(permission)
      : undefined;
  }

  getByResource(resource: string): Permission[] {
    return Array.from(this.permissions.values())
      .filter(
        (permission) =>
          permission.resource === resource,
      )
      .map((permission) => this.clone(permission));
  }

  list(): Permission[] {
    return Array.from(this.permissions.values())
      .map((permission) => this.clone(permission));
  }

  has(id: string): boolean {
    return this.permissions.has(id);
  }

  delete(id: string): boolean {
    return this.permissions.delete(id);
  }

  count(): number {
    return this.permissions.size;
  }

  clear(): void {
    this.permissions.clear();
  }

  health(): {
    healthy: boolean;
    permissionCount: number;
  } {
    return {
      healthy: true,
      permissionCount: this.permissions.size,
    };
  }

  private clone(
    permission: Permission,
  ): Permission {
    return {
      ...permission,
    };
  }
}

export const permissionService =
  new PermissionService();
