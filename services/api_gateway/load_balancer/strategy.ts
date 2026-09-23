export interface LoadBalancerTarget {
  id: string;
  url: string;
  weight?: number;
  metadata?: Record<string, unknown>;
}

export interface StrategyContext {
  targets: LoadBalancerTarget[];
  healthyTargetIds?: Set<string>;
  currentIndex?: number;
  requestKey?: string;
}

export interface LoadBalancingStrategy {
  readonly name: string;

  selectTarget(
    context: StrategyContext,
  ): LoadBalancerTarget | undefined;
}

export class RoundRobinStrategy
  implements LoadBalancingStrategy
{
  readonly name = "round-robin";

  selectTarget(
    context: StrategyContext,
  ): LoadBalancerTarget | undefined {
    const targets = this.getAvailableTargets(context);

    if (targets.length === 0) {
      return undefined;
    }

    const index =
      (context.currentIndex ?? 0) % targets.length;

    return targets[index];
  }

  private getAvailableTargets(
    context: StrategyContext,
  ): LoadBalancerTarget[] {
    if (!context.healthyTargetIds) {
      return context.targets;
    }

    return context.targets.filter((target) =>
      context.healthyTargetIds?.has(target.id),
    );
  }
}

export class RandomStrategy
  implements LoadBalancingStrategy
{
  readonly name = "random";

  selectTarget(
    context: StrategyContext,
  ): LoadBalancerTarget | undefined {
    const targets = this.getAvailableTargets(context);

    if (targets.length === 0) {
      return undefined;
    }

    const index = Math.floor(
      Math.random() * targets.length,
    );

    return targets[index];
  }

  private getAvailableTargets(
    context: StrategyContext,
  ): LoadBalancerTarget[] {
    if (!context.healthyTargetIds) {
      return context.targets;
    }

    return context.targets.filter((target) =>
      context.healthyTargetIds?.has(target.id),
    );
  }
}

export class WeightedRoundRobinStrategy
  implements LoadBalancingStrategy
{
  readonly name = "weighted-round-robin";

  private currentIndex = 0;

  selectTarget(
    context: StrategyContext,
  ): LoadBalancerTarget | undefined {
    const targets = this.getAvailableTargets(context);

    if (targets.length === 0) {
      return undefined;
    }

    const weightedTargets: LoadBalancerTarget[] = [];

    for (const target of targets) {
      const weight = Math.max(
        1,
        Math.floor(target.weight ?? 1),
      );

      for (let index = 0; index < weight; index += 1) {
        weightedTargets.push(target);
      }
    }

    if (weightedTargets.length === 0) {
      return undefined;
    }

    const target =
      weightedTargets[
        this.currentIndex % weightedTargets.length
      ];

    this.currentIndex += 1;

    return target;
  }

  private getAvailableTargets(
    context: StrategyContext,
  ): LoadBalancerTarget[] {
    if (!context.healthyTargetIds) {
      return context.targets;
    }

    return context.targets.filter((target) =>
      context.healthyTargetIds?.has(target.id),
    );
  }
}

export class LeastConnectionsStrategy
  implements LoadBalancingStrategy
{
  readonly name = "least-connections";

  private readonly connections = new Map<
    string,
    number
  >();

  selectTarget(
    context: StrategyContext,
  ): LoadBalancerTarget | undefined {
    const targets = this.getAvailableTargets(context);

    if (targets.length === 0) {
      return undefined;
    }

    let selected = targets[0];
    let lowestConnections =
      this.connections.get(selected.id) ?? 0;

    for (const target of targets.slice(1)) {
      const connections =
        this.connections.get(target.id) ?? 0;

      if (connections < lowestConnections) {
        selected = target;
        lowestConnections = connections;
      }
    }

    return selected;
  }

  increment(targetId: string): void {
    const current =
      this.connections.get(targetId) ?? 0;

    this.connections.set(targetId, current + 1);
  }

  decrement(targetId: string): void {
    const current =
      this.connections.get(targetId) ?? 0;

    this.connections.set(
      targetId,
      Math.max(0, current - 1),
    );
  }

  getConnections(targetId: string): number {
    return this.connections.get(targetId) ?? 0;
  }

  clear(): void {
    this.connections.clear();
  }

  private getAvailableTargets(
    context: StrategyContext,
  ): LoadBalancerTarget[] {
    if (!context.healthyTargetIds) {
      return context.targets;
    }

    return context.targets.filter((target) =>
      context.healthyTargetIds?.has(target.id),
    );
  }
}