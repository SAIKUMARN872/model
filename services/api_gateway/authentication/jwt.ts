declare const process:
  | {
      getBuiltinModule?: (id: string) => unknown;
    }
  | undefined;

type BufferLike = Uint8Array & {
  toString(encoding?: string): string;
  length: number;
};

declare const Buffer: {
  from(data: string | Uint8Array | ArrayBuffer, encoding?: string): BufferLike;
};

function getNodeCrypto(): {
  createHmac: (
    algorithm: string,
    key: string,
  ) => {
    update(data: string, encoding: string): {
      digest(outputEncoding: string): string;
    };
  };
  timingSafeEqual: (
    a: Uint8Array | BufferLike,
    b: Uint8Array | BufferLike,
  ) => boolean;
} | null {
  const runtime = globalThis as typeof globalThis & {
    process?: typeof process;
  };

  if (runtime.process && typeof runtime.process.getBuiltinModule === "function") {
    try {
      const cryptoModule = runtime.process.getBuiltinModule("node:crypto") as {
        createHmac?: (
          algorithm: string,
          key: string,
        ) => {
          update(data: string, encoding: string): {
            digest(outputEncoding: string): string;
          };
        };
        timingSafeEqual?: (
          a: Uint8Array | BufferLike,
          b: Uint8Array | BufferLike,
        ) => boolean;
      } | null;

      if (cryptoModule && cryptoModule.createHmac && cryptoModule.timingSafeEqual) {
        return cryptoModule as unknown as {
          createHmac: (
            algorithm: string,
            key: string,
          ) => {
            update(data: string, encoding: string): {
              digest(outputEncoding: string): string;
            };
          };
          timingSafeEqual: (
            a: Uint8Array | BufferLike,
            b: Uint8Array | BufferLike,
          ) => boolean;
        };
      }
    } catch {
      // Ignore and fall through to the next fallback.
    }
  }

  return null;
}

export interface JwtPayload {
  sub: string;
  organizationId: string;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
  [key: string]: unknown;
}

export interface JwtOptions {
  secret: string;
  issuer?: string;
  audience?: string;
  expiresInSeconds?: number;
}

export interface JwtVerifyOptions {
  issuer?: string;
  audience?: string;
  clockToleranceSeconds?: number;
}

export interface JwtServiceHealth {
  healthy: boolean;
  algorithm: string;
  issuer?: string;
  audience?: string;
}

type JwtHeader = {
  alg: "HS256";
  typ: "JWT";
};

function base64UrlEncode(value: string): string {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(value: string): string {
  const normalized = value
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const padding = normalized.length % 4;

  return Buffer.from(
    padding === 0 ? normalized : normalized + "=".repeat(4 - padding),
    "base64",
  ).toString("utf8");
}

function signValue(value: string, secret: string): string {
  const cryptoModule = getNodeCrypto();

  if (!cryptoModule) {
    throw new Error("Crypto support is unavailable in this runtime");
  }

  return base64UrlEncode(
    cryptoModule
      .createHmac("sha256", secret)
      .update(value, "utf8")
      .digest("base64"),
  );
}

function safeCompare(left: string, right: string): boolean {
  const cryptoModule = getNodeCrypto();

  if (!cryptoModule) {
    throw new Error("Crypto support is unavailable in this runtime");
  }

  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return cryptoModule.timingSafeEqual(leftBuffer, rightBuffer);
}

function assertNonEmpty(value: string, field: string): void {
  if (!value.trim()) {
    throw new Error(`${field} cannot be empty`);
  }
}

export class JwtService {
  private readonly secret: string;
  private readonly issuer?: string;
  private readonly audience?: string;
  private readonly expiresInSeconds: number;

  constructor(options: JwtOptions) {
    assertNonEmpty(options.secret, "JWT secret");

    if (options.expiresInSeconds !== undefined) {
      if (
        !Number.isFinite(options.expiresInSeconds) ||
        options.expiresInSeconds <= 0
      ) {
        throw new Error("expiresInSeconds must be greater than zero");
      }
    }

    this.secret = options.secret;
    this.issuer = options.issuer;
    this.audience = options.audience;
    this.expiresInSeconds = options.expiresInSeconds ?? 3600;
  }

  generateToken(
    input: Omit<JwtPayload, "iat" | "exp"> & Partial<Pick<JwtPayload, "iat" | "exp">>,
  ): string {
    const now = Math.floor(Date.now() / 1000);

    const payload = {
      ...input,
      iat: input.iat ?? now,
      exp: input.exp ?? now + this.expiresInSeconds,
    } as JwtPayload;

    if (!payload.sub?.trim()) {
      throw new Error("JWT subject cannot be empty");
    }

    if (!payload.organizationId?.trim()) {
      throw new Error("organizationId cannot be empty");
    }

    if (!Array.isArray(payload.roles)) {
      throw new Error("roles must be an array");
    }

    if (!Array.isArray(payload.permissions)) {
      throw new Error("permissions must be an array");
    }

    const header: JwtHeader = {
      alg: "HS256",
      typ: "JWT",
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));

    const unsignedToken = `${encodedHeader}.${encodedPayload}`;
    const signature = signValue(unsignedToken, this.secret);

    return `${unsignedToken}.${signature}`;
  }

  verifyToken(
    token: string,
    options: JwtVerifyOptions = {},
  ): JwtPayload {
    if (!token.trim()) {
      throw new Error("JWT token cannot be empty");
    }

    const parts = token.split(".");

    if (parts.length !== 3) {
      throw new Error("Invalid JWT format");
    }

    const [encodedHeader, encodedPayload, signature] = parts;

    let header: JwtHeader;
    let payload: JwtPayload;

    try {
      header = JSON.parse(
        base64UrlDecode(encodedHeader),
      ) as JwtHeader;

      payload = JSON.parse(
        base64UrlDecode(encodedPayload),
      ) as JwtPayload;
    } catch {
      throw new Error("Invalid JWT encoding");
    }

    if (header.alg !== "HS256" || header.typ !== "JWT") {
      throw new Error("Unsupported JWT header");
    }

    const expectedSignature = signValue(
      `${encodedHeader}.${encodedPayload}`,
      this.secret,
    );

    if (!safeCompare(signature, expectedSignature)) {
      throw new Error("Invalid JWT signature");
    }

    if (
      typeof payload.sub !== "string" ||
      typeof payload.organizationId !== "string" ||
      !Array.isArray(payload.roles) ||
      !Array.isArray(payload.permissions)
    ) {
      throw new Error("Invalid JWT payload");
    }

    if (
      typeof payload.iat !== "number" ||
      typeof payload.exp !== "number"
    ) {
      throw new Error("JWT must contain iat and exp");
    }

    const now = Math.floor(Date.now() / 1000);
    const tolerance = options.clockToleranceSeconds ?? 0;

    if (payload.exp + tolerance < now) {
      throw new Error("JWT token has expired");
    }

    if (payload.iat - tolerance > now) {
      throw new Error("JWT issued-at time is invalid");
    }

    const expectedIssuer = options.issuer ?? this.issuer;

    if (
      expectedIssuer !== undefined &&
      payload.iss !== expectedIssuer
    ) {
      throw new Error("Invalid JWT issuer");
    }

    const expectedAudience = options.audience ?? this.audience;

    if (
      expectedAudience !== undefined &&
      payload.aud !== expectedAudience
    ) {
      throw new Error("Invalid JWT audience");
    }

    return { ...payload };
  }

  decodeToken(token: string): {
    header: JwtHeader;
    payload: JwtPayload;
  } {
    const parts = token.split(".");

    if (parts.length !== 3) {
      throw new Error("Invalid JWT format");
    }

    try {
      return {
        header: JSON.parse(
          base64UrlDecode(parts[0]),
        ) as JwtHeader,

        payload: JSON.parse(
          base64UrlDecode(parts[1]),
        ) as JwtPayload,
      };
    } catch {
      throw new Error("Invalid JWT encoding");
    }
  }

  health(): JwtServiceHealth {
    return {
      healthy: Boolean(this.secret),
      algorithm: "HS256",
      issuer: this.issuer,
      audience: this.audience,
    };
  }
}