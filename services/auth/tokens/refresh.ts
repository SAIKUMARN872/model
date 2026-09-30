import {
  createHash,
  randomBytes,
  randomUUID,
} from "node:crypto";

export interface RefreshToken {
  id: string;
  userId: string;
  token: string;
  tokenHash: string;
  createdAt: Date;
  expiresAt: Date;
  revoked: boolean;
  replacedBy?: string;
}

export interface CreateRefreshTokenInput {
  userId: string;
  expiresInSeconds?: number;
}

export class RefreshTokenService {
  private readonly tokens = new Map<string, RefreshToken>();

  create(input: CreateRefreshTokenInput): RefreshToken {
    const userId = input.userId.trim();

    if (!userId) {
      throw new Error("User ID is required");
    }

    const expiresInSeconds =
      input.expiresInSeconds ?? 30 * 24 * 60 * 60;

    if (expiresInSeconds <= 0) {
      throw new Error(
        "Refresh token expiration must be greater than zero",
      );
    }

    const now = new Date();
    const token = randomBytes(48).toString("hex");

    const refreshToken: RefreshToken = {
      id: randomUUID(),
      userId,
      token,
      tokenHash: this.hash(token),
      createdAt: now,
      expiresAt: new Date(
        now.getTime() + expiresInSeconds * 1000,
      ),
      revoked: false,
    };

    this.tokens.set(
      refreshToken.id,
      this.clone(refreshToken),
    );

    return this.clone(refreshToken);
  }

  get(id: string): RefreshToken | undefined {
    const token = this.tokens.get(id);

    if (!token) {
      return undefined;
    }

    return this.clone(token);
  }

  getByToken(token: string): RefreshToken | undefined {
    const normalizedToken = token.trim();

    if (!normalizedToken) {
      return undefined;
    }

    const tokenHash = this.hash(normalizedToken);

    const refreshToken = [...this.tokens.values()].find(
      (item) => item.tokenHash === tokenHash,
    );

    return refreshToken
      ? this.clone(refreshToken)
      : undefined;
  }

  isValid(token: string): boolean {
    const refreshToken = this.getByToken(token);

    if (!refreshToken) {
      return false;
    }

    if (refreshToken.revoked) {
      return false;
    }

    return refreshToken.expiresAt.getTime() > Date.now();
  }

  revoke(id: string): boolean {
    const token = this.tokens.get(id);

    if (!token) {
      return false;
    }

    token.revoked = true;

    this.tokens.set(id, this.clone(token));

    return true;
  }

  revokeByToken(token: string): boolean {
    const refreshToken = this.getByToken(token);

    if (!refreshToken) {
      return false;
    }

    return this.revoke(refreshToken.id);
  }

  rotate(
    token: string,
    expiresInSeconds?: number,
  ): RefreshToken {
    const current = this.getByToken(token);

    if (!current) {
      throw new Error("Refresh token not found");
    }

    if (!this.isValid(token)) {
      throw new Error("Refresh token is invalid");
    }

    const next = this.create({
      userId: current.userId,
      expiresInSeconds,
    });

    const stored = this.tokens.get(current.id);

    if (stored) {
      stored.revoked = true;
      stored.replacedBy = next.id;

      this.tokens.set(
        current.id,
        this.clone(stored),
      );
    }

    return next;
  }

  revokeUserTokens(userId: string): number {
    const normalizedUserId = userId.trim();

    let count = 0;

    for (const [id, token] of this.tokens.entries()) {
      if (
        token.userId === normalizedUserId &&
        !token.revoked
      ) {
        token.revoked = true;
        this.tokens.set(id, this.clone(token));
        count++;
      }
    }

    return count;
  }

  cleanupExpired(): number {
    let count = 0;

    for (const [id, token] of this.tokens.entries()) {
      if (
        token.expiresAt.getTime() <= Date.now()
      ) {
        this.tokens.delete(id);
        count++;
      }
    }

    return count;
  }

  count(): number {
    return this.tokens.size;
  }

  activeCount(): number {
    let count = 0;

    for (const token of this.tokens.values()) {
      if (
        !token.revoked &&
        token.expiresAt.getTime() > Date.now()
      ) {
        count++;
      }
    }

    return count;
  }

  clear(): void {
    this.tokens.clear();
  }

  health(): {
    healthy: boolean;
    tokenCount: number;
    activeTokenCount: number;
  } {
    return {
      healthy: true,
      tokenCount: this.count(),
      activeTokenCount: this.activeCount(),
    };
  }

  private hash(token: string): string {
    return createHash("sha256")
      .update(token, "utf8")
      .digest("hex");
  }

  private clone(token: RefreshToken): RefreshToken {
    return {
      ...token,
      createdAt: new Date(token.createdAt),
      expiresAt: new Date(token.expiresAt),
    };
  }
}

export const refreshTokenService =
  new RefreshTokenService();
