import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

export interface EncryptionResult {
  encrypted: string;
  iv: string;
  authTag: string;
}

export interface EncryptionOptions {
  key?: string;
}

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const KEY_LENGTH = 32;

function deriveKey(secret: string): Buffer {
  if (!secret || secret.length < 16) {
    throw new Error("Encryption key must contain at least 16 characters");
  }

  return createHash("sha256")
    .update(secret, "utf8")
    .digest();
}

export class EncryptionService {
  private readonly key: Buffer;

  constructor(secret = process.env.AUTH_ENCRYPTION_KEY ?? "modelnow-development-key") {
    this.key = deriveKey(secret);
  }

  encrypt(value: string): EncryptionResult {
    if (typeof value !== "string") {
      throw new Error("Value to encrypt must be a string");
    }

    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.key, iv);

    const encrypted = Buffer.concat([
      cipher.update(value, "utf8"),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return {
      encrypted: encrypted.toString("base64"),
      iv: iv.toString("base64"),
      authTag: authTag.toString("base64"),
    };
  }

  decrypt(result: EncryptionResult): string {
    if (
      !result ||
      !result.encrypted ||
      !result.iv ||
      !result.authTag
    ) {
      throw new Error("Invalid encrypted payload");
    }

    try {
      const iv = Buffer.from(result.iv, "base64");
      const encrypted = Buffer.from(result.encrypted, "base64");
      const authTag = Buffer.from(result.authTag, "base64");

      const decipher = createDecipheriv(ALGORITHM, this.key, iv);
      decipher.setAuthTag(authTag);

      return Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
      ]).toString("utf8");
    } catch {
      throw new Error("Unable to decrypt value");
    }
  }

  encryptText(value: string): string {
    const result = this.encrypt(value);

    return [
      result.iv,
      result.authTag,
      result.encrypted,
    ].join(".");
  }

  decryptText(value: string): string {
    const parts = value.split(".");

    if (parts.length !== 3) {
      throw new Error("Invalid encrypted text format");
    }

    return this.decrypt({
      iv: parts[0],
      authTag: parts[1],
      encrypted: parts[2],
    });
  }

  hash(value: string): string {
    return createHash("sha256")
      .update(value, "utf8")
      .digest("hex");
  }

  isValid(value: string): boolean {
    try {
      this.decryptText(value);
      return true;
    } catch {
      return false;
    }
  }
}

export const encryptionService = new EncryptionService();
