
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Download,
  FileSearch,
  Fingerprint,
  Globe,
  KeyRound,
  LockKeyhole,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Users,
  X,
  Eye,
  Pencil,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

type PolicyStatus = "Enabled" | "Disabled" | "Review Required";
type Classification = "Public" | "Internal" | "Confidential" | "Restricted";

type Policy = {
  id: string;
  name: string;
  category: string;
  classification: Classification;
  retention: string;
  owner: string;
  status: PolicyStatus;
  description: string;
  updatedAt: string;
};

const initialPolicies: Policy[] = [
  {
    id: "DP-1001",
    name: "Customer Data Protection",
    category: "Customer Data",
    classification: "Confidential",
    retention: "365 days",
    owner: "Security Administrator",
    status: "Enabled",
    description:
      "Defines handling and access expectations for customer information.",
    updatedAt: "Nov 2, 2026",
  },
  {
    id: "DP-1002",
    name: "Sensitive Information Handling",
    category: "Sensitive Data",
    classification: "Restricted",
    retention: "90 days",
    owner: "Data Protection Team",
    status: "Enabled",
    description:
      "Describes safeguards for sensitive and restricted information.",
    updatedAt: "Nov 1, 2026",
  },
  {
    id: "DP-1003",
    name: "Internal Document Retention",
    category: "Documents",
    classification: "Internal",
    retention: "180 days",
    owner: "Workspace Administrator",
    status: "Review Required",
    description:
      "Defines a sample retention period for internal documents.",
    updatedAt: "Oct 29, 2026",
  },
  {
    id: "DP-1004",
    name: "Public Content Handling",
    category: "Public Content",
    classification: "Public",
    retention: "Indefinite",
    owner: "Platform Administrator",
    status: "Disabled",
    description:
      "Describes the intended handling of public-facing content.",
    updatedAt: "Oct 27, 2026",
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

const severityStyle: Record<
  string,
  { color: string; background: string }
> = {
  Critical: { color: "#b91c1c", background: "#fef2f2" },
  High: { color: "#c2410c", background: "#fff7ed" },
  Medium: { color: "#a16207", background: "#fefce8" },
  Low: { color: "#0369a1", background: "#eff6ff" },
};

const classificationStyle: Record<
  Classification,
  { color: string; background: string }
> = {
  Public: { color: "#0369a1", background: "#eff6ff" },
  Internal: { color: "#475569", background: "#f1f5f9" },
  Confidential: { color: "#7c3aed", background: "#f5f3ff" },
  Restricted: { color: "#b91c1c", background: "#fef2f2" },
};

const emptyPolicy: Omit<Policy, "id" | "updatedAt"> = {
  name: "",
  category: "Customer Data",
  classification: "Internal",
  retention: "180 days",
  owner: "Security Administrator",
  status: "Enabled",
  description: "",
};

export default function SecurityOverviewPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [alertFilter, setAlertFilter] = useState("All");
  const [alertSearch, setAlertSearch] = useState("");
  const [lastUpdated, setLastUpdated] = useState("Just now");
  const [notice, setNotice] = useState("");

  const [activeView, setActiveView] = useState<"overview" | "data-protection">(
    "overview",
  );

  const [policies, setPolicies] = useState<Policy[]>(initialPolicies);
  const [policySearch, setPolicySearch] = useState("");
  const [policyStatusFilter, setPolicyStatusFilter] = useState("All");
  const [classificationFilter, setClassificationFilter] = useState("All");
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
  const [showPolicyForm, setShowPolicyForm] = useState(false);
  const [pendingToggle, setPendingToggle] = useState<Policy | null>(null);
  const [policyForm, setPolicyForm] = useState(emptyPolicy);

  const filteredAlerts = useMemo(() => {
    const query = alertSearch.trim().toLowerCase();

    return alerts.filter((alert) => {
      const matchesSeverity =
        alertFilter === "All" || alert.severity === alertFilter;

      const matchesSearch =
        !query ||
        `${alert.id} ${alert.title} ${alert.source}`
          .toLowerCase()
          .includes(query);

      return matchesSeverity && matchesSearch;
    });
  }, [alerts, alertFilter, alertSearch]);

  const filteredPolicies = useMemo(() => {
    const query = policySearch.trim().toLowerCase();

    return policies.filter((policy) => {
      const matchesSearch =
        !query ||
        `${policy.id} ${policy.name} ${policy.category} ${policy.owner} ${policy.description}`
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        policyStatusFilter === "All" ||
        policy.status === policyStatusFilter;

      const matchesClassification =
        classificationFilter === "All" ||
        policy.classification === classificationFilter;

      return matchesSearch && matchesStatus && matchesClassification;
    });
  }, [policies, policySearch, policyStatusFilter, classificationFilter]);

  const enabledCount = policies.filter(
    (policy) => policy.status === "Enabled",
  ).length;

  const restrictedCount = policies.filter(
    (policy) => policy.classification === "Restricted",
  ).length;

  const reviewCount = policies.filter(
    (policy) => policy.status === "Review Required",
  ).length;

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
      value: String(
        alerts.filter((alert) => alert.status !== "Resolved").length,
      ),
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
      trend: "Security center",
      direction: "up",
    },
    {
      title: "Active incidents",
      value: String(
        alerts.filter(
          (alert) =>
            alert.severity === "Critical" || alert.severity === "High",
        ).length,
      ),
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
      }),
    );
    setNotice(
      "Demo overview refreshed. Live security telemetry is not connected.",
    );
  }

  function updateAlertStatus(id: string, status: string) {
    setAlerts((current) =>
      current.map((alert) =>
        alert.id === id ? { ...alert, status } : alert,
      ),
    );

    setSelectedAlert((current) =>
      current?.id === id ? { ...current, status } : current,
    );

    setNotice(`${id} marked as ${status.toLowerCase()} in the local demo.`);
  }

  function openCreatePolicy() {
    setEditingPolicyId(null);
    setPolicyForm(emptyPolicy);
    setShowPolicyForm(true);
    setSelectedPolicy(null);
  }

  function openEditPolicy(policy: Policy) {
    setEditingPolicyId(policy.id);
    setPolicyForm({
      name: policy.name,
      category: policy.category,
      classification: policy.classification,
      retention: policy.retention,
      owner: policy.owner,
      status: policy.status,
      description: policy.description,
    });
    setSelectedPolicy(null);
    setShowPolicyForm(true);
  }

  function savePolicy(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!policyForm.name.trim() || !policyForm.description.trim()) {
      setNotice("Enter a policy name and description.");
      return;
    }

    if (editingPolicyId) {
      setPolicies((current) =>
        current.map((policy) =>
          policy.id === editingPolicyId
            ? {
                ...policy,
                ...policyForm,
                name: policyForm.name.trim(),
                description: policyForm.description.trim(),
                updatedAt: "Just now",
              }
            : policy,
        ),
      );

      setNotice("Policy updated in the local demo.");
    } else {
      const nextNumber =
        Math.max(
          1000,
          ...policies.map((policy) => {
            const number = Number(policy.id.replace("DP-", ""));
            return Number.isFinite(number) ? number : 1000;
          }),
        ) + 1;

      const newPolicy: Policy = {
        ...policyForm,
        id: `DP-${nextNumber}`,
        name: policyForm.name.trim(),
        description: policyForm.description.trim(),
        updatedAt: "Just now",
      };

      setPolicies((current) => [newPolicy, ...current]);
      setNotice("Policy created in the local demo.");
    }

    setShowPolicyForm(false);
    setEditingPolicyId(null);
  }

  function confirmPolicyToggle() {
    if (!pendingToggle) return;

    const nextStatus: PolicyStatus =
      pendingToggle.status === "Enabled" ? "Disabled" : "Enabled";

    setPolicies((current) =>
      current.map((policy) =>
        policy.id === pendingToggle.id
          ? { ...policy, status: nextStatus, updatedAt: "Just now" }
          : policy,
      ),
    );

    setSelectedPolicy((current) =>
      current?.id === pendingToggle.id
        ? { ...current, status: nextStatus, updatedAt: "Just now" }
        : current,
    );

    setNotice(
      `${pendingToggle.name} marked ${nextStatus.toLowerCase()} in the local demo.`,
    );
    setPendingToggle(null);
  }

  function exportPolicies() {
    const headers = [
      "ID",
      "Policy",
      "Category",
      "Classification",
      "Retention",
      "Owner",
      "Status",
      "Description",
      "Updated",
    ];

    const escapeCsv = (value: string) =>
      `"${value.replace(/"/g, '""')}"`;

    const rows = filteredPolicies.map((policy) =>
      [
        policy.id,
        policy.name,
        policy.category,
        policy.classification,
        policy.retention,
        policy.owner,
        policy.status,
        policy.description,
        policy.updatedAt,
      ]
        .map(escapeCsv)
        .join(","),
    );

    const csv = [headers.map(escapeCsv).join(","), ...rows].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "modelnow-data-protection-policies.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setNotice("Filtered policies exported to CSV.");
  }

  return (
    <main className="security-page">
      <div className="security-container">
        <header className="page-header">
          <div>
            <div className="eyebrow">
              <ShieldCheck size={17} />
              MODELNOW ADMIN
              <span className="eyebrow-separator">/</span>
              SECURITY
            </div>

            <h1>
              {activeView === "overview"
                ? "Security Overview"
                : "Data Protection"}
            </h1>

            <p className="page-description">
              {activeView === "overview"
                ? "Monitor security signals, review potential risks, and navigate your organization's security controls."
                : "Review data handling policies, classifications, retention settings, and policy status."}
            </p>
          </div>

          <div className="header-actions">
            {activeView === "data-protection" && (
              <>
                <button className="button" onClick={exportPolicies}>
                  <Download size={15} />
                  Export CSV
                </button>
                <button className="button button-primary" onClick={openCreatePolicy}>
                  <Plus size={16} />
                  Add policy
                </button>
              </>
            )}

            <button className="button" onClick={refreshOverview}>
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>
        </header>

        <nav className="view-tabs" aria-label="Security views">
          <button
            className={`view-tab ${activeView === "overview" ? "active" : ""}`}
            onClick={() => setActiveView("overview")}
          >
            <ShieldCheck size={16} />
            Security Overview
          </button>

          <button
            className={`view-tab ${activeView === "data-protection" ? "active" : ""}`}
            onClick={() => setActiveView("data-protection")}
          >
            <LockKeyhole size={16} />
            Data Protection
            <span className="tab-count">{policies.length}</span>
          </button>
        </nav>

        <div className="demo-banner">
          <Activity size={16} />
          <span>
            <strong>Frontend demo.</strong> Policy changes and alerts are local
            sample state. They do not enforce security controls on real data.
          </span>
          <span className="last-refreshed">Last refreshed: {lastUpdated}</span>
        </div>

        {notice && (
          <div className="notice" role="status">
            <CheckCircle2 size={17} />
            <span>{notice}</span>
            <button
              className="icon-button"
              onClick={() => setNotice("")}
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {activeView === "overview" ? (
          <>
            <section className="metrics-grid">
              {metrics.map((metric) => {
                const Icon = metric.icon;
                const TrendIcon =
                  metric.direction === "up" ? ArrowUpRight : ArrowDownRight;

                return (
                  <article className="metric-card" key={metric.title}>
                    <div className="metric-top">
                      <div>
                        <p className="metric-label">{metric.title}</p>
                        <p className="metric-value">{metric.value}</p>
                      </div>
                      <div
                        className="metric-icon"
                        style={{
                          background: metric.background,
                          color: metric.color,
                        }}
                      >
                        <Icon size={21} />
                      </div>
                    </div>
                    <p className="metric-detail">{metric.detail}</p>
                    <div className="metric-trend" style={{ color: metric.color }}>
                      <TrendIcon size={14} />
                      {metric.trend}
                    </div>
                  </article>
                );
              })}
            </section>

            <section className="overview-grid">
              <article className="panel alerts-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Security alerts</h2>
                    <p>Review and update sample security signals.</p>
                  </div>
                  <span className="neutral-badge">
                    {alerts.filter((alert) => alert.status !== "Resolved").length}{" "}
                    unresolved
                  </span>
                </div>

                <div className="filter-row">
                  <div className="search-box">
                    <Search size={16} />
                    <input
                      value={alertSearch}
                      onChange={(event) => setAlertSearch(event.target.value)}
                      placeholder="Search alerts..."
                      aria-label="Search security alerts"
                    />
                  </div>

                  <select
                    value={alertFilter}
                    onChange={(event) => setAlertFilter(event.target.value)}
                    aria-label="Filter alert severity"
                  >
                    <option value="All">All severities</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="alert-list">
                  {filteredAlerts.map((alert) => {
                    const style = severityStyle[alert.severity];

                    return (
                      <button
                        key={alert.id}
                        className="alert-item"
                        onClick={() => setSelectedAlert(alert)}
                      >
                        <span className="alert-icon">
                          <ShieldAlert size={17} />
                        </span>
                        <span className="alert-copy">
                          <span className="alert-title-row">
                            <strong>{alert.title}</strong>
                            <span
                              className="status-badge"
                              style={{
                                color: style.color,
                                background: style.background,
                              }}
                            >
                              {alert.severity}
                            </span>
                          </span>
                          <span className="alert-meta">
                            {alert.id} · {alert.source}
                          </span>
                          <span className="alert-time">{alert.time}</span>
                        </span>
                        <span className="alert-status">
                          {alert.status}
                          <ArrowRight size={15} />
                        </span>
                      </button>
                    );
                  })}

                  {filteredAlerts.length === 0 && (
                    <div className="empty-state">
                      No alerts match the current filters.
                    </div>
                  )}
                </div>
              </article>

              <article className="panel priorities-panel">
                <h2>Security priorities</h2>
                <p className="panel-description">
                  Suggested review areas for administrators.
                </p>

                {[
                  {
                    title: "Identity protection",
                    description: "Review MFA and sign-in controls.",
                    icon: Fingerprint,
                    color: "#315fea",
                  },
                  {
                    title: "Credential hygiene",
                    description: "Review API key rotation and secret access.",
                    icon: KeyRound,
                    color: "#7c3aed",
                  },
                  {
                    title: "Access reviews",
                    description: "Validate privileged role assignments.",
                    icon: Users,
                    color: "#15803d",
                  },
                  {
                    title: "Data protection",
                    description: "Review classifications and retention policies.",
                    icon: LockKeyhole,
                    color: "#b45309",
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div className="priority-item" key={item.title}>
                      <span
                        className="priority-icon"
                        style={{
                          color: item.color,
                          background: `${item.color}12`,
                        }}
                      >
                        <Icon size={17} />
                      </span>
                      <span>
                        <strong>{item.title}</strong>
                        <small>{item.description}</small>
                      </span>
                    </div>
                  );
                })}

                <button
                  className="button full-width"
                  onClick={() => setActiveView("data-protection")}
                >
                  Open Data Protection
                  <ArrowRight size={15} />
                </button>
              </article>
            </section>

            <section className="security-center">
              <div className="section-heading">
                <h2>Security center</h2>
                <p>
                  Open a security area to manage its configuration and reviews.
                </p>
              </div>

              <div className="security-cards">
                {securityPages.map((page) => {
                  const Icon = page.icon;

                  return (
                    <a className="security-card" key={page.href} href={page.href}>
                      <span className="security-card-icon">
                        <Icon size={20} />
                      </span>
                      <span className="security-card-copy">
                        <strong>{page.title}</strong>
                        <small>{page.description}</small>
                      </span>
                      <ArrowRight className="security-card-arrow" size={16} />
                    </a>
                  );
                })}

                <button
                  className="security-card data-protection-card"
                  onClick={() => setActiveView("data-protection")}
                >
                  <span className="security-card-icon">
                    <LockKeyhole size={20} />
                  </span>
                  <span className="security-card-copy">
                    <strong>Data Protection</strong>
                    <small>
                      Data handling, privacy, classification, and retention
                    </small>
                  </span>
                  <ArrowRight className="security-card-arrow" size={16} />
                </button>
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="metrics-grid">
              {[
                {
                  title: "Total policies",
                  value: policies.length,
                  detail: "Configured sample policies",
                  icon: ShieldCheck,
                  color: "#315fea",
                  background: "#eff6ff",
                },
                {
                  title: "Enabled",
                  value: enabledCount,
                  detail: "Policies marked enabled",
                  icon: CheckCircle2,
                  color: "#15803d",
                  background: "#f0fdf4",
                },
                {
                  title: "Restricted",
                  value: restrictedCount,
                  detail: "Policies for restricted data",
                  icon: LockKeyhole,
                  color: "#b91c1c",
                  background: "#fef2f2",
                },
                {
                  title: "Review required",
                  value: reviewCount,
                  detail: "Policies requiring attention",
                  icon: Clock3,
                  color: "#b45309",
                  background: "#fff7ed",
                },
              ].map((metric) => {
                const Icon = metric.icon;

                return (
                  <article className="metric-card" key={metric.title}>
                    <div className="metric-top">
                      <div>
                        <p className="metric-label">{metric.title}</p>
                        <p className="metric-value">{metric.value}</p>
                      </div>
                      <div
                        className="metric-icon"
                        style={{
                          background: metric.background,
                          color: metric.color,
                        }}
                      >
                        <Icon size={21} />
                      </div>
                    </div>
                    <p className="metric-detail">{metric.detail}</p>
                  </article>
                );
              })}
            </section>

            <section className="principles-grid">
              {[
                {
                  title: "Data minimization",
                  description:
                    "Collect and retain only what is necessary for a defined purpose.",
                  icon: FileSearch,
                },
                {
                  title: "Classification",
                  description:
                    "Label information according to its sensitivity and handling needs.",
                  icon: Shield,
                },
                {
                  title: "Access awareness",
                  description:
                    "Review who should be able to access sensitive information.",
                  icon: Users,
                },
                {
                  title: "Retention review",
                  description:
                    "Review retention periods against your organization's requirements.",
                  icon: Clock3,
                },
              ].map((principle) => {
                const Icon = principle.icon;

                return (
                  <article className="principle-card" key={principle.title}>
                    <span className="principle-icon">
                      <Icon size={18} />
                    </span>
                    <strong>{principle.title}</strong>
                    <p>{principle.description}</p>
                  </article>
                );
              })}
            </section>

            <section className="panel policies-panel">
              <div className="panel-heading policy-panel-heading">
                <div>
                  <h2>Protection policies</h2>
                  <p>
                    Manage sample policy definitions and their review status.
                  </p>
                </div>
                <button className="button button-primary" onClick={openCreatePolicy}>
                  <Plus size={15} />
                  Create policy
                </button>
              </div>

              <div className="filter-row policy-filters">
                <div className="search-box">
                  <Search size={16} />
                  <input
                    value={policySearch}
                    onChange={(event) => setPolicySearch(event.target.value)}
                    placeholder="Search policies, owners, or categories..."
                    aria-label="Search protection policies"
                  />
                </div>

                <select
                  value={policyStatusFilter}
                  onChange={(event) => setPolicyStatusFilter(event.target.value)}
                  aria-label="Filter policy status"
                >
                  <option value="All">All statuses</option>
                  <option value="Enabled">Enabled</option>
                  <option value="Disabled">Disabled</option>
                  <option value="Review Required">Review required</option>
                </select>

                <select
                  value={classificationFilter}
                  onChange={(event) => setClassificationFilter(event.target.value)}
                  aria-label="Filter data classification"
                >
                  <option value="All">All classifications</option>
                  <option value="Public">Public</option>
                  <option value="Internal">Internal</option>
                  <option value="Confidential">Confidential</option>
                  <option value="Restricted">Restricted</option>
                </select>
              </div>

              <div className="table-wrap">
                <table className="policy-table">
                  <thead>
                    <tr>
                      <th>Policy</th>
                      <th>Classification</th>
                      <th>Retention</th>
                      <th>Owner</th>
                      <th>Status</th>
                      <th>Updated</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPolicies.map((policy) => {
                      const classStyle =
                        classificationStyle[policy.classification];

                      return (
                        <tr key={policy.id}>
                          <td>
                            <button
                              className="policy-name-button"
                              onClick={() => setSelectedPolicy(policy)}
                            >
                              <span className="policy-name">{policy.name}</span>
                              <span className="policy-id">{policy.id}</span>
                            </button>
                            <span className="policy-category">
                              {policy.category}
                            </span>
                          </td>
                          <td>
                            <span
                              className="status-badge"
                              style={{
                                color: classStyle.color,
                                background: classStyle.background,
                              }}
                            >
                              {policy.classification}
                            </span>
                          </td>
                          <td>{policy.retention}</td>
                          <td>{policy.owner}</td>
                          <td>
                            <span
                              className={`policy-status ${
                                policy.status === "Enabled"
                                  ? "status-enabled"
                                  : policy.status === "Disabled"
                                    ? "status-disabled"
                                    : "status-review"
                              }`}
                            >
                              <span className="status-dot" />
                              {policy.status}
                            </span>
                          </td>
                          <td>{policy.updatedAt}</td>
                          <td>
                            <div className="table-actions">
                              <button
                                className="icon-button"
                                title="View policy"
                                aria-label={`View ${policy.name}`}
                                onClick={() => setSelectedPolicy(policy)}
                              >
                                <Eye size={16} />
                              </button>
                              <button
                                className="icon-button"
                                title="Edit policy"
                                aria-label={`Edit ${policy.name}`}
                                onClick={() => openEditPolicy(policy)}
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                className="icon-button"
                                title={
                                  policy.status === "Enabled"
                                    ? "Disable policy"
                                    : "Enable policy"
                                }
                                aria-label={`Toggle ${policy.name}`}
                                onClick={() => setPendingToggle(policy)}
                              >
                                {policy.status === "Enabled" ? (
                                  <ToggleRight size={18} />
                                ) : (
                                  <ToggleLeft size={18} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {filteredPolicies.length === 0 && (
                  <div className="empty-state">
                    No policies match the selected filters.
                  </div>
                )}
              </div>

              <div className="table-footer">
                Showing {filteredPolicies.length} of {policies.length} policies
                <button
                  className="text-button"
                  onClick={() => {
                    setPolicySearch("");
                    setPolicyStatusFilter("All");
                    setClassificationFilter("All");
                  }}
                >
                  Reset filters
                </button>
              </div>
            </section>
          </>
        )}

        <footer className="page-footer">
          <span>ModelNow Security Center · Frontend prototype</span>
          <span className="footer-status">
            <CheckCircle2 size={14} />
            Sample interface loaded
          </span>
        </footer>
      </div>

      {selectedAlert && (
        <div className="overlay" onClick={() => setSelectedAlert(null)}>
          <aside
            className="drawer"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="drawer-header">
              <div>
                <p className="eyebrow">ALERT DETAILS</p>
                <h2>{selectedAlert.title}</h2>
                <p className="drawer-subtitle">{selectedAlert.id}</p>
              </div>
              <button
                className="icon-button"
                onClick={() => setSelectedAlert(null)}
                aria-label="Close alert details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="detail-list">
              <DetailRow label="Severity" value={selectedAlert.severity} />
              <DetailRow label="Source" value={selectedAlert.source} />
              <DetailRow label="Reported" value={selectedAlert.time} />
              <DetailRow label="Status" value={selectedAlert.status} />
            </div>

            <div className="warning-box">
              This is an illustrative alert for frontend testing. Real
              investigation requires connected security telemetry and backend
              services.
            </div>

            <h3 className="drawer-section-title">Update status</h3>
            <div className="drawer-actions">
              {["Open", "Investigating", "Resolved"].map((status) => (
                <button
                  key={status}
                  className={`button ${
                    selectedAlert.status === status ? "button-selected" : ""
                  }`}
                  onClick={() => updateAlertStatus(selectedAlert.id, status)}
                >
                  {status}
                </button>
              ))}
            </div>

            <button
              className="button button-primary full-width drawer-done"
              onClick={() => setSelectedAlert(null)}
            >
              Done
            </button>
          </aside>
        </div>
      )}

      {selectedPolicy && (
        <div className="overlay" onClick={() => setSelectedPolicy(null)}>
          <aside
            className="drawer"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="drawer-header">
              <div>
                <p className="eyebrow">DATA PROTECTION POLICY</p>
                <h2>{selectedPolicy.name}</h2>
                <p className="drawer-subtitle">{selectedPolicy.id}</p>
              </div>
              <button
                className="icon-button"
                onClick={() => setSelectedPolicy(null)}
                aria-label="Close policy details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="detail-list">
              <DetailRow label="Category" value={selectedPolicy.category} />
              <DetailRow
                label="Classification"
                value={selectedPolicy.classification}
              />
              <DetailRow label="Retention" value={selectedPolicy.retention} />
              <DetailRow label="Owner" value={selectedPolicy.owner} />
              <DetailRow label="Status" value={selectedPolicy.status} />
              <DetailRow label="Updated" value={selectedPolicy.updatedAt} />
            </div>

            <div className="policy-description-box">
              <h3>Description</h3>
              <p>{selectedPolicy.description}</p>
            </div>

            <div className="warning-box">
              Policy details are sample frontend data. They do not represent
              verified production enforcement or legal compliance.
            </div>

            <button
              className="button button-primary full-width drawer-done"
              onClick={() => openEditPolicy(selectedPolicy)}
            >
              <Pencil size={15} />
              Edit policy
            </button>
          </aside>
        </div>
      )}

      {showPolicyForm && (
        <div
          className="overlay modal-overlay"
          onClick={() => setShowPolicyForm(false)}
        >
          <section
            className="policy-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="drawer-header">
              <div>
                <p className="eyebrow">MODELNOW ADMIN</p>
                <h2>{editingPolicyId ? "Edit policy" : "Create policy"}</h2>
                <p className="drawer-subtitle">
                  Configure the sample policy details.
                </p>
              </div>
              <button
                className="icon-button"
                onClick={() => setShowPolicyForm(false)}
                aria-label="Close policy form"
              >
                <X size={18} />
              </button>
            </div>

            <form className="policy-form" onSubmit={savePolicy}>
              <label>
                Policy name
                <input
                  value={policyForm.name}
                  onChange={(event) =>
                    setPolicyForm({
                      ...policyForm,
                      name: event.target.value,
                    })
                  }
                  placeholder="e.g. Customer Data Protection"
                  required
                />
              </label>

              <div className="form-grid">
                <label>
                  Category
                  <select
                    value={policyForm.category}
                    onChange={(event) =>
                      setPolicyForm({
                        ...policyForm,
                        category: event.target.value,
                      })
                    }
                  >
                    <option>Customer Data</option>
                    <option>Sensitive Data</option>
                    <option>Documents</option>
                    <option>Public Content</option>
                    <option>AI Training Data</option>
                    <option>Logs and Analytics</option>
                  </select>
                </label>

                <label>
                  Classification
                  <select
                    value={policyForm.classification}
                    onChange={(event) =>
                      setPolicyForm({
                        ...policyForm,
                        classification: event.target.value as Classification,
                      })
                    }
                  >
                    <option>Public</option>
                    <option>Internal</option>
                    <option>Confidential</option>
                    <option>Restricted</option>
                  </select>
                </label>

                <label>
                  Retention period
                  <select
                    value={policyForm.retention}
                    onChange={(event) =>
                      setPolicyForm({
                        ...policyForm,
                        retention: event.target.value,
                      })
                    }
                  >
                    <option>30 days</option>
                    <option>90 days</option>
                    <option>180 days</option>
                    <option>365 days</option>
                    <option>Indefinite</option>
                    <option>Custom / review required</option>
                  </select>
                </label>

                <label>
                  Policy owner
                  <select
                    value={policyForm.owner}
                    onChange={(event) =>
                      setPolicyForm({
                        ...policyForm,
                        owner: event.target.value,
                      })
                    }
                  >
                    <option>Security Administrator</option>
                    <option>Data Protection Team</option>
                    <option>Workspace Administrator</option>
                    <option>Platform Administrator</option>
                    <option>Compliance Team</option>
                  </select>
                </label>

                <label>
                  Status
                  <select
                    value={policyForm.status}
                    onChange={(event) =>
                      setPolicyForm({
                        ...policyForm,
                        status: event.target.value as PolicyStatus,
                      })
                    }
                  >
                    <option>Enabled</option>
                    <option>Disabled</option>
                    <option>Review Required</option>
                  </select>
                </label>
              </div>

              <label>
                Description
                <textarea
                  value={policyForm.description}
                  onChange={(event) =>
                    setPolicyForm({
                      ...policyForm,
                      description: event.target.value,
                    })
                  }
                  placeholder="Describe the purpose and scope of this policy."
                  rows={4}
                  required
                />
              </label>

              <div className="form-actions">
                <button
                  type="button"
                  className="button"
                  onClick={() => setShowPolicyForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="button button-primary">
                  <CheckCircle2 size={15} />
                  {editingPolicyId ? "Save changes" : "Create policy"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {pendingToggle && (
        <div className="overlay modal-overlay">
          <section className="confirm-modal">
            <span className="confirm-icon">
              <AlertTriangle size={22} />
            </span>
            <h2>
              {pendingToggle.status === "Enabled"
                ? "Disable this policy?"
                : "Enable this policy?"}
            </h2>
            <p>
              You are about to change the local demo status for{" "}
              <strong>{pendingToggle.name}</strong>. This action does not change
              production data or security enforcement.
            </p>
            <div className="form-actions">
              <button className="button" onClick={() => setPendingToggle(null)}>
                Cancel
              </button>
              <button
                className="button button-primary"
                onClick={confirmPolicyToggle}
              >
                Confirm
              </button>
            </div>
          </section>
        </div>
      )}

      <style jsx global>{`
        .security-page {
          min-height: 100vh;
          background: #f7f8fc;
          color: #172033;
          padding: 28px;
          font-family: inherit;
        }

        .security-container {
          max-width: 1500px;
          margin: 0 auto;
        }

        .page-header,
        .panel-heading,
        .metric-top,
        .drawer-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .page-header {
          flex-wrap: wrap;
          margin-bottom: 22px;
        }

        .eyebrow {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #315fea;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.09em;
          margin-bottom: 12px;
        }

        .eyebrow-separator {
          color: #cbd5e1;
        }

        .page-header h1 {
          margin: 0;
          font-size: 30px;
          font-weight: 800;
          letter-spacing: -0.8px;
        }

        .page-description {
          max-width: 760px;
          margin: 9px 0 0;
          color: #64748b;
          font-size: 13px;
          line-height: 1.7;
        }

        .header-actions,
        .view-tabs,
        .filter-row,
        .table-actions,
        .form-actions,
        .drawer-actions {
          display: flex;
          align-items: center;
          gap: 9px;
          flex-wrap: wrap;
        }

        .button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          min-height: 38px;
          border: 1px solid #dce3ed;
          border-radius: 9px;
          background: #fff;
          color: #334155;
          padding: 9px 12px;
          font-size: 12px;
          font-weight: 650;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s;
        }

        .button:hover {
          background: #f8fafc;
          border-color: #b9c6d8;
        }

        .button-primary {
          background: #315fea;
          border-color: #315fea;
          color: #fff;
        }

        .button-primary:hover {
          background: #244ed1;
          border-color: #244ed1;
        }

        .button-selected {
          border-color: #315fea;
          background: #eff6ff;
          color: #315fea;
        }

        .view-tabs {
          border-bottom: 1px solid #e5eaf1;
          margin-bottom: 18px;
          gap: 5px;
        }

        .view-tab {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 15px;
          border: 0;
          border-bottom: 2px solid transparent;
          background: transparent;
          color: #64748b;
          font-size: 13px;
          font-weight: 650;
          cursor: pointer;
        }

        .view-tab.active {
          color: #315fea;
          border-bottom-color: #315fea;
        }

        .tab-count {
          display: inline-grid;
          min-width: 21px;
          height: 21px;
          place-items: center;
          border-radius: 6px;
          background: #eef2ff;
          color: #315fea;
          font-size: 10px;
        }

        .demo-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 20px;
          padding: 12px 15px;
          border: 1px solid #dbeafe;
          border-radius: 11px;
          background: #eff6ff;
          color: #1e40af;
          font-size: 12px;
          line-height: 1.6;
        }

        .last-refreshed {
          margin-left: auto;
          color: #315fea;
        }

        .notice {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 18px;
          padding: 12px 14px;
          border: 1px solid #bbf7d0;
          border-radius: 10px;
          background: #f0fdf4;
          color: #166534;
          font-size: 12px;
        }

        .notice span {
          flex: 1;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 22px;
        }

        .metric-card,
        .panel,
        .principle-card,
        .security-card {
          border: 1px solid #e5eaf1;
          border-radius: 14px;
          background: #fff;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.025);
        }

        .metric-card {
          padding: 19px;
        }

        .metric-label {
          margin: 0;
          color: #64748b;
          font-size: 12px;
          font-weight: 600;
        }

        .metric-value {
          margin: 10px 0 0;
          font-size: 29px;
          font-weight: 800;
          letter-spacing: -0.8px;
        }

        .metric-icon {
          display: grid;
          width: 43px;
          height: 43px;
          place-items: center;
          border-radius: 11px;
        }

        .metric-detail {
          margin: 11px 0 0;
          color: #64748b;
          font-size: 11px;
        }

        .metric-trend {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 14px;
          font-size: 11px;
          font-weight: 650;
        }

        .overview-grid {
          display: grid;
          grid-template-columns: minmax(0, 2fr) minmax(270px, 1fr);
          gap: 18px;
          margin-bottom: 26px;
        }

        .panel {
          min-width: 0;
          padding: 20px;
        }

        .panel h2,
        .section-heading h2 {
          margin: 0;
          font-size: 16px;
          font-weight: 800;
        }

        .panel-heading p,
        .panel-description,
        .section-heading p {
          margin: 6px 0 0;
          color: #64748b;
          font-size: 11px;
          line-height: 1.6;
        }

        .neutral-badge {
          padding: 7px 10px;
          border-radius: 7px;
          background: #f1f5f9;
          color: #475569;
          font-size: 10px;
          white-space: nowrap;
        }

        .filter-row {
          margin: 17px 0;
        }

        .search-box {
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 170px;
          gap: 8px;
          padding: 0 11px;
          border: 1px solid #dce3ed;
          border-radius: 9px;
          color: #94a3b8;
          background: #fff;
        }

        .search-box input {
          width: 100%;
          min-width: 0;
          height: 38px;
          border: 0;
          outline: none;
          color: #172033;
          background: transparent;
          font: inherit;
          font-size: 12px;
        }

        .filter-row select,
        .policy-form select,
        .policy-form input,
        .policy-form textarea {
          min-height: 38px;
          border: 1px solid #dce3ed;
          border-radius: 9px;
          background: #fff;
          color: #334155;
          padding: 9px 11px;
          font: inherit;
          font-size: 12px;
          outline: none;
        }

        .filter-row select:focus,
        .policy-form select:focus,
        .policy-form input:focus,
        .policy-form textarea:focus {
          border-color: #315fea;
          box-shadow: 0 0 0 3px #315fea14;
        }

        .alert-list {
          display: grid;
          gap: 9px;
        }

        .alert-item {
          display: flex;
          align-items: center;
          gap: 11px;
          width: 100%;
          padding: 13px;
          border: 1px solid #eef2f7;
          border-radius: 11px;
          background: #fff;
          text-align: left;
          cursor: pointer;
        }

        .alert-item:hover {
          border-color: #bfdbfe;
          background: #fafcff;
        }

        .alert-icon,
        .priority-icon,
        .security-card-icon,
        .principle-icon {
          display: grid;
          flex-shrink: 0;
          place-items: center;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: #f1f5f9;
          color: #64748b;
        }

        .alert-copy {
          display: grid;
          flex: 1;
          min-width: 0;
          gap: 5px;
        }

        .alert-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          font-size: 12px;
        }

        .alert-meta,
        .alert-time {
          color: #64748b;
          font-size: 10px;
        }

        .alert-time {
          color: #94a3b8;
        }

        .alert-status {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #64748b;
          font-size: 10px;
          white-space: nowrap;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 5px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 750;
          white-space: nowrap;
        }

        .priorities-panel {
          display: flex;
          flex-direction: column;
        }

        .priority-item {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          padding: 15px 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .priority-item strong,
        .priority-item small {
          display: block;
        }

        .priority-item strong {
          font-size: 12px;
        }

        .priority-item small {
          margin-top: 5px;
          color: #64748b;
          font-size: 11px;
          line-height: 1.6;
        }

        .full-width {
          width: 100%;
        }

        .priorities-panel .full-width {
          margin-top: auto;
          padding-top: 10px;
        }

        .security-center {
          margin-top: 28px;
        }

        .section-heading {
          margin-bottom: 15px;
        }

        .security-cards {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 13px;
        }

        .security-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          min-width: 0;
          padding: 17px;
          text-align: left;
          text-decoration: none;
          color: inherit;
          cursor: pointer;
          transition: border-color 0.15s, transform 0.15s;
        }

        .security-card:hover {
          border-color: #bfdbfe;
          transform: translateY(-1px);
        }

        .security-card-icon {
          background: #eff6ff;
          color: #315fea;
        }

        .security-card-copy {
          flex: 1;
          min-width: 0;
        }

        .security-card-copy strong,
        .security-card-copy small {
          display: block;
        }

        .security-card-copy strong {
          font-size: 12px;
        }

        .security-card-copy small {
          margin-top: 7px;
          color: #64748b;
          font-size: 10px;
          line-height: 1.6;
        }

        .security-card-arrow {
          flex-shrink: 0;
          margin-top: 2px;
          color: #94a3b8;
        }

        .data-protection-card {
          font: inherit;
        }

        .principles-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 13px;
          margin-bottom: 20px;
        }

        .principle-card {
          padding: 17px;
        }

        .principle-icon {
          margin-bottom: 12px;
          background: #eff6ff;
          color: #315fea;
        }

        .principle-card strong {
          display: block;
          font-size: 12px;
        }

        .principle-card p {
          margin: 7px 0 0;
          color: #64748b;
          font-size: 11px;
          line-height: 1.65;
        }

        .policies-panel {
          padding: 0;
          overflow: hidden;
        }

        .policy-panel-heading {
          align-items: center;
          padding: 20px;
        }

        .policy-filters {
          padding: 0 20px;
        }

        .table-wrap {
          width: 100%;
          overflow-x: auto;
          border-top: 1px solid #edf1f6;
        }

        .policy-table {
          width: 100%;
          min-width: 900px;
          border-collapse: collapse;
          text-align: left;
          font-size: 11px;
        }

        .policy-table th {
          padding: 13px 15px;
          background: #f8fafc;
          color: #64748b;
          font-size: 10px;
          font-weight: 750;
          white-space: nowrap;
        }

        .policy-table td {
          padding: 15px;
          border-top: 1px solid #edf1f6;
          color: #475569;
          vertical-align: middle;
        }

        .policy-name-button {
          display: block;
          padding: 0;
          border: 0;
          background: transparent;
          text-align: left;
          cursor: pointer;
        }

        .policy-name {
          display: block;
          color: #172033;
          font-size: 11px;
          font-weight: 750;
        }

        .policy-name-button:hover .policy-name {
          color: #315fea;
        }

        .policy-id,
        .policy-category {
          display: block;
          margin-top: 5px;
          color: #94a3b8;
          font-size: 10px;
        }

        .policy-category {
          color: #64748b;
        }

        .policy-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 8px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .status-enabled {
          background: #f0fdf4;
          color: #15803d;
        }

        .status-disabled {
          background: #f1f5f9;
          color: #64748b;
        }

        .status-review {
          background: #fff7ed;
          color: #b45309;
        }

        .table-actions {
          flex-wrap: nowrap;
          gap: 3px;
        }

        .icon-button {
          display: inline-grid;
          flex-shrink: 0;
          width: 31px;
          height: 31px;
          place-items: center;
          border: 1px solid transparent;
          border-radius: 8px;
          background: transparent;
          color: #64748b;
          cursor: pointer;
        }

        .icon-button:hover {
          border-color: #dbeafe;
          background: #eff6ff;
          color: #315fea;
        }

        .table-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          padding: 13px 20px;
          border-top: 1px solid #edf1f6;
          color: #64748b;
          font-size: 11px;
        }

        .text-button {
          border: 0;
          background: transparent;
          color: #315fea;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .empty-state {
          padding: 35px 16px;
          color: #64748b;
          text-align: center;
          font-size: 12px;
        }

        .page-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 28px;
          padding: 17px 0;
          border-top: 1px solid #e5eaf1;
          color: #94a3b8;
          font-size: 11px;
        }

        .footer-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          justify-content: flex-end;
          background: rgba(15, 23, 42, 0.42);
        }

        .drawer {
          width: 100%;
          max-width: 440px;
          height: 100%;
          overflow-y: auto;
          padding: 26px;
          background: #fff;
          box-shadow: -15px 0 45px rgba(15, 23, 42, 0.12);
        }

        .drawer-header {
          padding-bottom: 20px;
          border-bottom: 1px solid #edf1f6;
        }

        .drawer-header h2 {
          margin: 0;
          font-size: 21px;
          line-height: 1.4;
          letter-spacing: -0.5px;
        }

        .drawer-subtitle {
          margin: 7px 0 0;
          color: #64748b;
          font-size: 11px;
        }

        .detail-list {
          margin-top: 23px;
        }

        .detail-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          padding: 13px 0;
          border-bottom: 1px solid #edf1f6;
          font-size: 12px;
        }

        .detail-row span:first-child {
          color: #64748b;
        }

        .detail-row span:last-child {
          color: #172033;
          font-weight: 700;
          text-align: right;
        }

        .warning-box,
        .policy-description-box {
          margin-top: 22px;
          padding: 14px;
          border: 1px solid #fde68a;
          border-radius: 10px;
          background: #fffbeb;
          color: #92400e;
          font-size: 11px;
          line-height: 1.7;
        }

        .policy-description-box {
          border-color: #dbeafe;
          background: #eff6ff;
          color: #1e40af;
        }

        .policy-description-box h3 {
          margin: 0 0 6px;
          font-size: 12px;
        }

        .policy-description-box p {
          margin: 0;
        }

        .drawer-section-title {
          margin: 25px 0 12px;
          font-size: 13px;
          font-weight: 750;
        }

        .drawer-done {
          margin-top: 24px;
        }

        .modal-overlay {
          align-items: center;
          justify-content: center;
          padding: 18px;
          overflow-y: auto;
        }

        .policy-modal,
        .confirm-modal {
          width: 100%;
          max-width: 650px;
          max-height: calc(100vh - 36px);
          overflow-y: auto;
          border: 1px solid #e5eaf1;
          border-radius: 16px;
          background: #fff;
          padding: 24px;
          box-shadow: 0 25px 70px rgba(15, 23, 42, 0.2);
        }

        .policy-form {
          display: grid;
          gap: 16px;
          margin-top: 20px;
        }

        .policy-form label {
          display: grid;
          gap: 7px;
          color: #334155;
          font-size: 11px;
          font-weight: 700;
        }

        .policy-form input,
        .policy-form select,
        .policy-form textarea {
          width: 100%;
          box-sizing: border-box;
          font-weight: 400;
        }

        .policy-form textarea {
          resize: vertical;
          min-height: 95px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .form-actions {
          justify-content: flex-end;
          padding-top: 6px;
        }

        .confirm-modal {
          max-width: 410px;
          text-align: center;
          margin: auto;
        }

        .confirm-icon {
          display: inline-grid;
          width: 48px;
          height: 48px;
          place-items: center;
          border-radius: 14px;
          background: #fff7ed;
          color: #c2410c;
        }

        .confirm-modal h2 {
          margin: 16px 0 8px;
          font-size: 18px;
        }

        .confirm-modal p {
          color: #64748b;
          font-size: 12px;
          line-height: 1.7;
        }

        .confirm-modal .form-actions {
          justify-content: center;
          margin-top: 18px;
        }

        @media (max-width: 1050px) {
          .metrics-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .overview-grid {
            grid-template-columns: 1fr;
          }

          .security-cards {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .principles-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 650px) {
          .security-page {
            padding: 16px;
          }

          .page-header h1 {
            font-size: 25px;
          }

          .header-actions {
            width: 100%;
          }

          .metrics-grid,
          .security-cards,
          .principles-grid,
          .form-grid {
            grid-template-columns: 1fr;
          }

          .policy-panel-heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .policy-filters {
            flex-direction: column;
            align-items: stretch;
          }

          .policy-filters .search-box,
          .policy-filters select {
            width: 100%;
            box-sizing: border-box;
          }

          .last-refreshed {
            width: 100%;
            margin-left: 26px;
          }

          .drawer {
            padding: 20px;
          }

          .alert-item {
            align-items: flex-start;
          }

          .alert-status {
            white-space: normal;
          }

          .page-footer {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>
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
    <div className="detail-row">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
