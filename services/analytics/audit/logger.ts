// services/analytics/audit/logger.ts

import {
  AUDIT_EVENT_VERSION,
  type AuditEvent,
  type AuditLoggerHealth,
  type AuditLoggerOptions,
  type AuditQuery,
  type CreateAuditEventInput,
} from "./events.js";

const DEFAULT_MAX_EVENTS_PER_ORGANIZATION = 50_000;
const DEFAULT_QUERY_LIMIT = 100;
const DEFAULT_MAX_QUERY_LIMIT = 1_000;

const DEFAULT_SENSITIVE_KEYS = [
  "password",
  "passwd",
  "secret",
  "token",
  "accessToken",
  "refreshToken",
  "apiKey",
  "api_key",
  "authorization",
  "cookie",
  "session",
  "privateKey",
  "private_key",
  "clientSecret",
  "client_secret",
  "creditCard",
  "credit_card",
  "cvv",
  "ssn",
];

function createRandomId(): string {
  const cryptoApi = (
    globalThis as typeof globalThis & {
      crypto?: {
        randomUUID?: () => string;
      };
    }
  ).crypto;

  if (
    cryptoApi &&
    typeof cryptoApi.randomUUID === "function"
  ) {
    return cryptoApi.randomUUID();
  }

  return `audit-${Date.now()}-${Math.random().toString(16).slice(2, 12)}`;
}

function stableHash(input: string): string {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    const code = input.charCodeAt(index);
    hash ^= code;
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}

function createDeterministicHash(input: string): string {
  let result = "";

  for (let iteration = 0; iteration < 8; iteration += 1) {
    let hash = 2166136261;

    for (let index = 0; index < input.length; index += 1) {
      const code = input.charCodeAt(index) + iteration * 31;
      hash ^= code;
      hash = Math.imul(hash, 16777619);
    }

    result += (hash >>> 0).toString(16).padStart(8, "0");
  }

  return result;
}

function createHashHex(input: string): string {
  return createDeterministicHash(input);
}

function assertNonEmpty(value: string, field: string): void {
  if (!value || value.trim().length === 0) {
    throw new Error(`${field} must not be empty`);
  }
}

function assertValidOrganizationId(
  organizationId: string,
): void {
  assertNonEmpty(organizationId, "organizationId");
}

function normalizeLimit(
  limit: number | undefined,
  defaultLimit: number,
  maxLimit: number,
): number {
  if (limit === undefined) {
    return defaultLimit;
  }

  if (!Number.isInteger(limit) || limit <= 0) {
    throw new Error("limit must be a positive integer");
  }

  return Math.min(limit, maxLimit);
}

function cloneValue(
  value: unknown,
  sensitiveKeys: Set<string>,
  seen: WeakSet<object>,
): unknown {
  if (value === null) {
    return null;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "object") {
    if (seen.has(value)) {
      return "[Circular]";
    }

    seen.add(value);

    if (Array.isArray(value)) {
      return value.map((item) =>
        cloneValue(item, sensitiveKeys, seen),
      );
    }

    const result: Record<string, unknown> = {};

    for (const [key, child] of Object.entries(value)) {
      if (sensitiveKeys.has(key.toLowerCase())) {
        result[key] = "[REDACTED]";
        continue;
      }

      result[key] = cloneValue(
        child,
        sensitiveKeys,
        seen,
      );
    }

    return result;
  }

  return String(value);
}

function sanitizeMetadata(
  metadata: Record<string, unknown> | undefined,
  sensitiveKeys: Set<string>,
): Record<string, unknown> {
  if (!metadata) {
    return {};
  }

  const result = cloneValue(
    metadata,
    sensitiveKeys,
    new WeakSet<object>(),
  );

  if (
    !result ||
    typeof result !== "object" ||
    Array.isArray(result)
  ) {
    return {};
  }

  return result as Record<string, unknown>;
}

function canonicalize(value: unknown): string {
  if (value === null) {
    return "null";
  }

  if (typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(canonicalize).join(",")}]`;
  }

  const object = value as Record<string, unknown>;

  const keys = Object.keys(object).sort();

  return `{${keys
    .map(
      (key) =>
        `${JSON.stringify(key)}:${canonicalize(object[key])}`,
    )
    .join(",")}}`;
}

function calculateEventHash(
  event: Omit<AuditEvent, "eventHash">,
): string {
  const payload = canonicalize(event);

  return createHashHex(payload);
}

function cloneEvent(event: AuditEvent): AuditEvent {
  return {
    ...event,
    actor: {
      ...event.actor,
    },
    resource: event.resource
      ? {
          ...event.resource,
        }
      : undefined,
    request: event.request
      ? {
          ...event.request,
        }
      : undefined,
    metadata: {
      ...event.metadata,
    },
  };
}

export class AuditLogger {
  private readonly eventsByOrganization =
    new Map<string, AuditEvent[]>();

  private readonly maxEventsPerOrganization: number;

  private readonly defaultQueryLimit: number;

  private readonly maxQueryLimit: number;

  private readonly sensitiveKeys: Set<string>;

  constructor(
    options: AuditLoggerOptions = {},
  ) {
    this.maxEventsPerOrganization =
      options.maxEventsPerOrganization ??
      DEFAULT_MAX_EVENTS_PER_ORGANIZATION;

    this.defaultQueryLimit =
      options.defaultQueryLimit ??
      DEFAULT_QUERY_LIMIT;

    this.maxQueryLimit =
      options.maxQueryLimit ??
      DEFAULT_MAX_QUERY_LIMIT;

    if (
      !Number.isInteger(
        this.maxEventsPerOrganization,
      ) ||
      this.maxEventsPerOrganization <= 0
    ) {
      throw new Error(
        "maxEventsPerOrganization must be a positive integer",
      );
    }

    if (
      !Number.isInteger(this.defaultQueryLimit) ||
      this.defaultQueryLimit <= 0
    ) {
      throw new Error(
        "defaultQueryLimit must be a positive integer",
      );
    }

    if (
      !Number.isInteger(this.maxQueryLimit) ||
      this.maxQueryLimit <= 0
    ) {
      throw new Error(
        "maxQueryLimit must be a positive integer",
      );
    }

    this.sensitiveKeys = new Set(
      (
        options.sensitiveKeys ??
        DEFAULT_SENSITIVE_KEYS
      ).map((key) => key.toLowerCase()),
    );
  }

  /**
   * Write an audit event.
   */
  log(input: CreateAuditEventInput): AuditEvent {
    this.validateInput(input);

    const organizationEvents =
      this.eventsByOrganization.get(
        input.organizationId,
      ) ?? [];

    const previousEvent =
      organizationEvents.length > 0
        ? organizationEvents[
            organizationEvents.length - 1
          ]
        : undefined;

    const metadata = sanitizeMetadata(
      input.metadata,
      this.sensitiveKeys,
    );

    const eventWithoutHash: Omit<
      AuditEvent,
      "eventHash"
    > = {
      id: createRandomId(),

      version: AUDIT_EVENT_VERSION,

      organizationId: input.organizationId,

      timestamp: (
        input.timestamp ?? new Date()
      ).toISOString(),

      eventType: input.eventType,

      action: input.action,

      severity: input.severity ?? "info",

      outcome: input.outcome ?? "success",

      actor: {
        ...input.actor,
      },

      resource: input.resource
        ? {
            ...input.resource,
          }
        : undefined,

      request: input.request
        ? {
            ...input.request,
          }
        : undefined,

      message: input.message,

      metadata,

      previousEventHash:
        previousEvent?.eventHash,
    };

    const event: AuditEvent = {
      ...eventWithoutHash,

      eventHash:
        calculateEventHash(eventWithoutHash),
    };

    organizationEvents.push(event);

    if (
      organizationEvents.length >
      this.maxEventsPerOrganization
    ) {
      const removeCount =
        organizationEvents.length -
        this.maxEventsPerOrganization;

      organizationEvents.splice(
        0,
        removeCount,
      );
    }

    this.eventsByOrganization.set(
      input.organizationId,
      organizationEvents,
    );

    return cloneEvent(event);
  }

  /**
   * Convenience method for successful events.
   */
  success(
    input: CreateAuditEventInput,
  ): AuditEvent {
    return this.log({
      ...input,
      outcome: "success",
    });
  }

  /**
   * Convenience method for failed events.
   */
  failure(
    input: CreateAuditEventInput,
  ): AuditEvent {
    return this.log({
      ...input,
      outcome: "failure",
      severity:
        input.severity ?? "error",
    });
  }

  /**
   * Convenience method for denied operations.
   */
  denied(
    input: CreateAuditEventInput,
  ): AuditEvent {
    return this.log({
      ...input,
      outcome: "denied",
      severity:
        input.severity ?? "warning",
    });
  }

  /**
   * Retrieve events for a tenant.
   */
  query(query: AuditQuery): AuditEvent[] {
    assertValidOrganizationId(
      query.organizationId,
    );

    const limit = normalizeLimit(
      query.limit,
      this.defaultQueryLimit,
      this.maxQueryLimit,
    );

    const events =
      this.eventsByOrganization.get(
        query.organizationId,
      ) ?? [];

    const filtered = events.filter((event) => {
      if (
        query.eventType &&
        event.eventType !== query.eventType
      ) {
        return false;
      }

      if (
        query.action &&
        event.action !== query.action
      ) {
        return false;
      }

      if (
        query.severity &&
        event.severity !== query.severity
      ) {
        return false;
      }

      if (
        query.outcome &&
        event.outcome !== query.outcome
      ) {
        return false;
      }

      if (
        query.actorId &&
        event.actor.id !== query.actorId
      ) {
        return false;
      }

      if (
        query.resourceType &&
        event.resource?.type !==
          query.resourceType
      ) {
        return false;
      }

      if (
        query.resourceId &&
        event.resource?.id !==
          query.resourceId
      ) {
        return false;
      }

      if (
        query.requestId &&
        event.request?.requestId !==
          query.requestId
      ) {
        return false;
      }

      if (
        query.correlationId &&
        event.request?.correlationId !==
          query.correlationId
      ) {
        return false;
      }

      const timestamp =
        new Date(event.timestamp).getTime();

      if (
        query.from &&
        timestamp < query.from.getTime()
      ) {
        return false;
      }

      if (
        query.to &&
        timestamp > query.to.getTime()
      ) {
        return false;
      }

      return true;
    });

    return filtered
      .slice()
      .reverse()
      .slice(0, limit)
      .map(cloneEvent);
  }

  /**
   * Get one event by ID.
   */
  getById(
    organizationId: string,
    eventId: string,
  ): AuditEvent | undefined {
    assertValidOrganizationId(
      organizationId,
    );

    assertNonEmpty(eventId, "eventId");

    const events =
      this.eventsByOrganization.get(
        organizationId,
      ) ?? [];

    const event = events.find(
      (item) => item.id === eventId,
    );

    return event
      ? cloneEvent(event)
      : undefined;
  }

  /**
   * Count tenant audit events.
   */
  count(organizationId: string): number {
    assertValidOrganizationId(
      organizationId,
    );

    return (
      this.eventsByOrganization.get(
        organizationId,
      )?.length ?? 0
    );
  }

  /**
   * Verify the hash chain for one organization.
   */
  verifyIntegrity(
    organizationId: string,
  ): boolean {
    assertValidOrganizationId(
      organizationId,
    );

    const events =
      this.eventsByOrganization.get(
        organizationId,
      ) ?? [];

    let previousHash: string | undefined;

    for (const event of events) {
      if (
        event.previousEventHash !==
        previousHash
      ) {
        return false;
      }

      const {
        eventHash,
        ...eventWithoutHash
      } = event;

      const calculatedHash =
        calculateEventHash(
          eventWithoutHash,
        );

      if (calculatedHash !== eventHash) {
        return false;
      }

      previousHash = event.eventHash;
    }

    return true;
  }

  /**
   * Remove all events belonging to one tenant.
   *
   * Intended for controlled retention/deletion workflows.
   */
  clearOrganization(
    organizationId: string,
  ): number {
    assertValidOrganizationId(
      organizationId,
    );

    const count = this.count(
      organizationId,
    );

    this.eventsByOrganization.delete(
      organizationId,
    );

    return count;
  }

  /**
   * Return logger health information.
   */
  health(): AuditLoggerHealth {
    let totalEvents = 0;

    for (const events of this.eventsByOrganization.values()) {
      totalEvents += events.length;
    }

    return {
      healthy: true,

      totalEvents,

      organizations:
        this.eventsByOrganization.size,

      maxEventsPerOrganization:
        this.maxEventsPerOrganization,
    };
  }

  private validateInput(
    input: CreateAuditEventInput,
  ): void {
    assertValidOrganizationId(
      input.organizationId,
    );

    assertNonEmpty(
      input.action,
      "action",
    );

    assertNonEmpty(
      input.actor.id,
      "actor.id",
    );

    if (input.message !== undefined) {
      assertNonEmpty(
        input.message,
        "message",
      );
    }

    if (
      input.timestamp &&
      Number.isNaN(
        input.timestamp.getTime(),
      )
    ) {
      throw new Error(
        "timestamp must be valid",
      );
    }
  }
}