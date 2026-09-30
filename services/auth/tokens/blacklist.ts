import { createHash } from "node:crypto";

export interface BlacklistedToken {
  tokenHash: string;
  userId?: string;
  reason: string;
  createdAt: Date;
  expiresAt?: Date;
}

export class TokenBlacklist {
  private readonly tokens = new Map<string, BlacklistedToken>();

  add(
    token: string,
    reason = "revoked",
    userId?: string,
    expiresAt?: Date,
  ): BlacklistedToken {
    const normalizedToken = token.trim();

    if (!normalizedToken) {
      throw new Error("Token is required");
    }

    const tokenHash = this.hash(normalizedToken);

    const entry: BlacklistedToken = {
      tokenHash,
      userId,
      reason: reason.trim() || "revoked",
      createdAt: new Date(),
      expiresAt: expiresAt
        ? new Date(expiresAt)
        : undefined,
    };

    this.tokens.set(tokenHash, this.clone(entry));

    return this.clone(entry);
  }

  has(token: string): boolean {
    const normalizedToken = token.trim();

    if (!normalizedToken) {
      return false;
    }

    const tokenHash = this.hash(normalizedToken);
    const entry = this.tokens.get(tokenHash);

    if (!entry) {
      return false;
    }

    if (
      entry.expiresAt &&
      entry.expiresAt.getTime() <= Date.now()
    ) {
      this.tokens.delete(tokenHash);
      return false;
    }

    return true;
  }

  get(token: string): BlacklistedToken | undefined {
    const normalizedToken = token.trim();

    if (!normalizedToken) {
      return undefined;
    }

    const tokenHash = this.hash(normalizedToken);
    const entry = this.tokens.get(tokenHash);

    if (!entry) {
      return undefined;
    }

    if (
      entry.expiresAt &&
      entry.expiresAt.getTime() <= Date.now()
    ) {
      this.tokens.delete(tokenHash);
      return undefined;
    }

    return this.clone(entry);
  }

  remove(token: string): boolean {
    const normalizedToken = token.trim();

    if (!normalizedToken) {
      return false;
    }

    return this.tokens.delete(this.hash(normalizedToken));
  }

  cleanupExpired(): number {
    let removed = 0;

    for (const [hash, entry] of this.tokens.entries()) {
      if (
        entry.expiresAt &&
        entry.expiresAt.getTime() <= Date.now()
      ) {
        this.tokens.delete(hash);
        removed++;
      }
    }

    return removed;
  }

  count(): number {
    this.cleanupExpired();
    return this.tokens.size;
  }

  clear(): void {
    this.tokens.clear();
  }

  health(): {
    healthy: boolean;
    blacklistCount: number;
  } {
    return {
      healthy: true,
      blacklistCount: this.count(),
    };
  }

  private hash(token: string): string {
    return createHash("sha256")
      .update(token, "utf8")
      .digest("hex");
  }

  private clone(entry: BlacklistedToken): BlacklistedToken {
    return {
      ...entry,
      createdAt: new Date(entry.createdAt),
      expiresAt: entry.expiresAt
        ? new Date(entry.expiresAt)
        : undefined,
    };
  }
}

export const tokenBlacklist = new TokenBlacklist();
