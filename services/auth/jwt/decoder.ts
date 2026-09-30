import type {
  JwtHeader,
  JwtPayload,
} from "./encoder.js";

export interface DecodedJwt {
  header: JwtHeader;
  payload: JwtPayload;
  signature: string;
  encodedHeader: string;
  encodedPayload: string;
}

function base64UrlDecode(
  value: string,
): string {
  const normalized = value
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const padding =
    normalized.length % 4 === 0
      ? ""
      : "=".repeat(4 - (normalized.length % 4));

  return Buffer.from(
    normalized + padding,
    "base64",
  ).toString("utf8");
}

export function decodeJwt(
  token: string,
): DecodedJwt {
  if (!token || !token.trim()) {
    throw new Error("JWT token is required");
  }

  const parts = token.split(".");

  if (parts.length !== 3) {
    throw new Error(
      "Invalid JWT format",
    );
  }

  const [
    encodedHeader,
    encodedPayload,
    signature,
  ] = parts;

  try {
    const header = JSON.parse(
      base64UrlDecode(encodedHeader),
    ) as JwtHeader;

    const payload = JSON.parse(
      base64UrlDecode(encodedPayload),
    ) as JwtPayload;

    if (
      header.alg !== "HS256" ||
      header.typ !== "JWT"
    ) {
      throw new Error(
        "Unsupported JWT header",
      );
    }

    return {
      header,
      payload,
      signature,
      encodedHeader,
      encodedPayload,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "Unsupported JWT header"
    ) {
      throw error;
    }

    throw new Error(
      "Invalid JWT encoding",
    );
  }
}
