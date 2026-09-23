export type TargetHealthStatus =
  | "healthy"
  | "unhealthy"
  | "unknown";

export interface HealthCheckTarget {
  id: string;
  url: string;
}

export interface TargetHealthResult {
  targetId: string;
  url: string;
  status: TargetHealthStatus;
  responseTimeMs: number;
  statusCode?: number;
  error?: string;
  checkedAt: string;
}

export interface HealthCheckOptions {
  timeoutMs?: number;
  path?: string;
  fetchImplementation?: typeof fetch;
}

export class LoadBalancerHealthChecker {
  private readonly results = new Map<
    string,
    TargetHealthResult
  >();

  async checkTarget(
    target: HealthCheckTarget,
    options: HealthCheckOptions = {},
  ): Promise<TargetHealthResult> {
    const timeoutMs = options.timeoutMs ?? 5000;
    const path = options.path ?? "/health";

    if (!target.id.trim()) {
      throw new Error("Target ID is required.");
    }

    if (!target.url.trim()) {
      throw new Error("Target URL is required.");
    }

    if (
      !Number.isInteger(timeoutMs) ||
      timeoutMs <= 0
    ) {
      throw new Error(
        "timeoutMs must be a positive integer.",
      );
    }

    const fetchImplementation =
      options.fetchImplementation ?? fetch;

    const start = Date.now();

    try {
      const controller = new AbortController();

      const timeout = setTimeout(() => {
        controller.abort();
      }, timeoutMs);

      try {
        const baseUrl = target.url.replace(/\/+$/, "");
        const healthPath = path.startsWith("/")
          ? path
          : `/${path}`;

        const response = await fetchImplementation(
          `${baseUrl}${healthPath}`,
          {
            method: "GET",
            signal: controller.signal,
            headers: {
              Accept: "application/json",
            },
          },
        );

        const responseTimeMs =
          Date.now() - start;

        const result: TargetHealthResult = {
          targetId: target.id,
          url: target.url,
          status: response.ok
            ? "healthy"
            : "unhealthy",
          responseTimeMs,
          statusCode: response.status,
          checkedAt: new Date().toISOString(),
        };

        this.results.set(target.id, result);

        return result;
      } finally {
        clearTimeout(timeout);
      }
    } catch (error: unknown) {
      const responseTimeMs =
        Date.now() - start;

      const message =
        error instanceof Error
          ? error.message
          : "Health check failed.";

      const result: TargetHealthResult = {
        targetId: target.id,
        url: target.url,
        status: "unhealthy",
        responseTimeMs,
        error: message,
        checkedAt: new Date().toISOString(),
      };

      this.results.set(target.id, result);

      return result;
    }
  }

  async checkTargets(
    targets: HealthCheckTarget[],
    options: HealthCheckOptions = {},
  ): Promise<TargetHealthResult[]> {
    return Promise.all(
      targets.map((target) =>
        this.checkTarget(target, options),
      ),
    );
  }

  getResult(
    targetId: string,
  ): TargetHealthResult | undefined {
    return this.results.get(targetId);
  }

  getHealthyTargetIds(): Set<string> {
    const healthy = new Set<string>();

    for (const result of this.results.values()) {
      if (result.status === "healthy") {
        healthy.add(result.targetId);
      }
    }

    return healthy;
  }

  getAllResults(): TargetHealthResult[] {
    return Array.from(this.results.values());
  }

  remove(targetId: string): boolean {
    return this.results.delete(targetId);
  }

  clear(): void {
    this.results.clear();
  }

  health(): {
    status: "ok";
    component: string;
    targetsChecked: number;
  } {
    return {
      status: "ok",
      component: "load-balancer-health-checker",
      targetsChecked: this.results.size,
    };
  }
}