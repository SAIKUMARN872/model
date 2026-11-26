
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowDownToLine,
  ArrowDownUp,
  Ban,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  EthernetPort,
  Eye,
  FileSearch,
  Filter,
  Globe,
  Lock,
  LockKeyhole,
  Network,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  Wifi,
  X,
  Zap,
} from "lucide-react";

type Severity = "Critical" | "High" | "Medium" | "Low";
type EventStatus = "Blocked" | "Investigating" | "Resolved" | "Allowed";

type SecurityEvent = {
  id: string;
  time: string;
  source: string;
  destination: string;
  type: string;
  severity: Severity;
  status: EventStatus;
  protocol: string;
  details: string;
};

const initialEvents: SecurityEvent[] = [
  {
    id: "SEC-1048",
    time: "10:42:18",
    source: "185.220.101.42",
    destination: "api.modelnow.ai",
    type: "Repeated API requests",
    severity: "Critical",
    status: "Blocked",
    protocol: "HTTPS",
    details:
      "Repeated requests exceeded the configured rate limit. The source was temporarily blocked by the demo security policy.",
  },
  {
    id: "SEC-1047",
    time: "10:39:51",
    source: "103.21.244.18",
    destination: "auth.modelnow.ai",
    type: "Authentication failures",
    severity: "High",
    status: "Investigating",
    protocol: "HTTPS",
    details:
      "Multiple unsuccessful sign-in attempts were detected. Review authentication records before taking further action.",
  },
  {
    id: "SEC-1046",
    time: "10:34:06",
    source: "10.0.4.21",
    destination: "gateway.modelnow.ai",
    type: "Unusual traffic pattern",
    severity: "Medium",
    status: "Investigating",
    protocol: "TCP",
    details:
      "Traffic volume differed from the configured baseline. Further analysis is required to determine whether the activity is legitimate.",
  },
  {
    id: "SEC-1045",
    time: "10:28:43",
    source: "10.0.2.15",
    destination: "10.0.4.10",
    type: "Internal connection",
    severity: "Low",
    status: "Allowed",
    protocol: "TCP",
    details:
      "An internal service connection matched the current demonstration network policy.",
  },
  {
    id: "SEC-1044",
    time: "10:21:32",
    source: "198.51.100.27",
    destination: "api.modelnow.ai",
    type: "Firewall rule match",
    severity: "High",
    status: "Blocked",
    protocol: "HTTPS",
    details:
      "The connection matched a simulated deny rule. Verify the source and rule configuration in your real firewall.",
  },
  {
    id: "SEC-1043",
    time: "10:15:09",
    source: "10.0.3.19",
    destination: "knowledge.modelnow.ai",
    type: "TLS connection",
    severity: "Low",
    status: "Resolved",
    protocol: "TLS",
    details:
      "The demonstration event was marked resolved. Real TLS certificate and handshake validation requires backend telemetry.",
  },
];

const traffic = [
  { label: "08:00", inbound: 34, outbound: 20 },
  { label: "09:00", inbound: 48, outbound: 28 },
  { label: "10:00", inbound: 72, outbound: 43 },
  { label: "11:00", inbound: 58, outbound: 35 },
  { label: "12:00", inbound: 83, outbound: 48 },
  { label: "13:00", inbound: 64, outbound: 39 },
  { label: "14:00", inbound: 92, outbound: 55 },
];

const severityClass: Record<Severity, string> = {
  Critical: "ns-critical",
  High: "ns-high",
  Medium: "ns-medium",
  Low: "ns-low",
};

const statusClass: Record<EventStatus, string> = {
  Blocked: "ns-blocked",
  Investigating: "ns-investigating",
  Resolved: "ns-resolved",
  Allowed: "ns-allowed",
};

export default function NetworkSecurityPage() {
  const [events, setEvents] = useState(initialEvents);
  const [query, setQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(
    null
  );
  const [showFilters, setShowFilters] = useState(false);
  const [firewallEnabled, setFirewallEnabled] = useState(true);
  const [idsEnabled, setIdsEnabled] = useState(true);
  const [autoBlockEnabled, setAutoBlockEnabled] = useState(true);
  const [lastRefresh, setLastRefresh] = useState("Just now");
  const [notice, setNotice] = useState("");

  const metrics = useMemo(
    () => ({
      total: events.length,
      critical: events.filter((event) => event.severity === "Critical").length,
      blocked: events.filter((event) => event.status === "Blocked").length,
      investigating: events.filter(
        (event) => event.status === "Investigating"
      ).length,
    }),
    [events]
  );

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return events.filter((event) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          event.id,
          event.source,
          event.destination,
          event.type,
          event.protocol,
          event.severity,
          event.status,
        ].some((value) => value.toLowerCase().includes(normalizedQuery));

      const matchesSeverity =
        severityFilter === "All" || event.severity === severityFilter;

      const matchesStatus =
        statusFilter === "All" || event.status === statusFilter;

      return matchesQuery && matchesSeverity && matchesStatus;
    });
  }, [events, query, severityFilter, statusFilter]);

  function refreshEvents() {
    setLastRefresh("Just now");
    setNotice("Security event list refreshed.");
    window.setTimeout(() => setNotice(""), 3000);
  }

  function updateEventStatus(id: string, status: EventStatus) {
    setEvents((current) =>
      current.map((event) => (event.id === id ? { ...event, status } : event))
    );

    setSelectedEvent((current) =>
      current && current.id === id ? { ...current, status } : current
    );

    setNotice(`${id} marked as ${status.toLowerCase()}.`);
    window.setTimeout(() => setNotice(""), 3000);
  }

  function exportEvents() {
    const headers = [
      "ID",
      "Time",
      "Source",
      "Destination",
      "Event",
      "Severity",
      "Status",
      "Protocol",
    ];

    const rows = filteredEvents.map((event) => [
      event.id,
      event.time,
      event.source,
      event.destination,
      event.type,
      event.severity,
      event.status,
      event.protocol,
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
    anchor.download = "modelnow-network-security-events.csv";
    anchor.click();

    URL.revokeObjectURL(url);
    setNotice("Security event CSV exported.");
    window.setTimeout(() => setNotice(""), 3000);
  }

  return (
    <main className="ns-page">
      <style jsx global>{`
        .ns-page {
          --ns-bg: #f6f8fc;
          --ns-card: #ffffff;
          --ns-text: #172033;
          --ns-muted: #758096;
          --ns-border: #e6eaf1;
          --ns-blue: #315fea;
          min-height: 100vh;
          padding: 30px;
          background: var(--ns-bg);
          color: var(--ns-text);
          font-family: Arial, Helvetica, sans-serif;
        }

        .ns-page * {
          box-sizing: border-box;
        }

        .ns-page button,
        .ns-page input,
        .ns-page select {
          font: inherit;
        }

        .ns-page button {
          cursor: pointer;
        }

        .ns-container {
          max-width: 1600px;
          margin: 0 auto;
        }

        .ns-topbar,
        .ns-heading,
        .ns-section-heading,
        .ns-card-heading,
        .ns-event-top,
        .ns-drawer-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .ns-topbar {
          margin-bottom: 32px;
        }

        .ns-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .ns-brand-icon {
          width: 45px;
          height: 45px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          background: #e7edff;
          color: var(--ns-blue);
        }

        .ns-brand-name {
          margin: 0;
          font-size: 17px;
          font-weight: 800;
        }

        .ns-brand-subtitle {
          margin: 5px 0 0;
          font-size: 12px;
          color: var(--ns-muted);
        }

        .ns-top-actions,
        .ns-inline,
        .ns-button-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .ns-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 40px;
          padding: 9px 13px;
          border: 1px solid var(--ns-border);
          border-radius: 10px;
          background: #fff;
          color: #344054;
          font-size: 13px;
          font-weight: 650;
          transition: background 0.15s, border-color 0.15s;
        }

        .ns-button:hover {
          background: #f8faff;
          border-color: #cbd5e7;
        }

        .ns-button-primary {
          background: var(--ns-blue);
          border-color: var(--ns-blue);
          color: #fff;
        }

        .ns-button-primary:hover {
          background: #244dd0;
          color: #fff;
        }

        .ns-heading {
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .ns-eyebrow {
          margin: 0 0 8px;
          color: var(--ns-blue);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.4px;
          text-transform: uppercase;
        }

        .ns-title {
          margin: 0;
          font-size: clamp(26px, 3vw, 34px);
          font-weight: 800;
          letter-spacing: -1.1px;
        }

        .ns-description {
          max-width: 700px;
          margin: 9px 0 0;
          color: var(--ns-muted);
          font-size: 14px;
          line-height: 1.7;
        }

        .ns-live {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border: 1px solid #bfe9d0;
          border-radius: 30px;
          padding: 7px 11px;
          background: #effbf4;
          color: #187748;
          font-size: 12px;
          font-weight: 750;
          white-space: nowrap;
        }

        .ns-live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22a365;
        }

        .ns-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 22px;
          padding: 15px 17px;
          border: 1px solid #d9e4ff;
          border-radius: 13px;
          background: #edf3ff;
          color: #27499c;
          font-size: 13px;
          line-height: 1.6;
        }

        .ns-banner strong {
          display: block;
          margin-bottom: 2px;
        }

        .ns-banner-icon {
          flex-shrink: 0;
        }

        .ns-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 22px;
        }

        .ns-card {
          min-width: 0;
          padding: 20px;
          border: 1px solid var(--ns-border);
          border-radius: 16px;
          background: var(--ns-card);
          box-shadow: 0 3px 14px rgba(23, 32, 51, 0.025);
        }

        .ns-metric-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 18px;
        }

        .ns-metric-label {
          color: var(--ns-muted);
          font-size: 13px;
          font-weight: 600;
        }

        .ns-metric-icon {
          display: grid;
          place-items: center;
          width: 39px;
          height: 39px;
          border-radius: 12px;
        }

        .ns-icon-blue {
          background: #eaf0ff;
          color: #315fea;
        }

        .ns-icon-green {
          background: #e7f9ef;
          color: #16804a;
        }

        .ns-icon-orange {
          background: #fff2df;
          color: #bd6a0b;
        }

        .ns-icon-red {
          background: #ffebeb;
          color: #d63d3d;
        }

        .ns-metric-value {
          margin: 0;
          font-size: 29px;
          font-weight: 800;
          letter-spacing: -0.8px;
        }

        .ns-metric-foot {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 9px;
          color: var(--ns-muted);
          font-size: 12px;
        }

        .ns-green-text {
          color: #15804a;
          font-weight: 750;
        }

        .ns-orange-text {
          color: #bd6a0b;
          font-weight: 750;
        }

        .ns-red-text {
          color: #d63d3d;
          font-weight: 750;
        }

        .ns-main-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.55fr) minmax(300px, 0.85fr);
          gap: 20px;
          margin-bottom: 22px;
        }

        .ns-card-heading {
          margin-bottom: 20px;
        }

        .ns-card-title {
          margin: 0;
          font-size: 16px;
          font-weight: 800;
        }

        .ns-card-subtitle {
          margin: 6px 0 0;
          color: var(--ns-muted);
          font-size: 12px;
          line-height: 1.5;
        }

        .ns-small-label {
          color: var(--ns-muted);
          font-size: 11px;
        }

        .ns-traffic-chart {
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          gap: 14px;
          height: 190px;
          padding: 12px 4px 0;
          border-bottom: 1px solid var(--ns-border);
          background: repeating-linear-gradient(
            to top,
            transparent 0,
            transparent 46px,
            #edf0f6 47px,
            transparent 48px
          );
        }

        .ns-chart-group {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 5px;
          height: 100%;
          flex: 1;
          min-width: 0;
        }

        .ns-chart-bar {
          width: min(24px, 38%);
          min-height: 3px;
          border-radius: 5px 5px 0 0;
          transition: height 0.25s;
        }

        .ns-bar-in {
          background: #315fea;
        }

        .ns-bar-out {
          background: #7dc7ff;
        }

        .ns-chart-labels {
          display: flex;
          justify-content: space-around;
          gap: 8px;
          padding-top: 11px;
          color: var(--ns-muted);
          font-size: 11px;
        }

        .ns-legend {
          display: flex;
          gap: 17px;
          flex-wrap: wrap;
          margin-top: 18px;
          color: #657087;
          font-size: 12px;
        }

        .ns-legend-item {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .ns-legend-dot {
          width: 9px;
          height: 9px;
          border-radius: 3px;
        }

        .ns-protection-list {
          display: grid;
          gap: 0;
        }

        .ns-protection-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 16px 0;
          border-bottom: 1px solid #eef1f6;
        }

        .ns-protection-row:last-child {
          border-bottom: 0;
        }

        .ns-protection-left {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 0;
        }

        .ns-protection-icon {
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          border-radius: 11px;
          background: #f0f4ff;
          color: #315fea;
        }

        .ns-protection-name {
          margin: 0;
          font-size: 13px;
          font-weight: 750;
        }

        .ns-protection-desc {
          margin: 5px 0 0;
          color: var(--ns-muted);
          font-size: 11px;
          line-height: 1.5;
        }

        .ns-toggle {
          position: relative;
          width: 41px;
          height: 24px;
          flex-shrink: 0;
          border: 0;
          border-radius: 20px;
          background: #cbd2df;
          transition: background 0.2s;
        }

        .ns-toggle.is-on {
          background: #315fea;
        }

        .ns-toggle-knob {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 1px 3px #0002;
          transition: transform 0.2s;
        }

        .ns-toggle.is-on .ns-toggle-knob {
          transform: translateX(17px);
        }

        .ns-event-card {
          padding: 0;
          overflow: hidden;
        }

        .ns-event-header {
          padding: 20px;
          border-bottom: 1px solid var(--ns-border);
        }

        .ns-event-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 18px;
        }

        .ns-search {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 220px;
          max-width: 360px;
          flex: 1;
          padding: 0 12px;
          border: 1px solid var(--ns-border);
          border-radius: 10px;
          background: #fff;
          color: #8490a5;
        }

        .ns-search input {
          width: 100%;
          min-width: 0;
          height: 39px;
          outline: none;
          border: 0;
          background: transparent;
          color: var(--ns-text);
          font-size: 13px;
        }

        .ns-select {
          min-height: 39px;
          max-width: 100%;
          padding: 8px 30px 8px 10px;
          border: 1px solid var(--ns-border);
          border-radius: 9px;
          background: #fff;
          color: #455066;
          font-size: 12px;
          outline: none;
        }

        .ns-table-wrap {
          width: 100%;
          overflow-x: auto;
        }

        .ns-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          white-space: nowrap;
        }

        .ns-table th {
          padding: 13px 17px;
          background: #fafbfe;
          color: #7b8599;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.6px;
          text-transform: uppercase;
        }

        .ns-table td {
          padding: 16px 17px;
          border-top: 1px solid #eef1f6;
          color: #4d586d;
          font-size: 12px;
        }

        .ns-table tbody tr {
          transition: background 0.15s;
        }

        .ns-table tbody tr:hover {
          background: #f8faff;
        }

        .ns-event-id {
          color: #315fea;
          font-weight: 750;
        }

        .ns-event-type {
          color: #263248;
          font-weight: 700;
        }

        .ns-table-muted {
          margin-top: 5px;
          color: #8b95a7;
          font-size: 11px;
        }

        .ns-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 9px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 800;
        }

        .ns-critical {
          background: #ffe7e7;
          color: #c62828;
        }

        .ns-high {
          background: #fff0df;
          color: #b75b0b;
        }

        .ns-medium {
          background: #fff8d9;
          color: #8a6b00;
        }

        .ns-low {
          background: #e7f2ff;
          color: #2859a8;
        }

        .ns-blocked {
          background: #ffebeb;
          color: #c62828;
        }

        .ns-investigating {
          background: #fff4dc;
          color: #99630a;
        }

        .ns-resolved {
          background: #e7f9ef;
          color: #187748;
        }

        .ns-allowed {
          background: #eaf0ff;
          color: #315fea;
        }

        .ns-view-button {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 9px;
          border: 1px solid var(--ns-border);
          border-radius: 8px;
          background: #fff;
          color: #536078;
          font-size: 11px;
          font-weight: 700;
        }

        .ns-view-button:hover {
          background: #edf3ff;
          color: #315fea;
        }

        .ns-empty {
          padding: 45px 20px;
          text-align: center;
          color: var(--ns-muted);
          font-size: 13px;
        }

        .ns-footer {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          padding: 14px 20px;
          border-top: 1px solid var(--ns-border);
          color: var(--ns-muted);
          font-size: 11px;
        }

        .ns-notice {
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
          font-size: 13px;
          font-weight: 700;
        }

        .ns-overlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          justify-content: flex-end;
          background: rgba(15, 23, 42, 0.42);
        }

        .ns-drawer {
          width: min(470px, 100%);
          height: 100%;
          overflow-y: auto;
          padding: 25px;
          background: #fff;
          box-shadow: -12px 0 45px #0002;
        }

        .ns-drawer-heading {
          padding-bottom: 20px;
          border-bottom: 1px solid var(--ns-border);
        }

        .ns-drawer-title {
          margin: 0;
          font-size: 19px;
          font-weight: 800;
        }

        .ns-drawer-subtitle {
          margin: 7px 0 0;
          color: var(--ns-muted);
          font-size: 12px;
          line-height: 1.6;
        }

        .ns-close {
          display: grid;
          place-items: center;
          width: 37px;
          height: 37px;
          flex-shrink: 0;
          border: 1px solid var(--ns-border);
          border-radius: 10px;
          background: #fff;
          color: #59657a;
        }

        .ns-detail-section {
          padding: 20px 0;
          border-bottom: 1px solid #eef1f6;
        }

        .ns-detail-label {
          margin: 0 0 12px;
          color: #8993a5;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .ns-detail-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 18px;
          padding: 9px 0;
          font-size: 12px;
        }

        .ns-detail-row span:first-child {
          color: var(--ns-muted);
        }

        .ns-detail-row span:last-child {
          text-align: right;
          overflow-wrap: anywhere;
          font-weight: 650;
        }

        .ns-detail-description {
          color: #566176;
          font-size: 13px;
          line-height: 1.8;
        }

        .ns-drawer-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          padding-top: 22px;
        }

        @media (max-width: 1050px) {
          .ns-page {
            padding: 22px;
          }

          .ns-main-grid {
            grid-template-columns: 1fr;
          }

          .ns-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .ns-page {
            padding: 15px;
          }

          .ns-topbar {
            align-items: flex-start;
            margin-bottom: 25px;
          }

          .ns-brand-icon {
            width: 40px;
            height: 40px;
          }

          .ns-brand-subtitle {
            font-size: 11px;
          }

          .ns-top-actions .ns-button {
            min-height: 36px;
            padding: 8px;
            font-size: 11px;
          }

          .ns-heading {
            flex-direction: column;
            gap: 14px;
          }

          .ns-title {
            font-size: 27px;
          }

          .ns-description {
            font-size: 13px;
          }

          .ns-metrics {
            gap: 10px;
          }

          .ns-card {
            padding: 15px;
            border-radius: 13px;
          }

          .ns-metric-value {
            font-size: 25px;
          }

          .ns-metric-label {
            font-size: 11px;
          }

          .ns-metric-icon {
            width: 33px;
            height: 33px;
          }

          .ns-metric-foot {
            align-items: flex-start;
            font-size: 10px;
            line-height: 1.5;
          }

          .ns-banner {
            align-items: flex-start;
            padding: 12px;
            font-size: 12px;
          }

          .ns-event-header {
            padding: 15px;
          }

          .ns-event-toolbar {
            align-items: stretch;
          }

          .ns-search {
            max-width: none;
            flex-basis: 100%;
          }

          .ns-select {
            flex: 1;
          }

          .ns-traffic-chart {
            height: 155px;
          }

          .ns-drawer {
            padding: 19px;
          }

          .ns-footer {
            padding: 13px 15px;
          }
        }
      `}</style>

      <div className="ns-container">
        <header className="ns-topbar">
          <div className="ns-brand">
            <div className="ns-brand-icon">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="ns-brand-name">ModelNow Security</p>
              <p className="ns-brand-subtitle">Network protection center</p>
            </div>
          </div>

          <div className="ns-top-actions">
            <button className="ns-button" onClick={refreshEvents}>
              <RefreshCw size={15} />
              Refresh
            </button>
            <button
              className="ns-button ns-button-primary"
              onClick={exportEvents}
            >
              <Download size={15} />
              Export logs
            </button>
          </div>
        </header>

        <section className="ns-heading">
          <div>
            <p className="ns-eyebrow">Security and observability</p>
            <h1 className="ns-title">Network Security</h1>
            <p className="ns-description">
              Monitor network activity, review suspicious connections, and
              manage protection controls for your ModelNow environment.
            </p>
          </div>

          <div className="ns-live">
            <span className="ns-live-dot" />
            Monitoring enabled
          </div>
        </section>

        <div className="ns-banner">
          <ShieldAlert className="ns-banner-icon" size={23} />
          <div>
            <strong>Security monitoring overview</strong>
            This page currently uses demonstration data and local UI state.
            Connect your firewall, network telemetry, and security APIs before
            relying on it for real-time threat detection or enforcement.
          </div>
        </div>

        <section className="ns-metrics">
          <MetricCard
            label="Events monitored"
            value={metrics.total.toString()}
            foot="Events in this demo view"
            icon={<Activity size={20} />}
            color="blue"
          />
          <MetricCard
            label="Critical alerts"
            value={metrics.critical.toString()}
            foot="Require prompt review"
            icon={<AlertOctagon size={20} />}
            color="red"
          />
          <MetricCard
            label="Connections blocked"
            value={metrics.blocked.toString()}
            foot="Marked blocked in this view"
            icon={<Ban size={20} />}
            color="orange"
          />
          <MetricCard
            label="Under investigation"
            value={metrics.investigating.toString()}
            foot="Pending security review"
            icon={<FileSearch size={20} />}
            color="green"
          />
        </section>

        <section className="ns-main-grid">
          <div className="ns-card">
            <div className="ns-card-heading">
              <div>
                <h2 className="ns-card-title">Network traffic</h2>
                <p className="ns-card-subtitle">
                  Illustrative inbound and outbound traffic by hour
                </p>
              </div>
              <span className="ns-small-label">Last 7 hours</span>
            </div>

            <div className="ns-traffic-chart">
              {traffic.map((item) => (
                <div className="ns-chart-group" key={item.label}>
                  <div
                    className="ns-chart-bar ns-bar-in"
                    style={{ height: `${item.inbound}%` }}
                    title={`Inbound: ${item.inbound} units`}
                  />
                  <div
                    className="ns-chart-bar ns-bar-out"
                    style={{ height: `${item.outbound}%` }}
                    title={`Outbound: ${item.outbound} units`}
                  />
                </div>
              ))}
            </div>

            <div className="ns-chart-labels">
              {traffic.map((item) => (
                <span key={item.label}>{item.label}</span>
              ))}
            </div>

            <div className="ns-legend">
              <span className="ns-legend-item">
                <span className="ns-legend-dot ns-bar-in" />
                Inbound traffic
              </span>
              <span className="ns-legend-item">
                <span className="ns-legend-dot ns-bar-out" />
                Outbound traffic
              </span>
            </div>
          </div>

          <div className="ns-card">
            <div className="ns-card-heading">
              <div>
                <h2 className="ns-card-title">Protection controls</h2>
                <p className="ns-card-subtitle">
                  Demo switches for security capabilities
                </p>
              </div>
              <LockKeyhole size={21} color="#315fea" />
            </div>

            <div className="ns-protection-list">
              <ProtectionRow
                icon={<Shield size={18} />}
                title="Firewall"
                description="Network traffic policy"
                enabled={firewallEnabled}
                onChange={setFirewallEnabled}
              />
              <ProtectionRow
                icon={<Eye size={18} />}
                title="Intrusion detection"
                description="Suspicious activity monitoring"
                enabled={idsEnabled}
                onChange={setIdsEnabled}
              />
              <ProtectionRow
                icon={<Ban size={18} />}
                title="Automatic blocking"
                description="Simulated threat response"
                enabled={autoBlockEnabled}
                onChange={setAutoBlockEnabled}
              />
              <ProtectionRow
                icon={<Lock size={18} />}
                title="Encrypted connections"
                description="TLS configuration review"
                enabled={true}
                onChange={() => {
                  setNotice(
                    "TLS status is informational. Connect certificate telemetry to manage it."
                  );
                  window.setTimeout(() => setNotice(""), 3500);
                }}
                locked
              />
            </div>
          </div>
        </section>

        <section className="ns-card ns-event-card">
          <div className="ns-event-header">
            <div className="ns-section-heading">
              <div>
                <h2 className="ns-card-title">Security event logs</h2>
                <p className="ns-card-subtitle">
                  Search, filter, and inspect network security events
                </p>
              </div>
              <span className="ns-live">
                <span className="ns-live-dot" />
                Demo feed
              </span>
            </div>

            <div className="ns-event-toolbar">
              <label className="ns-search">
                <Search size={17} />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search IP, event, destination..."
                  aria-label="Search security events"
                />
              </label>

              <div className="ns-inline">
                <select
                  className="ns-select"
                  value={severityFilter}
                  onChange={(event) => setSeverityFilter(event.target.value)}
                  aria-label="Filter by severity"
                >
                  <option value="All">All severities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>

                <select
                  className="ns-select"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  aria-label="Filter by status"
                >
                  <option value="All">All statuses</option>
                  <option value="Blocked">Blocked</option>
                  <option value="Investigating">Investigating</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Allowed">Allowed</option>
                </select>

                <button
                  className="ns-button"
                  onClick={() => {
                    setQuery("");
                    setSeverityFilter("All");
                    setStatusFilter("All");
                    setShowFilters(false);
                  }}
                  title="Reset all filters"
                >
                  <Filter size={15} />
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="ns-table-wrap">
            <table className="ns-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Source / Destination</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <div className="ns-event-id">{event.id}</div>
                      <div className="ns-table-muted">{event.protocol}</div>
                    </td>
                    <td>
                      <div className="ns-event-type">{event.type}</div>
                      <div className="ns-table-muted">{event.source}</div>
                      <div className="ns-table-muted">
                        → {event.destination}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`ns-pill ${severityClass[event.severity]}`}
                      >
                        {event.severity}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`ns-pill ${statusClass[event.status]}`}
                      >
                        {event.status}
                      </span>
                    </td>
                    <td>{event.time}</td>
                    <td>
                      <button
                        className="ns-view-button"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <Eye size={13} />
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredEvents.length === 0 && (
              <div className="ns-empty">
                No security events match your search or filters.
              </div>
            )}
          </div>

          <div className="ns-footer">
            <span>
              Showing {filteredEvents.length} of {events.length} events
            </span>
            <span>Last refreshed: {lastRefresh}</span>
          </div>
        </section>

        <section className="ns-main-grid" style={{ marginTop: 22 }}>
          <div className="ns-card">
            <div className="ns-card-heading">
              <div>
                <h2 className="ns-card-title">Network health</h2>
                <p className="ns-card-subtitle">
                  Current state of configured demo controls
                </p>
              </div>
              <Network size={21} color="#315fea" />
            </div>

            <HealthRow
              label="Firewall policy"
              detail="Local demonstration toggle"
              ok={firewallEnabled}
            />
            <HealthRow
              label="Intrusion detection"
              detail="Local demonstration toggle"
              ok={idsEnabled}
            />
            <HealthRow
              label="Automatic blocking"
              detail="Local demonstration toggle"
              ok={autoBlockEnabled}
            />
          </div>

          <div className="ns-card">
            <div className="ns-card-heading">
              <div>
                <h2 className="ns-card-title">Recommended checks</h2>
                <p className="ns-card-subtitle">
                  Steps to connect production security
                </p>
              </div>
              <Zap size={21} color="#bd6a0b" />
            </div>

            <HealthRow
              label="Connect firewall telemetry"
              detail="Ingest real firewall events"
              ok={false}
            />
            <HealthRow
              label="Configure alerting"
              detail="Set severity thresholds and routing"
              ok={false}
            />
            <HealthRow
              label="Verify TLS certificates"
              detail="Connect certificate expiry monitoring"
              ok={false}
            />
          </div>
        </section>
      </div>

      {selectedEvent && (
        <div
          className="ns-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedEvent(null);
            }
          }}
        >
          <aside
            className="ns-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ns-detail-title"
          >
            <div className="ns-drawer-heading">
              <div>
                <h2 id="ns-detail-title" className="ns-drawer-title">
                  Security event
                </h2>
                <p className="ns-drawer-subtitle">
                  Review event details and update its demo status.
                </p>
              </div>
              <button
                className="ns-close"
                onClick={() => setSelectedEvent(null)}
                aria-label="Close event details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="ns-detail-section">
              <p className="ns-detail-label">Event summary</p>
              <div className="ns-inline" style={{ marginBottom: 14 }}>
                <span
                  className={`ns-pill ${
                    severityClass[selectedEvent.severity]
                  }`}
                >
                  {selectedEvent.severity}
                </span>
                <span
                  className={`ns-pill ${statusClass[selectedEvent.status]}`}
                >
                  {selectedEvent.status}
                </span>
              </div>
              <h3 style={{ fontSize: 17, margin: "0 0 8px" }}>
                {selectedEvent.type}
              </h3>
              <p className="ns-detail-description">
                {selectedEvent.details}
              </p>
            </div>

            <div className="ns-detail-section">
              <p className="ns-detail-label">Connection information</p>
              <DetailRow label="Event ID" value={selectedEvent.id} />
              <DetailRow label="Time" value={selectedEvent.time} />
              <DetailRow label="Source IP" value={selectedEvent.source} />
              <DetailRow
                label="Destination"
                value={selectedEvent.destination}
              />
              <DetailRow label="Protocol" value={selectedEvent.protocol} />
            </div>

            <div className="ns-detail-section">
              <p className="ns-detail-label">Update event status</p>
              <div className="ns-button-row">
                {(
                  [
                    "Investigating",
                    "Blocked",
                    "Resolved",
                    "Allowed",
                  ] as EventStatus[]
                ).map((status) => (
                  <button
                    key={status}
                    className={`ns-button ${
                      selectedEvent.status === status
                        ? "ns-button-primary"
                        : ""
                    }`}
                    onClick={() => updateEventStatus(selectedEvent.id, status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="ns-drawer-actions">
              <button
                className="ns-button"
                onClick={() => setSelectedEvent(null)}
              >
                Close
              </button>
              <button
                className="ns-button ns-button-primary"
                onClick={() => {
                  exportEvents();
                  setSelectedEvent(null);
                }}
              >
                <ArrowDownToLine size={15} />
                Export events
              </button>
            </div>
          </aside>
        </div>
      )}

      {notice && (
        <div className="ns-notice" role="status">
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
    <div className="ns-card">
      <div className="ns-metric-top">
        <span className="ns-metric-label">{label}</span>
        <div className={`ns-metric-icon ns-icon-${color}`}>{icon}</div>
      </div>
      <p className="ns-metric-value">{value}</p>
      <div className="ns-metric-foot">{foot}</div>
    </div>
  );
}

function ProtectionRow({
  icon,
  title,
  description,
  enabled,
  onChange,
  locked = false,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
  locked?: boolean;
}) {
  return (
    <div className="ns-protection-row">
      <div className="ns-protection-left">
        <div className="ns-protection-icon">{icon}</div>
        <div>
          <p className="ns-protection-name">{title}</p>
          <p className="ns-protection-desc">{description}</p>
        </div>
      </div>

      <button
        type="button"
        className={`ns-toggle ${enabled ? "is-on" : ""}`}
        role="switch"
        aria-checked={enabled}
        aria-label={title}
        disabled={locked}
        onClick={() => onChange(!enabled)}
        title={locked ? "Connect TLS management to change this setting" : title}
      >
        <span className="ns-toggle-knob" />
      </button>
    </div>
  );
}

function HealthRow({
  label,
  detail,
  ok,
}: {
  label: string;
  detail: string;
  ok: boolean;
}) {
  return (
    <div className="ns-protection-row">
      <div className="ns-protection-left">
        <div
          className="ns-protection-icon"
          style={{
            background: ok ? "#e7f9ef" : "#fff2df",
            color: ok ? "#16804a" : "#bd6a0b",
          }}
        >
          {ok ? <Check size={17} /> : <AlertTriangle size={17} />}
        </div>
        <div>
          <p className="ns-protection-name">{label}</p>
          <p className="ns-protection-desc">{detail}</p>
        </div>
      </div>
      <span
        className={`ns-pill ${ok ? "ns-resolved" : "ns-investigating"}`}
      >
        {ok ? "Enabled" : "Needs setup"}
      </span>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="ns-detail-row">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
