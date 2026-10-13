import { randomUUID } from "node:crypto"
import { hashPassword } from "../password/hashing.js"
import { PasswordValidator } from "../password/validator.js"
import { UserManager } from "../users/manager.js"
import { LoginService, type LoginInput, type LoginResult } from "./login-service.js"
import { SessionManager } from "../sessions/manager.js"
import { TokenManager } from "../tokens/manager.js"
import { Jwt } from "../jwt/jwt.js"
import { AuthAuditLogger } from "../audit/logger.js"
import { MfaManager } from "../mfa/mfa.js"
import { SessionService } from "./session-service.js"
import type { PublicUser } from "../users/user.js"

export class AuthService {
    readonly users: UserManager
    readonly sessions: SessionManager
    readonly tokens: TokenManager
    readonly audit: AuthAuditLogger
    readonly mfa: MfaManager
    readonly loginService: LoginService
    readonly sessionService: SessionService

    private readonly passwordValidator: PasswordValidator
    private readonly jwt: Jwt

    constructor(options: {
        jwtSecret?: string
        jwtIssuer?: string
        jwtExpiresInSeconds?: number
    } = {}) {
        this.users = new UserManager()
        this.sessions = new SessionManager()
        this.tokens = new TokenManager()
        this.audit = new AuthAuditLogger()
        this.mfa = new MfaManager()
        this.passwordValidator = new PasswordValidator()
        this.jwt = new Jwt({
            secret: options.jwtSecret ?? "development-secret",
            issuer: options.jwtIssuer ?? "modelnow-auth",
            expiresInSeconds: options.jwtExpiresInSeconds ?? 3600
        })

        this.loginService = new LoginService(
            this.users,
            this.sessions,
            this.tokens,
            this.jwt,
            this.audit,
            this.mfa
        )

        this.sessionService = new SessionService(
            this.sessions,
            this.tokens,
            this.audit
        )
    }

    register(
        email: string,
        password: string,
        name?: string
    ): PublicUser {
        const validation = this.passwordValidator.validate(password)

        if (!validation.valid) {
            throw new Error(validation.errors.join(", "))
        }

        const user = this.users.create({
            email,
            passwordHash: hashPassword(password),
            name
        })

        this.audit.log("user.created", {
            userId: user.id,
            email: user.email,
            metadata: {}
        })

        return user
    }

    login(input: LoginInput): LoginResult {
        return this.loginService.login(input)
    }

    logout(sessionId: string, userId?: string): boolean {
        return this.sessionService.revoke(sessionId, userId)
    }

    verifyAccessToken(token: string) {
        return this.jwt.verify(token)
    }

    createMfaEnrollment(userId: string) {
        const record = this.mfa.enroll(userId)

        this.users.update(userId, {
            mfaEnabled: true
        })

        return record
    }

    disableMfa(userId: string): boolean {
        const removed = this.mfa.remove(userId)

        if (removed) {
            this.users.update(userId, {
                mfaEnabled: false
            })
        }

        return removed
    }

    generateRequestId(): string {
        return randomUUID()
    }
}
