export type ServiceStatus =
  | "starting"
  | "healthy"
  | "unhealthy"
  | "draining"
  | "stopped";

export interface ServiceInstance {
  id: string;
  serviceName: string;
  host: string;
  port: number;
  protocol?: "http" | "https";
  status?: ServiceStatus;
  version?: string;
  weight?: number;
  metadata?: Record<string, string>;
  registeredAt?: string;
  lastHeartbeatAt?: string;
  healthCheckUrl?: string;
}

export interface ServiceRegistration {
  serviceName: string;
  host: string;
  port: number;
  protocol?: "http" | "https";
  version?: string;
  weight?: number;
  metadata?: Record<string, string>;
  healthCheckUrl?: string;
}

export interface ServiceQuery {
  serviceName?: string;
  status?: ServiceStatus;
  version?: string;
  metadata?: Record<string, string>;
}

export interface ServiceSummary {
  serviceName: string;
  totalInstances: number;
  healthyInstances: number;
  unhealthyInstances: number;
  versions: string[];
}

export function validateServiceName(serviceName: string): void {
  if (!serviceName.trim()) {
    throw new Error("Service name is required");
  }

  if (!/^[a-zA-Z0-9._-]+$/.test(serviceName)) {
    throw new Error(
      `Invalid service name: ${serviceName}`,
    );
  }
}

export function validateServiceRegistration(
  registration: ServiceRegistration,
): void {
  validateServiceName(registration.serviceName);

  if (!registration.host.trim()) {
    throw new Error("Service host is required");
  }

  if (
    !Number.isInteger(registration.port) ||
    registration.port < 1 ||
    registration.port > 65535
  ) {
    throw new Error(
      "Service port must be between 1 and 65535",
    );
  }

  if (
    registration.weight !== undefined &&
    registration.weight <= 0
  ) {
    throw new Error(
      "Service weight must be greater than zero",
    );
  }
}

export function createServiceInstance(
  registration: ServiceRegistration,
  id: string,
): ServiceInstance {
  validateServiceRegistration(registration);

  if (!id.trim()) {
    throw new Error("Service instance id is required");
  }

  const now = new Date().toISOString();

  return {
    id,
    serviceName: registration.serviceName,
    host: registration.host,
    port: registration.port,
    protocol: registration.protocol ?? "http",
    status: "starting",
    version: registration.version,
    weight: registration.weight ?? 1,
    metadata: registration.metadata
      ? { ...registration.metadata }
      : undefined,
    registeredAt: now,
    lastHeartbeatAt: now,
    healthCheckUrl: registration.healthCheckUrl,
  };
}

export function getServiceUrl(
  instance: ServiceInstance,
): string {
  return `${instance.protocol ?? "http"}://${instance.host}:${instance.port}`;
}

export function cloneServiceInstance(
  instance: ServiceInstance,
): ServiceInstance {
  return {
    ...instance,
    metadata: instance.metadata
      ? { ...instance.metadata }
      : undefined,
  };
}