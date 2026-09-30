import assert from "node:assert/strict";

import {
  GitHubOAuthProvider,
  GoogleOAuthProvider,
  OAuthService,
} from "./index.js";

const googleConfig = {
  name: "google" as const,
  clientId: "google-client-id",
  clientSecret: "google-client-secret",
  redirectUri: "http://localhost:3000/auth/google/callback",
  scopes: ["openid", "email", "profile"],
  authorizationUrl:
    "https://accounts.google.com/o/oauth2/v2/auth",
  tokenUrl:
    "https://oauth2.googleapis.com/token",
  userInfoUrl:
    "https://openidconnect.googleapis.com/v1/userinfo",
};

const githubConfig = {
  name: "github" as const,
  clientId: "github-client-id",
  clientSecret: "github-client-secret",
  redirectUri: "http://localhost:3000/auth/github/callback",
  scopes: ["read:user", "user:email"],
  authorizationUrl:
    "https://github.com/login/oauth/authorize",
  tokenUrl:
    "https://github.com/login/oauth/access_token",
  userInfoUrl:
    "https://api.github.com/user",
};

console.log("");
console.log("========================================");
console.log("           OAUTH MOCK TEST");
console.log("========================================");
console.log("");

let passed = 0;
let failed = 0;

function test(
  name: string,
  fn: () => void,
): void {
  try {
    fn();
    console.log(`✓ PASS: ${name}`);
    passed++;
  } catch (error) {
    console.log(`✗ FAIL: ${name}`);

    if (error instanceof Error) {
      console.log(`  ${error.message}`);
    } else {
      console.log(`  ${String(error)}`);
    }

    failed++;
  }
}

// --------------------------------------------------
// GOOGLE
// --------------------------------------------------

test("Google - create provider", () => {
  const provider =
    new GoogleOAuthProvider(
      googleConfig,
    );

  assert.equal(
    provider.name,
    "google",
  );
});

test("Google - generate authorization URL", () => {
  const provider =
    new GoogleOAuthProvider(
      googleConfig,
    );

  const url =
    provider.getAuthorizationUrl(
      "state-001",
    );

  assert.ok(
    url.startsWith(
      "https://accounts.google.com/",
    ),
  );

  assert.ok(
    url.includes(
      "client_id=google-client-id",
    ),
  );

  assert.ok(
    url.includes(
      "state=state-001",
    ),
  );
});

test("Google - normalize profile", () => {
  const provider =
    new GoogleOAuthProvider(
      googleConfig,
    );

  const profile =
    provider.normalizeProfile({
      sub: "google-123",
      email: "user@example.com",
      name: "Test User",
      picture: "https://example.com/user.jpg",
    });

  assert.equal(
    profile.provider,
    "google",
  );

  assert.equal(
    profile.providerAccountId,
    "google-123",
  );

  assert.equal(
    profile.email,
    "user@example.com",
  );
});

// --------------------------------------------------
// GITHUB
// --------------------------------------------------

test("GitHub - create provider", () => {
  const provider =
    new GitHubOAuthProvider(
      githubConfig,
    );

  assert.equal(
    provider.name,
    "github",
  );
});

test("GitHub - generate authorization URL", () => {
  const provider =
    new GitHubOAuthProvider(
      githubConfig,
    );

  const url =
    provider.getAuthorizationUrl(
      "github-state",
    );

  assert.ok(
    url.startsWith(
      "https://github.com/login/oauth/authorize",
    ),
  );

  assert.ok(
    url.includes(
      "client_id=github-client-id",
    ),
  );

  assert.ok(
    url.includes(
      "state=github-state",
    ),
  );
});

test("GitHub - normalize profile", () => {
  const provider =
    new GitHubOAuthProvider(
      githubConfig,
    );

  const profile =
    provider.normalizeProfile({
      id: 12345,
      login: "testuser",
      name: "Test User",
      email: "user@example.com",
      avatar_url:
        "https://github.com/avatar.jpg",
    });

  assert.equal(
    profile.provider,
    "github",
  );

  assert.equal(
    profile.providerAccountId,
    "12345",
  );

  assert.equal(
    profile.email,
    "user@example.com",
  );
});

// --------------------------------------------------
// OAUTH SERVICE
// --------------------------------------------------

test("OAuth - register providers", () => {
  const oauth =
    new OAuthService();

  oauth.registerProvider(
    new GoogleOAuthProvider(
      googleConfig,
    ),
  );

  oauth.registerProvider(
    new GitHubOAuthProvider(
      githubConfig,
    ),
  );

  assert.equal(
    oauth.providerCount(),
    2,
  );
});

test("OAuth - generate authorization", () => {
  const oauth =
    new OAuthService();

  oauth.registerProvider(
    new GoogleOAuthProvider(
      googleConfig,
    ),
  );

  const result =
    oauth.getAuthorizationUrl(
      "google",
    );

  assert.equal(
    result.provider,
    "google",
  );

  assert.ok(result.state);
  assert.ok(result.authorizationUrl);
  assert.ok(
    result.authorizationUrl.includes(
      "client_id=google-client-id",
    ),
  );
});

test("OAuth - validate state", () => {
  const oauth =
    new OAuthService();

  const state =
    oauth.createState("google");

  assert.equal(
    oauth.validateState(
      state,
      "google",
    ),
    true,
  );
});

test("OAuth - reject reused state", () => {
  const oauth =
    new OAuthService();

  const state =
    oauth.createState("google");

  assert.equal(
    oauth.validateState(
      state,
      "google",
    ),
    true,
  );

  assert.equal(
    oauth.validateState(
      state,
      "google",
    ),
    false,
  );
});

test("OAuth - reject wrong provider state", () => {
  const oauth =
    new OAuthService();

  const state =
    oauth.createState("google");

  assert.equal(
    oauth.validateState(
      state,
      "github",
    ),
    false,
  );
});

test("OAuth - handle callback", () => {
  const oauth =
    new OAuthService();

  const state =
    oauth.createState("google");

  const result =
    oauth.handleCallback(
      "google",
      "authorization-code",
      state,
    );

  assert.equal(
    result.provider,
    "google",
  );

  assert.equal(
    result.code,
    "authorization-code",
  );

  assert.equal(
    result.validState,
    true,
  );
});

test("OAuth - normalize Google profile", () => {
  const oauth =
    new OAuthService();

  oauth.registerProvider(
    new GoogleOAuthProvider(
      googleConfig,
    ),
  );

  const profile =
    oauth.normalizeProfile(
      "google",
      {
        sub: "google-001",
        email: "google@example.com",
        name: "Google User",
      },
    );

  assert.equal(
    profile.email,
    "google@example.com",
  );
});

test("OAuth - normalize GitHub profile", () => {
  const oauth =
    new OAuthService();

  oauth.registerProvider(
    new GitHubOAuthProvider(
      githubConfig,
    ),
  );

  const profile =
    oauth.normalizeProfile(
      "github",
      {
        id: 1001,
        login: "github-user",
        email: "github@example.com",
        name: "GitHub User",
      },
    );

  assert.equal(
    profile.provider,
    "github",
  );

  assert.equal(
    profile.providerAccountId,
    "1001",
  );
});

test("OAuth - normalize token response", () => {
  const oauth =
    new OAuthService();

  const token =
    oauth.normalizeTokenResponse({
      access_token: "access-token-001",
      token_type: "Bearer",
      refresh_token: "refresh-token-001",
      expires_in: 3600,
      scope: "openid email",
    });

  assert.equal(
    token.accessToken,
    "access-token-001",
  );

  assert.equal(
    token.tokenType,
    "Bearer",
  );

  assert.equal(
    token.refreshToken,
    "refresh-token-001",
  );

  assert.equal(
    token.expiresIn,
    3600,
  );
});

test("OAuth - health check", () => {
  const oauth =
    new OAuthService();

  const health =
    oauth.health();

  assert.equal(
    health.healthy,
    true,
  );

  assert.equal(
    health.providerCount,
    0,
  );
});

// --------------------------------------------------
// RESULT
// --------------------------------------------------

console.log("");
console.log("========================================");
console.log("             TEST RESULT");
console.log("========================================");
console.log(
  `Total Tests : ${passed + failed}`,
);
console.log(
  `Passed      : ${passed}`,
);
console.log(
  `Failed      : ${failed}`,
);
console.log("========================================");
console.log("");

if (failed > 0) {
  process.exitCode = 1;
  console.log("OAUTH MOCK TEST FAILED");
} else {
  console.log(
    "ALL OAUTH MOCK TESTS PASSED ✓",
  );
}

console.log("");
