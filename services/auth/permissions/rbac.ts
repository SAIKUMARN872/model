import {
  PermissionService,
  permissionService,
  type PermissionAction,
  type Permission,
} from "./permission.js";

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
}

export interface RoleInput {
  name: string;
  description?: string;
  permissions?: string[];
}

export class RbacService {
  private readonly roles =
    new Map<string, Role>();

  private readonly permissionService: PermissionService;

  constructor(
    permissionStore: PermissionService = permissionService,
  ) {
    this.permissionService = permissionStore;
  }

  createRole(input: RoleInput): Role {
    const name = input.name.trim();

    if (!name) {
      throw new Error("Role name is required");
    }

    const id = name.toLowerCase();

    if (this.roles.has(id)) {
      throw new Error(
        `Role already exists: ${name}`,
      );
    }

    const permissions =
      this.validatePermissions(
        input.permissions ?? [],
      );

    const role: Role = {
      id,
      name,
      description: input.description,
      permissions,
    };

    this.roles.set(id, role);

    return this.cloneRole(role);
  }

  getRole(id: string): Role | undefined {
    const role = this.roles.get(id);

    return role
      ? this.cloneRole(role)
      : undefined;
  }

  getRoleByName(
    name: string,
  ): Role | undefined {
    return this.getRole(name.toLowerCase());
  }

  listRoles(): Role[] {
    return Array.from(this.roles.values())
      .map((role) => this.cloneRole(role));
  }

  deleteRole(id: string): boolean {
    return this.roles.delete(id);
  }

  addPermission(
    roleId: string,
    permissionId: string,
  ): Role {
    const role = this.roles.get(roleId);

    if (!role) {
      throw new Error(
        `Role not found: ${roleId}`,
      );
    }

    this.validatePermission(permissionId);

    if (!role.permissions.includes(permissionId)) {
      role.permissions.push(permissionId);
    }

    return this.cloneRole(role);
  }

  removePermission(
    roleId: string,
    permissionId: string,
  ): Role {
    const role = this.roles.get(roleId);

    if (!role) {
      throw new Error(
        `Role not found: ${roleId}`,
      );
    }

    role.permissions =
      role.permissions.filter(
        (permission) =>
          permission !== permissionId,
      );

    return this.cloneRole(role);
  }

  hasPermission(
    roleId: string,
    permissionId: string,
  ): boolean {
    const role = this.roles.get(roleId);

    if (!role) {
      return false;
    }

    return (
      role.permissions.includes(permissionId) ||
      role.permissions.includes("*:*")
    );
  }

  hasResourceAction(
    roleId: string,
    resource: string,
    action: PermissionAction,
  ): boolean {
    const permissionId =
      `${resource}:${action}`;

    return this.hasPermission(
      roleId,
      permissionId,
    );
  }

  getPermissions(
    roleId: string,
  ): Permission[] {
    const role = this.roles.get(roleId);

    if (!role) {
      return [];
    }

    return role.permissions
      .map((id) =>
        this.permissionService.get(id),
      )
      .filter(
        (
          permission,
        ): permission is Permission =>
          permission !== undefined,
      );
  }

  count(): number {
    return this.roles.size;
  }

  clear(): void {
    this.roles.clear();
  }

  health(): {
    healthy: boolean;
    roleCount: number;
  } {
    return {
      healthy: true,
      roleCount: this.roles.size,
    };
  }

  private validatePermissions(
    permissions: string[],
  ): string[] {
    const unique = [
      ...new Set(permissions),
    ];

    for (const permission of unique) {
      this.validatePermission(permission);
    }

    return unique;
  }

  private validatePermission(
    permissionId: string,
  ): void {
    if (permissionId === "*:*") {
      return;
    }

    if (
      !this.permissionService.has(
        permissionId,
      )
    ) {
      throw new Error(
        `Permission not found: ${permissionId}`,
      );
    }
  }

  private cloneRole(role: Role): Role {
    return {
      ...role,
      permissions: [
        ...role.permissions,
      ],
    };
  }
}

export const rbacService =
  new RbacService();
