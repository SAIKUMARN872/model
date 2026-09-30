import {
  encodeJwt,
  type JwtEncodeOptions,
  type JwtPayload,
} from "./encoder.js";

import {
  decodeJwt,
  type DecodedJwt,
} from "./decoder.js";

import {
  validateJwt,
  isJwtValid,
  type JwtValidationOptions,
  type JwtValidationResult,
} from "./validator.js";

export interface JwtServiceOptions {
  secret: string;
  issuer?: string;
  audience?: string;
  expiresInSeconds?: number;
  clockToleranceSeconds?: number;
}

export class JwtService {
  private readonly options: JwtServiceOptions;

  constructor(
    options: JwtServiceOptions,
  ) {
    if (!options.secret) {
      throw new Error(
        "JWT secret is required",
      );
    }

    if (options.secret.length < 16) {
      throw new Error(
        "JWT secret must contain at least 16 characters",
      );
    }

    this.options = {
      ...options,
    };
  }

  sign(payload: JwtPayload): string {
    return encodeJwt(payload, {
      secret: this.options.secret,
      expiresInSeconds:
        this.options.expiresInSeconds,
      issuer: this.options.issuer,
      audience: this.options.audience,
    });
  }

  decode(token: string): DecodedJwt {
    return decodeJwt(token);
  }

  verify(
    token: string,
  ): JwtValidationResult {
    const validationOptions: JwtValidationOptions = {
      secret: this.options.secret,
      issuer: this.options.issuer,
      audience: this.options.audience,
      clockToleranceSeconds:
        this.options.clockToleranceSeconds,
    };

    return validateJwt(
      token,
      validationOptions,
    );
  }

  isValid(token: string): boolean {
    return isJwtValid(token, {
      secret: this.options.secret,
      issuer: this.options.issuer,
      audience: this.options.audience,
      clockToleranceSeconds:
        this.options.clockToleranceSeconds,
    });
  }
}

export const jwt = new JwtService({
  secret:
    process.env.JWT_SECRET ??
    "development-secret-key-123456",
  issuer: process.env.JWT_ISSUER,
  audience: process.env.JWT_AUDIENCE,
  expiresInSeconds: 3600,
});
