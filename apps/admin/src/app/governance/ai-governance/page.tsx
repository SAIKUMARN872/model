
"use client";

import { useMemo, useState, type CSSProperties, type FormEvent } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BrainCircuit,
  Check,
  CheckCircle2,
  Clock3,
  ClipboardCheck,
  Eye,
  FileCheck2,
  Filter,
  LockKeyhole,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";

type ModelStatus = "Approved" | "Under Review" | "Pending" | "Restricted";
type RiskLevel = "Low" | "Medium" | "High" | "Critical";

type AIModel = {
  id: string;
  name: string;
  provider: string;
  version: string;
  useCase: string;
  owner: string;
  risk: RiskLevel;
  status: ModelStatus;
  deployment: string;
  lastReviewed: string;
  humanOversight: boolean;
  description: string;
};

const initialModels: AIModel[] = [
  {
    id: "AIG-1001",
    name: "ModelNow Foundation",
    provider: "ModelNow",
    version: "v1.2",
    useCase: "Enterprise assistant",
    owner: "AI Platform Team",
    risk: "Medium",
    status: "Approved",
    deployment: "Production",
    lastReviewed: "Oct 28, 2026",
    humanOversight: true,
    description:
      "General-purpose enterprise assistant for knowledge discovery, summarization, and business productivity.",
  },
  {
    id: "AIG-1002",
    name: "Customer Support Assistant",
    provider: "ModelNow",
    version: "v2.1",
    useCase: "Customer support",
    owner: "Customer Experience",
    risk: "High",
    status: "Under Review",
    deployment: "Staging",
    lastReviewed: "Oct 27, 2026",
    humanOversight: true,
    description:
      "Assists support teams with customer questions, response suggestions, and ticket categorization.",
  },
  {
    id: "AIG-1003",
    name: "Document Intelligence",
    provider: "External Provider",
    version: "v1.4",
    useCase: "Document processing",
    owner: "Knowledge Team",
    risk: "Medium",
    status: "Approved",
    deployment: "Production",
    lastReviewed: "Oct 24, 2026",
    humanOversight: true,
    description:
      "Extracts information from enterprise documents and supports internal knowledge workflows.",
  },
  {
    id: "AIG-1004",
    name: "Automated Decision Assistant",
    provider: "External Provider",
    version: "v0.9",
    useCase: "Decision support",
    owner: "Risk Management",
    risk: "Critical",
    status: "Pending",
    deployment: "Not deployed",
    lastReviewed: "Oct 22, 2026",
    humanOversight: false,
    description:
      "Decision-support model awaiting risk assessment, validation, and approval of human oversight controls.",
  },
  {
    id: "AIG-1005",
    name: "Code Assistant",
    provider: "ModelNow",
    version: "v1.1",
    useCase: "Developer productivity",
    owner: "Engineering",
    risk: "High",
    status: "Under Review",
    deployment: "Staging",
    lastReviewed: "Oct 20, 2026",
    humanOversight: true,
    description:
      "Helps developers understand code, suggest improvements, and generate implementation drafts.",
  },
  {
    id: "AIG-1006",
    name: "Legacy Classification Model",
    provider: "External Provider",
    version: "v1.0",
    useCase: "Content classification",
    owner: "AI Platform Team",
    risk: "High",
    status: "Restricted",
    deployment: "Restricted",
    lastReviewed: "Oct 18, 2026",
    humanOversight: false,
    description:
      "A legacy model restricted while its evaluation evidence and oversight arrangements are reassessed.",
  },
];

const palette = {
  blue: "#315FEA",
  blueLight: "#EEF3FF",
  green: "#16845B",
  greenLight: "#E8F7EF",
  orange: "#B96A12",
  orangeLight: "#FFF4E5",
  red: "#C33D46",
  redLight: "#FDECEE",
  purple: "#7555C7",
  purpleLight: "#F2EDFF",
  text: "#172033",
  muted: "#6B7280",
  border: "#E5E7EB",
  background: "#F7F8FA",
  white: "#FFFFFF",
};

const css: Record<string, CSSProperties> = {
  page: {
    minHeight: "100%",
    padding: "28px",
    background: palette.background,
    color: palette.text,
    fontFamily: "inherit",
    maxWidth: "1600px",
    margin: "0 auto",
  },
  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "10px 13px",
    border: `1px solid ${palette.border}`,
    borderRadius: "9px",
    background: palette.white,
    color: palette.text,
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  primary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "10px 14px",
    border: `1px solid ${palette.blue}`,
    borderRadius: "9px",
    background: palette.blue,
    color: "#FFFFFF",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  panel: {
    background: palette.white,
    border: `1px solid ${palette.border}`,
    borderRadius: "13px",
    overflow: "hidden",
  },
  input: {
    boxSizing: "border-box",
    width: "100%",
    padding: "10px 11px",
    border: `1px solid ${palette.border}`,
    borderRadius: "8px",
    outline: "none",
    color: palette.text,
    background: palette.white,
    fontSize: "12px",
  },
  label: {
    display: "block",
    marginBottom: "7px",
    fontSize: "12px",
    fontWeight: 700,
    color: "#4B5563",
  },
};

function StatusBadge({ status }: { status: ModelStatus }) {
  const config: Record<ModelStatus, { color: string; bg: string }> = {
    Approved: { color: palette.green, bg: palette.greenLight },
    "Under Review": { color: palette.orange, bg: palette.orangeLight },
    Pending: { color: palette.purple, bg: palette.purpleLight },
    Restricted: { color: palette.red, bg: palette.redLight },
  };

  const item = config[status];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "5px 9px",
        borderRadius: "20px",
        background: item.bg,
        color: item.color,
        fontSize: "10px",
        fontWeight: 750,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: item.color,
        }}
      />
      {status}
    </span>
  );
}

function RiskBadge({ risk }: { risk: RiskLevel }) {
  const config: Record<RiskLevel, { color: string; bg: string }> = {
    Low: { color: palette.green, bg: palette.greenLight },
    Medium: { color: palette.orange, bg: palette.orangeLight },
    High: { color: palette.red, bg: palette.redLight },
    Critical: { color: "#8B1E2D", bg: "#FCE4E7" },
  };

  return (
    <span
      style={{
        display: "inline-flex",
        padding: "5px 8px",
        borderRadius: "6px",
        background: config[risk].bg,
        color: config[risk].color,
        fontSize: "10px",
        fontWeight: 750,
      }}
    >
      {risk}
    </span>
  );
}

function Metric({
  title,
  value,
  description,
  icon: Icon,
  color,
  bg,
}: {
  title: string;
  value: number | string;
  description: string;
  icon: typeof BrainCircuit;
  color: string;
  bg: string;
}) {
  return (
    <article
      style={{
        background: palette.white,
        border: `1px solid ${palette.border}`,
        borderRadius: "12px",
        padding: "18px",
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span style={{ fontSize: "12px", color: palette.muted, fontWeight: 650 }}>
          {title}
        </span>
        <span
          style={{
            width: "36px",
            height: "36px",
            display: "grid",
            placeItems: "center",
            background: bg,
            color,
            borderRadius: "9px",
            flexShrink: 0,
          }}
        >
          <Icon size={18} />
        </span>
      </div>
      <div
        style={{
          marginTop: "13px",
          fontSize: "29px",
          fontWeight: 800,
          letterSpacing: "-0.8px",
        }}
      >
        {value}
      </div>
      <div
        style={{
          marginTop: "6px",
          color: palette.muted,
          fontSize: "11px",
          lineHeight: 1.6,
        }}
      >
        {description}
      </div>
    </article>
  );
}

function Modal({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "18px",
        background: "rgba(15,23,42,0.48)",
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        style={{
          width: "100%",
          maxWidth: "650px",
          maxHeight: "90vh",
          overflowY: "auto",
          background: palette.white,
          borderRadius: "15px",
          boxShadow: "0 24px 80px rgba(15,23,42,0.24)",
        }}
      >
        <header
          style={{
            padding: "20px 22px",
            borderBottom: `1px solid ${palette.border}`,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "15px",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 800 }}>
              {title}
            </h2>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "12px",
                lineHeight: 1.6,
                color: palette.muted,
              }}
            >
              {subtitle}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            style={{ ...css.button, padding: "7px", border: "none" }}
          >
            <X size={17} />
          </button>
        </header>
        <div style={{ padding: "22px" }}>{children}</div>
      </section>
    </div>
  );
}

const emptyModel = (): Omit<AIModel, "id" | "lastReviewed"> => ({
  name: "",
  provider: "ModelNow",
  version: "v1.0",
  useCase: "",
  owner: "AI Platform Team",
  risk: "Medium",
  status: "Pending",
  deployment: "Not deployed",
  humanOversight: true,
  description: "",
});

export default function AIGovernancePage() {
  const [models, setModels] = useState<AIModel[]>(initialModels);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [riskFilter, setRiskFilter] = useState("All risks");
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyModel());
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  const metrics = useMemo(() => {
    return {
      total: models.length,
      approved: models.filter((m) => m.status === "Approved").length,
      reviews: models.filter((m) => m.status === "Under Review").length,
      pending: models.filter((m) => m.status === "Pending").length,
      highRisk: models.filter(
        (m) =>
          (m.risk === "High" || m.risk === "Critical") &&
          m.status !== "Approved",
      ).length,
      oversight: models.filter((m) => m.humanOversight).length,
    };
  }, [models]);

  const filteredModels = useMemo(() => {
    const query = search.trim().toLowerCase();

    return models.filter((model) => {
      const matchesSearch =
        !query ||
        [
          model.id,
          model.name,
          model.provider,
          model.useCase,
          model.owner,
          model.description,
        ].some((value) => value.toLowerCase().includes(query));

      return (
        matchesSearch &&
        (statusFilter === "All statuses" || model.status === statusFilter) &&
        (riskFilter === "All risks" || model.risk === riskFilter)
      );
    });
  }, [models, search, statusFilter, riskFilter]);

  function openCreateForm() {
    setForm(emptyModel());
    setFormError("");
    setShowForm(true);
  }

  function updateModelStatus(model: AIModel, status: ModelStatus) {
    const updated = { ...model, status };
    if (status === "Approved") {
      updated.deployment = "Staging";
    }
    if (status === "Restricted") {
      updated.deployment = "Restricted";
    }

    setModels((current) =>
      current.map((item) => (item.id === model.id ? updated : item)),
    );
    setSelectedModel(updated);
    setNotice(`${model.name} status changed to ${status}.`);
  }

  function saveModel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!form.name.trim() || !form.useCase.trim() || !form.description.trim()) {
      setFormError("Please complete the model name, use case, and description.");
      return;
    }

    const number =
      Math.max(1000, ...models.map((m) => Number(m.id.replace("AIG-", "")))) +
      1;

    const today = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    const created: AIModel = {
      ...form,
      id: `AIG-${number}`,
      name: form.name.trim(),
      useCase: form.useCase.trim(),
      description: form.description.trim(),
      lastReviewed: today,
    };

    setModels((current) => [created, ...current]);
    setShowForm(false);
    setNotice(`${created.name} added to the AI governance inventory.`);
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("All statuses");
    setRiskFilter("All risks");
    setNotice("Search and filters have been reset.");
  }

  const field = <K extends keyof ReturnType<typeof emptyModel>>(
    key: K,
    value: ReturnType<typeof emptyModel>[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  return (
    <main style={css.page}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "20px",
          marginBottom: "25px",
        }}
      >
        <div style={{ maxWidth: "820px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              color: palette.blue,
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              marginBottom: "10px",
            }}
          >
            <ShieldCheck size={15} />
            Governance / AI Governance
          </div>
          <h1
            style={{
              fontSize: "29px",
              lineHeight: 1.2,
              fontWeight: 800,
              letterSpacing: "-0.8px",
              margin: 0,
            }}
          >
            AI Governance
          </h1>
          <p
            style={{
              color: palette.muted,
              fontSize: "13px",
              lineHeight: 1.8,
              maxWidth: "750px",
              marginTop: "10px",
            }}
          >
            Govern AI systems across their lifecycle. Review model approvals,
            risk classifications, permitted use cases, human oversight, and
            responsible deployment requirements.
          </p>
        </div>

        <div style={{ display: "flex", gap: "9px", flexWrap: "wrap" }}>
          <button type="button" style={css.button} onClick={resetFilters}>
            <RefreshCw size={15} />
            Reset filters
          </button>
          <button type="button" style={css.primary} onClick={openCreateForm}>
            <Plus size={16} />
            Register AI model
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
            gap: "12px",
            padding: "11px 14px",
            marginBottom: "18px",
            border: "1px solid #BDE8CF",
            borderRadius: "9px",
            background: "#F0FBF5",
            color: "#176B48",
            fontSize: "12px",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle2 size={16} />
            {notice}
          </span>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
            style={{
              border: "none",
              background: "transparent",
              color: "inherit",
              cursor: "pointer",
            }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(195px, 1fr))",
          gap: "14px",
          marginBottom: "22px",
        }}
      >
        <Metric
          title="Registered AI Models"
          value={metrics.total}
          description="Models tracked in this workspace"
          icon={BrainCircuit}
          color={palette.blue}
          bg={palette.blueLight}
        />
        <Metric
          title="Approved Models"
          value={metrics.approved}
          description="Marked approved in this demo inventory"
          icon={ShieldCheck}
          color={palette.green}
          bg={palette.greenLight}
        />
        <Metric
          title="Pending Reviews"
          value={metrics.reviews + metrics.pending}
          description="Models awaiting governance decisions"
          icon={Clock3}
          color={palette.orange}
          bg={palette.orangeLight}
        />
        <Metric
          title="High-Risk Follow-up"
          value={metrics.highRisk}
          description="High or critical risk, not approved"
          icon={AlertTriangle}
          color={palette.red}
          bg={palette.redLight}
        />
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px",
          marginBottom: "24px",
        }}
      >
        {[
          {
            title: "Human Oversight",
            value: `${metrics.oversight} of ${metrics.total}`,
            detail: "Models with oversight marked as enabled",
            icon: Users,
            color: palette.purple,
            bg: palette.purpleLight,
          },
          {
            title: "Approval Coverage",
            value: `${metrics.total ? Math.round((metrics.approved / metrics.total) * 100) : 0}%`,
            detail: "Share of models marked approved",
            icon: Activity,
            color: palette.green,
            bg: palette.greenLight,
          },
          {
            title: "Governance Evidence",
            value: "Needs verification",
            detail: "Connect evaluation and audit evidence",
            icon: ClipboardCheck,
            color: palette.orange,
            bg: palette.orangeLight,
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.title}
              style={{
                ...css.panel,
                padding: "17px",
                display: "flex",
                alignItems: "center",
                gap: "13px",
              }}
            >
              <span
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "10px",
                  background: item.bg,
                  color: item.color,
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={20} />
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: "11px", color: palette.muted }}>
                  {item.title}
                </div>
                <div
                  style={{
                    fontSize: "17px",
                    fontWeight: 800,
                    marginTop: "5px",
                    overflowWrap: "anywhere",
                  }}
                >
                  {item.value}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    lineHeight: 1.5,
                    color: palette.muted,
                    marginTop: "4px",
                  }}
                >
                  {item.detail}
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section style={{ ...css.panel, marginBottom: "24px" }}>
        <header
          style={{
            padding: "18px 20px",
            borderBottom: `1px solid ${palette.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 800 }}>
              AI Model Inventory
            </h2>
            <p
              style={{
                margin: "5px 0 0",
                color: palette.muted,
                fontSize: "11px",
                lineHeight: 1.6,
              }}
            >
              Review model risk, ownership, lifecycle status, and deployment.
            </p>
          </div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              border: `1px solid ${palette.border}`,
              borderRadius: "8px",
              padding: "7px 9px",
              fontSize: "10px",
              color: palette.muted,
              background: "#FAFBFC",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: palette.green,
              }}
            />
            Demo workspace
          </span>
        </header>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            padding: "16px 20px",
            borderBottom: `1px solid ${palette.border}`,
          }}
        >
          <div style={{ flex: "1 1 230px", position: "relative" }}>
            <Search
              size={15}
              style={{
                position: "absolute",
                left: "11px",
                top: "11px",
                color: palette.muted,
              }}
            />
            <input
              aria-label="Search AI models"
              placeholder="Search models, providers, owners..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              style={{ ...css.input, paddingLeft: "35px" }}
            />
          </div>

          <select
            aria-label="Filter model status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            style={{ ...css.input, width: "auto", minWidth: "145px" }}
          >
            <option>All statuses</option>
            <option>Approved</option>
            <option>Under Review</option>
            <option>Pending</option>
            <option>Restricted</option>
          </select>

          <select
            aria-label="Filter model risk"
            value={riskFilter}
            onChange={(event) => setRiskFilter(event.target.value)}
            style={{ ...css.input, width: "auto", minWidth: "125px" }}
          >
            <option>All risks</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>

          <button
            type="button"
            style={css.button}
            onClick={() => {
              setStatusFilter("All statuses");
              setRiskFilter("All risks");
            }}
          >
            <Filter size={14} />
            Clear filters
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              minWidth: "1050px",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr style={{ background: "#FAFBFC" }}>
                {[
                  "MODEL",
                  "PROVIDER",
                  "USE CASE",
                  "OWNER",
                  "RISK",
                  "STATUS",
                  "DEPLOYMENT",
                  "",
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      padding: "12px 14px",
                      borderBottom: `1px solid ${palette.border}`,
                      color: palette.muted,
                      fontSize: "10px",
                      letterSpacing: "0.05em",
                      fontWeight: 800,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredModels.map((model) => (
                <tr
                  key={model.id}
                  style={{ borderBottom: `1px solid ${palette.border}` }}
                >
                  <td style={{ padding: "15px 14px", minWidth: "185px" }}>
                    <button
                      type="button"
                      onClick={() => setSelectedModel(model)}
                      style={{
                        border: "none",
                        background: "transparent",
                        padding: 0,
                        color: palette.text,
                        fontSize: "12px",
                        fontWeight: 750,
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      {model.name}
                    </button>
                    <div
                      style={{
                        marginTop: "5px",
                        fontSize: "10px",
                        color: palette.muted,
                      }}
                    >
                      {model.id} · {model.version}
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "15px 14px",
                      fontSize: "11px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {model.provider}
                  </td>
                  <td style={{ padding: "15px 14px", fontSize: "11px" }}>
                    {model.useCase}
                  </td>
                  <td
                    style={{
                      padding: "15px 14px",
                      fontSize: "11px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {model.owner}
                  </td>
                  <td style={{ padding: "15px 14px" }}>
                    <RiskBadge risk={model.risk} />
                  </td>
                  <td style={{ padding: "15px 14px" }}>
                    <StatusBadge status={model.status} />
                  </td>
                  <td
                    style={{
                      padding: "15px 14px",
                      fontSize: "11px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {model.deployment}
                  </td>
                  <td style={{ padding: "15px 14px" }}>
                    <button
                      type="button"
                      aria-label={`View ${model.name}`}
                      onClick={() => setSelectedModel(model)}
                      style={{
                        border: "none",
                        background: "transparent",
                        color: palette.muted,
                        padding: "5px",
                        cursor: "pointer",
                      }}
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredModels.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: "42px 20px" }}>
                    <div style={{ textAlign: "center" }}>
                      <Search
                        size={23}
                        color={palette.muted}
                        style={{ margin: "0 auto 10px" }}
                      />
                      <div style={{ fontSize: "13px", fontWeight: 750 }}>
                        No models found
                      </div>
                      <p
                        style={{
                          fontSize: "11px",
                          color: palette.muted,
                        }}
                      >
                        Change your search term or reset the filters.
                      </p>
                      <button
                        type="button"
                        style={css.button}
                        onClick={resetFilters}
                      >
                        Reset filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer
          style={{
            padding: "13px 20px",
            borderTop: `1px solid ${palette.border}`,
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
            fontSize: "10px",
            color: palette.muted,
          }}
        >
          <span>
            Showing {filteredModels.length} of {models.length} models
          </span>
          <span>Inventory changes are local to this demo</span>
        </footer>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))",
          gap: "18px",
          marginBottom: "24px",
        }}
      >
        <article style={css.panel}>
          <header
            style={{
              padding: "18px",
              borderBottom: `1px solid ${palette.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: "14px", fontWeight: 800 }}>
                Attention Required
              </h2>
              <p
                style={{
                  margin: "5px 0 0",
                  fontSize: "11px",
                  color: palette.muted,
                }}
              >
                Models that may need follow-up
              </p>
            </div>
            <AlertTriangle size={18} color={palette.orange} />
          </header>
          <div style={{ padding: "8px 18px" }}>
            {models
              .filter(
                (model) =>
                  model.status === "Pending" ||
                  model.status === "Under Review" ||
                  model.status === "Restricted" ||
                  model.risk === "Critical",
              )
              .slice(0, 5)
              .map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => setSelectedModel(model)}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    padding: "13px 0",
                    border: "none",
                    borderBottom: `1px solid ${palette.border}`,
                    background: "transparent",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 750,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {model.name}
                    </div>
                    <div
                      style={{
                        marginTop: "5px",
                        fontSize: "10px",
                        color: palette.muted,
                      }}
                    >
                      {model.id} · {model.risk} risk
                    </div>
                  </div>
                  <StatusBadge status={model.status} />
                </button>
              ))}
          </div>
        </article>

        <article style={css.panel}>
          <header
            style={{
              padding: "18px",
              borderBottom: `1px solid ${palette.border}`,
            }}
          >
            <h2 style={{ margin: 0, fontSize: "14px", fontWeight: 800 }}>
              Governance Controls
            </h2>
            <p
              style={{
                margin: "5px 0 0",
                fontSize: "11px",
                color: palette.muted,
              }}
            >
              Core review areas for responsible deployment
            </p>
          </header>
          <div style={{ padding: "18px", display: "grid", gap: "17px" }}>
            {[
              {
                title: "Model risk assessment",
                description:
                  "Classify potential impact and document identified risks.",
                icon: AlertTriangle,
                color: palette.orange,
                bg: palette.orangeLight,
              },
              {
                title: "Human oversight",
                description:
                  "Identify where human review or intervention is required.",
                icon: Users,
                color: palette.purple,
                bg: palette.purpleLight,
              },
              {
                title: "Evaluation and evidence",
                description:
                  "Record validation results and retain review evidence.",
                icon: FileCheck2,
                color: palette.blue,
                bg: palette.blueLight,
              },
              {
                title: "Approval lifecycle",
                description:
                  "Track review decisions before production deployment.",
                icon: CheckCircle2,
                color: palette.green,
                bg: palette.greenLight,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  style={{ display: "flex", alignItems: "flex-start", gap: "11px" }}
                >
                  <span
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "8px",
                      background: item.bg,
                      color: item.color,
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={17} />
                  </span>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 750 }}>
                      {item.title}
                    </div>
                    <div
                      style={{
                        marginTop: "4px",
                        color: palette.muted,
                        fontSize: "11px",
                        lineHeight: 1.6,
                      }}
                    >
                      {item.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <footer
        style={{
          ...css.panel,
          padding: "14px 16px",
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
          color: palette.muted,
          fontSize: "11px",
          lineHeight: 1.7,
        }}
      >
        <ShieldCheck
          size={17}
          color={palette.blue}
          style={{ flexShrink: 0, marginTop: "1px" }}
        />
        <span>
          <strong style={{ color: palette.text }}>AI governance demo mode.</strong>{" "}
          The inventory uses illustrative sample records and local React state.
          Status changes do not enforce production access restrictions. Connect
          backend APIs, model evaluation evidence, approval workflows, and
          server-side authorization before relying on these values operationally.
        </span>
      </footer>

      {showForm && (
        <Modal
          title="Register AI model"
          subtitle="Add a model to the AI governance inventory for review."
          onClose={() => setShowForm(false)}
        >
          <form onSubmit={saveModel}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                gap: "15px",
              }}
            >
              <label>
                <span style={css.label}>Model name *</span>
                <input
                  autoFocus
                  value={form.name}
                  onChange={(event) => field("name", event.target.value)}
                  placeholder="e.g. Enterprise Assistant"
                  style={css.input}
                />
              </label>
              <label>
                <span style={css.label}>Provider</span>
                <select
                  value={form.provider}
                  onChange={(event) => field("provider", event.target.value)}
                  style={css.input}
                >
                  <option>ModelNow</option>
                  <option>External Provider</option>
                  <option>Internal Team</option>
                  <option>Open Source</option>
                </select>
              </label>
              <label>
                <span style={css.label}>Version</span>
                <input
                  value={form.version}
                  onChange={(event) => field("version", event.target.value)}
                  placeholder="v1.0"
                  style={css.input}
                />
              </label>
              <label>
                <span style={css.label}>Use case *</span>
                <input
                  value={form.useCase}
                  onChange={(event) => field("useCase", event.target.value)}
                  placeholder="e.g. Knowledge search"
                  style={css.input}
                />
              </label>
              <label>
                <span style={css.label}>Model owner</span>
                <select
                  value={form.owner}
                  onChange={(event) => field("owner", event.target.value)}
                  style={css.input}
                >
                  <option>AI Platform Team</option>
                  <option>Engineering</option>
                  <option>Risk Management</option>
                  <option>Knowledge Team</option>
                  <option>Customer Experience</option>
                  <option>Data Governance</option>
                </select>
              </label>
              <label>
                <span style={css.label}>Risk level</span>
                <select
                  value={form.risk}
                  onChange={(event) =>
                    field("risk", event.target.value as RiskLevel)
                  }
                  style={css.input}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </label>
              <label>
                <span style={css.label}>Initial status</span>
                <select
                  value={form.status}
                  onChange={(event) =>
                    field("status", event.target.value as ModelStatus)
                  }
                  style={css.input}
                >
                  <option>Pending</option>
                  <option>Under Review</option>
                  <option>Approved</option>
                  <option>Restricted</option>
                </select>
              </label>
              <label>
                <span style={css.label}>Deployment</span>
                <select
                  value={form.deployment}
                  onChange={(event) => field("deployment", event.target.value)}
                  style={css.input}
                >
                  <option>Not deployed</option>
                  <option>Development</option>
                  <option>Staging</option>
                  <option>Production</option>
                  <option>Restricted</option>
                </select>
              </label>
              <label style={{ gridColumn: "1 / -1" }}>
                <span style={css.label}>Description *</span>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    field("description", event.target.value)
                  }
                  placeholder="Describe the model, intended use, and limitations..."
                  style={{ ...css.input, resize: "vertical", lineHeight: 1.7 }}
                />
              </label>
              <label
                style={{
                  gridColumn: "1 / -1",
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  fontSize: "12px",
                  color: "#4B5563",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={form.humanOversight}
                  onChange={(event) =>
                    field("humanOversight", event.target.checked)
                  }
                />
                Human oversight is documented for this model
              </label>
            </div>

            {formError && (
              <p
                role="alert"
                style={{
                  color: palette.red,
                  fontSize: "12px",
                  marginTop: "13px",
                }}
              >
                {formError}
              </p>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "9px",
                marginTop: "22px",
                paddingTop: "17px",
                borderTop: `1px solid ${palette.border}`,
              }}
            >
              <button
                type="button"
                style={css.button}
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button type="submit" style={css.primary}>
                <Plus size={15} />
                Register model
              </button>
            </div>
          </form>
        </Modal>
      )}

      {selectedModel && (
        <Modal
          title={selectedModel.name}
          subtitle={`${selectedModel.id} · ${selectedModel.version}`}
          onClose={() => setSelectedModel(null)}
        >
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              marginBottom: "17px",
            }}
          >
            <StatusBadge status={selectedModel.status} />
            <RiskBadge risk={selectedModel.risk} />
          </div>

          <p
            style={{
              color: "#4B5563",
              fontSize: "13px",
              lineHeight: 1.8,
              margin: "0 0 20px",
            }}
          >
            {selectedModel.description}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            {[
              ["Provider", selectedModel.provider],
              ["Use case", selectedModel.useCase],
              ["Owner", selectedModel.owner],
              ["Deployment", selectedModel.deployment],
              ["Last reviewed", selectedModel.lastReviewed],
              [
                "Human oversight",
                selectedModel.humanOversight ? "Enabled" : "Not documented",
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  border: `1px solid ${palette.border}`,
                  borderRadius: "9px",
                  padding: "12px",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    color: palette.muted,
                    fontSize: "10px",
                    marginBottom: "6px",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    overflowWrap: "anywhere",
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>

          {selectedModel.risk === "Critical" && !selectedModel.humanOversight && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "9px",
                padding: "12px",
                borderRadius: "9px",
                border: "1px solid #F3D5A5",
                background: "#FFFAF1",
                color: "#785A2A",
                fontSize: "11px",
                lineHeight: 1.7,
                marginBottom: "17px",
              }}
            >
              <AlertTriangle size={17} style={{ flexShrink: 0 }} />
              Critical risk is recorded without documented human oversight.
              Complete the required assessment before considering deployment.
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: "9px",
              flexWrap: "wrap",
              paddingTop: "17px",
              borderTop: `1px solid ${palette.border}`,
            }}
          >
            {selectedModel.status !== "Under Review" && (
              <button
                type="button"
                style={css.button}
                onClick={() =>
                  updateModelStatus(selectedModel, "Under Review")
                }
              >
                <Clock3 size={15} />
                Send for review
              </button>
            )}
            {selectedModel.status !== "Approved" && (
              <button
                type="button"
                style={css.primary}
                onClick={() => {
                  if (
                    selectedModel.risk === "Critical" &&
                    !selectedModel.humanOversight
                  ) {
                    setNotice(
                      "Approval blocked in this demo: document human oversight for this critical-risk model first.",
                    );
                    return;
                  }
                  updateModelStatus(selectedModel, "Approved");
                }}
              >
                <Check size={15} />
                Approve model
              </button>
            )}
            {selectedModel.status !== "Restricted" && (
              <button
                type="button"
                style={{
                  ...css.button,
                  color: palette.red,
                }}
                onClick={() =>
                  updateModelStatus(selectedModel, "Restricted")
                }
              >
                <LockKeyhole size={15} />
                Restrict model
              </button>
            )}
          </div>

          <p
            style={{
              fontSize: "10px",
              lineHeight: 1.7,
              color: palette.muted,
              margin: "16px 0 0",
            }}
          >
            Approval and restriction actions update local demo state only.
            Production enforcement requires server-side authorization and
            connected model deployment controls.
          </p>
        </Modal>
      )}
    </main>
  );
}
