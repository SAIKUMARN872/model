import type { Session } from "../sessions/session.js"

export class SessionRepository {
    private readonly sessions = new Map<string, Session>()

    create(session: Session): Session {
        this.sessions.set(session.id, session)
        return session
    }

    findById(id: string): Session | undefined {
        return this.sessions.get(id)
    }

    update(id: string, patch: Partial<Session>): Session {
        const current = this.sessions.get(id)

        if (!current) {
            throw new Error("Session not found")
        }

        const updated = { ...current, ...patch, id: current.id }
        this.sessions.set(id, updated)
        return updated
    }

    delete(id: string): boolean {
        return this.sessions.delete(id)
    }

    findByUserId(userId: string): Session[] {
        return [...this.sessions.values()].filter((session) => session.userId === userId)
    }
}
