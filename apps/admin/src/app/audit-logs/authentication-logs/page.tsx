
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ShieldCheck,
  LogIn,
  LogOut,
  Search,
  RefreshCw,
  Download,
  Eye,
  X,
  CheckCircle2,
  XCircle,
  Clock3,
  Filter,
  Fingerprint,
  Monitor,
  MapPin,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type AuthEvent = {
  id: string;
  user: string;
  email: string;
  event: string;
  method: string;
  ip: string;
  location: string;
  device: string;
  timestamp: string;
  status: "Success" | "Failed" | "Pending";
  details: string;
};

const INITIAL_EVENTS: AuthEvent[] = [
  {
    id: "AUTH-1001",
    user: "Pujitha Marikanti",
    email: "pujitha@modelnow.ai",
    event: "Login",
    method: "Email and password",
    ip: "192.168.1.10",
    location: "Hyderabad, India",
    device: "Chrome · Windows",
    timestamp: "2026-11-04 09:45:12",
    status: "Success",
    details: "The demonstration login event completed successfully.",
  },
  {
    id: "AUTH-1002",
    user: "Sai Kumar",
    email: "sai@modelnow.ai",
    event: "Login",
    method: "Google OAuth",
    ip: "192.168.1.15",
    location: "Hyderabad, India",
    device: "Chrome · Windows",
    timestamp: "2026-11-04 09:30:44",
    status: "Success",
    details: "The demonstration single sign-on event completed successfully.",
  },
  {
    id: "AUTH-1003",
    user: "Unknown user",
    email: "unknown@example.com",
    event: "Login",
    method: "Email and password",
    ip: "203.0.113.42",
    location: "Unknown",
    device: "Firefox · Linux",
    timestamp: "2026-11-04 09:21:05",
    status: "Failed",
    details: "The demonstration login attempt was rejected.",
  },
  {
    id: "AUTH-1004",
    user: "Operations Team",
    email: "operations@modelnow.ai",
    event: "Logout",
    method: "Session logout",
    ip: "192.168.1.20",
    location: "Hyderabad, India",
    device: "Edge · Windows",
    timestamp: "2026-11-04 09:02:30",
    status: "Success",
    details: "The demonstration user session was closed.",
  },
  {
    id: "AUTH-1005",
    user: "Security Admin",
    email: "security@modelnow.ai",
    event: "MFA Verification",
    method: "Authenticator app",
    ip: "10.0.0.30",
    location: "Bengaluru, India",
    device: "Chrome · macOS",
    timestamp: "2026-11-04 08:55:17",
    status: "Success",
    details: "The demonstration multi-factor verification succeeded.",
  },
  {
    id: "AUTH-1006",
    user: "Test Account",
    email: "test@modelnow.ai",
    event: "Password Reset",
    method: "Email verification",
    ip: "192.168.1.30",
    location: "Hyderabad, India",
    device: "Chrome · Android",
    timestamp: "2026-11-04 08:42:03",
    status: "Pending",
    details: "The demonstration password-reset request is awaiting verification.",
  },
  {
    id: "AUTH-1007",
    user: "Sai Kumar",
    email: "sai@modelnow.ai",
    event: "MFA Verification",
    method: "Authenticator app",
    ip: "192.168.1.15",
    location: "Hyderabad, India",
    device: "Chrome · Windows",
    timestamp: "2026-11-03 17:35:10",
    status: "Failed",
    details: "The demonstration multi-factor verification failed.",
  },
  {
    id: "AUTH-1008",
    user: "Pujitha Marikanti",
    email: "pujitha@modelnow.ai",
    event: "Logout",
    method: "Session logout",
    ip: "192.168.1.10",
    location: "Hyderabad, India",
    device: "Chrome · Windows",
    timestamp: "2026-11-03 16:20:00",
    status: "Success",
    details: "The demonstration user session was closed.",
  },
];

const statusColors: Record<AuthEvent["status"], string> = {
  Success: "#15803d",
  Failed: "#dc2626",
  Pending: "#b45309",
};

export default function AuthenticationLogsPage() {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("All Events");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [selected, setSelected] = useState<AuthEvent | null>(null);
  const [notice, setNotice] = useState("");

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return events.filter((event) => {
      const matchesSearch =
        !query ||
        [
          event.id,
          event.user,
          event.email,
          event.event,
          event.method,
          event.ip,
          event.device,
        ].some((value) => value.toLowerCase().includes(query));

      const matchesEvent =
        eventFilter === "All Events" || event.event === eventFilter;

      const matchesStatus =
        statusFilter === "All Statuses" || event.status === statusFilter;

      return matchesSearch && matchesEvent && matchesStatus;
    });
  }, [events, search, eventFilter, statusFilter]);

  const successful = events.filter((event) => event.status === "Success").length;
  const failed = events.filter((event) => event.status === "Failed").length;
  const pending = events.filter((event) => event.status === "Pending").length;

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2500);
  }

  function refreshEvents() {
    setEvents([...INITIAL_EVENTS]);
    setSearch("");
    setEventFilter("All Events");
    setStatusFilter("All Statuses");
    showNotice("Demonstration authentication logs refreshed.");
  }

  function exportEvents(format: "csv" | "json") {
    const rows = filteredEvents.map((event) => ({
      eventId: event.id,
      user: event.user,
      email: event.email,
      event: event.event,
      method: event.method,
      ipAddress: event.ip,
      location: event.location,
      device: event.device,
      timestamp: event.timestamp,
      status: event.status,
      details: event.details,
    }));

    const content =
      format === "json"
        ? JSON.stringify(rows, null, 2)
        : [
            [
              "Event ID",
              "User",
              "Email",
              "Event",
              "Method",
              "IP Address",
              "Location",
              "Device",
              "Timestamp",
              "Status",
              "Details",
            ],
            ...rows.map((row) => Object.values(row)),
          ]
            .map((row) =>
              row
                .map((value) => `"${String(value).replace(/"/g, '""')}"`)
                .join(",")
            )
            .join("\n");

    const blob = new Blob([content], {
      type: format === "json" ? "application/json" : "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `modelnow-authentication-logs.${format}`;
    anchor.click();
    URL.revokeObjectURL(url);
    showNotice(`Authentication logs exported as ${format.toUpperCase()}.`);
  }

  return (
    <main className="auth-page">
      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          padding: 30px;
          background: #f7f8fc;
          color: #172033;
          font-family: Arial, Helvetica, sans-serif;
        }
        * {
          box-sizing: border-box;
        }
        .breadcrumb {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
          color: #7b8599;
          font-size: 13px;
        }
        .breadcrumb a {
          color: #5267d9;
          text-decoration: none;
        }
        .heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 18px;
          margin-bottom: 25px;
        }
        h1 {
          margin: 0 0 9px;
          font-size: 28px;
          letter-spacing: -0.7px;
        }
        .subtitle {
          margin: 0;
          max-width: 720px;
          color: #7b8599;
          font-size: 14px;
          line-height: 1.6;
        }
        .actions {
          display: flex;
          gap: 9px;
          flex-wrap: wrap;
        }
        .btn {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          gap: 7px;
          border: 1px solid #dfe4ee;
          background: #fff;
          color: #354057;
          border-radius: 9px;
          padding: 10px 13px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .btn:hover:not(:disabled) {
          background: #f1f4fb;
        }
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .primary {
          color: #fff;
          background: #315fe9;
          border-color: #315fe9;
        }
        .primary:hover:not(:disabled) {
          background: #244bc4;
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 23px;
        }
        .stat {
          min-width: 0;
          background: #fff;
          border: 1px solid #e6eaf2;
          border-radius: 13px;
          padding: 19px;
        }
        .stat-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          color: #737e92;
          font-size: 13px;
        }
        .stat-icon {
          display: grid;
          place-items: center;
          width: 35px;
          height: 35px;
          border-radius: 10px;
          background: #eef2ff;
          color: #425fe0;
          flex-shrink: 0;
        }
        .stat-value {
          margin-top: 15px;
          font-size: 27px;
          font-weight: 750;
          letter-spacing: -0.6px;
        }
        .stat-note {
          margin-top: 7px;
          color: #8a93a5;
          font-size: 12px;
        }
        .panel {
          overflow: hidden;
          background: #fff;
          border: 1px solid #e5e9f1;
          border-radius: 14px;
        }
        .panel-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
          padding: 20px;
          border-bottom: 1px solid #edf0f5;
        }
        .panel-head h2 {
          margin: 0 0 5px;
          font-size: 17px;
        }
        .panel-head p {
          margin: 0;
          color: #818ba0;
          font-size: 12px;
        }
        .filters {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          padding: 17px 20px;
          border-bottom: 1px solid #edf0f5;
        }
        .search {
          position: relative;
          flex: 1;
          min-width: 210px;
        }
        .search :global(svg) {
          position: absolute;
          left: 12px;
          top: 12px;
          color: #8b95a8;
        }
        .search input {
          width: 100%;
          height: 39px;
          padding: 0 12px 0 38px;
          border: 1px solid #dfe4ee;
          border-radius: 8px;
          outline: none;
          font-size: 13px;
        }
        .search input:focus,
        select:focus {
          border-color: #6480f0;
        }
        select {
          max-width: 100%;
          height: 39px;
          padding: 0 30px 0 11px;
          border: 1px solid #dfe4ee;
          border-radius: 8px;
          background: #fff;
          color: #48536a;
          font-size: 13px;
          outline: none;
        }
        .table-wrap {
          overflow-x: auto;
        }
        table {
          width: 100%;
          min-width: 1080px;
          border-collapse: collapse;
          text-align: left;
        }
        th {
          padding: 13px 16px;
          background: #fafbfe;
          color: #7d879a;
          border-bottom: 1px solid #edf0f5;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.45px;
          white-space: nowrap;
        }
        td {
          padding: 15px 16px;
          border-bottom: 1px solid #f0f2f7;
          font-size: 12px;
          vertical-align: middle;
        }
        tbody tr:hover {
          background: #fafbff;
        }
        .event-id {
          color: #4259c8;
          font-weight: 700;
        }
        .user-name {
          color: #283249;
          font-size: 13px;
          font-weight: 650;
        }
        .muted {
          margin-top: 5px;
          color: #8a93a5;
          font-size: 11px;
        }
        .event-type {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 8px;
          border-radius: 6px;
          background: #eef2ff;
          color: #4758bd;
          font-size: 11px;
          font-weight: 650;
          white-space: nowrap;
        }
        .status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-weight: 650;
          white-space: nowrap;
        }
        .view-btn {
          display: grid;
          place-items: center;
          width: 32px;
          height: 32px;
          border: 1px solid #e0e5ef;
          border-radius: 7px;
          background: #fff;
          color: #5d6a83;
          cursor: pointer;
        }
        .view-btn:hover {
          background: #edf2ff;
          color: #315fe9;
        }
        .empty {
          padding: 45px 20px;
          color: #828ca0;
          font-size: 13px;
          text-align: center;
        }
        .table-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          padding: 15px 20px;
          color: #7e889c;
          font-size: 12px;
        }
        .footer-buttons {
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .notice {
          margin-bottom: 16px;
          padding: 10px 13px;
          border: 1px solid #bbf7d0;
          border-radius: 8px;
          background: #ecfdf3;
          color: #166534;
          font-size: 13px;
        }
        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(15, 23, 42, 0.48);
        }
        .modal {
          width: 100%;
          max-width: 590px;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 25px 70px rgba(15, 23, 42, 0.22);
        }
        .modal-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          padding: 21px;
          border-bottom: 1px solid #edf0f5;
        }
        .modal-head h2 {
          margin: 0 0 6px;
          font-size: 19px;
        }
        .modal-head p {
          margin: 0;
          color: #8791a4;
          font-size: 12px;
        }
        .close {
          display: grid;
          place-items: center;
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 8px;
          background: #f2f4f8;
          cursor: pointer;
        }
        .modal-body {
          padding: 21px;
        }
        .detail-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 17px;
        }
        .detail-label {
          margin-bottom: 6px;
          color: #8a93a5;
          font-size: 11px;
        }
        .detail-value {
          color: #283249;
          font-size: 13px;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }
        .description {
          margin-top: 20px;
          padding: 14px;
          border-radius: 9px;
          background: #f7f8fc;
          color: #526078;
          font-size: 13px;
          line-height: 1.7;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          padding-top: 18px;
        }
        @media (max-width: 900px) {
          .stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .auth-page {
            padding: 20px;
          }
        }
        @media (max-width: 520px) {
          .stats,
          .detail-grid {
            grid-template-columns: 1fr;
          }
          .auth-page {
            padding: 14px;
          }
          h1 {
            font-size: 24px;
          }
        }
      `}</style>

      <div className="breadcrumb">
        <Link href="/dashboard">Admin</Link>
        <span>/</span>
        <Link href="/audit-logs">Audit Logs</Link>
        <span>/</span>
        <span>Authentication Logs</span>
      </div>

      <div className="heading">
        <div>
          <h1>Authentication Logs</h1>
          <p className="subtitle">
            Monitor login attempts, logout events, password resets, and
            multi-factor authentication activity.
          </p>
        </div>
        <div className="actions">
          <button className="btn" onClick={refreshEvents}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button className="btn" onClick={() => exportEvents("json")}>
            <Download size={15} /> JSON
          </button>
          <button
            className="btn primary"
            onClick={() => exportEvents("csv")}
          >
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {notice && <div className="notice">{notice}</div>}

      <section className="stats">
        <div className="stat">
          <div className="stat-top">
            Total Auth Events
            <span className="stat-icon"><Activity size={18} /></span>
          </div>
          <div className="stat-value">{events.length}</div>
          <div className="stat-note">Demonstration records</div>
        </div>
        <div className="stat">
          <div className="stat-top">
            Successful Events
            <span className="stat-icon"><CheckCircle2 size={18} /></span>
          </div>
          <div className="stat-value">{successful}</div>
          <div className="stat-note">Completed authentication events</div>
        </div>
        <div className="stat">
          <div className="stat-top">
            Failed Attempts
            <span className="stat-icon"><AlertTriangle size={18} /></span>
          </div>
          <div className="stat-value">{failed}</div>
          <div className="stat-note">Review for suspicious activity</div>
        </div>
        <div className="stat">
          <div className="stat-top">
            Pending Events
            <span className="stat-icon"><Clock3 size={18} /></span>
          </div>
          <div className="stat-value">{pending}</div>
          <div className="stat-note">Awaiting completion</div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Authentication event records</h2>
            <p>Inspect account access and identity verification events.</p>
          </div>
          <span className="event-type">
            <Fingerprint size={14} /> Identity & Access
          </span>
        </div>

        <div className="filters">
          <div className="search">
            <Search size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search user, email, IP, device, event ID..."
              aria-label="Search authentication logs"
            />
          </div>
          <select
            value={eventFilter}
            onChange={(event) => setEventFilter(event.target.value)}
            aria-label="Filter authentication event"
          >
            {[
              "All Events",
              "Login",
              "Logout",
              "MFA Verification",
              "Password Reset",
            ].map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter authentication status"
          >
            {["All Statuses", "Success", "Failed", "Pending"].map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
          <button
            className="btn"
            onClick={() => {
              setSearch("");
              setEventFilter("All Events");
              setStatusFilter("All Statuses");
            }}
          >
            <Filter size={14} /> Clear filters
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Event ID</th>
                <th>User</th>
                <th>Authentication Event</th>
                <th>Method</th>
                <th>IP Address</th>
                <th>Device</th>
                <th>Timestamp</th>
                <th>Status</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => (
                <tr key={event.id}>
                  <td><span className="event-id">{event.id}</span></td>
                  <td>
                    <div className="user-name">{event.user}</div>
                    <div className="muted">{event.email}</div>
                  </td>
                  <td>
                    <span className="event-type">
                      {event.event === "Login" ? (
                        <LogIn size={13} />
                      ) : event.event === "Logout" ? (
                        <LogOut size={13} />
                      ) : event.event === "MFA Verification" ? (
                        <Fingerprint size={13} />
                      ) : (
                        <ShieldCheck size={13} />
                      )}
                      {event.event}
                    </span>
                  </td>
                  <td>{event.method}</td>
                  <td>{event.ip}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Monitor size={14} color="#8490a5" />
                      {event.device}
                    </div>
                    <div className="muted">
                      <MapPin
                        size={11}
                        style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }}
                      />
                      {event.location}
                    </div>
                  </td>
                  <td>{event.timestamp}</td>
                  <td>
                    <span
                      className="status"
                      style={{ color: statusColors[event.status] }}
                    >
                      {event.status === "Success" ? (
                        <CheckCircle2 size={14} />
                      ) : event.status === "Failed" ? (
                        <XCircle size={14} />
                      ) : (
                        <Clock3 size={14} />
                      )}
                      {event.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="view-btn"
                      onClick={() => setSelected(event)}
                      aria-label={`View ${event.id} details`}
                      title="View event details"
                    >
                      <Eye size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredEvents.length === 0 && (
            <div className="empty">
              No authentication events match your filters.
            </div>
          )}
        </div>

        <div className="table-footer">
          <span>
            Showing {filteredEvents.length} of {events.length} demonstration
            records
          </span>
          <div className="footer-buttons">
            <button className="btn" disabled>
              <ChevronLeft size={14} /> Previous
            </button>
            <button className="btn" disabled>
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {selected && (
        <div
          className="modal-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-event-title"
          >
            <div className="modal-head">
              <div>
                <h2 id="auth-event-title">Authentication event details</h2>
                <p>{selected.id} · {selected.timestamp}</p>
              </div>
              <button
                className="close"
                onClick={() => setSelected(null)}
                aria-label="Close event details"
              >
                <X size={17} />
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-grid">
                <div>
                  <div className="detail-label">User</div>
                  <div className="detail-value">{selected.user}</div>
                </div>
                <div>
                  <div className="detail-label">Email</div>
                  <div className="detail-value">{selected.email}</div>
                </div>
                <div>
                  <div className="detail-label">Event</div>
                  <div className="detail-value">{selected.event}</div>
                </div>
                <div>
                  <div className="detail-label">Authentication method</div>
                  <div className="detail-value">{selected.method}</div>
                </div>
                <div>
                  <div className="detail-label">IP address</div>
                  <div className="detail-value">{selected.ip}</div>
                </div>
                <div>
                  <div className="detail-label">Device</div>
                  <div className="detail-value">{selected.device}</div>
                </div>
                <div>
                  <div className="detail-label">Location</div>
                  <div className="detail-value">{selected.location}</div>
                </div>
                <div>
                  <div className="detail-label">Timestamp</div>
                  <div className="detail-value">{selected.timestamp}</div>
                </div>
                <div>
                  <div className="detail-label">Status</div>
                  <div
                    className="detail-value"
                    style={{
                      color: statusColors[selected.status],
                      fontWeight: 700,
                    }}
                  >
                    {selected.status}
                  </div>
                </div>
              </div>

              <div className="description">
                <strong>Event description</strong>
                <div>{selected.details}</div>
              </div>

              <div className="modal-actions">
                <button
                  className="btn primary"
                  onClick={() => setSelected(null)}
                >
                  Close details
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
