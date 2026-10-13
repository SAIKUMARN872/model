import type { ExecutionRecord, ExecutionStatus } from "../execution.types.js";
import { assertValidTransition } from "../schemas/execution.schema.js";
import { ExecutionRepository } from "../repository/execution.repository.js";
import { executionEvents } from "../events/execution.events.js";

export class ExecutionLifecycle {
  constructor(private readonly repository: ExecutionRepository) {}

  async start(id: string): Promise<ExecutionRecord> {
    const record = await this.requireRecord(id);
    assertValidTransition(record.status, "running");

    const updated = await this.repository.update(id, {
      status: "running",
      attempts: record.attempts + 1,
      startedAt: new Date(),
      completedAt: undefined,
      error: undefined,
      result: undefined
    });

    executionEvents.emitEvent("execution:started", updated);
    return updated;
  }

  async succeed(id: string, result: unknown): Promise<ExecutionRecord> {
    const record = await this.requireRecord(id);
    assertValidTransition(record.status, "succeeded");

    const updated = await this.repository.update(id, {
      status: "succeeded",
      result: structuredClone(result),
      error: undefined,
      completedAt: new Date()
    });

    executionEvents.emitEvent("execution:succeeded", updated);
    return updated;
  }

  async fail(id: string, error: unknown): Promise<ExecutionRecord> {
    const record = await this.requireRecord(id);
    assertValidTransition(record.status, "failed");

    const message = error instanceof Error ? error.message : String(error);
    const updated = await this.repository.update(id, {
      status: "failed",
      error: message,
      completedAt: new Date()
    });

    executionEvents.emitEvent("execution:failed", updated);
    return updated;
  }

  async retry(id: string): Promise<ExecutionRecord> {
    const record = await this.requireRecord(id);

    if (record.status !== "failed") {
      throw new Error("Only failed executions can be retried.");
    }

    if (record.attempts >= record.maxAttempts) {
      throw new Error("Maximum execution attempts reached.");
    }

    assertValidTransition(record.status, "queued");

    const updated = await this.repository.update(id, {
      status: "queued",
      error: undefined,
      result: undefined,
      startedAt: undefined,
      completedAt: undefined
    });

    executionEvents.emitEvent("execution:retried", updated);
    return updated;
  }

  async cancel(id: string): Promise<ExecutionRecord> {
    const record = await this.requireRecord(id);
    assertValidTransition(record.status, "cancelled");

    const updated = await this.repository.update(id, {
      status: "cancelled",
      completedAt: new Date()
    });

    executionEvents.emitEvent("execution:cancelled", updated);
    return updated;
  }

  private async requireRecord(id: string): Promise<ExecutionRecord> {
    const record = await this.repository.getById(id);

    if (!record) {
      throw new Error(`Execution '${id}' was not found.`);
    }

    return record;
  }

  async setStatus(
    id: string,
    status: ExecutionStatus
  ): Promise<ExecutionRecord> {
    const record = await this.requireRecord(id);
    assertValidTransition(record.status, status);
    return this.repository.update(id, { status });
  }
}
