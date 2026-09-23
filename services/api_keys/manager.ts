import {
  generateApiKey,
  hashApiKey,
  type GeneratedApiKey,
} from "./generator.js";

export interface ApiKeyRecord {
  id: string;
  name: string;
  keyHash: string;
  prefix: string;
  subject: string;
  scopes: string[];
  createdAt: string;
  expiresAt?: string;
  lastUsedAt?: string;
  revokedAt?: string;
  metadata?: Record<string, string>;
}

export interface CreateApiKeyInput {
  name: string;
  subject: string;
  scopes?: string[];
  expiresAt?: string;
  metadata?: Record<string, string>;
  prefix?: string;
}

export interface ApiKeyValidation {
  valid: boolean;
  record?: ApiKeyRecord;
  reason?: string;
}

export interface ApiKeyManagerHealth {
  healthy: boolean;
  keyCount: number;
  activeKeyCount: number;
  revokedKeyCount: number;
  expiredKeyCount: number;
}

export class ApiKeyManager {
  private readonly keys = new Map<
    string,
    ApiKeyRecord
  >();

  create(
    input: CreateApiKeyInput,
  ): GeneratedApiKey {
    if (!input.name.trim()) {
      throw new Error("API key name is required");
    }

    if (!input.subject.trim()) {
      throw new Error("API key subject is required");
    }

    if (input.expiresAt) {
      this.validateExpiration(input.expiresAt);
    }

    const generated = generateApiKey({
      prefix: input.prefix ?? "mn",
    });

    const record: ApiKeyRecord = {
      id: generated.keyId,
      name: input.name.trim(),
      keyHash: generated.hash,
      prefix: generated.prefix,
      subject: input.subject.trim(),
      scopes: [...new Set(input.scopes ?? [])],
      createdAt: generated.createdAt,
      expiresAt: input.expiresAt,
      metadata: input.metadata
        ? { ...input.metadata }
        : undefined,
    };

    this.keys.set(record.id, record);

    return {
      ...generated,
    };
  }

  get(id: string): ApiKeyRecord | undefined {
    const record = this.keys.get(id);

    return record
      ? this.cloneRecord(record)
      : undefined;
  }

  getBySubject(
    subject: string,
  ): ApiKeyRecord[] {
    return [...this.keys.values()]
      .filter(
        (record) => record.subject === subject,
      )
      .map((record) => this.cloneRecord(record));
  }

  getAll(): ApiKeyRecord[] {
    return [...this.keys.values()].map(
      (record) => this.cloneRecord(record),
    );
  }

  revoke(id: string): ApiKeyRecord {
    const record = this.keys.get(id);

    if (!record) {
      throw new Error(
        `API key not found: ${id}`,
      );
    }

    if (!record.revokedAt) {
      record.revokedAt =
        new Date().toISOString();
    }

    return this.cloneRecord(record);
  }

  activate(id: string): ApiKeyRecord {
    const record = this.keys.get(id);

    if (!record) {
      throw new Error(
        `API key not found: ${id}`,
      );
    }

    record.revokedAt = undefined;

    return this.cloneRecord(record);
  }

  validate(
    key: string,
  ): ApiKeyValidation {
    if (!key) {
      return {
        valid: false,
        reason: "API key is required",
      };
    }

    const hash = hashApiKey(key);

    const record = [...this.keys.values()].find(
      (candidate) =>
        candidate.keyHash === hash,
    );

    if (!record) {
      return {
        valid: false,
        reason: "API key not found",
      };
    }

    if (record.revokedAt) {
      return {
        valid: false,
        reason: "API key has been revoked",
        record: this.cloneRecord(record),
      };
    }

    if (
      record.expiresAt &&
      new Date(record.expiresAt).getTime() <=
        Date.now()
    ) {
      return {
        valid: false,
        reason: "API key has expired",
        record: this.cloneRecord(record),
      };
    }

    record.lastUsedAt =
      new Date().toISOString();

    return {
      valid: true,
      record: this.cloneRecord(record),
    };
  }

  hasScope(
    key: string,
    scope: string,
  ): boolean {
    const validation = this.validate(key);

    if (!validation.valid || !validation.record) {
      return false;
    }

    return validation.record.scopes.includes(
      scope,
    );
  }

  update(
    id: string,
    updates: Partial<
      Pick<
        ApiKeyRecord,
        | "name"
        | "scopes"
        | "expiresAt"
        | "metadata"
      >
    >,
  ): ApiKeyRecord {
    const record = this.keys.get(id);

    if (!record) {
      throw new Error(
        `API key not found: ${id}`,
      );
    }

    if (
      updates.name !== undefined &&
      !updates.name.trim()
    ) {
      throw new Error(
        "API key name cannot be empty",
      );
    }

    if (updates.expiresAt) {
      this.validateExpiration(
        updates.expiresAt,
      );
    }

    if (updates.name !== undefined) {
      record.name = updates.name.trim();
    }

    if (updates.scopes !== undefined) {
      record.scopes = [
        ...new Set(updates.scopes),
      ];
    }

    if (updates.expiresAt !== undefined) {
      record.expiresAt =
        updates.expiresAt;
    }

    if (updates.metadata !== undefined) {
      record.metadata = {
        ...updates.metadata,
      };
    }

    return this.cloneRecord(record);
  }

  delete(id: string): boolean {
    return this.keys.delete(id);
  }

  clear(): void {
    this.keys.clear();
  }

  size(): number {
    return this.keys.size;
  }

  health(): ApiKeyManagerHealth {
    const records = [...this.keys.values()];

    const revokedKeyCount = records.filter(
      (record) => Boolean(record.revokedAt),
    ).length;

    const expiredKeyCount = records.filter(
      (record) =>
        Boolean(record.expiresAt) &&
        new Date(record.expiresAt!).getTime() <=
          Date.now(),
    ).length;

    return {
      healthy: true,
      keyCount: records.length,
      activeKeyCount:
        records.length -
        revokedKeyCount -
        expiredKeyCount,
      revokedKeyCount,
      expiredKeyCount,
    };
  }

  private validateExpiration(
    expiresAt: string,
  ): void {
    const timestamp =
      new Date(expiresAt).getTime();

    if (!Number.isFinite(timestamp)) {
      throw new Error(
        "Invalid API key expiration date",
      );
    }

    if (timestamp <= Date.now()) {
      throw new Error(
        "API key expiration must be in the future",
      );
    }
  }

  private cloneRecord(
    record: ApiKeyRecord,
  ): ApiKeyRecord {
    return {
      ...record,
      scopes: [...record.scopes],
      metadata: record.metadata
        ? { ...record.metadata }
        : undefined,
    };
  }
}

export const apiKeyManager =
  new ApiKeyManager();