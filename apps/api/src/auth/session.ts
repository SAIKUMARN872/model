import { randomBytes } from "node:crypto";

export type SessionSameSite = "strict" | "lax";

export interface SessionCookieOptions {
  readonly httpOnly: true;
  readonly secure: true;
  readonly sameSite: SessionSameSite;
  readonly path: "/";
  readonly maxAgeMs: number;
}

export function createSessionCookieOptions(
  maxAgeMs = 30 * 60 * 1000,
  sameSite: SessionSameSite = "lax",
): SessionCookieOptions {
  if (
    !Number.isSafeInteger(maxAgeMs) ||
    maxAgeMs < 1000 ||
    maxAgeMs > 24 * 60 * 60 * 1000
  ) {
    throw new Error("Session lifetime must be between 1 second and 24 hours.");
  }
  return Object.freeze({
    httpOnly: true,
    secure: true,
    sameSite,
    path: "/",
    maxAgeMs,
  });
}

/** Generate an opaque token; persist only its hash in a real session store. */
export function createSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export interface StoredSession {
  readonly sessionIdHash: string;
  readonly userId: string;
  readonly expiresAt: number;
}

export interface SessionStore {
  create(session: StoredSession): Promise<void>;
  get(sessionIdHash: string): Promise<StoredSession | null>;
  delete(sessionIdHash: string): Promise<void>;
}

/** Storage interface only; no session database is connected by this module. */