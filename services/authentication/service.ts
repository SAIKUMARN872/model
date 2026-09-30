import {
  userService,
  type User,
} from "../auth/users/user.js";

import {
  passwordValidator,
} from "../auth/password/validator.js";

import {
  authenticationJwtService,
} from "./jwt.js";

import {
  authenticationSessionService,
} from "./session.js";

import {
  authenticationOAuthService,
} from "./oauth.js";

import {
  AuthenticationPasswordService,
} from "./password.js";

const passwordService =
  new AuthenticationPasswordService();

export interface RegisterInput {
  email: string;
  name: string;
  password: string;
  roles?: string[];
  metadata?: Record<string, unknown>;
}

export interface LoginInput {
  email: string;
  password: string;
  sessionExpiresInSeconds?: number;
}

export interface AuthenticationResult {
  authenticated: boolean;
  user: User;
  accessToken: string;
  sessionToken: string;
  sessionId: string;
}

export interface AuthenticationHealth {
  healthy: boolean;
  users: number;
  activeSessions: number;
}

export class AuthenticationService {
  register(input: RegisterInput): User {
    const validation = passwordValidator.validate(input.password);

    if (!validation.valid) {
      throw new Error(validation.errors.join("; "));
    }

    if (!input.email.trim()) {
      throw new Error("Email is required");
    }

    if (!input.name.trim()) {
      throw new Error("Name is required");
    }

    const normalizedEmail = input.email.trim().toLowerCase();

    if (userService.findByEmail(normalizedEmail)) {
      throw new Error(
        `User already exists: ${normalizedEmail}`,
      );
    }

    const passwordHash = passwordService.hash(
      input.password,
    );

    return userService.create({
      email: normalizedEmail,
      name: input.name.trim(),
      passwordHash: JSON.stringify(passwordHash),
      roles: input.roles ?? ["user"],
      metadata: input.metadata ?? {},
    });
  }

  login(input: LoginInput): AuthenticationResult {
    const user = userService.findByEmail(input.email);

    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (user.status !== "active") {
      throw new Error("User account is not active");
    }

    if (!user.passwordHash) {
      throw new Error("Password authentication is not configured");
    }

    const passwordValid = passwordService.verify(
      input.password,
      user.passwordHash,
    );

    if (!passwordValid) {
      throw new Error("Invalid email or password");
    }

    const accessToken = authenticationJwtService.sign(
      user.id,
      user.email,
      user.roles,
      input.sessionExpiresInSeconds ?? 3600,
    );

    const session = authenticationSessionService.create(
      user.id,
      input.sessionExpiresInSeconds ?? 3600,
    );

    userService.recordLogin(user.id);

    return {
      authenticated: true,
      user: userService.getRequiredById(user.id),
      accessToken,
      sessionToken: session.token,
      sessionId: session.id,
    };
  }

  authenticateToken(token: string): User {
    const payload = authenticationJwtService.verify(token);

    const user = userService.getRequiredById(payload.sub);

    if (user.status !== "active") {
      throw new Error("User account is not active");
    }

    return user;
  }

  authenticateSession(token: string): User {
    const session = authenticationSessionService.getByToken(token);

    if (!session) {
      throw new Error("Session not found");
    }

    if (!authenticationSessionService.validateToken(token)) {
      throw new Error("Session is invalid or expired");
    }

    const user = userService.getRequiredById(session.userId);

    if (user.status !== "active") {
      throw new Error("User account is not active");
    }

    return user;
  }

  logout(sessionId: string): boolean {
    return authenticationSessionService.revoke(sessionId);
  }

  logoutAll(userId: string): number {
    return authenticationSessionService.revokeUserSessions(userId);
  }

  refreshSession(sessionId: string): SessionResult {
    const session = authenticationSessionService.touch(sessionId);

    const user = userService.getRequiredById(session.userId);

    const accessToken = authenticationJwtService.sign(
      user.id,
      user.email,
      user.roles,
      3600,
    );

    return {
      accessToken,
      sessionToken: session.token,
      sessionId: session.id,
      user,
    };
  }

  getOAuthAuthorizationUrl(
    provider: "google" | "github",
  ): string {
    const state = authenticationOAuthService.createState(provider);

    return authenticationOAuthService.getAuthorizationUrl(
      provider,
      state,
    );
  }

  health(): AuthenticationHealth {
    const sessionHealth =
      authenticationSessionService.health();

    return {
      healthy: sessionHealth.healthy,
      users: userService.count(),
      activeSessions: sessionHealth.activeCount,
    };
  }

  clear(): void {
    authenticationSessionService.clear();
    userService.clear();
  }
}

export interface SessionResult {
  accessToken: string;
  sessionToken: string;
  sessionId: string;
  user: User;
}

export const authenticationService =
  new AuthenticationService();
