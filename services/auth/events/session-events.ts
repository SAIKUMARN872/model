export type SessionEventType =
    | "session.created"
    | "session.refreshed"
    | "session.revoked"

export interface SessionEvent {
    type: SessionEventType
    sessionId: string
    userId: string
    timestamp: Date
}
