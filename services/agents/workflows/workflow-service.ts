import { randomUUID } from "node:crypto";

import {
  ConflictError,
  InvalidStateError,
  NotFoundError,
  ValidationError,
} from "../exceptions.js";

import {
  InMemoryWorkflowRepository,
  type WorkflowRepository,
} from "../repository/workflow-repository.js";

import type {
  CreateWorkflowInput,
  UpdateWorkflowInput,
  Workflow,
} from "./workflow-schema.js";

export class WorkflowService {
  constructor(
    private readonly repository: WorkflowRepository =
      new InMemoryWorkflowRepository(),
  ) {}

  async create(
    input: CreateWorkflowInput,
  ): Promise<Workflow> {
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
      throw new ValidationError("Workflow name is required.");
    }

    const existing = await this.repository.findAll(
      input.tenantId.trim(),
    );

    if (
      existing.some(
        (workflow) =>
          workflow.name.toLowerCase() ===
            input.name.trim().toLowerCase() &&
          workflow.status !== "archived",
      )
    ) {
      throw new ConflictError(
        "A workflow with this name already exists in this tenant.",
      );
    }

    const timestamp = new Date().toISOString();

    const workflow: Workflow = {
      id: randomUUID(),
      tenantId: input.tenantId.trim(),
      name: input.name.trim(),
      ...(input.description !== undefined
        ? { description: input.description.trim() }
        : {}),
      steps: structuredClone(input.steps ?? []),
      status: "draft",
      metadata: structuredClone(input.metadata ?? {}),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    return this.repository.create(workflow);
  }

  async getById(
    tenantId: string,
    id: string,
  ): Promise<Workflow> {
    if (!tenantId?.trim()) {
      throw new ValidationError("tenantId is required.");
    }

    if (!id?.trim()) {
      throw new ValidationError("Workflow id is required.");
    }

    const workflow = await this.repository.findById(
      tenantId.trim(),
      id.trim(),
    );

    if (!workflow) {
      throw new NotFoundError("Workflow", id);
    }

    return workflow;
  }

  async list(
    tenantId: string,
  ): Promise<Workflow[]> {
    if (!tenantId?.trim()) {
      throw new ValidationError("tenantId is required.");
    }

    return this.repository.findAll(tenantId.trim());
  }

  async update(
    tenantId: string,
    id: string,
    input: UpdateWorkflowInput,
  ): Promise<Workflow> {
    const current = await this.getById(tenantId, id);

    if (current.status !== "draft" && current.status !== "paused") {
      throw new InvalidStateError(
        "Only draft or paused workflows can be updated.",
      );
    }

    if (
      input.name !== undefined &&
      !input.name.trim()
    ) {
      throw new ValidationError(
        "Workflow name cannot be empty.",
      );
    }

    if (input.name !== undefined) {
      const existing = await this.repository.findAll(tenantId);

      if (
        existing.some(
          (workflow) =>
            workflow.id !== id &&
            workflow.status !== "archived" &&
            workflow.name.toLowerCase() ===
              input.name!.trim().toLowerCase(),
        )
      ) {
        throw new ConflictError(
          "A workflow with this name already exists in this tenant.",
        );
      }
    }

    const updated = await this.repository.update(
      tenantId,
      id,
      {
        ...structuredClone(input),
        ...(input.name !== undefined
          ? { name: input.name.trim() }
          : {}),
        ...(input.description !== undefined
          ? { description: input.description.trim() }
          : {}),
      },
    );

    if (!updated) {
      throw new NotFoundError("Workflow", id);
    }

    return updated;
  }

  async activate(
    tenantId: string,
    id: string,
  ): Promise<Workflow> {
    const workflow = await this.getById(tenantId, id);

    if (
      workflow.status !== "draft" &&
      workflow.status !== "paused"
    ) {
      throw new InvalidStateError(
        "Only draft or paused workflows can be activated.",
      );
    }

    const updated = await this.repository.update(
      tenantId,
      id,
      { status: "active" },
    );

    if (!updated) {
      throw new NotFoundError("Workflow", id);
    }

    return updated;
  }

  async pause(
    tenantId: string,
    id: string,
  ): Promise<Workflow> {
    const workflow = await this.getById(tenantId, id);

    if (workflow.status !== "active") {
      throw new InvalidStateError(
        "Only active workflows can be paused.",
      );
    }

    const updated = await this.repository.update(
      tenantId,
      id,
      { status: "paused" },
    );

    if (!updated) {
      throw new NotFoundError("Workflow", id);
    }

    return updated;
  }

  async archive(
    tenantId: string,
    id: string,
  ): Promise<Workflow> {
    const workflow = await this.getById(tenantId, id);

    if (workflow.status === "archived") {
      throw new InvalidStateError(
        "Workflow is already archived.",
      );
    }

    const updated = await this.repository.update(
      tenantId,
      id,
      { status: "archived" },
    );

    if (!updated) {
      throw new NotFoundError("Workflow", id);
    }

    return updated;
  }

  async delete(
    tenantId: string,
    id: string,
  ): Promise<boolean> {
    const workflow = await this.getById(tenantId, id);

    if (workflow.status === "active") {
      throw new InvalidStateError(
        "Active workflows cannot be deleted.",
      );
    }

    return this.repository.delete(tenantId, id);
  }
}

export const workflowService = new WorkflowService();

export type {
  CreateWorkflowInput,
  UpdateWorkflowInput,
  Workflow,
  WorkflowStatus,
  WorkflowStep,
};

