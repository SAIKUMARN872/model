export {
  OAuthProvider,
} from "./provider.js";

export type {
  OAuthProviderName,
  OAuthProviderConfig,
  OAuthUserProfile,
  OAuthTokenResponse,
  OAuthState,
} from "./provider.js";

export {
  GoogleOAuthProvider,
} from "./google.js";

export {
  GitHubOAuthProvider,
} from "./github.js";

export {
  OAuthService,
  oauthService,
} from "./oauth.js";

export type {
  OAuthConfig,
  OAuthAuthorizationResult,
  OAuthCallbackResult,
} from "./oauth.js";
