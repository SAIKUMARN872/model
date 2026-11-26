
"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  FileClock,
  GitBranch,
  History,
  Layers3,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";

type ChangeStatus =
  | "Draft"
  | "Pending approval"
  | "Approved"
  | "Rejected"
  | "In progress"
  | "Completed";

type RiskLevel = "Low" | "Medium" | "High" | "Critical";

type ChangeRequest = {
  id: string;
  title: string;
  category: string;
  component: string;
  requester: string;
  approver: string;
  risk: RiskLevel;
  status: ChangeStatus;
  environment: string;
  createdAt: string;
  scheduledDate: string;
  description: string;
  rollback: string;
};

const initialChanges: ChangeRequest[] = [
  {
    id: "CHG-1042",
    title: "Upgrade production model routing",
    category: "Model routing",
    component: "AI Gateway",
    requester: "Platform Engineering",
    approver: "AI Platform Lead",
    risk: "High",
    status: "Pending approval",
    environment: "Production",
    createdAt: "Nov 4, 2026",
    scheduledDate: "Nov 7, 2026",
    description:
      "Update routing rules to select models using configured latency, quality, and cost constraints.",
    rollback:
      "Restore the previous routing configuration and verify request distribution.",
  },
  {
    id: "CHG-1041",
    title: "Knowledge retrieval configuration",
    category: "Configuration",
    component: "Knowledge Hub",
    requester: "Knowledge Platform",
    approver: "Data Platform Lead",
    risk: "Medium",
    status: "Approved",
    environment: "Staging",
    createdAt: "Nov 3, 2026",
    scheduledDate: "Nov 5, 2026",
    description:
      "Adjust retrieval settings and reranking configuration for enterprise knowledge searches.",
    rollback:
      "Reapply the last approved retrieval configuration and rerun validation checks.",
  },
  {
    id: "CHG-1040",
    title: "Enable new safety policy checks",
    category: "Policy update",
    component: "Safety Service",
    requester: "Trust & Safety",
    approver: "Security Lead",
    risk: "Critical",
    status: "Pending approval",
    environment: "Production",
    createdAt: "Nov 2, 2026",
    scheduledDate: "Nov 8, 2026",
    description:
      "Introduce additional policy validation checks before responses are returned to users.",
    rollback:
      "Restore the last approved policy version under the documented incident procedure.",
  },
  {
    id: "CHG-1039",
    title: "Observability dashboard update",
    category: "Monitoring",
    component: "Observability",
    requester: "SRE Team",
    approver: "Engineering Manager",
    risk: "Low",
    status: "Completed",
    environment: "Production",
    createdAt: "Oct 30, 2026",
    scheduledDate: "Nov 1, 2026",
    description:
      "Add model-level latency and error-rate breakdowns to the monitoring dashboard.",
    rollback:
      "Revert the dashboard configuration to the previous saved version.",
  },
  {
    id: "CHG-1038",
    title: "Fine-tuned model candidate review",
    category: "Model update",
    component: "Fine-tuning Service",
    requester: "Model Research",
    approver: "Model Governance Lead",
    risk: "High",
    status: "In progress",
    environment: "Staging",
    createdAt: "Oct 29, 2026",
    scheduledDate: "Nov 6, 2026",
    description:
      "Review evaluation results and prepare a candidate model for a controlled staging rollout.",
    rollback:
      "Keep the existing model version active and revert the staging alias if validation fails.",
  },
  {
    id: "CHG-1037",
    title: "Update access review schedule",
    category: "Security",
    component: "Identity Service",
    requester: "Security Operations",
    approver: "Security Lead",
    risk: "Medium",
    status: "Rejected",
    environment: "Production",
    createdAt: "Oct 27, 2026",
    scheduledDate: "Nov 3, 2026",
    description:
      "Propose an updated recurring schedule for reviewing privileged service accounts.",
    rollback:
      "No deployment required. Retain the existing access review schedule.",
  },
  {
    id: "CHG-1036",
    title: "Reduce inference timeout",
    category: "Configuration",
    component: "Inference Service",
    requester: "ML Infrastructure",
    approver: "AI Platform Lead",
    risk: "Medium",
    status: "Draft",
    environment: "Staging",
    createdAt: "Oct 26, 2026",
    scheduledDate: "Nov 10, 2026",
    description:
      "Propose a timeout adjustment to improve responsiveness under high request volume.",
    rollback:
      "Restore the previous timeout value and review latency and error-rate metrics.",
  },
];

const statusStyles: Record<
  ChangeStatus,
  { color: string; background: string }
> = {
  Draft: { color: "#475569", background: "#e2e8f0" },
  "Pending approval": { color: "#a16207", background: "#fef3c7" },
  Approved: { color: "#1d4ed8", background: "#dbeafe" },
  Rejected: { color: "#b91c1c", background: "#fee2e2" },
  "In progress": { color: "#7c3aed", background: "#f3e8ff" },
  Completed: { color: "#15803d", background: "#dcfce7" },
};

const riskStyles: Record<
  RiskLevel,
  { color: string; background: string }
> = {
  Low: { color: "#15803d", background: "#dcfce7" },
  Medium: { color: "#a16207", background: "#fef3c7" },
  High: { color: "#c2410c", background: "#ffedd5" },
  Critical: { color: "#b91c1c", background: "#fee2e2" },
};

const style: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: 28,
    background: "#f8fafc",
    color: "#172033",
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  container: { maxWidth: 1500, margin: "0 auto" },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#64748b",
    fontSize: 12,
    marginBottom: 12,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 24,
  },
  title: {
    margin: 0,
    fontSize: 29,
    fontWeight: 750,
    letterSpacing: "-0.8px",
  },
  subtitle: {
    margin: "9px 0 0",
    color: "#64748b",
    fontSize: 13,
    lineHeight: 1.7,
    maxWidth: 760,
  },
  primary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    border: "1px solid #315fea",
    borderRadius: 9,
    padding: "11px 15px",
    background: "#315fea",
    color: "#fff",
    fontSize: 12,
    fontWeight: 650,
    cursor: "pointer",
  },
  secondary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    border: "1px solid #dbe2ec",
    borderRadius: 9,
    padding: "10px 13px",
    background: "#fff",
    color: "#334155",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  metrics: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))",
    gap: 14,
    marginBottom: 21,
  },
  metric: {
    background: "#fff",
    border: "1px solid #e6eaf0",
    borderRadius: 12,
    padding: 18,
  },
  metricLabel: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    fontSize: 12,
    color: "#64748b",
  },
  metricValue: {
    fontSize: 29,
    fontWeight: 750,
    letterSpacing: "-.7px",
    marginTop: 13,
  },
  metricNote: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    color: "#64748b",
    fontSize: 11,
    marginTop: 8,
  },
  panel: {
    background: "#fff",
    border: "1px solid #e6eaf0",
    borderRadius: 13,
    marginBottom: 20,
    overflow: "hidden",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    padding: "19px 21px",
    borderBottom: "1px solid #edf0f5",
  },
  panelTitle: { margin: 0, fontSize: 15, fontWeight: 700 },
  panelSub: {
    margin: "5px 0 0",
    fontSize: 11,
    color: "#64748b",
    lineHeight: 1.6,
  },
  filters: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center",
    padding: "14px 20px",
    borderBottom: "1px solid #edf0f5",
  },
  search: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "0 11px",
    border: "1px solid #dbe2ec",
    borderRadius: 8,
    minWidth: 220,
    flex: "1 1 250px",
  },
  inputSearch: {
    width: "100%",
    padding: "10px 0",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#172033",
    fontSize: 12,
  },
  select: {
    padding: "10px 12px",
    border: "1px solid #dbe2ec",
    borderRadius: 8,
    outline: "none",
    background: "#fff",
    color: "#334155",
    fontSize: 12,
    maxWidth: "100%",
  },
  tableWrap: { width: "100%", overflowX: "auto" },
  table: {
    width: "100%",
    minWidth: 1050,
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    padding: "12px 16px",
    background: "#f8fafc",
    borderBottom: "1px solid #e6eaf0",
    color: "#64748b",
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: ".55px",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "15px 16px",
    borderBottom: "1px solid #edf0f5",
    fontSize: 12,
    verticalAlign: "middle",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    padding: "5px 9px",
    fontSize: 10,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    padding: 16,
    background: "rgba(15,23,42,.52)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflowY: "auto",
  },
  modal: {
    width: "100%",
    maxWidth: 620,
    maxHeight: "92vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: 15,
    boxShadow: "0 24px 70px rgba(15,23,42,.25)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    padding: "20px 23px",
    borderBottom: "1px solid #e9edf3",
  },
  modalBody: { display: "grid", gap: 16, padding: 23 },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 9,
    padding: "16px 23px",
    borderTop: "1px solid #e9edf3",
  },
  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 650,
    color: "#334155",
    marginBottom: 7,
  },
  field: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    border: "1px solid #dbe2ec",
    borderRadius: 8,
    outline: "none",
    background: "#fff",
    color: "#172033",
    fontSize: 12,
  },
  muted: { color: "#64748b", fontSize: 11, lineHeight: 1.65 },
};

function StatusBadge({ status }: { status: ChangeStatus }) {
  const colors = statusStyles[status];

  return (
    <span
      style={{
        ...style.badge,
        color: colors.color,
        background: colors.background,
      }}
    >
      {status === "Completed" ? (
        <CheckCircle2 size={12} />
      ) : status === "Rejected" ? (
        <XCircle size={12} />
      ) : status === "Pending approval" ? (
        <Clock3 size={12} />
      ) : status === "In progress" ? (
        <RefreshCw size={12} />
      ) : status === "Approved" ? (
        <Check size={12} />
      ) : (
        <FileClock size={12} />
      )}
      {status}
    </span>
  );
}

function RiskBadge({ risk }: { risk: RiskLevel }) {
  const colors = riskStyles[risk];

  return (
    <span
      style={{
        ...style.badge,
        color: colors.color,
        background: colors.background,
      }}
    >
      {risk === "Critical" || risk === "High" ? (
        <AlertTriangle size={12} />
      ) : (
        <ShieldCheck size={12} />
      )}
      {risk}
    </span>
  );
}

export default function ChangeManagementPage() {
  const [changes, setChanges] = useState<ChangeRequest[]>(initialChanges);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [riskFilter, setRiskFilter] = useState("All risks");
  const [environmentFilter, setEnvironmentFilter] =
    useState("All environments");
  const [selected, setSelected] = useState<ChangeRequest | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState("");

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Configuration");
  const [component, setComponent] = useState("");
  const [requester, setRequester] = useState("");
  const [approver, setApprover] = useState("");
  const [risk, setRisk] = useState<RiskLevel>("Medium");
  const [environment, setEnvironment] = useState("Staging");
  const [scheduledDate, setScheduledDate] = useState("");
  const [description, setDescription] = useState("");
  const [rollback, setRollback] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return changes.filter((item) => {
      const matchesSearch =
        !q ||
        item.id.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.component.toLowerCase().includes(q) ||
        item.requester.toLowerCase().includes(q) ||
        item.approver.toLowerCase().includes(q);

      return (
        matchesSearch &&
        (statusFilter === "All statuses" || item.status === statusFilter) &&
        (riskFilter === "All risks" || item.risk === riskFilter) &&
        (environmentFilter === "All environments" ||
          item.environment === environmentFilter)
      );
    });
  }, [changes, search, statusFilter, riskFilter, environmentFilter]);

  const pending = changes.filter(
    (item) => item.status === "Pending approval"
  ).length;
  const inProgress = changes.filter(
    (item) => item.status === "In progress"
  ).length;
  const completed = changes.filter(
    (item) => item.status === "Completed"
  ).length;
  const highRisk = changes.filter(
    (item) => item.risk === "High" || item.risk === "Critical"
  ).length;

  function notify(message: string) {
    setToast(message);
  }

  function resetCreateForm() {
    setTitle("");
    setCategory("Configuration");
    setComponent("");
    setRequester("");
    setApprover("");
    setRisk("Medium");
    setEnvironment("Staging");
    setScheduledDate("");
    setDescription("");
    setRollback("");
  }

  function createChange() {
    if (
      !title.trim() ||
      !component.trim() ||
      !requester.trim() ||
      !approver.trim() ||
      !scheduledDate ||
      !description.trim() ||
      !rollback.trim()
    ) {
      notify("Please complete all required fields.");
      return;
    }

    const record: ChangeRequest = {
      id: `CHG-${Date.now().toString().slice(-6)}`,
      title: title.trim(),
      category,
      component: component.trim(),
      requester: requester.trim(),
      approver: approver.trim(),
      risk,
      status: "Draft",
      environment,
      createdAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      scheduledDate: new Date(`${scheduledDate}T12:00:00`).toLocaleDateString(
        "en-US",
        { month: "short", day: "numeric", year: "numeric" }
      ),
      description: description.trim(),
      rollback: rollback.trim(),
    };

    setChanges((current) => [record, ...current]);
    setShowCreate(false);
    resetCreateForm();
    notify("Change request created as a draft.");
  }

  function updateStatus(id: string, status: ChangeStatus) {
    setChanges((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item))
    );
    setSelected((current) =>
      current && current.id === id ? { ...current, status } : current
    );
    notify(`Change status updated to "${status}".`);
  }

  function exportCsv() {
    const headers = [
      "ID",
      "Title",
      "Category",
      "Component",
      "Requester",
      "Approver",
      "Risk",
      "Status",
      "Environment",
      "Created",
      "Scheduled",
      "Description",
      "Rollback Plan",
    ];

    const rows = changes.map((item) => [
      item.id,
      item.title,
      item.category,
      item.component,
      item.requester,
      item.approver,
      item.risk,
      item.status,
      item.environment,
      item.createdAt,
      item.scheduledDate,
      item.description,
      item.rollback,
    ]);

    const quote = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csv = [headers, ...rows]
      .map((row) => row.map(quote).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "modelnow-change-management.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    notify("Change register exported.");
  }

  return (
    <main style={style.page}>
      <style>{`
        * { box-sizing: border-box; }
        .change-button { transition: filter .15s ease; }
        .change-button:hover { filter: brightness(.97); }
        .change-row:hover { background: #f8fafc; }
        .change-input:focus, .change-select:focus, .change-textarea:focus {
          border-color: #315fea !important;
          box-shadow: 0 0 0 3px rgba(49,95,234,.1);
        }
        @media (max-width: 600px) {
          .change-page { padding: 16px !important; }
          .change-title { font-size: 24px !important; }
          .change-header-actions { width: 100%; }
          .change-header-actions button { flex: 1; }
        }
      `}</style>

      <div className="change-page" style={style.container}>
        <div style={style.header}>
          <div>
            <div style={style.breadcrumb}>
              <GitBranch size={14} />
              <span>Governance</span>
              <ChevronRight size={13} />
              <span style={{ color: "#172033", fontWeight: 650 }}>
                Change Management
              </span>
            </div>
            <h1 className="change-title" style={style.title}>
              Change Management
            </h1>
            <p style={style.subtitle}>
              Control changes to models, AI services, policies, and production
              configurations with risk assessment, approvals, and traceable
              release records.
            </p>
          </div>

          <div
            className="change-header-actions"
            style={{ display: "flex", gap: 9, flexWrap: "wrap" }}
          >
            <button
              type="button"
              className="change-button"
              style={style.secondary}
              onClick={exportCsv}
            >
              <Download size={15} />
              Export register
            </button>
            <button
              type="button"
              className="change-button"
              style={style.primary}
              onClick={() => setShowCreate(true)}
            >
              <Plus size={16} />
              New change request
            </button>
          </div>
        </div>

        <section style={style.metrics}>
          <div style={style.metric}>
            <div style={style.metricLabel}>
              Total change requests
              <Layers3 size={17} color="#315fea" />
            </div>
            <div style={style.metricValue}>{changes.length}</div>
            <div style={style.metricNote}>
              <Activity size={12} />
              Across tracked components
            </div>
          </div>

          <div style={style.metric}>
            <div style={style.metricLabel}>
              Pending approval
              <Clock3 size={17} color="#d97706" />
            </div>
            <div style={style.metricValue}>{pending}</div>
            <div style={style.metricNote}>Awaiting an approval decision</div>
          </div>

          <div style={style.metric}>
            <div style={style.metricLabel}>
              In progress
              <RefreshCw size={17} color="#7c3aed" />
            </div>
            <div style={style.metricValue}>{inProgress}</div>
            <div style={style.metricNote}>Currently being worked on</div>
          </div>

          <div style={style.metric}>
            <div style={style.metricLabel}>
              Completed changes
              <CheckCircle2 size={17} color="#15803d" />
            </div>
            <div style={style.metricValue}>{completed}</div>
            <div style={style.metricNote}>Marked complete in the register</div>
          </div>

          <div style={style.metric}>
            <div style={style.metricLabel}>
              High / critical risk
              <AlertTriangle size={17} color="#b91c1c" />
            </div>
            <div style={style.metricValue}>{highRisk}</div>
            <div style={style.metricNote}>
              Require careful review before rollout
            </div>
          </div>
        </section>

        <section style={style.panel}>
          <div style={style.panelHeader}>
            <div>
              <h2 style={style.panelTitle}>Change request register</h2>
              <p style={style.panelSub}>
                Search, filter, inspect, and update change request records.
              </p>
            </div>
            <button
              type="button"
              className="change-button"
              style={style.secondary}
              onClick={() => {
                setSearch("");
                setStatusFilter("All statuses");
                setRiskFilter("All risks");
                setEnvironmentFilter("All environments");
              }}
            >
              <RefreshCw size={14} />
              Reset filters
            </button>
          </div>

          <div style={style.filters}>
            <div style={style.search}>
              <Search size={15} color="#94a3b8" />
              <input
                className="change-input"
                aria-label="Search change requests"
                style={style.inputSearch}
                placeholder="Search ID, title, component, owner..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              {search && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#64748b",
                    cursor: "pointer",
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <select
              className="change-select"
              aria-label="Filter by status"
              style={style.select}
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>All statuses</option>
              <option>Draft</option>
              <option>Pending approval</option>
              <option>Approved</option>
              <option>Rejected</option>
              <option>In progress</option>
              <option>Completed</option>
            </select>

            <select
              className="change-select"
              aria-label="Filter by risk"
              style={style.select}
              value={riskFilter}
              onChange={(event) => setRiskFilter(event.target.value)}
            >
              <option>All risks</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </select>

            <select
              className="change-select"
              aria-label="Filter by environment"
              style={style.select}
              value={environmentFilter}
              onChange={(event) => setEnvironmentFilter(event.target.value)}
            >
              <option>All environments</option>
              <option>Development</option>
              <option>Staging</option>
              <option>Production</option>
            </select>
          </div>

          <div style={style.tableWrap}>
            <table style={style.table}>
              <thead>
                <tr>
                  <th style={style.th}>Change request</th>
                  <th style={style.th}>Component</th>
                  <th style={style.th}>Risk</th>
                  <th style={style.th}>Environment</th>
                  <th style={style.th}>Approver</th>
                  <th style={style.th}>Status</th>
                  <th style={style.th}>Scheduled</th>
                  <th style={style.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="change-row">
                    <td style={style.td}>
                      <div style={{ minWidth: 190 }}>
                        <div
                          style={{
                            color: "#315fea",
                            fontSize: 10,
                            fontWeight: 700,
                            marginBottom: 5,
                          }}
                        >
                          {item.id}
                        </div>
                        <div style={{ fontWeight: 650 }}>{item.title}</div>
                        <div
                          style={{
                            fontSize: 10,
                            color: "#64748b",
                            marginTop: 5,
                          }}
                        >
                          {item.category} · {item.requester}
                        </div>
                      </div>
                    </td>
                    <td style={style.td}>{item.component}</td>
                    <td style={style.td}>
                      <RiskBadge risk={item.risk} />
                    </td>
                    <td style={style.td}>
                      <span
                        style={{
                          border: "1px solid #e2e8f0",
                          borderRadius: 6,
                          padding: "5px 7px",
                          fontSize: 10,
                          color: "#475569",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.environment}
                      </span>
                    </td>
                    <td style={style.td}>{item.approver}</td>
                    <td style={style.td}>
                      <StatusBadge status={item.status} />
                    </td>
                    <td style={{ ...style.td, whiteSpace: "nowrap" }}>
                      {item.scheduledDate}
                    </td>
                    <td style={style.td}>
                      <button
                        type="button"
                        className="change-button"
                        style={{ ...style.secondary, padding: "7px 10px" }}
                        onClick={() => setSelected(item)}
                      >
                        <Eye size={13} />
                        Details
                      </button>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        ...style.td,
                        textAlign: "center",
                        padding: 42,
                      }}
                    >
                      <Search
                        size={25}
                        color="#94a3b8"
                        style={{ margin: "0 auto 10px" }}
                      />
                      <div style={{ fontWeight: 650 }}>
                        No change requests found
                      </div>
                      <p style={style.muted}>
                        Try a different search or clear your filters.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div
            style={{
              padding: "13px 20px",
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
              fontSize: 11,
              color: "#64748b",
            }}
          >
            <span>
              Showing {filtered.length} of {changes.length} requests
            </span>
            <span>Local demo data · No deployment is triggered</span>
          </div>
        </section>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          <section style={style.panel}>
            <div style={style.panelHeader}>
              <div>
                <h2 style={style.panelTitle}>Approval queue</h2>
                <p style={style.panelSub}>
                  Change requests awaiting a decision.
                </p>
              </div>
              <Clock3 size={18} color="#d97706" />
            </div>
            <div style={{ padding: "8px 20px 16px" }}>
              {changes
                .filter((item) => item.status === "Pending approval")
                .map((item, index, list) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 11,
                      padding: "13px 0",
                      borderBottom:
                        index === list.length - 1
                          ? "none"
                          : "1px solid #edf0f5",
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: 9,
                        flexShrink: 0,
                        background: "#fef3c7",
                        color: "#a16207",
                      }}
                    >
                      <FileClock size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>
                        {item.title}
                      </div>
                      <p style={{ ...style.muted, margin: "5px 0" }}>
                        {item.id} · Approver: {item.approver}
                      </p>
                      <RiskBadge risk={item.risk} />
                    </div>
                    <button
                      type="button"
                      aria-label={`Review ${item.id}`}
                      onClick={() => setSelected(item)}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "#64748b",
                        cursor: "pointer",
                      }}
                    >
                      <ChevronRight size={17} />
                    </button>
                  </div>
                ))}

              {pending === 0 && (
                <p style={style.muted}>No requests are awaiting approval.</p>
              )}
            </div>
          </section>

          <section style={style.panel}>
            <div style={style.panelHeader}>
              <div>
                <h2 style={style.panelTitle}>Change lifecycle</h2>
                <p style={style.panelSub}>
                  A recommended controlled change process.
                </p>
              </div>
              <GitBranch size={18} color="#315fea" />
            </div>
            <div style={{ padding: "8px 20px 16px" }}>
              {[
                {
                  name: "1. Request",
                  text: "Describe the change, owner, scope, and rollback plan.",
                },
                {
                  name: "2. Assess risk",
                  text: "Evaluate impact, dependencies, and security implications.",
                },
                {
                  name: "3. Review and approve",
                  text: "Obtain the required approval before production rollout.",
                },
                {
                  name: "4. Deploy and verify",
                  text: "Validate outcomes, monitor the release, and record evidence.",
                },
              ].map((item, index, list) => (
                <div
                  key={item.name}
                  style={{
                    padding: "13px 0",
                    borderBottom:
                      index === list.length - 1
                        ? "none"
                        : "1px solid #edf0f5",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700 }}>
                    {item.name}
                  </div>
                  <p style={{ ...style.muted, margin: "5px 0 0" }}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 9,
            padding: "14px 16px",
            background: "#eff6ff",
            border: "1px solid #dbeafe",
            borderRadius: 10,
            color: "#1e40af",
            fontSize: 11,
            lineHeight: 1.7,
          }}
        >
          <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <strong>Governance reminder:</strong> Production changes should
            have a documented risk assessment, authorized approval, testing
            evidence, a rollback plan, and post-deployment verification. This
            page is a frontend prototype; status changes do not trigger real
            approvals or deployments.
          </div>
        </div>
      </div>

      {showCreate && (
        <div
          style={style.modalOverlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowCreate(false);
          }}
        >
          <div
            style={style.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-change-title"
          >
            <div style={style.modalHeader}>
              <div>
                <h2
                  id="create-change-title"
                  style={{ ...style.panelTitle, fontSize: 17 }}
                >
                  New change request
                </h2>
                <p style={style.panelSub}>
                  Record the change scope and approval details.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setShowCreate(false)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#64748b",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={style.modalBody}>
              <div>
                <label style={style.label} htmlFor="change-title">
                  Change title *
                </label>
                <input
                  id="change-title"
                  className="change-input"
                  style={style.field}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Describe the proposed change"
                  autoFocus
                />
              </div>

              <div>
                <label style={style.label} htmlFor="change-category">
                  Change category *
                </label>
                <select
                  id="change-category"
                  className="change-select"
                  style={style.field}
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  <option>Configuration</option>
                  <option>Model update</option>
                  <option>Model routing</option>
                  <option>Policy update</option>
                  <option>Security</option>
                  <option>Monitoring</option>
                  <option>Infrastructure</option>
                  <option>Data pipeline</option>
                </select>
              </div>

              <div>
                <label style={style.label} htmlFor="change-component">
                  Affected component *
                </label>
                <input
                  id="change-component"
                  className="change-input"
                  style={style.field}
                  value={component}
                  onChange={(event) => setComponent(event.target.value)}
                  placeholder="e.g. AI Gateway"
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                <div>
                  <label style={style.label} htmlFor="change-requester">
                    Requesting team *
                  </label>
                  <input
                    id="change-requester"
                    className="change-input"
                    style={style.field}
                    value={requester}
                    onChange={(event) => setRequester(event.target.value)}
                    placeholder="Team or owner"
                  />
                </div>
                <div>
                  <label style={style.label} htmlFor="change-approver">
                    Approver *
                  </label>
                  <input
                    id="change-approver"
                    className="change-input"
                    style={style.field}
                    value={approver}
                    onChange={(event) => setApprover(event.target.value)}
                    placeholder="Approver role or team"
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                <div>
                  <label style={style.label} htmlFor="change-risk">
                    Risk level *
                  </label>
                  <select
                    id="change-risk"
                    className="change-select"
                    style={style.field}
                    value={risk}
                    onChange={(event) =>
                      setRisk(event.target.value as RiskLevel)
                    }
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </div>
                <div>
                  <label style={style.label} htmlFor="change-environment">
                    Environment *
                  </label>
                  <select
                    id="change-environment"
                    className="change-select"
                    style={style.field}
                    value={environment}
                    onChange={(event) => setEnvironment(event.target.value)}
                  >
                    <option>Development</option>
                    <option>Staging</option>
                    <option>Production</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={style.label} htmlFor="change-date">
                  Planned date *
                </label>
                <input
                  id="change-date"
                  className="change-input"
                  style={style.field}
                  type="date"
                  value={scheduledDate}
                  onChange={(event) => setScheduledDate(event.target.value)}
                />
              </div>

              <div>
                <label style={style.label} htmlFor="change-description">
                  Change description and impact *
                </label>
                <textarea
                  id="change-description"
                  className="change-textarea"
                  style={{ ...style.field, minHeight: 82, resize: "vertical" }}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Explain what will change and its expected impact..."
                />
              </div>

              <div>
                <label style={style.label} htmlFor="change-rollback">
                  Rollback plan *
                </label>
                <textarea
                  id="change-rollback"
                  className="change-textarea"
                  style={{ ...style.field, minHeight: 75, resize: "vertical" }}
                  value={rollback}
                  onChange={(event) => setRollback(event.target.value)}
                  placeholder="Describe how the previous state can be restored..."
                />
              </div>

              <p style={{ ...style.muted, margin: 0 }}>
                New requests are created as drafts. Submit them for approval
                through your configured governance workflow.
              </p>
            </div>

            <div style={style.modalFooter}>
              <button
                type="button"
                className="change-button"
                style={style.secondary}
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="change-button"
                style={style.primary}
                onClick={createChange}
              >
                <Plus size={15} />
                Create draft
              </button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div
          style={style.modalOverlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <div
            style={style.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="change-detail-title"
          >
            <div style={style.modalHeader}>
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 750,
                    color: "#315fea",
                    marginBottom: 5,
                  }}
                >
                  {selected.id}
                </div>
                <h2
                  id="change-detail-title"
                  style={{ ...style.panelTitle, fontSize: 17 }}
                >
                  {selected.title}
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close details"
                onClick={() => setSelected(null)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#64748b",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={style.modalBody}>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <StatusBadge status={selected.status} />
                <RiskBadge risk={selected.risk} />
                <span
                  style={{
                    ...style.badge,
                    color: "#475569",
                    background: "#f1f5f9",
                  }}
                >
                  {selected.environment}
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                {[
                  ["Category", selected.category],
                  ["Component", selected.component],
                  ["Requester", selected.requester],
                  ["Approver", selected.approver],
                  ["Created", selected.createdAt],
                  ["Planned date", selected.scheduledDate],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      padding: 12,
                      border: "1px solid #e6eaf0",
                      borderRadius: 9,
                      minWidth: 0,
                    }}
                  >
                    <div style={style.muted}>{label}</div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 650,
                        marginTop: 5,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <div style={style.label}>Change description</div>
                <p style={{ ...style.muted, margin: 0 }}>
                  {selected.description}
                </p>
              </div>

              <div>
                <div style={style.label}>Rollback plan</div>
                <p style={{ ...style.muted, margin: 0 }}>
                  {selected.rollback}
                </p>
              </div>

              <div>
                <label style={style.label} htmlFor="change-status-update">
                  Update change status
                </label>
                <select
                  id="change-status-update"
                  className="change-select"
                  style={style.field}
                  value={selected.status}
                  onChange={(event) =>
                    updateStatus(
                      selected.id,
                      event.target.value as ChangeStatus
                    )
                  }
                >
                  <option>Draft</option>
                  <option>Pending approval</option>
                  <option>Approved</option>
                  <option>Rejected</option>
                  <option>In progress</option>
                  <option>Completed</option>
                </select>
                <p style={{ ...style.muted, margin: "7px 0 0" }}>
                  This updates the local record only. It does not verify
                  permissions, collect an actual approval, or deploy software.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 9,
                  background: "#f8fafc",
                  border: "1px solid #e6eaf0",
                  borderRadius: 9,
                  padding: 12,
                }}
              >
                <History
                  size={16}
                  color="#64748b"
                  style={{ flexShrink: 0, marginTop: 1 }}
                />
                <div style={style.muted}>
                  Created {selected.createdAt}. A production implementation
                  should keep an immutable history of status changes, reviewer
                  identity, timestamps, and deployment evidence.
                </div>
              </div>
            </div>

            <div style={style.modalFooter}>
              <button
                type="button"
                className="change-button"
                style={style.secondary}
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          role="status"
          style={{
            position: "fixed",
            bottom: 22,
            right: 22,
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            gap: 10,
            maxWidth: "calc(100vw - 32px)",
            padding: "13px 16px",
            borderRadius: 10,
            background: "#172033",
            color: "#fff",
            boxShadow: "0 8px 30px rgba(15,23,42,.2)",
            fontSize: 12,
          }}
        >
          <CheckCircle2 size={17} color="#86efac" />
          <span>{toast}</span>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
            style={{
              border: "none",
              background: "transparent",
              color: "#cbd5e1",
              cursor: "pointer",
              padding: 2,
            }}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </main>
  );
}
