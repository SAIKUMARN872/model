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
}

function normalizeEnvironment(
  value: string | undefined,
): EnvironmentName {
  switch ((value ?? "development").toLowerCase()) {
    case "test":
      return "test";

    case "staging":
      return "staging";

    case "production":
    case "prod":
      return "production";

    case "development":
    case "dev":
    default:
      return "development";
  }
}

export function getEnvironment(
  value?: string,
): EnvironmentConfig {
  const nodeEnv = value ?? process.env.NODE_ENV ?? "development";
  const name = normalizeEnvironment(nodeEnv);

  return {
    name,
    isDevelopment: name === "development",
    isTest: name === "test",
    isStaging: name === "staging",
    isProduction: name === "production",
    nodeEnv,
  };
}

export const environment = getEnvironment();
