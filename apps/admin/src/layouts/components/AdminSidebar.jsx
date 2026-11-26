import React, {
  useEffect,
  useState,
} from "react";

const navigationItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "▦",
    path: "/dashboard",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: "◒",
    path: "/analytics",
  },
  {
    id: "agents",
    label: "Agents",
    icon: "◆",
    path: "/agents",
  },
  {
    id: "models",
    label: "Models",
    icon: "◈",
    path: "/models",
  },
  {
    id: "organizations",
    label: "Organizations",
    icon: "◉",
    path: "/organizations",
  },
  {
    id: "users",
    label: "Users",
    icon: "♙",
    path: "/users",
  },
  {
    id: "teams",
    label: "Teams",
    icon: "♟",
    path: "/teams",
  },
  {
    id: "workspaces",
    label: "Workspaces",
    icon: "▣",
    path: "/workspaces",
  },
  {
    id: "knowledge",
    label: "Knowledge",
    icon: "▤",
    path: "/knowledge",
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: "⊕",
    path: "/integrations",
  },
];

const managementItems = [
  {
    id: "audit",
    label: "Audit Logs",
    icon: "◫",
    path: "/audit",
  },
  {
    id: "billing",
    label: "Billing",
    icon: "◰",
    path: "/billing",
  },
  {
    id: "usage",
    label: "Usage",
    icon: "◔",
    path: "/usage",
  },
  {
    id: "security",
    label: "Security",
    icon: "◇",
    path: "/security",
  },
  {
    id: "compliance",
    label: "Compliance",
    icon: "✓",
    path: "/compliance",
  },
  {
    id: "governance",
    label: "Governance",
    icon: "◎",
    path: "/governance",
  },
];

const systemItems = [
  {
    id: "api-keys",
    label: "API Keys",
    icon: "⚿",
    path: "/api-keys",
  },
  {
    id: "settings",
    label: "Settings",
    icon: "⚙",
    path: "/settings",
  },
];

export default function AdminSidebar({
  currentPath,
  onNavigate,
  isOpen = true,
  onClose,
  collapsed = false,
  onToggleCollapse,
  logo = "AI",
  productName = "AI Platform",
}) {
  const [activePath, setActivePath] =
    useState(
      currentPath ||
        getCurrentPath()
    );

  useEffect(() => {
    if (currentPath) {
      setActivePath(
        currentPath
      );
    }
  }, [currentPath]);

  const handleNavigation = (
    item
  ) => {
    setActivePath(
      item.path
    );

    if (onNavigate) {
      onNavigate(item.path);
    } else {
      window.history.pushState(
        {},
        "",
        item.path
      );

      window.dispatchEvent(
        new PopStateEvent(
          "popstate"
        )
      );
    }

    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          style={
            styles.mobileOverlay
          }
          onClick={onClose}
        />
      )}

      <aside
        style={{
          ...styles.sidebar,
          ...(collapsed
            ? styles.collapsedSidebar
            : {}),
          ...(isOpen
            ? styles.openSidebar
            : styles.closedSidebar),
        }}
      >
        {/* Logo */}
        <div
          style={styles.logoSection}
        >
          <div
            style={styles.logo}
          >
            {logo}
          </div>

          {!collapsed && (
            <div
              style={
                styles.productInfo
              }
            >
              <strong
                style={
                  styles.productName
                }
              >
                {productName}
              </strong>

              <span
                style={
                  styles.productVersion
                }
              >
                Admin Console
              </span>
            </div>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              style={
                styles.mobileCloseButton
              }
              aria-label="Close sidebar"
            >
              ×
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav
          style={styles.navigation}
        >
          <NavigationSection
            title="Platform"
            items={
              navigationItems
            }
            activePath={
              activePath
            }
            collapsed={
              collapsed
            }
            onNavigate={
              handleNavigation
            }
          />

          <NavigationSection
            title="Management"
            items={
              managementItems
            }
            activePath={
              activePath
            }
            collapsed={
              collapsed
            }
            onNavigate={
              handleNavigation
            }
          />

          <NavigationSection
            title="System"
            items={systemItems}
            activePath={
              activePath
            }
            collapsed={
              collapsed
            }
            onNavigate={
              handleNavigation
            }
          />
        </nav>

        {/* Bottom Section */}
        <div
          style={
            styles.bottomSection
          }
        >
          {!collapsed && (
            <div
              style={
                styles.systemHealth
              }
            >
              <div
                style={
                  styles.healthHeader
                }
              >
                <span>
                  System Health
                </span>

                <span
                  style={
                    styles.healthStatus
                  }
                >
                  Healthy
                </span>
              </div>

              <div
                style={
                  styles.healthBar
                }
              >
                <div
                  style={
                    styles.healthProgress
                  }
                />
              </div>

              <span
                style={
                  styles.healthDescription
                }
              >
                All services operational
              </span>
            </div>
          )}

          {onToggleCollapse && (
            <button
              type="button"
              onClick={
                onToggleCollapse
              }
              style={
                styles.collapseButton
              }
              title={
                collapsed
                  ? "Expand sidebar"
                  : "Collapse sidebar"
              }
            >
              <span>
                {collapsed
                  ? "→"
                  : "←"}
              </span>

              {!collapsed && (
                <span>
                  Collapse Sidebar
                </span>
              )}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

function NavigationSection({
  title,
  items,
  activePath,
  collapsed,
  onNavigate,
}) {
  return (
    <div
      style={
        styles.navigationSection
      }
    >
      {!collapsed && (
        <div
          style={
            styles.sectionTitle
          }
        >
          {title}
        </div>
      )}

      <div
        style={
          styles.navigationItems
        }
      >
        {items.map((item) => {
          const isActive =
            isPathActive(
              activePath,
              item.path
            );

          return (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                onNavigate(item)
              }
              title={
                collapsed
                  ? item.label
                  : undefined
              }
              style={{
                ...styles.navigationItem,
                ...(isActive
                  ? styles.activeNavigationItem
                  : {}),
                ...(collapsed
                  ? styles.collapsedNavigationItem
                  : {}),
              }}
            >
              <span
                style={{
                  ...styles.navigationIcon,
                  ...(isActive
                    ? styles.activeNavigationIcon
                    : {}),
                }}
              >
                {item.icon}
              </span>

              {!collapsed && (
                <span
                  style={
                    styles.navigationLabel
                  }
                >
                  {item.label}
                </span>
              )}

              {!collapsed &&
                isActive && (
                  <span
                    style={
                      styles.activeIndicator
                    }
                  />
                )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function isPathActive(
  currentPath,
  itemPath
) {
  if (!currentPath) {
    return false;
  }

  if (
    itemPath === "/dashboard"
  ) {
    return (
      currentPath ===
        "/dashboard" ||
      currentPath === "/"
    );
  }

  return (
    currentPath === itemPath ||
    currentPath.startsWith(
      `${itemPath}/`
    )
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
  sidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 200,
    display: "flex",
    flexDirection: "column",
    width: "260px",
    backgroundColor: "#0f172a",
    color: "#e2e8f0",
    borderRight:
      "1px solid #1e293b",
    transition:
      "width 0.2s ease, transform 0.2s ease",
    overflow: "hidden",
  },

  collapsedSidebar: {
    width: "76px",
  },

  openSidebar: {
    transform:
      "translateX(0)",
  },

  closedSidebar: {
    transform:
      "translateX(-100%)",
  },

  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    minHeight: "72px",
    padding: "0 18px",
    borderBottom:
      "1px solid #1e293b",
  },

  logo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 800,
  },

  productInfo: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },

  productName: {
    color: "#f8fafc",
    fontSize: "14px",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },

  productVersion: {
    marginTop: "3px",
    color: "#64748b",
    fontSize: "10px",
    whiteSpace: "nowrap",
  },

  mobileCloseButton: {
    display: "none",
    marginLeft: "auto",
    width: "32px",
    height: "32px",
    border: "none",
    backgroundColor:
      "transparent",
    color: "#94a3b8",
    fontSize: "24px",
    cursor: "pointer",
  },

  navigation: {
    flex: 1,
    padding: "18px 12px",
    overflowY: "auto",
  },

  navigationSection: {
    marginBottom: "24px",
  },

  sectionTitle: {
    padding:
      "0 10px 8px",
    color: "#64748b",
    fontSize: "10px",
    fontWeight: 700,
    textTransform:
      "uppercase",
    letterSpacing:
      "0.08em",
  },

  navigationItems: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },

  navigationItem: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    minHeight: "42px",
    padding:
      "9px 12px",
    border: "none",
    borderRadius: "8px",
    backgroundColor:
      "transparent",
    color: "#94a3b8",
    textAlign: "left",
    cursor: "pointer",
    transition:
      "all 0.15s ease",
  },

  collapsedNavigationItem: {
    justifyContent:
      "center",
    padding:
      "9px 0",
  },

  activeNavigationItem: {
    backgroundColor:
      "#1e3a8a",
    color: "#ffffff",
  },

  navigationIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: "20px",
    height: "20px",
    color: "#64748b",
    fontSize: "16px",
    fontWeight: 600,
  },

  activeNavigationIcon: {
    color: "#ffffff",
  },

  navigationLabel: {
    fontSize: "13px",
    fontWeight: 500,
    whiteSpace: "nowrap",
  },

  activeIndicator: {
    position: "absolute",
    top: "9px",
    right: 0,
    bottom: "9px",
    width: "3px",
    borderRadius:
      "3px 0 0 3px",
    backgroundColor:
      "#60a5fa",
  },

  bottomSection: {
    padding: "12px",
    borderTop:
      "1px solid #1e293b",
  },

  systemHealth: {
    padding: "12px",
    marginBottom: "10px",
    border:
      "1px solid #1e293b",
    borderRadius: "8px",
    backgroundColor:
      "#111c31",
  },

  healthHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    color: "#cbd5e1",
    fontSize: "11px",
    fontWeight: 600,
  },

  healthStatus: {
    color: "#4ade80",
    fontSize: "10px",
  },

  healthBar: {
    height: "4px",
    marginTop: "9px",
    borderRadius: "4px",
    backgroundColor:
      "#1e293b",
    overflow: "hidden",
  },

  healthProgress: {
    width: "96%",
    height: "100%",
    borderRadius: "4px",
    backgroundColor:
      "#22c55e",
  },

  healthDescription: {
    display: "block",
    marginTop: "7px",
    color: "#64748b",
    fontSize: "9px",
  },

  collapseButton: {
    display: "flex",
    alignItems: "center",
    justifyContent:
      "center",
    gap: "8px",
    width: "100%",
    minHeight: "38px",
    border:
      "1px solid #1e293b",
    borderRadius: "7px",
    backgroundColor:
      "transparent",
    color: "#94a3b8",
    fontSize: "11px",
    cursor: "pointer",
  },

  mobileOverlay: {
    display: "none",
    position: "fixed",
    inset: 0,
    zIndex: 150,
    backgroundColor:
      "rgba(15, 23, 42, 0.55)",
  },
};