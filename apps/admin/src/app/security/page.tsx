
"use client";

import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  FileSearch,
  Fingerprint,
  Globe,
  KeyRound,
  LockKeyhole,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Users,
  X,
} from "lucide-react";

const securityPages = [
  {
    title: "Identity & Authentication",
    description: "Sign-in methods, MFA, and identity providers",
    href: "/security/identity-authentication",
    icon: Fingerprint,
  },
  {
    title: "Access Control",
    description: "Roles, permissions, and access reviews",
    href: "/security/access-control",
    icon: Users,
  },
  {
    title: "Sessions & Devices",
    description: "Active sessions and registered devices",
    href: "/security/sessions-devices",
    icon: Activity,
  },
  {
    title: "API Security",
    description: "API keys, credentials, and request protection",
    href: "/security/api-security",
    icon: KeyRound,
  },
  {
    title: "Data Protection",
    description: "Data handling, privacy, and retention",
    href: "/security/data-protection",
    icon: LockKeyhole,
  },
  {
    title: "Encryption & Secrets",
    description: "Encryption configuration and secret management",
    href: "/security/encryption-secrets",
    icon: ShieldCheck,
  },
  {
    title: "Threat Detection",
    description: "Threat signals and suspicious activity",
    href: "/security/threat-detection",
    icon: ShieldAlert,
  },
  {
    title: "Vulnerability Management",
    description: "Security findings and remediation tracking",
    href: "/security/vulnerability-management",
    icon: AlertTriangle,
  },
  {
    title: "Security Incidents",
    description: "Incident investigation and response tracking",
    href: "/security/security-incidents",
    icon: Siren,
  },
  {
    title: "Network Security",
    description: "Network access and traffic protection",
    href: "/security/network-security",
    icon: Globe,
  },
  {
    title: "Compliance",
    description: "Compliance controls and evidence tracking",
    href: "/security/compliance",
    icon: FileSearch,
  },
  {
    title: "Security Policies",
    description: "Security standards and policy configuration",
    href: "/security/security-policies",
    icon: Shield,
  },
  {
    title: "Security Audit",
    description: "Review security-related administrative activity",
    href: "/security/security-audit",
    icon: Clock3,
  },
];

const initialAlerts = [
  {
    id: "SEC-1042",
    severity: "High",
    title: "Repeated authentication failures",
    source: "Identity & Authentication",
    time: "12 minutes ago",
    status: "Investigating",
  },
  {
    id: "SEC-1041",
    severity: "Medium",
    title: "API key rotation review due",
    source: "API Security",
    time: "38 minutes ago",
    status: "Open",
  },
  {
    id: "SEC-1040",
    severity: "Low",
    title: "Access review reminder",
    source: "Access Control",
    time: "2 hours ago",
    status: "Open",
  },
];

type AlertItem = (typeof initialAlerts)[number];

const severityStyles: Record<
  string,
  { color: string; background: string; border: string }
> = {
  Critical: {
    color: "#b91c1c",
    background: "#fef2f2",
    border: "#fecaca",
  },
  High: {
    color: "#c2410c",
    background: "#fff7ed",
    border: "#fed7aa",
  },
  Medium: {
    color: "#a16207",
    background: "#fefce8",
    border: "#fde68a",
  },
  Low: {
    color: "#0369a1",
    background: "#eff6ff",
    border: "#bfdbfe",
  },
};

const priorities = [
  {
    title: "Identity protection",
    description: "Review MFA and sign-in controls.",
    icon: Fingerprint,
    color: "#315fea",
    background: "#eef2ff",
  },
  {
    title: "Credential hygiene",
    description: "Review API key rotation and secret access.",
    icon: KeyRound,
    color: "#7c3aed",
    background: "#f5f3ff",
  },
  {
    title: "Access reviews",
    description: "Validate privileged role assignments.",
    icon: Users,
    color: "#15803d",
    background: "#f0fdf4",
  },
  {
    title: "Incident readiness",
    description: "Review incident ownership and response plans.",
    icon: Siren,
    color: "#c2410c",
    background: "#fff7ed",
  },
];

export default function SecurityOverviewPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [lastUpdated, setLastUpdated] = useState("Just now");
  const [notice, setNotice] = useState("");

  const unresolvedCount = alerts.filter(
    (alert) => alert.status !== "Resolved"
  ).length;

  const activeIncidents = alerts.filter(
    (alert) =>
      (alert.severity === "Critical" || alert.severity === "High") &&
      alert.status !== "Resolved"
  ).length;

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSeverity = filter === "All" || alert.severity === filter;
    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      alert.id.toLowerCase().includes(query) ||
      alert.title.toLowerCase().includes(query) ||
      alert.source.toLowerCase().includes(query);

    return matchesSeverity && matchesSearch;
  });

  const metrics = [
    {
      title: "Security posture",
      value: "Good",
      detail: "Illustrative overall status",
      icon: ShieldCheck,
      color: "#15803d",
      background: "#f0fdf4",
      trend: "Demo status",
      direction: "up",
    },
    {
      title: "Open alerts",
      value: String(unresolvedCount),
      detail: "Unresolved sample alerts",
      icon: AlertTriangle,
      color: "#c2410c",
      background: "#fff7ed",
      trend: "Needs review",
      direction: "down",
    },
    {
      title: "Protected modules",
      value: "14",
      detail: "Security areas in this workspace",
      icon: LockKeyhole,
      color: "#315fea",
      background: "#eff6ff",
      trend: "Overview + 13 pages",
      direction: "up",
    },
    {
      title: "Active incidents",
      value: String(activeIncidents),
      detail: "Sample high-priority signals",
      icon: Siren,
      color: "#7c3aed",
      background: "#f5f3ff",
      trend: "Review required",
      direction: "down",
    },
  ];

  function refreshOverview() {
    setLastUpdated(
      new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
    setNotice(
      "Demo overview refreshed. Live security telemetry is not connected."
    );
  }

  function updateAlertStatus(id: string, status: string) {
    setAlerts((current) =>
      current.map((alert) =>
        alert.id === id ? { ...alert, status } : alert
      )
    );

    setSelectedAlert((current) =>
      current?.id === id ? { ...current, status } : current
    );

    setNotice(`${id} marked as ${status.toLowerCase()} in the local demo.`);
  }

  return (
    <main className="mn-security">
      <style>{`
        .mn-security {
          --mn-blue: #315fea;
          --mn-text: #111827;
          --mn-muted: #667085;
          --mn-border: #e5e7eb;
          min-height: 100vh;
          width: 100%;
          box-sizing: border-box;
          padding: 28px 32px 36px;
          background: #f7f8fc;
          color: var(--mn-text);
          font-family: Arial, Helvetica, sans-serif;
        }

        .mn-security *,
        .mn-security *::before,
        .mn-security *::after {
          box-sizing: border-box;
        }

        .mn-security button,
        .mn-security input,
        .mn-security select {
          font: inherit;
        }

        .mn-security button {
          cursor: pointer;
        }

        .mn-container {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
        }

        .mn-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 24px;
        }

        .mn-eyebrow {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
          color: var(--mn-blue);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .mn-title {
          margin: 0;
          font-size: clamp(25px, 2.3vw, 34px);
          font-weight: 750;
          line-height: 1.2;
          letter-spacing: -1px;
        }

        .mn-subtitle {
          max-width: 720px;
          margin: 10px 0 0;
          color: var(--mn-muted);
          font-size: 14px;
          line-height: 1.7;
        }

        .mn-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 40px;
          padding: 10px 14px;
          border: 1px solid var(--mn-border);
          border-radius: 10px;
          background: #fff;
          color: #344054;
          font-size: 13px !important;
          font-weight: 600;
          white-space: nowrap;
          box-shadow: 0 1px 2px rgba(16,24,40,.04);
          transition: background .15s, border-color .15s;
        }

        .mn-button:hover {
          border-color: #c7d2fe;
          background: #f8faff;
        }

        .mn-demo-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 20px;
          padding: 12px 15px;
          border: 1px solid #dbeafe;
          border-radius: 12px;
          background: #eff6ff;
          color: #1e40af;
          font-size: 12px;
          line-height: 1.6;
        }

        .mn-demo-label {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .mn-notice {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 20px;
          padding: 12px 15px;
          border: 1px solid #bbf7d0;
          border-radius: 12px;
          background: #f0fdf4;
          color: #166534;
          font-size: 13px;
          line-height: 1.5;
        }

        .mn-dismiss {
          display: grid;
          width: 28px;
          height: 28px;
          flex: 0 0 auto;
          place-items: center;
          border: 0;
          border-radius: 7px;
          background: transparent;
          color: inherit;
        }

        .mn-dismiss:hover {
          background: rgba(0,0,0,.05);
        }

        .mn-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .mn-card {
          min-width: 0;
          border: 1px solid var(--mn-border);
          border-radius: 15px;
          background: #fff;
          box-shadow: 0 2px 5px rgba(16,24,40,.025);
        }

        .mn-metric-card {
          display: flex;
          min-height: 174px;
          flex-direction: column;
          padding: 19px;
        }

        .mn-metric-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .mn-metric-label {
          margin: 0;
          color: var(--mn-muted);
          font-size: 13px;
          font-weight: 600;
          line-height: 1.5;
        }

        .mn-metric-value {
          margin: 12px 0 0;
          color: #101828;
          font-size: 29px;
          font-weight: 750;
          line-height: 1.15;
          letter-spacing: -.7px;
        }

        .mn-metric-icon {
          display: grid;
          width: 43px;
          height: 43px;
          flex: 0 0 auto;
          place-items: center;
          border-radius: 12px;
        }

        .mn-metric-detail {
          margin: 11px 0 0;
          color: #667085;
          font-size: 12px;
          line-height: 1.5;
        }

        .mn-metric-trend {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: auto;
          padding-top: 13px;
          font-size: 11px;
          font-weight: 600;
        }

        .mn-content-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.8fr) minmax(270px, 1fr);
          gap: 20px;
          align-items: start;
          margin-bottom: 28px;
        }

        .mn-panel {
          min-width: 0;
          padding: 21px;
        }

        .mn-panel-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .mn-panel-title {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          line-height: 1.4;
        }

        .mn-panel-description {
          margin: 5px 0 0;
          color: var(--mn-muted);
          font-size: 12px;
          line-height: 1.6;
        }

        .mn-count-pill {
          padding: 7px 10px;
          border-radius: 8px;
          background: #f2f4f7;
          color: #475467;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
        }

        .mn-filters {
          display: flex;
          gap: 10px;
          margin: 18px 0 15px;
        }

        .mn-search {
          position: relative;
          min-width: 0;
          flex: 1;
        }

        .mn-search svg {
          position: absolute;
          top: 50%;
          left: 12px;
          color: #98a2b3;
          transform: translateY(-50%);
          pointer-events: none;
        }

        .mn-input,
        .mn-select {
          display: block;
          width: 100%;
          min-height: 40px;
          padding: 10px 12px;
          border: 1px solid #d0d5dd;
          border-radius: 9px;
          outline: none;
          background: #fff;
          color: #344054;
          font-size: 12px !important;
        }

        .mn-input {
          padding-left: 36px;
        }

        .mn-input:focus,
        .mn-select:focus {
          border-color: var(--mn-blue);
          box-shadow: 0 0 0 3px rgba(49,95,234,.1);
        }

        .mn-select {
          width: auto;
          min-width: 135px;
        }

        .mn-alert-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .mn-alert-row {
          display: flex;
          width: 100%;
          min-width: 0;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 14px;
          border: 1px solid #eaecf0;
          border-radius: 12px;
          background: #fff;
          color: #101828;
          text-align: left;
          transition: border-color .15s, background .15s;
        }

        .mn-alert-row:hover {
          border-color: #c7d2fe;
          background: #fafbff;
        }

        .mn-alert-main {
          display: flex;
          min-width: 0;
          align-items: flex-start;
          gap: 11px;
        }

        .mn-alert-icon {
          display: grid;
          width: 36px;
          height: 36px;
          flex: 0 0 auto;
          place-items: center;
          border-radius: 10px;
          background: #f2f4f7;
          color: #667085;
        }

        .mn-alert-copy {
          min-width: 0;
        }

        .mn-alert-title-line {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 7px;
        }

        .mn-alert-title {
          font-size: 12px;
          font-weight: 700;
          line-height: 1.5;
        }

        .mn-severity {
          display: inline-flex;
          align-items: center;
          padding: 4px 7px;
          border: 1px solid transparent;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 700;
        }

        .mn-alert-meta {
          margin: 5px 0 0;
          color: #667085;
          font-size: 11px;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .mn-alert-time {
          margin: 5px 0 0;
          color: #98a2b3;
          font-size: 10px;
        }

        .mn-alert-status {
          display: flex;
          flex: 0 0 auto;
          align-items: center;
          gap: 7px;
          color: #667085;
          font-size: 11px;
        }

        .mn-empty {
          padding: 30px 12px;
          border: 1px dashed #d0d5dd;
          border-radius: 12px;
          color: #667085;
          font-size: 13px;
          text-align: center;
        }

        .mn-priority-list {
          display: flex;
          flex-direction: column;
          gap: 0;
          margin-top: 18px;
        }

        .mn-priority {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          padding: 14px 0;
          border-bottom: 1px solid #eaecf0;
        }

        .mn-priority:first-child {
          padding-top: 0;
        }

        .mn-priority:last-child {
          padding-bottom: 0;
          border-bottom: 0;
        }

        .mn-priority-icon {
          display: grid;
          width: 37px;
          height: 37px;
          flex: 0 0 auto;
          place-items: center;
          border-radius: 10px;
        }

        .mn-priority-title {
          margin: 0;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.5;
        }

        .mn-priority-description {
          margin: 4px 0 0;
          color: #667085;
          font-size: 11px;
          line-height: 1.6;
        }

        .mn-section-heading {
          margin-bottom: 16px;
        }

        .mn-section-title {
          margin: 0;
          font-size: 19px;
          font-weight: 750;
          letter-spacing: -.3px;
        }

        .mn-section-description {
          margin: 6px 0 0;
          color: #667085;
          font-size: 13px;
          line-height: 1.6;
        }

        .mn-page-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 15px;
        }

        .mn-page-card {
          display: flex;
          min-width: 0;
          align-items: flex-start;
          gap: 13px;
          padding: 17px;
          border: 1px solid #e4e7ec;
          border-radius: 14px;
          background: #fff;
          color: inherit;
          text-decoration: none;
          box-shadow: 0 2px 5px rgba(16,24,40,.02);
          transition: transform .15s, border-color .15s, box-shadow .15s;
        }

        .mn-page-card:hover {
          transform: translateY(-2px);
          border-color: #c7d2fe;
          box-shadow: 0 7px 16px rgba(16,24,40,.06);
        }

        .mn-page-icon {
          display: grid;
          width: 42px;
          height: 42px;
          flex: 0 0 auto;
          place-items: center;
          border-radius: 11px;
          background: #eef2ff;
          color: var(--mn-blue);
          transition: background .15s, color .15s;
        }

        .mn-page-card:hover .mn-page-icon {
          background: var(--mn-blue);
          color: #fff;
        }

        .mn-page-copy {
          min-width: 0;
          flex: 1;
        }

        .mn-page-title {
          margin: 1px 0 0;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .mn-page-description {
          margin: 6px 0 0;
          color: #667085;
          font-size: 11px;
          line-height: 1.6;
        }

        .mn-page-arrow {
          flex: 0 0 auto;
          margin-top: 3px;
          color: #98a2b3;
          transition: transform .15s, color .15s;
        }

        .mn-page-card:hover .mn-page-arrow {
          color: var(--mn-blue);
          transform: translateX(3px);
        }

        .mn-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 28px;
          padding-top: 17px;
          border-top: 1px solid #e4e7ec;
          color: #98a2b3;
          font-size: 11px;
        }

        .mn-footer-status {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #15803d;
        }

        .mn-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
          background: rgba(16,24,40,.45);
          backdrop-filter: blur(2px);
        }

        .mn-drawer {
          width: 100%;
          max-width: 440px;
          height: 100%;
          overflow-y: auto;
          padding: 26px;
          background: #fff;
          box-shadow: -12px 0 35px rgba(16,24,40,.12);
          animation: mn-slide-in .18s ease-out;
        }

        @keyframes mn-slide-in {
          from { transform: translateX(20px); opacity: .7; }
          to { transform: translateX(0); opacity: 1; }
        }

        .mn-drawer-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .mn-drawer-eyebrow {
          margin: 0;
          color: var(--mn-blue);
          font-size: 11px;
          font-weight: 750;
          letter-spacing: 1px;
        }

        .mn-drawer-title {
          margin: 10px 0 0;
          font-size: 21px;
          font-weight: 750;
          line-height: 1.4;
          overflow-wrap: anywhere;
        }

        .mn-drawer-id {
          margin: 7px 0 0;
          color: #667085;
          font-size: 12px;
        }

        .mn-close {
          display: grid;
          width: 36px;
          height: 36px;
          flex: 0 0 auto;
          place-items: center;
          border: 1px solid #e4e7ec;
          border-radius: 10px;
          background: #fff;
          color: #475467;
        }

        .mn-close:hover {
          background: #f9fafb;
        }

        .mn-detail-list {
          margin-top: 25px;
          border-top: 1px solid #eaecf0;
        }

        .mn-detail-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          padding: 14px 0;
          border-bottom: 1px solid #eaecf0;
          font-size: 12px;
        }

        .mn-detail-label {
          color: #667085;
        }

        .mn-detail-value {
          color: #344054;
          font-weight: 650;
          text-align: right;
          overflow-wrap: anywhere;
        }

        .mn-warning {
          margin-top: 23px;
          padding: 14px;
          border: 1px solid #fde68a;
          border-radius: 11px;
          background: #fffbeb;
          color: #92400e;
          font-size: 12px;
          line-height: 1.7;
        }

        .mn-status-heading {
          margin: 25px 0 11px;
          font-size: 13px;
          font-weight: 750;
        }

        .mn-status-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .mn-status-button {
          padding: 9px 12px;
          border: 1px solid #e4e7ec;
          border-radius: 9px;
          background: #fff;
          color: #475467;
          font-size: 11px !important;
          font-weight: 650;
        }

        .mn-status-button:hover {
          background: #f9fafb;
        }

        .mn-status-button.is-selected {
          border-color: #a5b4fc;
          background: #eef2ff;
          color: var(--mn-blue);
        }

        .mn-done-button {
          display: flex;
          width: 100%;
          justify-content: center;
          align-items: center;
          min-height: 43px;
          margin-top: 25px;
          padding: 11px 16px;
          border: 0;
          border-radius: 10px;
          background: var(--mn-blue);
          color: #fff;
          font-size: 13px !important;
          font-weight: 700;
        }

        .mn-done-button:hover {
          background: #244bd0;
        }

        @media (max-width: 1100px) {
          .mn-security { padding: 24px; }
          .mn-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .mn-content-grid { grid-template-columns: minmax(0, 1.4fr) minmax(250px, 1fr); }
          .mn-page-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        @media (max-width: 760px) {
          .mn-security { padding: 19px 15px 28px; }
          .mn-header { flex-direction: column; align-items: stretch; }
          .mn-header .mn-button { align-self: flex-start; }
          .mn-content-grid { grid-template-columns: minmax(0, 1fr); }
          .mn-panel { padding: 16px; }
          .mn-page-grid { grid-template-columns: minmax(0, 1fr); }
          .mn-demo-banner { align-items: flex-start; }
        }

        @media (max-width: 440px) {
          .mn-metrics { grid-template-columns: minmax(0, 1fr); }
          .mn-metric-card { min-height: 155px; }
          .mn-filters { flex-direction: column; }
          .mn-select { width: 100%; }
          .mn-alert-row { align-items: flex-start; }
          .mn-alert-status { font-size: 10px; }
          .mn-drawer { padding: 20px 17px; }
        }
      `}</style>

      <div className="mn-container">
        <header className="mn-header">
          <div>
            <div className="mn-eyebrow">
              <ShieldCheck size={17} />
              <span>ModelNow Admin</span>
              <span style={{ color: "#cbd5e1" }}>/</span>
              <span>Security</span>
            </div>

            <h1 className="mn-title">Security Overview</h1>

            <p className="mn-subtitle">
              Monitor security signals, review potential risks, and navigate
              your organization&apos;s security controls.
            </p>
          </div>

          <button className="mn-button" onClick={refreshOverview}>
            <RefreshCw size={15} />
            Refresh overview
          </button>
        </header>

        <div className="mn-demo-banner">
          <div className="mn-demo-label">
            <Activity size={17} />
            <span>
              <strong>Demo environment.</strong> Metrics and alerts are sample
              data, not live security findings.
            </span>
          </div>
          <span>Last refreshed: {lastUpdated}</span>
        </div>

        {notice && (
          <div className="mn-notice" role="status">
            <span>{notice}</span>
            <button
              className="mn-dismiss"
              onClick={() => setNotice("")}
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <section className="mn-metrics" aria-label="Security metrics">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const TrendIcon =
              metric.direction === "up" ? ArrowUpRight : ArrowDownRight;

            return (
              <article className="mn-card mn-metric-card" key={metric.title}>
                <div className="mn-metric-top">
                  <div>
                    <p className="mn-metric-label">{metric.title}</p>
                    <p className="mn-metric-value">{metric.value}</p>
                  </div>

                  <div
                    className="mn-metric-icon"
                    style={{
                      color: metric.color,
                      background: metric.background,
                    }}
                  >
                    <Icon size={21} />
                  </div>
                </div>

                <p className="mn-metric-detail">{metric.detail}</p>

                <div
                  className="mn-metric-trend"
                  style={{ color: metric.color }}
                >
                  <TrendIcon size={14} />
                  {metric.trend}
                </div>
              </article>
            );
          })}
        </section>

        <section className="mn-content-grid">
          <article className="mn-card mn-panel">
            <div className="mn-panel-heading">
              <div>
                <h2 className="mn-panel-title">Security alerts</h2>
                <p className="mn-panel-description">
                  Review and update sample security signals.
                </p>
              </div>

              <span className="mn-count-pill">
                {unresolvedCount} unresolved
              </span>
            </div>

            <div className="mn-filters">
              <div className="mn-search">
                <Search size={16} />
                <input
                  className="mn-input"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search alerts..."
                  aria-label="Search security alerts"
                />
              </div>

              <select
                className="mn-select"
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                aria-label="Filter alert severity"
              >
                <option value="All">All severities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="mn-alert-list">
              {filteredAlerts.map((alert) => {
                const style = severityStyles[alert.severity];

                return (
                  <button
                    key={alert.id}
                    className="mn-alert-row"
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <div className="mn-alert-main">
                      <div className="mn-alert-icon">
                        <ShieldAlert size={17} />
                      </div>

                      <div className="mn-alert-copy">
                        <div className="mn-alert-title-line">
                          <span className="mn-alert-title">{alert.title}</span>
                          <span
                            className="mn-severity"
                            style={{
                              color: style.color,
                              background: style.background,
                              borderColor: style.border,
                            }}
                          >
                            {alert.severity}
                          </span>
                        </div>

                        <p className="mn-alert-meta">
                          {alert.id} · {alert.source}
                        </p>
                        <p className="mn-alert-time">{alert.time}</p>
                      </div>
                    </div>

                    <div className="mn-alert-status">
                      <span>{alert.status}</span>
                      <ArrowRight size={14} />
                    </div>
                  </button>
                );
              })}

              {filteredAlerts.length === 0 && (
                <div className="mn-empty">
                  No alerts match the current filters.
                </div>
              )}
            </div>
          </article>

          <article className="mn-card mn-panel">
            <h2 className="mn-panel-title">Security priorities</h2>
            <p className="mn-panel-description">
              Suggested review areas for administrators.
            </p>

            <div className="mn-priority-list">
              {priorities.map((item) => {
                const Icon = item.icon;

                return (
                  <div className="mn-priority" key={item.title}>
                    <div
                      className="mn-priority-icon"
                      style={{
                        background: item.background,
                        color: item.color,
                      }}
                    >
                      <Icon size={18} />
                    </div>

                    <div>
                      <h3 className="mn-priority-title">{item.title}</h3>
                      <p className="mn-priority-description">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        </section>

        <section>
          <div className="mn-section-heading">
            <h2 className="mn-section-title">Security center</h2>
            <p className="mn-section-description">
              Open an area to manage its security configuration and reviews.
            </p>
          </div>

          <div className="mn-page-grid">
            {securityPages.map((page) => {
              const Icon = page.icon;

              return (
                <a className="mn-page-card" href={page.href} key={page.href}>
                  <div className="mn-page-icon">
                    <Icon size={20} />
                  </div>

                  <div className="mn-page-copy">
                    <h3 className="mn-page-title">{page.title}</h3>
                    <p className="mn-page-description">{page.description}</p>
                  </div>

                  <ArrowRight size={16} className="mn-page-arrow" />
                </a>
              );
            })}
          </div>
        </section>

        <footer className="mn-footer">
          <span>ModelNow Security Center · Frontend prototype</span>
          <span className="mn-footer-status">
            <CheckCircle2 size={14} />
            Sample dashboard loaded
          </span>
        </footer>
      </div>

      {selectedAlert && (
        <div
          className="mn-overlay"
          onClick={() => setSelectedAlert(null)}
        >
          <aside
            className="mn-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mn-alert-details-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mn-drawer-header">
              <div>
                <p className="mn-drawer-eyebrow">ALERT DETAILS</p>
                <h2
                  id="mn-alert-details-title"
                  className="mn-drawer-title"
                >
                  {selectedAlert.title}
                </h2>
                <p className="mn-drawer-id">{selectedAlert.id}</p>
              </div>

              <button
                className="mn-close"
                onClick={() => setSelectedAlert(null)}
                aria-label="Close alert details"
              >
                <X size={17} />
              </button>
            </div>

            <div className="mn-detail-list">
              <DetailRow label="Severity" value={selectedAlert.severity} />
              <DetailRow label="Source" value={selectedAlert.source} />
              <DetailRow label="Reported" value={selectedAlert.time} />
              <DetailRow label="Status" value={selectedAlert.status} />
            </div>

            <div className="mn-warning">
              This is an illustrative alert for frontend testing. No real
              threat detection or investigation is being performed.
            </div>

            <h3 className="mn-status-heading">Update status</h3>

            <div className="mn-status-buttons">
              {["Open", "Investigating", "Resolved"].map((status) => (
                <button
                  key={status}
                  className={`mn-status-button ${
                    selectedAlert.status === status ? "is-selected" : ""
                  }`}
                  onClick={() => updateAlertStatus(selectedAlert.id, status)}
                >
                  {status}
                </button>
              ))}
            </div>

            <button
              className="mn-done-button"
              onClick={() => setSelectedAlert(null)}
            >
              Done
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="mn-detail-row">
      <span className="mn-detail-label">{label}</span>
      <span className="mn-detail-value">{value}</span>
    </div>
  );
}

