import type { AuthService } from "../services/auth-service.js"

export class AuthController {
    constructor(private readonly auth: AuthService) {}

    register(input: {
        email: string
        password: string
        name?: string
    }) {
        return this.auth.register(input.email, input.password, input.name)
    }

    verifyToken(token: string) {
        return this.auth.verifyAccessToken(token)
    }
}
