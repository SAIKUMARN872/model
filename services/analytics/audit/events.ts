export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "read"
  | "login"
  | "logout"
  | "execute";

export interface AuditEvent {
  id: string;
  actorId: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}
