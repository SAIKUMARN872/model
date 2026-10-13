import type { User } from "./user.js"

export class UserRepository {
    private readonly users = new Map<string, User>()

    create(user: User): User {
        if (this.users.has(user.id)) {
            throw new Error("User already exists")
        }

        this.users.set(user.id, user)
        return user
    }

    findById(id: string): User | undefined {
        return this.users.get(id)
    }

    findByEmail(email: string): User | undefined {
        const normalized = email.toLowerCase()
        return [...this.users.values()].find((user) => user.email.toLowerCase() === normalized)
    }

    update(id: string, patch: Partial<User>): User {
        const existing = this.users.get(id)

        if (!existing) {
            throw new Error("User not found")
        }

        const updated = {
            ...existing,
            ...patch,
            id: existing.id,
            updatedAt: new Date()
        }

        this.users.set(id, updated)
        return updated
    }

    delete(id: string): boolean {
        return this.users.delete(id)
    }

    list(): User[] {
        return [...this.users.values()]
    }
}
