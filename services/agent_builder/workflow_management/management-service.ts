import { randomUUID } from "node:crypto";

import {
  CreateWorkflowInput,
  UpdateWorkflowInput,
  WorkflowFilters,
  WorkflowRecord,
} from "./management-schema.js";

import {
  InMemoryWorkflowRepository,
  WorkflowRepository,
} from "./management-repository.js";

export class WorkflowManagementError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "WorkflowManagementError";
  }
}

export class WorkflowManagementService {
  constructor(
    private readonly repository: WorkflowRepository =
      new InMemoryWorkflowRepository(),
  ) {}

  async create(
    input: CreateWorkflowInput,
  ): Promise<WorkflowRecord> {
    this.validateTenantId(input?.tenantId);
    this.validateName(input?.name);

    const existing = await this.repository.findAll({
      tenantId: input.tenantId.trim(),
      limit: 1000,
    });

    const duplicate = existing.some(
      (workflow) =>
        workflow.status !== "archived" &&
        workflow.name.toLowerCase() ===
          input.name.trim().toLowerCase(),
    );

    if (duplicate) {
      throw new WorkflowManagementError(
        "A workflow with this name already exists in this tenant.",
        "WORKFLOW_NAME_CONFLICT",
      );
    }

    const now = new Date().toISOString();

    const workflow: WorkflowRecord = {
      id: randomUUID(),
      tenantId: input.tenantId.trim(),
      name: input.name.trim(),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      nodes: [...(input.nodes ?? [])],
      status: "draft",
      version: 1,
      metadata: structuredClone(input.metadata ?? {}),
      createdAt: now,
      updatedAt: now,
    };

    return this.repository.create(workflow);
  }

  async getById(
    tenantId: string,
    id: string,
  ): Promise<WorkflowRecord> {
    this.validateTenantId(tenantId);
    this.validateId(id);

    const workflow = await this.repository.findById(
      tenantId.trim(),
      id,
    );

    if (!workflow) {
      throw new WorkflowManagementError(
        "Workflow not found.",
        "WORKFLOW_NOT_FOUND",
      );
    }

    return workflow;
  }

  async list(
    filters: WorkflowFilters,
  ): Promise<WorkflowRecord[]> {
    this.validateTenantId(filters?.tenantId);

    if (
      filters.limit !== undefined &&
      (!Number.isInteger(filters.limit) ||
        filters.limit < 1 ||
        filters.limit > 200)
    ) {
      throw new WorkflowManagementError(
        "limit must be between 1 and 200.",
        "VALIDATION_ERROR",
      );
    }

    if (
      filters.offset !== undefined &&
      (!Number.isInteger(filters.offset) ||
        filters.offset < 0)
    ) {
      throw new WorkflowManagementError(
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
    input: UpdateWorkflowInput,
  ): Promise<WorkflowRecord> {
    const existing = await this.getById(
      tenantId,
      id,
    );

    if (!Number.isInteger(expectedVersion) || expectedVersion < 1) {
      throw new WorkflowManagementError(
        "A valid expected version is required.",
        "VALIDATION_ERROR",
      );
    }

    if (existing.status !== "draft") {
      throw new WorkflowManagementError(
        "Only draft workflows can be updated.",
        "WORKFLOW_NOT_EDITABLE",
      );
    }

    if (
      input.name !== undefined &&
      input.name.trim().length === 0
    ) {
      throw new WorkflowManagementError(
        "Workflow name is required.",
        "VALIDATION_ERROR",
      );
    }

    if (input.name !== undefined) {
      const workflows = await this.repository.findAll({
        tenantId,
        limit: 1000,
      });

      const duplicate = workflows.some(
        (workflow) =>
          workflow.id !== id &&
          workflow.status !== "archived" &&
          workflow.name.toLowerCase() ===
            input.name!.trim().toLowerCase(),
      );

      if (duplicate) {
        throw new WorkflowManagementError(
          "A workflow with this name already exists in this tenant.",
          "WORKFLOW_NAME_CONFLICT",
        );
      }
    }

    const updated =
      await this.repository.update(
        tenantId,
        id,
        expectedVersion,
        {
          ...structuredClone(input),
          ...(input.name !== undefined
            ? { name: input.name.trim() }
            : {}),
          version: existing.version + 1,
        },
      );

    if (!updated) {
      throw new WorkflowManagementError(
        "Workflow was modified by another request or no longer exists.",
        "VERSION_CONFLICT",
      );
    }

    return updated;
  }

  async publish(
    tenantId: string,
    id: string,
    expectedVersion: number,
  ): Promise<WorkflowRecord> {
    const existing = await this.getById(
      tenantId,
      id,
    );

    if (existing.status !== "draft") {
      throw new WorkflowManagementError(
        "Only draft workflows can be published.",
        "INVALID_WORKFLOW_STATUS",
      );
    }

    const updated =
      await this.repository.update(
        tenantId,
        id,
        expectedVersion,
        {
          status: "active",
          publishedAt: new Date().toISOString(),
          version: existing.version + 1,
        },
      );

    if (!updated) {
      throw new WorkflowManagementError(
        "Workflow version conflict during publication.",
        "VERSION_CONFLICT",
      );
    }

    return updated;
  }

  async archive(
    tenantId: string,
    id: string,
    expectedVersion: number,
  ): Promise<WorkflowRecord> {
    const existing = await this.getById(
      tenantId,
      id,
    );

    if (existing.status === "archived") {
      throw new WorkflowManagementError(
        "Workflow is already archived.",
        "INVALID_WORKFLOW_STATUS",
      );
    }

    const updated =
      await this.repository.update(
        tenantId,
        id,
        expectedVersion,
        {
          status: "archived",
          archivedAt: new Date().toISOString(),
          version: existing.version + 1,
        },
      );

    if (!updated) {
      throw new WorkflowManagementError(
        "Workflow version conflict during archival.",
        "VERSION_CONFLICT",
      );
    }

    return updated;
  }

  async delete(
    tenantId: string,
    id: string,
  ): Promise<boolean> {
    const workflow = await this.getById(
      tenantId,
      id,
    );

    if (workflow.status === "active") {
      throw new WorkflowManagementError(
        "Active workflows cannot be deleted. Archive the workflow first.",
        "ACTIVE_WORKFLOW_DELETE_FORBIDDEN",
      );
    }

    return this.repository.delete(
      tenantId,
      id,
    );
  }

  private validateTenantId(
    tenantId: string,
  ): void {
    if (
      typeof tenantId !== "string" ||
      tenantId.trim().length === 0
    ) {
      throw new WorkflowManagementError(
        "A valid tenantId is required.",
        "VALIDATION_ERROR",
      );
    }
  }

  private validateId(id: string): void {
    if (
      typeof id !== "string" ||
      id.trim().length === 0
    ) {
      throw new WorkflowManagementError(
        "A valid workflow ID is required.",
        "VALIDATION_ERROR",
      );
    }
  }

  private validateName(name: string): void {
    if (
      typeof name !== "string" ||
      name.trim().length === 0
    ) {
      throw new WorkflowManagementError(
        "Workflow name is required.",
        "VALIDATION_ERROR",
      );
    }
  }
}

export const workflowManagementService =
  new WorkflowManagementService();
