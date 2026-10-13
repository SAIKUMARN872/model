import type {
  Service,
} from "./services.js";
import {
  ServiceRegistry,
} from "./registry.js";

export class ServiceDiscovery {
  constructor(
    private readonly registry: ServiceRegistry,
  ) {}

  find(
    name: string,
  ): Service | undefined {
    const service = this.registry.get(name);

    if (!service || !service.healthy) {
      return undefined;
    }

    return service;
  }

  healthyServices(): Service[] {
    return this.registry
      .list()
      .filter((service) => service.healthy);
  }
}
