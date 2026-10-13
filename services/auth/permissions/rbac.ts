import type { Permission } from "./permission.js"

export class Rbac {
    private readonly roles = new Map<string, Set<Permission>>()

    constructor() {
        this.roles.set("user", new Set(["auth:read", "sessions:read"]))
        this.roles.set("admin", new Set([
            "auth:read",
            "auth:write",
            "users:read",
            "users:write",
            "sessions:read",
            "sessions:write",
            "admin:all"
        ]))
    }

    defineRole(role: string, permissions: Permission[]): void {
        this.roles.set(role, new Set(permissions))
    }

    getPermissions(roles: string[]): Permission[] {
        const result = new Set<Permission>()

        for (const role of roles) {
            for (const permission of this.roles.get(role) ?? []) {
                result.add(permission)
            }
        }

        return [...result]
    }

    can(roles: string[], permission: Permission): boolean {
        return this.getPermissions(roles).includes(permission) ||
            this.getPermissions(roles).includes("admin:all")
    }
}
