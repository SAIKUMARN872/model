import type {
  CreateExecutionInput,
  ExecutionRecord,
  ExecutionStatus
} from "../execution.types.js";

export function createExecutionRecord(
  id: string,
  input: CreateExecutionInput,
  now = new Date()
): ExecutionRecord {
  return {
    id,
    task: input.task,
    input: structuredClone(input.input ?? {}),
    metadata: structuredClone(input.metadata ?? {}),
    status: "queued",
    attempts: 0,
    maxAttempts: input.maxAttempts ?? 3,
    createdAt: new Date(now),
    updatedAt: new Date(now)
  };
}

export function isTerminalStatus(status: ExecutionStatus): boolean {
  return (
    status === "succeeded" ||
    status === "failed" ||
    status === "cancelled"
  );
}

export function assertValidTransition(
  current: ExecutionStatus,
  next: ExecutionStatus
): void {
  const allowed: Record<ExecutionStatus, ExecutionStatus[]> = {
    queued: ["running", "cancelled"],
    running: ["succeeded", "failed", "queued", "cancelled"],
    succeeded: [],
    failed: ["queued"],
    cancelled: []
  };

  if (!allowed[current].includes(next)) {
    throw new Error(`Invalid execution transition: ${current} -> ${next}`);
  }
}
