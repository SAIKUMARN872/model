
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronRight,
  Command,
  Menu,
  Search,
  Settings,
  X,
} from "lucide-react";

type NavbarProps = {
  onMobileMenuClick?: () => void;
};

type SearchItem = {
  label: string;
  href: string;
  group: string;
};

const SEARCH_ITEMS: SearchItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    group: "Overview",
  },
  {
    label: "Platform Overview",
    href: "/dashboard/platform-overview",
    group: "Dashboard",
  },
  {
    label: "AI Infrastructure",
    href: "/dashboard/ai-infrastructure",
    group: "Dashboard",
  },
  {
    label: "API Analytics",
    href: "/dashboard/api-analytics",
    group: "Dashboard",
  },
  {
    label: "Compliance Overview",
    href: "/dashboard/compliance-overview",
    group: "Dashboard",
  },
  {
    label: "Model Performance",
    href: "/dashboard/model-performance",
    group: "Dashboard",
  },
  {
    label: "Organization Analytics",
    href: "/dashboard/organization-analytics",
    group: "Dashboard",
  },
  {
    label: "Provider Performance",
    href: "/dashboard/provider-performance",
    group: "Dashboard",
  },
  {
    label: "Recent Activity",
    href: "/dashboard/recent-activity",
    group: "Dashboard",
  },
  {
    label: "Revenue Overview",
    href: "/dashboard/revenue-overview",
    group: "Dashboard",
  },
  {
    label: "Security Overview",
    href: "/dashboard/security-overview",
    group: "Dashboard",
  },
  {
    label: "System Health",
    href: "/dashboard/system-health",
    group: "Dashboard",
  },
  {
    label: "Usage & Costs",
    href: "/dashboard/usage-costs",
    group: "Dashboard",
  },
  {
    label: "User Analytics",
    href: "/dashboard/user-analytics",
    group: "Dashboard",
  },
  {
    label: "Usage & Analytics",
    href: "/usage",
    group: "Overview",
  },
  {
    label: "Users",
    href: "/users",
    group: "Organization",
  },
  {
    label: "Organizations",
    href: "/organizations",
    group: "Organization",
  },
  {
    label: "Workspaces",
    href: "/workspaces",
    group: "Organization",
  },
  {
    label: "Roles",
    href: "/roles",
    group: "Organization",
  },
  {
    label: "Permissions",
    href: "/permissions",
    group: "Organization",
  },
  {
    label: "Governance",
    href: "/governance",
    group: "Platform",
  },
  {
    label: "Security",
    href: "/security",
    group: "Platform",
  },
  {
    label: "Compliance",
    href: "/compliance",
    group: "Platform",
  },
  {
    label: "Audit Logs",
    href: "/audit",
    group: "Platform",
  },
  {
    label: "Billing",
    href: "/billing",
    group: "Platform",
  },
  {
    label: "Settings",
    href: "/settings",
    group: "Administration",
  },
];

const BILLING_SEARCH_ITEMS: SearchItem[] = [
  "Overview",
  "Subscriptions",
  "Plans",
  "Invoices",
  "Payments",
  "Transactions",
  "Refunds",
  "Coupons",
  "Tax Settings",
  "Revenue",
  "Payment Methods",
  "Billing Settings",
].map((section) => ({
  label: section,
  href: `/billing?section=${encodeURIComponent(section)}`,
  group: "Billing",
}));

function normalizePath(path: string) {
  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }

  return path;
}

function getPageTitle(pathname: string) {
  const normalizedPath = normalizePath(pathname);

  const exactMatch = [...SEARCH_ITEMS, ...BILLING_SEARCH_ITEMS].find(
    (item) => normalizePath(item.href.split("?")[0]) === normalizedPath
  );

  if (exactMatch) {
    return exactMatch.label;
  }

  if (normalizedPath === "/") {
    return "Admin Overview";
  }

  const lastSegment = normalizedPath.split("/").filter(Boolean).pop() || "";

  return lastSegment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function Navbar({
  onMobileMenuClick,
}: NavbarProps) {
  const pathname = usePathname();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const pageTitle = getPageTitle(pathname);

  const allSearchItems = useMemo(
    () => [...SEARCH_ITEMS, ...BILLING_SEARCH_ITEMS],
    []
  );

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return allSearchItems.slice(0, 8);
    }

    return allSearchItems.filter(
      (item) =>
        item.label.toLowerCase().includes(query) ||
        item.group.toLowerCase().includes(query)
    );
  }, [searchQuery, allSearchItems]);

  const openSearch = useCallback(() => {
    setSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery("");
  }, []);

  useEffect(() => {
    function handleKeyboardShortcut(event: KeyboardEvent) {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        openSearch();
      }

      if (event.key === "Escape") {
        closeSearch();
      }
    }

    window.addEventListener("keydown", handleKeyboardShortcut);

    return () => {
      window.removeEventListener("keydown", handleKeyboardShortcut);
    };
  }, [openSearch, closeSearch]);

  useEffect(() => {
    closeSearch();
  }, [pathname, closeSearch]);

  return (
    <>
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <button
            type="button"
            className="admin-mobile-menu-button"
            onClick={onMobileMenuClick}
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>

          <div className="admin-breadcrumb">
            <span className="admin-breadcrumb-root">
              ModelNow Admin
            </span>

            <ChevronRight
              size={15}
              className="admin-breadcrumb-chevron"
            />

            <span className="admin-breadcrumb-current">
              {pageTitle}
            </span>
          </div>
        </div>

        <div className="admin-topbar-actions">
          <button
            type="button"
            className="admin-search-trigger"
            onClick={openSearch}
          >
            <Search size={16} />

            <span>Search anything...</span>

            <kbd>
              <Command size={11} />
              K
            </kbd>
          </button>

          <Link
            href="/settings"
            className="admin-icon-button"
            aria-label="Settings"
            title="Settings"
          >
            <Settings size={19} />
          </Link>

          <Link
            href="/settings"
            className="admin-icon-button admin-notification-link"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell size={19} />
            <span className="admin-notification-dot" />
          </Link>
        </div>
      </header>

      {searchOpen && (
        <div
          className="admin-search-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeSearch();
            }
          }}
        >
          <div
            className="admin-search-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Search admin navigation"
          >
            <div className="admin-search-modal-header">
              <Search size={19} />

              <input
                autoFocus
                type="text"
                placeholder="Search pages, settings, and sections..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />

              <button
                type="button"
                onClick={closeSearch}
                aria-label="Close search"
              >
                <X size={19} />
              </button>
            </div>

            <div className="admin-search-results">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="admin-search-result"
                    onClick={closeSearch}
                  >
                    <div className="admin-search-result-icon">
                      <Search size={15} />
                    </div>

                    <div className="admin-search-result-content">
                      <span>{item.label}</span>
                      <small>{item.group}</small>
                    </div>

                    <ChevronRight size={16} />
                  </Link>
                ))
              ) : (
                <div className="admin-search-empty">
                  <Search size={25} />
                  <p>No matching pages found.</p>
                  <span>Try searching with another keyword.</span>
                </div>
              )}
            </div>

            <div className="admin-search-modal-footer">
              <span>
                <kbd>ESC</kbd> to close
              </span>

              <span>
                {filteredItems.length} results
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
