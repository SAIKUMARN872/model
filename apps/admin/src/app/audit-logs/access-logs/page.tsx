
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ShieldCheck,
  Search,
  RefreshCw,
  Download,
  Eye,
  X,
  CheckCircle2,
  XCircle,
  Clock3,
  Filter,
  Database,
  FileText,
  Folder,
  LockKeyhole,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  UserRound,
} from "lucide-react";

type AccessEvent = {
  id: string;
  user: string;
  email: string;
  resource: string;
  resourceType: string;
  action: string;
  permission: string;
  ip: string;
  timestamp: string;
  status: "Granted" | "Denied" | "Pending";
  details: string;
};

const INITIAL_EVENTS: AccessEvent[] = [
  {
    id: "ACC-1001",
    user: "Pujitha Marikanti",
    email: "pujitha@modelnow.ai",
    resource: "Enterprise Knowledge Base",
    resourceType: "Knowledge",
    action: "Read",
    permission: "Knowledge:Read",
    ip: "192.168.1.10",
    timestamp: "2026-11-04 09:48:12",
    status: "Granted",
    details: "The demonstration user was granted read access to the knowledge resource.",
  },
  {
    id: "ACC-1002",
    user: "Sai Kumar",
    email: "sai@modelnow.ai",
    resource: "Production API Keys",
    resourceType: "Secrets",
    action: "View",
    permission: "Secrets:Read",
    ip: "192.168.1.15",
    timestamp: "2026-11-04 09:37:44",
    status: "Denied",
    details: "The demonstration request was denied because the required permission was not available.",
  },
  {
    id: "ACC-1003",
    user: "Operations Team",
    email: "operations@modelnow.ai",
    resource: "Monthly Usage Report",
    resourceType: "Report",
    action: "Download",
    permission: "Reports:Export",
    ip: "192.168.1.20",
    timestamp: "2026-11-04 09:22:05",
    status: "Granted",
    details: "The demonstration report download permission was granted.",
  },
  {
    id: "ACC-1004",
    user: "Security Admin",
    email: "security@modelnow.ai",
    resource: "Security Policies",
    resourceType: "Configuration",
    action: "Update",
    permission: "Policies:Write",
    ip: "10.0.0.30",
    timestamp: "2026-11-04 09:15:30",
    status: "Granted",
    details: "The demonstration administrator was allowed to update the policy resource.",
  },
  {
    id: "ACC-1005",
    user: "Test Account",
    email: "test@modelnow.ai",
    resource: "Customer Records",
    resourceType: "Database",
    action: "Read",
    permission: "CustomerData:Read",
    ip: "192.168.1.30",
    timestamp: "2026-11-04 08:55:17",
    status: "Denied",
    details: "The demonstration request was denied by the access control policy.",
  },
  {
    id: "ACC-1006",
    user: "Pujitha Marikanti",
    email: "pujitha@modelnow.ai",
    resource: "Project Documents",
    resourceType: "File",
    action: "Download",
    permission: "Files:Download",
    ip: "192.168.1.10",
    timestamp: "2026-11-04 08:42:03",
    status: "Pending",
    details: "The demonstration file access request is awaiting approval.",
  },
  {
    id: "ACC-1007",
    user: "Sai Kumar",
    email: "sai@modelnow.ai",
    resource: "Model Configuration",
    resourceType: "Configuration",
    action: "Update",
    permission: "Models:Write",
    ip: "192.168.1.15",
    timestamp: "2026-11-03 17:35:10",
    status: "Granted",
    details: "The demonstration model configuration access request was granted.",
  },
  {
    id: "ACC-1008",
    user: "Unknown user",
    email: "unknown@example.com",
    resource: "Billing Records",
    resourceType: "Database",
    action: "Read",
    permission: "Billing:Read",
    ip: "203.0.113.42",
    timestamp: "2026-11-03 16:20:00",
    status: "Denied",
    details: "The demonstration access request was denied.",
  },
];

const statusColors: Record<AccessEvent["status"], string> = {
  Granted: "#15803d",
  Denied: "#dc2626",
  Pending: "#b45309",
};

export default function AccessLogsPage() {
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [search, setSearch] = useState("");
  const [resourceFilter, setResourceFilter] = useState("All Resources");
  const [statusFilter, setStatusFilter] = useState("All Results");
  const [actionFilter, setActionFilter] = useState("All Actions");
  const [selected, setSelected] = useState<AccessEvent | null>(null);
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
          event.resource,
          event.resourceType,
          event.action,
          event.permission,
          event.ip,
        ].some((value) => value.toLowerCase().includes(query));

      const matchesResource =
        resourceFilter === "All Resources" ||
        event.resourceType === resourceFilter;

      const matchesStatus =
        statusFilter === "All Results" || event.status === statusFilter;

      const matchesAction =
        actionFilter === "All Actions" || event.action === actionFilter;

      return matchesSearch && matchesResource && matchesStatus && matchesAction;
    });
  }, [events, search, resourceFilter, statusFilter, actionFilter]);

  const granted = events.filter((event) => event.status === "Granted").length;
  const denied = events.filter((event) => event.status === "Denied").length;
  const pending = events.filter((event) => event.status === "Pending").length;

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2500);
  }

  function refreshEvents() {
    setEvents([...INITIAL_EVENTS]);
    setSearch("");
    setResourceFilter("All Resources");
    setStatusFilter("All Results");
    setActionFilter("All Actions");
    showNotice("Demonstration access logs refreshed.");
  }

  function exportEvents(format: "csv" | "json") {
    const rows = filteredEvents.map((event) => ({
      eventId: event.id,
      user: event.user,
      email: event.email,
      resource: event.resource,
      resourceType: event.resourceType,
      action: event.action,
      permission: event.permission,
      ipAddress: event.ip,
      timestamp: event.timestamp,
      result: event.status,
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
              "Resource",
              "Resource Type",
              "Action",
              "Permission",
              "IP Address",
              "Timestamp",
              "Result",
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
    anchor.download = `modelnow-access-logs.${format}`;
    anchor.click();
    URL.revokeObjectURL(url);
    showNotice(`Access logs exported as ${format.toUpperCase()}.`);
  }

  return (
    <main className="access-page">
      <style jsx>{`
        .access-page {
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
          flex-wrap: wrap;
          align-items: center;
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
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          flex-wrap: wrap;
          margin-bottom: 25px;
        }
        h1 {
          margin: 0 0 9px;
          font-size: 28px;
          letter-spacing: -0.7px;
        }
        .subtitle {
          max-width: 720px;
          margin: 0;
          color: #7b8599;
          font-size: 14px;
          line-height: 1.6;
        }
        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
        }
        .btn {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          gap: 7px;
          border: 1px solid #dfe4ee;
          border-radius: 9px;
          background: #fff;
          color: #354057;
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
          background: #315fe9;
          color: #fff;
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
          padding: 19px;
          border: 1px solid #e6eaf2;
          border-radius: 13px;
          background: #fff;
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
          border: 1px solid #e5e9f1;
          border-radius: 14px;
          background: #fff;
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
        .tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 9px;
          border-radius: 7px;
          background: #eef2ff;
          color: #4758bd;
          font-size: 11px;
          font-weight: 650;
          white-space: nowrap;
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
        .resource {
          color: #283249;
          font-weight: 600;
        }
        .permission {
          display: inline-block;
          padding: 5px 7px;
          border: 1px solid #e7eaf2;
          border-radius: 6px;
          background: #fafbfe;
          color: #566178;
          font-family: monospace;
          font-size: 11px;
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
          .access-page {
            padding: 20px;
          }
        }
        @media (max-width: 520px) {
          .stats,
          .detail-grid {
            grid-template-columns: 1fr;
          }
          .access-page {
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
        <span>Access Logs</span>
      </div>

      <div className="heading">
        <div>
          <h1>Access Logs</h1>
          <p className="subtitle">
            Monitor access to files, databases, reports, knowledge resources,
            configuration, and other protected ModelNow resources.
          </p>
        </div>
        <div className="actions">
          <button className="btn" onClick={refreshEvents}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button className="btn" onClick={() => exportEvents("json")}>
            <Download size={15} /> JSON
          </button>
          <button className="btn primary" onClick={() => exportEvents("csv")}>
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {notice && <div className="notice">{notice}</div>}

      <section className="stats">
        <div className="stat">
          <div className="stat-top">
            Total Access Events
            <span className="stat-icon"><Activity size={18} /></span>
          </div>
          <div className="stat-value">{events.length}</div>
          <div className="stat-note">Demonstration records</div>
        </div>
        <div className="stat">
          <div className="stat-top">
            Access Granted
            <span className="stat-icon"><CheckCircle2 size={18} /></span>
          </div>
          <div className="stat-value">{granted}</div>
          <div className="stat-note">Requests allowed</div>
        </div>
        <div className="stat">
          <div className="stat-top">
            Access Denied
            <span className="stat-icon"><AlertTriangle size={18} /></span>
          </div>
          <div className="stat-value">{denied}</div>
          <div className="stat-note">Requests rejected</div>
        </div>
        <div className="stat">
          <div className="stat-top">
            Pending Requests
            <span className="stat-icon"><Clock3 size={18} /></span>
          </div>
          <div className="stat-value">{pending}</div>
          <div className="stat-note">Awaiting approval</div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Resource access records</h2>
            <p>Inspect resource-level access decisions and permission checks.</p>
          </div>
          <span className="tag">
            <LockKeyhole size={14} /> Access Control
          </span>
        </div>

        <div className="filters">
          <div className="search">
            <Search size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search user, resource, permission, IP, event ID..."
              aria-label="Search access logs"
            />
          </div>

          <select
            value={resourceFilter}
            onChange={(event) => setResourceFilter(event.target.value)}
            aria-label="Filter by resource type"
          >
            {[
              "All Resources",
              "Knowledge",
              "Secrets",
              "Report",
              "Configuration",
              "Database",
              "File",
            ].map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          <select
            value={actionFilter}
            onChange={(event) => setActionFilter(event.target.value)}
            aria-label="Filter by action"
          >
            {["All Actions", "Read", "View", "Download", "Update"].map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by access result"
          >
            {["All Results", "Granted", "Denied", "Pending"].map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          <button
            className="btn"
            onClick={() => {
              setSearch("");
              setResourceFilter("All Resources");
              setActionFilter("All Actions");
              setStatusFilter("All Results");
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
                <th>Resource</th>
                <th>Action</th>
                <th>Required Permission</th>
                <th>IP Address</th>
                <th>Timestamp</th>
                <th>Result</th>
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
                    <div className="resource">{event.resource}</div>
                    <div className="muted">{event.resourceType}</div>
                  </td>
                  <td>{event.action}</td>
                  <td><span className="permission">{event.permission}</span></td>
                  <td>{event.ip}</td>
                  <td>{event.timestamp}</td>
                  <td>
                    <span
                      className="status"
                      style={{ color: statusColors[event.status] }}
                    >
                      {event.status === "Granted" ? (
                        <CheckCircle2 size={14} />
                      ) : event.status === "Denied" ? (
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
                      title="View access details"
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
              No access records match your filters.
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
            aria-labelledby="access-event-title"
          >
            <div className="modal-head">
              <div>
                <h2 id="access-event-title">Access event details</h2>
                <p>{selected.id} · {selected.timestamp}</p>
              </div>
              <button
                className="close"
                onClick={() => setSelected(null)}
                aria-label="Close access details"
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
                  <div className="detail-label">Resource</div>
                  <div className="detail-value">{selected.resource}</div>
                </div>
                <div>
                  <div className="detail-label">Resource type</div>
                  <div className="detail-value">{selected.resourceType}</div>
                </div>
                <div>
                  <div className="detail-label">Action</div>
                  <div className="detail-value">{selected.action}</div>
                </div>
                <div>
                  <div className="detail-label">Required permission</div>
                  <div className="detail-value">{selected.permission}</div>
                </div>
                <div>
                  <div className="detail-label">IP address</div>
                  <div className="detail-value">{selected.ip}</div>
                </div>
                <div>
                  <div className="detail-label">Timestamp</div>
                  <div className="detail-value">{selected.timestamp}</div>
                </div>
                <div>
                  <div className="detail-label">Access result</div>
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
