import { createHmac } from "node:crypto";

export interface JwtHeader {
  alg: "HS256";
  typ: "JWT";
}

export type JwtPayload = Record<string, unknown>;

export interface JwtEncodeOptions {
  secret: string;
  expiresInSeconds?: number;
  issuer?: string;
  audience?: string;
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function sign(
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

export function encodeJwt(
  payload: JwtPayload,
  options: JwtEncodeOptions,
): string {
  if (!options.secret) {
    throw new Error("JWT secret is required");
  }

  if (options.secret.length < 16) {
    throw new Error(
      "JWT secret must contain at least 16 characters",
    );
  }

  const now = Math.floor(Date.now() / 1000);

  const header: JwtHeader = {
    alg: "HS256",
    typ: "JWT",
  };

  const finalPayload: JwtPayload = {
    ...payload,
    iat:
      typeof payload.iat === "number"
        ? payload.iat
        : now,
  };

  if (
    options.expiresInSeconds !== undefined &&
    finalPayload.exp === undefined
  ) {
    if (options.expiresInSeconds <= 0) {
      throw new Error(
        "expiresInSeconds must be greater than 0",
      );
    }

    finalPayload.exp =
      now + options.expiresInSeconds;
  }

  if (
    options.issuer !== undefined &&
    finalPayload.iss === undefined
  ) {
    finalPayload.iss = options.issuer;
  }

  if (
    options.audience !== undefined &&
    finalPayload.aud === undefined
  ) {
    finalPayload.aud = options.audience;
  }

  const encodedHeader = base64UrlEncode(
    JSON.stringify(header),
  );

  const encodedPayload = base64UrlEncode(
    JSON.stringify(finalPayload),
  );

  const unsignedToken =
    `${encodedHeader}.${encodedPayload}`;

  const signature = sign(
    unsignedToken,
    options.secret,
  );

  return `${unsignedToken}.${signature}`;
}
