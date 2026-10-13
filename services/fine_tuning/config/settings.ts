import type { FineTuningSettings } from "../fine-tuning.types.js";

export const defaultFineTuningSettings: Readonly<FineTuningSettings> =
  Object.freeze({
    autoDeploy: false,
    retainCompletedJobs: true,
    maxRetries: 2
  });

export function validateFineTuningSettings(
  settings: FineTuningSettings
): FineTuningSettings {
  if (!Number.isInteger(settings.maxRetries) || settings.maxRetries < 0) {
    throw new TypeError("maxRetries must be a non-negative integer.");
  }

  if (
    typeof settings.autoDeploy !== "boolean" ||
    typeof settings.retainCompletedJobs !== "boolean"
  ) {
    throw new TypeError("Settings flags must be boolean values.");
  }

  return { ...settings };
}
