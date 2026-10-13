import { randomBytes } from "node:crypto"

export interface RefreshTokenRecord {
    token: string
    userId: string
    expiresAt: number
}

export class RefreshTokenManager {
    private readonly tokens = new Map<string, RefreshTokenRecord>()

    constructor(private readonly ttlMs = 30 * 24 * 60 * 60 * 1000) {}

    create(userId: string): RefreshTokenRecord {
        const record: RefreshTokenRecord = {
            token: randomBytes(48).toString("hex"),
            userId,
            expiresAt: Date.now() + this.ttlMs
        }

        this.tokens.set(record.token, record)
        return record
    }

    consume(token: string): RefreshTokenRecord | undefined {
        const record = this.tokens.get(token)

        if (!record || record.expiresAt <= Date.now()) {
            this.tokens.delete(token)
            return undefined
        }

        this.tokens.delete(token)
        return record
    }

    revoke(token: string): boolean {
        return this.tokens.delete(token)
    }
}
