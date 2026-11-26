
"use client";

import { useMemo, useState } from "react";
import {
  ShieldAlert,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Search,
  Filter,
  Plus,
  Download,
  MoreHorizontal,
  X,
  Check,
  Trash2,
  CalendarDays,
  UserRound,
  ArrowUpRight,
  Target,
  ChevronRight,
} from "lucide-react";

type RiskLevel = "Critical" | "High" | "Medium" | "Low";
type RiskStatus =
  | "Open"
  | "Mitigating"
  | "Accepted"
  | "Resolved";

type Risk = {
  id: string;
  title: string;
  category: string;
  description: string;
  likelihood: number;
  impact: number;
  owner: string;
  level: RiskLevel;
  status: RiskStatus;
  dueDate: string;
};

const initialRisks: Risk[] = [
  {
    id: "RSK-001",
    title: "Unauthorized access to sensitive data",
    category: "Data Security",
    description:
      "Insufficient access restrictions could expose sensitive customer or enterprise data.",
    likelihood: 4,
    impact: 5,
    owner: "Security Team",
    level: "Critical",
    status: "Mitigating",
    dueDate: "2026-11-12",
  },
  {
    id: "RSK-002",
    title: "Third-party vendor security gaps",
    category: "Vendor Risk",
    description:
      "A supplier may not meet required security and compliance standards.",
    likelihood: 4,
    impact: 4,
    owner: "Risk Team",
    level: "High",
    status: "Open",
    dueDate: "2026-11-18",
  },
  {
    id: "RSK-003",
    title: "Incomplete incident response readiness",
    category: "Operations",
    description:
      "Response procedures and escalation paths may not be tested regularly.",
    likelihood: 3,
    impact: 4,
    owner: "Security Team",
    level: "High",
    status: "Mitigating",
    dueDate: "2026-11-20",
  },
  {
    id: "RSK-004",
    title: "Personal data retention violations",
    category: "Privacy",
    description:
      "Data may be retained beyond approved retention periods.",
    likelihood: 3,
    impact: 4,
    owner: "Compliance Team",
    level: "High",
    status: "Open",
    dueDate: "2026-11-25",
  },
  {
    id: "RSK-005",
    title: "Delayed disaster recovery",
    category: "Business Continuity",
    description:
      "Recovery processes may not meet expected recovery time objectives.",
    likelihood: 2,
    impact: 4,
    owner: "Platform Team",
    level: "Medium",
    status: "Accepted",
    dueDate: "2026-12-05",
  },
  {
    id: "RSK-006",
    title: "Insufficient employee security training",
    category: "People",
    description:
      "Employees may be unaware of phishing and secure data handling practices.",
    likelihood: 3,
    impact: 3,
    owner: "People Operations",
    level: "Medium",
    status: "Mitigating",
    dueDate: "2026-12-10",
  },
  {
    id: "RSK-007",
    title: "Unreviewed privileged accounts",
    category: "Access Management",
    description:
      "Excessive privileges may remain active after role or team changes.",
    likelihood: 2,
    impact: 3,
    owner: "IT Operations",
    level: "Medium",
    status: "Resolved",
    dueDate: "2026-10-28",
  },
  {
    id: "RSK-008",
    title: "Outdated compliance documentation",
    category: "Governance",
    description:
      "Policies and supporting records may not reflect current practices.",
    likelihood: 2,
    impact: 2,
    owner: "Compliance Team",
    level: "Low",
    status: "Open",
    dueDate: "2026-12-20",
  },
];

const riskLevels: RiskLevel[] = ["Critical", "High", "Medium", "Low"];
const riskStatuses: RiskStatus[] = [
  "Open",
  "Mitigating",
  "Accepted",
  "Resolved",
];

const riskCategories = [
  "Data Security",
  "Vendor Risk",
  "Operations",
  "Privacy",
  "Business Continuity",
  "People",
  "Access Management",
  "Governance",
  "AI Governance",
  "Model Risk",
];

const initialForm = {
  title: "",
  category: "Data Security",
  description: "",
  likelihood: "3",
  impact: "3",
  owner: "",
  status: "Open" as RiskStatus,
  dueDate: "",
};

function calculateLevel(likelihood: number, impact: number): RiskLevel {
  const score = likelihood * impact;
  if (score >= 20) return "Critical";
  if (score >= 12) return "High";
  if (score >= 6) return "Medium";
  return "Low";
}

export default function RiskAssessmentsPage() {
  const [risks, setRisks] = useState<Risk[]>(initialRisks);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("All levels");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewRisk, setViewRisk] = useState<Risk | null>(null);
  const [form, setForm] = useState(initialForm);
  const [notice, setNotice] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredRisks = useMemo(() => {
    const term = search.toLowerCase().trim();

    return risks.filter((risk) => {
      const matchesSearch =
        !term ||
        risk.id.toLowerCase().includes(term) ||
        risk.title.toLowerCase().includes(term) ||
        risk.owner.toLowerCase().includes(term) ||
        risk.category.toLowerCase().includes(term);

      return (
        matchesSearch &&
        (levelFilter === "All levels" || risk.level === levelFilter) &&
        (statusFilter === "All statuses" || risk.status === statusFilter) &&
        (categoryFilter === "All categories" ||
          risk.category === categoryFilter)
      );
    });
  }, [risks, search, levelFilter, statusFilter, categoryFilter]);

  const criticalCount = risks.filter((r) => r.level === "Critical").length;
  const highCount = risks.filter((r) => r.level === "High").length;
  const openCount = risks.filter(
    (r) => r.status === "Open" || r.status === "Mitigating"
  ).length;
  const resolvedCount = risks.filter((r) => r.status === "Resolved").length;

  const averageScore = risks.length
    ? (
        risks.reduce((sum, risk) => sum + risk.likelihood * risk.impact, 0) /
        risks.length
      ).toFixed(1)
    : "0.0";

  function notify(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  }

  function addRisk() {
    if (!form.title.trim() || !form.owner.trim()) {
      notify("Enter a risk title and owner.");
      return;
    }

    const likelihood = Number(form.likelihood);
    const impact = Number(form.impact);
    const nextNumber =
      Math.max(0, ...risks.map((r) => Number(r.id.split("-")[1]) || 0)) + 1;

    const risk: Risk = {
      id: `RSK-${String(nextNumber).padStart(3, "0")}`,
      title: form.title.trim(),
      category: form.category,
      description: form.description.trim() || "No description provided.",
      likelihood,
      impact,
      owner: form.owner.trim(),
      level: calculateLevel(likelihood, impact),
      status: form.status,
      dueDate: form.dueDate || "2026-12-31",
    };

    setRisks((current) => [risk, ...current]);
    setForm(initialForm);
    setShowModal(false);
    notify("Risk assessment created.");
  }

  function updateStatus(id: string, status: RiskStatus) {
    setRisks((current) =>
      current.map((risk) => (risk.id === id ? { ...risk, status } : risk))
    );
    setSelectedId(null);
    notify("Risk status updated.");
  }

  function deleteRisk(id: string) {
    setRisks((current) => current.filter((risk) => risk.id !== id));
    setSelectedIds((current) => current.filter((item) => item !== id));
    setSelectedId(null);
    setViewRisk(null);
    notify("Risk deleted.");
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function toggleAll() {
    const visibleIds = filteredRisks.map((risk) => risk.id);
    const allSelected =
      visibleIds.length > 0 &&
      visibleIds.every((id) => selectedIds.includes(id));

    setSelectedIds((current) =>
      allSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : Array.from(new Set([...current, ...visibleIds]))
    );
  }

  function exportCSV() {
    const data = selectedIds.length
      ? filteredRisks.filter((risk) => selectedIds.includes(risk.id))
      : filteredRisks;

    const headers = [
      "Risk ID",
      "Title",
      "Category",
      "Likelihood",
      "Impact",
      "Score",
      "Level",
      "Owner",
      "Status",
      "Due Date",
      "Description",
    ];

    const rows = data.map((risk) => [
      risk.id,
      risk.title,
      risk.category,
      risk.likelihood,
      risk.impact,
      risk.likelihood * risk.impact,
      risk.level,
      risk.owner,
      risk.status,
      risk.dueDate,
      risk.description,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-risk-assessments.csv";
    link.click();
    URL.revokeObjectURL(url);
    notify("Risk register exported.");
  }

  function formatDate(value: string) {
    return new Date(`${value}T12:00:00`).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <main className="risk-page">
      <header className="page-header">
        <div>
          <div className="breadcrumb">
            Admin <span>/</span> Compliance <span>/</span>{" "}
            <strong>Risk Assessments</strong>
          </div>
          <div className="heading-row">
            <div className="heading-icon">
              <ShieldAlert size={25} />
            </div>
            <div>
              <h1>Risk Assessments</h1>
              <p>
                Identify, score, prioritize, and track organizational
                compliance risks.
              </p>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button className="secondary-button" onClick={exportCSV}>
            <Download size={16} />
            Export CSV
          </button>
          <button
            className="primary-button"
            onClick={() => {
              setForm(initialForm);
              setShowModal(true);
            }}
          >
            <Plus size={17} />
            Add risk
          </button>
        </div>
      </header>

      {notice && (
        <div className="notice">
          <CheckCircle2 size={17} />
          {notice}
          <button onClick={() => setNotice("")} aria-label="Dismiss">
            <X size={15} />
          </button>
        </div>
      )}

      <section className="metric-grid">
        <article className="metric-card">
          <div className="metric-top">
            <span>Total risks</span>
            <div className="metric-icon blue">
              <Target size={19} />
            </div>
          </div>
          <div className="metric-value">{risks.length}</div>
          <div className="metric-note">Tracked in the risk register</div>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span>Critical risks</span>
            <div className="metric-icon red">
              <AlertTriangle size={19} />
            </div>
          </div>
          <div className="metric-value">{criticalCount}</div>
          <div className="metric-note">Require immediate attention</div>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span>Open / mitigating</span>
            <div className="metric-icon amber">
              <Clock3 size={19} />
            </div>
          </div>
          <div className="metric-value">{openCount}</div>
          <div className="metric-note">{highCount} high-level risks identified</div>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span>Average risk score</span>
            <div className="metric-icon purple">
              <Activity size={19} />
            </div>
          </div>
          <div className="metric-value">{averageScore}<small> / 25</small></div>
          <div className="metric-note">{resolvedCount} risks resolved</div>
        </article>
      </section>

      <section className="risk-banner">
        <div className="banner-icon">
          <AlertTriangle size={21} />
        </div>
        <div className="banner-copy">
          <strong>Prioritize high-impact risks</strong>
          <p>
            Review critical and high risks, confirm accountable owners, and
            document mitigation actions.
          </p>
        </div>
        <button
          className="text-button"
          onClick={() => setLevelFilter("Critical")}
        >
          View critical <ChevronRight size={15} />
        </button>
      </section>

      <section className="table-card">
        <div className="table-heading">
          <div>
            <h2>Risk register</h2>
            <p>Review risk scores, ownership, treatment status, and due dates.</p>
          </div>
          <span className="count-pill">{filteredRisks.length} risks</span>
        </div>

        <div className="filter-bar">
          <div className="search-box">
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search risks, owners, categories..."
            />
            {search && (
              <button onClick={() => setSearch("")} aria-label="Clear search">
                <X size={15} />
              </button>
            )}
          </div>

          <label className="filter-select">
            <Filter size={15} />
            <select
              value={levelFilter}
              onChange={(event) => setLevelFilter(event.target.value)}
            >
              <option>All levels</option>
              {riskLevels.map((level) => (
                <option key={level}>{level}</option>
              ))}
            </select>
          </label>

          <label className="filter-select">
            <Activity size={15} />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>All statuses</option>
              {riskStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>

          <label className="filter-select">
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option>All categories</option>
              {riskCategories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
        </div>

        {selectedIds.length > 0 && (
          <div className="bulk-bar">
            <span>{selectedIds.length} selected</span>
            <button onClick={exportCSV}>
              <Download size={15} /> Export selected
            </button>
            <button onClick={() => setSelectedIds([])}>Clear selection</button>
          </div>
        )}

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th className="check-cell">
                  <input
                    type="checkbox"
                    aria-label="Select all visible risks"
                    checked={
                      filteredRisks.length > 0 &&
                      filteredRisks.every((r) => selectedIds.includes(r.id))
                    }
                    onChange={toggleAll}
                  />
                </th>
                <th>RISK</th>
                <th>CATEGORY</th>
                <th>SCORE</th>
                <th>LEVEL</th>
                <th>OWNER</th>
                <th>STATUS</th>
                <th>DUE DATE</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredRisks.map((risk) => (
                <tr key={risk.id}>
                  <td className="check-cell">
                    <input
                      type="checkbox"
                      aria-label={`Select ${risk.id}`}
                      checked={selectedIds.includes(risk.id)}
                      onChange={() => toggleSelected(risk.id)}
                    />
                  </td>
                  <td>
                    <button
                      className="risk-name-button"
                      onClick={() => setViewRisk(risk)}
                    >
                      <span className="risk-title">{risk.title}</span>
                      <small>{risk.id}</small>
                    </button>
                  </td>
                  <td>
                    <span className="category-tag">{risk.category}</span>
                  </td>
                  <td>
                    <div className="score-cell">
                      <strong>{risk.likelihood * risk.impact}</strong>
                      <span>/ 25</span>
                    </div>
                    <div className="score-track">
                      <div
                        className={`score-fill ${risk.level.toLowerCase()}`}
                        style={{
                          width: `${(risk.likelihood * risk.impact) * 4}%`,
                        }}
                      />
                    </div>
                  </td>
                  <td>
                    <RiskLevelBadge level={risk.level} />
                  </td>
                  <td>
                    <div className="owner-cell">
                      <span className="owner-avatar">
                        <UserRound size={14} />
                      </span>
                      {risk.owner}
                    </div>
                  </td>
                  <td>
                    <RiskStatusBadge status={risk.status} />
                  </td>
                  <td>
                    <span
                      className={`date-cell ${
                        risk.status !== "Resolved" &&
                        risk.dueDate < "2026-11-04"
                          ? "overdue"
                          : ""
                      }`}
                    >
                      <CalendarDays size={14} />
                      {formatDate(risk.dueDate)}
                    </span>
                  </td>
                  <td className="action-cell">
                    <div className="action-wrap">
                      <button
                        className="icon-button"
                        aria-label={`Actions for ${risk.id}`}
                        onClick={() =>
                          setSelectedId(
                            selectedId === risk.id ? null : risk.id
                          )
                        }
                      >
                        <MoreHorizontal size={19} />
                      </button>

                      {selectedId === risk.id && (
                        <div className="action-menu">
                          <button
                            onClick={() => {
                              setViewRisk(risk);
                              setSelectedId(null);
                            }}
                          >
                            <Target size={14} /> View assessment
                          </button>
                          <div className="menu-heading">Update status</div>
                          {riskStatuses.map((status) => (
                            <button
                              key={status}
                              onClick={() => updateStatus(risk.id, status)}
                            >
                              {risk.status === status ? (
                                <Check size={14} />
                              ) : (
                                <span className="menu-spacer" />
                              )}
                              {status}
                            </button>
                          ))}
                          <div className="menu-divider" />
                          <button
                            className="delete-action"
                            onClick={() => deleteRisk(risk.id)}
                          >
                            <Trash2 size={14} /> Delete risk
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredRisks.length === 0 && (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state">
                      <ShieldAlert size={29} />
                      <strong>No risks found</strong>
                      <p>Change the filters or add a risk assessment.</p>
                      <button
                        className="primary-button"
                        onClick={() => setShowModal(true)}
                      >
                        <Plus size={15} /> Add risk
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>
            Showing {filteredRisks.length} of {risks.length} risks
          </span>
          <span className="demo-label">
            <Clock3 size={14} /> Frontend demo data
          </span>
        </div>
      </section>

      <section className="bottom-grid">
        <article className="info-card">
          <div className="info-icon red">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h3>Risk treatment</h3>
            <p>
              Assign accountable owners and track actions to reduce likelihood
              or impact.
            </p>
            <button
              className="text-button"
              onClick={() => setStatusFilter("Mitigating")}
            >
              View mitigating risks <ChevronRight size={14} />
            </button>
          </div>
        </article>

        <article className="info-card">
          <div className="info-icon green">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h3>Risk closure</h3>
            <p>
              Keep decisions and evidence available when risks are resolved or
              formally accepted.
            </p>
            <button
              className="text-button"
              onClick={() => setStatusFilter("Resolved")}
            >
              View resolved risks <ChevronRight size={14} />
            </button>
          </div>
        </article>
      </section>

      {showModal && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowModal(false);
          }}
        >
          <div className="modal" role="dialog" aria-modal="true">
            <div className="modal-header">
              <div>
                <div className="modal-icon">
                  <ShieldAlert size={21} />
                </div>
                <h2>Create risk assessment</h2>
                <p>Describe a risk and calculate its initial score.</p>
              </div>
              <button
                className="icon-button"
                onClick={() => setShowModal(false)}
                aria-label="Close modal"
              >
                <X size={19} />
              </button>
            </div>

            <div className="form-content">
              <label>
                Risk title <span>*</span>
                <input
                  autoFocus
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  placeholder="e.g. Unauthorized data access"
                />
              </label>

              <label>
                Description
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Describe the risk, cause, and possible impact."
                />
              </label>

              <div className="form-row">
                <label>
                  Category
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value })
                    }
                  >
                    {riskCategories.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Risk owner <span>*</span>
                  <input
                    value={form.owner}
                    onChange={(event) =>
                      setForm({ ...form, owner: event.target.value })
                    }
                    placeholder="Responsible team"
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Likelihood (1–5)
                  <select
                    value={form.likelihood}
                    onChange={(event) =>
                      setForm({ ...form, likelihood: event.target.value })
                    }
                  >
                    <option value="1">1 — Rare</option>
                    <option value="2">2 — Unlikely</option>
                    <option value="3">3 — Possible</option>
                    <option value="4">4 — Likely</option>
                    <option value="5">5 — Almost certain</option>
                  </select>
                </label>

                <label>
                  Impact (1–5)
                  <select
                    value={form.impact}
                    onChange={(event) =>
                      setForm({ ...form, impact: event.target.value })
                    }
                  >
                    <option value="1">1 — Negligible</option>
                    <option value="2">2 — Minor</option>
                    <option value="3">3 — Moderate</option>
                    <option value="4">4 — Major</option>
                    <option value="5">5 — Severe</option>
                  </select>
                </label>
              </div>

              <div className="score-preview">
                <div>
                  <span>Calculated risk score</span>
                  <strong>
                    {Number(form.likelihood) * Number(form.impact)} / 25
                  </strong>
                </div>
                <RiskLevelBadge
                  level={calculateLevel(
                    Number(form.likelihood),
                    Number(form.impact)
                  )}
                />
              </div>

              <div className="form-row">
                <label>
                  Initial status
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        status: event.target.value as RiskStatus,
                      })
                    }
                  >
                    {riskStatuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Target due date
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(event) =>
                      setForm({ ...form, dueDate: event.target.value })
                    }
                  />
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="secondary-button"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button className="primary-button" onClick={addRisk}>
                <Plus size={16} /> Create assessment
              </button>
            </div>
          </div>
        </div>
      )}

      {viewRisk && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setViewRisk(null);
          }}
        >
          <div className="modal details-modal" role="dialog" aria-modal="true">
            <div className="modal-header">
              <div>
                <div className="modal-icon">
                  <ShieldAlert size={21} />
                </div>
                <h2>{viewRisk.title}</h2>
                <p>{viewRisk.id} · {viewRisk.category}</p>
              </div>
              <button
                className="icon-button"
                onClick={() => setViewRisk(null)}
                aria-label="Close details"
              >
                <X size={19} />
              </button>
            </div>

            <div className="details-content">
              <div className="detail-row">
                <span>Risk level</span>
                <RiskLevelBadge level={viewRisk.level} />
              </div>
              <div className="detail-row">
                <span>Risk score</span>
                <strong>
                  {viewRisk.likelihood * viewRisk.impact} / 25
                </strong>
              </div>
              <div className="detail-row">
                <span>Likelihood</span>
                <strong>{viewRisk.likelihood} / 5</strong>
              </div>
              <div className="detail-row">
                <span>Impact</span>
                <strong>{viewRisk.impact} / 5</strong>
              </div>
              <div className="detail-row">
                <span>Owner</span>
                <strong>{viewRisk.owner}</strong>
              </div>
              <div className="detail-row">
                <span>Status</span>
                <RiskStatusBadge status={viewRisk.status} />
              </div>
              <div className="detail-row">
                <span>Due date</span>
                <strong>{formatDate(viewRisk.dueDate)}</strong>
              </div>
              <div className="description-block">
                <span>Description</span>
                <p>{viewRisk.description}</p>
              </div>
              <p className="demo-note">
                This is a frontend risk record. Mitigation plans, approvals,
                evidence, and audit history require backend integration.
              </p>
            </div>

            <div className="modal-footer">
              <button
                className="secondary-button"
                onClick={() => setViewRisk(null)}
              >
                Close
              </button>
              <button
                className="primary-button"
                onClick={() => {
                  setViewRisk(null);
                  setSelectedId(viewRisk.id);
                }}
              >
                <MoreHorizontal size={16} /> Risk actions
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .risk-page {
          min-height: 100vh;
          padding: 30px;
          background: #f7f8fc;
          color: #172033;
          font-family: Arial, Helvetica, sans-serif;
        }

        .page-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 26px;
        }

        .breadcrumb {
          margin-bottom: 18px;
          color: #8790a3;
          font-size: 12px;
        }

        .breadcrumb span {
          margin: 0 8px;
          color: #c1c7d2;
        }

        .breadcrumb strong {
          color: #49546a;
          font-weight: 600;
        }

        .heading-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .heading-icon {
          display: grid;
          place-items: center;
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          border: 1px solid #ffdcd5;
          border-radius: 13px;
          background: #fff0ed;
          color: #d44c3d;
        }

        h1 {
          margin: 0;
          font-size: 27px;
          letter-spacing: -0.7px;
          font-weight: 750;
        }

        .heading-row p {
          margin: 7px 0 0;
          color: #7b8498;
          font-size: 13px;
        }

        .header-actions {
          display: flex;
          gap: 10px;
          flex-shrink: 0;
        }

        button {
          font: inherit;
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
          font-weight: 650;
        }

        .primary-button {
          border: 1px solid #315fe8;
          background: #315fe8;
          color: white;
        }

        .primary-button:hover {
          background: #244bc4;
        }

        .secondary-button {
          border: 1px solid #dfe3eb;
          background: white;
          color: #39445a;
        }

        .secondary-button:hover {
          background: #f3f5f9;
        }

        .notice {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 18px;
          padding: 12px 15px;
          border: 1px solid #b9e8ce;
          border-radius: 9px;
          background: #effbf4;
          color: #197344;
          font-size: 13px;
        }

        .notice button {
          display: grid;
          place-items: center;
          margin-left: auto;
          border: 0;
          background: transparent;
          color: inherit;
        }

        .metric-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 19px;
        }

        .metric-card {
          min-width: 0;
          padding: 19px;
          border: 1px solid #e7eaf1;
          border-radius: 12px;
          background: white;
          box-shadow: 0 2px 5px #18234405;
        }

        .metric-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          color: #737e92;
          font-size: 12px;
        }

        .metric-icon,
        .info-icon {
          display: grid;
          place-items: center;
          width: 37px;
          height: 37px;
          flex-shrink: 0;
          border-radius: 10px;
        }

        .blue {
          background: #edf2ff;
          color: #315fe8;
        }

        .red {
          background: #fff0ed;
          color: #d34b39;
        }

        .amber {
          background: #fff4df;
          color: #ad740d;
        }

        .purple {
          background: #f2edff;
          color: #7651ce;
        }

        .green {
          background: #e9f9ef;
          color: #16834b;
        }

        .metric-value {
          margin-top: 15px;
          font-size: 29px;
          font-weight: 750;
          letter-spacing: -0.8px;
        }

        .metric-value small {
          color: #929bad;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0;
        }

        .metric-note {
          margin-top: 7px;
          color: #929bad;
          font-size: 11px;
          line-height: 1.5;
        }

        .risk-banner {
          display: flex;
          align-items: center;
          gap: 13px;
          margin-bottom: 21px;
          padding: 15px 17px;
          border: 1px solid #f1dfb7;
          border-radius: 11px;
          background: #fffaf0;
        }

        .banner-icon {
          display: grid;
          place-items: center;
          width: 39px;
          height: 39px;
          flex-shrink: 0;
          border-radius: 10px;
          background: #fff0cf;
          color: #a96b0b;
        }

        .banner-copy {
          min-width: 0;
        }

        .banner-copy strong {
          color: #6f4a0b;
          font-size: 13px;
        }

        .banner-copy p {
          margin: 5px 0 0;
          color: #92784b;
          font-size: 12px;
          line-height: 1.5;
        }

        .text-button {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 0;
          border: 0;
          background: transparent;
          color: #315fe8;
          font-size: 12px;
          font-weight: 650;
          white-space: nowrap;
        }

        .risk-banner > .text-button {
          margin-left: auto;
        }

        .table-card {
          overflow: visible;
          border: 1px solid #e7eaf1;
          border-radius: 12px;
          background: white;
          box-shadow: 0 2px 5px #18234405;
        }

        .table-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 21px 21px 17px;
        }

        .table-heading h2 {
          margin: 0;
          font-size: 16px;
          font-weight: 720;
        }

        .table-heading p {
          margin: 6px 0 0;
          color: #8a93a5;
          font-size: 12px;
        }

        .count-pill {
          padding: 6px 10px;
          border: 1px solid #e7eaf1;
          border-radius: 7px;
          color: #657086;
          font-size: 11px;
          white-space: nowrap;
        }

        .filter-bar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
          padding: 0 21px 17px;
        }

        .search-box,
        .filter-select {
          display: flex;
          align-items: center;
          gap: 8px;
          height: 37px;
          padding: 0 11px;
          border: 1px solid #e2e6ee;
          border-radius: 8px;
          background: white;
          color: #8791a4;
        }

        .search-box {
          flex: 1 1 230px;
          min-width: 180px;
        }

        .search-box input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          color: #263147;
          font-size: 12px;
        }

        .search-box input::placeholder {
          color: #a2aaba;
        }

        .search-box button {
          display: grid;
          place-items: center;
          border: 0;
          background: transparent;
          color: #8791a4;
        }

        .filter-select {
          flex: 0 0 auto;
        }

        .filter-select select {
          max-width: 145px;
          border: 0;
          outline: 0;
          background: transparent;
          color: #59647a;
          font-size: 12px;
          cursor: pointer;
        }

        .bulk-bar {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 10px 21px;
          border-top: 1px solid #e7eaf1;
          background: #f4f7ff;
          color: #344b89;
          font-size: 12px;
        }

        .bulk-bar button {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border: 0;
          background: transparent;
          color: #315fe8;
          font-size: 12px;
          font-weight: 600;
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

        thead {
          background: #f8f9fc;
        }

        th {
          padding: 12px 13px;
          border-top: 1px solid #eef0f5;
          border-bottom: 1px solid #e9ecf2;
          color: #8b94a7;
          font-size: 9px;
          font-weight: 750;
          letter-spacing: 0.65px;
        }

        td {
          position: relative;
          padding: 14px 13px;
          border-bottom: 1px solid #eff1f5;
          color: #4c576c;
          font-size: 11px;
          vertical-align: middle;
        }

        tbody tr:last-child td {
          border-bottom: 0;
        }

        tbody tr:hover {
          background: #fbfcff;
        }

        .check-cell {
          width: 37px;
          padding-left: 20px;
          padding-right: 0;
        }

        input[type="checkbox"] {
          width: 14px;
          height: 14px;
          margin: 0;
          accent-color: #315fe8;
          cursor: pointer;
        }

        .risk-name-button {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 5px;
          max-width: 245px;
          padding: 0;
          border: 0;
          background: transparent;
          text-align: left;
        }

        .risk-title {
          overflow: hidden;
          color: #253047;
          font-size: 11px;
          font-weight: 650;
          text-overflow: ellipsis;
        }

        .risk-name-button small {
          color: #9aa2b2;
          font-size: 10px;
        }

        .category-tag {
          display: inline-block;
          padding: 5px 7px;
          border: 1px solid #e7eaf1;
          border-radius: 5px;
          background: #fafbfe;
          color: #667188;
          font-size: 10px;
        }

        .score-cell {
          display: flex;
          align-items: baseline;
          gap: 3px;
        }

        .score-cell strong {
          color: #354057;
          font-size: 12px;
        }

        .score-cell span {
          color: #a0a8b7;
          font-size: 10px;
        }

        .score-track {
          width: 60px;
          height: 4px;
          overflow: hidden;
          margin-top: 7px;
          border-radius: 20px;
          background: #edf0f5;
        }

        .score-fill {
          height: 100%;
          border-radius: inherit;
        }

        .score-fill.critical {
          background: #d94343;
        }

        .score-fill.high {
          background: #e98539;
        }

        .score-fill.medium {
          background: #e2ad36;
        }

        .score-fill.low {
          background: #269b65;
        }

        .owner-cell {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #59647a;
        }

        .owner-avatar {
          display: grid;
          place-items: center;
          width: 25px;
          height: 25px;
          flex-shrink: 0;
          border-radius: 7px;
          background: #edf2ff;
          color: #315fe8;
        }

        .date-cell {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #7b8598;
          font-size: 10px;
        }

        .date-cell.overdue {
          color: #d04435;
          font-weight: 650;
        }

        .action-cell {
          width: 43px;
          padding-right: 16px;
        }

        .action-wrap {
          position: relative;
          display: flex;
          justify-content: flex-end;
        }

        .icon-button {
          display: grid;
          place-items: center;
          width: 32px;
          height: 32px;
          border: 1px solid transparent;
          border-radius: 7px;
          background: transparent;
          color: #788297;
        }

        .icon-button:hover {
          border-color: #e4e8f0;
          background: #f7f8fc;
        }

        .action-menu {
          position: absolute;
          z-index: 20;
          top: 35px;
          right: 0;
          width: 190px;
          padding: 6px;
          border: 1px solid #e4e8f0;
          border-radius: 9px;
          background: white;
          box-shadow: 0 10px 30px #1924401a;
        }

        .action-menu button {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 9px;
          border: 0;
          border-radius: 5px;
          background: transparent;
          color: #4d5870;
          text-align: left;
          font-size: 11px;
        }

        .action-menu button:hover {
          background: #f3f5fa;
        }

        .menu-heading {
          padding: 8px 9px;
          color: #929bad;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .menu-spacer {
          width: 14px;
          flex-shrink: 0;
        }

        .menu-divider {
          height: 1px;
          margin: 5px 0;
          background: #eceef3;
        }

        .action-menu .delete-action {
          color: #d43f3f;
        }

        .table-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 21px;
          border-top: 1px solid #edf0f5;
          color: #939bad;
          font-size: 10px;
        }

        .demo-label {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .empty-state {
          display: flex;
          align-items: center;
          flex-direction: column;
          gap: 10px;
          padding: 40px 15px;
          color: #8893a7;
          text-align: center;
          white-space: normal;
        }

        .empty-state strong {
          color: #37435a;
          font-size: 14px;
        }

        .empty-state p {
          margin: 0 0 6px;
          font-size: 12px;
        }

        .bottom-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
          margin-top: 20px;
        }

        .info-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 20px;
          border: 1px solid #e7eaf1;
          border-radius: 12px;
          background: white;
        }

        .info-icon {
          width: 40px;
          height: 40px;
        }

        .info-card h3 {
          margin: 2px 0 8px;
          color: #28334a;
          font-size: 13px;
        }

        .info-card p {
          max-width: 380px;
          margin: 0 0 9px;
          color: #858fa2;
          font-size: 11px;
          line-height: 1.7;
        }

        .modal-overlay {
          position: fixed;
          z-index: 100;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: #11182770;
          backdrop-filter: blur(3px);
        }

        .modal {
          width: 100%;
          max-width: 570px;
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          border: 1px solid #e5e8ef;
          border-radius: 15px;
          background: white;
          box-shadow: 0 24px 70px #10182e30;
        }

        .details-modal {
          max-width: 550px;
        }

        .modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          padding: 24px 24px 19px;
          border-bottom: 1px solid #edf0f5;
        }

        .modal-icon {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          margin-bottom: 13px;
          border-radius: 11px;
          background: #fff0ed;
          color: #d44c3d;
        }

        .modal-header h2 {
          margin: 0;
          color: #202b41;
          font-size: 19px;
        }

        .modal-header p {
          margin: 7px 0 0;
          color: #8b94a6;
          font-size: 12px;
          line-height: 1.6;
        }

        .form-content {
          display: flex;
          flex-direction: column;
          gap: 17px;
          padding: 22px 24px;
        }

        .form-content label {
          display: flex;
          flex-direction: column;
          gap: 8px;
          color: #455067;
          font-size: 12px;
          font-weight: 650;
        }

        .form-content label span {
          display: inline;
          color: #d94444;
        }

        .form-content input,
        .form-content select,
        .form-content textarea {
          width: 100%;
          padding: 0 11px;
          border: 1px solid #dfe4ed;
          border-radius: 7px;
          outline: none;
          background: white;
          color: #354158;
          font: inherit;
          font-size: 12px;
        }

        .form-content input,
        .form-content select {
          height: 40px;
        }

        .form-content textarea {
          padding-top: 10px;
          resize: vertical;
        }

        .form-content input:focus,
        .form-content select:focus,
        .form-content textarea:focus {
          border-color: #7190f5;
          box-shadow: 0 0 0 3px #315fe817;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 13px;
        }

        .score-preview {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 13px;
          border: 1px solid #e7eaf1;
          border-radius: 9px;
          background: #f8f9fc;
        }

        .score-preview > div {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .score-preview > div span {
          color: #8993a6;
          font-size: 11px;
        }

        .score-preview > div strong {
          color: #263147;
          font-size: 21px;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 16px 24px;
          border-top: 1px solid #edf0f5;
          background: #fbfcfe;
        }

        .details-content {
          display: flex;
          flex-direction: column;
          padding: 12px 24px 20px;
        }

        .detail-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 13px 0;
          border-bottom: 1px solid #edf0f5;
          font-size: 12px;
        }

        .detail-row > span {
          color: #8b94a6;
        }

        .detail-row strong {
          color: #3d4960;
          font-weight: 600;
          text-align: right;
        }

        .description-block {
          padding-top: 17px;
          color: #8b94a6;
          font-size: 12px;
        }

        .description-block p {
          margin: 8px 0 0;
          color: #4c576c;
          font-size: 12px;
          line-height: 1.7;
        }

        .demo-note {
          margin: 18px 0 0;
          padding: 11px 12px;
          border: 1px solid #e5eaff;
          border-radius: 7px;
          background: #f5f7ff;
          color: #6878a1;
          font-size: 11px;
          line-height: 1.6;
        }

        @media (max-width: 1100px) {
          .risk-page {
            padding: 22px;
          }

          .metric-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .page-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .header-actions {
            align-self: flex-end;
          }
        }

        @media (max-width: 650px) {
          .risk-page {
            padding: 15px;
          }

          h1 {
            font-size: 22px;
          }

          .heading-row {
            align-items: flex-start;
          }

          .heading-icon {
            width: 42px;
            height: 42px;
          }

          .metric-grid {
            gap: 10px;
          }

          .metric-card {
            padding: 14px;
          }

          .metric-value {
            font-size: 25px;
          }

          .metric-top {
            font-size: 11px;
          }

          .metric-icon {
            width: 31px;
            height: 31px;
          }

          .risk-banner {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .risk-banner > .text-button {
            margin-left: 52px;
          }

          .filter-bar {
            padding: 0 14px 14px;
          }

          .search-box {
            flex-basis: 100%;
          }

          .filter-select {
            flex: 1 1 auto;
          }

          .filter-select select {
            width: 100%;
            max-width: 100%;
          }

          .table-heading {
            padding: 17px 14px;
          }

          .table-footer {
            padding: 13px 14px;
          }

          .bottom-grid {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .modal-header,
          .form-content,
          .modal-footer {
            padding-left: 17px;
            padding-right: 17px;
          }

          .details-content {
            padding-right: 17px;
            padding-left: 17px;
          }
        }
      `}</style>
    </main>
  );
}

function RiskLevelBadge({ level }: { level: RiskLevel }) {
  return (
    <>
      <span className={`level-badge ${level.toLowerCase()}`}>
        <span className="level-dot" />
        {level}
      </span>
      <style jsx>{`
        .level-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 650;
        }

        .level-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .critical {
          background: #fff0ed;
          color: #d04435;
        }

        .high {
          background: #fff1e7;
          color: #d36b20;
        }

        .medium {
          background: #fff6dc;
          color: #a7790c;
        }

        .low {
          background: #eaf8ef;
          color: #16834b;
        }
      `}</style>
    </>
  );
}

function RiskStatusBadge({ status }: { status: RiskStatus }) {
  const className =
    status === "Open"
      ? "open"
      : status === "Mitigating"
        ? "mitigating"
        : status === "Accepted"
          ? "accepted"
          : "resolved";

  return (
    <>
      <span className={`status-badge ${className}`}>
        <span className="status-dot" />
        {status}
      </span>
      <style jsx>{`
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
          border-radius: 50%;
          background: currentColor;
        }

        .open {
          background: #fff0ed;
          color: #d04435;
        }

        .mitigating {
          background: #fff5df;
          color: #a46a08;
        }

        .accepted {
          background: #edf2ff;
          color: #315fe8;
        }

        .resolved {
          background: #eaf8ef;
          color: #16834b;
        }
      `}</style>
    </>
  );
}
