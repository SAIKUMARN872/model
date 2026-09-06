class TokenService {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
  }

  setTokens(
    accessToken,
    refreshToken = null
  ) {
    if (!accessToken) {
      throw new Error(
        "Access token is required."
      );
    }

    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  getAccessToken() {
    return this.accessToken;
  }

  getRefreshToken() {
    return this.refreshToken;
  }

  hasAccessToken() {
    return (
      this.accessToken !== null
    );
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
  }

  getTokens() {
    return {
      accessToken:
        this.accessToken,
      refreshToken:
        this.refreshToken,
    };
  }
}

const tokenService =
  new TokenService();

export default tokenService;