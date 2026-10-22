import type { Request, RequestHandler } from "express";
import type { RateLimitConsumption } from "./redis-rate-limit-store.js";

export interface RateLimitStore {
  consume(key: string, windowMs: number): Promise<RateLimitConsumption>;
}

export interface RateLimitOptions {
  /** Maximum accepted requests for each key within a window. */
  readonly maxRequests: number;
  readonly windowMs: number;
  readonly keyGenerator?: (request: Request) => string;
  readonly skip?: (request: Request) => boolean;
  /** Hard bound on distinct keys retained in the in-memory store. */
  readonly maxKeys?: number;
  /** Injectable clock for deterministic tests. */
  readonly now?: () => number;
  /** Optional shared store. When omitted, the process-local store is used. */
  readonly store?: RateLimitStore;
}

interface WindowRecord {
  count: number;
  resetAt: number;
}

const defaultKeyGenerator = (request: Request): string =>
  request.ip || request.socket.remoteAddress || "unknown";

function positiveInteger(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive safe integer.`);
  }
}

function setRateLimitHeaders(
  response: Parameters<RequestHandler>[1],
  maxRequests: number,
  count: number,
  resetAt: number,
  time: number,
): void {
  response.setHeader("RateLimit-Limit", String(maxRequests));
  response.setHeader(
    "RateLimit-Remaining",
    String(Math.max(0, maxRequests - count)),
  );
  response.setHeader("RateLimit-Reset", String(Math.ceil(resetAt / 1000)));
  response.setHeader("Cache-Control", "no-store");

  if (count >= maxRequests) {
    response.setHeader(
      "Retry-After",
      String(Math.max(1, Math.ceil((resetAt - time) / 1000))),
    );
  }
}

/**
 * Fixed-window rate limiter.
 *
 * Use a shared atomic store for multi-instance deployments. The in-memory
 * implementation remains available for development and isolated tests.
 */
export function createRateLimitMiddleware(
  options: RateLimitOptions,
): RequestHandler {
  positiveInteger(options.maxRequests, "maxRequests");
  positiveInteger(options.windowMs, "windowMs");

  const maxKeys = options.maxKeys ?? 10_000;
  positiveInteger(maxKeys, "maxKeys");

  const keyGenerator = options.keyGenerator ?? defaultKeyGenerator;
  const now = options.now ?? Date.now;
  const windows = new Map<string, WindowRecord>();

  const removeExpired = (time: number): void => {
    for (const [key, record] of windows) {
      if (record.resetAt <= time) windows.delete(key);
    }
  };

  return async (request, response, next) => {
    try {
      if (options.skip?.(request)) {
        next();
        return;
      }
    } catch (error: unknown) {
      next(error);
      return;
    }

    let key: string;
    try {
      key = keyGenerator(request);
    } catch (error: unknown) {
      next(error);
      return;
    }

    if (typeof key !== "string" || key.trim().length === 0) {
      next(new Error("Rate-limit key generator returned an invalid key."));
      return;
    }

    const time = now();

    if (options.store) {
      let consumption: RateLimitConsumption;

      try {
        consumption = await options.store.consume(key, options.windowMs);
      } catch {
        response.setHeader("Cache-Control", "no-store");
        response.status(503).json({
          success: false,
          error: {
            code: "RATE_LIMITER_UNAVAILABLE",
            message: "Request limiting is temporarily unavailable.",
          },
          requestId: response.locals.requestId,
        });
        return;
      }

      // A custom/shared store is a runtime boundary: validate its result
      // before using it to make an access-control decision.
      if (
        !Number.isSafeInteger(consumption?.count) ||
        consumption.count <= 0 ||
        !Number.isSafeInteger(consumption?.resetAt) ||
        consumption.resetAt <= 0
      ) {
        response.setHeader("Cache-Control", "no-store");
        response.status(503).json({
          success: false,
          error: {
            code: "RATE_LIMITER_UNAVAILABLE",
            message: "Request limiting is temporarily unavailable.",
          },
          requestId: response.locals.requestId,
        });
        return;
      }

      setRateLimitHeaders(
        response,
        options.maxRequests,
        consumption.count,
        consumption.resetAt,
        now(),
      );

      if (consumption.count > options.maxRequests) {
        response.status(429).json({
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests. Please try again later.",
          },
          requestId: response.locals.requestId,
        });
        return;
      }

      next();
      return;
    }

    let record = windows.get(key);

    if (!record || record.resetAt <= time) {
      if (record) windows.delete(key);

      if (windows.size >= maxKeys) removeExpired(time);

      if (windows.size >= maxKeys) {
        response.setHeader("Cache-Control", "no-store");
        response.status(503).json({
          success: false,
          error: {
            code: "RATE_LIMITER_CAPACITY",
            message: "Request limiting is temporarily at capacity.",
          },
          requestId: response.locals.requestId,
        });
        return;
      }

      record = { count: 0, resetAt: time + options.windowMs };
      windows.set(key, record);
    }

    setRateLimitHeaders(
      response,
      options.maxRequests,
      record.count,
      record.resetAt,
      time,
    );

    if (record.count >= options.maxRequests) {
      response.status(429).json({
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests. Please try again later.",
        },
        requestId: response.locals.requestId,
      });
      return;
    }

    record.count += 1;
    response.setHeader(
      "RateLimit-Remaining",
      String(Math.max(0, options.maxRequests - record.count)),
    );
    next();
  };
}
