import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

export interface PasswordHashOptions {
  saltLength: number;
  keyLength: number;
  cost: number;
  blockSize: number;
  parallelization: number;
}

export interface PasswordHashResult {
  hash: string;
  salt: string;
  algorithm: "scrypt";
  cost: number;
  blockSize: number;
  parallelization: number;
}

export const defaultPasswordHashOptions: PasswordHashOptions = {
  saltLength: 16,
  keyLength: 64,
  cost: 16384,
  blockSize: 8,
  parallelization: 1,
};

export class PasswordHasher {
  private readonly options: PasswordHashOptions;

  constructor(
    options: Partial<PasswordHashOptions> = {},
  ) {
    this.options = {
      ...defaultPasswordHashOptions,
      ...options,
    };

    this.validateOptions();
  }

  hash(password: string): PasswordHashResult {
    this.validatePassword(password);

    const salt = randomBytes(this.options.saltLength);

    const derivedKey = scryptSync(
      password,
      salt,
      this.options.keyLength,
      {
        N: this.options.cost,
        r: this.options.blockSize,
        p: this.options.parallelization,
      },
    );

    return {
      hash: derivedKey.toString("base64"),
      salt: salt.toString("base64"),
      algorithm: "scrypt",
      cost: this.options.cost,
      blockSize: this.options.blockSize,
      parallelization: this.options.parallelization,
    };
  }

  verify(
    password: string,
    stored: PasswordHashResult,
  ): boolean {
    if (
      typeof password !== "string" ||
      !stored ||
      !stored.hash ||
      !stored.salt
    ) {
      return false;
    }

    try {
      const salt = Buffer.from(
        stored.salt,
        "base64",
      );

      const expected = Buffer.from(
        stored.hash,
        "base64",
      );

      const derivedKey = scryptSync(
        password,
        salt,
        expected.length,
        {
          N: stored.cost,
          r: stored.blockSize,
          p: stored.parallelization,
        },
      );

      if (derivedKey.length !== expected.length) {
        return false;
      }

      return timingSafeEqual(
        derivedKey,
        expected,
      );
    } catch {
      return false;
    }
  }

  private validatePassword(
    password: string,
  ): void {
    if (typeof password !== "string") {
      throw new Error(
        "Password must be a string",
      );
    }

    if (password.length === 0) {
      throw new Error(
        "Password cannot be empty",
      );
    }

    if (password.length > 1024) {
      throw new Error(
        "Password is too long",
      );
    }
  }

  private validateOptions(): void {
    if (this.options.saltLength < 16) {
      throw new Error(
        "Salt length must be at least 16 bytes",
      );
    }

    if (this.options.keyLength < 32) {
      throw new Error(
        "Key length must be at least 32 bytes",
      );
    }

    if (this.options.cost < 16384) {
      throw new Error(
        "Scrypt cost must be at least 16384",
      );
    }

    if (this.options.blockSize < 1) {
      throw new Error(
        "Scrypt block size must be positive",
      );
    }

    if (this.options.parallelization < 1) {
      throw new Error(
        "Scrypt parallelization must be positive",
      );
    }
  }
}

export const passwordHasher =
  new PasswordHasher();
