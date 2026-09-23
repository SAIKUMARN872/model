import {
  LeastConnectionsStrategy,
  RandomStrategy,
  RoundRobinStrategy,
  WeightedRoundRobinStrategy,
  type LoadBalancerTarget,
  type LoadBalancingStrategy,
} from "./strategy.js";

import {
  LoadBalancerHealthChecker,
  type HealthCheckOptions,
  type TargetHealthResult,
} from "./health_check.js";

export interface AddTargetOptions {
  weight?: number;
  metadata?: Record<string, unknown>;
}

export interface LoadBalancerOptions {
  strategy?:
    | LoadBalancingStrategy
    | "round-robin"
    | "random"
    | "weighted-round-robin"
    | "least-connections";

  healthCheck?: HealthCheckOptions;
}

export interface BalancerStats {
  totalTargets: number;
  healthyTargets: number;
  unhealthyTargets: number;
  requestsRouted: number;
  failedRoutes: number;
  strategy: string;
}

function resolveStrategy(
  strategy:
    | LoadBalancingStrategy
    | "round-robin"
    | "random"
    | "weighted-round-robin"
    | "least-connections",
): LoadBalancingStrategy {
  if (typeof strategy !== "string") {
    return strategy;
  }

  switch (strategy) {
    case "round-robin":
      return new RoundRobinStrategy();

    case "random":
      return new RandomStrategy();

    case "weighted-round-robin":
      return new WeightedRoundRobinStrategy();

    case "least-connections":
      return new LeastConnectionsStrategy();

    default:
      throw new Error(
        `Unsupported load balancing strategy: ${strategy}`,
      );
  }
}

export class LoadBalancer {
  private readonly targets = new Map<
    string,
    LoadBalancerTarget
  >();

  private readonly healthChecker: LoadBalancerHealthChecker;

  private strategy: LoadBalancingStrategy;

  private roundRobinIndex = 0;

  private requestsRouted = 0;

  private failedRoutes = 0;

  private readonly healthOptions?: HealthCheckOptions;

  constructor(options: LoadBalancerOptions = {}) {
    this.strategy = resolveStrategy(
      options.strategy ?? "round-robin",
    );

    this.healthChecker =
      new LoadBalancerHealthChecker();

    this.healthOptions = options.healthCheck;
  }

  addTarget(
    id: string,
    url: string,
    options: AddTargetOptions = {},
  ): LoadBalancerTarget {
    const targetId = id.trim();
    const targetUrl = url.trim();

    if (!targetId) {
      throw new Error("Target ID is required.");
    }

    if (!targetUrl) {
      throw new Error("Target URL is required.");
    }

    if (this.targets.has(targetId)) {
      throw new Error(
        `Target already exists: ${targetId}`,
      );
    }

    if (
      options.weight !== undefined &&
      (!Number.isInteger(options.weight) ||
        options.weight <= 0)
    ) {
      throw new Error(
        "Target weight must be a positive integer.",
      );
    }

    const target: LoadBalancerTarget = {
      id: targetId,
      url: targetUrl,
      weight: options.weight ?? 1,
      ...(options.metadata
        ? { metadata: options.metadata }
        : {}),
    };

    this.targets.set(targetId, target);

    return target;
  }

  updateTarget(
    id: string,
    updates: Partial<
      Pick<
        LoadBalancerTarget,
        "url" | "weight" | "metadata"
      >
    >,
  ): LoadBalancerTarget {
    const target = this.targets.get(id);

    if (!target) {
      throw new Error(`Target not found: ${id}`);
    }

    if (
      updates.weight !== undefined &&
      (!Number.isInteger(updates.weight) ||
        updates.weight <= 0)
    ) {
      throw new Error(
        "Target weight must be a positive integer.",
      );
    }

    if (
      updates.url !== undefined &&
      !updates.url.trim()
    ) {
      throw new Error("Target URL cannot be empty.");
    }

    Object.assign(target, updates);

    return target;
  }

  removeTarget(id: string): boolean {
    this.healthChecker.remove(id);
    return this.targets.delete(id);
  }

  getTarget(
    id: string,
  ): LoadBalancerTarget | undefined {
    return this.targets.get(id);
  }

  getTargets(): LoadBalancerTarget[] {
    return Array.from(this.targets.values());
  }

  setStrategy(
    strategy:
      | LoadBalancingStrategy
      | "round-robin"
      | "random"
      | "weighted-round-robin"
      | "least-connections",
  ): void {
    this.strategy = resolveStrategy(strategy);
    this.roundRobinIndex = 0;
  }

  getStrategyName(): string {
    return this.strategy.name;
  }

  async checkHealth(): Promise<
    TargetHealthResult[]
  > {
    return this.healthChecker.checkTargets(
      this.getTargets(),
      this.healthOptions,
    );
  }

  getHealthyTargets(): LoadBalancerTarget[] {
    const results =
      this.healthChecker.getAllResults();

    if (results.length === 0) {
      return this.getTargets();
    }

    const healthyIds =
      this.healthChecker.getHealthyTargetIds();

    return this.getTargets().filter((target) =>
      healthyIds.has(target.id),
    );
  }

  route(): LoadBalancerTarget {
    const targets = this.getTargets();

    if (targets.length === 0) {
      this.failedRoutes += 1;

      throw new Error(
        "No load balancer targets are configured.",
      );
    }

    const healthResults =
      this.healthChecker.getAllResults();

    const healthyIds =
      this.healthChecker.getHealthyTargetIds();

    const healthyTargets =
      healthResults.length === 0
        ? targets
        : targets.filter((target) =>
            healthyIds.has(target.id),
          );

    if (healthyTargets.length === 0) {
      this.failedRoutes += 1;

      throw new Error(
        "No healthy load balancer targets are available.",
      );
    }

    const selected =
      this.strategy.selectTarget({
        targets: healthyTargets,
        healthyTargetIds: new Set(
          healthyTargets.map(
            (target) => target.id,
          ),
        ),
        currentIndex: this.roundRobinIndex,
      });

    if (!selected) {
      this.failedRoutes += 1;

      throw new Error(
        "Load balancing strategy could not select a target.",
      );
    }

    this.roundRobinIndex += 1;
    this.requestsRouted += 1;

    return selected;
  }

  async routeWithHealthCheck(): Promise<LoadBalancerTarget> {
    await this.checkHealth();

    return this.route();
  }

  getStats(): BalancerStats {
    const targets = this.getTargets();
    const healthResults =
      this.healthChecker.getAllResults();

    const healthyTargets =
      healthResults.length === 0
        ? targets.length
        : healthResults.filter(
            (result) =>
              result.status === "healthy",
          ).length;

    return {
      totalTargets: targets.length,
      healthyTargets,
      unhealthyTargets:
        targets.length - healthyTargets,
      requestsRouted: this.requestsRouted,
      failedRoutes: this.failedRoutes,
      strategy: this.strategy.name,
    };
  }

  resetStats(): void {
    this.requestsRouted = 0;
    this.failedRoutes = 0;
  }

  health(): {
    status: "ok";
    component: string;
    targets: number;
    strategy: string;
  } {
    return {
      status: "ok",
      component: "load-balancer",
      targets: this.targets.size,
      strategy: this.strategy.name,
    };
  }
}