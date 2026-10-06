// services/account/config/settings.ts

export type AppEnvironment =
  | "development"
  | "test"
  | "staging"
  | "production";

function getEnv(
  name: string,
  defaultValue?: string,
): string {
  const value = process.env[name];

  if (value !== undefined && value.trim() !== "") {
    return value;
  }

  if (defaultValue !== undefined) {
    return defaultValue;
  }

  throw new Error(`Missing required environment variable: ${name}`);
}

function getNumber(
  name: string,
  defaultValue: number,
): number {
  const value = process.env[name];

  if (!value) {
    return defaultValue;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error(
      `Environment variable ${name} must be a valid number`,
    );
  }

  return parsed;
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

export function loadSettings(): AppSettings {
  const environment = getEnv(
    "NODE_ENV",
    "development",
  ) as AppEnvironment;

  if (
    ![
      "development",
      "test",
      "staging",
      "production",
    ].includes(environment)
  ) {
    throw new Error(
      `Invalid NODE_ENV: ${environment}`,
    );
  }

  return {
    serviceName: getEnv(
      "ACCOUNT_SERVICE_NAME",
      "modelnow-account-service",
    ),

    serviceVersion: getEnv(
      "ACCOUNT_SERVICE_VERSION",
      "1.0.0",
    ),

    environment,

    host: getEnv(
      "ACCOUNT_SERVICE_HOST",
      "0.0.0.0",
    ),

    port: getNumber(
      "ACCOUNT_SERVICE_PORT",
      4001,
    ),

    databaseUrl: getEnv(
      "DATABASE_URL",
      "postgresql://localhost:5432/modelnow",
    ),

    jwtSecret: getEnv(
      "JWT_SECRET",
      "development-only-secret",
    ),

    bcryptRounds: getNumber(
      "BCRYPT_ROUNDS",
      12,
    ),

    logLevel: getEnv(
      "LOG_LEVEL",
      "info",
    ),
  };
}