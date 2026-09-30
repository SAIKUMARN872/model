export type AuditEventType =
  | "login"
  | "logout"
  | "create"
  | "read"
  | "update"
  | "delete"
  | "access_denied"
  | "authentication_failed"
  | "other";

export type AuditSeverity =
  | "info"
  | "warning"
  | "error"
  | "critical";

export interface AuditEvent {
  id: string;
  userId?: string;
  organizationId?: string;
  action: AuditEventType;
  severity: AuditSeverity;
  resource?: string;
  resourceId?: string;
  message?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export interface CreateAuditEventInput {
  userId?: string;
  organizationId?: string;
  action: AuditEventType;
  severity?: AuditSeverity;
  resource?: string;
  resourceId?: string;
  message?: string;
  metadata?: Record<string, unknown>;
  success?: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditEventManager {
  private readonly events = new Map<string, AuditEvent>();

  create(input: CreateAuditEventInput): AuditEvent {
    const event: AuditEvent = {
      id: crypto.randomUUID(),
      userId: input.userId,
      organizationId: input.organizationId,
      action: input.action,
      severity: input.severity ?? "info",
      resource: input.resource,
      resourceId: input.resourceId,
      message: input.message,
      metadata: input.metadata ? { ...input.metadata } : undefined,
      timestamp: new Date(),
      success: input.success ?? true,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    };

    this.events.set(event.id, event);

    return this.clone(event);
  }

  getById(id: string): AuditEvent | undefined {
    const event = this.events.get(id);
    return event ? this.clone(event) : undefined;
  }

  getAll(): AuditEvent[] {
    return Array.from(this.events.values()).map((event) =>
      this.clone(event),
    );
  }

  getByUser(userId: string): AuditEvent[] {
    return this.getAll().filter(
      (event) => event.userId === userId,
    );
  }

  getByOrganization(organizationId: string): AuditEvent[] {
    return this.getAll().filter(
      (event) => event.organizationId === organizationId,
    );
  }

  getByAction(action: AuditEventType): AuditEvent[] {
    return this.getAll().filter(
      (event) => event.action === action,
    );
  }

  getFailedEvents(): AuditEvent[] {
    return this.getAll().filter(
      (event) => event.success === false,
    );
  }

  count(): number {
    return this.events.size;
  }

  delete(id: string): boolean {
    return this.events.delete(id);
  }

  clear(): void {
    this.events.clear();
  }

  private clone(event: AuditEvent): AuditEvent {
    return {
      ...event,
      timestamp: new Date(event.timestamp),
      metadata: event.metadata ? { ...event.metadata } : undefined,
    };
  }
}

export const auditEventManager = new AuditEventManager();
