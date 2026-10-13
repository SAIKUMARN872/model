import {
  AgentExecution,
  CreateExecutionInput,
  UpdateExecutionInput,
} from "./execution-schema.js";

export interface ExecutionRepository {
  create(input: CreateExecutionInput): AgentExecution;
  findById(id: string): AgentExecution | undefined;
  findByAgentId(agentId: string): AgentExecution[];
  findAll(): AgentExecution[];
  update(
    id: string,
    input: UpdateExecutionInput,
  ): AgentExecution | undefined;
  delete(id: string): boolean;
}

export class InMemoryExecutionRepository
  implements ExecutionRepository
{
  private readonly executions = new Map<
    string,
    AgentExecution
  >();

  create(input: CreateExecutionInput): AgentExecution {
    const now = new Date().toISOString();

    const execution: AgentExecution = {
      id: `execution_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 10)}`,
      agentId: input.agentId,
      input: input.input,
      status: "queued",
      createdAt: now,
      updatedAt: now,
    };

    this.executions.set(execution.id, execution);

    return this.clone(execution);
  }

  findById(id: string): AgentExecution | undefined {
    const execution = this.executions.get(id);

    return execution
      ? this.clone(execution)
      : undefined;
  }

  findByAgentId(agentId: string): AgentExecution[] {
    return Array.from(this.executions.values())
      .filter(
        (execution) =>
          execution.agentId === agentId,
      )
      .map((execution) => this.clone(execution));
  }

  findAll(): AgentExecution[] {
    return Array.from(this.executions.values()).map(
      (execution) => this.clone(execution),
    );
  }

  update(
    id: string,
    input: UpdateExecutionInput,
  ): AgentExecution | undefined {
    const existing = this.executions.get(id);

    if (!existing) {
      return undefined;
    }

    const now = new Date().toISOString();

    const updated: AgentExecution = {
      ...existing,
      ...(input.status !== undefined
        ? { status: input.status }
        : {}),
      ...(input.output !== undefined
        ? { output: input.output }
        : {}),
      ...(input.error !== undefined
        ? { error: input.error }
        : {}),
      ...(input.status === "running" &&
      existing.startedAt === undefined
        ? { startedAt: now }
        : {}),
      ...((
        input.status === "completed" ||
        input.status === "failed" ||
        input.status === "cancelled"
      )
        ? { completedAt: now }
        : {}),
      updatedAt: now,
    };

    this.executions.set(id, updated);

    return this.clone(updated);
  }

  delete(id: string): boolean {
    return this.executions.delete(id);
  }

  private clone(
    execution: AgentExecution,
  ): AgentExecution {
    return {
      ...execution,
      input: this.cloneValue(execution.input),
      output: this.cloneValue(execution.output),
    };
  }

  private cloneValue<T>(value: T): T {
    if (value === undefined) {
      return value;
    }

    if (typeof structuredClone === "function") {
      return structuredClone(value);
    }

    return value;
  }
}

