import React from "react";

/**
 * Authentication middleware utilities.
 *
 * This file provides reusable authentication
 * checks for protected console routes and
 * components.
 */

/**
 * Get authentication token from storage.
 */
export const getAuthToken = () => {
  if (
    typeof window === "undefined"
  ) {
    return null;
  }

  try {
    return (
      localStorage.getItem(
        "accessToken"
      ) ||
      localStorage.getItem(
        "access_token"
      ) ||
      sessionStorage.getItem(
        "accessToken"
      ) ||
      sessionStorage.getItem(
        "access_token"
      ) ||
      null
    );
  } catch (error) {
    console.error(
      "Unable to access authentication storage:",
      error
    );

    return null;
  }
};

/**
 * Check whether the user is authenticated.
 */
export const isAuthenticated = () => {
  const token =
    getAuthToken();

  return Boolean(token);
};

/**
 * Get current authenticated user.
 */
export const getCurrentUser = () => {
  if (
    typeof window === "undefined"
  ) {
    return null;
  }

  try {
    const storedUser =
      localStorage.getItem(
        "currentUser"
      ) ||
      localStorage.getItem(
        "user"
      ) ||
      sessionStorage.getItem(
        "currentUser"
      ) ||
      sessionStorage.getItem(
        "user"
      );

    if (!storedUser) {
      return null;
    }

    return JSON.parse(
      storedUser
    );
  } catch (error) {
    console.error(
      "Unable to read current user:",
      error
    );

    return null;
  }
};

/**
 * Store authenticated user.
 */
export const setCurrentUser = (
  user
) => {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  try {
    if (!user) {
      localStorage.removeItem(
        "currentUser"
      );

      localStorage.removeItem(
        "user"
      );

      return;
    }

    localStorage.setItem(
      "currentUser",
      JSON.stringify(user)
    );
  } catch (error) {
    console.error(
      "Unable to store current user:",
      error
    );
  }
};

/**
 * Clear authentication state.
 */
export const clearAuth = () => {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  try {
    const keys = [
      "accessToken",
      "access_token",
      "refreshToken",
      "refresh_token",
      "currentUser",
      "user",
    ];

    keys.forEach(
      (key) => {
        localStorage.removeItem(
          key
        );

        sessionStorage.removeItem(
          key
        );
      }
    );
  } catch (error) {
    console.error(
      "Unable to clear authentication state:",
      error
    );
  }
};

/**
 * Redirect unauthenticated users.
 */
export const redirectToLogin = (
  loginPath = "/login"
) => {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  const currentPath =
    window.location.pathname +
    window.location.search;

  if (
    currentPath !==
    loginPath
  ) {
    try {
      sessionStorage.setItem(
        "redirectAfterLogin",
        currentPath
      );
    } catch (error) {
      console.warn(
        "Unable to store redirect path:",
        error
      );
    }

    window.location.assign(
      loginPath
    );
  }
};

/**
 * Get redirect path after login.
 */
export const getRedirectAfterLogin =
  () => {
    if (
      typeof window ===
      "undefined"
    ) {
      return "/";
    }

    try {
      const path =
        sessionStorage.getItem(
          "redirectAfterLogin"
        );

      if (path) {
        sessionStorage.removeItem(
          "redirectAfterLogin"
        );

        return path;
      }
    } catch (error) {
      console.warn(
        "Unable to read redirect path:",
        error
      );
    }

    return "/";
  };

/**
 * Require authentication.
 *
 * Returns true when authenticated.
 * Redirects to login otherwise.
 */
export const requireAuth = (
  loginPath = "/login"
) => {
  const authenticated =
    isAuthenticated();

  if (!authenticated) {
    redirectToLogin(
      loginPath
    );

    return false;
  }

  return true;
};

/**
 * Higher-order component for
 * protected React components.
 */
export const withAuth = (
  Component,
  options = {}
) => {
  const {
    loginPath = "/login",
    loadingComponent = null,
  } = options;

  const ProtectedComponent = (
    props
  ) => {
    const [
      authenticated,
      setAuthenticated,
    ] = React.useState(null);

    React.useEffect(
      () => {
        const result =
          isAuthenticated();

        setAuthenticated(
          result
        );

        if (!result) {
          redirectToLogin(
            loginPath
          );
        }
      },
      []
    );

    /**
     * Authentication check
     * is still running.
     */
    if (
      authenticated === null
    ) {
      return loadingComponent;
    }

    /**
     * User is not authenticated.
     */
    if (!authenticated) {
      return null;
    }

    /**
     * User is authenticated.
     */
    return (
      <Component
        {...props}
      />
    );
  };

  ProtectedComponent.displayName =
    `withAuth(${
      Component.displayName ||
      Component.name ||
      "Component"
    })`;

  return ProtectedComponent;
};

/**
 * Authentication guard component.
 */
export const AuthGuard = ({
  children,
  loginPath = "/login",
  fallback = null,
}) => {
  const [
    authenticated,
    setAuthenticated,
  ] = React.useState(null);

  React.useEffect(
    () => {
      const checkAuth =
        () => {
          const result =
            isAuthenticated();

          setAuthenticated(
            result
          );

          if (!result) {
            redirectToLogin(
              loginPath
            );
          }
        };

      checkAuth();
    },
    [loginPath]
  );

  /**
   * Still checking authentication.
   */
  if (
    authenticated === null
  ) {
    return fallback;
  }

  /**
   * Not authenticated.
   */
  if (!authenticated) {
    return null;
  }

  /**
   * Authenticated.
   */
  return children;
};

/**
 * Default export.
 */
export default {
  getAuthToken,
  isAuthenticated,
  getCurrentUser,
  setCurrentUser,
  clearAuth,
  redirectToLogin,
  getRedirectAfterLogin,
  requireAuth,
  withAuth,
  AuthGuard,
};