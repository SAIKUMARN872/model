import { loadEnvironment } from "./environment.js"
import {
    createAuthSettings as createSettings,
    defaultAuthSettings,
    validateSettings,
    type AuthEnvironmentName,
    type AuthSettings
} from "./settings.js"

export interface AuthConfig {
    environment: AuthEnvironmentName
    jwt: {
        secret: string
        issuer: string
        audience: string
        expiresInSeconds: number
    }
    session: {
        expiresInSeconds: number
        maxActiveSessionsPerUser: number
    }
    password: {
        minLength: number
        maxLength: number
    }
    mfa: {
        issuer: string
    }
    security: {
        encryptionKey: string
        maxLoginAttempts: number
        lockoutDurationSeconds: number
    }
}

const environments: readonly AuthEnvironmentName[] = [
    "development",
    "test",
    "staging",
    "production"
]

function readPositiveInteger(
    value: string | undefined,
    fallback: number,
    field: string
): number {
    if (value === undefined) {
        return fallback
    }

    const parsed = Number(value)

    if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new Error(`${field} must be a positive integer`)
    }

    return parsed
}

export function loadAuthConfig(
    env: NodeJS.ProcessEnv = process.env
): AuthConfig {
    const environment = loadEnvironment(env).nodeEnv

    if (!environments.includes(environment as AuthEnvironmentName)) {
        throw new Error(`Unsupported authentication environment: ${environment}`)
    }

    const config: AuthConfig = {
        environment: environment as AuthEnvironmentName,
        jwt: {
            secret: env.AUTH_JWT_SECRET ?? "development-secret-change-me",
            issuer: env.AUTH_JWT_ISSUER ?? defaultAuthSettings.jwtIssuer,
            audience: env.AUTH_JWT_AUDIENCE ?? defaultAuthSettings.jwtAudience,
            expiresInSeconds: readPositiveInteger(
                env.AUTH_JWT_EXPIRES_SECONDS,
                defaultAuthSettings.jwtExpiresInSeconds,
                "AUTH_JWT_EXPIRES_SECONDS"
            )
        },
        session: {
            expiresInSeconds: readPositiveInteger(
                env.AUTH_SESSION_EXPIRES_SECONDS,
                defaultAuthSettings.sessionExpiresInSeconds,
                "AUTH_SESSION_EXPIRES_SECONDS"
            ),
            maxActiveSessionsPerUser: readPositiveInteger(
                env.AUTH_MAX_ACTIVE_SESSIONS_PER_USER,
                defaultAuthSettings.maxActiveSessionsPerUser,
                "AUTH_MAX_ACTIVE_SESSIONS_PER_USER"
            )
        },
        password: {
            minLength: readPositiveInteger(
                env.AUTH_PASSWORD_MIN_LENGTH,
                defaultAuthSettings.passwordMinLength,
                "AUTH_PASSWORD_MIN_LENGTH"
            ),
            maxLength: readPositiveInteger(
                env.AUTH_PASSWORD_MAX_LENGTH,
                defaultAuthSettings.passwordMaxLength,
                "AUTH_PASSWORD_MAX_LENGTH"
            )
        },
        mfa: {
            issuer: env.AUTH_MFA_ISSUER ?? defaultAuthSettings.mfaIssuer
        },
        security: {
            encryptionKey:
                env.AUTH_ENCRYPTION_KEY ?? "development-encryption-key-change-me",
            maxLoginAttempts: readPositiveInteger(
                env.AUTH_MAX_LOGIN_ATTEMPTS,
                defaultAuthSettings.maxLoginAttempts,
                "AUTH_MAX_LOGIN_ATTEMPTS"
            ),
            lockoutDurationSeconds: readPositiveInteger(
                env.AUTH_LOCKOUT_DURATION_SECONDS,
                defaultAuthSettings.lockoutDurationSeconds,
                "AUTH_LOCKOUT_DURATION_SECONDS"
            )
        }
    }

    validateAuthConfig(config)
    return config
}

export function validateAuthConfig(config: AuthConfig): true {
    if (!config || !environments.includes(config.environment)) {
        throw new Error("Authentication environment is invalid")
    }

    if (
        typeof config.jwt?.secret !== "string" ||
        config.jwt.secret.length < 16
    ) {
        throw new Error("JWT secret must contain at least 16 characters")
    }

    if (!config.jwt.issuer?.trim() || !config.jwt.audience?.trim()) {
        throw new Error("JWT issuer and audience are required")
    }

    if (
        !Number.isInteger(config.jwt.expiresInSeconds) ||
        config.jwt.expiresInSeconds <= 0
    ) {
        throw new Error("JWT expiration must be a positive integer")
    }

    if (
        !Number.isInteger(config.session?.expiresInSeconds) ||
        config.session.expiresInSeconds <= 0 ||
        !Number.isInteger(config.session.maxActiveSessionsPerUser) ||
        config.session.maxActiveSessionsPerUser <= 0
    ) {
        throw new Error("Session configuration is invalid")
    }

    if (
        !Number.isInteger(config.password?.minLength) ||
        config.password.minLength <= 0 ||
        !Number.isInteger(config.password.maxLength) ||
        config.password.maxLength < config.password.minLength
    ) {
        throw new Error("Password length range is invalid")
    }

    if (!config.mfa?.issuer?.trim()) {
        throw new Error("MFA issuer is required")
    }

    if (
        typeof config.security?.encryptionKey !== "string" ||
        config.security.encryptionKey.length < 16
    ) {
        throw new Error("Encryption key must contain at least 16 characters")
    }

    if (
        !Number.isInteger(config.security.maxLoginAttempts) ||
        config.security.maxLoginAttempts <= 0 ||
        !Number.isInteger(config.security.lockoutDurationSeconds) ||
        config.security.lockoutDurationSeconds <= 0
    ) {
        throw new Error("Login security configuration is invalid")
    }

    return true
}

export function createAuthConfig(): AuthConfig {
    return loadAuthConfig()
}

export function createAuthSettings(config: AuthConfig): AuthSettings {
    validateAuthConfig(config)

    const settings = createSettingsFromConfig(config)

    if (!validateSettings(settings)) {
        throw new Error("Authentication settings are invalid")
    }

    return settings
}

function createSettingsFromConfig(config: AuthConfig): AuthSettings {
    return {
        ...createSettings({
            environment: config.environment,
            jwtIssuer: config.jwt.issuer,
            jwtAudience: config.jwt.audience,
            jwtExpiresInSeconds: config.jwt.expiresInSeconds,
            sessionExpiresInSeconds: config.session.expiresInSeconds,
            maxActiveSessionsPerUser:
                config.session.maxActiveSessionsPerUser,
            passwordMinLength: config.password.minLength,
            passwordMaxLength: config.password.maxLength,
            mfaIssuer: config.mfa.issuer,
            maxLoginAttempts: config.security.maxLoginAttempts,
            lockoutDurationSeconds:
                config.security.lockoutDurationSeconds
        })
    }
}
