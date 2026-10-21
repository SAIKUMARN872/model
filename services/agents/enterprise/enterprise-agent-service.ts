import { randomUUID } from "node:crypto";

import {
  ConflictError,
  InvalidStateError,
  NotFoundError,
  ValidationError,
} from "../exceptions.js";

import {
  InMemoryEnterpriseAgentRepository,
  type EnterpriseAgentRepository,
} from "./enterprise-agent-repository.js";

import type {
  AgentStatus,
  CreateEnterpriseAgentInput,
  EnterpriseAgent,
  UpdateEnterpriseAgentInput,
} from "./enterprise-agent-schema.js";

export class EnterpriseAgentService {
  constructor(
    private readonly repository: EnterpriseAgentRepository =
      new InMemoryEnterpriseAgentRepository(),
  ) {}

  async create(
    input: CreateEnterpriseAgentInput,
  ): Promise<EnterpriseAgent> {
    this.validateCreateInput(input);

    const tenantId = input.tenantId.trim();
    const name = input.name.trim();
    const existing = await this.repository.findAll(tenantId);

    if (
      existing.some(
        (agent) =>
          agent.status !== "archived" &&
          agent.name.toLowerCase() === name.toLowerCase(),
      )
    ) {
      throw new ConflictError(
        "An agent with this name already exists in this tenant.",
      );
    }

    const now = new Date().toISOString();
    return this.repository.create({
      id: randomUUID(),
      tenantId,
      name,
      ...(input.description !== undefined
        ? { description: input.description.trim() }
        : {}),
      instructions: input.instructions.trim(),
      model: input.model?.trim() || "default",
      tools: structuredClone(input.tools ?? []),
      metadata: structuredClone(input.metadata ?? {}),
      status: "draft",
      createdAt: now,
      updatedAt: now,
    });
  }

  async getById(
    tenantId: string,
    id: string,
  ): Promise<EnterpriseAgent> {
    this.validateIdentifiers(tenantId, id);
    const agent = await this.repository.findById(
      tenantId.trim(),
      id.trim(),
    );

    if (!agent) {
      throw new NotFoundError("Agent", id);
    }

    return agent;
  }

  async list(tenantId: string): Promise<EnterpriseAgent[]> {
    if (typeof tenantId !== "string" || tenantId.trim().length === 0) {
      throw new ValidationError("tenantId is required.");
    }

    return this.repository.findAll(tenantId.trim());
  }

  async update(
    tenantId: string,
    id: string,
    input: UpdateEnterpriseAgentInput,
  ): Promise<EnterpriseAgent> {
    const current = await this.getById(tenantId, id);

    if (current.status !== "draft" && current.status !== "paused") {
      throw new InvalidStateError(
        "Only draft or paused agents can be updated.",
      );
    }

    if (
      input.name !== undefined &&
      (typeof input.name !== "string" || input.name.trim().length === 0)
    ) {
      throw new ValidationError("Agent name cannot be empty.");
    }

    if (
      input.instructions !== undefined &&
      (typeof input.instructions !== "string" ||
        input.instructions.trim().length === 0)
    ) {
      throw new ValidationError("Agent instructions cannot be empty.");
    }

    if (input.name !== undefined) {
      const existing = await this.repository.findAll(current.tenantId);
      const name = input.name.trim().toLowerCase();

      if (
        existing.some(
          (agent) =>
            agent.id !== id &&
            agent.status !== "archived" &&
            agent.name.toLowerCase() === name,
        )
      ) {
        throw new ConflictError(
          "An agent with this name already exists in this tenant.",
        );
      }
    }

    const updated = await this.repository.update(
      current.tenantId,
      current.id,
      {
        ...structuredClone(input),
        ...(input.name !== undefined ? { name: input.name.trim() } : {}),
        ...(input.description !== undefined
          ? { description: input.description.trim() }
          : {}),
        ...(input.instructions !== undefined
          ? { instructions: input.instructions.trim() }
          : {}),
      },
    );

    if (!updated) {
      throw new NotFoundError("Agent", id);
    }

    return updated;
  }

  async activate(
    tenantId: string,
    id: string,
  ): Promise<EnterpriseAgent> {
    return this.changeStatus(tenantId, id, "active", ["draft", "paused"]);
  }

  async pause(
    tenantId: string,
    id: string,
  ): Promise<EnterpriseAgent> {
    return this.changeStatus(tenantId, id, "paused", ["active"]);
  }

  async archive(
    tenantId: string,
    id: string,
  ): Promise<EnterpriseAgent> {
    return this.changeStatus(
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
    const agent = await this.getById(tenantId, id);

    if (agent.status === "active") {
      throw new InvalidStateError(
        "Active agents cannot be deleted.",
      );
    }

    return this.repository.delete(agent.tenantId, agent.id);
  }

  private async changeStatus(
    tenantId: string,
    id: string,
    status: AgentStatus,
    allowedStatuses: AgentStatus[],
  ): Promise<EnterpriseAgent> {
    const agent = await this.getById(tenantId, id);

    if (!allowedStatuses.includes(agent.status)) {
      throw new InvalidStateError(
        `Cannot change agent status from ${agent.status} to ${status}.`,
      );
    }

    const updated = await this.repository.update(
      agent.tenantId,
      agent.id,
      { status },
    );

    if (!updated) {
      throw new NotFoundError("Agent", id);
    }

    return updated;
  }

  private validateCreateInput(
    input: CreateEnterpriseAgentInput,
  ): void {
    if (
      typeof input?.tenantId !== "string" ||
      input.tenantId.trim().length === 0
    ) {
      throw new ValidationError("tenantId is required.");
    }

    if (
      typeof input?.name !== "string" ||
      input.name.trim().length === 0
    ) {
      throw new ValidationError("Agent name is required.");
    }

    if (
      typeof input?.instructions !== "string" ||
      input.instructions.trim().length === 0
    ) {
      throw new ValidationError("Agent instructions are required.");
    }
  }

  private validateIdentifiers(tenantId: string, id: string): void {
    if (typeof tenantId !== "string" || tenantId.trim().length === 0) {
      throw new ValidationError("tenantId is required.");
    }

    if (typeof id !== "string" || id.trim().length === 0) {
      throw new ValidationError("Agent id is required.");
    }
  }
}

export const enterpriseAgentService =
  new EnterpriseAgentService();
