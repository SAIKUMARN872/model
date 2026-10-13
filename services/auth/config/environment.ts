export interface AuthEnvironment {
    nodeEnv: string
    jwtSecret: string
    jwtIssuer: string
    jwtExpiresInSeconds: number
    sessionTtlMs: number
}

export function loadEnvironment(
    env: NodeJS.ProcessEnv = process.env
): AuthEnvironment {
    return {
        nodeEnv: env.NODE_ENV ?? "development",
        jwtSecret: env.AUTH_JWT_SECRET ?? "development-secret",
        jwtIssuer: env.AUTH_JWT_ISSUER ?? "modelnow-auth",
        jwtExpiresInSeconds: Number(
            env.AUTH_JWT_EXPIRES_SECONDS ?? 3600
        ),
        sessionTtlMs: Number(
            env.AUTH_SESSION_TTL_MS ?? 86400000
        )
    }
}
