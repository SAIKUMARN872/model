export interface HealthCheckResult {
  name: string;
  healthy: boolean;
  message?: string;
  latencyMs?: number;
}

export type HealthCheck = () =>
  | HealthCheckResult
  | Promise<HealthCheckResult>;

export async function runHealthCheck(
  name: string,
  check: () => boolean | Promise<boolean>,
): Promise<HealthCheckResult> {
  const started = Date.now();

  try {
    const healthy = await check();

    return {
      name,
      healthy,
      latencyMs: Date.now() - started,
    };
  } catch (error) {
    return {
      name,
      healthy: false,
      message:
        error instanceof Error
          ? error.message
          : "Health check failed",
      latencyMs: Date.now() - started,
    };
  }
}
