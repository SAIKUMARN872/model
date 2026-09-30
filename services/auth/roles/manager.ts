import {
  RoleService,
  roleService,
  type Role,
  type RoleInput,
} from "./role.js";

export interface RoleAssignment {
  userId: string;
  roleId: string;
  assignedAt: Date;
}

export class RoleManager {
  private readonly assignments = new Map<string, Set<string>>();
  private readonly roleService: RoleService;

  constructor(roleStore: RoleService = roleService) {
    this.roleService = roleStore;
  }

  createRole(input: RoleInput): Role;
  createRole(
    name: string,
    permissions?: string[],
    description?: string,
    system?: boolean,
  ): Role;
  createRole(
    inputOrName: RoleInput | string,
    permissions: string[] = [],
    description?: string,
    system = false,
  ): Role {
    if (typeof inputOrName === "string") {
      return this.roleService.create({
        name: inputOrName,
        permissions,
        description,
        system,
      });
    }

    return this.roleService.create(inputOrName);
  }

  getRole(id: string): Role | undefined {
    return this.roleService.get(id);
  }

  listRoles(): Role[] {
    return this.roleService.list();
  }

  updateRole(
    id: string,
    input: {
      name?: string;
      description?: string;
      permissions?: string[];
      system?: boolean;
    },
  ): Role {
    return this.roleService.update(id, input);
  }

  deleteRole(id: string): boolean {
    return this.roleService.delete(id);
  }

  assignRole(userId: string, roleId: string): RoleAssignment {
    const normalizedUserId = userId.trim();
    const normalizedRoleId = roleId.trim().toLowerCase();

    if (!normalizedUserId) {
      throw new Error("User ID is required");
    }

    if (!normalizedRoleId) {
      throw new Error("Role ID is required");
    }

    const role = this.roleService.get(normalizedRoleId);

    if (!role) {
      throw new Error(`Role not found: ${normalizedRoleId}`);
    }

    let userRoles = this.assignments.get(normalizedUserId);

    if (!userRoles) {
      userRoles = new Set<string>();
      this.assignments.set(normalizedUserId, userRoles);
    }

    userRoles.add(normalizedRoleId);

    return {
      userId: normalizedUserId,
      roleId: normalizedRoleId,
      assignedAt: new Date(),
    };
  }

  removeRole(userId: string, roleId: string): boolean {
    const normalizedUserId = userId.trim();
    const normalizedRoleId = roleId.trim().toLowerCase();

    const userRoles = this.assignments.get(normalizedUserId);

    if (!userRoles) {
      return false;
    }

    const removed = userRoles.delete(normalizedRoleId);

    if (userRoles.size === 0) {
      this.assignments.delete(normalizedUserId);
    }

    return removed;
  }

  getUserRoles(userId: string): Role[] {
    const normalizedUserId = userId.trim();
    const userRoles = this.assignments.get(normalizedUserId);

    if (!userRoles) {
      return [];
    }

    return [...userRoles]
      .map((roleId) => this.roleService.get(roleId))
      .filter((role): role is Role => role !== undefined);
  }

  hasRole(userId: string, roleId: string): boolean {
    const normalizedUserId = userId.trim();
    const normalizedRoleId = roleId.trim().toLowerCase();

    return (
      this.assignments
        .get(normalizedUserId)
        ?.has(normalizedRoleId) ?? false
    );
  }

  hasPermission(userId: string, permission: string): boolean {
    const normalizedPermission = permission.trim().toLowerCase();

    return this.getUserRoles(userId).some(
      (role) =>
        role.permissions.includes(normalizedPermission) ||
        role.permissions.includes("*:*"),
    );
  }

  clearAssignments(): void {
    this.assignments.clear();
  }

  assignmentCount(): number {
    let count = 0;

    for (const roles of this.assignments.values()) {
      count += roles.size;
    }

    return count;
  }

  health(): {
    healthy: boolean;
    roleCount: number;
    assignmentCount: number;
  } {
    return {
      healthy: this.roleService.health().healthy,
      roleCount: this.roleService.count(),
      assignmentCount: this.assignmentCount(),
    };
  }
}

export const roleManager = new RoleManager();
