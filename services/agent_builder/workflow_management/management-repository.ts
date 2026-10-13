import {
  CreateWorkflowInput,
  UpdateWorkflowInput,
  WorkflowFilters,
  WorkflowRecord,
} from "./management-schema.js";

export interface WorkflowRepository {
  create(workflow: WorkflowRecord): Promise<WorkflowRecord>;
  findById(
    tenantId: string,
    id: string,
  ): Promise<WorkflowRecord | undefined>;
  findAll(filters: WorkflowFilters): Promise<WorkflowRecord[]>;
  update(
    tenantId: string,
    id: string,
    expectedVersion: number,
    changes: Partial<WorkflowRecord>,
  ): Promise<WorkflowRecord | undefined>;
  delete(tenantId: string, id: string): Promise<boolean>;
}

export class InMemoryWorkflowRepository
  implements WorkflowRepository
{
  private readonly workflows =
    new Map<string, WorkflowRecord>();

  async create(
    workflow: WorkflowRecord,
  ): Promise<WorkflowRecord> {
    this.workflows.set(
      workflow.id,
      structuredClone(workflow),
    );

    return structuredClone(workflow);
  }

  async findById(
    tenantId: string,
    id: string,
  ): Promise<WorkflowRecord | undefined> {
    const workflow = this.workflows.get(id);

    if (
      !workflow ||
      workflow.tenantId !== tenantId
    ) {
      return undefined;
    }

    return structuredClone(workflow);
  }

  async findAll(
    filters: WorkflowFilters,
  ): Promise<WorkflowRecord[]> {
    let workflows = Array.from(this.workflows.values())
      .filter(
        (workflow) =>
          workflow.tenantId === filters.tenantId,
      );

    if (filters.status !== undefined) {
      workflows = workflows.filter(
        (workflow) =>
          workflow.status === filters.status,
      );
    }

    const offset = filters.offset ?? 0;
    const limit = filters.limit ?? 200;

    return workflows
      .slice(offset, offset + limit)
      .map((workflow) => structuredClone(workflow));
  }

  async update(
    tenantId: string,
    id: string,
    expectedVersion: number,
    changes: Partial<WorkflowRecord>,
  ): Promise<WorkflowRecord | undefined> {
    const existing = this.workflows.get(id);

    if (
      !existing ||
      existing.tenantId !== tenantId ||
      existing.version !== expectedVersion
    ) {
      return undefined;
    }

    const updated: WorkflowRecord = {
      ...existing,
      ...structuredClone(changes),
      updatedAt: new Date().toISOString(),
    };

    this.workflows.set(id, updated);

    return structuredClone(updated);
  }

  async delete(
    tenantId: string,
    id: string,
  ): Promise<boolean> {
    const existing = this.workflows.get(id);

    if (
      !existing ||
      existing.tenantId !== tenantId
    ) {
      return false;
    }

    return this.workflows.delete(id);
  }
}
