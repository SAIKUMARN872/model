import type { AuthenticatedPrincipal } from "../types/request.types.js";

/**
 * Verifies an access token with a trusted identity provider.
 * Implementations must validate the signature and relevant claims.
 */
export interface AuthenticationProvider {
  verifyAccessToken(token: string): Promise<AuthenticatedPrincipal>;
}
