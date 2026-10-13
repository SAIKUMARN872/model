import { randomUUID } from "node:crypto";

import {
  validateCreateAgent,
  validateUpdateAgent,
  type AgentFilters,
  type AgentRecord,
  type AgentStatus,
  type CreateAgentInput,
  type UpdateAgentInput,
} from "./management-schema.js";

import {
  InMemoryAgentRepository,
  type AgentRepository,
} from "./management-repository.js";

export class AgentManagementError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "AgentManagementError";
  }
}

export class AgentManagementService {
  constructor(
    private readonly repository: AgentRepository =
      new InMemoryAgentRepository(),
  ) {}

  async create(
    input: CreateAgentInput,
  ): Promise<AgentRecord> {
    const validation = validateCreateAgent(input);

    if (!validation.valid || !validation.data) {
      throw new AgentManagementError(
        validation.errors.join(" "),
        "VALIDATION_ERROR",
      );
    }

    const data = validation.data;

    const existingAgents = await this.repository.findAll({
      tenantId: data.tenantId,
      limit: 1000,
    });

    const duplicate = existingAgents.some(
      (agent) =>
        agent.name.toLowerCase() === data.name.toLowerCase() &&
        agent.status !== "archived",
    );

    if (duplicate) {
      throw new AgentManagementError(
        "An agent with this name already exists in this tenant.",
        "AGENT_NAME_CONFLICT",
      );
    }

    const now = new Date().toISOString();

    const agent: AgentRecord = {
      id: randomUUID(),
      tenantId: data.tenantId,
      name: data.name,
      ...(data.description !== undefined
        ? { description: data.description }
        : {}),
      instructions: data.instructions,
      model: structuredClone(data.model),
      tools: structuredClone(data.tools ?? []),
      metadata: structuredClone(data.metadata ?? {}),
      status: "draft",
      version: 1,
      createdAt: now,
      updatedAt: now,
    };

    return this.repository.create(agent);
  }

  async getById(
    tenantId: string,
    id: string,
  ): Promise<AgentRecord> {
    this.validateIdentifiers(tenantId, id);

    const agent = await this.repository.findById(
      tenantId,
      id,
    );

    if (!agent) {
      throw new AgentManagementError(
        "Agent not found.",
        "AGENT_NOT_FOUND",
      );
    }

    return agent;
  }

  async list(
    filters: AgentFilters,
  ): Promise<AgentRecord[]> {
    if (
      typeof filters.tenantId !== "string" ||
      filters.tenantId.trim().length === 0
    ) {
      throw new AgentManagementError(
        "tenantId is required.",
        "VALIDATION_ERROR",
      );
    }

    if (
      filters.limit !== undefined &&
      (!Number.isInteger(filters.limit) ||
        filters.limit < 1 ||
        filters.limit > 200)
    ) {
      throw new AgentManagementError(
        "limit must be between 1 and 200.",
        "VALIDATION_ERROR",
      );
    }

    if (
      filters.offset !== undefined &&
      (!Number.isInteger(filters.offset) ||
        filters.offset < 0)
    ) {
      throw new AgentManagementError(
        "offset must be a non-negative integer.",
        "VALIDATION_ERROR",
      );
    }

    return this.repository.findAll({
      ...filters,
      tenantId: filters.tenantId.trim(),
    });
  }

  async update(
    tenantId: string,
    id: string,
    expectedVersion: number,
    input: UpdateAgentInput,
  ): Promise<AgentRecord> {
    this.validateIdentifiers(tenantId, id);
    this.validateVersion(expectedVersion);

    const validation = validateUpdateAgent(input);

    if (!validation.valid || !validation.data) {
      throw new AgentManagementError(
        validation.errors.join(" "),
        "VALIDATION_ERROR",
      );
    }

    const existing = await this.getById(tenantId, id);

    if (existing.status !== "draft") {
      throw new AgentManagementError(
        "Only draft agents can be updated. Create a new version to modify an active agent.",
        "AGENT_NOT_EDITABLE",
      );
    }

    const changes = validation.data;

    if (changes.name !== undefined) {
      const agents = await this.repository.findAll({
        tenantId,
        limit: 1000,
      });

      const duplicate = agents.some(
        (agent) =>
          agent.id !== id &&
          agent.status !== "archived" &&
          agent.name.toLowerCase() ===
            changes.name!.toLowerCase(),
      );

      if (duplicate) {
        throw new AgentManagementError(
          "An agent with this name already exists in this tenant.",
          "AGENT_NAME_CONFLICT",
        );
      }
    }

    const updated = await this.repository.update(
      tenantId,
      id,
      expectedVersion,
      {
        ...structuredClone(changes),
        version: existing.version + 1,
        updatedAt: new Date().toISOString(),
      },
    );

    if (!updated) {
      throw new AgentManagementError(
        "Agent was modified by another request or no longer exists. Refresh and retry.",
        "VERSION_CONFLICT",
      );
    }

    return updated;
  }

  async publish(
    tenantId: string,
    id: string,
    expectedVersion: number,
  ): Promise<AgentRecord> {
    this.validateIdentifiers(tenantId, id);
    this.validateVersion(expectedVersion);

    const agent = await this.getById(tenantId, id);

    if (agent.status !== "draft") {
      throw new AgentManagementError(
        "Only draft agents can be published.",
        "INVALID_AGENT_STATUS",
      );
    }

    const now = new Date().toISOString();

    const published = await this.repository.update(
      tenantId,
      id,
      expectedVersion,
      {
        status: "active",
        publishedAt: now,
        updatedAt: now,
        version: agent.version + 1,
      },
    );

    if (!published) {
      throw new AgentManagementError(
        "Agent version conflict during publication.",
        "VERSION_CONFLICT",
      );
    }

    return published;
  }

  async archive(
    tenantId: string,
    id: string,
    expectedVersion: number,
  ): Promise<AgentRecord> {
    this.validateIdentifiers(tenantId, id);
    this.validateVersion(expectedVersion);

    const agent = await this.getById(tenantId, id);

    if (agent.status === "archived") {
      throw new AgentManagementError(
        "Agent is already archived.",
        "INVALID_AGENT_STATUS",
      );
    }

    const now = new Date().toISOString();

    const archived = await this.repository.update(
      tenantId,
      id,
      expectedVersion,
      {
        status: "archived",
        archivedAt: now,
        updatedAt: now,
        version: agent.version + 1,
      },
    );

    if (!archived) {
      throw new AgentManagementError(
        "Agent version conflict during archival.",
        "VERSION_CONFLICT",
      );
    }

    return archived;
  }

  async delete(
    tenantId: string,
    id: string,
  ): Promise<boolean> {
    this.validateIdentifiers(tenantId, id);

    const agent = await this.getById(tenantId, id);

    if (agent.status === "active") {
      throw new AgentManagementError(
        "Active agents cannot be deleted. Archive the agent first.",
        "ACTIVE_AGENT_DELETE_FORBIDDEN",
      );
    }

    return this.repository.delete(tenantId, id);
  }

  private validateIdentifiers(
    tenantId: string,
    id: string,
  ): void {
    if (
      typeof tenantId !== "string" ||
      tenantId.trim().length === 0
    ) {
      throw new AgentManagementError(
        "A valid tenantId is required.",
        "VALIDATION_ERROR",
      );
    }

    if (
      typeof id !== "string" ||
      id.trim().length === 0
    ) {
      throw new AgentManagementError(
        "A valid agent ID is required.",
        "VALIDATION_ERROR",
      );
    }
  }

  private validateVersion(version: number): void {
    if (!Number.isInteger(version) || version < 1) {
      throw new AgentManagementError(
        "A valid expected version is required.",
        "VALIDATION_ERROR",
      );
    }
  }
}

export const agentManagementService =
  new AgentManagementService();

export type {
  AgentFilters,
  AgentRecord,
  AgentStatus,
  CreateAgentInput,
  UpdateAgentInput,
};
