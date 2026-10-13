export type AuthAuditEventType =
    | "login.success"
    | "login.failure"
    | "logout"
    | "password.reset"
    | "mfa.success"
    | "mfa.failure"
    | "user.created"
    | "session.created"
    | "session.revoked"

export interface AuthAuditEvent {
    id: string
    type: AuthAuditEventType
    userId?: string
    email?: string
    timestamp: Date
    metadata: Record<string, unknown>
}
