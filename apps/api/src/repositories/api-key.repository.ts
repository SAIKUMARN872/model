import type { QueryResultRow } from "pg";
import { BaseRepository, type QueryExecutor } from "./base.repository.js";

export interface ApiKeyOwner {
  readonly userId: string | null;
  readonly organizationId: string | null;
}

export interface CreateStoredApiKey {
  readonly owner: ApiKeyOwner;
  readonly name: string;
  readonly keyPrefix: string;
  readonly secretHash: string;
  readonly scopes: readonly string[];
  readonly expiresAt?: Date;
}

export interface StoredApiKey extends QueryResultRow {
  readonly id: string;
  readonly userId: string | null;
  readonly organizationId: string | null;
  readonly name: string;
  readonly keyPrefix: string;
  readonly scopes: readonly string[];
  readonly createdAt: Date;
  readonly expiresAt: Date | null;
  readonly lastUsedAt: Date | null;
  readonly revokedAt: Date | null;
}

interface ApiKeyRow extends StoredApiKey {
  readonly secretHash?: string;
}

const RETURNING_COLUMNS = `
  id::text AS "id",
  user_id::text AS "userId",
  organization_id::text AS "organizationId",
  name,
  key_prefix AS "keyPrefix",
  scopes,
  created_at AS "createdAt",
  expires_at AS "expiresAt",
  last_used_at AS "lastUsedAt",
  revoked_at AS "revokedAt"
`;

function validateOwner(owner: ApiKeyOwner): void {
  if (
    !owner ||
    (owner.userId === null && owner.organizationId === null) ||
    (owner.userId !== null &&
      (typeof owner.userId !== "string" || !owner.userId.trim())) ||
    (owner.organizationId !== null &&
      (typeof owner.organizationId !== "string" ||
        !owner.organizationId.trim()))
  ) {
    throw new TypeError("A valid user or organization owner is required.");
  }
}

function validateHash(hash: string): void {
  if (!/^[a-f0-9]{64}$/.test(hash)) {
    throw new TypeError("API key hash must be a SHA-256 hex digest.");
  }
}

function validateScopes(scopes: readonly string[]): void {
  if (
    !Array.isArray(scopes) ||
    scopes.some(
      (scope) => typeof scope !== "string" || scope.trim().length === 0,
    ) ||
    new Set(scopes).size !== scopes.length
  ) {
    throw new TypeError("API key scopes must be unique, non-empty strings.");
  }
}

function mapRow(row: ApiKeyRow): StoredApiKey {
  return {
    id: row.id,
    userId: row.userId,
    organizationId: row.organizationId,
    name: row.name,
    keyPrefix: row.keyPrefix,
    scopes: [...row.scopes],
    createdAt: new Date(row.createdAt),
    expiresAt: row.expiresAt === null ? null : new Date(row.expiresAt),
    lastUsedAt: row.lastUsedAt === null ? null : new Date(row.lastUsedAt),
    revokedAt: row.revokedAt === null ? null : new Date(row.revokedAt),
  };
}

/**
 * PostgreSQL persistence for ModelNow API keys.
 * Raw API-key secrets are never accepted or returned by this repository.
 */
export class ApiKeyRepository extends BaseRepository {
  public constructor(executor: QueryExecutor) {
    super(executor);
  }

  public async create(input: CreateStoredApiKey): Promise<StoredApiKey> {
    validateOwner(input.owner);

    if (typeof input.name !== "string" || !input.name.trim()) {
      throw new TypeError("API key name is required.");
    }
    if (
      typeof input.keyPrefix !== "string" ||
      !input.keyPrefix.trim() ||
      input.keyPrefix.length > 64
    ) {
      throw new TypeError("API key prefix is invalid.");
    }

    validateHash(input.secretHash);
    validateScopes(input.scopes);

    if (
      input.expiresAt !== undefined &&
      (!Number.isFinite(input.expiresAt.getTime()) ||
        input.expiresAt.getTime() <= Date.now())
    ) {
      throw new TypeError("API key expiration must be in the future.");
    }

    const row = await this.queryOne<ApiKeyRow>(
      `INSERT INTO api_keys
         (user_id, organization_id, name, key_prefix, secret_hash, scopes, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)
       RETURNING ${RETURNING_COLUMNS}`,
      [
        input.owner.userId,
        input.owner.organizationId,
        input.name.trim(),
        input.keyPrefix,
        input.secretHash,
        JSON.stringify(input.scopes),
        input.expiresAt ?? null,
      ],
    );

    if (!row) {
      throw new Error("Database did not return the created API key.");
    }

    return mapRow(row);
  }

  /**
   * Atomically validates an active key and records its use.
   * Raw key material must never be passed to this repository.
   */
  public async authenticateAndMarkUsed(
    secretHash: string,
  ): Promise<StoredApiKey | null> {
    validateHash(secretHash);

    const row = await this.queryOne<ApiKeyRow>(
      `UPDATE api_keys
       SET last_used_at = now()
       WHERE secret_hash = $1
         AND revoked_at IS NULL
         AND (expires_at IS NULL OR expires_at > now())
       RETURNING ${RETURNING_COLUMNS}`,
      [secretHash],
    );

    return row ? mapRow(row) : null;
  }
  /**
   * SHA-256 is computed by the caller. The unique secret_hash index supports
   * exact lookup without scanning or comparing every stored key.
   */
  public async findActiveByHash(
    secretHash: string,
  ): Promise<StoredApiKey | null> {
    validateHash(secretHash);

    const row = await this.queryOne<ApiKeyRow>(
      `SELECT ${RETURNING_COLUMNS}
       FROM api_keys
       WHERE secret_hash = $1
         AND revoked_at IS NULL
         AND (expires_at IS NULL OR expires_at > now())
       LIMIT 1`,
      [secretHash],
    );

    return row ? mapRow(row) : null;
  }

  public async listForOwner(
    owner: ApiKeyOwner,
  ): Promise<StoredApiKey[]> {
    validateOwner(owner);

    const rows = await this.query<ApiKeyRow>(
      `SELECT ${RETURNING_COLUMNS}
       FROM api_keys
       WHERE user_id IS NOT DISTINCT FROM $1::uuid
         AND organization_id IS NOT DISTINCT FROM $2::uuid
       ORDER BY created_at DESC, id DESC`,
      [owner.userId, owner.organizationId],
    );

    return rows.rows.map(mapRow);
  }

  public async revokeForOwner(
    id: string,
    owner: ApiKeyOwner,
  ): Promise<boolean> {
    validateOwner(owner);

    if (typeof id !== "string" || !id.trim()) {
      throw new TypeError("API key ID is required.");
    }

    const affected = await this.execute(
      `UPDATE api_keys
       SET revoked_at = now()
       WHERE id = $1::uuid
         AND user_id IS NOT DISTINCT FROM $2::uuid
         AND organization_id IS NOT DISTINCT FROM $3::uuid
         AND revoked_at IS NULL`,
      [id, owner.userId, owner.organizationId],
    );

    return affected === 1;
  }

  public async markUsed(id: string): Promise<boolean> {
    if (typeof id !== "string" || !id.trim()) {
      throw new TypeError("API key ID is required.");
    }

    const affected = await this.execute(
      `UPDATE api_keys
       SET last_used_at = now()
       WHERE id = $1::uuid
         AND revoked_at IS NULL
         AND (expires_at IS NULL OR expires_at > now())`,
      [id],
    );

    return affected === 1;
  }
}