import {
  Logger,
  logger as defaultLogger,
} from "../logging/index.js";

import type {
  MiddlewareFunction,
  MiddlewareRequest,
  MiddlewareResponse,
} from "./middleware.js";

export interface LoggingMiddlewareOptions {
  logger?: Logger;
  includeHeaders?: boolean;
  includeBody?: boolean;
}

export class LoggingMiddleware {
  private readonly logger: Logger;
  private readonly includeHeaders: boolean;
  private readonly includeBody: boolean;

  constructor(
    options: LoggingMiddlewareOptions = {},
  ) {
    this.logger =
      options.logger ?? defaultLogger;

    this.includeHeaders =
      options.includeHeaders ?? false;

    this.includeBody =
      options.includeBody ?? false;
  }

  middleware(): MiddlewareFunction {
    return async (
      request,
      next,
    ): Promise<MiddlewareResponse> => {
      const start = process.hrtime.bigint();

      const requestId =
        request.requestId ??
        request.context?.requestId;

      this.logger.info(
        "HTTP request started",
        {
          requestId:
            typeof requestId === "string"
              ? requestId
              : undefined,

          method: request.method,

          operation: request.path,

          ...(this.includeHeaders
            ? {
                headers: this.sanitizeHeaders(
                  request.headers,
                ),
              }
            : {}),

          ...(this.includeBody
            ? {
                body: this.sanitizeBody(
                  request.body,
                ),
              }
            : {}),
        },
      );

      try {
        const response =
          await next();

        const durationMs =
          Number(
            process.hrtime.bigint() -
              start,
          ) / 1_000_000;

        this.logger.info(
          "HTTP request completed",
          {
            requestId:
              typeof requestId ===
              "string"
                ? requestId
                : undefined,

            method: request.method,

            operation: request.path,

            statusCode:
              response.statusCode,

            durationMs:
              Math.round(
                durationMs * 1000,
              ) / 1000,
          },
        );

        return response;
      } catch (error) {
        const durationMs =
          Number(
            process.hrtime.bigint() -
              start,
          ) / 1_000_000;

        this.logger.error(
          "HTTP request failed",
          {
            requestId:
              typeof requestId ===
              "string"
                ? requestId
                : undefined,

            method: request.method,

            operation: request.path,

            durationMs:
              Math.round(
                durationMs * 1000,
              ) / 1000,
          },
          error,
        );

        throw error;
      }
    };
  }

  private sanitizeHeaders(
    headers: Record<
      string,
      string | undefined
    >,
  ): Record<string, string> {
    const result: Record<
      string,
      string
    > = {};

    const sensitiveHeaders = new Set([
      "authorization",
      "cookie",
      "set-cookie",
      "x-api-key",
      "proxy-authorization",
    ]);

    for (const [key, value] of Object.entries(
      headers,
    )) {
      if (value === undefined) {
        continue;
      }

      if (
        sensitiveHeaders.has(
          key.toLowerCase(),
        )
      ) {
        result[key] = "[REDACTED]";
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  private sanitizeBody(
    body: unknown,
  ): unknown {
    if (
      body === null ||
      body === undefined
    ) {
      return body;
    }

    if (
      typeof body !== "object"
    ) {
      return body;
    }

    if (Array.isArray(body)) {
      return "[ARRAY]";
    }

    const sensitiveFields = new Set([
      "password",
      "token",
      "accessToken",
      "refreshToken",
      "apiKey",
      "secret",
      "authorization",
      "creditCard",
    ]);

    const result: Record<
      string,
      unknown
    > = {};

    for (const [
      key,
      value,
    ] of Object.entries(
      body as Record<string, unknown>,
    )) {
      if (
        sensitiveFields.has(key)
      ) {
        result[key] = "[REDACTED]";
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  health(): {
    status: "healthy";
    component: string;
  } {
    return {
      status: "healthy",
      component: "logging-middleware",
    };
  }
}

export function logging(
  options: LoggingMiddlewareOptions = {},
): MiddlewareFunction {
  return new LoggingMiddleware(
    options,
  ).middleware();
}