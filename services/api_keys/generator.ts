import { randomBytes } from "node:crypto";

export interface GeneratedApiKey {
    id: string;
    key: string;
    prefix: string;
    createdAt: Date;
}

export interface ApiKeyGeneratorOptions {
    prefix?: string;
    bytes?: number;
}

export class ApiKeyGenerator {
    private readonly prefix: string;
    private readonly bytes: number;

    constructor(options: ApiKeyGeneratorOptions = {}) {
        this.prefix = options.prefix ?? "mn";
        this.bytes = options.bytes ?? 32;

        if (!/^[a-zA-Z0-9_-]+$/.test(this.prefix)) {
            throw new Error("API key prefix contains invalid characters");
        }

        if (!Number.isInteger(this.bytes) || this.bytes < 16 || this.bytes > 128) {
            throw new Error("API key byte length must be an integer between 16 and 128");
        }
    }

    generate(): GeneratedApiKey {
        const id = randomBytes(16).toString("hex");
        const secret = randomBytes(this.bytes).toString("base64url");
        const key = `${this.prefix}_${secret}`;

        return {
            id,
            key,
            prefix: this.prefix,
            createdAt: new Date()
        };
    }
}

export function generateApiKey(
    options: ApiKeyGeneratorOptions = {}
): GeneratedApiKey {
    return new ApiKeyGenerator(options).generate();
}
