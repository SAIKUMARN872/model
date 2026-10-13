import type { JwtPayload } from "../jwt/jwt.js"
import type { JwtValidator } from "../jwt/validator.js"

export interface AuthenticatedRequest {
    headers: Record<string, string | undefined>
    user?: JwtPayload
}

export class AuthMiddleware {
    constructor(private readonly jwt: JwtValidator) {}

    authenticate(request: AuthenticatedRequest): JwtPayload {
        const header = request.headers.authorization

        if (!header?.startsWith("Bearer ")) {
            throw new Error("Authorization header required")
        }

        const token = header.slice("Bearer ".length).trim()
        const payload = this.jwt.validate(token)

        request.user = payload
        return payload
    }
}
