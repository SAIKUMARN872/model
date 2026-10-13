import type {
  Middleware,
} from "./middleware.js";

export function corsMiddleware(
  origins: string[] = ["*"],
): Middleware {
  return async (_context, next) => {
    const response = await next();

    return {
      ...response,
      headers: {
        ...response.headers,
        "access-control-allow-origin":
          origins.includes("*")
            ? "*"
            : origins.join(", "),
        "access-control-allow-methods":
          "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        "access-control-allow-headers":
          "authorization,content-type",
      },
    };
  };
}
