export interface ExecutionConfig {
  defaultMaxAttempts: number;
  maxConcurrent: number;
  retryDelayMs: number;
  retentionMs: number;
}

export const executionConfig: Readonly<ExecutionConfig> = Object.freeze({
  defaultMaxAttempts: 3,
  maxConcurrent: 5,
  retryDelayMs: 1_000,
  retentionMs: 24 * 60 * 60 * 1_000
});

export function validateExecutionConfig(
  config: ExecutionConfig
): ExecutionConfig {
  for (const [key, value] of Object.entries(config)) {
    if (!Number.isFinite(value) || value < 0) {
      throw new TypeError(`${key} must be a non-negative number.`);
    }
  }

  if (config.defaultMaxAttempts < 1 || config.maxConcurrent < 1) {
    throw new TypeError(
      "defaultMaxAttempts and maxConcurrent must be at least 1."
    );
  }

  return { ...config };
}
