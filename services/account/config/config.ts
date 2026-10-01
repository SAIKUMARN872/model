/// <reference types="node" />

export type EnvironmentName =
  | "development"
  | "test"
  | "staging"
  | "production";

export interface AuthConfig {
  environment: EnvironmentName;

  jwt: {
    secret: string;
    issuer: string;
    audience: string;
    expiresInSeconds: number;
  };

  session: {
    expiresInSeconds: number;
    maxActiveSessionsPerUser: number;
  };

  password: {
    minLength: number;
    maxLength: number;
  };

  mfa: {
    enabled: boolean;
    issuer: string;
  };

  oauth: {
    google: {
      enabled: boolean;
      clientId: string;
      clientSecret: string;
      redirectUri: string;
    };
    github: {
      enabled: boolean;
      clientId: string;
      clientSecret: string;
      redirectUri: string;
    };
  };

  security: {
    encryptionKey: string;
    maxLoginAttempts: number;
    lockoutDurationSeconds: number;
  };
}

function getEnv(name: string, fallback: string): string {
  const value = process.env[name];

  if (value === undefined || value.trim() === "") {
    return fallback;
  }

  return value.trim();
}

function getNumberEnv(name: string, fallback: number): number {
  const value = process.env[name];

  if (value === undefined || value.trim() === "") {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid numeric environment variable: ${name}`);
  }

  return parsed;
}

function getBooleanEnv(name: string, fallback: boolean): boolean {
  const value = process.env[name];

  if (value === undefined || value.trim() === "") {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();

  if (
    normalized === "true" ||
    normalized === "1" ||
    normalized === "yes" ||
    normalized === "on"
  ) {
    return true;
  }

  if (
    normalized === "false" ||
    normalized === "0" ||
    normalized === "no" ||
    normalized === "off"
  ) {
    return false;
  }

  throw new Error(`Invalid boolean environment variable: ${name}`);
}

function getEnvironment(): EnvironmentName {
  const value = getEnv("NODE_ENV", "development").toLowerCase();

  switch (value) {
    case "development":
    case "test":
    case "staging":
    case "production":
      return value;

    default:
      throw new Error(`Unsupported NODE_ENV: ${value}`);
  }
}

export function loadAuthConfig(): AuthConfig {
  const environment = getEnvironment();

  return {
    environment,

    jwt: {
      secret: getEnv(
        "AUTH_JWT_SECRET",
        "modelnow-development-jwt-secret-change-me",
      ),
      issuer: getEnv("AUTH_JWT_ISSUER", "modelnow"),
      audience: getEnv("AUTH_JWT_AUDIENCE", "modelnow-api"),
      expiresInSeconds: getNumberEnv(
        "AUTH_JWT_EXPIRES_IN_SECONDS",
        3600,
      ),
    },

    session: {
      expiresInSeconds: getNumberEnv(
        "AUTH_SESSION_EXPIRES_IN_SECONDS",
        86400,
      ),
      maxActiveSessionsPerUser: getNumberEnv(
        "AUTH_MAX_ACTIVE_SESSIONS",
        5,
      ),
    },

    password: {
      minLength: getNumberEnv("AUTH_PASSWORD_MIN_LENGTH", 8),
      maxLength: getNumberEnv("AUTH_PASSWORD_MAX_LENGTH", 128),
    },

    mfa: {
      enabled: getBooleanEnv("AUTH_MFA_ENABLED", true),
      issuer: getEnv("AUTH_MFA_ISSUER", "ModelNow"),
    },

    oauth: {
      google: {
        enabled: getBooleanEnv("AUTH_GOOGLE_ENABLED", false),
        clientId: getEnv("GOOGLE_CLIENT_ID", ""),
        clientSecret: getEnv("GOOGLE_CLIENT_SECRET", ""),
        redirectUri: getEnv(
          "GOOGLE_REDIRECT_URI",
          "http://localhost:3000/auth/google/callback",
        ),
      },

      github: {
        enabled: getBooleanEnv("AUTH_GITHUB_ENABLED", false),
        clientId: getEnv("GITHUB_CLIENT_ID", ""),
        clientSecret: getEnv("GITHUB_CLIENT_SECRET", ""),
        redirectUri: getEnv(
          "GITHUB_REDIRECT_URI",
          "http://localhost:3000/auth/github/callback",
        ),
      },
    },

    security: {
      encryptionKey: getEnv(
        "AUTH_ENCRYPTION_KEY",
        "modelnow-development-encryption-key",
      ),
      maxLoginAttempts: getNumberEnv("AUTH_MAX_LOGIN_ATTEMPTS", 5),
      lockoutDurationSeconds: getNumberEnv(
        "AUTH_LOCKOUT_DURATION_SECONDS",
        900,
      ),
    },
  };
}

export function validateAuthConfig(config: AuthConfig): void {
  if (!config.jwt.secret || config.jwt.secret.length < 16) {
    throw new Error(
      "AUTH_JWT_SECRET must contain at least 16 characters",
    );
  }

  if (!config.jwt.issuer.trim()) {
    throw new Error("JWT issuer is required");
  }

  if (!config.jwt.audience.trim()) {
    throw new Error("JWT audience is required");
  }

  if (config.jwt.expiresInSeconds <= 0) {
    throw new Error("JWT expiration must be greater than zero");
  }

  if (config.session.expiresInSeconds <= 0) {
    throw new Error("Session expiration must be greater than zero");
  }

  if (config.session.maxActiveSessionsPerUser <= 0) {
    throw new Error("Maximum active sessions must be greater than zero");
  }

  if (
    config.password.minLength < 1 ||
    config.password.maxLength < config.password.minLength
  ) {
    throw new Error("Invalid password length configuration");
  }

  if (
    !config.security.encryptionKey ||
    config.security.encryptionKey.length < 16
  ) {
    throw new Error(
      "AUTH_ENCRYPTION_KEY must contain at least 16 characters",
    );
  }

  if (config.security.maxLoginAttempts <= 0) {
    throw new Error("Maximum login attempts must be greater than zero");
  }

  if (config.security.lockoutDurationSeconds <= 0) {
    throw new Error("Lockout duration must be greater than zero");
  }

  if (config.oauth.google.enabled) {
    if (
      !config.oauth.google.clientId ||
      !config.oauth.google.clientSecret
    ) {
      throw new Error(
        "Google OAuth requires client ID and client secret",
      );
    }
  }

  if (config.oauth.github.enabled) {
    if (
      !config.oauth.github.clientId ||
      !config.oauth.github.clientSecret
    ) {
      throw new Error(
        "GitHub OAuth requires client ID and client secret",
      );
    }
  }
}

export const authConfig: AuthConfig = loadAuthConfig();

if (authConfig.environment !== "test") {
  validateAuthConfig(authConfig);
}
