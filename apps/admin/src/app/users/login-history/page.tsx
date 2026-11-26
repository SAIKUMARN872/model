// ModelNow Admin Users page
"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  Search,
  Download,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Clock3,
  MapPin,
  Monitor,
  Smartphone,
  Eye,
  X,
  Filter,
  LogIn,
  CalendarDays,
} from "lucide-react";

type LoginStatus = "Successful" | "Failed" | "Blocked";
type DeviceType = "Desktop" | "Mobile" | "Tablet";

type LoginRecord = {
  id: string;
  user: string;
  email: string;
  ip: string;
  location: string;
  device: DeviceType;
  browser: string;
  operatingSystem: string;
  time: string;
  status: LoginStatus;
  method: string;
  reason: string;
};

const initialRecords: LoginRecord[] = [
  {
    id: "LOG-9001",
    user: "Pujitha Marikanti",
    email: "pujitha@example.com",
    ip: "103.82.21.14",
    location: "Hyderabad, India",
    device: "Desktop",
    browser: "Chrome 156",
    operatingSystem: "Windows 11",
    time: "2026-11-04T09:42:00",
    status: "Successful",
    method: "Email and password",
    reason: "Authentication completed successfully.",
  },
  {
    id: "LOG-9002",
    user: "Rahul Sharma",
    email: "rahul@example.com",
    ip: "49.36.118.20",
    location: "Bengaluru, India",
    device: "Mobile",
    browser: "Chrome Mobile",
    operatingSystem: "Android 15",
    time: "2026-11-04T09:35:00",
    status: "Failed",
    method: "Email and password",
    reason: "Incorrect password entered.",
  },
  {
    id: "LOG-9003",
    user: "Ananya Reddy",
    email: "ananya@example.com",
    ip: "117.192.44.10",
    location: "Hyderabad, India",
    device: "Desktop",
    browser: "Edge 139",
    operatingSystem: "Windows 11",
    time: "2026-11-04T09:18:00",
    status: "Successful",
    method: "Google SSO",
    reason: "Single sign-on authentication completed.",
  },
  {
    id: "LOG-9004",
    user: "Vikram Patel",
    email: "vikram@example.com",
    ip: "185.220.101.42",
    location: "Unknown",
    device: "Desktop",
    browser: "Firefox 141",
    operatingSystem: "Linux",
    time: "2026-11-04T08:56:00",
    status: "Blocked",
    method: "Email and password",
    reason: "Login blocked by the configured security policy.",
  },
  {
    id: "LOG-9005",
    user: "Sneha Rao",
    email: "sneha@example.com",
    ip: "122.175.10.8",
    location: "Chennai, India",
    device: "Mobile",
    browser: "Safari Mobile",
    operatingSystem: "iOS 19",
    time: "2026-11-04T08:40:00",
    status: "Successful",
    method: "Email and password",
    reason: "Authentication completed successfully.",
  },
  {
    id: "LOG-9006",
    user: "Arjun Kumar",
    email: "arjun@example.com",
    ip: "106.51.88.72",
    location: "Bengaluru, India",
    device: "Tablet",
    browser: "Safari",
    operatingSystem: "iPadOS 19",
    time: "2026-11-04T08:15:00",
    status: "Failed",
    method: "Email and password",
    reason: "Account credentials could not be verified.",
  },
  {
    id: "LOG-9007",
    user: "Meera Nair",
    email: "meera@example.com",
    ip: "14.139.12.41",
    location: "Kochi, India",
    device: "Desktop",
    browser: "Chrome 156",
    operatingSystem: "macOS",
    time: "2026-11-03T22:30:00",
    status: "Successful",
    method: "Google SSO",
    reason: "Single sign-on authentication completed.",
  },
  {
    id: "LOG-9008",
    user: "Kiran Reddy",
    email: "kiran@example.com",
    ip: "45.83.64.91",
    location: "Unknown",
    device: "Mobile",
    browser: "Chrome Mobile",
    operatingSystem: "Android 14",
    time: "2026-11-03T21:48:00",
    status: "Blocked",
    method: "Email and password",
    reason: "Suspicious login attempt requires additional verification.",
  },
  {
    id: "LOG-9009",
    user: "Divya Singh",
    email: "divya@example.com",
    ip: "103.91.20.15",
    location: "Pune, India",
    device: "Desktop",
    browser: "Edge 139",
    operatingSystem: "Windows 11",
    time: "2026-11-03T18:20:00",
    status: "Successful",
    method: "Email and password",
    reason: "Authentication completed successfully.",
  },
  {
    id: "LOG-9010",
    user: "Sai Krishna",
    email: "sai@example.com",
    ip: "49.207.44.19",
    location: "Vijayawada, India",
    device: "Mobile",
    browser: "Chrome Mobile",
    operatingSystem: "Android 15",
    time: "2026-11-03T17:05:00",
    status: "Failed",
    method: "Email and password",
    reason: "Multiple unsuccessful authentication attempts.",
  },
];

const statusStyles: Record<LoginStatus, string> = {
  Successful: "success",
  Failed: "failed",
  Blocked: "blocked",
};

function MetricCard({
  title,
  value,
  description,
  icon,
  tone,
}: {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
  tone: string;
}) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <span>{title}</span>
        <span className={`metric-icon ${tone}`}>{icon}</span>
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-description">{description}</div>
    </div>
  );
}

export default function LoginHistoryPage() {
  const [records, setRecords] = useState<LoginRecord[]>(initialRecords);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deviceFilter, setDeviceFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [selected, setSelected] = useState<LoginRecord | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredRecords = useMemo(() => {
    const now = new Date("2026-11-04T23:59:59");

    return records.filter((record) => {
      const query = search.toLowerCase();

      const matchesSearch = [
        record.id,
        record.user,
        record.email,
        record.ip,
        record.location,
      ].some((value) => value.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "All" || record.status === statusFilter;

      const matchesDevice =
        deviceFilter === "All" || record.device === deviceFilter;

      const loginDate = new Date(record.time);
      let matchesDate = true;

      if (dateFilter === "Today") {
        matchesDate = loginDate.toDateString() === now.toDateString();
      } else if (dateFilter === "Last 7 days") {
        const start = new Date(now);
        start.setDate(start.getDate() - 7);
        matchesDate = loginDate >= start && loginDate <= now;
      } else if (dateFilter === "Last 30 days") {
        const start = new Date(now);
        start.setDate(start.getDate() - 30);
        matchesDate = loginDate >= start && loginDate <= now;
      }

      return matchesSearch && matchesStatus && matchesDevice && matchesDate;
    });
  }, [records, search, statusFilter, deviceFilter, dateFilter]);

  const successfulCount = records.filter(
    (record) => record.status === "Successful"
  ).length;

  const failedCount = records.filter(
    (record) => record.status === "Failed"
  ).length;

  const blockedCount = records.filter(
    (record) => record.status === "Blocked"
  ).length;

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setDeviceFilter("All");
    setDateFilter("All");
  };

  const exportCsv = () => {
    const headers = [
      "Login ID",
      "User",
      "Email",
      "IP Address",
      "Location",
      "Device",
      "Browser",
      "Operating System",
      "Time",
      "Status",
      "Method",
      "Reason",
    ];

    const escapeCsv = (value: string) =>
      `"${value.replace(/"/g, '""')}"`;

    const rows = filteredRecords.map((record) =>
      [
        record.id,
        record.user,
        record.email,
        record.ip,
        record.location,
        record.device,
        record.browser,
        record.operatingSystem,
        record.time,
        record.status,
        record.method,
        record.reason,
      ]
        .map(escapeCsv)
        .join(",")
    );

    const csv = [headers.map(escapeCsv).join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "modelnow-login-history.csv";
    anchor.click();

    URL.revokeObjectURL(url);
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const DeviceIcon = ({ device }: { device: DeviceType }) => {
    if (device === "Mobile") return <Smartphone size={17} />;
    if (device === "Tablet") return <Monitor size={17} />;
    return <Monitor size={17} />;
  };

  return (
    <main className="login-page">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            Admin <span>/</span> Users <span>/</span> Login History
          </div>
          <h1>Login History</h1>
          <p className="page-subtitle">
            Monitor authentication events, login failures, and security-related
            access attempts across ModelNow.
          </p>
        </div>

        <div className="header-actions">
          <button className="button secondary" onClick={resetFilters}>
            <RefreshCw size={16} />
            Reset
          </button>
          <button className="button primary" onClick={exportCsv}>
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="notice">
        <ShieldAlert size={18} />
        <div>
          <strong>Authentication audit trail</strong>
          <p>
            This page currently uses sample data for UI development. Connect
            your authentication and audit-log APIs before using it for security
            investigations.
          </p>
        </div>
      </div>

      <section className="metrics-grid">
        <MetricCard
          title="Total Login Events"
          value={String(records.length)}
          description="Events in this sample dataset"
          icon={<Activity size={19} />}
          tone="blue"
        />
        <MetricCard
          title="Successful Logins"
          value={String(successfulCount)}
          description="Authenticated successfully"
          icon={<CheckCircle2 size={19} />}
          tone="green"
        />
        <MetricCard
          title="Failed Attempts"
          value={String(failedCount)}
          description="Authentication unsuccessful"
          icon={<XCircle size={19} />}
          tone="orange"
        />
        <MetricCard
          title="Blocked Attempts"
          value={String(blockedCount)}
          description="Stopped by security controls"
          icon={<ShieldAlert size={19} />}
          tone="red"
        />
      </section>

      <section className="content-card">
        <div className="table-heading">
          <div>
            <h2>Authentication events</h2>
            <p>Review recent sign-ins and investigate unusual activity.</p>
          </div>
          <button
            className={`button secondary filter-button ${
              showFilters ? "active" : ""
            }`}
            onClick={() => setShowFilters((current) => !current)}
          >
            <Filter size={16} />
            Filters
          </button>
        </div>

        <div className="toolbar">
          <div className="search-box">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search user, email, IP address, login ID..."
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
          <span className="result-count">
            {filteredRecords.length} events
          </span>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <label>
              Login status
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option>All</option>
                <option>Successful</option>
                <option>Failed</option>
                <option>Blocked</option>
              </select>
            </label>

            <label>
              Device type
              <select
                value={deviceFilter}
                onChange={(event) => setDeviceFilter(event.target.value)}
              >
                <option>All</option>
                <option>Desktop</option>
                <option>Mobile</option>
                <option>Tablet</option>
              </select>
            </label>

            <label>
              Date range
              <select
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
              >
                <option>All</option>
                <option>Today</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
              </select>
            </label>

            <button className="clear-filters" onClick={resetFilters}>
              Clear all
            </button>
          </div>
        )}

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>USER</th>
                <th>IP ADDRESS / LOCATION</th>
                <th>DEVICE</th>
                <th>LOGIN TIME</th>
                <th>STATUS</th>
                <th className="action-column">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id}>
                  <td>
                    <div className="user-cell">
                      <div className="avatar">
                        {record.user
                          .split(" ")
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className="user-name">{record.user}</div>
                        <div className="muted">{record.email}</div>
                        <div className="record-id">{record.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="primary-text">{record.ip}</div>
                    <div className="muted location-text">
                      <MapPin size={13} />
                      {record.location}
                    </div>
                  </td>
                  <td>
                    <div className="device-cell">
                      <DeviceIcon device={record.device} />
                      <div>
                        <div className="primary-text">{record.device}</div>
                        <div className="muted">{record.browser}</div>
                        <div className="muted">{record.operatingSystem}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="primary-text">{formatDate(record.time)}</div>
                    <div className="muted">Local time</div>
                  </td>
                  <td>
                    <span className={`status-pill ${statusStyles[record.status]}`}>
                      <span className="status-dot" />
                      {record.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="view-button"
                      onClick={() => setSelected(record)}
                    >
                      <Eye size={15} />
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRecords.length === 0 && (
            <div className="empty-state">
              <Search size={30} />
              <h3>No login events found</h3>
              <p>Try changing your search term or filters.</p>
              <button className="button secondary" onClick={resetFilters}>
                Clear filters
              </button>
            </div>
          )}
        </div>

        <div className="table-footer">
          <span>
            Showing {filteredRecords.length} of {records.length} login events
          </span>
          <span className="footer-note">
            <Clock3 size={14} />
            Sample audit data
          </span>
        </div>
      </section>

      <section className="security-section">
        <div className="section-title">
          <div className="section-title-icon">
            <ShieldAlert size={19} />
          </div>
          <div>
            <h2>Security monitoring</h2>
            <p>Summary of login events requiring attention.</p>
          </div>
        </div>

        <div className="security-grid">
          <div className="security-item">
            <div className="security-item-icon orange">
              <XCircle size={18} />
            </div>
            <div>
              <strong>Failed authentication</strong>
              <p>{failedCount} failed login events in the sample dataset.</p>
            </div>
          </div>
          <div className="security-item">
            <div className="security-item-icon red">
              <ShieldAlert size={18} />
            </div>
            <div>
              <strong>Blocked login attempts</strong>
              <p>{blockedCount} events were marked as blocked.</p>
            </div>
          </div>
          <div className="security-item">
            <div className="security-item-icon blue">
              <MapPin size={18} />
            </div>
            <div>
              <strong>Unknown locations</strong>
              <p>
                {records.filter((record) => record.location === "Unknown").length}{" "}
                events have no recognized location.
              </p>
            </div>
          </div>
        </div>
      </section>

      {selected && (
        <div
          className="modal-backdrop"
          onClick={() => setSelected(null)}
          role="presentation"
        >
          <div
            className="details-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="details-title"
          >
            <div className="modal-header">
              <div>
                <span className="modal-eyebrow">AUTHENTICATION AUDIT</span>
                <h2 id="details-title">Login event details</h2>
                <p>{selected.id}</p>
              </div>
              <button
                className="icon-button close-button"
                onClick={() => setSelected(null)}
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-status-row">
              <span className={`status-pill ${statusStyles[selected.status]}`}>
                <span className="status-dot" />
                {selected.status}
              </span>
              <span className="modal-time">
                <CalendarDays size={14} />
                {formatDate(selected.time)}
              </span>
            </div>

            <div className="detail-group">
              <h3>User information</h3>
              <div className="detail-row">
                <span>Full name</span>
                <strong>{selected.user}</strong>
              </div>
              <div className="detail-row">
                <span>Email address</span>
                <strong>{selected.email}</strong>
              </div>
            </div>

            <div className="detail-group">
              <h3>Connection details</h3>
              <div className="detail-row">
                <span>IP address</span>
                <strong>{selected.ip}</strong>
              </div>
              <div className="detail-row">
                <span>Location</span>
                <strong>{selected.location}</strong>
              </div>
              <div className="detail-row">
                <span>Device</span>
                <strong>{selected.device}</strong>
              </div>
              <div className="detail-row">
                <span>Browser</span>
                <strong>{selected.browser}</strong>
              </div>
              <div className="detail-row">
                <span>Operating system</span>
                <strong>{selected.operatingSystem}</strong>
              </div>
              <div className="detail-row">
                <span>Authentication method</span>
                <strong>{selected.method}</strong>
              </div>
            </div>

            <div className="reason-box">
              <ShieldAlert size={17} />
              <div>
                <strong>Event description</strong>
                <p>{selected.reason}</p>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="button primary"
                onClick={() => setSelected(null)}
              >
                Close details
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .login-page {
          --border: #e5e7eb;
          --muted: #6b7280;
          --text: #111827;
          color: var(--text);
          padding: 28px;
          background: #f8fafc;
          min-height: 100vh;
          font-family: Arial, Helvetica, sans-serif;
        }

        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .breadcrumb {
          color: #6b7280;
          font-size: 12px;
          margin-bottom: 12px;
        }

        .breadcrumb span {
          padding: 0 7px;
          color: #c0c4cc;
        }

        h1 {
          font-size: 28px;
          font-weight: 750;
          letter-spacing: -0.8px;
          margin: 0 0 8px;
        }

        .page-subtitle {
          color: #6b7280;
          font-size: 14px;
          line-height: 1.6;
          margin: 0;
          max-width: 680px;
        }

        .header-actions {
          display: flex;
          gap: 9px;
          flex-shrink: 0;
          padding-top: 26px;
        }

        .button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 650;
          cursor: pointer;
          transition: background 0.15s;
        }

        .button.secondary {
          background: white;
          color: #374151;
        }

        .button.secondary:hover,
        .filter-button.active {
          background: #f3f4f6;
        }

        .button.primary {
          background: #315fea;
          color: white;
          border-color: #315fea;
        }

        .button.primary:hover {
          background: #244bd0;
        }

        .notice {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          border: 1px solid #c7d7fe;
          border-radius: 10px;
          padding: 14px 16px;
          background: #eff6ff;
          color: #1e40af;
          margin-bottom: 20px;
        }

        .notice > svg {
          flex-shrink: 0;
          margin-top: 1px;
        }

        .notice strong {
          font-size: 13px;
        }

        .notice p {
          margin: 5px 0 0;
          font-size: 12px;
          line-height: 1.6;
          color: #3b5b9e;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }

        .metric-card {
          border: 1px solid var(--border);
          border-radius: 12px;
          background: white;
          padding: 18px;
          min-width: 0;
        }

        .metric-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          color: #6b7280;
          font-size: 12px;
          font-weight: 600;
        }

        .metric-icon {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .blue {
          background: #eff6ff;
          color: #2563eb;
        }

        .green {
          background: #ecfdf5;
          color: #059669;
        }

        .orange {
          background: #fff7ed;
          color: #ea580c;
        }

        .red {
          background: #fef2f2;
          color: #dc2626;
        }

        .metric-value {
          font-size: 30px;
          font-weight: 750;
          letter-spacing: -1px;
          margin-top: 13px;
        }

        .metric-description {
          font-size: 11px;
          color: #9ca3af;
          margin-top: 5px;
        }

        .content-card {
          background: white;
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }

        .table-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 21px 22px;
        }

        h2 {
          font-size: 16px;
          font-weight: 750;
          margin: 0 0 6px;
        }

        .table-heading p,
        .section-title p {
          margin: 0;
          color: #6b7280;
          font-size: 12px;
          line-height: 1.5;
        }

        .toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 0 22px 16px;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 9px;
          max-width: 490px;
          width: 100%;
          border: 1px solid #dfe3e8;
          border-radius: 8px;
          padding: 0 11px;
          height: 39px;
          color: #9ca3af;
        }

        .search-box:focus-within {
          border-color: #8aa7fa;
          box-shadow: 0 0 0 3px #315fea12;
        }

        .search-box input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          font-size: 12px;
          color: #111827;
        }

        .result-count {
          white-space: nowrap;
          color: #6b7280;
          font-size: 12px;
        }

        .icon-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: 6px;
          background: transparent;
          color: #6b7280;
          cursor: pointer;
          padding: 5px;
        }

        .icon-button:hover {
          background: #f3f4f6;
          color: #111827;
        }

        .filters-panel {
          display: flex;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 14px;
          padding: 16px 22px;
          background: #f9fafb;
          border-top: 1px solid #eef0f3;
          border-bottom: 1px solid #eef0f3;
        }

        .filters-panel label {
          display: flex;
          flex-direction: column;
          gap: 7px;
          color: #6b7280;
          font-size: 11px;
          font-weight: 650;
        }

        .filters-panel select {
          min-width: 150px;
          height: 36px;
          border: 1px solid #d1d5db;
          border-radius: 7px;
          background: white;
          padding: 0 10px;
          font-size: 12px;
          color: #374151;
          outline: none;
        }

        .clear-filters {
          height: 36px;
          border: 0;
          background: transparent;
          color: #315fea;
          font-size: 12px;
          font-weight: 650;
          cursor: pointer;
        }

        .table-scroll {
          overflow-x: auto;
          border-top: 1px solid #eef0f3;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          min-width: 900px;
        }

        thead {
          background: #f9fafb;
        }

        th {
          padding: 13px 18px;
          color: #6b7280;
          font-size: 10px;
          font-weight: 750;
          letter-spacing: 0.55px;
          white-space: nowrap;
        }

        td {
          padding: 15px 18px;
          border-top: 1px solid #f0f1f3;
          vertical-align: middle;
          font-size: 12px;
        }

        tbody tr:hover {
          background: #fbfcfe;
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 200px;
        }

        .avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 37px;
          height: 37px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #eef2ff;
          color: #4338ca;
          font-size: 11px;
          font-weight: 750;
        }

        .user-name,
        .primary-text {
          font-size: 12px;
          color: #111827;
          font-weight: 650;
          white-space: nowrap;
        }

        .muted {
          display: block;
          color: #9ca3af;
          font-size: 11px;
          margin-top: 5px;
          white-space: nowrap;
        }

        .record-id {
          margin-top: 5px;
          color: #6b7280;
          font-size: 10px;
        }

        .location-text {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .device-cell {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          color: #6b7280;
        }

        .device-cell > svg {
          margin-top: 2px;
          flex-shrink: 0;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border-radius: 20px;
          padding: 6px 9px;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
        }

        .status-pill.success {
          background: #ecfdf5;
          color: #047857;
        }

        .status-pill.failed {
          background: #fff7ed;
          color: #c2410c;
        }

        .status-pill.blocked {
          background: #fef2f2;
          color: #b91c1c;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .action-column {
          text-align: right;
        }

        .view-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border: 1px solid #e5e7eb;
          background: white;
          border-radius: 7px;
          padding: 7px 9px;
          color: #4b5563;
          font-size: 11px;
          font-weight: 650;
          cursor: pointer;
          white-space: nowrap;
        }

        .view-button:hover {
          border-color: #b8c9fb;
          color: #315fea;
          background: #f8faff;
        }

        .table-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 15px 22px;
          border-top: 1px solid #eef0f3;
          color: #6b7280;
          font-size: 11px;
        }

        .footer-note {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .empty-state {
          padding: 55px 20px;
          text-align: center;
          color: #9ca3af;
        }

        .empty-state svg {
          margin-bottom: 12px;
        }

        .empty-state h3 {
          color: #374151;
          font-size: 15px;
          margin: 0 0 7px;
        }

        .empty-state p {
          font-size: 12px;
          margin: 0 0 18px;
        }

        .security-section {
          margin-top: 24px;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 21px;
          background: white;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 20px;
        }

        .section-title-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 39px;
          height: 39px;
          border-radius: 9px;
          background: #fff7ed;
          color: #ea580c;
        }

        .security-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .security-item {
          display: flex;
          gap: 11px;
          padding: 15px;
          border: 1px solid #eef0f3;
          border-radius: 9px;
          min-width: 0;
        }

        .security-item-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          border-radius: 8px;
        }

        .security-item strong {
          font-size: 12px;
          line-height: 1.5;
        }

        .security-item p {
          color: #6b7280;
          font-size: 11px;
          line-height: 1.6;
          margin: 5px 0 0;
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(15, 23, 42, 0.48);
        }

        .details-modal {
          width: 100%;
          max-width: 540px;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 14px;
          background: white;
          box-shadow: 0 24px 80px #0002;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 23px 24px 18px;
          border-bottom: 1px solid #eef0f3;
        }

        .modal-eyebrow {
          display: block;
          color: #315fea;
          font-size: 10px;
          font-weight: 750;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }

        .modal-header h2 {
          font-size: 20px;
          margin: 0 0 6px;
        }

        .modal-header p {
          color: #9ca3af;
          font-size: 11px;
          margin: 0;
        }

        .close-button {
          border: 1px solid #eef0f3;
          padding: 7px;
        }

        .modal-status-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
          padding: 17px 24px;
          background: #fafafa;
        }

        .modal-time {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #6b7280;
          font-size: 11px;
        }

        .detail-group {
          padding: 18px 24px;
          border-bottom: 1px solid #eef0f3;
        }

        .detail-group h3 {
          font-size: 12px;
          color: #6b7280;
          margin: 0 0 14px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding: 8px 0;
          font-size: 12px;
        }

        .detail-row span {
          color: #6b7280;
        }

        .detail-row strong {
          color: #111827;
          text-align: right;
          font-weight: 650;
          overflow-wrap: anywhere;
        }

        .reason-box {
          display: flex;
          gap: 10px;
          margin: 18px 24px;
          padding: 13px;
          border: 1px solid #e5e7eb;
          border-radius: 9px;
          color: #6b7280;
          background: #f9fafb;
        }

        .reason-box > svg {
          flex-shrink: 0;
          margin-top: 1px;
        }

        .reason-box strong {
          color: #374151;
          font-size: 12px;
        }

        .reason-box p {
          margin: 5px 0 0;
          font-size: 11px;
          line-height: 1.6;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          padding: 0 24px 22px;
        }

        @media (max-width: 1050px) {
          .metrics-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .security-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .login-page {
            padding: 18px 12px;
          }

          .page-header {
            flex-direction: column;
          }

          .header-actions {
            padding-top: 0;
          }

          h1 {
            font-size: 24px;
          }

          .metrics-grid {
            gap: 10px;
          }

          .metric-card {
            padding: 13px;
          }

          .metric-value {
            font-size: 25px;
          }

          .table-heading,
          .toolbar {
            padding-left: 14px;
            padding-right: 14px;
          }

          .table-footer {
            padding: 14px;
            align-items: flex-start;
            flex-direction: column;
          }

          .security-section {
            padding: 15px;
          }

          .detail-row {
            align-items: flex-start;
          }
        }
      `}</style>
    </main>
  );
}