import type {
  MiddlewareFunction,
  MiddlewareResponse,
} from "./middleware.js";

export interface SecurityOptions {
  contentSecurityPolicy?: string;
  frameOptions?: "DENY" | "SAMEORIGIN";
  referrerPolicy?: string;
  permissionsPolicy?: string;
  enableHsts?: boolean;
  hstsMaxAge?: number;
  maxUrlLength?: number;
}

export class SecurityMiddleware {
  private readonly contentSecurityPolicy: string;
  private readonly frameOptions:
    | "DENY"
    | "SAMEORIGIN";
  private readonly referrerPolicy: string;
  private readonly permissionsPolicy: string;
  private readonly enableHsts: boolean;
  private readonly hstsMaxAge: number;
  private readonly maxUrlLength: number;

  constructor(
    options: SecurityOptions = {},
  ) {
    this.contentSecurityPolicy =
      options.contentSecurityPolicy ??
      "default-src 'none'";

    this.frameOptions =
      options.frameOptions ?? "DENY";

    this.referrerPolicy =
      options.referrerPolicy ??
      "strict-origin-when-cross-origin";

    this.permissionsPolicy =
      options.permissionsPolicy ??
      "camera=(), microphone=(), geolocation=()";

    this.enableHsts =
      options.enableHsts ?? false;

    this.hstsMaxAge =
      options.hstsMaxAge ?? 31536000;

    this.maxUrlLength =
      options.maxUrlLength ?? 8192;
  }

  middleware(): MiddlewareFunction {
    return async (
      request,
      next,
    ): Promise<MiddlewareResponse> => {
      if (
        request.path.length >
        this.maxUrlLength
      ) {
        return {
          statusCode: 414,
          headers: this.headers(),
          body: {
            success: false,
            error: "Request URI too long",
          },
        };
      }

      const response = await next();

      return {
        ...response,
        headers: {
          ...response.headers,
          ...this.headers(),
        },
      };
    };
  }

  headers(): Record<string, string> {
    const headers: Record<string, string> = {
      "content-security-policy":
        this.contentSecurityPolicy,

      "x-content-type-options":
        "nosniff",

      "x-frame-options":
        this.frameOptions,

      "x-xss-protection":
        "0",

      "referrer-policy":
        this.referrerPolicy,

      "permissions-policy":
        this.permissionsPolicy,

      "cross-origin-opener-policy":
        "same-origin",

      "cross-origin-resource-policy":
        "same-origin",
    };

    if (this.enableHsts) {
      headers["strict-transport-security"] =
        `max-age=${this.hstsMaxAge}; includeSubDomains`;
    }

    return headers;
  }

  health(): {
    status: "healthy";
    hstsEnabled: boolean;
  } {
    return {
      status: "healthy",
      hstsEnabled: this.enableHsts,
    };
  }
}

export function security(
  options: SecurityOptions = {},
): MiddlewareFunction {
  return new SecurityMiddleware(
    options,
  ).middleware();
}