import {
  cloneServiceInstance,
  createServiceInstance,
  validateServiceName,
  type ServiceInstance,
  type ServiceQuery,
  type ServiceRegistration,
  type ServiceStatus,
  type ServiceSummary,
} from "./services.js";

export interface RegistryOptions {
  heartbeatTimeoutMs?: number;
}

export interface RegistryHealth {
  healthy: boolean;
  serviceCount: number;
  instanceCount: number;
  healthyInstances: number;
}

export class ServiceRegistry {
  private readonly instances = new Map<
    string,
    ServiceInstance
  >();

  private readonly heartbeatTimeoutMs: number;

  constructor(options: RegistryOptions = {}) {
    this.heartbeatTimeoutMs =
      options.heartbeatTimeoutMs ?? 30_000;

    if (
      !Number.isFinite(this.heartbeatTimeoutMs) ||
      this.heartbeatTimeoutMs <= 0
    ) {
      throw new Error(
        "heartbeatTimeoutMs must be greater than zero",
      );
    }
  }

  register(
    registration: ServiceRegistration,
    instanceId: string,
  ): ServiceInstance {
    if (this.instances.has(instanceId)) {
      throw new Error(
        `Service instance already exists: ${instanceId}`,
      );
    }

    const instance = createServiceInstance(
      registration,
      instanceId,
    );

    this.instances.set(
      instanceId,
      instance,
    );

    return cloneServiceInstance(instance);
  }

  deregister(instanceId: string): boolean {
    return this.instances.delete(instanceId);
  }

  get(instanceId: string): ServiceInstance | undefined {
    const instance = this.instances.get(instanceId);

    return instance
      ? cloneServiceInstance(instance)
      : undefined;
  }

  getByService(
    serviceName: string,
  ): ServiceInstance[] {
    validateServiceName(serviceName);

    return [...this.instances.values()]
      .filter(
        (instance) =>
          instance.serviceName === serviceName,
      )
      .map(cloneServiceInstance);
  }

  query(query: ServiceQuery = {}): ServiceInstance[] {
    return [...this.instances.values()]
      .filter((instance) => {
        if (
          query.serviceName &&
          instance.serviceName !== query.serviceName
        ) {
          return false;
        }

        if (
          query.status &&
          instance.status !== query.status
        ) {
          return false;
        }

        if (
          query.version &&
          instance.version !== query.version
        ) {
          return false;
        }

        if (query.metadata) {
          for (const [key, value] of Object.entries(
            query.metadata,
          )) {
            if (instance.metadata?.[key] !== value) {
              return false;
            }
          }
        }

        return true;
      })
      .map(cloneServiceInstance);
  }

  getHealthy(
    serviceName?: string,
  ): ServiceInstance[] {
    return this.query({
      serviceName,
      status: "healthy",
    });
  }

  getServices(): string[] {
    return [
      ...new Set(
        [...this.instances.values()].map(
          (instance) => instance.serviceName,
        ),
      ),
    ].sort();
  }

  getSummaries(): ServiceSummary[] {
    return this.getServices().map((serviceName) => {
      const instances = this.getByService(serviceName);

      const versions = [
        ...new Set(
          instances
            .map((instance) => instance.version)
            .filter(
              (version): version is string =>
                version !== undefined,
            ),
        ),
      ];

      return {
        serviceName,
        totalInstances: instances.length,
        healthyInstances: instances.filter(
          (instance) =>
            instance.status === "healthy",
        ).length,
        unhealthyInstances: instances.filter(
          (instance) =>
            instance.status === "unhealthy",
        ).length,
        versions,
      };
    });
  }

  setStatus(
    instanceId: string,
    status: ServiceStatus,
  ): ServiceInstance {
    const instance = this.instances.get(instanceId);

    if (!instance) {
      throw new Error(
        `Service instance not found: ${instanceId}`,
      );
    }

    instance.status = status;

    if (status === "healthy") {
      instance.lastHeartbeatAt =
        new Date().toISOString();
    }

    return cloneServiceInstance(instance);
  }

  heartbeat(instanceId: string): ServiceInstance {
    const instance = this.instances.get(instanceId);

    if (!instance) {
      throw new Error(
        `Service instance not found: ${instanceId}`,
      );
    }

    instance.lastHeartbeatAt =
      new Date().toISOString();

    if (
      instance.status === "starting" ||
      instance.status === "unhealthy"
    ) {
      instance.status = "healthy";
    }

    return cloneServiceInstance(instance);
  }

  markExpired(): ServiceInstance[] {
    const now = Date.now();
    const expired: ServiceInstance[] = [];

    for (const instance of this.instances.values()) {
      if (!instance.lastHeartbeatAt) {
        continue;
      }

      const lastHeartbeat =
        new Date(
          instance.lastHeartbeatAt,
        ).getTime();

      if (
        now - lastHeartbeat >
        this.heartbeatTimeoutMs
      ) {
        instance.status = "unhealthy";
        expired.push(
          cloneServiceInstance(instance),
        );
      }
    }

    return expired;
  }

  removeUnhealthy(): number {
    let removed = 0;

    for (const [id, instance] of this.instances) {
      if (instance.status === "unhealthy") {
        this.instances.delete(id);
        removed += 1;
      }
    }

    return removed;
  }

  update(
    instanceId: string,
    updates: Partial<
      Omit<
        ServiceInstance,
        "id" | "serviceName" | "registeredAt"
      >
    >,
  ): ServiceInstance {
    const instance = this.instances.get(instanceId);

    if (!instance) {
      throw new Error(
        `Service instance not found: ${instanceId}`,
      );
    }

    if (
      updates.port !== undefined &&
      (!Number.isInteger(updates.port) ||
        updates.port < 1 ||
        updates.port > 65535)
    ) {
      throw new Error(
        "Service port must be between 1 and 65535",
      );
    }

    if (
      updates.weight !== undefined &&
      updates.weight <= 0
    ) {
      throw new Error(
        "Service weight must be greater than zero",
      );
    }

    Object.assign(instance, updates);

    return cloneServiceInstance(instance);
  }

  clear(): void {
    this.instances.clear();
  }

  size(): number {
    return this.instances.size;
  }

  serviceCount(): number {
    return this.getServices().length;
  }

  health(): RegistryHealth {
    const instances = [
      ...this.instances.values(),
    ];

    const healthyInstances = instances.filter(
      (instance) =>
        instance.status === "healthy",
    ).length;

    return {
      healthy: instances.length === 0
        ? true
        : healthyInstances > 0,
      serviceCount: this.serviceCount(),
      instanceCount: instances.length,
      healthyInstances,
    };
  }
}

export const serviceRegistry = new ServiceRegistry();