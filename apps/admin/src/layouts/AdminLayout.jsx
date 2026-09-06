import React, {
  useEffect,
  useState,
} from "react";

import AdminHeader from "./components/AdminHeader";
import AdminSidebar from "./components/AdminSidebar";

export default function AdminLayout({
  children,
  title = "Admin Dashboard",
  subtitle = "Manage your AI platform",
  user,
  onLogout,
}) {
  const [sidebarOpen, setSidebarOpen] =
    useState(true);

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [currentPath, setCurrentPath] =
    useState(getCurrentPath());

  // Track browser URL changes
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(
        getCurrentPath()
      );
    };

    window.addEventListener(
      "popstate",
      handleLocationChange
    );

    return () => {
      window.removeEventListener(
        "popstate",
        handleLocationChange
      );
    };
  }, []);

  // Update layout when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 900) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, []);

  // Navigate to a page
  const handleNavigate = (
    path
  ) => {
    if (!path) {
      return;
    }

    setCurrentPath(path);

    // Close sidebar on mobile
    if (
      window.innerWidth < 900
    ) {
      setSidebarOpen(false);
    }

    // If React Router is available,
    // navigation should be handled there.
    window.history.pushState(
      {},
      "",
      path
    );

    window.dispatchEvent(
      new PopStateEvent(
        "popstate"
      )
    );
  };

  // Open / close sidebar
  const handleMenuClick = () => {
    setSidebarOpen(
      (current) => !current
    );
  };

  // Close sidebar
  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  // Toggle sidebar width
  const handleToggleCollapse = () => {
    setSidebarCollapsed(
      (current) => !current
    );
  };

  // Logout handler
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }

    console.log(
      "Admin logout requested"
    );
  };

  return (
    <div
      style={
        styles.layout
      }
    >
      {/* Sidebar */}
      <AdminSidebar
        currentPath={
          currentPath
        }
        isOpen={
          sidebarOpen
        }
        collapsed={
          sidebarCollapsed
        }
        onNavigate={
          handleNavigate
        }
        onClose={
          handleCloseSidebar
        }
        onToggleCollapse={
          handleToggleCollapse
        }
      />

      {/* Main Application Area */}
      <div
        style={{
          ...styles.mainContainer,
          ...(sidebarOpen
            ? sidebarCollapsed
              ? styles.mainWithCollapsedSidebar
              : styles.mainWithSidebar
            : styles.mainWithoutSidebar),
        }}
      >
        {/* Header */}
        <AdminHeader
          title={title}
          subtitle={subtitle}
          user={
            user || {
              name: "Administrator",
              email:
                "admin@example.com",
              role: "Admin",
            }
          }
          onMenuClick={
            handleMenuClick
          }
          onLogout={
            handleLogout
          }
        />

        {/* Page Content */}
        <main
          style={
            styles.content
          }
        >
          <div
            style={
              styles.contentContainer
            }
          >
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer
          style={
            styles.footer
          }
        >
          <span>
            ©{" "}
            {new Date().getFullYear()}{" "}
            AI Platform
          </span>

          <div
            style={
              styles.footerLinks
            }
          >
            <button
              type="button"
              onClick={() =>
                handleNavigate(
                  "/settings"
                )
              }
              style={
                styles.footerButton
              }
            >
              Settings
            </button>

            <span>
              •
            </span>

            <button
              type="button"
              onClick={() =>
                handleNavigate(
                  "/security"
                )
              }
              style={
                styles.footerButton
              }
            >
              Security
            </button>

            <span>
              •
            </span>

            <button
              type="button"
              onClick={() =>
                handleNavigate(
                  "/audit"
                )
              }
              style={
                styles.footerButton
              }
            >
              Audit Logs
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function getCurrentPath() {
  if (
    typeof window ===
    "undefined"
  ) {
    return "/dashboard";
  }

  return (
    window.location.pathname ||
    "/dashboard"
  );
}

const styles = {
  layout: {
    display: "flex",
    minHeight: "100vh",
    width: "100%",
    backgroundColor:
      "#f8fafc",
  },

  mainContainer: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    width: "100%",
    transition:
      "margin-left 0.2s ease",
  },

  mainWithSidebar: {
    marginLeft: "260px",
  },

  mainWithCollapsedSidebar: {
    marginLeft: "76px",
  },

  mainWithoutSidebar: {
    marginLeft: "0",
  },

  content: {
    flex: 1,
    width: "100%",
    padding: "24px",
    boxSizing: "border-box",
  },

  contentContainer: {
    width: "100%",
    maxWidth: "1600px",
    margin: "0 auto",
  },

  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent:
      "space-between",
    minHeight: "52px",
    padding:
      "0 24px",
    borderTop:
      "1px solid #e2e8f0",
    backgroundColor:
      "#ffffff",
    color: "#64748b",
    fontSize: "11px",
  },

  footerLinks: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  footerButton: {
    border: "none",
    backgroundColor:
      "transparent",
    color: "#64748b",
    fontSize: "11px",
    cursor: "pointer",
  },
};