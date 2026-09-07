import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getAuthToken,
  getCurrentUser,
  clearAuth,
  setCurrentUser,
} from "../middleware/auth";

/**
 * Authentication Context
 */
const AuthContext =
  createContext(null);

/**
 * AuthProvider
 *
 * Provides authentication state
 * throughout the Console application.
 */
export const AuthProvider = ({
  children,
}) => {
  const [
    user,
    setUser,
  ] = useState(null);

  const [
    token,
    setToken,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  /**
   * Check authentication state.
   */
  const checkAuth =
    useCallback(() => {
      try {
        const storedToken =
          getAuthToken();

        const storedUser =
          getCurrentUser();

        setToken(
          storedToken
        );

        setUser(
          storedUser
        );
      } catch (error) {
        console.error(
          "Authentication check failed:",
          error
        );

        setToken(null);

        setUser(null);
      } finally {
        setLoading(false);
      }
    }, []);

  /**
   * Initialize authentication
   * state when provider mounts.
   */
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Login handler.
   *
   * This function can be used by
   * login pages or AuthService.
   */
  const login =
    useCallback(
      ({
        accessToken,
        user: authenticatedUser,
      }) => {
        if (
          !accessToken
        ) {
          throw new Error(
            "Access token is required."
          );
        }

        setToken(
          accessToken
        );

        if (
          authenticatedUser
        ) {
          setUser(
            authenticatedUser
          );

          setCurrentUser(
            authenticatedUser
          );
        }

        /**
         * Store access token.
         */
        if (
          typeof window !==
          "undefined"
        ) {
          try {
            localStorage.setItem(
              "accessToken",
              accessToken
            );
          } catch (error) {
            console.error(
              "Unable to store access token:",
              error
            );
          }
        }
      },
      []
    );

  /**
   * Logout handler.
   */
  const logout =
    useCallback(() => {
      try {
        clearAuth();

        setToken(null);

        setUser(null);
      } catch (error) {
        console.error(
          "Logout failed:",
          error
        );
      }
    }, []);

  /**
   * Update current user.
   */
  const updateUser =
    useCallback(
      (updatedUser) => {
        if (
          !updatedUser
        ) {
          return;
        }

        setUser(
          updatedUser
        );

        setCurrentUser(
          updatedUser
        );
      },
      []
    );

  /**
   * Refresh authentication
   * state from storage.
   */
  const refreshAuth =
    useCallback(() => {
      setLoading(true);

      checkAuth();
    }, [checkAuth]);

  /**
   * Authentication status.
   */
  const isAuthenticated =
    Boolean(token);

  /**
   * Context value.
   */
  const value =
    useMemo(
      () => ({
        user,

        token,

        loading,

        isAuthenticated,

        login,

        logout,

        updateUser,

        refreshAuth,
      }),
      [
        user,
        token,
        loading,
        isAuthenticated,
        login,
        logout,
        updateUser,
        refreshAuth,
      ]
    );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth hook.
 *
 * Example:
 *
 * const {
 *   user,
 *   isAuthenticated,
 *   logout,
 * } = useAuth();
 */
export const useAuth = () => {
  const context =
    useContext(
      AuthContext
    );

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
};

/**
 * Default export.
 */
export default AuthProvider;