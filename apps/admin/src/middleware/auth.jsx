import React, {
  useEffect,
  useState,
} from "react";

import AuthService from "../auth/AuthService";
import {
  getAccessToken,
  isTokenExpired,
} from "../auth/tokens";

/**
 * Authentication middleware
 *
 * Responsibilities:
 * - Check whether the user is authenticated
 * - Validate the access token
 * - Redirect unauthenticated users
 * - Show a loading state during authentication
 * - Protect admin routes
 */

/**
 * Get the current authenticated user.
 */
export function getCurrentUser() {
  try {
    if (
      AuthService &&
      typeof AuthService.getCurrentUser ===
        "function"
    ) {
      return AuthService.getCurrentUser();
    }

    const storedUser =
      localStorage.getItem(
        "admin_user"
      );

    if (!storedUser) {
      return null;
    }

    return JSON.parse(
      storedUser
    );
  } catch (error) {
    console.error(
      "Failed to get current user:",
      error
    );

    return null;
  }
}

/**
 * Get access token from the authentication service
 * or token storage.
 */
export function getAuthToken() {
  try {
    if (
      AuthService &&
      typeof AuthService.getAccessToken ===
        "function"
    ) {
      return AuthService.getAccessToken();
    }

    if (
      typeof getAccessToken ===
      "function"
    ) {
      return getAccessToken();
    }

    return (
      localStorage.getItem(
        "access_token"
      ) ||
      localStorage.getItem(
        "accessToken"
      )
    );
  } catch (error) {
    console.error(
      "Failed to get access token:",
      error
    );

    return null;
  }
}

/**
 * Check whether an authentication token exists.
 */
export function hasAuthToken() {
  const token =
    getAuthToken();

  return Boolean(token);
}

/**
 * Check whether the current token is valid.
 */
export function isAuthenticated() {
  try {
    const token =
      getAuthToken();

    if (!token) {
      return false;
    }

    // If the project provides
    // an expiration checker,
    // use it.
    if (
      typeof isTokenExpired ===
      "function"
    ) {
      return !isTokenExpired(
        token
      );
    }

    // Basic JWT expiration check.
    const parts =
      token.split(".");

    if (
      parts.length !== 3
    ) {
      return true;
    }

    const payload =
      JSON.parse(
        atob(
          parts[1]
            .replace(/-/g, "+")
            .replace(
              /_/g,
              "/"
            )
        )
      );

    if (
      payload.exp &&
      Date.now() >=
        payload.exp * 1000
    ) {
      return false;
    }

    return true;
  } catch (error) {
    console.error(
      "Authentication validation failed:",
      error
    );

    return false;
  }
}

/**
 * Check whether the user has an authenticated session.
 */
export function checkAuthentication() {
  const token =
    getAuthToken();

  const user =
    getCurrentUser();

  return {
    authenticated:
      Boolean(
        token
      ) &&
      isAuthenticated(),
    token,
    user,
  };
}

/**
 * Redirect the user to login.
 */
export function redirectToLogin(
  loginPath = "/login"
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  const currentPath =
    window.location.pathname;

  const currentSearch =
    window.location.search;

  const returnUrl =
    `${currentPath}${currentSearch}`;

  const separator =
    loginPath.includes("?")
      ? "&"
      : "?";

  window.location.replace(
    `${loginPath}${separator}returnUrl=${encodeURIComponent(
      returnUrl
    )}`
  );
}

/**
 * Logout the current user.
 */
export async function logout() {
  try {
    if (
      AuthService &&
      typeof AuthService.logout ===
        "function"
    ) {
      await AuthService.logout();
    }
  } catch (error) {
    console.error(
      "Logout service failed:",
      error
    );
  } finally {
    clearAuthStorage();

    if (
      typeof window !==
      "undefined"
    ) {
      window.location.replace(
        "/login"
      );
    }
  }
}

/**
 * Clear authentication-related
 * local storage data.
 */
export function clearAuthStorage() {
  const keys = [
    "access_token",
    "accessToken",
    "refresh_token",
    "refreshToken",
    "admin_user",
    "user",
  ];

  keys.forEach(
    (key) => {
      localStorage.removeItem(
        key
      );
    }
  );
}

/**
 * React authentication guard.
 *
 * Usage:
 *
 * <AuthGuard>
 *   <AdminDashboard />
 * </AuthGuard>
 */
export function AuthGuard({
  children,
  fallback = null,
  loadingComponent,
  loginPath = "/login",
}) {
  const [
    authState,
    setAuthState,
  ] = useState({
    loading: true,
    authenticated: false,
    user: null,
  });

  useEffect(() => {
    let mounted = true;

    const verifyAuthentication =
      async () => {
        try {
          let authenticated =
            isAuthenticated();

          let user =
            getCurrentUser();

          /**
           * If AuthService has an
           * asynchronous session check,
           * use it.
           */
          if (
            AuthService &&
            typeof AuthService.checkAuth ===
              "function"
          ) {
            const result =
              await AuthService.checkAuth();

            if (
              result &&
              typeof result ===
                "object"
            ) {
              authenticated =
                Boolean(
                  result.authenticated ??
                    result.isAuthenticated
                );

              user =
                result.user ||
                user;
            } else {
              authenticated =
                Boolean(result);
            }
          }

          if (!mounted) {
            return;
          }

          setAuthState({
            loading: false,
            authenticated,
            user,
          });

          if (
            !authenticated
          ) {
            redirectToLogin(
              loginPath
            );
          }
        } catch (error) {
          console.error(
            "Auth guard failed:",
            error
          );

          if (!mounted) {
            return;
          }

          setAuthState({
            loading: false,
            authenticated: false,
            user: null,
          });

          redirectToLogin(
            loginPath
          );
        }
      };

    verifyAuthentication();

    return () => {
      mounted = false;
    };
  }, [loginPath]);

  if (
    authState.loading
  ) {
    if (
      loadingComponent
    ) {
      return loadingComponent;
    }

    return (
      <div
        style={
          styles.loadingContainer
        }
      >
        <div
          style={
            styles.spinner
          }
        />

        <p
          style={
            styles.loadingText
          }
        >
          Verifying authentication...
        </p>
      </div>
    );
  }

  if (
    !authState.authenticated
  ) {
    return fallback;
  }

  return children;
}

/**
 * Higher-order component
 * for protecting admin pages.
 *
 * Usage:
 *
 * export default withAuth(
 *   DashboardPage
 * );
 */
export function withAuth(
  Component,
  options = {}
) {
  const {
    loginPath = "/login",
    loadingComponent,
  } = options;

  function ProtectedComponent(
    props
  ) {
    return (
      <AuthGuard
        loginPath={
          loginPath
        }
        loadingComponent={
          loadingComponent
        }
      >
        <Component
          {...props}
        />
      </AuthGuard>
    );
  }

  ProtectedComponent.displayName =
    `withAuth(${
      Component.displayName ||
      Component.name ||
      "Component"
    })`;

  return ProtectedComponent;
}

/**
 * Route-level authentication check.
 *
 * Useful when your router needs
 * a simple boolean.
 */
export function requireAuth(
  options = {}
) {
  const {
    loginPath = "/login",
  } = options;

  const result =
    checkAuthentication();

  if (
    !result.authenticated
  ) {
    redirectToLogin(
      loginPath
    );

    return false;
  }

  return true;
}

/**
 * Authentication middleware
 * for navigation.
 */
export function authMiddleware(
  next,
  options = {}
) {
  const {
    loginPath = "/login",
  } = options;

  const authenticated =
    isAuthenticated();

  if (!authenticated) {
    redirectToLogin(
      loginPath
    );

    return false;
  }

  if (
    typeof next ===
    "function"
  ) {
    next();
  }

  return true;
}

const styles = {
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent:
      "center",
    minHeight: "100vh",
    backgroundColor:
      "#f8fafc",
  },

  spinner: {
    width: "36px",
    height: "36px",
    border:
      "4px solid #e2e8f0",
    borderTop:
      "4px solid #2563eb",
    borderRadius: "50%",
    animation:
      "adminAuthSpin 0.8s linear infinite",
  },

  loadingText: {
    marginTop: "14px",
    color: "#64748b",
    fontSize: "14px",
  },
};