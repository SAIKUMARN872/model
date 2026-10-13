export interface SessionSchema {
    sessionId: string
    userId: string
}

export function validateSessionSchema(input: unknown): input is SessionSchema {
    if (!input || typeof input !== "object") {
        return false
    }

    const value = input as Record<string, unknown>

    return typeof value.sessionId === "string" &&
        typeof value.userId === "string"
}
