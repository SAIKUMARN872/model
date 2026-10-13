import type { Permission } from "./permission.js"

export class PermissionChecker {
    has(permissions: Permission[], required: Permission): boolean {
        return permissions.includes("admin:all") || permissions.includes(required)
    }

    hasAny(permissions: Permission[], required: Permission[]): boolean {
        return required.some((permission) => this.has(permissions, permission))
    }

    hasAll(permissions: Permission[], required: Permission[]): boolean {
        return required.every((permission) => this.has(permissions, permission))
    }
}
