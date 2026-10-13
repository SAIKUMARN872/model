import { Jwt } from "./jwt.js"
import type { JwtOptions, JwtPayload } from "./jwt.js"

export class JwtDecoder {
    private readonly jwt: Jwt

    constructor(options: JwtOptions) {
        this.jwt = new Jwt(options)
    }

    decode(token: string): JwtPayload {
        return this.jwt.decode(token)
    }
}
