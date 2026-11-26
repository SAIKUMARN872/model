
"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronDown,
  Eye,
  FileCheck2,
  Fingerprint,
  HeartHandshake,
  LockKeyhole,
  MoreHorizontal,
  Plus,
  Scale,
  Search,
  Shield,
  ShieldAlert,
  Sparkles,
  Users,
  X,
} from "lucide-react";

type Status = "Compliant" | "Needs review" | "At risk";
type Principle =
  | "Fairness"
  | "Transparency"
  | "Accountability"
  | "Privacy"
  | "Human oversight"
  | "Safety";

type Assessment = {
  id: number;
  name: string;
  category: Principle;
  owner: string;
  description: string;
  status: Status;
  score: number;
  lastReviewed: string;
  findings: number;
};

const initialAssessments: Assessment[] = [
  {
    id: 1,
    name: "Model Bias Assessment",
    category: "Fairness",
    owner: "AI Research",
    description:
      "Evaluate model outputs for potential bias across demographic groups and user segments.",
    status: "Needs review",
    score: 82,
    lastReviewed: "Oct 28, 2026",
    findings: 3,
  },
  {
    id: 2,
    name: "Model Explainability Review",
    category: "Transparency",
    owner: "ML Platform",
    description:
      "Check whether model decisions, limitations, and confidence signals are documented and explainable.",
    status: "Compliant",
    score: 94,
    lastReviewed: "Oct 30, 2026",
    findings: 0,
  },
  {
    id: 3,
    name: "Human Oversight Controls",
    category: "Human oversight",
    owner: "AI Operations",
    description:
      "Verify escalation paths, human approval gates, and intervention mechanisms for high-impact actions.",
    status: "Compliant",
    score: 96,
    lastReviewed: "Nov 1, 2026",
    findings: 0,
  },
  {
    id: 4,
    name: "AI Data Privacy Review",
    category: "Privacy",
    owner: "Security Team",
    description:
      "Review sensitive data handling, data minimization, retention practices, and access restrictions.",
    status: "At risk",
    score: 68,
    lastReviewed: "Oct 25, 2026",
    findings: 5,
  },
  {
    id: 5,
    name: "AI Accountability Framework",
    category: "Accountability",
    owner: "Governance Team",
    description:
      "Confirm named owners, documented responsibilities, escalation procedures, and review records.",
    status: "Needs review",
    score: 85,
    lastReviewed: "Oct 29, 2026",
    findings: 2,
  },
  {
    id: 6,
    name: "Model Safety Evaluation",
    category: "Safety",
    owner: "Trust & Safety",
    description:
      "Assess harmful output risks, prompt injection resistance, refusal behavior, and abuse scenarios.",
    status: "Compliant",
    score: 91,
    lastReviewed: "Nov 2, 2026",
    findings: 1,
  },
];

const principles: {
  name: Principle;
  description: string;
  icon: typeof Scale;
  color: string;
  background: string;
}[] = [
  {
    name: "Fairness",
    description: "Bias detection and equitable outcomes",
    icon: Scale,
    color: "#7c3aed",
    background: "#f3e8ff",
  },
  {
    name: "Transparency",
    description: "Explainability and clear disclosures",
    icon: Eye,
    color: "#2563eb",
    background: "#dbeafe",
  },
  {
    name: "Accountability",
    description: "Ownership and traceable decisions",
    icon: Fingerprint,
    color: "#0f766e",
    background: "#ccfbf1",
  },
  {
    name: "Privacy",
    description: "Data protection and minimization",
    icon: LockKeyhole,
    color: "#c2410c",
    background: "#ffedd5",
  },
  {
    name: "Human oversight",
    description: "Human review and intervention",
    icon: Users,
    color: "#0369a1",
    background: "#e0f2fe",
  },
  {
    name: "Safety",
    description: "Risk prevention and safe outputs",
    icon: Shield,
    color: "#15803d",
    background: "#dcfce7",
  },
];

const initialChecklist = [
  "Document intended use and known limitations",
  "Review potential bias and discriminatory outcomes",
  "Verify data privacy and access restrictions",
  "Test safety, abuse, and misuse scenarios",
  "Define human escalation and intervention paths",
  "Record accountable owner and review evidence",
];

const statusColors: Record<Status, { color: string; background: string }> = {
  Compliant: { color: "#15803d", background: "#dcfce7" },
  "Needs review": { color: "#a16207", background: "#fef3c7" },
  "At risk": { color: "#b91c1c", background: "#fee2e2" },
};

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    color: "#172033",
    padding: "28px",
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  container: {
    maxWidth: 1500,
    margin: "0 auto",
  },
  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 26,
  },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#64748b",
    fontSize: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 29,
    lineHeight: 1.25,
    fontWeight: 750,
    letterSpacing: "-0.8px",
    margin: 0,
  },
  subtitle: {
    color: "#64748b",
    fontSize: 14,
    lineHeight: 1.7,
    margin: "9px 0 0",
    maxWidth: 730,
  },
  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    border: "1px solid #315fea",
    background: "#315fea",
    color: "#fff",
    borderRadius: 9,
    padding: "11px 15px",
    fontSize: 13,
    fontWeight: 650,
    cursor: "pointer",
  },
  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    border: "1px solid #dbe2ec",
    background: "#fff",
    color: "#334155",
    borderRadius: 9,
    padding: "10px 13px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  metrics: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: 15,
    marginBottom: 22,
  },
  metricCard: {
    background: "#fff",
    border: "1px solid #e6eaf0",
    borderRadius: 13,
    padding: 19,
    minWidth: 0,
  },
  metricTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    color: "#64748b",
    fontSize: 12,
    fontWeight: 550,
  },
  metricValue: {
    fontSize: 29,
    fontWeight: 750,
    letterSpacing: "-0.8px",
    marginTop: 15,
    color: "#172033",
  },
  metricFoot: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 8,
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  panel: {
    background: "#fff",
    border: "1px solid #e6eaf0",
    borderRadius: 13,
    marginBottom: 21,
    overflow: "hidden",
  },
  panelHeader: {
    padding: "19px 21px",
    borderBottom: "1px solid #edf0f5",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: 700,
    margin: 0,
  },
  panelDescription: {
    fontSize: 12,
    color: "#64748b",
    margin: "5px 0 0",
    lineHeight: 1.6,
  },
  principlesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: 13,
    padding: 20,
  },
  principleCard: {
    border: "1px solid #e6eaf0",
    borderRadius: 11,
    padding: 16,
    background: "#fff",
    textAlign: "left",
    cursor: "pointer",
    minWidth: 0,
  },
  principleIcon: {
    width: 39,
    height: 39,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    marginBottom: 13,
  },
  principleName: {
    fontSize: 13,
    fontWeight: 700,
    margin: "0 0 6px",
  },
  principleDescription: {
    fontSize: 11,
    color: "#64748b",
    lineHeight: 1.6,
    minHeight: 34,
    margin: 0,
  },
  progressTrack: {
    height: 6,
    background: "#edf1f6",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 14,
  },
  filters: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    padding: "16px 21px",
    borderBottom: "1px solid #edf0f5",
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid #dbe2ec",
    borderRadius: 8,
    padding: "0 11px",
    minWidth: 220,
    flex: "1 1 240px",
    background: "#fff",
  },
  searchInput: {
    border: "none",
    outline: "none",
    width: "100%",
    padding: "10px 0",
    fontSize: 12,
    color: "#172033",
    background: "transparent",
  },
  select: {
    padding: "10px 12px",
    border: "1px solid #dbe2ec",
    borderRadius: 8,
    background: "#fff",
    fontSize: 12,
    color: "#334155",
    outline: "none",
    maxWidth: "100%",
  },
  tableWrap: {
    width: "100%",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    minWidth: 850,
  },
  th: {
    padding: "12px 19px",
    background: "#f8fafc",
    color: "#64748b",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.65px",
    fontWeight: 700,
    borderBottom: "1px solid #e6eaf0",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "15px 19px",
    borderBottom: "1px solid #edf0f5",
    fontSize: 12,
    verticalAlign: "middle",
  },
  status: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "5px 9px",
    borderRadius: 20,
    fontSize: 10,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  lowerGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
    gap: 20,
  },
  contentPad: {
    padding: 21,
  },
  alertItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: "13px 0",
    borderBottom: "1px solid #edf0f5",
  },
  alertIcon: {
    width: 34,
    height: 34,
    flexShrink: 0,
    borderRadius: 9,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  muted: {
    color: "#64748b",
    fontSize: 11,
    lineHeight: 1.65,
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.52)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 1000,
    overflowY: "auto",
  },
  modal: {
    width: "100%",
    maxWidth: 590,
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: 15,
    boxShadow: "0 24px 70px rgba(15,23,42,.25)",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 23px",
    borderBottom: "1px solid #e9edf3",
  },
  modalBody: {
    padding: 23,
    display: "grid",
    gap: 16,
  },
  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 650,
    color: "#334155",
    marginBottom: 7,
  },
  field: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #dbe2ec",
    borderRadius: 8,
    padding: "11px 12px",
    background: "#fff",
    color: "#172033",
    fontSize: 12,
    outline: "none",
  },
  modalFooter: {
    padding: "16px 23px",
    display: "flex",
    justifyContent: "flex-end",
    gap: 9,
    borderTop: "1px solid #e9edf3",
  },
};

function StatusBadge({ status }: { status: Status }) {
  const theme = statusColors[status];

  return (
    <span
      style={{
        ...styles.status,
        color: theme.color,
        background: theme.background,
      }}
    >
      {status === "Compliant" ? (
        <CheckCircle2 size={12} />
      ) : status === "At risk" ? (
        <AlertTriangle size={12} />
      ) : (
        <Activity size={12} />
      )}
      {status}
    </span>
  );
}

function ProgressBar({
  value,
  color = "#315fea",
}: {
  value: number;
  color?: string;
}) {
  return (
    <div style={styles.progressTrack}>
      <div
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          height: "100%",
          borderRadius: 10,
          background: color,
          transition: "width .2s ease",
        }}
      />
    </div>
  );
}

export default function ResponsibleAIPage() {
  const [assessments, setAssessments] =
    useState<Assessment[]>(initialAssessments);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [principleFilter, setPrincipleFilter] = useState("All principles");
  const [selected, setSelected] = useState<Assessment | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState<Principle>("Fairness");
  const [newOwner, setNewOwner] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newStatus, setNewStatus] = useState<Status>("Needs review");

  const total = assessments.length;
  const compliant = assessments.filter(
    (item) => item.status === "Compliant"
  ).length;
  const atRisk = assessments.filter(
    (item) => item.status === "At risk"
  ).length;
  const averageScore = total
    ? Math.round(
        assessments.reduce((sum, item) => sum + item.score, 0) / total
      )
    : 0;
  const openFindings = assessments.reduce(
    (sum, item) => sum + item.findings,
    0
  );

  const filteredAssessments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return assessments.filter((item) => {
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.owner.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All statuses" || item.status === statusFilter;

      const matchesPrinciple =
        principleFilter === "All principles" ||
        item.category === principleFilter;

      return matchesSearch && matchesStatus && matchesPrinciple;
    });
  }, [assessments, search, statusFilter, principleFilter]);

  function showMessage(message: string) {
    setToast(message);
  }

  function resetCreateForm() {
    setNewName("");
    setNewCategory("Fairness");
    setNewOwner("");
    setNewDescription("");
    setNewStatus("Needs review");
  }

  function createAssessment() {
    if (!newName.trim() || !newOwner.trim() || !newDescription.trim()) {
      showMessage("Please complete all assessment fields.");
      return;
    }

    const newAssessment: Assessment = {
      id: Date.now(),
      name: newName.trim(),
      category: newCategory,
      owner: newOwner.trim(),
      description: newDescription.trim(),
      status: newStatus,
      score: 0,
      lastReviewed: "Not reviewed",
      findings: 0,
    };

    setAssessments((current) => [newAssessment, ...current]);
    setShowCreate(false);
    resetCreateForm();
    showMessage("Responsible AI assessment created.");
  }

  function updateStatus(id: number, status: Status) {
    setAssessments((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              lastReviewed: new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
            }
          : item
      )
    );

    setSelected((current) =>
      current && current.id === id
        ? {
            ...current,
            status,
            lastReviewed: new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
          }
        : current
    );

    showMessage(`Assessment status updated to "${status}".`);
  }

  function toggleChecklistItem(item: string) {
    setCheckedItems((current) =>
      current.includes(item)
        ? current.filter((entry) => entry !== item)
        : [...current, item]
    );
  }

  function exportAssessments() {
    const headers = [
      "Assessment",
      "Principle",
      "Owner",
      "Status",
      "Score",
      "Findings",
      "Last Reviewed",
      "Description",
    ];

    const rows = assessments.map((item) => [
      item.name,
      item.category,
      item.owner,
      item.status,
      String(item.score),
      String(item.findings),
      item.lastReviewed,
      item.description,
    ]);

    const csvCell = (value: string) =>
      `"${value.replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "modelnow-responsible-ai-assessments.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    showMessage("Assessment report exported.");
  }

  return (
    <main style={styles.page}>
      <style>{`
        * { box-sizing: border-box; }
        .rai-button { transition: background .15s ease, border-color .15s ease, transform .15s ease; }
        .rai-button:hover { filter: brightness(.97); }
        .rai-row:hover { background: #f8fafc; }
        .rai-principle:hover { border-color: #b7c8ff !important; transform: translateY(-1px); }
        .rai-input:focus, .rai-select:focus, .rai-textarea:focus { border-color: #315fea !important; box-shadow: 0 0 0 3px rgba(49,95,234,.10); }
        @media (max-width: 600px) {
          .rai-page { padding: 16px !important; }
          .rai-title { font-size: 24px !important; }
          .rai-top-actions { width: 100%; }
          .rai-top-actions button { flex: 1; }
        }
      `}</style>

      <div className="rai-page" style={styles.container}>
        <div style={styles.topbar}>
          <div>
            <div style={styles.breadcrumb}>
              <Shield size={14} />
              <span>Governance</span>
              <span>/</span>
              <span style={{ color: "#172033", fontWeight: 650 }}>
                Responsible AI
              </span>
            </div>

            <h1 className="rai-title" style={styles.title}>
              Responsible AI
            </h1>

            <p style={styles.subtitle}>
              Monitor fairness, transparency, accountability, privacy, and
              safety across your AI systems. Track assessments and support
              responsible AI practices from one workspace.
            </p>
          </div>

          <div
            className="rai-top-actions"
            style={{ display: "flex", gap: 9, flexWrap: "wrap" }}
          >
            <button
              type="button"
              className="rai-button"
              style={styles.secondaryButton}
              onClick={exportAssessments}
            >
              <FileCheck2 size={15} />
              Export report
            </button>

            <button
              type="button"
              className="rai-button"
              style={styles.primaryButton}
              onClick={() => {
                resetCreateForm();
                setShowCreate(true);
              }}
            >
              <Plus size={16} />
              New assessment
            </button>
          </div>
        </div>

        <section style={styles.metrics}>
          <div style={styles.metricCard}>
            <div style={styles.metricTop}>
              Total assessments
              <span
                style={{
                  width: 34,
                  height: 34,
                  display: "grid",
                  placeItems: "center",
                  background: "#e0e7ff",
                  color: "#4338ca",
                  borderRadius: 9,
                }}
              >
                <BrainCircuit size={17} />
              </span>
            </div>
            <div style={styles.metricValue}>{total}</div>
            <div style={styles.metricFoot}>
              <Activity size={12} />
              Across {principles.length} principles
            </div>
          </div>

          <div style={styles.metricCard}>
            <div style={styles.metricTop}>
              Responsible AI score
              <span
                style={{
                  width: 34,
                  height: 34,
                  display: "grid",
                  placeItems: "center",
                  background: "#dcfce7",
                  color: "#15803d",
                  borderRadius: 9,
                }}
              >
                <HeartHandshake size={17} />
              </span>
            </div>
            <div style={styles.metricValue}>
              {averageScore}
              <span style={{ fontSize: 15, color: "#64748b" }}>/100</span>
            </div>
            <ProgressBar value={averageScore} color="#16a34a" />
            <div style={styles.metricFoot}>
              Average of recorded assessment scores
            </div>
          </div>

          <div style={styles.metricCard}>
            <div style={styles.metricTop}>
              Compliant assessments
              <span
                style={{
                  width: 34,
                  height: 34,
                  display: "grid",
                  placeItems: "center",
                  background: "#d1fae5",
                  color: "#047857",
                  borderRadius: 9,
                }}
              >
                <CheckCircle2 size={17} />
              </span>
            </div>
            <div style={styles.metricValue}>
              {compliant}
              <span style={{ fontSize: 15, color: "#64748b" }}>
                {" "}
                / {total}
              </span>
            </div>
            <div style={styles.metricFoot}>
              <ArrowUpRight size={13} color="#16a34a" />
              {total ? Math.round((compliant / total) * 100) : 0}% currently
              marked compliant
            </div>
          </div>

          <div style={styles.metricCard}>
            <div style={styles.metricTop}>
              Open findings
              <span
                style={{
                  width: 34,
                  height: 34,
                  display: "grid",
                  placeItems: "center",
                  background: "#fee2e2",
                  color: "#b91c1c",
                  borderRadius: 9,
                }}
              >
                <ShieldAlert size={17} />
              </span>
            </div>
            <div style={styles.metricValue}>{openFindings}</div>
            <div style={styles.metricFoot}>
              <ArrowDownRight size={13} color="#dc2626" />
              {atRisk} assessments currently marked at risk
            </div>
          </div>
        </section>

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <h2 style={styles.panelTitle}>Responsible AI principles</h2>
              <p style={styles.panelDescription}>
                Select a principle to view its assessments.
              </p>
            </div>
            <span style={{ ...styles.muted, whiteSpace: "nowrap" }}>
              {principles.length} principles
            </span>
          </div>

          <div style={styles.principlesGrid}>
            {principles.map((principle) => {
              const Icon = principle.icon;
              const related = assessments.filter(
                (item) => item.category === principle.name
              );
              const score = related.length
                ? Math.round(
                    related.reduce((sum, item) => sum + item.score, 0) /
                      related.length
                  )
                : 0;
              const isSelected = principleFilter === principle.name;

              return (
                <button
                  key={principle.name}
                  type="button"
                  className="rai-principle"
                  style={{
                    ...styles.principleCard,
                    borderColor: isSelected ? "#315fea" : "#e6eaf0",
                    background: isSelected ? "#f8faff" : "#fff",
                  }}
                  onClick={() => {
                    setPrincipleFilter((current) =>
                      current === principle.name
                        ? "All principles"
                        : principle.name
                    );
                  }}
                >
                  <div
                    style={{
                      ...styles.principleIcon,
                      background: principle.background,
                      color: principle.color,
                    }}
                  >
                    <Icon size={19} />
                  </div>
                  <p style={styles.principleName}>{principle.name}</p>
                  <p style={styles.principleDescription}>
                    {principle.description}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 13,
                      fontSize: 11,
                    }}
                  >
                    <span style={{ color: "#64748b" }}>
                      {related.length} assessment
                      {related.length === 1 ? "" : "s"}
                    </span>
                    <strong style={{ color: principle.color }}>
                      {score}/100
                    </strong>
                  </div>
                  <ProgressBar value={score} color={principle.color} />
                </button>
              );
            })}
          </div>
        </section>

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <h2 style={styles.panelTitle}>Assessment register</h2>
              <p style={styles.panelDescription}>
                Search, review, and update the status of responsible AI
                assessments.
              </p>
            </div>
            <button
              type="button"
              className="rai-button"
              style={styles.secondaryButton}
              onClick={() => setShowChecklist(true)}
            >
              <CheckCircle2 size={14} />
              Review checklist
            </button>
          </div>

          <div style={styles.filters}>
            <div style={styles.searchWrap}>
              <Search size={15} color="#94a3b8" />
              <input
                aria-label="Search assessments"
                className="rai-input"
                style={styles.searchInput}
                placeholder="Search assessments, owners..."
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
                    cursor: "pointer",
                    color: "#64748b",
                    padding: 3,
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div style={{ position: "relative" }}>
              <select
                aria-label="Filter by status"
                className="rai-select"
                style={styles.select}
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option>All statuses</option>
                <option>Compliant</option>
                <option>Needs review</option>
                <option>At risk</option>
              </select>
            </div>

            <div style={{ position: "relative" }}>
              <select
                aria-label="Filter by principle"
                className="rai-select"
                style={styles.select}
                value={principleFilter}
                onChange={(event) => setPrincipleFilter(event.target.value)}
              >
                <option>All principles</option>
                {principles.map((principle) => (
                  <option key={principle.name}>{principle.name}</option>
                ))}
              </select>
            </div>

            {(search ||
              statusFilter !== "All statuses" ||
              principleFilter !== "All principles") && (
              <button
                type="button"
                className="rai-button"
                style={styles.secondaryButton}
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All statuses");
                  setPrincipleFilter("All principles");
                }}
              >
                <X size={13} />
                Clear filters
              </button>
            )}
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Assessment</th>
                  <th style={styles.th}>Principle</th>
                  <th style={styles.th}>Owner</th>
                  <th style={styles.th}>Score</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Findings</th>
                  <th style={styles.th}>Last reviewed</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssessments.map((item) => {
                  const principle = principles.find(
                    (entry) => entry.name === item.category
                  );
                  const Icon = principle?.icon ?? Shield;

                  return (
                    <tr key={item.id} className="rai-row">
                      <td style={styles.td}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            minWidth: 205,
                          }}
                        >
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              display: "grid",
                              placeItems: "center",
                              flexShrink: 0,
                              borderRadius: 9,
                              background: principle?.background ?? "#f1f5f9",
                              color: principle?.color ?? "#475569",
                            }}
                          >
                            <Icon size={16} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 650, color: "#172033" }}>
                              {item.name}
                            </div>
                            <div
                              style={{
                                fontSize: 10,
                                color: "#64748b",
                                marginTop: 4,
                                maxWidth: 230,
                                lineHeight: 1.5,
                              }}
                            >
                              {item.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={{ color: principle?.color, fontWeight: 600 }}>
                          {item.category}
                        </span>
                      </td>
                      <td style={styles.td}>{item.owner}</td>
                      <td style={styles.td}>
                        <div style={{ minWidth: 72 }}>
                          <strong>{item.score}</strong>
                          <span style={{ color: "#94a3b8" }}>/100</span>
                          <ProgressBar
                            value={item.score}
                            color={
                              item.score >= 90
                                ? "#16a34a"
                                : item.score >= 75
                                  ? "#d97706"
                                  : "#dc2626"
                            }
                          />
                        </div>
                      </td>
                      <td style={styles.td}>
                        <StatusBadge status={item.status} />
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            fontWeight: 700,
                            color: item.findings ? "#b91c1c" : "#15803d",
                          }}
                        >
                          {item.findings}
                        </span>
                      </td>
                      <td
                        style={{
                          ...styles.td,
                          color: "#64748b",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.lastReviewed}
                      </td>
                      <td style={styles.td}>
                        <button
                          type="button"
                          className="rai-button"
                          style={{
                            ...styles.secondaryButton,
                            padding: "7px 10px",
                          }}
                          onClick={() => setSelected(item)}
                        >
                          <Eye size={13} />
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredAssessments.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        ...styles.td,
                        textAlign: "center",
                        padding: "42px 20px",
                      }}
                    >
                      <Search
                        size={25}
                        color="#94a3b8"
                        style={{ margin: "0 auto 10px" }}
                      />
                      <div style={{ fontWeight: 650 }}>
                        No assessments found
                      </div>
                      <p style={styles.muted}>
                        Try changing your search or filters.
                      </p>
                      <button
                        type="button"
                        style={styles.secondaryButton}
                        onClick={() => {
                          setSearch("");
                          setStatusFilter("All statuses");
                          setPrincipleFilter("All principles");
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
              padding: "13px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
              fontSize: 11,
              color: "#64748b",
            }}
          >
            <span>
              Showing {filteredAssessments.length} of {assessments.length}{" "}
              assessments
            </span>
            <span>Scores and statuses reflect local demo records.</span>
          </div>
        </section>

        <div style={styles.lowerGrid}>
          <section style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <h2 style={styles.panelTitle}>Priority attention</h2>
                <p style={styles.panelDescription}>
                  Assessments requiring additional review.
                </p>
              </div>
              <AlertTriangle size={18} color="#d97706" />
            </div>

            <div style={styles.contentPad}>
              {assessments
                .filter((item) => item.status !== "Compliant")
                .sort((a, b) => {
                  if (a.status === "At risk" && b.status !== "At risk") return -1;
                  if (b.status === "At risk" && a.status !== "At risk") return 1;
                  return b.findings - a.findings;
                })
                .slice(0, 4)
                .map((item, index, list) => (
                  <div
                    key={item.id}
                    style={{
                      ...styles.alertItem,
                      borderBottom:
                        index === list.length - 1 ? "none" : styles.alertItem.borderBottom,
                    }}
                  >
                    <div
                      style={{
                        ...styles.alertIcon,
                        background:
                          item.status === "At risk" ? "#fee2e2" : "#fef3c7",
                        color: item.status === "At risk" ? "#b91c1c" : "#a16207",
                      }}
                    >
                      <AlertTriangle size={16} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>
                        {item.name}
                      </div>
                      <div style={{ ...styles.muted, marginTop: 4 }}>
                        {item.findings} finding{item.findings === 1 ? "" : "s"}{" "}
                        · {item.owner}
                      </div>
                      <div style={{ marginTop: 7 }}>
                        <StatusBadge status={item.status} />
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label={`Review ${item.name}`}
                      onClick={() => setSelected(item)}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "#64748b",
                        cursor: "pointer",
                        padding: 5,
                      }}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                ))}

              {assessments.every((item) => item.status === "Compliant") && (
                <p style={styles.muted}>
                  No assessments currently require additional review.
                </p>
              )}
            </div>
          </section>

          <section style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <h2 style={styles.panelTitle}>Responsible AI framework</h2>
                <p style={styles.panelDescription}>
                  Suggested review activities for your AI lifecycle.
                </p>
              </div>
              <Sparkles size={18} color="#315fea" />
            </div>

            <div style={styles.contentPad}>
              {[
                {
                  title: "Before deployment",
                  detail:
                    "Document intended use, evaluate risks, and test model behavior.",
                  color: "#315fea",
                },
                {
                  title: "During operation",
                  detail:
                    "Monitor outputs, investigate incidents, and review changes.",
                  color: "#0f766e",
                },
                {
                  title: "Continuous improvement",
                  detail:
                    "Reassess bias, refresh evidence, and track corrective actions.",
                  color: "#7c3aed",
                },
              ].map((item, index) => (
                <div
                  key={item.title}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "12px 0",
                    borderBottom:
                      index === 2 ? "none" : "1px solid #edf0f5",
                  }}
                >
                  <div
                    style={{
                      width: 29,
                      height: 29,
                      borderRadius: 8,
                      background: `${item.color}15`,
                      color: item.color,
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                      fontSize: 12,
                      fontWeight: 750,
                    }}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>
                      {item.title}
                    </div>
                    <p style={{ ...styles.muted, margin: "5px 0 0" }}>
                      {item.detail}
                    </p>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="rai-button"
                style={{
                  ...styles.secondaryButton,
                  width: "100%",
                  marginTop: 13,
                }}
                onClick={() => setShowChecklist(true)}
              >
                <FileCheck2 size={14} />
                Open review checklist
              </button>
            </div>
          </section>
        </div>

        <div
          style={{
            display: "flex",
            gap: 9,
            alignItems: "flex-start",
            padding: "14px 16px",
            background: "#eff6ff",
            border: "1px solid #dbeafe",
            borderRadius: 10,
            color: "#1e40af",
            fontSize: 11,
            lineHeight: 1.7,
            marginTop: 4,
          }}
        >
          <Shield size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <strong>Governance note:</strong> These principles and checks are
            intended to support your responsible AI review process. The demo
            scores and statuses are illustrative and do not establish
            regulatory compliance, certification, or a formal AI risk
            assessment.
          </div>
        </div>
      </div>

      {showCreate && (
        <div
          style={styles.modalOverlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowCreate(false);
          }}
        >
          <div
            style={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-assessment-title"
          >
            <div style={styles.modalHeader}>
              <div>
                <h2
                  id="create-assessment-title"
                  style={{ ...styles.panelTitle, fontSize: 17 }}
                >
                  New Responsible AI assessment
                </h2>
                <p style={styles.panelDescription}>
                  Add an assessment to the governance register.
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

            <div style={styles.modalBody}>
              <div>
                <label style={styles.label} htmlFor="rai-name">
                  Assessment name *
                </label>
                <input
                  id="rai-name"
                  className="rai-input"
                  style={styles.field}
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                  placeholder="e.g. Customer Support Model Fairness"
                  autoFocus
                />
              </div>

              <div>
                <label style={styles.label} htmlFor="rai-category">
                  Responsible AI principle *
                </label>
                <select
                  id="rai-category"
                  className="rai-select"
                  style={styles.field}
                  value={newCategory}
                  onChange={(event) =>
                    setNewCategory(event.target.value as Principle)
                  }
                >
                  {principles.map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={styles.label} htmlFor="rai-owner">
                  Responsible owner *
                </label>
                <input
                  id="rai-owner"
                  className="rai-input"
                  style={styles.field}
                  value={newOwner}
                  onChange={(event) => setNewOwner(event.target.value)}
                  placeholder="e.g. AI Platform Team"
                />
              </div>

              <div>
                <label style={styles.label} htmlFor="rai-description">
                  Assessment objective *
                </label>
                <textarea
                  id="rai-description"
                  className="rai-textarea"
                  style={{ ...styles.field, minHeight: 90, resize: "vertical" }}
                  value={newDescription}
                  onChange={(event) => setNewDescription(event.target.value)}
                  placeholder="Describe what this assessment will review..."
                />
              </div>

              <div>
                <label style={styles.label} htmlFor="rai-status">
                  Initial status
                </label>
                <select
                  id="rai-status"
                  className="rai-select"
                  style={styles.field}
                  value={newStatus}
                  onChange={(event) =>
                    setNewStatus(event.target.value as Status)
                  }
                >
                  <option>Needs review</option>
                  <option>At risk</option>
                  <option>Compliant</option>
                </select>
              </div>

              <p style={{ ...styles.muted, margin: 0 }}>
                New assessments start with a score of 0 until an assessment
                result is recorded.
              </p>
            </div>

            <div style={styles.modalFooter}>
              <button
                type="button"
                className="rai-button"
                style={styles.secondaryButton}
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rai-button"
                style={styles.primaryButton}
                onClick={createAssessment}
              >
                <Plus size={15} />
                Create assessment
              </button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div
          style={styles.modalOverlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <div
            style={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rai-detail-title"
          >
            <div style={styles.modalHeader}>
              <div style={{ minWidth: 0 }}>
                <h2
                  id="rai-detail-title"
                  style={{ ...styles.panelTitle, fontSize: 17 }}
                >
                  Assessment details
                </h2>
                <p style={styles.panelDescription}>{selected.name}</p>
              </div>
              <button
                type="button"
                aria-label="Close"
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

            <div style={styles.modalBody}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <StatusBadge status={selected.status} />
                <span style={styles.muted}>
                  ID: RAI-{String(selected.id).slice(-6)}
                </span>
              </div>

              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e6eaf0",
                  padding: 16,
                  borderRadius: 10,
                }}
              >
                <div style={styles.muted}>Assessment score</div>
                <div
                  style={{
                    fontSize: 30,
                    fontWeight: 750,
                    marginTop: 5,
                    color: "#172033",
                  }}
                >
                  {selected.score}
                  <span
                    style={{
                      color: "#94a3b8",
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    {" "}
                    / 100
                  </span>
                </div>
                <ProgressBar
                  value={selected.score}
                  color={
                    selected.score >= 90
                      ? "#16a34a"
                      : selected.score >= 75
                        ? "#d97706"
                        : "#dc2626"
                  }
                />
              </div>

              <div>
                <div style={styles.label}>Principle</div>
                <div style={{ fontSize: 13 }}>{selected.category}</div>
              </div>

              <div>
                <div style={styles.label}>Description</div>
                <div style={{ fontSize: 13, lineHeight: 1.7, color: "#475569" }}>
                  {selected.description}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    border: "1px solid #e6eaf0",
                    borderRadius: 9,
                    padding: 13,
                  }}
                >
                  <div style={styles.muted}>Owner</div>
                  <div
                    style={{
                      fontWeight: 650,
                      fontSize: 12,
                      marginTop: 5,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {selected.owner}
                  </div>
                </div>
                <div
                  style={{
                    border: "1px solid #e6eaf0",
                    borderRadius: 9,
                    padding: 13,
                  }}
                >
                  <div style={styles.muted}>Recorded findings</div>
                  <div
                    style={{
                      fontWeight: 750,
                      fontSize: 19,
                      marginTop: 3,
                      color: selected.findings ? "#b91c1c" : "#15803d",
                    }}
                  >
                    {selected.findings}
                  </div>
                </div>
              </div>

              <div>
                <label style={styles.label} htmlFor="rai-update-status">
                  Update assessment status
                </label>
                <select
                  id="rai-update-status"
                  className="rai-select"
                  style={styles.field}
                  value={selected.status}
                  onChange={(event) =>
                    updateStatus(selected.id, event.target.value as Status)
                  }
                >
                  <option>Needs review</option>
                  <option>At risk</option>
                  <option>Compliant</option>
                </select>
              </div>

              <div style={styles.muted}>
                Last reviewed: {selected.lastReviewed}
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                type="button"
                className="rai-button"
                style={styles.secondaryButton}
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showChecklist && (
        <div
          style={styles.modalOverlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowChecklist(false);
            }
          }}
        >
          <div
            style={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="rai-checklist-title"
          >
            <div style={styles.modalHeader}>
              <div>
                <h2
                  id="rai-checklist-title"
                  style={{ ...styles.panelTitle, fontSize: 17 }}
                >
                  Responsible AI review checklist
                </h2>
                <p style={styles.panelDescription}>
                  Use these suggested checks during a review.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close checklist"
                onClick={() => setShowChecklist(false)}
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

            <div style={styles.modalBody}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  Review progress
                </span>
                <strong style={{ fontSize: 12 }}>
                  {checkedItems.length}/{initialChecklist.length} completed
                </strong>
              </div>
              <ProgressBar
                value={
                  (checkedItems.length / initialChecklist.length) * 100
                }
                color="#16a34a"
              />

              {initialChecklist.map((item) => {
                const checked = checkedItems.includes(item);

                return (
                  <label
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 11,
                      border: "1px solid #e6eaf0",
                      padding: 13,
                      borderRadius: 9,
                      cursor: "pointer",
                      background: checked ? "#f0fdf4" : "#fff",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleChecklistItem(item)}
                      style={{
                        marginTop: 2,
                        accentColor: "#16a34a",
                        width: 15,
                        height: 15,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 12,
                        lineHeight: 1.6,
                        color: checked ? "#64748b" : "#334155",
                        textDecoration: checked ? "line-through" : "none",
                      }}
                    >
                      {item}
                    </span>
                    {checked && (
                      <Check
                        size={15}
                        color="#15803d"
                        style={{ marginLeft: "auto", flexShrink: 0 }}
                      />
                    )}
                  </label>
                );
              })}

              <p style={{ ...styles.muted, margin: 0 }}>
                Checklist selections are temporary and are not persisted to a
                backend.
              </p>
            </div>

            <div style={styles.modalFooter}>
              <button
                type="button"
                className="rai-button"
                style={styles.secondaryButton}
                onClick={() => setCheckedItems([])}
              >
                Reset checklist
              </button>
              <button
                type="button"
                className="rai-button"
                style={styles.primaryButton}
                onClick={() => {
                  setShowChecklist(false);
                  showMessage(
                    `${checkedItems.length} of ${initialChecklist.length} checklist items completed.`
                  );
                }}
              >
                <CheckCircle2 size={15} />
                Finish review
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
            maxWidth: "calc(100vw - 32px)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "13px 16px",
            background: "#172033",
            color: "#fff",
            borderRadius: 10,
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
