export type ApiKeyStatus = "active" | "revoked";

export interface ApiKey {
  id: string;
  ownerId: string;
  name: string;
  prefix: string;
  keyHash: string;
  status: ApiKeyStatus;
  lastUsedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

export interface CreateApiKeyInput {
  ownerId: string;
  name: string;
  expiresAt?: Date;
}

export function validateCreateApiKeyInput(input: CreateApiKeyInput): void {
  if (!input.ownerId.trim()) throw new Error("ownerId is required.");
  if (!input.name.trim()) throw new Error("name is required.");
  if (input.expiresAt && Number.isNaN(input.expiresAt.getTime())) {
    throw new Error("expiresAt must be a valid date.");
  }
}
