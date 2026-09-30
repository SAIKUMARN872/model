import {
  TokenBlacklist,
  RefreshTokenService,
  TokenManager,
} from "./index.js";

function assert(
  condition: boolean,
  message: string,
): void {
  if (!condition) {
    throw new Error(message);
  }

  console.log(`PASS: ${message}`);
}

function assertThrows(
  action: () => unknown,
  message: string,
): void {
  try {
    action();
    throw new Error(`Expected error: ${message}`);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === `Expected error: ${message}`
    ) {
      throw error;
    }

    console.log(`PASS: ${message}`);
  }
}

function runTests(): void {
  console.log("Running tokens tests...");

  const blacklist = new TokenBlacklist();

  const blacklisted = blacklist.add(
    "access-token-001",
    "logout",
    "user-001",
  );

  assert(
    blacklisted.tokenHash.length > 0,
    "Blacklist stores token hash",
  );

  assert(
    blacklist.has("access-token-001"),
    "Blacklisted token is detected",
  );

  assert(
    !blacklist.has("different-token"),
    "Non-blacklisted token is not detected",
  );

  assert(
    blacklist.get("access-token-001")?.reason === "logout",
    "Blacklist entry can be retrieved",
  );

  assert(
    blacklist.remove("access-token-001"),
    "Token can be removed from blacklist",
  );

  assert(
    !blacklist.has("access-token-001"),
    "Removed token is no longer blacklisted",
  );

  assertThrows(
    () => blacklist.add(""),
    "Empty token is rejected",
  );

  const refreshService = new RefreshTokenService();

  const refreshToken = refreshService.create({
    userId: "user-001",
    expiresInSeconds: 3600,
  });

  assert(
    refreshToken.id.length > 0,
    "Refresh token ID is generated",
  );

  assert(
    refreshToken.token.length > 0,
    "Refresh token value is generated",
  );

  assert(
    refreshToken.tokenHash.length > 0,
    "Refresh token hash is generated",
  );

  assert(
    !refreshToken.revoked,
    "New refresh token is active",
  );

  assert(
    refreshService.get(refreshToken.id)?.id ===
      refreshToken.id,
    "Refresh token lookup works",
  );

  assert(
    refreshService.getByToken(refreshToken.token)?.id ===
      refreshToken.id,
    "Refresh token value lookup works",
  );

  assert(
    refreshService.isValid(refreshToken.token),
    "Refresh token validation works",
  );

  assertThrows(
    () =>
      refreshService.create({
        userId: "",
      }),
    "Empty refresh token user ID is rejected",
  );

  assertThrows(
    () =>
      refreshService.create({
        userId: "user-002",
        expiresInSeconds: 0,
      }),
    "Invalid refresh token expiration is rejected",
  );

  assert(
    refreshService.revoke(refreshToken.id),
    "Refresh token can be revoked",
  );

  assert(
    !refreshService.isValid(refreshToken.token),
    "Revoked refresh token is invalid",
  );

  const rotationToken = refreshService.create({
    userId: "user-002",
    expiresInSeconds: 3600,
  });

  const rotatedToken = refreshService.rotate(
    rotationToken.token,
    3600,
  );

  assert(
    rotatedToken.userId === "user-002",
    "Refresh token rotation preserves user",
  );

  assert(
    !refreshService.isValid(rotationToken.token),
    "Old refresh token is invalid after rotation",
  );

  assert(
    refreshService.isValid(rotatedToken.token),
    "New rotated refresh token is valid",
  );

  const thirdToken = refreshService.create({
    userId: "user-001",
    expiresInSeconds: 3600,
  });

  const revokedCount =
    refreshService.revokeUserTokens("user-001");

  assert(
    revokedCount === 1,
    "User refresh tokens can be revoked",
  );

  assert(
    !refreshService.isValid(thirdToken.token),
    "User refresh token is revoked",
  );

  assert(
    refreshService.count() === 4,
    "Refresh token count is correct",
  );

  assert(
    refreshService.activeCount() === 1,
    "Active refresh token count is correct",
  );

  const managerBlacklist = new TokenBlacklist();
  const managerRefresh = new RefreshTokenService();

  const manager = new TokenManager({
    blacklist: managerBlacklist,
    refreshTokens: managerRefresh,
  });

  const managedToken =
    manager.createRefreshToken({
      userId: "manager-user",
      expiresInSeconds: 3600,
    });

  assert(
    manager.validateRefreshToken(
      managedToken.token,
    ),
    "Token manager validates refresh token",
  );

  assert(
    manager.getRefreshToken(
      managedToken.id,
    )?.id === managedToken.id,
    "Token manager retrieves refresh token",
  );

  manager.blacklistToken(
    "access-token-manager",
    "logout",
    "manager-user",
  );

  assert(
    manager.isBlacklisted(
      "access-token-manager",
    ),
    "Token manager detects blacklisted token",
  );

  assert(
    manager.removeFromBlacklist(
      "access-token-manager",
    ),
    "Token manager removes blacklisted token",
  );

  assert(
    !manager.isBlacklisted(
      "access-token-manager",
    ),
    "Removed blacklist token is no longer detected",
  );

  assert(
    manager.revokeRefreshToken(
      managedToken.id,
    ),
    "Token manager revokes refresh token",
  );

  const health = manager.health();

  assert(
    health.healthy,
    "Token manager is healthy",
  );

  manager.clear();

  assert(
    manager.health().refreshTokens.tokenCount === 0,
    "Token manager refresh tokens can be cleared",
  );

  assert(
    manager.health().blacklist.blacklistCount === 0,
    "Token manager blacklist can be cleared",
  );

  refreshService.clear();

  assert(
    refreshService.count() === 0,
    "Refresh token service can be cleared",
  );

  blacklist.clear();

  assert(
    blacklist.count() === 0,
    "Blacklist can be cleared",
  );

  console.log("All tokens tests passed.");
}

runTests();

