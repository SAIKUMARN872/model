import { Jwt } from "./jwt.js"
import type { JwtOptions, JwtPayload } from "./jwt.js"

export class JwtEncoder {
    private readonly jwt: Jwt

    constructor(options: JwtOptions) {
        this.jwt = new Jwt(options)
    }

    encode(payload: Omit<JwtPayload, "iat" | "exp"> & Partial<Pick<JwtPayload, "iat" | "exp">>): string {
        return this.jwt.sign(payload)
    }
}
