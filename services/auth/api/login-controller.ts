import type { AuthService } from "../services/auth-service.js"

export class LoginController {
    constructor(private readonly auth: AuthService) {}

    login(input: {
        email: string
        password: string
        mfaCode?: string
    }) {
        return this.auth.login(input)
    }
}
