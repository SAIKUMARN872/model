export interface RequestContext {
  requestId: string;
  method: string;
  path: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  params: Record<string, string>;
  body: unknown;
  timestamp: number;
}

export interface RequestHandlerInput {
  method: string;
  path: string;
  headers?: Record<string, string | undefined>;
  query?: Record<string, string | undefined>;
  params?: Record<string, string | undefined>;
  body?: unknown;
  requestId?: string;
}

export interface NormalizedRequest {
  requestId: string;
  method: string;
  path: string;
  headers: Record<string, string>;
  query: Record<string, string>;
  params: Record<string, string>;
  body: unknown;
  timestamp: number;
}

function normalizeRecord(
  input: Record<string, string | undefined> | undefined,
): Record<string, string> {
  if (!input) {
    return {};
  }

  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) {
      result[key.toLowerCase()] = value;
    }
  }

  return result;
}

function createRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export class RequestHandler {
  normalize(input: RequestHandlerInput): NormalizedRequest {
    const method = input.method.trim().toUpperCase();
    const path = input.path.trim();

    if (!method) {
      throw new Error("Request method is required.");
    }

    if (!path) {
      throw new Error("Request path is required.");
    }

    if (!path.startsWith("/")) {
      throw new Error("Request path must start with '/'.");
    }

    return {
      requestId: input.requestId?.trim() || createRequestId(),
      method,
      path,
      headers: normalizeRecord(input.headers),
      query: normalizeRecord(input.query),
      params: normalizeRecord(input.params),
      body: input.body ?? null,
      timestamp: Date.now(),
    };
  }

  getHeader(
    request: NormalizedRequest,
    name: string,
  ): string | undefined {
    return request.headers[name.trim().toLowerCase()];
  }

  hasHeader(
    request: NormalizedRequest,
    name: string,
  ): boolean {
    return this.getHeader(request, name) !== undefined;
  }

  getQueryParam(
    request: NormalizedRequest,
    name: string,
  ): string | undefined {
    return request.query[name.trim().toLowerCase()];
  }

  getPathParam(
    request: NormalizedRequest,
    name: string,
  ): string | undefined {
    return request.params[name.trim().toLowerCase()];
  }

  isJsonRequest(request: NormalizedRequest): boolean {
    const contentType = this.getHeader(request, "content-type");

    return contentType
      ? contentType.toLowerCase().includes("application/json")
      : false;
  }

  isAuthenticated(request: NormalizedRequest): boolean {
    const authorization = this.getHeader(request, "authorization");

    return Boolean(
      authorization &&
        authorization.toLowerCase().startsWith("bearer "),
    );
  }

  getBearerToken(
    request: NormalizedRequest,
  ): string | undefined {
    const authorization = this.getHeader(request, "authorization");

    if (!authorization) {
      return undefined;
    }

    if (!authorization.toLowerCase().startsWith("bearer ")) {
      return undefined;
    }

    const token = authorization.slice(7).trim();

    return token || undefined;
  }

  health(): {
    status: "ok";
    component: string;
  } {
    return {
      status: "ok",
      component: "request-handler",
    };
  }
}