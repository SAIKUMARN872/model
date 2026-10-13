import { createHmac } from "node:crypto"

export interface JwtPayload {
    sub: string
    iat: number
    exp: number
    roles?: string[]
    permissions?: string[]
    iss?: string
    [key: string]: unknown
}

export interface JwtOptions {
    secret: string
    issuer?: string
    expiresInSeconds?: number
}

function encodePart(value: unknown): string {
    return Buffer.from(JSON.stringify(value), "utf8")
        .toString("base64url")
}

function decodePart<T>(value: string): T {
    return JSON.parse(
        Buffer.from(value, "base64url").toString("utf8")
    ) as T
}

export class Jwt {
    constructor(private readonly options: JwtOptions) {
        if (!options.secret) {
            throw new Error("JWT secret is required")
        }
    }

    sign(
        payload: Omit<JwtPayload, "iat" | "exp"> &
            Partial<Pick<JwtPayload, "iat" | "exp">>
    ): string {
        const now = Math.floor(Date.now() / 1000)

        const header = {
            alg: "HS256",
            typ: "JWT"
        }

        const body: Record<string, unknown> = {
            ...payload,
            iat: payload.iat ?? now,
            exp:
                payload.exp ??
                now + (this.options.expiresInSeconds ?? 3600)
        }

        const issuer = this.options.issuer

        if (issuer) {
            body.iss = issuer
        }

        const encodedHeader = encodePart(header)
        const encodedBody = encodePart(body)
        const input = `${encodedHeader}.${encodedBody}`

        const signature = createHmac(
            "sha256",
            this.options.secret
        )
            .update(input)
            .digest("base64url")

        return `${input}.${signature}`
    }

    verify(token: string): JwtPayload {
        const parts = token.split(".")

        if (parts.length !== 3) {
            throw new Error("Invalid JWT")
        }

        const [header, body, signature] = parts
        void header

        const input = `${header}.${body}`

        const expected = createHmac(
            "sha256",
            this.options.secret
        )
            .update(input)
            .digest("base64url")

        if (signature !== expected) {
            throw new Error("Invalid JWT signature")
        }

        const payload = decodePart<JwtPayload>(body)
        const now = Math.floor(Date.now() / 1000)

        if (typeof payload.sub !== "string" || !payload.sub) {
            throw new Error("JWT subject is required")
        }

        if (payload.exp <= now) {
            throw new Error("JWT expired")
        }

        if (
            this.options.issuer &&
            payload.iss !== this.options.issuer
        ) {
            throw new Error("Invalid JWT issuer")
        }

        return payload
    }

    decode(token: string): JwtPayload {
        const parts = token.split(".")

        if (parts.length !== 3) {
            throw new Error("Invalid JWT")
        }

        return decodePart<JwtPayload>(parts[1])
    }
}

