
"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  Archive,
  Bell,
  BellOff,
  Check,
  CheckCheck,
  ChevronRight,
  CircleAlert,
  Clock3,
  Info,
  Mail,
  MoreHorizontal,
  Search,
  ShieldCheck,
  Trash2,
  X,
  Zap,
  CreditCard,
  Settings,
  RotateCcw,
} from "lucide-react";

type NotificationCategory =
  | "Security"
  | "Billing"
  | "Usage"
  | "System"
  | "Account";

type NotificationPriority = "Critical" | "High" | "Normal" | "Low";

type NotificationRecord = {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  createdAt: string;
  read: boolean;
  archived: boolean;
  source: string;
  details?: string;
};

type ActiveTab = "All" | "Unread" | "Archived";

const initialNotifications: NotificationRecord[] = [];

const categoryIcons = {
  Security: ShieldCheck,
  Billing: CreditCard,
  Usage: Zap,
  System: Settings,
  Account: Bell,
};

const priorityStyles: Record<NotificationPriority, string> = {
  Critical: "nt-priority-critical",
  High: "nt-priority-high",
  Normal: "nt-priority-normal",
  Low: "nt-priority-low",
};

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function relativeTime(value: string) {
  const timestamp = new Date(value).getTime();

  if (Number.isNaN(timestamp)) return value;

  const difference = Date.now() - timestamp;
  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} days ago`;

  return formatTime(value);
}

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState<NotificationRecord[]>(initialNotifications);

  const [activeTab, setActiveTab] = useState<ActiveTab>("All");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [priorityFilter, setPriorityFilter] = useState("All priorities");
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationRecord | null>(null);
  const [notice, setNotice] = useState("");

  const unreadCount = notifications.filter(
    (notification) => !notification.read && !notification.archived
  ).length;

  const archivedCount = notifications.filter(
    (notification) => notification.archived
  ).length;

  const filteredNotifications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return notifications
      .filter((notification) => {
        if (activeTab === "Unread") {
          return !notification.read && !notification.archived;
        }

        if (activeTab === "Archived") {
          return notification.archived;
        }

        return !notification.archived;
      })
      .filter((notification) => {
        const matchesSearch =
          !query ||
          [
            notification.title,
            notification.message,
            notification.category,
            notification.source,
            notification.priority,
          ]
            .join(" ")
            .toLowerCase()
            .includes(query);

        const matchesCategory =
          categoryFilter === "All categories" ||
          notification.category === categoryFilter;

        const matchesPriority =
          priorityFilter === "All priorities" ||
          notification.priority === priorityFilter;

        return matchesSearch && matchesCategory && matchesPriority;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
  }, [
    notifications,
    activeTab,
    search,
    categoryFilter,
    priorityFilter,
  ]);

  const updateNotification = (
    id: string,
    updates: Partial<NotificationRecord>
  ) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, ...updates }
          : notification
      )
    );

    if (
      selectedNotification?.id === id
    ) {
      setSelectedNotification((current) =>
        current ? { ...current, ...updates } : null
      );
    }
  };

  const markAllAsRead = () => {
    const count = unreadCount;

    setNotifications((current) =>
      current.map((notification) =>
        !notification.archived
          ? { ...notification, read: true }
          : notification
      )
    );

    setNotice(
      count
        ? `${count} notification(s) marked as read in this local inbox.`
        : "There are no unread notifications."
    );
  };

  const archiveNotification = (notification: NotificationRecord) => {
    updateNotification(notification.id, { archived: true });
    setSelectedNotification(null);
    setNotice("Notification archived in the local inbox.");
  };

  const restoreNotification = (notification: NotificationRecord) => {
    updateNotification(notification.id, { archived: false });
    setSelectedNotification(null);
    setNotice("Notification restored to the inbox.");
  };

  const deleteNotification = (id: string) => {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id)
    );
    setSelectedNotification(null);
    setNotice("Notification removed from the local inbox.");
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("All categories");
    setPriorityFilter("All priorities");
  };

  const hasFilters =
    search !== "" ||
    categoryFilter !== "All categories" ||
    priorityFilter !== "All priorities";

  const activeNotificationCount = notifications.filter(
    (notification) => !notification.archived
  ).length;

  return (
    <main className="nt-page">
      <style>{`
        .nt-page {
          --nt-blue: #315fea;
          --nt-text: #111827;
          --nt-muted: #64748b;
          --nt-border: #e5e7eb;
          min-height: 100%;
          padding: 28px;
          background: #f8fafc;
          color: var(--nt-text);
        }

        .nt-container {
          max-width: 1450px;
          margin: 0 auto;
        }

        .nt-back {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 23px;
          color: #64748b;
          font-size: 12px;
          font-weight: 650;
          text-decoration: none;
        }

        .nt-back:hover {
          color: var(--nt-blue);
        }

        .nt-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 23px;
        }

        .nt-heading {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .nt-heading-icon {
          display: grid;
          width: 46px;
          height: 46px;
          flex-shrink: 0;
          place-items: center;
          border: 1px solid #dbe5ff;
          border-radius: 11px;
          background: #eff4ff;
          color: var(--nt-blue);
        }

        .nt-eyebrow {
          margin: 0 0 6px;
          color: #64748b;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .nt-header h1 {
          margin: 0;
          font-size: 26px;
          font-weight: 750;
          letter-spacing: -.7px;
        }

        .nt-description {
          margin: 7px 0 0;
          color: var(--nt-muted);
          font-size: 13px;
          line-height: 1.6;
        }

        .nt-header-actions {
          display: flex;
          gap: 9px;
        }

        .nt-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 37px;
          padding: 0 12px;
          border: 1px solid #dce2eb;
          border-radius: 8px;
          background: #fff;
          color: #334155;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          text-decoration: none;
        }

        .nt-button:hover {
          border-color: #b9c8e8;
          background: #f8faff;
        }

        .nt-button:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .nt-button:focus-visible,
        .nt-back:focus-visible,
        .nt-icon-button:focus-visible,
        .nt-tab:focus-visible {
          outline: 2px solid var(--nt-blue);
          outline-offset: 3px;
        }

        .nt-button-primary {
          border-color: var(--nt-blue);
          background: var(--nt-blue);
          color: #fff;
        }

        .nt-button-primary:hover {
          border-color: #244dcc;
          background: #244dcc;
          color: #fff;
        }

        .nt-notice {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          margin-bottom: 17px;
          border: 1px solid #bfdbfe;
          border-radius: 9px;
          background: #eff6ff;
          color: #1e40af;
          font-size: 11px;
          line-height: 1.6;
        }

        .nt-notice button {
          margin-left: auto;
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
        }

        .nt-summary {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 13px;
          margin-bottom: 19px;
        }

        .nt-summary-card {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 17px;
          border: 1px solid var(--nt-border);
          border-radius: 10px;
          background: #fff;
        }

        .nt-summary-icon {
          display: grid;
          width: 37px;
          height: 37px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 9px;
          background: #eff4ff;
          color: var(--nt-blue);
        }

        .nt-summary-card strong {
          display: block;
          font-size: 22px;
          font-weight: 800;
        }

        .nt-summary-card span {
          display: block;
          margin-top: 3px;
          color: #64748b;
          font-size: 10px;
        }

        .nt-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 340px;
          gap: 17px;
          align-items: start;
        }

        .nt-panel {
          overflow: hidden;
          border: 1px solid var(--nt-border);
          border-radius: 11px;
          background: #fff;
        }

        .nt-tabs {
          display: flex;
          align-items: center;
          gap: 21px;
          padding: 0 17px;
          border-bottom: 1px solid var(--nt-border);
        }

        .nt-tab {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          min-height: 48px;
          border: 0;
          background: transparent;
          color: #64748b;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .nt-tab.active {
          color: var(--nt-blue);
        }

        .nt-tab.active::after {
          position: absolute;
          right: 0;
          bottom: -1px;
          left: 0;
          height: 2px;
          background: var(--nt-blue);
          content: "";
        }

        .nt-tab-count {
          padding: 3px 6px;
          border-radius: 12px;
          background: #f1f5f9;
          color: #64748b;
          font-size: 9px;
        }

        .nt-toolbar {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 9px;
          padding: 13px 16px;
          border-bottom: 1px solid var(--nt-border);
        }

        .nt-search {
          position: relative;
          flex: 1;
          min-width: 180px;
        }

        .nt-search svg {
          position: absolute;
          top: 50%;
          left: 11px;
          color: #94a3b8;
          transform: translateY(-50%);
          pointer-events: none;
        }

        .nt-search input,
        .nt-select {
          box-sizing: border-box;
          height: 36px;
          border: 1px solid #dce2eb;
          border-radius: 7px;
          outline: none;
          background: #fff;
          color: #334155;
          font-size: 10px;
        }

        .nt-search input {
          width: 100%;
          padding: 0 10px 0 33px;
        }

        .nt-search input:focus,
        .nt-select:focus {
          border-color: var(--nt-blue);
          box-shadow: 0 0 0 3px rgba(49,95,234,.08);
        }

        .nt-select {
          padding: 0 9px;
        }

        .nt-list {
          min-height: 300px;
        }

        .nt-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          border-bottom: 1px solid #edf0f4;
          cursor: pointer;
          transition: background .15s ease;
        }

        .nt-item:last-child {
          border-bottom: 0;
        }

        .nt-item:hover {
          background: #fafcff;
        }

        .nt-item.unread {
          background: #f8faff;
        }

        .nt-item.unread:hover {
          background: #f2f6ff;
        }

        .nt-item-icon {
          display: grid;
          width: 37px;
          height: 37px;
          flex-shrink: 0;
          place-items: center;
          border: 1px solid #e5eaf3;
          border-radius: 9px;
          background: #fff;
          color: #64748b;
        }

        .nt-item-main {
          min-width: 0;
          flex: 1;
        }

        .nt-item-title-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 7px;
        }

        .nt-item-title {
          color: #1e293b;
          font-size: 11px;
          font-weight: 750;
        }

        .nt-unread-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--nt-blue);
        }

        .nt-item-message {
          margin: 6px 0 8px;
          color: #64748b;
          font-size: 10px;
          line-height: 1.65;
        }

        .nt-item-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 9px;
          color: #94a3b8;
          font-size: 9px;
        }

        .nt-priority {
          display: inline-flex;
          align-items: center;
          padding: 3px 7px;
          border: 1px solid;
          border-radius: 20px;
          font-size: 9px;
          font-weight: 750;
        }

        .nt-priority-critical {
          border-color: #fecaca;
          background: #fef2f2;
          color: #b91c1c;
        }

        .nt-priority-high {
          border-color: #fed7aa;
          background: #fff7ed;
          color: #c2410c;
        }

        .nt-priority-normal {
          border-color: #bfdbfe;
          background: #eff6ff;
          color: #1d4ed8;
        }

        .nt-priority-low {
          border-color: #e2e8f0;
          background: #f8fafc;
          color: #64748b;
        }

        .nt-item-actions {
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .nt-icon-button {
          display: grid;
          width: 29px;
          height: 29px;
          place-items: center;
          border: 1px solid transparent;
          border-radius: 6px;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
        }

        .nt-icon-button:hover {
          border-color: #e2e8f0;
          background: #fff;
          color: var(--nt-blue);
        }

        .nt-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 52px 20px;
          text-align: center;
        }

        .nt-empty-icon {
          display: grid;
          width: 51px;
          height: 51px;
          margin-bottom: 14px;
          place-items: center;
          border-radius: 14px;
          background: #f1f5f9;
          color: #64748b;
        }

        .nt-empty h3 {
          margin: 0 0 7px;
          font-size: 13px;
        }

        .nt-empty p {
          max-width: 380px;
          margin: 0;
          color: #94a3b8;
          font-size: 10px;
          line-height: 1.7;
        }

        .nt-panel-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-top: 1px solid var(--nt-border);
          color: #94a3b8;
          font-size: 10px;
        }

        .nt-side-panel {
          padding: 18px;
          border: 1px solid var(--nt-border);
          border-radius: 11px;
          background: #fff;
        }

        .nt-side-panel h2 {
          margin: 0 0 7px;
          font-size: 13px;
          font-weight: 750;
        }

        .nt-side-description {
          margin: 0 0 17px;
          color: #94a3b8;
          font-size: 10px;
          line-height: 1.6;
        }

        .nt-category-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 12px 0;
          border-top: 1px solid #edf0f4;
          color: #475569;
          font-size: 10px;
        }

        .nt-category-name {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .nt-category-name svg {
          color: #64748b;
        }

        .nt-side-note {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          padding: 12px;
          margin-top: 17px;
          border: 1px solid #dbeafe;
          border-radius: 8px;
          background: #f5f9ff;
          color: #475569;
          font-size: 10px;
          line-height: 1.6;
        }

        .nt-side-note svg {
          flex-shrink: 0;
          color: var(--nt-blue);
        }

        .nt-detail-content {
          padding: 17px;
        }

        .nt-detail-content h3 {
          margin: 0 0 9px;
          font-size: 14px;
          line-height: 1.5;
        }

        .nt-detail-message {
          margin: 0 0 17px;
          color: #64748b;
          font-size: 11px;
          line-height: 1.8;
        }

        .nt-detail-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 0;
          border-top: 1px solid #edf0f4;
          font-size: 10px;
        }

        .nt-detail-row span {
          color: #64748b;
        }

        .nt-detail-row strong {
          text-align: right;
          overflow-wrap: anywhere;
        }

        .nt-detail-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          padding-top: 14px;
        }

        @media(max-width: 1050px) {
          .nt-layout {
            grid-template-columns: 1fr;
          }

          .nt-side-panel {
            order: 2;
          }
        }

        @media(max-width: 650px) {
          .nt-page {
            padding: 17px 13px;
          }

          .nt-header {
            flex-direction: column;
          }

          .nt-header-actions {
            width: 100%;
          }

          .nt-header-actions button {
            flex: 1;
          }

          .nt-summary {
            grid-template-columns: 1fr;
            gap: 9px;
          }

          .nt-toolbar {
            align-items: stretch;
          }

          .nt-search {
            flex-basis: 100%;
          }

          .nt-select {
            flex: 1;
          }

          .nt-item {
            padding: 13px 10px;
          }

          .nt-item-actions {
            flex-direction: column;
          }

          .nt-tabs {
            gap: 15px;
            padding: 0 11px;
          }
        }

        @media(prefers-reduced-motion: reduce) {
          .nt-item {
            transition: none;
          }
        }
      `}</style>

      <div className="nt-container">
        <Link href="/" className="nt-back">
          <ArrowLeft size={15} />
          Dashboard
        </Link>

        <header className="nt-header">
          <div className="nt-heading">
            <div className="nt-heading-icon">
              <Bell size={22} />
            </div>

            <div>
              <p className="nt-eyebrow">MODELNOW PLATFORM / ACTIVITY</p>
              <h1>Notifications</h1>
              <p className="nt-description">
                Stay informed about security, billing, usage, and important
                platform events.
              </p>
            </div>
          </div>

          <div className="nt-header-actions">
            <button
              type="button"
              className="nt-button"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck size={14} />
              Mark all as read
            </button>
          </div>
        </header>

        {notice && (
          <div className="nt-notice" role="status">
            <Info size={15} />
            <span>{notice}</span>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => setNotice("")}
            >
              <X size={14} />
            </button>
          </div>
        )}

        <section className="nt-summary">
          <article className="nt-summary-card">
            <div className="nt-summary-icon">
              <Bell size={18} />
            </div>
            <div>
              <strong>{activeNotificationCount}</strong>
              <span>Inbox notifications</span>
            </div>
          </article>

          <article className="nt-summary-card">
            <div className="nt-summary-icon">
              <Mail size={18} />
            </div>
            <div>
              <strong>{unreadCount}</strong>
              <span>Unread notifications</span>
            </div>
          </article>

          <article className="nt-summary-card">
            <div className="nt-summary-icon">
              <Archive size={18} />
            </div>
            <div>
              <strong>{archivedCount}</strong>
              <span>Archived notifications</span>
            </div>
          </article>
        </section>

        <div className="nt-layout">
          <section className="nt-panel">
            <div className="nt-tabs" role="tablist" aria-label="Notification views">
              {(
                [
                  ["All", activeNotificationCount],
                  ["Unread", unreadCount],
                  ["Archived", archivedCount],
                ] as [ActiveTab, number][]
              ).map(([tab, count]) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  className={`nt-tab ${activeTab === tab ? "active" : ""}`}
                  onClick={() => {
                    setActiveTab(tab);
                    setSelectedNotification(null);
                  }}
                >
                  {tab}
                  <span className="nt-tab-count">{count}</span>
                </button>
              ))}
            </div>

            <div className="nt-toolbar">
              <div className="nt-search">
                <Search size={14} />
                <input
                  type="search"
                  placeholder="Search notifications..."
                  aria-label="Search notifications"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <select
                className="nt-select"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                aria-label="Filter by category"
              >
                <option>All categories</option>
                <option>Security</option>
                <option>Billing</option>
                <option>Usage</option>
                <option>System</option>
                <option>Account</option>
              </select>

              <select
                className="nt-select"
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value)}
                aria-label="Filter by priority"
              >
                <option>All priorities</option>
                <option>Critical</option>
                <option>High</option>
                <option>Normal</option>
                <option>Low</option>
              </select>

              {hasFilters && (
                <button
                  type="button"
                  className="nt-button"
                  onClick={clearFilters}
                >
                  <X size={13} />
                  Clear
                </button>
              )}
            </div>

            <div className="nt-list">
              {filteredNotifications.length === 0 ? (
                <div className="nt-empty">
                  <div className="nt-empty-icon">
                    {activeTab === "Unread" ? (
                      <CheckCheck size={24} />
                    ) : (
                      <BellOff size={24} />
                    )}
                  </div>

                  <h3>
                    {hasFilters
                      ? "No matching notifications"
                      : activeTab === "Unread"
                        ? "You're all caught up"
                        : activeTab === "Archived"
                          ? "No archived notifications"
                          : "No notifications yet"}
                  </h3>

                  <p>
                    {hasFilters
                      ? "Try changing your search or filters to find what you're looking for."
                      : "Important organization updates and platform alerts will appear here when the notification service is connected."}
                  </p>

                  {hasFilters && (
                    <button
                      type="button"
                      className="nt-button"
                      style={{ marginTop: 14 }}
                      onClick={clearFilters}
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                filteredNotifications.map((notification) => {
                  const CategoryIcon =
                    categoryIcons[notification.category];

                  return (
                    <article
                      key={notification.id}
                      className={`nt-item ${!notification.read ? "unread" : ""}`}
                      onClick={() => {
                        setSelectedNotification(notification);

                        if (!notification.read) {
                          updateNotification(notification.id, {
                            read: true,
                          });
                        }
                      }}
                    >
                      <div className="nt-item-icon">
                        <CategoryIcon size={17} />
                      </div>

                      <div className="nt-item-main">
                        <div className="nt-item-title-row">
                          {!notification.read && (
                            <span className="nt-unread-dot" />
                          )}
                          <span className="nt-item-title">
                            {notification.title}
                          </span>
                          <span
                            className={`nt-priority ${priorityStyles[notification.priority]}`}
                          >
                            {notification.priority}
                          </span>
                        </div>

                        <p className="nt-item-message">
                          {notification.message}
                        </p>

                        <div className="nt-item-meta">
                          <span>{notification.category}</span>
                          <span>·</span>
                          <span>{notification.source}</span>
                          <span>·</span>
                          <span>{relativeTime(notification.createdAt)}</span>
                        </div>
                      </div>

                      <div className="nt-item-actions">
                        <button
                          type="button"
                          className="nt-icon-button"
                          title={
                            notification.read
                              ? "Mark as unread"
                              : "Mark as read"
                          }
                          aria-label={
                            notification.read
                              ? "Mark as unread"
                              : "Mark as read"
                          }
                          onClick={(event) => {
                            event.stopPropagation();
                            updateNotification(notification.id, {
                              read: !notification.read,
                            });
                          }}
                        >
                          {notification.read ? (
                            <Mail size={15} />
                          ) : (
                            <Check size={15} />
                          )}
                        </button>

                        <button
                          type="button"
                          className="nt-icon-button"
                          title={
                            notification.archived
                              ? "Restore"
                              : "Archive"
                          }
                          aria-label={
                            notification.archived
                              ? "Restore notification"
                              : "Archive notification"
                          }
                          onClick={(event) => {
                            event.stopPropagation();

                            notification.archived
                              ? restoreNotification(notification)
                              : archiveNotification(notification);
                          }}
                        >
                          {notification.archived ? (
                            <RotateCcw size={15} />
                          ) : (
                            <Archive size={15} />
                          )}
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>

            <div className="nt-panel-footer">
              <span>
                Showing {filteredNotifications.length} of{" "}
                {notifications.length} records
              </span>
              <span>Notification center</span>
            </div>
          </section>

          <aside className="nt-side-panel">
            {selectedNotification ? (
              <>
                <h2>Notification details</h2>
                <p className="nt-side-description">
                  Review the selected notification and manage its status.
                </p>

                <div className="nt-detail-content">
                  <h3>{selectedNotification.title}</h3>

                  <p className="nt-detail-message">
                    {selectedNotification.details ||
                      selectedNotification.message}
                  </p>

                  <div className="nt-detail-row">
                    <span>Category</span>
                    <strong>{selectedNotification.category}</strong>
                  </div>

                  <div className="nt-detail-row">
                    <span>Priority</span>
                    <strong>{selectedNotification.priority}</strong>
                  </div>

                  <div className="nt-detail-row">
                    <span>Source</span>
                    <strong>{selectedNotification.source}</strong>
                  </div>

                  <div className="nt-detail-row">
                    <span>Received</span>
                    <strong>
                      {formatTime(selectedNotification.createdAt)}
                    </strong>
                  </div>

                  <div className="nt-detail-row">
                    <span>Status</span>
                    <strong>
                      {selectedNotification.read ? "Read" : "Unread"}
                    </strong>
                  </div>

                  <div className="nt-detail-actions">
                    <button
                      type="button"
                      className="nt-button"
                      onClick={() =>
                        updateNotification(selectedNotification.id, {
                          read: !selectedNotification.read,
                        })
                      }
                    >
                      <Check size={13} />
                      {selectedNotification.read
                        ? "Mark unread"
                        : "Mark read"}
                    </button>

                    <button
                      type="button"
                      className="nt-button"
                      onClick={() =>
                        selectedNotification.archived
                          ? restoreNotification(selectedNotification)
                          : archiveNotification(selectedNotification)
                      }
                    >
                      {selectedNotification.archived ? (
                        <RotateCcw size={13} />
                      ) : (
                        <Archive size={13} />
                      )}
                      {selectedNotification.archived
                        ? "Restore"
                        : "Archive"}
                    </button>

                    <button
                      type="button"
                      className="nt-button"
                      onClick={() =>
                        deleteNotification(selectedNotification.id)
                      }
                    >
                      <Trash2 size={13} />
                      Remove
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2>Notification overview</h2>
                <p className="nt-side-description">
                  Keep track of important updates across your ModelNow
                  organization.
                </p>

                {(
                  [
                    ["Security", ShieldCheck],
                    ["Billing", CreditCard],
                    ["Usage", Zap],
                    ["System", Settings],
                    ["Account", Bell],
                  ] as const
                ).map(([category, Icon]) => (
                  <div className="nt-category-row" key={category}>
                    <span className="nt-category-name">
                      <Icon size={15} />
                      {category}
                    </span>
                    <span>
                      {notifications.filter(
                        (notification) =>
                          notification.category === category &&
                          !notification.archived
                      ).length}
                    </span>
                  </div>
                ))}

                <div className="nt-side-note">
                  <Info size={15} />
                  <span>
                    Notification counts reflect records currently available
                    in this inbox. Connect the notification API for live
                    organization-wide updates.
                  </span>
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
