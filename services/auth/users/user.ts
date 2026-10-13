export interface User {
    id: string
    email: string
    passwordHash: string
    name?: string
    roles: string[]
    permissions: string[]
    active: boolean
    mfaEnabled: boolean
    createdAt: Date
    updatedAt: Date

    status?: "active" | "inactive" | "suspended"
    metadata?: Record<string, unknown>
    lastLoginAt?: Date
}

export interface UpdateUserInput {
    email?: string
    name?: string
    roles?: string[]
    permissions?: string[]
    active?: boolean
    mfaEnabled?: boolean
    status?: "active" | "inactive" | "suspended"
    metadata?: Record<string, unknown>
}

export type PublicUser = Omit<User, "passwordHash">

export function toPublicUser(user: User): PublicUser {
    const { passwordHash: _, ...publicUser } = user
    return {
        ...publicUser,
        status: publicUser.status ?? (publicUser.active ? "active" : "inactive"),
        metadata: { ...(publicUser.metadata ?? {}) }
    }
}
