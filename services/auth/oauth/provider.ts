export type OAuthProviderName = "google" | "github";

export interface OAuthProviderConfig {
  name: OAuthProviderName;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
}

export interface OAuthUserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: OAuthProviderName;
  providerAccountId: string;
}

export interface OAuthTokenResponse {
  accessToken: string;
  tokenType: string;
  refreshToken?: string;
  expiresIn?: number;
  scope?: string;
}

export interface OAuthState {
  state: string;
  provider: OAuthProviderName;
  createdAt: Date;
  expiresAt: Date;
}

export abstract class OAuthProvider {
  abstract readonly name: OAuthProviderName;

  protected readonly config: OAuthProviderConfig;

  constructor(config: OAuthProviderConfig) {
    this.config = config;
  }

  abstract getAuthorizationUrl(
    state: string,
  ): string;

  abstract normalizeProfile(
    profile: Record<string, unknown>,
  ): OAuthUserProfile;
}
