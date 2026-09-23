import {
  checkEnvironment,
  checkMemory,
  checkProcess,
  runHealthCheck,
  type HealthCheckFunction,
  type HealthCheckResult,
  type HealthStatus,
} from "./checks.js";

export interface HealthOptions {
  timeoutMs?: number;
  requiredEnvironmentVariables?: string[];
  maxHeapUsedMb?: number;
}

export interface HealthReport {
  status: HealthStatus;
  service: string;
  version: string;
  timestamp: string;
  uptimeSeconds: number;
  checks: HealthCheckResult[];
}

export interface ReadinessReport extends HealthReport {
  ready: boolean;
}

export interface LivenessReport extends HealthReport {
  alive: boolean;
}

export class HealthService {
  private readonly serviceName: string;
  private readonly version: string;

  private customChecks: Map<
    string,
    HealthCheckFunction
  > = new Map();

  constructor(
    serviceName = "modelnow-api-gateway",
    version = "1.0.0",
  ) {
    if (!serviceName.trim()) {
      throw new Error("Service name is required.");
    }

    if (!version.trim()) {
      throw new Error("Service version is required.");
    }

    this.serviceName = serviceName;
    this.version = version;
  }

  registerCheck(
    name: string,
    check: HealthCheckFunction,
  ): void {
    if (!name.trim()) {
      throw new Error("Health check name is required.");
    }

    if (this.customChecks.has(name)) {
      throw new Error(
        `Health check already exists: ${name}`,
      );
    }

    this.customChecks.set(name, check);
  }

  removeCheck(name: string): boolean {
    return this.customChecks.delete(name);
  }

  hasCheck(name: string): boolean {
    return this.customChecks.has(name);
  }

  getCheckNames(): string[] {
    return Array.from(this.customChecks.keys());
  }

  async check(
    options: HealthOptions = {},
  ): Promise<HealthReport> {
    const checks: HealthCheckResult[] = [];

    checks.push(
      await checkProcess({
        timeoutMs: options.timeoutMs,
      }),
    );

    checks.push(
      await checkMemory(
        options.maxHeapUsedMb ?? 1024,
      ),
    );

    if (
      options.requiredEnvironmentVariables &&
      options.requiredEnvironmentVariables.length > 0
    ) {
      checks.push(
        await checkEnvironment(
          options.requiredEnvironmentVariables,
        ),
      );
    }

    for (const [name, customCheck] of this.customChecks) {
      checks.push(
        await runHealthCheck(
          name,
          customCheck,
          {
            timeoutMs: options.timeoutMs,
          },
        ),
      );
    }

    const status = this.calculateStatus(checks);

    return {
      status,
      service: this.serviceName,
      version: this.version,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      checks,
    };
  }

  async liveness(
    options: HealthOptions = {},
  ): Promise<LivenessReport> {
    const processCheck = await checkProcess({
      timeoutMs: options.timeoutMs,
    });

    const alive =
      processCheck.status !== "unhealthy";

    return {
      status: alive ? "healthy" : "unhealthy",
      service: this.serviceName,
      version: this.version,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      checks: [processCheck],
      alive,
    };
  }

  async readiness(
    options: HealthOptions = {},
  ): Promise<ReadinessReport> {
    const report = await this.check(options);

    const ready = report.status === "healthy";

    return {
      ...report,
      ready,
    };
  }

  health(): {
    status: "ok";
    component: string;
    checks: number;
  } {
    return {
      status: "ok",
      component: "health-service",
      checks: this.customChecks.size,
    };
  }

  private calculateStatus(
    checks: HealthCheckResult[],
  ): HealthStatus {
    if (checks.length === 0) {
      return "healthy";
    }

    if (
      checks.some(
        (check) => check.status === "unhealthy",
      )
    ) {
      return "unhealthy";
    }

    if (
      checks.some(
        (check) => check.status === "degraded",
      )
    ) {
      return "degraded";
    }

    return "healthy";
  }
}