import type {
  Middleware,
} from "./middleware.js";

export function loggingMiddleware(
  logger: {
    log: (
      level: "debug" | "info" | "warn" | "error",
      message: string,
      metadata?: Record<string, unknown>,
    ) => unknown;
  },
): Middleware {
  return async (context, next) => {
    const started = Date.now();

    const response = await next();

    logger.log(
      "info",
      "gateway request",
      {
        requestId: context.request.id,
        method: context.request.method,
        path: context.request.path,
        statusCode: response.statusCode,
        durationMs: Date.now() - started,
      },
    );

    return response;
  };
}
