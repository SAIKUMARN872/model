
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  ArrowDownToLine,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  FileSearch,
  Filter,
  Flame,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  Users,
  X,
} from "lucide-react";

type Severity = "Critical" | "High" | "Medium" | "Low";
type IncidentStatus =
  | "New"
  | "Investigating"
  | "Mitigated"
  | "Resolved";

type Incident = {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  status: IncidentStatus;
  category: string;
  source: string;
  affectedService: string;
  assignee: string;
  reportedAt: string;
  updatedAt: string;
  impact: string;
};

const initialIncidents: Incident[] = [
  {
    id: "INC-1048",
    title: "Suspicious API request burst",
    description:
      "A sample traffic pattern exceeded the configured request threshold for the AI Gateway.",
    severity: "Critical",
    status: "Investigating",
    category: "API Security",
    source: "185.220.101.42",
    affectedService: "AI Gateway",
    assignee: "Security Team",
    reportedAt: "10:42 AM",
    updatedAt: "10:48 AM",
    impact:
      "Potential service degradation and unauthorized request activity. Confirm using gateway and network telemetry.",
  },
  {
    id: "INC-1047",
    title: "Repeated authentication failures",
    description:
      "Multiple unsuccessful sign-in attempts were recorded against the authentication service.",
    severity: "High",
    status: "New",
    category: "Identity",
    source: "103.21.244.18",
    affectedService: "Identity Authentication",
    assignee: "Unassigned",
    reportedAt: "10:36 AM",
    updatedAt: "10:36 AM",
    impact:
      "Possible account abuse. Verify identity provider logs and determine whether legitimate users are affected.",
  },
  {
    id: "INC-1046",
    title: "Unusual internal traffic pattern",
    description:
      "A sample internal connection pattern differed from the expected traffic baseline.",
    severity: "Medium",
    status: "Investigating",
    category: "Network Security",
    source: "10.0.4.21",
    affectedService: "Internal Network",
    assignee: "Network Team",
    reportedAt: "10:21 AM",
    updatedAt: "10:29 AM",
    impact:
      "Potential network anomaly. Validate the source, destination, and expected service behavior.",
  },
  {
    id: "INC-1045",
    title: "Access policy review required",
    description:
      "A sample access-control event requires a permissions review.",
    severity: "Medium",
    status: "Mitigated",
    category: "Access Control",
    source: "admin@modelnow.ai",
    affectedService: "Workspace Access",
    assignee: "Platform Team",
    reportedAt: "09:54 AM",
    updatedAt: "10:05 AM",
    impact:
      "Review the affected role and permissions to verify that the current access policy is appropriate.",
  },
  {
    id: "INC-1044",
    title: "TLS certificate review",
    description:
      "A demonstration alert was created for certificate and transport-security review.",
    severity: "Low",
    status: "Resolved",
    category: "Data Protection",
    source: "system",
    affectedService: "API Services",
    assignee: "Platform Team",
    reportedAt: "09:30 AM",
    updatedAt: "09:45 AM",
    impact:
      "Validate the certificate chain and expiry dates using the production certificate-monitoring service.",
  },
];

const severityClass: Record<Severity, string> = {
  Critical: "si-critical",
  High: "si-high",
  Medium: "si-medium",
  Low: "si-low",
};

const statusClass: Record<IncidentStatus, string> = {
  New: "si-new",
  Investigating: "si-investigating",
  Mitigated: "si-mitigated",
  Resolved: "si-resolved",
};

export default function SecurityIncidentsPage() {
  const [incidents, setIncidents] = useState(initialIncidents);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedIncident, setSelectedIncident] =
    useState<Incident | null>(null);
  const [notice, setNotice] = useState("");
  const [lastUpdated, setLastUpdated] = useState("Just now");

  const metrics = useMemo(
    () => ({
      total: incidents.length,
      critical: incidents.filter(
        (incident) => incident.severity === "Critical"
      ).length,
      active: incidents.filter(
        (incident) =>
          incident.status === "New" ||
          incident.status === "Investigating"
      ).length,
      resolved: incidents.filter(
        (incident) => incident.status === "Resolved"
      ).length,
    }),
    [incidents]
  );

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(new Set(incidents.map((incident) => incident.category))),
    ],
    [incidents]
  );

  const filteredIncidents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return incidents.filter((incident) => {
      const matchesSearch =
        !query ||
        [
          incident.id,
          incident.title,
          incident.description,
          incident.category,
          incident.source,
          incident.affectedService,
          incident.assignee,
          incident.status,
          incident.severity,
        ].some((value) => value.toLowerCase().includes(query));

      return (
        matchesSearch &&
        (severityFilter === "All" ||
          incident.severity === severityFilter) &&
        (statusFilter === "All" || incident.status === statusFilter) &&
        (categoryFilter === "All" || incident.category === categoryFilter)
      );
    });
  }, [incidents, search, severityFilter, statusFilter, categoryFilter]);

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  }

  function refreshIncidents() {
    setLastUpdated("Just now");
    showNotice("Incident list refreshed.");
  }

  function updateIncident(
    id: string,
    changes: Partial<Incident>,
    message: string
  ) {
    setIncidents((current) =>
      current.map((incident) =>
        incident.id === id
          ? {
              ...incident,
              ...changes,
              updatedAt: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            }
          : incident
      )
    );

    setSelectedIncident((current) =>
      current && current.id === id
        ? {
            ...current,
            ...changes,
            updatedAt: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }
        : current
    );

    showNotice(message);
  }

  function exportIncidents() {
    const headers = [
      "Incident ID",
      "Title",
      "Description",
      "Severity",
      "Status",
      "Category",
      "Source",
      "Affected Service",
      "Assignee",
      "Reported At",
      "Updated At",
      "Impact",
    ];

    const rows = filteredIncidents.map((incident) => [
      incident.id,
      incident.title,
      incident.description,
      incident.severity,
      incident.status,
      incident.category,
      incident.source,
      incident.affectedService,
      incident.assignee,
      incident.reportedAt,
      incident.updatedAt,
      incident.impact,
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
    anchor.download = "modelnow-security-incidents.csv";
    anchor.click();

    URL.revokeObjectURL(url);
    showNotice("Incident report exported.");
  }

  function resetFilters() {
    setSearch("");
    setSeverityFilter("All");
    setStatusFilter("All");
    setCategoryFilter("All");
  }

  return (
    <main className="si-page">
      <style jsx global>{`
        .si-page {
          --si-bg: #f6f8fc;
          --si-card: #ffffff;
          --si-text: #172033;
          --si-muted: #758096;
          --si-border: #e6eaf1;
          --si-blue: #315fea;
          min-height: 100vh;
          padding: 30px;
          background: var(--si-bg);
          color: var(--si-text);
          font-family: Arial, Helvetica, sans-serif;
        }

        .si-page * {
          box-sizing: border-box;
        }

        .si-page button,
        .si-page input,
        .si-page select,
        .si-page textarea {
          font: inherit;
        }

        .si-page button {
          cursor: pointer;
        }

        .si-container {
          max-width: 1600px;
          margin: 0 auto;
        }

        .si-topbar,
        .si-heading,
        .si-card-heading,
        .si-section-heading,
        .si-drawer-heading,
        .si-incident-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .si-topbar {
          margin-bottom: 32px;
        }

        .si-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .si-brand-icon {
          display: grid;
          place-items: center;
          width: 45px;
          height: 45px;
          border-radius: 14px;
          background: #e7edff;
          color: var(--si-blue);
        }

        .si-brand-name {
          margin: 0;
          font-size: 17px;
          font-weight: 800;
        }

        .si-brand-subtitle {
          margin: 5px 0 0;
          color: var(--si-muted);
          font-size: 12px;
        }

        .si-actions,
        .si-button-row,
        .si-inline {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .si-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 40px;
          padding: 9px 13px;
          border: 1px solid var(--si-border);
          border-radius: 10px;
          background: #fff;
          color: #344054;
          font-size: 12px;
          font-weight: 700;
          transition: background 0.15s, border-color 0.15s;
        }

        .si-button:hover {
          background: #f7f9ff;
          border-color: #cbd5e7;
        }

        .si-button-primary {
          border-color: var(--si-blue);
          background: var(--si-blue);
          color: #fff;
        }

        .si-button-primary:hover {
          border-color: #244dd0;
          background: #244dd0;
          color: #fff;
        }

        .si-heading {
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .si-eyebrow {
          margin: 0 0 8px;
          color: var(--si-blue);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.4px;
          text-transform: uppercase;
        }

        .si-title {
          margin: 0;
          font-size: clamp(27px, 3vw, 35px);
          font-weight: 800;
          letter-spacing: -1px;
        }

        .si-description {
          max-width: 750px;
          margin: 9px 0 0;
          color: var(--si-muted);
          font-size: 14px;
          line-height: 1.7;
        }

        .si-live {
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

        .si-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22a365;
        }

        .si-demo-banner {
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

        .si-demo-banner strong {
          display: block;
          margin-bottom: 3px;
        }

        .si-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }

        .si-card {
          min-width: 0;
          padding: 20px;
          border: 1px solid var(--si-border);
          border-radius: 16px;
          background: var(--si-card);
          box-shadow: 0 3px 14px rgba(23, 32, 51, 0.025);
        }

        .si-metric-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 17px;
        }

        .si-metric-label {
          color: var(--si-muted);
          font-size: 12px;
          font-weight: 650;
        }

        .si-metric-icon {
          display: grid;
          place-items: center;
          width: 39px;
          height: 39px;
          border-radius: 12px;
        }

        .si-blue {
          background: #eaf0ff;
          color: #315fea;
        }

        .si-green {
          background: #e7f9ef;
          color: #16804a;
        }

        .si-orange {
          background: #fff2df;
          color: #bd6a0b;
        }

        .si-red {
          background: #ffebeb;
          color: #d63d3d;
        }

        .si-metric-value {
          margin: 0;
          font-size: 29px;
          font-weight: 800;
          letter-spacing: -0.8px;
        }

        .si-metric-foot {
          margin-top: 9px;
          color: var(--si-muted);
          font-size: 11px;
          line-height: 1.5;
        }

        .si-main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(300px, 0.85fr);
          gap: 20px;
          margin-bottom: 22px;
        }

        .si-card-heading {
          margin-bottom: 20px;
        }

        .si-card-title {
          margin: 0;
          font-size: 16px;
          font-weight: 800;
        }

        .si-card-subtitle {
          margin: 6px 0 0;
          color: var(--si-muted);
          font-size: 12px;
          line-height: 1.6;
        }

        .si-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 9px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 800;
          white-space: nowrap;
        }

        .si-critical {
          background: #ffe7e7;
          color: #c62828;
        }

        .si-high {
          background: #fff0df;
          color: #b75b0b;
        }

        .si-medium {
          background: #fff8d9;
          color: #8a6b00;
        }

        .si-low {
          background: #e7f2ff;
          color: #2859a8;
        }

        .si-new {
          background: #ffe7e7;
          color: #c62828;
        }

        .si-investigating {
          background: #fff4dc;
          color: #99630a;
        }

        .si-mitigated {
          background: #eaf0ff;
          color: #315fea;
        }

        .si-resolved {
          background: #e7f9ef;
          color: #187748;
        }

        .si-incident-list {
          display: grid;
          gap: 12px;
        }

        .si-incident-item {
          padding: 16px;
          border: 1px solid #edf0f6;
          border-radius: 12px;
          background: #fff;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .si-incident-item:hover {
          border-color: #d3def7;
          box-shadow: 0 4px 14px #17203308;
        }

        .si-incident-title {
          margin: 0;
          font-size: 13px;
          font-weight: 800;
          line-height: 1.5;
        }

        .si-incident-description {
          margin: 8px 0 13px;
          color: #68748a;
          font-size: 12px;
          line-height: 1.7;
        }

        .si-incident-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          color: var(--si-muted);
          font-size: 10px;
        }

        .si-incident-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 15px;
          padding-top: 12px;
          border-top: 1px solid #eef1f6;
        }

        .si-assignee {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #68748a;
          font-size: 11px;
        }

        .si-view {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 9px;
          border: 1px solid var(--si-border);
          border-radius: 8px;
          background: #fff;
          color: #536078;
          font-size: 10px;
          font-weight: 750;
        }

        .si-view:hover {
          background: #edf3ff;
          color: var(--si-blue);
        }

        .si-quick-list {
          display: grid;
          gap: 0;
        }

        .si-quick-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px 0;
          border-bottom: 1px solid #eef1f6;
        }

        .si-quick-row:last-child {
          border-bottom: 0;
        }

        .si-quick-icon {
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          border-radius: 11px;
          background: #edf3ff;
          color: #315fea;
        }

        .si-quick-title {
          margin: 0;
          font-size: 12px;
          font-weight: 750;
        }

        .si-quick-description {
          margin: 6px 0 0;
          color: var(--si-muted);
          font-size: 11px;
          line-height: 1.7;
        }

        .si-event-card {
          padding: 0;
          overflow: hidden;
        }

        .si-event-header {
          padding: 20px;
          border-bottom: 1px solid var(--si-border);
        }

        .si-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 18px;
        }

        .si-search {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 220px;
          max-width: 360px;
          flex: 1;
          padding: 0 12px;
          border: 1px solid var(--si-border);
          border-radius: 10px;
          background: #fff;
          color: #8490a5;
        }

        .si-search input {
          width: 100%;
          min-width: 0;
          height: 39px;
          border: 0;
          outline: none;
          background: transparent;
          color: var(--si-text);
          font-size: 12px;
        }

        .si-select {
          min-height: 39px;
          max-width: 100%;
          padding: 8px 28px 8px 10px;
          border: 1px solid var(--si-border);
          border-radius: 9px;
          outline: none;
          background: #fff;
          color: #455066;
          font-size: 11px;
        }

        .si-table-wrap {
          width: 100%;
          overflow-x: auto;
        }

        .si-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          white-space: nowrap;
        }

        .si-table th {
          padding: 14px 17px;
          background: #fafbfe;
          color: #7b8599;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        .si-table td {
          padding: 16px 17px;
          border-top: 1px solid #eef1f6;
          color: #4d586d;
          font-size: 11px;
        }

        .si-table tbody tr:hover {
          background: #f8faff;
        }

        .si-id {
          color: var(--si-blue);
          font-weight: 800;
        }

        .si-table-title {
          color: #263248;
          font-weight: 750;
        }

        .si-muted {
          margin-top: 5px;
          color: #8b95a7;
          font-size: 10px;
        }

        .si-empty {
          padding: 45px 20px;
          text-align: center;
          color: var(--si-muted);
          font-size: 12px;
        }

        .si-footer {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          padding: 14px 20px;
          border-top: 1px solid var(--si-border);
          color: var(--si-muted);
          font-size: 11px;
        }

        .si-overlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          justify-content: flex-end;
          background: rgba(15, 23, 42, 0.42);
        }

        .si-drawer {
          width: min(490px, 100%);
          height: 100%;
          overflow-y: auto;
          padding: 25px;
          background: #fff;
          box-shadow: -12px 0 45px #0002;
        }

        .si-drawer-heading {
          padding-bottom: 20px;
          border-bottom: 1px solid var(--si-border);
        }

        .si-drawer-title {
          margin: 0;
          font-size: 19px;
          font-weight: 800;
        }

        .si-drawer-subtitle {
          margin: 7px 0 0;
          color: var(--si-muted);
          font-size: 12px;
          line-height: 1.6;
        }

        .si-close {
          display: grid;
          place-items: center;
          width: 37px;
          height: 37px;
          flex-shrink: 0;
          border: 1px solid var(--si-border);
          border-radius: 10px;
          background: #fff;
          color: #59657a;
        }

        .si-detail-section {
          padding: 20px 0;
          border-bottom: 1px solid #eef1f6;
        }

        .si-detail-label {
          margin: 0 0 13px;
          color: #8993a5;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .si-detail-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 18px;
          padding: 9px 0;
          font-size: 12px;
        }

        .si-detail-row span:first-child {
          color: var(--si-muted);
        }

        .si-detail-row span:last-child {
          max-width: 65%;
          text-align: right;
          overflow-wrap: anywhere;
          font-weight: 650;
        }

        .si-detail-description {
          color: #566176;
          font-size: 13px;
          line-height: 1.8;
        }

        .si-label {
          display: block;
          margin: 14px 0 7px;
          color: #59657a;
          font-size: 11px;
          font-weight: 750;
        }

        .si-input,
        .si-textarea {
          width: 100%;
          padding: 11px 12px;
          border: 1px solid var(--si-border);
          border-radius: 9px;
          outline: none;
          background: #fff;
          color: var(--si-text);
          font-size: 12px;
        }

        .si-input:focus,
        .si-textarea:focus {
          border-color: #9cb5ff;
          box-shadow: 0 0 0 3px #315fea15;
        }

        .si-textarea {
          min-height: 90px;
          resize: vertical;
          line-height: 1.6;
        }

        .si-drawer-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          padding-top: 22px;
        }

        .si-toast {
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
          .si-page {
            padding: 22px;
          }

          .si-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .si-main-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .si-page {
            padding: 14px;
          }

          .si-topbar {
            align-items: flex-start;
            margin-bottom: 25px;
          }

          .si-brand-icon {
            width: 40px;
            height: 40px;
          }

          .si-brand-subtitle {
            font-size: 10px;
          }

          .si-actions {
            gap: 6px;
          }

          .si-actions .si-button {
            min-height: 35px;
            padding: 7px;
            font-size: 10px;
          }

          .si-heading {
            flex-direction: column;
            gap: 14px;
          }

          .si-title {
            font-size: 27px;
          }

          .si-description {
            font-size: 12px;
          }

          .si-metrics {
            gap: 10px;
          }

          .si-card {
            padding: 15px;
            border-radius: 13px;
          }

          .si-metric-value {
            font-size: 25px;
          }

          .si-metric-label {
            font-size: 11px;
          }

          .si-metric-icon {
            width: 33px;
            height: 33px;
          }

          .si-event-header {
            padding: 15px;
          }

          .si-toolbar {
            align-items: stretch;
          }

          .si-search {
            max-width: none;
            flex-basis: 100%;
          }

          .si-toolbar .si-select {
            flex: 1;
          }

          .si-drawer {
            padding: 19px;
          }

          .si-footer {
            padding: 13px 15px;
          }
        }
      `}</style>

      <div className="si-container">
        <header className="si-topbar">
          <div className="si-brand">
            <div className="si-brand-icon">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="si-brand-name">ModelNow Security</p>
              <p className="si-brand-subtitle">
                Incident response and investigation
              </p>
            </div>
          </div>

          <div className="si-actions">
            <button className="si-button" onClick={refreshIncidents}>
              <Activity size={15} />
              Refresh
            </button>
            <button
              className="si-button si-button-primary"
              onClick={exportIncidents}
            >
              <Download size={15} />
              Export report
            </button>
          </div>
        </header>

        <section className="si-heading">
          <div>
            <p className="si-eyebrow">Security operations</p>
            <h1 className="si-title">Security Incidents</h1>
            <p className="si-description">
              Identify, investigate, and track security incidents across your
              ModelNow environment from one centralized workspace.
            </p>
          </div>

          <span className="si-live">
            <span className="si-dot" />
            Incident workspace
          </span>
        </section>

        <div className="si-demo-banner">
          <ShieldAlert size={23} />
          <div>
            <strong>Incident management demonstration</strong>
            The incidents shown here are sample records. The interface does
            not automatically detect threats, send alerts, or enforce security
            actions. Connect your monitoring and incident-management backend
            for production use.
          </div>
        </div>

        <section className="si-metrics">
          <MetricCard
            label="Total incidents"
            value={metrics.total.toString()}
            foot="Records in this demonstration"
            icon={<Shield size={20} />}
            color="blue"
          />
          <MetricCard
            label="Critical incidents"
            value={metrics.critical.toString()}
            foot="Prioritize urgent investigation"
            icon={<AlertOctagon size={20} />}
            color="red"
          />
          <MetricCard
            label="Active incidents"
            value={metrics.active.toString()}
            foot="New or under investigation"
            icon={<Flame size={20} />}
            color="orange"
          />
          <MetricCard
            label="Resolved incidents"
            value={metrics.resolved.toString()}
            foot="Marked resolved in this view"
            icon={<CheckCircle2 size={20} />}
            color="green"
          />
        </section>

        <section className="si-main-grid">
          <div className="si-card">
            <div className="si-card-heading">
              <div>
                <h2 className="si-card-title">Recent incidents</h2>
                <p className="si-card-subtitle">
                  Review severity, ownership, and investigation status
                </p>
              </div>
              <AlertTriangle size={21} color="#bd6a0b" />
            </div>

            <div className="si-incident-list">
              {incidents
                .filter(
                  (incident) =>
                    incident.status === "New" ||
                    incident.status === "Investigating"
                )
                .sort((a, b) => {
                  const rank: Record<Severity, number> = {
                    Critical: 0,
                    High: 1,
                    Medium: 2,
                    Low: 3,
                  };
                  return rank[a.severity] - rank[b.severity];
                })
                .slice(0, 4)
                .map((incident) => (
                  <div className="si-incident-item" key={incident.id}>
                    <div className="si-incident-top">
                      <div>
                        <h3 className="si-incident-title">
                          {incident.title}
                        </h3>
                        <div className="si-incident-meta" style={{ marginTop: 7 }}>
                          <span>{incident.id}</span>
                          <span>·</span>
                          <span>{incident.category}</span>
                        </div>
                      </div>
                      <span
                        className={`si-pill ${severityClass[incident.severity]}`}
                      >
                        {incident.severity}
                      </span>
                    </div>

                    <p className="si-incident-description">
                      {incident.description}
                    </p>

                    <div className="si-incident-meta">
                      <Clock3 size={13} />
                      Reported {incident.reportedAt}
                      <span>·</span>
                      {incident.affectedService}
                    </div>

                    <div className="si-incident-bottom">
                      <span className="si-assignee">
                        <User size={14} />
                        {incident.assignee}
                      </span>
                      <button
                        className="si-view"
                        onClick={() => setSelectedIncident(incident)}
                      >
                        Investigate <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                ))}

              {metrics.active === 0 && (
                <div className="si-incident-item">
                  <p className="si-incident-title">No active incidents</p>
                  <p className="si-incident-description">
                    There are no new or investigating incidents in this view.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="si-card">
            <div className="si-card-heading">
              <div>
                <h2 className="si-card-title">Response checklist</h2>
                <p className="si-card-subtitle">
                  Recommended steps for incident handling
                </p>
              </div>
              <ClipboardCheckIcon />
            </div>

            <div className="si-quick-list">
              <QuickItem
                icon={<AlertCircle size={18} />}
                title="1. Triage the incident"
                description="Confirm the severity, affected assets, and scope."
              />
              <QuickItem
                icon={<FileSearch size={18} />}
                title="2. Investigate the evidence"
                description="Review network, identity, API, and application logs."
              />
              <QuickItem
                icon={<ShieldAlert size={18} />}
                title="3. Contain the impact"
                description="Follow approved response procedures and access policies."
              />
              <QuickItem
                icon={<CheckCircle2 size={18} />}
                title="4. Resolve and document"
                description="Record remediation, evidence, and lessons learned."
              />
            </div>
          </div>
        </section>

        <section className="si-card si-event-card">
          <div className="si-event-header">
            <div className="si-section-heading">
              <div>
                <h2 className="si-card-title">Incident register</h2>
                <p className="si-card-subtitle">
                  Search, filter, assign, and inspect incident records
                </p>
              </div>
              <span className="si-live">
                <span className="si-dot" />
                Demo records
              </span>
            </div>

            <div className="si-toolbar">
              <label className="si-search">
                <Search size={16} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search incident, service, source..."
                  aria-label="Search incidents"
                />
              </label>

              <div className="si-inline">
                <select
                  className="si-select"
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
                  className="si-select"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  aria-label="Filter status"
                >
                  <option value="All">All status</option>
                  <option value="New">New</option>
                  <option value="Investigating">Investigating</option>
                  <option value="Mitigated">Mitigated</option>
                  <option value="Resolved">Resolved</option>
                </select>

                <select
                  className="si-select"
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

              <button className="si-button" onClick={resetFilters}>
                <Filter size={14} />
                Reset
              </button>
            </div>
          </div>

          <div className="si-table-wrap">
            <table className="si-table">
              <thead>
                <tr>
                  <th>Incident</th>
                  <th>Service / Category</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Assignee</th>
                  <th>Updated</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncidents.map((incident) => (
                  <tr key={incident.id}>
                    <td>
                      <div className="si-id">{incident.id}</div>
                      <div className="si-muted">{incident.title}</div>
                    </td>
                    <td>
                      <div className="si-table-title">
                        {incident.affectedService}
                      </div>
                      <div className="si-muted">{incident.category}</div>
                    </td>
                    <td>
                      <span
                        className={`si-pill ${severityClass[incident.severity]}`}
                      >
                        {incident.severity}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`si-pill ${statusClass[incident.status]}`}
                      >
                        {incident.status}
                      </span>
                    </td>
                    <td>{incident.assignee}</td>
                    <td>{incident.updatedAt}</td>
                    <td>
                      <button
                        className="si-view"
                        onClick={() => setSelectedIncident(incident)}
                      >
                        <FileSearch size={13} />
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredIncidents.length === 0 && (
              <div className="si-empty">
                No incidents match your search or selected filters.
              </div>
            )}
          </div>

          <div className="si-footer">
            <span>
              Showing {filteredIncidents.length} of {incidents.length} incidents
            </span>
            <span>Last updated: {lastUpdated}</span>
          </div>
        </section>
      </div>

      {selectedIncident && (
        <div
          className="si-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedIncident(null);
            }
          }}
        >
          <aside
            className="si-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="si-drawer-title"
          >
            <div className="si-drawer-heading">
              <div>
                <h2 id="si-drawer-title" className="si-drawer-title">
                  Incident details
                </h2>
                <p className="si-drawer-subtitle">
                  Investigate and update the selected incident.
                </p>
              </div>
              <button
                className="si-close"
                onClick={() => setSelectedIncident(null)}
                aria-label="Close incident details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="si-detail-section">
              <p className="si-detail-label">Incident summary</p>
              <div className="si-inline" style={{ marginBottom: 13 }}>
                <span
                  className={`si-pill ${
                    severityClass[selectedIncident.severity]
                  }`}
                >
                  {selectedIncident.severity}
                </span>
                <span
                  className={`si-pill ${statusClass[selectedIncident.status]}`}
                >
                  {selectedIncident.status}
                </span>
              </div>
              <h3 style={{ margin: "0 0 9px", fontSize: 17 }}>
                {selectedIncident.title}
              </h3>
              <p className="si-detail-description">
                {selectedIncident.description}
              </p>
              <p className="si-detail-description">
                {selectedIncident.impact}
              </p>
            </div>

            <div className="si-detail-section">
              <p className="si-detail-label">Incident information</p>
              <DetailRow label="Incident ID" value={selectedIncident.id} />
              <DetailRow label="Source" value={selectedIncident.source} />
              <DetailRow
                label="Affected service"
                value={selectedIncident.affectedService}
              />
              <DetailRow label="Category" value={selectedIncident.category} />
              <DetailRow
                label="Reported"
                value={selectedIncident.reportedAt}
              />
              <DetailRow
                label="Last updated"
                value={selectedIncident.updatedAt}
              />
            </div>

            <div className="si-detail-section">
              <p className="si-detail-label">Investigation workflow</p>

              <label className="si-label" htmlFor="si-assignee">
                Assign to
              </label>
              <select
                id="si-assignee"
                className="si-input"
                value={selectedIncident.assignee}
                onChange={(event) =>
                  updateIncident(
                    selectedIncident.id,
                    { assignee: event.target.value },
                    `Incident assigned to ${event.target.value}.`
                  )
                }
              >
                <option>Unassigned</option>
                <option>Security Team</option>
                <option>Network Team</option>
                <option>Platform Team</option>
                <option>Identity Team</option>
                <option>Incident Response Team</option>
              </select>

              <label className="si-label" htmlFor="si-status">
                Incident status
              </label>
              <select
                id="si-status"
                className="si-input"
                value={selectedIncident.status}
                onChange={(event) =>
                  updateIncident(
                    selectedIncident.id,
                    { status: event.target.value as IncidentStatus },
                    `Incident status changed to ${event.target.value}.`
                  )
                }
              >
                <option>New</option>
                <option>Investigating</option>
                <option>Mitigated</option>
                <option>Resolved</option>
              </select>
            </div>

            <div className="si-drawer-actions">
              <button
                className="si-button"
                onClick={() => setSelectedIncident(null)}
              >
                Close
              </button>
              <button
                className="si-button si-button-primary"
                onClick={() => {
                  exportIncidents();
                  setSelectedIncident(null);
                }}
              >
                <ArrowDownToLine size={15} />
                Export report
              </button>
            </div>
          </aside>
        </div>
      )}

      {notice && (
        <div className="si-toast" role="status">
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
    <div className="si-card">
      <div className="si-metric-top">
        <span className="si-metric-label">{label}</span>
        <div className={`si-metric-icon si-${color}`}>{icon}</div>
      </div>
      <p className="si-metric-value">{value}</p>
      <div className="si-metric-foot">{foot}</div>
    </div>
  );
}

function QuickItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="si-quick-row">
      <div className="si-quick-icon">{icon}</div>
      <div>
        <p className="si-quick-title">{title}</p>
        <p className="si-quick-description">{description}</p>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="si-detail-row">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function ClipboardCheckIcon() {
  return (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        width: 39,
        height: 39,
        borderRadius: 12,
        background: "#eaf0ff",
        color: "#315fea",
      }}
    >
      <CheckCircle2 size={21} />
    </div>
  );
}
