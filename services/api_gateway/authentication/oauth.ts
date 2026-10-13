export interface OAuthToken {
  accessToken: string;
  refreshToken?: string;
  tokenType: "Bearer";
  expiresIn: number;
  scope: string[];
}

export interface OAuthProvider {
  name: string;
  authorizeUrl: string;
  tokenUrl: string;
}

export class OAuthService {
  constructor(
    private readonly providers: OAuthProvider[] = [],
  ) {}

  getProvider(name: string): OAuthProvider | undefined {
    return this.providers.find(
      (provider) => provider.name === name,
    );
  }

  addProvider(provider: OAuthProvider): void {
    if (!provider.name.trim()) {
      throw new Error("OAuth provider name is required");
    }

    if (this.getProvider(provider.name)) {
      throw new Error("OAuth provider already exists");
    }

    this.providers.push({ ...provider });
  }

  createToken(
    subject: string,
    scope: string[] = [],
    expiresIn = 3600,
  ): OAuthToken {
    if (!subject.trim()) {
      throw new Error("OAuth subject is required");
    }

    if (!Number.isInteger(expiresIn) || expiresIn <= 0) {
      throw new Error("OAuth expiration must be positive");
    }

    return {
      accessToken: Buffer.from(
        `${subject}:${Date.now()}`,
      ).toString("base64url"),
      refreshToken: Buffer.from(
        `${subject}:refresh:${Date.now()}`,
      ).toString("base64url"),
      tokenType: "Bearer",
      expiresIn,
      scope: [...scope],
    };
  }
}
