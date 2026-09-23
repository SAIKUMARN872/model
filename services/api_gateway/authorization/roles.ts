import { PermissionRegistry } from "./permissions.js";

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissionIds: string[];
  organizationId?: string;
  systemRole?: boolean;
}

export interface CreateRoleInput {
  id: string;
  name: string;
  description?: string;
  permissionIds?: string[];
  organizationId?: string;
  systemRole?: boolean;
}

export interface RoleFilter {
  organizationId?: string;
  systemRole?: boolean;
}

export interface RoleManagerHealth {
  healthy: boolean;
  roleCount: number;
  organizationCount: number;
}

function validateText(value: string, field: string): void {
  if (!value.trim()) {
    throw new Error(`${field} cannot be empty`);
  }
}

function cloneRole(role: Role): Role {
  return {
    ...role,
    permissionIds: [...role.permissionIds],
  };
}

export class RoleManager {
  private readonly roles = new Map<string, Role>();

  constructor(
    private readonly permissionRegistry?: PermissionRegistry,
  ) {}

  createRole(input: CreateRoleInput): Role {
    validateText(input.id, "role id");
    validateText(input.name, "role name");

    if (this.roles.has(input.id)) {
      throw new Error(
        `Role already exists: ${input.id}`,
      );
    }

    const permissionIds = [
      ...(input.permissionIds ?? []),
    ];

    this.validatePermissions(permissionIds);

    const role: Role = {
      id: input.id,
      name: input.name,
      description: input.description,
      permissionIds,
      organizationId: input.organizationId,
      systemRole: input.systemRole ?? false,
    };

    this.roles.set(role.id, role);

    return cloneRole(role);
  }

  updateRole(
    roleId: string,
    updates: Partial<
      Omit<CreateRoleInput, "id">
    >,
  ): Role {
    const role = this.roles.get(roleId);

    if (!role) {
      throw new Error(`Role not found: ${roleId}`);
    }

    if (
      updates.name !== undefined &&
      !updates.name.trim()
    ) {
      throw new Error("role name cannot be empty");
    }

    if (updates.permissionIds !== undefined) {
      this.validatePermissions(
        updates.permissionIds,
      );
      role.permissionIds = [
        ...updates.permissionIds,
      ];
    }

    if (updates.name !== undefined) {
      role.name = updates.name;
    }

    if (updates.description !== undefined) {
      role.description = updates.description;
    }

    if (updates.organizationId !== undefined) {
      role.organizationId =
        updates.organizationId;
    }

    if (updates.systemRole !== undefined) {
      role.systemRole = updates.systemRole;
    }

    return cloneRole(role);
  }

  getById(roleId: string): Role | undefined {
    const role = this.roles.get(roleId);

    return role ? cloneRole(role) : undefined;
  }

  getAll(): Role[] {
    return [...this.roles.values()].map(cloneRole);
  }

  find(filter: RoleFilter = {}): Role[] {
    return this.getAll().filter((role) => {
      if (
        filter.organizationId !== undefined &&
        role.organizationId !== filter.organizationId
      ) {
        return false;
      }

      if (
        filter.systemRole !== undefined &&
        role.systemRole !== filter.systemRole
      ) {
        return false;
      }

      return true;
    });
  }

  assignPermission(
    roleId: string,
    permissionId: string,
  ): Role {
    const role = this.roles.get(roleId);

    if (!role) {
      throw new Error(`Role not found: ${roleId}`);
    }

    this.validatePermissions([permissionId]);

    if (!role.permissionIds.includes(permissionId)) {
      role.permissionIds.push(permissionId);
    }

    return cloneRole(role);
  }

  removePermission(
    roleId: string,
    permissionId: string,
  ): Role {
    const role = this.roles.get(roleId);

    if (!role) {
      throw new Error(`Role not found: ${roleId}`);
    }

    role.permissionIds =
      role.permissionIds.filter(
        (id) => id !== permissionId,
      );

    return cloneRole(role);
  }

  delete(roleId: string): boolean {
    return this.roles.delete(roleId);
  }

  hasPermission(
    roleId: string,
    permissionId: string,
  ): boolean {
    const role = this.roles.get(roleId);

    if (!role) {
      return false;
    }

    return role.permissionIds.includes(
      permissionId,
    );
  }

  getPermissions(roleId: string): string[] {
    const role = this.roles.get(roleId);

    if (!role) {
      return [];
    }

    return [...role.permissionIds];
  }

  clear(): void {
    this.roles.clear();
  }

  size(): number {
    return this.roles.size;
  }

  health(): RoleManagerHealth {
    const organizations = new Set<string>();

    for (const role of this.roles.values()) {
      if (role.organizationId) {
        organizations.add(role.organizationId);
      }
    }

    return {
      healthy: true,
      roleCount: this.roles.size,
      organizationCount: organizations.size,
    };
  }

  private validatePermissions(
    permissionIds: string[],
  ): void {
    if (!this.permissionRegistry) {
      return;
    }

    for (const permissionId of permissionIds) {
      if (!this.permissionRegistry.has(permissionId)) {
        throw new Error(
          `Permission not found: ${permissionId}`,
        );
      }
    }
  }
}