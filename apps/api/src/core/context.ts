import type {
  AuthenticatedPrincipal,
  RequestContext,
} from "../types/request.types.js";
import type { JsonObject } from "../types/api.types.js";

export interface CreateRequestContextInput {
  readonly requestId: string;
  readonly receivedAt?: string;
  readonly principal?: AuthenticatedPrincipal;
  readonly metadata?: Readonly<JsonObject>;
}

function validateRequestId(requestId: string): void {
  if (
    typeof requestId !== "string" ||
    requestId.trim().length === 0 ||
    requestId.length > 256 ||
    /[\u0000-\u001f\u007f]/u.test(requestId)
  ) {
    throw new TypeError(
      "Request context requires a valid, non-empty request ID of at most 256 characters.",
    );
  }
}

function validateTimestamp(receivedAt: string): void {
  if (
    typeof receivedAt !== "string" ||
    receivedAt.trim().length === 0 ||
    !Number.isFinite(Date.parse(receivedAt))
  ) {
    throw new TypeError(
      "Request context receivedAt must be a valid date-time string.",
    );
  }
}

function copyAndFreeze<T>(
  value: T,
  ancestors: WeakSet<object> = new WeakSet<object>(),
): T {
  if (value === null || typeof value !== "object") {
    return value;
  }

  if (ancestors.has(value)) {
    throw new TypeError("Request context metadata must not contain cycles.");
  }

  ancestors.add(value);

  try {
    if (Array.isArray(value)) {
      const copied = value.map((item) => copyAndFreeze(item, ancestors));
      return Object.freeze(copied) as T;
    }

    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError(
        "Request context metadata must contain only plain JSON objects.",
      );
    }

    const copied: Record<string, unknown> = Object.create(null) as Record<
      string,
      unknown
    >;

    for (const [key, item] of Object.entries(value)) {
      copied[key] = copyAndFreeze(item, ancestors);
    }

    return Object.freeze(copied) as T;
  } finally {
    ancestors.delete(value);
  }
}

function copyPrincipal(
  principal: AuthenticatedPrincipal,
): AuthenticatedPrincipal {
  if (
    principal === null ||
    typeof principal !== "object" ||
    typeof principal.userId !== "string" ||
    principal.userId.trim().length === 0
  ) {
    throw new TypeError(
      "Request context principal must have a non-empty userId.",
    );
  }

  if (
    principal.tenantId !== undefined &&
    (typeof principal.tenantId !== "string" ||
      principal.tenantId.trim().length === 0)
  ) {
    throw new TypeError(
      "Request context principal tenantId must be a non-empty string when supplied.",
    );
  }

  for (const field of ["roles", "scopes"] as const) {
    const values = principal[field];

    if (
      !Array.isArray(values) ||
      values.some(
        (item) => typeof item !== "string" || item.trim().length === 0,
      )
    ) {
      throw new TypeError(
        `Request context principal ${field} must contain only non-empty strings.`,
      );
    }
  }

  return Object.freeze({
    userId: principal.userId,
    ...(principal.tenantId === undefined
      ? {}
      : { tenantId: principal.tenantId }),
    roles: Object.freeze([...principal.roles]),
    scopes: Object.freeze([...principal.scopes]),
  });
}

/**
 * Creates an immutable request context using the shared API request types.
 * Callers should pass only a principal produced by trusted authentication
 * middleware, never identity claims copied directly from request input.
 */
export function createRequestContext(
  input: CreateRequestContextInput,
): RequestContext {
  if (input === null || typeof input !== "object") {
    throw new TypeError("Request context input must be an object.");
  }

  validateRequestId(input.requestId);

  const receivedAt = input.receivedAt ?? new Date().toISOString();
  validateTimestamp(receivedAt);

  const principal =
    input.principal === undefined
      ? undefined
      : copyPrincipal(input.principal);

  const metadata =
    input.metadata === undefined
      ? undefined
      : copyAndFreeze(input.metadata) as JsonObject;

  return Object.freeze({
    requestId: input.requestId,
    receivedAt,
    ...(principal === undefined ? {} : { principal }),
    ...(metadata === undefined ? {} : { metadata }),
  });
}
