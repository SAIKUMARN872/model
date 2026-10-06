import {
  AgentPermission,
  CreatePermissionInput,
  PermissionEffect,
  UpdatePermissionInput,
} from "./permission-schema.js";

import {
  PermissionRepository,
  InMemoryPermissionRepository,
} from "./permission-repository.js";

export class PermissionNotFoundError extends Error {
  constructor(id: string) {
    super(`Permission not found: ${id}`);
    this.name = "PermissionNotFoundError";
  }
}

export class InvalidPermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidPermissionError";
  }
}

export class AgentPermissionService {
  constructor(
    private readonly repository: PermissionRepository =
      new InMemoryPermissionRepository(),
  ) {}

  create(
    input: CreatePermissionInput,
  ): AgentPermission {
    if (
      !input ||
      typeof input.agentId !== "string" ||
      input.agentId.trim().length === 0
    ) {
      throw new InvalidPermissionError(
        "Agent id is required",
      );
    }

    if (
      typeof input.subjectId !== "string" ||
      input.subjectId.trim().length === 0
    ) {
      throw new InvalidPermissionError(
        "Subject id is required",
      );
    }

    this.validateText(
      input.resource,
      "Permission resource is required",
    );

    this.validateText(
      input.action,
      "Permission action is required",
    );

    this.validateEffect(input.effect);

    return this.repository.create({
      agentId: input.agentId.trim(),
      subjectId: input.subjectId.trim(),
      resource: input.resource.trim(),
      action: input.action.trim(),
      effect: input.effect ?? "allow",
    });
  }

  getById(id: string): AgentPermission {
    this.validateId(id);

    const permission =
      this.repository.findById(id);

    if (!permission) {
      throw new PermissionNotFoundError(id);
    }

    return permission;
  }

  list(): AgentPermission[] {
    return this.repository.findAll();
  }

  listByAgentId(
    agentId: string,
  ): AgentPermission[] {
    this.validateId(agentId);

    return this.repository.findByAgentId(
      agentId,
    );
  }

  update(
    id: string,
    input: UpdatePermissionInput,
  ): AgentPermission {
    this.validateId(id);

    if (!input || typeof input !== "object") {
      throw new InvalidPermissionError(
        "Permission update is required",
      );
    }

    if (input.resource !== undefined) {
      this.validateText(
        input.resource,
        "Permission resource cannot be empty",
      );
    }

    if (input.action !== undefined) {
      this.validateText(
        input.action,
        "Permission action cannot be empty",
      );
    }

    this.validateEffect(input.effect);

    if (!this.repository.findById(id)) {
      throw new PermissionNotFoundError(id);
    }

    const updated =
      this.repository.update(id, {
        ...(input.resource !== undefined
          ? { resource: input.resource.trim() }
          : {}),
        ...(input.action !== undefined
          ? { action: input.action.trim() }
          : {}),
        ...(input.effect !== undefined
          ? { effect: input.effect }
          : {}),
      });

    if (!updated) {
      throw new PermissionNotFoundError(id);
    }

    return updated;
  }

  isAllowed(
    agentId: string,
    subjectId: string,
    resource: string,
    action: string,
  ): boolean {
    const permissions =
      this.repository.findByAgentId(
        agentId,
      );

    const matching = permissions.find(
      (permission: AgentPermission) =>
        permission.subjectId === subjectId &&
        permission.resource === resource &&
        permission.action === action,
    );

    return matching?.effect === "allow";
  }

  delete(id: string): void {
    this.validateId(id);

    if (!this.repository.delete(id)) {
      throw new PermissionNotFoundError(id);
    }
  }

  private validateId(id: string): void {
    if (
      typeof id !== "string" ||
      id.trim().length === 0
    ) {
      throw new InvalidPermissionError(
        "Permission id is required",
      );
    }
  }

  private validateText(
    value: string,
    message: string,
  ): void {
    if (
      typeof value !== "string" ||
      value.trim().length === 0
    ) {
      throw new InvalidPermissionError(message);
    }
  }

  private validateEffect(
    effect: PermissionEffect | undefined,
  ): void {
    if (
      effect !== undefined &&
      effect !== "allow" &&
      effect !== "deny"
    ) {
      throw new InvalidPermissionError(
        "Permission effect must be allow or deny",
      );
    }
  }
}


