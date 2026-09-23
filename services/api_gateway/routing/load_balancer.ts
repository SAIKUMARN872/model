export interface RoutingTarget {
  id: string;
  url: string;
  weight?: number;
  healthy?: boolean;
  activeConnections?: number;
  metadata?: Record<string, string>;
}

export type LoadBalancingStrategy =
  | "round_robin"
  | "random"
  | "weighted"
  | "least_connections";

export interface LoadBalancerOptions {
  strategy?: LoadBalancingStrategy;
  defaultWeight?: number;
}

export interface LoadBalancerHealth {
  healthy: boolean;
  targetCount: number;
  healthyTargets: number;
  strategy: LoadBalancingStrategy;
}

function validateTarget(target: RoutingTarget): void {
  if (!target.id.trim()) {
    throw new Error("Target id is required");
  }

  if (!target.url.trim()) {
    throw new Error("Target url is required");
  }

  try {
    new URL(target.url);
  } catch {
    throw new Error(`Invalid target URL: ${target.url}`);
  }
}

export class RoutingLoadBalancer {
  private readonly targets = new Map<string, RoutingTarget>();

  private strategy: LoadBalancingStrategy;

  private readonly defaultWeight: number;

  private roundRobinIndex = 0;

  constructor(options: LoadBalancerOptions = {}) {
    this.strategy = options.strategy ?? "round_robin";
    this.defaultWeight = options.defaultWeight ?? 1;

    if (this.defaultWeight <= 0) {
      throw new Error("defaultWeight must be greater than 0");
    }
  }

  addTarget(target: RoutingTarget): void {
    validateTarget(target);

    if (this.targets.has(target.id)) {
      throw new Error(`Target already exists: ${target.id}`);
    }

    this.targets.set(target.id, {
      ...target,
      weight: target.weight ?? this.defaultWeight,
      healthy: target.healthy ?? true,
      activeConnections: target.activeConnections ?? 0,
    });
  }

  updateTarget(
    id: string,
    updates: Partial<Omit<RoutingTarget, "id">>,
  ): RoutingTarget {
    const existing = this.targets.get(id);

    if (!existing) {
      throw new Error(`Target not found: ${id}`);
    }

    const updated: RoutingTarget = {
      ...existing,
      ...updates,
      id,
    };

    validateTarget(updated);

    if ((updated.weight ?? 0) <= 0) {
      throw new Error("Target weight must be greater than 0");
    }

    this.targets.set(id, updated);

    return { ...updated };
  }

  removeTarget(id: string): boolean {
    return this.targets.delete(id);
  }

  getTarget(id: string): RoutingTarget | undefined {
    const target = this.targets.get(id);

    return target ? { ...target } : undefined;
  }

  getTargets(): RoutingTarget[] {
    return [...this.targets.values()].map((target) => ({
      ...target,
    }));
  }

  getHealthyTargets(): RoutingTarget[] {
    return this.getTargets().filter((target) => target.healthy !== false);
  }

  setHealth(id: string, healthy: boolean): void {
    const target = this.targets.get(id);

    if (!target) {
      throw new Error(`Target not found: ${id}`);
    }

    target.healthy = healthy;
  }

  setStrategy(strategy: LoadBalancingStrategy): void {
    this.strategy = strategy;
    this.roundRobinIndex = 0;
  }

  getStrategy(): LoadBalancingStrategy {
    return this.strategy;
  }

  acquire(targetId: string): void {
    const target = this.targets.get(targetId);

    if (!target) {
      throw new Error(`Target not found: ${targetId}`);
    }

    target.activeConnections = (target.activeConnections ?? 0) + 1;
  }

  release(targetId: string): void {
    const target = this.targets.get(targetId);

    if (!target) {
      throw new Error(`Target not found: ${targetId}`);
    }

    target.activeConnections = Math.max(
      0,
      (target.activeConnections ?? 0) - 1,
    );
  }

  selectTarget(): RoutingTarget {
    const healthyTargets = this.getHealthyTargets();

    if (healthyTargets.length === 0) {
      throw new Error("No healthy routing targets available");
    }

    switch (this.strategy) {
      case "round_robin":
        return this.selectRoundRobin(healthyTargets);

      case "random":
        return this.selectRandom(healthyTargets);

      case "weighted":
        return this.selectWeighted(healthyTargets);

      case "least_connections":
        return this.selectLeastConnections(healthyTargets);

      default:
        throw new Error(`Unsupported strategy: ${this.strategy}`);
    }
  }

  health(): LoadBalancerHealth {
    const allTargets = this.getTargets();
    const healthyTargets = this.getHealthyTargets();

    return {
      healthy: allTargets.length > 0 && healthyTargets.length > 0,
      targetCount: allTargets.length,
      healthyTargets: healthyTargets.length,
      strategy: this.strategy,
    };
  }

  clear(): void {
    this.targets.clear();
    this.roundRobinIndex = 0;
  }

  size(): number {
    return this.targets.size;
  }

  private selectRoundRobin(targets: RoutingTarget[]): RoutingTarget {
    const index = this.roundRobinIndex % targets.length;

    this.roundRobinIndex =
      (this.roundRobinIndex + 1) % Number.MAX_SAFE_INTEGER;

    return { ...targets[index] };
  }

  private selectRandom(targets: RoutingTarget[]): RoutingTarget {
    const index = Math.floor(Math.random() * targets.length);

    return { ...targets[index] };
  }

  private selectWeighted(targets: RoutingTarget[]): RoutingTarget {
    const totalWeight = targets.reduce(
      (total, target) => total + (target.weight ?? 1),
      0,
    );

    let random = Math.random() * totalWeight;

    for (const target of targets) {
      random -= target.weight ?? 1;

      if (random < 0) {
        return { ...target };
      }
    }

    return { ...targets[targets.length - 1] };
  }

  private selectLeastConnections(
    targets: RoutingTarget[],
  ): RoutingTarget {
    return {
      ...targets.reduce((selected, target) => {
        const selectedConnections = selected.activeConnections ?? 0;
        const targetConnections = target.activeConnections ?? 0;

        return targetConnections < selectedConnections
          ? target
          : selected;
      }),
    };
  }
}

export const loadBalancer = new RoutingLoadBalancer();