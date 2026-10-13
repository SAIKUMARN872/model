import type { Role } from "./role.js"

export class RolePolicy {
    canAssign(role: Role, permission: string): boolean {
        return role.permissions.includes("admin:all") || role.permissions.includes(permission)
    }

    requiresAdmin(role: Role): boolean {
        return role.permissions.includes("admin:all")
    }
}
