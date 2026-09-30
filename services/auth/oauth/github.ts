import type {
  OAuthProviderConfig,
  OAuthUserProfile,
} from "./provider.js";

import { OAuthProvider } from "./provider.js";

export class GitHubOAuthProvider extends OAuthProvider {
  readonly name = "github" as const;

  constructor(
    config: OAuthProviderConfig,
  ) {
    super(config);
  }

  getAuthorizationUrl(
    state: string,
  ): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: "code",
      scope: this.config.scopes.join(" "),
      state,
    });

    return `${this.config.authorizationUrl}?${params.toString()}`;
  }

  normalizeProfile(
    profile: Record<string, unknown>,
  ): OAuthUserProfile {
    const id = this.readString(
      profile.id,
    );

    const email = this.readString(
      profile.email,
    );

    const login = this.readString(
      profile.login,
    );

    const name = this.readString(
      profile.name,
      login || "GitHub User",
    );

    const avatar =
      this.readOptionalString(
        profile.avatar_url,
      );

    if (!id) {
      throw new Error(
        "GitHub profile id is required",
      );
    }

    if (!email) {
      throw new Error(
        "GitHub profile email is required",
      );
    }

    return {
      id: `github:${id}`,
      email,
      name,
      avatar,
      provider: "github",
      providerAccountId: id,
    };
  }

  private readString(
    value: unknown,
    fallback = "",
  ): string {
    return typeof value === "string"
      ? value
      : typeof value === "number"
        ? String(value)
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
