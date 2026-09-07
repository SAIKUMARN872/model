import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * Notification types supported by the admin system.
 */
export const NOTIFICATION_TYPES = {
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error",
};

/**
 * Notification priorities.
 */
export const NOTIFICATION_PRIORITIES = {
  LOW: "low",
  NORMAL: "normal",
  HIGH: "high",
  URGENT: "urgent",
};

/**
 * Initial notification data.
 */
const initialNotifications = [
  {
    id: "notification-001",
    title: "Welcome to Admin Portal",
    message:
      "Your admin account has been successfully configured.",
    type: "success",
    priority: "normal",
    read: false,
    createdAt: new Date().toISOString(),
  },
];

/**
 * Mock notification API.
 *
 * Replace this with your actual
 * services/notificationApi.jsx service.
 */
const notificationApi = {
  getNotifications: async () => {
    return initialNotifications;
  },

  markAsRead: async (notificationId) => {
    return {
      success: true,
      notificationId,
    };
  },

  markAllAsRead: async () => {
    return {
      success: true,
    };
  },

  deleteNotification: async (
    notificationId
  ) => {
    return {
      success: true,
      notificationId,
    };
  },
};

/**
 * useNotifications Hook
 *
 * Provides:
 * - Notification list
 * - Unread count
 * - Loading state
 * - Error handling
 * - Mark as read
 * - Mark all as read
 * - Delete notification
 * - Refresh notifications
 */
export const useNotifications = (
  options = {}
) => {
  const {
    autoFetch = true,
  } = options;

  const [
    notifications,
    setNotifications,
  ] = useState(
    initialNotifications
  );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  /**
   * Fetch notifications.
   */
  const fetchNotifications =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const data =
          await notificationApi.getNotifications();

        setNotifications(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (err) {
        setError(
          err?.message ||
            "Failed to load notifications."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  /**
   * Mark one notification as read.
   */
  const markAsRead = useCallback(
    async (notificationId) => {
      if (!notificationId) {
        return {
          success: false,
          error:
            "Notification ID is required.",
        };
      }

      try {
        setError(null);

        await notificationApi.markAsRead(
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
                    }
                  : notification
            )
        );

        return {
          success: true,
        };
      } catch (err) {
        const message =
          err?.message ||
          "Failed to mark notification as read.";

        setError(message);

        return {
          success: false,
          error: message,
        };
      }
    },
    []
  );

  /**
   * Mark all notifications as read.
   */
  const markAllAsRead =
    useCallback(async () => {
      try {
        setError(null);

        await notificationApi.markAllAsRead();

        setNotifications(
          (currentNotifications) =>
            currentNotifications.map(
              (notification) => ({
                ...notification,
                read: true,
              })
            )
        );

        return {
          success: true,
        };
      } catch (err) {
        const message =
          err?.message ||
          "Failed to mark all notifications as read.";

        setError(message);

        return {
          success: false,
          error: message,
        };
      }
    }, []);

  /**
   * Delete a notification.
   */
  const deleteNotification =
    useCallback(
      async (notificationId) => {
        if (!notificationId) {
          return {
            success: false,
            error:
              "Notification ID is required.",
          };
        }

        try {
          setError(null);

          await notificationApi.deleteNotification(
            notificationId
          );

          setNotifications(
            (currentNotifications) =>
              currentNotifications.filter(
                (notification) =>
                  notification.id !==
                  notificationId
              )
          );

          return {
            success: true,
          };
        } catch (err) {
          const message =
            err?.message ||
            "Failed to delete notification.";

          setError(message);

          return {
            success: false,
            error: message,
          };
        }
      },
      []
    );

  /**
   * Add a local notification.
   *
   * Useful for displaying immediate
   * frontend notifications.
   */
  const addNotification =
    useCallback(
      ({
        title,
        message,
        type = "info",
        priority = "normal",
      }) => {
        if (!title || !message) {
          return;
        }

        const newNotification = {
          id: `notification-${Date.now()}`,
          title,
          message,
          type,
          priority,
          read: false,
          createdAt:
            new Date().toISOString(),
        };

        setNotifications(
          (currentNotifications) => [
            newNotification,
            ...currentNotifications,
          ]
        );
      },
      []
    );

  /**
   * Refresh notification data.
   */
  const refresh =
    useCallback(async () => {
      await fetchNotifications();
    }, [fetchNotifications]);

  /**
   * Clear error.
   */
  const clearError =
    useCallback(() => {
      setError(null);
    }, []);

  /**
   * Unread notifications.
   */
  const unreadNotifications =
    useMemo(() => {
      return notifications.filter(
        (notification) =>
          !notification.read
      );
    }, [notifications]);

  /**
   * Read notifications.
   */
  const readNotifications =
    useMemo(() => {
      return notifications.filter(
        (notification) =>
          notification.read
      );
    }, [notifications]);

  /**
   * Number of unread notifications.
   */
  const unreadCount = useMemo(() => {
    return unreadNotifications.length;
  }, [unreadNotifications]);

  /**
   * Number of read notifications.
   */
  const readCount = useMemo(() => {
    return readNotifications.length;
  }, [readNotifications]);

  /**
   * Whether unread notifications exist.
   */
  const hasUnread =
    unreadCount > 0;

  /**
   * Automatically fetch notifications.
   */
  useEffect(() => {
    if (autoFetch) {
      fetchNotifications();
    }
  }, [
    autoFetch,
    fetchNotifications,
  ]);

  return {
    // Data
    notifications,
    unreadNotifications,
    readNotifications,

    // Counts
    unreadCount,
    readCount,
    hasUnread,

    // State
    loading,
    error,

    // Actions
    fetchNotifications,
    refresh,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    clearError,
  };
};

export default useNotifications;