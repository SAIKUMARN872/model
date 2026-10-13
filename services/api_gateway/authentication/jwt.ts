export interface JwtPayload {
  sub: string;
  issuer?: string;
  audience?: string;
  expiresAt: number;
  issuedAt: number;
  claims: Record<string, unknown>;
}

export class JwtService {
  constructor(private readonly secret: string) {
    if (!secret.trim()) {
      throw new Error("JWT secret is required");
    }
  }

  sign(
    subject: string,
    claims: Record<string, unknown> = {},
    ttlSeconds = 3600,
  ): string {
    if (!subject.trim()) {
      throw new Error("JWT subject is required");
    }

    if (!Number.isInteger(ttlSeconds) || ttlSeconds <= 0) {
      throw new Error("JWT TTL must be a positive integer");
    }

    const now = Math.floor(Date.now() / 1000);

    const payload: JwtPayload = {
      sub: subject,
      issuedAt: now,
      expiresAt: now + ttlSeconds,
      claims: { ...claims },
    };

    const encoded = Buffer.from(
      JSON.stringify(payload),
    ).toString("base64url");

    const signature = Buffer.from(
      `${encoded}.${this.secret}`,
    ).toString("base64url");

    return `${encoded}.${signature}`;
  }

  verify(token: string): JwtPayload {
    const parts = token.split(".");

    if (parts.length !== 2) {
      throw new Error("Invalid JWT");
    }

    const [encoded, signature] = parts;

    const expected = Buffer.from(
      `${encoded}.${this.secret}`,
    ).toString("base64url");

    if (signature !== expected) {
      throw new Error("Invalid JWT signature");
    }

    let payload: JwtPayload;

    try {
      payload = JSON.parse(
        Buffer.from(encoded, "base64url").toString("utf8"),
      ) as JwtPayload;
    } catch {
      throw new Error("Invalid JWT payload");
    }

    if (
      !payload.sub ||
      !Number.isFinite(payload.expiresAt)
    ) {
      throw new Error("Invalid JWT payload");
    }

    if (
      Math.floor(Date.now() / 1000) >= payload.expiresAt
    ) {
      throw new Error("JWT expired");
    }

    return {
      ...payload,
      claims: { ...payload.claims },
    };
  }
}
