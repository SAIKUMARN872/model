import type { FineTuningConfig } from "../fine-tuning.types.js";

export const fineTuningConfig: Readonly<FineTuningConfig> = Object.freeze({
  defaultBaseModel: "base-model",
  maxDatasetRecords: 100_000,
  maxConcurrentJobs: 2,
  defaultEpochs: 3,
  defaultLearningRate: 0.0001
});

export function validateFineTuningConfig(
  config: FineTuningConfig
): FineTuningConfig {
  if (!config.defaultBaseModel.trim()) {
    throw new TypeError("defaultBaseModel is required.");
  }

  if (
    !Number.isInteger(config.maxDatasetRecords) ||
    config.maxDatasetRecords < 1
  ) {
    throw new TypeError("maxDatasetRecords must be a positive integer.");
  }

  if (
    !Number.isInteger(config.maxConcurrentJobs) ||
    config.maxConcurrentJobs < 1
  ) {
    throw new TypeError("maxConcurrentJobs must be a positive integer.");
  }

  if (!Number.isFinite(config.defaultEpochs) || config.defaultEpochs <= 0) {
    throw new TypeError("defaultEpochs must be positive.");
  }

  if (
    !Number.isFinite(config.defaultLearningRate) ||
    config.defaultLearningRate <= 0
  ) {
    throw new TypeError("defaultLearningRate must be positive.");
  }

  return { ...config };
}
