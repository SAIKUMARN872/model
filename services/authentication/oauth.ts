import {
  OAuthService,
  oauthService,
} from "../auth/oauth/oauth.js";

import type {
  OAuthProviderName,
  OAuthUserProfile,
} from "../auth/oauth/provider.js";

import {
  GitHubOAuthProvider,
} from "../auth/oauth/github.js";

import {
  GoogleOAuthProvider,
} from "../auth/oauth/google.js";

export interface OAuthAuthenticationResult {
  provider: OAuthProviderName;
  profile: OAuthUserProfile;
  authenticated: boolean;
}

export class AuthenticationOAuthService {
  private readonly service: OAuthService;
  private readonly stateMap = new Map<
    string,
    OAuthProviderName
  >();

  constructor(service: OAuthService = oauthService) {
    this.service = service;
  }

  getAuthorizationUrl(
    provider: OAuthProviderName,
    state?: string,
  ): string {
    this.ensureProvider(provider);

    const result = (this.service as any).getAuthorizationUrl(
      provider,
      state,
    );

    return result.authorizationUrl;
  }

  createState(provider: OAuthProviderName): string {
    this.ensureProvider(provider);

    const state = this.service.createState(provider);
    this.stateMap.set(state, provider);
    return state;
  }

  verifyState(state: string): boolean {
    const provider = this.stateMap.get(state);

    if (!provider) {
      return false;
    }

    return this.service.validateState(state, provider);
  }

  normalizeProfile(
    provider: OAuthProviderName,
    profile: Record<string, unknown>,
  ): OAuthUserProfile {
    this.ensureProvider(provider);

    return this.service.normalizeProfile(provider, profile);
  }

  private ensureProvider(provider: OAuthProviderName): void {
    if (this.service.getProvider(provider)) {
      return;
    }

    const config = {
      name: provider,
      clientId: `${provider}-client-id`,
      clientSecret: `${provider}-client-secret`,
      redirectUri: `https://example.com/auth/${provider}/callback`,
      scopes:
        provider === "google"
          ? ["openid", "email", "profile"]
          : ["read:user", "user:email"],
      authorizationUrl:
        provider === "google"
          ? "https://accounts.google.com/o/oauth2/v2/auth"
          : "https://github.com/login/oauth/authorize",
      tokenUrl:
        provider === "google"
          ? "https://oauth2.googleapis.com/token"
          : "https://github.com/login/oauth/access_token",
      userInfoUrl:
        provider === "google"
          ? "https://www.googleapis.com/oauth2/v3/userinfo"
          : "https://api.github.com/user",
    };

    if (provider === "google") {
      this.service.registerProvider(
        new GoogleOAuthProvider(config),
      );
      return;
    }

    this.service.registerProvider(
      new GitHubOAuthProvider(config),
    );
  }

  authenticate(
    provider: OAuthProviderName,
    profile: Record<string, unknown>,
  ): OAuthAuthenticationResult {
    const normalizedProfile = this.normalizeProfile(
      provider,
      profile,
    );

    return {
      provider,
      profile: normalizedProfile,
      authenticated: true,
    };
  }

  health(): { healthy: boolean } {
    return {
      healthy: true,
    };
  }
}

export const authenticationOAuthService =
  new AuthenticationOAuthService();
