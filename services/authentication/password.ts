import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

import {
  passwordValidator,
} from "../auth/password/validator.js";

import type {
  PasswordHashResult,
} from "../auth/password/hashing.js";

export interface PasswordAuthenticationResult {
  authenticated: boolean;
  hash: PasswordHashResult;
}

function deriveKey(
  password: string,
  salt: string,
  keyLength = 64,
): Buffer {
  return scryptSync(password, salt, keyLength, {
    N: 16384,
    r: 8,
    p: 1,
  }) as Buffer;
}

export class AuthenticationPasswordService {
  hash(password: string): PasswordHashResult {
    const validation = passwordValidator.validate(password);

    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    const salt = randomBytes(16).toString("base64");
    const hash = deriveKey(password, salt).toString("base64");

    return {
      hash,
      salt,
      algorithm: "scrypt",
      cost: 16384,
      blockSize: 8,
      parallelization: 1,
    };
  }

  verify(
    password: string,
    storedHash: PasswordHashResult | string,
  ): boolean {
    if (!password) {
      return false;
    }

    let hashData: PasswordHashResult;

    if (typeof storedHash === "string") {
      try {
        const parsed = JSON.parse(storedHash) as Partial<PasswordHashResult>;

        if (parsed.hash && parsed.salt) {
          hashData = parsed as PasswordHashResult;
        } else {
          return false;
        }
      } catch {
        return false;
      }
    } else {
      hashData = storedHash;
    }

    if (!hashData.hash || !hashData.salt) {
      return false;
    }

    try {
      const salt = Buffer.from(hashData.salt, "base64");
      const expected = Buffer.from(hashData.hash, "base64");
      const derived = deriveKey(
        password,
        salt.toString("base64"),
        expected.length,
      );

      if (derived.length !== expected.length) {
        return false;
      }

      return timingSafeEqual(derived, expected);
    } catch {
      return false;
    }
  }

  validate(password: string): {
    valid: boolean;
    errors: string[];
  } {
    return passwordValidator.validate(password);
  }

  authenticate(
    password: string,
    storedHash: PasswordHashResult | string,
  ): PasswordAuthenticationResult {
    return {
      authenticated: this.verify(password, storedHash),
      hash:
        typeof storedHash === "string"
          ? {
              hash: storedHash,
              salt: "",
              algorithm: "scrypt",
              cost: 16384,
              blockSize: 8,
              parallelization: 1,
            }
          : storedHash,
    };
  }
}

export const authenticationPasswordService =
  new AuthenticationPasswordService();
