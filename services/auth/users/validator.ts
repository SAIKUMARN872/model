import type { User } from "./user.js";

export interface UserValidationResult {
    valid: boolean
    errors: string[]
}

export class UserValidator {
    validate(user: User): UserValidationResult {
        const errors: string[] = []

        if (!user.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
            errors.push("A valid email is required")
        }

        if (!user.passwordHash.trim()) {
            errors.push("Password hash is required")
        }

        if (!Array.isArray(user.roles) || user.roles.some((role) => !role.trim())) {
            errors.push("Roles must be non-empty strings")
        }

        return {
            valid: errors.length === 0,
            errors
        }
    }
}