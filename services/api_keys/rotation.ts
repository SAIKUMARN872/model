import {
  ApiKeyManager,
  type ApiKeyRecord,
} from "./manager.js";

import type {
  GeneratedApiKey,
} from "./generator.js";

export interface RotateApiKeyOptions {
  revokeOldKey?: boolean;
  prefix?: string;
  scopes?: string[];
  expiresAt?: string;
}

export interface RotationResult {
  oldKeyId: string;
  newKey: GeneratedApiKey;
  oldKeyRevoked: boolean;
}

export interface RotationHealth {
  healthy: boolean;
  managerKeyCount: number;
}

export class ApiKeyRotation {
  constructor(
    private readonly manager: ApiKeyManager,
  ) {}

  rotate(
    oldKeyId: string,
    options: RotateApiKeyOptions = {},
  ): RotationResult {
    const oldRecord =
      this.manager.get(oldKeyId);

    if (!oldRecord) {
      throw new Error(
        `API key not found: ${oldKeyId}`,
      );
    }

    const created =
      this.manager.create({
        name: `${oldRecord.name}-rotated`,
        subject: oldRecord.subject,
        scopes:
          options.scopes ??
          oldRecord.scopes,
        expiresAt:
          options.expiresAt,
        metadata: oldRecord.metadata,
        prefix:
          options.prefix ??
          oldRecord.prefix,
      });

    let oldKeyRevoked = false;

    if (options.revokeOldKey !== false) {
      this.manager.revoke(oldKeyId);
      oldKeyRevoked = true;
    }

    return {
      oldKeyId,
      newKey: created,
      oldKeyRevoked,
    };
  }

  rotateWithoutImmediateRevoke(
    oldKeyId: string,
    options: Omit<
      RotateApiKeyOptions,
      "revokeOldKey"
    > = {},
  ): RotationResult {
    return this.rotate(oldKeyId, {
      ...options,
      revokeOldKey: false,
    });
  }

  revokeOldKey(
    oldKeyId: string,
  ): ApiKeyRecord {
    return this.manager.revoke(oldKeyId);
  }

  health(): RotationHealth {
    return {
      healthy: true,
      managerKeyCount: this.manager.size(),
    };
  }
}