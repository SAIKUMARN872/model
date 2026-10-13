import {
  AgentExecution,
  CreateExecutionInput,
  ExecutionStatus,
  UpdateExecutionInput,
} from "./execution-schema.js";

import {
  ExecutionRepository,
  InMemoryExecutionRepository,
} from "./execution-repository.js";

export class ExecutionNotFoundError extends Error {
  constructor(id: string) {
    super(`Execution not found: ${id}`);
    this.name = "ExecutionNotFoundError";
  }
}

export class InvalidExecutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidExecutionError";
  }
}

export class AgentExecutionService {
  constructor(
    private readonly repository: ExecutionRepository =
      new InMemoryExecutionRepository(),
  ) {}

  create(
    input: CreateExecutionInput,
  ): AgentExecution {
    if (
      !input ||
      typeof input.agentId !== "string" ||
      input.agentId.trim().length === 0
    ) {
      throw new InvalidExecutionError(
        "Agent id is required",
      );
    }

    return this.repository.create({
      agentId: input.agentId.trim(),
      input: input.input,
    });
  }

  getById(id: string): AgentExecution {
    this.validateId(id);

    const execution =
      this.repository.findById(id);

    if (!execution) {
      throw new ExecutionNotFoundError(id);
    }

    return execution;
  }

  list(): AgentExecution[] {
    return this.repository.findAll();
  }

  listByAgentId(
    agentId: string,
  ): AgentExecution[] {
    if (
      typeof agentId !== "string" ||
      agentId.trim().length === 0
    ) {
      throw new InvalidExecutionError(
        "Agent id is required",
      );
    }

    return this.repository.findByAgentId(
      agentId.trim(),
    );
  }

  update(
    id: string,
    input: UpdateExecutionInput,
  ): AgentExecution {
    this.validateId(id);

    if (!input || typeof input !== "object") {
      throw new InvalidExecutionError(
        "Execution update is required",
      );
    }

    this.validateStatus(input.status);

    if (!this.repository.findById(id)) {
      throw new ExecutionNotFoundError(id);
    }

    const updated =
      this.repository.update(id, input);

    if (!updated) {
      throw new ExecutionNotFoundError(id);
    }

    return updated;
  }

  start(id: string): AgentExecution {
    return this.update(id, {
      status: "running",
    });
  }

  complete(
    id: string,
    output?: unknown,
  ): AgentExecution {
    return this.update(id, {
      status: "completed",
      output,
    });
  }

  fail(
    id: string,
    error: string,
  ): AgentExecution {
    if (
      typeof error !== "string" ||
      error.trim().length === 0
    ) {
      throw new InvalidExecutionError(
        "Execution error is required",
      );
    }

    return this.update(id, {
      status: "failed",
      error: error.trim(),
    });
  }

  cancel(id: string): AgentExecution {
    return this.update(id, {
      status: "cancelled",
    });
  }

  delete(id: string): void {
    this.validateId(id);

    if (!this.repository.delete(id)) {
      throw new ExecutionNotFoundError(id);
    }
  }

  private validateId(id: string): void {
    if (
      typeof id !== "string" ||
      id.trim().length === 0
    ) {
      throw new InvalidExecutionError(
        "Execution id is required",
      );
    }
  }

  private validateStatus(
    status: ExecutionStatus | undefined,
  ): void {
    if (
      status !== undefined &&
      status !== "queued" &&
      status !== "running" &&
      status !== "completed" &&
      status !== "failed" &&
      status !== "cancelled"
    ) {
      throw new InvalidExecutionError(
        "Invalid execution status",
      );
    }
  }
}

