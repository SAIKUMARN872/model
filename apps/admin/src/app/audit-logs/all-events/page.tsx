
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  Eye,
  FileSearch,
  Filter,
  RefreshCw,
  Search,
  ShieldAlert,
  X,
} from "lucide-react";

type EventStatus = "Success" | "Failed" | "Warning";

type AuditEvent = {
  id: string;
  actor: string;
  email: string;
  action: string;
  category: string;
  resource: string;
  status: EventStatus;
  ip: string;
  time: string;
  details: string;
};

const sampleEvents: AuditEvent[] = [
  {
    id: "AUD-10482",
    actor: "Sarah Johnson",
    email: "sarah.johnson@modelnow.ai",
    action: "Updated model configuration",
    category: "AI Model",
    resource: "GPT-5 Production",
    status: "Success",
    ip: "192.168.1.24",
    time: "10:42:18",
    details: "Model temperature and output token settings were updated.",
  },
  {
    id: "AUD-10481",
    actor: "Michael Chen",
    email: "michael.chen@modelnow.ai",
    action: "API key authentication failed",
    category: "Authentication",
    resource: "API Gateway",
    status: "Failed",
    ip: "203.0.113.42",
    time: "10:38:05",
    details: "The submitted API key was rejected.",
  },
  {
    id: "AUD-10480",
    actor: "Priya Sharma",
    email: "priya.sharma@modelnow.ai",
    action: "Invited organization member",
    category: "Organization",
    resource: "Acme Corporation",
    status: "Success",
    ip: "192.168.1.36",
    time: "10:31:44",
    details: "An invitation was sent to a new workspace member.",
  },
  {
    id: "AUD-10479",
    actor: "David Wilson",
    email: "david.wilson@modelnow.ai",
    action: "Changed billing settings",
    category: "Billing",
    resource: "Enterprise Plan",
    status: "Success",
    ip: "192.168.1.18",
    time: "10:24:12",
    details: "Billing contact information was updated.",
  },
  {
    id: "AUD-10478",
    actor: "System",
    email: "system@modelnow.ai",
    action: "Unusual access detected",
    category: "Security",
    resource: "Admin Console",
    status: "Warning",
    ip: "198.51.100.17",
    time: "10:19:51",
    details: "A sign-in attempt originated from an unfamiliar network.",
  },
  {
    id: "AUD-10477",
    actor: "Sarah Johnson",
    email: "sarah.johnson@modelnow.ai",
    action: "Updated access permissions",
    category: "Access",
    resource: "Engineering Team",
    status: "Success",
    ip: "192.168.1.24",
    time: "10:12:30",
    details: "Workspace role permissions were modified.",
  },
  {
    id: "AUD-10476",
    actor: "Alex Morgan",
    email: "alex.morgan@modelnow.ai",
    action: "Created API token",
    category: "API",
    resource: "Production API",
    status: "Success",
    ip: "192.168.1.52",
    time: "09:58:07",
    details: "A token was created for a production integration.",
  },
  {
    id: "AUD-10475",
    actor: "Unknown user",
    email: "unknown@example.com",
    action: "Login attempt blocked",
    category: "Authentication",
    resource: "Admin Console",
    status: "Failed",
    ip: "203.0.113.99",
    time: "09:44:23",
    details: "A login attempt was blocked after invalid credentials.",
  },
  {
    id: "AUD-10474",
    actor: "Emma Davis",
    email: "emma.davis@modelnow.ai",
    action: "Created knowledge collection",
    category: "Data Access",
    resource: "Customer Support Docs",
    status: "Success",
    ip: "192.168.1.44",
    time: "09:36:15",
    details: "A new knowledge collection was created.",
  },
  {
    id: "AUD-10473",
    actor: "System",
    email: "system@modelnow.ai",
    action: "Provider health check failed",
    category: "Provider",
    resource: "AI Provider",
    status: "Warning",
    ip: "10.0.0.12",
    time: "09:22:48",
    details: "A provider health check exceeded its configured threshold.",
  },
  {
    id: "AUD-10472",
    actor: "James Miller",
    email: "james.miller@modelnow.ai",
    action: "Changed organization role",
    category: "Organization",
    resource: "Acme Corporation",
    status: "Success",
    ip: "192.168.1.61",
    time: "09:11:03",
    details: "An organization member role was changed.",
  },
  {
    id: "AUD-10471",
    actor: "System",
    email: "system@modelnow.ai",
    action: "Policy evaluation blocked request",
    category: "Governance",
    resource: "Content Safety Policy",
    status: "Failed",
    ip: "10.0.0.18",
    time: "08:57:29",
    details: "A request was blocked by a configured governance policy.",
  },
];

const categoryOptions = [
  "All categories",
  "AI Model",
  "Authentication",
  "Organization",
  "Billing",
  "Security",
  "Access",
  "API",
  "Data Access",
  "Provider",
  "Governance",
];

const statusOptions = ["All statuses", "Success", "Failed", "Warning"];

export default function AllAuditEventsPage() {
  const [events, setEvents] = useState(sampleEvents);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [status, setStatus] = useState("All statuses");
  const [dateRange, setDateRange] = useState("Today");
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [notice, setNotice] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filteredEvents = useMemo(() => {
    const query = search.toLowerCase().trim();

    return events.filter((event) => {
      const matchesSearch =
        !query ||
        [
          event.id,
          event.actor,
          event.email,
          event.action,
          event.category,
          event.resource,
          event.ip,
        ].some((value) => value.toLowerCase().includes(query));

      return (
        matchesSearch &&
        (category === "All categories" || event.category === category) &&
        (status === "All statuses" || event.status === status)
      );
    });
  }, [events, search, category, status]);

  const pageCount = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleEvents = filteredEvents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const successCount = filteredEvents.filter((e) => e.status === "Success").length;
  const failedCount = filteredEvents.filter((e) => e.status === "Failed").length;
  const warningCount = filteredEvents.filter((e) => e.status === "Warning").length;

  function resetFilters() {
    setSearch("");
    setCategory("All categories");
    setStatus("All statuses");
    setDateRange("Today");
    setPage(1);
    setShowFilters(false);
  }

  function exportCSV() {
    const headers = [
      "Event ID",
      "Actor",
      "Email",
      "Action",
      "Category",
      "Resource",
      "Status",
      "IP Address",
      "Time",
      "Details",
    ];

    const rows = filteredEvents.map((event) => [
      event.id,
      event.actor,
      event.email,
      event.action,
      event.category,
      event.resource,
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
    anchor.download = "modelnow-all-audit-events.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice(`Exported ${filteredEvents.length} sample events to CSV.`);
  }

  function refresh() {
    setEvents([...sampleEvents]);
    setNotice("The sample event list has been refreshed.");
  }

  return (
    <main className="events-page">
      <style jsx>{`
        .events-page {
          --text: var(--admin-text, #172033);
          --muted: var(--admin-muted, #748096);
          --border: var(--admin-border, #e3e8f0);
          --surface: var(--admin-surface, #ffffff);
          --bg: var(--admin-bg, #f6f8fb);
          --primary: var(--admin-primary, #315fea);
          min-height: 100vh;
          padding: 30px;
          color: var(--text);
          background: var(--bg);
        }
        .top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 18px;
          margin-bottom: 25px;
        }
        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--muted);
          font-size: 11px;
          margin-bottom: 12px;
        }
        .breadcrumb a {
          color: var(--primary);
          text-decoration: none;
        }
        h1 {
          margin: 0;
          font-size: clamp(25px, 3vw, 31px);
          font-weight: 750;
          letter-spacing: -0.9px;
        }
        .subtitle {
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
          color: var(--text);
          background: var(--surface);
          font-size: 12px;
          font-weight: 650;
          cursor: pointer;
          text-decoration: none;
        }
        .btn:hover { border-color: var(--primary); color: var(--primary); }
        .btn.primary {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }
        .notice {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 11px 13px;
          margin-bottom: 18px;
          border: 1px solid #b9e8d0;
          border-radius: 9px;
          background: #effbf5;
          color: #167447;
          font-size: 12px;
        }
        .dismiss {
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
        }
        .stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 20px;
        }
        .stat {
          padding: 18px;
          border: 1px solid var(--border);
          border-radius: 12px;
          background: var(--surface);
        }
        .stat-label {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          color: var(--muted);
          font-size: 11px;
          font-weight: 650;
        }
        .stat-icon {
          width: 33px;
          height: 33px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          color: var(--primary);
          background: #edf2ff;
        }
        .stat-value {
          margin-top: 13px;
          font-size: 27px;
          font-weight: 750;
          letter-spacing: -0.7px;
        }
        .stat-note {
          margin-top: 6px;
          font-size: 10px;
          color: var(--muted);
        }
        .panel {
          border: 1px solid var(--border);
          border-radius: 13px;
          background: var(--surface);
          overflow: hidden;
        }
        .panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
          padding: 19px 20px;
          border-bottom: 1px solid var(--border);
        }
        h2 {
          margin: 0;
          font-size: 14px;
          font-weight: 750;
        }
        .panel-subtitle {
          margin: 5px 0 0;
          color: var(--muted);
          font-size: 11px;
        }
        .toolbar {
          display: flex;
          align-items: center;
          gap: 9px;
          flex-wrap: wrap;
          padding: 15px 19px;
          border-bottom: 1px solid var(--border);
        }
        .search {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          min-width: 210px;
          max-width: 390px;
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
          color: var(--text);
          background: transparent;
          font-size: 12px;
        }
        select {
          min-height: 37px;
          max-width: 100%;
          padding: 0 10px;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--surface);
          color: var(--text);
          font-size: 11px;
          outline: none;
        }
        .filter-panel {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          padding: 13px 19px;
          border-bottom: 1px solid var(--border);
          background: var(--bg);
        }
        .filter-label {
          color: var(--muted);
          font-size: 11px;
          font-weight: 650;
        }
        .table-wrap { overflow-x: auto; }
        table {
          width: 100%;
          min-width: 920px;
          border-collapse: collapse;
          text-align: left;
        }
        th {
          padding: 13px 16px;
          color: var(--muted);
          background: var(--bg);
          font-size: 10px;
          font-weight: 750;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          white-space: nowrap;
        }
        td {
          padding: 14px 16px;
          border-top: 1px solid var(--border);
          font-size: 11px;
          white-space: nowrap;
        }
        tbody tr:hover { background: var(--bg); }
        .id {
          color: var(--primary);
          font-weight: 750;
        }
        .main-text { font-weight: 700; }
        .secondary {
          margin-top: 4px;
          color: var(--muted);
          font-size: 10px;
        }
        .pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 8px;
          border-radius: 30px;
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
          padding: 45px 20px;
          color: var(--muted);
          text-align: center;
          font-size: 12px;
        }
        .footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          padding: 15px 19px;
          border-top: 1px solid var(--border);
          color: var(--muted);
          font-size: 11px;
        }
        .pagination {
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .page-btn {
          min-width: 30px;
          height: 30px;
          border: 1px solid var(--border);
          border-radius: 7px;
          background: var(--surface);
          color: var(--text);
          cursor: pointer;
        }
        .page-btn.active {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }
        .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .back {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 17px;
          color: var(--primary);
          font-size: 12px;
          font-weight: 650;
          text-decoration: none;
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
          background: rgba(15, 23, 42, 0.5);
        }
        .modal {
          width: 100%;
          max-width: 560px;
          max-height: 85vh;
          overflow: auto;
          border: 1px solid var(--border);
          border-radius: 14px;
          background: var(--surface);
          box-shadow: 0 25px 80px #0002;
        }
        .modal-head {
          display: flex;
          align-items: flex-start;
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
          margin-top: 18px;
        }
        .detail-label {
          margin-bottom: 6px;
          color: var(--muted);
          font-size: 10px;
        }
        .detail-value {
          font-size: 12px;
          font-weight: 650;
          overflow-wrap: anywhere;
        }
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
          .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 650px) {
          .events-page { padding: 16px; }
          .stats { gap: 9px; }
          .stat { padding: 13px; }
          .stat-value { font-size: 23px; }
          .panel-head { padding: 15px; }
          .toolbar { padding: 12px; }
          .search { max-width: none; }
          .details-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <header className="top">
        <div>
          <div className="breadcrumb">
            <Link href="/audit-logs">Audit Logs</Link>
            <span>/</span>
            <span>All Events</span>
          </div>
          <h1>All Events</h1>
          <p className="subtitle">
            Search, filter, and investigate audit events across your workspace.
          </p>
        </div>
        <div className="actions">
          <button className="btn" onClick={refresh}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="btn primary" onClick={exportCSV}>
            <ArrowDownToLine size={15} /> Export CSV
          </button>
        </div>
      </header>

      {notice && (
        <div className="notice" role="status">
          {notice}
          <button className="dismiss" onClick={() => setNotice("")} aria-label="Dismiss">
            <X size={15} />
          </button>
        </div>
      )}

      <section className="stats">
        <div className="stat">
          <div className="stat-label">
            Matching Events <span className="stat-icon"><FileSearch size={16} /></span>
          </div>
          <div className="stat-value">{filteredEvents.length}</div>
          <div className="stat-note">Records matching current filters</div>
        </div>
        <div className="stat">
          <div className="stat-label">
            Successful <span className="stat-icon"><CheckCircle2 size={16} /></span>
          </div>
          <div className="stat-value">{successCount}</div>
          <div className="stat-note">Successful sample events</div>
        </div>
        <div className="stat">
          <div className="stat-label">
            Failed <span className="stat-icon"><ShieldAlert size={16} /></span>
          </div>
          <div className="stat-value">{failedCount}</div>
          <div className="stat-note">Failed sample events</div>
        </div>
        <div className="stat">
          <div className="stat-label">
            Warnings <span className="stat-icon"><Activity size={16} /></span>
          </div>
          <div className="stat-value">{warningCount}</div>
          <div className="stat-note">Events flagged for review</div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <h2>Event Explorer</h2>
            <p className="panel-subtitle">
              Review recorded actions and inspect their available metadata.
            </p>
          </div>
          <span className="pill Success">
            <CheckCircle2 size={12} /> Explorer ready
          </span>
        </div>

        <div className="toolbar">
          <label className="search">
            <Search size={15} />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search ID, user, action, IP..."
              aria-label="Search all events"
            />
          </label>

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            aria-label="Filter category"
          >
            {categoryOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            aria-label="Filter status"
          >
            {statusOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>

          <button className="btn" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={14} /> Filters <ChevronDown size={13} />
          </button>
        </div>

        {showFilters && (
          <div className="filter-panel">
            <span className="filter-label"><CalendarDays size={14} style={{ display: "inline", marginRight: 5 }} />Date range</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              aria-label="Date range"
            >
              <option>Today</option>
              <option>Last 24 hours</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>All time</option>
            </select>
            <span className="panel-subtitle">
              Date range is a UI selection; sample events are not date-filtered.
            </span>
            <button className="btn" onClick={resetFilters}>
              <X size={13} /> Reset filters
            </button>
          </div>
        )}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Category</th>
                <th>Resource</th>
                <th>Status</th>
                <th>Time</th>
                <th>Inspect</th>
              </tr>
            </thead>
            <tbody>
              {visibleEvents.map((event) => (
                <tr key={event.id}>
                  <td><span className="id">{event.id}</span></td>
                  <td>
                    <div className="main-text">{event.actor}</div>
                    <div className="secondary">{event.email}</div>
                  </td>
                  <td>
                    <div className="main-text">{event.action}</div>
                    <div className="secondary">IP: {event.ip}</div>
                  </td>
                  <td>{event.category}</td>
                  <td>{event.resource}</td>
                  <td>
                    <span className={`pill ${event.status}`}>
                      {event.status === "Success" ? (
                        <CheckCircle2 size={12} />
                      ) : event.status === "Failed" ? (
                        <X size={12} />
                      ) : (
                        <ShieldAlert size={12} />
                      )}
                      {event.status}
                    </span>
                  </td>
                  <td>{event.time}</td>
                  <td>
                    <button className="view" onClick={() => setSelectedEvent(event)}>
                      <Eye size={13} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visibleEvents.length === 0 && (
            <div className="empty">
              <Search size={23} style={{ marginBottom: 9 }} />
              <div>No matching events found.</div>
              <p>Try a different search term or reset your filters.</p>
              <button className="btn" onClick={resetFilters}>Reset filters</button>
            </div>
          )}
        </div>

        <footer className="footer">
          <span>
            Showing {filteredEvents.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            {"–"}
            {Math.min(currentPage * pageSize, filteredEvents.length)} of {filteredEvents.length} sample events
          </span>
          <div className="pagination">
            <button
              className="page-btn"
              disabled={currentPage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              <ArrowLeft size={13} />
            </button>
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                className={`page-btn ${number === currentPage ? "active" : ""}`}
                onClick={() => setPage(number)}
              >
                {number}
              </button>
            ))}
            <button
              className="page-btn"
              disabled={currentPage === pageCount}
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              aria-label="Next page"
            >
              <ArrowRight size={13} />
            </button>
          </div>
        </footer>
      </section>

      <Link href="/audit-logs" className="back">
        <ArrowLeft size={14} /> Back to Audit Logs Overview
      </Link>

      {selectedEvent && (
        <div
          className="backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedEvent(null);
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-modal-title"
          >
            <header className="modal-head">
              <div>
                <div className="breadcrumb">AUDIT EVENT / DETAILS</div>
                <h2 id="event-modal-title">{selectedEvent.id}</h2>
                <p className="panel-subtitle">{selectedEvent.action}</p>
              </div>
              <button
                className="dismiss"
                onClick={() => setSelectedEvent(null)}
                aria-label="Close details"
              >
                <X size={19} />
              </button>
            </header>
            <div className="modal-body">
              <span className={`pill ${selectedEvent.status}`}>{selectedEvent.status}</span>
              <div className="details-grid">
                <div>
                  <div className="detail-label">Actor</div>
                  <div className="detail-value">{selectedEvent.actor}</div>
                </div>
                <div>
                  <div className="detail-label">Email</div>
                  <div className="detail-value">{selectedEvent.email}</div>
                </div>
                <div>
                  <div className="detail-label">Category</div>
                  <div className="detail-value">{selectedEvent.category}</div>
                </div>
                <div>
                  <div className="detail-label">Resource</div>
                  <div className="detail-value">{selectedEvent.resource}</div>
                </div>
                <div>
                  <div className="detail-label">IP Address (demo)</div>
                  <div className="detail-value">{selectedEvent.ip}</div>
                </div>
                <div>
                  <div className="detail-label">Time (demo)</div>
                  <div className="detail-value">{selectedEvent.time}</div>
                </div>
              </div>
              <div className="description">
                <strong>Event description</strong>
                <p>{selectedEvent.details}</p>
                <span style={{ color: "var(--muted)", fontSize: 10 }}>
                  This record is sample data, not a verified production audit event.
                </span>
              </div>
              <button
                className="btn primary"
                style={{ marginTop: 17 }}
                onClick={() => {
                  const content = JSON.stringify(selectedEvent, null, 2);
                  const blob = new Blob([content], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const anchor = document.createElement("a");
                  anchor.href = url;
                  anchor.download = `${selectedEvent.id}.json`;
                  anchor.click();
                  URL.revokeObjectURL(url);
                  setNotice(`Downloaded ${selectedEvent.id} details.`);
                  setSelectedEvent(null);
                }}
              >
                <Download size={14} /> Download event JSON
              </button>
            </div>
          </section>
        </div>
      )}

      <div style={{ marginTop: 18, color: "var(--admin-muted, #748096)", fontSize: 10 }}>
        <Clock3 size={12} style={{ display: "inline", marginRight: 5 }} />
        Demo interface · Backend audit events and real timestamps are not connected.
      </div>
    </main>
  );
}
