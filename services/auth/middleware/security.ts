import { createHash } from "node:crypto";

export interface SecurityRequest {
  headers?: Record<string, string | undefined>;
  ip?: string;
  path?: string;
  method?: string;
}

export interface SecurityResult {
  allowed: boolean;
  message: string;
  requestId?: string;
}

export interface SecurityOptions {
  maxBodySize?: number;
  requireRequestId?: boolean;
  allowedMethods?: string[];
}

export class SecurityMiddleware {
  private readonly maxBodySize: number;
  private readonly requireRequestId: boolean;
  private readonly allowedMethods: Set<string>;

  constructor(options: SecurityOptions = {}) {
    this.maxBodySize =
      options.maxBodySize ?? 1024 * 1024;

    this.requireRequestId =
      options.requireRequestId ?? false;

    this.allowedMethods = new Set(
      (
        options.allowedMethods ?? [
          "GET",
          "POST",
          "PUT",
          "PATCH",
          "DELETE",
          "OPTIONS",
        ]
      ).map((method) => method.toUpperCase()),
    );
  }

  validate(
    request: SecurityRequest,
  ): SecurityResult {
    const method =
      request.method?.toUpperCase() ?? "GET";

    if (!this.allowedMethods.has(method)) {
      return {
        allowed: false,
        message: `HTTP method not allowed: ${method}`,
      };
    }

    const headers = request.headers ?? {};

    if (this.hasDangerousHeader(headers)) {
      return {
        allowed: false,
        message: "Potentially dangerous header detected",
      };
    }

    const requestId =
      headers["x-request-id"] ??
      headers["X-Request-ID"];

    if (this.requireRequestId && !requestId) {
      return {
        allowed: false,
        message: "X-Request-ID header is required",
      };
    }

    return {
      allowed: true,
      message: "Security validation successful",
      requestId: requestId ?? this.generateRequestId(
        request,
      ),
    };
  }

  validateBodySize(
    body: string | Buffer,
  ): boolean {
    const size =
      typeof body === "string"
        ? Buffer.byteLength(body, "utf8")
        : body.length;

    return size <= this.maxBodySize;
  }

  sanitizeHeaderValue(
    value: string,
  ): string {
    return value
      .replace(/[\r\n]/g, "")
      .trim();
  }

  hashIp(ip: string): string {
    return createHash("sha256")
      .update(ip)
      .digest("hex");
  }

  isSafePath(path: string): boolean {
    if (!path) {
      return false;
    }

    const normalized = path.replace(/\\/g, "/");

    if (normalized.includes("..")) {
      return false;
    }

    if (
      normalized.includes("\0") ||
      normalized.includes("\r") ||
      normalized.includes("\n")
    ) {
      return false;
    }

    return true;
  }

  private hasDangerousHeader(
    headers: Record<string, string | undefined>,
  ): boolean {
    const dangerousHeaders = [
      "x-forwarded-host",
      "x-original-url",
      "x-rewrite-url",
    ];

    return dangerousHeaders.some((name) => {
      const value = headers[name];

      return (
        value !== undefined &&
        value.includes("\r")
      );
    });
  }

  private generateRequestId(
    request: SecurityRequest,
  ): string {
    const source = [
      request.method ?? "GET",
      request.path ?? "/",
      request.ip ?? "unknown",
      Date.now().toString(),
    ].join(":");

    return createHash("sha256")
      .update(source)
      .digest("hex")
      .slice(0, 32);
  }
}

export const securityMiddleware =
  new SecurityMiddleware();
