
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  Fingerprint,
  Globe,
  KeyRound,
  LockKeyhole,
  Monitor,
  MoreHorizontal,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Users,
  X,
} from "lucide-react";

type SecurityStatus = "Protected" | "Review required" | "Blocked";
type EventSeverity = "Low" | "Medium" | "High" | "Critical";

type SecurityEvent = {
  id: string;
  organization: string;
  event: string;
  actor: string;
  source: string;
  timestamp: string;
  severity: EventSeverity;
  status: SecurityStatus;
};

type SecurityPolicy = {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  enforced: boolean;
};

const initialEvents: SecurityEvent[] = [
  {
    id: "SEC-1048",
    organization: "Acme Corporation",
    event: "Multiple failed sign-in attempts",
    actor: "admin@acme.example",
    source: "192.0.2.14",
    timestamp: "Nov 04, 2026 · 09:42",
    severity: "High",
    status: "Review required",
  },
  {
    id: "SEC-1047",
    organization: "Northstar AI",
    event: "API key created",
    actor: "platform-admin@northstar.example",
    source: "198.51.100.24",
    timestamp: "Nov 04, 2026 · 09:18",
    severity: "Low",
    status: "Protected",
  },
  {
    id: "SEC-1046",
    organization: "Vertex Labs",
    event: "Unrecognized device sign-in",
    actor: "developer@vertex.example",
    source: "203.0.113.31",
    timestamp: "Nov 04, 2026 · 08:55",
    severity: "Medium",
    status: "Review required",
  },
  {
    id: "SEC-1045",
    organization: "BrightPath",
    event: "Suspicious authentication activity",
    actor: "unknown",
    source: "198.51.100.86",
    timestamp: "Nov 04, 2026 · 08:31",
    severity: "Critical",
    status: "Blocked",
  },
  {
    id: "SEC-1044",
    organization: "CloudPeak Systems",
    event: "Security policy updated",
    actor: "security@cloudpeak.example",
    source: "192.0.2.42",
    timestamp: "Nov 04, 2026 · 08:12",
    severity: "Low",
    status: "Protected",
  },
  {
    id: "SEC-1043",
    organization: "NovaWorks",
    event: "MFA enrollment reminder",
    actor: "owner@novaworks.example",
    source: "203.0.113.18",
    timestamp: "Nov 03, 2026 · 18:45",
    severity: "Medium",
    status: "Review required",
  },
];

const initialPolicies: SecurityPolicy[] = [
  {
    id: "mfa",
    name: "Multi-factor authentication",
    description: "Require an additional verification factor for organization accounts.",
    category: "Authentication",
    enabled: true,
    enforced: true,
  },
  {
    id: "sso",
    name: "Single sign-on",
    description: "Use an organization's identity provider for member authentication.",
    category: "Authentication",
    enabled: true,
    enforced: false,
  },
  {
    id: "session",
    name: "Session expiration",
    description: "Require users to re-authenticate after a configured period.",
    category: "Sessions",
    enabled: true,
    enforced: true,
  },
  {
    id: "ip",
    name: "IP allowlist",
    description: "Restrict access to approved network addresses.",
    category: "Network",
    enabled: false,
    enforced: false,
  },
  {
    id: "keys",
    name: "API key rotation",
    description: "Set an expected rotation interval for organization API keys.",
    category: "API security",
    enabled: true,
    enforced: false,
  },
  {
    id: "alerts",
    name: "Security notifications",
    description: "Notify security contacts when sensitive activity requires review.",
    category: "Monitoring",
    enabled: true,
    enforced: true,
  },
];

const initialOrganizations = [
  { name: "Acme Corporation", mfa: 96, sso: true, keys: 8, score: 92 },
  { name: "Northstar AI", mfa: 82, sso: true, keys: 12, score: 84 },
  { name: "Vertex Labs", mfa: 68, sso: false, keys: 15, score: 71 },
  { name: "BrightPath", mfa: 45, sso: false, keys: 4, score: 48 },
  { name: "CloudPeak Systems", mfa: 100, sso: true, keys: 6, score: 98 },
];

const severityOptions: EventSeverity[] = [
  "Low",
  "Medium",
  "High",
  "Critical",
];

export default function OrganizationSecurityPage() {
  const [events, setEvents] = useState(initialEvents);
  const [policies, setPolicies] = useState(initialPolicies);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [severityFilter, setSeverityFilter] = useState("All severities");
  const [activeTab, setActiveTab] = useState<
    "events" | "policies" | "organizations"
  >("events");
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(
    null,
  );
  const [notice, setNotice] = useState("");
  const [showPolicyDetails, setShowPolicyDetails] = useState(false);
  const [selectedPolicyId, setSelectedPolicyId] = useState("mfa");

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return events.filter((event) => {
      const matchesSearch =
        !query ||
        event.id.toLowerCase().includes(query) ||
        event.organization.toLowerCase().includes(query) ||
        event.event.toLowerCase().includes(query) ||
        event.actor.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All statuses" || event.status === statusFilter;

      const matchesSeverity =
        severityFilter === "All severities" ||
        event.severity === severityFilter;

      return matchesSearch && matchesStatus && matchesSeverity;
    });
  }, [events, search, statusFilter, severityFilter]);

  const filteredPolicies = useMemo(() => {
    const query = search.trim().toLowerCase();

    return policies.filter(
      (policy) =>
        !query ||
        policy.name.toLowerCase().includes(query) ||
        policy.description.toLowerCase().includes(query) ||
        policy.category.toLowerCase().includes(query),
    );
  }, [policies, search]);

  const filteredOrganizations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return initialOrganizations.filter(
      (organization) =>
        !query || organization.name.toLowerCase().includes(query),
    );
  }, [search]);

  const reviewCount = events.filter(
    (event) => event.status === "Review required",
  ).length;

  const blockedCount = events.filter(
    (event) => event.status === "Blocked",
  ).length;

  const activePolicyCount = policies.filter(
    (policy) => policy.enabled,
  ).length;

  const highRiskCount = initialOrganizations.filter(
    (organization) => organization.score < 70,
  ).length;

  function togglePolicy(id: string) {
    const target = policies.find((policy) => policy.id === id);
    if (!target) return;

    if (target.enforced) {
      setNotice(
        `${target.name} is marked as enforced. Change the enforcement setting in your backend policy management before disabling it.`,
      );
      return;
    }

    setPolicies((current) =>
      current.map((policy) =>
        policy.id === id
          ? { ...policy, enabled: !policy.enabled }
          : policy,
      ),
    );

    setNotice(
      `${target.name} changed in the local preview. The production security policy has not changed.`,
    );
  }

  function updateEventStatus(id: string, status: SecurityStatus) {
    setEvents((current) =>
      current.map((event) =>
        event.id === id ? { ...event, status } : event,
      ),
    );

    setNotice(`Event ${id} updated in the local preview.`);
    setSelectedEvent(null);
  }

  function exportEvents() {
    const rows = [
      [
        "Event ID",
        "Organization",
        "Event",
        "Actor",
        "Source",
        "Timestamp",
        "Severity",
        "Status",
      ],
      ...filteredEvents.map((event) => [
        event.id,
        event.organization,
        event.event,
        event.actor,
        event.source,
        event.timestamp,
        event.severity,
        event.status,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "modelnow-organization-security-events.csv";
    anchor.click();
    URL.revokeObjectURL(url);

    setNotice("Security event report exported.");
  }

  function refreshView() {
    setNotice("View refreshed. Displaying the current sample security records.");
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("All statuses");
    setSeverityFilter("All severities");
  }

  const selectedPolicy = policies.find(
    (policy) => policy.id === selectedPolicyId,
  );

  return (
    <main className="org-security-page">
      <style>{`
        * { box-sizing: border-box; }
        .org-security-page {
          min-height: 100vh; padding: 30px; background: #f7f8fc;
          color: #182238; font-family: Arial, Helvetica, sans-serif;
        }
        .org-security-container { max-width: 1480px; margin: 0 auto; }
        .org-security-breadcrumb { color: #7e899c; font-size: 12px; margin-bottom: 15px; }
        .org-security-breadcrumb span { color: #315fe8; }
        .org-security-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          gap: 18px; flex-wrap: wrap; margin-bottom: 24px;
        }
        .org-security-title { margin: 0 0 8px; font-size: 27px; letter-spacing: -.7px; font-weight: 750; }
        .org-security-subtitle { margin: 0; color: #7c879c; font-size: 13px; line-height: 1.6; }
        .org-security-actions { display: flex; gap: 9px; flex-wrap: wrap; }
        .org-security-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 10px 13px; border: 1px solid #dfe4ed; border-radius: 9px;
          background: #fff; color: #39465e; font-size: 12px; font-weight: 650; cursor: pointer;
        }
        .org-security-btn:hover { background: #f0f4ff; }
        .org-security-btn.primary { background: #315fe8; color: #fff; border-color: #315fe8; }
        .org-security-notice {
          display: flex; justify-content: space-between; gap: 10px; padding: 11px 14px;
          margin-bottom: 18px; border-radius: 9px; border: 1px solid #c9d9ff;
          background: #eff4ff; color: #244dbb; font-size: 12px; line-height: 1.5;
        }
        .org-security-dismiss { border: 0; background: transparent; color: inherit; cursor: pointer; }
        .org-security-stats {
          display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px; margin-bottom: 21px;
        }
        .org-security-stat { padding: 19px; border: 1px solid #e8ebf2; border-radius: 13px; background: #fff; }
        .org-security-stat-top { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 17px; }
        .org-security-stat-label { color: #778298; font-size: 12px; }
        .org-security-stat-icon {
          width: 35px; height: 35px; border-radius: 10px; display: grid;
          place-items: center; background: #edf2ff; color: #315fe8;
        }
        .org-security-stat-icon.green { background: #eaf8ef; color: #168453; }
        .org-security-stat-icon.amber { background: #fff5df; color: #9a6400; }
        .org-security-stat-icon.red { background: #fff0ee; color: #c34438; }
        .org-security-stat-value { font-size: 25px; font-weight: 750; letter-spacing: -.6px; margin-bottom: 7px; }
        .org-security-stat-note { color: #8b95a7; font-size: 11px; line-height: 1.5; }
        .org-security-banner {
          display: flex; align-items: flex-start; gap: 11px; padding: 14px 16px;
          margin-bottom: 21px; border: 1px solid #e0e7fa; border-radius: 11px;
          background: #f0f4ff; color: #46577d; font-size: 11px; line-height: 1.6;
        }
        .org-security-banner strong { color: #263c75; }
        .org-security-panel { border: 1px solid #e8ebf2; border-radius: 13px; background: #fff; overflow: hidden; }
        .org-security-panel-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          gap: 16px; flex-wrap: wrap; padding: 21px; border-bottom: 1px solid #edf0f5;
        }
        .org-security-panel-title { margin: 0 0 6px; font-size: 15px; font-weight: 750; }
        .org-security-panel-description { margin: 0; color: #8993a5; font-size: 11px; line-height: 1.5; }
        .org-security-tabs { display: flex; gap: 5px; padding: 5px; border-radius: 9px; background: #f2f4f9; }
        .org-security-tab {
          padding: 9px 12px; border: 0; border-radius: 7px; background: transparent;
          color: #707c91; font-size: 11px; font-weight: 650; cursor: pointer;
        }
        .org-security-tab.active { background: #fff; color: #315fe8; box-shadow: 0 1px 4px #18223812; }
        .org-security-filters { display: flex; gap: 8px; flex-wrap: wrap; }
        .org-security-search-wrap { position: relative; }
        .org-security-search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #929bad; }
        .org-security-search {
          width: 230px; padding: 10px 10px 10px 31px; border: 1px solid #e0e5ee;
          border-radius: 8px; outline: none; font-size: 11px; color: #263248;
        }
        .org-security-select {
          padding: 10px 11px; border: 1px solid #e0e5ee; border-radius: 8px;
          background: #fff; color: #44516a; font-size: 11px; outline: none;
        }
        .org-security-search:focus, .org-security-select:focus { border-color: #7898ff; }
        .org-security-table-scroll { overflow-x: auto; }
        .org-security-table { width: 100%; border-collapse: collapse; white-space: nowrap; }
        .org-security-table th {
          padding: 13px 16px; text-align: left; background: #fafbfe;
          color: #8992a4; font-size: 10px; font-weight: 700;
        }
        .org-security-table td { padding: 14px 16px; border-top: 1px solid #eff1f6; color: #4c5870; font-size: 11px; }
        .org-security-strong { color: #202b40; font-size: 12px; font-weight: 700; }
        .org-security-sub { color: #929bad; font-size: 10px; margin-top: 5px; }
        .org-security-pill { display: inline-flex; align-items: center; gap: 6px; padding: 5px 8px; border-radius: 20px; font-size: 10px; font-weight: 650; }
        .org-security-pill.Protected { background: #eaf8ef; color: #167747; }
        .org-security-pill.Review-required { background: #fff5df; color: #9a6400; }
        .org-security-pill.Blocked { background: #fff0ee; color: #bd3f34; }
        .org-security-pill.Low { background: #eaf8ef; color: #167747; }
        .org-security-pill.Medium { background: #fff5df; color: #9a6400; }
        .org-security-pill.High, .org-security-pill.Critical { background: #fff0ee; color: #bd3f34; }
        .org-security-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
        .org-security-icon-btn {
          display: inline-grid; place-items: center; width: 30px; height: 30px;
          border: 1px solid #e3e7ef; border-radius: 7px; background: #fff; color: #65718a; cursor: pointer;
        }
        .org-security-icon-btn:hover { background: #f1f4fb; color: #315fe8; }
        .org-security-empty { padding: 38px 20px; text-align: center; color: #8790a3; font-size: 12px; }
        .org-security-footer {
          display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap;
          padding: 14px 20px; border-top: 1px solid #edf0f5; color: #8790a3; font-size: 11px;
        }
        .org-security-policy-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 13px; padding: 18px; }
        .org-security-policy {
          padding: 17px; border: 1px solid #e9edf4; border-radius: 11px; background: #fff;
        }
        .org-security-policy-top { display: flex; align-items: flex-start; gap: 11px; }
        .org-security-policy-icon {
          width: 36px; height: 36px; flex-shrink: 0; display: grid; place-items: center;
          border-radius: 9px; background: #edf2ff; color: #315fe8;
        }
        .org-security-policy-name { margin: 0 0 6px; color: #253149; font-size: 13px; font-weight: 750; }
        .org-security-policy-description { margin: 0; color: #8490a4; font-size: 11px; line-height: 1.6; }
        .org-security-policy-bottom { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 16px; padding-top: 13px; border-top: 1px solid #edf0f5; }
        .org-security-toggle { position: relative; width: 38px; height: 22px; flex-shrink: 0; border: 0; border-radius: 20px; cursor: pointer; background: #c9cfda; }
        .org-security-toggle.on { background: #315fe8; }
        .org-security-toggle:disabled { opacity: .6; cursor: not-allowed; }
        .org-security-toggle-knob { position: absolute; top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: #fff; transition: left .15s; }
        .org-security-toggle.on .org-security-toggle-knob { left: 19px; }
        .org-security-score { display: flex; align-items: center; gap: 10px; min-width: 145px; }
        .org-security-score-track { width: 80px; height: 6px; overflow: hidden; border-radius: 8px; background: #edf0f5; }
        .org-security-score-fill { height: 100%; border-radius: 8px; background: #16a36b; }
        .org-security-modal-backdrop { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; padding: 18px; background: #0f172a7a; }
        .org-security-modal { width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; border-radius: 15px; background: #fff; box-shadow: 0 25px 80px #0002; }
        .org-security-modal-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; padding: 22px; border-bottom: 1px solid #edf0f5; }
        .org-security-modal-title { margin: 0 0 6px; font-size: 18px; font-weight: 750; }
        .org-security-modal-subtitle { margin: 0; color: #8490a4; font-size: 12px; line-height: 1.5; }
        .org-security-modal-body { padding: 22px; }
        .org-security-detail-row { display: flex; justify-content: space-between; gap: 16px; padding: 12px 0; border-bottom: 1px solid #edf0f5; font-size: 12px; }
        .org-security-detail-row:last-child { border-bottom: 0; }
        .org-security-detail-label { color: #8790a3; }
        .org-security-detail-value { color: #253149; font-weight: 650; text-align: right; overflow-wrap: anywhere; }
        .org-security-modal-footer { display: flex; justify-content: flex-end; gap: 9px; padding: 16px 22px; border-top: 1px solid #edf0f5; background: #fbfcfe; border-radius: 0 0 15px 15px; }
        @media (max-width: 1050px) { .org-security-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); } .org-security-policy-list { grid-template-columns: 1fr; } }
        @media (max-width: 650px) {
          .org-security-page { padding: 17px; }
          .org-security-title { font-size: 23px; }
          .org-security-stats { grid-template-columns: 1fr; }
          .org-security-panel-header { padding: 16px; }
          .org-security-filters, .org-security-search-wrap { width: 100%; }
          .org-security-search { width: 100%; }
          .org-security-filters select { flex: 1; min-width: 0; }
          .org-security-tabs { width: 100%; }
          .org-security-tab { flex: 1; padding: 9px 5px; }
        }
      `}</style>

      <div className="org-security-container">
        <div className="org-security-breadcrumb">
          Organizations / <span>Security</span>
        </div>

        <header className="org-security-header">
          <div>
            <h1 className="org-security-title">Organization Security</h1>
            <p className="org-security-subtitle">
              Review organization security posture, authentication policies, and security events.
            </p>
          </div>
          <div className="org-security-actions">
            <button className="org-security-btn" onClick={refreshView}>
              <RefreshCw size={14} /> Refresh
            </button>
            <button className="org-security-btn" onClick={exportEvents}>
              <Download size={14} /> Export events
            </button>
          </div>
        </header>

        {notice && (
          <div className="org-security-notice" role="status">
            <span>{notice}</span>
            <button className="org-security-dismiss" onClick={() => setNotice("")} aria-label="Dismiss notification">
              <X size={15} />
            </button>
          </div>
        )}

        <section className="org-security-stats">
          <div className="org-security-stat">
            <div className="org-security-stat-top">
              <span className="org-security-stat-label">Security policies enabled</span>
              <span className="org-security-stat-icon green"><ShieldCheck size={18} /></span>
            </div>
            <div className="org-security-stat-value">{activePolicyCount}/{policies.length}</div>
            <div className="org-security-stat-note">Enabled in this local preview</div>
          </div>

          <div className="org-security-stat">
            <div className="org-security-stat-top">
              <span className="org-security-stat-label">Events needing review</span>
              <span className="org-security-stat-icon amber"><AlertTriangle size={18} /></span>
            </div>
            <div className="org-security-stat-value">{reviewCount}</div>
            <div className="org-security-stat-note">Sample events awaiting review</div>
          </div>

          <div className="org-security-stat">
            <div className="org-security-stat-top">
              <span className="org-security-stat-label">Blocked events</span>
              <span className="org-security-stat-icon red"><ShieldAlert size={18} /></span>
            </div>
            <div className="org-security-stat-value">{blockedCount}</div>
            <div className="org-security-stat-note">Marked blocked in sample records</div>
          </div>

          <div className="org-security-stat">
            <div className="org-security-stat-top">
              <span className="org-security-stat-label">Organizations at risk</span>
              <span className="org-security-stat-icon amber"><Users size={18} /></span>
            </div>
            <div className="org-security-stat-value">{highRiskCount}</div>
            <div className="org-security-stat-note">Sample security score below 70</div>
          </div>
        </section>

        <div className="org-security-banner">
          <ShieldCheck size={18} />
          <div>
            <strong>Security preview mode.</strong> These events, policy states, and organization scores are illustrative sample data. Policy switches and event updates affect only this page's temporary state. They do not enforce authentication, block access, or modify production security settings.
          </div>
        </div>

        <section className="org-security-panel">
          <div className="org-security-panel-header">
            <div>
              <h2 className="org-security-panel-title">
                {activeTab === "events"
                  ? "Security events"
                  : activeTab === "policies"
                    ? "Security policies"
                    : "Organization posture"}
              </h2>
              <p className="org-security-panel-description">
                {activeTab === "events"
                  ? "Investigate sign-in activity, API key changes, and policy events."
                  : activeTab === "policies"
                    ? "Review security controls and their current preview configuration."
                    : "Compare sample authentication coverage and security scores."}
              </p>
            </div>

            <div className="org-security-tabs">
              <button className={`org-security-tab ${activeTab === "events" ? "active" : ""}`} onClick={() => setActiveTab("events")}>
                <Activity size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: 5 }} />
                Events
              </button>
              <button className={`org-security-tab ${activeTab === "policies" ? "active" : ""}`} onClick={() => setActiveTab("policies")}>
                <LockKeyhole size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: 5 }} />
                Policies
              </button>
              <button className={`org-security-tab ${activeTab === "organizations" ? "active" : ""}`} onClick={() => setActiveTab("organizations")}>
                <Users size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: 5 }} />
                Organizations
              </button>
            </div>
          </div>

          <div className="org-security-panel-header">
            <div className="org-security-filters">
              <div className="org-security-search-wrap">
                <Search size={14} className="org-security-search-icon" />
                <input
                  className="org-security-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search security records..."
                  aria-label="Search security records"
                />
              </div>

              {activeTab !== "policies" && (
                <select
                  className="org-security-select"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  aria-label="Filter by status"
                >
                  <option>All statuses</option>
                  {activeTab === "events" ? (
                    <>
                      <option>Protected</option>
                      <option>Review required</option>
                      <option>Blocked</option>
                    </>
                  ) : (
                    <>
                      <option>Protected</option>
                      <option>Review required</option>
                    </>
                  )}
                </select>
              )}

              {activeTab === "events" && (
                <select
                  className="org-security-select"
                  value={severityFilter}
                  onChange={(event) => setSeverityFilter(event.target.value)}
                  aria-label="Filter by severity"
                >
                  <option>All severities</option>
                  {severityOptions.map((severity) => (
                    <option key={severity}>{severity}</option>
                  ))}
                </select>
              )}

              <button className="org-security-btn" onClick={clearFilters}>Clear filters</button>
            </div>
          </div>

          {activeTab === "events" && (
            <>
              <div className="org-security-table-scroll">
                <table className="org-security-table">
                  <thead>
                    <tr>
                      <th>EVENT</th>
                      <th>ORGANIZATION</th>
                      <th>ACTOR</th>
                      <th>SOURCE IP</th>
                      <th>SEVERITY</th>
                      <th>STATUS</th>
                      <th>TIME</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.map((event) => (
                      <tr key={event.id}>
                        <td>
                          <div className="org-security-strong">{event.event}</div>
                          <div className="org-security-sub">{event.id}</div>
                        </td>
                        <td>{event.organization}</td>
                        <td>{event.actor}</td>
                        <td>{event.source}</td>
                        <td>
                          <span className={`org-security-pill ${event.severity}`}>
                            <span className="org-security-dot" />
                            {event.severity}
                          </span>
                        </td>
                        <td>
                          <span className={`org-security-pill ${event.status.replace(" ", "-")}`}>
                            <span className="org-security-dot" />
                            {event.status}
                          </span>
                        </td>
                        <td>{event.timestamp}</td>
                        <td>
                          <button className="org-security-icon-btn" onClick={() => setSelectedEvent(event)} aria-label={`Review ${event.id}`} title="Review event">
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredEvents.length === 0 && (
                      <tr><td colSpan={8}><div className="org-security-empty">No security events match your filters.</div></td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="org-security-footer">
                <span>Showing {filteredEvents.length} of {events.length} sample events</span>
                <span>Source: local preview data</span>
              </div>
            </>
          )}

          {activeTab === "policies" && (
            <>
              <div className="org-security-policy-list">
                {filteredPolicies.map((policy) => (
                  <article className="org-security-policy" key={policy.id}>
                    <div className="org-security-policy-top">
                      <div className="org-security-policy-icon">
                        {policy.id === "mfa" ? <Fingerprint size={18} /> :
                         policy.id === "sso" ? <Shield size={18} /> :
                         policy.id === "session" ? <Clock3 size={18} /> :
                         policy.id === "ip" ? <Globe size={18} /> :
                         policy.id === "keys" ? <KeyRound size={18} /> :
                         <Activity size={18} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 className="org-security-policy-name">{policy.name}</h3>
                        <p className="org-security-policy-description">{policy.description}</p>
                        <div className="org-security-sub" style={{ marginTop: 8 }}>{policy.category}</div>
                      </div>
                    </div>
                    <div className="org-security-policy-bottom">
                      <div>
                        <div className="org-security-strong">{policy.enabled ? "Enabled" : "Disabled"}</div>
                        <div className="org-security-sub">
                          {policy.enforced ? "Marked as enforced" : "Preview configuration"}
                        </div>
                      </div>
                      <button
                        className={`org-security-toggle ${policy.enabled ? "on" : ""}`}
                        disabled={policy.enforced}
                        onClick={() => togglePolicy(policy.id)}
                        aria-label={`${policy.enabled ? "Disable" : "Enable"} ${policy.name}`}
                        aria-pressed={policy.enabled}
                        title={policy.enforced ? "Enforced policy" : "Toggle preview policy"}
                      >
                        <span className="org-security-toggle-knob" />
                      </button>
                    </div>
                  </article>
                ))}
                {filteredPolicies.length === 0 && (
                  <div className="org-security-empty" style={{ gridColumn: "1 / -1" }}>No policies match your search.</div>
                )}
              </div>
              <div className="org-security-footer">
                <span>{filteredPolicies.length} policies shown</span>
                <span>Enforced settings are locked in this preview</span>
              </div>
            </>
          )}

          {activeTab === "organizations" && (
            <>
              <div className="org-security-table-scroll">
                <table className="org-security-table">
                  <thead>
                    <tr>
                      <th>ORGANIZATION</th>
                      <th>MFA COVERAGE</th>
                      <th>SINGLE SIGN-ON</th>
                      <th>API KEYS</th>
                      <th>SECURITY SCORE</th>
                      <th>ASSESSMENT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrganizations.map((organization) => (
                      <tr key={organization.name}>
                        <td><div className="org-security-strong">{organization.name}</div></td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                            <div className="org-security-score-track">
                              <div className="org-security-score-fill" style={{ width: `${organization.mfa}%` }} />
                            </div>
                            <span>{organization.mfa}%</span>
                          </div>
                        </td>
                        <td>
                          <span className={`org-security-pill ${organization.sso ? "Protected" : "Review-required"}`}>
                            {organization.sso ? "Configured" : "Not configured"}
                          </span>
                        </td>
                        <td>{organization.keys}</td>
                        <td>
                          <div className="org-security-score">
                            <strong>{organization.score}/100</strong>
                            <div className="org-security-score-track">
                              <div
                                className="org-security-score-fill"
                                style={{
                                  width: `${organization.score}%`,
                                  background: organization.score < 70 ? "#e05252" : organization.score < 85 ? "#e3a02b" : "#16a36b",
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`org-security-pill ${organization.score < 70 ? "Blocked" : organization.score < 85 ? "Review-required" : "Protected"}`}>
                            {organization.score < 70 ? "High risk" : organization.score < 85 ? "Needs review" : "Good"}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredOrganizations.length === 0 && (
                      <tr><td colSpan={6}><div className="org-security-empty">No organizations match your search.</div></td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="org-security-footer">
                <span>{filteredOrganizations.length} organizations shown</span>
                <span>Scores and coverage are sample values, not live assessments</span>
              </div>
            </>
          )}
        </section>

        {selectedEvent && (
          <div className="org-security-modal-backdrop" onClick={() => setSelectedEvent(null)}>
            <section
              className="org-security-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="org-security-event-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="org-security-modal-header">
                <div>
                  <h2 className="org-security-modal-title" id="org-security-event-title">{selectedEvent.id}</h2>
                  <p className="org-security-modal-subtitle">{selectedEvent.event}</p>
                </div>
                <button className="org-security-icon-btn" onClick={() => setSelectedEvent(null)} aria-label="Close event details">
                  <X size={15} />
                </button>
              </div>

              <div className="org-security-modal-body">
                {[
                  ["Organization", selectedEvent.organization],
                  ["Event", selectedEvent.event],
                  ["Actor", selectedEvent.actor],
                  ["Source IP", selectedEvent.source],
                  ["Timestamp", selectedEvent.timestamp],
                  ["Severity", selectedEvent.severity],
                  ["Current status", selectedEvent.status],
                ].map(([label, value]) => (
                  <div className="org-security-detail-row" key={label}>
                    <span className="org-security-detail-label">{label}</span>
                    <span className="org-security-detail-value">{value}</span>
                  </div>
                ))}

                <div style={{ marginTop: 20 }}>
                  <label htmlFor="security-event-status" style={{ display: "block", marginBottom: 8, fontSize: 12, fontWeight: 650 }}>
                    Update preview status
                  </label>
                  <select
                    id="security-event-status"
                    className="org-security-select"
                    style={{ width: "100%" }}
                    value={selectedEvent.status}
                    onChange={(event) =>
                      setSelectedEvent({
                        ...selectedEvent,
                        status: event.target.value as SecurityStatus,
                      })
                    }
                  >
                    <option>Protected</option>
                    <option>Review required</option>
                    <option>Blocked</option>
                  </select>
                </div>
              </div>

              <div className="org-security-modal-footer">
                <button className="org-security-btn" onClick={() => setSelectedEvent(null)}>Cancel</button>
                <button
                  className="org-security-btn primary"
                  onClick={() => updateEventStatus(selectedEvent.id, selectedEvent.status)}
                >
                  <CheckCircle2 size={14} /> Save status
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
