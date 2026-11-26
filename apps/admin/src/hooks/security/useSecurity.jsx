import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * Security Hook
 * Admin Dashboard
 *
 * Handles:
 * - Security settings
 * - Two-factor authentication
 * - Active sessions
 * - Login activity
 * - Security events
 * - Session revocation
 *
 * Replace the mock securityApi with your
 * actual services/securityApi.jsx service.
 */

/* ----------------------------------------
 * Initial State
 * -------------------------------------- */

const initialSecuritySettings = {
  twoFactorEnabled: false,
  passwordLastChangedAt: null,
  loginNotificationsEnabled: true,
  sessionTimeoutMinutes: 30,
};

const initialSessions = [];

const initialLoginActivity = [];

/* ----------------------------------------
 * Mock Security API
 * -------------------------------------- */

const securityApi = {
  getSecuritySettings: async () => {
    return initialSecuritySettings;
  },

  getSessions: async () => {
    return initialSessions;
  },

  getLoginActivity: async () => {
    return initialLoginActivity;
  },

  updateSecuritySettings: async (
    settings
  ) => {
    return settings;
  },

  revokeSession: async (
    sessionId
  ) => {
    return {
      success: true,
      sessionId,
    };
  },

  revokeAllSessions: async () => {
    return {
      success: true,
    };
  },

  enableTwoFactor: async () => {
    return {
      success: true,
    };
  },

  disableTwoFactor: async () => {
    return {
      success: true,
    };
  },
};

/* ----------------------------------------
 * useSecurity Hook
 * -------------------------------------- */

export const useSecurity = (
  userId = null
) => {
  const [
    securitySettings,
    setSecuritySettings,
  ] = useState(
    initialSecuritySettings
  );

  const [sessions, setSessions] =
    useState(initialSessions);

  const [
    loginActivity,
    setLoginActivity,
  ] = useState(
    initialLoginActivity
  );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  /* --------------------------------------
   * Fetch Security Data
   * ------------------------------------ */

  const fetchSecurityData =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          settings,
          sessionData,
          activityData,
        ] = await Promise.all([
          securityApi.getSecuritySettings(),
          securityApi.getSessions(),
          securityApi.getLoginActivity(),
        ]);

        setSecuritySettings(
          settings
        );

        setSessions(
          Array.isArray(sessionData)
            ? sessionData
            : []
        );

        setLoginActivity(
          Array.isArray(activityData)
            ? activityData
            : []
        );
      } catch (err) {
        setError(
          err?.message ||
            "Failed to load security information."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  /* --------------------------------------
   * Update Security Settings
   * ------------------------------------ */

  const updateSecuritySettings =
    useCallback(
      async (updates) => {
        try {
          setLoading(true);
          setError(null);

          const updatedSettings = {
            ...securitySettings,
            ...updates,
          };

          const result =
            await securityApi.updateSecuritySettings(
              updatedSettings
            );

          setSecuritySettings(
            result
          );

          return {
            success: true,
            data: result,
          };
        } catch (err) {
          const message =
            err?.message ||
            "Failed to update security settings.";

          setError(message);

          return {
            success: false,
            error: message,
          };
        } finally {
          setLoading(false);
        }
      },
      [securitySettings]
    );

  /* --------------------------------------
   * Enable Two-Factor Authentication
   * ------------------------------------ */

  const enableTwoFactor =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        await securityApi.enableTwoFactor();

        setSecuritySettings(
          (current) => ({
            ...current,
            twoFactorEnabled: true,
          })
        );

        return {
          success: true,
        };
      } catch (err) {
        const message =
          err?.message ||
          "Failed to enable two-factor authentication.";

        setError(message);

        return {
          success: false,
          error: message,
        };
      } finally {
        setLoading(false);
      }
    }, []);

  /* --------------------------------------
   * Disable Two-Factor Authentication
   * ------------------------------------ */

  const disableTwoFactor =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        await securityApi.disableTwoFactor();

        setSecuritySettings(
          (current) => ({
            ...current,
            twoFactorEnabled: false,
          })
        );

        return {
          success: true,
        };
      } catch (err) {
        const message =
          err?.message ||
          "Failed to disable two-factor authentication.";

        setError(message);

        return {
          success: false,
          error: message,
        };
      } finally {
        setLoading(false);
      }
    }, []);

  /* --------------------------------------
   * Revoke One Session
   * ------------------------------------ */

  const revokeSession =
    useCallback(async (sessionId) => {
      if (!sessionId) {
        return {
          success: false,
          error:
            "Session ID is required.",
        };
      }

      try {
        setError(null);

        await securityApi.revokeSession(
          sessionId
        );

        setSessions(
          (currentSessions) =>
            currentSessions.filter(
              (session) =>
                session.id !==
                sessionId
            )
        );

        return {
          success: true,
        };
      } catch (err) {
        const message =
          err?.message ||
          "Failed to revoke session.";

        setError(message);

        return {
          success: false,
          error: message,
        };
      }
    }, []);

  /* --------------------------------------
   * Revoke All Sessions
   * ------------------------------------ */

  const revokeAllSessions =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        await securityApi.revokeAllSessions();

        setSessions([]);

        return {
          success: true,
        };
      } catch (err) {
        const message =
          err?.message ||
          "Failed to revoke all sessions.";

        setError(message);

        return {
          success: false,
          error: message,
        };
      } finally {
        setLoading(false);
      }
    }, []);

  /* --------------------------------------
   * Refresh Security Data
   * ------------------------------------ */

  const refresh =
    useCallback(async () => {
      await fetchSecurityData();
    }, [fetchSecurityData]);

  /* --------------------------------------
   * Clear Error
   * ------------------------------------ */

  const clearError =
    useCallback(() => {
      setError(null);
    }, []);

  /* --------------------------------------
   * Computed Values
   * ------------------------------------ */

  const activeSessions = useMemo(() => {
    return sessions.filter(
      (session) =>
        session.status === "active" ||
        session.status === undefined
    );
  }, [sessions]);

  const activeSessionCount =
    activeSessions.length;

  const hasTwoFactor =
    securitySettings.twoFactorEnabled;

  const isSecurityConfigured =
    useMemo(() => {
      return (
        hasTwoFactor &&
        securitySettings.loginNotificationsEnabled
      );
    }, [
      hasTwoFactor,
      securitySettings.loginNotificationsEnabled,
    ]);

  /* --------------------------------------
   * Automatically Fetch Data
   * ------------------------------------ */

  useEffect(() => {
    if (userId) {
      fetchSecurityData();
    }
  }, [
    userId,
    fetchSecurityData,
  ]);

  /* --------------------------------------
   * Return Hook API
   * ------------------------------------ */

  return {
    // Security data
    securitySettings,
    sessions,
    activeSessions,
    loginActivity,

    // State
    loading,
    error,

    // Computed values
    activeSessionCount,
    hasTwoFactor,
    isSecurityConfigured,

    // Actions
    fetchSecurityData,
    updateSecuritySettings,
    enableTwoFactor,
    disableTwoFactor,
    revokeSession,
    revokeAllSessions,
    refresh,
    clearError,
  };
};

export default useSecurity;