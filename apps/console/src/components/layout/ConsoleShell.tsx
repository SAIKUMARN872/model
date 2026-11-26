
"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  CircleHelp,
  Settings2,
  UserRound,
  LogOut,
  BookOpen,
  Bell,
  ShieldCheck,
  ChevronDown,
  Info,
  ExternalLink,
} from "lucide-react";

import {
  ConsoleSidebar,
  navigation,
} from "../sidebar/ConsoleSidebar";

type HeaderMenu = "environment" | "help" | "settings" | "profile" | null;

export default function ConsoleShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "/";
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState<HeaderMenu>(null);

  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileOpen(false);
    setActiveMenu(null);
  }, [pathname]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        setActiveMenu(null);
        router.push("/api-keys");
      }

      if (event.key === "Escape") {
        setMobileOpen(false);
        setActiveMenu(null);
      }
    }

    function onPointerDown(event: PointerEvent) {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        setActiveMenu(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [router]);

  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/logout"
  ) {
    return <>{children}</>;
  }

  const groups = navigation as any[];

  const currentItem = groups
    .flatMap((group) => group.items || [])
    .find((item) => {
      if (item.path === "/") return pathname === "/";

      return (
        pathname === item.path ||
        pathname.startsWith(item.path + "/")
      );
    });

  const title =
    pathname === "/"
      ? "Overview"
      : currentItem?.label ||
        pathname
          .split("/")
          .filter(Boolean)
          .pop()
          ?.replaceAll("-", " ")
          .replace(/\b\w/g, (letter: string) =>
            letter.toUpperCase()
          ) ||
        "Console";

  function toggleMenu(menu: Exclude<HeaderMenu, null>) {
    setActiveMenu((current) =>
      current === menu ? null : menu
    );
  }

  function navigateTo(path: string) {
    setActiveMenu(null);
    router.push(path);
  }

  return (
    <div className="app-shell">
      <ConsoleSidebar
        mobileOpen={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />

      <div
        className={`app-main ${
          collapsed ? "app-main--collapsed" : ""
        }`}
      >
        <header className="topbar">
          <div className="topbar__left">
            <button
              type="button"
              className="icon-button mobile-menu-button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={19} />
            </button>

            <button
              type="button"
              className="icon-button desktop-collapse-button"
              onClick={() => setCollapsed((value) => !value)}
              aria-label={
                collapsed ? "Expand sidebar" : "Collapse sidebar"
              }
            >
              {collapsed ? (
                <PanelLeftOpen size={18} />
              ) : (
                <PanelLeftClose size={18} />
              )}
            </button>

            <div className="breadcrumb">
              <span>ModelNow</span>
              <ChevronRight size={14} />
              <strong>{title}</strong>
            </div>
          </div>

          <div className="topbar__right" ref={headerRef}>
            {/* Environment */}
            <div className="topbar-menu-wrap">
              <button
                type="button"
                className="environment-pill"
                onClick={() => toggleMenu("environment")}
                aria-haspopup="menu"
                aria-expanded={activeMenu === "environment"}
              >
                <span />
                Console
                <ChevronDown size={13} />
              </button>

              {activeMenu === "environment" && (
                <div
                  className="topbar-dropdown environment-dropdown"
                  role="menu"
                >
                  <div className="topbar-dropdown__heading">
                    <strong>Workspace environment</strong>
                    <span>Environment information</span>
                  </div>

                  <div className="topbar-info-row">
                    <Info size={16} />
                    <div>
                      <strong>Environment not configured</strong>
                      <span>
                        No public environment label has been configured
                        for this console.
                      </span>
                    </div>
                  </div>

                  <div className="topbar-dropdown__footer">
                    This control is informational. Environment switching
                    is not configured.
                  </div>
                </div>
              )}
            </div>

            <div className="topbar-divider" />

            {/* Help */}
            <div className="topbar-menu-wrap">
              <button
                type="button"
                className="icon-button"
                title="Help and documentation"
                aria-label="Help and documentation"
                aria-haspopup="menu"
                aria-expanded={activeMenu === "help"}
                onClick={() => toggleMenu("help")}
              >
                <CircleHelp size={18} />
              </button>

              {activeMenu === "help" && (
                <div className="topbar-dropdown" role="menu">
                  <div className="topbar-dropdown__heading">
                    <strong>Help & Support</strong>
                    <span>Find help with ModelNow Console</span>
                  </div>

                  <button
                    type="button"
                    className="topbar-dropdown__item"
                    role="menuitem"
                    onClick={() => navigateTo("/docs/batch-api")}
                  >
                    <BookOpen size={17} />
                    <span>
                      <strong>Documentation</strong>
                      <small>Read API and platform guides</small>
                    </span>
                    <ExternalLink size={14} />
                  </button>

                  <div className="topbar-dropdown__footer">
                    Documentation opens inside this console.
                  </div>
                </div>
              )}
            </div>

            {/* Quick Settings */}
            <div className="topbar-menu-wrap">
              <button
                type="button"
                className="icon-button"
                title="Quick settings"
                aria-label="Quick settings"
                aria-haspopup="menu"
                aria-expanded={activeMenu === "settings"}
                onClick={() => toggleMenu("settings")}
              >
                <Settings2 size={18} />
              </button>

              {activeMenu === "settings" && (
                <div className="topbar-dropdown" role="menu">
                  <div className="topbar-dropdown__heading">
                    <strong>Quick Settings</strong>
                    <span>Manage your console preferences</span>
                  </div>

                  <button
                    type="button"
                    className="topbar-dropdown__item"
                    role="menuitem"
                    onClick={() => navigateTo("/settings")}
                  >
                    <Settings2 size={17} />
                    <span>
                      <strong>Console Settings</strong>
                      <small>Manage console configuration</small>
                    </span>
                    <ChevronRight size={15} />
                  </button>

                  <button
                    type="button"
                    className="topbar-dropdown__item"
                    role="menuitem"
                    onClick={() => navigateTo("/notifications")}
                  >
                    <Bell size={17} />
                    <span>
                      <strong>Notifications</strong>
                      <small>View notification preferences</small>
                    </span>
                    <ChevronRight size={15} />
                  </button>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="topbar-menu-wrap">
              <button
                type="button"
                className="user-avatar"
                title="Account menu"
                aria-label="Open account menu"
                aria-haspopup="menu"
                aria-expanded={activeMenu === "profile"}
                onClick={() => toggleMenu("profile")}
              >
                MN
              </button>

              {activeMenu === "profile" && (
                <div
                  className="topbar-dropdown profile-dropdown"
                  role="menu"
                >
                  <div className="profile-menu-header">
                    <div className="profile-menu-avatar">MN</div>
                    <div>
                      <strong>ModelNow Account</strong>
                      <span>Console workspace</span>
                    </div>
                  </div>

                  <div className="topbar-dropdown__separator" />

                  <button
                    type="button"
                    className="topbar-dropdown__item"
                    role="menuitem"
                    onClick={() => navigateTo("/user")}
                  >
                    <UserRound size={17} />
                    <span>
                      <strong>My Account</strong>
                      <small>View account details</small>
                    </span>
                    <ChevronRight size={15} />
                  </button>

                  <button
                    type="button"
                    className="topbar-dropdown__item"
                    role="menuitem"
                    onClick={() => navigateTo("/settings")}
                  >
                    <ShieldCheck size={17} />
                    <span>
                      <strong>Account Settings</strong>
                      <small>Manage account settings</small>
                    </span>
                    <ChevronRight size={15} />
                  </button>

                  <div className="topbar-dropdown__separator" />

                  <button
                    type="button"
                    className="topbar-dropdown__item topbar-dropdown__item--danger"
                    role="menuitem"
                    onClick={() => navigateTo("/logout")}
                  >
                    <LogOut size={17} />
                    <span>
                      <strong>Logout</strong>
                      <small>Sign out of your account</small>
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="main-content" id="main-content">
          {children}
        </main>

        <footer className="app-footer">
          <span>Enterprise AI operations</span>
          <span className="footer-spacer" />
          <span className="footer-status">
            <span className="status-dot status-dot--success" />
            Console loaded
          </span>
        </footer>
      </div>
    </div>
  );
}
