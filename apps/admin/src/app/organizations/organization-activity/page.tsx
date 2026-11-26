
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  Eye,
  Filter,
  KeyRound,
  LogIn,
  MoreHorizontal,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  UserPlus,
  Users,
  X,
  XCircle,
} from "lucide-react";

type ActivityStatus = "Success" | "Failed" | "Pending";
type ActivityCategory =
  | "All categories"
  | "Organization"
  | "Members"
  | "Security"
  | "API Projects"
  | "Billing"
  | "Settings";

type ActivityRecord = {
  id: string;
  action: string;
  category: Exclude<ActivityCategory, "All categories">;
  actor: string;
  email: string;
  organization: string;
  timestamp: string;
  ip: string;
  status: ActivityStatus;
  description: string;
};

const initialActivities: ActivityRecord[] = [
  {
    id: "evt_10481",
    action: "Organization settings updated",
    category: "Settings",
    actor: "Pujitha Marikanti",
    email: "admin@acme.example",
    organization: "Acme Corporation",
    timestamp: "Nov 04, 2026 · 10:42 AM",
    ip: "192.0.2.24",
    status: "Success",
    description: "Organization profile settings were updated.",
  },
  {
    id: "evt_10480",
    action: "Member invited",
    category: "Members",
    actor: "Sarah Johnson",
    email: "sarah@acme.example",
    organization: "Acme Corporation",
    timestamp: "Nov 04, 2026 · 10:18 AM",
    ip: "192.0.2.35",
    status: "Success",
    description: "An invitation was created for a new organization member.",
  },
  {
    id: "evt_10479",
    action: "API project created",
    category: "API Projects",
    actor: "David Chen",
    email: "david@northstar.example",
    organization: "Northstar AI",
    timestamp: "Nov 04, 2026 · 09:56 AM",
    ip: "198.51.100.12",
    status: "Success",
    description: "A development API project was created.",
  },
  {
    id: "evt_10478",
    action: "Failed sign-in attempt",
    category: "Security",
    actor: "Unknown user",
    email: "unknown@example.invalid",
    organization: "Vertex Labs",
    timestamp: "Nov 04, 2026 · 09:31 AM",
    ip: "203.0.113.41",
    status: "Failed",
    description: "A sign-in attempt was rejected by authentication.",
  },
  {
    id: "evt_10477",
    action: "Member role changed",
    category: "Members",
    actor: "Alex Morgan",
    email: "alex@vertex.example",
    organization: "Vertex Labs",
    timestamp: "Nov 04, 2026 · 09:14 AM",
    ip: "198.51.100.22",
    status: "Success",
    description: "A member role was changed from Member to Developer.",
  },
  {
    id: "evt_10476",
    action: "API key rotation requested",
    category: "Security",
    actor: "System administrator",
    email: "security@acme.example",
    organization: "Acme Corporation",
    timestamp: "Nov 04, 2026 · 08:48 AM",
    ip: "192.0.2.18",
    status: "Pending",
    description: "An API key rotation request is awaiting processing.",
  },
  {
    id: "evt_10475",
    action: "Billing details updated",
    category: "Billing",
    actor: "Finance administrator",
    email: "finance@brightpath.example",
    organization: "BrightPath",
    timestamp: "Nov 03, 2026 · 05:42 PM",
    ip: "203.0.113.15",
    status: "Success",
    description: "Billing contact information was changed.",
  },
  {
    id: "evt_10474",
    action: "Organization created",
    category: "Organization",
    actor: "Platform administrator",
    email: "platform@modelnow.example",
    organization: "CloudPeak Systems",
    timestamp: "Nov 03, 2026 · 04:10 PM",
    ip: "192.0.2.50",
    status: "Success",
    description: "A new organization record was created.",
  },
  {
    id: "evt_10473",
    action: "Member access suspended",
    category: "Members",
    actor: "Organization owner",
    email: "owner@novaworks.example",
    organization: "NovaWorks",
    timestamp: "Nov 03, 2026 · 03:26 PM",
    ip: "198.51.100.38",
    status: "Success",
    description: "A member account was suspended by an organization owner.",
  },
  {
    id: "evt_10472",
    action: "Organization policy review",
    category: "Organization",
    actor: "Compliance service",
    email: "compliance@modelnow.example",
    organization: "Northstar AI",
    timestamp: "Nov 03, 2026 · 02:52 PM",
    ip: "192.0.2.70",
    status: "Pending",
    description: "A policy review event is awaiting review.",
  },
];

const categories: ActivityCategory[] = [
  "All categories",
  "Organization",
  "Members",
  "Security",
  "API Projects",
  "Billing",
  "Settings",
];

const numberFormat = new Intl.NumberFormat("en-US");

function categoryIcon(category: ActivityRecord["category"]) {
  switch (category) {
    case "Organization":
      return Users;
    case "Members":
      return UserPlus;
    case "Security":
      return ShieldCheck;
    case "API Projects":
      return KeyRound;
    case "Billing":
      return Activity;
    case "Settings":
      return Settings;
  }
}

export default function OrganizationActivityPage() {
  const [activities, setActivities] =
    useState<ActivityRecord[]>(initialActivities);
  const [search, setSearch] = useState("");
  const [category, setCategory] =
    useState<ActivityCategory>("All categories");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [dateFilter, setDateFilter] = useState("All time");
  const [selectedActivity, setSelectedActivity] =
    useState<ActivityRecord | null>(null);
  const [notice, setNotice] = useState("");
  const [menuId, setMenuId] = useState<string | null>(null);

  const filteredActivities = useMemo(() => {
    const query = search.trim().toLowerCase();

    return activities.filter((item) => {
      const matchesSearch =
        !query ||
        item.action.toLowerCase().includes(query) ||
        item.actor.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.organization.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query);

      const matchesCategory =
        category === "All categories" || item.category === category;

      const matchesStatus =
        statusFilter === "All statuses" || item.status === statusFilter;

      let matchesDate = true;

      if (dateFilter === "Today") {
        matchesDate = item.timestamp.startsWith("Nov 04, 2026");
      } else if (dateFilter === "Last 7 days") {
        matchesDate = [
          "Nov 04, 2026",
          "Nov 03, 2026",
        ].some((date) => item.timestamp.startsWith(date));
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [activities, search, category, statusFilter, dateFilter]);

  const successfulCount = activities.filter(
    (item) => item.status === "Success",
  ).length;

  const failedCount = activities.filter(
    (item) => item.status === "Failed",
  ).length;

  const pendingCount = activities.filter(
    (item) => item.status === "Pending",
  ).length;

  function refreshActivities() {
    setNotice(
      "Activity view refreshed. This page is currently using sample records.",
    );
  }

  function exportCsv() {
    const headers = [
      "Event ID",
      "Action",
      "Category",
      "Actor",
      "Email",
      "Organization",
      "Timestamp",
      "IP Address",
      "Status",
      "Description",
    ];

    const rows = filteredActivities.map((item) => [
      item.id,
      item.action,
      item.category,
      item.actor,
      item.email,
      item.organization,
      item.timestamp,
      item.ip,
      item.status,
      item.description,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "modelnow-organization-activity.csv";
    anchor.click();
    URL.revokeObjectURL(url);

    setNotice("Filtered activity report exported.");
  }

  function updateStatus(id: string, status: ActivityStatus) {
    setActivities((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status } : item,
      ),
    );
    setNotice("Sample event status updated in this page.");
    setMenuId(null);
  }

  function resetFilters() {
    setSearch("");
    setCategory("All categories");
    setStatusFilter("All statuses");
    setDateFilter("All time");
  }

  return (
    <main className="org-activity-page">
      <style>{`
        * { box-sizing: border-box; }
        .org-activity-page {
          min-height: 100vh;
          padding: 30px;
          background: #f7f8fc;
          color: #182238;
          font-family: Arial, Helvetica, sans-serif;
        }
        .org-activity-container { max-width: 1480px; margin: 0 auto; }
        .org-activity-breadcrumb {
          color: #7e899c; font-size: 12px; margin-bottom: 15px;
        }
        .org-activity-breadcrumb span { color: #315fe8; }
        .org-activity-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          gap: 18px; flex-wrap: wrap; margin-bottom: 25px;
        }
        .org-activity-title {
          margin: 0 0 8px; font-size: 27px; letter-spacing: -.7px; font-weight: 750;
        }
        .org-activity-subtitle {
          margin: 0; color: #7c879c; font-size: 13px; line-height: 1.6;
        }
        .org-activity-actions { display: flex; gap: 9px; flex-wrap: wrap; }
        .org-activity-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 10px 13px; border: 1px solid #dfe4ed; border-radius: 9px;
          background: #fff; color: #39465e; font-size: 12px; font-weight: 650; cursor: pointer;
        }
        .org-activity-btn:hover { background: #f0f4ff; }
        .org-activity-btn.primary { background: #315fe8; color: #fff; border-color: #315fe8; }
        .org-activity-btn.primary:hover { background: #254fcf; }
        .org-activity-notice {
          display: flex; justify-content: space-between; align-items: flex-start; gap: 10px;
          padding: 11px 14px; margin-bottom: 18px; border-radius: 9px;
          border: 1px solid #c9d9ff; background: #eff4ff; color: #244dbb;
          font-size: 12px; line-height: 1.5;
        }
        .org-activity-dismiss { border: 0; background: transparent; color: inherit; cursor: pointer; }
        .org-activity-stats {
          display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px; margin-bottom: 22px;
        }
        .org-activity-stat {
          padding: 19px; border: 1px solid #e8ebf2; border-radius: 13px; background: #fff;
        }
        .org-activity-stat-top {
          display: flex; justify-content: space-between; align-items: center; gap: 10px;
          margin-bottom: 17px;
        }
        .org-activity-stat-label { color: #778298; font-size: 12px; }
        .org-activity-stat-icon {
          width: 35px; height: 35px; border-radius: 10px; display: grid;
          place-items: center; background: #edf2ff; color: #315fe8;
        }
        .org-activity-stat-icon.green { background: #eaf8ef; color: #168453; }
        .org-activity-stat-icon.red { background: #fff0ee; color: #c34438; }
        .org-activity-stat-icon.amber { background: #fff5df; color: #9a6400; }
        .org-activity-stat-value { font-size: 26px; font-weight: 750; letter-spacing: -.5px; margin-bottom: 7px; }
        .org-activity-stat-note { color: #8b95a7; font-size: 11px; }
        .org-activity-panel {
          border: 1px solid #e8ebf2; border-radius: 13px; background: #fff; overflow: visible;
        }
        .org-activity-panel-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          gap: 16px; flex-wrap: wrap; padding: 21px; border-bottom: 1px solid #edf0f5;
        }
        .org-activity-panel-title { margin: 0 0 6px; font-size: 15px; font-weight: 750; }
        .org-activity-panel-description { margin: 0; color: #8993a5; font-size: 11px; line-height: 1.5; }
        .org-activity-filters { display: flex; gap: 8px; flex-wrap: wrap; }
        .org-activity-search-wrap { position: relative; }
        .org-activity-search-icon {
          position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #929bad;
        }
        .org-activity-search {
          width: 220px; padding: 10px 10px 10px 31px; border: 1px solid #e0e5ee;
          border-radius: 8px; outline: none; font-size: 11px; color: #263248;
        }
        .org-activity-select {
          padding: 10px 11px; border: 1px solid #e0e5ee; border-radius: 8px;
          background: #fff; color: #44516a; font-size: 11px; outline: none;
        }
        .org-activity-search:focus, .org-activity-select:focus { border-color: #7898ff; }
        .org-activity-table-scroll { overflow-x: auto; }
        .org-activity-table { width: 100%; border-collapse: collapse; white-space: nowrap; }
        .org-activity-table th {
          padding: 13px 17px; text-align: left; background: #fafbfe;
          color: #8992a4; font-size: 10px; font-weight: 700;
        }
        .org-activity-table td {
          padding: 15px 17px; border-top: 1px solid #eff1f6;
          color: #4c5870; font-size: 11px; vertical-align: middle;
        }
        .org-activity-action-cell { display: flex; align-items: center; gap: 10px; }
        .org-activity-event-icon {
          display: grid; place-items: center; width: 33px; height: 33px; flex-shrink: 0;
          border-radius: 9px; background: #edf2ff; color: #315fe8;
        }
        .org-activity-action { color: #202b40; font-size: 12px; font-weight: 700; }
        .org-activity-id { margin-top: 5px; color: #929bad; font-size: 10px; }
        .org-activity-actor { color: #344159; font-weight: 650; }
        .org-activity-email { color: #9099aa; font-size: 10px; margin-top: 4px; }
        .org-activity-category {
          display: inline-flex; padding: 5px 8px; border-radius: 6px;
          background: #f0f3fa; color: #5a6680; font-size: 10px; font-weight: 650;
        }
        .org-activity-status {
          display: inline-flex; align-items: center; gap: 6px; padding: 5px 8px;
          border-radius: 20px; font-size: 10px; font-weight: 650;
        }
        .org-activity-status.Success { background: #eaf8ef; color: #167747; }
        .org-activity-status.Failed { background: #fff0ee; color: #bd3f34; }
        .org-activity-status.Pending { background: #fff5df; color: #9a6400; }
        .org-activity-status-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
        .org-activity-menu-wrap { position: relative; }
        .org-activity-icon-btn {
          display: inline-grid; place-items: center; width: 30px; height: 30px;
          border: 1px solid #e3e7ef; border-radius: 7px; background: #fff; color: #65718a; cursor: pointer;
        }
        .org-activity-icon-btn:hover { background: #f1f4fb; color: #315fe8; }
        .org-activity-menu {
          position: absolute; right: 0; top: 35px; z-index: 10; width: 170px;
          padding: 5px; border: 1px solid #e5e9f1; border-radius: 9px; background: #fff;
          box-shadow: 0 12px 35px #1822381a;
        }
        .org-activity-menu button {
          display: flex; width: 100%; align-items: center; gap: 9px; padding: 10px;
          border: 0; border-radius: 6px; background: transparent; text-align: left;
          color: #455169; font-size: 11px; cursor: pointer;
        }
        .org-activity-menu button:hover { background: #f2f5fc; }
        .org-activity-empty { padding: 38px 20px; text-align: center; color: #8790a3; font-size: 12px; }
        .org-activity-footer {
          display: flex; justify-content: space-between; align-items: center; gap: 12px;
          flex-wrap: wrap; padding: 14px 20px; border-top: 1px solid #edf0f5;
          color: #8790a3; font-size: 11px;
        }
        .org-activity-modal-backdrop {
          position: fixed; inset: 0; z-index: 100; display: grid; place-items: center;
          padding: 18px; background: rgba(15, 23, 42, .48);
        }
        .org-activity-modal {
          width: 100%; max-width: 530px; max-height: 90vh; overflow-y: auto;
          border-radius: 15px; background: #fff; box-shadow: 0 25px 80px #0002;
        }
        .org-activity-modal-header {
          display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;
          padding: 22px; border-bottom: 1px solid #edf0f5;
        }
        .org-activity-modal-title { margin: 0 0 6px; font-size: 18px; font-weight: 750; }
        .org-activity-modal-subtitle { margin: 0; color: #8490a4; font-size: 12px; line-height: 1.5; }
        .org-activity-modal-body { padding: 22px; }
        .org-activity-detail {
          display: flex; justify-content: space-between; gap: 16px; padding: 12px 0;
          border-bottom: 1px solid #edf0f5; font-size: 12px;
        }
        .org-activity-detail:last-child { border-bottom: 0; }
        .org-activity-detail-label { color: #8790a3; flex-shrink: 0; }
        .org-activity-detail-value { color: #253149; font-weight: 650; text-align: right; overflow-wrap: anywhere; }
        .org-activity-modal-footer {
          display: flex; justify-content: flex-end; gap: 9px; padding: 16px 22px;
          border-top: 1px solid #edf0f5; background: #fbfcfe; border-radius: 0 0 15px 15px;
        }
        @media (max-width: 1050px) { .org-activity-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (max-width: 650px) {
          .org-activity-page { padding: 17px; }
          .org-activity-title { font-size: 23px; }
          .org-activity-stats { grid-template-columns: 1fr; }
          .org-activity-panel-header { padding: 16px; }
          .org-activity-filters { width: 100%; }
          .org-activity-search-wrap { width: 100%; }
          .org-activity-search { width: 100%; }
          .org-activity-filters select { flex: 1; min-width: 0; }
        }
      `}</style>

      <div className="org-activity-container">
        <div className="org-activity-breadcrumb">
          Organizations / <span>Activity</span>
        </div>

        <header className="org-activity-header">
          <div>
            <h1 className="org-activity-title">Organization Activity</h1>
            <p className="org-activity-subtitle">
              Review organization events, member changes, security activity,
              and administrative actions.
            </p>
          </div>

          <div className="org-activity-actions">
            <button className="org-activity-btn" onClick={refreshActivities}>
              <RefreshCw size={14} /> Refresh
            </button>
            <button
              className="org-activity-btn primary"
              onClick={exportCsv}
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        </header>

        {notice && (
          <div className="org-activity-notice" role="status">
            <span>{notice}</span>
            <button
              className="org-activity-dismiss"
              aria-label="Dismiss notification"
              onClick={() => setNotice("")}
            >
              <X size={15} />
            </button>
          </div>
        )}

        <section className="org-activity-stats">
          <div className="org-activity-stat">
            <div className="org-activity-stat-top">
              <span className="org-activity-stat-label">Total events</span>
              <span className="org-activity-stat-icon">
                <Activity size={18} />
              </span>
            </div>
            <div className="org-activity-stat-value">
              {numberFormat.format(activities.length)}
            </div>
            <div className="org-activity-stat-note">Events in the sample dataset</div>
          </div>

          <div className="org-activity-stat">
            <div className="org-activity-stat-top">
              <span className="org-activity-stat-label">Successful events</span>
              <span className="org-activity-stat-icon green">
                <CheckCircle2 size={18} />
              </span>
            </div>
            <div className="org-activity-stat-value">
              {numberFormat.format(successfulCount)}
            </div>
            <div className="org-activity-stat-note">Marked as successful</div>
          </div>

          <div className="org-activity-stat">
            <div className="org-activity-stat-top">
              <span className="org-activity-stat-label">Failed events</span>
              <span className="org-activity-stat-icon red">
                <XCircle size={18} />
              </span>
            </div>
            <div className="org-activity-stat-value">
              {numberFormat.format(failedCount)}
            </div>
            <div className="org-activity-stat-note">Require investigation if genuine</div>
          </div>

          <div className="org-activity-stat">
            <div className="org-activity-stat-top">
              <span className="org-activity-stat-label">Pending events</span>
              <span className="org-activity-stat-icon amber">
                <Clock3 size={18} />
              </span>
            </div>
            <div className="org-activity-stat-value">
              {numberFormat.format(pendingCount)}
            </div>
            <div className="org-activity-stat-note">Marked as awaiting processing</div>
          </div>
        </section>

        <section className="org-activity-panel">
          <div className="org-activity-panel-header">
            <div>
              <h2 className="org-activity-panel-title">Activity log</h2>
              <p className="org-activity-panel-description">
                Search and filter organization events. Open an event for its full details.
              </p>
            </div>

            <div className="org-activity-filters">
              <div className="org-activity-search-wrap">
                <Search size={14} className="org-activity-search-icon" />
                <input
                  className="org-activity-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search events, users, IDs..."
                  aria-label="Search activity"
                />
              </div>

              <select
                className="org-activity-select"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value as ActivityCategory)
                }
                aria-label="Filter by category"
              >
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>

              <select
                className="org-activity-select"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter by status"
              >
                <option>All statuses</option>
                <option>Success</option>
                <option>Failed</option>
                <option>Pending</option>
              </select>

              <select
                className="org-activity-select"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                aria-label="Filter by date"
              >
                <option>All time</option>
                <option>Today</option>
                <option>Last 7 days</option>
              </select>

              <button
                className="org-activity-btn"
                onClick={resetFilters}
                title="Clear filters"
              >
                <Filter size={13} /> Clear
              </button>
            </div>
          </div>

          <div className="org-activity-table-scroll">
            <table className="org-activity-table">
              <thead>
                <tr>
                  <th>EVENT</th>
                  <th>ACTOR</th>
                  <th>ORGANIZATION</th>
                  <th>CATEGORY</th>
                  <th>DATE & TIME</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredActivities.map((item) => {
                  const Icon = categoryIcon(item.category);

                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="org-activity-action-cell">
                          <span className="org-activity-event-icon">
                            <Icon size={15} />
                          </span>
                          <div>
                            <div className="org-activity-action">{item.action}</div>
                            <div className="org-activity-id">{item.id}</div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="org-activity-actor">{item.actor}</div>
                        <div className="org-activity-email">{item.email}</div>
                      </td>

                      <td>{item.organization}</td>

                      <td>
                        <span className="org-activity-category">
                          {item.category}
                        </span>
                      </td>

                      <td>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <CalendarDays size={12} />
                          {item.timestamp}
                        </span>
                      </td>

                      <td>
                        <span className={`org-activity-status ${item.status}`}>
                          <span className="org-activity-status-dot" />
                          {item.status}
                        </span>
                      </td>

                      <td>
                        <div className="org-activity-menu-wrap">
                          <button
                            className="org-activity-icon-btn"
                            onClick={() =>
                              setMenuId(menuId === item.id ? null : item.id)
                            }
                            aria-label={`Actions for ${item.id}`}
                          >
                            <MoreHorizontal size={16} />
                          </button>

                          {menuId === item.id && (
                            <div className="org-activity-menu">
                              <button
                                onClick={() => {
                                  setSelectedActivity(item);
                                  setMenuId(null);
                                }}
                              >
                                <Eye size={13} /> View event details
                              </button>

                              <button
                                onClick={() => {
                                  setNotice(`Event ID: ${item.id}`);
                                  setMenuId(null);
                                }}
                              >
                                <ArrowDownToLine size={13} /> Show event ID
                              </button>

                              {item.status !== "Success" && (
                                <button
                                  onClick={() => updateStatus(item.id, "Success")}
                                >
                                  <CheckCircle2 size={13} /> Mark successful
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredActivities.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      <div className="org-activity-empty">
                        No activity events match your filters.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="org-activity-footer">
            <span>
              Showing {filteredActivities.length} of {activities.length} events
            </span>
            <span>Sample activity records · not connected to an audit backend</span>
          </div>
        </section>

        {selectedActivity && (
          <div
            className="org-activity-modal-backdrop"
            onClick={() => setSelectedActivity(null)}
          >
            <section
              className="org-activity-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="org-activity-modal-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="org-activity-modal-header">
                <div>
                  <h2
                    className="org-activity-modal-title"
                    id="org-activity-modal-title"
                  >
                    Event details
                  </h2>
                  <p className="org-activity-modal-subtitle">
                    Review the available information for this activity event.
                  </p>
                </div>

                <button
                  className="org-activity-icon-btn"
                  onClick={() => setSelectedActivity(null)}
                  aria-label="Close event details"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="org-activity-modal-body">
                {[
                  ["Event ID", selectedActivity.id],
                  ["Action", selectedActivity.action],
                  ["Category", selectedActivity.category],
                  ["Actor", selectedActivity.actor],
                  ["Email", selectedActivity.email],
                  ["Organization", selectedActivity.organization],
                  ["Timestamp", selectedActivity.timestamp],
                  ["IP address", selectedActivity.ip],
                  ["Status", selectedActivity.status],
                  ["Description", selectedActivity.description],
                ].map(([label, value]) => (
                  <div className="org-activity-detail" key={label}>
                    <span className="org-activity-detail-label">{label}</span>
                    <span className="org-activity-detail-value">{value}</span>
                  </div>
                ))}
              </div>

              <div className="org-activity-modal-footer">
                <button
                  className="org-activity-btn"
                  onClick={() => setSelectedActivity(null)}
                >
                  Close
                </button>
                <button
                  className="org-activity-btn primary"
                  onClick={() => {
                    setNotice(`Selected event: ${selectedActivity.id}`);
                    setSelectedActivity(null);
                  }}
                >
                  <CheckCircle2 size={14} /> Done
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
