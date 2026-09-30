import { randomBytes } from "node:crypto";

export interface PasswordResetToken {
  id: string;
  userId: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  used: boolean;
}

export interface PasswordResetOptions {
  tokenLength: number;
  ttlMs: number;
}

export const defaultPasswordResetOptions: PasswordResetOptions = {
  tokenLength: 32,
  ttlMs: 15 * 60 * 1000,
};

export class PasswordResetService {
  private readonly options: PasswordResetOptions;
  private readonly tokens = new Map<string, PasswordResetToken>();

  constructor(
    options: Partial<PasswordResetOptions> = {},
  ) {
    this.options = {
      ...defaultPasswordResetOptions,
      ...options,
    };

    if (this.options.tokenLength < 16) {
      throw new Error(
        "Reset token length must be at least 16 bytes",
      );
    }

    if (this.options.ttlMs <= 0) {
      throw new Error(
        "Reset token TTL must be greater than zero",
      );
    }
  }

  createToken(userId: string): PasswordResetToken {
    if (!userId.trim()) {
      throw new Error("User ID is required");
    }

    this.removeUserTokens(userId);

    const now = new Date();

    const record: PasswordResetToken = {
      id: randomBytes(16).toString("hex"),
      userId,
      token: randomBytes(
        this.options.tokenLength,
      ).toString("hex"),
      createdAt: now,
      expiresAt: new Date(
        now.getTime() + this.options.ttlMs,
      ),
      used: false,
    };

    this.tokens.set(record.token, record);

    return this.clone(record);
  }

  verifyToken(
    token: string,
  ): PasswordResetToken | null {
    const record = this.tokens.get(token);

    if (!record) {
      return null;
    }

    if (record.used) {
      return null;
    }

    if (record.expiresAt.getTime() <= Date.now()) {
      this.tokens.delete(token);
      return null;
    }

    return this.clone(record);
  }

  consumeToken(
    token: string,
  ): PasswordResetToken | null {
    const record = this.verifyToken(token);

    if (!record) {
      return null;
    }

    record.used = true;
    this.tokens.set(token, record);

    return this.clone(record);
  }

  revokeToken(token: string): boolean {
    return this.tokens.delete(token);
  }

  removeUserTokens(userId: string): number {
    let removed = 0;

    for (const [token, record] of this.tokens.entries()) {
      if (record.userId === userId) {
        this.tokens.delete(token);
        removed++;
      }
    }

    return removed;
  }

  cleanupExpired(): number {
    let removed = 0;
    const now = Date.now();

    for (const [token, record] of this.tokens.entries()) {
      if (
        record.used ||
        record.expiresAt.getTime() <= now
      ) {
        this.tokens.delete(token);
        removed++;
      }
    }

    return removed;
  }

  count(): number {
    return this.tokens.size;
  }

  clear(): void {
    this.tokens.clear();
  }

  health(): {
    healthy: boolean;
    tokenCount: number;
  } {
    return {
      healthy: true,
      tokenCount: this.tokens.size,
    };
  }

  private clone(
    record: PasswordResetToken,
  ): PasswordResetToken {
    return {
      ...record,
      createdAt: new Date(record.createdAt),
      expiresAt: new Date(record.expiresAt),
    };
  }
}

export const passwordResetService =
  new PasswordResetService();
