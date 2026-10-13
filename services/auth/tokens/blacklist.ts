export class TokenBlacklist {
    private readonly tokens = new Map<string, number>()

    add(token: string, expiresAt: number): void {
        this.tokens.set(token, expiresAt)
    }

    has(token: string): boolean {
        const expiresAt = this.tokens.get(token)

        if (expiresAt === undefined) {
            return false
        }

        if (expiresAt <= Date.now()) {
            this.tokens.delete(token)
            return false
        }

        return true
    }

    remove(token: string): boolean {
        return this.tokens.delete(token)
    }

    clearExpired(): void {
        const now = Date.now()

        for (const [token, expiresAt] of this.tokens) {
            if (expiresAt <= now) {
                this.tokens.delete(token)
            }
        }
    }
}
