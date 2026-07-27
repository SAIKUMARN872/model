import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * AuthProvider
 *
 * Responsibilities:
 * - Authentication state
 * - Login
 * - Logout
 * - Session restoration
 * - Access token management
 * - Refresh token management
 * - Current user management
 * - Role checks
 * - Permission checks
 */

/* -------------------------------------------------
   Storage Keys
------------------------------------------------- */

const STORAGE_KEYS = {
  ACCESS_TOKEN:
    "admin_access_token",

  REFRESH_TOKEN:
    "admin_refresh_token",

  USER:
    "admin_current_user",
};

/* -------------------------------------------------
   Auth Context
------------------------------------------------- */

const AuthContext =
  createContext(null);

/* -------------------------------------------------
   Initial State
------------------------------------------------- */

const INITIAL_STATE = {
  user: null,

  accessToken: null,

  refreshToken: null,

  isAuthenticated: false,

  isLoading: true,

  error: null,
};

/* -------------------------------------------------
   Storage Helpers
------------------------------------------------- */

function getStorageItem(
  key
) {
  try {
    return localStorage.getItem(
      key
    );
  } catch (error) {
    console.error(
      "Failed to read auth storage:",
      error
    );

    return null;
  }
}

function setStorageItem(
  key,
  value
) {
  try {
    if (
      value === null ||
      value === undefined
    ) {
      localStorage.removeItem(
        key
      );

      return;
    }

    localStorage.setItem(
      key,
      value
    );
  } catch (error) {
    console.error(
      "Failed to write auth storage:",
      error
    );
  }
}

function removeStorageItem(
  key
) {
  try {
    localStorage.removeItem(
      key
    );
  } catch (error) {
    console.error(
      "Failed to remove auth storage:",
      error
    );
  }
}

/* -------------------------------------------------
   User Storage
------------------------------------------------- */

function getStoredUser() {
  const user =
    getStorageItem(
      STORAGE_KEYS.USER
    );

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(
      user
    );
  } catch (error) {
    console.error(
      "Invalid stored user:",
      error
    );

    return null;
  }
}

function storeUser(
  user
) {
  if (!user) {
    removeStorageItem(
      STORAGE_KEYS.USER
    );

    return;
  }

  setStorageItem(
    STORAGE_KEYS.USER,
    JSON.stringify(user)
  );
}

/* -------------------------------------------------
   Auth Provider
------------------------------------------------- */

export function AuthProvider({
  children,

  authService,

  initialUser = null,
}) {
  const [
    state,
    setState,
  ] = useState(() => {
    const accessToken =
      getStorageItem(
        STORAGE_KEYS.ACCESS_TOKEN
      );

    const refreshToken =
      getStorageItem(
        STORAGE_KEYS.REFRESH_TOKEN
      );

    const storedUser =
      getStoredUser();

    return {
      ...INITIAL_STATE,

      user:
        initialUser ||
        storedUser,

      accessToken,

      refreshToken,

      isAuthenticated:
        Boolean(
          accessToken &&
            (
              initialUser ||
              storedUser
            )
        ),

      isLoading: true,
    };
  });

  /* -------------------------------------------------
     Restore Session
  ------------------------------------------------- */

  const restoreSession =
    useCallback(
      async () => {
        setState(
          (current) => ({
            ...current,

            isLoading: true,

            error: null,
          })
        );

        try {
          const accessToken =
            getStorageItem(
              STORAGE_KEYS.ACCESS_TOKEN
            );

          const refreshToken =
            getStorageItem(
              STORAGE_KEYS.REFRESH_TOKEN
            );

          const storedUser =
            getStoredUser();

          if (
            !accessToken &&
            !refreshToken
          ) {
            setState(
              (current) => ({
                ...current,

                user: null,

                accessToken: null,

                refreshToken: null,

                isAuthenticated: false,

                isLoading: false,
              })
            );

            return null;
          }

          let user =
            storedUser;

          /*
           * If your AuthService has
           * getCurrentUser(), use it here.
           */

          if (
            authService?.getCurrentUser
          ) {
            try {
              user =
                await authService.getCurrentUser();
            } catch (error) {
              console.warn(
                "Unable to restore current user:",
                error
              );
            }
          }

          if (
            !user &&
            !accessToken
          ) {
            throw new Error(
              "Authentication session is invalid."
            );
          }

          if (user) {
            storeUser(
              user
            );
          }

          setState(
            (current) => ({
              ...current,

              user,

              accessToken,

              refreshToken,

              isAuthenticated:
                Boolean(
                  accessToken &&
                    user
                ),

              isLoading: false,
            })
          );

          return user;
        } catch (error) {
          console.error(
            "Session restoration failed:",
            error
          );

          clearAuthStorage();

          setState(
            (current) => ({
              ...current,

              user: null,

              accessToken: null,

              refreshToken: null,

              isAuthenticated: false,

              isLoading: false,

              error:
                error.message ||
                "Session restoration failed.",
            })
          );

          return null;
        }
      },
      [authService]
    );

  /* -------------------------------------------------
     Initialize Authentication
  ------------------------------------------------- */

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      if (!mounted) {
        return;
      }

      await restoreSession();
    }

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [
    restoreSession,
  ]);

  /* -------------------------------------------------
     Login
  ------------------------------------------------- */

  const login =
    useCallback(
      async (
        credentials
      ) => {
        setState(
          (current) => ({
            ...current,

            isLoading: true,

            error: null,
          })
        );

        try {
          let response;

          /*
           * Production API
           */

          if (
            authService?.login
          ) {
            response =
              await authService.login(
                credentials
              );
          } else {
            /*
             * Development fallback.
             *
             * Replace this with
             * your real backend.
             */

            response = {
              user: {
                id: "demo-user",

                name:
                  credentials?.email ||
                  "Admin User",

                email:
                  credentials?.email ||
                  "",

                role: "admin",

                roles: [
                  "admin",
                ],

                permissions: [],
              },

              accessToken:
                "demo-access-token",

              refreshToken:
                "demo-refresh-token",
            };
          }

          const {
            user,
            accessToken,
            refreshToken,
          } = response || {};

          if (
            !user ||
            !accessToken
          ) {
            throw new Error(
              "Invalid authentication response."
            );
          }

          setStorageItem(
            STORAGE_KEYS.ACCESS_TOKEN,
            accessToken
          );

          setStorageItem(
            STORAGE_KEYS.REFRESH_TOKEN,
            refreshToken
          );

          storeUser(
            user
          );

          setState(
            (current) => ({
              ...current,

              user,

              accessToken,

              refreshToken,

              isAuthenticated: true,

              isLoading: false,

              error: null,
            })
          );

          return {
            success: true,

            user,

            accessToken,

            refreshToken,
          };
        } catch (error) {
          console.error(
            "Login failed:",
            error
          );

          setState(
            (current) => ({
              ...current,

              user: null,

              accessToken: null,

              refreshToken: null,

              isAuthenticated: false,

              isLoading: false,

              error:
                error.message ||
                "Login failed.",
            })
          );

          throw error;
        }
      },
      [authService]
    );

  /* -------------------------------------------------
     Logout
  ------------------------------------------------- */

  const logout =
    useCallback(
      async () => {
        setState(
          (current) => ({
            ...current,

            isLoading: true,
          })
        );

        try {
          const refreshToken =
            getStorageItem(
              STORAGE_KEYS.REFRESH_TOKEN
            );

          if (
            authService?.logout
          ) {
            await authService.logout(
              {
                refreshToken,
              }
            );
          }
        } catch (error) {
          console.error(
            "Logout API failed:",
            error
          );
        } finally {
          clearAuthStorage();

          setState(
            (current) => ({
              ...current,

              user: null,

              accessToken: null,

              refreshToken: null,

              isAuthenticated: false,

              isLoading: false,

              error: null,
            })
          );
        }
      },
      [authService]
    );

  /* -------------------------------------------------
     Refresh Access Token
  ------------------------------------------------- */

  const refreshAccessToken =
    useCallback(
      async () => {
        const refreshToken =
          getStorageItem(
            STORAGE_KEYS.REFRESH_TOKEN
          );

        if (
          !refreshToken
        ) {
          throw new Error(
            "No refresh token available."
          );
        }

        try {
          if (
            !authService?.refreshToken
          ) {
            return null;
          }

          const response =
            await authService.refreshToken(
              refreshToken
            );

          const {
            accessToken,
            refreshToken:
              newRefreshToken,
            user,
          } =
            response || {};

          if (
            accessToken
          ) {
            setStorageItem(
              STORAGE_KEYS.ACCESS_TOKEN,
              accessToken
            );
          }

          if (
            newRefreshToken
          ) {
            setStorageItem(
              STORAGE_KEYS.REFRESH_TOKEN,
              newRefreshToken
            );
          }

          if (user) {
            storeUser(
              user
            );
          }

          setState(
            (current) => ({
              ...current,

              accessToken:
                accessToken ||
                current.accessToken,

              refreshToken:
                newRefreshToken ||
                current.refreshToken,

              user:
                user ||
                current.user,

              isAuthenticated:
                Boolean(
                  accessToken ||
                    current.accessToken
                ),
            })
          );

          return accessToken;
        } catch (error) {
          console.error(
            "Token refresh failed:",
            error
          );

          await logout();

          throw error;
        }
      },
      [
        authService,
        logout,
      ]
    );

  /* -------------------------------------------------
     Update User
  ------------------------------------------------- */

  const updateUser =
    useCallback(
      (updates) => {
        setState(
          (current) => {
            const updatedUser =
              {
                ...current.user,
                ...updates,
              };

            storeUser(
              updatedUser
            );

            return {
              ...current,

              user:
                updatedUser,
            };
          }
        );
      },
      []
    );

  /* -------------------------------------------------
     Permission Check
  ------------------------------------------------- */

  const hasPermission =
    useCallback(
      (permission) => {
        if (
          !state.user
        ) {
          return false;
        }

        const permissions =
          state.user
            .permissions ||
          [];

        const roles =
          state.user.roles ||
          [];

        const role =
          state.user.role;

        /*
         * Super admin has
         * unrestricted access.
         */

        if (
          roles.includes(
            "super_admin"
          ) ||
          role ===
            "super_admin"
        ) {
          return true;
        }

        return permissions.includes(
          permission
        );
      },
      [state.user]
    );

  /* -------------------------------------------------
     Multiple Permission Check
  ------------------------------------------------- */

  const hasAnyPermission =
    useCallback(
      (permissions = []) => {
        return permissions.some(
          hasPermission
        );
      },
      [hasPermission]
    );

  const hasAllPermissions =
    useCallback(
      (permissions = []) => {
        return permissions.every(
          hasPermission
        );
      },
      [hasPermission]
    );

  /* -------------------------------------------------
     Role Check
  ------------------------------------------------- */

  const hasRole =
    useCallback(
      (role) => {
        if (
          !state.user
        ) {
          return false;
        }

        const userRoles =
          state.user.roles ||
          [];

        return (
          state.user.role ===
            role ||
          userRoles.includes(
            role
          )
        );
      },
      [state.user]
    );

  /* -------------------------------------------------
     Multiple Role Check
  ------------------------------------------------- */

  const hasAnyRole =
    useCallback(
      (roles = []) => {
        return roles.some(
          hasRole
        );
      },
      [hasRole]
    );

  /* -------------------------------------------------
     Clear Authentication
  ------------------------------------------------- */

  const clearAuthentication =
    useCallback(() => {
      clearAuthStorage();

      setState(
        (current) => ({
          ...current,

          user: null,

          accessToken: null,

          refreshToken: null,

          isAuthenticated: false,

          error: null,
        })
      );
    }, []);

  /* -------------------------------------------------
     Context Value
  ------------------------------------------------- */

  const value =
    useMemo(
      () => ({
        /* User */
        user: state.user,

        updateUser,

        /* Tokens */
        accessToken:
          state.accessToken,

        refreshToken:
          state.refreshToken,

        /* Authentication */
        isAuthenticated:
          state.isAuthenticated,

        isLoading:
          state.isLoading,

        error:
          state.error,

        /* Actions */
        login,

        logout,

        restoreSession,

        refreshAccessToken,

        clearAuthentication,

        /* Permissions */
        hasPermission,

        hasAnyPermission,

        hasAllPermissions,

        /* Roles */
        hasRole,

        hasAnyRole,
      }),
      [
        state,

        updateUser,

        login,

        logout,

        restoreSession,

        refreshAccessToken,

        clearAuthentication,

        hasPermission,

        hasAnyPermission,

        hasAllPermissions,

        hasRole,

        hasAnyRole,
      ]
    );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* -------------------------------------------------
   Main Auth Hook
------------------------------------------------- */

export function useAuth() {
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
}

/* -------------------------------------------------
   Authentication Guard Hook
------------------------------------------------- */

export function useRequireAuth() {
  const {
    isAuthenticated,

    isLoading,

    user,
  } = useAuth();

  return {
    isAuthenticated,

    isLoading,

    user,

    isAuthorized:
      !isLoading &&
      isAuthenticated,
  };
}

/* -------------------------------------------------
   Clear Auth Storage
------------------------------------------------- */

function clearAuthStorage() {
  removeStorageItem(
    STORAGE_KEYS.ACCESS_TOKEN
  );

  removeStorageItem(
    STORAGE_KEYS.REFRESH_TOKEN
  );

  removeStorageItem(
    STORAGE_KEYS.USER
  );
}

/* -------------------------------------------------
   Default Export
------------------------------------------------- */

export default AuthProvider;