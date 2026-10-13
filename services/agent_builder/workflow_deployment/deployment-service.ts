import {
  CreateWorkflowDeploymentInput,
  UpdateWorkflowDeploymentInput,
  WorkflowDeployment,
  WorkflowDeploymentStatus,
} from "./deployment-schema.js";

import {
  InMemoryWorkflowDeploymentRepository,
  WorkflowDeploymentRepository,
} from "./deployment-repository.js";

export class WorkflowDeploymentError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "WorkflowDeploymentError";
  }
}

export class WorkflowDeploymentService {
  constructor(
    private readonly repository: WorkflowDeploymentRepository =
      new InMemoryWorkflowDeploymentRepository(),
  ) {}

  create(
    input: CreateWorkflowDeploymentInput,
  ): WorkflowDeployment {
    this.validateWorkflowId(input?.workflowId);
    this.validateEnvironment(input?.environment);

    return this.repository.create({
      workflowId: input.workflowId.trim(),
      versionId: input.versionId?.trim(),
      environment: input.environment.trim(),
      endpoint: input.endpoint?.trim(),
    });
  }

  getById(id: string): WorkflowDeployment {
    this.validateId(id);

    const deployment = this.repository.findById(id);

    if (!deployment) {
      throw new WorkflowDeploymentError(
        "Deployment not found.",
        "DEPLOYMENT_NOT_FOUND",
      );
    }

    return deployment;
  }

  list(): WorkflowDeployment[] {
    return this.repository.findAll();
  }

  listByWorkflowId(
    workflowId: string,
  ): WorkflowDeployment[] {
    this.validateWorkflowId(workflowId);
    return this.repository.findByWorkflowId(
      workflowId.trim(),
    );
  }

  update(
    id: string,
    input: UpdateWorkflowDeploymentInput,
  ): WorkflowDeployment {
    this.validateId(id);

    if (!input || typeof input !== "object") {
      throw new WorkflowDeploymentError(
        "Deployment update is required.",
        "VALIDATION_ERROR",
      );
    }

    if (input.status !== undefined) {
      this.validateStatus(input.status);
    }

    const updated = this.repository.update(id, input);

    if (!updated) {
      throw new WorkflowDeploymentError(
        "Deployment not found.",
        "DEPLOYMENT_NOT_FOUND",
      );
    }

    return updated;
  }

  start(id: string): WorkflowDeployment {
    return this.update(id, {
      status: "deploying",
    });
  }

  deploy(id: string): WorkflowDeployment {
    return this.update(id, {
      status: "deployed",
    });
  }

  fail(
    id: string,
    error: string,
  ): WorkflowDeployment {
    if (
      typeof error !== "string" ||
      error.trim().length === 0
    ) {
      throw new WorkflowDeploymentError(
        "Deployment error is required.",
        "VALIDATION_ERROR",
      );
    }

    return this.update(id, {
      status: "failed",
      error: error.trim(),
    });
  }

  rollback(id: string): WorkflowDeployment {
    return this.update(id, {
      status: "rolled_back",
    });
  }

  delete(id: string): boolean {
    this.validateId(id);

    if (!this.repository.delete(id)) {
      throw new WorkflowDeploymentError(
        "Deployment not found.",
        "DEPLOYMENT_NOT_FOUND",
      );
    }

    return true;
  }

  private validateId(id: string): void {
    if (
      typeof id !== "string" ||
      id.trim().length === 0
    ) {
      throw new WorkflowDeploymentError(
        "Deployment id is required.",
        "VALIDATION_ERROR",
      );
    }
  }

  private validateWorkflowId(workflowId: string): void {
    if (
      typeof workflowId !== "string" ||
      workflowId.trim().length === 0
    ) {
      throw new WorkflowDeploymentError(
        "Workflow id is required.",
        "VALIDATION_ERROR",
      );
    }
  }

  private validateEnvironment(environment: string): void {
    if (
      typeof environment !== "string" ||
      environment.trim().length === 0
    ) {
      throw new WorkflowDeploymentError(
        "Deployment environment is required.",
        "VALIDATION_ERROR",
      );
    }
  }

  private validateStatus(
    status: WorkflowDeploymentStatus,
  ): void {
    const validStatuses: WorkflowDeploymentStatus[] = [
      "pending",
      "deploying",
      "deployed",
      "failed",
      "rolled_back",
    ];

    if (!validStatuses.includes(status)) {
      throw new WorkflowDeploymentError(
        "Invalid deployment status.",
        "VALIDATION_ERROR",
      );
    }
  }
}

export const workflowDeploymentService =
  new WorkflowDeploymentService();
