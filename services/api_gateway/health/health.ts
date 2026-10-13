import type {
  HealthCheck,
  HealthCheckResult,
} from "./checks.js";

export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  checks: HealthCheckResult[];
  timestamp: string;
}

export class HealthManager {
  constructor(
    private readonly checks: HealthCheck[] = [],
  ) {}

  addCheck(check: HealthCheck): void {
    this.checks.push(check);
  }

  async check(): Promise<HealthStatus> {
    const results: HealthCheckResult[] = [];

    for (const check of this.checks) {
      results.push(await check());
    }

    const failed = results.filter(
      (result) => !result.healthy,
    );

    return {
      status:
        failed.length === 0
          ? "healthy"
          : failed.length === results.length
            ? "unhealthy"
            : "degraded",
      checks: results,
      timestamp: new Date().toISOString(),
    };
  }
}
