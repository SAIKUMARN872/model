import type { Session } from "./session.js"

export class SessionStorage {
    private readonly sessions = new Map<string, Session>()

    save(session: Session): Session {
        this.sessions.set(session.id, session)
        return session
    }

    get(id: string): Session | undefined {
        return this.sessions.get(id)
    }

    remove(id: string): boolean {
        return this.sessions.delete(id)
    }

    listByUser(userId: string): Session[] {
        return [...this.sessions.values()].filter((session) => session.userId === userId)
    }

    listAll(): Session[] {
        return [...this.sessions.values()]
    }

    clear(): void {
        this.sessions.clear()
    }
}

