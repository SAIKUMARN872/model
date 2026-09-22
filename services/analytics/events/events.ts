// services/analytics/events/events.ts

export type AnalyticsEventType =
  | "request"
  | "response"
  | "error"
  | "latency"
  | "cost"
  | "quality"
  | "token_usage"
  | "cache"
  | "custom";

export type EventSeverity =
  | "debug"
  | "info"
  | "warning"
  | "error"
  | "critical";

export interface AnalyticsEvent {
  id: string;
  organizationId: string;
  type: AnalyticsEventType;
  severity: EventSeverity;
  timestamp: string;
  source: string;
  requestId?: string;
  userId?: string;
  provider?: string;
  model?: string;
  data: Record<string, unknown>;
}

export interface CreateEventInput {
  organizationId: string;
  type: AnalyticsEventType;
  severity?: EventSeverity;
  source: string;
  timestamp?: string;
  requestId?: string;
  userId?: string;
  provider?: string;
  model?: string;
  data?: Record<string, unknown>;
}

export interface EventFilter {
  organizationId?: string;
  type?: AnalyticsEventType;
  severity?: EventSeverity;
  source?: string;
  requestId?: string;
  userId?: string;
  provider?: string;
  model?: string;
  startTime?: string;
  endTime?: string;
}

export interface EventStats {
  total: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  organizations: number;
}

const EVENT_TYPES: readonly AnalyticsEventType[] = [
  "request",
  "response",
  "error",
  "latency",
  "cost",
  "quality",
  "token_usage",
  "cache",
  "custom",
];

const SEVERITIES: readonly EventSeverity[] = [
  "debug",
  "info",
  "warning",
  "error",
  "critical",
];

function assertNonEmpty(
  value: string,
  field: string,
): void {
  if (!value || value.trim().length === 0) {
    throw new Error(`${field} cannot be empty`);
  }
}

export function createRandomId(): string {
  const cryptoApi =
    (globalThis as typeof globalThis & {
      crypto?: {
        randomUUID?: () => string;
      };
    }).crypto;

  if (
    cryptoApi &&
    typeof cryptoApi.randomUUID === "function"
  ) {
    return cryptoApi.randomUUID();
  }

  return `event_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
}

export function validateEventType(
  type: AnalyticsEventType,
): void {
  if (!EVENT_TYPES.includes(type)) {
    throw new Error(
      `Invalid event type: ${type}`,
    );
  }
}

export function validateSeverity(
  severity: EventSeverity,
): void {
  if (!SEVERITIES.includes(severity)) {
    throw new Error(
      `Invalid event severity: ${severity}`,
    );
  }
}

export function validateEventInput(
  input: CreateEventInput,
): void {
  assertNonEmpty(
    input.organizationId,
    "Organization ID",
  );

  assertNonEmpty(
    input.source,
    "Event source",
  );

  validateEventType(input.type);

  if (input.severity !== undefined) {
    validateSeverity(input.severity);
  }

  if (input.timestamp !== undefined) {
    if (
      Number.isNaN(
        Date.parse(input.timestamp),
      )
    ) {
      throw new Error(
        "Invalid event timestamp",
      );
    }
  }
}

export function createAnalyticsEvent(
  input: CreateEventInput,
): AnalyticsEvent {
  validateEventInput(input);

  const timestamp =
    input.timestamp ??
    new Date().toISOString();

  return {
    id: createRandomId(),
    organizationId:
      input.organizationId.trim(),
    type: input.type,
    severity:
      input.severity ?? "info",
    timestamp,
    source: input.source.trim(),
    requestId:
      input.requestId?.trim(),
    userId:
      input.userId?.trim(),
    provider:
      input.provider?.trim(),
    model:
      input.model?.trim(),
    data: {
      ...(input.data ?? {}),
    },
  };
}

export function cloneEvent(
  event: AnalyticsEvent,
): AnalyticsEvent {
  return {
    ...event,
    data: {
      ...event.data,
    },
  };
}