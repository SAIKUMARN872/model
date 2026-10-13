import { TokenBlacklist } from "./blacklist.js"
import { RefreshTokenManager } from "./refresh.js"

export class TokenManager {
    readonly blacklist: TokenBlacklist
    readonly refresh: RefreshTokenManager

    constructor(
        blacklist = new TokenBlacklist(),
        refresh = new RefreshTokenManager()
    ) {
        this.blacklist = blacklist
        this.refresh = refresh
    }

    revokeAccessToken(token: string, expiresAt: number): void {
        this.blacklist.add(token, expiresAt)
    }

    isRevoked(token: string): boolean {
        return this.blacklist.has(token)
    }

    issueRefreshToken(userId: string) {
        return this.refresh.create(userId)
    }

    consumeRefreshToken(token: string) {
        return this.refresh.consume(token)
    }
}
