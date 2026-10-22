import { createOAuthConfiguration } from "./security.js";
import type { OAuthConfiguration, OAuthConfigurationInput } from "./security.js";

export type { OAuthConfiguration, OAuthConfigurationInput } from "./security.js";

export function configureOAuth(
  input: OAuthConfigurationInput,
): OAuthConfiguration {
  return createOAuthConfiguration(input);
}

/**
 * Contract only: an OIDC integration must implement authorization-code
 * exchange, state and nonce checks, PKCE, and ID-token verification.
 */
export interface OAuthAuthorizationRequest {
  readonly authorizationEndpoint: string;
  readonly clientId: string;
  readonly redirectUri: string;
  readonly scopes: readonly string[];
  readonly state: string;
  readonly nonce: string;
  readonly codeChallenge: string;
  readonly codeChallengeMethod: "S256";
}