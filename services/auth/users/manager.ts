import { randomUUID } from "node:crypto"
import { UserRepository } from "./repository.js"
import { UserValidator } from "./validator.js"
import type { PublicUser, UpdateUserInput, User } from "./user.js"
import { toPublicUser } from "./user.js"

export interface CreateUserInput {
    email: string
    passwordHash: string
    name?: string
    roles?: string[]
    permissions?: string[]
    active?: boolean
    mfaEnabled?: boolean
    status?: "active" | "inactive" | "suspended"
    metadata?: Record<string, unknown>
}

export class UserManager {
    constructor(
        private readonly repository = new UserRepository(),
        private readonly validator = new UserValidator()
    ) {}

    create(input: CreateUserInput): PublicUser {
        const user: User = {
            id: randomUUID(),
            email: input.email.toLowerCase(),
            passwordHash: input.passwordHash,
            name: input.name,
            roles: input.roles ?? ["user"],
            permissions: input.permissions ?? [],
            active: input.active ?? true,
            mfaEnabled: input.mfaEnabled ?? false,
            status: input.status ?? "active",
            metadata: { ...(input.metadata ?? {}) },
            createdAt: new Date(),
            updatedAt: new Date()
        }

        const result = this.validator.validate(user)

        if (!result.valid) {
            throw new Error(result.errors.join(", "))
        }

        if (this.repository.findByEmail(user.email)) {
            throw new Error("Email already registered")
        }

        return toPublicUser(this.repository.create(user))
    }

    findById(id: string): PublicUser | undefined {
        const user = this.repository.findById(id)
        return user ? toPublicUser(user) : undefined
    }

    findByEmail(email: string): PublicUser | undefined {
        const user = this.repository.findByEmail(email)
        return user ? toPublicUser(user) : undefined
    }

    getInternalById(id: string): User | undefined {
        return this.repository.findById(id)
    }

    getInternalByEmail(email: string): User | undefined {
        return this.repository.findByEmail(email)
    }

    update(id: string, patch: UpdateUserInput): PublicUser {
        const current = this.repository.findById(id)

        if (!current) {
            throw new Error("User not found")
        }

        const updated = this.repository.update(id, {
            ...patch,
            email: patch.email?.toLowerCase(),
            metadata: patch.metadata
                ? { ...(current.metadata ?? {}), ...patch.metadata }
                : current.metadata,
            updatedAt: new Date()
        })

        return toPublicUser(updated)
    }

    delete(id: string): boolean {
        return this.repository.delete(id)
    }

    list(): PublicUser[] {
        return this.repository.list().map(toPublicUser)
    }
}

export const userService = new UserManager()
