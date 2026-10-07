import {
  CreateWorkflowExecutionInput,
  UpdateWorkflowExecutionInput,
  WorkflowExecution,
} from "./execution-schema.js";

export interface WorkflowExecutionRepository {
  create(input: CreateWorkflowExecutionInput): WorkflowExecution;
  findById(id: string): WorkflowExecution | undefined;
  findByWorkflowId(workflowId: string): WorkflowExecution[];
  findAll(): WorkflowExecution[];
  update(
    id: string,
    input: UpdateWorkflowExecutionInput,
  ): WorkflowExecution | undefined;
  delete(id: string): boolean;
}

export class InMemoryWorkflowExecutionRepository
  implements WorkflowExecutionRepository
{
  private readonly executions =
    new Map<string, WorkflowExecution>();

  create(
    input: CreateWorkflowExecutionInput,
  ): WorkflowExecution {
    const now = new Date().toISOString();

    const execution: WorkflowExecution = {
      id: `workflow_execution_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 10)}`,
      workflowId: input.workflowId,
      versionId: input.versionId,
      input: structuredClone(input.input),
      status: "queued",
      createdAt: now,
      updatedAt: now,
    };

    this.executions.set(execution.id, execution);

    return structuredClone(execution);
  }

  findById(id: string): WorkflowExecution | undefined {
    const execution = this.executions.get(id);

    return execution
      ? structuredClone(execution)
      : undefined;
  }

  findByWorkflowId(
    workflowId: string,
  ): WorkflowExecution[] {
    return Array.from(this.executions.values())
      .filter(
        (execution) =>
          execution.workflowId === workflowId,
      )
      .map((execution) => structuredClone(execution));
  }

  findAll(): WorkflowExecution[] {
    return Array.from(this.executions.values()).map(
      (execution) => structuredClone(execution),
    );
  }

  update(
    id: string,
    input: UpdateWorkflowExecutionInput,
  ): WorkflowExecution | undefined {
    const existing = this.executions.get(id);

    if (!existing) {
      return undefined;
    }

    const now = new Date().toISOString();

    const updated: WorkflowExecution = {
      ...existing,
      ...(input.status !== undefined
        ? { status: input.status }
        : {}),
      ...(input.output !== undefined
        ? { output: structuredClone(input.output) }
        : {}),
      ...(input.error !== undefined
        ? { error: input.error }
        : {}),
      ...(input.status === "running" &&
      existing.startedAt === undefined
        ? { startedAt: now }
        : {}),
      ...(input.status === "completed" ||
      input.status === "failed" ||
      input.status === "cancelled"
        ? { completedAt: now }
        : {}),
      updatedAt: now,
    };

    this.executions.set(id, updated);

    return structuredClone(updated);
  }

  delete(id: string): boolean {
    return this.executions.delete(id);
  }
}
