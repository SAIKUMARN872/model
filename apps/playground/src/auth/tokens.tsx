export interface AuthTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

class TokenService {
  public accessToken: string | null;
  public refreshToken: string | null;

  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
  }

  setTokens(
    accessToken: string,
    refreshToken: string | null = null
  ): void {
    if (!accessToken) {
      throw new Error("Access token is required.");
    }

    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  hasAccessToken(): boolean {
    return this.accessToken !== null;
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
  }

  getTokens(): AuthTokens {
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
    };
  }
}

const tokenService = new TokenService();

export default tokenService;