import type { User } from "../users/user.js"
import { UserRepository } from "../users/repository.js"

export class AuthRepository {
    constructor(
        private readonly users = new UserRepository()
    ) {}

    createUser(user: User): User {
        return this.users.create(user)
    }

    findUserById(id: string): User | undefined {
        return this.users.findById(id)
    }

    findUserByEmail(email: string): User | undefined {
        return this.users.findByEmail(email)
    }

    updateUser(id: string, patch: Partial<User>): User {
        return this.users.update(id, patch)
    }

    deleteUser(id: string): boolean {
        return this.users.delete(id)
    }

    listUsers(): User[] {
        return this.users.list()
    }
}

export class AccountRepository extends AuthRepository {}

export interface ProfileRecord {
    id: string
    userId: string
    bio?: string
    avatarUrl?: string
    metadata: Record<string, unknown>
    createdAt: Date
    updatedAt: Date
}

export class ProfileRepository {
    private readonly profiles = new Map<string, ProfileRecord>()

    create(profile: ProfileRecord): ProfileRecord {
        if (this.profiles.has(profile.id)) {
            throw new Error("Profile already exists")
        }

        this.profiles.set(profile.id, profile)
        return profile
    }

    findById(id: string): ProfileRecord | undefined {
        return this.profiles.get(id)
    }

    findByUserId(userId: string): ProfileRecord | undefined {
        return [...this.profiles.values()]
            .find((profile) => profile.userId === userId)
    }

    update(
        id: string,
        patch: Partial<ProfileRecord>
    ): ProfileRecord {
        const current = this.profiles.get(id)

        if (!current) {
            throw new Error("Profile not found")
        }

        const updated: ProfileRecord = {
            ...current,
            ...patch,
            id: current.id,
            updatedAt: new Date()
        }

        this.profiles.set(id, updated)
        return updated
    }

    delete(id: string): boolean {
        return this.profiles.delete(id)
    }

    list(): ProfileRecord[] {
        return [...this.profiles.values()]
    }
}
