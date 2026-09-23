import type { EnvironmentName } from "./environment.js";

export interface ApplicationSettings {
  appName: string;
  version: string;
  environment: EnvironmentName;

  server: {
    host: string;
    port: number;
  };

  security: {
    jwtSecret: string;
    jwtIssuer: string;
    jwtAudience: string;
    sessionTtlSeconds: number;
  };

  api: {
    prefix: string;
    requestTimeoutMs: number;
    maxBodySizeMb: number;
  };

  logging: {
    level: "debug" | "info" | "warn" | "error";
  };

  cors: {
    enabled: boolean;
    origins: string[];
  };
}

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();

  if (["true", "1", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["false", "0", "no", "off"].includes(normalized)) {
    return false;
  }

  throw new Error(`Invalid boolean value: "${value}".`);
}

function parsePositiveInteger(
  value: string | undefined,
  defaultValue: number,
  fieldName: string,
): number {
  if (value === undefined || value.trim() === "") {
    return defaultValue;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${fieldName}: "${value}".`);
  }

  return parsed;
}

function parseLogLevel(
  value: string | undefined,
): "debug" | "info" | "warn" | "error" {
  const level = value?.trim().toLowerCase() || "info";

  if (!["debug", "info", "warn", "error"].includes(level)) {
    throw new Error(
      `Invalid LOG_LEVEL: "${value}". Expected debug, info, warn, or error.`,
    );
  }

  return level as "debug" | "info" | "warn" | "error";
}

function parseOrigins(value: string | undefined): string[] {
  if (!value || value.trim() === "") {
    return ["*"];
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function createSettings(
  env: NodeJS.ProcessEnv = process.env,
): ApplicationSettings {
  const environmentName = (
    env.NODE_ENV?.trim().toLowerCase() || "development"
  ) as ApplicationSettings["environment"];

  const jwtSecret = env.JWT_SECRET?.trim() || "development-only-secret";

  if (
    environmentName === "production" &&
    jwtSecret === "development-only-secret"
  ) {
    throw new Error(
      "JWT_SECRET must be configured when NODE_ENV=production.",
    );
  }

  const settings: ApplicationSettings = {
    appName: env.APP_NAME?.trim() || "ModelNow API Gateway",
    version: env.APP_VERSION?.trim() || "1.0.0",
    environment: environmentName,

    server: {
      host: env.HOST?.trim() || "0.0.0.0",
      port: parsePositiveInteger(env.PORT, 3000, "PORT"),
    },

    security: {
      jwtSecret,
      jwtIssuer: env.JWT_ISSUER?.trim() || "modelnow",
      jwtAudience: env.JWT_AUDIENCE?.trim() || "modelnow-api",
      sessionTtlSeconds: parsePositiveInteger(
        env.SESSION_TTL_SECONDS,
        3600,
        "SESSION_TTL_SECONDS",
      ),
    },

    api: {
      prefix: env.API_PREFIX?.trim() || "/api/v1",
      requestTimeoutMs: parsePositiveInteger(
        env.REQUEST_TIMEOUT_MS,
        30000,
        "REQUEST_TIMEOUT_MS",
      ),
      maxBodySizeMb: parsePositiveInteger(
        env.MAX_BODY_SIZE_MB,
        10,
        "MAX_BODY_SIZE_MB",
      ),
    },

    logging: {
      level: parseLogLevel(env.LOG_LEVEL),
    },

    cors: {
      enabled: parseBoolean(env.CORS_ENABLED, true),
      origins: parseOrigins(env.CORS_ORIGINS),
    },
  };

  return Object.freeze(settings);
}

export const settings = createSettings();