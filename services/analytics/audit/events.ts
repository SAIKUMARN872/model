// services/analytics/audit/events.ts

export const AUDIT_EVENT_VERSION = 1 as const;

export type AuditSeverity =
  | "debug"
  | "info"
  | "warning"
  | "error"
  | "critical";

export type AuditOutcome =
  | "success"
  | "failure"
  | "denied"
  | "partial";

export type AuditActorType =
  | "user"
  | "service"
  | "system"
  | "agent"
  | "api_key";

export type AuditEventType =
  | "authentication"
  | "authorization"
  | "data_access"
  | "data_change"
  | "configuration"
  | "security"
  | "model_request"
  | "model_response"
  | "agent_action"
  | "workflow"
  | "billing"
  | "api"
  | "system"
  | "anomaly"
  | "custom";

export interface AuditActor {
  type: AuditActorType;
  id: string;
  name?: string;
  email?: string;
}

export interface AuditResource {
  type: string;
  id?: string;
  name?: string;
}

export interface AuditRequestContext {
  requestId?: string;
  correlationId?: string;
  traceId?: string;
  spanId?: string;
  ipAddress?: string;
  userAgent?: string;
  serviceName?: string;
  serviceVersion?: string;
  environment?: string;
}

export interface AuditEvent {
  id: string;
  version: typeof AUDIT_EVENT_VERSION;

  organizationId: string;

  timestamp: string;

  eventType: AuditEventType;
  action: string;

  severity: AuditSeverity;
  outcome: AuditOutcome;

  actor: AuditActor;

  resource?: AuditResource;

  request?: AuditRequestContext;

  message?: string;

  metadata: Record<string, unknown>;

  previousEventHash?: string;
  eventHash: string;
}

export interface CreateAuditEventInput {
  organizationId: string;

  eventType: AuditEventType;
  action: string;

  severity?: AuditSeverity;
  outcome?: AuditOutcome;

  actor: AuditActor;

  resource?: AuditResource;

  request?: AuditRequestContext;

  message?: string;

  metadata?: Record<string, unknown>;

  timestamp?: Date;
}

export interface AuditQuery {
  organizationId: string;

  eventType?: AuditEventType;
  action?: string;
  severity?: AuditSeverity;
  outcome?: AuditOutcome;

  actorId?: string;
  resourceType?: string;
  resourceId?: string;

  requestId?: string;
  correlationId?: string;

  from?: Date;
  to?: Date;

  limit?: number;
}

export interface AuditLoggerOptions {
  maxEventsPerOrganization?: number;
  defaultQueryLimit?: number;
  maxQueryLimit?: number;

  /**
   * Keys that must never be persisted in audit metadata.
   */
  sensitiveKeys?: string[];
}

export interface AuditLoggerHealth {
  healthy: boolean;
  totalEvents: number;
  organizations: number;
  maxEventsPerOrganization: number;
}