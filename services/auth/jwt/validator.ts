import { Jwt } from "./jwt.js"
import type { JwtOptions, JwtPayload } from "./jwt.js"

export class JwtValidator {
    private readonly jwt: Jwt

    constructor(options: JwtOptions) {
        this.jwt = new Jwt(options)
    }

    validate(token: string): JwtPayload {
        return this.jwt.verify(token)
    }

    isValid(token: string): boolean {
        try {
            this.validate(token)
            return true
        } catch {
            return false
        }
    }
}
