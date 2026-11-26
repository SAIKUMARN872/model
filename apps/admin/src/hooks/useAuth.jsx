import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * Authentication Hook
 *
 * Handles:
 * - Current authenticated user
 * - Login
 * - Logout
 * - Session restoration
 * - Authentication state
 * - Loading and error states
 *
 * Replace the mock authApi functions with
 * your actual services/authApi.jsx service.
 */

/* ----------------------------------------
 * Initial State
 * -------------------------------------- */

const initialUser = null;

/* ----------------------------------------
 * Mock Auth API
 *
 * Replace with your real API service:
 *
 * import authApi from "../services/authApi";
 * -------------------------------------- */

const authApi = {
  getCurrentUser: async () => {
    return null;
  },

  login: async ({
    email,
    password,
  }) => {
    if (!email || !password) {
      throw new Error(
        "Email and password are required."
      );
    }

    return {
      user: {
        id: "user-001",
        name: "Admin User",
        email,
        role: "admin",
      },
      token: "mock-access-token",
    };
  },

  logout: async () => {
    return {
      success: true,
    };
  },

  refreshToken: async () => {
    return {
      token: "mock-refreshed-token",
    };
  },
};

/* ----------------------------------------
 * useAuth Hook
 * -------------------------------------- */

export const useAuth = () => {
  const [user, setUser] =
    useState(initialUser);

  const [token, setToken] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  /* --------------------------------------
   * Restore Current Session
   * ------------------------------------ */

  const restoreSession =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const storedToken =
          localStorage.getItem(
            "access_token"
          );

        if (!storedToken) {
          setUser(null);
          setToken(null);
          return;
        }

        const currentUser =
          await authApi.getCurrentUser();

        if (currentUser) {
          setUser(currentUser);
          setToken(storedToken);
        } else {
          localStorage.removeItem(
            "access_token"
          );

          setUser(null);
          setToken(null);
        }
      } catch (err) {
        localStorage.removeItem(
          "access_token"
        );

        setUser(null);
        setToken(null);

        setError(
          err?.message ||
            "Failed to restore authentication session."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  /* --------------------------------------
   * Login
   * ------------------------------------ */

  const login = useCallback(
    async ({
      email,
      password,
    }) => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await authApi.login({
            email,
            password,
          });

        const {
          user: authenticatedUser,
          token: accessToken,
        } = response;

        if (!accessToken) {
          throw new Error(
            "Authentication token was not provided."
          );
        }

        localStorage.setItem(
          "access_token",
          accessToken
        );

        setUser(
          authenticatedUser
        );

        setToken(accessToken);

        return {
          success: true,
          user: authenticatedUser,
          token: accessToken,
        };
      } catch (err) {
        const message =
          err?.message ||
          "Login failed.";

        setError(message);

        setUser(null);
        setToken(null);

        return {
          success: false,
          error: message,
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /* --------------------------------------
   * Logout
   * ------------------------------------ */

  const logout =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        await authApi.logout();
      } catch (err) {
        setError(
          err?.message ||
            "Logout request failed."
        );
      } finally {
        localStorage.removeItem(
          "access_token"
        );

        setUser(null);
        setToken(null);

        setLoading(false);
      }
    }, []);

  /* --------------------------------------
   * Refresh Authentication Token
   * ------------------------------------ */

  const refreshToken =
    useCallback(async () => {
      try {
        setError(null);

        const response =
          await authApi.refreshToken();

        if (!response?.token) {
          throw new Error(
            "Failed to refresh authentication token."
          );
        }

        localStorage.setItem(
          "access_token",
          response.token
        );

        setToken(response.token);

        return {
          success: true,
          token: response.token,
        };
      } catch (err) {
        const message =
          err?.message ||
          "Failed to refresh authentication token.";

        setError(message);

        return {
          success: false,
          error: message,
        };
      }
    }, []);

  /* --------------------------------------
   * Clear Error
   * ------------------------------------ */

  const clearError =
    useCallback(() => {
      setError(null);
    }, []);

  /* --------------------------------------
   * Computed Authentication State
   * ------------------------------------ */

  const isAuthenticated =
    useMemo(() => {
      return Boolean(
        user && token
      );
    }, [user, token]);

  const userRole = useMemo(() => {
    return user?.role || null;
  }, [user]);

  /* --------------------------------------
   * Restore Session on Mount
   * ------------------------------------ */

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  /* --------------------------------------
   * Return Hook API
   * ------------------------------------ */

  return {
    // User
    user,

    // Token
    token,

    // Authentication state
    isAuthenticated,

    // User role
    userRole,

    // Loading and error
    loading,
    error,

    // Actions
    login,
    logout,
    refreshToken,
    restoreSession,
    clearError,
  };
};

export default useAuth;