export interface PasswordValidation {
    valid: boolean
    errors: string[]
}

export class PasswordValidator {
    constructor(
        private readonly minLength = 8,
        private readonly requireUppercase = true,
        private readonly requireNumber = true
    ) {}

    validate(password: string): PasswordValidation {
        const errors: string[] = []

        if (password.length < this.minLength) {
            errors.push(`Password must be at least ${this.minLength} characters`)
        }

        if (this.requireUppercase && !/[A-Z]/.test(password)) {
            errors.push("Password must contain an uppercase letter")
        }

        if (this.requireNumber && !/[0-9]/.test(password)) {
            errors.push("Password must contain a number")
        }

        return {
            valid: errors.length === 0,
            errors
        }
    }
}
