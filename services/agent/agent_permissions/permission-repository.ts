import {
  AgentPermission,
  CreatePermissionInput,
  UpdatePermissionInput,
} from "./permission-schema.js";

export interface PermissionRepository {
  create(input: CreatePermissionInput): AgentPermission;
  findById(id: string): AgentPermission | undefined;
  findByAgentId(agentId: string): AgentPermission[];
  findAll(): AgentPermission[];
  update(
    id: string,
    input: UpdatePermissionInput,
  ): AgentPermission | undefined;
  delete(id: string): boolean;
}

export class InMemoryPermissionRepository
  implements PermissionRepository
{
  private readonly permissions =
    new Map<string, AgentPermission>();

  create(
    input: CreatePermissionInput,
  ): AgentPermission {
    const now = new Date().toISOString();

    const permission: AgentPermission = {
      id: `permission_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 10)}`,
      agentId: input.agentId,
      subjectId: input.subjectId,
      resource: input.resource,
      action: input.action,
      effect: input.effect ?? "allow",
      createdAt: now,
      updatedAt: now,
    };

    this.permissions.set(
      permission.id,
      permission,
    );

    return { ...permission };
  }

  findById(
    id: string,
  ): AgentPermission | undefined {
    const permission =
      this.permissions.get(id);

    return permission
      ? { ...permission }
      : undefined;
  }

  findByAgentId(
    agentId: string,
  ): AgentPermission[] {
    return Array.from(
      this.permissions.values(),
    )
      .filter(
        (permission) =>
          permission.agentId === agentId,
      )
      .map((permission) => ({
        ...permission,
      }));
  }

  findAll(): AgentPermission[] {
    return Array.from(
      this.permissions.values(),
    ).map((permission) => ({
      ...permission,
    }));
  }

  update(
    id: string,
    input: UpdatePermissionInput,
  ): AgentPermission | undefined {
    const existing =
      this.permissions.get(id);

    if (!existing) {
      return undefined;
    }

    const updated: AgentPermission = {
      ...existing,
      ...(input.resource !== undefined
        ? { resource: input.resource }
        : {}),
      ...(input.action !== undefined
        ? { action: input.action }
        : {}),
      ...(input.effect !== undefined
        ? { effect: input.effect }
        : {}),
      updatedAt: new Date().toISOString(),
    };

    this.permissions.set(id, updated);

    return { ...updated };
  }

  delete(id: string): boolean {
    return this.permissions.delete(id);
  }
}

