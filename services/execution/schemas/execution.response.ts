import type { ExecutionRecord, ExecutionResult } from "../execution.types.js";

export function toExecutionResult(
  execution: ExecutionRecord
): ExecutionResult {
  return {
    id: execution.id,
    status: execution.status,
    ...(execution.result !== undefined ? { result: execution.result } : {}),
    ...(execution.error !== undefined ? { error: execution.error } : {}),
    ...(execution.startedAt && execution.completedAt
      ? {
          durationMs:
            execution.completedAt.getTime() - execution.startedAt.getTime()
        }
      : {})
  };
}
