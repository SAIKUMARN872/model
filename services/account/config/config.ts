export type AppEnvironment =
  | "development"
  | "test"
  | "staging"
  | "production";

function getEnv(name: string, defaultValue?: string): string {
  const value = process.env[name];

  if (value !== undefined && value.trim() !== "") {
    return value;
  }

  if (defaultValue !== undefined) {
    return defaultValue;
  }

  throw new Error(`Missing required environment variable: ${name}`);
}

function getNumber(name: string, defaultValue: number): number {
  const value = process.env[name];

  if (value === undefined || value.trim() === "") {
    return defaultValue;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error(`Environment variable ${name} must be a valid number`);
  }

  return parsed;
}

function getAccountPort(): number {
  if (process.env.ACCOUNT_PORT?.trim()) {
    return getNumber("ACCOUNT_PORT", 4010);
  }

  return getNumber("ACCOUNT_SERVICE_PORT", 4010);
}

export interface AppSettings {
  serviceName: string;
  serviceVersion: string;
  environment: AppEnvironment;
  host: string;
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  bcryptRounds: number;
  logLevel: string;
}

export interface AccountConfig {
  port: number;
  host: string;
  environment: string;
}

export function loadSettings(): AppSettings {
  const environment = getEnv(
    "NODE_ENV",
    "development",
  ) as AppEnvironment;

  if (
    !["development", "test", "staging", "production"].includes(environment)
  ) {
    throw new Error(`Invalid NODE_ENV: ${environment}`);
  }

  return {
    serviceName: getEnv(
      "ACCOUNT_SERVICE_NAME",
      "modelnow-account-service",
    ),
    serviceVersion: getEnv("ACCOUNT_SERVICE_VERSION", "1.0.0"),
    environment,
    host: getEnv(
      "ACCOUNT_SERVICE_HOST",
      process.env.ACCOUNT_HOST ?? "0.0.0.0",
    ),
    port: getAccountPort(),
    databaseUrl: getEnv(
      "DATABASE_URL",
      "postgresql://localhost:5432/modelnow",
    ),
    jwtSecret: getEnv("JWT_SECRET", "development-only-secret"),
    bcryptRounds: getNumber("BCRYPT_ROUNDS", 12),
    logLevel: getEnv("LOG_LEVEL", "info"),
  };
}

export function loadAccountConfig(): AccountConfig {
  const settings = loadSettings();

  return {
    port: settings.port,
    host: settings.host,
    environment: settings.environment,
  };
}
