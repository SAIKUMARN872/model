import {
  authConfig,
  validateAuthConfig,
  type AuthConfig,
  type EnvironmentName,
} from "./config.js";

export interface AuthSettings {
  environment: EnvironmentName;
  jwtIssuer: string;
  jwtAudience: string;
  jwtExpiresInSeconds: number;
  sessionExpiresInSeconds: number;
  maxActiveSessionsPerUser: number;
  passwordMinLength: number;
  passwordMaxLength: number;
  mfaEnabled: boolean;
  mfaIssuer: string;
  googleOAuthEnabled: boolean;
  githubOAuthEnabled: boolean;
  maxLoginAttempts: number;
  lockoutDurationSeconds: number;
}

export function createAuthSettings(
  config: AuthConfig = authConfig
): AuthSettings {
  return {
    environment: config.environment,
    jwtIssuer: config.jwt.issuer,
    jwtAudience: config.jwt.audience,
    jwtExpiresInSeconds: config.jwt.expiresInSeconds,
    sessionExpiresInSeconds:
      config.session.expiresInSeconds,
    maxActiveSessionsPerUser:
      config.session.maxActiveSessionsPerUser,
    passwordMinLength: config.password.minLength,
    passwordMaxLength: config.password.maxLength,
    mfaEnabled: config.mfa.enabled,
    mfaIssuer: config.mfa.issuer,
    googleOAuthEnabled: config.oauth.google.enabled,
    githubOAuthEnabled: config.oauth.github.enabled,
    maxLoginAttempts: config.security.maxLoginAttempts,
    lockoutDurationSeconds:
      config.security.lockoutDurationSeconds,
  };
}

export function validateSettings(
  settings: AuthSettings
): boolean {
  return (
    settings.jwtExpiresInSeconds > 0 &&
    settings.sessionExpiresInSeconds > 0 &&
    settings.maxActiveSessionsPerUser > 0 &&
    settings.passwordMinLength > 0 &&
    settings.passwordMaxLength >=
      settings.passwordMinLength &&
    settings.maxLoginAttempts > 0 &&
    settings.lockoutDurationSeconds > 0 &&
    settings.jwtIssuer.trim().length > 0 &&
    settings.jwtAudience.trim().length > 0 &&
    settings.mfaIssuer.trim().length > 0
  );
}

export function validateConfig(
  config: AuthConfig = authConfig
): void {
  validateAuthConfig(config);
}

export const authSettings = createAuthSettings();

if (!validateSettings(authSettings)) {
  throw new Error("Invalid authentication settings");
}
