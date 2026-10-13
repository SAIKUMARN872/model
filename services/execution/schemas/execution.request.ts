import type { CreateExecutionInput } from "../execution.types.js";

export function validateCreateExecutionInput(
  value: unknown
): CreateExecutionInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError("Execution request must be an object.");
  }

  const input = value as Record<string, unknown>;

  if (typeof input.task !== "string" || input.task.trim().length === 0) {
    throw new TypeError("task must be a non-empty string.");
  }

  if (
    input.input !== undefined &&
    (typeof input.input !== "object" ||
      input.input === null ||
      Array.isArray(input.input))
  ) {
    throw new TypeError("input must be an object.");
  }

  if (
    input.metadata !== undefined &&
    (typeof input.metadata !== "object" ||
      input.metadata === null ||
      Array.isArray(input.metadata))
  ) {
    throw new TypeError("metadata must be an object.");
  }

  if (
    input.maxAttempts !== undefined &&
    (!Number.isInteger(input.maxAttempts) || Number(input.maxAttempts) < 1)
  ) {
    throw new TypeError("maxAttempts must be a positive integer.");
  }

  return {
    task: input.task.trim(),
    input: (input.input as Record<string, unknown> | undefined) ?? {},
    metadata: (input.metadata as Record<string, unknown> | undefined) ?? {},
    maxAttempts: input.maxAttempts as number | undefined
  };
}
