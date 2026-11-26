// ModelNow Admin Users page
"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  Search,
  Download,
  Filter,
  RefreshCw,
  Eye,
  X,
  UserRound,
  ShieldCheck,
  LogIn,
  Settings,
  FileText,
  KeyRound,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Globe,
  Monitor,
  ChevronDown,
} from "lucide-react";

type ActivityStatus = "Success" | "Failed" | "Warning";

type ActivityRecord = {
  id: string;
  user: string;
  email: string;
  action: string;
  category: string;
  resource: string;
  ip: string;
  location: string;
  device: string;
  timestamp: string;
  status: ActivityStatus;
};

const initialActivities: ActivityRecord[] = [
  {
    id: "ACT-7001",
    user: "Pujitha Marikanti",
    email: "pujitha@example.com",
    action: "Signed in",
    category: "Authentication",
    resource: "Admin Console",
    ip: "192.168.1.24",
    location: "Hyderabad, India",
    device: "Chrome · Windows",
    timestamp: "2026-11-04 10:32:15",
    status: "Success",
  },
  {
    id: "ACT-7002",
    user: "Sarah Chen",
    email: "sarah.chen@example.com",
    action: "Updated user role",
    category: "User Management",
    resource: "USR-1008",
    ip: "10.0.0.18",
    location: "Singapore",
    device: "Edge · Windows",
    timestamp: "2026-11-04 10:18:42",
    status: "Success",
  },
  {
    id: "ACT-7003",
    user: "James Wilson",
    email: "james.wilson@example.com",
    action: "Created API key",
    category: "API & Security",
    resource: "API Key · Production",
    ip: "172.16.0.45",
    location: "London, UK",
    device: "Chrome · macOS",
    timestamp: "2026-11-04 09:54:07",
    status: "Success",
  },
  {
    id: "ACT-7004",
    user: "Olivia Brown",
    email: "olivia.brown@example.com",
    action: "Failed login attempt",
    category: "Authentication",
    resource: "Admin Console",
    ip: "203.0.113.17",
    location: "Unknown",
    device: "Firefox · Linux",
    timestamp: "2026-11-04 09:41:23",
    status: "Failed",
  },
  {
    id: "ACT-7005",
    user: "Liam Smith",
    email: "liam.smith@example.com",
    action: "Updated workspace settings",
    category: "Configuration",
    resource: "Workspace · Nova",
    ip: "10.0.0.31",
    location: "New York, USA",
    device: "Safari · macOS",
    timestamp: "2026-11-04 09:22:51",
    status: "Success",
  },
  {
    id: "ACT-7006",
    user: "Emma Johnson",
    email: "emma.johnson@example.com",
    action: "Exported user report",
    category: "Data & Reports",
    resource: "users-report.csv",
    ip: "192.168.1.51",
    location: "Toronto, Canada",
    device: "Chrome · Windows",
    timestamp: "2026-11-04 08:57:12",
    status: "Success",
  },
  {
    id: "ACT-7007",
    user: "Noah Davis",
    email: "noah.davis@example.com",
    action: "Permission change flagged",
    category: "Access Control",
    resource: "Role · Administrator",
    ip: "198.51.100.28",
    location: "Frankfurt, Germany",
    device: "Chrome · Linux",
    timestamp: "2026-11-04 08:44:36",
    status: "Warning",
  },
  {
    id: "ACT-7008",
    user: "Ava Martinez",
    email: "ava.martinez@example.com",
    action: "Changed account settings",
    category: "Configuration",
    resource: "Account Preferences",
    ip: "10.0.0.42",
    location: "Austin, USA",
    device: "Edge · Windows",
    timestamp: "2026-11-03 17:36:02",
    status: "Success",
  },
  {
    id: "ACT-7009",
    user: "Ethan Wilson",
    email: "ethan.wilson@example.com",
    action: "Session expired",
    category: "Authentication",
    resource: "Admin Console",
    ip: "192.168.1.77",
    location: "Sydney, Australia",
    device: "Chrome · Android",
    timestamp: "2026-11-03 16:12:44",
    status: "Warning",
  },
  {
    id: "ACT-7010",
    user: "Sophia Taylor",
    email: "sophia.taylor@example.com",
    action: "Viewed billing settings",
    category: "Billing",
    resource: "Billing Overview",
    ip: "10.0.0.62",
    location: "Dublin, Ireland",
    device: "Safari · macOS",
    timestamp: "2026-11-03 15:49:18",
    status: "Success",
  },
];

const categories = [
  "Authentication",
  "User Management",
  "API & Security",
  "Configuration",
  "Data & Reports",
  "Access Control",
  "Billing",
];

function MetricCard({
  label,
  value,
  description,
  icon,
  tone,
}: {
  label: string;
  value: number;
  description: string;
  icon: ReactNode;
  tone: string;
}) {
  return (
    <div className="metric-card">
      <div className={`metric-icon ${tone}`}>{icon}</div>
      <div>
        <p>{label}</p>
        <h3>{value.toLocaleString()}</h3>
        <span>{description}</span>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ActivityStatus }) {
  return (
    <span className={`status-badge ${status.toLowerCase()}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
}

function ActionIcon({ category }: { category: string }) {
  if (category === "Authentication") return <LogIn size={16} />;
  if (category === "User Management") return <UserRound size={16} />;
  if (category === "API & Security") return <KeyRound size={16} />;
  if (category === "Configuration") return <Settings size={16} />;
  if (category === "Data & Reports") return <FileText size={16} />;
  if (category === "Access Control") return <ShieldCheck size={16} />;
  return <Activity size={16} />;
}

export default function UserActivityPage() {
  const [activities, setActivities] = useState(initialActivities);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [dateFilter, setDateFilter] = useState("All time");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedActivity, setSelectedActivity] =
    useState<ActivityRecord | null>(null);
  const [notice, setNotice] = useState("");

  const filteredActivities = useMemo(() => {
    const query = search.trim().toLowerCase();

    return activities.filter((item) => {
      const matchesSearch =
        !query ||
        item.id.toLowerCase().includes(query) ||
        item.user.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.action.toLowerCase().includes(query) ||
        item.resource.toLowerCase().includes(query) ||
        item.ip.toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === "All categories" ||
        item.category === categoryFilter;

      const matchesStatus =
        statusFilter === "All statuses" || item.status === statusFilter;

      const activityDate = item.timestamp.slice(0, 10);
      const today = new Date().toISOString().slice(0, 10);
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterday = yesterdayDate.toISOString().slice(0, 10);

      const matchesDate =
        dateFilter === "All time" ||
        (dateFilter === "Today" && activityDate === today) ||
        (dateFilter === "Yesterday" && activityDate === yesterday) ||
        (dateFilter === "Last 7 days" &&
          new Date(activityDate).getTime() >=
            Date.now() - 7 * 24 * 60 * 60 * 1000);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [activities, search, categoryFilter, statusFilter, dateFilter]);

  const successCount = activities.filter(
    (item) => item.status === "Success"
  ).length;
  const failedCount = activities.filter(
    (item) => item.status === "Failed"
  ).length;
  const warningCount = activities.filter(
    (item) => item.status === "Warning"
  ).length;

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  };

  const exportCsv = () => {
    const headers = [
      "Activity ID",
      "User",
      "Email",
      "Action",
      "Category",
      "Resource",
      "IP Address",
      "Location",
      "Device",
      "Timestamp",
      "Status",
    ];

    const rows = filteredActivities.map((item) => [
      item.id,
      item.user,
      item.email,
      item.action,
      item.category,
      item.resource,
      item.ip,
      item.location,
      item.device,
      item.timestamp,
      item.status,
    ]);

    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-user-activity.csv";
    link.click();
    URL.revokeObjectURL(url);
    showNotice("Activity report exported.");
  };

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("All categories");
    setStatusFilter("All statuses");
    setDateFilter("All time");
  };

  const refreshActivities = () => {
    setActivities((current) => [...current]);
    showNotice("Activity list refreshed. This page currently uses demo data.");
  };

  return (
    <main className="page">
      <header className="page-header">
        <div>
          <div className="breadcrumbs">
            <span>Admin</span>
            <span>/</span>
            <span>Users</span>
            <span>/</span>
            <strong>User Activity</strong>
          </div>
          <h1>User Activity</h1>
          <p className="subtitle">
            Monitor user actions, account changes, security events, and
            platform activity.
          </p>
        </div>

        <div className="header-actions">
          <button className="button secondary" onClick={refreshActivities}>
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="button primary" onClick={exportCsv}>
            <Download size={16} />
            Export activity
          </button>
        </div>
      </header>

      {notice && (
        <div className="notice">
          <CheckCircle2 size={18} />
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss notification">
            <X size={16} />
          </button>
        </div>
      )}

      <section className="metrics-grid">
        <MetricCard
          label="Total Events"
          value={activities.length}
          description="Recorded activity events"
          icon={<Activity size={20} />}
          tone="blue"
        />
        <MetricCard
          label="Successful Actions"
          value={successCount}
          description="Completed successfully"
          icon={<CheckCircle2 size={20} />}
          tone="green"
        />
        <MetricCard
          label="Failed Actions"
          value={failedCount}
          description="Require investigation"
          icon={<AlertTriangle size={20} />}
          tone="red"
        />
        <MetricCard
          label="Security Warnings"
          value={warningCount}
          description="Flagged for review"
          icon={<ShieldCheck size={20} />}
          tone="orange"
        />
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Activity log</h2>
            <p>Review events across user accounts and the admin platform.</p>
          </div>
          <span className="count-badge">
            {filteredActivities.length} events
          </span>
        </div>

        <div className="toolbar">
          <div className="search-box">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search users, actions, resources, IP..."
              aria-label="Search activity"
            />
            {search && (
              <button
                className="icon-button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <button
            className={`button secondary ${showFilters ? "active-filter" : ""}`}
            onClick={() => setShowFilters((current) => !current)}
          >
            <Filter size={16} />
            Filters
            <ChevronDown size={14} />
          </button>
        </div>

        {showFilters && (
          <div className="filter-row">
            <label>
              Category
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option>All categories</option>
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>

            <label>
              Status
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option>All statuses</option>
                <option>Success</option>
                <option>Failed</option>
                <option>Warning</option>
              </select>
            </label>

            <label>
              Date range
              <select
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
              >
                <option>All time</option>
                <option>Today</option>
                <option>Yesterday</option>
                <option>Last 7 days</option>
              </select>
            </label>

            <button className="reset-button" onClick={resetFilters}>
              Reset filters
            </button>
          </div>
        )}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Activity</th>
                <th>Category</th>
                <th>Resource</th>
                <th>IP address</th>
                <th>Timestamp</th>
                <th>Status</th>
                <th className="action-heading">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivities.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="activity-cell">
                      <div className={`action-icon ${item.status.toLowerCase()}`}>
                        <ActionIcon category={item.category} />
                      </div>
                      <div className="activity-info">
                        <strong>{item.action}</strong>
                        <span>{item.user}</span>
                        <small>{item.id}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="category-badge">{item.category}</span>
                  </td>
                  <td>
                    <span className="resource-text">{item.resource}</span>
                  </td>
                  <td>
                    <span className="ip-text">{item.ip}</span>
                  </td>
                  <td>
                    <div className="timestamp-cell">
                      <Clock3 size={14} />
                      {item.timestamp}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={item.status} />
                  </td>
                  <td>
                    <button
                      className="icon-button"
                      title="View activity details"
                      aria-label={`View details for ${item.id}`}
                      onClick={() => setSelectedActivity(item)}
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredActivities.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <Activity size={30} />
                      <strong>No activity found</strong>
                      <p>Try a different search term or filter.</p>
                      <button className="button secondary" onClick={resetFilters}>
                        Clear filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="table-footer">
          <span>
            Showing {filteredActivities.length} of {activities.length} events
          </span>
          <span className="footer-note">
            <ShieldCheck size={14} />
            Demo activity records
          </span>
        </footer>
      </section>

      {selectedActivity && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedActivity(null)}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="activity-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="modal-header">
              <div>
                <span className="eyebrow">ACTIVITY EVENT</span>
                <h2 id="activity-detail-title">{selectedActivity.id}</h2>
                <p>Detailed event information and audit context.</p>
              </div>
              <button
                className="icon-button"
                onClick={() => setSelectedActivity(null)}
                aria-label="Close activity details"
              >
                <X size={19} />
              </button>
            </header>

            <div className="event-summary">
              <div className={`action-icon large ${selectedActivity.status.toLowerCase()}`}>
                <ActionIcon category={selectedActivity.category} />
              </div>
              <div className="event-summary-info">
                <h3>{selectedActivity.action}</h3>
                <p>{selectedActivity.user}</p>
                <StatusBadge status={selectedActivity.status} />
              </div>
            </div>

            <div className="detail-grid">
              <div>
                <span>User email</span>
                <strong>{selectedActivity.email}</strong>
              </div>
              <div>
                <span>Activity category</span>
                <strong>{selectedActivity.category}</strong>
              </div>
              <div>
                <span>Resource</span>
                <strong>{selectedActivity.resource}</strong>
              </div>
              <div>
                <span>Timestamp</span>
                <strong>{selectedActivity.timestamp}</strong>
              </div>
              <div>
                <span>IP address</span>
                <strong>{selectedActivity.ip}</strong>
              </div>
              <div>
                <span>Approximate location</span>
                <strong>{selectedActivity.location}</strong>
              </div>
              <div>
                <span>Device and browser</span>
                <strong>{selectedActivity.device}</strong>
              </div>
              <div>
                <span>Event status</span>
                <strong>
                  <StatusBadge status={selectedActivity.status} />
                </strong>
              </div>
            </div>

            {selectedActivity.status !== "Success" && (
              <div className="security-notice">
                <AlertTriangle size={18} />
                <div>
                  <strong>Review recommended</strong>
                  <p>
                    This event is marked {selectedActivity.status.toLowerCase()}.
                    Review the surrounding audit records before taking action.
                  </p>
                </div>
              </div>
            )}

            <footer className="modal-footer">
              <button
                className="button secondary"
                onClick={() => setSelectedActivity(null)}
              >
                Close
              </button>
              <button
                className="button primary"
                onClick={() => {
                  const eventId = selectedActivity.id;
                  setSelectedActivity(null);
                  showNotice(`Viewing event ${eventId} in the activity log.`);
                }}
              >
                <Eye size={16} />
                Done
              </button>
            </footer>
          </section>
        </div>
      )}

      <style jsx>{`
        .page {
          min-height: 100vh;
          padding: 30px;
          background: #f8fafc;
          color: #172033;
          font-family: Arial, Helvetica, sans-serif;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 26px;
        }
        .breadcrumbs {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin-bottom: 12px;
          color: #8a94a6;
          font-size: 12px;
        }
        .breadcrumbs strong {
          color: #475569;
        }
        h1 {
          margin: 0;
          font-size: 27px;
          letter-spacing: -0.7px;
          font-weight: 750;
        }
        .subtitle {
          margin: 9px 0 0;
          color: #748096;
          font-size: 14px;
          line-height: 1.6;
        }
        .header-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
        }
        .button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 39px;
          padding: 0 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: 0.18s ease;
        }
        .secondary {
          border: 1px solid #dfe5ed;
          background: white;
          color: #344054;
        }
        .secondary:hover {
          border-color: #bfc9d8;
          background: #f8fafc;
        }
        .primary {
          border: 1px solid #315fea;
          background: #315fea;
          color: white;
        }
        .primary:hover {
          background: #244dcc;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }
        .metric-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          min-width: 0;
          padding: 20px;
          border: 1px solid #e7ebf1;
          border-radius: 12px;
          background: white;
        }
        .metric-icon {
          display: grid;
          place-items: center;
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          border-radius: 11px;
        }
        .metric-card p {
          margin: 1px 0 9px;
          color: #667085;
          font-size: 12px;
          font-weight: 600;
        }
        .metric-card h3 {
          margin: 0 0 7px;
          font-size: 27px;
          line-height: 1;
          letter-spacing: -0.7px;
        }
        .metric-card span {
          color: #8993a4;
          font-size: 11px;
        }
        .blue {
          background: #eaf2ff;
          color: #3268d8;
        }
        .green {
          background: #e9f9ef;
          color: #16834b;
        }
        .red {
          background: #fff0f0;
          color: #d14343;
        }
        .orange {
          background: #fff4e8;
          color: #c77720;
        }
        .panel {
          overflow: hidden;
          border: 1px solid #e5eaf1;
          border-radius: 12px;
          background: white;
        }
        .panel-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          padding: 22px 22px 17px;
        }
        .panel-heading h2 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
        }
        .panel-heading p {
          margin: 6px 0 0;
          color: #8590a2;
          font-size: 12px;
        }
        .count-badge {
          padding: 6px 10px;
          border-radius: 7px;
          background: #f2f5f9;
          color: #526177;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }
        .toolbar {
          display: flex;
          gap: 10px;
          padding: 0 22px 18px;
        }
        .search-box {
          display: flex;
          align-items: center;
          gap: 9px;
          flex: 1;
          min-width: 120px;
          height: 40px;
          padding: 0 12px;
          border: 1px solid #e0e6ee;
          border-radius: 8px;
          color: #98a2b3;
        }
        .search-box:focus-within {
          border-color: #8aa9fa;
          box-shadow: 0 0 0 3px #315fea12;
        }
        .search-box input {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          color: #344054;
          font-size: 12px;
        }
        .search-box input::placeholder {
          color: #9aa4b2;
        }
        .active-filter {
          border-color: #b9ccff;
          background: #eff4ff;
          color: #315fea;
        }
        .filter-row {
          display: flex;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 14px;
          padding: 16px 22px;
          border-top: 1px solid #edf0f5;
          border-bottom: 1px solid #edf0f5;
          background: #fbfcfe;
        }
        .filter-row label {
          display: flex;
          flex-direction: column;
          gap: 7px;
          min-width: 175px;
          color: #687589;
          font-size: 11px;
          font-weight: 600;
        }
        .filter-row select {
          height: 39px;
          padding: 0 10px;
          border: 1px solid #dfe5ed;
          border-radius: 7px;
          outline: none;
          background: white;
          color: #344054;
          font-size: 12px;
        }
        .filter-row select:focus {
          border-color: #8aa9fa;
          box-shadow: 0 0 0 3px #315fea12;
        }
        .reset-button {
          height: 37px;
          border: 0;
          background: transparent;
          color: #315fea;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }
        .table-wrap {
          width: 100%;
          overflow-x: auto;
        }
        table {
          width: 100%;
          min-width: 1080px;
          border-collapse: collapse;
          text-align: left;
        }
        thead {
          background: #f8fafc;
        }
        th {
          padding: 13px 14px;
          border-top: 1px solid #edf0f4;
          border-bottom: 1px solid #edf0f4;
          color: #778397;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.45px;
          text-transform: uppercase;
          white-space: nowrap;
        }
        th:first-child,
        td:first-child {
          padding-left: 22px;
        }
        th:last-child,
        td:last-child {
          padding-right: 22px;
        }
        td {
          padding: 14px;
          border-bottom: 1px solid #eef1f5;
          color: #475467;
          font-size: 12px;
          vertical-align: middle;
        }
        tbody tr:last-child td {
          border-bottom: none;
        }
        tbody tr:hover {
          background: #fbfcff;
        }
        .activity-cell {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 220px;
        }
        .action-icon {
          display: grid;
          place-items: center;
          width: 37px;
          height: 37px;
          flex-shrink: 0;
          border-radius: 10px;
          background: #eef4ff;
          color: #315fea;
        }
        .action-icon.failed {
          background: #fff0f0;
          color: #c63838;
        }
        .action-icon.warning {
          background: #fff5e8;
          color: #c77720;
        }
        .action-icon.success {
          background: #e9f9ef;
          color: #16834b;
        }
        .action-icon.large {
          width: 48px;
          height: 48px;
          border-radius: 12px;
        }
        .activity-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .activity-info strong {
          color: #263248;
          font-size: 12px;
          font-weight: 700;
        }
        .activity-info span {
          color: #7e899a;
          font-size: 11px;
        }
        .activity-info small {
          color: #a0a8b6;
          font-size: 10px;
        }
        .category-badge {
          display: inline-block;
          padding: 5px 8px;
          border: 1px solid #e1e7f0;
          border-radius: 6px;
          background: #f8fafc;
          color: #5d697d;
          font-size: 10px;
          white-space: nowrap;
        }
        .resource-text,
        .ip-text {
          color: #526177;
          font-size: 11px;
          white-space: nowrap;
        }
        .timestamp-cell {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #657187;
          font-size: 11px;
          white-space: nowrap;
        }
        .timestamp-cell :global(svg) {
          color: #9aa4b2;
          flex-shrink: 0;
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 8px;
          border: 1px solid;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .status-badge.success {
          border-color: #bbf7d0;
          background: #ecfdf3;
          color: #16834b;
        }
        .status-badge.success .status-dot {
          background: #16a34a;
        }
        .status-badge.failed {
          border-color: #ffd6d6;
          background: #fff2f2;
          color: #c63838;
        }
        .status-badge.failed .status-dot {
          background: #dc4545;
        }
        .status-badge.warning {
          border-color: #fed7aa;
          background: #fff7ed;
          color: #c46a16;
        }
        .status-badge.warning .status-dot {
          background: #ea8a2f;
        }
        .icon-button {
          display: inline-grid;
          place-items: center;
          width: 31px;
          height: 31px;
          border: 1px solid transparent;
          border-radius: 7px;
          background: transparent;
          color: #758196;
          cursor: pointer;
        }
        .icon-button:hover {
          border-color: #e2e8f0;
          background: #f1f5fb;
          color: #315fea;
        }
        .action-heading {
          text-align: right;
        }
        .table-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 15px 22px;
          border-top: 1px solid #edf0f4;
          color: #8993a4;
          font-size: 11px;
        }
        .footer-note {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 48px 20px;
          color: #97a2b3;
          text-align: center;
        }
        .empty-state strong {
          margin-top: 12px;
          color: #344054;
          font-size: 14px;
        }
        .empty-state p {
          margin: 7px 0 16px;
          font-size: 12px;
        }
        .notice {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
          padding: 12px 14px;
          border: 1px solid #bbf7d0;
          border-radius: 9px;
          background: #f0fdf4;
          color: #167344;
          font-size: 13px;
        }
        .notice span {
          flex: 1;
        }
        .notice button {
          display: grid;
          place-items: center;
          padding: 3px;
          border: none;
          background: transparent;
          color: inherit;
          cursor: pointer;
        }
        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: #0f172a7a;
          backdrop-filter: blur(3px);
        }
        .modal {
          width: 100%;
          max-width: 570px;
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          padding: 24px;
          border: 1px solid #e8edf4;
          border-radius: 15px;
          background: white;
          box-shadow: 0 25px 80px #0f172a30;
        }
        .modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 22px;
        }
        .eyebrow {
          color: #8995a7;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
        }
        .modal-header h2 {
          margin: 7px 0 0;
          font-size: 20px;
          letter-spacing: -0.4px;
        }
        .modal-header p {
          margin: 7px 0 0;
          color: #8590a2;
          font-size: 12px;
        }
        .event-summary {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 17px;
          border: 1px solid #e9edf3;
          border-radius: 11px;
          background: #fbfcfe;
        }
        .event-summary-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 7px;
          min-width: 0;
        }
        .event-summary h3 {
          margin: 0;
          color: #263248;
          font-size: 15px;
        }
        .event-summary p {
          margin: 0;
          color: #8590a2;
          font-size: 12px;
        }
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0 18px;
          margin: 18px 0;
        }
        .detail-grid > div {
          display: flex;
          flex-direction: column;
          gap: 7px;
          padding: 13px 0;
          border-bottom: 1px solid #edf0f4;
          min-width: 0;
        }
        .detail-grid span {
          color: #8993a4;
          font-size: 11px;
        }
        .detail-grid strong {
          overflow-wrap: anywhere;
          color: #344054;
          font-size: 12px;
          font-weight: 600;
        }
        .security-notice {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 13px;
          border: 1px solid #fed7aa;
          border-radius: 9px;
          background: #fff7ed;
          color: #c77720;
        }
        .security-notice > :global(svg) {
          flex-shrink: 0;
        }
        .security-notice strong {
          font-size: 12px;
        }
        .security-notice p {
          margin: 5px 0 0;
          color: #94652e;
          font-size: 11px;
          line-height: 1.6;
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 22px;
        }
        @media (max-width: 1100px) {
          .metrics-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .page {
            padding: 22px;
          }
        }
        @media (max-width: 650px) {
          .page {
            padding: 16px;
          }
          .page-header {
            flex-direction: column;
          }
          .header-actions {
            width: 100%;
          }
          .metrics-grid {
            grid-template-columns: 1fr;
          }
          .panel-heading {
            align-items: flex-start;
          }
          .toolbar {
            flex-wrap: wrap;
          }
          .search-box {
            flex-basis: 100%;
          }
          .filter-row label {
            width: 100%;
          }
          .filter-row select {
            width: 100%;
          }
          .detail-grid {
            grid-template-columns: 1fr;
          }
          .modal {
            padding: 18px;
          }
          .modal-footer .button {
            flex: 1;
          }
        }
      `}</style>
    </main>
  );
}