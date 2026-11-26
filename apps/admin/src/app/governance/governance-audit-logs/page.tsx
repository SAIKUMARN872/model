"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDownToLine,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  Eye,
  FileText,
  Filter,
  Info,
  LockKeyhole,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  X,
  XCircle,
} from "lucide-react";

type Severity = "Critical" | "High" | "Medium" | "Low";
type Outcome = "Success" | "Denied" | "Failed";
type EventCategory =
  | "Authentication"
  | "Policy"
  | "Model"
  | "Data"
  | "Access"
  | "Configuration"
  | "Compliance";

type AuditEvent = {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  resource: string;
  category: EventCategory;
  severity: Severity;
  outcome: Outcome;
  ipAddress: string;
  description: string;
  requestId: string;
};

const initialEvents: AuditEvent[] = [
  {
    id: "AUD-10482",
    timestamp: "2026-11-04T09:42:18",
    actor: "admin@modelnow.ai",
    role: "Administrator",
    action: "Policy updated",
    resource: "Production AI Policy",
    category: "Policy",
    severity: "High",
    outcome: "Success",
    ipAddress: "10.20.4.18",
    description:
      "The production AI policy was updated. The change requires review before it can be applied to all production services.",
    requestId: "req-8f21a42c",
  },
  {
    id: "AUD-10481",
    timestamp: "2026-11-04T09:35:06",
    actor: "service-account-gateway",
    role: "Service Account",
    action: "Model inference requested",
    resource: "ModelNow Foundation 8B",
    category: "Model",
    severity: "Low",
    outcome: "Success",
    ipAddress: "10.20.8.12",
    description:
      "A model inference request was completed successfully through the AI Gateway.",
    requestId: "req-7d18c53a",
  },
  {
    id: "AUD-10480",
    timestamp: "2026-11-04T09:28:43",
    actor: "unknown-user",
    role: "Unauthenticated",
    action: "Access attempt blocked",
    resource: "Governance Console",
    category: "Authentication",
    severity: "Critical",
    outcome: "Denied",
    ipAddress: "192.0.2.44",
    description:
      "An unauthenticated request attempted to access the governance console. Access was denied by the authentication layer.",
    requestId: "req-6c04f9bd",
  },
  {
    id: "AUD-10479",
    timestamp: "2026-11-04T09:16:29",
    actor: "pujitha@modelnow.ai",
    role: "Governance Analyst",
    action: "Audit report exported",
    resource: "November Governance Report",
    category: "Compliance",
    severity: "Medium",
    outcome: "Success",
    ipAddress: "10.20.4.25",
    description:
      "A governance report export was requested from the audit reporting interface.",
    requestId: "req-5a90e72d",
  },
  {
    id: "AUD-10478",
    timestamp: "2026-11-04T09:04:51",
    actor: "ml-platform-service",
    role: "Service Account",
    action: "Model deployment attempted",
    resource: "Customer Support Model v3",
    category: "Model",
    severity: "High",
    outcome: "Failed",
    ipAddress: "10.20.9.16",
    description:
      "The deployment attempt failed because the configured approval requirement was not satisfied.",
    requestId: "req-4e61d8a7",
  },
  {
    id: "AUD-10477",
    timestamp: "2026-11-04T08:55:17",
    actor: "data-admin@modelnow.ai",
    role: "Data Administrator",
    action: "Dataset access granted",
    resource: "Customer Support Dataset",
    category: "Data",
    severity: "Medium",
    outcome: "Success",
    ipAddress: "10.20.5.11",
    description:
      "Dataset access was granted to an approved internal service account.",
    requestId: "req-3b52a6e1",
  },
  {
    id: "AUD-10476",
    timestamp: "2026-11-04T08:44:02",
    actor: "policy-engine",
    role: "System Service",
    action: "Policy enforcement",
    resource: "Sensitive Data Access Policy",
    category: "Policy",
    severity: "High",
    outcome: "Denied",
    ipAddress: "10.20.8.12",
    description:
      "The policy engine denied a request that did not satisfy the sensitive-data access requirements.",
    requestId: "req-2c41b9f0",
  },
  {
    id: "AUD-10475",
    timestamp: "2026-11-04T08:31:40",
    actor: "security-admin@modelnow.ai",
    role: "Security Administrator",
    action: "Access permissions changed",
    resource: "Governance Workspace",
    category: "Access",
    severity: "High",
    outcome: "Success",
    ipAddress: "10.20.4.18",
    description:
      "Workspace access permissions were modified by a security administrator.",
    requestId: "req-1a30c8d2",
  },
  {
    id: "AUD-10474",
    timestamp: "2026-11-04T08:17:22",
    actor: "configuration-service",
    role: "System Service",
    action: "Configuration validation",
    resource: "AI Gateway Configuration",
    category: "Configuration",
    severity: "Low",
    outcome: "Success",
    ipAddress: "10.20.8.12",
    description:
      "The AI Gateway configuration passed the configured validation checks.",
    requestId: "req-0f29b7c4",
  },
  {
    id: "AUD-10473",
    timestamp: "2026-11-04T08:02:09",
    actor: "reviewer@modelnow.ai",
    role: "Governance Reviewer",
    action: "Review submission rejected",
    resource: "Model Risk Assessment",
    category: "Compliance",
    severity: "Medium",
    outcome: "Failed",
    ipAddress: "10.20.4.33",
    description:
      "A review submission could not be completed because required assessment information was missing.",
    requestId: "req-9e18a6f3",
  },
];

const severityOptions = ["All severities", "Critical", "High", "Medium", "Low"];
const outcomeOptions = ["All outcomes", "Success", "Denied", "Failed"];
const categoryOptions = [
  "All categories",
  "Authentication",
  "Policy",
  "Model",
  "Data",
  "Access",
  "Configuration",
  "Compliance",
];

function formatTimestamp(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

function formatShortTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function escapeCsv(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function getSeverityClass(severity: Severity): string {
  switch (severity) {
    case "Critical":
      return "severity-critical";
    case "High":
      return "severity-high";
    case "Medium":
      return "severity-medium";
    default:
      return "severity-low";
  }
}

function getOutcomeClass(outcome: Outcome): string {
  switch (outcome) {
    case "Success":
      return "outcome-success";
    case "Denied":
      return "outcome-denied";
    default:
      return "outcome-failed";
  }
}

function getOutcomeIcon(outcome: Outcome) {
  switch (outcome) {
    case "Success":
      return <CheckCircle2 size={15} />;
    case "Denied":
      return <ShieldAlert size={15} />;
    default:
      return <XCircle size={15} />;
  }
}

export default function GovernanceAuditLogsPage() {
  const [events, setEvents] = useState<AuditEvent[]>(initialEvents);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All severities");
  const [outcomeFilter, setOutcomeFilter] = useState("All outcomes");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [activeTab, setActiveTab] = useState("All events");
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [exportMessage, setExportMessage] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortNewestFirst, setSortNewestFirst] = useState(true);

  const filteredEvents = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    const results = events.filter((event) => {
      const matchesSearch =
        query.length === 0 ||
        [
          event.id,
          event.actor,
          event.role,
          event.action,
          event.resource,
          event.category,
          event.severity,
          event.outcome,
          event.ipAddress,
          event.requestId,
        ].some((value) => value.toLowerCase().includes(query));

      const matchesSeverity =
        severityFilter === "All severities" ||
        event.severity === severityFilter;

      const matchesOutcome =
        outcomeFilter === "All outcomes" ||
        event.outcome === outcomeFilter;

      const matchesCategory =
        categoryFilter === "All categories" ||
        event.category === categoryFilter;

      const matchesTab =
        activeTab === "All events" ||
        (activeTab === "High risk" &&
          (event.severity === "Critical" || event.severity === "High")) ||
        (activeTab === "Access events" &&
          (event.category === "Access" ||
            event.category === "Authentication")) ||
        (activeTab === "Failed actions" && event.outcome !== "Success");

      const eventDate = new Date(event.timestamp);
      const today = new Date();
      const sameDay =
        eventDate.getFullYear() === today.getFullYear() &&
        eventDate.getMonth() === today.getMonth() &&
        eventDate.getDate() === today.getDate();

      const matchesDate =
        dateFilter === "all" ||
        (dateFilter === "today" && sameDay) ||
        (dateFilter === "7days" &&
          Date.now() - eventDate.getTime() <= 7 * 24 * 60 * 60 * 1000);

      return (
        matchesSearch &&
        matchesSeverity &&
        matchesOutcome &&
        matchesCategory &&
        matchesTab &&
        matchesDate
      );
    });

    return results.sort((a, b) => {
      const difference =
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();

      return sortNewestFirst ? -difference : difference;
    });
  }, [
    events,
    searchTerm,
    severityFilter,
    outcomeFilter,
    categoryFilter,
    activeTab,
    dateFilter,
    sortNewestFirst,
  ]);

  const criticalCount = events.filter(
    (event) => event.severity === "Critical",
  ).length;

  const deniedCount = events.filter(
    (event) => event.outcome === "Denied",
  ).length;

  const failedCount = events.filter(
    (event) => event.outcome === "Failed",
  ).length;

  const successfulCount = events.filter(
    (event) => event.outcome === "Success",
  ).length;

  const highRiskCount = events.filter(
    (event) =>
      event.severity === "Critical" || event.severity === "High",
  ).length;

  function resetFilters() {
    setSearchTerm("");
    setSeverityFilter("All severities");
    setOutcomeFilter("All outcomes");
    setCategoryFilter("All categories");
    setDateFilter("all");
    setActiveTab("All events");
  }

  function exportEvents(rows: AuditEvent[]) {
    if (rows.length === 0) {
      setExportMessage("There are no events to export.");
      return;
    }

    const headers = [
      "Event ID",
      "Timestamp",
      "Actor",
      "Role",
      "Action",
      "Resource",
      "Category",
      "Severity",
      "Outcome",
      "IP Address",
      "Request ID",
      "Description",
    ];

    const csvRows = rows.map((event) =>
      [
        event.id,
        event.timestamp,
        event.actor,
        event.role,
        event.action,
        event.resource,
        event.category,
        event.severity,
        event.outcome,
        event.ipAddress,
        event.requestId,
        event.description,
      ]
        .map((value) => escapeCsv(String(value)))
        .join(","),
    );

    const csvContent = [headers.map(escapeCsv).join(","), ...csvRows].join(
      "\r\n",
    );

    const blob = new Blob(["\uFEFF", csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `modelnow-audit-logs-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setExportMessage(`${rows.length} event(s) exported successfully.`);
  }

  function refreshEvents() {
    setEvents((current) => [...current]);
    setExportMessage("Audit log view refreshed.");
  }

  function closeDetails() {
    setSelectedEvent(null);
  }

  return (
    <main className="audit-page">
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        .audit-page {
          min-height: 100vh;
          padding: 30px;
          background: #f7f8fc;
          color: #172033;
          font-family:
            Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
            "Segoe UI", sans-serif;
        }

        .audit-container {
          max-width: 1600px;
          margin: 0 auto;
        }

        .audit-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 22px;
          color: #778197;
          font-size: 12px;
        }

        .audit-breadcrumb strong {
          color: #344054;
          font-weight: 600;
        }

        .audit-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 25px;
        }

        .audit-heading {
          display: flex;
          gap: 14px;
          align-items: flex-start;
        }

        .audit-heading-icon {
          display: grid;
          place-items: center;
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          color: #315fe9;
          background: #e9efff;
          border: 1px solid #d9e4ff;
          border-radius: 14px;
        }

        .audit-title {
          margin: 0;
          font-size: 27px;
          font-weight: 750;
          letter-spacing: -0.8px;
          color: #151d31;
        }

        .audit-subtitle {
          margin: 7px 0 0;
          color: #7b8498;
          font-size: 13px;
          line-height: 1.7;
          max-width: 670px;
        }

        .audit-header-actions {
          display: flex;
          align-items: center;
          gap: 9px;
          flex-wrap: wrap;
        }

        .audit-btn {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          min-height: 39px;
          padding: 0 13px;
          border: 1px solid #dfe4ee;
          border-radius: 9px;
          background: #fff;
          color: #344054;
          font-size: 12px;
          font-weight: 650;
          cursor: pointer;
          transition:
            background 0.18s ease,
            border-color 0.18s ease,
            transform 0.18s ease;
        }

        .audit-btn:hover {
          background: #f8faff;
          border-color: #b8c8f4;
        }

        .audit-btn:active {
          transform: translateY(1px);
        }

        .audit-btn-primary {
          color: #fff;
          background: #315fe9;
          border-color: #315fe9;
        }

        .audit-btn-primary:hover {
          background: #244ed0;
          border-color: #244ed0;
        }

        .audit-btn:focus-visible,
        .audit-search:focus-visible,
        .audit-select:focus-visible,
        .audit-tab:focus-visible {
          outline: 3px solid #b8c8ff;
          outline-offset: 2px;
        }

        .audit-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 22px;
        }

        .audit-metric {
          padding: 19px;
          min-width: 0;
          background: #fff;
          border: 1px solid #e8ebf2;
          border-radius: 13px;
          box-shadow: 0 2px 5px rgba(22, 34, 58, 0.02);
        }

        .audit-metric-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
        }

        .audit-metric-label {
          color: #7b8498;
          font-size: 12px;
          font-weight: 550;
        }

        .audit-metric-icon {
          display: grid;
          place-items: center;
          width: 35px;
          height: 35px;
          border-radius: 10px;
        }

        .metric-blue {
          color: #315fe9;
          background: #edf2ff;
        }

        .metric-red {
          color: #dc3f4b;
          background: #fff0f0;
        }

        .metric-amber {
          color: #c78217;
          background: #fff6e5;
        }

        .metric-green {
          color: #19845c;
          background: #e8f8f0;
        }

        .audit-metric-value {
          font-size: 29px;
          font-weight: 760;
          line-height: 1.2;
          letter-spacing: -0.8px;
          color: #172033;
          font-variant-numeric: tabular-nums;
        }

        .audit-metric-caption {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 9px;
          color: #929bad;
          font-size: 11px;
        }

        .audit-panel {
          overflow: hidden;
          background: #fff;
          border: 1px solid #e6eaf2;
          border-radius: 14px;
          box-shadow: 0 2px 5px rgba(22, 34, 58, 0.025);
        }

        .audit-panel-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
          padding: 21px 22px 17px;
        }

        .audit-panel-title {
          margin: 0;
          font-size: 15px;
          font-weight: 730;
          color: #202a40;
        }

        .audit-panel-description {
          margin: 6px 0 0;
          color: #8a93a6;
          font-size: 12px;
          line-height: 1.6;
        }

        .audit-live-indicator {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 10px;
          color: #19845c;
          background: #ecf9f2;
          border: 1px solid #d6f0e2;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 650;
          white-space: nowrap;
        }

        .audit-live-dot {
          width: 7px;
          height: 7px;
          background: #20a66d;
          border-radius: 50%;
        }

        .audit-tabs {
          display: flex;
          align-items: center;
          gap: 23px;
          padding: 0 22px;
          border-bottom: 1px solid #edf0f5;
          overflow-x: auto;
        }

        .audit-tab {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 13px 0;
          border: 0;
          background: transparent;
          color: #818a9e;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          cursor: pointer;
        }

        .audit-tab.active {
          color: #315fe9;
        }

        .audit-tab.active::after {
          position: absolute;
          right: 0;
          bottom: -1px;
          left: 0;
          height: 2px;
          background: #315fe9;
          content: "";
        }

        .audit-tab-count {
          display: inline-grid;
          place-items: center;
          min-width: 20px;
          height: 20px;
          padding: 0 5px;
          color: #6f7b90;
          background: #f0f2f7;
          border-radius: 6px;
          font-size: 10px;
        }

        .audit-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 16px 22px;
          border-bottom: 1px solid #edf0f5;
        }

        .audit-search-wrap {
          position: relative;
          flex: 1;
          max-width: 460px;
        }

        .audit-search-icon {
          position: absolute;
          top: 50%;
          left: 12px;
          color: #929bad;
          transform: translateY(-50%);
          pointer-events: none;
        }

        .audit-search {
          width: 100%;
          height: 39px;
          padding: 0 13px 0 37px;
          color: #344054;
          background: #fbfcfe;
          border: 1px solid #e2e6ef;
          border-radius: 9px;
          outline: none;
          font: inherit;
          font-size: 12px;
        }

        .audit-search:focus {
          border-color: #9db3ff;
          background: #fff;
        }

        .audit-search::placeholder {
          color: #a1a8b7;
        }

        .audit-toolbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .audit-filter-panel {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr)) auto;
          gap: 12px;
          align-items: end;
          padding: 16px 22px;
          background: #fafbfe;
          border-bottom: 1px solid #edf0f5;
        }

        .audit-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
          min-width: 0;
        }

        .audit-field label {
          color: #778197;
          font-size: 11px;
          font-weight: 650;
        }

        .audit-select {
          width: 100%;
          height: 38px;
          padding: 0 10px;
          color: #344054;
          background: #fff;
          border: 1px solid #e0e5ef;
          border-radius: 8px;
          outline: none;
          font: inherit;
          font-size: 12px;
        }

        .audit-table-wrap {
          width: 100%;
          overflow-x: auto;
        }

        .audit-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .audit-table thead {
          background: #fafbfe;
        }

        .audit-table th {
          padding: 13px 15px;
          color: #8a93a6;
          border-bottom: 1px solid #edf0f5;
          font-size: 10px;
          font-weight: 750;
          letter-spacing: 0.55px;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .audit-table td {
          padding: 15px;
          border-bottom: 1px solid #f0f2f7;
          color: #465168;
          font-size: 12px;
          vertical-align: middle;
        }

        .audit-table tbody tr {
          transition: background 0.15s ease;
        }

        .audit-table tbody tr:hover {
          background: #fafbff;
        }

        .audit-table tbody tr:last-child td {
          border-bottom: none;
        }

        .audit-event-id {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: #315fe9;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        .audit-event-dot {
          width: 7px;
          height: 7px;
          flex-shrink: 0;
          border-radius: 50%;
        }

        .dot-critical {
          background: #df3947;
        }

        .dot-high {
          background: #e69a24;
        }

        .dot-medium {
          background: #4f79e8;
        }

        .dot-low {
          background: #20a66d;
        }

        .audit-time {
          display: flex;
          flex-direction: column;
          gap: 4px;
          white-space: nowrap;
        }

        .audit-time-main {
          color: #344054;
          font-weight: 600;
        }

        .audit-time-date {
          color: #98a0b0;
          font-size: 10px;
        }

        .audit-actor {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 175px;
        }

        .audit-avatar {
          display: grid;
          place-items: center;
          width: 31px;
          height: 31px;
          flex-shrink: 0;
          color: #4969c8;
          background: #edf1ff;
          border: 1px solid #e0e7ff;
          border-radius: 9px;
          font-size: 11px;
          font-weight: 750;
          text-transform: uppercase;
        }

        .audit-actor-name {
          max-width: 180px;
          overflow: hidden;
          color: #344054;
          font-size: 11px;
          font-weight: 650;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .audit-actor-role {
          margin-top: 4px;
          color: #929bad;
          font-size: 10px;
        }

        .audit-action-name {
          min-width: 155px;
          color: #344054;
          font-weight: 650;
        }

        .audit-resource {
          max-width: 200px;
          color: #69758b;
          line-height: 1.6;
        }

        .audit-category {
          display: inline-flex;
          padding: 5px 8px;
          color: #647087;
          background: #f3f5f9;
          border: 1px solid #e9edf3;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 650;
          white-space: nowrap;
        }

        .audit-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 8px;
          border: 1px solid transparent;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
        }

        .severity-critical {
          color: #c52f3e;
          background: #fff0f1;
          border-color: #ffdce0;
        }

        .severity-high {
          color: #b86b0d;
          background: #fff6e8;
          border-color: #ffe7c4;
        }

        .severity-medium {
          color: #315fd0;
          background: #eef3ff;
          border-color: #dce6ff;
        }

        .severity-low {
          color: #16845b;
          background: #eaf9f1;
          border-color: #d3f1e0;
        }

        .outcome-success {
          color: #16845b;
          background: #eaf9f1;
          border-color: #d3f1e0;
        }

        .outcome-denied {
          color: #c52f3e;
          background: #fff0f1;
          border-color: #ffdce0;
        }

        .outcome-failed {
          color: #b86b0d;
          background: #fff6e8;
          border-color: #ffe7c4;
        }

        .audit-view-btn {
          display: grid;
          place-items: center;
          width: 31px;
          height: 31px;
          color: #7d879b;
          background: #fff;
          border: 1px solid #e6eaf2;
          border-radius: 8px;
          cursor: pointer;
        }

        .audit-view-btn:hover {
          color: #315fe9;
          background: #f0f4ff;
          border-color: #d7e1ff;
        }

        .audit-empty {
          padding: 55px 20px;
          text-align: center;
        }

        .audit-empty-icon {
          display: grid;
          place-items: center;
          width: 47px;
          height: 47px;
          margin: 0 auto 13px;
          color: #8390a8;
          background: #f1f3f8;
          border-radius: 14px;
        }

        .audit-empty h3 {
          margin: 0;
          color: #344054;
          font-size: 14px;
        }

        .audit-empty p {
          margin: 7px 0 16px;
          color: #8a93a6;
          font-size: 12px;
        }

        .audit-table-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 15px 22px;
          color: #8992a5;
          border-top: 1px solid #edf0f5;
          font-size: 11px;
        }

        .audit-footer-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .audit-footer-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 9px;
          color: #69758b;
          background: #f6f7fb;
          border: 1px solid #e9edf4;
          border-radius: 7px;
        }

        .audit-notice {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 14px;
          padding: 11px 14px;
          color: #68758d;
          background: #f0f4ff;
          border: 1px solid #dfe7ff;
          border-radius: 9px;
          font-size: 11px;
          line-height: 1.6;
        }

        .audit-toast {
          position: fixed;
          right: 24px;
          bottom: 24px;
          z-index: 120;
          display: flex;
          align-items: center;
          gap: 10px;
          max-width: calc(100vw - 40px);
          padding: 13px 16px;
          color: #fff;
          background: #202b43;
          border: 1px solid #36435d;
          border-radius: 11px;
          box-shadow: 0 10px 35px rgba(20, 30, 50, 0.2);
          font-size: 12px;
        }

        .audit-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          background: rgba(19, 28, 47, 0.48);
          backdrop-filter: blur(3px);
        }

        .audit-modal {
          width: 100%;
          max-width: 660px;
          max-height: 90vh;
          overflow-y: auto;
          background: #fff;
          border: 1px solid #e8ebf2;
          border-radius: 16px;
          box-shadow: 0 24px 80px rgba(14, 25, 45, 0.24);
        }

        .audit-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
          padding: 23px;
          border-bottom: 1px solid #edf0f5;
        }

        .audit-modal-heading {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .audit-modal-icon {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          color: #315fe9;
          background: #edf2ff;
          border-radius: 12px;
        }

        .audit-modal-title {
          margin: 0;
          color: #172033;
          font-size: 18px;
          font-weight: 750;
        }

        .audit-modal-subtitle {
          margin: 6px 0 0;
          color: #8a93a6;
          font-size: 11px;
        }

        .audit-modal-close {
          display: grid;
          place-items: center;
          width: 33px;
          height: 33px;
          flex-shrink: 0;
          color: #778197;
          background: #f6f7fa;
          border: 1px solid #e8ebf2;
          border-radius: 9px;
          cursor: pointer;
        }

        .audit-modal-close:hover {
          color: #344054;
          background: #eef1f7;
        }

        .audit-modal-body {
          padding: 22px 23px;
        }

        .audit-modal-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 22px;
        }

        .audit-detail-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .audit-detail {
          min-width: 0;
          padding: 13px;
          background: #fafbfe;
          border: 1px solid #edf0f5;
          border-radius: 10px;
        }

        .audit-detail-label {
          margin-bottom: 8px;
          color: #929bad;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.45px;
          text-transform: uppercase;
        }

        .audit-detail-value {
          overflow-wrap: anywhere;
          color: #344054;
          font-size: 12px;
          font-weight: 650;
          line-height: 1.6;
        }

        .audit-description-box {
          margin-top: 17px;
          padding: 15px;
          background: #f8faff;
          border: 1px solid #e5ebff;
          border-radius: 10px;
        }

        .audit-description-title {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 8px;
          color: #405a9c;
          font-size: 11px;
          font-weight: 750;
        }

        .audit-description-text {
          margin: 0;
          color: #65718a;
          font-size: 12px;
          line-height: 1.8;
        }

        .audit-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          padding: 16px 23px;
          border-top: 1px solid #edf0f5;
        }

        @media (max-width: 1100px) {
          .audit-page {
            padding: 23px;
          }

          .audit-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .audit-filter-panel {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .audit-table th,
          .audit-table td {
            padding-right: 12px;
            padding-left: 12px;
          }
        }

        @media (max-width: 700px) {
          .audit-page {
            padding: 16px;
          }

          .audit-header {
            flex-direction: column;
          }

          .audit-header-actions {
            width: 100%;
          }

          .audit-header-actions .audit-btn {
            flex: 1;
          }

          .audit-title {
            font-size: 23px;
          }

          .audit-metrics {
            gap: 10px;
          }

          .audit-metric {
            padding: 14px;
          }

          .audit-metric-value {
            font-size: 25px;
          }

          .audit-panel-heading {
            padding: 17px;
          }

          .audit-tabs {
            gap: 17px;
            padding: 0 17px;
          }

          .audit-toolbar {
            align-items: stretch;
            flex-direction: column;
            padding: 14px 17px;
          }

          .audit-search-wrap {
            max-width: none;
          }

          .audit-toolbar-actions .audit-btn {
            flex: 1;
          }

          .audit-filter-panel {
            grid-template-columns: 1fr;
            padding: 15px 17px;
          }

          .audit-table-footer {
            align-items: flex-start;
            flex-direction: column;
            padding: 14px 17px;
          }

          .audit-detail-grid {
            grid-template-columns: 1fr;
          }

          .audit-modal-header,
          .audit-modal-body,
          .audit-modal-footer {
            padding: 17px;
          }
        }

        @media (max-width: 390px) {
          .audit-metrics {
            grid-template-columns: 1fr;
          }

          .audit-heading-icon {
            width: 41px;
            height: 41px;
          }

          .audit-title {
            font-size: 21px;
          }

          .audit-live-indicator {
            display: none;
          }
        }
      `}</style>

      <div className="audit-container">
        <div className="audit-breadcrumb">
          <span>ModelNow</span>
          <span>/</span>
          <span>Governance</span>
          <span>/</span>
          <strong>Audit Logs</strong>
        </div>

        <header className="audit-header">
          <div className="audit-heading">
            <div className="audit-heading-icon">
              <Activity size={23} />
            </div>

            <div>
              <h1 className="audit-title">Governance Audit Logs</h1>
              <p className="audit-subtitle">
                Monitor governance activities, review security events, and
                inspect policy, model, data, and access changes across
                ModelNow.
              </p>
            </div>
          </div>

          <div className="audit-header-actions">
            <button
              type="button"
              className="audit-btn"
              onClick={refreshEvents}
            >
              <RefreshCw size={15} />
              Refresh
            </button>

            <button
              type="button"
              className="audit-btn audit-btn-primary"
              onClick={() => exportEvents(filteredEvents)}
            >
              <Download size={15} />
              Export CSV
            </button>
          </div>
        </header>

        <section className="audit-metrics">
          <div className="audit-metric">
            <div className="audit-metric-top">
              <span className="audit-metric-label">Total audit events</span>
              <div className="audit-metric-icon metric-blue">
                <FileText size={18} />
              </div>
            </div>
            <div className="audit-metric-value">{events.length}</div>
            <div className="audit-metric-caption">
              <Activity size={13} />
              Events in this demo dataset
            </div>
          </div>

          <div className="audit-metric">
            <div className="audit-metric-top">
              <span className="audit-metric-label">Critical events</span>
              <div className="audit-metric-icon metric-red">
                <AlertTriangle size={18} />
              </div>
            </div>
            <div className="audit-metric-value">{criticalCount}</div>
            <div className="audit-metric-caption">
              <AlertCircle size={13} />
              Require security attention
            </div>
          </div>

          <div className="audit-metric">
            <div className="audit-metric-top">
              <span className="audit-metric-label">Denied actions</span>
              <div className="audit-metric-icon metric-amber">
                <LockKeyhole size={18} />
              </div>
            </div>
            <div className="audit-metric-value">{deniedCount}</div>
            <div className="audit-metric-caption">
              Access or policy restrictions
            </div>
          </div>

          <div className="audit-metric">
            <div className="audit-metric-top">
              <span className="audit-metric-label">Successful actions</span>
              <div className="audit-metric-icon metric-green">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="audit-metric-value">{successfulCount}</div>
            <div className="audit-metric-caption">
              {failedCount} failed action(s) recorded
            </div>
          </div>
        </section>

        <section className="audit-panel">
          <div className="audit-panel-heading">
            <div>
              <h2 className="audit-panel-title">Audit event explorer</h2>
              <p className="audit-panel-description">
                Search, filter, and inspect governance-related events.
              </p>
            </div>

            <div className="audit-live-indicator">
              <span className="audit-live-dot" />
              Demo data
            </div>
          </div>

          <div className="audit-tabs" role="tablist" aria-label="Audit views">
            {[
              { label: "All events", count: events.length },
              { label: "High risk", count: highRiskCount },
              {
                label: "Access events",
                count: events.filter(
                  (event) =>
                    event.category === "Access" ||
                    event.category === "Authentication",
                ).length,
              },
              {
                label: "Failed actions",
                count: events.filter((event) => event.outcome !== "Success")
                  .length,
              },
            ].map((tab) => (
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === tab.label}
                key={tab.label}
                className={`audit-tab ${
                  activeTab === tab.label ? "active" : ""
                }`}
                onClick={() => setActiveTab(tab.label)}
              >
                {tab.label}
                <span className="audit-tab-count">{tab.count}</span>
              </button>
            ))}
          </div>

          <div className="audit-toolbar">
            <div className="audit-search-wrap">
              <Search className="audit-search-icon" size={16} />
              <input
                type="search"
                className="audit-search"
                placeholder="Search event ID, actor, action, resource..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                aria-label="Search audit events"
              />
            </div>

            <div className="audit-toolbar-actions">
              <button
                type="button"
                className="audit-btn"
                onClick={() => setShowFilters((current) => !current)}
                aria-expanded={showFilters}
              >
                <Filter size={15} />
                Filters
                <ChevronDown
                  size={14}
                  style={{
                    transform: showFilters ? "rotate(180deg)" : "rotate(0)",
                    transition: "transform 0.2s ease",
                  }}
                />
              </button>

              <button
                type="button"
                className="audit-btn"
                onClick={() => setSortNewestFirst((current) => !current)}
                title="Change sort order"
              >
                <Clock3 size={15} />
                {sortNewestFirst ? "Newest first" : "Oldest first"}
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="audit-filter-panel">
              <div className="audit-field">
                <label htmlFor="audit-severity">Severity</label>
                <select
                  id="audit-severity"
                  className="audit-select"
                  value={severityFilter}
                  onChange={(event) => setSeverityFilter(event.target.value)}
                >
                  {severityOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="audit-field">
                <label htmlFor="audit-outcome">Outcome</label>
                <select
                  id="audit-outcome"
                  className="audit-select"
                  value={outcomeFilter}
                  onChange={(event) => setOutcomeFilter(event.target.value)}
                >
                  {outcomeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="audit-field">
                <label htmlFor="audit-category">Category</label>
                <select
                  id="audit-category"
                  className="audit-select"
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                >
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className="audit-field">
                <label htmlFor="audit-date">Time range</label>
                <select
                  id="audit-date"
                  className="audit-select"
                  value={dateFilter}
                  onChange={(event) => setDateFilter(event.target.value)}
                >
                  <option value="all">All dates</option>
                  <option value="today">Today</option>
                  <option value="7days">Last 7 days</option>
                </select>
              </div>

              <button
                type="button"
                className="audit-btn"
                onClick={resetFilters}
              >
                <X size={14} />
                Reset
              </button>
            </div>
          )}

          <div className="audit-table-wrap">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Action / Resource</th>
                  <th>Category</th>
                  <th>Severity</th>
                  <th>Outcome</th>
                  <th>Details</th>
                </tr>
              </thead>

              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <span className="audit-event-id">
                        <span
                          className={`audit-event-dot dot-${event.severity.toLowerCase()}`}
                        />
                        {event.id}
                      </span>
                    </td>

                    <td>
                      <div className="audit-time">
                        <span className="audit-time-main">
                          {formatShortTime(event.timestamp)}
                        </span>
                        <span className="audit-time-date">
                          {new Date(event.timestamp).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                            },
                          )}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="audit-actor">
                        <div className="audit-avatar">
                          {event.actor.slice(0, 2)}
                        </div>
                        <div>
                          <div className="audit-actor-name">{event.actor}</div>
                          <div className="audit-actor-role">{event.role}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="audit-action-name">{event.action}</div>
                      <div className="audit-resource">{event.resource}</div>
                    </td>

                    <td>
                      <span className="audit-category">{event.category}</span>
                    </td>

                    <td>
                      <span
                        className={`audit-badge ${getSeverityClass(
                          event.severity,
                        )}`}
                      >
                        {event.severity}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`audit-badge ${getOutcomeClass(
                          event.outcome,
                        )}`}
                      >
                        {getOutcomeIcon(event.outcome)}
                        {event.outcome}
                      </span>
                    </td>

                    <td>
                      <button
                        type="button"
                        className="audit-view-btn"
                        aria-label={`View details for ${event.id}`}
                        title="View event details"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredEvents.length === 0 && (
              <div className="audit-empty">
                <div className="audit-empty-icon">
                  <Search size={21} />
                </div>
                <h3>No audit events found</h3>
                <p>
                  Try a different search term or change the selected filters.
                </p>
                <button
                  type="button"
                  className="audit-btn"
                  onClick={resetFilters}
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          <div className="audit-table-footer">
            <span>
              Showing {filteredEvents.length} of {events.length} events
            </span>

            <div className="audit-footer-right">
              <span className="audit-footer-chip">
                <Shield size={13} />
                Governance monitoring
              </span>
              <span className="audit-footer-chip">
                <CalendarDays size={13} />
                Local demo dataset
              </span>
            </div>
          </div>
        </section>

        <div className="audit-notice">
          <Info size={15} />
          This page currently uses sample frontend data. Connect the audit-log
          API and server-side authorization before using it for production
          compliance or security monitoring.
        </div>
      </div>

      {exportMessage && (
        <div className="audit-toast" role="status">
          <Check size={16} />
          <span>{exportMessage}</span>
          <button
            type="button"
            onClick={() => setExportMessage("")}
            aria-label="Dismiss notification"
            style={{
              display: "grid",
              placeItems: "center",
              marginLeft: 5,
              color: "#fff",
              background: "transparent",
              border: 0,
              cursor: "pointer",
            }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {selectedEvent && (
        <div
          className="audit-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDetails();
            }
          }}
        >
          <section
            className="audit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="audit-modal-title"
          >
            <div className="audit-modal-header">
              <div className="audit-modal-heading">
                <div className="audit-modal-icon">
                  <FileText size={21} />
                </div>
                <div>
                  <h2 id="audit-modal-title" className="audit-modal-title">
                    Audit event details
                  </h2>
                  <p className="audit-modal-subtitle">
                    Event ID: {selectedEvent.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="audit-modal-close"
                onClick={closeDetails}
                aria-label="Close event details"
              >
                <X size={17} />
              </button>
            </div>

            <div className="audit-modal-body">
              <div className="audit-modal-badges">
                <span
                  className={`audit-badge ${getSeverityClass(
                    selectedEvent.severity,
                  )}`}
                >
                  <AlertTriangle size={13} />
                  {selectedEvent.severity} severity
                </span>

                <span
                  className={`audit-badge ${getOutcomeClass(
                    selectedEvent.outcome,
                  )}`}
                >
                  {getOutcomeIcon(selectedEvent.outcome)}
                  {selectedEvent.outcome}
                </span>

                <span className="audit-category">
                  {selectedEvent.category}
                </span>
              </div>

              <div className="audit-detail-grid">
                <div className="audit-detail">
                  <div className="audit-detail-label">Timestamp</div>
                  <div className="audit-detail-value">
                    {formatTimestamp(selectedEvent.timestamp)}
                  </div>
                </div>

                <div className="audit-detail">
                  <div className="audit-detail-label">Action</div>
                  <div className="audit-detail-value">
                    {selectedEvent.action}
                  </div>
                </div>

                <div className="audit-detail">
                  <div className="audit-detail-label">Actor</div>
                  <div className="audit-detail-value">
                    {selectedEvent.actor}
                  </div>
                </div>

                <div className="audit-detail">
                  <div className="audit-detail-label">Role</div>
                  <div className="audit-detail-value">
                    {selectedEvent.role}
                  </div>
                </div>

                <div className="audit-detail">
                  <div className="audit-detail-label">Resource</div>
                  <div className="audit-detail-value">
                    {selectedEvent.resource}
                  </div>
                </div>

                <div className="audit-detail">
                  <div className="audit-detail-label">IP address</div>
                  <div className="audit-detail-value">
                    {selectedEvent.ipAddress}
                  </div>
                </div>

                <div className="audit-detail">
                  <div className="audit-detail-label">Request ID</div>
                  <div className="audit-detail-value">
                    {selectedEvent.requestId}
                  </div>
                </div>

                <div className="audit-detail">
                  <div className="audit-detail-label">Event category</div>
                  <div className="audit-detail-value">
                    {selectedEvent.category}
                  </div>
                </div>
              </div>

              <div className="audit-description-box">
                <div className="audit-description-title">
                  <Info size={14} />
                  Event description
                </div>
                <p className="audit-description-text">
                  {selectedEvent.description}
                </p>
              </div>
            </div>

            <div className="audit-modal-footer">
              <button
                type="button"
                className="audit-btn"
                onClick={closeDetails}
              >
                Close
              </button>

              <button
                type="button"
                className="audit-btn audit-btn-primary"
                onClick={() => exportEvents([selectedEvent])}
              >
                <ArrowDownToLine size={15} />
                Export event
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}