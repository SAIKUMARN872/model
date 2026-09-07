"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import consoleApi from "../services/consoleApi";

import {
  normalizeApiError,
} from "../errors/ApiError";

/**
 * Enterprise Console Hook
 *
 * Responsibilities:
 * - Console overview
 * - Workspace information
 * - System health
 * - Recent activity
 * - Notifications
 * - Console statistics
 * - Workspace settings
 * - Refresh support
 * - Loading states
 * - Error normalization
 * - Partial API failure handling
 */

/**
 * Normalize API response.
 */
const normalizeResponse = (
  response
) => {
  if (!response) {
    return {};
  }

  if (
    response.data &&
    typeof response.data === "object"
  ) {
    return response.data;
  }

  return response;
};

/**
 * Normalize collection response.
 */
const normalizeCollection = (
  response,
  keys = []
) => {
  const data =
    normalizeResponse(response);

  if (Array.isArray(data)) {
    return data;
  }

  for (const key of keys) {
    if (Array.isArray(data[key])) {
      return data[key];
    }
  }

  if (Array.isArray(data.items)) {
    return data.items;
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  return [];
};

/**
 * Main useConsole hook.
 */
const useConsole = (
  options = {}
) => {
  const {
    enabled = true,
    autoRefresh = false,
    refreshInterval = 60000,
  } = options;

  /**
   * Console overview.
   */
  const [
    overview,
    setOverview,
  ] = useState(null);

  /**
   * Workspace information.
   */
  const [
    workspace,
    setWorkspace,
  ] = useState(null);

  /**
   * System health.
   */
  const [
    health,
    setHealth,
  ] = useState(null);

  /**
   * Recent activity.
   */
  const [
    activity,
    setActivity,
  ] = useState([]);

  /**
   * Notifications.
   */
  const [
    notifications,
    setNotifications,
  ] = useState([]);

  /**
   * Console statistics.
   */
  const [
    statistics,
    setStatistics,
  ] = useState(null);

  /**
   * Workspace settings.
   */
  const [
    workspaceSettings,
    setWorkspaceSettings,
  ] = useState(null);

  /**
   * Global loading state.
   */
  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  /**
   * Fetching state.
   */
  const [
    isFetching,
    setIsFetching,
  ] = useState(false);

  /**
   * Individual loading states.
   */
  const [
    isLoadingOverview,
    setIsLoadingOverview,
  ] = useState(false);

  const [
    isLoadingWorkspace,
    setIsLoadingWorkspace,
  ] = useState(false);

  const [
    isLoadingHealth,
    setIsLoadingHealth,
  ] = useState(false);

  const [
    isLoadingActivity,
    setIsLoadingActivity,
  ] = useState(false);

  const [
    isLoadingNotifications,
    setIsLoadingNotifications,
  ] = useState(false);

  const [
    isLoadingStatistics,
    setIsLoadingStatistics,
  ] = useState(false);

  const [
    isLoadingSettings,
    setIsLoadingSettings,
  ] = useState(false);

  /**
   * Notification action state.
   */
  const [
    isMarkingNotification,
    setIsMarkingNotification,
  ] = useState(false);

  /**
   * Settings update state.
   */
  const [
    isUpdatingSettings,
    setIsUpdatingSettings,
  ] = useState(false);

  /**
   * Global error.
   */
  const [
    error,
    setError,
  ] = useState(null);

  /**
   * Individual errors.
   */
  const [
    overviewError,
    setOverviewError,
  ] = useState(null);

  const [
    workspaceError,
    setWorkspaceError,
  ] = useState(null);

  const [
    healthError,
    setHealthError,
  ] = useState(null);

  const [
    activityError,
    setActivityError,
  ] = useState(null);

  const [
    notificationError,
    setNotificationError,
  ] = useState(null);

  const [
    statisticsError,
    setStatisticsError,
  ] = useState(null);

  const [
    settingsError,
    setSettingsError,
  ] = useState(null);

  /**
   * Last successful fetch timestamp.
   */
  const [
    lastFetchedAt,
    setLastFetchedAt,
  ] = useState(null);

  /**
   * Fetch console overview.
   */
  const fetchOverview =
    useCallback(
      async (
        requestOptions = {}
      ) => {
        if (
          !enabled &&
          !requestOptions.force
        ) {
          return null;
        }

        setIsLoadingOverview(
          true
        );

        setOverviewError(null);

        try {
          const response =
            await consoleApi.getOverview();

          const data =
            normalizeResponse(
              response
            );

          setOverview(data);

          return data;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/console/overview",
                method: "GET",
              }
            );

          setOverviewError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsLoadingOverview(
            false
          );
        }
      },
      [enabled]
    );

  /**
   * Fetch workspace information.
   */
  const fetchWorkspace =
    useCallback(
      async (
        requestOptions = {}
      ) => {
        if (
          !enabled &&
          !requestOptions.force
        ) {
          return null;
        }

        setIsLoadingWorkspace(
          true
        );

        setWorkspaceError(null);

        try {
          const response =
            await consoleApi.getWorkspace();

          const data =
            normalizeResponse(
              response
            );

          setWorkspace(data);

          return data;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/console/workspace",
                method: "GET",
              }
            );

          setWorkspaceError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsLoadingWorkspace(
            false
          );
        }
      },
      [enabled]
    );

  /**
   * Fetch system health.
   */
  const fetchHealth =
    useCallback(
      async (
        requestOptions = {}
      ) => {
        if (
          !enabled &&
          !requestOptions.force
        ) {
          return null;
        }

        setIsLoadingHealth(
          true
        );

        setHealthError(null);

        try {
          const response =
            await consoleApi.getHealth();

          const data =
            normalizeResponse(
              response
            );

          setHealth(data);

          return data;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/console/health",
                method: "GET",
              }
            );

          setHealthError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsLoadingHealth(
            false
          );
        }
      },
      [enabled]
    );

  /**
   * Fetch recent activity.
   */
  const fetchActivity =
    useCallback(
      async (
        requestOptions = {}
      ) => {
        if (
          !enabled &&
          !requestOptions.force
        ) {
          return [];
        }

        setIsLoadingActivity(
          true
        );

        setActivityError(null);

        try {
          const response =
            await consoleApi.getActivity();

          const items =
            normalizeCollection(
              response,
              [
                "activity",
                "activities",
                "recentActivity",
              ]
            );

          setActivity(items);

          return items;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/console/activity",
                method: "GET",
              }
            );

          setActivityError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsLoadingActivity(
            false
          );
        }
      },
      [enabled]
    );

  /**
   * Fetch notifications.
   */
  const fetchNotifications =
    useCallback(
      async (
        requestOptions = {}
      ) => {
        if (
          !enabled &&
          !requestOptions.force
        ) {
          return [];
        }

        setIsLoadingNotifications(
          true
        );

        setNotificationError(
          null
        );

        try {
          const response =
            await consoleApi.getNotifications();

          const items =
            normalizeCollection(
              response,
              [
                "notifications",
                "items",
              ]
            );

          setNotifications(items);

          return items;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/console/notifications",
                method: "GET",
              }
            );

          setNotificationError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsLoadingNotifications(
            false
          );
        }
      },
      [enabled]
    );

  /**
   * Fetch console statistics.
   */
  const fetchStatistics =
    useCallback(
      async (
        requestOptions = {}
      ) => {
        if (
          !enabled &&
          !requestOptions.force
        ) {
          return null;
        }

        setIsLoadingStatistics(
          true
        );

        setStatisticsError(null);

        try {
          const response =
            await consoleApi.getStatistics();

          const data =
            normalizeResponse(
              response
            );

          setStatistics(data);

          return data;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/console/statistics",
                method: "GET",
              }
            );

          setStatisticsError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsLoadingStatistics(
            false
          );
        }
      },
      [enabled]
    );

  /**
   * Fetch workspace settings.
   */
  const fetchSettings =
    useCallback(
      async (
        requestOptions = {}
      ) => {
        if (
          !enabled &&
          !requestOptions.force
        ) {
          return null;
        }

        setIsLoadingSettings(
          true
        );

        setSettingsError(null);

        try {
          const response =
            await consoleApi.getSettings();

          const data =
            normalizeResponse(
              response
            );

          setWorkspaceSettings(
            data
          );

          return data;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/console/settings",
                method: "GET",
              }
            );

          setSettingsError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsLoadingSettings(
            false
          );
        }
      },
      [enabled]
    );

  /**
   * Fetch complete Console data.
   *
   * Promise.allSettled prevents
   * one failed service from
   * breaking the entire dashboard.
   */
  const fetchConsole =
    useCallback(
      async (
        requestOptions = {}
      ) => {
        if (
          !enabled &&
          !requestOptions.force
        ) {
          return null;
        }

        setIsFetching(true);

        setIsLoading(true);

        setError(null);

        try {
          const results =
            await Promise.allSettled(
              [
                fetchOverview(
                  requestOptions
                ),

                fetchWorkspace(
                  requestOptions
                ),

                fetchHealth(
                  requestOptions
                ),

                fetchActivity(
                  requestOptions
                ),

                fetchNotifications(
                  requestOptions
                ),

                fetchStatistics(
                  requestOptions
                ),

                fetchSettings(
                  requestOptions
                ),
              ]
            );

          const rejected =
            results.filter(
              (result) =>
                result.status ===
                "rejected"
            );

          if (
            rejected.length > 0
          ) {
            setError(
              rejected[0].reason
            );
          }

          setLastFetchedAt(
            new Date()
          );

          return results;
        } finally {
          setIsFetching(false);

          setIsLoading(false);
        }
      },
      [
        enabled,
        fetchOverview,
        fetchWorkspace,
        fetchHealth,
        fetchActivity,
        fetchNotifications,
        fetchStatistics,
        fetchSettings,
      ]
    );

  /**
   * Mark notification as read.
   */
  const markNotificationRead =
    useCallback(
      async (
        notificationId
      ) => {
        if (!notificationId) {
          throw new Error(
            "Notification ID is required."
          );
        }

        setIsMarkingNotification(
          true
        );

        setNotificationError(
          null
        );

        try {
          await consoleApi.markNotificationRead(
            notificationId
          );

          setNotifications(
            (currentNotifications) =>
              currentNotifications.map(
                (notification) =>
                  notification.id ===
                  notificationId
                    ? {
                        ...notification,
                        read: true,
                        isRead: true,
                      }
                    : notification
              )
          );

          return true;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  `/console/notifications/${notificationId}/read`,
                method: "PATCH",
              }
            );

          setNotificationError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsMarkingNotification(
            false
          );
        }
      },
      []
    );

  /**
   * Mark all notifications as read.
   */
  const markAllNotificationsRead =
    useCallback(
      async () => {
        setIsMarkingNotification(
          true
        );

        setNotificationError(
          null
        );

        try {
          await consoleApi.markAllNotificationsRead();

          setNotifications(
            (currentNotifications) =>
              currentNotifications.map(
                (notification) => ({
                  ...notification,
                  read: true,
                  isRead: true,
                })
              )
          );

          return true;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/console/notifications/read-all",
                method: "PATCH",
              }
            );

          setNotificationError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsMarkingNotification(
            false
          );
        }
      },
      []
    );

  /**
   * Update workspace settings.
   */
  const updateSettings =
    useCallback(
      async (
        payload
      ) => {
        if (!payload) {
          throw new Error(
            "Settings payload is required."
          );
        }

        setIsUpdatingSettings(
          true
        );

        setSettingsError(null);

        try {
          const response =
            await consoleApi.updateSettings(
              payload
            );

          const data =
            normalizeResponse(
              response
            );

          setWorkspaceSettings(
            (current) => ({
              ...current,
              ...data,
            })
          );

          return data;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/console/settings",
                method: "PATCH",
              }
            );

          setSettingsError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsUpdatingSettings(
            false
          );
        }
      },
      []
    );

  /**
   * Refresh Console.
   */
  const refresh =
    useCallback(
      async () => {
        return fetchConsole({
          force: true,
        });
      },
      [fetchConsole]
    );

  /**
   * Clear all errors.
   */
  const clearErrors =
    useCallback(
      () => {
        setError(null);

        setOverviewError(null);

        setWorkspaceError(null);

        setHealthError(null);

        setActivityError(null);

        setNotificationError(
          null
        );

        setStatisticsError(null);

        setSettingsError(null);
      },
      []
    );

  /**
   * Initial data fetch.
   */
  useEffect(
    () => {
      if (!enabled) {
        return;
      }

      fetchConsole().catch(
        () => {
          /**
           * Errors are already
           * normalized and stored.
           */
        }
      );
    },
    [
      enabled,
      fetchConsole,
    ]
  );

  /**
   * Automatic refresh.
   */
  useEffect(
    () => {
      if (
        !enabled ||
        !autoRefresh ||
        refreshInterval <= 0
      ) {
        return undefined;
      }

      const intervalId =
        setInterval(
          () => {
            fetchConsole({
              force: true,
            }).catch(() => {
              /**
               * Background refresh
               * errors are handled
               * internally.
               */
            });
          },
          refreshInterval
        );

      return () => {
        clearInterval(
          intervalId
        );
      };
    },
    [
      enabled,
      autoRefresh,
      refreshInterval,
      fetchConsole,
    ]
  );

  /**
   * Derived state:
   * unread notifications.
   */
  const unreadNotifications =
    useMemo(
      () =>
        notifications.filter(
          (notification) =>
            notification.read !==
              true &&
            notification.isRead !==
              true
        ),
      [notifications]
    );

  /**
   * Unread notification count.
   */
  const unreadNotificationCount =
    useMemo(
      () =>
        unreadNotifications.length,
      [unreadNotifications]
    );

  /**
   * Health status.
   */
  const healthStatus =
    useMemo(
      () => {
        if (!health) {
          return "unknown";
        }

        return (
          health.status ||
          health.overallStatus ||
          "unknown"
        );
      },
      [health]
    );

  /**
   * Check whether system is healthy.
   */
  const isHealthy =
    useMemo(
      () =>
        [
          "healthy",
          "operational",
          "ok",
        ].includes(
          String(
            healthStatus
          ).toLowerCase()
        ),
      [healthStatus]
    );

  /**
   * Check whether Console has data.
   */
  const hasData =
    useMemo(
      () =>
        Boolean(
          overview ||
          workspace ||
          health ||
          statistics ||
          workspaceSettings ||
          activity.length > 0 ||
          notifications.length > 0
        ),
      [
        overview,
        workspace,
        health,
        statistics,
        workspaceSettings,
        activity,
        notifications,
      ]
    );

  /**
   * Empty state.
   */
  const isEmpty =
    useMemo(
      () =>
        !isFetching &&
        !hasData,
      [
        isFetching,
        hasData,
      ]
    );

  /**
   * Return public API.
   */
  return {
    /**
     * Console data.
     */
    overview,

    workspace,

    health,

    activity,

    notifications,

    statistics,

    workspaceSettings,

    /**
     * Notification helpers.
     */
    unreadNotifications,

    unreadNotificationCount,

    /**
     * Health helpers.
     */
    healthStatus,

    isHealthy,

    /**
     * Loading.
     */
    isLoading,

    isFetching,

    isLoadingOverview,

    isLoadingWorkspace,

    isLoadingHealth,

    isLoadingActivity,

    isLoadingNotifications,

    isLoadingStatistics,

    isLoadingSettings,

    isMarkingNotification,

    isUpdatingSettings,

    /**
     * Errors.
     */
    error,

    overviewError,

    workspaceError,

    healthError,

    activityError,

    notificationError,

    statisticsError,

    settingsError,

    /**
     * Metadata.
     */
    lastFetchedAt,

    hasData,

    isEmpty,

    /**
     * Fetch methods.
     */
    fetchOverview,

    fetchWorkspace,

    fetchHealth,

    fetchActivity,

    fetchNotifications,

    fetchStatistics,

    fetchSettings,

    fetchConsole,

    refresh,

    /**
     * Notification actions.
     */
    markNotificationRead,

    markAllNotificationsRead,

    /**
     * Settings actions.
     */
    updateSettings,

    /**
     * Error handling.
     */
    clearErrors,
  };
};

export default useConsole;