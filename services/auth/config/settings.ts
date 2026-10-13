export interface AuthSettings {
    passwordMinLength: number
    accessTokenTtlSeconds: number
    sessionTtlMs: number
    mfaEnabled: boolean
}

export const defaultAuthSettings: AuthSettings = {
    passwordMinLength: 8,
    accessTokenTtlSeconds: 3600,
    sessionTtlMs: 86400000,
    mfaEnabled: true
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
        settings.passwordMinLength >= 1 &&
        settings.accessTokenTtlSeconds > 0 &&
        settings.sessionTtlMs > 0
    )
}
