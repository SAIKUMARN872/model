
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  FileSearch,
  Filter,
  Globe,
  LockKeyhole,
  MoreHorizontal,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  X,
  Zap,
} from "lucide-react";

type AuditEvent = {
  id: string;
  actor: string;
  email: string;
  action: string;
  resource: string;
  category: string;
  status: "Success" | "Failed" | "Warning";
  ip: string;
  time: string;
  details: string;
};

const navigation = [
  { label: "Overview", href: "/audit-logs", icon: Activity },
  { label: "All Events", href: "/audit-logs/all-events", icon: FileSearch },
  { label: "User Activity", href: "/audit-logs/user-activity", icon: Users },
  { label: "Admin Activity", href: "/audit-logs/admin-activity", icon: ShieldCheck },
  { label: "Authentication Logs", href: "/audit-logs/authentication-logs", icon: LockKeyhole },
  { label: "Access Logs", href: "/audit-logs/access-logs", icon: Globe },
  { label: "API Activity", href: "/audit-logs/api-activity", icon: Zap },
  { label: "Billing Events", href: "/audit-logs/billing-events", icon: Activity },
  { label: "Organization Events", href: "/audit-logs/organization-events", icon: Users },
  { label: "AI Model Events", href: "/audit-logs/ai-model-events", icon: Activity },
  { label: "Provider Events", href: "/audit-logs/provider-events", icon: Globe },
  { label: "Security Events", href: "/audit-logs/security-events", icon: ShieldCheck },
  { label: "Governance Events", href: "/audit-logs/governance-events", icon: LockKeyhole },
  { label: "Configuration Changes", href: "/audit-logs/configuration-changes", icon: RefreshCw },
  { label: "Data Access Logs", href: "/audit-logs/data-access-logs", icon: FileSearch },
  { label: "Export & Reports", href: "/audit-logs/export-reports", icon: Download },
  { label: "Audit Settings", href: "/audit-logs/audit-settings", icon: LockKeyhole },
];

const initialEvents: AuditEvent[] = [
  {
    id: "AUD-10482",
    actor: "Sarah Johnson",
    email: "sarah.johnson@modelnow.ai",
    action: "Updated model configuration",
    resource: "GPT-5 Production",
    category: "AI Model",
    status: "Success",
    ip: "192.168.1.24",
    time: "10:42:18",
    details: "Updated temperature and maximum output token settings for GPT-5 Production.",
  },
  {
    id: "AUD-10481",
    actor: "Michael Chen",
    email: "michael.chen@modelnow.ai",
    action: "API key authentication failed",
    resource: "API Gateway",
    category: "Authentication",
    status: "Failed",
    ip: "203.0.113.42",
    time: "10:38:05",
    details: "An API request was rejected because the supplied API key was invalid.",
  },
  {
    id: "AUD-10480",
    actor: "Priya Sharma",
    email: "priya.sharma@modelnow.ai",
    action: "Invited organization member",
    resource: "Acme Corporation",
    category: "Organization",
    status: "Success",
    ip: "192.168.1.36",
    time: "10:31:44",
    details: "Sent a workspace invitation to a new organization member.",
  },
  {
    id: "AUD-10479",
    actor: "David Wilson",
    email: "david.wilson@modelnow.ai",
    action: "Changed billing settings",
    resource: "Enterprise Plan",
    category: "Billing",
    status: "Success",
    ip: "192.168.1.18",
    time: "10:24:12",
    details: "Updated the billing contact and invoice notification preferences.",
  },
  {
    id: "AUD-10478",
    actor: "System",
    email: "system@modelnow.ai",
    action: "Unusual access detected",
    resource: "Admin Console",
    category: "Security",
    status: "Warning",
    ip: "198.51.100.17",
    time: "10:19:51",
    details: "A sign-in attempt originated from an unfamiliar network address.",
  },
  {
    id: "AUD-10477",
    actor: "Sarah Johnson",
    email: "sarah.johnson@modelnow.ai",
    action: "Updated access permissions",
    resource: "Engineering Team",
    category: "Access",
    status: "Success",
    ip: "192.168.1.24",
    time: "10:12:30",
    details: "Modified role permissions for an engineering workspace member.",
  },
  {
    id: "AUD-10476",
    actor: "Alex Morgan",
    email: "alex.morgan@modelnow.ai",
    action: "Created API token",
    resource: "Production API",
    category: "API",
    status: "Success",
    ip: "192.168.1.52",
    time: "09:58:07",
    details: "Created a new API token for the production integration.",
  },
  {
    id: "AUD-10475",
    actor: "Unknown user",
    email: "unknown@example.com",
    action: "Login attempt blocked",
    resource: "Admin Console",
    category: "Security",
    status: "Failed",
    ip: "203.0.113.99",
    time: "09:44:23",
    details: "A login attempt was blocked after invalid credentials were submitted.",
  },
];

const trend = [
  { day: "Mon", value: 42 },
  { day: "Tue", value: 68 },
  { day: "Wed", value: 51 },
  { day: "Thu", value: 82 },
  { day: "Fri", value: 60 },
  { day: "Sat", value: 37 },
  { day: "Sun", value: 73 },
];

const categories = [
  "All categories",
  "AI Model",
  "Authentication",
  "Organization",
  "Billing",
  "Security",
  "Access",
  "API",
];

export default function AuditLogsOverviewPage() {
  const [events, setEvents] = useState(initialEvents);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [status, setStatus] = useState("All statuses");
  const [selected, setSelected] = useState<AuditEvent | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [range, setRange] = useState("Last 24 hours");
  const [notice, setNotice] = useState("");

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
          event.resource,
          event.category,
          event.ip,
        ].some((value) => value.toLowerCase().includes(query));

      const matchesCategory =
        category === "All categories" || event.category === category;

      const matchesStatus =
        status === "All statuses" || event.status === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [events, search, category, status]);

  const successful = events.filter((e) => e.status === "Success").length;
  const failed = events.filter((e) => e.status === "Failed").length;
  const warnings = events.filter((e) => e.status === "Warning").length;

  function exportCSV() {
    const headers = [
      "Event ID",
      "Time",
      "Actor",
      "Email",
      "Action",
      "Resource",
      "Category",
      "Status",
      "IP Address",
      "Details",
    ];

    const rows = filteredEvents.map((e) => [
      e.id,
      e.time,
      e.actor,
      e.email,
      e.action,
      e.resource,
      e.category,
      e.status,
      e.ip,
      e.details,
    ]);

    const escapeCSV = (value: string) =>
      `"${value.replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "modelnow-audit-logs.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice("CSV export generated successfully.");
  }

  function refreshEvents() {
    setEvents([...events]);
    setNotice("Demo event list refreshed.");
  }

  return (
    <main className="audit-page">
      <style jsx>{`
        .audit-page {
          --audit-text: var(--admin-text, #172033);
          --audit-muted: var(--admin-muted, #748096);
          --audit-border: var(--admin-border, #e3e8f0);
          --audit-surface: var(--admin-surface, #ffffff);
          --audit-bg: var(--admin-bg, #f6f8fb);
          --audit-primary: var(--admin-primary, #315fea);
          min-height: 100vh;
          padding: 30px;
          color: var(--audit-text);
          background: var(--audit-bg);
          font-family: inherit;
        }
        .heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 25px;
        }
        .eyebrow {
          color: var(--audit-primary);
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.4px;
          margin-bottom: 8px;
        }
        h1 {
          margin: 0;
          font-size: clamp(25px, 3vw, 32px);
          font-weight: 750;
          letter-spacing: -1px;
        }
        .subtitle {
          margin: 9px 0 0;
          color: var(--audit-muted);
          font-size: 13px;
          line-height: 1.6;
        }
        .heading-actions {
          display: flex;
          align-items: center;
          gap: 9px;
          flex-wrap: wrap;
        }
        .button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 39px;
          border: 1px solid var(--audit-border);
          border-radius: 9px;
          padding: 0 13px;
          background: var(--audit-surface);
          color: var(--audit-text);
          font-size: 12px;
          font-weight: 650;
          cursor: pointer;
          text-decoration: none;
          transition: 0.15s ease;
        }
        .button:hover {
          border-color: var(--audit-primary);
          color: var(--audit-primary);
        }
        .button.primary {
          color: #fff;
          border-color: var(--audit-primary);
          background: var(--audit-primary);
        }
        .button.primary:hover {
          opacity: 0.9;
          color: #fff;
        }
        .notice {
          padding: 11px 14px;
          margin: -9px 0 19px;
          border: 1px solid #b9e8d0;
          border-radius: 9px;
          color: #167447;
          background: #effbf5;
          font-size: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }
        .metric, .panel {
          background: var(--audit-surface);
          border: 1px solid var(--audit-border);
          border-radius: 13px;
          min-width: 0;
        }
        .metric {
          padding: 19px;
        }
        .metric-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          color: var(--audit-muted);
          font-size: 12px;
          font-weight: 600;
        }
        .metric-icon {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          display: grid;
          place-items: center;
          background: #edf2ff;
          color: #315fea;
        }
        .metric-value {
          margin-top: 14px;
          font-size: 29px;
          font-weight: 750;
          letter-spacing: -0.8px;
        }
        .metric-foot {
          margin-top: 8px;
          font-size: 11px;
          color: var(--audit-muted);
        }
        .good { color: #16865b; }
        .bad { color: #d13e4b; }
        .warning { color: #c58119; }
        .top-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.55fr) minmax(250px, 0.8fr);
          gap: 17px;
          margin-bottom: 20px;
        }
        .panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 19px 20px;
          border-bottom: 1px solid var(--audit-border);
          flex-wrap: wrap;
        }
        .panel-title {
          margin: 0;
          font-size: 14px;
          font-weight: 750;
        }
        .panel-description {
          margin: 5px 0 0;
          color: var(--audit-muted);
          font-size: 11px;
        }
        .range-select, .filter-select {
          border: 1px solid var(--audit-border);
          border-radius: 8px;
          padding: 9px 10px;
          background: var(--audit-surface);
          color: var(--audit-text);
          font-size: 11px;
          outline: none;
        }
        .chart-area {
          padding: 20px 20px 13px;
        }
        .chart {
          height: 150px;
          display: flex;
          align-items: flex-end;
          gap: 13px;
          padding-top: 10px;
          border-bottom: 1px solid var(--audit-border);
          background-image: linear-gradient(
            to bottom,
            transparent 32%,
            var(--audit-border) 33%,
            transparent 34%,
            transparent 65%,
            var(--audit-border) 66%,
            transparent 67%
          );
        }
        .bar-column {
          flex: 1;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }
        .bar {
          width: min(100%, 31px);
          border-radius: 6px 6px 2px 2px;
          background: linear-gradient(180deg, #6688ff, #315fea);
          min-height: 7px;
          transition: height 0.2s ease;
        }
        .bar-label {
          color: var(--audit-muted);
          font-size: 10px;
          padding-bottom: 8px;
        }
        .chart-legend {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-top: 16px;
          color: var(--audit-muted);
          font-size: 11px;
        }
        .legend-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 3px;
          background: var(--audit-primary);
          margin-right: 7px;
        }
        .category-list {
          padding: 7px 19px 12px;
        }
        .category-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 0;
          border-bottom: 1px solid var(--audit-border);
        }
        .category-row:last-child { border-bottom: 0; }
        .category-symbol {
          width: 31px;
          height: 31px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          color: var(--audit-primary);
          background: #edf2ff;
          flex-shrink: 0;
        }
        .category-name {
          flex: 1;
          font-size: 12px;
          font-weight: 650;
        }
        .category-count {
          color: var(--audit-muted);
          font-size: 12px;
          font-weight: 650;
        }
        .events-panel { overflow: hidden; }
        .table-toolbar {
          padding: 14px 19px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          border-bottom: 1px solid var(--audit-border);
        }
        .searchbox {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 230px;
          flex: 1;
          max-width: 400px;
          padding: 10px 12px;
          border: 1px solid var(--audit-border);
          border-radius: 9px;
          color: var(--audit-muted);
        }
        .searchbox input {
          width: 100%;
          border: 0;
          outline: none;
          color: var(--audit-text);
          background: transparent;
          font: inherit;
          font-size: 12px;
        }
        .toolbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .table-wrap {
          width: 100%;
          overflow-x: auto;
        }
        table {
          width: 100%;
          min-width: 940px;
          border-collapse: collapse;
          text-align: left;
        }
        th {
          padding: 13px 17px;
          color: var(--audit-muted);
          background: var(--audit-bg);
          font-size: 10px;
          font-weight: 750;
          text-transform: uppercase;
          letter-spacing: 0.55px;
          white-space: nowrap;
        }
        td {
          padding: 15px 17px;
          border-top: 1px solid var(--audit-border);
          font-size: 11px;
          white-space: nowrap;
        }
        tbody tr:hover { background: var(--audit-bg); }
        .event-id {
          color: var(--audit-primary);
          font-size: 11px;
          font-weight: 750;
        }
        .actor {
          font-weight: 700;
          font-size: 11px;
        }
        .subtext {
          margin-top: 4px;
          color: var(--audit-muted);
          font-size: 10px;
        }
        .status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border-radius: 20px;
          padding: 5px 8px;
          font-size: 10px;
          font-weight: 750;
        }
        .status.Success { color: #16865b; background: #e8f8ef; }
        .status.Failed { color: #c93445; background: #fff0f1; }
        .status.Warning { color: #a96b0d; background: #fff6e4; }
        .view-button {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border: 0;
          padding: 6px 8px;
          background: transparent;
          color: var(--audit-primary);
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }
        .empty {
          text-align: center;
          padding: 45px 20px;
          color: var(--audit-muted);
          font-size: 12px;
        }
        .table-footer {
          padding: 15px 19px;
          border-top: 1px solid var(--audit-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          color: var(--audit-muted);
          font-size: 11px;
        }
        .nav-panel {
          margin-top: 20px;
          padding: 20px;
        }
        .nav-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
          margin-top: 17px;
        }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          padding: 12px;
          border: 1px solid var(--audit-border);
          border-radius: 9px;
          color: var(--audit-text);
          text-decoration: none;
          font-size: 11px;
          font-weight: 650;
          transition: 0.15s ease;
        }
        .nav-link:hover {
          color: var(--audit-primary);
          border-color: var(--audit-primary);
          background: var(--audit-bg);
        }
        .nav-link span {
          min-width: 0;
          flex: 1;
        }
        .nav-link svg:first-child { flex-shrink: 0; color: var(--audit-primary); }
        .detail-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(15, 23, 42, 0.48);
        }
        .detail-modal {
          width: 100%;
          max-width: 570px;
          max-height: 85vh;
          overflow-y: auto;
          border: 1px solid var(--audit-border);
          border-radius: 15px;
          background: var(--audit-surface);
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.18);
        }
        .detail-header {
          padding: 20px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          border-bottom: 1px solid var(--audit-border);
        }
        .close-button {
          border: 0;
          background: transparent;
          color: var(--audit-muted);
          cursor: pointer;
        }
        .detail-body { padding: 20px; }
        .detail-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 17px;
        }
        .detail-label {
          color: var(--audit-muted);
          font-size: 10px;
          margin-bottom: 6px;
        }
        .detail-value {
          font-size: 12px;
          font-weight: 650;
          overflow-wrap: anywhere;
        }
        .detail-description {
          padding: 13px;
          border: 1px solid var(--audit-border);
          border-radius: 9px;
          background: var(--audit-bg);
          font-size: 12px;
          line-height: 1.7;
          margin-top: 20px;
        }
        @media (max-width: 1100px) {
          .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .top-grid { grid-template-columns: 1fr; }
          .nav-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        }
        @media (max-width: 700px) {
          .audit-page { padding: 17px; }
          .metrics { gap: 10px; }
          .metric { padding: 14px; }
          .metric-value { font-size: 24px; }
          .nav-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .panel-head { padding: 15px; }
          .detail-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 420px) {
          .metrics { grid-template-columns: 1fr 1fr; }
          .nav-grid { grid-template-columns: 1fr; }
          .heading-actions { width: 100%; }
        }
      `}</style>

      <div className="heading">
        <div>
          <div className="eyebrow">ModelNow Admin / Security</div>
          <h1>Audit Logs</h1>
          <p className="subtitle">
            Monitor administrative actions, security events, and changes
            across your ModelNow workspace.
          </p>
        </div>

        <div className="heading-actions">
          <button className="button" onClick={refreshEvents}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="button primary" onClick={exportCSV}>
            <ArrowDownToLine size={15} /> Export CSV
          </button>
        </div>
      </div>

      {notice && (
        <div className="notice" role="status">
          <span>{notice}</span>
          <button
            className="close-button"
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <X size={15} />
          </button>
        </div>
      )}

      <section className="metrics">
        <div className="metric">
          <div className="metric-top">
            Total Events <span className="metric-icon"><Activity size={17} /></span>
          </div>
          <div className="metric-value">24,891</div>
          <div className="metric-foot"><span className="good">+12.8%</span> compared with previous period</div>
        </div>
        <div className="metric">
          <div className="metric-top">
            Successful Actions <span className="metric-icon"><CheckCircle2 size={17} /></span>
          </div>
          <div className="metric-value">{successful}</div>
          <div className="metric-foot"><span className="good">Normal</span> · Sample events loaded</div>
        </div>
        <div className="metric">
          <div className="metric-top">
            Failed Actions <span className="metric-icon"><AlertTriangle size={17} /></span>
          </div>
          <div className="metric-value">{failed}</div>
          <div className="metric-foot"><span className="bad">Needs review</span> · Failed demo events</div>
        </div>
        <div className="metric">
          <div className="metric-top">
            Security Warnings <span className="metric-icon"><ShieldCheck size={17} /></span>
          </div>
          <div className="metric-value">{warnings}</div>
          <div className="metric-foot"><span className="warning">Review recommended</span></div>
        </div>
      </section>

      <section className="top-grid">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2 className="panel-title">Event Activity</h2>
              <p className="panel-description">Illustrative event volume across the week</p>
            </div>
            <select
              className="range-select"
              value={range}
              onChange={(e) => setRange(e.target.value)}
              aria-label="Chart time range"
            >
              <option>Last 24 hours</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </div>
          <div className="chart-area">
            <div className="chart">
              {trend.map((item) => (
                <div className="bar-column" key={item.day}>
                  <div
                    className="bar"
                    title={`${item.value} illustrative activity units`}
                    style={{
                      height: `${
                        item.value *
                        (range === "Last 24 hours" ? 1 : range === "Last 7 days" ? 1.15 : 1.3)
                      }%`,
                    }}
                  />
                  <span className="bar-label">{item.day}</span>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <span><span className="legend-dot" />Audit event volume</span>
              <span>Illustrative data</span>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h2 className="panel-title">Event Categories</h2>
              <p className="panel-description">Recent events grouped by category</p>
            </div>
          </div>
          <div className="category-list">
            {[
              { name: "Authentication", count: 142, icon: LockKeyhole },
              { name: "API Activity", count: 98, icon: Zap },
              { name: "AI Model", count: 76, icon: Activity },
              { name: "Security", count: 24, icon: ShieldCheck },
              { name: "Organization", count: 19, icon: Users },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div className="category-row" key={item.name}>
                  <div className="category-symbol"><Icon size={15} /></div>
                  <div className="category-name">{item.name}</div>
                  <div className="category-count">{item.count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="panel events-panel">
        <div className="panel-head">
          <div>
            <h2 className="panel-title">Recent Audit Events</h2>
            <p className="panel-description">
              Review and investigate recorded workspace activity.
            </p>
          </div>
          <Link href="/audit-logs/all-events" className="button">
            All events <ArrowRight size={14} />
          </Link>
        </div>

        <div className="table-toolbar">
          <label className="searchbox">
            <Search size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search actor, action, resource, IP..."
              aria-label="Search audit events"
            />
          </label>
          <div className="toolbar-actions">
            <select
              className="filter-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label="Filter by category"
            >
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select
              className="filter-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              aria-label="Filter by status"
            >
              <option>All statuses</option>
              <option>Success</option>
              <option>Failed</option>
              <option>Warning</option>
            </select>
            <button
              className="button"
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
            >
              <Filter size={14} /> More filters <ChevronDown size={13} />
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="table-toolbar">
            <span className="panel-description">
              Additional filters
            </span>
            <button
              className="button"
              onClick={() => {
                setSearch("");
                setCategory("All categories");
                setStatus("All statuses");
                setShowFilters(false);
              }}
            >
              <X size={14} /> Clear all filters
            </button>
          </div>
        )}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Actor</th>
                <th>Action / Resource</th>
                <th>Category</th>
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
                    <div className="actor">{event.actor}</div>
                    <div className="subtext">{event.email}</div>
                  </td>
                  <td>
                    <div className="actor">{event.action}</div>
                    <div className="subtext">{event.resource}</div>
                  </td>
                  <td>{event.category}</td>
                  <td>{event.ip}</td>
                  <td>
                    <span className={`status ${event.status}`}>
                      {event.status === "Success" ? (
                        <CheckCircle2 size={12} />
                      ) : event.status === "Failed" ? (
                        <X size={12} />
                      ) : (
                        <AlertTriangle size={12} />
                      )}
                      {event.status}
                    </span>
                  </td>
                  <td>{event.time}</td>
                  <td>
                    <button className="view-button" onClick={() => setSelected(event)}>
                      View <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEvents.length === 0 && (
            <div className="empty">
              No audit events match your search and filters.
            </div>
          )}
        </div>
        <div className="table-footer">
          <span>Showing {filteredEvents.length} of {events.length} sample events</span>
          <span><Clock3 size={12} style={{ display: "inline", marginRight: 5 }} />Times are illustrative</span>
        </div>
      </section>

      <section className="panel nav-panel">
        <div>
          <h2 className="panel-title">Audit Logs Management</h2>
          <p className="panel-description">
            Explore audit activity by domain or configure your audit controls.
          </p>
        </div>
        <div className="nav-grid">
          {navigation.filter((item) => item.label !== "Overview").map((item) => {
            const Icon = item.icon;
            return (
              <Link className="nav-link" href={item.href} key={item.href}>
                <Icon size={16} />
                <span>{item.label}</span>
                <ArrowRight size={13} />
              </Link>
            );
          })}
        </div>
      </section>

      {selected && (
        <div
          className="detail-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <section
            className="detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="audit-detail-title"
          >
            <div className="detail-header">
              <div>
                <div className="eyebrow">Audit event details</div>
                <h2 id="audit-detail-title" className="panel-title">
                  {selected.id}
                </h2>
              </div>
              <button
                className="close-button"
                onClick={() => setSelected(null)}
                aria-label="Close event details"
              >
                <X size={19} />
              </button>
            </div>
            <div className="detail-body">
              <div style={{ marginBottom: 20 }}>
                <span className={`status ${selected.status}`}>{selected.status}</span>
                <div className="panel-title" style={{ marginTop: 12 }}>
                  {selected.action}
                </div>
                <p className="panel-description">{selected.resource}</p>
              </div>
              <div className="detail-grid">
                <div>
                  <div className="detail-label">Actor</div>
                  <div className="detail-value">{selected.actor}</div>
                </div>
                <div>
                  <div className="detail-label">Email</div>
                  <div className="detail-value">{selected.email}</div>
                </div>
                <div>
                  <div className="detail-label">Category</div>
                  <div className="detail-value">{selected.category}</div>
                </div>
                <div>
                  <div className="detail-label">Timestamp (demo)</div>
                  <div className="detail-value">{selected.time}</div>
                </div>
                <div>
                  <div className="detail-label">IP Address (demo)</div>
                  <div className="detail-value">{selected.ip}</div>
                </div>
                <div>
                  <div className="detail-label">Resource</div>
                  <div className="detail-value">{selected.resource}</div>
                </div>
              </div>
              <div className="detail-description">
                <strong>Event description</strong>
                <p>{selected.details}</p>
                <span style={{ color: "var(--audit-muted)", fontSize: 10 }}>
                  Sample data only. Verify events against your backend audit service.
                </span>
              </div>
              <button
                className="button primary"
                style={{ marginTop: 18 }}
                onClick={() => {
                  navigator.clipboard?.writeText(
                    JSON.stringify(selected, null, 2)
                  );
                  setNotice(`Copied ${selected.id} event details.`);
                  setSelected(null);
                }}
              >
                <Download size={14} /> Copy event details
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
