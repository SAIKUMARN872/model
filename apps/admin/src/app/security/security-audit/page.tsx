
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDownToLine,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Download,
  FileCheck2,
  FileSearch,
  Filter,
  History,
  LockKeyhole,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  X,
} from "lucide-react";

type AuditSeverity = "Critical" | "High" | "Medium" | "Low";
type AuditStatus = "Open" | "In Review" | "Resolved";

type AuditEvent = {
  id: string;
  time: string;
  actor: string;
  action: string;
  resource: string;
  category: string;
  severity: AuditSeverity;
  status: AuditStatus;
  details: string;
};

type ComplianceCheck = {
  id: string;
  title: string;
  category: string;
  description: string;
  status: "Passed" | "Needs Review" | "Failed";
};

const initialAuditEvents: AuditEvent[] = [
  {
    id: "AUD-2081",
    time: "14:42:18",
    actor: "admin@modelnow.ai",
    action: "Security configuration updated",
    resource: "Network Security",
    category: "Configuration",
    severity: "High",
    status: "In Review",
    details:
      "A network security configuration was updated in the demonstration audit feed. Verify the real configuration change and its approval in your backend audit records.",
  },
  {
    id: "AUD-2080",
    time: "14:35:42",
    actor: "system",
    action: "Authentication failure detected",
    resource: "Identity Authentication",
    category: "Authentication",
    severity: "Critical",
    status: "Open",
    details:
      "A simulated authentication failure was recorded. Check the identity provider logs and authentication events to determine whether the activity is suspicious.",
  },
  {
    id: "AUD-2079",
    time: "14:28:05",
    actor: "pujitha@modelnow.ai",
    action: "Knowledge document accessed",
    resource: "Knowledge Hub",
    category: "Data Access",
    severity: "Medium",
    status: "Resolved",
    details:
      "A sample knowledge resource access event was recorded. A production implementation should capture the document identifier, user permissions, and access result.",
  },
  {
    id: "AUD-2078",
    time: "14:19:31",
    actor: "system",
    action: "API rate limit triggered",
    resource: "AI Gateway",
    category: "API Security",
    severity: "High",
    status: "In Review",
    details:
      "The sample event indicates that a configured API rate limit was reached. Confirm the request counts, client identity, and gateway enforcement logs.",
  },
  {
    id: "AUD-2077",
    time: "14:11:09",
    actor: "admin@modelnow.ai",
    action: "User permission reviewed",
    resource: "Access Control",
    category: "Access Control",
    severity: "Low",
    status: "Resolved",
    details:
      "A sample access review was marked completed. In production, retain the reviewer, permissions before and after review, timestamp, and approval evidence.",
  },
  {
    id: "AUD-2076",
    time: "13:58:44",
    actor: "system",
    action: "Audit log retention check",
    resource: "Governance",
    category: "Compliance",
    severity: "Medium",
    status: "Open",
    details:
      "A sample retention check requires review. Connect the actual log storage configuration and retention policy to validate compliance.",
  },
  {
    id: "AUD-2075",
    time: "13:45:20",
    actor: "admin@modelnow.ai",
    action: "Encryption policy reviewed",
    resource: "Data Protection",
    category: "Data Protection",
    severity: "Low",
    status: "Resolved",
    details:
      "A sample encryption policy review was recorded. Production verification should inspect the applicable storage, transport, and key-management configurations.",
  },
];

const initialComplianceChecks: ComplianceCheck[] = [
  {
    id: "CMP-01",
    title: "Access control review",
    category: "Identity",
    description:
      "Review user permissions and ensure access follows least-privilege principles.",
    status: "Passed",
  },
  {
    id: "CMP-02",
    title: "Authentication controls",
    category: "Identity",
    description:
      "Verify sign-in protections, MFA policies, and authentication logging.",
    status: "Needs Review",
  },
  {
    id: "CMP-03",
    title: "Audit log retention",
    category: "Governance",
    description:
      "Confirm retention duration, access restrictions, and audit log integrity.",
    status: "Needs Review",
  },
  {
    id: "CMP-04",
    title: "Data encryption",
    category: "Data Protection",
    description:
      "Verify encryption in transit and at rest for applicable data stores.",
    status: "Passed",
  },
  {
    id: "CMP-05",
    title: "Incident response readiness",
    category: "Operations",
    description:
      "Review incident escalation, ownership, and evidence preservation procedures.",
    status: "Failed",
  },
  {
    id: "CMP-06",
    title: "API security controls",
    category: "API Security",
    description:
      "Review API authentication, rate limits, and access policies.",
    status: "Passed",
  },
];

const severityStyles: Record<AuditSeverity, string> = {
  Critical: "sa-critical",
  High: "sa-high",
  Medium: "sa-medium",
  Low: "sa-low",
};

const statusStyles: Record<AuditStatus, string> = {
  Open: "sa-open",
  "In Review": "sa-review",
  Resolved: "sa-resolved",
};

const complianceStyles: Record<ComplianceCheck["status"], string> = {
  Passed: "sa-passed",
  "Needs Review": "sa-needs-review",
  Failed: "sa-failed",
};

export default function SecurityAuditPage() {
  const [events, setEvents] = useState(initialAuditEvents);
  const [checks, setChecks] = useState(initialComplianceChecks);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [selectedCheck, setSelectedCheck] =
    useState<ComplianceCheck | null>(null);
  const [activeTab, setActiveTab] = useState<"events" | "compliance">("events");
  const [lastRefresh, setLastRefresh] = useState("Just now");
  const [notice, setNotice] = useState("");

  const metrics = useMemo(() => {
    return {
      total: events.length,
      open: events.filter((event) => event.status === "Open").length,
      critical: events.filter((event) => event.severity === "Critical").length,
      resolved: events.filter((event) => event.status === "Resolved").length,
      passed: checks.filter((check) => check.status === "Passed").length,
      needsReview: checks.filter(
        (check) => check.status === "Needs Review"
      ).length,
      failed: checks.filter((check) => check.status === "Failed").length,
    };
  }, [events, checks]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(events.map((event) => event.category)))],
    [events]
  );

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return events.filter((event) => {
      const matchesSearch =
        !query ||
        [
          event.id,
          event.actor,
          event.action,
          event.resource,
          event.category,
          event.severity,
          event.status,
        ].some((value) => value.toLowerCase().includes(query));

      return (
        matchesSearch &&
        (severityFilter === "All" || event.severity === severityFilter) &&
        (statusFilter === "All" || event.status === statusFilter) &&
        (categoryFilter === "All" || event.category === categoryFilter)
      );
    });
  }, [events, search, severityFilter, statusFilter, categoryFilter]);

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  }

  function refreshAudit() {
    setLastRefresh("Just now");
    showNotice("Audit view refreshed.");
  }

  function updateEventStatus(id: string, status: AuditStatus) {
    setEvents((current) =>
      current.map((event) => (event.id === id ? { ...event, status } : event))
    );

    setSelectedEvent((current) =>
      current && current.id === id ? { ...current, status } : current
    );

    showNotice(`${id} marked as ${status}.`);
  }

  function updateComplianceStatus(
    id: string,
    status: ComplianceCheck["status"]
  ) {
    setChecks((current) =>
      current.map((check) => (check.id === id ? { ...check, status } : check))
    );

    setSelectedCheck((current) =>
      current && current.id === id ? { ...current, status } : current
    );

    showNotice(`Compliance check ${id} updated.`);
  }

  function exportAudit() {
    const headers = [
      "ID",
      "Time",
      "Actor",
      "Action",
      "Resource",
      "Category",
      "Severity",
      "Status",
      "Details",
    ];

    const rows = filteredEvents.map((event) => [
      event.id,
      event.time,
      event.actor,
      event.action,
      event.resource,
      event.category,
      event.severity,
      event.status,
      event.details,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "modelnow-security-audit.csv";
    anchor.click();

    URL.revokeObjectURL(url);
    showNotice("Audit log CSV exported.");
  }

  function exportCompliance() {
    const headers = ["ID", "Control", "Category", "Description", "Status"];

    const rows = checks.map((check) => [
      check.id,
      check.title,
      check.category,
      check.description,
      check.status,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "modelnow-compliance-checks.csv";
    anchor.click();

    URL.revokeObjectURL(url);
    showNotice("Compliance report exported.");
  }

  function resetFilters() {
    setSearch("");
    setSeverityFilter("All");
    setStatusFilter("All");
    setCategoryFilter("All");
  }

  return (
    <main className="sa-page">
      <style jsx global>{`
        .sa-page {
          --sa-bg: #f6f8fc;
          --sa-card: #ffffff;
          --sa-text: #172033;
          --sa-muted: #758096;
          --sa-border: #e6eaf1;
          --sa-blue: #315fea;
          min-height: 100vh;
          padding: 30px;
          background: var(--sa-bg);
          color: var(--sa-text);
          font-family: Arial, Helvetica, sans-serif;
        }

        .sa-page * {
          box-sizing: border-box;
        }

        .sa-page button,
        .sa-page input,
        .sa-page select {
          font: inherit;
        }

        .sa-page button {
          cursor: pointer;
        }

        .sa-container {
          max-width: 1600px;
          margin: 0 auto;
        }

        .sa-topbar,
        .sa-heading,
        .sa-section-heading,
        .sa-card-heading,
        .sa-drawer-heading,
        .sa-compliance-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .sa-topbar {
          margin-bottom: 32px;
        }

        .sa-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .sa-brand-icon {
          display: grid;
          place-items: center;
          width: 45px;
          height: 45px;
          border-radius: 14px;
          background: #e7edff;
          color: var(--sa-blue);
        }

        .sa-brand-name {
          margin: 0;
          font-size: 17px;
          font-weight: 800;
        }

        .sa-brand-subtitle {
          margin: 5px 0 0;
          color: var(--sa-muted);
          font-size: 12px;
        }

        .sa-actions,
        .sa-button-row,
        .sa-inline {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .sa-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 40px;
          padding: 9px 13px;
          border: 1px solid var(--sa-border);
          border-radius: 10px;
          background: #fff;
          color: #344054;
          font-size: 12px;
          font-weight: 700;
          transition: background 0.15s, border-color 0.15s;
        }

        .sa-button:hover {
          background: #f7f9ff;
          border-color: #cbd5e7;
        }

        .sa-button-primary {
          border-color: var(--sa-blue);
          background: var(--sa-blue);
          color: white;
        }

        .sa-button-primary:hover {
          border-color: #244dd0;
          background: #244dd0;
          color: white;
        }

        .sa-heading {
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .sa-eyebrow {
          margin: 0 0 8px;
          color: var(--sa-blue);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.4px;
          text-transform: uppercase;
        }

        .sa-title {
          margin: 0;
          font-size: clamp(27px, 3vw, 35px);
          font-weight: 800;
          letter-spacing: -1px;
        }

        .sa-description {
          max-width: 750px;
          margin: 9px 0 0;
          color: var(--sa-muted);
          font-size: 14px;
          line-height: 1.7;
        }

        .sa-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 11px;
          border: 1px solid #c7ead4;
          border-radius: 25px;
          background: #effbf4;
          color: #187748;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
        }

        .sa-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22a365;
        }

        .sa-notice-banner {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 22px;
          padding: 15px 17px;
          border: 1px solid #d9e4ff;
          border-radius: 13px;
          background: #edf3ff;
          color: #27499c;
          font-size: 12px;
          line-height: 1.7;
        }

        .sa-notice-banner strong {
          display: block;
          margin-bottom: 3px;
        }

        .sa-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }

        .sa-card {
          min-width: 0;
          padding: 20px;
          border: 1px solid var(--sa-border);
          border-radius: 16px;
          background: var(--sa-card);
          box-shadow: 0 3px 14px rgba(23, 32, 51, 0.025);
        }

        .sa-metric-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 17px;
        }

        .sa-metric-label {
          color: var(--sa-muted);
          font-size: 12px;
          font-weight: 650;
        }

        .sa-metric-icon {
          display: grid;
          place-items: center;
          width: 39px;
          height: 39px;
          border-radius: 12px;
        }

        .sa-blue {
          background: #eaf0ff;
          color: #315fea;
        }

        .sa-green {
          background: #e7f9ef;
          color: #16804a;
        }

        .sa-orange {
          background: #fff2df;
          color: #bd6a0b;
        }

        .sa-red {
          background: #ffebeb;
          color: #d63d3d;
        }

        .sa-metric-value {
          margin: 0;
          font-size: 29px;
          font-weight: 800;
          letter-spacing: -0.8px;
        }

        .sa-metric-foot {
          margin-top: 9px;
          color: var(--sa-muted);
          font-size: 11px;
          line-height: 1.5;
        }

        .sa-main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.3fr) minmax(300px, 0.9fr);
          gap: 20px;
          margin-bottom: 22px;
        }

        .sa-card-heading {
          margin-bottom: 20px;
        }

        .sa-card-title {
          margin: 0;
          font-size: 16px;
          font-weight: 800;
        }

        .sa-card-subtitle {
          margin: 6px 0 0;
          color: var(--sa-muted);
          font-size: 12px;
          line-height: 1.6;
        }

        .sa-compliance-list {
          display: grid;
          gap: 12px;
        }

        .sa-compliance-item {
          padding: 15px;
          border: 1px solid #edf0f6;
          border-radius: 12px;
          background: #fff;
          transition: border-color 0.15s, background 0.15s;
        }

        .sa-compliance-item:hover {
          border-color: #d4def6;
          background: #fcfdff;
        }

        .sa-compliance-title {
          margin: 0;
          font-size: 13px;
          font-weight: 750;
        }

        .sa-compliance-category {
          margin: 5px 0 0;
          color: var(--sa-muted);
          font-size: 10px;
        }

        .sa-compliance-description {
          margin: 12px 0;
          color: #667187;
          font-size: 12px;
          line-height: 1.7;
        }

        .sa-compliance-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .sa-status-pill,
        .sa-severity-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 9px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 800;
          white-space: nowrap;
        }

        .sa-critical {
          background: #ffe7e7;
          color: #c62828;
        }

        .sa-high {
          background: #fff0df;
          color: #b75b0b;
        }

        .sa-medium {
          background: #fff8d9;
          color: #8a6b00;
        }

        .sa-low {
          background: #e7f2ff;
          color: #2859a8;
        }

        .sa-open {
          background: #ffe7e7;
          color: #c62828;
        }

        .sa-review {
          background: #fff4dc;
          color: #99630a;
        }

        .sa-resolved,
        .sa-passed {
          background: #e7f9ef;
          color: #187748;
        }

        .sa-needs-review {
          background: #fff4dc;
          color: #99630a;
        }

        .sa-failed {
          background: #ffe7e7;
          color: #c62828;
        }

        .sa-event-card {
          padding: 0;
          overflow: hidden;
        }

        .sa-event-header {
          padding: 20px;
          border-bottom: 1px solid var(--sa-border);
        }

        .sa-tabs {
          display: flex;
          gap: 20px;
          margin-top: 19px;
          border-bottom: 1px solid var(--sa-border);
        }

        .sa-tab {
          position: relative;
          padding: 11px 2px 13px;
          border: 0;
          background: transparent;
          color: var(--sa-muted);
          font-size: 12px;
          font-weight: 700;
        }

        .sa-tab-active {
          color: var(--sa-blue);
        }

        .sa-tab-active::after {
          position: absolute;
          right: 0;
          bottom: -1px;
          left: 0;
          height: 2px;
          border-radius: 3px;
          background: var(--sa-blue);
          content: "";
        }

        .sa-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 18px;
        }

        .sa-search {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 220px;
          max-width: 370px;
          flex: 1;
          padding: 0 12px;
          border: 1px solid var(--sa-border);
          border-radius: 10px;
          background: #fff;
          color: #8490a5;
        }

        .sa-search input {
          width: 100%;
          min-width: 0;
          height: 39px;
          border: 0;
          outline: none;
          background: transparent;
          color: var(--sa-text);
          font-size: 12px;
        }

        .sa-select {
          min-height: 39px;
          max-width: 100%;
          padding: 8px 28px 8px 10px;
          border: 1px solid var(--sa-border);
          border-radius: 9px;
          outline: none;
          background: #fff;
          color: #455066;
          font-size: 11px;
        }

        .sa-table-wrap {
          width: 100%;
          overflow-x: auto;
        }

        .sa-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          white-space: nowrap;
        }

        .sa-table th {
          padding: 14px 17px;
          background: #fafbfe;
          color: #7b8599;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .sa-table td {
          padding: 16px 17px;
          border-top: 1px solid #eef1f6;
          color: #4d586d;
          font-size: 11px;
        }

        .sa-table tbody tr:hover {
          background: #f8faff;
        }

        .sa-id {
          color: var(--sa-blue);
          font-weight: 800;
        }

        .sa-actor,
        .sa-action {
          color: #263248;
          font-weight: 700;
        }

        .sa-muted {
          margin-top: 5px;
          color: #8b95a7;
          font-size: 10px;
        }

        .sa-view {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 9px;
          border: 1px solid var(--sa-border);
          border-radius: 8px;
          background: #fff;
          color: #536078;
          font-size: 10px;
          font-weight: 750;
        }

        .sa-view:hover {
          background: #edf3ff;
          color: var(--sa-blue);
        }

        .sa-empty {
          padding: 45px 20px;
          text-align: center;
          color: var(--sa-muted);
          font-size: 12px;
        }

        .sa-footer {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          padding: 14px 20px;
          border-top: 1px solid var(--sa-border);
          color: var(--sa-muted);
          font-size: 11px;
        }

        .sa-overlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          justify-content: flex-end;
          background: rgba(15, 23, 42, 0.42);
        }

        .sa-drawer {
          width: min(490px, 100%);
          height: 100%;
          overflow-y: auto;
          padding: 25px;
          background: #fff;
          box-shadow: -12px 0 45px #0002;
        }

        .sa-drawer-heading {
          padding-bottom: 20px;
          border-bottom: 1px solid var(--sa-border);
        }

        .sa-drawer-title {
          margin: 0;
          font-size: 19px;
          font-weight: 800;
        }

        .sa-drawer-subtitle {
          margin: 7px 0 0;
          color: var(--sa-muted);
          font-size: 12px;
          line-height: 1.6;
        }

        .sa-close {
          display: grid;
          place-items: center;
          width: 37px;
          height: 37px;
          flex-shrink: 0;
          border: 1px solid var(--sa-border);
          border-radius: 10px;
          background: #fff;
          color: #59657a;
        }

        .sa-detail-section {
          padding: 20px 0;
          border-bottom: 1px solid #eef1f6;
        }

        .sa-detail-label {
          margin: 0 0 13px;
          color: #8993a5;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .sa-detail-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 18px;
          padding: 9px 0;
          font-size: 12px;
        }

        .sa-detail-row span:first-child {
          color: var(--sa-muted);
        }

        .sa-detail-row span:last-child {
          max-width: 65%;
          text-align: right;
          overflow-wrap: anywhere;
          font-weight: 650;
        }

        .sa-detail-description {
          color: #566176;
          font-size: 13px;
          line-height: 1.8;
        }

        .sa-drawer-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          padding-top: 22px;
        }

        .sa-toast {
          position: fixed;
          right: 24px;
          bottom: 24px;
          z-index: 60;
          display: flex;
          align-items: center;
          gap: 9px;
          max-width: min(420px, calc(100vw - 32px));
          padding: 13px 17px;
          border: 1px solid #bfe9d0;
          border-radius: 12px;
          background: #f0fff5;
          color: #187748;
          box-shadow: 0 12px 35px #17203318;
          font-size: 12px;
          font-weight: 700;
        }

        @media (max-width: 1100px) {
          .sa-page {
            padding: 22px;
          }

          .sa-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .sa-main-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .sa-page {
            padding: 14px;
          }

          .sa-topbar {
            align-items: flex-start;
            margin-bottom: 25px;
          }

          .sa-brand-icon {
            width: 40px;
            height: 40px;
          }

          .sa-brand-subtitle {
            font-size: 10px;
          }

          .sa-actions {
            gap: 6px;
          }

          .sa-actions .sa-button {
            min-height: 35px;
            padding: 7px;
            font-size: 10px;
          }

          .sa-heading {
            flex-direction: column;
            gap: 14px;
          }

          .sa-title {
            font-size: 27px;
          }

          .sa-description {
            font-size: 12px;
          }

          .sa-metrics {
            gap: 10px;
          }

          .sa-card {
            padding: 15px;
            border-radius: 13px;
          }

          .sa-metric-value {
            font-size: 25px;
          }

          .sa-metric-label {
            font-size: 11px;
          }

          .sa-metric-icon {
            width: 33px;
            height: 33px;
          }

          .sa-event-header {
            padding: 15px;
          }

          .sa-section-heading {
            align-items: flex-start;
          }

          .sa-toolbar {
            align-items: stretch;
          }

          .sa-search {
            max-width: none;
            flex-basis: 100%;
          }

          .sa-toolbar .sa-select {
            flex: 1;
          }

          .sa-drawer {
            padding: 19px;
          }

          .sa-footer {
            padding: 13px 15px;
          }
        }
      `}</style>

      <div className="sa-container">
        <header className="sa-topbar">
          <div className="sa-brand">
            <div className="sa-brand-icon">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="sa-brand-name">ModelNow Governance</p>
              <p className="sa-brand-subtitle">
                Security audit and compliance center
              </p>
            </div>
          </div>

          <div className="sa-actions">
            <button className="sa-button" onClick={refreshAudit}>
              <RefreshCw size={15} />
              Refresh
            </button>
            <button
              className="sa-button sa-button-primary"
              onClick={exportAudit}
            >
              <Download size={15} />
              Export audit
            </button>
          </div>
        </header>

        <section className="sa-heading">
          <div>
            <p className="sa-eyebrow">Governance and compliance</p>
            <h1 className="sa-title">Security Audit</h1>
            <p className="sa-description">
              Review security events, track compliance controls, and maintain
              visibility into important activities across your ModelNow
              workspace.
            </p>
          </div>

          <span className="sa-badge">
            <span className="sa-dot" />
            Audit workspace
          </span>
        </section>

        <div className="sa-notice-banner">
          <ShieldAlert size={23} />
          <div>
            <strong>Audit data and compliance status</strong>
            This page uses demonstration events and locally stored component
            state. It does not independently verify regulatory compliance.
            Connect a backend audit source and your approved control framework
            before using these results for production decisions.
          </div>
        </div>

        <section className="sa-metrics">
          <MetricCard
            label="Audit events"
            value={metrics.total.toString()}
            foot="Events in the current demo feed"
            icon={<History size={20} />}
            color="blue"
          />
          <MetricCard
            label="Open findings"
            value={metrics.open.toString()}
            foot="Events awaiting review"
            icon={<AlertCircle size={20} />}
            color="orange"
          />
          <MetricCard
            label="Critical events"
            value={metrics.critical.toString()}
            foot="Prioritize investigation"
            icon={<ShieldAlert size={20} />}
            color="red"
          />
          <MetricCard
            label="Resolved events"
            value={metrics.resolved.toString()}
            foot="Marked resolved in this view"
            icon={<CheckCircle2 size={20} />}
            color="green"
          />
        </section>

        <section className="sa-main-grid">
          <div className="sa-card">
            <div className="sa-card-heading">
              <div>
                <h2 className="sa-card-title">Compliance overview</h2>
                <p className="sa-card-subtitle">
                  Sample control checks requiring review
                </p>
              </div>
              <ClipboardCheck size={22} color="#315fea" />
            </div>

            <div className="sa-metrics" style={{ marginBottom: 20, gap: 10 }}>
              <MiniMetric label="Passed" value={metrics.passed} color="green" />
              <MiniMetric
                label="Needs review"
                value={metrics.needsReview}
                color="orange"
              />
              <MiniMetric label="Failed" value={metrics.failed} color="red" />
            </div>

            <div className="sa-compliance-list">
              {checks.slice(0, 4).map((check) => (
                <div className="sa-compliance-item" key={check.id}>
                  <div className="sa-compliance-top">
                    <div>
                      <p className="sa-compliance-title">{check.title}</p>
                      <p className="sa-compliance-category">
                        {check.id} · {check.category}
                      </p>
                    </div>
                    <span
                      className={`sa-status-pill ${
                        complianceStyles[check.status]
                      }`}
                    >
                      {check.status}
                    </span>
                  </div>
                  <p className="sa-compliance-description">
                    {check.description}
                  </p>
                  <div className="sa-compliance-bottom">
                    <span className="sa-muted">
                      Demo control assessment
                    </span>
                    <button
                      className="sa-view"
                      onClick={() => {
                        setSelectedCheck(check);
                        setSelectedEvent(null);
                      }}
                    >
                      Review <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="sa-button"
              style={{ width: "100%", marginTop: 15 }}
              onClick={() => setActiveTab("compliance")}
            >
              View all compliance checks
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="sa-card">
            <div className="sa-card-heading">
              <div>
                <h2 className="sa-card-title">Audit readiness</h2>
                <p className="sa-card-subtitle">
                  Recommended governance reviews
                </p>
              </div>
              <FileCheck2 size={22} color="#315fea" />
            </div>

            <ReadinessItem
              title="Identity and access"
              description="Review user roles, permissions, and access history."
              icon={<User size={18} />}
            />
            <ReadinessItem
              title="Security event evidence"
              description="Ensure important events have timestamps and owners."
              icon={<FileSearch size={18} />}
            />
            <ReadinessItem
              title="Retention and integrity"
              description="Verify retention policy and protection against log tampering."
              icon={<LockKeyhole size={18} />}
            />
            <ReadinessItem
              title="Incident response"
              description="Check escalation paths and evidence preservation procedures."
              icon={<Activity size={18} />}
            />
          </div>
        </section>

        <section className="sa-card sa-event-card">
          <div className="sa-event-header">
            <div className="sa-section-heading">
              <div>
                <h2 className="sa-card-title">Audit activity</h2>
                <p className="sa-card-subtitle">
                  Search events and inspect audit details
                </p>
              </div>
              <span className="sa-badge">
                <span className="sa-dot" />
                Demo feed
              </span>
            </div>

            <div className="sa-tabs">
              <button
                className={`sa-tab ${
                  activeTab === "events" ? "sa-tab-active" : ""
                }`}
                onClick={() => setActiveTab("events")}
              >
                Audit events ({events.length})
              </button>
              <button
                className={`sa-tab ${
                  activeTab === "compliance" ? "sa-tab-active" : ""
                }`}
                onClick={() => setActiveTab("compliance")}
              >
                Compliance checks ({checks.length})
              </button>
            </div>

            <div className="sa-toolbar">
              <label className="sa-search">
                <Search size={16} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={
                    activeTab === "events"
                      ? "Search actor, action, resource..."
                      : "Search compliance controls..."
                  }
                  aria-label="Search audit records"
                />
              </label>

              {activeTab === "events" ? (
                <div className="sa-inline">
                  <select
                    className="sa-select"
                    value={severityFilter}
                    onChange={(event) => setSeverityFilter(event.target.value)}
                    aria-label="Filter severity"
                  >
                    <option value="All">All severity</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>

                  <select
                    className="sa-select"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    aria-label="Filter event status"
                  >
                    <option value="All">All status</option>
                    <option value="Open">Open</option>
                    <option value="In Review">In Review</option>
                    <option value="Resolved">Resolved</option>
                  </select>

                  <select
                    className="sa-select"
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                    aria-label="Filter category"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === "All" ? "All categories" : category}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="sa-inline">
                  <button className="sa-button" onClick={exportCompliance}>
                    <ArrowDownToLine size={14} />
                    Export checks
                  </button>
                </div>
              )}

              <button className="sa-button" onClick={resetFilters}>
                <Filter size={14} />
                Reset
              </button>
            </div>
          </div>

          {activeTab === "events" ? (
            <>
              <div className="sa-table-wrap">
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th>Event ID</th>
                      <th>Actor / Action</th>
                      <th>Resource</th>
                      <th>Severity</th>
                      <th>Status</th>
                      <th>Time</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.map((event) => (
                      <tr key={event.id}>
                        <td>
                          <span className="sa-id">{event.id}</span>
                        </td>
                        <td>
                          <div className="sa-actor">{event.actor}</div>
                          <div className="sa-muted">{event.action}</div>
                        </td>
                        <td>
                          <div className="sa-action">{event.resource}</div>
                          <div className="sa-muted">{event.category}</div>
                        </td>
                        <td>
                          <span
                            className={`sa-severity-pill ${
                              severityStyles[event.severity]
                            }`}
                          >
                            {event.severity}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`sa-status-pill ${
                              statusStyles[event.status]
                            }`}
                          >
                            {event.status}
                          </span>
                        </td>
                        <td>{event.time}</td>
                        <td>
                          <button
                            className="sa-view"
                            onClick={() => {
                              setSelectedEvent(event);
                              setSelectedCheck(null);
                            }}
                          >
                            <FileSearch size={13} />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredEvents.length === 0 && (
                  <div className="sa-empty">
                    No audit events match your current filters.
                  </div>
                )}
              </div>

              <div className="sa-footer">
                <span>
                  Showing {filteredEvents.length} of {events.length} events
                </span>
                <span>Last refreshed: {lastRefresh}</span>
              </div>
            </>
          ) : (
            <>
              <div className="sa-table-wrap">
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th>Control ID</th>
                      <th>Control</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {checks
                      .filter((check) => {
                        const query = search.trim().toLowerCase();
                        return (
                          !query ||
                          [
                            check.id,
                            check.title,
                            check.category,
                            check.description,
                            check.status,
                          ].some((value) =>
                            value.toLowerCase().includes(query)
                          )
                        );
                      })
                      .map((check) => (
                        <tr key={check.id}>
                          <td>
                            <span className="sa-id">{check.id}</span>
                          </td>
                          <td>
                            <div className="sa-action">{check.title}</div>
                            <div className="sa-muted">
                              {check.description}
                            </div>
                          </td>
                          <td>{check.category}</td>
                          <td>
                            <span
                              className={`sa-status-pill ${
                                complianceStyles[check.status]
                              }`}
                            >
                              {check.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className="sa-view"
                              onClick={() => {
                                setSelectedCheck(check);
                                setSelectedEvent(null);
                              }}
                            >
                              Review <ChevronRight size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className="sa-footer">
                <span>{checks.length} demonstration compliance controls</span>
                <span>Compliance requires independent verification</span>
              </div>
            </>
          )}
        </section>
      </div>

      {(selectedEvent || selectedCheck) && (
        <div
          className="sa-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedEvent(null);
              setSelectedCheck(null);
            }
          }}
        >
          <aside
            className="sa-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sa-drawer-title"
          >
            <div className="sa-drawer-heading">
              <div>
                <h2 id="sa-drawer-title" className="sa-drawer-title">
                  {selectedEvent ? "Audit event details" : "Compliance review"}
                </h2>
                <p className="sa-drawer-subtitle">
                  Review the selected record and update its demonstration
                  status.
                </p>
              </div>
              <button
                className="sa-close"
                onClick={() => {
                  setSelectedEvent(null);
                  setSelectedCheck(null);
                }}
                aria-label="Close details"
              >
                <X size={18} />
              </button>
            </div>

            {selectedEvent && (
              <>
                <div className="sa-detail-section">
                  <p className="sa-detail-label">Event summary</p>
                  <div className="sa-inline" style={{ marginBottom: 14 }}>
                    <span
                      className={`sa-severity-pill ${
                        severityStyles[selectedEvent.severity]
                      }`}
                    >
                      {selectedEvent.severity}
                    </span>
                    <span
                      className={`sa-status-pill ${
                        statusStyles[selectedEvent.status]
                      }`}
                    >
                      {selectedEvent.status}
                    </span>
                  </div>
                  <h3 style={{ margin: "0 0 10px", fontSize: 16 }}>
                    {selectedEvent.action}
                  </h3>
                  <p className="sa-detail-description">
                    {selectedEvent.details}
                  </p>
                </div>

                <div className="sa-detail-section">
                  <p className="sa-detail-label">Audit record</p>
                  <DetailRow label="Event ID" value={selectedEvent.id} />
                  <DetailRow label="Timestamp" value={selectedEvent.time} />
                  <DetailRow label="Actor" value={selectedEvent.actor} />
                  <DetailRow label="Resource" value={selectedEvent.resource} />
                  <DetailRow label="Category" value={selectedEvent.category} />
                  <DetailRow
                    label="Severity"
                    value={selectedEvent.severity}
                  />
                </div>

                <div className="sa-detail-section">
                  <p className="sa-detail-label">Update status</p>
                  <div className="sa-button-row">
                    {(["Open", "In Review", "Resolved"] as AuditStatus[]).map(
                      (status) => (
                        <button
                          key={status}
                          className={`sa-button ${
                            selectedEvent.status === status
                              ? "sa-button-primary"
                              : ""
                          }`}
                          onClick={() =>
                            updateEventStatus(selectedEvent.id, status)
                          }
                        >
                          {status}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </>
            )}

            {selectedCheck && (
              <>
                <div className="sa-detail-section">
                  <p className="sa-detail-label">Control information</p>
                  <span
                    className={`sa-status-pill ${
                      complianceStyles[selectedCheck.status]
                    }`}
                  >
                    {selectedCheck.status}
                  </span>
                  <h3 style={{ margin: "14px 0 8px", fontSize: 17 }}>
                    {selectedCheck.title}
                  </h3>
                  <p className="sa-detail-description">
                    {selectedCheck.description}
                  </p>
                </div>

                <div className="sa-detail-section">
                  <p className="sa-detail-label">Control details</p>
                  <DetailRow label="Control ID" value={selectedCheck.id} />
                  <DetailRow
                    label="Category"
                    value={selectedCheck.category}
                  />
                  <DetailRow label="Status" value={selectedCheck.status} />
                </div>

                <div className="sa-detail-section">
                  <p className="sa-detail-label">Update assessment</p>
                  <div className="sa-button-row">
                    {(
                      ["Passed", "Needs Review", "Failed"] as ComplianceCheck["status"][]
                    ).map((status) => (
                      <button
                        key={status}
                        className={`sa-button ${
                          selectedCheck.status === status
                            ? "sa-button-primary"
                            : ""
                        }`}
                        onClick={() =>
                          updateComplianceStatus(selectedCheck.id, status)
                        }
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="sa-drawer-actions">
              <button
                className="sa-button"
                onClick={() => {
                  setSelectedEvent(null);
                  setSelectedCheck(null);
                }}
              >
                Close
              </button>
              <button
                className="sa-button sa-button-primary"
                onClick={selectedCheck ? exportCompliance : exportAudit}
              >
                <ArrowDownToLine size={15} />
                Export report
              </button>
            </div>
          </aside>
        </div>
      )}

      {notice && (
        <div className="sa-toast" role="status">
          <CheckCircle2 size={17} />
          {notice}
        </div>
      )}
    </main>
  );
}

function MetricCard({
  label,
  value,
  foot,
  icon,
  color,
}: {
  label: string;
  value: string;
  foot: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "orange" | "red";
}) {
  return (
    <div className="sa-card">
      <div className="sa-metric-top">
        <span className="sa-metric-label">{label}</span>
        <div className={`sa-metric-icon sa-${color}`}>{icon}</div>
      </div>
      <p className="sa-metric-value">{value}</p>
      <div className="sa-metric-foot">{foot}</div>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "green" | "orange" | "red";
}) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        padding: "13px 11px",
        border: "1px solid #edf0f6",
        borderRadius: 11,
        background: "#fff",
      }}
    >
      <div style={{ color: "#758096", fontSize: 11 }}>{label}</div>
      <div
        style={{
          marginTop: 8,
          color:
            color === "green"
              ? "#16804a"
              : color === "orange"
                ? "#bd6a0b"
                : "#d63d3d",
          fontSize: 23,
          fontWeight: 800,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ReadinessItem({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "17px 0",
        borderBottom: "1px solid #eef1f6",
      }}
    >
      <div
        style={{
          display: "grid",
          placeItems: "center",
          width: 38,
          height: 38,
          flexShrink: 0,
          borderRadius: 11,
          background: "#edf3ff",
          color: "#315fea",
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 750 }}>{title}</p>
        <p
          style={{
            margin: "6px 0 0",
            color: "#758096",
            fontSize: 11,
            lineHeight: 1.7,
          }}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="sa-detail-row">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
