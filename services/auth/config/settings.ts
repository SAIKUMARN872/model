import {
  environment,
  type EnvironmentName,
} from "./environment.js";

export interface AppSettings {
  appName: string;
  version: string;
  environment: EnvironmentName;
  port: number;
  host: string;
  debug: boolean;
  logLevel: "debug" | "info" | "warn" | "error";
  apiPrefix: string;
  requestTimeoutMs: number;
}

function getNumber(
  value: string | undefined,
  fallback: number,
): number {
  if (value === undefined || value.trim() === "") {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
}

function getBoolean(
  value: string | undefined,
  fallback: boolean,
): boolean {
  if (value === undefined) {
    return fallback;
  }

  return ["true", "1", "yes", "on"].includes(
    value.toLowerCase(),
  );
}

function getLogLevel(
  value: string | undefined,
): AppSettings["logLevel"] {
  switch (value?.toLowerCase()) {
    case "debug":
      return "debug";

    case "warn":
      return "warn";

    case "error":
      return "error";

    case "info":
    default:
      return "info";
  }
}

export function loadSettings(
  env: NodeJS.ProcessEnv = process.env,
): AppSettings {
  const debugDefault = environment.isDevelopment;

  return {
    appName: env.APP_NAME ?? "ModelNow Auth Service",
    version: env.APP_VERSION ?? "1.0.0",
    environment: environment.name,
    port: getNumber(env.PORT, 3000),
    host: env.HOST ?? "0.0.0.0",
    debug: getBoolean(env.DEBUG, debugDefault),
    logLevel: getLogLevel(env.LOG_LEVEL),
    apiPrefix: env.API_PREFIX ?? "/api",
    requestTimeoutMs: getNumber(
      env.REQUEST_TIMEOUT_MS,
      30_000,
    ),
  };
}

export function validateSettings(
  settings: AppSettings,
): string[] {
  const errors: string[] = [];

  if (!settings.appName.trim()) {
    errors.push("APP_NAME cannot be empty");
  }

  if (!settings.version.trim()) {
    errors.push("APP_VERSION cannot be empty");
  }

  if (settings.port < 1 || settings.port > 65_535) {
    errors.push("PORT must be between 1 and 65535");
  }

  if (!settings.host.trim()) {
    errors.push("HOST cannot be empty");
  }

  if (!settings.apiPrefix.startsWith("/")) {
    errors.push("API_PREFIX must start with '/'");
  }

  if (settings.requestTimeoutMs <= 0) {
    errors.push(
      "REQUEST_TIMEOUT_MS must be greater than 0",
    );
  }

  return errors;
}

export const settings = loadSettings();

export function isValidSettings(
  value: AppSettings = settings,
): boolean {
  return validateSettings(value).length === 0;
}
