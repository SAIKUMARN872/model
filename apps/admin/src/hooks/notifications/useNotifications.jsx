"use client";

import { useMemo, useState } from "react";

const INITIAL_NOTIFICATIONS = [
  {
    id: "notification-001",
    title: "Security policy updated",
    message:
      "The organization security policy was updated by an administrator.",
    type: "security",
    priority: "high",
    read: false,
    timestamp: "2 minutes ago",
  },
  {
    id: "notification-002",
    title: "New user joined",
    message:
      "A new user has been added to your organization workspace.",
    type: "user",
    priority: "normal",
    read: false,
    timestamp: "15 minutes ago",
  },
  {
    id: "notification-003",
    title: "Backup completed",
    message:
      "The scheduled platform backup completed successfully.",
    type: "system",
    priority: "normal",
    read: true,
    timestamp: "1 hour ago",
  },
  {
    id: "notification-004",
    title: "Billing update required",
    message:
      "Your organization billing information requires administrator attention.",
    type: "billing",
    priority: "high",
    read: false,
    timestamp: "3 hours ago",
  },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(
    INITIAL_NOTIFICATIONS
  );

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) => !notification.read
      ).length,
    [notifications]
  );

  function markAsRead(notificationId) {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  }

  function markAllAsRead() {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  }

  function removeNotification(notificationId) {
    setNotifications((currentNotifications) =>
      currentNotifications.filter(
        (notification) =>
          notification.id !== notificationId
      )
    );
  }

  return (
    <section aria-label="Notifications">
      <header>
        <div>
          <h2>Notifications</h2>

          <p>
            Stay informed about security, system, user, and
            billing activity.
          </p>
        </div>

        <div>
          <span>
            {unreadCount} unread
          </span>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
            >
              Mark all as read
            </button>
          )}
        </div>
      </header>

      {notifications.length === 0 ? (
        <div>
          <h3>You're all caught up</h3>

          <p>
            There are no notifications to display.
          </p>
        </div>
      ) : (
        <ul>
          {notifications.map((notification) => (
            <li
              key={notification.id}
              aria-label={notification.title}
            >
              <div>
                <strong>
                  {notification.title}
                </strong>

                <span>
                  {notification.priority}
                </span>
              </div>

              <p>{notification.message}</p>

              <small>
                {notification.type} ·{" "}
                {notification.timestamp}
              </small>

              <div>
                {!notification.read && (
                  <button
                    type="button"
                    onClick={() =>
                      markAsRead(notification.id)
                    }
                  >
                    Mark as read
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    removeNotification(notification.id)
                  }
                >
                  Dismiss
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}