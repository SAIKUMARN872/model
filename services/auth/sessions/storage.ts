import type { Session } from "./session.js";

export interface SessionStorage {
  save(session: Session): void;
  get(id: string): Session | undefined;
  getByToken(token: string): Session | undefined;
  delete(id: string): boolean;
  list(): Session[];
  clear(): void;
  count(): number;
}

function cloneSession(session: Session): Session {
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

export class MemorySessionStorage implements SessionStorage {
  private readonly sessions = new Map<string, Session>();

  save(session: Session): void {
    this.sessions.set(
      session.id,
      cloneSession(session),
    );
  }

  get(id: string): Session | undefined {
    const session = this.sessions.get(id);

    return session ? cloneSession(session) : undefined;
  }

  getByToken(token: string): Session | undefined {
    const session = [...this.sessions.values()].find(
      (item) => item.token === token,
    );

    return session ? cloneSession(session) : undefined;
  }

  delete(id: string): boolean {
    return this.sessions.delete(id);
  }

  list(): Session[] {
    return [...this.sessions.values()].map(cloneSession);
  }

  clear(): void {
    this.sessions.clear();
  }

  count(): number {
    return this.sessions.size;
  }
}

export const sessionStorage = new MemorySessionStorage();
