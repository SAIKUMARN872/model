import {
  getServiceUrl,
  type ServiceInstance,
} from "./services.js";
import {
  ServiceRegistry,
  type RegistryOptions,
} from "./registry.js";

export type DiscoveryStrategy =
  | "first"
  | "round_robin"
  | "random"
  | "weighted";

export interface DiscoveryOptions {
  strategy?: DiscoveryStrategy;
  registryOptions?: RegistryOptions;
}

export interface DiscoveryResult {
  serviceName: string;
  instance: ServiceInstance;
  url: string;
}

export interface DiscoveryHealth {
  healthy: boolean;
  strategy: DiscoveryStrategy;
  registry: ReturnType<ServiceRegistry["health"]>;
}

export class ServiceDiscovery {
  private readonly registry: ServiceRegistry;

  private strategy: DiscoveryStrategy;

  private readonly indexes = new Map<
    string,
    number
  >();

  constructor(options: DiscoveryOptions = {}) {
    this.registry = new ServiceRegistry(
      options.registryOptions,
    );

    this.strategy = options.strategy ?? "round_robin";
  }

  getRegistry(): ServiceRegistry {
    return this.registry;
  }

  setStrategy(strategy: DiscoveryStrategy): void {
    this.strategy = strategy;
    this.indexes.clear();
  }

  getStrategy(): DiscoveryStrategy {
    return this.strategy;
  }

  discover(
    serviceName: string,
  ): DiscoveryResult {
    const instances =
      this.registry.getHealthy(serviceName);

    if (instances.length === 0) {
      throw new Error(
        `No healthy instances found for service: ${serviceName}`,
      );
    }

    const instance = this.selectInstance(
      serviceName,
      instances,
    );

    return {
      serviceName,
      instance,
      url: getServiceUrl(instance),
    };
  }

  discoverAll(
    serviceName: string,
  ): DiscoveryResult[] {
    return this.registry
      .getHealthy(serviceName)
      .map((instance) => ({
        serviceName,
        instance,
        url: getServiceUrl(instance),
      }));
  }

  register(
    registration: Parameters<
      ServiceRegistry["register"]
    >[0],
    instanceId: string,
  ): ServiceInstance {
    return this.registry.register(
      registration,
      instanceId,
    );
  }

  deregister(instanceId: string): boolean {
    this.indexes.clear();

    return this.registry.deregister(instanceId);
  }

  heartbeat(instanceId: string): ServiceInstance {
    return this.registry.heartbeat(instanceId);
  }

  health(): DiscoveryHealth {
    const registryHealth =
      this.registry.health();

    return {
      healthy: registryHealth.healthy,
      strategy: this.strategy,
      registry: registryHealth,
    };
  }

  private selectInstance(
    serviceName: string,
    instances: ServiceInstance[],
  ): ServiceInstance {
    switch (this.strategy) {
      case "first":
        return { ...instances[0] };

      case "round_robin":
        return this.selectRoundRobin(
          serviceName,
          instances,
        );

      case "random":
        return this.selectRandom(instances);

      case "weighted":
        return this.selectWeighted(instances);

      default:
        throw new Error(
          `Unsupported discovery strategy: ${this.strategy}`,
        );
    }
  }

  private selectRoundRobin(
    serviceName: string,
    instances: ServiceInstance[],
  ): ServiceInstance {
    const current =
      this.indexes.get(serviceName) ?? 0;

    const index = current % instances.length;

    this.indexes.set(
      serviceName,
      (current + 1) % Number.MAX_SAFE_INTEGER,
    );

    return { ...instances[index] };
  }

  private selectRandom(
    instances: ServiceInstance[],
  ): ServiceInstance {
    const index = Math.floor(
      Math.random() * instances.length,
    );

    return { ...instances[index] };
  }

  private selectWeighted(
    instances: ServiceInstance[],
  ): ServiceInstance {
    const totalWeight = instances.reduce(
      (total, instance) =>
        total + (instance.weight ?? 1),
      0,
    );

    let random = Math.random() * totalWeight;

    for (const instance of instances) {
      random -= instance.weight ?? 1;

      if (random < 0) {
        return { ...instance };
      }
    }

    return {
      ...instances[instances.length - 1],
    };
  }
}

export const serviceDiscovery =
  new ServiceDiscovery();