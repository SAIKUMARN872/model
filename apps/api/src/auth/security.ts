export const SUPPORTED_JWT_ALGORITHMS = ["RS256", "PS256", "ES256"] as const;
export type SupportedJwtAlgorithm = typeof SUPPORTED_JWT_ALGORITHMS[number];

export interface JwtAuthenticationConfigInput {
  readonly issuer: string;
  readonly audience: string;
  readonly jwksUrl: string;
  readonly algorithms?: readonly SupportedJwtAlgorithm[];
  readonly clockToleranceSeconds?: number;
}

export interface JwtAuthenticationConfig {
  readonly issuer: string;
  readonly audience: string;
  readonly jwksUrl: string;
  readonly algorithms: readonly SupportedJwtAlgorithm[];
  readonly clockToleranceSeconds: number;
}

function nonEmpty(value: string, name: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${name} is required.`);
  }
  return value.trim();
}

function safeHttpsUrl(value: string, name: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${name} must be a valid HTTPS URL.`);
  }
  if (url.protocol !== "https:" || url.username || url.password || url.hash) {
    throw new Error(`${name} must be a safe HTTPS URL.`);
  }
  return url.toString();
}

export function createJwtAuthenticationConfig(
  input: JwtAuthenticationConfigInput,
): JwtAuthenticationConfig {
  const issuer = nonEmpty(input.issuer, "issuer");
  safeHttpsUrl(issuer, "issuer");
  const jwksUrl = safeHttpsUrl(nonEmpty(input.jwksUrl, "jwksUrl"), "jwksUrl");
  const audience = nonEmpty(input.audience, "audience");
  const algorithms = input.algorithms ?? ["RS256"];

  if (
    algorithms.length === 0 ||
    algorithms.some(a => !SUPPORTED_JWT_ALGORITHMS.includes(a)) ||
    new Set(algorithms).size !== algorithms.length
  ) {
    throw new Error("JWT algorithms are empty, duplicated, or unsupported.");
  }

  const clockToleranceSeconds = input.clockToleranceSeconds ?? 5;
  if (
    !Number.isInteger(clockToleranceSeconds) ||
    clockToleranceSeconds < 0 ||
    clockToleranceSeconds > 60
  ) {
    throw new Error("Clock tolerance must be between 0 and 60 seconds.");
  }

  return Object.freeze({
    issuer,
    audience,
    jwksUrl,
    algorithms: Object.freeze([...algorithms]),
    clockToleranceSeconds,
  });
}

export interface OAuthConfigurationInput {
  readonly issuer: string;
  readonly clientId: string;
  readonly redirectUri: string;
  readonly scopes?: readonly string[];
}

export interface OAuthConfiguration {
  readonly issuer: string;
  readonly clientId: string;
  readonly redirectUri: string;
  readonly scopes: readonly string[];
}

export function createOAuthConfiguration(
  input: OAuthConfigurationInput,
): OAuthConfiguration {
  const issuer = nonEmpty(input.issuer, "issuer");
  safeHttpsUrl(issuer, "issuer");
  const clientId = nonEmpty(input.clientId, "clientId");
  const redirectUri = safeHttpsUrl(
    nonEmpty(input.redirectUri, "redirectUri"),
    "redirectUri",
  );
  const scopes = input.scopes ?? ["openid", "profile"];

  if (!scopes.includes("openid") || scopes.some(s => !s.trim())) {
    throw new Error("OAuth scopes must be valid and include openid.");
  }

  return Object.freeze({
    issuer,
    clientId,
    redirectUri,
    scopes: Object.freeze([...new Set(scopes)]),
  });
}
