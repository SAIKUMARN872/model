
"use client";

import { useMemo, useState } from "react";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Download,
  Eye,
  Filter,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  Target,
  X,
} from "lucide-react";

type RiskStatus = "Open" | "Mitigating" | "Under Review" | "Resolved";
type RiskLevel = "Critical" | "High" | "Medium" | "Low";

type Risk = {
  id: string;
  title: string;
  category: string;
  description: string;
  likelihood: number;
  impact: number;
  owner: string;
  status: RiskStatus;
  mitigation: string;
  dueDate: string;
  createdAt: string;
};

const initialRisks: Risk[] = [
  {
    id: "RSK-001",
    title: "Sensitive data exposure through AI prompts",
    category: "Data Privacy",
    description:
      "Confidential information could be included in prompts or exposed through model responses.",
    likelihood: 4,
    impact: 5,
    owner: "Security Team",
    status: "Mitigating",
    mitigation:
      "Implement data classification, sensitive-data detection, access controls, and prompt logging reviews.",
    dueDate: "2026-11-12",
    createdAt: "2026-10-12",
  },
  {
    id: "RSK-002",
    title: "Inaccurate model-generated responses",
    category: "Model Quality",
    description:
      "Incorrect or unsupported answers may influence customer or employee decisions.",
    likelihood: 4,
    impact: 4,
    owner: "AI Quality Team",
    status: "Open",
    mitigation:
      "Add evaluation datasets, confidence checks, grounded responses, and human review for high-impact outputs.",
    dueDate: "2026-11-18",
    createdAt: "2026-10-14",
  },
  {
    id: "RSK-003",
    title: "Prompt injection in connected tools",
    category: "Security",
    description:
      "Untrusted instructions in documents or web pages could influence an agent's tool usage.",
    likelihood: 3,
    impact: 5,
    owner: "Agent Platform Team",
    status: "Mitigating",
    mitigation:
      "Isolate untrusted content, validate tool arguments, enforce permissions, and require approval for sensitive actions.",
    dueDate: "2026-11-09",
    createdAt: "2026-10-16",
  },
  {
    id: "RSK-004",
    title: "Unexpected model provider outage",
    category: "Availability",
    description:
      "An upstream model provider disruption could interrupt customer-facing AI workflows.",
    likelihood: 3,
    impact: 4,
    owner: "Platform Engineering",
    status: "Under Review",
    mitigation:
      "Configure provider health checks, fallback routing, timeouts, and documented incident procedures.",
    dueDate: "2026-11-22",
    createdAt: "2026-10-17",
  },
  {
    id: "RSK-005",
    title: "Unauthorized workspace access",
    category: "Access Control",
    description:
      "Misconfigured permissions could expose enterprise resources to unauthorized users.",
    likelihood: 2,
    impact: 5,
    owner: "Identity & Access Team",
    status: "Open",
    mitigation:
      "Review role assignments, enforce least privilege, and test workspace isolation.",
    dueDate: "2026-11-25",
    createdAt: "2026-10-19",
  },
  {
    id: "RSK-006",
    title: "AI usage cost exceeds budget",
    category: "Financial",
    description:
      "Unexpected usage or inefficient model routing could increase inference expenditure.",
    likelihood: 3,
    impact: 3,
    owner: "FinOps Team",
    status: "Resolved",
    mitigation:
      "Configure usage alerts, model routing rules, budget thresholds, and regular cost reviews.",
    dueDate: "2026-10-25",
    createdAt: "2026-10-05",
  },
  {
    id: "RSK-007",
    title: "Biased or unfair model outcomes",
    category: "Responsible AI",
    description:
      "Model outputs may produce inconsistent or unfair results for different user groups.",
    likelihood: 3,
    impact: 4,
    owner: "Responsible AI Team",
    status: "Open",
    mitigation:
      "Run representative fairness evaluations, document limitations, and establish escalation and remediation procedures.",
    dueDate: "2026-11-28",
    createdAt: "2026-10-21",
  },
];

const categories = [
  "Data Privacy",
  "Model Quality",
  "Security",
  "Availability",
  "Access Control",
  "Financial",
  "Responsible AI",
  "Compliance",
  "Operations",
  "Other",
];

const owners = [
  "Security Team",
  "AI Quality Team",
  "Agent Platform Team",
  "Platform Engineering",
  "Identity & Access Team",
  "FinOps Team",
  "Responsible AI Team",
  "Compliance Team",
  "Operations Team",
];

const statusColors: Record<RiskStatus, { color: string; bg: string }> = {
  Open: { color: "#B42318", bg: "#FEECEB" },
  Mitigating: { color: "#B76E00", bg: "#FFF4DD" },
  "Under Review": { color: "#315FEA", bg: "#EEF3FF" },
  Resolved: { color: "#16845B", bg: "#E8F7EF" },
};

const levelColors: Record<RiskLevel, { color: string; bg: string }> = {
  Critical: { color: "#B42318", bg: "#FEECEB" },
  High: { color: "#C45A14", bg: "#FFF0E5" },
  Medium: { color: "#9A6700", bg: "#FFF7D6" },
  Low: { color: "#16845B", bg: "#E8F7EF" },
};

const border = "#E5E7EB";
const ink = "#172033";
const muted = "#6B7280";
const blue = "#315FEA";

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 11px",
  border: `1px solid ${border}`,
  borderRadius: 8,
  background: "#FFFFFF",
  color: ink,
  fontSize: 12,
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

function getScore(risk: Pick<Risk, "likelihood" | "impact">) {
  return risk.likelihood * risk.impact;
}

function getLevel(score: number): RiskLevel {
  if (score >= 20) return "Critical";
  if (score >= 12) return "High";
  if (score >= 6) return "Medium";
  return "Low";
}

function StatusPill({ status }: { status: RiskStatus }) {
  const colors = statusColors[status];

  return (
    <span
      style={{
        display: "inline-flex",
        padding: "5px 9px",
        borderRadius: 20,
        background: colors.bg,
        color: colors.color,
        fontSize: 10,
        fontWeight: 750,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

function LevelPill({ level }: { level: RiskLevel }) {
  const colors = levelColors[level];

  return (
    <span
      style={{
        display: "inline-flex",
        padding: "5px 9px",
        borderRadius: 20,
        background: colors.bg,
        color: colors.color,
        fontSize: 10,
        fontWeight: 800,
      }}
    >
      {level}
    </span>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  bg,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <article
      style={{
        padding: 17,
        border: `1px solid ${border}`,
        borderRadius: 12,
        background: "#FFFFFF",
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 650, color: muted }}>
          {title}
        </span>
        <span
          style={{
            display: "grid",
            placeItems: "center",
            width: 34,
            height: 34,
            borderRadius: 9,
            color,
            background: bg,
          }}
        >
          <Icon size={17} />
        </span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 12 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: muted, marginTop: 5 }}>
        {subtitle}
      </div>
    </article>
  );
}

export default function RiskManagementPage() {
  const [risks, setRisks] = useState(initialRisks);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [levelFilter, setLevelFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    category: "Security",
    description: "",
    likelihood: 3,
    impact: 3,
    owner: "Security Team",
    mitigation: "",
    dueDate: "",
  });

  const stats = useMemo(() => {
    const openRisks = risks.filter((r) => r.status !== "Resolved");

    return {
      total: risks.length,
      open: risks.filter((r) => r.status === "Open").length,
      mitigating: risks.filter((r) => r.status === "Mitigating").length,
      critical: openRisks.filter((r) => getLevel(getScore(r)) === "Critical").length,
      high: openRisks.filter((r) => getLevel(getScore(r)) === "High").length,
      resolved: risks.filter((r) => r.status === "Resolved").length,
    };
  }, [risks]);

  const filteredRisks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return risks.filter((risk) => {
      const matchesSearch =
        !query ||
        [
          risk.id,
          risk.title,
          risk.description,
          risk.category,
          risk.owner,
          risk.mitigation,
        ].some((value) => value.toLowerCase().includes(query));

      return (
        matchesSearch &&
        (statusFilter === "All" || risk.status === statusFilter) &&
        (levelFilter === "All" || getLevel(getScore(risk)) === levelFilter) &&
        (categoryFilter === "All" || risk.category === categoryFilter)
      );
    });
  }, [risks, search, statusFilter, levelFilter, categoryFilter]);

  function updateRisk(updated: Risk) {
    setRisks((current) =>
      current.map((risk) => (risk.id === updated.id ? updated : risk)),
    );
    setSelectedRisk(updated);
    setNotice(`${updated.id} updated successfully.`);
  }

  function createRisk(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.mitigation.trim() ||
      !form.dueDate
    ) {
      setError("Please complete all required fields.");
      return;
    }

    const nextNumber =
      Math.max(0, ...risks.map((r) => Number(r.id.replace("RSK-", "")))) + 1;

    const newRisk: Risk = {
      id: `RSK-${String(nextNumber).padStart(3, "0")}`,
      title: form.title.trim(),
      category: form.category,
      description: form.description.trim(),
      likelihood: form.likelihood,
      impact: form.impact,
      owner: form.owner,
      status: "Open",
      mitigation: form.mitigation.trim(),
      dueDate: form.dueDate,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setRisks((current) => [newRisk, ...current]);
    setShowCreate(false);
    setForm({
      title: "",
      category: "Security",
      description: "",
      likelihood: 3,
      impact: 3,
      owner: "Security Team",
      mitigation: "",
      dueDate: "",
    });
    setNotice(`${newRisk.id} registered successfully.`);
  }

  function exportCsv() {
    const headers = [
      "Risk ID",
      "Title",
      "Category",
      "Description",
      "Likelihood",
      "Impact",
      "Risk Score",
      "Risk Level",
      "Owner",
      "Status",
      "Mitigation",
      "Due Date",
    ];

    const rows = filteredRisks.map((risk) => [
      risk.id,
      risk.title,
      risk.category,
      risk.description,
      String(risk.likelihood),
      String(risk.impact),
      String(getScore(risk)),
      getLevel(getScore(risk)),
      risk.owner,
      risk.status,
      risk.mitigation,
      risk.dueDate,
    ]);

    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-risk-register.csv";
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Risk register exported to CSV.");
  }

  return (
    <main
      className="risk-page"
      style={{
        minHeight: "100%",
        padding: 28,
        background: "#F7F8FA",
        color: ink,
        fontFamily: "inherit",
      }}
    >
      <style>{`
        .risk-table { width:100%; min-width:900px; border-collapse:collapse; text-align:left; }
        .risk-table th { padding:12px 14px; background:#FAFBFC; color:${muted}; font-size:10px; letter-spacing:.05em; white-space:nowrap; border-bottom:1px solid ${border}; }
        .risk-table td { padding:14px; border-bottom:1px solid ${border}; font-size:12px; vertical-align:middle; }
        .risk-table tbody tr:hover { background:#FAFBFF; }
        .risk-label { display:block; margin-bottom:7px; color:#4B5563; font-size:12px; font-weight:700; }
        .risk-card { background:#FFFFFF; border:1px solid ${border}; border-radius:12px; overflow:hidden; }
        .risk-matrix-cell { min-height:36px; display:grid; place-items:center; border-radius:5px; font-size:10px; font-weight:800; }
        @media(max-width:700px) {
          .risk-page { padding:15px !important; }
          .risk-header-actions { width:100%; }
          .risk-header-actions button { flex:1; }
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
        <div style={{ maxWidth: 750 }}>
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
            <Shield size={16} /> Governance / Risk Management
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
            AI Risk Management
          </h1>
          <p
            style={{
              margin: "10px 0 0",
              color: muted,
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            Identify, assess, prioritize, and mitigate risks across ModelNow AI
            systems, models, data, agents, and enterprise workflows.
          </p>
        </div>

        <div
          className="risk-header-actions"
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
            <Plus size={15} /> Register risk
          </button>
        </div>
      </header>

      {notice && (
        <div
          role="status"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
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
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: 13,
          marginBottom: 22,
        }}
      >
        <MetricCard title="Total Risks" value={stats.total} subtitle="Items in the risk register" icon={ClipboardList} color={blue} bg="#EEF3FF" />
        <MetricCard title="Open Risks" value={stats.open} subtitle="Require action or ownership" icon={AlertTriangle} color="#B42318" bg="#FEECEB" />
        <MetricCard title="Mitigating" value={stats.mitigating} subtitle="Mitigation work in progress" icon={Shield} color="#B76E00" bg="#FFF4DD" />
        <MetricCard title="Critical Risks" value={stats.critical} subtitle="Highest-priority unresolved risks" icon={AlertOctagon} color="#B42318" bg="#FEECEB" />
        <MetricCard title="Resolved" value={stats.resolved} subtitle="Marked resolved in this register" icon={ShieldCheck} color="#16845B" bg="#E8F7EF" />
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
          gap: 15,
          marginBottom: 22,
        }}
      >
        <article
          className="risk-card"
          style={{ padding: 18 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
            <Target size={17} color={blue} />
            <h2 style={{ fontSize: 14, margin: 0 }}>Risk assessment matrix</h2>
          </div>
          <p style={{ fontSize: 11, color: muted, lineHeight: 1.7, marginTop: 0 }}>
            Likelihood × impact. Select a risk level below to filter the register.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "25px repeat(5,minmax(28px,1fr))", gap: 4 }}>
            <span />
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} style={{ textAlign: "center", color: muted, fontSize: 10 }}>{n}</div>
            ))}
            {[5, 4, 3, 2, 1].map((likelihood) => (
              <>
                <div key={`label-${likelihood}`} style={{ display: "grid", placeItems: "center", color: muted, fontSize: 10 }}>
                  {likelihood}
                </div>
                {[1, 2, 3, 4, 5].map((impact) => {
                  const score = likelihood * impact;
                  const level = getLevel(score);
                  const colors = levelColors[level];
                  const count = risks.filter(
                    (r) =>
                      r.status !== "Resolved" &&
                      r.likelihood === likelihood &&
                      r.impact === impact,
                  ).length;

                  return (
                    <button
                      key={`${likelihood}-${impact}`}
                      type="button"
                      title={`Likelihood ${likelihood}, impact ${impact}, score ${score}, ${count} risks`}
                      onClick={() => {
                        setLevelFilter(level);
                        setStatusFilter("All");
                      }}
                      className="risk-matrix-cell"
                      style={{
                        border: `1px solid ${colors.color}20`,
                        color: colors.color,
                        background: colors.bg,
                        cursor: "pointer",
                      }}
                    >
                      {count || ""}
                    </button>
                  );
                })}
              </>
            ))}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 13 }}>
            {(["Critical", "High", "Medium", "Low"] as RiskLevel[]).map((level) => (
              <button
                type="button"
                key={level}
                onClick={() => setLevelFilter(levelFilter === level ? "All" : level)}
                style={{
                  border: `1px solid ${levelColors[level].color}35`,
                  borderRadius: 7,
                  padding: "5px 8px",
                  background: levelFilter === level ? levelColors[level].bg : "#FFFFFF",
                  color: levelColors[level].color,
                  fontSize: 10,
                  fontWeight: 750,
                  cursor: "pointer",
                }}
              >
                {level}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 10, color: muted, marginBottom: 0 }}>
            Matrix shows the number of unresolved risks at each exact score combination.
          </p>
        </article>

        <article className="risk-card" style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
            <AlertTriangle size={17} color="#B42318" />
            <h2 style={{ fontSize: 14, margin: 0 }}>Priority overview</h2>
          </div>

          {(["Critical", "High", "Medium", "Low"] as RiskLevel[]).map((level) => {
            const count = risks.filter(
              (risk) =>
                risk.status !== "Resolved" &&
                getLevel(getScore(risk)) === level,
            ).length;
            const total = Math.max(1, risks.filter((r) => r.status !== "Resolved").length);

            return (
              <button
                type="button"
                key={level}
                onClick={() => setLevelFilter(levelFilter === level ? "All" : level)}
                style={{
                  display: "block",
                  width: "100%",
                  border: 0,
                  background: levelFilter === level ? "#F7F8FA" : "#FFFFFF",
                  textAlign: "left",
                  padding: "11px 0",
                  cursor: "pointer",
                  borderBottom: `1px solid ${border}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                  <LevelPill level={level} />
                  <span style={{ fontSize: 12, fontWeight: 800 }}>{count}</span>
                </div>
                <div style={{ height: 6, borderRadius: 20, background: "#EEF0F3", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${(count / total) * 100}%`,
                      background: levelColors[level].color,
                      borderRadius: 20,
                    }}
                  />
                </div>
              </button>
            );
          })}

          <div style={{ display: "flex", gap: 8, marginTop: 15, color: muted, fontSize: 11, lineHeight: 1.6 }}>
            <Clock3 size={15} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>
              Prioritize critical and high risks, assign accountable owners,
              and validate mitigation evidence before closing a risk.
            </span>
          </div>
        </article>
      </section>

      <section className="risk-card">
        <div style={{ padding: "18px 20px", borderBottom: `1px solid ${border}` }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>
            Risk register
          </h2>
          <p style={{ margin: "5px 0 0", color: muted, fontSize: 12 }}>
            Search risks and review their assessment scores and mitigation status.
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, padding: "15px 20px", borderBottom: `1px solid ${border}` }}>
          <div style={{ flex: "1 1 210px", position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: 11, top: 11, color: muted }} />
            <input
              aria-label="Search risk register"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search risk, owner, mitigation..."
              style={{ ...inputStyle, paddingLeft: 36 }}
            />
          </div>

          <select aria-label="Filter risk status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 135 }}>
            <option value="All">All statuses</option>
            <option>Open</option>
            <option>Mitigating</option>
            <option>Under Review</option>
            <option>Resolved</option>
          </select>

          <select aria-label="Filter risk level" value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 125 }}>
            <option value="All">All levels</option>
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <select aria-label="Filter risk category" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 145 }}>
            <option value="All">All categories</option>
            {categories.map((category) => <option key={category}>{category}</option>)}
          </select>

          <button type="button" style={secondaryButton} onClick={() => { setSearch(""); setStatusFilter("All"); setLevelFilter("All"); setCategoryFilter("All"); }}>
            <Filter size={14} /> Clear
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="risk-table">
            <thead>
              <tr>
                <th>RISK</th>
                <th>CATEGORY</th>
                <th>SCORE</th>
                <th>LEVEL</th>
                <th>OWNER</th>
                <th>STATUS</th>
                <th>DUE DATE</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredRisks.map((risk) => {
                const score = getScore(risk);
                const level = getLevel(score);

                return (
                  <tr key={risk.id}>
                    <td>
                      <button
                        type="button"
                        onClick={() => setSelectedRisk(risk)}
                        style={{ padding: 0, border: 0, background: "transparent", color: ink, textAlign: "left", fontWeight: 750, fontSize: 12, cursor: "pointer" }}
                      >
                        {risk.title}
                      </button>
                      <div style={{ color: muted, fontSize: 10, marginTop: 5 }}>{risk.id}</div>
                    </td>
                    <td>{risk.category}</td>
                    <td>
                      <span style={{ fontWeight: 800 }}>{score}</span>
                      <span style={{ color: muted, fontSize: 10 }}> / 25</span>
                    </td>
                    <td><LevelPill level={level} /></td>
                    <td>{risk.owner}</td>
                    <td><StatusPill status={risk.status} /></td>
                    <td style={{ whiteSpace: "nowrap" }}>{risk.dueDate}</td>
                    <td>
                      <button type="button" style={secondaryButton} onClick={() => setSelectedRisk(risk)}>
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredRisks.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: 35, textAlign: "center" }}>
                    <Search size={24} color={muted} />
                    <p style={{ fontWeight: 750 }}>No matching risks</p>
                    <p style={{ color: muted, fontSize: 12 }}>
                      Try a different search or filter.
                    </p>
                    <button type="button" style={secondaryButton} onClick={() => { setSearch(""); setStatusFilter("All"); setLevelFilter("All"); setCategoryFilter("All"); }}>
                      Clear filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, padding: "13px 20px", color: muted, fontSize: 11 }}>
          <span>Showing {filteredRisks.length} of {risks.length} risks</span>
          <span>Sample risk register · Local demo state</span>
        </div>
      </section>

      <section style={{ display: "flex", gap: 10, padding: 14, border: `1px solid ${border}`, borderRadius: 10, background: "#FFFFFF", color: muted, fontSize: 11, lineHeight: 1.7, marginTop: 20 }}>
        <ShieldCheck size={17} color={blue} />
        <span>
          <strong style={{ color: ink }}>Risk governance note.</strong>{" "}
          Risk scores are calculated as likelihood × impact. This register uses
          illustrative data and local frontend state. Production use requires
          persistent storage, accountable approval workflows, and verified
          mitigation evidence.
        </span>
      </section>

      {showCreate && (
        <div
          onMouseDown={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }}
          style={{ position: "fixed", inset: 0, zIndex: 1000, padding: 18, display: "flex", justifyContent: "center", alignItems: "center", background: "rgba(15,23,42,.5)" }}
        >
          <section role="dialog" aria-modal="true" style={{ width: "100%", maxWidth: 650, maxHeight: "90vh", overflowY: "auto", background: "#FFFFFF", borderRadius: 14, padding: 22, boxShadow: "0 24px 70px rgba(15,23,42,.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 19 }}>Register a risk</h2>
                <p style={{ color: muted, fontSize: 12 }}>Describe the risk and assign an initial assessment.</p>
              </div>
              <button type="button" aria-label="Close risk form" style={secondaryButton} onClick={() => setShowCreate(false)}><X size={16} /></button>
            </div>

            <form onSubmit={createRisk}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 15, marginTop: 18 }}>
                <label style={{ gridColumn: "1 / -1" }}>
                  <span className="risk-label">Risk title *</span>
                  <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} placeholder="e.g. Unauthorized tool execution" />
                </label>

                <label>
                  <span className="risk-label">Category</span>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                    {categories.map((category) => <option key={category}>{category}</option>)}
                  </select>
                </label>

                <label>
                  <span className="risk-label">Risk owner</span>
                  <select value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} style={inputStyle}>
                    {owners.map((owner) => <option key={owner}>{owner}</option>)}
                  </select>
                </label>

                <label>
                  <span className="risk-label">Likelihood (1–5)</span>
                  <select value={form.likelihood} onChange={(e) => setForm({ ...form, likelihood: Number(e.target.value) })} style={inputStyle}>
                    {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} — {["Rare", "Unlikely", "Possible", "Likely", "Almost certain"][n - 1]}</option>)}
                  </select>
                </label>

                <label>
                  <span className="risk-label">Impact (1–5)</span>
                  <select value={form.impact} onChange={(e) => setForm({ ...form, impact: Number(e.target.value) })} style={inputStyle}>
                    {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} — {["Negligible", "Minor", "Moderate", "Major", "Severe"][n - 1]}</option>)}
                  </select>
                </label>

                <div style={{ gridColumn: "1 / -1", padding: 13, borderRadius: 9, background: levelColors[getLevel(form.likelihood * form.impact)].bg, color: levelColors[getLevel(form.likelihood * form.impact)].color, fontSize: 12, fontWeight: 800 }}>
                  Calculated risk score: {form.likelihood * form.impact} / 25 — {getLevel(form.likelihood * form.impact)}
                </div>

                <label style={{ gridColumn: "1 / -1" }}>
                  <span className="risk-label">Risk description *</span>
                  <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, resize: "vertical" }} placeholder="Describe the potential event and its consequences." />
                </label>

                <label style={{ gridColumn: "1 / -1" }}>
                  <span className="risk-label">Mitigation plan *</span>
                  <textarea required rows={3} value={form.mitigation} onChange={(e) => setForm({ ...form, mitigation: e.target.value })} style={{ ...inputStyle, resize: "vertical" }} placeholder="Describe controls, actions, and validation steps." />
                </label>

                <label>
                  <span className="risk-label">Target due date *</span>
                  <input required type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} style={inputStyle} />
                </label>
              </div>

              {error && <p role="alert" style={{ color: "#B42318", fontSize: 12 }}>{error}</p>}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 9, marginTop: 20, paddingTop: 16, borderTop: `1px solid ${border}` }}>
                <button type="button" style={secondaryButton} onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" style={primaryButton}><Plus size={15} /> Register risk</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selectedRisk && (
        <div
          onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedRisk(null); }}
          style={{ position: "fixed", inset: 0, zIndex: 1000, padding: 18, display: "flex", justifyContent: "center", alignItems: "center", background: "rgba(15,23,42,.5)" }}
        >
          <section role="dialog" aria-modal="true" style={{ width: "100%", maxWidth: 650, maxHeight: "90vh", overflowY: "auto", background: "#FFFFFF", borderRadius: 14, padding: 22, boxShadow: "0 24px 70px rgba(15,23,42,.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ color: blue, fontSize: 11, fontWeight: 800 }}>{selectedRisk.id} · {selectedRisk.category}</div>
                <h2 style={{ margin: "8px 0", fontSize: 20 }}>{selectedRisk.title}</h2>
              </div>
              <button type="button" aria-label="Close risk details" style={secondaryButton} onClick={() => setSelectedRisk(null)}><X size={16} /></button>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "12px 0" }}>
              <LevelPill level={getLevel(getScore(selectedRisk))} />
              <StatusPill status={selectedRisk.status} />
              <span style={{ padding: "5px 9px", borderRadius: 20, background: "#F0F1F4", color: "#4B5563", fontSize: 10, fontWeight: 750 }}>
                Score {getScore(selectedRisk)} / 25
              </span>
            </div>

            <p style={{ fontSize: 13, lineHeight: 1.8, color: "#4B5563" }}>{selectedRisk.description}</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, margin: "18px 0" }}>
              {[
                ["Likelihood", `${selectedRisk.likelihood} / 5`],
                ["Impact", `${selectedRisk.impact} / 5`],
                ["Risk owner", selectedRisk.owner],
                ["Target date", selectedRisk.dueDate],
              ].map(([label, value]) => (
                <div key={label} style={{ border: `1px solid ${border}`, borderRadius: 9, padding: 12 }}>
                  <div style={{ color: muted, fontSize: 10 }}>{label}</div>
                  <div style={{ fontSize: 12, fontWeight: 750, marginTop: 6, lineHeight: 1.6 }}>{value}</div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: 13, marginBottom: 8 }}>Mitigation plan</h3>
            <div style={{ border: `1px solid ${border}`, borderRadius: 9, padding: 13, color: "#4B5563", fontSize: 12, lineHeight: 1.8 }}>
              {selectedRisk.mitigation}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 20, paddingTop: 16, borderTop: `1px solid ${border}` }}>
              {selectedRisk.status !== "Mitigating" && selectedRisk.status !== "Resolved" && (
                <button type="button" style={primaryButton} onClick={() => updateRisk({ ...selectedRisk, status: "Mitigating" })}>
                  <ShieldCheck size={15} /> Start mitigation
                </button>
              )}

              {selectedRisk.status !== "Under Review" && selectedRisk.status !== "Resolved" && (
                <button type="button" style={secondaryButton} onClick={() => updateRisk({ ...selectedRisk, status: "Under Review" })}>
                  <Clock3 size={15} /> Send for review
                </button>
              )}

              {selectedRisk.status !== "Resolved" && (
                <button type="button" style={secondaryButton} onClick={() => updateRisk({ ...selectedRisk, status: "Resolved" })}>
                  <CheckCircle2 size={15} /> Mark resolved
                </button>
              )}

              {selectedRisk.status === "Resolved" && (
                <button type="button" style={secondaryButton} onClick={() => updateRisk({ ...selectedRisk, status: "Open" })}>
                  <ArrowUpRight size={15} /> Reopen risk
                </button>
              )}
            </div>

            <p style={{ color: muted, fontSize: 11, lineHeight: 1.7, marginTop: 16 }}>
              Status changes are local demo actions. In production, require evidence
              and authorized review before resolving a risk.
            </p>
          </section>
        </div>
      )}
    </main>
  );
}
