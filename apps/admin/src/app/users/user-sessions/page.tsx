// ModelNow Admin Users page
"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Search,
  Download,
  RefreshCw,
  Monitor,
  Smartphone,
  Tablet,
  ShieldCheck,
  Clock3,
  MapPin,
  MoreHorizontal,
  Eye,
  X,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Filter,
  XCircle,
} from "lucide-react";

type SessionStatus = "Active" | "Idle" | "Expired";
type DeviceType = "Desktop" | "Mobile" | "Tablet";

type Session = {
  id: string;
  user: string;
  email: string;
  device: DeviceType;
  browser: string;
  operatingSystem: string;
  location: string;
  ip: string;
  startedAt: string;
  lastActivity: string;
  status: SessionStatus;
  current: boolean;
};

const initialSessions: Session[] = [
  {
    id: "SES-1001",
    user: "Pujitha Marikanti",
    email: "pujitha@example.com",
    device: "Desktop",
    browser: "Chrome 156",
    operatingSystem: "Windows 11",
    location: "Hyderabad, India",
    ip: "103.82.21.14",
    startedAt: "2026-11-04T08:30:00",
    lastActivity: "2026-11-04T10:20:00",
    status: "Active",
    current: true,
  },
  {
    id: "SES-1002",
    user: "Rahul Sharma",
    email: "rahul@example.com",
    device: "Mobile",
    browser: "Chrome Mobile",
    operatingSystem: "Android 15",
    location: "Bengaluru, India",
    ip: "49.36.118.20",
    startedAt: "2026-11-04T07:45:00",
    lastActivity: "2026-11-04T10:12:00",
    status: "Active",
    current: false,
  },
  {
    id: "SES-1003",
    user: "Ananya Reddy",
    email: "ananya@example.com",
    device: "Desktop",
    browser: "Edge 139",
    operatingSystem: "Windows 11",
    location: "Hyderabad, India",
    ip: "117.192.44.10",
    startedAt: "2026-11-04T06:50:00",
    lastActivity: "2026-11-04T09:58:00",
    status: "Active",
    current: false,
  },
  {
    id: "SES-1004",
    user: "Vikram Patel",
    email: "vikram@example.com",
    device: "Tablet",
    browser: "Safari",
    operatingSystem: "iPadOS 19",
    location: "Mumbai, India",
    ip: "122.175.10.8",
    startedAt: "2026-11-04T05:10:00",
    lastActivity: "2026-11-04T07:30:00",
    status: "Idle",
    current: false,
  },
  {
    id: "SES-1005",
    user: "Sneha Rao",
    email: "sneha@example.com",
    device: "Mobile",
    browser: "Safari Mobile",
    operatingSystem: "iOS 19",
    location: "Chennai, India",
    ip: "122.175.10.9",
    startedAt: "2026-11-03T20:15:00",
    lastActivity: "2026-11-03T22:45:00",
    status: "Active",
    current: false,
  },
  {
    id: "SES-1006",
    user: "Arjun Kumar",
    email: "arjun@example.com",
    device: "Desktop",
    browser: "Firefox 141",
    operatingSystem: "Linux",
    location: "Pune, India",
    ip: "106.51.88.72",
    startedAt: "2026-11-03T13:20:00",
    lastActivity: "2026-11-03T15:40:00",
    status: "Expired",
    current: false,
  },
  {
    id: "SES-1007",
    user: "Meera Nair",
    email: "meera@example.com",
    device: "Desktop",
    browser: "Chrome 156",
    operatingSystem: "macOS",
    location: "Kochi, India",
    ip: "14.139.12.41",
    startedAt: "2026-11-03T09:10:00",
    lastActivity: "2026-11-03T11:35:00",
    status: "Idle",
    current: false,
  },
  {
    id: "SES-1008",
    user: "Sai Krishna",
    email: "sai@example.com",
    device: "Mobile",
    browser: "Chrome Mobile",
    operatingSystem: "Android 15",
    location: "Vijayawada, India",
    ip: "49.207.44.19",
    startedAt: "2026-11-02T18:00:00",
    lastActivity: "2026-11-02T19:10:00",
    status: "Expired",
    current: false,
  },
];

const statusClass: Record<SessionStatus, string> = {
  Active: "active",
  Idle: "idle",
  Expired: "expired",
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
      <div className="metric-header">
        <span>{title}</span>
        <span className={`metric-icon ${tone}`}>{icon}</span>
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-description">{description}</div>
    </div>
  );
}

export default function UserSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deviceFilter, setDeviceFilter] = useState("All");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [menuSessionId, setMenuSessionId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [confirmation, setConfirmation] = useState<Session | null>(null);
  const [notice, setNotice] = useState("");

  const activeCount = sessions.filter((session) => session.status === "Active").length;
  const idleCount = sessions.filter((session) => session.status === "Idle").length;
  const expiredCount = sessions.filter((session) => session.status === "Expired").length;

  const filteredSessions = useMemo(() => {
    const query = search.toLowerCase();

    return sessions.filter((session) => {
      const matchesSearch = [
        session.id,
        session.user,
        session.email,
        session.ip,
        session.location,
        session.browser,
      ].some((value) => value.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "All" || session.status === statusFilter;

      const matchesDevice =
        deviceFilter === "All" || session.device === deviceFilter;

      return matchesSearch && matchesStatus && matchesDevice;
    });
  }, [sessions, search, statusFilter, deviceFilter]);

  const formatDate = (value: string) =>
    new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const getDeviceIcon = (device: DeviceType) => {
    if (device === "Mobile") return <Smartphone size={19} />;
    if (device === "Tablet") return <Tablet size={19} />;
    return <Monitor size={19} />;
  };

  const terminateSession = (session: Session) => {
    if (session.current) {
      setNotice("The current session cannot be terminated from this demo screen.");
      setConfirmation(null);
      return;
    }

    setSessions((current) =>
      current.map((item) =>
        item.id === session.id ? { ...item, status: "Expired" } : item
      )
    );

    setNotice(`Session ${session.id} was terminated in the local demo.`);
    setConfirmation(null);
    setMenuSessionId(null);

    if (selectedSession?.id === session.id) {
      setSelectedSession({ ...session, status: "Expired" });
    }
  };

  const terminateOtherSessions = () => {
    const activeOthers = sessions.filter(
      (session) => !session.current && session.status !== "Expired"
    );

    setSessions((current) =>
      current.map((session) =>
        session.current ? session : { ...session, status: "Expired" }
      )
    );

    setNotice(
      `${activeOthers.length} other session(s) were terminated in the local demo.`
    );
  };

  const exportCsv = () => {
    const headers = [
      "Session ID",
      "User",
      "Email",
      "Device",
      "Browser",
      "Operating System",
      "Location",
      "IP Address",
      "Started At",
      "Last Activity",
      "Status",
      "Current Session",
    ];

    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;

    const rows = filteredSessions.map((session) =>
      [
        session.id,
        session.user,
        session.email,
        session.device,
        session.browser,
        session.operatingSystem,
        session.location,
        session.ip,
        session.startedAt,
        session.lastActivity,
        session.status,
        session.current ? "Yes" : "No",
      ]
        .map(escapeCsv)
        .join(",")
    );

    const blob = new Blob(
      [[headers.map(escapeCsv).join(","), ...rows].join("\n")],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-user-sessions.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setDeviceFilter("All");
  };

  return (
    <main className="sessions-page" onClick={() => setMenuSessionId(null)}>
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            Admin <span>/</span> Users <span>/</span> User Sessions
          </div>
          <h1>User Sessions</h1>
          <p className="subtitle">
            View active sessions, inspect device details, and manage account
            access across the platform.
          </p>
        </div>

        <div className="header-actions">
          <button className="button secondary" onClick={resetFilters}>
            <RefreshCw size={16} />
            Reset
          </button>
          <button className="button secondary" onClick={terminateOtherSessions}>
            <LogOut size={16} />
            End Other Sessions
          </button>
          <button className="button primary" onClick={exportCsv}>
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {notice && (
        <div className="notice">
          <CheckCircle2 size={17} />
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss notification">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="demo-banner">
        <AlertTriangle size={18} />
        <div>
          <strong>Demo session data</strong>
          <p>
            Session actions update this page locally only. Connect your identity
            provider or session-management API to enforce changes in production.
          </p>
        </div>
      </div>

      <section className="metrics-grid">
        <MetricCard
          title="Active Sessions"
          value={String(activeCount)}
          description="Currently marked active"
          icon={<CheckCircle2 size={19} />}
          tone="green"
        />
        <MetricCard
          title="Idle Sessions"
          value={String(idleCount)}
          description="Waiting for user activity"
          icon={<Clock3 size={19} />}
          tone="orange"
        />
        <MetricCard
          title="Expired Sessions"
          value={String(expiredCount)}
          description="No longer active"
          icon={<XCircle size={19} />}
          tone="red"
        />
        <MetricCard
          title="Total Sessions"
          value={String(sessions.length)}
          description="Sessions in this dataset"
          icon={<Activity size={19} />}
          tone="blue"
        />
      </section>

      <section className="security-callout">
        <div className="security-icon">
          <ShieldCheck size={21} />
        </div>
        <div className="security-copy">
          <h2>Session security</h2>
          <p>
            Review unfamiliar devices and locations. For production use, support
            revocation, idle timeout enforcement, and session audit events
            through your backend.
          </p>
        </div>
        <div className="security-stat">
          <span>Current session</span>
          <strong>
            {sessions.some((session) => session.current && session.status === "Active")
              ? "Protected"
              : "Not active"}
          </strong>
        </div>
      </section>

      <section className="content-card">
        <div className="section-header">
          <div>
            <h2>Session inventory</h2>
            <p>Browse and manage individual user sessions.</p>
          </div>
          <button
            className={`button secondary ${showFilters ? "filter-active" : ""}`}
            onClick={(event) => {
              event.stopPropagation();
              setShowFilters((value) => !value);
            }}
          >
            <Filter size={16} />
            Filters
          </button>
        </div>

        <div className="toolbar">
          <div className="search-field">
            <Search size={17} />
            <input
              placeholder="Search user, email, session ID, IP..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search && (
              <button onClick={() => setSearch("")} aria-label="Clear search">
                <X size={15} />
              </button>
            )}
          </div>
          <span className="result-count">
            {filteredSessions.length} sessions
          </span>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <label>
              Session status
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option>All</option>
                <option>Active</option>
                <option>Idle</option>
                <option>Expired</option>
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
            <button className="clear-button" onClick={resetFilters}>
              Clear filters
            </button>
          </div>
        )}

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>USER / SESSION</th>
                <th>DEVICE</th>
                <th>LOCATION / IP</th>
                <th>LAST ACTIVITY</th>
                <th>STATUS</th>
                <th className="right-align">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map((session) => (
                <tr key={session.id}>
                  <td>
                    <div className="user-cell">
                      <div className="avatar">
                        {session.user
                          .split(" ")
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div>
                        <div className="user-name">
                          {session.user}
                          {session.current && (
                            <span className="you-tag">YOU</span>
                          )}
                        </div>
                        <div className="muted">{session.email}</div>
                        <div className="session-id">{session.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="device-cell">
                      <span className="device-icon">
                        {getDeviceIcon(session.device)}
                      </span>
                      <div>
                        <strong>{session.device}</strong>
                        <span>{session.browser}</span>
                        <span>{session.operatingSystem}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="ip-text">{session.ip}</div>
                    <div className="muted location">
                      <MapPin size={13} />
                      {session.location}
                    </div>
                  </td>
                  <td>
                    <div className="date-text">
                      {formatDate(session.lastActivity)}
                    </div>
                    <div className="muted">
                      Started {formatDate(session.startedAt)}
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${statusClass[session.status]}`}>
                      <span className="status-dot" />
                      {session.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-wrapper">
                      <button
                        className="icon-action"
                        title="View session details"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedSession(session);
                        }}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="icon-action"
                        title="Session options"
                        onClick={(event) => {
                          event.stopPropagation();
                          setMenuSessionId((current) =>
                            current === session.id ? null : session.id
                          );
                        }}
                      >
                        <MoreHorizontal size={17} />
                      </button>
                      {menuSessionId === session.id && (
                        <div
                          className="action-menu"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <button onClick={() => setSelectedSession(session)}>
                            <Eye size={15} />
                            View details
                          </button>
                          <button
                            className="danger-menu-item"
                            disabled={
                              session.current || session.status === "Expired"
                            }
                            onClick={() => setConfirmation(session)}
                          >
                            <LogOut size={15} />
                            End session
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredSessions.length === 0 && (
            <div className="empty-state">
              <Search size={30} />
              <h3>No sessions found</h3>
              <p>Try another search term or clear the filters.</p>
              <button className="button secondary" onClick={resetFilters}>
                Clear filters
              </button>
            </div>
          )}
        </div>

        <div className="table-footer">
          <span>
            Showing {filteredSessions.length} of {sessions.length} sessions
          </span>
          <span>Session records are illustrative demo data</span>
        </div>
      </section>

      {selectedSession && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedSession(null)}
          role="presentation"
        >
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="session-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="eyebrow">SESSION INFORMATION</span>
                <h2 id="session-modal-title">Session details</h2>
                <p>{selectedSession.id}</p>
              </div>
              <button
                className="icon-action close-modal"
                onClick={() => setSelectedSession(null)}
                aria-label="Close"
              >
                <X size={19} />
              </button>
            </div>

            <div className="modal-status">
              <span
                className={`status-pill ${statusClass[selectedSession.status]}`}
              >
                <span className="status-dot" />
                {selectedSession.status}
              </span>
              {selectedSession.current && (
                <span className="current-label">Current session</span>
              )}
            </div>

            <div className="modal-section">
              <h3>User</h3>
              <Detail label="Name" value={selectedSession.user} />
              <Detail label="Email" value={selectedSession.email} />
            </div>

            <div className="modal-section">
              <h3>Device and connection</h3>
              <Detail label="Device type" value={selectedSession.device} />
              <Detail label="Browser" value={selectedSession.browser} />
              <Detail
                label="Operating system"
                value={selectedSession.operatingSystem}
              />
              <Detail label="IP address" value={selectedSession.ip} />
              <Detail label="Location" value={selectedSession.location} />
            </div>

            <div className="modal-section">
              <h3>Session timeline</h3>
              <Detail
                label="Started at"
                value={formatDate(selectedSession.startedAt)}
              />
              <Detail
                label="Last activity"
                value={formatDate(selectedSession.lastActivity)}
              />
            </div>

            <div className="modal-footer">
              {!selectedSession.current &&
                selectedSession.status !== "Expired" && (
                  <button
                    className="button danger"
                    onClick={() => setConfirmation(selectedSession)}
                  >
                    <LogOut size={15} />
                    End session
                  </button>
                )}
              <button
                className="button primary"
                onClick={() => setSelectedSession(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmation && (
        <div
          className="modal-overlay"
          onClick={() => setConfirmation(null)}
          role="presentation"
        >
          <div
            className="confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="confirm-icon">
              <LogOut size={22} />
            </div>
            <h2 id="confirm-title">End this session?</h2>
            <p>
              The session <strong>{confirmation.id}</strong> for{" "}
              <strong>{confirmation.user}</strong> will be marked as expired in
              this demo.
            </p>
            <div className="confirm-actions">
              <button
                className="button secondary"
                onClick={() => setConfirmation(null)}
              >
                Cancel
              </button>
              <button
                className="button danger"
                onClick={() => {
                  terminateSession(confirmation);
                  if (selectedSession?.id === confirmation.id) {
                    setSelectedSession(null);
                  }
                }}
              >
                <LogOut size={15} />
                End session
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .sessions-page {
          min-height: 100vh;
          padding: 28px;
          background: #f8fafc;
          color: #111827;
          font-family: Arial, Helvetica, sans-serif;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 22px;
          margin-bottom: 22px;
        }

        .breadcrumb {
          color: #6b7280;
          font-size: 12px;
          margin-bottom: 12px;
        }

        .breadcrumb span {
          margin: 0 7px;
          color: #c4c8d0;
        }

        h1 {
          margin: 0 0 8px;
          font-size: 28px;
          letter-spacing: -0.8px;
          font-weight: 750;
        }

        .subtitle {
          max-width: 690px;
          margin: 0;
          color: #6b7280;
          font-size: 13px;
          line-height: 1.6;
        }

        .header-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 8px;
          padding-top: 25px;
        }

        .button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 37px;
          padding: 9px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 650;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s;
        }

        .button.secondary {
          background: white;
          color: #374151;
        }

        .button.secondary:hover {
          background: #f3f4f6;
        }

        .button.primary {
          border-color: #315fea;
          background: #315fea;
          color: white;
        }

        .button.primary:hover {
          background: #244bd0;
        }

        .button.danger {
          border-color: #dc2626;
          background: #dc2626;
          color: white;
        }

        .button.danger:hover {
          background: #b91c1c;
        }

        .notice {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          padding: 12px 14px;
          border: 1px solid #bbf7d0;
          border-radius: 9px;
          background: #f0fdf4;
          color: #166534;
          font-size: 12px;
        }

        .notice span {
          flex: 1;
          line-height: 1.5;
        }

        .notice button {
          display: flex;
          padding: 4px;
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
        }

        .demo-banner {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          padding: 14px 16px;
          margin-bottom: 20px;
          border: 1px solid #fed7aa;
          border-radius: 10px;
          background: #fff7ed;
          color: #9a3412;
        }

        .demo-banner > svg {
          flex-shrink: 0;
          margin-top: 1px;
        }

        .demo-banner strong {
          font-size: 12px;
        }

        .demo-banner p {
          margin: 5px 0 0;
          font-size: 11px;
          line-height: 1.6;
          color: #9a5a31;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .metric-card {
          min-width: 0;
          padding: 17px;
          border: 1px solid #e5e7eb;
          border-radius: 11px;
          background: white;
        }

        .metric-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          color: #6b7280;
          font-size: 12px;
          font-weight: 600;
        }

        .metric-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 35px;
          height: 35px;
          flex-shrink: 0;
          border-radius: 9px;
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

        .blue {
          background: #eff6ff;
          color: #2563eb;
        }

        .metric-value {
          margin-top: 12px;
          font-size: 29px;
          font-weight: 750;
          letter-spacing: -0.8px;
        }

        .metric-description {
          margin-top: 5px;
          color: #9ca3af;
          font-size: 11px;
        }

        .security-callout {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 22px;
          padding: 17px 19px;
          border: 1px solid #dbeafe;
          border-radius: 11px;
          background: #eff6ff;
        }

        .security-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          border-radius: 10px;
          background: white;
          color: #2563eb;
        }

        .security-copy {
          flex: 1;
          min-width: 0;
        }

        .security-copy h2 {
          margin: 0 0 5px;
          font-size: 13px;
        }

        .security-copy p {
          margin: 0;
          color: #4b638c;
          font-size: 11px;
          line-height: 1.6;
        }

        .security-stat {
          display: flex;
          flex-direction: column;
          gap: 5px;
          padding-left: 20px;
          border-left: 1px solid #c7d7fe;
          white-space: nowrap;
        }

        .security-stat span {
          color: #64748b;
          font-size: 10px;
        }

        .security-stat strong {
          color: #166534;
          font-size: 12px;
        }

        .content-card {
          overflow: visible;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: white;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 21px 22px;
        }

        .section-header h2 {
          margin: 0 0 6px;
          font-size: 16px;
        }

        .section-header p {
          margin: 0;
          color: #6b7280;
          font-size: 12px;
        }

        .filter-active {
          background: #eff6ff !important;
          border-color: #bfdbfe !important;
          color: #1d4ed8 !important;
        }

        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 0 22px 16px;
        }

        .search-field {
          display: flex;
          align-items: center;
          gap: 9px;
          width: 100%;
          max-width: 460px;
          height: 38px;
          padding: 0 11px;
          border: 1px solid #dfe3e8;
          border-radius: 8px;
          color: #9ca3af;
        }

        .search-field:focus-within {
          border-color: #93aef9;
          box-shadow: 0 0 0 3px #315fea12;
        }

        .search-field input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: #111827;
          font-size: 12px;
        }

        .search-field button {
          display: flex;
          border: 0;
          background: transparent;
          color: #6b7280;
          cursor: pointer;
        }

        .result-count {
          color: #6b7280;
          font-size: 11px;
          white-space: nowrap;
        }

        .filters-panel {
          display: flex;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 14px;
          padding: 15px 22px;
          border-top: 1px solid #eef0f3;
          border-bottom: 1px solid #eef0f3;
          background: #f9fafb;
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
          min-width: 145px;
          height: 35px;
          padding: 0 10px;
          border: 1px solid #d1d5db;
          border-radius: 7px;
          background: white;
          color: #374151;
          font-size: 12px;
          outline: none;
        }

        .clear-button {
          height: 35px;
          padding: 0 8px;
          border: 0;
          background: transparent;
          color: #315fea;
          font-size: 12px;
          font-weight: 650;
          cursor: pointer;
        }

        .table-wrapper {
          overflow-x: auto;
          border-top: 1px solid #eef0f3;
        }

        table {
          width: 100%;
          min-width: 980px;
          border-collapse: collapse;
          text-align: left;
        }

        thead {
          background: #f9fafb;
        }

        th {
          padding: 13px 16px;
          color: #6b7280;
          font-size: 10px;
          font-weight: 750;
          letter-spacing: 0.45px;
          white-space: nowrap;
        }

        td {
          position: relative;
          padding: 15px 16px;
          border-top: 1px solid #f0f1f3;
          vertical-align: middle;
          font-size: 12px;
        }

        tbody tr:hover {
          background: #fbfcff;
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 220px;
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

        .user-name {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #111827;
          font-size: 12px;
          font-weight: 650;
          white-space: nowrap;
        }

        .you-tag {
          padding: 3px 5px;
          border-radius: 4px;
          background: #eff6ff;
          color: #2563eb;
          font-size: 8px;
          font-weight: 750;
        }

        .muted {
          display: block;
          margin-top: 5px;
          color: #9ca3af;
          font-size: 10px;
          white-space: nowrap;
        }

        .session-id {
          margin-top: 5px;
          color: #6b7280;
          font-size: 10px;
        }

        .device-cell {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          min-width: 135px;
        }

        .device-icon {
          display: flex;
          color: #6b7280;
          margin-top: 2px;
        }

        .device-cell strong {
          display: block;
          color: #374151;
          font-size: 11px;
        }

        .device-cell span:not(.device-icon) {
          display: block;
          margin-top: 5px;
          color: #9ca3af;
          font-size: 10px;
          white-space: nowrap;
        }

        .ip-text,
        .date-text {
          color: #374151;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
        }

        .location {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 9px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
        }

        .status-pill.active {
          background: #ecfdf5;
          color: #047857;
        }

        .status-pill.idle {
          background: #fff7ed;
          color: #c2410c;
        }

        .status-pill.expired {
          background: #f3f4f6;
          color: #6b7280;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .right-align {
          text-align: right;
        }

        .action-wrapper {
          position: relative;
          display: flex;
          justify-content: flex-end;
          gap: 5px;
        }

        .icon-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 31px;
          height: 31px;
          border: 1px solid transparent;
          border-radius: 7px;
          background: transparent;
          color: #6b7280;
          cursor: pointer;
        }

        .icon-action:hover {
          border-color: #e5e7eb;
          background: #f9fafb;
          color: #315fea;
        }

        .action-menu {
          position: absolute;
          top: 34px;
          right: 0;
          z-index: 20;
          width: 165px;
          padding: 5px;
          border: 1px solid #e5e7eb;
          border-radius: 9px;
          background: white;
          box-shadow: 0 12px 28px #00000014;
        }

        .action-menu button {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 9px;
          border: 0;
          border-radius: 6px;
          background: white;
          color: #374151;
          text-align: left;
          font-size: 11px;
          cursor: pointer;
        }

        .action-menu button:hover:not(:disabled) {
          background: #f3f4f6;
        }

        .action-menu button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .action-menu .danger-menu-item {
          color: #dc2626;
        }

        .table-footer {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 15px 22px;
          border-top: 1px solid #eef0f3;
          color: #6b7280;
          font-size: 11px;
        }

        .empty-state {
          padding: 52px 20px;
          text-align: center;
          color: #9ca3af;
        }

        .empty-state svg {
          margin-bottom: 12px;
        }

        .empty-state h3 {
          margin: 0 0 7px;
          color: #374151;
          font-size: 15px;
        }

        .empty-state p {
          margin: 0 0 17px;
          font-size: 12px;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: #0f172a80;
        }

        .modal {
          width: 100%;
          max-width: 510px;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 14px;
          background: white;
          box-shadow: 0 25px 80px #0002;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding: 22px 23px 17px;
          border-bottom: 1px solid #eef0f3;
        }

        .eyebrow {
          display: block;
          margin-bottom: 7px;
          color: #315fea;
          font-size: 10px;
          font-weight: 750;
          letter-spacing: 0.8px;
        }

        .modal-header h2 {
          margin: 0 0 6px;
          font-size: 20px;
        }

        .modal-header p {
          margin: 0;
          color: #9ca3af;
          font-size: 11px;
        }

        .close-modal {
          border-color: #eef0f3;
          flex-shrink: 0;
        }

        .modal-status {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 14px 23px;
          background: #fafafa;
        }

        .current-label {
          padding: 5px 8px;
          border-radius: 5px;
          background: #eff6ff;
          color: #2563eb;
          font-size: 10px;
          font-weight: 650;
        }

        .modal-section {
          padding: 17px 23px;
          border-bottom: 1px solid #eef0f3;
        }

        .modal-section h3 {
          margin: 0 0 11px;
          color: #6b7280;
          font-size: 11px;
          font-weight: 750;
          letter-spacing: 0.4px;
          text-transform: uppercase;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding: 7px 0;
          font-size: 12px;
        }

        .detail-row span {
          color: #6b7280;
        }

        .detail-row strong {
          color: #111827;
          font-weight: 650;
          text-align: right;
          overflow-wrap: anywhere;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          padding: 17px 23px 22px;
        }

        .confirm-modal {
          width: 100%;
          max-width: 400px;
          padding: 25px;
          border-radius: 14px;
          background: white;
          box-shadow: 0 25px 80px #0002;
        }

        .confirm-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          margin-bottom: 16px;
          border-radius: 12px;
          background: #fef2f2;
          color: #dc2626;
        }

        .confirm-modal h2 {
          margin: 0 0 9px;
          font-size: 19px;
        }

        .confirm-modal p {
          margin: 0;
          color: #6b7280;
          font-size: 12px;
          line-height: 1.7;
        }

        .confirm-modal p strong {
          color: #374151;
        }

        .confirm-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          margin-top: 23px;
        }

        @media (max-width: 1100px) {
          .metrics-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .header-actions {
            max-width: 390px;
          }
        }

        @media (max-width: 760px) {
          .sessions-page {
            padding: 18px 12px;
          }

          .page-header {
            flex-direction: column;
          }

          .header-actions {
            max-width: none;
            justify-content: flex-start;
            padding-top: 0;
          }

          .security-callout {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .security-stat {
            width: 100%;
            padding: 12px 0 0;
            border-top: 1px solid #c7d7fe;
            border-left: 0;
          }

          .section-header,
          .toolbar {
            padding-left: 14px;
            padding-right: 14px;
          }

          .table-footer {
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .metrics-grid {
            gap: 9px;
          }

          .metric-card {
            padding: 12px;
          }

          .metric-header {
            font-size: 11px;
          }

          .metric-value {
            font-size: 25px;
          }

          .header-actions .button {
            padding: 8px 9px;
            font-size: 11px;
          }

          .detail-row {
            align-items: flex-start;
          }
        }
      `}</style>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}