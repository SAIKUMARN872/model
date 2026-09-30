export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  system: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleInput {
  name: string;
  description?: string;
  permissions?: string[];
  system?: boolean;
}

export class RoleService {
  private readonly roles =
    new Map<string, Role>();

  create(input: RoleInput): Role {
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

    const now = new Date();

    const role: Role = {
      id,
      name,
      description: input.description,
      permissions: [
        ...new Set(input.permissions ?? []),
      ],
      system: input.system ?? false,
      createdAt: now,
      updatedAt: now,
    };

    this.roles.set(id, role);

    return this.clone(role);
  }

  get(id: string): Role | undefined {
    const role = this.roles.get(id);

    return role
      ? this.clone(role)
      : undefined;
  }

  getByName(
    name: string,
  ): Role | undefined {
    return this.get(name.toLowerCase());
  }

  list(): Role[] {
    return Array.from(this.roles.values())
      .map((role) => this.clone(role));
  }

  update(
    id: string,
    input: Partial<RoleInput>,
  ): Role {
    const role = this.roles.get(id);

    if (!role) {
      throw new Error(
        `Role not found: ${id}`,
      );
    }

    if (
      input.name !== undefined &&
      input.name.trim() === ""
    ) {
      throw new Error(
        "Role name cannot be empty",
      );
    }

    if (input.name !== undefined) {
      const newName = input.name.trim();
      const newId = newName.toLowerCase();

      if (
        newId !== id &&
        this.roles.has(newId)
      ) {
        throw new Error(
          `Role already exists: ${newName}`,
        );
      }

      this.roles.delete(id);
      role.id = newId;
      role.name = newName;
    }

    if (input.description !== undefined) {
      role.description =
        input.description;
    }

    if (input.permissions !== undefined) {
      role.permissions = [
        ...new Set(input.permissions),
      ];
    }

    if (input.system !== undefined) {
      role.system = input.system;
    }

    role.updatedAt = new Date();

    this.roles.set(role.id, role);

    return this.clone(role);
  }

  addPermission(
    id: string,
    permission: string,
  ): Role {
    const role = this.roles.get(id);

    if (!role) {
      throw new Error(
        `Role not found: ${id}`,
      );
    }

    if (!permission.trim()) {
      throw new Error(
        "Permission is required",
      );
    }

    if (!role.permissions.includes(permission)) {
      role.permissions.push(permission);
      role.updatedAt = new Date();
    }

    return this.clone(role);
  }

  removePermission(
    id: string,
    permission: string,
  ): Role {
    const role = this.roles.get(id);

    if (!role) {
      throw new Error(
        `Role not found: ${id}`,
      );
    }

    role.permissions =
      role.permissions.filter(
        (item) => item !== permission,
      );

    role.updatedAt = new Date();

    return this.clone(role);
  }

  hasPermission(
    id: string,
    permission: string,
  ): boolean {
    const role = this.roles.get(id);

    if (!role) {
      return false;
    }

    return (
      role.permissions.includes(permission) ||
      role.permissions.includes("*:*")
    );
  }

  delete(id: string): boolean {
    const role = this.roles.get(id);

    if (!role) {
      return false;
    }

    if (role.system) {
      throw new Error(
        "System roles cannot be deleted",
      );
    }

    return this.roles.delete(id);
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

  private clone(role: Role): Role {
    return {
      ...role,
      permissions: [...role.permissions],
      createdAt: new Date(role.createdAt),
      updatedAt: new Date(role.updatedAt),
    };
  }
}

export const roleService =
  new RoleService();
