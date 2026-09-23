function generateId(): string {
  const cryptoApi =
    typeof globalThis !== "undefined" &&
    "crypto" in globalThis &&
    globalThis.crypto &&
    typeof globalThis.crypto.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : `oauth-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return cryptoApi;
}

export type OAuthProvider =
  | "google"
  | "microsoft"
  | "github"
  | "custom";

export interface OAuthProfile {
  provider: OAuthProvider;
  providerUserId: string;
  email: string;
  name?: string;
  organizationId?: string;
  roles?: string[];
  permissions?: string[];
  metadata?: Record<string, unknown>;
}

export interface OAuthAuthorizationRequest {
  state: string;
  provider: OAuthProvider;
  authorizationUrl: string;
  createdAt: number;
  expiresAt: number;
}

export interface OAuthOptions {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  scope?: string[];
  stateTtlMs?: number;
}

export interface OAuthHealth {
  healthy: boolean;
  provider: OAuthProvider;
  authorizationEndpoint: string;
  tokenEndpoint: string;
}

function assertNonEmpty(value: string, field: string): void {
  if (!value.trim()) {
    throw new Error(`${field} cannot be empty`);
  }
}

export class OAuthService {
  private readonly options: OAuthOptions;
  private readonly provider: OAuthProvider;
  private readonly stateTtlMs: number;

  private readonly authorizationRequests = new Map<
    string,
    OAuthAuthorizationRequest
  >();

  constructor(
    provider: OAuthProvider,
    options: OAuthOptions,
  ) {
    assertNonEmpty(options.clientId, "clientId");
    assertNonEmpty(options.clientSecret, "clientSecret");
    assertNonEmpty(options.redirectUri, "redirectUri");
    assertNonEmpty(
      options.authorizationEndpoint,
      "authorizationEndpoint",
    );
    assertNonEmpty(
      options.tokenEndpoint,
      "tokenEndpoint",
    );

    this.provider = provider;
    this.options = {
      ...options,
      scope: options.scope ?? ["openid", "profile", "email"],
    };

    this.stateTtlMs = options.stateTtlMs ?? 10 * 60 * 1000;

    if (this.stateTtlMs <= 0) {
      throw new Error("stateTtlMs must be greater than zero");
    }
  }

  createAuthorizationRequest(
    additionalParams: Record<string, string> = {},
  ): OAuthAuthorizationRequest {
    this.cleanupExpiredStates();

    const state = generateId();
    const createdAt = Date.now();
    const expiresAt = createdAt + this.stateTtlMs;

    const request: OAuthAuthorizationRequest = {
      state,
      provider: this.provider,
      authorizationUrl: this.buildAuthorizationUrl(
        state,
        additionalParams,
      ),
      createdAt,
      expiresAt,
    };

    this.authorizationRequests.set(state, request);

    return { ...request };
  }

  validateState(state: string): boolean {
    this.cleanupExpiredStates();

    const request = this.authorizationRequests.get(state);

    if (!request) {
      return false;
    }

    if (request.expiresAt < Date.now()) {
      this.authorizationRequests.delete(state);
      return false;
    }

    return true;
  }

  consumeState(state: string): OAuthAuthorizationRequest {
    this.cleanupExpiredStates();

    const request = this.authorizationRequests.get(state);

    if (!request) {
      throw new Error("Invalid OAuth state");
    }

    if (request.expiresAt < Date.now()) {
      this.authorizationRequests.delete(state);
      throw new Error("OAuth state has expired");
    }

    this.authorizationRequests.delete(state);

    return { ...request };
  }

  buildAuthorizationUrl(
    state: string,
    additionalParams: Record<string, string> = {},
  ): string {
    const url = new URL(this.options.authorizationEndpoint);

    url.searchParams.set("client_id", this.options.clientId);
    url.searchParams.set(
      "redirect_uri",
      this.options.redirectUri,
    );
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", this.options.scope?.join(" ") ?? "");
    url.searchParams.set("state", state);

    for (const [key, value] of Object.entries(additionalParams)) {
      url.searchParams.set(key, value);
    }

    return url.toString();
  }

  createProfile(input: {
    providerUserId: string;
    email: string;
    name?: string;
    organizationId?: string;
    roles?: string[];
    permissions?: string[];
    metadata?: Record<string, unknown>;
  }): OAuthProfile {
    assertNonEmpty(
      input.providerUserId,
      "providerUserId",
    );

    assertNonEmpty(input.email, "email");

    return {
      provider: this.provider,
      providerUserId: input.providerUserId,
      email: input.email.toLowerCase(),
      name: input.name,
      organizationId: input.organizationId,
      roles: [...(input.roles ?? [])],
      permissions: [...(input.permissions ?? [])],
      metadata: input.metadata
        ? { ...input.metadata }
        : undefined,
    };
  }

  getPendingStateCount(): number {
    this.cleanupExpiredStates();
    return this.authorizationRequests.size;
  }

  health(): OAuthHealth {
    return {
      healthy:
        Boolean(this.options.clientId) &&
        Boolean(this.options.clientSecret),
      provider: this.provider,
      authorizationEndpoint:
        this.options.authorizationEndpoint,
      tokenEndpoint: this.options.tokenEndpoint,
    };
  }

  private cleanupExpiredStates(): void {
    const now = Date.now();

    for (const [state, request] of this.authorizationRequests) {
      if (request.expiresAt < now) {
        this.authorizationRequests.delete(state);
      }
    }
  }
}