import type {
  MiddlewareFunction,
  MiddlewareRequest,
  MiddlewareResponse,
} from "./middleware.js";

export interface CorsOptions {
  origins?: string[];
  allowMethods?: string[];
  allowHeaders?: string[];
  exposeHeaders?: string[];
  allowCredentials?: boolean;
  maxAgeSeconds?: number;
}

export class CorsMiddleware {
  private readonly origins: string[];
  private readonly allowMethods: string[];
  private readonly allowHeaders: string[];
  private readonly exposeHeaders: string[];
  private readonly allowCredentials: boolean;
  private readonly maxAgeSeconds: number;

  constructor(
    options: CorsOptions = {},
  ) {
    this.origins = options.origins ?? ["*"];

    this.allowMethods =
      options.allowMethods ?? [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
      ];

    this.allowHeaders =
      options.allowHeaders ?? [
        "Content-Type",
        "Authorization",
        "X-Request-ID",
      ];

    this.exposeHeaders =
      options.exposeHeaders ?? [
        "X-Request-ID",
      ];

    this.allowCredentials =
      options.allowCredentials ?? false;

    this.maxAgeSeconds =
      options.maxAgeSeconds ?? 86400;

    if (
      this.allowCredentials &&
      this.origins.includes("*")
    ) {
      throw new Error(
        "CORS credentials cannot be enabled with wildcard origin",
      );
    }
  }

  middleware(): MiddlewareFunction {
    return async (
      request,
      next,
    ): Promise<MiddlewareResponse> => {
      const origin =
        request.headers.origin;

      const headers =
        this.createHeaders(origin);

      if (
        request.method.toUpperCase() ===
        "OPTIONS"
      ) {
        return {
          statusCode: 204,
          headers,
        };
      }

      const response = await next();

      return {
        ...response,
        headers: {
          ...response.headers,
          ...headers,
        },
      };
    };
  }

  isOriginAllowed(
    origin: string | undefined,
  ): boolean {
    if (!origin) {
      return true;
    }

    if (this.origins.includes("*")) {
      return true;
    }

    return this.origins.includes(origin);
  }

  createHeaders(
    origin?: string,
  ): Record<string, string> {
    const headers: Record<string, string> = {
      "access-control-allow-methods":
        this.allowMethods.join(", "),
      "access-control-allow-headers":
        this.allowHeaders.join(", "),
      "access-control-expose-headers":
        this.exposeHeaders.join(", "),
      "access-control-max-age":
        String(this.maxAgeSeconds),
      vary: "Origin",
    };

    if (
      origin &&
      this.isOriginAllowed(origin)
    ) {
      headers[
        "access-control-allow-origin"
      ] = origin;
    } else if (
      this.origins.includes("*") &&
      !this.allowCredentials
    ) {
      headers[
        "access-control-allow-origin"
      ] = "*";
    }

    if (this.allowCredentials) {
      headers[
        "access-control-allow-credentials"
      ] = "true";
    }

    return headers;
  }

  health(): {
    status: "healthy";
    origins: number;
    credentials: boolean;
  } {
    return {
      status: "healthy",
      origins: this.origins.length,
      credentials: this.allowCredentials,
    };
  }
}

export function cors(
  options: CorsOptions = {},
): MiddlewareFunction {
  return new CorsMiddleware(
    options,
  ).middleware();
}