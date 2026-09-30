import { randomBytes, randomUUID } from "node:crypto";

export type SessionStatus = "active" | "expired" | "revoked";

export interface Session {
  id: string;
  userId: string;
  token: string;
  status: SessionStatus;
  createdAt: Date;
  lastAccessedAt: Date;
  expiresAt: Date;
  metadata: Record<string, string>;
}

export interface CreateSessionInput {
  userId: string;
  expiresInSeconds?: number;
  metadata?: Record<string, string>;
}

export class SessionService {
  private readonly sessions = new Map<string, Session>();

  create(input: CreateSessionInput): Session {
    const userId = input.userId.trim();

    if (!userId) {
      throw new Error("User ID is required");
    }

    const expiresInSeconds = input.expiresInSeconds ?? 3600;

    if (expiresInSeconds <= 0) {
      throw new Error("Session expiration must be greater than zero");
    }

    const now = new Date();

    const session: Session = {
      id: randomUUID(),
      userId,
      token: randomBytes(32).toString("hex"),
      status: "active",
      createdAt: now,
      lastAccessedAt: now,
      expiresAt: new Date(
        now.getTime() + expiresInSeconds * 1000,
      ),
      metadata: {
        ...(input.metadata ?? {}),
      },
    };

    this.sessions.set(session.id, this.clone(session));

    return this.clone(session);
  }

  get(id: string): Session | undefined {
    const session = this.sessions.get(id);

    if (!session) {
      return undefined;
    }

    this.refreshStatus(session);

    return this.clone(session);
  }

  getByToken(token: string): Session | undefined {
    const session = [...this.sessions.values()].find(
      (item) => item.token === token,
    );

    if (!session) {
      return undefined;
    }

    this.refreshStatus(session);

    return this.clone(session);
  }

  getUserSessions(userId: string): Session[] {
    const normalizedUserId = userId.trim();

    return [...this.sessions.values()]
      .filter((session) => session.userId === normalizedUserId)
      .map((session) => {
        this.refreshStatus(session);
        return this.clone(session);
      });
  }

  getActiveUserSessions(userId: string): Session[] {
    return this.getUserSessions(userId).filter(
      (session) => session.status === "active",
    );
  }

  touch(id: string): boolean {
    const session = this.sessions.get(id);

    if (!session) {
      return false;
    }

    this.refreshStatus(session);

    if (session.status !== "active") {
      return false;
    }

    session.lastAccessedAt = new Date();
    this.sessions.set(id, this.clone(session));

    return true;
  }

  revoke(id: string): boolean {
    const session = this.sessions.get(id);

    if (!session) {
      return false;
    }

    session.status = "revoked";
    this.sessions.set(id, this.clone(session));

    return true;
  }

  revokeUserSessions(userId: string): number {
    const normalizedUserId = userId.trim();
    let count = 0;

    for (const [id, session] of this.sessions.entries()) {
      if (
        session.userId === normalizedUserId &&
        session.status === "active"
      ) {
        session.status = "revoked";
        this.sessions.set(id, this.clone(session));
        count++;
      }
    }

    return count;
  }

  isValid(id: string): boolean {
    const session = this.sessions.get(id);

    if (!session) {
      return false;
    }

    this.refreshStatus(session);

    return session.status === "active";
  }

  isTokenValid(token: string): boolean {
    const session = this.getByToken(token);

    return session?.status === "active";
  }

  delete(id: string): boolean {
    return this.sessions.delete(id);
  }

  cleanupExpired(): number {
    let count = 0;

    for (const [id, session] of this.sessions.entries()) {
      this.refreshStatus(session);

      if (session.status === "expired") {
        this.sessions.delete(id);
        count++;
      }
    }

    return count;
  }

  count(): number {
    return this.sessions.size;
  }

  activeCount(): number {
    let count = 0;

    for (const session of this.sessions.values()) {
      this.refreshStatus(session);

      if (session.status === "active") {
        count++;
      }
    }

    return count;
  }

  clear(): void {
    this.sessions.clear();
  }

  health(): {
    healthy: boolean;
    sessionCount: number;
    activeSessionCount: number;
  } {
    return {
      healthy: true,
      sessionCount: this.count(),
      activeSessionCount: this.activeCount(),
    };
  }

  private refreshStatus(session: Session): void {
    if (
      session.status === "active" &&
      session.expiresAt.getTime() <= Date.now()
    ) {
      session.status = "expired";
      this.sessions.set(session.id, this.clone(session));
    }
  }

  private clone(session: Session): Session {
    return {
      ...session,
      createdAt: new Date(session.createdAt),
      lastAccessedAt: new Date(session.lastAccessedAt),
      expiresAt: new Date(session.expiresAt),
      metadata: {
        ...session.metadata,
      },
    };
  }
}

export const sessionService = new SessionService();
