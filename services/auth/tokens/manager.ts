import {
  TokenBlacklist,
  tokenBlacklist,
} from "./blacklist.js";

import {
  RefreshTokenService,
  refreshTokenService,
  type CreateRefreshTokenInput,
  type RefreshToken,
} from "./refresh.js";

export interface TokenManagerOptions {
  blacklist?: TokenBlacklist;
  refreshTokens?: RefreshTokenService;
}

export class TokenManager {
  private readonly blacklist: TokenBlacklist;
  private readonly refreshTokens: RefreshTokenService;

  constructor(
    options: TokenManagerOptions = {},
  ) {
    this.blacklist =
      options.blacklist ?? tokenBlacklist;

    this.refreshTokens =
      options.refreshTokens ?? refreshTokenService;
  }

  createRefreshToken(
    input: CreateRefreshTokenInput,
  ): RefreshToken {
    return this.refreshTokens.create(input);
  }

  getRefreshToken(
    id: string,
  ): RefreshToken | undefined {
    return this.refreshTokens.get(id);
  }

  getRefreshTokenByValue(
    token: string,
  ): RefreshToken | undefined {
    return this.refreshTokens.getByToken(token);
  }

  validateRefreshToken(token: string): boolean {
    return this.refreshTokens.isValid(token);
  }

  revokeRefreshToken(id: string): boolean {
    return this.refreshTokens.revoke(id);
  }

  revokeRefreshTokenByValue(
    token: string,
  ): boolean {
    return this.refreshTokens.revokeByToken(token);
  }

  rotateRefreshToken(
    token: string,
    expiresInSeconds?: number,
  ): RefreshToken {
    return this.refreshTokens.rotate(
      token,
      expiresInSeconds,
    );
  }

  revokeUserRefreshTokens(
    userId: string,
  ): number {
    return this.refreshTokens.revokeUserTokens(
      userId,
    );
  }

  blacklistToken(
    token: string,
    reason = "revoked",
    userId?: string,
    expiresAt?: Date,
  ) {
    return this.blacklist.add(
      token,
      reason,
      userId,
      expiresAt,
    );
  }

  isBlacklisted(token: string): boolean {
    return this.blacklist.has(token);
  }

  removeFromBlacklist(token: string): boolean {
    return this.blacklist.remove(token);
  }

  cleanup(): {
    expiredRefreshTokens: number;
    expiredBlacklistTokens: number;
  } {
    return {
      expiredRefreshTokens:
        this.refreshTokens.cleanupExpired(),
      expiredBlacklistTokens:
        this.blacklist.cleanupExpired(),
    };
  }

  health() {
    return {
      healthy:
        this.refreshTokens.health().healthy &&
        this.blacklist.health().healthy,
      refreshTokens:
        this.refreshTokens.health(),
      blacklist:
        this.blacklist.health(),
    };
  }

  clear(): void {
    this.refreshTokens.clear();
    this.blacklist.clear();
  }
}

export const tokenManager = new TokenManager();
