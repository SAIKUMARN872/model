import {
  CreateWorkflowExecutionInput,
  UpdateWorkflowExecutionInput,
  WorkflowExecution,
  WorkflowExecutionStatus,
} from "./execution-schema.js";

import {
  InMemoryWorkflowExecutionRepository,
  WorkflowExecutionRepository,
} from "./execution-repository.js";

export class WorkflowExecutionError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = "WorkflowExecutionError";
  }
}

export class WorkflowExecutionService {
  constructor(
    private readonly repository: WorkflowExecutionRepository =
      new InMemoryWorkflowExecutionRepository(),
  ) {}

  create(
    input: CreateWorkflowExecutionInput,
  ): WorkflowExecution {
    this.validateWorkflowId(input?.workflowId);

    return this.repository.create({
      workflowId: input.workflowId.trim(),
      versionId: input.versionId?.trim(),
      input: structuredClone(input.input),
    });
  }

  getById(id: string): WorkflowExecution {
    this.validateId(id);

    const execution = this.repository.findById(id);

    if (!execution) {
      throw new WorkflowExecutionError(
        "Execution not found.",
        "EXECUTION_NOT_FOUND",
      );
    }

    return execution;
  }

  list(): WorkflowExecution[] {
    return this.repository.findAll();
  }

  listByWorkflowId(
    workflowId: string,
  ): WorkflowExecution[] {
    this.validateWorkflowId(workflowId);
    return this.repository.findByWorkflowId(
      workflowId.trim(),
    );
  }

  update(
    id: string,
    input: UpdateWorkflowExecutionInput,
  ): WorkflowExecution {
    this.validateId(id);

    if (!input || typeof input !== "object") {
      throw new WorkflowExecutionError(
        "Execution update is required.",
        "VALIDATION_ERROR",
      );
    }

    if (input.status !== undefined) {
      this.validateStatus(input.status);
    }

    const updated = this.repository.update(id, input);

    if (!updated) {
      throw new WorkflowExecutionError(
        "Execution not found.",
        "EXECUTION_NOT_FOUND",
      );
    }

    return updated;
  }

  start(id: string): WorkflowExecution {
    return this.update(id, {
      status: "running",
    });
  }

  complete(
    id: string,
    output?: unknown,
  ): WorkflowExecution {
    return this.update(id, {
      status: "completed",
      output: structuredClone(output),
    });
  }

  fail(
    id: string,
    error: string,
  ): WorkflowExecution {
    if (
      typeof error !== "string" ||
      error.trim().length === 0
    ) {
      throw new WorkflowExecutionError(
        "Execution error is required.",
        "VALIDATION_ERROR",
      );
    }

    return this.update(id, {
      status: "failed",
      error: error.trim(),
    });
  }

  cancel(id: string): WorkflowExecution {
    return this.update(id, {
      status: "cancelled",
    });
  }

  delete(id: string): boolean {
    this.validateId(id);

    if (!this.repository.delete(id)) {
      throw new WorkflowExecutionError(
        "Execution not found.",
        "EXECUTION_NOT_FOUND",
      );
    }

    return true;
  }

  private validateId(id: string): void {
    if (
      typeof id !== "string" ||
      id.trim().length === 0
    ) {
      throw new WorkflowExecutionError(
        "Execution id is required.",
        "VALIDATION_ERROR",
      );
    }
  }

  private validateWorkflowId(workflowId: string): void {
    if (
      typeof workflowId !== "string" ||
      workflowId.trim().length === 0
    ) {
      throw new WorkflowExecutionError(
        "Workflow id is required.",
        "VALIDATION_ERROR",
      );
    }
  }

  private validateStatus(
    status: WorkflowExecutionStatus,
  ): void {
    const validStatuses: WorkflowExecutionStatus[] = [
      "queued",
      "running",
      "completed",
      "failed",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      throw new WorkflowExecutionError(
        "Invalid execution status.",
        "VALIDATION_ERROR",
      );
    }
  }
}

export const workflowExecutionService =
  new WorkflowExecutionService();
