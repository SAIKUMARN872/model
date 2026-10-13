import type { CreateExecutionInput, ExecutionRecord } from "../execution.types.js";
import { createExecutionRecord } from "../schemas/execution.schema.js";

export class ExecutionJob {
  readonly record: ExecutionRecord;

  constructor(id: string, input: CreateExecutionInput) {
    this.record = createExecutionRecord(id, input);
  }

  get id(): string {
    return this.record.id;
  }

  get task(): string {
    return this.record.task;
  }
}
