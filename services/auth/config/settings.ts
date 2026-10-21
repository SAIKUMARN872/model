export type AuthEnvironmentName =
    | "development"
    | "test"
    | "staging"
    | "production"

export interface AuthSettings {
    environment: AuthEnvironmentName
    jwtIssuer: string
    jwtAudience: string
    jwtExpiresInSeconds: number
    sessionExpiresInSeconds: number
    maxActiveSessionsPerUser: number
    passwordMinLength: number
    passwordMaxLength: number
    mfaIssuer: string
    maxLoginAttempts: number
    lockoutDurationSeconds: number
}

export const defaultAuthSettings: AuthSettings = {
    environment: "development",
    jwtIssuer: "modelnow-auth",
    jwtAudience: "modelnow",
    jwtExpiresInSeconds: 3600,
    sessionExpiresInSeconds: 86400,
    maxActiveSessionsPerUser: 10,
    passwordMinLength: 8,
    passwordMaxLength: 128,
    mfaIssuer: "ModelNow",
    maxLoginAttempts: 5,
    lockoutDurationSeconds: 900
}

export function createAuthSettings(
    overrides: Partial<AuthSettings> = {}
): AuthSettings {
    return {
        ...defaultAuthSettings,
        ...overrides
    }
}

export function validateSettings(settings: AuthSettings): boolean {
    return (
        settings.environment.length > 0 &&
        settings.jwtIssuer.trim().length > 0 &&
        settings.jwtAudience.trim().length > 0 &&
        Number.isInteger(settings.jwtExpiresInSeconds) &&
        settings.jwtExpiresInSeconds > 0 &&
        Number.isInteger(settings.sessionExpiresInSeconds) &&
        settings.sessionExpiresInSeconds > 0 &&
        Number.isInteger(settings.maxActiveSessionsPerUser) &&
        settings.maxActiveSessionsPerUser > 0 &&
        Number.isInteger(settings.passwordMinLength) &&
        settings.passwordMinLength > 0 &&
        Number.isInteger(settings.passwordMaxLength) &&
        settings.passwordMaxLength >= settings.passwordMinLength &&
        settings.mfaIssuer.trim().length > 0 &&
        Number.isInteger(settings.maxLoginAttempts) &&
        settings.maxLoginAttempts > 0 &&
        Number.isInteger(settings.lockoutDurationSeconds) &&
        settings.lockoutDurationSeconds > 0
    )
}
