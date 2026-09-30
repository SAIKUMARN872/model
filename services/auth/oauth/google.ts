import type {
  OAuthProviderConfig,
  OAuthUserProfile,
} from "./provider.js";

import { OAuthProvider } from "./provider.js";

export class GoogleOAuthProvider extends OAuthProvider {
  readonly name = "google" as const;

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
      access_type: "offline",
      prompt: "consent",
    });

    return `${this.config.authorizationUrl}?${params.toString()}`;
  }

  normalizeProfile(
    profile: Record<string, unknown>,
  ): OAuthUserProfile {
    const id = this.readString(
      profile.sub ?? profile.id,
    );

    const email = this.readString(
      profile.email,
    );

    const name = this.readString(
      profile.name,
      email || "Google User",
    );

    const avatar =
      this.readOptionalString(
        profile.picture,
      );

    if (!id) {
      throw new Error(
        "Google profile id is required",
      );
    }

    if (!email) {
      throw new Error(
        "Google profile email is required",
      );
    }

    return {
      id: `google:${id}`,
      email,
      name,
      avatar,
      provider: "google",
      providerAccountId: id,
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
