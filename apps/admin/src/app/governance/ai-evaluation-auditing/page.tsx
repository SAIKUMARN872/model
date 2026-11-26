
"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  CircleHelp,
  ClipboardCheck,
  Download,
  Eye,
  FlaskConical,
  Gauge,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  Zap,
  X,
  type LucideIcon,
} from "lucide-react";

type EvaluationStatus =
  | "Passed"
  | "Failed"
  | "In progress"
  | "Needs review";

type EvaluationType =
  | "Accuracy"
  | "Safety"
  | "Bias"
  | "Performance"
  | "Robustness";

type Evaluation = {
  id: number;
  name: string;
  model: string;
  type: EvaluationType;
  owner: string;
  status: EvaluationStatus;
  score: number;
  threshold: number;
  tests: number;
  failures: number;
  duration: string;
  createdAt: string;
  description: string;
};

type EvaluationCategory = {
  name: EvaluationType;
  description: string;
  icon: LucideIcon;
  color: string;
  background: string;
};

const initialEvaluations: Evaluation[] = [
  {
    id: 101,
    name: "Production Model Quality",
    model: "ModelNow Quality 12B",
    type: "Accuracy",
    owner: "AI Platform",
    status: "Passed",
    score: 94.2,
    threshold: 90,
    tests: 1200,
    failures: 18,
    duration: "4m 32s",
    createdAt: "Nov 4, 2026",
    description:
      "Measures response correctness, relevance, instruction following, and consistency against a curated evaluation dataset.",
  },
  {
    id: 102,
    name: "Safety & Refusal Testing",
    model: "ModelNow Foundation 8B",
    type: "Safety",
    owner: "Trust & Safety",
    status: "Needs review",
    score: 87.6,
    threshold: 90,
    tests: 850,
    failures: 42,
    duration: "3m 18s",
    createdAt: "Nov 3, 2026",
    description:
      "Evaluates harmful request handling, refusal behavior, prompt injection resilience, and policy adherence.",
  },
  {
    id: 103,
    name: "Demographic Bias Audit",
    model: "ModelNow Quality 12B",
    type: "Bias",
    owner: "Responsible AI",
    status: "Failed",
    score: 72.4,
    threshold: 85,
    tests: 640,
    failures: 76,
    duration: "5m 06s",
    createdAt: "Nov 2, 2026",
    description:
      "Checks for potential disparities in outputs across representative demographic groups and scenarios.",
  },
  {
    id: 104,
    name: "Inference Latency Benchmark",
    model: "ModelNow Efficient 4B",
    type: "Performance",
    owner: "ML Infrastructure",
    status: "Passed",
    score: 96.1,
    threshold: 90,
    tests: 2000,
    failures: 9,
    duration: "2m 41s",
    createdAt: "Nov 1, 2026",
    description:
      "Measures response latency, throughput, and stability under representative inference workloads.",
  },
  {
    id: 105,
    name: "Adversarial Robustness Suite",
    model: "ModelNow Foundation 8B",
    type: "Robustness",
    owner: "Security Engineering",
    status: "In progress",
    score: 0,
    threshold: 88,
    tests: 1000,
    failures: 0,
    duration: "Running",
    createdAt: "Nov 4, 2026",
    description:
      "Tests model behavior under adversarial prompts, malformed inputs, and unexpected instruction combinations.",
  },
  {
    id: 106,
    name: "Knowledge Grounding Audit",
    model: "ModelNow Quality 12B",
    type: "Accuracy",
    owner: "Knowledge Platform",
    status: "Passed",
    score: 92.8,
    threshold: 90,
    tests: 950,
    failures: 24,
    duration: "3m 54s",
    createdAt: "Oct 31, 2026",
    description:
      "Evaluates answer relevance, evidence alignment, citation support, and unsupported claims for knowledge-based responses.",
  },
];

const evaluationTypes: EvaluationCategory[] = [
  {
    name: "Accuracy",
    description: "Correctness and answer quality",
    icon: CheckCircle2,
    color: "#2563eb",
    background: "#dbeafe",
  },
  {
    name: "Safety",
    description: "Safety and policy adherence",
    icon: Shield,
    color: "#15803d",
    background: "#dcfce7",
  },
  {
    name: "Bias",
    description: "Fairness and bias detection",
    icon: Activity,
    color: "#7c3aed",
    background: "#f3e8ff",
  },
  {
    name: "Performance",
    description: "Latency and throughput",
    icon: Zap,
    color: "#c2410c",
    background: "#ffedd5",
  },
  {
    name: "Robustness",
    description: "Resilience to unexpected inputs",
    icon: ShieldAlert,
    color: "#0f766e",
    background: "#ccfbf1",
  },
];

const statusTheme: Record<
  EvaluationStatus,
  { color: string; background: string }
> = {
  Passed: { color: "#15803d", background: "#dcfce7" },
  Failed: { color: "#b91c1c", background: "#fee2e2" },
  "In progress": { color: "#1d4ed8", background: "#dbeafe" },
  "Needs review": { color: "#a16207", background: "#fef3c7" },
};

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    color: "#172033",
    padding: 28,
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  container: {
    maxWidth: 1500,
    margin: "0 auto",
  },
  breadcrumb: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    color: "#64748b",
    fontSize: 12,
    marginBottom: 12,
  },
  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 18,
    marginBottom: 25,
  },
  title: {
    fontSize: 29,
    lineHeight: 1.3,
    fontWeight: 750,
    letterSpacing: "-0.8px",
    margin: 0,
  },
  subtitle: {
    color: "#64748b",
    fontSize: 14,
    lineHeight: 1.7,
    margin: "9px 0 0",
    maxWidth: 740,
  },
  primaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    background: "#315fea",
    color: "#fff",
    border: "1px solid #315fea",
    borderRadius: 9,
    padding: "11px 15px",
    fontSize: 12,
    fontWeight: 650,
    cursor: "pointer",
  },
  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    background: "#fff",
    color: "#334155",
    border: "1px solid #dbe2ec",
    borderRadius: 9,
    padding: "10px 13px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  metrics: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(185px, 1fr))",
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
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    color: "#64748b",
    fontSize: 12,
  },
  metricIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },
  metricValue: {
    fontSize: 29,
    fontWeight: 750,
    letterSpacing: "-0.8px",
    marginTop: 15,
  },
  metricFoot: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    color: "#64748b",
    fontSize: 11,
    lineHeight: 1.6,
    marginTop: 8,
  },
  panel: {
    background: "#fff",
    border: "1px solid #e6eaf0",
    borderRadius: 13,
    marginBottom: 21,
    overflow: "hidden",
    minWidth: 0,
  },
  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
    padding: "19px 21px",
    borderBottom: "1px solid #edf0f5",
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: 700,
    margin: 0,
  },
  panelDescription: {
    color: "#64748b",
    fontSize: 12,
    lineHeight: 1.6,
    margin: "5px 0 0",
  },
  typesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
    padding: 20,
  },
  typeCard: {
    textAlign: "left",
    background: "#fff",
    border: "1px solid #e6eaf0",
    borderRadius: 11,
    padding: 15,
    cursor: "pointer",
    minWidth: 0,
  },
  filters: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    padding: "15px 20px",
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
  },
  searchInput: {
    border: "none",
    outline: "none",
    background: "transparent",
    width: "100%",
    minWidth: 0,
    padding: "10px 0",
    fontSize: 12,
    color: "#172033",
  },
  select: {
    border: "1px solid #dbe2ec",
    borderRadius: 8,
    padding: "10px 12px",
    background: "#fff",
    color: "#334155",
    fontSize: 12,
    outline: "none",
    maxWidth: "100%",
  },
  tableWrap: {
    width: "100%",
    overflowX: "auto",
  },
  table: {
    width: "100%",
    minWidth: 1000,
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    background: "#f8fafc",
    color: "#64748b",
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: ".6px",
    padding: "12px 17px",
    borderBottom: "1px solid #e6eaf0",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "15px 17px",
    borderBottom: "1px solid #edf0f5",
    fontSize: 12,
    verticalAlign: "middle",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "5px 9px",
    borderRadius: 20,
    fontSize: 10,
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
  progressTrack: {
    height: 6,
    background: "#edf1f6",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 8,
  },
  lowerGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 20,
  },
  contentPad: {
    padding: 20,
  },
  muted: {
    color: "#64748b",
    fontSize: 11,
    lineHeight: 1.65,
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,.52)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 1000,
    overflowY: "auto",
  },
  modal: {
    width: "100%",
    maxWidth: 600,
    maxHeight: "90vh",
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
  modalBody: {
    padding: 23,
    display: "grid",
    gap: 16,
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    flexWrap: "wrap",
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
};

function StatusBadge({ status }: { status: EvaluationStatus }) {
  const theme = statusTheme[status];

  return (
    <span
      style={{
        ...styles.badge,
        color: theme.color,
        background: theme.background,
      }}
    >
      {status === "Passed" ? (
        <CheckCircle2 size={12} />
      ) : status === "Failed" ? (
        <AlertTriangle size={12} />
      ) : status === "In progress" ? (
        <RefreshCw size={12} />
      ) : (
        <CircleHelp size={12} />
      )}
      {status}
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  const safeScore = Math.min(100, Math.max(0, score));
  const color =
    safeScore >= 90
      ? "#16a34a"
      : safeScore >= 80
        ? "#d97706"
        : "#dc2626";

  return (
    <div style={styles.progressTrack}>
      <div
        style={{
          width: `${safeScore}%`,
          height: "100%",
          background: color,
          borderRadius: 10,
          transition: "width .2s ease",
        }}
      />
    </div>
  );
}

function IconTile({
  icon: Icon,
  color,
  background,
}: {
  icon: LucideIcon;
  color: string;
  background: string;
}) {
  return (
    <div
      style={{
        ...styles.metricIcon,
        color,
        background,
      }}
    >
      <Icon size={17} />
    </div>
  );
}

export default function AIEvaluationAuditingPage() {
  const [evaluations, setEvaluations] =
    useState<Evaluation[]>(initialEvaluations);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All statuses");
  const [typeFilter, setTypeFilter] =
    useState("All types");
  const [modelFilter, setModelFilter] =
    useState("All models");

  const [selected, setSelected] =
    useState<Evaluation | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [toast, setToast] = useState("");

  const [newName, setNewName] = useState("");
  const [newModel, setNewModel] =
    useState("ModelNow Quality 12B");
  const [newType, setNewType] =
    useState<EvaluationType>("Accuracy");
  const [newOwner, setNewOwner] = useState("");
  const [newThreshold, setNewThreshold] = useState("90");
  const [newTests, setNewTests] = useState("100");
  const [newDescription, setNewDescription] = useState("");

  const totalRuns = evaluations.length;

  const passedRuns = evaluations.filter(
    (item) => item.status === "Passed",
  ).length;

  const failedRuns = evaluations.filter(
    (item) => item.status === "Failed",
  ).length;

  const activeRuns = evaluations.filter(
    (item) => item.status === "In progress",
  ).length;

  const completedRuns = evaluations.filter(
    (item) =>
      item.status === "Passed" || item.status === "Failed",
  );

  const averageScore = completedRuns.length
    ? (
        completedRuns.reduce(
          (sum, item) => sum + item.score,
          0,
        ) / completedRuns.length
      ).toFixed(1)
    : "0.0";

  const modelOptions = Array.from(
    new Set(evaluations.map((item) => item.model)),
  );

  const filteredEvaluations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return evaluations.filter((item) => {
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.model.toLowerCase().includes(query) ||
        item.owner.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All statuses" ||
        item.status === statusFilter;

      const matchesType =
        typeFilter === "All types" ||
        item.type === typeFilter;

      const matchesModel =
        modelFilter === "All models" ||
        item.model === modelFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesModel
      );
    });
  }, [
    evaluations,
    search,
    statusFilter,
    typeFilter,
    modelFilter,
  ]);

  function notify(message: string) {
    setToast(message);
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("All statuses");
    setTypeFilter("All types");
    setModelFilter("All models");
  }

  function createEvaluation() {
    if (
      !newName.trim() ||
      !newOwner.trim() ||
      !newDescription.trim() ||
      !newThreshold.trim() ||
      !newTests.trim()
    ) {
      notify("Please complete all required fields.");
      return;
    }

    const threshold = Number(newThreshold);
    const tests = Number(newTests);

    if (
      !Number.isFinite(threshold) ||
      threshold < 0 ||
      threshold > 100
    ) {
      notify("Threshold must be a number from 0 to 100.");
      return;
    }

    if (
      !Number.isInteger(tests) ||
      tests < 1 ||
      tests > 1000000
    ) {
      notify(
        "Test cases must be a whole number between 1 and 1,000,000.",
      );
      return;
    }

    const record: Evaluation = {
      id: Date.now(),
      name: newName.trim(),
      model: newModel,
      type: newType,
      owner: newOwner.trim(),
      status: "In progress",
      score: 0,
      threshold,
      tests,
      failures: 0,
      duration: "Queued",
      createdAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      description: newDescription.trim(),
    };

    setEvaluations((current) => [record, ...current]);
    setShowCreate(false);

    setNewName("");
    setNewOwner("");
    setNewDescription("");
    setNewThreshold("90");
    setNewTests("100");
    setNewType("Accuracy");
    setNewModel("ModelNow Quality 12B");

    resetFilters();
    notify("Evaluation added to the local register.");
  }

  function updateEvaluationStatus(
    id: number,
    status: EvaluationStatus,
  ) {
    let updatedEvaluation: Evaluation | undefined;

    setEvaluations((current) =>
      current.map((item) => {
        if (item.id !== id) return item;

        let score = item.score;
        let failures = item.failures;
        let duration = item.duration;

        if (
          status === "Passed" &&
          item.status === "In progress" &&
          score === 0
        ) {
          score = Math.max(item.threshold, 92);
          failures = Math.round(
            item.tests * (1 - score / 100),
          );
          duration = "Completed";
        } else if (
          status === "Failed" &&
          item.status === "In progress" &&
          score === 0
        ) {
          score = Math.max(0, item.threshold - 12);
          failures = Math.round(
            item.tests * (1 - score / 100),
          );
          duration = "Completed";
        }

        updatedEvaluation = {
          ...item,
          status,
          score,
          failures,
          duration,
        };

        return updatedEvaluation;
      }),
    );

    if (selected?.id === id) {
      setSelected((current) => {
        if (!current || current.id !== id) return current;

        let score = current.score;
        let failures = current.failures;
        let duration = current.duration;

        if (
          status === "Passed" &&
          current.status === "In progress" &&
          score === 0
        ) {
          score = Math.max(current.threshold, 92);
          failures = Math.round(
            current.tests * (1 - score / 100),
          );
          duration = "Completed";
        } else if (
          status === "Failed" &&
          current.status === "In progress" &&
          score === 0
        ) {
          score = Math.max(0, current.threshold - 12);
          failures = Math.round(
            current.tests * (1 - score / 100),
          );
          duration = "Completed";
        }

        return {
          ...current,
          status,
          score,
          failures,
          duration,
        };
      });
    }

    notify(`Evaluation status changed to "${status}".`);
  }

  function exportCsv() {
    const headers = [
      "Evaluation",
      "Model",
      "Type",
      "Owner",
      "Status",
      "Score",
      "Threshold",
      "Test Cases",
      "Failures",
      "Duration",
      "Created",
    ];

    const rows = filteredEvaluations.map((item) => [
      item.name,
      item.model,
      item.type,
      item.owner,
      item.status,
      String(item.score),
      String(item.threshold),
      String(item.tests),
      String(item.failures),
      item.duration,
      item.createdAt,
    ]);

    const quote = (value: string) =>
      `"${value.replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(quote).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "modelnow-ai-evaluation-audits.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);

    notify("Filtered evaluation report exported.");
  }

  function closeCreateModal() {
    setShowCreate(false);
  }

  function closeDetailsModal() {
    setSelected(null);
  }

  return (
    <main style={styles.page}>
      <style>{`
        * {
          box-sizing: border-box;
        }

        .eval-button {
          transition: filter .15s ease, transform .15s ease;
        }

        .eval-button:hover {
          filter: brightness(.96);
        }

        .eval-button:focus-visible,
        .eval-type:focus-visible {
          outline: 3px solid rgba(49,95,234,.25);
          outline-offset: 2px;
        }

        .eval-row:hover {
          background: #f8fafc;
        }

        .eval-type {
          transition: border-color .15s ease, transform .15s ease;
        }

        .eval-type:hover {
          border-color: #b7c8ff !important;
          transform: translateY(-1px);
        }

        .eval-input:focus,
        .eval-select:focus,
        .eval-textarea:focus {
          border-color: #315fea !important;
          box-shadow: 0 0 0 3px rgba(49,95,234,.1);
        }

        @media (max-width: 600px) {
          .eval-page {
            padding: 16px !important;
          }

          .eval-title {
            font-size: 24px !important;
          }

          .eval-actions {
            width: 100%;
          }

          .eval-actions button {
            flex: 1;
          }

          .eval-modal-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div className="eval-page" style={styles.container}>
        <header style={styles.topbar}>
          <div>
            <div style={styles.breadcrumb}>
              <Shield size={14} />
              <span>Governance</span>
              <span>/</span>
              <span style={{ color: "#172033", fontWeight: 650 }}>
                AI Evaluation &amp; Auditing
              </span>
            </div>

            <h1 className="eval-title" style={styles.title}>
              AI Evaluation &amp; Auditing
            </h1>

            <p style={styles.subtitle}>
              Evaluate model quality, audit safety and fairness,
              and track repeatable evaluation runs across your
              ModelNow AI systems.
            </p>
          </div>

          <div
            className="eval-actions"
            style={{
              display: "flex",
              gap: 9,
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              className="eval-button"
              style={styles.secondaryButton}
              onClick={exportCsv}
            >
              <Download size={15} />
              Export report
            </button>

            <button
              type="button"
              className="eval-button"
              style={styles.primaryButton}
              onClick={() => setShowCreate(true)}
            >
              <Plus size={16} />
              New evaluation
            </button>
          </div>
        </header>

        <section style={styles.metrics}>
          <div style={styles.metricCard}>
            <div style={styles.metricTop}>
              Total evaluation runs
              <IconTile
                icon={FlaskConical}
                color="#1d4ed8"
                background="#dbeafe"
              />
            </div>
            <div style={styles.metricValue}>{totalRuns}</div>
            <div style={styles.metricFoot}>
              <Activity size={12} />
              Across {evaluationTypes.length} categories
            </div>
          </div>

          <div style={styles.metricCard}>
            <div style={styles.metricTop}>
              Average evaluation score
              <IconTile
                icon={Gauge}
                color="#15803d"
                background="#dcfce7"
              />
            </div>
            <div style={styles.metricValue}>
              {averageScore}
              <span
                style={{
                  color: "#64748b",
                  fontSize: 14,
                  fontWeight: 500,
                }}
              >
                /100
              </span>
            </div>
            <div style={styles.metricFoot}>
              Average across completed runs
            </div>
          </div>

          <div style={styles.metricCard}>
            <div style={styles.metricTop}>
              Passed evaluations
              <IconTile
                icon={CheckCircle2}
                color="#15803d"
                background="#dcfce7"
              />
            </div>
            <div style={styles.metricValue}>{passedRuns}</div>
            <div style={styles.metricFoot}>
              <ArrowUpRight size={13} color="#16a34a" />
              {totalRuns
                ? Math.round((passedRuns / totalRuns) * 100)
                : 0}
              % of registered runs
            </div>
          </div>

          <div style={styles.metricCard}>
            <div style={styles.metricTop}>
              Failed evaluations
              <IconTile
                icon={AlertTriangle}
                color="#b91c1c"
                background="#fee2e2"
              />
            </div>
            <div style={styles.metricValue}>{failedRuns}</div>
            <div style={styles.metricFoot}>
              <ArrowDownRight size={13} color="#dc2626" />
              Requires investigation
            </div>
          </div>

          <div style={styles.metricCard}>
            <div style={styles.metricTop}>
              Active runs
              <IconTile
                icon={RefreshCw}
                color="#7c3aed"
                background="#f3e8ff"
              />
            </div>
            <div style={styles.metricValue}>{activeRuns}</div>
            <div style={styles.metricFoot}>
              Queued or in progress
            </div>
          </div>
        </section>

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <h2 style={styles.panelTitle}>
                Evaluation categories
              </h2>
              <p style={styles.panelDescription}>
                Select a category to filter the evaluation register.
              </p>
            </div>
            <span style={styles.muted}>
              {evaluationTypes.length} categories
            </span>
          </div>

          <div style={styles.typesGrid}>
            {evaluationTypes.map((category) => {
              const Icon = category.icon;

              const count = evaluations.filter(
                (item) => item.type === category.name,
              ).length;

              const isSelected = typeFilter === category.name;

              return (
                <button
                  key={category.name}
                  type="button"
                  className="eval-type"
                  aria-pressed={isSelected}
                  style={{
                    ...styles.typeCard,
                    borderColor: isSelected
                      ? "#315fea"
                      : "#e6eaf0",
                    background: isSelected
                      ? "#f8faff"
                      : "#fff",
                  }}
                  onClick={() => {
                    setTypeFilter((current) =>
                      current === category.name
                        ? "All types"
                        : category.name,
                    );
                  }}
                >
                  <div
                    style={{
                      width: 37,
                      height: 37,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 10,
                      background: category.background,
                      color: category.color,
                      marginBottom: 12,
                    }}
                  >
                    <Icon size={18} />
                  </div>

                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#172033",
                    }}
                  >
                    {category.name}
                  </div>

                  <p
                    style={{
                      color: "#64748b",
                      fontSize: 11,
                      lineHeight: 1.6,
                      minHeight: 34,
                      margin: "6px 0 10px",
                    }}
                  >
                    {category.description}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <span style={{ color: "#64748b", fontSize: 11 }}>
                      {count} run{count === 1 ? "" : "s"}
                    </span>
                    <span
                      style={{
                        color: category.color,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {isSelected ? "Selected" : "View runs"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <h2 style={styles.panelTitle}>
                Evaluation register
              </h2>
              <p style={styles.panelDescription}>
                Review model scores, thresholds, failures, and
                evaluation status.
              </p>
            </div>

            <button
              type="button"
              className="eval-button"
              style={styles.secondaryButton}
              onClick={resetFilters}
            >
              <RefreshCw size={14} />
              Reset filters
            </button>
          </div>

          <div style={styles.filters}>
            <div style={styles.searchWrap}>
              <Search size={15} color="#94a3b8" />

              <input
                className="eval-input"
                aria-label="Search evaluations"
                style={styles.searchInput}
                placeholder="Search evaluations, models, owners..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
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
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <select
              className="eval-select"
              aria-label="Filter by status"
              style={styles.select}
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option>All statuses</option>
              <option>Passed</option>
              <option>Failed</option>
              <option>In progress</option>
              <option>Needs review</option>
            </select>

            <select
              className="eval-select"
              aria-label="Filter by model"
              style={styles.select}
              value={modelFilter}
              onChange={(event) =>
                setModelFilter(event.target.value)
              }
            >
              <option>All models</option>
              {modelOptions.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>

            {(typeFilter !== "All types" ||
              statusFilter !== "All statuses" ||
              modelFilter !== "All models" ||
              search !== "") && (
              <button
                type="button"
                className="eval-button"
                style={styles.secondaryButton}
                onClick={resetFilters}
              >
                <X size={13} />
                Clear
              </button>
            )}
          </div>

          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Evaluation</th>
                  <th style={styles.th}>Model</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Score / threshold</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Tests / failures</th>
                  <th style={styles.th}>Duration</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredEvaluations.map((item) => {
                  const category = evaluationTypes.find(
                    (entry) => entry.name === item.type,
                  );

                  const Icon = category?.icon ?? Activity;

                  return (
                    <tr key={item.id} className="eval-row">
                      <td style={styles.td}>
                        <div
                          style={{
                            display: "flex",
                            gap: 10,
                            alignItems: "center",
                            minWidth: 190,
                          }}
                        >
                          <div
                            style={{
                              width: 34,
                              height: 34,
                              display: "grid",
                              placeItems: "center",
                              borderRadius: 9,
                              background:
                                category?.background ?? "#f1f5f9",
                              color: category?.color ?? "#475569",
                              flexShrink: 0,
                            }}
                          >
                            <Icon size={16} />
                          </div>

                          <div>
                            <div style={{ fontWeight: 650 }}>
                              {item.name}
                            </div>
                            <div
                              style={{
                                color: "#64748b",
                                fontSize: 10,
                                marginTop: 4,
                              }}
                            >
                              {item.createdAt} · {item.owner}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={styles.td}>
                        <span style={{ whiteSpace: "nowrap" }}>
                          {item.model}
                        </span>
                      </td>

                      <td style={styles.td}>
                        <span
                          style={{
                            color: category?.color ?? "#475569",
                            fontWeight: 650,
                          }}
                        >
                          {item.type}
                        </span>
                      </td>

                      <td style={styles.td}>
                        <div style={{ minWidth: 100 }}>
                          <div>
                            <strong>
                              {item.status === "In progress"
                                ? "—"
                                : item.score.toFixed(1)}
                            </strong>
                            <span style={{ color: "#94a3b8" }}>
                              {" "}
                              / {item.threshold}
                            </span>
                          </div>
                          <ScoreBar score={item.score} />
                        </div>
                      </td>

                      <td style={styles.td}>
                        <StatusBadge status={item.status} />
                      </td>

                      <td style={styles.td}>
                        <div style={{ whiteSpace: "nowrap" }}>
                          <strong>
                            {item.tests.toLocaleString("en-US")}
                          </strong>
                          <span style={{ color: "#94a3b8" }}>
                            {" "}
                            /{" "}
                          </span>
                          <span
                            style={{
                              color: item.failures
                                ? "#b91c1c"
                                : "#15803d",
                              fontWeight: 650,
                            }}
                          >
                            {item.failures}
                          </span>
                        </div>
                        <div
                          style={{
                            color: "#64748b",
                            fontSize: 10,
                            marginTop: 4,
                          }}
                        >
                          tests / failures
                        </div>
                      </td>

                      <td
                        style={{
                          ...styles.td,
                          whiteSpace: "nowrap",
                          color: "#64748b",
                        }}
                      >
                        {item.duration}
                      </td>

                      <td style={styles.td}>
                        <button
                          type="button"
                          className="eval-button"
                          style={{
                            ...styles.secondaryButton,
                            padding: "7px 10px",
                          }}
                          onClick={() => setSelected(item)}
                        >
                          <Eye size={13} />
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredEvaluations.length === 0 && (
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
                        style={{
                          display: "block",
                          margin: "0 auto 10px",
                        }}
                      />
                      <div style={{ fontWeight: 650 }}>
                        No matching evaluations
                      </div>
                      <p style={styles.muted}>
                        Try another search term or reset your filters.
                      </p>
                      <button
                        type="button"
                        className="eval-button"
                        style={styles.secondaryButton}
                        onClick={resetFilters}
                      >
                        Reset filters
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
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
              fontSize: 11,
              color: "#64748b",
            }}
          >
            <span>
              Showing {filteredEvaluations.length} of {evaluations.length} runs
            </span>
            <span>Local demonstration data</span>
          </div>
        </section>

        <div style={styles.lowerGrid}>
          <section style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <h2 style={styles.panelTitle}>Audit attention</h2>
                <p style={styles.panelDescription}>
                  Runs that may need investigation.
                </p>
              </div>
              <ShieldAlert size={18} color="#d97706" />
            </div>

            <div style={styles.contentPad}>
              {evaluations
                .filter(
                  (item) =>
                    item.status === "Failed" ||
                    item.status === "Needs review",
                )
                .map((item, index, list) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 11,
                      padding: "12px 0",
                      borderBottom:
                        index === list.length - 1
                          ? "none"
                          : "1px solid #edf0f5",
                    }}
                  >
                    <div
                      style={{
                        width: 33,
                        height: 33,
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                        borderRadius: 9,
                        color:
                          item.status === "Failed"
                            ? "#b91c1c"
                            : "#a16207",
                        background:
                          item.status === "Failed"
                            ? "#fee2e2"
                            : "#fef3c7",
                      }}
                    >
                      <AlertTriangle size={16} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>
                        {item.name}
                      </div>
                      <div style={{ ...styles.muted, marginTop: 4 }}>
                        Score {item.score.toFixed(1)} · Threshold{" "}
                        {item.threshold}
                      </div>
                      <div style={{ marginTop: 7 }}>
                        <StatusBadge status={item.status} />
                      </div>
                    </div>

                    <button
                      type="button"
                      aria-label={`View ${item.name}`}
                      onClick={() => setSelected(item)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#64748b",
                        cursor: "pointer",
                        padding: 4,
                      }}
                    >
                      <Eye size={15} />
                    </button>
                  </div>
                ))}

              {evaluations.every(
                (item) =>
                  item.status !== "Failed" &&
                  item.status !== "Needs review",
              ) && (
                <p style={styles.muted}>
                  No failed runs require review.
                </p>
              )}
            </div>
          </section>

          <section style={styles.panel}>
            <div style={styles.panelHeader}>
              <div>
                <h2 style={styles.panelTitle}>
                  Evaluation workflow
                </h2>
                <p style={styles.panelDescription}>
                  Suggested lifecycle for reliable assessments.
                </p>
              </div>
              <ClipboardCheck size={18} color="#315fea" />
            </div>

            <div style={styles.contentPad}>
              {[
                {
                  title: "1. Define evaluation criteria",
                  detail:
                    "Choose metrics, evaluation data, and acceptance thresholds.",
                },
                {
                  title: "2. Run repeatable tests",
                  detail:
                    "Evaluate accuracy, safety, robustness, and performance.",
                },
                {
                  title: "3. Review findings",
                  detail:
                    "Investigate failures and document supporting evidence.",
                },
                {
                  title: "4. Approve and monitor",
                  detail:
                    "Record review decisions and schedule follow-up evaluations.",
                },
              ].map((step, index, list) => (
                <div
                  key={step.title}
                  style={{
                    padding: "12px 0",
                    borderBottom:
                      index === list.length - 1
                        ? "none"
                        : "1px solid #edf0f5",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 700 }}>
                    {step.title}
                  </div>
                  <p style={{ ...styles.muted, margin: "5px 0 0" }}>
                    {step.detail}
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
            marginTop: 4,
          }}
        >
          <CircleHelp
            size={16}
            style={{ flexShrink: 0, marginTop: 1 }}
          />
          <div>
            <strong>Evaluation note:</strong> The displayed scores,
            test counts, and statuses are illustrative. Creating an
            evaluation adds a local register entry; it does not run
            model tests or audit a real AI system. Actual evaluation
            requires backend execution, datasets, metric
            implementations, and stored results.
          </div>
        </div>
      </div>

      {showCreate && (
        <div
          style={styles.modalOverlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeCreateModal();
            }
          }}
        >
          <div
            style={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-evaluation-title"
          >
            <div style={styles.modalHeader}>
              <div>
                <h2
                  id="create-evaluation-title"
                  style={{ ...styles.panelTitle, fontSize: 17 }}
                >
                  Create evaluation
                </h2>
                <p style={styles.panelDescription}>
                  Configure a new evaluation register entry.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close"
                onClick={closeCreateModal}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#64748b",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                createEvaluation();
              }}
            >
              <div style={styles.modalBody}>
                <div>
                  <label style={styles.label} htmlFor="eval-name">
                    Evaluation name *
                  </label>
                  <input
                    id="eval-name"
                    className="eval-input"
                    style={styles.field}
                    value={newName}
                    onChange={(event) =>
                      setNewName(event.target.value)
                    }
                    placeholder="e.g. Customer Support Safety Suite"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label style={styles.label} htmlFor="eval-model">
                    Model *
                  </label>
                  <select
                    id="eval-model"
                    className="eval-select"
                    style={styles.field}
                    value={newModel}
                    onChange={(event) =>
                      setNewModel(event.target.value)
                    }
                  >
                    <option>ModelNow Foundation 8B</option>
                    <option>ModelNow Quality 12B</option>
                    <option>ModelNow Efficient 4B</option>
                  </select>
                </div>

                <div>
                  <label style={styles.label} htmlFor="eval-type">
                    Evaluation category *
                  </label>
                  <select
                    id="eval-type"
                    className="eval-select"
                    style={styles.field}
                    value={newType}
                    onChange={(event) =>
                      setNewType(
                        event.target.value as EvaluationType,
                      )
                    }
                  >
                    {evaluationTypes.map((category) => (
                      <option
                        key={category.name}
                        value={category.name}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={styles.label} htmlFor="eval-owner">
                    Responsible owner *
                  </label>
                  <input
                    id="eval-owner"
                    className="eval-input"
                    style={styles.field}
                    value={newOwner}
                    onChange={(event) =>
                      setNewOwner(event.target.value)
                    }
                    placeholder="e.g. Model Evaluation Team"
                    required
                  />
                </div>

                <div
                  className="eval-modal-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(2, minmax(0, 1fr))",
                    gap: 12,
                  }}
                >
                  <div>
                    <label
                      style={styles.label}
                      htmlFor="eval-threshold"
                    >
                      Score threshold (0–100) *
                    </label>
                    <input
                      id="eval-threshold"
                      className="eval-input"
                      style={styles.field}
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={newThreshold}
                      onChange={(event) =>
                        setNewThreshold(event.target.value)
                      }
                      required
                    />
                  </div>

                  <div>
                    <label
                      style={styles.label}
                      htmlFor="eval-tests"
                    >
                      Number of test cases *
                    </label>
                    <input
                      id="eval-tests"
                      className="eval-input"
                      style={styles.field}
                      type="number"
                      min="1"
                      max="1000000"
                      step="1"
                      value={newTests}
                      onChange={(event) =>
                        setNewTests(event.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={styles.label}
                    htmlFor="eval-description"
                  >
                    Evaluation objective *
                  </label>
                  <textarea
                    id="eval-description"
                    className="eval-textarea"
                    style={{
                      ...styles.field,
                      minHeight: 85,
                      resize: "vertical",
                    }}
                    value={newDescription}
                    onChange={(event) =>
                      setNewDescription(event.target.value)
                    }
                    placeholder="Describe the behavior or metrics to evaluate..."
                    required
                  />
                </div>

                <p style={{ ...styles.muted, margin: 0 }}>
                  This creates a queued demo record. It does not
                  start an actual model evaluation.
                </p>
              </div>

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  className="eval-button"
                  style={styles.secondaryButton}
                  onClick={closeCreateModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="eval-button"
                  style={styles.primaryButton}
                >
                  <Plus size={15} />
                  Create evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selected && (
        <div
          style={styles.modalOverlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDetailsModal();
            }
          }}
        >
          <div
            style={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="evaluation-detail-title"
          >
            <div style={styles.modalHeader}>
              <div style={{ minWidth: 0 }}>
                <h2
                  id="evaluation-detail-title"
                  style={{ ...styles.panelTitle, fontSize: 17 }}
                >
                  Evaluation details
                </h2>
                <p style={styles.panelDescription}>
                  {selected.name}
                </p>
              </div>

              <button
                type="button"
                aria-label="Close details"
                onClick={closeDetailsModal}
                style={{
                  background: "transparent",
                  border: "none",
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
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <StatusBadge status={selected.status} />
                <span style={styles.muted}>
                  Run ID: EVAL-{String(selected.id).slice(-6)}
                </span>
              </div>

              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e6eaf0",
                  borderRadius: 10,
                  padding: 16,
                }}
              >
                <div style={styles.muted}>Recorded score</div>

                <div
                  style={{
                    fontSize: 30,
                    fontWeight: 750,
                    marginTop: 5,
                  }}
                >
                  {selected.status === "In progress"
                    ? "Pending"
                    : selected.score.toFixed(1)}

                  {selected.status !== "In progress" && (
                    <span
                      style={{
                        fontSize: 14,
                        color: "#64748b",
                        fontWeight: 500,
                      }}
                    >
                      {" "}
                      / 100
                    </span>
                  )}
                </div>

                <ScoreBar score={selected.score} />

                <div style={{ ...styles.muted, marginTop: 9 }}>
                  Acceptance threshold: {selected.threshold}
                </div>
              </div>

              <div>
                <div style={styles.label}>
                  Evaluation objective
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#475569",
                    lineHeight: 1.7,
                  }}
                >
                  {selected.description}
                </div>
              </div>

              <div
                className="eval-modal-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(2, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                {[
                  ["Model", selected.model],
                  ["Category", selected.type],
                  ["Owner", selected.owner],
                  [
                    "Test cases",
                    selected.tests.toLocaleString("en-US"),
                  ],
                  ["Failures", String(selected.failures)],
                  ["Duration", selected.duration],
                  ["Created", selected.createdAt],
                  [
                    "Run ID",
                    `EVAL-${String(selected.id).slice(-6)}`,
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      border: "1px solid #e6eaf0",
                      borderRadius: 9,
                      padding: 12,
                      minWidth: 0,
                    }}
                  >
                    <div style={styles.muted}>{label}</div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 650,
                        marginTop: 5,
                        overflowWrap: "anywhere",
                        color:
                          label === "Failures" &&
                          selected.failures > 0
                            ? "#b91c1c"
                            : "#172033",
                      }}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label
                  style={styles.label}
                  htmlFor="eval-update-status"
                >
                  Update register status
                </label>
                <select
                  id="eval-update-status"
                  className="eval-select"
                  style={styles.field}
                  value={selected.status}
                  onChange={(event) =>
                    updateEvaluationStatus(
                      selected.id,
                      event.target.value as EvaluationStatus,
                    )
                  }
                >
                  <option>In progress</option>
                  <option>Passed</option>
                  <option>Failed</option>
                  <option>Needs review</option>
                </select>
              </div>

              <p style={{ ...styles.muted, margin: 0 }}>
                Status changes affect the local demo register only.
                They do not run tests or validate model outputs.
              </p>
            </div>

            <div style={styles.modalFooter}>
              <button
                type="button"
                className="eval-button"
                style={styles.secondaryButton}
                onClick={closeDetailsModal}
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
          aria-live="polite"
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
              display: "flex",
            }}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </main>
  );
}
