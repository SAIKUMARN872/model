export type HealthStatus = "healthy" | "unhealthy" | "degraded";

export interface HealthCheckResult {
  name: string;
  status: HealthStatus;
  responseTimeMs: number;
  message?: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface HealthCheckOptions {
  timeoutMs?: number;
}

export type HealthCheckFunction = () => Promise<
  Omit<HealthCheckResult, "name" | "timestamp" | "responseTimeMs">
>;

function now(): number {
  return Date.now();
}

function createTimeout(timeoutMs: number): {
  promise: Promise<never>;
  cancel: () => void;
} {
  let timer: ReturnType<typeof setTimeout>;

  const promise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Health check timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  return {
    promise,
    cancel: () => clearTimeout(timer),
  };
}

export async function runHealthCheck(
  name: string,
  check: HealthCheckFunction,
  options: HealthCheckOptions = {},
): Promise<HealthCheckResult> {
  if (!name.trim()) {
    throw new Error("Health check name is required.");
  }

  const timeoutMs = options.timeoutMs ?? 5000;

  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) {
    throw new Error("timeoutMs must be a positive integer.");
  }

  const start = now();
  const timeout = createTimeout(timeoutMs);

  try {
    const result = await Promise.race([
      check(),
      timeout.promise,
    ]);

    return {
      name,
      status: result.status,
      responseTimeMs: now() - start,
      ...(result.message ? { message: result.message } : {}),
      ...(result.details ? { details: result.details } : {}),
      timestamp: new Date().toISOString(),
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Health check failed.";

    return {
      name,
      status: "unhealthy",
      responseTimeMs: now() - start,
      message,
      timestamp: new Date().toISOString(),
    };
  } finally {
    timeout.cancel();
  }
}

export async function checkProcess(
  options: HealthCheckOptions = {},
): Promise<HealthCheckResult> {
  return runHealthCheck(
    "process",
    async () => ({
      status: "healthy",
      message: "Process is running.",
      details: {
        pid: process.pid,
        uptimeSeconds: Math.floor(process.uptime()),
        nodeVersion: process.version,
        memoryUsage: process.memoryUsage(),
      },
    }),
    options,
  );
}

export async function checkMemory(
  maxHeapUsedMb = 1024,
): Promise<HealthCheckResult> {
  if (!Number.isFinite(maxHeapUsedMb) || maxHeapUsedMb <= 0) {
    throw new Error("maxHeapUsedMb must be greater than zero.");
  }

  return runHealthCheck("memory", async () => {
    const memory = process.memoryUsage();

    const heapUsedMb =
      memory.heapUsed / (1024 * 1024);

    const status: HealthStatus =
      heapUsedMb > maxHeapUsedMb
        ? "degraded"
        : "healthy";

    return {
      status,
      message:
        status === "healthy"
          ? "Memory usage is within limits."
          : "Memory usage is above the configured limit.",
      details: {
        heapUsedMb: Number(heapUsedMb.toFixed(2)),
        heapTotalMb: Number(
          (memory.heapTotal / (1024 * 1024)).toFixed(2),
        ),
        rssMb: Number(
          (memory.rss / (1024 * 1024)).toFixed(2),
        ),
        externalMb: Number(
          (memory.external / (1024 * 1024)).toFixed(2),
        ),
        limitMb: maxHeapUsedMb,
      },
    };
  });
}

export async function checkEnvironment(
  requiredVariables: string[] = [],
): Promise<HealthCheckResult> {
  return runHealthCheck(
    "environment",
    async () => {
      const missing = requiredVariables.filter(
        (variable) => {
          const value = process.env[variable];
          return !value || value.trim() === "";
        },
      );

      if (missing.length > 0) {
        return {
          status: "unhealthy",
          message: "Required environment variables are missing.",
          details: {
            missingVariables: missing,
          },
        };
      }

      return {
        status: "healthy",
        message: "Required environment variables are configured.",
      };
    },
  );
}