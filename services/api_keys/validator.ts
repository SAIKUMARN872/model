import {
  hashApiKey,
} from "./generator.js";

import {
  ApiKeyManager,
  type ApiKeyRecord,
} from "./manager.js";

export interface ApiKeyValidationRequest {
  key: string;
  requiredScopes?: string[];
}

export interface ApiKeyValidationResult {
  valid: boolean;
  authenticated: boolean;
  subject?: string;
  keyId?: string;
  scopes: string[];
  reason?: string;
  record?: ApiKeyRecord;
}

export interface ApiKeyValidatorOptions {
  requiredPrefix?: string;
}

export class ApiKeyValidator {
  constructor(
    private readonly manager: ApiKeyManager,
    private readonly options: ApiKeyValidatorOptions = {},
  ) {}

  validate(
    request: ApiKeyValidationRequest,
  ): ApiKeyValidationResult {
    if (!request.key) {
      return {
        valid: false,
        authenticated: false,
        scopes: [],
        reason: "API key is required",
      };
    }

    if (
      this.options.requiredPrefix &&
      !request.key.startsWith(
        `${this.options.requiredPrefix}_`,
      )
    ) {
      return {
        valid: false,
        authenticated: false,
        scopes: [],
        reason: "Invalid API key prefix",
      };
    }

    const result =
      this.manager.validate(request.key);

    if (!result.valid || !result.record) {
      return {
        valid: false,
        authenticated: false,
        scopes: [],
        reason:
          result.reason ??
          "Invalid API key",
      };
    }

    const record = result.record;

    const requiredScopes =
      request.requiredScopes ?? [];

    const hasRequiredScopes =
      requiredScopes.every((scope) =>
        record.scopes.includes(scope),
      );

    if (!hasRequiredScopes) {
      return {
        valid: false,
        authenticated: true,
        subject: record.subject,
        keyId: record.id,
        scopes: [...record.scopes],
        reason: "Required scope is missing",
        record,
      };
    }

    return {
      valid: true,
      authenticated: true,
      subject: record.subject,
      keyId: record.id,
      scopes: [...record.scopes],
      record,
    };
  }

  validateScope(
    key: string,
    scope: string,
  ): boolean {
    return this.validate({
      key,
      requiredScopes: [scope],
    }).valid;
  }

  fingerprint(key: string): string {
    return hashApiKey(key).slice(0, 16);
  }

  health(): {
    healthy: boolean;
    managerKeyCount: number;
  } {
    return {
      healthy: true,
      managerKeyCount: this.manager.size(),
    };
  }
}