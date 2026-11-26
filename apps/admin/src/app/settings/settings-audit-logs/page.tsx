
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  Download,
  Eye,
  FileText,
  Filter,
  LockKeyhole,
  RefreshCw,
  Search,
  Shield,
  UserRound,
  X,
  XCircle,
} from "lucide-react";

type AuditEvent = {
  id: string;
  timestamp: string;
  actor: string;
  email: string;
  role: string;
  action: string;
  category: string;
  resource: string;
  status: "Success" | "Failed" | "Warning";
  ip: string;
  details: string;
};

const initialEvents: AuditEvent[] = [
  {
    id: "AUD-1048",
    timestamp: "2026-11-04T09:42:18",
    actor: "Platform Admin",
    email: "admin@modelnow.example",
    role: "Super Admin",
    action: "Updated configuration",
    category: "Settings",
    resource: "System Configuration",
    status: "Success",
    ip: "192.0.2.14",
    details: "Updated runtime configuration settings.",
  },
  {
    id: "AUD-1047",
    timestamp: "2026-11-04T09:35:06",
    actor: "Security Admin",
    email: "security@modelnow.example",
    role: "Security Admin",
    action: "Changed access policy",
    category: "Security",
    resource: "Access Control",
    status: "Success",
    ip: "192.0.2.25",
    details: "Updated access control policy settings.",
  },
  {
    id: "AUD-1046",
    timestamp: "2026-11-04T09:21:40",
    actor: "Platform Admin",
    email: "admin@modelnow.example",
    role: "Super Admin",
    action: "Created API key",
    category: "API",
    resource: "API Management",
    status: "Success",
    ip: "192.0.2.14",
    details: "Created a new API key. Secret values are not recorded in this log.",
  },
  {
    id: "AUD-1045",
    timestamp: "2026-11-04T08:58:13",
    actor: "Operations Team",
    email: "operations@modelnow.example",
    role: "Operations Admin",
    action: "Changed service status",
    category: "Infrastructure",
    resource: "AI Gateway",
    status: "Warning",
    ip: "192.0.2.36",
    details: "A service configuration change requires operational review.",
  },
  {
    id: "AUD-1044",
    timestamp: "2026-11-04T08:44:51",
    actor: "Unknown User",
    email: "unknown@example.invalid",
    role: "Unverified",
    action: "Failed sign-in",
    category: "Authentication",
    resource: "Admin Login",
    status: "Failed",
    ip: "198.51.100.22",
    details: "A demo failed authentication event. Investigate if this occurs in production.",
  },
  {
    id: "AUD-1043",
    timestamp: "2026-11-04T08:32:09",
    actor: "Billing Admin",
    email: "billing@modelnow.example",
    role: "Billing Admin",
    action: "Updated billing settings",
    category: "Billing",
    resource: "Subscription Settings",
    status: "Success",
    ip: "192.0.2.42",
    details: "Updated subscription and billing configuration.",
  },
  {
    id: "AUD-1042",
    timestamp: "2026-11-04T08:15:33",
    actor: "Platform Admin",
    email: "admin@modelnow.example",
    role: "Super Admin",
    action: "Exported audit records",
    category: "Audit",
    resource: "Settings Audit Logs",
    status: "Success",
    ip: "192.0.2.14",
    details: "Exported audit records for administrative review.",
  },
  {
    id: "AUD-1041",
    timestamp: "2026-11-03T17:51:20",
    actor: "Security Admin",
    email: "security@modelnow.example",
    role: "Security Admin",
    action: "Updated retention policy",
    category: "Privacy",
    resource: "Data Retention",
    status: "Success",
    ip: "192.0.2.25",
    details: "Changed the configured data retention policy.",
  },
  {
    id: "AUD-1040",
    timestamp: "2026-11-03T16:30:02",
    actor: "Operations Team",
    email: "operations@modelnow.example",
    role: "Operations Admin",
    action: "Backup verification",
    category: "Backup",
    resource: "Backup & Recovery",
    status: "Warning",
    ip: "192.0.2.36",
    details: "A backup verification check was marked for manual review.",
  },
  {
    id: "AUD-1039",
    timestamp: "2026-11-03T15:18:46",
    actor: "Unknown User",
    email: "unknown@example.invalid",
    role: "Unverified",
    action: "Permission denied",
    category: "Security",
    resource: "Organization Settings",
    status: "Failed",
    ip: "198.51.100.18",
    details: "An attempted action was denied in this sample audit dataset.",
  },
];

const categories = [
  "All categories",
  "Settings",
  "Security",
  "API",
  "Infrastructure",
  "Authentication",
  "Billing",
  "Audit",
  "Privacy",
  "Backup",
];

const statuses = ["All statuses", "Success", "Failed", "Warning"];

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: AuditEvent["status"] }) {
  const Icon =
    status === "Success"
      ? CheckCircle2
      : status === "Failed"
        ? XCircle
        : AlertTriangle;

  return (
    <span className={`audit-status audit-status-${status.toLowerCase()}`}>
      <Icon size={13} />
      {status}
    </span>
  );
}

function Metric({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string;
  value: string;
  description: string;
  icon: typeof Activity;
}) {
  return (
    <div className="audit-metric">
      <div className="audit-metric-head">
        <span>{label}</span>
        <span className="audit-metric-icon">
          <Icon size={18} />
        </span>
      </div>
      <div className="audit-metric-value">{value}</div>
      <div className="audit-metric-description">{description}</div>
    </div>
  );
}

export default function SettingsAuditLogsPage() {
  const [events, setEvents] = useState<AuditEvent[]>(initialEvents);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [status, setStatus] = useState("All statuses");
  const [dateFilter, setDateFilter] = useState("All time");
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [notice, setNotice] = useState("");
  const [retentionDays, setRetentionDays] = useState("90");
  const [automaticExport, setAutomaticExport] = useState(false);
  const [alertFailures, setAlertFailures] = useState(true);
  const [alertChanges, setAlertChanges] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedEvents = localStorage.getItem("modelnow-settings-audit-v1");
      const savedConfig = localStorage.getItem("modelnow-settings-audit-config-v1");

      if (savedEvents) setEvents(JSON.parse(savedEvents) as AuditEvent[]);

      if (savedConfig) {
        const config = JSON.parse(savedConfig) as {
          retentionDays?: string;
          automaticExport?: boolean;
          alertFailures?: boolean;
          alertChanges?: boolean;
        };

        if (config.retentionDays) setRetentionDays(config.retentionDays);
        if (typeof config.automaticExport === "boolean") {
          setAutomaticExport(config.automaticExport);
        }
        if (typeof config.alertFailures === "boolean") {
          setAlertFailures(config.alertFailures);
        }
        if (typeof config.alertChanges === "boolean") {
          setAlertChanges(config.alertChanges);
        }
      }
    } catch {
      setNotice("Saved demo data could not be loaded.");
    }

    setHasLoaded(true);
  }, []);

  const filteredEvents = useMemo(() => {
    const term = search.trim().toLowerCase();
    const now = new Date();

    return events.filter((event) => {
      const searchable = [
        event.id,
        event.actor,
        event.email,
        event.role,
        event.action,
        event.category,
        event.resource,
        event.ip,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !term || searchable.includes(term);
      const matchesCategory =
        category === "All categories" || event.category === category;
      const matchesStatus = status === "All statuses" || event.status === status;

      const eventDate = new Date(event.timestamp);
      let matchesDate = true;

      if (dateFilter === "Last 24 hours") {
        matchesDate =
          eventDate.getTime() >= now.getTime() - 24 * 60 * 60 * 1000;
      } else if (dateFilter === "Last 7 days") {
        matchesDate =
          eventDate.getTime() >= now.getTime() - 7 * 24 * 60 * 60 * 1000;
      } else if (dateFilter === "Last 30 days") {
        matchesDate =
          eventDate.getTime() >= now.getTime() - 30 * 24 * 60 * 60 * 1000;
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesDate
      );
    });
  }, [events, search, category, status, dateFilter]);

  const successCount = events.filter((event) => event.status === "Success").length;
  const failedCount = events.filter((event) => event.status === "Failed").length;
  const warningCount = events.filter((event) => event.status === "Warning").length;

  function savePreferences() {
    try {
      localStorage.setItem("modelnow-settings-audit-v1", JSON.stringify(events));
      localStorage.setItem(
        "modelnow-settings-audit-config-v1",
        JSON.stringify({
          retentionDays,
          automaticExport,
          alertFailures,
          alertChanges,
        }),
      );
      setNotice("Audit log preferences saved in this browser.");
    } catch {
      setNotice("Could not save preferences. Check browser storage settings.");
    }
  }

  function exportCsv() {
    const headers = [
      "ID",
      "Timestamp",
      "Actor",
      "Email",
      "Role",
      "Action",
      "Category",
      "Resource",
      "Status",
      "IP Address",
      "Details",
    ];

    const escapeCsv = (value: string) =>
      `"${value.replace(/"/g, '""')}"`;

    const rows = filteredEvents.map((event) =>
      [
        event.id,
        event.timestamp,
        event.actor,
        event.email,
        event.role,
        event.action,
        event.category,
        event.resource,
        event.status,
        event.ip,
        event.details,
      ]
        .map(escapeCsv)
        .join(","),
    );

    const csv = [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "modelnow-settings-audit-logs.csv";
    link.click();
    URL.revokeObjectURL(url);
    setNotice(`${filteredEvents.length} audit records exported.`);
  }

  function refreshLogs() {
    try {
      const savedEvents = localStorage.getItem("modelnow-settings-audit-v1");
      if (savedEvents) setEvents(JSON.parse(savedEvents) as AuditEvent[]);
      setNotice("Displayed audit records refreshed.");
    } catch {
      setNotice("Could not refresh audit records.");
    }
  }

  function resetDemoData() {
    setEvents(initialEvents);
    localStorage.removeItem("modelnow-settings-audit-v1");
    setNotice("Sample audit records restored.");
  }

  return (
    <main className="settings-audit-page">
      <style>{`
        .settings-audit-page {
          --audit-border: #e5e7eb;
          --audit-muted: #667085;
          --audit-text: #101828;
          --audit-blue: #315fea;
          color: var(--audit-text);
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          padding: 28px;
          font-size: 14px;
        }
        .settings-audit-page * { box-sizing: border-box; }
        .audit-heading {
          display: flex; justify-content: space-between; align-items: flex-start;
          gap: 18px; flex-wrap: wrap; margin-bottom: 24px;
        }
        .audit-title-wrap { display: flex; gap: 13px; align-items: flex-start; }
        .audit-title-icon {
          display: grid; place-items: center; width: 46px; height: 46px;
          border: 1px solid #dce5ff; border-radius: 13px;
          background: #eef3ff; color: var(--audit-blue); flex-shrink: 0;
        }
        .audit-heading h1 { font-size: 25px; letter-spacing: -.6px; margin: 0 0 7px; }
        .audit-heading p { margin: 0; color: var(--audit-muted); line-height: 1.6; max-width: 680px; }
        .audit-actions { display: flex; gap: 9px; flex-wrap: wrap; }
        .audit-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          border: 1px solid var(--audit-border); background: white; color: #344054;
          border-radius: 9px; padding: 10px 13px; cursor: pointer;
          font-size: 13px; font-weight: 600; min-height: 39px;
        }
        .audit-btn:hover { background: #f9fafb; }
        .audit-btn-primary { color: white; background: var(--audit-blue); border-color: var(--audit-blue); }
        .audit-btn-primary:hover { background: #244dcc; }
        .audit-btn:disabled { opacity: .5; cursor: not-allowed; }
        .audit-notice {
          display: flex; align-items: center; gap: 8px; padding: 11px 13px;
          border: 1px solid #bbf7d0; background: #f0fdf4; color: #166534;
          border-radius: 9px; margin-bottom: 18px;
        }
        .audit-metrics {
          display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px; margin-bottom: 23px;
        }
        .audit-metric {
          border: 1px solid var(--audit-border); border-radius: 13px;
          padding: 17px; background: white; min-width: 0;
        }
        .audit-metric-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; color: #475467; font-size: 13px; }
        .audit-metric-icon {
          display: grid; place-items: center; width: 34px; height: 34px;
          border-radius: 9px; background: #f2f4f7; color: #475467;
        }
        .audit-metric-value { font-size: 28px; font-weight: 700; letter-spacing: -.7px; margin-top: 13px; }
        .audit-metric-description { color: var(--audit-muted); font-size: 12px; margin-top: 5px; }
        .audit-card { border: 1px solid var(--audit-border); border-radius: 13px; background: white; margin-bottom: 20px; overflow: hidden; }
        .audit-card-header {
          display: flex; justify-content: space-between; align-items: center;
          gap: 12px; flex-wrap: wrap; padding: 18px 20px; border-bottom: 1px solid var(--audit-border);
        }
        .audit-card-header h2 { font-size: 15px; margin: 0 0 5px; }
        .audit-card-header p { font-size: 12px; color: var(--audit-muted); margin: 0; }
        .audit-toolbar {
          display: flex; gap: 9px; align-items: center; flex-wrap: wrap;
          padding: 15px 20px; border-bottom: 1px solid var(--audit-border);
        }
        .audit-search { position: relative; flex: 1; min-width: 200px; }
        .audit-search svg { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: #98a2b3; }
        .audit-input, .audit-select {
          width: 100%; min-height: 39px; border: 1px solid #d0d5dd; border-radius: 8px;
          padding: 9px 11px; background: white; color: #344054; font: inherit; outline: none;
        }
        .audit-search .audit-input { padding-left: 35px; }
        .audit-input:focus, .audit-select:focus { border-color: #809cff; box-shadow: 0 0 0 3px #315fea16; }
        .audit-select { width: auto; min-width: 145px; }
        .audit-table-wrap { width: 100%; overflow-x: auto; }
        .audit-table { border-collapse: collapse; width: 100%; min-width: 980px; text-align: left; }
        .audit-table th {
          color: #667085; font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: .5px; padding: 12px 16px; background: #f9fafb;
          border-bottom: 1px solid var(--audit-border); white-space: nowrap;
        }
        .audit-table td { padding: 14px 16px; border-bottom: 1px solid #f0f1f3; vertical-align: middle; }
        .audit-table tbody tr:hover { background: #fafbff; }
        .audit-table tbody tr:last-child td { border-bottom: 0; }
        .audit-id { font-weight: 700; font-size: 12px; color: #344054; }
        .audit-primary-text { font-weight: 600; color: #344054; }
        .audit-secondary-text { font-size: 12px; color: var(--audit-muted); margin-top: 4px; }
        .audit-status { display: inline-flex; align-items: center; gap: 5px; border-radius: 99px; padding: 5px 8px; font-size: 11px; font-weight: 700; white-space: nowrap; }
        .audit-status-success { background: #ecfdf3; color: #027a48; }
        .audit-status-failed { background: #fef3f2; color: #b42318; }
        .audit-status-warning { background: #fffaeb; color: #b54708; }
        .audit-icon-btn {
          display: inline-grid; place-items: center; width: 32px; height: 32px;
          border: 1px solid var(--audit-border); background: white; border-radius: 8px;
          cursor: pointer; color: #475467;
        }
        .audit-icon-btn:hover { background: #f2f4f7; }
        .audit-table-footer {
          display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap;
          align-items: center; padding: 14px 20px; border-top: 1px solid var(--audit-border);
          color: var(--audit-muted); font-size: 12px;
        }
        .audit-bottom-grid { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, .9fr); gap: 20px; }
        .audit-settings-body { padding: 20px; }
        .audit-setting-row {
          display: flex; justify-content: space-between; align-items: center;
          gap: 16px; padding: 15px 0; border-bottom: 1px solid #f0f1f3;
        }
        .audit-setting-row:first-child { padding-top: 0; }
        .audit-setting-row:last-child { border-bottom: 0; padding-bottom: 0; }
        .audit-setting-label { font-weight: 600; color: #344054; }
        .audit-setting-description { color: var(--audit-muted); font-size: 12px; line-height: 1.5; margin-top: 5px; }
        .audit-switch {
          width: 42px; height: 24px; border-radius: 99px; padding: 3px;
          border: 0; background: #d0d5dd; cursor: pointer; flex-shrink: 0;
        }
        .audit-switch span { display: block; width: 18px; height: 18px; background: white; border-radius: 50%; transition: transform .15s; }
        .audit-switch.on { background: var(--audit-blue); }
        .audit-switch.on span { transform: translateX(18px); }
        .audit-retention { max-width: 150px; }
        .audit-security-note {
          display: flex; gap: 11px; padding: 14px; border: 1px solid #dbeafe;
          background: #eff6ff; border-radius: 10px; color: #1d4ed8; line-height: 1.5;
        }
        .audit-security-note strong { display: block; margin-bottom: 4px; font-size: 13px; }
        .audit-security-note span { font-size: 12px; color: #1e40af; }
        .audit-empty { padding: 45px 20px; text-align: center; color: var(--audit-muted); }
        .audit-empty svg { margin: 0 auto 10px; }
        .audit-modal-backdrop {
          position: fixed; inset: 0; background: #10182880; z-index: 1000;
          display: flex; align-items: center; justify-content: center; padding: 20px;
        }
        .audit-modal {
          width: 100%; max-width: 560px; max-height: 88vh; overflow-y: auto;
          border-radius: 15px; background: white; box-shadow: 0 24px 80px #10182835;
        }
        .audit-modal-header {
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; padding: 20px; border-bottom: 1px solid var(--audit-border);
        }
        .audit-modal-header h2 { margin: 0; font-size: 17px; }
        .audit-modal-body { padding: 20px; }
        .audit-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 17px; }
        .audit-detail-label { color: var(--audit-muted); font-size: 12px; margin-bottom: 5px; }
        .audit-detail-value { color: #344054; font-weight: 600; overflow-wrap: anywhere; }
        .audit-detail-wide { grid-column: 1 / -1; }
        .audit-detail-box { border: 1px solid var(--audit-border); border-radius: 9px; padding: 12px; line-height: 1.6; color: #475467; }
        .audit-modal-footer { padding: 15px 20px; border-top: 1px solid var(--audit-border); display: flex; justify-content: flex-end; }
        @media (max-width: 1050px) {
          .audit-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .audit-bottom-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 650px) {
          .settings-audit-page { padding: 16px; }
          .audit-heading h1 { font-size: 22px; }
          .audit-metrics { gap: 10px; }
          .audit-metric { padding: 13px; }
          .audit-metric-value { font-size: 24px; }
          .audit-toolbar { padding: 12px; }
          .audit-search { min-width: 100%; }
          .audit-select { flex: 1; min-width: 120px; }
          .audit-detail-grid { grid-template-columns: 1fr; }
          .audit-detail-wide { grid-column: auto; }
        }
      `}</style>

      <header className="audit-heading">
        <div className="audit-title-wrap">
          <div className="audit-title-icon">
            <Shield size={23} />
          </div>
          <div>
            <h1>Settings Audit Logs</h1>
            <p>
              Review administrative activity, configuration changes, access
              events, and security-related actions across ModelNow.
            </p>
          </div>
        </div>

        <div className="audit-actions">
          <button className="audit-btn" onClick={refreshLogs}>
            <RefreshCw size={15} />
            Refresh
          </button>
          <button className="audit-btn" onClick={resetDemoData}>
            Reset demo
          </button>
          <button className="audit-btn audit-btn-primary" onClick={exportCsv}>
            <Download size={15} />
            Export CSV
          </button>
        </div>
      </header>

      {notice && (
        <div className="audit-notice">
          <CheckCircle2 size={17} />
          <span>{notice}</span>
          <button
            className="audit-icon-btn"
            style={{ marginLeft: "auto" }}
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <section className="audit-metrics">
        <Metric
          label="Total events"
          value={String(events.length)}
          description="Records currently loaded"
          icon={Activity}
        />
        <Metric
          label="Successful actions"
          value={String(successCount)}
          description="Completed administrative events"
          icon={CheckCircle2}
        />
        <Metric
          label="Failed events"
          value={String(failedCount)}
          description="Events requiring review"
          icon={XCircle}
        />
        <Metric
          label="Warnings"
          value={String(warningCount)}
          description="Events flagged for attention"
          icon={AlertTriangle}
        />
      </section>

      <section className="audit-card">
        <div className="audit-card-header">
          <div>
            <h2>Administrative activity</h2>
            <p>Search, filter, and inspect individual audit records.</p>
          </div>
          <button
            className="audit-btn"
            onClick={() => setShowFilters((current) => !current)}
          >
            <Filter size={15} />
            {showFilters ? "Hide filters" : "Filters"}
            <ChevronDown size={14} />
          </button>
        </div>

        <div className="audit-toolbar">
          <div className="audit-search">
            <Search size={16} />
            <input
              className="audit-input"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search actor, action, resource, IP..."
              aria-label="Search audit logs"
            />
          </div>

          <select
            className="audit-select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filter by status"
          >
            {statuses.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          {showFilters && (
            <>
              <select
                className="audit-select"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                aria-label="Filter by category"
              >
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>

              <select
                className="audit-select"
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                aria-label="Filter by date"
              >
                <option>All time</option>
                <option>Last 24 hours</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
              </select>
            </>
          )}
        </div>

        <div className="audit-table-wrap">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Category</th>
                <th>Status</th>
                <th>IP address</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => (
                <tr key={event.id}>
                  <td>
                    <span className="audit-id">{event.id}</span>
                  </td>
                  <td>
                    <div className="audit-primary-text">
                      {formatDate(event.timestamp)}
                    </div>
                  </td>
                  <td>
                    <div className="audit-primary-text">{event.actor}</div>
                    <div className="audit-secondary-text">{event.role}</div>
                  </td>
                  <td>
                    <div className="audit-primary-text">{event.action}</div>
                    <div className="audit-secondary-text">{event.resource}</div>
                  </td>
                  <td>{event.category}</td>
                  <td>
                    <StatusBadge status={event.status} />
                  </td>
                  <td>{event.ip}</td>
                  <td>
                    <button
                      className="audit-icon-btn"
                      onClick={() => setSelectedEvent(event)}
                      aria-label={`View ${event.id} details`}
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredEvents.length === 0 && (
            <div className="audit-empty">
              <Search size={28} />
              <div className="audit-primary-text">No matching audit records</div>
              <p>Try changing the search term or filters.</p>
              <button
                className="audit-btn"
                onClick={() => {
                  setSearch("");
                  setCategory("All categories");
                  setStatus("All statuses");
                  setDateFilter("All time");
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        <div className="audit-table-footer">
          <span>
            Showing {filteredEvents.length} of {events.length} records
          </span>
          <span>Sample data · Read-only audit view</span>
        </div>
      </section>

      <div className="audit-bottom-grid">
        <section className="audit-card">
          <div className="audit-card-header">
            <div>
              <h2>Audit log preferences</h2>
              <p>Configure retention and monitoring preferences.</p>
            </div>
            <FileText size={19} color="#667085" />
          </div>

          <div className="audit-settings-body">
            <div className="audit-setting-row">
              <div>
                <div className="audit-setting-label">Retention period</div>
                <div className="audit-setting-description">
                  Preferred number of days to retain audit records.
                </div>
              </div>
              <select
                className="audit-select audit-retention"
                value={retentionDays}
                onChange={(event) => setRetentionDays(event.target.value)}
              >
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
                <option value="180">180 days</option>
                <option value="365">365 days</option>
              </select>
            </div>

            <div className="audit-setting-row">
              <div>
                <div className="audit-setting-label">Failed sign-in alerts</div>
                <div className="audit-setting-description">
                  Preference for alerts about authentication failures.
                </div>
              </div>
              <button
                className={`audit-switch ${alertFailures ? "on" : ""}`}
                onClick={() => setAlertFailures((current) => !current)}
                aria-label="Toggle failed sign-in alerts"
                aria-pressed={alertFailures}
              >
                <span />
              </button>
            </div>

            <div className="audit-setting-row">
              <div>
                <div className="audit-setting-label">Configuration change alerts</div>
                <div className="audit-setting-description">
                  Preference for notifications about administrative changes.
                </div>
              </div>
              <button
                className={`audit-switch ${alertChanges ? "on" : ""}`}
                onClick={() => setAlertChanges((current) => !current)}
                aria-label="Toggle configuration change alerts"
                aria-pressed={alertChanges}
              >
                <span />
              </button>
            </div>

            <div className="audit-setting-row">
              <div>
                <div className="audit-setting-label">Scheduled export</div>
                <div className="audit-setting-description">
                  Enable the preference for a recurring audit export.
                </div>
              </div>
              <button
                className={`audit-switch ${automaticExport ? "on" : ""}`}
                onClick={() => setAutomaticExport((current) => !current)}
                aria-label="Toggle scheduled export"
                aria-pressed={automaticExport}
              >
                <span />
              </button>
            </div>

            <button
              className="audit-btn audit-btn-primary"
              style={{ marginTop: 20, width: "100%" }}
              onClick={savePreferences}
            >
              <CheckCircle2 size={15} />
              Save preferences
            </button>
          </div>
        </section>

        <section className="audit-card">
          <div className="audit-card-header">
            <div>
              <h2>Audit integrity & security</h2>
              <p>Recommended controls for production audit logging.</p>
            </div>
            <LockKeyhole size={19} color="#667085" />
          </div>

          <div className="audit-settings-body">
            <div className="audit-security-note">
              <Shield size={21} />
              <div>
                <strong>Protect audit records</strong>
                <span>
                  Production audit logs should be append-only, access-controlled,
                  timestamped by a trusted server, and retained according to
                  organizational policy.
                </span>
              </div>
            </div>

            <div style={{ marginTop: 19 }}>
              <div className="audit-setting-row">
                <div>
                  <div className="audit-setting-label">Actor attribution</div>
                  <div className="audit-setting-description">
                    Record the authenticated actor and role.
                  </div>
                </div>
                <CheckCircle2 size={19} color="#039855" />
              </div>

              <div className="audit-setting-row">
                <div>
                  <div className="audit-setting-label">Event timestamps</div>
                  <div className="audit-setting-description">
                    Display timestamps using the browser locale.
                  </div>
                </div>
                <Clock size={19} color="#667085" />
              </div>

              <div className="audit-setting-row">
                <div>
                  <div className="audit-setting-label">Sensitive values</div>
                  <div className="audit-setting-description">
                    Never place passwords, tokens, or API secrets in audit details.
                  </div>
                </div>
                <LockKeyhole size={19} color="#667085" />
              </div>

              <div className="audit-setting-row">
                <div>
                  <div className="audit-setting-label">Production persistence</div>
                  <div className="audit-setting-description">
                    Connect a server-side audit store before relying on these logs.
                  </div>
                </div>
                <AlertTriangle size={19} color="#b54708" />
              </div>
            </div>
          </div>
        </section>
      </div>

      {selectedEvent && (
        <div
          className="audit-modal-backdrop"
          onClick={() => setSelectedEvent(null)}
        >
          <section
            className="audit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="audit-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="audit-modal-header">
              <div>
                <h2 id="audit-detail-title">Audit event details</h2>
                <div className="audit-secondary-text">{selectedEvent.id}</div>
              </div>
              <button
                className="audit-icon-btn"
                onClick={() => setSelectedEvent(null)}
                aria-label="Close details"
              >
                <X size={17} />
              </button>
            </div>

            <div className="audit-modal-body">
              <div style={{ marginBottom: 20 }}>
                <StatusBadge status={selectedEvent.status} />
              </div>

              <div className="audit-detail-grid">
                <div>
                  <div className="audit-detail-label">Actor</div>
                  <div className="audit-detail-value">{selectedEvent.actor}</div>
                </div>
                <div>
                  <div className="audit-detail-label">Role</div>
                  <div className="audit-detail-value">{selectedEvent.role}</div>
                </div>
                <div>
                  <div className="audit-detail-label">Email</div>
                  <div className="audit-detail-value">{selectedEvent.email}</div>
                </div>
                <div>
                  <div className="audit-detail-label">Timestamp</div>
                  <div className="audit-detail-value">
                    {formatDate(selectedEvent.timestamp)}
                  </div>
                </div>
                <div>
                  <div className="audit-detail-label">Action</div>
                  <div className="audit-detail-value">{selectedEvent.action}</div>
                </div>
                <div>
                  <div className="audit-detail-label">Resource</div>
                  <div className="audit-detail-value">{selectedEvent.resource}</div>
                </div>
                <div>
                  <div className="audit-detail-label">Category</div>
                  <div className="audit-detail-value">{selectedEvent.category}</div>
                </div>
                <div>
                  <div className="audit-detail-label">IP address</div>
                  <div className="audit-detail-value">{selectedEvent.ip}</div>
                </div>
                <div className="audit-detail-wide">
                  <div className="audit-detail-label">Event description</div>
                  <div className="audit-detail-box">{selectedEvent.details}</div>
                </div>
              </div>
            </div>

            <div className="audit-modal-footer">
              <button
                className="audit-btn"
                onClick={() => setSelectedEvent(null)}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}

      <p style={{ color: "#667085", fontSize: 12, lineHeight: 1.6 }}>
        Important: These are illustrative records for the frontend. Browser
        storage is not a secure audit system. Production audit logging requires
        authenticated server-side event collection, durable storage, access
        controls, tamper protection, and backend-enforced retention.
      </p>
    </main>
  );
}
