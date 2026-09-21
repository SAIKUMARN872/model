import {
  AuditEvent,
  AuditOutcome,
  AuditAction,
  AuditResource,
  createAuditEvent,
} from "./events";

export interface AuditLoggerOptions {
  source?: string;
  maxEvents?: number;
}

export interface AuditQuery {
  organizationId?: string;
  workspaceId?: string;
  userId?: string;
  action?: AuditAction;
  resource?: AuditResource;
  resourceId?: string;
  outcome?: AuditOutcome;
  from?: Date;
  to?: Date;
  limit?: number;
}

export class AuditLogger {
  private readonly events: AuditEvent[] = [];
  private readonly maxEvents: number;
  private readonly source?: string;

  constructor(options: AuditLoggerOptions = {}) {
    this.maxEvents = options.maxEvents ?? 100_000;
    this.source = options.source ?? "modelnow-analytics";
  }

  log(
    event: Omit<AuditEvent, "id" | "timestamp" | "source">
  ): AuditEvent {
    const auditEvent = createAuditEvent({
      ...event,
      source: this.source,
    });

    this.events.push(auditEvent);

    this.enforceRetention();

    return auditEvent;
  }

  success(
    event: Omit<AuditEvent, "id" | "timestamp" | "outcome" | "source">
  ): AuditEvent {
    return this.log({
      ...event,
      outcome: "success",
    });
  }

  failure(
    event: Omit<AuditEvent, "id" | "timestamp" | "outcome" | "source">
  ): AuditEvent {
    return this.log({
      ...event,
      outcome: "failure",
    });
  }

  denied(
    event: Omit<AuditEvent, "id" | "timestamp" | "outcome" | "source">
  ): AuditEvent {
    return this.log({
      ...event,
      outcome: "denied",
    });
  }

  query(query: AuditQuery = {}): AuditEvent[] {
    const limit = query.limit ?? 100;

    return this.events
      .filter((event) => {
        if (
          query.organizationId &&
          event.organizationId !== query.organizationId
        ) {
          return false;
        }

        if (
          query.workspaceId &&
          event.workspaceId !== query.workspaceId
        ) {
          return false;
        }

        if (query.userId && event.userId !== query.userId) {
          return false;
        }

        if (query.action && event.action !== query.action) {
          return false;
        }

        if (query.resource && event.resource !== query.resource) {
          return false;
        }

        if (
          query.resourceId &&
          event.resourceId !== query.resourceId
        ) {
          return false;
        }

        if (query.outcome && event.outcome !== query.outcome) {
          return false;
        }

        if (query.from && event.timestamp < query.from) {
          return false;
        }

        if (query.to && event.timestamp > query.to) {
          return false;
        }

        return true;
      })
      .sort(
        (a, b) =>
          b.timestamp.getTime() - a.timestamp.getTime()
      )
      .slice(0, limit);
  }

  getById(id: string): AuditEvent | undefined {
    return this.events.find((event) => event.id === id);
  }

  count(query: AuditQuery = {}): number {
    return this.query({
      ...query,
      limit: Number.MAX_SAFE_INTEGER,
    }).length;
  }

  clear(): void {
    this.events.length = 0;
  }

  private enforceRetention(): void {
    const overflow = this.events.length - this.maxEvents;

    if (overflow > 0) {
      this.events.splice(0, overflow);
    }
  }
}