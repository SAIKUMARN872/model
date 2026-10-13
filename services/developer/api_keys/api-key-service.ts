import { createHash, randomBytes, randomUUID } from "node:crypto";
import type { ApiKey, CreateApiKeyInput } from "./api-key-schema.js";
import { validateCreateApiKeyInput } from "./api-key-schema.js";
import { ApiKeyRepository } from "./api-key-repository.js";

export interface CreatedApiKey {
  record: ApiKey;
  secret: string;
}

export class ApiKeyService {
  constructor(private readonly repository = new ApiKeyRepository()) {}

  create(input: CreateApiKeyInput): CreatedApiKey {
    validateCreateApiKeyInput(input);

    const secret = randomBytes(32).toString("hex");
    const now = new Date();
    const record = this.repository.save({
      id: randomUUID(),
      ownerId: input.ownerId.trim(),
      name: input.name.trim(),
      prefix: secret.slice(0, 8),
      keyHash: createHash("sha256").update(secret).digest("hex"),
      status: "active",
      createdAt: now,
      ...(input.expiresAt ? { expiresAt: new Date(input.expiresAt) } : {}),
    });

    return { record, secret };
  }

  get(id: string): ApiKey | undefined {
    return this.repository.getById(id);
  }

  list(ownerId: string): ApiKey[] {
    return this.repository.listByOwner(ownerId);
  }

  authenticate(secret: string): ApiKey | undefined {
    const hash = createHash("sha256").update(secret).digest("hex");
    const key = this.repository.findByHash(hash);

    if (!key || key.status !== "active") return undefined;
    if (key.expiresAt && key.expiresAt.getTime() <= Date.now()) return undefined;

    return this.repository.save({ ...key, lastUsedAt: new Date() });
  }

  revoke(id: string, ownerId: string): ApiKey {
    const key = this.repository.getById(id);
    if (!key) throw new Error("API key not found.");
    if (key.ownerId !== ownerId) throw new Error("API key does not belong to this owner.");

    return this.repository.save({ ...key, status: "revoked" });
  }

  delete(id: string, ownerId: string): boolean {
    const key = this.repository.getById(id);
    if (!key) return false;
    if (key.ownerId !== ownerId) throw new Error("API key does not belong to this owner.");
    return this.repository.delete(id);
  }
}
