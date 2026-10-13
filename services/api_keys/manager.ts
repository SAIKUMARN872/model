import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { ApiKeyGenerator, type GeneratedApiKey } from "./generator.js";

export interface ApiKeyRecord {
    id: string;
    name: string;
    keyHash: string;
    prefix: string;
    createdAt: Date;
    expiresAt?: Date;
    revokedAt?: Date;
    lastUsedAt?: Date;
    metadata: Record<string, string>;
}

export interface CreateApiKeyOptions {
    name: string;
    expiresAt?: Date;
    metadata?: Record<string, string>;
}

export interface ApiKeyManagerOptions {
    generator?: ApiKeyGenerator;
    now?: () => Date;
}

export class ApiKeyManager {
    private readonly records = new Map<string, ApiKeyRecord>();
    private readonly generator: ApiKeyGenerator;
    private readonly now: () => Date;

    constructor(options: ApiKeyManagerOptions = {}) {
        this.generator = options.generator ?? new ApiKeyGenerator();
        this.now = options.now ?? (() => new Date());
    }

    create(options: CreateApiKeyOptions): GeneratedApiKey & { record: ApiKeyRecord } {
        const name = options.name.trim();

        if (!name) {
            throw new Error("API key name is required");
        }

        if (
            options.expiresAt !== undefined &&
            options.expiresAt.getTime() <= this.now().getTime()
        ) {
            throw new Error("API key expiration must be in the future");
        }

        const generated = this.generator.generate();

        const record: ApiKeyRecord = {
            id: generated.id,
            name,
            keyHash: hashApiKey(generated.key),
            prefix: generated.prefix,
            createdAt: generated.createdAt,
            expiresAt: options.expiresAt,
            metadata: { ...(options.metadata ?? {}) }
        };

        this.records.set(record.id, record);

        return {
            ...generated,
            record: cloneRecord(record)
        };
    }

    get(id: string): ApiKeyRecord | undefined {
        const record = this.records.get(id);
        return record ? cloneRecord(record) : undefined;
    }

    list(): ApiKeyRecord[] {
        return [...this.records.values()].map(cloneRecord);
    }

    revoke(id: string): boolean {
        const record = this.records.get(id);

        if (!record || record.revokedAt) {
            return false;
        }

        record.revokedAt = this.now();
        return true;
    }

    delete(id: string): boolean {
        return this.records.delete(id);
    }

    validate(key: string): ApiKeyRecord | undefined {
        for (const record of this.records.values()) {
            if (!safeHashCompare(key, record.keyHash)) {
                continue;
            }

            const now = this.now();

            if (record.revokedAt) {
                return undefined;
            }

            if (record.expiresAt && record.expiresAt.getTime() <= now.getTime()) {
                return undefined;
            }

            record.lastUsedAt = now;
            return cloneRecord(record);
        }

        return undefined;
    }
}

export function hashApiKey(key: string): string {
    return createHash("sha256").update(key, "utf8").digest("hex");
}

function safeHashCompare(key: string, expectedHash: string): boolean {
    const actual = Buffer.from(hashApiKey(key), "hex");
    const expected = Buffer.from(expectedHash, "hex");

    if (actual.length !== expected.length) {
        return false;
    }

    return timingSafeEqual(actual, expected);
}

function cloneRecord(record: ApiKeyRecord): ApiKeyRecord {
    return {
        ...record,
        createdAt: new Date(record.createdAt),
        expiresAt: record.expiresAt ? new Date(record.expiresAt) : undefined,
        revokedAt: record.revokedAt ? new Date(record.revokedAt) : undefined,
        lastUsedAt: record.lastUsedAt ? new Date(record.lastUsedAt) : undefined,
        metadata: { ...record.metadata }
    };
}
