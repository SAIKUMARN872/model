import { randomUUID } from "node:crypto";

import {
  InvalidStateError,
  NotFoundError,
  ValidationError,
} from "../exceptions.js";

import type {
  CreateAgentInput,
  UpdateAgentInput,
} from "./agent-schema.js";

export type AgentStatus =
  | "draft"
  | "active"
  | "paused"
  | "archived";

export interface AgentRecord {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  instructions: string;
  model: string;
  tools: NonNullable<CreateAgentInput["tools"]>;
  metadata: Record<string, unknown>;
  status: AgentStatus;
  createdAt: string;
  updatedAt: string;
}

export class AgentService {
  private readonly agents = new Map<string, AgentRecord>();

  async create(input: CreateAgentInput): Promise<AgentRecord> {
    this.validateCreateInput(input);

    const now = new Date().toISOString();
    const agent: AgentRecord = {
      id: randomUUID(),
      tenantId: input.tenantId.trim(),
      name: input.name.trim(),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      instructions: input.instructions.trim(),
      model: input.model ?? "default",
      tools: structuredClone(input.tools ?? []),
      metadata: structuredClone(input.metadata ?? {}),
      status: "draft",
      createdAt: now,
      updatedAt: now,
    };

    this.agents.set(agent.id, agent);
    return structuredClone(agent);
  }

  async getById(
    tenantId: string,
    id: string,
  ): Promise<AgentRecord> {
    this.validateIdentifiers(tenantId, id);
    const agent = this.agents.get(id);

    if (!agent || agent.tenantId !== tenantId.trim()) {
      throw new NotFoundError("Agent", id);
    }

    return structuredClone(agent);
  }

  async list(
    tenantId: string,
    status?: AgentStatus,
  ): Promise<AgentRecord[]> {
    if (typeof tenantId !== "string" || tenantId.trim().length === 0) {
      throw new ValidationError("tenantId is required.");
    }

    return [...this.agents.values()]
      .filter(
        (agent) =>
          agent.tenantId === tenantId.trim() &&
          (status === undefined || agent.status === status),
      )
      .map((agent) => structuredClone(agent));
  }

  async update(
    tenantId: string,
    id: string,
    input: UpdateAgentInput,
  ): Promise<AgentRecord> {
    const existing = await this.getById(tenantId, id);

    if (existing.status !== "draft") {
      throw new InvalidStateError(
        "Only draft agents can be updated.",
      );
    }

    if (
      input.name !== undefined &&
      (typeof input.name !== "string" || input.name.trim().length === 0)
    ) {
      throw new ValidationError("name must not be empty.");
    }

    if (
      input.instructions !== undefined &&
      (typeof input.instructions !== "string" ||
        input.instructions.trim().length === 0)
    ) {
      throw new ValidationError("instructions must not be empty.");
    }

    const updated: AgentRecord = {
      ...existing,
      ...structuredClone(input),
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.instructions !== undefined
        ? { instructions: input.instructions.trim() }
        : {}),
      updatedAt: new Date().toISOString(),
    };

    this.agents.set(id, updated);
    return structuredClone(updated);
  }

  async activate(
    tenantId: string,
    id: string,
  ): Promise<AgentRecord> {
    return this.setStatus(tenantId, id, "active", ["draft", "paused"]);
  }

  async pause(
    tenantId: string,
    id: string,
  ): Promise<AgentRecord> {
    return this.setStatus(tenantId, id, "paused", ["active"]);
  }

  async archive(
    tenantId: string,
    id: string,
  ): Promise<AgentRecord> {
    return this.setStatus(
      tenantId,
      id,
      "archived",
      ["draft", "active", "paused"],
    );
  }

  async delete(
    tenantId: string,
    id: string,
  ): Promise<boolean> {
    await this.getById(tenantId, id);
    return this.agents.delete(id);
  }

  private async setStatus(
    tenantId: string,
    id: string,
    status: AgentStatus,
    allowedCurrentStatuses: AgentStatus[],
  ): Promise<AgentRecord> {
    const agent = await this.getById(tenantId, id);

    if (!allowedCurrentStatuses.includes(agent.status)) {
      throw new InvalidStateError(
        `Cannot change agent status from ${agent.status} to ${status}.`,
      );
    }

    const updated: AgentRecord = {
      ...agent,
      status,
      updatedAt: new Date().toISOString(),
    };

    this.agents.set(id, updated);
    return structuredClone(updated);
  }

  private validateCreateInput(input: CreateAgentInput): void {
    if (
      typeof input.tenantId !== "string" ||
      input.tenantId.trim().length === 0
    ) {
      throw new ValidationError("tenantId is required.");
    }

    if (
      typeof input.name !== "string" ||
      input.name.trim().length === 0
    ) {
      throw new ValidationError("name is required.");
    }

    if (
      typeof input.instructions !== "string" ||
      input.instructions.trim().length === 0
    ) {
      throw new ValidationError("instructions are required.");
    }
  }

  private validateIdentifiers(tenantId: string, id: string): void {
    if (typeof tenantId !== "string" || tenantId.trim().length === 0) {
      throw new ValidationError("tenantId is required.");
    }

    if (typeof id !== "string" || id.trim().length === 0) {
      throw new ValidationError("agent ID is required.");
    }
  }
}

export const agentService = new AgentService();
