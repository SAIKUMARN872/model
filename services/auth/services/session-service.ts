import type { SessionManager } from "../sessions/manager.js"
import type { TokenManager } from "../tokens/manager.js"
import type { AuthAuditLogger } from "../audit/logger.js"

export class SessionService {
    constructor(
        private readonly sessions: SessionManager,
        private readonly tokens: TokenManager,
        private readonly audit: AuthAuditLogger
    ) {}

    validate(sessionToken: string) {
        return this.sessions.authenticate(sessionToken)
    }

    revoke(sessionId: string, userId?: string): boolean {
        const session = this.sessions.get(sessionId)

        if (!session || (userId && session.userId !== userId)) {
            return false
        }

        const revoked = this.sessions.revoke(sessionId)

        if (revoked) {
            this.audit.log("session.revoked", {
                userId: session.userId,
                metadata: { sessionId }
            })
        }

        return revoked
    }

    revokeAll(userId: string): number {
        return this.sessions.revokeAll(userId)
    }

    issueRefreshToken(userId: string) {
        return this.tokens.issueRefreshToken(userId)
    }
}
