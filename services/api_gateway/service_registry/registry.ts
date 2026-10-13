import type {
  Service,
} from "./services.js";

export class ServiceRegistry {
  private readonly services =
    new Map<string, Service>();

  register(service: Service): Service {
    if (
      !service.name.trim() ||
      !service.url.trim()
    ) {
      throw new Error(
        "Service name and URL are required",
      );
    }

    if (this.services.has(service.name)) {
      throw new Error(
        "Service already registered",
      );
    }

    const stored: Service = {
      ...service,
      metadata: {
        ...service.metadata,
      },
    };

    this.services.set(
      service.name,
      stored,
    );

    return {
      ...stored,
      metadata: {
        ...stored.metadata,
      },
    };
  }

  get(name: string): Service | undefined {
    const service = this.services.get(name);

    if (!service) {
      return undefined;
    }

    return {
      ...service,
      metadata: {
        ...service.metadata,
      },
    };
  }

  unregister(name: string): boolean {
    return this.services.delete(name);
  }

  list(): Service[] {
    return Array.from(
      this.services.values(),
    ).map((service) => ({
      ...service,
      metadata: {
        ...service.metadata,
      },
    }));
  }
}
