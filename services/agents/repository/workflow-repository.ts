import type {
  Workflow,
} from "../models.js";

export interface WorkflowRepository {
  create(workflow: Workflow): Promise<Workflow>;
  findById(
    tenantId: string,
    id: string,
  ): Promise<Workflow | undefined>;
  findAll(tenantId: string): Promise<Workflow[]>;
  update(
    tenantId: string,
    id: string,
    changes: Partial<Workflow>,
  ): Promise<Workflow | undefined>;
  delete(
    tenantId: string,
    id: string,
  ): Promise<boolean>;
}

export class InMemoryWorkflowRepository
  implements WorkflowRepository
{
  private readonly workflows = new Map<string, Workflow>();

  async create(workflow: Workflow): Promise<Workflow> {
    const copy = structuredClone(workflow);
    this.workflows.set(copy.id, copy);
    return structuredClone(copy);
  }

  async findById(
    tenantId: string,
    id: string,
  ): Promise<Workflow | undefined> {
    const workflow = this.workflows.get(id);

    if (!workflow || workflow.tenantId !== tenantId) {
      return undefined;
    }

    return structuredClone(workflow);
  }

  async findAll(tenantId: string): Promise<Workflow[]> {
    return [...this.workflows.values()]
      .filter((workflow) => workflow.tenantId === tenantId)
      .map((workflow) => structuredClone(workflow));
  }

  async update(
    tenantId: string,
    id: string,
    changes: Partial<Workflow>,
  ): Promise<Workflow | undefined> {
    const current = this.workflows.get(id);

    if (!current || current.tenantId !== tenantId) {
      return undefined;
    }

    const updated: Workflow = {
      ...current,
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
    const current = this.workflows.get(id);

    if (!current || current.tenantId !== tenantId) {
      return false;
    }

    return this.workflows.delete(id);
  }
}

