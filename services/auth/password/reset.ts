import { randomBytes } from "node:crypto"

interface ResetToken {
    userId: string
    expiresAt: number
}

export class PasswordResetManager {
    private readonly tokens = new Map<string, ResetToken>()

    constructor(private readonly ttlMs = 15 * 60 * 1000) {}

    createToken(userId: string): string {
        const token = randomBytes(32).toString("hex")

        this.tokens.set(token, {
            userId,
            expiresAt: Date.now() + this.ttlMs
        })

        return token
    }

    consumeToken(token: string): string | undefined {
        const record = this.tokens.get(token)

        if (!record) {
            return undefined
        }

        this.tokens.delete(token)

        if (record.expiresAt < Date.now()) {
            return undefined
        }

        return record.userId
    }
}
