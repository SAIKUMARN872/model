
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Eye,
  FileCheck2,
  FileText,
  LockKeyhole,
  MoreHorizontal,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  X,
} from "lucide-react";

type ComplianceStatus =
  | "Compliant"
  | "In progress"
  | "Needs review"
  | "Non-compliant";

type RiskLevel = "Low" | "Medium" | "High" | "Critical";

type Framework = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  coverage: number;
  controls: number;
  completed: number;
  status: ComplianceStatus;
  owner: string;
  nextReview: string;
  color: string;
  background: string;
};

type Control = {
  id: string;
  title: string;
  framework: string;
  category: string;
  owner: string;
  status: ComplianceStatus;
  risk: RiskLevel;
  lastReviewed: string;
  dueDate: string;
  evidence: number;
  description: string;
};

type Evidence = {
  id: string;
  name: string;
  type: string;
  framework: string;
  owner: string;
  updated: string;
  status: "Verified" | "Pending verification" | "Expired";
};

const statusOptions: ComplianceStatus[] = [
  "Compliant",
  "In progress",
  "Needs review",
  "Non-compliant",
];

const initialFrameworks: Framework[] = [
  {
    id: "FW-001",
    name: "SOC 2",
    shortName: "SOC 2",
    description:
      "Security, availability, confidentiality, and processing integrity.",
    coverage: 92,
    controls: 25,
    completed: 23,
    status: "Compliant",
    owner: "Security Team",
    nextReview: "Dec 15, 2026",
    color: "#315fea",
    background: "#eff6ff",
  },
  {
    id: "FW-002",
    name: "ISO 27001",
    shortName: "ISO",
    description: "Information security management and risk treatment.",
    coverage: 84,
    controls: 32,
    completed: 27,
    status: "In progress",
    owner: "Compliance Team",
    nextReview: "Dec 20, 2026",
    color: "#7c3aed",
    background: "#f5f3ff",
  },
  {
    id: "FW-003",
    name: "GDPR",
    shortName: "GDPR",
    description: "Personal data protection, privacy, and data subject rights.",
    coverage: 88,
    controls: 17,
    completed: 15,
    status: "Needs review",
    owner: "Privacy Team",
    nextReview: "Nov 20, 2026",
    color: "#0f766e",
    background: "#f0fdfa",
  },
  {
    id: "FW-004",
    name: "HIPAA",
    shortName: "HIPAA",
    description: "Safeguards for protected health information.",
    coverage: 68,
    controls: 19,
    completed: 13,
    status: "In progress",
    owner: "Platform Security",
    nextReview: "Nov 28, 2026",
    color: "#c2410c",
    background: "#fff7ed",
  },
];

const initialControls: Control[] = [
  {
    id: "CTL-1001",
    title: "Multi-factor authentication",
    framework: "SOC 2",
    category: "Identity and access",
    owner: "Platform Security",
    status: "Compliant",
    risk: "High",
    lastReviewed: "Oct 28, 2026",
    dueDate: "Dec 15, 2026",
    evidence: 4,
    description:
      "Ensure privileged and administrative accounts use multi-factor authentication.",
  },
  {
    id: "CTL-1002",
    title: "Encryption at rest",
    framework: "SOC 2",
    category: "Data protection",
    owner: "Infrastructure Team",
    status: "Compliant",
    risk: "Critical",
    lastReviewed: "Oct 26, 2026",
    dueDate: "Dec 10, 2026",
    evidence: 3,
    description:
      "Verify that supported data stores encrypt sensitive information at rest.",
  },
  {
    id: "CTL-1003",
    title: "Data retention policy",
    framework: "GDPR",
    category: "Privacy",
    owner: "Privacy Team",
    status: "Needs review",
    risk: "High",
    lastReviewed: "Oct 10, 2026",
    dueDate: "Nov 20, 2026",
    evidence: 2,
    description:
      "Review retention periods and deletion procedures for personal data.",
  },
  {
    id: "CTL-1004",
    title: "Incident response procedure",
    framework: "ISO 27001",
    category: "Incident management",
    owner: "Security Team",
    status: "In progress",
    risk: "High",
    lastReviewed: "Oct 21, 2026",
    dueDate: "Nov 18, 2026",
    evidence: 2,
    description:
      "Maintain documented incident response steps, escalation paths, and review records.",
  },
  {
    id: "CTL-1005",
    title: "Vendor security assessments",
    framework: "SOC 2",
    category: "Third-party risk",
    owner: "Compliance Team",
    status: "Non-compliant",
    risk: "Critical",
    lastReviewed: "Sep 29, 2026",
    dueDate: "Nov 12, 2026",
    evidence: 0,
    description:
      "Collect and review security assessments for in-scope third-party vendors.",
  },
  {
    id: "CTL-1006",
    title: "Access review and certification",
    framework: "ISO 27001",
    category: "Identity and access",
    owner: "Platform Security",
    status: "Compliant",
    risk: "Medium",
    lastReviewed: "Oct 29, 2026",
    dueDate: "Dec 18, 2026",
    evidence: 5,
    description:
      "Review user access regularly and document approvals for privileged permissions.",
  },
  {
    id: "CTL-1007",
    title: "Privacy request handling",
    framework: "GDPR",
    category: "Privacy",
    owner: "Privacy Team",
    status: "In progress",
    risk: "Medium",
    lastReviewed: "Oct 18, 2026",
    dueDate: "Nov 25, 2026",
    evidence: 1,
    description:
      "Document processes for handling data access, correction, and deletion requests.",
  },
  {
    id: "CTL-1008",
    title: "Audit logging and monitoring",
    framework: "SOC 2",
    category: "Monitoring",
    owner: "Infrastructure Team",
    status: "Needs review",
    risk: "High",
    lastReviewed: "Oct 12, 2026",
    dueDate: "Nov 16, 2026",
    evidence: 2,
    description:
      "Review security logs, alerting coverage, and retention of audit records.",
  },
];

const initialEvidence: Evidence[] = [
  {
    id: "EVD-2001",
    name: "MFA configuration review",
    type: "Configuration record",
    framework: "SOC 2",
    owner: "Platform Security",
    updated: "Oct 28, 2026",
    status: "Verified",
  },
  {
    id: "EVD-2002",
    name: "Encryption settings report",
    type: "Technical report",
    framework: "SOC 2",
    owner: "Infrastructure Team",
    updated: "Oct 26, 2026",
    status: "Verified",
  },
  {
    id: "EVD-2003",
    name: "Data retention policy",
    type: "Policy document",
    framework: "GDPR",
    owner: "Privacy Team",
    updated: "Oct 10, 2026",
    status: "Pending verification",
  },
  {
    id: "EVD-2004",
    name: "Vendor assessment records",
    type: "Assessment",
    framework: "SOC 2",
    owner: "Compliance Team",
    updated: "Sep 29, 2026",
    status: "Expired",
  },
  {
    id: "EVD-2005",
    name: "Access certification report",
    type: "Audit report",
    framework: "ISO 27001",
    owner: "Platform Security",
    updated: "Oct 29, 2026",
    status: "Verified",
  },
];

const initialDraft = {
  title: "",
  framework: "SOC 2",
  category: "Data protection",
  owner: "",
  risk: "Medium" as RiskLevel,
  dueDate: "",
  description: "",
};

const categories = [
  "Data protection",
  "Identity and access",
  "Privacy",
  "Incident management",
  "Third-party risk",
  "Monitoring",
  "Business continuity",
];

export default function CompliancePage() {
  const [frameworks, setFrameworks] = useState(initialFrameworks);
  const [controls, setControls] = useState(initialControls);
  const [evidence, setEvidence] = useState(initialEvidence);

  const [activeTab, setActiveTab] = useState<
    "Overview" | "Controls" | "Evidence"
  >("Overview");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [frameworkFilter, setFrameworkFilter] = useState("All frameworks");

  const [selectedControl, setSelectedControl] = useState<Control | null>(null);
  const [selectedFramework, setSelectedFramework] =
    useState<Framework | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(
    null
  );

  const [menuId, setMenuId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");
  const [draft, setDraft] = useState(initialDraft);

  const compliantCount = controls.filter(
    (item) => item.status === "Compliant"
  ).length;

  const reviewCount = controls.filter(
    (item) => item.status === "Needs review"
  ).length;

  const nonCompliantCount = controls.filter(
    (item) => item.status === "Non-compliant"
  ).length;

  const pendingEvidence = evidence.filter(
    (item) => item.status === "Pending verification"
  ).length;

  const verifiedEvidence = evidence.filter(
    (item) => item.status === "Verified"
  ).length;

  const filteredControls = useMemo(() => {
    const query = search.trim().toLowerCase();

    return controls.filter((item) => {
      const matchesSearch =
        !query ||
        item.id.toLowerCase().includes(query) ||
        item.title.toLowerCase().includes(query) ||
        item.owner.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      return (
        matchesSearch &&
        (statusFilter === "All statuses" || item.status === statusFilter) &&
        (frameworkFilter === "All frameworks" ||
          item.framework === frameworkFilter)
      );
    });
  }, [controls, search, statusFilter, frameworkFilter]);

  const filteredEvidence = useMemo(() => {
    const query = search.trim().toLowerCase();

    return evidence.filter((item) => {
      const matchesSearch =
        !query ||
        item.id.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query) ||
        item.owner.toLowerCase().includes(query);

      return (
        matchesSearch &&
        (frameworkFilter === "All frameworks" ||
          item.framework === frameworkFilter)
      );
    });
  }, [evidence, search, frameworkFilter]);

  function showNotice(message: string) {
    setNotice(message);
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("All statuses");
    setFrameworkFilter("All frameworks");
  }

  function exportCsv() {
    const rows = [
      [
        "Control ID",
        "Control",
        "Framework",
        "Category",
        "Owner",
        "Status",
        "Risk",
        "Last reviewed",
        "Due date",
        "Evidence count",
      ],
      ...filteredControls.map((item) => [
        item.id,
        item.title,
        item.framework,
        item.category,
        item.owner,
        item.status,
        item.risk,
        item.lastReviewed,
        item.dueDate,
        String(item.evidence),
      ]),
    ];

    const csv = rows
      .map((row) =>
        row.map((value) => `"${value.replace(/"/g, '""')}"`).join(",")
      )
      .join("\r\n");

    const url = URL.createObjectURL(
      new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-compliance-controls.csv";
    link.click();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    showNotice("Filtered compliance controls exported to CSV.");
  }

  function openCreateControl() {
    setDraft({ ...initialDraft });
    setFormError("");
    setFormOpen(true);
  }

  function createControl() {
    if (!draft.title.trim() || !draft.owner.trim() || !draft.dueDate) {
      setFormError("Enter the control name, owner, and due date.");
      return;
    }

    const duplicate = controls.some(
      (item) =>
        item.title.toLowerCase() === draft.title.trim().toLowerCase()
    );

    if (duplicate) {
      setFormError("A control with this name already exists.");
      return;
    }

    const [year, month, day] = draft.dueDate.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    const formattedDueDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });

    const newControl: Control = {
      id: `CTL-${String(controls.length + 1001).padStart(4, "0")}`,
      title: draft.title.trim(),
      framework: draft.framework,
      category: draft.category,
      owner: draft.owner.trim(),
      status: "In progress",
      risk: draft.risk,
      lastReviewed: "Not reviewed",
      dueDate: formattedDueDate,
      evidence: 0,
      description: draft.description.trim() || "No description provided.",
    };

    setControls((current) => [newControl, ...current]);
    setFormOpen(false);
    setActiveTab("Controls");
    clearFilters();
    showNotice("Control added to the local demo state.");
  }

  function updateControlStatus(
    control: Control,
    status: ComplianceStatus
  ) {
    setControls((current) =>
      current.map((item) =>
        item.id === control.id ? { ...item, status } : item
      )
    );

    setSelectedControl((current) =>
      current?.id === control.id ? { ...current, status } : current
    );

    setMenuId(null);
    showNotice(`${control.title} marked ${status.toLowerCase()}.`);
  }

  function verifyEvidence(item: Evidence) {
    setEvidence((current) =>
      current.map((record) =>
        record.id === item.id
          ? { ...record, status: "Verified" }
          : record
      )
    );

    setSelectedEvidence((current) =>
      current?.id === item.id ? { ...current, status: "Verified" } : current
    );

    showNotice(`${item.name} marked verified in local demo state.`);
  }

  function closeDetails() {
    setSelectedControl(null);
    setSelectedFramework(null);
    setSelectedEvidence(null);
  }

  const metrics = [
    {
      title: "Overall compliance",
      value: `${Math.round(
        controls.length ? (compliantCount / controls.length) * 100 : 0
      )}%`,
      detail: `${compliantCount} of ${controls.length} controls marked compliant`,
      icon: ShieldCheck,
      color: "#15803d",
      background: "#f0fdf4",
    },
    {
      title: "Controls tracked",
      value: String(controls.length),
      detail: `${frameworks.length} frameworks configured`,
      icon: ClipboardCheck,
      color: "#315fea",
      background: "#eff6ff",
    },
    {
      title: "Needs review",
      value: String(reviewCount),
      detail: "Controls awaiting review",
      icon: Clock3,
      color: "#c2410c",
      background: "#fff7ed",
    },
    {
      title: "Evidence pending",
      value: String(pendingEvidence),
      detail: `${nonCompliantCount} non-compliant control(s)`,
      icon: FileCheck2,
      color: "#7c3aed",
      background: "#f5f3ff",
    },
  ];

  const detailsOpen =
    selectedControl !== null ||
    selectedFramework !== null ||
    selectedEvidence !== null;

  return (
    <main className="compliance-page">
      <div className="compliance-container">
        <header className="page-header">
          <div className="page-heading">
            <div className="eyebrow">
              <ShieldCheck size={17} />
              <span>MODELNOW ADMIN</span>
              <span className="slash">/</span>
              <span>GOVERNANCE</span>
              <span className="slash">/</span>
              <span>COMPLIANCE</span>
            </div>

            <h1>Compliance</h1>

            <p className="page-description">
              Monitor compliance frameworks, track control effectiveness, and
              manage evidence across your ModelNow workspace.
            </p>
          </div>

          <div className="header-actions">
            <button className="button button-secondary" onClick={exportCsv}>
              <ArrowDownToLine size={16} />
              Export CSV
            </button>

            <button className="button button-primary" onClick={openCreateControl}>
              <Plus size={17} />
              Add control
            </button>
          </div>
        </header>

        <section className="notice-banner">
          <LockKeyhole size={20} />
          <div>
            <h2>Compliance workspace overview</h2>
            <p>
              This is a frontend prototype with illustrative records.
              Compliance percentages, control statuses, and evidence
              verification are not certifications or proof of regulatory
              compliance. Connect validated backend data before using this
              page for audit decisions.
            </p>
          </div>
        </section>

        {notice && (
          <div className="toast" role="status">
            <CheckCircle2 size={18} />
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

        <section className="metrics-grid">
          {metrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <article className="metric-card" key={metric.title}>
                <div className="metric-top">
                  <p className="metric-title">{metric.title}</p>
                  <div
                    className="metric-icon"
                    style={{
                      backgroundColor: metric.background,
                      color: metric.color,
                    }}
                  >
                    <Icon size={22} />
                  </div>
                </div>

                <p className="metric-value">{metric.value}</p>
                <p className="metric-detail">{metric.detail}</p>
              </article>
            );
          })}
        </section>

        <section className="framework-section">
          <div className="section-heading">
            <div>
              <h2>Compliance frameworks</h2>
              <p>
                Track coverage and upcoming review dates for each framework.
              </p>
            </div>
            <span className="count-pill">
              {frameworks.length} frameworks
            </span>
          </div>

          <div className="framework-grid">
            {frameworks.map((framework) => (
              <button
                key={framework.id}
                className="framework-card"
                onClick={() => setSelectedFramework(framework)}
              >
                <div className="framework-top">
                  <div className="framework-identity">
                    <span
                      className="framework-mark"
                      style={{
                        backgroundColor: framework.background,
                        color: framework.color,
                      }}
                    >
                      {framework.shortName}
                    </span>
                    <span className="framework-name-wrap">
                      <strong>{framework.name}</strong>
                      <span className="framework-description">
                        {framework.description}
                      </span>
                    </span>
                  </div>
                  <StatusBadge status={framework.status} />
                </div>

                <div className="coverage-row">
                  <div>
                    <span className="muted-label">Control coverage</span>
                    <strong className="coverage-number">
                      {framework.coverage}%
                    </strong>
                  </div>
                  <span className="coverage-count">
                    <strong>{framework.completed}</strong> /{" "}
                    {framework.controls} controls
                  </span>
                </div>

                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${framework.coverage}%`,
                      backgroundColor: framework.color,
                    }}
                  />
                </div>

                <div className="framework-footer">
                  <span>
                    <CalendarDays size={14} />
                    Next review: {framework.nextReview}
                  </span>
                  <span className="view-link">
                    View framework <ArrowRight size={14} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="operations-card">
          <div className="operations-header">
            <div>
              <h2>Compliance operations</h2>
              <p>Review control status and supporting evidence.</p>
            </div>

            <div className="tabs">
              {(["Overview", "Controls", "Evidence"] as const).map((tab) => (
                <button
                  key={tab}
                  className={`tab ${activeTab === tab ? "tab-active" : ""}`}
                  onClick={() => {
                    setActiveTab(tab);
                    setMenuId(null);
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="filters">
            <div className="search-wrap">
              <Search size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={
                  activeTab === "Evidence"
                    ? "Search evidence..."
                    : "Search controls, owner, category..."
                }
                aria-label="Search compliance records"
              />
            </div>

            {activeTab !== "Evidence" && (
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter by status"
              >
                <option>All statuses</option>
                {statusOptions.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            )}

            <select
              value={frameworkFilter}
              onChange={(event) => setFrameworkFilter(event.target.value)}
              aria-label="Filter by framework"
            >
              <option>All frameworks</option>
              {frameworks.map((framework) => (
                <option key={framework.id}>{framework.name}</option>
              ))}
            </select>
          </div>

          {activeTab === "Overview" && (
            <div className="overview-grid">
              <article className="overview-tile">
                <div className="overview-tile-heading">
                  <span>Control health</span>
                  <Activity size={18} className="green-icon" />
                </div>
                <strong className="overview-number">{compliantCount}</strong>
                <p>Controls marked compliant</p>
                <div className="progress-track">
                  <div
                    className="progress-fill green-fill"
                    style={{
                      width: `${
                        controls.length
                          ? (compliantCount / controls.length) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </article>

              <article className="overview-tile">
                <div className="overview-tile-heading">
                  <span>Attention required</span>
                  <AlertTriangle size={18} className="orange-icon" />
                </div>
                <strong className="overview-number">
                  {reviewCount + nonCompliantCount}
                </strong>
                <p>Review or remediation needed</p>
                <div className="inline-pills">
                  <span className="mini-pill amber-pill">
                    {reviewCount} to review
                  </span>
                  <span className="mini-pill red-pill">
                    {nonCompliantCount} non-compliant
                  </span>
                </div>
              </article>

              <article className="overview-tile">
                <div className="overview-tile-heading">
                  <span>Evidence readiness</span>
                  <FileCheck2 size={18} className="blue-icon" />
                </div>
                <strong className="overview-number">{verifiedEvidence}</strong>
                <p>Evidence records marked verified</p>
                <button
                  className="text-button"
                  onClick={() => setActiveTab("Evidence")}
                >
                  Review evidence <ArrowRight size={14} />
                </button>
              </article>
            </div>
          )}

          {activeTab !== "Evidence" && (
            <div className="table-scroll">
              <table className="data-table controls-table">
                <thead>
                  <tr>
                    <th>Control</th>
                    <th>Framework</th>
                    <th>Owner</th>
                    <th>Risk</th>
                    <th>Status</th>
                    <th>Due date</th>
                    <th>Evidence</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {filteredControls.map((control) => (
                    <tr key={control.id}>
                      <td>
                        <button
                          className="record-link"
                          onClick={() => setSelectedControl(control)}
                        >
                          <strong>{control.title}</strong>
                          <span>
                            {control.id} · {control.category}
                          </span>
                        </button>
                      </td>
                      <td>{control.framework}</td>
                      <td>{control.owner}</td>
                      <td>
                        <RiskBadge risk={control.risk} />
                      </td>
                      <td>
                        <StatusBadge status={control.status} />
                      </td>
                      <td>{control.dueDate}</td>
                      <td>
                        <span
                          className={`evidence-count ${
                            control.evidence === 0 ? "evidence-empty" : ""
                          }`}
                        >
                          {control.evidence} files
                        </span>
                      </td>
                      <td className="action-cell">
                        <button
                          className="icon-button"
                          aria-label={`Actions for ${control.title}`}
                          onClick={() =>
                            setMenuId(
                              menuId === control.id ? null : control.id
                            )
                          }
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {menuId === control.id && (
                          <div className="action-menu">
                            <button
                              onClick={() => {
                                setSelectedControl(control);
                                setMenuId(null);
                              }}
                            >
                              View details
                            </button>
                            {statusOptions.map((status) => (
                              <button
                                key={status}
                                onClick={() =>
                                  updateControlStatus(control, status)
                                }
                              >
                                Mark {status.toLowerCase()}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredControls.length === 0 && (
                    <tr>
                      <td colSpan={8} className="empty-state">
                        No controls match your search or filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "Evidence" && (
            <div className="table-scroll">
              <table className="data-table evidence-table">
                <thead>
                  <tr>
                    <th>Evidence</th>
                    <th>Framework</th>
                    <th>Owner</th>
                    <th>Last updated</th>
                    <th>Status</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {filteredEvidence.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <button
                          className="evidence-record"
                          onClick={() => setSelectedEvidence(item)}
                        >
                          <span className="document-icon">
                            <FileText size={19} />
                          </span>
                          <span>
                            <strong>{item.name}</strong>
                            <small>
                              {item.id} · {item.type}
                            </small>
                          </span>
                        </button>
                      </td>
                      <td>{item.framework}</td>
                      <td>{item.owner}</td>
                      <td>{item.updated}</td>
                      <td>
                        <EvidenceBadge status={item.status} />
                      </td>
                      <td>
                        <button
                          className="icon-button"
                          aria-label={`View ${item.name}`}
                          onClick={() => setSelectedEvidence(item)}
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredEvidence.length === 0 && (
                    <tr>
                      <td colSpan={6} className="empty-state">
                        No evidence records match your search or filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="table-footer">
            <span>Illustrative data · Changes remain in local page state</span>
            <button className="text-button" onClick={clearFilters}>
              Clear search and filters
            </button>
          </div>
        </section>

        <section className="info-grid">
          <InfoCard
            icon={Shield}
            title="Map your controls"
            description="Assign each control to a framework, owner, and review date. Keep requirements traceable to documented evidence."
          />
          <InfoCard
            icon={FileCheck2}
            title="Maintain evidence"
            description="Review evidence freshness, verification status, and ownership before an audit or compliance review."
          />
          <InfoCard
            icon={CalendarDays}
            title="Plan reviews"
            description="Schedule recurring reviews and track remediation deadlines for controls that need attention."
          />
        </section>

        <footer className="page-footer">
          <span>ModelNow Compliance · Admin prototype</span>
          <span>
            {controls.length} controls · {evidence.length} evidence records
          </span>
        </footer>
      </div>

      {detailsOpen && (
        <div className="overlay" onClick={closeDetails}>
          <aside
            className="details-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="drawer-header">
              <div>
                <p className="drawer-eyebrow">
                  {selectedControl
                    ? "CONTROL DETAILS"
                    : selectedFramework
                      ? "FRAMEWORK DETAILS"
                      : "EVIDENCE DETAILS"}
                </p>
                <h2>
                  {selectedControl?.title ||
                    selectedFramework?.name ||
                    selectedEvidence?.name}
                </h2>
                <p className="drawer-id">
                  {selectedControl?.id ||
                    selectedFramework?.id ||
                    selectedEvidence?.id}
                </p>
              </div>
              <button
                className="icon-button close-button"
                onClick={closeDetails}
                aria-label="Close details"
              >
                <X size={19} />
              </button>
            </div>

            {selectedControl && (
              <>
                <div className="drawer-badges">
                  <StatusBadge status={selectedControl.status} />
                  <RiskBadge risk={selectedControl.risk} />
                  <span className="neutral-badge">
                    {selectedControl.framework}
                  </span>
                </div>

                <p className="drawer-description">
                  {selectedControl.description}
                </p>

                <div className="detail-rows">
                  <DetailRow
                    label="Category"
                    value={selectedControl.category}
                  />
                  <DetailRow label="Owner" value={selectedControl.owner} />
                  <DetailRow
                    label="Last reviewed"
                    value={selectedControl.lastReviewed}
                  />
                  <DetailRow
                    label="Due date"
                    value={selectedControl.dueDate}
                  />
                  <DetailRow
                    label="Evidence files"
                    value={String(selectedControl.evidence)}
                  />
                </div>

                <h3 className="drawer-section-title">
                  Update control status
                </h3>
                <div className="status-actions">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      className={`status-action ${
                        selectedControl.status === status
                          ? "status-action-active"
                          : ""
                      }`}
                      onClick={() => updateControlStatus(selectedControl, status)}
                    >
                      {status}
                      {selectedControl.status === status && (
                        <Check size={17} />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}

            {selectedFramework && (
              <>
                <div className="drawer-badges">
                  <StatusBadge status={selectedFramework.status} />
                </div>
                <p className="drawer-description">
                  {selectedFramework.description}
                </p>

                <div className="drawer-coverage">
                  <div className="coverage-row">
                    <div>
                      <span className="muted-label">Control coverage</span>
                      <strong className="coverage-number">
                        {selectedFramework.coverage}%
                      </strong>
                    </div>
                    <span className="coverage-count">
                      {selectedFramework.completed} of{" "}
                      {selectedFramework.controls} complete
                    </span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${selectedFramework.coverage}%`,
                        backgroundColor: selectedFramework.color,
                      }}
                    />
                  </div>
                </div>

                <div className="detail-rows">
                  <DetailRow
                    label="Framework owner"
                    value={selectedFramework.owner}
                  />
                  <DetailRow
                    label="Total controls"
                    value={String(selectedFramework.controls)}
                  />
                  <DetailRow
                    label="Completed controls"
                    value={String(selectedFramework.completed)}
                  />
                  <DetailRow
                    label="Next review"
                    value={selectedFramework.nextReview}
                  />
                </div>

                <h3 className="drawer-section-title">
                  Controls in this framework
                </h3>
                <div className="framework-controls">
                  {controls
                    .filter(
                      (item) => item.framework === selectedFramework.name
                    )
                    .map((control) => (
                      <button
                        key={control.id}
                        onClick={() => {
                          setSelectedFramework(null);
                          setSelectedControl(control);
                        }}
                      >
                        <span>
                          <strong>{control.title}</strong>
                          <small>{control.id}</small>
                        </span>
                        <ArrowRight size={17} />
                      </button>
                    ))}
                </div>
              </>
            )}

            {selectedEvidence && (
              <>
                <div className="drawer-badges">
                  <EvidenceBadge status={selectedEvidence.status} />
                </div>
                <div className="detail-rows">
                  <DetailRow
                    label="Evidence type"
                    value={selectedEvidence.type}
                  />
                  <DetailRow
                    label="Framework"
                    value={selectedEvidence.framework}
                  />
                  <DetailRow label="Owner" value={selectedEvidence.owner} />
                  <DetailRow
                    label="Last updated"
                    value={selectedEvidence.updated}
                  />
                  <DetailRow
                    label="Verification"
                    value={selectedEvidence.status}
                  />
                </div>

                <div className="evidence-warning">
                  This demo record represents evidence metadata only. It does
                  not contain an actual uploaded document or prove that a
                  control has been independently audited.
                </div>

                {selectedEvidence.status !== "Verified" && (
                  <button
                    className="button button-primary drawer-primary-button"
                    onClick={() => verifyEvidence(selectedEvidence)}
                  >
                    <CheckCircle2 size={17} />
                    Mark verified (demo)
                  </button>
                )}
              </>
            )}
          </aside>
        </div>
      )}

      {formOpen && (
        <div
          className="overlay modal-overlay"
          onClick={() => setFormOpen(false)}
        >
          <section
            className="create-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="drawer-header">
              <div>
                <h2>Add compliance control</h2>
                <p className="modal-subtitle">
                  Create a control record in the local demo state.
                </p>
              </div>
              <button
                className="icon-button close-button"
                onClick={() => setFormOpen(false)}
                aria-label="Close form"
              >
                <X size={19} />
              </button>
            </div>

            <div className="form-grid">
              <label>
                Control name *
                <input
                  value={draft.title}
                  onChange={(event) =>
                    setDraft({ ...draft, title: event.target.value })
                  }
                  placeholder="e.g. Backup restoration testing"
                />
              </label>

              <label>
                Owner *
                <input
                  value={draft.owner}
                  onChange={(event) =>
                    setDraft({ ...draft, owner: event.target.value })
                  }
                  placeholder="Team or control owner"
                />
              </label>

              <label>
                Framework
                <select
                  value={draft.framework}
                  onChange={(event) =>
                    setDraft({ ...draft, framework: event.target.value })
                  }
                >
                  {frameworks.map((framework) => (
                    <option key={framework.id}>{framework.name}</option>
                  ))}
                </select>
              </label>

              <label>
                Category
                <select
                  value={draft.category}
                  onChange={(event) =>
                    setDraft({ ...draft, category: event.target.value })
                  }
                >
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>

              <label>
                Risk level
                <select
                  value={draft.risk}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      risk: event.target.value as RiskLevel,
                    })
                  }
                >
                  {(["Low", "Medium", "High", "Critical"] as const).map(
                    (risk) => (
                      <option key={risk}>{risk}</option>
                    )
                  )}
                </select>
              </label>

              <label>
                Due date *
                <input
                  type="date"
                  value={draft.dueDate}
                  onChange={(event) =>
                    setDraft({ ...draft, dueDate: event.target.value })
                  }
                />
              </label>
            </div>

            <label className="description-field">
              Description
              <textarea
                value={draft.description}
                onChange={(event) =>
                  setDraft({ ...draft, description: event.target.value })
                }
                placeholder="Describe what needs to be checked or documented..."
                rows={4}
              />
            </label>

            {formError && <p className="form-error">{formError}</p>}

            <div className="modal-actions">
              <button
                className="button button-secondary"
                onClick={() => setFormOpen(false)}
              >
                Cancel
              </button>
              <button
                className="button button-primary"
                onClick={createControl}
              >
                <Plus size={17} />
                Add control
              </button>
            </div>
          </section>
        </div>
      )}

      <style jsx>{`
        .compliance-page {
          min-height: 100vh;
          padding: 30px;
          color: #172033;
          background:
            radial-gradient(
              circle at 100% 0%,
              rgba(49, 95, 234, 0.07),
              transparent 30rem
            ),
            #f6f8fc;
          font-family:
            Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          font-size: 14px;
          line-height: 1.5;
        }

        .compliance-page * {
          box-sizing: border-box;
        }

        .compliance-container {
          max-width: 1600px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
          margin-bottom: 26px;
        }

        .page-heading {
          min-width: 0;
        }

        .eyebrow {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 7px;
          margin-bottom: 10px;
          color: #315fea;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .slash {
          color: #c5ccda;
        }

        .page-heading h1 {
          margin: 0;
          color: #151d30;
          font-size: clamp(28px, 3vw, 36px);
          font-weight: 800;
          letter-spacing: -1.3px;
          line-height: 1.2;
        }

        .page-description {
          max-width: 760px;
          margin: 10px 0 0;
          color: #647086;
          font-size: 14px;
          line-height: 1.8;
        }

        .header-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          flex-shrink: 0;
        }

        .button {
          display: inline-flex;
          min-height: 42px;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 15px;
          border: 1px solid transparent;
          border-radius: 10px;
          cursor: pointer;
          font: inherit;
          font-size: 13px;
          font-weight: 700;
          transition:
            background 160ms ease,
            border-color 160ms ease,
            transform 160ms ease;
        }

        .button:active {
          transform: translateY(1px);
        }

        .button-primary {
          border-color: #315fea;
          color: #fff;
          background: #315fea;
          box-shadow: 0 3px 8px rgba(49, 95, 234, 0.15);
        }

        .button-primary:hover {
          border-color: #234bce;
          background: #234bce;
        }

        .button-secondary {
          border-color: #dce2ec;
          color: #354158;
          background: #fff;
        }

        .button-secondary:hover {
          border-color: #b8c6df;
          background: #f8faff;
        }

        .notice-banner {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          margin-bottom: 22px;
          padding: 17px 19px;
          border: 1px solid #cddcff;
          border-radius: 14px;
          color: #1d428d;
          background: linear-gradient(120deg, #eff5ff, #f7f9ff);
        }

        .notice-banner > svg {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .notice-banner h2 {
          margin: 0;
          color: #18366e;
          font-size: 13px;
          font-weight: 800;
        }

        .notice-banner p {
          margin: 5px 0 0;
          color: #435d8e;
          font-size: 12px;
          line-height: 1.8;
        }

        .toast {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          padding: 12px 15px;
          border: 1px solid #b8e7cb;
          border-radius: 11px;
          color: #166534;
          background: #f0fdf4;
          font-size: 13px;
        }

        .toast > span {
          flex: 1;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 30px;
        }

        .metric-card {
          min-width: 0;
          padding: 21px;
          border: 1px solid #e4e8f0;
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 3px 12px rgba(26, 40, 75, 0.035);
          transition:
            transform 180ms ease,
            box-shadow 180ms ease;
        }

        .metric-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 9px 25px rgba(26, 40, 75, 0.07);
        }

        .metric-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .metric-title {
          margin: 4px 0 0;
          color: #667187;
          font-size: 12px;
          font-weight: 600;
        }

        .metric-icon {
          display: grid;
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 12px;
        }

        .metric-value {
          margin: 13px 0 0;
          color: #172033;
          font-size: 31px;
          font-weight: 800;
          letter-spacing: -1px;
          line-height: 1.2;
          font-variant-numeric: tabular-nums;
        }

        .metric-detail {
          margin: 10px 0 0;
          color: #8a94a6;
          font-size: 11px;
          line-height: 1.7;
        }

        .framework-section {
          margin-bottom: 30px;
        }

        .section-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 15px;
        }

        .section-heading h2,
        .operations-header h2 {
          margin: 0;
          color: #182136;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: -0.35px;
        }

        .section-heading p,
        .operations-header p {
          margin: 5px 0 0;
          color: #8791a3;
          font-size: 12px;
          line-height: 1.7;
        }

        .count-pill {
          flex-shrink: 0;
          padding: 7px 12px;
          border: 1px solid #e1e6ef;
          border-radius: 30px;
          color: #657087;
          background: #fff;
          font-size: 11px;
          font-weight: 700;
        }

        .framework-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .framework-card {
          display: block;
          width: 100%;
          min-width: 0;
          padding: 21px;
          border: 1px solid #e1e6ef;
          border-radius: 16px;
          color: inherit;
          background: #fff;
          box-shadow: 0 3px 12px rgba(26, 40, 75, 0.025);
          cursor: pointer;
          text-align: left;
          transition:
            border-color 160ms ease,
            box-shadow 160ms ease,
            transform 160ms ease;
        }

        .framework-card:hover {
          transform: translateY(-2px);
          border-color: #b9ccff;
          box-shadow: 0 10px 25px rgba(26, 40, 75, 0.07);
        }

        .framework-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 13px;
        }

        .framework-identity {
          display: flex;
          min-width: 0;
          align-items: flex-start;
          gap: 12px;
        }

        .framework-mark {
          display: grid;
          min-width: 48px;
          height: 48px;
          flex-shrink: 0;
          place-items: center;
          padding: 5px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 800;
        }

        .framework-name-wrap {
          display: block;
          min-width: 0;
        }

        .framework-name-wrap > strong {
          display: block;
          color: #202a3e;
          font-size: 14px;
          font-weight: 800;
        }

        .framework-description {
          display: block;
          margin-top: 5px;
          color: #8791a3;
          font-size: 11px;
          line-height: 1.7;
        }

        .status-badge {
          display: inline-flex;
          flex-shrink: 0;
          align-items: center;
          gap: 6px;
          padding: 5px 9px;
          border: 1px solid transparent;
          border-radius: 30px;
          font-size: 10px;
          font-weight: 800;
          line-height: 1.5;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          flex-shrink: 0;
          border-radius: 50%;
          background: currentColor;
        }

        .status-compliant {
          border-color: #bbebce;
          color: #15803d;
          background: #f0fdf4;
        }

        .status-progress {
          border-color: #c9d9ff;
          color: #2855d9;
          background: #eff6ff;
        }

        .status-review {
          border-color: #fde0a8;
          color: #a85c08;
          background: #fffbeb;
        }

        .status-noncompliant {
          border-color: #fecaca;
          color: #b91c1c;
          background: #fef2f2;
        }

        .coverage-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 12px;
          margin-top: 24px;
        }

        .muted-label {
          display: block;
          color: #8490a3;
          font-size: 11px;
        }

        .coverage-number {
          display: block;
          margin-top: 3px;
          color: #1d263a;
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.7px;
        }

        .coverage-count {
          padding-bottom: 5px;
          color: #8a94a6;
          font-size: 11px;
        }

        .coverage-count strong {
          color: #364158;
        }

        .progress-track {
          height: 7px;
          overflow: hidden;
          margin-top: 12px;
          border-radius: 20px;
          background: #edf0f6;
        }

        .progress-fill {
          height: 100%;
          border-radius: inherit;
          transition: width 220ms ease;
        }

        .framework-footer {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 18px;
          padding-top: 15px;
          border-top: 1px solid #eef1f6;
          color: #8a94a6;
          font-size: 10px;
        }

        .framework-footer > span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .view-link,
        .text-button {
          color: #315fea;
          font-weight: 800;
        }

        .operations-card {
          position: relative;
          margin-bottom: 24px;
          overflow: visible;
          border: 1px solid #e1e6ef;
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 3px 15px rgba(26, 40, 75, 0.035);
        }

        .operations-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 21px;
          border-bottom: 1px solid #edf0f5;
        }

        .tabs {
          display: inline-flex;
          flex-shrink: 0;
          gap: 3px;
          padding: 4px;
          border-radius: 11px;
          background: #f1f3f8;
        }

        .tab {
          padding: 9px 13px;
          border: 0;
          border-radius: 8px;
          color: #7b8598;
          background: transparent;
          cursor: pointer;
          font: inherit;
          font-size: 11px;
          font-weight: 700;
        }

        .tab:hover {
          color: #354158;
        }

        .tab-active {
          color: #315fea;
          background: #fff;
          box-shadow: 0 2px 5px rgba(26, 40, 75, 0.09);
        }

        .filters {
          display: grid;
          grid-template-columns: minmax(180px, 2fr) minmax(145px, 1fr) minmax(
              145px,
              1fr
            );
          gap: 11px;
          padding: 16px 20px;
          border-bottom: 1px solid #edf0f5;
        }

        .search-wrap {
          display: flex;
          min-width: 0;
          align-items: center;
          gap: 9px;
          padding: 0 12px;
          border: 1px solid #dfe4ed;
          border-radius: 9px;
          color: #9aa4b5;
          background: #fff;
        }

        .search-wrap:focus-within {
          border-color: #7597ff;
          box-shadow: 0 0 0 3px #edf2ff;
        }

        .search-wrap input {
          width: 100%;
          min-width: 0;
          height: 40px;
          border: 0;
          outline: 0;
          color: #253047;
          background: transparent;
          font: inherit;
          font-size: 11px;
        }

        .search-wrap input::placeholder {
          color: #a1aabb;
        }

        .filters select,
        .form-grid select,
        .form-grid input,
        .description-field textarea {
          width: 100%;
          min-width: 0;
          min-height: 42px;
          padding: 10px 12px;
          border: 1px solid #dfe4ed;
          border-radius: 9px;
          outline: none;
          color: #354158;
          background: #fff;
          font: inherit;
          font-size: 11px;
        }

        .filters select:focus,
        .form-grid select:focus,
        .form-grid input:focus,
        .description-field textarea:focus {
          border-color: #7597ff;
          box-shadow: 0 0 0 3px #edf2ff;
        }

        .overview-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          padding: 20px;
        }

        .overview-tile {
          min-width: 0;
          padding: 17px;
          border: 1px solid #e5e9f1;
          border-radius: 12px;
          background: #fff;
        }

        .overview-tile-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          color: #465169;
          font-size: 12px;
          font-weight: 700;
        }

        .green-icon {
          color: #16a34a;
        }

        .orange-icon {
          color: #d97706;
        }

        .blue-icon {
          color: #315fea;
        }

        .overview-number {
          display: block;
          margin-top: 19px;
          color: #172033;
          font-size: 29px;
          font-weight: 800;
          letter-spacing: -0.7px;
        }

        .overview-tile > p {
          margin: 4px 0 0;
          color: #8a94a6;
          font-size: 11px;
        }

        .green-fill {
          background: #22c55e;
        }

        .inline-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 15px;
        }

        .mini-pill {
          padding: 5px 8px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
        }

        .amber-pill {
          color: #a85c08;
          background: #fffbeb;
        }

        .red-pill {
          color: #b91c1c;
          background: #fef2f2;
        }

        .text-button {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 0;
          border: 0;
          background: transparent;
          cursor: pointer;
          font: inherit;
          font-size: 11px;
        }

        .overview-tile .text-button {
          margin-top: 15px;
        }

        .text-button:hover {
          text-decoration: underline;
        }

        .table-scroll {
          width: 100%;
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          white-space: nowrap;
        }

        .controls-table {
          min-width: 1030px;
        }

        .evidence-table {
          min-width: 790px;
        }

        .data-table thead {
          background: #f8f9fc;
        }

        .data-table th {
          padding: 13px 16px;
          color: #8590a3;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.8px;
          text-transform: uppercase;
        }

        .data-table th:first-child,
        .data-table td:first-child {
          padding-left: 21px;
        }

        .data-table td {
          padding: 15px 16px;
          border-top: 1px solid #eef1f6;
          color: #5c677c;
          font-size: 11px;
          vertical-align: middle;
        }

        .data-table tbody tr {
          transition: background 120ms ease;
        }

        .data-table tbody tr:hover {
          background: #fafbfe;
        }

        .record-link {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 5px;
          padding: 0;
          border: 0;
          background: transparent;
          cursor: pointer;
          text-align: left;
        }

        .record-link strong,
        .evidence-record strong {
          color: #273249;
          font-size: 11px;
          font-weight: 800;
        }

        .record-link:hover strong,
        .evidence-record:hover strong {
          color: #315fea;
        }

        .record-link span {
          color: #98a1b1;
          font-size: 10px;
        }

        .risk-badge,
        .evidence-badge,
        .neutral-badge {
          display: inline-flex;
          align-items: center;
          padding: 5px 9px;
          border-radius: 30px;
          font-size: 10px;
          font-weight: 800;
        }

        .risk-low {
          color: #566175;
          background: #f0f2f6;
        }

        .risk-medium {
          color: #2855d9;
          background: #eff6ff;
        }

        .risk-high {
          color: #a85c08;
          background: #fffbeb;
        }

        .risk-critical {
          color: #b91c1c;
          background: #fef2f2;
        }

        .evidence-verified {
          color: #15803d;
          background: #f0fdf4;
        }

        .evidence-pending {
          color: #a85c08;
          background: #fffbeb;
        }

        .evidence-expired {
          color: #b91c1c;
          background: #fef2f2;
        }

        .neutral-badge {
          color: #566175;
          background: #f0f2f6;
        }

        .evidence-count {
          display: inline-flex;
          padding: 6px 9px;
          border-radius: 7px;
          color: #2855d9;
          background: #eff6ff;
          font-size: 10px;
          font-weight: 800;
        }

        .evidence-empty {
          color: #b91c1c;
          background: #fef2f2;
        }

        .action-cell {
          position: relative;
          width: 50px;
        }

        .icon-button {
          display: inline-grid;
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          place-items: center;
          border: 1px solid #e0e5ee;
          border-radius: 9px;
          color: #69758a;
          background: #fff;
          cursor: pointer;
          transition:
            background 140ms ease,
            border-color 140ms ease;
        }

        .icon-button:hover {
          border-color: #cbd5e5;
          background: #f5f7fb;
        }

        .action-menu {
          position: absolute;
          top: 42px;
          right: 24px;
          z-index: 15;
          width: 190px;
          padding: 6px;
          border: 1px solid #e1e6ef;
          border-radius: 11px;
          background: #fff;
          box-shadow: 0 12px 32px rgba(20, 31, 55, 0.16);
        }

        .action-menu button {
          display: block;
          width: 100%;
          padding: 9px 10px;
          border: 0;
          border-radius: 7px;
          color: #4a566c;
          background: transparent;
          cursor: pointer;
          text-align: left;
          font: inherit;
          font-size: 11px;
        }

        .action-menu button:hover {
          color: #315fea;
          background: #f1f5ff;
        }

        .empty-state {
          padding: 45px 20px !important;
          color: #8791a3 !important;
          text-align: center;
        }

        .evidence-record {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 0;
          border: 0;
          background: transparent;
          cursor: pointer;
          text-align: left;
        }

        .document-icon {
          display: grid;
          width: 39px;
          height: 39px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 10px;
          color: #315fea;
          background: #eff6ff;
        }

        .evidence-record > span:last-child {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .evidence-record small {
          color: #98a1b1;
          font-size: 10px;
        }

        .table-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 15px 21px;
          border-top: 1px solid #edf0f5;
          color: #99a2b1;
          font-size: 10px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 15px;
        }

        .info-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 19px;
          border: 1px solid #e3e8f0;
          border-radius: 14px;
          background: #fff;
          box-shadow: 0 3px 12px rgba(26, 40, 75, 0.025);
        }

        .info-icon {
          display: grid;
          width: 39px;
          height: 39px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 11px;
          color: #315fea;
          background: #eff4ff;
        }

        .info-card h3 {
          margin: 1px 0 0;
          color: #263148;
          font-size: 12px;
          font-weight: 800;
        }

        .info-card p {
          margin: 7px 0 0;
          color: #8791a3;
          font-size: 11px;
          line-height: 1.8;
        }

        .page-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-top: 25px;
          padding: 18px 0 4px;
          border-top: 1px solid #e0e5ee;
          color: #98a1b1;
          font-size: 10px;
        }

        .overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          justify-content: flex-end;
          background: rgba(14, 22, 40, 0.46);
          backdrop-filter: blur(3px);
        }

        .details-panel {
          width: min(100%, 490px);
          height: 100%;
          overflow-y: auto;
          padding: 26px;
          background: #fff;
          box-shadow: -10px 0 40px rgba(14, 22, 40, 0.13);
          animation: drawer-in 180ms ease-out;
        }

        .drawer-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          padding-bottom: 19px;
          border-bottom: 1px solid #edf0f5;
        }

        .drawer-eyebrow {
          margin: 0;
          color: #315fea;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.3px;
        }

        .drawer-header h2 {
          margin: 8px 0 0;
          color: #1a2439;
          font-size: 20px;
          font-weight: 800;
          line-height: 1.35;
          overflow-wrap: anywhere;
        }

        .drawer-id {
          margin: 5px 0 0;
          color: #98a1b1;
          font-size: 11px;
        }

        .close-button {
          width: 37px;
          height: 37px;
        }

        .drawer-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 22px;
        }

        .drawer-description {
          margin: 20px 0;
          color: #637087;
          font-size: 13px;
          line-height: 1.9;
        }

        .detail-rows {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-top: 22px;
        }

        .detail-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          padding-bottom: 13px;
          border-bottom: 1px solid #eef1f6;
        }

        .detail-row span:first-child {
          color: #8791a3;
          font-size: 12px;
        }

        .detail-row span:last-child {
          max-width: 65%;
          color: #354158;
          font-size: 12px;
          font-weight: 700;
          overflow-wrap: anywhere;
          text-align: right;
        }

        .drawer-section-title {
          margin: 27px 0 0;
          color: #253047;
          font-size: 13px;
          font-weight: 800;
        }

        .status-actions {
          display: grid;
          gap: 8px;
          margin-top: 12px;
        }

        .status-action {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 14px;
          border: 1px solid #e1e6ef;
          border-radius: 10px;
          color: #526077;
          background: #fff;
          cursor: pointer;
          text-align: left;
          font: inherit;
          font-size: 12px;
        }

        .status-action:hover,
        .status-action-active {
          border-color: #b9ccff;
          color: #315fea;
          background: #f2f6ff;
        }

        .drawer-coverage {
          margin-top: 23px;
          padding: 16px;
          border: 1px solid #e5e9f1;
          border-radius: 13px;
        }

        .framework-controls {
          display: grid;
          gap: 8px;
          margin-top: 12px;
        }

        .framework-controls button {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px;
          border: 1px solid #e5e9f1;
          border-radius: 10px;
          color: #647086;
          background: #fff;
          cursor: pointer;
          text-align: left;
        }

        .framework-controls button:hover {
          border-color: #c7d6ff;
          background: #f8faff;
        }

        .framework-controls button > span {
          display: flex;
          min-width: 0;
          flex-direction: column;
          gap: 4px;
        }

        .framework-controls strong {
          color: #354158;
          font-size: 11px;
        }

        .framework-controls small {
          color: #98a1b1;
          font-size: 10px;
        }

        .evidence-warning {
          margin-top: 23px;
          padding: 14px;
          border: 1px solid #f4dda5;
          border-radius: 11px;
          color: #8a570a;
          background: #fffbeb;
          font-size: 11px;
          line-height: 1.8;
        }

        .drawer-primary-button {
          width: 100%;
          margin-top: 18px;
        }

        .modal-overlay {
          align-items: center;
          justify-content: center;
          overflow-y: auto;
          padding: 20px;
        }

        .create-modal {
          width: min(100%, 650px);
          max-height: 92vh;
          overflow-y: auto;
          padding: 25px;
          border: 1px solid #e1e6ef;
          border-radius: 17px;
          background: #fff;
          box-shadow: 0 25px 80px rgba(14, 22, 40, 0.2);
          animation: modal-in 180ms ease-out;
        }

        .modal-subtitle {
          margin: 6px 0 0;
          color: #8791a3;
          font-size: 12px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 17px;
          margin-top: 22px;
        }

        .form-grid label,
        .description-field {
          display: flex;
          min-width: 0;
          flex-direction: column;
          gap: 8px;
          color: #4b576d;
          font-size: 11px;
          font-weight: 800;
        }

        .description-field {
          margin-top: 18px;
        }

        .description-field textarea {
          min-height: 100px;
          resize: vertical;
          line-height: 1.7;
        }

        .form-error {
          margin: 13px 0 0;
          color: #b91c1c;
          font-size: 12px;
        }

        .modal-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: flex-end;
          gap: 9px;
          margin-top: 23px;
          padding-top: 18px;
          border-top: 1px solid #edf0f5;
        }

        .compliance-page button:focus-visible,
        .compliance-page input:focus-visible,
        .compliance-page select:focus-visible,
        .compliance-page textarea:focus-visible {
          outline: 2px solid #315fea;
          outline-offset: 3px;
        }

        @keyframes drawer-in {
          from {
            transform: translateX(18px);
            opacity: 0.7;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes modal-in {
          from {
            transform: translateY(8px);
            opacity: 0.7;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @media (max-width: 1100px) {
          .compliance-page {
            padding: 22px;
          }

          .metrics-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .page-header {
            flex-direction: column;
          }

          .framework-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .compliance-page {
            padding: 15px;
          }

          .header-actions {
            width: 100%;
          }

          .header-actions .button {
            flex: 1;
          }

          .operations-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .tabs {
            width: 100%;
          }

          .tab {
            flex: 1;
          }

          .filters {
            grid-template-columns: 1fr;
          }

          .overview-grid,
          .info-grid {
            grid-template-columns: 1fr;
          }

          .table-footer,
          .page-footer {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .metrics-grid {
            grid-template-columns: 1fr;
          }

          .metric-card {
            padding: 17px;
          }

          .framework-card {
            padding: 16px;
          }

          .framework-top {
            flex-direction: column;
          }

          .framework-footer {
            align-items: flex-start;
            flex-direction: column;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .details-panel {
            padding: 18px;
          }

          .create-modal {
            padding: 18px;
          }

          .eyebrow {
            font-size: 9px;
            letter-spacing: 1px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .compliance-page *,
          .compliance-page *::before,
          .compliance-page *::after {
            scroll-behavior: auto !important;
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </main>
  );
}

function StatusBadge({ status }: { status: ComplianceStatus }) {
  const classes: Record<ComplianceStatus, string> = {
    Compliant: "status-compliant",
    "In progress": "status-progress",
    "Needs review": "status-review",
    "Non-compliant": "status-noncompliant",
  };

  return (
    <span className={`status-badge ${classes[status]}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
}

function RiskBadge({ risk }: { risk: RiskLevel }) {
  const classes: Record<RiskLevel, string> = {
    Low: "risk-low",
    Medium: "risk-medium",
    High: "risk-high",
    Critical: "risk-critical",
  };

  return <span className={`risk-badge ${classes[risk]}`}>{risk}</span>;
}

function EvidenceBadge({ status }: { status: Evidence["status"] }) {
  const classes: Record<Evidence["status"], string> = {
    Verified: "evidence-verified",
    "Pending verification": "evidence-pending",
    Expired: "evidence-expired",
  };

  return (
    <span className={`evidence-badge ${classes[status]}`}>{status}</span>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-row">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Shield;
  title: string;
  description: string;
}) {
  return (
    <article className="info-card">
      <div className="info-icon">
        <Icon size={20} />
      </div>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </article>
  );
}
