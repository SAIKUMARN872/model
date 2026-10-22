import { createRemoteJWKSet, jwtVerify } from "jose";
import type { JWTVerifyGetKey } from "jose";
import { InvalidCredentialsError } from "../errors/authentication.error.js";
import type { AuthenticatedPrincipal } from "../types/request.types.js";
import type { AuthenticationProvider } from "../middleware/authentication-provider.js";
import type { JwtAuthenticationConfig } from "./security.js";

function rejectCredentials(): never {
  throw new InvalidCredentialsError();
}

function stringArray(value: unknown): readonly string[] {
  if (value === undefined) return [];
  if (
    !Array.isArray(value) ||
    !value.every(v => typeof v === "string" && v.trim())
  ) {
    rejectCredentials();
  }
  return Object.freeze([...new Set(value as string[])]);
}

function isTokenError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return error.name.startsWith("JWT") ||
    error.name.startsWith("JWS") ||
    error.name === "JWKSNoMatchingKey";
}

export function createJwtAuthenticationProvider(
  config: JwtAuthenticationConfig,
  injectedResolver?: JWTVerifyGetKey,
): AuthenticationProvider {
  const resolver =
    injectedResolver ?? createRemoteJWKSet(new URL(config.jwksUrl));

  return Object.freeze({
    async verifyAccessToken(token: string): Promise<AuthenticatedPrincipal> {
      if (typeof token !== "string" || !token.trim()) rejectCredentials();

      let payload;
      try {
        const verified = await jwtVerify(token, resolver, {
          algorithms: [...config.algorithms],
          issuer: config.issuer,
          audience: config.audience,
          clockTolerance: config.clockToleranceSeconds,
        });
        payload = verified.payload;
      } catch (error: unknown) {
        if (isTokenError(error)) rejectCredentials();
        throw error;
      }

      if (typeof payload.sub !== "string" || !payload.sub.trim()) {
        rejectCredentials();
      }

      const roles = stringArray(payload.roles);
      let scopes: string[] = [];

      if (payload.scope !== undefined) {
        if (typeof payload.scope !== "string") rejectCredentials();
        scopes = payload.scope.trim() ? payload.scope.trim().split(/\s+/) : [];
      }
      if (payload.scp !== undefined) {
        scopes = [...scopes, ...stringArray(payload.scp)];
      }
      if (
        payload.tenant_id !== undefined &&
        (typeof payload.tenant_id !== "string" || !payload.tenant_id.trim())
      ) {
        rejectCredentials();
      }

      return Object.freeze({
        userId: payload.sub,
        ...(typeof payload.tenant_id === "string"
          ? { tenantId: payload.tenant_id }
          : {}),
        roles: Object.freeze([...new Set(roles)]),
        scopes: Object.freeze([...new Set(scopes)]),
      });
    },
  });
}