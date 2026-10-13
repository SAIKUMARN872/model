import type {
  FineTuningDeployment,
  FineTuningStatus
} from "../fine-tuning.types.js";

export function validateDeploymentJobStatus(status: FineTuningStatus): void {
  if (status !== "succeeded") {
    throw new Error("A deployment requires a successfully completed training job.");
  }
}

export function createDeploymentRecord(
  id: string,
  jobId: string,
  model: string,
  endpoint: string
): FineTuningDeployment {
  const now = new Date();

  return {
    id,
    jobId,
    model,
    endpoint,
    status: "creating",
    createdAt: now,
    updatedAt: now
  };
}
