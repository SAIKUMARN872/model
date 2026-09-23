export type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "OPTIONS"
  | "HEAD";

export type RouteHandler = (
  request: RouteRequest,
) => Promise<RouteResponse> | RouteResponse;

export interface RouteRequest {
  method: HttpMethod;
  path: string;
  headers?: Record<string, string>;
  query?: Record<string, string>;
  params?: Record<string, string>;
  body?: unknown;
}

export interface RouteResponse {
  status: number;
  body?: unknown;
  headers?: Record<string, string>;
}

export interface ServiceRoute {
  id: string;
  service: string;
  method: HttpMethod;
  path: string;
  handler: RouteHandler;
  authRequired?: boolean;
  description?: string;
}

export class ServiceRouteRegistry {
  private readonly routes = new Map<
    string,
    ServiceRoute
  >();

  private routeKey(
    method: HttpMethod,
    path: string,
  ): string {
    return `${method}:${this.normalizePath(path)}`;
  }

  add(route: ServiceRoute): ServiceRoute {
    if (!route.id.trim()) {
      throw new Error("Route id is required");
    }

    if (!route.service.trim()) {
      throw new Error(
        "Route service is required",
      );
    }

    if (!route.path.trim()) {
      throw new Error("Route path is required");
    }

    if (typeof route.handler !== "function") {
      throw new Error(
        "Route handler must be a function",
      );
    }

    const normalized: ServiceRoute = {
      ...route,
      path: this.normalizePath(route.path),
      authRequired:
        route.authRequired ?? true,
    };

    const key = this.routeKey(
      normalized.method,
      normalized.path,
    );

    if (this.routes.has(key)) {
      throw new Error(
        `Route already exists: ${key}`,
      );
    }

    this.routes.set(key, normalized);

    return { ...normalized };
  }

  update(
    method: HttpMethod,
    path: string,
    changes: Partial<
      Omit<ServiceRoute, "method" | "path">
    >,
  ): ServiceRoute {
    const key = this.routeKey(method, path);

    const existing =
      this.routes.get(key);

    if (!existing) {
      throw new Error(
        `Route not found: ${key}`,
      );
    }

    const updated: ServiceRoute = {
      ...existing,
      ...changes,
    };

    this.routes.set(key, updated);

    return { ...updated };
  }

  get(
    method: HttpMethod,
    path: string,
  ): ServiceRoute | undefined {
    const key = this.routeKey(method, path);

    const route = this.routes.get(key);

    return route ? { ...route } : undefined;
  }

  getByService(
    service: string,
  ): ServiceRoute[] {
    return [...this.routes.values()]
      .filter(
        (route) =>
          route.service === service,
      )
      .map((route) => ({ ...route }));
  }

  getAll(): ServiceRoute[] {
    return [...this.routes.values()].map(
      (route) => ({ ...route }),
    );
  }

  remove(
    method: HttpMethod,
    path: string,
  ): boolean {
    return this.routes.delete(
      this.routeKey(method, path),
    );
  }

  clear(): void {
    this.routes.clear();
  }

  size(): number {
    return this.routes.size;
  }

  async dispatch(
    request: RouteRequest,
  ): Promise<RouteResponse> {
    const route = this.get(
      request.method,
      request.path,
    );

    if (!route) {
      return {
        status: 404,
        body: {
          error: "Route not found",
        },
      };
    }

    return route.handler(request);
  }

  health(): {
    healthy: boolean;
    routeCount: number;
    services: number;
    timestamp: string;
  } {
    const services = new Set(
      [...this.routes.values()].map(
        (route) => route.service,
      ),
    );

    return {
      healthy: true,
      routeCount: this.routes.size,
      services: services.size,
      timestamp: new Date().toISOString(),
    };
  }

  private normalizePath(
    path: string,
  ): string {
    let normalized = path.trim();

    if (!normalized.startsWith("/")) {
      normalized = `/${normalized}`;
    }

    if (
      normalized.length > 1 &&
      normalized.endsWith("/")
    ) {
      normalized = normalized.slice(0, -1);
    }

    return normalized;
  }
}