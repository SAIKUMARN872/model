export type EnvironmentName =
  | "development"
  | "test"
  | "staging"
  | "production";

export interface EnvironmentConfig {
  name: EnvironmentName;
  isDevelopment: boolean;
  isTest: boolean;
  isStaging: boolean;
  isProduction: boolean;
  nodeEnv: string;
  port: number;
  host: string;
}

function normalizeEnvironment(value?: string): EnvironmentName {
  const environment = (value ?? "development").trim().toLowerCase();

  switch (environment) {
    case "development":
    case "dev":
      return "development";

    case "test":
      return "test";

    case "staging":
    case "stage":
      return "staging";

    case "production":
    case "prod":
      return "production";

    default:
      throw new Error(
        `Invalid NODE_ENV: "${value}". Expected development, test, staging, or production.`,
      );
  }
}

function parsePort(value?: string): number {
  if (!value || value.trim() === "") {
    return 3000;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT: "${value}".`);
  }

  return port;
}

export function loadEnvironment(
  env: NodeJS.ProcessEnv = process.env,
): EnvironmentConfig {
  const name = normalizeEnvironment(env.NODE_ENV);
  const nodeEnv = env.NODE_ENV?.trim() || name;

  const config: EnvironmentConfig = {
    name,
    isDevelopment: name === "development",
    isTest: name === "test",
    isStaging: name === "staging",
    isProduction: name === "production",
    nodeEnv,
    port: parsePort(env.PORT),
    host: env.HOST?.trim() || "0.0.0.0",
  };

  return Object.freeze(config);
}

export const environment = loadEnvironment();