import { loadEnvironment } from "./environment.js"
import {
    createAuthSettings,
    defaultAuthSettings,
    validateSettings,
    type AuthSettings
} from "./settings.js"

export interface AuthConfig {
    environment: ReturnType<typeof loadEnvironment>
    settings: AuthSettings
}

export function loadAuthConfig(
    env: NodeJS.ProcessEnv = process.env
): AuthConfig {
    const environment = loadEnvironment(env)

    return {
        environment,
        settings: createAuthSettings({
            accessTokenTtlSeconds: environment.jwtExpiresInSeconds,
            sessionTtlMs: environment.sessionTtlMs
        })
    }
}

export function validateAuthConfig(config: AuthConfig): boolean {
    return (
        Boolean(config.environment.jwtSecret) &&
        Boolean(config.environment.jwtIssuer) &&
        validateSettings(config.settings)
    )
}

export function createAuthConfig(): AuthConfig {
    return loadAuthConfig()
}

export {
    createAuthSettings,
    defaultAuthSettings,
    validateSettings
}
