function generateId(): string {
  const cryptoApi =
    typeof globalThis !== "undefined" &&
    "crypto" in globalThis &&
    globalThis.crypto &&
    typeof globalThis.crypto.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return cryptoApi;
}

export interface Session {
  id: string;
  userId: string;
  organizationId: string;
  roles: string[];
  permissions: string[];
  createdAt: number;
  expiresAt: number;
  lastAccessedAt: number;
  metadata: Record<string, unknown>;
}

export interface CreateSessionInput {
  userId: string;
  organizationId: string;
  roles?: string[];
  permissions?: string[];
  metadata?: Record<string, unknown>;
  ttlMs?: number;
}

export interface SessionFilter {
  userId?: string;
  organizationId?: string;
  activeOnly?: boolean;
}

export interface SessionOptions {
  defaultTtlMs?: number;
  maxSessions?: number;
}

export interface SessionHealth {
  healthy: boolean;
  connected: boolean;
  sessionCount: number;
  organizationCount: number;
  userCount: number;
}

function assertNonEmpty(value: string, field: string): void {
  if (!value.trim()) {
    throw new Error(`${field} cannot be empty`);
  }
}

function cloneMetadata(
  metadata: Record<string, unknown>,
): Record<string, unknown> {
  return JSON.parse(JSON.stringify(metadata)) as Record<
    string,
    unknown
  >;
}

function cloneSession(session: Session): Session {
  return {
    ...session,
    roles: [...session.roles],
    permissions: [...session.permissions],
    metadata: cloneMetadata(session.metadata),
  };
}

export class SessionStore {
  private readonly sessions = new Map<string, Session>();

  private readonly defaultTtlMs: number;
  private readonly maxSessions: number;

  private connected = false;

  constructor(options: SessionOptions = {}) {
    this.defaultTtlMs = options.defaultTtlMs ?? 60 * 60 * 1000;
    this.maxSessions = options.maxSessions ?? 10000;

    if (this.defaultTtlMs <= 0) {
      throw new Error("defaultTtlMs must be greater than zero");
    }

    if (
      !Number.isInteger(this.maxSessions) ||
      this.maxSessions <= 0
    ) {
      throw new Error("maxSessions must be greater than zero");
    }
  }

  connect(): void {
    this.connected = true;
  }

  disconnect(): void {
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  create(input: CreateSessionInput): Session {
    this.ensureConnected();

    assertNonEmpty(input.userId, "userId");
    assertNonEmpty(
      input.organizationId,
      "organizationId",
    );

    const ttlMs = input.ttlMs ?? this.defaultTtlMs;

    if (!Number.isFinite(ttlMs) || ttlMs <= 0) {
      throw new Error("ttlMs must be greater than zero");
    }

    this.cleanupExpired();

    if (this.sessions.size >= this.maxSessions) {
      this.removeOldestSession();
    }

    const now = Date.now();

    const session: Session = {
      id: generateId(),
      userId: input.userId,
      organizationId: input.organizationId,
      roles: [...(input.roles ?? [])],
      permissions: [...(input.permissions ?? [])],
      createdAt: now,
      expiresAt: now + ttlMs,
      lastAccessedAt: now,
      metadata: cloneMetadata(input.metadata ?? {}),
    };

    this.sessions.set(session.id, session);

    return cloneSession(session);
  }

  getById(sessionId: string): Session | undefined {
    this.ensureConnected();

    this.cleanupExpired();

    const session = this.sessions.get(sessionId);

    if (!session) {
      return undefined;
    }

    session.lastAccessedAt = Date.now();

    return cloneSession(session);
  }

  find(filter: SessionFilter = {}): Session[] {
    this.ensureConnected();

    this.cleanupExpired();

    const result: Session[] = [];

    for (const session of this.sessions.values()) {
      if (
        filter.userId !== undefined &&
        session.userId !== filter.userId
      ) {
        continue;
      }

      if (
        filter.organizationId !== undefined &&
        session.organizationId !== filter.organizationId
      ) {
        continue;
      }

      if (
        filter.activeOnly === true &&
        !this.isActive(session)
      ) {
        continue;
      }

      result.push(cloneSession(session));
    }

    return result;
  }

  revoke(sessionId: string): boolean {
    this.ensureConnected();

    return this.sessions.delete(sessionId);
  }

  revokeUserSessions(userId: string): number {
    this.ensureConnected();

    assertNonEmpty(userId, "userId");

    let count = 0;

    for (const [id, session] of this.sessions) {
      if (session.userId === userId) {
        this.sessions.delete(id);
        count += 1;
      }
    }

    return count;
  }

  revokeOrganizationSessions(
    organizationId: string,
  ): number {
    this.ensureConnected();

    assertNonEmpty(
      organizationId,
      "organizationId",
    );

    let count = 0;

    for (const [id, session] of this.sessions) {
      if (session.organizationId === organizationId) {
        this.sessions.delete(id);
        count += 1;
      }
    }

    return count;
  }

  refresh(
    sessionId: string,
    ttlMs?: number,
  ): Session {
    this.ensureConnected();

    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new Error("Session not found");
    }

    if (!this.isActive(session)) {
      this.sessions.delete(sessionId);
      throw new Error("Session has expired");
    }

    const duration = ttlMs ?? this.defaultTtlMs;

    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error("ttlMs must be greater than zero");
    }

    const now = Date.now();

    session.expiresAt = now + duration;
    session.lastAccessedAt = now;

    return cloneSession(session);
  }

  isActive(session: Session): boolean {
    return session.expiresAt > Date.now();
  }

  size(): number {
    this.cleanupExpired();
    return this.sessions.size;
  }

  clear(): void {
    this.sessions.clear();
  }

  clearOrganization(organizationId: string): number {
    assertNonEmpty(
      organizationId,
      "organizationId",
    );

    let count = 0;

    for (const [id, session] of this.sessions) {
      if (session.organizationId === organizationId) {
        this.sessions.delete(id);
        count += 1;
      }
    }

    return count;
  }

  health(): SessionHealth {
    this.cleanupExpired();

    const organizations = new Set<string>();
    const users = new Set<string>();

    for (const session of this.sessions.values()) {
      organizations.add(session.organizationId);
      users.add(session.userId);
    }

    return {
      healthy: this.connected,
      connected: this.connected,
      sessionCount: this.sessions.size,
      organizationCount: organizations.size,
      userCount: users.size,
    };
  }

  private ensureConnected(): void {
    if (!this.connected) {
      throw new Error("Session store is not connected");
    }
  }

  private cleanupExpired(): void {
    const now = Date.now();

    for (const [id, session] of this.sessions) {
      if (session.expiresAt <= now) {
        this.sessions.delete(id);
      }
    }
  }

  private removeOldestSession(): void {
    let oldestId: string | undefined;
    let oldestTimestamp = Number.POSITIVE_INFINITY;

    for (const [id, session] of this.sessions) {
      if (session.createdAt < oldestTimestamp) {
        oldestTimestamp = session.createdAt;
        oldestId = id;
      }
    }

    if (oldestId !== undefined) {
      this.sessions.delete(oldestId);
    }
  }
}