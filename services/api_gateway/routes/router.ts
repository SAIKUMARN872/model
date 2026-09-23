import {
  ServiceRouteRegistry,
  type HttpMethod,
  type RouteRequest,
  type RouteResponse,
  type RouteHandler,
} from "./service_routes.js";

import {
  ApiVersionManager,
} from "./versioning.js";

export interface RouterOptions {
  routeRegistry?: ServiceRouteRegistry;
  versionManager?: ApiVersionManager;
}

export interface RouterResult {
  response: RouteResponse;
  routeFound: boolean;
  version: string;
  path: string;
}

export class ApiRouter {
  private readonly registry: ServiceRouteRegistry;

  private readonly versionManager: ApiVersionManager;

  constructor(
    options: RouterOptions = {},
  ) {
    this.registry =
      options.routeRegistry ??
      new ServiceRouteRegistry();

    this.versionManager =
      options.versionManager ??
      new ApiVersionManager("v1");
  }

  getRegistry(): ServiceRouteRegistry {
    return this.registry;
  }

  getVersionManager(): ApiVersionManager {
    return this.versionManager;
  }

  addRoute(
    method: HttpMethod,
    path: string,
    handler: RouteHandler,
    options: {
      id: string;
      service: string;
      authRequired?: boolean;
      description?: string;
    },
  ): void {
    this.registry.add({
      id: options.id,
      service: options.service,
      method,
      path,
      handler,
      authRequired:
        options.authRequired ?? true,
      description:
        options.description,
    });
  }

  async handle(
    request: RouteRequest,
  ): Promise<RouterResult> {
    const versionInfo =
      this.versionManager.resolve(
        request.path,
      );

    const versionedRequest: RouteRequest = {
      ...request,
      path: versionInfo.path,
    };

    const route =
      this.registry.get(
        request.method,
        versionInfo.path,
      );

    if (!route) {
      return {
        response: {
          status: 404,
          body: {
            error: "Route not found",
            path: versionInfo.path,
            version: versionInfo.version,
          },
        },
        routeFound: false,
        version: versionInfo.version,
        path: versionInfo.path,
      };
    }

    const response =
      await route.handler(
        versionedRequest,
      );

    return {
      response,
      routeFound: true,
      version: versionInfo.version,
      path: versionInfo.path,
    };
  }

  async get(
    path: string,
    options: Omit<
      RouteRequest,
      "method" | "path"
    > = {},
  ): Promise<RouterResult> {
    return this.handle({
      ...options,
      method: "GET",
      path,
    });
  }

  async post(
    path: string,
    options: Omit<
      RouteRequest,
      "method" | "path"
    > = {},
  ): Promise<RouterResult> {
    return this.handle({
      ...options,
      method: "POST",
      path,
    });
  }

  async put(
    path: string,
    options: Omit<
      RouteRequest,
      "method" | "path"
    > = {},
  ): Promise<RouterResult> {
    return this.handle({
      ...options,
      method: "PUT",
      path,
    });
  }

  async patch(
    path: string,
    options: Omit<
      RouteRequest,
      "method" | "path"
    > = {},
  ): Promise<RouterResult> {
    return this.handle({
      ...options,
      method: "PATCH",
      path,
    });
  }

  async delete(
    path: string,
    options: Omit<
      RouteRequest,
      "method" | "path"
    > = {},
  ): Promise<RouterResult> {
    return this.handle({
      ...options,
      method: "DELETE",
      path,
    });
  }

  health(): {
    healthy: boolean;
    routes: ReturnType<
      ServiceRouteRegistry["health"]
    >;
    versions: ReturnType<
      ApiVersionManager["health"]
    >;
    timestamp: string;
  } {
    const routes =
      this.registry.health();

    const versions =
      this.versionManager.health();

    return {
      healthy:
        routes.healthy &&
        versions.healthy,
      routes,
      versions,
      timestamp:
        new Date().toISOString(),
    };
  }
}

export const router = new ApiRouter();