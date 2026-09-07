"use client";

/**
 * Enterprise Authentication Token Management
 *
 * Responsibilities:
 * - Store access token
 * - Store refresh token
 * - Retrieve authentication tokens
 * - Clear authentication tokens
 * - Check token availability
 *
 * Storage:
 * - sessionStorage is used by default.
 * - Tokens are cleared automatically when
 *   the browser session ends.
 *
 * Security note:
 * For a production enterprise application,
 * HttpOnly + Secure + SameSite cookies are
 * generally preferred over JavaScript-accessible
 * token storage.
 */

const ACCESS_TOKEN_KEY =
  "console_access_token";

const REFRESH_TOKEN_KEY =
  "console_refresh_token";

/**
 * Check whether browser storage
 * is available.
 */
const isStorageAvailable = () => {
  if (
    typeof window ===
    "undefined"
  ) {
    return false;
  }

  try {
    const storage =
      window.sessionStorage;

    const testKey =
      "__storage_test__";

    storage.setItem(
      testKey,
      "1"
    );

    storage.removeItem(
      testKey
    );

    return true;
  } catch {
    return false;
  }
};

/**
 * Store authentication tokens.
 *
 * @param {Object} tokens
 * @param {string} tokens.accessToken
 * @param {string} tokens.refreshToken
 */
export const setTokens = ({
  accessToken,
  refreshToken,
}) => {
  if (
    !isStorageAvailable()
  ) {
    return;
  }

  if (accessToken) {
    window.sessionStorage.setItem(
      ACCESS_TOKEN_KEY,
      accessToken
    );
  }

  if (refreshToken) {
    window.sessionStorage.setItem(
      REFRESH_TOKEN_KEY,
      refreshToken
    );
  }
};

/**
 * Get access token.
 *
 * @returns {string|null}
 */
export const getAccessToken = () => {
  if (
    !isStorageAvailable()
  ) {
    return null;
  }

  return (
    window.sessionStorage.getItem(
      ACCESS_TOKEN_KEY
    ) || null
  );
};

/**
 * Get refresh token.
 *
 * @returns {string|null}
 */
export const getRefreshToken = () => {
  if (
    !isStorageAvailable()
  ) {
    return null;
  }

  return (
    window.sessionStorage.getItem(
      REFRESH_TOKEN_KEY
    ) || null
  );
};

/**
 * Remove authentication tokens.
 */
export const clearTokens = () => {
  if (
    !isStorageAvailable()
  ) {
    return;
  }

  window.sessionStorage.removeItem(
    ACCESS_TOKEN_KEY
  );

  window.sessionStorage.removeItem(
    REFRESH_TOKEN_KEY
  );
};

/**
 * Check whether an access token exists.
 *
 * @returns {boolean}
 */
export const hasAccessToken = () => {
  return Boolean(
    getAccessToken()
  );
};

/**
 * Check whether a refresh token exists.
 *
 * @returns {boolean}
 */
export const hasRefreshToken = () => {
  return Boolean(
    getRefreshToken()
  );
};

/**
 * Check whether the user has a
 * complete authentication session.
 *
 * @returns {boolean}
 */
export const hasValidTokenPair = () => {
  return (
    hasAccessToken() &&
    hasRefreshToken()
  );
};

/**
 * Get all authentication tokens.
 *
 * Useful for debugging and internal
 * authentication workflows.
 *
 * @returns {Object}
 */
export const getTokens = () => {
  return {
    accessToken:
      getAccessToken(),

    refreshToken:
      getRefreshToken(),
  };
};

/**
 * Replace an existing access token.
 *
 * Useful after refreshing an expired
 * access token.
 *
 * @param {string} accessToken
 */
export const updateAccessToken = (
  accessToken
) => {
  if (
    !isStorageAvailable()
  ) {
    return;
  }

  if (!accessToken) {
    return;
  }

  window.sessionStorage.setItem(
    ACCESS_TOKEN_KEY,
    accessToken
  );
};

/**
 * Replace an existing refresh token.
 *
 * @param {string} refreshToken
 */
export const updateRefreshToken = (
  refreshToken
) => {
  if (
    !isStorageAvailable()
  ) {
    return;
  }

  if (!refreshToken) {
    return;
  }

  window.sessionStorage.setItem(
    REFRESH_TOKEN_KEY,
    refreshToken
  );
};

/**
 * Clear only the access token.
 */
export const clearAccessToken = () => {
  if (
    !isStorageAvailable()
  ) {
    return;
  }

  window.sessionStorage.removeItem(
    ACCESS_TOKEN_KEY
  );
};

/**
 * Clear only the refresh token.
 */
export const clearRefreshToken = () => {
  if (
    !isStorageAvailable()
  ) {
    return;
  }

  window.sessionStorage.removeItem(
    REFRESH_TOKEN_KEY
  );
};

export default {
  setTokens,
  getAccessToken,
  getRefreshToken,
  clearTokens,
  hasAccessToken,
  hasRefreshToken,
  hasValidTokenPair,
  getTokens,
  updateAccessToken,
  updateRefreshToken,
  clearAccessToken,
  clearRefreshToken,
};