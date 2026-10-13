import { randomBytes } from "node:crypto";
import { hashApiKey, type ApiKeyManager } from "./manager.js";

export interface ApiKeyRotationResult {
    oldKeyId: string;
    newKeyId: string;
    newKey: string;
}

export interface RotateApiKeyOptions {
    name?: string;
    expiresAt?: Date;
    metadata?: Record<string, string>;
}

export class ApiKeyRotationService {
    constructor(private readonly manager: ApiKeyManager) {}

    rotate(
        keyId: string,
        options: RotateApiKeyOptions = {}
    ): ApiKeyRotationResult {
        const existing = this.manager.get(keyId);

        if (!existing) {
            throw new Error("API key not found");
        }

        const created = this.manager.create({
            name: options.name ?? existing.name,
            expiresAt: options.expiresAt ?? existing.expiresAt,
            metadata: options.metadata ?? existing.metadata
        });

        this.manager.revoke(keyId);

        return {
            oldKeyId: keyId,
            newKeyId: created.id,
            newKey: created.key
        };
    }
}

export function rotateApiKey(
    manager: ApiKeyManager,
    keyId: string,
    options: RotateApiKeyOptions = {}
): ApiKeyRotationResult {
    return new ApiKeyRotationService(manager).rotate(keyId, options);
}

export function generateRotationToken(): string {
    return randomBytes(32).toString("base64url");
}

export function hashRotationToken(token: string): string {
    return hashApiKey(token);
}
