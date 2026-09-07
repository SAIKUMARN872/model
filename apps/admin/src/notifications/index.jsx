import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * Notification System
 *
 * Supports:
 * - Success notifications
 * - Error notifications
 * - Warning notifications
 * - Info notifications
 * - Loading notifications
 * - Auto-dismiss
 * - Manual dismissal
 * - Notification updates
 * - Global notification API
 */

/* -------------------------------------------------
   Notification Types
------------------------------------------------- */

export const NOTIFICATION_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
  LOADING: "loading",
};

/* -------------------------------------------------
   Notification Positions
------------------------------------------------- */

export const NOTIFICATION_POSITIONS = {
  TOP_RIGHT: "top-right",
  TOP_LEFT: "top-left",
  TOP_CENTER: "top-center",
  BOTTOM_RIGHT: "bottom-right",
  BOTTOM_LEFT: "bottom-left",
  BOTTOM_CENTER: "bottom-center",
};

/* -------------------------------------------------
   Notification ID
------------------------------------------------- */

function generateNotificationId() {
  if (
    typeof crypto !== "undefined" &&
    crypto.randomUUID
  ) {
    return crypto.randomUUID();
  }

  return `notification-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 9)}`;
}

/* -------------------------------------------------
   Notification Store
------------------------------------------------- */

class NotificationStore {
  constructor() {
    this.notifications = [];
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach(
      (listener) => {
        listener(
          [...this.notifications]
        );
      }
    );
  }

  add(notification) {
    const item = {
      id:
        notification.id ||
        generateNotificationId(),

      type:
        notification.type ||
        NOTIFICATION_TYPES.INFO,

      title:
        notification.title ||
        "",

      message:
        notification.message ||
        "",

      duration:
        notification.duration ??
        5000,

      dismissible:
        notification.dismissible ??
        true,

      createdAt:
        new Date().toISOString(),

      action:
        notification.action ||
        null,

      metadata:
        notification.metadata ||
        {},
    };

    this.notifications = [
      ...this.notifications,
      item,
    ];

    this.notifyListeners();

    return item.id;
  }

  update(
    id,
    updates
  ) {
    this.notifications =
      this.notifications.map(
        (notification) =>
          notification.id === id
            ? {
                ...notification,
                ...updates,
              }
            : notification
      );

    this.notifyListeners();

    return id;
  }

  remove(id) {
    this.notifications =
      this.notifications.filter(
        (notification) =>
          notification.id !== id
      );

    this.notifyListeners();
  }

  clear() {
    this.notifications = [];

    this.notifyListeners();
  }

  getAll() {
    return [
      ...this.notifications,
    ];
  }
}

/* -------------------------------------------------
   Global Store
------------------------------------------------- */

export const notificationStore =
  new NotificationStore();

/* -------------------------------------------------
   Notification API
------------------------------------------------- */

export const notifications = {
  show(options) {
    return notificationStore.add(
      options
    );
  },

  success(
    message,
    options = {}
  ) {
    return notificationStore.add({
      ...options,
      type:
        NOTIFICATION_TYPES.SUCCESS,
      message,
    });
  },

  error(
    message,
    options = {}
  ) {
    return notificationStore.add({
      ...options,
      type:
        NOTIFICATION_TYPES.ERROR,
      message,
      duration:
        options.duration ??
        7000,
    });
  },

  warning(
    message,
    options = {}
  ) {
    return notificationStore.add({
      ...options,
      type:
        NOTIFICATION_TYPES.WARNING,
      message,
    });
  },

  info(
    message,
    options = {}
  ) {
    return notificationStore.add({
      ...options,
      type:
        NOTIFICATION_TYPES.INFO,
      message,
    });
  },

  loading(
    message,
    options = {}
  ) {
    return notificationStore.add({
      ...options,
      type:
        NOTIFICATION_TYPES.LOADING,
      message,
      duration: 0,
    });
  },

  update(
    id,
    updates
  ) {
    return notificationStore.update(
      id,
      updates
    );
  },

  dismiss(id) {
    notificationStore.remove(
      id
    );
  },

  clear() {
    notificationStore.clear();
  },
};

/* -------------------------------------------------
   React Context
------------------------------------------------- */

const NotificationContext =
  createContext(null);

/* -------------------------------------------------
   Notification Provider
------------------------------------------------- */

export function NotificationProvider({
  children,
  position =
    NOTIFICATION_POSITIONS.TOP_RIGHT,
  maxNotifications = 5,
}) {
  const [
    notificationList,
    setNotificationList,
  ] = useState(
    notificationStore.getAll()
  );

  useEffect(() => {
    return notificationStore.subscribe(
      setNotificationList
    );
  }, []);

  const removeNotification =
    useCallback(
      (id) => {
        notificationStore.remove(
          id
        );
      },
      []
    );

  const clearNotifications =
    useCallback(() => {
      notificationStore.clear();
    }, []);

  const contextValue =
    useMemo(
      () => ({
        notifications:
          notificationStore,
        show:
          notifications.show,
        success:
          notifications.success,
        error:
          notifications.error,
        warning:
          notifications.warning,
        info:
          notifications.info,
        loading:
          notifications.loading,
        update:
          notifications.update,
        dismiss:
          notifications.dismiss,
        clear:
          notifications.clear,
      }),
      []
    );

  const visibleNotifications =
    notificationList.slice(
      -maxNotifications
    );

  return (
    <NotificationContext.Provider
      value={
        contextValue
      }
    >
      {children}

      <NotificationContainer
        notifications={
          visibleNotifications
        }
        position={
          position
        }
        onDismiss={
          removeNotification
        }
        onClear={
          clearNotifications
        }
      />
    </NotificationContext.Provider>
  );
}

/* -------------------------------------------------
   Notification Hook
------------------------------------------------- */

export function useNotifications() {
  const context =
    useContext(
      NotificationContext
    );

  if (!context) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider"
    );
  }

  return context;
}

/* -------------------------------------------------
   Notification Container
------------------------------------------------- */

export function NotificationContainer({
  notifications:
    notificationList = [],
  position =
    NOTIFICATION_POSITIONS.TOP_RIGHT,
  onDismiss,
}) {
  if (
    notificationList.length === 0
  ) {
    return null;
  }

  return (
    <div
      style={{
        ...styles.container,
        ...getPositionStyle(
          position
        ),
      }}
      aria-live="polite"
      aria-atomic="true"
    >
      {notificationList.map(
        (notification) => (
          <NotificationItem
            key={
              notification.id
            }
            notification={
              notification
            }
            onDismiss={
              onDismiss
            }
          />
        )
      )}
    </div>
  );
}

/* -------------------------------------------------
   Notification Item
------------------------------------------------- */

export function NotificationItem({
  notification,
  onDismiss,
}) {
  const {
    id,
    type,
    title,
    message,
    duration,
    dismissible,
    action,
  } = notification;

  useEffect(() => {
    if (
      !duration ||
      duration <= 0
    ) {
      return undefined;
    }

    const timer =
      setTimeout(() => {
        onDismiss?.(id);
      }, duration);

    return () =>
      clearTimeout(timer);
  }, [
    id,
    duration,
    onDismiss,
  ]);

  const typeStyle =
    getTypeStyle(type);

  return (
    <div
      style={{
        ...styles.notification,
        ...typeStyle.container,
      }}
      role={
        type ===
        NOTIFICATION_TYPES.ERROR
          ? "alert"
          : "status"
      }
    >
      <div
        style={
          styles.iconContainer
        }
      >
        {getTypeIcon(type)}
      </div>

      <div
        style={
          styles.content
        }
      >
        {title && (
          <div
            style={
              styles.title
            }
          >
            {title}
          </div>
        )}

        {message && (
          <div
            style={
              styles.message
            }
          >
            {message}
          </div>
        )}

        {action && (
          <button
            type="button"
            onClick={() => {
              action.onClick?.();

              if (
                action.dismissOnClick !==
                false
              ) {
                onDismiss?.(id);
              }
            }}
            style={
              styles.actionButton
            }
          >
            {action.label}
          </button>
        )}
      </div>

      {dismissible && (
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={() =>
            onDismiss?.(id)
          }
          style={
            styles.closeButton
          }
        >
          ×
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------
   Promise Notification
------------------------------------------------- */

export async function notifyPromise(
  promise,
  messages = {}
) {
  const loadingId =
    notifications.loading(
      messages.loading ||
        "Processing..."
    );

  try {
    const result =
      await promise;

    notifications.update(
      loadingId,
      {
        type:
          NOTIFICATION_TYPES.SUCCESS,

        message:
          messages.success ||
          "Operation completed successfully.",

        duration:
          messages.duration ??
          5000,
      }
    );

    return result;
  } catch (error) {
    notifications.update(
      loadingId,
      {
        type:
          NOTIFICATION_TYPES.ERROR,

        message:
          messages.error ||
          "Something went wrong.",

        duration:
          messages.errorDuration ??
          7000,
      }
    );

    throw error;
  }
}

/* -------------------------------------------------
   Helper Functions
------------------------------------------------- */

function getTypeIcon(type) {
  switch (type) {
    case NOTIFICATION_TYPES.SUCCESS:
      return "✓";

    case NOTIFICATION_TYPES.ERROR:
      return "✕";

    case NOTIFICATION_TYPES.WARNING:
      return "⚠";

    case NOTIFICATION_TYPES.LOADING:
      return "◌";

    case NOTIFICATION_TYPES.INFO:
    default:
      return "i";
  }
}

function getTypeStyle(type) {
  switch (type) {
    case NOTIFICATION_TYPES.SUCCESS:
      return {
        container: {
          borderLeft:
            "4px solid #16a34a",
        },
      };

    case NOTIFICATION_TYPES.ERROR:
      return {
        container: {
          borderLeft:
            "4px solid #dc2626",
        },
      };

    case NOTIFICATION_TYPES.WARNING:
      return {
        container: {
          borderLeft:
            "4px solid #d97706",
        },
      };

    case NOTIFICATION_TYPES.LOADING:
      return {
        container: {
          borderLeft:
            "4px solid #2563eb",
        },
      };

    case NOTIFICATION_TYPES.INFO:
    default:
      return {
        container: {
          borderLeft:
            "4px solid #0284c7",
        },
      };
  }
}

function getPositionStyle(
  position
) {
  switch (position) {
    case NOTIFICATION_POSITIONS.TOP_LEFT:
      return {
        top: 20,
        left: 20,
      };

    case NOTIFICATION_POSITIONS.TOP_CENTER:
      return {
        top: 20,
        left: "50%",
        transform:
          "translateX(-50%)",
      };

    case NOTIFICATION_POSITIONS.BOTTOM_RIGHT:
      return {
        bottom: 20,
        right: 20,
      };

    case NOTIFICATION_POSITIONS.BOTTOM_LEFT:
      return {
        bottom: 20,
        left: 20,
      };

    case NOTIFICATION_POSITIONS.BOTTOM_CENTER:
      return {
        bottom: 20,
        left: "50%",
        transform:
          "translateX(-50%)",
      };

    case NOTIFICATION_POSITIONS.TOP_RIGHT:
    default:
      return {
        top: 20,
        right: 20,
      };
  }
}

/* -------------------------------------------------
   Styles
------------------------------------------------- */

const styles = {
  container: {
    position: "fixed",
    zIndex: 9999,
    width: "380px",
    maxWidth:
      "calc(100vw - 40px)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    pointerEvents: "none",
  },

  notification: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "16px",
    background:
      "#ffffff",
    borderRadius: "10px",
    boxShadow:
      "0 10px 30px rgba(0, 0, 0, 0.12)",
    pointerEvents: "auto",
    animation:
      "notificationSlideIn 0.25s ease-out",
  },

  iconContainer: {
    width: "28px",
    height: "28px",
    minWidth: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    background:
      "#f1f5f9",
    fontWeight: 700,
  },

  content: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: "4px",
  },

  message: {
    fontSize: "14px",
    lineHeight: 1.5,
    color: "#475569",
  },

  actionButton: {
    marginTop: "10px",
    padding:
      "6px 12px",
    border: "none",
    borderRadius: "6px",
    background:
      "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
  },

  closeButton: {
    width: "24px",
    height: "24px",
    border: "none",
    background:
      "transparent",
    color: "#64748b",
    cursor: "pointer",
    fontSize: "20px",
    lineHeight: 1,
  },
};

/* -------------------------------------------------
   Default Export
------------------------------------------------- */

export default notifications;