export interface Session {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
  metadata: Record<string, unknown>;
}

export class SessionManager {
  private readonly sessions = new Map<string, Session>();

  create(
    id: string,
    userId: string,
    ttlMs = 3600000,
    metadata: Record<string, unknown> = {},
  ): Session {
    if (!id.trim() || !userId.trim()) {
      throw new Error("Session ID and user ID are required");
    }

    if (!Number.isFinite(ttlMs) || ttlMs <= 0) {
      throw new Error("Session TTL must be positive");
    }

    if (this.sessions.has(id)) {
      throw new Error("Session already exists");
    }

    const session: Session = {
      id,
      userId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(
        Date.now() + ttlMs,
      ).toISOString(),
      metadata: structuredClone(metadata),
    };

    this.sessions.set(id, session);

    return structuredClone(session);
  }

  get(id: string): Session | undefined {
    const session = this.sessions.get(id);

    if (!session) {
      return undefined;
    }

    if (
      Date.now() >=
      new Date(session.expiresAt).getTime()
    ) {
      this.sessions.delete(id);
      return undefined;
    }

    return structuredClone(session);
  }

  destroy(id: string): boolean {
    return this.sessions.delete(id);
  }

  clear(): void {
    this.sessions.clear();
  }
}
