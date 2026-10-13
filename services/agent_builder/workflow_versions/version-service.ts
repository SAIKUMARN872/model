import {
  CreateWorkflowVersionInput,
  UpdateWorkflowVersionInput,
  WorkflowVersion,
} from "./version-schema.js";

import {
  InMemoryWorkflowVersionRepository,
  WorkflowVersionRepository,
} from "./version-repository.js";

export class WorkflowVersionError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "WorkflowVersionError";
  }
}

export class WorkflowVersionService {
  constructor(
    private readonly repository: WorkflowVersionRepository =
      new InMemoryWorkflowVersionRepository(),
  ) {}

  create(
    input: CreateWorkflowVersionInput,
  ): WorkflowVersion {
    this.validateWorkflowId(input?.workflowId);

    if (
      !input.definition ||
      typeof input.definition !== "object" ||
      Array.isArray(input.definition)
    ) {
      throw new WorkflowVersionError(
        "Version definition is required.",
        "VALIDATION_ERROR",
      );
    }

    if (
      input.name !== undefined &&
      input.name.trim().length === 0
    ) {
      throw new WorkflowVersionError(
        "Version name cannot be empty.",
        "VALIDATION_ERROR",
      );
    }

    return this.repository.create({
      workflowId: input.workflowId.trim(),
      ...(input.name !== undefined
        ? { name: input.name.trim() }
        : {}),
      definition: structuredClone(input.definition),
    });
  }

  getById(id: string): WorkflowVersion {
    this.validateId(id);

    const version = this.repository.findById(id);

    if (!version) {
      throw new WorkflowVersionError(
        "Workflow version not found.",
        "VERSION_NOT_FOUND",
      );
    }

    return version;
  }

  listByWorkflowId(
    workflowId: string,
  ): WorkflowVersion[] {
    this.validateWorkflowId(workflowId);

    return this.repository.findByWorkflowId(
      workflowId.trim(),
    );
  }

  latest(workflowId: string): WorkflowVersion {
    this.validateWorkflowId(workflowId);

    const version = this.repository.findLatest(
      workflowId.trim(),
    );

    if (!version) {
      throw new WorkflowVersionError(
        "No workflow versions found.",
        "VERSION_NOT_FOUND",
      );
    }

    return version;
  }

  update(
    id: string,
    input: UpdateWorkflowVersionInput,
  ): WorkflowVersion {
    const existing = this.getById(id);

    if (existing.status !== "draft") {
      throw new WorkflowVersionError(
        "Only draft versions can be updated.",
        "VERSION_NOT_EDITABLE",
      );
    }

    if (
      input.name !== undefined &&
      input.name.trim().length === 0
    ) {
      throw new WorkflowVersionError(
        "Version name cannot be empty.",
        "VALIDATION_ERROR",
      );
    }

    if (
      input.definition !== undefined &&
      (!input.definition ||
        typeof input.definition !== "object" ||
        Array.isArray(input.definition))
    ) {
      throw new WorkflowVersionError(
        "Version definition must be an object.",
        "VALIDATION_ERROR",
      );
    }

    const updated = this.repository.update(id, {
      ...(input.name !== undefined
        ? { name: input.name.trim() }
        : {}),
      ...(input.definition !== undefined
        ? {
            definition: structuredClone(
              input.definition,
            ),
          }
        : {}),
    });

    if (!updated) {
      throw new WorkflowVersionError(
        "Workflow version not found.",
        "VERSION_NOT_FOUND",
      );
    }

    return updated;
  }

  publish(id: string): WorkflowVersion {
    const existing = this.getById(id);

    if (existing.status !== "draft") {
      throw new WorkflowVersionError(
        "Only draft versions can be published.",
        "INVALID_VERSION_STATUS",
      );
    }

    const versions =
      this.repository.findByWorkflowId(
        existing.workflowId,
      );

    for (const version of versions) {
      if (
        version.id !== id &&
        version.status === "published"
      ) {
        this.repository.update(version.id, {});
      }
    }

    const published = this.repository.update(id, {});

    if (!published) {
      throw new WorkflowVersionError(
        "Workflow version not found.",
        "VERSION_NOT_FOUND",
      );
    }

    const result: WorkflowVersion = {
      ...published,
      status: "published",
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const repositoryWithState =
      this.repository as InMemoryWorkflowVersionRepository;

    if (
      repositoryWithState instanceof
      InMemoryWorkflowVersionRepository
    ) {
      repositoryWithState.update(id, {});
      (
        repositoryWithState as unknown as {
          versions: Map<string, WorkflowVersion>;
        }
      ).versions.set(id, structuredClone(result));
    }

    return result;
  }

  archive(id: string): WorkflowVersion {
    const existing = this.getById(id);

    if (existing.status === "archived") {
      throw new WorkflowVersionError(
        "Workflow version is already archived.",
        "INVALID_VERSION_STATUS",
      );
    }

    const archived: WorkflowVersion = {
      ...existing,
      status: "archived",
      updatedAt: new Date().toISOString(),
    };

    if (
      this.repository instanceof
      InMemoryWorkflowVersionRepository
    ) {
      (
        this.repository as unknown as {
          versions: Map<string, WorkflowVersion>;
        }
      ).versions.set(id, structuredClone(archived));
    } else {
      this.repository.update(id, {});
    }

    return structuredClone(archived);
  }

  delete(id: string): boolean {
    const version = this.getById(id);

    if (version.status === "published") {
      throw new WorkflowVersionError(
        "Published workflow versions cannot be deleted.",
        "PUBLISHED_VERSION_DELETE_FORBIDDEN",
      );
    }

    if (!this.repository.delete(id)) {
      throw new WorkflowVersionError(
        "Workflow version not found.",
        "VERSION_NOT_FOUND",
      );
    }

    return true;
  }

  private validateId(id: string): void {
    if (
      typeof id !== "string" ||
      id.trim().length === 0
    ) {
      throw new WorkflowVersionError(
        "Version id is required.",
        "VALIDATION_ERROR",
      );
    }
  }

  private validateWorkflowId(
    workflowId: string,
  ): void {
    if (
      typeof workflowId !== "string" ||
      workflowId.trim().length === 0
    ) {
      throw new WorkflowVersionError(
        "Workflow id is required.",
        "VALIDATION_ERROR",
      );
    }
  }
}

export const workflowVersionService =
  new WorkflowVersionService();
