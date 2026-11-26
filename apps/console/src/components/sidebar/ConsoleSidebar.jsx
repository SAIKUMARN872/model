
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  AudioLines,
  Bell,
  ChevronDown,
  Clock3,
  CreditCard,
  FileClock,
  FileKey2,
  FileText,
  Fingerprint,
  Gauge,
  Globe2,
  KeyRound,
  LockKeyhole,
  LogOut,
  MessageSquareText,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
  Shield,
  ShieldCheck,
  TerminalSquare,
  Users
} from "lucide-react";

export const navigation = [
  {
    label: "WORKSPACE",
    items: [
{ label: "Overview", path: "/dashboard", icon: Gauge },
      { label: "Playground", path: "/playground", icon: TerminalSquare },
{ label: "Pricing", path: "/pricing", icon: CreditCard },
      { label: "Prompts", path: "/prompts", icon: MessageSquareText }
    ]
  },
  {
    label: "PLATFORM",
    items: [
      { label: "API keys", path: "/api-keys", icon: FileKey2 },
      { label: "Usage & limits", path: "/usage", icon: Activity },
      { label: "Logs", path: "/logs", icon: FileClock },
      { label: "Billing", path: "/billing", icon: CreditCard }
    ]
  },
  {
    label: "ADMINISTRATION",
    items: [
      { label: "Governance", path: "/enterprise/governance", icon: ShieldCheck },
      { label: "Security", path: "/enterprise/security", icon: LockKeyhole },
      { label: "Audit trail", path: "/enterprise/audit", icon: Fingerprint },
      { label: "Compliance", path: "/enterprise/compliance", icon: Shield },
      { label: "Access control", path: "/enterprise/rbac", icon: Users },
      { label: "Single sign-on", path: "/enterprise/sso", icon: KeyRound },
      { label: "SLA", path: "/enterprise/sla", icon: Clock3 },
      { label: "Enterprise", path: "/enterprise", icon: Globe2 },
      { label: "Credits", path: "/credits", icon: CreditCard },
      { label: "Documents", path: "/documents", icon: FileText },
      { label: "Notifications", path: "/notifications", icon: Bell }
    ]
  }
];

export function ConsoleSidebar({
  mobileOpen,
  onNavigate,
  collapsed,
  onToggle
}) {
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!userMenuOpen) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setUserMenuOpen(false);
    };

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [userMenuOpen]);

  return (
    <>
      {mobileOpen && (
        <button
          className="mobile-scrim"
          aria-label="Close navigation"
          onClick={onNavigate}
        />
      )}

      <aside
        className={`sidebar ${collapsed ? "sidebar--collapsed" : ""} ${
          mobileOpen ? "sidebar--mobile-open" : ""
        }`}
      >
        <div className="brand-row">
          <Link
            className="brand"
            href="/"
            onClick={onNavigate}
            aria-label="ModelNow overview"
          >
            <span className="brand__mark">
              <AudioLines size={22} strokeWidth={2.4} />
            </span>

            {!collapsed && (
              <span className="brand__copy">
                <strong>modelnow</strong>
                <small>AI PLATFORM</small>
              </span>
            )}
          </Link>

          <button
            className="icon-button sidebar-toggle"
            onClick={onToggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen size={17} />
            ) : (
              <PanelLeftClose size={17} />
            )}
          </button>
        </div>

        {!collapsed && (
          <div className="workspace-switcher">
            <div className="workspace-avatar">M</div>
            <div className="workspace-copy">
              <strong>Workspace</strong>
              <small>Active environment</small>
            </div>
            <ChevronDown size={15} />
          </div>
        )}

        <nav className="sidebar-nav" aria-label="Main navigation">
          {navigation.map((group) => (
            <div className="nav-group" key={group.label}>
              {!collapsed && (
                <div className="nav-group__label">{group.label}</div>
              )}

              {group.items.map((item) => {
                const Icon = item.icon;
                const active =
                  item.path === "/"
                    ? pathname === "/"
                    : pathname === item.path ||
                      pathname.startsWith(item.path + "/");

                return (
                  <Link
                    href={item.path}
                    key={item.path}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    className={`nav-item ${
                      active ? "nav-item--active" : ""
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon size={18} strokeWidth={1.8} />

                    {!collapsed && <span>{item.label}</span>}

                    {!collapsed && active && (
                      <span className="nav-item__indicator" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {!collapsed && (
          <div className="sidebar-bottom">
            <div className="sidebar-version">
              <span className="version-dot" />
              Console foundation
              <span className="version-number">v1.0</span>
            </div>
          </div>
        )}

        <div
          className={`sidebar-user-area ${
            collapsed ? "sidebar-user-area--collapsed" : ""
          }`}
        >
          {userMenuOpen && (
            <button
              type="button"
              className="sidebar-user-dismiss"
              aria-label="Close user menu"
              onClick={() => setUserMenuOpen(false)}
            />
          )}

          <button
            type="button"
            className="sidebar-user-trigger"
            aria-haspopup="menu"
            aria-expanded={userMenuOpen}
            title={collapsed ? "User menu" : undefined}
            onClick={() => setUserMenuOpen((open) => !open)}
          >
            <span className="sidebar-user-avatar" aria-hidden="true">
              <Users size={18} strokeWidth={1.8} />
            </span>

            {!collapsed && (
              <>
                <span className="sidebar-user-label">User</span>
                <ChevronDown
                  className={`sidebar-user-chevron ${
                    userMenuOpen ? "sidebar-user-chevron--open" : ""
                  }`}
                  size={16}
                />
              </>
            )}
          </button>

          {userMenuOpen && (
            <div
              className="sidebar-user-menu"
              role="menu"
              aria-label="User menu"
            >
              <Link
                href="/settings"
                role="menuitem"
                className="sidebar-user-menu-item"
                onClick={() => {
                  setUserMenuOpen(false);
                  onNavigate?.();
                }}
              >
                <Settings2 size={17} strokeWidth={1.8} />
                <span>Settings</span>
              </Link>

              <Link
                href="/logout"
                role="menuitem"
                className="sidebar-user-menu-item"
                onClick={() => {
                  setUserMenuOpen(false);
                  onNavigate?.();
                }}
              >
                <LogOut size={17} strokeWidth={1.8} />
                <span>Logout</span>
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
