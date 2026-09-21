export type AuditAction =
  | "created"
  | "updated"
  | "deleted"
  | "executed"
  | "approved"
  | "rejected"
  | "failed"
  | "login"
  | "logout"
  | "model_selected"
  | "model_routed"
  | "model_fallback"
  | "anomaly_detected"
  | "configuration_changed";

export type AuditResource =
  | "model"
  | "model_route"
  | "workflow"
  | "agent"
  | "dataset"
  | "fine_tuning_job"
  | "anomaly"
  | "organization"
  | "workspace"
  | "user"
  | "api_key"
  | "policy"
  | "configuration"
  | "system";

export type AuditOutcome = "success" | "failure" | "denied";

export interface AuditEvent {
  id: string;

  organizationId?: string;
  workspaceId?: string;
  userId?: string;

  action: AuditAction;
  resource: AuditResource;

  resourceId?: string;

  outcome: AuditOutcome;

  timestamp: Date;

  ipAddress?: string;
  userAgent?: string;
  requestId?: string;

  source?: string;

  changes?: Record<string, unknown>;

  metadata?: Record<string, unknown>;
}

export function createAuditEvent(
  input: Omit<AuditEvent, "id" | "timestamp">
): AuditEvent {
  return {
    ...input,
    id: generateAuditId(),
    timestamp: new Date(),
  };
}

function generateAuditId(): string {
  return `audit_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}