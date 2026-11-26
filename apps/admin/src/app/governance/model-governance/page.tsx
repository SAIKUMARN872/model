
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Plus,
  Search,
  ShieldCheck,
  X,
  Database,
  ArrowUpRight,
} from "lucide-react";

type ModelStatus = "Approved" | "Under Review" | "Restricted" | "Draft";
type RiskLevel = "Low" | "Medium" | "High" | "Critical";

type ModelRecord = {
  id: string;
  name: string;
  provider: string;
  version: string;
  purpose: string;
  risk: RiskLevel;
  status: ModelStatus;
  owner: string;
  lastReviewed: string;
};

const initialModels: ModelRecord[] = [
  {
    id: "MDL-1001",
    name: "ModelNow Foundation",
    provider: "ModelNow",
    version: "2.1",
    purpose: "General-purpose enterprise assistant",
    risk: "High",
    status: "Approved",
    owner: "AI Platform Team",
    lastReviewed: "Oct 28, 2026",
  },
  {
    id: "MDL-1002",
    name: "ModelNow Efficient",
    provider: "ModelNow",
    version: "1.4",
    purpose: "Low-latency task execution",
    risk: "Medium",
    status: "Approved",
    owner: "Platform Team",
    lastReviewed: "Oct 25, 2026",
  },
  {
    id: "MDL-1003",
    name: "Enterprise Reasoner",
    provider: "External Provider",
    version: "3.0",
    purpose: "Complex reasoning and analysis",
    risk: "Critical",
    status: "Under Review",
    owner: "AI Governance Team",
    lastReviewed: "Oct 22, 2026",
  },
  {
    id: "MDL-1004",
    name: "Document Intelligence",
    provider: "ModelNow",
    version: "1.2",
    purpose: "Document extraction and summarization",
    risk: "Medium",
    status: "Draft",
    owner: "Knowledge Team",
    lastReviewed: "Oct 20, 2026",
  },
  {
    id: "MDL-1005",
    name: "Legacy Text Model",
    provider: "External Provider",
    version: "1.0",
    purpose: "Legacy text generation",
    risk: "High",
    status: "Restricted",
    owner: "Security Team",
    lastReviewed: "Oct 16, 2026",
  },
];

const blue = "#315FEA";
const muted = "#687386";
const border = "#E5E9F0";

const statusColors: Record<ModelStatus, { bg: string; color: string }> = {
  Approved: { bg: "#E8F7EF", color: "#16845B" },
  "Under Review": { bg: "#FFF4E5", color: "#B96A12" },
  Restricted: { bg: "#FDECEE", color: "#C33D46" },
  Draft: { bg: "#F0F2F5", color: "#667085" },
};

const riskColors: Record<RiskLevel, { bg: string; color: string }> = {
  Low: { bg: "#E8F7EF", color: "#16845B" },
  Medium: { bg: "#FFF4E5", color: "#B96A12" },
  High: { bg: "#FDECEE", color: "#C33D46" },
  Critical: { bg: "#F3E8FF", color: "#7E22CE" },
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  border: `1px solid ${border}`,
  borderRadius: 8,
  fontSize: 13,
  color: "#172033",
  background: "#FFFFFF",
};

function Badge({ value }: { value: ModelStatus | RiskLevel }) {
  const config =
    value in statusColors
      ? statusColors[value as ModelStatus]
      : riskColors[value as RiskLevel];

  return (
    <span
      style={{
        display: "inline-flex",
        padding: "5px 9px",
        borderRadius: 20,
        background: config.bg,
        color: config.color,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </span>
  );
}

function Metric({
  title,
  value,
  detail,
  icon: Icon,
  color,
  bg,
}: {
  title: string;
  value: number;
  detail: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <article
      style={{
        border: `1px solid ${border}`,
        borderRadius: 12,
        padding: 18,
        background: "#FFFFFF",
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <span style={{ color: muted, fontSize: 12, fontWeight: 650 }}>
          {title}
        </span>
        <span
          style={{
            width: 36,
            height: 36,
            display: "grid",
            placeItems: "center",
            borderRadius: 9,
            background: bg,
            color,
          }}
        >
          <Icon size={18} />
        </span>
      </div>
      <div style={{ fontSize: 29, fontWeight: 800, marginTop: 14 }}>
        {value}
      </div>
      <div style={{ color: muted, fontSize: 11, marginTop: 6 }}>{detail}</div>
    </article>
  );
}

export default function ModelGovernancePage() {
  const [models, setModels] = useState(initialModels);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [selected, setSelected] = useState<ModelRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    name: "",
    provider: "ModelNow",
    version: "1.0",
    purpose: "",
    risk: "Medium" as RiskLevel,
    owner: "AI Governance Team",
  });

  const metrics = useMemo(
    () => ({
      total: models.length,
      approved: models.filter((m) => m.status === "Approved").length,
      reviews: models.filter((m) => m.status === "Under Review").length,
      restricted: models.filter((m) => m.status === "Restricted").length,
      highRisk: models.filter(
        (m) =>
          (m.risk === "High" || m.risk === "Critical") &&
          m.status !== "Approved",
      ).length,
    }),
    [models],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    return models.filter((m) => {
      const matchesSearch =
        !q ||
        [m.id, m.name, m.provider, m.owner, m.purpose, m.version]
          .join(" ")
          .toLowerCase()
          .includes(q);

      return (
        matchesSearch &&
        (statusFilter === "All" || m.status === statusFilter) &&
        (riskFilter === "All" || m.risk === riskFilter)
      );
    });
  }, [models, search, statusFilter, riskFilter]);

  function updateStatus(model: ModelRecord, status: ModelStatus) {
    const updated = { ...model, status };
    setModels((current) =>
      current.map((m) => (m.id === model.id ? updated : m)),
    );
    setSelected(updated);
    setNotice(`${model.name} status changed to ${status}.`);
  }

  function createModel(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!form.name.trim() || !form.purpose.trim()) {
      setFormError("Enter both a model name and its intended purpose.");
      return;
    }

    const nextId =
      Math.max(1000, ...models.map((m) => Number(m.id.slice(4)))) + 1;

    const model: ModelRecord = {
      ...form,
      id: `MDL-${nextId}`,
      name: form.name.trim(),
      purpose: form.purpose.trim(),
      status: "Draft",
      lastReviewed: "Not reviewed",
    };

    setModels((current) => [model, ...current]);
    setForm({
      name: "",
      provider: "ModelNow",
      version: "1.0",
      purpose: "",
      risk: "Medium",
      owner: "AI Governance Team",
    });
    setShowForm(false);
    setNotice(`${model.name} added to the model inventory as a draft.`);
  }

  const buttonStyle: React.CSSProperties = {
    border: `1px solid ${border}`,
    borderRadius: 8,
    background: "#FFFFFF",
    padding: "9px 12px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    color: "#172033",
  };

  const primaryStyle: React.CSSProperties = {
    ...buttonStyle,
    background: blue,
    color: "#FFFFFF",
    borderColor: blue,
  };

  return (
    <main
      style={{
        minHeight: "100%",
        background: "#F7F8FA",
        padding: "28px",
        color: "#172033",
        fontFamily: "inherit",
      }}
    >
      <style>{`
        * { box-sizing: border-box; }
        .mg-table { width: 100%; border-collapse: collapse; text-align: left; min-width: 850px; }
        .mg-table th { background: #FAFBFC; color: #687386; font-size: 10px; letter-spacing: .06em; padding: 13px 14px; white-space: nowrap; border-bottom: 1px solid ${border}; }
        .mg-table td { padding: 14px; border-bottom: 1px solid ${border}; font-size: 12px; }
        .mg-table tr:last-child td { border-bottom: 0; }
        .mg-table tbody tr:hover { background: #FAFBFF; }
        .mg-action { border: 1px solid ${border}; border-radius: 7px; background: #fff; padding: 6px 9px; font-size: 11px; cursor: pointer; font-weight: 650; }
        .mg-action:hover { background: #F3F6FF; border-color: #CBD6FF; }
        .mg-card { background: #fff; border: 1px solid ${border}; border-radius: 12px; }
        .mg-label { display: block; font-size: 12px; font-weight: 700; margin-bottom: 7px; color: #4B5563; }
        @media(max-width:700px) {
          .mg-page { padding: 16px !important; }
          .mg-header { align-items: stretch !important; }
          .mg-header-actions { width: 100%; }
          .mg-header-actions button { flex: 1; }
        }
      `}</style>

      <header
        className="mg-header"
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
            <BrainCircuit size={16} /> Governance / Model Governance
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
            Model Governance
          </h1>
          <p
            style={{
              color: muted,
              fontSize: 14,
              lineHeight: 1.7,
              margin: "10px 0 0",
            }}
          >
            Maintain an accountable inventory of AI models, assess risk, manage
            lifecycle approvals, and monitor restrictions before models are used
            in enterprise workflows.
          </p>
        </div>

        <div
          className="mg-header-actions"
          style={{ display: "flex", flexWrap: "wrap", gap: 9 }}
        >
          <button
            type="button"
            style={buttonStyle}
            onClick={() => {
              setSearch("");
              setStatusFilter("All");
              setRiskFilter("All");
              setNotice("Filters have been reset.");
            }}
          >
            Reset filters
          </button>
          <button
            type="button"
            style={primaryStyle}
            onClick={() => {
              setFormError("");
              setShowForm(true);
            }}
          >
            <Plus size={15} /> Register model
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
            background: "#F0FBF5",
            border: "1px solid #BDE8CF",
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
          gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
          gap: 13,
          marginBottom: 22,
        }}
      >
        <Metric
          title="Registered Models"
          value={metrics.total}
          detail="Models in this demo inventory"
          icon={Database}
          color={blue}
          bg="#EEF3FF"
        />
        <Metric
          title="Approved Models"
          value={metrics.approved}
          detail="Marked approved for use"
          icon={ShieldCheck}
          color="#16845B"
          bg="#E8F7EF"
        />
        <Metric
          title="Pending Reviews"
          value={metrics.reviews}
          detail="Awaiting governance review"
          icon={Clock3}
          color="#B96A12"
          bg="#FFF4E5"
        />
        <Metric
          title="Restricted Models"
          value={metrics.restricted}
          detail="Currently restricted in this inventory"
          icon={AlertTriangle}
          color="#C33D46"
          bg="#FDECEE"
        />
      </section>

      <section
        className="mg-card"
        style={{ padding: 18, marginBottom: 22 }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 15,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>
              Model lifecycle overview
            </h2>
            <p style={{ margin: "5px 0 0", fontSize: 12, color: muted }}>
              Current model states based on the inventory below.
            </p>
          </div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              color: muted,
              padding: "7px 9px",
              border: `1px solid ${border}`,
              borderRadius: 8,
            }}
          >
            <Activity size={14} color={blue} /> Local demo data
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
            gap: 12,
          }}
        >
          {(
            [
              ["Approved", metrics.approved, "#16845B", "#E8F7EF"],
              ["Under Review", metrics.reviews, "#B96A12", "#FFF4E5"],
              [
                "Restricted",
                metrics.restricted,
                "#C33D46",
                "#FDECEE",
              ],
              [
                "Draft",
                models.filter((m) => m.status === "Draft").length,
                "#667085",
                "#F0F2F5",
              ],
            ] as const
          ).map(([label, value, color, bg]) => (
            <button
              type="button"
              key={label}
              onClick={() => setStatusFilter(label)}
              style={{
                border: `1px solid ${border}`,
                background: statusFilter === label ? bg : "#FFFFFF",
                borderRadius: 10,
                padding: 14,
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 11, color: muted }}>{label}</div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color,
                  marginTop: 7,
                }}
              >
                {value}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color,
                  marginTop: 5,
                  fontWeight: 700,
                }}
              >
                View models <ArrowUpRight size={11} />
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="mg-card">
        <div
          style={{
            padding: "18px 20px",
            borderBottom: `1px solid ${border}`,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>
            Model inventory
          </h2>
          <p style={{ margin: "5px 0 0", fontSize: 12, color: muted }}>
            Search models and manage their governance status.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            padding: "15px 20px",
            borderBottom: `1px solid ${border}`,
          }}
        >
          <div style={{ position: "relative", flex: "1 1 230px" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                top: 11,
                left: 11,
                color: muted,
              }}
            />
            <input
              aria-label="Search models"
              placeholder="Search by model, provider, owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 36 }}
            />
          </div>
          <select
            aria-label="Filter model status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ ...inputStyle, width: "auto", minWidth: 150 }}
          >
            <option value="All">All statuses</option>
            {(["Approved", "Under Review", "Restricted", "Draft"] as const).map(
              (s) => (
                <option key={s}>{s}</option>
              ),
            )}
          </select>
          <select
            aria-label="Filter model risk"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            style={{ ...inputStyle, width: "auto", minWidth: 130 }}
          >
            <option value="All">All risk levels</option>
            {(["Low", "Medium", "High", "Critical"] as const).map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="mg-table">
            <thead>
              <tr>
                <th>MODEL</th>
                <th>PROVIDER</th>
                <th>VERSION</th>
                <th>RISK</th>
                <th>STATUS</th>
                <th>OWNER</th>
                <th>LAST REVIEWED</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((model) => (
                <tr key={model.id}>
                  <td>
                    <button
                      type="button"
                      onClick={() => setSelected(model)}
                      style={{
                        display: "block",
                        border: 0,
                        padding: 0,
                        background: "transparent",
                        fontWeight: 750,
                        color: "#172033",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      {model.name}
                    </button>
                    <div
                      style={{
                        fontSize: 10,
                        color: muted,
                        marginTop: 5,
                      }}
                    >
                      {model.id}
                    </div>
                  </td>
                  <td>{model.provider}</td>
                  <td>v{model.version}</td>
                  <td>
                    <Badge value={model.risk} />
                  </td>
                  <td>
                    <Badge value={model.status} />
                  </td>
                  <td>{model.owner}</td>
                  <td style={{ color: muted, whiteSpace: "nowrap" }}>
                    {model.lastReviewed}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="mg-action"
                      onClick={() => setSelected(model)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: 35, textAlign: "center" }}>
                    <Search
                      size={23}
                      color={muted}
                      style={{ marginBottom: 8 }}
                    />
                    <div style={{ fontWeight: 750 }}>No models found</div>
                    <p style={{ color: muted, fontSize: 12 }}>
                      Change your search or filter settings.
                    </p>
                    <button
                      type="button"
                      style={buttonStyle}
                      onClick={() => {
                        setSearch("");
                        setStatusFilter("All");
                        setRiskFilter("All");
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
            borderTop: `1px solid ${border}`,
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
            color: muted,
            fontSize: 11,
          }}
        >
          <span>
            Showing {filtered.length} of {models.length} models
          </span>
          <span>Actions currently update local demo state</span>
        </div>
      </section>

      <section
        style={{
          marginTop: 20,
          padding: 15,
          border: `1px solid ${border}`,
          borderRadius: 10,
          background: "#FFFFFF",
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          color: muted,
          fontSize: 11,
          lineHeight: 1.7,
        }}
      >
        <ShieldCheck size={17} color={blue} />
        <span>
          <strong style={{ color: "#172033" }}>Governance notice.</strong>{" "}
          This page uses sample data and local React state. Model registration
          and status changes are not persisted and do not enforce production
          access controls. Connect backend APIs, audit logging, and approval
          services before using these actions operationally.
        </span>
      </section>

      {showForm && (
        <div
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowForm(false);
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
              background: "#FFFFFF",
              borderRadius: 14,
              width: "100%",
              maxWidth: 620,
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 22,
              boxShadow: "0 24px 70px rgba(15,23,42,.25)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: 19 }}>Register AI model</h2>
                <p style={{ color: muted, fontSize: 12, lineHeight: 1.6 }}>
                  Add a model to the governance inventory for review.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close form"
                onClick={() => setShowForm(false)}
                style={buttonStyle}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={createModel}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))",
                  gap: 15,
                }}
              >
                <label>
                  <span className="mg-label">Model name *</span>
                  <input
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="e.g. Customer Support Model"
                    style={inputStyle}
                  />
                </label>

                <label>
                  <span className="mg-label">Provider</span>
                  <select
                    value={form.provider}
                    onChange={(e) =>
                      setForm({ ...form, provider: e.target.value })
                    }
                    style={inputStyle}
                  >
                    <option>ModelNow</option>
                    <option>OpenAI</option>
                    <option>Anthropic</option>
                    <option>Google</option>
                    <option>Meta</option>
                    <option>External Provider</option>
                  </select>
                </label>

                <label>
                  <span className="mg-label">Version</span>
                  <input
                    value={form.version}
                    onChange={(e) =>
                      setForm({ ...form, version: e.target.value })
                    }
                    style={inputStyle}
                  />
                </label>

                <label>
                  <span className="mg-label">Risk level</span>
                  <select
                    value={form.risk}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        risk: e.target.value as RiskLevel,
                      })
                    }
                    style={inputStyle}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </label>

                <label style={{ gridColumn: "1 / -1" }}>
                  <span className="mg-label">Intended purpose *</span>
                  <textarea
                    required
                    rows={3}
                    value={form.purpose}
                    onChange={(e) =>
                      setForm({ ...form, purpose: e.target.value })
                    }
                    placeholder="Describe the model's expected use..."
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                </label>

                <label style={{ gridColumn: "1 / -1" }}>
                  <span className="mg-label">Accountable owner</span>
                  <select
                    value={form.owner}
                    onChange={(e) =>
                      setForm({ ...form, owner: e.target.value })
                    }
                    style={inputStyle}
                  >
                    <option>AI Governance Team</option>
                    <option>AI Platform Team</option>
                    <option>Security Team</option>
                    <option>Knowledge Team</option>
                    <option>Platform Team</option>
                    <option>Data Governance Team</option>
                  </select>
                </label>
              </div>

              {formError && (
                <p role="alert" style={{ color: "#C33D46", fontSize: 12 }}>
                  {formError}
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 9,
                  marginTop: 22,
                  paddingTop: 17,
                  borderTop: `1px solid ${border}`,
                }}
              >
                <button
                  type="button"
                  style={buttonStyle}
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={primaryStyle}>
                  <Plus size={15} /> Register model
                </button>
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
            justifyContent: "center",
            alignItems: "center",
            background: "rgba(15,23,42,.5)",
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            style={{
              background: "#FFFFFF",
              borderRadius: 14,
              width: "100%",
              maxWidth: 650,
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 22,
              boxShadow: "0 24px 70px rgba(15,23,42,.25)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 18,
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: 19 }}>{selected.name}</h2>
                <p style={{ margin: "6px 0 0", fontSize: 12, color: muted }}>
                  {selected.id} · Version {selected.version}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close details"
                onClick={() => setSelected(null)}
                style={buttonStyle}
              >
                <X size={16} />
              </button>
            </div>

            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 18,
              }}
            >
              <Badge value={selected.status} />
              <Badge value={selected.risk} />
            </div>

            <p style={{ fontSize: 13, lineHeight: 1.8, color: "#4B5563" }}>
              {selected.purpose}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
                gap: 10,
                margin: "18px 0",
              }}
            >
              {[
                ["Provider", selected.provider],
                ["Owner", selected.owner],
                ["Risk level", selected.risk],
                ["Last reviewed", selected.lastReviewed],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    padding: 12,
                    border: `1px solid ${border}`,
                    borderRadius: 9,
                  }}
                >
                  <div style={{ color: muted, fontSize: 10 }}>{label}</div>
                  <div style={{ fontWeight: 750, fontSize: 12, marginTop: 6 }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 9,
                paddingTop: 17,
                borderTop: `1px solid ${border}`,
              }}
            >
              {selected.status !== "Approved" && (
                <button
                  type="button"
                  style={primaryStyle}
                  onClick={() => updateStatus(selected, "Approved")}
                >
                  <CheckCircle2 size={15} /> Approve model
                </button>
              )}

              {selected.status !== "Under Review" && (
                <button
                  type="button"
                  style={buttonStyle}
                  onClick={() => updateStatus(selected, "Under Review")}
                >
                  <Clock3 size={15} /> Send for review
                </button>
              )}

              {selected.status !== "Restricted" && (
                <button
                  type="button"
                  style={buttonStyle}
                  onClick={() => updateStatus(selected, "Restricted")}
                >
                  <AlertTriangle size={15} /> Restrict model
                </button>
              )}

              {selected.status !== "Draft" && (
                <button
                  type="button"
                  style={buttonStyle}
                  onClick={() => updateStatus(selected, "Draft")}
                >
                  Move to draft
                </button>
              )}
            </div>

            <p
              style={{
                fontSize: 11,
                color: muted,
                lineHeight: 1.7,
                marginTop: 17,
              }}
            >
              These actions change the local demonstration inventory only.
              Production approvals must be enforced by authenticated backend
              services and recorded in audit logs.
            </p>
          </section>
        </div>
      )}
    </main>
  );
}
