import { EventEmitter } from "node:events";
import type { ExecutionRecord } from "../execution.types.js";

export type ExecutionEventName =
  | "execution:created"
  | "execution:started"
  | "execution:succeeded"
  | "execution:failed"
  | "execution:cancelled"
  | "execution:retried";

export interface ExecutionEventMap {
  "execution:created": ExecutionRecord;
  "execution:started": ExecutionRecord;
  "execution:succeeded": ExecutionRecord;
  "execution:failed": ExecutionRecord;
  "execution:cancelled": ExecutionRecord;
  "execution:retried": ExecutionRecord;
}

class TypedExecutionEmitter extends EventEmitter {
  emitEvent<K extends ExecutionEventName>(
    event: K,
    record: ExecutionEventMap[K]
  ): boolean {
    return this.emit(event, structuredClone(record));
  }

  onEvent<K extends ExecutionEventName>(
    event: K,
    listener: (record: ExecutionEventMap[K]) => void
  ): this {
    this.on(event, listener);
    return this;
  }

  offEvent<K extends ExecutionEventName>(
    event: K,
    listener: (record: ExecutionEventMap[K]) => void
  ): this {
    this.off(event, listener);
    return this;
  }
}

export const executionEvents = new TypedExecutionEmitter();
