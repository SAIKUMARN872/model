import {
  randomBytes,
  createHash,
} from "node:crypto";

export interface GeneratedApiKey {
  key: string;
  keyId: string;
  prefix: string;
  hash: string;
  createdAt: string;
}

export interface ApiKeyGeneratorOptions {
  prefix?: string;
  bytes?: number;
}

function validateBytes(bytes: number): void {
  if (!Number.isInteger(bytes) || bytes < 16) {
    throw new Error(
      "API key bytes must be an integer of at least 16",
    );
  }
}

export function hashApiKey(key: string): string {
  if (!key) {
    throw new Error("API key is required");
  }

  return createHash("sha256")
    .update(key, "utf8")
    .digest("hex");
}

export function generateKeyId(): string {
  return randomBytes(12).toString("hex");
}

export function generateApiKey(
  options: ApiKeyGeneratorOptions = {},
): GeneratedApiKey {
  const prefix = options.prefix ?? "mn";
  const bytes = options.bytes ?? 32;

  if (!prefix.trim()) {
    throw new Error("API key prefix is required");
  }

  validateBytes(bytes);

  const keyId = generateKeyId();

  const secret = randomBytes(bytes).toString("base64url");

  const key = `${prefix}_${keyId}_${secret}`;

  return {
    key,
    keyId,
    prefix,
    hash: hashApiKey(key),
    createdAt: new Date().toISOString(),
  };
}