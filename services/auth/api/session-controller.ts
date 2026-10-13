import type { AuthService } from "../services/auth-service.js"

export class SessionController {
    constructor(private readonly auth: AuthService) {}

    getSession(sessionId: string) {
        return this.auth.sessions.get(sessionId)
    }

    revokeSession(sessionId: string, userId?: string) {
        return {
            success: this.auth.logout(sessionId, userId)
        }
    }

    listSessions(userId: string) {
        return this.auth.sessions.list(userId)
    }
}
