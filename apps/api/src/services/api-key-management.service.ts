import { createHash, randomBytes } from "node:crypto";
import { ApiError } from "../errors/api.error.js";
import type {
  ApiKeyOwner,
  CreateStoredApiKey,
  StoredApiKey,
} from "../repositories/api-key.repository.js";
import type { AuthenticatedPrincipal } from "../types/request.types.js";

export interface ApiKeyManagementRepository {
  create(input: CreateStoredApiKey): Promise<StoredApiKey>;
  listForOwner(owner: ApiKeyOwner): Promise<StoredApiKey[]>;
  revokeForOwner(id: string, owner: ApiKeyOwner): Promise<boolean>;
}

export interface ApiKeyManagementIdentityRepository {
  findActiveByAuthSubject(
    authSubject: string,
  ): Promise<{ readonly userId: string } | null>;
}

export interface CreateCustomerApiKeyInput {
  readonly name: string;
  readonly expiresAt?: string;
}

export interface CreatedCustomerApiKey {
  readonly key: string;
  readonly id: string;
  readonly name: string;
  readonly keyPrefix: string;
  readonly scopes: readonly string[];
  readonly createdAt: Date;
  readonly expiresAt: Date | null;
}

const CUSTOMER_KEY_PREFIX = "mn_";
const CUSTOMER_KEY_BYTES = 32;
const ALLOWED_SCOPES = ["inference:invoke"] as const;

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function safeMetadata(key: StoredApiKey): Omit<StoredApiKey, "secretHash"> {
  const { secretHash: _secretHash, ...metadata } = key as StoredApiKey & {
    readonly secretHash?: string;
  };
  return metadata;
}

export class ApiKeyManagementService {
  public constructor(
    private readonly keys: ApiKeyManagementRepository,
    private readonly identities: ApiKeyManagementIdentityRepository,
  ) {}

  private async resolveOwner(
    principal: AuthenticatedPrincipal,
  ): Promise<ApiKeyOwner> {
    if (!principal.userId || typeof principal.userId !== "string") {
      throw new ApiError(401, "UNAUTHENTICATED", "Authentication is required.");
    }

    const identity = await this.identities.findActiveByAuthSubject(
      principal.userId,
    );

    if (!identity) {
      throw new ApiError(403, "ACTIVE_USER_REQUIRED", "An active user account is required.");
    }

    return { userId: identity.userId, organizationId: null };
  }

  public async create(
    principal: AuthenticatedPrincipal,
    input: CreateCustomerApiKeyInput,
  ): Promise<CreatedCustomerApiKey> {
    if (!input || typeof input.name !== "string") {
      throw new ApiError(400, "INVALID_API_KEY_INPUT", "A key name is required.");
    }

    const name = input.name.trim();
    if (name.length < 1 || name.length > 100) {
      throw new ApiError(400, "INVALID_API_KEY_NAME", "The key name must be 1–100 characters.");
    }

    let expiresAt: Date | undefined;
    if (input.expiresAt !== undefined) {
      if (typeof input.expiresAt !== "string" || input.expiresAt.trim() === "") {
        throw new ApiError(400, "INVALID_API_KEY_EXPIRY", "Expiry must be a valid future date.");
      }

      const timestamp = Date.parse(input.expiresAt);
      if (!Number.isFinite(timestamp) || timestamp <= Date.now()) {
        throw new ApiError(400, "INVALID_API_KEY_EXPIRY", "Expiry must be a valid future date.");
      }
      expiresAt = new Date(timestamp);
    }

    const owner = await this.resolveOwner(principal);
    const secret = `${CUSTOMER_KEY_PREFIX}${randomBytes(CUSTOMER_KEY_BYTES).toString("base64url")}`;
    const keyPrefix = secret.slice(0, 11);

    const stored = await this.keys.create({
      owner,
      name,
      keyPrefix,
      secretHash: sha256(secret),
      scopes: ALLOWED_SCOPES,
      ...(expiresAt ? { expiresAt } : {}),
    });

    return {
      key: secret,
      id: stored.id,
      name: stored.name,
      keyPrefix: stored.keyPrefix,
      scopes: stored.scopes,
      createdAt: stored.createdAt,
      expiresAt: stored.expiresAt,
    };
  }

  public async list(
    principal: AuthenticatedPrincipal,
  ): Promise<readonly Omit<StoredApiKey, "secretHash">[]> {
    const owner = await this.resolveOwner(principal);
    const keys = await this.keys.listForOwner(owner);
    return keys.map((key) => safeMetadata(key));
  }

  public async revoke(
    principal: AuthenticatedPrincipal,
    id: string,
  ): Promise<void> {
    if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      throw new ApiError(400, "INVALID_API_KEY_ID", "A valid API-key ID is required.");
    }

    const owner = await this.resolveOwner(principal);
    const revoked = await this.keys.revokeForOwner(id, owner);

    if (!revoked) {
      throw new ApiError(404, "API_KEY_NOT_FOUND", "The API key was not found or is already revoked.");
    }
  }
}

export { sha256 as hashCustomerApiKey };