import { createHmac, timingSafeEqual } from "node:crypto";

import {
  decodeJwt,
  type DecodedJwt,
} from "./decoder.js";

export interface JwtValidationOptions {
  secret: string;
  issuer?: string;
  audience?: string;
  clockToleranceSeconds?: number;
}

export interface JwtValidationResult {
  valid: boolean;
  payload?: Record<string, unknown>;
  error?: string;
  decoded?: DecodedJwt;
}

function createSignature(
  data: string,
  secret: string,
): string {
  return createHmac("sha256", secret)
    .update(data)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function signaturesMatch(
  expected: string,
  actual: string,
): boolean {
  const expectedBuffer =
    Buffer.from(expected, "utf8");

  const actualBuffer =
    Buffer.from(actual, "utf8");

  if (
    expectedBuffer.length !== actualBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(
    expectedBuffer,
    actualBuffer,
  );
}

export function validateJwt(
  token: string,
  options: JwtValidationOptions,
): JwtValidationResult {
  try {
    if (!options.secret) {
      return {
        valid: false,
        error: "JWT secret is required",
      };
    }

    if (options.secret.length < 16) {
      return {
        valid: false,
        error:
          "JWT secret must contain at least 16 characters",
      };
    }

    const decoded = decodeJwt(token);

    const data =
      `${decoded.encodedHeader}.${decoded.encodedPayload}`;

    const expectedSignature = createSignature(
      data,
      options.secret,
    );

    if (
      !signaturesMatch(
        expectedSignature,
        decoded.signature,
      )
    ) {
      return {
        valid: false,
        error: "Invalid JWT signature",
        decoded,
      };
    }

    const now = Math.floor(
      Date.now() / 1000,
    );

    const tolerance =
      options.clockToleranceSeconds ?? 0;

    const payload = decoded.payload;

    if (typeof payload.exp === "number") {
      if (now > payload.exp + tolerance) {
        return {
          valid: false,
          error: "JWT has expired",
          decoded,
        };
      }
    }

    if (typeof payload.nbf === "number") {
      if (now + tolerance < payload.nbf) {
        return {
          valid: false,
          error:
            "JWT is not active yet",
          decoded,
        };
      }
    }

    if (
      options.issuer !== undefined &&
      payload.iss !== options.issuer
    ) {
      return {
        valid: false,
        error: "Invalid JWT issuer",
        decoded,
      };
    }

    if (
      options.audience !== undefined &&
      payload.aud !== options.audience
    ) {
      return {
        valid: false,
        error: "Invalid JWT audience",
        decoded,
      };
    }

    return {
      valid: true,
      payload,
      decoded,
    };
  } catch (error) {
    return {
      valid: false,
      error:
        error instanceof Error
          ? error.message
          : "Invalid JWT",
    };
  }
}

export function isJwtValid(
  token: string,
  options: JwtValidationOptions,
): boolean {
  return validateJwt(token, options).valid;
}
