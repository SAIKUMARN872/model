import React, {
  useEffect,
  useRef,
  useState,
} from "react";

export default function AdminHeader({
  title = "Admin Dashboard",
  subtitle = "",
  onMenuClick,
  onLogout,
  user = {
    name: "Administrator",
    email: "admin@example.com",
    role: "Admin",
  },
}) {
  const [showNotifications, setShowNotifications] =
    useState(false);

  const [showProfile, setShowProfile] =
    useState(false);

  const [darkMode, setDarkMode] =
    useState(false);

  const [notifications, setNotifications] =
    useState([
      {
        id: 1,
        title: "System Health",
        message:
          "All services are operating normally.",
        time: "2 min ago",
        unread: true,
      },
      {
        id: 2,
        title: "New User",
        message:
          "A new organization administrator joined.",
        time: "15 min ago",
        unread: true,
      },
      {
        id: 3,
        title: "Security Alert",
        message:
          "Security scan completed successfully.",
        time: "1 hour ago",
        unread: false,
      },
    ]);

  const notificationRef =
    useRef(null);

  const profileRef =
    useRef(null);

  useEffect(() => {
    const handleOutsideClick = (
      event
    ) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
      ) {
        setShowNotifications(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target
        )
      ) {
        setShowProfile(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  const unreadCount =
    notifications.filter(
      (notification) =>
        notification.unread
    ).length;

  const markAllAsRead = () => {
    setNotifications(
      (current) =>
        current.map(
          (notification) => ({
            ...notification,
            unread: false,
          })
        )
    );
  };

  const markAsRead = (id) => {
    setNotifications(
      (current) =>
        current.map(
          (notification) =>
            notification.id === id
              ? {
                  ...notification,
                  unread: false,
                }
              : notification
        )
    );
  };

  const handleLogout = () => {
    setShowProfile(false);

    if (onLogout) {
      onLogout();
      return;
    }

    console.log(
      "Admin logout requested"
    );
  };

  return (
    <header
      style={{
        ...styles.header,
        ...(darkMode
          ? styles.darkHeader
          : {}),
      }}
    >
      {/* Left Section */}
      <div style={styles.leftSection}>
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            style={styles.menuButton}
            aria-label="Open navigation menu"
          >
            <span />
            <span />
            <span />
          </button>
        )}

        <div>
          <h1
            style={{
              ...styles.title,
              ...(darkMode
                ? styles.darkText
                : {}),
            }}
          >
            {title}
          </h1>

          {subtitle && (
            <p
              style={{
                ...styles.subtitle,
                ...(darkMode
                  ? styles.darkMutedText
                  : {}),
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div style={styles.rightSection}>
        {/* System Status */}
        <div style={styles.systemStatus}>
          <span
            style={styles.statusDot}
          />

          <span
            style={{
              ...styles.statusText,
              ...(darkMode
                ? styles.darkMutedText
                : {}),
            }}
          >
            System Operational
          </span>
        </div>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={() =>
            setDarkMode(
              (current) => !current
            )
          }
          style={styles.iconButton}
          aria-label="Toggle theme"
          title="Toggle theme"
        >
          {darkMode ? "☀" : "☾"}
        </button>

        {/* Notifications */}
        <div
          style={styles.dropdownWrapper}
          ref={notificationRef}
        >
          <button
            type="button"
            onClick={() => {
              setShowNotifications(
                (current) => !current
              );
              setShowProfile(false);
            }}
            style={styles.iconButton}
            aria-label="Notifications"
            title="Notifications"
          >
            🔔

            {unreadCount > 0 && (
              <span
                style={styles.notificationBadge}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                ...styles.dropdown,
                ...styles.notificationDropdown,
              }}
            >
              <div
                style={
                  styles.dropdownHeader
                }
              >
                <div>
                  <strong>
                    Notifications
                  </strong>

                  <span
                    style={
                      styles.dropdownSubtitle
                    }
                  >
                    {unreadCount} unread
                  </span>
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={
                      markAllAsRead
                    }
                    style={
                      styles.textButton
                    }
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div
                style={
                  styles.notificationList
                }
              >
                {notifications.length >
                0 ? (
                  notifications.map(
                    (notification) => (
                      <button
                        key={
                          notification.id
                        }
                        type="button"
                        onClick={() =>
                          markAsRead(
                            notification.id
                          )
                        }
                        style={{
                          ...styles.notificationItem,
                          ...(notification.unread
                            ? styles.unreadNotification
                            : {}),
                        }}
                      >
                        <div
                          style={
                            styles.notificationTop
                          }
                        >
                          <strong>
                            {
                              notification.title
                            }
                          </strong>

                          {notification.unread && (
                            <span
                              style={
                                styles.unreadDot
                              }
                            />
                          )}
                        </div>

                        <p
                          style={
                            styles.notificationMessage
                          }
                        >
                          {
                            notification.message
                          }
                        </p>

                        <span
                          style={
                            styles.notificationTime
                          }
                        >
                          {
                            notification.time
                          }
                        </span>
                      </button>
                    )
                  )
                ) : (
                  <div
                    style={
                      styles.emptyNotifications
                    }
                  >
                    No notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div
          style={styles.dropdownWrapper}
          ref={profileRef}
        >
          <button
            type="button"
            onClick={() => {
              setShowProfile(
                (current) => !current
              );
              setShowNotifications(
                false
              );
            }}
            style={styles.profileButton}
            aria-label="Open admin profile"
          >
            <div
              style={styles.avatar}
            >
              {getInitials(
                user.name
              )}
            </div>

            <div
              style={styles.profileInfo}
            >
              <strong
                style={{
                  ...styles.profileName,
                  ...(darkMode
                    ? styles.darkText
                    : {}),
                }}
              >
                {user.name}
              </strong>

              <span
                style={{
                  ...styles.profileRole,
                  ...(darkMode
                    ? styles.darkMutedText
                    : {}),
                }}
              >
                {user.role}
              </span>
            </div>

            <span
              style={styles.chevron}
            >
              ▾
            </span>
          </button>

          {showProfile && (
            <div
              style={styles.profileDropdown}
            >
              <div
                style={
                  styles.profileDropdownHeader
                }
              >
                <div
                  style={styles.largeAvatar}
                >
                  {getInitials(
                    user.name
                  )}
                </div>

                <div>
                  <strong>
                    {user.name}
                  </strong>

                  <span
                    style={
                      styles.emailText
                    }
                  >
                    {user.email}
                  </span>
                </div>
              </div>

              <div
                style={
                  styles.profileMenu
                }
              >
                <button
                  type="button"
                  style={
                    styles.profileMenuItem
                  }
                  onClick={() =>
                    console.log(
                      "Open profile"
                    )
                  }
                >
                  <span>👤</span>
                  My Profile
                </button>

                <button
                  type="button"
                  style={
                    styles.profileMenuItem
                  }
                  onClick={() =>
                    console.log(
                      "Open settings"
                    )
                  }
                >
                  <span>⚙</span>
                  Settings
                </button>

                <button
                  type="button"
                  style={{
                    ...styles.profileMenuItem,
                    ...styles.logoutItem,
                  }}
                  onClick={
                    handleLogout
                  }
                >
                  <span>↪</span>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function getInitials(name) {
  if (!name) {
    return "A";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (word) =>
        word.charAt(0).toUpperCase()
    )
    .join("");
}

const styles = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: "72px",
    padding: "0 24px",
    backgroundColor: "#ffffff",
    borderBottom:
      "1px solid #e2e8f0",
    boxShadow:
      "0 2px 8px rgba(15, 23, 42, 0.04)",
  },

  darkHeader: {
    backgroundColor: "#0f172a",
    borderBottom:
      "1px solid #1e293b",
  },

  leftSection: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },

  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  menuButton: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "4px",
    width: "38px",
    height: "38px",
    padding: "8px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    cursor: "pointer",
  },

  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 700,
    color: "#0f172a",
  },

  subtitle: {
    margin: "4px 0 0",
    color: "#64748b",
    fontSize: "12px",
  },

  darkText: {
    color: "#f8fafc",
  },

  darkMutedText: {
    color: "#94a3b8",
  },

  systemStatus: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    padding:
      "7px 11px",
    borderRadius: "20px",
    backgroundColor: "#f0fdf4",
  },

  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#22c55e",
  },

  statusText: {
    color: "#15803d",
    fontSize: "12px",
    fontWeight: 600,
  },

  iconButton: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "38px",
    height: "38px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    fontSize: "16px",
    cursor: "pointer",
  },

  notificationBadge: {
    position: "absolute",
    top: "-5px",
    right: "-5px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: "17px",
    height: "17px",
    padding: "0 4px",
    borderRadius: "20px",
    backgroundColor: "#ef4444",
    color: "#ffffff",
    fontSize: "10px",
    fontWeight: 700,
  },

  dropdownWrapper: {
    position: "relative",
  },

  dropdown: {
    position: "absolute",
    top: "48px",
    right: 0,
    width: "360px",
    backgroundColor: "#ffffff",
    border:
      "1px solid #e2e8f0",
    borderRadius: "10px",
    boxShadow:
      "0 15px 40px rgba(15, 23, 42, 0.15)",
    overflow: "hidden",
  },

  notificationDropdown: {
    maxHeight: "480px",
  },

  dropdownHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px",
    borderBottom:
      "1px solid #e2e8f0",
  },

  dropdownSubtitle: {
    display: "block",
    marginTop: "4px",
    color: "#94a3b8",
    fontSize: "11px",
  },

  textButton: {
    border: "none",
    backgroundColor: "transparent",
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
  },

  notificationList: {
    maxHeight: "390px",
    overflowY: "auto",
  },

  notificationItem: {
    display: "block",
    width: "100%",
    padding: "14px 16px",
    border: "none",
    borderBottom:
      "1px solid #f1f5f9",
    backgroundColor: "#ffffff",
    textAlign: "left",
    cursor: "pointer",
  },

  unreadNotification: {
    backgroundColor: "#eff6ff",
  },

  notificationTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "13px",
  },

  unreadDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    backgroundColor: "#2563eb",
  },

  notificationMessage: {
    margin:
      "6px 0",
    color: "#64748b",
    fontSize: "12px",
    lineHeight: 1.5,
  },

  notificationTime: {
    color: "#94a3b8",
    fontSize: "10px",
  },

  emptyNotifications: {
    padding: "35px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "13px",
  },

  profileButton: {
    display: "flex",
    alignItems: "center",
    gap: "9px",
    padding: "4px",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
  },

  avatar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: 700,
  },

  profileInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },

  profileName: {
    color: "#0f172a",
    fontSize: "13px",
  },

  profileRole: {
    marginTop: "2px",
    color: "#64748b",
    fontSize: "11px",
  },

  chevron: {
    marginLeft: "3px",
    color: "#64748b",
    fontSize: "12px",
  },

  profileDropdown: {
    position: "absolute",
    top: "50px",
    right: 0,
    width: "260px",
    backgroundColor: "#ffffff",
    border:
      "1px solid #e2e8f0",
    borderRadius: "10px",
    boxShadow:
      "0 15px 40px rgba(15, 23, 42, 0.15)",
    overflow: "hidden",
  },

  profileDropdownHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    borderBottom:
      "1px solid #e2e8f0",
  },

  largeAvatar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontWeight: 700,
  },

  emailText: {
    display: "block",
    marginTop: "4px",
    color: "#64748b",
    fontSize: "10px",
  },

  profileMenu: {
    padding: "7px",
  },

  profileMenuItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    padding: "10px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "transparent",
    color: "#334155",
    textAlign: "left",
    fontSize: "13px",
    cursor: "pointer",
  },

  logoutItem: {
    color: "#dc2626",
  },
};