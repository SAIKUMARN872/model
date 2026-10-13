import { Jwt } from "../jwt/jwt.js"
import { verifyPassword } from "../password/hashing.js"
import type { UserManager } from "../users/manager.js"
import type { SessionManager } from "../sessions/manager.js"
import type { TokenManager } from "../tokens/manager.js"
import type { AuthAuditLogger } from "../audit/logger.js"
import type { MfaManager } from "../mfa/mfa.js"

export interface LoginInput {
    email: string
    password: string
    mfaCode?: string
}

export interface LoginResult {
    accessToken: string
    sessionId: string
    userId: string
}

export class LoginService {
    constructor(
        private readonly users: UserManager,
        private readonly sessions: SessionManager,
        private readonly tokens: TokenManager,
        private readonly jwt: Jwt,
        private readonly audit: AuthAuditLogger,
        private readonly mfa?: MfaManager
    ) {}

    login(input: LoginInput): LoginResult {
        const user = this.users.getInternalByEmail(input.email)

        if (!user || !user.active || !verifyPassword(input.password, user.passwordHash)) {
            this.audit.log("login.failure", {
                email: input.email,
                metadata: { reason: "invalid_credentials" }
            })

            throw new Error("Invalid credentials")
        }

        if (user.mfaEnabled) {
            if (!this.mfa || !input.mfaCode || !this.mfa.verify(user.id, input.mfaCode)) {
                this.audit.log("mfa.failure", {
                    userId: user.id,
                    email: user.email,
                    metadata: {}
                })

                throw new Error("MFA verification required")
            }

            this.audit.log("mfa.success", {
                userId: user.id,
                email: user.email,
                metadata: {}
            })
        }

        const session = this.sessions.create(user.id)

        const accessToken = this.jwt.sign({
            sub: user.id,
            roles: user.roles,
            permissions: user.permissions
        })

        this.audit.log("login.success", {
            userId: user.id,
            email: user.email,
            metadata: {}
        })

        this.audit.log("session.created", {
            userId: user.id,
            email: user.email,
            metadata: { sessionId: session.id }
        })

        return {
            accessToken,
            sessionId: session.id,
            userId: user.id
        }
    }
}
