import { randomBytes, randomUUID } from "node:crypto"
import { SessionStorage } from "./storage.js"
import type { Session } from "./session.js"

export class SessionManager {
    constructor(
        private readonly storage = new SessionStorage(),
        private readonly ttlMs = 24 * 60 * 60 * 1000
    ) {}

    create(userId: string, metadata: Record<string, string> = {}): Session {
        const now = new Date()

        const session: Session = {
            id: randomUUID(),
            userId,
            token: randomBytes(32).toString("hex"),
            createdAt: now,
            expiresAt: new Date(now.getTime() + this.ttlMs),
            lastAccessedAt: now,
            revoked: false,
            metadata
        }

        return this.storage.save(session)
    }

    get(id: string): Session | undefined {
        return this.storage.get(id)
    }

    authenticate(token: string): Session | undefined {
        const session = this.storage.listAll().find((candidate) => candidate.token === token)

        if (!session || session.revoked || session.expiresAt.getTime() <= Date.now()) {
            return undefined
        }

        session.lastAccessedAt = new Date()
        return session
    }

    revoke(id: string): boolean {
        const session = this.storage.get(id)

        if (!session) {
            return false
        }

        session.revoked = true
        return true
    }

    revokeAll(userId: string): number {
        let count = 0

        for (const session of this.storage.listByUser(userId)) {
            if (!session.revoked) {
                session.revoked = true
                count++
            }
        }

        return count
    }

    list(userId: string): Session[] {
        return this.storage.listByUser(userId)
    }
}

