import { randomUUID } from "node:crypto";
import type {
  CreateExecutionInput,
  ExecutionFilter,
  ExecutionHandler,
  ExecutionRecord
} from "../execution.types.js";
import { ExecutionRepository } from "../repository/execution.repository.js";
import { ExecutionLifecycle } from "./execution.lifecycle.js";
import { executionEvents } from "../events/execution.events.js";
import { validateCreateExecutionInput } from "../schemas/execution.request.js";
import { executionConfig } from "../config/execution.config.js";

export class ExecutionService {
  private readonly handlers = new Map<string, ExecutionHandler>();

  readonly lifecycle: ExecutionLifecycle;

  constructor(
    readonly repository = new ExecutionRepository(),
    private readonly idFactory: () => string = randomUUID
  ) {
    this.lifecycle = new ExecutionLifecycle(repository);
  }

  registerHandler(task: string, handler: ExecutionHandler): void {
    if (!task.trim()) throw new TypeError("Task name is required.");
    this.handlers.set(task, handler);
  }

  unregisterHandler(task: string): boolean {
    return this.handlers.delete(task);
  }

  async create(input: CreateExecutionInput): Promise<ExecutionRecord> {
    const validated = validateCreateExecutionInput(input);
    const id = this.idFactory();

    const record: ExecutionRecord = {
      id,
      task: validated.task,
      input: structuredClone(validated.input ?? {}),
      metadata: structuredClone(validated.metadata ?? {}),
      status: "queued",
      attempts: 0,
      maxAttempts:
        validated.maxAttempts ?? executionConfig.defaultMaxAttempts,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const created = await this.repository.create(record);
    executionEvents.emitEvent("execution:created", created);
    return created;
  }

  async get(id: string): Promise<ExecutionRecord> {
    const record = await this.repository.getById(id);
    if (!record) throw new Error(`Execution '${id}' was not found.`);
    return record;
  }

  async list(filter: ExecutionFilter = {}): Promise<ExecutionRecord[]> {
    return this.repository.list(filter);
  }

  async execute(id: string): Promise<ExecutionRecord> {
    const queued = await this.get(id);

    if (queued.status !== "queued") {
      throw new Error(`Cannot execute a job in '${queued.status}' state.`);
    }

    const handler = this.handlers.get(queued.task);
    if (!handler) {
      return this.lifecycle.fail(
        (await this.lifecycle.start(id)).id,
        new Error(`No handler registered for task '${queued.task}'.`)
      );
    }

    const running = await this.lifecycle.start(id);

    try {
      const result = await handler(structuredClone(running.input), running);
      return await this.lifecycle.succeed(id, result);
    } catch (error) {
      return this.lifecycle.fail(id, error);
    }
  }

  async retry(id: string): Promise<ExecutionRecord> {
    return this.lifecycle.retry(id);
  }

  async cancel(id: string): Promise<ExecutionRecord> {
    return this.lifecycle.cancel(id);
  }

  async remove(id: string): Promise<boolean> {
    const record = await this.get(id);

    if (record.status === "running") {
      throw new Error("Cannot remove a running execution.");
    }

    return this.repository.delete(id);
  }
}
