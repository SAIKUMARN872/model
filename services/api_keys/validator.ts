import { createHash, timingSafeEqual } from "node:crypto";
import type { ApiKeyManager, ApiKeyRecord } from "./manager.js";

export interface ApiKeyValidationResult {
    valid: boolean;
    record?: ApiKeyRecord;
    reason?: "invalid" | "revoked" | "expired";
}

export class ApiKeyValidator {
    constructor(private readonly manager: ApiKeyManager) {}

    validate(key: string): ApiKeyValidationResult {
        if (!key || key.trim().length === 0) {
            return {
                valid: false,
                reason: "invalid"
            };
        }

        const record = this.manager.validate(key);

        if (record) {
            return {
                valid: true,
                record
            };
        }

        const candidates = this.manager.list();

        for (const candidate of candidates) {
            if (!safeCompare(hashApiKey(key), candidate.keyHash)) {
                continue;
            }

            if (candidate.revokedAt) {
                return {
                    valid: false,
                    reason: "revoked"
                };
            }

            if (
                candidate.expiresAt &&
                candidate.expiresAt.getTime() <= Date.now()
            ) {
                return {
                    valid: false,
                    reason: "expired"
                };
            }
        }

        return {
            valid: false,
            reason: "invalid"
        };
    }

    isValid(key: string): boolean {
        return this.validate(key).valid;
    }
}

export function validateApiKey(
    manager: ApiKeyManager,
    key: string
): ApiKeyValidationResult {
    return new ApiKeyValidator(manager).validate(key);
}

function hashApiKey(key: string): string {
    return createHash("sha256").update(key, "utf8").digest("hex");
}

function safeCompare(actualHex: string, expectedHex: string): boolean {
    const actual = Buffer.from(actualHex, "hex");
    const expected = Buffer.from(expectedHex, "hex");

    return (
        actual.length === expected.length &&
        timingSafeEqual(actual, expected)
    );
}
