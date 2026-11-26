
"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  FileCheck2,
  FileText,
  Filter,
  LockKeyhole,
  Plus,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";

type PolicyStatus = "Active" | "Draft" | "Under Review" | "Archived";
type Priority = "Critical" | "High" | "Medium" | "Low";

type Policy = {
  id: string;
  name: string;
  description: string;
  category: string;
  owner: string;
  version: string;
  priority: Priority;
  status: PolicyStatus;
  effectiveDate: string;
  reviewDate: string;
  scope: string;
  requirements: string[];
};

const initialPolicies: Policy[] = [
  {
    id: "POL-001",
    name: "Responsible AI Usage",
    description:
      "Defines acceptable AI use, human oversight, accountability, and prohibited use cases across the organization.",
    category: "Responsible AI",
    owner: "AI Governance Team",
    version: "2.1",
    priority: "Critical",
    status: "Active",
    effectiveDate: "Oct 01, 2026",
    reviewDate: "Dec 01, 2026",
    scope: "All AI-powered products, agents, and internal AI workflows",
    requirements: [
      "Document the intended use of every production AI system.",
      "Require human review for high-impact decisions.",
      "Maintain an escalation process for harmful or incorrect outputs.",
    ],
  },
  {
    id: "POL-002",
    name: "Sensitive Data Handling",
    description:
      "Establishes safeguards for confidential information, personal data, and restricted enterprise content.",
    category: "Data Protection",
    owner: "Security Team",
    version: "1.4",
    priority: "Critical",
    status: "Active",
    effectiveDate: "Sep 15, 2026",
    reviewDate: "Nov 15, 2026",
    scope: "Data pipelines, Knowledge Hub, model prompts, and generated outputs",
    requirements: [
      "Classify data before onboarding it into approved systems.",
      "Limit access according to role and business need.",
      "Define retention and deletion requirements for sensitive data.",
    ],
  },
  {
    id: "POL-003",
    name: "Model Release Approval",
    description:
      "Defines validation, evaluation, sign-off, and rollback requirements before a model is released.",
    category: "Model Governance",
    owner: "ML Platform Team",
    version: "1.2",
    priority: "High",
    status: "Under Review",
    effectiveDate: "Oct 10, 2026",
    reviewDate: "Nov 10, 2026",
    scope: "Foundation models, fine-tuned models, and model routing changes",
    requirements: [
      "Record evaluation results before release.",
      "Obtain approval from the designated model owner.",
      "Document rollback and incident response procedures.",
    ],
  },
  {
    id: "POL-004",
    name: "AI Vendor Assessment",
    description:
      "Requires risk assessment and review of third-party AI providers before adoption.",
    category: "Vendor Governance",
    owner: "Procurement & Security",
    version: "1.0",
    priority: "High",
    status: "Active",
    effectiveDate: "Aug 20, 2026",
    reviewDate: "Feb 20, 2027",
    scope: "External model APIs, AI infrastructure providers, and subprocessors",
    requirements: [
      "Assess security and privacy practices.",
      "Document data processing and service commitments.",
      "Reassess providers when material service changes occur.",
    ],
  },
  {
    id: "POL-005",
    name: "Audit Log Retention",
    description:
      "Sets expectations for retaining and reviewing important governance and security events.",
    category: "Audit & Compliance",
    owner: "Compliance Team",
    version: "1.1",
    priority: "Medium",
    status: "Draft",
    effectiveDate: "Not effective",
    reviewDate: "Nov 20, 2026",
    scope: "Governance actions, administrative changes, and security events",
    requirements: [
      "Record key administrative actions.",
      "Restrict access to audit records.",
      "Define retention periods according to applicable requirements.",
    ],
  },
  {
    id: "POL-006",
    name: "Prompt and Output Safety",
    description:
      "Defines controls for unsafe prompts, untrusted inputs, and potentially harmful AI outputs.",
    category: "AI Safety",
    owner: "Trust & Safety Team",
    version: "0.9",
    priority: "High",
    status: "Draft",
    effectiveDate: "Not effective",
    reviewDate: "Dec 05, 2026",
    scope: "Chat, agents, browser automation, and multimodal workflows",
    requirements: [
      "Test safety controls against representative misuse cases.",
      "Validate outputs for high-risk workflows.",
      "Provide incident reporting and response procedures.",
    ],
  },
  {
    id: "POL-007",
    name: "Access Control and Permissions",
    description:
      "Establishes principles for granting, reviewing, and revoking access to enterprise AI services.",
    category: "Security",
    owner: "Identity & Access Team",
    version: "1.3",
    priority: "Critical",
    status: "Active",
    effectiveDate: "Jul 01, 2026",
    reviewDate: "Jan 01, 2027",
    scope: "Users, service accounts, workspaces, APIs, and administrative tools",
    requirements: [
      "Apply least-privilege access.",
      "Review privileged permissions periodically.",
      "Revoke access when no longer required.",
    ],
  },
];

const policyCategories = [
  "Responsible AI",
  "Data Protection",
  "Model Governance",
  "Vendor Governance",
  "Audit & Compliance",
  "AI Safety",
  "Security",
  "Operations",
  "Other",
];

const statusStyle: Record<PolicyStatus, { color: string; bg: string }> = {
  Active: { color: "#16845B", bg: "#E8F7EF" },
  Draft: { color: "#315FEA", bg: "#EEF3FF" },
  "Under Review": { color: "#B96A12", bg: "#FFF4E5" },
  Archived: { color: "#667085", bg: "#F0F1F4" },
};

const priorityStyle: Record<Priority, { color: string; bg: string }> = {
  Critical: { color: "#C33D46", bg: "#FDECEE" },
  High: { color: "#B96A12", bg: "#FFF4E5" },
  Medium: { color: "#315FEA", bg: "#EEF3FF" },
  Low: { color: "#667085", bg: "#F0F1F4" },
};

const border = "#E5E7EB";
const ink = "#172033";
const muted = "#6B7280";
const blue = "#315FEA";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 11px",
  border: `1px solid ${border}`,
  borderRadius: 8,
  background: "#FFFFFF",
  color: ink,
  fontSize: 12,
  boxSizing: "border-box",
};

const secondaryButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  padding: "9px 12px",
  border: `1px solid ${border}`,
  borderRadius: 8,
  background: "#FFFFFF",
  color: ink,
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};

const primaryButton: React.CSSProperties = {
  ...secondaryButton,
  background: blue,
  color: "#FFFFFF",
  borderColor: blue,
};

function Pill({ value }: { value: PolicyStatus | Priority }) {
  const style =
    value in statusStyle
      ? statusStyle[value as PolicyStatus]
      : priorityStyle[value as Priority];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "5px 9px",
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 750,
        color: style.color,
        background: style.bg,
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </span>
  );
}

function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: number;
  description: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <article
      style={{
        border: `1px solid ${border}`,
        background: "#FFFFFF",
        borderRadius: 12,
        padding: 17,
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <span style={{ color: muted, fontSize: 12, fontWeight: 650 }}>
          {label}
        </span>
        <span
          style={{
            width: 34,
            height: 34,
            display: "grid",
            placeItems: "center",
            borderRadius: 9,
            color,
            background: bg,
          }}
        >
          <Icon size={17} />
        </span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 12 }}>{value}</div>
      <div style={{ color: muted, fontSize: 11, marginTop: 5 }}>
        {description}
      </div>
    </article>
  );
}

export default function PolicyManagementPage() {
  const [policies, setPolicies] = useState(initialPolicies);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [selected, setSelected] = useState<Policy | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "Responsible AI",
    owner: "AI Governance Team",
    priority: "Medium" as Priority,
    scope: "",
    reviewDate: "",
  });

  const stats = useMemo(
    () => ({
      total: policies.length,
      active: policies.filter((p) => p.status === "Active").length,
      review: policies.filter((p) => p.status === "Under Review").length,
      drafts: policies.filter((p) => p.status === "Draft").length,
      critical: policies.filter(
        (p) => p.priority === "Critical" && p.status !== "Archived",
      ).length,
    }),
    [policies],
  );

  const filteredPolicies = useMemo(() => {
    const query = search.trim().toLowerCase();

    return policies.filter((policy) => {
      const matchesSearch =
        !query ||
        [
          policy.id,
          policy.name,
          policy.description,
          policy.category,
          policy.owner,
          policy.scope,
        ].some((value) => value.toLowerCase().includes(query));

      return (
        matchesSearch &&
        (statusFilter === "All" || policy.status === statusFilter) &&
        (categoryFilter === "All" || policy.category === categoryFilter) &&
        (priorityFilter === "All" || policy.priority === priorityFilter)
      );
    });
  }, [policies, search, statusFilter, categoryFilter, priorityFilter]);

  function updatePolicy(updated: Policy) {
    setPolicies((current) =>
      current.map((policy) =>
        policy.id === updated.id ? updated : policy,
      ),
    );
    setSelected(updated);
    setNotice(`${updated.name} updated successfully.`);
  }

  function createPolicy(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (
      !form.name.trim() ||
      !form.description.trim() ||
      !form.scope.trim() ||
      !form.reviewDate
    ) {
      setError("Complete all required fields before creating the policy.");
      return;
    }

    const nextNumber =
      Math.max(0, ...policies.map((p) => Number(p.id.replace("POL-", "")))) + 1;

    const newPolicy: Policy = {
      id: `POL-${String(nextNumber).padStart(3, "0")}`,
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      owner: form.owner,
      version: "1.0",
      priority: form.priority,
      status: "Draft",
      effectiveDate: "Not effective",
      reviewDate: new Date(`${form.reviewDate}T12:00:00`).toLocaleDateString(
        "en-US",
        { month: "short", day: "2-digit", year: "numeric" },
      ),
      scope: form.scope.trim(),
      requirements: [
        "Document policy requirements and implementation responsibilities.",
        "Assign an owner to monitor compliance.",
        "Review the policy on the scheduled review date.",
      ],
    };

    setPolicies((current) => [newPolicy, ...current]);
    setShowCreate(false);
    setForm({
      name: "",
      description: "",
      category: "Responsible AI",
      owner: "AI Governance Team",
      priority: "Medium",
      scope: "",
      reviewDate: "",
    });
    setNotice(`${newPolicy.name} created as a draft.`);
  }

  function exportCsv() {
    const headers = [
      "Policy ID",
      "Name",
      "Category",
      "Owner",
      "Version",
      "Priority",
      "Status",
      "Effective Date",
      "Review Date",
      "Scope",
      "Description",
    ];

    const rows = filteredPolicies.map((p) => [
      p.id,
      p.name,
      p.category,
      p.owner,
      p.version,
      p.priority,
      p.status,
      p.effectiveDate,
      p.reviewDate,
      p.scope,
      p.description,
    ]);

    const cell = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csv = [headers, ...rows]
      .map((row) => row.map(cell).join(","))
      .join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-policy-inventory.csv";
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Filtered policy inventory exported.");
  }

  return (
    <main
      className="pm-page"
      style={{
        minHeight: "100%",
        padding: 28,
        background: "#F7F8FA",
        color: ink,
        fontFamily: "inherit",
      }}
    >
      <style>{`
        .pm-table { width:100%; min-width:900px; border-collapse:collapse; text-align:left; }
        .pm-table th { padding:12px 14px; background:#FAFBFC; color:${muted}; font-size:10px; letter-spacing:.05em; white-space:nowrap; border-bottom:1px solid ${border}; }
        .pm-table td { padding:14px; border-bottom:1px solid ${border}; font-size:12px; }
        .pm-table tbody tr:hover { background:#FAFBFF; }
        .pm-label { display:block; margin-bottom:7px; color:#4B5563; font-size:12px; font-weight:700; }
        .pm-card { background:#FFFFFF; border:1px solid ${border}; border-radius:12px; overflow:hidden; }
        @media(max-width:700px) {
          .pm-page { padding:15px !important; }
          .pm-header-actions { width:100%; }
          .pm-header-actions button { flex:1; }
        }
      `}</style>

      <header
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 18,
          marginBottom: 24,
        }}
      >
        <div style={{ maxWidth: 760 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              color: blue,
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            <FileCheck2 size={16} /> Governance / Policy Management
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 29,
              lineHeight: 1.2,
              letterSpacing: "-.7px",
              fontWeight: 800,
            }}
          >
            Policy Management
          </h1>
          <p
            style={{
              margin: "10px 0 0",
              color: muted,
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            Create, organize, and review enterprise AI governance policies.
            Monitor ownership, policy lifecycle, priority, and upcoming review
            dates from one workspace.
          </p>
        </div>

        <div
          className="pm-header-actions"
          style={{ display: "flex", gap: 9, flexWrap: "wrap" }}
        >
          <button type="button" style={secondaryButton} onClick={exportCsv}>
            <Download size={15} /> Export CSV
          </button>
          <button
            type="button"
            style={primaryButton}
            onClick={() => {
              setError("");
              setShowCreate(true);
            }}
          >
            <Plus size={15} /> Create policy
          </button>
        </div>
      </header>

      {notice && (
        <div
          role="status"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            padding: "11px 13px",
            marginBottom: 18,
            border: "1px solid #BDE8CF",
            background: "#F0FBF5",
            color: "#176B48",
            borderRadius: 9,
            fontSize: 12,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircle2 size={16} /> {notice}
          </span>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
            style={{ border: 0, background: "transparent", cursor: "pointer" }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(185px,1fr))",
          gap: 13,
          marginBottom: 22,
        }}
      >
        <MetricCard label="Total Policies" value={stats.total} description="Policies in the inventory" icon={FileText} color={blue} bg="#EEF3FF" />
        <MetricCard label="Active Policies" value={stats.active} description="Currently marked active" icon={ShieldCheck} color="#16845B" bg="#E8F7EF" />
        <MetricCard label="Under Review" value={stats.review} description="Awaiting review completion" icon={Clock3} color="#B96A12" bg="#FFF4E5" />
        <MetricCard label="Draft Policies" value={stats.drafts} description="Not yet active" icon={FileCheck2} color="#7555C7" bg="#F2EDFF" />
      </section>

      <section
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "15px 17px",
          background: "#FFF9EC",
          border: "1px solid #F4E2B8",
          borderRadius: 11,
          marginBottom: 22,
        }}
      >
        <span
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            display: "grid",
            placeItems: "center",
            background: "#FFF0D0",
            color: "#A4660C",
            flexShrink: 0,
          }}
        >
          <AlertCircle size={19} />
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800 }}>
            Critical policies need attention
          </div>
          <div style={{ fontSize: 11, color: "#8B6A35", marginTop: 4 }}>
            {stats.critical} non-archived critical-priority policies are
            currently tracked. Confirm that their owners and review dates are
            up to date.
          </div>
        </div>
        <button
          type="button"
          style={secondaryButton}
          onClick={() => {
            setPriorityFilter("Critical");
            setStatusFilter("All");
          }}
        >
          View critical <ArrowUpRight size={14} />
        </button>
      </section>

      <section className="pm-card">
        <div style={{ padding: "18px 20px", borderBottom: `1px solid ${border}` }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>
            Policy inventory
          </h2>
          <p style={{ margin: "5px 0 0", color: muted, fontSize: 12 }}>
            Manage policy status, priority, ownership, and lifecycle details.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            padding: "15px 20px",
            borderBottom: `1px solid ${border}`,
          }}
        >
          <div style={{ flex: "1 1 220px", position: "relative" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: 11,
                top: 11,
                color: muted,
              }}
            />
            <input
              aria-label="Search policies"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search policies, owners, descriptions..."
              style={{ ...inputStyle, paddingLeft: 36 }}
            />
          </div>

          <select
            aria-label="Filter by policy status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ ...inputStyle, width: "auto", minWidth: 135 }}
          >
            <option value="All">All statuses</option>
            <option>Active</option>
            <option>Draft</option>
            <option>Under Review</option>
            <option>Archived</option>
          </select>

          <select
            aria-label="Filter by policy category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ ...inputStyle, width: "auto", minWidth: 150 }}
          >
            <option value="All">All categories</option>
            {policyCategories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>

          <select
            aria-label="Filter by policy priority"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ ...inputStyle, width: "auto", minWidth: 130 }}
          >
            <option value="All">All priorities</option>
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <button
            type="button"
            style={secondaryButton}
            onClick={() => {
              setSearch("");
              setStatusFilter("All");
              setCategoryFilter("All");
              setPriorityFilter("All");
            }}
          >
            <Filter size={14} /> Clear
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="pm-table">
            <thead>
              <tr>
                <th>POLICY</th>
                <th>CATEGORY</th>
                <th>OWNER</th>
                <th>VERSION</th>
                <th>PRIORITY</th>
                <th>STATUS</th>
                <th>REVIEW DATE</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredPolicies.map((policy) => (
                <tr key={policy.id}>
                  <td>
                    <button
                      type="button"
                      onClick={() => setSelected(policy)}
                      style={{
                        border: 0,
                        padding: 0,
                        background: "transparent",
                        color: ink,
                        textAlign: "left",
                        fontSize: 12,
                        fontWeight: 750,
                        cursor: "pointer",
                      }}
                    >
                      {policy.name}
                    </button>
                    <div style={{ color: muted, fontSize: 10, marginTop: 5 }}>
                      {policy.id}
                    </div>
                  </td>
                  <td>{policy.category}</td>
                  <td>{policy.owner}</td>
                  <td>v{policy.version}</td>
                  <td><Pill value={policy.priority} /></td>
                  <td><Pill value={policy.status} /></td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <CalendarDays
                      size={13}
                      style={{ verticalAlign: "middle", marginRight: 5, color: muted }}
                    />
                    {policy.reviewDate}
                  </td>
                  <td>
                    <button
                      type="button"
                      style={secondaryButton}
                      onClick={() => setSelected(policy)}
                    >
                      <FileText size={13} /> View
                    </button>
                  </td>
                </tr>
              ))}

              {filteredPolicies.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: 35, textAlign: "center" }}>
                    <Search size={24} color={muted} />
                    <p style={{ fontWeight: 750 }}>No policies found</p>
                    <p style={{ color: muted, fontSize: 12 }}>
                      Change your search or filters to see more policies.
                    </p>
                    <button
                      type="button"
                      style={secondaryButton}
                      onClick={() => {
                        setSearch("");
                        setStatusFilter("All");
                        setCategoryFilter("All");
                        setPriorityFilter("All");
                      }}
                    >
                      Clear filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
            padding: "13px 20px",
            color: muted,
            fontSize: 11,
          }}
        >
          <span>Showing {filteredPolicies.length} of {policies.length} policies</span>
          <span>Sample policy inventory · Local demo state</span>
        </div>
      </section>

      <section
        style={{
          display: "flex",
          gap: 10,
          padding: 14,
          border: `1px solid ${border}`,
          borderRadius: 10,
          background: "#FFFFFF",
          color: muted,
          fontSize: 11,
          lineHeight: 1.7,
          marginTop: 20,
        }}
      >
        <LockKeyhole size={17} color={blue} />
        <span>
          <strong style={{ color: ink }}>Governance note.</strong>{" "}
          Policy records and status changes are sample frontend data. Connect
          backend storage, role-based approvals, version history, and audit
          logging before treating policies as formally approved or enforced.
        </span>
      </section>

      {showCreate && (
        <div
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowCreate(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            padding: 18,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "rgba(15,23,42,.5)",
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            style={{
              width: "100%",
              maxWidth: 640,
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#FFFFFF",
              borderRadius: 14,
              padding: 22,
              boxShadow: "0 24px 70px rgba(15,23,42,.25)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 19 }}>Create policy</h2>
                <p style={{ color: muted, fontSize: 12 }}>
                  New policies begin as drafts.
                </p>
              </div>
              <button type="button" aria-label="Close create policy form" style={secondaryButton} onClick={() => setShowCreate(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={createPolicy}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))",
                  gap: 15,
                  marginTop: 18,
                }}
              >
                <label style={{ gridColumn: "1 / -1" }}>
                  <span className="pm-label">Policy name *</span>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} placeholder="e.g. AI Incident Response" />
                </label>

                <label>
                  <span className="pm-label">Category</span>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                    {policyCategories.map((category) => <option key={category}>{category}</option>)}
                  </select>
                </label>

                <label>
                  <span className="pm-label">Owner</span>
                  <select value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} style={inputStyle}>
                    <option>AI Governance Team</option>
                    <option>Security Team</option>
                    <option>ML Platform Team</option>
                    <option>Compliance Team</option>
                    <option>Trust & Safety Team</option>
                    <option>Procurement & Security</option>
                    <option>Identity & Access Team</option>
                    <option>Operations Team</option>
                  </select>
                </label>

                <label>
                  <span className="pm-label">Priority</span>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })} style={inputStyle}>
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </label>

                <label>
                  <span className="pm-label">Review date *</span>
                  <input required type="date" value={form.reviewDate} onChange={(e) => setForm({ ...form, reviewDate: e.target.value })} style={inputStyle} />
                </label>

                <label style={{ gridColumn: "1 / -1" }}>
                  <span className="pm-label">Description *</span>
                  <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, resize: "vertical" }} placeholder="What does this policy establish?" />
                </label>

                <label style={{ gridColumn: "1 / -1" }}>
                  <span className="pm-label">Scope *</span>
                  <textarea required rows={2} value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })} style={{ ...inputStyle, resize: "vertical" }} placeholder="Which systems, teams, or workflows does it cover?" />
                </label>
              </div>

              {error && (
                <p role="alert" style={{ color: "#C33D46", fontSize: 12 }}>
                  {error}
                </p>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 9, marginTop: 20, paddingTop: 16, borderTop: `1px solid ${border}` }}>
                <button type="button" style={secondaryButton} onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" style={primaryButton}><Plus size={15} /> Create draft</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selected && (
        <div
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            padding: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(15,23,42,.5)",
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            style={{
              width: "100%",
              maxWidth: 650,
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#FFFFFF",
              borderRadius: 14,
              padding: 22,
              boxShadow: "0 24px 70px rgba(15,23,42,.25)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ color: blue, fontSize: 11, fontWeight: 800 }}>{selected.id} · VERSION {selected.version}</div>
                <h2 style={{ margin: "8px 0", fontSize: 20 }}>{selected.name}</h2>
              </div>
              <button type="button" aria-label="Close policy details" style={secondaryButton} onClick={() => setSelected(null)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "12px 0" }}>
              <Pill value={selected.status} />
              <Pill value={selected.priority} />
              <span style={{ background: "#F0F1F4", color: "#4B5563", padding: "5px 9px", borderRadius: 20, fontSize: 10, fontWeight: 750 }}>{selected.category}</span>
            </div>

            <p style={{ color: "#4B5563", fontSize: 13, lineHeight: 1.8 }}>
              {selected.description}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))", gap: 10, margin: "18px 0" }}>
              {[
                ["Owner", selected.owner],
                ["Scope", selected.scope],
                ["Effective date", selected.effectiveDate],
                ["Next review", selected.reviewDate],
              ].map(([label, value]) => (
                <div key={label} style={{ border: `1px solid ${border}`, borderRadius: 9, padding: 12 }}>
                  <div style={{ color: muted, fontSize: 10 }}>{label}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, marginTop: 6, lineHeight: 1.6, overflowWrap: "anywhere" }}>{value}</div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: 13, margin: "20px 0 10px" }}>Policy requirements</h3>
            <div style={{ display: "grid", gap: 10 }}>
              {selected.requirements.map((requirement, index) => (
                <div key={requirement} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 12, lineHeight: 1.7, color: "#4B5563" }}>
                  <Check size={15} color="#16845B" style={{ marginTop: 3, flexShrink: 0 }} />
                  <span>{requirement}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 22, paddingTop: 16, borderTop: `1px solid ${border}` }}>
              {selected.status !== "Active" && selected.status !== "Archived" && (
                <button
                  type="button"
                  style={primaryButton}
                  onClick={() => updatePolicy({ ...selected, status: "Active", effectiveDate: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) })}
                >
                  <CheckCircle2 size={15} /> Approve & activate
                </button>
              )}

              {selected.status !== "Under Review" && selected.status !== "Archived" && (
                <button
                  type="button"
                  style={secondaryButton}
                  onClick={() => updatePolicy({ ...selected, status: "Under Review" })}
                >
                  <Clock3 size={15} /> Send for review
                </button>
              )}

              {selected.status !== "Archived" && (
                <button
                  type="button"
                  style={secondaryButton}
                  onClick={() => updatePolicy({ ...selected, status: "Archived" })}
                >
                  <FileText size={15} /> Archive policy
                </button>
              )}

              {selected.status === "Archived" && (
                <button
                  type="button"
                  style={secondaryButton}
                  onClick={() => updatePolicy({ ...selected, status: "Draft" })}
                >
                  <FileText size={15} /> Restore as draft
                </button>
              )}
            </div>

            <p style={{ color: muted, fontSize: 11, lineHeight: 1.7, marginTop: 16 }}>
              Status changes are local demo actions. A production workflow should
              enforce approval permissions, retain version history, and record
              all policy changes in audit logs.
            </p>
          </section>
        </div>
      )}
    </main>
  );
}
