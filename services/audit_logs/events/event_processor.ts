export type AuditEventType =
  | "created"
  | "updated"
  | "deleted"
  | "accessed"
  | "authenticated"
  | "authorized"
  | "failed"
  | "revoked"
  | "custom";

export type AuditSeverity =
  | "info"
  | "warning"
  | "error"
  | "critical";

export interface AuditEvent {
  id: string;
  type: AuditEventType;
  severity: AuditSeverity;
  action: string;
  resource: string;
  resourceId?: string;
  actorId?: string;
  organizationId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface AuditEventFilter {
  type?: AuditEventType;
  severity?: AuditSeverity;
  action?: string;
  resource?: string;
  resourceId?: string;
  actorId?: string;
  organizationId?: string;
  from?: string;
  to?: string;
}

export class AuditEventProcessor {
  private readonly events: AuditEvent[] = [];

  process(event: AuditEvent): AuditEvent {
    const storedEvent: AuditEvent = {
      ...event,
      metadata: event.metadata
        ? { ...event.metadata }
        : undefined,
    };

    this.events.push(storedEvent);

    return storedEvent;
  }

  processMany(events: AuditEvent[]): AuditEvent[] {
    return events.map((event) => this.process(event));
  }

  getById(id: string): AuditEvent | undefined {
    return this.events.find(
      (event) => event.id === id,
    );
  }

  find(filter: AuditEventFilter = {}): AuditEvent[] {
    return this.events.filter((event) => {
      if (
        filter.type !== undefined &&
        event.type !== filter.type
      ) {
        return false;
      }

      if (
        filter.severity !== undefined &&
        event.severity !== filter.severity
      ) {
        return false;
      }

      if (
        filter.action !== undefined &&
        event.action !== filter.action
      ) {
        return false;
      }

      if (
        filter.resource !== undefined &&
        event.resource !== filter.resource
      ) {
        return false;
      }

      if (
        filter.resourceId !== undefined &&
        event.resourceId !== filter.resourceId
      ) {
        return false;
      }

      if (
        filter.actorId !== undefined &&
        event.actorId !== filter.actorId
      ) {
        return false;
      }

      if (
        filter.organizationId !== undefined &&
        event.organizationId !== filter.organizationId
      ) {
        return false;
      }

      if (
        filter.from !== undefined &&
        event.timestamp < filter.from
      ) {
        return false;
      }

      if (
        filter.to !== undefined &&
        event.timestamp > filter.to
      ) {
        return false;
      }

      return true;
    });
  }

  all(): AuditEvent[] {
    return [...this.events];
  }

  count(): number {
    return this.events.length;
  }

  clear(): void {
    this.events.length = 0;
  }

  health(): {
    healthy: boolean;
    eventCount: number;
    timestamp: string;
  } {
    return {
      healthy: true,
      eventCount: this.events.length,
      timestamp: new Date().toISOString(),
    };
  }
}

export const auditEventProcessor =
  new AuditEventProcessor();