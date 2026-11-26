
"use client";

import { useMemo, useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Search,
  RefreshCw,
  Download,
  Filter,
  Eye,
  X,
  CheckCircle2,
  Clock3,
  Globe,
  Monitor,
  Network,
  LockKeyhole,
  ArrowUpRight,
  ArrowDownRight,
  CircleDot,
  Ban,
  Check,
  ChevronDown,
  Zap,
  Fingerprint,
  FileWarning,
  Server,
} from "lucide-react";

type Severity = "Critical" | "High" | "Medium" | "Low";
type ThreatStatus = "Investigating" | "Detected" | "Contained" | "Resolved";

type Threat = {
  id: string;
  title: string;
  category: string;
  severity: Severity;
  status: ThreatStatus;
  source: string;
  target: string;
  location: string;
  detectedAt: string;
  description: string;
  indicators: string[];
  recommendation: string;
};

const initialThreats: Threat[] = [
  {
    id: "THR-1042",
    title: "Suspicious authentication attempts",
    category: "Identity & Access",
    severity: "Critical",
    status: "Investigating",
    source: "Unknown client",
    target: "Authentication API",
    location: "Unknown location",
    detectedAt: "Today, 09:12 AM",
    description:
      "A sample detection indicates repeated unsuccessful authentication attempts against an account endpoint.",
    indicators: [
      "Repeated authentication failures",
      "Unrecognized client fingerprint",
      "Unusual request frequency",
    ],
    recommendation:
      "Validate the source, inspect authentication logs, apply rate limiting, and revoke suspicious sessions if confirmed.",
  },
  {
    id: "THR-1041",
    title: "Unusual API request volume",
    category: "API Security",
    severity: "High",
    status: "Detected",
    source: "API gateway",
    target: "Model inference endpoint",
    location: "Unknown location",
    detectedAt: "Today, 08:48 AM",
    description:
      "Request volume exceeded the illustrative baseline for an inference endpoint.",
    indicators: [
      "Elevated request rate",
      "Unexpected traffic pattern",
      "Potential quota pressure",
    ],
    recommendation:
      "Review gateway metrics, identify the responsible client, and apply appropriate quotas or rate limits.",
  },
  {
    id: "THR-1040",
    title: "Unexpected permission change",
    category: "Access Control",
    severity: "High",
    status: "Investigating",
    source: "Admin console",
    target: "Workspace permissions",
    location: "Workspace",
    detectedAt: "Today, 08:22 AM",
    description:
      "A sample audit event flags a change to a workspace permission that should be reviewed.",
    indicators: [
      "Role assignment changed",
      "Audit event requires review",
      "Potential privilege escalation",
    ],
    recommendation:
      "Verify the change with the workspace administrator and restore the approved role configuration if unauthorized.",
  },
  {
    id: "THR-1039",
    title: "Untrusted device sign-in",
    category: "Endpoint Security",
    severity: "Medium",
    status: "Detected",
    source: "Session service",
    target: "User account",
    location: "Unknown location",
    detectedAt: "Today, 07:55 AM",
    description:
      "A sample event represents a sign-in from a device that is not marked as trusted.",
    indicators: [
      "Device not on trusted list",
      "New browser fingerprint",
      "Session review recommended",
    ],
    recommendation:
      "Confirm whether the sign-in is legitimate and terminate the session if it is not recognized.",
  },
  {
    id: "THR-1038",
    title: "Potential data access anomaly",
    category: "Data Protection",
    severity: "Medium",
    status: "Contained",
    source: "Knowledge service",
    target: "Document retrieval API",
    location: "Internal service",
    detectedAt: "Yesterday, 06:40 PM",
    description:
      "An illustrative alert flags an unusual pattern of document retrieval requests.",
    indicators: [
      "Unusual retrieval frequency",
      "Access pattern deviation",
      "Scope validation recommended",
    ],
    recommendation:
      "Audit document access permissions, inspect retrieval logs, and validate tenant isolation.",
  },
  {
    id: "THR-1037",
    title: "Expired credential usage",
    category: "Credential Security",
    severity: "Low",
    status: "Resolved",
    source: "Integration service",
    target: "External connector",
    location: "Internal service",
    detectedAt: "Yesterday, 03:15 PM",
    description:
      "A sample connector event indicates an integration attempted to use an expired credential.",
    indicators: [
      "Credential expiration",
      "Connector authentication failure",
      "Credential rotation needed",
    ],
    recommendation:
      "Rotate the credential through the approved secret-management workflow and verify the connector.",
  },
];

const severityRank: Record<Severity, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

const initialTimeline = [
  {
    time: "09:12 AM",
    title: "Authentication anomaly detected",
    detail: "Identity & Access · THR-1042",
    severity: "Critical",
  },
  {
    time: "08:48 AM",
    title: "API traffic threshold exceeded",
    detail: "API Security · THR-1041",
    severity: "High",
  },
  {
    time: "08:22 AM",
    title: "Permission change flagged",
    detail: "Access Control · THR-1040",
    severity: "High",
  },
  {
    time: "07:55 AM",
    title: "Untrusted device event",
    detail: "Endpoint Security · THR-1039",
    severity: "Medium",
  },
];

export default function ThreatDetectionPage() {
  const [threats, setThreats] = useState<Threat[]>(initialThreats);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All severities");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null);
  const [confirmThreat, setConfirmThreat] = useState<Threat | null>(null);
  const [notice, setNotice] = useState("");
  const [activeTab, setActiveTab] = useState<"threats" | "timeline">(
    "threats"
  );
  const [sortOrder, setSortOrder] = useState<"severity" | "recent">(
    "severity"
  );

  const categories = useMemo(
    () => Array.from(new Set(threats.map((threat) => threat.category))),
    [threats]
  );

  const activeThreats = threats.filter(
    (threat) =>
      threat.status !== "Resolved" && threat.status !== "Contained"
  ).length;

  const criticalThreats = threats.filter(
    (threat) =>
      threat.severity === "Critical" && threat.status !== "Resolved"
  ).length;

  const containedThreats = threats.filter(
    (threat) => threat.status === "Contained"
  ).length;

  const filteredThreats = useMemo(() => {
    const term = search.trim().toLowerCase();

    const result = threats.filter((threat) => {
      const matchesSearch =
        !term ||
        threat.id.toLowerCase().includes(term) ||
        threat.title.toLowerCase().includes(term) ||
        threat.category.toLowerCase().includes(term) ||
        threat.source.toLowerCase().includes(term) ||
        threat.target.toLowerCase().includes(term) ||
        threat.location.toLowerCase().includes(term);

      const matchesSeverity =
        severityFilter === "All severities" ||
        threat.severity === severityFilter;

      const matchesStatus =
        statusFilter === "All statuses" || threat.status === statusFilter;

      const matchesCategory =
        categoryFilter === "All categories" ||
        threat.category === categoryFilter;

      return (
        matchesSearch &&
        matchesSeverity &&
        matchesStatus &&
        matchesCategory
      );
    });

    return result.sort((a, b) => {
      if (sortOrder === "severity") {
        return severityRank[b.severity] - severityRank[a.severity];
      }

      return b.id.localeCompare(a.id);
    });
  }, [
    threats,
    search,
    severityFilter,
    statusFilter,
    categoryFilter,
    sortOrder,
  ]);

  function notify(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  }

  function updateThreatStatus(id: string, status: ThreatStatus) {
    setThreats((current) =>
      current.map((threat) =>
        threat.id === id ? { ...threat, status } : threat
      )
    );

    setSelectedThreat((current) =>
      current?.id === id ? { ...current, status } : current
    );

    setConfirmThreat(null);

    const messages: Record<ThreatStatus, string> = {
      Investigating: "Threat marked as investigating.",
      Detected: "Threat status set to detected.",
      Contained: "Threat marked as contained in the demo.",
      Resolved: "Threat marked as resolved in the demo.",
    };

    notify(messages[status]);
  }

  function exportThreats() {
    const header = [
      "Threat ID",
      "Title",
      "Category",
      "Severity",
      "Status",
      "Source",
      "Target",
      "Location",
      "Detected At",
    ];

    const rows = filteredThreats.map((threat) => [
      threat.id,
      threat.title,
      threat.category,
      threat.severity,
      threat.status,
      threat.source,
      threat.target,
      threat.location,
      threat.detectedAt,
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "modelnow-threat-detection.csv";
    anchor.click();
    URL.revokeObjectURL(url);

    notify("Threat report exported.");
  }

  function resetFilters() {
    setSearch("");
    setSeverityFilter("All severities");
    setStatusFilter("All statuses");
    setCategoryFilter("All categories");
  }

  function severityClass(severity: Severity) {
    return `td-severity td-${severity.toLowerCase()}`;
  }

  function statusClass(status: ThreatStatus) {
    return `td-status td-status-${status
      .toLowerCase()
      .replaceAll(" ", "-")}`;
  }

  return (
    <main className="td-page">
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #f6f8fc;
          color: #182338;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system,
            BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        button,
        input,
        select {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .td-page {
          min-height: 100vh;
          padding: 30px;
          background: #f6f8fc;
        }

        .td-container {
          max-width: 1500px;
          margin: 0 auto;
        }

        .td-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 22px;
          color: #8b96a9;
          font-size: 11px;
        }

        .td-breadcrumb strong {
          color: #4b5870;
          font-weight: 700;
        }

        .td-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .td-title-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .td-title-icon {
          display: grid;
          place-items: center;
          flex-shrink: 0;
          width: 49px;
          height: 49px;
          color: #315fea;
          background: #eaf0ff;
          border: 1px solid #dce6ff;
          border-radius: 15px;
        }

        .td-header h1 {
          margin: 0;
          color: #19253b;
          font-size: 27px;
          font-weight: 780;
          letter-spacing: -0.8px;
        }

        .td-subtitle {
          max-width: 680px;
          margin: 8px 0 0;
          color: #808ca0;
          font-size: 12px;
          line-height: 1.7;
        }

        .td-header-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
        }

        .td-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 38px;
          padding: 0 13px;
          color: #43516a;
          background: #fff;
          border: 1px solid #dfe5ef;
          border-radius: 9px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
          transition: 0.15s ease;
        }

        .td-btn:hover {
          background: #f8faff;
          border-color: #bdcaf1;
        }

        .td-btn-primary {
          color: #fff;
          background: #315fea;
          border-color: #315fea;
        }

        .td-btn-primary:hover {
          color: #fff;
          background: #244fce;
          border-color: #244fce;
        }

        .td-btn-danger {
          color: #bf3e4b;
          background: #fff;
          border-color: #f0cdd1;
        }

        .td-btn-danger:hover {
          background: #fff3f4;
        }

        .td-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .td-metric {
          padding: 18px;
          background: #fff;
          border: 1px solid #e6ebf3;
          border-radius: 14px;
          box-shadow: 0 2px 7px #18233804;
        }

        .td-metric-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .td-metric-icon {
          display: grid;
          place-items: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
        }

        .td-icon-blue {
          color: #315fea;
          background: #edf2ff;
        }

        .td-icon-red {
          color: #d34452;
          background: #fff0f1;
        }

        .td-icon-green {
          color: #16845c;
          background: #e7f8ef;
        }

        .td-icon-amber {
          color: #b77912;
          background: #fff4dc;
        }

        .td-metric-tag {
          color: #8792a5;
          font-size: 9px;
          text-align: right;
        }

        .td-metric-value {
          margin-top: 17px;
          color: #202c43;
          font-size: 29px;
          font-weight: 780;
          letter-spacing: -0.7px;
        }

        .td-metric-label {
          margin-top: 5px;
          color: #8390a4;
          font-size: 11px;
        }

        .td-metric-trend {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-top: 12px;
          color: #14845b;
          font-size: 10px;
        }

        .td-demo-banner {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          padding: 14px 16px;
          margin-bottom: 20px;
          color: #845d1a;
          background: #fffbf1;
          border: 1px solid #f2e0ba;
          border-radius: 11px;
        }

        .td-demo-banner svg {
          flex-shrink: 0;
          margin-top: 1px;
        }

        .td-demo-banner strong {
          display: block;
          margin-bottom: 4px;
          font-size: 11px;
        }

        .td-demo-banner p {
          margin: 0;
          color: #967a47;
          font-size: 10px;
          line-height: 1.6;
        }

        .td-main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.55fr) minmax(290px, 0.8fr);
          gap: 18px;
          margin-bottom: 20px;
        }

        .td-card {
          overflow: hidden;
          background: #fff;
          border: 1px solid #e5eaf2;
          border-radius: 14px;
          box-shadow: 0 2px 7px #18233804;
        }

        .td-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          padding: 19px 21px;
          border-bottom: 1px solid #edf0f6;
        }

        .td-card-header h2 {
          margin: 0;
          color: #202c43;
          font-size: 14px;
          letter-spacing: -0.2px;
        }

        .td-card-header p {
          margin: 6px 0 0;
          color: #8792a5;
          font-size: 10px;
          line-height: 1.6;
        }

        .td-live-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 8px;
          color: #16845c;
          background: #e9f8f0;
          border-radius: 6px;
          font-size: 9px;
          font-weight: 750;
          white-space: nowrap;
        }

        .td-live-dot {
          width: 6px;
          height: 6px;
          background: #20a16d;
          border-radius: 50%;
        }

        .td-chart-body {
          padding: 18px 20px 15px;
        }

        .td-chart-summary {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 17px;
        }

        .td-chart-number {
          color: #202c43;
          font-size: 26px;
          font-weight: 780;
          letter-spacing: -0.6px;
        }

        .td-chart-caption {
          margin-top: 4px;
          color: #8b96a9;
          font-size: 10px;
        }

        .td-chart-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          padding-top: 5px;
        }

        .td-legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #7f8ba0;
          font-size: 9px;
        }

        .td-legend-dot {
          width: 7px;
          height: 7px;
          border-radius: 3px;
        }

        .td-chart {
          display: flex;
          align-items: flex-end;
          gap: 12px;
          height: 165px;
          padding: 12px 3px 0;
          border-bottom: 1px solid #e9edf4;
          background-image: linear-gradient(
            to bottom,
            transparent 24%,
            #eef1f7 25%,
            transparent 25.5%,
            transparent 49%,
            #eef1f7 50%,
            transparent 50.5%,
            transparent 74%,
            #eef1f7 75%,
            transparent 75.5%
          );
        }

        .td-chart-col {
          display: flex;
          flex: 1;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          height: 100%;
          min-width: 0;
          gap: 8px;
        }

        .td-bar-stack {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 3px;
          width: 100%;
          height: 130px;
        }

        .td-bar {
          width: min(14px, 38%);
          min-height: 3px;
          border-radius: 4px 4px 0 0;
          transition: height 0.2s ease;
        }

        .td-bar-blue {
          background: #6c8af5;
        }

        .td-bar-red {
          background: #e66c79;
        }

        .td-bar-amber {
          background: #e9b85d;
        }

        .td-chart-label {
          color: #8c97a9;
          font-size: 9px;
        }

        .td-chart-footnote {
          margin-top: 12px;
          color: #9aa4b4;
          font-size: 9px;
          line-height: 1.5;
        }

        .td-risk-list {
          padding: 5px 20px 13px;
        }

        .td-risk-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 15px 0;
          border-bottom: 1px solid #f0f2f7;
        }

        .td-risk-item:last-child {
          border-bottom: 0;
        }

        .td-risk-marker {
          flex-shrink: 0;
          width: 8px;
          height: 31px;
          border-radius: 5px;
        }

        .td-risk-critical {
          background: #db4757;
        }

        .td-risk-high {
          background: #e98c50;
        }

        .td-risk-medium {
          background: #e6b447;
        }

        .td-risk-low {
          background: #2da67b;
        }

        .td-risk-copy {
          flex: 1;
          min-width: 0;
        }

        .td-risk-copy strong {
          display: block;
          margin-bottom: 5px;
          color: #34415a;
          font-size: 11px;
        }

        .td-risk-copy span {
          color: #8994a6;
          font-size: 10px;
        }

        .td-risk-number {
          color: #28354c;
          font-size: 17px;
          font-weight: 780;
        }

        .td-table-card {
          margin-bottom: 20px;
        }

        .td-tabs {
          display: flex;
          gap: 22px;
          padding: 0 21px;
          border-bottom: 1px solid #edf0f6;
        }

        .td-tab {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 15px 1px 14px;
          color: #8390a5;
          background: transparent;
          border: 0;
          font-size: 11px;
          font-weight: 700;
        }

        .td-tab.active {
          color: #315fea;
        }

        .td-tab.active::after {
          position: absolute;
          right: 0;
          bottom: -1px;
          left: 0;
          height: 2px;
          content: "";
          background: #315fea;
          border-radius: 2px 2px 0 0;
        }

        .td-tab-count {
          padding: 3px 6px;
          color: #65728a;
          background: #f0f3f8;
          border-radius: 5px;
          font-size: 9px;
        }

        .td-toolbar {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 9px;
          padding: 14px 20px;
          border-bottom: 1px solid #edf0f6;
        }

        .td-search {
          position: relative;
          flex: 1;
          min-width: 210px;
          max-width: 350px;
        }

        .td-search svg {
          position: absolute;
          top: 50%;
          left: 11px;
          color: #919db0;
          transform: translateY(-50%);
        }

        .td-search input {
          width: 100%;
          height: 36px;
          padding: 0 11px 0 35px;
          color: #34415a;
          background: white;
          border: 1px solid #dfe5ef;
          border-radius: 8px;
          outline: none;
          font-size: 10px;
        }

        .td-search input:focus,
        .td-select:focus {
          border-color: #8ba4f7;
          box-shadow: 0 0 0 3px #315fea12;
        }

        .td-select {
          height: 36px;
          min-width: 125px;
          padding: 0 25px 0 10px;
          color: #4b5870;
          background: white;
          border: 1px solid #dfe5ef;
          border-radius: 8px;
          outline: none;
          font-size: 10px;
        }

        .td-table-wrap {
          width: 100%;
          overflow-x: auto;
        }

        .td-table {
          width: 100%;
          min-width: 1000px;
          border-collapse: collapse;
        }

        .td-table th {
          padding: 13px 15px;
          color: #8a95a8;
          background: #fafbfe;
          border-bottom: 1px solid #edf0f6;
          text-align: left;
          text-transform: uppercase;
          letter-spacing: 0.4px;
          font-size: 9px;
          font-weight: 750;
          white-space: nowrap;
        }

        .td-table td {
          padding: 14px 15px;
          color: #59667d;
          border-bottom: 1px solid #f0f2f7;
          vertical-align: middle;
          font-size: 10px;
        }

        .td-table tbody tr:last-child td {
          border-bottom: 0;
        }

        .td-table tbody tr:hover {
          background: #fafbff;
        }

        .td-threat-cell {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          min-width: 220px;
        }

        .td-threat-icon {
          display: grid;
          place-items: center;
          flex-shrink: 0;
          width: 34px;
          height: 34px;
          color: #cf4653;
          background: #fff0f1;
          border-radius: 9px;
        }

        .td-threat-title {
          margin: 1px 0 5px;
          color: #303d54;
          font-size: 10px;
          font-weight: 750;
          line-height: 1.5;
        }

        .td-threat-sub {
          color: #8b96a9;
          font-size: 9px;
          line-height: 1.5;
        }

        .td-id {
          color: #8490a4;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 9px;
        }

        .td-severity,
        .td-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 8px;
          border-radius: 6px;
          font-size: 9px;
          font-weight: 750;
          white-space: nowrap;
        }

        .td-critical {
          color: #c33242;
          background: #fff0f1;
        }

        .td-high {
          color: #b95725;
          background: #fff0e7;
        }

        .td-medium {
          color: #986a14;
          background: #fff5dc;
        }

        .td-low {
          color: #16845c;
          background: #e8f8f0;
        }

        .td-status-investigating {
          color: #7251c9;
          background: #f0eaff;
        }

        .td-status-detected {
          color: #315fea;
          background: #edf2ff;
        }

        .td-status-contained {
          color: #9a6b16;
          background: #fff4dc;
        }

        .td-status-resolved {
          color: #16845c;
          background: #e8f8f0;
        }

        .td-table-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .td-icon-btn {
          display: inline-grid;
          place-items: center;
          width: 29px;
          height: 29px;
          color: #8490a4;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 7px;
        }

        .td-icon-btn:hover {
          color: #315fea;
          background: #edf2ff;
          border-color: #dfe7ff;
        }

        .td-footer {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 20px;
          color: #8b96a9;
          border-top: 1px solid #edf0f6;
          font-size: 10px;
        }

        .td-empty {
          padding: 45px 20px;
          color: #8792a5;
          text-align: center;
        }

        .td-empty svg {
          margin-bottom: 10px;
          color: #9eabc0;
        }

        .td-empty h3 {
          margin: 0 0 6px;
          color: #34415a;
          font-size: 13px;
        }

        .td-empty p {
          margin: 0;
          font-size: 10px;
        }

        .td-bottom-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 18px;
        }

        .td-activity-list {
          padding: 5px 20px 10px;
        }

        .td-activity-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 14px 0;
          border-bottom: 1px solid #f0f2f7;
        }

        .td-activity-item:last-child {
          border-bottom: 0;
        }

        .td-activity-icon {
          display: grid;
          place-items: center;
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          color: #496add;
          background: #edf2ff;
          border-radius: 9px;
        }

        .td-activity-copy {
          flex: 1;
          min-width: 0;
        }

        .td-activity-copy strong {
          display: block;
          margin-bottom: 5px;
          color: #34415a;
          font-size: 10px;
          line-height: 1.5;
        }

        .td-activity-copy p {
          margin: 0;
          color: #8792a5;
          font-size: 9px;
          line-height: 1.6;
        }

        .td-activity-time {
          color: #9aa4b4;
          font-size: 9px;
          white-space: nowrap;
        }

        .td-response-list {
          padding: 5px 20px 15px;
        }

        .td-response-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 13px 0;
          border-bottom: 1px solid #f0f2f7;
        }

        .td-response-item:last-child {
          border-bottom: 0;
        }

        .td-response-item > svg {
          flex-shrink: 0;
          margin-top: 1px;
          color: #16845c;
        }

        .td-response-item strong {
          display: block;
          margin-bottom: 5px;
          color: #34415a;
          font-size: 10px;
        }

        .td-response-item p {
          margin: 0;
          color: #8792a5;
          font-size: 9px;
          line-height: 1.6;
        }

        .td-card-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 0;
          color: #315fea;
          background: transparent;
          border: 0;
          font-size: 10px;
          font-weight: 750;
        }

        .td-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: #101a30a6;
          backdrop-filter: blur(3px);
        }

        .td-modal {
          width: min(490px, 100%);
          overflow: hidden;
          background: #fff;
          border-radius: 15px;
          box-shadow: 0 20px 70px #101a3030;
        }

        .td-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          padding: 20px 22px;
          border-bottom: 1px solid #edf0f6;
        }

        .td-modal-header h2 {
          margin: 0;
          color: #202c43;
          font-size: 15px;
        }

        .td-modal-header p {
          margin: 7px 0 0;
          color: #8792a5;
          font-size: 10px;
          line-height: 1.6;
        }

        .td-close {
          display: grid;
          place-items: center;
          flex-shrink: 0;
          width: 30px;
          height: 30px;
          color: #7c879a;
          background: #fff;
          border: 1px solid #e7ebf3;
          border-radius: 8px;
        }

        .td-modal-body {
          padding: 22px;
          color: #69768c;
          font-size: 11px;
          line-height: 1.7;
        }

        .td-detail-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 16px;
        }

        .td-detail-box {
          min-width: 0;
          padding: 12px;
          background: #fafbfe;
          border: 1px solid #e9edf4;
          border-radius: 9px;
        }

        .td-detail-box span {
          display: block;
          margin-bottom: 6px;
          color: #8994a6;
          font-size: 9px;
        }

        .td-detail-box strong {
          color: #34415a;
          font-size: 10px;
          overflow-wrap: anywhere;
        }

        .td-modal-section-title {
          margin: 20px 0 9px;
          color: #34415a;
          font-size: 11px;
          font-weight: 750;
        }

        .td-indicator {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 7px 0;
          color: #67748b;
          font-size: 10px;
        }

        .td-indicator svg {
          flex-shrink: 0;
          margin-top: 1px;
          color: #b77912;
        }

        .td-recommendation {
          padding: 12px;
          color: #5c6d8e;
          background: #f4f7ff;
          border: 1px solid #e4ebff;
          border-radius: 9px;
          font-size: 10px;
          line-height: 1.7;
        }

        .td-modal-footer {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 8px;
          padding: 15px 22px;
          background: #fbfcfe;
          border-top: 1px solid #edf0f6;
        }

        .td-toast {
          position: fixed;
          right: 24px;
          bottom: 24px;
          z-index: 200;
          display: flex;
          align-items: center;
          gap: 10px;
          max-width: calc(100% - 32px);
          padding: 13px 16px;
          color: white;
          background: #17253e;
          border-radius: 10px;
          box-shadow: 0 10px 35px #17253e30;
          font-size: 11px;
        }

        .td-page-note {
          margin-top: 18px;
          color: #9aa4b4;
          font-size: 9px;
          line-height: 1.6;
          text-align: center;
        }

        @media (max-width: 1100px) {
          .td-page {
            padding: 22px;
          }

          .td-header {
            flex-direction: column;
          }

          .td-main-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .td-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .td-bottom-grid {
            grid-template-columns: 1fr;
          }

          .td-header h1 {
            font-size: 23px;
          }

          .td-header-actions {
            width: 100%;
          }

          .td-header-actions .td-btn {
            flex: 1;
          }
        }

        @media (max-width: 520px) {
          .td-page {
            padding: 13px;
          }

          .td-title-icon {
            width: 42px;
            height: 42px;
          }

          .td-header h1 {
            font-size: 21px;
          }

          .td-metric {
            padding: 13px;
          }

          .td-metric-value {
            font-size: 25px;
          }

          .td-metric-tag {
            font-size: 8px;
          }

          .td-card-header {
            padding: 16px;
          }

          .td-toolbar {
            padding: 13px;
          }

          .td-search {
            flex-basis: 100%;
            max-width: none;
          }

          .td-select {
            flex: 1;
            min-width: 0;
          }

          .td-footer {
            flex-direction: column;
            padding: 13px 16px;
          }

          .td-activity-time {
            display: none;
          }

          .td-chart-body {
            padding: 14px;
          }

          .td-chart {
            gap: 6px;
          }

          .td-chart-legend {
            gap: 8px;
          }
        }
      `}</style>

      <div className="td-container">
        <div className="td-breadcrumb">
          <span>ModelNow</span>
          <span>/</span>
          <span>Security</span>
          <span>/</span>
          <strong>Threat Detection</strong>
        </div>

        <header className="td-header">
          <div className="td-title-row">
            <div className="td-title-icon">
              <ShieldAlert size={25} />
            </div>
            <div>
              <h1>Threat Detection</h1>
              <p className="td-subtitle">
                Monitor security signals, investigate suspicious activity, and
                manage threat response across your ModelNow workspace.
              </p>
            </div>
          </div>

          <div className="td-header-actions">
            <button
              className="td-btn"
              onClick={() => {
                resetFilters();
                notify("Threat list refreshed from demo data.");
              }}
            >
              <RefreshCw size={14} />
              Refresh
            </button>
            <button className="td-btn" onClick={exportThreats}>
              <Download size={14} />
              Export report
            </button>
            <button
              className="td-btn td-btn-primary"
              onClick={() =>
                notify(
                  "Connect the backend detection service to run a real scan."
                )
              }
            >
              <Zap size={14} />
              Run detection
            </button>
          </div>
        </header>

        <section className="td-metrics">
          <div className="td-metric">
            <div className="td-metric-top">
              <span className="td-metric-icon td-icon-blue">
                <Activity size={18} />
              </span>
              <span className="td-metric-tag">Listed records</span>
            </div>
            <div className="td-metric-value">{threats.length}</div>
            <div className="td-metric-label">Total detected threats</div>
            <div className="td-metric-trend">
              <CircleDot size={12} />
              Demo inventory
            </div>
          </div>

          <div className="td-metric">
            <div className="td-metric-top">
              <span className="td-metric-icon td-icon-red">
                <AlertTriangle size={18} />
              </span>
              <span className="td-metric-tag">Requires attention</span>
            </div>
            <div className="td-metric-value">{criticalThreats}</div>
            <div className="td-metric-label">Unresolved critical threats</div>
            <div className="td-metric-trend" style={{ color: "#c43f4d" }}>
              <ArrowUpRight size={12} />
              Review promptly
            </div>
          </div>

          <div className="td-metric">
            <div className="td-metric-top">
              <span className="td-metric-icon td-icon-amber">
                <Clock3 size={18} />
              </span>
              <span className="td-metric-tag">Open workflow</span>
            </div>
            <div className="td-metric-value">{activeThreats}</div>
            <div className="td-metric-label">Threats requiring follow-up</div>
            <div className="td-metric-trend" style={{ color: "#b77912" }}>
              <Activity size={12} />
              Detected or investigating
            </div>
          </div>

          <div className="td-metric">
            <div className="td-metric-top">
              <span className="td-metric-icon td-icon-green">
                <ShieldCheck size={18} />
              </span>
              <span className="td-metric-tag">Response workflow</span>
            </div>
            <div className="td-metric-value">{containedThreats}</div>
            <div className="td-metric-label">Contained threats</div>
            <div className="td-metric-trend">
              <CheckCircle2 size={12} />
              Marked contained in demo
            </div>
          </div>
        </section>

        <div className="td-demo-banner">
          <AlertTriangle size={18} />
          <div>
            <strong>Prototype security dashboard</strong>
            <p>
              Threats, metrics, locations, and event times on this page are
              illustrative sample data. This interface does not inspect real
              traffic, detect live attacks, or block network requests.
            </p>
          </div>
        </div>

        <div className="td-main-grid">
          <section className="td-card">
            <div className="td-card-header">
              <div>
                <h2>Threat activity overview</h2>
                <p>Illustrative event distribution across recent time windows.</p>
              </div>
              <span className="td-live-pill">
                <span className="td-live-dot" />
                Sample data
              </span>
            </div>

            <div className="td-chart-body">
              <div className="td-chart-summary">
                <div>
                  <div className="td-chart-number">{threats.length}</div>
                  <div className="td-chart-caption">Records in current demo</div>
                </div>
                <div className="td-chart-legend">
                  <span className="td-legend-item">
                    <span
                      className="td-legend-dot"
                      style={{ background: "#6c8af5" }}
                    />
                    Medium / Low
                  </span>
                  <span className="td-legend-item">
                    <span
                      className="td-legend-dot"
                      style={{ background: "#e66c79" }}
                    />
                    High / Critical
                  </span>
                </div>
              </div>

              <div
                className="td-chart"
                role="img"
                aria-label="Illustrative threat activity chart. Bars are sample values, not live telemetry."
              >
                {[
                  { label: "09 AM", blue: 42, red: 72 },
                  { label: "10 AM", blue: 55, red: 48 },
                  { label: "11 AM", blue: 35, red: 62 },
                  { label: "12 PM", blue: 64, red: 42 },
                  { label: "01 PM", blue: 48, red: 77 },
                  { label: "02 PM", blue: 72, red: 56 },
                  { label: "03 PM", blue: 39, red: 67 },
                  { label: "04 PM", blue: 58, red: 39 },
                ].map((bar) => (
                  <div className="td-chart-col" key={bar.label}>
                    <div className="td-bar-stack">
                      <div
                        className="td-bar td-bar-blue"
                        style={{ height: `${bar.blue}%` }}
                        title={`Illustrative lower-severity value: ${bar.blue}`}
                      />
                      <div
                        className="td-bar td-bar-red"
                        style={{ height: `${bar.red}%` }}
                        title={`Illustrative higher-severity value: ${bar.red}`}
                      />
                    </div>
                    <span className="td-chart-label">{bar.label}</span>
                  </div>
                ))}
              </div>

              <div className="td-chart-footnote">
                Visualization only. Connect your SIEM, gateway, or detection
                service to display real event counts and time-series data.
              </div>
            </div>
          </section>

          <section className="td-card">
            <div className="td-card-header">
              <div>
                <h2>Severity distribution</h2>
                <p>Current sample records by severity level.</p>
              </div>
              <Filter size={16} color="#8792a5" />
            </div>

            <div className="td-risk-list">
              {(
                [
                  ["Critical", "td-risk-critical"],
                  ["High", "td-risk-high"],
                  ["Medium", "td-risk-medium"],
                  ["Low", "td-risk-low"],
                ] as const
              ).map(([severity, colorClass]) => {
                const count = threats.filter(
                  (threat) => threat.severity === severity
                ).length;

                return (
                  <button
                    key={severity}
                    onClick={() => {
                      setSeverityFilter(severity);
                      setActiveTab("threats");
                      document
                        .getElementById("td-threat-list")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="td-risk-item"
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: 0,
                      textAlign: "left",
                    }}
                  >
                    <span className={`td-risk-marker ${colorClass}`} />
                    <span className="td-risk-copy">
                      <strong>{severity} severity</strong>
                      <span>
                        {severity === "Critical"
                          ? "Immediate review recommended"
                          : severity === "High"
                          ? "Prioritize investigation"
                          : severity === "Medium"
                          ? "Review and validate"
                          : "Routine follow-up"}
                      </span>
                    </span>
                    <span className="td-risk-number">{count}</span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        <section className="td-card td-table-card" id="td-threat-list">
          <div className="td-card-header">
            <div>
              <h2>Threat inventory</h2>
              <p>
                Search, filter, and review detection records and response status.
              </p>
            </div>
            <span className="td-live-pill">
              <span className="td-live-dot" />
              {threats.length} records
            </span>
          </div>

          <div className="td-tabs">
            <button
              className={`td-tab ${activeTab === "threats" ? "active" : ""}`}
              onClick={() => setActiveTab("threats")}
            >
              <ShieldAlert size={14} />
              All threats
              <span className="td-tab-count">{threats.length}</span>
            </button>
            <button
              className={`td-tab ${activeTab === "timeline" ? "active" : ""}`}
              onClick={() => setActiveTab("timeline")}
            >
              <Clock3 size={14} />
              Detection timeline
            </button>
          </div>

          {activeTab === "threats" ? (
            <>
              <div className="td-toolbar">
                <div className="td-search">
                  <Search size={14} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search threat, ID, source, target..."
                    aria-label="Search threat records"
                  />
                </div>

                <select
                  className="td-select"
                  value={severityFilter}
                  onChange={(event) => setSeverityFilter(event.target.value)}
                  aria-label="Filter by severity"
                >
                  <option>All severities</option>
                  <option>Critical</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>

                <select
                  className="td-select"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  aria-label="Filter by status"
                >
                  <option>All statuses</option>
                  <option>Detected</option>
                  <option>Investigating</option>
                  <option>Contained</option>
                  <option>Resolved</option>
                </select>

                <select
                  className="td-select"
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  aria-label="Filter by category"
                >
                  <option>All categories</option>
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>

                <select
                  className="td-select"
                  value={sortOrder}
                  onChange={(event) =>
                    setSortOrder(event.target.value as "severity" | "recent")
                  }
                  aria-label="Sort threat records"
                >
                  <option value="severity">Sort: Severity</option>
                  <option value="recent">Sort: Threat ID</option>
                </select>

                <button className="td-btn" onClick={resetFilters}>
                  Reset
                </button>
              </div>

              {filteredThreats.length === 0 ? (
                <div className="td-empty">
                  <Search size={25} />
                  <h3>No threats found</h3>
                  <p>Try changing your search term or filters.</p>
                </div>
              ) : (
                <div className="td-table-wrap">
                  <table className="td-table">
                    <thead>
                      <tr>
                        <th>Threat</th>
                        <th>Severity</th>
                        <th>Source / Target</th>
                        <th>Detected at</th>
                        <th>Status</th>
                        <th>Investigate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredThreats.map((threat) => (
                        <tr key={threat.id}>
                          <td>
                            <div className="td-threat-cell">
                              <div className="td-threat-icon">
                                <ShieldAlert size={17} />
                              </div>
                              <div>
                                <div className="td-threat-title">
                                  {threat.title}
                                </div>
                                <div className="td-threat-sub">
                                  {threat.category}
                                </div>
                                <div
                                  className="td-id"
                                  style={{ marginTop: 5 }}
                                >
                                  {threat.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={severityClass(threat.severity)}>
                              <span className="td-live-dot" />
                              {threat.severity}
                            </span>
                          </td>
                          <td>
                            <div
                              style={{
                                color: "#34415a",
                                fontSize: 10,
                                fontWeight: 700,
                                marginBottom: 5,
                              }}
                            >
                              {threat.source}
                            </div>
                            <div className="td-threat-sub">
                              Target: {threat.target}
                            </div>
                          </td>
                          <td>
                            <div style={{ minWidth: 115 }}>
                              <div
                                style={{
                                  color: "#59667d",
                                  fontSize: 10,
                                  marginBottom: 5,
                                }}
                              >
                                {threat.detectedAt}
                              </div>
                              <div className="td-threat-sub">
                                {threat.location}
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={statusClass(threat.status)}>
                              {threat.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className="td-icon-btn"
                              title="Investigate threat"
                              aria-label={`Investigate ${threat.title}`}
                              onClick={() => setSelectedThreat(threat)}
                            >
                              <Eye size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="td-footer">
                <span>
                  Showing {filteredThreats.length} of {threats.length} records
                </span>
                <span>Sample data · No live detection connected</span>
              </div>
            </>
          ) : (
            <div className="td-activity-list">
              {initialTimeline.map((item, index) => (
                <div className="td-activity-item" key={`${item.time}-${item.title}`}>
                  <div className="td-activity-icon">
                    {index === 0 ? (
                      <ShieldAlert size={15} />
                    ) : index === 1 ? (
                      <Network size={15} />
                    ) : index === 2 ? (
                      <LockKeyhole size={15} />
                    ) : (
                      <Monitor size={15} />
                    )}
                  </div>
                  <div className="td-activity-copy">
                    <strong>{item.title}</strong>
                    <p>{item.detail}</p>
                  </div>
                  <span className="td-activity-time">{item.time}</span>
                </div>
              ))}
              <div className="td-chart-footnote">
                This timeline is illustrative and does not represent a live
                security event stream.
              </div>
            </div>
          )}
        </section>

        <div className="td-bottom-grid">
          <section className="td-card">
            <div className="td-card-header">
              <div>
                <h2>Recent detection events</h2>
                <p>Example events to help demonstrate the investigation workflow.</p>
              </div>
              <Activity size={16} color="#8792a5" />
            </div>

            <div className="td-activity-list">
              {threats.slice(0, 4).map((threat) => (
                <div className="td-activity-item" key={threat.id}>
                  <div className="td-activity-icon">
                    {threat.category === "Identity & Access" ? (
                      <Fingerprint size={15} />
                    ) : threat.category === "API Security" ? (
                      <Network size={15} />
                    ) : threat.category === "Data Protection" ? (
                      <FileWarning size={15} />
                    ) : (
                      <Globe size={15} />
                    )}
                  </div>
                  <div className="td-activity-copy">
                    <strong>{threat.title}</strong>
                    <p>
                      {threat.id} · {threat.category} · {threat.severity}
                    </p>
                  </div>
                  <button
                    className="td-icon-btn"
                    title="View event"
                    aria-label={`View ${threat.title}`}
                    onClick={() => setSelectedThreat(threat)}
                  >
                    <ArrowUpRight size={15} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="td-card">
            <div className="td-card-header">
              <div>
                <h2>Response recommendations</h2>
                <p>Suggested operational steps for a production workflow.</p>
              </div>
              <ShieldCheck size={17} color="#8792a5" />
            </div>

            <div className="td-response-list">
              <div className="td-response-item">
                <CheckCircle2 size={16} />
                <div>
                  <strong>Validate detection signals</strong>
                  <p>
                    Correlate alerts with source logs and confirm whether the
                    event is malicious before taking action.
                  </p>
                </div>
              </div>

              <div className="td-response-item">
                <CheckCircle2 size={16} />
                <div>
                  <strong>Contain confirmed incidents</strong>
                  <p>
                    Apply approved access restrictions, rate limits, or session
                    revocation through authorized backend controls.
                  </p>
                </div>
              </div>

              <div className="td-response-item">
                <CheckCircle2 size={16} />
                <div>
                  <strong>Preserve audit evidence</strong>
                  <p>
                    Record the investigator, timestamps, decision, and
                    remediation outcome for each security event.
                  </p>
                </div>
              </div>

              <div className="td-response-item">
                <Server size={16} />
                <div>
                  <strong>Connect a detection engine</strong>
                  <p>
                    Integrate authenticated backend event ingestion and alert
                    correlation before relying on this dashboard operationally.
                  </p>
                </div>
              </div>

              <button
                className="td-card-link"
                onClick={() =>
                  notify(
                    "Connect your backend incident-response workflow to automate these steps."
                  )
                }
              >
                Configure response workflow
                <ArrowUpRight size={13} />
              </button>
            </div>
          </section>
        </div>

        <p className="td-page-note">
          ModelNow Threat Detection · Frontend prototype. Connect real event
          ingestion, detection rules, audit storage, and authenticated response
          APIs before using this interface for security operations.
        </p>
      </div>

      {selectedThreat && (
        <div
          className="td-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedThreat(null);
            }
          }}
        >
          <div className="td-modal" role="dialog" aria-modal="true">
            <div className="td-modal-header">
              <div>
                <h2>Threat investigation</h2>
                <p>
                  {selectedThreat.id} · {selectedThreat.category}
                </p>
              </div>
              <button
                className="td-close"
                onClick={() => setSelectedThreat(null)}
                aria-label="Close threat details"
              >
                <X size={17} />
              </button>
            </div>

            <div className="td-modal-body">
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 12,
                  marginBottom: 17,
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: "0 0 7px",
                      color: "#29364e",
                      fontSize: 14,
                      lineHeight: 1.5,
                    }}
                  >
                    {selectedThreat.title}
                  </h3>
                  <div style={{ color: "#8792a5", fontSize: 10 }}>
                    Detected {selectedThreat.detectedAt}
                  </div>
                </div>
                <span className={severityClass(selectedThreat.severity)}>
                  {selectedThreat.severity}
                </span>
              </div>

              <p>{selectedThreat.description}</p>

              <div className="td-detail-row">
                <div className="td-detail-box">
                  <span>Source</span>
                  <strong>{selectedThreat.source}</strong>
                </div>
                <div className="td-detail-box">
                  <span>Target</span>
                  <strong>{selectedThreat.target}</strong>
                </div>
                <div className="td-detail-box">
                  <span>Location</span>
                  <strong>{selectedThreat.location}</strong>
                </div>
                <div className="td-detail-box">
                  <span>Current status</span>
                  <strong>{selectedThreat.status}</strong>
                </div>
              </div>

              <div className="td-modal-section-title">
                Indicators to review
              </div>

              {selectedThreat.indicators.map((indicator) => (
                <div className="td-indicator" key={indicator}>
                  <AlertTriangle size={13} />
                  {indicator}
                </div>
              ))}

              <div className="td-modal-section-title">
                Recommended next step
              </div>
              <div className="td-recommendation">
                {selectedThreat.recommendation}
              </div>

              <div className="td-modal-section-title">Update workflow status</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {(
                  [
                    "Detected",
                    "Investigating",
                    "Contained",
                    "Resolved",
                  ] as ThreatStatus[]
                ).map((status) => (
                  <button
                    key={status}
                    className={`td-btn ${
                      selectedThreat.status === status ? "td-btn-primary" : ""
                    }`}
                    onClick={() =>
                      updateThreatStatus(selectedThreat.id, status)
                    }
                  >
                    {selectedThreat.status === status && <Check size={13} />}
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="td-modal-footer">
              <button
                className="td-btn"
                onClick={() => setSelectedThreat(null)}
              >
                Close
              </button>
              {selectedThreat.status !== "Contained" &&
                selectedThreat.status !== "Resolved" && (
                  <button
                    className="td-btn td-btn-primary"
                    onClick={() =>
                      updateThreatStatus(selectedThreat.id, "Contained")
                    }
                  >
                    <ShieldCheck size={14} />
                    Mark contained
                  </button>
                )}
            </div>
          </div>
        </div>
      )}

      {confirmThreat && (
        <div className="td-modal-overlay">
          <div className="td-modal" role="dialog" aria-modal="true">
            <div className="td-modal-header">
              <div>
                <h2>Confirm response action</h2>
                <p>{confirmThreat.id}</p>
              </div>
              <button
                className="td-close"
                onClick={() => setConfirmThreat(null)}
                aria-label="Close confirmation"
              >
                <X size={17} />
              </button>
            </div>
            <div className="td-modal-body">
              This action changes the status in the local demo only. It does not
              block traffic, disable an account, or modify a production system.
            </div>
            <div className="td-modal-footer">
              <button
                className="td-btn"
                onClick={() => setConfirmThreat(null)}
              >
                Cancel
              </button>
              <button
                className="td-btn td-btn-primary"
                onClick={() =>
                  updateThreatStatus(confirmThreat.id, "Contained")
                }
              >
                <Ban size={14} />
                Confirm containment
              </button>
            </div>
          </div>
        </div>
      )}

      {notice && (
        <div className="td-toast" role="status">
          <CheckCircle2 size={16} color="#73e0ac" />
          {notice}
        </div>
      )}
    </main>
  );
}
