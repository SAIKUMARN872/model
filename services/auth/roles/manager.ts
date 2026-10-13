import type { Role } from "./role.js"

export class RoleManager {
    private readonly roles = new Map<string, Role>()

    create(role: Role): Role {
        if (this.roles.has(role.name)) {
            throw new Error("Role already exists")
        }

        this.roles.set(role.name, role)
        return role
    }

    get(name: string): Role | undefined {
        return this.roles.get(name)
    }

    update(name: string, patch: Partial<Role>): Role {
        const current = this.roles.get(name)

        if (!current) {
            throw new Error("Role not found")
        }

        const updated = { ...current, ...patch, name: current.name }
        this.roles.set(name, updated)
        return updated
    }

    delete(name: string): boolean {
        return this.roles.delete(name)
    }

    list(): Role[] {
        return [...this.roles.values()]
    }
}
