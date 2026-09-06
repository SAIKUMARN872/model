import apiClient from "../api/client";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "./tokens";

/**
 * Enterprise Authentication Service
 *
 * Responsibilities:
 * - Authenticate users
 * - Manage access and refresh tokens
 * - Refresh expired access tokens
 * - Retrieve current authenticated user
 * - Validate active sessions
 * - Logout users
 * - Handle authentication failures
 *
 * API Contract:
 * POST /auth/login
 * POST /auth/logout
 * POST /auth/refresh
 * GET  /auth/me
 * GET  /auth/session
 */

class AuthService {
  /**
   * Authenticate a user.
   *
   * @param {Object} credentials
   * @param {string} credentials.email
   * @param {string} credentials.password
   * @returns {Promise<Object>}
   */
  async login({
    email,
    password,
  }) {
    if (!email) {
      throw new Error(
        "Email is required."
      );
    }

    if (!password) {
      throw new Error(
        "Password is required."
      );
    }

    try {
      const response =
        await apiClient.post(
          "/auth/login",
          {
            email:
              email.trim().toLowerCase(),
            password,
          }
        );

      const data =
        response?.data ||
        response ||
        {};

      const accessToken =
        data?.accessToken ||
        data?.token;

      const refreshToken =
        data?.refreshToken;

      if (!accessToken) {
        throw new Error(
          "Authentication succeeded but no access token was returned."
        );
      }

      /**
       * Persist tokens.
       */
      setTokens({
        accessToken,
        refreshToken,
      });

      return {
        user:
          data?.user ||
          null,

        accessToken,

        refreshToken:
          refreshToken ||
          null,

        expiresIn:
          data?.expiresIn ||
          null,
      };
    } catch (error) {
      throw this.normalizeError(
        error,
        "Unable to sign in."
      );
    }
  }

  /**
   * Logout the current user.
   *
   * The local tokens are always cleared,
   * even if the backend logout request fails.
   *
   * @returns {Promise<boolean>}
   */
  async logout() {
    const refreshToken =
      getRefreshToken();

    try {
      if (refreshToken) {
        await apiClient.post(
          "/auth/logout",
          {
            refreshToken,
          }
        );
      }

      return true;
    } catch (error) {
      console.error(
        "Logout request failed:",
        error
      );

      return false;
    } finally {
      /**
       * Always clear local authentication
       * state.
       */
      clearTokens();
    }
  }

  /**
   * Refresh the access token.
   *
   * @returns {Promise<Object>}
   */
  async refreshAccessToken() {
    const refreshToken =
      getRefreshToken();

    if (!refreshToken) {
      throw new Error(
        "No refresh token available."
      );
    }

    try {
      const response =
        await apiClient.post(
          "/auth/refresh",
          {
            refreshToken,
          }
        );

      const data =
        response?.data ||
        response ||
        {};

      const newAccessToken =
        data?.accessToken ||
        data?.token;

      const newRefreshToken =
        data?.refreshToken ||
        refreshToken;

      if (!newAccessToken) {
        throw new Error(
          "Token refresh failed."
        );
      }

      setTokens({
        accessToken:
          newAccessToken,

        refreshToken:
          newRefreshToken,
      });

      return {
        accessToken:
          newAccessToken,

        refreshToken:
          newRefreshToken,

        expiresIn:
          data?.expiresIn ||
          null,
      };
    } catch (error) {
      /**
       * Refresh token is invalid or
       * expired. Clear local session.
       */
      clearTokens();

      throw this.normalizeError(
        error,
        "Your session has expired. Please sign in again."
      );
    }
  }

  /**
   * Get the currently authenticated user.
   *
   * @returns {Promise<Object>}
   */
  async getCurrentUser() {
    const accessToken =
      getAccessToken();

    if (!accessToken) {
      return null;
    }

    try {
      const response =
        await apiClient.get(
          "/auth/me"
        );

      const data =
        response?.data ||
        response ||
        {};

      return (
        data?.user ||
        data ||
        null
      );
    } catch (error) {
      /**
       * If authentication is invalid,
       * return null instead of exposing
       * low-level API errors.
       */
      if (
        this.isAuthenticationError(
          error
        )
      ) {
        return null;
      }

      throw this.normalizeError(
        error,
        "Unable to retrieve the current user."
      );
    }
  }

  /**
   * Validate the current session.
   *
   * @returns {Promise<Object>}
   */
  async validateSession() {
    const accessToken =
      getAccessToken();

    if (!accessToken) {
      return {
        authenticated: false,
        user: null,
      };
    }

    try {
      const response =
        await apiClient.get(
          "/auth/session"
        );

      const data =
        response?.data ||
        response ||
        {};

      return {
        authenticated:
          data?.authenticated !==
          false,

        user:
          data?.user ||
          null,

        expiresAt:
          data?.expiresAt ||
          null,
      };
    } catch (error) {
      /**
       * Try refreshing the access token
       * if the current token has expired.
       */
      if (
        this.isAuthenticationError(
          error
        )
      ) {
        try {
          await this.refreshAccessToken();

          const user =
            await this.getCurrentUser();

          return {
            authenticated:
              Boolean(user),

            user,
          };
        } catch {
          clearTokens();

          return {
            authenticated: false,
            user: null,
          };
        }
      }

      throw this.normalizeError(
        error,
        "Unable to validate your session."
      );
    }
  }

  /**
   * Check whether the user is authenticated.
   *
   * @returns {boolean}
   */
  isAuthenticated() {
    return Boolean(
      getAccessToken()
    );
  }

  /**
   * Get the current access token.
   *
   * @returns {string|null}
   */
  getAccessToken() {
    return getAccessToken();
  }

  /**
   * Get the current refresh token.
   *
   * @returns {string|null}
   */
  getRefreshToken() {
    return getRefreshToken();
  }

  /**
   * Clear the local authentication
   * session.
   */
  clearSession() {
    clearTokens();
  }

  /**
   * Determine whether an error represents
   * an authentication failure.
   *
   * @param {Object} error
   * @returns {boolean}
   */
  isAuthenticationError(
    error
  ) {
    const status =
      error?.response?.status ||
      error?.status;

    return (
      status === 401 ||
      status === 403
    );
  }

  /**
   * Normalize API errors into a
   * predictable application error.
   *
   * @param {Object} error
   * @param {string} fallbackMessage
   * @returns {Error}
   */
  normalizeError(
    error,
    fallbackMessage
  ) {
    const message =
      error?.response?.data
        ?.message ||
      error?.response?.data
        ?.error ||
      error?.message ||
      fallbackMessage;

    const normalizedError =
      new Error(message);

    normalizedError.status =
      error?.response?.status ||
      error?.status ||
      null;

    normalizedError.code =
      error?.response?.data
        ?.code ||
      error?.code ||
      null;

    normalizedError.originalError =
      error;

    return normalizedError;
  }
}

/**
 * Export a singleton instance.
 *
 * Usage:
 *
 * import authService from
 * "./auth/AuthService";
 *
 * await authService.login({
 *   email,
 *   password,
 * });
 */
const authService =
  new AuthService();

export default authService;