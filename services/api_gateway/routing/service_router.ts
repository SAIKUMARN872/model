import {
  RoutingLoadBalancer,
  loadBalancer,
  type LoadBalancerOptions,
  type RoutingTarget,
} from "./load_balancer.js";

export type ServiceRouteMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS"
  | "HEAD";

export interface ServiceRouteDefinition {
  service: string;
  path: string;
  methods: ServiceRouteMethod[];
  targets?: RoutingTarget[];
  metadata?: Record<string, string>;
}

export interface ServiceRouteRequest {
  service: string;
  path: string;
  method: string;
  headers?: Record<string, string>;
  query?: Record<string, string>;
  body?: unknown;
}

export interface ServiceRouteResponse {
  statusCode: number;
  service: string;
  path: string;
  method: ServiceRouteMethod;
  targetId: string;
  targetUrl: string;
  message: string;
}

export interface ServiceRouterOptions {
  loadBalancer?: LoadBalancerOptions;
}

export interface ServiceRouterHealth {
  healthy: boolean;
  routeCount: number;
  targetCount: number;
  healthyTargets: number;
}

function normalizePath(path: string): string {
  if (!path.trim()) {
    return "/";
  }

  const normalized = path.startsWith("/") ? path : `/${path}`;

  if (normalized.length > 1) {
    return normalized.replace(/\/+$/, "");
  }

  return normalized;
}

function normalizeMethod(method: string): ServiceRouteMethod {
  const normalized = method.toUpperCase();

  const supported: ServiceRouteMethod[] = [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
    "HEAD",
  ];

  if (!supported.includes(normalized as ServiceRouteMethod)) {
    throw new Error(`Unsupported HTTP method: ${method}`);
  }

  return normalized as ServiceRouteMethod;
}

function validateServiceName(service: string): void {
  if (!service.trim()) {
    throw new Error("Service name is required");
  }
}

export class ServiceRouter {
  private readonly routes = new Map<string, ServiceRouteDefinition>();

  private readonly balancer: ReturnType<
    typeof createInternalLoadBalancer
  >;

  constructor(options: ServiceRouterOptions = {}) {
    this.balancer = createInternalLoadBalancer(options.loadBalancer);
  }

  addRoute(route: ServiceRouteDefinition): void {
    validateServiceName(route.service);

    if (!route.path.trim()) {
      throw new Error("Route path is required");
    }

    if (route.methods.length === 0) {
      throw new Error("At least one HTTP method is required");
    }

    const normalizedRoute: ServiceRouteDefinition = {
      ...route,
      service: route.service.trim(),
      path: normalizePath(route.path),
      methods: route.methods.map((method) =>
        normalizeMethod(method),
      ),
      metadata: route.metadata
        ? { ...route.metadata }
        : undefined,
    };

    const key = this.getRouteKey(
      normalizedRoute.service,
      normalizedRoute.path,
    );

    if (this.routes.has(key)) {
      throw new Error(`Route already exists: ${key}`);
    }

    this.routes.set(key, normalizedRoute);

    for (const target of route.targets ?? []) {
      if (!this.balancer.getTarget(target.id)) {
        this.balancer.addTarget(target);
      }
    }
  }

  updateRoute(
    service: string,
    path: string,
    updates: Partial<Omit<ServiceRouteDefinition, "service" | "path">>,
  ): ServiceRouteDefinition {
    const key = this.getRouteKey(service, path);

    const existing = this.routes.get(key);

    if (!existing) {
      throw new Error(`Route not found: ${key}`);
    }

    const updated: ServiceRouteDefinition = {
      ...existing,
      ...updates,
      service: existing.service,
      path: existing.path,
      methods: updates.methods
        ? updates.methods.map((method) => normalizeMethod(method))
        : existing.methods,
      metadata: updates.metadata
        ? { ...updates.metadata }
        : existing.metadata,
    };

    this.routes.set(key, updated);

    for (const target of updates.targets ?? []) {
      if (!this.balancer.getTarget(target.id)) {
        this.balancer.addTarget(target);
      }
    }

    return this.cloneRoute(updated);
  }

  removeRoute(service: string, path: string): boolean {
    return this.routes.delete(this.getRouteKey(service, path));
  }

  getRoute(
    service: string,
    path: string,
  ): ServiceRouteDefinition | undefined {
    const route = this.routes.get(this.getRouteKey(service, path));

    return route ? this.cloneRoute(route) : undefined;
  }

  getRoutes(service?: string): ServiceRouteDefinition[] {
    const routes = [...this.routes.values()];

    const filtered = service
      ? routes.filter((route) => route.service === service)
      : routes;

    return filtered.map((route) => this.cloneRoute(route));
  }

  route(request: ServiceRouteRequest): ServiceRouteResponse {
    validateServiceName(request.service);

    const method = normalizeMethod(request.method);
    const path = normalizePath(request.path);

    const route = this.routes.get(
      this.getRouteKey(request.service, path),
    );

    if (!route) {
      throw new Error(
        `No route found for ${request.service} ${method} ${path}`,
      );
    }

    if (!route.methods.includes(method)) {
      throw new Error(
        `Method ${method} is not allowed for ${request.service}${path}`,
      );
    }

    const target = this.getTargetForService(route);

    if (!target) {
      throw new Error(
        `No healthy target available for service: ${request.service}`,
      );
    }

    this.balancer.acquire(target.id);

    try {
      return {
        statusCode: 200,
        service: route.service,
        path: route.path,
        method,
        targetId: target.id,
        targetUrl: target.url,
        message: "Route resolved successfully",
      };
    } finally {
      this.balancer.release(target.id);
    }
  }

  getLoadBalancer() {
    return this.balancer;
  }

  health(): ServiceRouterHealth {
    const balancerHealth = this.balancer.health();

    return {
      healthy:
        this.routes.size > 0 && balancerHealth.healthy,
      routeCount: this.routes.size,
      targetCount: balancerHealth.targetCount,
      healthyTargets: balancerHealth.healthyTargets,
    };
  }

  clear(): void {
    this.routes.clear();
    this.balancer.clear();
  }

  size(): number {
    return this.routes.size;
  }

  private getTargetForService(
    route: ServiceRouteDefinition,
  ): RoutingTarget | undefined {
    const routeTargets = route.targets ?? [];

    if (routeTargets.length > 0) {
      const healthyTargets = routeTargets.filter(
        (target) => target.healthy !== false,
      );

      if (healthyTargets.length === 0) {
        return undefined;
      }

      return this.selectFromTargets(healthyTargets);
    }

    return this.balancer.selectTarget();
  }

  private selectFromTargets(
    targets: RoutingTarget[],
  ): RoutingTarget {
    const healthyIds = new Set(targets.map((target) => target.id));

    const allBalancerTargets = this.balancer
      .getHealthyTargets()
      .filter((target) => healthyIds.has(target.id));

    if (allBalancerTargets.length > 0) {
      return this.selectFromBalancerTargets(allBalancerTargets);
    }

    const target = targets[0];

    if (!target) {
      throw new Error("No routing target available");
    }

    return { ...target };
  }

  private selectFromBalancerTargets(
    targets: RoutingTarget[],
  ): RoutingTarget {
    const totalWeight = targets.reduce(
      (sum, target) => sum + (target.weight ?? 1),
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

  private getRouteKey(service: string, path: string): string {
    return `${service.trim().toLowerCase()}:${normalizePath(path)}`;
  }

  private cloneRoute(
    route: ServiceRouteDefinition,
  ): ServiceRouteDefinition {
    return {
      ...route,
      methods: [...route.methods],
      targets: route.targets
        ? route.targets.map((target) => ({
            ...target,
            metadata: target.metadata
              ? { ...target.metadata }
              : undefined,
          }))
        : undefined,
      metadata: route.metadata
        ? { ...route.metadata }
        : undefined,
    };
  }
}

function createInternalLoadBalancer(
  options: LoadBalancerOptions = {},
): RoutingLoadBalancer {
  return new RoutingLoadBalancer(options);
}

export const serviceRouter = new ServiceRouter();