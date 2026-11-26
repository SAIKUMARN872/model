
"use client";

import { useMemo, useState } from "react";
import {
  BrainCircuit,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Search,
  Plus,
  Download,
  MoreHorizontal,
  Eye,
  X,
  Filter,
  FileText,
  Activity,
  LockKeyhole,
  Scale,
  Gauge,
  RefreshCw,
  Check,
  Trash2,
  ChevronRight,
} from "lucide-react";

type RiskLevel = "Low" | "Medium" | "High" | "Critical";
type ModelStatus = "Approved" | "Under Review" | "Restricted";

type AIModel = {
  id: string;
  name: string;
  provider: string;
  purpose: string;
  risk: RiskLevel;
  status: ModelStatus;
  evaluation: number;
  owner: string;
  lastReviewed: string;
  humanReview: boolean;
  dataProtection: boolean;
  description: string;
};

type Incident = {
  id: string;
  title: string;
  category: string;
  severity: RiskLevel;
  status: "Open" | "Investigating" | "Resolved";
  model: string;
  date: string;
};

const initialModels: AIModel[] = [
  {
    id: "AIM-001",
    name: "ModelNow Foundation",
    provider: "ModelNow",
    purpose: "General-purpose assistant",
    risk: "Medium",
    status: "Approved",
    evaluation: 94,
    owner: "AI Platform Team",
    lastReviewed: "2026-10-28",
    humanReview: true,
    dataProtection: true,
    description:
      "General-purpose language model used for internal productivity and assistant workflows.",
  },
  {
    id: "AIM-002",
    name: "Customer Support AI",
    provider: "ModelNow",
    purpose: "Customer support automation",
    risk: "High",
    status: "Under Review",
    evaluation: 78,
    owner: "Customer Experience",
    lastReviewed: "2026-10-22",
    humanReview: true,
    dataProtection: true,
    description:
      "AI assistant for customer service responses and support ticket classification.",
  },
  {
    id: "AIM-003",
    name: "Document Intelligence",
    provider: "ModelNow",
    purpose: "Document classification",
    risk: "Medium",
    status: "Approved",
    evaluation: 91,
    owner: "Knowledge Team",
    lastReviewed: "2026-10-30",
    humanReview: true,
    dataProtection: true,
    description:
      "Extracts and classifies information from business documents.",
  },
  {
    id: "AIM-004",
    name: "Candidate Screening AI",
    provider: "External Provider",
    purpose: "Recruitment assistance",
    risk: "Critical",
    status: "Restricted",
    evaluation: 62,
    owner: "People Operations",
    lastReviewed: "2026-10-18",
    humanReview: false,
    dataProtection: true,
    description:
      "Assists with candidate screening. Requires enhanced legal, fairness, and human oversight review.",
  },
  {
    id: "AIM-005",
    name: "Sales Insights",
    provider: "ModelNow",
    purpose: "Sales analytics",
    risk: "Low",
    status: "Approved",
    evaluation: 96,
    owner: "Revenue Operations",
    lastReviewed: "2026-10-29",
    humanReview: true,
    dataProtection: true,
    description:
      "Summarizes sales trends and helps teams understand account activity.",
  },
];

const initialIncidents: Incident[] = [
  {
    id: "AI-INC-101",
    title: "Potential sensitive data in response",
    category: "Privacy",
    severity: "High",
    status: "Investigating",
    model: "Customer Support AI",
    date: "2026-11-02",
  },
  {
    id: "AI-INC-102",
    title: "Evaluation score below target",
    category: "Model Quality",
    severity: "Medium",
    status: "Open",
    model: "Candidate Screening AI",
    date: "2026-10-30",
  },
  {
    id: "AI-INC-103",
    title: "Human review control missing",
    category: "Governance",
    severity: "Critical",
    status: "Open",
    model: "Candidate Screening AI",
    date: "2026-10-28",
  },
];

const riskClass: Record<RiskLevel, string> = {
  Low: "risk-low",
  Medium: "risk-medium",
  High: "risk-high",
  Critical: "risk-critical",
};

const modelStatusClass: Record<ModelStatus, string> = {
  Approved: "approved",
  "Under Review": "review",
  Restricted: "restricted",
};

export default function AICompliancePage() {
  const [models, setModels] = useState<AIModel[]>(initialModels);
  const [incidents, setIncidents] =
    useState<Incident[]>(initialIncidents);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeTab, setActiveTab] = useState<
    "inventory" | "evaluations" | "controls" | "incidents"
  >("inventory");
  const [selected, setSelected] = useState<AIModel | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState({
    name: "",
    provider: "ModelNow",
    purpose: "",
    risk: "Medium" as RiskLevel,
    owner: "",
    description: "",
  });

  const [controls, setControls] = useState([
    {
      id: "CTRL-AI-01",
      name: "Human oversight",
      description:
        "Require appropriate human review for high-impact AI decisions.",
      category: "Accountability",
      status: "Needs Attention",
      owner: "AI Governance",
    },
    {
      id: "CTRL-AI-02",
      name: "Data privacy",
      description:
        "Review personal data use, access, and retention in AI workflows.",
      category: "Privacy",
      status: "Implemented",
      owner: "Privacy Team",
    },
    {
      id: "CTRL-AI-03",
      name: "Bias and fairness testing",
      description:
        "Evaluate model outputs for potential unfair or discriminatory outcomes.",
      category: "Fairness",
      status: "In Progress",
      owner: "Responsible AI Team",
    },
    {
      id: "CTRL-AI-04",
      name: "Model documentation",
      description:
        "Maintain intended use, limitations, and evaluation records.",
      category: "Transparency",
      status: "Implemented",
      owner: "AI Platform Team",
    },
    {
      id: "CTRL-AI-05",
      name: "Security testing",
      description:
        "Assess prompt injection, unauthorized access, and abuse scenarios.",
      category: "Security",
      status: "In Progress",
      owner: "Security Team",
    },
    {
      id: "CTRL-AI-06",
      name: "Output monitoring",
      description:
        "Monitor model quality, incidents, and unexpected behavior.",
      category: "Monitoring",
      status: "Implemented",
      owner: "AI Platform Team",
    },
  ]);

  const filteredModels = useMemo(() => {
    const query = search.toLowerCase();

    return models.filter((model) => {
      const text = [
        model.id,
        model.name,
        model.provider,
        model.purpose,
        model.owner,
      ]
        .join(" ")
        .toLowerCase();

      return (
        text.includes(query) &&
        (riskFilter === "All" || model.risk === riskFilter) &&
        (statusFilter === "All" || model.status === statusFilter)
      );
    });
  }, [models, search, riskFilter, statusFilter]);

  const approvedCount = models.filter(
    (model) => model.status === "Approved"
  ).length;

  const highRiskCount = models.filter(
    (model) => model.risk === "High" || model.risk === "Critical"
  ).length;

  const reviewCount = models.filter(
    (model) => model.status === "Under Review"
  ).length;

  const openIncidents = incidents.filter(
    (incident) => incident.status !== "Resolved"
  ).length;

  const averageEvaluation = models.length
    ? Math.round(
        models.reduce((sum, model) => sum + model.evaluation, 0) /
          models.length
      )
    : 0;

  const implementedControls = controls.filter(
    (control) => control.status === "Implemented"
  ).length;

  function addModel(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newModel: AIModel = {
      id: `AIM-${String(Date.now()).slice(-5)}`,
      name: form.name.trim(),
      provider: form.provider,
      purpose: form.purpose.trim(),
      risk: form.risk,
      status: "Under Review",
      evaluation: 0,
      owner: form.owner.trim() || "Unassigned",
      lastReviewed: "Not reviewed",
      humanReview: false,
      dataProtection: false,
      description: form.description.trim(),
    };

    setModels((current) => [newModel, ...current]);
    setShowForm(false);
    setForm({
      name: "",
      provider: "ModelNow",
      purpose: "",
      risk: "Medium",
      owner: "",
      description: "",
    });
    setNotice("AI model added to the local inventory for review.");
  }

  function updateModel(id: string, updates: Partial<AIModel>) {
    setModels((current) =>
      current.map((model) =>
        model.id === id ? { ...model, ...updates } : model
      )
    );

    setSelected((current) =>
      current?.id === id ? { ...current, ...updates } : current
    );
  }

  function deleteModel(id: string) {
    setModels((current) =>
      current.filter((model) => model.id !== id)
    );
    setSelected(null);
    setMenuId(null);
    setNotice("Model removed from the local inventory.");
  }

  function exportCSV() {
    const headers = [
      "ID",
      "Model",
      "Provider",
      "Purpose",
      "Risk",
      "Status",
      "Evaluation",
      "Owner",
      "Human Review",
      "Data Protection",
    ];

    const rows = filteredModels.map((model) => [
      model.id,
      model.name,
      model.provider,
      model.purpose,
      model.risk,
      model.status,
      model.evaluation,
      model.owner,
      model.humanReview ? "Yes" : "No",
      model.dataProtection ? "Yes" : "No",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-ai-compliance-inventory.csv";
    link.click();
    URL.revokeObjectURL(url);
    setNotice("AI inventory exported as CSV.");
  }

  function toggleControl(index: number) {
    setControls((current) =>
      current.map((control, i) =>
        i === index
          ? {
              ...control,
              status:
                control.status === "Implemented"
                  ? "Needs Attention"
                  : "Implemented",
            }
          : control
      )
    );
    setNotice("Control status updated in the local demo.");
  }

  function updateIncident(
    id: string,
    status: Incident["status"]
  ) {
    setIncidents((current) =>
      current.map((incident) =>
        incident.id === id ? { ...incident, status } : incident
      )
    );
    setNotice(`Incident status changed to ${status}.`);
  }

  return (
    <main className="ai-page">
      <header className="page-header">
        <div>
          <div className="breadcrumb">
            Admin <span>/</span> Compliance <span>/</span> AI Compliance
          </div>
          <h1>AI Compliance</h1>
          <p>
            Govern AI models, track evaluations, monitor responsible AI
            controls, and manage compliance incidents.
          </p>
        </div>

        <div className="header-actions">
          <button className="secondary-button" onClick={exportCSV}>
            <Download size={16} /> Export CSV
          </button>
          <button
            className="primary-button"
            onClick={() => setShowForm(true)}
          >
            <Plus size={17} /> Register Model
          </button>
        </div>
      </header>

      {notice && (
        <div className="notice">
          <CheckCircle2 size={17} />
          <span>{notice}</span>
          <button
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <section className="stats-grid">
        <StatCard
          icon={<BrainCircuit size={20} />}
          label="Registered AI Models"
          value={models.length}
          note="Models in inventory"
          color="blue"
        />
        <StatCard
          icon={<ShieldCheck size={20} />}
          label="Approved Models"
          value={approvedCount}
          note="Marked approved"
          color="green"
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          label="High / Critical Risk"
          value={highRiskCount}
          note="Require appropriate oversight"
          color="red"
        />
        <StatCard
          icon={<Activity size={20} />}
          label="Open Incidents"
          value={openIncidents}
          note={`${reviewCount} models under review`}
          color="amber"
        />
      </section>

      <section className="score-panel">
        <div className="score-icon">
          <Gauge size={25} />
        </div>
        <div className="score-copy">
          <h2>AI Evaluation Overview</h2>
          <p>
            Average evaluation score across the registered model inventory.
          </p>
        </div>
        <div className="score-meter">
          <div className="score-number">{averageEvaluation}%</div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${averageEvaluation}%` }}
            />
          </div>
          <span>Sample evaluation data</span>
        </div>
      </section>

      <nav className="tabs">
        <Tab
          active={activeTab === "inventory"}
          onClick={() => setActiveTab("inventory")}
          icon={<BrainCircuit size={16} />}
          label="Model Inventory"
          count={models.length}
        />
        <Tab
          active={activeTab === "evaluations"}
          onClick={() => setActiveTab("evaluations")}
          icon={<Gauge size={16} />}
          label="Evaluations"
        />
        <Tab
          active={activeTab === "controls"}
          onClick={() => setActiveTab("controls")}
          icon={<ShieldCheck size={16} />}
          label="Responsible AI Controls"
          count={controls.length}
        />
        <Tab
          active={activeTab === "incidents"}
          onClick={() => setActiveTab("incidents")}
          icon={<AlertTriangle size={16} />}
          label="Incidents"
          count={incidents.length}
        />
      </nav>

      {activeTab === "inventory" && (
        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>AI Model Inventory</h2>
              <p>
                Track model ownership, intended use, risk, and approval status.
              </p>
            </div>
            <span className="record-count">
              {filteredModels.length} models
            </span>
          </div>

          <div className="filters">
            <div className="search-box">
              <Search size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search models, providers, owners..."
              />
            </div>

            <div className="filter-box">
              <Filter size={15} />
              <select
                value={riskFilter}
                onChange={(event) => setRiskFilter(event.target.value)}
              >
                <option>All</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>

            <select
              className="status-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>All</option>
              <option>Approved</option>
              <option>Under Review</option>
              <option>Restricted</option>
            </select>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Model</th>
                  <th>Purpose</th>
                  <th>Risk</th>
                  <th>Evaluation</th>
                  <th>Owner</th>
                  <th>Last reviewed</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredModels.map((model) => (
                  <tr key={model.id}>
                    <td>
                      <button
                        className="model-name"
                        onClick={() => setSelected(model)}
                      >
                        <span className="model-icon">
                          <BrainCircuit size={18} />
                        </span>
                        <span>
                          <strong>{model.name}</strong>
                          <small>
                            {model.id} · {model.provider}
                          </small>
                        </span>
                      </button>
                    </td>
                    <td className="purpose-cell">{model.purpose}</td>
                    <td>
                      <span className={`risk-badge ${riskClass[model.risk]}`}>
                        {model.risk}
                      </span>
                    </td>
                    <td>
                      <div className="evaluation-cell">
                        <strong>{model.evaluation}%</strong>
                        <div className="mini-track">
                          <div
                            className="mini-fill"
                            style={{ width: `${model.evaluation}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>{model.owner}</td>
                    <td>{model.lastReviewed}</td>
                    <td>
                      <span
                        className={`status-badge ${modelStatusClass[model.status]}`}
                      >
                        <span className="status-dot" />
                        {model.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button
                        className="icon-button"
                        aria-label="Model actions"
                        onClick={() =>
                          setMenuId(menuId === model.id ? null : model.id)
                        }
                      >
                        <MoreHorizontal size={19} />
                      </button>

                      {menuId === model.id && (
                        <div className="row-menu">
                          <button
                            onClick={() => {
                              setSelected(model);
                              setMenuId(null);
                            }}
                          >
                            <Eye size={15} /> View details
                          </button>
                          {(
                            [
                              "Approved",
                              "Under Review",
                              "Restricted",
                            ] as ModelStatus[]
                          )
                            .filter((status) => status !== model.status)
                            .map((status) => (
                              <button
                                key={status}
                                onClick={() => {
                                  updateModel(model.id, { status });
                                  setMenuId(null);
                                  setNotice(`Model status changed to ${status}.`);
                                }}
                              >
                                <Check size={15} /> Mark {status}
                              </button>
                            ))}
                          <button
                            className="delete-action"
                            onClick={() => deleteModel(model.id)}
                          >
                            <Trash2 size={15} /> Remove model
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredModels.length === 0 && (
                  <tr>
                    <td colSpan={8} className="empty-state">
                      No models match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <span>
              Showing {filteredModels.length} of {models.length} models
            </span>
            <span>AI Compliance · ModelNow</span>
          </div>
        </section>
      )}

      {activeTab === "evaluations" && (
        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Model Evaluations</h2>
              <p>
                Review the sample evaluation scores and identify models that
                need further testing.
              </p>
            </div>
            <span className="record-count">
              Average {averageEvaluation}%
            </span>
          </div>

          <div className="evaluation-list">
            {models.map((model) => (
              <article className="evaluation-row" key={model.id}>
                <div className="evaluation-model-icon">
                  <BrainCircuit size={19} />
                </div>
                <div className="evaluation-main">
                  <div className="evaluation-title">
                    <strong>{model.name}</strong>
                    <span className={`risk-badge ${riskClass[model.risk]}`}>
                      {model.risk} risk
                    </span>
                  </div>
                  <p>{model.purpose}</p>
                  <div className="large-track">
                    <div
                      className="large-fill"
                      style={{ width: `${model.evaluation}%` }}
                    />
                  </div>
                </div>
                <div className="evaluation-score">
                  <strong>{model.evaluation}%</strong>
                  <span>
                    {model.evaluation >= 90
                      ? "Strong sample score"
                      : model.evaluation >= 75
                        ? "Needs review"
                        : "Priority review"}
                  </span>
                </div>
                <button
                  className="small-action"
                  onClick={() => setSelected(model)}
                >
                  View <ChevronRight size={14} />
                </button>
              </article>
            ))}
          </div>

          <div className="retention-note">
            <AlertTriangle size={17} />
            <span>
              These scores are illustrative. No model evaluation or benchmark
              was executed by this interface.
            </span>
          </div>
        </section>
      )}

      {activeTab === "controls" && (
        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>Responsible AI Controls</h2>
              <p>
                Track governance safeguards for privacy, fairness,
                transparency, and security.
              </p>
            </div>
            <span className="record-count">
              {implementedControls}/{controls.length} implemented
            </span>
          </div>

          <div className="control-summary">
            <div>
              <span>Implementation progress</span>
              <strong>
                {controls.length
                  ? Math.round(
                      (implementedControls / controls.length) * 100
                    )
                  : 0}
                %
              </strong>
            </div>
            <div className="large-track">
              <div
                className="large-fill"
                style={{
                  width: `${
                    controls.length
                      ? (implementedControls / controls.length) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="controls-list">
            {controls.map((control, index) => (
              <article className="control-row" key={control.id}>
                <div className="control-icon">
                  {control.category === "Privacy" ? (
                    <LockKeyhole size={19} />
                  ) : control.category === "Fairness" ? (
                    <Scale size={19} />
                  ) : control.category === "Monitoring" ? (
                    <Activity size={19} />
                  ) : (
                    <ShieldCheck size={19} />
                  )}
                </div>
                <div className="control-main">
                  <div className="control-title">
                    <strong>{control.name}</strong>
                    <span className="control-id">{control.id}</span>
                  </div>
                  <p>{control.description}</p>
                  <div className="control-meta">
                    <span>{control.category}</span>
                    <span>Owner: {control.owner}</span>
                  </div>
                </div>
                <div className="control-actions">
                  <span
                    className={`status-badge ${
                      control.status === "Implemented"
                        ? "approved"
                        : control.status === "In Progress"
                          ? "review"
                          : "restricted"
                    }`}
                  >
                    {control.status}
                  </span>
                  <button
                    className="small-action"
                    onClick={() => toggleControl(index)}
                  >
                    <RefreshCw size={14} /> Toggle status
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {activeTab === "incidents" && (
        <section className="content-card">
          <div className="section-heading">
            <div>
              <h2>AI Compliance Incidents</h2>
              <p>
                Track reported AI-related issues and their resolution status.
              </p>
            </div>
            <span className="record-count">
              {openIncidents} open incidents
            </span>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Incident</th>
                  <th>Category</th>
                  <th>Model</th>
                  <th>Severity</th>
                  <th>Date reported</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((incident) => (
                  <tr key={incident.id}>
                    <td>
                      <div className="incident-title">
                        <span className="incident-icon">
                          <AlertTriangle size={16} />
                        </span>
                        <span>
                          <strong>{incident.title}</strong>
                          <small>{incident.id}</small>
                        </span>
                      </div>
                    </td>
                    <td>{incident.category}</td>
                    <td>{incident.model}</td>
                    <td>
                      <span
                        className={`risk-badge ${riskClass[incident.severity]}`}
                      >
                        {incident.severity}
                      </span>
                    </td>
                    <td>{incident.date}</td>
                    <td>
                      <span
                        className={`status-badge ${
                          incident.status === "Resolved"
                            ? "approved"
                            : incident.status === "Investigating"
                              ? "review"
                              : "restricted"
                        }`}
                      >
                        {incident.status}
                      </span>
                    </td>
                    <td>
                      <select
                        className="incident-select"
                        value={incident.status}
                        onChange={(event) =>
                          updateIncident(
                            incident.id,
                            event.target.value as Incident["status"]
                          )
                        }
                      >
                        <option>Open</option>
                        <option>Investigating</option>
                        <option>Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {incidents.length === 0 && (
                  <tr>
                    <td colSpan={7} className="empty-state">
                      No incidents have been registered.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="bottom-grid">
        <InfoCard
          icon={<Scale size={20} />}
          title="Fairness and accountability"
          description="Document intended use, model limitations, and appropriate human oversight."
          color="blue-bg"
        />
        <InfoCard
          icon={<LockKeyhole size={20} />}
          title="Privacy and security"
          description="Review data handling, access boundaries, and potential misuse risks."
          color="amber-bg"
        />
        <InfoCard
          icon={<FileText size={20} />}
          title="Evidence and documentation"
          description="Keep evaluation reports, approvals, and incident records ready for review."
          color="green-bg"
        />
      </section>

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowForm(false);
            }
          }}
        >
          <section className="modal">
            <div className="modal-heading">
              <div>
                <h2>Register AI Model</h2>
                <p>Add a model to the governance inventory.</p>
              </div>
              <button
                className="icon-button"
                onClick={() => setShowForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={addModel}>
              <label>
                Model name *
                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="e.g. Document Assistant"
                />
              </label>

              <div className="form-row">
                <label>
                  Provider
                  <select
                    value={form.provider}
                    onChange={(event) =>
                      setForm({ ...form, provider: event.target.value })
                    }
                  >
                    <option>ModelNow</option>
                    <option>OpenAI</option>
                    <option>Anthropic</option>
                    <option>Google</option>
                    <option>Meta</option>
                    <option>External Provider</option>
                    <option>Other</option>
                  </select>
                </label>

                <label>
                  Risk classification
                  <select
                    value={form.risk}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        risk: event.target.value as RiskLevel,
                      })
                    }
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                  </select>
                </label>
              </div>

              <label>
                Intended purpose *
                <input
                  required
                  value={form.purpose}
                  onChange={(event) =>
                    setForm({ ...form, purpose: event.target.value })
                  }
                  placeholder="Describe the intended use"
                />
              </label>

              <label>
                Responsible owner
                <input
                  value={form.owner}
                  onChange={(event) =>
                    setForm({ ...form, owner: event.target.value })
                  }
                  placeholder="Team or individual"
                />
              </label>

              <label>
                Model description
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description: event.target.value,
                    })
                  }
                  placeholder="Document limitations, data use, and oversight..."
                />
              </label>

              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  <Plus size={16} /> Register Model
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selected && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelected(null);
            }
          }}
        >
          <section className="modal detail-modal">
            <div className="modal-heading">
              <div>
                <span className="eyebrow">{selected.id}</span>
                <h2>{selected.name}</h2>
                <p>{selected.provider} · {selected.purpose}</p>
              </div>
              <button
                className="icon-button"
                onClick={() => setSelected(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="detail-status">
              <span className={`risk-badge ${riskClass[selected.risk]}`}>
                {selected.risk} risk
              </span>
              <span
                className={`status-badge ${modelStatusClass[selected.status]}`}
              >
                {selected.status}
              </span>
            </div>

            <div className="detail-grid">
              <Detail label="Responsible owner" value={selected.owner} />
              <Detail
                label="Last reviewed"
                value={selected.lastReviewed}
              />
              <Detail
                label="Evaluation score"
                value={`${selected.evaluation}%`}
              />
              <Detail
                label="Human oversight"
                value={selected.humanReview ? "Recorded" : "Not recorded"}
              />
              <Detail
                label="Data protection review"
                value={
                  selected.dataProtection ? "Recorded" : "Not recorded"
                }
              />
              <Detail
                label="Provider"
                value={selected.provider}
              />
            </div>

            <div className="description-box">
              <strong>Model description</strong>
              <p>
                {selected.description || "No model description provided."}
              </p>
            </div>

            <div className="modal-footer">
              <button
                className="secondary-button"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
              {selected.status !== "Approved" && (
                <button
                  className="primary-button"
                  onClick={() => {
                    updateModel(selected.id, { status: "Approved" });
                    setNotice(
                      "Model marked approved in the local demo. This is not a real compliance approval."
                    );
                  }}
                >
                  <CheckCircle2 size={15} /> Mark Approved
                </button>
              )}
            </div>
          </section>
        </div>
      )}

      <style jsx>{`
        .ai-page {
          --text: #172033;
          --muted: #687386;
          --line: #e6eaf0;
          min-height: 100vh;
          padding: 30px;
          background: #f7f9fc;
          color: var(--text);
          font-family: Arial, Helvetica, sans-serif;
        }

        .page-header,
        .header-actions,
        .section-heading,
        .filters,
        .table-footer,
        .modal-heading,
        .modal-footer,
        .detail-status {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }

        .page-header {
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .breadcrumb {
          margin-bottom: 12px;
          color: var(--muted);
          font-size: 12px;
        }

        .breadcrumb span {
          margin: 0 7px;
          color: #a4adba;
        }

        h1 {
          margin: 0;
          font-size: 28px;
          letter-spacing: -0.7px;
        }

        .page-header p,
        .section-heading p,
        .modal-heading p {
          margin: 8px 0 0;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.6;
        }

        button,
        input,
        select,
        textarea {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .primary-button,
        .secondary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 39px;
          padding: 0 14px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }

        .primary-button {
          color: white;
          background: #2459d3;
          border: 1px solid #2459d3;
        }

        .primary-button:hover {
          background: #1948b7;
        }

        .secondary-button {
          color: #354154;
          background: white;
          border: 1px solid #dce2ea;
        }

        .secondary-button:hover {
          background: #f5f7fa;
        }

        .notice {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
          padding: 12px 14px;
          color: #166534;
          background: #f0fdf4;
          border: 1px solid #bce7cc;
          border-radius: 9px;
          font-size: 12px;
        }

        .notice span {
          flex: 1;
        }

        .notice button {
          display: flex;
          color: inherit;
          background: transparent;
          border: 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }

        .stat-card {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          padding: 19px;
          background: white;
          border: 1px solid var(--line);
          border-radius: 12px;
        }

        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 42px;
          height: 42px;
          border-radius: 9px;
        }

        .blue {
          color: #2856c7;
          background: #edf3ff;
        }

        .green {
          color: #16814a;
          background: #e9f9ef;
        }

        .amber {
          color: #ad6b0b;
          background: #fff6e5;
        }

        .red {
          color: #c34242;
          background: #fff0f0;
        }

        .stat-label {
          margin: 2px 0 8px;
          color: var(--muted);
          font-size: 12px;
        }

        .stat-value {
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.7px;
        }

        .stat-note {
          margin-top: 7px;
          color: #8a94a4;
          font-size: 11px;
        }

        .score-panel {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 22px;
          padding: 20px;
          background: linear-gradient(110deg, #eef4ff, #f7f9ff);
          border: 1px solid #dbe6ff;
          border-radius: 12px;
        }

        .score-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 47px;
          height: 47px;
          color: #2856c7;
          background: white;
          border: 1px solid #dce6ff;
          border-radius: 12px;
        }

        .score-copy {
          flex: 1;
        }

        .score-copy h2 {
          margin: 0;
          font-size: 14px;
        }

        .score-copy p {
          margin: 6px 0 0;
          color: #64748b;
          font-size: 11px;
          line-height: 1.6;
        }

        .score-meter {
          width: 190px;
        }

        .score-number {
          margin-bottom: 8px;
          color: #2459d3;
          font-size: 25px;
          font-weight: 700;
          text-align: right;
        }

        .progress-track,
        .mini-track,
        .large-track {
          overflow: hidden;
          background: #e9edf4;
          border-radius: 99px;
        }

        .progress-track {
          height: 7px;
        }

        .progress-fill,
        .mini-fill,
        .large-fill {
          height: 100%;
          background: #3567df;
          border-radius: inherit;
          transition: width 0.2s ease;
        }

        .score-meter > span {
          display: block;
          margin-top: 6px;
          color: #7a8699;
          font-size: 10px;
          text-align: right;
        }

        .tabs {
          display: flex;
          gap: 7px;
          margin-bottom: 16px;
          overflow-x: auto;
          padding-bottom: 2px;
        }

        .tabs button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 41px;
          padding: 0 13px;
          color: #667085;
          background: white;
          border: 1px solid var(--line);
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
        }

        .tabs button.active {
          color: #2459d3;
          background: #edf3ff;
          border-color: #bfd0ff;
        }

        .tabs button span {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 21px;
          height: 21px;
          padding: 0 5px;
          color: #687386;
          background: #f0f2f6;
          border-radius: 5px;
          font-size: 10px;
        }

        .content-card {
          min-width: 0;
          background: white;
          border: 1px solid var(--line);
          border-radius: 12px;
        }

        .section-heading {
          padding: 21px 22px;
        }

        .section-heading h2,
        .modal-heading h2 {
          margin: 0;
          font-size: 16px;
        }

        .record-count {
          padding: 6px 9px;
          color: #596579;
          border: 1px solid var(--line);
          border-radius: 7px;
          font-size: 11px;
          white-space: nowrap;
        }

        .filters {
          justify-content: flex-start;
          flex-wrap: wrap;
          padding: 0 22px 19px;
        }

        .search-box,
        .filter-box {
          display: flex;
          align-items: center;
          gap: 9px;
          min-height: 38px;
          padding: 0 11px;
          color: #758196;
          background: white;
          border: 1px solid #dfe5ed;
          border-radius: 8px;
        }

        .search-box {
          flex: 1;
          min-width: 220px;
        }

        .search-box input {
          width: 100%;
          min-width: 0;
          color: var(--text);
          background: transparent;
          border: 0;
          outline: 0;
          font-size: 12px;
        }

        .filter-box select,
        .status-select {
          color: #435066;
          background: white;
          border: 0;
          outline: 0;
          font-size: 12px;
        }

        .status-select {
          min-height: 38px;
          padding: 0 12px;
          border: 1px solid #dfe5ed;
          border-radius: 8px;
        }

        .table-scroll {
          width: 100%;
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
          white-space: nowrap;
        }

        th {
          padding: 12px 14px;
          color: #758196;
          background: #f8fafc;
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.45px;
        }

        th:first-child,
        td:first-child {
          padding-left: 22px;
        }

        td {
          position: relative;
          padding: 14px;
          color: #475467;
          border-bottom: 1px solid #edf0f4;
          font-size: 11px;
        }

        tbody tr:last-child td {
          border-bottom: 0;
        }

        tbody tr:hover {
          background: #fbfcfe;
        }

        .model-name {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0;
          color: inherit;
          text-align: left;
          background: transparent;
          border: 0;
        }

        .model-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          color: #3764c9;
          background: #edf3ff;
          border-radius: 9px;
        }

        .model-name strong,
        .incident-title strong {
          display: block;
          color: #263248;
          font-size: 11px;
          font-weight: 600;
        }

        .model-name small,
        .incident-title small {
          display: block;
          margin-top: 5px;
          color: #8b95a5;
          font-size: 10px;
        }

        .purpose-cell {
          max-width: 200px;
          white-space: normal;
          line-height: 1.5;
        }

        .risk-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 600;
        }

        .risk-low {
          color: #16814a;
          background: #e9f9ef;
        }

        .risk-medium {
          color: #8c650d;
          background: #fff6df;
        }

        .risk-high {
          color: #b45309;
          background: #fff0df;
        }

        .risk-critical {
          color: #bf3c3c;
          background: #fff0f0;
        }

        .evaluation-cell {
          min-width: 80px;
        }

        .evaluation-cell strong {
          display: block;
          margin-bottom: 7px;
          color: #344054;
          font-size: 11px;
        }

        .mini-track {
          width: 74px;
          height: 5px;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 600;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          background: currentColor;
          border-radius: 50%;
        }

        .approved {
          color: #16814a;
          background: #e9f9ef;
        }

        .review {
          color: #2856c7;
          background: #edf3ff;
        }

        .restricted {
          color: #bf3c3c;
          background: #fff0f0;
        }

        .actions-cell {
          text-align: right;
        }

        .icon-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 33px;
          height: 33px;
          color: #667085;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 7px;
        }

        .icon-button:hover {
          background: #f7f9fc;
          border-color: var(--line);
        }

        .row-menu {
          position: absolute;
          z-index: 10;
          top: 47px;
          right: 12px;
          width: 175px;
          max-height: 280px;
          overflow-y: auto;
          padding: 5px;
          background: white;
          border: 1px solid var(--line);
          border-radius: 9px;
          box-shadow: 0 10px 30px #17203318;
        }

        .row-menu button {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 9px;
          color: #475467;
          text-align: left;
          background: white;
          border: 0;
          border-radius: 6px;
          font-size: 11px;
        }

        .row-menu button:hover {
          background: #f4f6fa;
        }

        .row-menu .delete-action {
          color: #c34242;
          border-top: 1px solid #edf0f4;
        }

        .empty-state {
          padding: 40px 20px;
          color: #8791a1;
          text-align: center;
        }

        .table-footer {
          padding: 14px 22px;
          color: #8791a1;
          border-top: 1px solid var(--line);
          font-size: 10px;
        }

        .evaluation-list,
        .controls-list {
          padding: 0 22px 18px;
        }

        .evaluation-row {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 17px 0;
          border-bottom: 1px solid #edf0f4;
        }

        .evaluation-row:last-child {
          border-bottom: 0;
        }

        .evaluation-model-icon,
        .control-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          color: #3764c9;
          background: #edf3ff;
          border-radius: 9px;
        }

        .evaluation-main,
        .control-main {
          flex: 1;
          min-width: 0;
        }

        .evaluation-title,
        .control-title,
        .control-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 9px;
        }

        .evaluation-title strong,
        .control-title strong {
          color: #263248;
          font-size: 12px;
        }

        .evaluation-main p,
        .control-main p {
          margin: 7px 0 10px;
          color: #8791a1;
          font-size: 11px;
          line-height: 1.6;
        }

        .large-track {
          width: 100%;
          height: 7px;
        }

        .evaluation-score {
          min-width: 90px;
          text-align: right;
        }

        .evaluation-score strong {
          display: block;
          color: #263248;
          font-size: 19px;
        }

        .evaluation-score span {
          display: block;
          margin-top: 5px;
          color: #8791a1;
          font-size: 9px;
        }

        .small-action {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 10px;
          color: #475467;
          background: white;
          border: 1px solid var(--line);
          border-radius: 6px;
          font-size: 10px;
          white-space: nowrap;
        }

        .small-action:hover {
          background: #f7f9fc;
        }

        .retention-note {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin: 18px;
          padding: 13px;
          color: #8b620f;
          background: #fff9e9;
          border: 1px solid #f5e4b4;
          border-radius: 8px;
          font-size: 11px;
          line-height: 1.7;
        }

        .retention-note svg {
          flex-shrink: 0;
          margin-top: 1px;
        }

        .control-summary {
          margin: 0 22px 12px;
          padding: 15px;
          background: #f7f9fc;
          border: 1px solid var(--line);
          border-radius: 9px;
        }

        .control-summary > div:first-child {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
          color: #687386;
          font-size: 11px;
        }

        .control-summary strong {
          color: #2459d3;
          font-size: 18px;
        }

        .control-row {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 18px 0;
          border-bottom: 1px solid #edf0f4;
        }

        .control-row:last-child {
          border-bottom: 0;
        }

        .control-id {
          padding: 4px 6px;
          color: #7b8698;
          background: #f0f2f6;
          border-radius: 5px;
          font-size: 9px;
        }

        .control-meta {
          color: #8791a1;
          font-size: 10px;
        }

        .control-actions {
          display: flex;
          align-items: flex-end;
          flex-direction: column;
          gap: 10px;
        }

        .incident-title {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .incident-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          color: #b45309;
          background: #fff0df;
          border-radius: 8px;
        }

        .incident-select {
          min-height: 32px;
          max-width: 135px;
          padding: 0 8px;
          color: #475467;
          background: white;
          border: 1px solid #dfe5ed;
          border-radius: 6px;
          font-size: 10px;
        }

        .bottom-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-top: 20px;
        }

        .info-card {
          padding: 20px;
        }

        .info-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 39px;
          height: 39px;
          margin-bottom: 15px;
          border-radius: 9px;
        }

        .blue-bg {
          color: #2856c7;
          background: #edf3ff;
        }

        .amber-bg {
          color: #ad6b0b;
          background: #fff6e5;
        }

        .green-bg {
          color: #16814a;
          background: #e9f9ef;
        }

        .info-card h3 {
          margin: 0 0 8px;
          font-size: 13px;
        }

        .info-card p {
          margin: 0;
          color: var(--muted);
          font-size: 11px;
          line-height: 1.7;
        }

        .modal-backdrop {
          position: fixed;
          z-index: 100;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow-y: auto;
          padding: 20px;
          background: #10182875;
        }

        .modal {
          width: 100%;
          max-width: 570px;
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          padding: 24px;
          background: white;
          border-radius: 14px;
          box-shadow: 0 20px 70px #10182830;
        }

        .modal-heading {
          align-items: flex-start;
          margin-bottom: 22px;
        }

        .modal form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .modal label {
          display: flex;
          flex-direction: column;
          gap: 7px;
          color: #344054;
          font-size: 11px;
          font-weight: 600;
        }

        .modal label input,
        .modal label select,
        .modal label textarea {
          box-sizing: border-box;
          width: 100%;
          padding: 11px 12px;
          color: #263248;
          background: white;
          border: 1px solid #dce2ea;
          border-radius: 8px;
          outline: none;
          font-size: 12px;
        }

        .modal label input:focus,
        .modal label select:focus,
        .modal label textarea:focus {
          border-color: #4778e8;
          box-shadow: 0 0 0 3px #4778e81a;
        }

        .modal label textarea {
          resize: vertical;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 13px;
        }

        .modal-footer {
          justify-content: flex-end;
          margin-top: 8px;
          padding-top: 17px;
          border-top: 1px solid var(--line);
        }

        .detail-status {
          justify-content: flex-start;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .detail-item {
          min-width: 0;
          padding: 13px;
          border: 1px solid var(--line);
          border-radius: 8px;
        }

        .detail-item span {
          display: block;
          margin-bottom: 7px;
          color: #8791a1;
          font-size: 10px;
        }

        .detail-item strong {
          display: block;
          overflow-wrap: anywhere;
          color: #344054;
          font-size: 12px;
        }

        .description-box {
          margin-top: 15px;
          padding: 15px;
          background: #f7f9fc;
          border-radius: 9px;
        }

        .description-box strong {
          font-size: 12px;
        }

        .description-box p {
          margin: 8px 0 0;
          color: #687386;
          font-size: 12px;
          line-height: 1.7;
        }

        .eyebrow {
          display: block;
          margin-bottom: 8px;
          color: #2459d3;
          font-size: 10px;
          font-weight: 700;
        }

        @media (max-width: 1050px) {
          .bottom-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 750px) {
          .ai-page {
            padding: 17px;
          }

          .page-header {
            flex-direction: column;
          }

          .header-actions {
            width: 100%;
            flex-wrap: wrap;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 9px;
          }

          .stat-card {
            gap: 9px;
            padding: 13px;
          }

          .stat-icon {
            width: 34px;
            height: 34px;
          }

          .stat-value {
            font-size: 22px;
          }

          .score-panel {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .score-meter {
            width: 100%;
            margin-left: 62px;
          }

          .section-heading {
            align-items: flex-start;
            padding: 17px;
          }

          .filters {
            padding: 0 17px 17px;
          }

          .search-box {
            flex-basis: 100%;
          }

          .evaluation-list,
          .controls-list {
            padding: 0 17px 17px;
          }

          .evaluation-row,
          .control-row {
            flex-wrap: wrap;
          }

          .evaluation-main,
          .control-main {
            flex-basis: calc(100% - 60px);
          }

          .evaluation-score {
            text-align: left;
          }

          .control-actions {
            align-items: flex-start;
            flex-direction: row;
            flex-wrap: wrap;
            width: 100%;
          }

          .table-footer {
            align-items: flex-start;
            flex-direction: column;
          }

          .form-row,
          .detail-grid {
            grid-template-columns: 1fr;
          }

          .modal {
            padding: 18px;
          }
        }
      `}</style>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  note,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  note: string;
  color: string;
}) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-note">{note}</div>
      </div>
    </div>
  );
}

function Tab({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
}) {
  return (
    <button
      className={`tab-button ${active ? "active" : ""}`}
      onClick={onClick}
    >
      {icon}
      {label}
      {count !== undefined && <span>{count}</span>}
      <style jsx>{`
        .tab-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 41px;
          padding: 0 13px;
          color: #667085;
          background: white;
          border: 1px solid #e6eaf0;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          cursor: pointer;
        }

        .tab-button.active {
          color: #2459d3;
          background: #edf3ff;
          border-color: #bfd0ff;
        }

        .tab-button span {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 21px;
          height: 21px;
          padding: 0 5px;
          color: #687386;
          background: #f0f2f6;
          border-radius: 5px;
          font-size: 10px;
        }
      `}</style>
    </button>
  );
}

function InfoCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="content-card info-card">
      <span className={`info-icon ${color}`}>{icon}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <style jsx>{`
        .info-card {
          padding: 20px;
          background: white;
          border: 1px solid #e6eaf0;
          border-radius: 12px;
        }

        .info-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 39px;
          height: 39px;
          margin-bottom: 15px;
          border-radius: 9px;
        }

        .blue-bg {
          color: #2856c7;
          background: #edf3ff;
        }

        .amber-bg {
          color: #ad6b0b;
          background: #fff6e5;
        }

        .green-bg {
          color: #16814a;
          background: #e9f9ef;
        }

        h3 {
          margin: 0 0 8px;
          font-size: 13px;
        }

        p {
          margin: 0;
          color: #687386;
          font-size: 11px;
          line-height: 1.7;
        }
      `}</style>
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong>{value || "Not set"}</strong>
      <style jsx>{`
        .detail-item {
          min-width: 0;
          padding: 13px;
          border: 1px solid #e6eaf0;
          border-radius: 8px;
        }

        span {
          display: block;
          margin-bottom: 7px;
          color: #8791a1;
          font-size: 10px;
        }

        strong {
          display: block;
          overflow-wrap: anywhere;
          color: #344054;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
