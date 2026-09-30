import { randomBytes } from "node:crypto";

import {
  GitHubOAuthProvider,
} from "./github.js";

import {
  GoogleOAuthProvider,
} from "./google.js";

import type {
  OAuthProviderConfig,
  OAuthProviderName,
  OAuthState,
  OAuthTokenResponse,
  OAuthUserProfile,
} from "./provider.js";

export interface OAuthConfig {
  stateTtlMs?: number;
  providers?: Partial<
    Record<OAuthProviderName, OAuthProviderConfig>
  >;
}

export interface OAuthAuthorizationResult {
  provider: OAuthProviderName;
  state: string;
  authorizationUrl: string;
}

export interface OAuthCallbackResult {
  provider: OAuthProviderName;
  code: string;
  state: string;
  validState: boolean;
}

export class OAuthService {
  private readonly states = new Map<
    string,
    OAuthState
  >();

  private readonly providers = new Map<
    OAuthProviderName,
    GoogleOAuthProvider | GitHubOAuthProvider
  >();

  private readonly stateTtlMs: number;

  constructor(config: OAuthConfig = {}) {
    this.stateTtlMs =
      config.stateTtlMs ?? 10 * 60 * 1000;

    if (config.providers?.google) {
      this.registerProvider(
        new GoogleOAuthProvider(
          config.providers.google,
        ),
      );
    }

    if (config.providers?.github) {
      this.registerProvider(
        new GitHubOAuthProvider(
          config.providers.github,
        ),
      );
    }
  }

  registerProvider(
    provider:
      | GoogleOAuthProvider
      | GitHubOAuthProvider,
  ): void {
    this.providers.set(
      provider.name,
      provider,
    );
  }

  getProvider(
    name: OAuthProviderName,
  ):
    | GoogleOAuthProvider
    | GitHubOAuthProvider
    | undefined {
    return this.providers.get(name);
  }

  createState(
    provider: OAuthProviderName,
  ): string {
    const state = randomBytes(32)
      .toString("base64url");

    const createdAt = new Date();

    const expiresAt = new Date(
      createdAt.getTime() +
        this.stateTtlMs,
    );

    this.states.set(state, {
      state,
      provider,
      createdAt,
      expiresAt,
    });

    return state;
  }

  getAuthorizationUrl(
    provider: OAuthProviderName,
  ): OAuthAuthorizationResult {
    const oauthProvider =
      this.providers.get(provider);

    if (!oauthProvider) {
      throw new Error(
        `OAuth provider not configured: ${provider}`,
      );
    }

    const state =
      this.createState(provider);

    return {
      provider,
      state,
      authorizationUrl:
        oauthProvider.getAuthorizationUrl(
          state,
        ),
    };
  }

  validateState(
    state: string,
    provider: OAuthProviderName,
  ): boolean {
    const record =
      this.states.get(state);

    if (!record) {
      return false;
    }

    if (record.provider !== provider) {
      return false;
    }

    if (
      record.expiresAt.getTime() <
      Date.now()
    ) {
      this.states.delete(state);
      return false;
    }

    this.states.delete(state);

    return true;
  }

  handleCallback(
    provider: OAuthProviderName,
    code: string,
    state: string,
  ): OAuthCallbackResult {
    if (!code.trim()) {
      throw new Error(
        "OAuth authorization code is required",
      );
    }

    if (!state.trim()) {
      throw new Error(
        "OAuth state is required",
      );
    }

    const validState =
      this.validateState(
        state,
        provider,
      );

    return {
      provider,
      code,
      state,
      validState,
    };
  }

  normalizeProfile(
    provider: OAuthProviderName,
    profile: Record<string, unknown>,
  ): OAuthUserProfile {
    const oauthProvider =
      this.providers.get(provider);

    if (!oauthProvider) {
      throw new Error(
        `OAuth provider not configured: ${provider}`,
      );
    }

    return oauthProvider.normalizeProfile(
      profile,
    );
  }

  normalizeTokenResponse(
    response: Record<string, unknown>,
  ): OAuthTokenResponse {
    const accessToken =
      this.readString(
        response.access_token ??
          response.accessToken,
      );

    if (!accessToken) {
      throw new Error(
        "OAuth access token is required",
      );
    }

    const tokenType =
      this.readString(
        response.token_type ??
          response.tokenType,
        "Bearer",
      );

    const refreshToken =
      this.readOptionalString(
        response.refresh_token ??
          response.refreshToken,
      );

    const expiresValue =
      response.expires_in ??
      response.expiresIn;

    const expiresIn =
      typeof expiresValue === "number"
        ? expiresValue
        : undefined;

    const scope =
      this.readOptionalString(
        response.scope,
      );

    return {
      accessToken,
      tokenType,
      refreshToken,
      expiresIn,
      scope,
    };
  }

  cleanupExpiredStates(): number {
    const now = Date.now();
    let removed = 0;

    for (const [
      state,
      record,
    ] of this.states) {
      if (
        record.expiresAt.getTime() <= now
      ) {
        this.states.delete(state);
        removed++;
      }
    }

    return removed;
  }

  stateCount(): number {
    return this.states.size;
  }

  providerCount(): number {
    return this.providers.size;
  }

  health(): {
    healthy: boolean;
    providerCount: number;
    stateCount: number;
  } {
    return {
      healthy: true,
      providerCount:
        this.providers.size,
      stateCount:
        this.states.size,
    };
  }

  private readString(
    value: unknown,
    fallback = "",
  ): string {
    return typeof value === "string"
      ? value
      : fallback;
  }

  private readOptionalString(
    value: unknown,
  ): string | undefined {
    return typeof value === "string"
      ? value
      : undefined;
  }
}

export const oauthService =
  new OAuthService();
