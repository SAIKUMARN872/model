import {
  CreateWorkflowVersionInput,
  UpdateWorkflowVersionInput,
  WorkflowVersion,
} from "./version-schema.js";

export interface WorkflowVersionRepository {
  create(input: CreateWorkflowVersionInput): WorkflowVersion;
  findById(id: string): WorkflowVersion | undefined;
  findByWorkflowId(workflowId: string): WorkflowVersion[];
  findLatest(workflowId: string): WorkflowVersion | undefined;
  update(
    id: string,
    input: UpdateWorkflowVersionInput,
  ): WorkflowVersion | undefined;
  delete(id: string): boolean;
}

export class InMemoryWorkflowVersionRepository
  implements WorkflowVersionRepository
{
  private readonly versions =
    new Map<string, WorkflowVersion>();

  create(
    input: CreateWorkflowVersionInput,
  ): WorkflowVersion {
    const now = new Date().toISOString();

    const existing = Array.from(
      this.versions.values(),
    ).filter(
      (version) =>
        version.workflowId === input.workflowId,
    );

    const nextVersion =
      existing.length === 0
        ? 1
        : Math.max(
            ...existing.map(
              (version) => version.version,
            ),
          ) + 1;

    const version: WorkflowVersion = {
      id: `workflow_version_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 10)}`,
      workflowId: input.workflowId,
      version: nextVersion,
      name: input.name,
      definition: structuredClone(input.definition),
      status: "draft",
      createdAt: now,
      updatedAt: now,
    };

    this.versions.set(version.id, version);

    return structuredClone(version);
  }

  findById(id: string): WorkflowVersion | undefined {
    const version = this.versions.get(id);

    return version
      ? structuredClone(version)
      : undefined;
  }

  findByWorkflowId(
    workflowId: string,
  ): WorkflowVersion[] {
    return Array.from(this.versions.values())
      .filter(
        (version) =>
          version.workflowId === workflowId,
      )
      .sort(
        (a, b) => b.version - a.version,
      )
      .map((version) => structuredClone(version));
  }

  findLatest(
    workflowId: string,
  ): WorkflowVersion | undefined {
    const versions = this.findByWorkflowId(workflowId);
    return versions[0];
  }

  update(
    id: string,
    input: UpdateWorkflowVersionInput,
  ): WorkflowVersion | undefined {
    const existing = this.versions.get(id);

    if (!existing) {
      return undefined;
    }

    const updated: WorkflowVersion = {
      ...existing,
      ...(input.name !== undefined
        ? { name: input.name }
        : {}),
      ...(input.definition !== undefined
        ? {
            definition: structuredClone(
              input.definition,
            ),
          }
        : {}),
      updatedAt: new Date().toISOString(),
    };

    this.versions.set(id, updated);

    return structuredClone(updated);
  }

  delete(id: string): boolean {
    return this.versions.delete(id);
  }
}
