import type {
  CreateFineTuningJobInput,
  FineTuningJob,
  FineTuningStatus
} from "../fine-tuning.types.js";

export function validateCreateJobInput(value: unknown): CreateFineTuningJobInput {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError("Job input must be an object.");
  }

  const input = value as Record<string, unknown>;

  if (typeof input.datasetId !== "string" || !input.datasetId.trim()) {
    throw new TypeError("datasetId is required.");
  }

  if (typeof input.baseModel !== "string" || !input.baseModel.trim()) {
    throw new TypeError("baseModel is required.");
  }

  const hyperparameters = input.hyperparameters ?? {};

  if (
    typeof hyperparameters !== "object" ||
    hyperparameters === null ||
    Array.isArray(hyperparameters)
  ) {
    throw new TypeError("hyperparameters must be an object.");
  }

  for (const [key, value] of Object.entries(
    hyperparameters as Record<string, unknown>
  )) {
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
      throw new TypeError(`Hyperparameter '${key}' must be a positive number.`);
    }
  }

  return {
    datasetId: input.datasetId.trim(),
    baseModel: input.baseModel.trim(),
    hyperparameters: hyperparameters as Record<string, number>
  };
}

export function createFineTuningJob(
  id: string,
  input: CreateFineTuningJobInput
): FineTuningJob {
  const now = new Date();

  return {
    id,
    datasetId: input.datasetId,
    baseModel: input.baseModel,
    status: "queued",
    hyperparameters: structuredClone(input.hyperparameters ?? {}),
    progress: 0,
    createdAt: now,
    updatedAt: now
  };
}

export function assertJobTransition(
  current: FineTuningStatus,
  next: FineTuningStatus
): void {
  const allowed: Record<FineTuningStatus, FineTuningStatus[]> = {
    queued: ["running", "cancelled"],
    running: ["succeeded", "failed", "cancelled"],
    succeeded: [],
    failed: ["queued"],
    cancelled: []
  };

  if (!allowed[current].includes(next)) {
    throw new Error(`Invalid job transition: ${current} -> ${next}`);
  }
}
