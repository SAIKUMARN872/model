import { randomUUID } from "node:crypto";

export interface MiddlewareRequest {
  method: string;
  path: string;
  headers: Record<string, string | undefined>;
  query?: Record<string, string | undefined>;
  body?: unknown;
  requestId?: string;
  context?: Record<string, unknown>;
}

export interface MiddlewareResponse {
  statusCode: number;
  headers: Record<string, string>;
  body?: unknown;
}

export type NextFunction = () => Promise<MiddlewareResponse>;

export type MiddlewareFunction = (
  request: MiddlewareRequest,
  next: NextFunction,
) => Promise<MiddlewareResponse>;

export interface MiddlewareOptions {
  requestIdHeader?: string;
}

export function createRequestId(): string {
  return randomUUID();
}

export function getHeader(
  request: MiddlewareRequest,
  name: string,
): string | undefined {
  const target = name.toLowerCase();

  const key = Object.keys(request.headers).find(
    (header) =>
      header.toLowerCase() === target,
  );

  return key
    ? request.headers[key]
    : undefined;
}

export function withRequestId(
  request: MiddlewareRequest,
  options: MiddlewareOptions = {},
): MiddlewareRequest {
  const headerName =
    options.requestIdHeader ??
    "x-request-id";

  const existing = getHeader(
    request,
    headerName,
  );

  const requestId =
    existing?.trim() || request.requestId || createRequestId();

  return {
    ...request,
    requestId,
    context: {
      ...(request.context ?? {}),
      requestId,
    },
  };
}

export function composeMiddleware(
  middlewares: MiddlewareFunction[],
): (
  request: MiddlewareRequest,
) => Promise<MiddlewareResponse> {
  return async (
    request: MiddlewareRequest,
  ): Promise<MiddlewareResponse> => {
    let index = -1;

    const dispatch = async (
      position: number,
    ): Promise<MiddlewareResponse> => {
      if (position <= index) {
        throw new Error(
          "next() called multiple times",
        );
      }

      index = position;

      const middleware =
        middlewares[position];

      if (!middleware) {
        return {
          statusCode: 404,
          headers: {
            "content-type":
              "application/json",
          },
          body: {
            success: false,
            error: "Route not found",
          },
        };
      }

      return middleware(
        request,
        () => dispatch(position + 1),
      );
    };

    return dispatch(0);
  };
}

export function createJsonResponse(
  statusCode: number,
  body: unknown,
  headers: Record<string, string> = {},
): MiddlewareResponse {
  return {
    statusCode,
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    body,
  };
}

export function health(): {
  status: "healthy";
  component: string;
} {
  return {
    status: "healthy",
    component: "middleware",
  };
}