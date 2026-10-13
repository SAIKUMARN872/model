import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function hashCredential(secret: string, salt = randomBytes(16).toString("hex")): {
    salt: string;
    hash: string;
} {
    const hash = createHash("sha256").update(`${salt}:${secret}`).digest("hex");
    return { salt, hash };
}

export function verifyCredential(secret: string, salt: string, expectedHash: string): boolean {
    const actual = Buffer.from(hashCredential(secret, salt).hash, "hex");
    const expected = Buffer.from(expectedHash, "hex");

    return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function maskCredential(secret: string): string {
    if (secret.length <= 4) return "*".repeat(secret.length);
    return `${"*".repeat(Math.min(secret.length - 4, 12))}${secret.slice(-4)}`;
}
