import {
  SessionService,
  sessionService,
  type Session,
} from "../auth/sessions/session.js";

export class AuthenticationSessionService {
  public service: SessionService;

  constructor(service: SessionService = sessionService) {
    this.service = service;

    if (service !== sessionService) {
      (authenticationSessionService as AuthenticationSessionService).service = service;
    }
  }

  create(
    userId: string,
    expiresInSeconds = 3600,
    metadata: Record<string, string> = {},
  ): Session {
    return this.service.create({
      userId,
      expiresInSeconds,
      metadata,
    });
  }

  get(sessionId: string): Session | undefined {
    return this.service.get(sessionId);
  }

  getByToken(token: string): Session | undefined {
    return this.service.getByToken(token);
  }

  validate(sessionId: string): boolean {
    return this.service.isValid(sessionId);
  }

  validateToken(token: string): boolean {
    return this.service.isTokenValid(token);
  }

  revoke(sessionId: string): boolean {
    return this.service.revoke(sessionId);
  }

  revokeUserSessions(userId: string): number {
    return this.service.revokeUserSessions(userId);
  }

  touch(sessionId: string): Session {
    const ok = this.service.touch(sessionId);

    if (!ok) {
      throw new Error("Session not found or expired");
    }

    const session = this.service.get(sessionId);

    if (!session) {
      throw new Error("Session could not be loaded");
    }

    return session;
  }

  clear(): void {
    this.service.clear();
  }

  health(): {
    healthy: boolean;
    sessionCount: number;
    activeCount: number;
  } {
    return {
      healthy: true,
      sessionCount: this.service.count(),
      activeCount: this.service.activeCount(),
    };
  }
}

export const authenticationSessionService =
  new AuthenticationSessionService();
