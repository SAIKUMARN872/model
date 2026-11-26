
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  Filter,
  LogIn,
  Search,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";

type UserEvent = {
  id: string;
  user: string;
  email: string;
  action: string;
  resource: string;
  type: string;
  status: "Success" | "Failed" | "Warning";
  ip: string;
  time: string;
  details: string;
};

const initialEvents: UserEvent[] = [
  {
    id: "USR-2081",
    user: "Sarah Johnson",
    email: "sarah.johnson@modelnow.ai",
    action: "Signed in",
    resource: "Admin Workspace",
    type: "Authentication",
    status: "Success",
    ip: "192.168.1.24",
    time: "10:42:18",
    details: "The user signed in successfully using the configured authentication flow.",
  },
  {
    id: "USR-2080",
    user: "Michael Chen",
    email: "michael.chen@modelnow.ai",
    action: "Updated profile",
    resource: "User Profile",
    type: "Profile",
    status: "Success",
    ip: "192.168.1.35",
    time: "10:37:04",
    details: "Profile information was updated.",
  },
  {
    id: "USR-2079",
    user: "Priya Sharma",
    email: "priya.sharma@modelnow.ai",
    action: "Created API key",
    resource: "API Credentials",
    type: "API",
    status: "Success",
    ip: "192.168.1.36",
    time: "10:29:45",
    details: "A new API credential was created for an integration.",
  },
  {
    id: "USR-2078",
    user: "Alex Morgan",
    email: "alex.morgan@modelnow.ai",
    action: "Failed login attempt",
    resource: "Authentication Service",
    type: "Authentication",
    status: "Failed",
    ip: "203.0.113.42",
    time: "10:21:12",
    details: "Authentication failed because the submitted credentials were invalid.",
  },
  {
    id: "USR-2077",
    user: "Emma Davis",
    email: "emma.davis@modelnow.ai",
    action: "Accessed knowledge collection",
    resource: "Support Documents",
    type: "Data Access",
    status: "Success",
    ip: "192.168.1.44",
    time: "10:15:38",
    details: "The user accessed a knowledge collection.",
  },
  {
    id: "USR-2076",
    user: "James Miller",
    email: "james.miller@modelnow.ai",
    action: "Changed notification preferences",
    resource: "User Settings",
    type: "Settings",
    status: "Success",
    ip: "192.168.1.61",
    time: "10:08:09",
    details: "Notification preferences were changed.",
  },
  {
    id: "USR-2075",
    user: "Olivia Brown",
    email: "olivia.brown@modelnow.ai",
    action: "Session expired",
    resource: "Web Application",
    type: "Session",
    status: "Warning",
    ip: "192.168.1.72",
    time: "09:54:17",
    details: "The session reached its configured expiration time.",
  },
  {
    id: "USR-2074",
    user: "Noah Wilson",
    email: "noah.wilson@modelnow.ai",
    action: "Signed out",
    resource: "Admin Workspace",
    type: "Authentication",
    status: "Success",
    ip: "192.168.1.81",
    time: "09:42:53",
    details: "The user signed out of the application.",
  },
  {
    id: "USR-2073",
    user: "Sophia Taylor",
    email: "sophia.taylor@modelnow.ai",
    action: "Updated workspace settings",
    resource: "Workspace Preferences",
    type: "Settings",
    status: "Success",
    ip: "192.168.1.89",
    time: "09:30:21",
    details: "Workspace preferences were updated.",
  },
  {
    id: "USR-2072",
    user: "Unknown user",
    email: "unknown@example.com",
    action: "Blocked access attempt",
    resource: "Protected Workspace",
    type: "Security",
    status: "Failed",
    ip: "203.0.113.99",
    time: "09:18:46",
    details: "The access attempt was rejected by the sample security policy.",
  },
];

const actionTypes = [
  "All actions",
  "Authentication",
  "Profile",
  "API",
  "Data Access",
  "Settings",
  "Session",
  "Security",
];

const statuses = ["All statuses", "Success", "Failed", "Warning"];

export default function UserActivityPage() {
  const [events, setEvents] = useState(initialEvents);
  const [search, setSearch] = useState("");
  const [actionType, setActionType] = useState("All actions");
  const [status, setStatus] = useState("All statuses");
  const [selected, setSelected] = useState<UserEvent | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [notice, setNotice] = useState("");

  const filteredEvents = useMemo(() => {
    const query = search.toLowerCase().trim();

    return events.filter((event) => {
      const matchesQuery =
        !query ||
        [
          event.id,
          event.user,
          event.email,
          event.action,
          event.resource,
          event.type,
          event.ip,
        ].some((value) => value.toLowerCase().includes(query));

      return (
        matchesQuery &&
        (actionType === "All actions" || event.type === actionType) &&
        (status === "All statuses" || event.status === status)
      );
    });
  }, [events, search, actionType, status]);

  const successCount = filteredEvents.filter((e) => e.status === "Success").length;
  const failedCount = filteredEvents.filter((e) => e.status === "Failed").length;
  const uniqueUsers = new Set(filteredEvents.map((e) => e.email)).size;

  function exportCSV() {
    const headers = [
      "Event ID",
      "User",
      "Email",
      "Action",
      "Resource",
      "Type",
      "Status",
      "IP Address",
      "Time",
      "Details",
    ];

    const rows = filteredEvents.map((event) => [
      event.id,
      event.user,
      event.email,
      event.action,
      event.resource,
      event.type,
      event.status,
      event.ip,
      event.time,
      event.details,
    ]);

    const escapeCSV = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "modelnow-user-activity.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice(`Exported ${filteredEvents.length} sample activity records.`);
  }

  function refresh() {
    setEvents([...initialEvents]);
    setNotice("Sample user activity refreshed.");
  }

  function resetFilters() {
    setSearch("");
    setActionType("All actions");
    setStatus("All statuses");
    setShowFilters(false);
  }

  return (
    <main className="user-activity-page">
      <style jsx>{`
        .user-activity-page {
          --text: var(--admin-text, #172033);
          --muted: var(--admin-muted, #748096);
          --border: var(--admin-border, #e3e8f0);
          --surface: var(--admin-surface, #fff);
          --bg: var(--admin-bg, #f6f8fb);
          --primary: var(--admin-primary, #315fea);
          min-height: 100vh;
          padding: 30px;
          background: var(--bg);
          color: var(--text);
        }
        .heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 18px;
          margin-bottom: 25px;
        }
        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          color: var(--muted);
          font-size: 11px;
        }
        .breadcrumb a {
          color: var(--primary);
          text-decoration: none;
        }
        h1 {
          margin: 0;
          font-size: clamp(25px, 3vw, 31px);
          letter-spacing: -0.8px;
          font-weight: 750;
        }
        .subtitle {
          max-width: 650px;
          margin: 8px 0 0;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.6;
        }
        .actions {
          display: flex;
          gap: 9px;
          flex-wrap: wrap;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 38px;
          padding: 0 13px;
          border: 1px solid var(--border);
          border-radius: 9px;
          background: var(--surface);
          color: var(--text);
          font-size: 12px;
          font-weight: 650;
          cursor: pointer;
          text-decoration: none;
        }
        .btn:hover { color: var(--primary); border-color: var(--primary); }
        .btn.primary {
          color: white;
          background: var(--primary);
          border-color: var(--primary);
        }
        .notice {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 18px;
          padding: 11px 13px;
          border: 1px solid #b9e8d0;
          border-radius: 9px;
          background: #effbf5;
          color: #167447;
          font-size: 12px;
        }
        .dismiss {
          display: inline-grid;
          place-items: center;
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
        }
        .metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 20px;
        }
        .metric, .panel {
          border: 1px solid var(--border);
          border-radius: 12px;
          background: var(--surface);
          min-width: 0;
        }
        .metric { padding: 18px; }
        .metric-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          color: var(--muted);
          font-size: 11px;
          font-weight: 650;
        }
        .metric-icon {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: #edf2ff;
          color: var(--primary);
        }
        .metric-value {
          margin-top: 13px;
          font-size: 27px;
          font-weight: 750;
          letter-spacing: -0.7px;
        }
        .metric-foot {
          margin-top: 6px;
          color: var(--muted);
          font-size: 10px;
        }
        .panel { overflow: hidden; }
        .panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 13px;
          padding: 19px 20px;
          border-bottom: 1px solid var(--border);
        }
        h2 { margin: 0; font-size: 14px; font-weight: 750; }
        .panel-description {
          margin: 5px 0 0;
          color: var(--muted);
          font-size: 11px;
        }
        .toolbar {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 9px;
          padding: 14px 19px;
          border-bottom: 1px solid var(--border);
        }
        .search {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          min-width: 210px;
          max-width: 400px;
          padding: 10px 11px;
          border: 1px solid var(--border);
          border-radius: 8px;
          color: var(--muted);
        }
        .search input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: var(--text);
          font-size: 12px;
        }
        select {
          min-height: 37px;
          padding: 0 10px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--surface);
          color: var(--text);
          font-size: 11px;
          outline: none;
        }
        .extra-filters {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          padding: 12px 19px;
          border-bottom: 1px solid var(--border);
          background: var(--bg);
        }
        .extra-filters span { color: var(--muted); font-size: 11px; }
        .table-wrap { overflow-x: auto; }
        table {
          width: 100%;
          min-width: 900px;
          border-collapse: collapse;
          text-align: left;
        }
        th {
          padding: 13px 16px;
          background: var(--bg);
          color: var(--muted);
          font-size: 10px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }
        td {
          padding: 14px 16px;
          border-top: 1px solid var(--border);
          font-size: 11px;
          white-space: nowrap;
        }
        tbody tr:hover { background: var(--bg); }
        .event-id { color: var(--primary); font-weight: 750; }
        .user-name { font-weight: 700; }
        .secondary { margin-top: 4px; color: var(--muted); font-size: 10px; }
        .status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 8px;
          border-radius: 25px;
          font-size: 10px;
          font-weight: 750;
        }
        .Success { color: #16865b; background: #e8f8ef; }
        .Failed { color: #c93445; background: #fff0f1; }
        .Warning { color: #a96b0d; background: #fff6e4; }
        .view {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border: 0;
          background: transparent;
          color: var(--primary);
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }
        .empty {
          padding: 40px 20px;
          color: var(--muted);
          text-align: center;
          font-size: 12px;
        }
        .footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          padding: 15px 19px;
          border-top: 1px solid var(--border);
          color: var(--muted);
          font-size: 11px;
        }
        .back {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 17px;
          color: var(--primary);
          text-decoration: none;
          font-size: 12px;
          font-weight: 650;
        }
        .back:hover { text-decoration: underline; }
        .backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 18px;
          background: rgba(15, 23, 42, .5);
        }
        .modal {
          width: 100%;
          max-width: 550px;
          max-height: 85vh;
          overflow-y: auto;
          border: 1px solid var(--border);
          border-radius: 14px;
          background: var(--surface);
          box-shadow: 0 25px 80px #0002;
        }
        .modal-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 20px;
          border-bottom: 1px solid var(--border);
        }
        .modal-body { padding: 20px; }
        .details-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
          margin-top: 19px;
        }
        .detail-label { margin-bottom: 6px; color: var(--muted); font-size: 10px; }
        .detail-value { font-size: 12px; font-weight: 650; overflow-wrap: anywhere; }
        .description {
          padding: 13px;
          margin-top: 20px;
          border: 1px solid var(--border);
          border-radius: 9px;
          background: var(--bg);
          font-size: 12px;
          line-height: 1.7;
        }
        @media (max-width: 1000px) {
          .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 650px) {
          .user-activity-page { padding: 16px; }
          .metric { padding: 13px; }
          .metric-value { font-size: 23px; }
          .panel-head, .toolbar { padding: 14px; }
          .search { max-width: none; }
          .details-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <header className="heading">
        <div>
          <div className="breadcrumb">
            <Link href="/audit-logs">Audit Logs</Link>
            <span>/</span>
            <span>User Activity</span>
          </div>
          <h1>User Activity</h1>
          <p className="subtitle">
            Review user actions, sign-ins, profile changes, API activity,
            and access to workspace resources.
          </p>
        </div>
        <div className="actions">
          <button className="btn" onClick={refresh}>
            <Activity size={14} /> Refresh
          </button>
          <button className="btn primary" onClick={exportCSV}>
            <ArrowDownToLine size={15} /> Export CSV
          </button>
        </div>
      </header>

      {notice && (
        <div className="notice" role="status">
          {notice}
          <button className="dismiss" onClick={() => setNotice("")} aria-label="Dismiss notice">
            <X size={15} />
          </button>
        </div>
      )}

      <section className="metrics">
        <div className="metric">
          <div className="metric-label">
            Activity Records <span className="metric-icon"><Activity size={16} /></span>
          </div>
          <div className="metric-value">{filteredEvents.length}</div>
          <div className="metric-foot">Matching sample records</div>
        </div>
        <div className="metric">
          <div className="metric-label">
            Unique Accounts <span className="metric-icon"><Users size={16} /></span>
          </div>
          <div className="metric-value">{uniqueUsers}</div>
          <div className="metric-foot">Distinct email addresses in results</div>
        </div>
        <div className="metric">
          <div className="metric-label">
            Successful Actions <span className="metric-icon"><CheckCircle2 size={16} /></span>
          </div>
          <div className="metric-value">{successCount}</div>
          <div className="metric-foot">Successful sample events</div>
        </div>
        <div className="metric">
          <div className="metric-label">
            Failed Actions <span className="metric-icon"><ShieldCheck size={16} /></span>
          </div>
          <div className="metric-value">{failedCount}</div>
          <div className="metric-foot">Failed sample events</div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>User Activity Explorer</h2>
            <p className="panel-description">
              Investigate actions performed by workspace users.
            </p>
          </div>
          <span className="status Success">
            <CheckCircle2 size={12} /> Monitoring view
          </span>
        </div>

        <div className="toolbar">
          <label className="search">
            <Search size={15} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user, email, action, IP..."
              aria-label="Search user activity"
            />
          </label>
          <select
            value={actionType}
            onChange={(e) => setActionType(e.target.value)}
            aria-label="Filter action type"
          >
            {actionTypes.map((type) => <option key={type}>{type}</option>)}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter event status"
          >
            {statuses.map((value) => <option key={value}>{value}</option>)}
          </select>
          <button className="btn" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={14} /> More filters
          </button>
        </div>

        {showFilters && (
          <div className="extra-filters">
            <span><Clock3 size={13} style={{ display: "inline", marginRight: 5 }} />Time window</span>
            <span>Current demo session</span>
            <span>All listed event types</span>
            <button className="btn" onClick={resetFilters}>
              <X size={13} /> Clear filters
            </button>
          </div>
        )}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Event ID</th>
                <th>User</th>
                <th>Action</th>
                <th>Type</th>
                <th>Resource</th>
                <th>IP Address</th>
                <th>Status</th>
                <th>Time</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => (
                <tr key={event.id}>
                  <td><span className="event-id">{event.id}</span></td>
                  <td>
                    <div className="user-name">{event.user}</div>
                    <div className="secondary">{event.email}</div>
                  </td>
                  <td><div className="user-name">{event.action}</div></td>
                  <td>{event.type}</td>
                  <td>{event.resource}</td>
                  <td>{event.ip}</td>
                  <td>
                    <span className={`status ${event.status}`}>
                      {event.status === "Success" ? (
                        <CheckCircle2 size={12} />
                      ) : event.status === "Failed" ? (
                        <X size={12} />
                      ) : (
                        <Clock3 size={12} />
                      )}
                      {event.status}
                    </span>
                  </td>
                  <td>{event.time}</td>
                  <td>
                    <button className="view" onClick={() => setSelected(event)}>
                      <Eye size={13} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredEvents.length === 0 && (
            <div className="empty">
              <Search size={22} style={{ marginBottom: 9 }} />
              <div>No user activity matches these filters.</div>
              <p>Try a different search or clear the filters.</p>
              <button className="btn" onClick={resetFilters}>Reset filters</button>
            </div>
          )}
        </div>

        <footer className="footer">
          <span>Showing {filteredEvents.length} sample activity records</span>
          <span>
            <LogIn size={12} style={{ display: "inline", marginRight: 5 }} />
            Sample activity only
          </span>
        </footer>
      </section>

      <Link href="/audit-logs" className="back">
        <ArrowLeft size={14} /> Back to Audit Logs Overview
      </Link>

      {selected && (
        <div
          className="backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="user-event-title">
            <header className="modal-head">
              <div>
                <div className="breadcrumb">USER ACTIVITY / EVENT DETAILS</div>
                <h2 id="user-event-title">{selected.id}</h2>
                <p className="panel-description">{selected.action}</p>
              </div>
              <button className="dismiss" onClick={() => setSelected(null)} aria-label="Close details">
                <X size={19} />
              </button>
            </header>
            <div className="modal-body">
              <span className={`status ${selected.status}`}>{selected.status}</span>
              <div className="details-grid">
                <div>
                  <div className="detail-label">User</div>
                  <div className="detail-value">{selected.user}</div>
                </div>
                <div>
                  <div className="detail-label">Email</div>
                  <div className="detail-value">{selected.email}</div>
                </div>
                <div>
                  <div className="detail-label">Action type</div>
                  <div className="detail-value">{selected.type}</div>
                </div>
                <div>
                  <div className="detail-label">Resource</div>
                  <div className="detail-value">{selected.resource}</div>
                </div>
                <div>
                  <div className="detail-label">IP address (demo)</div>
                  <div className="detail-value">{selected.ip}</div>
                </div>
                <div>
                  <div className="detail-label">Time (demo)</div>
                  <div className="detail-value">{selected.time}</div>
                </div>
              </div>
              <div className="description">
                <strong>Activity description</strong>
                <p>{selected.details}</p>
                <span style={{ color: "var(--muted)", fontSize: 10 }}>
                  This is demonstration data, not a verified production audit record.
                </span>
              </div>
              <button
                className="btn primary"
                style={{ marginTop: 17 }}
                onClick={() => {
                  const blob = new Blob([JSON.stringify(selected, null, 2)], {
                    type: "application/json",
                  });
                  const url = URL.createObjectURL(blob);
                  const anchor = document.createElement("a");
                  anchor.href = url;
                  anchor.download = `${selected.id}.json`;
                  anchor.click();
                  URL.revokeObjectURL(url);
                  setNotice(`Downloaded ${selected.id} sample details.`);
                  setSelected(null);
                }}
              >
                <Download size={14} /> Download event JSON
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
