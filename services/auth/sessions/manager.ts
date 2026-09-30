import {
  SessionService,
  sessionService,
  type CreateSessionInput,
  type Session,
} from "./session.js";

export interface SessionManagerOptions {
  service?: SessionService;
}

export class SessionManager {
  private readonly service: SessionService;

  constructor(options: SessionManagerOptions = {}) {
    this.service = options.service ?? sessionService;
  }

  createSession(input: CreateSessionInput): Session {
    return this.service.create(input);
  }

  getSession(id: string): Session | undefined {
    return this.service.get(id);
  }

  getSessionByToken(token: string): Session | undefined {
    return this.service.getByToken(token);
  }

  getUserSessions(userId: string): Session[] {
    return this.service.getUserSessions(userId);
  }

  getActiveUserSessions(userId: string): Session[] {
    return this.service.getActiveUserSessions(userId);
  }

  validateSession(id: string): boolean {
    return this.service.isValid(id);
  }

  validateToken(token: string): boolean {
    return this.service.isTokenValid(token);
  }

  refreshSession(id: string): boolean {
    return this.service.touch(id);
  }

  revokeSession(id: string): boolean {
    return this.service.revoke(id);
  }

  revokeUserSessions(userId: string): number {
    return this.service.revokeUserSessions(userId);
  }

  deleteSession(id: string): boolean {
    return this.service.delete(id);
  }

  cleanupExpired(): number {
    return this.service.cleanupExpired();
  }

  count(): number {
    return this.service.count();
  }

  activeCount(): number {
    return this.service.activeCount();
  }

  health() {
    return this.service.health();
  }

  clear(): void {
    this.service.clear();
  }
}

export const sessionManager = new SessionManager();
