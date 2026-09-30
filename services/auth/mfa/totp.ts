import { createHmac, randomBytes } from "node:crypto";

export interface TotpOptions {
  digits?: number;
  period?: number;
  algorithm?: "sha1" | "sha256" | "sha512";
}

export class TotpService {
  private readonly digits: number;
  private readonly period: number;
  private readonly algorithm: "sha1" | "sha256" | "sha512";

  constructor(options: TotpOptions = {}) {
    this.digits = options.digits ?? 6;
    this.period = options.period ?? 30;
    this.algorithm = options.algorithm ?? "sha1";

    if (this.digits < 6 || this.digits > 8) {
      throw new Error("TOTP digits must be between 6 and 8");
    }

    if (this.period <= 0) {
      throw new Error("TOTP period must be greater than zero");
    }
  }

  generateSecret(length = 20): string {
    if (length < 10) {
      throw new Error("Secret length must be at least 10 bytes");
    }

    return randomBytes(length).toString("base64url");
  }

  generate(secret: string, timestamp = Date.now()): string {
    const counter = Math.floor(timestamp / 1000 / this.period);

    return this.generateForCounter(secret, counter);
  }

  verify(
    token: string,
    secret: string,
    timestamp = Date.now(),
    window = 1,
  ): boolean {
    if (!/^\d+$/.test(token)) {
      return false;
    }

    if (token.length !== this.digits) {
      return false;
    }

    if (window < 0) {
      return false;
    }

    const currentCounter = Math.floor(
      timestamp / 1000 / this.period,
    );

    for (
      let offset = -window;
      offset <= window;
      offset++
    ) {
      const expected = this.generateForCounter(
        secret,
        currentCounter + offset,
      );

      if (this.constantTimeEqual(token, expected)) {
        return true;
      }
    }

    return false;
  }

  private generateForCounter(
    secret: string,
    counter: number,
  ): string {
    const key = this.decodeSecret(secret);

    const buffer = Buffer.alloc(8);
    let value = counter;

    for (let index = 7; index >= 0; index--) {
      buffer[index] = value & 0xff;
      value = Math.floor(value / 256);
    }

    const digest = createHmac(this.algorithm, key)
      .update(buffer)
      .digest();

    const offset = digest[digest.length - 1] & 0x0f;

    const binary =
      ((digest[offset] & 0x7f) << 24) |
      ((digest[offset + 1] & 0xff) << 16) |
      ((digest[offset + 2] & 0xff) << 8) |
      (digest[offset + 3] & 0xff);

    const otp = binary % 10 ** this.digits;

    return otp.toString().padStart(this.digits, "0");
  }

  private decodeSecret(secret: string): Buffer {
    if (!secret.trim()) {
      throw new Error("TOTP secret is required");
    }

    return Buffer.from(secret, "base64url");
  }

  private constantTimeEqual(
    first: string,
    second: string,
  ): boolean {
    if (first.length !== second.length) {
      return false;
    }

    let difference = 0;

    for (let index = 0; index < first.length; index++) {
      difference |=
        first.charCodeAt(index) ^
        second.charCodeAt(index);
    }

    return difference === 0;
  }
}

export const totpService = new TotpService();
