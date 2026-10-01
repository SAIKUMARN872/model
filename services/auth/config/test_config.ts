import {
  createAuthSettings,
  loadAuthConfig,
  validateAuthConfig,
  validateSettings,
} from "./index.js";

let passed = 0;

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }

  console.log(`PASS: ${message}`);
  passed++;
}

function assertThrows(
  callback: () => void,
  message: string
): void {
  let thrown = false;

  try {
    callback();
  } catch {
    thrown = true;
  }

  assert(thrown, message);
}

const config = loadAuthConfig();

assert(
  config.environment === "development" ||
    config.environment === "test" ||
    config.environment === "staging" ||
    config.environment === "production",
  "Environment is valid"
);

assert(
  config.jwt.secret.length >= 16,
  "JWT secret has minimum length"
);

assert(
  config.jwt.issuer.length > 0,
  "JWT issuer is configured"
);

assert(
  config.jwt.audience.length > 0,
  "JWT audience is configured"
);

assert(
  config.jwt.expiresInSeconds > 0,
  "JWT expiration is positive"
);

assert(
  config.session.expiresInSeconds > 0,
  "Session expiration is positive"
);

assert(
  config.session.maxActiveSessionsPerUser > 0,
  "Maximum active sessions is positive"
);

assert(
  config.password.minLength > 0,
  "Password minimum length is positive"
);

assert(
  config.password.maxLength >= config.password.minLength,
  "Password maximum length is valid"
);

assert(
  config.mfa.issuer.length > 0,
  "MFA issuer is configured"
);

assert(
  config.security.encryptionKey.length >= 16,
  "Encryption key has minimum length"
);

assert(
  config.security.maxLoginAttempts > 0,
  "Maximum login attempts is positive"
);

assert(
  config.security.lockoutDurationSeconds > 0,
  "Lockout duration is positive"
);

validateAuthConfig(config);
assert(true, "Authentication configuration validates");

const settings = createAuthSettings(config);

assert(
  settings.jwtIssuer === config.jwt.issuer,
  "Settings contain JWT issuer"
);

assert(
  settings.jwtAudience === config.jwt.audience,
  "Settings contain JWT audience"
);

assert(
  settings.jwtExpiresInSeconds ===
    config.jwt.expiresInSeconds,
  "Settings contain JWT expiration"
);

assert(
  settings.sessionExpiresInSeconds ===
    config.session.expiresInSeconds,
  "Settings contain session expiration"
);

assert(
  settings.maxActiveSessionsPerUser ===
    config.session.maxActiveSessionsPerUser,
  "Settings contain session limit"
);

assert(
  validateSettings(settings),
  "Authentication settings are valid"
);

assertThrows(
  () =>
    validateAuthConfig({
      ...config,
      jwt: {
        ...config.jwt,
        secret: "short",
      },
    }),
  "Invalid JWT secret is rejected"
);

assertThrows(
  () =>
    validateAuthConfig({
      ...config,
      session: {
        ...config.session,
        expiresInSeconds: 0,
      },
    }),
  "Invalid session expiration is rejected"
);

assertThrows(
  () =>
    validateAuthConfig({
      ...config,
      password: {
        minLength: 20,
        maxLength: 10,
      },
    }),
  "Invalid password range is rejected"
);

assertThrows(
  () =>
    validateAuthConfig({
      ...config,
      security: {
        ...config.security,
        encryptionKey: "short",
      },
    }),
  "Invalid encryption key is rejected"
);

assert(
  settings.environment === config.environment,
  "Settings preserve environment"
);

console.log(`\nAll config tests passed: ${passed}`);
