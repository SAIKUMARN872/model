import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AccessControlProvider,
} from "../permissions/access";

import {
  PromptProvider,
} from "../prompts";

import {
  ObservabilityProvider,
} from "../observability";

/**
 * AdminProvider
 *
 * Central application provider for:
 * - Current admin user
 * - Authentication state
 * - Organization context
 * - Application loading state
 * - Global notifications
 * - Access control
 * - Prompt management
 * - Observability
 */

/* -------------------------------------------------
   Context
------------------------------------------------- */

const AdminContext =
  createContext(null);

/* -------------------------------------------------
   Initial State
------------------------------------------------- */

const INITIAL_STATE = {
  user: null,

  organization: null,

  organizations: [],

  isAuthenticated: false,

  isLoading: true,

  initialized: false,
};

/* -------------------------------------------------
   Storage Keys
------------------------------------------------- */

const STORAGE_KEYS = {
  USER:
    "admin_current_user",

  ORGANIZATION:
    "admin_current_organization",

  ORGANIZATIONS:
    "admin_organizations",
};

/* -------------------------------------------------
   Storage Helpers
------------------------------------------------- */

function readStorage(
  key,
  fallback = null
) {
  try {
    const value =
      localStorage.getItem(
        key
      );

    if (!value) {
      return fallback;
    }

    return JSON.parse(
      value
    );
  } catch (error) {
    console.warn(
      `Failed to read storage key: ${key}`,
      error
    );

    return fallback;
  }
}

function writeStorage(
  key,
  value
) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(value)
    );
  } catch (error) {
    console.warn(
      `Failed to write storage key: ${key}`,
      error
    );
  }
}

function removeStorage(
  key
) {
  try {
    localStorage.removeItem(
      key
    );
  } catch (error) {
    console.warn(
      `Failed to remove storage key: ${key}`,
      error
    );
  }
}

/* -------------------------------------------------
   Provider
------------------------------------------------- */

export function AdminProvider({
  children,

  initialUser = null,

  initialOrganization = null,

  initialOrganizations = [],

  initialLoading = true,
}) {
  const [
    state,
    setState,
  ] = useState(() => {
    const storedUser =
      readStorage(
        STORAGE_KEYS.USER,
        initialUser
      );

    const storedOrganization =
      readStorage(
        STORAGE_KEYS.ORGANIZATION,
        initialOrganization
      );

    const storedOrganizations =
      readStorage(
        STORAGE_KEYS.ORGANIZATIONS,
        initialOrganizations
      );

    return {
      ...INITIAL_STATE,

      user:
        storedUser,

      organization:
        storedOrganization,

      organizations:
        Array.isArray(
          storedOrganizations
        )
          ? storedOrganizations
          : [],

      isAuthenticated:
        Boolean(
          storedUser
        ),

      isLoading:
        initialLoading,

      initialized: false,
    };
  });

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  /* -------------------------------------------------
     Initialize Application
  ------------------------------------------------- */

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        // Add API initialization here.
        // Example:
        // await authService.restoreSession();

        if (!mounted) {
          return;
        }

        setState(
          (current) => ({
            ...current,

            isLoading: false,

            initialized: true,
          })
        );
      } catch (error) {
        console.error(
          "Admin application initialization failed:",
          error
        );

        if (!mounted) {
          return;
        }

        setState(
          (current) => ({
            ...current,

            isLoading: false,

            initialized: true,
          })
        );
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  /* -------------------------------------------------
     Set User
  ------------------------------------------------- */

  const setUser =
    useCallback(
      (user) => {
        setState(
          (current) => ({
            ...current,

            user,

            isAuthenticated:
              Boolean(user),
          })
        );

        if (user) {
          writeStorage(
            STORAGE_KEYS.USER,
            user
          );
        } else {
          removeStorage(
            STORAGE_KEYS.USER
          );
        }
      },
      []
    );

  /* -------------------------------------------------
     Login
  ------------------------------------------------- */

  const login =
    useCallback(
      async (user) => {
        setUser(user);

        return {
          success: true,

          user,
        };
      },
      [setUser]
    );

  /* -------------------------------------------------
     Logout
  ------------------------------------------------- */

  const logout =
    useCallback(
      async () => {
        try {
          // Connect your real AuthService here.
          // Example:
          // await AuthService.logout();

          setState(
            (current) => ({
              ...current,

              user: null,

              organization: null,

              isAuthenticated: false,
            })
          );

          removeStorage(
            STORAGE_KEYS.USER
          );

          removeStorage(
            STORAGE_KEYS.ORGANIZATION
          );
        } catch (error) {
          console.error(
            "Logout failed:",
            error
          );

          throw error;
        }
      },
      []
    );

  /* -------------------------------------------------
     Set Organization
  ------------------------------------------------- */

  const setOrganization =
    useCallback(
      (organization) => {
        setState(
          (current) => ({
            ...current,

            organization,
          })
        );

        if (organization) {
          writeStorage(
            STORAGE_KEYS.ORGANIZATION,
            organization
          );
        } else {
          removeStorage(
            STORAGE_KEYS.ORGANIZATION
          );
        }
      },
      []
    );

  /* -------------------------------------------------
     Set Organizations
  ------------------------------------------------- */

  const setOrganizations =
    useCallback(
      (organizations) => {
        const safeOrganizations =
          Array.isArray(
            organizations
          )
            ? organizations
            : [];

        setState(
          (current) => ({
            ...current,

            organizations:
              safeOrganizations,
          })
        );

        writeStorage(
          STORAGE_KEYS.ORGANIZATIONS,
          safeOrganizations
        );
      },
      []
    );

  /* -------------------------------------------------
     Add Organization
  ------------------------------------------------- */

  const addOrganization =
    useCallback(
      (organization) => {
        setState(
          (current) => {
            const updated = [
              ...current.organizations,
              organization,
            ];

            writeStorage(
              STORAGE_KEYS.ORGANIZATIONS,
              updated
            );

            return {
              ...current,

              organizations:
                updated,
            };
          }
        );

        return organization;
      },
      []
    );

  /* -------------------------------------------------
     Update Organization
  ------------------------------------------------- */

  const updateOrganization =
    useCallback(
      (
        organizationId,
        updates
      ) => {
        let updatedOrganization =
          null;

        setState(
          (current) => {
            const updated =
              current.organizations.map(
                (
                  organization
                ) => {
                  if (
                    organization.id !==
                    organizationId
                  ) {
                    return organization;
                  }

                  updatedOrganization =
                    {
                      ...organization,
                      ...updates,
                      updatedAt:
                        new Date().toISOString(),
                    };

                  return updatedOrganization;
                }
              );

            writeStorage(
              STORAGE_KEYS.ORGANIZATIONS,
              updated
            );

            let activeOrganization =
              current.organization;

            if (
              activeOrganization?.id ===
              organizationId
            ) {
              activeOrganization =
                updatedOrganization;

              writeStorage(
                STORAGE_KEYS.ORGANIZATION,
                activeOrganization
              );
            }

            return {
              ...current,

              organizations:
                updated,

              organization:
                activeOrganization,
            };
          }
        );

        return updatedOrganization;
      },
      []
    );

  /* -------------------------------------------------
     Remove Organization
  ------------------------------------------------- */

  const removeOrganization =
    useCallback(
      (organizationId) => {
        setState(
          (current) => {
            const updated =
              current.organizations.filter(
                (
                  organization
                ) =>
                  organization.id !==
                  organizationId
              );

            const activeOrganization =
              current.organization
                ?.id ===
              organizationId
                ? null
                : current.organization;

            writeStorage(
              STORAGE_KEYS.ORGANIZATIONS,
              updated
            );

            if (
              activeOrganization
            ) {
              writeStorage(
                STORAGE_KEYS.ORGANIZATION,
                activeOrganization
              );
            } else {
              removeStorage(
                STORAGE_KEYS.ORGANIZATION
              );
            }

            return {
              ...current,

              organizations:
                updated,

              organization:
                activeOrganization,
            };
          }
        );
      },
      []
    );

  /* -------------------------------------------------
     Notification Methods
  ------------------------------------------------- */

  const addNotification =
    useCallback(
      ({
        type = "info",
        title = "",
        message = "",
        duration = 5000,
      }) => {
        const id =
          `notification-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 8)}`;

        const notification = {
          id,

          type,

          title,

          message,

          createdAt:
            new Date().toISOString(),
        };

        setNotifications(
          (current) => [
            ...current,
            notification,
          ]
        );

        if (
          duration > 0
        ) {
          setTimeout(
            () => {
              setNotifications(
                (current) =>
                  current.filter(
                    (item) =>
                      item.id !==
                      id
                  )
              );
            },
            duration
          );
        }

        return id;
      },
      []
    );

  const removeNotification =
    useCallback(
      (notificationId) => {
        setNotifications(
          (current) =>
            current.filter(
              (notification) =>
                notification.id !==
                notificationId
            )
        );
      },
      []
    );

  const clearNotifications =
    useCallback(() => {
      setNotifications(
        []
      );
    }, []);

  const notify = useMemo(
    () => ({
      success: (
        message,
        title = "Success"
      ) =>
        addNotification({
          type: "success",
          title,
          message,
        }),

      error: (
        message,
        title = "Error"
      ) =>
        addNotification({
          type: "error",
          title,
          message,
        }),

      warning: (
        message,
        title = "Warning"
      ) =>
        addNotification({
          type: "warning",
          title,
          message,
        }),

      info: (
        message,
        title = "Information"
      ) =>
        addNotification({
          type: "info",
          title,
          message,
        }),
    }),
    [addNotification]
  );

  /* -------------------------------------------------
     Refresh User
  ------------------------------------------------- */

  const refreshUser =
    useCallback(
      async () => {
        try {
          // Connect API here.
          // Example:
          // const user = await AuthService.getCurrentUser();
          // setUser(user);

          return state.user;
        } catch (error) {
          console.error(
            "Failed to refresh user:",
            error
          );

          throw error;
        }
      },
      [state.user]
    );

  /* -------------------------------------------------
     Switch Organization
  ------------------------------------------------- */

  const switchOrganization =
    useCallback(
      async (
        organizationId
      ) => {
        const organization =
          state.organizations.find(
            (
              item
            ) =>
              item.id ===
              organizationId
          );

        if (
          !organization
        ) {
          throw new Error(
            "Organization not found."
          );
        }

        setOrganization(
          organization
        );

        return organization;
      },
      [
        state.organizations,
        setOrganization,
      ]
    );

  /* -------------------------------------------------
     Computed Values
  ------------------------------------------------- */

  const isAdmin =
    useMemo(() => {
      const roles =
        state.user?.roles ||
        [];

      const role =
        state.user?.role;

      return (
        roles.includes(
          "admin"
        ) ||
        roles.includes(
          "super_admin"
        ) ||
        role ===
          "admin" ||
        role ===
          "super_admin"
      );
    }, [state.user]);

  const isSuperAdmin =
    useMemo(() => {
      const roles =
        state.user?.roles ||
        [];

      return (
        roles.includes(
          "super_admin"
        ) ||
        state.user?.role ===
          "super_admin"
      );
    }, [state.user]);

  /* -------------------------------------------------
     Context Value
  ------------------------------------------------- */

  const value =
    useMemo(
      () => ({
        /* State */
        user: state.user,

        organization:
          state.organization,

        organizations:
          state.organizations,

        isAuthenticated:
          state.isAuthenticated,

        isLoading:
          state.isLoading,

        initialized:
          state.initialized,

        /* Computed */
        isAdmin,

        isSuperAdmin,

        /* Auth */
        setUser,

        login,

        logout,

        refreshUser,

        /* Organizations */
        setOrganization,

        setOrganizations,

        addOrganization,

        updateOrganization,

        removeOrganization,

        switchOrganization,

        /* Notifications */
        notifications,

        addNotification,

        removeNotification,

        clearNotifications,

        notify,
      }),
      [
        state,

        isAdmin,

        isSuperAdmin,

        setUser,

        login,

        logout,

        refreshUser,

        setOrganization,

        setOrganizations,

        addOrganization,

        updateOrganization,

        removeOrganization,

        switchOrganization,

        notifications,

        addNotification,

        removeNotification,

        clearNotifications,

        notify,
      ]
    );

  return (
    <AdminContext.Provider
      value={value}
    >
      <ObservabilityProvider>
        <AccessControlProvider
          user={state.user}
        >
          <PromptProvider>
            {children}
          </PromptProvider>
        </AccessControlProvider>
      </ObservabilityProvider>
    </AdminContext.Provider>
  );
}

/* -------------------------------------------------
   Hook
------------------------------------------------- */

export function useAdmin() {
  const context =
    useContext(
      AdminContext
    );

  if (!context) {
    throw new Error(
      "useAdmin must be used inside AdminProvider."
    );
  }

  return context;
}

/* -------------------------------------------------
   Authentication Hook
------------------------------------------------- */

export function useAdminAuth() {
  const {
    user,

    isAuthenticated,

    isLoading,

    login,

    logout,

    refreshUser,
  } = useAdmin();

  return {
    user,

    isAuthenticated,

    isLoading,

    login,

    logout,

    refreshUser,
  };
}

/* -------------------------------------------------
   Organization Hook
------------------------------------------------- */

export function useAdminOrganization() {
  const {
    organization,

    organizations,

    setOrganization,

    addOrganization,

    updateOrganization,

    removeOrganization,

    switchOrganization,
  } = useAdmin();

  return {
    organization,

    organizations,

    setOrganization,

    addOrganization,

    updateOrganization,

    removeOrganization,

    switchOrganization,
  };
}

/* -------------------------------------------------
   Notification Hook
------------------------------------------------- */

export function useAdminNotifications() {
  const {
    notifications,

    addNotification,

    removeNotification,

    clearNotifications,

    notify,
  } = useAdmin();

  return {
    notifications,

    addNotification,

    removeNotification,

    clearNotifications,

    notify,
  };
}

/* -------------------------------------------------
   Default Export
------------------------------------------------- */

export default AdminProvider;