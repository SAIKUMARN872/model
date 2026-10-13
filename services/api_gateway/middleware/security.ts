import type {
  Middleware,
} from "./middleware.js";

export function securityMiddleware(): Middleware {
  return async (_context, next) => {
    const response = await next();

    return {
      ...response,
      headers: {
        ...response.headers,
        "x-content-type-options": "nosniff",
        "x-frame-options": "DENY",
        "referrer-policy": "no-referrer",
      },
    };
  };
}
